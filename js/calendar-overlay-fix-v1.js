/* Calendar Overlay Fix v2
   Sicherheitsnetz gegen haengen gebliebene Fullscreen-Modals.
   Versteckte Modals duerfen niemals den Seiteninhalt blockieren.
*/
(function(){
  if(window.__calendarOverlayFixV2)return;
  window.__calendarOverlayFixV2=true;

  function hide(el){
    if(!el)return;
    el.classList.remove('open');
    el.classList.add('hidden');
    el.style.display='none';
    el.style.pointerEvents='none';
  }

  function syncAll(){
    document.querySelectorAll('.modal').forEach(function(el){
      /* Nur ein ausdruecklich geoeffnetes Modal darf sichtbar sein. */
      if(!el.classList.contains('open')) hide(el);
    });
    var pdf=document.getElementById('pdfMod');
    if(pdf && !pdf.classList.contains('open')) hide(pdf);
    if(!document.querySelector('.modal.open')) document.body.style.overflow='';
  }

  function init(){
    syncAll();
    if(document.body){
      new MutationObserver(function(){
        /* Keine Dauer-Manipulation: nur reagieren, wenn ein Modal sichtbar wird. */
        document.querySelectorAll('.modal').forEach(function(el){
          if(!el.classList.contains('open')){
            if(getComputedStyle(el).display!=='none' || el.style.pointerEvents!=='none') hide(el);
          }
        });
      }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style']});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  console.log('Calendar Overlay Fix v2 geladen');
})();