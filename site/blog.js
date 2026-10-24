/* DS PROAUDIO — блог: вывод карточек из blog-data.js.
   Главная:  <div id="blogHome"></div>  → 4 последних материала (на телефоне — 2).
   blog.html: <div id="blogTabs"></div><div id="blogGrid"></div> → рубрики «Все / Проекты и события / Инженерные разборы / Интервью».
             Рубрику можно открыть ссылкой: blog.html#projects, #engineering, #interviews.
   blog-post.html?id=<id>: <article id="blogPost"></article> → шаблон статьи + «Ещё материалы». */
(function(){
  var POSTS = (window.DS_BLOG || []).slice().sort(function(a, b){ return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  var TYPES = window.DS_BLOG_TYPES || {};
  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function fmt(d){ var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : esc(d); }
  function url(p){ return './blog-post.html?id=' + encodeURIComponent(p.id); }

  function card(p, opts){
    opts = opts || {};
    var t = TYPES[p.type] || { one: p.type };
    return '<a class="bl-card' + (opts.lead ? ' bl-lead' : '') + '" href="' + url(p) + '">' +
      '<span class="bl-img"><img src="' + esc(p.img) + '" alt="" loading="lazy"' + (p.pos ? ' style="object-position:' + esc(p.pos) + '"' : '') + '></span>' +
      '<span class="bl-type" data-t="' + esc(p.type) + '">' + esc(t.one) + '</span>' +
      '<span class="bl-title">' + esc(p.title) + '</span>' +
      (opts.lead && p.lead ? '<span class="bl-lead-text">' + esc(p.lead) + '</span>' : '') +
      '<time class="bl-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time>' +
    '</a>';
  }

  /* ---------- главная ---------- */
  function fillHome(){
    var home = document.getElementById('blogHome');
    if (!home || home.children.length) return;
    var last = POSTS.slice(0, 4);
    if (last.length < 2){ var sec = home.closest('section'); if (sec) sec.hidden = true; }   /* меньше двух материалов — блок не показываем */
    else home.innerHTML = last.map(function(p){ return card(p); }).join('');
  }
  fillHome();
  /* главная собирается шаблоном и может перерисовать раздел уже после этого скрипта — тогда заполняем заново */
  if (document.querySelector('sc-for, [data-dc-tpl]') && window.MutationObserver)
    new MutationObserver(fillHome).observe(document.body, { childList: true, subtree: true });

  /* ---------- страница блога ---------- */
  var grid = document.getElementById('blogGrid'), tabs = document.getElementById('blogTabs');
  if (grid && tabs){
    var KEYS = ['all', 'projects', 'engineering', 'interviews'];
    var count = function(k){ return k === 'all' ? POSTS.length : POSTS.filter(function(p){ return p.type === k; }).length; };
    tabs.innerHTML = KEYS.map(function(k){
      return '<a class="bl-tab" role="tab" href="#' + (k === 'all' ? '' : k) + '" data-k="' + k + '">' + (k === 'all' ? 'Все' : esc(TYPES[k].label)) + ' <b>' + count(k) + '</b></a>';
    }).join('');
    function show(k){
      if (KEYS.indexOf(k) < 0) k = 'all';
      [].forEach.call(tabs.children, function(a){ a.setAttribute('aria-selected', a.getAttribute('data-k') === k ? 'true' : 'false'); });
      var list = k === 'all' ? POSTS : POSTS.filter(function(p){ return p.type === k; });
      grid.innerHTML = list.length ? list.map(function(p, i){ return card(p, { lead: i === 0 }); }).join('')
                                   : '<p class="bl-empty">В этой рубрике пока нет материалов.</p>';
    }
    tabs.addEventListener('click', function(e){
      var a = e.target.closest('.bl-tab'); if (!a) return;
      e.preventDefault();
      var k = a.getAttribute('data-k');
      history.replaceState(null, '', k === 'all' ? location.pathname + location.search : '#' + k);
      show(k);
    });
    window.addEventListener('hashchange', function(){ show(location.hash.slice(1)); });
    show(location.hash.slice(1));
  }

  /* ---------- шаблон статьи ---------- */
  var art = document.getElementById('blogPost');
  if (art){
    var id = new URLSearchParams(location.search).get('id');
    var p = POSTS.filter(function(x){ return x.id === id; })[0] || POSTS[0];
    if (!p) return;
    var t = TYPES[p.type] || { one: p.type, label: p.type };
    document.title = p.title + ' — Блог DS PROAUDIO';
    var md = document.querySelector('meta[name="description"]'); if (md && p.lead) md.setAttribute('content', p.lead);
    var set = function(sel, html){ var el = document.querySelector(sel); if (el) el.innerHTML = html; };
    set('[data-bl="crumb"]', esc(p.title));
    set('[data-bl="type"]', '<a href="./blog.html#' + esc(p.type) + '" class="bl-type" data-t="' + esc(p.type) + '">' + esc(t.one) + '</a>');
    set('[data-bl="date"]', '<time class="bl-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time>');
    set('[data-bl="title"]', esc(p.title));
    set('[data-bl="lead"]', esc(p.lead || ''));
    set('[data-bl="cover"]', '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '"' + (p.pos ? ' style="object-position:' + esc(p.pos) + '"' : '') + '>');
    var body = (p.body || []).map(function(s){
      return /^## /.test(s) ? '<h2>' + esc(s.slice(3)) + '</h2>' : '<p>' + esc(s) + '</p>';
    }).join('');
    if (!body) body = '<div class="bl-draft"><b>Материал готовится</b>Полный текст появится здесь в ближайшее время.</div>';
    if (p.link) body += '<a class="bl-rel" href="' + esc(p.link.href) + '">' + esc(p.link.label) + ' <span aria-hidden="true">→</span></a>';
    set('[data-bl="body"]', body);
    var more = POSTS.filter(function(x){ return x.id !== p.id && x.type === p.type; });
    more = more.concat(POSTS.filter(function(x){ return x.id !== p.id && x.type !== p.type; })).slice(0, 3);
    set('[data-bl="more"]', more.map(function(x){ return card(x); }).join(''));
  }
})();
