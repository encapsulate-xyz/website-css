// the hero on Linux Chromium at 412px: which font each line is drawn in, and where the loop sits — with the web fonts
// blocked (the fallback, for as long as it lasts) and loaded; "swap" serves this repo's dist/main.css
import { createRequire } from "module";
import { readFileSync } from "fs";
const req = createRequire("/usr/local/lib/node_modules/lighthouse/package.json");
const puppeteer = (await import(req.resolve("puppeteer-core"))).default;
const css = readFileSync("/repo/dist/main.css");
const browser = await puppeteer.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"], headless: true });
for (const [mode, block] of (process.env.MODES || "live:1,swap:1,swap:0").split(",").map(x => [x.split(":")[0], x.split(":")[1] === "1"])) {
  const page = await browser.newPage();
  await page.setViewport({ width: +(process.env.VW || 412), height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  page.on("request", r => {
    if (block && /fonts\.gstatic\.com/.test(r.url())) return r.abort();
    if (mode === "swap" && /website-css@v\d+\/dist\/main\.css/.test(r.url())) return r.respond({ status: 200, contentType: "text/css", headers: { "access-control-allow-origin": "*" }, body: css });
    r.continue();
  });
  await page.goto("https://encapsulate.xyz/?d=" + Date.now(), { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  const cdp = await page.createCDPSession(); await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const fontsOf = async (sel) => { const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: sel }); if (!nodeId) return "none"; const f = await cdp.send("CSS.getPlatformFontsForNode", { nodeId }); return f.fonts.map(x => `${x.familyName}${x.isCustomFont ? "*" : ""}:${x.glyphCount}`).join(","); };
  const geo = await page.evaluate(() => { const v = document.querySelector("#block-3e6e800a513881f79397d19b2335535a"); const h = document.querySelector("#block-11a2eeaf43d94c23aeaa3d347ec2d749 h1, #block-11a2eeaf43d94c23aeaa3d347ec2d749 .notion-heading"); const lede = h && h.closest(".notion-column").querySelector("p.notion-text"); return { video: Math.round(v.getBoundingClientRect().top + scrollY), h1: Math.round(h.getBoundingClientRect().height), lede: lede ? Math.round(lede.getBoundingClientRect().height) : null, h1font: getComputedStyle(h).fontFamily.slice(0, 60), w: getComputedStyle(h).fontWeight }; });
  console.log(mode, block ? "fonts blocked" : "fonts loaded", JSON.stringify(geo), "| h1:", await fontsOf("#block-11a2eeaf43d94c23aeaa3d347ec2d749 h1"), "| lede:", await fontsOf("#block-11a2eeaf43d94c23aeaa3d347ec2d749 p.notion-text"));
  await page.close();
}
await browser.close();
