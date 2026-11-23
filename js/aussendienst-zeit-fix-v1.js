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
        html=html.replace(/<div><b>Arbeitszeit:<\\/b><br>\\d+ Minuten<\\/div>/,replacement);
      }else{
        html=html.replace(/<div><b>Arbeitszeit:<\\/b><br>(\\d+) Minuten<\\/div>/,
          '<div><b>Arbeitszeit gesamt:</b><br>$1 Minuten</div>');
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