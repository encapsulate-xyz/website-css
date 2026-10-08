# The navigation bar

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The navigation bar (from "The systems in main.css")

**The navigation bar (§04 + navbar.js, 2026-09-21, design *Navbar 4f Page*).** The bar is
**Super's own navigation** — its items, its groups and its radix dropdown, keyboard included —
drawn as 4f draws it: **it takes no space** — `margin-bottom: -64px`, `z-index: 50` — so the page
starts at the top edge and the bar lies over the cover, transparent with no rule at rest and
scrolling away with it; paper and a hairline while a menu is open (`nav.super-navbar[data-enc-nav-open]`, set by navbar.js), the
wordmark at 140px, the items in one recessed pill group (second paper, hairline, 12px radius,
44px items at 15/500), and Super's CTA drawn from §07's primary tokens.

`navbar.js` fills each panel with the 4f columns: the numbered ledger of the group's own pages
with a line under each, the destination in the middle column (a tile and its name), its note in
the third, and a foot carrying the group's line and the page count. The lines and notes live in
`CONTENT` **keyed by href** — Super's navigation holds a label and a URL and nothing else, and the
bar is on every page, so there is no block to read; the same exception as the footer's CTA and the
drawer's copy. Add a page to the menu in Super and it appears; give it a CONTENT entry and it also
carries its line.

