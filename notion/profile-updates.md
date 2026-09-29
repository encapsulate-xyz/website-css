# Every profile to update — what, how and who (2026-09-29)

Asked for on 2026-09-29, once the description was agreed. `notion/mentions-checklist.md` is the read-only check this
comes from (what each profile says today, ranked by value); this file is the work list. **The user gave the go on 2026-09-29 for Claude's rows; the transactions and the
forms are still theirs.**

**The tracker is an artifact**, "Encapsulate Profile Updates" (private to the user; its link is in Claude's memory, not in this
public file): the same updates as 48 rows — the Cosmos validators are one row each — every
row with what the profile says **now** beside what it becomes, filters by who, status, route, pull request and weight,
and a status, a note, the pull request and the last live check per row kept in the artifact's database (collection
`updates`, one document per row: `{status: open|started|done|skipped, note, at, pr, live, liveAt}`). It is built by
`scripts/profile_tracker/build.py` from `template.html`; the rows and their current values are the list in that script.
**Redesigned on 2026-09-29** (the user: "it looks messy, make it modern"): one summary bar, the agreed profile as a card
of values that copy on a click, one toolbar, and rows that are a single line until opened. A done row's columns read
"Before | Now", an open one's "Now | Becomes".

## State on 2026-09-29, after the user's go ("fix everything you can fix here")

