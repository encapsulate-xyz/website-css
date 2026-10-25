// one Lighthouse phone run of a page (URL=, the homepage by default) in Linux Chromium; "swap" serves this repo's dist
// files for the pinned ones (SWAP=main.css,services.js — main.css by default)
import { createRequire } from "module";
import { readFileSync } from "fs";
const req = createRequire("/usr/local/lib/node_modules/lighthouse/package.json");
const { default: lighthouse } = await import(req.resolve("lighthouse/core/index.js"));
const puppeteer = (await import(req.resolve("puppeteer-core"))).default;
const chromeLauncher = await import(req.resolve("chrome-launcher"));
const mode = process.argv[2] || "live";
const SWAP = (process.env.SWAP || "main.css").split(",");
const chrome = await chromeLauncher.launch({ chromePath: "/usr/bin/chromium", chromeFlags: ["--headless=new", "--no-sandbox"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on("request", r => {
  if (r.isInterceptResolutionHandled()) return;
  const f = mode === "swap" && SWAP.find(n => new RegExp("website-css@v\\d+/dist/" + n.replace(".", "\\.") + "($|\\?)").test(r.url()));
  if (f) r.respond({ status: 200, contentType: f.endsWith(".css") ? "text/css" : "application/javascript", headers: { "access-control-allow-origin": "*" }, body: readFileSync("/repo/dist/" + f) });
  else r.continue();
});
const out = await lighthouse(process.env.URL || "https://encapsulate.xyz/", { output: "json", onlyCategories: ["performance", "agentic-browsing"], logLevel: "error" }, undefined, page);
const A = out.lhr.audits;
const rows = ((A["cls-culprits-insight"].details || {}).items || [])[0];
const culprits = ((rows && rows.items) || []).filter(x => x.node).map(x => `${x.score.toFixed(4)} ${String(x.node.selector || x.node.snippet || "").slice(-40)} ${((x.subItems || {}).items || []).map(s => s.cause || "").join("/")}`);
const failing = out.lhr.categories["agentic-browsing"].auditRefs.map(x => A[x.id]).filter(a => a.scoreDisplayMode !== "notApplicable" && a.score !== 1).map(a => a.id);
console.log(JSON.stringify({ failing, url: (process.env.URL || "/").replace("https://encapsulate.xyz", ""), mode, cls: +A["cumulative-layout-shift"].numericValue.toFixed(4), perf: Math.round(out.lhr.categories.performance.score * 100), agentic: out.lhr.categories["agentic-browsing"].score, culprits }));
await browser.disconnect(); await chrome.kill();
