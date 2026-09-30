"""Builds the GitHub Actions plan page (an artifact, "Encapsulate Actions Plan") from the lists below.
The record behind it is notion/github-actions-plan.md; when that changes, change this and rebuild:

    OUT=<path> python3 scripts/actions_plan/build.py

Every "now" was read from Notion and the live site on CHECKED."""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT") or os.path.join(HERE, "encapsulate-actions-plan.html")
CHECKED = "30 Sep 2026"
TIER = {"write": "Writes", "check": "Checks", "report": "Reports", "watch": "Watches", "none": "By hand"}

def e(s): return html.escape(s, quote=True)
def code(s):
    """escaped text; `x` becomes code"""
    return re.sub(r"`([^`]+)`", lambda m: "<code>%s</code>" % m.group(1), e(s))

I = []
def item(id, tier, flow, what, where, now, kept, drift, job, new=False):
    I.append(dict(id=id, tier=tier, flow=flow, what=what, where=where, now=now, kept=kept, drift=drift, job=job, new=new))

G = [
 ("Governance record", "The record page, the homepage's table and the navbar's latest votes"),
 ("Networks and chain pages", "The Networks set in Notion: 27 mainnets, 20 testnets, 35 chains"),
 ("Validator profiles", "What explorers, wallets and registries say about us"),
 ("Homepage", ""),
 ("Security", ""),
 ("Blog and guides", "38 posts and 32 guides"),
 ("Services and investments", ""),
 ("Across the site", ""),
 ("Alerts", "Not site data: these only tell you"),
]
g = lambda name: [x for x in G if x[0] == name][0]

# ---- governance
item("G1", "write", "governance", "New votes on the 12 Cosmos chains", "Governance record",
     "1,153 rows over 29 networks. Last recorded: Terra 11 Sep, Axelar 28 Aug, Agoric 24 Aug, Passage 14 Jul. Gravity Bridge and Sommelier, Nov 2024. None under Althea, humans.ai or Lumera",
     "By hand", "Every vote we cast", "Add the missing rows")
item("G2", "write", "governance", "Protocol upgrades on nine chains", "Governance record",
     "Latest: IOTA and Sui 9 Sep, Avalanche 8 Sep, Mina and Starknet 3 Sep, Monad 4 Aug, Near 9 Jul",
     "`gov_upgrades.py` and `gov_proposals.py`, run by hand", "Every protocol upgrade the validators vote in by running it: a protocol version, an ACP, a NEP, a MIP, a hard fork. Never a plain release (the user, 30 Sep)", "Run on a schedule")
item("G4", "write", "governance", "The rationale on each new row", "Governance record", "Every row has one today",
     "`gov_rationales.py`, run by hand", "Every new row", "Written after G1 and G2 by the same principle-based lines that wrote the 1,153 rows today; no review (decision 5, 30 Sep)")
item("G5", "write", "governance", "“1882 votes cast since 2020”", "Governance record",
     "1882: the 1,153 rows plus 729 votes from before the record was kept", "By hand", "It does not move when a vote is added",
     "Keep it at 729 plus the rows")
item("G3", "none", "—", "Votes on Avail, Espresso, Ika, Supra, Vara and Lido DVT", "Governance record", "Not in the record",
     "Nothing", "Every vote", "Later, one chain at a time")

# ---- networks
item("N1", "write", "networks", "Reward rate and the day it was read", "Networks and chain pages",
     "18 rates dated 24 Sep, 8 dated 29 Sep. Mina is blank on purpose", "By hand", "Daily",
     "Write both together, for rows marked Auto and inside the sanity band")
item("N7", "write", "networks", "Each chain page's facts paragraph and description", "Networks and chain pages",
     "Rewritten by hand on 29 Sep for eight chains", "`chain_pages.py --facts`, run by hand", "Whenever a rate or a commission changes",
     "Rewrite it after every write to N1", new=True)
item("N2", "write", "networks", "Commission", "Networks and chain pages",
     "2% to 38.72%. Eight chains changed on 29 Sep, and the site showed the old figures until a recheck found it", "By hand",
     "Only when we change it", "Write it from the chain; a change re-reads the rate (N1) and rewrites the facts (N7)")
