/* Kalender Modal Open Fix v1
   kalender.js entfernt beim Oeffnen nur .hidden, waehrend die globale
   .modal-Regel display:none und .modal.open display:flex verwendet.
   Dadurch wurde der Kalender korrekt geklickt, aber das Ergebnis blieb unsichtbar.
*/
(function(){
  if(window.__kalenderModalOpenFixV1)return;
  window.__kalenderModalOpenFixV1=true;

  function sync(){
    const modal=document.getElementById('kalenderModal');
    if(!modal)return;
    const isHidden=modal.classList.contains('hidden');
    if(isHidden){
      modal.classList.remove('open');
      modal.style.display='none';
      modal.style.pointerEvents='none';
    }else{
      modal.classList.add('open');
      modal.style.display='flex';
      modal.style.pointerEvents='auto';
    }
  }

  function init(){
    sync();
    const modal=document.getElementById('kalenderModal');
    if(modal){
      new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
    }
    setInterval(sync,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
  console.log('Kalender Modal Open Fix v1 geladen');
})();