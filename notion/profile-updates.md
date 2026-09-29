# Every profile to update — what, how and who (2026-09-29)

Asked for on 2026-09-29, once the description was agreed. `notion/mentions-checklist.md` is the read-only check this
comes from (what each profile says today, ranked by value); this file is the work list. **Nothing here has been done
yet — the user says when.**

**The tracker is an artifact**, "Encapsulate Profile Updates" (private to the user; its link is in Claude's memory, not in this
public file): the same updates as 49 rows — the Cosmos validators and the two SSV operators are one row each — every
row with what the profile says **now** (read live on 2026-09-29) beside what it becomes, filters by who, status, how and
weight, and a status and a note per row kept in the artifact's database (collection `updates`, one document per row:
`{status: open|started|done, note, at}`). It is built by `scripts/profile_tracker/build.py` from `template.html`; the
rows and their current values are the list in that script.

## What every profile should say

| Field | Value |
|---|---|
| Name | Encapsulate (never "fka KingSuper", "KingSuper" or "Encapsulate Limited") |
| Description | Validator infrastructure for new chains, since 2020. Early to testnet, quick to upgrade, easy to reach. Trusted by Sui, NEAR, Monad, Lido, Starknet and more. |
| Where a field is shorter than 157 characters | the first two sentences (103), or the first alone (52) |
| Website | `https://encapsulate.xyz` — no `www.`, no `http:`, no trailing slash |
| X | `https://x.com/encapHQ` (`x.com/encapsulate_xyz` is suspended) |
| Discord | `https://discord.gg/q6cmGycxsr` (`discord.com/invite/S5x4e2AHVV` has expired) |
| Contact on explorers | `security@encapsulate.xyz` (on purpose) |
| Logo | `img/favicon-512.png`, put into `encapsulate-xyz/assets` as `encapsulate.png` — the same path, so every profile that already points at it follows |

## 1. Claude — our own repos and pull requests

`gh` is signed in as `aditya-manit`, an admin of the `encapsulate-xyz` organisation. A pull request to someone else's
repo is opened from a fork under `encapsulate-xyz`, and GitHub shows `aditya-manit` as its author (an organisation
cannot author one).

| # | Profile | What changes | How |
|---|---|---|---|
| 1 | `encapsulate-xyz/assets` — the source: Sui, IOTA, NEAR and Espresso take their logo from it | the description in README.md and `espresso-mainnet.json`; the logo replaced by the 512px file at the same path; a `eigenlayer.json` for row 20 | push to our own repo |
| 2 | GitHub organisation page — `encapsulate-xyz/.github`, `profile/README.md` | the description in place of "Revolutionizing Blockchain Staking…"; the Discord invite; `contact@` → `hello@` | push to our own repo |
| 3 | Monad — `monad-developers/validator-info`, the mainnet and testnet files | description, X, the website's trailing slash | pull request, then posted in their Discord |
| 4 | Zilliqa — `Zilliqa/zq2-staking`, `stakingPoolsConfig.ts` | description, with the website linked in it (the portal has no website field) | pull request |
| 5 | Symbiotic — `symbioticfi/metadata-mainnet`, operator `0x69F5…2F09` | description, X, Discord | pull request (they may ask for a message signed by the operator address) |
| 6 | EigenLayer — `Layr-Labs/eigendata`, `operators/Encapsulate/metadata.json` | name, description, X. validator.info copies it | pull request — slow to merge; row 20 is the fast way |
| 7 | Mina — the Auro wallet's list, `aurowallet/launch` | the website without `www.`, description | pull request |
| 8 | Terra — `terra-money/validator-profiles` | name, website (`king.super.site` is a 404), logo, contacts, description | pull request |
| 9 | REStake and cosmos.directory — `eco-stake/validator-registry` | add our profile and our validator addresses (we are not in it) | pull request |
| 10 | `celestiaorg/awesome-celestia` | name; remove the dead `*.kingsuper.services` endpoints and the three snapshot links | pull request |
| 11 | `chuck-bear/awesome-berachain-validators` | name; remove the dead cutting-board link | pull request |
| 12 | Optional — `Agoric/validator-profiles`, `althea-net/community` | name | pull request |

## 2. You or ops — a transaction signed with the operator key

