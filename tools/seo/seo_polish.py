# -*- coding: utf-8 -*-
"""DS PROAUDIO — SEO-доводка перед переездом на ds-proaudio.ru (24.11.2026).

Работает поверх того, что уже сделали build_seo.py (русские страницы) и tools/i18n/build_en.py (английские).
Не требует git и не трогает основной текст страниц: меняет только служебную разметку в <head>,
пустые alt у картинок, robots и карту сайта. Повторный запуск ничего не портит (всё помечено маркерами).

Запуск:  SITE=/путь/к/папке/сайта python3 seo_polish.py            (по умолчанию — site/ рядом с tools/)
         SITE=... python3 seo_polish.py --check                    (только отчёт, без записи)

Что делает:
  1. Организация (JSON-LD Organization, @id …/#org): юрлицо ООО «Дип Саунд», ИНН, ОГРН, юридический адрес;
     та же разметка добавляется на «Контакты» (ru и en).
  2. Описания (meta description + og:description) карточек товаров и серий: где описание совпадает
     с другой страницей или короче 70 знаков — добавляет название модели и «характеристики, фото, файлы».
  3. Заголовки (title) аксессуаров, у которых английский и русский title одинаковые, и короткий title блога.
  4. Хлебные крошки (BreadcrumbList) на страницах, где их не было (Лица, История, Философия, Портфолио,
     Отзывы, SoundMath — ru и en).
  5. Английские страницы: в хлебных крошках и в разметке товара ссылки ведут на английские страницы, а не на русские.
  6. Пустые alt: логотип, знак ГИСП, фото товаров и серий, аватары в отзывах, фото шоу-рума и производства.
  7. robots: robots.txt остаётся боевым; robots-test.txt (всё закрыто) отдаётся на любом адресе, кроме
     ds-proaudio.ru, правилом в .htaccess (+ заголовок X-Robots-Tag: noindex). На боевом домене ничего
     переключать не нужно.
  8. .htaccess: /Main.dc.html → / (301), если в папке нет отдельного index.html.
  9. sitemap.xml: все индексируемые страницы ru и en, с парами языков (hreflang) для Google.
"""
import glob, html, json, os, re, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.environ.get('SITE') or os.path.join(os.path.dirname(os.path.dirname(HERE)), 'site')
DOMAIN = 'https://ds-proaudio.ru'
CHECK = '--check' in sys.argv
CHANGED = {}

LEGAL = {
    "legalName": "ООО «Дип Саунд»",
    "taxID": "7702801847",
    "identifier": {"@type": "PropertyValue", "propertyID": "ОГРН", "value": "1127747128200"},
    "address": {"@type": "PostalAddress", "addressCountry": "RU", "postalCode": "109316", "addressLocality": "Москва",
                "streetAddress": "Остаповский проезд, д. 3, стр. 8, ком. Б-301"},
}
LEGAL_EN = {
    "legalName": "Deep Sound LLC (ООО «Дип Саунд»)",
    "taxID": "7702801847",
    "identifier": {"@type": "PropertyValue", "propertyID": "OGRN", "value": "1127747128200"},
    "address": {"@type": "PostalAddress", "addressCountry": "RU", "postalCode": "109316", "addressLocality": "Moscow",
                "streetAddress": "Ostapovsky proezd 3, bldg. 8, room B-301"},
}


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(rel, s, old):
    if s == old:
        return
    CHANGED.setdefault(rel, 0)
    CHANGED[rel] += 1
    if not CHECK:
        with open(os.path.join(SITE, rel), 'w', encoding='utf-8') as f:
            f.write(s)


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def attr(s):
    return html.escape(s, quote=True)


def shorten(s, limit=170):
    if len(s) <= limit:
        return s
    cut = s[:limit - 1]
    return cut[:cut.rfind(' ')].rstrip(',;:—– ') + '…'


def ld_scripts(s):
    return list(re.finditer(r'(<script type="application/ld\+json">)(.*?)(</script>)', s, re.S))


def ld_dump(obj, like):
    out = json.dumps(obj, ensure_ascii=False)
    return out.replace('</', '<\\/')


