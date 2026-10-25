/* DS PROAUDIO — короткое уведомление о cookie (план Коли, раздел 3.1: Метрика и Яндекс Карты ставят cookie).
   Показывается один раз внизу экрана; после «Понятно» больше не появляется (запоминается в браузере). */
(function () {
  if (window.__dsCookie) return; window.__dsCookie = true;
  var KEY = 'ds-cookie-ok';
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  function show() {
    var css = document.createElement('style');
    css.textContent = '.ds-ck{position:fixed;left:16px;bottom:16px;z-index:9000;max-width:420px;display:flex;gap:14px;align-items:center;'
      + 'padding:14px 16px;border-radius:12px;background:rgba(20,20,20,.94);color:#D8D8D8;font:13px/1.45 "IBM Plex Sans",sans-serif;'
      + 'box-shadow:0 10px 30px rgba(0,0,0,.25)}.ds-ck a{color:#FAFAFA;text-decoration:underline;text-underline-offset:2px}'
      + '.ds-ck button{flex-shrink:0;border:0;border-radius:8px;padding:9px 14px;background:#FAFAFA;color:#141414;font:600 13px "IBM Plex Sans",sans-serif;cursor:pointer}'
      + '@media (max-width:600px){.ds-ck{left:10px;right:10px;bottom:84px;max-width:none}}';
    document.head.appendChild(css);
    var b = document.createElement('div');
    b.className = 'ds-ck'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Уведомление о cookie');
    b.innerHTML = '<span>Сайт использует cookie и сервисы статистики, чтобы работать удобнее. Подробнее — в <a href="./privacy.html">политике обработки персональных данных</a>.</span><button type="button">Понятно</button>';
    b.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      b.remove();
    });
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
