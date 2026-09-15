# website-css

Custom CSS for the Super.so site at https://encapsulate.xyz.

- `main.css` — site-level CSS. Pasted into **Super → Settings → Code → Custom CSS**. Applies to every page. Site-wide rules only — no `#block-…` ids.
- `home.css` — page-level CSS for the homepage. Pasted into the homepage's own **Code** panel (CSS).
- `home.js` + `home-dial.css` — homepage script for the institutional staking dial, and the styles
  that only apply once it runs.

Everything is served from GitHub — see "Serving from GitHub" below.
- `network.css` — page-level CSS for `/networks`. Pasted into that page's own **Code** panel.
- `svg/` — source SVGs uploaded to the DigitalOcean CDN and referenced by URL from the CSS.

## Back up before every change

**Before editing any `.css` file, copy it into `backups/` first, then make the change.**

```bash
cp main.css backups/main.css.bak-$(date +%Y%m%d-%H%M%S)
```

Same for `home.css` and `network.css`. One backup per editing session is enough — no need to re-copy between
consecutive edits to the same file in the same turn.

Backups live in `backups/`, which is gitignored. Keep them out of the project root — they were
piling up there and made it hard to see the four files that actually matter.

Why this matters here: both files are large and hand-tuned, and work has already been lost several
times this way. Backups in `/tmp` are not good enough — they are session-scoped and vanish. Keep
them in the working tree where they survive.

When reverting, say which backup is being restored and what will be lost.

Delete old ones when a change is confirmed good — `backups/` grows fast (25 copies, 2.1MB, in one
working session).

## Serving from GitHub (since 2026-09-14)

Repo: **github.com/encapsulate-xyz/website-css** (public — jsDelivr only serves public repos).
Super loads the built files from jsDelivr instead of having them pasted, so Super's Custom CSS size
limit no longer applies.

```bash
python3 build.py          # writes dist/: main.css, home.css, network.css, home-dial.css, home.js
```

**Edit the source files, run the build, commit source and `dist/` together.** Never edit `dist/`.

### Head files — what to paste into Super

`head/` holds the exact, complete contents of each Super Head box, pinned to the current release.
The user copies from these files. On a new tag, **bump only the head files whose dist files
actually changed** since the tag they point at (`git diff vOLD vNEW -- dist/<file>`), in the same commit:

| File | Paste into (replace everything) |
|---|---|
| `head/site.html` | Super → Settings → Code → Head |
| `head/home.html` | Homepage → Code → Head |
| `head/networks.html` | /networks → Code → Head |
| `head/site-body.html` | Super → Settings → Code → **Body** (the temporary "under reconstruction" banner; delete it there to remove the banner) |

Every other page's Head should contain no `website-css` line (main.css already comes from the site Head).

### The tags in Super

Pin every URL to a release tag, never `@main` — jsDelivr caches branch URLs for up to 12 hours, so
a fix on `main` would not reach the site. `vN` below is the current release.

| Super → Code → Head of… | Tags |
|---|---|
| **Site settings** (every page) | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/main.css">` |
| **Homepage** | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/home.css">`<br>`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/home-dial.css">`<br>`<script src="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/home.js" defer></script>` |
| **/networks** | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/network.css">` |

The fonts `<link>` stays in the site Head as before. Once the tags are in, the pasted CSS in the
Custom CSS boxes (site and page) must be **emptied**, or old and new rules both apply.

### Site Head — what each line is for (audited 2026-09-14)

```html
<link rel="stylesheet" href="https://sites.super.so/builder/themes/minima/minima.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/encapsulate-xyz/website-css@vN/dist/main.css">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Hanken+Grotesk:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Architects+Daughter&family=Manrope:wght@700&display=swap" rel="stylesheet">
```

- **minima.min.css is required.** Super does not load its theme itself on this site — this line is
  the only place it comes from. Disabling it on the homepage changed 18,038 elements (base font
  size 16→14px, text colour, letter-spacing, paddings, borders).
