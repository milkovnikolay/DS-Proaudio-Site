/* DS PROAUDIO — раздел «Продукция»: галерея товара, лайтбокс, подсветка вкладок при прокрутке. */
(function () {
  // ---- галерея ----
  var gal = document.querySelector('[data-gallery]');
  if (gal) {
    var main = gal.querySelector('.pd-main img'), thumbs = [].slice.call(gal.querySelectorAll('.pd-thumbs button')), cnt = gal.querySelector('.pd-count');
    var i = 0;
    function show(k) {
      if (!thumbs.length) return;
      i = (k + thumbs.length) % thumbs.length;
      main.src = thumbs[i].getAttribute('data-src'); main.alt = thumbs[i].getAttribute('data-alt') || main.alt;
      thumbs.forEach(function (t, j) { t.classList.toggle('on', j === i); });
      if (cnt) cnt.textContent = (i + 1) + ' / ' + thumbs.length;
      thumbs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    thumbs.forEach(function (t, j) { t.addEventListener('click', function () { show(j); }); });
    var p = gal.querySelector('.pd-arrow.prev'), n = gal.querySelector('.pd-arrow.next');
    if (p) p.addEventListener('click', function () { show(i - 1); });
    if (n) n.addEventListener('click', function () { show(i + 1); });
    // свайп
    var x0 = null;
    gal.querySelector('.pd-main').addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    gal.querySelector('.pd-main').addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
    // лайтбокс
    var lb = document.createElement('div'); lb.className = 'pd-lb'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
    if (main) main.addEventListener('click', function () { lb.querySelector('img').src = main.src; lb.classList.add('on'); });
    lb.addEventListener('click', function () { lb.classList.remove('on'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lb.classList.remove('on');
      if (e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }
  // ---- строка разделов товара: стрелки по краям, затухание, перетаскивание мышью; активный пункт — по центру ----
  var tbar = document.querySelector('.pd-tabs');
  function centerTab(a) {
    if (!tbar || tbar.scrollWidth <= tbar.clientWidth) return;
    var x = a.offsetLeft - (tbar.clientWidth - a.offsetWidth) / 2;
    tbar.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
  }
  if (tbar) {
    var wrap = document.createElement('div'); wrap.className = 'pd-tabs-wrap';
    tbar.parentNode.insertBefore(wrap, tbar); wrap.appendChild(tbar);
    var arr = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2.5L9.5 7 5 11.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var bl = document.createElement('button'); bl.type = 'button'; bl.className = 'pd-tabs-arr l'; bl.setAttribute('aria-label', 'Прокрутить разделы влево'); bl.innerHTML = arr;
    var br = document.createElement('button'); br.type = 'button'; br.className = 'pd-tabs-arr r'; br.setAttribute('aria-label', 'Прокрутить разделы вправо'); br.innerHTML = arr;
    wrap.appendChild(bl); wrap.appendChild(br);
    function upd() {
      var max = tbar.scrollWidth - tbar.clientWidth;
      wrap.classList.toggle('can-l', tbar.scrollLeft > 2);
      wrap.classList.toggle('can-r', tbar.scrollLeft < max - 2);
    }
    function step(dir) { tbar.scrollBy({ left: dir * tbar.clientWidth * 0.6, behavior: 'smooth' }); }
    bl.addEventListener('click', function () { step(-1); });
    br.addEventListener('click', function () { step(1); });
    tbar.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    // перетаскивание мышью (на сенсорных экранах строка и так листается пальцем)
    var dx = null, sl = 0, moved = false;
    tbar.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || tbar.scrollWidth <= tbar.clientWidth) return; dx = e.clientX; sl = tbar.scrollLeft; moved = false; });
    window.addEventListener('pointermove', function (e) { if (dx === null) return; var d = e.clientX - dx; if (Math.abs(d) > 4) { moved = true; wrap.classList.add('drag'); } if (moved) tbar.scrollLeft = sl - d; });
    window.addEventListener('pointerup', function () { if (dx === null) return; dx = null; setTimeout(function () { wrap.classList.remove('drag'); }, 0); });
    tbar.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    tbar.addEventListener('dragstart', function (e) { e.preventDefault(); });
    // строка разделов прилипает сразу под строкой фильтров, какой бы высоты та ни была (на телефоне фильтры могут переноситься)
    function stick() {
      var nav = document.querySelector('.pr-nav'); if (!nav) return;
      var cs = getComputedStyle(nav); if (cs.position !== 'sticky') return;
      wrap.style.top = (parseFloat(cs.top) || 0) + nav.offsetHeight + 'px';
    }
    window.addEventListener('resize', stick);
    upd(); stick(); setTimeout(function () { upd(); stick(); }, 300);
  }
  // ---- вкладки страницы товара ----
  var tabs = [].slice.call(document.querySelectorAll('.pd-tabs a'));
  if (tabs.length && 'IntersectionObserver' in window) {
    var map = {}; tabs.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { tabs.forEach(function (a) { a.classList.remove('on'); }); var a = map[e.target.id]; if (a) { a.classList.add('on'); centerTab(a); } } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
  // ---- быстрый переход: выпадающие списки (делегирование — работает и на главной, где блок дорисовывается позже) ----
  function closeDD(except) { [].forEach.call(document.querySelectorAll('[data-pr-dd]'), function (b) { if (b === except) return; b.setAttribute('aria-expanded', 'false'); var p = document.getElementById('dd-' + b.getAttribute('data-pr-dd')); if (p) p.hidden = true; }); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pr-dd]');
    if (b) {
      var p = document.getElementById('dd-' + b.getAttribute('data-pr-dd')); if (!p) return;
      var open = p.hidden; closeDD(b); p.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var on = p.querySelector('.pr-opt.on'); if (on) on.scrollIntoView({ block: 'nearest' }); }
      return;
    }
    if (!(e.target.closest && e.target.closest('.pr-fgroup'))) closeDD();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDD(); });
  // ---- строка адреса: на узком экране показываем конец (текущую страницу) ----
  document.querySelectorAll('.pr-addr').forEach(function (a) { a.scrollLeft = a.scrollWidth; });
})();
