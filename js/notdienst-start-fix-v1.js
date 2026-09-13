/* Notdienst Start Fix v1
   Der Button „Speichern & Navi starten“ speichert den Einsatz und startet
   unmittelbar den Notdienst-Workflow im Status „Unterwegs“.
*/
(function(){
  if(window.__ndStartFixV1)return;
  window.__ndStartFixV1=true;

  const KEY='schluesseldienst-notdienst-zeiten-v5';
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function getEntries(){return window.AppData?.kalender?.eintraege||[]}

  async function persistStatus(id,status){
    try{
      const e=getEntries().find(x=>String(x.id)===String(id));
      if(e)e.status=status;
      if(window.supabaseReady&&window.supabaseClient&&!String(id).startsWith('LOCAL-')){
        const r=await window.supabaseClient.from('kalender_eintraege').update({status}).eq('id',id);
        if(r.error)throw r.error;
      }else if(typeof window.saveAppData==='function'){
        window.saveAppData();
      }
    }catch(err){console.warn('Notdienst-Start: Status konnte nicht gespeichert werden',err)}
  }

  function ensureModal(){
    if(document.getElementById('ndWorkflowModal'))return;
    const m=document.createElement('div');
    m.id='ndWorkflowModal';
    m.innerHTML='<div class="nd-wf" id="ndWorkflowInner"></div>';
    document.body.appendChild(m);
  }

  function startTravel(id){
    const e=getEntries().find(x=>String(x.id)===String(id));
    if(!e)return;
    ensureModal();
    const host=document.getElementById('ndWorkflowInner');
    const times=read(KEY,{});
    const all=times[id]||{};
    if(!all.fahrtStart)all.fahrtStart=new Date().toISOString();
    write(KEY,{...times,[id]:all});
    document.getElementById('ndWorkflowModal')?.classList.add('open');

    const render=()=>{
      const t=read(KEY,{})[id]||{};
      const elapsed=Math.max(0,new Date()-new Date(t.fahrtStart));
      const min=Math.floor(elapsed/60000),h=Math.floor(min/60),r=min%60;
      const duration=`${h} Std. ${String(r).padStart(2,'0')} Min.`;
      const customer=[e.vorname,e.nachname].filter(Boolean).join(' ')||'Kunde';
      const address=[[e.strasse,e.hausnummer].filter(Boolean).join(' '),[e.postleitzahl,e.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      host.innerHTML=`<div class="nd-wf-top"><div><div class="nd-wf-status">🚗 Unterwegs</div><h2>${esc(e.titel||'Notdiensteinsatz')}</h2><div class="nd-wf-sub">Fahrt zum Kunden – Zeit läuft seit Einsatzbeginn.</div></div><button class="nd-wf-close" onclick="window.closeNdWorkflow()">×</button></div><div class="nd-wf-steps"><div class="nd-wf-step active"></div><div class="nd-wf-step"></div><div class="nd-wf-step"></div></div><div class="nd-wf-clock"><div class="time" id="ndWfTimer">${duration}</div><div class="label">Fahrtdauer</div></div><div class="nd-wf-info"><strong>${esc(customer)}</strong><span>📍 ${esc(address||'Keine Adresse')}<br>📞 ${esc(e.telefonnummer||'–')}</span></div><button class="nd-wf-btn nd-wf-success" onclick="window.ndArrived('${esc(id)}')">📍 Angekommen – Zeitstempel setzen</button>`;
    };
    render();
    clearInterval(window.__ndStartFixTimer);
    window.__ndStartFixTimer=setInterval(()=>{
      const t=read(KEY,{})[id]||{};
      const el=document.getElementById('ndWfTimer');
      if(!el||!t.fahrtStart)return;
      const elapsed=Math.max(0,new Date()-new Date(t.fahrtStart));
      const min=Math.floor(elapsed/60000),h=Math.floor(min/60),r=min%60;
      el.textContent=`${h} Std. ${String(r).padStart(2,'0')} Min.`;
    },1000);
  }

  const originalSave=window.saveNotdienst;
  if(typeof originalSave!=='function'){
    console.warn('Notdienst Start Fix: saveNotdienst nicht gefunden.');
    return;
  }

  window.saveNotdienst=async function(startNavigation=false){
    if(!startNavigation)return originalSave(false);

    const before=new Set(getEntries().map(e=>String(e.id)));
    await originalSave(false);
    await wait(250);

    let created=getEntries().find(e=>!before.has(String(e.id))&&e.typ==='notdienst');
    if(!created){
      const datum=document.getElementById('nd_datum')?.value;
      const uhr=document.getElementById('nd_uhrzeit')?.value;
      const vor=document.getElementById('nd_vorname')?.value?.trim()||'';
      const nach=document.getElementById('nd_nachname')?.value?.trim()||'';
      created=getEntries().filter(e=>e.typ==='notdienst').find(e=>e.datum===datum&&String(e.von||'').startsWith(uhr||'')&&(e.vorname||'')===vor&&(e.nachname||'')===nach);
    }
    if(!created){
      console.warn('Notdienst Start Fix: neuer Einsatz konnte nicht ermittelt werden.');
      return;
    }
    await persistStatus(created.id,'unterwegs');
    if(typeof window.renderNotdienst==='function')window.renderNotdienst();
    startTravel(created.id);
  };

  console.log('Notdienst Start Fix v1 geladen');
})();
