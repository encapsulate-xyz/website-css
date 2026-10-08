# Below 900px and the audit of 2026-09-26

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## Below 900px (2026-09-25, v282)

Every page was checked at 360–880 and fixed where broken, each file in a "BELOW 700px" section at
its end; **every added rule sits in a media query capped at 900px**, and 1440 was proved unchanged
by computed-style snapshots (base = the last release from the CDN, local = the new files; only the
footer's rotating discs differ, and they differ between any two loads). The user's rule: nothing
above 900px changes in this work. What was learned:

- **An absolute `::before` ground escapes a card that goes `position: static`.** The homepage's
  stats and testimonial decks fall back to static cards on phones; each card's ink `::before` then
  sized itself to the page (390×14,607px) and ten of them painted ink over every section below —
  black headings, empty rows. `position: relative` on the cards.
- **Covers (§19 + covers.js):** on phones and to 800px the field box is 93.5vw tall and some
  fields' marks rise above it, so the words reserve `93.5vw × (1 + --enc-field-rise) + 28px`
  (`rise()` measures it). A crumb or foot pair that does not fit on one line stacks
  (`fit()` → `data-enc-stack-top|foot`).
- **The homepage hero** is centred by code since v291 (see Homepage).
- Per page: /governance-record's controls and rows reflow (the rationale is always open on touch),
  /security's sticky blocks are static, /investments' six questions wrap into a grid under 800,
  /networks' sort and search sit under the tabs up to 860, the chain dock wraps under 640 and the
  hero stacks to 900, /blog's grid is two columns at 701–900. (The raw guides' 76px top padding to 900
  went in v347, with the old page CSS that had forced their top to 40px: Super's own 80px now puts an
  unconverted guide's first block 16px under the bar at every width.)
- **Left alone on purpose:** the guide's hollow numeral lies behind the capture on a phone (the
  user: by design), the footer wordmark's crop, the cover field's left crop.
- **Still open above 900px** (the user said leave it): /blog's grid squashes at 901–1024; the chain hero is tight at 901–960;
  the booking drawer wraps at 901–919.
- **livecheck** now lets Chrome pick its own port (`--remote-debugging-port=0` + the profile's
  DevToolsActivePort): with a random port, parallel runs attached to each other's browsers.

## The audit of 2026-09-26 — every page the navbar and footer reach, 320–2560

Six read-only auditors (one per group of pages) measured every width with `scripts/audit.mjs`,
reviewed screenshots and used every control with real mouse and keys; the fixes were then made
one at a time, each scoped to the widths where the fault was measured, and proved: the automated
checks clean on 15 pages at 10 widths, and a computed-style comparison at 1440 against the release
before (v304) showing only the intended changes. The old pages (snapshots, Lido DVT clusters, legal,
the rewards calculator) and every guide but Axelar were left alone (the user). v305.

What was broken, now fixed:
- **The navbar's Practices panel** read the record's date by the header "voted on", renamed
  "Recorded" the same day — the latest votes fell back to the note. `READ["/governance-record"]`
  accepts both.
- **Keyboard:** the navbar's group triggers are Super's spans with no tabindex, so Tab never reached a
  menu — navbar.js `keys()` gives each a tabindex, `role="button"` and Enter/Space (a click, once React
  has adopted the node). The compact sheet takes focus when it opens and Tab goes round the bar and
  the sheet only. Super's static.css sets `button { outline: unset }`: every button a script builds
  (`[class*="enc-"]`) takes the house ring on `:focus-visible` (main.css, in the button's own colour
  at 40%, so it reads on paper and ink); a component with its own ring keeps it.
- **/security 04 at 390:** a tap on "03" left "02" selected (the pile's heights moved under the
  smooth scroll) — the chosen step holds for 1.4s.
- **The record's "By chain"** put the database's three empty rows first — unbuilt rows are hidden.
- **/investments "Send the spec"** pointed at a block no longer on /contact-us (Notion link fixed).
- **Chain pages' names broke inside the word** at 901–1919 ("Avalan|che") — chain.js `fitName()`
  measures the longest word on a canvas in em and chain.css takes `min(design size, 100cqi / em)`.
