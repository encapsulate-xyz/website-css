# site-data

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## site-data — the jobs (built 2026-09-30)

**`github.com/encapsulate-xyz/site-data`** (private; cloned at `~/IdeaProjects/site-data`) holds the jobs the plan
below asked for: plain Node, no dependencies, `DRY=1` writes nothing, one line of log and `out/<job>.md` → one issue a
run (`bin/issue.mjs`), exit 1 = GitHub's failure mail. Its README has the rules and the layout. Running on a schedule
since 2026-09-30: `governance.yml` (daily: votes — **our** votes, asked chain by chain; upgrades — a row only where
running the release is the vote or it carries a proposal; rationales — fills only empty or boilerplate ones, never
rewrites a written one), `networks.yml` (daily: Reward rate + Rate updated, Commission, Unbonding on the Cosmos rows,
then the chain page's facts paragraph and `meta:description`; the rate from the source the row was researched with —
staking-explorer's measured APR, `terra2` not `terra`, cosmos.directory for Gravity Bridge, Chain4Energy's minter —
**written only when two consecutive runs read it within 0.5 points of each other** and it moves the row by 0.5 points
(state/rates.json; staking-explorer's ixo figure read 13.77% at 08:00 and 28.08% at 17:00 on 2026-09-30, and the first
had been written at the user's word — a one-off reading never moves a row again), held for a hand when it moves by more
than a third; `ACCEPT=<chain>` writes it once past both) and `homepage.yml`
(every six hours: the stats band's two headings from every mainnet's stake, priced on CoinGecko; a chain that fails to
read keeps its last good reading in `state/stake.json`; the customers heading is written only when every chain that
can count did — **Sui's ~10,000 stakers have no open source yet**, so it is held; Mina is a typed reading until a
Blockberry key exists). **Every exception to a plain reading of a number — which validators are ours (Terra's four: the endorsed
Encapsulate and Luna Whale, Lunatic Validator, Long Live Luna, run by us and not endorsed publicly, counted in the
homepage's stake and customers since 2026-09-30; Agoric's two; Lido's cluster in full), Gravity Bridge's 0, the rates
set by hand, the record's rules — is `site-data/config/exceptions.md`; a new exception goes there first.** The Blockberry
key (Sui's stakers, Mina's ledger) is a secret there too; it was shown in chat on 2026-09-30 — rotate it with the Notion
token (the user: no reminders, it is a TODO). **The Python scripts here (`gov_*.py`, `chain_pages.py --facts`) are superseded by those jobs
for what they cover**; `notion/networks-set-values.md` records the rule, the job writes the values. First writes on
2026-09-30 at the user's word: 20 upgrade rows and 21 References, the Lumera #14 vote, five rates (ixo 24.7% → 12.4%
accepted past the band).
