"""Write the chain pages: one Notion page per mainnet row of the Networks set.

Each row of `Networks set` is a Notion page that Super serves at /<row id>. This fills the page
body the chain page (chain.js) reads — design *Chain Page Combined*, 2026-09-24:

    paragraph      the hero's line under the chain's name
    column list    two button callouts: green "Delegate with <wallet>" and gray "Other wallets"
                   (a lone green callout where no page lists other ways to stake)
    heading 2      What we run
    table          four rows, label | line
    heading 2      Common questions
    heading 3 + paragraph, five times     question, answer
    toggle         "Chain page copy" — this page's own key · value lines, overriding the shared
                   toggle on /networks (only where this chain needs different words; the Lido
                   page also carries its validators band here)

and sets the row's properties that the research settled (Token, Since, Unbonding, Unbonding days,
Compounding). The words come from notion/chain-pages.json, one record per chain, which records
where each fact came from.

    python3 scripts/chain_pages.py --dry            print what would be written
    python3 scripts/chain_pages.py [Name ...]       write (only the named chains, if given)
    python3 scripts/chain_pages.py --replace Name   empty that page first, then write it
    python3 scripts/chain_pages.py --buttons [Name ...]   replace only the button block (after the line)
    python3 scripts/chain_pages.py --texts [Name ...]     rewrite the line and the answers in place
    python3 scripts/chain_pages.py --facts [Name ...]     write the facts paragraph (after the buttons) and
                                                         meta:description from the row's properties; re-run
                                                         whenever those properties change

A page that already has blocks is left alone unless --replace names it.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from notion import api, rows, val

DB = "3dde800a-5138-8133-b7f1-d1ccdda08038"          # Networks set
SRC = os.path.join(os.path.dirname(__file__), "..", "notion", "chain-pages.json")


def rt(text, url=None):
    t = {"content": text}
    if url:
        t["link"] = {"url": url}
    return [{"type": "text", "text": t}]


def para(text):
    return {"object": "block", "type": "paragraph", "paragraph": {"rich_text": rt(text)}}


def head(level, text):
    k = "heading_%d" % level
    return {"object": "block", "type": k, k: {"rich_text": rt(text)}}


def button(text, url, color):
    return {"object": "block", "type": "callout",
            "callout": {"rich_text": rt(text, url), "color": color,
                        "icon": {"type": "emoji", "emoji": "💡"}}}


def column(child):
    return {"object": "block", "type": "column", "column": {"children": [child]}}


def body(c):
    """The page's blocks, in page order."""
    out = [para(c["lede"])]
    primary = button(c["wallet"]["label"], c["wallet"]["url"], "green_background")
    if c.get("other"):
        out.append({"object": "block", "type": "column_list", "column_list": {"children": [
            column(primary), column(button(c["other"]["label"], c["other"]["url"], "gray_background"))]}})
    else:
        out.append(primary)      # one button: a chain whose other ways to stake are not listed anywhere
    out.append(head(2, "What we run"))
    out.append({"object": "block", "type": "table", "table": {
        "table_width": 2, "has_column_header": False, "has_row_header": False,
        "children": [{"object": "block", "type": "table_row",
                      "table_row": {"cells": [rt(a), rt(b)]}} for a, b in c["work"]]}})
    out.append(head(2, "Common questions"))
    for q, a in c["faq"]:
        out.append(head(3, q))
        out.append(para(a))
    if c.get("copy"):
        out.append({"object": "block", "type": "toggle", "toggle": {
            "rich_text": rt("Chain page copy"),
            "children": [para("%s · %s" % (k, v)) for k, v in c["copy"]]}})
    return out


def props(c):
    p = {}
    if "token" in c:
        p["Token"] = {"rich_text": rt(c["token"])}
    if "since" in c:
        p["Since"] = {"date": {"start": c["since"]} if c["since"] else None}
    if "unbonding" in c:
        p["Unbonding"] = {"rich_text": rt(c["unbonding"])}
    if "unbonding_days" in c:
        p["Unbonding days"] = {"number": c["unbonding_days"]}
    if "compounding" in c:
        p["Compounding"] = {"select": {"name": c["compounding"]}}
    return p


def children(pid):
    out, cur = [], None
    while True:
        r = api("GET", "blocks/%s/children?page_size=100%s" % (pid, "&start_cursor=" + cur if cur else ""))
        out += r.get("results", [])
        if not r.get("has_more"):
            return out
        cur = r["next_cursor"]


def buttons_block(c):
    return body(c)[1]


def text_of(b):
    t = b["type"]
    return "".join(x["plain_text"] for x in (b.get(t) or {}).get("rich_text", []) or [])


