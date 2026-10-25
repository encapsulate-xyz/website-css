// every font Chromium draws on a loaded page, glyph counts summed over every element with its own text — live CSS
// against this repo's dist/main.css
import { createRequire } from "module";
import { readFileSync } from "fs";
const req = createRequire("/usr/local/lib/node_modules/lighthouse/package.json");
const puppeteer = (await import(req.resolve("puppeteer-core"))).default;
const css = readFileSync("/repo/dist/main.css");
const browser = await puppeteer.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"], headless: true });
for (const path of (process.env.PAGES || "/").split(",")) for (const vw of [412, 1440]) {
  const res = {};
  for (const mode of ["live", "swap"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: vw, height: 900, deviceScaleFactor: 1, isMobile: vw < 700 });
    await page.setRequestInterception(true);
    page.on("request", r => (mode === "swap" && /website-css@v\d+\/dist\/main\.css/.test(r.url())) ? r.respond({ status: 200, contentType: "text/css", headers: { "access-control-allow-origin": "*" }, body: css }) : r.continue());
    await page.goto("https://encapsulate.xyz" + path, { waitUntil: "networkidle2", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 4000));
    const cdp = await page.createCDPSession(); await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "body *" });
    const tally = {};
    for (const id of nodeIds) {
      try { const f = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: id }); for (const x of f.fonts) tally[x.familyName] = (tally[x.familyName] || 0) + x.glyphCount; } catch (e) {}
    }
    res[mode] = tally; await page.close();
  }
  const fams = [...new Set([...Object.keys(res.live), ...Object.keys(res.swap)])].sort();
  console.log(path, vw, fams.map(f => `${f}: ${res.live[f] || 0}${(res.live[f] || 0) === (res.swap[f] || 0) ? "" : " → " + (res.swap[f] || 0)}`).join(" | "));
}
await browser.close();
