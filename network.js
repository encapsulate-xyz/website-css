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
  /* NAME THEM APART. Both bands live in this one IIFE, and a second `var BAND` further down
     (the 5m marks band) overwrote this one at run time — so the count deck and the kicker were
     both measuring the wrong element, which is why the label would not get out of the figure's
     way (2026-09-21). */
  var COUNT_BAND = "block-3dce800a51388154931ac3c9478a65b5";
  window.encNetwork = { version: 2 };   // a marker, so a live page can be asked whether this ran
  var EPS = 2, QUIET = 180, NEW_GAP = 250, MIN_LOCK = 450;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  var cache = null;
  function deck() {
    if (cache !== null) return cache;
    // A negative answer is NOT cached: the first call can land before network.css has applied (the
    // panels are not sticky yet), and caching that would leave the deck dead until the next resize.
    var box = document.getElementById(COUNT_BAND);
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
  /* The kicker is a strip pinned to the viewport, so at the end of the band — where the last
     panel rises out — the panel's own stack passes under it. Rather than guess at a scroll
     position, measure: the label occupies 26px to 42px, so the moment a panel's content crosses
     that line the label is in the way and fades. It comes back on the way up, and a band that is
     not on screen is left alone. */
  var LABEL_TOP = 26, LABEL_BOTTOM = 42;   /* the strip the design's bar occupies */

  function paintKicker() {
    var box = document.getElementById(COUNT_BAND);
    if (!box) return;
    var rect = box.getBoundingClientRect();
    var leaving = false;
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      /* the panel's stack fills the screen (its children are centred in it), so the box says
         nothing about where the ink is — measure the first thing in it, the index line. */
      /* the panels only: the band is a callout too, and its own first child is the kicker —
         measured against itself the rule was true everywhere. Every line of a panel is checked,
         not just the first: once the index has passed the label, the figure is the thing in it. */
      var panels = box.querySelectorAll(".notion-callout"), showing = false;
      for (var i = 0; i < panels.length; i++) {
        var stack = panels[i].querySelector(":scope > .notion-callout__content");
        if (!stack) continue;
        var line = stack.firstElementChild;
        while (line) {
          var s = line.getBoundingClientRect();
          if (s.height) {
            if (s.top < LABEL_BOTTOM + 6 && s.bottom > LABEL_TOP - 6) leaving = true;
            if (s.bottom > 0 && s.top < window.innerHeight) showing = true;
          }
          line = line.nextElementSibling;
        }
      }
      /* and the label does not stand alone: once every panel's lines have gone past, the band is
         its ground and nothing else, and a lone kicker over it reads as a mistake. */
      if (!showing) leaving = true;
    }
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

  /* ── 5m, the set as a marquee ── (design "Networks Set" 5m, 2026-09-25)
     Under the band's heading, every chain — all of them, not a tier — runs as one strip of names at
     display size, each with its disc, drifting left on the −50% loop (the Networks 20e
     construction) across a paper band full-bleed under the ink. Names rest grey; the hovered one is
     ink with its disc in tint, and hovering pauses the strip (network.css). The second half is the
     loop's copy: hidden from assistive tech and out of the tab order.
     Nothing is listed here. The chains are the Networks set's own, in its Order: /networks renders
     only the active tab, so the list comes from the all-stages view on /services that the navbar
     already reads for the counts (window.encCounts → list). A name links to its chain page where
     the set has one (mainnet rows); a testnet-only chain is a name. If that read fails, the strip
     falls back to the cards on this page. */
  var BAND = "block-3dde800a5138819995f7de108ee8e815";
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var chainsOnce = null;

  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }

  function fromPage() {
    var db = document.getElementById(SET_DB);
    if (!db) return [];
    var out = [], seen = {};
    Array.prototype.forEach.call(db.querySelectorAll(".notion-collection-card"), function (c) {
      var img = c.querySelector("img"), name = c.querySelector(".notion-property__title");
      if (!name) return;
      var nm = name.textContent.trim(), a = c.querySelector("a[href]");
      if (seen[nm]) return;
      seen[nm] = 1;
      out.push({ name: nm, glyph: img ? original(img.currentSrc || img.src) : "", href: a ? a.getAttribute("href") : "" });
    });
    return out;
  }

  function chains() {
    if (chainsOnce) return chainsOnce;
    chainsOnce = (typeof window.encCounts === "function" ? window.encCounts() : Promise.resolve(null))
      .then(function (c) { return c && c.list && c.list.length ? c.list : null; }, function () { return null; });
    return chainsOnce;
  }

  function item(r, i, copy) {
    var a = document.createElement(r.href ? "a" : "span");
    a.className = "enc-set-name";
    if (r.href) a.href = r.href;
    a.style.setProperty("--tint", TINTS[i % TINTS.length]);
    if (copy) {
      a.setAttribute("aria-hidden", "true");
      if (r.href) a.tabIndex = -1;
    } else if (r.href) {
      a.setAttribute("aria-label", r.name);
    }
    var disc = document.createElement("span");
    disc.className = "enc-set-disc";
    if (r.glyph) {
      var im = document.createElement("img");
      im.src = r.glyph;
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      disc.appendChild(im);
    }
    a.appendChild(disc);
    a.appendChild(document.createTextNode(r.name));
    return a;
  }

  function draw(content, rows) {
    var sig = rows.map(function (r) { return r.name + ">" + (r.href || ""); }).join("|");
    var old = content.querySelector(":scope > .enc-set-strip");
    if (old && old.getAttribute("data-sig") === sig) return;
    if (old) old.remove();
    var strip = document.createElement("div");
    strip.className = "enc-set-strip";
    strip.setAttribute("data-sig", sig);
    var tape = document.createElement("div");
    tape.className = "enc-set-tape";
    rows.forEach(function (r, i) { tape.appendChild(item(r, i, false)); });
    rows.forEach(function (r, i) { tape.appendChild(item(r, i, true)); });
    strip.appendChild(tape);
    content.appendChild(strip);
  }

  function marks() {
    var band = document.getElementById(BAND);
    if (!band) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    // draw what the page has at once (the mainnet cards), then the whole set when it arrives
    if (!content.querySelector(":scope > .enc-set-strip")) {
      var here = fromPage();
      if (here.length) draw(content, here);
    }
    chains().then(function (list) {
      if (list) draw(content, list);
    });
  }

  /* ── the counts, from the Networks set ──
     The count band's two figures (mainnets, testnets) and the 5m heading's "Thirty-five teams chose
     us." (the chains, spelled) are Notion text, rewritten here
     from the set's own rows — the same counts the navbar carries, read once
     per visit from the all-stages view on /services (navbar.js). Only the digits are replaced, so
     the words around them stay Notion's; if the counts cannot be read, Notion's numbers stand. */
  var FIG_MAIN = "block-3dce800a5138818e8123ed8b8471935d";
  var FIG_TEST = "block-3dce800a5138812a995cd075afdf49a2";
  var TEAMS = "block-3dde800a513881b7ae8dc2e00b42d7f9";   /* "Thirty-five teams chose us." */
  var ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
  var TENS = "  twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
  var NUMWORD = /^(\d+|(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-[a-z]+)?)\b/i;
  function spell(n) {
    var w = n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  /* the leading number of a heading, in the form it was written in: digits stay digits */
  function setLead(el, n) {
    if (!el || !(n > 0) || n > 99) return;
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = walk.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      var lead = node.nodeValue.match(/^\s*/)[0], rest = node.nodeValue.slice(lead.length);
      var m = NUMWORD.exec(rest);
      if (!m) return;
      var v = lead + (/^\d/.test(m[1]) ? String(n) : spell(n)) + rest.slice(m[1].length);
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
  }
  function setNumber(el, n) {
    if (!el || !(n >= 0)) return;
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = walk.nextNode())) {
      if (!/\d/.test(node.nodeValue)) continue;
      var v = node.nodeValue.replace(/\d+/, String(n));
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
  }
  function figures() {
    if (typeof window.encCounts !== "function") return;
    if (!document.getElementById(FIG_MAIN) && !document.getElementById(BAND)) return;
    window.encCounts().then(function (c) {
      if (!c) return;
      setNumber(document.getElementById(FIG_MAIN), c.mainnet);
      setNumber(document.getElementById(FIG_TEST), c.testnet);
      setLead(document.getElementById(TEAMS), c.chains);
    });
  }

  /* ── the Networks index (design "Networks Index", 2026-09-25) ──
     The set is drawn as the design's index: Super's gallery cards are the ledger's rows
     (network.css), and this builds what Notion cannot hold — the Mainnet/Testnet switch, the sort,
     the field (the one case the rule allows) — and fills the stage from the card under the pointer.
     The switch clicks Super's own view picker, which stays in the page unseen; its labels are the
     views' own names and its counts the set's own (encCounts). Nothing about a chain is written
     here: the stage copies the card's title, rate, role, glyph and link. */
  var SORTS = [["set", "Default"], ["name", "Name A–Z"], ["rate", "Highest rate"]];
  var RATE_PROP = "property-597e3d69", ROLE_PROP = "property-585f6e6c";
  var TINT = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var DEEP = ["#B4D98F", "#E8CB72", "#A3C3EC", "#EDB98A", "#E9A9C2"];
  var setList = null;   // every chain once, in Order: the tint and whether a testnet chain is also on mainnet
  var state = { q: "", sort: "set", active: null };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function put(node, text) { if (node && node.textContent !== text) node.textContent = text; }
  function attr(node, name, value) {
    if (value === null) { if (node.hasAttribute(name)) node.removeAttribute(name); }
    else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  }
  function cardsOf(db) {
    return Array.prototype.slice.call(db.querySelectorAll(".notion-collection-card"));
  }
  function nameOf(card) {
    var t = card.querySelector(".notion-property__title");
    return t ? t.textContent.trim() : "";
  }
  function options(db) { return Array.prototype.slice.call(db.querySelectorAll(".notion-dropdown__option")); }
  function testnetView(db) {
    var on = db.querySelector(".notion-dropdown__option.active");
    return !!on && /testnet/i.test(on.textContent);
  }
  function listIndex(name) {
    if (!setList) return -1;
    var k = name.toLowerCase();
    for (var i = 0; i < setList.length; i++) if ((setList[i].name || "").toLowerCase() === k) return i;
    return -1;
  }

  function applyControls(db) {
    var cards = cardsOf(db), testnet = testnetView(db);
    attr(db, "data-enc-view", testnet ? "testnet" : "mainnet");
    if (testnet && state.sort === "rate") state.sort = "set";   // the design drops the rate sort on testnet
    var q = state.q.trim().toLowerCase(), shown = 0;
    cards.forEach(function (card, i) {
      if (card.__setIndex === undefined) card.__setIndex = i;
      var hit = !q || nameOf(card).toLowerCase().indexOf(q) >= 0;
      if (card.hidden !== !hit) card.hidden = !hit;
      if (hit) shown++;
      // a testnet row says "Also mainnet" when the chain runs both
      var j = listIndex(nameOf(card));
      attr(card, "data-enc-also", testnet && j >= 0 && /\/networks\/mainnet\//.test(setList[j].href || "") ? "" : null);
    });
    var order = cards.filter(function (c) { return !c.hidden; });
    if (state.sort === "name") {
      order.sort(function (a, b) { return nameOf(a).localeCompare(nameOf(b)); });
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
        return y - x;
      });
    } else {
      order.sort(function (a, b) { return a.__setIndex - b.__setIndex; });
    }
    order.forEach(function (c, i) { if (c.style.order !== String(i)) c.style.order = i; });
    cards.forEach(function (c) { if (c.hidden && c.style.order !== "9999") c.style.order = 9999; });
    var empty = db.querySelector(":scope > .enc-set-empty");
    if (empty) {
      empty.hidden = shown !== 0;
      put(empty, "No network matches “" + state.q.trim() + "”.");
    }
    // the stage follows the pointer; with none, the first row as ordered
    var active = state.active && order.indexOf(state.active) >= 0 ? state.active : order[0];
    stage(db, active || null, testnet);
    sync(db, testnet);
  }

  function stage(db, card, testnet) {
    var st = db.querySelector(":scope > .enc-set-stage");
    if (!st) return;
    cardsOf(db).forEach(function (c) { attr(c, "data-enc-on", c === card ? "" : null); });
    st.hidden = !card;
    if (!card) return;
    var name = nameOf(card);
    var j = listIndex(name), i = j >= 0 ? j : (card.__setIndex || 0);
    st.style.setProperty("--tint", TINT[i % 5]);
    st.style.setProperty("--deep", DEEP[i % 5]);
    attr(st, "data-stage", testnet ? "testnet" : "mainnet");
    // the glyph at full size: Super keeps the original beside its resized copy
    var full = card.querySelector("[data-full-size]"), img = card.querySelector("img");
    var glyph = st.querySelector(".enc-set-stage__disc img");
    var src = full ? full.getAttribute("data-full-size") : img ? original(img.currentSrc || img.src) : "";
    if (glyph.getAttribute("src") !== src) glyph.setAttribute("src", src);
    glyph.alt = name;
    var rate = card.querySelector("." + RATE_PROP), role = card.querySelector("." + ROLE_PROP);
    put(st.querySelector(".enc-set-stage__v"), testnet ? name : (rate ? rate.textContent.trim() : "") || "—");
    put(st.querySelector(".enc-set-stage__role"), testnet && role ? role.textContent.trim() : "");
    // the row's own page; a testnet row has none, so a chain that also runs mainnet opens that page
    var link = card.querySelector("a.notion-collection-card__anchor[href]"), go = st.querySelector(".enc-set-stage__go");
    var href = link ? link.getAttribute("href") : (j >= 0 && setList[j].href) || "";
    go.hidden = !href;
    if (href && go.getAttribute("href") !== href) go.setAttribute("href", href);
    put(go.querySelector(".enc-set-stage__name"), name);
  }

  // the switch mirrors Super's picker; the sort offers the rate only on mainnet
  function sync(db, testnet) {
    var tabs = db.querySelector(".enc-set-tabs");
    if (!tabs) return;
    var opts = options(db);
    if (tabs.children.length !== opts.length) {
      tabs.textContent = "";
      opts.forEach(function (o, i) {
        var b = el("button", "enc-set-tab");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.appendChild(el("span", "enc-set-tab__t"));
        b.appendChild(el("span", "enc-set-tab__n"));
        b.addEventListener("click", function () {
          var o2 = options(db)[i];
          if (o2 && !o2.classList.contains("active")) { state.active = null; o2.click(); }
        });
        tabs.appendChild(b);
      });
    }
    opts.forEach(function (o, i) {
      var b = tabs.children[i], label = o.textContent.trim();
      put(b.querySelector(".enc-set-tab__t"), label);
      attr(b, "aria-selected", o.classList.contains("active") ? "true" : "false");
      var n = counts ? (/testnet/i.test(label) ? counts.testnet : /mainnet/i.test(label) ? counts.mainnet : null) : null;
      put(b.querySelector(".enc-set-tab__n"), n == null ? "" : String(n));
    });
    var menu = db.querySelector(".enc-set-sort__menu"), label = db.querySelector(".enc-set-sort__label");
    if (menu) Array.prototype.forEach.call(menu.children, function (item) {
      var key = item.getAttribute("data-icon");
      item.hidden = key === "rate" && testnet;
      attr(item, "aria-selected", key === state.sort ? "true" : "false");
      if (key === state.sort) put(label, item.textContent);
    });
  }
  var counts = null;

  function controls() {
    var db = document.getElementById(SET_DB);
    if (!db) return;
    if (!db.querySelector(":scope > .enc-set-controls")) build(db);
    applyControls(db);
  }

  function build(db) {
    /* The controls are kept OUT of Super's markup: inside its picker or its header, its own handlers
       ran first and swallowed the click (the recipe in CLAUDE.md). They hang off the collection. */
    var wrap = el("div", "enc-set-controls");
    var tabs = el("div", "enc-set-tabs");
    tabs.setAttribute("role", "tablist");
    wrap.appendChild(tabs);

    var sort = el("div", "enc-set-sort");
    var button = el("button", "enc-set-sort__button");
    button.type = "button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.appendChild(el("span", "enc-set-sort__label", SORTS[0][1]));
    var menu = el("div", "enc-set-sort__menu");
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Sort networks");
    menu.hidden = true;
    var pressed = 0;
    function toggleMenu(open) {
      menu.hidden = open === undefined ? !menu.hidden : !open;
      button.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
    }
    SORTS.forEach(function (o) {
      var item = el("button", "enc-set-sort__option", o[1]);
      item.type = "button";
      item.setAttribute("role", "option");
      item.setAttribute("data-icon", o[0]);
      function choose() { state.sort = o[0]; applyControls(db); }
      /* chosen on pointerdown (a cancelled click cannot swallow it), closed only once the press is
         over — hidden mid-press, the click that follows would land on the row beneath */
      item.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        pressed = Date.now();
        choose();
        window.addEventListener("pointerup", function up() {
          window.removeEventListener("pointerup", up, true);
          setTimeout(function () { toggleMenu(false); }, 0);
        }, true);
      });
      item.addEventListener("click", function () {
        if (Date.now() - pressed > 700) choose();
        toggleMenu(false);
      });
      menu.appendChild(item);
    });
    button.addEventListener("pointerdown", function (e) { e.preventDefault(); toggleMenu(); });
    button.addEventListener("click", function (e) { e.preventDefault(); });
    document.addEventListener("pointerdown", function (e) {
      if (!menu.hidden && !sort.contains(e.target)) toggleMenu(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) toggleMenu(false); });
    sort.appendChild(button);
    sort.appendChild(menu);
    wrap.appendChild(sort);

    var input = el("input", "enc-set-search");
    input.type = "search";
    input.placeholder = "Find a network";
    input.setAttribute("aria-label", "Find a network");
    input.addEventListener("input", function () { state.q = input.value; applyControls(db); });
    // Super cancels pointer events on the document, and a cancelled pointerdown focuses nothing
    input.addEventListener("pointerdown", function () {
      if (document.activeElement !== input) setTimeout(function () { input.focus(); }, 0);
    });
    wrap.appendChild(input);
    db.appendChild(wrap);

    var empty = el("p", "enc-set-empty");
    empty.hidden = true;
    db.appendChild(empty);

    var st = el("aside", "enc-set-stage");
    var disc = el("div", "enc-set-stage__disc");
    disc.appendChild(el("img"));
    st.appendChild(disc);
    var facts = el("div", "enc-set-stage__facts");
    facts.appendChild(el("span", "enc-set-stage__k"));
    facts.appendChild(el("span", "enc-set-stage__v"));
    facts.appendChild(el("p", "enc-set-stage__role"));
    st.appendChild(facts);
    var go = el("a", "enc-set-stage__go");
    go.appendChild(el("span", "enc-set-stage__name"));
    st.appendChild(go);
    db.appendChild(st);

    // the row under the pointer, or in focus, is the one on the stage
    function pick(e) {
      var card = e.target.closest && e.target.closest(".notion-collection-card");
      if (!card || !db.contains(card) || state.active === card) return;
      state.active = card;
      stage(db, card, testnetView(db));
    }
    db.addEventListener("pointerover", pick);
    db.addEventListener("focusin", pick);
    // the rate sits over the row's link so its tip can show; a click on it is still the row's
    db.addEventListener("click", function (e) {
      var lab = e.target.closest && e.target.closest("." + RATE_PROP + ", ." + ROLE_PROP);
      if (!lab) return;
      var a = lab.closest(".notion-collection-card").querySelector("a.notion-collection-card__anchor[href]");
      if (a) a.click();
    });

    if (window.encCounts) window.encCounts().then(function (c) {
      if (!c) return;
      counts = c;
      if (c.list && c.list.length) setList = c.list;
      applyControls(db);
    });
  }

  var ct = 0;
  new MutationObserver(function () {
    invalidate(); marks(); figures();
    clearTimeout(ct); ct = setTimeout(controls, 0);   // Super re-renders every row on a view switch
  }).observe(document.body, { childList: true, subtree: true });
  marks();
  controls();
  window.addEventListener("load", function () { marks(); controls(); });
  window.addEventListener("resize", invalidate);
  window.addEventListener("load", function () { invalidate(); paintKicker(); });
  paintKicker();
})();
