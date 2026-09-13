/* Notdienst Stability Fix v1
   Verhindert die wiederholte Verschachtelung von saveNotdienst-Wrappern.
   Behebt außerdem die robuste Kalender-Löschfunktion.
*/
(function(){
  if(window.__ndStabilityFixV1)return;
  window.__ndStabilityFixV1=true;

  /* Der Workflow prüft saveNotdienst regelmäßig. Der Start-Fix ersetzt diese
     Funktion einmal. Danach darf der Workflow sie nicht immer weiter wrappen. */
  try{
    const current=window.saveNotdienst;
    if(typeof current==='function'){
      const desc=Object.getOwnPropertyDescriptor(window,'saveNotdienst');
      if(!window.__ndSaveNotdienstLocked && (!desc || desc.configurable)){
        let stable=current;
        Object.defineProperty(window,'saveNotdienst',{
          configurable:true,
          enumerable:desc?.enumerable!==false,
          get(){return stable},
          set(v){
            if(typeof v==='function' && v!==stable){
              /* Nach dem Initialisieren der Workflow-Kette keine weitere
                 Verschachtelung zulassen. */
              if(v.__ndAllowReplace===true)stable=v;
              else console.warn('Notdienst: erneutes Wrapping von saveNotdienst verhindert.');
            }
          }
        });
        window.__ndSaveNotdienstLocked=true;
      }
    }
  }catch(err){console.warn('Notdienst Stability: saveNotdienst konnte nicht stabilisiert werden',err)}

  /* Vor-Ort-Zugriff für den bereits vorhandenen Workflow-Fix. */
  if(typeof window.openNdWork!=='function' && typeof window.ndArrived==='function'){
    window.openNdWork=async function(id){
      const m=document.getElementById('ndWorkflowModal');
      if(m)m.classList.add('open');
      await window.ndArrived(id);
    };
  }

  /* Kalender-Löschen ohne Abhängigkeit von der alten Funktion. */
  window.deleteKalenderEntry=async function(id){
    if(!window.confirm('Termin wirklich löschen?'))return;
    const sid=String(id);
    try{
      if(window.supabaseReady&&window.supabaseClient&&!sid.startsWith('LOCAL-')){
        const result=await window.supabaseClient.from('kalender_eintraege').delete().eq('id',id);
        if(result.error)throw result.error;
        /* Prüfen, ob der Datensatz tatsächlich verschwunden ist. Das macht
           fehlende DELETE-RLS-Rechte sofort sichtbar. */
        const check=await window.supabaseClient.from('kalender_eintraege').select('id').eq('id',id).maybeSingle();
        if(check.error && check.error.code!=='PGRST116')throw check.error;
        if(check.data){
          throw new Error('Der Termin konnte nicht gelöscht werden. Bitte die DELETE-Berechtigung der Tabelle kalender_eintraege prüfen.');
        }
        if(typeof window.loadKalenderFromSupabase==='function')await window.loadKalenderFromSupabase();
      }else{
        if(window.AppData?.kalender){
          window.AppData.kalender.eintraege=(window.AppData.kalender.eintraege||[]).filter(e=>String(e.id)!==sid);
          if(typeof window.saveAppData==='function')window.saveAppData();
          if(typeof window.renderKalender==='function')window.renderKalender();
          if(typeof window.renderKalenderWeek==='function')window.renderKalenderWeek();
          if(typeof window.renderDashboardWeek==='function')window.renderDashboardWeek();
        }
      }
    }catch(err){
      console.error('Kalender-Löschen fehlgeschlagen:',err);
      alert('Termin konnte nicht gelöscht werden: '+(err?.message||'Unbekannter Fehler'));
    }
  };

  console.log('Notdienst Stability Fix v1 geladen');
})();