| Row | What | State |
|---|---|---|
| 1 | `encapsulate-xyz/assets` | **merged** — [#1](https://github.com/encapsulate-xyz/assets/pull/1). The 512px logo at the old path (the 4097px one kept as `encapsulate-4097.png`), the description in both files, `eigenlayer.json` |
| 2 | `encapsulate-xyz/.github` | **merged** — [#9](https://github.com/encapsulate-xyz/.github/pull/9) |
| 3 | Monad | **merged 2026-09-29** by Monad's team — [#1003](https://github.com/monad-developers/validator-info/pull/1003); the mainnet and testnet files on main carry the agreed values. No message in their Discord was needed |
| 4 | Zilliqa | open — [#211](https://github.com/Zilliqa/zq2-staking/pull/211) |
| 5 | Symbiotic | open — [#526](https://github.com/symbioticfi/metadata-mainnet/pull/526). **Merged only after the link is emailed to verify@symbiotic.fi from an encapsulate.xyz address** |
| 6 | EigenLayer | open — [#96](https://github.com/Layr-Labs/eigendata/pull/96). The repo last merged in July 2025; row 20 is the quick way |
| 7 | Mina, Auro | **merged 2026-09-29** by Auro's team — [#108](https://github.com/aurowallet/launch/pull/108) |
| 8 | Terra | open — [#676](https://github.com/terra-money/validator-profiles/pull/676). The repo last merged in January 2025. The profile is rewritten from the site's own words; contacts and Terra's alerts go to security@ |
| 9 | REStake registry | open — [#5205](https://github.com/eco-stake/validator-registry/pull/5205). 13 bonded validators on 12 chains |
| 10 | awesome-celestia | open — [#131](https://github.com/celestiaorg/awesome-celestia/pull/131). Every link in our section was dead; it now lists our three live Celestia repos and the log-analysis post |
| 11 | awesome-berachain-validators | open — [#23](https://github.com/chuck-bear/awesome-berachain-validators/pull/23). The repo last merged in April 2025 |
| 12.1 | Agoric profile | open — [#129](https://github.com/Agoric/validator-profiles/pull/129), raised 2026-09-29 at the user's word ("you do it"). The folder renamed to Encapsulate, the pledge's link now only the new validator `…g25ldj` on Mintscan, its first line "of Encapsulate (formerly KingSuper)", the commitments untouched. The repo has not merged since 2023 |
| 12.2 | Althea list | open — [#129](https://github.com/althea-net/community/pull/129), the same day. Row 67 of `defi/validators.md`: the name, the org's GitHub, hello@encapsulate.xyz and the mainnet validator (the old row named one that is not on mainnet). The repo has not merged since 2023 |
| 38 | Espresso, the node's own description | **merged 2026-09-29** — [#16](https://github.com/encapsulate-xyz/espresso-ansible/pull/16). The node still serves the old text until it is restarted; **the user restarts it**. See "Espresso" below |
| 31 | GitHub organisation | description and email set through the API (the token could, after all); **verifying the domain is left to the user** |

`scripts/profile_tracker/prs.json` maps each row to its pull request and `python3 scripts/profile_tracker/prs.py` prints
every state. **How the pull requests were made:** a branch cut from the upstream's own default branch, pushed to a fork
under `encapsulate-xyz` (the org's existing forks were stale and would not sync), opened by `aditya-manit`. Every commit
and description carries the session's attribution lines. **Both of our own repos had admin enforcement on**; the user
asked for it to be turned off and the two merged (`gh pr merge N --admin --merge`) — it is off on `assets` and `.github`.

## Rechecked live on 2026-09-29, 14:50 UTC — 16 of 50 done

Every row was read again from the chain, the repo or the page (the explorers that refuse a script — Voyager, Minascan,
Endur, SupraScan, Avascan — in Chrome). Each row's finding is in the tracker as its "Checked" line.

| Rows | State |
|---|---|
| 1, 2, 3, 7 | done (merged, and the files upstream carry the agreed values) |
| 4, 5, 6, 8, 9, 10, 11, 38 | pull request open, none reviewed yet |
| 13 and 14, twelve validators: Terra, Althea, Gitopia, Gravity Bridge, humans.ai, Sommelier, Passage, Chain4Energy, Axelar, Agoric (the newer), ixo, Lumera | **done on chain**, by the user's side: name "Encapsulate", the agreed description; website, identity and contact untouched |
| 13.2, Agoric's older validator | set aside; still "fka KingSuper" |
| 15 Sui, 16 IOTA, 17 Ika, 18 NEAR, 19 Espresso, 20 EigenLayer, 21 SSV operator 924 | open, nothing changed. Ika's website and description are empty and its logo field holds the word "Encapsulate" |
| 25 StakingRewards, 28–29 X, 32 Keybase, 33 Endur, 34 SupraScan, 35 Avascan, 36 Lido forum, 37 Discord | open, nothing changed |
| 26 Voyager | form sent by Claude the same evening; Voyager's team publishes it |
| 27 Minascan | sent; Staketab has not published it yet |
| 31 GitHub organisation | description and email set; the domain is not verified |
| 24 the testnets, 30 LinkedIn | not read (LinkedIn shows its About text only to a signed-in admin) |

**The Cosmos edits also changed the commission on eight validators** — the risk in finding 1 of the titanium review
below. Read from each chain (`commission.update_time` is today on all eight):

| Chain | Before | Now | Changed (UTC) | The site's Networks set says |
|---|---|---|---|---|
| Sommelier | 2% | 10% | 14:19 | 2% |
| Lumera | 8% | 10% | 14:22 | 8% |
| Axelar | 9% | 10% | 14:23 | 9% |
| Passage | 5% | 10% | 14:23 | 5% |
| Gitopia | 5% | 9% | 14:24 | 5% |
| humans.ai | 5% | 9% | 14:24 | 5% |
| Althea | 5% | 9% | 14:24 | 5% |
| Agoric | 5% | 9% | 14:33 | 5% |

The four at 9% rose by their chain's daily limit (`max_change_rate` 4%), so the target looks like 10% and they can take
the last point a day later. Terra, Gravity Bridge, Chain4Energy and ixo were already at 10%. **The site is now wrong on
these eight**: the Networks set's `Commission`, and its `Reward rate`, which is stated after our commission, and so
each chain page's figures. **The user said the new rates stand (2026-09-29).** The values to write, from the chain's
commission and staking-explorer.com's measured rate the same day (rate = measured × (1 − commission)):

| Chain | Commission | Measured | Reward rate, was | Reward rate, becomes |
|---|---|---|---|---|
| Agoric | 9% | 6.99% | 6.6% | 6.4% |
| Althea | 9% | 25.37% | 24.2% | 23.1% |
| Gitopia | 9% | 44.71% | 42.9% | 40.7% |
| humans.ai | 9% | 34.93% | 33.2% | 31.8% |
| Passage | 10% | 7.48% | 7.1% | 6.7% |
| Sommelier | 10% | 0% | 0% | 0% |
| Axelar | 10% | 15.48% | 14.1% | 13.9% |
| Lumera | 10% | 52.01% | 47.8% | 46.8% |

**Written on 2026-09-29** at the user's word ("try again in notion"; the first try was refused by the session's
permission check): Commission, Reward rate and Rate updated on the eight rows, `chain_pages.py --facts` for each,
/networks, /, /services and the eight chain pages refreshed in Super, the eight cards made again. Old values:
`backups/networks-set-commission-2026-09-29.json`. If the four at 9% go to 10%, their rows need the edit once more.

**The rate on the site is after our commission — checked, not assumed** (the user remembered it as the chain's own
rate): the chain pages print "After our commission · as of {date}", and each of the eight old values equals that day's
measured rate × (1 − the old commission) — site ÷ measured was 0.94–0.96 on the 5% chains, 0.91 on Axelar (9%) and 0.92
on Lumera (8%). So a commission change always moves the rate.

## Rechecked again, 2026-09-29 18:40 UTC — 23 of 48 done

| Row | Now |
|---|---|
| 17 Ika | **done on chain**: website `https://encapsulate.xyz`, the agreed description, and the logo field holds the logo's address (it held the word "Encapsulate"). Commission 10%, unchanged |
| 18 NEAR | **done on chain** (`pool-details.near`): name, the agreed description, website, X `encaphq`, `security@encapsulate.xyz`, the 512 px logo, and **the new Discord invite** |
| 28 X @encapHQ | the bio is the agreed description (the user); the name and the Linktree are left on purpose |
| 30 LinkedIn, 37 Discord server | marked done by the user; Discord's description reads the agreed text from outside, LinkedIn cannot be read from outside |
| 15 Sui, 16 IOTA | still the old description |
| 38 Espresso | merged; the node still serves the old description, so it has not been restarted yet |

**The older Discord invite `q6cmGycxsr` is now carried only by Voyager**, whose form was sent on 2026-09-29. Once Voyager
publishes the new entry, nothing of ours points at it any more; until then it must stay.

## The user's rows carry their links and steps (2026-09-29)

Asked for: "for all of these add links and steps on how to do it", then "if you can fill any of these form and submit
and close that line item please do". Every row that is the user's has a button to the page where the work is done and
numbered steps, and where a message has to be sent, the message to copy. They are in `scripts/profile_tracker/build.py`
(`link=`, `steps=`). What the research changed:

| Row | Found |
|---|---|
| 25 StakingRewards | **There is no free claim any more** (the user caught it: "vsp.stakingrewards.com for verified staking providers"). `providers.stakingrewards.com` is gone; the dashboard `vsp.stakingrewards.com` is only for providers in the rating programme ("Infra Ratings", formerly VSP), paid by stake: €11,000 a year above $250M, €7,000 to $100M, **€4,500 for $30–100M (ours)**, €2,500 to $10M, €1,000 to $2.5M, free under $2.5M. Outside it, their guide gives `partnerships@stakingrewards.com`. The site's contact form was filled and sent twice on 2026-09-29 and answered "There was an error submitting your form" both times (its `/api/hubspot-form` call returned 200), so nothing went through it. **A draft to partnerships@ is in the Gmail of info@encapsulate.xyz** (the account the Gmail connector is signed in to), for the user to send. **The connector rewrites every link in a draft into a `google.com/url?q=…` redirect** (in the text of a plain body, in the `href` of an HTML one); the user caught it. Fixed in Gmail's own compose window (each anchor's `href` set back to its text, then an input event so Gmail saves), and read back clean after a full reload. The listing is a stub: no stake, no validators |
| 26 Voyager | "Add validator info" opens a Google Form, "Voyager Validator whitelisting" — no wallet. **Sent by Claude on 2026-09-29** and acknowledged: name, the agreed description, the 512 px logo, website, X / Discord / LinkedIn / GitHub, the staker address and its STRK pool, contact security@encapsulate.xyz (not shown publicly). Voyager's team checks each entry by hand |
| 28, 29 X | see below: the website stays the Linktree for now; the old handle needs nothing |
| 32 Keybase | the identity is the user `encapsulate`, whose full name is "Encapsulate Limited" (to become Encapsulate); proofs are added with `keybase prove twitter encapHQ` and `keybase prove dns encapsulate.xyz`. A GitHub proof is a gist from a person's account, so it is left out |
| 33 Endur | no form: Endur's Telegram `t.me/endurfi` or Discord; the row carries the message to send |
| 34 SupraScan | **closed — the user asked "is there any validator who has a name on suprascan?" and there is not.** The three largest outside operators and a foundation validator all read "Unknown", Supra's own dashboard (`validators.supra.com`) masks all 77 operators' names, and the only names on SupraScan are Supra's team wallet and `.supra` domains. Nothing to ask for |
| 35 Avascan | **closed — the user asked whether Avascan has a website option, and it shows none.** A claim displays alias, manager and icon (their guide), ours already reads "Encapsulate / Encapsulate", and a claimed validator (Allnodes) shows no website either. The claim message does carry a website and a logo link (a message signed in Core with the beneficiary address, posted in `#avalanche-validator` on their Discord) — the route if the icon ever needs changing |
| 36 Lido forum | checked in the user's signed-in session on 2026-09-29 (the forum is Discourse; its own JSON answers): **the username cannot be changed** (`can_edit_username` false) and **post 5 of July 2023 cannot be edited** (`can_edit` false; it can only be deleted, which would pull a question others answered) — the user had guessed as much. The profile can: the website is empty and can be set, the display name is "Aditya \| encapsulate.xyz". **The website was set by Claude the same day, at the user's word ("yes do it")**: `https://encapsulate.xyz`, through the forum's own profile call in the signed-in session, read back from outside. The row is done |
| 37 Discord | Server Settings → Server Profile → Description, on desktop or web only |

**X and the suspended account** (the user asked whether putting the site on @encapHQ could get it banned too). X's
ban-evasion policy lets it suspend "any other account we believe the same account holder or entity may be operating …
regardless of when the other account was created". @encapHQ is already visibly the same organisation — its name is
"Encapsulate HQ" and its Linktree links encapsulate.xyz and our GitHub — so the website field adds little either way.
Asked again whether to set the name to "Encapsulate" and the website to the site: **no, not now** — the policy's words are "replace or mimic a
suspended account", and the same name with the same website is a closer copy of the suspended one, for little gain
(the name already says Encapsulate, the Linktree already leads to the site). Advice given: change the bio, leave the name and the Linktree, and appeal for `@encapsulate_xyz`
(help.x.com/en/forms/account-access/appeals), which is the only thing that settles it. The user decides.

## Only what is active is tracked (the user, 2026-09-29)

"What are these other ssv? only add the active cluster, same for sui only active one." Three rows left the tracker and
their numbers are not reused:

| Row | What it was | Why it is not tracked |
|---|---|---|
| 21.2 | SSV operator 1056, "Lido - Encapsulate", owner `0x1007…8262` | no validators, inactive; a second registration beside the live one |
| 22 | SSV operator 469, "KingSuper", owner `0xa8e7…5B98` | no validators, inactive; the operator from before the rename |
| 23 | the Sui validator candidate "dummyvalidator" `0xeac3…09ec` | a candidate that never joined the set; our Sui validator is row 15 |

Row 21 is operator 924 alone: the one that runs the 500 Lido validators.

## Found on the way (2026-09-29)

The Agoric chain page's "Our validator" button pointed at `agoric.explorers.guru`, which now answers 404 (the site is
gone; Agoric's own `main.explorer.agoric.net` redirects to Mintscan). It and the row's Explorer are Mintscan's page for
the validator now, read in Chrome to show "Encapsulate, Active" (`notion/chain-pages.json`, `chain_pages.py --buttons
Agoric`). Every other mainnet row's Explorer answered; Gitopia's and ixo's ping.pub pages load without the validator's
data, as before, and Mintscan has no ixo.

## Espresso — the profile lives on the node (2026-09-29)

The stake table holds only an address (`updateMetadataUri`); ours is the node's own metrics page,
`http://validator.espresso.mainnet.encapsulate.xyz:8088/status/metrics`, which the node fills from its
`ESPRESSO_NODE_IDENTITY_*` variables. Those are set in `encapsulate-xyz/espresso-ansible` (public),
`roles/node/templates/mainnet/general.env.j2`. **Pull request [#16](https://github.com/encapsulate-xyz/espresso-ansible/pull/16)**
changes the description there (merged 2026-09-29); the node is then restarted — nothing is signed. **The restart is the
user's**: the host refuses the `~/.ssh/ansible` key on the user's laptop (one key offered, "Too many authentication
failures"), and no other key was tried. The repo's full playbook also rebuilds the binary with cargo on the host; for
this change only the environment file and a restart are needed.

**The description in that file has no commas, on purpose.** Espresso reads the metrics page with the `prometheus-parse`
crate (0.2.5, in both `staking-ui-service` and `staking-cli`), whose `Labels::parse` splits the label list on every
comma, quoted or not: with the agreed text as written the dashboard would show only "Validator infrastructure for new
chains". Quoting does not help — the repo's own history shows the old description going in quoted with its commas and
losing them ten minutes later (76907a9, 2026-05-20). So the file carries the agreed words as sentences:

> Validator infrastructure for new chains since 2020. Early to testnet. Quick to upgrade. Easy to reach. Trusted by Sui NEAR Monad Lido Starknet and more.

Row 19 (pointing the stake table at `espresso-mainnet.json` in the assets repo, which carries the full text and the
node's `pub_key`) is optional now: it is the only way to show the commas.

## The ops repo, `encapsulate-xyz/titanium` (private) — reviewed 2026-09-29

Its pull request #49 (merged) put the agreed description into `DETAILS` of the 12 Cosmos settings files and
`VALIDATOR_DESCRIPTION` of Sui, IOTA and Ika — all 15 exact, nothing old left anywhere in the repo. **On-chain nothing
changes until each chain's script is run.** What the review found beyond the pull request:

| # | Finding | What to do |
|---|---|---|
| 1 | **Every Cosmos settings file has `COMMISSION_RATE=0.07`, and both `edit_validator.js` and `exec_authz.js` send the rate whenever it is set.** On-chain the rates are 2% (Sommelier), 5% (Agoric, Althea, Gitopia, humans.ai, Passage), 8% (Lumera), 9% (Axelar) and 10% (Chain4Energy, Gravity Bridge, ixo, Terra). Every one of those changes is within the chain's allowed step, so a description run would also set commission to 7% on all twelve | run the edit with `COMMISSION_RATE` empty, or set each file to the chain's own rate |
| 2 | Espresso's `METADATA_URI` is still the node's own `http://…:8088` address | point it at `espresso-mainnet.json` in the assets repo, then `update_metadata_uri.js` |
| 3 | NEAR has no script for `pool-details.near`; its description and Discord link are still the old ones | a small script or one `near call … update_field` per field |
| 4 | Sui, IOTA and Ika need `update_validator_info.js` run; on Ika it also fixes the empty website and the logo field | run per chain |
| 5 | The older Agoric validator (`…3dmv32`, still bonded, "fka KingSuper") is not in any settings file — titanium says it is being unbonded | leave it |
| 6 | A design mock in `ui/design/` prints "Encapsulate (fka KingSuper)" | optional |

## Mina, Minascan — submitted 2026-09-29

Sent through Minascan's MetaHub form (a Typeform; "to update, fill out the same form and send it again"). **It was
submitted before the user could review it** — they had wanted to look first. Values: name Encapsulate, the agreed
description, logo by link (the assets repo's `encapsulate.png`), validator `B62qjWmF…FaRYY`, website, contact
`security@encapsulate.xyz`, X `https://x.com/encapHQ`, GitHub, Discord `https://discord.gg/PQJX5JVS8h`; and, carried
over from the profile as it stood: fee 5%, payout "1 / month", Discord contact "kingsuper". Telegram and additional
terms left empty. **The site's Mina chain page says rewards are paid "every two epochs — about 15 days"; Minascan and
the chain's own record say monthly** — one of the two wants correcting.

## What every profile should say

| Field | Value |
|---|---|
| Name | Encapsulate (never "fka KingSuper", "KingSuper" or "Encapsulate Limited") |
| Description | Validator infrastructure for new chains, since 2020. Early to testnet, quick to upgrade, easy to reach. Trusted by Sui, NEAR, Monad, Lido, Starknet and more. |
| Where a field is shorter than 157 characters | the first two sentences (103), or the first alone (52) |
| Website | `https://encapsulate.xyz` — no `www.`, no `http:`, no trailing slash |
| X | `https://x.com/encapHQ` (`x.com/encapsulate_xyz` is suspended) |
| Discord | `https://discord.gg/PQJX5JVS8h` — made by the user on 2026-09-29 from the announcement channel; never expires, no use limit (Discord's API and the server's invite list). The invite before it, `q6cmGycxsr` (from `#moderator-only`, 81 uses), **still works and must not be revoked** while on-chain profiles carry it. `discord.com/invite/S5x4e2AHVV` has expired |
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