def update_buttons(pid, c):
    """The button block is the first column list, or a lone callout, before the first heading."""
    have = children(pid)
    lede = have[0] if have and have[0]["type"] == "paragraph" else None
    for b in have:
        if b["type"] in ("heading_1", "heading_2", "heading_3"):
            break
        if b["type"] in ("column_list", "callout"):
            api("DELETE", "blocks/" + b["id"])
    r = api("PATCH", "blocks/%s/children" % pid,
            {"children": [buttons_block(c)], **({"after": lede["id"]} if lede else {})})
    return "error" not in r


def update_texts(pid, c):
    """The line under the name and the five answers, rewritten where they differ."""
    have = children(pid)
    n = 0
    if have and have[0]["type"] == "paragraph" and text_of(have[0]) != c["lede"]:
        api("PATCH", "blocks/" + have[0]["id"], {"paragraph": {"rich_text": rt(c["lede"])}}); n += 1
    answers = dict(c["faq"])
    for i, b in enumerate(have[:-1]):
        if b["type"] == "heading_3" and have[i + 1]["type"] == "paragraph":
            want = answers.get(text_of(b))
            if want and text_of(have[i + 1]) != want:
                api("PATCH", "blocks/" + have[i + 1]["id"], {"paragraph": {"rich_text": rt(want)}}); n += 1
    return n


def prop(r, k):
    p = r["properties"].get(k)
    if not p:
        return None
    t = p["type"]
    x = p.get(t)
    if t in ("rich_text", "title"):
        return "".join(y["plain_text"] for y in x).strip() or None
    if t in ("select", "status"):
        return (x or {}).get("name")
    if t == "date":
        return (x or {}).get("start")
    return x


def month(iso, day=True):
    import datetime
    d = datetime.date.fromisoformat(iso[:10])
    return d.strftime("%B ") + (str(d.day) + ", " if day else "") + str(d.year)


def pct(x):
    return ("%.2f" % (x * 100)).rstrip("0").rstrip(".") + "%"


def facts(r):
    """The chain page's facts as text, from the row's own properties — so a crawler that does not run
    chain.js (ChatGPT's, Claude's, Perplexity's) reads the numbers the page draws (2026-09-28). Every
    value is a property; re-run --facts whenever the properties change."""
    name, token = prop(r, "Name"), prop(r, "Token") or ""
    fee, rate, when = prop(r, "Commission"), prop(r, "Reward rate"), prop(r, "Rate updated")
    comp, unb, since = prop(r, "Compounding"), prop(r, "Unbonding"), prop(r, "Since")
    if (unb or "").lower() in ("none", "no", "0"):
        unb = None   # Sui, IOTA, Mina: the row says "None"
    addr, slashes, events, run = prop(r, "Address"), prop(r, "Chain slashes"), prop(r, "Slashing events"), prop(r, "Validators run")
    out = []
    if run:   # Lido DVT: a cluster in Lido's Simple DVT module, and Lido's fee is the whole fee
        out.append("Staking %s through %s with Encapsulate: %d validators in Lido's Simple DVT module." % (token, name, run))
        if fee is not None:
            out.append("Lido's fee is %s of rewards, and ours is part of it." % pct(fee))
        if rate:
            out.append("The reward rate was %s a year after fees%s." % (rate, " (measured %s)" % month(when) if when else ""))
    else:
        s = "Staking %s with Encapsulate on %s: %s commission" % (token, name, pct(fee)) if fee is not None else "Staking %s with Encapsulate on %s" % (token, name)
        if rate:
            s += ", and a reward rate of %s a year after commission%s" % (rate, " (measured %s)" % month(when) if when else "")
        out.append(s + ".")
    if comp == "Auto":
        out.append("Rewards compound automatically.")
    elif comp == "Manual":
        out.append("Rewards are claimed and restaked from your wallet.")
    elif comp == "End":
        out.append("Rewards are paid when your staking period ends.")
    if comp == "End" and unb:
        out.append("Stake is locked for the period you choose: %s." % unb)
    elif unb:
        u = unb[0].lower() + unb[1:] if unb[0].isalpha() else unb
        out.append("%s takes %s." % ("Unstaking" if run else "Unbonding", u))
    else:
        out.append("There is no unbonding period.")
    if since:
        out.append("Encapsulate has run %s since %s." % ("these validators" if run else "this validator", month(since, day=False)))
    if slashes:
        if events == 0:
            out.append("Our %s had no slashing events." % ("validators have" if run else "validator has"))
    elif slashes is False:
        out.append("%s does not slash stake." % name)
    if addr:
        out.append(("Validator address: %s." if not any(c.isspace() for c in addr) else "Operator: %s.") % addr)
    return " ".join(out)


