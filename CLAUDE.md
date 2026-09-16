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
   files that changed.

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
| `footer.js` | footer 44b, built inside Super's footer | site Head |
| `covers.js` | inner-page cover graphics ("fields") | site Head |
| `home.css`, `home-dial.css`, `home.js` | homepage sections, JS-enhanced styles, homepage scripts | homepage Head |
| `blog.css`, `blog.js` | /blog — the index (design J); blog.js builds each card's cover and its band span, and is loaded from the site head | page Head + site Head |
| `network.css`, `network.js` | /networks (network.js pages the Network Count panels, same gesture rules as home.js decks) | its page Head |
| `governance.css`, `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/`, `img/` | every drawing and icon the CSS references, served from jsDelivr beside the CSS | referenced as `../svg/…` / `../img/…` from `dist/` |
| `notion/page-covers.md` | cover copy for the nine inner pages | — |
| `build.py` | strips comments into `dist/`, copies the JS | — |

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
4. Bump only the `head/*.html` files whose dist files changed; tell the user in a table.

Note: `git commit` also commits anything the user has staged — check `git status` first.

### Head files — what the user pastes

| File | Paste into (replace everything) |
|---|---|
| `head/site.html` | Super → Settings → Code → Head (minima, main.css, footer.js, covers.js, fonts) |
| `head/site-body.html` | Super → Settings → Code → Body (temporary "under reconstruction" banner) |
| `head/home.html` | Homepage → Code → Head (CSS only — home.js is in the site head) |
| `head/networks.html` | /networks → Code → Head (view-picker + network.css; network.js is in the site head) |
| `head/governance.html` | /governance-record → Code → Head |
| `head/blog.html` | /blog → Code → Head (blog.css; blog.js is in the site head) |
| `head/brand.html` | /brand → Code → Head (includes the Comfortaa font link) |
| `head/contact-us.html` | /contact-us → Code → Head |
| `head/guides.html` | /guides → Code → Head (view-picker + guides.css) |
| `head/investments.html` | /investments → Code → Head |
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
| 10–13 | pills, column dividers, code blocks, link previews (on card tokens) |
| 13b | Notion forms (22a-light) |
| 14 | Page covers |
| 15b | temporary banner `.enc-banner` (markup in `head/site-body.html`) |
| 16 | Footer 44b |
| 17 | reduced motion |

**Button System (§07).** A callout is a button when
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

**Network Count (/networks, network.css + network.js).** Band callout `3dce800a…8154931a…` right
after the cover: Text kicker, then a column list with one callout per panel (callout text "01 / 02",
Heading 1 figure, Text label, Text note). Two sticky full-screen ink panels in a 2-screen band, each
drawing the rail with its own pill active; fields are `svg/count-rings.svg` / `svg/count-dots.svg`
(referenced as `../svg/…` from dist, so they come from the same tag). The figures are Notion text.

**Footer 44b (§16 + footer.js).** Super's footer (type Stack) is rendered into the design: menu
items named `Group: Label` become columns ("Legal" group → bottom right, no colon → "More"),
Socials → "Social" column, Footnote → bottom left. CTA copy, calendar URL and the rotating disc
glyphs are in footer.js by the user's choice; wordmark `svg/wordmark-reversed.svg`.

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

- **Minima `!important`s:** `.notion-semantic-string .link:hover{opacity:.7}`,
  `.notion-collection-card:hover{background:…}`, `h3{font-size:var(--h3-size)!important}`.
- **Old page Code-panel rules use `#id … !important`** — nothing in a stylesheet beats them; they
  must be deleted (this is why the covers looked broken until the panels were cleaned).
- **Clipping:** `.notion-property` has `overflow:hidden`, a 4px gap and min-height 24px; card
  content is overflow hidden — descenders, figures and badges get cut; set `overflow: visible`.
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

- **5g, the cards** (network.css "NETWORKS SET"): 128px card, the Cover's span turned into a 96px
  pastel well pushed 26px past the bottom-right corner, glyph at 52%. Mainnet cards carry the rate
  (`.property-597e3d69`) as a 22px figure; testnet cards carry the role (`.property-585f6e6c`) and
  drop the disc to 62%. The hover arrow badge only appears on cards that are links.
- **The control bar**: Super's view picker supplies the stage tabs (styled in network.css; the old
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

## Open items

- /services, /investments, /brand, /blog, /guides were still served with site Head v55 at the last
  check (needs Super republish); /networks needs `head/networks.html` (network.css v54).
- Homepage "View Voting History" and "View All" are purple (primary) beside a primary "Book a call";
  the design wants Default (tertiary). Offered, not done.
- Each page CSS file still has old `#block-… strong {Arial Black …}` title rules and old sub-heading
  rules; dead once titles are un-bolded — optional tidy-up (remind the user).
- Page CSS overriding the Card System: contact-us.css (black ring + hard shadow), guides.css
  (padding 0, image-only tiles), investments.css (radius), governance.css (old pastel cards).
- **TODO — rename the Notion properties the governance design asks for (2026-09-17).** The homepage
  table prints the database's own property names, so the header still reads *Proposal Id / Chain /
  Vote Option* where design *Governance* 37h says **Network / Proposal / Our vote**. Renaming the
  properties on the governance database is the whole fix (no CSS) — it also changes them on
  /governance-record, which is why it has not been done unasked. In the same pass: the four pillar
  titles want sentence case ("Understand the proposal"), but that gallery is a **linked view whose
  source database the integration cannot reach** ("does not contain any data sources accessible by
  this API bot"), so either connect "Encapsulate Website" to it or rename the four rows by hand.
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
