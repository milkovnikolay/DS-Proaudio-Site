# -*- coding: utf-8 -*-
"""Собирает site/software-dsp.html («ПО для управления DSP») из software.html:
шапка, меню, подвал и стили берутся со страницы SoundMath, меняется только содержимое.
Скриншоты: site/assets/software-dsp/shot-01.png … (если файла нет — показывается заглушка).
Запуск: python3 tools/software-dsp/build.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.environ.get('SITE') or os.path.join(ROOT, 'site')
raw = open(os.path.join(SITE, 'software.html'), 'rb').read().decode('utf-8')
CRLF = '\r\n' in raw
src = raw.replace('\r\n', '\n')
# если в шаблоне уже есть пункт DSP Control (меню добавлено на всех страницах) — убираем, чтобы не было дублей
src = re.sub(r'[ \t]*<a href="\./software-dsp\.html"[^>]*>[^<]*</a>\n', '', src)
LABEL = 'Программа для управления DSP'  # пункт меню и подвала
NAME = 'DSP Control'  # название программы на странице

TITLE = 'DSP Control — приложение для управления DSP усилителей — DS PROAUDIO'
DESC = ('DSP Control — программа на русском языке для настройки DSP-модулей усилителей DS PROAUDIO по линии RS-485: '
        'сеть модулей, группы, связки каналов, эквалайзер, кроссовер, лимитер с потолком в ваттах, пресеты и защита паролем. Windows 10/11 и macOS.')

SRC = os.path.join(SITE, 'assets', 'software-dsp')

def img(name, alt, eager=False):
    """name — файл в site/assets/software-dsp/ (без пути). Нет файла — заглушка."""
    if name and os.path.exists(os.path.join(SRC, name)):
        return '<a class="dsp-zoom" href="./assets/software-dsp/%s" target="_blank" rel="noopener" title="Открыть в полном размере"><img src="./assets/software-dsp/%s" alt="DSP Control: %s"%s></a>' % (name, name, alt, '' if eager else ' loading="lazy"')
    return '<div class="dsp-ph"><span>Скриншот</span><b>%s</b></div>' % alt

# ---- ключевые возможности (по руководству 0.9.2) ----
PROS = [
    ('Сетевое управление системой', 'Автоматическое обнаружение всех модулей на линии RS-485. Модули объединяются в группы в соответствии с расположением акустических систем; MUTE канала, модуля или группы доступен без открытия настроек.'),
    ('Групповое редактирование и связки каналов', 'Синхронное изменение параметров во всех модулях группы с выбором связанных параметров. Связки объединяют каналы разных модулей, в том числе разных моделей, под единым управлением.'),
    ('Контроль выходной мощности', 'Потолок лимитера в вольтах и ваттах на нагрузке 8 и 4 Ом по замерам усилительного блока. Предупреждение, если порог лимитера превышает предел усилителя.'),
    ('Защита настроек паролем', 'Блокировка выходов после ввода системы в эксплуатацию. Возможен частичный доступ: уровень и MUTE остаются доступны, эквалайзер, кроссовер и лимитер защищены.'),
    ('Режим «Только чтение»', 'По умолчанию программа не записывает данные в модули — запись включается только явным разрешением. Изменения применяются в реальном времени и сохраняются модулем автоматически.'),
    ('Перенос конфигураций', 'Пресеты, настройки модуля и конфигурация всей системы с группами и связками сохраняются в файлы. Перенос настроек между модулями, в том числе разных моделей, с перечнем несовместимых параметров до записи.'),
]

# ---- экраны программы: (файл, подпись окна, заголовок, текст, пункты) ----
SHOTS = [
    ('01-set-gruppy-dark.png', 'Сеть', 'Сеть модулей',
     'Все модули линии на одном поле: модель, адрес, уровни выходов, состояние связи и защиты. Группы формируются перетаскиванием, у каждой группы — главный модуль и набор связанных параметров.',
     ['Автоматический поиск модулей на линии', 'Группы с главным модулем', 'MUTE канала, модуля и группы']),
    ('02-obzor-dark.png', 'Обзор', 'Обзор модуля и маршрутизация',
     'Сводка по всем каналам: активные блоки обработки с основными параметрами, АЧХ, уровень, MUTE и индикатор сигнала. Матрица маршрутизации входов на выходы с уровнем подмешивания.',
     ['Блоки EQ, Gate, HPF, LPF, Comp, Limit, Delay', 'Индикация срабатывания лимитера', 'Матрица входов и выходов']),
    ('10-vhody-dark.png', 'Входы', 'Входной канал',
     'Уровень, полярность, задержка, параметрический эквалайзер, шумовой гейт и выбор источника сигнала. Встроенный генератор для проверки и измерений.',
     ['Уровень от −60 до +15 дБ', 'Задержка в мс с пересчётом в метры', 'Генератор: синус, розовый и белый шум']),
    ('04-ekvalayzer-krupno-dark.png', 'Эквалайзер', 'Параметрический эквалайзер и кроссовер',
     'Редактирование полос на графике АЧХ с точным вводом частоты, добротности и усиления в таблице. Фильтры HPF и LPF выходов отображаются на том же графике вместе с кривыми соседних выходов.',
     ['Колокол, низкая и высокая полка', 'Linkwitz-Riley, Butterworth, Bessel, 6–48 дБ/окт', 'Диапазон графика ±24 дБ, 20 Гц – 20 кГц']),
    ('05-limiter-potolok-dark.png', 'Лимитер', 'Компрессор и лимитер',
     'Компрессор и лимитер на каждом выходе. Потолок на выходе отображается в вольтах и ваттах для нагрузки 8 и 4 Ом по замерам установленного усилительного блока.',
     ['Threshold, Ratio, Attack, Release, Knee', 'Передаточная характеристика на графике', 'Предупреждение о превышении предела усилителя']),
    ('07-svyazka-kanalov-dark.png', 'Связки каналов', 'Связки каналов',
     'Объединение каналов разных модулей и моделей под единым управлением — например, всех ВЧ-выходов системы. Набор совместно редактируемых параметров задаётся при создании связки.',
     ['Назначение главного канала', 'Выбор связанных параметров', 'Общий MUTE связки']),
    ('08-kopirovanie-kanala-dark.png', 'Копирование', 'Копирование настроек канала',
     'Тиражирование настройки канала на любое число каналов линии, в том числе модулей других моделей, с выбором копируемых блоков обработки.',
     ['Уровень, EQ, кроссовер, задержка, компрессор, лимитер', 'Выбор «все OUT N на линии»', 'Защищённые выходы не изменяются']),
    ('06-presety-neskolko-moduley-dark.png', 'Пресеты', 'Пресеты в нескольких модулях',
     'Сводная таблица ячеек памяти выбранных модулей. Загрузка, сохранение, назначение стартового пресета и удаление выполняются одновременно во всех модулях.',
     ['29 пользовательских ячеек в модуле', 'Конфигурация системы в одном файле', 'Перечень изменений перед записью']),
    ('11-svyaz-diagnostika-dark.png', 'Связь и журнал', 'Диагностика',
     'Сведения о модулях, индикаторы всех каналов и полный журнал обмена командами с модулями. Журнал сохраняется автоматически.',
     ['Модель, версия ПО, серийный номер', 'Индикаторы уровней всех каналов', 'Журнал обмена за 14 дней']),
]

def shot_html(i, s):
    f, bar, h, p, items = s
    li = ''.join('<li>%s</li>' % x for x in items)
    side = 'r' if i % 2 else 'l'
    return f"""
    <article class="dsp-row dsp-{side} reveal">
      <div class="dsp-win">
        <div class="sw-shot-bar"><i></i><i></i><i></i><span>DSP Control — {bar}</span></div>
        {img(f, h[0].lower() + h[1:])}
      </div>
      <div class="dsp-txt">
        <div class="kicker">{i+1:02d} · {bar}</div>
        <h3>{h}</h3>
        <p>{p}</p>
        <ul>{li}</ul>
      </div>
    </article>"""

def pro_html(i, s):
    h, p = s
    return f'<article class="dsp-pro reveal"><b>{i+1:02d}</b><h3>{h}</h3><p>{p}</p></article>'

ICON_WIN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.1l7.4-1v7.3H3zM11.3 4l9.7-1.4v8.8h-9.7zM3 12.4h7.4v7.3L3 18.7zM11.3 12.4H21v9l-9.7-1.4z"/></svg>'
ICON_MAC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.5c1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z"/></svg>'

def dl(icon, os_name, note):
    return f"""<div class="dsp-dl" aria-disabled="true">
          <span class="dsp-dl-ic">{icon}</span>
          <span class="dsp-dl-t"><b>Скачать для {os_name}</b><small>{note}</small></span>
          <span class="dsp-dl-soon">Скоро</span>
        </div>"""

DOWNLOADS = (dl(ICON_WIN, 'Windows 10', 'Windows 10 и 11') + '\n        ' +
             dl(ICON_MAC, 'macOS', 'Универсальная: Intel и Apple M'))

HERO_IMG = '03-ekvalayzer-krossover-dark.png'

MAIN = f"""<main>

