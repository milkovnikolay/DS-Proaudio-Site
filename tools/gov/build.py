# -*- coding: utf-8 -*-
"""DS PROAUDIO — наполнение страницы «Госучреждениям» (gov.html), 25.10.2026.
План Коли, раздел 2.2: «страница gov.html почти пустая — номера реестровых записей, 44-ФЗ / 223-ФЗ, порядок получения ТКП».

Запуск из корня репозитория:  python3 tools/gov/build.py
Вставляет блок между <!-- gov:start --> и <!-- gov:end --> перед формой (повторный запуск заменяет блок).
Номера реестровых записей берутся из products.json (поле gisp), поэтому при новых записях достаточно перезапустить."""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
PAGE = os.path.join(SITE, 'gov.html')

data = json.load(open(os.path.join(SITE, 'assets/products/products.json'), encoding='utf-8'))
P = data['products']
SERIES = [('ERA-i', 'Линейные массивы'), ('PILLAR', 'Звуковые колонны'), ('CX', 'Точечные источники и сабвуферы'), ('MCX', 'Сценические мониторы')]

def esc(s): return html.escape(s, quote=True)

def page_of(pid):
    for stem in (pid.replace('ds-proaudio-', ''), pid.replace('new-', '')):
        if os.path.exists(os.path.join(SITE, 'p-' + stem + '.html')): return 'p-' + stem + '.html'
    return None

def series_of(p):
    s = (p.get('series') or '').upper()
    for key, _ in SERIES:
        if s.startswith(key.upper()) or p['name'].upper().startswith(key.upper()): return key
    if p['name'].upper().startswith('PLR'): return 'PILLAR'
    return None

rows = {k: [] for k, _ in SERIES}
for pid, p in P.items():
    g = p.get('gisp') or []
    if len(g) != 1 or p.get('variantOf'): continue          # комплекты (два номера) и цветовые варианты не дублируем
    ser = series_of(p)
    if ser: rows[ser].append((p['name'], g[0], page_of(pid)))
total = sum(len(v) for v in rows.values())

def table():
    out = []
    for key, title in SERIES:
        if not rows[key]: continue
        out.append('<div class="gv-ser"><div class="gv-ser-h">' + esc(key) + ' <span>' + esc(title) + '</span></div><ul class="gv-list">')
        for name, num, href in sorted(rows[key], key=lambda r: r[0]):
            nm = '<a href="./' + href + '">' + esc(name) + '</a>' if href else esc(name)
            out.append('<li><span class="gv-m">' + nm + '</span><span class="gv-n">№ ' + esc(num) + '</span></li>')
        out.append('</ul></div>')
    return '\n'.join(out)

FAQ = [
  ('Как проверить, что модель в реестре?', 'Номер реестровой записи указан в таблице выше и на карточке каждой модели. По номеру запись находится в ГИСП (реестр российской промышленной продукции Минпромторга). Выписку из реестра приложим к коммерческому предложению.'),
  ('Все ли модели DS PROAUDIO внесены в реестр?', 'Нет. В реестре ' + str(total) + ' моделей серий ERA-i, PILLAR, CX и MCX — они перечислены выше. Если проекту нужна модель без реестровой записи, подберём реестровую замену с теми же задачами.'),
  ('Какие документы вы даёте для закупки?', 'Коммерческое предложение со спецификацией и номерами реестровых записей, выписки из реестра, паспорта и технические описания, файлы GLL для акустического расчёта и чертежи CAD.'),
  ('Работаете ли вы по 44-ФЗ и 223-ФЗ?', 'Да. Готовим спецификацию и описание объекта закупки, участвуем в закупках напрямую и через партнёров-интеграторов.'),
]

def faq_html():
    items = ''.join('<details class="gv-q"><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>' for q, a in FAQ)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
    return items, '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace('</', '<\\/') + '</script>'

STYLE = """<style>
  .gv-sec{background:#FFFFFF}
  .gv-sec.gv-alt{background:#FAFAFA}
  .gv-in{padding-top:110px;padding-bottom:110px}
  .gv-head{display:flex;flex-direction:column;gap:18px;max-width:760px;margin-bottom:44px}
  .gv-prs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .gv-pr{padding:28px 26px;border:1px solid #E6E6E6;border-radius:16px;background:#FFFFFF}
  .gv-pr b{display:block;font-family:'PT Mono',monospace;font-weight:400;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#ADADAD;margin-bottom:14px}
  .gv-pr p{margin:0;font-size:16px;line-height:1.6;color:#3A3A3A}
  .gv-regs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 40px}
  .gv-ser-h{font-family:'Montserrat',sans-serif;font-weight:700;font-size:19px;color:#141414;padding-bottom:12px;border-bottom:1px solid #141414}
  .gv-ser-h span{font-weight:500;font-size:14px;color:#8A8A8A;margin-left:8px}
  .gv-list{list-style:none;margin:0;padding:0}
  .gv-list li{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #E6E6E6;font-size:15px}
  .gv-list a{color:#141414;border-bottom:1px solid #D0D0D0}
  .gv-list a:hover{border-color:#141414}
  .gv-n{font-family:'PT Mono',monospace;font-size:14px;color:#5A5A5A;white-space:nowrap}
  .gv-note{margin:28px 0 0;font-size:14px;line-height:1.6;color:#8A8A8A;max-width:900px}
  .gv-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;counter-reset:gv}
  .gv-steps li{counter-increment:gv;padding:26px;border:1px solid #E6E6E6;border-radius:16px;background:#FFFFFF}
  .gv-steps li::before{content:"0" counter(gv);display:block;font-family:'PT Mono',monospace;font-size:11px;letter-spacing:.08em;color:#ADADAD;margin-bottom:14px}
  .gv-steps h3{margin:0 0 10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:17px;line-height:1.3;color:#141414}
  .gv-steps p{margin:0;font-size:15px;line-height:1.6;color:#5A5A5A}
  .gv-faq{max-width:900px}
  .gv-q{border-bottom:1px solid #E6E6E6}
  .gv-q summary{cursor:pointer;list-style:none;padding:20px 32px 20px 0;position:relative;font-family:'Montserrat',sans-serif;font-weight:600;font-size:18px;color:#141414}
  .gv-q summary::-webkit-details-marker{display:none}
  .gv-q summary::after{content:"+";position:absolute;right:0;top:18px;font-size:22px;color:#8A8A8A}
  .gv-q[open] summary::after{content:"−"}
  .gv-q p{margin:0 0 22px;font-size:16px;line-height:1.65;color:#5A5A5A}
  @media (max-width:1100px){.gv-steps{grid-template-columns:1fr 1fr}.gv-prs{grid-template-columns:1fr}}
  @media (max-width:700px){.gv-in{padding-top:72px;padding-bottom:72px}.gv-regs,.gv-steps{grid-template-columns:1fr}.gv-q summary{font-size:16px}}
</style>"""

