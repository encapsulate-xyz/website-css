"""Social cards (og:image) for the three kinds of database page, attached to each row in Notion.

    python3 scripts/og_cards.py posts|chains|guides [--only TEXT ...] [--dry] [--keep DIR]

Each card is 1200×630 and is the page's own design, not a new one:

  posts   Blog Cover System, 17d "Pastel glyph": ink, the tag in the post's pastel beside the date,
          the title, the reversed wordmark, the post's Cover glyph tinted and bled off the corner
          (a post with no Cover takes the plain pastel shape). The pastel is the post's place on
          the /blog index — Live posts, newest first, TINTS[i % 5] — as blog.js draws its card.
          A title that would run into the glyph wraps short of its ink (the design's rule: white
          type stays on ink). Also writes meta:description = the row's Lede.
  chains  the chain page's hero, captured from the live page at 1440×756 with the bar hidden.
          Also writes meta:title = "<Name> staking - Encapsulate".
  guides  the guide page's head (design 1d), built from the row the way guide.js builds it and
          drawn by guide.css, at 800×420. Also writes meta:description = the row's Lede.

The card goes into the row's `meta:image` (Super serves it as og:image and copies it to its own
asset host). Super picks a row up on its own sync (every four hours on this plan) or at once with
that page's refresh (↻ over the preview in Super's dashboard). A guide still carrying an image or
description override in Super's Page SEO Settings keeps it — those beat the Notion properties.

--only keeps the rows whose path, name or id contains TEXT. --dry renders and stops before Notion.
Rendering needs Google Chrome and node (scripts/og/render.mjs); the templates are scripts/og/*.html.
"""
import datetime, json, os, re, subprocess, sys, tempfile, time, urllib.parse, urllib.request, uuid
import urllib.error
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from notion import api, rows, TOKEN  # noqa: E402

SITE = "https://encapsulate.xyz"
BLOGS = "a148eb7f-8ea9-4b95-b772-5809fef9e0dc"
SET = "3dde800a-5138-8133-b7f1-d1ccdda08038"
GUIDES = "1f6e800a-5138-8181-95f9-ed0a1403479e"
WALLETS = "3dde800a-5138-8097-b664-fafed678f048"
PREFIX = {"posts": "/blog/", "chains": "/networks/", "guides": "/guides/"}
GUIDE_COPY = {"crumb": "Encapsulate · Guides", "screens": "{N} screens", "scroll": "Scroll ↓"}  # guide.js CONTENT


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 og_cards"})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")


def val(r, name):
    p = r["properties"].get(name) or {}
    t = p.get("type")
    if t == "title": return "".join(x["plain_text"] for x in p["title"])
    if t == "rich_text": return "".join(x["plain_text"] for x in p["rich_text"])
    if t in ("select", "status"): return (p[t] or {}).get("name", "")
    if t == "multi_select": return [x["name"] for x in p["multi_select"]]
    if t == "number": return p["number"]
    if t == "date": return (p["date"] or {}).get("start", "")
    if t == "relation": return [x["id"].replace("-", "") for x in p["relation"]]
    if t == "files": return [(f.get("file") or f.get("external") or {}).get("url") for f in p["files"]]
    return None


def paths(prefix):
    """Every live path under a prefix, mapped to its row id. Super owns the paths, so they are
    read off the pages: the sitemap lists them and each page's data carries its "uri" and, after
    its properties, its "blockId" (the same lookup chain.js does)."""
    urls = [u for u in re.findall(r"<loc>([^<]+)</loc>", get(SITE + "/sitemap.xml")) if urlparse(u).startswith(prefix)]

    def one(u):
        text = re.sub(r'\\+"', '"', get(u))
        p = urlparse(u)
        at = text.find('"uri":"%s"' % p)
        m = re.search(r'"blockId":"([0-9a-f-]{36})"', text[at:at + 60000]) if at >= 0 else None
        return p, (m.group(1).replace("-", "") if m else None)
    with ThreadPoolExecutor(8) as ex:
        return {rid: p for p, rid in ex.map(one, urls) if rid}