<!-- ================= ЗАГОЛОВОК ================= -->
<section class="hub-hero">
  <div class="wrap" style="position:relative;z-index:2;padding-top:140px;padding-bottom:88px;display:flex;flex-direction:column;gap:44px;">
    <nav aria-label="Навигационная цепочка">
      <ol class="crumbs">
        <li><a href="./Main.dc.html">Главная</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li><a href="./support.html">Техподдержка</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li aria-current="page">{NAME}</li>
      </ol>
    </nav>
    <div class="sw-hero-grid">
      <div style="display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;"><div class="kicker" style="color:#C8C8C8;">Программа для управления DSP · версия 0.9</div><span class="dsp-ru-pill"><i>RU</i>Полностью на русском языке</span></div>
        <h1 class="h1" style="margin:0;font-family:'Montserrat',sans-serif;font-weight:500;font-size:64px;line-height:1.05;color:#FAFAFA;">DSP&nbsp;Control</h1>
        <div style="max-width:600px;font-size:22px;line-height:1.5;color:#D8D8D8;">Программа для настройки и мониторинга DSP-модулей усилителей DS PROAUDIO по интерфейсу RS-485. Управление многомодульной системой, групповое редактирование, связки каналов, контроль выходной мощности и защита настроек.</div>
        <div class="dsp-dls">
        {DOWNLOADS}
        </div>
        <p class="sw-note" style="margin:2px 0 0;">Программа готовится к публикации. Для получения установщика — <a href="./clients.html#contact">напишите нам</a>.<br>Подключение к усилителю — через <a href="./p-rs485-usb-adapter.html">адаптер RS485 — USB</a>.</p>
      </div>
      <div class="sw-shot dsp-hero-shot">
        <div class="sw-shot-bar"><i></i><i></i><i></i><span>DSP Control</span></div>
        {img(HERO_IMG, 'главное окно', eager=True)}
      </div>
    </div>
  </div>
