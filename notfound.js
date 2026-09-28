/* The 404 page — design "404 Page" (404 Patterns, D · the finder), 2026-09-28.

   Super has no custom 404 page. Every address it does not know renders its own
   `.super-error.super-error__not-found` ("This page doesn't seem to exist. Click anywhere to go
   back.") between the site's bar and footer, with the site head — so this script, like every page
   script, is in the site head, and it builds the design beside that block (notfound.css hides it).

   Every word is Notion's. The page "Page not found" (a child of Home, served at /page-not-found
   and kept out of search by its own noindex head) holds, in order: the eyebrow's two texts, the
   Heading 1, the lede, the two button callouts, the figure's two notes (tag, line, tag, line), the
   finder's label, and a "404 page copy" toggle — the finder's words as `key · value` lines and its
   table of pages (Page | Path | Words | Line). A 404 carries none of those blocks, so the page is
   fetched once and kept in localStorage (read again past half an hour); on the page itself they
   are read from its own blocks. The networks are the Networks set's own, through navbar.js's
   window.encCounts(): each mainnet opens its chain page, a testnet-only chain opens /networks.
   FALLBACK is the design's words, for a first visit whose fetch has not come back.

   On a 404 Super puts the site head only into React's payload, and React renders its <script
   defer> tags without running them (measured 2026-09-28: no script of ours loaded, only the
   stylesheets) — the bar, the footer and the drawer stayed Super's own. React does load a
   <script async>, so this file is linked async, and on a 404 whose scripts did not run it inserts
   each of them again, in order (revive): the bar, the footer, the drawer and the counts come
   back. On every other page it does nothing. */
