"""The state of every pull request the profile tracker follows, read with `gh`.

    python3 scripts/profile_tracker/prs.py            a table
    python3 scripts/profile_tracker/prs.py --json     one object per row, as the tracker's documents hold it

prs.json maps a tracker row to its pull request. The tracker (an artifact) keeps each row's status in its database,
collection `updates`: write what this prints into the row's `pr` field, and set `status` to "done" once it is merged
("started" while it is open). Nothing here writes anywhere.
"""
import datetime, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PRS = json.load(open(os.path.join(HERE, "prs.json")))


def view(url):
    out = subprocess.run(["gh", "pr", "view", url, "--json", "number,state,url,mergedAt,closedAt,title,reviewDecision,statusCheckRollup,comments"],
                         capture_output=True, text=True)
    if out.returncode:
        return {"url": url, "state": "unknown", "error": out.stderr.strip()[:200]}
    d = json.loads(out.stdout)
    checks = [(c.get("name") or c.get("context"), (c.get("conclusion") or c.get("state") or c.get("status") or "").lower()) for c in d.get("statusCheckRollup") or []]
    bad = [n for n, s in checks if s in ("failure", "error", "timed_out", "cancelled", "action_required")]
    repo = "/".join(url.split("/")[3:5])
    return {"url": url, "repo": repo, "number": d["number"], "state": d["state"].lower(), "merged": (d.get("mergedAt") or "")[:10],
            "checks": "failing: " + ", ".join(bad) if bad else ("passing" if checks else "none"), "comments": len(d.get("comments") or []),
            "review": (d.get("reviewDecision") or "").lower(), "checked": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}


rows = {k: view(u) for k, u in PRS.items()}
if "--json" in sys.argv:
    print(json.dumps(rows, indent=1))
else:
    for k, r in rows.items():
        print(f'{k:5} {r["state"]:8} {r.get("merged", ""):10} checks {r.get("checks", ""):28} comments {r.get("comments", 0)}  {r["url"]}')
