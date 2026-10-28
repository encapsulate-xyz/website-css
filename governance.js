/* /governance-record — design "Governance Record". Linked from the SITE head, because Super never
   executes a page's own script on a client-side navigation.

   The page is the homepage's 37h given the whole record: an ink count band, the pillars band, the
   controls, and the rows. This file does the three things CSS cannot:

     1. the count band (design "Governance Count Patterns", 2026-10-21) — the record opens on one
        vote and pulls back to every vote, drawn on a canvas from the figure in the band's own
        Notion text and the record's rows (the words stay Notion's; only the drawing is ours);
     2. each row's chain — copied from its Network cell onto the line as a tinted disc and the
        CHAIN · reference line under the title, one stable tint per chain — and the line's two
        targets (the record, handoff 2026-09-26): the left opens the rationale, the right is the
        Proof link;
     3. the search field in the control bar. Super's view picker supplies the chain and outcome
        filters (the record has a view per chain and per outcome), so those are Notion's; an input
        is the one control Notion has no block for. Same recipe as /networks — see CLAUDE.md,
        "Search and sort on a Notion gallery".

   Styles: governance.css, "THE RECORD". */
(function () {
  var BAND = "block-3dde800a513881b1b88dd0b73f874bfe";
  var TABLE = "block-c458e5dd671d4ecb8fc07a15915e4f42";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var HEAD = "block-a9ed1443a36c4f6da5ac9cbae489c031";   // "Four questions before every vote."
  var ASK = "block-3dde800a513881d6815ed26488091143";    // "Ask about a proposal"

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // stable per chain, so a chain keeps its colour between visits and between pages
  function tintFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return TINTS[h % TINTS.length];
  }

  /* ── 1 · the count band ──
     Design "Governance Count Patterns" (W, 2026-10-21): the record opens on one vote and pulls back
     to all of them. The band is 420vh with a sticky stage on ink, and the field is drawn on a canvas:
     one mark per vote, ten to a row, a block per hundred, the blocks spread to fill the stage at rest.
     Four frames, each held for a moment: the record's second-newest vote alone, its face in full
     (K0); it and the votes either side (K1); its block of a hundred (K2); the whole field at rest
     (K3). At K0 and K2 the rest of the field is dimmed around the vote (ALONE0) and the block (ALONE). MOVES are the three zooms between them,
     as fractions of the band's scroll. The figure
     counts up with the scroll and never says more than the votes wholly on screen; the lines beside
     it hold from their threshold (beats) to the next. At rest a hovered block shows its count, mouse
     only. The design's script, ported with its arithmetic unchanged; it draws in the scroll event
     itself, because a frame callback can be held back.

     The words: the kicker, the figure, the last beat and the scroll cue are the band's own
     paragraphs (the figure is site-data's: the votes from before the record plus its rows; the
     number of years in the last beat is rewritten from the newest vote's year). The other beats,
     the tooltip, a mark's place and the band's label are the "Count band copy" toggle; the facts in
     them are the rows'. The newest marks are the record's rows, newest first, each in its network's
     pastel (tintFor, the colour of its disc in the rows below). The votes from before the record
     have no row and so no network on file; they take the design's own seeded draw of the five
     pastels (the user, 2026-10-22: "not all of the dots are colored"), so a colour there says
     "a network", never which. */
  var COUNT = {   // the fallback if the "Count band copy" toggle goes missing
    "one": "This is one vote.",
    "one line": "{vote}, voted {answer} on {date}. Our reason is in the record.",
    "many": "One of many, each judged on its merits.",
    "many line": "{after} came after it and {before} before it. Each got the same scrutiny.",
    "block": "A block is a hundred.",
    "block line": "Each mark is one vote, the newest first. Not one was a formality.",
    "first year": "2020",
    "place": "Vote {n}",
    "tip": "{n} votes",
    "label": "The record: {total} votes, opening on one of them"
  };
  var WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  var MOVES = [[0.06, 0.22], [0.34, 0.6], [0.7, 0.94]];
  var HALF = 9 / 26;            // a mark's radius as a share of the mark pitch
  var OPENED = [17.5, 4.5];     // the second mark, newest first: the opened vote
  var BLOCK0 = [63, 63];        // the middle of the newest block
  var ALONE = 0.14;             // the rest of the field at K2, so the block reads alone (the user, 2026-10-22)
  var ALONE0 = 0.35;            // the votes either side at K0: faint, but their pastels still read (the user, 2026-10-23)
  var MONO_F = "'JetBrains Mono', monospace", OUT_F = "Outfit, sans-serif", HAN_F = "'Hanken Grotesk', sans-serif";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var S = null;                 // the built band: its nodes, its rows and what it last drew

  function fill(s, vals) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in vals ? vals[k] : m; });
  }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function lerp(p, q, t) { return p + (q - p) * t; }
  function voteName(r) { return r.chain + (r.ref ? " " + r.ref : ""); }
  function quoted(why) { return "“" + why + (/[.!?]$/.test(why) ? "" : ".") + "”"; }

  function countCopy() {
    var out = {}, k;
    for (k in COUNT) out[k] = COUNT[k];
    Array.prototype.some.call(document.querySelectorAll(".notion-toggle"), function (t) {
      var s = t.querySelector(".notion-toggle__summary");
      if (!s || !/count band copy/i.test(s.textContent)) return false;
      Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
        var line = p.textContent.trim(), i = line.indexOf("·");
        if (i < 0) return;
        var name = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
        if (name && v) out[name] = v;
      });
      return true;
    });
    return out;
  }

  // the record's rows as the field reads them, newest first (the sort control may have reordered them)
  function cellText(tr, sel) { var c = tr.querySelector(sel); return c ? c.textContent.trim() : ""; }
  function countRows() {
    var box = document.getElementById(TABLE);
    if (!box) return [];
    return Array.prototype.map.call(box.querySelectorAll("tbody tr[data-enc-row]"), function (tr, at) {
      return {
        chain: cellText(tr, 'td[data-enc-cell="chain"]'), ref: cellText(tr, '[data-enc-cell="id"]'),
        vote: cellText(tr, 'td[data-enc-cell="vote"]'), date: cellText(tr, "td.date .date") || cellText(tr, "td.date"),
        title: cellText(tr, "td.title .notion-property__title"), why: cellText(tr, 'td[data-enc-cell="rationale"]'),
        t: +tr.getAttribute("data-enc-t") || 0, at: at
      };
    }).filter(function (r) { return r.chain; }).sort(function (a, b) { return b.t - a.t || a.at - b.at; });
  }

  function count() {
    var band = document.getElementById(BAND);
    if (!band) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    var ps = content ? content.querySelectorAll(":scope > p.notion-text") : [];
    if (ps.length < 5) return;
    var figure = parseInt((ps[1].textContent || "").replace(/[^\d]/g, ""), 10);
    var rs = countRows();
    if (!figure || rs.length < 3) return;
    var sig = [figure, rs.length, rs[0].t, rs[1].title].join("|");
    if (S && S.band === band && S.sig === sig && S.stage.isConnected) return;
    var old = band.querySelector(":scope > .enc-count__stage");
    if (old) old.remove();

    var c = countCopy(), total = Math.max(figure, rs.length), opened = rs[1];
    var said = function (p) { return p.textContent.trim(); };
    // the record's span in years runs from its first year to its newest vote's, so it moves with the record
    var first = parseInt(c["first year"], 10) || 2020;
    var span = (rs[0].t ? new Date(rs[0].t).getFullYear() : parseInt(rs[0].date.slice(-4), 10)) - first;
    var w = String(WORDS[span] || span);
    var years = span === 1 ? "One year" : w.charAt(0).toUpperCase() + w.slice(1) + " years";
    var rest = said(ps[2]).replace(/^[A-Za-z-]+ years?\b/, years);
    var beats = [
      [1, c["one"], fill(c["one line"], { vote: voteName(opened), answer: opened.vote.toLowerCase(), date: opened.date })],
      [2, c["many"], fill(c["many line"], { after: voteName(rs[0]), before: voteName(rs[2]) })],
      [100, c["block"], c["block line"]],
      [total, rest, said(ps[3])]
    ];

    var stage = el("div", "enc-count__stage");
    var cv = el("canvas", "enc-count__canvas");
    cv.setAttribute("aria-hidden", "true");
    var sr = el("div", "enc-count__sr");
    sr.appendChild(el("span", null, opened.title));
    if (opened.why) sr.appendChild(el("span", null, quoted(opened.why)));
    var head = el("div", "enc-count__head"), left = el("div", "enc-count__side"), right = el("div", "enc-count__lines");
    var fig = el("span", "enc-count__fig", fmt(total));
    var hT = el("span", "enc-count__title", beats[3][1]), hL = el("span", "enc-count__line", beats[3][2]);
    left.appendChild(el("span", "enc-count__kicker", said(ps[0])));
    left.appendChild(fig);
    right.setAttribute("aria-live", "polite");
    right.appendChild(hT);
    right.appendChild(hL);
    head.appendChild(left);
    head.appendChild(right);
    var cap = el("div", "enc-count__cue", said(ps[4]));
    var tip = el("div", "enc-count__tip");
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    [cv, sr, head, cap, tip].forEach(function (n) { stage.appendChild(n); });
    band.appendChild(stage);
    band.setAttribute("role", "region");
    band.setAttribute("aria-label", fill(c.label, { total: fmt(total) }));
    band.setAttribute("data-enc-count", "");

    // every mark in its network's pastel, by the row it stands for; past the rows, the design's seeded draw
    var ti = [], sd = 1882;
    var rnd = function () { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
    for (var j = 0; j < total; j++) ti.push(j < rs.length ? TINTS.indexOf(tintFor(rs[j].chain.toLowerCase())) : Math.floor(rnd() * TINTS.length));
    S = { band: band, sig: sig, stage: stage, cv: cv, head: head, fig: fig, hT: hT, hL: hL, cap: cap, tip: tip,
      rows: rs, ti: ti, total: total, nb: Math.ceil(total / 100), beats: beats, frames: [1, 3, 100, total],
      cue: said(ps[4]), copy: c, rm: reduce.matches, cols: 0, px: 140, py: 140, pos: null, mW: 0, mH: 0, L: null,
      n: null, beat: null, view: null, ptr: null, tipB: -1, idle: false, glyphs: {} };
    if (S.rm) tip.style.transition = "none";
    // the glyphs of the faces the first frames show (the opened vote, either side, the row below)
    [0, 1, 2, 10, 11, 12].forEach(function (j) { if (rs[j]) glyphImg(rs[j].chain); });
    listen();
    countDraw();
    requestAnimationFrame(countDraw);
    // a page loaded hidden has no frames and may have no size yet, so retry until the stage is measured
    [0, 100, 300, 1000, 2500].forEach(function (ms) { setTimeout(function () { if (S && !S.L) countDraw(); }, ms); });
    // the header sets the stage and the faces are set in these fonts, so measure and draw again once they load
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S) { S.mW = 0; S.idle = false; countDraw(); } });
  }

  var listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener("scroll", countDraw, { passive: true });
    window.addEventListener("resize", countDraw);
    window.addEventListener("wheel", countWheel, { passive: false });
    // the block tooltip answers a mouse only; every draw re-tests it, so it holds through a scroll
    window.addEventListener("pointermove", function (e) {
      if (!S || (e.pointerType && e.pointerType !== "mouse")) return;
      S.ptr = [e.clientX, e.clientY];
      countHover();
    }, { passive: true });
    var off = function (e) { if (S && (!e || !e.relatedTarget)) { S.ptr = null; countHover(); } };
    document.addEventListener("mouseout", off);
    window.addEventListener("blur", off);
  }

  // a glyph for a face: the chain's mark from the page's galleries, at Super's 384px
  function glyphImg(chain) {
    var k = key(chain);
    if (S.glyphs[k]) return S.glyphs[k];
    var url = glyphs()[k];
    if (!url) return null;
    var im = new Image();
    im.onload = function () { if (S) { S.idle = false; countDraw(); } };
    im.src = sized(url, 384);
    S.glyphs[k] = im;
    return im;
  }

  // a block is 126 across (ten marks of 9 at a pitch of 13); px and py are the block pitch, gap included
  function fieldAt(c, total, px, py) {
    var out = [];
    for (var k = 0; k < total; k++) {
      var b = Math.floor(k / 100), i = k % 100;
      out.push([(b % c) * px + (i % 10) * 13 + 4.5, Math.floor(b / c) * py + Math.floor(i / 10) * 13 + 4.5]);
    }
    return out;
  }

  /* One gesture, one count (the user, 2026-10-22: "it stop at 1 and then only scroll past 1 if the person
     scroll again", and the same at 3, 100 and the total). The frames were only held stretches of the run
     — 6% at 1, 12% at 3, 10% at 100, 6% at the total before the band ends — so a swipe a hold happened to
     swallow seemed to stop, a longer one ran through, and at the total it ran on into the page. Now a
     wheel or trackpad gesture that starts within a screen and a half of the run is ours from its first
     event: its deltas move the page as before (the zoom still follows the finger), but on reaching a count
     it stops at the far end of that count's hold, and the rest of the gesture (a trackpad's momentum) is
     swallowed. The next gesture moves on: from above the band it stops at 1, past the total it leaves the
     band. A gesture that starts inside a hold starts from its edge, so it moves the picture at once.
     Taking the gesture from its first event is what makes it stoppable: Chrome lets a page cancel the rest
     of a gesture only when it cancelled the first. The new-gesture test is home.js's (a pause, or a fresh
     rise once the swipe has decayed). Touch, keys and the scrollbar scroll freely; reduced motion has no
     counts to stop at. */
  var NEW_GAP = 250, MIN_LOCK = 450;
  var G = { last: 0, own: false, locked: false, at: 0, peak: 0, min: Infinity, decayed: false, vy: 0, until: 0 };
  // the holds in page pixels: before the first move, between the moves, after the last
  function countHolds() {
    var rc = S.band.getBoundingClientRect(), run = rc.height - window.innerHeight;
    if (run <= 0) return null;
    var top = window.scrollY + rc.top, out = [], from = 0;
    MOVES.forEach(function (m) { out.push([top + from * run, top + m[0] * run]); from = m[1]; });
    out.push([top + from * run, top + run]);
    return out;
  }
  function countWheel(e) {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;   // pinch-zoom, sideways
    var now = performance.now(), abs = Math.abs(e.deltaY), fresh = now - G.last > NEW_GAP, H;
    G.last = now;
    if (!fresh && G.locked) {
      G.peak = Math.max(G.peak, abs);
      if (abs < G.peak * 0.5) G.decayed = true;
      fresh = G.decayed && now - G.at > MIN_LOCK && abs > Math.max(G.min * 4, 20);
      if (G.decayed) G.min = Math.min(G.min, abs);
      if (!fresh) { e.preventDefault(); return; }
    }
    if (fresh) {
      H = S && S.stage.isConnected && !S.rm ? countHolds() : null;
      var y0 = now < G.until ? G.vy : window.scrollY, vh = window.innerHeight;
      G.own = !!H && y0 > H[0][0] - 1.5 * vh && y0 < H[H.length - 1][1] + 1.5 * vh;
      G.locked = false; G.vy = y0; G.peak = abs; G.min = Infinity; G.decayed = false;
    }
    if (!G.own) return;
    if (!S || !S.stage.isConnected || !(H = H || countHolds())) { G.own = false; return; }
    e.preventDefault();
    var dir = e.deltaY > 0 ? 1 : -1, y = G.vy, base = y, stop = null, i;
    var dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
    for (i = 0; i < H.length; i++) if (y >= H[i][0] - 2 && y <= H[i][1] + 2) base = dir > 0 ? H[i][1] : H[i][0];
    var go = base + dy;
    // a stop is a pixel inside its hold: on its very edge the figure read 99 for 100, the scroll rounding short
    if (dir > 0) { for (i = 0; i < H.length; i++) if (H[i][0] > base + 2) { if (go >= H[i][0]) stop = Math.floor(H[i][1]) - 1; break; } }
    else { for (i = H.length - 1; i >= 0; i--) if (H[i][1] < base - 2) { if (go <= H[i][1]) stop = Math.ceil(H[i][0]) + 1; break; } }
    if (stop !== null) { go = stop; G.locked = true; G.at = now; }
    go = Math.max(0, Math.min(go, document.documentElement.scrollHeight - window.innerHeight));
    // a mouse wheel's notch is a big step: let the browser ease it, as it would have
    var smooth = Math.abs(dy) >= 60 && !G.locked;
    G.vy = go; G.until = smooth ? now + 600 : 0;
    window.scrollTo({ top: go, behavior: smooth ? "smooth" : "instant" });
  }

  // 0 at the top of the band, 1 once it has scrolled its extra screens
  function countProgress() {
    var rc = S.band.getBoundingClientRect(), max = rc.height - window.innerHeight;
    return max > 0 ? clamp01(-rc.top / max) : 0;
  }

  function countMeasure(vw, vh) {
    S.mW = vw; S.mH = vh;
    // the header at its tallest beat, each with the widest figure, so the stage under it holds still while
    // the story turns over; the figure keeps the total's width, so the count never moves the words beside it
    var head = S.head, fig = S.fig, hh = head.offsetHeight, region = S.hT.parentNode;
    region.setAttribute("aria-live", "off");
    fig.style.minWidth = "";
    fig.textContent = fmt(S.total);
    fig.style.minWidth = (fig.offsetWidth + 1) + "px";
    S.beats.forEach(function (b) { S.hT.textContent = b[1]; S.hL.textContent = b[2]; hh = Math.max(hh, head.offsetHeight); });
    region.setAttribute("aria-live", "polite");
    S.beat = null; S.n = null;
    // under the header, clear of the comma's tail (it hangs below the figure's line box), is the stage;
    // the field rests on the header's left edge
    var fsz = parseFloat(getComputedStyle(fig).fontSize) || 120;
    var clear = head.offsetTop + hh + 0.2 * fsz, top = clear + 8;
    var bottom = vh - Math.max(20, Math.min(56, vh * 0.05)), room = Math.max(120, bottom - top);
    var m = Math.max(20, Math.min(64, vw * 0.04)), wide = vw - 2 * m;
    // the field at rest always spans the stage, margin to margin (the user, 2026-10-22: "dots always take
    // the full width ... so that screen always looks full"): for each number of blocks to a row, the
    // largest marks that keep the design's 14 between blocks, then the gaps between blocks opened until the
    // field meets both margins, and between rows (up to twice the 14) to fill the height. The largest
    // marks win, a gap past twice the design's counting against them and fewer empty places in the last
    // row breaking a near tie; what is left of the height is shared above and below
    var fit = null;
    for (var c = 2; c <= Math.max(12, S.nb); c++) {
      var rows = Math.ceil(S.nb / c);
      var ff = Math.min(wide / (c * 126 + (c - 1) * 14), room / (rows * 126 + (rows - 1) * 14));
      var gx = (wide / ff - c * 126) / (c - 1);
      var gy = rows > 1 ? Math.min(28, (room / ff - rows * 126) / (rows - 1)) : 14;
      var score = ff * Math.sqrt(Math.min(1, 28 / gx)) * (1 - 0.03 * (c * rows - S.nb));
      if (!fit || score > fit.score) fit = { c: c, px: 126 + gx, py: 126 + gy, fh: rows * 126 + (rows - 1) * gy, ff: ff, score: score };
    }
    if (fit.c !== S.cols || fit.px !== S.px || fit.py !== S.py) {
      S.cols = fit.c; S.px = fit.px; S.py = fit.py; S.pos = fieldAt(fit.c, S.total, fit.px, fit.py);
    }
    var f = fit.ff, ox = m, oy = top + (room - fit.fh * f) / 2, cx = vw / 2, cy = top + room / 2;
    // K1, as a mark pitch: the opened mark and the one either side whole, the next one past the edge and
    // the row below off the bottom (on a portrait screen the rows below show too, with their own faces)
    var P1 = Math.min(vw / (2 * (1 + HALF)), Math.max(vw / (2 * (2 - HALF)), (vh - cy) / (1 - HALF)), room / (2 * HALF));
    // K0: the opened mark big enough for its whole face (about 400px) and a clear step past K1
    var room0 = bottom - clear, cy0 = clear + room0 / 2;
    var D0 = Math.min(room0, wide, Math.max(400, 1.3 * 2 * HALF * P1));
    var D1 = Math.min(2 * HALF * P1, D0 / 1.3), s0 = D0 / (9 * f);
    // K2: the newest block filling most of the stage
    var blk = 0.86 * Math.min(room, wide);
    var capH = S.cap.offsetHeight || 12;
    // the scroll cue is centred in the dark gap under the opened vote, clear of the row below as it peeks in
    S.L = { f: f, cx: cx, cy: cy, m: m, clearY: clear,
      cueX: cx, cueY: Math.min(cy0 + 0.722 * D0 - capH / 2, vh - capH - 12), K: [
        // every frame is framed on the stage's centre; K0 is centred higher, so its point moves to match
        [OPENED[0], OPENED[1] + (cy - cy0) / (f * s0), s0], [OPENED[0], OPENED[1], D1 / (9 * f)],
        [BLOCK0[0], BLOCK0[1], blk / (126 * f)], [(cx - ox) / f, (cy - oy) / f, 1]] };
  }

  function countDraw() {
    if (!S) return;
    if (!S.stage.isConnected) { S = null; return; }
    // nothing to draw while the band is off the screen, once it has been drawn there
    var rc = S.band.getBoundingClientRect(), away = rc.bottom <= 0 || rc.top >= window.innerHeight;
    if (away && S.idle) return;
    S.idle = away;
    var cv = S.cv, vw = cv.clientWidth, vh = cv.clientHeight;
    if (!vw || !vh) return;
    if (vw !== S.mW || vh !== S.mH) countMeasure(vw, vh);
    var L = S.L, dpr = window.devicePixelRatio || 1, total = S.total, pos = S.pos, j;
    if (cv.width !== Math.round(vw * dpr) || cv.height !== Math.round(vh * dpr)) { cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); }
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    var p = S.rm ? 1 : countProgress();
    // held at frame i, or in the move out of it; eased, so each frame settles before the next
    var i = 0, e = 0;
    for (; i < MOVES.length; i++) {
      if (p < MOVES[i][0]) break;
      if (p <= MOVES[i][1]) { var u = (p - MOVES[i][0]) / (MOVES[i][1] - MOVES[i][0]); e = u * u * (3 - 2 * u); break; }
    }
    var A = L.K[i], B = L.K[Math.min(L.K.length - 1, i + 1)];
    var s = Math.exp(Math.log(A[2]) + (Math.log(B[2]) - Math.log(A[2])) * e);
    // a move is a zoom about the one point of the field that holds still between its two frames
    var qx = A[0], qy = A[1], sx = L.cx, sy = L.cy;
    if (Math.abs(A[2] - B[2]) > 1e-6) {
      qx = (A[0] * A[2] - B[0] * B[2]) / (A[2] - B[2]); qy = (A[1] * A[2] - B[1] * B[2]) / (A[2] - B[2]);
      sx = L.cx + (qx - A[0]) * L.f * A[2]; sy = L.cy + (qy - A[1]) * L.f * A[2];
    }
    var k = L.f * s, d = 9 * k, r = d / 2, xs = [], ys = [];
    for (j = 0; j < total; j++) { xs.push(sx + (pos[j][0] - qx) * k); ys.push(sy + (pos[j][1] - qy) * k); }
    S.view = { sx: sx, sy: sy, qx: qx, qy: qy, k: k, rest: S.rm || p >= MOVES[2][1] };
    var seen = function (j) { return xs[j] + r >= 0 && xs[j] - r <= vw && ys[j] + r >= 0 && ys[j] - r <= vh; };
    // at K0 the opened vote stands alone, at K2 the newest block: the rest of the field is dimmed and comes
    // back early in the move out of the frame, before the figure counts it. K2's dimming starts with the zoom
    // to the block, while none of the rest is on the screen yet. lo..hi are the marks in focus.
    var iso0 = S.rm ? 0 : 1 - clamp01((p - MOVES[0][0]) / (0.35 * (MOVES[0][1] - MOVES[0][0])));
    var iso2 = S.rm ? 0 : Math.min(clamp01((p - MOVES[1][0]) / (0.1 * (MOVES[1][1] - MOVES[1][0]))),
      1 - clamp01((p - MOVES[2][0]) / (0.35 * (MOVES[2][1] - MOVES[2][0]))));
    var iso = Math.max(iso0, iso2), lo = iso0 > 0 ? 1 : 0, hi = iso0 > 0 ? 2 : Math.min(100, total);
    var others = 1 - iso * iso * (3 - 2 * iso) * (1 - (iso0 > 0 ? ALONE0 : ALONE));
    var focus = function (j) { return j >= lo && j < hi; };
    // every mark in its network's pastel, one path per pastel: the marks in focus, then the rest
    for (var g = 0; g < 2; g++) {
      ctx.globalAlpha = g ? others : 1;
      for (var c = 0; c < TINTS.length; c++) {
        ctx.fillStyle = TINTS[c];
        ctx.beginPath();
        for (j = 0; j < total; j++) {
          if (S.ti[j] !== c || focus(j) === (g === 1) || !seen(j)) continue;
          ctx.moveTo(xs[j] + r, ys[j]);
          ctx.arc(xs[j], ys[j], r, 0, 6.2832);
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // from the first frame every mark big enough to read says what it is: the opened vote in full, the
    // votes either side as far as they are on screen
    var lab = S.rm ? 0 : clamp01((d - 96) / 20);
    var k0 = S.rm ? 0 : 1 - clamp01((p - MOVES[0][0]) / (0.4 * (MOVES[0][1] - MOVES[0][0])));
    if (lab > 0.01) {
      for (j = 0; j < total; j++) if (seen(j)) face(ctx, xs[j], ys[j], d, j, lab * (focus(j) ? 1 : others), L.m, vw - L.m, k0);
      ctx.globalAlpha = 1;
    }
    // the figure counts up with the scroll: each held frame reads its own number, a move climbs between
    // them at the zoom's own rate, and it never says more than the votes wholly on screen
    var vis = 0;
    for (j = 0; j < total; j++) if ((focus(j) || others > 0.5) && xs[j] - r >= -0.5 && xs[j] + r <= vw + 0.5 && ys[j] - r >= -0.5 && ys[j] + r <= vh + 0.5) vis++;
    var F = S.frames, last = F.length - 1, at = Math.min(i, last);
    var goal = e > 0 && i < last ? Math.exp(Math.log(F[i]) + (Math.log(F[i + 1]) - Math.log(F[i])) * e) : F[at];
    var n = S.rm ? total : Math.max(1, Math.min(Math.floor(goal + 1e-6), vis));
    if (n !== S.n) { S.n = n; S.fig.textContent = fmt(n); }
    // each line holds from its threshold to the next
    var beat = 0;
    while (beat < S.beats.length - 1 && n >= S.beats[beat + 1][0]) beat++;
    if (beat !== S.beat) { S.beat = beat; S.hT.textContent = S.beats[beat][1]; S.hL.textContent = S.beats[beat][2]; }
    // the caption is the scroll cue, in the first frame only; the field at rest carries no legend
    var cap = S.cap;
    if (cap.textContent !== S.cue) cap.textContent = S.cue;
    cap.style.left = L.cueX.toFixed(1) + "px";
    cap.style.top = L.cueY.toFixed(1) + "px";
    cap.style.transform = "translateX(-50%)";
    cap.style.opacity = beat === 0 ? "1" : "0";
    countHover();
  }

  /* A mark big enough to read carries a face, drawn to its own size and set inside its circle: the
     chain's glyph, which vote it is (Outfit), its date (mono), the opened vote's title and our reason,
     and our answer in an ink pill. Detail comes in by size, and every line is wrapped to the circle at
     its height. A face is centred on its disc; one that would run past the page margin fades rather
     than being cut by the screen edge. A mark with no row (a vote from before the record) gives only
     its place. */
  function spacing(ctx, px) { try { ctx.letterSpacing = px.toFixed(2) + "px"; } catch (e) {} }
  function setF(ctx, wt, px, fam, tr) { ctx.font = wt + " " + px.toFixed(2) + "px " + fam; spacing(ctx, tr * px); }
  function wrapTo(ctx, text, w) {
    var out = [], cur = "";
    text.split(" ").forEach(function (wd) {
      var t = cur ? cur + " " + wd : wd;
      if (cur && ctx.measureText(t).width > w) { out.push(cur); cur = wd; } else cur = t;
    });
    if (cur) out.push(cur);
    return out;
  }
  function pillPath(ctx, x, y, w, h) {
    var r = h / 2;
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, Math.PI / 2, 1.5 * Math.PI); ctx.closePath();
  }
  function face(ctx, x, y, d, j, a, bx0, bx1, k0) {
    var r = d / 2, pad = 0.07 * d;
    // room(yy) is the circle's width at height yy
    var room = function (yy) { return Math.max(0, 2 * (Math.sqrt(Math.max(0, r * r - yy * yy)) - pad)); };
    var row = j < S.rows.length ? S.rows[j] : null;
    var name = row ? voteName(row) : fill(S.copy.place, { n: fmt(S.total - j) });
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#000";
    // the name at a share of the disc (smaller in the full setting, bolder in the compact one), shrunk to the room
    var nameAt = function (full) {
      var s = Math.min(46, d * lerp(0.115, 0.074, full));
      setF(ctx, 600, s, OUT_F, -0.03);
      var w = ctx.measureText(name).width, cap = 0.94 * room(0);
      if (w > cap) { s *= cap / w; w = cap; }
      return { s: s, w: w };
    };
    // k0 is 1 in the first frame and 0 a little into the first move. Over it one setting glides into the
    // other: the opened vote's title and reason close like a blind as they fade, the date opens in their
    // place, and the glyph and the name grow from the full setting to the compact one
    var e = k0 * k0 * (3 - 2 * k0);
    // the first frame is the opened vote's alone: the votes either side are plain discs until the pull-back
    var onScreen = function (w) { return clamp01(1 + Math.min(x - w / 2 - bx0, bx1 - x - w / 2) / 24) * (j === 1 ? 1 : 1 - k0); };
    if (!row) {
      var n0 = nameAt(e);
      setF(ctx, 600, n0.s, OUT_F, -0.03);
      ctx.globalAlpha = a * onScreen(n0.w);
      ctx.fillText(name, x, y);
      spacing(ctx, 0);
      return;
    }
    var ms = Math.max(9, Math.min(13, 0.031 * d)), ts = Math.max(15, Math.min(26, 0.052 * d)), rs = Math.max(12, Math.min(16, 0.035 * d)), ph = 2.2 * ms;
    var vDate = clamp01((d - 190) / 30), vPill = clamp01((d - 120) / 30);
    var date = row.date.toUpperCase(), ans = row.vote.toUpperCase(), why = quoted(row.why);
    setF(ctx, 500, ms, MONO_F, 0.12);
    var dw = ctx.measureText(date).width, pw = ctx.measureText(ans).width + 2.4 * ms;
    var widest = function (ls) { return Math.max.apply(null, [1].concat(ls.map(function (l) { return ctx.measureText(l).width; }))); };
    // a closing title or reason is clipped to its slot, so it is measured by the slot
    var isText = function (o) { return o.k === "title" || o.k === "why"; };
    var ext = function (o) { return Math.max(Math.abs(o.top), Math.abs(o.top + (isText(o) ? o.h : o.full))); };
    // one setting of the face, and the largest scale at which every line fits the circle at its height; a
    // closing setting keeps the full setting's line breaks, so nothing reflows as it closes
    var layout = function (full, vT, vW, keep) {
      var g = Math.min(92, d * lerp(0.2, 0.11, full)), n = nameAt(full);
      var wT = Math.min(0.66 * d, room(0)), wR = Math.min(0.7 * d, room(0)), items = [], lT = [], lW = [];
      // the date steps aside for the title: on the opened vote the header gives it
      var vD = vDate * (1 - vT);
      var add = function (k, h, v, gap, w, lines) { if (v > 0.001) items.push({ k: k, full: h, h: h * v, v: v, gap: gap * v, w: w, lines: lines }); };
      for (var pass = 0; pass < (keep ? 1 : 2); pass++) {
        items = [];
        add("glyph", g, 1, 0.035 * d, g);
        add("name", 0.96 * n.s, 1, lerp(0.03, 0.016, vD) * d, n.w);
        add("date", 1.3 * ms, vD, 0.032 * d, dw);
        if (vT > 0.001) { setF(ctx, 500, ts, OUT_F, -0.02); lT = keep ? keep.lT : wrapTo(ctx, row.title, wT); add("title", lT.length * 1.16 * ts, vT, 0.028 * d, widest(lT), lT); }
        if (vW > 0.001) { setF(ctx, 400, rs, HAN_F, 0); lW = keep ? keep.lW : wrapTo(ctx, why, wR); add("why", lW.length * 1.45 * rs, vW, 0.038 * d, widest(lW), lW); }
        add("pill", ph, vPill, 0, pw);
        var H = 0;
        items.forEach(function (o, i) { H += o.h + (i < items.length - 1 ? o.gap : 0); });
        var t = -H / 2;
        items.forEach(function (o, i) { o.top = t; t += o.h + (i < items.length - 1 ? o.gap : 0); });
        // then rewrap the title and the reason to the circle's width at their own height
        items.forEach(function (o) { if (o.k === "title") wT = Math.min(wT, room(ext(o))); if (o.k === "why") wR = Math.min(wR, room(ext(o))); });
      }
      var fits = function (s) { return items.every(function (o) { return o.w * s <= room(s * ext(o)) + 0.5; }); };
      var sc = 1;
      if (!fits(1)) {
        var a0 = 0.3, a1 = 1;
        for (var q = 0; q < 9; q++) { var mid = (a0 + a1) / 2; if (fits(mid)) a0 = mid; else a1 = mid; }
        sc = a0;
      }
      return { items: items, sc: sc, g: g, ns: n.s, lT: lT, lW: lW };
    };
    // the title and the reason are the opened vote's, and come in only where the face still fits whole
    // with them, so a tight disc keeps its name and answer at full size
    var focus = j === 1;
    var fT = focus && row.title && layout(1, 1, 0).sc >= 0.92 ? 1 : 0;
    var fW = fT && row.why && layout(1, 1, 1).sc >= 0.92 ? 1 : 0;
    var whole = layout(1, fT, fW), C = e >= 0.999 ? whole : layout(e, fT * e, fW * e, whole);
    var items = C.items, sc = C.sc, g = C.g, ns = C.ns;
    var fa = a * clamp01((sc - 0.45) / 0.15) * onScreen(sc * Math.max.apply(null, items.map(function (o) { return o.w; })));
    if (fa < 0.01) { spacing(ctx, 0); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    items.forEach(function (o) {
      // a fading line is gone by the time its slot is half closed (the date, a third), so it never sits on its neighbours
      var al = fa * (o.k === "glyph" || o.k === "name" ? 1 : o.k === "date" ? clamp01(3 * o.v - 2) : clamp01(2 * o.v - 1));
      if (al < 0.01) return;
      ctx.globalAlpha = al; ctx.fillStyle = "#000";
      var mid = o.top + o.h / 2;
      if (o.k === "glyph") {
        // a glyph file is a 600px frame with the mark's longest side at 288, so the frame is drawn at g / 0.48
        var im = glyphImg(row.chain);
        if (im && im.complete && im.naturalWidth) { var gb = g / 0.48; ctx.drawImage(im, -gb / 2, mid - gb / 2, gb, gb); }
      } else if (o.k === "name") { setF(ctx, 600, ns, OUT_F, -0.03); ctx.fillText(name, 0, mid); }
      else if (o.k === "pill") {
        setF(ctx, 500, ms, MONO_F, 0.12); pillPath(ctx, -pw / 2, mid - ph / 2, pw, ph); ctx.fill();
        ctx.fillStyle = "#FAFAF8"; ctx.fillText(ans, 0.06 * ms, mid);
      } else {
        ctx.save(); ctx.beginPath(); ctx.rect(-d, o.top, 2 * d, o.h); ctx.clip();
        if (o.k === "date") { setF(ctx, 500, ms, MONO_F, 0.12); ctx.fillText(date, 0.06 * ms, mid); }
        else {
          var lh = o.k === "title" ? 1.16 * ts : 1.45 * rs;
          if (o.k === "title") setF(ctx, 500, ts, OUT_F, -0.02); else { setF(ctx, 400, rs, HAN_F, 0); ctx.fillStyle = "#3A3D38"; }
          o.lines.forEach(function (ln, i) { ctx.fillText(ln, 0, o.top + (i + 0.5) * lh); });
        }
        ctx.restore();
      }
    });
    ctx.restore(); spacing(ctx, 0);
  }

  /* At rest the field answers a hover on a block with its count, in the house tooltip (paper on the
     ink), 8px above the block, or under it where the header is in the way. Mouse only; the cursor
     stays an arrow and nothing else changes (a recorded exception in the design). */
  function countHover() {
    if (!S) return;
    var tip = S.tip, v = S.view, pt = S.ptr, cv = S.cv;
    var b = -1, bx = 0, by = 0, bh = 0;
    if (v && v.rest && pt && cv.clientWidth && S.cols) {
      var rc = cv.getBoundingClientRect(), z = rc.width / cv.clientWidth;
      var px = (pt[0] - rc.left) / z, py = (pt[1] - rc.top) / z;
      if (px >= 0 && py >= 0 && px <= cv.clientWidth && py <= cv.clientHeight) {
        // each block owns half the gap around it, so moving between blocks never drops the tooltip
        var u = v.qx + (px - v.sx) / v.k, w = v.qy + (py - v.sy) / v.k, hx = (S.px - 126) / 2, hy = (S.py - 126) / 2;
        var col = Math.floor((u + hx) / S.px), row = Math.floor((w + hy) / S.py), i = row * S.cols + col;
        if (u >= -hx && w >= -hy && col < S.cols && i < S.nb) {
          var n = Math.min(100, S.total - i * 100);
          bx = col * S.px; by = row * S.py; bh = Math.ceil(n / 10) * 13 - 4;
          if (u <= bx + Math.min(n, 10) * 13 - 4 + hx && w <= by + bh + hy) b = i;
        }
      }
    }
    if (b >= 0) {
      if (b !== S.tipB) tip.textContent = fill(S.copy.tip, { n: Math.min(100, S.total - b * 100) });
      var x = v.sx + (bx + 63 - v.qx) * v.k, top = v.sy + (by - v.qy) * v.k;
      var above = top - 8 - tip.offsetHeight >= S.L.clearY;
      tip.style.left = x.toFixed(1) + "px";
      tip.style.top = (above ? top - 8 : v.sy + (by + bh - v.qy) * v.k + 8).toFixed(1) + "px";
      tip.style.transform = above ? "translate(-50%, -100%)" : "translate(-50%, 0)";
    }
    S.tipB = b;
    tip.style.opacity = b >= 0 ? "1" : "0";
  }

  /* ── 2 · the rows ──
     Two tables are views of the Governance Record database — the record here, and the homepage's
     37h table with its six latest votes — and since 2026-09-26 both are built here and drawn by
     main.css §13d, so the two cannot drift. `limit` is how many rows the page shows (home.css hides
     the rest); only those are built, or the homepage would fetch a glyph for every hidden vote. */
  var HOME_TABLE = "block-4529386b39be4a9aa44d2dbac56537bd";
  var ROW_TABLES = [[TABLE, 0], [HOME_TABLE, 6]];

  /* Which column is which, read off the header. Notion's type classes cannot answer it any more:
     Proposal Id became rich text on 2026-09-17 (it holds "ACP-176" now), so the id, the rationale
     and the proof are all td.text. The header carries the property's name, which is ours to know. */
  var COLUMN_KIND = {
    "proposal title": "proposal", "proposal": "proposal", "name": "proposal",
    "proposal id": "id", "id": "id", "reference": "id",
    "chain": "chain", "network": "chain",
    "vote option": "vote", "our vote": "vote", "vote": "vote",
    "voted on": "date", "recorded": "date", "date": "date",
    "voting proof": "proof", "proof": "proof",
    "rationale": "rationale", "why": "rationale"
  };
  function columns(box) {
    return Array.prototype.map.call(box.querySelectorAll("thead th"), function (th) {
      return COLUMN_KIND[th.textContent.trim().toLowerCase()] || "";
    });
  }

  /* A header the map does not know (a property renamed in Notion) still leaves the chain findable:
     Super gives every property a stable class of its own (property-<hash>), so the select column
     whose values match the chains we hold marks for is the chain column. */
  var chainProp = null;
  function learnChainProp(box) {
    if (chainProp) return chainProp;
    var marks = glyphs(), tally = {};
    Array.prototype.forEach.call(box.querySelectorAll("tbody tr td.select .notion-property"), function (p) {
      var cls = (p.className.match(/property-[0-9a-f]+/) || [])[0];
      var t = p.textContent.trim();
      if (!cls || !t) return;
      if (marks[key(t)]) tally[cls] = (tally[cls] || 0) + 1;
    });
    var best = null;
    Object.keys(tally).forEach(function (c) { if (!best || tally[c] > tally[best]) best = c; });
    chainProp = best;
    return best;
  }
  function chainCell(tr, box) {
    var c = tr.querySelector('td[data-enc-cell="chain"]');
    if (c) return c;
    var prop = learnChainProp(box);
    var p = prop && tr.querySelector("td.select ." + prop);
    return p ? p.closest("td") : null;
  }

  var whyId = 0;
  function setOpen(tr, on) {
    if (on) tr.setAttribute("data-enc-open", ""); else tr.removeAttribute("data-enc-open");
    var b = tr.querySelector(".enc-rec__open");
    if (!b) return;
    b.setAttribute("aria-expanded", on ? "true" : "false");
    b.setAttribute("aria-label", (on ? "Hide" : "Read") + " the rationale for " + b.getAttribute("data-title"));
  }
  // one row open at a time, in its own table
  function toggle(tr) {
    var was = tr.hasAttribute("data-enc-open");
    var box = tr.closest("[data-enc-rows]");
    if (box) Array.prototype.forEach.call(box.querySelectorAll("tr[data-enc-open]"), function (o) { setOpen(o, false); });
    if (!was) setOpen(tr, true);
  }

  // the chain's disc; the glyph goes in as soon as the page has one (a gallery can render late)
  /* a glyph for a 30px disc or a 22px mark: Super's optimizer at 96px (646 bytes for Terra against
     the 21.8KB original the homepage's discs loaded since v304; sharp at 3x) */
  function sized(url, w) {
    if (!/^https:\/\/assets\.super\.so\//.test(url)) return url;
    return "/_next/image?url=" + encodeURIComponent(url) + "&w=" + w + "&q=75";
  }
  function small(url) { return sized(url, 96); }
  function fillDisc(disc, name) {
    if (disc.querySelector("img")) return true;
    var url = glyphs()[key(name)];
    if (!url) return false;
    var img = el("img");
    img.src = small(url); img.alt = ""; img.loading = "lazy";
    disc.appendChild(img);
    return true;
  }

  var bare = false;       // a disc still waiting for its glyph after this pass
  function rows() {
    bare = false;
    ROW_TABLES.forEach(function (t) {
      var box = document.getElementById(t[0]);
      if (box && box.querySelector("tbody tr")) buildRows(box, t[1]);
    });
  }

  function buildRows(box, limit) {
    var kinds = columns(box);
    var trs = Array.prototype.slice.call(box.querySelectorAll("tbody tr"));
    if (limit) trs = trs.slice(0, limit);
    trs.forEach(function (tr) {
      var cell = tr.querySelector("td.title");
      if (!cell) return;
      var built = cell.querySelector(".enc-rec__mark-disc");
      if (built) {
        if (!fillDisc(built, built.getAttribute("data-chain") || "")) bare = true;
        return;
      }
      // every cell says what it is, so the row's layout never depends on the column order
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (td.hasAttribute("data-enc-cell")) return;
        if (kinds[i]) td.setAttribute("data-enc-cell", kinds[i]);
      });
      var chain = chainCell(tr, box);
      if (!chain) return;
      chain.setAttribute("data-enc-chain", "");
      chain.setAttribute("data-enc-cell", "chain");
      // the proof is the text cell that carries a link, the rationale is the other one
      Array.prototype.forEach.call(tr.children, function (td) {
        if (td.hasAttribute("data-enc-cell")) return;
        if (td.classList.contains("title")) td.setAttribute("data-enc-cell", "proposal");
        else if (td.classList.contains("date")) td.setAttribute("data-enc-cell", "date");
        else if (td.classList.contains("select")) td.setAttribute("data-enc-cell", "vote");
        else if (td.querySelector("a[href]")) td.setAttribute("data-enc-cell", "proof");
        else td.setAttribute("data-enc-cell", "rationale");
      });
      var name = chain.textContent.trim();
      if (!name) return;
      var disc = el("span", "enc-rec__mark-disc");
      disc.style.background = tintFor(name.toLowerCase());
      disc.setAttribute("data-chain", name);
      if (!fillDisc(disc, name)) bare = true;
      cell.insertBefore(disc, cell.firstChild);
      // the file's line under the title: CHAIN · reference, as one line (the reference cell itself
      // is hidden by the CSS)
      var meta = el("span", "enc-rec__meta");
      meta.appendChild(el("span", "enc-rec__chain", name));
      var ref = tr.querySelector('[data-enc-cell="id"]');
      var refText = ref ? ref.textContent.trim() : "";
      if (refText) {
        meta.appendChild(el("span", "enc-rec__sep", " · "));
        meta.appendChild(el("span", "enc-rec__ref", refText));
      }
      cell.appendChild(meta);

      // the vote, by its word: Notion's option colours are not the file's dots (No is pink there)
      var vote = tr.querySelector('td[data-enc-cell="vote"]');
      var said = vote ? vote.textContent.trim() : "";
      if (vote && said) vote.setAttribute("data-vote", said.toLowerCase().replace(/\s+/g, "-"));

      // the date as the file prints it, "Sep 11, 2026"; the day itself is kept for the sort
      var day = tr.querySelector("td.date .date") || tr.querySelector("td.date");
      if (day) {
        var full = day.textContent.trim();
        var t = Date.parse(full);
        if (!isNaN(t)) tr.setAttribute("data-enc-t", String(t));
        var short = full.replace(/^([A-Z][a-z]{2})[a-z]+(?=\s)/, "$1");
        if (short !== full) day.textContent = short;
      }

      /* The line is two targets (the file's record): the left opens the rationale beneath it, the
         right is the Proof link. Notion has no block that opens and closes, so the left is a
         button laid over the mark, the title and CHAIN · reference; its label is the row's title.
         A view that does not show Rationale gets neither the button nor the ±. */
      var title = (cell.querySelector(".notion-property__title") || {}).textContent || "";
      title = title.trim() || "this proposal";
      var why = tr.querySelector('td[data-enc-cell="rationale"]');
      if (why) {
        var plus = el("span", "enc-rec__plus");
        plus.setAttribute("aria-hidden", "true");
        plus.innerHTML = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 10h10"/><path class="v" d="M10 5v10"/></svg>';
        cell.appendChild(plus);
        why.id = why.id || "enc-why-" + (++whyId);
        var open = el("button", "enc-rec__open");
        open.type = "button";
        open.setAttribute("aria-expanded", "false");
        open.setAttribute("aria-controls", why.id);
        open.setAttribute("data-title", title);
        open.setAttribute("aria-label", "Read the rationale for " + title);
        open.addEventListener("click", function () { toggle(tr); });
        cell.appendChild(open);
      }
      var proof = tr.querySelector('td[data-enc-cell="proof"] a[href]');
      if (proof) {
        var word = said ? said.charAt(0).toUpperCase() + said.slice(1).toLowerCase() : "";
        proof.setAttribute("aria-label", title.replace(/^this proposal$/, "Proposal") +
          (word ? " — voted " + word : "") + ", opens on the block explorer");
      }
      tr.setAttribute("data-enc-row", "");
    });
    // the header cells take the same marks, by position
    var ths = box.querySelectorAll("thead th");
    Array.prototype.forEach.call(ths, function (th, at) {
      if (kinds[at]) th.setAttribute("data-enc-cell", kinds[at]);
    });
    var first = box.querySelector("tbody tr[data-enc-row]");
    if (first) {
      Array.prototype.forEach.call(first.children, function (td, at) {
        var what = td.getAttribute("data-enc-cell");
        if (what && ths[at]) ths[at].setAttribute("data-enc-cell", what);
        if (what === "chain" && ths[at]) ths[at].setAttribute("data-enc-chain", "");
      });
    }
    if (!box.hasAttribute("data-enc-rows")) box.setAttribute("data-enc-rows", "");
  }

  /* ── the pillars band's head: the heading and its lede on the left, the button on the right ── */
  function head() {
    var title = document.getElementById(HEAD);
    var button = document.getElementById(ASK);
    if (!title || !button || title.closest(".enc-rec__head")) return;
    var row = el("div", "enc-rec__head");
    var left = el("div", "enc-rec__head-text");
    title.before(row);
    row.appendChild(left);
    left.appendChild(title);
    var lede = row.nextElementSibling;
    if (lede && lede.classList.contains("notion-text")) left.appendChild(lede);
    row.appendChild(button);
  }

  /* ── 3 · the control bar ──
     The handoff's bar is four controls: the chain, the outcome, the sort and a search field. All
     four are built from the rows Super rendered — their own Chain and Vote Option — rather than
     from Super's view picker, so the menus carry counts and the picker can go. Notion has no block
     that is a menu or an input; this is the allowed exception (CLAUDE.md, "Search and sort"). */
  var state = { chain: "", vote: "", sort: "", q: "" };

  function rowsOf() {
    var box = document.getElementById(TABLE);
    return box ? Array.prototype.slice.call(box.querySelectorAll("tbody tr")) : [];
  }
  // a vote to show: a row that was built (it has a chain) and names its proposal — the count band's
  // job counts the same rows (a Sui row with no proposal, no date and Reference "1" drew as a blank line)
  function isVote(tr) {
    if (!tr.hasAttribute("data-enc-row")) return false;
    var t = tr.querySelector("td.title .notion-property__title");
    return !!(t && t.textContent.trim());
  }
  function chainOf(tr) {
    var c = tr.querySelector(".enc-rec__chain");
    return c ? c.textContent.trim() : "";
  }
  function voteOf(tr) {
    var cells = tr.querySelectorAll("td.select");
    for (var i = 0; i < cells.length; i++) {
      if (!cells[i].hasAttribute("data-enc-chain")) return cells[i].textContent.trim();
    }
    return "";
  }
  function dateOf(tr) {
    var kept = tr.getAttribute("data-enc-t");
    if (kept) return +kept;
    var d = tr.querySelector("td.date");
    var t = d ? Date.parse(d.textContent.trim()) : NaN;
    return isNaN(t) ? 0 : t;
  }

  function controls() {
    var box = document.getElementById(TABLE);
    if (!box || box.querySelector(".enc-rec__bar")) return;
    var rows = rowsOf().filter(isVote);
    if (!rows.length) return;

    var chains = {}, votes = {};
    rows.forEach(function (tr) {
      var c = chainOf(tr); if (c) chains[c] = (chains[c] || 0) + 1;
      var v = voteOf(tr); if (v) votes[v] = (votes[v] || 0) + 1;
    });
    var chainOpts = [["All chains", rows.length, ""]].concat(Object.keys(chains).sort().map(function (c) {
      return [c, chains[c], c];
    }));
    var voteOpts = [["Any vote", rows.length, ""]].concat(Object.keys(votes).map(function (v) {
      return [v, votes[v], v];
    }));
    /* the design's command field (Filter Bar Patterns, G): the search first — a chain or a vote typed
       and Enter becomes a token — then Chain, Vote and the sort as cells at the right. The options
       and their counts are the rows' own, as before; so is the filtering (apply). */
    if (typeof window.encFilterBar !== "function") return;
    var toOpts = function (list) { return list.map(function (o) { return [o[2], o[0], o[1]]; }); };
    var rest = function () { var r = el("span", "enc-fb__rest"); return r; };
    var bar = window.encFilterBar({
      placeholder: "Find a proposal, or type a chain",
      facets: [
        { id: "chain", label: "Chain", options: function () { return toOpts(chainOpts); }, mark: glyphFor, rest: rest },
        { id: "vote", label: "Vote", options: function () { return toOpts(voteOpts); }, mark: dotFor, rest: rest }
      ],
      sorts: function () { return [["", "Recent votes", "desc"], ["oldest", "Oldest first", "asc"], ["chain", "By chain", "az"]]; },
      state: { q: "", sort: "", f: { chain: "", vote: "" } },
      onChange: function (st) {
        state.chain = st.f.chain || ""; state.vote = st.f.vote || "";
        state.sort = st.sort || ""; state.q = st.q || "";
        shown = PAGE;
        apply();
      }
    });
    bar.el.classList.add("enc-rec__bar");
    barApi = bar;

    var header = box.querySelector(".notion-collection__header-wrapper");
    if (header) header.setAttribute("data-enc-source", "");
    box.insertBefore(bar.el, box.firstChild);
    if (typeof window.encEmptySet === "function") {
      empty = window.encEmptySet();
      empty.el.hidden = true;
      bar.el.after(empty.el);
    }
  }

  /* ── 3b · the homepage's vote split, told as a story (design Vote Split Story, "C · Scrubbed in passing", 2026-10-28) ──
     In the homepage's governance section, between the lede and the six rows, in place of G3 "Pastel ribbons"
     (2026-10-25). From 2026-10-27 to 10-28 it was the design's A, a pinned stage of six screens; C tells the same six
     beats at a band's size, by the band's own passage up the screen, with no pin and no extra length ("for a page that
     cannot give it six screens"). The drawing takes the column's full width at 420px, and the caption (the beat's
     headline and lead) sits over its right half, its left edge on the line where the ribbons run straight, where the
     figures start; at least 360px is left it. The story starts once half the drawing is on screen, or at the first
     scroll where the page opens with more of it showing, so it always opens on the total, and ends as the caption
     reaches the top of the screen, never in less than 0.45 of a screen. It opens on the record in its pastels, stacked
     by answer beside its total (Opening "Pastel record", the user's choice on 2026-10-28); each beat one answer pours
     out of it as its ribbon, in ballot order from the top; then the record parts at that answer's seam, the ribbons
     already told lifting by half a gap so the set stays centred on the record. The close holds the whole split, and
     scrolling back reverses every beat. Each figure is sized to its ribbon (Figures "Sized to ribbon", the design's
     default since 2026-10-28): two-thirds of it and never under 14px, in proportional digits, every first digit's ink
     on one left edge where the ribbons straighten and every name at the ribbons' right end, shown once its ribbon has
     poured past that line. Where the drawing is under 680px wide the caption returns to the left edge, over the phone
     drawing, still 420px: the record runs across the top and each answer pours down into its column, its figure under
     it at 36px; a figure too close to its neighbour drops a row.
     Its numbers are one line in Notion, "1,913 votes · 1,243 Yes · 78 No · 478 No with veto · 114 Abstain", which
     site-data's count job writes after every governance run: the record's rows plus the 729 votes from before it,
     frozen by outcome on 2026-10-25 (the user: "474 Yes, 212 No and 43 Abstain"; the 212 is 30 No and 182 No with
     veto, by the same proportions). The homepage carries only the past month's rows, so it cannot count the record
     itself. The line, and the kicker above it ("The record, by outcome", the stage's label), are the source: hidden
     once drawn. An outcome the line leaves out has no ribbon and no beat. The beats' words are the "Vote split copy"
     toggle under the line; what they fill in is worked from the counts here: the share in words follows the design's
     rule (the nearest half, third or quarter within five points, otherwise one in N, "exactly" only when the count
     divides the record), with the number words, the articles and the list, which no Notion block can hold. A line it
     cannot read stays as Notion wrote it. Reduced motion steps it a beat at a time with nothing moving; print shows it
     whole. The design's "C" pill beside the label names its telling among the design's three, so it is left out. */
  var LINE = "block-404e800a51388128ba49e43d1ce92374";   // the line, written by site-data's count job
  var KICK = "block-404e800a5138816ab84adfcc33e9bb44";   // "The record, by outcome"
  var FILLS = { "yes": "#DCEEC7", "no": "#F8E8B3", "no with veto": "#F7DCE7", "abstain": "#D2E3F6" };
  /* the fallback if the "Vote split copy" toggle goes missing */
  var STORY = {
    "open": "{total} {word}.",
    "open lead": "All of them, stacked by answer.",
    "answer": "{answer}, {count} times.",
    "answer one": "{answer}, {count} time.",
    "answer lead": "{share words}: {share} of the record.",
    "answer lead plain": "{share} of the record.",
    "close": "{answers} answers, one record.",
    "close lead": "Every one of the {total} is {list}.",
    "counter": "{beat} / {beats}"
  };
  // seams, gaps between parted ribbons, figure to word, figure to ribbon, the smallest figure; under 760px its own
  var ST = { s: 2, G: 40, gap: 16, ratio: 0.66, floor: 14 };
  var PH = { G: 24, s: 2, fig: 36, top: 73 };
  var INK_FB = { top: 0.17, bottom: 0.87 };   // Outfit 600's digits, as fractions of the size, until measured
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SP = null;   // the built story: its nodes, the line it read, the drawing it built and what it last drew

  // "1,913 votes · 1,243 Yes · …": the total and its word, then a band per outcome with votes
  function parseSplit(text) {
    var num = function (v) { return parseInt(v.replace(/[^\d]/g, ""), 10) || 0; }, re = /^([\d,]+)\s+(.+)$/;
    var parts = text.split("·").map(function (p) { return p.trim(); }), head = re.exec(parts[0] || "");
    var bands = parts.slice(1).map(function (p, i) {
      var m = re.exec(p), w = m && m[2].trim();
      return m && { k: w.toLowerCase(), n: num(m[1]), word: w, fill: FILLS[w.toLowerCase()] || TINTS[3 + i % 2] };
    }).filter(function (b2) { return b2 && b2.n > 0; });
    if (!head || !bands.length) return null;
    return { bands: bands, total: num(head[1]), word: head[2].trim(), sum: bands.reduce(function (a2, b2) { return a2 + b2.n; }, 0) };
  }

  function readStoryCopy() {
    var c = {}, k;
    for (k in STORY) c[k] = STORY[k];
    Array.prototype.forEach.call(document.querySelectorAll(".notion-toggle"), function (t) {
      if (!/^vote split copy$/i.test(textOf(t.querySelector(".notion-toggle__summary")).replace(/^[‣▸▶\s]+/, ""))) return;
      Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
        var line = textOf(p), i = line.indexOf("·");
        if (i < 0) return;
        var key = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
        if (key && v) c[key] = v;
      });
    });
    return c;
  }
  function textOf(n) { return n ? (n.textContent || "").trim() : ""; }
  function fillIn(t, vars) { return String(t || "").replace(/\{([^}]+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }); }

  // the beats, worked from the counts
  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen",
    "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function say(n) { return n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "") : fmt(n); }
  function cap1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function shareOf(n, sum) { return (100 * n / sum).toFixed(1) + "%"; }
  // the nearest half, third or quarter within five points, otherwise one in N; "exactly" only when the count divides the record
  function inWords(n, sum) {
    var s = n / sum, best = null;
    for (var d = 2; d <= 4; d++) for (var k = 1; k < d; k++) {
      var e = Math.abs(k / d - s);
      if (e < 0.05 && (!best || e < best.e - 1e-9)) best = { k: k, d: d, e: e };
    }
    if (!best && s > 0) { var d2 = Math.round(1 / s); if (d2 >= 5 && d2 <= 99) best = { k: 1, d: d2, e: Math.abs(1 / d2 - s) }; }
    if (!best) return null;
    var how = n * best.d === best.k * sum ? "exactly " : best.e < 0.004 ? "about " : s < best.k / best.d ? "nearly " : "more than ";
    return how + say(best.k) + (best.k > 1 ? " votes" : " vote") + " in " + say(best.d);
  }
  function art(w) { return (/^[aeiou]/i.test(w) ? "an " : "a ") + w; }
  function listOr(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " or " + a[a.length - 1]; }
  function beatsFor(L, C) {
    var tot = fmt(L.total);
    return [{ h: fillIn(C["open"], { total: tot, word: L.word }), l: C["open lead"] }].concat(L.bands.map(function (b) {
      var w = inWords(b.n, L.sum), share = shareOf(b.n, L.sum);
      return { h: fillIn(C[b.n === 1 ? "answer one" : "answer"], { answer: b.word, count: fmt(b.n) }),
        l: w ? fillIn(C["answer lead"], { "share words": cap1(w), share: share }) : fillIn(C["answer lead plain"], { share: share }) };
    }), [{ h: fillIn(C["close"], { answers: cap1(say(L.bands.length)) }),
      l: fillIn(C["close lead"], { total: tot, list: listOr(L.bands.map(function (b) { return art(b.word); })) }) }]);
  }

  /* The design's geometry: the stack split by seams s, centred on the parted set split by gaps G. A band's left end
     is a..b; its right end, parted, c..d; at(b, u) is its right end moved u from the stack. */
  function lay(L, T, G, s, oy) {
    var m = L.bands.length, top = oy + (m - 1) * (G - s) / 2, a = top, c = oy;
    var bands = L.bands.map(function (o) { var t = o.n * T / L.sum, b = { o: o, a: a, b: a + t, c: c, d: c + t }; a += t + s; c += t + G; return b; });
    return { bands: bands, H: oy + T + (m - 1) * G, top: top, len: T + (m - 1) * s };
  }
  function at(b, u) { return { c: b.a + u, d: b.b + u }; }
  function seamAt(b, s) { return Math.round(b.a - s / 2 - 0.5); }
  function f2(v) { return v.toFixed(2); }
  function hPath(b, x1, x3, xE, u) {
    var q = at(b, u), xc = (x1 + x3) / 2, A = b.a, B = b.b, C = q.c, D = q.d;
    return "M0 " + f2(A) + " L" + f2(x1) + " " + f2(A) + " C" + f2(xc) + " " + f2(A) + " " + f2(xc) + " " + f2(C) + " " + f2(x3) + " " + f2(C) +
      " L" + f2(xE) + " " + f2(C) + " L" + f2(xE) + " " + f2(D) + " L" + f2(x3) + " " + f2(D) +
      " C" + f2(xc) + " " + f2(D) + " " + f2(xc) + " " + f2(B) + " " + f2(x1) + " " + f2(B) + " L0 " + f2(B) + " Z";
  }
  function vPath(b, y1, y3, yE, u) {
    var q = at(b, u), yc = (y1 + y3) / 2, A = b.a, B = b.b, C = q.c, D = q.d;
    return "M" + f2(A) + " 0 L" + f2(A) + " " + f2(y1) + " C" + f2(A) + " " + f2(yc) + " " + f2(C) + " " + f2(yc) + " " + f2(C) + " " + f2(y3) +
      " L" + f2(C) + " " + f2(yE) + " L" + f2(D) + " " + f2(yE) + " L" + f2(D) + " " + f2(y3) +
      " C" + f2(D) + " " + f2(yc) + " " + f2(B) + " " + f2(yc) + " " + f2(B) + " " + f2(y1) + " L" + f2(B) + " 0 Z";
  }
  /* A beat a screen: the caption changes as its answer starts to leave; the wipe, then the parting. The record
     parts at its seams, one a beat: seam j, between bands j and j+1, opens on the beat of the first of the two told;
     a band's far end moves by the open seams above it less half of all open, in gaps, so no ribbon ever runs into the
     next one out and the parted set stays centred on the record. */
  function ease(t) { return t * t * (3 - 2 * t); }
  function beatAt(P, nb) { return P < 0.1 ? 0 : Math.min(nb - 1, Math.floor(P - 0.1) + 1); }
  function reveal(P, step, m) {
    var phase = function (sl) { return step ? (P >= sl + 0.1 ? 1 : 0) : clamp01((P - sl - 0.1) / 0.75); };
    var wipe = function (sl) { return step ? phase(sl) : ease(clamp01(phase(sl) / 0.62)); };
    var part = function (sl) { return step ? phase(sl) : ease(clamp01((phase(sl) - 0.45) / 0.55)); };
    var o = [], all = 0, k;
    for (k = 0; k < m - 1; k++) { o.push(part(k)); all += o[k]; }
    var out = [], run = 0;
    for (k = 0; k < m; k++) { out.push({ w: wipe(k), u: run - all / 2 }); if (k < m - 1) run += o[k]; }
    return out;
  }

  // a figure's width as it is set (tabular digits, 600, -0.04em), in a hidden span inside the story so the page's
  // observer does not wake for it; kept once Outfit is in
  var FIGW = {};
  function figW(t, fs) {
    var key = t + "@" + fs;
    if (FIGW[key]) return FIGW[key];
    var s = SP.meter;
    s.style.fontSize = fs + "px";
    s.textContent = t;
    var w = s.getBoundingClientRect().width;
    if (w > 0 && fontReady()) FIGW[key] = w;
    return w > 0 ? w : 0.6 * fs * t.length;
  }
  function fontReady() { return !(document.fonts && document.fonts.check) || document.fonts.check("600 200px Outfit"); }
  // how far the first digit's ink starts inside its box, in em, as drawn in proportional digits (canvas draws the same
  // glyph), so figures of every size can start on one edge
  var HEADEM = {};
  function headEm(t) {
    var ch = t.charAt(0);
    if (HEADEM[ch] != null) return HEADEM[ch];
    var v = 0;
    try {
      var x = document.createElement("canvas").getContext("2d");
      x.font = "600 200px Outfit";
      v = -x.measureText(ch).actualBoundingBoxLeft / 200;
    } catch (e) { v = 0; }
    if (fontReady()) HEADEM[ch] = v;
    return v;
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function abs(cls, s) { var e = el("span", cls); setStyle(e, s); return e; }
  function mono(text) { return el("span", "enc-story__mono", text); }
  function setAttr(node, k, v) { if (node.getAttribute(k) !== v) node.setAttribute(k, v); }
  function setStyle(node, s) {
    for (var k in s) if (node.style[k] !== s[k]) node.style[k] = s[k];
  }

  function storyBox() {
    var box = el("div", "enc-story");
    box.setAttribute("data-enc-story", "");
    var stage = el("div", "enc-story__stage");
    var head = el("div", "enc-story__head");
    var label = el("span", "enc-story__label"), count = el("span", "enc-story__count");
    head.appendChild(label);
    head.appendChild(count);
    var beats = el("div", "enc-story__beats");
    var fig = el("div", "enc-story__box");
    stage.appendChild(head);
    stage.appendChild(beats);
    stage.appendChild(fig);
    box.appendChild(stage);
    var meter = el("span", "enc-story__meter");
    meter.setAttribute("aria-hidden", "true");
    box.appendChild(meter);
    SP = { box: box, stage: stage, label: label, count: count, beats: beats, fig: fig, meter: meter,
      text: null, last: null, copy: "", beatEls: [], draw: null, sig: "", ink: SP && SP.ink, print: false, P: -1 };
    if (!SP.ink) inkWhenReady();
    if (typeof ResizeObserver === "function") {
      var ro = new ResizeObserver(function () { if (SP && SP.box === box) layoutStory(); });
      ro.observe(fig);
      SP.ro = ro;
    }
    return box;
  }

  function story() {
    var src = document.getElementById(LINE);
    if (!src) return;
    var kick = document.getElementById(KICK), at2 = src.nextElementSibling;
    // the box goes after the line; the copy toggle that follows it in Notion stays where it is, hidden by home.css
    if (!SP || SP.box !== at2) {
      if (at2 && at2.hasAttribute("data-enc-story")) at2.remove();
      if (SP && SP.ro) SP.ro.disconnect();
      src.after(storyBox());
    }
    var text = src.textContent.trim();
    if (SP.text !== text) { SP.text = text; SP.last = parseSplit(text); SP.sig = ""; }
    var C = readStoryCopy(), copy = JSON.stringify(C);
    if (SP.copy !== copy) { SP.copy = copy; SP.C = C; SP.sig = ""; }
    // a line it cannot read stays on the page as Notion wrote it, with its kicker
    [src, kick].forEach(function (n) {
      if (!n) return;
      if (SP.last) n.setAttribute("data-enc-story-src", ""); else n.removeAttribute("data-enc-story-src");
    });
    if (!SP.last) return;
    setText(SP.label, kick ? textOf(kick) : "");
    layoutStory();
  }

  function layoutStory() {
    var L = SP && SP.last;
    if (!L || !document.contains(SP.box)) return;
    var C = SP.C, beats = beatsFor(L, C);
    // the beats first: they share one cell, so the tallest sets the room the drawing has
    while (SP.beatEls.length > beats.length) SP.beatEls.pop().remove();
    beats.forEach(function (b, j) {
      var be = SP.beatEls[j];
      if (!be) {
        be = SP.beatEls[j] = el("div", "enc-story__beat");
        be.appendChild(el("h3"));
        be.appendChild(el("p"));
        SP.beats.appendChild(be);
      }
      setText(be.firstChild, b.h);
      setText(be.lastChild, b.l);
    });
    SP.nb = beats.length;
    var BW = SP.fig.clientWidth, BH = SP.fig.clientHeight, down = BW < 680, ink = SP.ink || INK_FB;
    if (!BW || !BH) return;
    var sig = [down, BW, BH, ink.top, ink.bottom, L.total, L.word, SP.copy].concat(L.bands.map(function (b) { return b.k + ":" + b.n; })).join(",");
    if (sig !== SP.sig) {
      SP.sig = sig;
      if (SP.draw) SP.draw.node.remove();
      SP.draw = down ? narrowDraw(L, Math.max(280, BW), BH, ink) : wideDraw(L, BW, BH, ink);
      var k = Math.max(0.3, Math.min(1, BH / SP.draw.h, BW / SP.draw.w));
      setStyle(SP.draw.node, { width: SP.draw.w + "px", height: SP.draw.h + "px", transform: "translateY(-50%) scale(" + k.toFixed(4) + ")" });
      SP.fig.appendChild(SP.draw.node);
      // the caption's left edge on the line where the ribbons run straight, leaving it at least 360px; at the left on a phone
      setStyle(SP.beats, { paddingLeft: (down ? 0 : Math.round(Math.max(0, Math.min(SP.draw.ax * k, BW - 360)))) + "px" });
      SP.P = -1;
    }
    frame();
  }

  // full width: the total at the left margin, the ribbons to the right margin, as thick as the stage allows; each
  // figure sized to its ribbon, two-thirds of it and never under 14px, in proportional digits, every first digit's ink
  // on one left edge where the ribbons straighten and every name at the ribbons' right end
  function wideDraw(L, BW, BH, ink) {
    var m = L.bands.length, cap = ink.bottom - ink.top, G = ST.G;
    var wordW = Math.max.apply(null, L.bands.map(function (b) { return b.word.length * 7.92; }));
    var fsOf = function (th) { return Math.max(ST.ratio * th / cap, ST.floor); };
    var tfsOf = function (T) { return Math.round(Math.min(72, Math.max(48, T * 0.187))); };
    // how far a band's figure reaches past the band: the first and last bands' reach is kept inside the drawing
    var reach = function (b) { var th = b.b - b.a; return Math.max(0, (fsOf(th) * cap - th) / 2); };
    var padsOf = function (T) { var bs = lay(L, T, G, ST.s, 0).bands; return [Math.ceil(reach(bs[0])), Math.ceil(reach(bs[m - 1]))]; };
    // the widest figure as it is set, with its size and its digits
    var widest = function (bs) {
      return bs.reduce(function (a, b) { var f = fsOf(b.b - b.a), t = fmt(b.o.n), w = figW(t, f); return w > a.w ? { w: w, f: f, t: t } : a; }, { w: 0, f: 0, t: "0" });
    };
    var T = Math.max(160, Math.min(BH - (m - 1) * G, 0.3 * (BW - 94)));
    for (var it = 0; it < 4; it++) {
      var p0 = padsOf(T), T2 = Math.max(160, Math.min(BH - (m - 1) * G - p0[0] - p0[1], 0.3 * (BW - 94)));
      if (Math.abs(T2 - T) < 0.5) break;
      T = T2;
    }
    // thinner only if the widest figure and its word would not fit beside the curve
    for (it = 0; it < 3; it++) {
      var lim = 0.64 * (BW - tfsOf(T) - 38) - 80 - wordW, fw = widest(lay(L, T, G, ST.s, 0).bands).w;
      if (fw <= lim || T <= 160) break;
      T = Math.max(160, T * lim / fw);
    }
    var pd = padsOf(T), tfs = tfsOf(T), TW = tfs + 28, W = BW - TW - 10;
    var Lt = lay(L, T, G, ST.s, pd[0]), H = Lt.H + pd[1], bs = Lt.bands, top = widest(bs), xE = W;
    var x3 = Math.round(Math.max(0.3 * W, Math.min(0.506 * W, W - (24 + top.w + ST.gap + wordW + 40))));
    var x1 = Math.round(Math.min(0.244 * W, x3 - 0.19 * W));

    var node = el("div", "enc-story__draw is-wide");
    // the total, upright at the record's left, centred on it; its measure exactly as long as the record is thick
    var tot = el("div", "enc-story__total");
    tot.setAttribute("aria-hidden", "true");
    setStyle(tot, { width: TW + "px", height: H + "px" });
    var tlab = abs("enc-story__tlab", { left: "0px", right: "22px", top: f2(Lt.top) + "px", height: f2(Lt.len) + "px" });
    var tin = el("span", "enc-story__tin"), tfig = el("span", "enc-story__tfig", fmt(L.total));
    tfig.style.fontSize = tfs + "px";
    tin.appendChild(tfig);
    tin.appendChild(mono(L.word));
    tlab.appendChild(tin);
    tot.appendChild(tlab);
    tot.appendChild(abs("enc-story__bar", { right: "6px", top: f2(Lt.top) + "px", width: "1px", height: f2(Lt.len) + "px" }));
    tot.appendChild(abs("enc-story__bar", { right: "2px", top: f2(Lt.top) + "px", width: "9px", height: "1px" }));
    tot.appendChild(abs("enc-story__bar", { right: "2px", top: f2(Lt.top + Lt.len - 1) + "px", width: "9px", height: "1px" }));
    // the record is whole from the first beat, so its seams all show
    bs.slice(1).forEach(function (b) {
      tot.appendChild(abs("enc-story__bar", { right: "4px", top: seamAt(b, ST.s) + "px", width: "5px", height: "1px" }));
    });
    var box = el("div", "enc-story__art");
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", fmt(L.total) + " " + L.word + ": " + L.bands.map(function (b) { return fmt(b.n) + " " + b.word; }).join(", "));
    setStyle(box, { width: W + "px", height: H + "px" });
    var svg = svgEl("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + f2(H), "aria-hidden": "true" });
    var defs = svgEl("defs", {}), rects = [], paths = [];
    svg.appendChild(defs);
    bs.forEach(function (b, i) {
      var cp = svgEl("clipPath", { id: "enc-story-w" + i }), r = svgEl("rect", { x: 0, y: 0, width: 0, height: f2(H) });
      cp.appendChild(r);
      defs.appendChild(cp);
      rects.push(r);
      var p = svgEl("path", { fill: b.o.fill, "clip-path": "url(#enc-story-w" + i + ")" });
      svg.appendChild(p);
      paths.push(p);
    });
    box.appendChild(svg);
    var labs = bs.map(function (b) {
      var wrap = el("div", "enc-story__wrap"), f = fsOf(b.b - b.a), t = fmt(b.o.n);
      setStyle(wrap, { width: W + "px", height: f2(H) + "px" });
      var fig = el("span", "enc-story__fig is-sized", t);
      setStyle(fig, { left: f2(x3 + 24 - headEm(t) * f) + "px", fontSize: f2(f) + "px" });
      // the name centred on the figure's digits, its tracking after the last letter taken back so its ink ends on the edge
      var name = el("div", "enc-story__name"), word = mono(b.o.word);
      word.style.transform = "translateY(" + f2(f * ((ink.top + ink.bottom) / 2 - 0.5)) + "px)";
      name.appendChild(word);
      setStyle(name, { height: f2(f) + "px" });
      wrap.appendChild(fig);
      wrap.appendChild(name);
      box.appendChild(wrap);
      return { wrap: wrap, fig: fig, name: name, f: f };
    });
    node.appendChild(tot);
    node.appendChild(box);
    // ax: where the figures start, from the drawing's left edge — the caption's left edge
    return { node: node, w: BW, h: H, ax: TW + 10 + x3 + 24, draw: function (R) {
      var wx = R.map(function (r) { return x1 + r.w * (W - x1); });
      bs.forEach(function (b, i) {
        var u = R[i].u * (G - ST.s), q = at(b, u), y = (q.c + q.d) / 2 - labs[i].f * (ink.top + ink.bottom) / 2;
        setAttr(paths[i], "d", hPath(b, x1, x3, xE, u));
        setAttr(rects[i], "width", f2(wx[i]));
        // a figure shows once its ribbon has poured past the line where the ribbons run straight
        setStyle(labs[i].wrap, { display: wx[i] <= x3 ? "none" : "", clipPath: "inset(0px " + f2(Math.max(0, W - wx[i])) + "px 0px 0px)" });
        setStyle(labs[i].fig, { top: f2(y) + "px" });
        setStyle(labs[i].name, { top: f2(y) + "px" });
      });
    } };
  }

  // under 760px: the record across the top, the answers pouring down into columns, the figures under them
  function narrowDraw(L, Wp, BH, ink) {
    var m = L.bands.length, Lt = lay(L, Wp - (m - 1) * PH.G, PH.G, PH.s, 0), bs = Lt.bands, BLK = 52, RG = 14, rows = [], put = [];
    var lw = function (b) { return Math.max(figW(fmt(b.o.n), PH.fig), b.o.word.length * 7.92); };
    var clear = function (r, a0, a1) { return !(rows[r] || []).some(function (q) { return a0 < q[1] + 28 && a1 > q[0] - 28; }); };
    var xAt = function (q, a, w) { return a === "l" ? q.c : a === "r" ? q.d - w : (q.c + q.d - w) / 2; };
    var order = [0].concat(m > 1 ? [m - 1] : []);
    for (var j0 = 1; j0 < m - 1; j0++) order.push(j0);
    order.forEach(function (i) {
      var b = bs[i], q = { c: b.c, d: b.d }, w = lw(b), cands = i === 0 ? ["l"] : i === m - 1 ? ["r"] : ["r", "c", "l"];
      for (var r = 0; r < 8; r++) {
        var a = null;
        for (var ci = 0; ci < cands.length && !a; ci++) if (clear(r, xAt(q, cands[ci], w), xAt(q, cands[ci], w) + w)) a = cands[ci];
        if (a || r === 7) { var k = a || cands[0]; (rows[r] = rows[r] || []).push([xAt(q, k, w), xAt(q, k, w) + w]); put[i] = { r: r, a: k }; break; }
      }
    });
    var nr = rows.filter(Boolean).length, labH = 16 + nr * BLK + (nr - 1) * RG + 4;
    var y2 = Math.round(Math.max(150, Math.min(520, BH - PH.top - labH))), y1 = Math.round(0.216 * y2), y3 = Math.round(0.686 * y2), HH = y2 + labH;

    var node = el("div", "enc-story__draw is-narrow");
    node.setAttribute("role", "img");
    node.setAttribute("aria-label", fmt(L.total) + " " + L.word + ": " + L.bands.map(function (b) { return fmt(b.n) + " " + b.word; }).join(", "));
    var fs = 44, ry = 56, shift = fs * ((ink.top + ink.bottom) / 2 - 0.5);
    var tot = el("div", "enc-story__total");
    tot.setAttribute("aria-hidden", "true");
    setStyle(tot, { width: Wp + "px", height: PH.top + "px" });
    var tlab = abs("enc-story__tlab is-across", { left: f2(Lt.top) + "px", width: f2(Lt.len) + "px", top: "0px", height: fs + "px" });
    var tfig = el("span", "enc-story__tfig", fmt(L.total)), tw = mono(L.word);
    tfig.style.fontSize = fs + "px";
    tw.style.transform = "translateY(" + f2(shift) + "px)";
    tlab.appendChild(tfig);
    tlab.appendChild(tw);
    tot.appendChild(tlab);
    tot.appendChild(abs("enc-story__bar", { left: f2(Lt.top) + "px", top: ry + "px", width: f2(Lt.len) + "px", height: "1px" }));
    tot.appendChild(abs("enc-story__bar", { left: f2(Lt.top) + "px", top: (ry - 4) + "px", width: "1px", height: "9px" }));
    tot.appendChild(abs("enc-story__bar", { left: f2(Lt.top + Lt.len - 1) + "px", top: (ry - 4) + "px", width: "1px", height: "9px" }));
    bs.slice(1).forEach(function (b) {
      tot.appendChild(abs("enc-story__bar", { left: seamAt(b, PH.s) + "px", top: (ry - 2) + "px", width: "1px", height: "5px" }));
    });
    var box = el("div", "enc-story__art");
    setStyle(box, { width: Wp + "px", height: HH + "px" });
    var svg = svgEl("svg", { width: Wp, height: HH, viewBox: "0 0 " + Wp + " " + HH, "aria-hidden": "true" });
    var defs = svgEl("defs", {}), rects = [], paths = [];
    svg.appendChild(defs);
    bs.forEach(function (b, i) {
      var cp = svgEl("clipPath", { id: "enc-story-n" + i }), r = svgEl("rect", { x: 0, y: 0, width: Wp, height: 0 });
      cp.appendChild(r);
      defs.appendChild(cp);
      rects.push(r);
      var p = svgEl("path", { fill: b.o.fill, "clip-path": "url(#enc-story-n" + i + ")" });
      svg.appendChild(p);
      paths.push(p);
    });
    box.appendChild(svg);
    var labs = bs.map(function (b, i) {
      var wrap = el("div", "enc-story__wrap");
      setStyle(wrap, { width: Wp + "px", height: HH + "px" });
      var a = put[i].a, lab = el("div", "enc-story__under is-" + a);
      setStyle(lab, { top: (y2 + 16 + put[i].r * (BLK + RG)) + "px" });
      var fig = el("span", "enc-story__fig", fmt(b.o.n));
      fig.style.fontSize = PH.fig + "px";
      lab.appendChild(fig);
      lab.appendChild(mono(b.o.word));
      wrap.appendChild(lab);
      box.appendChild(wrap);
      return { wrap: wrap, lab: lab, a: a };
    });
    node.appendChild(tot);
    node.appendChild(box);
    return { node: node, w: Wp, h: PH.top + HH, draw: function (R) {
      var wy = R.map(function (r) { return y1 + r.w * (HH - y1); });
      bs.forEach(function (b, i) {
        var u = R[i].u * (PH.G - PH.s), q = at(b, u), a = labs[i].a;
        setAttr(paths[i], "d", vPath(b, y1, y3, y2, u));
        setAttr(rects[i], "height", f2(wy[i]));
        setStyle(labs[i].wrap, { display: wy[i] <= y2 ? "none" : "", clipPath: "inset(0px 0px " + f2(Math.max(0, HH - wy[i])) + "px 0px)" });
        setStyle(labs[i].lab, a === "l" ? { left: f2(q.c) + "px", right: "" } : a === "r" ? { left: "", right: f2(Wp - q.d) + "px" } : { left: f2((q.c + q.d) / 2) + "px", right: "" });
      });
    } };
  }

  // where the band is on its way up the screen, and what that beat shows: the story starts once half the drawing is on
  // screen (or at the first scroll, where the page opens with more of it showing, so the opening beat is never skipped)
  // and ends as the caption reaches the top of the screen, never in less than 0.45 of a screen of scroll
  function frame() {
    if (!SP || !SP.draw || !document.contains(SP.box)) return;
    var vh = window.innerHeight || 800, nb = SP.nb, dr = SP.fig.getBoundingClientRect(), off = dr.top - SP.beats.getBoundingClientRect().top;
    var x0 = Math.min(vh - 0.5 * dr.height, dr.top + (window.scrollY || window.pageYOffset || 0)), x1 = Math.min(0.04 * vh + off, x0 - 0.45 * vh);
    var P = SP.print ? nb - 1 : (nb - 1) * Math.max(0, Math.min(1, (x0 - dr.top) / (x0 - x1)));
    if (Math.abs(P - SP.P) < 0.0005) return;
    SP.P = P;
    var i = beatAt(P, nb);
    SP.draw.draw(reveal(P, REDUCED.matches || SP.print, nb - 2));
    SP.beatEls.forEach(function (be, j) {
      be.classList.toggle("is-on", j === i);
      setAttr(be, "aria-hidden", j === i ? "false" : "true");
    });
    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    setText(SP.count, fillIn(SP.C["counter"], { beat: pad2(i + 1), beats: pad2(nb) }));
  }
  var ticking = 0;
  window.addEventListener("scroll", function () {
    if (!SP || ticking) return;
    ticking = requestAnimationFrame(function () { ticking = 0; frame(); });
  }, { passive: true });
  window.addEventListener("resize", function () { if (SP) { layoutStory(); SP.P = -1; frame(); } });
  if (REDUCED.addEventListener) REDUCED.addEventListener("change", function () { if (SP) { SP.P = -1; frame(); } });
  window.addEventListener("beforeprint", function () { if (SP) { SP.print = true; SP.box.classList.add("is-print"); layoutStory(); SP.P = -1; frame(); } });
  window.addEventListener("afterprint", function () { if (SP) { SP.print = false; SP.box.classList.remove("is-print"); layoutStory(); SP.P = -1; frame(); } });

  // the digits' ink, measured once Outfit is in: the figures are centred on it, not on the line box
  function inkWhenReady() {
    var measure = function () {
      try {
        var x = document.createElement("canvas").getContext("2d");
        x.font = "600 200px Outfit";
        var m = x.measureText("0123456789");
        if (!m.fontBoundingBoxAscent) return;
        var base = (200 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
        if (SP) {
          FIGW = {};
          HEADEM = {};
          SP.ink = { top: (base - m.actualBoundingBoxAscent) / 200, bottom: (base + Math.max(0, m.actualBoundingBoxDescent)) / 200 };
          SP.sig = "";
          layoutStory();
        }
      } catch (e) { /* the fallback stands */ }
    };
    if (document.fonts && document.fonts.load) document.fonts.load("600 200px Outfit").then(measure, measure);
    else measure();
  }

  /* ── nothing matches (design Governance Record Wow, 2026-09-26) ── the record's chains as marks,
     the count, the line and "How we vote" beside "Clear filters". The words are the "Empty state
     copy" toggle after the table; FALLBACK only stands in if it goes missing. */
  var barApi = null, empty = null;
  var FALLBACK = {
    "headline": { text: "No vote matches \u201c{q}\u201d." },
    "headline without a search": { text: "No vote matches these filters." },
    "tail": { text: "{votes} votes \u00b7 {chains} chains" },
    "line": { text: "Every ballot we have cast is here, by chain and outcome. Pick a chain to see its record, or read how we decide." },
    "action": { text: "How we vote", href: "/governance#block-a9ed1443a36c4f6da5ac9cbae489c031" },
    "clear": { text: "Clear filters" }
  };
  function word(copy, k) { return (copy && copy[k]) || FALLBACK[k] || { text: "" }; }
  function showEmpty(rows, needle) {
    if (!empty) return;
    var copy = typeof window.encEmptyCopy === "function" ? window.encEmptyCopy() : null;
    var chains = [], seen = {}, built = 0;
    rows.forEach(function (tr) {
      if (!tr.hasAttribute("data-enc-row")) return;
      built++;
      var c = chainOf(tr);
      if (c && !seen[c]) { seen[c] = 1; chains.push(c); }
    });
    var q = (state.q || "").trim();
    var action = word(copy, "action");
    empty.set({
      headline: q ? word(copy, "headline").text.replace("{q}", q) : word(copy, "headline without a search").text,
      // the node is made only if the set changed: the mark set is rebuilt when its ids do
      items: chains.map(function (c) { return { id: c, label: c, get node() { return glyphFor(c); } }; }),
      tail: word(copy, "tail").text.replace("{votes}", fmt(built)).replace("{chains}", String(chains.length)),
      onPick: function (c) { if (barApi) barApi.update({ q: "", f: { chain: c, vote: "" } }); },
      line: word(copy, "line").text,
      action: { label: action.text, href: action.href },
      clear: { label: word(copy, "clear").text, onClick: function () { if (barApi) barApi.update({ q: "", f: {}, sort: "" }); } }
    });
  }

  // a chain's glyph, when a view of the Networks set is on the page; otherwise its tinted disc
  function glyphFor(chain) {
    var disc = el("span", "enc-rec__disc");
    if (!chain) { disc.setAttribute("data-empty", ""); return disc; }
    disc.style.background = tintFor(chain.toLowerCase());
    var url = glyphs()[key(chain)];
    if (url) {
      var img = el("img");
      img.src = small(url); img.alt = "";
      disc.appendChild(img);
    }
    return disc;
  }
  function dotFor(vote) {
    var dot = el("span", "enc-rec__dot");
    if (!vote) dot.setAttribute("data-empty", "");
    else dot.setAttribute("data-vote", vote.toLowerCase().replace(/\s+/g, "-"));
    return dot;
  }
  function key(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  /* Glyphs come from whichever gallery of chains is on the page: the Networks set for the chains
     we still run, and "Chain marks" for the ones we have shut down — the record spans both, and a
     retired chain has no row in the Networks set. Both are read the same way and hidden by CSS. */
  var glyphCache = null, glyphCards = -1;
  function glyphs() {
    // read again whenever the page holds more cards than last time: a gallery can render after
    // the table, and an early empty read would otherwise stand for the whole visit
    var cards = document.querySelectorAll(".notion-collection-card").length;
    if (glyphCache && cards === glyphCards) return glyphCache;
    glyphCards = cards;
    var out = {};
    if (typeof window.encGlyphs === "function") {
      try { var fb = window.encGlyphs(); for (var k in fb) out[k] = fb[k]; } catch (e) {}
    }
    Array.prototype.forEach.call(document.querySelectorAll(".notion-collection-card"), function (card) {
      var t = card.querySelector(".notion-property__title");
      var img = card.querySelector("img");
      if (!t || !img) return;
      var src = img.currentSrc || img.src || "";
      var m = /[?&]url=([^&]+)/.exec(src);
      out[key(t.textContent)] = m ? decodeURIComponent(m[1]) : src;
    });
    glyphCache = out;
    return out;
  }

  /* ── the pager ── the file shows ten and grows by ten, with the count line beside it (it was 25
     until the record handoff of 2026-09-26) ── */
  var PAGE = 10;
  var shown = PAGE;

  function total() {
    var band = document.getElementById(BAND);
    var ps = band ? band.querySelectorAll(":scope > .notion-callout__content > p.notion-text") : [];
    var n = ps.length > 1 ? parseInt((ps[1].textContent || "").replace(/[^\d]/g, ""), 10) : 0;
    return n || rowsOf().length;
  }

  function pager() {
    var box = document.getElementById(TABLE);
    if (!box || box.querySelector(".enc-rec__foot")) return;
    var foot = el("div", "enc-rec__foot");
    var more = el("button", "enc-rec__more");
    more.type = "button";
    more.addEventListener("pointerdown", function (e) {
      e.preventDefault(); shown += PAGE; apply();
    });
    foot.appendChild(more);
    foot.appendChild(el("span", "enc-rec__shown"));
    box.appendChild(foot);
  }

  /* filtering and sorting run on the rows Super rendered — the record's own view decides which
     those are (CLAUDE.md: Super only ships the active view's rows) */
  var resorted = false;
  function apply() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var needle = (state.q || "").trim().toLowerCase();
    var rows = rowsOf();
    rows.forEach(function (tr) {
      // a row with no chain is never built (three blank rows in the database): it is not a vote to
      // show — "By chain" put the three at the top of the record (audit, 2026-09-26)
      var hide = !isVote(tr);
      if (state.chain && chainOf(tr) !== state.chain) hide = true;
      if (state.vote && voteOf(tr) !== state.vote) hide = true;
      if (needle && tr.textContent.toLowerCase().indexOf(needle) < 0) hide = true;
      tr.hidden = hide;
    });
    // once reordered, "Recent votes" (the default, "") has to reorder too, or the rows stay as they
    // were left
    if (state.sort || resorted) {
      resorted = true;
      var body = rows[0] && rows[0].parentNode;
      if (body) {
        var sorted = rows.slice().sort(function (a, b) {
          // a row with no Recorded date is not the oldest vote: it goes last in either order
          if (state.sort !== "chain" && !dateOf(a) !== !dateOf(b)) return dateOf(a) ? -1 : 1;
          if (state.sort === "oldest") return dateOf(a) - dateOf(b);
          if (state.sort === "chain") return chainOf(a).localeCompare(chainOf(b)) || dateOf(b) - dateOf(a);
          return dateOf(b) - dateOf(a);
        });
        /* rows are moved only when the order is not already right: every move is a mutation, and
           this file's own observer rebuilt on it — 8 passes a second, for as long as the page was
           open. The pager then counts in the new order (it counted in the old one, which only the
           next pass of that loop put right). */
        if (sorted.some(function (tr, i) { return tr !== rows[i]; })) {
          sorted.forEach(function (tr) { if (tr.parentNode === body) body.appendChild(tr); });
        }
        rows = sorted;
      }
    }
    // then the pager: only the first `shown` of what matched stays on the page
    var matched = rows.filter(function (tr) { return !tr.hidden; });
    var filtered = state.chain || state.vote || needle;
    matched.forEach(function (tr, i) { if (i >= shown) tr.hidden = true; });
    var onShow = Math.min(shown, matched.length);
    // nothing matches: Notion's own line after the table says so, in place of the header and foot
    if (rows.length && !matched.length) {
      box.setAttribute("data-enc-empty", "");
      showEmpty(rows, needle);
      if (empty) empty.el.hidden = false;
    } else {
      box.removeAttribute("data-enc-empty");
      if (empty) empty.el.hidden = true;
    }
    var foot = box.querySelector(".enc-rec__foot");
    if (foot) {
      var left = matched.length - onShow;
      var more = foot.querySelector(".enc-rec__more");
      more.hidden = left <= 0;
      // written only when it changes: a text write is a mutation, and the observer rebuilt on it
      // for as long as the page was open (48 writes in 3s, measured on the live page)
      setText(more, "Show " + Math.min(PAGE, left) + " more");
      setText(foot.querySelector(".enc-rec__shown"),
        onShow + " of " + (filtered ? matched.length + " matching" : fmt(total())) + " shown");
    }

    // a group with nothing left in it goes with its rows
    Array.prototype.forEach.call(box.querySelectorAll(".notion-collection-group__section"), function (s2) {
      var any = Array.prototype.some.call(s2.querySelectorAll("tbody tr"), function (tr) { return !tr.hidden; });
      s2.hidden = !any;
    });
  }

  // the galleries the glyphs are read from are sources, not content. Only on the record page:
  // this file is loaded from the site head, and marking every collection on every page set
  // data-enc-source on the homepage's own galleries too (harmless only because governance.css is
  // not loaded there — one page CSS away from hiding real content).
  function hideSources() {
    if (!document.getElementById(TABLE)) return;
    Array.prototype.forEach.call(document.querySelectorAll(".notion-collection"), function (c) {
      var box = c.closest("[id^=block-]");
      if (!box || box.id === TABLE) return;
      if (box.querySelector(".notion-collection-card")) box.setAttribute("data-enc-source", "");
    });
  }

  function setText(node, text) { if (node && node.textContent !== text) node.textContent = text; }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /* The quadrant's fields (design "Governance Record Wow"): each card shows the number, then the
     question, its line and the word, in the view's own order. They are marked here so the CSS does
     not have to know Super's property hashes — and so a property added to the view later cannot
     silently take another one's styling. */
  var PILLARS = "block-10fb4619625b43cd82d572d6b806ead7";
  // the view renders the Word property first, then the question, then its line
  var FIELDS = ["word", "title", "line"];

  function pillars() {
    var box = document.getElementById(PILLARS);
    if (!box) return;
    box.querySelectorAll(".notion-collection-card").forEach(function (card) {
      var texts = card.querySelectorAll(".notion-property__text");
      Array.prototype.forEach.call(texts, function (t, i) {
        if (FIELDS[i] && t.getAttribute("data-enc-pillar") !== FIELDS[i]) {
          t.setAttribute("data-enc-pillar", FIELDS[i]);
        }
      });
    });
  }

  var tries = 0;
  function build() {
    // the band reads the rows, so they are built first; and it is built once the pager has hidden all but
    // the first page of them, because it measures its header, and a measure lays out the whole page: with
    // all 1,181 rows showing that took 0.7s on the first build and 1s on the rebuild after Super redraws
    // the page, during which the band was bare ink (the user, 2026-10-22: "sometime i just see an inked
    // page with no disc on it"); after the pager, 0.1s
    rows(); head(); controls(); pager(); apply(); count(); hideSources(); pillars(); story();
    // the glyphs come from galleries that can render after the table, and after Super has stopped
    // mutating, so nothing would wake the observer again (home.js did the same for 37h)
    if (bare && tries++ < 12) { clearTimeout(t); t = setTimeout(build, 300); }
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-rec__bar, .enc-count__stage, .enc-story"); })) return;
    clearTimeout(t); tries = 0; t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
