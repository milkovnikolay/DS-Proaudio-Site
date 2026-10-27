/* =====================================================================
   ОТЗЫВЫ НА ГЛАВНОЙ — упрощённая ротонда.
   Показывает только центральное кольцо цилиндра со страницы «Отзывы» (reviews.html):
   те же карточки, изогнутые по внутренней поверхности цилиндра, те же 25 отзывов по кругу.
   Ограничения по сравнению со страницей «Отзывы»: нет верхних/нижних ярусов, нет наклона взгляда,
   нет колеса мыши (оно листает страницу), карточки не открываются.
   Движение: медленное автовращение, пока раздел на экране; можно потянуть мышью/пальцем по горизонтали.
   Данные (REV) собираются из тех же файлов, что и страница «Отзывы».
   ===================================================================== */
(function(){
  var REV = [{"name": "Юрий Астафьев", "short": "технический директор и звукорежиссёр Григория Лепса", "q": "DS PROAUDIO — одни из немногих, кто разрабатывает и использует громкоговорители собственного производства.", "tags": [], "ctx": "", "img": "./assets/reviews/thumb/rv-23.jpg", "video": true}, {"name": "Арсен Степанян", "short": "звукорежиссёр главной сцены фестиваля «Бессонница»", "q": "Это, наверное, лучший звук, который у нас когда-либо был на фестивале. Прекрасная детализация, чёткий и читаемый панч - бочка бьет прямо в душу.", "tags": ["Taura"], "ctx": "Фестиваль «Бессонница», главная сцена", "img": "./assets/reviews/thumb/rv-02.jpg", "video": true}, {"name": "Андрей Клюкин", "short": "генеральный директор, продюсер фестиваля «Дикая Мята»", "q": "Музыканты, организаторы и зрители остались в полном восторге – звук был высшего качества.", "tags": [], "ctx": "Фестиваль Vashana Sup Camp", "img": "./assets/reviews/thumb/rv-03.jpg", "video": true}, {"name": "Вячеслав Величковский", "short": "второй звукорежиссёр команды Полины Гагариной", "q": "Из отечественного – это лучший вариант на рынке. Звук плотный, система отзывчивая, отлично работают на тысячной площадке.", "tags": ["Taura", "Pillar"], "ctx": "Light + Audio Tec 2024, гастроли", "img": "./assets/reviews/thumb/rv-04.jpg", "video": true}, {"name": "Дмитрий Данилов", "short": "звукорежиссёр Елены Ваенги", "q": "Это, пожалуй, первая отечественная акустика, к которой у меня нет никаких претензий или вопросов.", "tags": ["Taura"], "ctx": "Сольный концерт Елены Ваенги, Реутов", "img": "./assets/reviews/thumb/rv-05.jpg", "video": true}, {"name": "Сергей Лукьянов", "short": "штатный звукорежиссёр арт-кэмпа «Дикая Мята»", "q": "Особенно отмечу среднечастотный диапазон – он хлесткий, но очень контролируемый, что значительно облегчало настройку инструментов и вокала.", "tags": ["Taura", "Taura C-Sub 18"], "ctx": "Арт-кэмп «Дикая Мята», сцена «Маяк»", "img": "./assets/reviews/thumb/rv-06.jpg", "video": true}, {"name": "Павел Бабаев", "short": "звукорежиссёр группы «Несчастный случай»", "q": "Здесь же он звучал мягко и естественно, без резкости, придавая звучанию плотность и тепло. Это не едкий аппарат.", "tags": ["Taura"], "ctx": "Конгресс звукорежиссёров, Самара", "img": "./assets/reviews/thumb/rv-07.jpg", "video": false}, {"name": "Владимир Касымов", "short": "концертный звукорежиссёр, начальник радиоцеха Московского ТЮЗа", "q": "Получился очень сбалансированный звук с отличной читаемостью, хорошим звуковым давлением и динамикой.", "tags": ["Pillar", "ERA"], "ctx": "Фестиваль «Бессонница», малая сцена", "img": "./assets/reviews/thumb/rv-08.jpg", "video": false}, {"name": "Сергей Проскуряков", "short": "инженер-проектировщик, акустический дизайнер", "q": "В сравнении с системами подобного класса от известных производителей Taura явно выигрывает. Это мой фаворит, и я без сомнений рекомендую её для любых задач.", "tags": ["Taura"], "ctx": "", "img": "./assets/reviews/thumb/rv-09.jpg", "video": true}, {"name": "Алексей Седов", "short": "основатель и генеральный продюсер компании «ЗАВОД ШОУ»", "q": "Массив Taura – долгожданная новинка от отечественного производителя, и когда он стал доступен, мы решили испытать его в деле.", "tags": ["Taura", "Pillar"], "ctx": "Выставка в Самаре, ДК «Мир» в Реутове", "img": "./assets/reviews/thumb/rv-10.jpg", "video": false}, {"name": "Вадим Ковалевский", "short": "звукорежиссёр Алексея Глызина", "q": "У системы ровное покрытие: на балконе, впереди и под балконом звук плотный и качественный.", "tags": ["Taura"], "ctx": "Сольный концерт Алексея Глызина, Реутов", "img": "./assets/reviews/thumb/rv-11.jpg", "video": true}, {"name": "Иван Тищенко", "short": "технический директор фестиваля «Бессонница»", "q": "На всех площадках удалось добиться равномерного покрытия, точного зонирования и естественного тонального баланса.", "tags": ["Taura", "ERA", "Pillar"], "ctx": "Фестиваль «Бессонница»", "img": "./assets/reviews/thumb/rv-12.jpg", "video": false}, {"name": "Александр Лепешкин", "short": "звукорежиссёр", "q": "Характер отклика оказался исключительным, обеспечивая прозрачность и чистоту звучания.", "tags": ["Pillar"], "ctx": "Конгресс звукорежиссёров", "img": "./assets/reviews/thumb/rv-13.jpg", "video": false}, {"name": "Станислав Белов", "short": "системный инженер, преподаватель Show Crew Academy", "q": "ERA с субами вызвала исключительно положительные эмоции у всех студентов, что собственно и ожидалось.", "tags": ["ERA", "S18", "CX108"], "ctx": "Семинар «Прикладная системная инженерия», Москва", "img": "./assets/reviews/thumb/rv-14.jpg", "video": false}, {"name": "Александр Аладышев", "short": "актер, музыкант, руководитель театрального товарищества «Завод»", "q": "Протестировав линейный массив Taura от DS PROAUDIO, был приятно впечатлён.", "tags": ["Taura"], "ctx": "Прослушивание", "img": "./assets/reviews/thumb/rv-15.jpg", "video": false}, {"name": "Надежда Рахманова", "short": "заведующий звукоцехом и выпускающий звукорежиссёр ДМТЮА", "q": "Всегда после прослушивания у меня остаются очень хорошие впечатления.", "tags": [], "ctx": "Конгресс звукорежиссёров, выставки", "img": "./assets/reviews/thumb/rv-16.jpg", "video": false}, {"name": "Константин Умаров", "short": "звукорежиссёр, главный звукоинженер фестиваля «Бессонница»", "q": "Благодаря вам, главная сцена фестиваля звучит как никогда хорошо!", "tags": ["Taura"], "ctx": "Фестиваль «Бессонница», Конгресс звукорежиссёров", "img": "./assets/reviews/thumb/rv-17.jpg", "video": false}, {"name": "Сергей Пьянов", "short": "звукорежиссёр ДК металлургов им. Серго Орджоникидзе", "q": "Новый линейный массив Taura произвел на меня отличное впечатление: приятный, мягкий и открытый звук, прекрасное звучание.", "tags": ["Taura"], "ctx": "", "img": "./assets/reviews/thumb/rv-18.jpg", "video": false}, {"name": "Сергей Ярков", "short": "бренд-менеджер компании Hi-Tech Media", "q": "Система обладает значительным запасом мощности и высоким хэдрумом, что позволяет раскрыть её потенциал в полной мере.", "tags": ["Taura", "Taura C-Sub 18"], "ctx": "Конгресс звукорежиссёров", "img": "./assets/reviews/thumb/rv-19.jpg", "video": false}, {"name": "Дмитрий Казанцев", "short": "звукорежиссёр", "q": "Его можно рассматривать для использования на стационарных площадках, и для использования в прокате. Впечатлила конструкция излучателя.", "tags": ["Taura"], "ctx": "Прослушивание", "img": "./assets/reviews/thumb/rv-20.jpg", "video": false}, {"name": "Роман Скрипник", "short": "основатель прокатного агентства Pro Event, Уренгой", "q": "Очень живенько звучащий комплект. Мне понравился. Для средних площадок это отличный вариант.", "tags": ["Pillar"], "ctx": "", "img": "./assets/reviews/thumb/rv-21.jpg", "video": false}, {"name": "Александр Антонов", "short": "звукорежиссёр ДК им. Кирова", "q": "Чистое, сбалансированное звучание, высокая мощность и надёжность оборудования значительно улучшили качество мероприятий в нашем зале.", "tags": ["ERA"], "ctx": "ДК им. Кирова, Пермский край", "img": "./assets/reviews/thumb/rv-22.jpg", "video": false}, {"name": "Александр Шведов", "short": "звукорежиссёр группы «Северный флот»", "q": "Мне понравился «вкус» системы и её звучания – хочется ещё поработать с ней и распробовать.", "tags": ["Taura"], "ctx": "Концерт группы «Северный флот»", "img": "./assets/reviews/thumb/rv-01.jpg", "video": true}, {"name": "Евгений Ефремов", "short": "технический директор, системный инженер", "q": "Динамика развития этого бренда меня не удивляет, она вдохновляет!", "tags": [], "ctx": "", "img": "./assets/reviews/thumb/rv-24.jpg", "video": true}, {"name": "Дмитрий Абрамов", "short": "прокатчик", "q": "Это практически лучшее приобретение которое было сделано!", "tags": ["Pillar"], "ctx": "Корабли, частные дома, площадки для конференций", "img": "./assets/reviews/thumb/rv-25.jpg", "video": true}];
  var M = REV.length, N = 5, step = 360 / N, DEG = 180 / Math.PI;
  var AUTO = 3.2;                                    // скорость автовращения, градусов в секунду
  var FRICTION = 0.95, GLIDE = 0.045;

  var CSS = ''
    + '#reviews{overflow:hidden;}'
    + '.hrv-stage{position:relative;width:100vw;margin-left:calc(50% - 50vw);overflow:hidden;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:pan-y;}'
    + '.hrv-stage.drag{cursor:grabbing;}'
    + '.hrv-stage::before,.hrv-stage::after{content:"";position:absolute;top:0;bottom:0;width:12vw;z-index:2;pointer-events:none;}'
    + '.hrv-stage::before{left:0;background:linear-gradient(90deg,#0A0A0B,rgba(10,10,11,0));}'
    + '.hrv-stage::after{right:0;background:linear-gradient(270deg,#0A0A0B,rgba(10,10,11,0));}'
    + '.hrv-vp{position:absolute;inset:0;perspective:1000px;perspective-origin:50% 50%;}'
    + '.hrv-ring{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;}'
    + '.hrv-strip{position:absolute;overflow:hidden;backface-visibility:hidden;}'
    + '.hrv-strip>.hrv-src{position:absolute;top:0;display:flex;flex-direction:column;color:#FAFAFA;font-family:"IBM Plex Sans",sans-serif;}'
    + '.hrv-above{flex:0 0 auto;display:flex;flex-direction:column;gap:.35em;padding-bottom:.75em;}'
    + '.hrv-idx{font-family:"PT Mono",monospace;font-size:.7em;letter-spacing:.1em;color:rgba(250,250,250,.5);}'
    + '.hrv-name{font-size:1.3em;font-weight:300;letter-spacing:.06em;text-transform:uppercase;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
    + '.hrv-body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:44% 1fr;background:#131315;border:1px solid rgba(255,255,255,.09);border-radius:.9em;overflow:hidden;}'
    + '.hrv-photo{background-size:cover;background-position:center 30%;background-color:#1B1B1E;}'
    + '.hrv-txt{display:flex;flex-direction:column;gap:.9em;min-width:0;padding:1.3em 1.3em 1.2em;}'
    + '.hrv-tags{display:flex;flex-wrap:wrap;gap:.4em;min-height:1.5em;}'
    + '.hrv-tag{font-family:"PT Mono",monospace;font-size:.62em;letter-spacing:.08em;text-transform:uppercase;padding:.35em .7em;border:1px solid rgba(255,255,255,.22);border-radius:99px;color:rgba(250,250,250,.8);}'
    + '.hrv-tag.vid{border-color:rgba(250,250,250,.7);color:#FAFAFA;}'
    + '.hrv-quote{flex:1;margin:0;font-size:1.06em;font-weight:300;line-height:1.45;color:#EDEDED;display:-webkit-box;-webkit-line-clamp:9;-webkit-box-orient:vertical;overflow:hidden;}'
    + '.hrv-pos{font-size:.72em;font-weight:300;line-height:1.4;color:rgba(250,250,250,.55);}'
    + '.hrv-pos::before{content:"";display:block;width:2.4em;border-top:1px solid rgba(255,255,255,.3);margin-bottom:.7em;}'
    + '.hrv-list{height:auto !important;display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px 4px;scrollbar-width:none;}'
    + '.hrv-list::-webkit-scrollbar{display:none;}'
    + '.hrv-m{flex:0 0 84%;scroll-snap-align:start;scroll-margin-left:20px;display:flex;flex-direction:column;background:#131315;border:1px solid rgba(255,255,255,.09);border-radius:18px;overflow:hidden;color:#FAFAFA;font-family:"IBM Plex Sans",sans-serif;}'
    + '.hrv-m-ph{position:relative;flex:0 0 210px;height:210px;background-size:cover;background-position:center 28%;background-color:#1B1B1E;}'
    + '.hrv-m-vid{position:absolute;left:14px;top:14px;font-family:"PT Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:6px 10px;border-radius:99px;background:rgba(10,10,11,.6);border:1px solid rgba(250,250,250,.5);}'
    + '.hrv-m-tx{display:flex;flex-direction:column;gap:10px;padding:18px 18px 20px;flex:1;}'
    + '.hrv-m-q{margin:0;font-size:16px;font-weight:300;line-height:1.5;color:#EDEDED;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden;flex:1;}'
    + '.hrv-m-n{margin-top:6px;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}'
    + '.hrv-m-p{font-size:12.5px;line-height:1.4;color:rgba(250,250,250,.55);}'
    + '@media (min-width:700px){.hrv-list{margin:0 -32px;padding:0 32px 4px;}.hrv-m{flex-basis:calc(50% - 6px);scroll-margin-left:32px;}}'
    + '.hrv-below{flex:0 0 auto;margin-top:.75em;font-family:"PT Mono",monospace;font-size:.66em;letter-spacing:.06em;text-transform:uppercase;color:rgba(250,250,250,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}';

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function cardHTML(r){
    var R = REV[r];
    var tags = (R.video ? '<span class="hrv-tag vid">▶ Видео</span>' : '') + R.tags.map(function(t){ return '<span class="hrv-tag">' + esc(t) + '</span>'; }).join('');
    return '<div class="hrv-above"><div class="hrv-idx">' + pad(r + 1) + ' / ' + M + '</div><div class="hrv-name">' + esc(R.name) + '</div></div>'
      + '<div class="hrv-body"><div class="hrv-photo" style="background-image:url(\'' + R.img + '\')"></div>'
      +   '<div class="hrv-txt"><div class="hrv-tags">' + tags + '</div>'
      +     '<p class="hrv-quote">«' + esc(R.q) + '»</p>'
      +     '<div class="hrv-pos">' + esc(R.short) + '</div></div></div>'
      + '<div class="hrv-below">' + esc(R.ctx || R.short) + '</div>';
  }

  var stage = null, ring = null, objs = [], S = {}, angle = 0, target = 0, vx = 0, coasting = false;
  var hover = false, inView = true, dragX = null, start = 0, lx = 0, lt = 0, lastTs = 0, curIdx = -1;
  var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  function build(el){
    stage = el; stage.innerHTML = ''; objs = [];
    stage.classList.add('hrv-stage'); stage.setAttribute('aria-hidden', 'true');
    var vp = document.createElement('div'); vp.className = 'hrv-vp';
    ring = document.createElement('div'); ring.className = 'hrv-ring';
    vp.appendChild(ring); stage.appendChild(vp);
    for (var i = 0; i < N; i++){
      var o = { slot: i, a: i * step, rev: -1, n: 24, strips: [] };
      for (var j = 0; j < o.n; j++){
        var s = document.createElement('div'); s.className = 'hrv-strip';
        var src = document.createElement('div'); src.className = 'hrv-src';
        s.appendChild(src); ring.appendChild(s); o.strips.push({ el: s, src: src });
      }
      objs.push(o);
    }
    stage.addEventListener('mouseenter', function(){ hover = true; });
    stage.addEventListener('mouseleave', function(){ hover = false; });
    stage.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      coasting = false; vx = 0; dragX = lx = e.clientX; lt = performance.now(); start = target;
      stage.classList.add('drag'); try { stage.setPointerCapture(e.pointerId); } catch(err){}
    });
    stage.addEventListener('pointermove', function(e){
      if (dragX === null) return;
      target = start - (e.clientX - dragX) * 0.12;
      var now = performance.now(), dt = Math.max(1, now - lt);
      vx = vx * .6 + (-(e.clientX - lx) * 0.12 / dt * 16) * .4; lx = e.clientX; lt = now;
    });
    function end(){
      if (dragX === null) return; dragX = null; stage.classList.remove('drag');
      if (performance.now() - lt > 80) vx = 0;
      target += vx * FRICTION / (1 - FRICTION); vx = 0; coasting = true;
    }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ inView = en[0].isIntersecting; }, { threshold: 0.15 }).observe(stage);
    }
    measure();
  }

  function measure(){
    var vw = window.innerWidth;
    S.w = vw < 760 ? Math.min(vw * .8, 440) : Math.min(vw * .40, 580);
    S.fs = S.w / 640 * 16; S.hb = S.w * .58; S.lab = S.fs * 4.9; S.h = S.hb + S.lab;
    S.R = Math.max(420, S.w * .88);
    stage.style.height = (S.h + 70) + 'px';
    objs.forEach(function(o){
      var sw = S.w / o.n;
      o.strips.forEach(function(st, j){
        st.el.style.width = (sw + 1) + 'px'; st.el.style.height = S.h + 'px';
        st.el.style.left = (-sw / 2) + 'px'; st.el.style.top = (-S.h / 2) + 'px';
        st.src.style.width = S.w + 'px'; st.src.style.height = S.h + 'px'; st.src.style.left = (-j * sw) + 'px';
        st.src.style.fontSize = S.fs + 'px';
      });
    });
  }
  function vis(a){ var d = Math.abs((((a - angle) % 360) + 540) % 360 - 180); return Math.max(0, Math.min(1, (130 - d) / 30)); }

  function render(){
    var R = S.R, c = Math.round(angle / step);
    objs.forEach(function(o){
      var d = ((o.slot - c) % N + N) % N; if (d > N / 2) d -= N;
      var k = c + d; o.a = k * step;
      var rev = ((k % M) + M) % M;
      if (rev !== o.rev){ o.rev = rev; var h = cardHTML(rev); o.strips.forEach(function(st){ st.src.innerHTML = h; }); }
      var span = S.w / R * DEG, sw = span / o.n, op = vis(o.a);
      o.strips.forEach(function(st, j){
        var aj = o.a - span / 2 + sw * (j + .5);
        st.el.style.transform = 'rotateY(' + (-aj) + 'deg) translateZ(' + (-R) + 'px)';
        st.el.style.opacity = op; st.el.style.visibility = op > 0 ? 'visible' : 'hidden';
      });
    });
    ring.style.transform = 'translateZ(' + (R - 170) + 'px) rotateY(' + angle + 'deg)';
    var idx = ((c % M) + M) % M;
    if (idx !== curIdx){ curIdx = idx; setCount(idx); }
  }

  // счётчик «01 / 25» рисует шаблон главной: меняем только цифру в его текстовом узле. Раньше счётчик
  // перезаписывался через innerHTML, и при следующей перерисовке шаблон не находил свои узлы — главная
  // на компьютере иногда падала с ошибкой removeChild и оставалась белой (27.10.2026).
  function setCount(i){
    var b = document.querySelector('#hrvCount b'), t = b && b.firstChild;
    if (t && t.nodeType === 3) t.nodeValue = pad(i + 1);
  }

  // телефон и планшет: вместо ротонды — лента карточек со свайпом (в ротонде текст на узком экране получается мельче 9 px)
  var phone = function(){ return window.innerWidth < 1100; };
  function buildList(el){
    stage = el; ring = null; objs = []; el.className = 'hrv-list'; el.removeAttribute('aria-hidden'); el.setAttribute('data-m', '1');
    el.innerHTML = REV.map(function(R, r){
      return '<article class="hrv-m"><div class="hrv-m-ph" style="background-image:url(\'' + R.img + '\')">' + (R.video ? '<span class="hrv-m-vid">▶ Видео</span>' : '') + '</div>'
        + '<div class="hrv-m-tx"><p class="hrv-m-q">«' + esc(R.q) + '»</p><div class="hrv-m-n">' + esc(R.name) + '</div><div class="hrv-m-p">' + esc(R.short) + '</div></div></article>';
    }).join('');
    el.onscroll = function(){
      var w = el.firstChild ? el.firstChild.offsetWidth + 12 : 1, i = Math.min(M - 1, Math.round(el.scrollLeft / w));
      setCount(i);
    };
  }

  function frame(ts){
    // главная собирается шаблоном — если контейнер появился заново, собираем ротонду заново
    var el = document.getElementById('hrvStage');
    // ждём, пока шаблон главной отрисует свой #hrvStage: если собрать ротонду раньше, шаблон забирает её
    // узлы себе, а при следующей перерисовке не находит их — главная падала с ошибкой removeChild (27.10.2026)
    if (el && window.React && !Object.keys(el).some(function(k){ return k.indexOf('__react') === 0; })){ requestAnimationFrame(frame); return; }
    if (el && phone()){ if (el.getAttribute('data-m') !== '1') buildList(el); requestAnimationFrame(frame); return; }
    if (el && el.getAttribute('data-m') === '1'){ el.removeAttribute('data-m'); el.className = ''; el.onscroll = null; ring = null; }
    if (el && (el !== stage || !ring || !ring.isConnected)) build(el);
    if (stage && ring && ring.isConnected){
      var dt = lastTs ? Math.min(64, ts - lastTs) : 16; lastTs = ts;
      if (!reduce && inView && !hover && dragX === null && !coasting) target += AUTO * dt / 1000;   // автовращение
      var k = coasting ? GLIDE : 0.12;
      angle += (target - angle) * k;
      if (coasting && Math.abs(target - angle) < 0.05) coasting = false;
      if (inView || dragX !== null) render();
    }
    requestAnimationFrame(frame);
  }
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  window.addEventListener('resize', function(){ if (stage) measure(); });
  requestAnimationFrame(frame);
})();
