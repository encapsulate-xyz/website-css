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
    return {
      title: title ? title.textContent.trim() : "",
      date: date ? date.textContent.trim() : "",
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
  var state = { tag: "", q: "", shown: PAGE };

  function icon(paths, w) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", w); svg.setAttribute("height", w);
    svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7"); svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true");
    paths.forEach(function (d) {
      var n = document.createElementNS(ns, d[0]);
      Object.keys(d[1]).forEach(function (k) { n.setAttribute(k, d[1][k]); });
      svg.appendChild(n);
    });
    return svg;
  }

  function tab(label, count, value, dot) {
    var b = el("button", "enc-index__tab");
    b.type = "button";
    b.setAttribute("data-enc-tag", value);
    if (dot) b.appendChild(el("span", "enc-index__dot"));
    b.appendChild(el("span", "enc-index__tab-label", label));
    b.appendChild(el("span", "enc-index__tab-count", String(count)));
    b.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      state.tag = state.tag === value ? "" : value;
      state.shown = PAGE;
      apply();
    });
    return b;
  }

  function controls(collection, posts) {
    var bar = collection.querySelector(":scope > .enc-index__bar");
    if (bar) return bar;
    bar = el("div", "enc-index__bar");

    var tags = [];
    posts.forEach(function (p) { if (p.tag && tags.indexOf(p.tag) < 0) tags.push(p.tag); });
    tags.sort();
    bar.appendChild(tab("All posts", posts.length, "", false));
    tags.forEach(function (t) {
      bar.appendChild(tab(t, posts.filter(function (p) { return p.tag === t; }).length, t, true));
    });
    bar.appendChild(el("span", "enc-index__gap"));
    bar.appendChild(el("span", "enc-index__rule"));

    var field = el("label", "enc-index__field");
    field.htmlFor = "enc-blog-q";
    var mag = el("span", "enc-index__mag");
    mag.appendChild(icon([["circle", { cx: 7, cy: 7, r: 4.6 }],
                          ["path", { d: "M10.4 10.4 14 14" }]], 15));
    field.appendChild(mag);
    var input = el("input", "enc-index__input");
    input.type = "text"; input.id = "enc-blog-q";
    input.placeholder = "Find a post";
    input.setAttribute("aria-label", "Find a post");
    input.addEventListener("input", function () {
      state.q = input.value; state.shown = PAGE; apply();
    });
    field.appendChild(input);
    // Super cancels pointer events on the document to close its own dropdown, so focus on
    // pointerdown in a timeout — the same rule as /networks (CLAUDE.md)
    field.addEventListener("pointerdown", function () { setTimeout(function () { input.focus(); }, 0); });
    var clear = el("button", "enc-index__clear");
    clear.type = "button";
    clear.setAttribute("aria-label", "Clear the search");
    clear.appendChild(icon([["path", { d: "M4 4l8 8" }], ["path", { d: "M12 4l-8 8" }]], 11));
    clear.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      input.value = ""; state.q = ""; state.shown = PAGE; apply();
    });
    field.appendChild(clear);
    bar.appendChild(field);

    collection.insertBefore(bar, collection.firstChild);
    return bar;
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
    var shown = matching.slice(0, state.shown);
    var layout = spans(shown.length);
    cards.forEach(function (card) { card.hidden = shown.indexOf(card) < 0; });
    shown.forEach(function (card, i) {
      var s = layout[i] || [2, 1];
      card.style.gridColumn = "span " + s[0];
      card.style.gridRow = s[1] > 1 ? "span " + s[1] : "";
      card.toggleAttribute("data-enc-tall", s[1] > 1);
    });

    var collection = gallery.closest(".notion-collection") || gallery.parentElement;
    var bar = collection.querySelector(":scope > .enc-index__bar");
    if (bar) {
      Array.prototype.forEach.call(bar.querySelectorAll(".enc-index__tab"), function (b) {
        var on = b.getAttribute("data-enc-tag") === state.tag;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.toggleAttribute("data-enc-on", on);
      });
      var field = bar.querySelector(".enc-index__field");
      if (field) field.toggleAttribute("data-enc-typed", !!state.q);
    }
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
