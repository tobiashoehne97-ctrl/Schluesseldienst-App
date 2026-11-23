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
    #mobileNavTiles .desktop-nav-tile{min-height:82px;margin:0;padding:12px;grid-template-columns:34px minmax(0,1fr);column-gap:9px;min-width:0;overflow:hidden}
    #mobileNavTiles .desktop-nav-tile strong{font-size:13px;line-height:1.25;white-space:normal;overflow-wrap:anywhere;word-break:normal;min-width:0}
    #mobileNavTiles .desktop-nav-tile small{font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:anywhere;min-width:0}
    #mobileNavTiles .desktop-nav-tile>span{font-size:21px;min-width:0}
    #mobileNavTiles .desktop-nav-tile strong,#mobileNavTiles .desktop-nav-tile small{grid-column:2}
    #mobileNavTiles .desktop-nav-tile>span{grid-row:1/3}
    #mobileHomeTimeClock{display:none}
    @media(max-width:760px){
      #menu > .dash-welcome{display:none!important}
      #mobileHomeTimeClock{display:block;margin:0 0 16px;padding:18px;border-radius:16px;background:linear-gradient(135deg,rgba(37,99,168,.28),rgba(255,255,255,.06));border:1px solid rgba(75,143,203,.45);box-shadow:0 10px 24px #0002}
      #mobileHomeTimeClock .home-clock-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
      #mobileHomeTimeClock .home-clock-label{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8ebce3}
      #mobileHomeTimeClock .home-clock-state{font-size:12px;font-weight:800;padding:6px 9px;border-radius:999px;background:rgba(126,179,224,.12);color:#a9c9e5}
      #mobileHomeTimeClock .home-clock-state.running{background:rgba(34,197,94,.14);color:#6ee7a1}
      #mobileHomeTimeClock .home-clock-time{font-size:30px;font-weight:850;letter-spacing:.02em;color:#f5f9ff;margin:12px 0 2px;font-variant-numeric:tabular-nums}
      #mobileHomeTimeClock .home-clock-since{font-size:12px;color:#9bb9d7;min-height:18px}
      #mobileHomeTimeClock .home-clock-button{width:100%;margin-top:14px;padding:14px 16px;border:0;border-radius:12px;background:linear-gradient(135deg,#2563a8,#3b82c4);color:#fff;font-size:16px;font-weight:850}
      #mobileHomeTimeClock .home-clock-button.is-running{background:linear-gradient(135deg,#b83232,#e04a4a)}
    }
    @media(max-width:760px){
      #mobileNavBar{display:block;padding:10px 14px 12px;background:linear-gradient(90deg,#07152a,#0e2040);border-bottom:1px solid rgba(59,110,165,.4)}
      #mobileNavOpen{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 16px;border-radius:12px;border:1px solid #477cad;background:linear-gradient(135deg,#2563a8,#174779);color:#fff;font-size:15px;font-weight:800;box-shadow:0 5px 14px #0003}
      #mobileNavOpen .mobile-nav-hamburger{font-size:20px;line-height:1}
      body.app-locked #mobileNavBar{display:none}
    }
    @media(max-width:420px){#mobileNavDialog{padding:14px}#mobileNavTiles{gap:8px}#mobileNavTiles .desktop-nav-tile{padding:10px;grid-template-columns:29px minmax(0,1fr)}#mobileNavTiles .desktop-nav-tile strong{font-size:12px}}
  `;
  document.head.appendChild(css);

  function installMobileHomeClock(){
    const home=document.getElementById("menu");
    if(!home || document.getElementById("mobileHomeTimeClock")) return;
    const card=document.createElement("section");
    card.id="mobileHomeTimeClock";
    card.innerHTML='<div class="home-clock-top"><span class="home-clock-label">Arbeitszeiterfassung</span><span class="home-clock-state" id="mobileHomeClockState">Nicht eingestempelt</span></div><div class="home-clock-time" id="mobileHomeClockTotal">0 h 00 min</div><div class="home-clock-since" id="mobileHomeClockSince">Arbeitszeit heute</div><button type="button" class="home-clock-button" id="mobileHomeClockButton">⏱ Einstempeln</button>';
    // Mobile: Stempeluhr als allerersten Inhalt der Startseite platzieren.
    // Der Begrüßungsblock mit Tagesüberschrift, Datum und Termin-Button wird mobil ausgeblendet.
    home.insertBefore(card,home.firstChild);

    document.getElementById("mobileHomeClockButton").addEventListener("click",()=>{
      if(typeof window.toggleStempel!=="function") return;
      window.toggleStempel();
      updateMobileHomeClock();
    });
    updateMobileHomeClock();
    if(!window.__mobileHomeClockInterval){
      window.__mobileHomeClockInterval=window.setInterval(updateMobileHomeClock,1000);
    }
  }

  function updateMobileHomeClock(){
    const state=document.getElementById("mobileHomeClockState");
    const total=document.getElementById("mobileHomeClockTotal");
    const since=document.getElementById("mobileHomeClockSince");
    const button=document.getElementById("mobileHomeClockButton");
    if(!state||!total||!since||!button) return;
    const data=typeof AppData!=="undefined"?AppData:null;
    const work=data&&data.arbeitszeit?data.arbeitszeit:{};
    const running=!!(work.eingestempelt&&work.start);
    let minutes=typeof window.getTodayWorkMinutes==="function"?window.getTodayWorkMinutes():0;
    const hours=Math.floor(minutes/60),mins=minutes%60;
    total.textContent=hours+" h "+String(mins).padStart(2,"0")+" min";
    state.textContent=running?"Eingestempelt":"Nicht eingestempelt";
    state.classList.toggle("running",running);
    button.textContent=running?"⏹ Ausstempeln":"⏱ Einstempeln";
    button.classList.toggle("is-running",running);
    if(running){
      const start=new Date(work.start);
      const elapsed=Math.max(0,Math.floor((Date.now()-start.getTime())/60000));
      since.textContent="Seit "+start.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+" Uhr · aktuell "+Math.floor(elapsed/60)+" h "+String(elapsed%60).padStart(2,"0")+" min";
    }else{
      since.textContent="Arbeitszeit heute";
    }
  }

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
      tile.removeAttribute("onclick");
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
    installMobileHomeClock();
    return true;
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  console.log("Mobile Hauptnavigation geladen");
})();