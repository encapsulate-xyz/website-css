"""Builds the profile-updates tracker page from one list of rows. Status and notes live in the artifact's db.
Every "now" value was read on 2026-09-29 (chains through rest.cosmos.directory and their own RPCs, repos through
the GitHub API, SSV's API, fxtwitter, the pages themselves); see the session's scratchpad/profiles/*.json."""
import html, json, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT") or os.path.join(HERE, "encapsulate-profile-updates.html")   # OUT=<path> to write elsewhere
DESC = ("Validator infrastructure for new chains, since 2020. Early to testnet, quick to upgrade, easy to reach. "
        "Trusted by Sui, NEAR, Monad, Lido, Starknet and more.")
S2 = "Validator infrastructure for new chains, since 2020. Early to testnet, quick to upgrade, easy to reach."
S1 = "Validator infrastructure for new chains, since 2020."
assert len(DESC) == 157 and len(S2) == 103 and len(S1) == 52

T1 = "Others trust, we validate! Your stake is important to us. Help us secure networks while you earn rewards"
T2 = ("Backed by five years of experience, Encapsulate secures 40+ networks with nearly half a billion dollars in delegated "
      "stake, delivering industry-leading uptime, rigorous security, and community-driven open-source tools")
T_IOTA = "Others Trust, We Validate! Your Stake is Important to Us. Secure Networks while You Earn Rewards."
T_ZIL = "Others Trust, We Validate! Your Stake is Important to Us. Help us secure Zilliqa Network while You Earn Rewards"
T_EIGEN = ("Secure All AVSs in two quorums (ETH + EIGEN). Others Trust, We Validate ! Your Stake is Important to Us. "
           "Secure Networks while You Earn Rewards.")
T_SSV = "Others trust we validate! Your stake is important to us Help us secure networks while you earn rewards"
T_SSV469 = "Others Trust We Validate Your Stake is Important to Us Secure Networks while You Earn Rewards"
T_X = ("Backed by five years of experience, Encapsulate secures 40+ networks with nearly half a billion dollars in delegated "
       "stake, delivering industry-leading uptime")

AGREED = object()            # the agreed description
SITE = "https://encapsulate.xyz"
X_NEW, X_OLD = "https://x.com/encapHQ", "https://x.com/encapsulate_xyz"
DC_NEW, DC_OLD = "https://discord.gg/q6cmGycxsr", "https://discord.com/invite/S5x4e2AHVV"
RAW = "https://raw.githubusercontent.com/encapsulate-xyz/assets/refs/heads/main/"

HOW = {"push": "Push to our repo", "pr": "Pull request", "tx": "Transaction", "form": "Form", "settings": "Account settings", "ask": "Ask their team"}
WHO = {"claude": ("Claude", "Our own repos and pull requests. Each waits for your word."),
       "ops": ("Ops", "Signed with the operator key or the owner wallet."),
       "you": ("You", "Forms, account settings and messages to other teams.")}

def e(s): return html.escape(s, quote=True)

class V:
    """one value in a Now or Becomes cell: text, a url (mono), nothing there (italic), with an optional flag"""
    def __init__(self, text, kind="t", flag=None): self.text, self.kind, self.flag = text, kind, flag
def U(u, flag=None): return V(u, "u", flag)       # an address, a handle, a file name
def NONE(t, flag=None): return V(t, "none", flag)  # nothing there
def cell(v):
    if v is AGREED: return '<a class="agreed" href="#values">The agreed description</a>'
    if isinstance(v, str): v = V(v)
    if isinstance(v, (list, tuple)): return "<br>".join(cell(x) for x in v)
    cls = {"t": "", "u": ' class="u"', "none": ' class="none"'}[v.kind]
    out = "<span%s>%s</span>" % (cls, e(v.text))
    if v.flag: out += '<span class="flag">%s</span>' % e(v.flag)
    return out
def plain(v):
    if v is AGREED: return "agreed description"
    if isinstance(v, str): return v
    if isinstance(v, (list, tuple)): return " ".join(plain(x) for x in v)
    return v.text + (" " + v.flag if v.flag else "")

R = []
def row(id, n, who, how, title, where, changes, cmd=None, copy=None, pri="normal", cav=None):
    R.append(dict(id=id, n=n, who=who, how=how, title=title, where=where, changes=changes, cmd=cmd, copy=copy, pri=pri, cav=cav))

