# -*- coding: utf-8 -*-
"""Build the NX Commerce Infrastructure pages.

One template, one data file per solution. The site's own <head>, <nav> and
<footer> are lifted from an existing page rather than re-typed, so the chrome
stays identical everywhere and a later change to it does not strand these pages.

Body copy comes from data.py. Anything still unread from the source screenshots
is written there as a PENDING marker, which this script refuses to ship silently:
it counts them and prints the total, so a half-transcribed page can never look
finished.
"""
import pathlib, re, importlib.util

ROOT = pathlib.Path(__file__).resolve().parents[2]   # docs/commerce/ -> repo root
HERE = pathlib.Path(__file__).parent

ICONS = {
    'shop':   '<path d="M3 9l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 21V12h6v9"/>',
    'id':     '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M5 16c.8-1.4 2.2-2 4-2s3.2.6 4 2"/>',
    'split':  '<path d="M3 12h5l3-5 3 10 3-5h4"/>',
    'card':   '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    'bank':   '<path d="M3 10l9-6 9 6"/><path d="M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18"/>',
    'refund': '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.3 2.6L3 8"/><path d="M3 4v4h4"/>',
    'scale':  '<path d="M12 3v18M7 7l-4 7h8zM17 7l-4 7h8z"/>',
    'chart':  '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>',
    'clock':  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'lock':   '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    'link':   '<path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>',
    'star':   '<path d="M12 3l2.4 5.6L20 9.3l-4.2 3.9 1.1 5.8L12 16.9 7.1 19l1.1-5.8L4 9.3l5.6-.7z"/>',
    'box':    '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
    'truck':  '<rect x="1" y="6" width="14" height="10" rx="1"/><path d="M15 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    'users':  '<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/>',
    'cal':    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'bolt':   '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    'check':  '<path d="M20 6L9 17l-5-5"/>',
}

TICK = '<svg viewBox="0 0 24 24">%s</svg>' % ICONS['check']


def with_engine(foot, ver):
    base = '<script src="/assets/js/nx.js?v=%s" defer></script>' % ver
    assert base in foot, 'script anchor not found — the page would ship without its engine'
    return foot.replace(base, base + '\n<script src="/assets/js/nx-commerce.js?v=%s" defer></script>' % ver)


LANG = {
    'ar': dict(home='الرئيسية', solutions='الحلول', other='en',
               explore='استعرض الحل', browse='استعرض الحلول العشرة',
               related='حلول أخرى في نظام البيع الذكي', contact='تواصل معنا', cap='القدرة',
               scales=['عملية واحدة', '100 عملية', '1,000 عملية']),
    'en': dict(home='Home', solutions='Solutions', other='ar',
               explore='Explore the solution', browse='Browse the ten solutions',
               related='More in Commerce Infrastructure', contact='Contact us', cap='Capability',
               scales=['One transaction', '100 transactions', '1,000 transactions']),
}


def jsonld(d, lang, url):
    """Service + BreadcrumbList, matching the shape the services pages already use.

    The breadcrumb is real on these pages, so marking it up lets the trail show
    in the result instead of a bare URL. Nothing here describes content the page
    does not actually carry."""
    import json
    home = f'https://nx.sa/{lang}/'
    crumbs = [(LANG[lang]['home'], home),
              (LANG[lang]['solutions'], f'https://nx.sa/{lang}/solutions/'),
              (D.HUB['crumb'], f'https://nx.sa/{lang}/solutions/commerce/')]
    if d.get('slug'):
        crumbs.append((d['crumb'], url))
    graph = [
        {"@context": "https://schema.org", "@type": "Service",
         "name": d.get('kicker') or D.HUB['kicker'],
         "serviceType": d.get('kicker') or D.HUB['kicker'],
         "provider": {"@type": "Organization", "name": "NX Solutions", "url": home},
         "areaServed": {"@type": "Country", "name": "Saudi Arabia"},
         "description": d['desc'], "url": url},
        {"@context": "https://schema.org", "@type": "BreadcrumbList",
         "itemListElement": [
             {"@type": "ListItem", "position": i, "name": n, "item": u}
             for i, (n, u) in enumerate(crumbs, 1)]},
    ]
    return '\n'.join('<script type="application/ld+json">%s</script>'
                     % json.dumps(g, ensure_ascii=False, separators=(',', ':')) for g in graph)


def related(d, lang):
    """Three sideways links per page.

    Without them every solution is a leaf hanging off the hub: a crawler reaches
    it in three hops and nothing passes between siblings. Taking the next three
    in order gives each page three inbound links and spreads them evenly, rather
    than pointing everything at the same favourite."""
    L = LANG[lang]
    order = [x for x in D.PAGES if x['slug'] != d['slug']]
    i = [x['slug'] for x in D.PAGES].index(d['slug'])
    picks = [D.PAGES[(i + n) % len(D.PAGES)] for n in (1, 2, 3)]
    cards = ''
    for r in picks:
        cards += (f'<a class="cx-rel" href="/{lang}/solutions/commerce/{r["slug"]}/">'
                  f'<span class="cx-rel-k">{r["kicker"]}</span>'
                  f'<span class="cx-rel-t">{r["h1"][0]} {r["h1"][1]}</span></a>')
    return (f'<section class="sec" style="padding-top:0"><div class="wrap">'
            f'<div class="sec-head rv"><h2 style="font-size:clamp(1.3rem,2.6vw,1.7rem)">{L["related"]}</h2></div>'
            f'<div class="cx-rels rv">{cards}</div></div></section>')


