# -*- coding: utf-8 -*-
"""Раздел «Клиентам» (21.10.2026): четыре посадочные страницы по образцу шоурума.

Запуск:  python3 -I build.py <папка site>
Берёт шапку, меню, подвал и общие стили из showroom.html и пишет:
  demo.html — выездная демонстрация, consultation.html — консультация по объекту,
  prices.html — узнать цены, where-to-buy.html — где купить.
Логика страниц и источники — analiz/klientam-2026-10-21.md в репозитории.
"""
import json, re, sys, os, html

SITE = sys.argv[1]
SRC = open(os.path.join(SITE, 'showroom.html'), encoding='utf-8').read()
REV = json.loads(re.search(r'var REV = (\[.*?\]);', open(os.path.join(SITE, 'reviews-ring.js'), encoding='utf-8').read(), re.S).group(1))
PF = json.load(open(os.path.join(SITE, 'assets/portfolio/portfolio.json'), encoding='utf-8'))
E = html.escape
TEL, TEL_H = '+74951501238', '8 495 150-12-38'

# ---------- общие куски ----------
def crumbs(name):
    return ('<nav aria-label="Навигационная цепочка"><ol class="crumbs"><li><a href="./Main.dc.html">Главная</a></li>'
            '<li class="sep" aria-hidden="true">/</li><li><a href="./clients.html">Клиентам</a></li>'
            '<li class="sep" aria-hidden="true">/</li><li aria-current="page">' + name + '</li></ol></nav>')

def hero(name, kick, h1, lead, imgs, stats, cta, cta2, addr):
    sl = ''.join('<img src="./assets/%s" alt=""%s>' % (p, ' class="on"' if i == 0 else ' loading="lazy"') for i, p in enumerate(imgs))
    st = ''.join('<div class="pr-stat"><b>%s</b><span>%s</span></div>' % s for s in stats)
    dots = ''.join('<i%s></i>' % (' class="on"' if i == 0 else '') for i in range(len(imgs)))
    return f'''<section class="sz-hero" id="top">
  <div class="sz-sl" aria-hidden="true">{sl}</div>
  <div class="wrap">
    {crumbs(name)}
    <div class="pr-kick" style="margin-top:36px;">{kick}</div>
    <h1 class="pr-h1">{h1}</h1>
    <p class="pr-lead">{lead}</p>
    <div class="pr-stats">{st}</div>
    <div class="pr-ctas"><a href="#{cta[0]}" class="pr-btn">{cta[1]} →</a><a href="#{cta2[0]}" class="pr-btn gh">{cta2[1]} ↓</a></div>
    <div class="sz-addr"><i></i>{addr}</div>
  </div>
  <div class="sz-dots" aria-hidden="true">{dots}</div>
</section>'''

def sec(cls, sid, kick, h2, p, inner):
    kc = ' style="color:#8A8A8A;"' if cls == 'lt' else ''
    pp = f'\n    <p class="pr-p">{p}</p>' if p else ''
    return f'''<section class="pr-sec {cls}" id="{sid}">
  <div class="wrap">
    <div class="pr-kick"{kc}>{kick}</div>
    <h2 class="pr-h2">{h2}</h2>{pp}
    {inner}
  </div>
</section>'''

def cards(items):
    """Три карточки с фото: (фото, заголовок, текст[, ссылка])."""
    out = []
    for i, it in enumerate(items):
        ph, t, d = it[:3]
        more = f'<a class="kl-more" href="{it[3][0]}">{it[3][1]} →</a>' if len(it) > 3 else ''
        out.append(f'<article class="sz-w reveal"><button type="button" class="sz-w-ph" data-gal=\'["./assets/{ph}"]\' data-i="0" data-t="{E(t)}" style="padding:0;border:0;">'
                   f'<img src="./assets/{ph}" alt="{E(t)}" loading="lazy"></button><div class="sz-w-tx"><b>{i+1:02d}</b><h3>{t}</h3><p>{d}</p>{more}</div></article>')
    return '<div class="sz-why">' + ''.join(out) + '</div>'

