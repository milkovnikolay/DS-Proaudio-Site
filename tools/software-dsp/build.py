# -*- coding: utf-8 -*-
"""Собирает site/software-dsp.html («ПО для управления DSP») из software.html:
шапка, меню, подвал и стили берутся со страницы SoundMath, меняется только содержимое.
Скриншоты: site/assets/software-dsp/shot-01.png … (если файла нет — показывается заглушка).
Запуск: python3 tools/software-dsp/build.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, 'site')
src = open(os.path.join(SITE, 'software.html'), encoding='utf-8').read()

TITLE = 'ПО для управления DSP — усилители серии DA — DS PROAUDIO'
DESC = ('Программа DS PROAUDIO для управления DSP усилителей серии DA: маршрутизация входов и выходов, '
        'эквалайзер, кроссовер, задержка, лимитер, пресеты. Для Windows 10 и macOS (Intel и Apple M).')

# ---- скриншоты: (файл, подпись в рамке окна, заголовок, текст, пункты) ----
SHOTS = [
    ('shot-01', 'Главное окно', 'Все каналы на одном экране',
     'Уровни входов и выходов, состояние защиты и температура усилителя видны сразу. '
     'Mute и громкость по каждому каналу — одним касанием.',
     ['Индикаторы уровня в реальном времени', 'Mute / Solo по каналам', 'Состояние защиты и нагрева']),
    ('shot-02', 'Маршрутизация', 'Матрица входов и выходов',
     'Любой вход — на любой выход: стерео, моно, раздельные полосы для сабвуфера и сателлитов. '
     'Мостовой режим включается здесь же.',
     ['Матрица 2 × 2 или 2 × 4', 'Мостовое включение', 'Сумма и раздел каналов']),
    ('shot-03', 'Эквалайзер', 'Параметрический эквалайзер',
     'Точная подстройка звучания под зал: полосы с частотой, усилением и добротностью, '
     'полочные фильтры и наглядная АЧХ.',
     ['Параметрические полосы на вход и выход', 'Полочные и обрезные фильтры', 'Общая АЧХ на графике']),
    ('shot-04', 'Кроссовер', 'Кроссовер и задержка',
     'Разделение полос для активных систем и выравнивание по времени сабвуферов, '
     'порталов и дополнительных линий.',
     ['Фильтры Баттерворта и Линквица — Райли', 'Задержка в мс и метрах', 'Полярность каналов']),
    ('shot-05', 'Лимитер', 'Защита акустики',
     'Пиковый и RMS-лимитеры на каждом выходе берегут динамики от перегрузки '
     'на долгих мероприятиях.',
     ['Порог, атака, восстановление', 'Пиковый и RMS-режим', 'Индикация срабатывания']),
    ('shot-06', 'Пресеты', 'Пресеты DS PROAUDIO',
     'Готовые настройки под акустику DS PROAUDIO: загрузить, сохранить свой вариант, '
     'перенести на другой усилитель.',
     ['Заводские пресеты под модели', 'Свои пресеты в файл', 'Блокировка настроек паролем']),
]

def shot_html(i, s):
    f, bar, h, p, items = s
    path = None
    for ext in ('png', 'jpg', 'webp'):
        if os.path.exists(os.path.join(SITE, 'assets', 'software-dsp', f + '.' + ext)):
            path = './assets/software-dsp/%s.%s' % (f, ext)
            break
    if path:
        media = '<img src="%s" alt="ПО для управления DSP: %s" loading="lazy">' % (path, h.lower())
    else:
        media = ('<div class="dsp-ph"><span>Скриншот</span><b>%s</b></div>' % bar)
    li = ''.join('<li>%s</li>' % x for x in items)
    side = 'r' if i % 2 else 'l'
    return f'''
    <article class="dsp-row dsp-{side} reveal">
      <div class="dsp-win">
        <div class="sw-shot-bar"><i></i><i></i><i></i><span>DS PROAUDIO DSP — {bar}</span></div>
        {media}
      </div>
      <div class="dsp-txt">
        <div class="kicker">{i+1:02d} · {bar}</div>
        <h3>{h}</h3>
        <p>{p}</p>
        <ul>{li}</ul>
      </div>
    </article>'''

ICON_WIN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.1l7.4-1v7.3H3zM11.3 4l9.7-1.4v8.8h-9.7zM3 12.4h7.4v7.3L3 18.7zM11.3 12.4H21v9l-9.7-1.4z"/></svg>'
ICON_MAC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>'

def dl(icon, os_name, note):
    return f'''<div class="dsp-dl" aria-disabled="true">
          <span class="dsp-dl-ic">{icon}</span>
          <span class="dsp-dl-t"><b>Скачать для {os_name}</b><small>{note}</small></span>
          <span class="dsp-dl-soon">Скоро</span>
        </div>'''

DOWNLOADS = (dl(ICON_WIN, 'Windows 10', 'Windows 10 и 11, 64 бит') + '\n        ' +
             dl(ICON_MAC, 'macOS', 'Универсальная: Intel и Apple M'))

MAIN = f'''<main>

<!-- ================= ЗАГОЛОВОК ================= -->
<section class="hub-hero">
  <div class="wrap" style="position:relative;z-index:2;padding-top:140px;padding-bottom:88px;display:flex;flex-direction:column;gap:44px;">
    <nav aria-label="Навигационная цепочка">
      <ol class="crumbs">
        <li><a href="./Main.dc.html">Главная</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li><a href="./support.html">Техподдержка</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li aria-current="page">ПО для управления DSP</li>
      </ol>
    </nav>
    <div class="sw-hero-grid">
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div class="kicker" style="color:#C8C8C8;">ПО для управления DSP</div>
        <h1 class="h1" style="margin:0;font-family:'Montserrat',sans-serif;font-weight:500;font-size:64px;line-height:1.05;color:#FAFAFA;">Управление усилителями DA&nbsp;DSP</h1>
        <div style="max-width:600px;font-size:22px;line-height:1.5;color:#D8D8D8;">Настройка процессора усилителей DS PROAUDIO с компьютера: маршрутизация, эквалайзер, кроссовер, задержка, лимитеры и пресеты — в одном окне.</div>
        <div class="dsp-dls">
        {DOWNLOADS}
        </div>
        <p class="sw-note" style="margin:2px 0 0;">Программа готовится к публикации. Нужна сейчас — <a href="./clients.html#contact">напишите нам</a>, пришлём установщик.<br>Подключение к усилителю — через <a href="./p-rs485-usb-adapter.html">адаптер RS485 — USB</a>.</p>
      </div>
      <div class="sw-shot dsp-hero-shot">
        <div class="sw-shot-bar"><i></i><i></i><i></i><span>DS PROAUDIO DSP — Главное окно</span></div>
        {'<img src="./assets/software-dsp/shot-01.png" alt="ПО для управления DSP: главное окно" width="1600" height="1000">' if os.path.exists(os.path.join(SITE,'assets','software-dsp','shot-01.png')) else '<div class="dsp-ph dsp-ph-hero"><span>Скриншот</span><b>Главное окно</b></div>'}
      </div>
    </div>
  </div>
</section>

<!-- ================= КОРОТКО ================= -->
<section style="background:#FAFAFA;">
  <div class="wrap" style="padding-top:72px;padding-bottom:72px;">
    <div class="dsp-facts">
      <div><b>DA2 · DA4</b><span>все усилители серии DA с DSP</span></div>
      <div><b>2 × 4</b><span>матрица входов и выходов</span></div>
      <div><b>Win · Mac</b><span>Windows 10/11 и macOS Intel / Apple M</span></div>
      <div><b>RS485</b><span>подключение через USB-адаптер</span></div>
    </div>
  </div>
</section>

<!-- ================= ЭКРАНЫ ПРОГРАММЫ ================= -->
<section style="background:#FFFFFF;">
  <div class="wrap" style="padding-top:96px;padding-bottom:40px;display:flex;flex-direction:column;gap:18px;max-width:1440px;">
    <div class="kicker">Возможности</div>
    <h2 class="wr-h2" style="max-width:820px;">Всё, что умеет процессор усилителя, — на экране компьютера</h2>
  </div>
  <div class="wrap dsp-rows" style="padding-bottom:110px;">{''.join(shot_html(i, s) for i, s in enumerate(SHOTS))}
  </div>
</section>

<!-- ================= КАК ПОДКЛЮЧИТЬ ================= -->
<section class="dark" style="background:#0A0A0B;">
  <div class="wrap" style="padding-top:100px;padding-bottom:104px;display:flex;flex-direction:column;gap:52px;">
    <div style="display:flex;flex-direction:column;gap:18px;max-width:820px;">
      <div class="kicker">Как начать</div>
      <h2 class="wr-h2" style="color:#FAFAFA;">От установки — к звуку на площадке</h2>
    </div>
    <div class="sw-steps">
      <div class="sw-step reveal"><b>01</b><h3>Установка</h3><p>Скачайте версию для Windows или macOS и установите программу.</p></div>
      <div class="sw-step reveal"><b>02</b><h3>Подключение</h3><p>Соедините компьютер и усилитель через адаптер RS485 — USB. Программа сама найдёт усилители на линии.</p></div>
      <div class="sw-step reveal"><b>03</b><h3>Пресет</h3><p>Загрузите заводской пресет под вашу акустику DS PROAUDIO или начните с чистой настройки.</p></div>
      <div class="sw-step reveal"><b>04</b><h3>Настройка</h3><p>Подстройте эквалайзер, задержки и лимитеры под зал, сохраните пресет и заблокируйте настройки.</p></div>
    </div>
  </div>
</section>

<!-- ================= ЗАПУСК ================= -->
<section style="background:#FFFFFF;">
  <div class="wrap" style="padding-top:96px;padding-bottom:110px;">
    <div class="reveal" style="display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;padding:52px 56px;border-radius:20px;background:#F3F3F1;">
      <div style="max-width:640px;">
        <h2 style="margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:34px;line-height:1.2;color:#141414;">Нужна помощь с настройкой?</h2>
        <p style="margin:14px 0 0;font-size:16.5px;line-height:1.6;color:#767676;">Инженеры DS PROAUDIO подберут пресет под вашу систему и помогут настроить усилители на объекте. Пресеты для каждой модели — в карточках усилителей и в Центре документации.</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        <a class="wr-cta" style="background:#141414;color:#FAFAFA;" href="./clients.html#contact">Задать вопрос</a>
        <a class="wr-cta" style="background:none;color:#141414;border:1px solid #CFCFCF;" href="./products-amplifiers.html">Усилители DA</a>
      </div>
    </div>
  </div>
</section>

</main>'''

CSS = '''
<style>
  /* ===== страница «ПО для управления DSP» ===== */
  .dsp-dls{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
  .dsp-dl{display:flex;flex:1 1 250px;max-width:300px;align-items:center;gap:14px;min-width:0;padding:14px 18px 14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.04);color:#FAFAFA;cursor:not-allowed;user-select:none}
  .dsp-dl-ic{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:8px;background:rgba(255,255,255,.08);color:#E8E8E8;flex:0 0 auto}
  .dsp-dl-t{display:flex;flex-direction:column;gap:3px;flex:1 1 auto}
  .dsp-dl-t b{font-size:14.5px;font-weight:600;color:#E8E8E8}
  .dsp-dl-t small{font-family:'PT Mono',monospace;font-size:11px;letter-spacing:.04em;color:#8A8A8A}
  .dsp-dl-soon{font-family:'PT Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.25);color:#BDBDBD;flex:0 0 auto}
  .dsp-hero-shot{cursor:default}
  .dsp-hero-shot:hover img{transform:none}
  .dsp-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;aspect-ratio:16/10;background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/100% 32px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/32px 100%,#0f1420;color:#6f7a92}
  .dsp-ph span{font-family:'PT Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  .dsp-ph b{font-family:'Montserrat',sans-serif;font-weight:500;font-size:20px;color:#AEB6C8}
  .dsp-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:1px solid #E2E2E2;border-bottom:1px solid #E2E2E2}
  .dsp-facts>div{display:flex;flex-direction:column;gap:8px;padding:30px 24px 30px 0}
  .dsp-facts>div+div{padding-left:24px;border-left:1px solid #E2E2E2}
  .dsp-facts b{font-family:'Montserrat',sans-serif;font-weight:600;font-size:28px;color:#141414}
  .dsp-facts span{font-family:'PT Mono',monospace;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#8A8A8A;line-height:1.5}
  .dsp-rows{display:flex;flex-direction:column;gap:96px}
  .dsp-row{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:64px;align-items:center}
  .dsp-row.dsp-r .dsp-win{order:2}
  .dsp-row.dsp-r{grid-template-columns:minmax(0,1fr) minmax(0,1.45fr)}
  .dsp-win{border-radius:14px;overflow:hidden;border:1px solid #1d2433;background:#0f1420;box-shadow:0 50px 90px -40px rgba(10,14,25,.55),0 2px 6px rgba(0,0,0,.06)}
  .dsp-win img{display:block;width:100%;height:auto}
  .dsp-txt{display:flex;flex-direction:column;gap:16px}
  .dsp-txt h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:30px;line-height:1.2;color:#141414}
  .dsp-txt p{margin:0;font-size:17px;line-height:1.65;color:#5B5B5B}
  .dsp-txt ul{margin:6px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
  .dsp-txt li{position:relative;padding-left:22px;font-family:'PT Mono',monospace;font-size:13px;letter-spacing:.03em;color:#3A3A3A;line-height:1.5}
  .dsp-txt li::before{content:"";position:absolute;left:0;top:.62em;width:10px;height:1px;background:#141414}
  @media (max-width:1100px){
    .dsp-facts{grid-template-columns:1fr 1fr}
    .dsp-facts>div:nth-child(3){padding-left:0;border-left:0}
    .dsp-facts>div:nth-child(n+3){border-top:1px solid #E2E2E2}
    .dsp-row,.dsp-row.dsp-r{grid-template-columns:1fr;gap:32px}
    .dsp-row.dsp-r .dsp-win{order:0}
  }
  @media (max-width:700px){
    .dsp-dl{max-width:none}
    .dsp-facts>div{padding:22px 14px 22px 0}
    .dsp-facts>div+div{padding-left:14px}
    .dsp-facts>div:nth-child(3){padding-left:0}
    .dsp-facts b{font-size:22px}
    .dsp-facts span{font-size:11px}
    .dsp-rows{gap:64px}
    .dsp-txt h3{font-size:24px}
    .dsp-txt p{font-size:16px}
    .dsp-win{border-radius:10px}
    .dsp-hero-shot .h1{font-size:40px}
  }
  @media (max-width:700px){ .hub-hero h1.h1{font-size:40px !important} }
</style>
'''

out = src
# заголовок, описание
out = re.sub(r'<title>.*?</title>', '<title>%s</title>' % TITLE, out, count=1)
out = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + DESC, out, count=1)
out = out.replace('"name":"ПО для акустических расчётов"}', '"name":"ПО для управления DSP"}')
# SEO-блок и язык
out = re.sub(r'(?s)<!-- seo:start -->.*?<!-- seo:end -->', f'''<!-- seo:start -->
<link rel="canonical" href="https://ds-proaudio.ru/software-dsp.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DS PROAUDIO">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="https://ds-proaudio.ru/software-dsp.html">
<meta property="og:image" content="https://ds-proaudio.ru/assets/og/og-default.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="author" content="DS PROAUDIO">
<!-- seo:end -->''', out, count=1)
out = re.sub(r'(?s)<!-- lang:start.*?<!-- lang:end -->\n', '', out, count=1)
out = re.sub(r'<a class="mm-lang" href="./en/software.html"[^\n]*\n', '', out, count=1)
# содержимое
out = re.sub(r'(?s)<main>.*?</main>', lambda m: MAIN, out, count=1)
out = out.replace('</head>', CSS + '</head>', 1)

# меню и подвал на этой странице: SoundMath больше не текущая, добавляется новый пункт
out = out.replace('<a href="./software.html" class="mm-item-long mm-current" aria-current="page" style="font-weight:500;color:#FFFFFF;">ПО для акустических расчётов</a>',
                  '<a href="./software.html" class="mm-item-long">ПО для акустических расчётов</a>\n'
                  '      <a href="./software-dsp.html" class="mm-item-long mm-current" aria-current="page" style="font-weight:500;color:#FFFFFF;">ПО для управления DSP</a>')
out = out.replace('<a href="./software.html" class="ft-item-long">ПО для акустических расчётов</a>',
                  '<a href="./software.html" class="ft-item-long">ПО для акустических расчётов</a>\n'
                  '          <a href="./software-dsp.html" class="ft-item-long">ПО для управления DSP</a>')
assert 'software-dsp.html" class="mm-item-long mm-current' in out
assert 'software-dsp.html" class="ft-item-long' in out
open(os.path.join(SITE, 'software-dsp.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out))