def description(r):
    """meta:description for the chain page: unique, with its facts (the page's own line is the same
    on 26 of 27 chains)."""
    name, token = prop(r, "Name"), prop(r, "Token") or ""
    fee, rate, unb, comp, run = prop(r, "Commission"), prop(r, "Reward rate"), prop(r, "Unbonding"), prop(r, "Compounding"), prop(r, "Validators run")
    if (unb or "").lower() in ("none", "no", "0"):
        unb = None
    if run:
        s = "Stake %s through %s with Encapsulate: %d validators, %s fee in all" % (token, name, run, pct(fee))
        if rate:
            s += ", %s a year after fees" % rate
        return s + (", %s to unstake." % unb if unb else ".")
    s = "Stake %s with Encapsulate on %s: %s commission" % (token, name, pct(fee))
    if rate:
        s += ", %s a year after commission" % rate
    if comp == "End" and unb:
        s += ", locked %s" % unb
    elif unb:
        s += ", %s unbonding" % (unb[0].lower() + unb[1:] if unb[0].isalpha() else unb)
    else:
        s += ", no unbonding"
    return s + ". Non-custodial."


def update_facts(pid, r):
    """The facts paragraph sits right after the button block, before the first heading: chain.js
    takes the first paragraph as the line and the first column list as the buttons and ignores
    anything else up there, then hides every raw block — so the page looks the same, and the text is
    in the HTML. An existing facts paragraph (it starts "Staking ") is rewritten in place."""
    have = children(pid)
    want = facts(r)
    btn = None
    for i, b in enumerate(have):
        if b["type"] in ("heading_1", "heading_2", "heading_3"):
            break
        if b["type"] in ("column_list", "callout"):
            btn = i
            break
    if btn is None:
        return "no buttons"
    nxt = have[btn + 1] if btn + 1 < len(have) else None
    if nxt and nxt["type"] == "paragraph" and text_of(nxt).startswith("Staking "):
        if text_of(nxt) == want:
            return "same"
        api("PATCH", "blocks/" + nxt["id"], {"paragraph": {"rich_text": rt(want)}})
        return "updated"
    res = api("PATCH", "blocks/%s/children" % pid, {"children": [para(want)], "after": have[btn]["id"]})
    return "added" if "error" not in res else "error %s" % res.get("body", "")[:120]


def main(argv):
    dry = "--dry" in argv
    if "--facts" in argv:
        names = [a for a in argv if not a.startswith("--")]
        schema = api("GET", "databases/" + DB)["properties"]
        if "meta:description" not in schema and not dry:
            api("PATCH", "databases/" + DB, {"properties": {"meta:description": {"rich_text": {}}}})
        for r in rows(DB):
            if prop(r, "Stage") != "Mainnet" or (names and prop(r, "Name") not in names):
                continue
            if dry:
                print("==", prop(r, "Name"), "\n  facts:", facts(r), "\n  description (%d): %s" % (len(description(r)), description(r)))
                continue
            state = update_facts(r["id"], r)
            api("PATCH", "pages/" + r["id"], {"properties": {"meta:description": {"rich_text": rt(description(r))}}})
            print("facts", prop(r, "Name"), state)
        return
    if "--buttons" in argv or "--texts" in argv:
        names = [a for a in argv if not a.startswith("--")]
        chains = json.load(open(SRC))["chains"]
        pages = {val(r, "Name"): r["id"] for r in rows(DB) if val(r, "Stage") == "Mainnet"}
        for c in chains:
            if names and c["name"] not in names:
                continue
            pid = pages[c["name"]]
            if dry:
                print("==", c["name"], c["wallet"], c.get("other")); continue
            if "--buttons" in argv:
                print("buttons", c["name"], update_buttons(pid, c))
            if "--texts" in argv:
                print("texts", c["name"], update_texts(pid, c))
        return
    replace = set()
    names = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--replace":
            replace.add(argv[i + 1]); names.append(argv[i + 1]); i += 2; continue
        if not a.startswith("--"):
            names.append(a)
        i += 1
    chains = json.load(open(SRC))["chains"]
    pages = {val(r, "Name"): r["id"] for r in rows(DB) if val(r, "Stage") == "Mainnet"}
    for c in chains:
        if names and c["name"] not in names:
            continue
        pid = pages.get(c["name"])
        if not pid:
            print("!! no mainnet row named", c["name"]); continue
        blocks = body(c)
        if dry:
            print("==", c["name"], pid, "—", len(blocks), "blocks;", sorted(props(c)))
            continue
        have = children(pid)
        if have and c["name"] not in replace:
            print("-- %s already has %d blocks; left alone" % (c["name"], len(have))); continue
        for b in have:
            api("DELETE", "blocks/" + b["id"])
        r = api("PATCH", "blocks/%s/children" % pid, {"children": blocks})
        if "error" in r:
            print("!!", c["name"], r); continue
        r2 = api("PATCH", "pages/" + pid, {"properties": props(c)})
        print("ok", c["name"], len(r["results"]), "blocks", "" if "error" not in r2 else r2)


if __name__ == "__main__":
    main(sys.argv[1:])