PRODUCTS = {}
pj = os.path.join(SITE, 'assets/products/products.json')
if os.path.exists(pj):
    data = json.load(open(pj, encoding='utf-8'))
    PRODUCTS = data.get('products', {})
SERIES = {'taura': 'TAURA', 'era': 'ERA', 'ant': 'ANT', 'pillar': 'PILLAR', 'plr': 'PILLAR', 'cx': 'CX', 'mcx': 'MCX',
          'stella': 'STELLA', 'da': 'DA', 'era-i': 'ERA-i', 'erai': 'ERA-i'}


def pages():
    out = []
    for p in sorted(glob.glob(os.path.join(SITE, '*.html')) + glob.glob(os.path.join(SITE, 'en', '*.html'))):
        out.append(os.path.relpath(p, SITE))
    return out


def is_en(rel):
    return rel.startswith('en/')


def noindex(s):
    return bool(re.search(r'<meta name="robots" content="[^"]*noindex', s))


def get_desc(s):
    m = re.search(r'<meta name="description" content="([^"]*)">', s)
    return html.unescape(m.group(1)) if m else None


def set_desc(s, d):
    s = re.sub(r'<meta name="description" content="[^"]*">', lambda m: '<meta name="description" content="' + attr(d) + '">', s, count=1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', lambda m: '<meta property="og:description" content="' + attr(d) + '">', s, count=1)
    return s


def product_sku(s):
    for m in ld_scripts(s):
        if '"Product"' in m.group(2):
            try:
                return json.loads(m.group(2).replace('<\\/', '</')).get('sku')
            except Exception:
                pass
    return None


def title_of(s):
    m = re.search(r'<title>(.*?)</title>', s, re.S)
    return text(m.group(1)) if m else ''


# ---------- 1. Организация ----------
def fix_org(rel, s):
    leg = LEGAL_EN if is_en(rel) else LEGAL
    def repl(m):
        body = m.group(2)
        if '"Organization"' not in body or '/#org"' not in body or '"@type": "Product"' in body:
            return m.group(0)
        try:
            obj = json.loads(body.replace('<\\/', '</'))
        except Exception:
            return m.group(0)
        if obj.get('@type') != 'Organization':
            return m.group(0)
        changed = False
        for k, v in leg.items():
            if obj.get(k) != v:
                obj[k] = v; changed = True
        return m.group(1) + ld_dump(obj, body) + m.group(3) if changed else m.group(0)
    s = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', repl, s, flags=re.S)
    # «Контакты»: полная разметка организации
    if os.path.basename(rel) == 'contacts.html':
        s = re.sub(r'\n?<!-- seo-org:start -->.*?<!-- seo-org:end -->', '', s, flags=re.S)
        home = os.path.join(SITE, 'en/index.html' if is_en(rel) else 'Main.dc.html')
        org = None
        if os.path.exists(home):
            for m in ld_scripts(read(home)):
                if '/#org"' in m.group(2) and '"Organization"' in m.group(2):
                    try:
                        org = json.loads(m.group(2).replace('<\\/', '</'))
                    except Exception:
                        pass
        if org and org.get('@type') == 'Organization':
            org.update(leg)
            block = '<!-- seo-org:start -->\n<script type="application/ld+json">' + ld_dump(org, '') + '</script>\n<!-- seo-org:end -->'
            s = s.replace('</head>', block + '\n</head>', 1)
    return s


# ---------- 3–5. Заголовки, крошки, ссылки en ----------
CRUMB_PAGES = {'faces.html', 'history.html', 'philosophy.html', 'portfolio.html', 'reviews.html', 'soundmath.html'}


def page_url(rel):
    if rel == 'Main.dc.html':
        return DOMAIN + '/'
    if rel == 'en/index.html':
        return DOMAIN + '/en/'
    return DOMAIN + '/' + rel


def fix_crumbs(rel, s):
    s = re.sub(r'\n?<!-- seo-crumbs:start -->.*?<!-- seo-crumbs:end -->', '', s, flags=re.S)
    if os.path.basename(rel) not in CRUMB_PAGES or 'BreadcrumbList' in s or noindex(s):
        return s
    name = re.split(r' [—|] ', title_of(s))[0].strip()
    if not name:
        return s
    home = ('Home', DOMAIN + '/en/') if is_en(rel) else ('Главная', DOMAIN + '/')
    ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": home[0], "item": home[1]},
        {"@type": "ListItem", "position": 2, "name": name, "item": page_url(rel)}]}
    block = '<!-- seo-crumbs:start -->\n<script type="application/ld+json">' + ld_dump(ld, '') + '</script>\n<!-- seo-crumbs:end -->'
    return s.replace('</head>', block + '\n</head>', 1)


