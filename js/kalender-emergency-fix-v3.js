/* Kalender Emergency Fix v3
   Safari-sichere Einsatzplanung.
   Wichtig: Der Kalender benoetigt ein echtes kalenderModal. Falls dieses im
   HTML fehlt, wird es hier erzeugt, damit Tages- und Termin-Klicks nicht ins
   Leere laufen.
*/
(function(){
  if(window.__kalenderEmergencyFixV3)return;
  window.__kalenderEmergencyFixV3=true;

  function esc(v){return String(v||'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c];});}

  function ensureModal(){
    if(document.getElementById('kalenderModal'))return;
    const modal=document.createElement('div');
    modal.id='kalenderModal';
    modal.className='modal hidden';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.innerHTML='<div class="card" style="width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;margin:auto;padding:22px"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px"><strong id="kal_modal_titel" style="font-size:20px">Kalender</strong><button class="btnS" type="button" id="kal_modal_close">✕</button></div><div id="kal_modal_content"></div></div>';
    document.body.appendChild(modal);
    document.getElementById('kal_modal_close').onclick=()=>window.closeKalenderModal?.();
  }

  function install(){
    ensureModal();
    const grid=document.getElementById('dashboardWeekGrid');
    if(!grid)return;
    const entries=window.AppData?.kalender?.eintraege||[];
    const start=typeof window.dashboardWeekStart==='function' ? window.dashboardWeekStart() : new Date();
    const isoLocal=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;};

    grid.querySelectorAll('.desktop-week-day').forEach((card,index)=>{
      const date=new Date(start);date.setDate(start.getDate()+index);
      const iso=isoLocal(date);
      card.dataset.calendarDate=iso;

      if(card.tagName==='BUTTON'){
        const replacement=document.createElement('div');
        for(const attr of [...card.attributes]) replacement.setAttribute(attr.name,attr.value);
        replacement.className=card.className;
        replacement.style.cursor='pointer';
        while(card.firstChild) replacement.appendChild(card.firstChild);
        card.replaceWith(replacement);
        card=replacement;
      }

      const dayEntries=entries.filter(e=>e.datum===iso && e.typ!=='verfuegbarkeit' && e.typ!=='geschaeft');
      const body=card.querySelector('.desktop-week-day-body');
      if(body){
        const existingIds=new Set([...body.querySelectorAll('.week-entry')].map(el=>el.dataset.calendarId).filter(Boolean));
        dayEntries.forEach(entry=>{
          if(existingIds.has(String(entry.id)))return;
          const item=document.createElement('div');
          item.className='week-entry';
          item.dataset.calendarId=String(entry.id);
          item.dataset.calendarDate=iso;
          item.setAttribute('role','button');
          item.tabIndex=0;
          const color=typeof window.getStatusColor==='function'?window.getStatusColor(entry.status):'#3b82c4';
          item.innerHTML='<span class="week-entry-dot" style="background:'+color+'"></span><div><strong>'+esc(entry.titel||'Einsatz')+'</strong><small>'+esc((entry.von||'')+(entry.bis?' – '+entry.bis:''))+'</small></div>';
          body.appendChild(item);
        });
      }

      if(card.dataset.calendarClickInstalled!=='1'){
        card.dataset.calendarClickInstalled='1';
        card.addEventListener('click',function(ev){
          const item=ev.target.closest('.week-entry');
          if(item){
            ev.preventDefault();ev.stopPropagation();
            const id=item.dataset.calendarId;
            if(id && typeof window.openKalenderEntryDetails==='function')window.openKalenderEntryDetails(id);
            return;
          }
          const add=ev.target.closest('.week-add');
          if(add)return;
          ev.preventDefault();ev.stopPropagation();
          if(typeof window.openKalenderDay==='function')window.openKalenderDay(iso);
        },true);
      }

      card.querySelectorAll('.week-entry').forEach(item=>{
        const title=item.querySelector('strong')?.textContent?.trim();
        if(!item.dataset.calendarId && title){
          const match=entries.find(e=>e.datum===iso && e.titel===title);
          if(match)item.dataset.calendarId=String(match.id);
        }
        if(item.dataset.calendarClickInstalled==='1')return;
        item.dataset.calendarClickInstalled='1';
        item.style.cursor='pointer';
        item.addEventListener('click',function(ev){
          ev.preventDefault();ev.stopPropagation();
          const id=item.dataset.calendarId;
          if(id && typeof window.openKalenderEntryDetails==='function')window.openKalenderEntryDetails(id);
        },true);
      });
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
  else setTimeout(install,100);
  setInterval(install,500);
  console.log('Kalender Emergency Fix v3 geladen');
})();
