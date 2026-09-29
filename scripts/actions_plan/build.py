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
     "`gov_upgrades.py` and `gov_proposals.py`, run by hand", "Every release that asks something of a validator", "Run on a schedule")
item("G4", "write", "governance", "The rationale on each new row", "Governance record", "Every row has one today",
     "`gov_rationales.py`, run by hand", "Every new row", "Draft it after G1 and G2, or leave it for you (decision 5)")
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
item("N2", "check", "networks", "Commission", "Networks and chain pages",
     "2% to 38.72%. Eight chains changed on 29 Sep, and the site showed the old figures until a recheck found it", "By hand",
     "Only when we change it", "Compare with the chain and report")
item("N3", "check", "networks", "Unbonding time", "Networks and chain pages", "7 days, 21 days, 2 weeks to a year",
     "By hand, researched once", "When a chain changes its rules", "Compare and report")
item("N4", "check", "networks", "Slashing events", "Networks and chain pages", "0 on every chain, Gravity Bridge by decision",
     "By hand, by your rule", "Only on an incident", "Check against the decisions list")
item("N5", "check", "networks", "Status: active or jailed", "Networks and chain pages", "All active", "By hand", "Only on an incident",
     "Compare and report, so you can act before the site says it")
item("N6", "check", "networks", "Validators run, on the Lido DVT page", "Networks and chain pages", "500", "By hand",
     "If keys are added or exit", "Compare and report")
item("C1", "report", "audit", "Chain rules: minimum stake, reward cadence, fees", "Networks and chain pages",
     "Researched once, in `chain-pages.json`", "By hand", "When a chain changes its parameters", "Report what no longer matches")
item("C2", "report", "audit", "The green button that still points off the site", "Networks and chain pages",
     "Lido DVT, Vara and Chain4Energy have no guide yet", "By hand", "When their guides exist", "Flag it once a guide appears")

# ---- profiles
item("P1", "check", "audit", "Name, description, website and links on every profile", "Validator profiles",
     "48 updates tracked, 24 done on 29 Sep. Fifteen validators read the agreed text on chain", "By hand, from the tracker",
     "An edit on chain, a registry rebuilt from an old file, a pull request left unmerged",
     "Read every profile weekly and report what no longer says the agreed values", new=True)
item("P2", "check", "audit", "The Discord invite", "Validator profiles", "`discord.gg/PQJX5JVS8h`, set never to expire", "By hand",
     "If it is ever revoked, every profile and guide links nowhere", "Check that it still opens the server", new=True)

# ---- homepage
item("H4", "none", "—", "Uptime", "Homepage", "99.96 %", "By hand", "Nothing computes it, and it has no definition yet",
     "Nothing until you define it: which chains, what window, which source")
item("H6", "none", "—", "The heading “Six years”", "Homepage", "Typed", "By hand", "Wrong from 2027. The figures under it are calculated; the heading is not",
     "Fix once, by hand: “Since 2020”")
item("H7", "report", "audit", "“27 secured”, the typed fallback", "Homepage", "27. It said 25 until 29 Sep", "By hand",
     "Visitors see the calculated figure; a crawler reads the typed one", "Report when the two differ")

# ---- security
item("S1", "check", "networks", "“0 slashing events since 2020”, twice", "Security", "0", "By hand", "Only on an incident. It has to agree with N4",
     "Check it against N4")
item("S2", "none", "—", "“Routine releases inside 24 h” and the other promises", "Security", "Policy", "Fixed", "Only if the policy changes",
     "Nothing: these are promises, not measurements")

# ---- blog and guides
item("B1", "write", "content", "Read minutes on each post", "Blog and guides", "38 posts, all filled", "By hand", "Every new post",
     "Fill it from the post's words")
item("U1", "write", "content", "Steps and time on each guide", "Blog and guides", "32 guides, all filled", "By hand", "Every new guide",
     "Fill it from the guide's own slides")
item("E1", "report", "content", "Social card and description on a new row", "Blog and guides",
     "Every post, chain page and guide has both today", "`og_cards.py`, run by hand", "Every new post, guide or chain",
     "Report the rows that have none", new=True)
