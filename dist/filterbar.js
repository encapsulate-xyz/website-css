/* The filter bar — design "Filter Bar Patterns", G · the command field (2026-09-26). Linked from
   the SITE head, before the pages that use it: /networks (network.js), /governance-record
   (governance.js) and /blog (blog.js).

   One 44px field is the whole bar: the page's tabs in the left cell (if it has any), the search in
   the middle — a word that names a facet option or a sort ("terra", "yes", "oldest") becomes an ink
   token on Enter, Backspace takes the last one off — and the page's facets and its sort as
   icon-led cells at the right, each opening a panel of options with their counts. The pages keep
   their own filtering: the bar holds the state and calls `onChange(state)`; the page applies it to
   the rows Super rendered, as it did before. Notion has no block that is an input or a menu, which
   is the exception CLAUDE.md allows. Styles: main.css §13c.

   window.encFilterBar({
     ink,                     // the on-ink palette
     placeholder,
     tabs:  () => [{ label, count, on }] | null,   onTab: i => …,
     facets: [{ id, label, options: () => [[value, label, count]], mark: value => Node, rest: () => Node }],
     sorts: () => [[value, label, icon]],          // icon: "desc" | "asc" | "az" | "bars"; the first is the default
     state: { q, sort, f: { id: value } },
     onChange: state => …
   }) → { el, state, sync() }                    // sync(): redraw from the page's data, writing only what changed

   Super cancels pointer events on the document to close its own dropdowns, so choices are taken on
   pointerdown, a panel closes only after the press is over (hidden mid-press, the click that
   follows would land on the row beneath), and the field is focused in a timeout. */
