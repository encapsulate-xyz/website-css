// Record every frame Chrome paints while a page arrives, to catch raw Notion before a script builds
// it (2026-10-25: /blog and the posts showed Super's raw blocks for 200–280ms; this is how the rest of
// the site was audited for the same).
//
//   node --experimental-websocket scripts/flashcheck.mjs cold <url> <out-dir> [tags]
//   node --experimental-websocket scripts/flashcheck.mjs nav <from-url> <to-path> <out-dir> [tags]
//
// `cold` loads <url> fresh; `nav` loads <from-url>, lets it settle, then goes to <to-path> through
// Super's own router (`next.router.push`), as a click on one of its links does. Chrome's screencast
// sends a frame each time the page paints, so a flash cannot fall between two screenshots. Each frame
// is written to <out-dir> as <ms since the start>.jpg, with frames.json beside it; then
// `scripts/flashsheet.py <out-dir>` lays the distinct frames out on one sheet. [tags] works as in
// livecheck.mjs: those tags' files are served from this repo, so a fix is checked before release.
// W and H set the viewport (default 1440×900), REC the recording's length in ms (default 4000).
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [mode, ...rest] = process.argv.slice(2);
const nav = mode === "nav";
const [from, to, out, tag] = nav ? rest : [null, rest[0], rest[1], rest[2]];
if (!["cold", "nav"].includes(mode) || !to || !out) {
  console.error("usage: flashcheck.mjs cold <url> <out-dir> [tags] | nav <from-url> <to-path> <out-dir> [tags]");
  process.exit(2);
}
const TAGS = (tag || "").split(",").filter(Boolean);
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const W = +(process.env.W || 1440), H = +(process.env.H || 900), REC = +(process.env.REC || 4000);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--remote-debugging-port=0",
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target, port = 0;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try {
    if (!port) port = +readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0];
    if (port) target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === "page");
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let id = 0; const pending = {};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const TYPES = { js: "application/javascript", css: "text/css", png: "image/png", svg: "image/svg+xml", mp4: "video/mp4" };

let t0 = 0, recording = false;
const frames = [];
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  if (m.method === "Page.screencastFrame") {
    send("Page.screencastFrameAck", { sessionId: m.params.sessionId });
    if (!recording) return;
    const ms = Math.round(m.params.metadata.timestamp * 1000 - t0);
    const name = String(Math.max(0, ms)).padStart(5, "0") + ".jpg";
    writeFileSync(join(out, name), Buffer.from(m.params.data, "base64"));
    frames.push({ ms, file: name });
  }
  if (m.method !== "Fetch.requestPaused") return;
  const u = m.params.request.url, hit = TAGS.find(t => u.includes("website-css@" + t + "/"));
  const file = hit && join(REPO, u.split("website-css@" + hit + "/")[1].split("?")[0]);
  if (file && existsSync(file)) {
    send("Fetch.fulfillRequest", { requestId: m.params.requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: TYPES[file.split(".").pop()] || "application/octet-stream" }, { name: "Access-Control-Allow-Origin", value: "*" }],
      body: readFileSync(file).toString("base64") });
  } else send("Fetch.continueRequest", { requestId: m.params.requestId });
});
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 700 });
if (TAGS.length) await send("Fetch.enable", { patterns: TAGS.map(t => ({ urlPattern: "*website-css@" + t + "/*" })) });
await send("Page.enable");
const bust = u => u + (u.includes("?") ? "&" : "?") + "fc=" + Date.now();
await send("Page.startScreencast", { format: "jpeg", quality: 70, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
if (nav) {
  await send("Page.navigate", { url: bust(from) });
  await sleep(+(process.env.WAIT || 8000));
  t0 = Date.now(); recording = true;
  // the mark survives an in-app navigation and is gone after a full reload
  const ok = await evaluate(`(() => { const r = window.next && window.next.router; if (!r || !r.push) return false; window.__flashMark = 1; r.push(${JSON.stringify(to)}); return true; })()`);
  if (!ok) console.error("no router on", from);
} else {
  t0 = Date.now(); recording = true;
  await send("Page.navigate", { url: bust(to) });
}
await sleep(REC);
recording = false;
/* the screencast sends nothing while the page is still, so the settled page is captured once more at
   the end: the sheet compares every frame with it */
const end = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
writeFileSync(join(out, "end.jpg"), Buffer.from(end.result.data, "base64"));
frames.push({ ms: REC, file: "end.jpg" });
const where = await evaluate("location.pathname"), inApp = nav ? await evaluate("window.__flashMark === 1") : null;
writeFileSync(join(out, "frames.json"), JSON.stringify({ mode, from, to, W, H, where, inApp, frames }, null, 1));
console.log(`${mode} ${nav ? from + " -> " : ""}${to}: ${frames.length} frames, ended on ${where}${nav ? (inApp ? ", in-app" : ", full reload") : ""}`);
await send("Page.stopScreencast");
ws.close(); chrome.kill();
