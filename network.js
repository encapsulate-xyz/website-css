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
  window.encNetwork = { version: 2 };   // a marker, so a live page can be asked whether this ran
  var EPS = 2, QUIET = 180, NEW_GAP = 250, MIN_LOCK = 450;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  var cache = null;
  function deck() {
    if (cache !== null) return cache;
    // A negative answer is NOT cached: the first call can land before network.css has applied (the
    // panels are not sticky yet), and caching that would leave the deck dead until the next resize.
    var box = document.getElementById(BAND);
    if (!box) return false;
    var panels = box.querySelectorAll(".notion-callout");
    if (panels.length < 2 || getComputedStyle(panels[0]).position !== "sticky") return false;
    // sticky panels report their stuck position; measure from the band's bottom, which never moves
    var h = panels[0].offsetHeight;
    var bottom = docTop(box) + box.offsetHeight - (parseFloat(getComputedStyle(box).paddingBottom) || 0);
    var stops = [];
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
  /* The kicker is sticky over the whole band, so past the last panel it would sit alone over the
     band's ground. Mark the band while that is true and network.css fades the label out. */
  function paintKicker() {
    var d = deck(), box = document.getElementById(BAND);
    if (!box || !d) return;
    var leaving = window.scrollY > d.stops[d.stops.length - 1] + 8;
    if (leaving === box.hasAttribute("data-enc-leaving")) return;
    if (leaving) box.setAttribute("data-enc-leaving", "");
    else box.removeAttribute("data-enc-leaving");
  }

  var hasScrollEnd = "onscrollend" in window;
  if (hasScrollEnd) window.addEventListener("scrollend", function () { arrived(); setTimeout(settle, 30); });
  window.addEventListener("scroll", function () {
    if (!hasScrollEnd) { clearTimeout(restTimer); restTimer = setTimeout(function () { arrived(); settle(); }, 140); }
    arrived();
    paintKicker();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });

  /* ── 5m, the marks row ──
     The band under the set restates the set itself: one disc per chain, read from the gallery that
     is already on the page (its cards are sorted by Order, so the first twelve are the god and
     high tiers, as the design's row is). Nothing is listed here — add a network in Notion and the
     row follows. The glyph is the card's cover, taken at its original size rather than through
     Super's optimizer. */
  var BAND = "block-3dde800a5138819995f7de108ee8e815";
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var SHOWN = 12;

  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }

  function marks() {
    var band = document.getElementById(BAND), db = document.getElementById(SET_DB);
    if (!band || !db) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    var cards = db.querySelectorAll(".notion-collection-card");
    if (!cards.length) return;
    var rows = [];
    for (var i = 0; i < cards.length && rows.length < SHOWN; i++) {
      var img = cards[i].querySelector("img");
      var name = cards[i].querySelector(".notion-property__title");
      if (img && name) rows.push({ src: original(img.currentSrc || img.src), name: name.textContent.trim() });
    }
    if (!rows.length) return;
    var sig = rows.map(function (r) { return r.name; }).join("|") + "/" + cards.length;
    var old = content.querySelector(":scope > .enc-set-marks");
    if (old && old.getAttribute("data-sig") === sig) return;
    if (old) old.remove();

    var wrap = document.createElement("div");
    wrap.className = "enc-set-marks";
    wrap.setAttribute("data-sig", sig);
    rows.forEach(function (r, i) {
      var span = document.createElement("span");
      span.className = "enc-set-mark";
      span.title = r.name;
      span.style.setProperty("--mark-tint", TINTS[i % TINTS.length]);
      var im = document.createElement("img");
      im.src = r.src;
      im.alt = "";
      im.loading = "lazy";
      span.appendChild(im);
      wrap.appendChild(span);
    });
    content.appendChild(wrap);
    /* THE "+N MORE" IS NOTION'S. Super sends only the rendered view's rows, so a count taken from
       the page would describe one tab (16 of the mainnet set) rather than the whole set (35).
       The band carries the line as its own text block; this only moves it onto the row. */
    var more = null;
    Array.prototype.forEach.call(content.querySelectorAll(":scope > p.notion-text"), function (p) {
      if (/^\s*\+\s*\d+\s*more\b/i.test(p.textContent)) more = p;
    });
    if (more) {
      more.classList.add("enc-set-more");
      wrap.appendChild(more);
    }
  }

  /* ── the control bar's sort and search ──
     Design "Networks Set" puts three things in one bar: the stage tabs, a sort menu and a field
     for finding a chain. Super gives the tabs (its view picker); Notion has no block that is a
     text input or a menu, so these two are built here — the one case the rule allows. They work on
     the cards Super rendered: search hides the ones that do not match, sort reorders them with the
     grid's `order`, and "Default" restores the view's own sequence. Nothing is fetched. */
  var SORTS = [["set", "Default"], ["name", "By name"], ["rate", "By reward rate"]];
  var RATE_PROP = "property-597e3d69";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function cardsOf(db) {
    return Array.prototype.slice.call(db.querySelectorAll(".notion-collection-card"));
  }

  function applyControls(db, state) {
    var cards = cardsOf(db);
    var q = (state.q || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card, i) {
      if (card.__setIndex === undefined) card.__setIndex = i;
      var name = (card.querySelector(".notion-property__title") || {}).textContent || "";
      var hit = !q || name.toLowerCase().indexOf(q) >= 0;
      card.hidden = !hit;
      if (hit) shown++;
    });
    var order = cards.slice().filter(function (c) { return !c.hidden; });
    if (state.sort === "name") {
      order.sort(function (a, b) {
        var an = (a.querySelector(".notion-property__title") || {}).textContent || "";
        var bn = (b.querySelector(".notion-property__title") || {}).textContent || "";
        return an.localeCompare(bn);
      });
    } else if (state.sort === "rate") {
      var num = function (c) {
        var r = c.querySelector("." + RATE_PROP);
        var n = r ? parseFloat(r.textContent.replace("%", "")) : NaN;
        return isNaN(n) ? null : n;
      };
      order.sort(function (a, b) {
        var x = num(a), y = num(b);
        if (x === null && y === null) return a.__setIndex - b.__setIndex;
        if (x === null) return 1;
        if (y === null) return -1;
        return y - x;   // highest first, as the design sorts it
      });
    } else {
      order.sort(function (a, b) { return a.__setIndex - b.__setIndex; });
    }
    order.forEach(function (c, i) { c.style.order = i; });
    // a filtered-out card keeps no stale position in the grid
    cards.forEach(function (c) { if (c.hidden) c.style.order = 9999; });
    db.setAttribute("data-enc-shown", String(shown));
    var empty = db.querySelector(".enc-set-empty");
    if (empty) empty.hidden = shown !== 0;
  }

  function controls() {
    var db = document.getElementById(SET_DB);
    if (!db) return;
    /* The controls are kept OUT of Super's markup altogether. Inside the picker's menu, and then
       inside the collection header, its own handlers ran first and swallowed the click — the field
       never took focus and the sort button did nothing (measured on the live page). They now hang
       off the collection itself, and network.css lays them over the right of the header row, so the
       bar still reads as one control while no Super handler sits between the click and the input. */
    var bar = db.querySelector(".notion-collection") || db;
    if (!bar || bar.querySelector(".enc-set-controls")) return;
    if (getComputedStyle(bar).position === "static") bar.style.position = "relative";

    var state = { q: "", sort: "set" };
    var wrap = el("div", "enc-set-controls");
    /* NO capture-phase stopPropagation here. An earlier version added one while the controls still
       lived inside Super's picker; once they moved out it did nothing useful and one real harm —
       stopping an event during CAPTURE on the wrapper keeps it from ever reaching the button and
       the field inside it, so the sort menu never opened. */

    // sort
    var sort = el("div", "enc-set-sort");
    var button = el("button", "enc-set-sort__button");
    button.type = "button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    var label = el("span", "enc-set-sort__label", SORTS[0][1]);
    button.appendChild(label);
    var menu = el("div", "enc-set-sort__menu");
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Sort the networks");
    menu.hidden = true;
    SORTS.forEach(function (o) {
      var item = el("button", "enc-set-sort__option", o[1]);
      item.type = "button";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", o[0] === state.sort ? "true" : "false");
      item.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        state.sort = o[0];
        label.textContent = o[1];
        Array.prototype.forEach.call(menu.children, function (c) {
          c.setAttribute("aria-selected", c === item ? "true" : "false");
        });
        toggleMenu(false);
        applyControls(db, state);
      });
      menu.appendChild(item);
    });
    // the same for the menu: open it on pointerdown, so a cancelled click cannot swallow it
    function toggleMenu(open) {
      menu.hidden = open === undefined ? !menu.hidden : !open;
      button.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
    }
    button.addEventListener("pointerdown", function (e) { e.preventDefault(); toggleMenu(); });
    button.addEventListener("click", function (e) { e.preventDefault(); });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !sort.contains(e.target)) toggleMenu(false);
    });
    sort.appendChild(button);
    sort.appendChild(menu);

    // search
    var field = el("label", "enc-set-search");
    var input = el("input", "enc-set-search__input");
    input.type = "search";
    input.placeholder = "Find a network";
    input.setAttribute("aria-label", "Find a network");
    input.addEventListener("input", function () {
      state.q = input.value;
      field.setAttribute("data-filled", input.value ? "" : null);
      if (!input.value) field.removeAttribute("data-filled");
      applyControls(db, state);
    });
    field.appendChild(input);
    /* Focus explicitly. A click normally focuses the field by itself, but Super listens for pointer
       events on the document to close its dropdown and cancels them, and a cancelled pointerdown
       never focuses anything — which is why typing did nothing. Focusing here does not depend on
       the default action surviving. */
    ["pointerdown", "mousedown", "click", "touchstart"].forEach(function (type) {
      field.addEventListener(type, function () {
        if (document.activeElement !== input) setTimeout(function () { input.focus(); }, 0);
      });
    });

    wrap.appendChild(sort);
    wrap.appendChild(field);
    bar.appendChild(wrap);

    // the line shown when a search matches nothing
    if (!db.querySelector(".enc-set-empty")) {
      var empty = el("p", "enc-set-empty", "No network here matches that. We may not run it yet — tell us and we will look at it.");
      empty.hidden = true;
      var gal = db.querySelector(".notion-collection-gallery");
      if (gal && gal.parentElement) gal.parentElement.insertBefore(empty, gal.nextSibling);
    }
    applyControls(db, state);
  }

  new MutationObserver(function () { invalidate(); marks(); controls(); }).observe(document.body, { childList: true, subtree: true });
  marks();
  controls();
  window.addEventListener("load", function () { marks(); controls(); });
  window.addEventListener("resize", invalidate);
  window.addEventListener("load", function () { invalidate(); paintKicker(); });
  paintKicker();
})();