(function () {
  var NS = "http://www.w3.org/2000/svg";

  /* the bar's focus ring is a keyboard affordance (the file: "a mouse press marks the body, Tab
     clears it"): any press marks the page, Tab takes the mark off. Capture phase, so Super's own
     handlers cannot stop it first. */
  if (!window.__encFbPress) {
    window.__encFbPress = true;
    window.addEventListener("pointerdown", function () {
      document.documentElement.setAttribute("data-enc-mouse", "");
    }, true);
    window.addEventListener("keydown", function (e) {
      if (e.key === "Tab") document.documentElement.removeAttribute("data-enc-mouse");
    }, true);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(w, h, box, paths, strokeWidth, cls) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("width", w); s.setAttribute("height", h); s.setAttribute("viewBox", box);
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", strokeWidth); s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    paths.forEach(function (d) {
      var n = document.createElementNS(NS, d[0]);
      Object.keys(d[1]).forEach(function (k) { n.setAttribute(k, d[1][k]); });
      s.appendChild(n);
    });
    return s;
  }
  var ICON = {
    desc: [["path", { d: "M3 3.5h9" }], ["path", { d: "M3 8h6" }], ["path", { d: "M3 12.5h3" }]],
    asc: [["path", { d: "M3 12.5h9" }], ["path", { d: "M3 8h6" }], ["path", { d: "M3 3.5h3" }]],
    az: [["path", { d: "M2.5 6.5 4.5 2l2 4.5" }], ["path", { d: "M3.1 5.2h2.8" }], ["path", { d: "M9.5 3h3.5L9.5 7.5H13" }],
         ["path", { d: "M4.5 9.5v4.5" }], ["path", { d: "M2.9 12.4 4.5 14l1.6-1.6" }]],
    bars: [["path", { d: "M3 13.5V9" }], ["path", { d: "M8 13.5V6" }], ["path", { d: "M13 13.5V2.5" }]]
  };
  function sortIcon(kind) { return svg(14, 14, "0 0 16 16", ICON[kind] || ICON.desc, 1.7, "enc-fb__icon"); }
  function chevron() { return svg(10, 6, "0 0 10 6", [["path", { d: "M1 1l4 4 4-4" }]], 1.5, "enc-fb__chev"); }
  function check() { return svg(12, 12, "0 0 12 12", [["path", { d: "M2 6.5l2.6 2.6L10 3.5" }]], 1.6, "enc-fb__check"); }
  function put(node, text) { if (node.textContent !== text) node.textContent = text; }

  window.encFilterBar = function (cfg) {
    var state = cfg.state || { q: "", sort: "", f: {} };
    state.f = state.f || {};
    var facets = cfg.facets || [];
    var bar = el("div", "enc-fb");
    if (cfg.ink) bar.setAttribute("data-ink", "");
    var open = null, pressed = 0;

    function sorts() { return cfg.sorts ? cfg.sorts() : []; }
    function changed() { if (cfg.onChange) cfg.onChange(state); paint(); }

    // ── the tabs, in the left cell ──
    var tabs = null;
    if (cfg.tabs) {
      tabs = el("div", "enc-fb__tabs");
      tabs.setAttribute("role", "tablist");
      bar.appendChild(tabs);
      bar.appendChild(el("span", "enc-fb__div"));
    }

    // ── the field: the search, and the tokens a facet word becomes ──
    var field = el("div", "enc-fb__field");
    field.appendChild(svg(14, 14, "0 0 16 16", [["circle", { cx: 7, cy: 7, r: 4.6 }], ["path", { d: "M10.4 10.4 14 14" }]], 1.6, "enc-fb__mag"));
    var tokens = el("span", "enc-fb__tokens");
    field.appendChild(tokens);
    var input = el("input", "enc-fb__input");
    input.type = "search";
    input.value = state.q || "";
    input.setAttribute("aria-label", "Search and filter");
    field.appendChild(input);
    bar.appendChild(field);
    field.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".enc-fb__token")) return;
      if (document.activeElement !== input) setTimeout(function () { input.focus(); }, 0);
    });
    input.addEventListener("input", function () { state.q = input.value; changed(); });
    input.addEventListener("focus", function () { close(); bar.setAttribute("data-focus", ""); });
    input.addEventListener("blur", function () { bar.removeAttribute("data-focus"); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var q = input.value.trim().toLowerCase();
        if (!q) return;
        for (var i = 0; i < facets.length; i++) {
          var hit = facets[i].options().filter(function (o) { return o[0] && String(o[1]).toLowerCase() === q; })[0];
          if (hit) { state.f[facets[i].id] = hit[0]; input.value = ""; state.q = ""; changed(); e.preventDefault(); return; }
        }
        var so = sorts().filter(function (o) { return String(o[1]).toLowerCase().indexOf(q) === 0; })[0];
        if (so) { state.sort = so[0]; input.value = ""; state.q = ""; changed(); e.preventDefault(); }
      } else if (e.key === "Backspace" && !input.value) {
        var list = tokenList();
        if (list.length) { list[list.length - 1][2](); changed(); }
      } else if (e.key === "Escape") {
        close();
      }
    });

    function tokenList() {
      var out = [];
      facets.forEach(function (f) {
        var v = state.f[f.id];
        if (!v) return;
        var o = f.options().filter(function (x) { return x[0] === v; })[0];
        out.push([f.id, o ? o[1] : v, function () { state.f[f.id] = ""; }]);
      });
      var s = sorts();
      if (s.length && state.sort && state.sort !== s[0][0]) {
        var cur = s.filter(function (x) { return x[0] === state.sort; })[0];
        if (cur) out.push(["sort", cur[1], function () { state.sort = s[0][0]; }]);
      }
      return out;
    }

    // ── a cell: a facet, or the sort (the last) ──
    function cell(id, label, isSort) {
      bar.appendChild(el("span", "enc-fb__div"));
      var box = el("div", "enc-fb__cell");
      box.setAttribute("data-cell", id);
      var trigger = el("button", "enc-fb__trigger");
      trigger.type = "button";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", label);
      trigger.appendChild(el("span", "enc-fb__lead"));
      trigger.appendChild(el("span", "enc-fb__value"));
      trigger.appendChild(chevron());
      var panel = el("div", "enc-fb__panel");
      panel.setAttribute("role", "listbox");
      panel.setAttribute("aria-label", label);
      panel.hidden = true;
      box.appendChild(trigger);
      box.appendChild(panel);
      bar.appendChild(box);
      trigger.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var was = open === id;
        pressed = Date.now();          // the click that follows this press is not a second toggle
        if (was) close(); else show(id);
      });
      // the keyboard: Enter or Space on the trigger
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (Date.now() - pressed < 700) return;
        if (open === id) close(); else show(id);
      });
      return { box: box, trigger: trigger, panel: panel, isSort: isSort };
    }
    var cells = {};
    facets.forEach(function (f) { cells[f.id] = cell(f.id, f.label, false); });
    cells.sort = cell("sort", "Sort", true);

    function optionsOf(id) {
      if (id === "sort") return sorts().map(function (o) { return [o[0], o[1], null, o[2]]; });
      return facets.filter(function (f) { return f.id === id; })[0].options();
    }
    function markOf(id, value, icon) {
      if (id === "sort") return sortIcon(icon);
      var f = facets.filter(function (x) { return x.id === id; })[0];
      return value ? f.mark(value) : f.rest();
    }
    function show(id) {
      close();
      open = id;
      var c = cells[id];
      c.panel.textContent = "";
      var cur = id === "sort" ? state.sort : (state.f[id] || "");
      optionsOf(id).forEach(function (o) {
        var item = el("button", "enc-fb__option");
        item.type = "button";
        item.setAttribute("role", "option");
        var on = o[0] === cur;
        item.setAttribute("aria-selected", on ? "true" : "false");
        var dead = o[2] === 0 && !!o[0];
        if (dead) item.disabled = true;
        var l = el("span", "enc-fb__opt-l");
        var m = markOf(id, o[0], o[3]);
        if (m) l.appendChild(m);
        l.appendChild(el("span", null, o[1]));
        var r = el("span", "enc-fb__opt-r");
        if (o[2] != null) r.appendChild(el("span", "enc-fb__count", String(o[2])));
        if (on) r.appendChild(check());
        item.appendChild(l);
        item.appendChild(r);
        function choose() {
          if (id === "sort") state.sort = o[0]; else state.f[id] = o[0];
          changed();
        }
        item.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          if (dead) return;
          pressed = Date.now();
          choose();
          window.addEventListener("pointerup", function up() {
            window.removeEventListener("pointerup", up, true);
            setTimeout(close, 0);
          }, true);
        });
        item.addEventListener("click", function () {
          if (dead) return;
          if (Date.now() - pressed > 700) { choose(); close(); }
        });
        c.panel.appendChild(item);
      });
      c.panel.hidden = false;
      c.trigger.setAttribute("aria-expanded", "true");
      bar.setAttribute("data-open", "");
    }
    function close() {
      if (!open) return;
      var c = cells[open];
      c.panel.hidden = true;
      c.trigger.setAttribute("aria-expanded", "false");
      open = null;
      bar.removeAttribute("data-open");
    }
    document.addEventListener("pointerdown", function (e) { if (open && !bar.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    // ── drawing: only what changed, so a page's observer cannot loop on it ──
    var tabSig = null, tokenSig = null;   // null: the first paint always writes
    function paint() {
      if (tabs) {
        var list = cfg.tabs() || [];
        var sig = list.map(function (t) { return t.label + ":" + (t.count == null ? "" : t.count) + ":" + (t.on ? 1 : 0); }).join("|");
        if (sig !== tabSig) {
          tabSig = sig;
          tabs.textContent = "";
          list.forEach(function (t, i) {
            var b = el("button", "enc-fb__tab");
            b.type = "button";
            b.setAttribute("role", "tab");
            b.setAttribute("aria-selected", t.on ? "true" : "false");
            b.appendChild(el("span", null, t.label));
            if (t.count != null) b.appendChild(el("span", "enc-fb__count", String(t.count)));
            b.addEventListener("click", function () { if (cfg.onTab) cfg.onTab(i); });
            tabs.appendChild(b);
          });
        }
      }
      var tl = tokenList();
      var tsig = tl.map(function (t) { return t[0] + ":" + t[1]; }).join("|");
      if (tsig !== tokenSig) {
        tokenSig = tsig;
        tokens.textContent = "";
        tl.forEach(function (t) {
          var b = el("button", "enc-fb__token");
          b.type = "button";
          b.setAttribute("aria-label", "Remove " + t[1]);
          b.appendChild(el("span", null, t[1]));
          b.appendChild(svg(12, 12, "0 0 12 12", [["path", { d: "M3 3l6 6" }], ["path", { d: "M9 3l-6 6" }]], 1.6));
          b.addEventListener("pointerdown", function (e) { e.preventDefault(); t[2](); changed(); });
          tokens.appendChild(b);
        });
        var ph = tl.length ? "Add a word…" : cfg.placeholder || "";
        if (input.placeholder !== ph) input.placeholder = ph;
      }
      if (input.value !== (state.q || "") && document.activeElement !== input) input.value = state.q || "";
      Object.keys(cells).forEach(function (id) {
        var c = cells[id], opts = optionsOf(id);
        var v = id === "sort" ? state.sort : (state.f[id] || "");
        var o = opts.filter(function (x) { return x[0] === v; })[0] || opts[0];
        if (!o) return;
        var key = id + "=" + o[0];
        if (c.trigger.getAttribute("data-enc-key") !== key) {
          c.trigger.setAttribute("data-enc-key", key);
          var lead = c.trigger.querySelector(".enc-fb__lead");
          lead.textContent = "";
          var m = markOf(id, o[0], o[3]);
          if (m) lead.appendChild(m);
        }
        put(c.trigger.querySelector(".enc-fb__value"), String(o[1]));
      });
    }
    paint();
    /* update(): a change made from outside the bar — the empty state's marks and its "Clear
       filters" — set the same state the bar's own controls set, and the page applies it */
    function update(patch) {
      if ("q" in patch) state.q = patch.q;
      if ("sort" in patch) state.sort = patch.sort;
      if (patch.f) state.f = Object.assign({}, patch.f);
      changed();
    }
    return { el: bar, state: state, sync: paint, update: update };
  };

  /* ── THE EMPTY RESULT (design Filter Bar Patterns, "B · the whole set, quietly", 2026-09-26) ──
     Where the list would be: a headline, the page's whole set as pressable marks at 45% (hover →
     full and an ink ring; press → filter to it), one line, and two tertiaries — the page's own
     destination and "Clear filters". The page gives the words (from its "Empty state copy"
     toggle in Notion) and the marks; this draws them. Returns { el, set(o) }; set() rewrites only
     what changed. o = { ink, headline, items: [{ id, label, node }], tail, onPick(id), line,
     action: { label, href, up }, clear: { label, onClick } } */
  function tert(label, href, glyph) {
    var t = el(href ? "a" : "button", "enc-es__act");
    if (href) {
      t.href = href;
      if (/^https?:/.test(href) && href.indexOf(location.host) < 0) { t.target = "_blank"; t.rel = "noopener"; }
    } else t.type = "button";
    t.appendChild(el("span", "enc-es__act-label", label));
    var disc = el("span", "enc-es__disc");
    disc.setAttribute("aria-hidden", "true");
    if (glyph === "up") disc.setAttribute("data-up", "");
    var paths = glyph === "x" ? [["path", { d: "M2.5 2.5l5 5" }], ["path", { d: "M7.5 2.5l-5 5" }]]
      : glyph === "up" ? [["path", { d: "M3 7l4-4" }], ["path", { d: "M3.5 3h3.5v3.5" }]]
      : [["path", { d: "M2 5h6M5 2l3 3-3 3" }]];
    disc.appendChild(svg(10, 10, "0 0 10 10", paths, 1.6));
    t.appendChild(disc);
    return t;
  }
  window.encEmptySet = function () {
    var box = el("div", "enc-es");
    box.setAttribute("role", "status");
    var head = el("span", "enc-es__head");
    var set = el("div", "enc-es__set");
    var line = el("p", "enc-es__line");
    var acts = el("div", "enc-es__acts");
    box.appendChild(head); box.appendChild(set); box.appendChild(line); box.appendChild(acts);
    var itemsSig = null, actSig = null;
    function update(o) {
      box.toggleAttribute("data-ink", !!o.ink);
      put(head, o.headline || "");
      var sig = (o.items || []).map(function (it) { return it.id; }).join("|") + "#" + (o.tail || "");
      if (sig !== itemsSig) {
        itemsSig = sig;
        set.textContent = "";
        (o.items || []).forEach(function (it) {
          var b = el("button", "enc-es__item");
          b.type = "button";
          b.setAttribute("aria-label", "Filter by " + it.label);
          b.title = it.label;
          if (it.node) b.appendChild(it.node);
          b.addEventListener("click", function () { if (o.onPick) o.onPick(it.id); });
          set.appendChild(b);
        });
        if (o.tail) set.appendChild(el("span", "enc-es__tail", o.tail));
      }
      put(line, o.line || "");
      line.hidden = !o.line;
      var asig = [o.action && o.action.label, o.action && o.action.href, o.clear && o.clear.label].join("|");
      if (asig !== actSig) {
        actSig = asig;
        acts.textContent = "";
        if (o.action && o.action.label) acts.appendChild(tert(o.action.label, o.action.href, o.action.up ? "up" : null));
        if (o.clear && o.clear.label) {
          var c = tert(o.clear.label, null, "x");
          c.addEventListener("click", function () { if (o.clear.onClick) o.clear.onClick(); });
          acts.appendChild(c);
        }
      }
    }
    return { el: box, set: update };
  };

  /* The empty state's words: a toggle called "Empty state copy" on the page, "key · value" lines.
     A value that is a link carries its href. Marked so every page hides it. */
  window.encEmptyCopy = function (root) {
    var out = null;
    Array.prototype.forEach.call((root || document).querySelectorAll(".notion-toggle"), function (t) {
      var sum = t.querySelector(".notion-toggle__summary");
      if (!sum || !/^\s*empty state copy\s*$/i.test(sum.textContent)) return;
      t.setAttribute("data-enc-copy", "");
      out = out || {};
      Array.prototype.forEach.call(t.querySelectorAll(".notion-toggle__content p, .notion-toggle__content .notion-text"), function (p) {
        var line = (p.textContent || "").replace(/\s+/g, " ").trim(), i = line.indexOf("\u00b7");
        if (i < 0) return;
        var k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
        var a = p.querySelector("a[href]");
        if (k && v) out[k] = { text: v, href: a ? a.getAttribute("href") : null };
      });
    });
    return out;
  };
})();
