/* /networks — the page's scripts: the Network Count band's tally, the 5m strip, the counts
   from the Networks set, and the set drawn as the design's index. Loaded from the site head;
   everything runs off one observer, so a client-side arrival at /networks builds it too. */
(function () {
  window.encNetwork = { version: 3 };   // a marker, so a live page can be asked whether this ran

  /* ── the Network Count band (design "Network Count Patterns", I · the hollow, 2026-09-25) ──
     The figures, the label, the line and the testnet row are Notion's (network.css lays them
     out). This adds only the tally beside the line — one green stroke per mainnet, five to a gate,
     the fifth struck across — decoration drawn from the count, and it follows the count. The
     two sticky panels it replaced were paged here one gesture at a time; that went with them. */
  var COUNT_LINE = "block-3dce800a513881918fcaebc5e6b88130";   // "A validator of ours in the active set…"
  function tally(n) {
    var line = document.getElementById(COUNT_LINE);
    if (!line || !(n > 0)) return;
    var t = line.parentNode.querySelector(":scope > .enc-tally");
    if (t && t.getAttribute("data-n") === String(n)) return;
    if (!t) {
      t = document.createElement("span");
      t.className = "enc-tally";
      t.setAttribute("aria-hidden", "true");
      line.parentNode.insertBefore(t, line.nextSibling);
    }
    t.setAttribute("data-n", String(n));
    t.textContent = "";
    for (var g = 0; g * 5 < n; g++) {
      var m = Math.min(5, n - g * 5), gate = document.createElement("span");
      gate.className = "enc-tally__gate";
      for (var i = 0; i < Math.min(4, m); i++) gate.appendChild(document.createElement("i"));
      if (m === 5) gate.appendChild(document.createElement("b"));
      t.appendChild(gate);
    }
  }

  /* ── 5m, the set as a marquee ── (design "Networks Set v2" 5m, 2026-09-26)
     Under the band's heading, every chain — all of them, not a tier — runs in two rows of names at
     display size, each with its glyph: the god, high and medium tiers on the first row, drifting
     left, slower; low and filth on the second, drifting right, faster (the tier is never shown).
     The −50% loop of the Networks 20e construction, twice. Names and glyphs rest grey; the hovered
     one fills with its tint, name and glyph in ink, and both rows pause (network.css). The second
     half of each row is the loop's copy: hidden from assistive tech and out of the tab order.
     Nothing is listed here. The chains are the Networks set's own, in its Order, with their Tier:
     /networks renders only the active tab, so the list comes from the all-stages view on /services
     that the navbar already reads for the counts (window.encCounts → list). A name links to its
     chain page where the set has one (mainnet rows); a testnet-only chain is a name. If that read
     fails, the strip falls back to the cards on this page, split at the middle of the Order. */
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
    // the glyph is a mask filled with the name's own colour, so it rests grey and turns ink with it
    if (r.glyph) {
      var g = document.createElement("span"), url = 'url("' + r.glyph.replace(/"/g, "%22") + '")';
      g.className = "enc-set-glyph";
      g.setAttribute("aria-hidden", "true");
      g.style.webkitMaskImage = url;
      g.style.maskImage = url;
      a.appendChild(g);
    }
    a.appendChild(document.createTextNode(r.name));
    return a;
  }

  var TOP = { god: 1, high: 1, medium: 1 };
  // the two rows: the top tiers and the rest, each in the set's Order; the tint stays the chain's
  // place in the whole set
  function rowsOf(list) {
    var all = list.map(function (r, i) { return { r: r, i: i }; });
    if (!list.some(function (r) { return r.tier; })) {
      var h = Math.ceil(all.length / 2);
      return [all.slice(0, h), all.slice(h)];
    }
    return [all.filter(function (x) { return TOP[x.r.tier]; }), all.filter(function (x) { return !TOP[x.r.tier]; })];
  }

  function draw(content, list) {
    var sig = list.map(function (r) { return r.name + ">" + (r.href || "") + ">" + (r.tier || ""); }).join("|");
    var old = content.querySelector(":scope > .enc-set-strip");
    if (old && old.getAttribute("data-sig") === sig) return;
    if (old) old.remove();
    var strip = document.createElement("div");
    strip.className = "enc-set-strip";
    strip.setAttribute("data-sig", sig);
    rowsOf(list).forEach(function (part, n) {
      if (!part.length) return;
      var row = document.createElement("div"), tape = document.createElement("div");
      row.className = "enc-set-row";
      tape.className = "enc-set-tape" + (n ? " enc-set-tape--rev" : "");
      part.forEach(function (x) { tape.appendChild(item(x.r, x.i, false)); });
      part.forEach(function (x) { tape.appendChild(item(x.r, x.i, true)); });
      row.appendChild(tape);
      strip.appendChild(row);
    });
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
  var EYEBROW = "block-3e6e800a5138814d87b0d0358084ef7b";   /* "27 mainnets · 20 testnets" */
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
  // "27 mainnets · 20 testnets": the first number and the second, the words Notion's
  function setPair(el, a, b) {
    if (!el || !(a >= 0) || !(b >= 0)) return;
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node, k = 0;
    while ((node = walk.nextNode())) {
      var v = node.nodeValue.replace(/\d+/g, function (d) { k++; return String(k === 1 ? a : k === 2 ? b : d); });
      if (v !== node.nodeValue) node.nodeValue = v;
    }
  }
  function figures() {
    // the tally draws at once from the figure Notion holds, and follows the set's count below
    var fig = document.getElementById(FIG_MAIN);
    if (fig) tally(parseInt(fig.textContent.replace(/\D+/g, ""), 10));
    if (typeof window.encCounts !== "function") return;
    if (!fig && !document.getElementById(BAND)) return;
    window.encCounts().then(function (c) {
      if (!c) return;
      setNumber(document.getElementById(FIG_MAIN), c.mainnet);
      setNumber(document.getElementById(FIG_TEST), c.testnet);
      setPair(document.getElementById(EYEBROW), c.mainnet, c.testnet);
      tally(c.mainnet);
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
    if (emptySet) {
      if (emptySet.el.hidden !== (shown !== 0)) emptySet.el.hidden = shown !== 0;
      if (!shown) showEmpty(cards, testnet);
    }
    attr(db, "data-enc-empty", shown ? null : "");
    // the stage follows the pointer; with none, the first row as ordered — and with nothing
    // matching, the tab's first row, as the design keeps the stage beside the empty set
    var first = cards.slice().sort(function (a, b) { return a.__setIndex - b.__setIndex; })[0];
    var active = state.active && order.indexOf(state.active) >= 0 ? state.active : (order[0] || first);
    stage(db, active || null, testnet);
    if (bar) { bar.state.sort = state.sort; bar.state.q = state.q; }
    sync();
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

  /* ── nothing matches (design Networks Index, 2026-09-26) ── every network on the tab as a 28px
     disc (pressing one searches for it), the line with the tab's count, Book a call beside Clear
     filters. The words are the "Empty state copy" toggle after the set; FALLBACK only stands in
     if it goes missing. */
  var emptySet = null;
  var FALLBACK = {
    "headline": { text: "Nothing called \u201c{q}\u201d on our list." },
    "line mainnet": { text: "These are the {n} mainnets we validate. If yours is launching and you want a validator on it, that is a conversation." },
    "line testnet": { text: "These are the {n} testnets we help. If yours is launching and you want a validator on it, that is a conversation." },
    "action": { text: "Book a call", href: "https://cal.com/aditya-encapsulate/30min" },
    "clear": { text: "Clear filters" }
  };
  function showEmpty(cards, testnet) {
    var copy = typeof window.encEmptyCopy === "function" ? window.encEmptyCopy() : null;
    var word = function (k) { return (copy && copy[k]) || FALLBACK[k]; };
    var all = cards.slice().sort(function (a, b) { return a.__setIndex - b.__setIndex; });
    var action = word("action");
    emptySet.set({
      headline: word("headline").text.replace("{q}", state.q.trim()),
      // the node is made only if the set changed (a new image per pass otherwise, on every tick)
      items: all.map(function (card) {
        var name = nameOf(card);
        return { id: name, label: name, get node() {
          var j = listIndex(name), i = j >= 0 ? j : (card.__setIndex || 0);
          var disc = el("span", "enc-set-es-disc");
          disc.style.background = TINT[i % 5];
          var img = card.querySelector("img"), g = el("img");
          g.src = img ? (img.currentSrc || img.src) : ""; g.alt = ""; g.loading = "lazy";
          disc.appendChild(g);
          return disc;
        } };
      }),
      onPick: function (name) { if (bar && bar.update) bar.update({ q: name }); },
      line: word(testnet ? "line testnet" : "line mainnet").text.replace("{n}", String(all.length)),
      action: { label: action.text, href: action.href },
      clear: { label: word("clear").text, onClick: function () { if (bar && bar.update) bar.update({ q: "", f: {}, sort: "set" }); } }
    });
  }

  // the bar (filterbar.js) redraws from the picker and the counts, writing only what changed
  var bar = null;
  function sync() { if (bar) bar.sync(); }
  var counts = null;

  function controls() {
    var db = document.getElementById(SET_DB);
    if (!db) return;
    if (!db.querySelector(":scope > .enc-set-controls") && build(db) === false) return;
    applyControls(db);
  }

  function build(db) {
    /* The controls are kept OUT of Super's markup: inside its picker or its header, its own handlers
       ran first and swallowed the click (the recipe in CLAUDE.md). They hang off the collection. */
    /* the design's command field (Filter Bar Patterns, G): the stage tabs in its left cell — they
       click Super's own view picker, hidden — the search in the middle, the sort at the right. No
       facet on this page. The filtering and the sorting are this file's, as before. */
    if (typeof window.encFilterBar !== "function") return false;
    var ICONS = { set: "desc", name: "az", rate: "bars" };
    bar = window.encFilterBar({
      placeholder: "Find a network",
      tabs: function () {
        return options(db).map(function (o) {
          var label = o.textContent.trim();
          var n = counts ? (/testnet/i.test(label) ? counts.testnet : /mainnet/i.test(label) ? counts.mainnet : null) : null;
          return { label: label, count: n, on: o.classList.contains("active") };
        });
      },
      onTab: function (i) {
        var o = options(db)[i];
        if (o && !o.classList.contains("active")) { state.active = null; o.click(); }
      },
      facets: [],
      // the rate only on mainnet, as the index has it
      sorts: function () {
        var t = testnetView(db);
        return SORTS.filter(function (o) { return !(t && o[0] === "rate"); })
          .map(function (o) { return [o[0], o[1], ICONS[o[0]]]; });
      },
      state: { q: state.q, sort: state.sort, f: {} },
      onChange: function (st) { state.q = st.q; state.sort = st.sort; applyControls(db); }
    });
    bar.el.classList.add("enc-set-controls");
    db.appendChild(bar.el);

    // nothing matches: the design's empty set (filterbar.js encEmptySet), in the ledger's place
    if (typeof window.encEmptySet === "function") {
      emptySet = window.encEmptySet();
      emptySet.el.classList.add("enc-set-empty");
      emptySet.el.hidden = true;
      db.appendChild(emptySet.el);
    }

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
    marks(); figures();
    clearTimeout(ct); ct = setTimeout(controls, 0);   // Super re-renders every row on a view switch
  }).observe(document.body, { childList: true, subtree: true });
  marks();
  controls();
  window.addEventListener("load", function () { marks(); controls(); });
  window.addEventListener("load", figures);
  figures();
})();

/* ── the Network Count band is one screen, and scrolling settles on it ── (the user, 2026-09-26)
   The hollow band right after the cover is a snap stop, with the rules of the governance record's
   count band (governance.js) — ported rather than re-invented, as those were from the homepage's
   one-screen sections (home.js: Who we are, Services):

     - a wheel or trackpad gesture towards the band that starts within half a screen of its top
       lands on it, as a deck's first panel would. Waiting for the scroll to rest does not work on
       a trackpad: momentum wheel events run to the end of the scroll, so the rest check always
       sees a gesture in progress;
     - a new gesture is a 250ms gap, or — at least 450ms after the page turned and once deltas have
       fallen below half their peak — a delta 4x the smallest since (>= 20). Momentum tails last
       seconds and a swipe's own deltas wobble;
     - coming to rest within a third of a screen of the band's top settles onto it, in whichever
       direction it is nearer, and the settle retries while a gesture still looks live;
     - the browser's own smooth scroll; the stop measured fresh, because the page above the band
       settles late (images, the banner, Super's own renders).

   Under 701px, and with reduced motion, nothing snaps. */
(function () {
  var BAND = "block-3dce800a51388154931ac3c9478a65b5";   // the Network Count band
  var NEAR = 0.33;       // of a screen: how close a resting page must be to settle on the stop
  var EPS = 2;           // px: "on" the stop
  var QUIET = 180;       // ms without wheel events before a resting page is settled
  var NEW_GAP = 250, MIN_LOCK = 450;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  // measured fresh each time, as the homepage decks are
  function stop() {
    var box = document.getElementById(BAND);
    if (!box || window.innerWidth < 701) return null;
    if (box.offsetHeight < window.innerHeight - 4) return null;
    /* under 900px the band can grow past a screen, the figure standing over the rest (network.css).
       Snapping onto it would pull the reader back to its top before the rest was seen, so it
       snaps only while no more than its own bottom padding falls below the screen */
    if (window.matchMedia("(max-width: 900px)").matches &&
        box.offsetHeight > window.innerHeight + (parseFloat(getComputedStyle(box).paddingBottom) || 0)) return null;
    return Math.round(docTop(box));
  }

  var anim = null, gestureUntil = 0, lastRest = window.scrollY;
  function scrollToY(target) {
    target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    if (Math.abs(target - window.scrollY) < 1) { lastRest = target; return; }
    var smooth = !reduced.matches;
    if (anim) clearTimeout(anim.timer);
    anim = { target: target, timer: setTimeout(finish, smooth ? 900 : 50) };
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "instant" });
  }
  function finish() {
    if (!anim) return;
    clearTimeout(anim.timer);
    var target = anim.target;
    anim = null;
    lastRest = window.scrollY;
    // the band is exactly one screen, so a landing a pixel or two out shows as a strip of the
    // next section beneath it
    var exact = stop();
    if (exact !== null && Math.abs(target - exact) < 6 && Math.abs(window.scrollY - exact) > 1) {
      window.scrollTo({ top: exact, behavior: "instant" });
      lastRest = exact;
    }
  }
  function arrived() { if (anim && Math.abs(window.scrollY - anim.target) <= 1) finish(); }

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

    var s = stop();
    if (s === null) { if (anim) e.preventDefault(); return; }
    var dir = e.deltaY > 0 ? 1 : -1;
    var y = anim ? anim.target : window.scrollY;   // mid-snap: page on from where it is heading
    var half = window.innerHeight / 2, towards = (s - y) * dir;
    if (towards <= EPS || towards >= half) { if (anim) e.preventDefault(); return; }
    e.preventDefault();
    locked = true; lockedAt = now; peak = abs; tailMin = Infinity; decayed = false;
    scrollToY(s);
  }, { passive: false });

  var touching = false, restTimer = 0, retry = 0;
  function settle() {
    if (anim || touching) return;
    // a trackpad's momentum ends with the scroll: if a gesture still looks live, look again once
    // it has been quiet rather than giving up
    if (performance.now() < gestureUntil) { clearTimeout(retry); retry = setTimeout(settle, QUIET + 20); return; }
    var s = stop(), y = window.scrollY;
    if (s === null) { lastRest = y; return; }
    if (Math.abs(s - y) <= window.innerHeight * NEAR && Math.abs(s - y) > EPS) scrollToY(s);
    else lastRest = y;
  }

  var hasScrollEnd = "onscrollend" in window;
  if (hasScrollEnd) window.addEventListener("scrollend", function () { arrived(); setTimeout(settle, 30); });
  window.addEventListener("scroll", function () {
    if (!hasScrollEnd) { clearTimeout(restTimer); restTimer = setTimeout(function () { arrived(); settle(); }, 140); }
    arrived();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });
})();
