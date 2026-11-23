/* Außendienst-Zeiterfassung: Beginn inkl. Fahrt, Ankunft optional, Ende.
   Bewusst getrennt vom Notdienst-Workflow. */
(function(){
  if(window.__aussendienstZeitFixInstalled) return;
  window.__aussendienstZeitFixInstalled=true;

  const trackingKey="__aussendienstZeitTracking";
  const fmt=(value)=>{
    const d=new Date(value);
    return Number.isNaN(d.getTime())?"":d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  };
  const minutes=(from,to)=>{
    const a=Date.parse(from),b=Date.parse(to);
    return Number.isFinite(a)&&Number.isFinite(b)?Math.max(0,Math.round((b-a)/60000)):0;
  };

  function addArrivalControl(){
    const content=document.getElementById("service_modal_content");
    const tracking=window[trackingKey];
    if(!content || !tracking || document.getElementById("service_arrival_control")) return;
    const panel=document.createElement("div");
    panel.id="service_arrival_control";
    panel.style.cssText="padding:12px;margin:0 0 14px;border:1px solid #345574;border-radius:10px;background:#102a43";
    panel.innerHTML=
      '<div style="font-weight:800;margin-bottom:5px">⏱️ Zeit läuft seit Einsatzbeginn</div>'+
      '<div style="font-size:12px;color:#a9c5df;margin-bottom:10px">Die Fahrt zählt bereits zur Arbeitszeit. Ankunft nur erfassen, wenn Fahrt und Arbeit getrennt ausgewiesen werden sollen.</div>'+
      '<button id="service_arrival_button" type="button" class="btnS" style="width:100%;padding:11px" onclick="captureServiceArrival()">📍 Ankunft am Einsatzort erfassen (optional)</button>'+
      '<div id="service_arrival_status" style="font-size:12px;color:#86d6a2;margin-top:8px"></div>';
    content.insertBefore(panel,content.firstChild);
    if(tracking.arrivalAt) showArrivalCaptured(tracking.arrivalAt);
  }

  function showArrivalCaptured(value){
    const button=document.getElementById("service_arrival_button");
    const status=document.getElementById("service_arrival_status");
    if(button){button.disabled=true;button.textContent="✓ Ankunft erfasst";}
    if(status)status.textContent="Ankunft: "+fmt(value)+" Uhr · Fahrtzeit wird separat ausgewiesen.";
  }

  window.captureServiceArrival=function(){
    const tracking=window[trackingKey];
    if(!tracking || tracking.arrivalAt) return;
    const now=new Date().toISOString();
    if(now<tracking.startedAt){
      alert("Die Ankunftszeit liegt vor dem Einsatzbeginn. Bitte Geräteuhr prüfen.");
      return;
    }
    tracking.arrivalAt=now;
    showArrivalCaptured(now);
  };

  const originalStart=window.startServiceProcess;
  const originalReport=window.openServiceReportStep;
  const originalUpdate=window.updateServiceEntry;
  const originalBuild=window.buildRegieberichtHtml;
  const originalReturn=window.finishServiceAndReturn;

  if(typeof originalStart==="function" && typeof originalReport==="function"){
    window.startServiceProcess=function(id){
      const entry=(typeof AppData!=="undefined" ? AppData.kalender?.eintraege||[] : []).find(e=>String(e.id)===String(id));
      if(entry?.typ==="notdienst") return originalStart(id);
      window[trackingKey]={id:String(id),startedAt:new Date().toISOString(),arrivalAt:null};
      originalStart(id);
      // Der Beginn ist mit dem ersten Klick gesetzt. Kein zusätzlicher
      // Navigations-/Ohne-Navigation-Zwischenschritt mehr.
      window.openServiceReportStep();
    };
    window.openServiceReportStep=function(){
      originalReport();
      addArrivalControl();
    };
  }

  if(typeof originalUpdate==="function"){
    window.updateServiceEntry=async function(changes){
      const next={...(changes||{})};
      const report=next.regiebericht;
      const tracking=window[trackingKey];
      if(report && tracking){
        const started=report.gestartet||tracking.startedAt;
        const ended=report.beendet||new Date().toISOString();
        const total=minutes(started,ended);
        report.gesamtzeit_minuten=total;
        if(tracking.arrivalAt){
          const arrival=Date.parse(tracking.arrivalAt);
          const start=Date.parse(started);
          const end=Date.parse(ended);
          if(Number.isFinite(arrival)&&Number.isFinite(start)&&Number.isFinite(end)&&arrival>=start&&arrival<=end){
            report.ankunft=tracking.arrivalAt;
            report.fahrzeit_minuten=minutes(started,tracking.arrivalAt);
            report.arbeitszeit_vor_ort_minuten=minutes(tracking.arrivalAt,ended);
            // Kompatibel zum bisherigen Feld: Gesamtzeit vom Start bis Ende.
            report.arbeitszeit_minuten=total;
          }
        }else{
          delete report.ankunft;
          delete report.fahrzeit_minuten;
          delete report.arbeitszeit_vor_ort_minuten;
          report.arbeitszeit_minuten=total;
        }
      }
      return originalUpdate(next);
    };
  }

  if(typeof originalBuild==="function"){
    window.buildRegieberichtHtml=function(entry){
      let html=originalBuild(entry);
      const r=entry?.regiebericht||{};
      if(r.fahrzeit_minuten!==undefined && r.arbeitszeit_vor_ort_minuten!==undefined){
        const total=Number(r.gesamtzeit_minuten??r.arbeitszeit_minuten??0);
        const replacement=
          '<div><b>Fahrzeit:</b><br>'+Number(r.fahrzeit_minuten||0)+' Minuten</div>'+
          '<div><b>Arbeitszeit vor Ort:</b><br>'+Number(r.arbeitszeit_vor_ort_minuten||0)+' Minuten</div>'+
          '<div><b>Gesamtzeit:</b><br>'+total+' Minuten</div>';
        const old='<div><b>Arbeitszeit:</b><br>'+Number(r.arbeitszeit_minuten||0)+' Minuten</div>';
        html=html.replace(old,replacement);
      }else{
        const old='<div><b>Arbeitszeit:</b><br>'+Number(r.arbeitszeit_minuten||0)+' Minuten</div>';
        html=html.replace(old,'<div><b>Arbeitszeit gesamt:</b><br>'+Number(r.arbeitszeit_minuten||0)+' Minuten</div>');
      }
      return html;
    };
  }

  if(typeof originalReturn==="function"){
    window.finishServiceAndReturn=function(){
      const result=originalReturn();
      window[trackingKey]=null;
      return result;
    };
  }

  console.log("Außendienst-Zeiterfassung geladen");
})();

