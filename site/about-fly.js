/* DS PROAUDIO — «летающие» продукты за текстом (страницы «История» и «Философия»).
   Продукты лежат на воображаемом кольце вокруг текста (как плашки в «Отзывах»): кольцо медленно
   поворачивается само и при прокрутке страницы, а каждый продукт ещё и вращается вокруг своих осей.
   Картинки — вырезанные с фона продукты в ./assets/about/. */
(function () {
  var root = document.getElementById('fly');
  if (!root) return;
  var ring = root.querySelector('.fly-ring');
  var list = (root.getAttribute('data-items') || '').split(',').filter(Boolean);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [], W = 0, H = 0, R = 0, base = 0, mobile = false, n = 0;

  function rnd(i, k) { var x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); }

  function build() {
    ring.innerHTML = ''; items = [];
    n = mobile ? Math.min(12, list.length) : list.length;
    for (var i = 0; i < n; i++) {
      var el = document.createElement('img');
      el.src = './assets/about/' + list[i] + '.webp'; el.alt = ''; el.decoding = 'async'; el.draggable = false;
      el.className = 'fly-it';
      ring.appendChild(el);
      items.push({
        el: el,
        a: i / n * Math.PI * 2 + (rnd(i, 1) - .5) * .35,                // место на кольце
        row: [0, -1, 1][i % 3],                                          // три «этажа», как ряды в «Отзывах»
        yj: (rnd(i, 2) - .5) * .12,
        s: .72 + rnd(i, 3) * .55,                                        // размер
        rz0: rnd(i, 4) * 360, rzs: (rnd(i, 5) < .5 ? -1 : 1) * (5 + rnd(i, 6) * 9),   // вращение в плоскости, °/с
        // наклоны ограничены: видимый размер картинки не меньше 70 % исходного
        // (ширина ×cos(ry) ≥ cos 38° ≈ 0,79; высота ×cos(rx) ≥ cos 18° ≈ 0,95; вместе ≥ 0,75). Вращение в плоскости — без ограничений.
        ryA: 22 + rnd(i, 9) * 16, ryF: .03 + rnd(i, 8) * .04, ph2: rnd(i, 7) * 6.28,
        rxA: 6 + rnd(i, 10) * 12, rxF: .05 + rnd(i, 11) * .08, ph: rnd(i, 12) * 6.28
      });
    }
    size();
  }
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    var m = W < 760;
    if (m !== mobile) { mobile = m; build(); return; }
    R = mobile ? W * .72 : Math.max(W * .6, 760);
    base = mobile ? 130 : Math.min(300, Math.max(190, W * .17));
    items.forEach(function (it) { var w = Math.round(base * it.s); it.el.style.width = w + 'px'; it.el.style.marginLeft = (-w / 2) + 'px'; it.el.style.marginTop = (-w / 2) + 'px'; });
  }

  var t0 = performance.now(), scrollA = 0;
  function frame(now) {
    var t = (now - t0) / 1000;
    if (reduce) t = 0;
    // поворот кольца: оборот ≈ за 3 минуты + прокрутка страницы
    var target = (window.scrollY || 0) * .0011;
    scrollA += (target - scrollA) * .08;
    var th = t * (Math.PI * 2 / 180) + scrollA;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], ang = it.a + th, c = Math.cos(ang);
      var x = R * Math.sin(ang), z = R * (c - 1.3);
      var y = (it.row * .31 + it.yj) * H + Math.sin(t * .35 + it.ph) * 16;
      var rz = it.rz0 + t * it.rzs, ry = Math.sin(t * it.ryF * 6.28 + it.ph2) * it.ryA, rx = Math.sin(t * it.rxF * 6.28 + it.ph) * it.rxA;
      it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
      // дальние — темнее (туман), ближние — ярче
      it.el.style.opacity = (.22 + .74 * (c + 1) / 2).toFixed(3);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  mobile = window.innerWidth < 760; build();
  window.addEventListener('resize', size);
  if (reduce) window.addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true });
  requestAnimationFrame(frame);

  // абзацы проявляются при прокрутке
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(document.querySelectorAll('.ab-rev'), function (el) { io.observe(el); });
  } else [].forEach.call(document.querySelectorAll('.ab-rev'), function (el) { el.classList.add('in'); });

  // оглавление: подсветка текущей главы
  var toc = [].slice.call(document.querySelectorAll('.ab-toc a'));
  if (toc.length && 'IntersectionObserver' in window) {
    var map = {}; toc.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { toc.forEach(function (a) { a.classList.remove('on'); }); var a = map[e.target.id]; if (a) a.classList.add('on'); } });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io2.observe(s); });
  }
})();
