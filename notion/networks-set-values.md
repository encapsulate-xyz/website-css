# The Networks set's staking values — where each came from (researched 2026-09-24)

The 28 **mainnet** rows of the `Networks set` database (`3dde800a…33b7f1…`) carry eight properties
added on 2026-09-24 for the chain pages: **Address, Rate updated, Commission, Compounding,
Unbonding, Chain slashes, Slashing events, Explorer**, beside the existing **Reward rate**. Testnet
rows are left empty — there are no testnet chain pages.

## What each property means

| Property | Meaning |
|---|---|
| Address | what a staker delegates to: valoper / stash / pool / node id / operator |
| Reward rate | what a staker earns **with us, after our commission**, as text ("7.3%", a range where the chain's own rules give one). Measured or computed from on-chain data — never a marketing figure. Blank where no honest single figure exists |
| Rate updated | the day the rate was read; blank with the rate |
| Commission | our fee as a fraction, shown as a percentage (Notion's percent format) |
| Compounding | Auto = rewards join the stake with no action (Sui-style pools, NEAR pools, stETH, liquid pools); Manual = claimed or paid out |
| Unbonding | how long until unstaked tokens are liquid, in words, because the chains do not share a unit |
| Chain slashes | ticked when the chain can take **principal**. Chains that only withhold rewards are unticked |
| Slashing events | slashes **applied** to our current validator for its own fault. Network-wide incidents and validators we shut down on purpose do not count (the user's rule, 2026-09-24). Blank where the chain cannot slash |
| Explorer | our validator's own page on a public explorer; blank where none exists or none could be confirmed |

## How the values were read

- **Cosmos chains** (Axelar, Terra, Agoric, Althea, Gitopia, Gravity Bridge, humans.ai, ixo, Lumera,
  Passage, Sommelier, Chain4Energy): our validators found by moniker or Keybase identity
  `B68A51B88F28CEF1` on `validators.cosmos.directory`; commission, status and slashes from there,
  slashes re-checked on each chain's own REST (`/cosmos/distribution/v1beta1/validators/{addr}/slashes`
  with `starting_height=1&ending_height=…` — without the range the query returns nothing). Unbonding
  from the staking params. Rates: staking-explorer.com's figure measured from rewards actually
  distributed, falling back to `chains.cosmos.directory` `calculated_apr` (Gravity Bridge) or the
  chain's own minter (Chain4Energy: 8M C4E a year, 70% to stakers, over bonded stake). Gitopia's
  calculated APR (~105%) is far above its measured one (45%); the measured one is used.
- **Sui, IOTA, Ika**: system state and `get…ValidatorsApy` (Sui via GraphQL and publicnode — the
  public full node no longer serves JSON-RPC); Ika's rate is our pool's exchange rate compounded
  over 30 epochs (no official APY call). Slashing: every epoch's report and score events read.
- **NEAR, Avalanche, Mina, Zilliqa**: NEAR pool contract and archival RPC; Avalanche P-chain and
  Glacier (delegation rewards by period); Mina node GraphQL and Auro's validator list; Zilliqa 2.0
  delegation contract via `eth_call` (the rate is the encapZIL price change).
- **Monad, Starknet, Supra, Espresso**: the staking precompile / staking contract / pool resources
  on each chain; rates measured from reward events over 7–30 days.
- **Avail, Vara**: staking pallet via polkadot.js on the chains' own RPC; rates are what a nominator
  on our validator actually earned over 10 eras.
- **Lido, SSV.network, EigenCloud**: Lido StakingRouter and the stETH APR API; SSV API and beacon
  state for our cluster's 500 validators; EigenLayer DelegationManager, RewardsCoordinator and
  AllocationManager.

The research transcripts (every call and URL) are in the session scratchpad; the per-chain sources
are summarised below.

## Per chain

| Chain | Address (what a staker uses) | Notes |
|---|---|---|
| Avalanche | `NodeID-N3e9W3EngjabGnTZVqyZwunVcbCdrY5Qy` | Rate depends on the delegation length (5.1–5.7% net for 14–232 days). **Only ~111 AVAX of delegation capacity left** on 2026-09-24. The node did not validate 2026-02-02 → 05-15 |
| Lido | Simple DVT node operator #43 (SSV cluster "Arid Anubis") | Stakers pay Lido's 10%; the rate is stETH's 7-day APR. #48 ("Mysterious Manta", all exited) may also be ours — unverified |
| Monad | `0x79129e1306dc1e81F3a2cC5e3B5171fb92FFd99d` — validator **ID 91** | Delegators stake to the ID; no slashing implemented |
| Near | `encapsulate.pool.near` | 4 epochs to unlock (~21–31 h at today's epoch length) |
| Sui | `0x01d03daf…26ff7` | Old validator "fka KingSuper" `0x970f9006…` ran epochs 0–849, never penalised. Tallying rule removes rewards, never principal |
| Axelar | `axelarvaloper1p8uxq4…9yct` | Old "Redelegate to Encapsulate" validator is jailed, no slashes |
| EigenCloud | `0xA6c3F159…22062` | Reward rate not readable (app 500, API keyed). Registered to EigenDA and eOracle, but in no operator set, so none of our stake is slashable today |
| IOTA | `0xedd654b2…27c9ab` | |
| Mina | `B62qjWmF…FaRYY` | **Rate left blank**: ~5,100 MINA delegated, ~one block expected every 8 months, so any APR would mislead. Fee 5% is advertised, paid off-chain |
| Starknet | staker `0x0359e252…df2a` (pool `0x04e828f5…b3f6`) | 44 of 12,675 attestation epochs missed; Voyager still shows an old reward address |
| Terra | `terravaloper1yh4u76…mujs` | |
| Zilliqa | delegation contract `0x1311059D…933C` (encapZIL) | Our pool's rewards ran at 69–79% of its stake share; peer pools with the same 8% earned 11–12.5% |
| Avail | `5FqQ3hKu…KSTN` | A 7% offline slash (4,272 AVAIL) was reported in the 2026-08-31 outage and **cancelled** by the Technical Committee — not applied, so 0. 18 eras of payouts unclaimed on 2026-09-24 |
| Espresso | `0xea452aed…991b` | No per-validator explorer page |
| Ika | operator `0x351f2db4…12f1` | |
| SSV.network | Operator 924 "Lido - Encapsulate" | Private to Lido's cluster — nobody stakes to it directly, so rate, compounding and unbonding are blank |
| Supra | pool `0x15ac9afc…cd3a` | **Commission 38.72%** on-chain, unchanged since at least 2025-05 |
| Vara | `kGjJgbAj…Q6q6` | 24 eras of payouts unclaimed on 2026-09-24 (they expire after 84 eras) |
| Agoric | `agoricvaloper1p8uxq4…5ldj` | **Two** active validators of ours; the "Encapsulate" one is listed, as asked. The other, "fka KingSuper", is `agoricvaloper1fy8r6z…mv32` (~8.9M BLD) |
| Althea | `altheavaloper1d2x0t4…2axt` | |
| Gitopia | `gitopiavaloper1s0lank…grfh` | 0 — the one 0.01% slash is on the old validator `…udxwwa`, shut down on purpose |
| Gravity Bridge | `gravityvaloper1s0lank…qzfn` | **0, by the user's decision (2026-09-24).** The chain records three 0.1% slashes — the bridge module's penalty for a missed Ethereum-side confirmation (`slash_fraction_valset`/`_batch` = 0.001). They cannot be dated (the chain keys them by reward period, not height); the 26 active validators carry 1 to 163 such slashes |
| humans.ai | `humanvaloper1d2x0t4…guy3` | |
| ixo | `ixovaloper1p8uxq4…t2an` | 0 — the one 0.01% slash is on the old validator `…t8986e`, shut down on purpose |
| Lumera | `lumeravaloper18qpd0y…mcux` | Explorer blank — no validator page confirmed |
| Passage | `pasgvaloper1s0lank…ck2v` | |
| Sommelier | `sommvaloper1s0lank…24s2` | **0%**: both incentive programmes ended (cutoff heights passed); the chain's own APY query returns 0. Slash fractions are both 0, so it cannot slash |
| Chain4Energy | `c4evaloper1s0lank…0r7x` | Explorer blank — no validator page confirmed |

## Refreshing

Rates drift; re-read them and set **Rate updated** in the same edit. The planned scheduled job
(CLAUDE.md, "a GitHub Action to fill the APY property") should write Reward rate and Rate updated
together and leave the hand-set properties alone.
