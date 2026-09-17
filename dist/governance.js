/* /governance-record — design "Governance Record". Linked from the SITE head, because Super never
   executes a page's own script on a client-side navigation.

   The page is the homepage's 37h given the whole record: an ink count band, the pillars band, the
   controls, and the rows. This file does the three things CSS cannot:

     1. the count band's field — one 7px mark per vote, in blocks of a hundred, drawn from the
        figure in the band's own Notion text (the number stays Notion's; only the marks are ours);
     2. each row's chain — the view is grouped by chain, so the group's own heading names it; the
        chain is copied onto the row as a label and a tinted disc, one stable tint per chain;
     3. the search field in the control bar. Super's view picker supplies the chain and outcome
        filters (the record has a view per chain and per outcome), so those are Notion's; an input
        is the one control Notion has no block for. Same recipe as /networks — see CLAUDE.md,
        "Search and sort on a Notion gallery".

   Styles: governance.css, "THE RECORD". */
(function () {
  var BAND = "block-3dde800a513881b1b88dd0b73f874bfe";
  var TABLE = "block-c458e5dd671d4ecb8fc07a15915e4f42";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var HEAD = "block-a9ed1443a36c4f6da5ac9cbae489c031";   // "Every vote, four pillars behind it."
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

  /* ── 1 · the count band ── */
  function count() {
    var band = document.getElementById(BAND);
    if (!band) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    var ps = content.querySelectorAll(":scope > p.notion-text");
    if (ps.length < 5) return;
    var total = parseInt((ps[1].textContent || "").replace(/[^\d]/g, ""), 10);
    if (!total) return;
    if (band.getAttribute("data-enc-total") === String(total)) return;
    band.setAttribute("data-enc-total", String(total));

    var old = band.querySelector(".enc-rec__field");
    if (old) old.remove();
    var field = el("div", "enc-rec__field");
    for (var at = 0; at < total; at += 100) {
      var n = Math.min(100, total - at);
      var block = el("div", "enc-rec__hundred");
      block.title = n === 100 ? "100 votes" : n + " votes";
      if ((at / 100) % 2) block.setAttribute("data-dim", "");
      for (var i = 0; i < n; i++) block.appendChild(el("span", "enc-rec__mark"));
      field.appendChild(block);
    }
    ps[4].after(field);
  }

  /* ── 2 · the rows ── */
  /* Each row names its own chain: the view shows the Chain property, and the chain is whichever of
     the row's select cells matches a chain we have a mark for. (It used to come from the group
     heading, which only existed while the view was grouped by chain.) */
  function rows() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var marks = glyphs();
    Array.prototype.forEach.call(box.querySelectorAll("tbody tr"), function (tr) {
      var cell = tr.querySelector("td.title");
      if (!cell || cell.querySelector(".enc-rec__mark-disc")) return;
      var name = "";
      Array.prototype.forEach.call(tr.querySelectorAll("td.select"), function (td) {
        var t = td.textContent.trim();
        if (!name && t && marks[key(t)]) { name = t; td.setAttribute("data-enc-chain", ""); }
      });
      if (!name) return;
      var disc = el("span", "enc-rec__mark-disc");
      disc.style.background = tintFor(name.toLowerCase());
      var url = marks[key(name)];
      if (url) {
        var img = el("img");
        img.src = url; img.alt = ""; img.loading = "lazy";
        disc.appendChild(img);
      }
      cell.insertBefore(disc, cell.firstChild);
      cell.appendChild(el("span", "enc-rec__chain", name));
      tr.setAttribute("data-enc-row", "");
    });
    box.setAttribute("data-enc-record", "");
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
    var d = tr.querySelector("td.date");
    var t = d ? Date.parse(d.textContent.trim()) : NaN;
    return isNaN(t) ? 0 : t;
  }

  function menu(key, label, options, glyphFor) {
    var box = el("div", "enc-rec__menu");
    box.setAttribute("data-menu", key);
    var trigger = el("button", "enc-rec__trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    var kicker = el("span", "enc-rec__kicker", label);
    var value = el("span", "enc-rec__value", options[0][0] || "All");
    trigger.appendChild(kicker);
    trigger.appendChild(value);
    trigger.appendChild(el("span", "enc-rec__chevron"));
    box.appendChild(trigger);

    var panel = el("div", "enc-rec__panel");
    panel.setAttribute("role", "listbox");
    panel.hidden = true;
    options.forEach(function (o) {
      var item = el("button", "enc-rec__option");
      item.type = "button";
      item.setAttribute("role", "option");
      if (glyphFor) {
        var g = glyphFor(o[2]);
        if (g) item.appendChild(g);
      }
      item.appendChild(el("span", "enc-rec__option-label", o[0]));
      if (o[1] != null) item.appendChild(el("span", "enc-rec__count", String(o[1])));
      item.appendChild(el("span", "enc-rec__tick"));
      if (o[1] === 0) { item.disabled = true; item.title = "No votes in the record yet"; }
      // Super closes its own dropdown on a document pointerdown, which cancels the event — so the
      // choice is taken on pointerdown here too
      item.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        state[key] = o[2];
        value.textContent = o[0];
        Array.prototype.forEach.call(panel.children, function (x) { x.removeAttribute("data-on"); });
        item.setAttribute("data-on", "");
        panel.hidden = true;
        apply();
      });
      panel.appendChild(item);
    });
    trigger.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      var open = panel.hidden;
      document.querySelectorAll(".enc-rec__panel").forEach(function (p) { p.hidden = true; });
      panel.hidden = !open;
    });
    box.appendChild(panel);
    return box;
  }

  function controls() {
    var box = document.getElementById(TABLE);
    if (!box || box.querySelector(".enc-rec__bar")) return;
    var rows = rowsOf();
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
    var sortOpts = [["Recent votes", null, ""], ["Oldest first", null, "oldest"], ["By chain", null, "chain"]];

    var bar = el("div", "enc-rec__bar");
    bar.appendChild(menu("chain", "Chain", chainOpts, glyphFor));
    bar.appendChild(el("span", "enc-rec__rule"));
    bar.appendChild(menu("vote", "Vote", voteOpts, dotFor));
    bar.appendChild(el("span", "enc-rec__spacer"));
    bar.appendChild(el("span", "enc-rec__rule"));
    bar.appendChild(menu("sort", "Sort", sortOpts));
    bar.appendChild(el("span", "enc-rec__rule"));

    var field = el("label", "enc-rec__find");
    var input = el("input");
    input.type = "text";
    input.placeholder = "Find a proposal";
    input.setAttribute("aria-label", "Find a proposal by number or title");
    field.appendChild(input);
    field.addEventListener("pointerdown", function () { setTimeout(function () { input.focus(); }, 0); });
    input.addEventListener("input", function () { state.q = input.value; apply(); });
    bar.appendChild(field);

    var header = box.querySelector(".notion-collection__header-wrapper");
    if (header) header.setAttribute("data-enc-source", "");
    box.insertBefore(bar, box.firstChild);
    document.addEventListener("pointerdown", function (e) {
      if (!e.target.closest(".enc-rec__menu")) {
        document.querySelectorAll(".enc-rec__panel").forEach(function (p) { p.hidden = true; });
      }
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
      img.src = url; img.alt = "";
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
  var glyphCache = null;
  function glyphs() {
    if (glyphCache) return glyphCache;
    var out = {};
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

  /* filtering and sorting run on the rows Super rendered — the record's own view decides which
     those are (CLAUDE.md: Super only ships the active view's rows) */
  function apply() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var needle = (state.q || "").trim().toLowerCase();
    var rows = rowsOf();
    rows.forEach(function (tr) {
      var hide = false;
      if (state.chain && chainOf(tr) !== state.chain) hide = true;
      if (state.vote && voteOf(tr) !== state.vote) hide = true;
      if (needle && tr.textContent.toLowerCase().indexOf(needle) < 0) hide = true;
      tr.hidden = hide;
    });
    if (state.sort) {
      var body = rows[0] && rows[0].parentNode;
      if (body) {
        rows.slice().sort(function (a, b) {
          if (state.sort === "oldest") return dateOf(a) - dateOf(b);
          if (state.sort === "chain") return chainOf(a).localeCompare(chainOf(b)) || dateOf(b) - dateOf(a);
          return dateOf(b) - dateOf(a);
        }).forEach(function (tr) { if (tr.parentNode === body) body.appendChild(tr); });
      }
    }
    // a group with nothing left in it goes with its rows
    Array.prototype.forEach.call(box.querySelectorAll(".notion-collection-group__section"), function (s2) {
      var any = Array.prototype.some.call(s2.querySelectorAll("tbody tr"), function (tr) { return !tr.hidden; });
      s2.hidden = !any;
    });
  }

  // the galleries the glyphs are read from are sources, not content
  function hideSources() {
    Array.prototype.forEach.call(document.querySelectorAll(".notion-collection"), function (c) {
      var box = c.closest("[id^=block-]");
      if (!box || box.id === TABLE) return;
      if (box.querySelector(".notion-collection-card")) box.setAttribute("data-enc-source", "");
    });
  }

  function build() { count(); rows(); head(); controls(); hideSources(); }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-rec__bar, .enc-rec__field"); })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();

/* ── the count band is one screen, and scrolling settles on it ──
   Design "Governance Record": the count band fills the viewport, so arriving at it half-shown
   reads as a mistake. Same rules as the Network Count panels (network.js) and the homepage decks,
   tuned on a trackpad — except that there is one stop rather than a deck of them, so this is the "one-screen
   section" case: a gesture heading towards the panel from within half a screen lands on it, and
   the page settles onto it when it comes to rest within a third of a screen. Nothing is paged once
   the panel is on screen; the reader scrolls out of it normally.
   Under 701px, and with reduced motion, nothing snaps. */
(function () {
  var BAND = "block-3dde800a513881b1b88dd0b73f874bfe";   // the count band
  var EPS = 2, QUIET = 180, NEW_GAP = 250, MIN_LOCK = 450;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  var cache = null;
  function panel() {
    if (cache !== null) return cache;
    // never cache a negative: the first call can land before governance.css has applied
    var box = document.getElementById(BAND);
    if (!box || window.innerWidth < 701) return false;
    var h = window.innerHeight;
    if (box.offsetHeight < h - 4) return false;
    return (cache = { stop: Math.round(docTop(box)), h: h });
  }
  function invalidate() { cache = null; }

  var anim = null, gestureUntil = 0;
  // the stop is re-measured at the moment of scrolling: the band's top moves as the page above it
  // settles (images, the banner, Super's own late renders), and a cached stop lands short
  function stopNow() {
    var box = document.getElementById(BAND);
    return box ? Math.round(docTop(box)) : null;
  }
  function scrollToY(target) {
    target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    if (Math.abs(target - window.scrollY) < 1) return;
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
    // a smooth scroll can land a pixel or two out, and the band is exactly one screen — so a
    // residue shows as a strip of the next section under it
    var exact = stopNow();
    if (exact != null && Math.abs(target - exact) < 6 && Math.abs(window.scrollY - exact) > 1) {
      window.scrollTo({ top: exact, behavior: "instant" });
    }
  }
  function arrived() { if (anim && Math.abs(window.scrollY - anim.target) <= 1) finish(); }

  // the panel is worth catching only while the reader is heading at it from outside
  function catches(d, y, dir, reach) {
    if (!d || Math.abs(y - d.stop) <= EPS) return false;
    return dir > 0 ? (y < d.stop && d.stop - y <= reach) : (y > d.stop && y - d.stop <= reach);
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
    var d = panel(), dir = e.deltaY > 0 ? 1 : -1;
    var y = anim ? anim.target : window.scrollY;
    if (!catches(d, y, dir, d ? d.h / 2 : 0)) { if (anim) e.preventDefault(); return; }
    e.preventDefault();
    locked = true; lockedAt = now; peak = abs; tailMin = Infinity; decayed = false;
    scrollToY(stopNow() != null ? stopNow() : d.stop);
  }, { passive: false });

  var touching = false, restTimer = 0, retry = 0, lastRest = window.scrollY;
  function settle() {
    if (anim || touching) return;
    if (performance.now() < gestureUntil) { clearTimeout(retry); retry = setTimeout(settle, QUIET + 20); return; }
    var d = panel(), y = window.scrollY;
    if (!d) return;
    var dir = y >= lastRest ? 1 : -1;
    lastRest = y;
    if (catches(d, y, dir, d.h / 3)) scrollToY(stopNow() != null ? stopNow() : d.stop);
  }

  var hasScrollEnd = "onscrollend" in window;
  if (hasScrollEnd) window.addEventListener("scrollend", function () { arrived(); setTimeout(settle, 30); });
  window.addEventListener("scroll", function () {
    if (!hasScrollEnd) { clearTimeout(restTimer); restTimer = setTimeout(function () { arrived(); settle(); }, 140); }
    arrived();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });
  window.addEventListener("resize", invalidate);
  new MutationObserver(invalidate).observe(document.body, { childList: true, subtree: true });
})();
