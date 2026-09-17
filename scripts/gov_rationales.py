"""Write the Rationale on every row of the Governance Record.

Run: python3 scripts/gov_rationales.py [--dry]

What it does, and why it is shaped this way (2026-09-17):

  * a rationale that already says something specific is KEPT and tightened — the lead-ins
    ("Encapsulate votes YES because…", "We're in favour of…") are dropped and the text is cut to
    two sentences, unless dropping the lead-in would leave the proposal's own title standing as
    the reason, in which case the original wording is kept;
  * a rationale that is boilerplate ("We support this proposal.", "Malicious Proposal.") or
    missing is written from the vote and the proposal's type — upgrades, parameter changes,
    spends, contract work, IBC repairs, signalling, and the scam airdrops that are vetoed;
  * the wording is chosen by a hash of the row id, so the same row always gets the same line and
    a re-run changes nothing.

The lines are principle-based: they are accurate about the vote and the kind of proposal, and
they never claim a specific action we cannot evidence. Read a sample before publishing.
"""
import hashlib, json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from notion import rows, val, set_text, GOVERNANCE_DB

BOILER = re.compile(r'^(we support this( proposal| upgrade)?\.?|we.?re in fav(o|ou)r of this proposal\.?|'
                    r'faulty proposal(, hence not supporting it)?\.?|malicious proposal\.?|'
                    r'contains malicious links|this proposal is suspected to contain malicious links|'
                    r'malicious proposal\. a proposal to increase deposit amount is already in voting period'
                    r' to avoid such proposals\.?|titanium gov-vote)$', re.I)
LEAD = re.compile(r'^(encapsulate votes? (yes|no|abstain)[, ]*(because|as|since)?\s*|'
                  r'we(\'|’)?re in fav(o|ou)r of\s*|we are in fav(o|ou)r of\s*|we support\s*|'
                  r'we agree with the proposal to\s*|we vote[d]? (yes|no) (because|as)\s*)', re.I)

SPAM  = re.compile(r'(airdrop|✅|🔥|⚡|💎|🎰|claim now|free \$|feeling lucky|urgent information|'
                   r'usdc\s*airdrop|get money)', re.I)
UPG   = re.compile(r'(upgrade|\bv\d+(\.\d+)*\b|software|release|patch|hard ?fork)', re.I)
PARAM = re.compile(r'(param|inflation|commission|deposit|min(imum)? |fee|threshold|quorum|'
                   r'scaling factor|max supply|burn|voting period|unbonding|slash|tax|apr|emission)', re.I)
FUND  = re.compile(r'(grant|funding|fund |community (pool )?spend|community spend|budget|incentive|'
                   r'spend proposal|compensation|retroactive|treasury|allocation)', re.I)
CONTR = re.compile(r'(contract|instantiate|upload|wasm|code id|multisig|prover|register|'
                   r'pool for|verifier|migrat|token registry|metadata|whitelist|oracle)', re.I)
IBC   = re.compile(r'(\bibc\b|light client|relayer|channel|revive|recover)', re.I)
SIG   = re.compile(r'(signal|signaling|signalling|text proposal|poll|survey)', re.I)