def fix_en_links(rel, s):
    """На английских страницах: крошки и url товара — на английские страницы."""
    if not is_en(rel):
        return s
    def to_en(u):
        if u == DOMAIN + '/':
            return DOMAIN + '/en/'
        if u.startswith(DOMAIN + '/') and not u.startswith(DOMAIN + '/en/'):
            p = u[len(DOMAIN) + 1:].split('#')[0]
            if p.endswith('.html') and os.path.exists(os.path.join(SITE, 'en', p)):
                return DOMAIN + '/en/' + u[len(DOMAIN) + 1:]
        return u
    def repl(m):
        body = m.group(2)
        if 'BreadcrumbList' not in body and '"Product"' not in body:
            return m.group(0)
        new = re.sub(r'("(?:item|url)"\s*:\s*")([^"]+)(")', lambda k: k.group(1) + to_en(k.group(2)) + k.group(3), body)
        return m.group(1) + new + m.group(3)
    return re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', repl, s, flags=re.S)


# ---------- 6. alt ----------
def alt_for(rel, src, ctx_after):
    en = is_en(rel)
    if re.search(r'assets/(ed4decb6b5a70b43cdf0d482d0b1e26e|3d4dfaf79132674a05fc4f9379ace7c9)\.png$', src):
        return 'DS PROAUDIO'
    if 'gisp-mark' in src or 'gisp-purple' in src:
        return 'GISP mark' if en else 'Знак ГИСП'
    m = re.search(r'assets/products/([a-z0-9-]+)/', src)
    if m:
        pid = m.group(1)
        if pid == '_series':
            fn = os.path.basename(src).lower()
            for k in sorted(SERIES, key=len, reverse=True):
                if fn.startswith(k):
                    return ('DS PROAUDIO ' + SERIES[k] + (' series' if en else ' — серия'))
            return None
        p = PRODUCTS.get(pid)
        if p:
            name = p.get('name') or ''
            return name if name.upper().startswith(('DS PROAUDIO', 'GRAVITY', 'EUROMET', 'KONIG')) else 'DS PROAUDIO ' + name
        return None
    if '/showroom/' in src:
        return 'DS PROAUDIO showroom' if en else 'Шоу-рум DS PROAUDIO'
    if '/production/' in src:
        return 'DS PROAUDIO production' if en else 'Производство DS PROAUDIO'
    # аватар в отзыве: <figcaption><img alt=""><span><b>Имя</b>
    mm = re.match(r'\s*<span><b>([^<]{3,80})</b>', ctx_after)
    if mm:
        return text(mm.group(1))
    return None


def fix_alts(rel, s):
    def repl(m):
        tag = m.group(0)
        src = re.search(r'\bsrc="([^"]+)"', tag)
        if not src or "'" in src.group(1) or '+' in src.group(1):
            return tag
        a = alt_for(rel, src.group(1), s[m.end():m.end() + 120])
        if not a:
            return tag
        return tag.replace('alt=""', 'alt="' + attr(a) + '"', 1)
    return re.sub(r'<img\b[^>]*\balt=""[^>]*>', repl, s)


