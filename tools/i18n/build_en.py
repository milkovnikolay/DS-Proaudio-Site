#!/usr/bin/env python3
"""DS PROAUDIO — сборка английской версии сайта (27.10.2026).

Запуск из корня репозитория:  python3 tools/i18n/build_en.py

Что делает:
  • берёт русские страницы из списка PAGES и словарь tools/i18n/en.json (русская фраза → английская);
  • пишет английские копии в site/en/ (главная → site/en/index.html): тексты, подписи картинок,
    подсказки и строки во встроенных скриптах заменяются по словарю;
  • на английских страницах скрыто всё про ГИСП, реестр и госзакупки (en.css + пустой перевод в словаре);
  • пишет site/en/i18n-en.js — тот же словарь для текстов, которые общие скрипты (меню на телефоне,
    помощники, форма заявки, отзывы, блог) рисуют уже в браузере;
  • в русских страницах из PAGES обновляет блок <!-- lang:start … lang:end --> (hreflang и адрес
    английской версии для переключателя RU | EN).
Русские страницы — источник: после правок в них достаточно перезапустить скрипт. Если на странице
появился текст, которого нет в словаре, скрипт выведет его списком — его нужно добавить в en.json.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
EN_DIR = os.path.join(SITE, 'en')
DOMAIN = 'https://ds-proaudio.ru'

# русская страница → английская (путь внутри site/en/) и адреса для поисковиков
PAGES = {
    'Main.dc.html': {'en': 'index.html', 'ru_url': DOMAIN + '/', 'en_url': DOMAIN + '/en/'},
    'technologies.html': {'en': 'technologies.html', 'ru_url': DOMAIN + '/technologies.html', 'en_url': DOMAIN + '/en/technologies.html'},
    'about.html': {'en': 'about.html', 'ru_url': DOMAIN + '/about.html', 'en_url': DOMAIN + '/en/about.html'},
    'production.html': {'en': 'production.html', 'ru_url': DOMAIN + '/production.html', 'en_url': DOMAIN + '/en/production.html'},
    'philosophy.html': {'en': 'philosophy.html', 'ru_url': DOMAIN + '/philosophy.html', 'en_url': DOMAIN + '/en/philosophy.html'},
    'faces.html': {'en': 'faces.html', 'ru_url': DOMAIN + '/faces.html', 'en_url': DOMAIN + '/en/faces.html'},
    'history.html': {'en': 'history.html', 'ru_url': DOMAIN + '/history.html', 'en_url': DOMAIN + '/en/history.html'},
    'contacts.html': {'en': 'contacts.html', 'ru_url': DOMAIN + '/contacts.html', 'en_url': DOMAIN + '/en/contacts.html'},
    'clients.html': {'en': 'clients.html', 'ru_url': DOMAIN + '/clients.html', 'en_url': DOMAIN + '/en/clients.html'},
    'support.html': {'en': 'support.html', 'ru_url': DOMAIN + '/support.html', 'en_url': DOMAIN + '/en/support.html'},
    'warranty.html': {'en': 'warranty.html', 'ru_url': DOMAIN + '/warranty.html', 'en_url': DOMAIN + '/en/warranty.html'},
    'seminars.html': {'en': 'seminars.html', 'ru_url': DOMAIN + '/seminars.html', 'en_url': DOMAIN + '/en/seminars.html'},
    'software.html': {'en': 'software.html', 'ru_url': DOMAIN + '/software.html', 'en_url': DOMAIN + '/en/software.html'},
    'docs.html': {'en': 'docs.html', 'ru_url': DOMAIN + '/docs.html', 'en_url': DOMAIN + '/en/docs.html'},
    'series-taura.html': {'en': 'series-taura.html', 'ru_url': DOMAIN + '/series-taura.html', 'en_url': DOMAIN + '/en/series-taura.html'},
    'series-stella.html': {'en': 'series-stella.html', 'ru_url': DOMAIN + '/series-stella.html', 'en_url': DOMAIN + '/en/series-stella.html'},
    'series-pillar.html': {'en': 'series-pillar.html', 'ru_url': DOMAIN + '/series-pillar.html', 'en_url': DOMAIN + '/en/series-pillar.html'},
    'series-mcx.html': {'en': 'series-mcx.html', 'ru_url': DOMAIN + '/series-mcx.html', 'en_url': DOMAIN + '/en/series-mcx.html'},
    'series-era.html': {'en': 'series-era.html', 'ru_url': DOMAIN + '/series-era.html', 'en_url': DOMAIN + '/en/series-era.html'},
    'series-era-i.html': {'en': 'series-era-i.html', 'ru_url': DOMAIN + '/series-era-i.html', 'en_url': DOMAIN + '/en/series-era-i.html'},
    'series-da.html': {'en': 'series-da.html', 'ru_url': DOMAIN + '/series-da.html', 'en_url': DOMAIN + '/en/series-da.html'},
    'series-cx.html': {'en': 'series-cx.html', 'ru_url': DOMAIN + '/series-cx.html', 'en_url': DOMAIN + '/en/series-cx.html'},
    'series-auditorium.html': {'en': 'series-auditorium.html', 'ru_url': DOMAIN + '/series-auditorium.html', 'en_url': DOMAIN + '/en/series-auditorium.html'},
    'series-ant.html': {'en': 'series-ant.html', 'ru_url': DOMAIN + '/series-ant.html', 'en_url': DOMAIN + '/en/series-ant.html'},
    'products-point-sources.html': {'en': 'products-point-sources.html', 'ru_url': DOMAIN + '/products-point-sources.html', 'en_url': DOMAIN + '/en/products-point-sources.html'},
    'products-monitors.html': {'en': 'products-monitors.html', 'ru_url': DOMAIN + '/products-monitors.html', 'en_url': DOMAIN + '/en/products-monitors.html'},
    'products-line-arrays.html': {'en': 'products-line-arrays.html', 'ru_url': DOMAIN + '/products-line-arrays.html', 'en_url': DOMAIN + '/en/products-line-arrays.html'},
    'products-constant-curvature.html': {'en': 'products-constant-curvature.html', 'ru_url': DOMAIN + '/products-constant-curvature.html', 'en_url': DOMAIN + '/en/products-constant-curvature.html'},
    'products-compact-sets.html': {'en': 'products-compact-sets.html', 'ru_url': DOMAIN + '/products-compact-sets.html', 'en_url': DOMAIN + '/en/products-compact-sets.html'},
    'products-columns.html': {'en': 'products-columns.html', 'ru_url': DOMAIN + '/products-columns.html', 'en_url': DOMAIN + '/en/products-columns.html'},
    'products-auditorium.html': {'en': 'products-auditorium.html', 'ru_url': DOMAIN + '/products-auditorium.html', 'en_url': DOMAIN + '/en/products-auditorium.html'},
    'products-amplifiers.html': {'en': 'products-amplifiers.html', 'ru_url': DOMAIN + '/products-amplifiers.html', 'en_url': DOMAIN + '/en/products-amplifiers.html'},
    'products-all-weather.html': {'en': 'products-all-weather.html', 'ru_url': DOMAIN + '/products-all-weather.html', 'en_url': DOMAIN + '/en/products-all-weather.html'},
    'products-accessories.html': {'en': 'products-accessories.html', 'ru_url': DOMAIN + '/products-accessories.html', 'en_url': DOMAIN + '/en/products-accessories.html'},
    'products.html': {'en': 'products.html', 'ru_url': DOMAIN + '/products.html', 'en_url': DOMAIN + '/en/products.html'},
    'rent-mid.html': {'en': 'rent-mid.html', 'ru_url': DOMAIN + '/rent-mid.html', 'en_url': DOMAIN + '/en/rent-mid.html'},
    'rent-full.html': {'en': 'rent-full.html', 'ru_url': DOMAIN + '/rent-full.html', 'en_url': DOMAIN + '/en/rent-full.html'},
    'rent-compact.html': {'en': 'rent-compact.html', 'ru_url': DOMAIN + '/rent-compact.html', 'en_url': DOMAIN + '/en/rent-compact.html'},
    'ent-nightclubs.html': {'en': 'ent-nightclubs.html', 'ru_url': DOMAIN + '/ent-nightclubs.html', 'en_url': DOMAIN + '/en/ent-nightclubs.html'},
    'ent-live.html': {'en': 'ent-live.html', 'ru_url': DOMAIN + '/ent-live.html', 'en_url': DOMAIN + '/en/ent-live.html'},
    'ent-karaoke.html': {'en': 'ent-karaoke.html', 'ru_url': DOMAIN + '/ent-karaoke.html', 'en_url': DOMAIN + '/en/ent-karaoke.html'},
    'rel-temples.html': {'en': 'rel-temples.html', 'ru_url': DOMAIN + '/rel-temples.html', 'en_url': DOMAIN + '/en/rel-temples.html'},
    'hosp-terraces.html': {'en': 'hosp-terraces.html', 'ru_url': DOMAIN + '/hosp-terraces.html', 'en_url': DOMAIN + '/en/hosp-terraces.html'},
    'hosp-spa.html': {'en': 'hosp-spa.html', 'ru_url': DOMAIN + '/hosp-spa.html', 'en_url': DOMAIN + '/en/hosp-spa.html'},
    'hosp-restaurants.html': {'en': 'hosp-restaurants.html', 'ru_url': DOMAIN + '/hosp-restaurants.html', 'en_url': DOMAIN + '/en/hosp-restaurants.html'},
    'corp-openspace.html': {'en': 'corp-openspace.html', 'ru_url': DOMAIN + '/corp-openspace.html', 'en_url': DOMAIN + '/en/corp-openspace.html'},
    'corp-meeting.html': {'en': 'corp-meeting.html', 'ru_url': DOMAIN + '/corp-meeting.html', 'en_url': DOMAIN + '/en/corp-meeting.html'},
    'corp-conference.html': {'en': 'corp-conference.html', 'ru_url': DOMAIN + '/corp-conference.html', 'en_url': DOMAIN + '/en/corp-conference.html'},
    'corp-banquet.html': {'en': 'corp-banquet.html', 'ru_url': DOMAIN + '/corp-banquet.html', 'en_url': DOMAIN + '/en/corp-banquet.html'},
    'sport-stadiums.html': {'en': 'sport-stadiums.html', 'ru_url': DOMAIN + '/sport-stadiums.html', 'en_url': DOMAIN + '/en/sport-stadiums.html'},
    'sport-pools.html': {'en': 'sport-pools.html', 'ru_url': DOMAIN + '/sport-pools.html', 'en_url': DOMAIN + '/en/sport-pools.html'},
    'sport-palaces.html': {'en': 'sport-palaces.html', 'ru_url': DOMAIN + '/sport-palaces.html', 'en_url': DOMAIN + '/en/sport-palaces.html'},
    'sport-ice.html': {'en': 'sport-ice.html', 'ru_url': DOMAIN + '/sport-ice.html', 'en_url': DOMAIN + '/en/sport-ice.html'},
    'sport-complexes.html': {'en': 'sport-complexes.html', 'ru_url': DOMAIN + '/sport-complexes.html', 'en_url': DOMAIN + '/en/sport-complexes.html'},
    'edu-planetarium.html': {'en': 'edu-planetarium.html', 'ru_url': DOMAIN + '/edu-planetarium.html', 'en_url': DOMAIN + '/en/edu-planetarium.html'},
    'edu-lecture.html': {'en': 'edu-lecture.html', 'ru_url': DOMAIN + '/edu-lecture.html', 'en_url': DOMAIN + '/en/edu-lecture.html'},
    'edu-assembly.html': {'en': 'edu-assembly.html', 'ru_url': DOMAIN + '/edu-assembly.html', 'en_url': DOMAIN + '/en/edu-assembly.html'},
    'theatres.html': {'en': 'theatres.html', 'ru_url': DOMAIN + '/theatres.html', 'en_url': DOMAIN + '/en/theatres.html'},
    'outdoor.html': {'en': 'outdoor.html', 'ru_url': DOMAIN + '/outdoor.html', 'en_url': DOMAIN + '/en/outdoor.html'},
    'museums.html': {'en': 'museums.html', 'ru_url': DOMAIN + '/museums.html', 'en_url': DOMAIN + '/en/museums.html'},
    'leisure.html': {'en': 'leisure.html', 'ru_url': DOMAIN + '/leisure.html', 'en_url': DOMAIN + '/en/leisure.html'},
    'dk.html': {'en': 'dk.html', 'ru_url': DOMAIN + '/dk.html', 'en_url': DOMAIN + '/en/dk.html'},
    'concert-halls.html': {'en': 'concert-halls.html', 'ru_url': DOMAIN + '/concert-halls.html', 'en_url': DOMAIN + '/en/concert-halls.html'},
    'circus.html': {'en': 'circus.html', 'ru_url': DOMAIN + '/circus.html', 'en_url': DOMAIN + '/en/circus.html'},
    'rental.html': {'en': 'rental.html', 'ru_url': DOMAIN + '/rental.html', 'en_url': DOMAIN + '/en/rental.html'},
    'entertainment.html': {'en': 'entertainment.html', 'ru_url': DOMAIN + '/entertainment.html', 'en_url': DOMAIN + '/en/entertainment.html'},
    'religious.html': {'en': 'religious.html', 'ru_url': DOMAIN + '/religious.html', 'en_url': DOMAIN + '/en/religious.html'},
    'hospitality.html': {'en': 'hospitality.html', 'ru_url': DOMAIN + '/hospitality.html', 'en_url': DOMAIN + '/en/hospitality.html'},
    'corporate.html': {'en': 'corporate.html', 'ru_url': DOMAIN + '/corporate.html', 'en_url': DOMAIN + '/en/corporate.html'},
    'sport.html': {'en': 'sport.html', 'ru_url': DOMAIN + '/sport.html', 'en_url': DOMAIN + '/en/sport.html'},
    'education.html': {'en': 'education.html', 'ru_url': DOMAIN + '/education.html', 'en_url': DOMAIN + '/en/education.html'},
    'culture.html': {'en': 'culture.html', 'ru_url': DOMAIN + '/culture.html', 'en_url': DOMAIN + '/en/culture.html'},
    'application.html': {'en': 'application.html', 'ru_url': DOMAIN + '/application.html', 'en_url': DOMAIN + '/en/application.html'},
}

CYR = re.compile('[А-Яа-яЁё]')
ATTRS = ('alt', 'title', 'aria-label', 'placeholder', 'content')


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


data = json.load(open(os.path.join(os.path.dirname(__file__), 'en.json'), encoding='utf-8'))
DICT = {norm(k): v for k, v in data['strings'].items()}
PATS = [(re.compile(p['re']), p['en'], p.get('tr', [])) for p in data['patterns']]
missing = []


def tr(s):
    """Перевод фразы целиком; None — перевода нет."""
    k = norm(s)
    if k in DICT:
        return DICT[k]
    for rx, tpl, groups in PATS:
        m = rx.match(k)
        if m:
            out = tpl
            for i in range(len(m.groups()), 0, -1):
                g = m.group(i) or ''
                if i in groups:
                    t = tr(g)
                    g = t if t is not None else g
                out = out.replace('$' + str(i), g)
            return out
    return None


def tr_keep_space(s, where):
    if not CYR.search(s):
        return s
    t = tr(s)
    if t is None:
        missing.append((where, norm(s)))
        return s
    lead = s[:len(s) - len(s.lstrip())]
    tail = s[len(s.rstrip()):]
    return lead + t + tail


def esc_attr(s):
    return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def unesc(s):
    return s.replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>').replace('&#39;', "'").replace('&amp;', '&')


def translate_markup(part):
    part = re.sub(r'<!--.*?-->', '', part, flags=re.S)  # служебные комментарии (по-русски) в английскую копию не берём
    part = re.sub(r'>([^<>]+)<', lambda m: '>' + tr_keep_space(m.group(1), 'текст') + '<', part)

    def attr(m):
        v = unesc(m.group(3))
        if not CYR.search(v):
            return m.group(0)
        t = tr(v)
        if t is None:
            missing.append(('атрибут ' + m.group(2), norm(v)))
            return m.group(0)
        return m.group(1) + m.group(2) + '="' + esc_attr(t) + '"'
    return re.sub(r'(\s)(' + '|'.join(ATTRS) + r')="([^"]*)"', attr, part)


def translate_script(body):
    def lit(m):
        q = m.group(1)
        v = m.group(2)
        if not CYR.search(v):
            return m.group(0)
        t = tr(v.replace('\\' + q, q))
        if t is None:
            return m.group(0)  # комментарии и служебные строки скриптов не переводим
        t = t.replace('\\', '\\\\').replace(q, '\\' + q)
        return q + t + q
    return re.sub(r'(["\'])((?:(?!\1)[^\\\n]|\\.)*)\1', lit, body)


def lang_block(ru_file, info, cur):
    other = ('./en/' + info['en']) if cur == 'ru' else ('./' + ru_file)
    return ('<!-- lang:start (собирается tools/i18n/build_en.py) -->\n'
            '<link rel="alternate" hreflang="ru" href="' + info['ru_url'] + '">\n'
            '<link rel="alternate" hreflang="en" href="' + info['en_url'] + '">\n'
            '<link rel="alternate" hreflang="x-default" href="' + info['ru_url'] + '">\n'
            '<meta name="ds-lang-alt" content="' + other + '" data-lang="' + ('en' if cur == 'ru' else 'ru') + '">\n'
            '<!-- lang:end -->')


def set_lang_block(s, block):
    s = re.sub(r'\n?<!-- lang:start.*?<!-- lang:end -->', '', s, flags=re.S)
    return s.replace('<!-- seo:end -->', '<!-- seo:end -->\n' + block, 1) if '<!-- seo:end -->' in s \
        else s.replace('</head>', block + '\n</head>', 1)


RU_SW = '<a class="lang-sw" href="{href}" hreflang="en" lang="en" title="English version">EN</a>'
EN_SW = '<a class="lang-sw" href="./{href}" hreflang="ru" lang="ru" title="Russian version">RU</a>'


def add_switch(s, sw):
    """Переключатель в шапку русской страницы: кружок в левой колонке, сразу за знаком ГИСП (на английской
    странице знак скрыт, и кружок остаётся у левого края). Если переключатель уже есть — ничего не меняем."""
    mark = '<a href="./gov.html" aria-label="ГИСП — госучреждениям"'
    if 'class="lang-sw"' in s or mark not in s:
        return s
    i = s.index('</a>', s.index(mark)) + len('</a>')
    return s[:i] + '\n        ' + sw + s[i:]


def build(ru_file, info):
    src_path = os.path.join(SITE, ru_file)
    s = open(src_path, encoding='utf-8').read()

    # 1) русская страница: блок hreflang и адрес для переключателя
    s_ru = set_lang_block(s, lang_block(ru_file, info, 'ru'))
    s_ru = add_switch(s_ru, RU_SW.format(href='./en/' + info['en']))
    if s_ru != s:
        open(src_path, 'w', encoding='utf-8').write(s_ru)
    s = re.sub(r'\n?<!-- lang:start.*?<!-- lang:end -->', '', s_ru, flags=re.S)

    # 2) английская копия: переключатель языка
    s = s.replace(RU_SW.format(href='./en/' + info['en']), EN_SW.format(href='__RU_HREF__'))

    # 3) перевод: разметка отдельно, встроенные скрипты и стили отдельно
    out = []
    for chunk in re.split(r'(?s)(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)', s):
        if chunk.startswith('<script'):
            out.append(translate_script(chunk))
        elif chunk.startswith('<style'):
            out.append(chunk)
        else:
            out.append(translate_markup(chunk))
    s = ''.join(out)

    # 4) язык, адреса, ссылки на уже переведённые страницы, подключение en.css и i18n-en.js
    s = s.replace('<html lang="ru">', '<html lang="en">', 1)
    s = s.replace('<head>', '<head>\n<base href="../">', 1)
    s = s.replace('<link rel="canonical" href="' + info['ru_url'] + '">', '<link rel="canonical" href="' + info['en_url'] + '">')
    s = s.replace('<meta property="og:url" content="' + info['ru_url'] + '">', '<meta property="og:url" content="' + info['en_url'] + '">')
    s = s.replace('<meta property="og:locale" content="ru_RU">', '<meta property="og:locale" content="en_US">')
    s = s.replace('"url": "' + info['ru_url'] + '", "inLanguage": "ru"', '"url": "' + info['en_url'] + '", "inLanguage": "en"')
    for rf, inf in PAGES.items():
        s = re.sub(r'href="(?:\./)?' + re.escape(rf) + r'(?=[#"?])', 'href="./en/' + inf['en'], s)
    s = s.replace('<!-- seo:end -->', '', 1)
    s = s.replace('<base href="../">', '<base href="../">\n' + lang_block(ru_file, info, 'en') +
                  '\n<link rel="stylesheet" href="./en/en.css">\n<script src="./en/i18n-en.js"></script>', 1)
    s = s.replace('./__RU_HREF__', './' + ru_file)
    # плашка «trust», текст которой в английской версии убран (реестр Минпромторга), остаётся пустой — убираем целиком
    s = re.sub(r'\s*<div class="trust reveal"><i class="glow-dot"[^>]*></i></div>', '', s)
    os.makedirs(EN_DIR, exist_ok=True)
    open(os.path.join(EN_DIR, info['en']), 'w', encoding='utf-8').write(s)


def build_runtime():
    links = {('./' + rf): ('./en/' + inf['en']) for rf, inf in PAGES.items()}
    links.update({rf: ('./en/' + inf['en']) for rf, inf in PAGES.items()})
    js = open(os.path.join(os.path.dirname(__file__), 'i18n-runtime.js'), encoding='utf-8').read()
    js = js.replace('/*DICT*/{}', json.dumps(DICT, ensure_ascii=False, separators=(',', ':'), sort_keys=True))
    js = js.replace('/*PATS*/[]', json.dumps([[p['re'], p['en'], p.get('tr', [])] for p in data['patterns']], ensure_ascii=False))
    js = js.replace('/*LINKS*/{}', json.dumps(links))
    open(os.path.join(EN_DIR, 'i18n-en.js'), 'w', encoding='utf-8').write(js)


if __name__ == '__main__':
    for ru_file, info in PAGES.items():
        build(ru_file, info)
    build_runtime()
    seen = []
    for w, t in missing:
        if (w, t) not in seen:
            seen.append((w, t))
    print('Английских страниц: %d. Нет в словаре: %d' % (len(PAGES), len(seen)))
    for w, t in seen:
        print('  [%s] %s' % (w, t[:160]))
    sys.exit(0)
