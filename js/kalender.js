// Gemeinsamer Kalender: Supabase ist die zentrale Datenquelle.
// Fallback auf lokale Daten nur, wenn die Verbindung nicht verfügbar ist.

function ensureKalenderData(){
  AppData.kalender=AppData.kalender||{eintraege:[],letzterIndex:0};
}

function normalizeKalenderEntry(row){
  return {
    id: row.id,
    titel: row.titel,
    datum: row.datum,
    von: row.von ? String(row.von).slice(0,5) : "",
    bis: row.bis ? String(row.bis).slice(0,5) : "",
    typ: row.typ || "termin",
    status: row.status || "geplant",
    adresse: row.adresse || "",
    nachname: row.nachname || "",
    vorname: row.vorname || "",
    telefonnummer: row.telefonnummer || "",
    strasse: row.strasse || "",
    hausnummer: row.hausnummer || "",
    postleitzahl: row.postleitzahl || "",
    ort: row.ort || "",
    beschreibung: row.beschreibung || ""
  };
}

async function loadKalenderFromSupabase(){
  if(!window.supabaseReady || !window.supabaseClient) return false;
  const {data,error}=await window.supabaseClient
    .from("kalender_eintraege")
    .select("*")
    .order("datum",{ascending:true})
    .order("von",{ascending:true});
  if(error){
    console.error("Kalender laden fehlgeschlagen:",error);
    return false;
  }
  ensureKalenderData();
  AppData.kalender.eintraege=(data||[]).map(normalizeKalenderEntry);
  renderKalender();
  renderKalenderWeek();
  return true;
}

async function saveKalenderEntry(){
  ensureKalenderData();

  const titel=document.getElementById("kal_titel").value.trim();
  const datum=document.getElementById("kal_datum").value;
  const von=document.getElementById("kal_von").value;
  const bis=document.getElementById("kal_bis").value;

  if(!titel||!datum||!von){
    alert("Bitte Titel, Datum und Beginn eingeben.");
    return;
  }

  const entry={
    titel, datum, von:von+":00", bis:bis?bis+":00":null,
    typ:document.getElementById("kal_typ").value,
    status:document.getElementById("kal_status").value,
    nachname:document.getElementById("kal_nachname").value.trim()||null,
    vorname:document.getElementById("kal_vorname").value.trim()||null,
    telefonnummer:document.getElementById("kal_telefonnummer").value.trim()||null,
    strasse:document.getElementById("kal_strasse").value.trim()||null,
    hausnummer:document.getElementById("kal_hausnummer").value.trim()||null,
    postleitzahl:document.getElementById("kal_postleitzahl").value.trim()||null,
    ort:document.getElementById("kal_ort").value.trim()||null,
    beschreibung:document.getElementById("kal_beschreibung").value.trim()||null
  };

  const btn=event?.target;
  if(btn){btn.disabled=true;btn.textContent="⏳ Wird gespeichert...";}

  try{
    if(window.supabaseReady && window.supabaseClient){
      const {error}=await window.supabaseClient.from("kalender_eintraege").insert(entry);
      if(error) throw error;
      await loadKalenderFromSupabase();
    }else{
      entry.id="LOCAL-"+Date.now();
      entry.von=von; entry.bis=bis;
      AppData.kalender.eintraege.push(entry);
      saveAppData();
      renderKalender();
      alert("Offline gespeichert. Der Eintrag wird nur auf diesem Gerät angezeigt.");
    }
    clearKalenderForm();
  }catch(err){
    console.error(err);
    alert("Der Termin konnte nicht gespeichert werden: "+err.message);
  }finally{
    if(btn){btn.disabled=false;btn.textContent="💾 Eintrag speichern";}
  }
}

function clearKalenderForm(){
  ["kal_titel","kal_nachname","kal_vorname","kal_telefonnummer","kal_strasse","kal_hausnummer","kal_postleitzahl","kal_ort","kal_beschreibung","kal_von","kal_bis"].forEach(id=>document.getElementById(id).value="");
}

async function deleteKalenderEntry(id){
  if(!confirm("Termin wirklich löschen?"))return;

  try{
    if(window.supabaseReady && window.supabaseClient && !String(id).startsWith("LOCAL-")){
      const {error}=await window.supabaseClient.from("kalender_eintraege").delete().eq("id",id);
      if(error) throw error;
      await loadKalenderFromSupabase();
    }else{
      AppData.kalender.eintraege=AppData.kalender.eintraege.filter(e=>e.id!==id);
      saveAppData();
      renderKalender();
    }
  }catch(err){
    alert("Termin konnte nicht gelöscht werden: "+err.message);
  }
}