- **Fonts actually rendered** (checked on /, /networks, /team, /blog, /governance): Inter (served
  by Super from /fonts, not Google), Outfit, Hanken Grotesk, JetBrains Mono, Architects Daughter;
  Manrope 700 in the slide-out menu (main.css §05, loads only when the menu opens). Arial Black,
  Georgia, Verdana and Monaco are system fonts.
- **Removed as unused:** Allerta Stencil, Comfortaa, Give You Glory, Gloria Hallelujah, Indie
  Flower, Archivo Black, the Google Inter link, and duplicate Outfit links. The gtag block was
  commented out (analytics is off).
- **Archivo — resolved, not loaded.** main.css §06 used to ask for `"Archivo"` on every
  `h1.notion-heading`, but Archivo was never loaded, so headings rendered in the fallback
  `sans-serif`. That look was kept (2026-09-14): the rule now says `sans-serif`, and the unused
  `"Archivo"` fallbacks were dropped from home.css and network.css. Do not add an Archivo link —
  it would visibly change every heading.

### Releasing a change

1. Back up, edit, `python3 build.py`, verify on the live page (inject the built file).
2. Commit source + `dist/`, push.
3. `git tag -a vN+1 -m "…" && git push origin vN+1`.
4. In Super, change `@vN` to `@vN+1` in the tags that use a changed file. Only those tags need it.

### Load order — verified, not assumed

Custom Head code lands after Super's own stylesheets but before the page's inline styles. Moving
main.css and home.css from pasted `<style>` blocks to `<link>`s in the Head was checked on the
live homepage by comparing ~45 computed properties (plus `::before`/`::after`) on all ~18,000
elements: inline as before, linked main-then-home, and linked home-then-main all computed
**identically**. The rules are specific enough that their order no longer decides anything. If a
future rule relies on order, re-run that comparison.

### Size limit (historical)

Super's Custom CSS box rejected a 106KB paste and accepted 55.7KB; that is why build.py strips
comments and whitespace. With the files served from GitHub this only matters if something is ever
pasted again.

## Open items

- **Buttons follow the Button System (main.css §07, 2026-09-14).** Tier = the callout's colour in
  Notion: Gray → secondary, Default (no colour) → tertiary (label + arrow badge), any other colour
  → primary. The label sets the width; 44px default, 48px hero (home.css redefines `--btn-*` on
  the hero column list); dark sections redefine the ink tokens (home.css does Who we are). Content
  still to recolour in Notion to match the system's "one primary per view": the three "View All"
  buttons and "View Voting History" → Default (tertiary); the eleven purple buttons on /services
  are all primary.
- **TODO (remind the user): delete the old page-title rules from Super's page Code panels.** Each of
  /services, /team, /contact-us, /blog, /investments, /governance-record and /guides has a
  `#block-<title id> strong { … font-family: Arial Black … }` rule in its own Code panel (not in
  this repo). It is dead once the page titles are un-bolded in Notion, so deleting it is optional
  tidy-up. Found 2026-09-14.
- **Cards follow the Card System (main.css §09, 2026-09-14).** Density = the gallery's Card size in
  Notion (small → compact, medium → default, large → roomy); `.no-click` cards take no hover. Homepage
  (home.css): Why stake are bleed cards, governance steps are the pastel variant, testimonials and
  networks opt out. **Page Code panels outside this repo still override it:** /contact-us (black ring +
  8px hard shadow), /guides (padding 0, image-only tiles), /investments (20px radius),
  /governance-record (old 8px pastel cards). Move or delete those when tidying the panels.
- **Both hero buttons point at `/networks`,** including "Book a Call". Content fix, in Notion.
- **Stat card says 28 networks; the fork panel says 38.** One of them is wrong.
- **Who We Are, "And others." card.** In Notion as the fourth, last card. Its cover is
  `06-and-others-on-paper.png`; the section is dark, so the design's `06-and-others-on-ink.png` is the
  right export. Any last card that is fourth or later is drawn without the tinted circle, so if a
  fourth real person is added with no crew card, that rule needs revisiting.

## What lives where — main.css vs home.css (moved 2026-09-14)

