# website-css

Custom CSS and JS for the Super.so (Notion) site at https://encapsulate.xyz. Designs come as Claude
Design handoffs (project `9da1c502-69a5-4e9f-9b05-9b435acb854b`, read with the DesignSync tool,
`get_file`) and are implemented section by section, verified on the live site.

## How we work (agreed 2026-09-15)

The user shares a design handoff. I:

1. read the handoff carefully (every value — misses were pointed out several times);
2. **edit the Notion page myself** through the API (see "Editing Notion"), so the content is shaped
   for the design;
3. write the CSS/JS in the repo, build, verify on the live page, commit, tag a release;
4. reply with **one table of what to paste** — `File | Paste into` — listing only the `head/*.html`
   files **whose tag changed in that reply**. A file the user has already pasted never appears
   again: repeating a row makes them re-do work and hides the one file that is actually new
   (asked for 2026-09-21). If nothing was rebuilt, there is no paste table at all.

   The same applies to the **Action table**: before repeating an action, **check whether it has
   already been done** — fetch the page, read the database, look at the live HTML — and drop the
   row if it has (asked for 2026-09-21). An action the user has completed must not be asked for
   twice.

   **Run `python3 scripts/paste_table.py` and copy what it prints** (2026-09-21). It compares
   what each `head/*.html` pins against what the live page actually serves and prints only the
   rows that differ — `--why` adds the commits behind each one. The table is never written from
   memory: the one time it was, /networks was carried into a reply where nothing about it had
   changed, which is the mistake this exists to stop. If the script cannot reach the site, fall
   back to the per-file check below.

   **Verify every row before sending it** (asked for 2026-09-21, after /investments was listed
   twice with nothing in it). For each head file you are about to list, run

   ```bash
   git log --oneline <the tag the user last pasted>..HEAD -- <its source files>
   ```

   and drop the row if that prints nothing. `head/site.html` counts as changed when **any** script
   it carries changed. Do the check as a command, not from memory — the source of truth is the
   diff, not what feels recent. Keep the second column to the name of the target and nothing else: `site`
   for the site head, otherwise the page (`brand`, `guides`, `/networks`). The full
   Settings → Code → Head path is noise; the table below says where each file goes.
5. **and a second table of everything else the user has to do** — `Action | Where | Why` — for
   anything I cannot do from here (set 2026-09-19). Never leave one of these as a sentence in the
   middle of a reply: if the user has to act, it is a row in that table. The recurring ones:

   | Action | Where | Why |
   |---|---|---|
   | Show a property on a view | Notion → the view → view options → Properties | the API cannot switch a view's properties on (Guides Step/Time, the pillars' Word) |
   | Switch a database between table and gallery, or set a view's sort or filter | Notion → the view | same — the API cannot change a view at all |
   | Republish a page | Super | the site head is baked per page; after a site-head paste, pages pick it up unevenly, and a stale page runs an old script for every page you navigate to from it |
   | Rotate the integration token | Notion → integration settings | it was shown in chat once |

**The order of work on a handoff (set 2026-09-17):**

1. **Read the handoff first, every time** — including when a section is being revisited. The file
   changes between passes; copy carried over from an earlier version is the most common way a
   section ends up wrong. Check it string by string before saying a section is done.
2. **Put everything the handoff needs into Notion** — texts, headings, buttons, database rows,
   uploaded files. Verbatim: the handoff's words, nothing added, nothing dropped, nothing reworded.
3. **Say what cannot be done from here and needs the user.** The API cannot change a view: it
   cannot switch a database between table and gallery, show or hide a property on a view, set a
   view's sort or filter, or create a linked view. Ask for those explicitly rather than working
   around them in code.
4. **Then implement it verbatim** in CSS/JS, verify on the live page, and hand back the paste table.

User rules that stand on every task:

- **Content stays in Notion.** Never create text, links or buttons with JS unless Notion + CSS
  genuinely cannot produce it, and say so first. Allowed so far: Why Stake derived figures (years
  since 2020, networks count), the footer CTA copy and its glyph list (footer.js), the contact
  Copy button's "Copied" feedback. JS for behaviour and decoration is fine (snapping, glyph
  columns, cover fields, dot pagers).
- **No extra CSS on existing Notion text blocks** unless the section is new or redesigned.
- **No `ch` max-width caps on body/lead text.** Headings may break; when the user shows the break
  they want, set it with an em max-width and `text-wrap: wrap`.
- **Say what was removed** when a Notion edit deletes blocks.
- Commit, push and tag are allowed. Backups before editing any `.css` (below).

## Files

