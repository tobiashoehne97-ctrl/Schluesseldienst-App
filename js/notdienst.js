let selectedNotdienstType = "Türöffnung";

const NOTDIENST_STATUS = [
  {key:"notdienst", label:"🚨 Neu", next:"unterwegs"},
  {key:"unterwegs", label:"🚗 Unterwegs", next:"vor_ort"},
  {key:"vor_ort", label:"📍 Vor Ort", next:"arbeit"},
  {key:"arbeit", label:"🔧 Arbeit läuft", next:"erledigt"},
  {key:"erledigt", label:"✅ Abgeschlossen", next:null}
];

function pad2(value){ return String(value).padStart(2,"0"); }
function notdienstToday(){ const d=new Date(); return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
function notdienstNow(){ const d=new Date(); return pad2(d.getHours())+":"+pad2(d.getMinutes()); }
function escapeNd(v){ return String(v||"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function isNotdienstEntry(e){ return e && e.typ === "notdienst"; }
function notdienstStatusInfo(status){ return NOTDIENST_STATUS.find(s=>s.key===status) || NOTDIENST_STATUS[0]; }

function ensureNotdienstView(){
  const host=document.getElementById("notdienst"); if(!host) return null;
  let box=document.getElementById("notdienstAktiv");
  if(!box){ box=document.createElement("div"); box.id="notdienstAktiv"; box.className="notdienst-active-list"; const form=document.getElementById("notdienstForm"); host.insertBefore(box,form||null); }
  return box;
}

function renderNotdienst(){
  const box=ensureNotdienstView(); if(!box) return;
  const entries=(window.AppData?.kalender?.eintraege||[]).filter(isNotdienstEntry).sort((a,b)=>((b.datum||"")+(b.von||"")).localeCompare((a.datum||"")+(a.von||"")));
  const active=entries.filter(e=>e.status!=="erledigt");
  const finished=entries.filter(e=>e.status==="erledigt").slice(0,5);
  if(!entries.length){ box.innerHTML=`<div class="notdienst-section-title">AKTIVE EINSÄTZE</div><div class="notdienst-empty-card">🚨 Aktuell ist kein Notfalleinsatz aktiv.</div>`; return; }

  const card=e=>{
    const info=notdienstStatusInfo(e.status), customer=[e.vorname,e.nachname].filter(Boolean).join(" ")||"Kunde";
    const address=[e.strasse,e.hausnummer].filter(Boolean).join(" "), city=[e.postleitzahl,e.ort].filter(Boolean).join(" ");
    const description=String(e.beschreibung||"").replace(/^\[NOTFALL\]\s*/i,"").trim();
    const statusIndex=NOTDIENST_STATUS.findIndex(s=>s.key===info.key), progress=info.key==="erledigt"?100:Math.round((statusIndex/(NOTDIENST_STATUS.length-1))*100);
    const buttons=NOTDIENST_STATUS.filter(s=>s.key!=="erledigt" || info.key==="arbeit").map(s=>{
      const current=s.key===info.key, disabled=s.key!==info.key && s.key!==info.next;
      return `<button class="notdienst-status-btn ${current?"current":""}" ${disabled?"disabled":""} onclick="updateNotdienstStatus('${escapeNd(e.id)}','${s.key}')">${s.label}</button>`;
    }).join("");
    return `<article class="notdienst-active-card ${info.key}">
      <div class="notdienst-active-head"><div><div class="notdienst-active-badge">${info.label}</div><h3>${escapeNd(e.titel)}</h3><div class="notdienst-meta">📅 ${escapeNd((e.datum||"").split("-").reverse().join("."))} · 🕒 ${escapeNd(e.von||"")} · 👤 ${escapeNd(e.mitarbeiter||"-")}</div></div><div class="notdienst-progress"><span style="width:${progress}%"></span></div></div>
      <div class="notdienst-customer-grid">
        <div><small>KUNDE</small><strong>${escapeNd(customer)}</strong></div>
        <div><small>TELEFON</small><strong>${e.telefonnummer?`<a href="tel:${escapeNd(e.telefonnummer)}">${escapeNd(e.telefonnummer)}</a>`:"–"}</strong></div>
        <div><small>ADRESSE</small><strong>${escapeNd([address,city].filter(Boolean).join(" · ")||"–")}</strong></div>
        <div><small>EINSATZINFO</small><strong>${escapeNd(description||"Keine weitere Angabe")}</strong></div>
      </div>
      <div class="notdienst-status-actions">${buttons}</div>
      <div class="notdienst-card-actions">
        ${info.key!=="erledigt"?`<button class="btnP" onclick="openNotdienstNavigation('${escapeNd(e.id)}')">🧭 Navigation</button>`:""}
        ${info.key!=="notdienst"?`<button class="btnS" onclick="openNotdienstRegiebericht('${escapeNd(e.id)}')">📄 Regiebericht</button>`:""}
        ${info.key==="arbeit"?`<button class="btnP" onclick="updateNotdienstStatus('${escapeNd(e.id)}','erledigt')">✅ Einsatz abschließen</button>`:""}
      </div>
    </article>`;
  };
  box.innerHTML=`<div class="notdienst-section-title">AKTIVE EINSÄTZE</div>${active.length?active.map(card).join(""):"<div class=\"notdienst-empty-card\">✅ Keine offenen Notfalleinsätze.</div>"}`+(finished.length?`<div class="notdienst-section-title notdienst-finished-title">LETZTE ABGESCHLOSSENE EINSÄTZE</div>${finished.map(card).join("")}`:"");
}

async function updateNotdienstStatus(id,status){
  const entry=(window.AppData?.kalender?.eintraege||[]).find(e=>String(e.id)===String(id)); if(!entry) return;
  try{
    if(window.supabaseReady && window.supabaseClient && !String(id).startsWith("LOCAL-")){
      const {error}=await window.supabaseClient.from("kalender_eintraege").update({status}).eq("id",id); if(error) throw error; await loadKalenderFromSupabase();
    }else{
      entry.status=status; if(typeof saveAppData==="function") saveAppData(); if(typeof renderKalender==="function") renderKalender(); if(typeof renderDashboardWeek==="function") renderDashboardWeek();
    }
    renderNotdienst(); if(status==="vor_ort") openNotdienstRegiebericht(id);
  }catch(err){ console.error("Notdienst Status konnte nicht gespeichert werden:",err); alert("Der Status konnte nicht gespeichert werden: "+(err?.message||"Unbekannter Fehler")); }
}

function getNotdienstAddress(entry){ return [[entry.strasse,entry.hausnummer].filter(Boolean).join(" "),[entry.postleitzahl,entry.ort].filter(Boolean).join(" ")].filter(Boolean).join(", "); }
function openNotdienstNavigation(id){
  const entry=(window.AppData?.kalender?.eintraege||[]).find(e=>String(e.id)===String(id)); if(!entry) return;
  const address=getNotdienstAddress(entry); if(!address){alert("Für diesen Einsatz ist keine vollständige Adresse hinterlegt.");return;}
  const encoded=encodeURIComponent(address),ua=navigator.userAgent||"";
  if(/iPhone|iPad|iPod/i.test(ua)){ window.location.href="maps://?daddr="+encoded; setTimeout(()=>{window.location.href="http://maps.apple.com/?daddr="+encoded;},500); }
  else if(/Android/i.test(ua)){ window.location.href="geo:0,0?q="+encoded; setTimeout(()=>{window.location.href="https://www.google.com/maps/dir/?api=1&destination="+encoded;},700); }
  else window.open("https://www.google.com/maps/dir/?api=1&destination="+encoded,"_blank");
}

function openNotdienstRegiebericht(id){
  const entry=(window.AppData?.kalender?.eintraege||[]).find(e=>String(e.id)===String(id)); if(!entry) return;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.value=value||"";};
  if(typeof iRB==="function") iRB();
  set("rb_dat",entry.datum); set("rb_vn",entry.vorname); set("rb_nn",entry.nachname); set("rb_tel",entry.telefonnummer);
  set("rb_adr",[entry.strasse,entry.hausnummer].filter(Boolean).join(" ")); set("rb_plz",entry.postleitzahl); set("rb_ort",entry.ort);
  set("rb_bau","Notdiensteinsatz – "+(entry.titel||"")); set("rb_bem",String(entry.beschreibung||"").replace(/^\[NOTFALL\]\s*/i,""));
  const modal=document.getElementById("serviceModal");
  if(modal){ modal.classList.add("service-report-modal"); modal.classList.remove("hidden"); modal.style.display="flex"; document.body.style.overflow="hidden"; }
  else if(typeof go==="function") go("kalender");
}

function openNotdienstForm(){
  const start=document.getElementById("notdienstStart"),form=document.getElementById("notdienstForm"); if(start)start.classList.add("hidden"); if(form)form.classList.remove("hidden");
  document.getElementById("nd_datum").value=notdienstToday(); document.getElementById("nd_uhrzeit").value=notdienstNow(); document.getElementById("nd_normaler_termin").checked=false;
  ["nd_vorname","nd_nachname","nd_telefon","nd_strasse","nd_plz","nd_ort","nd_beschreibung"].forEach(id=>document.getElementById(id).value=""); selectedNotdienstType="Türöffnung";
  document.querySelectorAll(".notdienst-type").forEach(btn=>btn.classList.toggle("active",btn.dataset.type==="Türöffnung"));
  const saved=localStorage.getItem("schluesseldienst-mobile-employee"); if(saved&&document.getElementById("nd_mitarbeiter"))document.getElementById("nd_mitarbeiter").value=saved;
  window.scrollTo({top:0,behavior:"smooth"});
}
function closeNotdienstForm(){ const start=document.getElementById("notdienstStart"),form=document.getElementById("notdienstForm"); if(form)form.classList.add("hidden"); if(start)start.classList.remove("hidden"); renderNotdienst(); }
function selectNotdienstType(type,button){ selectedNotdienstType=type; document.querySelectorAll(".notdienst-type").forEach(btn=>btn.classList.remove("active")); if(button)button.classList.add("active"); }

async function saveNotdienst(startNavigation=false){
  const datum=document.getElementById("nd_datum").value,uhrzeit=document.getElementById("nd_uhrzeit").value,vorname=document.getElementById("nd_vorname").value.trim(),nachname=document.getElementById("nd_nachname").value.trim(),telefon=document.getElementById("nd_telefon").value.trim(),strasse=document.getElementById("nd_strasse").value.trim(),plz=document.getElementById("nd_plz").value.trim(),ort=document.getElementById("nd_ort").value.trim(),beschreibung=document.getElementById("nd_beschreibung").value.trim(),mitarbeiter=document.getElementById("nd_mitarbeiter").value,normalerTermin=document.getElementById("nd_normaler_termin").checked;
  if(!vorname&&!nachname){alert("Bitte mindestens Vor- oder Nachname des Kunden eingeben.");return;}
  const title=[selectedNotdienstType,vorname,nachname].filter(Boolean).join(" – ");
  const entry={titel:title||"Notfalleinsatz",datum,von:uhrzeit?uhrzeit+":00":null,bis:null,typ:normalerTermin?"termin":"notdienst",status:normalerTermin?"geplant":"notdienst",mitarbeiter:mitarbeiter||null,nachname:nachname||null,vorname:vorname||null,telefonnummer:telefon||null,strasse:strasse||null,hausnummer:null,postleitzahl:plz||null,ort:ort||null,beschreibung:"[NOTFALL] "+selectedNotdienstType+(beschreibung?"\n"+beschreibung:"")};
  try{
    let savedEntry=entry;
    if(window.supabaseReady&&window.supabaseClient){
      const {data,error}=await window.supabaseClient.from("kalender_eintraege").insert(entry).select().single(); if(error)throw new Error(error.message||JSON.stringify(error)); savedEntry=data||entry; await loadKalenderFromSupabase();
    }else{
      entry.id="LOCAL-"+Date.now();entry.von=uhrzeit;entry.bis="";if(!window.AppData)window.AppData={};if(!AppData.kalender)AppData.kalender={eintraege:[]};if(!Array.isArray(AppData.kalender.eintraege))AppData.kalender.eintraege=[];AppData.kalender.eintraege.push(entry);saveAppData();renderKalender();alert("Offline gespeichert. Der Einsatz wird nur auf diesem Gerät angezeigt.");
    }
    if(typeof renderDashboardWeek==="function")renderDashboardWeek();renderNotdienst();closeNotdienstForm();
    if(startNavigation&&!normalerTermin){openNotdienstNavigation(savedEntry.id||entry.id);return;}
    alert(normalerTermin?"Der Vorgang wurde als normaler Termin angelegt.":"Der Notfalleinsatz wurde erfolgreich angelegt.");
  }catch(err){console.error("Notdienst konnte nicht gespeichert werden:",err);alert("Der Einsatz konnte nicht gespeichert werden: "+(err?.message||"Unbekannter Fehler"));}
}

function injectNotdienstStyles(){
  if(document.getElementById("notdienstRuntimeStyles"))return;
  const s=document.createElement("style");s.id="notdienstRuntimeStyles";s.textContent=`
    .notdienst-active-list{display:flex;flex-direction:column;gap:14px;margin:0 0 22px}
    .notdienst-section-title{font-size:11px;font-weight:800;letter-spacing:.16em;color:#7eb3e0;margin:8px 2px 2px;text-transform:uppercase}
    .notdienst-finished-title{margin-top:18px}
    .notdienst-empty-card{padding:20px;border:1px solid rgba(59,110,165,.28);border-radius:14px;background:rgba(16,42,64,.55);color:#91b4d2;text-align:center}
    .notdienst-active-card{padding:18px;border-radius:18px;background:linear-gradient(145deg,rgba(20,47,79,.98),rgba(10,28,50,.98));border:1px solid rgba(59,110,165,.38);box-shadow:0 12px 30px rgba(0,0,0,.18)}
    .notdienst-active-card.notdienst{border-color:rgba(249,115,22,.6)}
    .notdienst-active-card.unterwegs{border-color:rgba(234,179,8,.55)}
    .notdienst-active-card.vor_ort{border-color:rgba(59,130,246,.65)}
    .notdienst-active-card.arbeit{border-color:rgba(34,197,94,.58)}
    .notdienst-active-card.erledigt{opacity:.82}
    .notdienst-active-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
    .notdienst-active-badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(249,115,22,.13);color:#ffad72;font-size:11px;font-weight:800;margin-bottom:7px}
    .notdienst-active-card h3{margin:0;color:#f4f9ff;font-size:19px}
    .notdienst-meta{margin-top:6px;color:#80a8ca;font-size:12px}
    .notdienst-progress{width:180px;height:8px;border-radius:99px;background:#091a2a;border:1px solid #23405a;overflow:hidden;flex-shrink:0;margin-top:15px}
    .notdienst-progress span{display:block;height:100%;background:#22c55e;border-radius:99px;transition:width .25s ease}
    .notdienst-customer-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}
    .notdienst-customer-grid>div{padding:11px;border-radius:11px;background:rgba(255,255,255,.035);border:1px solid rgba(120,160,200,.12);min-width:0}
    .notdienst-customer-grid small{display:block;font-size:9px;font-weight:800;letter-spacing:.12em;color:#6f9bc1;margin-bottom:5px}
    .notdienst-customer-grid strong{display:block;color:#eaf5ff;font-size:12px;line-height:1.4;overflow-wrap:anywhere}
    .notdienst-customer-grid a{color:#7ec6ff;text-decoration:none}
    .notdienst-status-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}
    .notdienst-status-btn{padding:9px 11px;border-radius:10px;border:1px solid rgba(59,110,165,.34);background:#102a40;color:#bcd7ed;font-weight:700;font-size:11px;cursor:pointer}
    .notdienst-status-btn.current{background:#2563a8;border-color:#58a6e7;color:#fff}
    .notdienst-status-btn:not(:disabled):hover{border-color:#58a6e7}
    .notdienst-status-btn:disabled{opacity:.35;cursor:not-allowed}
    .notdienst-card-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(120,160,200,.13)}
    @media(max-width:760px){
      .notdienst-header{flex-direction:column;align-items:stretch}
      .notdienst-header h2{font-size:25px}
      .notdienst-new-btn{width:100%}
      .notdienst-active-card{padding:14px}
      .notdienst-active-head{display:block}
      .notdienst-active-card h3{font-size:17px}
      .notdienst-progress{width:100%;margin-top:12px}
      .notdienst-customer-grid{grid-template-columns:1fr 1fr}
      .notdienst-status-actions,.notdienst-card-actions{display:grid;grid-template-columns:1fr 1fr}
      .notdienst-status-btn,.notdienst-card-actions button{width:100%;min-height:42px}
    }
    @media(max-width:430px){.notdienst-customer-grid{grid-template-columns:1fr}.notdienst-status-actions,.notdienst-card-actions{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}

injectNotdienstStyles();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(renderNotdienst,150));else setTimeout(renderNotdienst,150);
setInterval(()=>{if(document.getElementById("notdienst")&&!document.getElementById("notdienst").classList.contains("hidden"))renderNotdienst();},2000);
