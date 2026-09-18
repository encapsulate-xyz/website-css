/* THE BOOKING DRAWER — design "Drawer Variations", the settled combination: the split takeover
   (geometry d) wearing the green-edge chrome (8).

   WHAT IT DOES. Every "Book a call" on the site is a link to cal.com. This script catches the
   click on any of them and opens the drawer instead: the band's own ink on the left carrying the
   reason to book, cal.com's calendar on paper to the right. When the booking lands, the paper half
   becomes the confirmation.

   WHERE IT RUNS. From the SITE head, like every other page script (Super does not execute a page's
   own <script> on a client-side navigation — see CLAUDE.md). It binds nothing at load: the click
   listener is on the document, so a link Super renders later is caught too.

   /contact-us IS LEFT ALONE. That page has the calendar embedded in its own band and its own
   confirmation built from Notion's words; the drawer would be a second calendar over the first.

   THE WORDS ARE HERE, NOT IN NOTION. The rule on this site is that content lives in Notion, and it
   cannot be honoured for this surface: Super ships only the current page's blocks, and the drawer
   opens on every page, so there is no block it could read anywhere but the contact page. This is
   the same exception already made for the footer's CTA copy and the Copy button's "Copied" — see
   CLAUDE.md. Everything a reader sees in the drawer is in CONTENT below, in one place.

   STYLES: main.css, section 18. */
