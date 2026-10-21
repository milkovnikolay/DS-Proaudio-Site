/* DS PROAUDIO — страница «Применение»: витрина типов объектов (пара к apx-page.css).
   Направления сменяются сами каждые 7 секунд, пока посетитель не выбрал своё.
   На компьютере — наведение на строку списка; на телефоне — нажатие на ярлык
   (второе нажатие открывает раздел) или свайп по экрану. */
(function(){
  var d = document, sec = d.querySelector('.apx'); if (!sec) return;
  var its = [].slice.call(sec.querySelectorAll('.apx-it')), imgs = [].slice.call(sec.querySelectorAll('.apx-bg img'));
  var card = sec.querySelector('.apx-card'), list = sec.querySelector('.apx-list'), bar = sec.querySelector('.apx-bar');
  var q = function(s){ return card.querySelector(s); };
  var DUR = 7000, cur = 0, timer = 0, stopped = false, inView = true, swapT = 0;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && matchMedia('(hover: none)').matches;
  sec.style.setProperty('--apx-dur', DUR + 'ms');

  /* высота витрины — ровно окно (с учётом масштаба страницы на широких экранах) */
  function fit(){ var z = parseFloat(d.documentElement.style.zoom) || 1; sec.style.setProperty('--apx', Math.round(window.innerHeight / z) + 'px'); }
  fit(); addEventListener('resize', fit);

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function num(s){ var m = /^\d+/.exec(s || ''); return m ? m[0] : ''; }

  function run(){
    clearTimeout(timer);
    its.forEach(function(a){ a.classList.toggle('hold', stopped); });
    if (bar){ bar.classList.remove('run'); void bar.offsetWidth; }
    if (stopped || still || !inView) return;
    var a = its[cur]; a.classList.remove('on'); void a.offsetWidth; a.classList.add('on');
    if (bar) bar.classList.add('run');
    timer = setTimeout(function(){ show((cur + 1) % its.length); }, DUR);
  }

  function show(i){
    if (i === cur && card.dataset.ready) { run(); return; }
    cur = i; card.dataset.ready = 1;
    var a = its[i];
    its.forEach(function(x, k){ x.classList.toggle('on', k === i); x.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    imgs.forEach(function(m, k){ if (k === i) m.loading = 'eager'; m.classList.toggle('on', k === i); });
    if (imgs[(i + 1) % imgs.length]) imgs[(i + 1) % imgs.length].loading = 'eager';   // следующее фото — заранее
    card.classList.add('swap'); clearTimeout(swapT);
    swapT = setTimeout(function(){
      q('.apx-k-no').textContent = pad(i + 1) + ' / ' + pad(its.length);
      q('.apx-k-n').textContent = a.dataset.n;
      q('.apx-title').textContent = a.querySelector('.apx-t').textContent;
      q('.apx-text').textContent = a.dataset.lead;
      q('.apx-cap').textContent = a.dataset.cap;
      var go = q('.apx-go'); go.href = a.getAttribute('href');
      var pf = q('[data-k=pf]'), n = num(a.dataset.n);
      pf.href = a.dataset.pf;
      pf.innerHTML = 'Портфолио' + (/#sec-/.test(a.dataset.pf) && n ? ' <b>' + n + '</b>' : '');
      q('[data-k=rv]').href = a.dataset.rv;
      card.classList.remove('swap');
    }, 260);
    if (list && list.scrollWidth > list.clientWidth){   // лента ярлыков: выбранный — в поле зрения
      var l = a.parentNode.offsetLeft - 24;
      list.scrollTo({ left: Math.max(0, l - (list.clientWidth - a.offsetWidth) / 2 + 24), behavior: 'smooth' });
    }
    run();
  }

  its.forEach(function(a, i){
    a.addEventListener('mouseenter', function(){ if (touch) return; stopped = true; show(i); });
    a.addEventListener('focus', function(){ if (touch) return; stopped = true; show(i); });
    a.addEventListener('click', function(e){
      if (touch && i !== cur){ e.preventDefault(); stopped = true; show(i); }   // первое нажатие — показать, второе — открыть
    });
  });
  /* мышь на списке или карточке — пауза, ушла — смена продолжается */
  [list, card].forEach(function(el){
    el.addEventListener('mouseenter', function(){ if (!touch){ stopped = true; run(); } });
    el.addEventListener('mouseleave', function(){ if (!touch){ stopped = false; run(); } });
  });

  /* свайп по фото на телефоне */
  var sx = 0, sy = 0;
  sec.addEventListener('touchstart', function(e){ if (e.target.closest('.apx-list')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  sec.addEventListener('touchend', function(e){
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4){ stopped = true; show((cur + (dx < 0 ? 1 : its.length - 1)) % its.length); }
  }, { passive: true });

  /* за пределами экрана — не листать */
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ inView = en[0].isIntersecting; run(); }, { threshold: .35 }).observe(sec);
  }
  show(0);
})();
