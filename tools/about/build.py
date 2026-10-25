# -*- coding: utf-8 -*-
"""DS PROAUDIO — страница «Компания в цифрах» (about.html), 25.10.2026.
План Коли, раздел 2: страница «О компании» с фактами для поиска и нейросетей (год, производство, патенты, реестр, объекты, адреса).

Запуск из корня репозитория:  python3 tools/about/build.py
Шапка, подвал и базовые стили берутся из gov.html, содержимое — из блока ниже. Цифры — только те, что уже есть на сайте:
production.html (цеха, площадки, команда), history.html (2019), technologies.html (патенты), gov.html (реестр),
portfolio.html (объекты), warranty.html (гарантия), contacts.html (адреса).
Реквизиты юрлица ждут данных: секция #requisites скрыта (hidden), пока REQUISITES пуст."""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
SRC, PAGE = os.path.join(SITE, 'gov.html'), os.path.join(SITE, 'about.html')

def esc(s): return html.escape(s, quote=True)

data = json.load(open(os.path.join(SITE, 'assets/products/products.json'), encoding='utf-8'))
GISP = sum(1 for p in data['products'].values() if len(p.get('gisp') or []) == 1 and not p.get('variantOf')
           and re.match(r'(ERA|PILLAR|PLR|CX|MCX)', p['name'].upper()))
pf = open(os.path.join(SITE, 'portfolio.html'), encoding='utf-8').read()
OBJECTS = re.search(r'id="pfShown">(\d+)<', pf).group(1)

TITLE = 'Компания в цифрах — DS PROAUDIO'
DESC = ('DS PROAUDIO — российский производитель профессиональной акустики: с 2019 года, 12 собственных цехов в Санкт-Петербурге '
        'и Ленинградской области, 3 патента, ' + str(GISP) + ' моделей в реестре ГИСП, ' + OBJECTS + ' объектов.')

# (подпись, значение, пояснение, ссылка)
FACTS = [
  ('Бренд', 'с 2019 года', 'Совместный проект компаний «Специальные Звуковые Технологии» и «Дип Саунд». Опыт команды в акустике — с 1990-х.', './history.html'),
  ('Производство', '12 собственных цехов', 'Две площадки: Санкт-Петербург и Ленинградская область. Корпуса, динамики, ВЧ-драйверы, волноводы и электроника — свои.', './production.html'),
  ('Команда', 'более 40 сотрудников', 'Конструкторы, инженеры, сборщики и сервис — каждую систему делают наши люди.', './faces.html'),
  ('Патенты', '3 патента', '№ 208011 «Объединяемый коаксиальный динамик», № 2786503 «Объединяемый излучатель звука», № 2835362 «Двухполосный элемент линейного массива».', './technologies.html'),
  ('Реестр ГИСП', str(GISP) + ' моделей', 'Серии ERA-i, PILLAR, CX и MCX в реестре российской промышленной продукции Минпромторга.', './gov.html#registry'),
  ('Объекты', OBJECTS + ' в портфолио', 'Театры, школы и вузы, стадионы, храмы, рестораны, гостиницы и концертные площадки по всей России.', './portfolio.html'),
  ('Гарантия', '3 года', 'Сервисные центры в Москве и Санкт-Петербурге.', './warranty.html'),
]

PLACES = [
  ('Москва', 'Офис и сервисный центр', 'Остаповский проезд, д. 3с8', 'Пн–Пт, 10:00–19:00 (МСК)'),
  ('Москва', 'Шоу-рум', '2-й Донской проезд, 4', 'По предварительной записи'),
  ('Санкт-Петербург', 'Сервисный центр и производство', 'ул. Парковая, 4Д', 'Пн–Пт, 10:00–19:00 (МСК)'),
]

# Реквизиты юрлица: [('Полное наименование', '…'), ('ИНН', '…'), …]. Пока пусто — секция скрыта.
REQUISITES = []

STYLE = """<style>
  .ac-sec{background:#FFFFFF}
  .ac-sec.ac-alt{background:#FAFAFA}
  .ac-in{padding-top:110px;padding-bottom:110px}
  .ac-head{display:flex;flex-direction:column;gap:18px;max-width:760px;margin-bottom:44px}
  .ac-facts{list-style:none;margin:0;padding:0;border-top:1px solid #141414}
  .ac-facts li{display:grid;grid-template-columns:200px 300px minmax(0,1fr) 40px;gap:24px;align-items:baseline;padding:24px 0;border-bottom:1px solid #E6E6E6}
  .ac-k{font-family:'PT Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8A8A8A}
  .ac-v{font-family:'Montserrat',sans-serif;font-weight:700;font-size:24px;line-height:1.25;color:#141414}
  .ac-t{font-size:16px;line-height:1.6;color:#5A5A5A}
  .ac-go{justify-self:end;font-size:20px;color:#ADADAD;transition:color .2s}
  .ac-facts li:hover .ac-go{color:#141414}
  .ac-places{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .ac-pl{padding:28px 26px;border:1px solid #E6E6E6;border-radius:16px;background:#FFFFFF;display:flex;flex-direction:column;gap:8px}
  .ac-pl b{font-family:'PT Mono',monospace;font-weight:400;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#ADADAD}
  .ac-pl h3{margin:4px 0 0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:18px;color:#141414}
  .ac-pl p{margin:0;font-size:15px;line-height:1.6;color:#5A5A5A}
  .ac-reach{display:flex;flex-wrap:wrap;gap:12px 36px;margin-top:32px;font-size:16px}
  .ac-reach a{color:#141414;border-bottom:1px solid #D0D0D0}
  .ac-reach a:hover{border-color:#141414}
  .ac-req{margin:0;display:grid;grid-template-columns:260px minmax(0,1fr);max-width:900px;border-top:1px solid #141414}
  .ac-req dt,.ac-req dd{margin:0;padding:14px 0;border-bottom:1px solid #E6E6E6;font-size:15px}
  .ac-req dt{color:#8A8A8A}
  .ac-req dd{font-family:'PT Mono',monospace;color:#141414}
  @media (max-width:1100px){.ac-facts li{grid-template-columns:160px minmax(0,1fr) 30px}.ac-t{grid-column:2/3}.ac-go{grid-row:1}.ac-places{grid-template-columns:1fr}}
  @media (max-width:700px){.ac-in{padding-top:72px;padding-bottom:72px}.ac-facts li{grid-template-columns:minmax(0,1fr) 24px;gap:6px 12px;padding:20px 0}
    .ac-k,.ac-v,.ac-t{grid-column:1/2}.ac-go{grid-column:2/3;grid-row:1/3;align-self:center}.ac-v{font-size:20px}.ac-req{grid-template-columns:1fr}.ac-req dt{padding-bottom:0;border:0}}
</style>"""

