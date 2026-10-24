/* DS PROAUDIO — приёмник сервисных обращений для бота на странице «Гарантия и сервис».
   Node.js 18+, без внешних пакетов. Запуск:  node server.js
   (за nginx: проксировать /api/service* на этот порт).

   Что делает:
     POST /api/service         — принимает заявку, дописывает в data/tickets.jsonl,
                                 пересылает менеджерам в Telegram (если заданы TG_TOKEN и TG_CHAT).
     POST /api/tour            — заявка на фактори-тур со страницы «Производство» → data/tours.jsonl + Telegram.
     POST /api/lead            — заявки со страниц «Клиентам» (выезд, консультация, цены, где купить) → data/leads.jsonl + Telegram.
     POST /api/showroom        — запись в шоу-рум (showroom.html), то же, что /api/lead.
     POST /api/service-stats   — принимает обезличенное событие статистики → data/stats.jsonl.
     GET  /api/service-stats/summary       — сводка статистики для руководства
                                 (только с заголовком Authorization: Bearer <STATS_KEY>).
   На сайте ничего из статистики не публикуется.

   Защита (24.10.2026, по плану безопасности Коли, п. 1.2):
     — папка service-api лежит вне site/ и на хостинг вместе с сайтом не выгружается; данные — в data/ рядом с server.js
       (или в DATA_DIR), файлы с правами 0600;
     — заявки принимаются только с адресов из ALLOW_ORIGIN (или с того же домена) и только как application/json;
     — лимиты: 5 заявок за 10 минут с одного IP и 60 заявок в час всего; скрытое поле-ловушка website для ботов;
     — /api/lead сохраняет только известные поля форм.

   Переменные окружения:
     PORT=8787  TG_TOKEN=…  TG_CHAT=…  STATS_KEY=длинный-секрет  ALLOW_ORIGIN=https://ds-proaudio.ru[,https://второй-домен]
     DATA_DIR=/путь/к/данным (необязательно) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 8787;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const ORIGINS = (process.env.ALLOW_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
fs.mkdirSync(DATA, { recursive: true, mode: 0o700 });
const save = (file, rec) => fs.appendFileSync(path.join(DATA, file), JSON.stringify(rec) + '\n', { mode: 0o600 });

// поля, которые реально отправляют формы сайта (consultation, demo, prices, seminars, where-to-buy, showroom, objform)
const LEAD_FIELDS = ['name', 'phone', 'email', 'company', 'city', 'role', 'comment', 'cap', 'obj', 'stage', 'dates', 'venue', 'way',
  'fmt', 'people', 'series', 'object', 'capacity', 'needs', 'when', 'model'];

// лимиты частоты: ключ → отметки времени
const hits = new Map();
function limited(key, max, ms) {
  const now = Date.now(), list = (hits.get(key) || []).filter(t => now - t < ms);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list); return false;
}
setInterval(() => { const now = Date.now(); for (const [k, l] of hits) if (!l.some(t => now - t < 36e5)) hits.delete(k); }, 6e5).unref();
const ipOf = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
function originOk(req) {
  const o = req.headers.origin;
  if (!o) return true; // запрос не из браузера другого сайта (curl, тот же домен без Origin)
  if (ORIGINS.includes(o)) return true;
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}
function corsOrigin(req) { const o = req.headers.origin; return o && ORIGINS.includes(o) ? o : ''; }

function body(req) {
  return new Promise((ok, fail) => {
    let s = ''; req.on('data', c => { s += c; if (s.length > 64e3) { fail(new Error('too big')); req.destroy(); } });
    req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { fail(e); } });
  });
}
function send(res, code, obj) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
  if (res.cors) Object.assign(h, { 'Access-Control-Allow-Origin': res.cors, 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' });
  res.writeHead(code, h);
  res.end(code === 204 ? undefined : JSON.stringify(obj));
}
// заявка от бота: заполнено скрытое поле website — отвечаем «принято», но никуда не сохраняем
const trap = t => !!(t && t.website);
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

async function notify(t) {
  if (!process.env.TG_TOKEN || !process.env.TG_CHAT) return;
  const text = [
    (t.urgent ? '🔴 СРОЧНО · ' : '') + 'Сервисное обращение ' + t.id,
    'Неисправность: ' + t.issue,
    'Оборудование: ' + [t.series, t.model].filter(Boolean).join(', '),
    'Куплено: ' + t.purchased + (t.warranty === 'warranty' ? ' (гарантия)' : ''),
    'Срочность: ' + t.urgency + (t.callback ? ' · перезвонить: ' + t.callback : ''),
    t.city && 'Город: ' + t.city,
    t.description && 'Описание: ' + t.description,
    'Контакт: ' + t.contact.name + ', ' + t.contact.phone + (t.contact.email ? ', ' + t.contact.email : '')
  ].filter(Boolean).join('\n');
  await fetch('https://api.telegram.org/bot' + process.env.TG_TOKEN + '/sendMessage', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TG_CHAT, text })
  }).catch(e => console.error('telegram:', e.message));
}

function summary() {
  const file = path.join(DATA, 'stats.jsonl');
  const rows = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean) : [];
  const count = (list, key) => list.reduce((m, r) => { const k = r[key] == null ? '—' : r[key]; m[k] = (m[k] || 0) + 1; return m; }, {});
  const done = rows.filter(r => r.event === 'submitted' || r.event === 'fallback');
  const month = r => r.at.slice(0, 7);
  return {
    sessions: new Set(rows.filter(r => r.event === 'open').map(r => r.session)).size,
    tickets: done.length,
    urgent: done.filter(r => r.urgent).length,
    calls: rows.filter(r => r.event === 'call').length,
    callbacks: rows.filter(r => r.event === 'callback').length,
    abandonedAtStep: count(rows.filter(r => r.event === 'abandoned'), 'step'),
    byIssue: count(done, 'issue'), bySeries: count(done, 'series'), byWarranty: count(done, 'warranty'),
    byCity: count(done, 'city'), byMonth: done.reduce((m, r) => { m[month(r)] = (m[month(r)] || 0) + 1; return m; }, {})
  };
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  res.cors = corsOrigin(req);
  if (!originOk(req)) return send(res, 403, { error: 'forbidden' });
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'POST') {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'json only' });
    const ip = ipOf(req);
    if (url.pathname === '/api/service-stats') { if (limited('s:' + ip, 120, 6e5)) return send(res, 429, { error: 'too many requests' }); }
    else if (limited('ip:' + ip, 5, 6e5) || limited('all', 60, 36e5)) return send(res, 429, { error: 'too many requests' });
  }
  try {
    if (req.method === 'POST' && url.pathname === '/api/service') {
      const t = await body(req);
      if (trap(t)) return send(res, 200, { ok: true, id: clip(t.id, 40) });
      if (!t.contact || !clip(t.contact.phone, 40).replace(/\D/g, '')) return send(res, 400, { error: 'phone required' });
      const rec = {
        id: clip(t.id, 40), receivedAt: new Date().toISOString(), urgent: !!t.urgent, callback: clip(t.callback, 80),
        issue: clip(t.issue, 300), series: clip(t.series, 60), model: clip(t.model, 200), purchased: clip(t.purchased, 60), warranty: clip(t.warranty, 20),
        urgency: clip(t.urgency, 80), description: clip(t.description, 4000), city: clip(t.city, 100),
        contact: { name: clip(t.contact.name, 120), phone: clip(t.contact.phone, 40), email: clip(t.contact.email, 120) }
      };
      save('tickets.jsonl', rec);
      notify(rec);
      return send(res, 200, { ok: true, id: rec.id });
    }
    if (req.method === 'POST' && url.pathname === '/api/tour') {
      const t = await body(req);
      if (trap(t)) return send(res, 200, { ok: true });
      if (!clip(t.phone, 40).replace(/\D/g, '') || !clip(t.name, 120).trim()) return send(res, 400, { error: 'name and phone required' });
      const rec = { id: 'T' + Date.now().toString(36).toUpperCase(), receivedAt: new Date().toISOString(),
        name: clip(t.name, 120), company: clip(t.company, 200), phone: clip(t.phone, 40), email: clip(t.email, 120),
        role: clip(t.role, 60), site: clip(t.site, 60), dates: clip(t.dates, 120), people: clip(t.people, 6), comment: clip(t.comment, 2000) };
      save('tours.jsonl', rec);
      if (process.env.TG_TOKEN && process.env.TG_CHAT) {
        const text = ['🏭 Заявка на фактори-тур ' + rec.id, rec.name + (rec.company ? ' · ' + rec.company : '') + ' · ' + rec.role,
          'Тел.: ' + rec.phone + (rec.email ? ' · ' + rec.email : ''), 'Площадка: ' + rec.site + ' · человек: ' + rec.people,
          rec.dates && 'Даты: ' + rec.dates, rec.comment && 'Интересно: ' + rec.comment].filter(Boolean).join('\n');
        fetch('https://api.telegram.org/bot' + process.env.TG_TOKEN + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: process.env.TG_CHAT, text }) }).catch(e => console.error('telegram:', e.message));
      }
      return send(res, 200, { ok: true, id: rec.id });
    }
    // 21.10.2026: заявки со страниц «Клиентам» (выезд, консультация, цены, где купить) и записи в шоу-рум → data/leads.jsonl + Telegram
    if (req.method === 'POST' && (url.pathname === '/api/lead' || url.pathname === '/api/showroom')) {
      const t = await body(req);
      if (trap(t)) return send(res, 200, { ok: true });
      if (!clip(t.phone, 40).replace(/\D/g, '') || !clip(t.name, 120).trim()) return send(res, 400, { error: 'name and phone required' });
      const rec = { id: 'L' + Date.now().toString(36).toUpperCase(), receivedAt: new Date().toISOString(),
        kind: clip(t.kind || t.fmt || 'Шоу-рум', 80), page: clip(t.page, 120) };
      for (const k of LEAD_FIELDS) if (t[k] != null && t[k] !== '' && !(k === 'fmt' && rec.kind === clip(t.fmt, 80))) rec[k] = clip(t[k], k === 'comment' ? 2000 : 200);
      save('leads.jsonl', rec);
      if (process.env.TG_TOKEN && process.env.TG_CHAT) {
        const skip = new Set(['id', 'receivedAt', 'kind', 'page', 'name', 'phone']);
        const text = ['📩 ' + rec.kind + ' · ' + rec.id, rec.name + ' · ' + rec.phone,
          ...Object.entries(rec).filter(([k, v]) => !skip.has(k) && v).map(([k, v]) => k + ': ' + v), 'Страница: ' + rec.page].join('\n');
        fetch('https://api.telegram.org/bot' + process.env.TG_TOKEN + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: process.env.TG_CHAT, text }) }).catch(e => console.error('telegram:', e.message));
      }
      return send(res, 200, { ok: true, id: rec.id });
    }
    if (req.method === 'POST' && url.pathname === '/api/service-stats') {
      const s = await body(req);
      const rec = { session: clip(s.session, 40), event: clip(s.event, 20), at: new Date().toISOString(), step: +s.step || 0,
        issue: s.issue && clip(s.issue, 20), series: s.series && clip(s.series, 40), warranty: s.warranty && clip(s.warranty, 20),
        urgency: s.urgency && clip(s.urgency, 20), urgent: !!s.urgent, callback: s.callback ? 1 : 0, city: s.city && clip(s.city, 60) };
      save('stats.jsonl', rec);
      return send(res, 204, {});
    }
    if (req.method === 'GET' && url.pathname === '/api/service-stats/summary') {
      const got = Buffer.from(String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')), want = Buffer.from(process.env.STATS_KEY || '');
      if (!want.length || got.length !== want.length || !crypto.timingSafeEqual(got, want)) return send(res, 404, { error: 'not found' });
      return send(res, 200, summary());
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { send(res, 400, { error: 'bad request' }); }
}).listen(PORT, () => console.log('service-api on :' + PORT));
