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
   Все пункты шапки — сразу ссылки на свои разделы.
   Мега-меню также открывается щелчком по свободному месту шапки.
   Над свободным местом рядом с курсором появляется подсказка «Меню» («Закрыть меню», если оно открыто).
   Для клавиатуры в шапке есть кнопка .hdr-menu-btn — видна только при фокусе (Tab).
   Обработчики — на document: на главной шапку рисует шаблонизатор и может перерисовать. */
(function () {
  var tip, label, cur = null;
  function init() {
    var st = document.createElement('style');
    st.textContent =
      '.hdr-menu-btn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;opacity:0;pointer-events:none;background:#FAFAFA;color:#0A0A0B;border:0;border-radius:99px;' +
      'padding:8px 16px;font:500 11.5px "PT Mono",monospace;letter-spacing:.1em;text-transform:uppercase}' +
      '.hdr-menu-btn:focus-visible{opacity:1;pointer-events:auto;outline:2px solid #7FB2FF;outline-offset:2px}' +
      'header.hdr-free{cursor:pointer}' +
      '.hdr-tip{position:fixed;z-index:200;left:0;top:0;pointer-events:none;padding:0;background:none;border:0;color:#F2F2F2;' +
      'text-shadow:0 0 8px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.9);' +
      // шрифт — как у пунктов шапки (.nav-trigger: «Продукция», «Применение»…)
      'font:400 12.5px/1.2 "IBM Plex Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;' +
      'opacity:0;transition:none;will-change:transform}' +
      '.hdr-tip.on{opacity:1}' +
      '@media (max-width:1099px),(hover:none){.hdr-tip{display:none}}';
    document.head.appendChild(st);
    tip = document.createElement('div'); tip.className = 'hdr-tip'; tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<span>Меню</span>';
    document.body.appendChild(tip);
    label = tip.querySelector('span');

    function headerOf(t) { var h = t && t.closest ? t.closest('header') : null; return h && !h.classList.contains('mn-hd') && h.querySelector('.hdr-menu-btn') ? h : null; }
    function isFree(t) { return !t.closest('a,button,input,select,textarea,label'); }
    function opened(h) { return h.querySelector('.hdr-menu-btn').getAttribute('aria-expanded') === 'true'; }
    function desktop() { return window.innerWidth >= 1100; }
    function hide() { tip.classList.remove('on'); if (cur) cur.classList.remove('hdr-free'); cur = null; }

    document.addEventListener('mousemove', function (e) {
      var h = headerOf(e.target);
      if (!h || !desktop() || !isFree(e.target)) { hide(); if (h) h.classList.remove('hdr-free'); return; }
      cur = h; h.classList.add('hdr-free');
      label.textContent = opened(h) ? 'Закрыть меню' : 'Меню';
      // сайт может быть увеличен через zoom у <html>: координаты подсказки делим на масштаб
      var z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      // плашка центром под курсором
      tip.style.transform = 'translate(' + (e.clientX / z) + 'px,' + (e.clientY / z) + 'px) translate(-50%,-50%)';
      tip.classList.add('on');
    }, { passive: true });
    // курсор ушёл за пределы окна (например, вверх через край шапки) — прячем подсказку
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) hide(); });
    document.documentElement.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', hide, { passive: true });
    document.addEventListener('click', function (e) {
      var h = headerOf(e.target);
      if (!h || !desktop() || !isFree(e.target)) return;
      h.querySelector('.hdr-menu-btn').click();
      setTimeout(function () { var hh = document.querySelector('header .hdr-menu-btn'); if (hh) label.textContent = hh.getAttribute('aria-expanded') === 'true' ? 'Закрыть меню' : 'Меню'; }, 40);
    });
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
