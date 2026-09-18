# Guide screenshots — the capture recipe

Agreed 2026-09-18, **not yet applied to the existing guides**. The problem it solves: a staking
guide mixes dashboards (wide) with wallet popups (small), so screenshots taken ad hoc come out at
a different size, zoom and crop every time. The fix is to decide the frame once and compose every
capture inside it, rather than cropping whatever each app happened to give.

## The two constants

| | Value |
|---|---|
| Canvas | **1528 × 800** (1.91:1 — the ratio the blog covers and the guides picker's answer field already use) |
| Ground | `#F2F2ED` |
| Surface treatment | 12px radius, 1px `#D9D9D2` border, **no drop shadow** (the site reserves depth for controls; a surface takes a border) |
| Annotation | `#99CC66`, 2.1px stroke — the same ring the hero and the drawer draw |
| Redaction | one style for the whole set: same blur radius, or same solid box, never a mix |

## Chrome custom devices

DevTools → Settings → Devices → **Add custom device**. Type is **Desktop** (not "Desktop (touch)" —
touch emulation can kill hover states). Leave the user agent string at its default. **DPR 2** is not
optional: at DPR 1 the captures are soft once scaled into the canvas.

| Device | Size | DPR | For |
|---|---|---|---|
| `Guide 1440` | 1440 × 900 | 2 | dashboards, explorers, any web page |
| `Wallet 400` | 400 × 600 | 2 | MetaMask |
| `Wallet 360` | 360 × 540 | 2 | Keplr |

Capture with ⌘⇧P → **Capture screenshot** (not ⌘⇧4, which gives a different size every time and
carries OS chrome and a window shadow).

### Finding a wallet's real popup size

Right-click the extension's toolbar icon → **Inspect popup**, then in that console:

```js
document.documentElement.clientWidth + "×" + document.documentElement.clientHeight
```

Measured 2026-09-18: **MetaMask `400×600`**, **Keplr `360×540`**. These are the wallets' own layout
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

**Wallet steps — centred, never inset.** The popup sits at **100% of its captured size**, centred
on the canvas, minimum 64px margin. Reasons, in order: each step is one action and an inset makes
the reader hunt for which surface to look at; the picker renders a guide's field at 520×272 and the
cards are smaller again, so an inset popup's 14px type lands at about 5px; and centred is two
numbers to get right every time, where an inset is four and drifts across a set.

Keep an inset in reserve for the single case where the dashboard state must be visible *while* the
wallet is open (a gas figure or validator name the reader is being asked to check). If it appears,
it appears at the same corner and scale every time.

**Never scale a popup to match another wallet's width.** Scaling Keplr's 360 up to MetaMask's 400
renders its 14px type at 15.6px, so text size jumps between steps. Uniform apparent text size
matters more than uniform popup width — and within one guide there is only one wallet anyway, so
the sequence a reader actually sees is uniform by construction.

**If the guides are ever seen side by side** (the gallery, the picker), give the popup a fixed card
to sit in rather than scaling it: a **440 × 640** card, `#FAFAF8`, 12px radius, 1px `#D9D9D2`,
centred on the ground, with the popup centred inside it — MetaMask leaves 20px of padding, Keplr
40 and 50. The card is then what repeats across every guide, and the content inside is allowed to
be its own size. Not needed while guides are read one at a time.

**Vertical overflow:** do not grow the device to fit a long screen — scroll to the part the step is
about. If a step genuinely needs the whole scroll, ⌘⇧P → *Capture full size screenshot*, and then
use that for **every** wallet step in that guide.

## Everything else that has to stay constant

- **Apparent text size**, not zoom level: aim for body text ≈ 14–16px in the finished image. In
  practice the wallet sits at 100% and a dashboard at 80–90%.
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
