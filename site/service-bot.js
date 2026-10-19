/* DS PROAUDIO — бот сервисного обращения (страница «Гарантия и сервис»).
   Опрашивает клиента о случившемся, собирает заявку и отправляет её менеджерам сервиса.
   При высокой срочности предлагает сразу позвонить в сервис или заказать обратный звонок.
   Параллельно, не показывая этого на странице, отправляет обезличенную статистику
   (тип неисправности, серия, гарантийный статус, срочность, город, на каком шаге закончили).

   НАСТРОЙКА — window.DS_SERVICE до подключения скрипта (или правка DEFAULTS ниже):
     endpoint      — адрес, куда POST'ом уходит заявка (JSON). Пример сервера: service-api/server.js
     statsEndpoint — адрес для статистики (POST JSON, через sendBeacon). Пусто — статистика не уходит.
     phone/phoneText — телефон сервиса; email — запасной адрес, если сервер недоступен.
   Пока endpoint не задан, заявка уходит письмом: открывается почтовая программа с готовым текстом. */
(function () {
  var DEFAULTS = {
    endpoint: '',
    statsEndpoint: '',
    phone: '+74951501238',
    phoneText: '+7 495 150-12-38',
    email: 'info@ds-proaudio.ru',
    hours: 'пн–пт, 10:00–19:00 (МСК)'
  };
  var C = Object.assign({}, DEFAULTS, window.DS_SERVICE || {});
  var root = document.getElementById('svc-bot');
  if (!root) return;

  var log = root.querySelector('.svc-log');
  var dock = root.querySelector('.svc-dock');
  var progress = root.querySelector('.svc-progress i');
  var restartBtn = root.querySelector('.svc-restart');

  var STEPS = 7;
  var S, session;

  // ---------- справочники ----------
  var ISSUES = [
    { k: 'nosound', t: 'Нет звука' },
    { k: 'distort', t: 'Хрип, треск, искажения' },
    { k: 'quiet', t: 'Тихо звучит одна полоса' },
    { k: 'amp', t: 'Усилитель или DSP: ошибка, не включается' },
    { k: 'rigging', t: 'Подвес, риггинг, крепёж' },
    { k: 'damage', t: 'Механическое повреждение корпуса или решётки' },
    { k: 'other', t: 'Другое' }
  ];
  var SERIES = ['TAURA', 'ERA', 'ERA-i', 'CX', 'ADR', 'ANT', 'PILLAR', 'STELLA', 'Усилитель DA', 'Не знаю модель'];
  var AGE = [
    { k: 'lt1', t: 'Меньше года назад', w: 'warranty' },
    { k: '1to3', t: 'От 1 до 3 лет назад', w: 'warranty' },
    { k: 'gt3', t: 'Больше 3 лет назад', w: 'post' },
    { k: 'unk', t: 'Не помню', w: 'check' }
  ];
  var URG = [
    { k: 'now', t: 'Мероприятие сегодня или завтра', hi: true },
    { k: 'week', t: 'Нужно в течение недели' },
    { k: 'calm', t: 'Не срочно' }
  ];

  // ---------- вывод ----------
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function bot(text, extra) {
    var m = el('div', 'svc-msg svc-bot-msg');
    if (typeof text === 'string') m.appendChild(el('p', null, text)); else m.appendChild(text);
    if (extra) m.appendChild(extra);
    log.appendChild(m); scroll(); return m;
  }
  function me(text) { log.appendChild(el('div', 'svc-msg svc-me', text)); scroll(); }
  function step(n) { progress.style.width = Math.round(n / STEPS * 100) + '%'; S.step = n; }
  function clearDock() { dock.innerHTML = ''; }

  function chips(list, onPick, opts) {
    clearDock();
    var w = el('div', 'svc-chips');
    list.forEach(function (it) {
      var b = el('button', 'svc-chip' + (it.hi ? ' svc-chip-hi' : ''), it.t || it);
      b.type = 'button';
      b.onclick = function () { me(it.t || it); clearDock(); onPick(it); };
      w.appendChild(b);
    });
    dock.appendChild(w);
    if (opts && opts.text) textInput(opts.text, function (v) { onPick({ k: 'custom', t: v }); }, true);
    var f = dock.querySelector('button'); if (f && !(opts && opts.noFocus)) f.focus({ preventScroll: true });
  }
  function textInput(placeholder, onSend, append, optional) {
    if (!append) clearDock();
    var f = el('form', 'svc-input');
    var ta = el('textarea'); ta.rows = 1; ta.placeholder = placeholder; ta.id = 'svc-text-' + S.step; ta.setAttribute('aria-label', placeholder);
    var b = el('button', 'svc-send', 'Отправить'); b.type = 'submit';
    f.appendChild(ta); f.appendChild(b);
    if (optional) { var s = el('button', 'svc-skip', 'Пропустить'); s.type = 'button'; s.onclick = function () { me('—'); clearDock(); onSend(''); }; f.appendChild(s); }
    ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit')); } });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var v = ta.value.trim(); if (!v) { ta.focus(); return; }
      me(v); clearDock(); onSend(v);
    });
    dock.appendChild(f); if (!append) ta.focus({ preventScroll: true });
  }

  // ---------- сценарий ----------
  function start() {
    S = { step: 0, issue: null, series: null, model: '', age: null, urgency: null, desc: '', city: '', name: '', phone: '', email: '', callback: null, outcome: 'abandoned' };
    session = 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    log.innerHTML = ''; clearDock(); step(0);
    bot('Здравствуйте! Я помогу оформить сервисное обращение — это займёт пару минут. Заявку получат инженеры сервиса DS PROAUDIO.');
    setTimeout(askIssue, 250);
  }
  function askIssue() {
    step(1);
    bot('Что произошло с оборудованием?');
    chips(ISSUES, function (it) { S.issue = it; if (it.k === 'other') { bot('Опишите коротко, в чём проблема.'); textInput('Например: пропадает звук на высоких', function (v) { S.issueText = v; askModel(); }); } else askModel(); });
  }
  function askModel() {
    step(2);
    bot('Какая модель? Выберите серию или напишите точное название — оно есть на шильдике на задней панели.');
    chips(SERIES, function (it) { S.series = it.t || it; if (S.series === 'Не знаю модель') { S.model = ''; askAge(); } else { bot('Уточните модель, если знаете (например, ' + exampleFor(S.series) + ').'); textInput('Модель и серийный номер, если есть', function (v) { S.model = v; askAge(); }, false, true); } }, { text: 'Или напишите модель…', noFocus: true });
  }
  function exampleFor(s) { return { 'TAURA': 'TAURA 10', 'ERA': 'ERA 1220', 'ERA-i': 'ERA-i 1210', 'CX': 'CX 112A', 'ADR': 'ADR 8', 'ANT': 'ANT 815', 'PILLAR': 'PLR TOP III', 'STELLA': 'STL TOP III', 'Усилитель DA': 'DA4 1300 DSP' }[s] || 'название с шильдика'; }
  function askAge() {
    step(3);
    bot('Когда оборудование было куплено или введено в эксплуатацию?');
    chips(AGE, function (it) {
      S.age = it;
      if (it.w === 'warranty') bot('Отлично: на это оборудование действует гарантия 3 года. Сохраните документ о покупке — он понадобится при передаче в сервис.');
      else if (it.w === 'post') bot('Гарантийный срок, скорее всего, закончился, но мы всё равно отремонтируем — комплектующие для всех серий есть на складе. Стоимость сообщим после диагностики.');
      else bot('Ничего страшного — проверим гарантию по серийному номеру.');
      setTimeout(askUrgency, 200);
    });
  }
  function askUrgency() {
    step(4);
    if (S.issue && S.issue.k === 'rigging') bot('Если есть сомнения в надёжности подвеса — не поднимайте систему до проверки. Насколько срочно нужна помощь?');
    else bot('Насколько срочно нужна помощь?');
    chips(URG, function (it) { S.urgency = it; if (it.hi || (S.issue && S.issue.k === 'rigging' && it.k !== 'calm')) urgentOffer(); else askDesc(); });
  }
  function urgentOffer() {
    S.urgent = true;
    var box = el('div', 'svc-urgent');
    box.appendChild(el('p', 'svc-urgent-t', 'Это срочный случай — быстрее всего решить его по телефону.'));
    var row = el('div', 'svc-urgent-row');
    var call = el('a', 'svc-call', 'Позвонить в сервис ' + C.phoneText); call.href = 'tel:' + C.phone;
    call.onclick = function () { S.callback = 'called'; stat('call'); };
    row.appendChild(call);
    box.appendChild(row);
    box.appendChild(el('p', 'svc-urgent-n', 'Сервис отвечает ' + C.hours + '. Если звонить неудобно — оставьте номер, инженер перезвонит.'));
    bot(box);
    clearDock();
    chips([{ k: 'cb_now', t: 'Перезвоните мне как можно скорее', hi: true }, { k: 'cb_hour', t: 'Перезвоните через час' }, { k: 'cb_eve', t: 'Сегодня вечером' }, { k: 'cb_morn', t: 'Завтра утром' }, { k: 'cb_no', t: 'Нет, оформить обычную заявку' }],
      function (it) { if (it.k !== 'cb_no') { S.callback = it.t; stat('callback'); askContacts(true); } else askDesc(); });
  }
  function askDesc() {
    step(5);
    bot('Опишите, что происходит: когда появилась проблема, после чего, как проявляется. Чем подробнее — тем быстрее инженер подготовит запчасти.');
    textInput('Например: после концерта на одном кабинете пропали высокие', function (v) { S.desc = v; askCity(); }, false, true);
  }
  function askCity() {
    step(6);
    bot('В каком городе находится оборудование?');
    chips(['Москва', 'Санкт-Петербург'], function (it) { S.city = it.t || it; askContacts(false); }, { text: 'Другой город…', noFocus: true });
  }
  function askContacts(fast) {
    step(fast ? 6 : 7);
    bot(fast ? 'Оставьте имя и телефон — инженер перезвонит в выбранное время.' : 'Последний шаг — как с вами связаться?');
    clearDock();
    var f = el('form', 'svc-form');
    f.innerHTML =
      '<label><span>Имя</span><input id="svc-name" name="name" autocomplete="name" required></label>' +
      '<label><span>Телефон</span><input id="svc-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+7"></label>' +
      (fast ? '' : '<label><span>E-mail <em>необязательно</em></span><input id="svc-email" name="email" type="email" autocomplete="email"></label>') +
      '<label class="svc-agree"><input type="checkbox" id="svc-agree" required> <span>Согласен на обработку персональных данных для ответа на обращение</span></label>' +
      '<div class="svc-form-err" aria-live="polite"></div>' +
      '<button type="submit" class="svc-send svc-send-big">' + (fast ? 'Жду звонка' : 'Отправить заявку') + '</button>';
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ph = f.phone.value.replace(/[^\d+]/g, '');
      var err = f.querySelector('.svc-form-err');
      if (ph.replace(/\D/g, '').length < 10) { err.textContent = 'Проверьте номер телефона: нужно не меньше 10 цифр.'; f.phone.focus(); return; }
      S.name = f.name.value.trim(); S.phone = f.phone.value.trim(); S.email = f.email ? f.email.value.trim() : '';
      me(S.name + ', ' + S.phone + (S.email ? ', ' + S.email : ''));
      clearDock(); submit();
    });
    dock.appendChild(f); f.name.focus({ preventScroll: true });
  }

  // ---------- заявка ----------
  function ticket() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    S.id = S.id || 'SR-' + d.getFullYear().toString().slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    return {
      id: S.id, createdAt: d.toISOString(), page: location.pathname,
      urgent: !!S.urgent, callback: S.callback,
      issue: S.issue ? (S.issue.k === 'other' ? 'Другое: ' + (S.issueText || '') : S.issue.t) : '',
      series: S.series, model: S.model,
      purchased: S.age ? S.age.t : '', warranty: S.age ? S.age.w : '',
      urgency: S.urgency ? S.urgency.t : '',
      description: S.desc, city: S.city,
      contact: { name: S.name, phone: S.phone, email: S.email }
    };
  }
  function ticketText(t) {
    return [
      'Сервисное обращение ' + t.id + (t.urgent ? ' — СРОЧНО' : ''),
      'Неисправность: ' + t.issue,
      'Оборудование: ' + [t.series, t.model].filter(Boolean).join(', '),
      'Куплено: ' + t.purchased,
      'Срочность: ' + t.urgency + (t.callback ? ' · обратный звонок: ' + t.callback : ''),
      t.city ? 'Город: ' + t.city : '',
      t.description ? 'Описание: ' + t.description : '',
      'Контакт: ' + t.contact.name + ', ' + t.contact.phone + (t.contact.email ? ', ' + t.contact.email : '')
    ].filter(Boolean).join('\n');
  }
  function submit() {
    var t = ticket();
    var wait = bot('Отправляю заявку…');
    var done = function (ok) {
      wait.remove();
      S.outcome = ok ? 'submitted' : 'fallback'; stat(S.outcome);
      step(STEPS);
      if (ok) {
        var b = el('div');
        b.appendChild(el('p', null, 'Заявка ' + t.id + ' отправлена в сервис.'));
        b.appendChild(el('p', null, t.callback && t.callback !== 'called' ? 'Инженер перезвонит: ' + t.callback.toLowerCase().replace('перезвоните ', '') + '.' : 'Инженер свяжется с вами в рабочее время (' + C.hours + ').'));
        bot(b);
      } else fallback(t);
      restartBtn.hidden = false;
    };
    if (!C.endpoint) { setTimeout(function () { done(false); }, 400); return; }
    fetch(C.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
      .then(function (r) { done(r.ok); }).catch(function () { done(false); });
  }
  function fallback(t) {
    var txt = ticketText(t);
    var b = el('div');
    b.appendChild(el('p', null, 'Заявка ' + t.id + ' готова. Отправьте её письмом в сервис — текст уже заполнен.'));
    var row = el('div', 'svc-urgent-row');
    var mail = el('a', 'svc-call', 'Отправить письмом'); mail.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Сервисное обращение ' + t.id + (t.urgent ? ' — СРОЧНО' : '')) + '&body=' + encodeURIComponent(txt);
    var copy = el('button', 'svc-chip', 'Скопировать текст'); copy.type = 'button';
    copy.onclick = function () { try { navigator.clipboard.writeText(txt).then(function () { copy.textContent = 'Скопировано'; }, function () { copy.textContent = 'Выделите текст ниже'; }); } catch (e) { copy.textContent = 'Выделите текст ниже'; } };
    row.appendChild(mail); row.appendChild(copy); b.appendChild(row);
    b.appendChild(el('pre', 'svc-pre', txt));
    b.appendChild(el('p', 'svc-urgent-n', 'Адрес: ' + C.email + ' · телефон сервиса: ' + C.phoneText));
    bot(b);
  }

  // ---------- статистика (не публикуется на странице) ----------
  var sent = {};
  function stat(event) {
    if (!C.statsEndpoint) return;
    var key = event + ':' + session; if (sent[key]) return; sent[key] = 1;
    var data = {
      session: session, event: event, at: new Date().toISOString(), step: S.step,
      issue: S.issue ? S.issue.k : null, series: S.series || null,
      warranty: S.age ? S.age.w : null, urgency: S.urgency ? S.urgency.k : null,
      urgent: !!S.urgent, callback: S.callback ? 1 : 0, city: S.city || null
    };
    var body = JSON.stringify(data);
    try { if (navigator.sendBeacon && navigator.sendBeacon(C.statsEndpoint, new Blob([body], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch(C.statsEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }); } catch (e) {}
  }
  // брошенные обращения: фиксируем шаг, на котором ушли со страницы
  window.addEventListener('pagehide', function () { if (S && S.step > 0 && S.outcome === 'abandoned') stat('abandoned'); });

  restartBtn.onclick = function () { if (S && S.step > 0 && S.outcome === "abandoned") stat("abandoned"); start(); };
  document.querySelectorAll('[data-svc-start]').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { var f = dock.querySelector('button,textarea,input'); if (f) f.focus({ preventScroll: true }); }, 500); });
  });
  start();
  stat('open');
})();
