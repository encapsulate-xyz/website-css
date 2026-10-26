# Below 900px, the audit of 2026-09-26 and the raw-Notion audit of 2026-10-25

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## Below 900px (2026-09-25, v282)

Every page was checked at 360–880 and fixed where broken, each file in a "BELOW 700px" section at
its end; **every added rule sits in a media query capped at 900px**, and 1440 was proved unchanged
by computed-style snapshots (base = the last release from the CDN, local = the new files; only the
footer's rotating discs differ, and they differ between any two loads). The user's rule: nothing
above 900px changes in this work. What was learned:

- **An absolute `::before` ground escapes a card that goes `position: static`.** The homepage's
  stats and testimonial decks fall back to static cards on phones; each card's ink `::before` then
  sized itself to the page (390×14,607px) and ten of them painted ink over every section below —
  black headings, empty rows. `position: relative` on the cards.
- **Covers (§19 + covers.js):** on phones and to 800px the field box is 93.5vw tall and some
  fields' marks rise above it, so the words reserve `93.5vw × (1 + --enc-field-rise) + 28px`
  (`rise()` measures it). A crumb or foot pair that does not fit on one line stacks
  (`fit()` → `data-enc-stack-top|foot`).
- **The homepage hero** is centred by code since v291 (see Homepage).
- Per page: /governance-record's controls and rows reflow (the rationale is always open on touch),
  /security's sticky blocks are static, /investments' six questions wrap into a grid under 800,
  /networks' sort and search sit under the tabs up to 860, the chain dock wraps under 640 and the
  hero stacks to 900, /blog's grid is two columns at 701–900. (The raw guides' 76px top padding to 900
  went in v347, with the old page CSS that had forced their top to 40px: Super's own 80px now puts an
  unconverted guide's first block 16px under the bar at every width.)
- **Left alone on purpose:** the guide's hollow numeral lies behind the capture on a phone (the
  user: by design), the footer wordmark's crop, the cover field's left crop.
- **Still open above 900px** (the user said leave it): /blog's grid squashes at 901–1024; the chain hero is tight at 901–960;
  the booking drawer wraps at 901–919.
- **livecheck** now lets Chrome pick its own port (`--remote-debugging-port=0` + the profile's
  DevToolsActivePort): with a random port, parallel runs attached to each other's browsers.

## The audit of 2026-09-26 — every page the navbar and footer reach, 320–2560

Six read-only auditors (one per group of pages) measured every width with `scripts/audit.mjs`,
reviewed screenshots and used every control with real mouse and keys; the fixes were then made
one at a time, each scoped to the widths where the fault was measured, and proved: the automated
checks clean on 15 pages at 10 widths, and a computed-style comparison at 1440 against the release
before (v304) showing only the intended changes. The old pages (snapshots, Lido DVT clusters, legal,
the rewards calculator) and every guide but Axelar were left alone (the user). v305.

What was broken, now fixed:
- **The navbar's Practices panel** read the record's date by the header "voted on", renamed
  "Recorded" the same day — the latest votes fell back to the note. `READ["/governance-record"]`
  accepts both.
- **Keyboard:** the navbar's group triggers are Super's spans with no tabindex, so Tab never reached a
  menu — navbar.js `keys()` gives each a tabindex, `role="button"` and Enter/Space (a click, once React
  has adopted the node). The compact sheet takes focus when it opens and Tab goes round the bar and
  the sheet only. Super's static.css sets `button { outline: unset }`: every button a script builds
  (`[class*="enc-"]`) takes the house ring on `:focus-visible` (main.css, in the button's own colour
  at 40%, so it reads on paper and ink); a component with its own ring keeps it.
- **/security 04 at 390:** a tap on "03" left "02" selected (the pile's heights moved under the
  smooth scroll) — the chosen step holds for 1.4s.
- **The record's "By chain"** put the database's three empty rows first — unbuilt rows are hidden.
- **/investments "Send the spec"** pointed at a block no longer on /contact-us (Notion link fixed).
- **Chain pages' names broke inside the word** at 901–1919 ("Avalan|che") — chain.js `fitName()`
  measures the longest word on a canvas in em and chain.css takes `min(design size, 100cqi / em)`.
