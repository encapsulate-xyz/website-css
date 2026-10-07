"""Fetch a guide's steps and captures before writing its words — the first step of converting a guide.

    python3 scripts/guide_steps.py <part of the guide's Name> [--out DIR]

Finds the Guides Database row whose Name contains the text ("LUME", "Meteor"), its step database (the
child database in the page, inside its column), and every step row in Step order. Prints the guide's
Step, Time, Lede and meta:description, then each step's Name, Surface, Link, the start of its Body and
its capture's file name — the file name is the address the capture was taken at, which is the step's
Link (`wallet.keplr.app_chains_terra_tab=staking&modal=…(Guide-dashboard).png` →
`https://wallet.keplr.app/chains/terra?tab=staking&modal=…`). Downloads the captures to DIR (default
the scratchpad's `guide-<slug>/`) as step<N>-<i>.png, to be looked at one by one, and writes the backup
`backups/<slug>-guide-<date>.json` (gitignored) that the old values are restored from.

The writing itself follows notion/new-row-checklist.md, "Converting a guide — the run".
"""
import datetime, json, os, re, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from notion import api

GUIDES = "1f6e800a-5138-8181-95f9-ed0a1403479e"
ROOT = os.path.join(os.path.dirname(__file__), "..")


def val(p):
    k = p["type"]; x = p[k]
    if k in ("title", "rich_text"): return "".join(t["plain_text"] for t in x)
    if k == "select": return x and x["name"]
    if k == "relation": return [r["id"] for r in x]
    return x


def query(db, body=None):
    out, cur = [], None
    while True:
        r = api("POST", f"databases/{db}/query", {"page_size": 100, **(body or {}), **({"start_cursor": cur} if cur else {})})
        out += r["results"]
        if not r.get("has_more"): return out
        cur = r["next_cursor"]


def step_db(page, depth=0):
    for b in api("GET", f"blocks/{page}/children?page_size=100")["results"]:
        if b["type"] == "child_database": return b["id"]
        if b["has_children"] and b["type"] in ("column_list", "column") and depth < 3:
            hit = step_db(b["id"], depth + 1)
            if hit: return hit


def main(argv):
    if not argv or argv[0].startswith("-"): sys.exit(__doc__)
    want = argv[0].lower()
    out = argv[argv.index("--out") + 1] if "--out" in argv else None
    hits = [r for r in query(GUIDES) if want in val(r["properties"]["Name"]).lower()]
    if len(hits) != 1: sys.exit(f"{len(hits)} guides match {argv[0]!r}: " + ", ".join(val(r["properties"]["Name"]) for r in hits))
    g = hits[0]; P = g["properties"]
    name = val(P["Name"]); slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    out = out or os.path.join(os.environ.get("TMPDIR", "/tmp"), f"guide-{slug}")
    os.makedirs(out, exist_ok=True)
    db = step_db(g["id"])
    if not db: sys.exit("no step database in the guide's page — apply the template first")
    props = {k: val(P[k]) for k in ("Name", "Step", "Time", "Lede", "Status", "meta:description") if k in P}
    print(f"== {name}  ({g['id']})"); [print(f"   {k}: {v}") for k, v in props.items()]
    rows = []
    for r in sorted(query(db), key=lambda r: r["properties"].get("Step", {}).get("number") or 0):
        p = r["properties"]; files = p["Cover"]["files"] if "Cover" in p else []
        row = {"id": r["id"], **{k: val(p[k]) for k in ("Name", "Step", "Body", "Watch", "Surface", "Link") if k in p},
               "files": [f["name"] for f in files]}
        rows.append(row)
        for i, f in enumerate(files):
            with open(os.path.join(out, f"step{row['Step']}-{i}.png"), "wb") as fh:
                fh.write(urllib.request.urlopen(f[f["type"]]["url"]).read())
        print(f"   {row['Step']:>2} {row['Name']} | {row.get('Surface')} | {row.get('Link') or '—'} | "
              f"{(row.get('Body') or '')[:40]!r} | {row['files']}")
    back = os.path.join(ROOT, "backups", f"{slug}-guide-{datetime.date.today()}.json")
    with open(back, "w") as fh:
        json.dump({"guide": g["id"], "db": db, "props": props, "rows": rows}, fh, indent=1, ensure_ascii=False)
    print(f"captures in {out}\nbackup {os.path.relpath(back, ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])