function renderKalender(){
  ensureKalenderData();
  const el=document.getElementById("kalenderListe");
  if(!el)return;

  const datum=document.getElementById("kal_filter_datum")?.value||"";
  const entries=[...AppData.kalender.eintraege]
    .filter(e=>!datum||e.datum===datum)
    .sort((a,b)=>(a.datum+(a.von||"")).localeCompare(b.datum+(b.von||"")));

  if(!entries.length){
    el.innerHTML='<div class="card" style="text-align:center;color:#7eb3e0;padding:30px">📅 Keine Einträge vorhanden.</div>';
    return;
  }

  const colors={
    geplant:"#3b82c4",notdienst:"#f97316",offen:"#ef4444",
    rechnung:"#a855f7",erledigt:"#22c55e",geschaeft:"#14b8a6",
    geschlossen:"#64748b",verfuegbar:"#84cc16"
  };

  el.innerHTML=entries.map(e=>{
    const color=colors[e.status]||colors.geplant;
    return '<div class="card" style="border-left:5px solid '+color+'">'+
      '<div style="display:flex;justify-content:space-between;gap:10px">'+
      '<div style="min-width:0"><div style="font-size:16px;font-weight:800">'+escapeHtml(e.titel)+'</div>'+
      '<div style="font-size:13px;color:#7eb3e0;margin-top:5px">📅 '+e.datum.split("-").reverse().join(".")+' · 🕒 '+(e.von||"")+(e.bis?"–"+e.bis:"")+'</div>'+
      ((e.nachname||e.vorname)?'<div style="font-size:13px;color:#d0e4f5;margin-top:5px">👤 '+escapeHtml([e.vorname,e.nachname].filter(Boolean).join(" "))+'</div>':"")+
      (e.telefonnummer?'<div style="font-size:13px;color:#a0c4e8;margin-top:5px">📞 <a href="tel:'+escapeHtml(e.telefonnummer)+'" style="color:inherit">'+escapeHtml(e.telefonnummer)+'</a></div>':"")+
      ((e.strasse||e.ort||e.adresse)?'<div style="font-size:13px;color:#a0c4e8;margin-top:5px">📍 '+escapeHtml(e.strasse?([e.strasse,e.hausnummer].filter(Boolean).join(" ")+(e.postleitzahl||e.ort?" · "+[e.postleitzahl,e.ort].filter(Boolean).join(" "):"")):e.adresse)+'</div>':"")+
      (e.beschreibung?'<div style="font-size:13px;color:#a0c4e8;margin-top:5px">'+escapeHtml(e.beschreibung)+'</div>':"")+
      '</div><button class="btnD" style="height:38px" onclick="deleteKalenderEntry(\''+e.id+'\')">✕</button></div>'+
      '<div style="margin-top:10px;font-size:12px;font-weight:700;text-transform:uppercase;color:'+color+'">Status: '+escapeHtml(e.status)+'</div></div>';
  }).join("");
}

function escapeHtml(v){
  return String(v||"").replace(/[&<>]/g,c=>c==="&"?"&amp;":c==="<"?"&lt;":"&gt;");
}

