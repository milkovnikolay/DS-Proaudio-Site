/* =====================================================================
   DS PROAUDIO — заявка «Расскажите о вашем объекте» (блок #contact внизу страниц).
   Заменяет прежнюю кнопку «Оставить заявку» (она вела сама на себя) формой в три шага:
     1) какой объект и сколько людей, 2) чем помочь и когда, 3) имя и телефон.
   Тип объекта подставляется сам по хлебным крошкам страницы (JSON-LD BreadcrumbList),
   на страницах продукции в заявку добавляется модель или серия.
   Отправка: POST /api/lead (service-api → Telegram менеджерам); если сервер недоступен —
   открывается письмо на info@ds-proaudio.ru с заполненным текстом.
   Оформление — objform.css. Тексты правятся в массивах ниже.
   ===================================================================== */
(function () {
  if (window.__dsObjForm) return; window.__dsObjForm = true;

  var IMG = 'ee0bf56fd26927721b4e5ed50f35f116'; // картинка прежнего блока: по ней узнаём, что это нужная секция
  var TEL = '+74951501238', TEL_H = '+7 495 150-12-38', MAIL = 'info@ds-proaudio.ru';

  var OBJ = ['Театр, концертный зал, ДК', 'Учебное заведение', 'Спорт и массовые мероприятия', 'Офис и конференц-зал',
    'Ресторан, бар, отель', 'Храм', 'Клуб и развлечения', 'Прокат и мероприятия', 'Другое'];
  var CAT = { 'Культура и искусство': 0, 'Образование и наука': 1, 'Спорт и массовые мероприятия': 2, 'Корпоративный сектор': 3,
    'Ресторанный и гостиничный бизнес': 4, 'Религиозные учреждения': 5, 'Индустрия развлечений': 6, 'Прокатные компании': 7 };
  var CAP = ['до 100', '100–500', '500–2 000', 'больше 2 000', 'пока не знаю'];
  var NEED = [
    { k: 'calc', t: 'Акустический расчёт', s: 'Карта покрытия зала в EASE до покупки' },
    { k: 'pick', t: 'Подбор и смета', s: 'Модели, количество и цена от производителя' },
    { k: 'demo', t: 'Выездная демонстрация', s: 'У вас в зале; решение о выезде — после консультации' },
    { k: 'show', t: 'Прослушивание в шоу-руме', s: 'Москва, 2-й Донской проезд, 4' }];
  var WHEN = ['в ближайшие 3 месяца', 'в этом году', 'пока изучаем'];
  var GET = [
    ['Карта покрытия вашего зала', 'Смоделируем объект в EASE и покажем, как будет звучать каждый ряд, ещё до покупки.'],
    ['Система и смета от производителя', 'Подберём модели под задачу и бюджет. Цены завода, без посредников.'],
    ['Услышите вживую', 'В шоу-руме в Москве или на вашей площадке: выезд согласуем индивидуально, после консультации.']];
  var TRUST = ['141 объект в 80 городах', 'Оборудование в реестре ГИСП', 'Гарантия 3 года', 'Сервис в Москве и Санкт-Петербурге'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // хлебные крошки страницы: ['Главная', 'Культура и искусство', 'Цирки']
  function crumbs() {
    var out = [];
    [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      try {
        var d = JSON.parse(s.textContent);
        (Array.isArray(d) ? d : (d['@graph'] || [d])).forEach(function (x) {
          if (x && x['@type'] === 'BreadcrumbList' && !out.length) out = (x.itemListElement || []).map(function (i) { return i.name || (i.item && i.item.name) || ''; });
        });
      } catch (e) {}
    });
    return out;
  }

  var S = null; // состояние формы переживает перерисовку главной (шаблон перерисовывает секции)
  function initState() {
    var c = crumbs(), cat = c[1], last = c.length > 2 ? c[c.length - 1] : '';
    S = { step: 1, obj: '', own: '', cap: '', need: {}, when: '', model: '', name: '', phone: '', city: '', comment: '', consent: false };
    if (cat in CAT) {
      if (last && last !== cat) { S.own = last; S.obj = last; } else S.obj = OBJ[CAT[cat]];
      S.need.calc = true;
    } else if (cat === 'Продукция' && last) {
      S.model = last; S.need.pick = true;
    } else S.need.calc = true;
  }

  function chips(list, cur, attr) {
    return list.map(function (v) { return '<button type="button" class="of-chip' + (v === cur ? ' on' : '') + '" data-' + attr + '="' + esc(v) + '">' + esc(v) + '</button>'; }).join('');
  }
  function needs() { return NEED.filter(function (n) { return S.need[n.k]; }); }
  function submitLabel() {
    var k = needs().map(function (n) { return n.k; }).join(',');
    if (k === 'demo') return 'Запросить выезд';
    if (k === 'show') return 'Записаться на прослушивание';
    if (k === 'pick') return 'Получить подбор и смету';
    return 'Получить расчёт и подбор';
  }

  function cardHTML() {
    var objs = (S.own ? [S.own] : []).concat(OBJ);
    var model = S.model ? '<p class="of-hint">Вы смотрите: <b style="color:#EDEDED;font-weight:500">' + esc(S.model) + '</b>. Подскажем, подойдёт ли она вашему объекту.</p>' : '<p class="of-hint">Так мы сразу поймём масштаб и подготовим решение.</p>';
    var sum = [S.obj, S.cap && (S.cap + ' чел.'), needs().map(function (n) { return n.t; }).join(', '), S.when].filter(Boolean)
      .map(function (v, i) { return '<button type="button" data-go="' + (i < 2 ? 1 : 2) + '">' + esc(v) + '</button>'; }).join('');
    return ''
      + '<div class="of-top"><span>Шаг <b class="of-n">' + S.step + '</b> из 3</span><span>около минуты</span></div>'
      + '<div class="of-bar"><i></i><i></i><i></i></div>'
      // шаг 1
      + '<div class="of-step" data-s="1"><h3 class="of-q">Какой у вас объект?</h3>' + model
      + '<div class="of-chips" data-group="obj">' + chips(objs, S.obj, 'obj') + '</div>'
      + '<div class="of-sub">Сколько человек одновременно в зале или на площадке?</div>'
      + '<div class="of-chips" data-group="cap">' + chips(CAP, S.cap, 'cap') + '</div>'
      + '<div class="of-nav"><button type="button" class="of-next" data-next="2">Дальше</button></div></div>'
      // шаг 2
      + '<div class="of-step" data-s="2"><h3 class="of-q">Чем мы можем помочь?</h3><p class="of-hint">Можно выбрать несколько вариантов.</p>'
      + '<div class="of-need">' + NEED.map(function (n) { return '<button type="button" class="of-chip' + (S.need[n.k] ? ' on' : '') + '" data-need="' + n.k + '"><b>' + n.t + '</b><small>' + n.s + '</small></button>'; }).join('') + '</div>'
      + '<div class="of-sub">Когда планируете закупку или запуск?</div>'
      + '<div class="of-chips" data-group="when">' + chips(WHEN, S.when, 'when') + '</div>'
      + '<div class="of-nav"><button type="button" class="of-back" data-go="1">← Назад</button><button type="button" class="of-next" data-next="3">Дальше</button></div></div>'
      // шаг 3
      + '<div class="of-step" data-s="3"><h3 class="of-q">Куда прислать результат?</h3><p class="of-hint">Инженер позвонит, уточнит детали и подготовит решение под ваш объект.</p>'
      + '<div class="of-sum">' + sum + '</div>'
      + '<div class="of-row"><label class="of-f"><span>Как к вам обращаться *</span><input name="name" autocomplete="name" value="' + esc(S.name) + '"></label>'
      + '<label class="of-f"><span>Телефон *</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7" value="' + esc(S.phone) + '"></label></div>'
      + '<label class="of-f"><span>Город</span><input name="city" autocomplete="address-level2" value="' + esc(S.city) + '"></label>'
      + '<label class="of-f"><span>Пара слов об объекте</span><textarea name="comment" placeholder="Размеры зала, что уже стоит, что не устраивает">' + esc(S.comment) + '</textarea></label>'
      + '<label class="of-agree"><input type="checkbox" name="consent"' + (S.consent ? ' checked' : '') + '> <span>Согласен на <a href="./consent.html" target="_blank" rel="noopener">обработку персональных данных</a></span></label>'
      + '<p class="of-err" aria-live="polite"></p>'
      + '<div class="of-nav"><button type="button" class="of-back" data-go="2">← Назад</button><button type="button" class="of-next of-send">' + submitLabel() + '</button></div>'
      + '<p class="of-note">Ответим в рабочее время, Пн–Пт 10:00–19:00 (МСК). Без рассылок. Можно и позвонить: <a href="tel:' + TEL + '">' + TEL_H + '</a>.</p></div>'
      // готово
      + '<div class="of-done"><div class="of-ok">✓</div><h3 class="of-q">Спасибо' + (S.name ? ', ' + esc(S.name) : '') + '! Заявка у нас.</h3>'
      + '<p class="of-hint">Что будет дальше:</p><ol><li>Инженер позвонит в рабочее время и уточнит детали.</li><li>Подготовим расчёт и подбор системы под ваш объект.</li><li>Пригласим послушать: в шоу-руме или у вас на площадке.</li></ol>'
      + '<div class="of-links"><a href="./portfolio.html">Наши объекты</a><a href="./showroom.html">Шоу-рум</a><a href="./reviews.html">Отзывы</a></div></div>';
  }

  function leftHTML(h2, lead) {
    return '<div class="of-left"><div class="of-kick">Заявка на расчёт · 1 минута</div>'
      + '<h2>' + h2 + '</h2>' + (lead ? '<p class="of-lead">' + lead + '</p>' : '')
      + '<ul class="of-get">' + GET.map(function (g, i) { return '<li><i>0' + (i + 1) + '</i><div><b>' + g[0] + '</b><span>' + g[1] + '</span></div></li>'; }).join('') + '</ul>'
      + '<figure class="of-fig"><img src="./assets/calc/troitsk-theatre-1.jpg" alt="Карта звукового давления в зале театра, расчёт EASE DS PROAUDIO" loading="lazy">'
      + '<figcaption><b>Пример расчёта</b>Карта звукового давления в зале театра: зелёный цвет — ровный звук на всех местах</figcaption></figure>'
      + '<div class="of-trust">' + TRUST.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div></div>';
  }

  function paint(card) {
    card.innerHTML = cardHTML();
    [].forEach.call(card.querySelectorAll('.of-step'), function (s) { s.classList.toggle('on', +s.getAttribute('data-s') === S.step); });
    [].forEach.call(card.querySelectorAll('.of-bar i'), function (b, i) { b.classList.toggle('on', i < S.step); });
    var n1 = card.querySelector('[data-next="2"]'), n2 = card.querySelector('[data-next="3"]');
    if (n1) n1.disabled = !S.obj;
    if (n2) n2.disabled = !needs().length;
  }

  function keep(card) { // сохранить введённое перед перерисовкой
    ['name', 'phone', 'city', 'comment'].forEach(function (k) { var f = card.querySelector('[name="' + k + '"]'); if (f) S[k] = f.value; });
    var c = card.querySelector('[name="consent"]'); if (c) S.consent = c.checked;
  }

  function send(card) {
    keep(card);
    var err = card.querySelector('.of-err'), digits = S.phone.replace(/\D/g, '');
    [].forEach.call(card.querySelectorAll('.of-f'), function (f) { f.classList.remove('bad'); });
    if (!S.name.trim() || digits.length < 10) {
      if (!S.name.trim()) card.querySelector('[name="name"]').parentNode.classList.add('bad');
      if (digits.length < 10) card.querySelector('[name="phone"]').parentNode.classList.add('bad');
      err.textContent = 'Укажите, пожалуйста, имя и телефон, чтобы мы могли связаться.';
      return;
    }
    if (!S.consent) { err.textContent = 'Нужно согласие на обработку персональных данных.'; return; }
    var t = { kind: 'Заявка по объекту: ' + needs().map(function (n) { return n.t.toLowerCase(); }).join(', '), page: location.pathname.split('/').pop() + ' · ' + document.title,
      object: S.obj, capacity: S.cap, needs: needs().map(function (n) { return n.t; }).join(', '), when: S.when, model: S.model,
      name: S.name.trim(), phone: S.phone.trim(), city: S.city.trim(), comment: S.comment.trim() };
    var btn = card.querySelector('.of-send'); btn.disabled = true; btn.textContent = 'Отправляем…';
    function done() { card.classList.add('sent'); var h = card.querySelector('.of-done .of-q'); if (h) h.textContent = 'Спасибо, ' + t.name + '! Заявка у нас.'; }
    function mail() {
      var body = ['Объект: ' + t.object, 'Людей: ' + (t.capacity || '—'), 'Нужно: ' + t.needs, 'Когда: ' + (t.when || '—'), t.model && 'Модель: ' + t.model,
        'Имя: ' + t.name, 'Телефон: ' + t.phone, t.city && 'Город: ' + t.city, t.comment && 'Об объекте: ' + t.comment, 'Страница: ' + t.page].filter(Boolean).join('\n');
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Заявка с сайта: ' + t.object) + '&body=' + encodeURIComponent(body);
      done();
    }
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
      .then(function (r) { if (!r.ok) throw 0; done(); }).catch(mail);
  }

  function wire(card) {
    card.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !card.contains(b)) return;
      keep(card);
      if (b.hasAttribute('data-obj')) S.obj = b.getAttribute('data-obj');
      else if (b.hasAttribute('data-cap')) S.cap = S.cap === b.getAttribute('data-cap') ? '' : b.getAttribute('data-cap');
      else if (b.hasAttribute('data-when')) S.when = S.when === b.getAttribute('data-when') ? '' : b.getAttribute('data-when');
      else if (b.hasAttribute('data-need')) { var k = b.getAttribute('data-need'); S.need[k] = !S.need[k]; }
      else if (b.hasAttribute('data-next')) S.step = +b.getAttribute('data-next');
      else if (b.hasAttribute('data-go')) S.step = +b.getAttribute('data-go');
      else if (b.classList.contains('of-send')) return send(card);
      else return;
      paint(card);
      if (b.hasAttribute('data-next') || b.hasAttribute('data-go')) {
        var f = S.step === 3 && card.querySelector(S.name ? '[name="phone"]' : '[name="name"]');
        if (f && window.matchMedia('(min-width:700px)').matches) f.focus();
        var r = card.getBoundingClientRect(); if (r.top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); send(card); } });
  }

  function mount() {
    var sec = document.getElementById('contact');
    if (!sec || sec.querySelector('.of-wrap')) return;
    if (!sec.querySelector('img[src*="' + IMG + '"]')) return;
    var h2 = sec.querySelector('h2'), p = sec.querySelector('h2 ~ p') || sec.querySelector('p');
    if (!h2) return;
    if (!S) initState();
    var wrap = document.createElement('div'); wrap.className = 'of-wrap';
    wrap.innerHTML = leftHTML(h2.innerHTML, p ? p.innerHTML : '') + '<div class="of-card" role="form" aria-label="Заявка по объекту"></div>';
    sec.innerHTML = ''; sec.appendChild(wrap); sec.classList.add('of-on');
    var card = wrap.querySelector('.of-card'); paint(card); wire(card);
  }

  function start() {
    mount();
    // главная собирается шаблоном и может перерисовать секцию — тогда ставим форму заново
    if (window.MutationObserver) new MutationObserver(function () { mount(); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* ---- телефон: плавающая кнопка заявки внизу экрана.
   Появляется после первого экрана, прячется, когда на экране форма заявки или подвал,
   и пока открыто меню. Ведёт к форме «Расскажите о вашем объекте» на этой же странице. ---- */
(function () {
  if (window.__dsOfBar) return; window.__dsOfBar = true;
  var TEL = 'tel:+74951501238';
  function label() {
    var f = location.pathname.split('/').pop();
    if (/^p-/.test(f)) return 'Запросить цену';
    if (/^(products|series-)/.test(f)) return 'Подобрать систему';
    return 'Обсудить ваш объект';
  }
  function start() {
    if (!document.getElementById('contact')) return;
    var bar = document.createElement('div');
    bar.className = 'of-fab'; bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<a class="of-fab-tel" href="' + TEL + '" aria-label="Позвонить: +7 495 150-12-38" tabindex="-1">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg></a>'
      + '<a class="of-fab-go" href="#contact" tabindex="-1"><span>' + label() + '</span><i aria-hidden="true">→</i></a>';
    document.body.appendChild(bar);
    bar.querySelector('.of-fab-go').addEventListener('click', function (e) {
      var c = document.getElementById('contact'); if (!c) return;
      e.preventDefault(); c.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var ticking = false;
    function inView(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.top < innerHeight - 40 && r.bottom > 0; }
    function upd() {
      ticking = false;
      var menu = document.querySelector('.mn-menu.open, .mn-on');
      var on = innerWidth < 700 && scrollY > innerHeight * 0.85 && !menu
        && !inView(document.getElementById('contact')) && !inView(document.querySelector('footer'));
      if (on !== bar.classList.contains('on')) {
        bar.classList.toggle('on', on);
        bar.setAttribute('aria-hidden', on ? 'false' : 'true');
        bar.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    document.addEventListener('click', function () { setTimeout(req, 60); });
    upd();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
