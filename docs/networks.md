# /networks and the Networks set

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The Network Count band (from "The systems in main.css")

**Network Count (/networks, network.css + network.js; design *Network Count Patterns*, "I · The
hollow", 2026-09-25, v298).** One ink band a screen tall right after the cover (callout
`3dce800a…8154931a…`), replacing the two sticky panels, their rail and fields, the fixed kicker
with its collision rule, and network.js's paging (all removed). The eyebrow is two Notion texts, 26px
down at the band's sides: "Encapsulate · where we run" and "27 mainnets · 20 testnets" (its numbers
from the set). The column list dissolves into one grid: the mainnet Heading 1 as a hollow at
clamp(200px, 38vw, 560px) — the ground-coloured glyph ringed by eight paper text-shadow copies — and
beside it, bottom-aligned, "Mainnets secured", the line "A validator of ours in the active set on
every one of them." with **the tally** (network.js: one #99CC66 stroke per mainnet, five to a gate,
the fifth struck; the count's own), and the testnet callout kept as a row under a hairline: Heading
1 "20" solid and small with "testnets we help"; and a foot, 26px up, "Every network we validate |
Scroll ↓" (a callout of the two texts, `3e6e800a…8105922f…`, the rule drawn in CSS). Removed from Notion: the panels' "01 / 02" and
"02 / 02" and the note "Testnets we joined before there was anything to earn.". Super's heading
anchor span is a flex and grid item — it is taken out of the layout. Under 760 the figure stands
over the rest and the tally goes under its line.
**The lens** (design *Network Count Hollow*, "L2b's lens on I", 2026-09-28, v322): nothing in the band
changes; network.js lays a copy of the figure's digits inside the h1 (`.enc-lens-fill`, same type,
`background-clip: text`) filled with a canvas of the mainnets as pastel wells — the design's
`drawWells()`, cell `min(780, max(280, 56vw)) / 14`, disc .43 of it, glyph 58% of the disc, the set's
Order row by row, each in the pastel of its place in the whole set (`encCounts().list`; the glyphs
from assets.super.so, which allows cross-origin reads, so the canvas can be exported). It shows only
in `circle(120px)` under the pointer; a track 48px inside the band (`.enc-lens-track`, z 3, no
cursor while on) carries the 240px ring (`.enc-lens-ring`), and leaving closes both into the figure's
centre. Built only under `(hover: hover) and (pointer: fine)`. The tally reads the figure's own
digits, not the copy's (it read "2727" once). **The copy's digits are CSS** (`data-digits` + `::before`, v331), so the h1's text is "27" — as text they
were part of the heading and search engines read "2727". **Re-read 2026-09-28 (v332):** leaving, the ring and the
reveal travel into the figure's centre over .36s on one curve (`cubic-bezier(.4, 0, .2, 1)`) and the ring
fades only as it lands (opacity .12s after .24s); while on, both keep .12s ease-out. The lens follows the
pointer through a scroll (the file's `lensAtPointer`): the pointer's last place is kept, and on each
scroll frame the lens goes to it while it is over the track and closes once the page carries the track
away (network.js `follow()`).
**It is a snap stop** (the user, 2026-09-26, v314): one screen tall, and network.js ports the
record's count-band rules (a gesture towards it from within half a screen lands on it, a rest within
a third settles onto it; nothing under 701px or with reduced motion). Driven with real wheel events
in headless Chrome (`livecheck.mjs` `wheel()`) at 1440×900, 1920×1080 and 800×1000.

## The Networks set (2026-09-16)

