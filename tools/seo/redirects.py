# -*- coding: utf-8 -*-
"""DS PROAUDIO — 301-редиректы со старого сайта ds-proaudio.ru (Битрикс) на новые страницы
(план Коли, раздел 3.2: «карта 301-редиректов, чтобы не потерять позиции в поиске»), 25.10.2026.

Запуск из корня репозитория:  python3 tools/seo/redirects.py
Пишет блок между «# ---- redirects:start» и «# ---- redirects:end» в site/.htaccess (повторный запуск заменяет блок).
Источник адресов карточек — поле source в products.json (адрес товара на старом сайте)."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_seo import PRODUCTS, product_id, read, write

# разделы старого сайта → новые страницы
SECTIONS = {
  'catalog': 'products.html',
  'catalog/aksessuary': 'products-accessories.html',
  'catalog/seria-era': 'series-era.html',
  'catalog/seriya-era': 'series-era-i.html',
  'catalog/seriya-ant': 'series-ant.html',
  'catalog/seriya-cx': 'series-cx.html',
  'catalog/seriya-monitor': 'products-monitors.html',
  'catalog/seriya-plr': 'series-pillar.html',
  'catalog/seriya-taura': 'series-taura.html',
  'catalog/usiliteli': 'series-da.html',
  'company': 'history.html',
  'company/istoriya-brenda': 'history.html',
  'company/otzyvy': 'reviews.html',
  'company/tekhnologii': 'technologies.html',
  'company/tekhnologii/proizvodstvo-nashikh-dinamikov': 'production.html',
  'company/tekhnologii/zvykovie-katushki': 'tech-voice-coil.html',
  'company/vacancies': 'contacts.html',
  'contacts': 'contacts.html',
  'news': 'blog.html',
  'portfolio': 'portfolio.html',
  'services': 'where-to-buy.html',
  'show-room': 'showroom.html',
  'support': 'support.html',
  'support/dokumentatsiya': 'docs.html',
  'support/servis': 'warranty.html',
  'agreement': 'consent.html',
}


def main():
    pages = {}
    for fn in sorted(os.listdir(SITE)):
        if fn.startswith('p-') and fn.endswith('.html'):
            pid = product_id(fn, read(os.path.join(SITE, fn)))
            if pid: pages.setdefault(pid, fn)
    rules = {}
    for old, new in SECTIONS.items():
        if os.path.exists(os.path.join(SITE, new)): rules[old] = new
    for pid, p in PRODUCTS.items():
        m = re.match(r'https?://(?:www\.)?ds-proaudio\.ru/(catalog/[^\s"]+?)/?$', p.get('source') or '')
        if m and pid in pages: rules[m.group(1)] = pages[pid]
    lines = ['# ---- redirects:start — старые адреса ds-proaudio.ru → новые страницы (tools/seo/redirects.py) ----']
    for old in sorted(rules, key=lambda k: (-k.count('/'), k)):
        lines.append('RewriteRule ^' + re.escape(old).replace('\\-', '-').replace('\\/', '/') + '/?$ /' + rules[old] + ' [R=301,L]')
    lines.append('# ---- redirects:end ----')
    block = '\n'.join(lines)
    path = os.path.join(SITE, '.htaccess'); s = read(path)
    s = re.sub(r'# ---- redirects:start.*?# ---- redirects:end ----\n?', '', s, flags=re.S)
    anchor = '# ---- Приём заявок с форм'
    assert anchor in s
    s = s.replace(anchor, block + '\n' + anchor, 1)
    write(path, s)
    print('редиректов:', len(rules))

if __name__ == '__main__':
    main()
