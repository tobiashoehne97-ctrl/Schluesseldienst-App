/* Finalisierung der zentralen Zeit-/Notdienstansicht */
(function(){
  function refresh(){
    const old=document.getElementById("ndPriceWrap");
    if(old)old.remove();
    if(typeof window.ensureNdPricePanel==="function")window.ensureNdPricePanel();
    if(typeof window.renderNotdienst==="function")window.renderNotdienst();
  }
  setTimeout(refresh,0);
  setTimeout(refresh,500);
})();