def chrome(lang='ar'):
    """The site's own head/nav and footer, taken from a live page."""
    s = (ROOT / lang / 'solutions' / 'index.html').read_text(encoding='utf-8')
    head = s[:s.index('<header class="phero')]
    foot = s[s.index('<footer>'):]
    m = re.search(r'/assets/js/nx\.js\?v=(\d+)', foot)
    assert m, f'{lang}: no nx.js in the borrowed footer — cannot attach the engine'
    return head, foot, m.group(1)


def esc(t):
    """HTML-escape for a <title> or an attribute value.

    Several English titles carry an ampersand ("Driver & Gig Worker"), which is
    tolerated by browsers but is not valid in an attribute and is the kind of
    thing a stricter scraper trips on. Escaped once, at the point of emission,
    so no copy in data.py has to remember."""
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def retarget(head, d, ver, lang='ar'):  # noqa: C901
    """Point the borrowed <head> at this page instead of the solutions index."""
    other = LANG[lang]['other']
    url = (f"https://nx.sa/{lang}/solutions/commerce/{d['slug']}/" if d['slug']
           else f"https://nx.sa/{lang}/solutions/commerce/")
    en = url.replace(f'/{lang}/', f'/{other}/')
    head = re.sub(r'<title>.*?</title>', f"<title>{esc(d['title'])}</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content=".*?">',
                  f'<meta name="description" content="{esc(d["desc"])}">', head, count=1, flags=re.S)
    head = re.sub(r'<link rel="canonical"[^>]*>', f'<link rel="canonical" href="{url}">', head, count=1)
    head = re.sub(rf'<link rel="alternate" hreflang="{other}"[^>]*>', f'<link rel="alternate" hreflang="{other}" href="{en}">', head, count=1)
    head = re.sub(rf'<link rel="alternate" hreflang="{lang}"[^>]*>', f'<link rel="alternate" hreflang="{lang}" href="{url}">', head, count=1)
    en_url = url.replace(f'/{lang}/', '/en/')
    head = re.sub(r'<link rel="alternate" hreflang="x-default"[^>]*>', f'<link rel="alternate" hreflang="x-default" href="{en_url}">', head, count=1)
    head = re.sub(r'<meta property="og:url"[^>]*>', f'<meta property="og:url" content="{url}">', head, count=1)
    for p in ('og:title', 'twitter:title'):
        head = re.sub(rf'<meta (?:property|name)="{p}" content=".*?">', f'<meta property="{p}" content="{esc(d["title"])}">', head, count=1, flags=re.S)
    for p in ('og:description', 'twitter:description'):
        head = re.sub(rf'<meta (?:property|name)="{p}" content=".*?">', f'<meta property="{p}" content="{esc(d["desc"])}">', head, count=1, flags=re.S)
    head = head.replace(f"location.href='/{other}/solutions/'", f"location.href='{en.replace('https://nx.sa','')}'")
    # this family needs its own sheet and engine on top of the site's
    base = '<link rel="stylesheet" href="/assets/css/nx.css?v=%s">' % ver
    assert base in head, 'stylesheet anchor not found — the commerce sheet would be dropped'
    head = head.replace(base, base + '\n<link rel="stylesheet" href="/assets/css/nx-commerce.css?v=%s">' % ver)

    # Each page gets its own share card. They all pointed at one generic cover,
    # so a link to any of the 22 looked identical wherever it was posted.
    card = f'https://nx.sa/assets/images/og/{lang}-{d["slug"] or "commerce"}.jpg'
    assert (ROOT / 'assets' / 'images' / 'og' / f'{lang}-{d["slug"] or "commerce"}.jpg').exists(), \
        f'missing OG card for {lang}/{d["slug"] or "commerce"} — run ogcards.py'
    for tag in ('og:image', 'twitter:image'):
        head = re.sub(rf'<meta (?:property|name)="{tag}" content="[^"]*">',
                      f'<meta property="{tag}" content="{card}">', head, count=1)
    head = head.replace(f'<meta property="og:image" content="{card}">',
                        f'<meta property="og:image" content="{card}">\n'
                        f'<meta property="og:image:width" content="1200">\n'
                        f'<meta property="og:image:height" content="630">\n'
                        f'<meta property="og:image:alt" content="{esc(d["title"].split(" | ")[0])}">', 1)
    # the borrowed head carries the solutions index's own markup; swap in ours
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', head, flags=re.S)
    assert '</head>' in head
    head = head.replace('</head>', jsonld(d, lang, url) + '\n</head>')
    return head


