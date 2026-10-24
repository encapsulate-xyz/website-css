/* Homepage script — the institutional staking dial (design "Institutional Form", 22a "The dial").

   SERVED from the repo (dist/home.js, via jsDelivr) and linked from Super → homepage → Code → Head,
   together with its styles dist/home-dial.css — see "Serving from GitHub" in CLAUDE.md. The base
   form styles are main.css §13b.

   WHAT IT DOES, on a Notion form that has a Number question labelled "Amount":
     1. Adds the dial to the left column, between the form title (shown as the small label) and
        the description: the dollar figure, the line about the $200k minimum, a slider from
        $50k to $25M, and the scale under it.
     2. Writes every slider move into the hidden Amount question, so the exact figure is what
        Notion receives.
     3. Replaces a long choice question's radio list (Super renders Notion "Dropdown" questions as
        radio buttons) with the design's listbox — a trigger showing the pick and a panel of
        options, each with the chain's glyph in a pastel well. Picking clicks the real option
        underneath, so Super's own form state is what gets submitted. Short choice questions
        (Duration) keep the radios, drawn as pill buttons by home.css.
     4. Relabels the submit button "Send this".
   Without JavaScript the form still works: main.css §13b shows the choices as chips and the
   Amount as a plain number field.

   MARKERS ARE data- ATTRIBUTES, NEVER CLASSES. Super's form elements are React-owned: any state
   change (writing the amount is one) re-renders them and resets className to React's own list,
   wiping any class this script added. The first version marked the form with classes and lost
   every style the moment it set the starting amount — the dial and triggers survived (they are
   separate nodes) but nothing hid the chips or styled the figure. React leaves attributes it
   does not manage alone, so the form, the Amount field and the choice fields are marked with
   data-enc-dial, data-enc-amount and data-enc-picked, and home.css selects on those.

   WHY THE OBSERVER. Super is a single-page app: it navigates without reloading and can re-render
   the form after this script first runs. A MutationObserver re-applies the enhancement whenever
   the form (or a piece this script added) appears or disappears. Every step checks for its own
   marker first, so running it again changes nothing.

   WHY CLICKS AND NATIVE SETTERS. Super's form is React. Setting input.checked or input.value
   directly updates the DOM but not React's state, so the answer would not be submitted. Options
   are picked with label.click(), and the number is written through the native value setter
   followed by an input event, which React listens for. */
