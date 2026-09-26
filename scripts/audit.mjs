// Audit a live page at many widths with this repo's files in place of every tag the page pins
// (so what is measured is the current HEAD, not whatever Super last baked), and report what a
// reader would hit: sideways scroll and what causes it, text cut by its own box, images that did
// not load, script errors, website-css requests that failed. Optionally screenshots, one per
// screen, top to bottom.
//
//   node --experimental-websocket scripts/audit.mjs <path> [--widths 320,390,768,1024,1440]
//        [--shots 390,1440] [--out dir] [--check extra.js]
//
// <path> is a path on https://encapsulate.xyz ("/", "/networks"). --check adds a page-specific
// check (the body of an async function, as livecheck takes) whose result is stored per width.
// Output: <out>/<slug>.json, and <out>/<slug>/<width>-<n>.png for the widths in --shots.
// Under 835px the page is loaded as a touch device, so (hover: none) rules apply as on a phone.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const flag = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv.splice(i, 2)[1] : dflt; };
const WIDTHS = flag("--widths", "320,360,390,430,600,768,834,900,1024,1180,1280,1366,1440,1728,1920,2560").split(",").map(Number);
const SHOTS = flag("--shots", "").split(",").filter(Boolean).map(Number);
const OUT = resolve(flag("--out", join(tmpdir(), "enc-audit")));
const EXTRA = flag("--check", null);
const path = argv[0] || "/";
const ORIGIN = "https://encapsulate.xyz";
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const slug = (path === "/" ? "home" : path.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_")).slice(0, 80);
mkdirSync(join(OUT, slug), { recursive: true });
const heightFor = w => w < 600 ? 844 : w < 1024 ? 1024 : w < 1600 ? 900 : w < 2000 ? 1080 : 1440;

// every tag the page pins goes to the local repo
const html = await (await fetch(ORIGIN + path)).text();
const TAGS = [...new Set([...html.matchAll(/website-css@(v\d+)\//g)].map(m => m[1]))];

const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--remote-debugging-port=0",
  `--user-data-dir=${profile}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
const TYPES = { js: "application/javascript", css: "text/css", png: "image/png", svg: "image/svg+xml", mp4: "video/mp4", webp: "image/webp" };
let errors = [], failed = [];
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    errors.push(((d.exception && d.exception.description) || d.text || "").split("\n").slice(0, 2).join(" | ") + " @" + (d.url || "").split("/").pop() + ":" + d.lineNumber);
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    errors.push("console.error: " + m.params.args.map(a => a.value || a.description || "").join(" ").slice(0, 200));
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) failed.push(m.params.errorText + " " + (reqs[m.params.requestId] || ""));
  if (m.method === "Network.requestWillBeSent") reqs[m.params.requestId] = m.params.request.url.slice(0, 160);
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) failed.push(m.params.response.status + " " + m.params.response.url.slice(0, 160));
  if (m.method !== "Fetch.requestPaused") return;
  const u = m.params.request.url, hit = TAGS.find(t => u.includes("website-css@" + t + "/"));
  // BLOCK=1 loads the page without any of this repo's files: is a fault ours or Super's?
  if (process.env.BLOCK) { send("Fetch.failRequest", { requestId: m.params.requestId, errorReason: "BlockedByClient" }); return; }
  // ALLOW=navbar.js,covers.js serves every stylesheet but only the named scripts: which script is it?
  if (process.env.ALLOW && /\.js(\?|$)/.test(u) && !process.env.ALLOW.split(",").some(f => u.includes("/dist/" + f))) {
    send("Fetch.failRequest", { requestId: m.params.requestId, errorReason: "BlockedByClient" }); return;
  }
  const file = join(REPO, u.split("website-css@" + hit + "/")[1].split("?")[0]);
  if (existsSync(file)) {
    const ext = file.split(".").pop();
    send("Fetch.fulfillRequest", { requestId: m.params.requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: TYPES[ext] || "application/octet-stream" }, { name: "Access-Control-Allow-Origin", value: "*" }],
      body: readFileSync(file).toString("base64") });
  } else send("Fetch.continueRequest", { requestId: m.params.requestId });
});
const reqs = {};
const at = async (body) => {
  const r = await send("Runtime.evaluate", { expression: `(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)); ${body} })()`, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r.result?.result?.value;
};
await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
if (TAGS.length) await send("Fetch.enable", { patterns: TAGS.map(t => ({ urlPattern: "*website-css@" + t + "/*" })) });

/* The page check. Sideways scroll is reported with its causes: the outermost visible elements
   that reach past the viewport and are not clipped by an ancestor. Text is "cut" when an element
   that clips (overflow not visible) is narrower or shorter than its own text and does not end in
   an ellipsis on purpose. Only visible elements count. */
const CHECK = `
  const W = innerWidth, out = { w: W, scrollW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight };
  const vis = e => { const c = getComputedStyle(e); if (c.display === "none" || c.visibility === "hidden" || +c.opacity === 0) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const idOf = e => { const b = e.closest("[id^=block-]"); const cls = (e.className && e.className.baseVal === undefined ? String(e.className) : "").split(" ").filter(Boolean).slice(0, 2).join("."); return (b ? "#" + b.id.slice(0, 26) + " " : "") + e.tagName.toLowerCase() + (cls ? "." + cls : ""); };
  const clips = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== "visible" || c.contain.includes("paint")) { const b = a.getBoundingClientRect(); if (b.right <= W + 1 && b.left >= -1) return true; } if (c.position === "fixed") return false; } return false; };
  const wide = [];
  for (const e of document.querySelectorAll("body *")) {
    if (e.closest("svg") && e.tagName !== "svg") continue;
    const b = e.getBoundingClientRect();
    if (b.width === 0 || (b.right <= W + 1 && b.left >= -1)) continue;
    if (!vis(e) || clips(e)) continue;
    if (e.parentElement && wide.some(w => w.el.contains(e))) continue;
    wide.push({ el: e, what: idOf(e), left: Math.round(b.left), right: Math.round(b.right), top: Math.round(b.top + scrollY) });
  }
  out.wide = wide.slice(0, 12).map(w => ({ what: w.what, left: w.left, right: w.right, top: w.top }));
  const cut = [];
  for (const e of document.querySelectorAll("h1,h2,h3,h4,p,span,a,button,li,td,th,label,div")) {
    if (!e.firstChild || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const c = getComputedStyle(e);
    if (c.overflow === "visible" && c.overflowX === "visible" && c.overflowY === "visible") continue;
    if (c.textOverflow === "ellipsis" || c.webkitLineClamp !== "none" && c.webkitLineClamp) continue;
    if (!vis(e) || e.closest("[aria-hidden=true]")) continue;
    if (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 3) {
      const b = e.getBoundingClientRect();
      if (b.bottom < 0 || b.top + scrollY > out.pageH) continue;
      cut.push({ what: idOf(e), text: e.textContent.trim().slice(0, 50), box: [Math.round(e.clientWidth), Math.round(e.clientHeight)], needs: [e.scrollWidth, e.scrollHeight], top: Math.round(b.top + scrollY) });
    }
  }
  out.cut = cut.slice(0, 15);
  out.brokenImages = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && vis(i) && i.getAttribute("src")).map(i => idOf(i) + " " + (i.currentSrc || i.src).slice(0, 100)).slice(0, 10);
  out.smallTargets = W < 835 ? [...document.querySelectorAll("a[href], button")].filter(e => { if (!vis(e)) return false; const b = e.getBoundingClientRect(); return (b.width < 24 || b.height < 24) && e.textContent.trim().length > 0; }).length : undefined;
  return out;`;

const report = { path, tags: TAGS, widths: {} };
for (const w of WIDTHS) {
  errors = []; failed = [];
  const h = heightFor(w);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 835 });
  await send("Emulation.setTouchEmulationEnabled", { enabled: w < 835, maxTouchPoints: w < 835 ? 5 : 0 });
  await send("Page.navigate", { url: ORIGIN + path + (path.includes("?") ? "&" : "?") + "audit=" + Date.now() });
  await sleep(+(process.env.WAIT || 8000));
  // walk the page so lazy images and scroll-built sections come in, then back to the top
  await at(`const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += innerHeight * 0.8) { scrollTo(0, y); await sleep(120); } scrollTo(0, 0); await sleep(600);`);
  const r = await at(CHECK);
  if (EXTRA) r.extra = await at(readFileSync(EXTRA, "utf8"));
  r.errors = [...new Set(errors)].slice(0, 10);
  r.failed = [...new Set(failed)].filter(f => !/google|analytics|doubleclick|facebook|hotjar|clarity|cal\.com\/api|posthog|sentry/i.test(f)).slice(0, 10);
  report.widths[w] = r;
  if (SHOTS.includes(w)) {
    const H = await at(`return document.documentElement.scrollHeight;`);
    let n = 0;
    for (let y = 0; y < H && n < 40; y += h, n++) {
      await at(`scrollTo(0, ${y}); await sleep(250);`);
      const s = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(OUT, slug, `${w}-${String(n).padStart(2, "0")}.png`), Buffer.from(s.result.data, "base64"));
    }
  }
  const flagged = (r.scrollW > w ? "SCROLLS " + r.scrollW : "") + (r.cut && r.cut.length ? " cut:" + r.cut.length : "") + (r.errors.length ? " errors:" + r.errors.length : "") + (r.brokenImages && r.brokenImages.length ? " img:" + r.brokenImages.length : "");
  console.log(path, w, flagged || "ok");
}
writeFileSync(join(OUT, slug + ".json"), JSON.stringify(report, null, 1));
ws.close(); chrome.kill();
