/* SNAPPING — one engine for every page that snaps (2026-10-28, the user: "the snappiness for all the pages, make sure
   its smooth and not choppy, also make sure its consistent and not like some page snaps harder than others").

   Until then each page snapped its own way. home.js, network.js and guides.js each carried a copy of the homepage's
   rules and moved with the browser's smooth scroll, whose length is the browser's: in Chrome 170ms for a short move,
   500ms for a screen. The guides had CSS mandatory snap (Chrome's own snap, a screen in under 200ms: the hardest), the
   chain pages CSS proximity (the softest), /services glided its run in 750ms, and /governance followed the finger and
   stopped dead at each count. The three copies also each held a blocking wheel listener on every page of the site,
   snapping or not, so every page's scrolling waited on its main thread. Measured in headless Chrome with a swipe and a
   mouse-wheel notch (docs/main-css.md, "Snapping"): a notch from a Why Stake band moved 100px and slid back, so no
   notch ever reached the next band, and a medium swipe left the page 402px between two bands.

   WHAT SNAPS. A deck: one-screen bands that follow one another (the homepage's audience split, Why Stake's three bands
   and the networks; a guide's steps; a chain page's bands); a lone one-screen band (Who we are, /networks' count band,
   /guides' picker); or a run that hands over its own stops (/services' frames, /governance's counts: `encSnapQ`,
   below). A band is one screen when it is no shorter than the screen and runs past it by no more than its own bottom
   padding. Nothing snaps under 701px or with reduced motion.

   THE RULES, the same on every page:
     - inside a deck, a wheel or trackpad gesture, or an arrow, Page or space key, moves exactly one stop, and the
       rest of the gesture (a trackpad's momentum) is swallowed. From the last stop it leaves the deck whole: the page
       goes on until the deck's bottom edge is at the top of the screen. From the first, a screen up;
     - a gesture heading at a deck from within half a screen lands on its first stop (its last, from below), and so
       does one from where the page left it whole; a swipe already running when it comes that close is taken over
       at its own speed, so it slows into the stop rather than stopping and starting again;
     - a page that comes to rest some other way (the scrollbar, touch, a key outside a deck) goes on to the next stop
       in the direction it moved if it moved less than half a screen off a stop (back to it, under 24px), to the stop
       ahead inside a deck, and
       onto a deck it was heading at from within a third of a screen. A page moving away from a deck is never pulled
       back to it;
     - the gesture rules are the homepage's, tuned on a trackpad: a new gesture is a 250ms pause, a change of
       direction, or, 450ms after a page turned and once the deltas have fallen below half their peak, a delta four
       times the smallest since (at least 20). A trackpad must travel 10px before it turns a page (a notch turns it at
       once), and a flicker against the swipe is noise. A wheel meant for something that scrolls itself (the booking
       drawer, the menu sheet, a box with its own scroll) is left alone.

   ONE GLIDE. Every move is the same curve: a cubic from the page's own speed to rest, 750ms for a screen (the Services
   run's design) and shorter for less, never under 380ms. It runs on requestAnimationFrame, not the browser's smooth
   scroll, which starts from rest whatever the page was doing and lasts what the browser likes. Measured at 60 frames a
   second on every snapping page, also with the CPU slowed four times; only /governance drops frames then, and the
   browser's smooth scroll drops as many there (its canvas is the cost). A swipe the page may not cancel (Chrome lets a
   page cancel a gesture only if it cancelled its first event) is stopped by freezing the page's overflow until the
   swipe goes quiet: through <body> while the root's overflow is visible, as on this site (docs/services.md, v366).

   The wheel and key listeners are attached only while the page has something to snap. */
