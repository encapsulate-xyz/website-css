# Where Encapsulate is listed — the fix list (checked 2026-09-29, read-only)

Asked for on 2026-09-29 (audit item 11, "Get mentioned where engines look"): brand mentions track AI-answer
visibility more closely than links do, so every public profile of ours should carry the name **Encapsulate**,
the site **https://encapsulate.xyz** and the X account **@encapHQ**. Three read-only checks: the 12 Cosmos-SDK
validators' on-chain profiles, the other chains' profiles, and the directories and registries. Nothing was changed.

**Facts found along the way**
- `x.com/encapsulate_xyz` is **suspended**; several listings still link it. The live account is **@encapHQ**.
- The Discord invite `discord.com/invite/S5x4e2AHVV` has **expired**; the site's `discord.gg/q6cmGycxsr` works (replaced on 2026-09-29 by `discord.gg/PQJX5JVS8h`, made from the announcement channel).
- `king.super.site` returns 404 (no redirect); `kingsuper.org` 301s to `https://encapsulate.xyz/`.
- No profile carries a mistyped domain; the Cosmos website fields are all exactly `https://encapsulate.xyz`.
- Descriptions come in three versions ("Others trust, we validate!…", "five years… 40+ networks… nearly half a
  billion", "$500 million… since 2020") — none matches the site (since 2020, 27 mainnets, 35 chains).
  **Agreed 2026-09-29, one description everywhere:** "Validator infrastructure for new chains, since 2020. Early to
  testnet, quick to upgrade, easy to reach. Trusted by Sui, NEAR, Monad, Lido, Starknet and more." (157 characters,
  no figures; a shorter field takes the first sentence, or the first two). No long version. If we leave one of the
  five named chains, every profile needs the edit.

## In order of value

| # | Place | What it shows now | Fix | Who |
|---|---|---|---|---|
| 1 | **StakingRewards.com** (the most-cited aggregator) | only `/provider/kingsuper`: "KingSuper", crown logo, no website, X `_KingSuper_` | Claim the profile (free, providers.stakingrewards.com) or use their contact form: name Encapsulate, logo, `https://encapsulate.xyz`, @encapHQ | You |
| 2 | **EigenLayer operator** `0xA6c3…2062` (also feeds validator.info) | "Encapsulate (fka KingSuper)", X suspended, old description | Host a new metadata.json (name, @encapHQ, description) and call `updateOperatorMetadataURI` on the DelegationManager from the operator address; or a PR to `Layr-Labs/eigendata` (slow) | Ops |
| 3 | **Suspended X link** — SSV operators 924 and 1056, Monad registry, Symbiotic | `x.com/encapsulate_xyz` (Symbiotic also the expired Discord) | SSV app → edit operator metadata; PR to `monad-developers/validator-info` (mainnet + testnet); PR to `symbioticfi/metadata-mainnet` | Ops / PR |
| 4 | **Cosmos monikers** — Terra, Agoric (the older validator), Althea, Gitopia, Gravity Bridge, humans.ai, Passage, Sommelier, Chain4Energy | "Encapsulate (fka KingSuper)" + "Others trust, we validate!…" | `<binary> tx staking edit-validator --new-moniker "Encapsulate" --details "<the agreed description>"` with each operator key; the other four (Axelar, Agoric, ixo, Lumera) only need the new details | Ops |
| 5 | **REStake / cosmos.directory registry** (`eco-stake/validator-registry`) | not listed | PR adding `Encapsulate/profile.json` (name, identity `B68A51B88F28CEF1`, website) and `chains.json` with the valoper addresses | PR |
| 6 | **X @encapHQ** | Website field is a Linktree | Set it to `https://encapsulate.xyz`; bio says "40+ networks" | You |
| 7 | **Minascan** (Staketab; minaexplorer redirects here) | "Encapsulate (fka KingSuper)", `http://encapsulate.xyz/`, X `_KingSuper_`, expired Discord | Resubmit their "Submit service" form (manual review ~24h) | You |
| 8 | **terra-money/validator-profiles** | "KingSuper", crown logo, website `https://king.super.site` (404) | PR: README (name, website, text), logo, profile.json contacts | PR |
| 9 | **awesome-celestia**, **awesome-berachain-validators** | "fka KingSuper"; dead `*.kingsuper.services` endpoints, 404 `encapsulate.xyz/snapshots/*` links, dead cutting-board link | PRs removing the dead links and the old name | PR |
| 10 | **Ika** (on-chain metadata, Ikascan) | `project_url` empty, `description` empty, `image_url` is the text "Encapsulate" | `set_validator_metadata` via a PTB with the operation cap (or Ikascan's "Get Listed") | Ops |

## Smaller

| Place | What it shows | Fix | Who |
|---|---|---|---|
| Supra (SupraScan) | "Unknown" | Ask Supra / SupraScan for a label (no self-serve route) | You |
| Zilliqa staking portal (`Zilliqa/zq2-staking`) | no website | PR adding `[encapsulate.xyz](https://encapsulate.xyz)` to the description, as other pools do | PR |
| Starknet — Endur dashboard | "Encapsulate Limited", no website | Ask Endur | You |
| Mina — Auro list (`aurowallet/launch`) | `https://www.encapsulate.xyz` (works, redirects) | Optional PR: the apex URL and the new description | PR |
| Monad, Espresso | trailing `/` on the website; Espresso's metadata URI is plain http on the node (`:8088`) — blank when the node is down | Optional | Ops |
| Avalanche (Avascan) | no website | Contact Avascan (Telegram support) | You |
| Keybase `B68A51B88F28CEF1` (Mintscan, Keplr, cosmos.directory logo) | no proofs | Add X, GitHub and website proofs | You |
| GitHub org `encapsulate-xyz` | not domain-verified; README links the expired Discord; old tagline; email `contact@` (site uses `hello@`) | Settings → Verified domains; README → `discord.gg/q6cmGycxsr` | You |
| X @_KingSuper_ (old account) | no website | Add `https://encapsulate.xyz` | You |
| LinkedIn | About text stale ("$248 million… 40+ networks") | Optional | You |
| SSV operator 469 (legacy, 0 validators) | "KingSuper", `kingsuper.org` | Edit its metadata or remove the operator | Ops |
| Lido research forum | username "KingSuper"; a post links `https://king.super.site/` | Rename, add the website, edit the post | You |
| Sui | old validator `0x970f…` still "fka KingSuper" with ~12,000 SUI delegated; a pending candidate `0xeac3…` named "dummyvalidator" | Ask delegators to move; `request_remove_validator_candidate` | Ops |
| IOTA, Zilliqa | old tagline in the description | With the agreed text | Ops |
| Avail, Vara | no identity image (Subscan shows an identicon) | Optional `identity.setIdentity` with an image | Ops |
| Wikidata | no entity | Optional: create one (official website, X, GitHub) | You |

## Already right
Every Cosmos validator's website field; Sui, IOTA, NEAR, Avail, Vara website fields; Voyager (Starknet); Mintscan;
LinkedIn's website; the Lido operators page (the cluster name); XMTP docs; the site's own Discord invite.

## Not checked
Keplr's dashboard, Mintscan's rendered pages (JS only — its API was read), Nodes.Guru and staking-explorer
(404 / JS only), Crunchbase and CryptoRank (403), StarKey (needs the extension), Nearblocks (rate-limited),
Suivision/Slush/IOTA/Vara/Avail staking UIs (they read the on-chain fields above).
