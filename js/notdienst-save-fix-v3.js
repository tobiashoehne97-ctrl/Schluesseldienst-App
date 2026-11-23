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
  function normalizeKalenderEntryForNotdienst(row){
    return {
      ...row,
      id:row.id,
      von:row.von?String(row.von).slice(0,5):'',
      bis:row.bis?String(row.bis).slice(0,5):'',
      typ:row.typ||'notdienst',
      status:row.status||'notdienst'
    };
  }

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
        const {data,error}=await window.supabaseClient
          .from('kalender_eintraege')
          .insert(entry)
          .select('*')
          .single();
        if(error)throw error;
        // Ein erfolgreicher Insert ohne zurückgelieferte ID ist keine
        // bestätigte Speicherung. Sonst würde der Einsatz nur temporär
        // angezeigt und beim nächsten Reload aus der Datenbank fehlen.
        if(!data || !data.id){
          throw new Error('Die Datenbank hat den Einsatz nicht mit einer gültigen ID bestätigt. Bitte Datenbank-Berechtigungen (INSERT/SELECT) prüfen. Der Einsatz wurde nicht als gespeichert markiert.');
        }
        // Read-after-write: Nicht nur die Insert-Antwort, sondern auch
        // ein separater Abruf muss den Datensatz unter derselben ID liefern.
        // So erkennen wir fehlende SELECT-Rechte oder einen nicht dauerhaft
        // lesbaren Datensatz, bevor der Dialog geschlossen wird.
        const verify=await window.supabaseClient
          .from('kalender_eintraege')
          .select('*')
          .eq('id',data.id)
          .maybeSingle();
        if(verify.error)throw verify.error;
        if(!verify.data || String(verify.data.id)!==String(data.id)){
          throw new Error('Der Einsatz wurde beim Speichern zurückgemeldet, ist aber anschließend nicht mehr aus der Datenbank abrufbar. Bitte die SELECT-Richtlinie der Tabelle kalender_eintraege prüfen. Das Formular bleibt geöffnet.');
        }
        created=normalizeKalenderEntryForNotdienst(verify.data);
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

      if(normalerTermin){
        get('notdienstForm')?.classList.add('hidden');
        get('notdienstStart')?.classList.remove('hidden');
        alert('Termin wurde gespeichert.');
        return created;
      }

      if(startNavigation){
        created.status='unterwegs';
        if(window.supabaseReady&&window.supabaseClient&&!String(created.id).startsWith('LOCAL-')){
          const {data,error}=await window.supabaseClient
            .from('kalender_eintraege')
            .update({status:'unterwegs'})
            .eq('id',created.id)
            .select('id,status')
            .single();
          if(error)throw error;
          if(!data || String(data.id)!==String(created.id) || data.status!=='unterwegs'){
            throw new Error('Der Startstatus „unterwegs“ wurde von der Datenbank nicht bestätigt.');
          }
          created.status='unterwegs';
        }else if(typeof window.saveAppData==='function'){
          created.status='unterwegs';
          window.saveAppData();
        }
        get('notdienstForm')?.classList.add('hidden');
        get('notdienstStart')?.classList.remove('hidden');
        if(typeof window.renderNotdienst==='function')window.renderNotdienst();
        if(typeof window.startNotdienstWorkflow==='function')window.startNotdienstWorkflow(created.id,false);
      }else{
        get('notdienstForm')?.classList.add('hidden');
        get('notdienstStart')?.classList.remove('hidden');
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
