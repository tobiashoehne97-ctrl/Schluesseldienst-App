/* Notdienst Save Fix v3
   Ersetzt alle vorherigen saveNotdienst-Wrapper durch eine einzige, direkte Save-Funktion.
   Verhindert Call-Stack-Rekursion und speichert den Einsatz direkt in Supabase bzw. lokal.
*/
(function(){
  if(window.__ndSaveFixV3)return;
  window.__ndSaveFixV3=true;

  const pad2=v=>String(v).padStart(2,'0');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`};
  const nowTime=()=>{const d=new Date();return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`};
  const entries=()=>window.AppData?.kalender?.eintraege||[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function saveDirect(startNavigation){
    const get=id=>document.getElementById(id);
    const datum=get('nd_datum')?.value||today();
    const uhrzeit=get('nd_uhrzeit')?.value||nowTime();
    const vorname=get('nd_vorname')?.value?.trim()||'';
    const nachname=get('nd_nachname')?.value?.trim()||'';
    const telefon=get('nd_telefon')?.value?.trim()||'';
    const strasse=get('nd_strasse')?.value?.trim()||'';
    const plz=get('nd_plz')?.value?.trim()||'';
    const ort=get('nd_ort')?.value?.trim()||'';
    const beschreibung=get('nd_beschreibung')?.value?.trim()||'';
    const mitarbeiter=get('nd_mitarbeiter')?.value||'';
    const normalerTermin=!!get('nd_normaler_termin')?.checked;
    const typ=normalerTermin?'termin':'notdienst';
    const selected=window.selectedNotdienstType||'Türöffnung';

    if(!vorname&&!nachname){alert('Bitte mindestens Vor- oder Nachname des Kunden eingeben.');return null;}

    const entry={
      titel:[selected,vorname,nachname].filter(Boolean).join(' – ')||'Notfalleinsatz',
      datum,
      von:uhrzeit?uhrzeit+':00':null,
      bis:null,
      typ,
      status:normalerTermin?'geplant':'notdienst',
      vorname,
      nachname,
      telefonnummer:telefon,
      strasse,
      hausnummer:null,
      postleitzahl:plz,
      ort,
      beschreibung:beschreibung?('[NOTFALL] '+beschreibung):'[NOTFALL] '+selected,
      mitarbeiter,
      regiebericht:null
    };

    try{
      let created=null;
      if(window.supabaseReady&&window.supabaseClient){
        const {data,error}=await window.supabaseClient.from('kalender_eintraege').insert(entry).select().single();
        if(error)throw error;
        created=data||entry;
        if(!created.id)created.id='LOCAL-'+Date.now();
      }else{
        created={...entry,id:'LOCAL-'+Date.now()};
      }

      window.AppData.kalender=window.AppData.kalender||{eintraege:[],letzterIndex:0};
      window.AppData.kalender.eintraege=entries().filter(e=>String(e.id)!==String(created.id));
      window.AppData.kalender.eintraege.push(created);
      window.AppData.kalender.letzterIndex=(window.AppData.kalender.letzterIndex||0)+1;
      if(String(created.id).startsWith('LOCAL-')&&typeof window.saveAppData==='function')window.saveAppData();

      if(typeof window.renderKalender==='function')window.renderKalender();
      if(typeof window.renderDashboardWeek==='function')window.renderDashboardWeek();
      if(typeof window.renderNotdienst==='function')window.renderNotdienst();

      document.getElementById('notdienstForm')?.classList.add('hidden');
      document.getElementById('notdienstStart')?.classList.remove('hidden');

      if(normalerTermin){
        alert('Termin wurde gespeichert.');
        return created;
      }

      if(startNavigation){
        const t=JSON.parse(localStorage.getItem('schluesseldienst-notdienst-zeiten-v5')||'{}');
        t[created.id]=t[created.id]||{};
        if(!t[created.id].fahrtStart)t[created.id].fahrtStart=new Date().toISOString();
        localStorage.setItem('schluesseldienst-notdienst-zeiten-v5',JSON.stringify(t));

        if(typeof window.openNotdienstNavigation==='function'){
          window.openNotdienstNavigation(created.id);
        }
        if(typeof window.persistNotdienstStartStatus==='function'){
          await window.persistNotdienstStartStatus(created.id);
        }else{
          if(created)created.status='unterwegs';
          if(window.supabaseReady&&window.supabaseClient&&!String(created.id).startsWith('LOCAL-')){
            const r=await window.supabaseClient.from('kalender_eintraege').update({status:'unterwegs'}).eq('id',created.id);
            if(r.error)console.warn('Unterwegs-Status konnte nicht gespeichert werden',r.error);
          }else if(typeof window.saveAppData==='function')window.saveAppData();
        }
        if(typeof window.renderNotdienst==='function')window.renderNotdienst();
        if(typeof window.startNotdienstWorkflow==='function')window.startNotdienstWorkflow(created.id,false);
      }else{
        alert('Notfalleinsatz wurde gespeichert.');
      }
      return created;
    }catch(err){
      console.error('Notdienst Save Fix v3:',err);
      alert('Der Notfalleinsatz konnte nicht gespeichert werden:\n'+(err?.message||String(err)));
      return null;
    }
  }

  window.saveNotdienst=function(startNavigation=false){return saveDirect(!!startNavigation)};
  console.log('Notdienst Save Fix v3 geladen – direkte Speicherung aktiv');
})();
