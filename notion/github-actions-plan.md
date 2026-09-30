# The GitHub Actions — the whole plan (not built)

Scheduled jobs that keep the site's data current by writing it into Notion. Discussed with the user
across ten exchanges (2026-09-16 → 2026-09-27); **nothing is coded yet**, and until it is, the values are
updated by hand. The TODO in CLAUDE.md points here.

**Corrected on 2026-09-27.** The first rewrite of this file (earlier the same day) took its language and
repo from the plan of 2026-09-25 evening, which had drifted back to Python and to "this repo or a private
one?" without saying why. What was decided that morning stands: **JavaScript** (after the library
research the user asked for) and **a separate private repo, `site-data`**. The user caught it.

**The plan as a page (2026-09-30):** the artifact "Encapsulate Actions Plan", in the paper theme the user asked for, built
by `OUT=<path> python3 scripts/actions_plan/build.py` (its link is in Claude's memory, not in this public file). It
carries this file's sections 2–6 with the day's figures, and the additions of section 7 below.

## 1. What was asked, and what was answered

| Date | The user asked | The answer |
|---|---|---|
| 2026-09-16 | Keep the reward rates current? → "add the github action in todo, for now we will just manually update them" | A TODO: a scheduled Action that fills the Networks set's rates. Cosmos chains are free through `chains.cosmos.directory` (verified); every other chain needs its own API; the job writes Notion, never the page, and dates what it writes |
| 2026-09-17 | (the governance record jobs) | The two governance scripts are already written to run unattended; they belong in the same scheduled job, `--dry` on a pull request, the real write on the schedule |
| 2026-09-25 (morning) | "do not start coding… what do you think would be the best way to do this? like updating values in notion" | One scheduled job in this repo, weekly, with a button to run it by hand. **Three tiers**: it *writes* the numbers that drift (reward rate with its date), *checks but never writes* the ones a person set (commission, unbonding, slashing events, validators run, still active), and *watches* things that are not site data (delegation room, unclaimed rewards, jailing). **Guardrails**: a per-row Auto/Manual switch, a sanity band, a history file. Readers per chain *family*, not per chain. Cosmos votes as new record rows, the rationale left for review |
| 2026-09-25 (morning) | "so you will write the whole logic in github actions themselves or will you run the scripts using the github actions" | **The logic lives in scripts; the Action is a thin scheduler** (~20 lines). Runnable locally with `--dry`, testable reader by reader, portable to a server cron later, and a failed run points at a script and a line. (The scripts were Python in that answer; the next exchange decided the language) |
| 2026-09-25 (morning) | "decide now, do the research work thoroughly and decide whether javascript or python" · "does jsdelivr need the repo to be public? … make the repo private, or use a different repo?" | **JavaScript on Node, plain ES modules, no TypeScript build step** (like `livecheck.mjs`). Every chain family has a maintained first-party JavaScript library; Python has nothing current for Avalanche, Mina, IOTA or Ika and only community ones for most of the rest (table in section 3). The governance scripts are ported to JavaScript when they move. **jsDelivr serves public repos only**, so this repo stays public; proposed a second, private repo for the jobs |
| 2026-09-25 (morning) | "what will be the drawbacks of not creating a new site-data repo? is it sensitive data?" | Almost nothing is secret — on-chain values, addresses and database ids are public; only the Notion token (and any future key or private node endpoint) is, and Actions secrets are masked either way. Drawbacks of staying public: public logs, commit noise, ops visible. Revised then: stay public with three rules |
| 2026-09-25 (morning) | "but then Gravity's 3 slashes would appear, where we show 0" | A **decisions list**: the check knows each chain's accepted history (Gravity Bridge's 3 bridge-module penalties counted as 0; Avail's cancelled offline slash; Gitopia's and ixo's old, shut-down validators) and flags only what is new. Public logs say almost nothing; the details go to a private summary. And because the job compares what the site claims with what the chain says, with the decisions behind it, **it belongs in a private repo** |
| 2026-09-25 (morning) | "so we create a separate repo for the website's updates and keep this one for js and css only?" | **Yes.** `website-css` stays public: everything a browser downloads, and the site tooling. A new private **`site-data`**: the chain readers, the workflows and their secrets, the decisions list, the rate history, and the Notion scripts moved over. One question left: whether the research notes move too |
| 2026-09-25 (evening) | "list them in a table, across all the pages, and then give me the structure… do not start coding" | The inventory of 26 things that go stale (now section 2, extended on 2026-09-27), four workflows over a package with `config/chains.yml`, one rolling report for everything that is the user's call, and a build order. **That answer drew the structure in Python, inside this repo, and asked again about a private repo — a drift from the morning's decisions, corrected in this file** |
| 2026-09-26 | (the audit's list) "that figure 1882 is fine" | Decided: "1882 · Votes cast since 2020" stays — it counts votes from before the record was kept, which are not rows in the table |
| 2026-09-26 | "add github action in todos too" | A TODO in CLAUDE.md, this file, and a reminder to raise it when the user asks what is left |
| 2026-09-27 | "summarise everything again" · "didn't you say we will use JavaScript?" · "I asked you to check py vs JavaScript" | This file, corrected: JavaScript and the private `site-data` repo, as decided on 2026-09-25 |
| 2026-09-27 | "tell me what all numbers and stuff need updating on the website" · "document it all, we will revisit it" | A scan of every page the navbar and footer reach: section 2, what needs updating by hand (with the live value, what keeps it today and how it drifts) and what already keeps itself current, plus four things fixable without the jobs. New since the 26-item table: the homepage's uptime (typed, undefined), the Why Stake heading and its fallback, "1882" not moving with new votes, /security's two "0 slashing events" lines, the /services demo events, the typed fallbacks |

## 2. Everything on the site that changes — the inventory

Every number and fact on the live site that can change, found by scanning the pages the navbar and
footer reach and checked against the scripts (2026-09-27). **Now** is the live value that day. **Kept by**
says what keeps it current today: *hand* (typed in Notion by a person), *your script* (the user's own
tool, outside this repo), *calculated* (a site script derives it from Notion data, so a visitor always
sees the live figure; the typed value is only a fallback), or *fixed* (a fact or a promise that changes
only if we change it). The ids (H1, G1…) are what the workflows in section 4 refer to.

### Needs updating — by hand today

| id | Where | What | Now | Kept by | How it drifts | The job would |
|---|---|---|---|---|---|---|
| H1 | Homepage stats band | Staked Assets Under Management | $ 60,395,092 on 30 Sep ($83,996,080 the day before) | your script, until now | with every price and every delegation; a chain the script cannot read drops out of the total | **Write** (`jobs/homepage/stake.mjs`, 30 Sep): the stake with our validator on every mainnet (`sources/<family>.mjs`), priced on CoinGecko, the heading written when it changes; a chain that fails to read keeps its last good reading (`state/stake.json`, seven days), a stake that moved by more than half is held until a second run reads the same, a total that moved by more than a third is not written — so an outage never shows as a fall |
| H2 | Homepage stats band | Total Customers | 14,720 | your script, until now | every delegation | **Write**: the accounts staking with us on every chain that can tell, summed; a chain that cannot tell (Lido's stakers) counts nothing and the issue says so |
| H4 | Homepage stats band | Uptime | 99.96 % | hand | Nothing computes it, and it has no definition yet (which chains, what window, which source) | Nothing until it is defined; then compute it, or report its age |
| H6 | Homepage, Why Stake | the card heading "Six years" | typed | hand | Wrong from 2027 (the "6" and "2026 in progress" under it are calculated; the heading is not) | — (fix once: "Since 2020", already an open item in CLAUDE.md) |
| H7 | Homepage, Why Stake | "25 secured" | typed | hand (fallback) | Already stale: the script shows 27, the typed fallback says 25 | Report fallback drift |
| G1 | /governance-record, the homepage table, the navbar's latest votes | New votes on the 12 Cosmos chains (Terra, Axelar, Agoric, Passage, Althea, Gravity Bridge, Humans, ixo, Lumera, Sommelier, Gitopia, Chain4Energy) | 1,153 rows over 29 networks | hand | Last recorded: Terra 2026-09-11, Axelar 08-28, Agoric 08-24, Passage 07-14; Gravity Bridge 2024-11-28, Sommelier 2024-11-13; Gitopia 2023-06-04, Chain4Energy 2023-04-04; none under Althea, Humans, ixo, Lumera — no proposals since, or votes missed | **Our votes, not the proposal list** (the user, 30 Sep): for every proposal in its voting period, `GET /cosmos/gov/v1/proposals/{id}/votes/{our validator account}`; a row only where we voted, with the option we chose (a vote through the voting wallet's authz grant is recorded under the validator account and counts). **Daily**: a chain prunes a proposal's votes when its period ends, so a run after that sees the tally but not the voter and falls back to the transaction search, which public nodes also prune. A proposal that closed with no vote of ours found is flagged in the run's issue, so a miss is visible |
| G2 | same | Protocol upgrades voted in by running the release (Avalanche ACPs, Near versions and NEPs, Sui and IOTA versions, Zilliqa and Mina hard forks and MIPs) | | `gov_upgrades.py`, `gov_proposals.py`, run by hand | Every such upgrade; never a plain release (decision 7) | Run on a schedule |
| G3 | same | Votes on Avail, Espresso, Ika, Supra, Vara, Lido DVT | | not covered | Every vote | Later, one chain at a time |
| G4 | same | The rationale on each new row | | `gov_rationales.py`, run by hand | Every new row | Run after G1–G2, or leave for review (decision 5) |
| G5 | /governance-record count band | "1882 · Votes cast since 2020" | 1882 | hand | Right today — 729 votes from before the record + the 1,153 rows (decided 2026-09-26) — but it does not move when a vote is added | Could be calculated as 729 + the rows (governance.js), or updated by the job |
| N1 | /networks, the 27 chain pages, the Networks menu panel | Reward rate + Rate updated | 5.1–5.7 %, 14.1 %, 34.3 %… dated 2026-09-24/25 | hand | Daily | **Write** (behind Rate source and the sanity band) |
| N2 | chain pages | Commission | 2 %–15 % | hand | Only if we change it | Check and report (decision 3) |
| N3 | chain pages | Unbonding | 7 days, 21 days, 2 weeks–1 year… | hand (researched) | When a chain changes its rules | Check and report |
| N4 | chain pages | Slashing events | 0 on every chain | hand, by the user's rule (Gravity Bridge 0 by decision) | Only on an incident | Check against the decisions list |
| N5 | /networks | Status (active / jailed) | | hand | Only on an incident | Check and report (decision 3) |
| N6 | the Lido DVT chain page | Validators run | 500 | hand | If keys are added or exit | Check and report |
| C1 | chain pages | Chain rules: minimum stake, reward cadence, withdrawal times, fees ("1 SUI", "every epoch, about 24 hours", "Lido's 10% fee", "1–5 days") | researched once, `notion/chain-pages.json` | hand | When a chain changes its parameters | Report |
| C2 | the Lido, Vara, Chain4Energy chain pages | the green button points off-site | | hand | When their guides exist | Flag |
| S1 | /security | "0 · slashing events since 2020" (twice) | 0 | hand | Only on an incident; must agree with N4 | Check against N4 |
| S2 | /security | "Routine releases inside 24 h", "emergency releases inside one hour", "24/7 rotation" | | fixed (policy) | Only if the policy changes | — |
| B1 | /blog "Shortest read" | Read (minutes) per post | filled 2026-09-26 | hand | Every new post | Fill |
| B2 | the post head | Lede, Chain, Ticker, Author per post | | hand | Every new post | Report missing |
| B3 | the ask at a post's foot | Mainnet (Live / Not yet launched) per post | | hand | When a chain launches | Report |
| U1 | /guides picker | Step and Time per guide | | hand | Every new guide | Fill (from the guide's own slides) |
| U2 | guide pages | the wallet screenshots | | hand | Wallets change their screens | Flag old guides |
| V1 | /services | Dashboards Status ("LIVE") | | hand | If a dashboard goes down | Write (check each Link loads) |
| V2 | /services | Repository, Visibility of the playbooks and monitoring builds | | hand | If a repo moves or goes private | Report |
| V3 | /services, the bots band | the demo events (go-ethereum v1.17.6, "Proposal 496", current_round…) | typed examples | hand | Look dated as time passes | — (refresh by hand now and then) |
| I1 | /investments | "we run a validator here" / "not yet in the set" | | hand | When we join or leave a chain | Report mismatches with the Networks set |
| W1 | footer, covers | footer.js's 10 glyph URLs, covers.js's fallback glyph ids | | hard-coded | When a chain's Cover is replaced in Notion | Open a pull request on `website-css` |
| W2 | every page | pages running an old CSS/JS tag | | `paste_table.py`, run by hand | After every release until pasted and republished | Report |
| W3 | record, chain pages, guides | dead links: Proof, Explorer, guide Links | | not checked (Mintscan already dropped two chains) | Explorers move | Report |
| F1 | /networks, navbar, /services, homepage, /guides | the typed fallbacks: 27 / 20 / "Thirty-five" / "24 chains · 25 guides" / navbar.js `CONTENT` and `FOOT` | | hand (fallbacks) | Visitors see the calculated figure; these show only if that fails, and go stale as chains and guides are added | Report the drift (navbar.js is code: a pull request) |

**Watches** (not site data; alerts only): Avalanche's remaining delegation room; unclaimed rewards on
Vara (they expire after 84 eras) and Avail; a validator of ours gone inactive or jailed.

### Already kept current — nothing to do

| Where | What | Now | Kept by |
|---|---|---|---|
| Homepage stats band | Number of Networks Supported | 27 | calculated (home.js, from the Networks set) |
| Homepage stats band | Soft Slashing Protection | 100 % | fixed — a promise, not a measurement |
| Homepage, Why Stake | the years ("6", "2026 in progress") and the dots | | calculated |
| /networks | the count band (27, 20), "27 mainnets · 20 testnets", "Thirty-five teams chose us.", the marquee | | calculated from the set, read on /services (navbar.js `encCounts`) |
| Navbar | "27 mainnets, 20 testnets", "See all 27"; the latest votes; the chains with their rates | | calculated / read from Notion |
| /services | the repositories count, "Thirty-five chain teams" | | calculated |
| /guides | the counter "24 chains · 25 guides" | | calculated (guides.js) |
| Governance tables | the rows, the chain marks, the dates | | read from the record |
| Blog, posts | the list, each post's "N min", its next post | | calculated / read from Notion |
| Chain pages | the estimate | | calculated from N1 |
| /investments | the positions, "since YEAR" | | read from Notion; the years are fixed facts |
| Legal pages | "Updated 26 Sep 2026" | | fixed — changes only when the page is edited |

### Fixable now, without the jobs

- **H6** — the Why Stake heading: "Six years" → "Since 2020" (or a heading the script keeps current).
- **G5** — "1882" calculated as 729 + the record's rows, so it grows with every vote recorded.
- **H7, F1** — bring the typed fallbacks in line (25 → 27, and the rest checked once).
- **H4** — decide what uptime means (and its source), or replace the figure — CLAUDE.md's 2026-09-23
  advice for the chain pages was "Validating since" rather than a figure that can go months stale.

## 3. How it works

- **Two repos.** `website-css` (this one) stays **public** — jsDelivr serves public repos only — and
  holds everything a browser downloads plus the site tooling (`build.py`, `paste_table.py`,
  `livecheck.mjs`, `audit.mjs`). A new **private `encapsulate-xyz/site-data`** holds the jobs: readers,
  workflows and secrets, the decisions list, the rate history, and the Notion scripts moved over
  (`notion.py`, the `gov_*.py`, `chain_pages.py`, ported to JavaScript). Anything a browser downloads
  stays here; anything that writes to Notion moves there. Nothing on the site changes when the second
  repo appears.
- **JavaScript on Node, plain ES modules, no TypeScript build step.** Chosen for the chain libraries
  (checked on npm and PyPI on 2026-09-25):

  | Chain family | JavaScript | Python |
  |---|---|---|
  | Sui | `@mysten/sui`, official | `pysui`, community |
  | IOTA (the current network) | `@iota/iota-sdk`, official | none current (`iota-sdk` targets the old IOTA) |
  | Ika | `@ika.xyz/sdk`, official | none |
  | Avalanche | `@avalabs/avalanchejs`, official | none |
  | Mina | `o1js`, official | none |
  | Avail, Vara | `@polkadot/api`, `@gear-js/api` for Vara | `substrate-interface`, community |
  | NEAR | `near-api-js`, official | `py-near`, community |
  | Starknet | `starknet` | `starknet-py` |
  | Monad, Zilliqa, Espresso (EVM) | `viem` | `web3` |
  | Lido | `@lidofinance/lido-ethereum-sdk`, official | none (REST only) |
  | Supra | `supra-l1-sdk` | `supra-sdk` |
  | Cosmos | `@cosmjs/stargate` | `cosmpy` |
  | Notion | `@notionhq/client`, official | `notion-client`, community |

- **The logic is in scripts; each Action only schedules them.** Every job runs on a laptop the same
  way, dry: `node jobs/networks/values.mjs --dry` prints what it would write.
- **Notion is the only thing the jobs write.** The site already reads Notion; Super republishes on its
  own schedule, so data never needs a paste or a release. Code is the exception (the glyph lists in
  footer.js and covers.js): that job opens a pull request on `website-css`. Nothing is fetched live in
  the browser — that would mean cross-site requests, blank figures while loading and keys in the page.
- **Three tiers per value.**
  - *Writes* — what drifts and has one true reading: Reward rate with Rate updated (always together),
    blog Read, guide Step/Time, Dashboards status, new vote rows (decision 5).
  - *Checks, never writes* — what a person set and should hear about before the site changes:
    Commission, Unbonding, Slashing events, Validators run, Status (decision 3).
  - *Watches* — alerts only (section 2).
- **The decisions list** (`config/decisions.yml`): each chain's accepted history — Gravity Bridge's 3
  bridge-module penalties shown as 0 (decided 2026-09-24), Avail's cancelled offline slash, the slashes
  on Gitopia's and ixo's old validators we shut down. A check flags only what goes beyond it: "tell me
  what's new", not "re-argue what we decided".
- **Guardrails on every write** (the user, 2026-09-30: "only update if it changes, and run checks so you
  don't update it with gibberish").
  - **A writer writes only what differs.** It reads the row first and compares; the same value is a no-op
    and leaves no trace in Notion's history. A changed value is written once, plain text, and listed in
    the run's issue as before → after.
  - **Every value passes its check before it is written, or it goes in the email instead.** A rate is a
    number between 0 and 100 with at most one decimal, inside the sanity band; a count is a whole number;
    a date is a real date no later than today; a text (unbonding, a facts paragraph) is built from the
    row's own template and must match the shape of what it replaces; a status is one of the row's
    select options; a reader that answers with nothing, an error page or a number outside its range
    writes nothing and reports. Two readers must agree where two exist (a chain's endpoint and an
    explorer), or the value is held.
  - A **Rate source** select on the Networks set (Auto / Manual): the job writes only Auto rows. Mina
    (blank on purpose), EigenCloud (no public API) and Sommelier (0% by rule) stay Manual.
  - A **sanity band**: a new rate more than a third away from the current one is held back and flagged.
  - A **history file** (`history/rates.csv`), one line per chain per run, committed in `site-data`.
  - **Plain text only** into Notion (never the annotations read back — the lesson of 2026-09-24).
  - **One Notion writer at a time** (a shared `concurrency` group), under Notion's 3 requests a second.
- **Everything is written to Notion, nothing to the site's code.** The pages read Notion at render:
  the chain page decodes its row's properties from the page Super serves (the estimate is stake × the
  row's Reward rate, computed in the browser), /networks and the navbar read the set's cards, the posts
  read their rows. So a value written to Notion reaches the site once **Super refetches the page** — its
  own sync, or the ↻ through its API (item W2) — with no release and no head paste. The only writes that
  touch code are the hard-coded lists (W1: the glyph addresses in footer.js and covers.js, the typed
  lines in navbar.js), which go by pull request, release and head paste.
- **Two outputs.** The run's log says almost nothing ("rates: 12 written, 2 held back; checks: 1
  needs attention"). The details — which chain, what it found, the numbers — go only to the **private
  summary** (decision 1). Nothing prints a comparison in a log.
- **Secrets:** the Notion token (rotated first), a token that may open pull requests on `website-css`
  (for the glyph lists), and later any private node endpoints. Private repos get a monthly allowance of
  Actions minutes (2,000 on the free plan); a few short runs a week use a small share.
- **Readers per chain family, not per chain**, with the methods already researched in
  `notion/networks-set-values.md`.

## 4. Structure

```
encapsulate-xyz/site-data  (private)
  .github/workflows/               thin: when to run, the secrets, one command each
    governance.yml   daily         votes (G1) → upgrades (G2) → rationales (G4) · the 1882 figure (G5)
    networks.yml     weekly        rates (N1, write) · commission, unbonding, slashing, status, Lido (N2–N6, check) · S1
    content.yml      daily         blog Read (B1–B3) · guide Step/Time (U1) · dashboards status (V1, V2) · I1
    audit.yml        daily         glyphs (W1) · served tags (W2) · dead links (W3) · fallbacks (F1, H7) · C1, C2 · watches
  package.json                     the official libraries above; the only dependency file
  lib/
    notion.mjs       the client (@notionhq/client): rate-limited, plain text writes, --dry aware
    report.mjs       the short log line + the private summary
    http.mjs         fetch with retries and fallback endpoints
    history.mjs      appends to history/rates.csv
  sources/           one reader per chain family, all returning the same shape
    cosmos.mjs  sui.mjs (Sui, IOTA, Ika)  near.mjs  avalanche.mjs  substrate.mjs (Avail, Vara)
    evm.mjs (Monad, Zilliqa, Espresso)  starknet.mjs  mina.mjs  supra.mjs  lido.mjs  releases.mjs
  jobs/
    governance/  votes.mjs · upgrades.mjs · proposals.mjs · rationales.mjs   (ported from gov_*.py)
    networks/    values.mjs
    content/     blog-read.mjs · guide-steps.mjs · services-status.mjs · portfolio.mjs · chain-pages.mjs
    audit/       links.mjs · glyphs.mjs · served-tags.mjs · watches.mjs
  config/
    chains.yml       per chain: family, endpoints (with fallbacks), repo, owned vs checked fields
    decisions.yml    the accepted history per chain (Gravity Bridge's 0 and the rest)
  history/rates.csv
  notes/             networks-set-values.md, chain-pages.json — if they move (decision 2)

encapsulate-xyz/website-css  (public, this repo) — unchanged: CSS, JS, dist/, head/*.html, the site tooling
```

A workflow, in outline: on its schedule, on a "Run workflow" button (with a dry-run switch) and on a
pull request (always dry); check out; set up Node; `npm ci`; run one job with the secrets; hand the
summary to the report. About twenty lines each.

## 5. Build order

0. ~~Create the private `site-data` repo~~ — **done 30 Sep** (`github.com/encapsulate-xyz/site-data`, the
   current Notion token in its secrets; rotation later, decision 4). The open decisions are settled below but
   8.
1. ~~Port the Notion client and the governance scripts to JavaScript~~ — **done 30 Sep**: `jobs/governance/
   {votes,upgrades,rationales}.mjs`, `DRY=1`, the report → `out/<job>.md` → one issue a run (`bin/issue.mjs`),
   `governance.yml` daily. The Python copies stay here until the first scheduled run has written.
2. ~~Cosmos votes → new record rows~~ — **done 30 Sep** (`votes.mjs`; first dry run: Lumera #14 missing).
3. Blog Read and guide Step/Time.
4. ~~Cosmos network values~~ — **done 30 Sep** (`jobs/networks/values.mjs`: rates from the sources the rows
   were researched with — staking-explorer's measured APR, cosmos.directory for Gravity Bridge, Chain4Energy's
   minter — behind the one-third band; commission and unbonding written; a jailed validator flagged; the
   chain page's facts paragraph and description rewritten after a write). Lido and slashing still to come.
4b. **The homepage figures** — **done 30 Sep** (`jobs/homepage/stake.mjs`, `homepage.yml` every six hours; the
   user, 30 Sep: "add it too in this repo, we will remove the previous script which is currently working").
5. The audit jobs and the watches.
6. Rates for the other families, one reader at a time, each chain moved from Manual to Auto as its
   reader lands.

## 6. Decisions

**Decided**
- The logic lives in scripts; each Action is only the scheduler (2026-09-25).
- **JavaScript on Node**, plain ES modules, no TypeScript (2026-09-25, after the library research the
  user asked for). The governance scripts are ported when they move.
- **Two repos**: `website-css` stays public (jsDelivr requires it); the jobs go in a new private
  `site-data` (2026-09-25, "the repo split: yes").
- Notion is the only thing the jobs write; nothing is fetched live in the page.
- Logs say almost nothing; details go to the private summary; checks follow the decisions list.
- "1882 · Votes cast since 2020" stays (2026-09-26).
- Until the jobs exist, the values are updated by hand (2026-09-16).

**Decided on 2026-09-30** (the user, in conversation)
1. **The private summary is an issue in `site-data`**, one per run, and **an email only when a run fails
   or a check trips** — the way the other jobs already alert (the user, 30 Sep: "use email instead"; the
   address and how it is sent are the user's to give).
2. **The research notes move to `site-data`** (`notion/networks-set-values.md`, `notion/chain-pages.json`);
   CLAUDE.md points to them.
4. **The current Notion token is used for now**; it is rotated later (the user). It goes into the repo's
   secrets as it is.
5. **New vote rows go live with no review**, rationale included (the user: "no review just update"), and
   **the rationale is written the way every row was written so far**: the principle-based lines of
   `gov_rationales` — chosen by our vote and the kind of proposal, accurate about both, never a specific
   claim, the same line for the same row on every run. No model in the loop (the user: "lets use the same
   method").
7. **An upgrade counts only where running the release is the vote, or where the release carries an
   improvement proposal** (the user, 30 Sep: "only include those upgrades where we vote by upgrade, not
   every release", then "keep the record which were a client upgrade due to an improvement proposal like
   for Monad there was MIP-8"): Sui and IOTA protocol versions, NEAR protocol versions and their NEPs,
   Avalanche ACPs, Mina MIPs and hard forks, Zilliqa hard forks, **Monad releases that activate a MIP**
   (`monad-crypto/MIPs`: v0.13.0 carried MONAD_NINE with MIP-3, 4 and 5; v0.15.0 MIP-12; v0.16.0 MIP-8 as
   MONAD_TEN — the row is titled by the MIP, as an ACP row is), **EigenCloud releases that carry an ELIP**,
   and **a Starknet version the community voted on** (v0.14). A plain client release — Juno's attestation
   updates, a Mina daemon release before the fork, a Monad patch — is not a vote and does not become a row.
3. **Whatever a script can write, it writes** (the user, 30 Sep: "automate more things without manual
   intervention, move things from checks and reports to writes whatever you can"). 28 of the 37 items are (30 Sep, with the homepage's two figures)
   writes now; what stays for a hand is what needs a key, a form or a judgement: the profiles on other
   people's registries and chains, the Discord invite, dead links, wallet screenshots, a post's author, and
   the three alerts. **Every run opens one issue** in `site-data` listing everything it wrote (before and
   after) and everything it could not; **one email goes out only when something drifted that a job cannot
   fix, or the run failed.** No email on a quiet run.
6. **Public endpoints to start**; our own nodes later, as secrets, where a public one is unreliable.
9. **The homepage's staked total and customer count move into `site-data`** (the user, 30 Sep), and the user's
   own script that writes the two headings today retires once the first scheduled run has written. The Lido
   Simple DVT cluster counts in full (500 × 32 ETH), as the 29 Sep measurement did; Lido's stakers cannot be
   attributed to one operator, so they add nothing to the customer count.
10. **A rationale someone wrote is never rewritten by a job**, however short. The Python script's one-off
   tightening of 17 Sep (lead-ins dropped, cut to two sentences) is not repeated on a schedule; the job fills
   only an empty or boilerplate rationale, with the same principle-based lines.

8. ~~Can Super's dashboard token live as a secret?~~ **Settled 30 Sep: no refresh from a job.** The user: "it will
   update sooner or later on its own anyways" — Super's own sync picks the Notion writes up; the dashboard token stays
   out of the secrets. W1/W2 (heads and glyph lists) remain pull requests and the paste routine.
11. **Every exception to a plain reading of a number is written down once**, in `site-data/config/exceptions.md`
   (the user, 30 Sep: "document this … and let me know if we have made any other exception"): which validators are
   ours — **Terra's four** (the endorsed Encapsulate and Luna Whale, Lunatic Validator, Long Live Luna, run by us and
   not endorsed publicly, counted in the homepage's stake and customers), Agoric's two, Lido's cluster in full, the old
   Sui and Cosmos validators left out — Gravity Bridge's slashing 0, the rates set by hand, the record's rules. A job
   applies it; a check never re-argues it; a new exception goes there first.
12. **The customers heading** counts the accounts staking with any validator of ours, every chain summed (14,192 on
   30 Sep; Sui's 7 from Blockberry; Lido's stakers cannot be attributed). The user's own script that wrote the two
   headings is switched off (30 Sep).

## 7. Added on 2026-09-30 — from the work of 28–29 Sep

Read again against Notion and the live site on 2026-09-30, when the plan became a page.

**What moved in section 2**

| id | Now |
|---|---|
| H7 | fixed by hand on 2026-09-29: the typed fallback says "27 secured" (it said 25) |
| N1 | 18 rates dated 2026-09-24, 8 dated 2026-09-29 (the eight whose commission changed), Mina blank on purpose |
| N2 | 2% to 38.72%. **Eight chains' commission changed on chain on 2026-09-29 and the site showed the old figures until a recheck of the profiles found it** — the case for checking commission rather than trusting that it only changes when we say |
| G1 | 1,153 rows over 29 networks; last recorded Terra 09-11, Axelar 08-28, Agoric 08-24, Passage 07-14; ixo 2023-07-19 (the record calls it "Ixo"); none under Althea, humans.ai, Lumera |
| B1, U1 | 38 posts and 32 guides, every Read, Step and Time filled |
| W2 | none: all 111 pages serve the current release (v337) |
| W3 | Agoric's explorer (explorers.guru) went dark and was replaced with Mintscan on 2026-09-29; the 23 private proof links were repaired on 2026-09-28 |

**New rows**

| id | Where | What | Kept by | How it drifts | The job would |
|---|---|---|---|---|---|
| N7 | chain pages | the facts paragraph and `meta:description` of each chain page | `chain_pages.py --facts`, run by hand | whenever N1 or N2 changes (rewritten by hand for eight chains on 2026-09-29) | rewrite it after every write to N1 — `networks.yml` |
| P1 | explorers, wallets, registries | name, description, website and links on every validator profile (the 48-row tracker, `notion/profile-updates.md`) | by hand | an edit on chain, a registry rebuilt from an old file, a pull request left unmerged | read every profile weekly and report what no longer says the agreed values — `audit.yml`, `jobs/audit/profiles.mjs`, `config/profile.yml`. The reads are already written once, as the recheck of 2026-09-29 |
| P2 | every profile, guide and the footer | the Discord invite `PQJX5JVS8h` | by hand | if it is ever revoked | check that it still resolves — `audit.yml` |
| E1 | posts, guides, chain pages | the social card (`meta:image`) and description of a new row | `og_cards.py`, run by hand | every new row | report the rows that have none — `content.yml`, `jobs/content/seo.mjs`. Rendering a card needs Chrome, so the job reports first; making the card in the job is a later step |

The alerts have ids now: A1 Avalanche's delegation room, A2 unclaimed rewards on Vara and Avail, A3 a validator jailed
or inactive. That makes 35 things that go stale and 3 alerts.

**What also moves to `site-data`:** `og_cards.py`, `scripts/validator_profiles/` and `scripts/profile_tracker/` — each
writes to Notion, a chain or the tracker, and none is downloaded by a browser.

**Recommendations for the open decisions** (offered on the page; none is decided): 1 an issue in the private repo;
2 yes, the notes move with the scripts that read them; 3 as written, with commission among the checks; 4 yes, first;
5 the row goes live, the rationale is drafted and listed in the summary for the user to edit; 6 public endpoints to
start.

**One thing the jobs cannot do:** tell Super to refetch a page. That call needs the dashboard's own sign-in, not a
key, so after a write the site follows on Super's schedule (about four hours), as the plan already assumes.