def phone(p):
    rows = ''.join(
        f'<div><span>{k}</span><span>{v}</span></div>' for k, v in p['rows'])
    # the written value is the fallback: a visitor without JS must read 8,450,
    # not 0. The engine resets it to zero itself before counting.
    amount = (f'<span data-count="{p["amountRaw"]}">{p["amountRaw"]:,}</span>' if p.get('amountRaw') else p['amount'])
    return f'''<div class="cx-phone">
            <div class="cx-toast"><i><svg viewBox="0 0 24 24">{ICONS['check']}</svg></i>{p['toast']}</div>
            <div class="cx-phone-top"><span>{p['title']}</span><span class="cx-dot"><svg viewBox="0 0 24 24">{ICONS['users']}</svg></span></div>
            <div class="cx-amount-label">{p['amountLabel']}</div>
            <div class="cx-amount">{amount}<span class="cx-cur">{p['cur']}</span></div>
            <div class="cx-rows">{rows}</div>
            <div class="cx-phone-btn">{p['btn']}</div>
          </div>'''


def stops(items):
    """The project journey, as a sequence rather than five boxes.

    What this replaces put each stage in a dark card and dropped the row onto a
    light section — five black rectangles on white, reading as a different page
    that had been pasted in. The stages are now type on the section's own
    ground, strung on one rail that fills as the reader scrolls, which is what
    a journey looks like: a line you are part of the way along."""
    out = ''
    for n, s in enumerate(items, 1):
        out += f'''<li class="cx-stop" style="--i:{n - 1}">
            <span class="cx-stop-node"><svg viewBox="0 0 24 24">{ICONS[s['icon']]}</svg></span>
            <span class="cx-stop-head"><em class="cx-stop-n">{n:02d}</em>{s['when']}</span>
            <b class="cx-stop-big">{s['big']}</b>
            <span class="cx-stop-tag">{s['tag']}</span>
            <p class="cx-stop-txt">{s['cap']}</p>
          </li>'''
    return out


def shares(items):
    out = ''
    for s in items:
        # data-base is what one transaction pays this party; the scale buttons
        # multiply it. The percentages are the page's own, so nothing here
        # claims anything the static version did not already claim.
        out += f'''<div class="cx-share" data-who="{s['who']}" data-pct="{s['pct']}" data-base="{s['value']}">
              <div class="cx-share-hd"><span>{s['label']}</span><b><span data-count="{s['value']}">{s['value']:,}</span><em>{s['cur']}</em></b></div>
              <div class="cx-bar"><i><u></u></i></div>
            </div>'''
    return out


def scales(d, lang):
    L = LANG[lang]
    out = ''
    for i, (label, mult) in enumerate(zip(L['scales'], (1, 100, 1000))):
        on = ' aria-pressed="true"' if i == 0 else ' aria-pressed="false"'
        out += f'<button type="button" class="cx-scale" data-mult="{mult}"{on}>{label}</button>'
    return f'<div class="cx-scales" role="group">{out}</div>'


def caps(ids, items=None):
    # the source shows eight cards per solution, all drawn from one catalogue
    out = ''
    for i, (title, icon, body) in enumerate(items if items is not None else [D.CAPS[cid] for cid in ids]):
        out += f'''<div class="cx-cap" style="--i:{i}">
            <div class="cx-ic"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></div>
            <h3>{title}</h3><p>{body}</p>
          </div>'''
    return out


def platform(d, lang):
    """The platform capability block: three groups, grouped rather than listed.

    Twenty-one capabilities as one flat grid would read as a wall and nothing
    would stand out; grouped by what the reader is actually deciding about —
    the storefront, the money, the running of it — each group stays scannable.
    Light ground on purpose: the page already alternates enough dark bands."""
    pf = d.get('platform')
    if not pf:
        return ''
    groups = ''
    for g in pf['groups']:
        rows = ''
        for it in g['items']:
            # a capability may carry the industry term it is known by, which is
            # what a technical buyer scans for and often what they search
            title, term, body = (it if len(it) == 3 else (it[0], None, it[1]))
            tag = f'<em class="cx-pf-term">{term}</em>' if term else ''
            rows += f'<div class="cx-pf-item"><h4>{title}{tag}</h4><p>{body}</p></div>'
        groups += (f'<section class="cx-pf-group">'
                   f'<h3><span class="cx-pf-ic"><svg viewBox="0 0 24 24">{ICONS[g["icon"]]}</svg></span>{g["name"]}</h3>'
                   f'<div class="cx-pf-items rv-stagger">{rows}</div></section>')
    return f"""<section class="sec cx-pf" id="platform">
  <div class="wrap">
    <div class="sec-head rv"><span class="eyebrow">{pf['eyebrow']}</span>
      <h2>{pf['title']}</h2>
      <p class="cx-pf-sub">{pf['sub']}</p></div>
    <div class="cx-pf-groups rv">{groups}</div>
  </div>
</section>
"""


