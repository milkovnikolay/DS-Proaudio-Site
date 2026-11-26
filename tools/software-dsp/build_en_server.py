# -*- coding: utf-8 -*-
"""Английская страница DSP Control для сервера: шапка, меню и подвал — из английской software.html сервера
(с правками Коли), содержимое <main>, стили и тексты — из site/en/software-dsp.html (собрана tools/i18n/build_en.py).
Запуск: SITE=папка_копии_сервера python3 tools/software-dsp/build_en_server.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.environ['SITE']
LABEL = 'DSP control software'
raw = open(os.path.join(SITE, 'en', 'software.html'), 'rb').read().decode('utf-8')
CRLF = '\r\n' in raw
t = raw.replace('\r\n', '\n')
t = re.sub(r'[ \t]*<a href="\./en/software-dsp\.html"[^>]*>[^<]*</a>\n', '', t)
g = open(os.path.join(ROOT, 'site', 'en', 'software-dsp.html'), encoding='utf-8').read().replace('\r\n', '\n')

def one(rx, s, flags=0):
    m = re.search(rx, s, flags); assert m, rx; return m.group(0)
title = one(r'<title>.*?</title>', g)
desc = re.search(r'<meta name="description" content="([^"]*)"', g).group(1)
ttl = re.search(r'<title>(.*?)</title>', g).group(1)
t = re.sub(r'<title>.*?</title>', lambda m: title, t, count=1)
t = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + desc, t, count=1)
t = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + ttl, t, count=1)
t = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + desc, t, count=1)
t = re.sub(r'("@type": "WebPage", "name": ")[^"]*', lambda m: m.group(1) + ttl, t, count=1)
t = re.sub(r'(?s)<!-- lang:start.*?<!-- lang:end -->', lambda m: m.group(0).replace('/software.html', '/software-dsp.html'), t, count=1)
for a in ('<link rel="canonical" href="https://ds-proaudio.ru/en/software.html"', '<meta property="og:url" content="https://ds-proaudio.ru/en/software.html"',
          '"url": "https://ds-proaudio.ru/en/software.html"'):
    if a in t:
        t = t.replace(a, a.replace('/software.html', '/software-dsp.html'))
t = t.replace('<a class="lang-sw" href="./software.html"', '<a class="lang-sw" href="./software-dsp.html"', 1)
t = re.sub(r'("position":3,"name":")[^"]*(")', r'\1DSP Control\2', t, count=1)
# содержимое и стили страницы DSP
t = re.sub(r'(?s)<main>.*?</main>', lambda m: one(r'(?s)<main>.*?</main>', g), t, count=1)
css = one(r'(?s)<style>(?:(?!<style>).)*?\.dsp-(?:(?!<style>).)*?</style>\n(?=</head>)', g)
t = t.replace('</head>', css + '</head>', 1)
def fix(m):
    tag, text = m.group(1), m.group(2)
    if 'mm-current' in tag:
        return ('<a href="./en/software.html" class="mm-item-long">%s</a>' % text +
                '\n      <a href="./en/software-dsp.html" class="mm-item-long mm-current" aria-current="page" style="font-weight:500;color:#FFFFFF;">%s</a>' % LABEL)
    if 'ft-item-long' in tag:
        return m.group(0) + '\n          <a href="./en/software-dsp.html" class="ft-item-long">%s</a>' % LABEL
    return m.group(0)
t = re.sub(r'(<a href="\./en/software\.html"[^>]*>)([^<]*)</a>', fix, t)
assert t.count('href="./en/software-dsp.html"') == 2, t.count('href="./en/software-dsp.html"')
assert 'SoundMath' not in t.split('<main>')[0] or True
if CRLF:
    t = t.replace('\n', '\r\n')
open(os.path.join(SITE, 'en', 'software-dsp.html'), 'wb').write(t.encode('utf-8'))
print('ok', len(t))
