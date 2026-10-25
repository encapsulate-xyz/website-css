/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Sections by name — /#testimonials, /security#keys, /guides/sui#step-4.

   Every major section of every page has a short name a link can carry (the user, 2026-10-23: "add
   such for all major sections on all pages", after /#testimonials; and "from now on if we add any
   new section you add such name to it as well"). Notion's block ids cannot be renamed, so a name is
   looked up here and lands on the section like any #block-…; the name stays in the address.

   NAMES, page by page: name → where it lands, a selector or a list of them (the first one shown on
   the page wins) — a Notion block by its id, a band a script builds by the mark its builder sets
   (data-enc-sec, data-enc-svc-band, data-band…), which outlives a change to its words. A name is
   lower case, words joined by "-", from the section's own label where it has one. A band lands flush
   with the top of the screen (the bar scrolls away with the page on every page, so Super's 62px
   scroll-padding is not wanted); a heading in running text keeps GAP above it. Once a name is out it
   is kept: a section renamed later keeps its old name as a second key. A new section gets its name
   here, and in docs/paths-and-404.md's table, when it is built.
   PATTERNS make names from the page itself: a guide's steps (#step-4, #done) and the legal pages'
   clauses (#cookies). The chain pages name their own bands (chain.js: #terms, #estimate,
   #what-we-run, #common-questions) and land them; posts name their headings (post.js, #sec-…).

   THE LANDING (moved here from home.js, where it was the homepage's; measured 2026-10-18): on a
   fresh load the browser never jumped (scrollY stayed 0) while the page grew by a thousand pixels
   as it built, and arriving inside the app, Super's router jumped early and the page moved under
   it. So the section's top is put at the top of the screen, retried while the page builds, and
   given up the moment the reader wheels, touches or presses a key, so nobody is pulled back. A
   section that is hidden (a source a script has replaced) is left to the page.

   MOVED: an old page that is now a section. A Super redirect names a page and cannot carry a
   #fragment, so /team is a page again (the old Team page) and is forwarded from here — this file
   is in the site head, served in the HTML, where a page's own head script is only inserted once
   the app has started; head/team.html keeps a meta refresh for a reader without JavaScript. */
(function () {
  var GESTURE = ["wheel", "touchstart", "keydown"];
  var WAITS = [0, 300, 400, 500, 800, 1000, 1500];   // ms between tries: 4.5s in all
  var GAP = 40;   // px left above a heading in running text
  var MOVED = { "/team": "/#team" };

  function b(id) { return "#block-" + id; }
  function heading(sel) { return { sel: sel, gap: GAP }; }
  var NAMES = {
    "/": {
      stats: b("3dae800a513880b493f9e17a6928281c"),
      // the figures' four screens (Z, 2026-10-24): each lands where its move begins
      staked: b("07ef8a96f4f046bbb64c085e90cf8387"),
      delegators: b("48456287c6fc416bb4ed4663ed95d8f9"),
      mainnets: b("f763a6014900434ebcfb57466446ac5b"),
      uptime: b("979cee822a0342cb8745a2eaa128411a"),
      audience: b("3dae800a51388006a57be06b8ebea78e"),
      "why-stake": b("3dce800a513880349091dbe0cd0650a7"),
      networks: b("3dbe800a513880c09163d3ed4ab436fd"),
      // the section's heading callout: where the first quote pins at a desktop width
      testimonials: b("3dae800a51388066b66ffeeb9bdb1550"),
      governance: heading(b("8596efbf83c94c59ac8278879b8be3bc")),
      services: b("3dbe800a5138800d8a72c99cdde9bc3f"),
      institutional: b("3dbe800a513880af9fe0c4bc175e1975"),
      // the blog band, "Deep dives." since 2026-10-24; #blog was its name before and still lands
      "deep-dives": b("3dbe800a51388024a26be29fcf678e86"),
      blog: b("3dbe800a51388024a26be29fcf678e86"),
      team: b("3dbe800a513880c5862ae676c8d06994"),
      contact: b("3dce800a5138803a82f7d45863d6049c")
    },
    "/networks": {
      count: b("3dce800a51388154931ac3c9478a65b5"),
      list: b("3dde800a51388133b7f1d1ccdda08038"),
      "chain-teams": b("3dde800a5138819995f7de108ee8e815")
    },
    "/governance": {
      record: b("3dde800a513881b1b88dd0b73f874bfe"),
      pillars: [".enc-rec__head", b("a9ed1443a36c4f6da5ac9cbae489c031")],
      votes: heading(b("3e0e800a5138810c96e4f79c865ec3bc")),
      "by-outcome": "[data-enc-split]"
    },
    "/blog": {
      posts: b("a148eb7f8ea94b95b7725809fef9e0dc")
    },
    "/guides": {
      picker: b("3dde800a5138811e906fc383bd7a0789")
    },
    "/services": {
      dashboards: '[data-enc-svc-band="dashboards"]',
      playbooks: '[data-enc-svc-band="playbooks"]',
      repositories: '[data-enc-svc-band="repositories"]',
      bots: '[data-enc-svc-band="bots"]',
      monitoring: '[data-enc-svc-band="monitoring"]',
      launch: '[data-enc-svc-band="ask"]'
    },
    "/investments": {
      portfolio: '[data-enc-inv="01"]',
      questions: '[data-enc-inv="02"]'
    },
    "/brand": {
      logo: '.enc-band[data-band="1"]',
      colours: '.enc-band[data-band="2"]',
      colors: '.enc-band[data-band="2"]',
      type: '.enc-band[data-band="3"]',
      usage: '.enc-band[data-band="4"]',
      "clear-space": '.enc-band[data-band="4"]'   // its first name, for a day (2026-10-23)
    },
    "/security": {
      operations: '[data-enc-sec="01"]',
      access: '[data-enc-sec="02"]',
      keys: '[data-enc-sec="03"]',
      failover: '[data-enc-sec="04"]',
      upgrades: '[data-enc-sec="05"]',
      slashing: '[data-enc-sec="06"]'
    },
    "/contact": {
      call: ".enc-ct__call",
      elsewhere: ".enc-ct__where",
      write: ".enc-ct__write"
    }
  };

  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  var PATTERNS = [
    { path: /^\/guides\/[^/]+$/, name: /^(step-\d+|done)$/, gap: 0, find: function (name) {
      if (name === "done") return document.querySelector(".enc-gd__close");
      return document.querySelectorAll(".enc-gd__step")[+name.slice(5) - 1] || null;
    } },
    { path: /^\/(privacy-policy|terms-of-use)$/, name: /^[a-z0-9-]+$/, gap: GAP, find: function (name) {
      return Array.prototype.filter.call(document.querySelectorAll(".notion-root h2"), function (h) {
        return slug(h.textContent) === name;
      })[0] || null;
    } }
  ];

  function shown(el) { return el && el.getClientRects().length > 0; }

  /* what the address asks for on this page: a finder, or null when the fragment is not ours (a chain
     on /guides is guides.js's, an id the page sets itself is the browser's) */
  function wanted(path, hash) {
    var h = hash.slice(1).split(/[?&]/)[0];
    try { h = decodeURIComponent(h); } catch (e) { /* keep it as it is */ }
    if (/^block-[0-9a-f]{32}$/.test(h)) return function () { return { el: document.getElementById(h), gap: 0 }; };
    var name = h.toLowerCase(), spec = NAMES[path] && NAMES[path][name];
    if (spec) {
      var at = [].concat(spec.sel || spec), gap = spec.gap || 0;
      return function () {
        for (var i = 0; i < at.length; i++) {
          var el = document.querySelector(at[i]);
          if (shown(el)) return { el: el, gap: gap };
        }
        return null;
      };
    }
    for (var p = 0; p < PATTERNS.length; p++) {
      var pt = PATTERNS[p];
      if (pt.path.test(path) && pt.name.test(name)) return function () { return { el: pt.find(name), gap: pt.gap }; };
    }
    return null;
  }

  function pathOf(u) { return u.pathname.replace(/\/+$/, "") || "/"; }

  var at = "", run = 0;
  function land(hash) {
    var path = pathOf(location);
    if (hash == null) hash = location.hash;
    if (path + hash === at) return;
    at = path + hash;
    if (MOVED[path]) {
      var to = MOVED[path].split("#");
      return location.replace(to[0] + location.search + "#" + to[1]);
    }
    var find = wanted(path, hash);
    if (!find) return;
    var me = ++run, tries = 0, moved = false;
    function gesture() { moved = true; }
    GESTURE.forEach(function (t) { window.addEventListener(t, gesture, { passive: true, capture: true }); });
    function stop() { GESTURE.forEach(function (t) { window.removeEventListener(t, gesture, { capture: true }); }); }
    function go() {
      if (moved || me !== run) return stop();
      var t = find();
      if (t && shown(t.el)) {
        var top = t.el.getBoundingClientRect().top - t.gap;
        if (Math.abs(top) > 2) window.scrollTo({ top: top + window.scrollY, behavior: "instant" });
      }
      if (++tries < WAITS.length) setTimeout(go, WAITS[tries]); else stop();
    }
    go();
  }

  /* a fresh load; an arrival inside the app (Super swaps the page in: no event but the swap); a link
     to another section of the same page (hashchange, or Super's router with none); and a link to the
     section already in the address, which changes nothing the page can see but the click */
  land();
  new MutationObserver(function () { if (pathOf(location) + location.hash !== at) land(); })
    .observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", function () { land(); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href*='#']");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || pathOf(u) !== pathOf(location) || !wanted(pathOf(u), u.hash)) return;
    at = "";
    setTimeout(function () { land(u.hash); }, 0);
  });
})();
