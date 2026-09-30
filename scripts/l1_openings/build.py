"""Builds the layer 1 openings page (an artifact, "Encapsulate L1 Openings") from the research files.

    DATA=<folder with research-*.json and picks.json> OUT=<path> python3 scripts/l1_openings/build.py

Each research file is a list of objects, one per network, in the shape the research brief asks for (BRIEF.md in the
data folder). picks.json names the networks for "Start here", in order, with one line each. The research is kept out
of this public repo: it says what we could afford and whom we would approach."""
import glob, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.environ.get("DATA") or os.path.join(HERE, "research")
OUT = os.environ.get("OUT") or os.path.join(HERE, "encapsulate-l1-openings.html")
CHECKED = os.environ.get("CHECKED") or "30 Sep 2026"

OURS = ["Agoric", "Althea", "Avail", "Avalanche", "Axelar", "Chain4Energy", "EigenCloud", "Espresso", "Gitopia", "Gravity Bridge", "IOTA", "Ika",
        "Lido DVT", "Lumera", "Mina", "Monad", "Near", "Passage", "Sommelier", "Starknet", "Sui", "Supra", "Terra", "Vara", "Zilliqa", "humans.ai", "ixo"]
LEVEL = {1: ("Open now", "Open to anyone, seats free, a few thousand dollars of our own at most. Live within weeks."),
         2: ("Within reach", "Open to join at a cost we can carry, or an application with regular rounds."),
         3: ("Needs backing", "A seat needs delegated stake we do not have, or a contested application or vote."),
         4: ("Hard", "Large capital, an invitation, or very few seats."),
         5: ("Closed", "A council, a fixed set, or a price no operator pays. No road in today."),
         0: ("No validator role", "")}
ROUTE = {"permissionless": "Open to anyone", "application": "By application", "delegation programme": "Delegation programme",
         "governance vote": "By governance vote", "invitation": "By invitation", "closed": "Closed", "not applicable": "No validator role"}

def e(s): return html.escape(str(s), quote=True)
def key(name): return re.sub(r"[^a-z0-9]", "", str(name).lower())
def linked(text):
    out, k, text = "", 0, str(text)
    for m in re.finditer(r"https?://[^\s<>\"')\]]+", text):
        u = m.group(0).rstrip(".,;:")
        out += e(text[k:m.start()]) + '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(u), e(u))
        k = m.start() + len(u)
    return out + e(text[k:])
def host(u):
    m = re.match(r"https?://([^/]+)", u or ""); return (m.group(1) if m else u).replace("www.", "")
def cap(t): return t[:1].upper() + t[1:]
def usd(n):
    if n in (None, "", 0) and n != 0: return ""
    try: n = float(n)
    except Exception: return ""
    if n >= 1e9: return "$%.1fB" % (n / 1e9)
    if n >= 1e6: return "$%.1fM" % (n / 1e6)
    if n >= 10000: return "$%s" % format(int(round(n, -2)), ",")
    return "$%s" % format(int(round(n)), ",")
def tok(x):
    """The ticker alone: research wrote things like 'CC (Canton Coin)' and 'None yet (a token is planned)'."""
    t = re.split(r"\s*[(;,]", str(x.get("token") or "").strip())[0].strip()
    return "" if re.match(r"(?i)(none|not |no )", t + " ") or len(t) > 12 else t
def lst(v):
    if v is None: return []
    if isinstance(v, str): return [v] if v.strip() else []
    return [x for x in v if x not in (None, "")]

rows, seen = [], set()
for f in sorted(glob.glob(os.path.join(DATA, "research-*.json"))):
    for x in json.load(open(f)):
        if not isinstance(x, dict) or not x.get("chain"): continue
        k = key(x["chain"])
        if k in seen or any(key(o) == k for o in OURS): continue
        seen.add(k)
        try: x["difficulty"] = int(x.get("difficulty"))
        except Exception: x["difficulty"] = 3
        if x["difficulty"] not in LEVEL: x["difficulty"] = 3
        x["_file"] = os.path.basename(f); x["_id"] = k
        rows.append(x)
if not rows: sys.exit("no research files in " + DATA)