- **React #418 (hydration mismatch) on every page — SETTLED: leave it, and do not raise it again (the
  user, 2026-09-26).** Measured, and left as it is by the user's rule:
  Our scripts build at DOMContentLoaded, before React adopts Super's HTML (the fiber key on
  `.notion-root`); React then throws the built DOM away and renders again, and the observers
  rebuild: a raw-Notion flash at the moment of adoption, 0.1–0.6s on a desktop, 0.3–2s at a 4x
  CPU throttle (`scratchpad/hyd.mjs`-style timelines, ten pages, three loads each). Holding every
  first build until adoption removes the flash but shows raw Notion from first paint until adoption
  — 0.7–7s on a phone-speed CPU (homepage ~3.9s against ~0.5s today). The user: if it makes the page
  slower with Notion visible, don't. So nothing waits for hydration; v305's Menu-button wait was
  reverted in v306 for the same reason (the phone's Menu came in seconds late). A fix that keeps the
  early build would have to rebuild before paint on adoption (observer callbacks, not timers) — not
  attempted.

Responsive, by width:
- **Super's side margin jumped from 24 to 96px at 547** (content narrower at 560 than at 546): from
  547 to 1024 main.css sets `--padding-left/right` on `.notion-root` to `clamp(24px, 16.667vw − 72px,
  96px)`; the homepage above 1920 uses the bands' `max(96px, 50vw − 864px)`.
- **Homepage:** the testimonial quote cleared the names rail (1180–1440); Who we are stacked is one
  left edge and hides "Pick a name"; the contact card's padding on phones and its routes as a list
  under 960; the Why Stake drawings capped at 440px (601–1099); the blog rail starts under its heading
  (≥547); the invisible link list and two empty paragraphs above the footer are hidden (not deleted);
  44px tap rows for LinkedIn and the routes; the table's discs load Super's 96px image, not the
  original (governance.js `small()`).
- **Record:** the vote field three blocks a row on phones (6px marks), the pillar fields without the
  2x2's floor, the ± after a wrapped title's last word (main.css §13d ≤900), the head's button at
  the lede's foot. **Investments:** the status line keeps its shown height; the tabs take arrow keys.
  **Services:** on touch a monitoring chip's first tap fills the sentence, the second follows.
- **/networks:** the count band's tally under the line at 761–1179. **Chain pages:** the dock's facts
  hidden at 761–899, the band tops stacked under 481, the hidden dock out of the tab order, 44px touch
  targets, captions `text-wrap: pretty`.
- **Guides:** the bar and "a wallet" slot on phones; the Axelar step keeps the 1728 composition above
  it; a tall capture held to the screen at 701–900. **Contact:** the calendar frame's floor is the
  booker's 560 under 900.
- **Posts:** empty paragraphs hidden (`:empty`), the rail's progress and ask hidden under 900, a table
  of up to three columns sizes to its words on phones. **Blog:** three-line titles under 900, the last
  card fills its row at 701–900, the lead title a step above the rest on phones; the filter bar's
  panel `min(392px, 60vh)`.
- **Security:** the diagram scales to its frame down to 0.7 (security.js `fitCanvas`) and fades its
  edge while it scrolls, the failover pile steps over its own words under 900, the 02 tabs two by two
  under 600. **Navbar:** the chains' rate hidden at 1101–1365, a 104px wordmark under 360, the stacked
  drawer's calendar a full screen.

Decided with the user after (2026-09-26): the record and the navbar run the full width at ≥1920
(as they are); "1882 votes" stays — it counts votes from before the record was kept; "Hover a
highlighted word" stays; the three blank record rows were deleted (Notion trash); the "Under
reconstruction" banner's Body snippet is to be removed in Super (head/site-body.html is empty); the
blog's no-results state waits for a design. **The EigenCloud pair in the Learn panel:** two guides for
one chain and one wallet — /guides/eigen-layer (11 steps, delegate on EigenLayer) and
/guides/eigen-layer-lst (18 steps, stake ETH on Lido and restake the stETH) — and the second
carried the first's Title. Its Title is now "Restake stETH with MetaMask"; the navbar's /guides reader shows
every guide by its Title since v329, so the twins read apart. The picker still offers one guide per chain
and wallet, so the LST guide is not reachable from it.

**The zk-snarks post's prose** was three JSON code blocks (13, 23 and 31 lines of sentences, 2,096px
lines on a phone). Split at their blank lines, verbatim: 21 paragraphs, and the lines that are only
a formula as 10 plain-text code blocks (consecutive formula lines kept together); the three code
blocks were deleted (originals in backups/zk-snarks-code-blocks-2026-09-26.json).

Still open: the stage block under the index on touch phones, the code copy button over a phone's first
line.

## The raw-Notion audit of 2026-10-25 — every page type, fresh and in-app, 1440 and 390 (v404)

The user: "audit the website to make sure raw notion doesnt appear anywhere else too", "and fix if it does".

**How.** `scripts/flashcheck.mjs` records every frame Chrome paints while a page arrives (the screencast sends a
frame per paint, so nothing falls between two screenshots): `cold <url>`, or `nav <from> <to>` through Super's own
router. `scripts/flashsheet.py` lays a recording's distinct frames out on one sheet. 24 pages — every main page, three
chain pages, four converted guides, a post, /governance/votes, both 404s, /team — fresh and arriving from another
page, at 1440×900 and 390×844: 96 recordings, read frame by frame; then every fix recorded the same way with the
repo's files served for every pinned tag. `livecheck.mjs` took `PRELOAD=file.js` for a logger that has to see a
load's first frames.

