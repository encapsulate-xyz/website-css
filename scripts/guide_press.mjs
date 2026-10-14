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
export default async ({ at, click, sleep }) => {
  const say = (s) => console.log(s);
  await at(`window.__copied = []; navigator.clipboard.writeText = t => { __copied.push(t); return Promise.resolve(); };`);
  const n = +(await at(`return document.querySelectorAll(".enc-gd__step").length`));
  if (!n) { say("no steps: the guide did not build"); return; }
  let bad = 0;
  const centre = (sel, i) => at(`const e = document.querySelectorAll(".enc-gd__step")[${i}].querySelector("${sel}");
    if (!e) return "null"; e.scrollIntoView({ block: "center", behavior: "instant" });
    const r = e.getClientRects()[0]; return JSON.stringify([r.x + Math.min(30, r.width / 2), r.y + r.height / 2]);`);
  for (let i = 0; i < n; i++) {
    const has = JSON.parse(await at(`const s = document.querySelectorAll(".enc-gd__step")[${i}];
      return JSON.stringify({ watch: !!s.querySelector(".enc-gd__watchbtn"), copies: s.querySelectorAll(".enc-gd__copy").length })`));
    if (has.watch) {
      const p = JSON.parse(await centre(".enc-gd__watchbtn", i)); await sleep(500);
      await click(p[0], p[1]); await sleep(700);
      const r = JSON.parse(await at(`const s = document.querySelectorAll(".enc-gd__step")[${i}], b = s.querySelector(".enc-gd__watchbtn"), note = s.querySelector(".enc-gd__note");
        const nr = note.getBoundingClientRect(), shot = s.querySelector(".enc-gd__shot"), sr = shot && shot.getBoundingClientRect();
        return JSON.stringify({ open: b.getAttribute("aria-expanded") === "true" && nr.height > 0, overflow: note.scrollWidth - note.clientWidth,
          over: !!(sr && !(nr.right <= sr.left || nr.left >= sr.right || nr.bottom <= sr.top || nr.top >= sr.bottom)) })`));
      const ok = r.open && r.overflow <= 0 && !r.over;
      if (!ok) bad++;
      say(`step ${i + 1} watch out: ${ok ? "ok" : (r.open ? "" : "did not open ") + (r.overflow > 0 ? `text ${r.overflow}px past its box ` : "") + (r.over ? "over the capture" : "")}`);
    }
    for (let k = 0; k < has.copies; k++) {
      const p = JSON.parse(await at(`const e = document.querySelectorAll(".enc-gd__step")[${i}].querySelectorAll(".enc-gd__copy")[${k}];
        e.scrollIntoView({ block: "center", behavior: "instant" }); const r = e.getClientRects()[0]; return JSON.stringify([r.x + Math.min(30, r.width / 2), r.y + r.height / 2]);`));
      await sleep(400);
      await at(`__copied = [];`);
      await click(p[0], p[1]); await sleep(400);
      const r = JSON.parse(await at(`const e = document.querySelectorAll(".enc-gd__step")[${i}].querySelectorAll(".enc-gd__copy")[${k}];
        return JSON.stringify({ want: e.querySelector(".enc-gd__addr").textContent, got: __copied[0] || "", state: e.hasAttribute("data-enc-copied") })`));
      const ok = r.got === r.want && r.state;
      if (!ok) bad++;
      say(`step ${i + 1} address ${r.want}: ${ok ? "copies" : `copied ${JSON.stringify(r.got)}${r.state ? "" : ", no copied state"}`}`);
    }
  }
  say(bad ? `${bad} problem(s)` : "ok");
};
