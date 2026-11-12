#!/usr/bin/env python3
"""Write section files for home, /nav and /footer from work/content.json (dumped from the capture)."""
import html as H, json, pathlib, re

base = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((base / 'work/content.json').read_text())


def local(href):
    """rjrt.com links become site-relative; other hosts stay absolute."""
    return re.sub(r'^https?://(prod\.)?rjrt\.com', '', href or '') or '/'


def clean(html):
    html = re.sub(r'\s(class|id|style|data-[\w-]+)="[^"]*"', '', html)
    html = re.sub(r'</?div[^>]*>', '', html)
    html = re.sub(r'<hr[^>]*>', '', html)
    # the pipeline turns "&nbsp;<strong>" into NBSP + space (two spaces wide); a plain space keeps the width
    html = re.sub(r'(&nbsp;|\u00a0)(?=<)|(?<=>)(&nbsp;|\u00a0)', ' ', html)
    return re.sub(r'>\s+<', '><', html).strip()


def write(page, name, html):
    p = base / 'pages' / page / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html + '\n')


def img(name, alt=''):
    return f'<p><picture><img src="/media/home/{name}" alt="{alt}"></picture></p>'


# ---- home
hero_file = d['heroImg'].rsplit('/', 1)[1]
write('home', '10-hero.html',
      f'<div class="hero"><div><div>{img(hero_file, d["heroAlt"])}</div></div>'
      f'<div><div><h1>{d["h1"]}</h1></div></div></div>')

colors = {'30, 50, 99': 'blue', '0, 161, 220': 'light-blue', '76, 169, 81': 'green', '232, 128, 0': 'orange'}
rows = []
renditions = {  # the rendition the source renders at 1440/1280 (assets.json "current")
    'learn-more-image-card-bg.jpg': 'learn-more-image-card-bg-1536x864.jpg',
    'careers-image-card-bg.jpg': 'careers-image-card-bg-1536x1265.jpg',
    'excellence-in-manufacturing-image-card-bg.jpg': 'excellence-in-manufacturing-image-card-bg-768x512.jpg',
    'harm-reduction-image-card-bg.jpg': 'harm-reduction-image-card-bg-768x850.jpg',
}
for c in d['cards']:
    color = next(v for k, v in colors.items() if k in c['overlay'])
    file = renditions[c['img'].rsplit('/', 1)[1]]
    links = ''.join(f'<p><a href="{local(a["href"])}">{a["text"]}</a></p>' for a in c['links'])
    rows.append(f'<div><div>{img(file, c["alt"])}</div><div><h2>{c["h2"]}</h2>{links}</div><div>{color}</div></div>')
write('home', '20-swoop.html',
      f'<p>{d["intro"]}</p>'
      f'<div class="cards image-card">{"".join(rows)}</div>'
      '<div class="section-metadata"><div><div>Style</div><div>blue-swoop</div></div></div>')
write('home', '90-metadata.html',
      '<div class="metadata">'
      '<div><div>Title</div><div>Home Page - R.J. Reynolds Tobacco Company</div></div>'
      '<div><div>Description</div><div>R.J. Reynolds Tobacco Company, a subsidiary of Reynolds American Inc.</div></div>'
      '</div>')

# ---- nav fragment: [toaster] [brand] [top + primary navs with their panels] [statements]
toaster = re.sub(r'<a [^>]*>', '<a href="#corrective-statements">', d['toaster'])
write('_nav', '10-toaster.html', f'<p>{toaster}</p>')
write('_nav', '20-brand.html', '<p><a href="/">:rjrt-logo: R.J. Reynolds Tobacco Company</a></p>')
panels = {p['title']: p['links'] for p in d['panels']}


def nav_list(items):
    out = []
    for it in items:
        links = panels.get(it['text'], [])
        sub = ''.join(f'<li><a href="{local(a["href"])}">{H.escape(a["text"], False)}</a></li>' for a in links)
        out.append(f'<li><p>{H.escape(it["text"], False)}</p><ul>{sub}</ul></li>' if sub else f'<li><a href="{local(it["href"])}">{H.escape(it["text"], False)}</a></li>')
    return '<ul>' + ''.join(out) + '</ul>'


write('_nav', '30-navs.html', nav_list(d['top']) + nav_list(d['primary']))
write('_nav', '40-statements.html', clean(d['statements']))

# ---- footer fragment: [logo + legal links] [disclaimer] [copyright]
legal = ''.join(f'<li><a href="{local(a["href"])}">{H.escape(a["text"], False)}</a></li>' for a in d['footerLinks'])
write('_footer', '10-brand.html', f'<p><a href="/">:rjrt-logo-white: R.J. Reynolds Tobacco Company</a></p><ul>{legal}</ul>')
write('_footer', '20-text.html', f'<p>{d["footerText"]}</p>')
write('_footer', '30-copyright.html', f'<p>{d["copy"]}</p>')
print('written:', sorted(str(p.relative_to(base)) for p in (base / 'pages').rglob('*.html')))
