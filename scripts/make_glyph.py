#!/usr/bin/env python3
"""Make an Encapsulate network glyph: black ink on transparency, 600x600, longest solid side 288, centred.

    python make_glyph.py SRC OUT [--mode auto|alpha|inverse|badge] [--size 600] [--ink 288] [--allow-filled]

See GLYPH-SPEC.md for the process and the checks.
"""
import argparse
import io
import sys

import numpy as np
from PIL import Image

WORK = 2400  # working resolution (longest side) — every step happens here; one downsample at the end


def load(src):
    if src.lower().endswith(".svg"):
        import cairosvg
        probe = Image.open(io.BytesIO(cairosvg.svg2png(url=src))).convert("RGBA")
        kw = {"output_width": WORK} if probe.width >= probe.height else {"output_height": WORK}
        return Image.open(io.BytesIO(cairosvg.svg2png(url=src, **kw))).convert("RGBA")
    im = Image.open(src).convert("RGBA")
    if max(im.size) < 600:
        print(f"warning: raster source is {im.size} — under 600px; ask for a vector or a larger file", file=sys.stderr)
    return im


def luminance(rgb):
    return (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255.0


def border(x):
    return np.concatenate([x[0], x[-1], x[:, 0], x[:, -1]])


def detect(a):
    alpha = a[..., 3]
    if (border(alpha) < 16).mean() > 0.9:
        return "alpha"
    lum = luminance(a[..., :3].astype(float))
    return "inverse" if border(lum).mean() > 0.75 else "badge"


def stretch(x, lo, hi):
    if hi - lo < 1e-6:
        return np.zeros_like(x)
    return np.clip((x - lo) / (hi - lo), 0.0, 1.0)


def flatten(a, mode):
    rgb = a[..., :3].astype(float)
    al = a[..., 3].astype(float) / 255.0
    lum = luminance(rgb)
    opaque = al > 0.5
    if mode == "alpha":
        return al
    if mode == "inverse":
        # dark mark on light ground: ink = how much darker than the ground, stretched to the darkest ink
        ground = np.median(border(lum))
        darkest = np.percentile(lum[opaque], 2) if opaque.any() else 0.0
        return stretch(ground - lum, 0.0, max(ground - darkest, 1e-3)) * al
    if mode == "badge":
        # light mark on a coloured disc: the disc is the most common opaque colour; keep only what is lighter
        disc = np.median(lum[opaque]) if opaque.any() else 0.0
        lightest = np.percentile(lum[opaque], 98) if opaque.any() else 1.0
        return stretch(lum - disc, 0.08 * (lightest - disc), lightest - disc) * al
    raise ValueError(mode)


def normalise(alpha, size, ink, pad=2):
    solid = alpha >= 0.5  # trim against solid ink only (the Avail rule)
    if not solid.any():
        raise SystemExit("no solid ink found — wrong mode?")
    ys, xs = np.nonzero(solid)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    h, w = y1 - y0, x1 - x0
    # keep a small anti-aliasing fringe round the solid box; drop everything else (stray specks)
    Y0, Y1 = max(0, y0 - pad), min(alpha.shape[0], y1 + pad)
    X0, X1 = max(0, x0 - pad), min(alpha.shape[1], x1 + pad)
    crop = alpha[Y0:Y1, X0:X1]
    s = ink / max(h, w)
    im = Image.fromarray(np.round(crop * 255).astype(np.uint8), "L")
    im = im.resize((max(1, round(crop.shape[1] * s)), max(1, round(crop.shape[0] * s))), Image.LANCZOS)  # the one resample
    # centre the SOLID box, not the fringe
    ox = round((size - w * s) / 2 - (x0 - X0) * s)
    oy = round((size - h * s) / 2 - (y0 - Y0) * s)
    mask = Image.new("L", (size, size), 0)
    mask.paste(im, (ox, oy))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.putalpha(mask)  # RGB stays pure black; only alpha carries the shape
    return out, (w, h)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("out")
    p.add_argument("--mode", default="auto", choices=["auto", "alpha", "inverse", "badge"])
    p.add_argument("--size", type=int, default=600)
    p.add_argument("--ink", type=int, default=288)
    p.add_argument("--allow-filled", action="store_true")
    a = p.parse_args()

    src = np.array(load(a.src))
    mode = detect(src) if a.mode == "auto" else a.mode
    out, box = normalise(flatten(src, mode), a.size, a.ink)
    share = (np.array(out)[..., 3] > 128).mean()
    if a.mode == "auto" and mode == "alpha" and share > 0.15:
        # a badge on transparency looks like the alpha case until it comes out as a disc (the Pell rule)
        mode = "badge"
        out, box = normalise(flatten(src, mode), a.size, a.ink)
        share = (np.array(out)[..., 3] > 128).mean()

    arr = np.array(out)[..., 3]
    edge = max(arr[0].max(), arr[-1].max(), arr[:, 0].max(), arr[:, -1].max())
    out.save(a.out, optimize=True)
    print(f"{a.out}: mode={mode} solid box={box[0]}x{box[1]}px at working size, opaque share={share:.1%}")
    if edge > 0:
        print("warning: ink touches the frame edge", file=sys.stderr)
    if not (0.05 <= share <= 0.13) and not a.allow_filled:
        print("check failed: opaque share outside 5–13% — wrong mode, or a filled mark (use --allow-filled if intended)", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
