/* /services — design "Services Categories Chosen" (2026-09-23).

   Under the cover, four services and the ask, each in the form the design gave it:
     01 Dashboards   on ink, a 260vh run in which each dashboard zooms up from a thumbnail, then
                     dives out behind the next; pills jump to a board
     02 Playbooks    seven pastel step cards that pin and pile, then the repositories as one big
                     count with the list as marginalia and a line under it for the one hovered
     03 Bots         two grounds — the chain's log on ink, Discord on paper — and the post on the
                     seam; "See it land" plays one event across
     04 Monitoring   on ink, the sentence with a hole: pick a word and it fills, with where we
                     built it before
        The ask      "Your chain" beside the Networks set, one tile per chain sized by its tier

   Every word is Notion's. A band is a callout on the page (read by id): its Heading 2, its texts,
   its buttons, and for Playbooks the steps as Heading 3 + text pairs. The rows are four inline
   databases read as tables, each the first collection after its band — Dashboards, Playbooks,
   Bot events, Monitoring builds — by their header labels, sorted by Order. The words a script
   puts on a state ("See it land", "{name} trusts us") are a "Services page copy" toggle, the
   same as the guides' and the posts'. The ask's tiles are a linked view of the Networks set,
   found by content (the collection whose rows carry a tier).

   Each built band is inserted right after its source callout, and the callout is folded to no
   height rather than hidden, so a link to it (`/services#block-…`, the navbar's section links,
   the cover's "See services") still lands on the band.

   Loaded from the SITE head, like every page script: Super does not run a page's own scripts on
   a client-side navigation, so this builds off a MutationObserver. */
