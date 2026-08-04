#!/usr/bin/env python3
"""
make_icons.py — rasterize the SVG brand sources to the committed PNGs.

The SVGs in builder/assets/ are the source of truth. The PNGs beside them exist
only because some consumers cannot take an SVG:

    favicon-32.png     fallback for browsers without SVG favicon support
    app-icon-180.png   apple-touch-icon (Safari ignores SVG here)
    app-icon-512.png   maskable PWA / installed-app icon
    share-card.png     og:image / twitter:image (social scrapers need a raster)

Run this after editing any SVG, then commit both:

    .venv/bin/python builder/make_icons.py
    .venv/bin/python builder/make_icons.py --check     # verify, write nothing

NOT part of build.sh, deliberately. This uses macOS's `sips`, and the scheduled
CI job runs on Linux — wiring it into the pipeline would break the nightly build.
The PNGs are committed instead, and --check gives you a way to notice when they
have drifted from the SVGs.

Why `sips`: it is the only SVG rasterizer available here without adding a
dependency (no rsvg-convert / inkscape / cairosvg / ImageMagick on this machine),
and it renders text, which a hand-rolled rasterizer could not. It is macOS-only,
hence the guard below. On another platform, use any of:

    rsvg-convert -w 512 -h 512 app-icon.svg -o app-icon-512.png
    inkscape app-icon.svg -w 512 -h 512 -o app-icon-512.png
    magick -background none -density 384 app-icon.svg -resize 512x512 app-icon-512.png
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ASSETS = Path(__file__).resolve().parent / "assets"

# (source svg, output png, longest edge in px)
TARGETS: list[tuple[str, str, int]] = [
    ("logo-mark.svg", "favicon-32.png", 32),
    ("app-icon.svg", "app-icon-180.png", 180),
    ("app-icon.svg", "app-icon-512.png", 512),
    ("share-card.svg", "share-card.png", 1200),
]

# What each PNG must actually be, so a silent sips failure (which still exits 0
# and can emit a 1x1) cannot slip through.
EXPECTED_SIZE = {
    "favicon-32.png": (32, 32),
    "app-icon-180.png": (180, 180),
    "app-icon-512.png": (512, 512),
    "share-card.png": (1200, 630),
}


def png_dimensions(path: Path) -> tuple[int, int]:
    """Width and height from a PNG's IHDR, without an imaging library."""
    header = path.read_bytes()[:24]
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path.name} is not a PNG")
    return struct.unpack(">II", header[16:24])


def render(svg: Path, out: Path, longest_edge: int) -> None:
    # Render to a temp file first: sips writing in place would leave a corrupt
    # asset behind if it failed halfway.
    with tempfile.TemporaryDirectory() as tmp:
        staged = Path(tmp) / out.name
        result = subprocess.run(
            ["sips", "-s", "format", "png", "-Z", str(longest_edge), str(svg), "--out", str(staged)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 or not staged.exists():
            raise SystemExit(f"ERROR: sips failed on {svg.name}\n{result.stderr.strip()}")

        got = png_dimensions(staged)
        want = EXPECTED_SIZE[out.name]
        if got != want:
            raise SystemExit(
                f"ERROR: {out.name} rendered at {got[0]}x{got[1]}, expected {want[0]}x{want[1]}.\n"
                f"  Check the viewBox in {svg.name}."
            )
        shutil.move(str(staged), str(out))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12] if path.exists() else "missing"


def check_share_card_figures() -> list[str]:
    """The share card quotes corpus figures; make sure they are still true.

    share-card.svg has "1,288 ARTICLES / 508 REJECT CODES / 51 JURISDICTIONS"
    baked in as text, because it is a raster for social scrapers and cannot read
    the build data. That means the numbers can silently go stale the next time the
    corpus changes, so they are verified against data/catalog.json here instead of
    trusted.
    """
    catalog_path = ASSETS.parent.parent / "data" / "catalog.json"
    if not catalog_path.exists():
        return ["data/catalog.json not found — share card figures unverified"]

    import json

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    actual = {
        "articles": catalog["count"],
        "reject codes": sum(1 for row in catalog["rows"] if row[2]),
        "jurisdictions": len(catalog["jurisdictions"]),
    }
    svg = (ASSETS / "share-card.svg").read_text(encoding="utf-8")

    problems = []
    for label, value in actual.items():
        # The card formats thousands with a comma.
        if f">{value:,}<" not in svg:
            problems.append(f"share-card.svg does not show {value:,} for {label}")
    return problems


def main() -> None:
    parser = argparse.ArgumentParser(description="Rasterize the brand SVGs to PNG.")
    parser.add_argument("--check", action="store_true",
                        help="report whether the PNGs match the SVGs; write nothing")
    args = parser.parse_args()

    if sys.platform != "darwin":
        raise SystemExit(
            "ERROR: this script uses macOS `sips`.\n"
            "  On Linux/Windows use rsvg-convert, inkscape or ImageMagick — see the\n"
            "  commands in this file's docstring — and commit the resulting PNGs."
        )
    if not shutil.which("sips"):
        raise SystemExit("ERROR: `sips` not found on PATH.")

    stale = []
    for svg_name, png_name, size in TARGETS:
        svg = ASSETS / svg_name
        png = ASSETS / png_name
        if not svg.exists():
            raise SystemExit(f"ERROR: missing source {svg}")

        before = digest(png)
        with tempfile.TemporaryDirectory() as tmp:
            probe = Path(tmp) / png_name
            render(svg, probe, size)
            after = digest(probe)
            changed = before != after
            if args.check:
                if changed:
                    stale.append(png_name)
                print(f"  {'STALE  ' if changed else 'current'}  {png_name:20s} <- {svg_name}")
                continue
            shutil.move(str(probe), str(png))

        width, height = png_dimensions(png)
        kb = png.stat().st_size / 1024
        print(f"  wrote {png_name:20s} {width}x{height:<5} {kb:7.1f} KB  <- {svg_name}"
              + ("  (changed)" if changed else ""))

    figure_problems = check_share_card_figures()
    for problem in figure_problems:
        print(f"  WARN     {problem}")

    if args.check:
        if stale or figure_problems:
            raise SystemExit(
                (f"\n{len(stale)} PNG(s) are out of date with their SVG: {', '.join(stale)}\n"
                 "  Regenerate:  .venv/bin/python builder/make_icons.py\n" if stale else "\n")
                + ("  Update the figures in share-card.svg, then regenerate.\n" if figure_problems else "")
            )
        print("\nAll PNGs match their SVG sources, and the share card's figures are current.")
    else:
        print(f"\nRasterized {len(TARGETS)} assets from {ASSETS.name}/.")


if __name__ == "__main__":
    main()
