<?php
/* DS PROAUDIO — приём заявок с форм сайта на обычном PHP-хостинге (RU-CENTER).
   24.10.2026, по плану безопасности Коли (п. 1.2) и решениям Тима: Р3-б (PHP), Р4-г (почта + мессенджер), Р5 (защита от спама).

   Адреса (переписываются в .htaccess на этот файл):
     POST /api/lead      — «Клиентам» (выезд, консультация, цены, где купить), семинары, главная форма по объекту
     POST /api/showroom  — запись в шоурум
     POST /api/tour      — фактори-тур со страницы «Производство»
     POST /api/service   — сервисное обращение (бот на странице «Гарантия и сервис», service-bot.js)
   Что делает: проверяет заявку, сохраняет её вне папки сайта, отправляет письмо и сообщение в мессенджер.
   Если отправка не удалась, сайт сам откроет письмо на info@ (как и раньше).

   Настройки и данные лежат ВНЕ папки сайта, на уровень выше неё:
     ../private/ds-config.php   — настройки (образец: service-api/ds-config.example.php в репозитории)
     ../private/data/           — заявки (*.jsonl) и счётчики лимитов */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out($code, $obj) { http_response_code($code); echo json_encode($obj, JSON_UNESCAPED_UNICODE); exit; }

$PRIVATE = dirname(__DIR__, 2) . '/private';
$cfg = is_file($PRIVATE . '/ds-config.php') ? require $PRIVATE . '/ds-config.php' : [];
$DATA = $cfg['data_dir'] ?? $PRIVATE . '/data';
if (!is_dir($DATA)) @mkdir($DATA, 0700, true);

// ---- кто и как прислал ----
$ep = $_GET['ep'] ?? '';
if (!in_array($ep, ['lead', 'showroom', 'tour', 'service'], true)) out(404, ['error' => 'not found']);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['error' => 'post only']);
if (!preg_match('~^application/json\b~i', $_SERVER['CONTENT_TYPE'] ?? '')) out(415, ['error' => 'json only']);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
  $host = parse_url($origin, PHP_URL_HOST);
  $allowed = $cfg['allow_origin'] ?? [];
  if (!in_array($origin, $allowed, true) && $host !== ($_SERVER['HTTP_HOST'] ?? '')) out(403, ['error' => 'forbidden']);
}

// ---- лимиты: 5 заявок за 10 минут с одного IP и 60 в час всего ----
function limited($DATA, $ip) {
  $f = fopen($DATA . '/ratelimit.json', 'c+'); if (!$f) return false;
  flock($f, LOCK_EX);
  $now = time(); $st = json_decode(stream_get_contents($f) ?: '{}', true) ?: [];
  $ipKey = 'ip:' . hash('sha256', $ip);
  $mine = array_values(array_filter($st[$ipKey] ?? [], fn($t) => $now - $t < 600));
  $all = array_values(array_filter($st['all'] ?? [], fn($t) => $now - $t < 3600));
  $over = count($mine) >= 5 || count($all) >= 60;
  if (!$over) { $mine[] = $now; $all[] = $now; }
  foreach ($st as $k => $v) if ($k !== 'all' && !array_filter($v, fn($t) => $now - $t < 600)) unset($st[$k]);
  $st[$ipKey] = $mine; $st['all'] = $all;
  ftruncate($f, 0); rewind($f); fwrite($f, json_encode($st));
  flock($f, LOCK_UN); fclose($f); @chmod($DATA . '/ratelimit.json', 0600);
  return $over;
}
if (limited($DATA, $_SERVER['REMOTE_ADDR'] ?? '')) out(429, ['error' => 'too many requests']);

// ---- тело заявки ----
$raw = file_get_contents('php://input', false, null, 0, 65536);
$t = json_decode($raw ?: '', true);
if (!is_array($t)) out(400, ['error' => 'bad request']);
if (!empty($t['website'])) out(200, ['ok' => true]); // поле-ловушка для ботов: «принято», но никуда не идёт

function clip($v, $n) { return mb_substr(trim(is_scalar($v) ? (string)$v : ''), 0, $n); }
// сервисный бот присылает контакт вложенным объектом: { contact: { name, phone, email } }
if ($ep === 'service' && is_array($t['contact'] ?? null)) {
  foreach (['name', 'phone', 'email'] as $k) if (!isset($t[$k]) && isset($t['contact'][$k])) $t[$k] = $t['contact'][$k];
  if (!empty($t['urgent'])) $t['urgency'] = 'СРОЧНО' . (!empty($t['urgency']) ? ' · ' . clip($t['urgency'], 80) : '');
}
$name = clip($t['name'] ?? '', 120); $phone = clip($t['phone'] ?? '', 40);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) out(400, ['error' => 'name and phone required']);

// только поля, которые есть в формах сайта
$LABELS = ['name' => 'Имя', 'phone' => 'Телефон', 'email' => 'E-mail', 'company' => 'Компания', 'role' => 'Кто', 'city' => 'Город',
  'obj' => 'Объект', 'object' => 'Объект', 'cap' => 'Вместимость', 'capacity' => 'Вместимость', 'stage' => 'Стадия', 'venue' => 'Площадка',
  'needs' => 'Нужно', 'when' => 'Когда', 'model' => 'Модель', 'way' => 'Как связаться', 'fmt' => 'Формат', 'series' => 'Послушать',
  'site' => 'Площадка', 'dates' => 'Даты', 'people' => 'Человек', 'time' => 'Когда удобно',
  'issue' => 'Неисправность', 'purchased' => 'Куплено', 'warranty' => 'Гарантия', 'urgency' => 'Срочность', 'callback' => 'Перезвонить',
  'description' => 'Описание', 'comment' => 'Комментарий'];
