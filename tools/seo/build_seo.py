# -*- coding: utf-8 -*-
"""DS PROAUDIO — поисковая разметка сайта (раздел 2 плана Коли «Подготовка сайта к публикации», 24.10.2026).

Запуск из корня репозитория:  python3 tools/seo/build_seo.py
Скрипт можно запускать повторно после любых правок страниц: свои вставки он помечает
<!-- seo:start --> … <!-- seo:end --> и при повторном запуске заменяет их.

Что делает:
  • на каждой странице: canonical, Open Graph, twitter:card (блок seo перед </head>);
  • карточки товаров (p-*.html): заголовок «TAURA 8 — элемент массива | DS PROAUDIO» вместо
    «DS PROAUDIO TAURA 8 — DS PROAUDIO», микроразметка Product с характеристиками из products.json,
    alt у фото товара;
  • главная: микроразметка Organization (контакты, адреса, соцсети);
  • описания (meta description): создаёт там, где нет, укорачивает длиннее 170 знаков;
  • h1 с <br> без пробела — добавляет пробел (иначе поисковик читает «Прокатныекомпании»);
  • хлебные крошки JSON-LD: Main.dc.html → корень сайта;
  • черновики: noindex;
  • sitemap.xml (дата из истории Git), robots.txt.
Домен — ds-proaudio.ru (решение Тима Р1: публикуем на старом адресе)."""
import html, json, os, re, subprocess, sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
DOMAIN = 'https://ds-proaudio.ru'
OG_DEFAULT = '/assets/og/og-default.jpg'

DRAFTS = ['cards-variants.html', 'cards-variants-motion.html', 'menu-proposal.html', 'menu-proposal-demo.html', 'showroom-3d.html']
# цветовые варианты: canonical на основную модель
CANON = {'p-pillar-a-wh.html': 'p-pillar-a.html', 'p-pillar-p-wh.html': 'p-pillar-p.html'}
# страницы, которые не нужны в поиске и карте сайта (служебные шаблоны)
NOT_IN_SITEMAP = set(DRAFTS) | {'blog-post.html'} | set(CANON)

DESCRIPTIONS = {
  'Main.dc.html': 'DS PROAUDIO — российский производитель профессиональной акустики: линейные массивы, точечные источники, колонны и усилители. Расчёт, подбор и сервис в Москве и Санкт-Петербурге.',
  'soundmath.html': 'SoundMath — калькулятор DS PROAUDIO для расчёта линейных массивов: углы раскрытия, звуковое давление и АЧХ по точкам площадки.',
}

ORG = {
  "@context": "https://schema.org", "@type": "Organization", "@id": DOMAIN + "/#org",
  "name": "DS PROAUDIO", "url": DOMAIN + "/", "logo": DOMAIN + "/icon-512.png",
  "description": "Российский производитель профессиональных акустических систем полного цикла.",
  "email": "info@ds-proaudio.ru", "telephone": "+7 495 150-12-38",
  "sameAs": ["https://vk.com/ds_proaudio", "https://t.me/dsproaudio", "https://max.ru/id7702801847_biz"],
  "areaServed": "RU",
  "contactPoint": [{"@type": "ContactPoint", "telephone": "+7 495 150-12-38", "email": "info@ds-proaudio.ru",
                    "contactType": "sales", "areaServed": "RU", "availableLanguage": "ru"}],
  "location": [
    {"@type": "Place", "name": "Офис и сервисный центр", "address": {"@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Москва", "streetAddress": "Остаповский проезд, д. 3с8"}},
    {"@type": "Place", "name": "Шоу-рум", "address": {"@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Москва", "streetAddress": "2-й Донской проезд, 4"}},
    {"@type": "Place", "name": "Сервисный центр", "address": {"@type": "PostalAddress", "addressCountry": "RU", "addressLocality": "Санкт-Петербург", "streetAddress": "ул. Парковая, 4Д"}}]
}


def read(p):
    with open(p, encoding='utf-8') as f: return f.read()

def write(p, s):
    with open(p, 'w', encoding='utf-8') as f: f.write(s)

def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def shorten(s, n=160, limit=170):
    s = text(s)
    if len(s) <= limit: return s
    cut = s[:n]
    end = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
    if end >= 90: return cut[:end + 1]
    return cut[:cut.rfind(' ')].rstrip(',;:—– ') + '…'

