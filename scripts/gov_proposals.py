"""Turn the upgrade rows added by gov_upgrades.py into improvement-proposal rows.

Run: python3 scripts/gov_proposals.py --dry     (prints every change)
     python3 scripts/gov_proposals.py           (writes)

Why: the Governance Record is a record of what we voted on, so a row has to read like the proposal
it is — "ACP-176 · Dynamic EVM Gas Limits and Price Discovery Updates", not "AvalancheGo v1.13.0".
The release rows written on 2026-09-17 were the wrong shape (the user: "this looks like a voting
database not the upgrade database").

Where each reference comes from, all public and checked by hand against the release notes:

  Avalanche  the release note names the ACPs the upgrade activates, so each ACP becomes its own
             row, titled from the ACP's own README (avalanche-foundation/ACPs)
  NEAR       nearcore release notes link the NEPs a protocol version stabilises (near/NEPs)
  Mina       the Mesa hard fork carries MIP-0006…0009 (MinaProtocol/MIPs)
  EigenCloud each core release implements named ELIPs (eigenfoundation/ELIPs)

  Sui, IOTA, Zilliqa, Starknet, Monad have no proposal document behind these upgrades — the vote is
  the protocol-version vote itself (Sui/IOTA) or running the fork build (the rest). Those rows keep
  an empty reference and are retitled to read as the protocol change, never as a release tag.

`Proposal Id` is rich text, not a number, so it can hold "ACP-176".
"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from notion import api, rows, val, GOVERNANCE_DB

ACP = "https://github.com/avalanche-foundation/ACPs/blob/main/ACPs/%s/README.md"
NEP = "https://github.com/near/NEPs/blob/master/neps/nep-%s.md"
MIP = "https://github.com/MinaProtocol/MIPs/blob/main/MIPS/%s"
ELIP = "https://github.com/eigenfoundation/ELIPs/blob/main/ELIPs/%s"

# (chain, reference, title, date, proof, rationale) — one row per proposal.
PROPOSALS = [
    # Avalanche — Fortuna (v1.13.0), Granite (v1.14.0), Helicon (v1.15.0)
    ("Avalanche", "ACP-176", "Dynamic EVM Gas Limits and Price Discovery Updates", "2025-03-24",
     ACP % "176-dynamic-evm-gas-limit-and-price-discovery-updates",
     "Lets validators move the C-Chain gas target with demand instead of a fixed ceiling; we ran Fortuna before activation."),
    ("Avalanche", "ACP-181", "P-Chain Epoched Views", "2025-11-05",
     ACP % "181-p-chain-epoched-views",
     "Gives subnets a stable validator view per epoch, which is what makes L1 validation predictable for us to operate."),
    ("Avalanche", "ACP-204", "Precompile for secp256r1 Curve Support", "2025-11-05",
     ACP % "204-precompile-secp256r1",
     "A cheap precompile for passkey-style signatures; no operational cost to us and it widens what builds on the C-Chain."),
    ("Avalanche", "ACP-226", "Dynamic Minimum Block Times", "2025-11-05",
     ACP % "226-dynamic-minimum-block-times",
     "Block delay adjusts to load rather than sitting at a constant, so latency improves without asking more of the validator set."),
    ("Avalanche", "ACP-194", "Continuous Execution", "2026-09-08",
     ACP % "194-continuous-execution",
     "Separates consensus from execution so throughput is no longer capped by execution inside the round; we upgraded ahead of Helicon."),
    ("Avalanche", "ACP-236", "Auto-Renewed Staking", "2026-09-08",
     ACP % "236-auto-renewed-staking",
     "Removes the re-stake gap at the end of a validation period — good for delegators and for uptime on our nodes."),
    ("Avalanche", "ACP-267", "Increase Validator Uptime Requirement from 80% to 90%", "2026-09-08",
     ACP % "267-uptime-requirement-increase",
     "A higher bar for rewards is right for the network, and we run well above 90%."),
    ("Avalanche", "ACP-273", "Reduce Minimum Validator Staking Duration", "2026-09-08",
     ACP % "273-reduce-minimum-staking-duration",
     "A shorter minimum term lowers the commitment a new validator has to make without weakening the set."),
    ("Avalanche", "ACP-283", "Dynamic Minimum Gas Price", "2026-09-08",
     ACP % "283-dynamic-minimum-gas-price",
     "Lets the floor price fall when the chain is quiet, so fees track actual demand."),
    ("Avalanche", "ACP-285", "Reduce Minimum Consumption Rate", "2026-09-08",
     ACP % "285-reduce-minimum-consumption-rate",
     "Trims issuance at the low end of the staking curve; we back a leaner emission schedule."),

    # NEAR — the NEPs each protocol version stabilised
    ("Near", "NEP-568", "Resharding V3", "2025-03-11", NEP % "0568",
     "Resharding without stopping the chain, and the shard layouts the mainnet now runs; we voted the version in once our nodes were on it."),
    ("Near", "NEP-584", "Cross-shard Bandwidth Scheduler", "2025-03-11", NEP % "0584",
     "Schedules receipts between shards so cross-shard throughput stops being the bottleneck."),
    ("Near", "NEP-591", "Global Contracts", "2025-05-07", NEP % "0591",
     "One deployed contract many accounts can reference — less state to store and less for us to serve."),
    ("Near", "NEP-611", "Pending Transaction Queue and Gas Keys", "2026-07-09", NEP % "0611",
     "Gas keys let an app pay for its users' transactions natively; we ran the release that stabilised it."),
    ("Near", "NEP-642", "Account Creation Cost Increase", "2026-07-09", NEP % "0642",
     "Prices account creation closer to the state it costs the validator set to keep."),

    # Mina — the Mesa hard fork
    ("Mina", "MIP-0006", "Reduce Slot Time to 90s", "2026-09-03", MIP % "mip-0006-slot-reduction-90s.md",
     "Faster slots mean faster finality for users; our block producers were ready for the shorter window."),
    ("Mina", "MIP-0007", "Increase On-Chain State Size Limit", "2026-09-03", MIP % "mip-0007-increase-state-size-limit.md",
     "More on-chain state per zkApp account, at a cost we can carry."),
    ("Mina", "MIP-0008", "Increase Events and Actions Limit", "2026-09-03", MIP % "mip-0008-increase-events-actions-limit.md",
     "Raises the events and actions a transaction may emit, which zkApps had been working around."),
    ("Mina", "MIP-0009", "Increase zkApp Account Update Limit", "2026-09-03", MIP % "mip-0009-increase-zkapp-account-update-limit.md",
     "More account updates per transaction, so a zkApp call need not be split."),

    # EigenCloud — the ELIPs each core release shipped
    ("EigenCloud", "ELIP-013", "Slashing UX Improvements", "2026-01-16", ELIP % "ELIP-013.md",
     "Splits the allocation contracts and clears the sharp edges operators hit around slashing."),
    ("EigenCloud", "ELIP-012", "The Incentives Committee", "2026-03-24", ELIP % "ELIP-012.md",
     "Replaces the fixed programmatic incentives flow with a committee that can steer it; we prefer a reviewable process."),
    ("EigenCloud", "ELIP-014", "Rewards v2.2 — Operator Set Rewards with Unique and Total Stake", "2026-03-24",
     ELIP % "ELIP-014.md",
     "Rewards paid against operator sets rather than the old flat split, which is how we are actually allocated."),
    ("EigenCloud", "ELIP-015", "Duration Vault Strategies", "2026-03-24", ELIP % "ELIP-015.md",
     "A time-bound vault primitive for AVSs; it gives stake a term instead of an open commitment."),
    ("EigenCloud", "ELIP-016", "Redistribution Delay", "2026-06-25", ELIP % "ELIP-016.md",
     "A mandatory delay before slashed shares can be redistributed — a safety margin we want in the pipeline."),
    ("EigenCloud", "ELIP-017", "Duration Vault Fixes", "2026-06-25", ELIP % "ELIP-017.md",
     "Fixes the duration vault edge case found after ELIP-015 shipped."),
]

# Rows with no proposal document: (chain, old title) -> new title. The vote is the protocol-version
# vote (Sui, IOTA, NEAR) or running the fork build (Zilliqa, Starknet, Monad, Mina point releases).
RETITLE = {
    ("Sui", "Protocol version 115 (sui-node mainnet v1.67.3)"): "Protocol upgrade to version 115",
    ("Sui", "Protocol version 120 (sui-node mainnet v1.69.2)"): "Protocol upgrade to version 120",
    ("Sui", "Protocol version 123 (sui-node mainnet v1.72.2)"): "Protocol upgrade to version 123",
    ("Sui", "Protocol version 127 (sui-node mainnet v1.74.1)"): "Protocol upgrade to version 127",
    ("Sui", "Protocol version 130 (sui-node mainnet v1.76.1)"): "Protocol upgrade to version 130",
    ("Sui", "Protocol version 135 (sui-node mainnet v1.79.1)"): "Protocol upgrade to version 135",
    ("IOTA", "Protocol version 30 (iota-node v1.27.0)"): "Protocol upgrade to version 30",
    ("IOTA", "Protocol version 32 (iota-node v1.29.0)"): "Protocol upgrade to version 32",
    ("IOTA", "Protocol version 33 (iota-node v1.30.1)"): "Protocol upgrade to version 33",
    ("IOTA", "Protocol version 34 (iota-node v1.31.2)"): "Protocol upgrade to version 34",
    ("Near", "Protocol version 80 (nearcore 2.8.0)"): "Protocol upgrade to version 80",
    ("Near", "Protocol version 81 (nearcore 2.9.0)"): "Protocol upgrade to version 81",
    ("Near", "Protocol version 82 (nearcore 2.10.0)"): "Protocol upgrade to version 82",
    ("Near", "Protocol version 83 (nearcore 2.11.0)"): "Protocol upgrade to version 83",
    ("Near", "Protocol version 84 (nearcore 2.12.0)"): "Protocol upgrade to version 84",
    ("Zilliqa", "Hard fork — zq2 v0.18.0"): "Hard fork — protocol upgrade to zq2 v0.18",
    ("Zilliqa", "Hard fork — zq2 v0.19.0"): "Hard fork — protocol upgrade to zq2 v0.19",
    ("Zilliqa", "Hard fork — zq2 v0.20.0"): "Hard fork — protocol upgrade to zq2 v0.20",
    ("Zilliqa", "Zilliqa 2.0 hard fork (zq2 v0.21.0)"): "Zilliqa 2.0 hard fork",
    ("Starknet", "Juno v0.16.0 — breaking release"): "Starknet v0.14 consensus upgrade (Juno v0.16.0)",
    ("Starknet", "Juno v0.16.5 — breaking release"): "Starknet attestation upgrade (Juno v0.16.5)",
    ("Starknet", "Juno v0.16.6 — validator release"): "Starknet validator upgrade (Juno v0.16.6)",
    ("Monad", "monad-bft v0.15.0 — validator release"): "Consensus upgrade — monad-bft v0.15",
    ("Monad", "monad-bft v0.16.0 — validator release"): "Consensus upgrade — monad-bft v0.16",
    ("Mina", "Mainnet 3.3.0 release"): "Mainnet upgrade 3.3 — daemon consensus changes",
    ("Mina", "Mainnet 3.4.0 release"): "Mainnet upgrade 3.4 — pre-Mesa daemon",
    ("Mina", "Mainnet 3.5.0 stop-slot release"): "Mesa stop-slot upgrade (mainnet 3.5)",
}

# The rows the proposals replace: every row whose proof is "View Release" on these chains.
REPLACED = {"Avalanche", "Near", "Mina", "EigenCloud"}
KEEP_TITLES = set(t for (_c, t) in RETITLE)


def id_is_text():
    db = api("GET", "databases/" + GOVERNANCE_DB)
    return (db.get("properties", {}).get("Reference", {}).get("type")) == "rich_text"


def make_id_text(dry):
    if id_is_text():
        return
    print("Proposal Id: number -> rich text")
    if not dry:
        r = api("PATCH", "databases/" + GOVERNANCE_DB,
                {"properties": {"Reference": {"rich_text": {}}}})
        if r.get("error"):
            raise SystemExit("could not change Proposal Id: %s" % str(r)[:200])


def props(chain, ref, title, date, proof, why):
    p = {
        "Proposal": {"title": [{"type": "text", "text": {"content": title}}]},
        "Network": {"select": {"name": chain}},
        "Our vote": {"select": {"name": "YES"}},
        "Voted on": {"date": {"start": date}},
        "Proof": {"rich_text": [{"type": "text",
                                        "text": {"content": "View Proposal", "link": {"url": proof}}}]},
        "Rationale": {"rich_text": [{"type": "text", "text": {"content": why}}]},
        "Reference": {"rich_text": ([{"type": "text", "text": {"content": ref}}] if ref else [])},
    }
    return p


def main(dry=False):
    make_id_text(dry)
    current = rows()
    upgrades = [r for r in current if val(r, "Proof") in ("View Release", "View Proposal")]
    have = {(val(r, "Network"), val(r, "Proposal")): r for r in current}

    # 1. the proposal rows
    added = 0
    for chain, ref, title, date, proof, why in PROPOSALS:
        row = have.get((chain, title))
        body = props(chain, ref, title, date, proof, why)
        if row:
            if val(row, "Reference") == ref:
                continue
            print("update  %-11s %-9s %s" % (chain, ref, title))
            if not dry:
                api("PATCH", "pages/" + row["id"], {"properties": body})
                time.sleep(0.34)
            continue
        print("add     %-11s %-9s %s" % (chain, ref, title))
        added += 1
        if not dry:
            r = api("POST", "pages", {"parent": {"database_id": GOVERNANCE_DB}, "properties": body})
            if r.get("error"):
                raise SystemExit("add failed: %s" % str(r)[:200])
            time.sleep(0.34)

    # 2. retitle the version-vote rows
    for row in upgrades:
        chain, title = val(row, "Network"), val(row, "Proposal")
        new = RETITLE.get((chain, title))
        if not new:
            continue
        print("retitle %-11s %s  ->  %s" % (chain, title, new))
        if not dry:
            api("PATCH", "pages/" + row["id"], {"properties": {
                "Proposal": {"title": [{"type": "text", "text": {"content": new}}]},
                "Reference": {"rich_text": []}}})
            time.sleep(0.34)

    # 3. archive the release rows the proposals replace
    keep = {(c, t) for c, _r, t, _d, _p, _w in PROPOSALS} | {(c, RETITLE[(c, t)]) for (c, t) in RETITLE}
    for row in upgrades:
        chain, title = val(row, "Network"), val(row, "Proposal")
        if chain not in REPLACED or (chain, title) in keep or (chain, title) in RETITLE:
            continue
        print("archive %-11s %s" % (chain, title))
        if not dry:
            api("PATCH", "pages/" + row["id"], {"archived": True})
            time.sleep(0.34)
    print("%d proposal rows %s" % (added, "would be added" if dry else "added"))
    return 0


if __name__ == "__main__":
    sys.exit(main(dry="--dry" in sys.argv))
