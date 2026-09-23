# Services page — answers for the design

What Encapsulate builds and runs for others, gathered on 2026-09-23 from the `encapsulate-xyz`
GitHub org (`platform-ansible`, `monitor-ansible`, the `*-ansible` repos and the tools' own repos).
Everything not answerable from the repos is listed at the end under **Open questions**.

Screenshots are in `shots/`, taken at **1400×788 @2x** (2800×1576) in headless Chrome.

---

## Dashboards

| Dashboard | Chain | URL | What it shows | Status | Screenshot |
|---|---|---|---|---|---|
| Sui RGP Dashboard | Sui | https://rgp.sui.encapsulate.xyz | Every Sui validator's Reference Gas Price against the network's: stale quotes, large drift, who is updating next epoch, with history and charts — and a page to update your own RGP | Live | `shots/sui-rgp.png` |
| Solana Network Visualization | Solana | https://graph.solana.mainnet.encapsulate.xyz | The Solana staking ecosystem as a graph: network → clients → validators → top delegators, sized by stake; hover for stake, commission, Jito commission, APY, version, country | Live | `shots/solana-graph.png` |
| Aptos Validator Network | Aptos | https://graph.aptos.mainnet.encapsulate.xyz | The Aptos validator set on a map, from Aptos's own `validator_stats_v2.json` | Live (URL answers 200) — see open questions | — |

---

## Playbooks

One row per repository behind a network on /networks. "Sets up" is read from each repo's roles.

| Repository | Chain / family | Visibility | Sets up |
|---|---|---|---|
| [cosmos-ansible](https://github.com/encapsulate-xyz/cosmos-ansible) | Cosmos SDK — Agoric, Althea, Axelar, Chain4Energy, Gitopia, Gravity Bridge, humans.ai, ixo, Lumera, Passage, Pell, Sommelier, Terra | Public | Cosmos SDK validators and their sidecars: Axelar vald/tofnd, Gravity and Sommelier orchestrators, Steward, price feeder, Lumera supernode, state sync |
| [amplifier-ansible](https://github.com/encapsulate-xyz/amplifier-ansible) | Axelar | Public | Axelar Amplifier verifier: ampd, tofnd, the handlers and metrics |
| [ethereum-ansible](https://github.com/encapsulate-xyz/ethereum-ansible) | Ethereum — SSV.network, Lido¹ | Public | Execution (Geth, Nethermind) and consensus (Lighthouse, Prysm) clients, MEV-Boost, and DVT: SSV nodes and DKG, Obol Charon, Lodestar, ejector and exits |
| [avalanche-ansible](https://github.com/encapsulate-xyz/avalanche-ansible) | Avalanche | Public | An AvalancheGo validator node |
| [monad-ansible](https://github.com/encapsulate-xyz/monad-ansible) | Monad | Public | Monad consensus and execution, RPC, MEV, OpenTelemetry and metrics, mainnet and testnet |
| [near-ansible](https://github.com/encapsulate-xyz/near-ansible) | Near | Public | A NEAR validator node |
| [sui-ansible](https://github.com/encapsulate-xyz/sui-ansible) | Sui | Public | Sui validator, full node and bridge node, a Hashi node, snapshot sync |
| [eigenlayer-ansible](https://github.com/encapsulate-xyz/eigenlayer-ansible) | EigenCloud | Public | EigenDA operator and eOracle |
| [iota-ansible](https://github.com/encapsulate-xyz/iota-ansible) | IOTA | Public | An IOTA validator node with snapshot sync |
| [mina-ansible](https://github.com/encapsulate-xyz/mina-ansible) | Mina | Public | A Mina block producer |
| [starknet-ansible](https://github.com/encapsulate-xyz/starknet-ansible) | Starknet | Public | A Starknet node and the staking attestor |
| [zilliqa-ansible](https://github.com/encapsulate-xyz/zilliqa-ansible) | Zilliqa | Public | A Zilliqa 2 node with Scilla, stats agent and sync monitor |
| [avail-ansible](https://github.com/encapsulate-xyz/avail-ansible) | Avail | Public | An Avail validator with metrics and sync |
| [espresso-ansible](https://github.com/encapsulate-xyz/espresso-ansible) | Espresso | Public | An Espresso node |
| [ika-ansible](https://github.com/encapsulate-xyz/ika-ansible) | Ika | Public | An Ika validator node |
| [supra-ansible](https://github.com/encapsulate-xyz/supra-ansible) | Supra | Public | Supra validator and RPC full node, with snapshot sync |
| [genlayer-ansible](https://github.com/encapsulate-xyz/genlayer-ansible) | GenLayer | Public | A GenLayer node with its webdriver and Alloy |
| [pharos-ansible](https://github.com/encapsulate-xyz/pharos-ansible) | Pharos | Public | A Pharos node with a pushgateway |
| [aztec-ansible](https://github.com/encapsulate-xyz/aztec-ansible) | Aztec | Public | An Aztec sequencer |
| [canton-ansible](https://github.com/encapsulate-xyz/canton-ansible) | Canton Network | Public | A Canton validator: participant, app, wallet and CNS |
| [spicenet-ansible](https://github.com/encapsulate-xyz/spicenet-ansible) | Spicenet | Public | A Spicenet node |
| [gnoland-ansible](https://github.com/encapsulate-xyz/gnoland-ansible) | Gno.land | Public | A gno.land node with sync |
| [vara-ansible](https://github.com/encapsulate-xyz/vara-ansible) | Vara | **Private** | A Vara validator with metrics |
| [xmtp-ansible](https://github.com/encapsulate-xyz/xmtp-ansible) | XMTP | **Private** | An XMTP node with MLS and pruning |

¹ Lido has no repo of its own; it is assumed to run through Simple DVT on the Obol and SSV
clusters in ethereum-ansible. Not confirmed.

Terra and Pell point at cosmos-ansible by choice: `terra-ansible` is private (and is where Terra's
upgrades are actually made), and `pell-ansible` is a copy of the Sui bridge repo with no Pell in it.

### Objects — a real file

`sui-ansible/roles/node/tasks/main.yml` (public repo), lines 1–33:

```yaml
- name: Include the ufw vars file
  ansible.builtin.include_vars:
    file: vars/ufw_rules.yml

- name: Apply UFW rules
  ansible.builtin.include_tasks: tasks/apply_ufw_rules.yml
  loop: "{{ node_ufw_rules[type] }}"

- name: Include user creation task for sui
  ansible.builtin.include_tasks: tasks/create_user_and_directories.yml
  vars:
    home: "{{ node_home_dir }}"
    directories: "{{ node_directories }}"
    log_file_path: "{{ node_log_file_path }}"

- name: Copy node configuration file
  ansible.builtin.template:
    src: "{{ env }}/{{ type }}/config.yaml.j2"
    dest: "{{ node_config_file_path }}"
    owner: "{{ service_identifier }}"
    group: "{{ service_identifier }}"
    mode: "0644"
  notify:
    - Restart service
```

---

## Bots

All three are Discord bots, deployed by `platform-ansible`. Their messages carry the footer
"Made with 🤖 by Encapsulate".

| Bot | Chain | What it posts | Where it posts |
|---|---|---|---|
| Proposal bot (`cosmos-bots`) | Axelar, Althea, Gravity Bridge, humans.ai | Every new governance proposal — id, title, type, status, description and an explorer link — pinging the chain's governance role; on a forum channel it opens a thread per proposal and cross-posts a link to it. A proposal whose links fail the malicious-link check is posted with a warning instead | Each chain's own Discord server. Other servers can add it: the repo's notes say an invite works as long as the bot is allowed to create roles |
| Sui alert bot (`sui-alert-bot`) | Sui | Epoch progress and network parameters (kept as one live message each, edited in place), validator changes, gas-price changes, and a direct "⚠️ Update your Reference Gas Price ⚠️" alert to validators who subscribed with `!subscribe` / `!alert` | A Sui Discord server, in four channels (validator updates, epoch progress, network params, alerts) |
| GitBell (`gitbell-axelar`) | Axelar | "A new Release is Out" — owner, repo and latest release — whenever a chain Axelar connects to publishes a release, pinging the Axelar **Validator** and **Verifier** roles | Axelar's Discord server |

**Example post** — the proposal bot, from its own repo (`shots/bot-proposal.png`, 1254×798):

> Hey @Validator
> **ℹ️ A new Governance Proposal is Out**
> *Check the below details for more information:*
> **Id** 36 · **View on explorer** Proposal 36
> **Title** Increase active validator set to 420! · **Type** cosmos.params.v1beta1.ParameterChangeProposal · **Status** PROPOSAL_STATUS_REJECTED

That is a real render but of a joke test proposal ("If you don't agree, also vote yes") — see open questions.

---

## Monitoring and scripts

The open-source part — each links to a public repo:

| Repo | Chain | Kind | What it does |
|---|---|---|---|
| [solana-monitoring-ops](https://github.com/encapsulate-xyz/solana-monitoring-ops) | Solana | Monitoring | An Ansible playbook for a full Solana monitoring stack: Prometheus, Grafana, Loki/Promtail, Alertmanager, node and Solana exporters |
| [story-grafana](https://github.com/encapsulate-xyz/story-grafana) | Story | Monitoring | A Grafana dashboard for a Story node's consensus, execution and system health |
| [sui-rgp-autopilot](https://github.com/encapsulate-xyz/sui-rgp-autopilot) | Sui | Script | Works out and publishes a sensible Reference Gas Price for any Sui validator |
| [story-installer-tui](https://github.com/encapsulate-xyz/story-installer-tui) | Story | Script | A one-line terminal interface to install and manage a Story node |

None of the four has a LICENSE file yet.

**The signals we alert on** (`monitor-ansible`, Prometheus → Alertmanager → PagerDuty):

| Signal | From |
|---|---|
| Missed blocks and validator uptime | Tenderduty (Cosmos chains) and each chain's exporter |
| Validator jailed | Jailmon, checked against three public APIs per chain |
| Node down, out of sync, peers, disk, memory, CPU | node, process and chain exporters |
| Upcoming chain upgrades | upgrade alerts |
| Low operator balances | balance alerts |
| Public endpoints down | blackbox probes |
| Log errors above threshold | Loki rules |
| Our own bots and the RGP autopilot silent | pushgateway heartbeats |

Chains with their own rule sets: Avalanche, Axelar, Aztec, Canton, Cosmos, EigenDA, Espresso,
Ethereum (execution + consensus), GenLayer, Gno.land, Hashi, Ika, IOTA (oracle, SSFN), Mina,
Monad, Move chains, NEAR, Pharos, SSV, Starknet, Substrate, Sui bridge, Supra, XMTP, Zilliqa.

---

## Open questions — what the repos could not answer

| Question | Why it is open |
|---|---|
| **"the graph network"** — is that the Aptos Validator Network, or something else? | There is no The Graph repo in the org; Aptos is the only other graph |
| **Aptos screenshot** | The page answers 200 and its data file loads, but the app renders nothing in headless Chrome — take it by hand in a browser, or check the page is actually working |
| **A Monad dashboard** | Nothing in the org: `monad-ansible` (the node), `monad-staking-sdk-cli` and `monad-validator-info` (both forks). If one is planned, it is "in progress" with no URL yet |
| **Celestia checker, Pay-for-Blob, rewards calculator** — on the page or not? | They are live but were not on the list |
| **The Discord servers' names**, and whether the Sui alert bot and GitBell can be added to other servers | The config holds channel ids only; the proposal bot is the only one whose notes mention adding it elsewhere |
| **Real example posts** for the Sui alert bot and GitBell, and a better one for the proposal bot | Only the one screenshot exists in the repos; the others have to be captured from Discord |
| **What a team actually gets from monitoring** — a shared board, alerts to their channel, or read-only access | Everything in `monitor-ansible` is for our own validators; nothing sets up access for a client |
| **Is "on request" still right?** | A business answer, not in any repo |
| **A shareable Grafana board** | Grafana is behind Tailscale (`*.crane-goldeye.ts.net`); no board can be captured from here |
| **Lido** — is it the Simple DVT clusters in ethereum-ansible? | Inferred from the Obol and SSV roles, not stated anywhere |
| **Vara and XMTP** — link private repos, or leave the link off? | Both repos are private, so a link gives visitors a 404 |