(function () {
  var MIN = 200000;
  var RANGE_MIN = 50000;
  var RANGE_MAX = 25000000;
  var STEP = 50000;
  var START = 500000;
  var SEND_LABEL = "Send this";

  var money = function (v) { return "$" + Number(v).toLocaleString("en-US"); };
  var labelOf = function (field) {
    var t = field.querySelector(".notion-form__field-title");
    if (!t) return "";
    var clone = t.cloneNode(true);
    clone.querySelectorAll(".notion-form__field-title-required").forEach(function (n) { n.remove(); });
    return clone.textContent.trim();
  };
  var setNativeValue = function (input, value) {
    var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  function amountField(wrapper) {
    var fields = wrapper.querySelectorAll(".notion-form__field");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var input = f.querySelector("input.notion-form__input-field");
      if (input && /amount/i.test(labelOf(f)) && !f.classList.contains("multi_select")) return f;
    }
    return null;
  }

  /* 1–2. The dial */
  function buildDial(wrapper, field) {
    var content = wrapper.querySelector(".notion-header__content");
    if (!content || content.querySelector(".enc-dial")) return;
    var input = field.querySelector("input.notion-form__input-field");
    var current = parseInt(String(input.value).replace(/[^0-9]/g, ""), 10);
    var value = isNaN(current) ? START : Math.min(RANGE_MAX, Math.max(RANGE_MIN, current));

    var dial = document.createElement("div");
    dial.className = "enc-dial";
    dial.innerHTML =
      '<div class="enc-dial__fig">' +
        '<span class="enc-dial__figure"></span>' +
        '<span class="enc-dial__status"></span>' +
      "</div>" +
      '<input class="enc-dial__range" type="range" aria-label="Expected staking amount">' +
      '<div class="enc-dial__scale"><span></span><span></span></div>';

    var range = dial.querySelector(".enc-dial__range");
    range.min = RANGE_MIN; range.max = RANGE_MAX; range.step = STEP; range.value = value;
    var scale = dial.querySelectorAll(".enc-dial__scale span");
    scale[0].textContent = "$50k";
    scale[1].textContent = "$25M";

    var paint = function (v) {
      var over = v >= MIN;
      dial.querySelector(".enc-dial__figure").textContent = money(v);
      var status = dial.querySelector(".enc-dial__status");
      status.textContent = over ? "Above the $200k minimum" : "Below the $200k minimum — still worth a conversation";
      status.classList.toggle("is-below", !over);
      var pct = ((v - RANGE_MIN) / (RANGE_MAX - RANGE_MIN) * 100).toFixed(2);
      range.style.setProperty("--enc-pct", pct + "%");
    };
    range.addEventListener("input", function () {
      var v = Number(range.value);
      paint(v);
      var live = wrapper.querySelector("[data-enc-amount] input.notion-form__input-field");
      if (live) setNativeValue(live, v);
    });

    var titleWrap = content.querySelector(".notion-header__title-wrapper");
    content.insertBefore(dial, titleWrap ? titleWrap.nextSibling : content.firstChild);
    paint(value);
    setNativeValue(input, value);
  }

  /* 3. Choice questions: a listbox for long lists, pills for short ones.
     Long (more than PILL_MAX options, e.g. Network) gets the design's listbox; short (Duration)
     keeps Super's own radio labels, which home.css draws as pill buttons ([data-enc-seg]). */
  var PILL_MAX = 6;
  // the design's well tints, cycled in list order: orange, pink, green, yellow, blue
  var TINTS = ["#F8DDC6", "#F7DCE7", "#DCEEC7", "#F8E8B3", "#D2E3F6"];

  /* Each chain's glyph is the cover of its card in the homepage's networks gallery, so the
     listbox needs no image list of its own: a network added to that gallery gets its glyph
     here too. A name with no card (e.g. "Other") gets no well. */
  function glyphs() {
    var map = {};
    document.querySelectorAll(".notion-collection-card").forEach(function (card) {
      var title = card.querySelector(".notion-property__title");
      var img = card.querySelector("img.notion-collection-card__cover");
      if (!title || !img) return;
      var src = img.currentSrc || img.getAttribute("src");
      var key = title.textContent.trim().toLowerCase();
      if (src && !map[key]) map[key] = src;
    });
    // On a page with no gallery to read — the contact band's dial — covers.js publishes the same
    // glyphs it uses for the page covers, keyed by chain.
    if (window.encGlyphs) {
      var shared = window.encGlyphs();
      for (var k in shared) if (!map[k]) map[k] = shared[k];
    }
    return map;
  }

  // "Gravity Bridge" and "gravitybridge" are the same chain: covers.js keys on letters and digits
  function flatKey(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function mark(name, index, map) {
    var src = map[name.toLowerCase()] || map[flatKey(name)];
    if (!src) return null;
    var well = document.createElement("span");
    well.className = "enc-mark";
    well.style.setProperty("--enc-tint", TINTS[index % TINTS.length]);
    var img = document.createElement("img");
    img.alt = "";
    img.src = src;
    well.appendChild(img);
    return well;
  }

  function buildPicks(wrapper) {
    wrapper.querySelectorAll(".notion-form__field.multi_select").forEach(function (field) {
      var options = field.querySelector(".notion-form__select-options");
      if (!options) return;
      if (field.querySelectorAll(".notion-form__checkbox-label").length <= PILL_MAX) {
        // pills; also undo a listbox left by an earlier version of this script
        field.setAttribute("data-enc-seg", "");
        field.removeAttribute("data-enc-picked");
        var stale = field.querySelector(".enc-pick");
        if (stale) stale.remove();
        return;
      }
      field.removeAttribute("data-enc-seg");
      var pick = field.querySelector(".enc-pick");
      field.setAttribute("data-enc-picked", "");
      if (!pick) {
        pick = document.createElement("div");
        pick.className = "enc-pick";
        pick.innerHTML =
          '<button type="button" class="enc-pick__trigger" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="enc-pick__label"><span class="enc-pick__value"></span></span>' +
            '<span class="enc-pick__chevron" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="enc-pick__panel" role="listbox" hidden></div>';
        field.insertBefore(pick, options);

        var trigger = pick.querySelector(".enc-pick__trigger");
        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = pick.classList.contains("is-open");
          closeAll(wrapper);
          if (!open) openPick(field, pick);
        });
      }
      refreshPick(field, pick);
    });
  }

  function choices(field) {
    return Array.prototype.map.call(field.querySelectorAll(".notion-form__checkbox-label"), function (label, i) {
      var text = label.querySelector(".notion-form__checkbox-text");
      var input = label.querySelector("input");
      return { label: label, index: i, text: text ? text.textContent.trim() : "", checked: !!(input && input.checked) };
    });
  }

  function refreshPick(field, pick) {
    var picked = choices(field).filter(function (c) { return c.checked; })[0];
    var holder = pick.querySelector(".enc-pick__label");
    var value = holder.querySelector(".enc-pick__value");
    var label = labelOf(field);
    var text = picked ? picked.text : (/^select\b/i.test(label) ? label : "Select a " + label.toLowerCase());
    if (value.textContent === text && holder.getAttribute("data-enc-for") === text) return;
    value.textContent = text;
    holder.setAttribute("data-enc-for", text);
    var old = holder.querySelector(".enc-mark");
    if (old) old.remove();
    var well = picked ? mark(picked.text, picked.index, glyphs()) : null;
    if (well) holder.insertBefore(well, value);
    pick.classList.toggle("has-value", !!picked);
  }

  function openPick(field, pick) {
    var panel = pick.querySelector(".enc-pick__panel");
    var map = glyphs();
    panel.innerHTML = "";
    choices(field).forEach(function (c) {
      var opt = document.createElement("button");
      opt.type = "button";
      opt.className = "enc-pick__option";
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", c.checked ? "true" : "false");
      var left = document.createElement("span");
      left.className = "enc-pick__label";
      var well = mark(c.text, c.index, map);
      if (well) left.appendChild(well);
      var name = document.createElement("span");
      name.textContent = c.text;
      left.appendChild(name);
      opt.appendChild(left);
      var tick = document.createElement("span");
      tick.className = "enc-pick__tick";
      tick.setAttribute("aria-hidden", "true");
      tick.textContent = "✓";
      opt.appendChild(tick);
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!c.checked) c.label.click();
        closeAll(field.closest(".notion-form__wrapper"));
        setTimeout(function () { refreshPick(field, pick); }, 0);
      });
      panel.appendChild(opt);
    });

    // Open downward unless there is too little room below and more above; cap the height to
    // whichever room it uses (the design's rule: flip when under 220px below, 140–368px tall).
    var r = pick.querySelector(".enc-pick__trigger").getBoundingClientRect();
    var below = window.innerHeight - r.bottom - 14;
    var above = r.top - 14;
    var up = below < 220 && above > below;
    pick.classList.toggle("opens-up", up);
    panel.style.maxHeight = Math.max(140, Math.min(368, up ? above : below)) + "px";

    panel.hidden = false;
    pick.classList.add("is-open");
    pick.querySelector(".enc-pick__trigger").setAttribute("aria-expanded", "true");
  }

  function closeAll(scope) {
    (scope || document).querySelectorAll(".enc-pick.is-open").forEach(function (p) {
      p.classList.remove("is-open");
      p.querySelector(".enc-pick__panel").hidden = true;
      p.querySelector(".enc-pick__trigger").setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".enc-pick")) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  /* 4. Everything, idempotently */
  function enhance() {
    document.querySelectorAll(".notion-form__wrapper").forEach(function (wrapper) {
      var field = amountField(wrapper);
      if (!field) return;
      wrapper.setAttribute("data-enc-dial", "");
      field.setAttribute("data-enc-amount", "");
      buildDial(wrapper, field);
      buildPicks(wrapper);
      var button = wrapper.querySelector(".notion-form__submit-button > button");
      if (button && button.getAttribute("data-enc-label") !== SEND_LABEL) {
        button.setAttribute("data-enc-label", SEND_LABEL);
      }
    });
  }

  var queued = false;
  var observer = new MutationObserver(function (mutations) {
    if (queued) return;
    // ignore mutations this script caused inside its own widgets
    var relevant = mutations.some(function (m) {
      return !(m.target.closest && m.target.closest(".enc-dial, .enc-pick"));
    });
    if (!relevant) return;
    queued = true;
    setTimeout(function () { queued = false; enhance(); }, 50);
  });

  function start() {
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   The figures — design "Metrics Patterns", Z: "Each figure, its own move" (2026-10-24).

   Four pinned screens (home.css 00), each driven by its own run of scroll: 0 as the screen's top
   meets the top of the window, 1 as its pinned stage lets go. The move plays over the first 0.8
   and holds for the rest.
     Staked      the sum typed in behind a caret, a rule drawn under it, then the byline. A reveal,
                 not a split: --z-x is the typed width, measured per character with a Range, so
                 the heading keeps its one text node
     Delegators  the windows of a skyline light, one building a mainnet, and the count runs with
                 them. The heights are the hidden paragraph site-data writes, largest first and
                 with no names (Terra's building is its endorsed validator's own delegators, the
                 others' count spread over the rest — site-data, jobs/homepage/skyline.mjs)
     Mainnets    the wheel of the mainnets' glyphs turns round the count at its hub, which runs
                 with it, 1 at the first name and the set's count at the last; the current one
                 ringed and named, with its testnet row's Role after the note — from the Networks
                 set (window.encCounts)
     Uptime      the bar draws to the figure, the figure runs with it, "Almost" lights and the
                 down line shows once it is done
   The running figures are the headings' own text, rewritten as they run and Notion's again at the
   end. The one text this writes from elsewhere is the mainnet's name and role under the wheel,
   which neither Notion nor CSS can turn with the scroll. Reduced motion: every screen settled. */
(function () {
  var BAND = "block-3dae800a513880b493f9e17a6928281c";
  var STAKED = "block-07ef8a96f4f046bbb64c085e90cf8387", SUM = "block-7c60fb1ac5db40e5b728673e64c2c369";
  var DELEGATORS = "block-48456287c6fc416bb4ed4663ed95d8f9", COUNT = "block-d037b468382b4576b931199899b3e0e4";
  var HEIGHTS = "block-403e800a513881fe9bfeca039a9b2d95";   /* "Building heights …: 3613 1946 …" */
  var MAINNETS = "block-f763a6014900434ebcfb57466446ac5b", HUB = "block-5a0aab755b8e46faa72c1be176e0eb9f";
  var NOTE = "block-403e800a5138810f8280d9ce87ef331b";      /* "Mainnet validator, in the active set." */
  var UPTIME = "block-979cee822a0342cb8745a2eaa128411a", PCT = "block-403e800a51388197a723f1b39e7e7b87";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function $(id) { return document.getElementById(id); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function ease3(u) { return u * u * (3 - 2 * u); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  /* a glyph from Super's image service at twice its drawn size or more (CLAUDE.md, "Glyphs are drawn
     from Super's image service") */
  function sized(url, w) {
    var m = /[?&]url=([^&]+)/.exec(url || ""), orig = m ? decodeURIComponent(m[1]) : (url || "");
    if (!/^https:\/\/assets\.super\.so\/[^?#]+\.(png|jpe?g|webp)(?:[?#]|$)/i.test(orig)) return url;
    return "/_next/image?url=" + encodeURIComponent(orig) + "&w=" + w + "&q=75";
  }

  /* 0 → 1 through a screen; reduced motion is always at the end */
  function progress(sec) {
    if (reduced.matches) return 1;
    var r = sec.getBoundingClientRect(), max = r.height - window.innerHeight;
    return max > 0 ? clamp01(-r.top / max) : 0;
  }
  function onScreen(sec) {
    var r = sec.getBoundingClientRect();
    return r.height > 0 && r.bottom > -50 && r.top < window.innerHeight + 50;
  }

  /* write only what differs: a builder that rewrites its own page wakes every observer on it */
  function setVar(e, name, v) { if (e.style.getPropertyValue(name) !== v) e.style.setProperty(name, v); }
  function setAttr(e, name, v) { if (e.getAttribute(name) !== v) e.setAttribute(name, v); }
  function textNode(e) {
    var w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.trim()) return n;
    return null;
  }
  /* a running figure: Notion's text, kept the first time it is seen (and again whenever Super
     renders a new one), and rewritten in place as it runs */
  function original(e) {
    var now = e.textContent.trim();
    if (!e.encZ || (now !== e.encZ.wrote && now !== e.encZ.orig)) e.encZ = { orig: now, wrote: now };
    return e.encZ.orig;
  }
  function setFigure(e, v) {
    var n = textNode(e);
    if (n && n.nodeValue !== v) n.nodeValue = v;
    if (e.encZ) e.encZ.wrote = v;
  }

  /* ── 01 · the sum typed in ── */
  var edges = null, edgesKey = "";
  function measure(h) {
    var n = textNode(h);
    if (!n) return null;
    var box = h.getBoundingClientRect(), key = n.nodeValue + "|" + box.width + "|" + getComputedStyle(h).fontSize;
    if (edges && key === edgesKey) return edges;
    var rg = document.createRange(), out = [0];
    for (var i = 1; i <= n.nodeValue.length; i++) {
      rg.setStart(n, 0); rg.setEnd(n, i);
      out.push(rg.getBoundingClientRect().right - box.left);
    }
    edgesKey = key; edges = out;
    return out;
  }
  function stake(sec, p) {
    var h = $(SUM), e = h && measure(h);
    if (!e) return;
    var q = Math.min(1, p / 0.8), n = e.length - 1, k = Math.round(clamp01(q / 0.6) * n);
    setAttr(sec, "data-enc-z-typed", k === 0 ? "0" : k < n ? "typing" : "done");
    setVar(sec, "--z-x", (k < n ? e[k] : e[n] + 40).toFixed(1) + "px");
    setVar(sec, "--z-ul", ease3(clamp01((q - 0.6) / 0.22)).toFixed(4));
    setVar(sec, "--z-by", q >= 0.85 ? "1" : "0");
  }

  /* ── 02 · the skyline: every building on one window grid, so a window is a delegator anywhere;
     the pitch is the largest at which every building fits (the file's search, its floor taken from
     1px to a quarter, or a phone's buildings ran off the top of the screen) ── */
  var sky = null;
  function heights() {
    var p = $(HEIGHTS), m = p ? p.textContent.split(":").pop().match(/\d+/g) : null;
    return (m || []).map(Number).filter(function (n) { return n > 0; });
  }
  function layout(W, H, hs) {
    var N = 0, nB = hs.length, gap = 6, bw = (W - gap * (nB - 1)) / nB, i, k;
    for (i = 0; i < nB; i++) N += hs[i];
    function fit(wp) {
      var t = 0, cols = Math.max(1, Math.floor((bw - 6) / wp)), rows = Math.max(0, Math.floor((H - 26) / wp));
      for (var j = 0; j < nB; j++) t += Math.min(hs[j], cols * rows);
      return t;
    }
    var lo = 0.25, hi = 60;
    for (i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (fit(m) >= N) lo = m; else hi = m; }
    var wp = lo, cols = Math.max(1, Math.floor((bw - 6) / wp)), B = [], win = [];
    for (i = 0; i < nB; i++) {
      var h = Math.ceil(hs[i] / cols) * wp + 6, x = i * (bw + gap);
      B.push([x, H - h, bw, h]);
      for (k = 0; k < hs[i]; k++) win.push([x + 3 + (k % cols) * wp, H - 3 - (Math.floor(k / cols) + 1) * wp]);
    }
    return { B: B, win: win, ws: wp * 0.62, N: N };
  }
  function skyline(sec, p) {
    var cv = sec.querySelector(".enc-z-sky canvas"), hs = heights();
    if (!cv || !hs.length) return;
    var W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    var e = ease3(Math.min(1, p / 0.8)), key = W + "x" + H + "|" + hs.join(" ");
    if (!sky || sky.key !== key) { sky = layout(W, H, hs); sky.key = key; sky.k = -1; }
    var k = Math.round(e * sky.N);
    var count = $(COUNT), total = count ? parseInt(original(count).replace(/\D/g, ""), 10) : NaN;
    if (total >= 0) setFigure(count, k === sky.N ? original(count) : fmt(e * total));
    if (k === sky.k) return;
    sky.k = k;
    var dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var ctx = cv.getContext("2d"), i, w;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(250,250,248,.22)"; ctx.lineWidth = 1;
    sky.B.forEach(function (b) { ctx.strokeRect(b[0] + 0.5, b[1] + 0.5, b[2] - 1, b[3]); });
    ctx.fillStyle = "rgba(250,250,248,.07)"; ctx.beginPath();
    for (i = k; i < sky.win.length; i++) { w = sky.win[i]; ctx.rect(w[0], w[1], sky.ws, sky.ws); }
    ctx.fill();
    ctx.fillStyle = "rgba(250,250,248,.85)"; ctx.beginPath();
    for (i = 0; i < k; i++) { w = sky.win[i]; ctx.rect(w[0], w[1], sky.ws, sky.ws); }
    ctx.fill();
  }

  /* ── 03 · the wheel: well k sits k steps of 360/n round, counter-rotated to stay upright ── */
  var mains = null, asked = false, current = -1;
  function wheel(sec, p) {
    var wh = sec.querySelector(".enc-z-wheel"), name = sec.querySelector(".enc-z-name"), role = sec.querySelector(".enc-z-role");
    if (!wh || !mains || !mains.length) return;
    var n = mains.length, T = 360 / n, x = p * (n - 1), ci = Math.max(0, Math.min(n - 1, Math.round(x)));
    /* the count runs with the names (the user, 2026-10-24: "28 mainnets count should increase as we
       scroll"; the file's own script does the same). Marked as a running figure, Why Stake's script,
       which sets the heading to the set's count, leaves it to this; a heading Super renders anew is
       its again until the wheel next turns */
    var hub = $(HUB);
    if (hub) { original(hub); setFigure(hub, String(ci + 1)); }
    if (!reduced.matches) {
      var r = "rotate(" + (-x * T).toFixed(2) + "deg)";
      if (wh.style.transform !== r) wh.style.transform = r;
      setVar(wh, "--zq", (x * T).toFixed(2) + "deg");
    }
    if (ci === current && name && name.firstChild.nodeValue) return;
    current = ci;
    Array.prototype.forEach.call(wh.children, function (w, k) { if (k === ci) setAttr(w, "data-on", ""); else w.removeAttribute("data-on"); });
    var m = mains[ci];
    if (name && name.firstChild.nodeValue !== m.name) name.firstChild.nodeValue = m.name;
    var said = m.role ? " " + m.role.replace(/\.$/, "") + "." : "";
    if (role && role.firstChild.nodeValue !== said) role.firstChild.nodeValue = said;
  }

  /* ── 04 · the uptime rule ── */
  function uptime(sec, p) {
    var f = $(PCT);
    if (!f) return;
    var orig = original(f), U = parseFloat(orig);
    if (!(U > 0)) return;
    var q = Math.min(1, p / 0.8), share = q * U / 100, done = q >= 1;
    var dec = ((orig.split(".")[1] || "").match(/^\d*/) || [""])[0].length;
    setVar(sec, "--z-up", share.toFixed(5));
    setFigure(f, done ? orig : (share * 100).toFixed(dec) + "%");
    setVar(sec, "--z-alm", done ? "#FAFAF8" : "#93978F");
    setVar(sec, "--z-down", done ? "1" : "0");
  }

  var raf = 0;
  function frame() {
    raf = 0;
    if (!$(BAND)) return;
    [[STAKED, stake], [DELEGATORS, skyline], [MAINNETS, wheel], [UPTIME, uptime]].forEach(function (s) {
      var sec = $(s[0]);
      if (sec && onScreen(sec)) s[1](sec, progress(sec));
    });
  }
  function schedule() { if (!raf) raf = window.requestAnimationFrame(frame); }

  /* the decoration each screen needs, added once and again if Super renders the band anew */
  function build() {
    if (!$(BAND)) return;
    var d = $(DELEGATORS), u = $(UPTIME), m = $(MAINNETS), c;
    if (d && !d.querySelector(".enc-z-sky") && (c = d.querySelector(":scope > .notion-callout__content"))) {
      var s = el("div", "enc-z-sky");
      s.setAttribute("aria-hidden", "true");
      s.appendChild(document.createElement("canvas"));
      c.appendChild(s);
      sky = null;
    }
    if (u && !u.querySelector(".enc-z-bar") && (c = u.querySelector(":scope > .notion-callout__content"))) {
      var b = el("div", "enc-z-bar");
      b.setAttribute("aria-hidden", "true");
      b.appendChild(document.createElement("i"));
      c.appendChild(b);
    }
    if (!asked && typeof window.encCounts === "function") {
      asked = true;
      window.encCounts().then(function (counts) {
        mains = counts && counts.list ? counts.list.filter(function (x) { return x.mainnet; }) : [];
        build();
      });
    }
    if (m && mains && mains.length && !m.querySelector(".enc-z-wheel") && (c = m.querySelector(":scope > .notion-callout__content"))) {
      var box = el("div", "enc-z-wheelbox"), wh = el("div", "enc-z-wheel"), T = 360 / mains.length;
      box.setAttribute("aria-hidden", "true");
      mains.forEach(function (x, k) {
        var a = k * T * Math.PI / 180, w = el("span", "enc-z-well");
        w.style.left = (50 + 46 * Math.cos(a)).toFixed(3) + "%";
        w.style.top = (50 + 46 * Math.sin(a)).toFixed(3) + "%";
        w.style.background = TINTS[k % TINTS.length];
        if (x.glyph) { var img = new Image(); img.alt = ""; img.decoding = "async"; img.src = sized(x.glyph, 128); w.appendChild(img); }
        wh.appendChild(w);
      });
      box.appendChild(wh);
      c.appendChild(box);
      var note = $(NOTE);
      if (note && !m.querySelector(".enc-z-name")) {
        var nm = el("span", "enc-z-name");
        nm.setAttribute("aria-live", "polite");
        nm.appendChild(document.createTextNode(""));
        note.parentNode.insertBefore(nm, note);
      }
      if (note && !note.querySelector(".enc-z-role")) {
        var rl = el("span", "enc-z-role");
        rl.appendChild(document.createTextNode(""));
        note.appendChild(rl);
      }
      current = -1;
    }
    schedule();
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () { sky = null; edges = null; schedule(); });
  if (reduced.addEventListener) reduced.addEventListener("change", schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { edges = null; schedule(); });
  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (x) {
      var e = x.target.nodeType === 1 ? x.target : x.target.parentElement;
      return e && e.closest && e.closest(".enc-z-sky, .enc-z-bar, .enc-z-wheelbox, .enc-z-name, .enc-z-role");
    })) return;
    clearTimeout(t); t = setTimeout(build, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage decks — exact snapping for the one-screen sections.

   THE GEOMETRY STAYS CSS. home.css lays Who we are out as one full screen (09b). The stats band and
   the testimonials were decks here too until 2026-10-24; the figures' four screens (Z, "The
   figures" above) and the testimonials' pile (I, "Homepage testimonials" below) are driven by their
   scroll, so nothing pages them, and no deck is registered now. That works
   without JavaScript — but ordinary scrolling can come to rest anywhere, including half-way
   through a panel sliding over the one before it. This script only decides where scrolling
   stops.

   STOPS. Every panel contributes one stop: the scroll position at which it is pinned at the top
   of the screen (its deck's top + index × panel height). Each one-screen section (the audience
   split, Services, Who we are, the networks) contributes a single stop.

   INSIDE A DECK (between its first and last stop) scrolling is paged:
     - a wheel or trackpad gesture moves exactly one panel, animated, and the rest of that
       gesture's momentum is swallowed so a flick cannot skip three quotes;
     - anything else that moves the page (keys, the scrollbar, touch) is let through, and when it
       comes to rest the page settles on the next stop in the direction it was moving.
   At the deck's last stop, scrolling on down leaves the deck normally; at its first, scrolling
   up does. Nothing outside a deck is intercepted.

   NEAR A STOP, outside any deck (arriving from above, leaving from below, and Who we are):
   coming to rest within a third of a screen of a stop settles onto it. Further away is left
   alone, so the rest of the page scrolls the way it always did.

   WHY NOT CSS SCROLL SNAP. Recorded in home.css 00c until it went with the stat deck (git show
   v384:home.css): on the document it either never engages
   (proximity) or captures the whole page (mandatory), and a nested snap container aligns to its
   own edge rather than the screen. The proximity snap Who we are used is removed in favour of
   this, because a CSS snap on html also fights a scripted scroll.

   Each deck is used only while its CSS geometry is active (panels computed sticky; the
   one-screen sections above 900px). Reduced motion jumps instead of animating. */
(function () {
  var TEAM = "block-3dbe800a513880c5862ae676c8d06994";
  // one-screen sections that settle to the top of the viewport (not paged): Who we are, Services,
  // the audience split, the networks and Why Stake (2026-10-24)
  var SCREENS = [TEAM, "block-3dbe800a5138800d8a72c99cdde9bc3f", "block-3dae800a51388006a57be06b8ebea78e",
    "block-3dbe800a513880c09163d3ed4ab436fd", "block-3dce800a513880349091dbe0cd0650a7"];

  var NEAR = 0.33;       // of a screen: how close a resting page must be to a stop to settle on it
  var EPS = 2;           // px: "on" a stop
  var QUIET = 180;       // ms without wheel events before a resting page is settled
  var gestureUntil = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  /* Decks, measured fresh each time: layout changes with the viewport and with Super re-renders.
     A deck of sticky panels would be measured here as the testimonials were (git show v385:home.js):
     from its box's bottom, since sticky panels report their stuck position. */
  function decks() {
    var out = [];
    if (window.matchMedia("(min-width: 901px)").matches) {
      SCREENS.forEach(function (id) {
        var el = document.getElementById(id);
        // a section well over a screen tall is no stop: settling would pull a reader out of the
        // middle of it back to its top (Why Stake, its cards stacked, between 901 and 1024)
        if (el && el.offsetHeight <= window.innerHeight * 1.25) out.push({ id: id, stops: [Math.round(docTop(el))], h: window.innerHeight });
      });
    }
    return out;
  }

  /* Measurements are cached: reading layout on every scroll frame forces the browser to
     recalculate it mid-scroll, which is visible as stutter on a page this size. The cache is
     dropped on resize and whenever Super changes the page. */
  var cache = null;
  function stops() { return cache || (cache = decks()); }
  function invalidate() { cache = null; }

  /* The browser's own smooth scroll, not a scripted one. A per-frame window.scrollTo runs on the
     main thread and stutters under full-screen sticky panels; behavior: "smooth" is animated by
     the compositor. The first version animated by hand and was visibly choppy. */
  var anim = null;
  function scrollToY(target) {
    target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    if (Math.abs(target - window.scrollY) < 1) { lastRest = target; return; }
    var smooth = !reduced.matches;
    if (anim) clearTimeout(anim.timer);
    anim = { target: target };
    // ends when the scroll arrives (checked on scrollend / scroll) or after a safety timeout
    anim.timer = setTimeout(finish, smooth ? 900 : 50);
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "instant" });
  }
  function finish() {
    if (!anim) return;
    clearTimeout(anim.timer);
    lastRest = window.scrollY;
    anim = null;
  }
  function arrived() {
    if (anim && Math.abs(window.scrollY - anim.target) <= 1) finish();
  }

  function deckAt(y, list) {
    for (var i = 0; i < list.length; i++) {
      var s = list[i].stops;
      if (s.length > 1 && y > s[0] - EPS && y < s[s.length - 1] + EPS) return list[i];
    }
    return null;
  }

  var onStop = function (d, y) {
    for (var k = 0; k < d.stops.length; k++) if (Math.abs(d.stops[k] - y) <= EPS) return true;
    return false;
  };

  /* From a position between stops (arriving in the deck, or a scroll that stopped mid-panel):
     the stop in the direction of travel, counting one that is less than half a panel behind —
     so arriving 50px past the first panel lands on the first panel, not the second. */
  function landStop(d, y, dir) {
    var s = d.stops, half = d.h / 2;
    if (dir > 0) { for (var i = 0; i < s.length; i++) if (s[i] >= y - half) return s[i]; return s[s.length - 1]; }
    for (var j = s.length - 1; j >= 0; j--) if (s[j] <= y + half) return s[j];
    return s[0];
  }

  /* The stop to go to from y, moving in dir, inside deck d; null = leave the deck. */
  function nextStop(d, y, dir) {
    var s = d.stops;
    if (dir > 0) { for (var i = 0; i < s.length; i++) if (s[i] > y + EPS) return s[i]; }
    else { for (var j = s.length - 1; j >= 0; j--) if (s[j] < y - EPS) return s[j]; }
    return null;
  }

  /* ── wheel and trackpad: one gesture, one panel ──

     A trackpad keeps firing wheel events for seconds after the fingers lift (momentum), with
     deltas that shrink. The first version treated every event within 180ms of the last as the
     same gesture, so the lock stretched across the whole momentum tail and a new swipe made in
     that time was swallowed — snapping "worked, then needed 4–5 seconds and several tries".

     A new gesture is recognised by either
       - a pause: no wheel event for NEW_GAP ms, or
       - a rise after a real decay: at least MIN_LOCK ms after the page turned, once the deltas
         have fallen below half their peak, a delta four times the smallest since then (and at
         least 20) can only be a fresh swipe.
     A swipe's own deltas wobble — they dip and climb while the fingers are still moving — so the
     first version of this rule (any rise after any dip) sometimes fired mid-swipe and turned two
     panels at once (v10). MIN_LOCK and the half-peak decay are what stop that.
     A new gesture made while a snap is still moving pages on from where that snap is going. */
  var NEW_GAP = 250, MIN_LOCK = 450;
  var lastWheel = 0, lockedAt = 0, peak = 0, tailMin = Infinity, decayed = false, gestureLocked = false;
  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch-zoom, sideways
    var now = performance.now(), abs = Math.abs(e.deltaY);
    var gap = now - lastWheel;
    lastWheel = now;
    gestureUntil = now + QUIET;
    if (gestureLocked && gap <= NEW_GAP) {
      peak = Math.max(peak, abs);
      if (abs < peak * 0.5) decayed = true;
      var rise = decayed && now - lockedAt > MIN_LOCK && abs > Math.max(tailMin * 4, 20);
      if (decayed) tailMin = Math.min(tailMin, abs);
      if (!rise) { e.preventDefault(); return; }
    }
    gestureLocked = false;

    var list = stops(), dir = e.deltaY > 0 ? 1 : -1;
    var y = anim ? anim.target : window.scrollY; // mid-snap: page on from where it is heading
    var d = deckAt(y, list);
    if (!d) {
      // CATCH A ONE-SCREEN SECTION, OR A DECK FROM OUTSIDE. A swipe towards a one-screen section's
      // top (the audience split, Services, Who we are), or towards a deck's first panel from above
      // or its last from below, that starts within half a screen of it lands on it. Before the
      // deck ends were caught, a swipe up out of the audience split came to rest 306px down the
      // stats' last panel (2026-10-15). Waiting for the scroll to rest did not work on a trackpad:
      // momentum wheel events run right up to the end of the scroll, so the rest check always saw
      // a gesture in progress and never settled.
      var half = window.innerHeight / 2, catchAt = null;
      list.forEach(function (dk) {
        var s0 = dir > 0 ? dk.stops[0] : dk.stops[dk.stops.length - 1], gap = (s0 - y) * dir;
        if (gap > EPS && gap < half && (catchAt === null || gap < Math.abs(catchAt - y))) catchAt = s0;
      });
      if (catchAt !== null) {
        e.preventDefault();
        gestureLocked = true; lockedAt = now; peak = abs; tailMin = Infinity; decayed = false;
        scrollToY(catchAt);
        return;
      }
      if (anim) e.preventDefault();
      return;
    }
    var target = onStop(d, y) ? nextStop(d, y, dir) : landStop(d, y, dir);
    if (target === null) { if (anim) e.preventDefault(); return; } // end of the deck: scroll out normally
    e.preventDefault();
    gestureLocked = true; lockedAt = now; peak = abs; tailMin = Infinity; decayed = false;
    scrollToY(target);
  }, { passive: false });

  /* ── everything else: settle when the page comes to rest ── */
  var lastRest = window.scrollY, touching = false, restTimer = 0;
  var retry = 0;
  function settle() {
    if (anim || touching) return;
    // a trackpad's momentum ends with the scroll: if a gesture still looks live, look again once
    // it has been quiet, instead of giving up (which is why the one-screen sections never settled)
    if (performance.now() < gestureUntil) { clearTimeout(retry); retry = setTimeout(settle, QUIET + 20); return; }
    var list = stops(), y = window.scrollY;
    var d = deckAt(y, list);
    if (d) {
      if (onStop(d, y)) { lastRest = y; return; }
      var dir = y >= lastRest ? 1 : -1;
      // moved off a stop of this deck (keys, a drag): carry on to the next; otherwise land
      var t = onStop(d, lastRest) && Math.abs(y - lastRest) < d.h ? nextStop(d, lastRest, dir) : landStop(d, y, dir);
      scrollToY(t === null ? landStop(d, y, dir) : t);
      return;
    }
    var best = null, vh = window.innerHeight;
    list.forEach(function (dk) {
      dk.stops.forEach(function (s) {
        if (Math.abs(s - y) <= vh * NEAR && (best === null || Math.abs(s - y) < Math.abs(best - y))) best = s;
      });
    });
    if (best !== null && Math.abs(best - y) > EPS) scrollToY(best);
    else lastRest = y;
  }
  var hasScrollEnd = "onscrollend" in window;
  if (hasScrollEnd) window.addEventListener("scrollend", function () { arrived(); setTimeout(settle, 30); });
  window.addEventListener("scroll", function () {
    if (!hasScrollEnd) { clearTimeout(restTimer); restTimer = setTimeout(function () { arrived(); settle(); }, 140); }
    arrived();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });

  /* Super re-renders after load and on in-app navigation; measure again when it does. */
  new MutationObserver(invalidate).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", invalidate);
  window.addEventListener("load", invalidate);
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage testimonials — design "Testimonials Patterns", I: "Portrait and the pile" (2026-10-24).

   The testimonials callout (#testimonials, home.css 09) is two columns on ink: the current speaker
   pinned at portrait scale on the left, the gallery's cards as a sticky pile on the right, step i
   pinned at 56 + i·G. A step shows its quote whole; as the next one climbs over it, p runs 0 → 1
   (how much of the body the next step covers; the last step's from the band's tail). The words
   fade over the first 0.4, the highlighted phrase slides and scales from its place in the sentence
   into the step's title row over 0.3–0.9, and at 0.92 the title's own copy takes over. Reduced
   motion crossfades the phrase instead. Below 760px the steps read as a list and nothing folds.

   BUILT FROM NOTION: each Testimonial row's Name, Title ("Role, Org"), quote and its highlight,
   Photo's first file (the face, cropped square in the upload) and Glyph's first file. This writes
   three things Notion has but cannot place: the stage (each speaker's face, name, role, org and
   network well, one layer each, the current one shown), each step's title (a copy of its
   highlight; CSS adds the capital and the full stop) and the count after the heading ("01 / 05"). */
(function () {
  var SECTION = "block-3dae800a51388066b66ffeeb9bdb1550", HEADING = "block-6df87cb2d8994ba0b7fe797aa933840d";
  var GALLERY = "block-f853251f87b0400d9d5b7e3fe71e57e5";
  var QUOTE = ".property-3f46544e", TITLE = ".property-463b4979", GLYPH = ".property-7b4e4a59";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var list = window.matchMedia("(max-width: 760px)");

  function $(id) { return document.getElementById(id); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  function num(x, d) { return String(+x.toFixed(d)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  /* an image from Super's image service at twice its drawn size or more (CLAUDE.md, "Glyphs are
     drawn from Super's image service"); Notion's own signed URLs, served until Super copies a new
     file, pass through */
  function sized(url, w) {
    var m = /[?&]url=([^&]+)/.exec(url || ""), orig = m ? decodeURIComponent(m[1]) : (url || "");
    if (!/^https:\/\/assets\.super\.so\/[^?#]+\.(png|jpe?g|webp)(?:[?#]|$)/i.test(orig)) return url;
    return "/_next/image?url=" + encodeURIComponent(orig) + "&w=" + w + "&q=75";
  }
  function original(img) {
    var f = img.closest("[data-full-size]");
    return (f && f.getAttribute("data-full-size")) || img.currentSrc || img.src || "";
  }
  /* write only what differs: a builder that rewrites its own page wakes every observer on it */
  function setVar(e, name, v) { if (e.style.getPropertyValue(name) !== v) e.style.setProperty(name, v); }
  function setStyle(e, prop, v) { if (e.style[prop] !== v) e.style[prop] = v; }
  function setAttr(e, name, v) { if (e.getAttribute(name) !== v) e.setAttribute(name, v); }
  /* G: the height each pinned step keeps, smaller on short screens so five titles and a body fit */
  function gap() { return Math.max(56, Math.min(96, (window.innerHeight - 320) / 4)); }

  function read(card) {
    var cover = card.querySelector(".notion-collection-card__cover"), glyph = card.querySelector(GLYPH + " img");
    var name = card.querySelector(".notion-property__title"), title = card.querySelector(TITLE);
    var hl = card.querySelector(QUOTE + " .highlighted-background");
    var t = title ? title.textContent.trim() : "", k = t.lastIndexOf(", ");
    /* a highlight takes the stop or comma after it in Notion, so the sentence cannot break before
       it once the phrase is a block of its own; the title ends on CSS's full stop instead */
    return { id: card.id, name: name ? name.textContent.trim() : "", role: k > 0 ? t.slice(0, k) : t, org: k > 0 ? t.slice(k + 2) : "",
             face: cover ? original(cover) : "", glyph: glyph ? original(glyph) : "",
             phrase: hl ? hl.textContent.trim().replace(/[.,;:!?]+$/, "") : "" };
  }

  var key = "", steps = [], stage = null, layers = [], offsets = null, tail = 0, current = -1;

  function build() {
    var sec = $(SECTION), c = sec && sec.querySelector(":scope > .notion-callout__content");
    var g = $(GALLERY), cards = g ? [].slice.call(g.querySelectorAll(".notion-collection-card")) : [];
    if (!c || !cards.length) return;
    var data = cards.map(read), k = JSON.stringify(data);
    var fresh = c.querySelector(":scope > .enc-t-stage") === stage && stage &&
      cards.every(function (x) { return x.querySelector(":scope > .enc-t-head"); });
    if (k === key && fresh) { schedule(); return; }
    key = k;

    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    stage = el("div", "enc-t-stage");
    var eye = el("span", "enc-t-eye"), box = el("div", "enc-t-layers");
    eye.setAttribute("aria-hidden", "true");
    box.setAttribute("aria-live", "polite");
    layers = data.map(function (d) {
      var who = el("div", "enc-t-who"), names = el("div", "enc-t-names"), nm = el("span", "enc-t-name"), rl = el("span", "enc-t-role");
      var row = el("div", "enc-t-org"), well = el("span", "enc-t-well"), org = el("span", "enc-t-orgname");
      var face = new Image();
      face.className = "enc-t-face"; face.alt = ""; face.loading = "lazy"; face.decoding = "async";
      if (d.face) face.src = sized(d.face, 640);
      if (d.glyph) { var gl = new Image(); gl.alt = ""; gl.loading = "lazy"; gl.decoding = "async"; gl.src = sized(d.glyph, 128); well.appendChild(gl); }
      nm.textContent = d.name; rl.textContent = d.role; org.textContent = d.org;
      names.appendChild(nm); names.appendChild(rl);
      row.appendChild(well); row.appendChild(org);
      who.appendChild(face); who.appendChild(names); who.appendChild(row);
      box.appendChild(who);
      return who;
    });
    stage.appendChild(eye); stage.appendChild(box);
    c.appendChild(stage);
    if (window.ResizeObserver) new ResizeObserver(place).observe(box);

    steps = cards.map(function (card, i) {
      var head = card.querySelector(":scope > .enc-t-head");
      if (!head) {
        head = el("div", "enc-t-head");
        head.setAttribute("aria-hidden", "true"); /* the quote below says it */
        head.appendChild(el("span", "enc-t-n"));
        head.appendChild(el("span", "enc-t-phrase"));
        card.insertBefore(head, card.firstChild);
      }
      var ph = head.querySelector(".enc-t-phrase");
      if (ph.textContent !== data[i].phrase) ph.textContent = data[i].phrase;
      return { card: card, body: card.querySelector(".notion-collection-card__content"),
               st: card.querySelector(QUOTE + " .highlighted-background"), ph: ph };
    });
    offsets = null; current = -1;
    place();
    schedule();
  }

  /* the heading sits in the stage's empty first line: the stage's content is centred, so the line
     moves with the speaker's height */
  function place() {
    var sec = $(SECTION), eye = stage && stage.firstChild;
    if (!sec || !eye || list.matches || !stage.isConnected) return;
    setVar(sec, "--t-eye", Math.round(eye.getBoundingClientRect().top - stage.getBoundingClientRect().top) + "px");
  }

  /* where each phrase goes, from where it rests: the move is within its own step, so it does not
     change with the scroll, only with the layout */
  function measure() {
    steps.forEach(function (s) { if (s.st) s.st.style.transform = "none"; });
    offsets = steps.map(function (s) {
      if (!s.st) return null;
      var a = s.st.getBoundingClientRect(), b = s.ph.getBoundingClientRect();
      return { x: b.left - a.left, y: b.top - a.top,
               k: (parseFloat(getComputedStyle(s.ph).fontSize) || 1) / (parseFloat(getComputedStyle(s.st).fontSize) || 1) };
    });
    var g = $(GALLERY), gal = g && g.querySelector(".notion-collection-gallery");
    tail = gal ? parseFloat(getComputedStyle(gal, "::after").height) || 0 : 0;
  }

  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function update() {
    queued = false;
    var sec = $(SECTION);
    if (!sec || !steps.length || !steps[0].card.isConnected) return;
    var r = sec.getBoundingClientRect(), vh = window.innerHeight;
    if (!r.height || r.bottom < -50 || r.top > vh + 50) return;
    if (!offsets) measure();
    /* every read first, then every write: a write between reads makes the browser lay out again */
    var G = gap(), act = 0, fold = !list.matches;
    var ps = steps.map(function (s, i) {
      if (s.card.getBoundingClientRect().top <= 56 + i * G + 2) act = i;
      if (!fold || !s.body) return 0;
      var b = s.body.getBoundingClientRect(), next = steps[i + 1];
      if (next) return clamp01((b.bottom - next.card.getBoundingClientRect().top) / Math.max(1, b.height));
      return tail ? clamp01((vh - (r.bottom - tail)) / tail) : 0;
    });
    steps.forEach(function (s, i) {
      var p = ps[i];
      if (s.body) setVar(s.body, "--t-w", num(1 - clamp01(p / 0.4), 3));
      if (!s.st) return;
      if (reduced.matches) {
        var x = clamp01((p - 0.4) / 0.4);
        setStyle(s.st, "transform", "none");
        setStyle(s.st, "opacity", num(1 - x, 3));
        setStyle(s.ph, "opacity", num(x, 3));
        return;
      }
      var u = clamp01((p - 0.3) / 0.6), e = u * u * (3 - 2 * u), o = offsets[i], done = p >= 0.92;
      setStyle(s.st, "transform", u > 0 && o
        ? "translate(" + num(o.x * e, 1) + "px, " + num(o.y * e, 1) + "px) scale(" + num(1 + (o.k - 1) * e, 4) + ")" : "none");
      setStyle(s.st, "opacity", done ? "0" : "1");
      setStyle(s.ph, "opacity", done ? "1" : "0");
    });
    if (act !== current) {
      current = act;
      layers.forEach(function (l, k) {
        if (k === act) setAttr(l, "data-on", "");
        else if (l.hasAttribute("data-on")) l.removeAttribute("data-on");
      });
      var h = $(HEADING);
      if (h) setAttr(h, "data-enc-t-at", pad(act + 1) + " / " + pad(steps.length));
    }
  }

  function relayout() { offsets = null; place(); schedule(); }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", relayout);
  [reduced, list].forEach(function (m) { if (m.addEventListener) m.addEventListener("change", relayout); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (x) {
      var e = x.target.nodeType === 1 ? x.target : x.target.parentElement;
      return e && e.closest && e.closest(".enc-t-stage, .enc-t-head");
    })) return;
    clearTimeout(t); t = setTimeout(build, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();

/* Homepage sections by address (/#testimonials, /#block-…, /team) — moved to anchors.js, which lands a
   section by its name on every page (2026-10-23). */


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage networks — design "Networks Section", 21b "Columns · paper".

   The right half of the section becomes five vertical columns of pastel glyph discs, drifting
   alternately up and down; the left half is the copy (heading, one sentence, buttons).

   BUILT FROM NOTION. The discs are read from the networks gallery that is already on the page
   (#block-d07ab52b…): each card's cover is the glyph, its title the name, its link the target.
   Adding, removing or reordering networks in Notion changes the columns; nothing is listed here.

     Column = tier: the gallery order is read in fives, so the first five sit in column one.
     Speed carries the same signal: leftmost slowest (25s), rightmost fastest (11s).
     Loop: each column holds its discs twice with the spacing on the discs, so translating by
     exactly -50% lands on an identical frame — the seam cannot show.

   No kicker above the heading: the design's "25 networks · mainnet and testnet" line was added
   here at first and removed at the user's request (2026-09-14).
   The gallery itself stays in the page, hidden, as the no-JavaScript fallback and as the glyph
   source for the institutional staking listbox above. Styles: home-dial.css, "NETWORKS COLUMNS".
   Reduced motion: the columns stand still. */
(function () {
  // The new "Networks set" database (2026-09-16) is the source wherever it is on the page; the
  // old homepage gallery is the fallback until a view of the new one is placed here.
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var GALLERY = "block-d07ab52b60ba4788bd8df0c9e74c5ad4";
  var PER_COL = 5, COLS = 5;
  var SPEEDS = [25, 21, 17, 14, 11];
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];

  function networks(gallery) {
    return Array.prototype.map.call(gallery.querySelectorAll(".notion-collection-card"), function (card) {
      var img = card.querySelector("img.notion-collection-card__cover");
      var title = card.querySelector(".notion-property__title");
      var link = card.querySelector("a[href]");
      return {
        name: title ? title.textContent.trim() : "",
        href: link ? link.getAttribute("href") : null,
        src: img ? img.getAttribute("src") : null,
        srcset: img ? img.getAttribute("srcset") : null
      };
    }).filter(function (n) { return n.src; });
  }

  function disc(n, i, copy) {
    var el = document.createElement(n.href ? "a" : "span");
    el.className = "enc-net__disc";
    el.style.background = TINTS[i % TINTS.length];
    if (n.href) el.setAttribute("href", n.href);
    if (copy) { el.setAttribute("aria-hidden", "true"); el.setAttribute("tabindex", "-1"); }
    else el.setAttribute("aria-label", n.name);
    // The name shows as a styled label on hover (home-dial.css), not a native title tooltip —
    // the browser's grey box looked dated and trailed behind the moving disc.
    var label = document.createElement("span");
    label.className = "enc-net__name";
    label.setAttribute("aria-hidden", "true");
    label.textContent = n.name;
    var img = document.createElement("img");
    img.alt = "";
    img.src = n.src;
    if (n.srcset) img.setAttribute("srcset", n.srcset);
    img.setAttribute("sizes", "66px");
    img.decoding = "async";
    el.appendChild(img);
    el.appendChild(label);
    return el;
  }

  function build() {
    var gallery = document.getElementById(SET_DB) || document.getElementById(GALLERY);
    if (!gallery) return;
    var column = gallery.parentElement;              // the right-hand Notion column
    var row = column && column.closest(".notion-column-list");
    if (!row) return;
    var list = networks(gallery);
    if (!list.length) return;
    var sig = list.map(function (n) { return n.name; }).join("|");
    var existing = column.querySelector(":scope > .enc-net");
    if (existing && existing.getAttribute("data-sig") === sig && row.hasAttribute("data-enc-net")) return;
    if (existing) existing.remove();

    var box = document.createElement("div");
    box.className = "enc-net";
    box.setAttribute("data-sig", sig);
    box.setAttribute("role", "list");
    box.setAttribute("aria-label", "Networks we run");
    for (var c = 0; c < COLS; c++) {
      var items = list.slice(c * PER_COL, c * PER_COL + PER_COL);
      if (!items.length) break;
      var col = document.createElement("div");
      col.className = "enc-net__col";
      var track = document.createElement("div");
      track.className = "enc-net__track";
      track.setAttribute("data-dir", c % 2 ? "down" : "up");
      track.style.animationDuration = (SPEEDS[c] || 11) + "s";
      [false, true].forEach(function (copy) {
        items.forEach(function (n, i) {
          var d = disc(n, c * PER_COL + i, copy);
          if (!copy) d.setAttribute("role", "listitem");
          track.appendChild(d);
        });
      });
      col.appendChild(track);
      box.appendChild(col);
    }
    column.insertBefore(box, gallery);

    row.setAttribute("data-enc-net", "");
  }

  var t = 0;
  new MutationObserver(function (muts) {
    var ours = muts.every(function (m) { return m.target.closest && m.target.closest(".enc-net"); });
    if (ours) return;
    clearTimeout(t); t = setTimeout(build, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* The homepage's governance table (37h) is built by governance.js since 2026-09-26 — the same
   rows as the record, drawn by main.css §13d. This file built it until then. */


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage blog — design "Blog Highlights" (its second pass, 2026-10-24: "Deep dives." and no
   dot pager; the pager this file drew from the first one is gone).

   The blog gallery's first three posts become a horizontal rail of large ink cards that snap to
   the centre. (A script-made "Read every post" link was removed: buttons and text come from
   Notion, never from this file — the section's own button is left as it is.)

     card    ink (#2A2C28) at 1.91:1, 12px corners; the post's Cover glyph bleeding off the
             bottom-right corner in a pastel tint picked per post; the category and the date in grey
             mono along the top; the title in Outfit; the Encapsulate wordmark at the foot
     rail    scroll-snap x mandatory, cards clamp(300px, 72vw, 840px), 22px apart, full width

   BUILT FROM NOTION: title, link, date and tags are read from the gallery cards. The category is
   the post's first tag other than "Informative" (or "Informative" when that is all it has). The
   glyph is the post's Cover image; its tint is a stable pseudo-random pick from the pastels. The gallery stays in the
   page, hidden, as the no-JavaScript fallback. The intro row above it (heading, paragraph, link)
   is Notion's; this only marks it [data-enc-blog-intro]. Styles: home-dial.css, "BLOG RAIL". */
(function () {
  var GALLERY = "block-67d891d07f914f4699b81d1765e1f04f";
  var COUNT = 3;
  var PASTEL = { green: "#DCEEC7", yellow: "#F8E8B3", red: "#F7DCE7", pink: "#F7DCE7",
    blue: "#D2E3F6", orange: "#F8DDC6", purple: "#E4DBF2", brown: "#F8DDC6", gray: "#E2E2DB" };
  var SHAPES = ["50%", "999px 999px 0 0"];     // only for a post with no Cover image
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];

  // "Random" but stable: the same post always gets the same tint, so the colour does not change
  // between visits; neighbours are nudged apart so two cards in a row never match.
  function tintFor(title, prev) {
    var h = 0;
    for (var i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
    var t = TINTS[h % TINTS.length];
    return t === prev ? TINTS[(h + 1) % TINTS.length] : t;
  }
  var script = document.currentScript;
  var BASE = script && /\/dist\/home\.js/.test(script.src) ? script.src.replace(/\/dist\/home\.js.*$/, "/") : null;
  var WORDMARK = BASE ? BASE + "svg/wordmark-reversed.svg" : null;

  function posts(gallery) {
    return Array.prototype.slice.call(gallery.querySelectorAll(".notion-collection-card"), 0, COUNT).map(function (card) {
      var title = card.querySelector(".notion-property__title");
      var link = card.querySelector("a[href]");
      var cover = card.querySelector("img.notion-collection-card__cover");
      var date = card.querySelector(".notion-property__date");
      var pills = Array.prototype.map.call(card.querySelectorAll(".notion-property__select .notion-pill"), function (p) {
        var m = p.className.match(/pill-([a-z]+)/);
        return { name: p.textContent.trim(), tint: PASTEL[m && m[1]] || PASTEL.green };
      });
      var tag = pills.filter(function (p) { return !/^informative$/i.test(p.name); })[0] || pills[0] || { name: "", tint: PASTEL.green };
      return { title: title ? title.textContent.trim() : "", href: link ? link.getAttribute("href") : null,
        date: date ? date.textContent.trim() : "", tag: tag, glyph: cover ? cover.getAttribute("src") : null };
    }).map(function (p, i, all) {
      p.tint = tintFor(p.title, i ? all[i - 1].tint : null);
      return p;
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function card(p, i) {
    var a = el(p.href ? "a" : "div", "enc-blog__card");
    if (p.href) a.setAttribute("href", p.href);
    a.setAttribute("data-card", String(i));
    // The post's Cover image (a transparent black glyph) used as a stencil and filled with the
    // post's tint, so the mark takes any colour exactly. Without a cover, a tinted shape.
    var shape = el("span", p.glyph ? "enc-blog__glyph" : "enc-blog__shape");
    shape.style.background = p.tint;
    if (p.glyph) {
      var url = 'url("' + p.glyph.replace(/"/g, "%22") + '")';
      shape.style.webkitMaskImage = url;
      shape.style.maskImage = url;
    } else {
      shape.style.borderRadius = SHAPES[i % SHAPES.length];
    }
    var body = el("div", "enc-blog__body");
    var top = el("div", "enc-blog__top");
    top.appendChild(el("span", "enc-blog__cat", p.tag.name));
    top.appendChild(el("span", "enc-blog__date", p.date));
    body.appendChild(top);
    body.appendChild(el("h3", "enc-blog__title", p.title));
    if (WORDMARK) {
      var mark = el("img", "enc-blog__mark");
      mark.src = WORDMARK;
      mark.alt = "Encapsulate";
      body.appendChild(mark);
    }
    a.appendChild(shape);
    a.appendChild(body);
    return a;
  }

  function build() {
    var gallery = document.getElementById(GALLERY);
    if (!gallery) return;
    var list = posts(gallery);
    if (!list.length) return;
    var sig = list.map(function (p) { return p.title; }).join("|");
    var rail = gallery.previousElementSibling && gallery.previousElementSibling.classList.contains("enc-blog") ? gallery.previousElementSibling : null;

    // The section's intro is the Notion column row just above the gallery: heading and paragraph
    // on the left, the Read every post link (a Notion callout) on the right.
    var intro = null, n = gallery.previousElementSibling;
    while (n) {
      if (n.classList.contains("notion-column-list")) { if (n.querySelector(".notion-heading")) intro = n; break; }
      if (!(n.classList.contains("enc-blog") || n.classList.contains("notion-text"))) break;
      n = n.previousElementSibling;
    }
    if (intro && !intro.hasAttribute("data-enc-blog-intro")) intro.setAttribute("data-enc-blog-intro", "");
    if (rail && rail.getAttribute("data-sig") === sig) return;
    if (rail) rail.remove();

    rail = el("div", "enc-blog");
    rail.setAttribute("data-sig", sig);
    list.forEach(function (p, i) { rail.appendChild(card(p, i)); });
    gallery.parentElement.insertBefore(rail, gallery);
    gallery.setAttribute("data-enc-hidden", "");
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-blog"); })) return;
    clearTimeout(t); t = setTimeout(build, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage services — design "Services Section", 42m: SERVICES SELECTION.

   Behaviour only; every word and image is in Notion. Pointing at, focusing or clicking a service
   in the list marks its card [data-active], which home.css (§09a) uses to light the list item and
   show that service's cover in the screen. The mark stays when the pointer leaves, so the screen
   keeps the last service picked instead of snapping back to the first. List items are made
   focusable so the keyboard can pick too. */
(function () {
  var GALLERY = "block-3dbe800a5138804d8ee8c6d84679cc63";

  function select(card) {
    var gallery = card.closest(".notion-collection-gallery");
    if (!gallery) return;
    gallery.querySelectorAll(".notion-collection-card[data-active]").forEach(function (c) {
      if (c !== card) c.removeAttribute("data-active");
    });
    if (!card.hasAttribute("data-active")) card.setAttribute("data-active", "");
  }

  function wire() {
    var block = document.getElementById(GALLERY);
    if (!block) return;
    var cards = block.querySelectorAll(".notion-collection-card");
    if (!cards.length) return;
    if (!block.querySelector(".notion-collection-card[data-active]")) cards[0].setAttribute("data-active", "");

    // SHARP COVERS. Super serves covers through its image optimizer as WebP at quality 75 (the only
    // quality it accepts), sized for a 780px card: 828px on 1x screens, 1920px on 2x. The screen
    // shows them near 955px, so UI screenshots came out soft — upscaled on 1x, compression-smeared
    // everywhere. The original upload (a 2x PNG on assets.super.so) is used instead.
    block.querySelectorAll("img.notion-collection-card__cover").forEach(function (img) {
      if (img.hasAttribute("data-enc-original")) return;
      var m = (img.getAttribute("src") || "").match(/[?&]url=([^&]+)/);
      if (!m) return;
      var original = decodeURIComponent(m[1]);
      if (!/^https:\/\/assets\.super\.so\//.test(original)) return;
      img.setAttribute("data-enc-original", "");
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src = original;
    });
    cards.forEach(function (card) {
      var item = card.querySelector(".notion-collection-card__content");
      if (!item || item.hasAttribute("data-enc-svc")) return;
      item.setAttribute("data-enc-svc", "");
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      ["mouseenter", "focus", "click"].forEach(function (ev) {
        item.addEventListener(ev, function () { select(card); });
      });
    });
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.type === "attributes"; })) return;
    clearTimeout(t); t = setTimeout(wire, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage Why Stake — design "Why Stake", 49a: WHY STAKE GRAPHICS.

   Each claim card gets a small data graphic, by position in the Notion gallery:
     1  one dot per network — the count of cards in the homepage Networks gallery, filled in the
        pastels, on a 10-wide grid with the rest of the row left as open rings
     2  a year meter — one segment per year from 2020 to now, the current year left open
     3  one bar per chain — twelve bars of varying height (commission differs by chain)

   DERIVED FIGURES (the user's explicit choice, so they never go stale): the first card's
   "Caption right" is written as "<networks> secured", and the second card's "Figure" as the
   years since 2020 and its "Caption right" as "<this year> in progress". Everything else on the
   cards is Notion text. Styles: home-dial.css, "WHY STAKE GRAPHICS"; layout: home.css §09.

   THE NETWORK COUNT is the Networks set's own: its mainnet rows, read once per visit from the
   all-stages view on /services (navbar.js, window.encCounts). It drives the first card's dots
   and caption and the count of the figures' mainnets screen (the "28" at the wheel's hub), whose digits
   are replaced and nothing else, until the wheel runs the count itself. Until it arrives, or if it
   cannot be read, the homepage gallery's card count is used, and the screen keeps Notion's number. */
(function () {
  var GALLERY = "block-bd1e4d485a0d424394add746d8e3cd35";
  var NETWORKS = "block-d07ab52b60ba4788bd8df0c9e74c5ad4";
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var START = 2020;
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var BARS = [58, 74, 46, 88, 62, 70, 52, 80, 66, 44, 76, 60];
  var FIGURE = ".property-70594a51", CAPTION_RIGHT = ".property-6f505657";
  var STAT = "block-5a0aab755b8e46faa72c1be176e0eb9f";   /* the mainnets screen's count (was "Number of Networks Supported") */
  var fromSet = 0, asked = false;

  function span(cls) { var e = document.createElement("span"); e.className = cls; return e; }

  function tally(n) {
    var g = span("enc-why__tally");
    var cells = Math.max(30, Math.ceil(n / 10) * 10);
    for (var i = 0; i < cells; i++) {
      var d = span("enc-why__dot");
      if (i < n) d.style.background = TINTS[i % TINTS.length];
      else d.setAttribute("data-open", "");
      g.appendChild(d);
    }
    return g;
  }

  function meter(now) {
    var g = span("enc-why__meter");
    for (var y = START; y <= now; y++) {
      var s = span("enc-why__year");
      s.title = String(y);
      if (y === now) s.setAttribute("data-open", "");
      else s.style.background = TINTS[(y - START) % TINTS.length];
      g.appendChild(s);
    }
    return g;
  }

  function bars() {
    var g = span("enc-why__bars");
    BARS.forEach(function (h, i) {
      var b = span("enc-why__bar");
      b.style.height = h + "%";
      b.style.background = TINTS[i % TINTS.length];
      g.appendChild(b);
    });
    return g;
  }

  function setText(el, text) { if (el && el.textContent !== text) el.textContent = text; }

  function setNumber(el, n) {
    if (!el || !(n >= 0)) return;
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = walk.nextNode())) {
      if (!/\d/.test(node.nodeValue)) continue;
      var v = node.nodeValue.replace(/\d+/, String(n));
      if (v !== node.nodeValue) node.nodeValue = v;
      return;
    }
  }

  function apply() {
    if (!asked && typeof window.encCounts === "function" &&
        (document.getElementById(GALLERY) || document.getElementById(STAT))) {
      asked = true;
      window.encCounts().then(function (c) {
        if (c && c.mainnet) { fromSet = c.mainnet; apply(); }
      });
    }
    var stat = document.getElementById(STAT);
    if (fromSet && stat && !stat.encZ) setNumber(stat, fromSet);   /* .encZ: the figures' wheel runs it */
    var block = document.getElementById(GALLERY);
    if (!block) return;
    var cards = block.querySelectorAll(".notion-collection-card");
    if (cards.length < 3) return;
    // count from the new "Networks set" where it is on the page, the old gallery otherwise
    var netBox = document.getElementById(SET_DB) || document.getElementById(NETWORKS);
    var nets = fromSet || (netBox ? netBox.querySelectorAll(".notion-collection-card").length : 0);
    var now = new Date().getFullYear();
    var sig = nets + "|" + now;

    Array.prototype.forEach.call(cards, function (card, i) {
      var content = card.querySelector(".notion-collection-card__content");
      if (!content || i > 2) return;
      var existing = content.querySelector(":scope > .enc-why__graphic");
      if (!existing || existing.getAttribute("data-sig") !== sig) {
        if (existing) existing.remove();
        var wrap = span("enc-why__graphic");
        wrap.setAttribute("data-sig", sig);
        wrap.setAttribute("aria-hidden", "true");
        wrap.appendChild(i === 0 ? tally(nets) : i === 1 ? meter(now) : bars());
        content.appendChild(wrap);
      }
      if (i === 0 && nets) setText(card.querySelector(CAPTION_RIGHT), nets + " secured");
      if (i === 1) {
        setText(card.querySelector(FIGURE), String(now - START));
        setText(card.querySelector(CAPTION_RIGHT), now + " in progress");
      }
    });
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) {
      var el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      // and the figures' running headings (the delegators and the uptime), rewritten as they scroll
      return el && el.closest && el.closest(".enc-why__graphic, " + FIGURE + ", " + CAPTION_RIGHT + ", #" + STAT +
        ", #block-d037b468382b4576b931199899b3e0e4, #block-403e800a51388197a723f1b39e7e7b87, .enc-z-name, .enc-z-role");
    })) return;
    clearTimeout(t); t = setTimeout(apply, 60);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage contact — design "Contact Section", 48c: CONTACT COPY.

   Behaviour only. The address lives in Notion as a mailto: link; the Copy callout next to it puts
   that address on the clipboard, turns green and reads "Copied" for a second (the one word this
   script shows — the design's confirmation), then returns to its Notion label. Keyboard: the
   callout is focusable and Enter/Space copy too. */
(function () {
  var ROW = "block-3dce800a51388036af93f757deaec9c1";

  function wire() {
    var row = document.getElementById(ROW);
    if (!row) return;
    var link = row.querySelector('a[href^="mailto:"]');
    var copy = row.querySelector(":scope > .notion-column:last-child .notion-callout");
    if (!link || !copy || copy.hasAttribute("data-enc-copy")) return;
    copy.setAttribute("data-enc-copy", "");
    copy.setAttribute("role", "button");
    copy.setAttribute("tabindex", "0");
    copy.setAttribute("aria-label", "Copy our email address");
    var label = copy.querySelector(".notion-callout__content .notion-semantic-string") || copy.querySelector(".notion-callout__content");
    var timer = 0;

    function done(ok) {
      if (!ok) { window.location.href = link.getAttribute("href"); return; }
      var original = label.textContent;
      copy.setAttribute("data-copied", "");
      label.textContent = "Copied";
      clearTimeout(timer);
      timer = setTimeout(function () { copy.removeAttribute("data-copied"); label.textContent = original; }, 1000);
    }

    function doCopy(e) {
      if (e) e.preventDefault();
      if (copy.hasAttribute("data-copied")) return;
      var address = decodeURIComponent(link.getAttribute("href").replace(/^mailto:/i, "").split("?")[0]);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    }

    copy.addEventListener("click", doCopy);
    copy.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") doCopy(e);
    });
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest("[data-enc-copy]"); })) return;
    clearTimeout(t); t = setTimeout(wire, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();

/* The homepage loop (2026-09-21). It was a Wistia embed whose own ground was rgb(253,251,250);
   the file is now ours, regrounded to the paper the page stands on and served beside the CSS.
   Notion gives us a plain <video>, so this makes it behave like a background: muted, looping,
   inline, no controls, and playing as soon as it can. Autoplay is only allowed while muted. */
(function () {
  function loop() {
    Array.prototype.forEach.call(document.querySelectorAll("video"), function (v) {
      if (v.hasAttribute("data-enc-loop")) return;
      if (!/home-loop/.test(v.currentSrc || v.src || "")) {
        var s = v.querySelector("source");
        if (!s || !/home-loop/.test(s.src || "")) return;
      }
      v.setAttribute("data-enc-loop", "");
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.autoplay = true;
      v.controls = false;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("preload", "auto");
      var go = v.play();
      if (go && go.catch) go.catch(function () {});
    });
  }
  /* No debounce here: every frame this waits is a frame of Notion's own control bar. The work
     is one querySelectorAll("video") on a page with one video, and each is marked once. */
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(loop, 0); })
    .observe(document.body, { childList: true, subtree: true });
  loop();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loop);
})();

/* Who we are keeps the last name picked (design "Who We Are", 2026-09-25: its state.active stays
   where the reader left it). The section is CSS alone, and with CSS alone the active person is
   whoever is under the pointer, else the first — so on the way from a name to that person's
   LinkedIn link the section fell back to the first person, and the link went with it. A name under
   the pointer, a tap on it, or focus reaching a card's link marks that card [data-enc-pick], and
   home.css makes the picked card the active one. Delegated on the document, so Super's re-renders
   need nothing; a card it rebuilds loses the mark, and hover rules again until the next pick. */
(function () {
  var TEAM = "#block-6a8e93a3b7ed4648ba82d58ee6546962";
  function pick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var team = t.closest(TEAM);
    if (!team) return;
    if (e.type !== "focusin" && !t.closest(".property-78553e7a")) return;
    var card = t.closest(".notion-collection-card");
    if (!card || card.hasAttribute("data-enc-pick")) return;
    Array.prototype.forEach.call(team.querySelectorAll("[data-enc-pick]"), function (c) {
      c.removeAttribute("data-enc-pick");
    });
    card.setAttribute("data-enc-pick", "");
  }
  document.addEventListener("pointerover", pick);
  document.addEventListener("click", pick);
  document.addEventListener("focusin", pick);
})();

/* Who we are: the right column stacked as the file stacks it (checked against "Who We Are",
   2026-09-27). The file sets two stacks side by side and centres them on each other: the names and
   the intro on the left; the portrait, the quote 23px under it (clamp(18px, 2.6vh, 30px)) and the
   role 12px under that on the right. Notion gives the right-hand blocks no common parent — every
   person's portrait, quote and role are grid items of the section — so CSS alone set the quote in
   the intro's row, 28px under where the file has it, and the extra row lifted the names 11px.
   This measures the two stacks — nothing but heights — and hands them to home.css as offsets
   (--who-rt, the right stack's inset when the left is taller; --who-lt, the left's when the right
   is; per card --who-qh / --who-rpad, its quote's height and its role's centring in a row as tall
   as the LinkedIn badge). home.css places the blocks by them only once [data-enc-who-fit] is set,
   so without this the section keeps its grid rows. Above 900px only; under it every person is
   stacked anyway. Heights, not positions, are read, so the offsets cannot feed back into them. */
(function () {
  var BAND = "block-3dbe800a513880c5862ae676c8d06994";
  var TEAM = "block-6a8e93a3b7ed4648ba82d58ee6546962";
  var INTRO = "block-3dbe800a513880d4a675d114ff684187";
  var wide = window.matchMedia("(min-width: 901px)");
  function px(el, prop) { return parseFloat(getComputedStyle(el)[prop]) || 0; }
  function set(el, k, v) { if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v); }
  function fit() {
    var band = document.getElementById(BAND), team = document.getElementById(TEAM), intro = document.getElementById(INTRO);
    var content = band && band.querySelector(":scope > .notion-callout__content");
    if (!content || !team || !intro) return;
    if (!wide.matches) {
      if (content.hasAttribute("data-enc-who-fit")) content.removeAttribute("data-enc-who-fit");
      return;
    }
    var left = 0, names = 0, portrait = 0, quotes = 0;
    Array.prototype.forEach.call(team.querySelectorAll(".notion-collection-card"), function (card) {
      var name = card.querySelector(".property-78553e7a");
      if (name) { left += name.offsetHeight + px(name, "marginBottom"); names++; }
      var cover = card.querySelector(".notion-collection-card__cover");
      if (cover) portrait = Math.max(portrait, cover.offsetHeight);
      var quote = card.querySelector(".property-64664c63"), role = card.querySelector(".property-59696475");
      var link = card.querySelector(".property-5a534040");
      var qh = quote ? quote.offsetHeight : 0, rh = role ? role.offsetHeight : 0;
      var row = Math.max(rh, link ? link.offsetHeight : 0);   // the file's role row: role and link, centred
      set(card, "--who-qh", qh + "px");
      set(card, "--who-rpad", ((row - rh) / 2).toFixed(1) + "px");
      quotes = Math.max(quotes, qh + 12 + row);
    });
    if (!names || !portrait) return;
    left += px(intro, "marginTop") + intro.offsetHeight;
    var gap = Math.min(30, Math.max(18, window.innerHeight * 0.026));   // clamp(18px, 2.6vh, 30px)
    var right = portrait + gap + quotes;
    set(content, "--who-rt", Math.max(0, (left - right) / 2).toFixed(1) + "px");
    set(content, "--who-lt", Math.max(0, (right - left) / 2).toFixed(1) + "px");
    if (!content.hasAttribute("data-enc-who-fit")) content.setAttribute("data-enc-who-fit", "");
  }
  var queued = 0;
  function soon() { if (!queued) queued = requestAnimationFrame(function () { queued = 0; fit(); }); }
  window.addEventListener("resize", soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  window.addEventListener("load", soon);
  // only a change in the section (or one that replaces it) is a reason to measure again
  new MutationObserver(function (muts) {
    var band = document.getElementById(BAND);
    if (!band) return;
    for (var i = 0; i < muts.length; i++) {
      var t = muts[i].target;
      if (t === band || band.contains(t) || (t.contains && t.contains(band))) { soon(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });
  soon();
})();

/* AUDIENCE SPLIT (51m, 2026-10-14): each half's "What you get" is a Notion toggle, and Super draws
   its summary as a div that answers a click only. This makes it the button the design has: Tab
   reaches it, Enter and Space press it, and aria-expanded (from Super's .open) with aria-controls
   say what it opens. The opening itself stays Super's. Attributes are written only when they
   differ, so the observer that re-arms a re-rendered section never wakes itself. */
(function () {
  var FORK = "block-3dae800a51388006a57be06b8ebea78e";
  function arm() {
    var fork = document.getElementById(FORK);
    if (!fork) return;
    Array.prototype.forEach.call(fork.querySelectorAll(":scope > .notion-column > .notion-toggle"), function (t) {
      var s = t.querySelector(":scope > .notion-toggle__summary");
      var c = t.querySelector(":scope > .notion-toggle__content");
      if (!s) return;
      if (s.getAttribute("role") !== "button") s.setAttribute("role", "button");
      if (s.getAttribute("tabindex") !== "0") s.setAttribute("tabindex", "0");
      var open = t.classList.contains("open") ? "true" : "false";
      if (s.getAttribute("aria-expanded") !== open) s.setAttribute("aria-expanded", open);
      if (c && t.id) {
        var id = t.id + "-points";
        if (c.id !== id) c.id = id;
        if (s.getAttribute("aria-controls") !== id) s.setAttribute("aria-controls", id);
      }
    });
  }
  function summary(e) {
    var s = e.target && e.target.closest && e.target.closest(".notion-toggle__summary");
    return s && s.closest("#" + FORK) ? s : null;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var s = summary(e);
    if (!s || e.target !== s) return;
    e.preventDefault();
    s.click();
  });
  // Super flips .open on the click; read it back once it has
  document.addEventListener("click", function (e) {
    if (summary(e)) setTimeout(arm, 0);
  });
  new MutationObserver(function (muts) {
    var fork = document.getElementById(FORK);
    if (!fork) return;
    for (var i = 0; i < muts.length; i++) {
      var t = muts[i].target;
      if (t === fork || fork.contains(t) || (t.contains && t.contains(fork))) { arm(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });
  arm();
})();
