# /investments

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## /investments (2026-09-21, design *Investments Page*)

Two full-bleed bands after the cover, built by `investments.js` from Notion:

- **01, on ink**: the kicker, "We invest in the chains we operate." at clamp(38,5.6vw,84), the lede,
  then the positions as a band of pastel discs that runs (30s, `enc-inv-run`) and **pauses on the
  mark under the pointer**; the line beneath prints that position — name, `category · since YEAR`,
  and the Validator pill's own words beside a dot that is green when we run one.
- **02, on paper**: the six questions as a segmented control, one answer at a time with the verdict
  as a disc (green Yes / ink No), and the ask at the foot with Book a call and **Send the spec**,
  which links to the contact page's form block (`/contact-us#block-3dee800a51388006bd4aeba0fb2a72c7`, "Get in touch"; it pointed at `…808c8e81…` until 2026-09-26, a block no longer on the page, and landed at the top).

**The positions are the `Portfolio` database** (`807c8bde…`), one row per position: Name,
Description, **Category** (select), **Since** (text), **Validator** (select, whose two options are
the design's own labels — "we run a validator here" / "not yet in the set"), Files & media (the
logo, drawn in the disc), Tags, super:Link. The script reads the rendered cards, so nothing about a
position lives in the code: the category and the validator line are matched by value, not by
Super's property hashes, and a missing year or pill just drops out of the line.

**Its gallery view must show Category, Since and Validator** — the API cannot switch a view's
properties on. Without them the band still runs and names each position.

Removed from the page on 2026-09-21: the Tally form column ("Looking for Investments?", its
paragraph and the quote) and the "Our Investments" heading — the design has neither, and the ask's
second button goes to the contact page's form instead.
