/* =====================================================================
   DS PROAUDIO — помощник в подвале: «перезвонить или помочь чем-то ещё».
   Работает без сервера. Заявка на звонок:
     • если задан CALLBACK_URL — отправляется туда POST-запросом (JSON: name, phone, time, page);
     • если нет — открывается письмо на info@ds-proaudio.ru с уже заполненным текстом.
   Свободный вопрос ищется по разделам сайта (через поиск помощника навигации, navbot.js).
   Обработчики навешаны на document — подвал может перерисовываться (главная) и всё равно работает.
   ===================================================================== */
(function () {
  if (window.__dsFootBot) return; window.__dsFootBot = true;

  var CALLBACK_URL = '';                       // адрес приёма заявок (например, обработчик формы на хостинге); пусто — письмо
  var PHONE = '8 495 150-12-38', TEL = 'tel:+74951501238', MAIL = 'info@ds-proaudio.ru';
  var AGREEMENT = '#';                         // страница «Обработка персональных данных»
  var HOURS = 'Пн–Пт, 10:00–19:00 (МСК)';
  var MAIN = './Main.dc.html';

  function contactHref() { return document.getElementById('contact') ? '#contact' : MAIN + '#contact'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel) { return document.querySelector(sel); }
  function log() { return $('#dsFootBot .dsf-bot-log'); }

  function add(who, html) {
    var l = log(); if (!l) return;
    var m = document.createElement('div'); m.className = 'dsf-msg ' + who; m.innerHTML = html;
    l.appendChild(m); l.scrollTop = l.scrollHeight;
    return m;
  }
  function links(arr) {
    return '<span class="dsf-links">' + arr.map(function (p) { return '<a href="' + p[1] + '">' + esc(p[0]) + '</a>'; }).join('') + '</span>';
  }
  function mailto(subject, body) { return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); }

  var callbackFormHTML =
    '<form class="dsf-cb" novalidate>' +
      '<input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name">' +
      '<input type="tel" name="phone" placeholder="Телефон" autocomplete="tel" required>' +
      '<input type="text" name="time" placeholder="Когда удобно (необязательно)">' +
      '<label class="dsf-agree"><input type="checkbox" name="agree"> <span>Согласен на <a href="' + AGREEMENT + '" target="_blank" rel="noopener">обработку персональных данных</a></span></label>' +
      '<div class="dsf-err" aria-live="polite"></div>' +
      '<button type="submit">Жду звонка</button>' +
    '</form>';

  var REPLIES = {
    call: function () {
      add('b', 'Оставьте имя и телефон — менеджер перезвонит в рабочее время (' + HOURS + ').' + callbackFormHTML);
    },
    pick: function () {
      add('b', 'Подберём систему под ваш объект и бесплатно сделаем акустический расчёт. Расскажите о задаче менеджеру — проще всего по телефону.' +
        links([['Перезвоните мне', '#dsf-call'], ['Запросить консультацию по объекту', './consultation.html'], ['Портфолио: похожие объекты', './portfolio.html']]));
    },
    price: function () {
      add('b', 'Цены зависят от комплектации, объёма и сроков — пришлём коммерческое предложение. Позвоните <a href="' + TEL + '">' + PHONE + '</a> или напишите на <a href="' +
        mailto('Запрос цены', 'Здравствуйте! Прошу прислать коммерческое предложение на: ') + '">' + MAIL + '</a>.' + links([['Запросить цену', './prices.html'], ['Перезвоните мне', '#dsf-call']]));
    },
    buy: function () {
      add('b', 'Купить можно напрямую у производителя или у наших партнёров в регионах. Подскажем ближайшего — позвоните <a href="' + TEL + '">' + PHONE + '</a> или оставьте номер.' +
        links([['Где купить', './where-to-buy.html'], ['Перезвоните мне', '#dsf-call']]));
    },
    service: function () {
      add('b', 'Сервисные центры:<br>• Москва, Остаповский проезд, д. 3с8<br>• Санкт-Петербург, ул. Парковая, 4Д<br>' + HOURS + ', <a href="' + TEL + '">' + PHONE + '</a>.' +
        links([['Перезвоните мне', '#dsf-call']]));
    }
  };

  function ask(q) {
    q = q.trim(); if (!q) return;
    add('u', esc(q));
    if (/перезвон|позвон|звонок|звоните|связ/i.test(q)) { REPLIES.call(); return; }
    if (/цен|стоим|сколько|прайс|кп\b|коммерческ/i.test(q)) { REPLIES.price(); return; }
    if (/сервис|ремонт|гарант/i.test(q)) { REPLIES.service(); return; }
    var found = (window.DSNav && window.DSNav.search) ? window.DSNav.search(q) : [];
    var ready = found.filter(function (p) { return !p.soon; });
    if (ready.length) {
      add('b', 'Вот что нашлось на сайте:' + links(ready.map(function (p) { return [p.t, p.u]; })) +
        '<span class="dsf-links"><a href="#dsf-call">Или перезвоним и всё расскажем</a></span>');
    } else {
      add('b', 'Точного ответа на сайте нет, но менеджер поможет. Перезвонить вам или <a href="' + mailto('Вопрос с сайта', q) + '">отправить вопрос на почту</a>?' +
        links([['Перезвоните мне', '#dsf-call']]));
    }
  }

  function submitCallback(form) {
    var f = form.elements, err = form.querySelector('.dsf-err');
    var phone = f.phone.value.trim(), digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { err.textContent = 'Проверьте номер телефона.'; f.phone.focus(); return; }
    if (!f.agree.checked) { err.textContent = 'Нужно согласие на обработку персональных данных.'; return; }
    err.textContent = '';
    var data = { name: f.name.value.trim(), phone: phone, time: f.time.value.trim(), page: location.href };
    var btn = form.querySelector('button'); btn.disabled = true;
    function done(sentToServer) {
      form.remove();
      if (sentToServer) add('b', 'Спасибо' + (data.name ? ', ' + esc(data.name) : '') + '! Заявка принята — менеджер перезвонит на ' + esc(phone) + ' в рабочее время.');
      else add('b', 'Открываю письмо с вашей заявкой — отправьте его, и мы перезвоним на ' + esc(phone) + '. Если почтовая программа не открылась, позвоните нам: <a href="' + TEL + '">' + PHONE + '</a>.');
    }
    if (CALLBACK_URL) {
      fetch(CALLBACK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; done(true); })
        .catch(function () { btn.disabled = false; err.textContent = 'Не удалось отправить. Позвоните нам: ' + PHONE + '.'; });
    } else {
      location.href = mailto('Перезвоните мне', 'Имя: ' + data.name + '\nТелефон: ' + data.phone + (data.time ? '\nКогда удобно: ' + data.time : '') + '\nСтраница: ' + data.page);
      done(false);
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-dsf], a[href="#dsf-call"], a[href="#dsf-bot"]');
    if (!a) return;
    var bot = $('#dsFootBot'); if (!bot) return;
    e.preventDefault();
    var key = a.getAttribute('data-dsf') || 'call';
    if (a.getAttribute('href') === '#dsf-bot') { bot.scrollIntoView({ behavior: 'smooth', block: 'center' }); var i = bot.querySelector('.dsf-ask input'); if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 400); return; }
    if (bot.querySelector('.dsf-cb') && key === 'call') { bot.querySelector('.dsf-cb input[name=phone]').focus(); return; }
    if (a.classList.contains('dsf-chip')) add('u', esc(a.textContent));
    (REPLIES[key] || REPLIES.call)();
    if (key === 'call') { var p = bot.querySelector('.dsf-cb input[name=name]'); if (p) p.focus({ preventScroll: true }); }
  });
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.matches('#dsFootBot .dsf-cb')) { e.preventDefault(); submitCallback(form); }
    else if (form.matches('#dsFootBot .dsf-ask')) { e.preventDefault(); var inp = form.querySelector('input'); ask(inp.value); inp.value = ''; }
  });
})();

