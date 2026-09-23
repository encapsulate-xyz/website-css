"""Minimal Notion REST client, shared by the governance scripts.

The token is the "Encapsulate Website" internal integration. Read from NOTION_TOKEN when it is
set (that is how a GitHub Action would pass it) and otherwise from ~/.notion-covers-token, which
is how it is kept on the machine. Never print it.
"""
import json, os, time, urllib.request, urllib.error

def _token():
    env = os.environ.get("NOTION_TOKEN")
    if env:
        return env.strip()
    path = os.path.expanduser("~/.notion-covers-token")
    with open(path) as f:
        return f.read().strip()

TOKEN = _token()
GOVERNANCE_DB = "c458e5dd-671d-4ecb-8fc0-7a15915e4f42"   # "Governance Record"


def api(method, path, body=None, retries=4):
    """One request. Returns the decoded JSON, or {'error': status, 'body': …} on an HTTP error."""
    for attempt in range(retries):
        req = urllib.request.Request(
            "https://api.notion.com/v1/" + path, method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={"Authorization": "Bearer " + TOKEN,
                     "Notion-Version": "2022-06-28",
                     "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503) and attempt < retries - 1:
                time.sleep(2 + attempt * 2)
                continue
            return {"error": e.code, "body": e.read().decode()[:500]}


def rows(db=GOVERNANCE_DB, size=100):
    """Every row of a database, following the cursor."""
    out, cur = [], None
    while True:
        q = api("POST", "databases/%s/query" % db,
                {"page_size": size, **({"start_cursor": cur} if cur else {})})
        if "results" not in q:
            raise RuntimeError(json.dumps(q)[:300])
        out += q["results"]
        if not q.get("has_more"):
            return out
        cur = q["next_cursor"]


def val(row, name):
    """The plain value of one property, whatever its type."""
    p = (row.get("properties") or {}).get(name) or {}
    t = p.get("type")
    if t == "title":      return "".join(x["plain_text"] for x in p["title"])
    if t == "rich_text":  return "".join(x["plain_text"] for x in p["rich_text"])
    if t == "select":     return (p["select"] or {}).get("name", "")
    if t == "number":     return p["number"]
    if t == "date":       return (p["date"] or {}).get("start", "")
    return ""


def set_text(page_id, prop, text):
    return api("PATCH", "pages/" + page_id,
               {"properties": {prop: {"rich_text": [{"type": "text",
                                                     "text": {"content": text[:2000]}}]}}})


def upload(path, filename=None, content_type="image/png"):
    """Upload a local file through Notion's file-upload API and return its file_upload id, ready to
    attach as {"type": "file_upload", "file_upload": {"id": ...}} on a files property or a block.
    Two steps: create the upload, then send the bytes as multipart form data."""
    import uuid
    filename = filename or os.path.basename(path)
    made = api("POST", "file_uploads", {"filename": filename, "content_type": content_type})
    if "id" not in made:
        raise RuntimeError(json.dumps(made)[:300])
    data = open(path, "rb").read()
    boundary = uuid.uuid4().hex
    body = (("--%s\r\nContent-Disposition: form-data; name=\"file\"; filename=\"%s\"\r\n"
             "Content-Type: %s\r\n\r\n") % (boundary, filename, content_type)).encode() + data + \
        ("\r\n--%s--\r\n" % boundary).encode()
    req = urllib.request.Request(
        "https://api.notion.com/v1/file_uploads/%s/send" % made["id"], method="POST", data=body,
        headers={"Authorization": "Bearer " + TOKEN, "Notion-Version": "2022-06-28",
                 "Content-Type": "multipart/form-data; boundary=" + boundary})
    with urllib.request.urlopen(req, timeout=120) as r:
        sent = json.load(r)
    if sent.get("status") != "uploaded":
        raise RuntimeError(json.dumps(sent)[:300])
    return made["id"]
