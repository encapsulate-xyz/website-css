// One Lighthouse run in Linux Chromium, as PageSpeed runs it (docs/audit.md, "The first paint"):
//   docker run --rm --shm-size=1g -v "$PWD":/repo:ro -e URL=… -e FF=desktop|mobile [-e INJECT='<link …>'] [-e SWAP=blocks.js,post.js [-e SWAPDIR=/repo/backups/ab/a]] [-e SUBS='[["re","to"]]'] [-v …:/out -e LHR=/out/x.json] enc-lh node /repo/scripts/linux/lhrun.mjs
// The page's HTML is fetched here and served to Chromium, with INJECT put at the top of its <head> when given, and the
// dist files named in SWAP are served from this repo for whatever tag the page pins, so a change can be measured before
// it is released and pasted (every variant goes through the same path). Prints the score, the simulated and observed
// metrics, the LCP element and its subparts, and the long tasks.
// What it serves goes out uncompressed (a gzip body through request.respond is not decoded: the page comes back blank), so
// the simulation counts the HTML and a swapped file at full size and scores run 5–10 under PageSpeed: compare arms, not totals.
import { createRequire } from "module";
import { readFileSync } from "fs";
const req = createRequire("/usr/local/lib/node_modules/lighthouse/package.json");
const { default: lighthouse } = await import(req.resolve("lighthouse/core/index.js"));
const desktopConfig = (await import(req.resolve("lighthouse/core/config/desktop-config.js"))).default;
const puppeteer = (await import(req.resolve("puppeteer-core"))).default;
const chromeLauncher = await import(req.resolve("chrome-launcher"));
const URL = process.env.URL || "https://encapsulate.xyz/", FF = process.env.FF || "desktop", INJECT = process.env.INJECT || "";
const SWAP = (process.env.SWAP || "").split(",").filter(Boolean);
const SWAPDIR = process.env.SWAPDIR || "/repo/dist";   // another folder under /repo, to A/B two builds served the same way
const SUBS = JSON.parse(process.env.SUBS || (process.env.SUBSFILE ? readFileSync(process.env.SUBSFILE, "utf8") : "[]"));   // [[regex, replacement]] on the page's HTML: a head change that moves a line
const chrome = await chromeLauncher.launch({ chromePath: "/usr/bin/chromium", chromeFlags: ["--headless=new", "--no-sandbox"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on("request", async r => {
  if (r.isInterceptResolutionHandled()) return;
  const f = SWAP.find(n => new RegExp("website-css@v\\d+/dist/" + n.replace(".", "\\.") + "($|\\?)").test(r.url()));
  if (f) return r.respond({ status: 200, contentType: f.endsWith(".css") ? "text/css" : "application/javascript", headers: { "access-control-allow-origin": "*" }, body: readFileSync(SWAPDIR + "/" + f) });
  if (r.resourceType() !== "document" || !r.url().startsWith(URL)) return r.continue();
  const res = await fetch(r.url(), { headers: { "user-agent": r.headers()["user-agent"] || "" } });
  let html = await res.text();
  if (INJECT) html = html.replace(/<head([^>]*)>/i, (m) => m + INJECT);
  for (const [re, to] of SUBS) html = html.replace(new RegExp(re), to);
  r.respond({ status: res.status, contentType: "text/html; charset=utf-8", body: html });
});
const out = await lighthouse(URL, { output: "json", onlyCategories: ["performance"], logLevel: "error" }, FF === "desktop" ? desktopConfig : undefined, page);
if (process.env.LHR) (await import("fs")).writeFileSync(process.env.LHR, JSON.stringify(out.lhr));   // the whole report, to a writable mount
const A = out.lhr.audits, m = A.metrics.details.items[0];
const flat = []; (function walk(x) { if (!x || typeof x !== "object") return; if (Array.isArray(x)) return x.forEach(walk); if (x.type === "node") flat.push(x); if (x.subpart && x.duration != null) flat.push(x); Object.values(x).forEach(walk); })((A["lcp-breakdown-insight"] || {}).details);
const node = flat.find(x => x.type === "node");
const lt = (((A["long-tasks"] || {}).details || {}).items || []).map(x => `${x.url.replace(/^.*\//, "").slice(0, 24)}@${Math.round(x.startTime)}:${Math.round(x.duration)}`);
console.log(JSON.stringify({ url: URL.replace("https://encapsulate.xyz", ""), ff: FF, inject: !!INJECT, swap: SWAP.join("+"), perf: Math.round(out.lhr.categories.performance.score * 100),
  sim: { fcp: Math.round(m.firstContentfulPaint), lcp: Math.round(m.largestContentfulPaint), tbt: Math.round(m.totalBlockingTime), si: Math.round(m.speedIndex) },
  obs: { fcp: Math.round(m.observedFirstContentfulPaint), lcp: Math.round(m.observedLargestContentfulPaint), load: Math.round(m.observedLoad) },
  lcpEl: node ? (node.selector || "").slice(-50) : null, phases: flat.filter(x => x.subpart).map(x => x.subpart.replace(/^(.)[a-z]+([A-Z]).*$/, "$1$2") + " " + Math.round(x.duration)).join(", "), lt }));
await browser.disconnect(); await chrome.kill();