(function () {
  "use strict";

  var CAL_LINK = "aditya-encapsulate/30min";
  var CAL_PAGE = "https://cal.com/" + CAL_LINK;
  var NS = "encdrawer";

  var CONTENT = {
    eyebrow: ["Encapsulate", "Book a call"],
    // the word between the two halves is the one the hero circles
    head: ["Did your validator ", "answer", " the last emergency upgrade?"],
    lede: "Ours did. Thirty minutes with a founder — bring the chain and the stage it's at.",
    spec: [["Length", "30 minutes"], ["With", "A founder"], ["Prep", "None"]],
    title: "Pick a time that suits you.",
    fallback: ["Calendar not loading?", "Open it in a new tab"],
    done: {
      title: "You are on the calendar.",
      pending: "You are pencilled in.",
      labels: ["When", "With", "Invited", "Where", "Length"],
      where: ["Google Meet", "Link is in the invitation"],
      length: ["30 minutes", "Nothing to prepare"],
      host: ["Aditya Verma", "aditya@encapsulate.xyz"],
      read: ["Read what we run", "https://encapsulate.xyz/services"],
      again: "Reschedule",
      cancel: ["Need to cancel instead?", "Cancel this booking"],
      cals: ["Add it to your calendar", ["Google", "Outlook", "Office 365", "iCal"]]
    }
  };

  /* cal.com's light palette, the design's own values. The dark one on /contact-us is in
     contact.js; this surface is paper, so it is the light set that matters here. */
  var CAL_UI = {
    theme: "light",
    hideEventTypeDetails: false,
    cssVarsPerTheme: {
      light: {
        "cal-brand": "#99CC66", "cal-brand-emphasis": "#8CBF56", "cal-brand-text": "#000000",
        "cal-bg": "#FAFAF8", "cal-bg-emphasis": "#F2F2ED", "cal-bg-subtle": "#F2F2ED",
        "cal-bg-muted": "#F2F2ED", "cal-bg-inverted": "#2A2C28",
        "cal-border": "#D9D9D2", "cal-border-subtle": "#D9D9D2",
        "cal-border-emphasis": "#9B9B94", "cal-border-booker": "#E2E2DB",
        "cal-text": "#000000", "cal-text-emphasis": "#000000", "cal-text-subtle": "#3A3D38",
        "cal-text-muted": "#6B6F68", "cal-text-inverted": "#FAFAF8",
        "cal-bg-success": "#DCEEC7", "cal-bg-info": "#D2E3F6",
        "cal-bg-attention": "#F8E8B3", "cal-bg-error": "#F7DCE7",
        "cal-text-success": "#3F6B27",
        "cal-radius": "12px", "cal-radius-sm": "10px", "spacing": "4px"
      }
    }
  };

  var CIRCLE = "M8.4 25.6C6.1 12.2 27.8 4.6 52.3 4.9C76.9 5.2 95.8 12.8 94.1 25.9C92.4 38.1 " +
    "69.6 44.2 47.4 43.6C25.9 43.1 8.2 38.4 6.9 26.4C5.8 16.9 15.2 9.4 28.6 6.2";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function svg(paths, attrs) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var k;
    for (k in attrs) s.setAttribute(k, attrs[k]);
    paths.forEach(function (d) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      s.appendChild(p);
    });
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  function cross() {
    return svg(["M3.5 3.5l7 7", "M10.5 3.5l-7 7"], {
      viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", "stroke-width": "1.8",
      "stroke-linecap": "round", width: "13", height: "13"
    });
  }

  function tick() {
    return svg(["M4.5 12.5 9.5 17.5 19.5 6.5"], {
      viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.1",
      "stroke-linecap": "round", "stroke-linejoin": "round", width: "16", height: "16"
    });
  }

  /* The circled word, built the way the hero builds it: the ring is a child of the word so its
     percentages resolve against the word, not against the line. */
  function ringWord(word) {
    var span = el("span", "enc-bk__ring", word);
    var s = svg([CIRCLE], { viewBox: "0 0 100 46", preserveAspectRatio: "none", fill: "none" });
    var p = s.querySelector("path");
    p.setAttribute("stroke", "#99CC66");
    p.setAttribute("stroke-width", "2.1");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    span.appendChild(s);
    return span;
  }

  function button(label, cls, href) {
    var n = el(href ? "a" : "button", "enc-bk__btn " + cls, label);
    if (href) { n.href = href; n.target = "_blank"; n.rel = "noopener noreferrer"; }
    else n.type = "button";
    return n;
  }

  // ── the booking, read from whatever cal.com sends ────────────────────────────────────────
  /* The payload shape is measured, not assumed: a real booking through the embed sends
     {uid, title, startTime, endTime, eventTypeId, status, paymentRequired, isRecurring,
     videoCallUrl} — the meeting link is videoCallUrl at the top level, NOT metadata.videoCallUrl
     where cal.com's own success screen reads it. Every place it can be is tried. */
  function meetUrl(b, data) {
    var refs = b.references || b.bookingReferences || [];
    var i, u;
    for (i = 0; i < refs.length; i++) {
      u = refs[i] && (refs[i].meetingUrl || refs[i].meetingId);
      if (typeof u === "string" && /^https?:/.test(u)) return u;
    }
    var here = [b.videoCallUrl, b.metadata && b.metadata.videoCallUrl,
      data && data.videoCallUrl, data && data.metadata && data.metadata.videoCallUrl,
      typeof b.location === "string" && /^https?:/.test(b.location) ? b.location : ""];
    for (i = 0; i < here.length; i++) if (here[i]) return here[i];
    return "";
  }

  function two(n) { return (n < 10 ? "0" : "") + n; }

  /* "Wed 30 September" and "20:00–20:30 IST", the way the handoff writes them. The abbreviation
     is built from the long zone name's initials — Intl gives "GMT+5:30" for `short` in most
     locales, and "India Standard Time" is what IST is short for. */
  function zoneShort(d, tz) {
    if (!tz) return "";
    var long = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "long" })
      .formatToParts(d).filter(function (p) { return p.type === "timeZoneName"; })
      .map(function (p) { return p.value; })[0] || "";
    var words = long.split(/\s+/).filter(Boolean);
    if (words.length < 2) return long;
    return words.map(function (w) { return w.charAt(0); }).join("").toUpperCase();
  }

  function when(iso, tz, minutes) {
    var d = new Date(iso);
    if (isNaN(d)) return ["", ""];
    var opts = { weekday: "short", day: "numeric", month: "long" };
    var t = { hour: "2-digit", minute: "2-digit", hour12: false };
    if (tz) { opts.timeZone = tz; t.timeZone = tz; }
    var day = d.toLocaleDateString("en-GB", opts).replace(/,/g, "");
    var from = d.toLocaleTimeString("en-GB", t);
    var end = new Date(d.getTime() + (minutes || 30) * 60000).toLocaleTimeString("en-GB", t);
    var zone = zoneShort(d, tz);
    return [day, from + "–" + end + (zone ? " " + zone : "")];
  }

  function stamp(d) {
    return d.getUTCFullYear() + two(d.getUTCMonth() + 1) + two(d.getUTCDate()) + "T" +
      two(d.getUTCHours()) + two(d.getUTCMinutes()) + "00Z";
  }

  function calendarLinks(title, iso, minutes, details) {
    var start = new Date(iso);
    if (isNaN(start)) return null;
    var end = new Date(start.getTime() + (minutes || 30) * 60000);
    var q = encodeURIComponent;
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      "DTSTART:" + stamp(start), "DTEND:" + stamp(end), "SUMMARY:" + title,
      "DESCRIPTION:" + (details || ""), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var outlook = "&rru=addevent&subject=" + q(title) + "&startdt=" + start.toISOString() +
      "&enddt=" + end.toISOString() + "&body=" + q(details || "");
    return {
      google: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + q(title) +
        "&dates=" + stamp(start) + "/" + stamp(end) + "&details=" + q(details || ""),
      outlook: "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose" + outlook,
      "office 365": "https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose" + outlook,
      ical: "data:text/calendar;charset=utf-8," + encodeURIComponent(ics)
    };
  }

  // the same three helpers contact.js needs; published so the two cannot drift
  window.encBook = { when: when, calendarLinks: calendarLinks, meetUrl: meetUrl };

  // ── the drawer ───────────────────────────────────────────────────────────────────────────
  var layer = null, panel = null, mounted = false, opener = null, inited = false;

  function calLoader() {
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
          var namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
  }

  /* The ink half: where the page already carries these words — the contact band — they would be
     read off it, but the drawer does not open there, so CONTENT is the source everywhere. */
  function inkHalf() {
    var half = el("div", "enc-bk__ink");
    var brow = el("div", "enc-bk__brow");
    brow.appendChild(el("span", "enc-bk__k", CONTENT.eyebrow[0]));
    brow.appendChild(el("span", "enc-bk__rule"));
    brow.appendChild(el("span", "enc-bk__k", CONTENT.eyebrow[1]));
    half.appendChild(brow);

    var mid = el("div", "enc-bk__mid");
    var h = el("h2", "enc-bk__h");
    h.appendChild(document.createTextNode(CONTENT.head[0]));
    h.appendChild(ringWord(CONTENT.head[1]));
    h.appendChild(document.createTextNode(CONTENT.head[2]));
    mid.appendChild(h);
    mid.appendChild(el("p", "enc-bk__lede", CONTENT.lede));
    half.appendChild(mid);

    var spec = el("div", "enc-bk__spec");
    CONTENT.spec.forEach(function (row) {
      var r = el("div", "enc-bk__row");
      r.appendChild(el("span", "enc-bk__k", row[0]));
      r.appendChild(el("span", "enc-bk__v", row[1]));
      spec.appendChild(r);
    });
    half.appendChild(spec);
    return half;
  }

  function closeButton(cls) {
    var b = el("button", "enc-bk__x " + (cls || ""));
    b.type = "button";
    b.setAttribute("aria-label", "Close");
    b.appendChild(cross());
    b.addEventListener("click", close);
    return b;
  }

  function build() {
    layer = el("div", "enc-bk");
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "Book thirty minutes with Encapsulate");

    var scrim = el("div", "enc-bk__scrim");
    scrim.addEventListener("click", close);
    layer.appendChild(scrim);
    layer.appendChild(inkHalf());

    panel = el("div", "enc-bk__panel");
    layer.appendChild(panel);
    document.body.appendChild(layer);
  }

  /* The panel as the design draws it: a 3px green rule along the top, the title inside the body
     rather than in a bar, and the calendar under it. */
  function calendarPanel() {
    panel.textContent = "";
    panel.removeAttribute("data-enc-done");
    var head = el("div", "enc-bk__head");
    head.appendChild(el("span", "enc-bk__title", CONTENT.title));
    head.appendChild(closeButton());
    panel.appendChild(head);

    var box = el("div", "enc-bk__cal");
    panel.appendChild(box);

    var foot = el("div", "enc-bk__fallback");
    foot.appendChild(el("span", "enc-bk__k", CONTENT.fallback[0]));
    var a = el("a", "enc-bk__away", CONTENT.fallback[1]);
    a.href = CAL_PAGE;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    foot.appendChild(a);
    panel.appendChild(foot);

    calLoader();
    var C = window.Cal;
    if (!C) return;
    if (!inited) {
      C("init", NS, { origin: "https://app.cal.com" });
      C.ns[NS]("ui", CAL_UI);
      subscribe(C);
      inited = true;
    }
    C.ns[NS]("inline", {
      elementOrSelector: box,
      calLink: CAL_LINK,
      config: { layout: "week_view", theme: "light" }
    });
    mounted = true;
  }

  function fact(label, value, sub, href) {
    var r = el("div", "enc-bk__fact");
    r.appendChild(el("span", "enc-bk__k", label));
    var col = el("span", "enc-bk__fcol");
    col.appendChild(el("span", "enc-bk__fv", value || "—"));
    if (href) {
      var a = el("a", "enc-bk__flink", sub);
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      col.appendChild(a);
    } else if (sub) col.appendChild(el("span", "enc-bk__fs", sub));
    r.appendChild(col);
    return r;
  }

  /* What a completed booking returns, at drawer width. The contact page has a fuller version of
     this built from Notion's own words; this is the one every other page gets. */
  function confirmPanel(data) {
    var b = (data && (data.booking || data)) || {};
    var d = CONTENT.done;
    var startISO = (data && data.date) || b.startTime || b.start || "";
    var minutes = (data && data.duration) || b.length || 30;
    var org = (data && data.organizer) || b.user || {};
    var guest = (b.attendees && b.attendees[0]) ||
      (data && data.attendees && data.attendees[0]) || (data && data.attendee) || null;
    var uid = b.uid || b.bookingUid || "";
    var meet = meetUrl(b, data);
    var w = when(startISO, org.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      minutes);
    var pending = data && data.confirmed === false;

    panel.textContent = "";
    panel.setAttribute("data-enc-done", "");

    var top = el("div", "enc-bk__done-top");
    var mark = el("span", "enc-bk__tick");
    mark.appendChild(tick());
    top.appendChild(mark);
    top.appendChild(closeButton());
    panel.appendChild(top);

    panel.appendChild(el("span", "enc-bk__title enc-bk__done-h",
      pending ? d.pending : d.title));

    var facts = el("div", "enc-bk__facts");
    facts.appendChild(fact(d.labels[0], w[0], w[1]));
    facts.appendChild(fact(d.labels[1], org.name || d.host[0], org.email || d.host[1]));
    // the payload does not always carry the guest; an empty row would say nothing
    if (guest) facts.appendChild(fact(d.labels[2], guest.name || guest.email,
      guest.name ? guest.email : ""));
    facts.appendChild(fact(d.labels[3], d.where[0],
      meet ? meet.replace(/^https?:\/\//, "").replace(/\/$/, "") : d.where[1],
      meet || null));
    facts.appendChild(fact(d.labels[4], minutes + " minutes", d.length[1]));
    panel.appendChild(facts);

    var row = el("div", "enc-bk__btns");
    row.appendChild(button(d.read[0], "is-primary", d.read[1]));
    if (uid) row.appendChild(button(d.again, "is-secondary", "https://cal.com/reschedule/" + uid));
    panel.appendChild(row);

    if (uid) {
      var cx = el("p", "enc-bk__cancel");
      cx.appendChild(el("span", null, d.cancel[0] + " "));
      var ca = el("a", "enc-bk__away", d.cancel[1]);
      ca.href = "https://cal.com/booking/" + uid + "?cancel=true";
      ca.target = "_blank";
      ca.rel = "noopener noreferrer";
      cx.appendChild(ca);
      panel.appendChild(cx);
    }

    var links = calendarLinks("30 min meeting with Encapsulate", startISO, minutes,
      meet || "Meeting link is in the calendar invitation.");
    if (links) {
      var cal = el("div", "enc-bk__cals");
      cal.appendChild(el("span", "enc-bk__k", d.cals[0]));
      var list = el("div", "enc-bk__btns enc-bk__cals-row");
      d.cals[1].forEach(function (name) {
        var key = name.toLowerCase();
        var a = button(name, "is-secondary", links[key] || "#");
        if (key === "ical") { a.removeAttribute("target"); a.download = "encapsulate.ics"; }
        list.appendChild(a);
      });
      cal.appendChild(list);
      panel.appendChild(cal);
    }
  }

  /* cal.com fires more than one event for the same booking and they do not carry the same fields:
     the V2 payload measured on 2026-09-18 is only {uid, title, startTime, endTime, status,
     videoCallUrl} while the older one carries the organizer and the attendees. Whichever arrives,
     the fields are merged into one booking rather than replacing it, so a thin event cannot take
     away what a fuller one gave — which is why "Invited" was missing. */
  var payload = null;

  function merge(into, from) {
    var k;
    for (k in from) {
      if (from[k] == null || from[k] === "") continue;
      if (Object.prototype.toString.call(from[k]) === "[object Object]") {
        into[k] = merge(into[k] && typeof into[k] === "object" ? into[k] : {}, from[k]);
      } else if (Array.isArray(from[k])) {
        if (from[k].length) into[k] = from[k];
      } else into[k] = from[k];
    }
    return into;
  }

  function subscribe(C) {
    var booked = function (e) {
      var data = e && (e.detail ? (e.detail.data || e.detail) : (e.data || e));
      if (!data || typeof data !== "object") return;
      payload = merge(payload || {}, data);
      window.encBooking = payload;
      try { sessionStorage.setItem("enc-booking", JSON.stringify(payload)); } catch (err) {}
      if (layer && layer.hasAttribute("data-enc-open")) confirmPanel(payload);
    };
    ["bookingSuccessful", "bookingSuccessfulV2",
     "rescheduleBookingSuccessful", "rescheduleBookingSuccessfulV2"].forEach(function (name) {
      try { C.ns[NS]("on", { action: name, callback: booked }); } catch (err) {}
    });
    window.addEventListener("message", function (e) {
      if (!/(^|\.)cal\.com$/.test((e.origin || "").replace(/^https?:\/\//, ""))) return;
      var d = e.data;
      if (d && typeof d === "object" && /booking/i.test(d.type || d.action || "") &&
          /success|confirm/i.test(d.type || d.action || "")) booked(d);
    });
  }

  function open(from) {
    if (!layer) build();
    opener = from || null;
    if (!mounted) calendarPanel();
    layer.setAttribute("data-enc-open", "");
    document.documentElement.setAttribute("data-enc-locked", "");
    setTimeout(function () {
      var x = layer.querySelector(".enc-bk__x");
      if (x) x.focus();
    }, 30);
  }

  function close() {
    if (!layer) return;
    layer.removeAttribute("data-enc-open");
    document.documentElement.removeAttribute("data-enc-locked");
    if (panel && panel.hasAttribute("data-enc-done")) { calendarPanel(); }
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  // ── every "Book a call" on the site ───────────────────────────────────────────────────────
  /* Bound on the document rather than on the links: Super re-renders the page as a single-page
     app, and a listener attached to a link goes with it. A modified click (new tab, new window,
     download) is left alone. */
  document.addEventListener("click", function (e) {
    if (/^\/contact-us\/?$/.test(location.pathname)) return;   // that page has its own calendar
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="cal.com/' + CAL_LINK + '"]');
    if (!a) return;
    if (a.closest(".enc-bk")) return;                          // the drawer's own escape hatch
    e.preventDefault();
    open(a);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && layer && layer.hasAttribute("data-enc-open")) close();
  });

  // a booking that came back through the query string (cal.com's redirect) opens on arrival
  window.addEventListener("load", function () {
    if (/^\/contact-us\/?$/.test(location.pathname)) return;
    var q = new URLSearchParams(location.search);
    if (!q.get("bookingUid") && !q.get("uid")) return;
    open(null);
    confirmPanel({
      date: q.get("startTime") || q.get("date") || "",
      duration: parseInt(q.get("duration") || "30", 10),
      organizer: { name: q.get("hostName") || "", email: q.get("hostEmail") || "",
                   timeZone: q.get("timeZone") || q.get("tz") || "" },
      booking: { uid: q.get("uid") || q.get("bookingUid") || "" }
    });
  });
})();
