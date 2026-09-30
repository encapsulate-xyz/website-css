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
def order(x):
    rec = {"yes": 0, "no evidence": 1, "no": 2}.get(str(x.get("recruiting_now", "")).lower(), 1)
    need = x.get("stake_to_be_active_usd")
    if need is None: need = x.get("min_self_stake_usd")
    try: need = float(need)
    except Exception: need = 1e15
    return (x["difficulty"], 1 if x.get("_flag") else 0, TIERS.index(x["_tier"]), rec, need, x["chain"].lower())

early = [key(n) for n in picks.get("testnet_only", [])]
for n in picks.get("testnet_only", []):
    if not any(x["_id"] == key(n) for x in rows): sys.exit("picks.json names a testnet that is not in the research: " + n)
testnets = sorted([x for x in rows if x.get("group") == "our testnet"], key=order)
opening = sorted([x for x in rows if x["_id"] in early and x.get("group") != "our testnet"], key=order)
rest = [x for x in rows if x.get("group") != "our testnet" and x["_id"] not in early]
none = sorted([x for x in rest if x["difficulty"] == 0], key=lambda x: x["chain"].lower())
main = sorted([x for x in rest if x["difficulty"] != 0], key=order)

def render(x, n, level_chip=False):
    d = x["difficulty"]; rec = str(x.get("recruiting_now", "")).lower() == "yes"
    route = ROUTE.get(str(x.get("route", "")).lower(), str(x.get("route") or "Unknown"))
    progs = [p for p in lst(x.get("programmes")) if isinstance(p, dict) and p.get("name")]
    text = " ".join([x["chain"], str(x.get("token") or ""), str(x.get("what") or ""), route, x["_tier"], str(x.get("difficulty_why") or "")] + [p["name"] for p in progs]).lower()
    chips = ('<span class="chip dot" data-d="%d">%s</span>' % (d, e(LEVEL[d][0]))) if level_chip else ""
    chips += '<span class="chip tier" data-tier="%s">%s</span>' % (x["_tier"], x["_tier"])
    chips += '<span class="chip plain">%s</span>' % e(route)
    if x.get("is_l1") is False and d != 0: chips += '<span class="chip plain">Not a layer 1</span>'
    if x.get("_flag"): chips += '<span class="chip dead">%s</span>' % e(x["_flag"]["label"])
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
    kv = [("Validators", seats), ("Our own stake", own), ("To be active", act), ("Hardware", x.get("hardware")), ("Identity checks", x.get("kyc_or_entity")),
          ("Earnings and cost", x.get("economics")), ("Asking now?", x.get("recruiting_evidence")), ("Where to ask", "; ".join(lst(x.get("contacts"))))]
    kvh = "".join("<dt>%s</dt><dd>%s</dd>" % (e(a), linked(b)) for a, b in kv if b not in (None, "", []))
    src = ", ".join('<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(u), e(host(u))) for u in lst(x.get("sources")) if str(u).startswith("http"))
    unk = "; ".join(lst(x.get("unknowns")))
    conf = str(x.get("confidence") or "").lower()
    return ('<li class="row" data-d="{d}" data-rec="{rec}" data-tier="{tier}" data-text="{text}">'
            '<div class="r-head"><button type="button" class="r-toggle" aria-expanded="false"><span class="r-n">{n}</span>'
            '<span class="r-name"><span class="r-title">{chain}<span class="tok">{tok}</span></span><span class="r-what">{what}</span></span></button>'
            '<div class="r-facts"><span><em>Our own stake</em>{own}</span><span><em>To be active</em>{act}</span></div>'
            '<div class="r-meta">{chips}<button type="button" class="chev" tabindex="-1" aria-hidden="true"></button></div></div>'
            '<div class="r-panel" hidden>'
            '{dead}<div class="blk why" data-d="{d}"><span><b>{lv}.</b> {why}</span></div>'
            '<div class="blk next"><span><b>First step.</b> {nxt}</span></div>'
            '{steps}{prog}'
            '<div class="blk wide"><dl class="kv">{kv}</dl></div>'
            '<div class="blk wide src">{conf}{unk}<span>Sources: {src}</span></div>'
            '</div></li>').format(
        dead=('<div class="blk wide dead"><span><b>%s.</b> %s</span></div>' % (e(x["_flag"]["label"]), linked(x["_flag"]["why"]))) if x.get("_flag") else "",
        d=d, rec="yes" if rec else "no", tier=x["_tier"], text=e(text), n="%02d" % n, chain=e(x["chain"]), tok=e(tok(x)), what=linked(x.get("what") or ""),
        own=e(own_s), act=e(act_s), chips=chips, lv=e(LEVEL[d][0]), why=linked(x.get("difficulty_why") or ""), nxt=linked(x.get("best_next_step") or "Not set"),
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

scale = "".join('<a class="lvl" href="#all" data-d="%d"><b>%d</b><strong>%s</strong><span>%s</span></a>'
                % (d, sum(1 for x in main if x["difficulty"] == d), e(LEVEL[d][0]), e(LEVEL[d][1])) for d in (1, 2, 3, 4, 5))

tn = "".join(render(x, i + 1, True) for i, x in enumerate(testnets))
testnet_html = ('<ul class="rows card">%s</ul>' % tn) if tn else '<div class="card empty"><span>None in this research.</span></div>'
op = "".join(render(x, i + 1, True) for i, x in enumerate(opening))
opening_html = ('<ul class="rows card">%s</ul>' % op) if op else '<div class="card empty"><span>None in this research.</span></div>'
none_html = "".join('<li><b>%s <span class="chip tier" data-tier="%s">%s</span></b><span>%s</span></li>' % (e(x["chain"]), x["_tier"], x["_tier"], linked(x.get("difficulty_why") or x.get("what") or "")) for x in none) or "<li><b>None</b><span></span></li>"

by = {x["_id"]: x for x in rows}
if not picks.get("picks"): picks["picks"] = [{"chain": x["chain"], "why": x.get("difficulty_why", "")} for x in main[:6]]
ph = ""
for p in picks["picks"]:
    x = by.get(key(p["chain"]))
    if not x: sys.exit("picks.json names a network that is not in the research: " + p["chain"])
    d = x["difficulty"]
    ph += ('<li class="card pick"><div class="pick-top"><h3>%s</h3><span class="tok">%s</span><span class="chip tier" data-tier="%s">%s</span><span class="chip dot" data-d="%d">%s</span>%s</div><p>%s</p><p class="pick-next"><b>First step.</b> %s</p></li>'
           % (e(x["chain"]), e(tok(x)), x["_tier"], x["_tier"], d, e(LEVEL[d][0]), '<span class="chip yes">Taking operators</span>' if str(x.get("recruiting_now", "")).lower() == "yes" else "",
              linked(p["why"]), linked(p.get("next") or x.get("best_next_step") or "")))

METHOD = picks.get("method") or ""
METHOD_LIST = "".join("<li><b>%s</b><span>%s</span></li>" % (e(a), linked(b)) for a, b in picks.get("method_list", []))

page = open(os.path.join(HERE, "template.html")).read()
for k, v in (("LEVELS", levels), ("SCALE", scale), ("PICKS", ph), ("PICKS_LEDE", e(picks.get("lede", ""))), ("TESTNETS", testnet_html), ("OPENING", opening_html), ("NONE", none_html),
             ("METHOD_LIST", METHOD_LIST), ("METHOD", e(METHOD)), ("EXCLUDED", e(", ".join(OURS))), ("CHECKED", e(CHECKED)), ("N", str(len(main)))):
    page = page.replace("{{%s}}" % k, v)
assert "{{" not in page, re.findall(r"\{\{[A-Z_]+\}\}", page)
open(OUT, "w").write(page)
print("networks", len(main), {d: sum(1 for x in main if x["difficulty"] == d) for d in (1, 2, 3, 4, 5)}, "| our testnets", len(testnets), "| open testnets", len(opening), "| no role", len(none),
      "| tiers", {t: sum(1 for x in rows if x["_tier"] == t) for t in TIERS}, "| taking operators", sum(1 for x in main if str(x.get("recruiting_now", "")).lower() == "yes"), "| bytes", len(page))
