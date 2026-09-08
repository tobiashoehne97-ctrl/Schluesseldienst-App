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
    adresse:document.getElementById("kal_adresse").value.trim()||null,
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
  ["kal_titel","kal_adresse","kal_beschreibung","kal_von","kal_bis"].forEach(id=>document.getElementById(id).value="");
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
      (e.adresse?'<div style="font-size:13px;color:#a0c4e8;margin-top:5px">📍 '+escapeHtml(e.adresse)+'</div>':"")+
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

  const connected=await initSupabase();
  if(connected){
    await loadKalenderFromSupabase();

    // Änderungen von Christian/Tobias sofort auf anderen Geräten anzeigen.
    window.supabaseClient.channel("kalender-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"kalender_eintraege"},()=>loadKalenderFromSupabase())
      .subscribe();
  }
}
