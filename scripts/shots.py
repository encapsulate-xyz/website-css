#!/usr/bin/env python3
"""Capture a tool's page as a panel shot, the size the navbar's tiles are drawn at.

The extension's screenshots time out on these pages, so the captures are taken with headless
Chrome — which also fixes the size exactly, at 1100 x 750 CSS px and DPR 2 (2200 x 1500), the
size `img/nav-panels/` already uses.

    python3 scripts/shots.py sui-rgp https://rgp.sui.encapsulate.xyz
    python3 scripts/shots.py            # re-take every shot in SHOTS below

A graph or a map needs a GPU: swiftshader stands in for one, and without it the page came back
blank (2026-09-23).
"""
import subprocess, sys, os

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "img", "shots")

SHOTS = {
    "sui-rgp": "https://rgp.sui.encapsulate.xyz",
    "solana-graph": "https://graph.solana.mainnet.encapsulate.xyz",
}


def shoot(name, url, w=1100, h=750, wait=25000):
    path = os.path.join(OUT, name + ".png")
    subprocess.run([CHROME, "--headless=new", "--hide-scrollbars",
                    "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                    "--force-device-scale-factor=2", "--window-size=%d,%d" % (w, h),
                    "--virtual-time-budget=%d" % wait,
                    "--run-all-compositor-stages-before-draw",
                    "--screenshot=" + path, url],
                   capture_output=True, timeout=180)
    size = os.path.getsize(path) if os.path.exists(path) else 0
    print("%-16s %-52s %s" % (name, url, ("%d KB" % (size // 1024)) if size else "FAILED"))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if len(sys.argv) >= 3:
        shoot(sys.argv[1], sys.argv[2])
    else:
        for n, u in SHOTS.items():
            shoot(n, u)
