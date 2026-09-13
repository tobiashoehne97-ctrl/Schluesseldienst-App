/* Notdienst Material – gleiche Eingabe wie normale Terminbearbeitung
   Material / Artikel + Menge + Preis.
   Der gemeinsame Produktkatalog dient als Autovervollständigung und setzt den Preis automatisch.
*/
(function(){
  const STORE='schluesseldienst-produkte-v2';
  const DATA='schluesseldienst-notdienst-abrechnung-v2';
  const PRICE='schluesseldienst-notdienst-preise-v2';
  const WF='schluesseldienst-notdienst-zeiten-v5';

  const N=v=>Math.max(0,Number(String(v??'').replace(',','.'))||0);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const euro=v=>N(v).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const products=()=>read(STORE,[]).filter(p=>p&&p.aktiv!==false);

  function ensureDatalist(){
    let dl=document.getElementById('nd2MaterialCatalog');
    if(!dl){dl=document.createElement('datalist');dl.id='nd2MaterialCatalog';document.body.appendChild(dl)}
    dl.innerHTML=products().map(p=>`<option value="${esc(p.name)}">${esc(p.name)} – ${euro(p.preis)} / ${esc(p.einheit||'Stk')}</option>`).join('');
  }

  function makeRow(old){
    if(!old || old.dataset.ndMaterialFixed==='1') return;
    const select=old.querySelector('select');
    const qty=old.querySelector('.nd-menge');
    const price=old.querySelector('.nd-preis');
    let productId=select?.value||old.dataset.productId||'';
    let p=products().find(x=>String(x.id)===String(productId));
    const oldName=p?.name||old.dataset.materialName||'';
    const oldQty=N(qty?.value)||1;
    const oldPrice=N(price?.value);
    old.dataset.ndMaterialFixed='1';
    old.innerHTML=`<input class="nd-material-name" list="nd2MaterialCatalog" autocomplete="off" placeholder="Material / Artikel" value="${esc(oldName)}" data-product-id="${esc(productId)}"><input class="nd-menge" type="number" min="0" step="1" inputmode="numeric" value="${oldQty}"><input class="nd-preis" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Preis €" value="${oldPrice||''}"><button type="button" class="btnD" onclick="this.parentNode.remove();window.nd2Recalc()">✕</button>`;
    const name=old.querySelector('.nd-material-name');
    name.addEventListener('input',()=>{
      const val=name.value.trim().toLowerCase();
      const prod=products().find(x=>String(x.name||'').trim().toLowerCase()===val);
      name.dataset.productId=prod?.id||'';
      if(prod){old.querySelector('.nd-preis').value=N(prod.preis).toFixed(2)}
      window.nd2Recalc();
    });
    old.querySelector('.nd-menge').addEventListener('input',()=>window.nd2Recalc());
    old.querySelector('.nd-preis').addEventListener('input',()=>window.nd2Recalc());
  }

  function fixRows(){
    ensureDatalist();
    document.querySelectorAll('#nd2MatRows .nd-mat-row').forEach(makeRow);
  }

  function recalc(){
    const rows=[...document.querySelectorAll('#nd2MatRows .nd-mat-row')];
    const rs=rows.map(r=>{
      const name=r.querySelector('.nd-material-name');
      const prod=products().find(x=>String(x.id)===String(name?.dataset.productId||'')) || products().find(x=>String(x.name||'').trim().toLowerCase()===String(name?.value||'').trim().toLowerCase());
      return {productId:prod?.id||'',name:name?.value?.trim()||'',menge:N(r.querySelector('.nd-menge')?.value)||1,preis:N(r.querySelector('.nd-preis')?.value),einheit:prod?.einheit||'Stk'};
    });
    window.__nd2Material=rs;
    const id=window.__nd2Id;
    if(id){const all=read(DATA,{});all[id]={...(all[id]||{}),material:rs};localStorage.setItem(DATA,JSON.stringify(all));}

    const e=window.__nd2Entry;
    if(!e)return;
    const p={pauschale:0,inklKm:10,kmPreis:0,ausserhalb:0,samstag:0,sonntagFeiertag:0,mwst:19,geschaeftVon:'08:00',geschaeftBis:'18:00',...read(PRICE,{})};
    const dt=new Date(`${e.datum}T${e.von||'00:00'}`),day=dt.getDay(),mins=dt.getHours()*60+dt.getMinutes();
    const a=N(String(p.geschaeftVon).slice(0,2))*60+N(String(p.geschaeftVon).slice(3,5));
    const b=N(String(p.geschaeftBis).slice(0,2))*60+N(String(p.geschaeftBis).slice(3,5));
    const mat=rs.reduce((s,x)=>s+N(x.menge)*N(x.preis),0);
    const km=N(document.getElementById('nd2Km')?.value),dist=Math.max(0,km-N(p.inklKm))*N(p.kmPreis);
    const out=(mins<a||mins>b)?N(p.ausserhalb):0,sat=day===6?N(p.samstag):0,sun=(day===0||document.getElementById('nd2Holiday')?.checked)?N(p.sonntagFeiertag):0;
    const net=N(p.pauschale)+dist+out+sat+sun+mat,mw=net*N(p.mwst)/100,total=net+mw;
    const totalEl=document.getElementById('nd2Total');if(totalEl)totalEl.textContent=euro(total);
    const br=document.getElementById('nd2Break');if(br)br.textContent=`Pauschale ${euro(p.pauschale)} · Entfernung ${euro(dist)} · Außerhalb ${euro(out)} · Samstag ${euro(sat)} · Sonntag/Feiertag ${euro(sun)} · Material ${euro(mat)} · MwSt. ${euro(mw)}`;
  }

  function add(){
    const w=document.getElementById('nd2MatRows');if(!w)return;
    const d=document.createElement('div');d.className='nd-mat-row';d.innerHTML=`<input class="nd-material-name" list="nd2MaterialCatalog" autocomplete="off" placeholder="Material / Artikel" value="" data-product-id=""><input class="nd-menge" type="number" min="0" step="1" inputmode="numeric" value="1"><input class="nd-preis" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Preis €" value=""><button type="button" class="btnD" onclick="this.parentNode.remove();window.nd2Recalc()">✕</button>`;w.appendChild(d);makeRow(d);d.querySelector('.nd-material-name')?.focus();
  }

  function install(){
    ensureDatalist();
    const oldAdd=window.nd2AddMat;
    window.nd2AddMat=add;
    window.nd2Recalc=recalc;
    fixRows();
    const host=document.getElementById('ndWorkflowInner');
    if(host && !host.dataset.ndMaterialObserver){
      host.dataset.ndMaterialObserver='1';
      new MutationObserver(()=>fixRows()).observe(host,{childList:true,subtree:true});
    }
    setInterval(()=>{if(document.getElementById('nd2MatRows')){ensureDatalist();fixRows()}},1500);
    console.log('Notdienst-Material-Fix geladen: normale Terminansicht');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
