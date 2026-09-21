/* /blog/<post> — design "Blog Post Page" (variant J, the type cover).

   Every post in the Blogs database is the same shape in Notion: a two-column block whose first
   column is a table of contents and whose second is the post — a banner image, the byline, the
   title, then the body — followed by "More Blog Posts", its collection, and the newsletter.

   This script re-reads that into the design: an ink head carrying the meta, the title and the
   lede over the chain's mark, then a paper body with the reading rail (progress, contents, the
   ask) beside the article, the byline at its foot, and the next post beside the ask.

   Nothing here writes copy into the post: the title, the lede, every heading, the body, the
   byline and the next post are the Notion blocks Super already rendered. Two things are not in
   the post and cannot be — the tag, the date and the chain's mark (they are database properties,
   which Super does not render on an item page) and the rail's standing ask. The first are read
   from the blog index, which does render them; the second is CONTENT below, the same exception
   already made for the footer's CTA and the booking drawer's words.

   Loaded from the SITE head: Super does not run a page's own scripts on a client-side
   navigation, so this builds off a MutationObserver like the other page scripts. */
(function () {
  var PATH = /^\/blog\/.+/;
  var VERSION = "1";

  /* the rail's ask — site furniture repeated on every post, with no block of its own in Notion */
  var CONTENT = {
    askTitle: "Launching a chain?",
    askSub: "We join at testnet and stay.",
    askBtn: "Book a call",
    call: "https://cal.com/aditya-encapsulate/30min",
    footTitle: "Running a chain we should know about?",
    footSub: "Tell us what it takes to run it. If we would run it, we will say so in a week.",
    footAll: "All posts",
    index: "/blog",
    reading: "Reading",
    next: "Next",
    writtenBy: "Written by"
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function textOf(n) { return ((n && n.textContent) || "").replace(/\s+/g, " ").trim(); }
  function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /* Super serves an image through its own optimiser; the original is what the design draws */
  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }

  /* ── the facts the post page does not carry ───────────────────────────────────────────────
     The tag, the date and the chain's mark are database properties. Super renders them on the
     index and not on the post, so the index is where they are read from — one fetch, cached,
     and the page is built without them if it fails. */
  var indexOnce = null;
  function fromIndex() {
    if (indexOnce) return indexOnce;
    indexOnce = fetch(CONTENT.index, { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var here = location.pathname.replace(/\/$/, "");
        var cards = Array.prototype.slice.call(doc.querySelectorAll(".notion-collection-card"));
        var mine = null, idx = -1;
        cards.forEach(function (c, i) {
          var a = c.querySelector("a[href]");
          if (a && a.getAttribute("href").replace(/\/$/, "") === here) { mine = c; idx = i; }
        });
        function read(c) {
          if (!c) return null;
          var img = c.querySelector("img");
          var pill = c.querySelector(".notion-pill");
          var date = c.querySelector(".date");
          var a = c.querySelector("a[href]");
          return {
            title: textOf(c.querySelector(".notion-property__title")),
            tag: textOf(pill),
            date: textOf(date),
            glyph: img ? original(img.getAttribute("src")) : "",
            href: a ? a.getAttribute("href") : ""
          };
        }
        return { me: read(mine), next: read(cards[idx + 1] || cards[0] === mine ? cards[idx + 1] : null) };
      })
      .catch(function () { return { me: null, next: null }; });
    return indexOnce;
  }

  /* ── the reading rail ─────────────────────────────────────────────────────────────────── */
  function rail(heads) {
    var r = el("aside", "enc-po__rail");
    var prog = el("div", "enc-po__prog");
    var row = el("div", "enc-po__progrow");
    row.appendChild(el("span", "enc-po__proglabel", CONTENT.reading));
    row.appendChild(el("span", "enc-po__progpct", "0%"));
    var bar = el("div", "enc-po__bar");
    bar.setAttribute("role", "progressbar");
    bar.appendChild(el("span", "enc-po__barfill"));
    prog.appendChild(row);
    prog.appendChild(bar);
    r.appendChild(prog);

    if (heads.length) {
      var nav = el("nav", "enc-po__toc");
      nav.setAttribute("aria-label", "On this page");
      heads.forEach(function (h, i) {
        var a = el("a", "enc-po__tocitem");
        a.href = "#" + h.id;
        a.appendChild(el("span", "enc-po__tocn", ("0" + (i + 1)).slice(-2)));
        a.appendChild(el("span", "enc-po__toct", h.text));
        nav.appendChild(a);
      });
      r.appendChild(nav);
    }

    var ask = el("div", "enc-po__ask");
    ask.appendChild(el("span", "enc-po__asktitle", CONTENT.askTitle));
    ask.appendChild(el("span", "enc-po__asksub", CONTENT.askSub));
    var b = el("a", "enc-po__btn enc-po__btn--primary", CONTENT.askBtn);
    b.href = CONTENT.call;          // booking.js catches this href and opens the drawer
    ask.appendChild(b);
    r.appendChild(ask);
    return r;
  }

  function foot(next) {
    var f = el("div", "enc-po__foot");
    var left = el("div", "enc-po__footask");
    left.appendChild(el("span", "enc-po__foottitle", CONTENT.footTitle));
    left.appendChild(el("span", "enc-po__footsub", CONTENT.footSub));
    var btns = el("div", "enc-po__footbtns");
    var b1 = el("a", "enc-po__btn enc-po__btn--primary", CONTENT.askBtn);
    b1.href = CONTENT.call;
    var b2 = el("a", "enc-po__btn", CONTENT.footAll);
    b2.href = CONTENT.index;
    btns.appendChild(b1);
    btns.appendChild(b2);
    left.appendChild(btns);
    f.appendChild(left);

    if (next && next.title && next.href) {
      var a = el("a", "enc-po__next");
      a.href = next.href;
      var disc = el("span", "enc-po__nextglyph");
      if (next.glyph) {
        var img = el("img");
        img.src = next.glyph;
        img.alt = "";
        disc.appendChild(img);
      }
      a.appendChild(disc);
      var t = el("span", "enc-po__nextbody");
      t.appendChild(el("span", "enc-po__nextk", CONTENT.next));
      t.appendChild(el("span", "enc-po__nextt", next.title));
      a.appendChild(t);
      a.appendChild(el("span", "enc-po__nextarrow"));
      f.appendChild(a);
    }
    return f;
  }

  /* ── progress and the section the reader is in, off one anchor so they cannot disagree ── */
  var watching = null;
  function watch(wrap, heads) {
    if (watching) {
      window.removeEventListener("scroll", watching);
      window.removeEventListener("resize", watching);
    }
    var sync = function () {
      var body = wrap.querySelector(".enc-po__article");
      if (!body) return;
      var r = body.getBoundingClientRect(), vh = window.innerHeight, anchor = vh * 0.4;
      var p = Math.max(0, Math.min(1, (anchor - r.top) / Math.max(1, r.height - vh * 0.6)));
      var pct = Math.round(p * 100);
      var fill = wrap.querySelector(".enc-po__barfill");
      var label = wrap.querySelector(".enc-po__progpct");
      if (fill) fill.style.width = pct + "%";
      if (label) label.textContent = pct + "%";
      var at = 0;
      heads.forEach(function (h, i) {
        var n = document.getElementById(h.id);
        if (n && n.getBoundingClientRect().top < anchor) at = i;
      });
      if (window.scrollY >= document.documentElement.scrollHeight - vh - 2) at = heads.length - 1;
      Array.prototype.forEach.call(wrap.querySelectorAll(".enc-po__tocitem"), function (a, i) {
        if (i === at) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    watching = sync;
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root) return;
    if (root.getAttribute("data-enc-post") === VERSION) return;

    var cl = root.querySelector(":scope > .notion-column-list");
    if (!cl) return;
    var cols = Array.prototype.filter.call(cl.children, function (c) {
      return c.classList.contains("notion-column");
    });
    if (cols.length < 2) return;

    // ── the post as Notion has it: the contents block, then the post itself
    var post = cols[cols.length - 1];
    var items = Array.prototype.slice.call(post.children);
    var title = null, lede = null, banner = null, byline = null;
    var article = el("div", "enc-po__article");
    items.forEach(function (n) {
      if (!banner && n.classList.contains("notion-image")) { banner = n; return; }
      if (!byline && n.classList.contains("notion-column-list") &&
          /written by/i.test(textOf(n))) { byline = n; return; }
      if (!title && /^H1$/.test(n.tagName)) { title = n; return; }
      if (n.classList.contains("notion-heading__anchor")) return;
      article.appendChild(n);
    });
    // the lede is the post's own opening paragraph, lifted out of the body
    var first = article.querySelector("p.notion-text");
    if (first && textOf(first).length > 60) lede = first;

    // ── the head
    var head = el("div", "enc-po__head");
    var mark = el("img", "enc-po__mark");
    mark.setAttribute("aria-hidden", "true");
    mark.alt = "";
    head.appendChild(mark);
    head.appendChild(el("p", "enc-po__meta"));
    if (title) { title.classList.add("enc-po__title"); head.appendChild(title); }
    if (lede) { lede.classList.add("enc-po__lede"); head.appendChild(lede); }

    // ── the contents, from the post's own section headings
    var heads = [];
    Array.prototype.forEach.call(article.querySelectorAll("h2"), function (h) {
      var t = textOf(h);
      if (!t) return;
      if (!h.id) h.id = "sec-" + slug(t);
      h.classList.add("enc-po__h2");
      heads.push({ id: h.id, text: t });
    });
    Array.prototype.forEach.call(article.querySelectorAll("h3"), function (h) {
      h.classList.add("enc-po__h3");
    });

    // ── the tail Notion keeps after the post: the related collection gives us the next one
    var tail = Array.prototype.slice.call(root.children).filter(function (n) { return n !== cl; });
    var related = null;
    tail.forEach(function (n) {
      if (!related && n.classList.contains("notion-collection")) related = n;
    });

    var wrap = el("div", "enc-po__wrap");
    var bodyWrap = el("div", "enc-po__body");
    bodyWrap.appendChild(rail(heads));
    var colRight = el("div", "enc-po__col");
    colRight.appendChild(article);
    if (byline) { byline.classList.add("enc-po__byline"); colRight.appendChild(byline); }
    colRight.appendChild(foot(null));
    bodyWrap.appendChild(colRight);
    wrap.appendChild(head);
    wrap.appendChild(bodyWrap);
    root.insertBefore(wrap, root.firstChild);

    // what the design does not draw stays on the page but out of the way
    if (banner) banner.setAttribute("data-enc-source", "");
    if (cols[0]) cols[0].setAttribute("data-enc-source", "");
    cl.setAttribute("data-enc-source", "");
    tail.forEach(function (n) {
      if (n.classList.contains("notion-collection") || /more blog posts/i.test(textOf(n)) ||
          n.classList.contains("notion-divider")) n.setAttribute("data-enc-source", "");
    });

    // the read time is the post's own length, at 230 words a minute
    var words = textOf(article).split(/\s+/).length + textOf(head).split(/\s+/).length;
    var mins = Math.max(1, Math.round(words / 230));

    root.setAttribute("data-enc-post", VERSION);
    watch(wrap, heads);

    // ── the properties Super keeps for the index: the tag, the date and the chain's mark
    fromIndex().then(function (info) {
      var meta = wrap.querySelector(".enc-po__meta");
      var bits = [];
      if (info.me && info.me.tag) bits.push(info.me.tag);
      if (info.me && info.me.date) bits.push(info.me.date);
      bits.push(mins + " min");
      if (meta) meta.textContent = bits.join(" · ");
      if (info.me && info.me.glyph) mark.src = info.me.glyph;
      else mark.remove();
      if (info.next) {
        var f = wrap.querySelector(".enc-po__foot");
        if (f) f.replaceWith(foot(info.next));
      }
    });
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  build();
})();