def block():
    faq_items, faq_ld = faq_html()
    return f"""<!-- gov:start — блок собирается tools/gov/build.py, правки вносить туда -->
{STYLE}
<section class="gv-sec" id="about-gov">
  <div class="wrap gv-in">
    <div class="gv-head reveal">
      <div class="kicker">Для руководителя учреждения</div>
      <h2 class="h2">Российский звук, который проходит закупку</h2>
    </div>
    <div class="gv-prs">
      <div class="gv-pr reveal"><b>Задача</b><p>Учреждению нужна надёжная акустика для зала, школы или стадиона, а закупка требует российской продукции и полного пакета документов.</p></div>
      <div class="gv-pr reveal"><b>Решение</b><p>DS PROAUDIO — производитель полного цикла из Санкт-Петербурга. {total} моделей внесены в реестр российской промышленной продукции (ГИСП), к каждой есть паспорт, файлы GLL и чертежи.</p></div>
      <div class="gv-pr reveal"><b>Результат</b><p>Спецификация с номерами реестровых записей для документации о закупке, расчёт звука под объект, поставка, монтаж и гарантия 3 года с сервисом в Москве и Санкт-Петербурге.</p></div>
    </div>
  </div>
</section>

<section class="gv-sec gv-alt" id="registry">
  <div class="wrap gv-in">
    <div class="gv-head reveal">
      <div class="kicker">Реестр ГИСП</div>
      <h2 class="h2">Номера реестровых записей</h2>
      <p class="lead">Модели DS PROAUDIO в реестре российской промышленной продукции Минпромторга. Номер можно указать в описании объекта закупки.</p>
    </div>
    <div class="gv-regs reveal">
{table()}
    </div>
    <p class="gv-note">Комплекты PILLAR и CX собираются из моделей этого списка и имеют их номера. Актуальный список — на странице <a href="./products-registry.html" style="color:#141414;border-bottom:1px solid #D0D0D0;">«Реестровое оборудование»</a>; выписки из реестра прикладываем к коммерческому предложению.</p>
  </div>
</section>

<section class="gv-sec" id="procurement">
  <div class="wrap gv-in">
    <div class="gv-head reveal">
      <div class="kicker">44-ФЗ и 223-ФЗ</div>
      <h2 class="h2">Как получить коммерческое предложение</h2>
    </div>
    <ol class="gv-steps">
      <li class="reveal"><h3>Расскажите об объекте</h3><p>Тип и размеры помещения, число мест, задачи: речь, концерты, спорт. Подойдут планировка или фото.</p></li>
      <li class="reveal"><h3>Расчёт и подбор</h3><p>Делаем акустический расчёт и подбираем систему из реестровых моделей. Бесплатно.</p></li>
      <li class="reveal"><h3>КП и документы</h3><p>Спецификация с номерами реестровых записей, выписки из реестра, паспорта, GLL и CAD — для обоснования закупки.</p></li>
      <li class="reveal"><h3>Поставка и сервис</h3><p>Поставка, монтаж и настройка напрямую или через партнёров. Гарантия 3 года, сервис в Москве и Санкт-Петербурге.</p></li>
    </ol>
  </div>
</section>

<section class="gv-sec gv-alt" id="faq">
  <div class="wrap gv-in">
    <div class="gv-head reveal">
      <div class="kicker">Вопросы и ответы</div>
      <h2 class="h2">Частые вопросы заказчиков</h2>
    </div>
    <div class="gv-faq reveal">{faq_items}</div>
  </div>
  {faq_ld}
</section>
<!-- gov:end -->
"""

s = open(PAGE, encoding='utf-8').read()
s = re.sub(r'<!-- gov:start.*?<!-- gov:end -->\n', '', s, flags=re.S)
anchor = '<section id="contact"'
assert anchor in s
s = s.replace(anchor, block() + '\n' + anchor, 1)
open(PAGE, 'w', encoding='utf-8').write(s)
print('моделей в реестре:', total, {k: len(v) for k, v in rows.items()})
