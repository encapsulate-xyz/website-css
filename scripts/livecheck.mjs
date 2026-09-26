// Load a live page in headless Chrome with this repo's files in place of a pinned tag, then run a
// check in the page and print what it returns.
//
//   node --experimental-websocket scripts/livecheck.mjs <url> <tag> <check.js> [--shot out.png]
//
// Every request for website-css@<tag>/… is answered from the local repo (dist/, img/, svg/), so a
// change can be measured on the real page before it is released. <tag> may be a comma-separated
// list (v263,v227,v220) when the page pins its files at different tags. <check.js> is the body of an
// async function evaluated in the page; whatever it returns is printed as JSON. It may use
// `sleep(ms)`. Pass `--from-cdn <sha>` instead of a local repo to reroute to a pushed commit.
//
// Real pointer events (radix answers only those) come from `move(x, y)` in a step file passed with
// `--steps steps.mjs`, which exports `async (ctx) => {}` and gets { at, move, click, press, wheel, sleep, shot } —
// `click(x, y)` is a real press and release at that point, `press(key)` a real key (Tab, Escape…),
// `wheel(x, y, dy)` a real wheel event.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv.splice(i, 2)[1] : null; };
const shotOut = flag("--shot"), cdnSha = flag("--from-cdn"), stepsFile = flag("--steps");
const [url, tag, checkFile] = argv;
const TAGS = (tag || "").split(",").filter(Boolean);
if (!url || !tag) { console.error("usage: livecheck.mjs <url> <tag> [check.js] [--shot out.png] [--from-cdn sha] [--steps steps.mjs]"); process.exit(2); }
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const W = +(process.env.W || 1728), H = +(process.env.H || 996);

/* Chrome picks a free debugging port itself (0) and writes it to DevToolsActivePort in this run's
   own profile, so a run can only ever find its own browser. A random port in a fixed range let one
   of several parallel runs attach to another's Chrome (2026-09-25). */
const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--remote-debugging-port=0",
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
let port = 0;
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
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  if (m.method !== "Fetch.requestPaused") return;
  const u = m.params.request.url, hit = TAGS.find(t => u.includes("website-css@" + t + "/"));
  const marker = "website-css@" + hit + "/";
  if (cdnSha) {
    send("Fetch.continueRequest", { requestId: m.params.requestId, url: u.replace(marker, "website-css@" + cdnSha + "/") });
    return;
  }
  const file = join(REPO, u.split(marker)[1].split("?")[0]);
  if (existsSync(file)) {
    const ext = file.split(".").pop();
    send("Fetch.fulfillRequest", { requestId: m.params.requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: TYPES[ext] || "application/octet-stream" }, { name: "Access-Control-Allow-Origin", value: "*" }],
      body: readFileSync(file).toString("base64") });
  } else {
    send("Fetch.continueRequest", { requestId: m.params.requestId });
  }
});
const at = async (body) => {
  const r = await send("Runtime.evaluate", { expression: `(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)); ${body} })()`, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r.result?.result?.value;
};
const move = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, pointerType: "mouse" });
const click = async (x, y) => {
  await move(x, y);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1, pointerType: "mouse" });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1, pointerType: "mouse" });
};
const press = async (key) => {
  const codes = { Tab: 9, Enter: 13, Escape: 27, " ": 32, ArrowDown: 40, ArrowUp: 38 };
  const k = { key, code: key === " " ? "Space" : key, windowsVirtualKeyCode: codes[key] || 0 };
  // a button answers Enter on the key's character, so without `text` Enter activated nothing
  await send("Input.dispatchKeyEvent", { type: "keyDown", ...k, ...(key === "Enter" ? { text: "\r" } : {}) });
  await send("Input.dispatchKeyEvent", { type: "keyUp", ...k });
};
/* a real wheel event at a point, as a mouse wheel or a trackpad sends one (the snap rules answer
   only real wheel events; a scripted scrollTo fires none of them) */
const wheel = async (x, y, dy) => send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: dy });
const shot = async (out) => { const s = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(out, Buffer.from(s.result.data, "base64")); };

/* NETLOG=1 prints every website-css request that fails or answers with an error */
if (process.env.NETLOG) {
  await send("Network.enable");
  const reqs = {};
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.method === "Network.requestWillBeSent" && /website-css/.test(m.params.request.url)) reqs[m.params.requestId] = m.params.request.url;
    if (m.method === "Network.responseReceived" && reqs[m.params.requestId] && m.params.response.status >= 400) console.log("NET", m.params.response.status, reqs[m.params.requestId]);
    if (m.method === "Network.loadingFailed" && reqs[m.params.requestId]) console.log("NET failed", m.params.errorText, m.params.blockedReason || "", reqs[m.params.requestId]);
  });
}
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 700 });
await send("Fetch.enable", { patterns: TAGS.map(t => ({ urlPattern: "*website-css@" + t + "/*" })) });
await send("Page.enable");
await send("Page.navigate", { url: url + (url.includes("?") ? "&" : "?") + "lc=" + Date.now() });
await sleep(+(process.env.WAIT || 9000));
if (stepsFile) await (await import(resolve(stepsFile))).default({ at, move, click, press, wheel, sleep, shot });
if (checkFile) console.log(JSON.stringify(await at(readFileSync(checkFile, "utf8")), null, 1));
if (shotOut) await shot(shotOut);
ws.close(); chrome.kill();