- **React #418 (hydration mismatch) on every page — SETTLED: leave it, and do not raise it again (the
  user, 2026-09-26).** Measured, and left as it is by the user's rule:
  Our scripts build at DOMContentLoaded, before React adopts Super's HTML (the fiber key on
  `.notion-root`); React then throws the built DOM away and renders again, and the observers
  rebuild: a raw-Notion flash at the moment of adoption, 0.1–0.6s on a desktop, 0.3–2s at a 4x
  CPU throttle (`scratchpad/hyd.mjs`-style timelines, ten pages, three loads each). Holding every
  first build until adoption removes the flash but shows raw Notion from first paint until adoption
  — 0.7–7s on a phone-speed CPU (homepage ~3.9s against ~0.5s today). The user: if it makes the page
  slower with Notion visible, don't. So nothing waits for hydration; v305's Menu-button wait was
  reverted in v306 for the same reason (the phone's Menu came in seconds late). A fix that keeps the
  early build would have to rebuild before paint on adoption (observer callbacks, not timers) — not
  attempted.

Responsive, by width:
- **Super's side margin jumped from 24 to 96px at 547** (content narrower at 560 than at 546): from
  547 to 1024 main.css sets `--padding-left/right` on `.notion-root` to `clamp(24px, 16.667vw − 72px,
  96px)`; the homepage above 1920 uses the bands' `max(96px, 50vw − 864px)`.
- **Homepage:** the testimonial quote cleared the names rail (1180–1440); Who we are stacked is one
  left edge and hides "Pick a name"; the contact card's padding on phones and its routes as a list
  under 960; the Why Stake drawings capped at 440px (601–1099); the blog rail starts under its heading
  (≥547); the invisible link list and two empty paragraphs above the footer are hidden (not deleted);
  44px tap rows for LinkedIn and the routes; the table's discs load Super's 96px image, not the
  original (governance.js `small()`).
- **Record:** the vote field three blocks a row on phones (6px marks), the pillar fields without the
  2x2's floor, the ± after a wrapped title's last word (main.css §13d ≤900), the head's button at
  the lede's foot. **Investments:** the status line keeps its shown height; the tabs take arrow keys.
  **Services:** on touch a monitoring chip's first tap fills the sentence, the second follows.
- **/networks:** the count band's tally under the line at 761–1179. **Chain pages:** the dock's facts
  hidden at 761–899, the band tops stacked under 481, the hidden dock out of the tab order, 44px touch
  targets, captions `text-wrap: pretty`.
- **Guides:** the bar and "a wallet" slot on phones; the Axelar step keeps the 1728 composition above
  it; a tall capture held to the screen at 701–900. **Contact:** the calendar frame's floor is the
  booker's 560 under 900.
- **Posts:** empty paragraphs hidden (`:empty`), the rail's progress and ask hidden under 900, a table
  of up to three columns sizes to its words on phones. **Blog:** three-line titles under 900, the last
  card fills its row at 701–900, the lead title a step above the rest on phones; the filter bar's
  panel `min(392px, 60vh)`.
- **Security:** the diagram scales to its frame down to 0.7 (security.js `fitCanvas`) and fades its
  edge while it scrolls, the failover pile steps over its own words under 900, the 02 tabs two by two
  under 600. **Navbar:** the chains' rate hidden at 1101–1365, a 104px wordmark under 360, the stacked
  drawer's calendar a full screen.

Decided with the user after (2026-09-26): the record and the navbar run the full width at ≥1920
(as they are); "1882 votes" stays — it counts votes from before the record was kept; "Hover a
highlighted word" stays; the three blank record rows were deleted (Notion trash); the "Under
reconstruction" banner's Body snippet is to be removed in Super (head/site-body.html is empty); the
blog's no-results state waits for a design. **The EigenCloud pair in the Learn panel:** two guides for
one chain and one wallet — /guides/eigen-layer (11 steps, delegate on EigenLayer) and
/guides/eigen-layer-lst (18 steps, stake ETH on Lido and restake the stETH) — and the second
carried the first's Title. Its Title is now "Restake stETH with MetaMask"; the navbar's /guides reader shows
every guide by its Title since v329, so the twins read apart. The picker still offers one guide per chain
and wallet, so the LST guide is not reachable from it.

**The zk-snarks post's prose** was three JSON code blocks (13, 23 and 31 lines of sentences, 2,096px
lines on a phone). Split at their blank lines, verbatim: 21 paragraphs, and the lines that are only
a formula as 10 plain-text code blocks (consecutive formula lines kept together); the three code
blocks were deleted (originals in backups/zk-snarks-code-blocks-2026-09-26.json).

Still open: the stage block under the index on touch phones, the code copy button over a phone's first
line.