| # | Chain | What changes | Transaction |
|---|---|---|---|
| 13 | Terra, Agoric (the older validator), Althea, Gitopia, Gravity Bridge, humans.ai, Passage, Sommelier, Chain4Energy | name and description | `<binary> tx staking edit-validator --new-moniker "Encapsulate" --details "<description>"` |
| 14 | Axelar, Agoric, ixo, Lumera | description | `<binary> tx staking edit-validator --details "<description>"` |
| 15 | Sui | description | `sui validator update-metadata description "<description>"` — shows from the next epoch |
| 16 | IOTA | description | `iota validator update-metadata description "<description>"` |
| 17 | Ika | website, logo URL and description — all three are empty or wrong | set the validator's metadata with its operation cap |
| 18 | NEAR | description | `update_field` on `pool-details.near`, from the pool's owner |
| 19 | Espresso | the metadata URI, to `espresso-mainnet.json` in our assets repo (it is the node's own `http://…:8088` address now, blank when the node is down) | `updateMetadataUri` on the StakeTable `0xCeF474…4451` |
| 20 | EigenLayer — the fast way | the metadata URI, to a JSON in our assets repo | `updateOperatorMetadataURI` on the DelegationManager `0x39053D51…f37A`, from the operator address |
| 21 | SSV operators 924 and 1056 | description, X | the SSV app, signed with the owner wallet — `0xf3C9…7a80` for 924 (active, the 500 Lido validators), `0x1007…8262` for 1056 (inactive, none) |
| 22 | SSV operator 469 (old, no validators) | remove it | `removeOperator(469)` from `0xa8e7…5B98` |
| 23 | Sui — the candidate "dummyvalidator" `0xeac3…09ec` | remove it | `request_remove_validator_candidate` |
| 24 | The 20 testnets | the same name and description | the same commands, per chain — **not checked yet** |

The binaries for rows 13–14: `terrad`, `agd`, `althea`, `gitopiad`, `gravity`, `humansd`, `passage`, `sommelier`,
`c4ed`, `axelard`, `ixod`, `lumerad`. `edit-validator` changes only the flags it is given.

Avail and Vara need nothing: their on-chain identity has no description field, and the name, website and X are right.

**Found while reading the current values (2026-09-29):** on Gitopia and Gravity Bridge the *bonded* validator is the one
named "fka KingSuper", and an old jailed one is already named "Encapsulate" — after the rename two will share the name.
Axelar has an old jailed validator reading "Redelegate to Encapsulate" and ixo one still reading "fka KingSuper"; both are
out of the set and stay. Zilliqa's file lists our pool twice (both entries change). Monad's two files take their logo
from our assets repo, as Sui, IOTA, NEAR and Espresso do. The X bio is the "five years… 40+ networks… half a billion" text.

## 3. You — forms and account settings

| # | Profile | What changes | Where |
|---|---|---|---|
| 25 | StakingRewards | claim `/provider/kingsuper`: name, logo, website, X, description | providers.stakingrewards.com |
| 26 | Starknet — Voyager | description (it says "over $500 million"), X | Voyager's "Add validator info", with the staker's wallet |
| 27 | Mina — Minascan | name, website, X, Discord, description | Staketab's "Submit service" form |
| 28 | X @encapHQ | the bio; the website (it is a Linktree) | profile settings |
| 29 | X @_KingSuper_ (the old account) | website | profile settings |
| 30 | LinkedIn | About; the tagline takes the first two sentences | the page's admin view |
| 31 | GitHub organisation | description and email; verify the domain | organisation settings (the token here cannot change them) |
| 32 | Keybase `B68A51B88F28CEF1` | add X, GitHub and website proofs | Keybase |
| 33 | Starknet — Endur | name (it says "Encapsulate Limited") | ask Endur |
| 34 | Supra — SupraScan | name (it says "Unknown") | ask Supra |
| 35 | Avalanche — Avascan | website | Avascan's Telegram support |
| 36 | Lido research forum | the username "KingSuper", the website, the post that links `king.super.site` | forum profile |
| 37 | Discord server | description | server settings |

Claude can write the text for each form or message, and can fill a form in the browser where you are signed in and
ask for it.

## Follows by itself

Mintscan, Keplr, ping.pub and cosmos.directory read the chain and Keybase. validator.info reads EigenLayer. Suiscan,
Suivision, Slush, Iotascan, Ikascan and Nearblocks read the chain. Our own bots and `starkzap` read the logo's path.

## Order

1. Rows 1–2 first: rows 19 and 20 point at files row 1 creates, and the logo reaches Sui, IOTA, NEAR and Espresso
   from there with no transaction.
2. Then the pull requests (3–12) and the transactions (13–24), in any order.
3. Row 25 is the most valuable single fix and needs nothing from the others.