</section>

<!-- ================= КОРОТКО ================= -->
<section style="background:#FAFAFA;">
  <div class="wrap" style="padding-top:72px;padding-bottom:72px;">
    <div class="dsp-facts">
      <div><b>Все модули</b><span>все активные DSP-модули DS PROAUDIO в базе программы</span></div>
      <div><b>RS-485</b><span>сетевое управление модулями на одной линии</span></div>
      <div><b>Win · Mac</b><span>Windows 10/11, macOS (Intel и Apple Silicon)</span></div>
      <div class="dsp-fact-ru"><b>Всё на русском</b><span>интерфейс, сообщения и документация</span></div>
    </div>
  </div>
</section>

<!-- ================= ГЛАВНЫЕ ПРЕИМУЩЕСТВА ================= -->
<section class="dark" style="background:#0A0A0B;">
  <div class="wrap" style="padding-top:100px;padding-bottom:104px;display:flex;flex-direction:column;gap:52px;">
    <div style="display:flex;flex-direction:column;gap:18px;max-width:860px;">
      <div class="kicker">Ключевые возможности</div>
      <h2 class="wr-h2" style="color:#FAFAFA;">Системное управление DSP-модулями</h2>
    </div>
    <div class="dsp-pros">{''.join(pro_html(i, s) for i, s in enumerate(PROS))}
    </div>
  </div>
