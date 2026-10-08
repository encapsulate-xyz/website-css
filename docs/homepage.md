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

home.css starts with older page CSS, then "HOMEPAGE SECTIONS": stats band/figures/deck (00–00c),
hero, Audience split 51l (07b), testimonials deck (09), Why Stake 49a, governance 37h, Services 42m
(09a), Who we are (09b), blog, networks 21b, Contact 48c (16).

home.js is a set of IIFEs: the dial (institutional form), homepage decks (snapping), networks
glyph columns, blog rail (Cover glyphs via CSS mask, dots), services
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
