// The ring for a guide capture (notion/guide-screenshots.md, "Annotating"): pick the control with
// DevTools' inspect arrow, then run this in the console (or as the saved Snippet "ring").
//   pbcopy < scripts/guide_ring.js
// puts it on the clipboard; copied out of the terminal, a long line can lose its end (2026-10-16:
// "Invalid or unexpected token"), so every line here stays short.
// Clear the ring with: document.getElementById("enc-mark").remove()
(picked => {
  // SIDE: "out" hugs the control from outside, "in" draws the ring on
  // the control's own edge, "auto" picks (see INSIDE OR OUTSIDE below).
  // GAP: px between the control and an outside ring.
  const SIDE = "auto", RING = 2, GAP = 0;
  const body = document.body;
  document.getElementById("enc-mark")?.remove();

  // The control: the button or tab the pick sits in; else the
  // outermost of its clickable (pointer) parents; else the pick. It
  // never climbs to a plain container: a segment of a bar of buttons
  // is ringed, not the bar (2026-10-16, Auro's Staking).
  const CONTROL = [
    "button", "a[href]", "summary", "input", "select", "textarea",
    "[role='button']", "[role='tab']", "[role='link']",
    "[role='menuitem']", "[role='option']", "[role='radio']",
    "[role='checkbox']", "[role='switch']"
  ].join(", ");
  const pointer = e => getComputedStyle(e).cursor === "pointer";
  let b = picked.closest(CONTROL);
  if (!b) {
    b = picked;
    while (b.parentElement && b.parentElement !== body
      && pointer(b.parentElement)) b = b.parentElement;
  }

  // The corners the browser draws: each one's radius (px or %, round
  // or elliptical), scaled down together when they overflow the box.
  const CORNERS = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"];
  const radii = e => {
    const q = e.getBoundingClientRect(), s = getComputedStyle(e);
    const px = (t, d) =>
      t.endsWith("%") ? parseFloat(t) * d / 100 : parseFloat(t) || 0;
    const c = CORNERS.map(k => {
      const [x, y = x] = s["border" + k + "Radius"].split(" ");
      return [px(x, q.width), px(y, q.height)];
    });
    const fit = (len, a, b) => (a + b > len ? len / (a + b) : 1);
    const f = Math.min(
      fit(q.width, c[0][0], c[1][0]), fit(q.width, c[3][0], c[2][0]),
      fit(q.height, c[0][1], c[3][1]), fit(q.height, c[1][1], c[2][1]));
    return c.map(([x, y]) => [x * f, y * f]);
  };

  // A corner with no curve of its own takes the curve of what draws
  // it there: a child in that corner (a wrapper was picked), or a
  // parent whose corner it sits in (a segment at the end of a bar).
  const r = b.getBoundingClientRect(), own = radii(b);
  const point = (q, i) => [
    i === 1 || i === 2 ? q.right : q.left, i >= 2 ? q.bottom : q.top];
  const sits = (e, i) => {
    const u = point(e.getBoundingClientRect(), i), v = point(r, i);
    return Math.abs(u[0] - v[0]) < 1.5 && Math.abs(u[1] - v[1]) < 1.5;
  };
  const near = [...b.querySelectorAll("*")];
  for (let e = b.parentElement; e && e !== body; e = e.parentElement) {
    near.push(e);
  }
  const curve = CORNERS.map((k, i) => {
    if (own[i][0] > 0) return own[i];
    for (const e of near) {
      if (!sits(e, i)) continue;
      const c = radii(e)[i];
      if (c[0] > 0) return c;
    }
    return [0, 0];
  });

  // INSIDE OR OUTSIDE. Outside for a control with room around it; an
  // inside ring there reads as the button's own border (2026-09-22).
  // Inside for one flush with its bar's edge or with a neighbour (a
  // segment of a bar of buttons), where an outside ring spills past
  // the bar and cuts into the next segment (2026-10-16, Auro).
  const boxed = e => {
    const s = getComputedStyle(e);
    return s.backgroundColor !== "rgba(0, 0, 0, 0)"
      || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== "none"
      || parseFloat(s.borderTopLeftRadius) > 0;
  };
  let group = b.parentElement;
  while (group && group !== body && !boxed(group)) {
    group = group.parentElement;
  }
  const touches = q => {
    if (!q.width || !q.height) return false;
    const gx = Math.max(q.left - r.right, r.left - q.right);
    const gy = Math.max(q.top - r.bottom, r.top - q.bottom);
    const side = (g, other) => Math.abs(g) <= 1 && other < 0;
    return side(gx, gy) || side(gy, gx);
  };
  const flush = q => ["left", "right", "top", "bottom"]
    .some(k => Math.abs(q[k] - r[k]) < 1.5);
  let tight = !!group && group !== body
    && flush(group.getBoundingClientRect());
  for (let e = b; !tight && e !== group && e.parentElement;
    e = e.parentElement) {
    for (const s of e.parentElement.children) {
      if (s !== e && touches(s.getBoundingClientRect())) tight = true;
    }
  }
  const inside = SIDE === "in" || (SIDE === "auto" && tight);
  const pad = inside ? 0 : GAP + RING;

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
    pointerEvents: "none",
    zIndex: "2147483647"
  });
  // outside, the ring's inner edge runs along the control's curve;
  // inside, its outer edge does
  CORNERS.forEach((k, i) => {
    const [x, y] = curve[i], v = x + pad + "px " + (y + pad) + "px";
    m.style["border" + k + "Radius"] = v;
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