async function initKalender(){
  ensureKalenderData();
  const today=new Date().toISOString().slice(0,10);
  const d=document.getElementById("kal_datum");
  if(d&&!d.value)d.value=today;

  renderKalender();
  renderKalenderWeek();
  showKalenderView("woche");

  const connected=await initSupabase();
  if(connected){
    await loadKalenderFromSupabase();

    // Änderungen von Christian/Tobias sofort auf anderen Geräten anzeigen.
    window.supabaseClient.channel("kalender-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"kalender_eintraege"},()=>loadKalenderFromSupabase())
      .subscribe();
  }
}


/* =========================
   WOCHENPLANUNG
========================= */
let kalenderWeekOffset = 0;
let kalenderCurrentView = "woche";

function getWeekStart(offset = kalenderWeekOffset){
  const now=new Date();
  const day=now.getDay() || 7;
  const monday=new Date(now);
  monday.setHours(0,0,0,0);
  monday.setDate(now.getDate()-day+1+(offset*7));
  return monday;
}

function isoDateLocal(date){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+d;
}

function formatWeekTitle(start){
  const end=new Date(start);
  end.setDate(start.getDate()+6);
  const opts={day:"2-digit",month:"2-digit",year:"numeric"};
  return start.toLocaleDateString("de-DE",opts)+" – "+end.toLocaleDateString("de-DE",opts);
}

function changeKalenderWeek(direction){
  kalenderWeekOffset+=direction;
  renderKalenderWeek();
}

function goKalenderToday(){
  kalenderWeekOffset=0;
  renderKalenderWeek();
}

function showKalenderView(view){
  kalenderCurrentView=view;
  const week=document.getElementById("kalenderWoche");
  const list=document.getElementById("kalenderListeBereich");
  const weekBtn=document.getElementById("kal_tab_woche");
  const listBtn=document.getElementById("kal_tab_liste");

  if(week) week.style.display=view==="woche"?"block":"none";
  if(list) list.style.display=view==="liste"?"block":"none";

  if(weekBtn){
    weekBtn.className=view==="woche"?"btnP":"btnS";
  }
  if(listBtn){
    listBtn.className=view==="liste"?"btnP":"btnS";
  }

  if(view==="woche") renderKalenderWeek();
  else renderKalender();
}

function getStatusColor(status){
  return {
    geplant:"#3b82c4",
    notdienst:"#f97316",
    offen:"#ef4444",
    rechnung:"#a855f7",
    erledigt:"#22c55e",
    geschaeft:"#14b8a6",
    geschlossen:"#64748b",
    verfuegbar:"#84cc16"
  }[status] || "#3b82c4";
}

function renderKalenderWeek(){
  ensureKalenderData();
  const grid=document.getElementById("kalenderWocheGrid");
  const title=document.getElementById("kal_woche_titel");
  if(!grid) return;

  const start=getWeekStart();
  if(title) title.textContent=formatWeekTitle(start);

  const today=isoDateLocal(new Date());
  const days=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];

  grid.innerHTML=days.map((name,index)=>{
    const date=new Date(start);
    date.setDate(start.getDate()+index);
    const iso=isoDateLocal(date);
    const entries=AppData.kalender.eintraege
      .filter(e=>e.datum===iso)
      .sort((a,b)=>(a.von||"").localeCompare(b.von||""));

    return '<div class="card" style="padding:12px;margin-bottom:10px;'+(iso===today?"outline:2px solid #3b82c4;":"")+'">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
      '<div style="font-size:16px;font-weight:800">'+name+'</div>'+
      '<div style="font-size:13px;color:#7eb3e0">'+date.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+'</div>'+
      '</div>'+
      (entries.length ? entries.map(e=>renderWeekEntry(e)).join("") :
        '<div style="font-size:13px;color:#71869b;padding:7px 0">Keine Einträge</div>')+
      '</div>';
  }).join("");
}

function renderWeekEntry(e){
  const color=getStatusColor(e.status);
  const customer=[e.vorname,e.nachname].filter(Boolean).join(" ");
  const address=e.strasse ? [e.strasse,e.hausnummer].filter(Boolean).join(" ")+(e.ort?" · "+[e.postleitzahl,e.ort].filter(Boolean).join(" "):"") : e.adresse;

  return '<div style="border-left:4px solid '+color+';background:#0b2235;border-radius:7px;padding:9px 10px;margin:7px 0;cursor:pointer" onclick="showKalenderEntryDetails(\''+e.id+'\')">'+
    '<div style="display:flex;gap:8px;align-items:flex-start">'+
    '<div style="font-weight:800;color:#dbeafe;white-space:nowrap">'+(e.von||"--:--")+'</div>'+
    '<div style="min-width:0">'+
    '<div style="font-weight:800;font-size:14px">'+escapeHtml(e.titel)+'</div>'+
    (customer?'<div style="font-size:12px;color:#b9d1e8;margin-top:2px">👤 '+escapeHtml(customer)+'</div>':"")+
    (address?'<div style="font-size:12px;color:#8fb3d4;margin-top:2px">📍 '+escapeHtml(address)+'</div>':"")+
    '</div></div></div>';
}

function showKalenderEntryDetails(id){
  const e=AppData.kalender?.eintraege?.find(x=>String(x.id)===String(id));
  if(!e) return;
  const customer=[e.vorname,e.nachname].filter(Boolean).join(" ") || "Kein Kunde hinterlegt";
  const address=e.strasse ? [e.strasse,e.hausnummer].filter(Boolean).join(" ")+"\n"+[e.postleitzahl,e.ort].filter(Boolean).join(" ") : (e.adresse||"Keine Adresse hinterlegt");

  alert(
    e.titel+"\n\n"+
    "👤 "+customer+"\n"+
    (e.telefonnummer?"📞 "+e.telefonnummer+"\n":"")+
    "📍 "+address+"\n\n"+
    "🕒 "+(e.von||"")+" "+(e.bis?"– "+e.bis:"")+"\n"+
    "Status: "+e.status+
    (e.beschreibung?"\n\n📝 "+e.beschreibung:"")
  );
}
