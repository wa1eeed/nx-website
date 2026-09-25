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
               related='حلول أخرى في نظام البيع الذكي', contact='تواصل معنا',
               scales=['عملية واحدة', '100 عملية', '1,000 عملية']),
    'en': dict(home='Home', solutions='Solutions', other='ar',
               explore='Explore the solution', browse='Browse the ten solutions',
               related='More in Commerce Infrastructure', contact='Contact us',
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
    out = ''
    for n, s in enumerate(items, 1):
        out += f'''<div class="cx-stop">
            <div class="cx-when"><i>{n}</i>{s['when']}</div>
            <div class="cx-box">
              <div class="cx-bulb"><svg viewBox="0 0 24 24">{ICONS[s['icon']]}</svg></div>
              <div class="cx-tag">{s['tag']}</div>
              <div class="cx-big">{s['big']}</div>
            </div>
            <div class="cx-txt">{s['cap']}</div>
          </div>'''
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


def caps(ids):
    # the source shows eight cards per solution, all drawn from one catalogue
    out = ''
    for cid in ids:
        title, icon, body = D.CAPS[cid]
        out += f'''<div class="cx-cap">
            <div class="cx-ic"><svg viewBox="0 0 24 24">{ICONS[icon]}</svg></div>
            <h3>{title}</h3><p>{body}</p>
          </div>'''
    return out


def page(d, _ver, lang='ar'):
    L = LANG[lang]
    head, foot, ver = chrome(lang)
    head = retarget(head, d, ver, lang)
    crumb = (f'<a href="/{lang}/">{L["home"]}</a> / <a href="/{lang}/solutions/">{L["solutions"]}</a> / '
             f'<a href="/{lang}/solutions/commerce/">{D.HUB["crumb"]}</a> / {d["crumb"]}')
    return f'''{head}<main id="main" class="cx">

<header class="phero cx-dark cx-anim" style="padding-bottom:clamp(48px,6vw,80px)">
  <div class="cx-mesh"></div>
  <div class="wrap">
    <div class="crumb rv in" style="color:#8FA6C0">{crumb}</div>
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
      <div class="rv in">{phone(d['phone'])}</div>
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
    <div class="cx-rail">{stops(d['story']['stops'])}</div>
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
    <div class="cx-caps" data-n="{len(d['caps']['ids'])}">{caps(d['caps']['ids'])}</div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head rv"><h2 style="font-size:clamp(1.4rem,2.8vw,1.9rem)">{d['audience']['title']}</h2></div>
    <div class="cx-chips rv">{''.join(f'<span class="cx-chip">{c}</span>' for c in d['audience']['chips'])}</div>

    <div class="sec-head rv" style="margin-top:clamp(36px,5vw,56px)"><h2 style="font-size:clamp(1.4rem,2.8vw,1.9rem)">{d['earn']['title']}</h2></div>
    <div class="cx-earn rv">{''.join(f'<div>{TICK}<span>{i}</span></div>' for i in d['earn']['items'])}</div>
    {f'<p class="cx-startnote rv">{d["earn"]["note"]}</p>' if d['earn'].get('note') else ''}
  </div>
</section>

{related(d, lang)}

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="cx-close rv">
      <div><h2>{d['close']['h2']}</h2><p>{d['close']['p']}</p></div>
      <div class="cx-close-act">
        <a class="cx-close-cta" href="/{lang}/contact/">{L['contact']}
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
            <span class="cx-cap-n">القدرة {n:02d}</span>
            <h3>{title}</h3><p>{body}</p>
          </div>'''
    return f'''{head}<main id="main" class="cx">

<header class="phero cx-dark" style="padding-bottom:clamp(48px,6vw,80px)">
  <div class="cx-mesh"></div>
  <div class="wrap">
    <div class="crumb rv in" style="color:#8FA6C0"><a href="/{lang}/">{L['home']}</a> / <a href="/{lang}/solutions/">{L['solutions']}</a> / {D.HUB['crumb']}</div>
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