**Rule:** `main.css` holds only what every page shares. Anything that targets a `#block-…` id
belongs in that page's own CSS — for the homepage, `home.css`. Every block id that was in main.css
existed only on the homepage (checked against the rendered HTML of `/`, `/networks`, `/team`,
`/contact`, `/governance`, `/blog`, matching `id="block-…"` — Super inlines site CSS into every
page, so a plain text search finds every id everywhere).

**Built sizes after the move:** `dist/main.css` 11.0KB (was 65.4KB; 17.8KB once the form styles
were added), `dist/home.css` 60.2KB (was 10.7KB). **home.css at 60KB is larger than anything pasted into Super before** (largest accepted:
55.7KB, rejected: 106KB). If the homepage Code panel rejects it, shorten the long repeated
selectors in the moved sections (the block ids dominate the byte count) or ask Super what the
page-level limit is.

### main.css — site-wide

| § | Section |
|---|---|
| 01 | Fonts |
| 02 | Design tokens |
| 03 | General page layout |
| 04 | Navigation bar |
| 05 | Navbar menu (slide-out) |
| 06 | Headings — the Type System: Notion Heading 1–4 → h1–h4, one to one. Bold/underline play no part; keep them off headings in Notion |
| 07 | Callouts as buttons — primary / secondary (gray) |
| 08 | Databases and properties |
| 09 | Cards — the Card System: ring + highlight, 12px, states, density from Notion card size, 6px bleed |
| 10 | Pills |
| 11 | Column dividers |
| 12 | Code blocks |
| 13 | Link previews |
| 13b | Notion forms — every form on the site (22a-light) |
| 16 | Footer |
| 17 | Reduced motion |

### home.css — homepage

Older page CSS, top of the file, unchanged: screen responsiveness, horizontal lines around
"Earn Rewards…" (`0dea66c8…`), table-to-cards (`4529386b…`), network/governance table limits,
governance table, code font for numbers, hides other pages, **voting mechanism / governance cards
(`3b970793…`)**, hide proposal titles, contact us (`5b2c372a…`), pillar images, body background,
full-page content, Wistia video (`1ee04e9f…`).

Then, under "HOMEPAGE SECTIONS — MOVED FROM main.css", flat CSS in this order: stats band / figures
/ deck (00–00c), hero line, audience fork (07b), testimonials deck, Why Stake cards + governance
2×2, Who We Are (09b, with scroll snap), blog gallery (14), networks gallery (15).

### How the move was done

- **Replaced, not merged.** Where home.css already styled a block the moved section redesigned, the
  old home.css rules were deleted: hero line, Team, testimonials, networks gallery, blog. The newer
  (main.css) version won outright.
- **Deleted as dead** — nothing on the site matches them: `eb15a093…` (old "Earn Rewards" heading,
  in both files), `8cd1bdc3…`, `23ee800a…` (announcement banner),
  `#block-test-home-new-why-stake-with-kingsuper` (not a real block id).
- **Not an overlap after all:** governance. home.css styles the cards (badge numbers, colours,
  layout); main.css only set the 2×2 column count and touched none of those properties. Both kept.
- **Blog limit stated once.** The old blog rules hid cards twice (n+4 and nested n+3) and main.css
  un-hid the third. With the old rules gone, §14 now hides `n+4` itself and the "reveal the third
  post" rule is gone.
- **Carried over deliberately** (the comparison below showed these old declarations were still
  visible, so each is restated once in its new section, marked CARRIED OVER): hero line
  `margin-bottom: 0`; 40px `padding-bottom` under each testimonial quote; plain 14px black network
  pills; blog `.date` pinned bottom-right at 18px and 12px blog pills.

**Verified** on the live homepage by swapping the old and new CSS into the page's own style
elements and comparing ~100 computed properties (plus `::before`/`::after`) on all ~18,000
elements, at 1920×936 and 390×844. After the carry-overs, no element changes size, position,
colour, type or visibility at either width. The only remaining differences are inert:
`flex-direction`/`padding` on testimonial and team cards that are `display: grid`/`contents`, and
the Team quote's old `::after`, which was already `display: none`.

## Notion forms — rendered natively, styled site-wide (main.css §13b, 2026-09-14)