def steps(items):
    return '<ol class="sz-steps kl-steps-%d">' % len(items) + ''.join(
        f'<li class="reveal"><b>{i+1:02d}</b><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(items)) + '</ol>'

def bring(title, items):
    return ('<div class="sz-bring reveal"><h3>' + title + '</h3><ul>' +
            ''.join(f'<li><b>{t}</b>{d}</li>' for t, d in items) + '</ul></div>')

def quotes(names, title_more=True):
    by = {r['name']: r for r in REV}
    idx = {r['name']: i + 1 for i, r in enumerate(REV)}
    fig = ''.join(f'<figure class="reveal"><blockquote>{E(by[n]["q"])}</blockquote><figcaption><b>{E(n)}</b>{E(by[n]["short"])}</figcaption></figure>' for n in names)
    more = '<div class="sz-more"><a href="./reviews.html" class="pr-btn gh">Все отзывы →</a><a href="./portfolio.html" class="pr-btn gh">141 объект в портфолио →</a></div>' if title_more else ''
    return '<div class="sz-q">' + fig + '</div>' + more

def faq(items, dark=False):
    return '<div class="kl-faq%s">' % (' dk' if dark else '') + ''.join(
        f'<details class="reveal"><summary>{q}<i aria-hidden="true"></i></summary><div>{a}</div></details>' for q, a in items) + '</div>'

def seg(name, opts, multi=False, first=True):
    t = 'checkbox' if multi else 'radio'
    return '<div class="seg">' + ''.join(
        f'<label><input type="{t}" name="{name}" value="{E(o)}"{" checked" if (first and i == 0 and not multi) else ""}><span>{o}</span></label>'
        for i, o in enumerate(opts)) + '</div>'

def form(fid, kind, kick, h2, p, points, fields, submit, ok_h, ok_p, card=None, extra=''):
    pts = ''.join(f'<li>{x}</li>' for x in points)
    cardh = ''
    if card:
        dl = ''.join(f'<dt>{a}</dt><dd>{b}</dd>' for a, b in card)
        cardh = f'''<div class="sz-card"><dl>{dl}</dl><div class="pr-ctas"><a href="tel:{TEL}" class="pr-btn gh">Позвонить</a><a href="mailto:info@ds-proaudio.ru" class="pr-btn gh">Написать</a></div></div>'''
    return f'''<section class="pr-sec dk" id="{fid}">
  <div class="wrap tour">
    <div>
      <div class="pr-kick">{kick}</div>
      <h2 class="pr-h2">{h2}</h2>
      <p class="pr-p">{p}</p>
      <ul class="tour-points">{pts}</ul>
      {cardh}
    </div>
    <div>
      <div class="kl-box">
        <form class="tf" data-kind="{kind}" novalidate>
          {fields}
          <label class="full cons"><input type="checkbox" name="consent" required><span>Согласен на обработку персональных данных (<a href="#">политика конфиденциальности</a>)</span></label>
          <div class="tf-err" role="alert">Заполните имя и телефон и отметьте согласие.</div>
          <div class="tf-sub"><button type="submit">{submit}</button><span>или позвоните: <a href="tel:{TEL}">{TEL_H}</a></span></div>
        </form>
        <div class="tf-ok" role="status"><h3>{ok_h}</h3><p>{ok_p}</p></div>
      </div>
      {extra}
    </div>
  </div>
</section>'''

F_NAME = '<label><span class="flb">Имя <em>*</em></span><input type="text" name="name" autocomplete="name" required></label>'
F_PHONE = '<label><span class="flb">Телефон <em>*</em></span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" required placeholder="+7"></label>'
F_ORG = '<label><span class="flb">Организация</span><input type="text" name="company" autocomplete="organization"></label>'
F_MAIL = '<label><span class="flb">E-mail</span><input type="email" name="email" autocomplete="email"></label>'
F_CITY = '<label><span class="flb">Город</span><input type="text" name="city" autocomplete="address-level2"></label>'

NEXT = [('showroom.html', 'Посетить шоурум', 'Послушать системы в настоящем зале в Москве'),
        ('demo.html', 'Выездная демонстрация', 'Привезём TAURA на вашу площадку'),
        ('consultation.html', 'Консультация по объекту', 'Подбор системы и акустический расчёт'),
        ('prices.html', 'Узнать цены', 'Коммерческое предложение от производителя'),
        ('where-to-buy.html', 'Где купить', 'Напрямую или через партнёра в регионе'),
        ('delivery.html', 'Срок поставки', 'Склад в Москве, отгрузка за несколько дней')]

def next_block(cur):
    a = ''.join(f'<a href="./{h}" class="kl-n reveal"><b>{t}</b><span>{d}</span><i aria-hidden="true">→</i></a>' for h, t, d in NEXT if h != cur)
    return f'''<section class="pr-sec lt kl-next-sec">
  <div class="wrap">
    <div class="pr-kick" style="color:#8A8A8A;">Клиентам</div>
    <h2 class="pr-h2">Что ещё можно сделать</h2>
    <div class="kl-next">{a}</div>
  </div>
</section>'''

# ---------- стили страниц «Клиентам» (добавляются к стилям шоурума) ----------
CSS = '''<style>
/* ===== раздел «Клиентам»: посадочные страницы (21.10.2026). Сборка: tools/klientam/build.py ===== */
.kl-more{display:inline-block;margin-top:14px;font-size:14px;font-weight:600;color:#141414;text-decoration:underline;text-underline-offset:4px;}
.kl-steps-5{grid-template-columns:repeat(5,minmax(0,1fr));}
.pr-sec.dk .sz-steps{border-color:rgba(255,255,255,.16);} .pr-sec.dk .sz-steps li::before{background:#FAFAFA;}
.pr-sec.dk .sz-steps h3{color:#FAFAFA;} .pr-sec.dk .sz-steps p{color:#A8A8A8;}
.pr-sec.lt .pr-btn.kl-solid{background:#141414;color:#FAFAFA;border-color:#141414;}
.kl-steps-6{grid-template-columns:repeat(6,minmax(0,1fr));}
/* частые вопросы */
.kl-faq{margin-top:44px;border-top:1px solid #DADADA;}
.kl-faq details{border-bottom:1px solid #DADADA;}
.kl-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:24px;padding:24px 0;font-family:'Montserrat',sans-serif;font-weight:600;font-size:19px;line-height:1.35;color:#141414;}
.kl-faq summary::-webkit-details-marker{display:none;}
.kl-faq summary i{flex:0 0 auto;position:relative;width:14px;height:14px;}
.kl-faq summary i::before,.kl-faq summary i::after{content:"";position:absolute;left:0;top:6px;width:14px;height:2px;background:currentColor;transition:transform .3s;}
.kl-faq summary i::after{transform:rotate(90deg);}
.kl-faq details[open] summary i::after{transform:rotate(0);}
.kl-faq details>div{max-width:860px;padding:0 0 26px;font-size:16px;line-height:1.65;color:#5E5E5E;}
.kl-faq details>div a{text-decoration:underline;text-underline-offset:3px;color:#141414;}
.kl-faq.dk{border-color:rgba(255,255,255,.12);} .kl-faq.dk details{border-color:rgba(255,255,255,.12);}
.kl-faq.dk summary{color:#FAFAFA;} .kl-faq.dk details>div{color:#BDBDBD;} .kl-faq.dk details>div a{color:#FAFAFA;}
/* следующий шаг */
.kl-next{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:40px;}
.kl-n{position:relative;display:flex;flex-direction:column;gap:8px;min-height:150px;padding:22px 22px 52px;border-radius:14px;background:#FFFFFF;border:1px solid #E6E6E6;transition:border-color .25s,transform .35s cubic-bezier(.2,.7,.2,1);}
.kl-n b{font-family:'Montserrat',sans-serif;font-size:17px;line-height:1.3;color:#141414;}
.kl-n span{font-size:14px;line-height:1.5;color:#6A6A6A;}
.kl-n i{position:absolute;left:22px;bottom:18px;font-style:normal;font-size:18px;color:#141414;transition:transform .3s;}
.kl-n:hover{border-color:#141414;transform:translateY(-3px);} .kl-n:hover i{transform:translateX(6px);}
/* три пути (цены, где купить) */
.kl-paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:48px;}
.kl-path{display:flex;flex-direction:column;gap:12px;padding:30px 28px;border-radius:16px;background:#151517;border:1px solid rgba(255,255,255,.08);}
.kl-path b{font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.12em;color:#8A8A8A;}
.kl-path h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:22px;line-height:1.25;color:#FAFAFA;}
.kl-path p{margin:0;font-size:15.5px;line-height:1.6;color:#BDBDBD;}
.kl-path .pr-btn{margin-top:auto;align-self:flex-start;padding:12px 18px;font-size:13px;}
.kl-path ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;}
.kl-path li{position:relative;padding-left:18px;font-size:14.5px;line-height:1.5;color:#BDBDBD;}
.kl-path li::before{content:"";position:absolute;left:0;top:.7em;width:8px;height:1px;background:#8A8A8A;}
/* из чего складывается цена */
.kl-fx{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:48px;border-top:1px solid #DADADA;}
.kl-fx div{padding:26px 28px 28px 0;border-bottom:1px solid #DADADA;}
.kl-fx b{display:block;font-family:'PT Mono',monospace;font-weight:400;font-size:12px;letter-spacing:.12em;color:#9A9A9A;}
.kl-fx h3{margin:10px 0 8px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:19px;line-height:1.3;color:#141414;}
.kl-fx p{margin:0;font-size:15px;line-height:1.6;color:#5E5E5E;}
/* расчёты EASE */
.kl-calc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:48px;}
.kl-calc figure{margin:0;display:flex;flex-direction:column;gap:14px;}
.kl-calc button{position:relative;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:14px;overflow:hidden;background:#FFFFFF;aspect-ratio:5/4;cursor:zoom-in;}
.kl-calc img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:transform .9s cubic-bezier(.2,.7,.2,1);}
.kl-calc button:hover img{transform:scale(1.04);}
.kl-calc figcaption{font-size:14.5px;line-height:1.5;color:#BDBDBD;}
.kl-calc figcaption b{display:block;font-family:'Montserrat',sans-serif;font-size:16px;color:#FAFAFA;margin-bottom:4px;}
/* направления */
.kl-seg{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px;}
.kl-seg a{display:inline-flex;align-items:baseline;gap:10px;padding:13px 18px;border-radius:12px;border:1px solid #DADADA;color:#141414;font-family:'Montserrat',sans-serif;font-weight:600;font-size:16px;transition:background .25s,border-color .25s;}
.kl-seg a span{font-family:'PT Mono',monospace;font-weight:400;font-size:11px;letter-spacing:.08em;color:#8A8A8A;}
.kl-seg a:hover{border-color:#141414;background:#FFFFFF;}
/* география */
.kl-geo{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:48px;margin-top:48px;align-items:start;}
.kl-geo-n{font-family:'Montserrat',sans-serif;font-weight:700;font-size:96px;line-height:1;color:#FAFAFA;}
.kl-geo-n+p{margin:14px 0 0;font-size:16px;line-height:1.6;color:#BDBDBD;}
.kl-cities{display:flex;flex-wrap:wrap;gap:8px;}
.kl-cities span{padding:8px 12px;border-radius:99px;border:1px solid rgba(255,255,255,.14);font-size:13.5px;color:#D6D6D6;}
.kl-cities span b{font-family:'PT Mono',monospace;font-weight:400;font-size:11px;color:#8A8A8A;margin-left:6px;}
/* квиз на странице цен */
.kl-quiz{margin-top:48px;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:20px;align-items:stretch;}
.kl-q{padding:32px 32px 28px;border-radius:16px;background:#FFFFFF;border:1px solid #E6E6E6;}
.kl-q fieldset{margin:0 0 22px;padding:0;border:0;}
.kl-q legend{margin-bottom:12px;font-family:'PT Mono',monospace;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#8A8A8A;}
.kl-q .seg label span{border-color:#DADADA;color:#3A3A3A;}
.kl-q .seg input:checked+span{background:#141414;color:#FAFAFA;border-color:#141414;}
.kl-res{display:flex;flex-direction:column;gap:14px;padding:32px;border-radius:16px;background:#141414;color:#FAFAFA;}
.kl-res b{font-family:'PT Mono',monospace;font-weight:400;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#8A8A8A;}
.kl-res h3{margin:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:26px;line-height:1.25;}
.kl-res p{margin:0;font-size:15.5px;line-height:1.6;color:#BDBDBD;}
.kl-res .kl-ser{display:flex;flex-wrap:wrap;gap:8px;}
.kl-res .kl-ser a{padding:9px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.25);font-weight:600;font-size:14px;}
.kl-res .kl-ser a:hover{background:#FAFAFA;color:#141414;}
.kl-res .pr-btn{margin-top:auto;align-self:flex-start;}
.kl-res small{font-size:12.5px;line-height:1.5;color:#7A7A7A;}
.kl-box .tf-ok{display:none;} .kl-box.sent .tf{display:none;} .kl-box.sent .tf-ok{display:block;}
@media (max-width:1099px){
  .kl-steps-5,.kl-steps-6{grid-template-columns:1fr 1fr;row-gap:36px;}
  .kl-next{grid-template-columns:1fr 1fr;} .kl-paths,.kl-calc{grid-template-columns:1fr 1fr;} .kl-fx{grid-template-columns:1fr 1fr;}
  .kl-geo,.kl-quiz{grid-template-columns:1fr;gap:24px;}
}
@media (max-width:699px){
  .kl-steps-5,.kl-steps-6{grid-template-columns:1fr;}
  .kl-next,.kl-paths,.kl-calc,.kl-fx{grid-template-columns:1fr;}
  .kl-n{min-height:0;} .kl-faq summary{font-size:17px;padding:20px 0;} .kl-geo-n{font-size:72px;}
  .kl-q,.kl-res{padding:24px 20px;}
}
</style>
'''

# ---------- общий скрипт: слайды, лайтбокс, плавающая кнопка, формы, квиз ----------
JS = '''<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Просмотр"><div id="lbBody"></div><button type="button" class="lb-ar" data-d="-1" aria-label="Назад">‹</button><button type="button" class="lb-ar" data-d="1" aria-label="Вперёд">›</button><button type="button" class="lb-x" aria-label="Закрыть">✕</button><div class="lb-cap"></div></div>
<script>
(function(){
  /* первый экран: смена кадров */
  var sl=[].slice.call(document.querySelectorAll('.sz-sl img')),dots=[].slice.call(document.querySelectorAll('.sz-dots i')),hi=0;
  function hero(n){sl[hi].classList.remove('on');dots[hi].classList.remove('on');hi=n%sl.length;void dots[hi].offsetWidth;sl[hi].classList.add('on');dots[hi].classList.add('on');}
  if(sl.length>1)setInterval(function(){if(!document.hidden)hero(hi+1);},6000);
  /* лайтбокс для фото */
  var lb=document.getElementById('lb'),body=document.getElementById('lbBody'),cap=lb.querySelector('.lb-cap'),arw=lb.querySelectorAll('.lb-ar'),G=[],gi=0,gt='';
  function show(){body.innerHTML='<img src="'+G[gi]+'" alt="">';cap.innerHTML='<b>'+gt+'</b>'+(G.length>1?(gi+1)+' / '+G.length:'');
    arw[0].disabled=gi<=0;arw[1].disabled=gi>=G.length-1;lb.classList.toggle('one',G.length<2);}
  function open(list,i,t){G=list;gi=i;gt=t;show();lb.classList.add('on');document.documentElement.style.overflow='hidden';}
  function go(d){var n=gi+d;if(n<0||n>=G.length)return;gi=n;show();}
  function close(){lb.classList.remove('on');body.innerHTML='';document.documentElement.style.overflow='';}
  [].forEach.call(arw,function(b){b.addEventListener('click',function(e){e.stopPropagation();go(+b.getAttribute('data-d'));});});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target===body||e.target.closest('.lb-x'))close();});
  addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')go(-1);else if(e.key==='ArrowRight')go(1);});
  document.addEventListener('click',function(e){var b=e.target.closest('[data-gal]');if(!b)return;open(JSON.parse(b.getAttribute('data-gal')),+b.getAttribute('data-i')||0,b.getAttribute('data-t'));});
  /* плавающая кнопка: после первого экрана, прячется у формы и подвала */
  var fab=document.getElementById('szFab'),top=document.getElementById('top'),frm=document.querySelector('.kl-box'),foot=document.querySelector('footer');
  function fabTick(){if(!fab)return;var h=top.getBoundingClientRect().bottom<0,v=frm.getBoundingClientRect(),f=foot&&foot.getBoundingClientRect().top<innerHeight;
    fab.classList.toggle('on',h&&!(v.top<innerHeight&&v.bottom>0)&&!f);}
  addEventListener('scroll',fabTick,{passive:true});fabTick();
  /* кнопки, которые заполняют форму (data-fill="поле=значение") */
  document.addEventListener('click',function(e){var b=e.target.closest('[data-fill]');if(!b)return;var f=document.querySelector('.kl-box .tf');
    b.getAttribute('data-fill').split('&').forEach(function(p){var kv=p.split('='),els=f.querySelectorAll('[name="'+kv[0]+'"]');
      [].forEach.call(els,function(el){if(el.type==='radio'||el.type==='checkbox'){if(el.value===kv[1])el.checked=true;}else if(!el.value)el.value=kv[1];});});});
  /* формы: заявка уходит на /api/lead (service-api → Telegram менеджерам), если сервер недоступен — письмом на info@ */
  [].forEach.call(document.querySelectorAll('form.tf[data-kind]'),function(f){
    var box=f.parentNode;
    f.addEventListener('submit',function(e){e.preventDefault();
      var ok=true;['name','phone'].forEach(function(n){var el=f.elements[n],v=(el.value||'').trim(),bad=!v||(n==='phone'&&v.replace(/\\D/g,'').length<10);el.classList.toggle('inv',bad);if(bad)ok=false;});
      if(!f.elements.consent.checked)ok=false;f.classList.toggle('bad',!ok);if(!ok)return;
      var d=new FormData(f),t={kind:f.getAttribute('data-kind'),page:location.pathname},lines=[];
      d.forEach(function(v,k){if(k==='consent'||!String(v).trim())return;t[k]=t[k]?t[k]+', '+v:v;});
      [].forEach.call(f.querySelectorAll('[name]'),function(el){var k=el.name;if(k==='consent'||lines.some(function(l){return l.k===k;}))return;
        var lab=el.closest('label,fieldset'),cap=lab&&lab.querySelector('.flb');if(t[k])lines.push({k:k,s:(cap?cap.textContent.replace('*','').trim():k)+': '+t[k]});});
      var btn=f.querySelector('button[type=submit]');btn.disabled=true;
      function mail(){location.href='mailto:info@ds-proaudio.ru?subject='+encodeURIComponent(t.kind+': '+t.name)+'&body='+encodeURIComponent(['Заявка: '+t.kind,''].concat(lines.map(function(l){return l.s;})).join('\\n'));box.classList.add('sent');}
      fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)}).then(function(r){if(!r.ok)throw 0;box.classList.add('sent');}).catch(mail).then(function(){btn.disabled=false;});
    });
  });
  /* квиз «ориентир по системе» (страница цен) */
  var qz=document.getElementById('klQuiz');
  if(qz){var res=document.getElementById('klRes'),
    S={TAURA:'series-taura.html',ERA:'series-era.html','ERA-i':'series-era-i.html',PILLAR:'series-pillar.html',CX:'series-cx.html',ANT:'series-ant.html',MCX:'series-mcx.html',STELLA:'series-stella.html',AUDITORIUM:'series-auditorium.html'};
    function pick(){var v=function(n){var el=qz.querySelector('input[name='+n+']:checked');return el?el.value:'';},o=v('obj'),c=v('cap'),u=v('use'),s,txt;
      if(u==='Концерты и фестивали'||c==='Больше 1500'){s=['TAURA','ERA','MCX'];txt='Для концертного звука на большую аудиторию — линейный массив TAURA или массивы постоянной кривизны ERA, со сценическими мониторами MCX.';}
      else if(o==='Ресторан или отель'||o==='Офис или переговорная'){s=c==='До 100'?['CX','ANT','PILLAR']:['PILLAR','CX','STELLA'];txt='Для фоновой музыки и речи в зале с интерьером — компактные коаксиальные источники CX и звуковые колонны PILLAR, которые не спорят с дизайном.';}
      else if(o==='Храм'){s=['PILLAR','ERA-i'];txt='В храме с длинной реверберацией важна разборчивость речи — звуковые колонны PILLAR и управляемые массивы ERA-i.';}
      else if(o==='Учебная аудитория'){s=['AUDITORIUM','CX','PILLAR'];txt='Для аудиторий и лекционных залов — системы AUDITORIUM и компактные CX: ровная разборчивость речи в каждом ряду.';}
      else if(o==='Спортивный объект'||o==='Открытая площадка'){s=['ERA','ERA-i','TAURA'];txt='Для спортивных объектов и улицы — массивы ERA и ERA-i во всепогодном исполнении, для больших арен — TAURA.';}
      else if(c==='До 100'){s=['CX','ANT'];txt='Для небольшого зала хватит компактного комплекта: коаксиальные CX или комплекты ANT.';}
      else{s=['ERA','ERA-i','PILLAR'];txt='Для зала ДК, театра или актового зала — массивы постоянной кривизны ERA и ERA-i: ровное покрытие от первого ряда до балкона.';}
      res.querySelector('p').textContent=txt;
      res.querySelector('.kl-ser').innerHTML=s.map(function(x){return '<a href="./'+S[x]+'">'+x+'</a>';}).join('');
      var b=res.querySelector('.pr-btn');b.setAttribute('data-fill','obj='+o+'&cap='+c+'&comment=Тип объекта: '+o+', зрителей: '+c+', задача: '+u+'. Ориентир по сериям: '+s.join(', '));}
    qz.addEventListener('change',pick);pick();}
})();
</script>'''

def fab(href, text):
    return f'<a href="#{href}" class="sz-fab" id="szFab"><i></i>{text}</a>'

# ---------- страницы ----------
PAGES = {}

# 1. Выездная демонстрация
PAGES['demo.html'] = dict(
    menu='Запросить выездную демонстрацию', crumb='Выездная демонстрация',
    title='Выездная демонстрация TAURA — DS PROAUDIO',
    desc='Привезём линейный массив TAURA из демофонда DS PROAUDIO на вашу площадку: соберём, настроим и включим. Услышьте систему в своём зале до покупки.',
    main=[
        hero('Выездная демонстрация', 'Демофонд DS PROAUDIO · выезд на площадку', 'Услышьте TAURA в своём зале',
             'Привезём комплект линейного массива TAURA из демофонда, соберём, настроим и включим на вашей площадке. Вы слышите систему в той акустике, где она будет работать, — вместе со всеми, кто принимает решение.',
             ['segments/rental-hero-bessonnitsa.jpg', 'showroom/ph/20260819_131043.jpg', 'production/pack-2.jpg', 'showroom/ph/20260819_131108.jpg'],
             [('TAURA', 'линейный массив и кардиоидный сабвуфер C‑Sub 18'), ('1 день', 'монтаж, настройка и прослушивание на площадке')],
             ('request', 'Запросить демонстрацию'), ('how', 'Как это проходит'), 'Выезд по договорённости · инженеры DS PROAUDIO настраивают систему сами'),
        sec('lt', 'why', 'Почему стоит пригласить нас', 'Каталог не передаст звук вашего зала',
            'Один и тот же массив звучит по-разному в театре, во дворце спорта и под открытым небом. Демонстрация на месте снимает главный вопрос: подходит ли система именно вам.',
            cards([('portfolio/pf-005/cover.jpg', 'Акустика вашего зала', 'Слышно, как система работает с вашими стенами, балконом и задними рядами. Никаких допущений «в хорошей комнате звучит иначе».'),
                   ('portfolio/pf-020/cover.jpg', 'Решение принимают все сразу', 'Директор, звукорежиссёр и инженер слушают одновременно и обсуждают одно и то же, а не пересказ из переписки.'),
                   ('production/eng-3.jpg', 'Сравнение с тем, что у вас есть', 'Можно включить TAURA рядом с текущей системой и услышать разницу на своём материале и на своей программе.')])),
        sec('dk', 'how', 'Как это проходит', 'От заявки до звука — пять шагов',
            'Мы заранее узнаём о площадке, чтобы приехать с готовой конфигурацией, а не настраиваться с нуля.',
            steps([('Заявка', 'Оставляете заявку или звоните. Обсуждаем площадку, задачу и удобные даты.'),
                   ('Данные о площадке', 'Присылаете план или размеры зала и фото. Уточняем питание и точки подвеса.'),
                   ('Расчёт', 'Инженер подбирает конфигурацию массива и проверяет покрытие на акустической модели.'),
                   ('Монтаж и настройка', 'Привозим комплект, собираем, подвешиваем или ставим на сцену и настраиваем.'),
                   ('Прослушивание', 'Включаете свой материал, ходите по залу, задаёте вопросы инженерам.')])
            + bring('Кому выездная демонстрация особенно полезна', [
                ('Дома культуры и театры', 'Перед модернизацией звука: услышать новую систему в своём зале до закупки.'),
                ('Прокатные компании', 'Проверить TAURA в работе на реальной площадке перед покупкой парка.'),
                ('Интеграторы и проектировщики', 'Показать решение заказчику там, где оно будет стоять.')])),
        sec('lt', 'proof', 'Что говорят о TAURA', 'Звукорежиссёры уже проверили систему в деле', '',
            quotes(['Вадим Ковалевский', 'Сергей Пьянов', 'Дмитрий Казанцев'])),
        sec('dk', 'faq', 'Частые вопросы', 'Что важно знать заранее', '',
            faq([('Сколько стоит выездная демонстрация?', 'Условия зависят от города, площадки и задачи. Мы назовём их сразу после разговора о проекте, до выезда.'),
                 ('Какие системы вы привозите?', 'В демофонде — комплект линейного массива TAURA. Остальные серии (ERA, CX, ANT, PILLAR, MCX) можно послушать в <a href="./showroom.html">шоуруме в Москве</a>.'),
                 ('Что нужно от площадки?', 'Электропитание у сцены, место для системы (подвес или установка на сцене) и время на монтаж. Всё уточним заранее по плану зала.'),
                 ('Можно ли устроить демонстрацию на нашем мероприятии?', 'Да, если позволяют сроки и техническая площадка. Напишите дату и формат мероприятия в заявке.'),
                 ('Нужно ли что-то считать заранее?', 'Нет, расчёт делаем мы. Если у вас уже есть проект или техническое задание — пришлите, учтём.')], dark=True)),
        form('request', 'Выездная демонстрация', 'Заявка на выезд', 'Пригласите TAURA на свою площадку',
             'Оставьте заявку — перезвоним в рабочее время, уточним площадку и даты.',
             ['Комплект линейного массива TAURA из демофонда', 'Монтаж и настройка инженерами DS PROAUDIO', 'Прослушивание на вашем материале', 'Разговор о проекте на месте'],
             F_NAME + F_PHONE + F_ORG + F_CITY +
             '<fieldset class="full"><span class="flb">Площадка</span>' + seg('venue', ['Дом культуры или театр', 'Концертный зал', 'Спортивный объект', 'Открытая площадка', 'Другое']) + '</fieldset>'
             '<label><span class="flb">Вместимость</span><input type="text" name="cap" placeholder="например, 800 мест"></label>'
             '<label><span class="flb">Удобные даты</span><input type="text" name="dates" placeholder="например, 10–14 ноября"></label>'
             '<label class="full"><span class="flb">О площадке и задаче</span><textarea name="comment" placeholder="Например: ДК на 600 мест с балконом, планируем модернизацию звука"></textarea></label>',
             'Запросить демонстрацию', 'Заявка отправлена', 'Мы перезвоним, чтобы обсудить площадку, даты и конфигурацию системы.',
             card=[('Телефон', f'<a href="tel:{TEL}">{TEL_H}</a>'), ('E-mail', '<a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a>'), ('Часы', 'Пн–Пт, 10:00–19:00')]),
        next_block('demo.html'),
        fab('request', 'Запросить демонстрацию'),
    ])

# 2. Консультация по объекту
CALC = [('portfolio/pf-005/calc-01.jpg', 'ДК им. С. М. Кирова, Пермь', 'Карта уровня звука по залу и балкону, ERA и мониторы.'),
        ('portfolio/pf-001/calc-01.jpg', 'РАНХиГС, Москва', 'Покрытие амфитеатра и боковых зон, ERA, TAURA и CX.'),
        ('portfolio/pf-008/calc-01.jpg', 'Зал для мероприятий', 'Распределение звука по зрительным местам, ERA и мониторы.')]
calc_html = '<div class="kl-calc">' + ''.join(
    f'<figure class="reveal"><button type="button" data-gal=\'["./assets/{p}"]\' data-i="0" data-t="{E(t)}"><img src="./assets/{p}" alt="Акустический расчёт: {E(t)}" loading="lazy"></button><figcaption><b>{t}</b>{d}</figcaption></figure>'
    for p, t, d in CALC) + '</div>'
SEGS = [('culture.html', 'Культура и искусство', 40), ('education.html', 'Образование и наука', 51), ('sport.html', 'Спорт', 8),
        ('corporate.html', 'Корпоративный сектор', 22), ('hospitality.html', 'Рестораны и отели', 9), ('religious.html', 'Храмы', 3),
        ('entertainment.html', 'Развлечения', 2), ('rental.html', 'Прокат', None)]
seg_html = '<div class="kl-seg">' + ''.join(f'<a href="./{h}">{t}' + (f'<span>{n} объектов</span>' if n else '') + '</a>' for h, t, n in SEGS) + '</div>'
PAGES['consultation.html'] = dict(
    menu='Запросить консультацию по объекту', crumb='Консультация по объекту',
    title='Консультация по объекту и акустический расчёт — DS PROAUDIO',
    desc='Инженеры DS PROAUDIO подберут систему под ваш объект и покажут на акустической модели EASE, как она будет звучать в каждом ряду. Документы для проекта и госзакупки.',
    main=[
        hero('Консультация по объекту', 'Инженерная поддержка DS PROAUDIO', 'Услышьте свой зал до покупки',
             'Инженеры подберут систему под вашу задачу и покажут на акустической модели, как она будет звучать в каждом ряду. Вы получаете расчёт, спецификацию и файлы для проекта — ещё до того, как что-то купили.',
             ['portfolio/pf-005/hero-wide.jpg', 'portfolio/pf-001/cover.jpg', 'production/eng-2.jpg', 'portfolio/pf-015/cover.jpg'],
             [('141', 'объект в портфолио: от школ до стадионов'), ('ГИСП', 'реестровое оборудование для госзакупок')],
             ('request', 'Запросить консультацию'), ('get', 'Что вы получите'), 'Подбор системы и расчёт по вашему объекту · инженеры, а не менеджеры по скрипту'),
        sec('lt', 'get', 'Что вы получите', 'Не каталог, а решение для вашего объекта',
            'Мы проектируем и производим акустику сами, поэтому знаем, как каждая модель поведёт себя в конкретном помещении.',
            cards([('production/eng-1.jpg', 'Подбор системы', 'Инженер подберёт серию и количество, учтёт назначение зала, вместимость, бюджет и требования к монтажу.'),
                   ('portfolio/pf-001/calc-02.jpg', 'Акустический расчёт', 'Покажем на модели в EASE, как распределяется звук по залу: где громко, где тихо и как это исправить.'),
                   ('production/eng-2.jpg', 'Документы для проекта', 'Спецификация, чертежи DWG, файлы GLL и документы ГИСП для закупки — всё, что нужно проектировщику.', ('./docs.html', 'Центр документации'))])),
        sec('dk', 'calc', 'Так выглядит расчёт', 'Каждый ряд — на карте до монтажа',
            'Реальные расчёты по объектам из нашего портфолио. Цвет показывает уровень звука: ровный цвет по залу означает, что в каждом ряду слышно одинаково хорошо.',
            calc_html),
        sec('lt', 'how', 'Как проходит консультация', 'Пять шагов от задачи до проекта', '',
            steps([('Расскажите об объекте', 'Тип зала, вместимость, задача: речь, музыка, концерты. Можно по телефону.'),
                   ('Пришлите данные', 'План или размеры помещения, фото, если есть — проект или ТЗ.'),
                   ('Подбор вариантов', 'Инженер предлагает одно-два решения и объясняет разницу.'),
                   ('Расчёт и спецификация', 'Акустическая модель, список оборудования и документы.'),
                   ('Прослушивание', 'Слушаете выбранную систему в шоуруме или на своей площадке.')])
            + bring('Что подготовить, чтобы консультация была быстрой', [
                ('План и размеры', 'Чертёж, план эвакуации или просто длина, ширина и высота зала.'),
                ('Назначение и вместимость', 'Что будет звучать: речь, фоновая музыка, концерты. Сколько зрителей.'),
                ('Сроки и порядок закупки', 'Когда нужна система и будет ли закупка по 44-ФЗ или 223-ФЗ.')])
            + '<div class="pr-kick" style="color:#8A8A8A;margin-top:72px;">Направления</div><h2 class="pr-h2">Знаем ваши задачи по опыту</h2>' + seg_html),
        sec('dk', 'proof', 'Результат на объектах', 'Как звучат залы после расчёта', '',
            quotes(['Александр Антонов', 'Иван Тищенко', 'Владимир Касымов'])),
        sec('lt', 'faq', 'Частые вопросы', 'Что важно знать заранее', '',
            faq([('Консультация платная?', 'Первичная консультация и подбор системы на оборудовании DS PROAUDIO — бесплатно. Объём расчётов для крупных объектов обсуждаем отдельно.'),
                 ('Нужен ли готовый проект?', 'Нет. Достаточно размеров помещения и понимания задачи. Если проект уже есть — проверим и предложим систему под него.'),
                 ('Вы помогаете с госзакупкой?', 'Да. Оборудование DS PROAUDIO внесено в реестр российской промышленной продукции (ГИСП). Подготовим документы для обоснования закупки. Подробнее — в разделе <a href="./gov.html">Госучреждениям</a>.'),
                 ('Где взять файлы GLL и чертежи?', 'Все файлы по моделям лежат в <a href="./docs.html">Центре документации</a>: EASE GLL, DWG, инструкции и пресеты DSP.'),
                 ('Кто будет монтировать систему?', 'Наши партнёры-интеграторы в вашем регионе или ваш подрядчик. Мы поможем на всех этапах. Подробнее — на странице <a href="./where-to-buy.html">Где купить</a>.')])),
        form('request', 'Консультация по объекту', 'Заявка на консультацию', 'Расскажите о вашем объекте',
             'Перезвоним в рабочее время, уточним задачу и скажем, какие данные нужны для расчёта. Планы и фото можно потом прислать на info@ds-proaudio.ru.',
             ['Подбор системы под задачу и бюджет', 'Акустический расчёт по залу', 'Спецификация и файлы для проекта', 'Документы ГИСП для госзакупки'],
             F_NAME + F_PHONE + F_ORG + F_MAIL +
             '<fieldset class="full"><span class="flb">Тип объекта</span>' + seg('obj', ['Дом культуры или театр', 'Школа или вуз', 'Спортивный объект', 'Офис или конференц-зал', 'Ресторан или отель', 'Храм', 'Другое']) + '</fieldset>'
             '<fieldset class="full"><span class="flb">Стадия</span>' + seg('stage', ['Идея, собираем варианты', 'Есть проект или ТЗ', 'Готовим закупку', 'Модернизация']) + '</fieldset>'
             + F_CITY + '<label><span class="flb">Вместимость или площадь</span><input type="text" name="cap" placeholder="например, 400 мест"></label>'
             '<label class="full"><span class="flb">Задача</span><textarea name="comment" placeholder="Например: актовый зал школы на 400 мест, речь и концерты, закупка по 44-ФЗ"></textarea></label>',
             'Запросить консультацию', 'Заявка отправлена', 'Инженер перезвонит, уточнит задачу и скажет, какие данные нужны для расчёта.',
             card=[('Телефон', f'<a href="tel:{TEL}">{TEL_H}</a>'), ('E-mail', '<a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a>'), ('Часы', 'Пн–Пт, 10:00–19:00')]),
        next_block('consultation.html'),
        fab('request', 'Запросить консультацию'),
    ])

# 3. Узнать цены
QUIZ = f'''<div class="kl-quiz" id="klQuiz">
      <div class="kl-q reveal">
        <fieldset><legend>Объект</legend>{seg('obj', ['Дом культуры или театр', 'Учебная аудитория', 'Спортивный объект', 'Открытая площадка', 'Ресторан или отель', 'Офис или переговорная', 'Храм'])}</fieldset>
        <fieldset><legend>Сколько зрителей</legend>{seg('cap', ['До 100', '100–500', '500–1500', 'Больше 1500'])}</fieldset>
        <fieldset style="margin-bottom:0;"><legend>Задача</legend>{seg('use', ['Речь и презентации', 'Фоновая музыка', 'Спектакли и концерты в зале', 'Концерты и фестивали'])}</fieldset>
      </div>
      <div class="kl-res reveal" id="klRes"><b>Ориентир по системе</b><h3>Вам подойдут серии</h3><div class="kl-ser"></div><p></p>
        <a href="#request" class="pr-btn" data-fill="">Запросить цену на этот вариант →</a><small>Это ориентир, а не расчёт. Точную конфигурацию подберёт инженер по плану зала.</small></div>
    </div>'''
PAGES['prices.html'] = dict(
    menu='Узнать цены', crumb='Узнать цены',
    title='Цены на акустику DS PROAUDIO — коммерческое предложение от производителя',
    desc='Цена напрямую от российского производителя акустики DS PROAUDIO: без посредников и импортной наценки. Пришлём коммерческое предложение по списку моделей или подберём систему под бюджет.',
    main=[
        hero('Узнать цены', 'Цена производителя · без посредников', 'Цена от производителя, без импортной наценки',
             'Мы производим акустику сами — от звуковых катушек до корпусов. Поэтому цена складывается из производства, а не из цепочки посредников и валютных рисков. Пришлём коммерческое предложение по вашему списку или подберём систему под бюджет.',
             ['production/film-tour.jpg', 'production/susp-3.jpg', 'production/eng-3.jpg', 'production/pack-3.jpg'],
             [('3 года', 'гарантии на акустику и электронику'), ('Склад', 'в Москве: основные позиции в наличии')],
             ('request', 'Запросить коммерческое предложение'), ('quiz', 'Подобрать вариант'), 'Коммерческое предложение по запросу · Пн–Пт, 10:00–19:00'),
        sec('dk', 'ways', 'Три способа узнать цену', 'Выберите, что вам ближе', '',
            '<div class="kl-paths">'
            '<div class="kl-path reveal"><b>01</b><h3>Есть список моделей</h3><p>Пришлите список — подготовим коммерческое предложение со стоимостью, наличием на складе и сроком отгрузки.</p><a href="#request" class="pr-btn" data-fill="way=Есть список моделей">Отправить список →</a></div>'
            '<div class="kl-path reveal"><b>02</b><h3>Есть задача, нет списка</h3><p>Расскажите об объекте — инженер подберёт систему под задачу и бюджет и пришлёт предложение с расчётом.</p><a href="#quiz" class="pr-btn">Подобрать вариант →</a></div>'
            '<div class="kl-path reveal"><b>03</b><h3>Закупка по 44-ФЗ / 223-ФЗ</h3><p>Оборудование в реестре ГИСП. Дадим коммерческое предложение для обоснования цены и документы для ТЗ.</p><a href="#request" class="pr-btn" data-fill="way=Госзакупка">Запросить КП для закупки →</a></div>'
            '</div>'),
        sec('lt', 'quiz', 'Быстрый ориентир', 'Какая система подойдёт вашему объекту',
            'Три вопроса — и вы увидите, с каких серий стоит начать. Цену на выбранный вариант можно запросить одной кнопкой.', QUIZ),
        sec('lt', 'price', 'Из чего складывается цена', 'Честно о том, что влияет на стоимость',
            'Цены на сайте мы не публикуем, потому что две одинаковые на вид системы могут отличаться комплектацией в разы. Вот что учитываем в предложении.',
            '<div class="kl-fx">' + ''.join(f'<div class="reveal"><b>{i+1:02d}</b><h3>{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate([
                ('Модели и количество', 'Сколько громкоговорителей и сабвуферов нужно, чтобы озвучить ваш зал ровно, без перебора.'),
                ('Исполнение', 'Цвет корпуса, влагозащита для улицы и бассейнов, исполнение для подвеса или установки на сцене.'),
                ('Усиление и обработка', 'Активные или пассивные системы, усилители DA, процессоры и пресеты DSP.'),
                ('Риггинг и аксессуары', 'Подвесные рамы, кронштейны, стойки, кейсы и чехлы для прокатных комплектов.'),
                ('Монтаж и настройка', 'Делаете сами или через нашего партнёра-интегратора в вашем регионе.'),
                ('Доставка', 'Отгрузка со склада в Москве и доставка до объекта.')])) + '</div>'),
        sec('dk', 'why', 'Почему это выгодно', 'Платите за звук, а не за логистику и посредников', '',
            '<div class="kl-paths">'
            '<div class="kl-path reveal"><b>Производство</b><h3>Полный цикл в России</h3><p>Корпуса, динамики, ВЧ-драйверы и катушки делаем сами. Цена не зависит от курса и импортных поставок.</p><a href="./production.html" class="pr-btn gh">Наше производство →</a></div>'
            '<div class="kl-path reveal"><b>Склад</b><h3>Основное — в наличии</h3><p>Основной ассортимент на складе в Москве, отгрузка за несколько дней. Нестандартные заказы — до двух месяцев.</p><a href="./delivery.html" class="pr-btn gh">Срок поставки →</a></div>'
            '<div class="kl-path reveal"><b>Гарантия</b><h3>3 года и сервис рядом</h3><p>Гарантия на всё оборудование, запчасти на складе, сервис в Москве и Санкт-Петербурге.</p><a href="./warranty.html" class="pr-btn gh">Гарантия и сервис →</a></div>'
            '</div>' + '<div style="margin-top:72px;">' + quotes(['Дмитрий Абрамов', 'Александр Антонов', 'Вячеслав Величковский'], title_more=False) + '</div>'),
        sec('lt', 'faq', 'Частые вопросы', 'Что спрашивают о цене', '',
            faq([('Почему нет прайс-листа на сайте?', 'Стоимость сильно зависит от комплектации: исполнения, усилителей, риггинга и аксессуаров. Чтобы не вводить в заблуждение, присылаем точное предложение под ваш состав.'),
                 ('Как быстро пришлёте предложение?', 'По готовому списку моделей — обычно в течение рабочего дня. Если нужен подбор и расчёт, сначала созвонимся и уточним задачу.'),
                 ('Есть ли условия для интеграторов и прокатных компаний?', 'Да, для партнёров действуют отдельные условия. Подробнее — на странице <a href="./where-to-buy.html#partner">Где купить</a>.'),
                 ('Подходит ли оборудование для госзакупок?', 'Да, оборудование внесено в реестр российской промышленной продукции (ГИСП). Дадим коммерческое предложение для обоснования начальной цены.'),
                 ('Можно ли сначала послушать?', 'Да. Приезжайте в <a href="./showroom.html">шоурум</a> или запросите <a href="./demo.html">выездную демонстрацию</a> TAURA.')])),
        form('request', 'Запрос цены', 'Коммерческое предложение', 'Запросите цену',
             'Пришлите список моделей или опишите задачу. Перезвоним в рабочее время и пришлём предложение.',
             ['Стоимость и наличие на складе', 'Срок отгрузки', 'Варианты под бюджет', 'Документы для госзакупки — по запросу'],
             F_NAME + F_PHONE + F_ORG + F_MAIL +
             '<fieldset class="full"><span class="flb">Что у вас есть</span>' + seg('way', ['Есть список моделей', 'Есть задача, нужен подбор', 'Госзакупка']) + '</fieldset>'
             '<fieldset class="full"><span class="flb">Кто вы</span>' + seg('role', ['Заказчик', 'Интегратор или проектировщик', 'Прокатная компания', 'Госучреждение']) + '</fieldset>'
             '<input type="hidden" name="obj"><input type="hidden" name="cap">'
             '<label class="full"><span class="flb">Список моделей или задача</span><textarea name="comment" placeholder="Например: TAURA 8 — 12 шт., TAURA C-Sub 18 — 4 шт. Или: зал ДК на 600 мест, нужен звук для концертов"></textarea></label>',
             'Запросить цену', 'Запрос отправлен', 'Мы перезвоним, уточним состав и пришлём коммерческое предложение.',
             card=[('Телефон', f'<a href="tel:{TEL}">{TEL_H}</a>'), ('E-mail', '<a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a>'), ('Часы', 'Пн–Пт, 10:00–19:00')]),
        next_block('prices.html'),
        fab('request', 'Запросить цену'),
    ])

