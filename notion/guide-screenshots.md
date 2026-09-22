# Guide screenshots — the capture recipe

Agreed 2026-09-18, **not yet applied to the existing guides**. The problem it solves: a staking
guide mixes dashboards (wide) with wallet popups (small), so screenshots taken ad hoc come out at
a different size, zoom and crop every time. The fix is to decide the frame once and compose every
capture inside it, rather than cropping whatever each app happened to give.

## Two frames: 16:9 for dashboards, the popup's own shape for wallets (2026-09-22)

**Dashboard steps** are **one file size, 2800 × 1576** (1400 × 788 CSS px at DPR 2), in a frame of
**`aspect-ratio: 16 / 9`**. The frame cover-crops, so the frame and the file must share the ratio
exactly. 25:12 (1400 × 672) was weighed and rejected: it shows 116px less of every screen, runs
tall modals off the bottom more often; its only gain was a shorter frame. 788 is also what a 1440
laptop actually shows once the browser bars take their share, so a step looks like the reader's
screen.

**Wallet steps** are **the wallet alone** — no ground, no canvas — beside the type, in a
**360:788** frame (`aspect-ratio: 360 / 788`), whose height is set by the band (`100vh − 240px`, 778px
on a 1018px viewport) and whose width follows — 355 × 778 there. Centring it on a 16:9
ground (the plan until 2026-09-22) was dropped: in a ~640px frame it puts Keplr's 14px type at
about 6px.

| Wallet | Capture | DPR | File | Frame |
|---|---|---|---|---|
| Keplr and MetaMask | **360 × 788** | 2 | 720 × 1576 | 360:788 |

The wallet is shot in **its approval window**, resized to 360 × 788 (below), and the dashboard with
the `Guide dashboard` device — two separate setups. 788 rather than 720 (a 1:2 frame): in a
band-height frame 360 × 788 is shown at **99%** — the wallet's 14px type at 13.9px and the 2× file
pixel-sharp — where 360 × 720 in a 1:2 frame is enlarged to 108% and goes slightly soft.

This replaces the 1528 × 800 (1.91:1) canvas of 2026-09-18.

| | Value |
|---|---|
| Dashboard file | **2800 × 1576** (1400 × 788 @2x) |
| Wallet file | **720 × 1576** (360 × 788 @2x), nothing around it |
| Surface treatment | 12px radius, 1px `#D9D9D2` border, **no drop shadow** (the site reserves depth for controls; a surface takes a border) |
| Annotation | one ring, drawn by the page over a clean capture from one measured box per slide (see *Annotating*) |
| Redaction | one style for the whole set: same blur radius, or same solid box, never a mix |

## Chrome custom devices

DevTools → Settings → Devices → **Add custom device**. Type is **Desktop** (not "Desktop (touch)" —
touch emulation can kill hover states). Leave the user agent string at its default. **DPR 2** is not
optional: at DPR 1 the captures are soft once scaled into the canvas.

| Device | Size | DPR | For |
|---|---|---|---|
| `Guide dashboard` | 1400 × 788 | 2 | dashboards, explorers, any web page — the capture *is* the slide |

Why 1400: Keplr's dashboard changes layout at 1280px (then 1024, 768, 640), so anything narrower
captures its tablet layout. Browser zoom stays at **100%** — zoom changes the app's layout.

Capture with ⌘⇧P → **Capture screenshot** (not ⌘⇧4, which gives a different size every time and
carries OS chrome and a window shadow).

### Finding a wallet's real popup size

Right-click the extension's toolbar icon → **Inspect popup**, then in that console:

```js
document.documentElement.clientWidth + "×" + document.documentElement.clientHeight
```

Measured 2026-09-22: **Keplr and MetaMask both `360×944`** — the side panel, whose height is the window's, so only the 360 width is the wallet's own. (MetaMask measured `400×600` as a popup on 2026-09-18.) A wallet
can move between popup and side panel with an update — re-run the one-liner when starting a new
guide set; a height over 600 means side panel.

### Shooting a wallet step — the approval window (2026-09-22)

1. On the dashboard (with `Guide dashboard` selected), click the button that asks the wallet —
   the prompt opens in its own small window.
2. Right-click inside that window → **Inspect**. Its DevTools opens as a separate window.
3. In that DevTools' **Console**:
   `chrome.windows.getCurrent(w => chrome.windows.update(w.id, {width: w.width + 360 - innerWidth, height: w.height + 788 - innerHeight}))`
   then `innerWidth + "×" + innerHeight` → **360×788** and `devicePixelRatio` → **2**. A wallet window takes
   the pixel ratio of **the screen it is on**: on a 1× external monitor (1920 × 1080) the capture
   comes out 360 × 788. Drag it to the Mac's Retina screen first (measured 2026-09-22). (run the first line again if a pixel off).
4. **Shoot.** DevTools' own Capture screenshot is not offered for a wallet window ("No commands
   found"), and the wallet may not capture itself (`captureVisibleTab` needs a permission Keplr
   lacks). So, in order:
   - Elements → right-click `<html>` → **Capture node screenshot** (works, 2026-09-22); or
   - in the console, `chrome.windows.getCurrent(w => console.log(\`screencapture -x -R${w.left},${w.top + w.height - innerHeight},${innerWidth},${innerHeight} ~/Downloads/wallet-step.png\`))`
     prints a `screencapture` command for exactly the wallet's area, below the title bar; run it
     in Terminal (main display only). Either gives **720 × 1576**.

