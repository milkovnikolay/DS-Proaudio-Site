# -*- coding: utf-8 -*-
"""Добавляет пункт «Приложение для управления DSP» в меню и подвал всех русских страниц —
сразу после пункта про ПО/приложение для акустических расчётов (software.html).
Повторный запуск ничего не меняет. Переводы строк (CRLF/LF) каждого файла сохраняются.
Английские страницы (en/) не трогаем: английской версии страницы пока нет.
Запуск: SITE=папка_сайта python3 tools/software-dsp/add_menu.py
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.environ.get('SITE') or os.path.join(ROOT, 'site')
LABEL = 'Приложение для управления DSP'
LINK = re.compile(r'([ \t]*)<a href="\./software\.html"([^>]*)>[^<]*</a>')

changed = 0
for path in sorted(glob.glob(os.path.join(SITE, '*.html'))):
    name = os.path.basename(path)
    if name == 'software-dsp.html':
        continue
    raw = open(path, 'rb').read()
    text = raw.decode('utf-8')
    if 'software-dsp.html' in text:
        continue
    nl = '\r\n' if '\r\n' in text else '\n'

    def add(m):
        indent, attrs = m.group(1), m.group(2)
        cls = re.search(r'class="([^"]*)"', attrs)
        if not cls or not ({'mm-item-long', 'ft-item-long'} & set(cls.group(1).split())):
            return m.group(0)
        # тот же вид ссылки, но без «текущей страницы»
        new_attrs = re.sub(r'\s*aria-current="[^"]*"', '', attrs)
        new_attrs = re.sub(r'\s*style="[^"]*"', '', new_attrs)
        new_attrs = new_attrs.replace(' mm-current', '')
        return m.group(0) + nl + indent + '<a href="./software-dsp.html"%s>%s</a>' % (new_attrs, LABEL)

    new = LINK.sub(add, text)
    if new != text:
        open(path, 'wb').write(new.encode('utf-8'))
        changed += 1

# карта сайта: новая страница рядом с software.html
sm = os.path.join(SITE, 'sitemap.xml')
if os.path.exists(sm):
    t = open(sm, 'rb').read().decode('utf-8')
    if 'software-dsp.html' not in t:
        m = re.search(r'([ \t]*)<url>(?:(?!</url>).)*?<loc>https://ds-proaudio\.ru/software\.html</loc>(?:(?!</url>).)*?</url>', t, re.S)
        if m:
            nl = '\r\n' if '\r\n' in t else '\n'
            block = m.group(0)
            # английская пара hreflang у новой страницы не нужна
            block = re.sub(r'\s*<xhtml:link[^>]*hreflang="(en|x-default)"[^>]*/>', '', block)
            block = block.replace('/software.html', '/software-dsp.html')
            block = re.sub(r'<lastmod>[^<]*</lastmod>', '<lastmod>2026-11-25</lastmod>', block)
            t = t[:m.end()] + nl + block + t[m.end():]
            open(sm, 'wb').write(t.encode('utf-8'))
            changed += 1
print('изменено файлов:', changed)
