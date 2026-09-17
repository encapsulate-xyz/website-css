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
  // one-screen sections that settle to the top of the viewport (not paged): Who we are, Services
  var SCREENS = [TEAM, "block-3dbe800a5138800d8a72c99cdde9bc3f"];

  var NEAR = 0.33;       // of a screen: how close a resting page must be to a stop to settle on it
  var EPS = 2;           // px: "on" a stop
  var QUIET = 180;       // ms without wheel events before a resting page is settled
  var gestureUntil = 0;
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
    if (window.matchMedia("(min-width: 901px)").matches) {
      SCREENS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) out.push({ id: id, stops: [Math.round(docTop(el))], h: window.innerHeight });
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
    if (Math.abs(target - window.scrollY) < 1) { lastRest = target; paintRail(); return; }
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
      // CATCH A ONE-SCREEN SECTION (Who we are, Services). A swipe towards a section's top that
      // starts within half a screen of it lands on it, as a deck's first panel would. Waiting for
      // the scroll to rest did not work on a trackpad: momentum wheel events run right up to the
      // end of the scroll, so the rest check always saw a gesture in progress and never settled.
      var half = window.innerHeight / 2, catchAt = null;
      list.forEach(function (dk) {
        if (dk.stops.length !== 1) return;
        var s0 = dk.stops[0], gap = (s0 - y) * dir;
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


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage governance table — design "Governance", 37h.

   Each row's chain gets its glyph in a tinted well in front of the name, and the vote pill's
   "YES" is written "Yes". The glyph comes from the homepage networks gallery; the well's tint
   cycles the pastels by row (design 37h, revised). A chain with no card in that gallery keeps just its name. Styles: home.css §09
   (governance) and home-dial.css ("GOVERNANCE CHAIN MARKS"). */
(function () {
  var TABLE = "block-4529386b39be4a9aa44d2dbac56537bd";
  // The new "Networks set" database (2026-09-16) is the source wherever it is on the page; the
  // old homepage gallery is the fallback until a view of the new one is placed here.
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var GALLERY = "block-d07ab52b60ba4788bd8df0c9e74c5ad4";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];

  function chains() {
    var map = {};
    var gallery = document.getElementById(SET_DB) || document.getElementById(GALLERY);
    if (!gallery) return map;
    gallery.querySelectorAll(".notion-collection-card").forEach(function (card, i) {
      var title = card.querySelector(".notion-property__title");
      var img = card.querySelector("img.notion-collection-card__cover");
      if (!title || !img) return;
      var key = title.textContent.trim().toLowerCase();
      if (!map[key]) map[key] = { src: img.getAttribute("src"), srcset: img.getAttribute("srcset"), tint: TINTS[i % TINTS.length] };
    });
    return map;
  }

  function column(table, label) {
    var ths = table.querySelectorAll("thead th");
    for (var i = 0; i < ths.length; i++) if (ths[i].textContent.trim().toLowerCase() === label) return i;
    return -1;
  }

  /* Every cell says what it is, so the row's order never depends on Notion's type classes: since
     2026-09-17 Proposal Id holds "ACP-176" and is rich text, which makes the id, the proof and the
     rationale all td.text. The header carries the property's name. home.css orders on these. */
  var KIND = {
    "proposal title": "proposal", "proposal": "proposal", "name": "proposal",
    "proposal id": "id", "id": "id",
    "chain": "chain", "network": "chain",
    "vote option": "vote", "our vote": "vote", "vote": "vote",
    "voted on": "date", "date": "date",
    "voting proof": "proof", "proof": "proof",
    "rationale": "rationale"
  };
  function mark(table) {
    var ths = table.querySelectorAll("thead th");
    var kinds = Array.prototype.map.call(ths, function (th) {
      return KIND[th.textContent.trim().toLowerCase()] || "";
    });
    if (!kinds.some(Boolean)) return;
    Array.prototype.forEach.call(ths, function (th, i) {
      if (kinds[i] && th.getAttribute("data-enc-cell") !== kinds[i]) th.setAttribute("data-enc-cell", kinds[i]);
    });
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (kinds[i] && td.getAttribute("data-enc-cell") !== kinds[i]) td.setAttribute("data-enc-cell", kinds[i]);
      });
    });
  }

  function apply() {
    var block = document.getElementById(TABLE);
    var table = block && block.querySelector("table");
    if (!table) return;
    mark(table);
    var chainCol = column(table, "chain"), voteCol = column(table, "vote option");
    var map = null;
    var rowIndex = -1;
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      // only the rows on show (home.css keeps six): the table holds the whole voting record, and
      // marking every row fetched a glyph image for hundreds of hidden votes
      if (!tr.offsetParent) return;
      rowIndex++;
      var cells = tr.children;
      var chainPill = chainCol >= 0 && cells[chainCol] && cells[chainCol].querySelector(".notion-pill");
      if (chainPill && !chainPill.querySelector(".enc-chain")) {
        map = map || chains();
        var c = map[chainPill.textContent.trim().toLowerCase()];
        if (c) {
          var well = document.createElement("span");
          well.className = "enc-chain";
          well.style.background = TINTS[rowIndex % TINTS.length]; // 37h: tint by row, not by chain
          var img = document.createElement("img");
          img.alt = "";
          img.src = c.src;
          if (c.srcset) img.setAttribute("srcset", c.srcset);
          img.setAttribute("sizes", "24px");
          well.appendChild(img);
          chainPill.insertBefore(well, chainPill.firstChild);
        }
      }
      var votePill = voteCol >= 0 && cells[voteCol] && cells[voteCol].querySelector(".notion-pill");
      if (votePill && !votePill.hasAttribute("data-enc-vote")) {
        var t = votePill.textContent.trim();
        votePill.setAttribute("data-enc-vote", t);
        votePill.textContent = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      }
    });
  }

  var timer = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-chain, [data-enc-vote]"); })) return;
    clearTimeout(timer); timer = setTimeout(apply, 60);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();


