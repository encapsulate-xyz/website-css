// one Lighthouse phone run of the homepage in Linux Chromium; "swap" serves this repo's dist/main.css for the pinned one
import { createRequire } from "module";
import { readFileSync } from "fs";
const req = createRequire("/usr/local/lib/node_modules/lighthouse/package.json");
const { default: lighthouse } = await import(req.resolve("lighthouse/core/index.js"));
const puppeteer = (await import(req.resolve("puppeteer-core"))).default;
const chromeLauncher = await import(req.resolve("chrome-launcher"));
const mode = process.argv[2] || "live";
const css = readFileSync("/repo/dist/main.css");
const chrome = await chromeLauncher.launch({ chromePath: "/usr/bin/chromium", chromeFlags: ["--headless=new", "--no-sandbox"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on("request", r => {
  if (r.isInterceptResolutionHandled()) return;
  if (mode === "swap" && /website-css@v\d+\/dist\/main\.css/.test(r.url())) r.respond({ status: 200, contentType: "text/css", headers: { "access-control-allow-origin": "*" }, body: css });
  else r.continue();
});
const out = await lighthouse("https://encapsulate.xyz/", { output: "json", onlyCategories: ["performance", "agentic-browsing"], logLevel: "error" }, undefined, page);
const A = out.lhr.audits;
const rows = ((A["cls-culprits-insight"].details || {}).items || [])[0];
const culprits = ((rows && rows.items) || []).filter(x => x.node).map(x => `${x.score.toFixed(4)} ${String(x.node.selector || x.node.snippet || "").slice(-40)} ${((x.subItems || {}).items || []).map(s => s.cause || "").join("/")}`);
console.log(JSON.stringify({ mode, cls: +A["cumulative-layout-shift"].numericValue.toFixed(4), perf: Math.round(out.lhr.categories.performance.score * 100), agentic: out.lhr.categories["agentic-browsing"].score, culprits }));
await browser.disconnect(); await chrome.kill();
