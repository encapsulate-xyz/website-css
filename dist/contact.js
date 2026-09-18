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
  /* Super prints a callout's icon inside its text ("💡Booked…"), so a block is recognised by its
     first word with anything non-alphabetic in front of it stripped */
  function startsWord(n, word) {
    return textOf(n).replace(/^[^A-Za-z]+/, "").slice(0, word.length).toLowerCase() === word;
  }

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

       The names are the booker's own, read out of its bundle (it calls
       sdkActionManager.fire("bookingSuccessful", …) and "bookingSuccessfulV2", with reschedule
       twins) — they are not in the loader, which is why the postMessage listener below matches on
       the word as well: if Cal renames the action, the fallback still hears it. */
    var booked = function (e) {
      box.setAttribute("data-enc-booked", "");
      var root = document.querySelector(".notion-root");
      if (root) root.setAttribute("data-enc-booked", "");
      confirm(e && (e.detail ? (e.detail.data || e.detail) : e.data || e));
    };
    ["bookingSuccessful", "bookingSuccessfulV2",
     "rescheduleBookingSuccessful", "rescheduleBookingSuccessfulV2"].forEach(function (action) {
      try { window.Cal.ns.enc("on", { action: action, callback: booked }); } catch (e) {}
    });
    window.addEventListener("message", function (e) {
      if (!/(^|\.)cal\.com$/.test((e.origin || "").replace(/^https?:\/\//, ""))) return;
      var d = e.data;
      if (d && typeof d === "object" && /booking/i.test(d.type || d.action || "") &&
          /success|confirm/i.test(d.type || d.action || "")) booked(d);
    });
  }

  /* The design writes the description inside the field ("Where we should reply"), where Super
     renders it as a line above and puts "Your answer" in the field instead. The line becomes the
     placeholder, and Send takes its note onto the same row. */
  function formShape(well) {
    var form = well.querySelector("form.notion-form");
    if (!form || form.hasAttribute("data-enc-shaped")) return;
    Array.prototype.forEach.call(form.querySelectorAll(".notion-form__field"), function (f) {
      var note = f.querySelector(".notion-form__field-description");
      var input = f.querySelector("input.notion-form__input-field, textarea.notion-form__input-field");
      if (!note || !input) return;
      input.placeholder = textOf(note);
      note.hidden = true;
    });
    var submit = form.querySelector('[class*="notion-form__submit"]');
    var line = well.querySelector(":scope > p.notion-text:last-child");
    if (submit) {
      var row = el("div", "enc-ct__send");
      submit.parentNode.insertBefore(row, submit);
      row.appendChild(submit);
      if (line && !line.classList.contains("enc-ct__kicker")) row.appendChild(line);
    }
    form.setAttribute("data-enc-shaped", "");
  }

  /* The fold reveals a Notion form (the institutional intake). Super can render it after the band
     is built — and only once the toggle is opened — so it is shaped on its own, idempotently. */
  /* React re-renders the toggle when it opens and resets its className, which took the band's
     fold styling with it — so the fold is marked with an attribute, and re-marked (with its
     label split and its form shaped again) on every tick of the observer. */
  function foldKeep() {
    var root = document.querySelector("[data-enc-contact]");
    if (!root) return;
    var fold = root.querySelector(".enc-ct__call .notion-toggle");
    if (!fold) return;
    var host = fold.closest("[id^=block-]") || fold;
    if (!host.hasAttribute("data-enc-fold")) host.setAttribute("data-enc-fold", "");
    foldShape(fold);
    foldForm();
  }

  function foldForm() {
    var body = document.querySelector("[data-enc-contact] [data-enc-fold] .notion-toggle__content");
    if (!body || body.hasAttribute("data-enc-fold-form")) return;
    var wrap = body.querySelector(".notion-form__wrapper");
    if (!wrap || !wrap.querySelector("form.notion-form")) return;
    // The institutional form is the dial: home.js builds it and home-dial.css draws it, so it is
    // left alone here — it is recognised the same way home.js recognises it, by the Amount
    // question, because this can run before the script has marked it [data-enc-dial].
    if (wrap.hasAttribute("data-enc-dial") || isDial(wrap)) {
      body.setAttribute("data-enc-fold-form", "dial");
      return;
    }
    body.setAttribute("data-enc-fold-form", "");
    formShape(body);
    var row = body.querySelector(".enc-ct__send");
    var cta = body.querySelector(".notion-callout");
    if (row && cta) row.appendChild(cta);
  }

  function isDial(wrap) {
    var fields = wrap.querySelectorAll(".notion-form__field");
    for (var i = 0; i < fields.length; i++) {
      var title = fields[i].querySelector(".notion-form__field-title");
      if (title && /amount/i.test(textOf(title)) &&
          fields[i].querySelector("input.notion-form__input-field") &&
          !fields[i].classList.contains("multi_select")) return true;
    }
    return false;
  }

  /* the fold's one line is two in the design: the question, then the aside beside it */
  function foldShape(fold) {
    var label = fold.querySelector(".notion-toggle__summary .notion-semantic-string");
    if (!label || label.querySelector(".enc-ct__fq")) return;
    var parts = textOf(label).split("·");
    if (parts.length < 2) return;
    label.textContent = "";
    label.appendChild(el("span", "enc-ct__fq", parts[0].trim()));
    label.appendChild(el("span", "enc-ct__fa", parts.slice(1).join("·").trim()));
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

  /* ── the confirmation — design "Booking Confirmed" ──
     Its words are Notion's: one callout on the page holding the heading, the four facts, what to
     bring, the two urgent routes and the calendar labels. The booking's own values (the when, the
     who, the reschedule link, the calendar exports) are filled from the payload cal.com sends. */
  var booking = null;

  function two(n) { return (n < 10 ? "0" : "") + n; }

  function when(iso, tz) {
    var d = new Date(iso);
    if (isNaN(d)) return ["", ""];
    var opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    var time = { hour: "2-digit", minute: "2-digit", hour12: false };
    if (tz) { opts.timeZone = tz; time.timeZone = tz; }
    var end = new Date(d.getTime() + (booking && booking.duration ? booking.duration : 30) * 60000);
    var zone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
    var long = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "long" })
      .formatToParts(d).filter(function (p) { return p.type === "timeZoneName"; })[0];
    return [
      new Intl.DateTimeFormat("en-GB", opts).format(d),
      new Intl.DateTimeFormat("en-GB", time).format(d) + " – " +
        new Intl.DateTimeFormat("en-GB", time).format(end) +
        (long ? " " + long.value : "")
    ];
  }

  /* the four exports, built from the booking rather than listed anywhere */
  function calendarLinks(title, startISO, minutes, details) {
    var start = new Date(startISO);
    var end = new Date(start.getTime() + minutes * 60000);
    var stamp = function (d) {
      return d.getUTCFullYear() + two(d.getUTCMonth() + 1) + two(d.getUTCDate()) + "T" +
        two(d.getUTCHours()) + two(d.getUTCMinutes()) + "00Z";
    };
    var q = encodeURIComponent;
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      "DTSTART:" + stamp(start), "DTEND:" + stamp(end),
      "SUMMARY:" + title, "DESCRIPTION:" + (details || ""),
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return {
      google: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + q(title) +
        "&dates=" + stamp(start) + "/" + stamp(end) + "&details=" + q(details || ""),
      outlook: "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose" +
        "&rru=addevent&subject=" + q(title) + "&startdt=" + start.toISOString() +
        "&enddt=" + end.toISOString() + "&body=" + q(details || ""),
      "office 365": "https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose" +
        "&rru=addevent&subject=" + q(title) + "&startdt=" + start.toISOString() +
        "&enddt=" + end.toISOString() + "&body=" + q(details || ""),
      ical: "data:text/calendar;charset=utf-8," + encodeURIComponent(ics)
    };
  }

  function confirm(data) {
    var band = document.querySelector(".enc-ct__done");
    if (!band || band.hasAttribute("data-enc-filled")) return;
    var b = (data && (data.booking || data)) || {};
    var startISO = (data && data.date) || b.startTime || b.start || "";
    var minutes = (data && data.duration) || b.length || 30;
    var org = (data && data.organizer) || (b.user || {});
    var uid = b.uid || b.bookingUid || "";
    booking = { duration: minutes };
    /* the facts are found by their own label, so adding or reordering a row in Notion cannot
       hand a value to the wrong line */
    var rows = {};
    Array.prototype.forEach.call(band.querySelectorAll(".enc-ct__fact"), function (r) {
      var k = (r.querySelector(".enc-ct__fk") || {}).textContent || "";
      rows[k.trim().toLowerCase()] = r;
    });
    var w = when(startISO, org.timeZone);
    if (rows.when) fill(rows.when, w[0], w[1]);
    if (rows.with) fill(rows.with, org.name, org.email || "");
    if (rows.length) fill(rows.length, minutes + " minutes", "Nothing to prepare");

    // who it went to — the address the invitation was sent to, as they typed it
    var guest = (b.attendees && b.attendees[0]) || (data && data.attendee) || null;
    if (rows.invited) fill(rows.invited, guest && (guest.name || guest.email),
      guest ? (guest.name ? guest.email || "" : "") : "");

    /* the meeting link, when the booking carries one: cal.com keeps it at
       booking.metadata.videoCallUrl (that is where its own screen reads it from), and a custom
       location can be the URL itself. The row keeps Notion's words and gains the link. */
    var meet = (b.metadata && b.metadata.videoCallUrl) ||
      (typeof b.location === "string" && /^https?:/.test(b.location) ? b.location : "");
    if (rows.where && meet) {
      var v2 = rows.where.querySelector(".enc-ct__fv");
      var s2 = rows.where.querySelector(".enc-ct__fs");
      if (v2) {
        var a = el("a", "enc-ct__meet", v2.textContent);
        a.href = meet;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        v2.textContent = "";
        v2.appendChild(a);
      }
      if (s2) {                                   // show the link itself, not a pointer to the email
        s2.textContent = "";
        var j = el("a", "enc-ct__meet", meet.replace(/^https?:\/\//, "").replace(/\/$/, ""));
        j.href = meet;
        j.target = "_blank";
        j.rel = "noopener noreferrer";
        s2.appendChild(j);
      }
    }

    var again = band.querySelector('a[href*="cal.com/reschedule"]');
    if (again && uid) again.href = "https://cal.com/reschedule/" + uid;
    else if (again) again.closest(".notion-callout").hidden = true;

    var stop = band.querySelector('a[href="https://cal.com/booking"], a[href^="https://cal.com/booking"]');
    if (stop && uid) stop.href = "https://cal.com/booking/" + uid + "?cancel=true";
    else if (stop) stop.parentNode.hidden = true;

    /* cal.com says whether the booking is confirmed or waiting on us (an event type that requires
       confirmation). The alternative wording is Notion's, carried on the two "Pending …" lines. */
    if (data && data.confirmed === false) {
      var head2 = band.querySelector("h2");
      var lede2 = band.querySelector(".enc-ct__done-l > p.notion-text");
      Array.prototype.forEach.call(band.querySelectorAll(".enc-ct__pending"), function (p) {
        var parts = textOf(p).split("·");
        var value = parts.slice(1).join("·").trim();
        if (/heading/i.test(parts[0]) && head2 && value) head2.textContent = value;
        if (/line/i.test(parts[0]) && lede2 && value) lede2.textContent = value;
      });
    }

    var links = calendarLinks("30 min meeting with Encapsulate", startISO, minutes,
      "Meeting link is in the calendar invitation.");
    Array.prototype.forEach.call(band.querySelectorAll(".enc-ct__ics"), function (a) {
      var url = links[(a.textContent || "").trim().toLowerCase()];
      if (!url) return;
      a.href = url;
      if (url.indexOf("data:") === 0) a.setAttribute("download", "encapsulate.ics");
      else { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    });
    band.setAttribute("data-enc-filled", "");
  }

  function fill(row, head, sub) {
    if (!head) { row.hidden = true; return; }      // a fact with nothing to say is not shown
    var v = row.querySelector(".enc-ct__fv");
    var s = row.querySelector(".enc-ct__fs");
    if (v) v.textContent = head;
    if (s) s.textContent = sub || "";
  }

  /* The second way in, and the one that does not depend on a message at all: cal.com's
     redirect-on-booking can send the attendee back here with the booking in the query string
     (Advanced → Redirect on booking, with "forward parameters" on). If those are present the
     confirmation is filled from them on load — no event, no frame, nothing to miss. */
  function fromQuery() {
    var q = new URLSearchParams(location.search);
    var start = q.get("startTime") || q.get("start") || q.get("date");
    var uid = q.get("uid") || q.get("bookingUid");
    if (!start && !uid && q.get("booked") === null) return null;
    return {
      date: start,
      duration: parseInt(q.get("duration") || q.get("eventDuration") || "30", 10),
      organizer: { name: q.get("hostName") || q.get("organizer") || "",
                   email: q.get("hostEmail") || "",
                   timeZone: q.get("timeZone") || q.get("tz") || "" },
      booking: { uid: uid || "" }
    };
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
    // the confirmation callout sits after the write band and must not be swallowed by it
    var iDone = kids.length;
    for (var d = iWrite; d < kids.length; d++) {
      if (startsWord(kids[d], "booked")) { iDone = d; break; }
    }

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
    if (fold) {
      (fold.closest("[id^=block-]") || fold).setAttribute("data-enc-fold", "");
      foldShape(fold);
    }

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
    kids.slice(iWrite, iDone).forEach(function (n, i) {
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
    formShape(wForm);
    copyBehaviour(wAddr);

    // ── 4 · the confirmation, waiting under the page until cal.com says a booking landed ──
    var done = iDone < kids.length ? kids[iDone] : null;
    if (done) {
      done.classList.add("enc-ct__done");
      // it replaces the booking band, so it stands where that band stands rather than at the foot
      // of the page, which is where Notion keeps it
      root.insertBefore(done, call);
      var content = done.querySelector(".notion-callout__content") || done;
      var kids2 = Array.prototype.slice.call(content.children).filter(function (n) {
        return !n.classList.contains("notion-heading__anchor");
      });
      var left = el("div", "enc-ct__done-l");
      var right = el("div", "enc-ct__done-r");
      content.appendChild(left);
      content.appendChild(right);
      var facts = el("div", "enc-ct__facts");
      var cta = el("div", "enc-ct__cta");
      var prep = el("div", "enc-ct__prep");
      var urgent = el("div", "enc-ct__urgent");
      var ics = el("div", "enc-ct__cals");
      var stage = "head";
      kids2.forEach(function (n) {
        var t2 = textOf(n).toLowerCase();
        if (startsWord(n, "booked") && n.tagName === "SPAN") return;
        if (t2.indexOf("before we speak") === 0) { stage = "prep"; n.classList.add("enc-ct__kicker"); right.appendChild(n); right.appendChild(prep); return; }
        if (t2.indexOf("something urgent") === 0) { stage = "urgent"; n.classList.add("enc-ct__kicker"); right.appendChild(n); right.appendChild(urgent); return; }
        if (t2.indexOf("add it to your calendar") === 0) { stage = "ics"; n.classList.add("enc-ct__kicker"); right.appendChild(n); right.appendChild(ics); return; }
        if (stage === "head") {
          if (n.querySelector && n.querySelector(".notion-link") && n.classList.contains("notion-callout")) {
            cta.appendChild(n);                        // the two buttons share one row
            if (cta.parentNode !== left) left.appendChild(cta);
            return;
          }
          if (textOf(n).indexOf("·") > 0) {            // a fact: label, value, note
            var parts = textOf(n).split("·");
            n.textContent = "";
            n.className += " enc-ct__fact";
            n.appendChild(el("span", "enc-ct__fk", parts[0].trim()));
            var col = el("span", "enc-ct__fcol");
            col.appendChild(el("span", "enc-ct__fv", (parts[1] || "").trim()));
            col.appendChild(el("span", "enc-ct__fs", (parts[2] || "").trim()));
            n.appendChild(col);
            facts.appendChild(n);
            if (facts.parentNode !== left) left.appendChild(facts);
            return;
          }
          move(left, n);
          return;
        }
        if (stage === "prep" && textOf(n).indexOf("·") > 0) {
          var p = textOf(n).split("·");
          n.textContent = "";
          n.className += " enc-ct__prep-row";
          n.appendChild(el("span", "enc-ct__pn"));
          var pc = el("span", "enc-ct__pc");
          pc.appendChild(el("span", "enc-ct__pt", p[0].trim()));
          pc.appendChild(el("span", "enc-ct__pb", p.slice(1).join("·").trim()));
          n.appendChild(pc);
          prep.appendChild(n);
          return;
        }
        if (stage === "urgent" && n.querySelector && n.querySelector("a[href]")) {
          var a2 = n.querySelector("a[href]");
          var name2 = textOf(a2);
          var handle2 = textOf(n).slice(name2.length).trim();
          n.textContent = "";
          n.appendChild(a2);
          n.appendChild(el("span", "enc-ct__handle", handle2));
          n.classList.add("enc-ct__social");
          urgent.appendChild(n);
          return;
        }
        if (startsWord(n, "pending")) { n.classList.add("enc-ct__pending"); left.appendChild(n); return; }
        if (stage === "ics" && textOf(n).indexOf("·") > 0) {
          var names = textOf(n).split("·");
          n.textContent = "";
          n.className += " enc-ct__ics-row";
          names.forEach(function (label) {
            var a3 = el("a", "enc-ct__ics", label.trim());
            a3.href = "#";
            n.appendChild(a3);
          });
          ics.appendChild(n);
          return;
        }
        move(right, n);
      });
    }

    // a booking already in the query (cal.com's redirect) shows the confirmation straight away
    var q = fromQuery();
    if (q && done) {
      root.setAttribute("data-enc-booked", "");
      confirm(q);
    }

    root.setAttribute("data-enc-contact", "");
    foldKeep();
  }

  var t = 0;
  new MutationObserver(function () {
    clearTimeout(t);
    t = setTimeout(function () { build(); foldKeep(); }, 120);
  })
    .observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", build);
})();
