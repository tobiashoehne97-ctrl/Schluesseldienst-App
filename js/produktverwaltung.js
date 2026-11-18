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
    document.getElementById("pmEditor").innerHTML='<div class="pm-editor-head"><div><div class="pm-eyebrow">'+(id?"ARTIKEL BEARBEITEN":"NEUER ARTIKEL")+'</div><h2>'+(id?esc(p.name):"Produkt anlegen")+'</h2></div><button class="btnS" id="pmClose">Schließen ✕</button></div><form id="pmForm"><div class="pm-section-title">Allgemeine Produktdaten</div><div class="pm-form-grid"><label>Produktname *<input id="pmName" required value="'+esc(p.name||"")+'" placeholder="z. B. ABUS Bordo 6000"></label><label>Warengruppe *<select id="pmCategory" required><option value="">Bitte wählen</option>'+categories.map(x=>'<option '+(p.category===x?"selected":"")+'>'+esc(x)+'</option>').join("")+'</select></label><label>Artikelnummer<input id="pmArticle" value="'+esc(p.article_number||"")+'"></label><label>Hersteller<input id="pmManufacturer" value="'+esc(p.manufacturer||"")+'" placeholder="z. B. ABUS, Winkhaus"></label><label>Produktbild-URL<input id="pmImage" type="url" value="'+esc(p.image_url||"")+'" placeholder="https://…"></label><label>Mehrwertsteuer (%)<input id="pmVat" type="number" min="0" max="100" step="0.01" value="'+esc(p.vat_rate??19)+'"></label><label class="pm-wide">Informationen / Kurzbeschreibung<textarea id="pmInfo" rows="3" placeholder="Produktbeschreibung, Besonderheiten …">'+esc(p.info||"")+'</textarea></label></div><div class="pm-section-title">Verkaufspreisermittlung</div><div class="pm-form-grid"><label>Einkaufspreis<input id="pmPurchase" type="number" min="0" step="0.01" value="'+esc(p.purchase_price_input??"")+'" placeholder="0,00"></label><label>Einkaufspreis ist<select id="pmPurchaseType"><option value="net" '+((p.purchase_price_type||"net")==="net"?"selected":"")+'>Netto</option><option value="gross" '+(p.purchase_price_type==="gross"?"selected":"")+'>Brutto inkl. MwSt.</option></select></label><label>Gewünschte Handelsspanne (%)<input id="pmMargin" type="number" min="0" max="99" step="0.5" value="'+esc(p.margin_percent??30)+'"></label><label>Verkaufspreis brutto (manuell)<input id="pmPrice" type="number" min="0" step="0.01" value="'+esc(p.sale_price_gross??"")+'"></label><div class="pm-wide pm-calc" id="pmCalcPreview">Einkaufspreis und Handelsspanne eingeben, um den Verkaufspreis zu berechnen.</div></div><div class="pm-section-title">Individuelle Produkteigenschaften</div><p class="pm-hint">Hier kannst du beliebige Merkmale ergänzen. Beispiele: Inhalt 200 ml, Schutzklasse 8, Durchmesser 25 mm, Farbe Rot.</p><div id="pmAttributes" class="pm-attributes">'+attrs.map((a,i)=>attributeRow(a.key,a.value,i)).join("")+'</div><button type="button" class="btnS" id="pmAddAttribute">＋ Eigenschaft hinzufügen</button><div class="pm-form-grid pm-bottom-fields"><label>Verfügbarkeit<select id="pmStock"><option value="in_stock" '+((p.stock_status||"in_stock")==="in_stock"?"selected":"")+'>Im Geschäft / Lagernd</option><option value="to_order" '+(p.stock_status==="to_order"?"selected":"")+'>Bestellware</option></select></label><label>Aktiv<select id="pmActive"><option value="true" '+(p.active!==false?"selected":"")+'>Ja</option><option value="false" '+(p.active===false?"selected":"")+'>Nein</option></select></label><label class="pm-wide">Interne Notizen<textarea id="pmNotes" rows="2">'+esc(p.notes||"")+'</textarea></label></div><div class="pm-actions"><button class="btnP" type="submit">💾 Produkt speichern</button><button class="btnS" type="button" id="pmCancel">Abbrechen</button>'+(id?'<button class="btnS pm-delete" type="button" id="pmDelete">Produkt löschen</button>':"")+'</div><div id="pmMessage" class="pm-message"></div></form>';
    document.getElementById("pmClose").onclick=closeEditor;document.getElementById("pmCancel").onclick=closeEditor;
    document.getElementById("pmAddAttribute").onclick=()=>{const box=document.getElementById("pmAttributes");box.insertAdjacentHTML("beforeend",attributeRow("","",box.children.length));bindAttributeRemove()};
    bindAttributeRemove();
    ["pmPurchase","pmPurchaseType","pmMargin","pmVat"].forEach(x=>document.getElementById(x).addEventListener("input",updateCalc));
    document.getElementById("pmPrice").addEventListener("input",()=>{document.getElementById("pmPrice").dataset.manual="1"});
    document.getElementById("pmForm").onsubmit=save;
    document.getElementById("pmDelete")?.addEventListener("click",deleteCurrent);
    updateCalc(); document.getElementById("pmEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function attributeRow(key,value,i){return '<div class="pm-attribute-row"><input class="pm-attr-key" aria-label="Eigenschaft" placeholder="Eigenschaft, z. B. Inhalt" value="'+esc(key)+'"><input class="pm-attr-value" aria-label="Wert" placeholder="Wert, z. B. 200 ml" value="'+esc(value)+'"><button type="button" class="pm-remove-attribute" title="Eigenschaft entfernen">×</button></div>'}
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
    document.querySelectorAll(".pm-attribute-row").forEach(row=>{const key=row.querySelector(".pm-attr-key").value.trim(),value=row.querySelector(".pm-attr-value").value.trim();if(key||value)attrs.push({key,value})});
    const product={name:val("pmName").trim(),category:val("pmCategory"),article_number:val("pmArticle").trim()||null,manufacturer:val("pmManufacturer").trim()||null,image_url:val("pmImage").trim()||null,vat_rate:Number(val("pmVat")||19),info:val("pmInfo").trim()||null,purchase_price_input:val("pmPurchase")===""?null:Number(val("pmPurchase")),purchase_price_type:val("pmPurchaseType"),margin_percent:val("pmMargin")===""?null:Number(val("pmMargin")),sale_price_gross:c?Number(c.saleGross.toFixed(2)):(val("pmPrice")===""?null:Number(val("pmPrice"))),sale_price_net:c?Number(c.saleNet.toFixed(2)):null,custom_attributes:attrs,stock_status:val("pmStock"),active:val("pmActive")==="true",notes:val("pmNotes").trim()||null};
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
    const details=[p.info,...attrs.map(a=>(a.key?String(a.key).trim()+": ":"")+String(a.value||"").trim())].filter(Boolean);
    const price=p.sale_price_gross!=null?Number(p.sale_price_gross).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €":"Preis auf Anfrage";
    const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const cfg=size==="small"?{w:50,h:23,title:2.8,desc:1.9,price:5.8,brand:1.8}
      :size==="medium"?{w:80,h:50,title:5.2,desc:3.4,price:9,brand:4.4}
      :{w:105,h:148,title:22,desc:11,price:30,brand:5};
    const compact=size!=="a6";
    const description=details.join(" · ");
    const content=compact
      ? '<div class="blue-cap"></div><div class="brand">Schlüsseldienst<br><i>Christian Höhne</i></div><div class="product-name">'+safe(p.name)+'</div><div class="product-details">'+safe(description)+'</div><div class="separator"></div><div class="vat">inkl. MwSt.</div><div class="price">'+safe(price)+'</div>'
      : '<div class="a6-head"><div class="brand">SCHLÜSSELDIENST<br><i>Christian Höhne</i></div><div class="a6-title">'+safe(p.name)+'</div><div class="a6-desc">'+safe(description)+'</div></div>'+(p.image_url?'<img class="a6-product" src="'+safe(p.image_url)+'" alt="">':'')+'<div class="a6-price">'+safe(price)+'</div>';
    const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Preisschild – '+safe(p.name)+'</title><style>'+
      '*{box-sizing:border-box}html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#172b3d}body{background:#eee}.sheet{position:relative;overflow:hidden;background:#fff;border:.25mm solid #8795a2;width:'+cfg.w+'mm;height:'+cfg.h+'mm;margin:12mm auto;print-color-adjust:exact;-webkit-print-color-adjust:exact}'+
      '.blue-cap{position:absolute;left:0;top:0;width:67%;height:23%;background:linear-gradient(135deg,#102b43 0%,#234f79 100%);clip-path:polygon(0 0,100% 0,84% 100%,0 100%);box-shadow:0 1mm 1mm #0004}.brand{position:absolute;right:5%;top:3%;width:36%;text-align:center;font-size:'+cfg.brand+'mm;line-height:1.02;font-weight:800;color:#102b3f;letter-spacing:.1mm;text-transform:lowercase}.brand i{font-family:Georgia,serif;font-size:1.22em;font-style:italic;font-weight:700}'+
      '.product-name{position:absolute;left:19%;right:4%;top:37%;font-size:'+cfg.title+'mm;font-weight:700;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#172b3d}.product-details{position:absolute;left:19%;right:4%;top:54%;font-size:'+cfg.desc+'mm;line-height:1.15;color:#7c8790;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.separator{position:absolute;left:2%;right:2%;top:65%;height:.25mm;background:#102b43}.vat{position:absolute;left:20%;bottom:13%;font-size:'+Math.max(1.7,cfg.desc*.72)+'mm;color:#7c8790}.price{position:absolute;right:18%;bottom:3%;font-size:'+cfg.price+'mm;line-height:1;font-weight:700;color:#102b3f;white-space:nowrap}'+
      '.a6-head{position:absolute;left:8%;right:8%;top:17%}.a6-title{font-size:22px;font-weight:700;margin-bottom:8mm}.a6-desc{font-size:11px;line-height:1.4;color:#87919a}.a6-product{position:absolute;left:15%;top:43%;width:70%;height:42%;object-fit:contain}.a6-price{position:absolute;bottom:5%;left:8%;right:8%;font-size:30px;font-weight:700;text-align:right;border-top:1px solid #1f3769;padding-top:5mm}'+
      '@page{size:'+cfg.w+'mm '+cfg.h+'mm;margin:0}@media print{body{background:#fff}.sheet{margin:0;border:.25mm solid #8795a2}}'+
      '</style></head><body><main class="sheet">'+content+'</main><script>window.onload=()=>setTimeout(()=>window.print(),350);<\/script></body></html>';
    const w=window.open("","_blank","width=900,height=700");if(!w){alert("Bitte Pop-ups für diese Anwendung erlauben.");return}w.document.open();w.document.write(html);w.document.close();
  }

  window.initProductManagement=()=>{if(!root())return;loaded=false;load().catch(e=>{root().innerHTML='<div class="pm-wrap"><p>Fehler beim Laden: '+esc(e.message)+'</p></div>'})};
})();