/* ---- подвал на телефоне: колонки ссылок раскрываются по нажатию на заголовок,
   юридический текст — по кнопке «Правовая информация». Подвал главной может
   перерисовываться, поэтому обработчики — на document, а кнопки ставятся заново. ---- */
(function () {
  if (window.__dsFootAcc) return; window.__dsFootAcc = true;
  var root = document.documentElement;
  root.classList.add('dsf-js');
  function phone() { return window.innerWidth < 700; }

  function prep() {
    document.querySelectorAll('.dsf-legal').forEach(function (l) {
      if (l.previousElementSibling && l.previousElementSibling.classList.contains('dsf-legal-btn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dsf-legal-btn'; b.setAttribute('aria-expanded', 'false');
      b.textContent = 'Правовая информация';
      l.parentNode.insertBefore(b, l);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prep); else prep();
  new MutationObserver(function () { if (document.querySelector('.dsf-legal') && !document.querySelector('.dsf-legal-btn')) prep(); })
    .observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', function (e) {
    if (!phone()) return;
    var lb = e.target.closest('.dsf-legal-btn');
    if (lb) {
      var open = lb.getAttribute('aria-expanded') !== 'true';
      lb.setAttribute('aria-expanded', open ? 'true' : 'false');
      lb.nextElementSibling.classList.toggle('open', open);
      return;
    }
    var h = e.target.closest('.dsf-col > a.ft-heading');
    if (!h) return;
    var col = h.parentNode;
    if (col.classList.contains('dsf-reach') || col.children.length < 2) return;
    e.preventDefault();
    /* первая строка открытого списка — ссылка на сам раздел */
    var href = h.getAttribute('href');
    if (href && href !== '#' && !col.querySelector('.dsf-go')) {
      var go = document.createElement('a');
      go.className = 'ft-item dsf-go'; go.href = href;
      go.textContent = 'Весь раздел «' + h.textContent.trim() + '» →';
      h.insertAdjacentElement('afterend', go);
    }
    col.classList.toggle('open');
  });
})();
