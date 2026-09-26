#!/usr/bin/env python3
"""Print the paste table — the head files that are genuinely owed, and nothing else.

The table in a reply must be the delta, never a recollection: a row the user has already
acted on makes them redo work and hides the file that is actually new. This decides it from
two facts, neither of which is memory:

    what each head/*.html pins   vs   what the live page actually serves

A row appears only where those differ. Run it before writing the table, and copy what it
prints. `--why` also prints the commits behind each difference.

    python3 scripts/paste_table.py [--why]
"""
import re
import sys
import subprocess
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

SITE = "https://encapsulate.xyz"

# head file -> (what the user calls it, the page whose served HTML carries these links)
HEADS = {
    "head/site.html": ("site", "/"),
    "head/home.html": ("homepage", "/"),
    "head/networks.html": ("/networks", "/networks"),
    "head/governance.html": ("/governance-record", "/governance-record"),
    "head/blog.html": ("/blog", "/blog"),
    "head/brand.html": ("brand", "/brand"),
    "head/contact-us.html": ("/contact-us", "/contact-us"),
    "head/guides.html": ("guides", "/guides"),
    "head/investments.html": ("/investments", "/investments"),
    "head/security.html": ("/security", "/security"),
    "head/services.html": ("/services", "/services"),
    "head/privacy-policy.html": ("/privacy-policy", "/privacy-policy"),
    "head/terms-of-use.html": ("/terms-of-use", "/terms-of-use"),
}

PIN = re.compile(r"website-css@(v\d+)/dist/([\w.-]+\.(?:css|js))")


def pins(text):
    """{file: tag} for every jsDelivr link in a blob of HTML."""
    return {m.group(2): m.group(1) for m in PIN.finditer(text)}


def fetch(path):
    # No-cache, and a cache-busting parameter: a CDN copy of the page baked before the last
    # republish reports an old tag and puts a row in the table that the user has already done.
    sep = "&" if "?" in path else "?"
    req = urllib.request.Request(
        SITE + path + sep + "pastecheck=" + str(int(time.time())),
        headers={"User-Agent": "paste-table", "Cache-Control": "no-cache", "Pragma": "no-cache"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def commits(name, live_tag, head_tag):
    src = name.replace("dist/", "")
    out = subprocess.run(
        ["git", "log", "--oneline", f"{live_tag}..{head_tag}", "--", src],
        capture_output=True, text=True).stdout.strip()
    return out.splitlines()


def main():
    why = "--why" in sys.argv
    pages = sorted({p for _, p in HEADS.values()})
    with ThreadPoolExecutor(max_workers=len(pages)) as pool:
        served = dict(zip(pages, pool.map(fetch, pages)))

    rows, notes = [], []
    for head, (target, page) in HEADS.items():
        try:
            mine = pins(open(head).read())
        except FileNotFoundError:
            continue
        live = pins(served[page])
        behind = {f: (live.get(f), t) for f, t in mine.items()
                  if live.get(f) != t}
        if not behind:
            continue
        rows.append((head, target))
        for f, (was, now) in sorted(behind.items()):
            notes.append(f"    {f}: live {was or '—'} -> {now}")
            if why and was:
                for line in commits(f, was, now):
                    notes.append(f"        {line}")

    if not rows:
        print("No paste table: every head file matches what the site serves.")
        return
    width = max(len(h) for h, _ in rows)
    print("| File | Paste into |")
    print("|---|---|")
    for head, target in rows:
        print(f"| `{head}`{' ' * (width - len(head))} | {target} |")
    print()
    print("why:")
    print("\n".join(notes))


if __name__ == "__main__":
    main()