def herolive(d, lang):
    """The hero visual: one order being processed, rather than a diagram of the
    parts that would process it.

    The ring this replaces placed eight capability names around a core. It was
    a picture of the feature list — nothing travelled through it, so it argued
    that the product has parts, not that it does work. This runs a transaction
    instead: the seller is verified, the amount is held, the commission is
    worked out, and the money divides, each step landing in turn with the time
    it took beside it.

    The amounts are written here; the percentages are read off the money board
    further down this same page, so the split in the hero can never contradict
    the split the page spends a section explaining."""
    h = d.get('hero')
    if not h:
        return ''
    shares = d['money']['shares']
    cur = d['money']['cur']
    first = h['orders'][0]

    steps = ''
    for i, (title, term, icon, secs) in enumerate(h['steps']):
        steps += (f'<li class="cx-hp-step" data-i="{i}">'
                  f'<span class="cx-hp-mark"><svg class="cx-hp-ic" viewBox="0 0 24 24">{ICONS[icon]}</svg>'
                  f'<svg class="cx-hp-tick" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>'
                  f'<span class="cx-hp-tx"><b>{title}</b><em>{term}</em></span>'
                  f'<span class="cx-hp-ms">{secs}<i>{h["unit"]}</i></span></li>')

    rows = ''
    for s in shares:
        amount = first[2] * s['pct'] / 100
        rows += (f'<li class="cx-hp-row cx-{s["who"]}" data-pct="{s["pct"]}">'
                 f'<span class="cx-hp-who">{s["label"]}</span>'
                 f'<span class="cx-hp-bar"><i></i></span>'
                 f'<span class="cx-hp-amt" data-money="{amount:.2f}">{amount:,.2f}</span></li>')

    chips = ''
    for i, (title, body, icon) in enumerate(h['feed']):
        chips += (f'<li class="cx-hp-chip" data-i="{i}">'
                  f'<span class="cx-hp-chip-ic"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></span>'
                  f'<span class="cx-hp-chip-tx"><b>{title}</b><em>{body}</em></span></li>')

    # every order the loop will show, as data rather than as script literals
    pool = '|'.join(f'{o[0]};{o[1]};{o[2]:.2f}' for o in h['orders'])

    return f'''<div class="cx-hp" role="img" aria-label="{h['a11y']}" data-orders="{pool}"
     data-cur="{cur}" data-pcts="{','.join(str(s['pct']) for s in shares)}">
  <div class="cx-hp-panel">
    <div class="cx-hp-top">
      <span class="cx-hp-title">{h['live']}</span>
      <span class="cx-hp-live"><i></i>{h['tag']}</span>
    </div>
    <div class="cx-hp-order">
      <span class="cx-hp-oid">{first[0]}</span>
      <span class="cx-hp-seller">{first[1]}</span>
      <span class="cx-hp-total"><b data-money="{first[2]:.2f}">{first[2]:,.2f}</b><em>{cur}</em></span>
    </div>
    <ol class="cx-hp-steps">{steps}</ol>
    <div class="cx-hp-result">
      <div class="cx-hp-rhead">
        <span class="cx-hp-rlabel">{h['result']}</span>
        <span class="cx-hp-done"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>{h['done']}</span>
      </div>
      <ul class="cx-hp-rows">{rows}</ul>
    </div>
  </div>
  <ul class="cx-hp-chips">{chips}</ul>
</div>'''


def video(d, lang):
    """The explainer, as a poster that becomes a player on request.

    Nothing is downloaded until someone asks for it — the two encodes are 12 MB
    and 10 MB, and most visitors will never press play. The source is chosen at
    that moment by viewport, so a phone gets the vertical cut and a desktop the
    wide one, and neither ever fetches the other."""
    v = d.get('video')
    if not v:
        return ''
    return f"""<section class="sec cx-vid" id="video">
  <div class="wrap">
    <div class="sec-head rv"><span class="eyebrow">{v['eyebrow']}</span>
      <h2>{v['title']}</h2><p class="cx-pf-sub">{v['sub']}</p></div>
    <figure class="cx-vid-frame rv">
      <button type="button" class="cx-vid-play"
              data-wide="/assets/video/nx-marketplace-16x9.mp4"
              data-tall="/assets/video/nx-marketplace-9x16.mp4"
              aria-label="{v['cta']}">
        <img class="cx-vid-poster" src="/assets/images/video/marketplace-poster-16x9.jpg"
             alt="{v['a11y']}" width="1600" height="900" loading="lazy" decoding="async">
        <span class="cx-vid-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
        <span class="cx-vid-label">{v['cta']}<em>{v['dur']}</em></span>
      </button>
    </figure>
  </div>
</section>
"""


def _cs_kpis(kpis, keys=()):
    """The four tiles above every view. Numbers carry data-count so the panel
    can run them up when it opens; the written value is also the final value,
    so a visitor without JS reads the same figures, just already arrived."""
    out = ''
    for i, (label, val, unit, delta, dir_) in enumerate(kpis):
        num = val.replace(',', '')
        cnt = f' data-count="{num}"' if num.replace('.', '', 1).isdigit() else ''
        # a tile the arriving orders have to keep in step with names itself,
        # rather than being found by its position in the row
        k = f' data-kpi="{keys[i]}"' if i < len(keys) else ''
        out += (f'<div class="cx-cs-kpi"{k}><span class="cx-cs-kl">{label}</span>'
                f'<span class="cx-cs-kv"><b{cnt}>{val}</b>'
                f'{f"<em>{unit}</em>" if unit else ""}</span>'
                f'<span class="cx-cs-kd{" up" if dir_ == "up" else ""}">{delta}</span></div>')
    return f'<div class="cx-cs-kpis">{out}</div>'


