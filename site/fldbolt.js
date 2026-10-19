/* DS PROAUDIO — главная, поле «Инженерам / Партнёрам / Заказчикам / Прокатчикам».
   Пока ни одна кнопка не выбрана, время от времени от случайной кнопки разбегаются «молнии»
   к скрытым (размытым) надписям её группы; надписи на миг вспыхивают. После выбора кнопки — тишина.
   Рисуется на canvas поверх поля (под кнопками), клики не перехватывает. На телефоне и при
   «уменьшении движения» в системе эффект выключен. Главная собирается шаблоном — canvas пересоздаётся при перерисовке. */
(function(){
  var GROUPS = ['eng', 'partners', 'clients', 'rental'];      // порядок кнопок = FIELD_GROUPS в Main.dc.html
  var PAUSE_MIN = 1500, PAUSE_MAX = 10000;                       // пауза между разрядами, мс
  var LIFE = 520;                                               // сколько живёт разряд, мс
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var st = document.createElement('style');
  st.textContent = '.fld-bolt{position:absolute;left:0;top:0;pointer-events:none;z-index:3;}'
    + '.fld-btns button.fld-btn-zap{border-color:rgba(214,230,255,.8);background:rgba(214,230,255,.07);box-shadow:0 0 20px 3px rgba(160,200,255,.28);transition:border-color .08s ease,background .08s ease,box-shadow .08s ease;}'
    + '.field-item.blurred.fld-zap{filter:blur(1.2px);opacity:1;transition:filter .12s ease,opacity .12s ease;}';
  document.head.appendChild(st);

  var zapBtn = null, zapUntil = 0;
  var fld = null, cv = null, ctx = null, W = 0, H = 0, K = 1, bolts = [], next = 0, last = -1, inView = true;

  function setup(el){
    fld = el; cv = document.createElement('canvas'); cv.className = 'fld-bolt'; cv.setAttribute('aria-hidden', 'true');
    fld.appendChild(cv); ctx = cv.getContext('2d'); size();
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ inView = en[0].isIntersecting; }, { threshold: .2 }).observe(fld);
  }
  function size(){
    if (!fld) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = fld.offsetWidth; H = fld.offsetHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // координаты элемента внутри поля (в CSS-пикселях поля; учитывает масштаб страницы и трансформации)
  function box(el){
    var f = fld.getBoundingClientRect(), r = el.getBoundingClientRect();
    K = fld.offsetWidth / (f.width || 1);
    return { x: (r.left - f.left) * K, y: (r.top - f.top) * K, w: r.width * K, h: r.height * K };
  }
  // точка на границе кнопки в сторону цели
  function edge(b, tx, ty){
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
    var s = Math.min(Math.abs((b.w / 2) / (dx || 1e-6)), Math.abs((b.h / 2) / (dy || 1e-6)));
    return { x: cx + dx * s, y: cy + dy * s };
  }
  // ломаная молнии методом смещения середины
  function path(x1, y1, x2, y2, rough){
    var pts = [[x1, y1], [x2, y2]], d = Math.hypot(x2 - x1, y2 - y1) * rough;
    for (var it = 0; it < 6; it++){
      var np = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++){
        var a = pts[i], b = pts[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1, o = (Math.random() - .5) * d;
        np.push([mx + nx / L * o, my + ny / L * o], b);
      }
      pts = np; d *= .52;
    }
    return pts;
  }
  function strike(){
    var btns = fld.querySelectorAll('.fld-btns button'); if (btns.length !== GROUPS.length) return;
    var gi; do { gi = Math.floor(Math.random() * GROUPS.length); } while (gi === last && GROUPS.length > 1);
    last = gi;
    var items = [].slice.call(fld.querySelectorAll('.field-item.blurred.fg-' + GROUPS[gi])).filter(function(e){ return e.offsetParent !== null; });
    if (!items.length) return;
    var b = box(btns[gi]), now = performance.now();
    if (zapBtn) zapBtn.classList.remove('fld-btn-zap');              // кнопка-источник подсвечивается на время разряда
    zapBtn = btns[gi]; zapBtn.classList.add('fld-btn-zap'); zapUntil = now + LIFE * .8 + items.length * 70;
    items.forEach(function(it, k){
      var t = box(it), tx = t.x + t.w / 2, ty = t.y + t.h / 2, s = edge(b, tx, ty), delay = k * 70 + Math.random() * 60;
      var main = path(s.x, s.y, tx, ty, .16), branches = [];
      for (var j = 0; j < 2; j++){                                  // пара коротких ответвлений
        var p = main[4 + Math.floor(Math.random() * (main.length - 12))], ang = Math.atan2(ty - s.y, tx - s.x) + (Math.random() - .5) * 1.6, len = 30 + Math.random() * 60;
        branches.push(path(p[0], p[1], p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len, .3));
      }
      bolts.push({ t0: now + delay, main: main, br: branches, el: it, zapped: false });
    });
  }
  function stroke(pts, w, a){
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineWidth = w; ctx.strokeStyle = 'rgba(214,230,255,' + a + ')'; ctx.stroke();
  }
  function draw(now){
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    bolts = bolts.filter(function(o){
      var age = now - o.t0; if (age < 0) return true; if (age > LIFE) { o.el.classList.remove('fld-zap'); return false; }
      if (!o.zapped && age > 60){ o.zapped = true; o.el.classList.add('fld-zap'); }
      if (o.zapped && age > LIFE * .6) o.el.classList.remove('fld-zap');
      var grow = Math.min(1, age / 90), n = Math.max(2, Math.round(o.main.length * grow));
      var fade = age < 90 ? 1 : Math.max(0, 1 - (age - 90) / (LIFE - 90));
      var flick = fade * (.65 + Math.random() * .35);                      // мерцание
      var seg = o.main.slice(0, n);
      ctx.shadowColor = 'rgba(160,200,255,.9)'; ctx.shadowBlur = 14;
      stroke(seg, 3.2, .18 * flick);
      ctx.shadowBlur = 6; stroke(seg, 1.3, .95 * flick);
      if (grow >= 1) o.br.forEach(function(b){ stroke(b, .8, .6 * flick); });
      ctx.shadowBlur = 0;
      return true;
    });
  }
  function frame(now){
    var el = document.querySelector('.fld');
    if (el && (el !== fld || !cv || !cv.isConnected)){ if (cv && cv.parentNode) cv.parentNode.removeChild(cv); bolts = []; setup(el); }
    if (fld && cv){
      if (fld.offsetWidth !== W || fld.offsetHeight !== H) size();
      var idle = !fld.classList.contains('fld-on'), phone = window.innerWidth < 700;
      if (zapBtn && (now > zapUntil || !idle)){ zapBtn.classList.remove('fld-btn-zap'); zapBtn = null; }
      if (!idle || phone){ if (bolts.length){ bolts.forEach(function(o){ o.el.classList.remove('fld-zap'); }); bolts = []; ctx.clearRect(0, 0, W, H); } next = now + 1200; }
      else {
        if (inView && !document.hidden && now > next){ strike(); next = now + PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN); }
        if (bolts.length) draw(now); else ctx.clearRect(0, 0, W, H);
      }
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);
})();
