/* /contact-us — design "Contact Booking", section 02. Linked from the SITE head, because Super
   never executes a page's own script on a client-side navigation.

   The page is the cover and then one section in three bands: the ink band that leads with the
   booking (the real cal.com calendar embedded, a spec beside the headline, the institutional route
   folded into a toggle at its foot), the ink "Elsewhere" strip of the four social links, and the
   paper band where writing happens — the Notion form in one well, the address in the other.

   Everything it prints is Notion's: this file only groups the blocks into bands, splits the
   "label · value" lines the design draws as two columns, and gives the Copy button its feedback
   (the same exception the homepage contact section already has). Styles: contact-us.css. */
(function () {
  var PATH = /^\/contact-us\/?$/;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function textOf(n) { return (n.textContent || "").trim(); }

  /* the blocks are found by what they say, not by position: a line added in Notion must not shift
     the whole section */
  function find(blocks, label) {
    for (var i = 0; i < blocks.length; i++) {
      if (textOf(blocks[i]).toLowerCase() === label) return i;
    }
    return -1;
  }

  /* "Length · 30 minutes" is one Notion line; the design sets the label left, the value right */
  function splitRow(p) {
    var parts = textOf(p).split("·");
    if (parts.length < 2) return false;
    p.textContent = "";
    p.classList.add("enc-ct__row");
    p.appendChild(el("span", "enc-ct__k", parts[0].trim()));
    p.appendChild(el("span", "enc-ct__v", parts.slice(1).join("·").trim()));
    return true;
  }

  function copyBehaviour(well) {
    var button = well.querySelector(".notion-callout");
    var link = well.querySelector('a[href^="mailto:"]');
    if (!button || !link || button.hasAttribute("data-enc-copy")) return;
    button.setAttribute("data-enc-copy", "");
    var label = button.querySelector(".notion-link") || button;
    var said = label.textContent;
    button.addEventListener("click", function (e) {
      e.preventDefault();
      var address = decodeURIComponent(link.getAttribute("href").replace(/^mailto:/i, "").split("?")[0]);
      var done = function () {
        label.textContent = "Copied";
        button.setAttribute("data-enc-copied", "");
        setTimeout(function () {
          label.textContent = said;
          button.removeAttribute("data-enc-copied");
        }, 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(address).then(done, done);
      else done();
    });
  }

  /* Super emits a heading's anchor as a sibling span, so counting raw children put the anchor
     where the lede should be. The anchor travels with its heading and is never counted. */
  function anchor(n) {
    var prev = n.previousElementSibling;
    return prev && prev.classList.contains("notion-heading__anchor") ? prev : null;
  }
  function move(into, n) {
    var a = anchor(n);
    if (a) into.appendChild(a);
    into.appendChild(n);
  }

  function build() {
    if (!PATH.test(location.pathname)) return;
    var root = document.querySelector(".notion-root");
    if (!root || root.querySelector(".enc-ct__call")) return;
    var kids = Array.prototype.slice.call(root.children).filter(function (n) {
      return !n.classList.contains("notion-heading__anchor");
    });
    if (kids.length < 12) return;

    var iWhere = find(kids, "elsewhere");
    var iWrite = find(kids, "or write to us");
    var iAddr = find(kids, "the address");
    if (iWhere < 1 || iWrite < iWhere || iAddr < iWrite) return;

    // ── 1 · the ink band that leads with the booking ──
    var call = el("div", "enc-ct__call");
    root.insertBefore(call, kids[1]);
    var top = el("div", "enc-ct__top");
    var head = el("div", "enc-ct__head");
    var spec = el("div", "enc-ct__spec");
    call.appendChild(top);
    top.appendChild(head);
    top.appendChild(spec);
    kids.slice(1, iWhere).forEach(function (n, i) {
      if (i < 2) { move(head, n); return; }                     // the heading and its lede
      if (spec.children.length < 3 && !n.querySelector("a") && textOf(n).indexOf("·") > 0) {
        spec.appendChild(n);
        splitRow(n);
        return;
      }
      move(call, n);                                            // calendar, fallback line, toggle
      if (n.querySelector && n.querySelector(".notion-callout")) n.classList.add("enc-ct__inst");
    });
    var fold = call.querySelector(".notion-toggle");
    if (fold) (fold.closest("[id^=block-]") || fold).classList.add("enc-ct__fold");

    // ── 2 · Elsewhere ──
    var where = el("div", "enc-ct__where");
    root.insertBefore(where, kids[iWhere]);
    var list = el("div", "enc-ct__socials");
    kids.slice(iWhere, iWrite).forEach(function (n, i) {
      if (i === 0) { n.classList.add("enc-ct__kicker"); move(where, n); where.appendChild(list); return; }
      var a = n.querySelector && n.querySelector("a[href]");
      if (!a) { move(where, n); return; }
      var name = textOf(a);
      var handle = textOf(n).slice(name.length).trim();
      n.textContent = "";
      n.appendChild(a);
      a.textContent = name;
      n.appendChild(el("span", "enc-ct__handle", handle));
      n.classList.add("enc-ct__social");
      list.appendChild(n);
    });

    // ── 3 · the paper band where writing happens ──
    var write = el("div", "enc-ct__write");
    root.insertBefore(write, kids[iWrite]);
    var wHead = el("div", "enc-ct__whead");
    var wells = el("div", "enc-ct__wells");
    var wForm = el("div", "enc-ct__well");
    var wAddr = el("div", "enc-ct__well");
    write.appendChild(wHead);
    write.appendChild(wells);
    wells.appendChild(wForm);
    wells.appendChild(wAddr);
    var into = null;
    kids.slice(iWrite).forEach(function (n, i) {
      var t = textOf(n).toLowerCase();
      if (t === "the form") { into = wForm; n.classList.add("enc-ct__kicker"); }
      else if (t === "the address") { into = wAddr; n.classList.add("enc-ct__kicker"); }
      if (!into) {                                              // kicker, heading, lede
        if (i === 0) n.classList.add("enc-ct__kicker");
        move(wHead, n);
        return;
      }
      move(into, n);
    });
    copyBehaviour(wAddr);

    root.setAttribute("data-enc-contact", "");
  }

  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 120); })
    .observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
