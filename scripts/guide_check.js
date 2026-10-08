// The live check of a converted guide, for scripts/livecheck.mjs (the last step of "Converting a guide — the run"
// in notion/new-row-checklist.md):
//
//   W=1440 H=900 node --experimental-websocket scripts/livecheck.mjs https://encapsulate.xyz/guides/<slug> v0 scripts/guide_check.js
//
// (`v0` reroutes nothing, so the page runs the files it really serves.) Prints whether the guide built, its title,
// its steps in order, and how many steps carry their surface as a link ("On …" / "In …"); `missing` names any that do
// not — every step must have one.
for (let i = 0; i < 40 && !document.querySelector('[data-enc-guide]'); i++) await sleep(250);
await sleep(3000);
const heads = [...document.querySelectorAll('h2')].filter(h => h.closest('[data-enc-guide]') && !/Staked with Encapsulate/.test(h.textContent));
const surface = h => { let b = h; for (let k = 0; k < 6 && b && !b.querySelector('a[href^="http"]'); k++) b = b.parentElement;
  return !!b && [...b.querySelectorAll('a[href^="http"]')].some(x => /^(On|In) /.test(x.textContent.trim())); };
return {
  built: !!document.querySelector('[data-enc-guide]'),
  title: (document.querySelector('[data-enc-guide] h1') || {}).textContent,
  steps: heads.map(h => h.textContent.trim()),
  linked: heads.filter(surface).length,
  missing: heads.filter(h => !surface(h)).map(h => h.textContent.trim()),
};
