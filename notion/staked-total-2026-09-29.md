# Stake with Encapsulate's validators — 2026-09-29, 00:05–00:12 UTC

Read-only from each chain's public endpoints; prices from CoinGecko's simple price API (last updated 2026-09-29
00:03–00:09 UTC). Each figure is the total stake backing the validator (own + delegated) in the current epoch/era.
The Lido Simple DVT cluster counts in full as ours (the user, 2026-09-29). Redo this before publishing a new figure —
two tokens carry most of it, so the dollar total moves with SUI and ETH.

**Total: $84.8 million.** A record only: no profile carries a figure (the user, 2026-09-29 — one short description
with no numbers in it); the homepage shows the live total.

| Chain | Stake | Price USD | Value USD | Source |
|---|---|---|---|---|
| Lido Simple DVT, operator #43 (500 validators × 32 ETH) | 16,000 ETH | 2,689.92 | 43,038,720 | `getNodeOperator(43, true)` on the SimpleDVT registry `0xaE7B191A31f627b4eB1d4DaC64eab9976995b433`: 500 deposited, 0 exited |
| Sui | 30,176,190.94 SUI | 1.17 | 35,306,143 | Sui GraphQL, active validator `0x01d03daf…6ff7` staking pool balance, epoch 1264 |
| NEAR | 445,864.43 NEAR | 4.81 | 2,144,608 | `encapsulate.pool.near` `get_total_staked_balance`, block 217,702,001 |
| Monad | 53,109,471.16 MON | 0.02844445 | 1,510,670 | staking precompile `getValidator(91)`, `rpc.monad.xyz`, block 108,889,259 |
| Starknet | 16,862,232.21 STRK | 0.04183017 | 705,350 | staking contract `staker_info_v1` / `staker_pool_info`, block 15,601,175 |
| IOTA | 9,768,862.20 IOTA | 0.055665 | 543,784 | `iotax_getLatestIotaSystemState`, epoch 511 |
| Espresso | 5,000,020 ESP | 0.097946 | 489,732 | StakeTable `0xCeF474…4451` `validators(0xea452aed…991b)`, Ethereum block 26,079,433 |
| Axelar | 9,308,587.04 AXL | 0.052281 | 486,662 | cosmos staking `validators/axelarvaloper1p8uxq4…9yct` |
| Avail | 60,184,090.81 AVAIL | 0.00248527 | 149,574 | `Staking.ErasStakersOverview`, era 817 |
| Ika | 69,146,078.21 IKA | 0.00206217 | 142,591 | validator object `0x351f2db4…12f1` `ika_balance`, epoch 425 |
| Avalanche | 9,962.63 AVAX | 10.65 | 106,102 | `platform.getCurrentValidators`: 2,002 own + 7,960.63 from 37 delegators |
| Agoric (older validator, still bonded) | 8,850,106.49 BLD | 0.00500039 | 44,254 | `agoricvaloper1fy8r6zq3dde6n7ak6eqy5zsrp3s7sz833dmv32` |
| Zilliqa (encapZIL pool) | 11,692,830.04 ZIL | 0.00355791 | 41,602 | `getStake()` on `0x1311059D…933C`, block 36,896,456 |
| Vara | 44,574,326.43 VARA | 0.00072016 | 32,101 | `Staking.ErasStakersOverview`, era 2348 |
| Terra | 574,935.96 LUNA | 0.050742 | 29,173 | cosmos staking `terravaloper1yh4u76…mujs` |
| Agoric | 4,139,800.62 BLD | 0.00500039 | 20,701 | `agoricvaloper1p8uxq4…g25ldj` |
| Supra | 76,381,436.67 SUPRA | 0.00016907 | 12,914 | `pbo_delegation_pool::get_delegation_pool_stake` |
| Althea | 211,048.99 ALTHEA | 0.04267194 | 9,006 | cosmos staking `altheavaloper1d2x0t4…72axt` |
| humans.ai | 20,334,678.92 HEART | 0.00043311 | 8,807 | cosmos staking `humanvaloper1d2x0t4…sqguy3` |
| Chain4Energy | 1,635,627.34 C4E | 0.00106522 | 1,742 | cosmos staking `c4evaloper1s0lank…d20r7x` |
| ixo | 750,026.00 IXO | 0.00163451 | 1,226 | cosmos staking `ixovaloper1p8uxq4…lmt2an` |
| EigenLayer | 4,070.22 EIGEN | 0.253744 | 1,033 | DelegationManager `operatorShares`, EIGEN strategy |
| Gitopia | 2,461,762.85 LORE | 0.00040981 | 1,009 | cosmos staking `gitopiavaloper1s0lank…3grfh` |
| Passage | 5,057,292.62 PASG | 0.00018962 | 959 | cosmos staking `pasgvaloper1s0lank…whck2v` |
| Mina | 5,092.95 MINA | 0.149109 | 759 | Minascan staking balance, epoch 3 (weakest source — see below) |
| Gravity Bridge | 27,332,250.05 GRAV | 0.00002654 | 725 | cosmos staking `gravityvaloper1s0lank…tgqzfn` |
| Sommelier | 956,584.24 SOMM | 0.00050415 | 482 | cosmos staking `sommvaloper1s0lank…8324s2` |
| Lumera | 1,301,298.20 LUME | no price | — | no market price yet |
| **Total** | | | **84,830,429** | |

**Cross-check:** the homepage's stats band ("Staked Assets Under Management", kept by the user's own script, which
changes through the day) read $83,996,080 on 2026-09-29 and $84,235,402 on 2026-09-27 — within 1% of this
measurement, a total it can only reach with the Lido cluster counted in full. The two methods agree.

**Left out:** the old Sui validator "fka KingSuper" (inactive since epoch 849, 11,971.89 SUI still withdrawable, about
$14K — it earns nothing) and four jailed or unbonded old Cosmos validators (about $300 together).

**Notes**
- ETH (51%) and SUI (42%) are 93% of the total: ±$100 on ETH moves it ±$1.6M, ±$0.01 on SUI ±$0.3M. A fall of about
  5% in both puts it under $80M, which is why no rounded figure is typed into a profile either.
- Sui, IOTA, Ika, NEAR and Supra report one pool balance including our own stake and compounded rewards; Supra's is a
  pre-bonded (PBO) pool, much of it probably locked allocation.
- **Mina looks wrong**: 5,093 MINA in 16 delegations against 396 blocks produced in 30 days on Minascan — our main Mina
  stake may sit under another block-producer key. Check with ops before quoting Mina on its own.
- Thin markets (GRAV, IXO, PASG, SOMM, LORE, C4E) make those dollar values nominal; together under $6,000.
- The claims in use elsewhere — "nearly half a billion", "$500 million", "$248 million" — do not match this.
