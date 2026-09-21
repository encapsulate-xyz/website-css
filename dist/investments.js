/* /investments — design "Investments Page".

   Two bands. 01 on ink: the thesis, then the positions as a band of marks that runs, pauses on
   hover, and prints what it is under a rule. 02 on paper: the six questions a founder asks, one
   at a time, with the yes or no as the disc, and the ask at the foot.

   Every word is a Notion block. The positions are the Portfolio database — the script reads the
   cards Super rendered (name, the Category and Validator pills, the year, the logo) and builds
   the band from them, so nothing about a position lives here.

   Loaded from the SITE head: Super does not run a page's own scripts on a client-side
   navigation, so this builds off a MutationObserver like the other page scripts. */
(function () {
  var PATH = /^\/investments\/?$/;
  /* Bumped when the shape this builds changes, so a page still serving an older release from its
     baked site head is unwrapped and built again rather than left as it is. */
  var VERSION = "2";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function textOf(n) { return (n.textContent || "").replace(/\s+/g, " ").trim(); }

  /* Super serves a card's image through its own optimiser; the original is sharper and is what
     the design draws. */
  function original(src) {
    var m = /[?&]url=([^&]+)/.exec(src || "");
    return m ? decodeURIComponent(m[1]) : src;
  }

  function isKicker2(n) { return n.tagName === "P" && /·\s*02$/.test(textOf(n)); }

  /* ── the positions ────────────────────────────────────────────────────────────────────────
     One mark per card, the set repeated once so the run has no seam. The facts come off the
     card: the title, the Category pill, the year, and the Validator pill — which carries its own
     words, so the line under the band is Notion's copy and not this script's. */
  function marks(coll) {
    return Array.prototype.map.call(coll.querySelectorAll(".notion-collection-card"), function (c) {
      /* Super gives a multi-select the same classes as a select, so Tags and Category could not
         be told apart there; Category is a text property and the card's texts are read by shape:
         the year is four digits, the category is the short one, a description is the long one. */
      var val = "";
      Array.prototype.forEach.call(c.querySelectorAll(".notion-property__select"), function (t) {
        if (/validator|not yet/i.test(textOf(t))) val = textOf(t);
      });
      var since = "", cat = "";
      Array.prototype.forEach.call(c.querySelectorAll(".notion-property__text"), function (t) {
        var v = textOf(t);
        if (/validator|not yet/i.test(v)) { val = val || v; return; }
        if (/^\d{4}$/.test(v)) { since = v; return; }
        if (v && v.length <= 28 && (!cat || v.length < cat.length)) cat = v;
      });
      var img = c.querySelector("img");
      return {
        name: textOf(c.querySelector(".notion-property__title")) || textOf(c),
        cat: cat, since: since, val: val, live: /validator/i.test(val),
        src: img ? original(img.getAttribute("src")) : ""
      };
    });
  }

  function wall(list, band) {
    var w = el("div", "enc-inv__wall");
    var track = el("div", "enc-inv__track");
    function mark(m, i, clone) {
      var a = el("div", "enc-inv__mark");
      a.setAttribute("data-enc-i", String(i % 5));
      if (clone) a.setAttribute("aria-hidden", "true");
      else { a.setAttribute("tabindex", "0"); a.setAttribute("aria-label", m.name); }
      if (m.src) {
        var img = el("img");
        img.src = m.src;
        img.alt = "";
        a.appendChild(img);
      } else {
        a.appendChild(el("span", "enc-inv__initial", m.name.slice(0, 2)));
      }
      function on() { show(band, list, i); a.setAttribute("data-enc-hot", ""); }
      function off() { show(band, list, null); a.removeAttribute("data-enc-hot"); }
      a.addEventListener("mouseenter", on);
      a.addEventListener("mouseleave", off);
      a.addEventListener("focus", on);
      a.addEventListener("blur", off);
      return a;
    }
    list.forEach(function (m, i) { track.appendChild(mark(m, i, false)); });
    list.forEach(function (m, i) { track.appendChild(mark(m, i, true)); });
    w.appendChild(track);
    return w;
  }

  /* the line under the band: its rest state is the Notion paragraph, with the count taken from
     the positions actually on the page */
  function show(band, list, i) {
    var line = band.querySelector(".enc-inv__status");
    if (!line) return;
    if (i === null || i === undefined || !list[i]) {
      band.removeAttribute("data-enc-on");
      line.textContent = line.getAttribute("data-enc-rest") || "";
      return;
    }
    var m = list[i];
    band.setAttribute("data-enc-on", "");
    line.textContent = "";
    line.appendChild(el("span", "enc-inv__sname", m.name));
    var meta = m.cat + (m.since ? " · since " + m.since : "");
    if (meta) line.appendChild(el("span", "enc-inv__smeta", meta));
    if (m.val) {
      var v = el("span", "enc-inv__sval");
      if (m.live) v.setAttribute("data-enc-live", "");
      v.appendChild(el("span", "enc-inv__sdot"));
      v.appendChild(el("span", "enc-inv__svlabel", m.val));
      line.appendChild(v);
    }
  }

  /* ── the six questions ────────────────────────────────────────────────────────────────────
     Each is a toggle whose words are "short · the question · Yes|No"; the answer is its body. */
  function pick(band, i) {
    Array.prototype.forEach.call(band.querySelectorAll(".enc-inv__tab"), function (b, j) {
      if (j === i) b.setAttribute("data-enc-on", ""); else b.removeAttribute("data-enc-on");
      b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    Array.prototype.forEach.call(band.querySelectorAll(".enc-inv__panel"), function (p, j) {
      if (j === i) p.setAttribute("data-enc-on", ""); else p.removeAttribute("data-enc-on");
      p.setAttribute("aria-hidden", j === i ? "false" : "true");
    });
    var disc = band.querySelector(".enc-inv__disc");
    var on = band.querySelectorAll(".enc-inv__panel")[i];
    if (disc && on) {
      var yes = on.getAttribute("data-enc-yes") === "1";
      disc.textContent = on.getAttribute("data-enc-verdict") || "";
      if (yes) disc.setAttribute("data-enc-yes", ""); else disc.removeAttribute("data-enc-yes");
    }
  }

  function summary(t) {
    var s = t.querySelector(".notion-toggle__summary .notion-semantic-string");
    return textOf(s || t.querySelector(".notion-toggle__summary") || t);
  }

  /* put the page back the way Super sent it, so a newer script can build from it */
  function unwrap(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".enc-inv__band"), function (b) {
      var flat = [];
      (function walk(n) {
        Array.prototype.forEach.call(n.children, function (c) {
          if (c.id && c.id.indexOf("block-") === 0) flat.push(c);
          else walk(c);
        });
      })(b);
      flat.forEach(function (n) { root.insertBefore(n, b); });
      b.remove();
    });
    Array.prototype.forEach.call(root.querySelectorAll(
      ".enc-inv__wall, .enc-inv__seg, .enc-inv__stage, .enc-inv__ask, .enc-inv__panels"),
      function (n) { n.remove(); });
    Array.prototype.forEach.call(root.querySelectorAll("[class*='enc-inv__']"), function (n) {
      n.className = n.className.split(" ").filter(function (c) {
        return c.indexOf("enc-inv__") !== 0;
      }).join(" ");
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-enc-source]"), function (n) {
      n.removeAttribute("data-enc-source");
    });
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root) return;
    if (root.getAttribute("data-enc-invest") === VERSION) return;
    var kids = Array.prototype.slice.call(root.children).filter(function (n) {
      return !n.classList.contains("notion-heading__anchor");
    });
    if (kids.length < 6) return;
    unwrap(root);
    kids = Array.prototype.slice.call(root.children).filter(function (n) {
      return !n.classList.contains("notion-heading__anchor");
    });

    var start = 1;                                   // the cover stays where covers.js expects it
    var cut = -1;
    kids.forEach(function (n, i) { if (cut < 0 && i >= start && isKicker2(n)) cut = i; });
    if (cut < 0) return;

    function bandOf(from, to, name) {
      var b = el("div", "enc-inv__band");
      b.setAttribute("data-enc-inv", name);
      root.insertBefore(b, kids[from]);
      for (var i = from; i < to; i++) {
        var n = kids[i];
        var prev = n.previousElementSibling;
        if (prev && prev.classList.contains("notion-heading__anchor")) b.appendChild(prev);
        b.appendChild(n);
      }
      return b;
    }
    var one = bandOf(start, cut, "01");
    var two = bandOf(cut, kids.length, "02");

    // ── 01 · the thesis, the band of positions, the line under it
    var coll = one.querySelector(".notion-collection");
    var texts = Array.prototype.filter.call(one.children, function (n) { return n.tagName === "P"; });
    if (texts[0]) texts[0].classList.add("enc-inv__kicker");
    if (texts[1]) texts[1].classList.add("enc-inv__statement");
    if (texts[2]) texts[2].classList.add("enc-inv__lede");
    var status = texts[3];
    if (status) {
      status.classList.add("enc-inv__status");
      status.setAttribute("data-enc-rest", textOf(status));
      status.setAttribute("role", "status");
    }
    if (coll) {
      coll.setAttribute("data-enc-source", "");
      var list = marks(coll);
      if (list.length) {
        if (status) {
          // the count is the positions the page carries, so the line cannot drift from them
          var rest = textOf(status).replace(/\d+/, String(list.length));
          status.setAttribute("data-enc-rest", rest);
          status.textContent = rest;
        }
        one.insertBefore(wall(list, one), status || coll.nextSibling);
      }
    }

    // ── 02 · the questions, one at a time
    var tabs = el("div", "enc-inv__seg");
    tabs.setAttribute("role", "tablist");
    var stage = el("div", "enc-inv__stage");
    var disc = el("span", "enc-inv__disc");
    var panels = el("div", "enc-inv__panels");
    stage.appendChild(disc);
    stage.appendChild(panels);
    var ps = [];
    Array.prototype.slice.call(two.children).forEach(function (n) {
      if (n.tagName === "P") ps.push(n);
      if (!n.classList.contains("notion-toggle")) return;
      var bits = summary(n).split("·").map(function (x) { return x.trim(); });
      var short = bits[0] || "", q = bits[1] || bits[0] || "", verdict = bits[2] || "";
      var i = tabs.children.length;
      var b = el("button", "enc-inv__tab");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.appendChild(el("span", "enc-inv__tn", ("0" + (i + 1)).slice(-2)));
      b.appendChild(el("span", "enc-inv__tt", short));
      b.addEventListener("click", function () { pick(two, i); });
      tabs.appendChild(b);

      var panel = el("div", "enc-inv__panel");
      panel.setAttribute("data-enc-verdict", verdict);
      panel.setAttribute("data-enc-yes", /^yes$/i.test(verdict) ? "1" : "0");
      panel.appendChild(el("span", "enc-inv__q", q));
      var body = n.querySelector(".notion-toggle__content");
      if (body) {
        Array.prototype.slice.call(body.children).forEach(function (c) {
          c.classList.add("enc-inv__a");
          panel.appendChild(c);
        });
      }
      panels.appendChild(panel);
      n.setAttribute("data-enc-source", "");
    });
    if (tabs.children.length) {
      var kicker2 = ps[0];
      if (kicker2) kicker2.classList.add("enc-inv__kicker");
      if (ps[1]) ps[1].classList.add("enc-inv__lede");
      var ask = el("div", "enc-inv__ask");
      var askL = el("div", "enc-inv__askl");
      if (ps[2]) { ps[2].classList.add("enc-inv__asktitle"); askL.appendChild(ps[2]); }
      if (ps[3]) { ps[3].classList.add("enc-inv__asksub"); askL.appendChild(ps[3]); }
      ask.appendChild(askL);
      var cols = two.querySelector(".notion-column-list");
      if (cols) { cols.classList.add("enc-inv__askbtns"); ask.appendChild(cols); }
      two.appendChild(tabs);
      two.appendChild(stage);
      two.appendChild(ask);
      pick(two, 0);
    }

    root.setAttribute("data-enc-invest", VERSION);
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  build();
})();
