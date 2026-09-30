// Batch renderer: one headless Chrome, many jobs.
//   node --experimental-websocket render.mjs jobs.json
// jobs.json: [{ url, out, w, h, dsf, css, waitFor, wait, clip, js }]
//   url     — http(s) or file:// page
//   css     — style text injected after load
//   waitFor — JS expression polled until truthy (max 20s)
//   wait    — extra ms after that
//   js      — JS run before the shot (may return a value, printed)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const CONC = +(process.env.CONC || 4);
const profile = mkdtempSync(join(tmpdir(), "og-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--remote-debugging-port=0", "--allow-file-access-from-files",
  `--user-data-dir=${profile}`, "--window-size=1200,630", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let port = 0;
for (let i = 0; i < 60 && !port; i++) { await sleep(200); try { port = +readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]; } catch {} }
const browser = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
const bws = new WebSocket(browser.webSocketDebuggerUrl);
await new Promise(r => bws.addEventListener("open", r));
let id = 0; const pending = {};
const handlers = {};
bws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  if (m.sessionId && handlers[m.sessionId]) handlers[m.sessionId](m);
});
const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pending[i] = r; bws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })); });
async function run(job) {
  const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
  const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: job.w || 1200, height: job.h || 630, deviceScaleFactor: job.dsf || 1, mobile: false });
  await S("Page.navigate", { url: job.url });
  const ev = async expr => (await S("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  for (let i = 0; i < 100; i++) { await sleep(200); if (await ev("document.readyState") === "complete") break; }
  if (job.css) await ev(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(job.css)};document.head.appendChild(s);return 1})()`);
  if (job.waitFor) { for (let i = 0; i < 100; i++) { if (await ev(job.waitFor)) break; await sleep(200); } }
  await ev("document.fonts ? document.fonts.ready.then(()=>1) : 1");
  if (job.wait) await sleep(job.wait);
  let out = null;
  if (job.js) out = await ev(job.js);
  if (job.clip && job.clipFrom) job.clip.y = (await ev(`document.getElementById(${JSON.stringify(job.clipFrom)}).getBoundingClientRect().top + window.scrollY - 80`)) || 0;
  const shot = await S("Page.captureScreenshot", { format: "png", ...(job.clip ? { clip: { ...job.clip, scale: 1 } } : {}), captureBeyondViewport: !!job.clip });
  writeFileSync(job.out, Buffer.from(shot.result.data, "base64"));
  await send("Target.closeTarget", { targetId });
  console.log(job.out.split("/").pop(), out != null ? JSON.stringify(out) : "");
}
const queue = jobs.slice();
await Promise.all(Array.from({ length: CONC }, async () => { while (queue.length) { const j = queue.shift(); try { await run(j); } catch (e) { console.log("FAIL", j.out, e.message); } } }));
bws.close(); chrome.kill();