**What showed, and what changed:**

| Where | What showed | Fix |
|---|---|---|
| In-app navigation to a page whose CSS is in its own head (home, /networks, /governance, /guides, /services, /investments, /security, /contact, /brand, the legal pages) | Super renders a page's head *inside* the page (`main.super-content`), in the same commit that swaps the page in, so its stylesheet starts loading once the page is up: unstyled for 0–50ms on a quiet network and up to 490ms on a busy one (/contact; /brand 180, /guides 100 — 3 of 20 runs); the homepage's hero half-styled for ~120ms | blocks.js marks `html[data-enc-css-wait]` in the commit's own microtask for each stylesheet added inside `.super-content` that has not loaded, until each loads or fails (3s at most), and main.css §03 hides `.super-content` under the mark. No page head has to change for it, so a head that lags cannot leave a page hidden. A 16-page chain of navigations: hidden 0–22ms each |
| Guide pages, fresh load (every converted guide) | Super's gallery of step tiles for 12–130ms, then the footer alone on screen for 130–530ms while guide.js fetched /guides for the head — claiming the page set the raw blocks and the deck `display: none`, and the page folded up under the footer — at times Super's own unstyled footer | guide.css hides the raw page by `parent-page__guides` from the first paint until the bands are in (visibility, so it keeps its height; 3s); the display-none rules wait for the bands; the /guides fetch starts as guide.js runs. A guide with no numbered steps (16 of 33, not converted) is marked `data-enc-guide-none` once its blocks are in (the footer has parsed) and shows as before |
| /brand, fresh load | the cover's five lines as plain centred text for ~65ms, twice: before the build and when Super drew the page again | brand.css hides the cover's content until `.enc-mid`; brand.js builds on the next frame while the cover is unbuilt; the cover's min-height fallback is 0 (56px showed the next band's heading under it until measured) |
| The 404 — an unknown address (which shows /page-not-found in a full-window frame) and /page-not-found | Super's own footer, a white list of links, for up to 300ms; and one empty frame with the footer at the top when Super drew the page again | main.css §16 hides Super's footer content until footer.js has built (visibility; 3s); footer.js builds on the next frame while unbuilt; notfound.js rebuilds in the observer's microtask when the finder has gone |
| Chain pages, fresh load | the page blank for 50–65ms after the first build: Super's second draw dropped the bands and the quiet tick rebuilt 30ms later | chain.js rebuilds in the same microtask (the id and the row are settled promises, so the build lands before the paint). And the name broke inside its word ("Cosmo / s Hub") for ~100–260ms before Outfit loaded: `fitName` fits it to the face it is drawn in, then to Outfit — the canvas is given the name's own stack (`"Outfit", sans-serif`); given `"Outfit"` alone it measured the browser's serif, and v404's 15% margin still broke it live (v405) |
| Chain pages after an in-app navigation from /blog | 6 of 28 — Agoric, Espresso, IOTA, Monad, NEAR, Zilliqa — marked "no" and left as raw Notion (on the live site before this audit) | chain.js read the page's id from the document's own data, which after a navigation is the first page's: on /blog the path is a post's Chain mention, and the first `blockId` after it a post's. From another page's data only an id written beside the path is taken; otherwise the page is fetched. From /blog 28 of 28 build |
| Chain pages, a first visit (nothing in localStorage — a reader from a search) | 12 of 28 chains — Supra onward — drawn in one tint and then another (Chain4Energy peach → blue, Passage yellow → green) ~400ms in | the tint is the chain's place in the list, as on /networks; before the list was kept chain.js guessed it from Order, which has a gap (no row holds 16). Until the list is known the field has no tint, and it fades in (280ms, none under reduced motion) when the list comes; a return visit has the list and draws at once (v405) |
| Every page with a cover field | the field gone for 20–700ms and the label pairs on one line after Super drew the page again | covers.js redoes the cover in the observer's own microtask. The next frame was not soon enough: Super draws the page again inside a frame callback, so that frame painted bare, and a long task held the next one ~200ms (/governance) |

**Left as they are:** /team's landing scrolls through the homepage to Who we are (a landing, not raw); the contact
heading's line moves as Outfit loads; an unconverted guide is Super's tiles until it is converted. **Checked
after:** every page builds, the wait mark always clears, an idle page makes 4–7 mutations in 3s, as live does.

**The rule for a builder** (also in CLAUDE.md, "Things that bite"): hide what it replaces by Super's page class from
the first paint (visibility and a 3s reveal), rebuild in the observer's own microtask when Super's second draw drops
the build, and record the page with `flashcheck.mjs`, fresh and in-app, at 1440 and 390.

## PageSpeed, 2026-10-25 — the homepage, and what was done without changing the look (v407)

