/* Kalender Modal Open Fix v3
   Stellt das Formular beim Schliessen wieder an seinen urspruenglichen Platz.
*/
(function(){
  if(window.__kalenderModalOpenFixV3)return;
  window.__kalenderModalOpenFixV3=true;
  const originalOpen=window.openKalenderModal;
  const originalClose=window.closeKalenderModal;
  function openFix(){
    const modal=document.getElementById('kalenderModal'); if(!modal)return;
    modal.classList.remove('hidden'); modal.classList.add('open');
    modal.style.display='flex'; modal.style.pointerEvents='auto';
    document.body.style.overflow='hidden';
  }
  function closeFix(){
    // Originale Funktion setzt das Formular zurueck und leert den Modal-Inhalt.
    if(typeof originalClose==='function') originalClose();
    const modal=document.getElementById('kalenderModal'); if(!modal)return;
    modal.classList.remove('open'); modal.classList.add('hidden');
    modal.style.display='none'; modal.style.pointerEvents='none';
    document.body.style.overflow='';
  }
  if(typeof originalOpen==='function') window.openKalenderModal=function(title,content){originalOpen(title,content);openFix();};
  if(typeof originalClose==='function') window.closeKalenderModal=closeFix;
  const modal=document.getElementById('kalenderModal');
  if(modal&&!modal.classList.contains('open')){modal.classList.add('hidden');modal.style.display='none';modal.style.pointerEvents='none';}
  console.log('Kalender Modal Open Fix v3 geladen');
})();