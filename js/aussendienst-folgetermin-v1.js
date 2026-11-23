/* Außendienst-Folgetermin: ein Auftrag, ein Kalendereintrag, mehrere Einsatzabschnitte.
   Ausschließlich normale Außendiensttermine; Notdienst bleibt unverändert. */
(function(){
  if(window.__aussendienstFolgeterminInstalled) return;
  window.__aussendienstFolgeterminInstalled=true;

  const entries=()=>AppData?.kalender?.eintraege||[];
  const getEntry=id=>entries().find(e=>String(e.id)===String(id));
  const isFollowup=e=>e && e.typ==="termin" && e.status==="offen" && e.regiebericht?.folge_termin_notwendig===true;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const mins=(a,b)=>{const x=Date.parse(a),y=Date.parse(b);return Number.isFinite(x)&&Number.isFinite(y)?Math.max(0,Math.round((y-x)/60000)):0;};
  const time=v=>v?new Date(v).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"—";
  const dateText=v=>v?new Date(v+"T12:00:00").toLocaleDateString("de-DE"):"—";
  const deltaText=(current,base)=>{
    current=String(current||"");base=String(base||"");
    if(current===base)return "";
    if(base && current.startsWith(base))return current.slice(base.length).trim();
    return current.trim();
  };
  const materialDelta=(current,base)=>{
    const remaining=(base||[]).map(x=>JSON.stringify(x));
    return (current||[]).filter(x=>{
      const key=JSON.stringify(x),i=remaining.indexOf(key);
      if(i<0)return true; remaining.splice(i,1); return false;
    }).map(x=>({...x}));
  };
  function makeSession(report,started,arrival,ended,baseline,index){
    const fahr=arrival?mins(started,arrival):null;
    const onsite=arrival?mins(arrival,ended):mins(started,ended);
    return {
      nummer:index,
      gestartet:started||report.gestartet||null,
      ankunft:arrival||null,
      beendet:ended||null,
      fahrzeit_minuten:fahr,
      arbeitszeit_vor_ort_minuten:arrival?onsite:null,
      arbeitszeit_minuten:onsite,
      vorgefunden:String(report.vorgefunden||""),
      gemacht:String(report.gemacht||""),
      material:(report.material||[]).map(x=>({...x})),
      fotos:(report.fotos||[]).slice()
    };
  }
  function baselineFrom(report){
    return {vorgefunden:report.vorgefunden||"",gemacht:report.gemacht||"",material:(report.material||[]).map(x=>({...x}))};
  }
  function totalMinutes(sessions){return (sessions||[]).reduce((n,s)=>n+(Number(s.arbeitszeit_minuten)||0),0);}

  // Folgetermin abschließen: aktuellen Besuch als eigenen Einsatzabschnitt sichern.
  window.markServiceFollowUp=async function(){
    const id=window.activeServiceId;
    const entry=getEntry(id);
    if(!entry || entry.typ==="notdienst") return;
    const current=window.activeServiceReport||{};
    const old=entry.regiebericht||{};
    const tracking=window.__aussendienstZeitTracking||{};
    const started=tracking.startedAt||window.activeServiceStartedAt||old.gestartet;
    const ended=new Date().toISOString();
    const sessions=(old.einsaetze||[]).slice();
    const baseline=window.__followupBaseline||old.folge_baseline||null;
    sessions.push(makeSession(current,started,tracking.arrivalAt||old.ankunft||null,ended,baseline,sessions.length+1));
    const next={
      ...old,
      ...current,
      // Die aktuellen Eingaben sind als eigener Einsatzabschnitt gesichert.
      // Für den nächsten Besuch startet das Formular mit leeren Feldern.
      vorgefunden:"",
      gemacht:"",
      material:[],
      fotos:[],
      einsaetze:sessions,
      folge_termin_notwendig:true,
      abgeschlossen:false,
      in_bearbeitung:false,
      folge_baseline:null,
      letzter_einsatz_beendet:ended,
      // Die Zeitfelder der einzelnen Besuche liegen in einsaetze[].
      gestartet:null, ankunft:null, beendet:null,
      fahrzeit_minuten:null, arbeitszeit_vor_ort_minuten:null,
      gesamtzeit_minuten:totalMinutes(sessions),
      arbeitszeit_minuten:totalMinutes(sessions)
    };
    window.activeServiceReport=next;
    // Die erste Besuchszeit ist bereits in einsaetze[] berechnet; die normale
    // Einzeleinsatz-Zeitlogik darf diese Werte nicht erneut überschreiben.
    window.__aussendienstZeitTracking=null;
    await window.updateServiceEntry({status:"offen",regiebericht:next});
    window.__followupActive=false;
    window.__followupBaseline=null;
    window.activeServiceStartedAt=null;
    window.closeServiceModal?.();
    if(typeof renderKalender==="function")renderKalender();
    if(typeof renderKalenderWeek==="function")renderKalenderWeek();
    alert("Folgetermin vorgemerkt. Der Auftrag bleibt rot im Kalender und kann auf einen neuen Tag verschoben werden.");
  };

  // Start des Folgeeinsatzes: neue Zeitmessung, bisherige Angaben bleiben erhalten.
  const oldStart=window.startServiceProcess;
  if(typeof oldStart==="function"){
    window.startServiceProcess=function(id){
      const entry=getEntry(id);
      if(entry?.typ==="notdienst") return oldStart(id);
      if(isFollowup(entry) || (entry?.typ==="termin" && (entry.regiebericht?.einsaetze||[]).length)){
        const r=entry.regiebericht||{};
        const base=r.folge_baseline || (!r.in_bearbeitung ? baselineFrom(r) : baselineFrom(r));
        r.folge_baseline=base;
        entry.regiebericht=r;
        window.__followupBaseline=base;
        window.__followupActive=true;
      }else{
        window.__followupBaseline=null;
        window.__followupActive=false;
      }
      const result=oldStart(id);
      return result;
    };
  }

  // Im Berichtsschritt die bisherigen Besuchsabschnitte sichtbar halten.
  const oldReport=window.openServiceReportStep;
  if(typeof oldReport==="function"){
    window.openServiceReportStep=function(){
      const result=oldReport();
      const id=window.activeServiceId,entry=getEntry(id),r=entry?.regiebericht||{};
      if(entry?.typ==="termin" && (r.einsaetze||[]).length){
        const sessions=r.einsaetze||[];
        const history='<div id="followup-history" style="padding:12px;margin:0 0 14px;border:1px solid #3b82c4;border-radius:10px;background:#102a43">'+
          '<div style="font-weight:800;margin-bottom:8px">↻ Bisherige Einsatzabschnitte</div>'+
          sessions.map(s=>'<div style="padding:8px 0;border-top:1px solid #345574;font-size:12px"><b>Einsatz '+s.nummer+' · '+dateText((s.gestartet||"").slice(0,10))+'</b><br>Beginn '+time(s.gestartet)+' · Ende '+time(s.beendet)+' · '+(Number(s.arbeitszeit_minuten)||0)+' Min.'+
          (s.ankunft?' · Fahrt '+(Number(s.fahrzeit_minuten)||0)+' Min.':'')+
          (s.vorgefunden?'<div style="margin-top:6px"><b>Vorgefunden:</b><br>'+esc(s.vorgefunden).replace(/\n/g,"<br>")+'</div>':"")+
          (s.gemacht?'<div style="margin-top:6px;color:#c5d9eb"><b>Durchgeführte Arbeiten:</b><br>'+esc(s.gemacht).replace(/\n/g,"<br>")+'</div>':"")+'</div>').join("")+
          '<div style="font-size:12px;color:#b8d5ee;margin-top:8px">Die bisherigen Einsatzabschnitte bleiben unverändert. Erfasse unten ausschließlich die Arbeiten dieses Besuchs.</div></div>';
        const content=document.getElementById("service_modal_content");
        if(content && !document.getElementById("followup-history"))content.insertAdjacentHTML("afterbegin",history);
      }
      // Die beiden Textfelder sind immer dem gerade laufenden Besuch zugeordnet.
      const visitNumber=(r.einsaetze||[]).length+1;
      const content=document.getElementById("service_modal_content");
      if(content){
        [...content.querySelectorAll(".sec")].forEach(label=>{
          if(label.textContent.includes("Was wurde vorgefunden?"))label.textContent="Einsatz "+visitNumber+" – Vorgefunden";
          if(label.textContent.includes("Was wurde gemacht?"))label.textContent="Einsatz "+visitNumber+" – Durchgeführte Arbeiten";
        });
        const vor=document.getElementById("service_vorgefunden");
        const gemacht=document.getElementById("service_gemacht");
        if(vor)vor.placeholder="Was wurde bei Einsatz "+visitNumber+" vorgefunden?";
        if(gemacht)gemacht.placeholder="Welche Arbeiten wurden bei Einsatz "+visitNumber+" durchgeführt?";
      }
      return result;
    };
  }

  // Beim endgültigen Abschluss aktuellen Einsatz ergänzen und Gesamtzeit summieren.
  const oldUpdate=window.updateServiceEntry;
  if(typeof oldUpdate==="function"){
    window.updateServiceEntry=async function(changes){
      const next={...(changes||{})},r=next.regiebericht;
      const id=window.activeServiceId,entry=getEntry(id);
      if(r?.abgeschlossen===true && entry?.typ==="termin" && ((r.einsaetze||[]).length || window.__followupActive)){
        const tracking=window.__aussendienstZeitTracking||{};
        const started=tracking.startedAt||r.gestartet||window.activeServiceStartedAt;
        const ended=r.beendet||new Date().toISOString();
        const sessions=((r.einsaetze&&r.einsaetze.length)?r.einsaetze:(entry.regiebericht?.einsaetze||[])).slice();
        const baseline=window.__followupBaseline||r.folge_baseline||entry.regiebericht?.folge_baseline||null;
        sessions.push(makeSession(r,started,tracking.arrivalAt||r.ankunft||null,ended,baseline,sessions.length+1));
        r.einsaetze=sessions;
        // Gemeinsamer Bericht: Arbeiten und Material aller Besuche zusammenführen.
        r.vorgefunden=sessions.map(s=>"Einsatz "+s.nummer+":\n"+(s.vorgefunden||"—")).join("\n\n");
        r.gemacht=sessions.map(s=>"Einsatz "+s.nummer+":\n"+(s.gemacht||"—")).join("\n\n");
        r.material=sessions.flatMap(s=>(s.material||[]).map(m=>({...m})));
        r.gesamtzeit_minuten=totalMinutes(sessions);
        r.arbeitszeit_minuten=totalMinutes(sessions);
        r.folge_termin_notwendig=false;
        r.folge_baseline=null;
        next.regiebericht=r;
        // Einsatzabschnitte sind vollständig berechnet; keine nachgelagerte
        // Einzelzeitberechnung über den letzten Besuch laufen lassen.
        window.__aussendienstZeitTracking=null;
      }
      return oldUpdate(next);
    };
  }

  // Gemeinsamer Regiebericht: Zeitübersicht aller Besuche ergänzen.
  const oldBuild=window.buildRegieberichtHtml;
  if(typeof oldBuild==="function"){
    window.buildRegieberichtHtml=function(entry){
      let html=oldBuild(entry);
      const sessions=entry?.regiebericht?.einsaetze||[];
      if(!sessions.length)return html;
      const rows=sessions.map(s=>'<tr><td>Einsatz '+Number(s.nummer||0)+'</td><td>'+dateText((s.gestartet||"").slice(0,10))+'</td><td>'+time(s.gestartet)+' – '+time(s.beendet)+'</td><td class="num">'+(Number(s.arbeitszeit_minuten)||0)+' Min.</td><td class="num">'+(s.ankunft?(Number(s.fahrzeit_minuten)||0)+' Min.':"—")+'</td></tr>').join("");
      const section='<section><h3>Einsatzverlauf und Arbeitszeiten</h3><table><thead><tr><th>Abschnitt</th><th>Datum</th><th>Uhrzeit</th><th class="num">Arbeitszeit</th><th class="num">Fahrtzeit</th></tr></thead><tbody>'+rows+'</tbody></table><div style="text-align:right;font-weight:700;margin-top:6px">Gesamtarbeitszeit: '+totalMinutes(sessions)+' Minuten</div></section>';
      const workSections=sessions.map(s=>'<section><h3>Einsatz '+Number(s.nummer||0)+' · '+dateText((s.gestartet||"").slice(0,10))+'</h3>'+
        '<div class="rb-text"><b>Vorgefunden:</b><br>'+esc(s.vorgefunden||"Keine Angaben") .replace(/\n/g,"<br>")+'</div>'+
        '<div class="rb-text" style="margin-top:3mm"><b>Durchgeführte Arbeiten:</b><br>'+esc(s.gemacht||"Keine Angaben").replace(/\n/g,"<br>")+'</div></section>').join("");
      html=html.replace(/<section><h3>Vorgefunden<\/h3>[\s\S]*?<\/section>\s*<section><h3>Durchgeführte Arbeiten<\/h3>[\s\S]*?<\/section>/,workSections);
      return html.replace('<section><h3>Verwendetes Material</h3>',section+'<section><h3>Verwendetes Material</h3>');
    };
  }

  // Offenen Auftrag direkt im Detail öffnen und ein neues Datum auswählen.
  async function moveFollowupDate(id,date,von,bis){
    const entry=getEntry(id);
    if(!isFollowup(entry) || !date)return alert("Dieser Auftrag ist kein offener Folgetermin.");
    if(!von || !bis)return alert("Bitte Datum sowie Beginn und Ende des Folgetermins eingeben.");
    if(bis<=von)return alert("Die Endzeit muss nach der Beginnzeit liegen.");
    try{
      if(window.supabaseReady && window.supabaseClient && !String(id).startsWith("LOCAL-")){
        const {data,error}=await window.supabaseClient.from("kalender_eintraege").update({datum:date,von,bis}).eq("id",id).select("*").maybeSingle();
        if(error)throw error;
        if(data){
          const normalized=typeof normalizeKalenderEntry==="function"?normalizeKalenderEntry(data):data;
          const i=entries().findIndex(e=>String(e.id)===String(id));
          if(i>=0)AppData.kalender.eintraege[i]=normalized;
        }
      }else{
        entry.datum=date;entry.von=von;entry.bis=bis;
        if(typeof saveAppData==="function")saveAppData();
      }
      if(typeof renderKalender==="function")renderKalender();
      if(typeof renderKalenderWeek==="function")renderKalenderWeek();
      window.closeKalenderModal?.();
      alert("Folgetermin wurde auf den "+dateText(date)+" von "+von+" bis "+bis+" Uhr verschoben.");
    }catch(err){
      console.error("Folgetermin verschieben fehlgeschlagen:",err);
      alert("Der Folgetermin konnte nicht verschoben werden: "+(err.message||err));
    }
  }
  window.moveFollowupDate=moveFollowupDate;

  function openFollowupMoveList(date){
    const pending=entries().filter(isFollowup);
    if(!pending.length){
      alert("Es gibt derzeit keine offenen Folgetermine.");
      return;
    }
    const html='<div style="font-size:13px;color:#a9c5df;margin-bottom:12px">Lege den ausgewählten Auftrag auf '+dateText(date)+' und gib die geplante Uhrzeit an.</div>'+
      '<label style="display:block;font-size:12px;margin-bottom:5px">Von</label><input id="followup_day_von" type="time" value="09:00" style="width:100%;padding:11px;margin-bottom:9px">'+
      '<label style="display:block;font-size:12px;margin-bottom:5px">Bis</label><input id="followup_day_bis" type="time" value="10:00" style="width:100%;padding:11px;margin-bottom:12px">'+
      pending.map(e=>'<button type="button" class="btnS" style="display:block;width:100%;text-align:left;padding:12px;margin-bottom:8px" onclick="moveFollowupDate(\''+esc(e.id)+'\',\''+esc(date)+'\',document.getElementById(\'followup_day_von\').value,document.getElementById(\'followup_day_bis\').value)"><b>'+esc(e.titel)+'</b><br><span style="font-size:12px">Bisher: '+dateText(e.datum)+' · '+esc([e.vorname,e.nachname].filter(Boolean).join(" "))+'</span></button>').join("");
    openKalenderModal("↻ Folgetermin auf diesen Tag legen",html);
  }
  window.openFollowupMoveList=openFollowupMoveList;

  const oldDay=window.openKalenderDay;
  if(typeof oldDay==="function"){
    window.openKalenderDay=function(date){
      const result=oldDay(date);
      const content=document.getElementById("kal_modal_content");
      if(content && !document.getElementById("followup-move-day")){
        const btn=document.createElement("button");
        btn.id="followup-move-day";btn.type="button";btn.className="btnS";
        btn.style.cssText="width:100%;padding:12px;margin:0 0 12px";
        btn.textContent="↻ Offenen Folgetermin auf diesen Tag legen";
        btn.onclick=()=>openFollowupMoveList(date);
        content.insertBefore(btn,content.firstChild);
      }
      return result;
    };
  }

  const oldDetails=window.openKalenderEntryDetails;
  if(typeof oldDetails==="function"){
    window.openKalenderEntryDetails=function(id){
      const entry=getEntry(id);
      const result=oldDetails(id);
      if(!isFollowup(entry))return result;
      const content=document.getElementById("kal_modal_content");
      if(!content)return result;
      // Den bisher blockierenden Hinweis durch eine Fortsetzen-Aktion ersetzen.
      const card=content.querySelector(".card");
      if(card){
        const notice=[...card.querySelectorAll("div")].find(el=>el.textContent.includes("Dieser Einsatz wurde bereits bearbeitet."));
        if(notice)notice.outerHTML='<button class="btnP" style="width:100%;padding:14px;margin-top:18px" onclick="startServiceProcess(\''+esc(entry.id)+'\')">▶️ Folgetermin / Einsatz fortsetzen</button>';
      }
      const panel=document.createElement("div");
      panel.style.cssText="margin-top:14px;padding:12px;border:1px solid #345574;border-radius:10px;background:#102a43";
      panel.innerHTML='<div style="font-weight:800;margin-bottom:8px">📅 Folgetermin planen</div>'+
        '<label style="display:block;font-size:12px;margin-bottom:6px">Neues Einsatzdatum</label><input id="followup_new_date" type="date" value="'+esc(entry.datum)+'" style="width:100%;padding:11px;border-radius:7px;margin-bottom:9px">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label style="display:block;font-size:12px;margin-bottom:5px">Von</label><input id="followup_new_von" type="time" value="'+esc(entry.von||"09:00")+'" style="width:100%;padding:11px;border-radius:7px"></div><div><label style="display:block;font-size:12px;margin-bottom:5px">Bis</label><input id="followup_new_bis" type="time" value="'+esc(entry.bis||"10:00")+'" style="width:100%;padding:11px;border-radius:7px"></div></div>'+
        '<button class="btnS" style="width:100%;padding:11px;margin-top:10px" onclick="moveFollowupDate(\''+esc(entry.id)+'\',document.getElementById(\'followup_new_date\').value,document.getElementById(\'followup_new_von\').value,document.getElementById(\'followup_new_bis\').value)">Termin übernehmen</button>'+
        '<div style="font-size:11px;color:#a9c5df;margin-top:7px">Der ursprüngliche Einsatztag und alle bisherigen Angaben bleiben im gemeinsamen Regiebericht dokumentiert.</div>';
      content.appendChild(panel);
      return result;
    };
  }

  // Nach Abschluss den lokalen Folgetermin-Kontext zurücksetzen.
  const oldReturn=window.finishServiceAndReturn;
  if(typeof oldReturn==="function"){
    window.finishServiceAndReturn=function(){
      window.__followupActive=false;window.__followupBaseline=null;
      return oldReturn();
    };
  }

  console.log("Außendienst-Folgetermin-Workflow geladen");
})();