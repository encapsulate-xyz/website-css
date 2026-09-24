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


def main(argv):
    dry = "--dry" in argv
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