item("B2", "report", "content", "Lede, chain, ticker and author on each post", "Blog and guides", "All filled", "By hand", "Every new post",
     "Report what is missing")
item("B3", "report", "content", "Whether a post's chain is live yet", "Blog and guides", "Set per post", "By hand", "When a chain launches",
     "Report a post whose chain has launched")
item("U2", "report", "content", "Wallet screenshots in the guides", "Blog and guides", "30 guides still carry the old captures", "By hand",
     "Wallets change their screens", "Flag the guides that are oldest")

# ---- services and investments
item("V1", "write", "content", "Dashboard status, “LIVE”", "Services and investments", "3 dashboards, all live", "By hand",
     "If a dashboard goes down", "Load each link and write what it finds")
item("V2", "report", "content", "Each repository's address and visibility", "Services and investments", "Set per row", "By hand",
     "If a repo moves or goes private", "Report it")
item("I1", "report", "content", "“We run a validator here”", "Services and investments", "8 positions", "By hand",
     "When we join or leave a chain", "Report where it disagrees with the Networks set")
item("V3", "none", "—", "The example events in the bots band", "Services and investments", "Typed examples", "By hand",
     "They look dated as time passes", "Nothing: refresh them by hand now and then")

# ---- across the site
item("W3", "report", "audit", "Dead links: proofs, explorers, guide links", "Across the site",
     "Agoric's explorer went dark and was replaced on 29 Sep. 23 proof links were repaired on 28 Sep", "Nobody", "Explorers move or close",
     "Open every link and report the ones that fail")
item("W2", "report", "audit", "Pages running an old release", "Across the site", "None: all 111 pages serve the current one",
     "`paste_table.py`, run by hand", "After every release, until each page is refreshed", "Report them")
item("F1", "report", "audit", "The typed fallbacks behind calculated figures", "Across the site",
     "27, 20, “Thirty-five”, “24 chains · 25 guides”, and the navbar's own lines", "By hand",
     "They show only if the calculation fails, and age as chains and guides are added", "Report the drift")
item("W1", "report", "audit", "The glyph lists inside `footer.js` and `covers.js`", "Across the site", "Ten addresses, written into the code",
     "Hard-coded", "When a chain's glyph is replaced in Notion", "Open a pull request on this repo")

# ---- alerts
item("A1", "watch", "audit", "Avalanche's remaining room for delegations", "Alerts", "About 47 AVAX left on 24 Sep", "Nobody", "With every delegation", "Tell you when it nears the cap")
item("A2", "watch", "audit", "Rewards left unclaimed on Vara and Avail", "Alerts", "Vara's expire after 84 eras", "Nobody", "Every era", "Tell you before they expire")
item("A3", "watch", "audit", "A validator of ours jailed or inactive", "Alerts", "None", "Nobody", "On an incident", "Tell you at once")

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
 ("Make the repo and settle the decisions", "Create the private `site-data` repo, rotate the Notion token into its secrets, answer the six open questions."),
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
]
decided = "".join("<li><span>%s</span></li>" % e(x) for x in DECIDED)
OPEN = [
 ("Where the private summary goes", "Discord, Telegram, email, or an issue in the private repo.",
  "An issue in the private repo. It is private already, keeps its history, and needs no bot."),
 ("Do the research notes move too?", "The researched values and the chain pages' source file are about the data, not the design.",
  "Yes. They are the input of the scripts that move."),
 ("Which fields are written and which only reported", "",
  "Write rates, read minutes, guide steps and dashboard status. Report commission, unbonding, slashing, validators run and status. "
  "29 Sep showed why: a commission changed on chain and the site did not follow."),
 ("Rotate the Notion token first", "It was shown in chat once, and it becomes a secret of the new repo.", "Yes, before step 0. Only you can do it."),
 ("New vote rows: live at once, or held?", "And their rationale: drafted by the job, or left for you, since it is words in our name.",
  "The row goes live, since the vote is a fact on chain. The rationale is drafted and listed in the summary for you to edit."),
 ("Public endpoints, or our own nodes too?", "In a private repo our endpoints can sit as secrets.", "Public ones to start. Add ours where a public one is unreliable."),
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
