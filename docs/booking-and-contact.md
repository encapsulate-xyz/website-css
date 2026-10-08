# The booking drawer and the contact band

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The booking drawer (2026-09-18, design *Drawer Variations*)

Every "Book a call" on the site used to open cal.com in a new tab. `booking.js` (site head) now
catches the click and opens the drawer the design settles on: the **split takeover** with the
**green-edge chrome** — the band's own ink on the left carrying the eyebrow, the headline with its
circled word and the three spec rows, cal.com's calendar on the paper half, a 3px green rule and an
inline title instead of a header bar. Escape, the backdrop and the 44px close all shut it; the body
scrolls only inside the drawer (`html[data-enc-locked]`). Styles: **main.css § 18** — the drawer
opens on every page, and main.css is the only stylesheet that is on every page.

- **It binds by href**, on the document: any `a[href*="cal.com/aditya-encapsulate/30min"]`, whenever
  Super renders it. So nothing in Notion changed and nothing needs to — the covers' green buttons,
  the homepage hero, the footer CTA are all already links to that URL. A ⌘/ctrl/shift/alt click is
  left alone, so "open in a new tab" still works.
- **/contact-us is excluded** by path: that page has the calendar in its own band and its own
  confirmation built from Notion's words.
- **When the booking lands**, the paper half becomes the confirmation — tick, the facts, the two
  buttons, the cancel line and the four calendar exports — built from cal.com's payload.
- **The drawer's words are in `CONTENT` at the top of booking.js, not in Notion.** They have to be:
  Super ships only the current page's blocks, so there is no block to read on eleven of the twelve
  pages. This is the same exception already made for the footer's CTA copy and the Copy button's
  "Copied" feedback, and the user agreed to it on 2026-09-18.
- `window.encBook` publishes `when()`, `calendarLinks()` and `meetUrl()` so contact.js and the
  drawer cannot drift on the payload; the design file asks for exactly that extraction.

## The contact band's fold holds the dial (2026-09-18)

The toggle at the foot of /contact-us ("Staking a treasury or a fund?") is a Notion **form block**,
and that form is the institutional one — so `home.js` claims it as the Institutional Dial exactly as
it does on the homepage. Consequences, all of them learned the hard way:

- **`home-dial.css` is linked from `head/contact-us.html`** as well as the homepage's. Without it
  the dial renders as a bare Notion form with a 90px title.
- `contact.js` recognises the dial the same way `home.js` does — by a Number question labelled
  **Amount** — and leaves it alone; its own plain-form shaping (descriptions into placeholders,
  Send on a row) stands down, and every fold-form rule in contact-us.css is scoped
  `:not([data-enc-dial])`.
- The band redraws the dial **fully on ink**: the paper half takes #2A2C28 with a
  `rgba(250,250,248,.18)` hairline for the split, fields and duration pills go to the .06 fill with
  the .3 ring (a picked pill is paper with ink text), the listbox panel is ink. The pastel glyph
  wells and the green Send are the only colour left.
- **Glyphs on a page with no gallery:** `covers.js` publishes `window.encGlyphs()` — its own
  fallback list keyed by chain ("gravitybridge") plus anything the page renders — and `home.js`
  merges it when a name has no card. `mark()` matches on the flattened key too.
- **React resets className on the toggle when it opens**, which took the band's fold styling with
  it. The fold is marked `[data-enc-fold]` (an attribute, per the rule above) and re-marked, with
  its split label and its form, on every tick of contact.js's observer.
- **The meeting link is `booking.videoCallUrl`** (top level), not `booking.metadata.videoCallUrl`
  where cal.com's own success screen reads it — measured from a real booking through the embed on
  2026-09-18: the payload is `{uid, title, startTime, endTime, eventTypeId, status,
  paymentRequired, isRecurring, videoCallUrl}` and carries no metadata, attendees or organizer.
  `contact.js` tries every place the link can be and keeps the payload at `window.encBooking` and
  in `sessionStorage["enc-booking"]`, which is how that shape was read.
- On a booking the confirmation scrolls to the top of the viewport; the band the reader was looking
  at has gone, so the page would otherwise sit mid-scroll where the calendar was.
- Removed from Notion on 2026-09-18: the fold's "Open the institutional dial" button (the dial is
  in the fold now) and, by the user's own edit, the paragraph "Size, custody and jurisdiction are
  the first things we will ask."
