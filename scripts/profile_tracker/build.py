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
DC_NEW, DC_OLD = "https://discord.gg/PQJX5JVS8h", "https://discord.com/invite/S5x4e2AHVV"
DC_MID = "https://discord.gg/q6cmGycxsr"      # the invite used until 2026-09-29; still valid, it points at #moderator-only
RAW = "https://raw.githubusercontent.com/encapsulate-xyz/assets/refs/heads/main/"

HOW = {"push": "Our own repo", "pr": "Pull request", "tx": "Transaction", "form": "Form", "settings": "Account settings", "ask": "Ask their team"}
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
def row(id, n, who, how, title, where, changes, cmd=None, copy=None, pri="normal", cav=None, link=None, steps=None):
    """link = (label, url): where the work is done. steps = what to press, in order; an address in a step becomes a link."""
    R.append(dict(id=id, n=n, who=who, how=how, title=title, where=where, changes=changes, cmd=cmd, copy=copy, pri=pri, cav=cav,
                  link=link, steps=steps or []))

# ------------------------------------------------------------------ Claude
row("r01", "01", "claude", "push", "Assets repo", "encapsulate-xyz/assets", [
    ("Description, README.md", T2, AGREED),
    ("Description, espresso-mainnet.json", T2, AGREED),
    ("Logo, encapsulate.png", "4097 × 4097 px, 207 KB", "512 × 512 px, 40 KB, at the same path"),
    ("eigenlayer.json", NONE("Does not exist"), "A new file, for row 20"),
    ("Discord, README.md", U(DC_MID, "older invite"), U(DC_NEW)),
    ("encapsulate-4097.png", NONE("Does not exist"), "The original logo, kept under this name"),
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
], pri="top", cav="Two files, the same three changes in each. Monad reviews a pull request only after its link is posted in their validator Discord channel.")
row("r04", "04", "claude", "pr", "Zilliqa", "Zilliqa/zq2-staking · src/misc/stakingPoolsConfig.ts", [
    ("Description", T_ZIL, [AGREED, V("followed by a link to encapsulate.xyz")]),
    ("Website", NONE("The portal has no field for it"), "Carried by the link in the description"),
], cav="Our pool is listed twice in the file, so both entries change.")
row("r05", "05", "claude", "pr", "Symbiotic", "symbioticfi/metadata-mainnet · operators/0x69F5…2F09/info.json", [
    ("Description", T1, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Discord", U(DC_OLD, "expired"), U(DC_NEW)),
], pri="top", cav="Symbiotic merges only after the pull request's link is emailed to verify@symbiotic.fi from an encapsulate.xyz address.")
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
    ("Contacts", "A personal Gmail address, a personal Telegram handle and a Discord tag", [U("security@encapsulate.xyz"), U("@aditya_encapsulate")]),
    ("Alerts from Terra", "Sent to the personal Gmail address", U("security@encapsulate.xyz")),
    ("Logo", "KingSuper.png, the crown", "The current mark"),
], pri="top")
row("r09", "09", "claude", "pr", "REStake and cosmos.directory", "eco-stake/validator-registry", [
    ("Our profile", NONE("Not listed"), "Encapsulate/profile.json with the name, the Keybase identity, the website and the description"),
    ("Our validators", NONE("Not listed"), "Encapsulate/chains.json with the 13 validator addresses"),
], pri="top")
row("r10", "10", "claude", "pr", "awesome-celestia", "celestiaorg/awesome-celestia · README.md", [
    ("Heading", "List of Contributions from Encapsulate (fka KingSuper)", "Contributions from Encapsulate"),
    ("RPC, LCD, gRPC", U("celestia-mainnet-rpc, -lcd and -grpc.kingsuper.services", "dead"), NONE("Removed")),
    ("Snapshots", U("encapsulate.xyz/snapshots/celestia-bridge-mainnet, -app-mainnet, -bridge-testnet", "404"), NONE("Removed")),
    ("Hosted tools", U("celestia-pfb and celestia-node-checker.kingsuper.services", "dead"), "The source of both tools on GitHub"),
    ("Ansible playbook", NONE("Not listed"), U("github.com/encapsulate-xyz/celestia-bridge-ansible")),
    ("Research", NONE("Not listed"), U("encapsulate.xyz/blog/celestia-testnet-log-analysis")),
], pri="top", cav="Every link in our section was dead. It now lists what is still live, so the mention stays.")
row("r11", "11", "claude", "pr", "awesome-berachain-validators", "chuck-bear/awesome-berachain-validators · README.md", [
    ("Cutting board tool", [V("Encapsulate (fka KingSuper) cutting board tool"), U("https://cb.berachain.testnet.encapsulate.xyz", "dead")], NONE("Removed")),
    ("Ansible playbook", "Already says Encapsulate, and its link works", NONE("No change")),
], pri="top")
row("r12", "12.1", "claude", "pr", "Agoric validator profiles", "Agoric/validator-profiles · KingSuper/README.md", [
    ("Folder", "KingSuper", "Encapsulate"),
    ("The validator the pledge names", U("agoricvaloper1fy8r…3dmv32", "the older one"), U("agoricvaloper1p8ux…g25ldj", "the new one only")),
    ("The pledge's first line", "I, Aditya Kumar Verma (aka KingSuper)", "I, Aditya Kumar Verma of Encapsulate (formerly KingSuper)"),
], pri="optional", cav="The commitments in the pledge are unchanged. This repo has not merged a pull request since 2023.")
row("r12-althea", "12.2", "claude", "pr", "Althea validator list", "althea-net/community · defi/validators.md, row 67", [
    ("Name", [V("KingSuper"), U("github.com/aditya-manit")], [V("Encapsulate"), U("github.com/encapsulate-xyz")]),
    ("Contact", "KingSuper#3702", U("hello@encapsulate.xyz")),
    ("Validator", U("altheavaloper1vaxz…mputd", "not on mainnet"), U("altheavaloper1d2x0…72axt")),
], pri="optional", cav="This repo has not merged a pull request since 2023.")

