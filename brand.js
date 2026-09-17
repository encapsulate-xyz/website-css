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
  var LOGO = "block-ee3caff6b33e4ece99c5580eb45215b0";
  var WORDMARK = "block-962b3e95baaf47b694975486fbe5c014";
  var INTRO = "block-44d0237ba9f64c6c82661fa12cb2857f";
  var WORDMARK_HEAD = "block-6501ab5b3141446b95daaebad7728bb3";

  var script = document.currentScript;
  var BASE = script && /\/dist\/brand\.js/.test(script.src)
    ? script.src.replace(/\/dist\/brand\.js.*$/, "/") : null;
  var MARK = BASE ? BASE + "svg/mark-a.svg" : null;
  var WORD = BASE ? BASE + "svg/wordmark-reversed.svg" : null;

  /* Each ground has its own file in the gallery, named for it — "B" is the mark on light, "Ink"
     and "Green" the recoloured ones. `row` is the card the panel downloads; the mark is still
     painted by a mask so the panel renders even before a file exists. */
  var PANELS = [
    { bg: "#FAFAF8", ink: "#000000", mark: "mark", ground: "On light", row: "LIGHT" },
    { bg: "#2A2C28", ink: "#FAFAF8", mark: "mark", ground: "On ink", row: "INK" },
    { bg: "#99CC66", ink: "#000000", mark: "mark", ground: "On green", row: "GREEN" }
  ];
  var WORDS = [
    { bg: "#FAFAF8", ink: "#000000", mark: "word", ground: "On light", row: "LIGHT" },
    { bg: "#2A2C28", ink: "#FAFAF8", mark: "word", ground: "On ink", row: "INK" },
    { bg: "#99CC66", ink: "#000000", mark: "word", ground: "On green", row: "GREEN" }
  ];

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

  /* ── the marks slab ── */
  // the SVG card whose name matches this ground; an unnamed ground takes the first SVG that is
  // not one of the named ones, which is the file for light
  function fileOf(gallery, ground) {
    var cards = Array.prototype.slice.call(
      gallery ? gallery.querySelectorAll(".notion-collection-card") : []);
    var svgs = cards.filter(function (c) { return /\bSVG\b/i.test(c.textContent); });
    var named = svgs.filter(function (c) { return /\b(INK|GREEN|LIGHT)\b/i.test(c.textContent); });
    var pick = ground
      ? svgs.filter(function (c) { return c.textContent.toUpperCase().indexOf(ground) >= 0; })[0]
      : svgs.filter(function (c) { return named.indexOf(c) < 0; })[0];
    pick = pick || svgs[0] || cards[0];
    if (!pick) return null;
    var a = pick.matches("a") ? pick : pick.querySelector("a[href]");
    if (a) return a.getAttribute("href");
    // a gallery whose rows are not pages renders its cards as no-click: the file is the card's
    // own cover, and the original sits behind Super's image optimiser
    var img = pick.querySelector("img");
    if (!img) return null;
    var src = img.currentSrc || img.src || "";
    var m = /[?&]url=([^&]+)/.exec(src);
    return m ? decodeURIComponent(m[1]) : src;
  }

  function panel(p, href) {
    var a = el(href ? "a" : "div", "enc-brand__panel");
    if (href) { a.setAttribute("href", href); a.setAttribute("download", ""); }
    a.style.background = p.bg;
    a.setAttribute("data-mark", p.mark);
    var glyph = el("span", "enc-brand__glyph");
    var url = 'url("' + (p.mark === "mark" ? MARK : WORD) + '")';
    glyph.style.webkitMaskImage = url;
    glyph.style.maskImage = url;
    glyph.style.background = p.ink;
    a.appendChild(glyph);
    var label = el("span", "enc-brand__ground", p.ground);
    label.style.color = p.bg === "#2A2C28" ? "#B4B4B4" : (p.bg === "#99CC66" ? "#3A3D38" : "#6B6F68");
    a.appendChild(label);
    return a;
  }

  function slab() {
    var logo = byId(LOGO), word = byId(WORDMARK);
    if (!logo || !word || !MARK) return;
    var body = logo.closest(".enc-brand__body");
    if (!body || body.querySelector(".enc-brand__slab")) return;
    var box = el("div", "enc-brand__slab");
    var top = el("div", "enc-brand__row");
    PANELS.forEach(function (p) { top.appendChild(panel(p, fileOf(logo, p.row))); });
    var bottom = el("div", "enc-brand__row");
    WORDS.forEach(function (p) { bottom.appendChild(panel(p, fileOf(word, p.row))); });
    box.appendChild(top);
    box.appendChild(bottom);
    body.insertBefore(box, body.firstChild);
    logo.setAttribute("data-enc-source", "");
    word.setAttribute("data-enc-source", "");
    var head = byId(WORDMARK_HEAD);
    if (head) head.setAttribute("data-enc-source", "");
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
      card.addEventListener("click", function (e) {
        e.preventDefault();
        if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(function () {});
        card.setAttribute("data-enc-copied", "");
        setTimeout(function () { card.removeAttribute("data-enc-copied"); }, 1200);
      });
    });
  }

  /* ── the intro's own paragraph is replaced by the band's lede; its button is the band's CTA ── */
  function intro() {
    var box = byId(INTRO);
    if (!box || box.hasAttribute("data-enc-intro")) return;
    box.setAttribute("data-enc-intro", "");
  }

  function build() { spreads(); slab(); colours(); intro(); }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-brand__slab"); })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