item("N3", "write", "networks", "Unbonding time", "Networks and chain pages", "7 days, 21 days, 2 weeks to a year",
     "By hand, researched once", "When a chain changes its rules", "Write it from the chain's parameters, in the words the row uses")
item("N4", "write", "networks", "Slashing events", "Networks and chain pages", "0 on every chain, Gravity Bridge by decision",
     "By hand, by your rule", "Only on an incident", "Write the count from the chain, through the decisions list (Gravity Bridge stays 0); a new slash also goes in the email")
item("N5", "write", "networks", "Status: active or jailed", "Networks and chain pages", "All active", "By hand", "Only on an incident",
     "Write it from the chain, and email at once (A3)")
item("N6", "write", "networks", "Validators run, on the Lido DVT page", "Networks and chain pages", "500", "By hand",
     "If keys are added or exit", "Write it from Lido's Simple DVT module: operator #43's deposited keys less the exited")
item("C1", "write", "audit", "Chain rules: minimum stake, reward cadence, fees", "Networks and chain pages",
     "Researched once, in `chain-pages.json`", "By hand", "When a chain changes its parameters", "Write what the chain exposes (minimum stake, unbonding); the rest, cadence and wallet links, goes in the email when it no longer matches")
item("C2", "write", "audit", "The green button that still points off the site", "Networks and chain pages",
     "Lido DVT, Vara and Chain4Energy have no guide yet", "By hand", "When their guides exist", "Point it at the guide the moment a Guides row for the chain exists (`chain_pages.py --buttons`)")

# ---- profiles
item("P1", "check", "audit", "Name, description, website and links on every profile", "Validator profiles",
     "48 updates tracked, 24 done on 29 Sep. Fifteen validators read the agreed text on chain", "By hand, from the tracker",
     "An edit on chain, a registry rebuilt from an old file, a pull request left unmerged",
     "Read every profile weekly; what no longer says the agreed values goes in the email (on-chain edits need the operator keys, registries need their forms)", new=True)
item("P2", "report", "audit", "The Discord invite", "Validator profiles", "`discord.gg/PQJX5JVS8h`, set never to expire", "By hand",
     "If it is ever revoked, every profile and guide links nowhere", "Check that it still opens the server; email if it does not (a new invite is yours to make)", new=True)

# ---- homepage
item("H4", "none", "—", "Uptime", "Homepage", "99.96 %", "By hand", "Nothing computes it, and it has no definition yet",
     "Nothing until you define it: which chains, what window, which source")
item("H6", "none", "—", "The heading “Six years”", "Homepage", "Typed", "By hand", "Wrong from 2027. The figures under it are calculated; the heading is not",
     "Fix once, by hand: “Since 2020”")
item("H7", "write", "audit", "“27 secured”, the typed fallback", "Homepage", "27. It said 25 until 29 Sep", "By hand",
     "Visitors see the calculated figure; a crawler reads the typed one", "Write the set's count into the Notion text")

# ---- security
item("S1", "write", "networks", "“0 slashing events since 2020”, twice", "Security", "0", "By hand", "Only on an incident. It has to agree with N4",
     "Write it from N4's total")
item("S2", "none", "—", "“Routine releases inside 24 h” and the other promises", "Security", "Policy", "Fixed", "Only if the policy changes",
     "Nothing: these are promises, not measurements")

# ---- blog and guides
item("B1", "write", "content", "Read minutes on each post", "Blog and guides", "38 posts, all filled", "By hand", "Every new post",
     "Fill it from the post's words")
item("U1", "write", "content", "Steps and time on each guide", "Blog and guides", "32 guides, all filled", "By hand", "Every new guide",
     "Fill it from the guide's own slides")
item("E1", "write", "content", "Social card and description on a new row", "Blog and guides",
     "Every post, chain page and guide has both today", "`og_cards.py`, run by hand", "Every new post, guide or chain",
     "Render the card and write it with the description (`og_cards.py` in the runner's headless Chrome)", new=True)
