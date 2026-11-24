# -*- coding: utf-8 -*-
"""Собирает один самостоятельный HTML-файл страницы «ПО для управления DSP» для отправки
(картинки, шрифты, стили и скрипты внутри файла, открывается без сайта).
Запуск: python3 tools/software-dsp/standalone.py <куда сохранить.html>
"""
import os, re, sys, base64, mimetypes

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
html = open(os.path.join(SITE, 'software-dsp.html'), encoding='utf-8').read()

MIME = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png',
        '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf'}

def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    b = open(path, 'rb').read()
    return 'data:%s;base64,%s' % (MIME.get(ext, mimetypes.guess_type(path)[0] or 'application/octet-stream'),
                                  base64.b64encode(b).decode())

def local(rel, base=SITE):
    rel = rel.split('?')[0].split('#')[0]
    p = os.path.normpath(os.path.join(base, rel))
    return p if os.path.isfile(p) else None

def inline_css(css, base):
    def rep(m):
        u = m.group(1).strip('\'"')
        if u.startswith(('data:', 'http', '#')):
            return m.group(0)
        p = local(u, base)
        return 'url("%s")' % data_uri(p) if p else m.group(0)
    return re.sub(r'url\(([^)]+)\)', rep, css)

# служебное, что без сайта не нужно: счётчик, cookie, предзагрузка, SEO-канон
html = re.sub(r'<script src="\./(metrika|cookie)\.js"[^>]*></script>\n?', '', html)
html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?', '', html)

def css_link(m):
    p = local(m.group(1))
    if not p:
        return m.group(0)
    return '<style>\n%s\n</style>' % inline_css(open(p, encoding='utf-8').read(), os.path.dirname(p))
html = re.sub(r'<link rel="stylesheet" href="\./([^"]+)">', css_link, html)

def js_link(m):
    p = local(m.group(1))
    if not p:
        return m.group(0)
    return '<script>\n%s\n</script>' % open(p, encoding='utf-8').read().replace('</script', '<\\/script')
html = re.sub(r'<script src="\./([^"]+)"[^>]*></script>', js_link, html)

# картинки и ссылки на скриншоты — внутрь файла; кроме того, скриншоты одинаковые: кодируем один раз
cache = {}
def uri(rel):
    if rel not in cache:
        p = local(rel)
        cache[rel] = data_uri(p) if p else None
    return cache[rel]

def img_src(m):
    u = uri(m.group(2))
    return '%s"%s"' % (m.group(1), u) if u else m.group(0)
html = re.sub(r'(<img[^>]*?\ssrc=)"\./([^"]+)"', img_src, html)
# ссылка «открыть в полном размере» — открывает ту же картинку, без второй копии в файле
html = re.sub(r'<a class="dsp-zoom" href="[^"]*" target="_blank" rel="noopener"', '<a class="dsp-zoom" href="#"', html)
LB = """<div id="dspLb" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(5,6,8,.92);cursor:zoom-out;overflow:auto;padding:24px;box-sizing:border-box"><img style="display:block;max-width:100%;height:auto;margin:auto"></div>
<script>(function(){var lb=document.getElementById('dspLb'),im=lb.querySelector('img');
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.dsp-zoom');if(!a)return;e.preventDefault();im.src=a.querySelector('img').src;lb.style.display='flex';});
lb.addEventListener('click',function(){lb.style.display='none';});document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.style.display='none';});})();</script>
"""
html = html.replace('</body>', LB + '</body>', 1)
# inline style url(./…)
html = re.sub(r'url\((["\']?)\./([^)"\']+)\1\)', lambda m: 'url("%s")' % (uri(m.group(2)) or './' + m.group(2)), html)
# картинки, на которые ссылаются скрипты строками './assets/…'
html = re.sub(r"(['\"])\./(assets/[^'\"]+\.(?:png|svg|jpg|webp))\1", lambda m: m.group(1) + (uri(m.group(2)) or './' + m.group(2)) + m.group(1), html)
# остальные относительные ссылки — на сайт
html = re.sub(r'href="\./([^"#][^"]*)"', r'href="https://ds-proaudio.ru/\1"', html)

out = sys.argv[1]
open(out, 'w', encoding='utf-8').write(html)
print(out, round(len(html) / 1024 / 1024, 1), 'МБ', 'осталось ./ :', len(re.findall(r'(src|href)="\./', html)))