# ---------- 2–3. описания и заголовки ----------
def fix_titles_descs(all_pages):
    texts = {rel: read(os.path.join(SITE, rel)) for rel in all_pages}
    desc_count = {}
    for rel, s in texts.items():
        if noindex(s):
            continue
        d = get_desc(s)
        if d:
            desc_count.setdefault((is_en(rel), d), []).append(rel)
    title_count = {}
    for rel, s in texts.items():
        title_count.setdefault(title_of(s), []).append(rel)
    out = {}
    for rel, s in texts.items():
        orig = s
        en = is_en(rel)
        base = os.path.basename(rel)
        if noindex(s):
            out[rel] = s; continue
        d = get_desc(s) or ''
        dup = len(desc_count.get((en, d), [])) > 1
        t = title_of(s)
        if base.startswith('p-'):
            sku = product_sku(s)
            p = PRODUCTS.get(sku or '', {})
            name = p.get('name') or re.split(r' [—|] ', t)[0]
            typ = ''
            parts = re.split(r' — | \| ', t)
            if len(parts) >= 3:
                typ = parts[1]
            if dup or len(d) < 70:
                nd = d.rstrip()
                if name and name.lower() not in nd.lower():
                    nd = name + (' — ' + typ if typ and typ.lower() not in nd.lower() else '') + '. ' + nd
                elif len(nd) <= len('DS PROAUDIO ' + name) + 2 and typ:
                    nd = 'DS PROAUDIO ' + name + ' — ' + typ + '.'
                if len(nd) < 110:
                    nd = nd.rstrip(' .') + ('. Specifications, photos and design files.' if en else '. Характеристики, фото и файлы для проектирования.')
                nd = shorten(re.sub(r'\.\.+', '.', nd))
                if nd != d:
                    s = set_desc(s, nd)
            # одинаковый title у ru и en (аксессуары сторонних брендов)
            twin = ('en/' + base) if not en else base
            if os.path.exists(os.path.join(SITE, twin)) and title_of(texts.get(twin, '')) == t and ' — DS PROAUDIO' in t:
                nt = t.replace(' — DS PROAUDIO', (' — accessory | DS PROAUDIO' if en else ' — аксессуар | DS PROAUDIO'))
                s = s.replace('<title>' + html.escape(t, quote=False) + '</title>', '<title>' + html.escape(nt, quote=False) + '</title>', 1)
                s = s.replace('<title>' + t + '</title>', '<title>' + html.escape(nt, quote=False) + '</title>', 1)
                s = re.sub(r'<meta property="og:title" content="[^"]*">', lambda m: '<meta property="og:title" content="' + attr(nt) + '">', s, count=1)
                s = s.replace('"name": ' + json.dumps(t, ensure_ascii=False) + ', "url"', '"name": ' + json.dumps(nt, ensure_ascii=False) + ', "url"', 1)
        elif dup and (base.startswith('series-') or base.startswith('products')):
            h = re.split(r' [—|] ', t)[0]
            if h and h.lower() not in d.lower():
                s = set_desc(s, shorten(h + ': ' + d[:1].lower() + d[1:]))
        if base == 'blog.html' and len(t) < 25:
            nt = 'Blog — news and articles | DS PROAUDIO' if en else 'Блог — новости и статьи | DS PROAUDIO'
            s = s.replace('<title>' + t + '</title>', '<title>' + nt + '</title>', 1)
            s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + nt + '">', s, count=1)
        out[rel] = s
    return texts, out


# ---------- 7–8. robots и .htaccess ----------
ROBOTS_TEST = """# DS PROAUDIO — ТЕСТОВЫЙ сервер: индексация закрыта.
# Этот файл отдаётся вместо robots.txt на любом адресе, кроме ds-proaudio.ru (правило в .htaccess, блок seo-robots).
# На боевом домене robots.txt отдаётся как есть — переключать ничего не нужно.
User-agent: *
Disallow: /
"""

