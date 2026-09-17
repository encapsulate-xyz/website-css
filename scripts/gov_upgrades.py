"""Find the upgrades on the god and high tier chains that asked something of the validator, and
add the missing ones to the Governance Record.

Run: python3 scripts/gov_upgrades.py --dry     (prints what it would add)
     python3 scripts/gov_upgrades.py           (writes the missing rows)

What counts (the user's rule, 2026-09-17): a proposal or release that required a **vote** or a
**software upgrade by the validator**. Everything else — weekly maintenance releases, rc/alpha
builds, testnet-only tags — is left out.

Where each chain's truth lives. All of these are public and need no key:

  Avalanche   ava-labs/avalanchego        a release whose notes say "must upgrade"; the named
                                          network upgrade (Helicon, Granite, Fortuna…) is in them
  NEAR        near/nearcore               "protocol version N" plus the date voting opens — NEAR
                                          counts a validator's vote only if it runs the code
  Sui         MystenLabs/sui              mainnet-* releases, "Protocol Version: N"; two thirds of
                                          the stake must vote the version in
  IOTA        iotaledger/iota             [Mainnet] releases, same shape as Sui
  Zilliqa     Zilliqa/zq2                 releases whose notes contain a hard fork
  Mina        MinaProtocol/mina           mainnet hard-fork and stop-slot releases
  Starknet    NethermindEth/juno          the client the validator attests with; breaking releases
  EigenCloud  Layr-Labs/eigenlayer-contracts   protocol releases operators are exposed to
  Monad       category-labs/monad-bft     consensus client releases

The date written is the release's own date (or the day voting opens where the notes give it) —
never today's. On chains with no on-chain vote the row is YES because running the release is how
support is expressed, and the rationale says so.
"""
import json, os, re, sys, time, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from notion import api, rows, val, GOVERNANCE_DB

GH = "https://github.com/%s/releases/tag/%s"
REPOS = {
    "Avalanche":  "ava-labs/avalanchego",
    "Near":       "near/nearcore",
    "Sui":        "MystenLabs/sui",
    "IOTA":       "iotaledger/iota",
    "Zilliqa":    "Zilliqa/zq2",
    "Mina":       "MinaProtocol/mina",
    "Starknet":   "NethermindEth/juno",
    "EigenCloud": "Layr-Labs/eigenlayer-contracts",
    "Monad":      "category-labs/monad-bft",
}


def releases(repo, per_page=100):
    req = urllib.request.Request(
        "https://api.github.com/repos/%s/releases?per_page=%d" % (repo, per_page),
        headers={"User-Agent": "encapsulate-website", "Accept": "application/vnd.github+json",
                 **({"Authorization": "Bearer " + os.environ["GITHUB_TOKEN"]}
                    if os.environ.get("GITHUB_TOKEN") else {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def candidates(chain, since="2025-01-01"):
    """(title, proposal id or None, date, proof url, why) for each release that asked for action."""
    out = []
    for r in releases(REPOS[chain]):
        tag, body, when = r["tag_name"], (r.get("body") or ""), r["published_at"][:10]
        if when < since or r.get("prerelease"):
            continue
        url, low = GH % (REPOS[chain], tag), body.lower()
        if chain == "Avalanche":
            if "must upgrade" not in low or "-fuji" in tag:
                continue
            named = re.search(r"\b(Helicon|Granite|Fortuna|Etna|Durango)\b", body)
            out.append(("%s network upgrade (AvalancheGo %s)" % (named.group(1) if named else "Network", tag),
                        None, when, url,
                        "Mandatory release with a set activation: every mainnet node had to run it in time."))
        elif chain == "Near":
            m = re.search(r"protocol version from (\d+) to (\d+)", body, re.I)
            v = re.search(r"[Vv]oting for protocol version (\d+)[^.\n]*?on ([A-Za-z0-9,\- :]+?UTC)", body)
            if not (m or v) or re.search(r"rc\.|beta", tag):
                continue
            version = int((m.group(2) if m else v.group(1)))
            out.append(("Protocol version %d (nearcore %s)" % (version, tag), version, when, url,
                        "Voted the version in once our nodes ran the release — NEAR counts the vote only then."))
        elif chain in ("Sui", "IOTA"):
            if chain == "Sui" and not tag.startswith("mainnet-"):
                continue
            if chain == "IOTA" and "[Mainnet]" not in (r.get("name") or ""):
                continue
            pv = re.search(r"[Pp]rotocol [Vv]ersion[:\s]*(\d+)", body)
            if not pv:
                continue
            out.append(("Protocol version %s (%s)" % (pv.group(1), tag), int(pv.group(1)), when, url,
                        "The version switches only when the stake votes for it, and only a node on the release can vote."))
        elif chain == "Zilliqa":
            if "hard fork" not in low or not re.match(r"^v\d+\.\d+\.\d+$", tag):
                continue
            out.append(("Hard fork — zq2 %s" % tag, None, when, url,
                        "A hard fork: a node that does not upgrade forks itself off the chain."))
        elif chain == "Mina":
            name = r.get("name") or tag
            if not re.search(r"mainnet", name, re.I) or not re.search(r"hard.?fork|stop.?slot|stable", low + name.lower()):
                continue
            out.append((name, None, when, url,
                        "Block producers had to be on this build for the chain to pass the transition cleanly."))
        elif chain == "Starknet":
            if "breaking" not in low:
                continue
            out.append(("Juno %s — breaking release" % tag, None, when, url,
                        "Starknet attestations come from the node, so the node has to be current."))
        elif chain == "EigenCloud":
            # only the named releases — the patch tags carry no operator-facing change
            name = (r.get("name") or "").split(":")[-1].strip()
            if re.search(r"rc\.|testnet", tag) or not name or name.lstrip("v") == tag.lstrip("v"):
                continue
            out.append(("EigenLayer %s — %s" % (tag, name), None, when, url,
                        "A protocol release that changes what operators are exposed to."))
        elif chain == "Monad":
            if not re.match(r"^v\d+\.\d+\.0$", tag):
                continue
            out.append(("monad-bft %s — validator release" % tag, None, when, url,
                        "Consensus client release for the validator set; staying current is the obligation."))
    return out


def existing_titles():
    return {(val(r, "Network"), val(r, "Proposal")) for r in rows(GOVERNANCE_DB)}


def add(chain, title, pid, date, proof, why):
    props = {
        "Proposal": {"title": [{"type": "text", "text": {"content": title}}]},
        "Network": {"select": {"name": chain}},
        "Our vote": {"select": {"name": "YES"}},
        "Voted on": {"date": {"start": date}},
        "Proof": {"rich_text": [{"type": "text",
                                        "text": {"content": "View Release", "link": {"url": proof}}}]},
        "Rationale": {"rich_text": [{"type": "text", "text": {"content": why}}]},
    }
    if pid is not None:
        props["Reference"] = {"number": pid}
    return api("POST", "pages", {"parent": {"database_id": GOVERNANCE_DB}, "properties": props})


def main(dry=False, chains=None):
    have = existing_titles()
    added = 0
    for chain in (chains or REPOS):
        for title, pid, date, proof, why in candidates(chain):
            if (chain, title) in have:
                continue
            print("%-11s %s  %s" % (chain, date, title))
            added += 1
            if dry:
                continue
            res = add(chain, title, pid, date, proof, why)
            if res.get("error"):
                print("  FAIL", str(res)[:160]); return 1
            time.sleep(0.34)
    print("%d rows %s" % (added, "would be added (dry run)" if dry else "added"))
    return 0


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sys.exit(main(dry="--dry" in sys.argv, chains=args or None))