# picks.json may correct an entry after a check by hand ("overrides": {chain: {key: value}}), flag the networks
# that are easy to join and not worth joining ("flags": {chain: {"label": "Winding down", "why": reason}}) and leave
# a network out ("drop": [chain]). "rename" gives a network a shorter name for the page; every other list in the
# file names a network as the research does.
picks_file = os.path.join(DATA, "picks.json")
picks = json.load(open(picks_file)) if os.path.exists(picks_file) else {}
for name, fix in (picks.get("overrides") or {}).items():
    hit = [x for x in rows if x["_id"] == key(name)]
    if not hit: sys.exit("picks.json overrides a network that is not in the research: " + name)
    hit[0].update(fix); hit[0]["_checked"] = True
for name, flag in (picks.get("flags") or {}).items():
    hit = [x for x in rows if x["_id"] == key(name)]
    if not hit: sys.exit("picks.json flags a network that is not in the research: " + name)
    hit[0]["_flag"] = flag
for name, new in (picks.get("rename") or {}).items():
    hit = [x for x in rows if x["_id"] == key(name)]
    if not hit: sys.exit("picks.json renames a network that is not in the research: " + name)
    hit[0]["chain"] = new
rows = [x for x in rows if x["_id"] not in [key(n) for n in picks.get("drop", [])]]
# every network carries a tier on the Networks set's own scale ("tiers": {chain: "god"|"high"|"medium"|"low"|"filth"})
TIERS = ["god", "high", "medium", "low", "filth"]
tiers = {key(n): t for n, t in (picks.get("tiers") or {}).items()}
for x in rows:
    t = tiers.get(x["_id"])
    if t not in TIERS: sys.exit("picks.json gives no tier (or an unknown one) for " + x["chain"])
    x["_tier"] = t
for x in rows:
    try: x["difficulty"] = int(x.get("difficulty"))
    except Exception: x["difficulty"] = 3

# the review mark: one button per network, shown only when the page's database is there (the page script unhides it)
RV = '<button type="button" class="rv" data-rv="%s" aria-pressed="false" hidden><span class="rv-box" aria-hidden="true"></span><span class="rv-t">Mark reviewed</span></button>'

REWARDS = {}
_rw = os.path.join(DATA, "rewards.json")
if os.path.exists(_rw):
    REWARDS = {key(k): v for k, v in json.load(open(_rw)).items()}

DEFAULT_COMMISSION = 0.10   # a newcomer's commission where the chain shows no median: ours is 9–10% on the Cosmos chains

def earns(x):
    """What a validator seat is worth a year to a newcomer: the average voting power on the chain (total staked over the
    active set, in dollars) and the commission that stake pays at the chain's current rate — plus the rate on the
    minimum own stake. A chain that pays validators a fixed sum carries earns_usd instead. Returns a dict or None."""
    r = REWARDS.get(x["_id"]) or {}
    apr, src, note = r.get("apr"), r.get("source") or "", r.get("note") or ""
    if isinstance(r.get("earns_usd"), (int, float)):
        return {"usd": r["earns_usd"], "fixed": True, "apr": apr, "src": src, "note": note}
    total, n = r.get("total_staked_usd"), r.get("active_validators") or x.get("validators_now")
    if not (isinstance(apr, (int, float)) and isinstance(total, (int, float)) and total > 0 and isinstance(n, (int, float)) and n > 0):
        # something is missing: say what, with the research's own note (no rewards yet, no fixed set, no market…)
        if not r: return None
        return {"usd": None, "apr": apr, "total": total, "n": n, "src": src, "note": note}
    avg = total / n
    com = r.get("median_commission") if isinstance(r.get("median_commission"), (int, float)) else DEFAULT_COMMISSION
    own = x.get("min_self_stake_usd") if isinstance(x.get("min_self_stake_usd"), (int, float)) else 0
    # where a "validator" is one fixed-size key (Ethereum, Gnosis, PulseChain, Waterfall: tens of thousands of them) an
    # operator's income scales with the keys it runs, so the figure is per key, not per seat
    if n > 20000:
        return {"usd": apr * avg * com, "avg": avg, "n": int(n), "total": total, "com": com, "apr": apr, "own": 0, "src": src, "note": note, "key": True}
    return {"usd": apr * avg * com + apr * own, "avg": avg, "n": int(n), "total": total, "com": com, "apr": apr, "own": own, "src": src, "note": note}

