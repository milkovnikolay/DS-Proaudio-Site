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
