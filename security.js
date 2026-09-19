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

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function textOf(n) { return (n.textContent || "").replace(/\s+/g, " ").trim(); }

  /* ── the diagram in 02 ─────────────────────────────────────────────────────────────────────
     Eleven nodes in a grid, the tailnet drawn as a dashed frame around everything that is ours.
     A story lights a set of nodes; everything else dims. Connectors are CSS rules between grid
     cells, so nothing is measured and nothing redraws on resize. */
  var NODES = [
    { id: "net",  area: "net",  kicker: "Outside",          title: "The internet", line: "Peers, RPC clients, everything inbound", tint: "" },
    { id: "senA", area: "senA", kicker: "Region 1",         title: "Sentries",     line: "Replaceable, re-addressable", tint: "blue" },
    { id: "senB", area: "senB", kicker: "Region 2",         title: "Sentries",     line: "Replaceable, re-addressable", tint: "blue" },
    { id: "full", area: "full", kicker: "Public reads",     title: "Full nodes",   line: "RPC, indexing. Hold nothing.", tint: "orange" },
    { id: "eng",  area: "eng",  kicker: "Outside",          title: "An engineer",  line: "Tagged laptop, hardware key", tint: "" },
    { id: "valA", area: "valA", kicker: "Primary · signing", title: "Validator A", line: "Bare metal. Nothing else on it.", tint: "green" },
    { id: "valB", area: "valB", kicker: "Standby · in sync", title: "Validator B", line: "Bare metal. Waiting for the cosigners.", tint: "paper" },
    { id: "cos1", area: "cos1", kicker: "Shard 1",          title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "cos2", area: "cos2", kicker: "Shard 2",          title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "cos3", area: "cos3", kicker: "Shard 3",          title: "Cosigner",     line: "Own host. No inbound.", tint: "yellow" },
    { id: "mon",  area: "mon",  kicker: "Every host",       title: "Monitoring",   line: "auditd, Wazuh, Loki, alerts to a person", tint: "pink" }
  ];

  // which nodes each story lights — the handoff's own sets
  var STORIES = {
    "a block":     ["net", "senA", "senB", "valA", "valB", "cos1", "cos2", "cos3"],
    "a signature": ["cos1", "cos2", "cos3", "valA", "valB"],
    "an engineer": ["eng", "frame", "senA", "senB", "valA", "valB", "cos1", "cos2", "cos3", "full", "mon"],
    "an attacker": ["net", "senA", "senB", "full"]
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
    NODES.forEach(function (n) { d.appendChild(node(n)); });
    ["p2p-a", "p2p-b", "rpc", "peers-a", "peers-b", "ssh", "bus", "logs"].forEach(function (k) {
      var l = el("span", "enc-sec__link");
      l.setAttribute("data-enc-link", k);
      d.appendChild(l);
    });
    return d;
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
    ["a", "b"].forEach(function (k) {
      var host = el("div", "enc-sec__host");
      host.setAttribute("data-enc-host", k);
      host.appendChild(el("span", "enc-sec__hk", k === "a" ? "Region 1" : "Region 2"));
      host.appendChild(el("span", "enc-sec__ht", k === "a" ? "Validator A" : "Validator B"));
      host.appendChild(el("span", "enc-sec__hs"));
      s.appendChild(host);
    });
    var bus = el("div", "enc-sec__bus");
    for (var i = 1; i <= 3; i++) {
      var c = el("span", "enc-sec__cos", "Shard " + i);
      bus.appendChild(c);
    }
    s.appendChild(bus);
    s.appendChild(el("span", "enc-sec__note"));
    return s;
  }

  function setState(root, i) {
    var st = STATES[i] || STATES[0];
    var s = root.querySelector(".enc-sec__stage");
    if (!s) return;
    s.querySelector('[data-enc-host="a"]').setAttribute("data-enc-state", st.a);
    s.querySelector('[data-enc-host="b"]').setAttribute("data-enc-state", st.b);
    s.querySelector('[data-enc-host="a"] .enc-sec__hs').textContent = st.a;
    s.querySelector('[data-enc-host="b"] .enc-sec__hs').textContent = st.b;
    s.querySelector(".enc-sec__note").textContent = st.note;
  }

  /* ── grouping ──────────────────────────────────────────────────────────────────────────────
     A kicker paragraph opens a band; everything up to the next kicker belongs to it. */
  function isKicker(n) {
    return /·\s*0[1-6]$/.test(textOf(n));
  }

  function split(n, parts) {
    var t = textOf(n);
    var bits = t.split("·").map(function (x) { return x.trim(); });
    if (bits.length < parts) return false;
    n.textContent = "";
    var names = parts === 3 ? ["term", "verb", "line"] : ["term", "line"];
    if (parts === 3) bits = [bits[0], bits[1], bits.slice(2).join(" · ")];
    bits.forEach(function (b, i) {
      n.appendChild(el("span", "enc-sec__" + names[i], b));
    });
    return true;
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root || root.querySelector(".enc-sec__band")) return;
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

    // 01 · the three figures read as figure and label
    var one = root.querySelector('[data-enc-sec="01"]');
    if (one) {
      Array.prototype.forEach.call(one.querySelectorAll(":scope > p.notion-text"), function (p) {
        if (p.classList.contains("enc-sec__kicker")) return;
        if (split(p, 2)) p.classList.add("enc-sec__fig");
      });
    }

    // 02 · the ledger rows, then the diagram and its tabs
    var two = root.querySelector('[data-enc-sec="02"]');
    if (two) {
      var rows = el("div", "enc-sec__ledger");
      var tabs = el("div", "enc-sec__tabs");
      tabs.setAttribute("role", "tablist");
      var panel = el("div", "enc-sec__panel");
      var story = el("p", "enc-sec__story");
      Array.prototype.slice.call(two.children).forEach(function (n) {
        if (n.classList.contains("notion-toggle")) {
          var name = textOf(n.querySelector(".notion-toggle__summary") || n).toLowerCase();
          var tab = el("button", "enc-sec__tab", textOf(n.querySelector(".notion-toggle__summary") || n));
          tab.type = "button";
          tab.setAttribute("role", "tab");
          tab.setAttribute("data-enc-story", name);
          tab.addEventListener("click", function () { pick(two, name); });
          tabs.appendChild(tab);
          n.classList.add("enc-sec__source");
          return;
        }
        if (n.tagName === "P" && !n.classList.contains("enc-sec__kicker") && textOf(n).indexOf("·") > 0) {
          if (split(n, 3)) { n.classList.add("enc-sec__row"); rows.appendChild(n); }
        }
      });
      panel.appendChild(diagram());
      panel.appendChild(story);
      two.appendChild(tabs);
      two.appendChild(panel);
      two.appendChild(rows);
      pick(two, "a block");
    }

    // 05 · the promises read as label and value
    var five = root.querySelector('[data-enc-sec="05"]');
    if (five) {
      var table = el("div", "enc-sec__table");
      Array.prototype.slice.call(five.children).forEach(function (n) {
        if (n.tagName !== "P" || n.classList.contains("enc-sec__kicker")) return;
        if (textOf(n).indexOf("·") < 0) return;
        if (split(n, 2)) { n.classList.add("enc-sec__row"); table.appendChild(n); }
      });
      if (table.children.length) five.appendChild(table);
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
    }

    // 04 · the failover steps drive the stage
    var four = root.querySelector('[data-enc-sec="04"]');
    if (four) {
      var togs = Array.prototype.slice.call(four.querySelectorAll(":scope > .notion-toggle"));
      var steps = togs.slice(5);           // the first five are the machine rules
      if (steps.length === 4) {
        var seg = el("div", "enc-sec__seg");
        seg.setAttribute("role", "tablist");
        var st = stage();
        steps.forEach(function (n, i) {
          n.classList.add("enc-sec__step");
          var b = el("button", "enc-sec__segbtn");
          b.type = "button";
          b.setAttribute("role", "tab");
          b.appendChild(el("span", "enc-sec__segn", "0" + (i + 1)));
          b.appendChild(el("span", "enc-sec__segt", textOf(n.querySelector(".notion-toggle__summary") || n)));
          b.addEventListener("click", function () { step(four, i); });
          seg.appendChild(b);
        });
        four.appendChild(seg);
        four.appendChild(st);
        steps.forEach(function (n) { four.appendChild(n); });
        step(four, 0);
      }
    }

    root.setAttribute("data-enc-security", "");
  }

  function pick(band, name) {
    var lit = STORIES[name] || [];
    band.querySelectorAll(".enc-sec__tab").forEach(function (t) {
      var on = t.getAttribute("data-enc-story") === name;
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) t.setAttribute("data-enc-on", ""); else t.removeAttribute("data-enc-on");
    });
    band.querySelectorAll("[data-enc-node]").forEach(function (n) {
      if (lit.indexOf(n.getAttribute("data-enc-node")) >= 0) n.setAttribute("data-enc-lit", "");
      else n.removeAttribute("data-enc-lit");
    });
    var src = null;
    band.querySelectorAll(".enc-sec__source").forEach(function (t) {
      if (textOf(t.querySelector(".notion-toggle__summary") || t).toLowerCase() === name) src = t;
    });
    var story = band.querySelector(".enc-sec__story");
    if (story && src) {
      var body = src.querySelector(".notion-toggle__content");
      story.textContent = body ? textOf(body) : "";
    }
  }

  function step(band, i) {
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
