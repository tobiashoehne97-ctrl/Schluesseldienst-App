/* Kalender Emergency Fix v3
   Safari-sichere Einsatzplanung:
   - ersetzt die verschachtelten <button>-Tageskarten durch normale <div>-Karten
   - setzt echte IDs/Daten an Termine
   - ergänzt alle Termine der Woche, nicht nur die ersten vier
   - bindet Tages- und Termin-Klicks direkt
*/
(function(){
  if(window.__kalenderEmergencyFixV3)return;
  window.__kalenderEmergencyFixV3=true;

  function esc(v){return String(v||'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c];});}

  function install(){
    const grid=document.getElementById('dashboardWeekGrid');
    if(!grid)return;
    const entries=window.AppData?.kalender?.eintraege||[];
    const start=typeof window.dashboardWeekStart==='function' ? window.dashboardWeekStart() : new Date();
    const isoLocal=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;};

    grid.querySelectorAll('.desktop-week-day').forEach((card,index)=>{
      const date=new Date(start);date.setDate(start.getDate()+index);
      const iso=isoLocal(date);
      card.dataset.calendarDate=iso;

      // Safari: keine interaktiven Elemente ineinander verschachteln.
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

  install();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,200));
  else setTimeout(install,200);
  setInterval(install,500);
  console.log('Kalender Emergency Fix v3 geladen');
})();
