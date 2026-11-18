// Press every Watch out and every address on a guide page, as a reader would — the steps file for
// livecheck.mjs (2026-10-14, after a Watch out that a capture row took the press of, and the addresses
// made copyable):
//
//   W=1440 H=900 node --experimental-websocket scripts/livecheck.mjs https://encapsulate.xyz/guides/<slug> v0 \
//     --steps scripts/guide_press.mjs
//
// Run it at 1440 × 900 and at 390 × 844. For each Watch out: a real press on the button's centre must open
// its note, the note must hold its text (no overflow) and lie clear of the capture. For each address (inline
// code in Notion, drawn as .enc-gd__copy): a real press must copy exactly the address — the clipboard is
// stubbed, so nothing reaches the machine's own — and show the copied state. Prints one line per control
// and a last line, "ok" or the count of problems.
//
// Each control is pressed once it has stopped moving: snap.js glides after a scroll, and a press made during the
// glide missed the first step's Watch out at 1440 (Monad, Pharos) and at 390 (Supra, 2026-11-18).
export default async ({ at, click, sleep }) => {
  const say = (s) => console.log(s);
  let n = 0; /* the guide builds once /guides has been read, which can take a while after a refresh */
  for (let t = 0; t < 60 && !n; t++) { await sleep(500); n = +(await at(`return document.querySelectorAll(".enc-gd__step").length`)); }
  await sleep(2000);
  await at(`window.__copied = []; navigator.clipboard.writeText = t => { __copied.push(t); return Promise.resolve(); };`);
  if (!n) { say("no steps: the guide did not build"); return; }
  let bad = 0;
  const innerH = +(await at(`return innerHeight`));
  const still = async (expr) => {
    let last = "", same = 0;
    for (let t = 0; t < 40 && same < 3; t++) {
      const p = await at(`const e = ${expr}; const r = e.getClientRects()[0]; return JSON.stringify([Math.round(r.x + Math.min(30, r.width / 2)), Math.round(r.y + r.height / 2)]);`);
      same = p === last ? same + 1 : 0; last = p; await sleep(250);
    }
    return JSON.parse(last);
  };
  /* a reader stands on a snapped step: bring the step to the top and let snap.js settle; only a control still
     off the screen (a long step on a phone) is then centred, and settled again */
  const reach = async (step, expr) => {
    await at(`${step}.scrollIntoView({ block: "start", behavior: "instant" }); return 1;`);
    let p = await still(expr);
    if (p[1] < 0 || p[1] > innerH) {
      await at(`${expr}.scrollIntoView({ block: "center", behavior: "instant" }); return 1;`);
      p = await still(expr);
    }
    return p;
  };
  for (let i = 0; i < n; i++) {
    const S = `document.querySelectorAll(".enc-gd__step")[${i}]`;
    const has = JSON.parse(await at(`const s = ${S}; return JSON.stringify({ watch: !!s.querySelector(".enc-gd__watchbtn"), copies: s.querySelectorAll(".enc-gd__copy").length })`));
    if (has.watch) {
      const p = await reach(S, `${S}.querySelector(".enc-gd__watchbtn")`);
      await click(p[0], p[1]); await sleep(700);
      const r = JSON.parse(await at(`const s = ${S}, b = s.querySelector(".enc-gd__watchbtn"), note = s.querySelector(".enc-gd__note");
        const nr = note.getBoundingClientRect(), shot = s.querySelector(".enc-gd__shot"), sr = shot && shot.getBoundingClientRect();
        return JSON.stringify({ open: b.getAttribute("aria-expanded") === "true" && nr.height > 0, overflow: note.scrollWidth - note.clientWidth,
          over: !!(sr && !(nr.right <= sr.left || nr.left >= sr.right || nr.bottom <= sr.top || nr.top >= sr.bottom)) })`));
      const ok = r.open && r.overflow <= 0 && !r.over; if (!ok) bad++;
      say(`step ${i + 1} watch out: ${ok ? "ok" : JSON.stringify(r)}`);
    }
    for (let k = 0; k < has.copies; k++) {
      const E = `${S}.querySelectorAll(".enc-gd__copy")[${k}]`;
      const p = await reach(S, E);
      await at(`__copied = [];`);
      await click(p[0], p[1]); await sleep(400);
      const r = JSON.parse(await at(`const e = ${E}; return JSON.stringify({ want: e.querySelector(".enc-gd__addr").textContent, got: __copied[0] || "", state: e.hasAttribute("data-enc-copied") })`));
      const ok = r.got === r.want && r.state; if (!ok) bad++;
      say(`step ${i + 1} address ${r.want}: ${ok ? "copies" : JSON.stringify(r)}`);
    }
  }
  say(bad ? `${bad} problem(s)` : "ok");
};