Every new prompt opens at the wallet's default size again, so repeat 2–4 each time (↑ in the
console brings the line back). The toolbar popup cannot be sized this way — Chrome caps it at 600
tall — so screens opened from the wallet icon are shot the same way from the expanded window or
the side panel, sized with the same line.

### Opening the side panel as a page

Only for checking a layout — the set itself is shot in the approval window (above). Open **the side
panel's own file**, not `popup.html`, sized with the console line. They are
different layouts: MetaMask's `popup.html` holds itself at 400 wide whatever the device, and only
its side-panel file lays out at 360 (measured 2026-09-22). The file name is
`side_panel.default_path` in `chrome-extension://<id>/manifest.json` (`action.default_popup` is
the popup's).

| Wallet | ID |
|---|---|
| MetaMask | `nkbihfbeogaeaoehlefnkodbefgpgknn` (expanded view: `/home.html`) |
| Keplr | `dmkamcknogkgcdfhhbddcghachkejeap` |

Find any other extension's id at `chrome://extensions` with Developer mode on, or from the URL of
its **Details** page. Flask/beta/unpacked builds have different ids.

**Check the page before shooting:** run the one-liner in it — it must read `360×788`. A wider
width means the popup layout has loaded.

## Composing

**Dashboard steps — the capture is the slide.** No canvas, no crop, no scaling: every dashboard
step is the same 2800 × 1576 file, so text is the same size on every step. If a modal or list runs
past 788, scroll to the part the step is about; never make the device taller.

**A scroll is not a step.** When the button a step is about sits below the fold, capture the
screen already scrolled so the button is in the frame, and put the scroll in the step's text
("Scroll down to Delegate and click it"). A step is one action the reader can get wrong, and the
step count is load-bearing — `guides.js` reads it off the last slide for the picker's Step and
Time. Only if the scroll is itself easy to miss (a modal that does not look scrollable) does it
get the step's Watch note, still not a slide of its own.

**Wallet steps — the popup alone.** Nothing around it: the page draws the surface (12px radius, 1px
`#D9D9D2`) and sets it beside the step's text in the popup's own ratio. Each step is one action; a popup inset
into a dashboard makes the reader hunt for which surface to look at.

Keep an inset in reserve for the single case where the dashboard state must be visible *while* the
wallet is open (a gas figure or validator name the reader is being asked to check). That step is
then a dashboard step (16:9), with the popup at the same corner and scale every time.

**Within one guide there is one wallet**, and every wallet step is the same 360 × 788.

**Vertical overflow:** do not grow the device to fit a long screen — scroll to the part the step is
about. If a step genuinely needs the whole scroll, ⌘⇧P → *Capture full size screenshot*, and then
use that for **every** wallet step in that guide.

## Annotating (agreed 2026-09-22)

**The capture stays clean; the page draws one ring** on the one control the step names — nothing
else. **No chip and no dim** (settled 2026-09-22 with Claude Design): the step's title and body
already name the element, so a label would say it a third time and go stale when the copy changes;
a dim is a second annotation device, and one ring is the whole vocabulary. No arrows, numbers or
words in the image. A slide with nothing to press gets no ring — except a "check it worked" slide,
which rings the proof (on the delegation step's last slide: our row in the delegations list).

A ring baked into the capture (drawn in the page before shooting) was tried and dropped: it cannot
be restyled without reshooting.

**The ring is the handoff's** (*Staking Guide Variation 1d*): a **2px paper `#FAFAF8` border with
a 2px `rgba(0,0,0,.35)` edge outside it** (`box-shadow: 0 0 0 2px rgba(0,0,0,.35)`), 4px radius.
Not green: green is the page's own progress and action colour (the numeral's fill, the badges, the
primary button), so a green ring would read as part of the page rather than the screen. Paper with
a dark edge holds on Keplr's white and on a dark dashboard alike.

**Each slide stores one box, `[x, y, w, h, r]`, in the capture's CSS px** (the 360 × 788 or
1400 × 788 space; the file is 2× that). **Measure it, never estimate it**: pick the control with
DevTools' inspect arrow (the element's own line, not a `::after`), then run this saved Snippet
(Sources → Snippets, ⌘↵) — it prints the box and copies it:

```js
(b => { const r = b.getBoundingClientRect(), rad = [b, ...b.querySelectorAll("*")].map(e => parseFloat(getComputedStyle(e).borderRadius) || 0).find(x => x > 0) || 0, box = JSON.stringify([r.left, r.top, r.width, r.height, rad].map(Math.round)); copy(box); console.log(box); })($0)
```

Measured in the same window at the same size as the capture, the box cannot drift from it; a
reshoot is re-measured the same way in a few seconds. It takes the first rounded corner inside the
picked element, so picking a wrapper still gives the button's radius.

## Everything else that has to stay constant

- **Browser zoom 100%** for every capture. The page sets the display size, never the capture.
- **The state**: same account, same network, same amounts, same light theme, bookmarks bar off,
  clean profile. Nothing breaks a set faster than the balance changing between step 3 and step 4.
- **Step badges** drawn like the site's — `guides.js` reads the step count off the badge in each
  guide's final slide, so the style is load-bearing, not decoration.

## Where the files go

Guide images are **content**: they live in Notion, not in this repo (see "Where each asset comes
from" in CLAUDE.md). Two things that have bitten before:

- `guides.js` takes Step and Time from each guide's final slide in **gallery order, not filename
  order** — number the files `01…n` *and* check the order after upload.
- The Guides gallery view must show Networks set, Wallet Set, Step and Time for the picker to read
  them; Notion's API cannot switch view properties on.
