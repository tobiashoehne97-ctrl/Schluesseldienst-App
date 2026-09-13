/* Kalender Interaction Fix v1
   Bestehende Termine in Liste/Wochenübersicht wieder direkt anklickbar.
   Der + Button und die Tagesansicht bleiben erhalten.
*/
(function(){
  if(window.__kalenderInteractionFixV1)return;
  window.__kalenderInteractionFixV1=true;

  function details(id){
    if(id==null||id==='')return;
    if(typeof window.openKalenderEntryDetails==='function'){
      window.openKalenderEntryDetails(id);
    }
  }

  function installListClicks(){
    const list=document.getElementById('kalenderListe');
    if(!list||list.dataset.clickFix==='1')return;
    list.dataset.clickFix='1';
    list.addEventListener('click',function(ev){
      const del=ev.target.closest('.btnD');
      if(del)return;
      const card=ev.target.closest('.card');
      if(!card||card.parentElement!==list)return;
      const id=card.dataset.kalenderId;
      if(id)details(id);
    });
  }

  function markListCards(){
    const list=document.getElementById('kalenderListe');
    if(!list)return;
    const entries=(window.AppData?.kalender?.eintraege||[]);
    [...list.children].forEach(card=>{
      if(!card.classList.contains('card'))return;
      if(card.dataset.kalenderId)return;
      const text=card.querySelector('div[style*="font-size:16px"]')?.textContent?.trim();
      const candidates=entries.filter(e=>e.titel===text);
      if(candidates.length===1){
        card.dataset.kalenderId=String(candidates[0].id);
        card.style.cursor='pointer';
      }
    });
  }

  function installDashboardEntryClicks(){
    const grid=document.getElementById('dashboardWeekGrid');
    if(!grid||grid.dataset.entryClickFix==='1')return;
    grid.dataset.entryClickFix='1';
    grid.addEventListener('click',function(ev){
      const item=ev.target.closest('.week-entry');
      if(!item)return;
      ev.stopPropagation();
      const title=item.querySelector('strong')?.textContent?.trim();
      const dateCard=item.closest('.desktop-week-day');
      if(!title||!dateCard)return;
      const head=dateCard.querySelector('.desktop-week-day-head strong')?.textContent?.trim();
      const dateText=head||'';
      const start=typeof window.dashboardWeekStart==='function'?window.dashboardWeekStart():new Date();
      const entries=window.AppData?.kalender?.eintraege||[];
      const candidates=entries.filter(e=>e.titel===title);
      if(candidates.length===1){details(candidates[0].id);return;}
      if(candidates.length>1){
        const isoList=candidates.filter(e=>e.datum).filter(e=>{
          const d=new Date(e.datum+'T12:00:00');
          return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})===dateText;
        });
        if(isoList.length===1)details(isoList[0].id);
      }
    });
  }

  function install(){
    installListClicks();
    markListCards();
    installDashboardEntryClicks();
  }

  const originalRenderList=window.renderKalender;
  if(typeof originalRenderList==='function'&&!window.__kalenderInteractionRenderWrapped){
    window.__kalenderInteractionRenderWrapped=true;
    window.renderKalender=function(){
      const result=originalRenderList.apply(this,arguments);
      setTimeout(install,0);
      return result;
    };
  }

  const originalRenderDashboard=window.renderDashboardWeek;
  if(typeof originalRenderDashboard==='function'&&!window.__kalenderInteractionDashboardWrapped){
    window.__kalenderInteractionDashboardWrapped=true;
    window.renderDashboardWeek=function(){
      const result=originalRenderDashboard.apply(this,arguments);
      setTimeout(installDashboardEntryClicks,0);
      return result;
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
  else setTimeout(install,100);
  setInterval(install,1000);
  console.log('Kalender Interaction Fix v1 geladen');
})();
