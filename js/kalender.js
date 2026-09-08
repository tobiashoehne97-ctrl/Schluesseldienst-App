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
    closeKalenderModal();
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
   KOMPAKTE WOCHENPLANUNG + POPUPS
========================= */
let kalenderWeekOffset = 0;
let kalenderCurrentView = "woche";
let kalenderFormHome = null;

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
  return start.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+
    " – "+
    end.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
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
  if(weekBtn) weekBtn.className=view==="woche"?"btnP":"btnS";
  if(listBtn) listBtn.className=view==="liste"?"btnP":"btnS";

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

  grid.style.display="grid";
  grid.style.gridTemplateColumns="repeat(2,minmax(0,1fr))";
  grid.style.gap="8px";

  grid.innerHTML=days.map((name,index)=>{
    const date=new Date(start);
    date.setDate(start.getDate()+index);
    const iso=isoDateLocal(date);
    const entries=AppData.kalender.eintraege.filter(e=>e.datum===iso);
    const isToday=iso===today;

    return '<div onclick="openKalenderDay(\\''+iso+'\\')" style="cursor:pointer;padding:12px;border-radius:10px;background:#102a40;border:1px solid '+(isToday?"#3b82c4":"#254b6a")+';min-height:92px;position:relative">'+
      '<button onclick="event.stopPropagation();openKalenderCreate(\\''+iso+'\\')" class="btnP" style="position:absolute;right:8px;top:8px;width:30px;height:30px;padding:0;border-radius:50%;font-size:18px">+</button>'+
      '<div style="font-weight:800;font-size:14px;padding-right:36px">'+name+'</div>'+
      '<div style="font-size:12px;color:#7eb3e0;margin-top:3px">'+date.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+'</div>'+
      '<div style="margin-top:15px;font-size:13px;color:'+(entries.length?"#d9eafa":"#71869b")+'">'+
      (entries.length ? '📌 '+entries.length+' '+(entries.length===1?"Termin":"Termine") : "Keine Termine")+
      '</div>'+
      (entries.length?'<div style="display:flex;gap:4px;margin-top:8px">'+entries.slice(0,5).map(e=>'<span style="width:8px;height:8px;border-radius:50%;background:'+getStatusColor(e.status)+'"></span>').join("")+'</div>':"")+
      '</div>';
  }).join("");
}

function openKalenderModal(title,content){
  const modal=document.getElementById("kalenderModal");
  const titleEl=document.getElementById("kal_modal_titel");
  const contentEl=document.getElementById("kal_modal_content");
  if(!modal||!contentEl) return;
  titleEl.textContent=title;
  contentEl.innerHTML="";
  if(typeof content==="string") contentEl.innerHTML=content;
  else if(content) contentEl.appendChild(content);
  modal.classList.remove("hidden");
  document.body.style.overflow="hidden";
}

function closeKalenderModal(){
  const modal=document.getElementById("kalenderModal");
  const content=document.getElementById("kal_modal_content");
  const form=document.getElementById("kalenderFormCard");
  if(form && kalenderFormHome && form.parentElement===content){
    kalenderFormHome.insertBefore(form,kalenderFormHome.firstChild);
    form.classList.add("hidden");
  }
  if(content) content.innerHTML="";
  if(modal) modal.classList.add("hidden");
  document.body.style.overflow="";
}

function openKalenderCreate(date){
  const form=document.getElementById("kalenderFormCard");
  if(!form) return;
  if(!kalenderFormHome) kalenderFormHome=form.parentElement;

  form.classList.remove("hidden");
  document.getElementById("kal_datum").value=date || isoDateLocal(new Date());

  openKalenderModal("➕ Neuen Termin anlegen",form);
  setTimeout(()=>document.getElementById("kal_titel")?.focus(),50);
}

function openKalenderDay(date){
  ensureKalenderData();
  const entries=AppData.kalender.eintraege
    .filter(e=>e.datum===date)
    .sort((a,b)=>(a.von||"").localeCompare(b.von||""));

  const dateText=new Date(date+"T12:00:00").toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});

  const html='<div style="font-size:14px;color:#8fb3d4;margin-bottom:14px">'+dateText+'</div>'+
    '<button class="btnP" style="width:100%;padding:12px;margin-bottom:14px" onclick="openKalenderCreate(\\''+date+'\\')">➕ Neuen Termin hinzufügen</button>'+
    (entries.length ? entries.map(e=>{
      const customer=[e.vorname,e.nachname].filter(Boolean).join(" ");
      return '<div onclick="openKalenderEntryDetails(\\''+e.id+'\\')" style="border-left:5px solid '+getStatusColor(e.status)+';background:#0b2235;border-radius:9px;padding:12px;margin-bottom:9px;cursor:pointer">'+
        '<div style="display:flex;justify-content:space-between;gap:10px"><div>'+
        '<div style="font-weight:800">'+escapeHtml(e.titel)+'</div>'+
        '<div style="font-size:13px;color:#7eb3e0;margin-top:5px">🕒 '+(e.von||"--:--")+(e.bis?" – "+e.bis:"")+'</div>'+
        (customer?'<div style="font-size:13px;color:#c7dced;margin-top:4px">👤 '+escapeHtml(customer)+'</div>':"")+
        '</div><div style="font-size:12px;color:'+getStatusColor(e.status)+';font-weight:800">'+escapeHtml(e.status)+'</div></div></div>';
    }).join("") : '<div style="text-align:center;padding:28px;color:#71869b">Keine Termine an diesem Tag</div>');

  openKalenderModal("📅 Tagesübersicht",html);
}

function openKalenderEntryDetails(id){
  const e=AppData.kalender?.eintraege?.find(x=>String(x.id)===String(id));
  if(!e) return;
  const customer=[e.vorname,e.nachname].filter(Boolean).join(" ") || "Kein Kunde hinterlegt";
  const address=e.strasse
    ? [e.strasse,e.hausnummer].filter(Boolean).join(" ")+(e.postleitzahl||e.ort?"<br>"+[e.postleitzahl,e.ort].filter(Boolean).join(" "):"")
    : (e.adresse||"Keine Adresse hinterlegt");

  const html='<div class="card" style="margin:0;border-left:5px solid '+getStatusColor(e.status)+'">'+
    '<div style="font-size:20px;font-weight:800;margin-bottom:12px">'+escapeHtml(e.titel)+'</div>'+
    '<div style="line-height:1.8;color:#c8dced">'+
    '👤 '+escapeHtml(customer)+'<br>'+
    (e.telefonnummer?'📞 <a href="tel:'+escapeHtml(e.telefonnummer)+'" style="color:#8fc5ff">'+escapeHtml(e.telefonnummer)+'</a><br>':"")+
    '📍 '+address+'<br>'+
    '🕒 '+escapeHtml(e.von||"--:--")+(e.bis?" – "+escapeHtml(e.bis):"")+'<br>'+
    '🏷️ Status: '+escapeHtml(e.status)+
    '</div>'+
    (e.beschreibung?'<div style="margin-top:14px;padding-top:14px;border-top:1px solid #254b6a">📝 '+escapeHtml(e.beschreibung)+'</div>':"")+
    '<div style="display:flex;gap:8px;margin-top:18px">'+
    '<button class="btnS" style="flex:1" onclick="closeKalenderModal()">← Zurück</button>'+
    '<button class="btnD" onclick="deleteKalenderEntry(\\''+e.id+'\\');closeKalenderModal()">🗑 Löschen</button>'+
    '</div></div>';

  openKalenderModal("📋 Termindetails",html);
}
