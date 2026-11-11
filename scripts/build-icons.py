#!/usr/bin/env python3
"""Build reproducible, single-color product icons from the checked-in SVG outlines."""
import argparse
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parent.parent
ICONS = [("codex", 0xE001, "codex-dark.svg"), ("claude", 0xE002, "claude.svg")]
UNITS = 1024


def build_font():
    glyphs = {".notdef": TTGlyphPen(None).glyph()}
    for name, _, source in ICONS:
        svg = ElementTree.parse(ROOT / "resources" / source).getroot()
        x, y, width, height = map(float, svg.attrib["viewBox"].split())
        # A one-pixel inset at the normal 16px toolbar size, with the same visual
        # baseline and proportions for both logos. Color is supplied by VS Code.
        scale = (UNITS - 128) / max(width, height)
        offset_x = (UNITS - width * scale) / 2 - x * scale
        offset_y = (UNITS + height * scale) / 2 + y * scale - 128
        pen = TTGlyphPen(None)
        curves = Cu2QuPen(pen, max_err=0.5, reverse_direction=True)
        transform = TransformPen(curves, (scale, 0, 0, -scale, offset_x, offset_y))
        for path in svg.iter("{http://www.w3.org/2000/svg}path"):
            parse_path(path.attrib["d"], transform)
        glyphs[name] = pen.glyph()

    builder = FontBuilder(UNITS, isTTF=True)
    builder.setupGlyphOrder(list(glyphs))
    builder.setupCharacterMap({codepoint: name for name, codepoint, _ in ICONS})
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics({name: (UNITS, getattr(glyph, "xMin", 0)) for name, glyph in glyphs.items()})
    builder.setupHorizontalHeader(ascent=896, descent=-128)
    builder.setupNameTable({
        "familyName": "AI Tab Toolbar", "styleName": "Regular",
        "uniqueFontIdentifier": "AI Tab Toolbar Regular 1.0",
        "fullName": "AI Tab Toolbar Regular", "psName": "AITabToolbar-Regular",
        "version": "Version 1.000",
        "copyright": "Logo outlines Copyright (c) 2023 LobeHub (MIT). Font assembly Copyright (c) 2026 Njegos Vukadin.",
        "licenseDescription": "Derived from MIT-licensed Lobe Icons. See THIRD_PARTY_NOTICES.md and licenses/lobehub-icons-LICENSE."
    })
    builder.setupOS2(sTypoAscender=896, sTypoDescender=-128, usWinAscent=896, usWinDescent=128)
    builder.setupPost()
    builder.setupMaxp()
    builder.font["head"].created = 3786912000
    builder.font["head"].modified = 3786912000
    builder.font.recalcTimestamp = False
    builder.font.flavor = "woff"
    output = BytesIO()
    builder.font.save(output)
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify the committed font without rewriting it")
    args = parser.parse_args()
    destination = ROOT / "resources" / "ai-tab-toolbar.woff"
    data = build_font()
    if args.check:
        if not destination.exists() or destination.read_bytes() != data:
            raise SystemExit("Product icon font is missing or out of date; run npm run build:icons")
        print("Product icon font is reproducible and up to date")
    else:
        destination.write_bytes(data)
        print(f"Built {destination.name}: {len(data)} bytes, {len(ICONS)} glyphs")


if __name__ == "__main__":
    main()
