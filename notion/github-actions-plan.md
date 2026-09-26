# The GitHub Actions — plan (2026-09-26, not built)

What goes stale on the site, where it lives in Notion, and how scheduled jobs in this repo would keep it
current. Planned with the user on 2026-09-26; nothing is coded. The TODO in CLAUDE.md points here.

**Decided since:** the record's "1882 · Votes cast since 2020" stays as it is — it counts votes from
before the record was kept, which are not rows in the table (the user, 2026-09-26). Decision 1 below is
closed; 2–4 are still open.

## What goes out of date

| # | What | Where it shows | Lives in (Notion) | Today | Source to read | The Action would |
|---|---|---|---|---|---|---|
| **Governance** |||||||
| 1 | New votes on the 12 Cosmos chains (Terra, Axelar, Agoric, Passage, Althea, Gravity Bridge, Humans, ixo, Lumera, Sommelier, Gitopia, Chain4Energy) | /governance-record, homepage table, Governance menu panel | Governance Record rows | Added by hand. The last recorded vote is Nov 2024 for Gravity Bridge and Sommelier, and 2023 for ixo, Gitopia and Chain4Energy: either those chains had no proposals since, or votes were missed | Each chain's public API: the proposals, our vote on each, and the voting transaction for the Proof link | Add the missing rows |
| 2 | Protocol upgrades on 9 non-Cosmos chains (Avalanche, Near, Sui, IOTA, Zilliqa, Mina, Starknet, EigenCloud, Monad) | same | same | `gov_upgrades.py` and `gov_proposals.py`, run by hand | GitHub releases, ACP/NEP/MIP/ELIP repos | Run the existing scripts on a schedule |
| 3 | Votes on Avail, Espresso, Ika, Supra, Vara, Lido DVT | same | same | Not covered at all | Each has its own governance (Vara, for example, uses Polkadot-style referenda) | Later, one chain at a time |
| 4 | The rationale on each new row | same | Rationale | `gov_rationales.py`, run by hand | The row itself | Run after steps 1–2 |
| 5 | **"1882 · Votes cast since 2020"** | record page count band | Typed paragraph | The table has **1,156 rows**, so these don't match | the row count? | **Your decision:** is 1882 meant to be the row count? |
| **Networks set** (27 mainnet rows) |||||||
| 6 | Reward rate + Rate updated | /networks, chain pages, Networks menu panel | Networks set | Set by hand on 2026-09-24; rates drift | Cosmos: cosmos.directory (free). The other 15 chains each need their own API | Cosmos chains first, the rest one by one |
| 7 | Commission | chain pages | Commission | By hand | Our validator's on-chain record | Update when it changes on chain |
| 8 | Slashing events | chain pages | Slashing events | By hand, under your rule: only our own incidents on a live validator (Gravity Bridge is 0 by your decision) | Slashing events on chain | **Report only**; you decide what counts |
| 9 | Status (active or jailed) | /networks | Status | By hand | Validator status on chain | Update, and flag a jailing |
| 10 | Unbonding / Unbonding days | chain pages | Unbonding | Researched once | Chain staking parameters | Report when a chain changes them |
| 11 | Validators run (Lido DVT 500) | Lido chain page | Validators run | By hand | Lido's Simple DVT operator #43 | Update |
| 12 | Counts typed as fallbacks (27 / 20 / "Thirty-five", `CONTENT`/`FOOT` in navbar.js) | /networks, navbar, /services, homepage | Paragraphs + navbar.js | Go stale when a chain is added | Networks set | Report the drift (navbar.js is code, so it's a PR) |
| **Chain pages** |||||||
| 13 | Chain rules in `chain-pages.json` (minimums, downtime rules, cadence) | chain pages | Row page blocks | Researched once | Chain parameters | Report when they change |
| 14 | Lido / Vara / Chain4Energy buttons point outside the site | those 3 chain pages | Button block | Waiting for their guides | Guides Database | Flag when a guide for one appears |
| **Blog** |||||||
| 15 | Read (minutes) on new posts | /blog "Shortest read" | Blogs → Read | Filled once on 2026-09-26 | The post's own words ÷ 230 | Fill any missing or changed ones |
| 16 | Lede, Chain, Ticker, Author on new posts | post head | Blogs properties | By hand | — | Report missing fields |
| 17 | Mainnet (Live / Not yet launched) | the ask at a post's foot | Blogs → Mainnet | By hand | Networks set Stage | Report when a chain goes live |
| **Guides** |||||||
| 18 | Step / Time on a new guide | /guides picker | Guides Database | Counted by hand | The guide's own slide rows | Fill |
| 19 | Wallet screenshots going stale | guide pages | Slide Cover | By hand | — | Not automatable; could flag old guides |
| **Services** |||||||
| 20 | Dashboards Status (LIVE) | /services | Dashboards → Status | By hand | Check whether each Link loads | Update |
| 21 | Playbooks / Monitoring repos (still exist? public?) | /services | Repository, Visibility | By hand | GitHub API | Report or update |
| **Investments** |||||||
| 22 | "we run a validator here" / "not yet in the set" | /investments | Portfolio → Validator | By hand | Networks set | Report mismatches |
| **Homepage** |||||||
| 23 | Why Stake fallbacks ("Six years", "2026 in progress", "25 secured") | homepage | Why Stake database | The script shows the live figure; the typed text goes stale every year | Date / Networks set | Yearly rewrite (low value) |
| **Site-wide (repo)** |||||||
| 24 | footer.js's 10 glyph URLs, covers.js fallback glyph IDs | footer, covers | Code | Drift when a Cover changes (5 pending now) | Networks set Covers | Open a PR |
| 25 | Pages running old CSS/JS (paste or republish missing) | every page | — | `paste_table.py`, run by hand | Live HTML vs `head/*.html` | Report |
| 26 | Dead links: Proof links, Explorer, guide Links | record, chain pages, guides | Link properties | Not checked (Mintscan already dropped two chains) | HTTP check | Report |

## Proposed structure

```
.github/workflows/
  governance.yml     daily    — votes (1) → upgrades (2) → rationales (4)
  networks.yml       weekly   — rates, commission, status, unbonding, Lido (6–11)
  content.yml        daily    — blog Read, guide Step/Time, dashboard status (15, 18, 20)
  audit.yml          daily    — links, glyph drift, served tags, fallback counts (12, 24–26)

jobs/                          ← replaces scripts/ for everything that runs unattended
  lib/
    notion.py        client (from scripts/notion.py): rate-limited, writes plain text only
    report.py        collects "what changed / what needs you" → job summary + one rolling issue
    http.py          fetch with retries and fallback endpoints
  sources/           one adapter per chain family, all returning the same shape
    cosmos.py        proposals, our votes, validator, params, rate (cosmos.directory)
    releases.py      GitHub-release logic now inside gov_upgrades.py
    lido.py          (then sui.py, near.py, avalanche.py… added one at a time)
  governance/  votes.py · upgrades.py · proposals.py · rationales.py
  networks/    values.py
  content/     blog_read.py · guide_steps.py · services_status.py · portfolio.py
  audit/       links.py · glyphs.py · served_tags.py
config/
  chains.yml         per chain: family, API endpoints (with fallbacks), repo,
                     which fields the job owns, which are locked (e.g. slashing events)
```

**How it behaves**
- **Notion is the only thing it writes.** Super republishes on its own schedule, so no site code or paste is needed for data. The one exception is the glyph lists in footer.js and covers.js; they're code, so that job opens a PR.
- **Every job has `--dry`.** It runs dry on pull requests and on manual runs. On the schedule, it writes only what changed.
- **Two kinds of output:** values it owns (rates, Read, Step/Time, status, new vote rows) are written directly. Anything that is your call (slashing, new chains, count mismatches, dead links) goes into **one rolling issue**, "Site data: needs you", which gets updated rather than re-opened every run.
- **Addresses come from Notion** (the Networks set's Address), so there's a single source. API endpoints and "who owns which field" live in `config/chains.yml`.
- **One Notion writer at a time** (a shared concurrency group). The client stays under Notion's 3 requests/second limit.

**Build order:** (1) move the scripts into `jobs/` with dry-run + report, and put the existing governance scripts on a schedule; (2) Cosmos votes, the biggest gap; (3) blog Read and guide Step/Time; (4) Cosmos network values + Lido; (5) the audit jobs; (6) rates for non-Cosmos chains, one adapter at a time.

## Decide before any code

1. **The "1882" figure:** should it equal the record's row count (1,156), or does it count votes that aren't in the table?
2. **Public logs:** this repo is public, so Actions logs are too. The token stays masked and on-chain data is public anyway, but the reports would be public. Keep it here, or use a small private repo? Also, GitHub switches off scheduled runs on a public repo after 60 days with no commits.
3. **Rotate the Notion token first.** The one in `~/.notion-covers-token` was shown in chat once, and it would become a repo secret.
4. **Auto-write or report for Commission and Status?** My default: write rates, Status and Read; report Commission, Slashing and Unbonding.
