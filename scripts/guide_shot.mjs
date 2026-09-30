// Guide captures without DevTools (2026-09-30): DevTools' Capture screenshot re-applies the device metrics for the
// capture and a page that scrolls at the document level springs back to the top (the user: "⌘⇧P → Capture
// screenshot; this is what I am doing but it's scrolling to the top of the page"). This attaches to a Chrome of its
// own — a persistent profile, so the wallets are installed and signed in once — sets the frame on a tab once, and
// captures the viewport exactly as it stands: nothing is re-applied at capture time, so nothing moves.
//
//   node --experimental-websocket scripts/guide_shot.mjs open [url]     launch the Guides Chrome (or add a tab to it) and list its tabs
//   node --experimental-websocket scripts/guide_shot.mjs tabs           list the tabs: index, title, address
//   node --experimental-websocket scripts/guide_shot.mjs hold <tab> dashboard|wallet
//        sets the frame on that tab — 1400×788 @2 or 360×788 @2 — and keeps it while it runs. Scroll and click in the
//        window as you like; in the terminal type a name and Enter to capture the viewport as it stands
//        (→ ~/Desktop/guide-shots/<name>.png, 2800 × 1576 or 720 × 1576), Enter alone for the next number, q to stop.
//        The frame goes with the session, which is why it is one command: a device override lives only while the
//        debugging session is open, and nothing is re-applied at capture time, so nothing moves.
//
// <tab> is the index from `tabs`, or a word from the tab's title or address. The frames are the recipe's
// (notion/guide-screenshots.md). Every capture prints the page's scroll before and after, so a moved page would show.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = join(homedir(), "Library", "Application Support", "Encapsulate Guides");   // its own: Chrome 136+ refuses remote debugging on the default profile
const OUT = join(homedir(), "Desktop", "guide-shots");
const FRAMES = { dashboard: { width: 1400, height: 788 }, wallet: { width: 360, height: 788 } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const [cmd, a, b] = process.argv.slice(2);

async function port() {
  try {
    const p = +readFileSync(join(PROFILE, "DevToolsActivePort"), "utf8").split("\n")[0];
    await fetch(`http://127.0.0.1:${p}/json/version`);
    return p;
  } catch { return null; }
}

async function launch(url) {
  let p = await port();
  if (p) { if (url) await fetch(`http://127.0.0.1:${p}/json/new?${encodeURIComponent(url)}`, { method: "PUT" }); return p; }
  mkdirSync(PROFILE, { recursive: true });
  spawn(CHROME, ["--remote-debugging-port=0", `--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check", url || "about:blank"], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 100 && !p; i++) { await sleep(200); p = await port(); }
  if (!p) throw new Error("Chrome did not open its debugging port");
  return p;
}

async function tabs(p) {
  const list = await (await fetch(`http://127.0.0.1:${p}/json/list`)).json();
  return list.filter(t => t.type === "page" && !t.url.startsWith("devtools://"));
}

function pick(list, key) {
  if (/^\d+$/.test(key)) { const t = list[+key]; if (!t) throw new Error(`no tab ${key}`); return t; }
  const k = key.toLowerCase();
  const t = list.find(t => (t.title || "").toLowerCase().includes(k) || t.url.toLowerCase().includes(k));
  if (!t) throw new Error(`no tab whose title or address has "${key}"`);
  return t;
}

async function session(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const waiting = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); const w = waiting.get(d.id); if (w) { waiting.delete(d.id); d.error ? w.j(new Error(d.error.message)) : w.r(d.result); } };
  const send = (method, params = {}) => new Promise((r, j) => { waiting.set(++id, { r, j }); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value;
  return { send, ev, close: () => ws.close() };
}

const scroll = (s) => s.ev("(() => { const e = document.scrollingElement; return { x: e.scrollLeft, y: e.scrollTop, w: innerWidth, h: innerHeight, dpr: devicePixelRatio }; })()");

async function main() {
  if (!cmd || !["open", "tabs", "hold"].includes(cmd)) {
    console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").filter(l => l.startsWith("//")).map(l => l.slice(3)).join("\n"));
    return;
  }
  const p = cmd === "open" ? await launch(a) : await port();
  if (!p) throw new Error("the Guides Chrome is not open — `guide_shot.mjs open` first");
  const list = await tabs(p);
  if (cmd === "open" || cmd === "tabs") {
    for (const [i, t] of list.entries()) console.log(`${i}  ${(t.title || "").slice(0, 48).padEnd(48)}  ${t.url.slice(0, 70)}`);
    if (!list.length) console.log("no tabs");
    return;
  }
  const f = FRAMES[b]; if (!f) throw new Error("hold <tab> dashboard|wallet");
  const target = pick(list, a);
  const s = await session(target);
  await s.send("Emulation.setDeviceMetricsOverride", { ...f, deviceScaleFactor: 2, mobile: false });
  await sleep(300);
  const v = await scroll(s);
  mkdirSync(OUT, { recursive: true });
  console.log(`${(target.title || target.url).slice(0, 60)}: ${v.w}×${v.h} @${v.dpr} — held. Scroll in the window; type a name and Enter to capture, Enter for the next number, q to stop.`);
  let n = 1;
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });
  rl.prompt();
  rl.on("line", async (line) => {
    const name = line.trim();
    if (name === "q") { rl.close(); return; }
    try {
      const before = await scroll(s);
      // the viewport as it stands: no clip, nothing beyond the viewport, nothing re-applied
      const shot = await s.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
      const file = join(OUT, (name || String(n).padStart(2, "0")).replace(/\.png$/i, "") + ".png");
      writeFileSync(file, Buffer.from(shot.data, "base64"));
      const after = await scroll(s);
      const png = readFileSync(file);
      console.log(`${file}  ${png.readUInt32BE(16)} × ${png.readUInt32BE(20)}  (scroll ${before.y} → ${after.y}${before.y === after.y ? "" : " — MOVED"})`);
      n++;
    } catch (e) { console.log("failed: " + (e.message || e)); }
    rl.prompt();
  });
  rl.on("close", async () => { try { await s.send("Emulation.clearDeviceMetricsOverride"); } catch {} s.close(); process.exit(0); });
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