**A new chain we validate is one run, written down step by step in `notion/new-row-checklist.md` ("Networks set — a
new chain we validate — the whole run")**: the glyph from the chain's own mark, the facts from the chain, both rows
with the Order made room for, the chain page and its Super page, every typed count, what follows by itself (the
counts, the lens, the homepage's network section — checked, not assumed), the site-data configs, its guide from the
template, the card, the refresh — and the L1 openings page, which is validator-research's: tell that session the chain
is ours. **Cosmos Hub went through it on 2026-10-05** (mainnet and
testnet, Order 6 after Axelar, tier high; 28 mainnets, 21 testnets, 36 chains; v349; site-data PR #25; the guide
"Delegate ATOM with Keplr" is Soon until its captures exist).

`Networks set` (`3dde800a…33b7f1…`) replaces the old `Networks` database: **one row per deployment**,
28 mainnet + 19 testnet, from design *Networks Set*. Properties: Name, Stage, Reward rate, Role,
Status, Tier, Order, Cover (glyph, uploaded via the file-upload API), Link. Two gallery views,
Mainnet and Testnet, sorted by Order — so the first twelve cards are the god and high tiers.

- **The set is the design's index** (design *Networks Index*, the ledger variant it renders;
  2026-09-25, v295; it replaced 5g, "the mark bleeding", and the old control bar). A Notion
  **Heading 2, "Every network we validate."**, leads the set (it took the place of an empty spacer
  paragraph) and shares its row with the controls, all built by network.js and hung off the
  collection (the recipe below): the **Mainnet/Testnet switch** — it clicks Super's own view picker,
  which stays in the page hidden (a click on a hidden option switches the view); its labels are the
  views' names, its counts `encCounts()` — the **sort** as the design's listbox (Default, Name A–Z,
  Highest rate, the last on mainnet only) and the **field**. Super's gallery cards are the
  **ledger's rows**, two columns under an ink rule: the Cover glyph at 1.28em, the title at
  clamp(30px, 3.4vw, 56px), and at the far end the rate in mono with a "Reward rate" tip, or on the
  Testnet view "Testnet"/"Also mainnet" (the chain runs both, from `encCounts().list`), "—" for a
  blank rate. Beside them a **sticky stage** filled from the card under the pointer: the glyph (the
  card's `data-full-size` original) in its disc, tinted by the chain's place in the whole set, the
  rate (on testnet the name and the Role), and "Open <chain>" to the row's page (a testnet row
  opens the chain's mainnet page). The fixed labels are CSS `content`, as 5g's "Reward rate" was.
  Traps met: the card's content box is `display: contents` but still the title's parent, carrying
  Super's 12px — `font-size: inherit` on it; the Card System clears the gallery's border, so the ink
  rule needs `!important`; the tips are pinned to the label's right edge, since a centred pill at
  the row's end widened a phone's page by 21px, unseen. The section runs the page's width at the
  design's sides (in the page's 96px margins the columns were too narrow for the names); the ledger
  is one column under 1300px (the design's 1100 broke "Avalanche" at 1280), the stage drops under it
  at 760. Only "Chain4Energy" still breaks mid-word, between 1300 and 1700 — as in the design.
- **The staking properties** stay on the Mainnet view for the chain pages and off the rows.
- **5m, the page's close** (callout `3dde800a…9995f7…`; design *Networks Ask Full*, 2026-09-26, v315 —
  it was *Networks Set v2*'s band for one release, ink with one strip before that): **one screen on
  paper-2 `#F2F2ED`**, full-bleed, padded `clamp(40px, 6vh, 72px) clamp(28px, 6vw, 96px) clamp(36px,
  5vh, 56px)`. At the top the eyebrow, two Notion texts with a 1px `#A5A5A5` rule between them
  ("Encapsulate · Networks" | "For chain teams", mono 11 at .14em, `#3A3D38`); in the middle the ask —
  **a Heading 2** (it was a Heading 3 until 2026-09-26, recreated through the API; network.js finds it
  in the band, not by id) "Thirty-five teams chose us." at `clamp(40px, 6.6vw, 100px)`, .94, 13ch,
  the number rewritten from the set — the line at `clamp(16px, 1.7vw, 21px)`, 34ch, and Book a call
  and What we run at 48px and 15.5px, 28px under it; and filling the foot, window-wide, **the set in
  two rows**: every chain as a name at `clamp(40px, 5.8vw, 88px)` (the file's own step down from 56–124px, 2026-09-27) led by its glyph in a .86em disc of
  its tint, **the god, high and medium tiers on the first row drifting left over 130s, low and filth
  on the second drifting right over 60s** (the tier is never shown). Names rest `#6B6F68`; hovering or
  focusing one fills it with its tint, turns the disc paper and the name ink, and pauses both rows;
  reduced motion stills them; each row's loop copy is `aria-hidden` and out of the tab order.
  The callout's content box is `display: contents`, so its blocks are the band's own grid items (the
  eyebrow row, a spring, heading, line, buttons, a spring, the rows); the springs are the file's
  space-between, never less than its `clamp(28px, 5vh, 56px)` gap. Blocks are placed by what they are
  (the texts before the heading are the eyebrow, the one after it the line), not by count.
  **The chains and their tiers come from the whole set, in its Order**: navbar.js's `readCounts()`
  keeps `list` — every chain once with its glyph, its **tier** (the Tier pill, since v314; a kept
  count without tiers is read again) and the page a mainnet row links to — from the all-stages view
  on /services, and `window.encCounts()` hands it to network.js. A testnet-only chain is a name with
  no link. If the read fails, the rows are drawn from the cards on the page, split at the middle of
  the Order. Measured at 1440×900 (the band exactly one screen, the springs at their gap), 1920×1080
  and 390×844.
- **Every network count is the Networks set's own** (the user, 2026-09-24: one source). Super ships
  only the rendered view's rows, so no page can count the whole set from itself — except /services,
  whose linked view of the set shows every stage with **Stage switched on** (the user did that on
  2026-09-24). `navbar.js` `counts()` fetches /services once per visit (kept 30 minutes in
  `sessionStorage["enc-counts"]`), counts the cards whose Stage pill reads Mainnet or Testnet, and
  the distinct names, and publishes `window.encCounts()` → `{mainnet, testnet, chains}`. Readers:

  | Where | What | Script |
  |---|---|---|
  | navbar, Networks group | "27 mainnets, 20 testnets" (item line and preview), "See all 27" | navbar.js `applyCounts()` |
  | /networks count band | the two figures (27, 20) | network.js `figures()` |
  | /networks 5m band | "Thirty-five teams said yes.", "+23 more" | network.js `figures()` |
  | homepage stats band | "Number of Networks Supported" (27) | home.js, Why Stake IIFE |
  | homepage Why Stake | "27 secured" and the dots | home.js — falls back to the homepage gallery's cards |
  | /services ask | "Thirty-five chain teams…" | services.js — counts its own view of the set |

  Only the digits (or the leading spelled number) are replaced, so the words stay Notion's. **The
  numbers typed in Notion, and CONTENT/FOOT in navbar.js, are the fallback** — keep them right when
  the set changes, since they are what shows if /services cannot be read or before it arrives. If
  the view on /services loses its Stage property, every count falls back. A crawler that runs no script reads the
  typed number: the Why Stake card said "25 secured" beside the stat's 27 until 2026-09-29 (the "No slashing" row's
  Caption right, in the homepage's Why Stake database `bd1e4d48…`; old value in `backups/why-stake-caption-2026-09-29.json`).
- **The old `Networks` database is not to be used for anything** (the user, 2026-09-24) — not for
  values, not for chain pages. Its item pages carry stale "Expected Reward Rate" lists.
- **Every script now prefers this database:** `covers.js` reads it by id, `home.js` uses it when a
  view of it is on the homepage (old gallery is the fallback), `network.js` builds 5m from it.
- **Staking values (2026-09-24):** the 28 mainnet rows carry Address, Reward rate (real, **after
  our commission**, as text), Rate updated, Commission (percent), Compounding (Auto/Manual),
  Unbonding (words), Chain slashes (principal can be taken), Slashing events (applied, any validator
  of ours on the chain) and Explorer — every value read from the chains, with method and sources in
  `notion/networks-set-values.md`. They are **not shown on the Mainnet view** yet; a chain page will
  read them off /networks (the Mainnet tab ships all 28 rows), so they must be switched on there and
  hidden on the cards by network.css (v262: every card property but the title, the rate and the
  role is `display: none`, and a card counts as testnet only when it shows nothing but its name).
  Testnet rows stay empty.
- **Slashing events count only our own incidents on a live validator** (the user's rule,
  2026-09-24): network-wide incidents and old validators we shut down deliberately do not count.
  So the old jailed Gitopia and ixo validators' 0.01% slashes are 0. Gravity Bridge is **0 by the
  user's decision** (2026-09-24), though the chain records three 0.1% slashes on our live validator
  (the bridge module's missed-confirmation penalty) that could not be dated or shown network-wide.
  Agoric lists the "Encapsulate" validator, not the "fka KingSuper" one.
- **Both views must be sorted by Order ascending** — without a sort Notion returns rows in reverse
  creation order, which puts the smallest chains first and gives 5m the wrong twelve marks.
- The old gallery's CSS (pill, pastel tiles, side image; 456 lines) was removed on 2026-09-16: every
  rule used global collection classes and reached the new cards.

## Done — the Networks set's rates are real (2026-09-24)

The design's invented rates were replaced on 2026-09-24 with rates read from each chain (after our
commission, dated in **Rate updated**) for the 28 mainnet rows. Mina, EigenCloud and SSV.network
are blank on purpose — see `notion/networks-set-values.md`. They drift: refresh them by hand or
with the Action below, always with the date.
