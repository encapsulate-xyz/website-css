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
      if ((at / 100) % 2) block.setAttribute("data-dim", "");
      for (var i = 0; i < n; i++) block.appendChild(el("span", "enc-rec__mark"));
      // the count reads as the homepage networks label — a pill that fades and rises on hover —
      // rather than the browser's own title tooltip (the user, 2026-09-17)
      var tip = el("span", "enc-rec__tip", n === 100 ? "100 votes" : n + " votes");
      tip.setAttribute("aria-hidden", "true");
      block.appendChild(tip);
      field.appendChild(block);
    }
    ps[4].after(field);
  }

  /* ── 2 · the rows ── */
  /* Which select column is the chain? It is learnt, not assumed: Super gives every property a
     stable class of its own (property-<hash>), so the column whose values match the chains we hold
     marks for is the chain column — and from then on every row uses that class, including chains
     with no mark. Guessing by "has a mark" put a chain with none into the outcome menu. */
  var chainProp = null;
  function learnChainProp(box) {
    if (chainProp) return chainProp;
    var marks = glyphs(), tally = {};
    Array.prototype.forEach.call(box.querySelectorAll("tbody tr td.select .notion-property"), function (p) {
      var cls = (p.className.match(/property-[0-9a-f]+/) || [])[0];
      var t = p.textContent.trim();
      if (!cls || !t) return;
      if (marks[key(t)]) tally[cls] = (tally[cls] || 0) + 1;
    });
    var best = null;
    Object.keys(tally).forEach(function (c) { if (!best || tally[c] > tally[best]) best = c; });
    chainProp = best;
    return best;
  }
  /* Which column is which, read off the header. Notion's type classes cannot answer it any more:
     Proposal Id became rich text on 2026-09-17 (it holds "ACP-176" now), so the id, the rationale
     and the proof are all td.text. The header carries the property's name, which is ours to know. */
  var COLUMN_KIND = {
    "proposal title": "proposal", "proposal": "proposal", "name": "proposal",
    "proposal id": "id", "id": "id", "reference": "id",
    "chain": "chain", "network": "chain",
    "vote option": "vote", "our vote": "vote", "vote": "vote",
    "voted on": "date", "date": "date",
    "voting proof": "proof", "proof": "proof",
    "rationale": "rationale", "why": "rationale"
  };
  var colKinds = null;
  function columns(box) {
    if (colKinds) return colKinds;
    var ths = box.querySelectorAll("thead th");
    if (!ths.length) return [];
    colKinds = Array.prototype.map.call(ths, function (th) {
      return COLUMN_KIND[th.textContent.trim().toLowerCase()] || "";
    });
    return colKinds;
  }

  function chainCell(tr) {
    if (!chainProp) return null;
    var p = tr.querySelector("td.select ." + chainProp);
    return p ? p.closest("td") : null;
  }

  function rows() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var marks = glyphs();
    if (!learnChainProp(box)) return;
    Array.prototype.forEach.call(box.querySelectorAll("tbody tr"), function (tr) {
      var cell = tr.querySelector("td.title");
      if (!cell || cell.querySelector(".enc-rec__mark-disc")) return;
      var chain = chainCell(tr);
      if (!chain) return;
      chain.setAttribute("data-enc-chain", "");
      // every cell says what it is, so the row's layout never depends on the column order:
      // the proof is the text cell that carries a link, the rationale is the other one
      chain.setAttribute("data-enc-cell", "chain");
      var kinds = columns(box);
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (td.hasAttribute("data-enc-cell")) return;
        if (kinds[i]) td.setAttribute("data-enc-cell", kinds[i]);
        else if (td.classList.contains("title")) td.setAttribute("data-enc-cell", "proposal");
        else if (td.classList.contains("date")) td.setAttribute("data-enc-cell", "date");
        else if (td.classList.contains("select")) td.setAttribute("data-enc-cell", "vote");
        else if (td.querySelector("a[href]")) td.setAttribute("data-enc-cell", "proof");
        else td.setAttribute("data-enc-cell", "rationale");
      });
      var name = chain.textContent.trim();
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
      // the design's meta line under the title: CHAIN · reference, in one span so it reads as one
      // line rather than as two columns (the reference cell itself is hidden by the CSS)
      var meta = el("span", "enc-rec__meta");
      meta.appendChild(el("span", "enc-rec__chain", name));
      var ref = tr.querySelector('[data-enc-cell="id"]');
      var refText = ref ? ref.textContent.trim() : "";
      if (refText) {
        meta.appendChild(el("span", "enc-rec__sep", "\u00B7"));
        meta.appendChild(el("span", "enc-rec__ref", refText));
      }
      cell.appendChild(meta);
      tr.setAttribute("data-enc-row", "");
    });
    // the header cell has no property class of its own, so it is found by position: the same
    // index as the chain cell in a row
    var first = box.querySelector("tbody tr");
    if (first) {
      var ths = box.querySelectorAll("thead th");
      Array.prototype.forEach.call(first.children, function (td, at) {
        var what = td.getAttribute("data-enc-cell");
        if (what && ths[at]) ths[at].setAttribute("data-enc-cell", what);
        if (what === "chain" && ths[at]) ths[at].setAttribute("data-enc-chain", "");
      });
    }
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
    // the design's trigger is the picked option's own glyph and its name — the mono label was in
    // an earlier pass of the handoff and is gone
    var value = el("span", "enc-rec__value", options[0][0] || "All");
    var lead = el("span", "enc-rec__lead");
    if (glyphFor) lead.appendChild(glyphFor(options[0][2]));
    trigger.setAttribute("aria-label", label);
    trigger.appendChild(lead);
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
        shown = PAGE;
        value.textContent = o[0];
        if (glyphFor) { lead.textContent = ""; lead.appendChild(glyphFor(o[2])); }
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
    bar.appendChild(menu("sort", "Sort", sortOpts, sortIcon));
    bar.appendChild(el("span", "enc-rec__rule"));

    var field = el("label", "enc-rec__find");
    var input = el("input");
    input.type = "text";
    input.placeholder = "Find a proposal";
    input.setAttribute("aria-label", "Find a proposal by number or title");
    field.appendChild(input);
    field.addEventListener("pointerdown", function () { setTimeout(function () { input.focus(); }, 0); });
    input.addEventListener("input", function () {
      state.q = input.value;
      shown = PAGE;
      field.toggleAttribute("data-enc-typed", !!input.value);
      apply();
    });
    var clear = el("button", "enc-rec__clear");
    clear.type = "button";
    clear.setAttribute("aria-label", "Clear the search");
    clear.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      input.value = ""; state.q = "";
      field.removeAttribute("data-enc-typed");
      apply();
    });
    field.appendChild(clear);
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
  // the handoff draws one icon per sort: lines long-to-short for the newest first, short-to-long
  // for the oldest, and an A-Z with an arrow for by chain
  function sortIcon(value) {
    var i = el("span", "enc-rec__sort-icon");
    i.setAttribute("data-sort", value || "recent");
    return i;
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

  /* ── the pager ── the design shows 25 and grows by 25, with the count line beside it ── */
  var PAGE = 25;
  var shown = PAGE;

  function total() {
    var band = document.getElementById(BAND);
    var ps = band ? band.querySelectorAll(":scope > .notion-callout__content > p.notion-text") : [];
    var n = ps.length > 1 ? parseInt((ps[1].textContent || "").replace(/[^\d]/g, ""), 10) : 0;
    return n || rowsOf().length;
  }

  function pager() {
    var box = document.getElementById(TABLE);
    if (!box || box.querySelector(".enc-rec__foot")) return;
    var foot = el("div", "enc-rec__foot");
    var more = el("button", "enc-rec__more");
    more.type = "button";
    more.addEventListener("pointerdown", function (e) {
      e.preventDefault(); shown += PAGE; apply();
    });
    foot.appendChild(more);
    foot.appendChild(el("span", "enc-rec__shown"));
    box.appendChild(foot);
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
    // then the pager: only the first `shown` of what matched stays on the page
    var matched = rows.filter(function (tr) { return !tr.hidden; });
    matched.forEach(function (tr, i) { if (i >= shown) tr.hidden = true; });
    var onShow = Math.min(shown, matched.length);
    var foot = box.querySelector(".enc-rec__foot");
    if (foot) {
      var left = matched.length - onShow;
      var more = foot.querySelector(".enc-rec__more");
      more.hidden = left <= 0;
      more.textContent = "Show " + Math.min(PAGE, left) + " more";
      var filtered = state.chain || state.vote || needle;
      foot.querySelector(".enc-rec__shown").textContent =
        onShow + " of " + (filtered ? matched.length + " matching" : fmt(total())) + " shown";
    }

    // a group with nothing left in it goes with its rows
    Array.prototype.forEach.call(box.querySelectorAll(".notion-collection-group__section"), function (s2) {
      var any = Array.prototype.some.call(s2.querySelectorAll("tbody tr"), function (tr) { return !tr.hidden; });
      s2.hidden = !any;
    });
  }

  // the galleries the glyphs are read from are sources, not content. Only on the record page:
  // this file is loaded from the site head, and marking every collection on every page set
  // data-enc-source on the homepage's own galleries too (harmless only because governance.css is
  // not loaded there — one page CSS away from hiding real content).
  function hideSources() {
    if (!document.getElementById(TABLE)) return;
    Array.prototype.forEach.call(document.querySelectorAll(".notion-collection"), function (c) {
      var box = c.closest("[id^=block-]");
      if (!box || box.id === TABLE) return;
      if (box.querySelector(".notion-collection-card")) box.setAttribute("data-enc-source", "");
    });
  }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /* The quadrant's fields (design "Governance Record Wow"): each card shows the number, then the
     question, its line and the word, in the view's own order. They are marked here so the CSS does
     not have to know Super's property hashes — and so a property added to the view later cannot
     silently take another one's styling. */
  var PILLARS = "block-10fb4619625b43cd82d572d6b806ead7";
  var FIELDS = ["title", "line", "word"];

  function pillars() {
    var box = document.getElementById(PILLARS);
    if (!box) return;
    box.querySelectorAll(".notion-collection-card").forEach(function (card) {
      var texts = card.querySelectorAll(".notion-property__text");
      Array.prototype.forEach.call(texts, function (t, i) {
        if (FIELDS[i] && t.getAttribute("data-enc-pillar") !== FIELDS[i]) {
          t.setAttribute("data-enc-pillar", FIELDS[i]);
        }
      });
    });
  }

  function build() { count(); rows(); head(); controls(); pager(); apply(); hideSources(); pillars(); }

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
   The same rules as the homepage's one-screen sections (home.js: Who we are, Services) and the
   Network Count panels, ported rather than re-invented:

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
  var BAND = "block-3dde800a513881b1b88dd0b73f874bfe";   // the count band
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
