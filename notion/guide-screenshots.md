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

The wallet is shot from **its own page in a second window with the `Extension` device** (below),
the dashboard with `Guide dashboard` — one device each, both DPR 2, so neither depends on which
monitor the window is on. 788 rather than 720 (a 1:2 frame): in a
band-height frame 360 × 788 is shown at **99%** — the wallet's 14px type at 13.9px and the 2× file
pixel-sharp — where 360 × 720 in a 1:2 frame is enlarged to 108% and goes slightly soft.

This replaces the 1528 × 800 (1.91:1) canvas of 2026-09-18.

| | Value |
|---|---|
| Dashboard file | **2800 × 1576** (1400 × 788 @2x) |
| Wallet file | **720 × 1576** (360 × 788 @2x), nothing around it |
| Surface treatment | 12px radius, 1px `#D9D9D2` border, **no drop shadow** (the site reserves depth for controls; a surface takes a border) |
| Annotation | one ink ring, 3px outside the control, baked into the capture (see *Annotating*) |
| Redaction | one style for the whole set: same blur radius, or same solid box, never a mix |

## Chrome custom devices

DevTools → Settings → Devices → **Add custom device**. Type is **Desktop** (not "Desktop (touch)" —
touch emulation can kill hover states). Leave the user agent string at its default. **DPR 2** is not
optional: at DPR 1 the captures are soft once scaled into the canvas.

| Device | Size | DPR | For |
|---|---|---|---|
| `Guide dashboard` | 1400 × 788 | 2 | dashboards, explorers, any web page — the capture *is* the slide |
| `Extension` | 360 × 788 | 2 | the wallet's own screens, opened as a page in a second window |

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

### Shooting a wallet step — the wallet's page in a second window (2026-09-23)

The wallet still opens while the dashboard tab is in device mode: `Guide dashboard` emulates the
page, not the browser. So the wallet's own screen is **re-opened as a page with the `Extension`
device**, and device emulation forces DPR 2 on any monitor — no window resizing, no dependence on
which screen the window is on.

1. On the dashboard (with `Guide dashboard` selected), click the button that asks the wallet. The
   wallet opens — its own window, or the side panel.
2. Right-click inside the wallet → **Inspect**, and in that console:
   ```js
   location.href
   ```
3. Open that address in a **second window** (⌘N, so the dashboard keeps its device), and select the
   **`Extension`** device — 360 × 788, DPR 2, Desktop.
4. Check it before shooting: `innerWidth + "×" + innerHeight` → **360×788**, `devicePixelRatio`
   → **2**. A wider width means the wallet loaded its popup layout instead of the panel one.
5. Elements → right-click `<html>` → **Capture node screenshot** → **720 × 1576**. (DevTools'
   ⌘⇧P Capture screenshot is not offered on a wallet target, and the wallet cannot capture itself:
   `captureVisibleTab` needs a permission it does not hold.)

**If the address opens the wallet's home instead of the screen you were on**, that screen belongs
to a pending request and cannot be re-opened. Shoot it where it is: put the window on the Mac's
Retina screen (a wallet window takes the pixel ratio of the screen it is on — on a 1× monitor the
file comes out 360 × 788, not 720 × 1576), size it from its own console with
`chrome.windows.getCurrent(w => chrome.windows.update(w.id, {width: w.width + 360 - innerWidth, height: w.height + 788 - innerHeight}))`,
then Capture node screenshot as above.

### Opening the side panel as a page

Only when `location.href` is not to hand — the set itself is shot from that address (above). Open
**the side panel's own file**, not `popup.html`, with the `Extension` device selected. They are
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

**Check the page before shooting:** run the one-liner in it — it must read `360×788` at
`devicePixelRatio` 2. A wider width means the popup layout has loaded.

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

**One ring per slide, on the one control the step names — baked into the capture.** No chip, no
dim, no arrows, numbers or words: the step's title and body already name the element, and one ring
is the whole vocabulary. A slide with nothing to press gets no ring — except a "check it worked"
slide, which rings the proof (on the delegation guide's last slide: our row in the delegations
list).

**The ring is drawn in the captured page, then shot with it** (the user's choice, 2026-09-22): no
box to measure, store or hand over, and the page just shows the image. The cost, accepted: a new
ring style means reshooting.

| | Value |
|---|---|
| Ring | 2px ink `#000`, no separator |
| Position | **3px outside** the control's box — a gap of the capture's own ground between them |
| Corner | the control's own radius + 5px, so it follows the curve |

Drawn flush inside the control's edge (the first form) it read as the button's own border, and the
.35 paper separator vanished on a light capture; the 3px gap is what makes it a mark.

**Per slide:** pick the control with DevTools' inspect arrow (the element's own line, not a
`::after`), run the saved Snippet `ring` (Sources → Snippets, ⌘↵), check it, then Capture node
screenshot on `<html>`. Running it again replaces the last ring; clear it with
`document.getElementById("enc-mark").remove()`; redraw after any resize.

```js
(b => { const r = b.getBoundingClientRect(), g = 3, rad = [b, ...b.querySelectorAll("*")].map(e => parseFloat(getComputedStyle(e).borderRadius) || 0).find(x => x > 0) || 4, m = document.createElement("div"); document.getElementById("enc-mark")?.remove(); m.id = "enc-mark"; Object.assign(m.style, {position: "fixed", left: r.left - g - 2 + "px", top: r.top - g - 2 + "px", width: r.width + 2 * (g + 2) + "px", height: r.height + 2 * (g + 2) + "px", boxSizing: "border-box", border: "2px solid #000", borderRadius: rad + g + 2 + "px", pointerEvents: "none", zIndex: 2147483647}); document.body.append(m); })($0)
```

It is a separate fixed layer, not a shadow on the control — Keplr's buttons sit in boxes that clip
anything past their edge — and it takes the first rounded corner inside the picked element, so
picking a wrapper still follows the button's curve.

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