item("B2", "write", "content", "Lede, chain, ticker and author on each post", "Blog and guides", "All filled", "By hand", "Every new post",
     "Write the Lede from the post's opening, Chain and Ticker when the title or tag names a chain in the set; the Author goes in the email")
item("B3", "write", "content", "Whether a post's chain is live yet", "Blog and guides", "Set per post", "By hand", "When a chain launches",
     "Write Live once the chain has a mainnet row in the set")
item("U2", "report", "content", "Wallet screenshots in the guides", "Blog and guides", "30 guides still carry the old captures", "By hand",
     "Wallets change their screens", "The oldest captures go in the email; a screenshot cannot be retaken by a job")

# ---- services and investments
item("V1", "write", "content", "Dashboard status, “LIVE”", "Services and investments", "3 dashboards, all live", "By hand",
     "If a dashboard goes down", "Load each link and write what it finds")
item("V2", "write", "content", "Each repository's address and visibility", "Services and investments", "Set per row", "By hand",
     "If a repo moves or goes private", "Write Visibility from GitHub; a moved or deleted repo goes in the email")
item("I1", "write", "content", "“We run a validator here”", "Services and investments", "8 positions", "By hand",
     "When we join or leave a chain", "Write it from the Networks set")
item("V3", "none", "—", "The example events in the bots band", "Services and investments", "Typed examples", "By hand",
     "They look dated as time passes", "Nothing: refresh them by hand now and then")

# ---- across the site
item("W3", "report", "audit", "Dead links: proofs, explorers, guide links", "Across the site",
     "Agoric's explorer went dark and was replaced on 29 Sep. 23 proof links were repaired on 28 Sep", "Nobody", "Explorers move or close",
     "Open every link; the ones that fail go in the email, since a replacement takes judgement")
item("W2", "write", "audit", "Pages running an old release", "Across the site", "None: all 111 pages serve the current one",
     "`paste_table.py`, run by hand", "After every release, until each page is refreshed", "Refresh them through Super's own API, if its dashboard token can live as a secret (to check); otherwise they go in the email")
item("F1", "write", "audit", "The typed fallbacks behind calculated figures", "Across the site",
     "27, 20, “Thirty-five”, “24 chains · 25 guides”, and the navbar's own lines", "By hand",
     "They show only if the calculation fails, and age as chains and guides are added", "Write the counts into the Notion texts; the lines inside navbar.js go by pull request")
item("W1", "write", "audit", "The glyph lists inside `footer.js` and `covers.js`", "Across the site", "Ten addresses, written into the code",
     "Hard-coded", "When a chain's glyph is replaced in Notion", "Open and merge a pull request on this repo, tag it, and paste the head (W2's token question again)")

# ---- alerts
item("A1", "watch", "audit", "Avalanche's remaining room for delegations", "Alerts", "About 47 AVAX left on 24 Sep", "Nobody", "With every delegation", "Email at once when it nears the cap; a delegation cannot be moved by a job")
item("A2", "watch", "audit", "Rewards left unclaimed on Vara and Avail", "Alerts", "Vara's expire after 84 eras", "Nobody", "Every era", "Email before they expire; claiming needs the keys")
item("A3", "watch", "audit", "A validator of ours jailed or inactive", "Alerts", "None", "Nobody", "On an incident", "Email at once, and N5 writes the status")

def render_item(x):
    new = ' <span class="new">new</span>' if x["new"] else ""
    flow = "" if x["flow"] == "—" else '<p><code>%s.yml</code></p>' % e(x["flow"])
    return ('<li class="item" data-tier="{tier}"><span class="id">{id}</span>'
            '<div class="what"><b>{what}{new}</b></div>'
            '<div class="facts"><div><span class="k">Now</span><span>{now}</span></div><div><span class="k">Kept by</span><span>{kept}</span></div>'
            '<div><span class="k">Drifts</span><span>{drift}</span></div></div>'
            '<div class="job"><span class="chip {tier}">{tl}</span><p>{job}</p>{flow}</div></li>'
            ).format(tier=x["tier"], id=e(x["id"]), what=code(x["what"]), new=new, now=code(x["now"]), kept=code(x["kept"]),
                     drift=code(x["drift"]), tl=TIER[x["tier"]], job=code(x["job"]), flow=flow)

