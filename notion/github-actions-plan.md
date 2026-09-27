# The GitHub Actions — the whole plan (not built)

Scheduled jobs in this repo that keep the site's data current by writing it into Notion. Discussed with
the user across five exchanges (2026-09-16 → 2026-09-27); **nothing is coded yet**, and until it is,
the values are updated by hand. The TODO in CLAUDE.md points here. Rewritten on 2026-09-27 as one
document: what was asked, what was answered, and the plan those answers add up to.

## 1. What was asked, and what was answered

| Date | The user asked | The answer |
|---|---|---|
| 2026-09-16 | Keep the reward rates current? → "add the github action in todo, for now we will just manually update them" | A TODO: a scheduled Action that fills the Networks set's rates. Cosmos chains are free through `chains.cosmos.directory` (verified); every other chain needs its own API; the job writes Notion, never the page, and dates what it writes |
| 2026-09-17 | (the governance record jobs) | The two governance scripts are already written to run unattended; they belong in the same scheduled job, `--dry` on a pull request, the real write on the schedule |
| 2026-09-25 (morning) | "do not start coding… what do you think would be the best way to do this? like updating values in notion" | One scheduled job in this repo, weekly, with a button to run it by hand. **Three tiers**: it *writes* the numbers that drift (reward rate with its date), *checks but never writes* the ones a person set (commission, unbonding, slashing events, validators run, still active), and *watches* things that are not site data (delegation room, unclaimed rewards, jailing). **Guardrails**: a per-row Auto/Manual switch, a sanity band, a history file. Readers per chain *family*, not per chain. Cosmos votes as new record rows, the rationale left for review |
| 2026-09-25 (morning) | "so you will write the whole logic in github actions themselves or will you run the scripts using the github actions" | **The logic lives in Python in the repo; the Action is a thin scheduler** (~20 lines). Runnable locally with `--dry`, testable reader by reader, portable to a server cron later, and a failed run points at a script and a line |
| 2026-09-25 (evening) | "list them in a table, across all the pages, and then give me the structure… do not start coding" | The inventory of 26 things that go stale (section 2), four workflows over a `jobs/` package with `config/chains.yml` (section 4), one rolling issue for everything that is the user's call, and a build order |
| 2026-09-26 | (the audit's list) "that figure 1882 is fine" | Decided: "1882 · Votes cast since 2020" stays — it counts votes from before the record was kept, which are not rows in the table |
| 2026-09-26 | "add github action in todos too" | A TODO in CLAUDE.md, this file, and a reminder to raise it when the user asks what is left |

## 2. What goes out of date

Checked against the live data; figures as of 2026-09-27.

| # | What | Where it shows | Lives in (Notion) | Today | Source to read | The job would |
|---|---|---|---|---|---|---|
| **Governance** |||||||
| 1 | New votes on the 12 Cosmos chains (Terra, Axelar, Agoric, Passage, Althea, Gravity Bridge, Humans, ixo, Lumera, Sommelier, Gitopia, Chain4Energy) | /governance-record, the homepage table, the Practices menu panel | Governance Record rows (1,153 rows, 29 networks) | Added by hand. Last recorded: Terra 2026-09-11, Axelar 08-28, Agoric 08-24, Passage 07-14; Gravity Bridge 2024-11-28, Sommelier 2024-11-13; Gitopia 2023-06-04, Chain4Energy 2023-04-04; none under Althea, Humans, ixo, Lumera — either no proposals since, or votes missed | Each chain's public API: its proposals, our vote on each, the voting transaction for Proof | Add the missing rows |
| 2 | Protocol upgrades on 9 non-Cosmos chains (Avalanche, Near, Sui, IOTA, Zilliqa, Mina, Starknet, EigenCloud, Monad) | same | same | `gov_upgrades.py` and `gov_proposals.py`, run by hand | GitHub releases, the ACP/NEP/MIP/ELIP repos | Run the existing scripts on a schedule |
| 3 | Votes on Avail, Espresso, Ika, Supra, Vara, Lido DVT | same | same | Not covered at all | Each its own governance (Vara: Polkadot-style referenda) | Later, one chain at a time |
| 4 | The rationale on each new row | same | Rationale | `gov_rationales.py`, run by hand | The row itself | Run after 1–2 (or leave for review — decision 6) |
| 5 | "1882 · Votes cast since 2020" | the record's count band | a typed paragraph | **Decided: stays** (counts pre-record votes) | — | Nothing |
| **Networks set** (47 rows: 27 mainnet, 20 testnet) |||||||
| 6 | Reward rate + Rate updated | /networks, chain pages, the Networks menu panel | Networks set | Set by hand 2026-09-24; rates drift. Mina, EigenCloud, Sommelier deliberately manual | Cosmos: cosmos.directory (free). The other 15 chains each need their own API | **Write** — Cosmos first, the rest one family at a time |
| 7 | Commission | chain pages | Commission | By hand | Our validator's on-chain record | Check and report (decision 4) |
| 8 | Slashing events | chain pages | Slashing events | By hand, by the user's rule: only our own incidents on a live validator (Gravity Bridge 0 by decision) | Slashing events on chain | **Report only** — the user decides what counts |
| 9 | Status (active / jailed) | /networks | Status | By hand | Validator status on chain | Check and report, or write (decision 4) |
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

- **Notion is the only thing the jobs write.** The site already reads Notion; Super republishes on
  its own schedule, so data never needs a paste or a release. The one exception is code (the glyph
  lists in footer.js and covers.js): that job opens a pull request instead. Nothing is fetched live in
  the browser — that would mean cross-site requests, blank figures while loading and keys in the page.
- **The logic is Python in the repo; the Action only schedules it.** Standard library only, like the
  scripts that exist (`urllib`, no installs). Every job runs on a laptop the same way:
  `python3 -m jobs.networks.values --dry` prints what it would write.
- **Three tiers per value.**
  - *Writes* — what drifts and has one true reading: Reward rate with Rate updated (always together),
    blog Read, guide Step/Time, Dashboards status, new vote rows (decision 6).
  - *Checks, never writes* — what a person set and should hear about before the site changes:
    Commission, Unbonding, Slashing events, Validators run, Status (decision 4). If our commission ever
    changed without anyone meaning it to, that is an alert, not a quiet update.
  - *Watches* — the alerts above.
- **Guardrails on every write.**
  - A **Rate source** select on the Networks set (Auto / Manual): the job writes only Auto rows. Mina
    (blank on purpose), EigenCloud (no public API) and Sommelier (0% by rule) stay Manual. Adding the
    property is an API call; turning a row to Auto is one click per chain.
  - A **sanity band**: a new rate more than a third away from the current one is not written but
    flagged — a broken endpoint returning 0% or 400% never reaches the site.
  - A **history file** (`history/rates.csv`), one line per chain per run, committed by the job: an audit
    trail of why a rate moved, and the weekly commit keeps a public repo's schedule alive (GitHub
    switches schedules off after 60 days without a commit).
  - **Plain text only** into Notion (never the annotations read back — the lesson of 2026-09-24).
  - **One Notion writer at a time** (a shared `concurrency` group), under Notion's 3 requests a second.
