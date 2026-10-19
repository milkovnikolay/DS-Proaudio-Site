/* DS PROAUDIO — просмотр скриншотов расчёта крупно (блок «Акустический расчёт») */
(function(){
  var lb = null;
  function close(){ if (lb){ lb.remove(); lb = null; document.removeEventListener('keydown', key); } }
  function key(e){ if (e.key === 'Escape') close(); }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-calc]'); if (!a) return;
    e.preventDefault(); close();
    lb = document.createElement('div'); lb.className = 'calc-lb'; lb.setAttribute('role', 'dialog');
    lb.innerHTML = '<img alt=""><button type="button" aria-label="Закрыть">✕</button>';
    lb.firstChild.src = a.getAttribute('href'); lb.firstChild.alt = (a.querySelector('img') || {}).alt || '';
    lb.addEventListener('click', close); document.addEventListener('keydown', key);
    document.body.appendChild(lb);
  });
})();
