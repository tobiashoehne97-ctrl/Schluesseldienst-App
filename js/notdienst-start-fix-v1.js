/* Notdienst Start / Access Fix v2
   Startet den Einsatz korrekt und macht laufende Einsätze jederzeit wieder öffnbar.
*/
(function(){
  if(window.__ndStartFixV2)return;
  window.__ndStartFixV2=true;

  const KEY='schluesseldienst-notdienst-zeiten-v5';
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const entries=()=>window.AppData?.kalender?.eintraege||[];

  async function persistStatus(id,status){
    const e=entries().find(x=>String(x.id)===String(id));
    if(e)e.status=status;
    try{
      if(window.supabaseReady&&window.supabaseClient&&!String(id).startsWith('LOCAL-')){
        const r=await window.supabaseClient.from('kalender_eintraege').update({status}).eq('id',id);
        if(r.error)throw r.error;
      }else if(typeof window.saveAppData==='function')window.saveAppData();
    }catch(err){console.warn('Notdienst-Status konnte nicht gespeichert werden',err)}
  }

  function ensureModal(){
    if(document.getElementById('ndWorkflowModal'))return;
    const m=document.createElement('div');m.id='ndWorkflowModal';m.innerHTML='<div class="nd-wf" id="ndWorkflowInner"></div>';document.body.appendChild(m);
  }

  function startTravel(id){
    const e=entries().find(x=>String(x.id)===String(id));if(!e)return;
    if(typeof window.startNotdienstWorkflow==='function'){
      window.startNotdienstWorkflow(id,false);
      return;
    }
    ensureModal();
    const t=read(KEY,{})[id]||{};if(!t.fahrtStart)t.fahrtStart=new Date().toISOString();write(KEY,{...read(KEY,{}),[id]:t});
    document.getElementById('ndWorkflowModal')?.classList.add('open');
  }

  const originalSave=window.saveNotdienst;
  if(typeof originalSave==='function'){
    window.saveNotdienst=async function(startNavigation=false){
      if(!startNavigation)return originalSave(false);
      const before=new Set(entries().map(e=>String(e.id)));
      await originalSave(false);
      await wait(350);
      let created=entries().find(e=>!before.has(String(e.id))&&e.typ==='notdienst');
      if(!created){
        const datum=document.getElementById('nd_datum')?.value||'',uhr=document.getElementById('nd_uhrzeit')?.value||'',vor=document.getElementById('nd_vorname')?.value?.trim()||'',nach=document.getElementById('nd_nachname')?.value?.trim()||'';
        created=entries().filter(e=>e.typ==='notdienst').find(e=>e.datum===datum&&String(e.von||'').startsWith(uhr)&&(e.vorname||'')===vor&&(e.nachname||'')===nach);
      }
      if(!created){console.warn('Notdienst Start: Einsatz konnte nicht ermittelt werden.');return;}
      await persistStatus(created.id,'unterwegs');
      if(typeof window.renderNotdienst==='function')window.renderNotdienst();
      startTravel(created.id);
    };
  }

  function openExisting(id){
    const e=entries().find(x=>String(x.id)===String(id));if(!e)return;
    const status=e.status||'notdienst';
    if(status==='vor_ort' || status==='arbeit'){
      if(typeof window.openNdWork==='function')window.openNdWork(id);
      return;
    }
    if(status==='unterwegs'){
      startTravel(id);
      return;
    }
    if(typeof window.startNotdienstWorkflow==='function')window.startNotdienstWorkflow(id,false);
  }
  window.openExistingNotdienst=openExisting;

  /* Vor-Ort-Status soll nicht mehr den Regiebericht öffnen, sondern die laufende Arbeitsmaske. */
  const originalStatus=window.updateNotdienstStatus;
  if(typeof originalStatus==='function'){
    window.updateNotdienstStatus=async function(id,status){
      if(status!=='vor_ort')return originalStatus(id,status);
      await persistStatus(id,'vor_ort');
      if(typeof window.renderNotdienst==='function')window.renderNotdienst();
      openExisting(id);
    };
  }

  /* Nach jedem Rendern einen direkten Zugriff auf den laufenden Einsatz anbieten. */
  const originalRender=window.renderNotdienst;
  if(typeof originalRender==='function' && !window.__ndRenderPatched){
    window.__ndRenderPatched=true;
    window.renderNotdienst=function(){
      const result=originalRender.apply(this,arguments);
      setTimeout(()=>{
        const active=entries().filter(e=>e.typ==='notdienst'&&e.status!=='erledigt').sort((a,b)=>((b.datum||'')+(b.von||'')).localeCompare((a.datum||'')+(a.von||'')));
        document.querySelectorAll('#notdienstAktiv .notdienst-active-card').forEach((card,i)=>{
          const e=active[i];if(!e)return;
          const actions=card.querySelector('.notdienst-card-actions');if(!actions)return;
          if(actions.querySelector('.nd-open-existing'))return;
          const b=document.createElement('button');b.type='button';b.className='btnP nd-open-existing';b.textContent=e.status==='unterwegs'?'▶ Einsatz öffnen':'▶ Einsatz öffnen';b.onclick=()=>openExisting(e.id);actions.prepend(b);
        });
      },0);
      return result;
    };
  }

  console.log('Notdienst Start / Access Fix v2 geladen');
})();
