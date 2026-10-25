#!/usr/bin/env python3
"""llms.txt and llms-full.txt for encapsulate.xyz (https://llmstxt.org) — built from the live site, never written by hand.

Every page in the sitemap is loaded in headless Chrome (scripts/livecheck.mjs), read as Markdown by
scripts/llms_extract.js, and laid out:

  llms/llms.txt       the index: what Encapsulate is, in the homepage's words, and every page as a link with its
                      own meta description, grouped the way the navbar groups them
  llms/llms-full.txt  every page's text as Markdown, in the same order — but the blog posts (llms-blog.txt) and the
                      vote record (llms-votes.txt), which are larger than the rest together. Super serves a file up
                      to 250 kB, so each is cut into parts under that (llms-votes-2.txt…), all linked from llms.txt

Both go into Super → Files (they are served at encapsulate.xyz/<name>). Run it again whenever a page is added,
moved or rewritten (notion/new-row-checklist.md):

  python3 scripts/llms.py            # reads every page (about 5 minutes), writes llms/
  python3 scripts/llms.py --cached   # lays out again from the pages read last time (backups/llms-pages/)
"""
import concurrent.futures, datetime, json, os, re, subprocess, sys, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://encapsulate.xyz"
CACHE = os.path.join(REPO, "backups", "llms-pages")
OUT = os.path.join(REPO, "llms")
LIMIT = 250_000  # Super's limit for a file in Files
SKIP = {"/team", "/page-not-found"}  # a forward to /#team, and the 404 page

# the navbar's groups, in its order; a path not named here falls into its section by its first segment
COMPANY = ["/", "/services", "/security", "/governance", "/governance/votes", "/investments", "/contact"]
OPTIONAL = ["/brand", "/privacy-policy", "/terms-of-use"]


def sitemap():
    xml = urllib.request.urlopen(SITE + "/sitemap.xml", timeout=30).read().decode()
    paths = [re.sub(r"^https://[^/]+", "", u).rstrip("/") or "/" for u in re.findall(r"<loc>([^<]+)</loc>", xml)]
    return [p for p in dict.fromkeys(paths) if p not in SKIP]


def read(path):
    name = path.strip("/").replace("/", "_") or "home"
    env = dict(os.environ, W="1440", H="900", WAIT="9000", REDUCED="1")
    for attempt in range(3):
        p = subprocess.run(["node", "--experimental-websocket", "scripts/livecheck.mjs", SITE + path, "v0",
                            "scripts/llms_extract.js"], cwd=REPO, env=env, capture_output=True, text=True, timeout=180)
        t = p.stdout
        try:
            page = json.JSONDecoder().raw_decode(t[t.index("{"):])[0]
            if page.get("md"):
                page["path"] = path
                with open(os.path.join(CACHE, name + ".json"), "w") as f: json.dump(page, f, ensure_ascii=False)
                return page
        except (ValueError, KeyError):
            pass
    raise SystemExit(f"could not read {path}:\n{t[-500:]}{p.stderr[-500:]}")


def title(page):
    return re.sub(r"\s*[|·–—-]\s*Encapsulate\s*$", "", page["title"]).strip() or page["title"]


def section(path):
    if path in COMPANY: return "Company"
    if path in OPTIONAL: return "Optional"
    first = path.split("/")[1]
    return {"networks": "Networks", "guides": "Staking guides", "blog": "Blog"}.get(first, "Company")


def order(pages):
    rank = {p: i for i, p in enumerate(COMPANY + OPTIONAL)}
    sections = ["Company", "Networks", "Staking guides", "Blog", "Optional"]
    # within a section: its index page first, then the rest by title
    key = lambda pg: (sections.index(section(pg["path"])), rank.get(pg["path"], 999),
                      pg["path"].count("/") if pg["path"] != "/" else 0, title(pg).lower())
    return sorted(pages, key=key)


def shift(md, by):
    """move every heading `by` levels down, so a page's own headings sit under its section heading"""
    return re.sub(r"^(#{1,6}) ", lambda m: "#" * min(6, len(m.group(1)) + by) + " ", md, flags=re.M)


