/* /brand — design "Brand Page". Linked from the SITE head, because Super never executes a page's
   own script on a client-side navigation.

   The page is four bands, and every band is a two-column spread: a narrow rail on the left holding
   the number, the title and the lede, which sticks while the content scrolls past it. Notion has no
   block that is a two-column spread with a sticky rail, and the blocks arrive flat, so this file
   wraps each band's own blocks into one — it moves Notion's nodes, it never writes copy.

   It also builds the marks slab (01): the three grounds the rule is about — light, ink, green —
   drawn as one rectangle with a hairline at every seam, each panel carrying the mark in the colour
   that ground demands. The mark is painted by masking the brand SVG, so one file serves every
   ground; each panel still downloads the file the Notion gallery holds.

   Styles: brand.css. */
(function () {
  var BANDS = [
    { number: "block-3dde800a513881018825e68cf06d6dac",
      title:  "block-fac3a2cc0805400db0798b8e1c888466",
      lede:   "block-3dde800a513881d8ad40e00f589e87f2",
      until:  "block-9e5d54377af643ceb4d608d1befec070" },
    { number: "block-3dde800a5138813a8397cb9f215327f3",
      title:  "block-9e5d54377af643ceb4d608d1befec070",
      lede:   "block-3dde800a51388118b52bda43152d6a0f",
      until:  "block-307aa6c846a3484fb24c1cd52f3fbcc6" },
    { number: "block-3dde800a51388129a36ddbae8f32ea85",
      title:  "block-307aa6c846a3484fb24c1cd52f3fbcc6",
      lede:   "block-3dde800a513881c1a684ea7e9ac82f9d",
      until:  "block-3dde800a513881ea902ed8fdefbe023c" },
    { number: "block-3dde800a513881ea902ed8fdefbe023c",
      title:  "block-3dde800a51388122" + "9facf9b3a2c4b208",
      lede:   "block-3dde800a5138813bb478ef91ee89b8e3",
      until:  null }
  ];
  var PASTELS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var LOGO = "block-ee3caff6b33e4ece99c5580eb45215b0";
  var WORDMARK = "block-962b3e95baaf47b694975486fbe5c014";
  var INTRO = "block-44d0237ba9f64c6c82661fa12cb2857f";
  var HINT = "block-3dee800a513881e8b429deb3a9289539";   // Notion's "Click to download"
  var NOTE = "block-3dee800a5138812283d6c31093c45298";   // "Three grounds, two kinds"

  var script = document.currentScript;
  var BASE = script && /\/dist\/brand\.js/.test(script.src)
    ? script.src.replace(/\/dist\/brand\.js.*$/, "/") : null;
  var MARK = BASE ? BASE + "svg/mark-a.svg" : null;
  var WORD = BASE ? BASE + "svg/wordmark-reversed.svg" : null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function byId(id) { return document.getElementById(id); }

  /* ── the spreads ── */
  function spreads() {
    var root = document.querySelector(".notion-root");
    if (!root) return;
    BANDS.forEach(function (band, i) {
      var title = byId(band.title);
      if (!title || title.closest(".enc-brand")) return;
      var section = el("section", "enc-brand");
      section.setAttribute("data-band", String(i + 1));
      var rail = el("div", "enc-brand__rail");
      var body = el("div", "enc-brand__body");
      section.appendChild(rail);
      section.appendChild(body);
      root.insertBefore(section, title);

      var stop = band.until ? byId(band.until) : null;
      var node = section.nextSibling;
      while (node && node !== stop) {
        var next = node.nextSibling;
        if (node.id === band.number || node.id === band.title || node.id === band.lede) rail.appendChild(node);
        else body.appendChild(node);
        node = next;
      }
    });
  }

  /* ── the marks: one row per ground, the mark then the wordmark ──
     The design's 01: three rows, one per ground, each holding the two files that ground gets —
     the mark at 30% of the row and the wordmark at 70%, because the wordmark needs the width.
     Each cell is the file's own download, named in its corner. */
  var GROUNDS = [
    { bg: "#FAFAF8", ink: "#000000", row: "LIGHT", label: "#6B6F68" },
    { bg: "#2A2C28", ink: "#FAFAF8", row: "INK", label: "#B4B4B4" },
    { bg: "#99CC66", ink: "#000000", row: "GREEN", label: "#3A3D38" }
  ];

  function fileOf(gallery, ground) {
    var cards = Array.prototype.slice.call(
      gallery ? gallery.querySelectorAll(".notion-collection-card") : []);
    var pick = cards.filter(function (c) {
      return c.textContent.toUpperCase().indexOf(ground) >= 0;
    })[0] || cards[0];
    if (!pick) return null;
    var a = pick.matches("a") ? pick : pick.querySelector("a[href]");
    if (a) return { href: a.getAttribute("href"), name: nameOf(pick) };
    // a gallery whose rows are not pages renders its cards as no-click: the file is the cover,
    // and the original sits behind Super's image optimiser
    var img = pick.querySelector("img");
    if (!img) return null;
    var src = img.currentSrc || img.src || "";
    var m = /[?&]url=([^&]+)/.exec(src);
    return { href: m ? decodeURIComponent(m[1]) : src, name: nameOf(pick) };
  }

  // the file's own name, taken from the URL it downloads
  function nameOf(card) {
    var img = card.querySelector("img");
    var src = img ? (img.currentSrc || img.src || "") : "";
    var m = /[?&]url=([^&]+)/.exec(src);
    var u = m ? decodeURIComponent(m[1]) : src;
    var last = decodeURIComponent(u.split("?")[0].split("/").pop() || "");
    return /\.(svg|png)$/i.test(last) ? last : "";
  }

  function cell(ground, file, kind, hint) {
    var a = el(file && file.href ? "a" : "div", "enc-brand__cell");
    if (file && file.href) { a.setAttribute("href", file.href); a.setAttribute("download", ""); }
    a.setAttribute("data-kind", kind);
    a.style.background = ground.bg;
    var glyph = el("span", "enc-brand__glyph");
    var url = 'url("' + (kind === "mark" ? MARK : WORD) + '")';
    glyph.style.webkitMaskImage = url;
    glyph.style.maskImage = url;
    glyph.style.background = ground.ink;
    a.appendChild(glyph);
    var name = el("span", "enc-brand__file", (file && file.name) || "");
    name.style.color = ground.label;
    a.appendChild(name);
    var call = el("span", "enc-brand__hint", hint);
    call.style.color = ground.ink;
    a.appendChild(call);
    return a;
  }

  function slab() {
    var logo = byId(LOGO), word = byId(WORDMARK);
    if (!logo || !word || !MARK) return;
    var body = logo.closest(".enc-brand__body");
    if (!body || body.querySelector(".enc-brand__slab")) return;
    var hint = (byId(HINT) && byId(HINT).textContent.trim()) || "";
    var box = el("div", "enc-brand__slab");
    GROUNDS.forEach(function (g) {
      var row = el("div", "enc-brand__row");
      row.appendChild(cell(g, fileOf(logo, g.row), "mark", hint));
      row.appendChild(cell(g, fileOf(word, g.row), "word", hint));
      box.appendChild(row);
    });
    body.insertBefore(box, body.firstChild);
    logo.setAttribute("data-enc-source", "");
    word.setAttribute("data-enc-source", "");
    var hintBlock = byId(HINT);
    if (hintBlock) hintBlock.setAttribute("data-enc-source", "");
    var note = byId(NOTE);
    if (note) note.setAttribute("data-enc-note", "");
  }

  /* ── the type band: each face is a specimen, its name and its job ──
     The handoff sets the specimen large on the left and the name with its weights at the right of
     the same row. Notion gives three flat paragraphs per face, so they are grouped here. */
  function faces() {
    var band = document.querySelector('.enc-brand[data-band="3"] .enc-brand__body');
    if (!band || band.querySelector(".enc-face")) return;
    var ps = Array.prototype.slice.call(band.querySelectorAll(":scope > p.notion-text"));
    var SPECIMEN = /^Aa Bb Cc$/;
    for (var i = 0; i < ps.length; i++) {
      if (!SPECIMEN.test(ps[i].textContent.trim())) continue;
      var row = el("div", "enc-face");
      row.setAttribute("data-face", String(band.querySelectorAll(".enc-face").length + 1));
      ps[i].before(row);
      var meta = el("span", "enc-face__meta");
      row.appendChild(ps[i]);            // the specimen
      if (ps[i + 1]) meta.appendChild(ps[i + 1]);   // the name
      if (ps[i + 2]) meta.appendChild(ps[i + 2]);   // role and weights
      row.appendChild(meta);
      i += 2;
    }
  }

  /* ── colour: the swatches are Notion's rows, and their own hex paints them ── */
  function colours() {
    var gallery = byId("block-5dc66b67801044d6b079f77ec376ba54");
    if (!gallery) return;
    Array.prototype.forEach.call(gallery.querySelectorAll(".notion-collection-card"), function (card) {
      var hex = (card.textContent.match(/#[0-9a-fA-F]{6}/) || [])[0];
      if (!hex || card.getAttribute("data-enc-hex") === hex) return;
      card.setAttribute("data-enc-hex", hex);
      // the Card System fills a gallery card with the page ground and marks it !important, which
      // an inline background cannot beat — so the colour is handed over as a custom property and
      // brand.css spends it in a rule of its own
      card.style.setProperty("--enc-hex", hex);
      // white type on a dark value, ink on a light one — luminance, so a new colour needs no rule
      var n = parseInt(hex.slice(1), 16);
      var lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
      card.setAttribute("data-enc-on", lum < 0.55 ? "dark" : "light");
      // the pastel set is the design's second row: graphics only, and half the height
      card.setAttribute("data-enc-kind", PASTELS.indexOf(hex.toUpperCase()) >= 0 ? "pastel" : "brand");
      card.addEventListener("click", function (e) {
        e.preventDefault();
        if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(function () {});
        card.setAttribute("data-enc-copied", "");
        setTimeout(function () { card.removeAttribute("data-enc-copied"); }, 1200);
      });
    });
  }

  /* ── the cover's two label pairs ──
     The design sets the crumb beside its eyebrow, and the foot beside "Scroll ↓". As grid cells
     they cannot hold together: the headline and the lede span the same columns, and a spanning
     item hands its width back to the tracks it spans, so the pair drifts apart by whatever the
     headline is wide. Wrapping each pair makes it one item, which no other row can stretch. */
  function coverRows() {
    var cover = byId("block-af37871bf3db42c980b7cdaefb8a0ad0");
    if (!cover) return;
    var content = cover.querySelector(":scope > .notion-callout__content");
    if (!content || content.querySelector(".enc-cover__pair")) return;
    var ps = content.querySelectorAll(":scope > p.notion-text");
    if (ps.length < 5) return;
    [[ps[0], ps[1], "top"], [ps[3], ps[4], "foot"]].forEach(function (pair) {
      var row = el("div", "enc-cover__pair");
      row.setAttribute("data-pair", pair[2]);
      pair[0].before(row);
      row.appendChild(pair[0]);
      row.appendChild(pair[1]);
    });
    cover.setAttribute("data-enc-cover", "");
  }

  /* ── the intro's own paragraph is replaced by the band's lede; its button is the band's CTA ── */
  function intro() {
    var box = byId(INTRO);
    if (!box || box.hasAttribute("data-enc-intro")) return;
    box.setAttribute("data-enc-intro", "");
  }

  function build() { coverRows(); spreads(); slab(); faces(); colours(); intro(); }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-brand__slab"); })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
