/* Gemeinsame Materialsuche aus der Produktverwaltung (Supabase: public.products). */
(function(){
  const DB=()=>window.supabaseClient;
  let cache=[],loadedAt=0,loading=null;
  const norm=v=>String(v??"").trim().toLocaleLowerCase("de-DE").replace(/\\s+/g," ");
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const euro=v=>Number(v||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
  async function load(force=false){
    if(!force&&cache.length&&Date.now()-loadedAt<30000)return cache;
    if(loading)return loading;
    if(!DB())return cache;
    loading=DB().from("products").select("id,name,article_number,manufacturer,sale_price_gross,active,category").eq("active",true).order("name")
      .then(({data,error})=>{if(error)throw error;cache=data||[];loadedAt=Date.now();return cache})
      .catch(err=>{console.warn("Produktkatalog konnte nicht geladen werden:",err);return cache})
      .finally(()=>loading=null);
    return loading;
  }
  function match(value){
    const q=norm(value);if(!q)return null;
    return cache.find(p=>norm(p.name)===q||norm(p.article_number)===q||norm([p.name,p.article_number].filter(Boolean).join(" "))===q)||null;
  }
  function options(){
    let dl=document.getElementById("sharedProductMaterialList");
    if(!dl){dl=document.createElement("datalist");dl.id="sharedProductMaterialList";document.body.appendChild(dl)}
    dl.innerHTML=cache.map(p=>'<option value="'+esc(p.name)+'">'+esc([p.article_number,p.manufacturer].filter(Boolean).join(" · "))+' – '+esc(euro(p.sale_price_gross))+'</option>').join("");
    return dl.id;
  }
  function bindName(input,priceInput,onSelect){
    if(!input||input.dataset.productCatalogBound==="1")return;
    input.dataset.productCatalogBound="1";
    input.setAttribute("list",options());
    input.setAttribute("autocomplete","off");
    const resolve=async()=>{
      await load();
      options();
      const p=match(input.value);
      if(!p)return;
      input.dataset.productId=p.id;
      if(priceInput)priceInput.value=Number(p.sale_price_gross||0).toFixed(2);
      if(onSelect)onSelect(p);
    };
    input.addEventListener("input",resolve);
    input.addEventListener("change",resolve);
    input.addEventListener("focus",async()=>{await load();input.setAttribute("list",options())});
  }
  window.loadSharedProductCatalog=load;
  window.findSharedProduct=async value=>{await load();return match(value)};
  window.sharedProductEuro=euro;
  function bindService(){
    const name=document.getElementById("service_mat_name"),price=document.getElementById("service_mat_preis");
    if(name&&price)bindName(name,price);
  }
  function bindNotdienst(){
    const amount=document.getElementById("ndV2Material");
    const host=amount?.closest(".nd-wf-field");
    if(!amount||!host||host.dataset.productPickerBound==="1")return;
    host.dataset.productPickerBound="1";
    const label=host.querySelector("label");
    const picker=document.createElement("div");
    picker.className="nd-product-picker";
    picker.style.cssText="margin-bottom:9px";
    picker.innerHTML='<label style="display:block;margin-bottom:5px">Produkt aus Produktverwaltung</label><input id="ndV2MaterialProduct" type="search" placeholder="Produktname oder Artikelnummer suchen …" style="width:100%;box-sizing:border-box">';
    host.insertBefore(picker,amount.parentElement||amount);
    const search=picker.querySelector("input");
    const activeId=window.__ndV2CurrentEntryId;
    if(activeId){
      try{
        const saved=JSON.parse(localStorage.getItem("schluesseldienst-notdienst-abrechnung-v2")||"{}")[activeId]?.materialProdukt;
        if(saved?.name)search.value=saved.name;
      }catch(e){}
    }
    bindName(search,amount,async p=>{
      const qty=1;
      amount.value=(Number(p.sale_price_gross||0)*qty).toFixed(2);
      amount.dispatchEvent(new Event("input",{bubbles:true}));
      const id=window.__ndV2CurrentEntryId;
      if(id){
        const key="schluesseldienst-notdienst-abrechnung-v2";
        let all={};try{all=JSON.parse(localStorage.getItem(key)||"{}")}catch(e){}
        all[id]={...(all[id]||{}),materialProdukt:{id:p.id,name:p.name,article_number:p.article_number||"",preis:Number(p.sale_price_gross||0),menge:qty}};
        localStorage.setItem(key,JSON.stringify(all));
      }
    });
  }
  function install(){
    load().then(options);
    const scan=()=>{bindService();bindNotdienst()};
    scan();
    new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
    document.addEventListener("focusin",e=>{if(e.target?.id==="service_mat_name"||e.target?.id==="ndV2MaterialProduct")load(true).then(options)});
    const original=window.addServiceMaterial;
    if(typeof original==="function"&&!original.__productCatalogWrapped){
      const wrapped=function(){
        const input=document.getElementById("service_mat_name"),p=match(input?.value);
        original.apply(this,arguments);
        if(p&&Array.isArray(window.activeServiceMaterials)&&window.activeServiceMaterials.length){
          const last=window.activeServiceMaterials[window.activeServiceMaterials.length-1];
          last.productId=p.id;last.article_number=p.article_number||"";last.preis=Number(p.sale_price_gross||last.preis||0);
        }
      };
      wrapped.__productCatalogWrapped=true;window.addServiceMaterial=wrapped;
    }
    console.log("Gemeinsame Materialsuche aus Produktverwaltung geladen");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();