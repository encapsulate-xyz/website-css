/* /blog — design "Blog Index Layouts", block J "An alternating rhythm". Linked from the SITE head,
   because Super never executes a page's own script on a client-side navigation.

   The index states its rhythm once and then settles: a row of three whose first card is merged into
   one spanning two columns and two rows, then a pair at half width, then rows of three for as long
   as the archive runs. A remainder of one or two becomes an equal row at its own width rather than
   being squeezed into a trio's proportions, so any number of posts fills correctly.

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
  var MARK = BASE ? BASE + "svg/mark-a.svg" : null;

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
      // the mark is drawn as a mask so it takes the paper colour on the ink ground
      var m = el("span", "enc-post__mark");
      m.style.webkitMaskImage = 'url("' + MARK + '")';
      m.style.maskImage = 'url("' + MARK + '")';
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
    else if (n - i === 1) { out.push([COLS, 1]); return out; }
    while (n - i >= 3) { out.push([2, 1], [2, 1], [2, 1]); i += 3; }
    var rest = n - i;                                        // a remainder of one or two
    if (rest) for (var r = 0; r < rest; r++) out.push([COLS / rest, 1]);
    return out;
  }

  function build() {
    var gallery = document.getElementById(GALLERY);
    if (!gallery) return;
    var cards = Array.prototype.slice.call(gallery.querySelectorAll(".notion-collection-card"));
    if (!cards.length) return;
    var sig = cards.length + "/" + (cards[0].textContent || "").slice(0, 40);
    if (gallery.getAttribute("data-enc-sig") === sig) return;
    gallery.setAttribute("data-enc-sig", sig);

    var layout = spans(cards.length);
    cards.forEach(function (card, i) {
      var post = read(card);
      var tint = TINTS[i % TINTS.length];
      var built = card.querySelector(":scope > .enc-post__cover");
      if (built) built.remove();
      card.insertBefore(cover(post, tint), card.firstChild);
      card.setAttribute("data-enc-post", "");
      var s = layout[i] || [2, 1];
      card.style.gridColumn = "span " + s[0];
      card.style.gridRow = s[1] > 1 ? "span " + s[1] : "";
      // the merged card is stretched by its two rows, so it must not keep the 1.91 ratio
      card.toggleAttribute("data-enc-tall", s[1] > 1);
    });
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
