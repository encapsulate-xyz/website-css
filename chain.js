/* /<row id> — a chain page: design "Chain Page Combined" (2026-09-24).

   Every mainnet row of the Networks set is a Notion page that Super serves at /<row id>. The page
   is five bands that snap — the chain (its name, its line, the buttons, the address around the
   mark), the terms (four figures, each drawn as the form that number takes), a year-on-year
   estimate, what we run, and the common questions with the other chains running under them —
   and a dock that carries the address and the button once the first band has gone. The Lido
   page alone adds one band after the first: the validators we run for Lido, times 32, as stake.

   Nothing is typed here. The figures are the row's own properties, read from the page's own data
   (Super embeds every property of the row in the page; it renders none of them). The line, the
   buttons, "What we run" and the questions are the page's blocks. The words every chain page
   shares are the "Chain page copy" toggle on /networks, and a page's own "Chain page copy"
   toggle overrides them where that chain needs different words. The other chains and their
   tiers come from the set's view on /services, the one view that ships every stage.

   Loaded from the SITE head: a chain page has no Code panel, and Super runs no page script on a
   client-side navigation, so this builds off a MutationObserver like every other page script. */
(function () {
  var VERSION = "1";
  var SET_ID = "3dde800a51388133b7f1d1ccdda08038";         /* the Networks set */
  var COPY_PAGE = "/networks", LIST_PAGE = "/services";
  var KEEP = 1800000;                                       /* session cache, half an hour */

  /* the fallback if the "Chain page copy" toggle on /networks goes missing */
  var CONTENT = {
    "crumb": "Encapsulate",
    "crumb networks": "Networks",
    "copy disc": "Copy validator address",
    "copied": "Copied",
    "band terms": "The terms",
    "band estimate": "Estimate",
    "terms title": "The terms",
    "estimate title": "Year on year",
    "rate": "Reward rate",
    "rate note": "Set by the chain, not by us",
    "rate of": "Of every 100 {token} staked",
    "rate earned": "{rate} earned in a year",
    "rate caption": "After our commission · as of {date}",
    "commission": "Commission",
    "commission note": "Our cut of the rewards",
    "commission yours": "Yours · {n}",
    "commission ours": "Ours · {n}",
    "commission caption": "Of every 100 {token} in rewards",
    "unbonding": "Unbonding",
    "unbonding note": "How long to withdraw",
    "unbonding today": "Withdraw today · {date}",
    "unbonding lands": "In your wallet · {date}",
    "unbonding caption": "Live dates",
    "slashing": "Slashing events",
    "slashing note": "Since we joined",
    "slashing start": "Launch",
    "slashing months": "{n} months",
    "slashing today": "Today",
    "slashing caption": "No slash since we joined. A slash would break this line",
    "slashing caption none": "{chain} does not slash stake. The line cannot break",
    "estimate intro": "Your stake as the base of the column; each year’s rewards laid on top of it, to scale. Slide the horizon to add years.",
    "estimate unit": "{token} · type to change",
    "presets": "100, 1000, 10000, 100000",
    "horizon": "Horizon",
    "year": "{n} year",
    "years": "{n} years",
    "column": "Year {n}",
    "column stake": "Stake",
    "column year": "Yr {n}",
    "rewards auto": "Compounded every epoch — {chain} adds rewards to your stake.",
    "rewards manual": "Not compounded — {chain} pays rewards to a claimable balance.",
    "rewards end": "Paid in one sum when the period ends.",
    "disclaimer": "{rewards} After our {commission}% commission. An estimate at today’s rate, which the chain can change.",
    "more": "Also stake with us on",
    "all networks": "See all networks",
    "all networks url": "/networks",
    "our validator": "Our validator"
  };
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var TIERS = { god: 1, high: 1, medium: 1 };               /* the pills: the design leaves low and filth out */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["M", "T", "W", "T", "F", "S", "S"];
  var SVG = "http://www.w3.org/2000/svg";

  /* ── small things ─────────────────────────────────────────────────────────────────────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function textOf(n) { return ((n && n.textContent) || "").replace(/\s+/g, " ").trim(); }
  function dash(id) { return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5"); }
  function fmt(n) {
    return n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
                     : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  function short(v) {
    return v >= 1e6 ? (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
      : v >= 1e4 ? Math.round(v / 1e3) + "k"
      : v >= 1e3 ? (v / 1e3).toFixed(1).replace(/\.0$/, "") + "k" : fmt(v);
  }
  function day(d) { return d.getDate() + " " + MON[d.getMonth()]; }
  function num(t) { var m = /-?\d+(?:\.\d+)?/.exec(String(t == null ? "" : t).replace(/,/g, "")); return m ? parseFloat(m[0]) : NaN; }
  /* The shared words and the chain list are kept in localStorage and used at once, however old —
     so a chain page builds from what it has without waiting on two fetches — and read again in
     the background once they are older than half an hour, for the next page. */
  function stored(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "null");
      return v ? { value: v.value, fresh: Date.now() - v.at < KEEP } : null;
    } catch (e) { return null; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), value: value })); } catch (e) { /* fine */ }
  }
  function pageOf(p) {
    if (window.encNav && typeof window.encNav.page === "function") return window.encNav.page(p);
    return fetch(p, { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (h) { return new DOMParser().parseFromString(h, "text/html"); })
      .catch(function () { return null; });
  }

  /* ── the row's own properties, from the page's data ──────────────────────────────────────
     Super renders no property on a row's page, but it embeds the row in the page's data (the
     `self.__next_f.push([1,"…"])` scripts): "propertySort" names every property and
     "propertyValues" holds each value, both beside "blockId": "<this page>". On a full load the
     scripts are in the document; after a client-side navigation they are not, so the page is
     fetched once. Values are Notion's own format: [["text", [marks]]], a select's {value}, a
     date's ["‣", [["d", {start_date}]]], a file's {imgSrc}. */
  var PUSH = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\[\s\S])*)"\]\)/g;
  function decode(raw) {
    var out = [], m;
    PUSH.lastIndex = 0;
    while ((m = PUSH.exec(raw))) {
      try { out.push(JSON.parse('"' + m[1] + '"')); } catch (e) { /* not a string chunk */ }
    }
    return out.join("");
  }
  /* the end of the JSON value that opens at i, reading strings as strings */
  function closeOf(t, i) {
    var depth = 0, inStr = false;
    for (var k = i; k < t.length; k++) {
      var ch = t[k];
      if (inStr) {
        if (ch === "\\") k++;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") { depth--; if (!depth) return k; }
    }
    return -1;
  }
  function valueOf(type, raw) {
    if (raw == null) return null;
    if (type === "checkbox") return raw === true || raw === "true" || raw === "Yes";
    if (type === "select" || type === "status") return raw[0] && raw[0].value || "";
    if (type === "multi_select") return raw.map(function (o) { return o.value; });
    if (type === "file") return raw[0] && (raw[0].imgSrc || raw[0].url) || "";
    if (!Array.isArray(raw)) return String(raw);
    if (type === "date") {
      var d = null;
      raw.forEach(function (seg) { (seg[1] || []).forEach(function (mk) { if (mk[0] === "d") d = mk[1].start_date; }); });
      return d;
    }
    if (type === "url") {
      var href = "";
      raw.forEach(function (seg) { (seg[1] || []).forEach(function (mk) { if (mk[0] === "a") href = mk[1]; }); });
      return href || raw.map(function (s) { return s[0]; }).join("");
    }
    return raw.map(function (s) { return s[0]; }).join("");
  }
  function rowIn(text, id) {
    var key = '"blockId":"' + dash(id) + '"', at = text.indexOf(key);
    while (at >= 0) {
      var pv = text.lastIndexOf('"propertyValues":', at);
      var ps = text.lastIndexOf('"propertySort":', at);
      if (pv >= 0 && ps >= 0 && at - pv < 60000) {
        var o = text.indexOf("{", pv), oe = closeOf(text, o);
        var a = text.indexOf("[", ps), ae = closeOf(text, a);
        if (oe > 0 && ae > 0 && text.slice(oe + 1, oe + 2 + key.length) === "," + key) {
          try {
            var values = JSON.parse(text.slice(o, oe + 1)), sort = JSON.parse(text.slice(a, ae + 1));
            var row = {};
            sort.forEach(function (p) { row[p.name] = valueOf(p.type, values[p.property]); });
            return row;
          } catch (e) { /* keep looking */ }
        }
      }
      at = text.indexOf(key, at + 1);
    }
    return null;
  }
  var rows = {};
  function rowOf(id) {
    if (rows[id]) return rows[id];
    var raw = "";
    Array.prototype.forEach.call(document.scripts, function (s) {
      var t = s.textContent || "";
      if (t.indexOf("__next_f") >= 0) raw += t + "\n";
    });
    var row = rowIn(decode(raw), id);
    rows[id] = row ? Promise.resolve(row)
      : fetch(location.pathname, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (h) { return rowIn(decode(h), id); })
          .catch(function () { return null; });
    rows[id].then(function (r) { if (!r) delete rows[id]; });
    return rows[id];
  }
  function isChain(row) {
    return !!row && "Stage" in row && "Tier" in row && "Reward rate" in row && row.Stage === "Mainnet";
  }

  /* ── words: the shared toggle on /networks, then this page's own ───────────────────────── */
  function linesOf(toggle) {
    var map = {};
    if (!toggle) return map;
    Array.prototype.forEach.call(toggle.querySelectorAll(".notion-toggle__content p, .notion-toggle__content li"), function (p) {
      var t = textOf(p), i = t.indexOf(" · ");
      if (i > 0) map[t.slice(0, i).trim().toLowerCase()] = t.slice(i + 3).trim();
    });
    return map;
  }
  /* a toggle's summary carries Super's "‣" trigger before its words */
  function isCopy(t) {
    var s = t.querySelector(".notion-toggle__summary .notion-semantic-string") || t.querySelector(".notion-toggle__summary");
    return /^chain page copy$/i.test(textOf(s).replace(/^[‣▸▶\s]+/, ""));
  }
  function copyToggle(root) {
    var hit = null;
    Array.prototype.forEach.call(root.querySelectorAll(".notion-toggle"), function (t) {
      if (!hit && isCopy(t)) hit = t;
    });
    return hit;
  }
  var sharedOnce = null;
  function readShared() {
    return pageOf(COPY_PAGE).then(function (doc) {
      var map = doc ? linesOf(copyToggle(doc)) : {};
      if (Object.keys(map).length) store("enc-chain-copy", map);
      return map;
    });
  }
  function shared() {
    if (sharedOnce) return sharedOnce;
    var kept = stored("enc-chain-copy");
    if (kept) {
      if (!kept.fresh) readShared();
      return (sharedOnce = Promise.resolve(kept.value));
    }
    return (sharedOnce = readShared());
  }

  /* ── the other chains: the set's view on /services, which shows Stage, Tier and Order ──── */
  var listOnce = null;
  function chains() {
    if (listOnce) return listOnce;
    var kept = stored("enc-chain-list");
    if (kept) {
      if (!kept.fresh) readChains();
      return (listOnce = Promise.resolve(kept.value));
    }
    return (listOnce = readChains());
  }
  function readChains() {
    return pageOf(LIST_PAGE).then(function (doc) {
      var best = [];
      if (doc) Array.prototype.forEach.call(doc.querySelectorAll(".notion-collection"), function (coll) {
        var out = [];
        Array.prototype.forEach.call(coll.querySelectorAll(".notion-collection-card"), function (c) {
          /* a card is named by its row id until the row has a path of its own in Super, and then by
             the path ("block-networks-mainnet-monad") with an anchor to it — either will do */
          var id = (/^block-([0-9a-f]{32})$/.exec(c.id || "") || [])[1] || "";
          var link = c.querySelector("a.notion-collection-card__anchor[href], a[href^='/networks/']");
          var stage = "", tier = "", order = NaN;
          Array.prototype.forEach.call(c.querySelectorAll(".notion-collection-card__property"), function (p) {
            if (p.classList.contains("notion-property__title")) return;
            var v = textOf(p);
            if (v === "Mainnet" || v === "Testnet") stage = v;
            else if (/^(god|high|medium|low|filth)$/i.test(v)) tier = v.toLowerCase();
            else if (/^\d+$/.test(v)) order = parseInt(v, 10);
          });
          var f = c.querySelector("[data-full-size]");
          var href = link ? link.getAttribute("href") : (id ? "/" + id : "");
          if (href && stage) out.push({ id: id, name: textOf(c.querySelector(".notion-property__title")),
            stage: stage, tier: tier, order: order, glyph: f ? f.getAttribute("data-full-size") : "",
            href: href });
        });
        if (out.length > best.length) best = out;
      });
      var main = best.filter(function (x) { return x.stage === "Mainnet"; });
      main.forEach(function (x, i) { x.i = i; });
      main.sort(function (a, b) {
        if (isNaN(a.order) || isNaN(b.order)) return isNaN(a.order) - isNaN(b.order) || a.i - b.i;
        return a.order - b.order || a.i - b.i;
      });
      if (main.length) store("enc-chain-list", main);
      return main;
    });
  }

  /* ── the page's own blocks ─────────────────────────────────────────────────────────────── */
  function blocks(root) {
    var out = { lede: null, buttons: null, sections: [], toggle: copyToggle(root) };
    var cur = null;
    Array.prototype.forEach.call(root.children, function (n) {
      if (n.classList.contains("enc-ch")) return;
      if (n.matches("h2.notion-heading, h2")) {
        cur = { title: textOf(n), node: n, rows: [], faq: [], nodes: [n] };
        out.sections.push(cur);
        return;
      }
      if (!cur) {
        if (!out.lede && n.matches("p.notion-text") && textOf(n)) { out.lede = n; return; }
        if (!out.buttons && (n.matches(".notion-column-list, .notion-callout")) && n.querySelector("a")) { out.buttons = n; return; }
        return;
      }
      cur.nodes.push(n);
      var table = n.matches("table") ? n : n.querySelector("table");
      if (table) {
        Array.prototype.forEach.call(table.querySelectorAll("tr"), function (tr) {
          var cells = Array.prototype.map.call(tr.querySelectorAll("td, th"), textOf);
          if (cells.length >= 2 && (cells[0] || cells[1])) cur.rows.push([cells[0], cells[1]]);
        });
      } else if (n.matches("h3.notion-heading, h3")) {
        cur.faq.push([textOf(n), ""]);
      } else if (n.matches("p.notion-text") && cur.faq.length && !cur.faq[cur.faq.length - 1][1]) {
        cur.faq[cur.faq.length - 1][1] = textOf(n);
      }
    });
    return out;
  }

  /* ── the page ──────────────────────────────────────────────────────────────────────────── */
  function Page(root, id, row, words, list, src) {
    var P = this;
    P.id = id;
    P.row = row;
    P.name = textOf(document.querySelector(".notion-header__title")) || row.Name || "";
    P.words = words;
    P.token = row.Token || "";
    P.addr = row.Address || "";
    P.canCopy = !!P.addr && !/\s/.test(P.addr);
    P.rank = -1;
    var here = location.pathname.replace(/\/$/, "");
    var me = function (x) { return x.id === id || x.href === here || x.href === "/" + id; };
    list.forEach(function (x, i) { if (me(x)) P.rank = i; });
    var order = num(row.Order);
    P.tint = TINTS[(P.rank >= 0 ? P.rank : (isNaN(order) ? 0 : order)) % 5];
    P.glyph = row.Cover || "";
    P.others = list.filter(function (x) { return !me(x) && TIERS[x.tier]; });
    P.rate = num(row["Reward rate"]);
    P.comm = num(row.Commission);
    P.src = src;
  }
  Page.prototype.say = function (key, vars) {
    var t = this.words[key];
    if (t == null) t = CONTENT[key] || "";
    var v = Object.assign({ chain: this.name, token: this.token }, vars || {});
    Object.keys(v).forEach(function (k) { t = t.split("{" + k + "}").join(v[k] == null ? "" : v[k]); });
    return t.trim();
  };
  Page.prototype.mono = function (text, cls) { return el("span", "enc-ch__mono" + (cls ? " " + cls : ""), text); };
  Page.prototype.crumb = function () {
    var c = el("div", "enc-ch__crumb");
    c.appendChild(this.mono(this.say("crumb")));
    c.appendChild(el("span", "enc-ch__sep"));
    c.appendChild(this.mono(this.say("crumb networks")));
    c.appendChild(el("span", "enc-ch__sep"));
    c.appendChild(this.mono(this.name, "enc-ch__crumb-here"));
    return c;
  };
  Page.prototype.mark = function (size) {
    var m = el("span", "enc-ch__mark");
    m.style.background = this.tint;
    if (size) { m.style.width = size + "px"; m.style.height = size + "px"; }
    if (this.glyph) { var i = el("img"); i.src = this.glyph; i.alt = ""; m.appendChild(i); }
    return m;
  };
  Page.prototype.copy = function (btn, done) {
    var addr = this.addr;
    function ok() {
      btn.setAttribute("data-enc-copied", "");
      if (done) done(true);
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.removeAttribute("data-enc-copied"); if (done) done(false); }, 1000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(ok, function () { legacy(); });
    } else legacy();
    function legacy() {
      var t = el("textarea"); t.value = addr; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) { /* nothing to do */ }
      t.remove();
    }
  };

  /* The name is set at the design's size, and smaller only where its longest word would not fit
     the column: at 901–1919 "Avalanche", "EigenCloud", "Passage", "Chain4Energy" and six more broke
     inside the word ("Avalan|che", audit 2026-09-26). The longest word is measured once, in em —
     the letter-spacing scales with the size, so the ratio holds at every width — and chain.css
     takes the smaller of the design size and what the column holds (100cqi / --name-em). */
  function fitName(h) {
    // measured on a canvas, so it needs no layout and cannot miss a hero that is rebuilt: the
    // word's width at 100px in Outfit 600, less the name's own tracking (-0.058em a letter)
    var FONT = '600 100px "Outfit"';
    function set() {
      var c = fitName.ctx || (fitName.ctx = document.createElement("canvas").getContext("2d"));
      if (!c) return;
      c.font = FONT;
      var em = 0;
      h.textContent.split(/\s+/).forEach(function (w) {
        if (w) em = Math.max(em, c.measureText(w).width / 100 - 0.058 * w.length);
      });
      if (em > 0) h.style.setProperty("--name-em", (em * 1.02).toFixed(3));
    }
    if (!document.fonts || document.fonts.check(FONT)) set();
    else document.fonts.load(FONT).then(set, set);
  }

  /* 01 · the chain: type on paper, the chain's tint as the field, the mark on the seam with the
     address running round it — the ring is the copy button */
  Page.prototype.hero = function () {
    var P = this, s = el("section", "enc-ch__hero");
    s.setAttribute("data-enc-band", "hero");
    var field = el("div", "enc-ch__field");
    field.style.background = P.tint;
    field.setAttribute("aria-hidden", "true");
    s.appendChild(field);
    var type = el("div", "enc-ch__type");
    type.appendChild(P.crumb());
    var name = el("h1", "enc-ch__name", P.name);
    type.appendChild(name);
    fitName(name);
    if (P.src.lede) type.appendChild(el("p", "enc-ch__lede", textOf(P.src.lede)));
    if (P.src.buttons) {
      var ctas = el("div", "enc-ch__ctas");
      ctas.appendChild(P.src.buttons);
      type.appendChild(ctas);
    }
    s.appendChild(type);

    var wrap = el("div", "enc-ch__discwrap");
    var disc = el(P.canCopy ? "button" : "div", "enc-ch__disc");
    if (P.canCopy) { disc.type = "button"; disc.setAttribute("aria-label", P.say("copy disc")); }
    var ring = svg("svg", { viewBox: "0 0 600 600", "aria-hidden": "true" });
    var defs = svg("defs");
    var orbit = "enc-ch-orbit-" + P.id.slice(0, 8);
    defs.appendChild(svg("path", { id: orbit, d: "M300,300 m-244,0 a244,244 0 1,1 488,0 a244,244 0 1,1 -488,0", fill: "none" }));
    ring.appendChild(defs);
    ring.appendChild(svg("circle", { "class": "enc-ch__band", cx: 300, cy: 300, r: 244 }));
    ring.appendChild(svg("circle", { "class": "enc-ch__edge", cx: 300, cy: 300, r: 262 }));
    ring.appendChild(svg("circle", { "class": "enc-ch__paper", cx: 300, cy: 300, r: 226 }));
    if (P.glyph) {
      var img = svg("image", { x: 130, y: 130, width: 340, height: 340 });
      img.setAttributeNS("http://www.w3.org/1999/xlink", "href", P.glyph);
      img.setAttribute("href", P.glyph);
      ring.appendChild(img);
    }
    if (P.addr) {
      /* the address twice round, as the design sets it; a short one (a pool name, a node id) more
         often, so the letters are not stretched thin across the whole ring */
      var reps = Math.max(2, Math.round(100 / (P.addr.length + 3)));
      var t = svg("text", { "class": "enc-ch__ring" });
      var tp = svg("textPath", { textLength: String(Math.round(2 * Math.PI * 244 * 0.995)), lengthAdjust: "spacing" });
      tp.setAttribute("href", "#" + orbit);
      tp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + orbit);
      tp.textContent = new Array(reps + 1).join(P.addr + " · ");
      t.appendChild(tp);
      ring.appendChild(t);
    }
    disc.appendChild(ring);
    if (P.canCopy) {
      var cap = el("span", "enc-ch__cap", P.say("copy disc"));
      disc.appendChild(cap);
      disc.addEventListener("click", function () {
        P.copy(disc, function (on) { cap.textContent = on ? P.say("copied") : P.say("copy disc"); });
      });
    }
    wrap.appendChild(disc);
    s.appendChild(wrap);
    return s;
  };

  /* a band: the crumb and the band's name across the top, its content centred in the screen */
  Page.prototype.band = function (key, label, kids) {
    var s = el("section", "enc-ch__bandsec");
    s.setAttribute("data-enc-band", key);
    var top = el("div", "enc-ch__top");
    top.appendChild(this.crumb());
    top.appendChild(this.mono(label, "enc-ch__label"));
    s.appendChild(top);
    var mid = el("div", "enc-ch__mid"), inner = el("div", "enc-ch__inner");
    kids.forEach(function (k) { if (k) inner.appendChild(k); });
    mid.appendChild(inner);
    s.appendChild(mid);
    return s;
  };

  /* 02 · the terms — one drawing per figure, each the form that number naturally takes */
  Page.prototype.term = function (label, value, note, draw, cap) {
    var t = el("div", "enc-ch__term");
    var a = el("div", "enc-ch__term-a");
    a.appendChild(this.mono(label));
    a.appendChild(el("span", "enc-ch__fig", value));
    if (note) a.appendChild(el("p", "enc-ch__note", note));
    t.appendChild(a);
    var b = el("div", "enc-ch__term-b");
    if (draw) b.appendChild(draw);
    if (cap) b.appendChild(this.mono(cap, "enc-ch__cap9"));
    t.appendChild(b);
    return t;
  };
  Page.prototype.growth = function (rate) {
    var full = Math.floor(rate), part = rate - full;
    var w = el("div", "enc-ch__growth");
    var g = el("div", "enc-ch__squares");
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", rate + " of every 100 staked, earned in a year");
    for (var i = 0; i < 100; i++) {
      var c = el("span", i < full ? "is-on" : null);
      if (i === full && part > 0) { var f = el("span", "enc-ch__part"); f.style.width = (part * 100) + "%"; c.appendChild(f); }
      g.appendChild(c);
    }
    w.appendChild(g);
    var lab = el("div", "enc-ch__labs");
    lab.appendChild(this.mono(this.say("rate of"), "enc-ch__m9"));
    lab.appendChild(this.mono(this.say("rate earned", { rate: fmt(rate) }), "enc-ch__m9 is-ink"));
    w.appendChild(lab);
    return w;
  };
  Page.prototype.split = function (pct) {
    var w = el("div", "enc-ch__split");
    var bar = el("div", "enc-ch__bar");
    var y = el("span", "enc-ch__yours"), o = el("span", "enc-ch__ours");
    y.style.flex = String(100 - pct);
    o.style.flex = String(pct);
    bar.appendChild(y); bar.appendChild(o);
    w.appendChild(bar);
    var lab = el("div", "enc-ch__labs");
    lab.appendChild(this.mono(this.say("commission yours", { n: +(100 - pct).toFixed(2) }), "enc-ch__m9"));
    lab.appendChild(this.mono(this.say("commission ours", { n: +pct.toFixed(2) }), "enc-ch__m9 is-ink"));
    w.appendChild(lab);
    return w;
  };
  /* the wait on the real calendar: from this week, today outlined, the wait in ink, the day it
     lands the one green cell — the dates are the visitor's own */
  Page.prototype.calendar = function (days) {
    var now = new Date(), wd = (now.getDay() + 6) % 7;
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd);
    var land = new Date(now.getTime() + days * 864e5);
    var mid = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
    var D = Math.round((mid(land) - mid(now)) / 864e5);
    var total = Math.ceil((wd + D + 1) / 7) * 7;
    var w = el("div", "enc-ch__cal");
    var h = el("div", "enc-ch__week");
    DAYS.forEach(function (d) { h.appendChild(el("span", "enc-ch__m85", d)); });
    w.appendChild(h);
    var g = el("div", "enc-ch__days");
    for (var i = 0; i < total; i++) {
      var dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), idx = i - wd;
      var c = el("span", null, dt.getDate() === 1 ? MON[dt.getMonth()] : String(dt.getDate()));
      c.title = dt.toDateString();
      if (idx < 0) c.className = "is-before";
      else if (idx === D) c.className = "is-land";
      else if (idx === 0) c.className = "is-today";
      else if (idx < D) c.className = "is-wait";
      g.appendChild(c);
    }
    w.appendChild(g);
    var lab = el("div", "enc-ch__labs");
    lab.appendChild(this.mono(this.say("unbonding today", { date: day(now) }), "enc-ch__m9"));
    lab.appendChild(this.mono(this.say("unbonding lands", { date: day(land) }), "enc-ch__m9 is-ink"));
    w.appendChild(lab);
    return w;
  };
  /* zero events is an unbroken line: signing is continuous, so it is one line from when we
     joined to today */
  Page.prototype.timeline = function (since) {
    var w = el("div", "enc-ch__tl");
    var lab = el("div", "enc-ch__labs");
    lab.appendChild(this.mono(this.say("slashing start"), "enc-ch__m9"));
    if (since) {
      var s = new Date(since + "T00:00:00"), n = new Date();
      var months = (n.getFullYear() - s.getFullYear()) * 12 + n.getMonth() - s.getMonth() - (n.getDate() < s.getDate() ? 1 : 0);
      if (months > 0) lab.appendChild(this.mono(this.say("slashing months", { n: months }), "enc-ch__m9"));
    }
    lab.appendChild(this.mono(this.say("slashing today"), "enc-ch__m9 is-ink"));
    w.appendChild(lab);
    var line = el("div", "enc-ch__line");
    line.setAttribute("role", "img");
    line.setAttribute("aria-label", "An unbroken record");
    w.appendChild(line);
    return w;
  };
  Page.prototype.terms = function () {
    var P = this, r = P.row, g = el("div", "enc-ch__terms");
    var rateText = r["Reward rate"] || "";
    var date = r["Rate updated"] ? (function (d) { var x = new Date(d + "T00:00:00"); return x.getDate() + " " + MON[x.getMonth()] + " " + x.getFullYear(); })(r["Rate updated"]) : "";
    g.appendChild(P.term(P.say("rate"), rateText || "—", P.say("rate note"),
      isNaN(P.rate) ? null : P.growth(P.rate),
      isNaN(P.rate) ? "" : (date ? P.say("rate caption", { date: date }) : P.say("rate caption", { date: "" }).replace(/\s*·\s*[^·]*$/, ""))));
    g.appendChild(P.term(P.say("commission"), r.Commission || "—", P.say("commission note"),
      isNaN(P.comm) ? null : P.split(P.comm), P.say("commission caption")));
    var ud = r["Unbonding days"];
    var days = ud != null && ud !== "" ? num(ud) : (/^none$/i.test(r.Unbonding || "") ? 0 : NaN);
    g.appendChild(P.term(P.say("unbonding"), r.Unbonding || "—", P.say("unbonding note"),
      isNaN(days) ? null : P.calendar(days), isNaN(days) ? "" : P.say("unbonding caption")));
    var ev = r["Slashing events"];
    g.appendChild(P.term(P.say("slashing"), ev != null && ev !== "" ? String(num(ev)) : "0", P.say("slashing note"),
      P.timeline(r.Since), r["Chain slashes"] ? P.say("slashing caption") : P.say("slashing caption none")));
    return g;
  };

  /* 03 · the estimate: the stake as the base of a column, each year's rewards laid on top of it,
     a horizon slider adding years. The rate is the row's own, after our commission, as a
     staker earns it — so nothing is taken off again here. */
  Page.prototype.estimate = function () {
    var P = this;
    var st = { amt: 1000, years: 5, hov: null };
    var grid = el("div", "enc-ch__est");
    var left = el("div", "enc-ch__est-l");
    left.appendChild(el("p", "enc-ch__intro", P.say("estimate intro")));

    var field = el("label", "enc-ch__amt");
    var input = el("input");
    input.type = "text"; input.inputMode = "numeric"; input.setAttribute("aria-label", "Amount to stake");
    var unit = P.mono(P.say("estimate unit"), "enc-ch__unit");
    field.appendChild(input); field.appendChild(unit);
    left.appendChild(field);
    input.addEventListener("focus", function () { unit.textContent = P.token; field.setAttribute("data-enc-focus", ""); });
    input.addEventListener("blur", function () { unit.textContent = P.say("estimate unit"); field.removeAttribute("data-enc-focus"); });
    input.addEventListener("input", function () {
      st.amt = Math.min(1e9, Number(input.value.replace(/[^0-9]/g, "")) || 0);
      paint();
    });

    var chips = el("div", "enc-ch__chips");
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Preset amounts");
    var presets = P.say("presets").split(",").map(function (x) { return num(x); }).filter(function (x) { return !isNaN(x); });
    presets.forEach(function (p) {
      var b = el("button", "enc-ch__chip", p.toLocaleString("en-US"));
      b.type = "button";
      b.addEventListener("click", function () { st.amt = p; paint(); });
      b._v = p;
      chips.appendChild(b);
    });
    left.appendChild(chips);

    var yrs = el("div", "enc-ch__yrs");
    var yl = el("div", "enc-ch__yrs-l");
    yl.appendChild(P.mono(P.say("horizon")));
    var yv = el("span", "enc-ch__yrs-v");
    yl.appendChild(yv);
    yrs.appendChild(yl);
    var sl = el("div", "enc-ch__slider");
    var track = el("div", "enc-ch__track"), fill = el("div", "enc-ch__fill"), knob = el("div", "enc-ch__knob");
    [track, fill, knob].forEach(function (n) { n.setAttribute("aria-hidden", "true"); sl.appendChild(n); });
    var range = el("input");
    range.type = "range"; range.min = "1"; range.max = "20"; range.step = "1"; range.value = "5";
    range.setAttribute("aria-label", "Horizon in years");
    range.addEventListener("input", function () { st.years = Number(range.value); paint(); });
    sl.appendChild(range);
    yrs.appendChild(sl);
    left.appendChild(yrs);

    var rkey = { Auto: "rewards auto", Manual: "rewards manual", End: "rewards end" }[P.row.Compounding] || "rewards manual";
    left.appendChild(el("p", "enc-ch__disc-note", P.say("disclaimer", { rewards: P.say(rkey), commission: fmt(P.comm) })));
    grid.appendChild(left);

    var chart = el("div", "enc-ch__chart");
    grid.appendChild(chart);
    var H = 360;

    function paint() {
      var txt = st.amt.toLocaleString("en-US");
      if (input.value !== txt) input.value = txt;
      input.style.width = Math.max(2, txt.length) + "ch";
      Array.prototype.forEach.call(chips.children, function (b) { b.setAttribute("aria-pressed", String(b._v === st.amt)); });
      var Y = st.years;
      yv.textContent = Y === 1 ? P.say("year", { n: 1 }) : P.say("years", { n: Y });
      var pct = ((Y - 1) / 19 * 100);
      fill.style.width = pct + "%";
      knob.style.left = "calc(" + pct + "% - " + (22 * pct / 100).toFixed(2) + "px + 11px)";
      var y = st.amt * P.rate / 100, max = st.amt + y * Y;
      var h = function (v) { return Math.max(2, Math.round(H * v / Math.max(1, max))); };
      chart.style.gridTemplateColumns = "repeat(" + Y + ", minmax(0, 1fr))";
      chart.setAttribute("data-enc-dense", Y > 10 ? "2" : Y > 6 ? "1" : "0");
      chart.textContent = "";
      for (var n = 1; n <= Y; n++) {
        var show = Y <= 8 || n === 1 || n === Y || n % 5 === 0;
        var on = st.hov && st.hov.col === n;
        var col = el("div", "enc-ch__col");
        var v = el("span", "enc-ch__colv");
        v.textContent = on ? (st.hov.seg === "base" ? (Y > 10 ? short(st.amt) : fmt(st.amt)) : "+" + (Y > 10 ? short(y) : fmt(y)))
                           : (Y > 10 ? short(st.amt + y * n) : fmt(st.amt + y * n));
        if (!show && !on) v.style.visibility = "hidden";
        if (on) v.setAttribute("data-enc-on", "");
        col.appendChild(v);
        var stack = el("div", "enc-ch__stack");
        var base = el("span", "enc-ch__base");
        base.style.height = h(st.amt) + "px";
        if (on && st.hov.seg === "base") base.setAttribute("data-enc-on", "");
        hover(base, n, "base");
        stack.appendChild(base);
        for (var j = 0; j < n; j++) {
          var seg = el("span", "enc-ch__seg" + (j === n - 1 ? " is-last" : ""));
          seg.style.height = h(y) + "px";
          if (on && st.hov.seg === j) seg.setAttribute("data-enc-on", "");
          hover(seg, n, j);
          stack.appendChild(seg);
        }
        col.appendChild(stack);
        var k = P.mono(on ? (st.hov.seg === "base" ? P.say("column stake") : P.say("column year", { n: st.hov.seg + 1 }))
                          : (Y > 8 ? String(n) : P.say("column", { n: n })), "enc-ch__colk");
        if (!show && !on) k.style.visibility = "hidden";
        if (on) k.setAttribute("data-enc-on", "");
        col.appendChild(k);
        chart.appendChild(col);
      }
    }
    function hover(node, col, seg) {
      node.addEventListener("mouseenter", function () { st.hov = { col: col, seg: seg }; paint(); });
      node.addEventListener("mouseleave", function () { st.hov = null; paint(); });
    }
    paint();
    return grid;
  };

  Page.prototype.list = function (rows, cls) {
    var w = el("div", "enc-ch__list " + cls);
    rows.forEach(function (r) {
      var row = el("div", "enc-ch__row");
      row.appendChild(el("span", "enc-ch__row-a", r[0]));
      row.appendChild(el("span", "enc-ch__row-b", r[1]));
      w.appendChild(row);
    });
    return w;
  };
  /* the other chains as pills, moving: the label holds still, the row drifts left behind it,
     paused on hover, still under reduced motion */
  Page.prototype.more = function () {
    var P = this;
    if (!P.others.length) return null;
    var w = el("div", "enc-ch__more");
    /* the label and "See all networks" across the window's width, over the drifting row
       (handoff, 2026-09-24) */
    var head = el("div", "enc-ch__more-head");
    head.appendChild(P.mono(P.say("more")));
    var all = el("a", "enc-ch__tert");
    all.href = P.say("all networks url") || "/networks";
    all.appendChild(el("span", null, P.say("all networks")));
    var badge = el("span", "enc-ch__badge enc-ch__badge--on");
    badge.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 5h7M5 1.5L8.5 5 5 8.5"/></svg>';
    all.appendChild(badge);
    head.appendChild(all);
    w.appendChild(head);
    var band = el("div", "enc-ch__marquee"), track = el("div", "enc-ch__mq");
    P.others.concat(P.others).forEach(function (x, i) {
      var a = el("a", "enc-ch__pill");
      a.href = x.href;                   /* /<row id> also works: Super redirects it to the path */
      if (i >= P.others.length) { a.setAttribute("aria-hidden", "true"); a.tabIndex = -1; }
      var g = el("span", "enc-ch__pg");
      g.style.background = TINTS[i % 5];
      if (x.glyph) { var im = el("img"); im.src = x.glyph; im.alt = ""; im.loading = "lazy"; g.appendChild(im); }
      a.appendChild(g);
      a.appendChild(el("span", "enc-ch__pn", x.name));
      track.appendChild(a);
    });
    band.appendChild(track);
    w.appendChild(band);
    return w;
  };

  /* Lido only: the validators we run for Lido, times 32 ETH, as stake — each figure with its
     picture, revealed in turn as the band scrolls past (R2s) */
  Page.prototype.validators = function () {
    var P = this, n = num(P.row["Validators run"]), each = num(P.say("each value"));
    if (!(n > 0) || !(each > 0)) return null;
    var s = el("section", "enc-ch__vals");
    s.setAttribute("data-enc-band", "validators");
    var frame = el("div", "enc-ch__vframe");
    var top = el("div", "enc-ch__top");
    top.appendChild(P.crumb());
    top.appendChild(P.mono(P.say("validators label"), "enc-ch__label"));
    frame.appendChild(top);
    var mid = el("div", "enc-ch__mid"), inner = el("div", "enc-ch__inner enc-ch__vinner");
    var eq = el("div", "enc-ch__eq");
    function dots(count, cols) {
      var rowsN = Math.ceil(count / cols), d = svg("svg", { viewBox: "0 0 " + cols * 20 + " " + rowsN * 20, role: "img", "aria-label": count + " units" });
      for (var i = 0; i < count; i++) d.appendChild(svg("circle", { cx: 10 + (i % cols) * 20, cy: 10 + Math.floor(i / cols) * 20, r: 7 }));
      return d;
    }
    function cell(label, value, draw, step) {
      var c = el("div", "enc-ch__vcell");
      c.setAttribute("data-enc-step", step);
      c.appendChild(P.mono(label));
      c.appendChild(el("span", "enc-ch__vfig", value));
      c.appendChild(draw);
      return c;
    }
    function op(ch, step) {
      var o = el("div", "enc-ch__op");
      o.setAttribute("data-enc-step", step);
      o.appendChild(el("span", null, ch));
      return o;
    }
    var stake = n * each;
    var pat = svg("svg", { viewBox: "0 0 500 400", role: "img", "aria-label": stake.toLocaleString("en-US") + " units" });
    var defs = svg("defs"), pt = svg("pattern", { id: "enc-ch-eth32", width: 20, height: 20, patternUnits: "userSpaceOnUse" });
    for (var j = 0; j < 32; j++) pt.appendChild(svg("circle", { cx: 3.5 + (j % 4) * 4.4, cy: 2.5 + Math.floor(j / 4) * 2.15, r: 0.85 }));
    defs.appendChild(pt); pat.appendChild(defs);
    pat.appendChild(svg("rect", { x: 0, y: 0, width: 500, height: 400, fill: "url(#enc-ch-eth32)" }));
    eq.appendChild(cell(P.say("validators"), n.toLocaleString("en-US"), dots(n, 25), 0));
    eq.appendChild(op("×", 1));
    eq.appendChild(cell(P.say("each"), String(each), dots(each, 4), 1));
    eq.appendChild(op("=", 2));
    eq.appendChild(cell(P.say("stake"), stake.toLocaleString("en-US"), pat, 2));
    inner.appendChild(eq);
    var p = el("p", "enc-ch__vline");
    ["line 1", "line 2", "line 3"].forEach(function (k, i) {
      var sp = el("span", null, P.say(k, { stake: stake.toLocaleString("en-US") }) + (i < 2 ? " " : ""));
      sp.setAttribute("data-enc-step", i);
      p.appendChild(sp);
    });
    inner.appendChild(p);
    mid.appendChild(inner);
    frame.appendChild(mid);
    s.appendChild(frame);
    return s;
  };

  /* the dock: a floating card, inset from the edges, carrying the two terms a delegator checks
     at the moment of acting — it rises once the first band has gone */
  Page.prototype.dock = function () {
    var P = this, d = el("div", "enc-ch-dock");
    d.setAttribute("aria-hidden", "true");
    var id = el("div", "enc-ch-dock__id");
    id.appendChild(P.mark(40));
    var n = el("div", "enc-ch-dock__n");
    n.appendChild(P.mono(P.name + " · " + (P.row.Stage || ""), "enc-ch__m9"));
    if (P.row.Explorer) {
      var a = el("a", "enc-ch__tert");
      a.href = P.row.Explorer; a.target = "_blank"; a.rel = "noopener";
      a.appendChild(el("span", null, P.say("our validator")));
      var b = el("span", "enc-ch__badge");
      b.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8L8 2M3 2h5v5"/></svg>';
      a.appendChild(b);
      n.appendChild(a);
    }
    id.appendChild(n);
    d.appendChild(id);
    var facts = el("div", "enc-ch-dock__facts");
    [[P.say("rate"), P.row["Reward rate"] || "—"], [P.say("commission"), P.row.Commission || "—"]].forEach(function (f) {
      var c = el("div", "enc-ch-dock__fact");
      c.appendChild(P.mono(f[0], "enc-ch__m9"));
      c.appendChild(el("span", "enc-ch-dock__v", f[1]));
      facts.appendChild(c);
    });
    d.appendChild(facts);
    var act = el("div", "enc-ch-dock__act");
    if (P.canCopy) {
      var cb = el("button", "enc-ch-dock__copy");
      cb.type = "button"; cb.title = P.addr; cb.setAttribute("aria-label", P.say("copy disc"));
      var sh = P.addr.length > 24 ? P.addr.slice(0, 14) + "…" + P.addr.slice(-6) : P.addr;
      cb.appendChild(el("span", "enc-ch-dock__a", sh));
      cb.appendChild(el("span", "enc-ch-dock__b", P.say("copied")));
      cb.addEventListener("click", function () { P.copy(cb); });
      act.appendChild(cb);
    }
    /* the page's own primary button: the lone callout, or the first of the pair */
    var primary = P.src.buttons && (P.src.buttons.matches(".notion-callout") ? P.src.buttons : P.src.buttons.querySelector(".notion-callout"));
    if (primary) act.appendChild(primary.cloneNode(true));
    d.appendChild(act);
    return d;
  };

  /* ── scroll: the dock, and the Lido band's reveal ──────────────────────────────────────── */
  var live = null;
  function onScroll() {
    if (!live) return;
    /* the dock rises once the hero has gone and slides away as the last band's foot reaches the
       viewport's, so it never lies over the footer (handoff, 2026-09-24) */
    var hero = live.wrap.querySelector(".enc-ch__hero"), last = live.wrap.querySelector("[data-enc-last]");
    if (hero && live.dock) {
      var on = hero.getBoundingClientRect().bottom < 80 &&
        (!last || last.getBoundingClientRect().bottom > window.innerHeight - 8);
      if (on !== live.docked) {
        live.docked = on;
        live.dock.toggleAttribute("data-enc-on", on);
        live.dock.setAttribute("aria-hidden", on ? "false" : "true");
      }
    }
    var v = live.wrap.querySelector(".enc-ch__vals");
    if (v) {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var r = v.getBoundingClientRect(), total = v.offsetHeight - window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
      Array.prototype.forEach.call(v.querySelectorAll("[data-enc-step]"), function (n) {
        n.toggleAttribute("data-enc-shown", p >= Number(n.getAttribute("data-enc-step")) / 3);
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ── build ─────────────────────────────────────────────────────────────────────────────── */
  /* Which row this page is. Super names the page after its path — "page-<row id>" at /<row id>,
     "page-networks-mainnet-monad" once the page has a path of its own in Super (the chain pages
     were given /networks/mainnet/<chain> on 2026-09-24) — so the id is read from the page's
     data, where the page's entry carries its "uri" and, after its properties, its "blockId". */
  var ids = {};
  /* only a page that can be a chain page is looked at: a row served at its own id, or a page
     under /networks/mainnet — anything else would cost a fetch on every client-side navigation */
  function pageKey() {
    var m = document.querySelector('main[id^="page-"]');
    if (!m) return null;
    var key = m.id.slice(5);
    return /^[0-9a-f]{32}$/.test(key.replace(/-/g, "")) || m.classList.contains("parent-page__networks-mainnet") ? key : null;
  }
  function idIn(text, path) {
    var at = text.indexOf('"uri":"' + path + '"');
    if (at < 0) return null;
    var m = /"blockId":"([0-9a-f-]{36})"/.exec(text.slice(at, at + 60000));
    return m ? m[1].replace(/-/g, "") : null;
  }
  function resolveId() {
    var key = pageKey();
    if (!key) return Promise.resolve(null);
    var hex = key.replace(/-/g, "");
    if (/^[0-9a-f]{32}$/.test(hex)) return Promise.resolve(hex);
    var path = location.pathname.replace(/\/$/, "");
    if (ids[path]) return ids[path];
    var raw = "";
    Array.prototype.forEach.call(document.scripts, function (s) {
      var t = s.textContent || "";
      if (t.indexOf("__next_f") >= 0) raw += t + "\n";
    });
    var found = idIn(decode(raw), path);
    ids[path] = found ? Promise.resolve(found)
      : fetch(location.pathname, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (h) { return idIn(decode(h), path); })
          .catch(function () { return null; });
    return ids[path];
  }
  var building = null;
  /* Build at once from what is at hand — the row's own data is in the page, and the shared words
     and the chain list come from localStorage (or the fallback words and no list on a first ever
     visit) — then read both fresh and build again only if they differ. The first visit used to
     wait for /networks and /services before drawing anything, which kept the page blank for four
     seconds on a slow connection (measured 2026-09-24). */
  function build(root, id, key) {
    building = key;
    root.setAttribute("data-enc-chain", "pending");
    var src = blocks(root);
    var kept = function (k, dflt) { var v = stored(k); return v ? v.value : dflt; };
    rowOf(id).then(function (row) {
      if (pageKey() !== key) { building = null; return; }
      if (!isChain(row)) { root.removeAttribute("data-enc-chain"); building = null; return; }
      var had = { words: kept("enc-chain-copy", {}), list: kept("enc-chain-list", []) };
      render(root, id, key, row, src, had.words, had.list);
      Promise.all([shared(), chains()]).then(function (res) {
        var words = res[0] || {}, list = res[1] || [];
        if (!live || live.key !== key || pageKey() !== key) return;
        if (JSON.stringify(words) === JSON.stringify(had.words) && JSON.stringify(list) === JSON.stringify(had.list)) return;
        var y = window.scrollY;
        render(root, id, key, row, src, words, list);
        if (y) window.scrollTo(0, y);
      });
    });
  }

  function render(root, id, key, row, src, shared, list) {
      var words = Object.assign({}, shared || {}, linesOf(src.toggle));
      var P = new Page(root, id, row, words, list || [], src);
      var wrap = el("div", "enc-ch");
      wrap.appendChild(P.hero());
      var vals = P.validators();
      if (vals) wrap.appendChild(vals);
      wrap.appendChild(P.band("terms", P.say("band terms"), [el("h2", "enc-ch__h2", P.say("terms title")), P.terms()]));
      if (!isNaN(P.rate)) wrap.appendChild(P.band("estimate", P.say("band estimate"), [el("h2", "enc-ch__h2", P.say("estimate title")), P.estimate()]));
      src.sections.forEach(function (sec, i) {
        var kids = [el("h2", "enc-ch__h2", sec.title)];
        if (sec.rows.length) kids.push(P.list(sec.rows, "enc-ch__work"));
        if (sec.faq.length) kids.push(P.list(sec.faq, "enc-ch__faq"));
        var last = i === src.sections.length - 1;
        if (last) kids.push(P.more());
        var band = P.band("s" + i, sec.title, kids);
        /* the dock is bound to the last band by this mark, not by position (handoff, 2026-09-24) */
        if (last) band.setAttribute("data-enc-last", "");
        wrap.appendChild(band);
        sec.nodes.forEach(function (n) { n.setAttribute("data-enc-source", ""); });
      });
      if (src.lede) src.lede.setAttribute("data-enc-source", "");
      if (src.toggle) src.toggle.setAttribute("data-enc-source", "");
      var old = root.querySelector(":scope > .enc-ch");
      root.insertBefore(wrap, root.firstChild);
      if (old) old.remove();
      wrap.style.setProperty("--sbw", Math.max(0, window.innerWidth - document.documentElement.clientWidth) + "px");
      document.querySelectorAll(".enc-ch-dock").forEach(function (n) { n.remove(); });
      var dock = P.dock();
      document.body.appendChild(dock);
      var first = !live || live.key !== key;
      live = { id: id, key: key, wrap: wrap, dock: dock, docked: false };
      root.setAttribute("data-enc-chain", VERSION);
      building = null;
      if (first && (window.scrollY || 0) < 40 && !location.hash) window.scrollTo(0, 0);
      onScroll();
  }

  function tick() {
    /* the shared toggle lives on /networks: keep it out of that page */
    Array.prototype.forEach.call(document.querySelectorAll(".notion-toggle:not([data-enc-chain-copy])"), function (t) {
      if (isCopy(t)) t.setAttribute("data-enc-chain-copy", "");
    });
    var key = pageKey(), root = document.querySelector(".notion-root");
    if (!key || !root) {
      if (live) { document.querySelectorAll(".enc-ch-dock").forEach(function (n) { n.remove(); }); live = null; }
      return;
    }
    if (live && live.key !== key) { document.querySelectorAll(".enc-ch-dock").forEach(function (n) { n.remove(); }); live = null; }
    if (building === key) return;
    /* Super may keep the root element across a client-side navigation: a mark belongs to its page */
    if (root.getAttribute("data-enc-chain-key") !== key) {
      root.removeAttribute("data-enc-chain");
      root.setAttribute("data-enc-chain-key", key);
    }
    var state = root.getAttribute("data-enc-chain");
    if (state === VERSION && live && live.key === key && root.contains(live.wrap)) return;
    if (state === "no") return;
    /* only a row of the Networks set is a chain page; anything else is marked and left alone */
    building = key;
    resolveId().then(function (id) {
      if (pageKey() !== key) { building = null; return; }
      if (!id) { building = null; root.setAttribute("data-enc-chain", "no"); return; }
      return rowOf(id).then(function (row) {
        if (pageKey() !== key) { building = null; return; }
        if (!isChain(row)) { building = null; root.setAttribute("data-enc-chain", "no"); return; }
        build(root, id, key);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
  else tick();
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 30); })
    .observe(document.documentElement, { childList: true, subtree: true });

  window.encChain = { version: VERSION, decode: decode, rowIn: rowIn, rowOf: rowOf, shared: shared, chains: chains };
})();