- **Two outputs.** What it wrote goes in the run's summary. Everything that is the user's call —
  slashing, a changed commission, a held-back rate, a new chain, a count mismatch, a dead link — goes
  into **one rolling report** ("Site data: needs you"), updated each run rather than re-opened
  (decision 1: a GitHub issue, or Discord/Telegram).
- **One source for each fact.** Validator addresses come from the Networks set's Address; API endpoints,
  each chain's family and which fields the job owns live in `config/chains.yml`.
- **Readers per chain family, not per chain:** one for the 12 Cosmos chains (cosmos.directory for the
  rate, each chain's own endpoints for votes, commission, slashes, unbonding); Sui/IOTA/Ika; Near;
  Avalanche; Substrate (Avail, Vara); the EVM-style ones (Monad, Starknet, Supra, Espresso, Zilliqa);
  Lido; and GitHub releases for upgrades. The methods are already in `notion/networks-set-values.md`.

## 4. Structure

```
.github/workflows/                 thin: when to run, the secret, one command each
  governance.yml     daily         votes (1) → upgrades (2) → rationales (4)
  networks.yml       weekly        rates (6, write) · commission, status, unbonding, slashing, Lido (7–11, check)
  content.yml        daily         blog Read · guide Step/Time · dashboards status (15, 18, 20)
  audit.yml          daily         links · glyph drift · served tags · fallback counts · watches (12, 24–26)

jobs/                              everything that runs unattended
  lib/
    notion.py        the client (from scripts/notion.py): rate-limited, plain text writes, --dry aware
    report.py        "what changed / what needs you" → the run summary + the rolling report
    http.py          fetch with retries and fallback endpoints
    history.py       appends to history/rates.csv
  sources/           one reader per chain family, all returning the same shape
    cosmos.py  sui.py  near.py  avalanche.py  substrate.py  evm.py  lido.py  releases.py
  governance/  votes.py · upgrades.py · proposals.py · rationales.py   (the gov_*.py move here)
  networks/    values.py
  content/     blog_read.py · guide_steps.py · services_status.py · portfolio.py
  audit/       links.py · glyphs.py · served_tags.py · watches.py

config/chains.yml                  per chain: family, endpoints (with fallbacks), repo, owned vs checked fields
history/rates.csv                  one line per chain per run

scripts/                           stays for the site tools run by hand: paste_table, livecheck, audit, chain_pages, shots
```

A workflow, in outline: on its schedule, on a "Run workflow" button (with a dry-run switch) and on a
pull request (always dry); check out; set up Python; run one module with `NOTION_TOKEN` from the repo's
secrets; hand the summary to the report. About twenty lines each.

## 5. Build order

0. Rotate the Notion token and settle the open decisions (below).
1. Move the governance scripts into `jobs/` with `--dry` and the report, and put them on a schedule —
   no new logic, it proves the pipe.
2. Cosmos votes → new record rows: the biggest manual gap.
3. Blog Read and guide Step/Time.
4. Cosmos network values (rates written behind the sanity band and Rate source; the checks) and Lido.
5. The audit jobs and the watches.
6. Rates for the non-Cosmos families, one reader at a time, each chain moved from Manual to Auto as its
   reader lands.

## 6. Decisions

**Decided**
- The logic lives in Python in this repo; the Action is only the scheduler (2026-09-25).
- Notion is the only thing the jobs write; nothing is fetched live in the page.
- "1882 · Votes cast since 2020" stays (2026-09-26).
- Until the jobs exist, the values are updated by hand (2026-09-16).

**Open — needed before any code**
1. **Where the rolling report goes:** a GitHub issue, or a Discord/Telegram message. (Recommended: the
   issue — it keeps its history and needs no bot.)
2. **This public repo, or a small private one?** Here, the Actions logs and the report are public (the
   token stays masked; on-chain data is public anyway). The history commits keep the schedule alive.
3. **Rotate the Notion token first.** The one in `~/.notion-covers-token` was shown in chat once, and it
   becomes a repo secret.
4. **Which fields are written and which only reported.** Recommended: write Reward rate + Rate updated,
   Read, Step/Time and Dashboards status; report Commission, Unbonding, Slashing events, Validators run
   and **Status** — a jailing is something to act on before the site says it. (The 2026-09-25 evening
   plan had Status written; the morning plan had it checked. This is the one place the two differed.)
5. **Public endpoints only, or our own nodes too?** Our nodes give better data and no rate limits;
   public ones are enough to start, and a chain can move to ours when its public endpoint proves
   unreliable.
6. **New vote rows: live on their own, or held for approval?** And their rationale: drafted by
   `gov_rationales.py`'s principle-based lines, or left for the user to write — it is words in our name.
