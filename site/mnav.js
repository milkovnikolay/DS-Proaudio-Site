/* DS PROAUDIO — шапка и меню для планшета и телефона (стили — mnav.css).
   На экранах ≥1100 px ничего не показывается: работает обычная шапка и мега-меню. */
(function () {
  if (window.__mnav) return; window.__mnav = 1;
  var LOGO = './assets/ed4decb6b5a70b43cdf0d482d0b1e26e.png', GISP = './assets/gisp-purple.png';
  var CAB = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l4-4-4-4M14 12H4"/></svg>';
  // разделы меню — те же, что в мега-меню и подвале
  var S = [
    ['Госучреждениям', './gov.html', 'Весь раздел', [['Реестр ГИСП', './gov.html', 1], ['GLL', '#'], ['CAD', '#'], ['PDF', '#']]],
    ['Продукция', './products.html', 'Весь каталог', [['Линейные массивы', './products-line-arrays.html'], ['Массивы с фиксированными углами', './products-constant-curvature.html'], ['Звуковые колонны', './products-columns.html'],
      ['Точечные источники звука', './products-point-sources.html'], ['Сценические мониторы', './products-monitors.html'], ['Компактные комплекты', './products-compact-sets.html'], ['Системы для аудиторий', './products-auditorium.html'],
      ['Реестровое оборудование', './products-registry.html'], ['Всепогодные системы', './products-all-weather.html'], ['Усилители', './products-amplifiers.html'], ['Аксессуары', './products-accessories.html'],
      ['Каталог PDF ↗', 'https://ds-proaudio.ru/upload/ds-proaudio-catalog_files/DS_Proaudio_catalog_2025_web.pdf', 1]]],
    ['Применение', './application.html', 'Весь раздел', [['Отзывы', './reviews.html', 1], ['Портфолио', './portfolio.html', 1], ['Культура и искусство', './culture.html'], ['Образование и наука', './education.html'],
      ['Спорт и массовые мероприятия', './sport.html'], ['Корпоративный сектор', './corporate.html'], ['Ресторанный и гостиничный бизнес', './hospitality.html'], ['Религиозные учреждения', './religious.html'],
      ['Индустрия развлечений', './entertainment.html'], ['Прокат', './rental.html']]],
    ['Главная', './Main.dc.html', 'На главную', [['История', './history.html'], ['Философия', './philosophy.html'], ['Лица компании', './faces.html'], ['Наше производство', './production.html'],
      ['Технологии', null, 1, [['Все технологии', './technologies.html'], ['Риггинг без пинов', './tech-rigging.html', 0, 'массивы TAURA, ERA'], ['Коаксиальные массивы', './tech-coaxial-waveguide.html', 0, 'ERA, TAURA 10'],
        ['Горизонтальное сложение', './tech-horizontal-summing.html', 0, 'TAURA 8, PLR, STL'], ['Кардиоидный сабвуфер', './tech-cardioid-sub.html', 0, 'TAURA C‑Sub 18'],
        ['Коаксиальные динамики', './tech-coaxial-cx.html', 0, 'серии CX, MCX'], ['Звуковые катушки на ребро в замке', './tech-voice-coil.html']]],
      ['Блог', '#'], ['Контакты', './contacts.html']]],
    ['Техподдержка', './support.html', 'Весь раздел', [['Обучение, семинары', '#'], ['Центр документации', './docs.html', 0, 'скачать файлы EASE, CAD'], ['ПО для акустических расчётов', '#'], ['Гарантия и сервис', './warranty.html']]],
    ['Клиентам', './clients.html', 'Весь раздел', [['Посетить шоурум', './showroom.html'], ['Запросить выездную демонстрацию', '#'], ['Запросить консультацию по объекту', '#'], ['Узнать цены', '#'], ['Где купить', '#']]]
  ];
  var here = (location.pathname.split('/').pop() || 'Main.dc.html').toLowerCase();
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ext(u) { return /^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''; }
  function link(it) {
    var cur = it[1] && it[1].replace('./', '').toLowerCase() === here ? ' cur' : '';
    return '<a class="mn-l2' + (it[2] ? ' b' : '') + cur + '" href="' + esc(it[1]) + '"' + ext(it[1]) + '>' + esc(it[0]) + (it[3] ? '<span class="s">' + esc(it[3]) + '</span>' : '') + '</a>';
  }
  function count(items) { return items.reduce(function (n, it) { return n + (it[3] && typeof it[3] === 'object' ? 1 : 1); }, 0); }
  var secs = S.map(function (s, i) {
    var body = s[3].map(function (it) {
      if (it[3] && typeof it[3] === 'object') return '<details class="mn-sub"><summary class="mn-l2 b">' + esc(it[0]) + '</summary><div class="in">' + it[3].map(link).join('') + '</div></details>';
      return link(it);
    }).join('');
    return '<div class="mn-sec" data-i="' + i + '"><div class="mn-h" role="button" tabindex="0"><a class="t" href="' + s[1] + '">' + esc(s[0]) + '</a><span class="n">' + count(s[3]) + '</span><span class="chev"></span></div>' +
      '<div class="mn-b"><a class="mn-all" href="' + s[1] + '">' + esc(s[2]) + ' →</a>' + body + '</div></div>';
  }).join('');

  var hd = document.createElement('header');
  hd.className = 'mn-hd';
  hd.innerHTML = '<div class="mn-in"><div class="mn-l"><button type="button" class="mn-burger" aria-expanded="false" aria-controls="mnMenu"><i></i><span>Меню</span></button></div>' +
    '<a class="mn-logo" href="./Main.dc.html" aria-label="DS PROAUDIO — на главную"><img src="' + LOGO + '" alt=""></a>' +
    '<div class="mn-r"><a class="mn-gisp" href="./gov.html" aria-label="ГИСП — госучреждениям"><img src="' + GISP + '" alt=""></a>' +
    '<a class="mn-ic" href="#" aria-label="Кабинет партнёра">' + CAB + '</a>' +
    '<button type="button" class="mn-burger m" aria-expanded="false" aria-controls="mnMenu" aria-label="Меню"><i></i><span>Меню</span></button></div></div>';
  var nav = document.createElement('nav');
  nav.className = 'mn-menu'; nav.id = 'mnMenu'; nav.setAttribute('aria-label', 'Меню сайта');
  nav.innerHTML = '<div class="mn-wrap"><label class="mn-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
    '<input type="search" placeholder="Найти в меню: TAURA, кардиоид, цены…" autocomplete="off" aria-label="Поиск по меню"></label>' +
    '<div class="mn-grid">' + secs + '</div><div class="mn-nores">Ничего не найдено. Спросите помощника — он подскажет раздел или передаст вопрос менеджеру.</div>' +
    '<div class="mn-foot"><div class="row"><a class="mn-phone" href="tel:+74951501238">8 495 150-12-38</a>' +
    '<span class="row"><a class="mn-soc" href="https://t.me/dsproaudio" target="_blank" rel="noopener" aria-label="Telegram">ТГ</a><a class="mn-soc" href="https://vk.com/ds_proaudio" target="_blank" rel="noopener" aria-label="ВКонтакте">ВК</a></span></div>' +
    '<div class="row"><a class="mn-cta" href="#contact" data-close>Оставить заявку</a><a class="mn-cta gh" href="#">Кабинет партнёра</a></div></div></div>';

  function mount() {
    if (document.querySelector('.mn-hd')) return;
    document.body.appendChild(hd); document.body.appendChild(nav);
    var root = document.documentElement, btns = [].slice.call(hd.querySelectorAll('.mn-burger'));
    function set(on) { root.classList.toggle('mn-on', on); btns.forEach(function (b) { b.setAttribute('aria-expanded', on ? 'true' : 'false'); }); }
    btns.forEach(function (b) { b.addEventListener('click', function () { set(!root.classList.contains('mn-on')); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) set(false); });
    nav.addEventListener('click', function (e) {
      var h = e.target.closest('.mn-h');
      if (h && window.innerWidth < 700) {
        e.preventDefault();
        var s = h.parentNode, was = s.classList.contains('open');
        [].forEach.call(nav.querySelectorAll('.mn-sec.open'), function (x) { x.classList.remove('open'); });
        if (!was) s.classList.add('open');
        return;
      }
      var a = e.target.closest('a[href]');
      if (a && a.getAttribute('href').charAt(0) === '#') set(false);   // якорь на этой же странице — закрыть меню
    });
    // на телефоне раскрыть раздел текущей страницы
    var cur = nav.querySelector('.mn-l2.cur'); if (cur) { var sec = cur.closest('.mn-sec'); if (sec) sec.classList.add('open'); var d = cur.closest('details'); if (d) d.open = true; }
    // поиск по пунктам меню
    var inp = nav.querySelector('.mn-search input'), nores = nav.querySelector('.mn-nores');
    inp.addEventListener('input', function () {
      var v = inp.value.trim().toLowerCase(), any = false; nav.classList.toggle('mn-searching', !!v);
      [].forEach.call(nav.querySelectorAll('.mn-sec'), function (s) {
        var n = 0;
        [].forEach.call(s.querySelectorAll('.mn-b .mn-l2:not(summary)'), function (a) { var ok = !v || a.textContent.toLowerCase().indexOf(v) >= 0; a.classList.toggle('mn-hide', !ok); if (ok) n++; });
        [].forEach.call(s.querySelectorAll('details.mn-sub'), function (d) { if (v) d.open = !!d.querySelector('.in .mn-l2:not(.mn-hide)'); });
        s.querySelector('.mn-all').classList.toggle('mn-hide', !!v);
        s.classList.toggle('mn-hide', !!v && !n); if (n) any = true;
      });
      nores.style.display = v && !any ? 'block' : 'none';
    });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();

/* ---------- шапка на компьютере (≥1100 px, без отдельной кнопки меню) ----------
   Все пункты шапки — сразу ссылки на свои разделы. Мега-меню открывается щелчком по свободному месту шапки.
   Подсказка (21.10.2026): над свободным местом курсор — «рука», по нижнему краю шапки от центра растягивается тонкая линия
   (светлая над тёмной страницей, тёмная над светлой), а на фоне шапки, под пунктами, проявляется крупная неконтрастная
   надпись «МЕНЮ ▾» («ЗАКРЫТЬ ▴», если меню открыто) — с той стороны от центра, с которой курсор заехал на шапку.
   Пока курсор движется по свободному полю, ничего не меняется. Стили — в mnav.css (.hdr-bgw, .hdr-line).
   Для клавиатуры в шапке есть кнопка .hdr-menu-btn — видна только при фокусе (Tab).
   Обработчики — на document: на главной шапку рисует шаблонизатор и может перерисовать — тогда элементы подсказки добавляются заново. */
(function () {
  var R = document.documentElement, cur = null, side = 'l', lastLc = '', tick = 0;
  function headerOf(t) { var h = t && t.closest ? t.closest('header') : null; return h && !h.classList.contains('mn-hd') && h.querySelector('.hdr-menu-btn') ? h : null; }
  function isFree(t) { return !t.closest('a,button,input,select,textarea,label'); }
  function desktop() { return window.innerWidth >= 1100; }
  function zk() { return parseFloat(R.style.zoom) || parseFloat(getComputedStyle(R).zoom) || 1; }
  function btnOf(h) { return h.querySelector('.hdr-menu-btn'); }
  function opened(h) { return btnOf(h).getAttribute('aria-expanded') === 'true'; }
  // элементы подсказки: фон-надпись (первым ребёнком, под пунктами) и линия
  function ensure(h) {
    if (h.querySelector(':scope > .hdr-bgw')) return;
    var bg = document.createElement('div'); bg.className = 'hdr-bgw'; bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML = '<div class="hdr-word"><span>Меню</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 8l8 8 8-8"/></svg></div>';
    var line = document.createElement('div'); line.className = 'hdr-line'; line.setAttribute('aria-hidden', 'true');
    h.insertBefore(bg, h.firstChild); h.appendChild(line);
    var row = h.querySelector('.ds-row'); if (row) { row.style.position = 'relative'; row.style.zIndex = '1'; }
    sync(h);
  }
  // стрелка ▾ попадает в свободный промежуток: слева — между «Применением» и логотипом, справа — между «Техподдержкой» и «Клиентам»
  function place(h) {
    var w = h.querySelector('.hdr-word'); if (!w) return;
    var z = zk(), hr = h.getBoundingClientRect();
    function rr(el) { var r = el.getBoundingClientRect(); return { l: (r.left - hr.left) / z, r: (r.right - hr.left) / z }; }
    var a = [].slice.call(h.querySelectorAll('.nav-trigger')), logo = h.querySelector('a[aria-label^="DS PROAUDIO"]');
    var ar = w.querySelector('svg'), tail = w.offsetWidth - ar.getBoundingClientRect().width / z / 2, x;
    if (side === 'l' && a[1] && logo) x = (rr(a[1]).r + rr(logo).l) / 2 - tail;
    else if (side === 'r' && a[2] && a[3]) x = (rr(a[2]).r + rr(a[3]).l) / 2 - tail;
    else x = hr.width / z / 2 - w.offsetWidth / 2;
    w.style.left = x.toFixed(1) + 'px';
  }
  function sync(h) {
    var o = opened(h), w = h.querySelector('.hdr-word'); if (!w) return;
    h.classList.toggle('hdr-open', o); w.firstChild.textContent = o ? 'Закрыть' : 'Меню'; place(h);
  }
  // цвет линии — по фону страницы сразу под шапкой: светлая на тёмном, тёмная на светлом
  function bgAt(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && el !== R) {
      if (el.closest && el.closest('header')) return null;
      var c = getComputedStyle(el).backgroundColor, m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > .5)) return [+m[0], +m[1], +m[2]];
      if (/^(IMG|VIDEO|CANVAS)$/.test(el.tagName)) return [30, 30, 30];
      el = el.parentElement;
    }
    var b = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g); return b ? [+b[0], +b[1], +b[2]] : [255, 255, 255];
  }
  function lineColor() {
    tick = 0; var h = cur || headerOf(document.querySelector('header .hdr-menu-btn')); if (!h || !desktop()) return;
    var hr = h.getBoundingClientRect(), y = hr.bottom + 3, L = 0, n = 0;
    [.25, .5, .75].forEach(function (k) { var c = bgAt(hr.left + hr.width * k, y); if (c) { L += (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255; n++; } });
    if (!n) return; L /= n;
    var lc = L > .55 ? 'rgba(20,20,22,.55)' : 'rgba(242,242,242,.6)';
    if (lc !== lastLc) { lastLc = lc; R.style.setProperty('--hdr-lc', lc); }
  }
  function off() { if (cur) cur.classList.remove('hdr-free'); cur = null; }
  document.addEventListener('mouseover', function (e) {
    var h = headerOf(e.target); if (!h || !desktop()) return;
    var from = headerOf(e.relatedTarget);
    if (from !== h) {                       // курсор только что заехал на шапку — выбираем сторону
      ensure(h); var hr = h.getBoundingClientRect(); side = e.clientX < hr.left + hr.width / 2 ? 'l' : 'r';
      h.classList.remove('hdr-side-l', 'hdr-side-r'); h.classList.add('hdr-side-' + side); place(h); lineColor();
    }
  }, { passive: true });
  document.addEventListener('mousemove', function (e) {
    var h = headerOf(e.target);
    if (!h || !desktop() || !isFree(e.target)) { off(); if (h) h.classList.remove('hdr-free'); return; }
    ensure(h); cur = h; h.classList.add('hdr-free');
  }, { passive: true });
  document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) off(); });
  window.addEventListener('blur', off);
  window.addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(lineColor); }, { passive: true });
  window.addEventListener('resize', function () { var h = document.querySelector('header .hdr-bgw'); if (h) place(h.parentNode); lineColor(); });
  document.addEventListener('click', function (e) {
    var h = headerOf(e.target);
    if (!h || !desktop() || !isFree(e.target)) return;
    btnOf(h).click();
  });
  function init() {
    var st = document.createElement('style');
    st.textContent =
      '.hdr-menu-btn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;opacity:0;pointer-events:none;background:#FAFAFA;color:#0A0A0B;border:0;border-radius:99px;' +
      'padding:8px 16px;font:500 11.5px "PT Mono",monospace;letter-spacing:.1em;text-transform:uppercase}' +
      '.hdr-menu-btn:focus-visible{opacity:1;pointer-events:auto;outline:2px solid #7FB2FF;outline-offset:2px}' +
      'header.hdr-free{cursor:pointer}';
    document.head.appendChild(st);
    var b = document.querySelector('header .hdr-menu-btn'); if (b) ensure(b.closest('header'));
    // меню открыли/закрыли (любым способом) — «Меню ▾» ⇄ «Закрыть ▴»; на главной кнопку может пересоздать шаблонизатор, поэтому следим за всем документом
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.classList && t.classList.contains('hdr-menu-btn')) { var h = t.closest('header'); if (h && h.querySelector('.hdr-word')) sync(h); } }
    }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['aria-expanded'] });
    setTimeout(lineColor, 300);
    if (document.fonts) document.fonts.ready.then(function () { var h = document.querySelector('header .hdr-bgw'); if (h) place(h.parentNode); });
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();

/* «Технологии» в меню и подвале: нажатие на слово — переход в раздел (список при этом не раскрывается), на стрелку — раскрыть/свернуть список */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('.tech-dd > summary .tech-go');
  if (!a) return;
  e.preventDefault();               // не даём <summary> раскрыть список…
  window.location.href = a.href;    // …и переходим на страницу раздела
}, true);