Super's docs describe forms only as an embed, but **Super renders a Notion form into the page with
its own classes** (no iframe), so CSS styles all of it. Every form on the site is styled by
`main.css` §13b ("22a-light" from design file *Institutional Form*), scoped to
`.notion-form__wrapper`, not a block id. A form that should differ gets an id-scoped override in
its page's CSS. First instance: the homepage's Institutional Staking form,
`#block-3dbe800a513880af9fe0c4bc175e1975`.

```
div.notion-form__wrapper.as-embed                  ← the block (#block-…)
  div.notion-header.form                           ← §03 hides .notion-header site-wide; §13b re-shows it
    div.notion-header__cover.no-cover.no-icon.form-cover
    div.notion-header__content.max-width.form-content.as-embed
      div.notion-header__title-wrapper > h1.notion-header__title
      div.notion-header__description.form-description
  form.notion-form.has-header.as-embed             no action attribute — Super's JS submits
    div.notion-form__field.<type>                  type: title | email | multi_select | text
      h2.notion-form__field-title                  label
        span.notion-form__field-title-required     "*" (gets .error too)
      input.notion-form__input-field               title, email
      textarea.notion-form__input-field.long-answer   long text
      p.notion-form__field-error                   e.g. "Invalid email" — shown even when empty
      div.notion-form__select-options              choice questions
        div.notion-form__checkbox-wrapper[role=button]   Super sets width:100%
          label.notion-form__checkbox-label
            div.notion-form__checkbox-input-wrapper
              input.notion-form__checkbox-input[type=radio]
              div.notion-form__checkbox.radio      drawn indicator
            div.notion-form__checkbox-text         option label
    div.notion-button.notion-form__submit-button
      button.notion-button__content.color-default > span  "Submit"
```

- **Dropdowns are ignored.** A choice question set to "Dropdown" in Notion still renders as a radio
  list (15 radios for the network question). A real dropdown needs JS, so §13b draws the options
  as chips, picked state via `:has(input:checked)`. The radio stays in place, invisible, over the
  chip, so clicks and keyboard still work.
- **"Invalid email"** is printed under an empty email field; §13b hides it while the field shows
  its placeholder.
- **The dial (homepage, `home.js` + `home-dial.css`, design 22a "The dial").** A hard left/right
  split: ink half with the label, $ figure, $200k line and $50k–$25M slider; paper half with the
  controls. On a form with a Number question labelled **Amount**, the script builds the dial and
  writes the slider value into the hidden Amount question. Choice questions with more than 6
  options (Network) become a listbox whose options show each chain's glyph in a pastel well — the
  glyph is the cover of that chain's card in the homepage networks gallery, so there is no image
  list to maintain; shorter ones (Duration) stay Super's radios, drawn as pill buttons. The button
  reads "Send this". The form is marked `[data-enc-dial]` (attributes, not classes — React resets
  className on re-render), and every dial style is scoped to that, so without JS the §13b look
  remains. React inputs: never set `.checked`/`.value` directly — click labels, and use the
  native value setter plus an `input` event. A MutationObserver re-applies it when Super
  re-renders.
- **The form's content in Notion** (Forms page): title "Institutional staking", description "Set
  what you are planning to stake, tell us where, and we will come back with terms for that size.",
  questions Network (single choice: the God/High/Medium-tier mainnets + Other), Duration (3–6
  months, 6–12 months, 1–2 years, Over 2 years), Email, Amount (Number, filled by the dial). All
  required.
- **Not yet verified:** that a submission reaches the Notion database, and field types not used yet
  (date, number, file, checkbox, URL, phone). Inspect when one is added.
- Block `c79faa64…` on the homepage is the old Tally form (`.super-embed` iframe) — not stylable,
  and due to be removed now the Notion form replaces it.

## Homepage decks — JS snapping (home.js, since v7; confirmed working on a trackpad at v10)

