/* Allgemeine Produktverwaltung für den Ladenbestand */
(function(){
  const root=()=>document.getElementById("productManagementApp");
  let products=[], editingId=null, loaded=false;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const euro=v=>Number(v||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
  const val=id=>document.getElementById(id)?.value??"";
  const categories=["Tresor","Fahrradschloss","Pflegespray","Schließzylinder","Schlüssel","Schlüsselring","Beschlag","Schloss","Zubehör","Sonstiges"];
  function shell(){
    root().innerHTML='<div class="pm-wrap"><div class="pm-header"><div><div class="pm-eyebrow">SCHLÜSSELDIENST HÖHNE · WARENSORTIMENT</div><h1>📦 Produktverwaltung</h1><p>Alle Verkaufsartikel zentral verwalten und später für die Preisschilder verwenden.</p></div><button class="btnP" id="pmNew">＋ Produkt anlegen</button></div><div class="pm-toolbar"><input id="pmSearch" type="search" placeholder="Name, Artikelnummer oder Hersteller suchen …"><select id="pmCategoryFilter"><option value="">Alle Warengruppen</option>'+categories.map(x=>'<option>'+esc(x)+'</option>').join("")+'</select><span id="pmCount"></span></div><div id="pmList"></div><div id="pmEditor" class="pm-editor hidden"></div></div>';
    document.getElementById("pmNew").onclick=()=>openEditor();
    document.getElementById("pmSearch").oninput=drawList;
    document.getElementById("pmCategoryFilter").onchange=drawList;
  }
  function render(){
    const app=root(); if(!app)return;
    if(!window.supabaseClient){app.innerHTML='<div class="pm-wrap"><h2>Supabase nicht verbunden</h2><p>Bitte lade die Anwendung neu.</p></div>';return}
    if(!loaded){app.innerHTML='<div class="pm-wrap"><p>Produktdaten werden geladen …</p></div>';return}
    shell(); drawList();
  }
  async function load(){
    if(!window.supabaseClient){root().innerHTML='<div class="pm-wrap"><p>Supabase ist noch nicht verbunden. Bitte App neu laden.</p></div>';return}
    const {data,error}=await window.supabaseClient.from("products").select("*").order("name");
    if(error){
      root().innerHTML='<div class="pm-wrap"><div class="pm-empty"><h2>Produktdatenbank noch nicht eingerichtet</h2><p>Bitte zuerst <strong>supabase/produktverwaltung.sql</strong> im Supabase SQL Editor ausführen und anschließend hier neu laden.</p><button class="btnP" onclick="initProductManagement()">Erneut versuchen</button><small>'+esc(error.message)+'</small></div></div>';
      return;
    }
    products=data||[]; loaded=true; render();
  }
  function drawList(){
    const q=(val("pmSearch")||"").trim().toLocaleLowerCase("de"),cat=val("pmCategoryFilter");
    const rows=products.filter(p=>(!cat||p.category===cat)&&[p.name,p.article_number,p.manufacturer,p.category].some(v=>String(v||"").toLocaleLowerCase("de").includes(q)));
    document.getElementById("pmCount").textContent=rows.length+" Artikel";
    document.getElementById("pmList").innerHTML=rows.length?'<div class="pm-table-wrap"><table class="pm-table"><thead><tr><th>Produkt</th><th>Warengruppe</th><th>Artikelnummer</th><th>Hersteller</th><th>Verkaufspreis brutto</th><th>Status</th><th>Preisschild</th><th></th></tr></thead><tbody>'+rows.map(p=>'<tr><td><div class="pm-product-cell">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="" loading="lazy">':'<span class="pm-no-image">📦</span>')+'<span><strong>'+esc(p.name)+'</strong><small>'+esc(p.info||"")+'</small></span></div></td><td>'+esc(p.category||"–")+'</td><td>'+esc(p.article_number||"–")+'</td><td>'+esc(p.manufacturer||"–")+'</td><td><strong>'+(p.sale_price_gross!=null?euro(p.sale_price_gross):"–")+'</strong></td><td><span class="pm-status '+(p.active===false?"off":"on")+'">'+(p.active===false?"Deaktiviert":"Aktiv")+'</span></td><td><div class="pm-label-actions"><button class="btnS" data-label="small" data-id="'+esc(p.id)+'">Klein</button><button class="btnS" data-label="medium" data-id="'+esc(p.id)+'">Mittel</button><button class="btnS" data-label="a6" data-id="'+esc(p.id)+'">A6</button></div></td><td><button class="btnS" data-edit="'+esc(p.id)+'">Bearbeiten</button></td></tr>').join("")+'</tbody></table></div>':'<div class="pm-empty"><div>📦</div><strong>Noch keine passenden Produkte vorhanden</strong><p>Lege den ersten Artikel an oder passe den Suchfilter an.</p><button class="btnP" id="pmEmptyNew">Produkt anlegen</button></div>';
    document.getElementById("pmList").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEditor(b.dataset.edit));
    document.getElementById("pmList").querySelectorAll("[data-label]").forEach(b=>b.onclick=()=>printLabel(b.dataset.id,b.dataset.label));
    document.getElementById("pmEmptyNew")?.addEventListener("click",()=>openEditor());
  }
  function openEditor(id=null){
    editingId=id; const p=products.find(x=>String(x.id)===String(id))||{};
    const attrs=Array.isArray(p.custom_attributes)?p.custom_attributes:[];
    document.getElementById("pmEditor").classList.remove("hidden");
    document.getElementById("pmEditor").innerHTML='<div class="pm-editor-head"><div><div class="pm-eyebrow">'+(id?"ARTIKEL BEARBEITEN":"NEUER ARTIKEL")+'</div><h2>'+(id?esc(p.name):"Produkt anlegen")+'</h2></div><button class="btnS" id="pmClose">Schließen ✕</button></div><form id="pmForm"><div class="pm-section-title">Allgemeine Produktdaten</div><div class="pm-form-grid"><label>Produktname *<input id="pmName" required value="'+esc(p.name||"")+'" placeholder="z. B. ABUS Bordo 6000"></label><label>Warengruppe *<select id="pmCategory" required><option value="">Bitte wählen</option>'+categories.map(x=>'<option '+(p.category===x?"selected":"")+'>'+esc(x)+'</option>').join("")+'</select></label><label>Artikelnummer<input id="pmArticle" value="'+esc(p.article_number||"")+'"></label><label>Hersteller<input id="pmManufacturer" value="'+esc(p.manufacturer||"")+'" placeholder="z. B. ABUS, Winkhaus"></label><label>Produktbild-URL<input id="pmImage" type="url" value="'+esc(p.image_url||"")+'" placeholder="https://…"></label><label>Mehrwertsteuer (%)<input id="pmVat" type="number" min="0" max="100" step="0.01" value="'+esc(p.vat_rate??19)+'"></label><div class="pm-wide pm-info-field"><label for="pmInfo">Kurzbeschreibung</label><textarea id="pmInfo" rows="3" placeholder="z. B. Pflegespray für Zylinder und Schlösser …">'+esc(p.info||"")+'</textarea><label class="pm-label-check pm-info-label"><input id="pmInfoLabel" type="checkbox" '+(p.label_fields?.info!==false?"checked":"")+'><span>Kurzbeschreibung auf Preisschild anzeigen (zweite Zeile)</span></label></div></div><div class="pm-section-title">Verkaufspreisermittlung</div><div class="pm-form-grid"><label>Einkaufspreis<input id="pmPurchase" type="number" min="0" step="0.01" value="'+esc(p.purchase_price_input??"")+'" placeholder="0,00"></label><label>Einkaufspreis ist<select id="pmPurchaseType"><option value="net" '+((p.purchase_price_type||"net")==="net"?"selected":"")+'>Netto</option><option value="gross" '+(p.purchase_price_type==="gross"?"selected":"")+'>Brutto inkl. MwSt.</option></select></label><label>Gewünschte Handelsspanne (%)<input id="pmMargin" type="number" min="0" max="99" step="0.5" value="'+esc(p.margin_percent??30)+'"></label><label>Verkaufspreis brutto (manuell)<input id="pmPrice" type="number" min="0" step="0.01" value="'+esc(p.sale_price_gross??"")+'"></label><div class="pm-wide pm-calc" id="pmCalcPreview">Einkaufspreis und Handelsspanne eingeben, um den Verkaufspreis zu berechnen.</div></div><div class="pm-section-title">Individuelle Produkteigenschaften</div><p class="pm-hint">Hier kannst du beliebige Merkmale ergänzen. Beispiele: Inhalt 200 ml, Schutzklasse 8, Durchmesser 25 mm, Farbe Rot.</p><div id="pmAttributes" class="pm-attributes">'+attrs.map((a,i)=>attributeRow(a.key,a.value,i,a.show_on_label===true)).join("")+'</div><button type="button" class="btnS" id="pmAddAttribute">＋ Eigenschaft hinzufügen</button><div class="pm-form-grid pm-bottom-fields"><label>Verfügbarkeit<select id="pmStock"><option value="in_stock" '+((p.stock_status||"in_stock")==="in_stock"?"selected":"")+'>Im Geschäft / Lagernd</option><option value="to_order" '+(p.stock_status==="to_order"?"selected":"")+'>Bestellware</option></select></label><label>Aktiv<select id="pmActive"><option value="true" '+(p.active!==false?"selected":"")+'>Ja</option><option value="false" '+(p.active===false?"selected":"")+'>Nein</option></select></label><label class="pm-wide">Interne Notizen<textarea id="pmNotes" rows="2">'+esc(p.notes||"")+'</textarea></label></div><div class="pm-actions"><button class="btnP" type="submit">💾 Produkt speichern</button><button class="btnS" type="button" id="pmCancel">Abbrechen</button>'+(id?'<button class="btnS pm-delete" type="button" id="pmDelete">Produkt löschen</button>':"")+'</div><div id="pmMessage" class="pm-message"></div></form>';
    document.getElementById("pmClose").onclick=closeEditor;document.getElementById("pmCancel").onclick=closeEditor;
    document.getElementById("pmAddAttribute").onclick=()=>{const box=document.getElementById("pmAttributes");box.insertAdjacentHTML("beforeend",attributeRow("","",box.children.length));bindAttributeRemove()};
    bindAttributeRemove();
    ["pmPurchase","pmPurchaseType","pmMargin","pmVat"].forEach(x=>document.getElementById(x).addEventListener("input",updateCalc));
    document.getElementById("pmPrice").addEventListener("input",()=>{document.getElementById("pmPrice").dataset.manual="1"});
    document.getElementById("pmForm").onsubmit=save;
    document.getElementById("pmDelete")?.addEventListener("click",deleteCurrent);
    updateCalc(); document.getElementById("pmEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function attributeRow(key,value,i,show=true){return '<div class="pm-attribute-row"><input class="pm-attr-key" aria-label="Eigenschaft" placeholder="Eigenschaft, z. B. Inhalt" value="'+esc(key)+'"><input class="pm-attr-value" aria-label="Wert" placeholder="Wert, z. B. 200 ml" value="'+esc(value)+'"><label class="pm-label-check"><input class="pm-attr-label" type="checkbox" '+(show?"checked":"")+'><span>Auf Preisschild</span></label><button type="button" class="pm-remove-attribute" title="Eigenschaft entfernen">×</button></div>'}
  function bindAttributeRemove(){document.querySelectorAll(".pm-remove-attribute").forEach(b=>b.onclick=()=>b.closest(".pm-attribute-row").remove())}
  function calc(){
    const entered=Number(val("pmPurchase")),margin=Number(val("pmMargin")),vat=Number(val("pmVat"));
    if(!(entered>0)||!Number.isFinite(margin)||margin<0||margin>=100||!Number.isFinite(vat)||vat<0)return null;
    const purchaseNet=val("pmPurchaseType")==="gross"?entered/(1+vat/100):entered;
    const saleNet=purchaseNet/(1-margin/100);
    return {purchaseNet,saleNet,saleGross:saleNet*(1+vat/100),profit:saleNet-purchaseNet,vatAmount:saleNet*vat/100};
  }
  function updateCalc(){
    const box=document.getElementById("pmCalcPreview");if(!box)return;
    const c=calc();
    if(!c){box.textContent="Einkaufspreis und Handelsspanne eingeben, um den Verkaufspreis zu berechnen.";return}
    box.innerHTML='<small>KALKULIERTER VERKAUFSPREIS BRUTTO</small><strong>'+euro(c.saleGross)+'</strong><span>EK netto: '+euro(c.purchaseNet)+'</span><span>VK netto: '+euro(c.saleNet)+'</span><span>MwSt.: '+euro(c.vatAmount)+'</span><span>Rohertrag: '+euro(c.profit)+'</span>';
    const price=document.getElementById("pmPrice");if(price&&!price.dataset.manual)price.value=c.saleGross.toFixed(2);
  }
  async function save(e){
    e.preventDefault();const msg=document.getElementById("pmMessage"),c=calc(),attrs=[];
    document.querySelectorAll(".pm-attribute-row").forEach(row=>{const key=row.querySelector(".pm-attr-key").value.trim(),value=row.querySelector(".pm-attr-value").value.trim(),show_on_label=row.querySelector(".pm-attr-label").checked;if(key||value)attrs.push({key,value,show_on_label})});
    const product={name:val("pmName").trim(),category:val("pmCategory"),article_number:val("pmArticle").trim()||null,manufacturer:val("pmManufacturer").trim()||null,image_url:val("pmImage").trim()||null,vat_rate:Number(val("pmVat")||19),info:val("pmInfo").trim()||null,purchase_price_input:val("pmPurchase")===""?null:Number(val("pmPurchase")),purchase_price_type:val("pmPurchaseType"),margin_percent:val("pmMargin")===""?null:Number(val("pmMargin")),sale_price_gross:c?Number(c.saleGross.toFixed(2)):(val("pmPrice")===""?null:Number(val("pmPrice"))),sale_price_net:c?Number(c.saleNet.toFixed(2)):null,custom_attributes:attrs,label_fields:{info:document.getElementById("pmInfoLabel").checked},stock_status:val("pmStock"),active:val("pmActive")==="true",notes:val("pmNotes").trim()||null};
    const query=window.supabaseClient.from("products"),result=editingId?await query.update(product).eq("id",editingId):await query.insert(product);
    if(result.error){msg.textContent="Speichern fehlgeschlagen: "+result.error.message;msg.classList.add("error");return}
    msg.textContent="Produkt gespeichert.";msg.classList.remove("error");await load();
  }
  async function deleteCurrent(){
    const p=products.find(x=>String(x.id)===String(editingId));if(!p||!confirm('Produkt "'+p.name+'" wirklich löschen?'))return;
    const {error}=await window.supabaseClient.from("products").delete().eq("id",editingId);
    if(error){alert("Löschen fehlgeschlagen: "+error.message);return}
    closeEditor();await load();
  }
  function closeEditor(){document.getElementById("pmEditor").classList.add("hidden");editingId=null}

  function printLabel(id,size){
    const p=products.find(x=>String(x.id)===String(id));if(!p)return;
    const attrs=(Array.isArray(p.custom_attributes)?p.custom_attributes:[]).filter(a=>String(a.key||"").trim()||String(a.value||"").trim());
    const labelAttrs=attrs.filter(a=>a.show_on_label===true).map(a=>(a.key?String(a.key).trim()+": ":"")+String(a.value||"").trim()).filter(Boolean);const labelInfo=p.label_fields?.info!==false&&p.info?String(p.info).trim():"";
    const price=p.sale_price_gross!=null?Number(p.sale_price_gross).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €":"Preis auf Anfrage";
    const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const description=labelAttrs.join(" · ");const shortDescription=labelInfo;
    const compact=size==="small"||size==="medium";
    const cfg=size==="small"?{w:50,h:23,src:"assets/Preisschild-klein.svg",title:"19.3%",desc:"49.6%",price:"68.5%",titleSize:2.45,descSize:1.65,priceSize:5.3,
      titleMask:"left:18%;top:34%;width:66%;height:15%",descMask:"left:18%;top:47%;width:66%;height:12%",priceMask:"left:38%;top:66%;width:55%;height:29%",
      titlePos:"left:19.3%;top:36.5%;width:66%",descPos:"left:19.3%;top:49%;width:66%",pricePos:"left:40%;top:68%;width:54%"}
      :size==="medium"?{w:80,h:50,src:"assets/Preisschild-mittel.svg",title:"8.5%",desc:"8.5%",price:"30.7%",titleSize:5.8,descSize:3.8,priceSize:10,
      titleMask:"left:7%;top:33%;width:70%;height:13%",descMask:"left:7%;top:47%;width:65%;height:12%",priceMask:"left:29%;top:70%;width:60%;height:28%",
      titlePos:"left:8.5%;top:34.5%;width:68%",descPos:"left:8.5%;top:48.5%;width:65%",pricePos:"left:31%;top:72%;width:58%"}
      :{w:105,h:148,src:"assets/Preisschild-A6.svg"};
    let content;
    if(compact){
      content='<img class="template" src="'+cfg.src+'" alt=""><div class="mask title-mask" style="'+cfg.titleMask+'"></div><div class="mask desc-mask" style="'+cfg.descMask+'"></div><div class="mask price-mask" style="'+cfg.priceMask+'"></div>'+
        '<div class="dynamic title" style="'+cfg.titlePos+';font-size:'+cfg.titleSize+'mm">'+safe(p.name)+'</div>'+
        '<div class="dynamic desc" style="'+cfg.descPos+';font-size:'+cfg.descSize+'mm">'+safe(description)+'</div>'+
        '<div class="dynamic short-desc" style="left:'+(size==="small"?"19.3%":"8.5%")+';top:'+(size==="small"?"57%":"61.5%")+';width:'+(size==="small"?"66%":"65%")+';font-size:'+(size==="small"?"1.35":"2.8")+'mm">'+safe(shortDescription)+'</div>'+
        '<div class="dynamic price" style="'+cfg.pricePos+';font-size:'+cfg.priceSize+'mm">'+safe(price)+'</div>';
    }else{
      content='<div class="a6-head"><div class="brand">SCHLÜSSELDIENST<br><i>Christian Höhne</i></div><div class="a6-title">'+safe(p.name)+'</div><div class="a6-desc">'+safe(description)+(description&&shortDescription?'<br>':'')+safe(shortDescription)+'</div></div>'+(p.image_url?'<img class="a6-product" src="'+safe(p.image_url)+'" alt="">':'')+'<div class="a6-price">'+safe(price)+'</div>';
    }
    const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Preisschild – '+safe(p.name)+'</title><style>'+
      '*{box-sizing:border-box}html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#122b40}body{background:#eee}.sheet{position:relative;overflow:hidden;background:#fff;width:'+cfg.w+'mm;height:'+cfg.h+'mm;margin:12mm auto;print-color-adjust:exact;-webkit-print-color-adjust:exact}.template{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}.mask{position:absolute;background:#fff}.dynamic{position:absolute;z-index:2;color:#122b40;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}.desc{font-weight:400;color:#858d94}.price{text-align:center}'+
      '.a6-head{position:absolute;left:8%;right:8%;top:17%}.brand{position:absolute;right:0;top:-10mm;font-size:5px;line-height:1.05;text-align:center;font-weight:700}.brand i{font-family:Georgia,serif;font-size:7px}.a6-title{font-size:22px;font-weight:700;margin-bottom:8mm}.a6-desc{font-size:11px;line-height:1.4;color:#87919a}.a6-product{position:absolute;left:15%;top:43%;width:70%;height:42%;object-fit:contain}.a6-price{position:absolute;bottom:5%;left:8%;right:8%;font-size:30px;font-weight:700;text-align:right;border-top:1px solid #1f3769;padding-top:5mm}'+
      '@page{size:'+cfg.w+'mm '+cfg.h+'mm;margin:0}.preview-tools{display:flex;gap:10px;justify-content:center;padding:16px;position:sticky;top:0;background:#142b43;z-index:10}.preview-tools button{border:1px solid #6b8eae;border-radius:8px;background:#244b70;color:#fff;padding:10px 16px;font-size:14px;cursor:pointer}@media print{body{background:#fff}.preview-tools{display:none}.sheet{margin:0}}'+
      '</style></head><body><nav class="preview-tools"><button type="button" onclick="window.print()">🖨️ Drucken / als PDF speichern</button><button type="button" onclick="window.close()">← Zurück zur Produktverwaltung</button></nav><main class="sheet">'+content+'</main><script>window.onload=()=>{const img=document.querySelector(".template");if(img&&!img.complete)img.onload=()=>{};};<\/script></body></html>';
    const w=window.open("","_blank","width=900,height=700");if(!w){alert("Bitte Pop-ups für diese Anwendung erlauben.");return}w.document.open();w.document.write(html);w.document.close();
  }

  window.initProductManagement=()=>{if(!root())return;loaded=false;load().catch(e=>{root().innerHTML='<div class="pm-wrap"><p>Fehler beim Laden: '+esc(e.message)+'</p></div>'})};
})();