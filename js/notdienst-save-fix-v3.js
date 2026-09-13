/* Notdienst Save Fix v4
   Direkte Speicherung ohne Wrapper-Kette.
   Wichtig: Die Funktion wird ausdrücklich als erlaubter Ersatz markiert,
   damit ältere Stability-Guards sie einmalig übernehmen können.
*/
(function(){
  if(window.__ndSaveFixV4)return;
  window.__ndSaveFixV4=true;

  const pad=v=>String(v).padStart(2,'0');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
  const timeNow=()=>{const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())}`};
  const get=id=>document.getElementById(id);

  async function saveDirect(startNavigation=false){
    const datum=get('nd_datum')?.value||today();
    const uhrzeit=get('nd_uhrzeit')?.value||timeNow();
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
      telefonnummer:telefon||null,
      strasse:strasse||null,
      hausnummer:null,
      postleitzahl:plz||null,
      ort:ort||null,
      beschreibung:beschreibung?('[NOTFALL] '+beschreibung):'[NOTFALL] '+selected,
      mitarbeiter:mitarbeiter||null,
      regiebericht:null
    };

    try{
      let created;
      if(window.supabaseReady&&window.supabaseClient){
        const {data,error}=await window.supabaseClient.from('kalender_eintraege').insert(entry).select().single();
        if(error)throw error;
        created=data||entry;
      }else{
        created={...entry,id:'LOCAL-'+Date.now()};
      }

      window.AppData=window.AppData||{};
      window.AppData.kalender=window.AppData.kalender||{eintraege:[],letzterIndex:0};
      const list=window.AppData.kalender.eintraege||[];
      window.AppData.kalender.eintraege=[...list.filter(e=>String(e.id)!==String(created.id)),created];
      window.AppData.kalender.letzterIndex=(window.AppData.kalender.letzterIndex||0)+1;
      if(String(created.id).startsWith('LOCAL-')&&typeof window.saveAppData==='function')window.saveAppData();

      if(typeof window.renderKalender==='function')window.renderKalender();
      if(typeof window.renderKalenderWeek==='function')window.renderKalenderWeek();
      if(typeof window.renderDashboardWeek==='function')window.renderDashboardWeek();
      if(typeof window.renderNotdienst==='function')window.renderNotdienst();

      get('notdienstForm')?.classList.add('hidden');
      get('notdienstStart')?.classList.remove('hidden');

      if(normalerTermin){
        alert('Termin wurde gespeichert.');
        return created;
      }

      if(startNavigation){
        created.status='unterwegs';
        if(window.supabaseReady&&window.supabaseClient&&!String(created.id).startsWith('LOCAL-')){
          const {error}=await window.supabaseClient.from('kalender_eintraege').update({status:'unterwegs'}).eq('id',created.id);
          if(error)throw error;
        }else if(typeof window.saveAppData==='function')window.saveAppData();
        if(typeof window.renderNotdienst==='function')window.renderNotdienst();
        if(typeof window.startNotdienstWorkflow==='function')window.startNotdienstWorkflow(created.id,false);
      }else{
        alert('Notfalleinsatz wurde gespeichert.');
      }
      return created;
    }catch(err){
      console.error('Notdienst Save Fix v4:',err);
      alert('Der Notfalleinsatz konnte nicht gespeichert werden:\n'+(err?.message||String(err)));
      return null;
    }
  }

  saveDirect.__ndAllowReplace=true;
  window.saveNotdienst=saveDirect;
  console.log('Notdienst Save Fix v4 geladen – direkte Speicherung aktiv');
})();
