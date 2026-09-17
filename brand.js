/* /brand — design "Brand Page", implemented verbatim. Linked from the SITE head, because Super
   never executes a page's own script on a client-side navigation.

   The page is a cover and four bands, and every band is a two-column spread: a narrow rail holding
   the number, the title and the lede, sticky while the content scrolls past it. Notion has no block
   that is a spread, and its blocks arrive flat, so this file groups them — it moves Notion's nodes
   and writes no copy of its own. Every word on the page comes from a Notion block; the only strings
   here are class names.

   What it builds, in the order the handoff sets:

     cover    the eyebrow pair, the wordmark with the kit line and the two CTAs, the foot pair
     01       one row per ground, the mark at 30% and the wordmark at 70%, each cell a download
              named in its corner, saying "Click to download" on hover
     02       the brand pair as one strip and the pastel set as another, each swatch copying its
              own value on click
     03       one row per face: the specimen at scale, its name and its weights
     04       the four rules beside the clear-space diagram

   The rows of the Brand kit and Colour databases are the source of all of it; both stay in the
   page, hidden, as the no-JavaScript fallback. Styles: brand.css. */
(function () {
  var COVER = "block-3dee800a5138811b9298fe700f0a4d09";
  var KIT = "block-3dee800a513881acb3cfc84ec2e28238";
  var COLOUR = "block-3dee800a5138812592b3de667797d25c";

  var GROUNDS = {
    Light: { bg: "#FAFAF8", ink: "#000000", label: "#6B6F68", key: "light" },
    Ink:   { bg: "#2A2C28", ink: "#FAFAF8", label: "#B4B4B4", key: "ink" },
    Green: { bg: "#99CC66", ink: "#000000", label: "#3A3D38", key: "green" }
  };
  var ORDER = ["Light", "Ink", "Green"];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function byId(id) { return document.getElementById(id); }
  function textsOf(box) {
    return Array.prototype.slice.call(box.querySelectorAll(":scope > p.notion-text"));
  }
  function hide(node) { if (node) node.setAttribute("data-enc-source", ""); }

  /* ── the cover ── */
  function cover() {
    var box = byId(COVER);
    if (!box || box.querySelector(".enc-mid")) return;
    var content = box.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    var ps = textsOf(content);
    var buttons = content.querySelector(":scope > .notion-column-list");
    if (ps.length < 5 || !buttons) return;

    // the eyebrow and the foot are label pairs; each has to be one item, or the middle block's
    // width would push the two labels apart
    var top = el("div", "enc-pair");
    top.setAttribute("data-pair", "top");
    ps[0].before(top);
    top.appendChild(ps[0]);
    top.appendChild(ps[1]);

    var mid = el("div", "enc-mid");
    ps[2].before(mid);
    mid.appendChild(el("span", "enc-mid__mark"));   // the wordmark, in the headline's place
    mid.appendChild(ps[2]);
    mid.appendChild(buttons);

    var foot = el("div", "enc-pair");
    foot.setAttribute("data-pair", "foot");
    ps[3].before(foot);
    foot.appendChild(ps[3]);
    foot.appendChild(ps[4]);
  }

  /* ── the spreads: a rail of title, lede and number, then everything up to the next title ── */
  function bands() {
    var root = document.querySelector(".notion-root");
    if (!root) return;
    var heads = Array.prototype.slice.call(root.querySelectorAll(".notion-heading"))
      .filter(function (h) { return h.parentElement === root || h.closest(".enc-band__rail"); });
    heads.forEach(function (title, i) {
      var band = title.closest(".enc-band"), rail, body;
      if (band) {
        rail = band.querySelector(".enc-band__rail");
        body = band.querySelector(".enc-band__body");
      } else {
        band = el("section", "enc-band");
        band.setAttribute("data-band", String(i + 1));
        rail = el("div", "enc-band__rail");
        body = el("div", "enc-band__body");
        band.appendChild(rail);
        band.appendChild(body);
        root.insertBefore(band, title);
        rail.appendChild(title);      // the title first: the loop below stops on any heading
      }
      // everything after the band up to the next heading belongs to it — the first two paragraphs
      // (the lede and the number) in the rail, the rest in the body. Running again fills a band
      // that was built empty rather than skipping it.
      var node = band.nextSibling;
      while (node) {
        var next = node.nextSibling;
        if (node.classList && (node.classList.contains("notion-heading") ||
            node.classList.contains("notion-heading__anchor") ||
            node.classList.contains("enc-band"))) break;
        if (rail.children.length < 3) rail.appendChild(node);
        else body.appendChild(node);
        node = next;
      }
    });
    // Super's empty heading anchors are left behind once the headings have moved
    Array.prototype.forEach.call(root.querySelectorAll(":scope > .notion-heading__anchor"),
      function (a) { a.remove(); });
  }

  /* ── 01 · the marks ── */
  function rowsOf(db) {
    var box = byId(db);
    return box ? Array.prototype.slice.call(box.querySelectorAll(".notion-collection-card")) : [];
  }
  // a row's file: the card's own link when the row is a page, else its cover, unwrapped from
  // Super's image optimiser
  function fileOf(card) {
    var a = card.matches("a") ? card : card.querySelector("a[href]");
    if (a) return a.getAttribute("href");
    var img = card.querySelector("img");
    var src = img ? (img.currentSrc || img.src || "") : "";
    var m = /[?&]url=([^&]+)/.exec(src);
    return m ? decodeURIComponent(m[1]) : src;
  }
  function fieldOf(card, re) {
    var hit = Array.prototype.slice.call(card.querySelectorAll(".notion-collection-card__property"))
      .map(function (p) { return p.textContent.trim(); })
      .filter(function (t) { return re.test(t); })[0];
    return hit || "";
  }

  function marks() {
    var db = byId(KIT);
    var band = db && db.closest(".enc-band__body");
    if (!band || band.querySelector(".enc-marks")) return;
    var cards = rowsOf(KIT);
    if (!cards.length) return;

    var hintBlock = band.querySelector(":scope > p.notion-text");
    var hint = hintBlock ? hintBlock.textContent.trim() : "";

    var files = cards.map(function (c) {
      var title = c.querySelector(".notion-property__title");
      return {
        name: title ? title.textContent.trim() : "",
        kind: fieldOf(c, /^(Mark|Wordmark)$/i),
        ground: fieldOf(c, /^(Light|Ink|Green)$/i),
        href: fileOf(c)
      };
    });

    var box = el("div", "enc-marks");
    ORDER.forEach(function (name) {
      var g = GROUNDS[name];
      var row = el("div", "enc-marks__row");
      ["Mark", "Wordmark"].forEach(function (kind) {
        var file = files.filter(function (f) {
          return f.ground === name && f.kind === kind;
        })[0];
        var cell = el(file && file.href ? "a" : "div", "enc-marks__cell");
        if (file && file.href) { cell.setAttribute("href", file.href); cell.setAttribute("download", ""); }
        cell.setAttribute("data-kind", kind === "Mark" ? "mark" : "word");
        cell.setAttribute("data-ground", g.key);
        cell.style.background = g.bg;

        // the file is drawn by masking itself, so the cell shows the drawing in the colour that
        // ground demands even while the browser is still fetching it
        var art = el("span", "enc-marks__art");
        if (file && file.href) {
          var url = 'url("' + file.href.replace(/"/g, "%22") + '")';
          art.style.webkitMaskImage = url;
          art.style.maskImage = url;
        }
        art.style.background = g.ink;
        cell.appendChild(art);

        var label = el("span", "enc-marks__file", (file && file.name) || "");
        label.style.color = g.label;
        cell.appendChild(label);

        var call = el("span", "enc-marks__hint", hint);
        call.style.color = g.ink;
        cell.appendChild(call);
        row.appendChild(cell);
      });
      box.appendChild(row);
    });
    band.insertBefore(box, band.firstChild);
    hide(db);
    hide(hintBlock);

    // the button and the note beside it are the band's own CTA row
    var button = band.querySelector(":scope > .notion-callout");
    var note = button && button.nextElementSibling;
    if (button && note && note.classList.contains("notion-text")) {
      var cta = el("div", "enc-cta");
      button.before(cta);
      cta.appendChild(button);
      cta.appendChild(note);
    }
  }

  /* ── 02 · colour ── */
  function swatch(name, hex, flex) {
    var b = el("button", "enc-swatch");
    b.type = "button";
    b.setAttribute("aria-label", "Copy " + hex);
    b.style.background = hex;
    if (flex) b.setAttribute("data-flex", flex);
    var n = parseInt(hex.slice(1), 16);
    var lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    var fg = lum < 0.55 ? "#FAFAF8" : "#000000";
    b.setAttribute("data-on", lum < 0.55 ? "dark" : "light");
    var label = el("span", "enc-swatch__name", name);
    label.style.color = fg;
    var value = el("span", "enc-swatch__hex", hex);
    value.style.color = fg;
    b.appendChild(label);
    b.appendChild(value);
    b.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(function () {});
      var was = value.textContent;
      value.textContent = "Copied";
      setTimeout(function () { value.textContent = was; }, 1200);
    });
    return b;
  }

  function colour() {
    var db = byId(COLOUR);
    var band = db && db.closest(".enc-band__body");
    if (!band || band.querySelector(".enc-swatches")) return;
    var cards = rowsOf(COLOUR);
    if (!cards.length) return;
    var rows = cards.map(function (c) {
      var title = c.querySelector(".notion-property__title");
      return {
        name: title ? title.textContent.trim() : "",
        hex: (c.textContent.match(/#[0-9a-fA-F]{6}/) || [""])[0],
        set: fieldOf(c, /^(Brand|Pastel)$/i)
      };
    }).filter(function (r) { return r.hex; });

    var brand = el("div", "enc-swatches");
    brand.setAttribute("data-set", "brand");
    var FLEX = { "#000000": "62", "#99CC66": "38" };   // the handoff's own split
    rows.filter(function (r) { return /^brand$/i.test(r.set); })
      .forEach(function (r) { brand.appendChild(swatch(r.name, r.hex, FLEX[r.hex.toUpperCase()])); });

    var pastel = el("div", "enc-swatches");
    pastel.setAttribute("data-set", "pastel");
    rows.filter(function (r) { return /^pastel$/i.test(r.set); })
      .forEach(function (r) { pastel.appendChild(swatch(r.name, r.hex)); });

    band.insertBefore(brand, band.firstChild);

    // the pastel set's own label and note sit above its strip
    var ps = textsOf(band);
    var group = el("div", "enc-pastel");
    if (ps[0] && ps[1]) {
      var headRow = el("div", "enc-pastel-head");
      ps[0].before(group);
      headRow.appendChild(ps[0]);
      headRow.appendChild(ps[1]);
      group.appendChild(headRow);
    } else {
      band.appendChild(group);
    }
    group.appendChild(pastel);
    hide(db);
  }

  /* ── 03 · type ── */
  function faces() {
    var band = document.querySelector('.enc-band[data-band="3"] .enc-band__body');
    if (!band || band.querySelector(".enc-face")) return;
    var ps = textsOf(band);
    var specimen = ps[0] ? ps[0].textContent.trim() : "";
    if (!specimen) return;
    var n = 0;
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].textContent.trim() !== specimen) continue;
      n++;
      var row = el("div", "enc-face");
      row.setAttribute("data-face", String(n));
      ps[i].before(row);
      row.appendChild(ps[i]);
      var meta = el("span", "enc-face__meta");
      if (ps[i + 1]) meta.appendChild(ps[i + 1]);
      if (ps[i + 2]) meta.appendChild(ps[i + 2]);
      row.appendChild(meta);
      i += 2;
    }
    // what is left is the fourth face: a kicker, a name with its one job, and the paragraph
    var rest = textsOf(band);
    if (rest.length < 4) return;
    var fourth = el("div", "enc-fourth");
    rest[0].before(fourth);
    fourth.appendChild(rest[0]);
    var pair = el("div", "enc-fourth__row");
    pair.appendChild(rest[1]);
    pair.appendChild(rest[2]);
    fourth.appendChild(pair);
    fourth.appendChild(rest[3]);
  }

  /* ── 04 · the rules ── */
  function rules() {
    var band = document.querySelector('.enc-band[data-band="4"] .enc-band__body');
    if (!band || band.querySelector(".enc-rules")) return;
    var ps = textsOf(band);
    if (ps.length < 8) return;
    var box = el("div", "enc-rules");
    ps[0].before(box);
    box.appendChild(el("div", "enc-rules__art"));
    var list = el("div", "enc-rules__list");
    for (var i = 0; i + 1 < ps.length; i += 2) {
      var rule = el("div", "enc-rule");
      rule.appendChild(ps[i]);
      rule.appendChild(ps[i + 1]);
      list.appendChild(rule);
    }
    box.appendChild(list);
  }

  function build() { cover(); bands(); marks(); colour(); faces(); rules(); }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) {
      return m.target.closest && m.target.closest(".enc-marks, .enc-swatches, .enc-face, .enc-rules");
    })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
