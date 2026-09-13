/* Kalender Click Hotfix v4
   Zentrale Klickbehandlung fuer Dashboard-Kalender und Termine.
   Arbeitet im Capture-Phase, damit auch ueberlagernde Elemente Safari/Browser
   nicht daran hindern, einen Kalendertermin zu oeffnen.
*/
(function(){
  if(window.__kalenderClickHotfixV4)return;
  window.__kalenderClickHotfixV4=true;

  function openDay(date){
    if(date && typeof window.openKalenderDay==='function'){
      window.openKalenderDay(date);
      return true;
    }
    return false;
  }

  function openEntry(id){
    if(id!=null && typeof window.openKalenderEntryDetails==='function'){
      window.openKalenderEntryDetails(String(id));
      return true;
    }
    return false;
  }

  function findCalendarTarget(ev){
    const direct=ev.target && ev.target.closest ? ev.target.closest('.week-entry,.desktop-week-day,.week-more,.week-add') : null;
    if(direct)return direct;
    if(typeof document.elementsFromPoint!=='function' || ev.clientX==null || ev.clientY==null)return null;
    const stack=document.elementsFromPoint(ev.clientX,ev.clientY);
    return stack.find(el=>el.matches && el.matches('.week-entry,.desktop-week-day,.week-more,.week-add')) || null;
  }

  function handle(ev){
    if(ev.__kalenderHandledV4)return;
    const el=findCalendarTarget(ev);
    if(!el)return;

    const entry=el.closest ? el.closest('.week-entry') : null;
    if(entry){
      const id=entry.dataset.calendarId || entry.dataset.kalenderId;
      if(id!=null){
        ev.__kalenderHandledV4=true;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        openEntry(id);
      }
      return;
    }

    if(el.closest && el.closest('.week-add'))return;
    if(el.closest && el.closest('.week-more')){
      const card=el.closest('.desktop-week-day');
      const date=card && (card.dataset.calendarDate || card.dataset.date);
      if(date){
        ev.__kalenderHandledV4=true;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        openDay(date);
      }
      return;
    }

    const card=el.closest ? el.closest('.desktop-week-day') : null;
    const date=card && (card.dataset.calendarDate || card.dataset.date);
    if(date){
      ev.__kalenderHandledV4=true;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      openDay(date);
    }
  }

  document.addEventListener('click',handle,true);
  document.addEventListener('pointerup',handle,true);

  function repair(){
    document.querySelectorAll('.desktop-week-day').forEach((card,index)=>{
      card.style.pointerEvents='auto';
      card.style.position='relative';
      card.style.zIndex='1';
      if(!card.dataset.calendarDate && typeof window.dashboardWeekStart==='function'){
        const d=new Date(window.dashboardWeekStart());
        d.setDate(d.getDate()+index);
        const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
        card.dataset.calendarDate=y+'-'+m+'-'+day;
      }
      card.querySelectorAll('.week-entry').forEach(item=>{
        item.style.pointerEvents='auto';
        item.style.position='relative';
        item.style.zIndex='2';
      });
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair);
  else repair();
  setInterval(repair,1000);
  console.log('Kalender Click Hotfix v4 geladen');
})();
