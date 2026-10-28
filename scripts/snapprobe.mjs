/* The snap check (docs/main-css.md, "Snapping"): a steps file for livecheck.mjs that drives a page's snap with real
   wheel and key events and prints where the page came to rest against where it should, how long it moved and in how
   many movements (a stop and a start again is two).

     SCEN="$(cat scripts/snap/guide.json)" PRELOAD=dist/snap.js W=1440 H=900 \
       node --experimental-websocket scripts/livecheck.mjs https://encapsulate.xyz/guides/sui <every tag the page pins> \
       <an empty check.js> --steps scripts/snapprobe.mjs

   PRELOAD runs this repo's snap.js before the page's scripts, for a page whose head does not carry it yet; once it does,
   pass the tags alone. Scenarios: scripts/snap/<page>.json, each [label, start, gesture, expect]; start and expect are
   JS returning a page y, with t(el), b(el) (an element's top and bottom), q(selector, i), vh and max; gesture is
   notch+ notch- swipe+ swipe- key+ key-. Each start is a jump: one within a third of a screen of a stop settles onto it
   first (the probe says so), so start further out. Headless wheel events are always cancellable; check the freeze with
   dispatchEvent(new WheelEvent("wheel", { cancelable: false })). */
const SCEN = JSON.parse(process.env.SCEN);
const H = `const t = e => Math.round(e.getBoundingClientRect().top + scrollY), q = (s, i) => document.querySelectorAll(s)[i || 0], vh = innerHeight, max = document.documentElement.scrollHeight - innerHeight, b = e => Math.round(e.getBoundingClientRect().bottom + scrollY);`;
export default async ({ at, wheel, press, sleep }) => {
  let ok = 0;
  for (const [label, startExpr, g, expectExpr] of SCEN) {
    const y0 = await at(`${H} const y = (function(){ ${startExpr} })(); scrollTo({ top: y, behavior: "instant" }); return Math.round(y)`);
    // wait for the page to go still: a jump can set off a settle of its own
    await at(`let last = -1, still = 0; while (still < 400) { await sleep(50); if (Math.abs(scrollY - last) < 0.5) still += 50; else { still = 0; last = scrollY; } } return 1`);
    const y1 = await at(`return Math.round(scrollY)`);
    if (Math.abs(y1 - y0) > 2) console.log(`     (the jump to ${y0} settled at ${y1})`);
    await at(`window.__rec = []; const t0 = performance.now(); (function f(){ window.__rec.push([Math.round(performance.now() - t0), Math.round(scrollY * 10) / 10]); if (performance.now() - t0 < 3500) requestAnimationFrame(f); })(); return 1`);
    const dir = g.endsWith("-") ? -1 : 1;
    if (g.startsWith("notch")) await wheel(700, 450, 100 * dir);
    else if (g.startsWith("key")) await press(dir > 0 ? "ArrowDown" : "ArrowUp");
    else {
      const fingers = [4, 9, 16, 24, 30, 32, 28, 22, 18, 14];
      for (const d of fingers) { await wheel(700, 450, d * dir); await sleep(14); }
      let d = 14;
      for (let i = 0; i < 70 && d >= 1; i++) { d = d * 0.94; await wheel(700, 450, Math.max(1, Math.round(d)) * dir); await sleep(16); }
    }
    await sleep(3600);
    const rec = await at(`return window.__rec`);
    const want = await at(`${H} return Math.round((function(){ ${expectExpr} })())`);
    const yEnd = Math.round(rec[rec.length - 1][1]);
    let last = 0, segs = 0, moving = false, still = 0, first = -1;
    for (let i = 1; i < rec.length; i++) {
      const dy = Math.abs(rec[i][1] - rec[i - 1][1]), dt = rec[i][0] - rec[i - 1][0];
      if (dy > 0.5) { if (first < 0) first = rec[i - 1][0]; if (!moving) { if (segs === 0 || still >= 60) segs++; moving = true; } still = 0; last = rec[i][0]; }
      else { moving = false; still += dt; }
    }
    const pass = Math.abs(yEnd - want) <= 2;
    if (pass) ok++;
    console.log(`${pass ? "ok  " : "FAIL"} ${label} [${g}] ${y0} -> ${yEnd} (want ${want}) in ${first < 0 ? 0 : last - first}ms, ${segs} movement${segs === 1 ? "" : "s"}`);
  }
  console.log(`${ok}/${SCEN.length}`);
};