/* ─────────────────────────────────────────────────────────────────────────────────────────────
   Homepage blog — design "Blog Highlights".

   The blog gallery's first three posts become a horizontal rail of large ink cards that snap to
   the centre, with a dot pager on the heading's row. (A script-made "Read every post" link was removed: buttons
   and text come from Notion, never from this file — the section's own button is left as it is.)

     card    ink cover (#3A3D38) at 1.91:1, 12px corners; the post's Cover glyph bleeding off the
             bottom-right corner in a pastel tint picked per post; the category in that tint and the date
             in mono along the top; the title in Outfit; the Encapsulate wordmark at the foot
     rail    scroll-snap x mandatory, cards clamp(300px, 72vw, 840px), 22px apart, full width
     dots    one per post in a paper-2 pill; the active one stretches to a 44px ink bar. Click a
             dot to bring its post to the centre; scrolling the rail moves the active dot

   BUILT FROM NOTION: title, link, date and tags are read from the gallery cards. The category is
   the post's first tag other than "Informative" (or "Informative" when that is all it has). The
   glyph is the post's Cover image; its tint is a stable pseudo-random pick from the pastels. The gallery stays in the
   page, hidden, as the no-JavaScript fallback. Styles: home-dial.css, "BLOG RAIL". The
   heading and the paragraph keep the site's own type. */
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
    var cat = el("span", "enc-blog__cat", p.tag.name);
    cat.style.color = p.tint; // one tint per post, as in the design: category and glyph match
    top.appendChild(cat);
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
    if (rail && rail.getAttribute("data-sig") === sig && document.querySelector(".enc-blog__controls")) return;
    if (rail) rail.remove();

    // The section's intro is the Notion column row just above the gallery: heading and paragraph
    // on the left, the Read every post button (a Notion callout) on the right. The dot pager goes
    // into that right column, in front of the button.
    var intro = null, n = gallery.previousElementSibling;
    while (n) {
      if (n.classList.contains("notion-column-list")) { if (n.querySelector(".notion-heading")) intro = n; break; }
      if (!(n.classList.contains("enc-blog") || n.classList.contains("notion-text"))) break;
      n = n.previousElementSibling;
    }
    var slot = intro ? intro.querySelector(":scope > .notion-column:last-child") : null;

    rail = el("div", "enc-blog");
    rail.setAttribute("data-sig", sig);
    list.forEach(function (p, i) { rail.appendChild(card(p, i)); });
    gallery.parentElement.insertBefore(rail, gallery);
    gallery.setAttribute("data-enc-hidden", "");
    if (intro) intro.setAttribute("data-enc-blog-intro", "");

    var old = document.querySelector(".enc-blog__controls");
    if (old) old.remove();
    var controls = el("div", "enc-blog__controls");
    var dots = el("div", "enc-blog__dots");
    list.forEach(function (p, i) {
      var b = el("button", "enc-blog__dot");
      b.type = "button";
      b.setAttribute("aria-label", "Show post " + (i + 1));
      b.addEventListener("click", function () { goTo(rail, i); });
      dots.appendChild(b);
    });
    controls.appendChild(dots);
    if (slot) slot.insertBefore(controls, slot.firstChild);
    else rail.parentElement.insertBefore(controls, rail);

    rail.__dots = dots;
    rail.addEventListener("scroll", function () { mark(rail, dots); }, { passive: true });
    mark(rail, dots);
  }

  function goTo(rail, i) {
    var c = rail.querySelector('[data-card="' + i + '"]');
    // scroll-snap mandatory cancels smooth scrolling, so the offset is set directly
    if (c) rail.scrollLeft = c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2;
    mark(rail, rail.__dots);
  }

  // The active post is the one whose snap position is nearest the current scroll. Snap positions
  // are clamped to the scrollable range, so the first card (which cannot be centred) owns 0.
  function mark(rail, dots) {
    var max = rail.scrollWidth - rail.clientWidth, best = 0, bestD = Infinity;
    Array.prototype.forEach.call(rail.children, function (c, i) {
      var snap = Math.max(0, Math.min(max, c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2));
      var d = Math.abs(snap - rail.scrollLeft);
      if (d < bestD) { bestD = d; best = i; }
    });
    Array.prototype.forEach.call(dots.children, function (b, i) {
      if (i === best) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-blog, .enc-blog__controls"); })) return;
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
   cards is Notion text. Styles: home-dial.css, "WHY STAKE GRAPHICS"; layout: home.css §09. */
(function () {
  var GALLERY = "block-bd1e4d485a0d424394add746d8e3cd35";
  var NETWORKS = "block-d07ab52b60ba4788bd8df0c9e74c5ad4";
  var SET_DB = "block-3dde800a51388133b7f1d1ccdda08038";
  var START = 2020;
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];
  var BARS = [58, 74, 46, 88, 62, 70, 52, 80, 66, 44, 76, 60];
  var FIGURE = ".property-70594a51", CAPTION_RIGHT = ".property-6f505657";

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

  function apply() {
    var block = document.getElementById(GALLERY);
    if (!block) return;
    var cards = block.querySelectorAll(".notion-collection-card");
    if (cards.length < 3) return;
    // count from the new "Networks set" where it is on the page, the old gallery otherwise
    var netBox = document.getElementById(SET_DB) || document.getElementById(NETWORKS);
    var nets = netBox ? netBox.querySelectorAll(".notion-collection-card").length : 0;
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
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-why__graphic, " + FIGURE + ", " + CAPTION_RIGHT); })) return;
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