$prefix = ['lead' => 'L', 'showroom' => 'L', 'tour' => 'T', 'service' => 'S'][$ep];
$rec = ['id' => $prefix . strtoupper(base_convert((string)floor(microtime(true) * 1000), 10, 36)), 'receivedAt' => date('c'),
  'kind' => clip($t['kind'] ?? (['tour' => 'Фактори-тур', 'service' => 'Сервисное обращение'][$ep] ?? ($t['fmt'] ?? 'Шоу-рум')), 80), 'page' => clip($t['page'] ?? '', 120)];
if ($ep === 'service' && !empty($t['id'])) $rec['id'] = clip($t['id'], 40);
foreach ($LABELS as $k => $lab) {
  $v = clip($t[$k] ?? '', in_array($k, ['comment', 'description'], true) ? 4000 : 200);
  if ($v !== '' && !($k === 'fmt' && $v === $rec['kind'])) $rec[$k] = $v;
}

// ---- сохранить (вне папки сайта, права 0600) ----
$base = ['tour' => 'tours', 'service' => 'tickets'][$ep] ?? 'leads';
$file = $DATA . '/' . $base . '.jsonl';
file_put_contents($file, json_encode($rec, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
@chmod($file, 0600);

// ---- срок хранения: заявки старше 1 года удаляются (политика ПДн, 152-ФЗ); проверка не чаще раза в сутки ----
$mark = $DATA . '/retention.stamp';
if (!is_file($mark) || filemtime($mark) < time() - 86400) {
  @touch($mark);
  $limit = time() - 365 * 86400;
  foreach (['leads', 'tours', 'tickets'] as $b) {
    $fn = $DATA . '/' . $b . '.jsonl';
    if (!is_file($fn)) continue;
    $h = @fopen($fn, 'c+'); if (!$h) continue;
    flock($h, LOCK_EX);
    $keep = [];
    while (($line = fgets($h)) !== false) {
      $r = json_decode($line, true);
      $at = is_array($r) ? strtotime($r['receivedAt'] ?? '') : false;
      if ($at === false || $at >= $limit) $keep[] = $line;
    }
    ftruncate($h, 0); rewind($h); fwrite($h, implode('', $keep));
    flock($h, LOCK_UN); fclose($h);
  }
}

// ---- текст уведомления ----
$icon = ['tour' => '🏭 ', 'service' => (!empty($t['urgent']) ? '🔴 ' : '🛠 ')][$ep] ?? '📩 ';
$lines = [$icon . $rec['kind'] . ' · ' . $rec['id']];
foreach ($LABELS as $k => $lab) if (isset($rec[$k])) $lines[] = $lab . ': ' . $rec[$k];
if ($rec['page'] !== '') $lines[] = 'Страница: ' . $rec['page'];
$text = implode("\n", $lines);

function post_json($url, $data, $headers = []) {
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 8, 'ignore_errors' => true,
    'header' => implode("\r\n", array_merge(['Content-Type: application/json'], $headers)),
    'content' => json_encode($data, JSON_UNESCAPED_UNICODE)]]);
  $r = @file_get_contents($url, false, $ctx);
  $code = isset($http_response_header[0]) && preg_match('~\s(\d{3})\s~', $http_response_header[0], $m) ? (int)$m[1] : 0;
  return $r !== false && $code >= 200 && $code < 300;
}

$sent = false;
// 1) почта
if (!empty($cfg['mail_to'])) {
  $subj = '=?UTF-8?B?' . base64_encode('Заявка с сайта: ' . $rec['kind'] . ' — ' . $name) . '?=';
  $from = $cfg['mail_from'] ?? ('no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
  $hdr = "From: DS PROAUDIO <$from>\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit"
    . (!empty($rec['email']) && filter_var($rec['email'], FILTER_VALIDATE_EMAIL) ? "\r\nReply-To: " . $rec['email'] : '');
  $sent = @mail($cfg['mail_to'], $subj, $text, $hdr) || $sent;
}
// 2) MAX (бот MAX для бизнеса; адрес и формат проверить по документации dev.max.ru при подключении)
if (!empty($cfg['max_token']) && !empty($cfg['max_chat'])) {
  $sent = post_json(($cfg['max_api'] ?? 'https://platform-api.max.ru') . '/messages?chat_id=' . rawurlencode($cfg['max_chat']),
    ['text' => $text], ['Authorization: ' . $cfg['max_token']]) || $sent;
}
// 3) Telegram (если выберут его: нужно уведомление РКН о трансграничной передаче)
if (!empty($cfg['tg_token']) && !empty($cfg['tg_chat'])) {
  $sent = post_json('https://api.telegram.org/bot' . $cfg['tg_token'] . '/sendMessage', ['chat_id' => $cfg['tg_chat'], 'text' => $text]) || $sent;
}

// заявка сохранена в любом случае; если ни одно уведомление не ушло — сайт предложит письмо
if (!$sent) out(502, ['error' => 'notify failed', 'id' => $rec['id']]);
out(200, ['ok' => true, 'id' => $rec['id']]);
