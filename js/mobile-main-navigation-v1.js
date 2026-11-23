/* Mobile Hauptnavigation: nutzt dieselben Kacheln und Ziele wie die Desktop-Seitenleiste. */
(function(){
  if(window.__mobileMainNavigationInstalled) return;
  window.__mobileMainNavigationInstalled=true;

  const css=document.createElement("style");
  css.textContent=`
    #mobileNavBar{display:none}
    #mobileNavOverlay{display:none;position:fixed;inset:0;z-index:10000;background:rgba(2,10,22,.78);backdrop-filter:blur(5px);padding:18px;align-items:center;justify-content:center}
    #mobileNavOverlay.open{display:flex}
    #mobileNavDialog{width:min(560px,100%);max-height:min(82vh,760px);overflow:auto;background:linear-gradient(160deg,#102846,#091a31);border:1px solid rgba(100,155,205,.48);border-radius:20px;padding:18px;box-shadow:0 24px 70px #0009}
    #mobileNavDialog .mobile-nav-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
    #mobileNavDialog .mobile-nav-heading strong{font-size:18px;color:#f3f8ff}
    #mobileNavDialog .mobile-nav-close{width:40px;height:40px;border-radius:10px;border:1px solid rgba(110,160,205,.4);background:rgba(255,255,255,.08);color:#fff;font-size:22px}
    #mobileNavTiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    #mobileNavTiles .desktop-nav-tile{min-height:82px;margin:0;padding:12px;grid-template-columns:34px minmax(0,1fr);column-gap:9px}
    #mobileNavTiles .desktop-nav-tile strong{font-size:13px;line-height:1.25}
    #mobileNavTiles .desktop-nav-tile small{font-size:10px;line-height:1.25}
    #mobileNavTiles .desktop-nav-tile>span{font-size:21px}
    @media(max-width:760px){
      #mobileNavBar{display:block;padding:10px 14px 12px;background:linear-gradient(90deg,#07152a,#0e2040);border-bottom:1px solid rgba(59,110,165,.4)}
      #mobileNavOpen{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 16px;border-radius:12px;border:1px solid #477cad;background:linear-gradient(135deg,#2563a8,#174779);color:#fff;font-size:15px;font-weight:800;box-shadow:0 5px 14px #0003}
      #mobileNavOpen .mobile-nav-hamburger{font-size:20px;line-height:1}
      body.app-locked #mobileNavBar{display:none}
    }
    @media(max-width:420px){#mobileNavDialog{padding:14px}#mobileNavTiles{gap:8px}#mobileNavTiles .desktop-nav-tile{padding:10px;grid-template-columns:29px minmax(0,1fr)}#mobileNavTiles .desktop-nav-tile strong{font-size:12px}}
  `;
  document.head.appendChild(css);

  function install(){
    const header=document.getElementById("hdr");
    const sidebar=document.getElementById("desktopSidebar");
    if(!header||!sidebar||document.getElementById("mobileNavBar")) return false;

    const bar=document.createElement("div");
    bar.id="mobileNavBar";
    bar.innerHTML='<button type="button" id="mobileNavOpen" aria-haspopup="dialog" aria-expanded="false"><span class="mobile-nav-hamburger">☰</span><span>Menü öffnen – alle Bereiche</span></button>';
    header.insertAdjacentElement("afterend",bar);

    const overlay=document.createElement("div");
    overlay.id="mobileNavOverlay";
    overlay.innerHTML='<div id="mobileNavDialog" role="dialog" aria-modal="true" aria-label="Hauptnavigation"><div class="mobile-nav-heading"><strong>Wohin möchtest du?</strong><button type="button" class="mobile-nav-close" aria-label="Menü schließen">×</button></div><div id="mobileNavTiles"></div></div>';
    document.body.appendChild(overlay);

    const tiles=overlay.querySelector("#mobileNavTiles");
    sidebar.querySelectorAll(".desktop-nav-tile").forEach(source=>{
      const tile=source.cloneNode(true);
      tile.type="button";
      tile.classList.remove("active");
      tile.addEventListener("click",()=>{
        const target=tile.dataset.nav;
        close();
        if(target && typeof window.go==="function") window.go(target);
      });
      tiles.appendChild(tile);
    });

    const openButton=bar.querySelector("#mobileNavOpen");
    const closeButton=overlay.querySelector(".mobile-nav-close");
    function open(){
      sidebar.querySelectorAll(".desktop-nav-tile").forEach(source=>{
        const copy=tiles.querySelector('[data-nav="'+source.dataset.nav+'"]');
        copy?.classList.toggle("active",source.classList.contains("active"));
      });
      overlay.classList.add("open");
      openButton.setAttribute("aria-expanded","true");
      document.body.style.overflow="hidden";
      closeButton.focus();
    }
    function close(){
      overlay.classList.remove("open");
      openButton.setAttribute("aria-expanded","false");
      document.body.style.overflow="";
      openButton.focus();
    }
    openButton.addEventListener("click",open);
    closeButton.addEventListener("click",close);
    overlay.addEventListener("click",event=>{if(event.target===overlay)close()});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&overlay.classList.contains("open"))close()});
    window.closeMobileMainNavigation=close;
    return true;
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  console.log("Mobile Hauptnavigation geladen");
})();