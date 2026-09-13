/* Calendar Overlay Fix v1
   Verhindert, dass ein unsichtbares/haengengebliebenes Modal den kompletten
   Dashboard-Kalender blockiert. Modals duerfen spaeter normal geoeffnet werden.
*/
(function(){
  if(window.__calendarOverlayFixV1)return;
  window.__calendarOverlayFixV1=true;

  function hideStartupOverlays(){
    document.querySelectorAll('.modal').forEach(function(el){
      el.classList.remove('open');
      el.style.pointerEvents='none';
      el.style.display='none';
    });
    var pdf=document.getElementById('pdfMod');
    if(pdf){
      pdf.classList.remove('open');
      pdf.style.display='none';
      pdf.style.pointerEvents='none';
    }
  }

  function guardHiddenModals(){
    document.querySelectorAll('.modal:not(.open)').forEach(function(el){
      if(getComputedStyle(el).display!=='none'){
        el.style.display='none';
        el.style.pointerEvents='none';
      }
    });
    var pdf=document.getElementById('pdfMod');
    if(pdf && !pdf.classList.contains('open')){
      pdf.style.display='none';
      pdf.style.pointerEvents='none';
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      hideStartupOverlays();
      setTimeout(guardHiddenModals,100);
      setTimeout(guardHiddenModals,500);
    });
  }else{
    hideStartupOverlays();
    setTimeout(guardHiddenModals,100);
  }

  console.log('Calendar Overlay Fix v1 geladen');
})();