def _cs_head(cols):
    return '<thead><tr>' + ''.join(f'<th scope="col">{c}</th>' for c in cols) + '</tr></thead>'


def _cs_order_row(r, cur, extra=''):
    oid, seller, st, stl, amt, when = r
    return (f'<tr{extra}><td class="cx-cs-id"><span class="cx-ltr">{oid}</span></td><td class="cx-cs-who2">{seller}</td>'
            f'<td><span class="cx-cs-st cx-cs-st-{st}">{stl}</span></td>'
            f'<td class="cx-cs-amt">{amt}<em>{cur}</em></td>'
            f'<td class="cx-cs-time">{when}</td></tr>')


def _cs_orders(t, cur, label, rate):
    rows = ''.join(_cs_order_row(r, cur) for r in t['rows'])
    live = ''.join(_cs_order_row(r, cur) for r in t.get('live', []))
    s = t.get('strip')
    strip = ''
    if s:
        steps = ''.join(f'<li class="{"done" if i == 0 else ""}"><b>{a}</b><span>{b}</span><em>{c}</em></li>'
                        for i, (a, b, c) in enumerate(s['steps']))
        strip = (f'<div class="cx-cs-strip"><div class="cx-cs-strip-hd"><b>{s["title"]}</b>'
                 f'<em>{s["term"]}</em></div><p>{s["body"]}</p>'
                 f'<ol class="cx-cs-steps2">{steps}</ol></div>')
    return (f'{_cs_kpis(t["kpis"], ("count", "sales", "fee"))}'
            f'<div class="cx-cs-tblwrap"><table class="cx-cs-tbl" data-rate="{rate}">'
            f'<caption class="cx-sr">{label}</caption>'
            f'{_cs_head(t["head"])}<tbody>{rows}</tbody></table></div>'
            f'<template class="cx-cs-live"><table><tbody>{live}</tbody></table></template>'
            f'{strip}')


def _cs_sellers(t, label):
    n = len(t['steps'])
    rows = ''
    for i, (name, reg, done, state, status) in enumerate(t['rows']):
        pips = ''.join(f'<i class="{"on" if k < done else ""}"></i>' for k in range(n))
        rows += (f'<tr data-row="{i}"><td class="cx-cs-who2">{name}</td><td class="cx-cs-id"><span class="cx-ltr">{reg}</span></td>'
                 f'<td><span class="cx-cs-pips" data-done="{done}" data-n="{n}">{pips}</span>'
                 f'<em class="cx-cs-pipn">{done}/{n}</em></td>'
                 f'<td><span class="cx-cs-st cx-cs-st-{state}">{status}</span></td></tr>')
    legend = ''.join(f'<li>{s}</li>' for s in t['steps'])
    adv = t.get('advance', '')
    advs, advl = t.get('advanceTo', ('', ''))
    toast = ''
    if t.get('toast'):
        toast = (f'<div class="cx-cs-toast" role="status"><b>{t["toast"][0]}</b>'
                 f'<em>{t["toast"][1]}</em></div>')
    return (f'{_cs_kpis(t["kpis"])}'
            f'<ol class="cx-cs-legend2">{legend}</ol>'
            f'<div class="cx-cs-tblwrap"><table class="cx-cs-tbl" data-advance="{adv}" '
            f'data-advance-state="{advs}" data-advance-label="{advl}">'
            f'<caption class="cx-sr">{label}</caption>'
            f'{_cs_head(t["head"])}<tbody>{rows}</tbody></table></div>{toast}')


def _cs_payouts(t, cur, label):
    bars = ''.join(f'<i class="cx-cs-seg cx-{w}" style="--w:{pct}%"></i>'
                   for _, pct, _, w in t['split'])
    legend = ''.join(f'<li><span class="cx-cs-key cx-{w}"></span>{name}'
                     f'<b>{val}<em>{cur}</em></b><span class="cx-cs-pct">{pct}%</span></li>'
                     for name, pct, val, w in t['split'])
    rows = ''
    for name, orders, owed, acct, state, status in t['rows']:
        rows += (f'<tr><td class="cx-cs-who2">{name}</td><td>{orders}</td>'
                 f'<td class="cx-cs-amt">{owed}<em>{cur}</em></td>'
                 f'<td class="cx-cs-id"><span class="cx-ltr">{acct}</span></td>'
                 f'<td><span class="cx-cs-st cx-cs-st-{state}">{status}</span></td></tr>')
    return (f'{_cs_kpis(t["kpis"])}'
            f'<div class="cx-cs-split"><span class="cx-cs-split-hd">{t["splitLabel"]}</span>'
            f'<div class="cx-cs-stack">{bars}</div><ul class="cx-cs-legend3">{legend}</ul></div>'
            f'<div class="cx-cs-tblwrap"><table class="cx-cs-tbl"><caption class="cx-sr">{label}</caption>'
            f'{_cs_head(t["head"])}<tbody>{rows}</tbody></table></div>'
            f'<p class="cx-cs-foot">{t["foot"]}</p>')


