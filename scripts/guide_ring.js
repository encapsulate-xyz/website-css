// The ring for a guide capture (notion/guide-screenshots.md, "Annotating"): pick the control with
// DevTools' inspect arrow, then run this in the console (or as the saved Snippet "ring").
//   pbcopy < scripts/guide_ring.js
// puts it on the clipboard; copied out of the terminal, a long line can lose its end (2026-10-16:
// "Invalid or unexpected token"), so every line here stays short.
// Clear the ring with: document.getElementById("enc-mark").remove()
(picked => {
  const RING = 2, GAP = 0;
  // The element that draws the button: the picked one if it has a
  // box of its own; else a child that fills it (a wrapper was
  // picked); else the nearest parent with a box (a label was picked).
  const boxed = e => {
    const s = getComputedStyle(e);
    const clear = s.backgroundColor === "rgba(0, 0, 0, 0)";
    const edge = parseFloat(s.borderTopWidth) > 0
      && s.borderTopStyle !== "none";
    return parseFloat(s.borderTopLeftRadius) > 0 || !clear || edge
      || s.boxShadow !== "none";
  };
  const p = picked.getBoundingClientRect();
  const fills = e => {
    const q = e.getBoundingClientRect();
    return q.width >= p.width - 2 && q.height >= p.height - 2;
  };
  let b = boxed(picked) ? picked : [...picked.querySelectorAll("*")]
    .find(e => boxed(e) && fills(e));
  for (let e = picked.parentElement; !b && e; e = e.parentElement) {
    if (e === document.body) break;
    if (boxed(e)) b = e;
  }
  b = b || picked;

  const r = b.getBoundingClientRect();
  const s = getComputedStyle(b);
  const pad = GAP + RING;
  // each corner is the button's own (px or %, round or elliptical)
  // plus the ring, so the ring's inner edge follows the button's curve
  const px = (t, d) =>
    t.endsWith("%") ? parseFloat(t) * d / 100 : parseFloat(t) || 0;
  const corner = v => {
    const [x, y = x] = v.split(" ");
    const rx = px(x, r.width) + pad, ry = px(y, r.height) + pad;
    return rx + "px " + ry + "px";
  };

  document.getElementById("enc-mark")?.remove();
  const m = document.createElement("div");
  m.id = "enc-mark";
  Object.assign(m.style, {
    position: "fixed",
    left: r.left - pad + "px",
    top: r.top - pad + "px",
    width: r.width + 2 * pad + "px",
    height: r.height + 2 * pad + "px",
    boxSizing: "border-box",
    border: RING + "px solid #000",
    borderTopLeftRadius: corner(s.borderTopLeftRadius),
    borderTopRightRadius: corner(s.borderTopRightRadius),
    borderBottomRightRadius: corner(s.borderBottomRightRadius),
    borderBottomLeftRadius: corner(s.borderBottomLeftRadius),
    pointerEvents: "none",
    zIndex: "2147483647"
  });

  const popup = b.closest([
    "dialog[open]", "[role='dialog']", "[aria-modal='true']",
    "[class*='modal' i]", "[class*='popup' i]"
  ].join(", "));
  (popup || b.ownerDocument.body).append(m);

  // in a transformed popup "fixed" counts from the popup, not the
  // window: move the ring by however far it landed from the button
  const a = m.getBoundingClientRect();
  const dx = r.left - pad - a.left, dy = r.top - pad - a.top;
  m.style.left = parseFloat(m.style.left) + dx + "px";
  m.style.top = parseFloat(m.style.top) + dy + "px";
})($0);