The user shared the homepage's PageSpeed Insights report (Lighthouse 13.5) and asked for everything that could be fixed
"without changing anything functionally for a user and design wise", and a list of the rest. Before: desktop
**Performance 79** (FCP 0.7 s, LCP 2.1 s, TBT 230 ms, CLS 0.002, SI 1.7 s); phone **35** (FCP 3.8 s, LCP 10.9 s,
TBT 670 ms, CLS 0.197, SI 6.5 s). Accessibility 100, Best Practices 96, SEO 100 on both.

**What the report pointed at, and whose it is:**
- **The largest element is the hero's loop** — on both, the `<video>`, painted first as its still, the CSS background
  `../img/home-loop-poster.webp` on home.css's own tag. **The preload in head/home.html was on v334 while home.css was on
  v401**, so it fetched a file nothing drew, and the real still was found only once home.css had arrived ("fetchpriority
  high" and "discoverable in the initial document" both failed; desktop load delay 820 ms). Fixed: the preload is on
  home.css's tag, and build.py warns when the two differ.
- **Our scripts went out with every comment** — 21 files, 758 KB, 243 KB gzipped ("Minify JavaScript", 91 KiB).
  build.py now minifies them with esbuild, whitespace and comments only, with a source map beside each: 444 KB, 148 KB
  gzipped. Checked on 16 pages, each loaded with the old and the new scripts: the same `data-enc-*` marks, element counts
  and errors (React #418 only), and 63 of 64 screenshots identical to the pixel (the 64th a reading bar at 17% against
  18%, a scroll timing).
- **Inter, 3 weights of ~100 KB from Super** — Super's site font, which our CSS never named, so it showed wherever no rule
  set a font. Not in the design system (the user: "i dont think we have inter in it"), so main.css §02 sets Super's
  `--primary-font` and `--secondary-font` to Hanken Grotesk; a sweep of all 114 pages at 1440 (and 8 at 390) finds no
  visible Inter left. What changed on screen: the homepage's three stat captions and one paragraph, the /blog card links,
  one post's note, the guides' link previews, the /security rail's lines (now one line each, the rail 19 px shorter) and
  the /governance/votes table. Super still preloaded Inter 400 and 600 in every page's HTML (205 KB), from its theme's
  Typography setting — **since 2026-10-25 that setting is Geist** (below, "Super's theme font").
- **Super's own** — its Next.js chunks ("unused JavaScript" 281 KiB, "legacy JavaScript"), its fonts' and logo's 1-day
  cache, its stylesheets — cannot be changed from here.
- **The loop itself, 1.3 MB**, is the largest download on a phone. Listed twice in the report; a real Chrome load fetches
  it once (one 206 range response). Loaded as soon as the page is, on purpose (home.js sets `preload="auto"`).
- **The phone's CLS 0.197** is the loop's block moving. Not reproduced on a Mac (0.004, every shift the navbar's 3 px
  button) — **found and fixed later the same night, v409: a fallback font on Linux** (below, "The phone's layout
  shift").
- **The phone's LCP (9.8 s) is a simulation.** Observed, the hero's still paints at 1.45 s; Lighthouse's slow-4G model
  counts the bytes of every request that started before it — Super's chunks and images, its font preloads, our scripts.
  **Blocking the loop's 1.3 MB entirely changed nothing** (Lighthouse run here: LCP 9.8 s and the same score with and
  without it), so the loop is not the cause and is not deferred. Fewer bytes is the lever, and most of what is left is
  Super's.

**After v407** (PageSpeed, the same evening): desktop **90** (LCP 1.6 s, TBT 150 ms, SI 1.1 s, CLS 0.002); phone **45**
(LCP 9.8 s, TBT 270 ms, CLS 0.199). "Minify JavaScript" passes, and the still is "discoverable in the initial document".

**Held back, because they change how the page looks or behaves:**
- Load each page's CSS and script only on its own page ("unused CSS" 33 KiB, most of the scripts): every page's files are
  in the site head because Super runs no page script on an in-app navigation — taking them out brings the raw-Notion
  flashes back.
- The navbar's ground check (`navbar.js` `ground()`, 489 ms of forced layout on the phone run) and home.js's band frame
  read layout while Super is still drawing; moving the reads to the next frame risks a frame of the wrong bar colour over
  an ink cover, which was reported before.
- The 10 "non-composited" animations: making them composited means animating other properties.

**Super's theme font is Geist (2026-10-25, the user: "do it but verify nothing changes because of it visibly").** Super
preloads two files of its theme's font on every page — regular and 600, from `assets-v2.super.so/global/fonts/` — and
declares its @font-face rules; there is no "none" among its 68 fonts. The site's theme ("Funky", applied to this site
only) had Inter on both Primary and Secondary: 98 + 107 KB. Geist's two files are Latin only, 33 + 35 KB, so every first
visit fetches 136 KB less. **Nothing draws it**: Super's font variables are main.css §02's Hanken Grotesk, and no
stylesheet the site loads names Geist. Checked with a capture of all 114 pages at 1440 (and 16 at 390) before and after —
every visible text run's font, size, weight, spacing and position, every element's font family, the fonts drawn —
and screenshots of 16 pages at 1440 and 390, then the same 16 loaded at one moment from the HTML Super served before and
after: 121 of 128 screenshots identical, the 7 others the homepage's live figures in the older HTML and one antialiased
row of a glyph disc. Of ~216,000 elements none names Geist or Inter; the fonts drawn are Hanken Grotesk, Outfit and
JetBrains Mono, as before. Where: Super → Design → Edit this theme → Typography → Primary Font / Secondary Font (each
choice is saved with "Save changes"); then refresh every page. A missing address Super has answered before keeps its
cached HTML (with the old font lines) for a while; a new one gets the new. **All 21 of our scripts now carry a valid
source map** (Lighthouse: each listed with its map, no error); the one large script without a map is Super's own chunk.

