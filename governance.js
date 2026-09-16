/* /governance-record — design "Governance Record". Linked from the SITE head, because Super never
   executes a page's own script on a client-side navigation.

   The page is the homepage's 37h given the whole record: an ink count band, the pillars band, the
   controls, and the rows. This file does the three things CSS cannot:

     1. the count band's field — one 7px mark per vote, in blocks of a hundred, drawn from the
        figure in the band's own Notion text (the number stays Notion's; only the marks are ours);
     2. each row's chain — the view is grouped by chain, so the group's own heading names it; the
        chain is copied onto the row as a label and a tinted disc, one stable tint per chain;
     3. the search field in the control bar. Super's view picker supplies the chain and outcome
        filters (the record has a view per chain and per outcome), so those are Notion's; an input
        is the one control Notion has no block for. Same recipe as /networks — see CLAUDE.md,
        "Search and sort on a Notion gallery".

   Styles: governance.css, "THE RECORD". */
(function () {
  var BAND = "block-3dde800a513881b1b88dd0b73f874bfe";
  var TABLE = "block-c458e5dd671d4ecb8fc07a15915e4f42";
  var TINTS = ["#DCEEC7", "#F8E8B3", "#D2E3F6", "#F8DDC6", "#F7DCE7"];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // stable per chain, so a chain keeps its colour between visits and between pages
  function tintFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return TINTS[h % TINTS.length];
  }

  /* ── 1 · the count band ── */
  function count() {
    var band = document.getElementById(BAND);
    if (!band) return;
    var content = band.querySelector(":scope > .notion-callout__content");
    if (!content) return;
    var ps = content.querySelectorAll(":scope > p.notion-text");
    if (ps.length < 5) return;
    var total = parseInt((ps[1].textContent || "").replace(/[^\d]/g, ""), 10);
    if (!total) return;
    if (band.getAttribute("data-enc-total") === String(total)) return;
    band.setAttribute("data-enc-total", String(total));

    var old = band.querySelector(".enc-rec__field");
    if (old) old.remove();
    var field = el("div", "enc-rec__field");
    for (var at = 0; at < total; at += 100) {
      var n = Math.min(100, total - at);
      var block = el("div", "enc-rec__hundred");
      block.title = n === 100 ? "100 votes" : n + " votes";
      if ((at / 100) % 2) block.setAttribute("data-dim", "");
      for (var i = 0; i < n; i++) block.appendChild(el("span", "enc-rec__mark"));
      field.appendChild(block);
    }
    ps[4].after(field);
  }

  /* ── 2 · the rows ── */
  function rows() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var sections = box.querySelectorAll(".notion-collection-group__section");
    Array.prototype.forEach.call(sections, function (section) {
      var head = section.querySelector(".notion-collection-group__section-header, [class*='section-header'], summary, h3, h4");
      var name = head ? head.textContent.trim() : "";
      // the header carries a disclosure arrow and sometimes a count; the chain is the first line
      name = name.split("\n")[0].replace(/^[‣▸▾\s]+/, "").replace(/\s*\d+\s*$/, "").trim();
      if (!name) return;
      var tint = tintFor(name.toLowerCase());
      Array.prototype.forEach.call(section.querySelectorAll("tbody tr"), function (tr) {
        var cell = tr.querySelector("td.title");
        if (!cell || cell.querySelector(".enc-rec__mark-disc")) return;
        var disc = el("span", "enc-rec__mark-disc");
        disc.style.background = tint;
        cell.insertBefore(disc, cell.firstChild);
        cell.appendChild(el("span", "enc-rec__chain", name));
        tr.setAttribute("data-enc-row", "");
      });
    });
    box.setAttribute("data-enc-record", "");
  }

  /* ── 3 · the search field ── */
  function search() {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var header = box.querySelector(".notion-collection__header-wrapper");
    if (!header || box.querySelector(".enc-rec__find")) return;
    box.style.position = "relative";

    var field = el("div", "enc-rec__find");
    var input = el("input");
    input.type = "text";
    input.placeholder = "Find a proposal";
    input.setAttribute("aria-label", "Find a proposal by number or title");
    field.appendChild(input);
    // focus on pointerdown: Super cancels pointer events on the document to close its own dropdown,
    // and a cancelled pointerdown focuses nothing
    field.addEventListener("pointerdown", function () { setTimeout(function () { input.focus(); }, 0); });
    input.addEventListener("input", function () { apply(input.value); });
    box.appendChild(field);
  }

  function apply(q) {
    var box = document.getElementById(TABLE);
    if (!box) return;
    var needle = (q || "").trim().toLowerCase();
    Array.prototype.forEach.call(box.querySelectorAll("tbody tr"), function (tr) {
      tr.hidden = !!needle && tr.textContent.toLowerCase().indexOf(needle) < 0;
    });
    // a group with nothing left in it goes with its rows
    Array.prototype.forEach.call(box.querySelectorAll(".notion-collection-group__section"), function (s) {
      var any = Array.prototype.some.call(s.querySelectorAll("tbody tr"), function (tr) { return !tr.hidden; });
      s.hidden = !any;
    });
  }

  function build() { count(); rows(); search(); }

  var t = 0;
  new MutationObserver(function (muts) {
    if (muts.every(function (m) { return m.target.closest && m.target.closest(".enc-rec__field, .enc-rec__find"); })) return;
    clearTimeout(t); t = setTimeout(build, 120);
  }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