def earns_short(x):
    v = earns(x)
    if not v or v.get("usd") is None: return "—" if x["difficulty"] else ""
    if v.get("fixed"): return ("None" if not v["usd"] else usd(v["usd"])) + " <i>%s</i>" % ("no staking" if not v["usd"] else "fixed pay")
    if v.get("key"): return usd(v["usd"]) + " <i>per key</i>"
    return usd(v["usd"]) + " <i>avg seat %s</i>" % usd(v["avg"])

def earns_long(x):
    v = earns(x)
    if not v: return None
    link = (' (<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>)' % (e(v["src"]), e(host(v["src"])))) if v.get("src") else ""
    if v.get("fixed"):
        if not v["usd"]: return "Nothing — validators here are not paid from staking. %s%s" % (e(v.get("note", "")), link)
        return "%s a year — validators here are paid a fixed sum, not a rate. %s%s" % (usd(v["usd"]), e(v.get("note", "")), link)
    if v.get("usd") is None:
        have = []
        if isinstance(v.get("apr"), (int, float)): have.append("the chain pays about %.1f%% a year on staked tokens" % (v["apr"] * 100))
        if isinstance(v.get("total"), (int, float)) and v["total"]: have.append("%s is staked" % usd(v["total"]))
        if isinstance(v.get("n"), (int, float)) and v["n"]: have.append("%d validators are in the set" % v["n"])
        head = (cap(", ".join(have)) + ", but the seat's worth cannot be worked out. ") if have else "Not worked out. "
        return head + e(v.get("note", "")) + link
    if v.get("key"):
        return ("Here a validator is one fixed-size key: %s keys hold %s, %s a key, and a key earns about %s a year at the chain's %.1f%%. "
                "An operator earns its commission on the keys it runs for others — about <b>%s a key a year</b> at %d%% — so income grows with the keys run, not with one seat%s%s") % (
            format(v["n"], ","), usd(v["total"]), usd(v["avg"]), usd(v["avg"] * v["apr"]), v["apr"] * 100, usd(v["usd"]), round(v["com"] * 100),
            ("; " + e(v["note"])) if v.get("note") else "", link)
    own = (" plus about %s on the minimum own stake" % usd(v["apr"] * v["own"])) if v["own"] and v["apr"] * v["own"] >= 1 else ""
    return ("The average validator holds %s of stake — %s staked over %s in the set. At the chain's %.1f%% rate and %d%% commission that pays about <b>%s a year</b>%s. "
            "A new seat starts far below the average and grows only with delegations%s%s") % (
        usd(v["avg"]), usd(v["total"]), format(v["n"], ","), v["apr"] * 100, round(v["com"] * 100), usd(v["usd"]), own, ("; " + e(v["note"])) if v.get("note") else "", link)

def money(x, a, b):
    t = str(x.get(a) or "").strip(); n = x.get(b); u = usd(n)
    if isinstance(n, (int, float)) and n < 1: u = "" if n == 0 else "under $1"
    if t and u and u not in t: return "%s (%s)" % (t.rstrip("."), u if u.startswith("under") else "about " + u)
    return t or u or "Not found"
def short(x, a, b):
    """The closed row's figure: the dollar amount, or a word when there is none."""
    n = x.get(b)
    if isinstance(n, (int, float)):
        if n == 0: return "None"
        if n < 1: return "Under $1"
        return usd(n)
    t = str(x.get(a) or "").strip()
    if not t or x["difficulty"] == 0: return "Not published" if x["difficulty"] else ""
    if re.match(r"(?i)not applicable", t): return "No seat yet"
    if re.match(r"(?i)(none|no )", t): return "None"
    return "Not published"
def whenShort(x):
    """The closed row's mainnet figure for an upcoming network: the date or target, or a word."""
    w = str(x.get("mainnet_when") or "").strip()
    if not w or re.match(r"(?i)not published", w): return "Not published"
    m = re.search(r"(?i)(live|launched)", w)
    if m and len(w) > 30: return "Live"
    m = re.search(r"(?i)((Q[1-4]|H[12])\s*\d{4}|(early|mid|late|spring|summer|autumn|fall|winter)\s+\d{4}|\b(20\d\d)\b)", w)
    return m.group(1) if m else (w if len(w) <= 22 else "See inside")