def _cs_rules(t, slug):
    """Commission rules, as radio rows rather than a fake table of buttons.

    One rule applies to an order at a time, which is exactly what a radio group
    means — so the arrow keys, the grouping and the announcement all come for
    free instead of being re-implemented in script."""
    c = t['calc']
    amount = float(c['amount'].replace(',', ''))
    head = ''.join(f'<span>{h}</span>' for h in t['head'])
    rows = ''
    for i, r in enumerate(t['rules']):
        rows += (f'<label class="cx-cs-rule"><input type="radio" name="cx-rule-{slug}" '
                 f'data-pct="{r["pct"]}" data-fee="{r["fee"]}"{" checked" if i == 0 else ""}>'
                 f'<span class="cx-cs-rs"><b>{r["scope"]}</b>'
                 f'<em class="cx-cs-badge">{r["badge"]}</em></span>'
                 f'<span class="cx-cs-rk">{r["kind"]}</span>'
                 f'<span class="cx-cs-rv">{r["val"]}</span>'
                 f'<span class="cx-cs-rp">{r["pri"]}</span></label>')
    first = t['rules'][0]
    fee = amount * first['pct'] / 100 + first['fee']
    money = lambda v: f'{v:,.2f}'
    lines = (f'<div><span>{c["lines"][0]}</span><b>{money(amount)}<em>{c["cur"]}</em></b></div>'
             f'<div><span>{c["lines"][1]}</span>'
             f'<b class="cx-cs-gold" data-calc="fee">{money(fee)}<em>{c["cur"]}</em></b></div>'
             f'<div><span>{c["lines"][2]}</span>'
             f'<b data-calc="net">{money(amount - fee)}<em>{c["cur"]}</em></b></div>')
    return (f'<p class="cx-cs-hint">{t["hint"]}</p>'
            f'<div class="cx-cs-rulewrap" data-amount="{amount}">'
            f'<div class="cx-cs-rules"><div class="cx-cs-rule-hd">{head}</div>{rows}'
            f'<p class="cx-cs-pick">{c["pick"]}</p></div>'
            f'<aside class="cx-cs-calc"><span class="cx-cs-calc-hd">{c["label"]}</span>'
            f'<div class="cx-cs-calc-rows">{lines}</div>'
            f'<div class="cx-cs-calc-bar" aria-hidden="true">'
            f'<i class="cx-platform" style="width:{first["pct"]:.4g}%"></i>'
            f'<i class="cx-seller" style="width:{100 - first["pct"]:.4g}%"></i></div>'
            f'<p class="cx-cs-calc-note">{c["note"]}</p></aside></div>')


def console(d, lang):
    """The operations console: four real screens instead of a picture of one.

    The brief asked for platform shots that look like the product and move. A
    screenshot would go stale the first time a label changed and would not be
    readable, selectable or translatable; this is the interface itself, built
    from the same tokens as the page, with sample data that adds up.

    Only the active panel is in the accessible tree, the sidebar is decorative
    chrome and marked as such, and the tabs are a real tablist — so the thing
    that looks like an app also behaves like one for a keyboard."""
    c = d.get('console')
    if not c:
        return ''
    cur = d['money']['cur']
    slug = d['slug']
    # the live tiles move by the same commission the money board above argues
    rate = next((s['pct'] for s in d['money']['shares'] if s['who'] == 'platform'), 0)

    nav = ''
    for i, (label, icon, badge) in enumerate(c['nav']):
        nav += (f'<li class="{"on" if i == 1 else ""}">'
                f'<svg viewBox="0 0 24 24">{ICONS[icon]}</svg><span>{label}</span>'
                f'{f"<em>{badge}</em>" if badge else ""}</li>')

    tabs, panels = '', ''
    for i, t in enumerate(c['tabs']):
        k, sel = t['key'], 'true' if i == 0 else 'false'
        tabs += (f'<button type="button" role="tab" class="cx-cs-tab" id="cs-{slug}-t-{k}" '
                 f'aria-controls="cs-{slug}-p-{k}" aria-selected="{sel}" '
                 f'tabindex="{0 if i == 0 else -1}">{t["label"]}'
                 f'<em>{t["term"]}</em></button>')
        if k == 'orders':
            inner = _cs_orders(t, cur, t['label'], rate)
        elif k == 'sellers':
            inner = _cs_sellers(t, t['label'])
        elif k == 'payouts':
            inner = _cs_payouts(t, cur, t['label'])
        else:
            inner = _cs_rules(t, slug)
        panels += (f'<div role="tabpanel" class="cx-cs-panel" id="cs-{slug}-p-{k}" data-k="{k}" '
                   f'aria-labelledby="cs-{slug}-t-{k}"{"" if i == 0 else " hidden"}>{inner}</div>')

    initial = c['user'].strip()[0]
    return f"""<section class="sec cx-cs" id="console">
  <div class="wrap">
    <div class="sec-head rv"><span class="eyebrow">{c['eyebrow']}</span>
      <h2>{c['title']}</h2><p class="cx-pf-sub">{c['sub']}</p></div>
    <div class="cx-cs-win rv" role="group" aria-label="{c['a11y']}">
      <div class="cx-cs-chrome" aria-hidden="true">
        <span class="cx-cs-dots"><i></i><i></i><i></i></span>
        <span class="cx-cs-host"><svg viewBox="0 0 24 24">{ICONS['lock']}</svg>{c['host']}</span>
        <span class="cx-cs-who"><span class="cx-cs-wt"><b>{c['user']}</b><em>{c['role']}</em></span>
          <span class="cx-cs-av">{initial}</span></span>
      </div>
      <div class="cx-cs-body">
        <nav class="cx-cs-side" aria-hidden="true">
          <span class="cx-cs-brand">{c['brand']}</span>
          <ul>{nav}</ul>
        </nav>
        <div class="cx-cs-main">
          <div class="cx-cs-tabs" role="tablist" aria-label="{c['title']}">{tabs}</div>
          <div class="cx-cs-panels">{panels}</div>
        </div>
      </div>
    </div>
    <p class="cx-cs-note rv">{c['note']}</p>
  </div>
</section>
"""