</section>

<!-- ================= ЭКРАНЫ ПРОГРАММЫ ================= -->
<section style="background:#FFFFFF;">
  <div class="wrap" style="padding-top:96px;padding-bottom:40px;display:flex;flex-direction:column;gap:18px;">
    <div class="kicker">Интерфейс</div>
    <h2 class="wr-h2" style="max-width:820px;">Интерфейс программы</h2>
  </div>
  <div class="wrap dsp-rows" style="padding-bottom:110px;">{''.join(shot_html(i, s) for i, s in enumerate(SHOTS))}
  </div>
</section>

<!-- ================= КАК НАЧАТЬ ================= -->
<section style="background:#F3F3F1;">
  <div class="wrap" style="padding-top:100px;padding-bottom:104px;display:flex;flex-direction:column;gap:52px;">
    <div style="display:flex;flex-direction:column;gap:18px;max-width:820px;">
      <div class="kicker">Порядок работы</div>
      <h2 class="wr-h2">Ввод системы в эксплуатацию</h2>
    </div>
    <div class="sw-steps dsp-steps-light">
      <div class="sw-step reveal"><b>01</b><h3>Установка</h3><p>Windows 10/11 или macOS (Intel и Apple Silicon). Права администратора не требуются.</p></div>
      <div class="sw-step reveal"><b>02</b><h3>Подключение</h3><p>Адаптер RS-485 — USB, скорость 115200. Модули на линии обнаруживаются автоматически.</p></div>
      <div class="sw-step reveal"><b>03</b><h3>Настройка</h3><p>Группы и связки каналов, маршрутизация, эквалайзер, кроссовер, динамическая обработка.</p></div>
      <div class="sw-step reveal"><b>04</b><h3>Защита</h3><p>Сохранение пресетов в модули и в файл, блокировка выходов паролем.</p></div>
    </div>
    <p class="dsp-sim">Режим «Имитатор» — пять виртуальных модулей для обучения и демонстрации без подключения оборудования.</p>
  </div>
</section>

<!-- ================= ПОМОЩЬ ================= -->
<section style="background:#FFFFFF;">
  <div class="wrap" style="padding-top:96px;padding-bottom:110px;">
    <div class="reveal" style="display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;padding:52px 56px;border-radius:20px;background:#141414;">
      <div style="max-width:640px;">
        <h2 style="margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:34px;line-height:1.2;color:#FAFAFA;">Поддержка при настройке</h2>
        <p style="margin:14px 0 0;font-size:16.5px;line-height:1.6;color:#A8A8A8;">Инженеры DS PROAUDIO подготовят пресеты для вашей системы и выполнят настройку на объекте. Пресеты для моделей усилителей — в карточках продукции и в Центре документации.</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        <a class="wr-cta" href="./clients.html#contact">Задать вопрос</a>
        <a class="wr-cta wr-cta-ghost" href="./products-amplifiers.html">Усилители DS PROAUDIO</a>
      </div>
    </div>
  </div>
</section>