(function () {
  var MIN_W = 701, EPS = 2, REACH = 0.5, NEAR = 1 / 3;
  var FULL = 750, SHORT = 380;
  var NEW_GAP = 250, MIN_LOCK = 450, QUIET = 180, TH = 10, BACK = 24;
  // the bands, in one selector so that they come in page order
  var BANDS = [
    // the homepage: the audience split, Why Stake's three bands and the networks (one deck), Who we are
    "#block-3dae800a51388006a57be06b8ebea78e", "#block-bd1e4d485a0d424394add746d8e3cd35 .notion-collection-card",
    "#block-3dbe800a513880c09163d3ed4ab436fd", "#block-3dbe800a513880c5862ae676c8d06994",
    "#block-3dce800a51388154931ac3c9478a65b5",        // /networks: the Network Count band
    "#block-3dde800a5138811e906fc383bd7a0789",        // /guides: the picker
    "html[data-enc-guide-snap] .enc-gd__band",        // a guide: its bands, once guide.js has the built page at its top
    ".notion-root[data-enc-chain]:not([data-enc-chain='no']) .enc-ch__hero",   // a chain page: the hero and its bands
    ".notion-root[data-enc-chain]:not([data-enc-chain='no']) .enc-ch__bandsec"
  ].join(", ");
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  /* a run hands over a function that returns { stops: [y…], top, bottom } in page pixels, null while it has
     nothing to snap, or false once it is gone for good: (window.encSnapQ = window.encSnapQ || []).push(f) */
  var runs = [];
  var queued = window.encSnapQ || [];
  window.encSnapQ = { push: function (f) { runs.push(f); soon(); } };
  queued.forEach(function (f) { runs.push(f); });

  function maxY() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
  function clampY(y) { return Math.max(0, Math.min(maxY(), Math.round(y))); }

  /* the decks, measured when asked and kept until the page changes, or for a second (an image or a font that loads
     above a deck moves it without changing the page): reading layout on every scroll frame is what makes a page this
     size stutter */
  var cache = null, cachedAt = 0;
  function decks() {
    if (cache && performance.now() - cachedAt < 1000) return cache;
    cachedAt = performance.now();
    var out = [], vh = window.innerHeight, cur = null;
    if (window.innerWidth < MIN_W || reduced.matches) return (cache = out);
    Array.prototype.forEach.call(document.querySelectorAll(BANDS), function (el) {
      var r = el.getBoundingClientRect(), top = Math.round(r.top + window.scrollY), h = Math.round(r.height);
      var pad = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      if (h < vh - 4 || h > vh + 4 + pad) { cur = null; return; }
      if (cur && Math.abs(cur.bottom - top) <= EPS) { cur.stops.push(top); cur.bottom = top + h; return; }
      cur = { stops: [top], top: top, bottom: top + h };
      out.push(cur);
    });
    runs = runs.filter(function (f) {
      var d = f();
      if (d === false) return false;
      if (d && d.stops && d.stops.length) out.push({ stops: d.stops.map(Math.round), top: Math.round(d.top), bottom: Math.round(d.bottom) });
      return true;
    });
    out.sort(function (a, b) { return a.top - b.top; });
    return (cache = out);
  }

  // the deck whose stops span y (a lone stop spans its own two pixels)
  function deckAt(list, y) {
    for (var i = 0; i < list.length; i++) {
      var s = list[i].stops;
      if (y > s[0] - EPS && y < s[s.length - 1] + EPS) return list[i];
    }
    return null;
  }
  // the deck that holds y anywhere between its first stop and its bottom edge
  function spanAt(list, y) {
    for (var i = 0; i < list.length; i++) if (y > list[i].stops[0] - EPS && y < list[i].bottom - EPS) return list[i];
    return null;
  }
  function stopAt(list, y) {
    for (var i = 0; i < list.length; i++) {
      for (var k = 0; k < list[i].stops.length; k++) if (Math.abs(list[i].stops[k] - y) <= EPS) return list[i];
    }
    return null;
  }
  function restsOn(list, y) {
    return !!stopAt(list, y) || list.some(function (d) { return Math.abs(clampY(d.bottom) - y) <= EPS; });
  }

  // one stop on from y in a deck, or out of it whole at either end; null when there is nowhere to go
  function step(d, y, dir) {
    var s = d.stops, t = null, i;
    if (dir > 0) { for (i = 0; i < s.length; i++) if (s[i] > y + EPS) { t = s[i]; break; } if (t === null) t = d.bottom; }
    else { for (i = s.length - 1; i >= 0; i--) if (s[i] < y - EPS) { t = s[i]; break; } if (t === null) t = d.top - window.innerHeight; }
    t = clampY(t);
    return Math.abs(t - y) > EPS ? t : null;
  }
  /* the first stop of a deck ahead (its last, going up) that is no further than reach, or that the page has just
     left it for: from where a deck was left whole, one gesture back brings it back whole */
  function arrival(list, y, dir, reach) {
    var best = null;
    list.forEach(function (d) {
      var e = dir > 0 ? d.stops[0] : d.stops[d.stops.length - 1], gap = (e - y) * dir;
      var left = Math.abs(y - clampY(dir > 0 ? d.top - window.innerHeight : d.bottom)) <= EPS;
      if (gap > EPS && (gap <= reach || left) && (best === null || gap < Math.abs(best - y))) best = e;
    });
    return best;
  }
  /* from between stops: the stop in the direction of travel, counting one less than half a screen behind, so a
     swipe that ran 50px past a deck's first stop lands on it rather than on the second */
  function land(d, y, dir) {
    var c = d.stops.concat([clampY(d.bottom)]), half = window.innerHeight / 2, i;
    if (dir > 0) { for (i = 0; i < c.length; i++) if (c[i] >= y - half) return c[i]; return c[c.length - 1]; }
    for (i = c.length - 1; i >= 0; i--) if (c[i] <= y + half) return c[i];
    return c[0];
  }

  /* ── the glide ── p(u) = from + d·(3u² − 2u³) + T·v·u(1 − u)²: leaves at the speed v, arrives at rest. v is cut so
     that the curve never runs past its stop. */
  var anim = null, raf = 0;
  function posAt(a, now) {
    var u = Math.max(0, Math.min(1, (now - a.t0) / a.T));
    return a.from + a.d * u * u * (3 - 2 * u) + a.T * a.v * u * (1 - u) * (1 - u);
  }
  function velAt(a, now) {
    var u = Math.max(0, Math.min(1, (now - a.t0) / a.T));
    return a.d * 6 * u * (1 - u) / a.T + a.v * (1 - u) * (1 - 3 * u);
  }
  function put(y) { window.scrollTo({ top: y, left: window.scrollX, behavior: "instant" }); }
  // v0: the page's speed in px/ms; null takes it from the glide under way
  function glide(to, v0) {
    var now = performance.now();
    if (v0 === null) v0 = anim ? velAt(anim, now) : speed();
    to = clampY(to);
    cancelAnimationFrame(raf);
    anim = null;
    var from = window.scrollY, d = to - from, ad = Math.abs(d);
    if (ad < 1) { if (ad) put(to); lastRest = to; return; }
    var T = Math.max(SHORT, FULL * Math.sqrt(Math.min(1, ad / window.innerHeight)));
    var v = v0 * d > 0 ? Math.min(Math.abs(v0), 2 * ad / T) * (d > 0 ? 1 : -1) : 0;
    anim = { from: from, to: to, d: d, T: T, v: v, t0: now };
    raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    var a = anim;
    if (!a) return;
    if (now - a.t0 >= a.T) { put(a.to); anim = null; lastRest = a.to; return; }
    put(posAt(a, now));
    raf = requestAnimationFrame(frame);
  }
  function halt() { cancelAnimationFrame(raf); if (anim) { anim = null; lastRest = Math.round(window.scrollY); } }

  // the page's own speed, from the last 120ms of scrolling
  var samples = [];
  function speed() {
    var n = samples.length;
    if (n < 2) return 0;
    var a = samples[0], b = samples[n - 1], dt = b[0] - a[0];
    return dt < 20 || performance.now() - b[0] > 80 ? 0 : (b[1] - a[1]) / dt;
  }

  /* ── a swipe that cannot be cancelled is stopped by freezing the overflow, until it has been quiet ── */
  var frozen = null, thawT = 0;
  function freeze() {
    if (!frozen) {
      var root = document.documentElement, rs = getComputedStyle(root);
      var el = rs.overflowX === "visible" && rs.overflowY === "visible" && document.body ? document.body : root;
      frozen = { el: el, ov: el.style.overflowY, gut: root.style.scrollbarGutter };
      root.style.scrollbarGutter = "stable";
      el.style.overflowY = "hidden";
    }
    clearTimeout(thawT);
    thawT = setTimeout(thaw, QUIET + 40);
  }
  function thaw() {
    if (!frozen) return;
    if (anim || performance.now() - G.last < QUIET) { thawT = setTimeout(thaw, 60); return; }
    frozen.el.style.overflowY = frozen.ov;
    document.documentElement.style.scrollbarGutter = frozen.gut;
    frozen = null;
  }
  function hold(e) { if (e.cancelable) e.preventDefault(); else freeze(); }

  // the booking drawer and the menu sheet hold the page still; a box that scrolls itself takes its own wheel
  function lockedByOther() {
    var h = document.documentElement;
    return h.hasAttribute("data-enc-locked") || h.hasAttribute("data-enc-sheet");
  }
  function scrollsItself(el, dir) {
    for (; el && el.nodeType === 1 && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll" || oy === "overlay") &&
          (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true;
      }
    }
    return false;
  }

  /* ── wheel and trackpad ── */
  var G = { last: 0, dir: 0, taken: false, free: false, acc: 0, at: 0, peak: 0, min: Infinity, decayed: false };
  var lastRest = 0, restUntil = 0, lastPath = location.pathname;
  function onWheel(e) {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;   // pinch-zoom, sideways
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1), abs = Math.abs(dy);
    if (abs < 0.5) { if (G.taken) hold(e); return; }
    var now = performance.now(), dir = dy > 0 ? 1 : -1, gap = now - G.last;
    G.last = now;
    restUntil = now + QUIET;
    if (gap <= NEW_GAP && G.dir && dir !== G.dir && abs < 3) { if (G.taken) hold(e); return; }   // a flicker
    var fresh = gap > NEW_GAP || dir !== G.dir;
    if (!fresh && G.taken) {
      G.peak = Math.max(G.peak, abs);
      if (abs < G.peak * 0.5) G.decayed = true;
      var rise = G.decayed && now - G.at > MIN_LOCK && abs > Math.max(G.min * 4, 20);
      if (G.decayed) G.min = Math.min(G.min, abs);
      if (!rise) { hold(e); return; }
      fresh = true;
    }
    if (fresh) { G.dir = dir; G.taken = false; G.free = false; G.acc = 0; }
    if (lockedByOther() || scrollsItself(e.target, dir)) { G.free = true; return; }
    G.acc += abs;
    var list = decks(), y = anim ? anim.to : Math.round(window.scrollY), t;
    var d = deckAt(list, y);
    // a swipe that was already running when it came into a deck lands on the stop it has just passed
    if (d) t = G.free ? land(d, y, dir) : step(d, y, dir);
    else t = arrival(list, y, dir, REACH * window.innerHeight);
    if (t === null || t === undefined) { if (anim) hold(e); else G.free = true; return; }
    var notch = e.deltaMode !== 0 || (e.wheelDelta && Math.abs(e.wheelDelta) >= 120 && e.wheelDelta % 120 === 0);
    if (!notch && !G.free && G.acc < TH) { hold(e); return; }   // a resting finger is not a swipe yet
    hold(e);
    G.taken = true; G.at = now; G.peak = abs; G.min = Infinity; G.decayed = false;
    glide(t, null);
  }

  /* ── keys: an arrow, Page or space key turns a deck's page as a swipe would ── */
  function onKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var tg = e.target, k = e.key;
    if (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))) return;
    if (k === " " && tg && /^(A|BUTTON|SUMMARY)$/.test(tg.tagName)) return;
    var dir = k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey) ? 1
      : k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey) ? -1 : 0;
    if (!dir || lockedByOther() || scrollsItself(tg, dir)) return;
    if (anim && e.repeat) { e.preventDefault(); return; }
    var list = decks(), y = anim ? anim.to : Math.round(window.scrollY), d = deckAt(list, y);
    var t = d ? step(d, y, dir) : arrival(list, y, dir, REACH * window.innerHeight);
    if (t === null) return;
    e.preventDefault();
    glide(t, null);
  }

  /* ── coming to rest: the scrollbar, touch, a key outside a deck ── */
  var touching = false, restT = 0, retryT = 0;
  function settle() {
    if (anim || touching) return;
    var now = performance.now();
    // a trackpad's momentum ends with the scroll: while a gesture still looks live, look again once it is quiet
    if (now < restUntil) { clearTimeout(retryT); retryT = setTimeout(settle, restUntil - now + 20); return; }
    var y = Math.round(window.scrollY), prev = lastRest;
    // Super's in-app navigation puts a new page in at the top: what the last page rested on means nothing here
    if (location.pathname !== lastPath) { lastPath = location.pathname; lastRest = y; return; }
    var dir = y > prev + EPS ? 1 : y < prev - EPS ? -1 : 0;
    if (!dir) return;
    lastRest = y;
    var list = decks(), vh = window.innerHeight, t = null;
    if (!list.length || restsOn(list, y)) return;
    var from = stopAt(list, prev);
    // a move of more than half a screen is a jump (a link, the scrollbar flung), not a step off the stop
    if (from && Math.abs(y - prev) < vh / 2) t = Math.abs(y - prev) < BACK ? prev : step(from, prev, dir);
    else {
      var d = spanAt(list, y);
      t = d ? land(d, y, dir) : arrival(list, y, dir, NEAR * vh);
    }
    if (t !== null && Math.abs(t - y) > EPS) glide(t, 0);
  }
  var hasEnd = "onscrollend" in window;
  function onScroll() {
    var now = performance.now();
    samples.push([now, window.scrollY]);
    while (samples.length > 2 && now - samples[0][0] > 120) samples.shift();
    if (!hasEnd) { clearTimeout(restT); restT = setTimeout(settle, 140); }
  }
  function onEnd() { setTimeout(settle, 30); }
  function onTouchStart() { touching = true; halt(); }
  function onTouchEnd() { touching = false; if (!hasEnd) { clearTimeout(restT); restT = setTimeout(settle, 140); } }
  // a press on the page's own scrollbar stops a glide; a click anywhere else does not
  function onDown(e) { if (anim && (e.target === document.documentElement || e.clientX >= document.documentElement.clientWidth)) halt(); }

  /* ── on only while the page has something to snap ── */
  var on = false, checkT = 0;
  function attach(yes) {
    var f = yes ? "addEventListener" : "removeEventListener";
    window[f]("wheel", onWheel, { passive: false });
    window[f]("keydown", onKey);
    window[f]("scroll", onScroll, { passive: true });
    if (hasEnd) window[f]("scrollend", onEnd);
    window[f]("touchstart", onTouchStart, { passive: true });
    window[f]("touchend", onTouchEnd, { passive: true });
    window[f]("mousedown", onDown, { passive: true });
  }
  /* whether the page has anything that may snap, without measuring it: this runs after every burst of changes, and
     the homepage writes to itself on every frame of a scroll */
  function check() {
    var want = window.innerWidth >= MIN_W && !reduced.matches && (!!document.querySelector(BANDS) ||
      runs.some(function (f) { var d = f(); return !!(d && d.stops && d.stops.length); }));
    if (want === on) return;
    on = want;
    attach(on);
    if (on) { lastRest = Math.round(window.scrollY); lastPath = location.pathname; }
    else { halt(); G.last = 0; thaw(); }
  }
  // at most once every 150ms however busy the page is: a page that writes to itself on every frame never goes quiet
  function soon() { cache = null; if (!checkT) checkT = setTimeout(function () { checkT = 0; check(); }, 150); }
  // the document itself, which is there however early this runs
  new MutationObserver(soon).observe(document, {
    childList: true, subtree: true, attributes: true, attributeFilter: ["data-enc-guide-snap", "data-enc-chain"]
  });
  window.addEventListener("resize", soon);
  window.addEventListener("load", soon);
  if (reduced.addEventListener) reduced.addEventListener("change", soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  soon();

  // for a run's own controls (the Services pills): glide to a page position the same way
  window.encSnap = { glide: function (y) { if (on) glide(y, null); else put(clampY(y)); }, refresh: soon,
    active: function () { return on; } };
})();
