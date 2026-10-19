/* DS PROAUDIO — главная, «Применение»: раскрывающиеся полосы (.apx).
   Мышь: полоса раскрывается, только когда курсор над ней остановился (пауза STILL мс) —
   при быстром проведении мыши через блок полосы не дёргаются.
   Тач-экран: первое касание свёрнутой полосы раскрывает её, второе — открывает направление.
   Обработчики делегированы на document: главная собирается шаблоном и может перерисовать блок. */
(function(){
  var STILL = 180;          // сколько курсор должен простоять на месте, мс
  var timer = 0, lastX = null, lastY = null;

  function open(c){
    var box = c.parentNode; if (!box) return;
    box.classList.add('touched');
    for (var i = 0; i < box.children.length; i++) box.children[i].classList.toggle('on', box.children[i] === c);
  }
  function isOpen(c){
    var box = c.parentNode;
    return c.classList.contains('on') || (!box.classList.contains('touched') && c === box.firstElementChild);
  }
  function hoverDevice(){ try { return matchMedia('(hover:hover)').matches; } catch(e){ return true; } }

  document.addEventListener('mousemove', function(e){
    if (!hoverDevice()) return;
    if (e.clientX === lastX && e.clientY === lastY) return;     // событие без реального перемещения
    lastX = e.clientX; lastY = e.clientY;
    clearTimeout(timer);
    var c = e.target.closest && e.target.closest('.apx-c');
    if (!c || isOpen(c)) return;
    timer = setTimeout(function(){
      // открываем ту полосу, над которой курсор находится в момент остановки
      var el = document.elementFromPoint(lastX, lastY), cc = el && el.closest && el.closest('.apx-c');
      if (cc && !isOpen(cc)) open(cc);
    }, STILL);
  });
  document.addEventListener('mouseout', function(e){
    if (e.target.closest && e.target.closest('.apx') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.apx'))) clearTimeout(timer);
  });
  document.addEventListener('click', function(e){
    var c = e.target.closest && e.target.closest('.apx-c');
    if (c && !isOpen(c)){ e.preventDefault(); clearTimeout(timer); open(c); }
  }, true);
})();
