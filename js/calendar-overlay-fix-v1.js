/* Calendar Overlay Fix v4
   Verhindert, dass ein unsichtbares/geschlossenes Modal die gesamte App blockiert.
   Geschlossene Modals bekommen garantiert pointer-events:none.
   Geoeffnete Modals bleiben voll bedienbar.
*/
(function(){
  if(window.__calendarOverlayFixV4)return;
  window.__calendarOverlayFixV4=true;

  function sync(){
    document.querySelectorAll('.modal').forEach(function(el){
      var open=el.classList.contains('open') && !el.classList.contains('hidden');
      if(open){
        el.style.pointerEvents='auto';
      }else{
        el.style.pointerEvents='none';
        if(el.id==='pdfMod' || el.classList.contains('hidden')) el.style.display='none';
      }
    });
  }

  function init(){
    sync();
    new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  console.log('Calendar Overlay Fix v4 geladen');
})();