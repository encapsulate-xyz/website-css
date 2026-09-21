/* The count band's collision rule (network.js paintKicker), with stubbed geometry.
   The label owns 26..42 of the viewport; it hides while any line of a panel crosses that strip,
   and once no line of any panel is on screen at all. Run: node scratchpad/kickertest.js */
const LABEL_TOP = 26, LABEL_BOTTOM = 42, VH = 936;

function leaving(panels) {
  let hit = false, showing = false;
  for (const lines of panels) {
    for (const s of lines) {
      if (!s.height) continue;
      if (s.top < LABEL_BOTTOM + 6 && s.bottom > LABEL_TOP - 6) hit = true;
      if (s.bottom > 0 && s.top < VH) showing = true;
    }
  }
  return hit || !showing;
}
const line = (top, h) => ({ top, bottom: top + h, height: h });
// a panel's stack: index 16, figure 148, label 36, note 32, 22px apart
const panel = top => [line(top, 16), line(top + 38, 148), line(top + 208, 36), line(top + 266, 32)];

const cases = [
  ["pinned, stack mid-screen",      [panel(355)],            false],
  ["risen a little, nothing in it", [panel(77)],             false],
  ["index past, figure in it",      [panel(-33)],            true],
  ["label line in it",              [panel(-173)],           true],
  ["all lines gone above",          [panel(-373)],           true],
  ["second panel still entering",   [panel(-373), panel(700)], false],
  ["nothing rendered",              [[]],                    true]
];
let bad = 0;
for (const [name, panels, want] of cases) {
  const got = leaving(panels);
  if (got !== want) { bad++; console.log("FAIL", name, "want", want, "got", got); }
  else console.log("ok  ", name, "->", got);
}
process.exit(bad ? 1 : 0);