**The lit item is an ink tab** (handoff 2026-09-25, v278 — "M" in the file's Navbar Rest State
Patterns): the page you are on at rest, and the hovered or open group while a group is under the pointer
or its panel is open, is a **36px ink pill with paper type** drawn behind the label (`::after`, inset
3px inside the 44px item's 1px border); on the ink bar a **paper pill with ink type**. Its caret is
`#9FA39B` on the ink pill at rest and paper once hovered or open; `#6B6F68` on the paper pill at
rest, ink hovered. No ring and no highlight. The caret sits 11px from its label (the file's 6px
gap plus the caret's 5). The file's own pill renders 34px — its `top: 4, bottom: 4` sit inside a
1px border — and the user's note says 36, which is what is built. **Super draws every navbar item
at `opacity: .7` until hovered** (super.css `.super-navbar__item, .super-navbar__list`): the resting
labels had shown at 70% since the bar was built; §04 now sets 1. The history below is the ring the
tab replaced.
**A hovered group is "open" from the moment the pointer arrives** (v279): the file's `open` is
simply "hov is a group", so the bar turns paper, the paper wordmark returns and the hovered group
becomes the ink tab at once. Ours waited for radix to mount the panel (~200ms), and on an ink page
spent that time lighting the hovered item the at-rest ink way — a paper pill — before flipping to
the ink tab on the paper bar (the user's report, 2026-09-25). `navbar.js` `paint()` counts
`.super-navbar__list:hover` as open and repaints on the bar's `pointerover`/`pointerout`; the
ink bar's hover rules were deleted. Book a call is not a group: over it the bar stays ink.
**The current page's tab stays lit over Book a call, the logo and the Menu button** (v342; the handoff's one change of
2026-09-30, after the user asked the designer "when we hover the Book a call button the highlighted selected goes
away, is this expected?" — the file's `anyOpen` is now true only for a hovered group or its panel). Until v342 any
hover in the bar cleared it (`.super-navbar__actions :hover` was in the current-tab rules' guard). Measured with real
pointer moves on /networks and the Axelar guide.

**One ring, one job** (handoff, 2026-09-23, v259; restyled 2026-09-24, v267): the ring — since
v267 a **transparent** pill with a `#D9D9D2` ring and the full-white top highlight, ink type, on a
**paper** track (it was a paper fill on the `#F2F2ED` track); on ink, paper type in a
`rgba(250,250,248,.4)` ring with no highlight — marks the current page while the bar is at
rest, and moves to the hovered or open group while anything in the bar is under the pointer
(Book a call included, which lights nothing), then returns. Never two rings at once: the current
pill's rule carries `:not([data-enc-nav-open]):not(:has(… :hover))`. Lit is the same on ink as on
paper, the current pill on ink included. The caret is ink on the hovered group, `#6B6F68` on a lit
pill at rest, and `#9FA39B` on ink only where a pill is not lit. Measured on /networks (paper) and
the Axelar guide (ink) with real mouse moves in headless Chrome (now `scripts/livecheck.mjs --steps`).

**The ink bar at rest** (handoff, read 2026-09-23): labels `#C9C9C4` with the caret at `#9FA39B`
(the hover wash and the paper-only ring described here were replaced by the one-ring rule above); an **opaque `#373834` track** on a `rgba(250,250,248,.18)` border, so the cover's discs
do not show through it; Book a call keeps the inset lift and drops the shadow under it; the current
page's pill is paper on both grounds. The geometry is the same on both: 44px, 15px, 12px, 10px.
Opening a menu is a **colour-only change, .16s**, and the whole bar turns paper on ink too, so bar
and panel read as one sheet; the panel itself is paper everywhere. The change list for that round
said "paper type on the nav items", which read as `#FAFAF8` at rest — the file says otherwise, and
the file is what the values come from.

**Moving between groups is a swap, not a slide** (v287): Super's radix animates the panel change
— the old one leaves 200px sideways, the new one enters from the other side over 200ms
(`[data-motion]` enterFromLeft/Right, exitTo…). 4f just shows the next panel; §04 sets
`animation: none` on `.super-navbar__list-content[data-motion]`. The first open keeps Super's fade.
**So a panel is built before it paints** (v290): navbar.js built a newly mounted panel in a task
after the mutation, and the browser painted one frame of Super's raw list (540px against the
built 475) in between — the slide had hidden it; without it every swap flashed and jumped (the
user: "choppy"). The observer's own callback, which runs before paint, now builds any
`.super-navbar__list-content:not([data-enc-nav])`; over 12 swaps, 0 raw frames and one height.
Anything else that must never show unbuilt goes there too, not in `tick()`.

**The bar is one hover band.** Radix closes a panel the moment the pointer is on neither the
trigger nor the panel, so the gaps beside the logo and before the CTA shut it. `navbar.js`
`band()` holds it open while the pointer is anywhere over the bar or its panel — the gaps never
*open* one, since nothing is dispatched unless a panel is already open — and hovering Book a call
closes it, as the design does.

**Read against the file element by element on 2026-09-23** (bar, track, item, caret, CTA, panel,
ledger row, preview, third column, about, foot — every size, colour and string) and two pixels
were off: the bar measured **65** (the design's 64 is border-box *with* its rule; the content
row is 63 now, the nav 64), and Super hangs the panel at **63px**, painting it over the bar's own
hairline, where the design paints from 64 and keeps the rule visible between bar and panel — the
wrapper's `top` is `calc(100% + 1px)`, since 100% of an absolute box's containing block is the
padding box, which stops above the border. Everything else matched.

Because the bar lies over the page, **the cover's content starts 96px down** (§14 adds the bar's
64 to its own top padding) and a page that opens on ink takes the bar's on-ink variants until a
menu opens: labels `#C9C9C4`, the pill group on the .06 wash, and **`svg/wordmark-reversed.svg`
in place of Super's logo** — the brand's own reversed drawing, not the logo turned inside out by
a filter (the user's file, 2026-09-23; the filter is left only for the instant before the swap).
The reversed mark is worn **only while the bar is actually on ink**: the moment a menu opens the
bar takes its paper ground, and a paper mark on paper is invisible (reported 2026-09-23), so
Super's own logo goes back for that moment. `paint()` settles the mark on every tick rather than
only when the open state changes there — an older build left running on the page can set the
attribute first, and this one would return before putting the mark right.
**Which pages those are is measured, not listed:** `navbar.js` `ground()` reads the ground under
the bar's own line — `elementsFromPoint`, since the bar is the topmost thing at that line and
walking up from it never reaches what it lies over — and marks the bar `[data-enc-nav-ink]` when
its luminance is under half. It was keyed off Super's `parent-page__blog` until then, which is
why a guide page kept the paper bar over its ink head; that class stays as the no-JS fallback
for a post. The bar scrolls away with the page, so the measurement is only taken at the top.
**It is read again on the way back to the top** (v283): a guide builds its ink head while the
browser has scrolled away (anchoring holds the reader's place as the bands go in above), then
guide.js returns to the top with no mutation, so no tick measured again and the bar kept the paper
it read before the head existed — 4 of 6 loads of the Axelar guide. A passive scroll listener
re-reads the ground whenever the page arrives at the top, and it is read once more 1.2s and 3s
after load. 6 of 6 loads correct after; paper pages unaffected.
**Anything fixed over the page is not its ground** (2026-09-25, v280): the booking drawer's ink
half lies under the bar's line while it is open, so the bar was marked ink, took the ink track and
the reversed wordmark, and kept them after the drawer closed — white letters on the /brand cover.
`overlay()` skips every element that is, or sits in, a `position: fixed` box, and the bar measures
again when `html[data-enc-locked]` changes. The bar's links and groups carry the file's focus ring
(3px at .32 ink, 2px out; paper .5 on ink) — the drawer hands focus back to Book a call on close,
and Chrome drew its own blue ring there.

Three traps: **Super's `.super-navbar__list-content` is a flex row with `align-items: flex-start`**,
which it keeps when the direction is turned to column — the 4f grid inside then shrinks to its
content, full width under the chains grid and a third of it under a short list, so the preview
was 520px on one group and 184px on another; it is `align-items: stretch` now, with the grid and
the foot at `width: 100%`. **Super's own rules carry two classes** (`.super-navbar.simple`), so every rule that
fights one is anchored on `.super-root`; and **Super slides its dropdown viewport under the
trigger with an inline transform**, which 4f's full-width panel cancels (`transform: none`).
**The panel's preview is the page's own cover, captured**: the design's nine `cover-thumbs`, now in
`img/nav-covers/` beside the CSS so a capture cannot drift from the page it shows, drawn
`left center / cover` in a 16/10 box as the file draws them. navbar.js keys them by href and marks
the tile `[data-enc-shot]`; without one — "Institutional staking", whose capture the design itself
does not ship — the tile is the design's ink fallback carrying the page's name.

**The current page is marked** the way the design marks it (paper, ring, inset highlight). Every
item is a group, and a group is current when the page is one of its links — by prefix, so a guide
or a post marks the group that holds `/guides` or `/blog`. **Which links a group holds is read
from Super's own data** (v258): Super embeds the whole navbar configuration in the page's inline
data scripts — each group `{"id": <uuid>, "type": "list", …, "list": [{…"link": "/networks"}]}`
— and that uuid is the one in the group's trigger (`aria-controls="…-content-<uuid>"`). The quotes
are escaped once in the HTML and three deep in the browser's script text, so every run of
backslashes before a quote is dropped before reading. Groups are keyed by the uuid, not the
trigger's element id, which radix regenerates after hydration.
  **Never open the menu with synthetic events again.** Until v258 the groups were harvested by
  opening each one behind a hidden viewport; each was held 90ms, under radix's open delay, so
  nothing mounted, the harvest retried for half a minute, and its enters and leaves fought the
  reader's pointer — pointing at Services opened Company, and no page was ever marked current.
  Reproduced in headless Chrome with real mouse events (`scripts/livecheck.mjs`, which
  reroutes a tag's files to a commit or to the local repo); with the harvest off, Services opened
  Services. `mouse(type)` (a `PointerEvent` with `pointerType: "mouse"`, the only kind radix
  answers) is still used by `band()` to hold an open panel open. A group's section links (`/#block-…`) never make it current — "Institutional staking" is a
section of the homepage and lit Networks there until v281. A section link is its own destination, so `CONTENT` is keyed by the whole
href — `/services#block-…` is not `/services`.

**One row height for every group, at every width** (handoff, 2026-09-24; the user, 2026-09-29: "they should be all same
height at all sizes", v337): the preview — the 16:10 capture and its
name line — sets the panel's row (357px at the design width); the ledger and the third column
fill it without growing it and clip what does not fit (`contain: size` on both, standing in for
the file's absolutely positioned inner box). The counts are chosen to fill it: 21 chains, 7
guides, 4 posts, 6 votes; lists are 51px rows. **The name line is one line, always**: under 1180px "Services and tooling" beside its line did not fit
the middle column, the line wrapped, and that panel stood 20px over the other four (it had since the panels were built;
I reported it as outside the handoff and the user said fix it). The name stays whole and the line beside it is cut
with an ellipsis (`.enc-nav__line-desc`); at the design width nothing moves — the ink of both measured the same to a
tenth of a pixel before and after. Proved by hovering every group and every row of its ledger at eleven widths, 960 to
2560, and reading the panel's height each time (`scratchpad/navbar-handoff/sweep.mjs`): one height per width.
**The foot lines go somewhere**: See all →
/networks, "What we build for chains" → /services, "Read the governance record" → the record,
"Read the blog" → /blog, Company's "Book a call" → the drawer (`FOOT_HREF` in navbar.js).
**Captures**: the file's covers were recaptured at 1496px with the page chrome painted out. DesignSync's
`get_file` stops at 256 KB — a larger image comes back cut off (no IEND chunk; check for it) — so
the Networks cover and the Dashboards panel came as the user's export (v269).
**The captures are WebP and fetched ahead of use** (v284): the PNGs were 80–650KB each (2.1MB),
requested only when a panel first opened, so the first preview drew in late (the user,
2026-09-25). Each has a WebP beside it at the same 1496px (q88, `cwebp -m 6 -sharp_yuv`; 451KB in
all, indistinguishable at 100%) and navbar.js uses those; the PNGs stay as the design's files.
`warm()` fetches each group's first capture once the page is idle (desktop only, never when the
reader asked to save data), every capture when the pointer or focus first reaches the bar, and on a
phone the five sheet covers when Menu is pressed.

**The Services column** is two by two, filling the panel's height, each capture drawn whole from its
top-left (handoff, 2026-09-24; it was a corner at 170%). **The wide bar holds down to 960px**, the
design's own switch, at its own 44px gutters — five items, the mark and the CTA fit from 960 up
(measured: items 222–738, Book a call ending at 916). **Super pads the logo link `0 16px` and the
actions `0 8px 0 16px`, the CTA's link `0 8px 0 0`**, which had set the mark at 60 and Book a
call 16px short of the gutter since the bar was built; all three are zeroed (2026-09-24).

**The compact bar, under 960px** (handoff 2026-09-24, *Navbar 4f Page*, "D2" in its comments):
the wordmark at 124, Super's Book a call, and one icon-only **Menu** button (44px, the
secondary's paper and ring; `.06` fill and `.3` ring on ink) that navbar.js puts in Super's
actions. It opens **a sheet under the bar**: a rail on ink (both grounds) carrying the groups as
01–05 in Outfit 44 — paper when chosen, otherwise an ink glyph ringed in paper by eight
text-shadows (never text-stroke; Outfit's digits are overlapping contours) — and beside it the
chosen group: its first page's cover (16:10, 4px, the nav-covers capture), the group's name in
mono, its pages as 20px Outfit rows with their line. It opens on the first group, one at a time.
The bar comes back to the top (`position: fixed`) with its ground while it is open, the page is
locked (`html[data-enc-sheet]`), and the sheet sits at z 55 — over the chain dock (50), under the
booking drawer (60). Escape, the button, a row or a resize past 959 close it.
- **Super's hamburger and accordion are hidden, not restyled**: the accordion opens several groups
  at once and the design shows exactly one. The sheet is built from **Super's own navigation
  data** (the same harvest as the panels' groups, `pagesOf`), so the groups, their names, their
  pages and their order stay Super's; the line under a page is the description Super holds for
  the link if one is set (none are), else `CONTENT`'s.
- **A row opens its page through `window.next.router.push`** — the app router Super's own links
  use — so it stays a client-side navigation (checked: same document, /networks → /services).
- **The rail is its numerals' width, and the numerals follow the screen** (v341, the user, 2026-09-30:
  "this number side bar is flexible, yours is fixed width"): the file's `.nav-compact {display: flex
  !important}` also lands on the sheet, so its `clamp(76px, 24vw, 128px)` grid track never applies and the
  rail is a flex item sized by its numerals — `clamp(28px, 8.4vw, 44px)` at `padding: 8px 6px` inside the
  rail's `24px clamp(8px, 3vw, 16px) 32px`. Measured on the design's own render and on the live page with real
  clicks: 70.6px at 360, 75.5 at 390, 97.9 from 524px up, identical. Until v341 the numerals were a fixed 44px
  and the rail 98px on every phone (the 390 check of 2026-09-24 had matched an older file).
- **`ground()` does not measure while the sheet is open** — the ground under the bar is then the
  sheet's own ink rail, and the paper bar turned ink (seen on /networks).
- The design's row hover (`.nav-row:hover`, the second paper) is kept on paper only; on ink it
  would put paper type on a paper wash.

**The panel opens with a search of its own group** (handoff re-read 2026-09-28, v332; *Search Trigger
Patterns* Y4a). It replaced the foot line and the page count, and **since the handoff of 2026-09-29 (v336) it stands at
the panel's head, over the three columns** — no rule, 6px under it on top of the panel's 22px gap, so 26px down to the
box and 28px from the box to the columns; every group's panel is 478px tall at 1440 (navbar.js `searchHead`,
`.enc-nav__head`). It was the panel's foot, under a hairline, for one day. The file's only change that day was this
move — found by diffing it against the copy kept from the pass before, which is the quickest way to read a handoff of
a file already built. The box: the scope as an ink token
(Networks, Tools, Votes, Posts & guides, Company), a typed example behind a drawn caret while it is empty
and idle (~95ms frames; reduced motion shows the first name), "Search <noun>" once focused, the ⌘K / Ctrl K
keycap; `#D9D9D2` ring, `#B9B9B1` hovered, ink while focused, the 3px ring for the keyboard only
(`html[data-enc-mouse]`). Typing puts the results over the panel's body (the grid stays underneath,
hidden, so the panel keeps its height) in the panel's own rows: chains with their rate, ledger rows for
guides, posts and tools, the record's line for votes, and the kit's things led by the thing itself —
grouped scopes carry a mono header per kind ("Guides · 9"). ↑↓, Enter, Esc (clears, then lets go); while
the box has focus the panel stays open — band() stands down and a pointer leaving bar and panel is not
reported to React. ⌘K goes to the open panel's box, or opens the current page's group (the file draws the
keycap but wires nothing; this is ours). **The scorer is the design's `site-search.js`** (`window.encSearch`
— exact 1, start .85, overrun .7, typo .6; entries hit by every word win; a typo fallback when nothing
matches). **What it searches is read from the pages when a box is first used, not the design's copied
lists:** Networks the set (`encCounts().list`, rates from /networks), Tools /services' four tables by
header (the Bots table holds the three events — Releases, Proposals, Validator alerts — not the file's bot
names), Votes the record's table (all 1,150 rows; a result opens its Proof), Posts & guides /guides and
/blog (a guide by its Title, as the Learn column shows it), Company /brand (the kit's files, the Colour
database, the three faces), /investments' Portfolio and /contact's four routes. Its words are `SEARCH` and
`SAY` in navbar.js. **Never name a navbar.js variable `tick`** — that is the bar's own update; the typing
counter was called that for one build and stopped paint, ground, the current mark and the band.

**The third column is read, not written.** The handoff's rule (Aditya, 2026-09-21): it lists the
page's own sub-pages or section headings, *taken from the page as built — nothing typed in, so it
cannot drift* — and only a page with neither carries the note. `navbar.js` `READ` has one reader
per destination; the page is fetched **once per visit, only when a pointer rests on its row**
(220ms — a sweep across the bar fetches nothing), parsed with DOMParser and kept. While it loads,
or if it yields nothing, the note stands in.

| Destination | Column | Read from |
|---|---|---|
| /networks | chains, 3 across | the Networks set, first **twenty-one** cards of the Order-sorted view, with rates — seven rows fill the column |
| /services | tiles, 2 across | no fetch — the group's own section links that have a panel capture, each tile drawn at 170% from its top-left |
| Dashboards (`/services#block-…81cf…`) | list, "Live now" | the Dashboards table on /services, in Order: each row's **Menu** property ("Sui RGP dashboard"), linked to its Link. Menu was added to the table for this on 2026-09-23 |
| /governance-record | votes, "The latest votes" | the record's own table, newest first, six rows: the chain's mark (the set's glyph from the counts, else covers.js), "Terra · 4851" (Network · Reference), the vote as a dot — green yes, ink no, hollow abstain — and the day (since 2026-09-24; it was the four pillars' questions) |
| /security | list | the page's `h2` headings |
| /guides | guides | Guides database, first **seven**: chain mark (from the set on the same page), the guide's **Title** ("Stake AVAX with Core", since v329 — it was the chain's name) and the wallet as the tag |
| /blog | posts | first **four** cards, 89px rows: cover in miniature at 112×70 (the design's tint filter), title, first pill |
| /brand | list | the rail's numbers — `01 · The marks` → *The marks* |
| /investments | holds, 2 across | the Portfolio cards: logo, name, the four-digit year |
| /contact-us | list | four blocks by id: the booking headline, "Or write to us", the fold, "Elsewhere" |
| any other section link (Playbooks, Bots, Monitoring, Institutional staking) | the note | — |

A section link is its own key in `READ` and `KIND` (after the `MOVED` alias), and its page is
fetched by path. /governance-record is 405KB gzipped (the record table),
which is why nothing is fetched on a pass-through.

**Two kinds of capture** in the middle column, as the design draws them: a page's cover
(`img/nav-covers/`, `cover / left center`) and a tool's panel (`img/nav-panels/`, drawn
`cover / left top` since the handoff of 2026-09-23 — the four tool captures are now the Services
page's own sections, 1100×619 and 1491 wide; the Services column's small tiles still draw them at
170% from the top-left); the institutional dial is a panel file drawn as a cover. The Services
cover capture was re-exported with the new cover text the same day. The
tile holds an `<img>` and `[data-enc-shot="cover|panel"]` picks the draw. `window.encNav` exposes
the build's version and its readers, so each can be run against its page from the console — the
live page's older script otherwise races a newer one for the panels, which is why the end-to-end
check was done in a clean `srcdoc` frame.

**The Services group points at the page's own bands** (`/services#block-<callout id>`) since the
page was rebuilt on 2026-09-23: Dashboards `…81cf8a82c41c2f9f8c78`, Playbooks
`…81719a14e42a6532c579`, Bots `…81598024c57e15cbd370`, Monitoring `…8115ac0dd17fb46b383d` (all
`3e4e800a5138…`) — set in Super → Navigation → Menu items. navbar.js keys its copy by those hrefs
and aliases the four old ids (`MOVED`), so the panels read right either way; a click on an old id
lands at the top of /services. **Super's editor cannot be trusted from the automation tab:**
editing an item there (native value setter + `input`, then Save) updated the editor's own list and
read back correctly when the item was reopened, but a fresh load showed the old link — nothing
had reached Super's server. A second try with real key events and a real click could not be
checked, because the hidden tab then stopped rendering the app at all (throttled timers). Menu
edits are the user's to make. **minima frosts the navbar** (`backdrop-filter: blur(12px)` plus a white wash) — 4f's bar is
plain glass, so both are cancelled, or whatever the bar lies over is smeared.
