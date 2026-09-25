/* /blog/<post> — design "Blog Post Page" (variant J, the type cover).

   Every post in the Blogs database is the same shape in Notion: a two-column block whose first
   column is a table of contents and whose second is the post — the byline, the
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
  var VERSION = "9";

  /* The words live on the /blog page, in a toggle called "Post page copy" — one place for all
     forty posts, since Super ships only the current page's blocks and a post has no block of its
     own for them. These are the fallback if that toggle is ever missing. */
  var CONTENT = {
    "rail title": "Launching a chain?",
    "rail sub": "We join at testnet and stay.",
    "rail button": "Book a call",
    "foot live title": "Delegating on {chain}?",
    "foot live sub": "Our address, commission and uptime",
    "foot live button": "Delegate {ticker}",
    "foot soon title": "Running the {chain} testnet?",
    "foot soon sub": "Mainnet has not launched yet",
    "foot soon button": "Delegate {ticker}",
    "foot soon note": "Coming soon on mainnet",
    "foot plain title": "Running a chain we should know about?",
    "foot plain sub": "Tell us what it takes to run it. If it's a fit, you'll hear from us within a week.",
    "foot all": "All posts",
    "reading": "Reading",
    "next": "Next",
    "written by": "Written by"
  };
  var CALL = "https://cal.com/aditya-encapsulate/30min";
  var INDEX = "/blog";
  var NETWORKS = "/networks";

  function say(key, post) {
    var t = CONTENT[key] || "";
    if (!post) return t;
    return t.replace("{chain}", post.chain || "").replace("{ticker}", post.ticker || "")
      .replace(/\s{2,}/g, " ").trim();
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function textOf(n) { return ((n && n.textContent) || "").replace(/\s+/g, " ").trim(); }
  /* two sentences and 220 characters, the length a Lede is written to */
  function short(t) {
    if (t.length <= 220) return t;
    var parts = t.split(/(?<=[.!?])\s+/), out = "";
    for (var i = 0; i < parts.length; i++) {
      if (!out) out = parts[i];
      else if (out.length + 1 + parts[i].length <= 220) out += " " + parts[i];
      else break;
    }
    return (out.length > 240 ? out.slice(0, 220).replace(/\s+\S*$/, "") + "\u2026" : out);
  }

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
  /* The index is fetched once and parsed once; the post is looked up on every build, because
     Super is a single-page app and the next post the reader opens is a different row of the same
     index. Caching the lookup gave every post the first one's mark, lede and next. */
  var indexOnce = null;
  function indexCards() {
    if (indexOnce) return indexOnce;
    indexOnce = fetch(INDEX, { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        // the copy block: "key · value" lines in a toggle on the index page
        Array.prototype.forEach.call(doc.querySelectorAll(".notion-toggle"), function (t) {
          if (!/post page copy/i.test(textOf(t.querySelector(".notion-toggle__summary")))) return;
          Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
            var line = textOf(p), i = line.indexOf("\u00b7");
            if (i < 0) return;
            var k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
            if (k && v) CONTENT[k] = v;
          });
        });
        return Array.prototype.slice.call(doc.querySelectorAll(".notion-collection-card"));
      })
      .catch(function () { return []; });
    return indexOnce;
  }

  function read(c) {
    if (!c) return null;
    var img = c.querySelector("img");
    var a = c.querySelector("a[href]");
    var texts = Array.prototype.map.call(
      c.querySelectorAll(".notion-property__text"), textOf).filter(Boolean);
    /* the pills are matched by value, not by order: the state, whether the chain is ours, and
       whatever is left is the post's tag */
    var pills = Array.prototype.map.call(c.querySelectorAll(".notion-pill"), textOf);
    var live = pills.filter(function (x) { return /^live$|^not yet launched$/i.test(x); })[0] || "";
    var mine = pills.filter(function (x) { return /^we run it$|^not ours$/i.test(x); })[0] || "";
    var tag = pills.filter(function (x) { return x && x !== live && x !== mine; })[0] || "";
    /* the card's text properties are told apart by shape: a ticker is short and upper case, the
       lede is the long one, the chain is the short one that is left, and the author is a name */
    var chain = "", ticker = "", lede = "", author = "";
    texts.forEach(function (t) {
      if (/^[A-Z0-9]{2,6}$/.test(t)) { if (!ticker) ticker = t; }
      else if (t.length > 60) { if (t.length > lede.length) lede = t; }
      else if (/^[A-Z][a-z]+(\s+[A-Z][a-zA-Z.]+)+$/.test(t) && !author) author = t;
      else if (t.length <= 24 && !chain) chain = t;
    });
    if (!author) author = textOf(c.querySelector(".notion-property__person"));
    return {
      title: textOf(c.querySelector(".notion-property__title")),
      tag: tag,
      date: textOf(c.querySelector(".date")),
      glyph: img ? original(img.getAttribute("src")) : "",
      href: a ? a.getAttribute("href") : "",
      chain: chain, ticker: ticker, lede: lede, author: author,
      stage: /^live$/i.test(live) ? "live" : (/^not yet launched$/i.test(live) ? "soon" : "")
    };
  }

  /* the team, from the homepage's own section: the face and the role the design's byline wants.
     One fetch, cached, and the byline still draws with initials if it fails. */
  var teamOnce = null;
  function team() {
    if (teamOnce) return teamOnce;
    teamOnce = fetch("/", { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var out = [];
        Array.prototype.forEach.call(doc.querySelectorAll(".notion-collection-card"), function (c) {
          var img = c.querySelector("img");
          /* a role can be a multi-select — Aditya's is "Founder" and "Validator" — and reading
             the whole property ran them together, so the first pill is the role */
          var role = textOf(c.querySelector(".notion-pill")) ||
                     textOf(c.querySelector(".notion-property__select"));
          var texts = Array.prototype.map.call(
            c.querySelectorAll(".notion-property__text"), textOf).filter(Boolean);
          // a person's card: a name, a role, and a face
          var name = texts.filter(function (t) {
            return /^[A-Z][A-Za-z.]*(\s+[A-Z][A-Za-z.]*)+$/.test(t) && t.length < 40;
          })[0];
          if (name && role && img) {
            out.push({ name: name, role: role, img: original(img.getAttribute("src")) });
          }
        });
        return out;
      })
      .catch(function () { return []; });
    return teamOnce;
  }

  /* this post's row, and the one after it — looked up per page, never cached */
  function fromIndex() {
    return indexCards().then(function (cards) {
      var here = location.pathname.replace(/\/$/, "");
      var mine = null, idx = -1;
      cards.forEach(function (c, i) {
        var a = c.querySelector("a[href]");
        if (a && a.getAttribute("href").replace(/\/$/, "") === here) { mine = c; idx = i; }
      });
      var nextCard = idx >= 0 ? (cards[idx + 1] || cards[0]) : null;
      if (nextCard === mine) nextCard = null;
      return { me: read(mine), next: read(nextCard) };
    });
  }

  /* ── the reading rail ─────────────────────────────────────────────────────────────────── */
  function rail(heads) {
    var r = el("aside", "enc-po__rail");
    var prog = el("div", "enc-po__prog");
    var row = el("div", "enc-po__progrow");
    row.appendChild(el("span", "enc-po__proglabel"));
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
    r.appendChild(el("div", "enc-po__ask"));
    return r;
  }

  /* the rail's standing ask, once the index's copy has arrived */
  function fillAsk(wrap) {
    var ask = wrap.querySelector(".enc-po__ask");
    if (!ask) return;
    ask.textContent = "";
    ask.appendChild(el("span", "enc-po__asktitle", say("rail title")));
    ask.appendChild(el("span", "enc-po__asksub", say("rail sub")));
    var b = el("a", "enc-po__btn enc-po__btn--primary", say("rail button"));
    b.href = CALL;               // booking.js catches this href and opens the drawer
    ask.appendChild(b);
    var label = wrap.querySelector(".enc-po__proglabel");
    if (label) label.textContent = say("reading");
  }

  /* the foot: the post's own ask when the database says which chain it is about, and the
     standing one when it does not */
  function foot(next, post) {
    var f = el("div", "enc-po__foot");
    var left = el("div", "enc-po__footask");
    /* the ask follows OUR stage on that chain, which is what the Mainnet property carries: a
       post about a network we are not on, or about a group of them, gets the standing ask */
    var kind = (!post || !post.chain || !post.stage) ? "plain" : post.stage;
    left.appendChild(el("span", "enc-po__foottitle", say("foot " + kind + " title", post)));
    left.appendChild(el("span", "enc-po__footsub", say("foot " + kind + " sub", post)));
    var btns = el("div", "enc-po__footbtns");
    var primary;
    if (kind === "live") {
      primary = el("a", "enc-po__btn enc-po__btn--primary", say("foot live button", post));
      primary.href = NETWORKS;
    } else if (kind === "soon") {
      /* mainnet is not ours yet, so the button is there and does nothing: it says what it will
         be, and says why on hover rather than sending the reader somewhere else */
      primary = el("span", "enc-po__btn enc-po__btn--primary enc-po__btn--wait",
        say("foot soon button", post) || "Delegate");
      primary.setAttribute("aria-disabled", "true");
      primary.setAttribute("title", say("foot soon note"));
      primary.appendChild(el("span", "enc-po__tip", say("foot soon note")));
    } else {
      primary = el("a", "enc-po__btn enc-po__btn--primary", say("rail button"));
      primary.href = CALL;
    }
    var all = el("a", "enc-po__btn", say("foot all"));
    all.href = INDEX;
    btns.appendChild(primary);
    btns.appendChild(all);
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
      t.appendChild(el("span", "enc-po__nextk", say("next")));
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

  /* put every Notion block back where Super had it, so a newer release can build the page again
     rather than finding an older build and leaving it. The column that held the post is marked,
     because that is where the blocks belong. */
  function unwrap(root) {
    var home = root.querySelector("[data-enc-home]");
    Array.prototype.forEach.call(root.querySelectorAll(".enc-po__wrap"), function (w) {
      var flat = [];
      (function walk(n) {
        Array.prototype.forEach.call(n.children, function (c) {
          if (c.id && c.id.indexOf("block-") === 0) flat.push(c);
          else walk(c);
        });
      })(w);
      flat.forEach(function (n) { (home || root).appendChild(n); });
      w.remove();
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-enc-source]"), function (n) {
      n.removeAttribute("data-enc-source");
    });
    Array.prototype.forEach.call(root.querySelectorAll("[class*='enc-po__']"), function (n) {
      n.className = n.className.split(" ").filter(function (c) {
        return c.indexOf("enc-po__") !== 0;
      }).join(" ");
    });
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root) return;
    if (root.getAttribute("data-enc-post") === VERSION) return;
    unwrap(root);

    /* the post's own two-column block is the one carrying Notion's contents — the longest one
       if a post has no contents block. Taking the first column list put the XMTP post's whole
       article off the page: its blocks sit at the FOOT of that page, after "More Blog Posts",
       and the first column list there is a divider beside the "View More Blog Posts" button
       (reported 2026-09-23). */
    var lists = Array.prototype.filter.call(
      root.querySelectorAll(":scope > .notion-column-list"), function (n) {
        return Array.prototype.filter.call(n.children, function (c) {
          return c.classList.contains("notion-column");
        }).length >= 2;
      });
    var cl = lists.filter(function (n) {
      return n.querySelector(".notion-table-of-contents");
    })[0];
    if (!cl) {
      lists.forEach(function (n) {
        if (!cl || textOf(n).length > textOf(cl).length) cl = n;
      });
    }
    if (!cl) return;
    var cols = Array.prototype.filter.call(cl.children, function (c) {
      return c.classList.contains("notion-column");
    });
    if (cols.length < 2) return;

    // ── the post as Notion has it: the contents block, then the post itself
    var post = cols[cols.length - 1];
    post.setAttribute("data-enc-home", "");
    var items = Array.prototype.slice.call(post.children);
    var title = null, byline = null;
    var article = el("div", "enc-po__article");
    /* No image is hidden any more. The banner block was deleted from every post in Notion when
       the head became the title, so "hide the first image" only ever reached the body's own
       figures — it cost the Gno.land post its first illustration (2026-09-23). A post that still
       shows one is a page Super has not republished yet. */
    items.forEach(function (n) {
      if (!byline && n.classList.contains("notion-column-list") &&
          /written by/i.test(textOf(n))) { byline = n; return; }
      if (!title && /^H1$/.test(n.tagName)) { title = n; return; }   // older posts still have one
      if (n.classList.contains("notion-heading__anchor")) return;
      article.appendChild(n);
    });
    // the lede is the Lede property (set below, once the index answers); the post's own opening
    // paragraph is the fallback, and it stays in the body until it is needed
    var first = article.querySelector("p.notion-text");

    // ── the head
    var head = el("div", "enc-po__head");
    var mark = el("img", "enc-po__mark");
    mark.setAttribute("aria-hidden", "true");
    mark.alt = "";
    head.appendChild(mark);
    head.appendChild(el("p", "enc-po__meta"));
    if (!title) {
      // the post's own H1 was removed from Notion once the head became the title, so the page
      // header Super always renders is where the title comes from
      var hdr = document.querySelector(".notion-header__title");
      if (hdr) { title = el("h1"); title.textContent = textOf(hdr); }
    }
    if (title) { title.classList.add("enc-po__title"); head.appendChild(title); }
    head.appendChild(el("p", "enc-po__lede"));

    // ── the contents, from the post's own section headings
    /* the older posts set their sections as Notion Heading 1, so a heading left in the body is a
       section heading whatever its level — it reads and lists as one */
    var heads = [];
    Array.prototype.forEach.call(article.querySelectorAll("h1, h2"), function (h) {
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
    else colRight.appendChild(el("div", "enc-po__byline enc-po__byline--built"));
    colRight.appendChild(foot(null, null));
    bodyWrap.appendChild(colRight);
    wrap.appendChild(head);
    wrap.appendChild(bodyWrap);
    root.insertBefore(wrap, root.firstChild);

    // what the design does not draw stays on the page but out of the way
    if (cols[0]) cols[0].setAttribute("data-enc-source", "");
    cl.setAttribute("data-enc-source", "");
    tail.forEach(function (n) {
      if (n.classList.contains("notion-collection") || /more blog posts/i.test(textOf(n)))
        n.setAttribute("data-enc-source", "");
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
      var by = wrap.querySelector(".enc-po__byline--built");
      if (by) {
        var who = info.me && info.me.author;
        if (who) {
          var disc = el("span", "enc-po__bydisc", who.replace(/[^A-Za-z ]/g, "").split(/\s+/)
            .map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase());
          var t2 = el("span", "enc-po__bybody");
          t2.appendChild(el("span", "enc-po__byk", say("written by")));
          var name = el("span", "enc-po__byn", who);
          t2.appendChild(name);
          by.appendChild(disc);
          by.appendChild(t2);
          team().then(function (people) {
            var m = people.filter(function (x) {
              return x.name.toLowerCase().indexOf(who.toLowerCase()) >= 0 ||
                     who.toLowerCase().indexOf(x.name.toLowerCase()) >= 0;
            })[0];
            if (!m) return;
            if (m.role) name.textContent = who + " \u00b7 " + m.role;
            if (m.img) {
              disc.textContent = "";
              var face = el("img", "enc-po__byface");
              face.src = m.img;
              face.alt = "";
              disc.appendChild(face);
            }
          });
        } else by.remove();
      }
      var led = wrap.querySelector("p.enc-po__lede");
      if (led) {
        if (info.me && info.me.lede) led.textContent = info.me.lede;
        else if (first && textOf(first).length > 60) {
          // no Lede on the row: the post's own opening stands in, cut to the same length the
          // property is written to, so a post that opens at length cannot fill the head
          led.textContent = short(textOf(first));
          first.setAttribute("data-enc-source", "");
        } else led.remove();
      }
      if (info.me && info.me.glyph) mark.src = info.me.glyph;
      else mark.remove();
      fillAsk(wrap);
      var f = wrap.querySelector(".enc-po__foot");
      if (f) f.replaceWith(foot(info.next, info.me));
    });
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  build();
})();
