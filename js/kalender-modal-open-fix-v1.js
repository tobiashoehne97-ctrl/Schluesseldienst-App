/* Kalender Modal Open Fix v2
   kalender.js entfernt beim Oeffnen nur .hidden. Die globale .modal-Regel
   verlangt jedoch .open. Wir patchen deshalb nur die beiden Kalender-Modal-
   Funktionen direkt und lassen alle anderen Interaktionen unangetastet.
*/
(function(){
  if(window.__kalenderModalOpenFixV2)return;
  window.__kalenderModalOpenFixV2=true;

  function openFix(){
    const modal=document.getElementById('kalenderModal');
    if(!modal)return;
    modal.classList.remove('hidden');
    modal.classList.add('open');
    modal.style.display='flex';
    modal.style.pointerEvents='auto';
    document.body.style.overflow='hidden';
  }

  function closeFix(){
    const modal=document.getElementById('kalenderModal');
    if(!modal)return;
    modal.classList.remove('open');
    modal.classList.add('hidden');
    modal.style.display='none';
    modal.style.pointerEvents='none';
    document.body.style.overflow='';
  }

  function install(){
    if(typeof window.openKalenderModal==='function' && !window.openKalenderModal.__modalFix){
      const original=window.openKalenderModal;
      function wrappedOpen(title,content){
        original(title,content);
        openFix();
      }
      wrappedOpen.__modalFix=true;
      window.openKalenderModal=wrappedOpen;
    }
    window.closeKalenderModal=closeFix;
    const modal=document.getElementById('kalenderModal');
    if(modal && !modal.classList.contains('open')){
      modal.classList.add('hidden');
      modal.style.display='none';
      modal.style.pointerEvents='none';
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
  setTimeout(install,300);
  console.log('Kalender Modal Open Fix v2 geladen');
})();