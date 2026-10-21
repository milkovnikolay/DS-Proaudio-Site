/* DS PROAUDIO — страницы разделов и направлений на телефоне (пара к sub-mobile.css).
   Работает только на узком экране (до 699 px): раскрывающиеся особенности,
   единая лента объектов со счётчиком, «Ещё объекты» — по кнопке,
   отзывы — карточки со свайпом, точки под ними следуют за лентой. */
(function(){
  if (window.innerWidth >= 700) return;
  var d = document, root = d.documentElement;

  function ready(fn){ d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', fn) : fn(); }

  /* счётчик «01 / 07» с полоской под лентой */
  function counter(strip, items){
    if (!strip || items.length < 2) return;
    var box = d.createElement('div'); box.className = 'dsm-count';
    box.innerHTML = '<span>01</span><i><b></b></i><span>' + pad(items.length) + '</span>';
    strip.parentNode.insertBefore(box, strip.nextSibling);
    var cur = box.firstChild, bar = box.querySelector('b'), n = items.length;
    bar.style.width = (100 / n) + '%';
    function upd(){
      var k = nearest(strip, items);
      cur.textContent = pad(k + 1);
      bar.style.left = (100 * k / n) + '%';
    }
    strip.addEventListener('scroll', function(){ requestAnimationFrame(upd); }, { passive: true });
  }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function nearest(strip, items){
    var x = strip.scrollLeft, best = 0, bd = 1e9;
    for (var i = 0; i < items.length; i++){
      var dd = Math.abs(items[i].offsetLeft - strip.offsetLeft - x - parseFloat(getComputedStyle(strip).paddingLeft || 0));
      if (dd < bd){ bd = dd; best = i; }
    }
    if (x + strip.clientWidth >= strip.scrollWidth - 4) best = items.length - 1;
    return best;
  }

  ready(function(){
    var sub = !!d.querySelector('.eqb-sec');
    root.classList.add(sub ? 'dsm-sub' : 'dsm-hub');

    /* особенности: 4 пункта и больше — раскрываются по нажатию */
    d.querySelectorAll('.grid-3, .grid-2').forEach(function(g){
      var feats = Array.prototype.filter.call(g.children, function(c){ return c.classList.contains('feat'); });
      if (feats.length < 4) return;
      g.classList.add('dsm-acc');
      feats.forEach(function(f, i){
        var t = f.querySelector('.feat-title'), x = f.querySelector('.feat-text');
        if (!t || !x) return;
        var s = d.createElement('span');
        while (x.firstChild) s.appendChild(x.firstChild);
        x.appendChild(s);
        t.setAttribute('role', 'button'); t.setAttribute('tabindex', '0');
        function set(o){ f.classList.toggle('open', o); t.setAttribute('aria-expanded', o ? 'true' : 'false'); }
        set(i === 0);
        function tog(){ set(!f.classList.contains('open')); }
        t.addEventListener('click', tog);
        t.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tog(); } });
      });
    });

    /* объекты: все плитки — в одну ленту */
    var venues = sub && d.querySelector('#venues .bento');
    if (venues){
      d.querySelectorAll('#venues .pf-more > .bento .vtile').forEach(function(v){ venues.appendChild(v); });
      counter(venues, venues.querySelectorAll('.vtile'));
    }

    /* «Ещё объекты»: первые пять, остальные — по кнопке */
    d.querySelectorAll('.pfl').forEach(function(l){
      var rows = l.querySelectorAll('.pfl-row');
      if (rows.length < 8) return;
      l.classList.add('dsm-pfl-cut');
      var b = d.createElement('button'); b.type = 'button'; b.className = 'dsm-more';
      b.textContent = 'Показать ещё ' + (rows.length - 5);
      b.addEventListener('click', function(){ l.classList.remove('dsm-pfl-cut'); b.remove(); });
      l.appendChild(b);
    });

    /* оборудование для проекта — счётчик под лентой */
    d.querySelectorAll('.eqb-grid').forEach(function(g){ counter(g, g.querySelectorAll('.eqb-card')); });

    /* отзывы: точки следуют за лентой; смена отзыва по таймеру прокручивает ленту */
    var qs = d.getElementById('quotes');
    if (qs){
      var items = qs.querySelectorAll('.quote'), dots = d.querySelectorAll('.q-dot'), touched = 0, t;
      function go(i){ qs.scrollTo({ left: items[i].offsetLeft - qs.offsetLeft - 20, behavior: 'smooth' }); }
      qs.addEventListener('touchstart', function(){ touched = Date.now(); }, { passive: true });
      qs.addEventListener('scroll', function(){
        clearTimeout(t);
        t = setTimeout(function(){
          var k = nearest(qs, items);
          if (dots[k] && !dots[k].classList.contains('on')) dots[k].click();
        }, 140);
      }, { passive: true });
      new MutationObserver(function(){
        if (Date.now() - touched < 12000) return;
        for (var i = 0; i < items.length; i++) if (items[i].classList.contains('on')){
          if (nearest(qs, items) !== i) go(i);
          break;
        }
      }).observe(qs, { subtree: true, attributes: true, attributeFilter: ['class'] });
      dots.forEach(function(dot, i){ dot.addEventListener('click', function(){ if (nearest(qs, items) !== i) go(i); }); });
    }
  });
})();
