"""Lay out the distinct frames flashcheck.mjs recorded on one sheet, each labelled with its time and
how far it is from the last frame (0 = the settled page), so raw Notion before a build shows at a
glance. Needs Pillow (the glyph pipeline's venv has it).

    python3 scripts/flashsheet.py <out-dir> [more out-dirs…]

Writes <out-dir>/sheet.jpg and prints one line per recording: the frames that differ from the
settled page by more than 2% of their pixels, and for how long they were on screen."""
import json, os, sys
from PIL import Image, ImageChops, ImageDraw

def diff(a, b):
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 40 else 0)
    return sum(d.histogram()[255:]) / (a.width * a.height)

for out in sys.argv[1:]:
    meta = json.load(open(os.path.join(out, "frames.json")))
    frames = meta["frames"]
    if not frames:
        print(out, "no frames"); continue
    imgs = [Image.open(os.path.join(out, f["file"])).convert("RGB") for f in frames]
    last = imgs[-1]
    kept, prev = [], None
    for f, im in zip(frames, imgs):
        small = im.resize((im.width // 8, im.height // 8))
        if prev is not None and diff(prev, small) < 0.002:
            continue
        kept.append((f, im, diff(im, last)))
        prev = small
    # how long each kept frame stayed up: until the next kept frame
    off = [(kept[i + 1][0]["ms"] if i + 1 < len(kept) else frames[-1]["ms"]) - k[0]["ms"] for i, k in enumerate(kept)]
    tw = 360; th = round(tw * meta["H"] / meta["W"])
    cols = 6; rows = (len(kept) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 30) + 8), "white")
    dr = ImageDraw.Draw(sheet)
    for i, ((f, im, d), dur) in enumerate(zip(kept, off)):
        x = 8 + (i % cols) * (tw + 8); y = 8 + (i // cols) * (th + 30)
        sheet.paste(im.resize((tw, th)), (x, y + 22))
        dr.text((x, y + 4), f"{f['ms']}ms  +{dur}ms  diff {d * 100:.1f}%", fill="black")
    sheet.save(os.path.join(out, "sheet.jpg"), quality=80)
    far = [f"{k[0]['ms']}ms({dur}ms,{k[2] * 100:.0f}%)" for k, dur in zip(kept, off) if k[2] > 0.02]
    print(f"{os.path.basename(out.rstrip('/'))}: {len(frames)} frames, {len(kept)} distinct; far from settled: {' '.join(far) or '-'}")