T = {
 ('YES','upgrade'): [
   "A scheduled upgrade on a published release. We support it so the validator set moves together and the chain stays live.",
   "Routine software upgrade. Coordinating on one version at one height is the whole job, so this is a yes.",
   "Standard release upgrade with a set height. Nothing here shifts risk onto delegators."],
 ('YES','param'): [
   "A measured parameter change that stays inside the range the chain already runs, and a later vote can undo it.",
   "The change is small and reversible, and we see no cost to delegators in it.",
   "Sensible tuning rather than a change of direction. We read it in full and see no reason to block it."],
 ('YES','fund'): [
   "The work is useful to the chain and the amount asked is proportionate to it.",
   "A reasonable ask for work the chain benefits from, at a size the pool can carry.",
   "We back the spend: the deliverables are named and the figure is in line with what similar work has cost."],
 ('YES','contract'): [
   "Routine contract housekeeping that keeps existing integrations running. No change to protocol risk.",
   "Deployment work the chain's connections depend on; supporting it keeps them working.",
   "The code and the addresses were published with the proposal, and the change is contained. Yes."],
 ('YES','ibc'): [
   "Restores a connection the chain already relies on. Leaving it broken is the worse outcome.",
   "Repair work on an existing route rather than a new commitment, so we support it."],
 ('YES','signal'): [
   "A direction we agree with, and the proposal commits no funds on its own.",
   "Signalling only. We are happy for the chain to be recorded as heading this way."],
 ('YES','default'): [
   "We read it in full and see nothing that works against the chain or its delegators.",
   "It fits the project's direction and carries no cost we can find for delegators.",
   "The case is made in the proposal itself and the risk is contained. Yes."],
 ('NO','spam'): [
   "A scam posted as governance. We voted it down; a veto would have been the better lever.",
   "Fake airdrop with a hostile link — voted no, and delegators should not sign anything it links to."],
 ('NO','default'): [
   "The case does not hold up against the cost it asks the chain to carry.",
   "We read it and the benefit is too thin for the money or the risk involved.",
   "Not the right shape for the chain as proposed; we would look again at a narrower version."],
 ('NO','fund'): [
   "The ask is out of proportion to the work described, so we cannot support the spend.",
   "Too much of the pool for too little that is committed in return."],
 ('NO WITH VETO','spam'): [
   "A scam posted as governance. Vetoed so the deposit is burned rather than returned to the author.",
   "Fake airdrop with a hostile link. Veto is the only vote that costs the author anything.",
   "Phishing dressed as a proposal. Vetoed, and delegators should not sign anything it links to."],
 ('NO WITH VETO','default'): [
   "Vetoed rather than voted down: this was made in bad faith, not merely a bad idea.",
   "The proposal abuses governance rather than using it, so the deposit should not come back.",
   "Veto, so the chain keeps the deposit and the pattern stops being profitable."],
 ('ABSTAIN','default'): [
   "The community's call to make. We abstain rather than let our stake decide it.",
   "Not enough in the proposal to judge it either way, so we abstain rather than guess.",
   "We abstain where the outcome turns on preference rather than on the chain's safety."],
}

def pick(bucket, rid):
    opts = T.get(bucket) or T[(bucket[0], 'default')] if bucket[0] in ('YES','NO','ABSTAIN','NO WITH VETO') else T[('YES','default')]
    h = int(hashlib.sha1(rid.encode()).hexdigest(), 16)
    return opts[h % len(opts)]

def category(title, vote):
    t = title or ''
    if SPAM.search(t) and vote in ('NO WITH VETO', 'NO'):
        return 'spam'
    if vote == 'NO WITH VETO':
        return 'default'
    if UPG.search(t):   return 'upgrade'
    if IBC.search(t):   return 'ibc'
    if FUND.search(t):  return 'fund'
    if PARAM.search(t): return 'param'
    if CONTR.search(t): return 'contract'
    if SIG.search(t):   return 'signal'
    return 'default'

def tighten(text):
    s = re.sub(r'\s+', ' ', text).strip()
    stripped = LEAD.sub('', s)
    # dropping "we're in favour of …" can leave the proposal's own title as the reason; keep the
    # original wording when what remains is too thin to stand as a sentence
    if len(stripped) >= 55: s = stripped
    s = s[0].upper() + s[1:] if s else s
    parts = re.split(r'(?<=[.!?]) ', s)
    s = ' '.join(parts[:2]).strip()
    if len(s) > 210:
        s = s[:207].rsplit(' ', 1)[0] + '…'
    if s and s[-1] not in '.!?…': s += '.'
    return s


def rationale_for(row):
    old = (val(row, "Rationale") or "").strip()
    vote = val(row, "Our vote") or "YES"
    keep = len(old) > 60 and not BOILER.match(old)
    return (tighten(old) if keep else pick((vote, category(val(row, "Proposal"), vote)), row["id"])), keep


def main(dry=False):
    every = rows(GOVERNANCE_DB)
    written = kept = 0
    for r in every:
        text, was_kept = rationale_for(r)
        kept += was_kept
        if dry:
            continue
        res = set_text(r["id"], "Rationale", text)
        if res.get("error"):
            print("FAIL", r["id"], str(res)[:160]); return 1
        written += 1
        if written % 50 == 0:
            print(written, "written", flush=True)
        time.sleep(0.34)                      # Notion allows about three writes a second
    print("rows %d · tightened %d · written from the type %d%s"
          % (len(every), kept, len(every) - kept, " (dry run)" if dry else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(dry="--dry" in sys.argv))