def order(x):
    rec = {"yes": 0, "no evidence": 1, "no": 2}.get(str(x.get("recruiting_now", "")).lower(), 1)
    need = x.get("stake_to_be_active_usd")
    if need is None: need = x.get("min_self_stake_usd")
    try: need = float(need)
    except Exception: need = 1e15
    return (x["difficulty"], 1 if x.get("_flag") else 0, TIERS.index(x["_tier"]), rec, need, x["chain"].lower())

# "upcoming": not on mainnet yet, or a mainnet whose validator set is still being selected (the research's own
# group, or a name in picks.json's testnet_only list). They stand in their own section, ordered like the rest.
early = [key(n) for n in picks.get("testnet_only", [])]
for n in picks.get("testnet_only", []):
    if not any(x["_id"] == key(n) for x in rows): sys.exit("picks.json names a testnet that is not in the research: " + n)
for x in rows:
    if x["_id"] in early and x.get("group") != "our testnet": x["group"] = "upcoming"
testnets = sorted([x for x in rows if x.get("group") == "our testnet"], key=order)
opening = sorted([x for x in rows if x.get("group") == "upcoming" and x["difficulty"] != 0], key=order)
rest = [x for x in rows if x.get("group") not in ("our testnet", "upcoming")] + [x for x in rows if x.get("group") == "upcoming" and x["difficulty"] == 0]
none = sorted([x for x in rest if x["difficulty"] == 0], key=lambda x: x["chain"].lower())
main = sorted([x for x in rest if x["difficulty"] != 0], key=order)

