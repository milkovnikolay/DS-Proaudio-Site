/* DS PROAUDIO — английская версия: перевод текстов, которые общие скрипты сайта рисуют уже в браузере
   (меню на телефоне, помощники, форма заявки, отзывы, блог, каталог). Файл site/en/i18n-en.js собирается
   скриптом tools/i18n/build_en.py из словаря tools/i18n/en.json — вручную не править.
   Пустой перевод ("") = элемент скрывается (ГИСП, реестр, госзакупки). */
(function () {
  if (window.__dsI18n) return; window.__dsI18n = 1;
  var D = /*DICT*/{};
  var P = /*PATS*/[].map(function (p) { return [new RegExp(p[0]), p[1], p[2]]; });
  var LINKS = /*LINKS*/{};
  var CYR = /[А-Яа-яЁё]/, ATTRS = ['alt', 'title', 'aria-label', 'placeholder'];

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function tr(s) {
    var k = norm(s);
    if (Object.prototype.hasOwnProperty.call(D, k)) return D[k];
    for (var i = 0; i < P.length; i++) {
      var m = k.match(P[i][0]);
      if (!m) continue;
      var out = P[i][1];
      for (var g = m.length - 1; g > 0; g--) {
        var v = m[g] || '';
        if (P[i][2].indexOf(g) >= 0) { var t = tr(v); if (t != null) v = t; }
        out = out.split('$' + g).join(v);
      }
      return out;
    }
    return null;
  }
  window.dsTr = tr;

  function hide(el) { if (el && el.style) el.style.setProperty('display', 'none', 'important'); }

  function text(n) {
    var v = n.nodeValue, p = n.parentNode;
    if (!v || !CYR.test(v) || !p || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName)) return;
    var t = tr(v);
    if (t == null) return;
    if (t === '') { if (norm(p.textContent) === norm(v)) hide(p); n.nodeValue = ''; return; }
    var lead = v.match(/^\s*/)[0], tail = v.match(/\s*$/)[0];
    n.nodeValue = lead + t + tail;
  }
  function attrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]);
      if (!a || !CYR.test(a)) continue;
      var t = tr(a);
      if (t == null) continue;
      if (t === '' && el.nodeName === 'IMG') hide(el);
      el.setAttribute(ATTRS[i], t);
    }
    if (el.nodeName === 'A') {
      var h = el.getAttribute('href');
      if (h && Object.prototype.hasOwnProperty.call(LINKS, h)) el.setAttribute('href', LINKS[h]);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { text(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) attrs(root);
    var w = document.createTreeWalker(root, 5 /* элементы и текст */), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) text(n); else attrs(n); }
  }

  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.type === 'characterData') text(r.target);
      else if (r.type === 'attributes') attrs(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
    }
    if (CYR.test(document.title)) { var t = tr(document.title); if (t) document.title = t; }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['href']) });

  walk(document.documentElement);
  document.addEventListener('DOMContentLoaded', function () { walk(document.documentElement); });
})();