(function () {
  "use strict";

  var VERSION = "1";
  var SOURCE = "/page-not-found";
  var STORE = "enc-nf-copy";
  var FRESH = 30 * 60 * 1000;
  var EXAMPLE = "/staking-with-us";   // the design's own example address, shown on the source page
  var STOP = ["with", "us", "the", "and", "for", "to", "of", "on", "in", "our", "your", "my", "page",
              "www", "html", "index", "en"];

  var FALLBACK = {
    eyebrow: ["Encapsulate · 404", "Page not found"],
    title: "Nothing at this address.",
    lede: "If you followed a link from before we rebuilt the site, the page has moved. We searched for the words in it — pick a result, or type what you were after.",
    buttons: [{ label: "Book a call", href: "https://cal.com/aditya-encapsulate/30min", tier: 1 },
              { label: "Go to the homepage", href: "/", tier: 2 }],
    notes: [["4 · Client error", "Our servers are fine. The address is the problem."],
            ["04 · Not found", "No page lives at {path}. It may have moved."]],
    label: "Search the site",
    words: {
      "placeholder": "Type a page or a network", "all": "All pages", "results": "{n} results",
      "result": "1 result", "keys": "↑↓ move · enter opens", "none": "Nothing called “{q}” on the site.",
      "clear": "Show every page", "kind page": "Page", "kind network": "Network",
      "network mainnet": "Our validator on {chain}.", "network testnet": "A testnet we help — listed on Networks."
    },
    pages: [
      ["Home", "/", "home start", "Where we start: what we run, and for whom."],
      ["Networks", "/networks", "networks chains mainnet testnet reward rate stake staking validators", "Every chain we validate, with its reward rate."],
      ["Services", "/services", "services dashboards playbooks bots monitoring tools ansible", "Dashboards, playbooks, bots and monitoring, free to use."],
      ["Governance", "/governance-record", "governance votes voting proposals record", "How we vote, and every vote we have cast."],
      ["Security", "/security", "security keys hsm slashing", "How we keep keys safe and validators signing."],
      ["Staking guides", "/guides", "guides guide staking stake delegate wallet keplr how", "Step by step, per chain and wallet."],
      ["Blog", "/blog", "blog posts articles notes", "Notes from running validators."],
      ["Investments", "/investments", "investments portfolio", "The projects we have backed."],
      ["Contact", "/contact-us", "contact book call email talk", "Book a call, or write to us."]
    ],
    docTitle: "Page not found - Encapsulate"
  };

  /* ── the words, read from the page ─────────────────────────────────────────────────────── */
  function text(el) { return (el && el.textContent || "").replace(/\s+/g, " ").trim(); }

  function read(doc) {
    var root = doc.querySelector(".notion-root");
    if (!root) return null;
    var o = { eyebrow: [], buttons: [], notes: [], words: {}, pages: [] };
    var stage = 0, plain = [];
    Array.prototype.forEach.call(root.children, function (el) {
      if (el.matches("h1, .notion-heading") && /^H1$/.test(el.tagName)) { o.title = text(el); stage = 1; return; }
      if (el.matches(".notion-toggle")) {
        Array.prototype.forEach.call(el.querySelectorAll("p.notion-text"), function (p) {
          var t = text(p), at = t.indexOf(" · ");
          if (at > 0) o.words[t.slice(0, at).trim().toLowerCase()] = t.slice(at + 3).trim();
        });
        Array.prototype.forEach.call(el.querySelectorAll("table tr"), function (tr, i) {
          var c = Array.prototype.map.call(tr.querySelectorAll("td, th"), text);
          if (i === 0 && /^page$/i.test(c[0] || "")) return;   // the header row
          if (c[0] && c[1]) o.pages.push([c[0], c[1], c[2] || "", c[3] || ""]);
        });
        return;
      }
      if (el.matches(".notion-column-list")) {
        Array.prototype.forEach.call(el.querySelectorAll(".notion-callout"), function (c) {
          var a = c.querySelector("a[href]");
          if (!a) return;
          var tier = /\bbg-gray/.test(c.className) ? 2 : /\bbg-[a-z]+-light/.test(c.className) ? 1 : 3;
          o.buttons.push({ label: text(a), href: a.getAttribute("href"), tier: tier });
        });
        stage = 2;
        return;
      }
      if (!el.matches("p.notion-text")) return;
      var t = text(el);
      if (!t) return;
      if (stage === 0) o.eyebrow.push(t);
      else if (stage === 1) { if (!o.lede) o.lede = t; }
      else plain.push(t);
    });
    if (plain.length >= 4) o.notes = [[plain[0], plain[1]], [plain[2], plain[3]]];
    if (plain.length >= 5) o.label = plain[4];
    var title = doc.querySelector("title");
    if (title && text(title)) o.docTitle = text(title);
    return o.title ? o : null;
  }

  // what the page left out comes from the fallback, so a half-read page still builds whole
  function merged(o) {
    var m = {};
    Object.keys(FALLBACK).forEach(function (k) { m[k] = FALLBACK[k]; });
    if (!o) return m;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (k === "words") { m.words = {}; Object.keys(FALLBACK.words).forEach(function (w) { m.words[w] = v[w] || FALLBACK.words[w]; }); }
      else if (Array.isArray(v) ? v.length : v) m[k] = v;
    });
    return m;
  }

  function stored() {
    try { var s = JSON.parse(localStorage.getItem(STORE) || "null"); return s && s.v === VERSION ? s : null; }
    catch (e) { return null; }
  }
  var fetching = null;
  function refresh() {
    if (fetching) return fetching;
    fetching = fetch(SOURCE, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        var o = html ? read(new DOMParser().parseFromString(html, "text/html")) : null;
        if (o) try { localStorage.setItem(STORE, JSON.stringify({ v: VERSION, t: Date.now(), copy: o })); } catch (e) {}
        return o;
      }).catch(function () { return null; });
    return fetching;
  }

  /* ── the finder ────────────────────────────────────────────────────────────────────────── */
  function toks(q) {
    return q.toLowerCase().split(/[^a-z0-9.]+/).filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; });
  }
  function fill(s, map) { return String(s).replace(/\{(\w+)\}/g, function (all, k) { return map[k] != null ? map[k] : all; }); }

  function index(copy, nets) {
    var w = copy.words;
    var out = copy.pages.map(function (p) {
      return { kind: w["kind page"], page: true, label: p[0], href: p[1], desc: p[3], keys: (p[0] + " " + p[2]).toLowerCase() };
    });
    (nets || []).forEach(function (n) {
      if (!n || !n.name) return;
      var main = !!n.href;
      out.push({ kind: w["kind network"], page: false, label: n.name, href: main ? n.href : "/networks",
        desc: fill(main ? w["network mainnet"] : w["network testnet"], { chain: n.name }),
        keys: (n.name + " network chain validator " + (main ? "mainnet" : "testnet")).toLowerCase() });
    });
    return out;
  }

  function search(all, q) {
    var T = toks(q);
    if (!T.length) return all.filter(function (x) { return x.page; });
    return all.map(function (x) {
      var keys = x.keys.split(" ");
      return { x: x, sc: T.filter(function (t) { return keys.some(function (k) { return k.indexOf(t) === 0; }); }).length };
    }).filter(function (o) { return o.sc > 0; }).sort(function (a, b) {
      return b.sc - a.sc || (a.x.page === b.x.page ? a.x.label.localeCompare(b.x.label) : a.x.page ? -1 : 1);
    }).map(function (o) { return o.x; });
  }

  /* ── the page ──────────────────────────────────────────────────────────────────────────── */
  var SVG = "http://www.w3.org/2000/svg";
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function svg(w, paths, attrs) {
    var s = document.createElementNS(SVG, "svg");
    s.setAttribute("width", w); s.setAttribute("height", w); s.setAttribute("viewBox", "0 0 " + w + " " + w);
    s.setAttribute("fill", "none"); s.setAttribute("aria-hidden", "true");
    Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    paths.forEach(function (d) {
      var p = document.createElementNS(SVG, d[0]);
      Object.keys(d[1]).forEach(function (k) { p.setAttribute(k, d[1][k]); });
      s.appendChild(p);
    });
    return s;
  }
  function disc(kind) {
    var s = el("span", "enc-nf__disc");
    s.setAttribute("aria-hidden", "true");
    s.appendChild(kind === "x"
      ? svg(10, [["path", { d: "M2.5 2.5l5 5" }], ["path", { d: "M7.5 2.5l-5 5" }]], { stroke: "#000", "stroke-width": "1.6", "stroke-linecap": "round" })
      : svg(10, [["path", { d: "M2 5h6M5 2l3 3-3 3" }]], { stroke: "#000", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    return s;
  }

  function address(mode) {
    var raw = location.pathname;
    try { raw = decodeURIComponent(raw); } catch (e) {}
    return mode === "page" || raw === "/" ? EXAMPLE : raw;
  }

  var live = null;   // { sec, mode, path, copy, nets, off() }

  function build(wrap, mode, copy) {
    var path = address(mode);
    var words = path.replace(/^\/+|\/+$/g, "").split(/[\/\-_.]+/).filter(function (w) { return w.length > 1; }).join(" ").toLowerCase();
    var w = copy.words;
    var sec = el("section", "enc-nf");
    sec.setAttribute("data-enc-nf", VERSION);
    sec.setAttribute("aria-labelledby", "enc-nf-title");

    var eb = el("div", "enc-nf__eyebrow");
    eb.appendChild(el("span", null, copy.eyebrow[0] || ""));
    if (copy.eyebrow[1]) { eb.appendChild(el("span", "enc-nf__rule")); eb.appendChild(el("span", null, copy.eyebrow[1])); }
    sec.appendChild(eb);

    var grid = el("div", "enc-nf__grid");
    var lead = el("div", "enc-nf__lead");
    var h1 = el("h1", "enc-nf__title", copy.title); h1.id = "enc-nf-title";
    lead.appendChild(h1);
    lead.appendChild(el("p", "enc-nf__lede", copy.lede));
    var btns = el("div", "enc-nf__btns");
    copy.buttons.forEach(function (b) {
      var a = el("a", "enc-nf__btn enc-nf__btn--" + b.tier, b.label);
      a.href = b.href;
      btns.appendChild(a);
    });
    lead.appendChild(btns);
    grid.appendChild(lead);

    // the figure: the address's own number, each part explained by the note under it
    var fig = el("div", "enc-nf__fig");
    var word = el("div", "enc-nf__word");
    var digits = el("div", "enc-nf__digits");
    digits.setAttribute("aria-hidden", "true");
    digits.appendChild(el("span", null, "4")).setAttribute("data-part", "4");
    digits.appendChild(el("span", null, "04")).setAttribute("data-part", "04");
    word.appendChild(digits);
    ["4", "04"].forEach(function (part) {
      var hit = el("span", "enc-nf__hit");
      hit.setAttribute("data-part", part); hit.setAttribute("aria-hidden", "true");
      word.appendChild(hit);
    });
    ["4", "04"].forEach(function (part) {
      var ld = el("span", "enc-nf__leader");
      ld.setAttribute("data-part", part); ld.setAttribute("aria-hidden", "true");
      ld.appendChild(el("span"));
      word.appendChild(ld);
    });
    copy.notes.forEach(function (n, i) {
      var note = el("div", "enc-nf__note");
      note.setAttribute("data-part", i ? "04" : "4");
      note.appendChild(el("span", "enc-nf__tag", n[0]));
      note.appendChild(el("span", "enc-nf__line", fill(n[1], { path: path })));
      word.appendChild(note);
    });
    fig.appendChild(word);
    grid.appendChild(fig);

    // the finder
    var finder = el("div", "enc-nf__finder");
    var label = el("label", "enc-nf__label", copy.label);
    label.htmlFor = "enc-nf-q";
    finder.appendChild(label);
    var field = el("div", "enc-nf__field");
    field.appendChild(svg(16, [["circle", { cx: "7", cy: "7", r: "4.6" }], ["path", { d: "M10.4 10.4 14 14" }]],
      { stroke: "#6B6F68", "stroke-width": "1.6", "stroke-linecap": "round", "class": "enc-nf__glass" }));
    var input = el("input", "enc-nf__q");
    input.id = "enc-nf-q"; input.type = "search"; input.value = words;
    input.setAttribute("role", "combobox"); input.setAttribute("aria-controls", "enc-nf-list");
    input.setAttribute("aria-autocomplete", "list"); input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false"); input.placeholder = w.placeholder;
    field.appendChild(input);
    finder.appendChild(field);
    var list = el("div", "enc-nf__list");
    list.id = "enc-nf-list"; list.setAttribute("role", "listbox"); list.setAttribute("aria-label", "Results");
    finder.appendChild(list);
    var none = el("div", "enc-nf__none");
    none.setAttribute("role", "status");
    var noneLine = el("span", "enc-nf__none-line");
    var clear = el("button", "enc-nf__clear", w.clear);
    clear.type = "button";
    clear.appendChild(disc("x"));
    none.appendChild(noneLine); none.appendChild(clear);
    finder.appendChild(none);
    grid.appendChild(finder);
    sec.appendChild(grid);

    var st = { q: words, act: 0, R: [] };
    var nets = live && live.nets;
    function all() { return index(copy, nets); }

    function keepVisible(i) {
      var o = document.getElementById("enc-nf-o" + i);
      if (!o) return;
      var top = o.offsetTop, bot = top + o.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 36;
      else if (bot > list.scrollTop + list.clientHeight) list.scrollTop = bot - list.clientHeight + 4;
    }
    function mark() {
      Array.prototype.forEach.call(list.querySelectorAll("[role=option]"), function (o, i) {
        o.setAttribute("aria-selected", i === st.act ? "true" : "false");
      });
      if (st.R.length) input.setAttribute("aria-activedescendant", "enc-nf-o" + st.act);
      else input.removeAttribute("aria-activedescendant");
    }
    function render() {
      st.R = search(all(), st.q);
      st.act = Math.min(st.act, Math.max(0, st.R.length - 1));
      var has = toks(st.q).length > 0;
      list.textContent = "";
      list.hidden = !st.R.length;
      none.hidden = !!st.R.length;
      input.setAttribute("aria-expanded", st.R.length ? "true" : "false");
      if (!st.R.length) { noneLine.textContent = fill(w.none, { q: st.q }); mark(); return; }
      var head = el("div", "enc-nf__head");
      head.appendChild(el("span", null, has ? (st.R.length === 1 ? w.result : fill(w.results, { n: st.R.length })) : w.all));
      head.appendChild(el("span", "enc-nf__keys", w.keys));
      list.appendChild(head);
      st.R.forEach(function (r, i) {
        var a = el("a", "enc-nf__opt");
        a.id = "enc-nf-o" + i; a.href = r.href; a.setAttribute("role", "option");
        var l = el("span", "enc-nf__opt-text");
        l.appendChild(el("span", "enc-nf__opt-label", r.label));
        l.appendChild(el("span", "enc-nf__opt-desc", r.desc));
        a.appendChild(l);
        var k = el("span", "enc-nf__opt-meta");
        k.appendChild(el("span", "enc-nf__opt-kind", r.kind));
        k.appendChild(el("span", "enc-nf__opt-path", r.href));
        a.appendChild(k);
        a.appendChild(disc("arrow"));
        a.addEventListener("mouseenter", function () { if (st.act !== i) { st.act = i; mark(); } });
        list.appendChild(a);
      });
      mark();
    }

    input.addEventListener("input", function () { st.q = input.value; st.act = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        st.act = e.key === "ArrowDown" ? Math.min(st.R.length - 1, st.act + 1) : Math.max(0, st.act - 1);
        mark(); keepVisible(st.act);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (st.R[st.act]) window.location.href = st.R[st.act].href;
      } else if (e.key === "Escape") {
        input.value = st.q = ""; st.act = 0; render();
      }
    });
    clear.addEventListener("click", function () { input.value = st.q = ""; st.act = 0; render(); input.focus(); });

    // the figure explains itself: a part or its note under the pointer lights the pair
    Array.prototype.forEach.call(word.querySelectorAll(".enc-nf__hit, .enc-nf__note"), function (n) {
      n.addEventListener("mouseenter", function () { word.setAttribute("data-hl", n.getAttribute("data-part")); });
      n.addEventListener("mouseleave", function () { word.removeAttribute("data-hl"); });
    });

    // typing anywhere on the page goes to the search field; the ring shows for the keyboard only
    function onKey(e) {
      if (e.key === "Tab") sec.removeAttribute("data-mouse");
      if (e.metaKey || e.ctrlKey || e.altKey || !e.key || e.key.length !== 1) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT" || (t && t.isContentEditable)) return;
      if (document.documentElement.hasAttribute("data-enc-locked") || document.documentElement.hasAttribute("data-enc-sheet")) return;
      input.focus();
    }
    function onDown() { sec.setAttribute("data-mouse", ""); }
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onDown, true);

    wrap.insertBefore(sec, wrap.firstChild);
    render();
    return {
      sec: sec, mode: mode, path: location.pathname, copy: copy, nets: nets,
      setNets: function (n) { nets = n; render(); },
      pristine: function () { return input.value === words && document.activeElement !== input; },
      off: function () {
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("mousedown", onDown, true);
        if (sec.parentNode) sec.parentNode.removeChild(sec);
      }
    };
  }

  /* ── the site's own scripts, on a 404 ─────────────────────────────────────────────────── */
  var revived = false;
  function revive() {
    if (revived || window.encNav) return;   // navbar.js ran: the page's scripts are live
    revived = true;
    Array.prototype.forEach.call(document.querySelectorAll('script[src*="/website-css@"]'), function (old) {
      if (/\/notfound\.js/.test(old.src)) return;
      var s = document.createElement("script");
      s.src = old.src;
      s.async = false;   // in their own order, as defer would have run them
      document.head.appendChild(s);
    });
  }

  /* ── when ──────────────────────────────────────────────────────────────────────────────── */
  function mode() {
    if (document.querySelector(".super-error__not-found")) return "404";
    if (location.pathname.replace(/\/+$/, "") === SOURCE && document.querySelector(".notion-root .notion-heading")) return "page";
    return null;
  }

  var asked = false;
  function networks() {
    if (asked || !live || typeof window.encCounts !== "function") return;
    asked = true;
    window.encCounts().then(function (c) {
      var n = c && c.list;
      if (!n || !n.length) return;
      if (live) { live.nets = n; live.setNets(n); }
      else pending = n;
    }).catch(function () {});
  }
  var pending = null;

  function tick() {
    var m = mode();
    var wrap = document.querySelector(".super-content-wrapper");
    if (!m || !wrap) {
      if (live) { live.off(); live = null; }
      return;
    }
    if (m === "404") revive();
    if (live && live.sec.parentNode === wrap && live.mode === m && live.path === location.pathname) { networks(); return; }
    if (live) { live.off(); live = null; }

    var copy;
    if (m === "page") copy = merged(read(document));
    else {
      var s = stored();
      copy = merged(s && s.copy);
      if (!s || Date.now() - s.t > FRESH) refresh().then(function (o) {
        // rebuild with the page's words only if the reader has not started on the finder
        if (o && live && live.mode === "404" && live.pristine() && JSON.stringify(merged(o)) !== JSON.stringify(live.copy)) {
          live.off(); live = null; tick();
        }
      });
      if (!document.title || document.title === "404") document.title = copy.docTitle;
    }
    live = build(wrap, m, copy);
    if (pending) { live.nets = pending; live.setNets(pending); }
    networks();
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; tick(); }, 0);
  }
  function start() {
    tick();
    new MutationObserver(function () {
      // Super's error block or the page's own blocks may arrive after the first pass, and on a 404
      // the revived navbar.js brings window.encCounts a moment later
      if (!live || !live.sec.isConnected || mode() !== (live && live.mode) || !asked) schedule();
    }).observe(document.body, { childList: true, subtree: true });
  }
  window.encNotFound = { version: VERSION, read: read, search: search };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
