/* Page covers — design "Page Covers Chosen". Linked from the SITE Head, so it runs on every page.

   Draws the decorative field behind each inner page's cover (main.css §14 lays out the words,
   which stay in Notion). The page is picked by its path; any other page is left alone.

     /networks           9a  Scatter            the chain marks, sized by tier
     /contact-us         8a  Two voices
     /investments        3c  Position row
     /governance-record  2c  Vote columns
     /brand              6a  Mark and swatches
     /blog               5b  Offset posts
     /security           7l  Separate signers
     /guides             4h  Three screens
     /services           1m  Quarters into circles

   Every composition is the design's own numbers: a 924×540 box, each mark placed and sized in %
   of it. A mark with a 3px paper ring keeps the ring in px, as in the design. */
(function () {
  // PAPER is the ground: knock-outs and the 3px rings are holes, so they take the cover's own
  // background colour (read in apply), not the design file's #FAFAF8
  var PAPER = "#FAFAF8", INK = "#000", INK7 = "#3A3D38";
  var P = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var DEEP = ["#B4D98F", "#E8CB72", "#A3C3EC", "#EDB98A", "#E9A9C2"];
  var AR = 924 / 540;
  var ASSETS = "https://assets.super.so/d7300a44-6aa9-4b9e-a149-0076eb69ca9d/images/";
  var script = document.currentScript;
  var BASE = script && /\/dist\/covers\.js/.test(script.src) ? script.src.replace(/\/dist\/covers\.js.*$/, "/") : null;

  /* THE CHAIN GLYPHS COME FROM NOTION. Each row of the Networks database has a Files property
     "Cover" holding one PNG, and Super renders it as the card's cover in the gallery further down
     /networks. glyphFromPage() reads those cards: the card's title gives the chain, its cover img
     gives the file. Super serves covers through its optimizer (/_next/image?url=…&w=…&q=75), which
     is where the blur came from, so the original URL is taken back out of the `url` parameter.
     Change a Cover in Notion and this follows; the list below is only the fallback for a chain the
     gallery does not show (a testnet-only view, a card not yet rendered). */
  var GLYPH = {
    "03-sui": "b062f37e-70a0-42af-af3e-8ae6d97229b5",
    "05-near": "f9b6c438-05de-48cf-9336-985c6eadc27a",
    "02-monad": "38b7a01d-5a61-4753-be4e-ff55db92e9bb",
    "25-avalanche": "b43c6eaa-e6e0-4a28-a31a-9e534a48ea40",
    "06-axelar": "74db3773-90e2-4f47-8c86-91286f395b6e",
    "08-iota": "ee120fb1-d86a-4d9b-82bb-2eb7aeabdfbe",
    "24-mina": "e3e426e5-629d-4e25-9723-babe652f938a",
    "13-starknet": "ce36fcc4-ea56-456f-8e6f-1ac07f059c86",
    "09-terra": "9a0436bb-aec3-4324-bc22-dca8a9880328",
    "04-zilliqa": "c0d369b5-d804-4d10-adff-113414ff4a95",
    "01-avail": "2671f960-cb63-4fae-a1c5-0d9015e092df",
    "12-espresso-systems": "28c3a599-1cd4-4582-93b5-c68a005537ed",
    "11-ika": "3420a833-ec9f-4d83-ba18-1a85c8209174",
    "14-supra": "1c8006b2-a450-4246-af2e-ea99a851420c",
    "10-vara": "c79bfe46-8840-470e-bc80-603c820393dd",
    "16-agoric": "1e8191be-4e3e-4bc1-be4e-61844b33779f",
    "07-althea": "0f5ad2ad-9176-4ec8-abab-c862f341f4d5",
    "19-gitopia": "16f82770-95af-4ddb-97f1-c16436594a6e",
    "15-gravity-bridge": "ecc431fd-9214-4c32-a04f-dbfaa7c09d1a",
    "17-humans-ai": "f315b351-32a1-4249-b32b-21a54e54161b",
    "18-ixo": "15e2319c-96a3-46f6-a94e-1023185df79b",
    "23-lumera": "de6b81a4-31e3-43e3-bc0f-071a94cb6d73",
    "21-passage": "9e1e8719-01e2-4766-ac11-f205a0aea2d2",
    "22-sommelier": "7d36b978-ca89-4a16-b4f6-7f7ef07f9f7f"
  };

  // "03-sui" → "sui", "Gravity Bridge" → "gravitybridge": one key for a file name and a card title
  function key(text) {
    return String(text).toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/^\d+[-_]/, "").replace(/[^a-z0-9]/g, "");
  }

  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }

  // The "Networks set" database (2026-09-16) is the source; anything else on the page is a
  // fallback, so a second gallery cannot win by rendering first.
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";

  function glyphFromPage() {
    var out = {};
    var set = document.getElementById(SET_DB);
    var cards = (set ? Array.prototype.slice.call(set.querySelectorAll(".notion-collection-card")) : [])
      .concat(Array.prototype.slice.call(document.querySelectorAll(".notion-collection-card")));
    cards.forEach(function (card) {
      var cover = card.querySelector("img.notion-collection-card__cover, .notion-collection-card__cover img");
      var title = card.querySelector(".notion-property__title, .notion-collection-card__title");
      if (!cover || !title) return;
      var k = key(title.textContent.trim());
      if (k && !out[k]) out[k] = original(cover.currentSrc || cover.src);
    });
    return out;
  }

  function el(tag, style) {
    var e = document.createElement(tag);
    for (var k in style) e.style[k] = style[k];
    return e;
  }

  // disc: centre and diameter in % of the box
  function d(cx, cy, dm, fill, o) {
    o = o || {};
    return el("div", { left: cx + "%", top: cy + "%", width: dm + "%", aspectRatio: "1",
      transform: "translate(-50%, -50%)", borderRadius: "999px", background: fill,
      boxShadow: o.bare ? "none" : "0 0 0 3px " + PAPER, zIndex: o.z || 1 });
  }
  // ring: a disc with a paper disc knocked out
  function rg(cx, cy, dm, inner, fill) {
    return [d(cx, cy, dm, fill, { bare: true }), d(cx, cy, inner, PAPER, { bare: true })];
  }
  // square: s% of the width, so its height is s × AR % of the height
  function sq(cx, cy, s, r, fill, o) {
    return el("div", { left: cx + "%", top: cy + "%", width: s + "%", height: s * AR + "%",
      transform: "translate(-50%, -50%)", borderRadius: r, background: fill, zIndex: (o && o.z) || 1 });
  }
  function rect(cx, cy, w, h, r, fill, o) {
    return el("div", { left: cx + "%", top: cy + "%", width: w + "%", height: h + "%",
      transform: "translate(-50%, -50%)", borderRadius: typeof r === "number" ? r + "px" : r,
      background: fill, zIndex: (o && o.z) || 1 });
  }
  function barB(cx, bottom, w, h, r, fill) {
    return el("div", { left: cx + "%", bottom: bottom + "%", width: w + "%", height: h + "%",
      transform: "translateX(-50%)", borderRadius: r, background: fill });
  }
  function img(src, style) {
    var i = el("img", style);
    i.src = src;
    i.alt = "";
    i.decoding = "async";
    return i;
  }

  var FIELDS = {
    // 9a · Scatter — random placement, near-zero overlap, drifting out into the corners
    "/networks": function () {
      var D = { god: 168, high: 126, medium: 96, low: 76 }, Z = { god: 4, high: 3, medium: 2, low: 1 };
      var MARKS = [
        ["03-sui", 0.885, 0.406, "god"], ["05-near", 0.946, 0.908, "god"],
        ["02-monad", 0.585, 0.541, "god"], ["25-avalanche", 0.526, 0.092, "god"],
        ["06-axelar", 0.958, 0.642, "high"], ["08-iota", 0.765, 0.928, "high"],
        ["24-mina", 0.782, 0.072, "high"], ["13-starknet", 0.590, 0.809, "high"],
        ["09-terra", 0.740, 0.526, "high"], ["04-zilliqa", 0.420, 0.899, "high"],
        ["01-avail", 0.967, 0.057, "medium"], ["12-espresso-systems", 0.676, 0.358, "medium"],
        ["11-ika", 0.665, 0.057, "medium"], ["14-supra", 0.840, 0.634, "medium"],
        ["10-vara", 0.887, 0.165, "medium"], ["16-agoric", 0.789, 0.255, "low"],
        ["07-althea", 0.760, 0.742, "low"], ["19-gitopia", 0.523, 0.952, "low"],
        ["15-gravity-bridge", 0.632, 0.220, "low"], ["17-humans-ai", 0.713, 0.211, "low"],
        ["18-ixo", 0.658, 0.952, "low"], ["23-lumera", 0.972, 0.222, "low"],
        ["21-passage", 0.317, 0.952, "low"], ["22-sommelier", 0.836, 0.790, "low"]
      ];
      var fromPage = glyphFromPage();
      return MARKS.map(function (m, i) {
        var w = d(m[1] * 100, m[2] * 100, D[m[3]] / 924 * 100, P[i % 5], { z: Z[m[3]] });
        w.style.display = "grid";
        w.style.placeItems = "center";
        var src = fromPage[key(m[0])] || (GLYPH[m[0]] && ASSETS + GLYPH[m[0]] + "/" + m[0] + ".png");
        if (src) w.appendChild(img(src, { position: "static", width: "52%", height: "52%", objectFit: "contain" }));
        return w;
      });
    },

    // 8a · Two voices
    "/contact-us": function () {
      return [d(70, 40, 28, P[0], { z: 2 }), d(85, 60, 26, P[2], { z: 3 }),
        d(62, 70, 11, P[3]), d(94, 30, 9, P[1]), d(76, 82, 7, P[4])];
    },

    // 3c · Position row
    "/investments": function () {
      return [26, 21, 17, 13, 10, 7].map(function (s, i) {
        return d(62 + i * 6.8, 50, s, P[i % 5], { z: 10 - i });
      });
    },

    // 2c · Vote columns — one column per chain, height = its count
    "/governance-record": function () {
      var VOTES = [7, 5, 8, 4, 6, 8, 3, 7], max = Math.max.apply(null, VOTES);
      return VOTES.map(function (n, i) {
        return barB(58 + i * 5.6, 16, 4.2, n / max * 72, "999px 999px 0 0", P[i % 5]);
      });
    },

    // 6a · Mark and swatches
    "/brand": function () {
      var out = [0, 1, 2, 3, 4].map(function (i) { return sq(60 + i * 9, 72, 7.4, "4px", P[i]); });
      if (BASE) out.unshift(img(BASE + "svg/mark-a.svg",
        { left: "76%", top: "32%", width: "17%", transform: "translate(-50%, -50%)", zIndex: 5 }));
      return out;
    },

    // 5b · Offset posts
    "/blog": function () {
      return [0, 1, 2].map(function (i) { return rect(68 + i * 7, 30 + i * 16, 34, 26, "4px", P[i % 5], { z: i + 1 }); });
    },

    // 7l · Separate signers — five share positions, three filled, each by a different signer
    "/security": function () {
      var out = [d(76, 50, 26, P[1], { bare: true })];
      [0, 1, 2, 3, 4].forEach(function (i) {
        var t = (i * 72 - 90) * Math.PI / 180;
        var x = 76 + 13 * Math.cos(t), y = 50 + 13 * Math.sin(t) * 1.71;
        out.push(i < 3 ? d(x, y, 7.2, [DEEP[2], DEEP[4], DEEP[0]][i], { z: 3 })
          : d(x, y, 7.2, PAPER, { bare: true, z: 3 }));
      });
      out.push(d(76, 50, 9, PAPER, { bare: true, z: 2 }));
      return out;
    },

    // 4h · Three screens, the last one green
    "/guides": function () {
      return [
        rect(66, 52, 13, 46, 10, P[2]), rect(80, 48, 13, 46, 10, P[1]), rect(94, 44, 13, 46, 10, P[0]),
        d(66, 34, 5, PAPER, { bare: true, z: 3 }), d(80, 30, 5, PAPER, { bare: true, z: 3 }),
        d(94, 26, 5, INK, { bare: true, z: 3 })
      ];
    },

    // 1m · Quarters into circles — four quarter discs per 2×2 block, meeting at its centre
    "/services": function () {
      var GX = 62, GY = 24, GS = 10, CORN = ["100% 0 0 0", "0 100% 0 0", "0 0 0 100%", "0 0 100% 0"], out = [];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var blk = Math.floor(r / 2) * 2 + Math.floor(c / 2);
        out.push(sq(GX + c * GS, GY + r * GS * AR, GS, CORN[(r % 2) * 2 + (c % 2)], P[blk % 5]));
      }
      return out;
    }
  };

  // the cover fills the rest of the first screen, below the navbar and any banner above it
  function setVar(el, name, value) {
    if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
  }

  function measure(cover) {
    setVar(cover, "--cover-top", Math.round(cover.getBoundingClientRect().top + window.scrollY) + "px");
    // the label pairs: each second label starts where its own first label ends (main.css §14)
    var texts = cover.querySelectorAll(":scope > .notion-callout__content > p.notion-text");
    if (texts.length < 5) return;
    if (!cover.hasAttribute("data-enc-pairs")) cover.setAttribute("data-enc-pairs", "");
    setVar(cover, "--cover-pair-top", Math.ceil(texts[0].getBoundingClientRect().width) + "px");
    setVar(cover, "--cover-pair-foot", Math.ceil(texts[3].getBoundingClientRect().width) + "px");
  }

  function apply() {
    var cover = document.querySelector(".notion-root > .notion-callout:first-child");
    if (!cover || !cover.querySelector(":scope > .notion-callout__content > h1.notion-heading")) return;
    measure(cover);
    var path = location.pathname.replace(/\/+$/, "") || "/";
    var build = FIELDS[path];
    if (!build) return;
    if (cover.querySelector(":scope > .enc-cover")) return;
    var ground = getComputedStyle(cover).backgroundColor;
    if (ground && ground !== "rgba(0, 0, 0, 0)" && ground !== "transparent") PAPER = ground;
    var field = document.createElement("div");
    field.className = "enc-cover";
    field.setAttribute("aria-hidden", "true");
    var box = document.createElement("div");
    box.className = "enc-cover__box";
    build().forEach(function (n) { box.appendChild(n); });
    field.appendChild(box);
    cover.insertBefore(field, cover.firstChild);
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(apply, 60); })
    .observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(apply, 100); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
