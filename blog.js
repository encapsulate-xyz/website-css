/* /blog — design "Blog Index Layouts", block J "An alternating rhythm". Linked from the SITE head,
   because Super never executes a page's own script on a client-side navigation.

   The index states its rhythm once and then settles: a row of three whose first card is merged into
   one spanning two columns and two rows, then a pair at half width, then rows of three for as long
   as the archive runs. A remainder of one or two becomes an equal row at its own width rather than
   being squeezed into a trio's proportions, so any number of posts fills correctly.

   Above the index sits the design's filter bar — an ink bar of tag tabs, each with its count, and
   a search field — and below it the pager: fourteen posts to start, nine more per press, with the
   count line beside it. Both are controls, not copy, which is the exception CLAUDE.md allows (a
   Notion block is neither an input nor a menu, and Super ships no filter of its own).

   Each card is the Blog Highlights construction, built inside Super's own card so the link, the
   hover and the ordering stay Notion's: an ink cover with the post's Cover glyph masked into one of
   the five pastels, the category in that same pastel and the date beside it, the title, and the
   wordmark at the foot (a card too narrow for the wordmark's 120px minimum carries the mark
   instead). Everything it prints — title, category, date, link, glyph — is read off the card Super
   rendered; this file writes no copy. Styles: blog.css, "THE INDEX". */
