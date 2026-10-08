# The systems in main.css

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## Buttons, cards, covers, bands and the footer (from "The systems in main.css")

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

**One-screen bands snap the same way** (guides picker, the governance record's count band,
/networks' Network Count band since 2026-09-26): one
stop rather than a deck — a gesture heading at the panel from within half a screen lands on it, a
rest within a third of a screen settles onto it, nothing snaps under 701px or with reduced motion.
The catch rule is testable in Node (`scratchpad/snaptest.js`); the automation tab fires no scroll
events.

**The reconstruction banner is gone** (2026-09-26): the user deleted its snippet from Super's Body code,
head/site-body.html is empty, and main.css §15b (its styles, hidden by default) was removed in v307.
If a notice is ever wanted again, it is markup in the Body code plus styles; §15b's history is in git.

**Footer 44b (§16 + footer.js).** Its own top edge carries the `rgba(250,250,248,.2)` paper
hairline and **nothing sits under the disc field** — the field runs straight into the body
(handoff, 2026-09-21). The link columns are spaced by the design's 44px rows, not by a gap.
Super's footer (type Stack) is rendered into the design: menu
items named `Group: Label` become columns ("Legal" group → bottom right, no colon → "More"),
Socials → "Social" column, Footnote → bottom left. CTA copy, calendar URL and the rotating disc
glyphs are in footer.js by the user's choice; wordmark `svg/wordmark-reversed.svg`.

## Article blocks — the four generic Notion blocks (2026-09-25, design *Blog Article Blocks*)

main.css §12–13 and `blocks.js` give four Notion blocks their house form **wherever a page has not
drawn that block itself** — in practice the blog posts, and any future page. The chosen variants:

| Block | Design | Built from |
|---|---|---|
| Code block | **H**, the terminal well: paper-2 `#F2F2ED`, 4px, no border; JetBrains Mono 13.5/1.6; line numbers and, in a shell, a `$` prompt (`›` on a continued line, nothing on a comment or a heredoc body), both grey and unselectable; four type colours (ink, ink 700, green ink `#3F6B27`, grey); Super's own copy button as the 32px icon control, a tick while it reads "Copied"; a mono kicker above and a grey caption beneath | CSS + `blocks.js` (Super serves the code as plain text, so numbering and colour need a script) |
| Comparison table | **A**, the hairline table: mono heads over a black rule, hairlines, the header column in Outfit 600 and pinned when the table scrolls (min width max(480, 112 × columns)) | CSS only. Notion's own options pick the parts: **Header row** → `.col-header`, **Header column** → `.row-header`. A table with no header row stands on the black rule |
| Toggle | **B**, hairline rows under a black rule, Outfit 600 17, the 20px green badge with a plus at rest and a minus open | CSS only (Super's `.open`/`.closed`) |
| Link preview | **D**, the 12px ring-and-highlight card: a 160px field (the page's image, or a paper-2 well with the site's icon), the domain in mono, the title, a two-line lede | CSS only; a bookmark and an external object (GitHub) take the same card |

**The claims.** Each family's selector excludes the scopes that draw the block themselves, entirely —
not property by property: toggles skip `[data-enc-security]`, `[data-enc-invest]`, `[data-enc-fold]`
and the hidden copy toggles; tables skip `[data-enc-chain]`; every family skips `[data-enc-source]`.
**A page that styles one of these blocks itself adds its scope to that family's claims in §12.**
Checked on 2026-09-25 by snapshotting 324 elements' computed styles on the eight pages with claims
(/security, /contact-us, /investments, a chain page, /services, /blog, /guides, /networks) before
and after: no differences.

**The kicker is written in Notion**: start the code block's caption with the file name as inline
code — `` `install.sh` Run as a user with sudo… `` — and blocks.js lifts it into the kicker ("bash ·
install.sh"); the rest stays the caption. No inline code at the start, no kicker. The language is
the block's own; **Plain text** is read as output (no numbers, no prompt; timestamps and levels
grey) or, when every line has the same number of commas, as a CSV grid. Notion has no CSV or log
language.

**Posts:** post.css caps a toggle at the code block's 680px and takes the article's 24px gap back
between two toggles, so a run reads as one list. The post's link rule (a green rule under
`.notion-link`) is one class more specific than a card, so the card's anchor is selected as
`a.notion-link`. Super fixes a bookmark's description at `height: 2rem` and `opacity: .6`; both
are undone.

**Notion changes made for it (2026-09-25):** Header row switched on for FogoChain's phases table,
Aleo's ports table and the second Zk-SNARKs table (their first rows were column labels); Header
column for Aleo's hardware table (CPU, Memory, Disk… are row labels); the Avalanche guide's NodeID
block from bash to plain text (a value, not a command — it would have carried a `$`).

**Not in the handoff, still open:** inline `code` spans, a code block on an ink band (the file
defines dark token colours but no ink well), a toggle heading (a heading block made toggleable),
and an internal link preview's field drawn from the post's chain glyph (every bookmark on the site
today is external).

## A page that ends in a band runs into the footer

Super pads the article and the main below the content. Where the last thing on a page is a
full-bleed band, that padding reads as a strip of ground above the ink footer, so the page zeroes
it: `/guides`, `/security`, `/investments`, and since 2026-09-21 `/networks`, `/brand` and
`/contact-us` (`.super-content.page__<slug>` and its `.notion-root`). A page that ends in ordinary
content keeps the padding — it is breathing space, and on the paper ground it reads as such.