| File | What | Loaded from |
|---|---|---|
| `main.css` | site-wide styles, no `#block-…` ids | site Head |
| `navbar.js` | the bar's panels — design *Navbar 4f Page*; Super still owns the menu | site Head |
| `booking.js` | the booking drawer — every "Book a call" on the site, except /contact-us | site Head |
| `footer.js` | footer 44b, built inside Super's footer | site Head |
| `covers.js` | inner-page cover graphics ("fields") | site Head |
| `home.css`, `home-dial.css`, `home.js` | homepage sections, JS-enhanced styles, homepage scripts | homepage Head |
| `brand.css`, `brand.js` | /brand — four spreads with a sticky rail, the marks slab, the colour band (design *Brand Page*) | page Head + site Head |
| `blog.css`, `blog.js` | /blog — the index (design J); blog.js builds each card's cover and its band span, and is loaded from the site head | page Head + site Head |
| `post.css`, `post.js` | /blog/&lt;post&gt; — every post page (design *Blog Post Page*, variant J). A post has no page head of its own, so both are in the site head and scoped by path | site Head |
| `chain.css`, `chain.js` | /networks/mainnet/&lt;chain&gt; — the 27 chain pages (design *Chain Page Combined*), built from each Networks set row page. Site head, scoped by `[data-enc-chain]` | site Head |
| `notion/chain-pages.json`, `scripts/chain_pages.py` | each chain page's words and facts, researched per chain (sources, notes, how "since" was found), and the writer that puts them into the row pages | — |
| `guide.css`, `guide.js` | /guides/&lt;stage&gt;/&lt;chain&gt; — every guide page (design *Staking Guide Variation 1d*). A guide has no page head of its own, so both are in the site head and scoped by path | site Head |
| `network.css`, `network.js` | /networks (network.js pages the Network Count panels, same gesture rules as home.js decks) | its page Head |
| `services.css`, `services.js` | /services — four services and the ask under the cover (design *Services Categories Chosen*), built from the page's callouts, four inline tables and a copy toggle | page Head + site Head |
| `investments.css`, `investments.js` | /investments — two bands (design *Investments Page*): the thesis and the running band of positions on ink, the six questions on paper | page Head + site Head |
| `governance.css` + `governance.js` (the record page: count band, pillars, controls, rows), `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/`, `img/` | every drawing and icon the CSS references, served from jsDelivr beside the CSS | referenced as `../svg/…` / `../img/…` from `dist/` |
| `notion/page-covers.md` | cover copy for the nine inner pages | — |
| `notion/guide-screenshots.md` | how guide screenshots are captured and composed (agreed 2026-09-18, not yet applied) | — |
| `build.py` | strips comments into `dist/`, copies the JS | — |
| `scripts/paste_table.py` | prints the paste table from head/*.html vs what the live pages serve | — |
| `scripts/livecheck.mjs` | loads a live page in headless Chrome with pinned tags' files served from this repo (or a pushed commit) — pass every tag the page pins, comma-separated (`v263,v227,v220`), runs a check in the page, optional real mouse steps and a screenshot. The scratchpad copies it replaced were lost on 2026-09-24 | — |
| `scripts/shots.py`, `img/shots/` | panel captures of the live tools (Sui RGP, the Solana graph), 1100×750 at DPR 2 from headless Chrome — the extension's screenshots time out on those pages, and a WebGL graph needs swiftshader or it comes back blank. Not wired into any page yet (2026-09-23): the tools table that names their tiles arrived cut off | — |

**Edit sources, run `python3 build.py`, commit source and `dist/` together. Never edit `dist/`.**
When a new page CSS file is added, add it to build.py's default list and create `head/<page>.html`.
If the user drops a file into `dist/`, move it to the root as the source.

## Back up before every change

Before editing any `.css` file, copy it into `backups/` (gitignored), one copy per session:

```bash
cp main.css backups/main.css.bak-$(date +%Y%m%d-%H%M%S)
```

Work has been lost before; `/tmp` is not good enough. When reverting, say which backup and what is
lost. Prune old backups once a change is confirmed.

## Serving and releasing

Repo **github.com/encapsulate-xyz/website-css** (public), served by jsDelivr:
`https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/<file>`. Always pin a tag, never
`@main` (branch URLs cache for 12h).

1. Back up, edit, build.
2. Verify live: swap the page's `link`/`script` URLs to the commit SHA (`@<sha>/dist/…`) in the
   browser and measure. React may restore hrefs — swap again. **A brand-new tag can 404 on jsDelivr
   for a short while**; a test that loads nothing may just be that (reload the link and check
   `performance` entries).
3. Commit (with the session's attribution trailer), push, `git tag -a vN -m … && git push origin vN`.
4. Bump only the `head/*.html` files whose dist files changed — prove it with
   `git log --oneline <lastTag>..HEAD -- <source files>` before bumping or listing a row — and
   tell the user in a table. Carry a row forward only if that file changed again since they last
   pasted it; an empty log means no bump and no row.

Note: `git commit` also commits anything the user has staged — check `git status` first.

### Head files — what the user pastes

| File | Paste into (replace everything) |
|---|---|
| `head/site.html` | Super → Settings → Code → Head (minima, main.css, navbar.js, footer.js, covers.js, fonts) |
| `head/site-body.html` | Super → Settings → Code → Body (temporary "under reconstruction" banner) |
| `head/home.html` | Homepage → Code → Head (CSS only — home.js is in the site head) |
| `head/networks.html` | /networks → Code → Head (view-picker + network.css; network.js is in the site head) |
| `head/governance.html` | /governance-record → Code → Head |
| `head/blog.html` | /blog → Code → Head (blog.css; blog.js is in the site head) |
| `head/brand.html` | /brand → Code → Head (brand.css; brand.js is in the site head) |
| `head/contact-us.html` | /contact-us → Code → Head |
| `head/guides.html` | /guides → Code → Head (view-picker + guides.css) |
| `head/investments.html` | /investments → Code → Head (investments.css; investments.js is in the site head) |
| `head/security.html` | /security → Code → Head |
| `head/services.html` | /services → Code → Head |

A page whose CSS moved to the repo has its Code → CSS box emptied. Pages not listed (team, etc.)
have no repo file yet.

**Super bakes the site Head into each page when it republishes that page.** After a site Head
paste, pages pick it up unevenly; check each page's served `website-css@vN` before diagnosing.

### Site Head notes (audited 2026-09-14)

- **minima.min.css is required** — Super does not load its theme itself on this site.
- Fonts rendered: Inter (Super, /fonts), Outfit, Hanken Grotesk, JetBrains Mono, Architects
  Daughter. Manrope went with the old slide-out menu (2026-09-22). Arial Black, Georgia, Verdana,
  Monaco are system fonts.
- Headings use `sans-serif` where "Archivo" was once asked for but never loaded — do not add an
  Archivo link.
- `@import` is stripped from Super's Custom CSS box; use `<link>` in a Head.

## Editing Notion

- Integration token in `~/.notion-covers-token` (chmod 600; integration "Encapsulate Website",
  connected at the Home parent page and /contact-us). Read it from the file; never print it. The token
  was once shown in chat — remind the user to refresh it.
- REST API, `Notion-Version: 2022-06-28`: `GET blocks/{id}/children`, `PATCH blocks/{id}/children`
  (optional `after` to insert after a block), `PATCH blocks/{id}`, `DELETE blocks/{id}`.
  Pagination via `start_cursor`. A small helper (`api`, `children`, `tree`) is quick to write.
- Live block id `block-<32 hex>` = Notion block id without dashes, so a live id maps straight to
  the API. Pages: Home `b6b487f74b484c2e97c6ab7513295c14`, Networks `adea0804…`, Governance Record
  `6915bef8…`, Blog `3c2dbe43…`, Guides `1f6e800a5138802a…`, Services and Tools `bf68edd2…`,
  Investment `d6347738…`, Brand `53c5a135…`, Security `29c24b09…`, Contact Us `a8ec9a05…`.
  Old copies of Contact Us / Brand / Security live under "Encapsulate Test Home" — not the live
  pages.
- **Write text through the API as plain `text.content`, never with the annotations read back.**
  The API returns `annotations` on every run, all defaults included; sending them back stores an
  explicit colour, and Super then wraps the run in `span.highlighted-color.color-default`, whose
  ink overrides whatever colour the page CSS gives the block. That turned /networks' testnet
  figure from pastel blue to `#111` on 2026-09-24 (14 → 20 written with the annotations copied);
  the 27 beside it, written plain, stayed pastel. Send only what differs from the default.
- **Make button callouts through the API** (`callout.rich_text` carrying the link). A callout made in
  the Notion app can render its label as a child `p.notion-text`, which the Button System does not
  match (seen on /networks: 79px/101px plain boxes).
- **A link inside the site is a Notion block link.** `https://www.notion.so/<page-id>#<block-id>`
  (both without dashes), which Super rewrites to `/<slug>#block-…`. Never invent an anchor name —
  `#rules` and the like point at nothing. Take the block's id from the API and link to that.
- Links: a page link renders as `/<page-id>` or its slug; a database link as its page path
  (e.g. `/governance-record/governance-record`); a block link `https://www.notion.so/<page>#<block>`
  should become `/#block-…` — confirm after republish.
- Super republishes on its own schedule; edits are not live immediately.

## The systems in main.css

| § | Section |
|---|---|
| 01–04 | fonts, tokens (`--color-bg-default` = #FAFAF8 ground), layout, the 4f navbar (§04 + navbar.js). The old slide-out menu section (§05) and its per-page icons were removed on 2026-09-22; under 1220px the hamburger and menu are Super's own until a mobile bar is designed |
| 06 | Type System: Notion Heading 1–4 → h1–h4, one to one (h1 clamp(40,6.2vw,92) … h4). No bold/underline on headings |
| 07 | Button System |
| 08 | databases and properties |
| 09 | Card System |
| 10–13 | pills, column dividers, **code blocks and quotes** (§12, the design's hairline box and pastel pull quote — site-wide since 2026-09-21, a page overrides only its width), link previews (on card tokens) |
| 13b | Notion forms (22a-light) |
| 14 | Page covers |
| 15b | temporary banner `.enc-banner` (markup in `head/site-body.html`) |
| 16 | Footer 44b |
| 17 | reduced motion |

**Button System (§07).** *The primary's hover steps UP* (29c, revised 2026-09-21): fill
`#99CC66` → **`#A8D67A`**, the ring stays `#7CAE48`, and the top highlight brightens from
`rgba(255,255,255,.78)` to full white, so the button reads as lit. Press still steps down
(`#7CAE48` / `#5F8A37`, inner shadow instead of the lift). The greens are tokens on `:root` —
`--btn-1-fill/ring/fill-hover/ring-hover/fill-press/ring-press/highlight/highlight-hover/press` —
and every primary hover on the site reads them, including the ones page CSS draws (the contact
band's two submits, the guide card, the post foot) and the cal.com embed's `cal-brand-emphasis`.
**The old darker pair `#8CBF56` / `#6F9E41` is retired**; if it turns up again outside `backups/`,
it is a mistake. Selection states that happen to be green (the institutional toggle, the guide
chain pills, the contact Copy button's "Copied") keep the `.78` highlight — they are not hovers.

*Disabled is a state, not a tier* (design *Button System* 29c/29d,
implemented 2026-09-21): primary takes the hairline fill `#E2E2DB` with a `#D9D9D2` ring and
`#575B55` text; secondary keeps paper with a hairline ring and grey text; tertiary greys its label
and mutes its badge to `#D9D9D2`; on ink the disabled text lifts to `#93978F`. Nothing fades —
the design holds disabled text above 4.5:1 — and the cursor is `not-allowed`. The tokens are
`--btn-1-dis-*`, `--btn-2-dis-*`, `--btn-3-dis-text`. Notion cannot mark a callout disabled, so
this is for buttons a page script builds.
 A callout is a button when
`.notion-callout > .notion-callout__content > span.notion-semantic-string > .notion-link` (span, not
`p` — text blocks share the `notion-semantic-string` class). Tier = callout colour: Gray →
secondary, Default → tertiary (label + up-right arrow badge, SVG), any other colour (green, purple…)
→ primary. Sizes via `--btn-h/--btn-px/--btn-fs` (44px; 48px where a section redefines them). Ink
sections redefine the ink tokens. Minima's `.link:hover{opacity:.7}` is cancelled.
**Button groups:** a column list containing only callouts (empty texts allowed) shrinks to its
buttons with a 12px gap; stacks under 520px. Design rule: one primary per view.

**Card System (§09).** `.notion-collection-gallery .notion-collection-card`: fill = page ground,
ring + highlight, 12px radius, hover keeps the fill (Minima's hover wash restated), press #FAFAF8.
Density from the gallery's Notion card size (small/medium/large); 6px bleed; `.no-click` has no hover.

**Page covers (§14 + covers.js).** Every inner page's first block is a callout holding, in order:
Text crumb ("Encapsulate · Networks"), Text eyebrow, Heading 1, Text lede, a button column list
(Green "Book a call" → calendar, Gray secondary → content on the page), Text foot, Text "Scroll ↓".
CSS selects `.notion-root > .notion-callout:first-child:has(> .notion-callout__content > h1)` and
places texts by `p.notion-text:nth-of-type(n)` — an empty line inside the callout shifts them.
One screen tall from where it starts (`--cover-top`, measured by covers.js because of the banner).
covers.js picks the field by path (/networks 9a, /contact-us 8a, /investments 3c,
/governance-record 2c, /brand 6a, /blog 5b, /security 7l, /guides 4h, /services 1m), copies the
design's 924×540 %-based geometry into divs, and:
- uses the cover's computed background as "paper" for knock-outs and 3px rings (the design's
  #FAFAF8 showed as pale discs on the #FFFEFC ground);
- measures the crumb and foot so each label pair sits together (`[data-enc-pairs]`) — the two rows
  shared a grid column and the shorter pair opened a gap;
- Networks glyphs are the homepage gallery's original `assets.super.so` PNGs (hardcoded list);
  the Brand mark is `svg/mark-a.svg` via jsDelivr.
Cover copy per page: `notion/page-covers.md`.

**One-screen bands snap the same way** (guides picker, the governance record's count band): one
stop rather than a deck — a gesture heading at the panel from within half a screen lands on it, a
rest within a third of a screen settles onto it, nothing snaps under 701px or with reduced motion.
The catch rule is testable in Node (`scratchpad/snaptest.js`); the automation tab fires no scroll
events.

**Network Count (/networks, network.css + network.js).** The kicker is the design's fixed bar —
**26px down, 40px in**, over both panels, taking no height. Two other constructions were tried on
2026-09-21 and both were worse: at the panels' own `--count-x` the label lands in the figure's
column and overprints it, and as a full-viewport sticky layer (the way the homepage's testimonial
label is built, home.css §09) the band clamps it and it leaves a whole screen before the last
figure. The design's bar is `position: fixed` over a snap scroller, which sticky cannot be inside a
two-screen band, so what stands in for it is the strip **plus a collision rule**: `paintKicker()`
measures every line of every panel against the 26–42 strip and marks the band `[data-enc-leaving]`
while one crosses it, or once no line is on screen at all; network.css fades the label for exactly
that window. Two traps in writing that rule — the band is a `.notion-callout` too (its own first
child is the kicker, so it was measuring the label against itself), and a panel's stack fills the
screen because its children are centred in it, so the stack's box says nothing about where the ink
is. The logic is testable in Node: `scratchpad/kickertest.js`.
  **And the bug under all of it:** `network.js` declared `var BAND` twice in the one IIFE — the
  count band at the top, the 5m marks band 140 lines down — so the second overwrote the first
  before either was used, and both the count deck and the kicker were measuring the marks band.
  The count band is `COUNT_BAND` now. A second `var` of the same name in the same scope is silent;
  when a rule that measures correctly in the console does nothing on the page, check the id. Band callout `3dce800a…8154931a…` right
after the cover: Text kicker, then a column list with one callout per panel (callout text "01 / 02",
Heading 1 figure, Text label, Text note). Two sticky full-screen ink panels in a 2-screen band, each
drawing the rail with its own pill active; fields are `svg/count-rings.svg` / `svg/count-dots.svg`
(referenced as `../svg/…` from dist, so they come from the same tag). The figures are Notion text
whose digits `network.js` `figures()` replaces with the set's own counts (see "Every network count
is the Networks set's own", under The Networks set).

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

**One ring, one job** (handoff, 2026-09-23, v259): the ring — paper `#FAFAF8`, the `#E2E2DB`
hairline, the full-white top highlight, ink type — marks the current page while the bar is at
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
  answers) is still used by `band()` to hold an open panel open. A section link is its own destination, so `CONTENT` is keyed by the whole
href — `/services#block-…` is not `/services`.

**The third column is read, not written.** The handoff's rule (Aditya, 2026-09-21): it lists the
page's own sub-pages or section headings, *taken from the page as built — nothing typed in, so it
cannot drift* — and only a page with neither carries the note. `navbar.js` `READ` has one reader
per destination; the page is fetched **once per visit, only when a pointer rests on its row**
(220ms — a sweep across the bar fetches nothing), parsed with DOMParser and kept. While it loads,
or if it yields nothing, the note stands in.

| Destination | Column | Read from |
|---|---|---|
| /networks | chains, 3 across | the Networks set, first twelve cards of the Order-sorted view, with rates |
| /services | tiles, 2 across | no fetch — the group's own section links that have a panel capture, each tile drawn at 170% from its top-left |
| Dashboards (`/services#block-…81cf…`) | list, "Live now" | the Dashboards table on /services, in Order: each row's **Menu** property ("Sui RGP dashboard"), linked to its Link. Menu was added to the table for this on 2026-09-23 |
| /governance-record | list | the four pillars' questions (`Governance Mechanism` gallery) |
| /security | list | the page's `h2` headings |
| /guides | guides | Guides database, first four: chain mark (from the set on the same page), chain, wallet |
| /blog | posts | first three cards: cover in miniature (the design's tint filter), title, first pill |
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

**The reconstruction banner is on no page now** (§15b). It was on /services alone from
2026-09-21 until that page was rebuilt on 2026-09-23. Super's Body code is site-wide and there is
no per-page Body box, so the banner is hidden by default and shown again by the class Super puts
on its own wrapper: `body:has(.super-content.page__<slug>) .enc-banner { display: flex; }` for a
page going under reconstruction. Watch the rule's own `display` — the
original `flex` sat after the `none` and kept it visible.

**Footer 44b (§16 + footer.js).** Its own top edge carries the `rgba(250,250,248,.2)` paper
hairline and **nothing sits under the disc field** — the field runs straight into the body
(handoff, 2026-09-21). The link columns are spaced by the design's 44px rows, not by a gap.
Super's footer (type Stack) is rendered into the design: menu
items named `Group: Label` become columns ("Legal" group → bottom right, no colon → "More"),
Socials → "Social" column, Footnote → bottom left. CTA copy, calendar URL and the rotating disc
glyphs are in footer.js by the user's choice; wordmark `svg/wordmark-reversed.svg`.

## The brand colour band names three sets (2026-09-21)

The handoff's 02 band is the brand pair, then **the grounds**, then the pastels — the grounds were
missing from Notion and were added: the `Colour` database (`3dee800a…de667797d25c`) gained a
**Ground** option on Set, a **Job** rich-text property and the two rows (Paper `#FAFAF8` "Every
light page and slide", Ink ground `#2A2C28` "Every dark section and slide"), and the page gained
the pair of texts that head them ("The grounds" + "Our paper is not white and our dark sections are
not black. Put the mark on these, not on #FFF or #000.").

`brand.js` builds one group per set and pairs each strip with the next two Notion paragraphs in
page order, so the heads are Notion's words and the order is Notion's. A ground swatch is the
handoff's `swatchJob`: 132px, the name and its job line at the top, the value at the foot, a
hairline outline. **Job has to be switched on in the gallery view by hand** — the API cannot change
a view; without it the cell still reads as name and value.

Every property on a Notion card carries `.notion-collection-card__property`, **the title included** —
a "the property that is not X" reader must skip `.notion-property__title` or it picks up the title.

## Homepage (home.css, home-dial.css, home.js)

home.css starts with older page CSS, then "HOMEPAGE SECTIONS": stats band/figures/deck (00–00c),
hero, Audience split 51l (07b), testimonials deck (09), Why Stake 49a, governance 37h, Services 42m
(09a), Who we are (09b), blog, networks 21b, Contact 48c (16).

home.js is a set of IIFEs: the dial (institutional form), homepage decks (snapping), networks
glyph columns, governance chain marks, blog rail (Cover glyphs via CSS mask, dots), services
selection (swaps covers to the original PNG), Why Stake graphics (derived figures), contact copy.

**Snapping — lessons.** Use native `scrollTo({behavior:"smooth"})` (scripted animation was choppy);
cache stops, invalidate on resize/mutation; trackpad momentum lasts seconds — a new gesture is a
250ms gap, or after a 450ms MIN_LOCK and decay below half peak, a rise 4× the smallest delta (≥20);
one-screen sections (Who we are, Services) are caught on the swipe within half a screen, and the
settle retries. No CSS scroll-snap on html (fights the script). Gesture logic is testable in Node
with a stubbed window.

**Notion forms (§13b)** render natively (no iframe): `div.notion-form__wrapper > form.notion-form >
div.notion-form__field.<type>`; dropdown questions still render as radios (drawn as chips);
"Invalid email" shows on empty fields (hidden while placeholder shows). The dial: a Number question
"Amount" is driven by the slider; choice questions with >6 options become a glyph listbox. React
inputs: click labels, use the native value setter + `input` event; mark with attributes
(`[data-enc-…]`), not classes — React resets className.

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

## The governance page's last two sections (2026-09-19, design *Governance Record Wow*)

**The pillars are a quadrant**: a 2×2 of pastel fields, each carrying one word at display scale
(Read. / Weigh. / Listen. / Step back.), the number in mono at the top right, the question and its
line at the foot, and an ink "then / Vote" disc at the crosshair. The word is a **Word** property on
the `Governance Mechanism` database (added 2026-09-19); **it has to be switched on in the record
page's gallery view by hand** — the API cannot change a view. Without it the field still reads
(number, question, line), so it degrades rather than breaks. `governance.js` marks each card's text
properties by view order (`data-enc-pillar="title|line|word"`) so no CSS depends on Super's property
hashes. The handoff's `auto-fit` track expression resolves its percentage against the wrong box
inside a Notion collection and gave four tracks in a row — the 2×2 is stated outright instead.

**The record is one line per ballot**: proposal, the vote as a mono capsule that inverts to ink on
hover, the date, the arrow. A hairline under each line darkens instead of the row filling green, and
the **rationale is collapsed and opens beneath the line on hover or focus** rather than always being
printed. The homepage's table got the same line treatment (2026-09-19) — its pillars band did not.

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

## The blog post page (2026-09-21, design *Blog Post Page*)

Every post is an item of the `Blogs` database (`a148eb7f…`) and Super gives it the same shape:
Super's own `.notion-header` with the title, then the article — a **two-column block** whose first
column is a Notion table of contents and whose second is the post (banner image, the byline as a
quote block, the H1, then the body) — followed by "More Blog Posts", a related collection, a
button row and the newsletter.

**The post is the column block carrying Notion's contents**, not the page's first one. The XMTP
post keeps its article at the *foot* of its page, after "More Blog Posts", so the first column
list there is a divider beside the "View More Blog Posts" button — and that button was the entire
article until 2026-09-23. Checked across all thirty-nine posts: every one is found by its contents
block, and only XMTP changes (1 block → 50). The longest column list is the fallback if a post has
no contents block.

`post.js` re-reads that into the design and writes no copy into a post:

- **The head** is ink and one screen tall (`min(92vh, 940px)`): the meta line, the title at
  `clamp(38px,5.8vw,92px)` and the lede, over the chain's mark bled off the right at 16%.
  The **lede is the post's own opening paragraph**, lifted out of the body.
- **The body** is `236px | 720px`, centred: the reading rail — progress (one anchor 40% down the
  viewport drives both the percentage and the current section), the contents built from the post's
  own `h2`s, and the standing ask — beside the article.
- **The byline** is the post's "Written by …" block, and the **next post** comes from the index.
- Super's header, the Notion contents block, "More Blog Posts" and its collection are marked
  `data-enc-source` and hidden; the newsletter stays.
- **No image is hidden.** post.js used to hide a post's first `.notion-image` as "the banner",
  which cost the Gno.land post its first figure (reported 2026-09-23). Checked through the API
  that day: **none of the forty posts opens with an image** — the banner blocks went when the head
  became the title — and the 114 images left are the bodies' own. A page that still shows a banner
  is one Super has not republished.

**The tag, the date and the mark are database properties, and Super does not render them on an
item page.** They are read from `/blog`, which does render them on its cards — one fetch, cached,
and the page still builds without it. The same fetch gives the next post.

**Every word is in Notion.** The page's own copy — the rail's ask, the foot's three variants, the
labels — is a **"Post page copy" toggle on the /blog page**, as `key · value` lines; post.js reads
them from the index it already fetches, so forty posts share one source, and blog.js marks the
toggle so blog.css can hide it on the index. `{chain}` and `{ticker}` in those lines are filled
from the post's own row. `post.js`'s `CONTENT` is only the fallback if that toggle goes missing.

**The Blogs database carries the page's facts**: `Lede` (the head's two lines — a post's own
opening is the fallback, cut to the same length), `Chain`, `Ticker`, `Mainnet` (Live / Not yet
launched — which picks the foot's ask) and `Author` (the byline). All are read off the index's
cards, so **they must be shown on the /blog gallery view**; blog.css hides Super's card content, so
the index looks unchanged.

**The post's own duplicate title and its "Written by" block were removed from all forty posts**
(2026-09-21): the head is the title now, so the title comes from the header Super always renders,
and the byline is drawn from `Author`. The read time is derived at 230 words a minute, as the
handoff insists — stating it is what let it claim six minutes for a one-minute post.

**The index is fetched once and parsed once, but the post is looked up on every build.** Caching
the lookup gave every post the first one's mark, lede and next, because index → post is a
client-side navigation and the script stays alive across it.

## Where each asset comes from — repo vs Notion (settled 2026-09-16)

**Repo + jsDelivr — anything that is part of the design.** Referenced from the built CSS as
`../svg/name.svg` or `../img/name.png`, which resolves next to `dist/` on the same tag, so a drawing
can never drift from the CSS that positions it.

| Asset | Files |
|---|---|
| Section fields and drawings | `svg/stat-field-*.svg`, `svg/circle-online.svg`, `svg/fork-arcs-*.svg`, `svg/5k-fan-and-rings.svg`, `svg/5o-twin-fans.svg`, `svg/9c-inverted-horizons.svg`, `svg/rail-dots.svg`, `svg/team-crew.svg` |
| Cover fields (/networks count) | `svg/count-rings.svg`, `svg/count-dots.svg` |
| Brand | `svg/wordmark-reversed.svg` (footer), `svg/mark-a.svg` (/brand cover) |
| Navbar captures | `img/nav-covers/` (the nine page covers) and `img/nav-panels/` (the four tools and the institutional dial), the design's own files |

**Notion — anything that is content.** None of it is in the repo; Super stores and serves it.

| Asset | Where it lives | Who reads it |
|---|---|---|
| Network glyphs | the **Cover** files property on each row of the **Networks set** database `3dde800a…33b7f1…` (47 deployment rows, glyphs uploaded through the API 2026-09-16; the old "Networks" database is still on the page until it is deleted) | Super draws the gallery cards; `home.js` (glyph columns, staking listbox) and `covers.js` (/networks cover) read those cards off the page and take the original `assets.super.so` URL back out of Super's `/_next/image` link |
| Services, team, testimonial and blog covers | the same kind of Notion property | Super, plus `home.js` for the services swap |
| Every word on the site | Notion blocks | — |

The Notion API can now upload files (`POST /v1/file_uploads` → send the bytes → attach by
`file_upload` id), so a glyph can be replaced end to end from here; external URLs still work too.

**The exception:** `footer.js` holds 10 hardcoded `assets.super.so` glyph URLs (re-pointed at the
Networks set uploads on 2026-09-16), because the footer runs on pages with no networks gallery to read. Replace one of those Covers in Notion and the footer
keeps showing the old file until the list is updated.

**DigitalOcean is no longer used by the CSS** (was
`multimedias.nyc3.cdn.digitaloceanspaces.com/validator-website/…`) — not one reference is left; the
two dead homepage background rules went with it on 2026-09-16. Keep large content images off jsDelivr: it is
free for personal and commercial use with no bandwidth cap (20MB per file, 50MB per package), but it
is a package CDN and sustained media traffic invites a fair-use review.

## /services (2026-09-23, design *Services Categories Chosen*)

Everything under the cover was deleted on 2026-09-23 (the old column lists: Governance Alerting,
Network Visualization, Celestia Node Health Checker and PFB Submit UI, Faucet Bot, Aptos Validator
Geographical Distribution, Super Sui, Protocol Level Dashboard, Custom Discord Bots, their images
and "Contact Us" buttons, and the Playbooks heading and paragraph). The page is now, in Notion
order: the cover, then six **band callouts** — each a Heading 2, texts and button callouts — with
an **inline database after four of them**, then a **"Services page copy" toggle**:

| Band callout | What it holds | Database after it |
|---|---|---|
| Dashboards `3e4e800a…81cf…` | H2, line | `Dashboards` — Name, Address, Status, Description, Link, **Capture** (the 1400×788 @2x shot), Order |
| Playbooks `3e4e800a…8171…` | H2, line, then the seven steps as **Heading 3 + text** pairs | — |
| Repositories `3e4e800a…81f4…` | the mono label, the paragraph, "All repositories on GitHub" | `Playbooks` — Name, Repository, Visibility (Public/Private), Description, Link (public only), **Glyph**, Order |
| Bots `3e4e800a…8159…` | H2, line, "Chain", "Discord", "Add one to your server" | `Bot events` — Name (the pill), Event, **Earlier** (two log lines, one per line), Headline, Detail, Glyph, Order |
| Monitoring `3e4e800a…8115…` | H2, line, the sentence with `___` for the hole, the resting line, two buttons | `Monitoring builds` — Name (the word), Repository, Description, Link, Order |
| Ask `3e4e800a…8156…` | H2, lead, "Your chain", Book a call, All networks | — |

`services.js` (site head) finds each band **by id**, reads the table after it **by header
labels**, and sorts by **Order** — Super serves the rows newest first. The tables are API-made
table views with every property shown, so nothing has to be switched on; **a table turned into a
gallery would stop being read**. Each built band is inserted right after its callout and the
callout is folded to no height (`[data-enc-anchor]`), not hidden, so `/services#block-<callout>` —
the navbar's section links and the cover's "See services" — still lands on the band.

- **Numbers** 01–04 are derived from the order of the headed bands; the repositories' big count is
  the row count. The ask's lead starts with the number of chains in the set, spelled; the script
  rewrites that first word from the set, so the Notion line reads right on its own ("Thirty-six").
- **The ask's tiles are a linked view of the Networks set** placed anywhere on the page (the user
  adds it — the API cannot create a linked view). It is found by content: the collection whose
  rows carry a tier. One tile per chain name, sorted by Order, sized by Tier (god 3, high and
  medium 2, low and filth 1). Without it the "Your chain" card stands alone with the link under it.
- **The packing is the design's exact-rectangle algorithm**, which it checked for 8–30 columns. A
  window past ~1800px lands on counts with no exact fit, so `pack()` retries one column fewer
  until one packs — tested for every width 300–2600 in Node.
- **Deviations, on purpose:** no `ch` caps on body or lead text (the ask's lead gets half the row);
  the display sentence and the ask heading keep the design's 16ch as **10.56em** (Outfit 600's
  `0` is 0.66em); under reduced motion the dashboards still follow the scroll, only without the
  zoom (the design pinned the last board, which left the pills dead).
- **The Bots band's link is "Contact us for a bot" → /contact-us** (the user's wording, 2026-09-23);
  the design's "Add one to your server" pointed nowhere.
- **Gno.land is Order 33** in the Networks set (Pell 34, Spicenet 35), with no Tier, so it is a
  1×1 tile. The ask's tiles read a **gallery** view of the set on /services, sorted by Order, whose
  cards show Tier and Order.
- **Kept as drawn:** the tertiary link sits 6px above a primary beside it (the design's tertiary
  carries `alignSelf: flex-start` inside a centred row), and "See it land" shows the previous
  event's card dimmed while the new one flies — on the first press that is the third event.
- **The three Captures are the design's own frames** (`exports/dashboards/dash-*.png` from
  Claude Design, 2800×1576, sent 2026-09-23): the dashboards redrawn in the brand with a browser
  bar carrying the address and LIVE. They replaced the raw headless shots of the live sites
  (`img/shots/dash-sui.png`, `dash-solana.png`), which stay in the repo as records; Aptos could not
  be shot headless at all — its map is WebGL and renders black.

## /investments (2026-09-21, design *Investments Page*)

Two full-bleed bands after the cover, built by `investments.js` from Notion:

- **01, on ink**: the kicker, "We invest in the chains we operate." at clamp(38,5.6vw,84), the lede,
  then the positions as a band of pastel discs that runs (30s, `enc-inv-run`) and **pauses on the
  mark under the pointer**; the line beneath prints that position — name, `category · since YEAR`,
  and the Validator pill's own words beside a dot that is green when we run one.
- **02, on paper**: the six questions as a segmented control, one answer at a time with the verdict
  as a disc (green Yes / ink No), and the ask at the foot with Book a call and **Send the spec**,
  which links to the contact page's form block (`/contact-us#block-3dee800a5138808c8e81d333a9bb7195`).

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

## The chain pages (2026-09-24, design *Chain Page Combined*)

Every **mainnet** row of the Networks set is a Notion page, and since 2026-09-24 each has a path
of its own in Super: **Pages → /networks → /mainnet → /&lt;chain&gt;** (avalanche, lido-dvt, monad,
near, sui, axelar, eigencloud, iota, mina, starknet, terra, zilliqa, avail, espresso, ika, supra,
vara, agoric, althea, gitopia, gravity-bridge, humans, ixo, lumera, passage, sommelier,
chain4energy), each pointing at the row's share URL. `/<row id>` 307-redirects there. Added from
the automation tab (the user asked); the Super editor loads slowly (15–45 s) and coordinate clicks
stop landing after the window changes — what worked was JavaScript: expand the rows by clicking
their `.lucide-chevron-right`, `.click()` the last "Add sub-page", focus each input and type with
real keys, `.click()` "Create page". **Giving the rows paths changed Super's markup:** a set card
is now `id="block-networks-mainnet-<chain>"` with a `.notion-collection-card__anchor` link, not
`block-<row id>` with `.no-click` — anything that reads a card's row id must accept either.

**Where everything comes from** (nothing is typed in chain.js):

| What | Where |
|---|---|
| The figures (rate, commission, unbonding, slashing events), the address, explorer, glyph, token, since, compounding, validators run | the row's **properties** — Super renders none of them on the row's page but embeds all of them in its data (`self.__next_f.push` scripts: `propertySort` names them, `propertyValues` holds them, beside `"blockId"`). chain.js decodes that; after a client-side navigation it fetches the page once |
| The line under the name, the buttons, "What we run" (a two-column table), the five questions (Heading 3 + paragraph) | the **row page's own blocks**, written by `scripts/chain_pages.py` from `notion/chain-pages.json` |
| The words every chain page shares (band names, figure labels, captions, the estimate's lines) | the **"Chain page copy" toggle on /networks** (`3e5e800a…81d484b8…`), hidden there by chain.css |
| A chain's own words where the shared ones are untrue (Lido's fee, Avalanche's staking period, Mina's and Zilliqa's reward lines) and the Lido validators band | the row page's own **"Chain page copy" toggle**, which overrides the shared one key by key |
| The other chains (the drifting pills) and each page's tint | the set's view on **/services** (it shows Tier, Stage and Order): god, high and medium tiers, Order-sorted; the tint is the chain's position in that order, the same pastel as its /networks card |

