/* /guides/<stage>/<chain> — design "Staking Guide Variation 1d".

   One step per screen: an ink head with the chain-and-wallet mark, the title and the lede; then
   one band per step carrying the number, the surface it happens on, the title, the body, the
   "Watch out" note and the capture; then an ink close with the next guide.

   Everything is Notion's. A step is one row of the guide's own slide database — Name
   ("01 · Unlock Keplr"), Step, Body, Watch, Surface and Link, with the capture as its Cover — so
   a step's picture and its words are one record. The title and the lede are properties of the
   Guides Database row, which Super renders on /guides and not on the guide — the same as the
   blog post page, so they are read from the index with one fetch. The page's own shared words
   (the crumb, "Watch out", the close band) are a "Guide page copy" toggle on /guides.

   Loaded from the SITE head: Super does not run a page's own scripts on a client-side
   navigation, so this builds off a MutationObserver like every other page script. */
(function () {
  var PATH = /^\/guides\/[^/]+\/[^/]+/;
  var VERSION = "1";
  var INDEX = "/guides";

  /* the fallback if the "Guide page copy" toggle goes missing */
  var CONTENT = {
    "crumb": "Encapsulate · Guides",
    "scroll": "Scroll ↓",
    "screens": "{N} screens",
    "of": "of {n}",
    "watch": "Watch out",
    "done": "Done · {n} of {n}",
    "close title": "Staked with Encapsulate.",
    "close line": "Rewards accrue from the next block. Next up: {next}.",
    "next": "Next: {chain}",
    "all": "All guides",
    "help": "Need help? Ask on Discord",
    "help url": "https://discord.gg/q6cmGycxsr"
  };
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  /* the design spells the count where it reads as a sentence ("Eight screens") and keeps digits
     where it is a counter ("of 8", "Done · 8 of 8"), so a copy line asks for {N} or {n} */
  var SPELL = ["no", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen"];

  function say(key, vars) {
    var t = CONTENT[key] || "";
    vars = vars || {};
    if (vars.n != null && vars.N == null) vars.N = SPELL[vars.n] || vars.n;
    Object.keys(vars).forEach(function (k) {
      t = t.split("{" + k + "}").join(vars[k] == null ? "" : vars[k]);
    });
    return t.trim();
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function textOf(n) { return ((n && n.textContent) || "").replace(/\s+/g, " ").trim(); }
  function tint(name) {
    var s = 0, i;
    for (i = 0; i < (name || "").length; i++) s = (s * 31 + name.charCodeAt(i)) % 9973;
    return TINTS[s % TINTS.length];
  }
  /* Super serves every image through its own optimiser; the design draws the original */
  function original(img) {
    if (!img) return "";
    var full = img.getAttribute("data-full-size");
    if (full) return full;
    var m = /[?&]url=([^&]+)/.exec(img.getAttribute("src") || "");
    return m ? decodeURIComponent(m[1]) : (img.getAttribute("src") || "");
  }

  function badge(kind) {
    var b = el("span", "enc-gd__badge");
    b.setAttribute("data-enc-badge", kind);
    b.innerHTML = kind === "arrow"
      ? '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9L9 3"/><path d="M4.5 3H9v4.5"/></svg>'
      : kind === "minus"
        ? '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 6h8"/></svg>'
        : '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 2v8"/><path d="M2 6h8"/></svg>';
    return b;
  }

  /* ── the steps: the guide's own slide database ───────────────────────────────────────────
     One row per step, so a step's capture and its words are the same record: Name ("01 · Unlock
     Keplr"), Step, Body, Watch, Surface and Link, with the capture as the row's Cover. They must
     be shown on that gallery's view — the API cannot switch a view's properties on — and a guide
     whose slides carry none of them is simply left as it was.

     The deck is found by content — the collection whose cards are numbered steps. */
  function deck(root) {
    var found = [], col = null, best = 0;
    var STEP = /^(\d+)\s*[·.\-]\s*(.*)$/;
    Array.prototype.forEach.call(root.querySelectorAll(".notion-collection"), function (c) {
      /* the deck is the collection whose cards are numbered steps. "The cards are not links" was
         the first test and it stopped working the moment Link was switched on: Super renders a
         card with a url property as an anchor, so both collections were links (2026-09-23). */
      var n = 0;
      Array.prototype.forEach.call(c.querySelectorAll(".notion-property__title"), function (t) {
        if (STEP.test(textOf(t))) n++;
      });
      if (n > best) { best = n; col = c; }
    });
    if (!col || best < 2) return [];
    Array.prototype.forEach.call(col.querySelectorAll(".notion-collection-card"), function (card) {
      var name = textOf(card.querySelector(".notion-property__title"));
      var m = STEP.exec(name);
      if (!m) return;                                   // the cover slide carries no step
      /* Body then Watch, in the view's own order — Super renders a card's properties in it and
         drops an empty one, so a step with no note simply has one text. Sorting them by length
         was tried first and swapped the two on any step whose note was the longer line
         (2026-09-23). A text that repeats the step's title is skipped: that is a Title property
         left switched on beside Name. */
      var texts = Array.prototype.map.call(
        card.querySelectorAll(".notion-property__text"), textOf).filter(function (t) {
          return t && t !== (m[2] || "") && t !== name;
        });
      var img = card.querySelector("img");
      /* Link renders as the card's own anchor when the view shows it, and as a url property when
         it does not, so take whichever is there */
      var url = card.querySelector(".notion-property__url a[href]") ||
                card.querySelector("a[href^='http']");
      found.push({
        n: parseInt(m[1], 10),
        title: m[2] || name,
        body: texts[0] || "",
        watch: texts[1] || "",
        surface: textOf(card.querySelector(".notion-property__select .notion-pill")) ||
                 textOf(card.querySelector(".notion-property__select")),
        href: url ? url.getAttribute("href") : "",
        shot: img ? original(img) : ""
      });
    });
    if (found.length) col.setAttribute("data-enc-source", "slides");
    found.sort(function (a, b) { return a.n - b.n; });
    return found;
  }

  /* ── the facts that live on /guides ───────────────────────────────────────────────────────
     Title, Lede, Step and Time are properties of the row; the chain's and the wallet's marks
     are cards of the two galleries on the same page. One fetch, parsed once. */
  var indexOnce = null;
  function index() {
    if (indexOnce) return indexOnce;
    indexOnce = fetch(INDEX, { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        Array.prototype.forEach.call(doc.querySelectorAll(".notion-toggle"), function (t) {
          if (!/guide page copy/i.test(textOf(t.querySelector(".notion-toggle__summary")))) return;
          Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
            var line = textOf(p), i = line.indexOf("·");
            if (i < 0) return;
            var k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
            if (k && v) CONTENT[k] = v;
          });
        });
        return doc;
      })
      .catch(function () { return null; });
    return indexOnce;
  }

  /* every gallery card on the index, keyed by its title — the chain marks and the wallet marks
     are two of those galleries, so one map answers both */
  function marks(doc) {
    var map = {};
    /* The chain's mark and the wallet's are the Networks set and the Wallet Set on the same page
       — one a gallery, the other a table (a view can be either, as guides.js found). A mark is a
       `data-full-size` on the card, not an <img>: Super draws a collection's Cover as a span with
       the original on that attribute. Guide cards are skipped, or "Axelar" would answer with the
       guide's own cover instead of the chain's glyph. */
    Array.prototype.forEach.call(doc.querySelectorAll(".notion-collection-card, tbody tr"), function (c) {
      if (c.querySelector("a[href^='/guides/']")) return;
      var name = textOf(c.querySelector(".notion-property__title") || c.querySelector("td"));
      var shot = c.querySelector("[data-full-size]");
      var url = shot ? (shot.getAttribute("data-full-size") || original(shot)) : "";
      if (name && url && !map[name.toLowerCase()]) map[name.toLowerCase()] = url;
    });
    return map;
  }

  /* this guide's row, and the one after it */
  function fromIndex() {
    return index().then(function (doc) {
      if (!doc) return { me: null, next: null, marks: {} };
      var here = location.pathname.replace(/\/$/, "");
      var cards = [], mine = null, idx = -1;
      Array.prototype.forEach.call(doc.querySelectorAll(".notion-collection-card"), function (c) {
        var a = c.querySelector("a[href^='/guides/']");
        if (!a) return;
        cards.push(c);
        if (a.getAttribute("href").replace(/\/$/, "") === here) { mine = c; idx = cards.length - 1; }
      });
      var next = idx >= 0 ? (cards[idx + 1] || cards[0]) : null;
      if (next === mine) next = null;
      return { me: read(mine), next: read(next), marks: marks(doc) };
    });
  }

  function read(card) {
    if (!card) return null;
    var a = card.querySelector("a[href^='/guides/']");
    var texts = Array.prototype.map.call(
      card.querySelectorAll(".notion-property__text"), textOf).filter(Boolean);
    var pages = Array.prototype.map.call(
      card.querySelectorAll(".notion-property__relation .notion-page__title"), textOf).filter(Boolean);
    var nums = Array.prototype.map.call(
      card.querySelectorAll(".notion-property__number"), textOf).filter(Boolean);
    /* the two text properties are Title and Lede: the lede is the long one */
    var title = "", lede = "";
    texts.forEach(function (t) {
      if (t.length > 90) { if (t.length > lede.length) lede = t; }
      else if (!title) title = t;
    });
    return {
      name: textOf(card.querySelector(".notion-property__title")),
      title: title,
      lede: lede,
      chain: pages[0] || "",
      wallet: pages[1] || "",
      steps: parseInt(nums[0], 10) || 0,
      mins: parseInt(nums[1], 10) || 0,
      href: a ? a.getAttribute("href") : ""
    };
  }

  /* ── the bands ────────────────────────────────────────────────────────────────────────── */
  function mono(text, cls) { return el("span", "enc-gd__mono" + (cls ? " " + cls : ""), text); }
  function rule() { return el("span", "enc-gd__rule"); }

  function pairMark(me, marks) {
    var wrap = el("span", "enc-gd__pair");
    var disc = el("span", "enc-gd__disc");
    disc.style.background = tint(me.chain || me.name);
    var g = marks[(me.chain || "").toLowerCase()];
    if (g) {
      var i = el("img");
      i.src = g; i.alt = "";
      disc.appendChild(i);
    }
    wrap.appendChild(disc);
    var w = marks[(me.wallet || "").toLowerCase()];
    var badgeW = el("span", "enc-gd__wallet");
    if (w) {
      var wi = el("img");
      wi.src = w; wi.alt = "";
      badgeW.appendChild(wi);
      wrap.appendChild(badgeW);
    }
    return wrap;
  }

  function head(me, marks, count) {
    var s = el("section", "enc-gd__band enc-gd__head");
    var crumb = el("div", "enc-gd__crumb");
    crumb.appendChild(mono(say("crumb")));
    crumb.appendChild(rule());
    crumb.appendChild(mono(me.chain || me.name));
    s.appendChild(crumb);

    var mid = el("div", "enc-gd__headmid");
    mid.appendChild(pairMark(me, marks));
    var col = el("div", "enc-gd__headtext");
    col.appendChild(el("h1", "enc-gd__title", me.title || me.name));
    if (me.lede) col.appendChild(el("p", "enc-gd__lede", me.lede));
    mid.appendChild(col);
    s.appendChild(mid);

    var foot = el("div", "enc-gd__headfoot");
    foot.appendChild(mono(say("screens", { n: count })));
    foot.appendChild(rule());
    foot.appendChild(mono(say("scroll")));
    s.appendChild(foot);
    return s;
  }

  /* the numeral: a paper glyph ringed by ink (text-shadow, so the union has no seams) with the
     green fill clipped to a third copy on top — the design's own construction */
  function numeral(n) {
    var wrap = el("div", "enc-gd__numeral");
    wrap.setAttribute("aria-hidden", "true");
    var label = ("0" + n).slice(-2);
    wrap.appendChild(el("span", "enc-gd__numring", label));
    wrap.appendChild(el("span", "enc-gd__numfill", label));
    return wrap;
  }

  /* A step is the design's own shape: a header (the count and the surface on the left; the title,
     the body and — on a wide step — the note on the right), then the capture 24px under it. A
     wallet capture is tall and stands at the left with the note beside it; a dashboard capture is
     wide and runs under the header. Which it is comes from the surface at build (the design keys it
     the same way), then from the capture's own proportions once it loads, so the band is laid out
     right before a lazy capture arrives. */
  function stepBand(step, i, total) {
    var s = el("section", "enc-gd__band enc-gd__step");
    s.appendChild(numeral(step.n || i + 1));
    var content = el("div", "enc-gd__content");

    var header = el("div", "enc-gd__header");
    var left = el("div", "enc-gd__left");
    var count = el("div", "enc-gd__count");
    count.appendChild(el("span", "enc-gd__fig", ("0" + (step.n || i + 1)).slice(-2)));
    count.appendChild(mono(say("of", { n: total })));
    left.appendChild(count);
    if (step.surface) {
      var a = el("a", "enc-gd__surface");
      a.href = step.href || "#";
      if (/^https?:/.test(step.href || "")) { a.target = "_blank"; a.rel = "noopener"; }
      a.appendChild(el("span", null, step.surface));
      a.appendChild(badge("arrow"));
      left.appendChild(a);
    }
    header.appendChild(left);

    var right = el("div", "enc-gd__right");
    right.appendChild(el("h2", "enc-gd__steptitle", step.title));
    var well = el("div", "enc-gd__well");
    well.appendChild(el("p", "enc-gd__body", step.body));
    right.appendChild(well);
    header.appendChild(right);
    content.appendChild(header);

    var row = el("div", "enc-gd__row");
    var shot = el("figure", "enc-gd__shot");
    var img = el("img");
    img.alt = step.title;
    img.loading = i > 1 ? "lazy" : "eager";
    img.src = step.shot || "";
    shot.appendChild(img);
    if (!step.shot) shot.setAttribute("data-enc-empty", "1");
    row.appendChild(shot);
    var aside = el("div", "enc-gd__aside");
    row.appendChild(aside);
    content.appendChild(row);
    s.appendChild(content);

    var note = step.watch ? watch(step, i) : null;
    function place(tall) {
      s.setAttribute("data-enc-shot", tall ? "tall" : "wide");
      if (note) (tall ? aside : right).appendChild(note);
    }
    place(/extension/i.test(step.surface || ""));
    function settle() { if (img.naturalWidth) place(img.naturalWidth < img.naturalHeight); }
    img.addEventListener("load", settle);
    if (img.complete) settle();
    return s;
  }

  function watch(step, i) {
    var wrap = el("div", "enc-gd__watch");
    var btn = el("button", "enc-gd__watchbtn");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.appendChild(el("span", null, say("watch")));
    var b = badge("plus");
    btn.appendChild(b);
    var note = el("div", "enc-gd__note", step.watch);
    note.hidden = true;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      note.hidden = open;
      b.innerHTML = "";
      var nb = badge(open ? "plus" : "minus");
      b.innerHTML = nb.innerHTML;
    });
    wrap.appendChild(btn);
    wrap.appendChild(note);
    return wrap;
  }

  function close(me, next, total) {
    var s = el("section", "enc-gd__band enc-gd__close");
    s.appendChild(mono(say("done", { n: total })));
    s.appendChild(el("h2", "enc-gd__closetitle", say("close title")));
    s.appendChild(el("p", "enc-gd__closeline",
      say("close line", { next: next ? (next.title || next.name) : "" })));
    var row = el("div", "enc-gd__cta");
    if (next) {
      var a = el("a", "enc-gd__btn enc-gd__btn--primary",
        say("next", { chain: next.chain || next.name }));
      a.href = next.href;
      row.appendChild(a);
    }
    var all = el("a", "enc-gd__btn enc-gd__btn--secondary", say("all"));
    all.href = INDEX;
    row.appendChild(all);
    s.appendChild(row);

    /* the design's way out for the stuck, on its own line so it is not weighed against the two
       ways forward */
    if (say("help") && say("help url")) {
      var help = el("a", "enc-gd__help");
      help.href = say("help url");
      help.target = "_blank";
      help.rel = "noopener";
      help.appendChild(el("span", null, say("help")));
      help.appendChild(badge("arrow"));
      s.appendChild(help);
    }
    return s;
  }

  /* ── progress: the fill inside every numeral is how far the reader is through the steps ──
     Testable in Node: progress(top, first, last) is pure. */
  function progress(y, first, last) {
    if (last <= first) return 0;
    return Math.max(0, Math.min(1, (y - first) / (last - first)));
  }

  function build(root) {
    var list = deck(root);
    if (!list.length) return;

    /* claim the page before the fetch: the observer fires again while the index is loading, and
       two builds in flight appended two sets of bands */
    root.setAttribute("data-enc-guide", VERSION);
    return fromIndex().then(function (info) {
      var me = info.me || { name: textOf(document.querySelector(".notion-header__title")) };
      var wrap = el("div", "enc-gd");
      wrap.appendChild(head(me, info.marks || {}, list.length));
      list.forEach(function (st, i) { wrap.appendChild(stepBand(st, i, list.length)); });
      wrap.appendChild(close(me, info.next, list.length));

      var old = root.querySelector(".enc-gd");
      if (old) old.remove();
      /* the reader is at the top of a page that is about to grow by ten screens above them:
         Chrome's scroll anchoring holds the content they were looking at — the footer — so the
         page opened at the bottom (2026-09-23). Anchoring is off for this page in guide.css, and
         the top is restored here for the frames where it has already happened; a link to a band
         (#block-…) is left alone. */
      var atTop = (window.scrollY || document.documentElement.scrollTop || 0) < 40;
      root.insertBefore(wrap, root.firstChild);
      if (atTop && !location.hash) {
        var top = function () {
          window.scrollTo(0, 0);
          if (document.documentElement.scrollTop) document.documentElement.scrollTop = 0;
        };
        top();
        requestAnimationFrame(top);
        setTimeout(top, 0);
        setTimeout(top, 120);
      }

      var bands = wrap.querySelectorAll(".enc-gd__step");
      function paint() {
        if (!bands.length) return;
        var first = bands[0].getBoundingClientRect().top + window.scrollY;
        var lastB = bands[bands.length - 1];
        var last = lastB.getBoundingClientRect().top + window.scrollY;
        wrap.style.setProperty("--enc-gd-p", progress(window.scrollY, first, last));
      }
      window.addEventListener("scroll", paint, { passive: true });
      window.addEventListener("resize", paint);
      paint();
    });
  }

  function guidePage() {
    return PATH.test(location.pathname);
  }

  function tick() {
    if (!guidePage()) return;
    var root = document.querySelector(".notion-root");
    if (!root || root.getAttribute("data-enc-guide") === VERSION) return;
    var old = root.querySelector(".enc-gd");
    if (old) old.remove();
    build(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }
  new MutationObserver(function () { tick(); })
    .observe(document.documentElement, { childList: true, subtree: true });

  window.encGuide = { version: VERSION, progress: progress, deck: deck };
  if (typeof module !== "undefined" && module.exports) module.exports = { progress: progress };
})();