def urlparse(u):
    return urllib.parse.urlparse(u).path.rstrip("/")


def fetch(url, folder, name):
    out = os.path.join(folder, name)
    if url and not os.path.exists(out):
        urllib.request.urlretrieve(url, out)
    return "file://" + out if url else ""


def long_date(iso):
    d = datetime.date.fromisoformat(iso[:10])
    return "%s %d, %d" % (d.strftime("%B"), d.day, d.year)


def jobs_posts(tmp, only):
    rs = rows(BLOGS)
    where = paths(PREFIX["posts"])
    live = sorted((r for r in rs if val(r, "Status") == "Live"), key=lambda r: val(r, "Published Time") or "", reverse=True)
    order = {r["id"]: i for i, r in enumerate(live)}
    rest = [r for r in rs if r["id"] not in order]
    for k, r in enumerate(rest):
        order[r["id"]] = len(live) + k
    out = []
    for r in rs:
        rid = r["id"].replace("-", "")
        path = where.get(rid)
        if not path or not keep(only, path, val(r, "Name"), rid):
            continue
        tags = val(r, "Tags") or []
        covers = [u for u in (val(r, "Cover (2000 * 408)") or []) if u]
        p = {"i": order[r["id"]], "k": next((t for t in tags if t.lower() != "informative"), tags[0] if tags else ""),
             "d": long_date(val(r, "Published Time") or r["created_time"]), "t": val(r, "Name"),
             "glyph": fetch(covers[0], tmp, rid + "-glyph.png") if covers else ""}
        out.append(({"url": "file://" + os.path.join(HERE, "og", "post.html") + "#" + urllib.parse.quote(json.dumps(p)),
                     "w": 1200, "h": 630, "dsf": 1, "waitFor": "window.done", "wait": 300},
                    {"id": rid, "path": path, "description": val(r, "Lede")}))
    return out


def jobs_chains(tmp, only):
    rs = {r["id"].replace("-", ""): r for r in rows(SET)}
    out = []
    for rid, path in paths(PREFIX["chains"]).items():
        r = rs.get(rid)
        if not r or not keep(only, path, val(r, "Name"), rid):
            continue
        out.append(({"url": SITE + path, "w": 1440, "h": 756, "dsf": 1200 / 1440,
                     "css": "nav.super-navbar{display:none!important}",
                     "waitFor": "document.querySelector('[data-enc-chain]:not([data-enc-chain=\"pending\"])') && document.fonts.status==='loaded'",
                     "wait": 3000, "js": "window.scrollTo(0,0); 1"},
                    {"id": rid, "path": path, "title": val(r, "Name") + " staking - Encapsulate"}))
    return out


def guide_copy():
    """The words every guide head shares: the "Guide page copy" toggle on /guides, key · value."""
    words = dict(GUIDE_COPY)
    try:
        html = get(SITE + "/guides")
        at = html.find("Guide page copy")
        for line in re.findall(r">([^<>]{1,80}·[^<>]{1,80})<", html[at:at + 20000] if at >= 0 else ""):
            k, v = [x.strip() for x in line.split("·", 1)]
            if k in words and v:
                words[k] = v
    except Exception:
        pass
    return words


