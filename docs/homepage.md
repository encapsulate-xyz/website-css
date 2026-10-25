# The homepage

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## Homepage (home.css, home-dial.css, home.js)

**The hero's lede has no lines around it** (v287, the user's decision 2026-09-25, "remember the
lines if I don't like it I may ask you to add them back"). Design 11a draws none; the page carried
two gradient hairlines from its old "Earn Rewards" copy. To restore them exactly, put this back in
home.css:

```css
#block-0dea66c8640e43628360c627219fdb79:before,
#block-0dea66c8640e43628360c627219fdb79:after {
    content: "";
    display: block;
    height: 1px;
    margin: 4px 0;
    background: linear-gradient(to right, black, rgba(204, 204, 204, 0));
}
```

Under 900px the lede keeps the design's 28px under the headline (the empty paragraph that spaces
them on desktop is hidden there), and the headline's `margin-bottom: 0` stays so that gap is exact.
The headline's font comes from main.css §06 alone; home.css adds only its #000 (Super's heading is
#111).

**The hero is centred by code** (2026-09-25, v291; the user: "use code to center align it"). It
is one Notion column list, the page's first block: the headline, the lede and the two buttons in
the left column, the loop (a video block: `home-loop-paper.mp4`, served from Super's asset host,
`assets.super.so/…/videos/2e7138f5-…/home-loop-paper.mp4`, identical to the repo's `video/` copy, checked
2026-09-27) in the right. **The loop's master has no alpha** (`FINAL EXPORT Encapsulat loop animation.mp4`, HEVC yuv420p, byte for byte
Wistia's original, checked 2026-09-21), so it cannot sit on ink; a transparent version needs a ProRes 4444 or
PNG-sequence re-export from whoever made the animation. **Super copies a video block's external file into its own storage when it publishes**, so the
host in the block's URL does not matter; the user kept the current encode (2026-09-21, "no its good now") — a new encode
is uploaded to the block. **Nothing in it makes space**: its six dividers, eight empty paragraphs and the button row's
empty third column were deleted, and the loop moved in from the top of the page, where it had
hung at fixed offsets (`top: -40px`, `90px` under 1728). home.css: the hero is one screen tall
(`100svh`), the words sit between two flex springs 28px apart (design 11a), centred under the
bar; the lower spring is never shorter than the loop's small orbs (their tops 14% of the loop's
width above its foot), so on a short screen (1440×900, 1536×864) the words rise clear of them
rather than the buttons landing on one — from 1300px, below which the loop is cropped past them.
The loop is the hero's backdrop, bottom-right, `max(100%, min(1728px, 140vw))` wide (under 1235
it shrinks so the sphere stays right of the words), its top edge masked into the paper. 901–1024
stays side by side (the old ≤1024 rule at the top of home.css sets every column to 100%); stacked
(≤900) the loop follows the words as a band. A divider or empty paragraph typed into the hero is
hidden. **Remove** the marked transitional rule for `#block-1ee04e9f…` (the old loop block) once
Super serves the new structure.
**The loop's still** (2026-09-29, v334): `img/home-loop-poster.webp`, the video's own first frame (37KB), is the
video's CSS background — it paints before the video has a frame (the loop was the page's largest element, 12.4s on
a phone), and the box takes the file's ratio (`aspect-ratio: 1920 / 916`) so it is the right size before the
metadata arrives; under 900px it crops as the video does (cover, 72% 100%). head/home.html preloads it. Re-cut it
(`ffmpeg -ss 0 -frames:v 1`, `cwebp -q 88 -m 6 -sharp_yuv`) whenever the loop changes.