inventory = ""
for name, sub in G:
    rows = [x for x in I if x["where"] == name]
    if not rows: continue
    inventory += ('<div class="group"><div class="g-head"><h3>%s</h3><span>%s</span></div><ul class="items card">%s</ul></div>'
                  % (e(name), e(sub), "".join(render_item(x) for x in rows)))

N_WATCH = sum(1 for x in I if x["tier"] == "watch")
N_ITEMS = len(I) - N_WATCH

def tree(rows):
    out = ""
    for cls, name, note in rows:
        kinds = cls.split()
        tag = "".join('<span class="tag %s">%s</span>' % (k, {"moves": "moves", "added": "added 30 Sep"}[k]) for k in kinds if k in ("moves", "added"))
        classes = [k for k in kinds if k in ("dir", "sep")] + (["in"] if name.startswith("  ") else [])
        names = " ".join("<code>%s</code>" % e(n) for n in name.split())
        out += '<li class="%s"><code>%s</code><span>%s%s</span></li>' % (" ".join(classes), "<br>".join(e(n) for n in name.split()), tag, code(note))
    return '<ul class="tree">%s</ul>' % out

THIS = [
 ("dir", "main.css  home.css  …", "17 stylesheets: one for the whole site, one per page or template"),
 ("dir", "navbar.js  home.js  …", "20 scripts, loaded from the site's head"),
 ("dir", "dist/", "What the browser downloads. Built by `build.py`, never edited"),
 ("dir", "head/", "14 files: what goes into Super's Code boxes, each pinned to a release"),
 ("dir", "svg/  img/", "Drawings, captures and icons the stylesheets point at"),
 ("dir sep", "scripts/", ""),
 ("", "  paste_table.py", "Which pages still serve an old release"),
 ("", "  livecheck.mjs  audit.mjs", "Tests a change on the live page before it ships"),
 ("", "  make_glyph.py  shots.py", "Glyphs and captures"),
 ("moves", "  notion.py", "The Notion client"),
 ("moves", "  gov_upgrades.py  gov_proposals.py  gov_rationales.py", "The three governance jobs"),
 ("moves", "  chain_pages.py  og_cards.py", "Chain page words, social cards"),
 ("moves", "  validator_profiles/  profile_tracker/", "The profile edits and the tracker"),
 ("dir sep", "notion/", "The notes: this plan, the checklists, the researched values"),
 ("", "build.py", "Builds `dist/`"),
 ("", "CLAUDE.md", "How the site is built, and every decision"),
]
DATA = [
 ("dir", ".github/workflows/", "When to run, the secrets, one command each"),
 ("", "  governance.yml  networks.yml", "Daily, weekly"),
 ("", "  content.yml  audit.yml", "Daily, daily"),
 ("dir sep", "lib/", ""),
 ("", "  notion.mjs", "The client: rate-limited, plain text, knows a dry run"),
 ("", "  report.mjs", "The short log line and the private summary"),
 ("", "  http.mjs  history.mjs", "Retries and fallback endpoints; the rate history"),
 ("dir sep", "sources/", "One reader per chain family, all returning the same shape"),
 ("", "  cosmos.mjs  sui.mjs  near.mjs", "Sui's reader also reads IOTA and Ika"),
 ("", "  avalanche.mjs  substrate.mjs  evm.mjs", "Substrate is Avail and Vara; EVM is Monad, Zilliqa, Espresso"),
 ("", "  starknet.mjs  mina.mjs  supra.mjs  lido.mjs", ""),
 ("", "  releases.mjs", "GitHub releases, for upgrades"),
 ("dir sep", "jobs/", ""),
 ("", "  governance/", "votes, upgrades, proposals, rationales"),
 ("", "  networks/", "values, and the chain pages' facts"),
 ("", "  content/", "blog read, guide steps, dashboards, portfolio"),
 ("added", "  content/seo.mjs", "Rows with no card or description"),
 ("", "  audit/", "links, glyphs, served releases, watches"),
 ("added", "  audit/profiles.mjs", "Every profile against the agreed values"),
 ("dir sep", "config/", ""),
 ("", "  chains.yml", "Per chain: family, endpoints, what is written and what is checked"),
 ("", "  decisions.yml", "The accepted history per chain"),
 ("added", "  profile.yml", "The agreed name, description and links"),
 ("dir sep", "history/rates.csv", "One line per chain per run"),
 ("", "package.json", "The chains' own libraries; the only dependency file"),
]
repos = (
 '<div class="card repo"><div class="repo-head"><div class="line"><h3>website-css</h3><span class="badge">public</span><span class="badge">this repo, as it is</span></div>'
 '<p>Everything a browser downloads, and the tools that test and release it. Nothing here changes when the second repo appears.</p></div>%s</div>'
 '<div class="card repo"><div class="repo-head"><div class="line"><h3>site-data</h3><span class="badge priv">private</span><span class="badge">to be made</span></div>'
 '<p>JavaScript on Node, plain modules, no build step. Chosen because every chain family has a maintained library of its own in JavaScript.</p></div>%s</div>'
) % (tree(THIS), tree(DATA))