## The phone's layout shift — a fallback font on Linux (2026-10-25, v409)

PageSpeed's phone run of the homepage failed Agentic Browsing (2/3 — the user: "why on mobile its 2/3") on **Cumulative
Layout Shift 0.197–0.199**, all of it the hero's loop (`#block-3e6e800a…`), and its scores moved from run to run ("the
score keps changing why is that ?"). A Mac never showed it: Lighthouse 13.5 there, and sixteen instrumented phone loads
with each of our files, Google's fonts, Super's chunks or the loop held back up to 6 s on a 4× slower CPU, all measured
0.002–0.004.

**The cause is the fallback font, and PageSpeed runs on Linux.** Until Outfit and Hanken Grotesk arrive, Chrome draws the
text in the next family of the stack, `system-ui` / `sans-serif`: San Francisco on a Mac, which happens to set the hero as
Outfit does, but **DejaVu Sans on Linux** (fontconfig's `sans-serif`), 28% wider than Outfit 600 on the site's headings
in bold, so at 412 px the headline took three lines instead of two and the lede three instead of two: the loop sat 62 px
lower (543 against 481) until the fonts came, then jumped. Whether the fonts beat the first paint decides each run, which
is why the score moves. **Reproduced** with Lighthouse 13.5 in a Debian container with Chromium 156 (`scripts/linux/`):
0.197, 0.214, 0.195, 0.197, 0.195, culprit the loop, root cause "Web font". Android's Roboto is within 1–3% of Outfit and
Liberation Sans/Arial 7% wider, so a real phone saw the same shift whenever its fonts were late, by less.

**The fix, main.css §01:** fallback faces sized to the web fonts, so the swap moves nothing — `"Outfit fb"`, `"fb2"`,
`"fb3"` and the same for Hanken Grotesk: local Arial and its metric twins (Liberation Sans, Arimo, Helvetica), then
Roboto, then DejaVu Sans, each with `size-adjust` and the web font's ascent and descent, named in the stacks after the
web font (`--type-display`, `--type-body`, `--primary-font`, `--secondary-font`). The widths were measured in Chromium:
Outfit 400 and Hanken Grotesk 400 against the regular faces on the homepage's prose; Outfit 600 against the bold faces
on fourteen of the site's headings one by one, at the **narrowest** ratio (91.5%, 97.5%, 77.5%), because a heading must
never take a line more in the fallback — at the prose ratio (93.5%) "blockchains online." still wrapped. **Each face
covers exactly its web font's characters** (the Latin subset's cmap, read with fontTools), so once the web font is in,
the fallback has nothing left to draw.

