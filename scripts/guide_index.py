#!/usr/bin/env python3
"""Which guide pages Google may index: only a guide whose row in the Guides Database is Status Live.

The user, 2026-10-28: noindex the guides that are not Live, "and remove it when they are live". Every other guide
page (Soon, Concluded) carries a robots noindex line in its own Super head, under its canonical line — never in the
site-wide head (docs/seo.md). This reads every row's Status and every /guides/<slug> page's live HTML and prints the
guides that are out of step, with the whole head to write for each:

  - a Live guide that is still noindex: write its head back to the canonical line alone, refresh the page, CANCEL
    its removal in Search Console if it has one (Removals → the URL's ⋮ → Cancel request — a temporary removal hides
    the URL for about six months whatever the page says), then request indexing (CLAUDE.md, "After every task,
    Search Console");
  - a guide that is not Live and has no noindex: write the head with the noindex line, refresh the page, and if
    Google holds it, file a removal (Removals → New request → Remove this URL only).

On 2026-10-28 the 16 guides that were not Live (9 Soon, 7 Concluded) got the noindex line, and the 12 Google held
had a removal filed: althea, avail, avalanche, eigen-layer, eigen-layer-steth, gitopia, humans-ai, ika, supra, juno,
mellow, namada (docs/seo.md, "A guide is public only when it is Live").

Nothing is written from here: a page head is written whole through Super's MCP (set_code with the page's id, which
list_pages gives) and checked by its hash. Run it whenever a guide's Status changes, after converting a guide
(notion/new-row-checklist.md, "Converting a guide — the run"), and in the Search Console routine.

    python3 scripts/guide_index.py           # the guides out of step, and their heads
    python3 scripts/guide_index.py --all     # every guide, in step or not
"""
import os, re, sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from notion import rows  # noqa: E402
from og_cards import GUIDES, SITE, get, paths, val  # noqa: E402

NOINDEX = '<meta name="robots" content="noindex">'


def head(path, live):
    """The whole head of a guide page: its canonical line, and the noindex line while it is not Live."""
    line = '<link rel="canonical" href="%s%s">' % (SITE, path)
    return line if live else line + "\n" + NOINDEX


def noindexed(path):
    html = get(SITE + path + "?x=" + os.urandom(4).hex())
    return bool(re.search(r'<meta name="robots" content="[^"]*noindex', html))


def main():
    every = "--all" in sys.argv
    status = {r["id"].replace("-", ""): (val(r, "Status") or "", val(r, "Name")) for r in rows(GUIDES)}
    where = paths("/guides/")
    pages = sorted(((p, rid) for rid, p in where.items()), key=lambda x: x[0])
    with ThreadPoolExecutor(8) as ex:
        held = dict(zip([p for p, _ in pages], ex.map(noindexed, [p for p, _ in pages])))
    out = 0
    for p, rid in pages:
        st, name = status.get(rid, ("(no row)", ""))
        live = st == "Live"
        ok = held[p] != live
        if ok and not every:
            continue
        what = "ok" if ok else ("REMOVE noindex, then request indexing" if live else "ADD noindex")
        print("%-28s %-10s %-9s %s" % (p, st, "noindex" if held[p] else "index", what))
        if not ok:
            out += 1
            print("  head: " + head(p, live).replace("\n", "\n        "))
    missing = [name for rid, (st, name) in status.items() if rid not in where]
    if missing:
        print("rows with no page in the sitemap: " + ", ".join(sorted(missing)))
    print("%d of %d guide pages out of step" % (out, len(pages)))
    return 1 if out else 0


if __name__ == "__main__":
    sys.exit(main())