WF = [
 ("governance", "Daily", [("G1", "New Cosmos votes become rows"), ("G2", "Upgrades on the other nine chains"), ("G4", "A rationale for each new row"), ("G5", "The votes-cast figure")]),
 ("networks", "Weekly", [("N1", "Rates, written with their date"), ("N7", "Chain page facts, rewritten after a write"), ("N2–N6", "Commission, unbonding, slashing, status, Lido: checked"), ("S1", "The security page agrees with them")]),
 ("content", "Daily", [("B1–B3", "Blog: read minutes, missing fields"), ("U1–U2", "Guides: steps, time, old captures"), ("V1–V2", "Dashboards and repositories"), ("I1", "Investments against the Networks set"), ("E1", "Rows with no social card")]),
 ("audit", "Daily", [("P1–P2", "Every profile, and the Discord invite"), ("W1–W3", "Glyph lists, old releases, dead links"), ("F1, H7", "Typed fallbacks"), ("C1–C2", "Chain rules and off-site buttons"), ("A1–A3", "The three alerts")]),
]
workflows = "".join(
 '<div class="card wf"><div class="wf-head"><code>%s.yml</code><span class="badge">%s</span></div><ol>%s</ol></div>'
 % (n, when, "".join('<li><code>%s</code><span>%s</span></li>' % (e(a), e(b)) for a, b in rows)) for n, when, rows in WF)

STEPS = [
 ("Make the repo", "Create the private `site-data` repo, put the current Notion token and the alert email in its secrets, check whether Super's token can join them."),
 ("Move the governance jobs", "Port the Notion client and the three governance scripts to JavaScript, with a dry run and the report, and put them on a schedule. No new logic."),
 ("Cosmos votes become rows", "The biggest gap that is closed by hand today."),
 ("Blog and guide fields", "Read minutes, steps and time."),
 ("Cosmos network values, and Lido", "Rates written behind the sanity band; commission, unbonding and slashing checked through the decisions list."),
 ("The audit jobs and the alerts", "Profiles, dead links, old releases, fallbacks, and the three watches."),
 ("Rates for the other chain families", "One reader at a time. Each chain moves from Manual to Auto as its reader lands."),
]
steps = "".join("<li><div><h4>%s</h4><p>%s</p></div></li>" % (e(a), code(b)) for a, b in STEPS)