**Checked:** at 360, 390, 412, 430, 600, 768 and 900, with the web fonts blocked, the hero's headline, lede and loop sit
where they do once the fonts are in, on all three fallbacks (Liberation, Roboto alone, DejaVu alone; the old CSS: the loop
62 px low). Lighthouse on Linux, four runs with the new main.css: **CLS 0.0032** each (the navbar's button), Agentic
Browsing 3/3, Performance 44–48 against 38–42. **Nothing changes once the fonts are in:** every font Chromium draws on
/, /security and /networks/sui at 412 and 1440, glyph counts summed over every element, is the same with the old and new
CSS (Hanken Grotesk, Outfit, JetBrains Mono, and DejaVu Sans Mono for four glyphs JetBrains Mono lacks on /security).

**The other pages, the same night** (Lighthouse phone on Linux, live, after v409): /security 0.004, /blog/zk-snarks
0.007, /investments 0.005, /services 0.021 — but **/services and /investments failed Agentic Browsing's accessibility
tree** (2/3): an `aria-label` on a plain div (services.js's networks tiles, investments.js's position marks), the same
fault as the homepage's columns. Both are named pictures now (`role="img"`, v410), 3/3 on both, nothing else changed.
**/networks/sui 0.101 and /guides/sui 0.099** — the article moving, root cause "Unsized image element", not a font; and
/networks/sui fails colour contrast. Both are in `docs/todo.md`, "TODO — the chain and guide pages' layout shift".

**Not covered yet:** the page CSS files that name the fonts directly (`"Outfit", sans-serif` in guide.css, services.css,
chain.css and others) still fall back to the system font; only the stacks built from the tokens have the faces.
Measure a page with `scripts/linux/lhab.mjs` before widening it.

**Running it** (the VM is the user's Colima): `colima start`, `docker build -t enc-lh scripts/linux` once, then from the
repo `docker run --rm --shm-size=1g -v "$PWD":/repo:ro enc-lh node /repo/scripts/linux/lhab.mjs live|swap` — `swap`
serves this repo's `dist/main.css` for the pinned one. `fbdebug.mjs` (VW=, MODES=`live:1,swap:0`, 1 = web fonts
blocked) prints the hero's heights and the font each line is drawn in; `fontsused.mjs` (PAGES=) compares every font
drawn on loaded pages. Remove fonts inside the container (`rm -rf /usr/share/fonts/truetype/liberation*; fc-cache -f`)
to test another fallback. **Re-measure the faces when the fonts, their weights or the headings change.**

## The first paint (2026-10-26, v411–v412)

The user: "audit if you can make any other peformance improvement to make the website score better o both, but make
sure there is no noticable change as a user no layput change no change in how it works for user, i need it to score
above 90 in both". Before (PageSpeed, the homepage, v410): phone **51**; desktop **90** at v407 (above), 75 in
Lighthouse 13.5 on the Mac.

**What held the first paint.** Eight stylesheets from three servers, each render-blocking: Super's theme
(`minima.min.css`, sites.super.so), main.css and the five page sheets the site head carries (post, blog, guide, chain,
notfound; jsDelivr), and Google Fonts' stylesheet (fonts.googleapis.com) with its fonts on a fourth (fonts.gstatic.com).
PageSpeed put minima at 1.2 s and Google's stylesheet at 1.05 s of the phone's render-blocking time; in Lighthouse's model
each server costs a connection and its own latency (gstatic 1.4 s on one phone run). And the homepage's largest paint was
the hero's `<video>`, which Lighthouse timed by the whole 1.3 MB file.

**What the floor is.** Lighthouse on the Mac with things blocked one set at a time (phone / desktop): today 57 / 75; our
scripts blocked 62 / 84; the loop blocked 57 / 87; Super's scripts blocked 67 / 97; all three 71 / 96; **everything but
Super's HTML and CSS** (our files, the fonts, minima, Geist, every image, Super's scripts and the loop) **79** / 97, with
the phone's FCP still 3.2 s and LCP 4.3 s. Super's own page cannot score 90 on the phone.

**Done, v411 — nothing on screen changes:**
- **`dist/site.css`, one stylesheet** from the server the scripts already come from: Super's minima (vendored in
  `vendor/minima.min.css`, fetched again at every build — build.py says so when Super has changed it, and uses the copy
  offline), main.css, the five page sheets and fonts.css, in the order the head linked them. 262 KB, 25 KB brotli.
  head/site.html links it in place of the eight, with no Google preconnects.
- **The fonts are served from the repo** (`fonts.css`, `fonts/`): the 24 @font-face rules Google serves a current Chrome,
  every subset and unicode-range, `font-display: swap`, the same 14 woff2 files under names that say what they are, and
  their OFL licences. No Google Fonts link goes back in a head.
- **The loop's still is its poster too, and the file is asked for after the first paint** (home.js `loop()`): the poster
  is home.css's own still by the stylesheet's address, and `autoplay`, `preload=auto` and `play()` wait for a frame.
  Lighthouse now times the still (37 KB).

**Checked:** 14 pages (/, /networks, /networks/sui, /guides, /guides/sui, /blog, /blog/monad-l1-scaling, /governance,
/security, /services, /investments, /contact, /brand, /privacy-policy) at 390 and 1440, each loaded twice with the old
head and once with the bundle (the page's own HTML rewritten, `perf/xform.py`), full-page with reduced motion: every
base/base pair 0 px apart, and every base/bundle pair 0 px but one — the post's Menu button border at 390, 160 px, a
0.16 s border transition caught mid-way by the capture's resize, 0 px with transitions off. The same fonts drawn. Live:
all 114 sitemap pages 200, on site.css v411, with no minima, main.css, page-sheet or Google Fonts link.

**After (PageSpeed):** homepage phone **60, 62** (FCP 4.2 / 2.7 s, LCP 8.7 / 8.5 s, TBT 160 / 340 ms, CLS 0.003, SI
6.0 / 4.2 s); homepage desktop **95, 83, 94** (FCP 0.6 s, LCP 1.0–1.1 s, TBT 150 / 340 / 160 ms, CLS 0, SI 0.9–1.0 s);
/networks desktop **96**; /blog/monad-l1-scaling desktop 82, then v412.

**v412, a post's head mark** (`docs/blog.md`, "The mark goes in with the head"): the post's largest paint waited for
post.js to fetch /blog (500 KB) before it was given its file, then loaded a 47 KB PNG from Super's asset host (desktop:
load delay 1,230 ms, load 750 ms). It now takes the file from the post's own card when Super's page data names it as the
row's, and draws it from Super's image service (3 KB AVIF, the same 600 px glyph; within 3/255 on screen). After: delay
560 ms, load 60 ms, **desktop 90** (LCP 1.7 s).