# ------------------------------------------------------------------ Claude
row("r01", "01", "claude", "push", "Assets repo", "encapsulate-xyz/assets", [
    ("Description, README.md", T2, AGREED),
    ("Description, espresso-mainnet.json", T2, AGREED),
    ("Logo, encapsulate.png", "4097 × 4097 px, 207 KB", "512 × 512 px, 40 KB, at the same path"),
    ("eigenlayer.json", NONE("Does not exist"), "A new file, for row 20"),
], pri="top", cav="Goes first. Sui, IOTA, NEAR, Espresso and Monad read their logo from this repo, so the new one reaches them with no transaction.")
row("r02", "02", "claude", "push", "GitHub organisation page", "encapsulate-xyz/.github · profile/README.md", [
    ("Opening text", "Revolutionizing Blockchain Staking. Welcome to Encapsulate's official GitHub page! We provide the infrastructure you need to earn rewards from your blockchain tokens through staking.", AGREED),
    ("Discord", U(DC_OLD, "expired"), U(DC_NEW)),
    ("Email", U("contact@encapsulate.xyz"), U("hello@encapsulate.xyz")),
])
row("r03", "03", "claude", "pr", "Monad", "monad-developers/validator-info · mainnet id 91 and testnet id 106", [
    ("Description", T2 + ".", AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Website", U(SITE + "/"), U(SITE)),
], pri="top", cav="Two files, the same three changes in each. Post the pull request in Monad's Discord once it is open.")
row("r04", "04", "claude", "pr", "Zilliqa", "Zilliqa/zq2-staking · src/misc/stakingPoolsConfig.ts", [
    ("Description", T_ZIL, [AGREED, V("with encapsulate.xyz linked inside it")]),
    ("Website", NONE("The portal has no field for it"), "Carried by the link in the description"),
], cav="Our pool is listed twice in the file, so both entries change.")
row("r05", "05", "claude", "pr", "Symbiotic", "symbioticfi/metadata-mainnet · operators/0x69F5…2F09/info.json", [
    ("Description", T1, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Discord", U(DC_OLD, "expired"), U(DC_NEW)),
], pri="top", cav="They may ask for a message signed by the operator address.")
row("r06", "06", "claude", "pr", "EigenLayer", "Layr-Labs/eigendata · operators/Encapsulate/metadata.json", [
    ("Name", "Encapsulate (fka KingSuper)", "Encapsulate"),
    ("Description", T_EIGEN, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Logo", "4097 × 4097 px", "512 × 512 px"),
], pri="top", cav="Slow to merge. Row 20 is the fast way, and only one of the two is needed. validator.info copies this file.")
row("r07", "07", "claude", "pr", "Mina, Auro wallet list", "aurowallet/launch · validators/list.json", [
    ("Website", U("https://www.encapsulate.xyz"), U(SITE)),
    ("Description", "Others Trust, We Validate! Your Stake is Important to Us. Secure Networks while You Earn Rewards", AGREED),
])
row("r08", "08", "claude", "pr", "Terra validator profiles", "terra-money/validator-profiles · validators/terravaloper1yh4u…mujs", [
    ("Moniker", "KingSuper", "Encapsulate"),
    ("Website", U("https://king.super.site", "404"), U(SITE)),
    ("Text", "We are a team of software developers and operate on 18 networks in total, some of them includes the graph protocol, mina, osmosis, agoric, umee, juno.", AGREED),
    ("Contacts", "A personal Gmail address, a personal Telegram handle and a Discord tag", U("security@encapsulate.xyz")),
    ("Logo", "KingSuper.png, the crown", "The current mark"),
], pri="top")
row("r09", "09", "claude", "pr", "REStake and cosmos.directory", "eco-stake/validator-registry", [
    ("Our profile", NONE("Not listed"), "Encapsulate/profile.json with the name, the Keybase identity, the website and the description"),
    ("Our validators", NONE("Not listed"), "Encapsulate/chains.json with the 13 validator addresses"),
], pri="top")
row("r10", "10", "claude", "pr", "awesome-celestia", "celestiaorg/awesome-celestia · README.md", [
    ("Heading", "List of Contributions from Encapsulate (fka KingSuper)", "List of Contributions from Encapsulate"),
    ("RPC, LCD, gRPC", U("celestia-mainnet-rpc, -lcd and -grpc.kingsuper.services", "dead"), NONE("Removed")),
    ("Snapshots", U("encapsulate.xyz/snapshots/celestia-bridge-mainnet, -app-mainnet, -bridge-testnet", "404"), NONE("Removed")),
    ("Tools", U("celestia-pfb and celestia-node-checker.kingsuper.services", "dead"), NONE("Removed")),
], pri="top")
row("r11", "11", "claude", "pr", "awesome-berachain-validators", "chuck-bear/awesome-berachain-validators · README.md", [
    ("Cutting board tool", [V("Encapsulate (fka KingSuper) cutting board tool"), U("https://cb.berachain.testnet.encapsulate.xyz", "dead")], NONE("Removed")),
    ("Ansible playbook", "Already says Encapsulate, and its link works", NONE("No change")),
], pri="top")
row("r12", "12", "claude", "pr", "Agoric and Althea profile lists", "Agoric/validator-profiles · althea-net/community", [
    ("Agoric, folder and pledge", "KingSuper", "Encapsulate"),
    ("Althea, validators.md row 67", [V("KingSuper"), U("github.com/aditya-manit")], [V("Encapsulate"), U("github.com/encapsulate-xyz")]),
], pri="optional", cav="Both lists have been inactive since 2023.")

# ------------------------------------------------------------------ Ops: Cosmos, one row per validator
both = [("terra", "Terra", "terrad", None), ("agoric-old", "Agoric, the older validator", "agd", "agoricvaloper1fy8r…dmv32. Our other Agoric validator is row 14.2."),
        ("althea", "Althea", "althea", None),
        ("gitopia", "Gitopia", "gitopiad", "An old, jailed validator of ours on Gitopia is already named Encapsulate, so two will share the name."),
        ("gravity-bridge", "Gravity Bridge", "gravity", "An old, jailed validator of ours on Gravity Bridge is already named Encapsulate, so two will share the name."),
        ("humans-ai", "humans.ai", "humansd", None), ("passage", "Passage", "passage", None), ("sommelier", "Sommelier", "sommelier", None),
        ("chain4energy", "Chain4Energy", "c4ed", None)]
for i, (k, name, binary, cav) in enumerate(both, 1):
    if i == 1: cav = "Older binaries call the flag --moniker."
    row("r13-" + k, "13.%d" % i, "ops", "tx", name, "binary " + binary, [
        ("Name", "Encapsulate (fka KingSuper)", "Encapsulate"),
        ("Description", T1, AGREED),
    ], cmd='%s tx staking edit-validator --new-moniker "Encapsulate" --details "<description>" --from <operator-key>' % binary,
       copy='%s tx staking edit-validator --new-moniker "Encapsulate" --details "%s" --from <operator-key>' % (binary, DESC),
       pri="top", cav=cav)
only = [("axelar", "Axelar", "axelard", T2, "An old, jailed validator of ours on Axelar reads Redelegate to Encapsulate. It stays as it is."),
        ("agoric", "Agoric", "agd", T2, None),
        ("ixo", "ixo", "ixod", T2, "An old, jailed validator of ours on ixo still reads fka KingSuper. It is out of the set and stays as it is."),
        ("lumera", "Lumera", "lumerad", T2 + ".", None)]
for i, (k, name, binary, now, cav) in enumerate(only, 1):
    row("r14-" + k, "14.%d" % i, "ops", "tx", name, "binary " + binary, [
        ("Description", now, AGREED),
    ], cmd='%s tx staking edit-validator --details "<description>" --from <operator-key>' % binary,
       copy='%s tx staking edit-validator --details "%s" --from <operator-key>' % (binary, DESC), cav=cav)
row("r15", "15", "ops", "tx", "Sui", "validator 0x01d0…6ff7", [
    ("Description", T2 + ".", AGREED),
], cmd='sui validator update-metadata description "<description>"',
   copy='sui validator update-metadata description "%s"' % DESC, cav="Shows from the next epoch. The logo follows row 01.")
row("r16", "16", "ops", "tx", "IOTA", "on-chain validator metadata", [
    ("Description", T_IOTA, AGREED),
], cmd='iota validator update-metadata description "<description>"',
   copy='iota validator update-metadata description "%s"' % DESC, cav="The logo follows row 01.")
row("r17", "17", "ops", "tx", "Ika", "on-chain validator metadata, read by Ikascan", [
    ("Website, project_url", NONE("Empty"), U(SITE)),
    ("Logo, image_url", [V("The word Encapsulate"), V("", "t", "not an address")], U(RAW + "encapsulate.png")),
    ("Description", NONE("Empty"), AGREED),
], cmd="set_validator_metadata, in a transaction that holds the validator's operation cap", pri="top")
row("r18", "18", "ops", "tx", "NEAR", "pool-details.near · encapsulate.pool.near", [
    ("Description", T2, AGREED),
], cmd="near call pool-details.near update_field '{\"pool_id\": \"encapsulate.pool.near\", \"name\": \"description\", \"value\": \"<description>\"}' --accountId <pool owner>",
   copy="near call pool-details.near update_field '{\"pool_id\": \"encapsulate.pool.near\", \"name\": \"description\", \"value\": \"%s\"}' --accountId <pool owner>" % DESC,
   cav="The logo follows row 01.")
row("r19", "19", "ops", "tx", "Espresso", "StakeTable 0xCeF474…4451", [
    ("Metadata URI", U("http://validator.espresso.mainnet.encapsulate.xyz:8088/status/metrics", "blank when the node is down"), U(RAW + "espresso-mainnet.json")),
    ("Description", T2, [AGREED, V("through the file")]),
], cmd="updateMetadataUri, from the validator account", cav="After row 01.")
row("r20", "20", "ops", "tx", "EigenLayer, the fast way", "DelegationManager 0x39053D51…f37A", [
    ("Metadata URI", U("https://raw.githubusercontent.com/Layr-Labs/eigendata/master/operators/Encapsulate/metadata.json"), U(RAW + "eigenlayer.json")),
    ("Name, description, X", "As in row 06", "Through the file"),
], cmd="updateOperatorMetadataURI, from the operator address 0xA6c3…2062", pri="top",
   cav="After row 01. Only one of rows 06 and 20 is needed.")
row("r21-924", "21.1", "ops", "tx", "SSV operator 924", "SSV app · owner wallet 0xf3C9…7a80", [
    ("Description", T_SSV, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Name", "Lido - Encapsulate", NONE("No change")),
], cmd="Edit operator metadata in the SSV app and sign with the owner wallet", pri="top",
   cav="The active one: it runs the 500 Lido validators.")
row("r21-1056", "21.2", "ops", "tx", "SSV operator 1056", "SSV app · owner wallet 0x1007…8262", [
    ("Description", T_SSV, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Name", "Lido - Encapsulate", NONE("No change")),
], cmd="Edit operator metadata in the SSV app and sign with the owner wallet",
   cav="Inactive, with no validators. Its owner wallet is not the one that owns 924.")
row("r22", "22", "ops", "tx", "SSV operator 469", "owner wallet 0xa8e7…5B98", [
    ("Name", "KingSuper", NONE("Operator removed")),
    ("Website", U("https://kingsuper.org"), NONE("Operator removed")),
    ("X", U("https://twitter.com/_KingSuper_"), NONE("Operator removed")),
    ("Description", T_SSV469, NONE("Operator removed")),
], cmd="removeOperator(469)", cav="Inactive, with no validators.")
row("r23", "23", "ops", "tx", "Sui candidate, dummyvalidator", "candidate 0xeac3…09ec", [
    ("Name", "dummyvalidator", NONE("Candidate removed")),
    ("Every other field", "na", NONE("Candidate removed")),
], cmd="request_remove_validator_candidate")
row("r24", "24", "ops", "tx", "The 20 testnets", "one validator per testnet", [
    ("Name", NONE("Not read yet"), "Encapsulate"),
    ("Description", NONE("Not read yet"), AGREED),
], cmd="The same commands, chain by chain",
   cav="Not checked yet. A new chain's team is most likely to meet us on its own testnet.")

# ------------------------------------------------------------------ You
row("r25", "25", "you", "form", "StakingRewards", "providers.stakingrewards.com · /provider/kingsuper", [
    ("Name", "KingSuper", "Encapsulate"),
    ("Logo", "A crown with the word KING", "The current mark"),
    ("Website", NONE("None"), U(SITE)),
    ("X", U("https://twitter.com/_KingSuper_"), U(X_NEW)),
    ("Description", "KingSuper is a staking infrastructure provider listed on Staking Rewards.", AGREED),
    ("Page address", U("/provider/kingsuper"), U("/provider/encapsulate")),
], pri="top", cav="The most valuable single fix, and it depends on nothing else. Claiming the page is free.")
row("r26", "26", "you", "form", "Starknet, Voyager", "Voyager's Add validator info, with the staker's wallet", [
    ("Description", [V("It says over $500 million."), V("", "t", "full text not readable from outside")], AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
])
row("r27", "27", "you", "form", "Mina, Minascan", "Staketab's Submit service form", [
    ("Name", "Encapsulate (fka KingSuper)", "Encapsulate"),
    ("Website", U("http://encapsulate.xyz/"), U(SITE)),
    ("X", U("https://twitter.com/_KingSuper_"), U(X_NEW)),
    ("Discord", U(DC_OLD, "expired"), U(DC_NEW)),
    ("Description", NONE("Not readable from outside"), AGREED),
], pri="top", cav="Review takes about a day.")
row("r28", "28", "you", "settings", "X @encapHQ", "profile settings", [
    ("Bio", T_X, AGREED),
    ("Website", U("https://linktr.ee/encapHQ"), U(SITE)),
], pri="top")
row("r29", "29", "you", "settings", "X @_KingSuper_", "profile settings of the old account", [
    ("Website", NONE("None"), U(SITE)),
    ("Bio", "Prev. @_KingSuper_ ➡️ Follow @encapHQ. Empowering blockchain innovation with unparalleled trust and security.", NONE("No change")),
])
row("r30", "30", "you", "settings", "LinkedIn", "the page's admin view", [
    ("About", [V("It says $248 million, 40+ networks and 6,685 satisfied."), V("", "t", "full text not readable from outside")], AGREED),
    ("Tagline", NONE("Not readable from outside"), "The first two sentences"),
])
row("r31", "31", "you", "settings", "GitHub organisation", "github.com/encapsulate-xyz · settings", [
    ("Description", T1, AGREED),
    ("Email", U("contact@encapsulate.xyz"), U("hello@encapsulate.xyz")),
    ("Verified domain", NONE("Not verified"), "encapsulate.xyz, verified"),
], cav="The token Claude works with cannot change organisation settings.")
row("r32", "32", "you", "settings", "Keybase", "identity B68A51B88F28CEF1", [
    ("Proofs", NONE("None"), "X, GitHub and the website"),
], cav="Mintscan, Keplr and cosmos.directory take our logo from here. The logo and the bio are already right.")
row("r33", "33", "you", "ask", "Starknet, Endur", "dashboard.endur.fi", [
    ("Name", "Encapsulate Limited", "Encapsulate"),
])
row("r34", "34", "you", "ask", "Supra, SupraScan", "suprascan.io", [
    ("Name", "Unknown", "Encapsulate"),
])
row("r35", "35", "you", "ask", "Avalanche, Avascan", "Avascan's Telegram support", [
    ("Website", NONE("None shown"), U(SITE)),
])
row("r36", "36", "you", "settings", "Lido research forum", "research.lido.fi", [
    ("Username", "KingSuper", "Encapsulate"),
    ("Website", NONE("Empty"), U(SITE)),
    ("Post t/4809 #5", U("https://king.super.site/", "404"), U(SITE)),
])
row("r37", "37", "you", "settings", "Discord server", "server settings", [
    ("Description", NONE("None"), AGREED),
])

ids = [r["id"] for r in R]
assert len(ids) == len(set(ids)) and all(re.fullmatch(r"[a-z0-9-]+", i) for i in ids)
N = len(R)

def render_row(r):
    text = " ".join([r["n"], r["title"], r["where"], r["cmd"] or "", r["cav"] or "", HOW[r["how"]], WHO[r["who"]][0]] +
                    [f + " " + plain(a) + " " + plain(b) for f, a, b in r["changes"]]).lower()
    pri = ""
    if r["pri"] == "top": pri = '<span class="chip top">Top fix</span>'
    if r["pri"] == "optional": pri = '<span class="chip opt">Optional</span>'
    cmd = ""
    if r["cmd"]:
        btn = '<button type="button" class="copy" data-copy="%s">Copy</button>' % e(r["copy"]) if r["copy"] else ""
        cmd = '<div class="cmd"><code>%s</code>%s</div>' % (e(r["cmd"]), btn)
    cav = '<p class="r-cav">%s</p>' % e(r["cav"]) if r["cav"] else ""
    chg = "".join('<tr><td class="f">%s</td><td class="now">%s</td><td class="new">%s</td></tr>' % (e(f), cell(a), cell(b)) for f, a, b in r["changes"])
    i = r["id"]
    return (
        '<li class="row" id="row-{i}" data-row="{i}" data-who="{who}" data-how="{how}" data-pri="{pri_k}" data-text="{text}">'
        '<div class="r-n">{n}</div>'
        '<div class="r-main"><h3>{title}</h3><p class="where">{where}</p><div class="tags">{pri}</div></div>'
        '<div class="r-how"><span class="chip how">{howl}</span>{cmd}</div>'
        '<div class="r-status"><label class="vh" for="st-{i}">Status of {title}</label>'
        '<select id="st-{i}" class="st" data-state="open" disabled>'
        '<option value="open">Open</option><option value="started">Started</option><option value="done">Done</option></select>'
        '<span class="when" hidden></span></div>'
        '<div class="r-chg"><table class="chg"><thead><tr><th scope="col">Field</th><th scope="col">Now</th><th scope="col">Becomes</th></tr></thead>'
        '<tbody>{chg}</tbody></table></div>'
        '{cav}'
        '<div class="r-note"><span class="note-text" hidden></span>'
        '<button type="button" class="link note-edit" hidden>Add a note</button>'
        '<form class="note-form" hidden><label class="vh" for="nt-{i}">Note for {title}</label>'
        '<input id="nt-{i}" type="text" maxlength="240" autocomplete="off" placeholder="A link to the pull request, a transaction hash, or a word">'
        '<button type="submit" class="btn">Save</button><button type="button" class="link cancel">Cancel</button></form></div>'
        '</li>'
    ).format(i=i, who=r["who"], how=r["how"], pri_k=r["pri"], text=e(text), n=e(r["n"]), title=e(r["title"]), where=e(r["where"]),
             pri=pri, cav=cav, howl=e(HOW[r["how"]]), cmd=cmd, chg=chg)

sections = ""
for who in ("claude", "ops", "you"):
    rows = [r for r in R if r["who"] == who]
    sections += (
        '<section class="group" id="{who}" data-group="{who}" aria-labelledby="h-{who}">'
        '<div class="sec-head"><div class="sec-title"><h2 id="h-{who}">{name}</h2><span class="sec-count" data-count="{who}">{n} updates</span></div>'
        '<p>{sub}</p></div>'
        '<div class="cols-head" aria-hidden="true"><span>No.</span><span>Profile</span><span>How</span><span>Status</span></div>'
        '<ol class="rows">{rows}</ol></section>'
    ).format(who=who, name=WHO[who][0], sub=e(WHO[who][1]), n=len(rows), rows="".join(render_row(r) for r in rows))

def pills(group, items):
    out = '<div class="fgroup" role="group" aria-label="{g}"><span class="flabel">{g}</span>'.format(g=group[1])
    for k, label in items:
        out += '<button type="button" data-f="{f}" data-v="{k}" aria-pressed="{p}">{label}</button>'.format(
            f=group[0], k=k, label=e(label), p="true" if k == "all" else "false")
    return out + "</div>"

used_how = [k for k in HOW if any(r["how"] == k for r in R)]
filters = (
    pills(("who", "Who"), [("all", "Everyone"), ("claude", "Claude"), ("ops", "Ops"), ("you", "You")]) +
    pills(("status", "Status"), [("all", "Any"), ("open", "Open"), ("started", "Started"), ("done", "Done")]) +
    pills(("how", "How"), [("all", "Any")] + [(k, HOW[k]) for k in used_how]) +
    pills(("pri", "Weight"), [("all", "Any"), ("top", "Top fixes"), ("optional", "Optional")])
)

page = open(os.path.join(HERE, "template.html")).read()
page = (page.replace("{{SECTIONS}}", sections).replace("{{FILTERS}}", filters).replace("{{N}}", str(N))
        .replace("{{DESC}}", e(DESC)).replace("{{S2}}", e(S2)).replace("{{S1}}", e(S1))
        .replace("{{IDS}}", json.dumps(ids)))
assert "{{" not in page, re.findall(r"\{\{[A-Z0-9_]+\}\}", page)
open(OUT, "w").write(page)
json.dump([{"id": r["id"], "n": r["n"], "who": r["who"], "how": r["how"], "title": r["title"]} for r in R], open(os.path.join(os.path.dirname(OUT), "rows.json"), "w"), indent=1)
print("rows", N, {w: sum(1 for r in R if r["who"] == w) for w in WHO}, {h: sum(1 for r in R if r["how"] == h) for h in HOW}, "bytes", len(page))
