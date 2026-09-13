/* Calendar Overlay Fix v3
   Sicherheitsnetz gegen beim Seitenstart haengen gebliebene Fullscreen-Modals.
   Nach dem Start werden Modals nicht mehr laufend ueberwacht, damit normale
   Modal-Oeffnungen durch die Anwendung nicht blockiert werden.
*/
(function(){
  if(window.__calendarOverlayFixV3)return;
  window.__calendarOverlayFixV3=true;

  function hide(el){
    if(!el)return;
    el.classList.remove('open');
    el.classList.add('hidden');
    el.style.display='none';
    el.style.pointerEvents='none';
  }

  function init(){
    document.querySelectorAll('.modal').forEach(hide);
    hide(document.getElementById('pdfMod'));
    document.body.style.overflow='';
    console.log('Calendar Overlay Fix v3 geladen');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();