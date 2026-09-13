# website-css

Custom CSS for the Super.so site at https://encapsulate.xyz.

- `main.css` — site-level CSS. Pasted into **Super → Settings → Code → Custom CSS**. Applies to every page.
- `network.css` — page-level CSS for `/networks`. Pasted into that page's own **Code** panel.
- `svg/` — source SVGs uploaded to the DigitalOcean CDN and referenced by URL from the CSS.

## Back up before every change

**Before editing any `.css` file, copy it into `backups/` first, then make the change.**

```bash
cp main.css backups/main.css.bak-$(date +%Y%m%d-%H%M%S)
```

Same for `network.css`. One backup per editing session is enough — no need to re-copy between
consecutive edits to the same file in the same turn.

Backups live in `backups/`, which is gitignored. Keep them out of the project root — they were
piling up there and made it hard to see the four files that actually matter.

Why this matters here: both files are large and hand-tuned, and work has already been lost several
times this way. Backups in `/tmp` are not good enough — they are session-scoped and vanish. Keep
them in the working tree where they survive.

When reverting, say which backup is being restored and what will be lost.

Delete old ones when a change is confirmed good — `backups/` grows fast (25 copies, 2.1MB, in one
working session).

## Paste `dist/`, not the source

Super's Custom CSS box has a size limit. Saving an oversized stylesheet fails with
*"The code snippets you're trying to save are too large."*

These files are heavily commented on purpose — the comments are the record of why each rule
exists and what was measured — but Super does not need them. So:

```bash
python3 build.py          # writes dist/main.css and dist/network.css
```

**Edit `main.css` / `network.css`. Paste `dist/main.css` / `dist/network.css`.**

The build only removes comments and blank-line runs; it is string- and `url()`-aware, so a `/*`
inside a data URI or font name is never mistaken for a comment. Declaration counts are asserted
equal before and after. Roughly: main.css 95KB → 39KB, network.css 38KB → 22KB.

## Open items

- **Button sizing.** Buttons stretch to their column's full width — Notion block behaviour, not a
  decision. A fit-content version was built and reverted on 2026-09-13; the working approach and the
  trap are both recorded in the `TODO — BUTTON SIZING` comment in `main.css` section 07. Short
  version: `width: fit-content` alone collapses every button to 66px, because the label sits inside
  an absolutely-positioned anchor and so contributes no intrinsic width.
- **Both hero buttons point at `/networks`,** including "Book a Call". Content fix, in Notion.
- **Stat card says 28 networks; the fork panel says 38.** One of them is wrong.

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
