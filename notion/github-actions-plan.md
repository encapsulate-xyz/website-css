# The GitHub Actions — the whole plan (not built)

Scheduled jobs that keep the site's data current by writing it into Notion. Discussed with the user
across ten exchanges (2026-09-16 → 2026-09-27); **nothing is coded yet**, and until it is, the values are
updated by hand. The TODO in CLAUDE.md points here.

**Corrected on 2026-09-27.** The first rewrite of this file (earlier the same day) took its language and
repo from the plan of 2026-09-25 evening, which had drifted back to Python and to "this repo or a private
one?" without saying why. What was decided that morning stands: **JavaScript** (after the library
research the user asked for) and **a separate private repo, `site-data`**. The user caught it.

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
| 2026-09-25 (evening) | "list them in a table, across all the pages, and then give me the structure… do not start coding" | The inventory of 26 things that go stale (section 2), four workflows over a package with `config/chains.yml`, one rolling report for everything that is the user's call, and a build order. **That answer drew the structure in Python, inside this repo, and asked again about a private repo — a drift from the morning's decisions, corrected in this file** |
| 2026-09-26 | (the audit's list) "that figure 1882 is fine" | Decided: "1882 · Votes cast since 2020" stays — it counts votes from before the record was kept, which are not rows in the table |
| 2026-09-26 | "add github action in todos too" | A TODO in CLAUDE.md, this file, and a reminder to raise it when the user asks what is left |
| 2026-09-27 | "summarise everything again" · "didn't you say we will use JavaScript?" · "I asked you to check py vs JavaScript" | This file, corrected: JavaScript and the private `site-data` repo, as decided on 2026-09-25 |

## 2. What goes out of date

Checked against the live data; figures as of 2026-09-27.

| # | What | Where it shows | Lives in (Notion) | Today | Source to read | The job would |
|---|---|---|---|---|---|---|
| **Governance** |||||||
| 1 | New votes on the 12 Cosmos chains (Terra, Axelar, Agoric, Passage, Althea, Gravity Bridge, Humans, ixo, Lumera, Sommelier, Gitopia, Chain4Energy) | /governance-record, the homepage table, the Practices menu panel | Governance Record rows (1,153 rows, 29 networks) | Added by hand. Last recorded: Terra 2026-09-11, Axelar 08-28, Agoric 08-24, Passage 07-14; Gravity Bridge 2024-11-28, Sommelier 2024-11-13; Gitopia 2023-06-04, Chain4Energy 2023-04-04; none under Althea, Humans, ixo, Lumera — either no proposals since, or votes missed | Each chain's public API: its proposals, our vote on each, the voting transaction for Proof | Add the missing rows |
| 2 | Protocol upgrades on 9 non-Cosmos chains (Avalanche, Near, Sui, IOTA, Zilliqa, Mina, Starknet, EigenCloud, Monad) | same | same | `gov_upgrades.py` and `gov_proposals.py`, run by hand | GitHub releases, the ACP/NEP/MIP/ELIP repos | Run the existing scripts on a schedule |
| 3 | Votes on Avail, Espresso, Ika, Supra, Vara, Lido DVT | same | same | Not covered at all | Each its own governance (Vara: Polkadot-style referenda) | Later, one chain at a time |
| 4 | The rationale on each new row | same | Rationale | `gov_rationales.py`, run by hand | The row itself | Run after 1–2 (or leave for review — decision 5) |
| 5 | "1882 · Votes cast since 2020" | the record's count band | a typed paragraph | **Decided: stays** (counts pre-record votes) | — | Nothing |
| **Networks set** (47 rows: 27 mainnet, 20 testnet) |||||||
| 6 | Reward rate + Rate updated | /networks, chain pages, the Networks menu panel | Networks set | Set by hand 2026-09-24; rates drift. Mina, EigenCloud, Sommelier deliberately manual | Cosmos: cosmos.directory (free). The other 15 chains each need their own API | **Write** — Cosmos first, the rest one family at a time |
| 7 | Commission | chain pages | Commission | By hand | Our validator's on-chain record | Check and report (decision 3) |
| 8 | Slashing events | chain pages | Slashing events | By hand, by the user's rule: only our own incidents on a live validator (Gravity Bridge 0 by decision) | Slashing events on chain | **Report only** — the user decides what counts |
| 9 | Status (active / jailed) | /networks | Status | By hand | Validator status on chain | Check and report, or write (decision 3) |
| 10 | Unbonding | chain pages | Unbonding | Researched once | Chain staking parameters | Report when a chain changes them |
| 11 | Validators run (Lido DVT 500) | the Lido chain page | Validators run | By hand | Lido's Simple DVT operator #43 | Check and report |
| 12 | Counts typed as fallbacks (27 / 20 / "Thirty-five", `CONTENT`/`FOOT` in navbar.js) | /networks, navbar, /services, homepage | Paragraphs + navbar.js | Go stale when a chain is added | Networks set | Report the drift (navbar.js is code: a PR) |
| **Chain pages** |||||||
| 13 | Chain rules in `chain-pages.json` (minimums, downtime rules, cadence) | chain pages | Row page blocks | Researched once | Chain parameters | Report when they change |
| 14 | Lido / Vara / Chain4Energy buttons point outside the site | those 3 chain pages | Button block | Waiting for their guides | Guides Database | Flag when a guide for one appears |
| **Blog** |||||||
| 15 | Read (minutes) on new posts | /blog "Shortest read" | Blogs → Read | Filled 2026-09-26 for every post | The post's words ÷ 230 | Fill missing or changed ones |
| 16 | Lede, Chain, Ticker, Author on new posts | the post head | Blogs properties | By hand | — | Report missing fields |
| 17 | Mainnet (Live / Not yet launched) | the ask at a post's foot | Blogs → Mainnet | By hand | Networks set Stage | Report when a chain goes live |
| **Guides** |||||||
| 18 | Step / Time on a new guide | /guides picker | Guides Database | Counted by hand | The guide's own slide rows | Fill |
| 19 | Wallet screenshots going stale | guide pages | Slide Cover | By hand | — | Not automatable; could flag old guides |
| **Services** |||||||
| 20 | Dashboards Status (LIVE) | /services | Dashboards → Status | By hand | Whether each Link loads | Write |
| 21 | Playbooks / Monitoring repos (still there? public?) | /services | Repository, Visibility | By hand | GitHub API | Report |
| **Investments** |||||||
| 22 | "we run a validator here" / "not yet in the set" | /investments | Portfolio → Validator | By hand | Networks set | Report mismatches |
| **Homepage** |||||||
| 23 | Why Stake fallbacks ("Six years", "2026 in progress", "25 secured") | homepage | Why Stake database | The script shows the live figure; the typed text goes stale yearly | Date / Networks set | Yearly rewrite (low value) |
| **Site-wide (repo)** |||||||
| 24 | footer.js's 10 glyph URLs, covers.js fallback glyph ids | footer, covers | Code | Drift when a Cover changes | Networks set Covers | Open a PR |
| 25 | Pages running old CSS/JS | every page | — | `paste_table.py`, run by hand | Live HTML vs `head/*.html` | Report |
| 26 | Dead links: Proof, Explorer, guide Links | record, chain pages, guides | Link properties | Not checked (Mintscan already dropped two chains) | HTTP check | Report |

**Watches** (not site data; alerts only): Avalanche's remaining delegation room; unclaimed rewards on
Vara (they expire after 84 eras) and Avail; a validator of ours gone inactive or jailed.

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
- **Guardrails on every write.**
  - A **Rate source** select on the Networks set (Auto / Manual): the job writes only Auto rows. Mina
    (blank on purpose), EigenCloud (no public API) and Sommelier (0% by rule) stay Manual.
  - A **sanity band**: a new rate more than a third away from the current one is held back and flagged.
  - A **history file** (`history/rates.csv`), one line per chain per run, committed in `site-data`.
  - **Plain text only** into Notion (never the annotations read back — the lesson of 2026-09-24).
  - **One Notion writer at a time** (a shared `concurrency` group), under Notion's 3 requests a second.
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
    governance.yml   daily         votes (1) → upgrades (2) → rationales (4)
    networks.yml     weekly        rates (6, write) · commission, status, unbonding, slashing, Lido (7–11, check)
    content.yml      daily         blog Read · guide Step/Time · dashboards status (15, 18, 20)
    audit.yml        daily         links · glyph drift · served tags · fallback counts · watches (12, 24–26)
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

0. Create the private `site-data` repo, rotate the Notion token into its secrets, and settle the open
   decisions below.
1. Port the Notion client and the governance scripts to JavaScript, with `--dry` and the report, and
   put them on a schedule — no new logic, it proves the pipe. Retire the Python copies here.
2. Cosmos votes → new record rows: the biggest manual gap.
3. Blog Read and guide Step/Time.
4. Cosmos network values (rates written behind the sanity band and Rate source; the checks, through
   the decisions list) and Lido.
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

**Open — needed before any code**
1. **Where the private summary goes:** Discord, Telegram, email, or an issue in the private repo (which
   is private too, keeps its history and needs no bot).
2. **Do the research notes move to `site-data`?** (`notion/networks-set-values.md`,
   `notion/chain-pages.json` are about the data, not the design; CLAUDE.md would then point to them.)
3. **Which fields are written and which only reported.** Recommended: write Reward rate + Rate updated,
   Read, Step/Time and Dashboards status; report Commission, Unbonding, Slashing events, Validators run
   and **Status** — a jailing is something to act on before the site says it.
4. **Rotate the Notion token first.** It becomes a secret of `site-data`.
5. **New vote rows: live on their own, or held for approval?** And their rationale: drafted by the
   principle-based lines of `gov_rationales`, or left for the user — it is words in our name.
6. **Public endpoints only, or our own nodes too?** In a private repo our endpoints can sit as secrets;
   public ones are enough to start.