# 4. Где купить
SKIP = {'Грузия', 'ЛНР'}
from collections import Counter
cc = Counter(o['city'] for o in PF if o.get('city') and o['city'] not in SKIP)
ncity = len(cc)
cities = '<div class="kl-cities">' + ''.join(f'<span>{E(c)}' + (f'<b>{n}</b>' if n > 1 else '') + '</span>' for c, n in sorted(cc.items(), key=lambda x: (-x[1], x[0]))) + '</div>'
PAGES['where-to-buy.html'] = dict(
    menu='Где купить', crumb='Где купить',
    title='Где купить акустику DS PROAUDIO — у производителя или у партнёра',
    desc='Купите акустику DS PROAUDIO напрямую у производителя в Москве или через партнёров-интеграторов в регионах. Склад в Москве, гарантия 3 года, партнёрская программа для интеграторов и прокатчиков.',
    main=[
        hero('Где купить', 'DS PROAUDIO · производитель', 'Купить у производителя или у партнёра рядом с вами',
             'Оборудование DS PROAUDIO можно купить напрямую у нас в Москве или через партнёров — интеграторов и прокатные компании, которые проектируют, монтируют и обслуживают системы в регионах. В любом случае гарантия и сервис — от производителя.',
             ['production/pack-3.jpg', 'production/pack-2.jpg', 'portfolio/pf-004/cover.jpg', 'production/pack-4.jpg'],
             [(str(ncity), 'городов и посёлков, где уже работают наши системы'), ('3 года', 'гарантии от производителя')],
             ('request', 'Подобрать, где купить'), ('ways', 'Способы покупки'), 'Москва · склад и шоурум · партнёры в регионах'),
        sec('dk', 'ways', 'Способы покупки', 'Выберите удобный путь', '',
            '<div class="kl-paths">'
            '<div class="kl-path reveal"><b>01</b><h3>Напрямую у производителя</h3><ul><li>Цена производителя и наличие на складе</li><li>Подбор системы и расчёт инженерами</li><li>Прослушивание в шоуруме в Москве</li></ul><a href="#request" class="pr-btn" data-fill="way=Напрямую у производителя">Купить напрямую →</a></div>'
            '<div class="kl-path reveal"><b>02</b><h3>Через партнёра в регионе</h3><ul><li>Проект, монтаж и настройка под ключ</li><li>Обслуживание рядом с объектом</li><li>Гарантия и запчасти — от производителя</li></ul><a href="#request" class="pr-btn" data-fill="way=Через партнёра в регионе">Найти партнёра →</a></div>'
            '<div class="kl-path reveal"><b>03</b><h3>По госзакупке</h3><ul><li>Оборудование в реестре ГИСП</li><li>Документы для ТЗ и обоснования цены</li><li>Файлы для проектировщика</li></ul><a href="./gov.html" class="pr-btn">Госучреждениям →</a></div>'
            '</div>'),
        sec('lt', 'how', 'Как проходит покупка', 'От заявки до работающей системы', '',
            steps([('Заявка', 'Звоните или оставляете заявку. Уточняем задачу и город.'),
                   ('Подбор и предложение', 'Подбираем систему, присылаем коммерческое предложение.'),
                   ('Договор', 'Заключаем договор напрямую или через партнёра.'),
                   ('Отгрузка', 'Отгружаем со склада в Москве. Основные позиции — за несколько дней.'),
                   ('Монтаж и настройка', 'Сами, силами партнёра или вашего подрядчика — поможем на месте.'),
                   ('Гарантия и сервис', '3 года гарантии, сервис в Москве и Санкт-Петербурге.')])),
        sec('dk', 'geo', 'География', 'Наши системы уже работают по всей стране', '',
            f'<div class="kl-geo"><div class="reveal"><div class="kl-geo-n">{ncity}</div><p>городов и посёлков — от Калининграда до Камчатки и Сахалина. Цифрами отмечено, сколько объектов в городе.</p><div class="pr-ctas" style="margin-top:24px;"><a href="./portfolio.html" class="pr-btn gh">Смотреть портфолио →</a></div></div><div class="reveal">{cities}</div></div>'),
        sec('lt', 'partner', 'Партнёрам', 'Станьте партнёром DS PROAUDIO',
            'Мы работаем с интеграторами, проектировщиками и прокатными компаниями по всей России и признаём заслуги партнёров в проектах. Всегда.',
            cards([('production/susp-3.jpg', 'Стабильные цены и склад', 'Разумная ценовая политика, основные позиции на складе, оперативное производство недостающих позиций под проект.'),
                   ('showroom/ph/20260819_124844.jpg', 'Обучение и поддержка', 'Семинары в шоуруме, документация и помощь инженеров на всех этапах работы по объекту.', ('./showroom.html', 'Шоурум')),
                   ('portfolio/pf-001/cover.jpg', 'Объекты в портфолио', 'Реализованные объекты партнёров попадают в портфолио DS PROAUDIO — это работает на вашу репутацию.', ('./portfolio.html', 'Портфолио'))])
            + '<div class="pr-ctas" style="margin-top:36px;"><a href="#request" class="pr-btn kl-solid" data-fill="way=Стать партнёром">Стать партнёром →</a></div>'),
        sec('dk', 'proof', 'Отзывы', 'Что говорят о нас профессионалы', '',
            quotes(['Юрий Астафьев', 'Роман Скрипник', 'Евгений Ефремов'])),
        sec('lt', 'faq', 'Частые вопросы', 'Что важно знать о покупке', '',
            faq([('Как проверить, что продавец — ваш партнёр?', f'Позвоните нам по номеру <a href="tel:{TEL}">{TEL_H}</a> — подтвердим, работает ли компания с DS PROAUDIO.'),
                 ('Доставляете в регионы?', 'Да. Отгружаем со склада в Москве и организуем доставку до объекта. Срок и стоимость доставки укажем в коммерческом предложении.'),
                 ('Гарантия при покупке у партнёра такая же?', 'Да, гарантия 3 года даёт производитель, где бы вы ни купили оборудование. Подробнее — <a href="./warranty.html">Гарантия и сервис</a>.'),
                 ('Можно ли послушать перед покупкой?', 'Да: в <a href="./showroom.html">шоуруме</a> в Москве или на вашей площадке — <a href="./demo.html">выездная демонстрация</a> TAURA.'),
                 ('Сколько ждать поставку?', 'Основной ассортимент на складе — отгрузка за несколько дней. Подробнее — <a href="./delivery.html">Срок поставки</a>.')])),
        form('request', 'Где купить', 'Заявка', 'Подскажем, где купить в вашем городе',
             'Назовите город и задачу — предложим купить напрямую или порекомендуем партнёра рядом с вами.',
             ['Цена производителя', 'Партнёр для монтажа в вашем регионе', 'Гарантия 3 года', 'Партнёрская программа для интеграторов и прокатчиков'],
             F_NAME + F_PHONE + F_ORG +
             '<label><span class="flb">Город <em>*</em></span><input type="text" name="city" autocomplete="address-level2"></label>'
             '<fieldset class="full"><span class="flb">Что нужно</span>' + seg('way', ['Напрямую у производителя', 'Через партнёра в регионе', 'Стать партнёром']) + '</fieldset>'
             '<label class="full"><span class="flb">Задача</span><textarea name="comment" placeholder="Например: Екатеринбург, концертный зал на 1000 мест, нужен монтаж под ключ"></textarea></label>',
             'Отправить заявку', 'Заявка отправлена', 'Мы перезвоним и подскажем лучший способ покупки в вашем городе.',
             card=[('Шоурум', 'Москва, 2-й Донской проезд, 4'), ('Телефон', f'<a href="tel:{TEL}">{TEL_H}</a>'), ('E-mail', '<a href="mailto:info@ds-proaudio.ru">info@ds-proaudio.ru</a>'), ('Часы', 'Пн–Пт, 10:00–19:00')]),
        next_block('where-to-buy.html'),
        fab('request', 'Подобрать, где купить'),
    ])

