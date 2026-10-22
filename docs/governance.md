# Governance

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## The count band — one vote, pulled back to the record (2026-10-21, design *Governance Count Patterns*, W)

The one-screen band with its grid of grey dots (and its snap) was replaced by the design's W: a **420vh run with a
sticky stage on ink**, the field drawn on a canvas by `governance.js` (section 1), the design's script ported with its
arithmetic unchanged. Four frames, each held a moment: the record's **second-newest** vote alone, its face in full
(glyph, "Axelar 499", title, our reason in quotes, our answer in an ink pill), alone; it and the votes either side; its
block of a hundred, alone; the whole field at rest, as many blocks to a row as fill the stage. The three zooms between them are at
0.06–0.22, 0.34–0.6 and 0.7–0.94 of the band's scroll. The figure counts up with the scroll (1, 3, 100, the total) and
never says more than the votes wholly on screen; the lines beside it change at 1, 2, 100 and the total. At rest a
hovered block shows its count in the house tooltip (mouse only). Reduced motion shows the field at rest with no faces.
No breakpoint: the field is fitted to any stage, and **at rest it always spans the stage, margin to margin** (the
user, 2026-10-22: "dots always take the full width ... so that screen always looks full"). The design kept 14 between
blocks and so stopped short wherever the height set the size: at 1920×985, seven blocks to a row ended at 1530 of
1856. Now, for each number of blocks to a row, the marks are as large as the 14 allows, then the gaps between blocks
open until the field meets both margins, and between rows (up to 28) to fill the height; the largest marks win, a gap
past 28 counting against them (by the square root) and an empty place in the last row 3%. Measured: 8 to a row at
1920×985, 1536, 1366 and 1280; 7 at 1728, 1440 and 1024; 10 at 2560×1080; 5 at 768; 4 at 390 — all full width. The
design's cap (marks at most twice the record page's) is gone, so a large screen gets larger marks. The tooltip's hit
test uses the opened gaps (`S.px`, `S.py`); each block owns half the gap around it.

