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
| `network.css`, `network.js` | /networks (network.js pages the Network Count panels, same gesture rules as home.js decks) | its page Head |
| `investments.css`, `investments.js` | /investments — two bands (design *Investments Page*): the thesis and the running band of positions on ink, the six questions on paper | page Head + site Head |
| `governance.css` + `governance.js` (the record page: count band, pillars, controls, rows), `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/`, `img/` | every drawing and icon the CSS references, served from jsDelivr beside the CSS | referenced as `../svg/…` / `../img/…` from `dist/` |
| `notion/page-covers.md` | cover copy for the nine inner pages | — |
| `notion/guide-screenshots.md` | how guide screenshots are captured and composed (agreed 2026-09-18, not yet applied) | — |
| `build.py` | strips comments into `dist/`, copies the JS | — |
| `scripts/paste_table.py` | prints the paste table from head/*.html vs what the live pages serve | — |

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
  Daughter, Manrope 700 (menu). Arial Black, Georgia, Verdana, Monaco are system fonts.
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
| 01–05 | fonts, tokens (`--color-bg-default` = #FFFEFC ground), layout, navbar, slide-out menu |
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
(referenced as `../svg/…` from dist, so they come from the same tag). The figures are Notion text.

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

Because the bar lies over the page, **the cover's content starts 96px down** (§14 adds the bar's
64 to its own top padding) and a page that opens on ink — a blog post, `parent-page__blog` —
takes the bar's on-ink variants until a menu opens: labels `#C9C9C4`, the pill group on the .06
wash, and Super's logo inverted to paper.

Two traps: **Super's own rules carry two classes** (`.super-navbar.simple`), so every rule that
fights one is anchored on `.super-root`; and **Super slides its dropdown viewport under the
trigger with an inline transform**, which 4f's full-width panel cancels (`transform: none`).
**The panel's preview is the page's own cover, captured**: the design's nine `cover-thumbs`, now in
`img/nav-covers/` beside the CSS so a capture cannot drift from the page it shows, drawn
`left center / cover` in a 16/10 box as the file draws them. navbar.js keys them by href and marks
the tile `[data-enc-shot]`; without one, the tile is the design's ink fallback carrying the page's
name. **minima frosts the navbar** (`backdrop-filter: blur(12px)` plus a white wash) — 4f's bar is
plain glass, so both are cancelled, or whatever the bar lies over is smeared.

**The reconstruction banner is on /services only** (§15b, 2026-09-21). Super's Body code is
site-wide and there is no per-page Body box, so the banner is hidden by default and shown again by
the class Super puts on its own wrapper: `body:has(.super-content.page__services) .enc-banner`.
Add a page to that selector as it goes under reconstruction. Watch the rule's own `display` — the
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

`post.js` re-reads that into the design and writes no copy into a post:

- **The head** is ink and one screen tall (`min(92vh, 940px)`): the meta line, the title at
  `clamp(38px,5.8vw,92px)` and the lede, over the chain's mark bled off the right at 16%.
  The **lede is the post's own opening paragraph**, lifted out of the body.
- **The body** is `236px | 720px`, centred: the reading rail — progress (one anchor 40% down the
  viewport drives both the percentage and the current section), the contents built from the post's
  own `h2`s, and the standing ask — beside the article.
- **The byline** is the post's "Written by …" block, and the **next post** comes from the index.
- Super's header, the banner image, the Notion contents block, "More Blog Posts" and its
  collection are marked `data-enc-source` and hidden; the newsletter stays.

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
| Slide-out menu icons | `img/nav-*.png` — 8 icons, resized to 144px from the 500px originals (they render at 48px) |

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

**6. What cannot be done this way.** Counts per tab (Super only ships the active view's rows — the
same reason the marks row's "+23 more" is a Notion text block), and searching rows Super did not
render (a view limited to N cards).

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
  text block in the band that the script moves onto the row, for the same reason.
- **Every script now prefers this database:** `covers.js` reads it by id, `home.js` uses it when a
  view of it is on the homepage (old gallery is the fallback), `network.js` builds 5m from it.
- **The rates are the design's invented figures** — its own note says so. See the TODO below.
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

## TODO — the rates in the Networks set are placeholders (2026-09-16)

Every "Reward rate" in the `Networks set` database came from the design file, whose own note says
the figures are invented to populate the column and exercise the sort. They must be replaced with
published rates before the page is public — the plan is to fetch them and write them into Notion
(same job as the Action below), not to type them.

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
