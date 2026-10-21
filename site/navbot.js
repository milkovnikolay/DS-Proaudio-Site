/* =====================================================================
   DS PROAUDIO — помощник по навигации (в правом нижнем углу выпадающего меню)
   Работает без сервера: подбирает разделы сайта по ключевым словам.
   Показывается только когда открыто выпадающее меню.
   Чтобы добавить/поправить ответы — правьте массив PAGES ниже.
   ===================================================================== */
(function () {
  if (window.__dsNavBot) return; window.__dsNavBot = true;

  var ACCENT = '#FAFAFA';
  var MAIN = './Main.dc.html';

  /* soon: true — раздел ещё в разработке, бот предложит связаться с нами */
  var PAGES = [
    // ---- раздел «Продукция» (страницы собираются скриптом из assets/products/products.json) ----
    { t: 'Продукция: Линейные массивы', u: './products-line-arrays.html', k: ["линейн", "массив", "taura", "таура"] },
    { t: 'Продукция: Массивы постоянной направленности', u: './products-constant-curvature.html', k: ["era", "эра", "кластер", "постоянной направленности", "фиксированн"] },
    { t: 'Продукция: Звуковые колонны', u: './products-columns.html', k: ["колонн", "pillar", "пиллар", "stella", "стелла"] },
    { t: 'Продукция: Сценические мониторы', u: './products-monitors.html', k: ["монитор", "mcx"] },
    { t: 'Продукция: Компактные комплекты', u: './products-compact-sets.html', k: ["комплект", "ant", "компактн"] },
    { t: 'Продукция: Точечные источники звука', u: './products-point-sources.html', k: ["точечн", "cx 1", "колонк", "акустическ систем", "сабвуфер"] },
    { t: 'Продукция: Акустика для аудиторий', u: './products-auditorium.html', k: ["аудитор", "adr", "потолочн"] },
    { t: 'Продукция: Реестровое оборудование', u: './products-registry.html', k: ["реестр", "гисп", "госзакуп", "44-фз", "223-фз", "минпромторг"] },
    { t: 'Продукция: Всепогодные системы', u: './products-all-weather.html', k: ["всепогодн", "ip55", "улиц"] },
    { t: 'Продукция: Усилители мощности', u: './products-amplifiers.html', k: ["усилител", "da2", "da4", "dsp"] },
    { t: 'Продукция: Аксессуары', u: './products-accessories.html', k: ["аксессуар", "стойк", "лир", "кронштейн", "рама", "кабел", "сумк", "чехол"] },
    { t: 'Серия TAURA', u: './series-taura.html', k: ["taura"] },
    { t: 'Серия ERA-i', u: './series-era-i.html', k: ["era-i"] },
    { t: 'Серия ERA', u: './series-era.html', k: ["era"] },
    { t: 'Серия PILLAR', u: './series-pillar.html', k: ["pillar"] },
    { t: 'Серия STELLA', u: './series-stella.html', k: ["stella"] },
    { t: 'Серия MCX', u: './series-mcx.html', k: ["mcx"] },
    { t: 'Серия CX', u: './series-cx.html', k: ["cx"] },
    { t: 'Серия ANT', u: './series-ant.html', k: ["ant"] },
    { t: 'Серия AUDITORIUM', u: './series-auditorium.html', k: ["auditorium"] },
    { t: 'Серия DA', u: './series-da.html', k: ["da"] },
    // ---- раздел «Технологии» (assets/technologies/technologies.json) ----
    { t: 'Технологии DS PROAUDIO', u: './technologies.html', k: ["технолог", "патент", "инженер"] },
    { t: 'Технология: риггинг без пинов', u: './tech-rigging.html', k: ["риггинг", "пин", "замок", "подвес", "крепл", "сборк"] },
    { t: 'Технология: коаксиальные динамики с волноводами', u: './tech-coaxial-waveguide.html', k: ["волновод", "коаксиальн масс", "симметр", "208011"] },
    { t: 'Технология: горизонтальное сложение волноводов', u: './tech-horizontal-summing.html', k: ["горизонтальн", "сложени", "когерентн", "2786503"] },
    { t: 'Технология: двухполосный элемент массива (TAURA 8)', u: './tech-two-way-element.html', k: ["двухполосн", "элемент массива", "гибридн", "taura 8", "2835362"] },
    { t: 'Технология: кардиоидный сабвуфер TAURA C-SUB 18', u: './tech-cardioid-sub.html', k: ["кардиоид", "c-sub", "сабвуфер сзади", "тыл"] },
    { t: 'Технология: коаксиальные динамики', u: './tech-coaxial-cx.html', k: ["коаксиал", "соосн", "интерференц"] },
    { t: 'Технология: звуковые катушки на ребро «в замок»', u: './tech-voice-coil.html', k: ["катушк", "на ребро", "в замок", "edgewound", "400"] },
    // ---- главная: блоки ----
    { t: 'Продукция', u: MAIN + '#products', k: ['продукц','каталог','линейн','массив','колонн','точечн','монитор','усилител','аксессуар','комплект','сабвуфер','колонк','акустик','реестров','всепогод','оборудован','taura','era'] },
    { t: 'Технологии и производство', u: MAIN + '#tech', k: ['технолог','риггинг','пин','коаксиал','горизонтальн','кардиоид','катушк','производств','завод','качеств','cx','mcx','plr','stl'] },
    { t: 'Портфолио — реализованные объекты', u: './portfolio.html', k: ['портфолио','объект','пример','реализ','проекты','кейс','работы'] },
    { t: 'Производство', u: './production.html', k: ['производств','завод','цех','локализ','реестр минпром','экскурси'] },
    { t: 'История компании', u: './history.html', k: ['истори','как начинал','основан','сзт','специальные звуковые','дип саунд','лэти','алдошин','локализац','с какого года','когда появ'] },
    { t: 'Философия', u: './philosophy.html', k: ['философи','принцип','ценност','миссия','подход к разработ','почерк'] },
    { t: 'Лица компании', u: './faces.html', k: ['лица','команд','сотрудник','руководств','директор','основател','старченко','моцар','мильков','новиков','кто работает'] },
    { t: 'Отзывы', u: './reviews.html', k: ['отзыв','мнени','рекомендац'] },
    { t: 'Контакты и заявка', u: '#contact', k: ['контакт','связ','телефон','позвон','звонок','написать','почт','email','e-mail','заявк','адрес','менеджер'] },

    // ---- Применение ----
    { t: 'Культура и искусство', u: './culture.html', k: ['культур','искусств'] },
    { t: 'Концертные залы и филармонии', u: './concert-halls.html', k: ['концертн','филармон','оркестр','симфони','концерт'] },
    { t: 'Драматические и музыкальные театры', u: './theatres.html', k: ['театр','драм','мюзикл','опер','балет','спектакл'] },
    { t: 'Дома культуры', u: './dk.html', k: ['дом культуры','дома культуры','дк'] },
    { t: 'Цирки', u: './circus.html', k: ['цирк','манеж'] },
    { t: 'Музеи и выставочные галереи', u: './museums.html', k: ['музе','выстав','галере','экспозиц'] },
    { t: 'Центры досуга', u: './leisure.html', k: ['досуг','кружк'] },
    { t: 'Мобильные комплекты для уличных мероприятий (IP55)', u: './outdoor.html', k: ['улиц','уличн','открытом воздух','фестивал','мобильн','праздник','площад','ip55','дожд','влаг'] },

    { t: 'Образование и наука', u: './education.html', k: ['образован','наук','школ','вуз','университет','институт','колледж'] },
    { t: 'Актовые залы школ и вузов', u: './edu-assembly.html', k: ['актов','выпускн','линейк'] },
    { t: 'Учебные аудитории и лекционные залы', u: './edu-lecture.html', k: ['аудитор','лекци','лекционн','учебн','класс'] },
    { t: 'Планетарии', u: './edu-planetarium.html', k: ['планетари','купол'] },

    { t: 'Спорт и массовые мероприятия', u: './sport.html', k: ['спорт','массов','соревнован','матч'] },
    { t: 'Дворцы спорта', u: './sport-palaces.html', k: ['дворец спорта','дворцы спорта','дворц'] },
    { t: 'Ледовые арены (IP55)', u: './sport-ice.html', k: ['лед','лёд','ледов','хокке','каток','фигурн'] },
    { t: 'Спортивные и физкультурно-оздоровительные комплексы', u: './sport-complexes.html', k: ['фок','спортзал','спортивный зал','физкультур','фитнес','спорткомплекс'] },
    { t: 'Бассейны и аквапарки (IP55)', u: './sport-pools.html', k: ['бассейн','аквапарк','плаван'] },
    { t: 'Открытые стадионы, ипподромы (IP55)', u: './sport-stadiums.html', k: ['стадион','ипподром','трибун','футбол'] },

    { t: 'Корпоративный сектор', u: './corporate.html', k: ['корпорат','офис','компани','бизнес-центр','переговорн'] },
    { t: 'Конференц-залы', u: './corp-conference.html', k: ['конференц','конференци','презентац','форум','совещан'] },
    { t: 'Переговорные комнаты', u: './corp-meeting.html', k: ['переговор','переговорн','совещани','совещательн','видеосвяз','видеоконференц','meeting'] },
    { t: 'Открытые офисные пространства', u: './corp-openspace.html', k: ['опенспейс','open space','открытый офис','оповещен','фонов'] },
    { t: 'Банкетные залы и ресторанные холлы', u: './corp-banquet.html', k: ['банкет','свадьб','торжеств','холл'] },

    { t: 'Ресторанный и гостиничный бизнес', u: './hospitality.html', k: ['гостиниц','отел','хорека','horeca'] },
    { t: 'Рестораны, бары, пабы', u: './hosp-restaurants.html', k: ['ресторан','бар','паб','кафе'] },
    { t: 'Уличные кафе и летние веранды (IP55)', u: './hosp-terraces.html', k: ['веранд','террас','летн'] },
    { t: 'Сауны, SPA-комплексы (IP55)', u: './hosp-spa.html', k: ['саун','спа','spa','бани','баня','хамам'] },

    { t: 'Религиозные учреждения', u: './religious.html', k: ['религи','культов'] },
    { t: 'Храмы, мечети, синагоги', u: './rel-temples.html', k: ['храм','церк','мечет','синагог','собор','приход'] },

    { t: 'Индустрия развлечений', u: './entertainment.html', k: ['развлечен','клуб'] },
    { t: 'Клубы живой музыки', u: './ent-live.html', k: ['живой музык','живая музык','живую музык','рок','джаз','групп','кавер'] },
    { t: 'Ночные клубы и дискотеки', u: './ent-nightclubs.html', k: ['ночн','дискотек','диджей','dj','танц'] },
    { t: 'Караоке-бары', u: './ent-karaoke.html', k: ['караоке'] },

    { t: 'Прокатные компании', u: './rental.html', k: ['прокат','аренд','rental','rent'] },
    { t: 'Прокат: полнофункциональные решения', u: './rent-full.html', k: ['полнофункц','крупн','больш','стадионн'] },
    { t: 'Прокат: решения для средних площадок', u: './rent-mid.html', k: ['средн'] },
    { t: 'Прокат: компактные и бюджетные решения', u: './rent-compact.html', k: ['компакт','бюджет','недорог','мал'] },

    // ---- разделы в разработке ----
    { t: 'Узнать цены: коммерческое предложение от производителя', u: './prices.html', k: ['цен','стоим','прайс','сколько стоит','коммерческ','кп'] },
    { t: 'Где купить: напрямую или через партнёра в регионе', u: './where-to-buy.html', k: ['купить','покуп','дилер','поставщик','партнер','партнёр','заказ','регион'] },
    { t: 'Шоурум (3D-тур)', u: './showroom.html', k: ['шоурум','showroom','послушать','прослуш','посетить','приехать','адрес','3d','тур'] },
    { t: 'Выездная демонстрация TAURA на вашей площадке', u: './demo.html', k: ['демонстрац','выездн'] },
    { t: 'Консультация по объекту и акустический расчёт', u: './consultation.html', k: ['консультац','расчет','расчёт','подбор','подобрать','проектирован'] },
    { t: 'Центр документации (EASE, CAD, GLL, PDF)', u: './docs.html', k: ['документац','ease','cad','gll','pdf','чертеж','чертёж','скачать','файл','инструкц'] },
    { t: 'Обучение и семинары', soon: true, k: ['обучен','семинар','курс','тренинг'] },
    { t: 'ПО для акустических расчётов: калькулятор массивов SoundMath', u: './software.html', k: ['программ','расчет','расчёт','калькулятор','моделир','симуляц','софт','soundmath','ease focus','акустическ'] },
    { t: 'Срок поставки: наличие на складе и сроки отгрузки', u: './delivery.html', k: ['срок постав','сроки постав','постав','налич','склад','отгруз','доставк','когда привез','ждать'] },
    { t: 'Гарантия и сервис', u: './warranty.html', k: ['гаранти','сервис','ремонт','поломк'] },
    { t: 'Кабинет партнера', soon: true, k: ['кабинет','партнер','вход','логин','регистрац'] },
    { t: 'Блог: проекты, инженерные разборы, интервью', u: './blog.html', k: ['блог','новост','стать','интервью','разбор','событи'] },
    { t: 'О компании: история, философия, лица компании', soon: true, k: ['истори','философи','лица','команд','о компании','компания'] }
  ];

  var SECTIONS = ['./culture.html','./education.html','./sport.html','./corporate.html','./hospitality.html','./religious.html','./entertainment.html','./rental.html'];

  var CHIPS = [
    { label: 'Подобрать звук для площадки', act: 'venues' },
    { label: 'Продукция', q: 'продукция' },
    { label: 'Технологии', q: 'технологии' },
    { label: 'Узнать цены', q: 'цены' },
    { label: 'Связаться с нами', q: 'контакты' }
  ];

  /* ---------------- стили ---------------- */
  var css = ''
  + '.dsb-root{position:fixed;right:40px;bottom:28px;z-index:80;font-family:"Montserrat","Helvetica Neue",Arial,sans-serif;display:none;}'
  + '.dsb-root.dsb-on{display:block;}'
  + '.dsb-launch{display:flex;align-items:center;gap:10px;height:44px;padding:0 18px 0 6px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:#151517;color:#F2F2F2;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:400;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,.45);}'
  + '.dsb-launch:hover{border-color:' + ACCENT + ';}'
  + '.dsb-ava{width:32px;height:32px;border-radius:999px;background:' + ACCENT + ';display:flex;align-items:center;justify-content:center;flex:0 0 auto;}'
  + '.dsb-panel{position:absolute;right:0;bottom:56px;width:360px;max-width:calc(100vw - 32px);height:480px;max-height:calc(100vh - 180px);display:none;flex-direction:column;background:#141416;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.6);overflow:hidden;}'
  + '.dsb-open .dsb-panel{display:flex;}'
  + '.dsb-head{display:flex;align-items:center;gap:10px;padding:14px 14px 12px 16px;border-bottom:1px solid rgba(255,255,255,.08);}'
  + '.dsb-head b{font-size:13px;letter-spacing:.04em;color:#FAFAFA;font-weight:700;}'
  + '.dsb-head span{display:block;font-size:11px;color:#8A8A8A;margin-top:2px;}'
  + '.dsb-x{margin-left:auto;background:none;border:none;color:#9A9A9A;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px;}'
  + '.dsb-x:hover{color:#FAFAFA;}'
  + '.dsb-log{flex:1 1 auto;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;}'
  + '.dsb-msg{max-width:88%;font-size:13.5px;line-height:1.45;padding:10px 12px;border-radius:12px;}'
  + '.dsb-bot{align-self:flex-start;background:#1F1F23;color:#E7E7E7;border-top-left-radius:4px;}'
  + '.dsb-me{align-self:flex-end;background:' + ACCENT + ';color:#0A0A0B;border-top-right-radius:4px;}'
  + '.dsb-links{display:flex;flex-direction:column;gap:6px;margin-top:8px;}'
  + '.dsb-links a{display:block;padding:8px 10px;border-radius:8px;background:#2A2A30;color:#FAFAFA;text-decoration:none;font-size:12.5px;line-height:1.35;}'
  + '.dsb-links a:hover{background:#34343B;}'
  + '.dsb-links a::after{content:" →";color:#9A9A9A;}'
  + '.dsb-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 14px 10px;}'
  + '.dsb-chips button{border:1px solid rgba(255,255,255,.18);background:none;color:#D8D8D8;border-radius:999px;padding:6px 11px;font-family:inherit;font-size:12px;cursor:pointer;}'
  + '.dsb-chips button:hover{border-color:' + ACCENT + ';color:#FFF;}'
  + '.dsb-form{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.08);}'
  + '.dsb-form input{flex:1 1 auto;min-width:0;background:#1F1F23;border:1px solid rgba(255,255,255,.10);border-radius:10px;color:#FAFAFA;font-family:inherit;font-size:13.5px;padding:10px 12px;outline:none;}'
  + '.dsb-form input:focus{border-color:' + ACCENT + ';}'
  + '.dsb-form button{flex:0 0 auto;width:40px;border:none;border-radius:10px;background:' + ACCENT + ';color:#0A0A0B;cursor:pointer;display:flex;align-items:center;justify-content:center;}';

  var BOT_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M9 8 7.6 4.4M15 8l1.4-3.6"/><circle cx="7.3" cy="3.5" r="1"/><circle cx="16.7" cy="3.5" r="1"/><circle cx="9" cy="13.5" r="1.2" fill="#0A0A0B" stroke="none"/><circle cx="15" cy="13.5" r="1.2" fill="#0A0A0B" stroke="none"/><path d="M2 12v3M22 12v3"/></svg>';
  var SEND_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0B" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5l2.5 7.2L14 12l-8.5 1.3z"/></svg>';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return ' ' + String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/g, ' ').replace(/\s+/g, ' ') + ' '; }
  function byUrl(u) { for (var i = 0; i < PAGES.length; i++) if (PAGES[i].u === u) return PAGES[i]; }

  function closeMenu() {
    var b = document.querySelector('[aria-label="Закрыть меню"]');
    if (b) b.click();
  }

  function search(q) {
    var n = norm(q), res = [];
    PAGES.forEach(function (p) {
      var s = 0;
      p.k.forEach(function (k) {
        var kk = norm(k).trim();
        if (kk.length <= 3) { if (n.indexOf(' ' + kk + ' ') >= 0 || n.indexOf(' ' + kk) >= 0 && kk.length === 3) s += 2; }
        else if (n.indexOf(kk) >= 0) s += 1 + kk.length / 10;
      });
      if (norm(p.t).indexOf(n.trim()) >= 0 && n.trim().length > 3) s += 2;
      if (s > 0) res.push({ p: p, s: s });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 4).map(function (r) { return r.p; });
  }


  /* пункты шапки «Продукция», «Применение», «Техподдержка», «Клиентам»: при закрытом меню открывают меню,
     при открытом — ведут на страницу раздела */
  var SECTION_URL = { 'продукция': './products.html', 'применение': './application.html', 'техподдержка': './support.html', 'клиентам': './clients.html' };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button.nav-trigger');
    if (b && b.getAttribute('aria-expanded') === 'true') {
      var u = SECTION_URL[b.textContent.trim().toLowerCase()];
      if (u) { e.preventDefault(); e.stopPropagation(); location.href = u; return; }
    }
    var soon = e.target.closest && e.target.closest('a[data-soon]');
    if (soon && soon.getAttribute('href') === '#') e.preventDefault();
  }, true);

  window.DSNav = { search: search };   // поиск по разделам — им пользуется и помощник в подвале (footbot.js)

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var root = el('div', 'dsb-root');
    var panel = el('div', 'dsb-panel');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Помощник по сайту');
    var head = el('div', 'dsb-head', '<div class="dsb-ava">' + BOT_ICON + '</div><div><b>Помощник DS PROAUDIO</b><span>Подскажу, где что найти на сайте</span></div>');
    var x = el('button', 'dsb-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Свернуть помощника');
    head.appendChild(x);
    var log = el('div', 'dsb-log'); log.setAttribute('aria-live', 'polite');
    var chips = el('div', 'dsb-chips');
    var form = el('form', 'dsb-form');
    var inp = el('input'); inp.type = 'text'; inp.placeholder = 'Например: звук для бассейна'; inp.setAttribute('aria-label', 'Ваш вопрос');
    var send = el('button', null, SEND_ICON); send.type = 'submit'; send.setAttribute('aria-label', 'Отправить');
    form.appendChild(inp); form.appendChild(send);
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form);

    var launch = el('button', 'dsb-launch', '<span class="dsb-ava">' + BOT_ICON + '</span>Помощник');
    launch.type = 'button'; launch.setAttribute('aria-expanded', 'false');
    root.appendChild(panel); root.appendChild(launch);
    // вешаем на <html>, а не на <body>: на главной содержимое body перерисовывается шаблоном
    document.documentElement.appendChild(root);
    try { root.style.fontFamily = getComputedStyle(document.body).fontFamily; } catch (e) {}

    function addMsg(who, text, links) {
      var m = el('div', 'dsb-msg ' + (who === 'me' ? 'dsb-me' : 'dsb-bot'));
      m.appendChild(el('div', null, esc(text)));
      if (links && links.length) {
        var box = el('div', 'dsb-links');
        links.forEach(function (p) {
          var a = el('a', null, esc(p.t)); a.href = p.u;
          a.addEventListener('click', function () { closeMenu(); });
          box.appendChild(a);
        });
        m.appendChild(box);
      }
      log.appendChild(m); log.scrollTop = log.scrollHeight;
    }

    function answer(q) {
      var found = search(q);
      var ready = found.filter(function (p) { return !p.soon; });
      var soon = found.filter(function (p) { return p.soon; });
      var contact = byUrl('#contact');
      if (!found.length) {
        addMsg('bot', 'Не нашёл точного ответа. Попробуйте назвать тип площадки (театр, школа, бассейн, ресторан…) или нужное оборудование. Или напишите нам — подскажем лично.', [contact]);
        return;
      }
      if (ready.length) addMsg('bot', ready.length === 1 ? 'Вот что подойдёт:' : 'Вот что нашлось на сайте:', ready.slice(0, 3));
      if (soon.length) addMsg('bot', '«' + soon[0].t + '» — этот раздел скоро появится на сайте. Пока что оставьте заявку — менеджер ответит.', [contact]);
    }

    function venues() {
      addMsg('bot', 'Выберите тип площадки — покажу решения для неё:', SECTIONS.map(byUrl));
    }

    CHIPS.forEach(function (c) {
      var b = el('button', null, esc(c.label)); b.type = 'button';
      b.addEventListener('click', function () {
        addMsg('me', c.label);
        if (c.act === 'venues') venues(); else answer(c.q);
      });
      chips.appendChild(b);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = inp.value.trim(); if (!q) return;
      addMsg('me', q); inp.value = ''; answer(q);
    });

    var greeted = false;
    function setOpen(open) {
      root.classList.toggle('dsb-open', open);
      launch.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && !greeted) { greeted = true; addMsg('bot', 'Здравствуйте! Я помогу найти нужный раздел. Выберите вариант ниже или напишите, что ищете.'); }
      if (open) setTimeout(function () { inp.focus(); }, 50);
    }
    launch.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!root.classList.contains('dsb-open')); });
    x.addEventListener('click', function () { setOpen(false); });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } }, true);

    // виден только при открытом выпадающем меню
    function menuIsOpen() {
      var t = document.querySelector('.nav-trigger');
      return !!t && t.getAttribute('aria-expanded') === 'true';
    }
    setInterval(function () {
      var on = menuIsOpen();
      if (on !== root.classList.contains('dsb-on')) {
        root.classList.toggle('dsb-on', on);
        if (!on) setOpen(false);
      }
    }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