DECIDED = [
 "The logic lives in scripts; each Action is only the scheduler.",
 "JavaScript on Node, plain modules, no TypeScript.",
 "Two repos: this one stays public, the jobs go in a private one.",
 "Notion is the only thing the jobs write. Nothing is fetched live in the page.",
 "Logs say almost nothing; details go to a private summary.",
 "“1882 votes cast since 2020” stays.",
 "Until the jobs exist, the values are updated by hand.",
 "30 Sep: every run opens one issue in the private repo with everything it wrote (before and after) and everything it could not, and sends one email only when something drifted that a job cannot fix, or the run failed, the way the other jobs already alert (the user will give the address).",
 "30 Sep: whatever a script can write, it writes, with no hand in between (the user: automate more). What is left for a hand is the profiles on other people's registries and chains, dead links, wallet screenshots, a post's author, and the three alerts.",
 "30 Sep: the research notes (the set's values, the chain pages' source) move to the private repo.",
 "30 Sep: the current Notion token is used for now and rotated later.",
 "30 Sep: new vote rows go live with no review; the rationale is written by the principle-based lines that wrote every row so far, no model in the loop.",
 "30 Sep: an upgrade counts only where running the release is the vote: Sui and IOTA protocol versions, NEAR versions and NEPs, Avalanche ACPs, Mina MIPs and hard forks, Zilliqa hard forks. Client releases on Starknet, EigenCloud and Monad do not.",
 "30 Sep: public endpoints to start; our own nodes later, as secrets, where a public one is unreliable.",
]
decided = "".join("<li><span>%s</span></li>" % e(x) for x in DECIDED)
OPEN = [
 ("Can Super's dashboard token live as a secret?", "W1 and W2 refresh pages and paste heads through Super's API, which is signed in as you. If the token expires, both fall back to the email.",
  "Check the token's lifetime first; if it holds, use it, and rotate it with the Notion token."),
]
opened = "".join('<li><span class="open-n">%d</span><b>%s</b>%s<p class="rec"><b>Recommended:</b> %s</p></li>'
                 % (i + 1, e(a), ("<p>%s</p>" % e(b)) if b else "", e(c)) for i, (a, b, c) in enumerate(OPEN))

CURRENT = [
 ("Staked assets and total customers", "Homepage. $83,996,080 and 14,722 when read", "Your own script"),
 ("Number of networks, “27 secured”, the years", "Homepage", "Calculated from Notion"),
 ("27 mainnets, 20 testnets, “Thirty-five teams”", "Networks page, navbar, services", "Calculated from the set"),
 ("The latest votes and the chains with their rates", "Navbar", "Read from Notion"),
 ("Each post's read time and next post", "Blog", "Calculated"),
 ("The estimate on a chain page", "Chain pages", "Calculated from the rate"),
 ("The positions and their years", "Investments", "Read from Notion"),
 ("“Updated 26 Sep 2026”", "Legal pages", "Fixed until the page is edited"),
]
current = "".join("<li><b>%s</b><span>%s</span><em>%s</em></li>" % (e(a), e(b), e(c)) for a, b, c in CURRENT)
FIX = [
 ("The heading “Six years”", "Change it to “Since 2020”, which never goes out of date", "H6"),
 ("“1882”", "Have the page calculate it as 729 plus the record's rows", "G5"),
 ("The typed fallbacks", "Check each once against the live figure. “27 secured” was done on 29 Sep", "F1"),
 ("Uptime", "Decide what it means and where it is read, or replace the figure", "H4"),
]
fixable = "".join("<li><b>%s</b><span>%s</span><em>%s</em></li>" % (e(a), e(b), e(c)) for a, b, c in FIX)

page = open(os.path.join(HERE, "template.html")).read()
for k, v in (("INVENTORY", inventory), ("REPOS", repos), ("WORKFLOWS", workflows), ("STEPS", steps), ("DECIDED", decided), ("OPEN", opened),
             ("CURRENT", current), ("FIXABLE", fixable), ("CHECKED", CHECKED), ("N_ITEMS", str(N_ITEMS)), ("N_WATCH", str(N_WATCH)), ("N_OPEN", str(len(OPEN)))):
    page = page.replace("{{%s}}" % k, v)
assert "{{" not in page, re.findall(r"\{\{[A-Z_]+\}\}", page)
open(OUT, "w").write(page)
print("items", N_ITEMS, "watches", N_WATCH, {t: sum(1 for x in I if x["tier"] == t) for t in TIER}, "bytes", len(page))
