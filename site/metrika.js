/* DS PROAUDIO — счётчик Яндекс Метрики № 113819454 (задача 6, счётчик прислал Дмитрий Калинин), 29.10.2026.
   Один файл на весь сайт: подключается на каждой странице строкой <script src="./metrika.js" defer></script>.
   Работает ТОЛЬКО на ds-proaudio.ru: на превью github.io, localhost и других адресах ничего не грузится и не считается.
   Включено: Вебвизор (записи посещений, карта скроллинга, аналитика форм), карта кликов, внешние ссылки и файлы,
   точный показатель отказов. Цели настраивает Дмитрий в интерфейсе Метрики — здесь ничего менять не нужно.
   Адреса Метрики разрешены в Content-Security-Policy (site/.htaccess). Политика: privacy.html, раздел 7. */
(function () {
  var ID = 113819454;
  var host = location.hostname.replace(/^www\./, '');
  if (host !== 'ds-proaudio.ru') return;
  if (window.__dsMetrika) return; window.__dsMetrika = true;
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  window.ym(ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });

  // Вебвизор не должен записывать то, что посетитель вводит в поля форм (имя, телефон, e-mail, сообщения) — так написано
  // в политике (privacy.html, раздел 7). Класс ym-disable-keys — штатный способ Метрики; ставим его всем полям, в том числе
  // появляющимся позже (формы-помощники рисуются скриптами). Аналитика форм (какие поля заполняют и где бросают) работает.
  function mark(root) {
    if (!root.querySelectorAll) return;
    if (/^(INPUT|TEXTAREA)$/.test(root.nodeName)) root.classList.add('ym-disable-keys');
    var f = root.querySelectorAll('input, textarea');
    for (var i = 0; i < f.length; i++) f[i].classList.add('ym-disable-keys');
  }
  function start() {
    mark(document.documentElement);
    // следим и за новыми полями, и за сменой class: шаблон главной (React) переписывает class у своих полей
    new MutationObserver(function (l) {
      for (var i = 0; i < l.length; i++) {
        var r = l[i];
        if (r.type === 'attributes') { if (/^(INPUT|TEXTAREA)$/.test(r.target.nodeName) && !r.target.classList.contains('ym-disable-keys')) r.target.classList.add('ym-disable-keys'); }
        else for (var j = 0; j < r.addedNodes.length; j++) mark(r.addedNodes[j]);
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