**Page id.** Super names the page after its path (`main#page-networks-mainnet-monad`, class
`parent-page__networks-mainnet`), so chain.js finds the row id in the page's data by `"uri"`.
Only a page under /networks/mainnet or a bare row id is looked at, so other pages cost nothing.

**Decisions made against the file** (all reported to the user, 2026-09-24):
- The rate is **after our commission** (the row's Reward rate, as researched), so the caption says
  "After our commission" where the design says "Before", and the estimate does not take the
  commission off again. The estimate is `stake × rate` per year for every chain — the rates are
  measured yields, so compounding them again would overstate.
- The slashing caption is "No slash since we joined. A slash would break this line" (the design's
  "Signed every day since launch" is not true everywhere — Avalanche's node missed three months),
  and a chain that cannot slash says so ("{chain} does not slash stake. The line cannot break").
- The Lido band sits **after the hero** (the file shows it first, above its own note).
- A chain whose other ways to stake are listed nowhere gets **one button** (Monad, Avalanche,
  Agoric, Espresso, ixo, Supra, EigenCloud).
- The address ring repeats a short address more than twice so it is not stretched thin; a value
  that is not an address (Lido's "Simple DVT node operator #43") is not a copy button.
- "Since" is the **current** validator's start (Axelar, Agoric, ixo and Sui ran older validators).
- Avalanche's calendar draws the shortest period (2 weeks); a year would be 53 rows.

**The research** (six agents, 2026-09-24) is in `notion/chain-pages.json` per chain: cadence,
minimums, downtime rules read from each chain's own params, unbonding, wallet deep links (loaded
where possible), sources and notes. Explorer links for Passage and Sommelier (Mintscan dropped
them) now point at REStake; Chain4Energy at explorer.stavr.tech.

## The guide page (2026-09-22, design *Staking Guide Variation 1d*)

One step per screen. An ink head with the chain's disc and the wallet's mark, the Title and the
Lede; a paper band per step carrying the number, the surface as a link, the title, the body, the
"Watch out" note and the capture, with the step's numeral hollow at the bottom right and its green
fill rising with the reader's progress; an ink close with the next guide.

**Every word is Notion's**, in three places:

| What | Where |
|---|---|
| A step: its capture and its words | **one row of the guide's own slide database** — `Name` ("01 · Unlock Keplr"), `Step`, `Body`, `Watch`, `Surface`, `Link`, and the capture as the row's `Cover`. Everything about a step is one record (asked for 2026-09-22; the copy was briefly in toggles on the page and that is gone) |
| The head's Title and Lede | **properties of the `Guides Database` row** (added 2026-09-22) — Super does not render a row's properties on its own page, so they are read off /guides, as post.js reads the blog index |
| The crumb, "Watch out", "{N} screens", the close band, the Discord line | the **"Guide page copy" toggle on /guides**, `key · value` lines — one place for 33 guides. `{n}` is the step count, `{N}` the same spelled ("Eight screens"), `{next}` and `{chain}` the next guide |

**Each guide's slide view must show Step, Body, Watch, Surface and Link** — the API cannot switch
a view's properties on, and it is one view per guide. A guide whose slides carry none of them is
left exactly as it was, so the set can be converted one guide at a time.

`guide.js` reads the deck and nothing else: it is **the collection whose cards are not links**
(the other one is "View More Guides"), a row without a `Step` is skipped (the cover slide), the
**longer of the two text properties is the body** and the other is the note — position would break
on a step with no note, and Super's property hashes differ from one guide's database to the next.
A mark is the `data-full-size` on the Networks set's and the Wallet Set's own cards on /guides,
never a guide card, or "Axelar" answers with the guide's cover instead of the chain's glyph.

**The close band carries a way out** (handoff, 2026-09-23): "Need help? Ask on Discord" on its own
line under the two buttons, so it is not weighed against them — its words and its URL are two more
lines of the copy toggle (`help`, `help url`). The **capture frame is 4px on paper with a 1px ink
border** — the selected-state hairline, because on this page the capture is the one thing to look
at; it was 12px on ink with a `#D9D9D2` ring until that pass.

**The frame follows the capture**: a wallet shot is tall (360:788) and stands beside the note; a
dashboard shot is wide (16:9) and runs under the header. `guide.js` reads the file's own
proportions on load and sets `[data-enc-shot]`. The band is one grid, so opening a note never
squeezes the capture. Sizes and how the captures are taken: `notion/guide-screenshots.md`.

**Axelar is nine steps, not eight.** The handoff writes eight; the guide's own slides number nine
(its second file carries steps 1–3 in one frame, and the last is the dashboard confirmation), so
"Check us before you pick" is split into *Find us in the list* and *Check our numbers*. The row's
`Step` is what the picker and the head count, so it follows the slides.

**Three traps paid for.** The deck was found by "the cards that are not links" until `Link` was
switched on — Super renders a card with a url property as an anchor, so both collections became
links and the page fell back to raw Notion; it is found by **numbered titles** now. The body and
the note were told apart by length, which swapped them on every step whose note was the longer
line; they are read **in the view's order** (Body, then Watch — Super drops an empty property, so
a step with no note simply has one text), and a text repeating the step's title is skipped, which
is a `Title` property left on beside `Name` (the slide database had one; it was deleted). And the
build has to claim the page
(`[data-enc-guide]`) **before** the index fetch — the observer fires again while it is in flight
and two builds appended two sets of bands.

Snapping is the design's, moved to the document: Super is the scroller, so
`scroll-snap-type: y mandatory` is set on `html` for this page and every band is a stop, the
footer included, off under 701px and with reduced motion.

**The page opened at its foot** until 2026-09-23: ten screens are inserted above the reader on
build, and Chrome's scroll anchoring answered by holding what they were looking at — the footer —
in place. `overflow-anchor: none` for the page, and guide.js restores the top when the build
started there (a `#block-…` link is left alone).

## The guides picker (/guides, guides.css + guides.js, 2026-09-16)

Design *Guides Set* 6d "One question at a time": the band asks "I want to stake &lt;chain&gt; with
&lt;wallet&gt;." and finishes the sentence as the reader picks. It reads three galleries Super already
renders on the page — the Guides Database, the **Networks set** and the **Wallet Set** — and writes
no copy of its own.

**A linked view is not the database.** Add a linked view of a database to a page and Super renders it
under the *view's* own block id; the source database's id is nowhere in the page, and the source
block can still exist as a plain page link with no rows in it. A view can also be a **table** rather
than a gallery. So `guides.js` finds its two sources by content: of every `.notion-collection` other
than the guides one, the chains are whichever overlaps most with the guide rows' own names, the other
is the wallets; items are gallery cards **or** `tbody tr`, both carrying the title and the glyph. It
marks what it used with `data-enc-source`, which is how the CSS hides them (ids alone did not).

**The Guides gallery view must show Networks set, Wallet Set, Step and Time** — the picker reads the
wallet, the step count and the minutes off the rendered card. They are hidden on the card by CSS.
Notion's API cannot switch view properties on; that is a manual step.

**The picker is its own screen** (design *Guides Picker*, 2026-09-16): the band is one viewport tall
on the #F2F2ED ground, padded `clamp(112px,20vh,200px) clamp(28px,7vw,110px) 96px`, with a bar across
its top carrying the crumb and a counter — both Notion texts (the last two paragraphs in the callout);
only the counter's two numbers are rewritten by the script, from the chains that have a guide and the
guides it matched. A second IIFE in `guides.js` snaps to it with the Network Count gesture rules but a
single stop: a gesture heading at the panel from within half a screen lands on it, a rest within a
third of a screen settles onto it, nothing under 701px or with reduced motion. The catch rule is
testable in Node (`scratchpad/snaptest.js`) — the automation tab fires no scroll events.

**Centre marks the design's way.** Every glyph is `left/top: 50%` + `translate(-50%, -50%)` at 116%
of its disc, so the overflow is clipped evenly. Centred as a grid item instead, the overflow fell to
one side and every mark sat 2.6px low (the user spotted it). Chain disc 24px, answer-card wallet
badge 38px around a 30px mark, answer field 520×272 (1.91:1, the blog covers' ratio).

**Step and Time came from the guides themselves** (2026-09-16): each guide's final slide, taken in
**gallery order** — not filename order — and the step badge read off the rendered image. Largest is
18 steps → 9 minutes, every other Time proportional. Guides for chains that are not in the Networks
set are `Network = Rough` (Stargaze, UX, Quicksilver, OmniFlix, Namada, Juno), which drops them from
the Mainnet view; MELLOW stays Mainnet and so is not reachable from the picker until Mellow is a row
in the Networks set.

## Search and sort on a Notion gallery — the working recipe (2026-09-16)

Super has no search snippet and Notion has no input or menu block, so a gallery's search field and
sort menu are ours to build. This is the shape that worked on /networks (network.js `controls()` /
`applyControls()`, network.css "THE CONTROL BAR"). Reuse it for any other database; only the block
id and the property class change.

**1. Put the controls OUTSIDE Super's markup.** Two earlier attempts failed:
- inside `.notion-dropdown__option-list` (the picker's menu) — the picker's own handlers run first
  and swallow the click, so the field never focused and the menu never opened;
- inside `.notion-collection__header-wrapper` — still Super's element, same result.
What works: append them to the `.notion-collection`, give it `position: relative`, and lay the
controls over the right-hand end of the header row (`position: absolute; top: 0; right: 10px;
height: 50px`), with `padding-right` on the header so the tabs cannot run under them.

**2. Never stopPropagation in the CAPTURE phase on the wrapper.** It looks like a way to keep
Super's handlers out; it actually stops the event before it reaches your own button and input.
This cost an hour. If Super must be kept out, do it on the element itself in the bubble phase.

**3. Focus and open on `pointerdown`, not on the default action.** Super listens on the document to
close its dropdown and cancels pointer events; a cancelled pointerdown focuses nothing. So:
`field.addEventListener("pointerdown", () => setTimeout(() => input.focus(), 0))`, and open the menu
on `pointerdown` with `preventDefault()`. Menu options too.

**4. `hidden` loses to any class-level `display`.** Super renders a card as `display: flex` and the
menu got `display: flex` from our own CSS, so both stayed visible. Always pair it:
`.card[hidden], .menu[hidden] { display: none !important; }`.

**5. Filter and sort the rendered cards, nothing else.**
- search: read `.notion-property__title`, set `card.hidden`;
- sort: set `card.style.order` on the visible ones, and park the hidden ones at a high order so they
  leave no gaps; remember each card's original index on first run for "Default";
- rate-style sorts: parse the property's text (`parseFloat` after stripping `%`), nulls last;
- re-apply on the MutationObserver that already watches for Super's re-renders.

**6. What cannot be done this way.** Counts per tab from the page itself (Super only ships the
active view's rows — the site's counts are read from /services's all-stages view instead, see The
Networks set), and searching rows Super did not render (a view limited to N cards).

**7. Testing.** The automation browser delivers no real mouse clicks and freezes transitions, so
click-to-focus cannot be verified there — drive it with `input.focus()` plus a native value setter
and an `input` event, and ask the user to confirm the click itself.

## Page scripts belong in the SITE head (measured 2026-09-16)

Super is a single-page app. On a client-side navigation it **does inject the destination page's
stylesheets** but **does not execute that page's `<script>`** — so arriving at the homepage from
another page left every JS-built section unbuilt (the blog rail showed as the raw Notion gallery,
the glyph columns and Why Stake figures were missing, snapping was dead), while the CSS looked
right, which is what made it confusing.

`home.js` and `network.js` are therefore loaded from `head/site.html`, not from their page's head.
Every IIFE in both files already runs off a MutationObserver, so when Super swaps the page in they
build by themselves — verified live: loading home.js on /networks and then clicking Home gave the
rail (3 cards), the network columns and the figures. Page CSS stays in the page head.

A new page script must follow the same rule: site head, and driven by an observer rather than by
load order.

## Things that bite in Super / Notion markup

- **A link gets ONE rule under it.** Notion draws its own `text-decoration: underline`, so any rule
  that gives a link a `border-bottom` must also set `text-decoration: none !important` in the same
  block, or the link shows two lines. This has been reported three times (the contact band's
  "Open it in a new tab", "Cancel this booking", the meeting link) — check it whenever a link is
  styled, on every page.
- **Do not make two links out of one fact.** A value and the line under it are not both links: the
  label stays plain text and the line under it carries the link.

- **Minima `!important`s:** `.notion-semantic-string .link:hover{opacity:.7}`,
  `.notion-collection-card:hover{background:…}`, `h3{font-size:var(--h3-size)!important}`.
- **Old page Code-panel rules use `#id … !important`** — nothing in a stylesheet beats them; they
  must be deleted (this is why the covers looked broken until the panels were cleaned).
- **Clipping:** `.notion-property` has `overflow:hidden`, a 4px gap and min-height 24px; card
  content is overflow hidden — descenders, figures and badges get cut; set `overflow: visible`.
- **A descender can also be cut by the element that paints over it.** In a sticky pile each
  pinned card shows only the offset the next one sticks at; anything below that line is covered
  by the next card's own ground. /security's failover steps: the title's ink ends 122px in, and
  the design's 112 offset painted over the tail of a g. Measure the ink (`Range.getClientRects()`
  on the last text node) and give the offset ten pixels of clearance — the pile steps 132.
- **A descender is cut whenever a tight `line-height` meets that clipping** (the g in "Weigh.",
  the y in "Aditya" — reported more than once). A line-height under 1 makes the line box shorter
  than the glyphs, and `.notion-property` and `.notion-collection-card__content` clip to it. The
  fix is `overflow: visible !important` on **both** the property and the card's content box —
  never a bigger line-height, which changes the design. Check it on every display-scale word set
  on a property (the pillars' Word, card titles, the figures).
- **Covers on cards:** Super writes `object-fit/object-position` inline (only `!important` wins)
  and floors height with `min-height`.
- **Image optimizer:** covers come via `/_next/image?url=…&w=…&q=75` (WebP, only q75 allowed) and
  look soft; the original is on `assets.super.so` — swap to it when sharpness matters.
- **Column lists are flex rows** with inline widths; Super writes inline widths on `th`.
- **Grid gotchas seen:** `display:grid` overrides un-hid a table's limited rows (restate the
  limit); `1fr` rows inflate tall media (use ratio-based sizes).
- **Global classes are global** (`.notion-callout`, `.notion-pill`, `.notion-property`,
  `.notion-collection-card`, `.notion-column`) — page CSS files are full of such rules; scope new
  work to a block id or a structural `:has()`.
- **Block ids** are stable until a block is recreated (API-recreated buttons get new ids). Prefer
  `:has(a[href$="/slug"])` over `:nth-child()` for database items.
- **Specificity inside a file:** a `> *` reset can beat section margins; select through the
  content wrapper. Load order between Head links and inline styles was measured as irrelevant for
  the homepage (2026-09-14); page Heads now also carry repo CSS — if a rule seems to depend on
  order, measure.

## Verifying in the automation browser

- The automation tab is hidden: no rAF, no smooth scroll, **no scroll events at all** (a scripted
  `scrollTo` fires none, so scroll handlers cannot be exercised there — test their logic in Node or
  by calling the effect directly), transitions freeze
  (finish with `document.getAnimations()`), screenshots often time out — measure with
  `getBoundingClientRect`/computed styles instead, and use real hovers via the computer tool.
- Long checks across pages: load each page in a hidden 1920×992 iframe, one batch at a time, and
  store results on `window` — a single call over nine pages times out.
- To preview a page without its Code panel CSS, set that `<style>`'s `media="not all"`.
- The site is the source of truth: check what the browser actually has (served tag, matching
  rules) before assuming a file is deployed.

## The Networks set (2026-09-16)

`Networks set` (`3dde800a…33b7f1…`) replaces the old `Networks` database: **one row per deployment**,
28 mainnet + 19 testnet, from design *Networks Set*. Properties: Name, Stage, Reward rate, Role,
Status, Tier, Order, Cover (glyph, uploaded via the file-upload API), Link. Two gallery views,
Mainnet and Testnet, sorted by Order — so the first twelve cards are the god and high tiers.

- **5g, "the mark bleeding"** (network.css "NETWORKS SET", redrawn 2026-09-21): a 168px card on
  the second paper `#F2F2ED`, the Cover's span turned into a **176px** pastel disc pushed past the
  **top-right** corner (right −44, top −52) with the glyph at 50% and nudged `translate(-12%, 14%)`,
  and **the chain's name again at 96px running off the bottom-right** — one copy stroked 2.2px
  `#9B9B94`, a second filled in the card's ground over it, so only the outline shows. Hover darkens
  the ring to `#B9B9B1`, deepens the disc to the pastel's deeper tone (`--set-deep`:
  `#B4D98F #E8CB72 #A3C3EC #EDB98A #E9A9C2`) and fills the hollow word `#9B9B94`. CSS cannot repeat
  a text node, so `network.js` `hollow()` copies the rendered title into the two spans **on the
  observer** — Super rebuilds every card when the picker swaps Mainnet for Testnet. The disc rules
  select `> span`, and the hollow is a direct span child too, so every one of them is written
  `> span:not(.enc-set__hollow)` — without that the name takes the disc's box (all `!important`)
  and lands in the top-right corner. The grid is `repeat(auto-fill, minmax(262px, 1fr))`,
  not the handoff's four fixed columns: the card is built for the 276px the handoff gives it, and
  four columns across this 1728px page made it 420 wide. That was tried on the live page at the
  user's request (v218) and reverted the same day (v219) — settled, do not offer it again. Mainnet cards
  carry the rate (`.property-597e3d69`) as a 22px figure; testnet cards carry the role
  (`.property-585f6e6c`) and drop the disc to 62%. The hover arrow badge only appears on cards that
  are links. **Not possible:** the handoff's per-tab counts and its live-on-both / not-launched
  sub-groups — Super ships only the active view's rows, so the other stage cannot be known.
- **The control bar** is the **second paper `#F2F2ED`** on a `#D9D9D2` ring with the full-white
  inset highlight, 50px overall (the tabs are 48 inside its hairlines) — a recessed track, not a
  panel the colour of the page; it was `#FAFAF8` until the handoff moved it on 2026-09-21. The
  active tab is ink with a 2px ink underline, the rest `#575B55`. Super's view picker supplies
  the stage tabs (styled in network.css; the old
  pill-and-Verdana picker rules were deleted). The **sort menu and the search field are built by
  network.js** — Notion has no block that is an input or a menu, so this is the allowed exception.
  Both work on the cards Super rendered: search hides non-matching cards, sort sets the grid's
  `order`, Default restores the view's sequence. The design's per-tab counts are not there: Super
  only sends the active view's rows, so the other tab's count cannot be known client-side.
- **5m, the chain-teams band** (callout `3dde800a…9995f7…`): ink, full-bleed, with the marks row
  built by `network.js` from the set's own gallery — first twelve cards. The "+23 more" is a Notion
  text block in the band that the script moves onto the row; its number is rewritten from the set
  (chains − marks shown), as is the heading's "Thirty-five teams said yes.".
- **Every network count is the Networks set's own** (the user, 2026-09-24: one source). Super ships
  only the rendered view's rows, so no page can count the whole set from itself — except /services,
  whose linked view of the set shows every stage with **Stage switched on** (the user did that on
  2026-09-24). `navbar.js` `counts()` fetches /services once per visit (kept 30 minutes in
  `sessionStorage["enc-counts"]`), counts the cards whose Stage pill reads Mainnet or Testnet, and
  the distinct names, and publishes `window.encCounts()` → `{mainnet, testnet, chains}`. Readers:

  | Where | What | Script |
  |---|---|---|
  | navbar, Networks group | "27 mainnets, 20 testnets" (item line and preview), "See all 27" | navbar.js `applyCounts()` |
  | /networks count band | the two figures (27, 20) | network.js `figures()` |
  | /networks 5m band | "Thirty-five teams said yes.", "+23 more" | network.js `figures()` |
  | homepage stats band | "Number of Networks Supported" (27) | home.js, Why Stake IIFE |
  | homepage Why Stake | "27 secured" and the dots | home.js — falls back to the homepage gallery's cards |
  | /services ask | "Thirty-five chain teams…" | services.js — counts its own view of the set |

  Only the digits (or the leading spelled number) are replaced, so the words stay Notion's. **The
  numbers typed in Notion, and CONTENT/FOOT in navbar.js, are the fallback** — keep them right when
  the set changes, since they are what shows if /services cannot be read or before it arrives. If
  the view on /services loses its Stage property, every count falls back.
- **The old `Networks` database is not to be used for anything** (the user, 2026-09-24) — not for
  values, not for chain pages. Its item pages (/networks/mainnet/<chain>) carry stale "Expected
  Reward Rate" lists.
- **Every script now prefers this database:** `covers.js` reads it by id, `home.js` uses it when a
  view of it is on the homepage (old gallery is the fallback), `network.js` builds 5m from it.
- **Staking values (2026-09-24):** the 28 mainnet rows carry Address, Reward rate (real, **after
  our commission**, as text), Rate updated, Commission (percent), Compounding (Auto/Manual),
  Unbonding (words), Chain slashes (principal can be taken), Slashing events (applied, any validator
  of ours on the chain) and Explorer — every value read from the chains, with method and sources in
  `notion/networks-set-values.md`. They are **not shown on the Mainnet view** yet; a chain page will
  read them off /networks (the Mainnet tab ships all 28 rows), so they must be switched on there and
  hidden on the cards by network.css (v262: every card property but the title, the rate and the
  role is `display: none`, and a card counts as testnet only when it shows nothing but its name).
  Testnet rows stay empty.
- **Slashing events count only our own incidents on a live validator** (the user's rule,
  2026-09-24): network-wide incidents and old validators we shut down deliberately do not count.
  So the old jailed Gitopia and ixo validators' 0.01% slashes are 0. Gravity Bridge is **0 by the
  user's decision** (2026-09-24), though the chain records three 0.1% slashes on our live validator
  (the bridge module's missed-confirmation penalty) that could not be dated or shown network-wide.
  Agoric lists the "Encapsulate" validator, not the "fka KingSuper" one.
- **Both views must be sorted by Order ascending** — without a sort Notion returns rows in reverse
  creation order, which puts the smallest chains first and gives 5m the wrong twelve marks.
- The old gallery's CSS (pill, pastel tiles, side image; 456 lines) was removed on 2026-09-16: every
  rule used global collection classes and reached the new cards.

## The governance record — how it is filled (2026-09-17)

The record is a Notion database, `Governance Record` `c458e5dd…`, read by the homepage's 37h table
and by /governance-record. Two jobs keep it current, both in `scripts/` and both re-runnable:

| Script | What it does |
|---|---|
| `scripts/notion.py` | the shared client. Token from `NOTION_TOKEN`, else `~/.notion-covers-token`. Never print it |
| `scripts/gov_rationales.py` | writes **Rationale** on every row |
| `scripts/gov_upgrades.py` | adds the upgrades on the god and high tier chains that asked something of the validator |
| `scripts/gov_proposals.py` | turns those rows into improvement proposals (ACP/NEP/MIP/ELIP), and retitles the rest |

**Rationales.** A rationale that already says something specific is kept and tightened — the
lead-ins ("Encapsulate votes YES because…", "We're in favour of…") dropped, cut to two sentences —
unless dropping the lead-in would leave the proposal's own title standing as the reason, in which
case the original wording stays. Boilerplate ("We support this proposal.", "Malicious Proposal.")
and empty ones are written from the vote and the proposal's type: upgrades, parameter changes,
spends, contract work, IBC repairs, signalling, and the scam airdrops that are vetoed. The wording
is picked by a hash of the row id, so a row always gets the same line and a re-run is a no-op.
The lines are **principle-based**: accurate about the vote and the kind of proposal, never claiming
a specific action we cannot evidence. 2026-09-17: 1,106 rows — 465 tightened, 641 written.

**Upgrades.** What counts is the user's rule: a proposal or release that required a **vote** or a
**software upgrade by the validator**. Weekly maintenance releases, rc/alpha builds and
testnet-only tags are left out. Every source is a public GitHub releases API and needs no key:

| Chain | Repo | What marks a row |
|---|---|---|
| Avalanche | `ava-labs/avalanchego` | notes say "must upgrade"; the named upgrade (Helicon, Granite, Fortuna) is in them |
| Near | `near/nearcore` | "protocol version N", and the date voting opens — NEAR counts a validator's vote only if it already runs the code |
| Sui | `MystenLabs/sui` | `mainnet-*` with "Protocol Version: N"; two thirds of the stake vote the version in |
| IOTA | `iotaledger/iota` | `[Mainnet]` releases, same shape |
| Zilliqa | `Zilliqa/zq2` | notes contain a hard fork |
| Mina | `MinaProtocol/mina` | mainnet hard-fork and stop-slot releases |
| Starknet | `NethermindEth/juno` | breaking releases of the client we attest with |
| EigenCloud | `Layr-Labs/eigenlayer-contracts` | the named protocol releases |
| Monad | `category-labs/monad-bft` | consensus client releases |

**The date is the release's own date**, or the day voting opens where the notes give it — never
today's. On a chain with no on-chain vote the row is YES because running the release is how support
is expressed, and the rationale says so. Rows are matched by (Chain, Proposal Title), so re-running
adds only what is missing. `--dry` prints without writing. A row may still predate our deployment
on that chain — the script cannot know, so check new rows before publishing.

**Proposals, not releases (2026-09-17).** The record is a record of *votes*, so a row has to read
as the proposal it is. `scripts/gov_proposals.py` rewrote what `gov_upgrades.py` had written:

| Chain | Where the reference comes from |
|---|---|
| Avalanche | the release note lists the ACPs the upgrade activates → one row per ACP, titled from the ACP's own README (`avalanche-foundation/ACPs`) |
| Near | nearcore notes link the NEPs a protocol version stabilises (`near/NEPs`) |
| Mina | the Mesa hard fork carries MIP-0006…0009 (`MinaProtocol/MIPs`) |
| EigenCloud | each core release implements named ELIPs (`eigenfoundation/ELIPs`) |
| Sui, IOTA, Zilliqa, Starknet, Monad | no proposal document — the vote is the protocol-version vote itself, or running the fork build. The reference stays empty and the row is titled as the protocol change, never as a release tag |

`Proposal Id` is **rich text** now (it holds "ACP-176"), which makes the id, the proof and the
rationale all `td.text`. Both tables therefore tag their cells from the **header labels**
(`governance.js` `columns()`, `home.js` `mark()`) and order on `[data-enc-cell]` — Notion's type
classes and `nth-of-type` cannot tell those three columns apart.

## TODO — run both governance jobs from a GitHub Action (agreed 2026-09-17, not built)

Both scripts above are written to be run unattended; nothing about them needs a browser. The shape:

- a scheduled workflow in this repo (weekly is enough for upgrades; rationales only need running
  after rows are added), `python3 scripts/gov_upgrades.py` then `python3 scripts/gov_rationales.py`;
- `NOTION_TOKEN` as a repo secret — the integration already has access to the database. `GITHUB_TOKEN`
  is read if present, only to raise the GitHub API rate limit;
- run `--dry` on a pull request and the real write on the schedule, so a human sees what a new
  release would add before it lands on a public page;
- the same Action is the natural home for the APY job below — one scheduled job that writes Notion,
  rather than two.

## Done — the Networks set's rates are real (2026-09-24)

The design's invented rates were replaced on 2026-09-24 with rates read from each chain (after our
commission, dated in **Rate updated**) for the 28 mainnet rows. Mina, EigenCloud and SSV.network
are blank on purpose — see `notion/networks-set-values.md`. They drift: refresh them by hand or
with the Action below, always with the date.

## TODO — a GitHub Action to fill the APY property (agreed 2026-09-16, not built)

APY values in the Networks database are **updated by hand for now**. When it is worth automating,
the shape is a scheduled Action in this repo — not client-side fetching, which would mean CORS, a
flash of empty values and a key in the page.

- **Cosmos chains are free and verified working:** `https://chains.cosmos.directory/<chain>` returns
  `params.calculated_apr` (Agoric read 7.05% on 2026-09-16) and answers with
  `access-control-allow-origin: https://encapsulate.xyz`. Covers Agoric, Althea, Gravity Bridge,
  Passage, Sommelier, Terra, Lumera, Gitopia, Chain4Energy and others — about a third of the set.
- **Everything else is one API per chain** (Sui, NEAR, Monad, Avalanche, Starknet, Mina, IOTA,
  Zilliqa, Axelar, Supra, Vara…), with different maths and no shared format. Aggregators that cover
  them all are paid and key-based, so the key would have to be a repo secret — another reason the
  job runs in CI rather than the browser.
- **The job writes to Notion** through the integration (the API can set a property), so the site
  keeps rendering an ordinary property and any value can still be overridden by hand. Add a
  `Last updated` property so the page can say when, and have the job skip rows marked manual.
- Publish network APR, not the delegator's figure, unless commission is subtracted — and date it.

## TODO — the Networks set's open values (2026-09-24)

- **Mina reward rate:** blank on purpose (our pool is too small for a steady rate); decide later.
- **Mina fee:** Auro's list says 5%; /networks/mainnet/mina (an existing chain page, from the old
  Networks database, whose "Expected Reward Rate" list is stale) names no fee. Confirm.
