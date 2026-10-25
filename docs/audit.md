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
  the /governance/votes table. **Super still preloads Inter 400 and 600 in every page's HTML** (its Typography setting);
  only the 500 is gone.
- **Super's own** — its Next.js chunks ("unused JavaScript" 281 KiB, "legacy JavaScript"), its fonts' and logo's 1-day
  cache, its stylesheets — cannot be changed from here.
- **The loop itself, 1.3 MB**, is the largest download on a phone. Listed twice in the report; a real Chrome load fetches
  it once (one 206 range response). Loaded as soon as the page is, on purpose (home.js sets `preload="auto"`).
- **The phone's CLS 0.197** is the loop's block moving. Not reproduced here: a 412×823 load with Lighthouse's throttling
  (150 ms, 1.6 Mbps, CPU ×4, a phone's user agent) measured 0.004, and so did Lighthouse 13.5 itself, run here twice —
  every shift the navbar's 3 px button. It shows only on Google's own run (0.199 again after v407).
- **The phone's LCP (9.8 s) is a simulation.** Observed, the hero's still paints at 1.45 s; Lighthouse's slow-4G model
  counts the bytes of every request that started before it — Super's chunks and images, its Inter preloads, our scripts.
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
- Removing Super's two Inter preloads means changing Super's Typography setting — Super's theme, which this site keeps out
  of the design (the design is the repo's).
