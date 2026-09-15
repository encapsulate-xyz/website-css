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
| `network.css` | /networks | its page Head |
| `governance.css`, `blog.css`, `brand.css`, `contact-us.css`, `guides.css`, `investments.css`, `security.css`, `services.css` | each page's CSS, moved out of Super's page Code panels on 2026-09-15 (old cover rules removed, the rest kept as it was) | each page's Head |
| `svg/` | SVG sources (DigitalOcean CDN, or served from jsDelivr like `svg/wordmark-reversed.svg`, `svg/mark-a.svg`) | — |
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
| `head/home.html` | Homepage → Code → Head |
| `head/networks.html` | /networks → Code → Head (view-picker + network.css) |
| `head/governance.html` | /governance-record → Code → Head |
| `head/blog.html` | /blog → Code → Head |
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

- The automation tab is hidden: no rAF, no smooth scroll, no scroll events, transitions freeze
  (finish with `document.getAnimations()`), screenshots often time out — measure with
  `getBoundingClientRect`/computed styles instead, and use real hovers via the computer tool.
- Long checks across pages: load each page in a hidden 1920×992 iframe, one batch at a time, and
  store results on `window` — a single call over nine pages times out.
- To preview a page without its Code panel CSS, set that `<style>`'s `media="not all"`.
- The site is the source of truth: check what the browser actually has (served tag, matching
  rules) before assuming a file is deployed.

## Open items

- /services, /investments, /brand, /blog, /guides were still served with site Head v55 at the last
  check (needs Super republish); /networks needs `head/networks.html` (network.css v54).
- Homepage "View Voting History" and "View All" are purple (primary) beside a primary "Book a call";
  the design wants Default (tertiary). Offered, not done.
- Each page CSS file still has old `#block-… strong {Arial Black …}` title rules and old sub-heading
  rules; dead once titles are un-bolded — optional tidy-up (remind the user).
- Page CSS overriding the Card System: contact-us.css (black ring + hard shadow), guides.css
  (padding 0, image-only tiles), investments.css (radius), governance.css (old pastel cards).
- Notion content still owed: 3 more networks (to 28), "Six years" → "Since 2020", Why Stake card
  preview None, governance column renames (Network / Proposal / Our vote). Stat card says 28
  networks, the fork panel 38.
- Cover second buttons link to database pages (e.g. `/a148eb7f…`); switch to same-page anchors if
  the user prefers.
- Networks cover glyph URLs are hardcoded in covers.js; could read the /networks gallery instead.
- Mobile layout of the covers (field below the text under 800px) is not verified.
- Refresh the Notion integration token.
