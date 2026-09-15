/* /networks — the Network Count panels paged one per gesture. Linked from the /networks Head.

   The two count panels (network.css "NETWORK COUNT") are sticky, one viewport each, so the page
   already scrolls through them; this only decides where scrolling stops inside the band. Same
   rules as the homepage decks (home.js), which were tuned on a trackpad:
     - wheel / trackpad: one gesture = one panel. A new gesture is a 250ms pause, or — at least
       450ms after the page turned and once deltas fell below half their peak — a delta 4× the
       smallest since (≥ 20). Momentum tails last seconds and a swipe's own deltas wobble.
     - keys, scrollbar, touch: when the page comes to rest inside the band, settle on the panel in
       the direction of travel.
     - the browser's own smooth scroll; stops cached, dropped on resize and on DOM changes.
   Under 701px the panels are not sticky and nothing is paged. */
(function () {
  var BAND = "block-3dce800a51388154931ac3c9478a65b5";
  var EPS = 2, QUIET = 180, NEW_GAP = 250, MIN_LOCK = 450;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  var cache = null;
  function deck() {
    if (cache !== null) return cache;
    cache = false;
    var box = document.getElementById(BAND);
    if (!box) return cache;
    var panels = box.querySelectorAll(".notion-callout");
    if (panels.length < 2 || getComputedStyle(panels[0]).position !== "sticky") return cache;
    // sticky panels report their stuck position; measure from the band's bottom, which never moves
    var h = panels[0].offsetHeight, bottom = docTop(box) + box.offsetHeight, stops = [];
    for (var i = 0; i < panels.length; i++) stops.push(Math.round(bottom - (panels.length - i) * h));
    return (cache = { stops: stops, h: h });
  }
  function invalidate() { cache = null; }

  var anim = null, lastRest = window.scrollY, gestureUntil = 0;
  function scrollToY(target) {
    target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    if (Math.abs(target - window.scrollY) < 1) { lastRest = target; return; }
    var smooth = !reduced.matches;
    if (anim) clearTimeout(anim.timer);
    anim = { target: target, timer: setTimeout(finish, smooth ? 900 : 50) };
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "instant" });
  }
  function finish() { if (!anim) return; clearTimeout(anim.timer); lastRest = window.scrollY; anim = null; }
  function arrived() { if (anim && Math.abs(window.scrollY - anim.target) <= 1) finish(); }

  function inside(d, y) { return d && y > d.stops[0] - EPS && y < d.stops[d.stops.length - 1] + EPS; }
  function onStop(d, y) { return d.stops.some(function (s) { return Math.abs(s - y) <= EPS; }); }
  function landStop(d, y, dir) {
    var s = d.stops, half = d.h / 2;
    if (dir > 0) { for (var i = 0; i < s.length; i++) if (s[i] >= y - half) return s[i]; return s[s.length - 1]; }
    for (var j = s.length - 1; j >= 0; j--) if (s[j] <= y + half) return s[j];
    return s[0];
  }
  function nextStop(d, y, dir) {
    var s = d.stops;
    if (dir > 0) { for (var i = 0; i < s.length; i++) if (s[i] > y + EPS) return s[i]; }
    else { for (var j = s.length - 1; j >= 0; j--) if (s[j] < y - EPS) return s[j]; }
    return null;
  }

  var lastWheel = 0, lockedAt = 0, peak = 0, tailMin = Infinity, decayed = false, locked = false;
  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    var now = performance.now(), abs = Math.abs(e.deltaY), gap = now - lastWheel;
    lastWheel = now;
    gestureUntil = now + QUIET;
    if (locked && gap <= NEW_GAP) {
      peak = Math.max(peak, abs);
      if (abs < peak * 0.5) decayed = true;
      var rise = decayed && now - lockedAt > MIN_LOCK && abs > Math.max(tailMin * 4, 20);
      if (decayed) tailMin = Math.min(tailMin, abs);
      if (!rise) { e.preventDefault(); return; }
    }
    locked = false;
    var d = deck(), dir = e.deltaY > 0 ? 1 : -1;
    var y = anim ? anim.target : window.scrollY;
    if (!inside(d, y)) { if (anim) e.preventDefault(); return; }
    var target = onStop(d, y) ? nextStop(d, y, dir) : landStop(d, y, dir);
    if (target === null) { if (anim) e.preventDefault(); return; } // past the last panel: scroll on
    e.preventDefault();
    locked = true; lockedAt = now; peak = abs; tailMin = Infinity; decayed = false;
    scrollToY(target);
  }, { passive: false });

  var touching = false, restTimer = 0, retry = 0;
  function settle() {
    if (anim || touching) return;
    if (performance.now() < gestureUntil) { clearTimeout(retry); retry = setTimeout(settle, QUIET + 20); return; }
    var d = deck(), y = window.scrollY;
    if (!inside(d, y)) { lastRest = y; return; }
    if (onStop(d, y)) { lastRest = y; return; }
    var dir = y >= lastRest ? 1 : -1;
    var t = onStop(d, lastRest) && Math.abs(y - lastRest) < d.h ? nextStop(d, lastRest, dir) : landStop(d, y, dir);
    scrollToY(t === null ? landStop(d, y, dir) : t);
  }
  var hasScrollEnd = "onscrollend" in window;
  if (hasScrollEnd) window.addEventListener("scrollend", function () { arrived(); setTimeout(settle, 30); });
  window.addEventListener("scroll", function () {
    if (!hasScrollEnd) { clearTimeout(restTimer); restTimer = setTimeout(function () { arrived(); settle(); }, 140); }
    arrived();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });

  new MutationObserver(invalidate).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", invalidate);
  window.addEventListener("load", invalidate);
})();