HT_BLOCK = """# ---- seo-robots:start (24.11.2026) ----
# Тестовые адреса (IP, превью и т. п.) закрыты от поисковиков: вместо robots.txt отдаётся robots-test.txt
# и заголовок X-Robots-Tag: noindex. На ds-proaudio.ru и www.ds-proaudio.ru работает обычный robots.txt.
RewriteCond %{HTTP_HOST} !^(www\\.)?ds-proaudio\\.ru$ [NC]
RewriteRule ^robots\\.txt$ /robots-test.txt [L]
<IfModule mod_headers.c>
  <If "%{HTTP_HOST} !~ /^(www\\.)?ds-proaudio\\.ru$/i">
    Header always set X-Robots-Tag "noindex, nofollow"
  </If>
</IfModule>
%MAIN%# ---- seo-robots:end ----
"""
MAIN_RULE = """# Старый адрес главной -> корень сайта (только прямой заход на /Main.dc.html; сама главная по-прежнему отдаётся по «/»)
RewriteCond %{THE_REQUEST} \\s/+Main\\.dc\\.html[\\s?] [NC]
RewriteRule ^Main\\.dc\\.html$ / [R=301,L]
"""


def fix_robots_htaccess():
    rt = os.path.join(SITE, 'robots-test.txt')
    old = read(rt) if os.path.exists(rt) else ''
    write('robots-test.txt', ROBOTS_TEST, old)
    hp = os.path.join(SITE, '.htaccess')
    if not os.path.exists(hp):
        print('ВНИМАНИЕ: нет .htaccess — блок seo-robots не добавлен')
        return
    s = read(hp); orig = s
    s = re.sub(r'# ---- seo-robots:start.*?# ---- seo-robots:end ----\n', '', s, flags=re.S)
    main = MAIN_RULE if not os.path.exists(os.path.join(SITE, 'index.html')) else ''
    block = HT_BLOCK.replace('%MAIN%', main)
    m = re.search(r'^RewriteEngine On\s*\n', s, re.M)
    if m:
        s = s[:m.end()] + block + s[m.end():]
    else:
        s = 'RewriteEngine On\n' + block + s
    write('.htaccess', s, orig)


# ---------- 9. sitemap ----------
def build_sitemap(texts):
    old = {}
    sp = os.path.join(SITE, 'sitemap.xml')
    if os.path.exists(sp):
        for u, d in re.findall(r'<loc>([^<]+)</loc><lastmod>([^<]+)</lastmod>', read(sp)):
            old[u] = d
    entries = []
    for rel in sorted(texts):
        s = texts[rel]
        if noindex(s) or os.path.basename(rel) in ('404.html', 'blog-post.html'):
            continue
        c = re.search(r'<link rel="canonical" href="([^"]+)">', s)
        if not c or c.group(1) != page_url(rel):
            continue
        u = c.group(1)
        lm = old.get(u)
        if not lm:
            m = re.search(r'"dateModified": "(\d{4}-\d{2}-\d{2})"', s)
            lm = m.group(1) if m else date.today().isoformat()
        alts = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">', s)
        base = os.path.basename(rel)
        if rel == 'Main.dc.html':
            pr = '1.0'
        elif rel == 'en/index.html':
            pr = '0.9'
        elif base.startswith(('p-', 'series-', 'products')):
            pr = '0.7' if is_en(rel) else '0.8'
        else:
            pr = '0.5' if is_en(rel) else '0.6'
        entries.append((u, lm, pr, alts))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for u, lm, pr, alts in entries:
        out.append('  <url><loc>' + u + '</loc><lastmod>' + lm + '</lastmod><priority>' + pr + '</priority>' +
                   ''.join('<xhtml:link rel="alternate" hreflang="' + h + '" href="' + html.escape(a) + '"/>' for h, a in alts) + '</url>')
    out.append('</urlset>')
    write('sitemap.xml', '\n'.join(out) + '\n', read(sp) if os.path.exists(sp) else '')
    return len(entries)


def main():
    ps = pages()
    texts, stage = fix_titles_descs(ps)
    final = {}
    for rel in ps:
        s = stage[rel]
        s = fix_org(rel, s)
        s = fix_crumbs(rel, s)
        s = fix_en_links(rel, s)
        s = fix_alts(rel, s)
        final[rel] = s
        write(rel, s, texts[rel])
    n = build_sitemap(final)
    fix_robots_htaccess()
    print('страниц просмотрено:', len(ps), '· изменено файлов:', len(CHANGED), '· в карте сайта:', n, '· режим:', 'проверка' if CHECK else 'запись')
    for k in sorted(CHANGED):
        print('  ', k)


if __name__ == '__main__':
    main()