def render(x, n, level_chip=False):
    d = x["difficulty"]; rec = str(x.get("recruiting_now", "")).lower() == "yes"
    route = ROUTE.get(str(x.get("route", "")).lower(), str(x.get("route") or "Unknown"))
    progs = [p for p in lst(x.get("programmes")) if isinstance(p, dict) and p.get("name")]
    help_open = any(str(p.get("open_now", "")).lower() == "yes" for p in progs)
    text = " ".join([x["chain"], str(x.get("token") or ""), str(x.get("what") or ""), route, x["_tier"], str(x.get("difficulty_why") or "")] + [p["name"] for p in progs]).lower()
    chips = ('<span class="chip dot" data-d="%d">%s</span>' % (d, e(LEVEL[d][0]))) if level_chip else ""
    chips += '<span class="chip tier" data-tier="%s">%s</span>' % (x["_tier"], x["_tier"])
    chips += '<span class="chip plain">%s</span>' % e(route)
    if x.get("is_l1") is False and d != 0: chips += '<span class="chip plain">Not a layer 1</span>'
    stage = str(x.get("stage") or "").strip()
    if stage: chips += '<span class="chip plain stage">%s</span>' % e(stage[0].upper() + stage[1:])
    if x.get("_flag"): chips += '<span class="chip %s">%s</span>' % ("in" if x["_flag"]["label"] == "Already in" else "dead", e(x["_flag"]["label"]))
    if rec: chips += '<span class="chip yes">Taking operators</span>'
    own, act = money(x, "min_self_stake", "min_self_stake_usd"), money(x, "stake_to_be_active", "stake_to_be_active_usd")
    own_s, act_s = short(x, "min_self_stake", "min_self_stake_usd"), short(x, "stake_to_be_active", "stake_to_be_active_usd")
    vals = x.get("validators_now"); cap = x.get("seat_cap")
    seats = ("%s validators" % format(int(vals), ",") if isinstance(vals, (int, float)) else "Not found") + ((", of %s seats" % format(int(cap), ",")) if isinstance(cap, (int, float)) else "")
    steps = "".join("<li>%s</li>" % linked(s) for s in lst(x.get("steps")))
    prog = "".join('<li><div class="p-top">%s<span class="chip %s">%s</span></div><span>%s</span>%s</li>' % (
        e(p["name"]), "yes" if str(p.get("open_now", "")).lower() == "yes" else "plain",
        {"yes": "Open now", "no": "Closed now"}.get(str(p.get("open_now", "")).lower(), "Not known if open"),
        linked(p.get("gives") or ""), ('<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(p["url"]), e(host(p["url"])))) if p.get("url") else "") for p in progs)
    earn_long = earns_long(x)
    kv = [("Stage", stage or None), ("Mainnet", x.get("mainnet_when")), ("Testnet to mainnet", x.get("testnet_to_mainnet")), ("Funding", x.get("funding")),
          ("Validators", seats), ("Our own stake", own), ("To be active", act), ("Earns a year", earn_long), ("Hardware", x.get("hardware")), ("Identity checks", x.get("kyc_or_entity")),
          ("Earnings and cost", x.get("economics")), ("Asking now?", x.get("recruiting_evidence")), ("Where to ask", "; ".join(lst(x.get("contacts"))))]
    kvh = "".join("<dt>%s</dt><dd>%s</dd>" % (e(a), b if a == "Earns a year" else linked(b)) for a, b in kv if b not in (None, "", []))
    src = ", ".join('<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(u), e(host(u))) for u in lst(x.get("sources")) if str(u).startswith("http"))
    unk = "; ".join(lst(x.get("unknowns")))
    conf = str(x.get("confidence") or "").lower()
    return ('<li class="row" data-key="{key}" data-d="{d}" data-rec="{rec}" data-help="{help}" data-tier="{tier}" data-text="{text}">'
            '<div class="r-head"><button type="button" class="r-toggle" aria-expanded="false"><span class="r-n">{n}</span>'
            '<span class="r-name"><span class="r-title">{chain}<span class="tok">{tok}</span></span><span class="r-what">{what}</span></span></button>'
            '<div class="r-facts"><span><em>Our own stake</em>{own}</span><span><em>{f2}</em>{act}</span><span><em>Earns a year</em><span>{earn}</span></span></div>'
            '<div class="r-meta">{chips}{rv}<button type="button" class="chev" tabindex="-1" aria-hidden="true"></button></div></div>'
            '<div class="r-panel" hidden>'
            '{dead}<div class="blk why" data-d="{d}"><span><b>{lv}.</b> {why}</span></div>'
            '<div class="blk next"><span><b>First step.</b> {nxt}</span></div>'
            '{steps}{prog}'
            '<div class="blk wide"><dl class="kv">{kv}</dl></div>'
            '<div class="blk wide src">{conf}{unk}<span>Sources: {src}</span></div>'
            '</div></li>').format(
        dead=('<div class="blk wide %s"><span><b>%s.</b> %s</span></div>' % ("in" if x["_flag"]["label"] == "Already in" else "dead", e(x["_flag"]["label"]), linked(x["_flag"]["why"]))) if x.get("_flag") else "",
        d=d, rec="yes" if rec else "no", help="yes" if help_open else "no", tier=x["_tier"], text=e(text), n="%02d" % n, chain=e(x["chain"]), tok=e(tok(x)), what=linked(x.get("what") or ""),
        earn=earns_short(x), key=x["_id"], rv=(RV % x["_id"]),
        own=e(own_s), f2="Mainnet" if x.get("group") == "upcoming" else "To be active",
        act=e(whenShort(x) if x.get("group") == "upcoming" else act_s), chips=chips, lv=e(LEVEL[d][0]), why=linked(x.get("difficulty_why") or ""), nxt=linked(x.get("best_next_step") or "Not set"),
        steps=('<div class="blk"><h4>How to join</h4><ol>%s</ol></div>' % steps) if steps else "",
        prog=('<div class="blk"><h4>Help for a newcomer</h4><ul class="prog">%s</ul></div>' % prog) if prog else '<div class="blk"><h4>Help for a newcomer</h4><p class="unk">No programme found.</p></div>',
        kv=kvh, conf=('<span>Confidence in this entry: %s.</span> ' % e(conf)) if conf else "",
        unk=('<span class="unk">Not found: %s.</span> ' % linked(unk)) if unk else "", src=src or "none recorded")

levels, n = "", 0
for d in (1, 2, 3, 4, 5):
    grp = [x for x in main if x["difficulty"] == d]
    if not grp: continue
    body = ""
    for x in grp:
        n += 1; body += render(x, n)
    levels += ('<div class="level" data-d="%d" id="level-%d"><div class="l-head"><h3>%s</h3><p>%s</p><span class="count">%d</span></div><ul class="rows card">%s</ul></div>'
               % (d, d, e(LEVEL[d][0]), e(LEVEL[d][1]), len(grp), body))

# the scale counts every network with a level — the ranked list, our testnets and the upcoming ones — the same
# count the rail's level filter shows, so the two agree on one screen
levelled = main + testnets + opening
scale = "".join('<a class="lvl" href="#all" data-d="%d"><b>%d</b><strong>%s</strong><span>%s</span></a>'
                % (d, sum(1 for x in levelled if x["difficulty"] == d), e(LEVEL[d][0]), e(LEVEL[d][1])) for d in (1, 2, 3, 4, 5))

tn = "".join(render(x, i + 1, True) for i, x in enumerate(testnets))
testnet_html = ('<ul class="rows card">%s</ul>' % tn) if tn else '<div class="card empty"><span>None in this research.</span></div>'
op = "".join(render(x, i + 1, True) for i, x in enumerate(opening))
opening_html = ('<ul class="rows card">%s</ul>' % op) if op else '<div class="card empty"><span>None in this research.</span></div>'
# a no-role line carries the same filter attributes as a row (level 0: it shows only under "All")
none_html = "".join('<li data-key="%s" data-d="0" data-rec="no" data-help="no" data-tier="%s" data-text="%s"><b>%s <span class="chip tier" data-tier="%s">%s</span></b><span>%s %s</span></li>'
                    % (x["_id"], x["_tier"], e(" ".join([x["chain"], str(x.get("token") or ""), x["_tier"], str(x.get("what") or ""), str(x.get("difficulty_why") or "")]).lower()),
                       e(x["chain"]), x["_tier"], x["_tier"], linked(x.get("difficulty_why") or x.get("what") or ""), RV % x["_id"]) for x in none) or "<li><b>None</b><span></span></li>"

by = {x["_id"]: x for x in rows}
if not picks.get("picks"): picks["picks"] = [{"chain": x["chain"], "why": x.get("difficulty_why", "")} for x in main[:6]]
ph = ""
for p in picks["picks"]:
    x = by.get(key(p["chain"]))
    if not x: sys.exit("picks.json names a network that is not in the research: " + p["chain"])
    d = x["difficulty"]
    rec = str(x.get("recruiting_now", "")).lower() == "yes"
    # a pick carries the row's filter attributes too, so the rail's filters reach it
    text = " ".join([x["chain"], str(x.get("token") or ""), x["_tier"], LEVEL[d][0], str(x.get("what") or ""), p["why"], p.get("next") or ""]).lower()
    help_open = any(str(q.get("open_now", "")).lower() == "yes" for q in lst(x.get("programmes")) if isinstance(q, dict))
    ph += ('<li class="card pick" data-key="%s" data-d="%d" data-rec="%s" data-help="%s" data-tier="%s" data-text="%s"><div class="pick-top"><h3>%s</h3><span class="tok">%s</span><span class="chip tier" data-tier="%s">%s</span><span class="chip dot" data-d="%d">%s</span>%s</div><p>%s</p><p class="pick-next"><b>First step.</b> %s</p></li>'
           % (x["_id"], d, "yes" if rec else "no", "yes" if help_open else "no", x["_tier"], e(text), e(x["chain"]), e(tok(x)), x["_tier"], x["_tier"], d, e(LEVEL[d][0]), '<span class="chip yes">Taking operators</span>' if rec else "",
              linked(p["why"]), linked(p.get("next") or x.get("best_next_step") or "")))

METHOD = picks.get("method") or ""
METHOD_LIST = "".join("<li><b>%s</b><span>%s</span></li>" % (e(a), linked(b)) for a, b in picks.get("method_list", []))

page = open(os.path.join(HERE, "template.html")).read()
for k, v in (("LEVELS", levels), ("SCALE", scale), ("PICKS", ph), ("PICKS_LEDE", e(picks.get("lede", ""))), ("TESTNETS", testnet_html), ("OPENING", opening_html), ("NONE", none_html),
             ("METHOD_LIST", METHOD_LIST), ("METHOD", e(METHOD)), ("EXCLUDED", e(", ".join(OURS))), ("CHECKED", e(CHECKED)), ("N", str(len(main))), ("U", str(len(opening)))):
    page = page.replace("{{%s}}" % k, v)
assert "{{" not in page, re.findall(r"\{\{[A-Z_]+\}\}", page)
open(OUT, "w").write(page)
print("networks", len(main), {d: sum(1 for x in main if x["difficulty"] == d) for d in (1, 2, 3, 4, 5)}, "| our testnets", len(testnets), "| upcoming", len(opening), "| no role", len(none),
      "| tiers", {t: sum(1 for x in rows if x["_tier"] == t) for t in TIERS}, "| taking operators", sum(1 for x in main if str(x.get("recruiting_now", "")).lower() == "yes"), "| bytes", len(page))