def url_of(fn):
    return DOMAIN + '/' if fn == 'Main.dc.html' else DOMAIN + '/' + fn

def attr(s):
    return html.escape(s, quote=True)

def git_date(fn):
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', 'site/' + fn], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        return out or date.today().isoformat()
    except Exception:
        return date.today().isoformat()


data = json.load(open(os.path.join(SITE, 'assets/products/products.json'), encoding='utf-8'))
PRODUCTS = data['products']
LABEL = {}
for cat in data['categories']:
    for ser in cat['series']:
        for g in ser['groups']:
            for it in g['items']:
                LABEL.setdefault(it['slug'], (it['label'], cat['name']))

def product_id(fn, s):
    stem = fn[2:-5]
    for guess in ('ds-proaudio-' + stem, 'new-' + stem):
        if guess in PRODUCTS: return guess
    ids = re.findall(r'assets/products/([a-z0-9-]+)/', s)
    if not ids: return None
    best = max(set(ids), key=ids.count)
    return best if best in PRODUCTS else None

def product_type(pid, name):
    base = PRODUCTS[pid].get('variantOf')
    lab = LABEL.get(pid, ('', ''))[0] or (LABEL.get(base, ('', ''))[0].replace(PRODUCTS.get(base, {}).get('name', '#'), name) if base else '')
    t = re.sub(r'\s+', ' ', lab.replace(name, '')).strip(' —-')
    return (t[:1].lower() + t[1:]) if t else ''

def product_ld(pid, url, imgs):
    p = PRODUCTS[pid]
    props = []
    for row in p.get('specs') or []:
        if len(row) >= 2 and row[0] and row[1]:
            props.append({"@type": "PropertyValue", "name": text(row[0]), "value": text(row[1]).replace(' \n', '; ')})
    ld = {"@context": "https://schema.org", "@type": "Product", "name": p.get('fullName') or ('DS PROAUDIO ' + p['name']),
          "url": url, "sku": pid, "brand": {"@type": "Brand", "name": "DS PROAUDIO"},
          "manufacturer": {"@id": DOMAIN + "/#org", "@type": "Organization", "name": "DS PROAUDIO"},
          "description": shorten(p.get('short') or p.get('body') or '', 300, 320)}
    if LABEL.get(pid): ld["category"] = LABEL[pid][1]
    if imgs: ld["image"] = [DOMAIN + '/' + i for i in imgs[:5]]
    if props: ld["additionalProperty"] = props
    return ld


def strip(s):
    return re.sub(r'<(?!br)[^>]+>', '', s)

def faq_ld(s):
    """Вопросы и ответы из блока «Частые вопросы» (.kl-faq) → разметка FAQPage для поиска."""
    m = re.search(r'<div class="kl-faq[^"]*">(.*?</details>)</div>', s, re.S)
    if not m: return None
    qa = re.findall(r'<summary>(.*?)</summary>\s*<div>(.*?)</div>', m.group(1), re.S)
    if not qa: return None
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": text(strip(q)), "acceptedAnswer": {"@type": "Answer", "text": text(strip(a))}} for q, a in qa]}


