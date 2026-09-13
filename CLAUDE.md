# website-css

Custom CSS for the Super.so site at https://encapsulate.xyz.

- `main.css` — site-level CSS. Pasted into **Super → Settings → Code → Custom CSS**. Applies to every page.
- `network.css` — page-level CSS for `/networks`. Pasted into that page's own **Code** panel.
- `svg/` — source SVGs uploaded to the DigitalOcean CDN and referenced by URL from the CSS.

## Back up before every change

**Before editing any `.css` file, copy it into the repo directory first, then make the change.**

```bash
cp main.css main.css.bak-$(date +%Y%m%d-%H%M%S)
```

Same for `network.css`. One backup per editing session is enough — no need to re-copy between
consecutive edits to the same file in the same turn.

Why this matters here: the repo has **no git history**, both files are large and hand-tuned, and
work has already been lost several times this way. Backups in `/tmp` are not good enough — they are
session-scoped and vanish. Keep them in the working directory where they survive.

When reverting, say which backup is being restored and what will be lost.

Backups are gitignored (`*.bak-*`), so they will not clutter commits. Delete old ones when a change
is confirmed good.

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