def jobs_guides(tmp, only):
    chains = {r["id"].replace("-", ""): r for r in rows(SET)}
    wallets = {r["id"].replace("-", ""): r for r in rows(WALLETS)}
    words = guide_copy()
    where = paths(PREFIX["guides"])
    out = []
    for r in rows(GUIDES):
        rid = r["id"].replace("-", "")
        path = where.get(rid)
        if not path or not keep(only, path, val(r, "Name"), rid):
            continue
        c = next((chains[x] for x in val(r, "Networks set") if x in chains), None)
        w = next((wallets[x] for x in val(r, "Wallet Set") if x in wallets), None)
        cmark = [u for u in val(c, "Cover") or [] if u] if c else []
        wmark = [u for u in val(w, "Files & media") or [] if u] if w else []
        g = {"crumb": words["crumb"], "screens": words["screens"], "scroll": words["scroll"],
             "name": val(r, "Name"), "chain": val(c, "Name") if c else "", "title": val(r, "Title"),
             "lede": val(r, "Lede"), "steps": int(val(r, "Step") or 0),
             "chainMark": fetch(cmark[0], tmp, "c-" + (c["id"] if c else "") + ".png") if cmark else "",
             "walletMark": fetch(wmark[0], tmp, "w-" + (w["id"] if w else "") + ".png") if wmark else ""}
        out.append(({"url": "file://" + os.path.join(HERE, "og", "guide.html") + "#" + urllib.parse.quote(json.dumps(g)),
                     "w": 800, "h": 420, "dsf": 1.5, "waitFor": "window.done", "wait": 300},
                    {"id": rid, "path": path, "description": val(r, "Lede")}))
    return out


def keep(only, *fields):
    return not only or any(o.lower() in (f or "").lower() for o in only for f in fields)


def send(upload_id, path, name):
    boundary = uuid.uuid4().hex
    body = ("--%s\r\nContent-Disposition: form-data; name=\"file\"; filename=\"%s\"\r\nContent-Type: image/png\r\n\r\n"
            % (boundary, name)).encode() + open(path, "rb").read() + ("\r\n--%s--\r\n" % boundary).encode()
    for attempt in range(4):
        req = urllib.request.Request("https://api.notion.com/v1/file_uploads/%s/send" % upload_id, method="POST", data=body,
                                     headers={"Authorization": "Bearer " + TOKEN, "Notion-Version": "2022-06-28",
                                              "Content-Type": "multipart/form-data; boundary=" + boundary})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503) and attempt < 3:
                time.sleep(3 + attempt * 3)
                continue
            return {"error": e.code}


def attach(item, png, kind):
    name = "%s-%s-og.png" % (kind.rstrip("s"), item["path"].strip("/").split("/", 1)[-1].replace("/", "-"))
    up = api("POST", "file_uploads", {"filename": name, "content_type": "image/png"})
    if "id" not in up or (send(up["id"], png, name) or {}).get("status") != "uploaded":
        return "upload failed"
    props = {"meta:image": {"files": [{"type": "file_upload", "file_upload": {"id": up["id"]}, "name": name}]}}
    for k in ("title", "description"):
        if item.get(k):
            props["meta:" + k] = {"rich_text": [{"type": "text", "text": {"content": item[k][:2000]}}]}
    r = api("PATCH", "pages/" + item["id"], {"properties": props})
    return "attach failed %s" % r.get("error") if "error" in r else "ok"


def main():
    args = sys.argv[1:]
    if not args or args[0] not in PREFIX:
        sys.exit(__doc__)
    kind, dry = args[0], "--dry" in args
    only = args[args.index("--only") + 1:] if "--only" in args else []
    only = [o for o in only if not o.startswith("--")]
    tmp = args[args.index("--keep") + 1] if "--keep" in args else tempfile.mkdtemp(prefix="og-")
    os.makedirs(tmp, exist_ok=True)
    pairs = {"posts": jobs_posts, "chains": jobs_chains, "guides": jobs_guides}[kind](tmp, only)
    for job, item in pairs:
        job["out"] = os.path.join(tmp, item["id"] + ".png")
    spec = os.path.join(tmp, "jobs.json")
    json.dump([j for j, _ in pairs], open(spec, "w"))
    # one tab at a time: several tabs in one Chrome painted one card with another's strip (2026-09-27)
    subprocess.run(["node", "--experimental-websocket", os.path.join(HERE, "og", "render.mjs"), spec],
                   env=dict(os.environ, CONC="1"), check=True, stdout=subprocess.DEVNULL)
    for job, item in pairs:
        state = "rendered" if dry else attach(item, job["out"], kind)
        print("%-8s %s  %s" % (state, item["path"], job["out"]))
    if not dry:
        print("\nSuper shows them after its own sync, or at once with each page's refresh in the dashboard.")


if __name__ == "__main__":
    main()