def process(fn):
    path = os.path.join(SITE, fn)
    s = read(path); orig = s
    s = re.sub(r'\n?<!-- seo:start -->.*?<!-- seo:end -->', '', s, flags=re.S)

    if fn in DRAFTS:
        if 'name="robots"' not in s:
            s = s.replace('</title>', '</title>\n<meta name="robots" content="noindex, nofollow">', 1)
        if s != orig: write(path, s)
        return None

    # хлебные крошки: главная — корень сайта
    s = s.replace('"item": "' + DOMAIN + '/Main.dc.html"', '"item": "' + DOMAIN + '/"').replace('"item":"' + DOMAIN + '/Main.dc.html"', '"item":"' + DOMAIN + '/"')

    pid = product_id(fn, s) if fn.startswith('p-') else None
    extra = []
    if pid:
        p = PRODUCTS[pid]; name = p['name']; typ = product_type(pid, name)
        new_title = name + (' — ' + typ if typ else '') + ' | DS PROAUDIO'
        s = re.sub(r'<title>DS PROAUDIO [^<]*? — DS PROAUDIO</title>', '<title>' + html.escape(new_title, quote=False) + '</title>', s, count=1)
        imgs = []
        def alt_fix(m):
            src = m.group(1)
            if src not in imgs: imgs.append(src)
            return m.group(0).replace('alt=""', 'alt="DS PROAUDIO ' + attr(name) + ' — фото ' + str(imgs.index(src) + 1) + '"')
        s = re.sub(r'<img src="\./(assets/products/' + re.escape(pid) + r'/[^"]+)" alt=""', alt_fix, s)
        if not imgs:
            imgs = sorted(set(re.findall(r'\./(assets/products/' + re.escape(pid) + r'/\d+\.(?:jpg|png|webp))', s)))
        extra.append(json.dumps(product_ld(pid, url_of(CANON.get(fn, fn)), imgs), ensure_ascii=False))
        og_img = '/' + imgs[0] if imgs else OG_DEFAULT
    else:
        og_img = OG_DEFAULT
    if fn == 'Main.dc.html':
        extra.append(json.dumps(ORG, ensure_ascii=False))
    faq = faq_ld(s)
    if faq: extra.append(json.dumps(faq, ensure_ascii=False))

    # описание
    m = re.search(r'<meta name="description" content="([^"]*)">', s)
    if m:
        d = html.unescape(m.group(1))
        if len(d) > 170:
            d = shorten(d)
            s = s[:m.start()] + '<meta name="description" content="' + attr(d) + '">' + s[m.end():]
    else:
        d = DESCRIPTIONS.get(fn, '')
        if d:
            s = s.replace('</title>', '</title>\n<meta name="description" content="' + attr(d) + '">', 1)
    title = text(re.search(r'<title>(.*?)</title>', s, re.S).group(1))

    # h1 с <br> без пробела
    def h1fix(m):
        return re.sub(r'(?<=[^\s>])<br\s*/?>', ' <br>', m.group(0))
    s = re.sub(r'<h1\b[^>]*>.*?</h1>', h1fix, s, flags=re.S)

    canon = url_of(CANON.get(fn, fn))
    block = ['<!-- seo:start -->',
             '<link rel="canonical" href="' + canon + '">',
             '<meta property="og:type" content="' + ('product' if pid else 'website') + '">',
             '<meta property="og:site_name" content="DS PROAUDIO">',
             '<meta property="og:locale" content="ru_RU">',
             '<meta property="og:title" content="' + attr(title) + '">',
             '<meta property="og:url" content="' + canon + '">',
             '<meta property="og:image" content="' + DOMAIN + og_img + '">',
             '<meta name="twitter:card" content="summary_large_image">',
             '<meta name="author" content="DS PROAUDIO">']
    # автор и дата обновления страницы (дата — последний коммит файла)
    extra.insert(0, json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": title, "url": canon, "inLanguage": "ru",
                                "dateModified": git_date(fn), "author": {"@type": "Organization", "name": "DS PROAUDIO", "url": DOMAIN + '/'},
                                "publisher": {"@type": "Organization", "name": "DS PROAUDIO", "url": DOMAIN + '/'}}, ensure_ascii=False))
    if d: block.insert(6, '<meta property="og:description" content="' + attr(d) + '">')
    for e in extra:
        block.append('<script type="application/ld+json">' + e.replace('</', '<\\/') + '</script>')
    block.append('<!-- seo:end -->')
    s = s.replace('</head>', '\n'.join(block) + '\n</head>', 1)
    if s != orig: write(path, s)
    return canon


def main():
    pages = sorted(f for f in os.listdir(SITE) if f.endswith('.html') and f not in ('index.html', '404.html'))
    urls = []
    for fn in pages:
        c = process(fn)
        if c and fn not in NOT_IN_SITEMAP:
            pr = '1.0' if fn == 'Main.dc.html' else ('0.8' if fn.startswith(('p-', 'series-', 'products')) else '0.6')
            urls.append((c, git_date(fn), pr))
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, d, pr in urls:
        sm.append('  <url><loc>' + u + '</loc><lastmod>' + d + '</lastmod><priority>' + pr + '</priority></url>')
    sm.append('</urlset>')
    write(os.path.join(SITE, 'sitemap.xml'), '\n'.join(sm) + '\n')
    print('страниц:', len(pages), '· в карте сайта:', len(urls))

if __name__ == '__main__':
    main()
