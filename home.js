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
    return map;
  }

  function mark(name, index, map) {
    var src = map[name.toLowerCase()];
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
   Homepage decks — exact snapping for the stats band, the testimonials and Who we are.

   THE GEOMETRY STAYS CSS. home.css already lays the stats and the testimonials out as sticky,
   one-viewport panels (sections 00c and 09) and Who we are as one full screen (09b). That works
   without JavaScript — but ordinary scrolling can come to rest anywhere, including half-way
   through a panel sliding over the one before it. This script only decides where scrolling
   stops.

   STOPS. Every panel contributes one stop: the scroll position at which it is pinned at the top
   of the screen (its deck's top + index × panel height). Who we are contributes a single stop.

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

   WHY NOT CSS SCROLL SNAP. Recorded in home.css 00c: on the document it either never engages
   (proximity) or captures the whole page (mandatory), and a nested snap container aligns to its
   own edge rather than the screen. The proximity snap Who we are used is removed in favour of
   this, because a CSS snap on html also fights a scripted scroll.

   THE TESTIMONIAL RAIL. With the scroll position known, the rail marks its active row itself
   (data-enc-active) instead of every panel drawing a marker at its own row underneath — the
   CSS-only marker slid off the rail mid-scroll. Rows can be clicked to go to that quote.

   Each deck is used only while its CSS geometry is active (panels computed sticky; Who we are
   above 900px). Reduced motion jumps instead of animating. */
(function () {
  var STATS = "block-3dae800a513880b493f9e17a6928281c";
  var QUOTES = "block-f853251f87b0400d9d5b7e3fe71e57e5";
  var QUOTE_SECTION = "block-3dae800a51388066b66ffeeb9bdb1550";
  var RAIL = "block-3dbe800a513880659b03efb665f21e12";
  var TEAM = "block-3dbe800a513880c5862ae676c8d06994";

  var NEAR = 0.33;       // of a screen: how close a resting page must be to a stop to settle on it
  var EPS = 2;           // px: "on" a stop
  var QUIET = 180;       // ms without wheel events that ends a gesture
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  /* Decks, measured fresh each time: layout changes with the viewport and with Super re-renders. */
  function decks() {
    var out = [];
    [[STATS, "#" + STATS + " .notion-callout"], [QUOTES, "#" + QUOTES + " .notion-collection-card"]]
      .forEach(function (d) {
        var box = document.getElementById(d[0]);
        if (!box) return;
        var panels = box.querySelectorAll(d[1]);
        if (panels.length < 2 || getComputedStyle(panels[0]).position !== "sticky") return;
        // Sticky elements report their stuck position, so the run is measured from the box's
        // bottom, which never moves: the panels are the last thing in it, one height each.
        var h = panels[0].offsetHeight;
        var bottom = docTop(box) + box.offsetHeight - (parseFloat(getComputedStyle(box).paddingBottom) || 0);
        var stops = [];
        for (var i = 0; i < panels.length; i++) stops.push(Math.round(bottom - (panels.length - i) * h));
        out.push({ id: d[0], stops: stops, h: h });
      });
    var team = document.getElementById(TEAM);
    if (team && window.matchMedia("(min-width: 901px)").matches) {
      out.push({ id: TEAM, stops: [Math.round(docTop(team))], h: window.innerHeight });
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
    if (Math.abs(target - window.scrollY) < 1) { lastRest = target; paintRail(); return; }
    var smooth = !reduced.matches;
    if (anim) clearTimeout(anim.timer);
    anim = { target: target };
    // ends when the scroll arrives (checked on scrollend / scroll) or after a safety timeout
    anim.timer = setTimeout(finish, smooth ? 1200 : 50);
    window.scrollTo({ top: target, behavior: smooth ? "smooth" : "instant" });
  }
  function finish() {
    if (!anim) return;
    clearTimeout(anim.timer);
    lastRest = window.scrollY;
    anim = null;
    paintRail();
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

  /* ── wheel and trackpad: one gesture, one panel ── */
  var gestureUntil = 0, gestureLocked = false;
  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch-zoom, sideways
    var now = performance.now();
    var inGesture = now < gestureUntil;
    gestureUntil = now + QUIET;
    if (anim || (inGesture && gestureLocked)) { e.preventDefault(); return; }
    gestureLocked = false;
    var list = stops(), y = window.scrollY, dir = e.deltaY > 0 ? 1 : -1;
    var d = deckAt(y, list);
    if (!d) return;
    var target = onStop(d, y) ? nextStop(d, y, dir) : landStop(d, y, dir);
    if (target === null) return; // at the end of the deck: scroll out normally
    e.preventDefault();
    gestureLocked = true;
    scrollToY(target);
  }, { passive: false });

  /* ── everything else: settle when the page comes to rest ── */
  var lastRest = window.scrollY, touching = false, restTimer = 0;
  function settle() {
    if (anim || touching || performance.now() < gestureUntil) return;
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
    paintRail();
  }, { passive: true });
  window.addEventListener("touchstart", function () { touching = true; if (anim) finish(); }, { passive: true });
  window.addEventListener("touchend", function () { touching = false; if (!hasScrollEnd) setTimeout(settle, 140); }, { passive: true });

  /* ── the testimonial rail ── */
  var railQueued = false;
  function paintRail() {
    if (railQueued) return;
    railQueued = true;
    requestAnimationFrame(function () {
      railQueued = false;
      var rail = document.getElementById(RAIL), section = document.getElementById(QUOTE_SECTION);
      if (!rail || !section) return;
      var d = stops().filter(function (x) { return x.id === QUOTES; })[0];
      var rows = rail.querySelectorAll("tbody tr");
      if (!d || !rows.length) { section.removeAttribute("data-enc-deck"); return; }
      section.setAttribute("data-enc-deck", "");
      var i = Math.round((window.scrollY - d.stops[0]) / d.h);
      i = Math.max(0, Math.min(rows.length - 1, i));
      rows.forEach(function (r, n) {
        if (n === i) { if (!r.hasAttribute("data-enc-active")) r.setAttribute("data-enc-active", ""); }
        else if (r.hasAttribute("data-enc-active")) r.removeAttribute("data-enc-active");
        if (!r.hasAttribute("data-enc-go")) {
          r.setAttribute("data-enc-go", "");
          r.addEventListener("click", function () {
            var dd = stops().filter(function (x) { return x.id === QUOTES; })[0];
            if (dd && dd.stops[n] !== undefined) scrollToY(dd.stops[n]);
          });
        }
      });
    });
  }

  /* Super re-renders after load and on in-app navigation; repaint the rail when it does. */
  var t = 0;
  new MutationObserver(function () { invalidate(); clearTimeout(t); t = setTimeout(paintRail, 80); })
    .observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", function () { invalidate(); paintRail(); });
  window.addEventListener("load", invalidate);
  paintRail();
})();
