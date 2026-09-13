/* Notdienst – Materialfeld im Arbeitsschritt wie im normalen Regiebericht */
(function(){
  const KEY='schluesseldienst-notdienst-zeiten-v5';
  const STORE='schluesseldienst-notdienst-abrechnung-v2';
  const CATALOG='schluesseldienst-produkte-v2';
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const num=v=>Math.max(0,Number(String(v??'').replace(',','.'))||0);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const euro=v=>num(v).toFixed(2).replace('.',',');

  function products(){return Array.isArray(window.nd2Products)&&window.nd2Products.length?window.nd2Products:read(CATALOG,[])}

  function sync(id){
    const rows=[...document.querySelectorAll('#ndWfMaterialRows .nd-wf-mat-row')].map(r=>({
      name:r.querySelector('.nd-wf-mat-name')?.value.trim()||'',
      menge:num(r.querySelector('.nd-wf-mat-qty')?.value)||1,
      preis:num(r.querySelector('.nd-wf-mat-price')?.value)
    })).filter(x=>x.name||x.preis);
    const all=read(KEY,{});all[id]=all[id]||{};
    all[id].material=rows;
    all[id].materialText=rows.map(x=>`${x.menge} x ${x.name}${x.preis?' – '+euro(x.preis)+' €':''}`).join('\n');
    write(KEY,all);
    const hidden=document.getElementById('ndWfMaterial');
    if(hidden)hidden.value=all[id].materialText||'';
  }

  function addRow(host,data={}){
    const row=document.createElement('div');row.className='nd-wf-mat-row';
    row.innerHTML=`<input class="nd-wf-mat-name" list="ndWfMaterialCatalog" placeholder="Material / Artikel" value="${esc(data.name||'')}"><input class="nd-wf-mat-qty" type="number" min="0" step="1" inputmode="decimal" value="${data.menge||1}"><input class="nd-wf-mat-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Preis €" value="${data.preis!==undefined?esc(data.preis):''}"><button type="button" class="nd-wf-mat-del" aria-label="Material löschen">✕</button>`;
    const name=row.querySelector('.nd-wf-mat-name'),price=row.querySelector('.nd-wf-mat-price');
    name.addEventListener('input',()=>{
      const p=products().find(x=>String(x.name).trim().toLowerCase()===String(name.value).trim().toLowerCase());
      if(p)price.value=euro(p.preis);
      sync(host.dataset.id);
    });
    row.querySelectorAll('input').forEach(x=>x.addEventListener('change',()=>sync(host.dataset.id)));
    row.querySelector('.nd-wf-mat-del').addEventListener('click',()=>{row.remove();sync(host.dataset.id)});
    host.appendChild(row);
  }

  function replace(){
    const old=document.getElementById('ndWfMaterial');
    if(!old||old.dataset.materialFix==='1')return;
    const field=old.closest('.nd-wf-field');
    if(!field)return;
    const id=window.__nd2Id||window.__ndWorkflowActiveId||'';
    const times=read(KEY,{})[id]||{};
    const saved=Array.isArray(times.material)?times.material:[];
    const initialText=old.value||times.materialText||'';
    old.style.display='none';
    old.dataset.materialFix='1';

    const title=field.querySelector('label');
    if(title)title.textContent='Material / Artikel';
    const wrap=document.createElement('div');wrap.id='ndWfMaterialRows';wrap.dataset.id=id;
    const list=document.createElement('datalist');list.id='ndWfMaterialCatalog';
    list.innerHTML=products().map(p=>`<option value="${esc(p.name)}">${esc(p.name)} – ${euro(p.preis)} €</option>`).join('');
    field.insertBefore(list,old);
    field.insertBefore(wrap,old);
    const btn=document.createElement('button');btn.type='button';btn.className='nd-wf-sign-actions nd-wf-mat-add';btn.style.width='100%';btn.style.marginTop='8px';btn.innerHTML='＋ Material hinzufügen';
    btn.onclick=()=>{addRow(wrap);sync(id)};
    field.insertBefore(btn,old);

    if(saved.length)saved.forEach(x=>addRow(wrap,x));
    else if(initialText)addRow(wrap,{name:initialText,menge:1,preis:0});
    else addRow(wrap,{menge:1,preis:''});
    sync(id);
  }

  function styles(){
    if(document.getElementById('ndWfMaterialFixStyle'))return;
    const s=document.createElement('style');s.id='ndWfMaterialFixStyle';s.textContent=`#ndWfMaterialRows{width:100%}.nd-wf-mat-row{display:grid;grid-template-columns:minmax(0,1fr) 82px 105px 42px;gap:8px;margin:8px 0}.nd-wf-mat-row input{width:100%;box-sizing:border-box;background:#17374f;border:1px solid #315a7c;color:#eef8ff;border-radius:12px;padding:12px;font-size:16px;min-width:0}.nd-wf-mat-del{border:1px solid #315a7c;background:#17374f;color:#eaf5ff;border-radius:12px;font-weight:800}.nd-wf-mat-add{box-sizing:border-box}@media(max-width:600px){.nd-wf-mat-row{grid-template-columns:minmax(0,1fr) 72px 90px 40px}.nd-wf-mat-row input{font-size:15px;padding:11px 9px}}`;
    document.head.appendChild(s);
  }

  styles();
  const observer=new MutationObserver(()=>replace());
  observer.observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{styles();replace()},1000);
})();