The stats band, testimonials and Who we are keep their CSS geometry (sticky one-viewport panels,
home.css 00c / 09 / 09b); the second half of `home.js` only decides where scrolling stops. Inside a
deck one wheel/trackpad gesture = one panel; keys, scrollbar and touch settle on the next stop when
they come to rest; within a third of a screen of a stop outside a deck, the page settles onto it.
It also drives the testimonial rail's active row (`[data-enc-deck]`, `tr[data-enc-active]`, styles
in home-dial.css). Lessons, each learned the hard way:

- **Use the browser's smooth scroll** (`scrollTo({behavior: "smooth"})`), not a per-frame scripted
  animation — the scripted one was visibly choppy on this page (v7).
- **Cache the stops.** Measuring layout on every scroll frame adds stutter; invalidate on resize
  and on DOM mutation.
- **Trackpad momentum lasts seconds.** Treating every wheel event within a short gap as one gesture
  swallowed new swipes for 4–5 s (v9). A new gesture = a 250ms pause, or — at least 450ms after the
  page turned and once deltas fell below half their peak — a delta 4× the smallest since (≥20).
  "Any rise after any dip" (v10) fired on a swipe's own jitter and turned two panels at once. The gesture logic is testable in Node with a stubbed window — the
  automation tab is hidden, so neither rAF nor smooth scrolling runs there.
- **One-screen sections (Who we are, Services) are caught on the swipe**, not on rest: a swipe towards the top from within half a screen lands on it (v39). Settling on rest alone never fired on a trackpad — momentum runs to the end of the scroll, so the rest check always saw a live gesture. The settle now also retries.
- The CSS proximity snap on Who we are was removed: a CSS snap on html fights scripted scrolling.

## SVGs are hosted, not inlined

Every SVG the CSS references lives at `validator-website/svg/` on the DigitalOcean CDN, with the
editable source in `svg/`. Change a drawing there, re-upload under the same name, and no CSS
changes.

They were briefly inlined as `data:` URIs — nicer in that there is no upload step and no flash of
an undrawn background — but eight drawings came to 13KB encoded and that contributed to blowing
the size limit above. If a new drawing is small (under ~500 bytes) inlining it is still fine;
anything bigger goes on the CDN.

## The deploy step is manual

Nothing here is live until it is pasted into Super. There is no CLI deploy.

This has caused repeated confusion: the file on disk is often **ahead** of what the site is serving,
and the site is sometimes ahead of the file (when an older copy is pasted back from Super, silently
discarding local edits). Before diagnosing "this CSS isn't working", check what the browser actually
has — read the live rules rather than assuming the file is deployed.

## Load order, and why it decides everything

Super injects stylesheets in this order:

1. Super's own runtime CSS
2. **Page-level CSS** (`network.css` and the other pages' Code panels)
3. **Site-level CSS** (`main.css`)

So `main.css` loads *after* page CSS and wins ties at equal specificity. Two consequences that come
up constantly:

- A page rule with `!important` can still be overridden from `main.css`, because `main.css` is later.
- A rule added at the **top** of a file loses to one lower down in the same file at equal
  specificity. Add a class to the selector to win regardless of position.

## Things that bite in Super/Notion markup

- **`@import` is stripped.** Load fonts with a `<link>` in Super → Settings → Code → Head.
- **Inline styles on covers.** Super writes `object-fit` and `object-position` inline on collection
  card covers, from Notion's crop setting. Only `!important` beats them.
- **`min-height` on covers.** Super floors covers with `min-height`, so a smaller `height` is
  ignored no matter how important it is. Set `min-height` too.
- **Block ids are positional-ish.** `#block-<32 hex>` is stable until the block is deleted and
  recreated. Prefer `:has(a[href$="/slug"])` over `:nth-child()` when a rule should survive
  reordering a Notion database.
- **Global classes are genuinely global.** `.notion-callout`, `.notion-pill`, `.notion-property` and
  `.notion-collection-card` are shared by every page. The homepage alone has seven galleries whose
  covers differ in shape. Scope card styling to a block id unless it is genuinely site-wide.

## Verify against the live site

The browser is the source of truth for what Super emits. Check computed styles and which rules
actually match before writing a fix — several bugs in this project were only visible that way
(dead selectors after a Super rename, inline `object-position`, `min-height` floors).
