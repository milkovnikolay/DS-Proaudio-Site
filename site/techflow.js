/* DS PROAUDIO — главная, блок «Технологии»: карточки .pr-tech (собираются gen.py между TECH-START/TECH-END)
   превращаются в светлую 3D-ленту (Cover Flow): центральная карточка крупно, соседние повёрнуты и уходят вглубь.
   Управление — как у ротонды отзывов на главной (reviews-ring.js):
     · медленное плавное движение по умолчанию, пока блок на экране;
     · при наведении движение останавливается;
     · можно потянуть мышью/пальцем по горизонтали — после отпускания лента докатывается по инерции.
   Картинки не кликабельны; ссылки (название, «Подробнее о технологии») работают у центральной карточки.
   Разметку карточек скрипт не меняет — только добавляет стили. */
(function(){
  var AUTO = 0.075;                     // скорость автодвижения, карточек в секунду (~13 с на карточку)
  var FRICTION = 0.95, GLIDE = 0.045;   // инерция после перетаскивания — как в reviews-ring.js
  var CSS = ''
    + '#tech{overflow:hidden;}'
    + '#tech .pr-techs.tfx{display:block;position:relative;height:var(--tfh,560px);perspective:1700px;user-select:none;-webkit-user-select:none;touch-action:pan-y;cursor:grab;}'
    + '#tech .pr-techs.tfx.drag{cursor:grabbing;}'
    + '#tech .tfx .pr-tech{position:absolute;left:50%;top:0;width:var(--tfw,440px);height:var(--tfh,560px);margin-left:calc(var(--tfw,440px) / -2);will-change:transform;transition:box-shadow .4s ease,border-color .4s ease;box-shadow:0 10px 30px -22px rgba(0,0,0,.35);}'
    + '#tech .tfx .pr-tech::after{content:"";position:absolute;inset:0;background:#FCFCFC;opacity:var(--tfo,0);pointer-events:none;border-radius:inherit;}'
    + '#tech .tfx .pr-tech.cur{border-color:#D6D6D6;box-shadow:0 34px 60px -30px rgba(0,0,0,.38);}'
    + '#tech .tfx .pr-tech-img{pointer-events:none;cursor:inherit;}'                 /* картинки не кликабельны */
    + '#tech .tfx .pr-tech img{-webkit-user-drag:none;}'
    + '#tech .tfx .pr-tech:hover .pr-tech-img img{transform:none;}'
    + '#tech .tfx .pr-tech:not(.cur) a{pointer-events:none;}'                       /* ссылки — только у центральной */
    + '#tech .tfx .pr-tech-body{padding:22px 26px 26px;gap:12px;}'
    + '#tech .tfx .pr-tech h3{font-size:20px;}'
    + '#tech .tfx .pr-tech p{font-size:15px;line-height:1.6;}'
    + '#tech .tfx .pr-tech-more{transition:opacity .35s ease;}'
    + '#tech .tfx .pr-tech:not(.cur) .pr-tech-more{opacity:0;}'
    + '.tfx-foot{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:-30px;font-family:"PT Mono",monospace;font-size:12px;letter-spacing:.08em;color:#ADADAD;}'
    + '.tfx-foot b{font-weight:500;color:#141414;}'
    + '.tfx-hint{font-size:11px;color:#BDBDBD;}'
    + '@media (max-width:760px){.tfx-foot{flex-direction:column;align-items:flex-start;gap:8px;}}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var box = null, C = [], foot = null, cnt = null, N = 0;
  var pos = 0, tgt = 0, vx = 0, coasting = false, hover = false, inView = true;
  var dragX = null, start = 0, lx = 0, lt = 0, moved = 0, lastTs = 0, curIdx = -1;

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function wrap(d){ d = ((d % N) + N) % N; return d > N / 2 ? d - N : d; }
  function W(){ return C[0] ? C[0].offsetWidth : 440; }

  function size(){
    var vw = document.documentElement.clientWidth, w = vw < 760 ? Math.min(vw * .82, 340) : 440;
    box.style.setProperty('--tfw', w + 'px');
    box.style.setProperty('--tfh', Math.round(w * 1.27) + 'px');
  }
  function render(){
    var w = W();
    C.forEach(function(c, i){
      var d = wrap(i - pos), a = Math.abs(d), s = d < 0 ? -1 : 1;
      var x = d * w * .5 + s * Math.min(a, 1) * w * .24, z = -Math.min(a, 4) * 170, ry = -s * Math.min(a, 1) * 48;
      c.style.transform = 'translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + ry + 'deg)';
      c.style.zIndex = 100 - Math.round(a * 10);
      c.style.opacity = a > 2.6 ? Math.max(0, 3.2 - a) / .6 : 1;
      c.style.setProperty('--tfo', Math.min(a, 2) * .22);
      c.classList.toggle('cur', a < .5);
    });
    var k = ((Math.round(pos) % N) + N) % N;
    if (k !== curIdx){ curIdx = k; cnt.innerHTML = '<b>' + pad(k + 1) + '</b> / ' + pad(N); }
  }

  function build(el){
    box = el; C = [].slice.call(el.querySelectorAll(':scope > .pr-tech')); N = C.length;
    if (N < 3) return false;
    el.classList.add('tfx');
    foot = document.createElement('div'); foot.className = 'tfx-foot';
    foot.innerHTML = '<span class="tfx-cnt"></span><span class="tfx-hint">Потяните, чтобы прокрутить · подробности — по ссылке на карточке</span>';
    cnt = foot.querySelector('.tfx-cnt');
    el.parentNode.insertBefore(foot, el.nextSibling);

    el.addEventListener('mouseenter', function(){ hover = true; });
    el.addEventListener('mouseleave', function(){ hover = false; });
    el.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('a')) return;                          // нажатие на ссылку — не перетаскивание
      coasting = false; vx = 0; dragX = lx = e.clientX; lt = performance.now(); start = tgt; moved = 0;
      el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch(err){}
    });
    el.addEventListener('pointermove', function(e){
      if (dragX === null) return;
      var k = 1 / (W() * .6);
      moved = Math.max(moved, Math.abs(e.clientX - dragX));
      tgt = start - (e.clientX - dragX) * k;
      var now = performance.now(), dt = Math.max(1, now - lt);
      vx = vx * .6 + (-(e.clientX - lx) * k / dt * 16) * .4; lx = e.clientX; lt = now;
    });
    function end(){
      if (dragX === null) return; dragX = null; el.classList.remove('drag');
      if (performance.now() - lt > 80) vx = 0;
      tgt += vx * FRICTION / (1 - FRICTION); vx = 0; coasting = true;
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('click', function(e){ if (moved > 6){ e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    el.addEventListener('dragstart', function(e){ e.preventDefault(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ inView = en[0].isIntersecting; }, { threshold: .15 }).observe(el);
    size(); curIdx = -1;
    return true;
  }

  function frame(ts){
    // главная собирается шаблоном — если блок перерисован, собираем ленту заново
    var el = document.querySelector('#tech .pr-techs');
    if (el && (el !== box || !el.classList.contains('tfx') || !foot || !foot.isConnected)){
      if (foot && foot.parentNode) foot.parentNode.removeChild(foot);
      box = null; N = 0; build(el);
    }
    if (box && N){
      var dt = lastTs ? Math.min(64, ts - lastTs) : 16; lastTs = ts;
      if (!reduce && inView && !hover && dragX === null && !coasting) tgt += AUTO * dt / 1000;   // медленное автодвижение
      pos += (tgt - pos) * (coasting ? GLIDE : .12);
      if (coasting && Math.abs(tgt - pos) < .002) coasting = false;
      if (inView || dragX !== null) render();
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function(){ if (box) size(); });
  requestAnimationFrame(frame);
})();
