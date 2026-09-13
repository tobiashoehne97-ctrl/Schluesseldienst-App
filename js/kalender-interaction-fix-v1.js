/* Kalender Interaction Fix v2
   Robuste Kalender-Interaktion fuer Safari/Desktop.
   - Klicks werden auf Dokumentebene abgefangen.
   - Termine im Dashboard werden direkt ueber ihre ID geoeffnet.
   - Mehr als 4 Termine pro Tag werden nicht mehr unsichtbar.
   - Die bestehende Kalenderlogik wird nicht gewrappt oder ersetzt.
*/
(function(){
  if(window.__kalenderInteractionFixV2)return;
  window.__kalenderInteractionFixV2=true;

  function entries(){
    return window.AppData?.kalender?.eintraege || [];
  }

  function open(id){
    if(id===undefined || id===null || id==='') return;
    if(typeof window.openKalenderEntryDetails==='function'){
      window.openKalenderEntryDetails(id);
    }
  }

  function dashboardDateForCard(card){
    const grid=document.getElementById('dashboardWeekGrid');
    if(!grid || !card) return '';
    const index=Array.from(grid.children).indexOf(card);
    if(index<0 || typeof window.dashboardWeekStart!=='function') return '';
    const d=new Date(window.dashboardWeekStart());
    d.setDate(d.getDate()+index);
    if(typeof window.dashboardIsoDate==='function') return window.dashboardIsoDate(d);
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }

  function dashboardEntryId(item){
    if(!item) return '';
    if(item.dataset.kalenderId) return item.dataset.kalenderId;
    const card=item.closest('.desktop-week-day');
    const title=item.querySelector('strong')?.textContent?.trim() || '';
    const iso=dashboardDateForCard(card);
    const time=item.querySelector('small')?.textContent?.trim() || '';
    let matches=entries().filter(e=>e.titel===title);
    if(iso) matches=matches.filter(e=>e.datum===iso);
    if(time) matches=matches.filter(e=>{
      const t=(e.von||'')+(e.bis?' – '+e.bis:'');
      return t===time;
    });
    if(matches.length===1){
      item.dataset.kalenderId=String(matches[0].id);
      return String(matches[0].id);
    }
    return '';
  }

  function installCapture(){
    if(window.__kalenderCaptureInstalled)return;
    window.__kalenderCaptureInstalled=true;
    document.addEventListener('click',function(ev){
      const item=ev.target.closest?.('.week-entry');
      if(item){
        const id=dashboardEntryId(item);
        if(id){
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          open(id);
          return;
        }
      }

      const list=document.getElementById('kalenderListe');
      if(list && list.contains(ev.target)){
        const del=ev.target.closest?.('.btnD');
        if(del)return;
        const card=ev.target.closest?.('.card');
        if(!card || card.parentElement!==list)return;
        const title=card.querySelector('div[style*="font-size:16px"]')?.textContent?.trim() || '';
        const dateText=card.querySelector('div[style*="font-size:13px"]')?.textContent || '';
        const dateMatch=dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        const timeMatch=dateText.match(/(\d{2}:\d{2})/);
        let matches=entries().filter(e=>e.titel===title);
        if(dateMatch){
          const iso=dateMatch[3]+'-'+dateMatch[2]+'-'+dateMatch[1];
          matches=matches.filter(e=>e.datum===iso);
        }
        if(timeMatch)matches=matches.filter(e=>String(e.von||'').slice(0,5)===timeMatch[1]);
        if(matches.length===1){
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          open(matches[0].id);
        }
      }
    },true);
  }

  function makeDashboardEntry(entry){
    const item=document.createElement('div');
    item.className='week-entry';
    item.dataset.kalenderId=String(entry.id);
    item.setAttribute('role','button');
    item.tabIndex=0;
    item.style.cursor='pointer';
    const dot=document.createElement('span');
    dot.className='week-entry-dot';
    dot.style.background=typeof window.getStatusColor==='function' ? window.getStatusColor(entry.status) : '#3b82c4';
    const wrap=document.createElement('div');
    const strong=document.createElement('strong');
    strong.textContent=entry.titel || 'Einsatz';
    const small=document.createElement('small');
    small.textContent=(entry.von||'')+(entry.bis?' – '+entry.bis:'');
    wrap.append(strong,small);
    item.append(dot,wrap);
    item.addEventListener('click',function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      open(entry.id);
    });
    item.addEventListener('keydown',function(ev){
      if(ev.key==='Enter' || ev.key===' '){
        ev.preventDefault();
        ev.stopPropagation();
        open(entry.id);
      }
    });
    return item;
  }

  function restoreHiddenDashboardEntries(){
    const grid=document.getElementById('dashboardWeekGrid');
    if(!grid)return;
    const all=entries();
    Array.from(grid.children).forEach((card,index)=>{
      if(!card.classList.contains('desktop-week-day'))return;
      const d=new Date(typeof window.dashboardWeekStart==='function' ? window.dashboardWeekStart() : new Date());
      d.setDate(d.getDate()+index);
      const y=d.getFullYear();
      const m=String(d.getMonth()+1).padStart(2,'0');
      const day=String(d.getDate()).padStart(2,'0');
      const iso=y+'-'+m+'-'+day;
      const dayEntries=all.filter(e=>e.datum===iso && e.typ!=='verfuegbarkeit' && e.typ!=='geschaeft');
      const body=card.querySelector('.desktop-week-day-body');
      if(!body)return;

      const shown=new Set(Array.from(body.querySelectorAll('.week-entry')).map(x=>String(x.dataset.kalenderId||'')));
      dayEntries.forEach(entry=>{
        if(shown.has(String(entry.id)))return;
        body.appendChild(makeDashboardEntry(entry));
      });
    });
  }

  function markList(){
    const list=document.getElementById('kalenderListe');
    if(!list)return;
    const all=entries();
    list.querySelectorAll(':scope > .card').forEach(card=>{
      const title=card.querySelector('div[style*="font-size:16px"]')?.textContent?.trim() || '';
      const dateText=card.querySelector('div[style*="font-size:13px"]')?.textContent || '';
      const dm=dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      let matches=all.filter(e=>e.titel===title);
      if(dm)matches=matches.filter(e=>e.datum===dm[3]+'-'+dm[2]+'-'+dm[1]);
      if(matches.length===1)card.dataset.kalenderId=String(matches[0].id);
    });
  }

  function install(){
    installCapture();
    restoreHiddenDashboardEntries();
    markList();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(install,150));
  }else{
    setTimeout(install,150);
  }
  setInterval(install,1000);
  console.log('Kalender Interaction Fix v2 geladen');
})();