def main():
    os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    if "--cached" in sys.argv:
        pages = [json.load(open(os.path.join(CACHE, f))) for f in sorted(os.listdir(CACHE)) if f.endswith(".json")]
        pages = [pg for pg in pages if pg["path"] not in SKIP]
    else:
        paths = sitemap()
        with concurrent.futures.ThreadPoolExecutor(4) as ex:
            pages = list(ex.map(read, paths))
    pages = order(pages)
    home = next(pg for pg in pages if pg["path"] == "/")
    today = datetime.date.today().isoformat()

    # ---- the full text: the pages, the blog posts and the vote record, each packed into parts Super can serve
    def render(pg):
        return (f"## {title(pg)}\n\nURL: {pg['url']}" + (f"\n\n{pg['description']}" if pg["description"] else "")
                + "\n\n" + shift(pg["md"], 2))

    def pieces(text, budget):
        """a page's text in pieces under the budget: split between blocks, a table's header repeated in each piece"""
        if len(text.encode()) <= budget: return [text]
        out, cur, header = [], [], []
        for line in text.split("\n"):
            if line.startswith("| --- "): header = cur[-1:] + [line]
            if cur and len(("\n".join(cur + [line])).encode()) > budget and (line.startswith("| ") or not line):
                out.append("\n".join(cur)); cur = header[:] if line.startswith("| ") else []
            cur.append(line)
        return out + ["\n".join(cur)]

    groups = [
        ("llms-full", "every page of encapsulate.xyz but the blog posts and the vote record",
         [pg for pg in pages if section(pg["path"]) != "Blog" or pg["path"] == "/blog" if pg["path"] != "/governance/votes"]),
        ("llms-blog", "every blog post on encapsulate.xyz/blog",
         [pg for pg in pages if section(pg["path"]) == "Blog" and pg["path"] != "/blog"]),
        ("llms-votes", "our governance vote record, every vote on encapsulate.xyz/governance/votes",
         [pg for pg in pages if pg["path"] == "/governance/votes"]),
    ]
    files, about = {}, {}
    for base, what, pgs in groups:
        head = lambda part, total: (f"# Encapsulate — {what}" + (f" (part {part} of {total})" if total > 1 else "")
                                    + f"\n\n> {home['description']}\n\nAs Markdown, as it reads on {today}. "
                                    f"The index of the site is {SITE}/llms.txt.")
        budget = LIMIT - len(head(9, 9).encode()) - 2000
        parts, cur = [], ""
        for pg in pgs:
            for piece in pieces(render(pg), budget):
                if cur and len((cur + "\n\n" + piece).encode()) > budget: parts.append(cur); cur = ""
                cur = (cur + "\n\n" + piece) if cur else piece
        if cur: parts.append(cur)
        for i, body in enumerate(parts, 1):
            name = f"{base}.txt" if i == 1 else f"{base}-{i}.txt"
            files[name] = (head(i, len(parts)) + "\n\n" + body).strip() + "\n"
            about[name] = what + (f", part {i} of {len(parts)}" if len(parts) > 1 else "")

    # ---- llms.txt
    lines = [f"# Encapsulate", "", f"> {home['description']}", ""]
    lede = [b for b in home["md"].split("\n\n") if b.strip()][:2]  # the hero's heading and line, as the site says them
    lines += [re.sub(r"^#+ ", "", b) for b in lede] + [""]
    current = None
    for pg in pages:
        s = section(pg["path"])
        if s != current:
            lines += ["", f"## {s}", ""]; current = s
        lines.append(f"- [{title(pg)}]({pg['url']})" + (f": {pg['description']}" if pg["description"] else ""))
    lines += ["", "## Full text", ""]
    for name, body in files.items():
        lines.append(f"- [{name}]({SITE}/{name}): {about[name]}, as Markdown ({len(body.encode()) // 1000} kB, {today})")
    files = {"llms.txt": "\n".join(lines).replace("\n\n\n", "\n\n").strip() + "\n", **files}

    for name, body in files.items():
        size = len(body.encode())
        if size > LIMIT: raise SystemExit(f"{name} is {size} bytes, over Super's {LIMIT}")
        with open(os.path.join(OUT, name), "w") as f: f.write(body)
        print(f"{name}: {size:,} bytes")
    print(f"{len(pages)} pages")


if __name__ == "__main__":
    main()
