# -*- coding: utf-8 -*-
"""Build one Open Graph card per commerce page.

All 22 pages shared a single generic cover, so sharing any of them on LinkedIn
or X produced the same picture — the part of a shared link people actually look
at said nothing about the page.

Rendered as SVG and rasterised with macOS `sips`, which is the only renderer on
this machine. It handles text (Arabic shaping and RTL included), gradients,
patterns, paths and embedded images — but it ignores SVG filters, so nothing
here relies on one.
"""
import base64, html, importlib.util, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]   # docs/commerce/ -> repo root
HERE = pathlib.Path(__file__).parent
OUT = ROOT / 'assets' / 'images' / 'og'
W, H = 1200, 630

LOGO = base64.b64encode((ROOT / 'assets/images/logo.png').read_bytes()).decode()


def load(name):
    sp = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


def fit(lines, rtl, cap=58, floor=34, pad=1080):
    """Largest size at which the longest line still fits the card's text column."""
    w = 0.455 if rtl else 0.512          # mean glyph width as a fraction of size
    longest = max(len(l) for l in lines)
    return max(floor, min(cap, int(pad / (longest * w))))


def card(kicker, badge, lines, lang):
    rtl = lang == 'ar'
    x = W - 72 if rtl else 72
    anchor = 'end' if rtl else 'start'
    dirattr = ' direction="rtl"' if rtl else ''
    size = fit(lines, rtl)
    lead = int(size * 1.32)
    e = html.escape

    # Anchored from the last line, not the first: the headline then always ends
    # the same distance above the rule, whether it runs to one line or three,
    # and the card never leaves a void under a short title.
    top = (H - 190) - (len(lines) - 1) * lead

    body = ''
    for i, l in enumerate(lines):
        body += (f'<text x="{x}" y="{top + i * lead}" font-family="Helvetica" font-size="{size}" '
                 f'font-weight="bold" fill="#ffffff" text-anchor="{anchor}"{dirattr}>{e(l)}</text>\n')

    bw = int(len(badge) * 10.2) + 48
    bx = W - 72 - bw if rtl else 72
    # The brand mark is teal, which the site gets away with because its nav sits
    # on a light strip. On a dark card it muddies, so it keeps its own chip.
    chip_w, chip_h = 214, 118
    chip_x = 72 if rtl else W - 72 - chip_w

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <radialGradient id="glow" cx="{0.18 if rtl else 0.82}" cy="0.02" r="0.85">
    <stop offset="0" stop-color="#2C74B3" stop-opacity="0.42"/>
    <stop offset="1" stop-color="#2C74B3" stop-opacity="0"/>
  </radialGradient>
  <pattern id="hex" width="56" height="64" patternUnits="userSpaceOnUse">
    <path d="M28 1 54 16v32L28 63 2 48V16z" fill="none" stroke="#ffffff" stroke-opacity="0.055"/>
  </pattern>
</defs>
<rect width="{W}" height="{H}" fill="#081426"/>
<rect width="{W}" height="{H}" fill="url(#hex)"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>

<rect x="{chip_x}" y="56" width="{chip_w}" height="{chip_h}" rx="20" fill="#ffffff"/>
<image x="{chip_x + 22}" y="{56 + 16}" width="{chip_w - 44}" height="{chip_h - 32}" href="data:image/png;base64,{LOGO}"/>

<rect x="{bx}" y="{56 + 36}" width="{bw}" height="46" rx="23" fill="#2C74B3" fill-opacity="0.16" stroke="#5BA3DF" stroke-opacity="0.34"/>
<text x="{bx + bw // 2}" y="{56 + 66}" font-family="Helvetica" font-size="20" fill="#BFE0FF" text-anchor="middle">{e(badge)}</text>

<text x="{x}" y="{top - 58}" font-family="Helvetica" font-size="30" font-weight="bold" fill="#5BA3DF" text-anchor="{anchor}">{e(kicker)}</text>
{body}
<rect x="{W - 72 - 104 if rtl else 72}" y="{H - 106}" width="104" height="5" rx="3" fill="#B7902E"/>
<text x="{x}" y="{H - 52}" font-family="Helvetica" font-size="23" fill="#8FA6C0" text-anchor="{anchor}">nx.sa</text>
</svg>'''


def render(svg, dest):
    """JPEG at 82, not PNG.

    These cards are a flat gradient behind text, which PNG stores at ~525 KB
    each — 11 MB across the set, carried in every image build and fetched by
    every scraper. JPEG at 82 is visually identical here and a fifth the size."""
    tmp = dest.with_suffix('.svg')
    tmp.write_text(svg, encoding='utf-8')
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82',
                    str(tmp), '--out', str(dest)], check=True, capture_output=True)
    tmp.unlink()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    for lang, mod in (('ar', 'data'), ('en', 'data_en')):
        D = load(mod)
        hub = D.HUB
        render(card(hub['kicker'], hub['badge'], hub['h1'], lang), OUT / f'{lang}-commerce.jpg')
        made += 1
        for d in D.PAGES:
            render(card(d['kicker'], d['badge'], d['h1'], lang), OUT / f'{lang}-{d["slug"]}.jpg')
            made += 1
    print(f'rendered {made} cards into {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
