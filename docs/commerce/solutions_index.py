# -*- coding: utf-8 -*-
"""Put the ten commerce solutions on /ar/solutions/, beside the auctions card.

The card markup is the site's own .plat-card, so these sit in the existing grid
rather than introducing a second card style on the same page.
"""
import importlib.util, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
ROOT = pathlib.Path(__file__).resolve().parents[2]   # docs/commerce/ -> repo root

def load(name):
    sp = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

DATA = {'ar': load('data'), 'en': load('data_en')}
spec = importlib.util.spec_from_file_location('build', HERE / 'build.py')
build = importlib.util.module_from_spec(spec); spec.loader.exec_module(build)

ICON = {'marketplace': 'shop', 'pay-for-saas': 'link', 'services': 'bolt',
        'booking': 'cal', 'payouts': 'bank', 'affiliate': 'split',
        'franchise': 'star', 'logistics-pay': 'truck', 'experts': 'users',
        'market-builder': 'box'}

ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
         '<path d="M5 12h14M13 6l6 6-6 6"/></svg>')

MARK_OPEN = '<!-- commerce:start -->'
MARK_CLOSE = '<!-- commerce:end -->'


def cards(lang):
    out = []
    for d in DATA[lang].PAGES:
        href = f"/{lang}/solutions/commerce/{d['slug']}/"
        lede = f"{d['h1'][0]} {d['h1'][1]}"
        go = 'استعرض الحل' if lang == 'ar' else 'Explore the solution'
        out.append(
            f'<a class="plat-card" href="{href}">'
            f'<div class="pc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-linecap="round" stroke-linejoin="round">{build.ICONS[ICON[d["slug"]]]}</svg></div>'
            f'<h3>{d["kicker"]}</h3><p>{lede}</p>'
            f'<span class="pc-go">{go} {ARROW}</span></a>')
    return '\n    '.join(out)


def apply(path, lang):
    p = ROOT / path
    html = p.read_text(encoding='utf-8')
    block = f'{MARK_OPEN}\n    {cards(lang)}\n    {MARK_CLOSE}'
    if MARK_OPEN in html:                      # idempotent: replace what we wrote before
        html = re.sub(re.escape(MARK_OPEN) + r'.*?' + re.escape(MARK_CLOSE), block, html, flags=re.S)
    else:
        # anchor on the existing product card, not on a generic closing tag —
        # this page has two of those and the wrong one would land the cards
        # outside the grid.
        m = re.search(r'<a class="plat-card" href="/(?:ar|en)/solutions/plate-market/".*?</a>', html, re.S)
        assert m, f'{path}: could not find the plate-market card to insert after'
        html = html[:m.end()] + '\n    ' + block + html[m.end():]
    p.write_text(html, encoding='utf-8')
    print('updated', path, '-', html.count('class="plat-card"'), 'cards')


if __name__ == '__main__':
    apply('ar/solutions/index.html', 'ar')
    apply('en/solutions/index.html', 'en')
