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
     02       the brand pair as one strip, then the two grounds with their job lines, then the
              pastel set, each swatch copying its own value on click
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

  /* The cover is one screen from where it starts, and where it starts depends on the navbar and
     on whether the temporary banner is up — so it is measured rather than assumed. */
  function coverTop() {
    var box = byId(COVER);
    if (!box) return;
    var top = Math.round(box.getBoundingClientRect().top + window.scrollY);
    box.style.setProperty("--enc-cover-top", top + "px");
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
  /* Both databases are read as galleries: one card per row, its properties inside it, and its
     Order property deciding the sequence. A view that is a table, or one that hides Order, is a
     Notion setting — ask for it rather than reading around it here. */
  function rowsOf(db) {
    var box = byId(db);
    return box ? Array.prototype.slice.call(box.querySelectorAll(".notion-collection-card")) : [];
  }
  // The file is the File property, shown on the card: Super renders it as a link to the file
  // itself. The gallery needs no cover for this — card preview can be off.
  function fileOf(card) {
    var a = card.querySelector(".notion-property__file a[href]");
    return a ? a.getAttribute("href") : null;
  }
  function fieldOf(card, re) {
    var hit = Array.prototype.slice.call(card.querySelectorAll(".notion-collection-card__property"))
      .map(function (p) { return p.textContent.trim(); })
      .filter(function (t) { return re.test(t); })[0];
    return hit || "";
  }
  function titleOf(card) {
    var t = card.querySelector(".notion-property__title");
    return t ? t.textContent.trim() : "";
  }
  // Notion hands rows back newest first, so the sequence is the database's own Order property
  function orderOf(card) {
    var n = fieldOf(card, /^\d+$/);
    return n ? parseInt(n, 10) : 99;
  }
  // The Job property is a sentence, so it is the one property that is not a hex, a set name or a
  // number. A view with Job switched off simply gives no line — the swatch still reads.
  function jobOf(card) {
    return Array.prototype.slice.call(card.querySelectorAll(".notion-collection-card__property"))
      .filter(function (p) { return !p.classList.contains("notion-property__title"); })
      .map(function (p) { return p.textContent.trim(); })
      .filter(function (t) {
        return t && !/^#[0-9a-fA-F]{6}$/.test(t) && !/^(Brand|Pastel|Ground)$/i.test(t) &&
          !/^\d+$/.test(t);
      })[0] || "";
  }
  function inOrder(list) {
    return list.slice().sort(function (a, b) { return a.order - b.order; });
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
      return {
        name: titleOf(c),
        kind: fieldOf(c, /^(Mark|Wordmark)$/i),
        ground: fieldOf(c, /^(Light|Ink|Green)$/i),
        order: orderOf(c),
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

        // the file is drawn as it is: each one is already coloured for the ground it belongs to
        var art = el("img", "enc-marks__art");
        if (file && file.href) art.src = file.href;
        art.alt = "";
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
  function swatch(name, hex, flex, job) {
    var b = el("button", "enc-swatch");
    b.type = "button";
    b.setAttribute("aria-label", "Copy " + name + " " + hex);
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
    // a ground swatch carries its one-line job under the name, so the value is never picked by eye
    if (job) {
      b.setAttribute("data-kind", "job");
      var head = el("span", "enc-swatch__head");
      head.appendChild(label);
      var line = el("span", "enc-swatch__job", job);
      line.style.color = fg;
      head.appendChild(line);
      b.appendChild(head);
    } else {
      b.appendChild(label);
    }
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
      return {
        name: titleOf(c),
        hex: (c.textContent.match(/#[0-9a-fA-F]{6}/) || [""])[0],
        set: fieldOf(c, /^(Brand|Pastel|Ground)$/i),
        job: jobOf(c),
        order: orderOf(c)
      };
    }).filter(function (r) { return r.hex; });

    var brand = el("div", "enc-swatches");
    brand.setAttribute("data-set", "brand");
    var FLEX = { "#000000": "62", "#99CC66": "38" };   // the handoff's own split
    inOrder(rows).filter(function (r) { return /^brand$/i.test(r.set); })
      .forEach(function (r) { brand.appendChild(swatch(r.name, r.hex, FLEX[r.hex.toUpperCase()])); });

    var ground = el("div", "enc-swatches");
    ground.setAttribute("data-set", "ground");
    inOrder(rows).filter(function (r) { return /^ground$/i.test(r.set); })
      .forEach(function (r) { ground.appendChild(swatch(r.name, r.hex, null, r.job || " ")); });

    var pastel = el("div", "enc-swatches");
    pastel.setAttribute("data-set", "pastel");
    inOrder(rows).filter(function (r) { return /^pastel$/i.test(r.set); })
      .forEach(function (r) { pastel.appendChild(swatch(r.name, r.hex)); });

    band.insertBefore(brand, band.firstChild);

    // each set has its own label and the line beside it: the grounds first, then the pastels.
    // The texts are Notion's, in the page's order — a missing pair drops that group's head only.
    var ps = textsOf(band);
    function group(strip, head, note) {
      var box = el("div", "enc-pastel");
      if (head && note) {
        var headRow = el("div", "enc-pastel-head");
        head.before(box);
        headRow.appendChild(head);
        headRow.appendChild(note);
        box.appendChild(headRow);
      } else {
        band.appendChild(box);
      }
      box.appendChild(strip);
    }
    if (ground.children.length) group(ground, ps[0], ps[1]);
    group(pastel, ps[ground.children.length ? 2 : 0], ps[ground.children.length ? 3 : 1]);
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

  /* This file is loaded from the site head, so it must say where it applies: bands() wraps any
     top-level heading into a spread, and without this it was rebuilding /contact-us and every
     other page's headings too. */
  function build() {
    if (!/^\/brand\/?$/.test(location.pathname)) return;
    cover(); coverTop(); bands(); marks(); colour(); faces(); rules();
  }

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
  window.addEventListener("resize", coverTop);
})();
