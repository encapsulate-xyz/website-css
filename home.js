/* Homepage script — the institutional staking dial (design "Institutional Form", 22a "The dial").

   PASTE: dist/home-head.html into Super → homepage → Code → Head. build.py makes it from
   home-dial.css (as a <style> block — the dial's styles) and this file (as a <script>). The base
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