</main>"""

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
  .dsp-ru-pill{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 6px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);font-size:13px;font-weight:600;color:#FAFAFA}
  .dsp-ru-pill i{font-style:normal;font-family:'PT Mono',monospace;font-size:11px;letter-spacing:.06em;padding:3px 7px;border-radius:999px;background:#FAFAFA;color:#0A0A0B}
  .dsp-facts>div.dsp-fact-ru{background:#141414;border-radius:14px;padding-left:24px}
  .dsp-fact-ru b{color:#FAFAFA !important}
  .dsp-fact-ru span{color:#BDBDBD !important}
  .dsp-facts b{font-family:'Montserrat',sans-serif;font-weight:600;font-size:28px;color:#141414}
  .dsp-facts span{font-family:'PT Mono',monospace;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#8A8A8A;line-height:1.5}
  .dsp-pros{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .dsp-pro{display:flex;flex-direction:column;gap:12px;padding:30px 30px 32px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.01))}
  .dsp-pro b{font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.08em;color:#6E6E6E}
  .dsp-pro h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:21px;line-height:1.3;color:#FAFAFA}
  .dsp-pro p{margin:0;font-size:15.5px;line-height:1.65;color:#9A9A9A}
  .dsp-steps-light .sw-step{border-top-color:#D6D6D6}
  .dsp-steps-light .sw-step b{color:#9A9A9A}
  .dsp-steps-light .sw-step h3{color:#141414}
  .dsp-steps-light .sw-step p{color:#5B5B5B}
  .dsp-sim{margin:0;font-family:'PT Mono',monospace;font-size:13px;letter-spacing:.03em;line-height:1.6;color:#6E6E6E;max-width:820px}
  .dsp-rows{display:flex;flex-direction:column;gap:96px}
  .dsp-row{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:64px;align-items:center}
  .dsp-row.dsp-r .dsp-win{order:2}
  .dsp-row.dsp-r{grid-template-columns:minmax(0,1fr) minmax(0,1.45fr)}
  .dsp-win{border-radius:14px;overflow:hidden;border:1px solid #1d2433;background:#0f1420;box-shadow:0 50px 90px -40px rgba(10,14,25,.55),0 2px 6px rgba(0,0,0,.06)}
  .dsp-win img{display:block;width:100%;height:auto}
  .dsp-win img[src*="05-limiter"]{width:auto;max-width:min(100%,400px);margin:28px auto}
  .dsp-zoom{display:block;cursor:zoom-in}
  .dsp-zoom:hover{opacity:1}
  .dsp-hero-shot img{display:block;width:100%;height:auto}
  .dsp-txt{display:flex;flex-direction:column;gap:16px}
  .dsp-txt h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:30px;line-height:1.2;color:#141414}
  .dsp-txt p{margin:0;font-size:17px;line-height:1.65;color:#5B5B5B}
  .dsp-txt ul{margin:6px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
  .dsp-txt li{position:relative;padding-left:22px;font-family:'PT Mono',monospace;font-size:13px;letter-spacing:.03em;color:#3A3A3A;line-height:1.5}
  .dsp-txt li::before{content:"";position:absolute;left:0;top:.62em;width:10px;height:1px;background:#141414}
  @media (max-width:1100px){
    .dsp-facts{grid-template-columns:1fr 1fr}
    .dsp-pros{grid-template-columns:1fr 1fr}
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
    .dsp-pros{grid-template-columns:1fr}
    .dsp-pro{padding:24px 22px 26px}
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
out = re.sub(r'"name":"[^"]*акустических расчётов"\}', '"name":"%s"}' % NAME, out)
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
def fix_menu(m):
    tag, text = m.group(1), m.group(2)
    if 'mm-current' in tag:
        plain = '<a href="./software.html" class="mm-item-long">%s</a>' % text
        return plain + '\n      <a href="./software-dsp.html" class="mm-item-long mm-current" aria-current="page" style="font-weight:500;color:#FFFFFF;">%s</a>' % LABEL
    if 'ft-item-long' in tag:
        return m.group(0) + '\n          <a href="./software-dsp.html" class="ft-item-long">%s</a>' % LABEL
    return m.group(0)
out = re.sub(r'(<a href="\./software\.html"[^>]*>)([^<]*)</a>', fix_menu, out)
assert 'software-dsp.html" class="mm-item-long mm-current' in out
assert 'software-dsp.html" class="ft-item-long' in out
if CRLF:
    out = out.replace('\r\n', '\n').replace('\n', '\r\n')
open(os.path.join(SITE, 'software-dsp.html'), 'wb').write(out.encode('utf-8'))
print('ok', len(out))