(function () {
  var GALLERY = "block-a148eb7f8ea94b95b7725809fef9e0dc";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var COLS = 6;                     // 6 tracks so a row of two and a row of three share a grid

  var script = document.currentScript;
  var BASE = script && /\/dist\/blog\.js/.test(script.src)
    ? script.src.replace(/\/dist\/blog\.js.*$/, "/") : null;
  var WORDMARK = BASE ? BASE + "svg/wordmark-reversed.svg" : null;
  var MARK = BASE ? BASE + "svg/mark-reversed.svg" : null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function read(card) {
    var title = card.querySelector(".notion-property__title");
    var date = card.querySelector(".notion-property__date");
    var cover = card.querySelector("img.notion-collection-card__cover");
    var pills = Array.prototype.map.call(
      card.querySelectorAll(".notion-property__select .notion-pill"),
      function (p) { return p.textContent.trim(); });
    // the category is the post's first tag other than "Informative" — the same rule the homepage
    // rail uses, so a post is filed the same way in both places
    var tag = pills.filter(function (n) { return !/^informative$/i.test(n); })[0] || pills[0] || "";
    // the Read property (minutes, 2026-09-26), once the view shows it: the sort's "Shortest read"
    var mins = card.querySelector(".notion-property__number");
    var read = mins ? parseInt(mins.textContent.replace(/[^\d]/g, ""), 10) : NaN;
    return {
      title: title ? title.textContent.trim() : "",
      date: date ? date.textContent.trim() : "",
      time: date ? (Date.parse(date.textContent.trim()) || 0) : 0,
      read: isNaN(read) ? null : read,
      tag: tag,
      glyph: cover ? cover.getAttribute("src") : null
    };
  }

  function cover(post, tint) {
    var box = el("span", "enc-post__cover");
    var glyph = el("span", "enc-post__glyph");
    glyph.style.background = tint;
    if (post.glyph) {
      var url = 'url("' + post.glyph.replace(/"/g, "%22") + '")';
      glyph.style.webkitMaskImage = url;
      glyph.style.maskImage = url;
    } else {
      glyph.style.borderRadius = "999px";
      glyph.style.opacity = "0.5";
    }
    box.appendChild(glyph);

    var body = el("span", "enc-post__body");
    var top = el("span", "enc-post__top");
    var cat = el("span", "enc-post__cat", post.tag);
    cat.style.color = tint;                 // category and glyph are the same value, per the design
    top.appendChild(cat);
    top.appendChild(el("span", "enc-post__date", post.date));
    body.appendChild(top);
    body.appendChild(el("span", "enc-post__title", post.title));

    var foot = el("span", "enc-post__foot");
    if (WORDMARK) {
      var w = el("img", "enc-post__wordmark");
      w.src = WORDMARK; w.alt = "Encapsulate"; w.loading = "lazy";
      foot.appendChild(w);
    }
    if (MARK) {
      // the reversed mark as it is drawn in the kit — green disc, paper clip. It is an <img>, not a
      // mask: a mask keeps only alpha and flattened it to one colour (the user, 2026-09-17).
      var m = el("img", "enc-post__mark");
      m.src = MARK; m.alt = "Encapsulate"; m.loading = "lazy";
      foot.appendChild(m);
    }
    body.appendChild(foot);
    box.appendChild(body);
    return box;
  }

  /* The bands, as the design generates them: merged three, a pair, then threes, with whatever is
     left over made into an equal row of its own width. Returns [span, rowSpan] per card. */
  function spans(n) {
    var out = [], i;
    if (n >= 3) {
      out.push([4, 2], [2, 1], [2, 1]);      // the merged row
      i = 3;
    } else {
      for (i = 0; i < n; i++) out.push([COLS / n, 1]);
      return out;
    }
    if (n - i >= 2) { out.push([3, 1], [3, 1]); i += 2; }   // the pair
    else if (n - i === 1) { out.push([2, 1]); return out; }  // one left: a third, and the gap stays
    while (n - i >= 3) { out.push([2, 1], [2, 1], [2, 1]); i += 3; }
    // whatever is left keeps a third's width and leaves the gap — a last card must never stretch
    // across the index (the user, 2026-09-17)
    for (var r = n - i; r > 0; r--) out.push([2, 1]);
    return out;
  }

  /* ── the filter bar and the pager ── */
  var PAGE = 14, STEP = 9;                 // the design's production figures
  var state = { tag: "", q: "", sort: "", shown: PAGE };
  var bar = null;

  /* the design's command field (Filter Bar Patterns, G), on ink: the search — a tag typed and Enter
     becomes a token — then the Tag cell (the tags the index carries, with their counts, as the tabs
     had them) and the sort. The filtering is this file's, as before. */
  function controls(collection, posts) {
    var have = collection.querySelector(":scope > .enc-index__bar");
    if (have) return have;
    if (typeof window.encFilterBar !== "function") return null;
    var tags = [];
    posts.forEach(function (p) { if (p.tag && tags.indexOf(p.tag) < 0) tags.push(p.tag); });
    tags.sort();
    var square = function () { return el("span", "enc-index__mark"); };
    bar = window.encFilterBar({
      ink: true,
      placeholder: "Find a post, or type a tag",
      facets: [{
        id: "tag", label: "Tag",
        options: function () {
          return [["", "All posts", posts.length]].concat(tags.map(function (t) {
            return [t, t, posts.filter(function (p) { return p.tag === t; }).length];
          }));
        },
        mark: square,
        rest: function () { return el("span", "enc-fb__rest"); }
      }],
      // "Shortest read" once the cards carry the Read property (it has to be shown on the view)
      sorts: function () {
        var list = [["", "Newest first", "desc"], ["oldest", "Oldest first", "asc"]];
        if (posts.some(function (p) { return p.read != null; })) list.push(["read", "Shortest read", "desc"]);
        return list;
      },
      state: { q: "", sort: "", f: { tag: "" } },
      onChange: function (st) {
        state.tag = st.f.tag || ""; state.q = st.q || ""; state.sort = st.sort || "";
        state.shown = PAGE;
        apply();
      }
    });
    bar.el.classList.add("enc-index__bar");
    collection.insertBefore(bar.el, collection.firstChild);
    return bar.el;
  }

  function pager(collection) {
    var foot = collection.querySelector(":scope > .enc-index__foot");
    if (foot) return foot;
    foot = el("div", "enc-index__foot");
    var more = el("button", "enc-index__more");
    more.type = "button";
    more.addEventListener("pointerdown", function (e) {
      e.preventDefault(); state.shown += STEP; apply();
    });
    foot.appendChild(more);
    foot.appendChild(el("span", "enc-index__count"));
    collection.appendChild(foot);
    return foot;
  }

  /* Filter, cap, then lay out: the spans are computed over the cards actually on show, so the
     rhythm restates itself for any filter. */
  function apply() {
    var gallery = document.getElementById(GALLERY);
    if (!gallery) return;
    var cards = Array.prototype.slice.call(gallery.querySelectorAll(".notion-collection-card"));
    if (!cards.length) return;
    var q = state.q.trim().toLowerCase();
    var matching = cards.filter(function (card) {
      var p = card.enc || read(card);
      if (state.tag && p.tag !== state.tag) return false;
      if (q && p.title.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (state.sort) {
      var pos = function (card) { return cards.indexOf(card); };
      matching.sort(function (a, b) {
        var x = a.enc || read(a), y = b.enc || read(b);
        if (state.sort === "oldest") return (x.time - y.time) || (pos(b) - pos(a));
        if (state.sort === "read") {
          if (x.read == null && y.read == null) return pos(a) - pos(b);
          if (x.read == null) return 1;
          if (y.read == null) return -1;
          return (x.read - y.read) || (pos(a) - pos(b));
        }
        return pos(a) - pos(b);
      });
    }
    var shown = matching.slice(0, state.shown);
    var layout = spans(shown.length);
    cards.forEach(function (card) { card.hidden = shown.indexOf(card) < 0; });
    shown.forEach(function (card, i) {
      card.style.order = state.sort ? String(i) : "";   // the grid follows the sort
      var s = layout[i] || [2, 1];
      card.style.gridColumn = "span " + s[0];
      card.style.gridRow = s[1] > 1 ? "span " + s[1] : "";
      card.toggleAttribute("data-enc-tall", s[1] > 1);
    });
    // 701–900 is two columns with the lead across both: an odd number of the rest leaves the last
    // one alone in its row, so it is marked to take the row (blog.css; audit 2026-09-26)
    var singles = shown.filter(function (c) { return !c.hasAttribute("data-enc-tall"); });
    shown.forEach(function (c) {
      c.toggleAttribute("data-enc-fill", singles.length % 2 === 1 && c === singles[singles.length - 1]);
    });

    var collection = gallery.closest(".notion-collection") || gallery.parentElement;
    if (bar) bar.sync();
    var foot = collection.querySelector(":scope > .enc-index__foot");
    if (foot) {
      var left = matching.length - shown.length;
      var more = foot.querySelector(".enc-index__more");
      more.hidden = left <= 0;
      more.textContent = "Show " + Math.min(STEP, left) + " more";
      foot.querySelector(".enc-index__count").textContent =
        shown.length + " of " + matching.length +
        ((state.tag || state.q) ? " matching" : "") + " shown";
    }
  }

  function build() {
    var gallery = document.getElementById(GALLERY);
    if (!gallery) return;
    if (typeof window.encFilterBar !== "function") return;   // filterbar.js, before this in the head
    var cards = Array.prototype.slice.call(gallery.querySelectorAll(".notion-collection-card"));
    if (!cards.length) return;
    var sig = cards.length + "/" + (cards[0].textContent || "").slice(0, 40);
    if (gallery.getAttribute("data-enc-sig") === sig) return;
    gallery.setAttribute("data-enc-sig", sig);

    var posts = cards.map(function (card, i) {
      var post = read(card);
      card.enc = post;
      var tint = TINTS[i % TINTS.length];
      var built = card.querySelector(":scope > .enc-post__cover");
      if (built) built.remove();
      card.insertBefore(cover(post, tint), card.firstChild);
      card.setAttribute("data-enc-post", "");
      return post;
    });
    var collection = gallery.closest(".notion-collection") || gallery.parentElement;
    controls(collection, posts);
    pager(collection);
    apply();
    gallery.setAttribute("data-enc-index", "");
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-post__cover"); })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();

/* the post pages read their words from a toggle on this page; it is data, so it is marked here
   and hidden by blog.css rather than left to read as a section (2026-09-21) */
(function () {
  function mark() {
    if (!/^\/blog\/?$/.test(location.pathname)) return;
    Array.prototype.forEach.call(document.querySelectorAll(".notion-toggle"), function (t) {
      var s = t.querySelector(".notion-toggle__summary");
      if (s && /post page copy/i.test((s.textContent || "").trim())) {
        t.setAttribute("data-enc-copy", "");
      }
    });
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(mark, 120); })
    .observe(document.body, { childList: true, subtree: true });
  mark();
})();
