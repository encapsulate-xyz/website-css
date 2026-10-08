# Governance

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

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
