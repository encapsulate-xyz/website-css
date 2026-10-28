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
**The label box does not clip** (2026-10-25, the user: "why buttons looks like cropped in the service section?"): the
link draws the fill, the ring and the lift, and Super's `.notion-callout__content` around it is exactly its size with
`overflow: hidden`, so the 1px-down, 2px-blur lift was cut flat along the bottom of every button on the site. §07 sets it
`overflow: visible`.

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

**One-screen bands snap through snap.js**, with every other snap on the site: "Snapping", below.

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

The wordmark links home (2026-10-25, the user: "add a button home just like we have for visit on services"):
over it a mouse pointer is a HOME pill, /services' Visit pill on the footer's ink — paper on the ground, ink where
its box covers more letter than ground (footer.js reads the wordmark's alpha once, drawn at 480px). A touch screen
gets no pill; the wordmark is a plain link there. Its label is in footer.js with the CTA copy.

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
The one exception: the homepage audience split's two "What you get" toggles are drawn by id in home.css
(07b) over §12, because main.css carries no block ids and a scope set by a script would show §12's
toggle until the script ran.
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

## Snapping — one engine for every page (snap.js, 2026-10-28)

The user, 2026-10-28: "the snappiness for all the pages, make sure its smooth and not choppy, also make sure its
consistent and not like some page snaps harder than others". **Every page that snaps now snaps through `snap.js`** (site
head), with one set of rules and one glide; no page script or stylesheet snaps on its own, and a new snapping band is a
selector in its `BANDS` list (or, for a run with frames, a function pushed to `window.encSnapQ`), never a copy of the
rules.

**What it replaced**, measured in headless Chrome with real wheel events (a trackpad-shaped swipe and a mouse notch,
recording `scrollY` every frame): home.js, network.js and guides.js each carried a copy of the homepage's rules and
moved with the browser's smooth scroll (Chrome: about 170ms for 100px, 290 for 300, 500 for a screen; another browser,
another length); the guides had CSS `y mandatory` with `snap-stop: always` (Chrome animates a CSS snap after a wheel
in under 200ms: the hardest); the chain pages CSS proximity (the softest); /services glided its run itself in 750ms;
/governance moved the page with the finger and stopped it dead at each count. On the homepage a notch from a Why Stake
band moved 100px and slid back (no notch ever reached the next band), and a medium swipe rested 402px between two
bands. And the three copies each attached a **blocking wheel listener on every page of the site**, snapping or not, so
every page's scrolling waited for its main thread.

**What snaps.** A **deck**: one-screen bands that follow one another (home: the audience split, Why Stake's three bands
and the networks are one deck of five; a guide's bands; a chain page's hero and bands). A **lone band**: Who we are,
/networks' Network Count band, /guides' picker. A **run** that hands over its own stops: /services' frames (the design's
uStops) and /governance's counts (each hold's middle). A band is one screen when it is no shorter than the screen and
runs past it by no more than its own bottom padding (a chain band is 722px at 1280×700, its padding). A guide's bands
count only under `html[data-enc-guide-snap]`, which guide.js sets once the built page stands at its top (the climb of
2026-09-30, `docs/guides.md`). Nothing snaps under 701px or with reduced motion, and the listeners are attached only
while the page has something that may snap (on: /, /networks, /guides, a guide, a chain page, /services, /governance;
off everywhere else).

**The rules, the same everywhere:**
- inside a deck, a wheel or trackpad gesture, an arrow, Page or space key moves exactly one stop and the rest of the
  gesture is swallowed; from the last stop the page goes on until the deck's bottom edge is at the top of the screen
  (it is left whole: the footer, after a guide), from the first a screen up;
- a gesture heading at a deck from within half a screen lands on its first stop (its last from below), and so does one
  from where the page left it whole, so one gesture back brings it back. A swipe already running when it comes that
  close is **taken over at its own speed** and slows into the stop (measured: 16–24px a frame before, 18 after, no
  stop and start);
- coming to rest some other way (scrollbar, touch, a key outside a deck): moved less than half a screen off a stop,
  on to the next (back, under 24px); inside a deck, the stop ahead (one less than half a screen behind counts); outside,
  onto a deck it was heading at from within a third of a screen. **A page moving away from a deck is never pulled
  back**, and a jump (a link, `#why-stake`, `/guides/sui#step-4`) stays where it lands;
- the gesture rules are the homepage's, tuned on a trackpad: a new gesture is a 250ms pause, a change of direction, or
  — 450ms after a page turned, once the deltas fall below half their peak — a delta 4× the smallest since (≥ 20). A
  trackpad travels 10px before it turns a page (a notch turns it at once; the Services run's rule); a flicker against
  the swipe is noise. A wheel over something that scrolls itself, or while the booking drawer or the menu sheet holds
  the page (`html[data-enc-locked]`, `html[data-enc-sheet]`), is left alone.

**One glide**: a cubic from the page's own speed to rest, `p(u) = from + d(3u² − 2u³) + T·v·u(1 − u)²`, the speed cut
so it never runs past the stop; **750ms for a screen** (the Services run's design), `750·√(distance/screen)` for less,
never under 380ms. By requestAnimationFrame, not `behavior: "smooth"`: that one always starts from rest and lasts what
the browser likes. The homepage's note that a scripted scroll was choppy dates from its full-screen sticky stat deck,
long gone: measured now, a scripted glide holds 60 frames a second on all seven pages, also at 4× CPU, except
/governance at 4×, where the browser's smooth scroll drops as many frames (9 over 25ms against 12; its canvas is the
cost). **A CSS snap cannot sit beside it**: on a guide the mandatory snap pinned a scripted glide where it started
(`moving: 1` of 44 frames). A swipe the page may not cancel (Chrome lets a page cancel a gesture only if it cancelled its
first event) is stopped by **freezing the overflow** until it is quiet: through `<body>` while the root's overflow is
visible, as here (`docs/services.md`, v366).

**Checking it**: `scripts/snap/run.sh <path> <page> [W H]` (home, networks, guides, guide, chain, services, gov) loads the
live page with this repo's files in place of every tag the heads pin and `dist/snap.js` preloaded (`PRE=` once the live
head carries it), and runs `scripts/snapprobe.mjs` on `scripts/snap/<page>.json`: each scenario jumps to a start, waits
for the page to go still, sends a notch, a swipe or a key, and prints where the page rested against where it should, how
long it moved and in how many movements. On 2026-10-28, 183 runs at 2560×1440, 1920×1080, 1440×900, 1280×700 and
1024×768 all passed, each one movement. Starts are fractions of a screen: a jump to within a third of a stop settles onto
it first, and one less than half a screen from the stop the page rested on reads as a step off it (the probe says when).
Headless wheel events are always cancellable, so the freeze is checked with `dispatchEvent(new WheelEvent("wheel",
{ cancelable: false }))`. `CPU=4` on livecheck slows the page four times.
