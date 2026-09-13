/* Notdienst Workflow Fix v2 – Material im Vor-Ort-Schritt wie im normalen Termin */
(function(){
  const KEY='schluesseldienst-notdienst-zeiten-v5';
  const CAT='schluesseldienst-produkte-v2';
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Math.max(0,Number(String(v??'').replace(',','.'))||0);
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  function install(){
    if(window.__ndWorkflowFixV2)return;
    window.__ndWorkflowFixV2=true;
    window.ndArrived=async function(id){
      const all=read(KEY,{});all[id]=all[id]||{};
      const now=new Date().toISOString();
      if(!all[id].angekommen)all[id].angekommen=now;
      if(!all[id].vor_ort)all[id].vor_ort=now;
      if(!all[id].arbeitStart)all[id].arbeitStart=now;
      all[id].arbeit='arbeit';
      write(KEY,all);
      const e=(window.AppData?.kalender?.eintraege||[]).find(x=>String(x.id)===String(id));
      if(e)e.status='vor_ort';
      try{
        if(window.supabaseReady&&window.supabaseClient&&!String(id).startsWith('LOCAL-')){
          const r=await window.supabaseClient.from('kalender_eintraege').update({status:'vor_ort'}).eq('id',id);
          if(r.error)throw r.error;
        }else if(typeof window.saveAppData==='function')window.saveAppData();
      }catch(err){console.warn('Status Vor Ort konnte nicht gespeichert werden',err)}
      if(typeof window.renderNotdienst==='function')window.renderNotdienst();
      renderWork(id);
    };
  }

  function renderWork(id){
    const e=(window.AppData?.kalender?.eintraege||[]).find(x=>String(x.id)===String(id));
    if(!e)return;
    const t=read(KEY,{})[id]||{};
    const fmt=t=>t?new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'–';
    const dur=(a,b)=>a&&b?Math.max(0,new Date(b)-new Date(a)):0;
    const dtext=ms=>{const m=Math.floor(ms/60000),h=Math.floor(m/60),r=m%60;return `${h} Std. ${String(r).padStart(2,'0')} Min.`};
    const host=document.getElementById('ndWorkflowInner');if(!host)return;
    const saved=read('schluesseldienst-notdienst-abrechnung-v2',{})[id]||{};
    const mats=saved.material||[];
    host.innerHTML=`<div class="nd-wf-top"><div><div class="nd-wf-status">📍 Vor Ort</div><h2>Einsatz dokumentieren</h2><div class="nd-wf-sub">Was wurde vorgefunden und was wurde durchgeführt?</div></div><button class="nd-wf-close" onclick="window.closeNdWorkflow()">×</button></div><div class="nd-wf-steps"><div class="nd-wf-step done"></div><div class="nd-wf-step active"></div><div class="nd-wf-step"></div></div><div class="nd-wf-summary"><div><small>Fahrt gestartet</small><strong>${fmt(t.fahrtStart)}</strong></div><div><small>Angekommen</small><strong>${fmt(t.angekommen)}</strong></div><div><small>Fahrtdauer</small><strong>${dtext(dur(t.fahrtStart,t.angekommen))}</strong></div><div><small>Arbeitsbeginn</small><strong>${fmt(t.arbeitStart)}</strong></div></div><div class="nd-wf-field"><label>Was wurde vorgefunden?</label><textarea id="ndWfVorgefunden" placeholder="z. B. Schloss defekt, Schlüssel abgebrochen ...">${esc(t.vorgefunden||'')}</textarea></div><div class="nd-wf-field"><label>Was wurde durchgeführt?</label><textarea id="ndWfDurchgefuehrt" placeholder="z. B. Schloss ausgebaut und ersetzt ...">${esc(t.durchgefuehrt||'')}</textarea></div><div class="nd-wf-field"><label>Material / Artikel</label><div id="ndWfMaterialRows">${mats.map(materialRow).join('')}</div><button type="button" class="nd-wf-sign-actions nd-wf-add-material" onclick="window.ndWfAddMaterial()" style="width:100%;margin-top:8px">＋ Material hinzufügen</button></div><button class="nd-wf-btn nd-wf-primary" onclick="window.ndContinueToClose('${esc(id)}')">Einsatz abschließen →</button>`;
    if(!document.getElementById('ndWfMaterialStyle')){const style=document.createElement('style');style.id='ndWfMaterialStyle';style.textContent=`#ndWfMaterialRows .nd-wf-mat-row{display:grid;grid-template-columns:minmax(0,1fr) 78px 105px 42px;gap:8px;margin:8px 0}#ndWfMaterialRows input{width:100%;box-sizing:border-box;background:#17374f;border:1px solid #315a7c;color:#eef8ff;border-radius:10px;padding:11px;font-size:15px}#ndWfMaterialRows .nd-wf-mat-del{border:1px solid #315a7c;background:#17374f;color:#eaf5ff;border-radius:10px;font-size:18px}@media(max-width:600px){#ndWfMaterialRows .nd-wf-mat-row{grid-template-columns:minmax(0,1fr) 65px 88px 38px}}`;document.head.appendChild(style)}
  }

  function materialRow(m){return `<div class="nd-wf-mat-row"><input class="nd-wf-mat-name" placeholder="Material / Artikel" value="${esc(m.name||'')}"><input class="nd-wf-mat-qty" type="number" min="0" step="1" inputmode="numeric" value="${num(m.menge)||1}"><input class="nd-wf-mat-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Preis €" value="${m.preis!==undefined?num(m.preis).toFixed(2):''}"><button type="button" class="nd-wf-mat-del" onclick="this.parentNode.remove()">✕</button></div>`}
  window.ndWfAddMaterial=function(){const host=document.getElementById('ndWfMaterialRows');if(host)host.insertAdjacentHTML('beforeend',materialRow({menge:1,preis:''}))};
  window.openNdWork=function(id){
    const e=(window.AppData?.kalender?.eintraege||[]).find(x=>String(x.id)===String(id));if(!e)return;
    if(typeof window.modal==='function')window.modal();
    const m=document.getElementById('ndWorkflowModal');if(m)m.classList.add('open');
    renderWork(id);
  };
  const originalContinue=window.ndContinueToClose;
  window.ndContinueToClose=function(id){
    const t=read(KEY,{})[id]||{};
    t.vorgefunden=document.getElementById('ndWfVorgefunden')?.value.trim()||'';
    t.durchgefuehrt=document.getElementById('ndWfDurchgefuehrt')?.value.trim()||'';
    const rows=[...document.querySelectorAll('#ndWfMaterialRows .nd-wf-mat-row')];
    const old=read('schluesseldienst-notdienst-abrechnung-v2',{});const d=old[id]||{};
    d.material=rows.map(r=>({name:r.querySelector('.nd-wf-mat-name')?.value.trim()||'',menge:num(r.querySelector('.nd-wf-mat-qty')?.value)||1,preis:num(r.querySelector('.nd-wf-mat-price')?.value)})).filter(x=>x.name||x.preis);
    old[id]=d;write('schluesseldienst-notdienst-abrechnung-v2',old);write(KEY,{...read(KEY,{}),[id]:t});
    if(typeof originalContinue==='function')return originalContinue(id);
  };
  install();
})();