- **Words.** The band's paragraphs, in order: "The record" (kicker), the figure (site-data's `count.mjs`, 729 + the
  rows, by its block id — untouched), "Six years of votes." (the last beat; governance.js rewrites the number of years
  from the newest vote's year minus "first year"), "Every one went through all four pillars below.", and "Scroll to
  pull back" (the cue). Everything else is the **"Count band copy"** toggle after the callout
  (`400e800a…81f8…`, hidden by id in governance.css): `one`, `one line`, `many`, `many line`, `block`, `block line`,
  `first year`, `place`, `tip`, `label`, with `{vote}`, `{answer}`, `{date}`, `{after}`, `{before}`, `{n}`, `{total}`
  filled from the rows. governance.js carries the same lines as its fallback. Removed on 2026-10-21 (backup
  `backups/governance-count-band-2026-10-21.json`): "Encapsulate · " from the kicker, "Votes cast since 2020." (now the
  years line), "Most validators never publish theirs." and the legend "One mark per vote · one block per hundred".
- **"A block is a hundred." shows one block** (the user, 2026-10-22: "when we say a block is a 100 there is only a
  block on the screen"). The design's frame shows the block with its neighbours: at 1728 the next block sat almost
  whole beside it and the next row peeked in below, so the frame read as "blocks", not "a block". The rest of the
  field now dims to 14% (`ALONE`) as the zoom to the block starts — none of it is on the screen yet, checked at 1728
  and 390 — and comes back in the first third of the pull back to the record, before the figure counts it (a dimmed
  mark is not counted). Faint rather than gone, so the pull back still reads as the camera moving out over a field
  that was there; `ALONE = 0` would show the block on bare ink.
  **The first frame does the same for the one vote** (the user, same day: "can you do the same effect for this
  screen, just focus on the one"): the votes either side of Axelar 499 are shadows at "This is one vote.", their
  faces too, and come back in the first third of the move to the three votes, before the figure reaches 2. One
  rule for both (`iso0`, `iso2`; `lo..hi` the marks in focus).
- **Every mark is a vote, and the newest are the record's rows**, read off the table on the page (newest first by
  Recorded, whatever the sort control has done), each in its network's pastel — `tintFor`, the colour of its disc in
  the rows below. The 729 votes from before the record have no row and so **no network on file**; they are the
  oldest marks, at the end of the field, and take the design's own seeded draw of the five pastels (seed 1882, its
  generator, one draw per mark), so a colour there says "a network", never which. v367–v368 drew them in paper at 32%;
  the user, 2026-10-22: "not all of the dots are colored". A face reads its own row; a mark with no row would show its
  place ("Vote 12"), which no frame comes close enough to show.
- **The callout is the run from the first paint** (420vh, no padding, `overflow: visible` — a clipping callout would
  stop the stage sticking), so nothing below it moves when the script builds. Until then its content is a sticky
  screen showing **the kicker alone**, where the stage puts it (measured equal at 1728, 1280 and 390); the figure and
  the lines wait for the script. They used to show as the last beat, and on this page the script runs only once the
  3.7 MB document is parsed (2–4s in a real Chrome), and again for a moment when React swaps the band out after load
  — so a reader scrolling in met Notion's "1909" before the run's "1" (the user, 2026-10-22: "when i scrol from
  cover to count page, i see 1909 first and then it changes into 1"). Built (`[data-enc-count]`), the content is
  hidden and the stage is appended inside the callout. With no script the band is an ink run with its kicker.
- The glyphs on the faces come from the page's galleries (`glyphs()`) through Super's optimizer at 384px; the six
  the first frames show are fetched as the band is built.
- **Its classes are `enc-count__*`, never `enc-rec__*`.** v367 called the band's header `.enc-rec__head`, the name
  governance.js already gives the pillars band's head (heading, lede, "Ask about a proposal"); the band's
  `position: absolute` pinned that head over the cover until v368 (the user: "check the page there are many issues").
  Before naming a class in this file, grep governance.js and governance.css for it.
- **One gesture, one count** (the user, 2026-10-22: "when i scroll from 100 to total count after the total count is
  reached it starts scrolling the page ... shouldnt it stop at the top count and then only scroll the page if the user
  lift the finger and scroll again", and "same thing should happen at one"). The counts were only held stretches of
  the run (6% at 1, 12% at 3, 10% at 100, 6% at the total before the band ends): a swipe a hold happened to swallow
  seemed to stop, a longer one ran through, and at the total it ran into the page. `countWheel` now takes a wheel or
  trackpad gesture that starts within 1.5 screens of the run from its first event, moves the page by its deltas
  itself (the zoom still follows the finger; a mouse notch, 60px or more, is eased by the browser), and on reaching a
  count stops a pixel inside the far end of that count's hold and swallows the rest of the gesture (home.js's
  new-gesture test). A pixel inside, because on the hold's edge the scroll rounded short and the figure read 99 for
  100. From above it stops at 1; after the total the next gesture leaves the band; going up it stops at the total,
  100, 3 and 1. The first event matters: Chrome lets a page cancel the rest of a gesture only if it cancelled the
  first. Touch, keys and the scrollbar scroll freely; a flick started further than 1.5 screens away is not ours and
  can still run through. Checked with simulated trackpad swipes (a finger ramp and a momentum tail), flicks three
  times as hard, and mouse notches, down and up, at 1920×985.
- **The band is built after the pager** (2026-10-22, the user: "it takes some time to load sometime i just see an inked
  page with no disc on it"). `build()` ran `rows(); count(); …; apply()`, and `count()` measures its header — which
  lays out the whole page, and with all 1,181 rows still showing that took 0.73s on the first build and 1.06s on the
  rebuild after Super redraws the page (React's hydration swaps the band), the band bare ink meanwhile. Profiled with
  long-animation-frame entries on a fresh load: governance.js 2.3s of main thread, Super's own scripts 0.25s. Now
  `rows(); head(); controls(); pager(); apply(); count(); …`: count() 0.1s and 0.15s, governance.js 0.6s in all,
  DOMContentLoaded at 1.3s instead of 2.5s (headless, 1920×985). The built page is the same element for element
  (38,123, one signature). Any new measure in this file belongs after `apply()`.
- The canvas draws in the scroll event itself (the design's note: a frame callback can be held back) and skips a
  draw while the band is off the screen. Measured idle at 1440: no mutations of ours in 3s.

## The governance page's last two sections (2026-09-19, design *Governance Record Wow*)

**The pillars are a quadrant**: a 2×2 of pastel fields, each carrying one word at display scale
(Read. / Weigh. / Listen. / Step back.), the number in mono at the top right, the question and its
line at the foot, and an ink "then / Vote" disc at the crosshair. The word is a **Word** property on
the `Governance Mechanism` database (added 2026-09-19); **it has to be switched on in the record
page's gallery view by hand** — the API cannot change a view. Without it the field still reads
(number, question, line), so it degrades rather than breaks. `governance.js` marks each card's text
properties by view order (`data-enc-pillar="title|line|word"`) so no CSS depends on Super's property
hashes. The handoff's `auto-fit` track expression resolves its percentage against the wrong box
inside a Notion collection and gave four tracks in a row — the 2×2 is stated outright instead.

**The record is one line per ballot** (revised by the record handoff of 2026-09-26, v301): five
tracks — the chain's 30px mark, the proposal, Our vote as a mono capsule, the date as the file
prints it ("Sep 11, 2026", shortened by governance.js; the sort reads the day kept in
`tr[data-enc-t]`), the arrow — `30px minmax(0,1fr) auto minmax(0,auto) 20px`, 18px apart. **The
table is the grid and every row a subgrid** (`thead`/`tbody` are `display: contents`), so capsules
and dates line up down the page and under the header; the file draws each line as its own grid.
**The line is two targets:** the left (mark, title with a ± after it, CHAIN · reference) is a
`button.enc-rec__open` governance.js lays over the title cell — it opens the rationale beneath the
line, one row at a time (`tr[data-enc-open]`, `aria-expanded`, `aria-controls` on the rationale
cell); the right (capsule, date, arrow) is the Proof link, whose cell spans those three tracks and
whose `::after` fills it. Either one hovered or keyboard-focused, or the row open, darkens the rule
and turns the capsule and the reference line ink. **The dot is by the vote's word**
(`td[data-vote]`), not Notion's option colour: No is pink in Notion and drew as a veto until v301.
Ten rows a page. The empty state is the shared empty set (see the filter bar). On a phone the rationale
is collapsed too — a tap is a press.

**The homepage's view of the record is filtered to the past month** (the user set it, 2026-09-28: "Recorded is within
past month"), not limited by a load count: Super ignores Notion's load limits while its own "load limits" option is off,
and switching that on would cut the record, the blog and the network lists too. Remove the filter and the homepage
carries all 1,150+ rows again (about 4 MB); a month with no vote would show fewer than six.
**The homepage's table is the same component** (the user, 2026-09-26, "in line fully"; v304). Both
tables are views of the one database, so `governance.js` builds both (`ROW_TABLES`: the record, and
the homepage's `4529386b…` with its first six rows only) and **main.css §13d** draws both, keyed by
`[data-enc-rows]`, which governance.js sets. What each page keeps: governance.css the record's
filter bar, pager, empty state and group headings; home.css the six-row limit and the section's
grid area. home.js's own 37h builder (`.enc-chain`, `.enc-gov__*`, tint by row) and home.css's 330
lines of row rules were removed. The disc's tint is per chain on both (`tintFor`). **The homepage
view must show Rationale** for its rows to open — a row with no rationale cell gets neither the
button nor the ±. Moving the rules was proved by snapshotting 87 elements' computed styles on the
record at 1440 and 390 before and after: no difference. The disc's glyph now comes from the page's
galleries or covers.js's `encGlyphs()`, re-read when more cards arrive, and a disc still waiting is
filled on later passes (up to 12 at 300ms).

**The date column's header is "Recorded"** (the property was renamed on 2026-09-26).
`governance.js` and `scripts/notion.py` `date_prop()` accept "Voted on" too.

## The governance record — how it is filled (2026-09-17)

The record is a Notion database, `Governance Record` `c458e5dd…`, read by the homepage's 37h table
and by /governance-record. Two jobs keep it current, both in `scripts/` and both re-runnable:

| Script | What it does |
|---|---|
| `scripts/notion.py` | the shared client. Token from `NOTION_TOKEN`, else `~/.notion-covers-token`. Never print it |
| `scripts/gov_rationales.py` | writes **Rationale** on every row |
| `scripts/gov_upgrades.py` | adds the upgrades on the god and high tier chains that asked something of the validator |
| `scripts/gov_proposals.py` | turns those rows into improvement proposals (ACP/NEP/MIP/ELIP), and retitles the rest |

**Rationales.** A rationale that already says something specific is kept and tightened — the
lead-ins ("Encapsulate votes YES because…", "We're in favour of…") dropped, cut to two sentences —
unless dropping the lead-in would leave the proposal's own title standing as the reason, in which
case the original wording stays. Boilerplate ("We support this proposal.", "Malicious Proposal.")
and empty ones are written from the vote and the proposal's type: upgrades, parameter changes,
spends, contract work, IBC repairs, signalling, and the scam airdrops that are vetoed. The wording
is picked by a hash of the row id, so a row always gets the same line and a re-run is a no-op.
The lines are **principle-based**: accurate about the vote and the kind of proposal, never claiming
a specific action we cannot evidence. 2026-09-17: 1,106 rows — 465 tightened, 641 written.

**Upgrades.** What counts is the user's rule (2026-09-17, sharpened 2026-09-30: "only include those
upgrades where we vote by upgrade, not every release", and "keep the record which were a client upgrade
due to an improvement proposal, like Monad's MIP-8"): a release counts only where **running it is the
vote** (a protocol version on Sui, IOTA and NEAR; an ACP on Avalanche; a hard fork on Zilliqa and Mina)
or where it **carries an improvement proposal** (a Monad MIP from `monad-crypto/MIPs` — one row per MIP,
titled by the proposal, as an ACP row is; an EigenCloud ELIP; a Starknet version the community voted
on). A plain client release never becomes a row. **On 2026-09-30 the record was brought to that rule**
(backup `backups/governance-upgrade-rows-2026-09-30.json`): Monad's two release rows became MIP-12
"Decrease Block Time" (v0.15.0) and MIP-8 "Page-ified Storage State" (v0.16.0, MONAD_TEN); MONAD_NINE's
three MIPs (3 Linear Memory, 4 Reserve Balance Introspection, 5 Fusaka EIP Activation, v0.13.0,
2026-03-04) were added; Starknet's two Juno attestation updates and Mina's two daemon releases (3.3,
3.4) went to Notion's trash; the Starknet row reads "Starknet v0.14.0 upgrade". Weekly maintenance
releases, rc/alpha builds and testnet-only tags are left out as before. Every source is a public GitHub
releases API and needs no key (`GITHUB_TOKEN`, if set, only raises the rate limit — `gh auth token`):

| Chain | Repo | What marks a row |
|---|---|---|
| Avalanche | `ava-labs/avalanchego` | notes say "must upgrade"; the named upgrade (Helicon, Granite, Fortuna) is in them |
| Near | `near/nearcore` | "protocol version N", and the date voting opens — NEAR counts a validator's vote only if it already runs the code |
| Sui | `MystenLabs/sui` | `mainnet-*` with "Protocol Version: N"; two thirds of the stake vote the version in |
| IOTA | `iotaledger/iota` | `[Mainnet]` releases, same shape |
| Zilliqa | `Zilliqa/zq2` | notes contain a hard fork |
| Mina | `MinaProtocol/mina` | a release whose **name** says stop slot, hard fork or Mesa (the daemon releases between forks mention the fork in their notes and are not votes) |
| Starknet | `NethermindEth/juno` | a breaking release whose notes carry a Starknet version ("Starknet v0.14"), the upgrade the governance voted on |
| EigenCloud | `Layr-Labs/eigenlayer-contracts` | the named protocol releases (their ELIPs) |
| Monad | `category-labs/monad-bft` | a release whose notes name a MIP: one row per Final MIP, title and proof from `monad-crypto/MIPs` |

**The date is the release's own date**, or the day voting opens where the notes give it — never
today's. On a chain with no on-chain vote the row is YES because running the release is how support
is expressed, and the rationale says so. Rows are matched by (Chain, Proposal Title), so re-running
adds only what is missing. `--dry` prints without writing. A row may still predate our deployment
on that chain — the script cannot know, so check new rows before publishing.

**Proposals, not releases (2026-09-17).** The record is a record of *votes*, so a row has to read
as the proposal it is. `scripts/gov_proposals.py` rewrote what `gov_upgrades.py` had written:

| Chain | Where the reference comes from |
|---|---|
| Avalanche | the release note lists the ACPs the upgrade activates → one row per ACP, titled from the ACP's own README (`avalanche-foundation/ACPs`) |
| Near | nearcore notes link the NEPs a protocol version stabilises (`near/NEPs`) |
| Mina | the Mesa hard fork carries MIP-0006…0009 (`MinaProtocol/MIPs`) |
| EigenCloud | each core release implements named ELIPs (`eigenfoundation/ELIPs`) |
| Sui, IOTA, Zilliqa, Starknet, Monad | no proposal document — the vote is the protocol-version vote itself, or running the fork build. The reference stays empty and the row is titled as the protocol change, never as a release tag |

**A dry run lists a candidate for every release the rule admits that has no row of the same title** — and
`gov_proposals.py` retitles rows after they are added, so the dry run of 2026-09-30 named 48 "missing" rows
that are all already in the record under their proposal's title (Sui/IOTA/NEAR versions, Zilliqa forks,
the EigenCloud ELIP releases). The port to `site-data` should match on (chain, reference or version), not
on the title, and use each chain's own "since" (`notion/chain-pages.json`) rather than 2025-01-01: the one
true candidate left, "Starknet v0.13.4 upgrade" of 2025-02-19, predates that check.
`Proposal Id` is **rich text** now (it holds "ACP-176"), which makes the id, the proof and the
rationale all `td.text`. Both tables therefore tag their cells from the **header labels**
(`governance.js` `columns()`, `home.js` `mark()`) and order on `[data-enc-cell]` — Notion's type
classes and `nth-of-type` cannot tell those three columns apart.