**Why the phone stays near 60.** Lighthouse's phone LCP is every request that **finished before the paint it saw**,
replayed at 1.6 Mbps with a 4× slower CPU. On PageSpeed's own fast load the hero's still is in by 0.3 s but painted at
2.4 s, once the CPU is free — by then Super's ~600 KB of script chunks have arrived, and the model replays them all:
8.5–8.7 s whatever we do. (The still paints within 30 ms of arriving in every throttled run here, with home.js early,
late or blocked — the poster attribute was never the wait.) FCP counts only the render-blocking requests (2.7–4.2 s: the
document, the stylesheets, and parsing an 889 KB page). With LCP at ~8.5 s the phone's ceiling is about 65.

**The desktop's swing is Total Blocking Time**, and most of it is Super's: its main chunk hydrating (two tasks of 222
and 178 ms on the 83 run) and the full relayout after its second draw of the page. Ours, on that run: home.js 131 ms,
governance.js 60, footer.js 60 — and most of their time is that same relayout (1,300–1,500 boxes, 90–110 ms at 4× CPU),
which a read in our frame only moves earlier: without the read it lands in the same frame. **Held back:**
- the 30 page-wide `:has()` rules in site.css (`body:has(` ×14, `html:has(` ×6, `.super-content:has(` ×4…), which make
  nearly every style pass re-match ~1,100 elements, even for one attribute on the navbar — the same rules as before the
  bundle; rewriting them so they match exactly what they match now is a refactor, not a speed fix;
- reordering the head's scripts, or holding them until after the first paint: sections the scripts build would come a
  frame later (the navbar's Menu button among them, a layout shift);
- the navbar's `ground()` and home.js's frame reads (the v407 list above).

**Measuring:** judge by PageSpeed, not by Lighthouse on the Mac: there the model's per-server latency swung from 0.2 s to
4.3 s (jsDelivr) and 0.25 s to 1.7 s (Super) between consecutive runs, and the phone score from 54 to 71. To see what
holds a paint, record the paint entries from the first moment of the page (`livecheck.mjs` with `PRELOAD=`), and read
Lighthouse's own model (`@paulirish/trace_engine/models/trace/lantern/metrics`) before guessing what it counts.

## The second pass (2026-10-26, v413–v414)

The same request, repeated after the push back ("audit again … no noticable change as a user"). PageSpeed that morning
(phone / desktop): the Monad post 62 / 80 (desktop TBT 280 ms, Accessibility 97), /networks 50 / 93, /blog 63 / 85, the
homepage 56 / 72. **/blog's phone TBT of 350 ms is Super's**: its long tasks were all Super's main chunk
(`2epv_ayozjutl.js`, 204, 168, 144 and 144 ms) and the document's own parse (98 ms); none of ours ran long.

**v413, the post's reading bar** is named by its label (`aria-labelledby`) and carries its value — PageSpeed's "ARIA
progressbar elements do not have accessible names", the post's 97. `aria-valuenow` is written only when it changes.

**v414 — nothing on screen changes:**
- **Outfit's Latin file is preloaded** beside site.css (head/site.html, on site.css's tag; build.py warns when they
  differ or the file is missing). On a page whose largest paint is its heading, Linux drew the fallback first and the
  heading's paint waited for Outfit (observed on Linux, FCP → LCP in ms: /networks 717 → 1,481, /governance
  836 → 3,233, /investments 401 → 2,465, /guides 469 → 1,039). Lighthouse 13.5 in Linux, desktop, two rounds, live head
  vs the preload (`scripts/linux/lhrun.mjs`, `INJECT=`): /networks 81, 84 → 94, 90; /guides 80, 80 → 86, 90;
  /investments 90, 89 → 97, 95; /contact 87, 84 → 93, 96; /blog 88, 86 → 91, 95; /governance 31, 31 → 33, 33. With it,
  the observed LCP is the FCP on every one of them. The homepage (its LCP is the loop's still) and the phones: no change
  beyond noise.
- **The tweets wait for the reader** (blocks.js, the last IIFE). Super's tweet block loads Twitter's widgets.js with the
  page, and on PageSpeed it was 0.9–1.1 s of CPU on the Monad post (two tweets; fogochain and xmtp have one each — 3 of
  38 posts). blocks.js stands in for `window.twttr` and starts the real script at the reader's first scroll, wheel,
  touch, click or key, or 10 s after load, whichever comes first; one copy of widgets.js, the same heights once built
  (Monad 792/846 px at 1728, 634/696 at 390; XMTP 1,220), the router's hops /blog → a post and post → post built too.
  **The one change a reader can see**: a tweet below the fold builds when they start reading rather than with the page.
- **governance.js places every split label, then measures them all, then fits them** (`layoutSplit`, `across()` returns
  its measure and fit): measured one at a time, after each one's own writes, each label forced a layout (131 ms on the
  homepage). The labels land where they did, checked at 1728 and 1100.