(function () {
  var PATH = /^\/services\/?$/;
  var VERSION = "1";
  var BANDS = {
    dash: "3e4e800a513881cf8a82c41c2f9f8c78",
    steps: "3e4e800a513881719a14e42a6532c579",
    repos: "3e4e800a513881f4bad1ce44c3aa76b5",
    bots: "3e4e800a513881598024c57e15cbd370",
    mon: "3e4e800a51388115ac0dd17fb46b383d",
    ask: "3e4e800a51388156899be268583259ca"
  };

  /* the fallback if the "Services page copy" toggle goes missing */
  var CONTENT = {
    "open dashboard": "Open the {name} dashboard",
    "show dashboard": "Show the {name} dashboard",
    "dashboard image": "The {name} dashboard, {address}",
    "private": "private",
    "events head": "Events on chain",
    "new": "new",
    "see it land": "See it land",
    "on its way": "On its way…",
    "try the next": "Try the next",
    "posted": "posted by the bot",
    "simulation": "Simulation · not live data",
    "built before": "built before · {repo}",
    "networks": "{n} networks",
    "trusts": "{name} trusts us"
  };
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  /* tile size follows the tier; the tier word is never printed (the design's recorded exception) */
  var TIER_SPAN = { god: 3, high: 2, medium: 2, low: 1, filth: 1 };
  var SPELL = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
    "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four",
    "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
    "thirty-one", "thirty-two", "thirty-three", "thirty-four", "thirty-five", "thirty-six",
    "thirty-seven", "thirty-eight", "thirty-nine", "forty", "forty-one", "forty-two",
    "forty-three", "forty-four", "forty-five", "forty-six", "forty-seven", "forty-eight",
    "forty-nine", "fifty"];
  var ARROW = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9L9 3"/><path d="M4.5 3H9v4.5"/></svg>';

  /* ── small things ─────────────────────────────────────────────────────────────────────── */
  function say(key, vars) {
    var t = CONTENT[key] || "";
    vars = vars || {};
    Object.keys(vars).forEach(function (k) {
      t = t.split("{" + k + "}").join(vars[k] == null ? "" : vars[k]);
    });
    return t.trim();
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function textOf(n) { return ((n && n.textContent) || "").replace(/\s+/g, " ").trim(); }
  function pad(n) { return ("0" + n).slice(-2); }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function mono(text, cls) { return el("span", "enc-svc__mono" + (cls ? " " + cls : ""), text); }
  function external(a, href) {
    a.href = href;
    if (/^https?:/.test(href) && href.indexOf(location.host) < 0) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    return a;
  }
  function glyph(src, size, tint, cls) {
    var g = el("span", "enc-svc__glyph" + (cls ? " " + cls : ""));
    g.style.width = g.style.height = size + "px";
    g.style.backgroundColor = tint;
    if (src) {
      var i = el("img");
      i.alt = "";
      i.decoding = "async";
      i.src = src;
      g.appendChild(i);
    }
    return g;
  }

  /* §07's tiers, drawn for the bands this page builds (a built link is not a Notion callout, so
     the Button System's selectors do not reach it) */
  function btn(label, href, dark) {
    var a = external(el("a", "enc-svc__btn" + (dark ? " is-ink" : ""), label), href);
    return a;
  }
  function tert(label, href, dark) {
    var a = el("a", "enc-svc__tert" + (dark ? " is-ink" : ""));
    if (href) external(a, href);
    a.appendChild(el("span", "enc-svc__tertl", label));
    var b = el("span", "enc-svc__badge");
    b.innerHTML = ARROW;
    a.appendChild(b);
    return a;
  }
  function sbtn(dark) {
    var b = el("button", "enc-svc__sbtn" + (dark ? " is-ink" : ""));
    b.type = "button";
    return b;
  }

  /* the number, the name, one line — the same head on every service, so the forms differ and
     the frame does not */
  function secHead(num, title, sub, dark) {
    var h = el("div", "enc-svc__head" + (dark ? " is-ink" : ""));
    var k = el("div", "enc-svc__headk");
    k.appendChild(el("span", "enc-svc__num", pad(num)));
    k.appendChild(el("h2", "enc-svc__h2", title));
    h.appendChild(k);
    if (sub) h.appendChild(el("p", "enc-svc__sub", sub));
    return h;
  }

  /* ── reading the page ─────────────────────────────────────────────────────────────────── */
  /* a band callout, in order: headings, texts and buttons (a button is a callout whose one line
     is a link; its tier is its colour, as in the Button System) */
  function parts(callout) {
    var out = { h2: "", h3: [], p: [], buttons: [], seq: [] };
    var content = callout && callout.querySelector(":scope > .notion-callout__content");
    if (!content) return out;
    (function walk(box) {
      Array.prototype.forEach.call(box.children, function (n) {
        if (n.classList.contains("notion-heading__anchor")) return;
        if (n.classList.contains("notion-column-list") || n.classList.contains("notion-column")) {
          walk(n);
          return;
        }
        if (n.classList.contains("notion-callout")) {
          var a = n.querySelector(".notion-callout__content > span.notion-semantic-string .notion-link, .notion-callout__content a[href]");
          if (!a) return;
          var tier = /\bbg-(?!gray)/.test(n.className) ? "primary"
            : /\bbg-gray/.test(n.className) ? "secondary" : "tertiary";
          var b = { text: textOf(a), href: a.getAttribute("href"), tier: tier };
          out.buttons.push(b);
          out.seq.push({ kind: "button", button: b });
          return;
        }
        var t = textOf(n);
        if (!t) return;
        if (n.tagName === "H2") { out.h2 = out.h2 || t; out.seq.push({ kind: "h2", text: t }); }
        else if (n.tagName === "H3") { out.h3.push(t); out.seq.push({ kind: "h3", text: t }); }
        else if (n.tagName === "P" || n.classList.contains("notion-text")) {
          out.p.push(t);
          out.seq.push({ kind: "p", text: t });
        }
      });
    })(content);
    return out;
  }

  /* the first collection after a band, before the next band */
  function collectionAfter(band, ids) {
    for (var n = band && band.nextElementSibling; n; n = n.nextElementSibling) {
      if (n.classList.contains("enc-svc__band")) continue;
      if (n.id && ids.indexOf(n.id) >= 0) return null;
      if (n.classList.contains("notion-collection")) return n;
      var c = n.querySelector && n.querySelector(":scope > .notion-collection");
      if (c) return c;
    }
    return null;
  }

  /* a cell's text with its line breaks kept — "Earlier" holds two log lines */
  function lines(td) {
    var c = td.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll("br"), function (b) {
      b.parentNode.replaceChild(document.createTextNode("\n"), b);
    });
    return (c.textContent || "").split(/\n+/).map(function (l) {
      return l.replace(/\s+/g, " ").trim();
    }).filter(Boolean);
  }

  /* a table view, by its header labels (lower-cased): text, lines, the file's original and the
     link. Sorted by Order when the table has one. */
  function table(coll) {
    var t = coll && coll.querySelector("table");
    if (!t) return [];
    var heads = Array.prototype.map.call(t.querySelectorAll("thead th"), function (th) {
      return textOf(th).toLowerCase();
    });
    var list = Array.prototype.map.call(t.querySelectorAll("tbody tr"), function (tr, idx) {
      var o = { _i: idx };
      heads.forEach(function (h, i) {
        var td = tr.children[i];
        if (!td || !h) return;
        o[h] = textOf(td);
        o[h + " lines"] = lines(td);
        var f = td.querySelector("[data-full-size]");
        if (f) o[h + " src"] = f.getAttribute("data-full-size");
        var a = td.querySelector("a[href]");
        if (a) o[h + " href"] = a.getAttribute("href");
      });
      return o;
    });
    return list.filter(function (o) { return o.name; }).sort(function (a, b) {
      var x = parseFloat(a.order), y = parseFloat(b.order);
      if (isNaN(x) && isNaN(y)) return a._i - b._i;
      if (isNaN(x)) return 1;
      if (isNaN(y)) return -1;
      return x - y;
    });
  }

  /* the Networks set, wherever its view is on the page: the collection whose rows carry a tier.
     A table or a gallery; one entry per chain (the set has a row per deployment). */
  function networkSet(root, skip) {
    var best = null;
    Array.prototype.forEach.call(root.querySelectorAll(".notion-collection"), function (coll) {
      if (best || skip.indexOf(coll) >= 0) return;
      var items = [];
      var t = coll.querySelector("table");
      if (t) {
        table(coll).forEach(function (r) {
          items.push({ name: r.name, tier: (r.tier || "").toLowerCase(),
            src: r["cover src"] || firstSrc(r), order: parseFloat(r.order) });
        });
      } else {
        Array.prototype.forEach.call(coll.querySelectorAll(".notion-collection-card"), function (c) {
          var tier = "";
          Array.prototype.forEach.call(c.querySelectorAll(".notion-property"), function (p) {
            var v = textOf(p).toLowerCase();
            if (!tier && TIER_SPAN[v]) tier = v;
          });
          var f = c.querySelector("[data-full-size]");
          items.push({ name: textOf(c.querySelector(".notion-property__title")), tier: tier,
            src: f ? f.getAttribute("data-full-size") : "", order: NaN });
        });
      }
      var tiered = items.filter(function (x) { return TIER_SPAN[x.tier]; }).length;
      if (tiered < 3) return;
      var seen = {}, out = [];
      items.forEach(function (x, i) {
        if (!x.name || seen[x.name]) return;
        seen[x.name] = 1;
        x._i = i;
        out.push(x);
      });
      out.sort(function (a, b) {
        if (isNaN(a.order) && isNaN(b.order)) return a._i - b._i;
        if (isNaN(a.order)) return 1;
        if (isNaN(b.order)) return -1;
        return a.order - b.order || a._i - b._i;
      });
      best = { coll: coll, list: out };
    });
    return best;
  }
  function firstSrc(r) {
    for (var k in r) if (/ src$/.test(k)) return r[k];
    return "";
  }

  function readCopy(root) {
    var found = null;
    Array.prototype.forEach.call(root.querySelectorAll(".notion-toggle"), function (t) {
      if (found || !/services page copy/i.test(textOf(t.querySelector(".notion-toggle__summary")))) return;
      found = t;
      Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
        var line = textOf(p), i = line.indexOf("·");
        if (i < 0) return;
        var k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
        if (k && v) CONTENT[k] = v;
      });
    });
    return found;
  }

  /* ── 01 · Dashboards: the zoom ────────────────────────────────────────────────────────────
     p runs 0→1 over the first 70% of the band's scroll. Each board has a third of it: the first
     70% of that third scales it up (from .56 for the first, .82 for the rest) and fades it in,
     the rest holds; over the first 30% of the next third the board leaving keeps growing past
     the frame and fades — a dive out, behind which the next arrives. Pure, so it can be tested. */
  function zoom(p, n, calm) {
    var k = Math.min(n - 1, Math.floor(p * n));
    var q = Math.min(1, (p * n - k) / 0.7), e = 1 - Math.pow(1 - q, 3);
    var s0 = k === 0 ? 0.56 : 0.82;
    var out = { k: k, scale: calm ? 1 : s0 + (1 - s0) * e, opacity: calm ? 1 : 0.35 + 0.65 * e,
      prev: -1, prevScale: 1, prevOpacity: 0 };
    if (k > 0 && !calm) {
      var x = Math.min(1, (p * n - k) / 0.3), xe = 1 - Math.pow(1 - x, 2);
      out.prev = k - 1;
      out.prevScale = 1 + 0.12 * xe;
      out.prevOpacity = 1 - xe;
    }
    return out;
  }

  function dashBand(src, rows, num) {
    var s = el("section", "enc-svc__band enc-svc__dash on-ink");
    s.setAttribute("data-enc-svc-band", "dashboards");
    var sticky = el("div", "enc-svc__sticky");
    s.appendChild(sticky);
    var hd = el("div", "enc-svc__dashhead");
    hd.appendChild(secHead(num, src.h2, src.p[0], true));
    var right = el("div", "enc-svc__dashright");
    var pills = el("div", "enc-svc__pills");
    right.appendChild(pills);
    var open = tert("", "#", true);
    right.appendChild(open);
    hd.appendChild(right);
    sticky.appendChild(hd);
    var stage = el("div", "enc-svc__stage");
    sticky.appendChild(stage);

    var n = rows.length, state = { p: 0 };
    var frames = rows.map(function (r, i) {
      var f = el("span", "enc-svc__frame");
      var shot = r["capture src"];
      if (shot) {
        var img = el("img");
        img.alt = say("dashboard image", { name: r.name, address: r.address });
        img.decoding = "async";
        img.src = shot;
        f.appendChild(img);
      }
      stage.appendChild(f);
      var b = el("button", "enc-svc__pill", r.name);
      b.type = "button";
      b.setAttribute("aria-label", say("show dashboard", { name: r.name }));
      b.addEventListener("click", function () { jump(i); });
      pills.appendChild(b);
      return f;
    });

    function paint() {
      var z = zoom(state.p, n, reduced());
      frames.forEach(function (f, i) {
        if (i === z.k) {
          f.style.transform = "scale(" + z.scale.toFixed(3) + ")";
          f.style.opacity = z.opacity.toFixed(3);
          f.style.zIndex = 1;
          f.style.visibility = "visible";
        } else if (i === z.prev && z.prevOpacity > 0) {
          f.style.transform = "scale(" + z.prevScale.toFixed(3) + ")";
          f.style.opacity = z.prevOpacity.toFixed(3);
          f.style.zIndex = 2;
          f.style.visibility = "visible";
        } else {
          f.style.visibility = "hidden";
          f.style.opacity = 0;
        }
      });
      Array.prototype.forEach.call(pills.children, function (b, i) {
        b.setAttribute("aria-pressed", i === z.k ? "true" : "false");
      });
      var d = rows[z.k];
      open.querySelector(".enc-svc__tertl").textContent = say("open dashboard", { name: d.name });
      external(open, d["link href"] || d.link || "#");
    }
    function measure() {
      var r = s.getBoundingClientRect(), span = r.height - window.innerHeight;
      if (span <= 0) return;
      var p = Math.max(0, Math.min(1, -r.top / (span * 0.7)));
      if (Math.abs(p - state.p) > 0.005 || p === 0 || p === 1) {
        state.p = p;
        paint();
      }
    }
    /* a pill jumps to its board's hold point, 85% into its third, with no scroll animation — the
       board shows at rest, no zoom */
    function jump(i) {
      var r = s.getBoundingClientRect(), span = r.height - window.innerHeight;
      var p = (i + 0.85) / n;
      window.scrollTo({ top: window.scrollY + r.top + p * span * 0.7, behavior: "instant" });
      state.p = p;
      paint();
    }
    paint();
    return { node: s, measure: measure };
  }

  /* ── 02 · Playbooks: the steps pin and pile ──────────────────────────────────────────── */
  var TOP0 = 88, STEP = 76;
  function stepsBand(src, num) {
    var s = el("section", "enc-svc__band enc-svc__steps");
    s.setAttribute("data-enc-svc-band", "playbooks");
    s.appendChild(secHead(num, src.h2, src.p[0], false));
    var cards = el("div", "enc-svc__cards");
    var steps = [], cur = null;
    src.seq.forEach(function (x) {
      if (x.kind === "h3") { cur = { title: x.text, line: "" }; steps.push(cur); }
      else if (x.kind === "p" && cur && !cur.line) cur.line = x.text;
    });
    steps.forEach(function (st, i) {
      var c = el("div", "enc-svc__card");
      c.style.top = (TOP0 + i * STEP) + "px";
      c.style.zIndex = i + 1;
      c.style.backgroundColor = TINTS[i % 5];
      var t = el("div", "enc-svc__cardtop");
      t.appendChild(mono(pad(i + 1), "enc-svc__cardnum"));
      t.appendChild(el("span", "enc-svc__cardtitle", st.title));
      c.appendChild(t);
      if (st.line) c.appendChild(el("p", "enc-svc__cardline", st.line));
      cards.appendChild(c);
    });
    var sp = el("div", "enc-svc__spacer");
    sp.setAttribute("aria-hidden", "true");
    cards.appendChild(sp);
    s.appendChild(cards);
    return { node: s };
  }

  /* ── 02 · Playbooks: one honest figure, the repositories as marginalia ───────────────── */
  function reposBand(src, rows) {
    var s = el("section", "enc-svc__band enc-svc__repos");
    s.setAttribute("data-enc-svc-band", "repositories");
    var g = el("div", "enc-svc__reposgrid");
    var fig = el("div", "enc-svc__fig");
    var count = el("span", "enc-svc__count", pad(rows.length));
    count.setAttribute("aria-hidden", "true");
    fig.appendChild(count);
    if (src.p[0]) fig.appendChild(mono(src.p[0], "enc-svc__figk"));
    g.appendChild(fig);

    var m = el("div", "enc-svc__marg");
    if (src.p[1]) m.appendChild(el("p", "enc-svc__para", src.p[1]));
    var list = el("div", "enc-svc__repolist");
    var desc = el("div", "enc-svc__repodesc");
    desc.id = "enc-svc-repodesc";
    desc.setAttribute("role", "status");
    function show(r) {
      desc.textContent = "";
      desc.classList.toggle("is-on", !!r);
      if (!r) return;
      var priv = /private/i.test(r.visibility);
      desc.appendChild(mono(r.repository + (priv ? " · " + say("private") : ""), "enc-svc__repodk"));
      desc.appendChild(el("span", "enc-svc__repodt", r.description));
    }
    rows.forEach(function (r, i) {
      var priv = /private/i.test(r.visibility);
      var a = el("a", "enc-svc__repo");
      var href = r["link href"] || r.link;
      if (href && !priv) external(a, href);
      a.setAttribute("aria-describedby", desc.id);
      a.appendChild(glyph(r["glyph src"], 22, TINTS[i % 5]));
      var t = el("span", "enc-svc__repot");
      t.appendChild(el("span", "enc-svc__repon", r.name));
      if (priv) t.appendChild(mono(say("private"), "enc-svc__repop"));
      a.appendChild(t);
      a.addEventListener("mouseenter", function () { show(r); });
      a.addEventListener("mouseleave", function () { show(null); });
      a.addEventListener("focus", function () { show(r); });
      a.addEventListener("blur", function () { show(null); });
      list.appendChild(a);
    });
    m.appendChild(list);
    m.appendChild(desc);
    src.buttons.forEach(function (b) { m.appendChild(tert(b.text, b.href, false)); });
    g.appendChild(m);
    s.appendChild(g);
    return { node: s };
  }

  /* ── 03 · Bots: the chain on ink, Discord on paper, the post on the seam ─────────────── */
  function botsBand(src, events, num) {
    var s = el("section", "enc-svc__band enc-svc__bots");
    s.setAttribute("data-enc-svc-band", "bots");
    var L = el("div", "enc-svc__botsl on-ink");
    var R = el("div", "enc-svc__botsr");
    s.appendChild(L);
    s.appendChild(R);

    L.appendChild(secHead(num, src.h2, src.p[0], true));
    var log = el("div", "enc-svc__log");
    L.appendChild(log);
    L.appendChild(el("span", "enc-svc__word is-ink", src.p[1] || ""));
    L.lastChild.setAttribute("aria-hidden", "true");

    var top = el("div", "enc-svc__botstop");
    var row = el("div", "enc-svc__botsrow");
    var pills = el("div", "enc-svc__botpills");
    events.forEach(function (e) { pills.appendChild(el("span", "enc-svc__botpill", e.name)); });
    row.appendChild(pills);
    var emitB = sbtn(false);
    row.appendChild(emitB);
    src.buttons.forEach(function (b) { row.appendChild(tert(b.text, b.href, false)); });
    top.appendChild(row);
    top.appendChild(mono(say("simulation"), "enc-svc__sim"));
    R.appendChild(top);
    var word = el("span", "enc-svc__word", src.p[2] || "");
    word.setAttribute("aria-hidden", "true");
    R.appendChild(word);

    var dot = el("span", "enc-svc__dot");
    dot.setAttribute("aria-hidden", "true");
    s.appendChild(dot);
    var seam = el("div", "enc-svc__seam");
    seam.setAttribute("aria-live", "polite");
    s.appendChild(seam);

    var st = { bot: 0, ev: null }, timer = null;
    function card(e, k) {
      var c = el("div", "enc-svc__post");
      c.appendChild(glyph(e["glyph src"], 36, TINTS[[2, 0, 1][k % 3]]));
      var b = el("div", "enc-svc__postb");
      var h = el("div", "enc-svc__posth");
      h.appendChild(el("span", "enc-svc__postn", e.name));
      h.appendChild(mono(say("posted"), "enc-svc__postm"));
      b.appendChild(h);
      b.appendChild(el("span", "enc-svc__postt", e.headline + " · " + e.detail));
      c.appendChild(b);
      return c;
    }
    function paint() {
      var k = st.ev || 0, ev = events[k], prev = events[(k + events.length - 1) % events.length];
      var flying = st.bot >= 1 && st.bot < 3;
      var shown = st.bot === 0 && st.ev == null ? ev : st.bot >= 3 ? ev : prev;

      log.textContent = "";
      var head = el("div", "enc-svc__loghead");
      head.appendChild(mono(say("events head")));
      log.appendChild(head);
      (ev["earlier lines"] || []).forEach(function (l) {
        var r = el("div", "enc-svc__logrow");
        r.appendChild(el("span", "enc-svc__logt", l));
        log.appendChild(r);
      });
      var nw = el("div", "enc-svc__logrow enc-svc__lognew" + (st.bot >= 1 ? " is-on" : ""));
      nw.appendChild(el("span", "enc-svc__logt", ev.event));
      nw.appendChild(mono(say("new"), "enc-svc__lognewk"));
      log.appendChild(nw);

      Array.prototype.forEach.call(pills.children, function (p, i) { p.classList.toggle("is-on", i === k); });
      emitB.textContent = flying ? say("on its way") : st.bot >= 3 ? say("try the next") : say("see it land");
      emitB.disabled = false;
      emitB.setAttribute("aria-disabled", flying ? "true" : "false");

      dot.classList.toggle("is-flying", flying);
      dot.classList.toggle("is-far", st.bot >= 2);
      seam.classList.toggle("is-flying", flying);
      seam.textContent = "";
      var c = card(shown, k);   // the design tints by the event in play, not the one shown
      c.classList.toggle("is-landed", st.bot >= 3);
      seam.appendChild(c);
    }
    emitB.addEventListener("click", function () {
      if (st.bot >= 1 && st.bot < 3) return;
      clearInterval(timer);
      var ev = st.bot >= 3 ? ((st.ev || 0) + 1) % events.length : (st.ev || 0);
      if (reduced()) { st.bot = 3; st.ev = ev; paint(); return; }
      st.bot = 1;
      st.ev = ev;
      paint();
      timer = setInterval(function () {
        if (st.bot >= 3) { clearInterval(timer); return; }
        st.bot += 1;
        paint();
      }, 700);
    });
    paint();
    return { node: s };
  }

  /* ── 04 · Monitoring: the sentence with a hole ──────────────────────────────────────── */
  function monBand(src, rows, num) {
    var s = el("section", "enc-svc__band enc-svc__mon on-ink");
    s.setAttribute("data-enc-svc-band", "monitoring");
    s.appendChild(secHead(num, src.h2, src.p[0], true));

    var sentence = src.p[1] || "", cut = /_{2,}/.exec(sentence);
    var big = el("p", "enc-svc__big");
    var hole = el("span", "enc-svc__hole", " ");
    if (cut) {
      big.appendChild(document.createTextNode(sentence.slice(0, cut.index)));
      big.appendChild(hole);
      big.appendChild(document.createTextNode(sentence.slice(cut.index + cut[0].length)));
    } else {
      big.textContent = sentence;
    }
    s.appendChild(big);

    var chips = el("div", "enc-svc__chips");
    var status = el("div", "enc-svc__status");
    status.setAttribute("role", "status");
    var rest = src.p[2] || "";
    function show(r) {
      status.textContent = "";
      hole.textContent = r ? r.name : " ";
      hole.classList.toggle("is-on", !!r);
      Array.prototype.forEach.call(chips.children, function (c) {
        c.classList.toggle("is-on", !!r && c.textContent === r.name);
      });
      if (r) {
        status.appendChild(mono(say("built before", { repo: r.repository }), "enc-svc__statusk"));
        status.appendChild(el("span", "enc-svc__statust", r.description));
      } else {
        status.appendChild(el("span", "enc-svc__statust", rest));
      }
    }
    /* A touch screen has no hover, so a tap went straight to GitHub and the sentence was never
       filled (audit, 2026-09-26): there the first tap fills the hole and a second follows the link. */
    var shown = null, noHover = window.matchMedia("(hover: none)");
    rows.forEach(function (r) {
      var a = el("a", "enc-svc__chip", r.name);
      external(a, r["link href"] || r.link || "#");
      a.addEventListener("mouseenter", function () { show(r); });
      a.addEventListener("mouseleave", function () { show(null); });
      a.addEventListener("focus", function () { show(r); });
      a.addEventListener("blur", function () { show(null); if (shown === r) shown = null; });
      a.addEventListener("click", function (e) {
        if (!noHover.matches || shown === r) return;
        e.preventDefault();
        shown = r;
        show(r);
      });
      chips.appendChild(a);
    });
    s.appendChild(chips);
    s.appendChild(status);
    show(null);

    var ask = el("div", "enc-svc__askrow");
    src.buttons.forEach(function (b) {
      ask.appendChild(b.tier === "primary" ? btn(b.text, b.href, true) : tert(b.text, b.href, true));
    });
    s.appendChild(ask);
    return { node: s };
  }

  /* ── the ask: your chain beside the Networks set as tier-sized tiles ─────────────────────
     An exact rectangle. C columns from the width, rows = ceil(area / C); the slack goes to the
     highest tiers first (god 3×3 → 3×4, then high 2×2 → 2×3), never to low or filth, which stay
     1×1. Big shapes are seated first in size order; the 1×1s then flow into what is left, so
     with the areas summing exactly the block is always full. The design's own algorithm, pure
     so it can be tested in Node. */
  function pack(spans, W) {
    /* the design checked every column count from 8 to 30; a wider box (a window past ~1800px)
       can land on a count with no exact rectangle, so one column fewer is tried until one packs */
    for (var C = Math.max(8, Math.floor((W + 6) / 40)); C >= 8; C--) {
      var got = packC(spans, W, C);
      if (got.box) return got;
    }
    return packC(spans, W, Math.max(8, Math.floor((W + 6) / 40)));
  }
  function packC(spans, W, C) {
    var cell = (W - (C - 1) * 6) / C;
    var area0 = spans.reduce(function (a, x) { return a + x * x; }, 0);
    function tryPack(rows) {
      var slack = rows * C - area0;
      if (slack < 0) return null;
      var shape = spans.map(function (sp) { return [sp, sp]; });
      var big = spans.map(function (sp, i) { return i; })
        .filter(function (i) { return spans[i] >= 2; })
        .sort(function (a, b) { return spans[b] - spans[a]; });
      for (var pass = 0; slack > 0 && pass < 3; pass++) {
        for (var j = 0; j < big.length; j++) {
          var i = big[j], sp = spans[i];
          if (slack >= sp && shape[i][1] === sp + pass) {
            shape[i][1] += 1;
            slack -= sp;
            if (slack <= 0) break;
          }
        }
      }
      if (slack !== 0) return null;
      var grid = [], box = [], y, x;
      for (y = 0; y < rows; y++) { grid.push([]); for (x = 0; x < C; x++) grid[y].push(-1); }
      function free(r0, c0, r1, c1) {
        if (r1 > rows || c1 > C) return false;
        for (var yy = r0; yy < r1; yy++) for (var xx = c0; xx < c1; xx++) if (grid[yy][xx] !== -1) return false;
        return true;
      }
      function fill(i, r0, c0, r1, c1) {
        for (var yy = r0; yy < r1; yy++) for (var xx = c0; xx < c1; xx++) grid[yy][xx] = i;
        box[i] = [r0, c0, r1, c1];
      }
      function seat(i, h, w) {
        for (var r = 0; r < rows; r++) for (var c = 0; c < C; c++) {
          if (free(r, c, r + h, c + w)) { fill(i, r, c, r + h, c + w); return true; }
        }
        return false;
      }
      var order = big.slice().sort(function (a, b) {
        return (shape[b][0] * shape[b][1]) - (shape[a][0] * shape[a][1]);
      });
      for (var o = 0; o < order.length; o++) {
        var ii = order[o], h = shape[ii][0], w = shape[ii][1];
        if (!seat(ii, h, w) && !seat(ii, w, h)) return null;
      }
      spans.forEach(function (sp, i) { if (sp === 1 && !seat(i, 1, 1)) box[i] = null; });
      for (var b = 0; b < spans.length; b++) if (!box[b]) return null;
      for (y = 0; y < rows; y++) for (x = 0; x < C; x++) if (grid[y][x] === -1) return null;
      return box;
    }
    var rows = Math.ceil(area0 / C), box = null;
    for (var k = 0; k < 6 && !box; k++) {
      box = tryPack(rows + k);
      if (box) rows = rows + k;
    }
    return { C: C, cell: cell, rows: rows, box: box };
  }

  function spell(n) {
    var w = SPELL[n] || String(n);
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  function askBand(src, set) {
    var s = el("section", "enc-svc__band enc-svc__ask");
    s.setAttribute("data-enc-svc-band", "ask");
    var hd = el("div", "enc-svc__askhead");
    hd.appendChild(el("h2", "enc-svc__asktitle", src.h2));
    var lead = src.p[0] || "";
    /* the count is the set's, so the sentence cannot drift from the tiles under it */
    if (set && set.list.length) {
      lead = lead.replace(/^(\d+|[A-Za-z]+(?:-[A-Za-z]+)?)(?=\s)/, function (w) {
        return /^\d+$/.test(w) || SPELL.indexOf(w.toLowerCase()) > 0 ? spell(set.list.length) : w;
      });
    }
    hd.appendChild(el("p", "enc-svc__asklead", lead));
    s.appendChild(hd);

    var row = el("div", "enc-svc__askgrid");
    var you = el("div", "enc-svc__you");
    var ring = el("span", "enc-svc__youring");
    ring.setAttribute("aria-hidden", "true");
    you.appendChild(ring);
    var yt = el("div", "enc-svc__yout");
    yt.appendChild(el("span", "enc-svc__youn", src.p[1] || ""));
    var primary = src.buttons.filter(function (b) { return b.tier === "primary"; })[0];
    if (primary) yt.appendChild(btn(primary.text, primary.href, false));
    you.appendChild(yt);
    row.appendChild(you);

    var box = el("div", "enc-svc__set");
    var tiles = el("div", "enc-svc__tiles");
    var foot = el("div", "enc-svc__setfoot");
    var status = el("span", "enc-svc__setstatus");
    status.setAttribute("role", "status");
    foot.appendChild(status);
    src.buttons.forEach(function (b) { if (b !== primary) foot.appendChild(tert(b.text, b.href, false)); });
    var list = set ? set.list : [];
    function rest() {
      status.className = "enc-svc__setstatus enc-svc__mono";
      status.textContent = list.length ? say("networks", { n: list.length }) : "";
    }
    rest();
    if (list.length) {
      tiles.setAttribute("aria-label", list.map(function (x) { return x.name; }).join(", "));
      box.appendChild(tiles);
      box.appendChild(foot);
      row.appendChild(box);
      s.appendChild(row);
    } else {
      /* no view of the Networks set on the page: the card stands alone and the link to the
         networks follows it, rather than an empty frame */
      s.appendChild(row);
      foot.classList.add("is-alone");
      s.appendChild(foot);
    }

    var lastW = 0;
    function layout() {
      if (!list.length) return;
      var W = tiles.clientWidth || 560;
      if (Math.abs(W - lastW) <= 2 && tiles.children.length) return;
      lastW = W;
      var spans = list.map(function (x) { return TIER_SPAN[x.tier] || 1; });
      var pk = pack(spans, W);
      tiles.textContent = "";
      if (!pk.box) {
        tiles.className = "enc-svc__tiles is-loose";
        tiles.style.gridTemplateColumns = tiles.style.gridTemplateRows = "";
        list.forEach(function (x, i) { tiles.appendChild(glyph(x.src, 44, TINTS[i % 5])); });
        return;
      }
      tiles.className = "enc-svc__tiles";
      tiles.style.gridTemplateColumns = "repeat(" + pk.C + ", minmax(0, 1fr))";
      tiles.style.gridTemplateRows = "repeat(" + pk.rows + ", " + Math.round(pk.cell) + "px)";
      list.forEach(function (x, i) {
        var b = pk.box[i], h = b[2] - b[0], w = b[3] - b[1];
        var g = Math.round(pk.cell * Math.min(h, w) * 0.56);
        var t = el("div", "enc-svc__tile");
        t.style.gridRow = (b[0] + 1) + " / " + (b[2] + 1);
        t.style.gridColumn = (b[1] + 1) + " / " + (b[3] + 1);
        t.style.backgroundColor = TINTS[i % 5];
        if (x.src) {
          var img = el("img");
          img.alt = "";
          img.decoding = "async";
          img.src = x.src;
          img.style.width = img.style.height = g + "px";
          t.appendChild(img);
        }
        t.addEventListener("mouseenter", function () {
          status.className = "enc-svc__setstatus enc-svc__mono is-on";
          status.textContent = say("trusts", { name: x.name });
        });
        t.addEventListener("mouseleave", rest);
        tiles.appendChild(t);
      });
    }
    return { node: s, layout: layout, tiles: tiles };
  }

  /* ── the build ──────────────────────────────────────────────────────────────────────── */
  var live = { measure: [], layout: [], ro: null };

  function unbuild(root) {
    Array.prototype.forEach.call(root.querySelectorAll(":scope > .enc-svc__band"), function (n) { n.remove(); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-enc-source], [data-enc-anchor]"), function (n) {
      n.removeAttribute("data-enc-source");
      n.removeAttribute("data-enc-anchor");
    });
    if (live.ro) live.ro.disconnect();
    live = { measure: [], layout: [], ro: null };
  }

  function build(root) {
    var ids = Object.keys(BANDS).map(function (k) { return "block-" + BANDS[k]; });
    var node = {};
    Object.keys(BANDS).forEach(function (k) {
      node[k] = root.querySelector(":scope > #block-" + BANDS[k]);
    });
    if (!node.dash && !node.steps && !node.bots && !node.mon) return false;

    var toggle = readCopy(root);
    var src = {}, coll = {};
    Object.keys(node).forEach(function (k) { src[k] = parts(node[k]); });
    coll.dash = collectionAfter(node.dash, ids);
    coll.repos = collectionAfter(node.repos, ids);
    coll.bots = collectionAfter(node.bots, ids);
    coll.mon = collectionAfter(node.mon, ids);
    var rows = {
      dash: table(coll.dash), repos: table(coll.repos), bots: table(coll.bots), mon: table(coll.mon)
    };
    /* the tables have not rendered yet (Super streams them in); wait for the next tick */
    if ((coll.dash && !rows.dash.length) || (coll.repos && !rows.repos.length)) return false;

    var known = [coll.dash, coll.repos, coll.bots, coll.mon].filter(Boolean);
    var set = networkSet(root, known);

    root.setAttribute("data-enc-svc", VERSION);
    var num = 0, built = [];
    function place(k, band) {
      if (!band) return;
      node[k].setAttribute("data-enc-anchor", "");
      node[k].parentNode.insertBefore(band.node, node[k].nextSibling);
      built.push(band);
    }
    if (node.dash && rows.dash.length) place("dash", dashBand(src.dash, rows.dash, ++num));
    if (node.steps) place("steps", stepsBand(src.steps, ++num));
    if (node.repos && rows.repos.length) place("repos", reposBand(src.repos, rows.repos));
    if (node.bots && rows.bots.length) place("bots", botsBand(src.bots, rows.bots, ++num));
    if (node.mon && rows.mon.length) place("mon", monBand(src.mon, rows.mon, ++num));
    if (node.ask) place("ask", askBand(src.ask, set));

    known.concat(set ? [set.coll] : []).forEach(function (c) { c.setAttribute("data-enc-source", ""); });
    if (toggle) toggle.setAttribute("data-enc-source", "");

    built.forEach(function (b) {
      if (b.measure) { live.measure.push(b.measure); b.measure(); }
      if (b.layout) {
        live.layout.push(b.layout);
        b.layout();
        if (window.ResizeObserver) {
          live.ro = live.ro || new ResizeObserver(function () { live.layout.forEach(function (f) { f(); }); });
          live.ro.observe(b.tiles);
        }
      }
    });
    return true;
  }

  function onScroll() { live.measure.forEach(function (f) { f(); }); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    onScroll();
    live.layout.forEach(function (f) { f(); });
  });

  function tick() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root) return;
    if (root.getAttribute("data-enc-svc") === VERSION && root.querySelector(":scope > .enc-svc__band")) return;
    unbuild(root);
    root.removeAttribute("data-enc-svc");
    build(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }
  new MutationObserver(function () { tick(); })
    .observe(document.documentElement, { childList: true, subtree: true });

  window.encServices = { version: VERSION, zoom: zoom, pack: pack, table: table, parts: parts };
  if (typeof module !== "undefined" && module.exports) module.exports = { zoom: zoom, pack: pack };
})();
