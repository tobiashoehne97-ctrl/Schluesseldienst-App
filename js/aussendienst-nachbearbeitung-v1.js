/* Nachbearbeitung abgeschlossener Außendienst-Einsätze.
   Ändert bestehende Berichtsdaten, erzeugt keine neue Zeit-/Einsatzsession. */
(function(){
  if(window.__aussendienstNachbearbeitungInstalled)return;
  window.__aussendienstNachbearbeitungInstalled=true;
  const entries=()=>AppData?.kalender?.eintraege||[];
  const findEntry=id=>entries().find(e=>String(e.id)===String(id));
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const isCompleted=e=>e?.typ==="termin" && ["erledigt","rechnung"].includes(e.status) && !!e.regiebericht;

  function materialRow(m={},i){
    return '<div class="completed-material-row" data-index="'+i+'" style="display:grid;grid-template-columns:minmax(0,2fr) 70px 90px 34px;gap:6px;margin-bottom:7px;align-items:center">'+
      '<input class="completed-mat-name" value="'+esc(m.name||"")+'" placeholder="Material / Artikel" style="min-width:0;width:100%;padding:9px">'+
      '<input class="completed-mat-qty" type="number" min="1" step="1" value="'+esc(m.menge??1)+'" style="width:100%;padding:9px">'+
      '<input class="completed-mat-price" type="number" min="0" step="0.01" value="'+esc(m.preis??0)+'" style="width:100%;padding:9px">'+
      '<button type="button" class="btnD" onclick="this.parentElement.remove()" style="padding:8px">×</button></div>';
  }

  window.addCompletedMaterialRow=function(){
    const list=document.getElementById("completed_material_rows");
    if(!list)return;
    list.insertAdjacentHTML("beforeend",materialRow({name:"",menge:1,preis:0},list.children.length));
  };

  window.openCompletedServiceEditor=function(id){
    const entry=findEntry(id);
    if(!isCompleted(entry)){alert("Dieser abgeschlossene Außendienst-Einsatz kann nicht bearbeitet werden.");return;}
    const r=entry.regiebericht||{};
    const sessions=(r.einsaetze||[]).map(s=>({...s}));
    const sessionFields=sessions.length?sessions.map((s,i)=>
      '<div style="border:1px solid #345574;border-radius:9px;padding:11px;margin:10px 0">'+
      '<div style="font-weight:800;margin-bottom:8px">Einsatz '+(s.nummer||i+1)+' · '+esc(s.gestartet?new Date(s.gestartet).toLocaleDateString("de-DE"):"Datum unbekannt")+'</div>'+
      '<label class="lbl">Vorgefunden</label><textarea id="completed_vor_'+i+'" style="width:100%;min-height:75px;margin-bottom:9px">'+esc(s.vorgefunden||"")+'</textarea>'+
      '<label class="lbl">Durchgeführte Arbeiten</label><textarea id="completed_gemacht_'+i+'" style="width:100%;min-height:75px">'+esc(s.gemacht||"")+'</textarea></div>'
    ).join("") :
      '<label class="lbl">Vorgefunden</label><textarea id="completed_vor_single" style="width:100%;min-height:85px;margin-bottom:10px">'+esc(r.vorgefunden||"")+'</textarea>'+
      '<label class="lbl">Durchgeführte Arbeiten</label><textarea id="completed_gemacht_single" style="width:100%;min-height:85px">'+esc(r.gemacht||"")+'</textarea>';

    const mats=(r.material||[]).map((m,i)=>materialRow(m,i)).join("");
    const html='<div style="font-size:13px;color:#b9d2e8;margin-bottom:12px">Du bearbeitest den bereits gespeicherten Einsatz. Einsatzdatum, Arbeitszeiten und Zahlungsart bleiben unverändert.</div>'+
      '<div class="sec">Berichtstext</div>'+sessionFields+
      '<div class="sec" style="margin-top:16px">Material</div>'+
      '<div style="display:grid;grid-template-columns:minmax(0,2fr) 70px 90px 34px;gap:6px;font-size:11px;color:#9ebbd4;margin-bottom:5px"><span>Artikel</span><span>Menge</span><span>Preis €</span><span></span></div>'+
      '<div id="completed_material_rows">'+mats+'</div>'+
      '<button type="button" class="btnS" style="width:100%;padding:10px;margin:5px 0 14px" onclick="addCompletedMaterialRow()">＋ Material ergänzen</button>'+
      '<div class="sec">Interner Hinweis für die Rechnungsstellung</div>'+
      '<textarea id="completed_invoice_note" style="width:100%;min-height:85px" placeholder="z. B. Kunde wünscht Rechnung per E-Mail, Restarbeiten gesondert berechnen ...">'+esc(r.rechnungshinweis||"")+'</textarea>'+
      '<div style="font-size:11px;color:#9ebbd4;margin-top:6px">Dieser Hinweis ist intern und wird nicht auf den Kunden-Regiebericht gedruckt.</div>'+
      '<div style="display:flex;gap:8px;margin-top:18px"><button class="btnS" style="flex:1;padding:12px" onclick="closeServiceModal()">Abbrechen</button><button class="btnP" style="flex:1;padding:12px" onclick="saveCompletedServiceEdits('+JSON.stringify(String(id))+')">💾 Änderungen speichern</button></div>';
    window.activeServiceId=String(id);
    window.__aussendienstZeitTracking=null;
    window.openServiceModal("✏️ Einsatz nachbearbeiten",html);
  };

  window.saveCompletedServiceEdits=async function(id){
    const entry=findEntry(id);
    if(!isCompleted(entry))return alert("Der Einsatz wurde nicht gefunden oder ist nicht mehr abgeschlossen.");
    const original=entry.regiebericht||{};
    const report={...original};
    if(Array.isArray(report.einsaetze)&&report.einsaetze.length){
      report.einsaetze=report.einsaetze.map((s,i)=>({
        ...s,
        vorgefunden:document.getElementById("completed_vor_"+i)?.value||"",
        gemacht:document.getElementById("completed_gemacht_"+i)?.value||""
      }));
      report.vorgefunden=report.einsaetze.map(s=>"Einsatz "+s.nummer+":\n"+(s.vorgefunden||"—")).join("\n\n");
      report.gemacht=report.einsaetze.map(s=>"Einsatz "+s.nummer+":\n"+(s.gemacht||"—")).join("\n\n");
    }else{
      report.vorgefunden=document.getElementById("completed_vor_single")?.value||"";
      report.gemacht=document.getElementById("completed_gemacht_single")?.value||"";
    }
    const rows=[...document.querySelectorAll("#completed_material_rows .completed-material-row")];
    const materials=rows.map(row=>({
      name:row.querySelector(".completed-mat-name")?.value.trim()||"",
      menge:Math.max(1,Number(row.querySelector(".completed-mat-qty")?.value)||1),
      preis:Math.max(0,Number(row.querySelector(".completed-mat-price")?.value)||0)
    })).filter(m=>m.name);
    report.material=materials;
    report.gesamtsumme=materials.reduce((sum,m)=>sum+m.menge*m.preis,0);
    report.rechnungshinweis=document.getElementById("completed_invoice_note")?.value.trim()||"";
    report.nachbearbeitet_am=new Date().toISOString();
    report.nachbearbeitet_von=window.currentEmployee||"";
    // Das bestehende Abschlusskennzeichen und sämtliche Zeitfelder bleiben erhalten.
    window.__aussendienstZeitTracking=null;
    window.__editingCompletedService=true;
    try{
      await window.updateServiceEntry({status:entry.status,regiebericht:report});
    }catch(err){
      console.error("Nachbearbeitung fehlgeschlagen:",err);
      alert("Die Änderungen konnten nicht gespeichert werden: "+(err.message||err));
      return;
    }finally{
      window.__editingCompletedService=false;
    }
    window.closeServiceModal();
    if(typeof renderKalender==="function")renderKalender();
    if(typeof renderKalenderWeek==="function")renderKalenderWeek();
    window.openKalenderEntryDetails?.(id);
    alert("Die Änderungen am abgeschlossenen Einsatz wurden gespeichert.");
  };

  const originalDetails=window.openKalenderEntryDetails;
  if(typeof originalDetails==="function"){
    window.openKalenderEntryDetails=function(id){
      const result=originalDetails(id);
      const entry=findEntry(id);
      if(!isCompleted(entry))return result;
      const card=document.querySelector("#kal_modal_content .card");
      if(card&&!card.querySelector("#edit-completed-service")){
        const button=document.createElement("button");
        button.id="edit-completed-service";
        button.type="button";
        button.className="btnP";
        button.style.cssText="width:100%;padding:13px;margin-top:10px";
        button.textContent="✏️ Abgeschlossenen Einsatz bearbeiten";
        button.onclick=()=>window.openCompletedServiceEditor(id);
        card.appendChild(button);
      }
      return result;
    };
  }
  console.log("Außendienst-Nachbearbeitung geladen");
})();
