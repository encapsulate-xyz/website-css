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

**Wallet steps** are **the popup alone, at its native size** — no ground, no canvas — beside the
type, in a frame that **takes the popup's own ratio** (Keplr 360 × 600 → **3:5**, `aspect-ratio:
3 / 5`, or `height: auto`), capped by the viewport's height. Never a fixed 1:2 frame: it
cover-crops ~17% off the bottom of every popup. Centring the popup on a 16:9 ground (the plan
until 2026-09-22) was dropped: in a ~640px frame it puts Keplr's 14px type at about 6px.

| Wallet | Native | DPR | File | Frame |
|---|---|---|---|---|
| Keplr | **360 × 600** | 3 | 1080 × 1800 | 3:5 — ~467 × 778 on a laptop, 14px type at ~18px |
| MetaMask | 400 × 600 | 3 | 1200 × 1800 | 2:3 (its own ratio; a 3:5 frame would crop its sides) |

**DPR 3, not 2, for wallets:** shown ~467px wide on a Retina screen the frame needs ~934 pixels
across; a 2× Keplr file has 720 and looks soft. Capture from the popup opened as a page with the
device selected — Inspect popup captures at the screen's own 2×.

A popup cannot be taller than **600px** (Chrome's cap), so shots of 345 × 690 (1:2) are not native
— they are scaled or cropped windows. Keplr was written down as 360 × 540 on 2026-09-18 and as
360 × 600 from Keplr's own popup size since; **measure before a set** (below) and trust that.

This replaces the 1528 × 800 (1.91:1) canvas of 2026-09-18.

| | Value |
|---|---|
| Dashboard file | **2800 × 1576** (1400 × 788 @2x) |
| Wallet file | the popup at native size @2x, nothing around it |
| Surface treatment | 12px radius, 1px `#D9D9D2` border, **no drop shadow** (the site reserves depth for controls; a surface takes a border) |
| Annotation | `#99CC66`, 2.1px stroke — the same ring the hero and the drawer draw |
| Redaction | one style for the whole set: same blur radius, or same solid box, never a mix |

## Chrome custom devices

DevTools → Settings → Devices → **Add custom device**. Type is **Desktop** (not "Desktop (touch)" —
touch emulation can kill hover states). Leave the user agent string at its default. **DPR 2** is not
optional: at DPR 1 the captures are soft once scaled into the canvas.

| Device | Size | DPR | For |
|---|---|---|---|
| `Guide dashboard` | 1400 × 788 | 2 | dashboards, explorers, any web page — the capture *is* the slide |
| `Wallet 400` | 400 × 600 | 3 | MetaMask |
| `Wallet 360` | 360 × 600 | 3 | Keplr |

Why 1400: Keplr's dashboard changes layout at 1280px (then 1024, 768, 640), so anything narrower
captures its tablet layout. Browser zoom stays at **100%** — zoom changes the app's layout.

Capture with ⌘⇧P → **Capture screenshot** (not ⌘⇧4, which gives a different size every time and
carries OS chrome and a window shadow).

### Finding a wallet's real popup size

Right-click the extension's toolbar icon → **Inspect popup**, then in that console:

```js
document.documentElement.clientWidth + "×" + document.documentElement.clientHeight
```

Measured 2026-09-18: **MetaMask `400×600`**, **Keplr `360×540`** — Keplr's popup is 360 × 600 by its own code, so re-measure. These are the wallets' own layout
sizes (Chrome's hard cap on a popup is 800×600), so they can move with an update — re-run the
one-liner when starting a new guide set.

### Opening a popup as a page

`chrome-extension://<id>/popup.html`, with the wallet device selected.

| Wallet | ID |
|---|---|
| MetaMask | `nkbihfbeogaeaoehlefnkodbefgpgknn` (expanded view: `/home.html`) |
| Keplr | `dmkamcknogkgcdfhhbddcghachkejeap` |

Find any other extension's id at `chrome://extensions` with Developer mode on, or from the URL of
its **Details** page; the right file name is `action.default_popup` in
`chrome-extension://<id>/manifest.json`. Flask/beta/unpacked builds have different ids.

Some wallets detect being opened in a tab and redirect to their expanded view. When that happens,
shoot from **Inspect popup** instead — its DevTools window captures the popup exactly, at DPR 2,
with no chrome.

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

**Within one guide there is one wallet**, so Keplr's 3:5 and MetaMask's 2:3 are never seen side by
side.

**Vertical overflow:** do not grow the device to fit a long screen — scroll to the part the step is
about. If a step genuinely needs the whole scroll, ⌘⇧P → *Capture full size screenshot*, and then
use that for **every** wallet step in that guide.

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