T2_ENV = T2.replace(",", "")     # what the node serves today: the old description, its commas removed on 2026-05-20
DESC_ENV = ("Validator infrastructure for new chains since 2020. Early to testnet. Quick to upgrade. Easy to reach. "
            "Trusted by Sui NEAR Monad Lido Starknet and more.")
assert "," not in DESC_ENV and DESC_ENV.replace(".", "").lower().split() == DESC.replace(",", "").replace(".", "").lower().split()
row("r38", "38", "claude", "pr", "Espresso node identity", "encapsulate-xyz/espresso-ansible · general.env.j2", [
    ("Description", T2_ENV, V(DESC_ENV, "t", "no commas")),
], pri="top", cav="Espresso's dashboard reads the description from the node's metrics page and cuts it at the first comma, so here the agreed "
                  "words are written as sentences. After merging: run the playbook and restart the node. Nothing is signed.")

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
    ("Discord", U(DC_MID, "older invite"), U(DC_NEW)),
], cmd="near call pool-details.near update_field '{\"pool_id\": \"encapsulate.pool.near\", \"name\": \"description\", \"value\": \"<description>\"}' --accountId <pool owner>",
   copy="near call pool-details.near update_field '{\"pool_id\": \"encapsulate.pool.near\", \"name\": \"description\", \"value\": \"%s\"}' --accountId <pool owner>" % DESC,
   cav="The logo follows row 01.")
row("r19", "19", "ops", "tx", "Espresso", "StakeTable 0xCeF474…4451", [
    ("Metadata URI", U("http://validator.espresso.mainnet.encapsulate.xyz:8088/status/metrics", "blank when the node is down"), U(RAW + "espresso-mainnet.json")),
    ("Description", T2_ENV, [AGREED, V("through the file, commas included")]),
], cmd="updateMetadataUri, from the validator account", pri="optional",
   cav="Optional once row 38 is live: the dashboard then reads the agreed words from the node itself. This transaction only brings the "
       "commas back, by pointing at the JSON file, which already carries the node's public key.")
row("r20", "20", "ops", "tx", "EigenLayer, the fast way", "DelegationManager 0x39053D51…f37A", [
    ("Metadata URI", U("https://raw.githubusercontent.com/Layr-Labs/eigendata/master/operators/Encapsulate/metadata.json"), U(RAW + "eigenlayer.json")),
    ("Name, description, X", "As in row 06", "Through the file"),
], cmd="updateOperatorMetadataURI, from the operator address 0xA6c3…2062", pri="top",
   cav="After row 01. Only one of rows 06 and 20 is needed.")
