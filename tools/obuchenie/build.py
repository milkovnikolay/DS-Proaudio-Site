# -*- coding: utf-8 -*-
"""Техподдержка → «Обучение и семинары» (23.10.2026): продающая страница по образцу раздела «Клиентам».

Запуск:  python3 -I build.py <папка site>
Общие куски (первый экран, карточки, шаги, отзывы, вопросы, форма, скрипт) берёт из tools/klientam/build.py,
шапку, меню и подвал — из showroom.html. Пишет seminars.html.
Логика страницы и источники — analiz/obuchenie-2026-10-23.md в репозитории.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(HERE, '..', 'klientam', 'build.py'), encoding='utf-8').read()
exec(_src[:_src.index('# ---------- страницы ----------')])  # SRC, REV, E, TEL, hero, sec, cards, steps, quotes, faq, seg, form, F_*, CSS, JS, fab

def crumbs(name):  # подменяет «Клиентам» на «Техподдержка» (hero() ищет crumbs при вызове)
    return ('<nav aria-label="Навигационная цепочка"><ol class="crumbs"><li><a href="./Main.dc.html">Главная</a></li>'
            '<li class="sep" aria-hidden="true">/</li><li><a href="./support.html">Техподдержка</a></li>'
            '<li class="sep" aria-hidden="true">/</li><li aria-current="page">' + name + '</li></ol></nav>')

A = './assets/'

# ---------- стили страницы (добавляются к стилям шоурума и «Клиентам») ----------
OB_CSS = '''<style>
/* ===== Техподдержка: обучение и семинары (23.10.2026). Сборка: tools/obuchenie/build.py ===== */
/* выбор роли */
.ob-roles{display:flex;flex-wrap:wrap;gap:10px;margin-top:40px;}
.ob-roles button{padding:14px 20px;border-radius:99px;border:1px solid #DADADA;background:transparent;font-family:'Montserrat',sans-serif;font-weight:600;font-size:15px;color:#3A3A3A;cursor:pointer;transition:all .25s;}
.ob-roles button:hover{border-color:#141414;color:#141414;}
.ob-roles button[aria-selected=true]{background:#141414;border-color:#141414;color:#FAFAFA;}
.ob-role{display:none;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:0;margin-top:28px;border-radius:18px;overflow:hidden;background:#FFFFFF;border:1px solid #E6E6E6;}
.ob-role.on{display:grid;animation:obIn .5s cubic-bezier(.2,.7,.2,1);}
@keyframes obIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.ob-role-ph{position:relative;min-height:420px;background:#141414;}
.ob-role-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.ob-role-tx{display:flex;flex-direction:column;gap:16px;padding:44px 44px 40px;}
.ob-role-tx b{font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A8A8A;}
.ob-role-tx h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:28px;line-height:1.22;color:#141414;}
.ob-role-tx p{margin:0;font-size:16px;line-height:1.65;color:#5E5E5E;}
.ob-role-tx ul{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;}
.ob-role-tx li{position:relative;padding-left:26px;font-size:15.5px;line-height:1.5;color:#2A2A2A;}
.ob-role-tx li::before{content:"";position:absolute;left:0;top:.45em;width:12px;height:7px;border-left:2px solid #141414;border-bottom:2px solid #141414;transform:rotate(-45deg);}
.ob-role-tx .pr-btn{margin-top:auto;align-self:flex-start;background:#141414;color:#FAFAFA;border-color:#141414;}
/* форматы */
.ob-fmt .kl-path{position:relative;overflow:hidden;}
.ob-fmt .kl-path em{font-style:normal;font-family:'PT Mono',monospace;font-size:12px;letter-spacing:.06em;color:#8A8A8A;border-top:1px solid rgba(255,255,255,.1);padding-top:12px;}
.kl-paths.ob-4{grid-template-columns:repeat(4,minmax(0,1fr));}
/* программа: модули */
.ob-mods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:48px;border-top:1px solid #DADADA;}
.ob-mods div{padding:28px 32px 30px 0;border-bottom:1px solid #DADADA;}
.ob-mods b{display:block;font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.12em;color:#9A9A9A;}
.ob-mods h3{margin:10px 0 8px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:19px;line-height:1.3;color:#141414;}
.ob-mods p{margin:0;font-size:15px;line-height:1.6;color:#5E5E5E;}
.ob-mods span{display:inline-block;margin-top:12px;padding:5px 10px;border-radius:99px;background:#EFEFEF;font-size:12.5px;color:#5E5E5E;}
/* нас выбирают для обучения */
.ob-cases{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px;}
.ob-case{display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#151517;border:1px solid rgba(255,255,255,.08);}
.ob-case-ph{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:4px;height:340px;}
.ob-case-ph button{position:relative;padding:0;border:0;overflow:hidden;background:#0E0E10;cursor:zoom-in;}
.ob-case-ph button:first-child{grid-row:1/3;}
.ob-case-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1);}
.ob-case-ph button:hover img{transform:scale(1.05);}
.ob-case-tx{display:flex;flex-direction:column;gap:12px;padding:30px 30px 32px;}
.ob-case-tx b{font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.12em;color:#8A8A8A;}
.ob-case-tx h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:23px;line-height:1.25;color:#FAFAFA;}
.ob-case-tx p{margin:0;font-size:15.5px;line-height:1.6;color:#BDBDBD;}
.ob-case-tx blockquote{margin:8px 0 0;padding-left:16px;border-left:2px solid rgba(255,255,255,.3);font-size:15px;line-height:1.6;color:#E2E2E2;font-style:italic;}
.ob-case-tx cite{font-style:normal;font-size:13.5px;color:#8A8A8A;}
/* расписание — лист ожидания */
.ob-wait{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:20px;margin-top:48px;align-items:stretch;}
.ob-cal{padding:30px 32px;border-radius:16px;background:#FFFFFF;border:1px solid #E6E6E6;}
.ob-cal-row{display:grid;grid-template-columns:120px minmax(0,1fr) auto;gap:20px;align-items:center;padding:18px 0;border-bottom:1px solid #EDEDED;}
.ob-cal-row:last-child{border-bottom:0;}
.ob-cal-row i{font-style:normal;font-family:'PT Mono',monospace;font-size:12px;letter-spacing:.08em;color:#9A9A9A;}
.ob-cal-row h3{margin:0 0 4px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:17px;line-height:1.3;color:#141414;}
.ob-cal-row p{margin:0;font-size:14px;line-height:1.5;color:#6A6A6A;}
.ob-cal-row a{white-space:nowrap;font-size:13.5px;font-weight:600;color:#141414;text-decoration:underline;text-underline-offset:4px;}
.ob-wait-note{display:flex;flex-direction:column;gap:14px;padding:32px;border-radius:16px;background:#141414;color:#FAFAFA;}
.ob-wait-note b{font-family:'PT Mono',monospace;font-weight:400;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#8A8A8A;}
.ob-wait-note h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:25px;line-height:1.25;}
.ob-wait-note p{margin:0;font-size:15.5px;line-height:1.6;color:#BDBDBD;}
.ob-wait-note .pr-btn{margin-top:auto;align-self:flex-start;}
@media (max-width:1099px){
  .kl-paths.ob-4{grid-template-columns:1fr 1fr;} .ob-mods{grid-template-columns:1fr 1fr;}
  .ob-cases,.ob-wait{grid-template-columns:1fr;} .ob-role{grid-template-columns:1fr;} .ob-role-ph{min-height:300px;}
}
@media (max-width:699px){
  .ob-roles{flex-wrap:nowrap;overflow-x:auto;margin-left:-20px;margin-right:-20px;padding:0 20px 4px;scrollbar-width:none;}
  .ob-roles::-webkit-scrollbar{display:none;}
  .ob-roles button{flex:0 0 auto;padding:12px 16px;font-size:14px;}
  .ob-role-ph{min-height:220px;} .ob-role-tx{padding:26px 20px 26px;} .ob-role-tx h3{font-size:22px;}
  .kl-paths.ob-4,.ob-mods{grid-template-columns:1fr;} .ob-mods div{padding-right:0;}
  .ob-case-ph{height:240px;} .ob-case-tx{padding:24px 20px 26px;} .ob-case-tx h3{font-size:20px;}
  .ob-cal{padding:8px 20px;} .ob-cal-row{grid-template-columns:1fr;gap:6px;} .ob-wait-note{padding:24px 20px;}
}
</style>
'''

OB_JS = '''<script>
(function(){ /* выбор роли: вкладки */
  var bt=[].slice.call(document.querySelectorAll('.ob-roles button')),pn=[].slice.call(document.querySelectorAll('.ob-role'));
  bt.forEach(function(b,i){b.addEventListener('click',function(){bt.forEach(function(x,j){x.setAttribute('aria-selected',j===i);pn[j].classList.toggle('on',j===i);});});});
})();
</script>'''

# ---------- 1. выбор роли ----------
ROLES = [
    ('Звукорежиссёр', 'showroom/ph/20260819_131054.jpg', 'Для звукорежиссёров', 'Звук, которому доверяют с первого саундчека',
     'Разберём, как устроены наши системы и почему они звучат именно так. Вы поймёте, что крутить, а что лучше не трогать, и будете уверенно работать на любой площадке с DS PROAUDIO.',
     ['Настройка массива под зал: угол, задержки, кривизна', 'Работа с пресетами DSP и эквализацией', 'Кардиоидные сабвуферы: как убрать гул со сцены', 'Практика на массивах TAURA и ERA'],
     'Звукорежиссёр'),
    ('Системный инженер', 'showroom/ph/20260819_131142.jpg', 'Для системных инженеров', 'От расчёта до выровненной системы',
     'Практика выравнивания системы на реальном оборудовании: измерения, фаза, стыковка сабвуферов с массивом. То, что не прочитаешь в инструкции.',
     ['Измерения и выравнивание системы', 'Стыковка сабвуферов и массива по фазе', 'Зонирование и покрытие без провалов', 'Разбор типичных ошибок на площадках'],
     'Системный инженер'),
    ('Проектировщик и интегратор', 'production/eng-2.jpg', 'Для проектировщиков и интеграторов', 'Закладывайте наши системы в проект быстро и без ошибок',
     'Покажем, как работать с нашими файлами EASE, DWG и программой расчёта SoundMath, как подобрать систему под зал и собрать комплект документов, в том числе для госзакупок с реестром ГИСП.',
     ['Акустический расчёт в EASE и SoundMath', 'Файлы GLL, DWG, инструкции и пресеты', 'Подбор серии под тип объекта', 'Документы ГИСП для закупок по 44-ФЗ и 223-ФЗ'],
     'Проектировщик или интегратор'),
    ('Технический персонал площадки', 'showroom/ph/20260819_124218.jpg', 'Для ДК, театров, школ и вузов', 'Чтобы новая система служила долго и звучала как в первый день',
     'Обучим техническую службу площадки, которая купила или выбирает DS PROAUDIO: безопасная эксплуатация, ежедневное включение, быстрые настройки под мероприятие и уход за оборудованием.',
     ['Включение, выключение и коммутация', 'Готовые сцены под концерт, спектакль и собрание', 'Безопасный подвес и осмотр риггинга', 'Гарантия и сервис: куда звонить, если что-то случилось'],
     'Технический персонал площадки'),
    ('Прокатная компания', 'showroom/ph/20260819_131043.jpg', 'Для прокатных компаний', 'Быстрее собрать, точнее настроить, дольше прослужит',
     'Обучение для команды, которая возит TAURA и другие наши системы: быстрый монтаж и подвес, настройка под разные площадки, бережная транспортировка.',
     ['Подвес и риггинг TAURA: быстро и безопасно', 'Типовые конфигурации под площадки разного размера', 'Кардиоидные массивы сабвуферов', 'Транспортировка, кейсы и обслуживание'],
     'Прокатная компания'),
]
roles_html = ('<div class="ob-roles" role="tablist">' + ''.join(
    f'<button type="button" role="tab" aria-selected="{"true" if i == 0 else "false"}">{r[0]}</button>' for i, r in enumerate(ROLES)) + '</div>'
    + ''.join(f'''<div class="ob-role{' on' if i == 0 else ''}" role="tabpanel"><div class="ob-role-ph"><img src="{A}{ph}" alt="{E(t)}" loading="lazy"></div>
<div class="ob-role-tx"><b>{k}</b><h3>{t}</h3><p>{d}</p><ul>{''.join(f'<li>{x}</li>' for x in li)}</ul>
<a href="#request" class="pr-btn" data-fill="role={fill}">Хочу на обучение →</a></div></div>''' for i, (_, ph, k, t, d, li, fill) in enumerate(ROLES)))

# ---------- 2. форматы ----------
FMT = [('Открытый семинар', 'В шоуруме в Москве', 'Группа специалистов из разных компаний. Теория и практика на массивах, которые висят в зале. Хороший способ познакомиться с системами и задать вопросы инженерам.', 'Семинар в шоуруме', 'Записаться →'),
       ('Обучение команды', 'Для одной организации', 'Программа под ваши задачи и ваше оборудование: для технической службы площадки, прокатной компании или отдела интегратора.', 'Обучение команды', 'Обсудить программу →'),
       ('На вашей площадке', 'После поставки системы', 'Инженер DS PROAUDIO обучает персонал на смонтированной системе в вашем зале. Решение о выезде — индивидуально, после консультации.', 'Обучение на площадке', 'Узнать условия →'),
       ('Для проектировщиков', 'Расчёт и документация', 'Как работать с файлами EASE, DWG и SoundMath, подбирать систему под зал и готовить документы для закупки с реестром ГИСП.', 'Проектировщикам', 'Записаться →')]
fmt_html = '<div class="kl-paths ob-4 ob-fmt">' + ''.join(
    f'<div class="kl-path reveal"><b>{i+1:02d} · {s.upper()}</b><h3>{t}</h3><p>{d}</p><a href="#request" class="pr-btn" data-fill="fmt={f}">{c}</a></div>'
    for i, (t, s, d, f, c) in enumerate(FMT)) + '</div>'

# ---------- 3. программа ----------
MODS = [('Как работает линейный массив', 'Интерференция, когерентность, почему массив «бьёт» далеко и ровно. Без формул там, где они не нужны.', 'теория'),
        ('Подвес и риггинг', 'Сборка, углы между модулями, подвес на лебёдках, проверка точек и безопасность.', 'практика'),
        ('Настройка и пресеты DSP', 'Усилители DA, процессоры, готовые пресеты DS PROAUDIO и когда их стоит менять.', 'практика'),
        ('Измерения и выравнивание', 'Измерительный микрофон, задержки, фаза, стыковка сабвуферов и фронта.', 'практика'),
        ('Акустический расчёт', 'EASE, файлы GLL и наша программа SoundMath: покрытие зала до покупки.', 'теория + практика'),
        ('Эксплуатация и сервис', 'Ежедневная работа, уход, типичные неисправности, гарантия 3 года и сервис.', 'теория')]
mods_html = '<div class="ob-mods">' + ''.join(
    f'<div class="reveal"><b>{i+1:02d}</b><h3>{t}</h3><p>{d}</p><span>{k}</span></div>' for i, (t, d, k) in enumerate(MODS)) + '</div>'

# ---------- 4. нас выбирают для обучения (новости старого сайта; фото с чужих мероприятий не ставим — там другие компании) ----------
def case(kick, title, text, q, who):
    return f'<article class="ob-case reveal"><div class="ob-case-tx"><b>{kick}</b><h3>{title}</h3><p>{text}</p><blockquote>{q}</blockquote><cite>{who}</cite></div></article>'

cases_html = '<div class="ob-cases">' + case(
    'SHOW CREW ACADEMY · 2024', 'Наши системы выбрали для обучения системных инженеров',
    'На семинаре по системной инженерии Станислав Белов использовал DS PROAUDIO для практических занятий. Студенты работали с массивами ERA и громкоговорителями CX 108.',
    '«ERA с субами вызвала исключительно положительные эмоции у всех студентов».', 'Станислав Белов, системный инженер, преподаватель Show Crew Academy') + case(
    'КОНГРЕСС ЗВУКОРЕЖИССЁРОВ · САМАРА, 2025', 'TAURA — на главной сцене конгресса',
    'На XI Всероссийском конгрессе звукорежиссёров наш линейный массив звучал на сцене, где шли доклады, мастер-классы и живые выступления. Павел Бабаев провёл на нём часовой мастер-класс.',
    '«Здесь же он звучал мягко и естественно, без резкости, придавая звучанию плотность и тепло».', 'Павел Бабаев, звукорежиссёр группы «Несчастный случай»') + '</div>'

# ---------- 5. расписание ----------
CAL = [('Открытый семинар', 'Линейные массивы TAURA и ERA: теория и практика в шоуруме', 'fmt=Семинар в шоуруме'),
       ('Проектировщикам', 'Акустический расчёт в EASE и SoundMath, файлы и документы ГИСП', 'fmt=Проектировщикам&role=Проектировщик или интегратор'),
       ('Прокатным компаниям', 'Подвес, риггинг и настройка TAURA', 'fmt=Обучение команды&role=Прокатная компания')]
cal_html = '<div class="ob-wait"><div class="ob-cal reveal">' + ''.join(
    f'<div class="ob-cal-row"><i>ДАТА УТОЧНЯЕТСЯ</i><div><h3>{t}</h3><p>{d}</p></div><a href="#request" data-fill="{f}&comment=Лист ожидания: {t}">Получить приглашение</a></div>' for t, d, f in CAL) + \
    '</div><div class="ob-wait-note reveal"><b>Лист ожидания</b><h3>Узнайте о семинаре первыми</h3><p>Мы собираем группы под запрос. Оставьте контакт — пришлём приглашение с датой и программой, как только группа сформируется. Небольшая группа — больше практики у каждого.</p>' \
    '<a href="#request" class="pr-btn" data-fill="fmt=Семинар в шоуруме&comment=Лист ожидания">Встать в лист ожидания →</a></div></div>'

# ---------- страница ----------
MAIN = [
    hero('Обучение и семинары', 'Техподдержка · обучение и семинары', 'Научим настраивать звук так, как задумали инженеры',
         'Семинары и практические занятия для звукорежиссёров, системных инженеров, проектировщиков и технических служб площадок. Теория — по делу, остальное время — практика на настоящих массивах TAURA и ERA в нашем шоуруме в Москве или на вашей площадке.',
         ['showroom/ph/20260819_124844.jpg', 'showroom/ph/20260819_131108.jpg', 'showroom/ph/20260819_131054.jpg', 'showroom/ph/20260819_125233.jpg'],
         [('Практика', 'на подвешенных массивах в шоуруме'), ('Инженеры', 'которые проектируют и делают наши системы')],
         ('request', 'Записаться на обучение'), ('role', 'Подобрать программу'), 'Учебный класс в шоуруме · Москва, 2-й Донской проезд, 4'),
    sec('lt', 'role', 'Кто вы', 'Выберите свою роль — покажем, что вы получите',
        'Программа строится вокруг ваших задач, а не вокруг каталога. Нажмите на свою роль.', roles_html),
    sec('dk', 'formats', 'Форматы', 'Четыре способа научиться',
        'Выберите формат, а программу, длительность и условия подберём под вашу группу после короткого разговора.', fmt_html),
    sec('lt', 'program', 'Программа', 'Чему вы научитесь',
        'Модули собираются под формат и уровень группы. Каждый практический модуль — на настоящем оборудовании.', mods_html),
    sec('dk', 'proof', 'Нам доверяют обучение', 'Системы DS PROAUDIO выбирают, чтобы учить других',
        'Когда преподаватель выбирает систему для практики, он ищет эталон: то, что можно показать студентам как пример хорошего звука.', cases_html
        + '<div style="margin-top:72px;">' + quotes(['Евгений Ефремов', 'Сергей Проскуряков', 'Вадим Ковалевский'], title_more=False) + '</div>'),
    sec('lt', 'where', 'Где проходит обучение', 'Учебный класс там, где висят массивы',
        'Зал шоурума за минуты превращается в класс: проектор, рабочие столы, флипчарт. В нескольких шагах — подвешенные массивы, сабвуферы и мониторы, на которых сразу пробуем теорию.',
        cards([('showroom/ph/20260819_125233.jpg', 'Класс в шоуруме', 'Рабочие места с ноутбуками, проектор и флипчарт. Удобно и теории слушать, и расчёты делать.', ('./showroom.html', 'Посмотреть шоурум')),
               ('showroom/ph/20260819_131142.jpg', 'Практика рядом', 'Массивы, сабвуферы и мониторы в том же зале: от слайда к звуку — без перерыва.'),
               ('showroom/ph/20260819_131108.jpg', 'Настоящая система', 'Подвешенные массивы DS PROAUDIO в настоящем зале с антресолью и балконной зоной.')])),
    sec('dk', 'how', 'Как записаться', 'От заявки до первого занятия — пять шагов', '',
        steps([('Заявка', 'Оставляете заявку или звоните. Указываете роль и формат, который интересен.'),
               ('Разговор', 'Инженер уточняет уровень группы, задачи и оборудование, с которым вы работаете.'),
               ('Программа', 'Собираем модули под вас и называем длительность и условия.'),
               ('Обучение', 'Теория и практика в шоуруме или на вашей площадке.'),
               ('Поддержка после', 'Материалы, файлы из Центра документации и связь с инженером, если появятся вопросы.')])),
    sec('lt', 'schedule', 'Ближайшие семинары', 'Расписание формируется', '', cal_html),
    sec('dk', 'faq', 'Частые вопросы', 'Что спрашивают перед обучением', '',
        faq([('Сколько стоит обучение?', 'Стоимость зависит от формата, длительности и размера группы. Назовём условия после короткого разговора, до записи.'),
             ('Нужен ли опыт?', 'Нет. Программу подбираем под уровень группы: от основ для технической службы площадки до глубокой практики для системных инженеров.'),
             ('Можно ли провести обучение у нас на площадке?', 'Да, особенно после поставки системы: обучение на своём оборудовании запоминается лучше всего. Решение о выезде принимаем по каждому объекту индивидуально, после консультации.'),
             ('Что взять с собой?', 'Ноутбук, если в программе есть расчёты или измерения. Остальное — оборудование, материалы и кофе — за нами.'),
             ('Обучаете только по системам DS PROAUDIO?', 'Практика — на наших системах, но принципы настройки, расчёта и выравнивания универсальны и пригодятся с любым оборудованием.'),
             ('Где взять файлы и инструкции?', 'В <a href="./docs.html">Центре документации</a>: файлы EASE GLL, DWG, инструкции и пресеты DSP. Расчёт покрытия можно сделать в <a href="./software.html">SoundMath</a>.')], dark=True)),
    form('request', 'Обучение и семинары', 'Запись на обучение', 'Запишитесь на семинар или обучение',
         'Оставьте заявку — перезвоним в рабочее время, подберём формат и программу и пришлём приглашение.',
         ['Программа под вашу роль и задачи', 'Практика на массивах TAURA и ERA', 'Инженеры, которые делают наши системы', 'Материалы и поддержка после обучения'],
         F_NAME + F_PHONE + F_ORG + F_CITY +
         '<fieldset class="full"><span class="flb">Кто вы</span>' + seg('role', [r[6] for r in ROLES]) + '</fieldset>'
         '<fieldset class="full"><span class="flb">Формат</span>' + seg('fmt', [f[3] for f in FMT] + ['Пока не знаю']) + '</fieldset>'
         '<label><span class="flb">Сколько человек</span><input type="text" name="people" placeholder="например, 4"></label>'
         + F_MAIL +
         '<label class="full"><span class="flb">Что хотите узнать</span><textarea name="comment" placeholder="Например: купили ERA в ДК на 600 мест, хотим обучить двух звукорежиссёров"></textarea></label>',
         'Записаться', 'Заявка отправлена', 'Мы перезвоним в рабочее время, уточним задачи и пришлём приглашение с программой.',
         card=[('Телефон', f'<a href="tel:{TEL}">{TEL_H}</a>'), ('E-mail', '<a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a>'), ('Часы', 'Пн–Пт, 10:00–19:00')]),
]

NEXT_TP = [('docs.html', 'Центр документации', 'Файлы EASE GLL, DWG, инструкции и пресеты'),
           ('software.html', 'ПО для акустических расчётов', 'SoundMath: расчёт массивов в браузере'),
           ('warranty.html', 'Гарантия и сервис', '3 года гарантии, сервис в Москве и Санкт-Петербурге'),
           ('showroom.html', 'Посетить шоурум', 'Послушать системы в настоящем зале в Москве'),
           ('consultation.html', 'Консультация по объекту', 'Подбор системы и акустический расчёт')]
MAIN.append('''<section class="pr-sec lt kl-next-sec">
  <div class="wrap">
    <div class="pr-kick" style="color:#8A8A8A;">Техподдержка</div>
    <h2 class="pr-h2">Что ещё может пригодиться</h2>
    <div class="kl-next">''' + ''.join(f'<a href="./{h}" class="kl-n reveal"><b>{t}</b><span>{d}</span><i aria-hidden="true">→</i></a>' for h, t, d in NEXT_TP) + '''</div>
  </div>
</section>''')
MAIN.append(fab('request', 'Записаться на обучение'))

# ---------- сборка ----------
head_end = SRC.index('</head>')
m0, m1 = SRC.index('<main>'), SRC.index('</main>') + len('</main>')
head = SRC[:head_end]
head = re.sub(r'<title>.*?</title>', '<title>Обучение и семинары — DS PROAUDIO</title>', head)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + E(
    'Семинары и обучение DS PROAUDIO для звукорежиссёров, системных инженеров, проектировщиков и технических служб площадок: практика на массивах TAURA и ERA в шоуруме в Москве или на вашей площадке.') + '">', head)
head = head.replace('"position":2,"name":"Шоурум"}', '"position":2,"name":"Техподдержка","item":"https://ds-proaudio.ru/support.html"},\n {"@type":"ListItem","position":3,"name":"Обучение и семинары"}')
mid = SRC[head_end:m0].replace('class="mm-item">Обучение, семинары</a>', 'class="mm-item mm-current" aria-current="page">Обучение, семинары</a>', 1)
body = ('<main>\n<!-- ================= Техподдержка: Обучение и семинары (23.10.2026) — сборка: tools/obuchenie/build.py, логика: analiz/obuchenie-2026-10-23.md ================= -->\n'
        + '\n\n'.join(MAIN) + '\n\n' + JS + '\n' + OB_JS + '\n</main>')
out = head + CSS + OB_CSS + mid + body + SRC[m1:]
open(os.path.join(SITE, 'seminars.html'), 'w', encoding='utf-8').write(out)
print('seminars.html', len(out))
