/* /security — design "Security Commitments Modern".

   Six bands, in the handoff's order: 01 the commitments, 02 access, 03 keys, 04 failover,
   05 upgrades and response, 06 slashing and the record.

   WHAT NOTION HOLDS. Every word. The page is a flat list of blocks: a kicker paragraph opens each
   band ("Security and operations · 01" … "Slashing and the record · 06"), and the blocks that
   follow belong to it until the next kicker. Rows that carry two or three fields are one paragraph
   with " · " between them, split here. The nine commitments, the five key rules, the five machine
   rules, the four failover steps, the four release steps and the two slashing rows are Notion
   toggles, so their words and their open/closed behaviour are Notion's own.

   WHAT THIS SCRIPT ADDS. The two drawings — the architecture diagram in 02 and the failover stage
   in 04 — and the tabs that drive them. Both are diagrams, not copy: the node labels are the
   drawing's own, the way the page covers' fields are (see CLAUDE.md, "Where each asset comes from").

   Styles: security.css. Loaded from the SITE head, like every other page script, and driven by a
   MutationObserver so a client-side navigation builds it too. */
(function () {
  "use strict";

  var PATH = /^\/security\/?$/;
  var SECTIONS = ["01", "02", "03", "04", "05", "06"];
  /* Bumped whenever the shape this script builds changes. The page carries the version it was
     built with, so a newer script unwraps an older build and does it again rather than finding
     bands already there and leaving them — which is what happens on a page still serving the
     previous release from its baked site head. */
  var VERSION = "3";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function textOf(n) { return (n.textContent || "").replace(/\s+/g, " ").trim(); }

  // the toggle's own words, without the trigger glyph Notion puts beside them
  function label(t) {
    var s = t.querySelector(".notion-toggle__summary .notion-semantic-string");
    return textOf(s || t.querySelector(".notion-toggle__summary") || t);
  }

  /* ── the diagram in 02 ─────────────────────────────────────────────────────────────────────
     Eleven nodes in a grid, the tailnet drawn as a dashed frame around everything that is ours.
     A story lights a set of nodes; everything else dims. Connectors are CSS rules between grid
     cells, so nothing is measured and nothing redraws on resize. */
  var NODES = [
    { id: "net",  area: "1 / 3 / 2 / 10", kicker: "Outside",           title: "The internet", line: "Peers, RPC clients, everything inbound", tint: "dash" },
    { id: "senA", area: "3 / 3 / 4 / 4",  kicker: "Region 1",          title: "Sentries",     line: "Replaceable, re-addressable", tint: "blue" },
    { id: "senB", area: "3 / 7 / 4 / 8",  kicker: "Region 2",          title: "Sentries",     line: "Replaceable, re-addressable", tint: "blue" },
    { id: "full", area: "3 / 9 / 4 / 10", kicker: "Public reads",      title: "Full nodes",   line: "RPC, indexing. Hold nothing.", tint: "orange" },
    { id: "eng",  area: "5 / 1 / 6 / 2",  kicker: "Outside",           title: "An engineer",  line: "Tagged laptop, hardware key", tint: "dash" },
    { id: "valA", area: "5 / 3 / 6 / 4",  kicker: "Primary · signing", title: "Validator A",  line: "Bare metal. Nothing else on it.", tint: "green" },
    { id: "valB", area: "5 / 7 / 6 / 8",  kicker: "Standby · in sync", title: "Validator B",  line: "Bare metal. Waiting for the cosigners.", tint: "paper" },
    { id: "cos1", area: "7 / 3 / 8 / 4",  kicker: "Shard 1",           title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "cos2", area: "7 / 5 / 8 / 6",  kicker: "Shard 2",           title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "cos3", area: "7 / 7 / 8 / 8",  kicker: "Shard 3",           title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "mon",  area: "7 / 9 / 8 / 10", kicker: "Every host",        title: "Monitoring",   line: "auditd, Wazuh, Loki, alerts to a person", tint: "pink" }
  ];

  // the connectors live in the grid's own lanes — the 44px and 24px tracks between the node columns
  var LINKS = [
    { id: "l-net-A",    area: "2 / 3 / 3 / 4",  label: "p2p",   dir: "v" },
    { id: "l-net-B",    area: "2 / 7 / 3 / 8",  label: "p2p",   dir: "v" },
    { id: "l-net-full", area: "2 / 9 / 3 / 10", label: "rpc",   dir: "v" },
    { id: "l-peers-A",  area: "4 / 3 / 5 / 4",  label: "peers", dir: "v" },
    { id: "l-peers-B",  area: "4 / 7 / 5 / 8",  label: "peers", dir: "v" },
    { id: "l-eng",      area: "5 / 2 / 6 / 3",  label: "ssh",   dir: "h" },
    { id: "l-logs",     area: "7 / 8 / 8 / 9",  label: "logs",  dir: "h", dashed: true }
  ];

  // which nodes and which connectors each story lights — the handoff's own sets
  var STORIES = {
    "a block":     { n: ["net", "senA", "senB", "valA", "valB", "cos1", "cos2", "cos3"],
                     l: ["l-net-A", "l-net-B", "l-peers-A", "l-peers-B", "bus", "bus-A"] },
    "a signature": { n: ["cos1", "cos2", "cos3", "valA", "valB"], l: ["bus", "bus-A", "bus-B"] },
    "an engineer": { n: ["eng", "frame", "senA", "senB", "valA", "valB", "cos1", "cos2", "cos3", "full", "mon"],
                     l: ["l-eng", "l-logs"] },
    "an attacker": { n: ["net", "senA", "senB", "full"], l: ["l-net-A", "l-net-B", "l-net-full"] }
  };

  function node(n) {
    var box = el("div", "enc-sec__node");
    box.setAttribute("data-enc-node", n.id);
    if (n.tint) box.setAttribute("data-enc-tint", n.tint);
    box.style.gridArea = n.area;
    box.appendChild(el("span", "enc-sec__nk", n.kicker));
    box.appendChild(el("span", "enc-sec__nt", n.title));
    box.appendChild(el("span", "enc-sec__nl", n.line));
    return box;
  }

  function link(l) {
    var w = el("div", "enc-sec__link");
    w.setAttribute("data-enc-link", l.id);
    w.setAttribute("data-enc-dir", l.dir);
    if (l.dashed) w.setAttribute("data-enc-dashed", "");
    w.style.gridArea = l.area;
    w.appendChild(el("span", "enc-sec__lrule"));
    if (l.label) w.appendChild(el("span", "enc-sec__llabel", l.label));
    return w;
  }

  /* the cosigner bus: a rail under the validators, a stub up to each of them and one down to each
     of the three cosigners. The rail's ends sit over the outer cosigners, a sixth of the free
     width in from either side (three node columns and two 24px gaps). */
  function bus() {
    var b = el("div", "enc-sec__busrail");
    b.style.gridArea = "6 / 3 / 7 / 8";
    var rail = el("span", "enc-sec__brail");
    rail.setAttribute("data-enc-link", "bus");
    b.appendChild(rail);
    [["bus-A", "up", "calc((100% - 48px) / 6)"], ["bus-B", "up", "calc(100% - (100% - 48px) / 6)"],
     ["bus", "down", "calc((100% - 48px) / 6)"], ["bus", "down", "50%"],
     ["bus", "down", "calc(100% - (100% - 48px) / 6)"]].forEach(function (s) {
      var st = el("span", "enc-sec__bstub");
      st.setAttribute("data-enc-link", s[0]);
      st.setAttribute("data-enc-updown", s[1]);
      st.style.left = s[2];
      b.appendChild(st);
    });
    var lab = el("span", "enc-sec__blabel", "out · dials both · 2 of 3");
    lab.setAttribute("data-enc-link", "bus");
    b.appendChild(lab);
    return b;
  }

  function diagram() {
    var d = el("div", "enc-sec__arch");
    d.setAttribute("role", "img");
    d.setAttribute("aria-label",
      "The internet reaches two regions of sentries and the full nodes. Sentries peer privately " +
      "with validator A, live, and validator B, standby. Three cosigners hold shards of the key " +
      "and dial both validators, signing two of three. Every host is on a private tailnet.");
    var frame = el("div", "enc-sec__frame");
    frame.setAttribute("data-enc-node", "frame");
    frame.appendChild(el("span", "enc-sec__frame-label",
      "Private tailnet · firewall on every host, inbound denied by default"));
    d.appendChild(frame);
    LINKS.forEach(function (l) { d.appendChild(link(l)); });
    d.appendChild(bus());
    NODES.forEach(function (n) { d.appendChild(node(n)); });
    var canvas = el("div", "enc-sec__canvas");
    var inner = el("div", "enc-sec__canvin");
    inner.appendChild(d);
    canvas.appendChild(inner);
    return canvas;
  }

  /* ── the keyhole in 03 ────────────────────────────────────────────────────────────────────
     A circle over a shaft, cut out of the ink in paper. Picking a commitment colours the core
     and names it in the shaft; with nothing picked the core is empty and the shaft says so. */
  function keyhole() {
    var h = el("div", "enc-sec__hole");
    h.setAttribute("aria-hidden", "true");
    h.appendChild(el("span", "enc-sec__hshaft"));
    h.appendChild(el("span", "enc-sec__hcircle"));
    var core = el("div", "enc-sec__hcore");
    core.appendChild(el("span", "enc-sec__hnum"));
    h.appendChild(core);
    h.appendChild(el("span", "enc-sec__hlabel", "KEY"));
    var word = el("div", "enc-sec__hword");
    word.appendChild(el("span", "enc-sec__hw"));
    h.appendChild(word);
    return h;
  }

  function openKey(band, keys, i) {
    var has = i !== null && i !== undefined && keys[i];
    band.setAttribute("data-enc-key-on", has ? String(i) : "");
    Array.prototype.forEach.call(band.querySelectorAll("[data-enc-key]"), function (m) {
      if (has && m.getAttribute("data-enc-key") === String(i)) m.setAttribute("data-enc-hot", "");
      else m.removeAttribute("data-enc-hot");
    });
    var num = ("0" + ((i || 0) + 1)).slice(-2);
    band.querySelector(".enc-sec__hnum").textContent = has ? num : "";
    band.querySelector(".enc-sec__kd").textContent = has ? num : "";
    var name = has ? label(keys[i]) : "";
    band.querySelector(".enc-sec__hw").textContent = has ? name : "never assembled";
    band.querySelector(".enc-sec__kn").textContent = name;
    var body = has ? keys[i].querySelector(".notion-toggle__content") : null;
    band.querySelector(".enc-sec__kt").textContent = body ? textOf(body) : "";
  }

  /* ── the stage in 04 ───────────────────────────────────────────────────────────────────────
     The same two hosts and three cosigners, in four states. The step's own words are the Notion
     toggle's; this only draws what is live, standby or lost. */
  var STATES = [
    { a: "live",    b: "standby", note: "signer → host A" },
    { a: "lost",    b: "standby", note: "host A unreachable" },
    { a: "lost",    b: "live",    note: "signer → host B" },
    { a: "standby", b: "live",    note: "host A rejoins · standby" }
  ];

  function stage() {
    var s = el("div", "enc-sec__stage");
    s.setAttribute("aria-hidden", "true");
    function host(k) {
      var h = el("div", "enc-sec__host");
      h.setAttribute("data-enc-host", k);
      h.appendChild(el("span", "enc-sec__hs"));
      h.appendChild(el("span", "enc-sec__ht", k === "a" ? "Host A" : "Host B"));
      return h;
    }
    function wire(k) {
      var w = el("span", "enc-sec__wire");
      w.setAttribute("data-enc-wire", k);
      return w;
    }
    s.appendChild(host("a"));
    s.appendChild(wire("a"));
    s.appendChild(el("div", "enc-sec__signer", "SIGNER"));
    s.appendChild(wire("b"));
    s.appendChild(host("b"));
    return s;
  }

  function setState(root, i) {
    var st = STATES[i] || STATES[0];
    var s = root.querySelector(".enc-sec__stage");
    if (!s) return;
    ["a", "b"].forEach(function (k) {
      var host = s.querySelector('[data-enc-host="' + k + '"]');
      host.setAttribute("data-enc-state", st[k]);
      host.querySelector(".enc-sec__hs").textContent =
        st[k] === "lost" ? "lost" : st[k] === "live" ? "signing" : "in sync";
      var wire = s.querySelector('[data-enc-wire="' + k + '"]');
      if (st[k] === "live") wire.setAttribute("data-enc-on", "");
      else wire.removeAttribute("data-enc-on");
    });
  }

  /* ── grouping ──────────────────────────────────────────────────────────────────────────────
     A kicker paragraph opens a band; everything up to the next kicker belongs to it. */
  function isKicker(n) {
    return /·\s*0[1-6]$/.test(textOf(n));
  }

  function split(n, parts) {
    // the separators are gone once a row is split, so the mark is what a later build reads
    if (n.hasAttribute("data-enc-split")) return true;
    var t = textOf(n);
    var bits = t.split("·").map(function (x) { return x.trim(); });
    if (bits.length < parts) return false;
    n.setAttribute("data-enc-split", String(parts));
    n.textContent = "";
    var names = parts === 3 ? ["term", "verb", "line"] : ["term", "line"];
    if (parts === 3) bits = [bits[0], bits[1], bits.slice(2).join(" · ")];
    bits.forEach(function (b, i) {
      n.appendChild(el("span", "enc-sec__" + names[i], b));
    });
    return true;
  }

  /* A row that has been split has no separators left in it, so a later build cannot recognise it.
     Unwrapping puts the text back the way Notion wrote it — for rows this script marked, and for
     rows an earlier version split before the mark existed. */
  function unsplit(root) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-enc-key]"), function (m) {
      m.removeAttribute("data-enc-key");
      m.removeAttribute("data-enc-hot");
      m.removeAttribute("tabindex");
      if (m.parentNode) m.parentNode.replaceChild(m.cloneNode(true), m);
    });
    Array.prototype.forEach.call(root.querySelectorAll(".enc-sec__row, .enc-sec__fig"), function (n) {
      var bits = Array.prototype.map.call(
        n.querySelectorAll(".enc-sec__term, .enc-sec__verb, .enc-sec__line"), textOf);
      if (bits.length) n.textContent = bits.join(" · ");
      n.removeAttribute("data-enc-split");
      n.classList.remove("enc-sec__row", "enc-sec__fig");
    });
  }

  /* put every Notion block back on the root, so a build can start from the page as Super sent it */
  function unwrap(root) {
    unsplit(root);
    var bands = root.querySelectorAll(".enc-sec__band");
    if (!bands.length) return;
    Array.prototype.forEach.call(bands, function (b) {
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
      ".enc-sec__tabs, .enc-sec__panel, .enc-sec__ledger, .enc-sec__seg, .enc-sec__stage," +
      ".enc-sec__table, .enc-sec__pair, .enc-sec__rail, .enc-sec__rows, .enc-sec__spine," +
      ".enc-sec__figs, .enc-sec__half, .enc-sec__bar, .enc-sec__canvas, .enc-sec__verbs," +
      ".enc-sec__rules, .enc-sec__lhead, .enc-sec__kleft, .enc-sec__kright"), function (n) { n.remove(); });
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root) return;
    if (root.getAttribute("data-enc-security") === VERSION) return;
    unwrap(root);
    var kids = Array.prototype.slice.call(root.children).filter(function (n) {
      return !n.classList.contains("notion-heading__anchor");
    });
    var starts = [];
    kids.forEach(function (n, i) { if (isKicker(n)) starts.push(i); });
    if (starts.length < SECTIONS.length) return;

    starts.forEach(function (from, si) {
      var to = si + 1 < starts.length ? starts[si + 1] : kids.length;
      var band = el("div", "enc-sec__band");
      band.setAttribute("data-enc-sec", SECTIONS[si]);
      root.insertBefore(band, kids[from]);
      for (var i = from; i < to; i++) {
        var n = kids[i];
        var prev = n.previousElementSibling;
        if (prev && prev.classList.contains("notion-heading__anchor")) band.appendChild(prev);
        band.appendChild(n);
      }
      if (si === 0) kids[from].classList.add("enc-sec__kicker");
      else band.firstElementChild.classList.add("enc-sec__kicker");
    });

    /* 01 · the handoff's two columns: a rail that sticks — kicker, headline, lede, the three
       figures under a rule, the CTA — and the nine commitments beside it as one list. */
    var one = root.querySelector('[data-enc-sec="01"]');
    if (one) {
      var rail = el("div", "enc-sec__rail");
      var figs = el("div", "enc-sec__figs");
      var rows = el("div", "enc-sec__rows");
      Array.prototype.slice.call(one.children).forEach(function (n) {
        if (n.classList.contains("notion-toggle")) { rows.appendChild(n); return; }
        if (n.tagName === "P" && !n.classList.contains("enc-sec__kicker") &&
            (n.hasAttribute("data-enc-split") || textOf(n).indexOf("·") > 0) && split(n, 2)) {
          n.classList.add("enc-sec__fig");
          figs.appendChild(n);
          return;
        }
        rail.appendChild(n);
        if (n.classList.contains("notion-callout")) rail.insertBefore(figs, n);
      });
      if (!figs.parentNode) rail.appendChild(figs);
      one.appendChild(rail);
      one.appendChild(rows);
    }

    // 02 · the segmented bar and its caption, the diagram, then the ledger
    var two = root.querySelector('[data-enc-sec="02"]');
    if (two) {
      var rows = el("div", "enc-sec__rules");
      var verbs = el("div", "enc-sec__verbs");
      verbs.setAttribute("role", "tablist");
      var ledger = el("div", "enc-sec__ledger");
      var extra = [];
      var bar = el("div", "enc-sec__bar");
      var tabs = el("div", "enc-sec__tabs");
      tabs.setAttribute("role", "tablist");
      var cap = el("div", "enc-sec__cap");
      var capb = el("span", "enc-sec__capb");
      cap.appendChild(el("span", "enc-sec__capd"));
      capb.appendChild(el("span", "enc-sec__capn"));
      capb.appendChild(el("p", "enc-sec__story"));
      cap.appendChild(capb);
      bar.appendChild(tabs);
      bar.appendChild(cap);
      Array.prototype.slice.call(two.children).forEach(function (n) {
        if (n.classList.contains("notion-toggle")) {
          var name = label(n).toLowerCase();
          var tab = el("button", "enc-sec__tab");
          tab.type = "button";
          tab.setAttribute("role", "tab");
          tab.setAttribute("data-enc-story", name);
          tab.appendChild(el("span", "enc-sec__tn", "0" + (tabs.children.length + 1)));
          tab.appendChild(el("span", "enc-sec__tt", label(n)));
          tab.addEventListener("click", function () { pick(two, name); });
          tabs.appendChild(tab);
          n.classList.add("enc-sec__source");
          return;
        }
        if (n.tagName !== "P" || n.classList.contains("enc-sec__kicker")) return;
        if ((n.hasAttribute("data-enc-split") || textOf(n).indexOf("·") > 0) && split(n, 3)) {
          n.classList.add("enc-sec__row");
          rows.appendChild(n);
          return;
        }
        extra.push(n);
      });
      Array.prototype.forEach.call(rows.querySelectorAll(".enc-sec__row"), function (r, i) {
        var v = r.querySelector(".enc-sec__verb");
        var btn = el("button", "enc-sec__verbbtn");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.setAttribute("data-enc-i", String(i % 5));
        btn.appendChild(el("span", "enc-sec__vd", ("0" + (i + 1)).slice(-2)));
        btn.appendChild(el("span", "enc-sec__vv", v ? textOf(v) : ""));
        btn.addEventListener("click", function () { openRule(rows, i); });
        btn.addEventListener("mouseenter", function () { openRule(rows, i); });
        btn.addEventListener("focus", function () { openRule(rows, i); });
        verbs.appendChild(btn);
        r.setAttribute("data-enc-i", String(i % 5));
        var head = el("div", "enc-sec__head");
        head.appendChild(el("span", "enc-sec__num", ("0" + (i + 1)).slice(-2)));
        var term = r.querySelector(".enc-sec__term");
        if (term) head.appendChild(term);
        r.insertBefore(head, r.firstChild);
      });
      // the last two paragraphs of the band are the ledger's own header; the lede comes first
      if (extra.length > 2) {
        var lhead = el("div", "enc-sec__lhead");
        var pair = extra.slice(-2);
        // the count is the rules the page actually carries, so the line cannot drift from them
        pair[0].textContent = textOf(pair[0]).replace(/\d+/, String(rows.children.length));
        lhead.appendChild(pair[0]);
        lhead.appendChild(pair[1]);
        ledger.appendChild(lhead);
      }
      ledger.appendChild(verbs);
      ledger.appendChild(rows);
      two.appendChild(bar);
      two.appendChild(diagram());
      two.appendChild(ledger);
      pick(two, "a block");
      openRule(rows, 0);
    }

    // 03 · the sentence on the left, the keyhole and the commitment on the right
    var three = root.querySelector('[data-enc-sec="03"]');
    if (three) {
      var kleft = el("div", "enc-sec__kleft");
      var kright = el("div", "enc-sec__kright");
      var keys = [];
      var kextra = [];
      var seenToggle = false;
      Array.prototype.slice.call(three.children).forEach(function (n) {
        if (n.classList.contains("notion-toggle")) {
          seenToggle = true;
          n.classList.add("enc-sec__source");
          keys.push(n);
          return;
        }
        if (seenToggle && n.tagName === "P") { kextra.push(n); return; }
        kleft.appendChild(n);
      });
      var sentence = kleft.querySelector("p.notion-text:not(.enc-sec__kicker)");
      if (sentence) sentence.classList.add("enc-sec__ksent");
      if (kextra[0]) { kextra[0].classList.add("enc-sec__khint"); kleft.appendChild(kextra[0]); }
      kright.appendChild(keyhole());
      var fact = el("div", "enc-sec__kfact");
      fact.setAttribute("role", "status");
      fact.appendChild(el("span", "enc-sec__kd"));
      var fb = el("span", "enc-sec__kb");
      fb.appendChild(el("span", "enc-sec__kn"));
      fb.appendChild(el("span", "enc-sec__kt"));
      fact.appendChild(fb);
      if (kextra[1]) { kextra[1].classList.add("enc-sec__kempty"); fact.appendChild(kextra[1]); }
      kright.appendChild(fact);
      three.appendChild(kleft);
      three.appendChild(kright);
      keys.forEach(function (t) { three.appendChild(t); });

      // the highlighted phrases are Notion's own background colours, in the toggles' order
      if (sentence) {
        var marks = Array.prototype.filter.call(sentence.querySelectorAll("span"), function (sp) {
          if (!textOf(sp)) return false;
          var bg = getComputedStyle(sp).backgroundColor;
          if (!bg || bg === "transparent" || /rgba\(0, 0, 0, 0\)/.test(bg)) return false;
          return !Array.prototype.some.call(sp.querySelectorAll("span"), function (c) {
            var b2 = getComputedStyle(c).backgroundColor;
            return b2 && b2 !== "transparent" && !/rgba\(0, 0, 0, 0\)/.test(b2);
          });
        });
        marks.forEach(function (m, i) {
          m.setAttribute("data-enc-key", String(i));
          m.setAttribute("tabindex", "0");
          m.addEventListener("mouseenter", function () { openKey(three, keys, i); });
          m.addEventListener("mouseleave", function () { openKey(three, keys, null); });
          m.addEventListener("focus", function () { openKey(three, keys, i); });
          m.addEventListener("blur", function () { openKey(three, keys, null); });
        });
      }
      openKey(three, keys, null);
    }

    // 05 · the promises read as label and value
    var five = root.querySelector('[data-enc-sec="05"]');
    if (five) {
      var table = el("div", "enc-sec__table");
      Array.prototype.slice.call(five.children).forEach(function (n) {
        if (n.tagName !== "P" || n.classList.contains("enc-sec__kicker")) return;
        if (!n.hasAttribute("data-enc-split") && textOf(n).indexOf("·") < 0) return;
        if (split(n, 2)) { n.classList.add("enc-sec__row"); table.appendChild(n); }
      });
      if (table.children.length) five.appendChild(table);
      var rail5 = el("div", "enc-sec__rail");
      var spine = el("div", "enc-sec__spine");
      Array.prototype.slice.call(five.children).forEach(function (n) {
        if (n.classList.contains("notion-toggle")) spine.appendChild(n);
        else rail5.appendChild(n);
      });
      five.appendChild(rail5);
      five.appendChild(spine);
    }

    // 06 · the figure and the claim, marked by their own words rather than by position
    var six = root.querySelector('[data-enc-sec="06"]');
    if (six) {
      Array.prototype.forEach.call(six.querySelectorAll(":scope > p.notion-text"), function (n) {
        var t = textOf(n);
        if (t === "0") n.classList.add("enc-sec__zero");
        else if (t === "The seat.") n.classList.add("enc-sec__cost");
        else if (/^What slashing costs/.test(t)) n.classList.add("enc-sec__kicker", "enc-sec__kicker--paper");
      });
      var ink = el("div", "enc-sec__half enc-sec__half--ink");
      var paper = el("div", "enc-sec__half enc-sec__half--paper");
      var side = ink;
      Array.prototype.slice.call(six.children).forEach(function (n) {
        if (n.classList.contains("enc-sec__kicker--paper")) side = paper;
        side.appendChild(n);
      });
      six.appendChild(ink);
      six.appendChild(paper);
    }

    // 04 · the stage stays put while the four steps pile up beside it
    var four = root.querySelector('[data-enc-sec="04"]');
    if (four) {
      var togs = Array.prototype.slice.call(four.querySelectorAll(":scope > .notion-toggle"));
      var msteps = togs.slice(-4);
      if (msteps.length === 4) {
        var mleft = el("div", "enc-sec__mleft");
        var mhead = el("div", "enc-sec__mhead");
        Array.prototype.slice.call(four.children).forEach(function (n) {
          if (!n.classList.contains("notion-toggle")) mhead.appendChild(n);
        });
        var seg = el("div", "enc-sec__seg");
        seg.setAttribute("role", "tablist");
        msteps.forEach(function (n, i) {
          n.classList.add("enc-sec__step");
          n.setAttribute("data-enc-i", String(i));
          n.style.setProperty("--enc-i", String(i));
          n.style.zIndex = String(i + 1);
          var row = el("div", "enc-sec__srow");
          row.appendChild(el("span", "enc-sec__sd", "0" + (i + 1)));
          row.appendChild(el("span", "enc-sec__sn", STATES[i].note));
          n.insertBefore(row, n.firstChild);
          var bt = el("button", "enc-sec__segbtn");
          bt.type = "button";
          bt.setAttribute("role", "tab");
          bt.appendChild(el("span", "enc-sec__segn", "0" + (i + 1)));
          bt.appendChild(el("span", "enc-sec__segt", label(n)));
          bt.addEventListener("click", function () {
            step(four, i);
            var top = n.getBoundingClientRect().top + window.pageYOffset - (STACK_TOP + i * STACK_STEP) + 2;
            window.scrollTo({ top: top, behavior: "smooth" });
          });
          seg.appendChild(bt);
        });
        var field = el("div", "enc-sec__field");
        field.appendChild(stage());
        mleft.appendChild(mhead);
        mleft.appendChild(seg);
        mleft.appendChild(field);
        var mright = el("div", "enc-sec__steps");
        msteps.forEach(function (n) { mright.appendChild(n); });
        mright.appendChild(el("div", "enc-sec__sroom"));
        var mgrid = el("div", "enc-sec__pair");
        mgrid.appendChild(mleft);
        mgrid.appendChild(mright);
        four.appendChild(mgrid);
        step(four, 0);

        /* the step at the top of the pile is the one the stage shows. The tab is hidden while
           this runs, and a hidden tab fires no scroll events, so the sync hangs off an
           observer of the steps themselves rather than off scroll. */
        var sync = function () {
          var pick = 0;
          msteps.forEach(function (n, i) {
            if (n.getBoundingClientRect().top <= STACK_TOP + i * STACK_STEP + 4) pick = i;
          });
          if (four.getAttribute("data-enc-step") !== String(pick)) step(four, pick);
        };
        if (window.IntersectionObserver) {
          var io = new IntersectionObserver(sync, {
            threshold: [0, 0.05, 0.25, 0.5, 0.75, 1],
            rootMargin: "-" + STACK_TOP + "px 0px 0px 0px"
          });
          msteps.forEach(function (n) { io.observe(n); });
        }
      }
    }

    root.setAttribute("data-enc-security", VERSION);
  }

  function pick(band, name) {
    var st = STORIES[name] || { n: [], l: [] };
    var idx = 0;
    var tabs = band.querySelectorAll(".enc-sec__tab");
    Array.prototype.forEach.call(tabs, function (t, i) {
      var on = t.getAttribute("data-enc-story") === name;
      if (on) idx = i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) t.setAttribute("data-enc-on", ""); else t.removeAttribute("data-enc-on");
    });
    Array.prototype.forEach.call(band.querySelectorAll("[data-enc-node]"), function (n) {
      if (st.n.indexOf(n.getAttribute("data-enc-node")) >= 0) n.setAttribute("data-enc-lit", "");
      else n.removeAttribute("data-enc-lit");
    });
    Array.prototype.forEach.call(band.querySelectorAll("[data-enc-link]"), function (n) {
      if (st.l.indexOf(n.getAttribute("data-enc-link")) >= 0) n.setAttribute("data-enc-lit", "");
      else n.removeAttribute("data-enc-lit");
    });
    var src = null;
    Array.prototype.forEach.call(band.querySelectorAll(".enc-sec__source"), function (t) {
      if (label(t).toLowerCase() === name) src = t;
    });
    var cap = band.querySelector(".enc-sec__cap");
    if (cap) {
      cap.setAttribute("data-enc-i", String(idx));
      cap.querySelector(".enc-sec__capd").textContent = "0" + (idx + 1);
      cap.querySelector(".enc-sec__capn").textContent = src ? label(src) : "";
    }
    var story = band.querySelector(".enc-sec__story");
    if (story && src) {
      var body = src.querySelector(".notion-toggle__content");
      story.textContent = body ? textOf(body) : "";
    }
  }

  /* the ledger: the nouns are the index, the rule opens beneath — one panel, every rule stacked
     in the same cell so nothing below it moves when the reader picks another. */
  function openRule(rows, i) {
    Array.prototype.forEach.call(rows.querySelectorAll(".enc-sec__row"), function (r, j) {
      if (j === i) r.setAttribute("data-enc-on", ""); else r.removeAttribute("data-enc-on");
    });
    Array.prototype.forEach.call(rows.parentNode.querySelectorAll(".enc-sec__verbbtn"), function (b, j) {
      if (j === i) b.setAttribute("data-enc-on", ""); else b.removeAttribute("data-enc-on");
      b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
  }

  var STACK_TOP = 56, STACK_STEP = 112;

  function step(band, i) {
    band.setAttribute("data-enc-step", String(i));
    band.querySelectorAll(".enc-sec__segbtn").forEach(function (b, j) {
      if (j === i) b.setAttribute("data-enc-on", ""); else b.removeAttribute("data-enc-on");
      b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    band.querySelectorAll(".enc-sec__step").forEach(function (n, j) {
      if (j === i) n.setAttribute("data-enc-on", ""); else n.removeAttribute("data-enc-on");
    });
    setState(band, i);
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