row("r21-924", "21", "ops", "tx", "SSV operator 924", "SSV app · owner wallet 0xf3C9…7a80", [
    ("Description", T_SSV, AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Name", "Lido - Encapsulate", NONE("No change")),
], cmd="Edit operator metadata in the SSV app and sign with the owner wallet", pri="top",
   cav="Our one active operator: it runs the 500 Lido validators. Operators 1056 and 469 hold no validators and are not tracked; "
       "the same goes for the Sui candidate dummyvalidator (the user, 29 Sep 2026: only what is active).")
row("r24", "24", "ops", "tx", "The 20 testnets", "one validator per testnet", [
    ("Name", NONE("Not read yet"), "Encapsulate"),
    ("Description", NONE("Not read yet"), AGREED),
], cmd="The same commands, chain by chain",
   cav="Not checked yet. A new chain's team is most likely to meet us on its own testnet.")

# Not tracked, by the user's word (2026-09-29, "only add the active cluster, same for sui only active one"): SSV operators 1056
# ("Lido - Encapsulate", owner 0x1007…8262, no validators) and 469 ("KingSuper", owner 0xa8e7…5B98, no validators), and the
# Sui validator candidate "dummyvalidator" 0xeac3…09ec. Rows 21.2, 22 and 23 held them; the numbers are not reused.

# ------------------------------------------------------------------ You
# Every link and step below was read on 2026-09-29: the page opened, the form's own fields, the service's own guide.
LOGO = RAW + "encapsulate.png"
STAKER = "0x0359e252e663765989b04c266a4daec77662b506ce5f026994cb8ad53628df2a"
NODE = "NodeID-N3e9W3EngjabGnTZVqyZwunVcbCdrY5Qy"
AVA_MSG = '%s "Encapsulate" "Encapsulate" %s %s' % (NODE, SITE, LOGO)
ENDUR_MSG = ("Hello. We run the Starknet validator %s. Your dashboard shows it as \"Encapsulate Limited\": "
             "https://dashboard.endur.fi/validator/%s Could you change the name to \"Encapsulate\"? "
             "Website %s, logo %s. Thank you." % (STAKER, STAKER, SITE, LOGO))
SUPRA_MSG = ("Hello. We run the Supra validator pool 0x15ac9afcd6a042bd61239305ad13663f2423663d6ea83ce5293561b77766cd3a. "
             "SupraScan labels it \"Unknown\": https://suprascan.io/address/0x15ac9afcd6a042bd61239305ad13663f2423663d6ea83ce5293561b77766cd3a/f "
             "Could it be labelled \"Encapsulate\"? Website %s, logo %s. Thank you." % (SITE, LOGO))

SR_MSG = ("Hello. We are Encapsulate (%s), a validator operator since 2020, formerly named KingSuper. Our listing on Staking Rewards "
          "still carries the old name: https://www.stakingrewards.com/provider/kingsuper Could you update it? Name: Encapsulate. "
          "Page address: /provider/encapsulate. Website: %s. X: %s. Logo: %s. Description: %s "
          "Our validators carry the same name and website on chain. Thank you." % (SITE, SITE, X_NEW, LOGO, DESC))
row("r25", "25", "you", "ask", "StakingRewards", "partnerships@stakingrewards.com · /provider/kingsuper", [
    ("Name", "KingSuper", "Encapsulate"),
    ("Logo", "A crown with the word KING", "The current mark"),
    ("Website", NONE("None"), U(SITE)),
    ("X", U("https://twitter.com/_KingSuper_"), U(X_NEW)),
    ("Description", "KingSuper is a staking infrastructure provider listed on Staking Rewards.", AGREED),
    ("Page address", U("/provider/kingsuper"), U("/provider/encapsulate")),
    ("Stake and validators shown", NONE("None"), "Ours, once they map our addresses"),
], pri="top", link=("Open our listing", "https://www.stakingrewards.com/provider/kingsuper"), steps=[
    "A draft to partnerships@stakingrewards.com is in the Gmail of info@encapsulate.xyz, written by Claude on 29 Sep 2026. Read it and press Send: https://mail.google.com/mail/?authuser=info@encapsulate.xyz#drafts",
    "Without the draft: write to partnerships@stakingrewards.com, the address their guide gives for everything outside the rating, and send the message below.",
    "Editing the listing ourselves is only for providers in their rating programme, which is paid by stake: EUR 4,500 a year between 30 and 100 million dollars. "
    "Those providers sign in at https://vsp.stakingrewards.com/ To apply: https://www.stakingrewards.com/ratings/staking-providers",
], cmd=SR_MSG, copy=SR_MSG, cav="There is no free claim any more: providers.stakingrewards.com is gone. The contact form on their site was tried twice on 29 Sep and "
       "answered with its own error both times, so nothing was sent through it. The listing is a stub today: no stake, no validators.")
row("r26", "26", "you", "form", "Starknet, Voyager", "Voyager's form, Validator whitelisting", [
    ("Description", "Encapsulate validates on 40+ blockchain networks, safeguarding over $500 million in delegated stake since 2020.", AGREED),
    ("X", U(X_OLD, "suspended"), U(X_NEW)),
    ("Discord", U(DC_MID, "older invite"), U(DC_NEW)),
    ("Icon", NONE("Not read"), U(LOGO)),
], link=("Open Voyager's form", "https://docs.google.com/forms/d/e/1FAIpQLSd7JL_83n7aKkRt4eFmTQoUz2gF5KH06Mh7Pdn_3Sk1fT0WIw/viewform"), steps=[
    "Sent by Claude on 29 Sep 2026, at your word. Nothing is left for you to do.",
    "What was sent: name Encapsulate; the agreed description; the icon and website above; X, Discord, LinkedIn and GitHub; the staker address and its STRK pool; contact security@encapsulate.xyz, which Voyager does not show.",
    "Voyager's team checks each entry by hand, then the staking dashboard shows it: https://voyager.online/staking?validator=" + STAKER,
    "To correct a value, send the form again. The button Add validator info on Voyager's staking page opens it.",
], cav="No wallet is needed: the button opens a Google Form.")
row("r27", "27", "you", "form", "Mina, Minascan", "Staketab's Submit service form", [
    ("Name", "Encapsulate (fka KingSuper)", "Encapsulate"),
    ("Website", U("http://encapsulate.xyz/"), U(SITE)),
    ("X", U("https://twitter.com/_KingSuper_"), U(X_NEW)),
    ("Discord", U(DC_OLD, "expired"), U(DC_NEW)),
    ("Description", NONE("Not readable from outside"), AGREED),
], pri="top", cav="Review takes about a day.", link=("Open Minascan's MetaHub", "https://minascan.io/metahub"), steps=[
    "Sent on 29 Sep 2026. Nothing to do until Staketab publishes it.",
    "Then check the page: https://minascan.io/mainnet/validator/B62qjWmFMiYUiWGvisVof9mbiKi2sB1FhZdwiDyXi8nMCoLDJuFaRYY/delegations",
    "To correct a value (the fee of 5%, the payout of 1 / month and the Discord contact kingsuper were carried over), open MetaHub, choose Submit service, and send the form again.",
])
row("r28", "28", "you", "settings", "X @encapHQ", "profile settings", [
    ("Bio", T_X, AGREED),
    ("Website", U("https://linktr.ee/encapHQ"), [V("No change for now"), V("", "t", "your call")]),
], pri="top", link=("Open X's profile settings", "https://x.com/settings/profile"), steps=[
    "Sign in as @encapHQ and open the link, or press Edit profile on the profile page.",
    "Bio: paste the agreed description. It is 157 characters and X allows 160.",
    "Website: leave the Linktree. It already leads to encapsulate.xyz.",
    "Save.",
], cav="X may suspend any account of an entity it has suspended, whenever that account was made, and the name Encapsulate HQ and the Linktree already "
       "tie this account to the site. So the website field adds little either way. What settles it is an appeal for @encapsulate_xyz: "
       "https://help.x.com/en/forms/account-access/appeals")
row("r29", "29", "you", "settings", "X @_KingSuper_", "profile settings of the old account", [
    ("Website", NONE("None"), NONE("No change")),
    ("Bio", "Prev. @_KingSuper_ ➡️ Follow @encapHQ. Empowering blockchain innovation with unparalleled trust and security.", NONE("No change")),
], pri="optional", link=("Open X's profile settings", "https://x.com/settings/profile"), steps=[
    "Nothing to change. The account holds the old handle, has no posts, and its bio already sends people to @encapHQ.",
    "Set this row aside unless you want the website on it. If you do: sign in as @_KingSuper_, open the link, fill Website, save.",
])
row("r30", "30", "you", "settings", "LinkedIn", "the page's admin view", [
    ("About", [V("It says $248 million, 40+ networks and 6,685 satisfied."), V("", "t", "full text not readable from outside")], AGREED),
    ("Tagline", NONE("Not readable from outside"), S2),
    ("Website", NONE("Not readable from outside"), U(SITE)),
], link=("Open the page's admin view", "https://www.linkedin.com/company/encapsulate-xyz/admin/"), steps=[
    "Sign in as an admin of the page and open the link.",
    "Press Edit page.",
    "Tagline (120 characters at most): the first two sentences of the description, 103 characters.",
    "Description, under About or Overview: the agreed description.",
    "Website: https://encapsulate.xyz",
    "Save.",
])
row("r31", "31", "you", "settings", "GitHub organisation", "github.com/encapsulate-xyz · settings", [
    ("Description", T1, AGREED),
    ("Email", U("contact@encapsulate.xyz"), U("hello@encapsulate.xyz")),
    ("Verified domain", NONE("Not verified"), "encapsulate.xyz, verified"),
], link=("Open Verified and approved domains", "https://github.com/organizations/encapsulate-xyz/settings/domains"), steps=[
    "Description and email are done. The domain is what is left.",
    "Open the link, press Add a domain, type encapsulate.xyz, press Add domain.",
    "GitHub shows a TXT record. Copy its name and its value.",
    "In DigitalOcean, Networking, Domains, encapsulate.xyz: add a TXT record with that name and value. https://cloud.digitalocean.com/networking/domains/encapsulate.xyz",
    "Back on GitHub's page: the menu beside the pending domain, Continue verifying, then Verify. A new record can take a while to be seen.",
], cav="Paste the record's name and value into the chat and Claude can add it in DigitalOcean, as it did for Search Console.")
row("r32", "32", "you", "settings", "Keybase", "keybase.io/encapsulate · identity B68A51B88F28CEF1", [
    ("Proofs", NONE("None"), "X and the website"),
    ("Full name", "Encapsulate Limited", "Encapsulate"),
], link=("Open the Keybase profile", "https://keybase.io/encapsulate"), steps=[
    "Open the Keybase app signed in as encapsulate. It is installed on your Mac; its command line is what adds a proof.",
    "X: run keybase prove twitter encapHQ and post the text it gives from @encapHQ. The post has to stay up.",
    "Website: run keybase prove dns encapsulate.xyz and add the TXT record it prints, in DigitalOcean.",
    "Name: in the app, your profile, Edit profile, Full name: Encapsulate.",
    "Check: keybase id encapsulate lists both proofs.",
], cav="Mintscan, Keplr and cosmos.directory take our logo from here. A GitHub proof is a gist posted by a person's account, which an organisation cannot do, so it is left out.")
row("r33", "33", "you", "ask", "Starknet, Endur", "dashboard.endur.fi", [
    ("Name", "Encapsulate Limited", "Encapsulate"),
], link=("Open Endur's Telegram", "https://t.me/endurfi"), steps=[
    "Write to Endur's team on Telegram, or in their Discord: https://discord.gg/EZ56fkSEu2",
    "Send the message below.",
    "Then check the page: https://dashboard.endur.fi/validator/" + STAKER,
], cmd=ENDUR_MSG, copy=ENDUR_MSG, cav="Endur may simply follow Voyager once Voyager publishes the form sent on 29 Sep; ask anyway, it names us differently today.")
row("r34", "34", "you", "ask", "Supra, SupraScan", "suprascan.io", [
    ("Name", "Unknown", "Encapsulate"),
], link=("Open Supra's Discord", "https://discord.com/invite/supralabs"), steps=[
    "Join Supra's Discord and find the channel for node operators or support.",
    "Send the message below.",
    "Then check the page: https://suprascan.io/address/0x15ac9afcd6a042bd61239305ad13663f2423663d6ea83ce5293561b77766cd3a/f",
    "If Discord gets no answer, Supra's contact form: https://supra.com/contact/",
], cmd=SUPRA_MSG, copy=SUPRA_MSG, cav="SupraScan has no form for labels; this is a request to their team.")
row("r35", "35", "you", "ask", "Avalanche, Avascan", "Avascan's Validator Claim", [
    ("Website", NONE("None shown"), U(SITE)),
    ("Alias and manager", "Encapsulate / Encapsulate", NONE("No change")),
    ("Icon", NONE("Not read"), U(LOGO)),
], link=("Open Avascan's guide", "https://docs.avascan.info/programs/validator-claim"), steps=[
    "Open our validator's page and note the address under Beneficiary: https://avascan.info/staking/validator/" + NODE,
    "In Core, with that address: Tools, Signing tools, Sign message. https://core.app",
    "Sign the message below, exactly as it is, and copy the signature.",
    "Post the message and the signature in the channel #avalanche-validator of Avascan's Discord: https://discord.gg/XxKz4gHy3J",
    "Avascan applies claims within a day, on working days.",
], cmd=AVA_MSG, copy=AVA_MSG, cav="It takes the key of the validator's reward address, so it may be one for ops. Not Telegram, as this row said before: a signed message, posted in Discord.")
row("r36", "36", "you", "settings", "Lido research forum", "research.lido.fi · user KingSuper", [
    ("Username", "KingSuper", "Encapsulate"),
    ("Website", NONE("Empty"), U(SITE)),
    ("Post 5 of the Wave 5 thread", U("https://king.super.site/", "404"), U(SITE)),
], link=("Open the forum's profile settings", "https://research.lido.fi/u/KingSuper/preferences/profile"), steps=[
    "Sign in and open the link. Website: https://encapsulate.xyz Then Save.",
    "Username: Preferences, Account. A pencil beside the username means you can rename it. The forum lets a new member do that for a few days only, and this account is from July 2023.",
    "Without the pencil, ask the moderators for the rename and for the link in your post to be corrected: https://research.lido.fi/about",
    "The post: https://research.lido.fi/t/announcement-onboarding-for-ethereum-wave-5/4809/5",
])
row("r37", "37", "you", "settings", "Discord server", "server settings", [
    ("Description", NONE("None"), AGREED),
], link=("Open the server", "https://discord.com/channels/871834365561290782"), steps=[
    "Open Discord on a computer or in a browser. The phone app cannot edit this.",
    "Press the server's name at the top left, then Server Settings.",
    "Server Profile, Description: paste the agreed description.",
    "Save Changes.",
])

ids = [r["id"] for r in R]
assert len(ids) == len(set(ids)) and all(re.fullmatch(r"[a-z0-9-]+", i) for i in ids)
N = len(R)

CHECKED = "29 Sep 2026"    # the day every row was last read against the live chain, repo or page

def linked(text):
    """escaped text, with each https address made a link (a full stop or comma after it stays outside)"""
    out, k = "", 0
    for m in re.finditer(r"https://[^\s]+", text):
        u = m.group(0).rstrip(".,;:")
        out += e(text[k:m.start()]) + '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(u), e(u))
        k = m.start() + len(u)
    return out + e(text[k:])

def render_row(r):
    text = " ".join([r["n"], r["title"], r["where"], r["cmd"] or "", r["cav"] or "", HOW[r["how"]], WHO[r["who"]][0]] + r["steps"] +
                    [f + " " + plain(a) + " " + plain(b) for f, a, b in r["changes"]]).lower()
    pri = ""
    if r["pri"] == "top": pri = '<span class="star">Top fix</span>'
    if r["pri"] == "optional": pri = '<span class="opt">Optional</span>'
    cmd = ""
    if r["cmd"]:
        btn = '<button type="button" class="btn copy" data-copy="%s">Copy</button>' % e(r["copy"]) if r["copy"] else ""
        cmd = '<div class="cmd"><code>%s</code>%s</div>' % (e(r["cmd"]), btn)
    cav = '<p class="cav">%s</p>' % linked(r["cav"]) if r["cav"] else ""
    howto = ""
    if r["link"] or r["steps"]:
        go = ('<a class="btn go" href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (e(r["link"][1]), e(r["link"][0]))) if r["link"] else ""
        howto = ('<div class="howto"><div class="howto-head"><span>How to do it</span>%s</div><ol class="steps">%s</ol></div>'
               % (go, "".join("<li>%s</li>" % linked(x) for x in r["steps"])))
    chg = "".join('<div class="f%s">%s</div><div class="a" data-l="Now">%s</div><div class="b" data-l="Becomes">%s</div>'
                  % (" first" if k == 0 else "", e(f), cell(a), cell(b)) for k, (f, a, b) in enumerate(r["changes"]))
    i = r["id"]
    return (
        '<li class="row" id="row-{i}" data-row="{i}" data-who="{who}" data-how="{how}" data-pri="{pri_k}" data-state="open" data-text="{text}">'
        '<div class="r-head">'
        '<button type="button" class="r-toggle" aria-expanded="false" aria-controls="p-{i}">'
        '<span class="dot" aria-hidden="true"></span><span class="r-n">{n}</span>'
        '<span class="r-name"><span class="r-title">{title}</span><span class="r-where">{where}</span></span></button>'
        '<div class="r-meta">{pri}<span class="how">{howl}</span>'
        '<a class="pr" target="_blank" rel="noopener noreferrer" hidden></a>'
        '<label class="vh" for="st-{i}">Status of {title}</label>'
        '<select id="st-{i}" class="st" data-state="open" disabled>'
        '<option value="open">Open</option><option value="started">Started</option><option value="done">Done</option><option value="skipped">Set aside</option></select>'
        '<button type="button" class="chev" tabindex="-1" aria-hidden="true"></button></div></div>'
        '<div class="r-panel" id="p-{i}" hidden>'
        '<p class="check" hidden><b>Checked</b><span></span></p>'
        '<div class="chg"><div class="h f">Field</div><div class="h a">Now</div><div class="h b">Becomes</div>{chg}</div>'
        '{howto}{cmd}{cav}'
        '<div class="r-note"><span class="note-text" hidden></span>'
        '<button type="button" class="link note-edit" hidden>Add a note</button>'
        '<form class="note-form" hidden><label class="vh" for="nt-{i}">Note for {title}</label>'
        '<input id="nt-{i}" type="text" maxlength="240" autocomplete="off" placeholder="A link, a transaction hash, or a word">'
        '<button type="submit" class="btn dark">Save</button><button type="button" class="link cancel">Cancel</button></form></div>'
        '</div></li>'
    ).format(i=i, who=r["who"], how=r["how"], pri_k=r["pri"], text=e(text), n=e(r["n"]), title=e(r["title"]), where=e(r["where"]),
             pri=pri, cav=cav, howto=howto, howl=e(HOW[r["how"]]), cmd=cmd, chg=chg)

sections = ""
for who in ("claude", "ops", "you"):
    rows = [r for r in R if r["who"] == who]
    sections += (
        '<section class="group" id="{who}" data-group="{who}" aria-labelledby="h-{who}" style="--c: var(--{who})">'
        '<div class="g-head"><h2 id="h-{who}">{name}</h2><p>{sub}</p><span class="count" data-count="{who}">{n} updates</span></div>'
        '<ol class="rows card">{rows}</ol></section>'
    ).format(who=who, name=WHO[who][0], sub=e(WHO[who][1]), n=len(rows), rows="".join(render_row(r) for r in rows))

used_how = [k for k in HOW if any(r["how"] == k for r in R)]
hows = "".join('<option value="%s">%s</option>' % (k, e(HOW[k])) for k in used_how)

page = open(os.path.join(HERE, "template.html")).read()
page = (page.replace("{{SECTIONS}}", sections).replace("{{HOWS}}", hows).replace("{{CHECKED}}", CHECKED).replace("{{N}}", str(N))
        .replace("{{DESC}}", e(DESC)).replace("{{S2}}", e(S2)).replace("{{S1}}", e(S1))
        .replace("{{IDS}}", json.dumps(ids)))
assert "{{" not in page, re.findall(r"\{\{[A-Z0-9_]+\}\}", page)
open(OUT, "w").write(page)
json.dump([{"id": r["id"], "n": r["n"], "who": r["who"], "how": r["how"], "title": r["title"]} for r in R], open(os.path.join(os.path.dirname(OUT), "rows.json"), "w"), indent=1)
print("rows", N, {w: sum(1 for r in R if r["who"] == w) for w in WHO}, {h: sum(1 for r in R if r["how"] == h) for h in HOW}, "bytes", len(page))