- **No `:has()` asks from the top of the page** (main.css §04, post.css, guide.css, chain.css, notfound.css). A rule
  that styles something *inside* an element it asks a `:has()` of — `body:has(…) .notion-header`, `body:has(…) .super-root
  nav …`, `.super-content:has(…) .notion-root` — has Chrome restyle that element's whole subtree whenever anything in it
  changes that the `:has()` might care about. Asked from body, html or the content, that is the whole document: while
  /governance built its 1,184 rows it restyled all ~25,000 elements a dozen times, **3,961 ms of style at 4× CPU**
  (1,440 px, traced), 2,283 ms of it in the twelve passes over 10,000 elements. Each rule now asks from beside or from
  itself, which restyles only that element, and matches exactly what it matched (the tree is the same on every page:
  the bar, then the content's wrapper; in the content, the header before the article):
  - the post's ink bar: `body .super-root nav.super-navbar:has(~ :where(.super-content-wrapper) > .super-content[class*="parent-page__blog"])`;
  - the header a post, guide or chain page hides: `body .notion-header:has(~ .notion-root[data-enc-…])`;
  - the content's padding: `.super-content:has(> .notion-root[…])`, and the cover's `body .super-content:has(> .notion-root > .notion-callout:first-child …)`;
  - the guide's footer snap: `… :where(.super-content-wrapper):has(> :where(.super-content) > .notion-root[data-enc-guide]) ~ .super-footer`;
  - the 404: `.super-content-wrapper > .enc-nf ~ .super-error` (notfound.js puts the finder first), no `:has()` at all;
  - the guide's `.super-content:has(…) .notion-root { padding-bottom: 0 }` is gone: `.notion-root[data-enc-guide]`
    already sets `padding: 0 !important`, and nothing else gives the article a forced bottom padding.

  Each selector keeps its specificity (`:where()` and a leading `body` make up the difference). After, the same trace:
  **1,211–1,239 ms** of style on /governance, three passes over 10,000 elements (the page's first style, and Super's
  two draws). The homepage 539 → 453 ms. It was held back in "The first paint" as a refactor; measured, it was the
  largest single cost on /governance. Found by taking the rules out in groups and putting them back one at a time
  (`scratchpad/hasx/`): a `:has()` costs only when its rule is actually matched against a page element, so a test rule
  that matches nothing proves nothing. **A new rule asks from beside or from itself, never `html:has()`, `body:has()`
  or `.super-content:has()` followed by a descendant.** Checked: the computed style of every element the rewritten
  rules reach (html, body, the bar and everything in it with its ::before and ::after, the wrapper, the content and its
  children, the footer) on 14 pages and two router hops (a post → /governance, back), at 1440 and 390, live against the
  new site.css: no difference. The 404 is drawn in a frame from /page-not-found, so it was read there: the finder first,
  the content hidden, with either stylesheet.
- **Tried and dropped:** the navbar's `ground()` in a frame instead of a 0 ms timer (977 against 978 ms of style and
  layout); renaming the record cells' `data-enc-chain` (the chain pages' mark), which turned out not to be what made
  the page restyle.

**After (PageSpeed, v414 live on all 114 pages; morning in brackets):**

| Page | Phone | Desktop |
|---|---|---|
| Homepage | 48, 72 (56) | 89, 92 (72) |
| /blog/monad-l1-scaling | 68 (62) | 87 (80); Accessibility 100 (97) |
| /networks | 73 (50) | 89 (93) |
| /blog | 54, 55 (63) | 78, 90 (85) |
| /governance | 31 | 51 |

The swing between two runs of one page is as large as any change (the homepage's phone 48 then 72). What is left in
Total Blocking Time is Super's main chunk on every run — on the post, /blog and /networks no long task was ours — and
on /governance it is Super drawing the whole record table (tasks of 842, 729 and 722 ms on the phone, 709, 705 and
579 on desktop), which only a shorter Notion view would shrink, and that changes what the page holds. /blog's heading
is its largest paint and was held 2.27 s after the response on the 78 run (the "element render delay"). The phone
stays where "The first paint" put it: Lighthouse replays Super's ~600 KB of scripts before the largest paint.