def page(d, _ver, lang='ar'):
    L = LANG[lang]
    head, foot, ver = chrome(lang)
    head = retarget(head, d, ver, lang)
    crumb = (f'<a href="/{lang}/">{L["home"]}</a> / <a href="/{lang}/solutions/">{L["solutions"]}</a> / '
             f'<a href="/{lang}/solutions/commerce/">{D.HUB["crumb"]}</a> / {d["crumb"]}')
    return f'''{head}<main id="main" class="cx">

<header class="phero cx-anim cx-hero-lit" style="padding-bottom:clamp(48px,6vw,80px)">
  <div class="wrap">
    <div class="crumb rv in">{crumb}</div>
    <div class="cx-hero-grid" style="margin-top:clamp(20px,3vw,34px)">
      <div class="rv in">
        <span class="cx-eyebrow">{d['badge']}</span>
        <span class="cx-kicker">{d['kicker']}</span>
        <h1>{d['h1'][0]}<b>{d['h1'][1]}</b></h1>
        <p class="cx-lede">{d['lede']}</p>
        <div class="cx-cta">
          <a href="/{lang}/contact/" class="btn btn-primary">{d['cta1']}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <a href="#story" class="btn btn-ghost">{d['cta2']}</a>
        </div>
        <p class="cx-fineprint">{d['fineprint']}</p>
      </div>
      <div class="rv in">{herolive(d, lang) or phone(d['phone'])}</div>
    </div>
  </div>
</header>

<section class="sec cx-anim" id="story">
  <div class="wrap">
    <div class="cx-story-head rv">
      <span class="eyebrow">{d['story']['eyebrow']}</span>
      <h2>{d['story']['title']}</h2>
      <p>{d['story']['sub']}</p>
    </div>
    <ol class="cx-rail">{stops(d['story']['stops'])}</ol>
  </div>
</section>

<section class="sec cx-dark cx-anim">
  <div class="cx-mesh"></div>
  <div class="wrap">
    <div class="cx-money">
      <div class="cx-board" data-total="{d['money']['total']}">
        {scales(d, lang)}
        <div class="cx-board-top">
          <span class="cx-t">{d['money']['totalLabel']}</span>
          <span class="cx-v"><span data-count="{d['money']['total']}">{d['money']['total']:,}</span><em>{d['money']['cur']}</em></span>
        </div>
        {shares(d['money']['shares'])}
      </div>
      <div>
        <span class="cx-eyebrow">{d['money']['eyebrow']}</span>
        <h2 style="margin:1.1rem 0 0;font-size:clamp(1.5rem,3vw,2.1rem)">{d['money']['title']}</h2>
        <p class="cx-lede">{d['money']['sub']}</p>
      </div>
    </div>
  </div>
</section>

<section class="sec cx-anim">
  <div class="wrap">
    <div class="sec-head rv"><span class="eyebrow">{d['caps']['eyebrow']}</span><h2>{d['caps']['title']}</h2></div>
    <div class="cx-caps" data-n="{len(d['caps'].get('items', d['caps'].get('ids', [])))}">{caps(d['caps'].get('ids', []), d['caps'].get('items'))}</div>
  </div>
</section>

{video(d, lang)}
{console(d, lang)}{platform(d, lang)}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head rv"><h2 style="font-size:clamp(1.4rem,2.8vw,1.9rem)">{d['audience']['title']}</h2></div>
    <div class="cx-chips rv-stagger">{''.join(f'<span class="cx-chip">{c}</span>' for c in d['audience']['chips'])}</div>

    <div class="sec-head rv" style="margin-top:clamp(36px,5vw,56px)"><h2 style="font-size:clamp(1.4rem,2.8vw,1.9rem)">{d['earn']['title']}</h2></div>
    <div class="cx-earn rv-stagger">{''.join(f'<div>{TICK}<span>{i}</span></div>' for i in d['earn']['items'])}</div>
    {f'<p class="cx-startnote rv">{d["earn"]["note"]}</p>' if d['earn'].get('note') else ''}
  </div>
</section>

{related(d, lang)}

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="cx-close rv">
      <div><h2>{d['close']['h2']}</h2><p>{d['close']['p']}</p></div>
      <div class="cx-close-act">
        <a class="cx-close-cta" href="/{lang}/contact/">{d['close'].get('cta', L['contact'])}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
  </div>
</section>

</main>

{with_engine(foot, ver)}'''