# ---------- сборка ----------
head_end = SRC.index('</head>')
m0, m1 = SRC.index('<main>'), SRC.index('</main>') + len('</main>')
for fn, P in PAGES.items():
    head = SRC[:head_end]
    head = re.sub(r'<title>.*?</title>', '<title>' + E(P['title']) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + E(P['desc']) + '">', head)
    head = head.replace('"position":2,"name":"Шоурум"}', '"position":2,"name":"Клиентам","item":"https://ds-proaudio.ru/clients.html"},\n {"@type":"ListItem","position":3,"name":"' + P['crumb'] + '"}')
    mid = SRC[head_end:m0]
    # текущий пункт меню подчёркнут
    mid = mid.replace('class="mm-item">' + P['menu'] + '</a>', 'class="mm-item mm-current" aria-current="page">' + P['menu'] + '</a>', 1)
    body = '<main>\n<!-- ================= Клиентам: ' + P['crumb'] + ' (21.10.2026) — сборка: tools/klientam/build.py, логика: analiz/klientam-2026-10-21.md ================= -->\n' \
           + '\n\n'.join(P['main']) + '\n\n' + JS + '\n</main>'
    out = head + CSS + mid + body + SRC[m1:]
    open(os.path.join(SITE, fn), 'w', encoding='utf-8').write(out)
    print(fn, len(out))
