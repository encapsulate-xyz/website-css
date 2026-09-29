# TRON: how Staking4All is there, and whether we can be (2026-09-29)

A side quest the user asked for. Read-only: Tronscan's API (witness list, voters), TronGrid's chain parameters, TRON's
developer docs, StakeKit's docs, the announcements. TRX at $0.335 (Coinbase, Binance, Kraken).

## Staking4All is "CryptoGuyInZA"

Staking4All's TRON validator is the Super Representative registered as **CryptoGuyInZA**
(`TTcYhypP8m4phDhN6oRexz2174zAerjEWP`): StakeKit's docs give that address under Staking4All's name, and StakingRewards
lists Staking4All on TRON at the same 4% fee. Its own site says it "has been elected as a Tron Super Representative by
the community". It has produced 3,187,605 blocks — 8.2 years of block production, so it has been in the top 27 since
TRON's first elections in mid-2018. **It was not onboarded recently; it was there first.**

Today: rank 20, 873,128,466 votes from 9,437 voters, brokerage 4%, 99.90% of its blocks produced. **53% of its votes
come from five wallets**: four with exactly 100,000,000 each (one tagged HTX Exchange) and "HTX-Cold 7" with 60,000,000.

## How the others got in

The same wallets give round lots of 100,000,000 votes to P2P.org (elected April 2025), Nansen, Luganodes, CryptoChain
and TronSpark. Top five voters hold 62% of P2P.org's votes, 64% of Nansen's, 67% of Luganodes', 96% of Kraken's (elected
July 2025), 78% of Binance's. The announcements say "elected" and quote TRON DAO welcoming them; none describes an
application. **A seat in the top 27 is decided by a handful of very large holders, several of them HTX wallets.**

## The rules (TRON's docs and the live chain parameters agree)

| What | Value |
|---|---|
| To become a candidate | one `WitnessCreateContract` transaction and 9,999 TRX, burned (about $3,350) |
| Who produces blocks | the 27 candidates with the most votes, re-ranked every 6 hours |
| Who earns vote rewards | the top 127 |
| Block reward | 8 TRX a block, to the producing SR: 8,533 TRX a day each |
| Vote reward | 128 TRX a block, shared by the top 127 by votes: 83.7 TRX a day per million votes (3.05% a year) |
| Brokerage | the share the SR keeps; default 20%, the institutions take 4–10% |
| Votes | 1 staked TRX = 1 vote; unstaking takes 14 days |

## What it takes

| Rank | Votes needed | In dollars | Holder today |
|---|---|---|---|
| 27 (produces blocks) | 618,879,869 | $207 million | Kraken |
| 28 | 233,864,008 | $78 million | TRXUltra |
| 50 | 6,675,973 | $2.2 million | MCDEX001 |
| 100 | 96,082 | $32,000 | ByteDance |
| 127 (last paid place) | 21,598 | $7,200 | TakeAndGive |

## What it pays

| Case | Rewards a day | We would keep | A year |
|---|---|---|---|
| Staking4All today (873M votes, 4%) | 81,594 TRX | 3,264 TRX | about $400,000 |
| Us at rank 27 (620M votes, 5%) | 60,413 TRX | 3,021 TRX | about $370,000 |
| Us as a partner with 10M votes (10%) | 837 TRX | 84 TRX | about $10,000 |
| Us as a partner with 1M votes (10%) | 84 TRX | 8 TRX | about $1,000 |

## Can we

- **Register and be listed (top 127): yes, this week.** 9,999 TRX, a node, and about 22,000 votes, which we could
  stake ourselves. It earns next to nothing; its value is the listing.
- **Produce blocks (top 27): only with the large holders' votes.** $207 million of staked TRX has to vote for us, and
  a seat taken is a seat someone loses. That is a conversation with TRON DAO, not an application. Every recent entrant
  brought distribution (an exchange, a custodian, an analytics platform); "validator infrastructure for new chains" is
  not an obvious fit for a chain eight years old.

## Sources

- https://developers.tron.network/docs/super-representatives
- https://docs.yield.xyz/docs/tron-trx-native-staking
- https://www.cryptoguyinza.co.za/
- https://www.stakingrewards.com/asset/tron
- https://cointelegraph.com/press-releases/p2-p-org-joins-tron-network-as-newest-super-representative
- https://trondao.medium.com/kraken-elected-as-super-representative-on-the-tron-network-40cad0c10981
- https://luganodes.com/blog/TRONSuperRep
- Tronscan API: `apilist.tronscanapi.com/api/pagewitness`, `/api/vote?candidate=…`; TronGrid: `/wallet/getchainparameters`