def facts():
    return '\n'.join('      <li class="reveal"><span class="ac-k">' + esc(k) + '</span><a class="ac-v" href="' + esc(h) + '">' + esc(v) +
                     '</a><span class="ac-t">' + esc(t) + '</span><a class="ac-go" href="' + esc(h) + '" aria-label="' + esc(k) + ' — подробнее">→</a></li>'
                     for k, v, t, h in FACTS)

def places():
    return '\n'.join('      <div class="ac-pl reveal"><b>' + esc(c) + '</b><h3>' + esc(r) + '</h3><p>' + esc(a) + '</p><p>' + esc(t) + '</p></div>'
                     for c, r, a, t in PLACES)

def requisites():
    rows = ''.join('<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>' for k, v in REQUISITES)
    return ('<section class="ac-sec ac-alt" id="requisites"' + ('' if REQUISITES else ' hidden') + '>\n  <div class="wrap ac-in">\n'
            '    <div class="ac-head reveal"><div class="kicker">Для договора</div><h2 class="h2">Реквизиты</h2></div>\n'
            '    <dl class="ac-req reveal">' + rows + '</dl>\n  </div>\n</section>')

MAIN = """<main>

<!-- ================= ЗАГОЛОВОК РАЗДЕЛА ================= -->
<section class="hub-hero">
  <div class="wrap" style="position:relative;z-index:2;padding-top:140px;padding-bottom:80px;display:flex;flex-direction:column;gap:44px;">
    <nav aria-label="Навигационная цепочка">
      <ol class="crumbs">
        <li><a href="./Main.dc.html">Главная</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li aria-current="page">Компания в цифрах</li>
      </ol>
    </nav>
    <div style="display:flex;flex-direction:column;gap:24px;max-width:900px;">
      <div class="kicker" style="color:#C8C8C8;">О компании</div>
      <h1 class="h1" style="margin:0;font-family:'Montserrat',sans-serif;font-weight:500;font-size:72px;line-height:1.05;color:#FAFAFA;">Компания в цифрах</h1>
      <div style="max-width:680px;font-size:22px;line-height:1.5;color:#D8D8D8;">DS PROAUDIO — российский производитель профессиональной акустики полного цикла: от динамика до готовой системы на объекте.</div>
    </div>
  </div>
</section>

<!-- about:start — страница собирается tools/about/build.py, правки вносить туда -->
""" + STYLE + """
<section class="ac-sec" id="facts">
  <div class="wrap ac-in">
    <div class="ac-head reveal">
      <div class="kicker">Коротко</div>
      <h2 class="h2">Главное о DS PROAUDIO</h2>
    </div>
    <ul class="ac-facts">
""" + facts() + """
    </ul>
  </div>
</section>

<section class="ac-sec ac-alt" id="places">
  <div class="wrap ac-in">
    <div class="ac-head reveal">
      <div class="kicker">Где мы</div>
      <h2 class="h2">Адреса</h2>
    </div>
    <div class="ac-places">
""" + places() + """
    </div>
    <div class="ac-reach reveal"><a href="tel:+74951501238">+7 495 150-12-38</a><a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a><a href="./contacts.html">Все контакты →</a></div>
  </div>
</section>

""" + requisites() + """
<!-- about:end -->

</main>"""

src = open(SRC, encoding='utf-8').read()
head, rest = src.split('<main>', 1)
foot = rest.split('</main>', 1)[1]
head = re.sub(r'<title>.*?</title>', '<title>' + esc(TITLE) + '</title>', head, count=1)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + esc(DESC) + '">', head, count=1)
head = head.replace('"name":"Госучреждениям"}', '"name":"Компания в цифрах"}')
head = re.sub(r'<!-- seo:start -->.*?<!-- seo:end -->\n', '', head, flags=re.S)   # пересоберёт tools/seo/build_seo.py
out = head + MAIN + foot
out = out.replace('aria-label="ГИСП — госучреждениям" style="display:flex;align-items:center;" aria-current="page"', 'aria-label="ГИСП — госучреждениям" style="display:flex;align-items:center;"')
out = out.replace('class="ft-heading" aria-current="page">Госучреждениям', 'class="ft-heading">Госучреждениям')
out = out.replace('<a href="./about.html" class="mm-item">', '<a href="./about.html" class="mm-item mm-current" aria-current="page" style="font-weight:500;color:#FFFFFF;">')
open(PAGE, 'w', encoding='utf-8').write(out)
print('about.html: фактов', len(FACTS), '· реестр', GISP, '· объектов', OBJECTS, '· реквизиты', 'есть' if REQUISITES else 'скрыты')