def hub(_ver, lang='ar'):
    """The family page at /<lang>/solutions/commerce/ — the link every spoke's
    breadcrumb points at. Its cards and capability catalogue are the same copy
    the ten solution pages carry, so nothing here is invented; the source's own
    overview was supplied as a partial 379px crop whose body text could not be
    read, and the sections that depend on it are left out rather than guessed."""
    L = LANG[lang]
    head, foot, ver = chrome(lang)
    head = retarget(head, dict(slug='', title=D.HUB['title'], desc=D.HUB['desc']), ver, lang)
    cards = ''
    for d in D.PAGES:
        cards += f'''<a class="cx-tile" href="/{lang}/solutions/commerce/{d['slug']}/">
            <span class="cx-tile-k">{d['kicker']}</span>
            <h3>{d['h1'][0]} {d['h1'][1]}</h3>
            <span class="cx-tile-go">{L['explore']} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
          </a>'''
    cat = ''
    for n, cid in enumerate(D.HUB['catalogue'], 1):
        title, icon, body = D.CAPS[cid]
        cat += f'''<div class="cx-cap">
            <div class="cx-ic"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></div>
            <span class="cx-cap-n">{L['cap']} {n:02d}</span>
            <h3>{title}</h3><p>{body}</p>
          </div>'''
    return f'''{head}<main id="main" class="cx">

<header class="phero cx-hero-lit" style="padding-bottom:clamp(48px,6vw,80px)">
  <div class="wrap">
    <div class="crumb rv in"><a href="/{lang}/">{L['home']}</a> / <a href="/{lang}/solutions/">{L['solutions']}</a> / {D.HUB['crumb']}</div>
    <div class="rv in" style="margin-top:clamp(20px,3vw,34px);max-width:52rem">
      <span class="cx-eyebrow">{D.HUB['badge']}</span>
      <span class="cx-kicker">{D.HUB['kicker']}</span>
      <h1>{D.HUB['h1'][0]}<b>{D.HUB['h1'][1]}</b></h1>
      <p class="cx-lede" style="max-width:56ch">{D.HUB['lede']}</p>
      <div class="cx-cta">
        <a href="/{lang}/contact/" class="btn btn-primary">{D.HUB['cta1']}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a href="#solutions" class="btn btn-ghost">{L['browse']}</a>
      </div>
      <p class="cx-fineprint">{D.FINE}</p>
    </div>
  </div>
</header>

<section class="sec" id="solutions">
  <div class="wrap">
    <div class="sec-head rv"><span class="eyebrow">{D.HUB['solutionsEyebrow']}</span><h2>{D.HUB['solutionsTitle']}</h2></div>
    <div class="cx-tiles rv">{cards}</div>
  </div>
</section>

<section class="sec cx-dark" style="padding-top:clamp(48px,6vw,72px)">
  <div class="cx-mesh"></div>
  <div class="wrap">
    <div class="sec-head rv" style="text-align:center"><span class="cx-eyebrow">{D.HUB['stackEyebrow']}</span>
      <h2 style="color:#fff;margin-top:1rem">{D.HUB['stackTitle']}</h2>
      <p style="color:var(--cx-dim);max-width:60ch;margin:.8rem auto 0">{D.HUB['stackSub']}</p></div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="cx-caps cx-cat rv">{cat}</div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="cx-close rv">
      <div><h2>{D.HUB['close']['h2']}</h2><p>{D.HUB['close']['p']}</p></div>
      <div class="cx-close-act">
        <a class="cx-close-cta" href="/{lang}/contact/">{L['contact']}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
  </div>
</section>

</main>

{with_engine(foot, ver)}'''


def build(ver, lang='ar'):
    global D
    mod = 'data.py' if lang == 'ar' else 'data_%s.py' % lang
    spec = importlib.util.spec_from_file_location('d_' + lang, HERE / mod)
    D = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(D)
    pending = 0
    for d in D.PAGES:
        out = ROOT / lang / 'solutions' / 'commerce' / (d['slug'] or '') / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        html = page(d, ver, lang)
        pending += html.count('⟦')
        out.write_text(html, encoding='utf-8')
        print('written', out.relative_to(ROOT))
    out = ROOT / lang / 'solutions' / 'commerce' / 'index.html'
    html = hub(ver, lang)
    pending += html.count('⟦')
    out.write_text(html, encoding='utf-8')
    print('written', out.relative_to(ROOT))
    print(f'\nPENDING copy markers still in the output: {pending}')
    if pending:
        print('→ these are the paragraphs unreadable in the screenshots. Do not publish until replaced.')


if __name__ == '__main__':
    import sys
    ver = sys.argv[1] if len(sys.argv) > 1 else '118'
    for lang in (sys.argv[2:] or ['ar']):
        build(ver, lang)