/* Außendienst: Entwurf automatisch speichern und später fortsetzen. */
(function(){
  if(window.__aussendienstDraftFixInstalled) return;
  window.__aussendienstDraftFixInstalled=true;

  const tracking=()=>window.__aussendienstZeitTracking;
  const getEntry=(id)=>{
    const key=id ?? tracking()?.id ?? window.activeServiceId;
    return (typeof AppData!=="undefined" ? (AppData.kalender?.eintraege||[]) : []).find(e=>String(e.id)===String(key));
  };
  let saveTimer=null;
  let saveQueue=Promise.resolve();

  function queueDraftSave(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{ saveDraft(); },450);
  }

  function saveDraft(){
    const id=tracking()?.id ?? window.activeServiceId;
    const entry=getEntry(id);
    if(!entry || !id || typeof window.updateServiceEntry!=="function") return saveQueue;
    const vor=document.getElementById("service_vorgefunden");
    const gemacht=document.getElementById("service_gemacht");
    // Nur aus dem Berichtsschritt heraus automatisch speichern.
    if(!vor && !gemacht) return saveQueue;

    const old=entry.regiebericht||{};
    const t=tracking();
    const report={
      ...old,
      vorgefunden:vor ? vor.value : (old.vorgefunden||""),
      gemacht:gemacht ? gemacht.value : (old.gemacht||""),
      material:window.activeServiceMaterials || old.material || [],
      gestartet:old.gestartet || t?.startedAt || window.activeServiceStartedAt || new Date().toISOString(),
      in_bearbeitung:true
    };
    if(t?.arrivalAt) report.ankunft=t.arrivalAt;

    saveQueue=saveQueue.then(()=>window.updateServiceEntry({regiebericht:report}))
      .catch(err=>console.error("Außendienst-Entwurf konnte nicht gespeichert werden:",err));
    window.activeServiceReport=report;
    return saveQueue;
  }

  const previousReport=window.openServiceReportStep;
  if(typeof previousReport==="function"){
    window.openServiceReportStep=function(){
      previousReport();
      const entry=getEntry();
      const saved=window.__aussendienstResumeDraft || entry?.regiebericht || {};
      const vor=document.getElementById("service_vorgefunden");
      const gemacht=document.getElementById("service_gemacht");
      if(vor) vor.value=saved.vorgefunden||"";
      if(gemacht) gemacht.value=saved.gemacht||"";
      window.activeServiceMaterials=Array.isArray(saved.material)?saved.material.map(m=>({...m})):[];
      if(typeof window.renderServiceMaterials==="function") window.renderServiceMaterials();
      [vor,gemacht].forEach(el=>el?.addEventListener("input",queueDraftSave));
      window.activeServiceReport={...saved,material:window.activeServiceMaterials};
      window.__aussendienstResumeDraft=null;
      if(saved.ankunft && tracking()){
        tracking().arrivalAt=saved.ankunft;
        const btn=document.getElementById("service_arrival_button");
        const status=document.getElementById("service_arrival_status");
        if(btn){btn.disabled=true;btn.textContent="✓ Ankunft erfasst";}
        if(status)status.textContent="Ankunft: "+new Date(saved.ankunft).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+" Uhr · Fahrtzeit wird separat ausgewiesen.";
      }
    };
  }

  const previousStart=window.startServiceProcess;
  if(typeof previousStart==="function"){
    window.startServiceProcess=function(id){
      const entry=getEntry(id);
      if(entry?.typ==="notdienst") return previousStart(id);
      const saved=entry?.regiebericht||{};
      const resume=!!saved.in_bearbeitung && !!saved.gestartet;
      window.__aussendienstResumeDraft=resume?saved:null;
      previousStart(id);
      if(resume){
        window.activeServiceStartedAt=saved.gestartet;
        if(tracking()){
          tracking().startedAt=saved.gestartet;
          tracking().arrivalAt=saved.ankunft||null;
        }
      }
      // Status und Startzeit bereits beim Start sichern, nicht erst beim Abschluss.
      queueMicrotask(()=>saveDraft());
    };
  }

  const previousAdd=window.addServiceMaterial;
  if(typeof previousAdd==="function"){
    window.addServiceMaterial=function(){
      const result=previousAdd();
      saveDraft();
      return result;
    };
  }
  const previousRemove=window.removeServiceMaterial;
  if(typeof previousRemove==="function"){
    window.removeServiceMaterial=function(index){
      const result=previousRemove(index);
      saveDraft();
      return result;
    };
  }

  const previousClose=window.closeServiceModal;
  if(typeof previousClose==="function"){
    window.closeServiceModal=function(){
      if(document.getElementById("service_vorgefunden") || document.getElementById("service_gemacht")){
        clearTimeout(saveTimer);
        // Den Speichervorgang sofort anstoßen, bevor das Formular entfernt wird.
        saveDraft();
      }
      return previousClose();
    };
  }

  const previousUpdate=window.updateServiceEntry;
  if(typeof previousUpdate==="function"){
    window.updateServiceEntry=async function(changes){
      const next={...(changes||{})};
      if(next.regiebericht && (next.regiebericht.abgeschlossen===true ||
          (next.status==="offen" && next.regiebericht.abgeschlossen===false))){
        next.regiebericht={...next.regiebericht,in_bearbeitung:false};
      }
      return previousUpdate(next);
    };
  }

  const previousDetails=window.openKalenderEntryDetails;
  if(typeof previousDetails==="function"){
    window.openKalenderEntryDetails=function(id){
      const entry=getEntry(id);
      previousDetails(id);
      if(entry?.typ==="notdienst") return;
      if(entry?.regiebericht?.in_bearbeitung){
        const buttons=[...document.querySelectorAll("#kal_modal_content button")];
        const startButton=buttons.find(b=>(b.getAttribute("onclick")||"").includes("startServiceProcess"));
        if(startButton) startButton.textContent="▶️ Einsatz fortsetzen";
      }
    };
  }


  const previousArrival=window.captureServiceArrival;
  if(typeof previousArrival==="function"){
    window.captureServiceArrival=function(){
      const result=previousArrival();
      saveDraft();
      return result;
    };
  }

  console.log("Außendienst-Entwürfe werden automatisch gespeichert");
})();