- **Lido and SSV.network are one row, "Lido DVT"** (the user, 2026-09-24): the same 500 validators,
  Lido's Simple DVT module on an SSV cluster. The Lido row was renamed and carries Lido's values;
  the SSV.network row was archived (Notion trash, restorable). A new **Stake at** URL property holds
  `https://stake.lido.fi` for it — the chain page's action goes there instead of an address to copy
  (blank on every other row). **Validators run** (number, 500, from Lido's Simple DVT module:
  operator #43 "Lido x SSV: Arid Anubis", 500 deposited, 0 exited) is set on that row only; the
  30-day performance is not stored — uptime is shown nowhere else on the site. **Lido's 10% is the
  whole fee a staker pays, and ours is inside it**: the StakingRouter gives the Simple DVT module 8%
  and Lido's treasury 2%; the module's share for our cluster goes to a 0xSplits wallet
  (`0xcddc0b19…a187`) that returns 2/7 to Lido's Agent (`0x3e40D73E…9C8c`) and shares 5/7 equally
  among the seven operators, 10.2% of it each — about 0.82% of the rewards our validators earn.
  Operator #48 "Lido x SSV: Mysterious Manta" (160 keys, all exited) was also ours, shut down on
  purpose (the user, 2026-09-24), so it counts toward nothing.
  The mainnet count went 28 → 27 everywhere: the homepage's "Number of
  Networks Supported", /networks's "Networks secured", navbar.js ("27 mainnets", "See all 27"), and
  /services's "Thirty-five chain teams" (35 distinct chains).

## TODO — the newsletter (removed 2026-09-21, to be rebuilt)

"Subscribe to newsletter" and its form were removed from the blog index and from all forty posts
at the user's request: they are not in the *Blog Post Page* design and the embedded form was the
old Tally one. When it comes back it should be a Notion form (main.css §13b renders those
natively) in one place, not a block copied into every post.

## A page that ends in a band runs into the footer

Super pads the article and the main below the content. Where the last thing on a page is a
full-bleed band, that padding reads as a strip of ground above the ink footer, so the page zeroes
it: `/guides`, `/security`, `/investments`, and since 2026-09-21 `/networks`, `/brand` and
`/contact-us` (`.super-content.page__<slug>` and its `.notion-root`). A page that ends in ordinary
content keeps the padding — it is breathing space, and on the paper ground it reads as such.

## TODO — the Services tiles come from the menu, not the page (agreed 2026-09-22)

**Half done (2026-09-23):** /services now has the Dashboards table (name, address, link,
capture), so "Dashboards" can carry the design's "Live now" list read from it; the other three
tiles still come from the menu.


The navbar's third column for "Services and tooling" is the only one not read from its page: the
four tool tiles are the Services group's own section links (`navbar.js` `build()`, `tools`),
because the built /services page has no database of tools to read — only eight old `h2` sections.
When /services is redesigned, give it a tools gallery (name, link, capture) and read that block by
id in `READ["/services"]`, the way every other row is read, so the column cannot drift from the
page. The four `img/nav-panels` captures would then come from that gallery too.

## TODO — a design file for code blocks (agreed 2026-09-21)

§12's code block and quote came from `Blog Post Page.dc.html`, which defines them inline for its
article; there is no "Code blocks" handoff of its own. What is live is that file verbatim — the
second paper, a hairline ring, 4px, JetBrains Mono 13.5/1.7, the caption as a mono line under the
block — with two things I decided rather than read: the copy control (built from §07's secondary
tokens at its smallest) and the site-wide quote size, `clamp(22px, 2.4vw, 32px)` against the
post's larger `clamp(25px, 2.9vw, 38px)`.

The user is sending a handoff. When it arrives it should settle: the caption, the copy control,
**inline `code` spans** (untouched so far), long-line overflow, and a code block on an ink band.
It goes straight into §12 — main.css is the site head, so every page follows at once.

## Open items

- /services, /investments, /brand, /blog, /guides were still served with site Head v55 at the last
  check (needs Super republish); /networks needs `head/networks.html` (network.css v54).
- Homepage "View Voting History" and "View All" are purple (primary) beside a primary "Book a call";
  the design wants Default (tertiary). Offered, not done.
- Each page CSS file still has old `#block-… strong {Arial Black …}` title rules and old sub-heading
  rules; dead once titles are un-bolded — optional tidy-up (remind the user).
- Page CSS overriding the Card System: contact-us.css (black ring + hard shadow), guides.css
  (padding 0, image-only tiles), investments.css (radius), governance.css (old pastel cards).
- **Governance properties renamed (2026-09-17, done):** Chain → **Network**, Proposal Title →
  **Proposal**, Proposal Id → **Reference**, Vote Option → **Our vote**, Voted On → **Voted on**,
  Voting Proof → **Proof** (Rationale kept). The header labels are what `governance.js` and
  `home.js` read to tag cells, so both maps accept the old and the new names. `scripts/gov_*.py`
  use the new names.
- Notion content still owed: 3 more networks (to 28), "Six years" → "Since 2020", Why Stake card
  preview None. Stat card says 28 networks, the fork panel 38.
- Cover second buttons link to database pages (e.g. `/a148eb7f…`); switch to same-page anchors if
  the user prefers.
- Networks cover glyph URLs are hardcoded in covers.js; could read the /networks gallery instead.
- Mobile layout of the covers (field below the text under 800px) is not verified.
- Refresh the Notion integration token.
- Search and sort controls for a gallery are possible but unbuilt: Super ships no search snippet
  (its "dynamic database filters" are roadmap), so an input plus reordering of the rendered cards
  would be ours. Sorting alone can be done with extra Notion views and the view picker.
- The booking drawer is designed in `demo/booking-compare.html` but **not** on the site — the user is
  sending a drawer design first. Every "Book a call" opens https://cal.com/aditya-encapsulate/30min
  in a new tab meanwhile.
