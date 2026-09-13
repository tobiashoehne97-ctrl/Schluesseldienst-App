/* Kalender Click Hotfix v5
   Kalender-Klicks werden unabhaengig von ueberlagernden Elementen behandelt.
   Wichtig: kein stopImmediatePropagation mehr, damit der bestehende Kalender
   seine eigenen Handler weiterhin ausfuehren kann.
*/
(function(){
  if(window.__kalenderClickHotfixV5)return;
  window.__kalenderClickHotfixV5=true;

  function callEntry(id){
    if(id==null)return false;
    if(typeof window.openKalenderEntryDetails==='function'){
      window.openKalenderEntryDetails(String(id));
      return true;
    }
    return false;
  }

  function callDay(date){
    if(!date)return false;
    if(typeof window.openKalenderDay==='function'){
      window.openKalenderDay(String(date));
      return true;
    }
    return false;
  }

  function targetUnderPoint(ev){
    if(!document.elementsFromPoint || ev.clientX==null || ev.clientY==null)return null;
    var els=document.elementsFromPoint(ev.clientX,ev.clientY);
    return els.find(function(el){
      return el && el.closest && el.closest('.week-entry,.desktop-week-day,.week-more,.week-add');
    }) || null;
  }

  function calendarTarget(ev){
    var t=ev.target;
    var direct=t && t.closest ? t.closest('.week-entry,.desktop-week-day,.week-more,.week-add') : null;
    if(direct)return direct;

    var under=targetUnderPoint(ev);
    if(under)return under;

    /* Falls ein veraltetes Fullscreen-Overlay ueber dem Kalender liegt,
       fuer genau diesen Hit-Test temporaer aus dem Pointer-Stack nehmen. */
    var blockers=[];
    document.querySelectorAll('body *').forEach(function(el){
      if(!el.getBoundingClientRect)return;
      var r=el.getBoundingClientRect();
      if(r.width<window.innerWidth*0.85 || r.height<window.innerHeight*0.85)return;
      var cs=getComputedStyle(el);
      if(cs.position==='fixed' || cs.position==='absolute'){
        blockers.push([el,el.style.pointerEvents]);
        el.style.pointerEvents='none';
      }
    });
    under=targetUnderPoint(ev);
    blockers.forEach(function(x){x[0].style.pointerEvents=x[1];});
    return under;
  }

  function handle(ev){
    var el=calendarTarget(ev);
    if(!el)return;

    var entry=el.closest ? el.closest('.week-entry') : null;
    if(entry){
      var id=entry.dataset.calendarId || entry.dataset.kalenderId || entry.dataset.id;
      if(id!=null && callEntry(id))return;
    }

    if(el.closest && el.closest('.week-add'))return;

    var card=el.closest ? el.closest('.desktop-week-day') : null;
    var more=el.closest ? el.closest('.week-more') : null;
    var date=card && (card.dataset.calendarDate || card.dataset.date);
    if(!date && more){
      card=more.closest('.desktop-week-day');
      date=card && (card.dataset.calendarDate || card.dataset.date);
    }
    if(date)callDay(date);
  }

  document.addEventListener('click',handle,true);
  document.addEventListener('pointerup',handle,true);

  function repair(){
    document.querySelectorAll('.desktop-week-day').forEach(function(card,index){
      card.style.pointerEvents='auto';
      if(!card.dataset.calendarDate && typeof window.dashboardWeekStart==='function'){
        var d=new Date(window.dashboardWeekStart());
        d.setDate(d.getDate()+index);
        card.dataset.calendarDate=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      }
      card.querySelectorAll('.week-entry').forEach(function(item){
        item.style.pointerEvents='auto';
      });
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair);
  else repair();
  setInterval(repair,1500);
  console.log('Kalender Click Hotfix v5 geladen');
})();