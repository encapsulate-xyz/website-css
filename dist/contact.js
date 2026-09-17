/* /contact-us — design "Contact Booking", section 02. Linked from the SITE head, because Super
   never executes a page's own script on a client-side navigation.

   The page is the cover and then one section in three bands: the ink band that leads with the
   booking (cal.com's own booker in the frame, a spec beside the headline, the institutional route
   folded into a toggle at its foot), the ink "Elsewhere" strip of the four social links, and the
   paper band where writing happens — the Notion form in one well, the address in the other.

   The calendar is cal.com's embed, mounted here rather than pasted into Notion, so the booker takes
   the site's palette through cssVarsPerTheme — the same construction as demo/booking-compare.html.

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

  /* ── the calendar ──
     cal.com's own embed, mounted here the way demo/booking-compare.html does it: the loader, one
     namespace, and the site's palette through cssVarsPerTheme. Only the variables Cal exposes can
     cross — it has none for a button's ring, its inner highlight or its lift, and --cal-brand is
     reused for the primary fill, the primary ring and a slot's hover ring.

     What is booked stays Notion's: the slug and the layout are read off the page's own "Open it in
     a new tab" link, so switching event or layout is a Notion edit, not a release. */
  var CAL_UI = {
    theme: "dark",
    layout: "column_view",
    hideEventTypeDetails: false,
    cssVarsPerTheme: {
      light: {
        "cal-brand": "#99CC66",
        "cal-brand-emphasis": "#8CBF56",
        "cal-brand-text": "#000000",
        "cal-brand-accent": "#000000",
        "cal-brand-subtle": "#DCEEC7",
        "cal-brand-muted": "#DCEEC7",
        "cal-bg-brand": "#99CC66",
        "cal-bg-brand-emphasis": "#8CBF56",
        "cal-bg-brand-muted": "#DCEEC7",
        "cal-bg": "#FFFEFC",
        "cal-bg-emphasis": "#FAFAF8",
        "cal-bg-muted": "#FFFEFC",
        "cal-bg-subtle": "#F2F2ED",
        "cal-bg-inverted": "#3A3D38",
        "cal-border": "#D9D9D2",
        "cal-border-default": "#D9D9D2",
        "cal-border-subtle": "#D9D9D2",
        "cal-border-muted": "#E2E2DB",
        "cal-border-emphasis": "#B9B9B1",
        "cal-border-booker": "#D9D9D2",
        "cal-border-booker-width": "1px",
        "cal-text": "#000000",
        "cal-text-emphasis": "#000000",
        "cal-text-subtle": "#3A3D38",
        "cal-text-muted": "#6B6F68",
        "cal-text-inverted": "#FAFAF8",
        "cal-text-error": "#8A2F2F",
        "cal-bg-error": "#F7DCE7",
        "cal-bg-success": "#DCEEC7",
        "cal-text-semantic-success": "#3F6B27",
        "radius": "12px",
        "cal-radius": "12px",
        "cal-radius-sm": "8px",
        "cal-radius-md": "12px",
        "cal-radius-lg": "12px",
        "cal-radius-xl": "12px",
        "cal-radius-2xl": "12px",
        "spacing": "4px"
      },
      /* Cal's own dark is a neutral near-black (#0F0F0F ground, #4D4D4D borders, a white brand),
         which reads as a second black against our warm ink. These are the band's own values, so
         the booker dissolves into it instead of sitting in a frame. */
      dark: {
        "cal-brand": "#99CC66",
        "cal-brand-emphasis": "#8CBF56",
        "cal-brand-text": "#000000",
        "cal-brand-accent": "#000000",
        "cal-brand-subtle": "#3F6B27",
        "cal-brand-muted": "#3F6B27",
        "cal-bg-brand": "#99CC66",
        "cal-bg-brand-emphasis": "#8CBF56",
        "cal-bg-brand-muted": "#3F6B27",
        "cal-bg": "#2A2C28",
        "cal-bg-emphasis": "#33352F",
        "cal-bg-muted": "#2F312C",
        "cal-bg-subtle": "#3A3D38",
        "cal-bg-inverted": "#FAFAF8",
        "cal-border": "rgba(250, 250, 248, 0.18)",
        "cal-border-default": "rgba(250, 250, 248, 0.18)",
        "cal-border-subtle": "rgba(250, 250, 248, 0.18)",
        "cal-border-muted": "rgba(250, 250, 248, 0.12)",
        "cal-border-emphasis": "rgba(250, 250, 248, 0.3)",
        "cal-border-booker": "rgba(250, 250, 248, 0.18)",
        "cal-border-booker-width": "1px",
        "cal-text": "#FAFAF8",
        "cal-text-emphasis": "#FAFAF8",
        "cal-text-subtle": "#C9C9C4",
        "cal-text-muted": "#9FA39B",
        "cal-text-inverted": "#000000",
        "cal-text-error": "#E9A9C2",
        "cal-bg-error": "#4A2A36",
        "cal-bg-success": "#3F6B27",
        "cal-text-semantic-success": "#DCEEC7",
        "radius": "12px",
        "cal-radius": "12px",
        "cal-radius-sm": "8px",
        "cal-radius-md": "12px",
        "cal-radius-lg": "12px",
        "cal-radius-xl": "12px",
        "cal-radius-2xl": "12px",
        "spacing": "4px"
      }
    }
  };

  function loader() {
    if (window.Cal) return;
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal, ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var ns = ar[1];
          api.q = api.q || [];
          if (typeof ns === "string") { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ["initNamespace", ns]); }
          else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
  }

  function calendar(call, link) {
    if (!link || call.querySelector(".enc-ct__cal")) return;
    var href = link.getAttribute("href") || "";
    var slug = (/cal\.com\/([^?#]+)/.exec(href) || [])[1];
    if (!slug) return;
    var layout = (/layout=([a-z_]+)/.exec(href) || [])[1] || CAL_UI.layout;
    var box = el("div", "enc-ct__cal");
    box.id = "enc-cal";
    link.parentNode.parentNode.insertBefore(box, link.parentNode);
    loader();
    window.Cal("init", "enc", { origin: "https://app.cal.com" });
    window.Cal.ns.enc("ui", CAL_UI);
    window.Cal.ns.enc("inline", {
      elementOrSelector: "#enc-cal",
      calLink: slug.replace(/\/$/, ""),
      config: { layout: layout, theme: "dark" }
    });
    /* The booker fills our frame while a slot is being picked, but Cal's success screen is its own
       centred card — inside our frame that reads as a panel within a panel. So the frame drops its
       ground and its hairline the moment the booking lands.

       Two ways of hearing it, because the action's name is emitted by the booker page inside the
       iframe and is not in the loader we can read: Cal's own subscription under both names it has
       used, and — the one that cannot go stale — the postMessage itself, taken straight from
       cal.com's origin and matched on the word rather than the exact name. */
    var booked = function () { box.setAttribute("data-enc-booked", ""); };
    ["bookingSuccessful", "bookingSuccessfulV2"].forEach(function (action) {
      try { window.Cal.ns.enc("on", { action: action, callback: booked }); } catch (e) {}
    });
    window.addEventListener("message", function (e) {
      if (!/(^|\.)cal\.com$/.test((e.origin || "").replace(/^https?:\/\//, ""))) return;
      var d = e.data;
      if (d && typeof d === "object" && /booking/i.test(d.type || d.action || "") &&
          /success|confirm/i.test(d.type || d.action || "")) booked();
    });
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
    calendar(call, call.querySelector('a[href*="cal.com"]'));
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