**Who we are (09b) was checked against its file on 2026-09-27** (the user: is it verbatim?) and brought
to it, v317. What was off: the eyebrow's rule ran 312px, only under the two labels (each drew its own
border), where the file runs one rule `min(46%, 420px)` under the row, and Super's 24px line set the
labels 5px under their divider — the rule is now the content's `::before`, a grid item, and the
labels take their own line; the names and portrait were capped by the screen's height (64.8px and
306px at 1440×900 against the file's 74.9 and 320) for a section held at exactly one screen — it now
has the file's `min-height: 100vh` and its sizes; the intro was in Inter, not Hanken Grotesk, with
Super's 3px padding; the photo sat centred, not on the disc's foot (`50% 100%`); Book a call was 15px
(15.5); Super's 4px gap stood before the "·" in "FOUNDER · VALIDATOR". **The right stack**: the file
centres two stacks on each other (names + intro; portrait, quote 23px under it, role 12px under that),
and Notion gives the right-hand blocks no parent, so the quote had sat in the intro's row, 28–36px low.
home.js now measures the stacks (heights only) and sets `--who-rt`/`--who-lt` and per card
`--who-qh`/`--who-rpad`; home.css places the blocks by them once `[data-enc-who-fit]` is set, each with
an equal negative bottom margin so it takes no height from the rows (a plain top margin let Chrome
share the role's span into the two empty name rows, 47px each). Measured against a render of the
file's own markup at 1440×900, 1920×1080, 1536×864, 1280×800 and 1024×768: names and intro exact,
portrait, quote and role within 1–3px. Under 900px nothing moved (the stacked layout is ours; the file
has no small-screen variant). **S Maheswaran's tint is grey on purpose** (the user, 2026-09-25: "keep what it was
before"): his role stays **"Content & Socials Manager"** in grey, not the handoff's "Social media" in orange (`#F8DDC6`),
so his disc and rings are the neutral `#E2E2DB`. The unused "Social media" option is still in the Role list.
**The circles were in front of the portraits** until v318 — I said otherwise first, from a screenshot,
and the user showed the seam across a shoulder. Super gives every card property `z-index: 10`, and a
grid item's z-index counts even unpositioned, so each name and role was its own layer and the disc and
rings hung on them (their `::after`/`::before`) painted over the photos and the eyebrow. The name and
role are `z-index: auto` now; proved with the disc turned red — the portrait's pixels keep the photo's.
**A 7% wash cannot be judged by eye: test paint order by making the layer loud and reading pixels**
(`livecheck.mjs` `pixel(x, y)`).

**No divider makes space anywhere** (2026-09-25, v292). main.css §11 used to keep a divider in a
column as hidden height, and four page files hid it under 1024px — that was how the hero was
aligned. §11 and every copy are gone, and all dividers were deleted from Notion: the hero's, the
section rules in the posts (design J separates sections with the heading's 18px and the article's
24px gap, no line — 42px above a heading now, 76 with the rule), and the hidden ones at the foot of
every guide and post, and the old pages outside the designs — /snapshots and its nine snapshot
pages, the three Lido DVT cluster pages, /services/celestia — whose FAQ sections were split by
visible lines (the hero's 7, then 321 on 117 pages; ids in
`backups/removed-dividers-2026-09-25.json`, restorable from Notion's trash). Found by sweeping
every URL in the sitemap for `notion-divider`, which is quicker than walking Notion. **Make space with CSS, and pair things with Notion columns — never
with a divider or an empty paragraph.**

home.css starts with older page CSS, then "HOMEPAGE SECTIONS": the figures, Z (00),
hero, Audience split 51m (07b), testimonials I (09), Why Stake 49b, governance 37h, Services 42w
(09a), Who we are (09b), blog, networks 21b, Contact 48c (16).

home.js is a set of IIFEs: the dial (institutional form), the figures (Z), homepage decks (snapping), the testimonials (I), networks
glyph columns, blog rail (Cover glyphs via CSS mask), services
selection (swaps covers to the original PNG), Why Stake graphics (derived figures), contact copy,
and the audience split's "What you get" as a keyboard button.

**The figures are Z, "Each figure, its own move"** (design *Metrics Patterns*, 2026-10-24, in place of the stat deck).
Four pinned screens on ink `#2A2C28`, each driven by its own run of scroll (home.css 00, home.js "The figures"): **01
Staked** (240vh) types the sum in behind a caret, draws a rule under it and signs it, "Under management by" and the
wordmark; **02 Delegators** (220vh) lights the windows of a skyline, one building a mainnet, the count running with
them; **03 Mainnets** (240vh) turns a wheel of the 28 mainnets' glyphs round the count at its hub, "28 / mainnets", which
runs 1 … 28 with the names, the current one ringed and named; **04
Uptime** (220vh) draws the rule to 99.96% under "Almost always on.", then the two buttons. Names: `#stats` (the band),
`#staked`, `#delegators`, `#mainnets`, `#uptime`, each landing where its move begins.
- **Notion** (`backups/home-figures-band-2026-10-24.json` holds the band before): the band is still the one callout with
  the old two column lists — Staked and Mainnets in the first, Delegators and Uptime in the second — which dissolve, and
  `order` puts the screens in the file's order; the four ids, the two headings site-data writes and the networks count
  home.js sets all kept. Each callout's text became its eyebrow, "01 / 04 · Staked" … "04 / 04 · Uptime" (the file's
  read "01 / 04 · Staked · typed in, then signed", "· one building per network", "· the wheel turns", "· the rule draws",
  and its line under the stake "The scroll types the sum in, a rule draws under it, and we sign it."; both described the
  move rather than the figure and were cut the same day, the user: "yes do that"). Added: "Under management by
  **Encapsulate**" (the bold word is drawn as `svg/wordmark-reversed.svg`, 160px) and "Staked with our validators across
  every mainnet we run."; "delegators", the caption, and the hidden paragraph
  of building heights; "Mainnet validator, in the active set."; and the uptime screen's H3 "Almost **always on.**", "Uptime",
  the figure "99.96%" (recreated after the H3; it was "99.96 %"), "uptime", "Measured across all validators, all
  networks.", "99.96% up", "0.04% down · too thin to draw at this width" and the two buttons, made through the API.
  **Removed: the fifth figure, "Soft Slashing Protection 100 %"**, which Z drops (its column and callout). The stake
  heading lost its space (`$71,482,083`; site-data writes it so since PR #149).
- **The skyline's heights are a hidden paragraph site-data writes** every six hours (`403e800a…2d95`, hidden by id;
  `jobs/homepage/skyline.mjs`): largest first, no names — **Terra's building is the endorsed validator's own delegators
  (3,613 on 24 Oct); the other three Terra validators' delegators are spread over the other buildings in proportion to
  each one's count**, so the buildings still add up to the delegators heading and no figure on the page is theirs (the
  user: "use one actually terra and then distribute the count from other three terra to other networks"; "you dont show
  the other three Terra validators"). Lido DVT, whose stakers cannot be counted, has no building: 27. The pitch search's
  floor is 0.25px, not the file's 1, or a phone's buildings ran off the top of the screen (they did in the file's own
  render at 390).
- **The wheel** is `window.encCounts()` (navbar.js), which now carries each chain's `mainnet` and its testnet row's
  `role` (property-585f6e6c): the mainnets in the set's Order, glyphs at `w=128`. The note's second sentence is that Role
  ("Part of early testnets, still operating.") — **it shows only once Role is switched on for the every-stage view on
  /services** (`3e4e800a…0aa5`, hidden), which the API cannot do. Until then the note is the first sentence alone.
- **The hub** (the file's second pass, the same evening: "the figure, 28, fixed at its hub, so the count is the still
  centre the names turn around"): the heading "28" (Why Stake's script sets its digits from the set) over a new paragraph
  "mainnets" (`403e800a…cbdd3`, added through the API), the pair centred on the wheel's centre from the screen's own
  gutter, `clamp(20px, 5vw, 64px)` — not the band's, which grows past 1856 while the wheel stays on the screen's edge — to
  0.72 of the radius, inside the wells (their inner edge is 0.84). The "01 / 28" index it replaces is gone, and so is the
  `data-enc-z-at` home.js wrote. **The count runs with the wheel**, 1 at the first name and the set's count at the last,
  as the file's script writes it (`String(ci + 1)`); it was built fixed at first, after the file's note ("the figure, 28,
  fixed at its hub"), and the user asked the same evening: "28 mainnets count should increase as we scroll". Why Stake's
  script, which sets the heading's digits from the set, leaves a heading the wheel has run (`.encZ`) and no longer wakes
  on the wheel's name and role; it had put 28 back 60ms after every name.
  The note is four lines high (`6em`, overflow hidden), so a long Role does not move the name; all 28 fit at 320–2560.
  **Under 760px the wheel's radius is `min(26vh, 58vw)`**, not the file's `min(36vh, 30vw)`: that was 117px on a 390
  screen and "mainnets" ran under the wells; 26vh keeps it in its row on a 568 screen.
- **The typing is a reveal, not a split**: the heading keeps its one text node; its ink is a gradient clipped to the
  text that ends at `--z-x`, the typed width measured per character with a Range. The delegators and uptime figures are
  their headings' own text rewritten as they run (Notion's again at the end; Why Stake's observer ignores them).
- **Traps**: the band callout's own `overflow: hidden` (Super's) stopped the stages sticking. The shared screen rules are
  `:where()`-scoped to two classes so each screen's id rules win, and pathed to the band's columns — the uptime screen's
  two button callouts are `.notion-column > .notion-callout` too. The uptime headline spans an `auto` filler row and the
  figure block's three `min-content` rows, which keeps the middle centred (spanning the 1fr space above sat it 50px
  high).
- **Where it departs from the file**, each for a visible fault: the eyebrows wrap under 760px (the file's "02 / 04 ·
  Delegators · one building per network" ran off a 390 screen); the mainnets words take the phone's 20px gutter (the file's column had
  none on its left); wider than 1856px the content keeps 1728px; the two buttons stack under 520px, as every button pair
  on the site does (the file keeps them side by side).
- Reduced motion shows every screen settled (checked with `REDUCED=1 scripts/livecheck.mjs`, new). The deck snapping no
  longer pages the band. `svg/stat-field-*.svg` are unused now.

**The networks band is one screen** (2026-10-24, the user: "make network section fullscreen too and not faded"; design
21b, home-dial.css "NETWORKS COLUMNS", home.js "Homepage networks"): above 900px the row is `100vh` (it was the file's
600px, then 800px) and home.js settles on it like the other one-screen sections; the five columns run its full height
with no fade (the 12% mask at each end is gone), so the discs pass under the ink bands either side. **Removed: the two
empty paragraphs** that sat between the row and those bands (`3dce800a…1b1b` above, `7ebeabfa…60c6` below;
`backups/networks-spacers-2026-10-24.json`), which left 37px of paper each way. Under 900px it keeps its stacked 380px
field, as the other one-screen sections do not fill a phone, with 28px under the buttons (8 while it faded in).
**Found the same day: the row had been wrapping** at every desktop width, the copy on top and the discs 234px wide under
it (measured at 1440 on the release before, so not the day's work): Super's notion.css wraps every column list, and the
disc column's basis was its content's width. `flex-wrap: nowrap` and a basis of 0.

**Why Stake is 49b, "No boxes, one layer less"** (2026-10-25, the user: "implement 49b"): 49a's cards and body paragraph
went (the rows' Body emptied in Notion, `backups/why-stake-49b-2026-10-25.json`); the claims are three columns split by
hairlines under one rule, the figure at 92px, on five rows the columns share — the gallery is one grid and each card's
content a subgrid of it — so the figures, names, leads, graphics and caption lines align across them. Each graphic
stretches to its row (the meter and the bars to the dots' height, or the dots' row to the bars' as the columns narrow);
the open year fills a twelfth per month (home.js). The space under the head is 22vh, 40–220px. Stacked under 960, each
column capped at 520; under 760 the heading is 34px. Our head keeps the lead full width (the user's rule), so the band
fits 1440×900 where the design's runs to 989px; it is 845px at 1280×720 and 847 at 1024×768, still a stop. A rule outside
home.css zeroes the graphic's margin and holds it at its own height (cross-origin, not readable from the page), so
home.css sets both by id.

**Why Stake is one screen above 1024px** (2026-10-24, the user: "make this full height page too Three things worth
checking."; since 49b at every width, `min-height: 100svh`): the band is one screen with its content centred, as Services was until 42w, and
home.js settles on its top. Narrower, the cards stack and it runs 1.8 screens (1024×768), so **home.js's one-screen list
now skips any section over 1.25 screens tall**: settling a reader back to the top of a section they are halfway down is a
trap. Measured at 1024×768, 1280×720, 1366×768, 1440×900 and 1920×1080, the other four stay at 1.00–1.08.

**The blog band is "Blog Highlights", its second pass** (2026-10-24, home-dial.css "BLOG RAIL", home.js "Homepage
blog"). What the file changed: the heading "Latest Blog Posts" became **"Deep dives."** (Notion), the dot pager is gone
(the first file had one; this file has none, so the rail is moved by a swipe, a trackpad or Tab), Read every post sits on
the heading's line at its foot, and the paragraph runs under both at 58ch. The heading and paragraph now take the file's
type (Outfit 62 / Hanken Grotesk 17, #3A3D38), the cards its #2A2C28 and grey mono (the category was the post's tint). The
intro is still Notion's column row: its columns dissolve (`display: contents`) into one wrapping flex row; the paragraph
takes a whole line with its 58ch kept by padding, since a max-width let it climb onto the heading's line when wide. **The
first card starts under the words at every width** (phones had centred it, 21px in at 390) and snaps to that edge.
**Removed: 13 empty paragraphs** — 4 above the institutional form, 6 between it and the blog, 3 between the blog and Who
we are (`backups/blog-spacers-2026-10-24.json`). The space is CSS now, the file's section padding: the form's top margin
and the intro's top padding `clamp(56px, 8vh, 96px)`, the rail's bottom margin `clamp(48px, 7vh, 80px)`, and Who we are
lost Super's 5px top margin. The design's three kickers ("New network", "Analysis", "Informative") are not Notion values:
the cards show each post's Tag, as before. Section name `#deep-dives`, `#blog` kept.

**The audience split is 51m "Two grounds"** (2026-10-14, the user: "implement 51m … in place of
current Hinge · node"). A full-bleed band, paper half and ink half (#2A2C28), a 148px word
on each (Launch., Stake.), one line and one button a side; under 760px the halves stack and the
words drop to 72. What changed in Notion: the claim H2 now reads "For chain teams and delegators"
and is hidden (the design's screen-reader heading; the shared claim was dropped); the column
headings became Heading 3s with the words; the leads became the file's two new lines; the
chain side's kicker reads "For chain teams"; "View Networks" became "View networks"; and each
side's four points moved, unchanged, into a toggle "What you get" under the button. The 51l
blocks are in `backups/audience-split-51l-2026-10-14.json`. **The toggle dissolves**
(`display: contents`), so its summary sits on the button's row and its points open under both —
no script moves anything; Super's own inline `display: none` keeps them closed, so the content
gets no display rule. Super draws the summary as a div that answers a click only; home.js gives it
`role=button`, `tabindex`, Enter/Space and `aria-expanded`. **The word's size** is
`min(148px, 12vw, (50vw - 92px) / 3.3)`: the file's 12% of the band, except just above 760, where
a half cannot hold "Launch." (3.22em) and Super's headings split it mid-word. **One screen and
snapped above 900px** (2026-10-15, the user: "make that section full screen height and snappy too"):
min-height 100dvh and a stop in home.js's one-screen list, as Who we are; 760–900 keeps
the file's 760, and under 760 it stacks. **The band turns scroll anchoring off**
(`overflow-anchor: none`): opening the points lifts the word inside a half that keeps its height,
and Chrome took the word as its anchor and scrolled the page up with it, 204px at 1440 (v359 had it).
**Nothing spaces it from its neighbours** (2026-10-15, the user: "why there is gap above and below
this section?" … "yes remove it"): the three empty paragraphs above it and the four below — 116 and
148px of paper, left from the old layout — were deleted from Notion
(`backups/audience-split-spacers-2026-10-15.json`), and the stats band's bottom margin is 0, so the
band meets the stats band and Why Stake flush. The design asked for paper above the ink half; with
the page snapped a section at a time, the inks meet only mid-scroll.

**Services is 42w "Exploded"** (2026-10-25, the user: "implement 42w", design file "Services Section"; it replaced 42m's
list beside one screen, whose rings, frosted list and ink tokens went with it). From 1200px: the section is 280vh on
paper with a sticky 100vh stage; the head and buttons sit top left, and on the right an exploded stack — our node at the
bottom (the gallery's `::before`: #2A2C28, `svg/mark-reversed.svg` at 22%), then Monitoring stack, Ansible repository,
Bots, Dashboards — pulls apart as the stage runs, each plane's medium and name coming in at its right-hand corner. Each
plane is one element carrying the design's whole transform (rotateX 56, rotateZ −42, translateZ j × gap, about the
stack's centre), so no 3D context is shared and the planes paint in their order. home.js ("Homepage services") sets
`--k`, `--gz`, `--cx`, `--oy`, `--lop` and `data-enc-svc-near` (the caption's first half) on scroll frames, writing
only what differs; the stack's numbers are the design's (comment in home.js). Under 1200px it is the design's flat
list: the head with its buttons on the right (under them below 760), then each tool's name and medium on one baseline,
the description (42ch), the link, and the screen the column wide. Reduced motion: one screen, apart, no pin.

What Notion holds for it (backup `backups/home-services-42w-2026-10-25.json`): the Services Section gallery gained a
**`Link`** text property (Dashboards "Open Tidemark" → tidemark.sui.encapsulate.xyz; the other three → /services#playbooks,
#bots, #monitoring), drawn flat as the design's Tert link — the badge's arrow is ↗ for another site, → for ours, read off
the link's `target`. **It shows only once the property is switched on in the gallery view** (the API cannot). After the
gallery: a callout "The machine" with "Our node" inside it (the node's label; its icon is hidden), and the two captions
"Four tools around every node" and "From your team up to anyone". The node's label and both captions are hidden flat.

**The covers are the design's panels, re-rendered for 42w**: each tool's 860×543 panel from the file, taken at 4× and
saved at 3× (2580×1629) with transparent 12px corners (36 at 3×), put first on each row's Cover with the older files
kept behind. The method is 42m's: save the file and the project's `support.js` side by side with what it references
(`logo/*.svg`, `network-glyphs/06-axelar.png`), render with `scripts/og/render.mjs` and clip each panel's rect. **A new
cover is first served as Notion's signed file URL** (it expires); a second refresh of / served Super's
`assets.super.so` copy, which home.js needs: from 1200px it asks Super's image service at w 1080 (a plane is at most
471px wide), flat it takes the original. **Flat, the screen keeps the panel's 860:543** where the design re-lays each
panel natively at the column's width × 480; on a phone the screen is short and its text small.

**The institutional form is hidden on the homepage** (2026-10-25, the user: "hide the form on homepage, keep its css for now
but hide the form and if we were pointing to that form from anywhere else repoint it to the form on contact us page").
home.css hides block-3dbe…1975; the block stays in Notion and its styles (home-dial.css, home.js's dial) stay. Its links
now go to `/contact#institutional`, the same form in the booking band's fold, which anchors.js opens on arrival: Super's
navbar entry (Networks → Institutional staking) and footer link ("Networks: Institutional staking"), the homepage
contact band's "Institutional intake" button (Notion, `backups/institutional-intake-button-2026-10-25.json`), and
navbar.js's copy and panel for it, re-keyed; an old `/#institutional` or `/#block-…1975` is forwarded (anchors.js,
GONE). Found by sweeping every sitemap page for the id and the name: those were the only links. Services now meets the
blog band directly, which keeps its own space above.

**Governance and Services run on paper one after the other**, with no ink between them.

**Snapping — lessons.** Use native `scrollTo({behavior:"smooth"})` (scripted animation was choppy);
cache stops, invalidate on resize/mutation; trackpad momentum lasts seconds — a new gesture is a
250ms gap, or after a 450ms MIN_LOCK and decay below half peak, a rise 4× the smallest delta (≥20);
one-screen sections (the audience split, Who we are; Services only with reduced motion since 42w) are caught on the swipe within half a
screen, and so is a deck's first panel from above and its last from below (a swipe up out of the
audience split came to rest 306px down the stats' last panel until 2026-10-15); the settle retries. No CSS scroll-snap on html (fights the script). Gesture logic is testable in Node
with a stubbed window.

**A link to a homepage section lands (home.js, v362, 2026-10-18; since 2026-10-23 anchors.js, on every page — `docs/paths-and-404.md`, "Section names").** /#block-<id> is how the site links its sections — the
footer's Team (`#block-3dbe…6994`, Who we are) and Institutional staking (`#block-3dbe…1975`), the navbar's institutional
panel, and /team since the same day — and none of them landed: on a fresh load the browser never jumped (scrollY 0) while
the page grew a thousand pixels as it built, and arriving in the app Super's router jumped early and left Who we are
7,576px below the screen. home.js now puts the section's top at the screen's top (a one-screen section's stop; not Super's
62px scroll-padding — the bar scrolls away), on a load, an in-app arrival (the observer sees the address change), a
hashchange and a click on the section already in the address, retried over 4.5s as chain.js's landHash and dropped at the
reader's first wheel, touch or key. The id is cut at `?`/`&` (livecheck adds `?lc=` after the hash). Measured fresh at
1440, 390, 1920 and 1024, in the app from /services at 1440 and 390 (both sections), the footer link on the homepage, a
wheel during the build (left where the reader went) and a load with no hash (stays at 0).

**/team → Who we are.** /team was a 308 to / (2026-09-28), and a Super redirect only names a page — no address, no
`#fragment` (`SitePage` has `redirectPageId` alone). So /team is a page again, the old Team page (`23cbd131…`, which holds
the same Team database the homepage shows), and anchors.js (home.js until 2026-10-23) forwards it to `/#team` (`MOVED`; `/#block-3dbe…6994` before): it is in the site
head, which Super serves in the HTML, where a page's own head script is only inserted once the app has started. Its page
head (`head/team.html`) holds a `meta refresh` for a reader without JavaScript, `body { visibility: hidden }` and its
canonical on /.

**The testimonials are I, "Portrait and the pile"** (design *Testimonials Patterns*, 2026-10-24, in place of the
deck and its names rail; home.css 09, home.js "Homepage testimonials"). One band on ink, two columns
(`0.9fr 1.1fr`): the current speaker pinned at portrait scale on the left — "Testimonials · 01 / 05", the 200px face, name,
role, the network's well and org — and the gallery's five cards as a sticky pile on the right, step i pinned at
`56 + i·G` (`G = clamp(56px, (100vh − 320px)/4, 96px)`), then a 70vh tail. A step shows its quote whole; as the next
climbs over it, the words fade (`--t-w`, the first 0.4 of the cover) and the highlight slides and scales into the title
row (0.3–0.9), where the title's own copy takes over at 0.92; the last folds on the tail, so the band ends on five lines.
Reduced motion crossfades the phrase. Under 760px the stage sits above and the steps read as a list; nothing folds there
(the file folds the last step on phones too, which would leave its quote faded for good) and the phrase runs inline with
its sentence.
- **Built from Notion**: each Testimonials row's Name, Title (split at its last ", " into role and org), quote and its
  highlight, Photo's first file and Glyph's first file. home.js writes three things Notion has but cannot place: the stage
  (a layer per speaker, the current one shown, `aria-live`), each step's title (a copy of the highlight, trailing
  punctuation dropped; CSS adds the capital and the full stop) and the count after the heading (`data-enc-t-at`). The
  heading "Testimonials" is the stage's eyebrow: a sticky 100vh column whose padding home.js sets (`--t-eye`) to the
  stage's empty first line, so it moves with the speaker's height.
- **Notion, 2026-10-24** (rows before: `backups/testimonial-rows-2026-10-24.json`; log
  `backups/testimonial-edit-log-2026-10-24.json`): each row's Photo and Glyph got the file's face crop and black glyph
  as their **first** file, every older file kept after it; the highlights are now the file's phrases (Stargaze's "an
  excellent validator and contributor", no longer "Highly recommend!"), three of them carrying the stop or comma after
  them, or the inline-block phrase left it to start the next line; full stops before ” on four quotes; "CoFounder" →
  "Cofounder" twice. **Removed: the paragraph "What the teams say."** (`3dae800a…d748`, in
  `backups/testimonials-paragraph-2026-10-24.json`), which I does not have. The names table
  (`3dbe800a…e12`) stays in Notion, hidden by id: deleting a linked view risks its source. Stargaze keeps Notion's
  "They've" where the file has "They have" (the user, 2026-10-24: "no dont change it").
- **Traps**: the card content is Super's `flex: 1`, stretched to the step's foot, which began every step a tenth folded
  (`flex: none`); Super's 4px flex gap put a space before the by-line's comma (`display: block` on the name). The phrase's
  move is measured once per layout with the transform off (not per frame), every read before every write.
- Removed with the deck: home.css's old 09 (the sticky panels, the rail), home-dial.css's "TESTIMONIAL RAIL", home.js's
  rail painter and the testimonials' entry in the deck snapping (no section is paged now but Who we are), and the audit's
  two quote rules (the 700px card rule and the 1100px quote width).

**/#testimonials → the testimonials** (2026-10-23, v381; the user asked for the name, plural; the next hour every major
section of every page got one — anchors.js). Block ids cannot be
renamed, so home.js's `NAMED` mapped the name to the section's block, the callout holding its heading
(`#block-3dae800a51388066…`), and lands it like any `#block-…`; the name stays in the address. Since I (2026-10-24) that
block's top is the band's: the first speaker and the first quote whole, on a phone the heading. Any case, a tracker's `?…` tail ignored, on a hash change and on a click of a link to it on the homepage. No
link on the site uses it yet. The bare id the section has always had is `/#block-6df87cb2d8994ba0b7fe797aa933840d`,
the heading's own.

**Notion forms (§13b)** render natively (no iframe): `div.notion-form__wrapper > form.notion-form >
div.notion-form__field.<type>`; dropdown questions still render as radios (drawn as chips);
"Invalid email" shows on empty fields (hidden while placeholder shows). The dial: a Number question
"Amount" is driven by the slider; choice questions with >6 options become a glyph listbox. React
inputs: click labels, use the native value setter + `input` event; mark with attributes
(`[data-enc-…]`), not classes — React resets className.

**The governance section has no pillars since 2026-10-25** (the user: "do we even need the pillar strip on homepage?").
The four pillars were a strip above the votes (37h's header band, a linked view of the Governance Mechanism database,
block `3b97079…`); the strip was deleted from the page with its 173 lines of home.css, because /governance draws the same
four as its quadrant (Read. Weigh. Listen. Step back.). The lede names them in one line instead: "Read, weigh, listen, step
back: the same four questions before every vote. The six below are the most recent." (it was "The pillars are not a
separate claim from the record — every vote we have cast went through all four. The six below are the most recent.").
The heading, the button and the six rows are as they were; the old blocks are in
`backups/home-governance-pillars-2026-10-25.json`.

**The heading is "Every vote, on the record."** (2026-10-25, the user said yes): it was "Every vote, four pillars
behind it.", which named pillars the section no longer shows; the new one pairs with the split's kicker "The record,
by outcome". Old text in `backups/governance-stray-row-and-home-heading-2026-10-25.json`; the block (and `#governance`)
is the same.

**The vote split fills the strip's place** (2026-10-25, design *Vote Split Patterns*, G3 "Pastel ribbons"; built on
/governance first by mistake — v396 — and moved here the same day, the user: "g3 isnt for /governance, it was the
homepage governance section"). Two paragraphs in the lede's column, after the lede: the kicker "The record, by
outcome" (`404e800a…816a…`, area `skick`) and the line `404e800a…8128…`, "1,911 votes · 1,242 Yes · 78 No · 478 No
with veto · 113 Abstain" (area `split`), which **site-data's count job writes** after every governance run with the
count band's figure. The homepage carries only the past month's rows, so it cannot count the record itself.
governance.js (3b) draws the line and hides it: the record as one trunk that parts into a pastel ribbon per outcome
and straightens to the right edge, each figure inside its ribbon, its digits two-thirds as tall as the ribbon is thick
and centred on it by the digits' measured ink (never under 11px, its size at 1440; smaller only to stay inside the right edge), the total
upright beside the trunk with a rule exactly as long as the trunk is thick. Colours by the line's words: Yes
`#DCEEC7`, No `#F8E8B3`, No with veto `#F7DCE7` (the veto dot's pink), Abstain `#D2E3F6`. **The 729 votes from before
the record are frozen by outcome** (the user chose "474 Yes, 212 No and 43 Abstain", the record's proportions of the
day; the 212 is 30 No and 182 No with veto by the same proportions — site-data `BEFORE_SPLIT`), so only votes added to
the record move it. An outcome the line leaves out has no ribbon (No with veto joins whenever it is not zero). Under
760px the flow runs down the screen, the total in a row above it with its measure under it, each figure under its
ribbon at 30px (smaller, to 18, if the row would not fit; a long word wraps at 9ch). It pours in once (clip-path, 1.6s)
the first time the box is on the screen — the observer watches the box, not the clipped body, which a target's own
clip-path hides from it. Reduced motion, a hidden tab or no IntersectionObserver: whole. A line it cannot read stays
as Notion wrote it. The G3 drawing's kicker adds "· each figure two-thirds as tall as its ribbon", the design describing
itself, left out. Section name `#by-outcome`. **The figures have an 11px floor** (the user, the same day): the drawing scales
down between 760 and 1100px, and with the design's "never clamped up" 78 No came out at about 6px at 800; 11px is
its size at 1440, so a desktop is unchanged, and a floored figure overhangs its thin ribbon by a pixel or two.
