/* /governance-record — design "Governance Record". Linked from the SITE head, because Super never
   executes a page's own script on a client-side navigation.

   The page is the homepage's 37h given the whole record: an ink count band, the pillars band, the
   controls, and the rows. This file does the three things CSS cannot:

     1. the count band's field — one 7px mark per vote, in blocks of a hundred, drawn from the
        figure in the band's own Notion text (the number stays Notion's; only the marks are ours);
     2. each row's chain — copied from its Network cell onto the line as a tinted disc and the
        CHAIN · reference line under the title, one stable tint per chain — and the line's two
        targets (the record, handoff 2026-09-26): the left opens the rationale, the right is the
        Proof link;
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

  /* ── 2 · the rows ──
     Two tables are views of the Governance Record database — the record here, and the homepage's
     37h table with its six latest votes — and since 2026-09-26 both are built here and drawn by
     main.css §13d, so the two cannot drift. `limit` is how many rows the page shows (home.css hides
     the rest); only those are built, or the homepage would fetch a glyph for every hidden vote. */
  var HOME_TABLE = "block-4529386b39be4a9aa44d2dbac56537bd";
  var ROW_TABLES = [[TABLE, 0], [HOME_TABLE, 6]];

  /* Which column is which, read off the header. Notion's type classes cannot answer it any more:
     Proposal Id became rich text on 2026-09-17 (it holds "ACP-176" now), so the id, the rationale
     and the proof are all td.text. The header carries the property's name, which is ours to know. */
  var COLUMN_KIND = {
    "proposal title": "proposal", "proposal": "proposal", "name": "proposal",
    "proposal id": "id", "id": "id", "reference": "id",
    "chain": "chain", "network": "chain",
    "vote option": "vote", "our vote": "vote", "vote": "vote",
    "voted on": "date", "recorded": "date", "date": "date",
    "voting proof": "proof", "proof": "proof",
    "rationale": "rationale", "why": "rationale"
  };
  function columns(box) {
    return Array.prototype.map.call(box.querySelectorAll("thead th"), function (th) {
      return COLUMN_KIND[th.textContent.trim().toLowerCase()] || "";
    });
  }

  /* A header the map does not know (a property renamed in Notion) still leaves the chain findable:
     Super gives every property a stable class of its own (property-<hash>), so the select column
     whose values match the chains we hold marks for is the chain column. */
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
  function chainCell(tr, box) {
    var c = tr.querySelector('td[data-enc-cell="chain"]');
    if (c) return c;
    var prop = learnChainProp(box);
    var p = prop && tr.querySelector("td.select ." + prop);
    return p ? p.closest("td") : null;
  }

  var whyId = 0;
  function setOpen(tr, on) {
    if (on) tr.setAttribute("data-enc-open", ""); else tr.removeAttribute("data-enc-open");
    var b = tr.querySelector(".enc-rec__open");
    if (!b) return;
    b.setAttribute("aria-expanded", on ? "true" : "false");
    b.setAttribute("aria-label", (on ? "Hide" : "Read") + " the rationale for " + b.getAttribute("data-title"));
  }
  // one row open at a time, in its own table
  function toggle(tr) {
    var was = tr.hasAttribute("data-enc-open");
    var box = tr.closest("[data-enc-rows]");
    if (box) Array.prototype.forEach.call(box.querySelectorAll("tr[data-enc-open]"), function (o) { setOpen(o, false); });
    if (!was) setOpen(tr, true);
  }

  // the chain's disc; the glyph goes in as soon as the page has one (a gallery can render late)
  /* a glyph for a 30px disc or a 22px mark: Super's optimizer at 96px (646 bytes for Terra against
     the 21.8KB original the homepage's discs loaded since v304; sharp at 3x) */
  function small(url) {
    if (!/^https:\/\/assets\.super\.so\//.test(url)) return url;
    return "/_next/image?url=" + encodeURIComponent(url) + "&w=96&q=75";
  }
  function fillDisc(disc, name) {
    if (disc.querySelector("img")) return true;
    var url = glyphs()[key(name)];
    if (!url) return false;
    var img = el("img");
    img.src = small(url); img.alt = ""; img.loading = "lazy";
    disc.appendChild(img);
    return true;
  }

  var bare = false;       // a disc still waiting for its glyph after this pass
  function rows() {
    bare = false;
    ROW_TABLES.forEach(function (t) {
      var box = document.getElementById(t[0]);
      if (box && box.querySelector("tbody tr")) buildRows(box, t[1]);
    });
  }

  function buildRows(box, limit) {
    var kinds = columns(box);
    var trs = Array.prototype.slice.call(box.querySelectorAll("tbody tr"));
    if (limit) trs = trs.slice(0, limit);
    trs.forEach(function (tr) {
      var cell = tr.querySelector("td.title");
      if (!cell) return;
      var built = cell.querySelector(".enc-rec__mark-disc");
      if (built) {
        if (!fillDisc(built, built.getAttribute("data-chain") || "")) bare = true;
        return;
      }
      // every cell says what it is, so the row's layout never depends on the column order
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (td.hasAttribute("data-enc-cell")) return;
        if (kinds[i]) td.setAttribute("data-enc-cell", kinds[i]);
      });
      var chain = chainCell(tr, box);
      if (!chain) return;
      chain.setAttribute("data-enc-chain", "");
      chain.setAttribute("data-enc-cell", "chain");
      // the proof is the text cell that carries a link, the rationale is the other one
      Array.prototype.forEach.call(tr.children, function (td) {
        if (td.hasAttribute("data-enc-cell")) return;
        if (td.classList.contains("title")) td.setAttribute("data-enc-cell", "proposal");
        else if (td.classList.contains("date")) td.setAttribute("data-enc-cell", "date");
        else if (td.classList.contains("select")) td.setAttribute("data-enc-cell", "vote");
        else if (td.querySelector("a[href]")) td.setAttribute("data-enc-cell", "proof");
        else td.setAttribute("data-enc-cell", "rationale");
      });
      var name = chain.textContent.trim();
      if (!name) return;
      var disc = el("span", "enc-rec__mark-disc");
      disc.style.background = tintFor(name.toLowerCase());
      disc.setAttribute("data-chain", name);
      if (!fillDisc(disc, name)) bare = true;
      cell.insertBefore(disc, cell.firstChild);
      // the file's line under the title: CHAIN · reference, as one line (the reference cell itself
      // is hidden by the CSS)
      var meta = el("span", "enc-rec__meta");
      meta.appendChild(el("span", "enc-rec__chain", name));
      var ref = tr.querySelector('[data-enc-cell="id"]');
      var refText = ref ? ref.textContent.trim() : "";
      if (refText) {
        meta.appendChild(el("span", "enc-rec__sep", " · "));
        meta.appendChild(el("span", "enc-rec__ref", refText));
      }
      cell.appendChild(meta);

      // the vote, by its word: Notion's option colours are not the file's dots (No is pink there)
      var vote = tr.querySelector('td[data-enc-cell="vote"]');
      var said = vote ? vote.textContent.trim() : "";
      if (vote && said) vote.setAttribute("data-vote", said.toLowerCase().replace(/\s+/g, "-"));

      // the date as the file prints it, "Sep 11, 2026"; the day itself is kept for the sort
      var day = tr.querySelector("td.date .date") || tr.querySelector("td.date");
      if (day) {
        var full = day.textContent.trim();
        var t = Date.parse(full);
        if (!isNaN(t)) tr.setAttribute("data-enc-t", String(t));
        var short = full.replace(/^([A-Z][a-z]{2})[a-z]+(?=\s)/, "$1");
        if (short !== full) day.textContent = short;
      }

      /* The line is two targets (the file's record): the left opens the rationale beneath it, the
         right is the Proof link. Notion has no block that opens and closes, so the left is a
         button laid over the mark, the title and CHAIN · reference; its label is the row's title.
         A view that does not show Rationale gets neither the button nor the ±. */
      var title = (cell.querySelector(".notion-property__title") || {}).textContent || "";
      title = title.trim() || "this proposal";
      var why = tr.querySelector('td[data-enc-cell="rationale"]');
      if (why) {
        var plus = el("span", "enc-rec__plus");
        plus.setAttribute("aria-hidden", "true");
        plus.innerHTML = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 10h10"/><path class="v" d="M10 5v10"/></svg>';
        cell.appendChild(plus);
        why.id = why.id || "enc-why-" + (++whyId);
        var open = el("button", "enc-rec__open");
        open.type = "button";
        open.setAttribute("aria-expanded", "false");
        open.setAttribute("aria-controls", why.id);
        open.setAttribute("data-title", title);
        open.setAttribute("aria-label", "Read the rationale for " + title);
        open.addEventListener("click", function () { toggle(tr); });
        cell.appendChild(open);
      }
      var proof = tr.querySelector('td[data-enc-cell="proof"] a[href]');
      if (proof) {
        var word = said ? said.charAt(0).toUpperCase() + said.slice(1).toLowerCase() : "";
        proof.setAttribute("aria-label", title.replace(/^this proposal$/, "Proposal") +
          (word ? " — voted " + word : "") + ", opens on the block explorer");
      }
      tr.setAttribute("data-enc-row", "");
    });
    // the header cells take the same marks, by position
    var ths = box.querySelectorAll("thead th");
    Array.prototype.forEach.call(ths, function (th, at) {
      if (kinds[at]) th.setAttribute("data-enc-cell", kinds[at]);
    });
    var first = box.querySelector("tbody tr[data-enc-row]");
    if (first) {
      Array.prototype.forEach.call(first.children, function (td, at) {
        var what = td.getAttribute("data-enc-cell");
        if (what && ths[at]) ths[at].setAttribute("data-enc-cell", what);
        if (what === "chain" && ths[at]) ths[at].setAttribute("data-enc-chain", "");
      });
    }
    if (!box.hasAttribute("data-enc-rows")) box.setAttribute("data-enc-rows", "");
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
    var kept = tr.getAttribute("data-enc-t");
    if (kept) return +kept;
    var d = tr.querySelector("td.date");
    var t = d ? Date.parse(d.textContent.trim()) : NaN;
    return isNaN(t) ? 0 : t;
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
    /* the design's command field (Filter Bar Patterns, G): the search first — a chain or a vote typed
       and Enter becomes a token — then Chain, Vote and the sort as cells at the right. The options
       and their counts are the rows' own, as before; so is the filtering (apply). */
    if (typeof window.encFilterBar !== "function") return;
    var toOpts = function (list) { return list.map(function (o) { return [o[2], o[0], o[1]]; }); };
    var rest = function () { var r = el("span", "enc-fb__rest"); return r; };
    var bar = window.encFilterBar({
      placeholder: "Find a proposal, or type a chain",
      facets: [
        { id: "chain", label: "Chain", options: function () { return toOpts(chainOpts); }, mark: glyphFor, rest: rest },
        { id: "vote", label: "Vote", options: function () { return toOpts(voteOpts); }, mark: dotFor, rest: rest }
      ],
      sorts: function () { return [["", "Recent votes", "desc"], ["oldest", "Oldest first", "asc"], ["chain", "By chain", "az"]]; },
      state: { q: "", sort: "", f: { chain: "", vote: "" } },
      onChange: function (st) {
        state.chain = st.f.chain || ""; state.vote = st.f.vote || "";
        state.sort = st.sort || ""; state.q = st.q || "";
        shown = PAGE;
        apply();
      }
    });
    bar.el.classList.add("enc-rec__bar");

    var header = box.querySelector(".notion-collection__header-wrapper");
    if (header) header.setAttribute("data-enc-source", "");
    box.insertBefore(bar.el, box.firstChild);
  }

  // a chain's glyph, when a view of the Networks set is on the page; otherwise its tinted disc
  function glyphFor(chain) {
    var disc = el("span", "enc-rec__disc");
    if (!chain) { disc.setAttribute("data-empty", ""); return disc; }
    disc.style.background = tintFor(chain.toLowerCase());
    var url = glyphs()[key(chain)];
    if (url) {
      var img = el("img");
      img.src = small(url); img.alt = "";
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
  var glyphCache = null, glyphCards = -1;
  function glyphs() {
    // read again whenever the page holds more cards than last time: a gallery can render after
    // the table, and an early empty read would otherwise stand for the whole visit
    var cards = document.querySelectorAll(".notion-collection-card").length;
    if (glyphCache && cards === glyphCards) return glyphCache;
    glyphCards = cards;
    var out = {};
    if (typeof window.encGlyphs === "function") {
      try { var fb = window.encGlyphs(); for (var k in fb) out[k] = fb[k]; } catch (e) {}
    }
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

  /* ── the pager ── the file shows ten and grows by ten, with the count line beside it (it was 25
     until the record handoff of 2026-09-26) ── */
  var PAGE = 10;
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
  var resorted = false;
  function apply() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var needle = (state.q || "").trim().toLowerCase();
    var rows = rowsOf();
    rows.forEach(function (tr) {
      // a row with no chain is never built (three blank rows in the database): it is not a vote to
      // show — "By chain" put the three at the top of the record (audit, 2026-09-26)
      var hide = !tr.hasAttribute("data-enc-row");
      if (state.chain && chainOf(tr) !== state.chain) hide = true;
      if (state.vote && voteOf(tr) !== state.vote) hide = true;
      if (needle && tr.textContent.toLowerCase().indexOf(needle) < 0) hide = true;
      tr.hidden = hide;
    });
    // once reordered, "Recent votes" (the default, "") has to reorder too, or the rows stay as they
    // were left
    if (state.sort || resorted) {
      resorted = true;
      var body = rows[0] && rows[0].parentNode;
      if (body) {
        var sorted = rows.slice().sort(function (a, b) {
          // a row with no Recorded date is not the oldest vote: it goes last in either order
          if (state.sort !== "chain" && !dateOf(a) !== !dateOf(b)) return dateOf(a) ? -1 : 1;
          if (state.sort === "oldest") return dateOf(a) - dateOf(b);
          if (state.sort === "chain") return chainOf(a).localeCompare(chainOf(b)) || dateOf(b) - dateOf(a);
          return dateOf(b) - dateOf(a);
        });
        /* rows are moved only when the order is not already right: every move is a mutation, and
           this file's own observer rebuilt on it — 8 passes a second, for as long as the page was
           open. The pager then counts in the new order (it counted in the old one, which only the
           next pass of that loop put right). */
        if (sorted.some(function (tr, i) { return tr !== rows[i]; })) {
          sorted.forEach(function (tr) { if (tr.parentNode === body) body.appendChild(tr); });
        }
        rows = sorted;
      }
    }
    // then the pager: only the first `shown` of what matched stays on the page
    var matched = rows.filter(function (tr) { return !tr.hidden; });
    matched.forEach(function (tr, i) { if (i >= shown) tr.hidden = true; });
    var onShow = Math.min(shown, matched.length);
    // nothing matches: Notion's own line after the table says so, in place of the header and foot
    if (rows.length && !matched.length) box.setAttribute("data-enc-empty", "");
    else box.removeAttribute("data-enc-empty");
    var foot = box.querySelector(".enc-rec__foot");
    if (foot) {
      var left = matched.length - onShow;
      var more = foot.querySelector(".enc-rec__more");
      more.hidden = left <= 0;
      var filtered = state.chain || state.vote || needle;
      // written only when it changes: a text write is a mutation, and the observer rebuilt on it
      // for as long as the page was open (48 writes in 3s, measured on the live page)
      setText(more, "Show " + Math.min(PAGE, left) + " more");
      setText(foot.querySelector(".enc-rec__shown"),
        onShow + " of " + (filtered ? matched.length + " matching" : fmt(total())) + " shown");
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

  function setText(node, text) { if (node && node.textContent !== text) node.textContent = text; }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /* The quadrant's fields (design "Governance Record Wow"): each card shows the number, then the
     question, its line and the word, in the view's own order. They are marked here so the CSS does
     not have to know Super's property hashes — and so a property added to the view later cannot
     silently take another one's styling. */
  var PILLARS = "block-10fb4619625b43cd82d572d6b806ead7";
  // the view renders the Word property first, then the question, then its line
  var FIELDS = ["word", "title", "line"];

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

  var tries = 0;
  function build() {
    count(); rows(); head(); controls(); pager(); apply(); hideSources(); pillars();
    // the glyphs come from galleries that can render after the table, and after Super has stopped
    // mutating, so nothing would wake the observer again (home.js did the same for 37h)
    if (bare && tries++ < 12) { clearTimeout(t); t = setTimeout(build, 300); }
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-rec__bar, .enc-rec__field"); })) return;
    clearTimeout(t); tries = 0; t = setTimeout(build, 120);
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
    /* under 900px the band grows past a screen when its field needs more rows (governance.css).
       Snapping onto it would pull the reader back to its top before the field was seen, so it
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
