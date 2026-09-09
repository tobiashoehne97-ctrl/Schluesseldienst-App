// Gemeinsamer Kalender: Supabase ist die zentrale Datenquelle.
// Fallback auf lokale Daten nur, wenn die Verbindung nicht verfügbar ist.

function ensureKalenderData(){
  AppData.kalender=AppData.kalender||{eintraege:[],letzterIndex:0};
}

function normalizeKalenderEntry(row){
  let report = row.regiebericht || null;
  if (typeof report === "string") {
    try { report = JSON.parse(report); } catch (e) { console.warn("Regiebericht konnte nicht geparst werden:", e); }
  }
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
    beschreibung: row.beschreibung || "",
    mitarbeiter: row.mitarbeiter || "",
    // Regiebericht muss beim Laden aus Supabase erhalten bleiben.
    regiebericht: report
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

  const typ=document.getElementById("kal_typ").value;
  const mitarbeiter=document.getElementById("kal_mitarbeiter")?.value || "";

  if(!datum||!von){
    alert("Bitte Datum und Beginn eingeben.");
    return;
  }

  if(typ==="verfuegbarkeit" && !mitarbeiter){
    alert("Bitte auswählen, welcher Mitarbeiter verfügbar ist.");
    return;
  }

  if(typ!=="verfuegbarkeit" && typ!=="geschaeft" && !titel){
    alert("Bitte einen Titel eingeben.");
    return;
  }

  const businessStatus=document.getElementById("kal_geschaeft_status")?.value || "offen";
  const businessMap={
    offen:{titel:"Geschäft geöffnet",status:"geschaeft"},
    geschlossen:{titel:"Geschäft geschlossen",status:"geschlossen"},
    aussendienst:{titel:"Außendienst – Geschäft geschlossen",status:"geschlossen"}
  };

  const finalTitel=typ==="verfuegbarkeit"
    ? "Verfügbarkeit – "+mitarbeiter
    : typ==="geschaeft"
      ? businessMap[businessStatus].titel
      : titel;

  const finalStatus=typ==="verfuegbarkeit"
    ? "verfuegbar"
    : typ==="geschaeft"
      ? businessMap[businessStatus].status
      : document.getElementById("kal_status").value;

  const entry={
    titel:finalTitel, datum, von:von+":00", bis:bis?bis+":00":null,
    typ,
    status:finalStatus,
    mitarbeiter:typ==="verfuegbarkeit" ? mitarbeiter : null,
    nachname:document.getElementById("kal_nachname").value.trim()||null,
    vorname:document.getElementById("kal_vorname").value.trim()||null,
    telefonnummer:document.getElementById("kal_telefonnummer").value.trim()||null,
    strasse:document.getElementById("kal_strasse").value.trim()||null,
    hausnummer:document.getElementById("kal_hausnummer").value.trim()||null,
    postleitzahl:document.getElementById("kal_postleitzahl").value.trim()||null,
    ort:document.getElementById("kal_ort").value.trim()||null,
    beschreibung:document.getElementById("kal_beschreibung").value.trim()||null
  };

  const btn=(typeof window.event!=="undefined" ? window.event.target : null);
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
  ["kal_titel","kal_mitarbeiter","kal_nachname","kal_vorname","kal_telefonnummer","kal_strasse","kal_hausnummer","kal_postleitzahl","kal_ort","kal_beschreibung","kal_von","kal_bis"].forEach(id=>document.getElementById(id).value="");
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
  showKalenderView("woche");
  renderKalenderWeek();

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
  try{
    ensureKalenderData();

    const grid=document.getElementById("kalenderWocheGrid");
    const title=document.getElementById("kal_woche_titel");
    if(!grid) return;

    const startDate=getWeekStart();
    if(title) title.textContent=formatWeekTitle(startDate);

    const today=isoDateLocal(new Date());
    const days=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];

    grid.style.display="grid";
    grid.style.gridTemplateColumns="repeat(2,minmax(0,1fr))";
    grid.style.gap="8px";
    grid.innerHTML="";

    days.forEach((name,index)=>{
      const date=new Date(startDate);
      date.setDate(startDate.getDate()+index);
      const iso=isoDateLocal(date);
      const allEntries=(AppData.kalender.eintraege||[]).filter(e=>e.datum===iso);
      const availability=allEntries.filter(e=>e.typ==="verfuegbarkeit");
      const businessEntries=allEntries.filter(e=>e.typ==="geschaeft");
      const workEntries=allEntries.filter(e=>e.typ!=="verfuegbarkeit" && e.typ!=="geschaeft");

      const dayCard=document.createElement("div");
      dayCard.style.cssText="cursor:pointer;padding:12px;border-radius:10px;background:#102a40;border:1px solid "+(iso===today?"#3b82c4":"#254b6a")+";min-height:112px;position:relative;overflow:hidden";

      // Zeitachse der Verfügbarkeit: 09:00–17:00 = komplette Tagesbreite.
      if(availability.length){
        const track=document.createElement("div");
        track.style.cssText="position:absolute;left:12px;right:12px;bottom:10px;height:7px;background:#0a1c2b;border-radius:999px;overflow:hidden;border:1px solid #23405a";

        availability.forEach((entry,i)=>{
          const toMinutes=(value)=>{
            const parts=String(value||"").slice(0,5).split(":");
            return (Number(parts[0])||0)*60+(Number(parts[1])||0);
          };
          const dayStart=9*60, dayEnd=17*60, range=dayEnd-dayStart;
          const from=Math.max(dayStart,Math.min(dayEnd,toMinutes(entry.von)));
          const until=Math.max(from,Math.min(dayEnd,toMinutes(entry.bis||"17:00")));
          const left=((from-dayStart)/range)*100;
          const width=Math.max(2,((until-from)/range)*100);

          const bar=document.createElement("div");
          bar.title=(entry.mitarbeiter||"Mitarbeiter")+" · "+String(entry.von||"").slice(0,5)+"–"+String(entry.bis||"").slice(0,5);
          bar.style.cssText="position:absolute;left:"+left+"%;width:"+width+"%;top:"+(i%2===0?0:3)+"px;height:4px;background:#22c55e;border-radius:999px;box-shadow:0 0 7px rgba(34,197,94,.45)";
          track.appendChild(bar);
        });

        dayCard.appendChild(track);
      }

      const plus=document.createElement("button");
      plus.type="button";
      plus.className="btnP";
      plus.textContent="+";
      plus.style.cssText="position:absolute;right:8px;top:8px;width:30px;height:30px;padding:0;border-radius:50%;font-size:18px;z-index:2";
      plus.onclick=(ev)=>{
        ev.stopPropagation();
        openKalenderCreate(iso);
      };

      const heading=document.createElement("div");
      heading.style.cssText="font-weight:800;font-size:14px;padding-right:36px";
      heading.textContent=name;

      const dateLine=document.createElement("div");
      dateLine.style.cssText="font-size:12px;color:#7eb3e0;margin-top:3px";
      dateLine.textContent=date.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});

      const info=document.createElement("div");
      info.style.cssText="margin-top:15px;font-size:13px;color:"+(workEntries.length?"#d9eafa":"#71869b");
      info.textContent=workEntries.length
        ? "📌 "+workEntries.length+" "+(workEntries.length===1?"Termin":"Termine")
        : (availability.length ? "🟢 "+availability.map(e=>e.mitarbeiter||"Verfügbar").join(" · ") : (businessEntries.length ? "Geschäftsplanung hinterlegt" : "Keine Termine"));

      if(businessEntries.length){
        const business=businessEntries[0];
        const badge=document.createElement("div");
        const isClosed=business.status==="geschlossen";
        badge.style.cssText="margin-top:9px;display:inline-block;padding:4px 7px;border-radius:999px;font-size:11px;font-weight:800;background:"+(isClosed?"rgba(100,116,139,.22)":"rgba(20,184,166,.16)")+";color:"+(isClosed?"#b6c2d0":"#5eead4");
        badge.textContent=isClosed
          ? (String(business.titel).includes("Außendienst")?"🚐 Außendienst / geschlossen":"⚫ Geschlossen")
          : "🏪 Geöffnet";
        dayCard.appendChild(badge);
      }

      dayCard.appendChild(plus);
      dayCard.appendChild(heading);
      dayCard.appendChild(dateLine);
      dayCard.appendChild(info);

      if(workEntries.length){
        const dots=document.createElement("div");
        dots.style.cssText="display:flex;gap:4px;margin-top:8px";
        workEntries.slice(0,5).forEach(entry=>{
          const dot=document.createElement("span");
          dot.style.cssText="width:8px;height:8px;border-radius:50%;background:"+getStatusColor(entry.status);
          dots.appendChild(dot);
        });
        dayCard.appendChild(dots);
      }

      dayCard.onclick=()=>openKalenderDay(iso);
      grid.appendChild(dayCard);
    });
  }catch(err){
    console.error("Wochenansicht konnte nicht dargestellt werden:",err);
    const title=document.getElementById("kal_woche_titel");
    const grid=document.getElementById("kalenderWocheGrid");
    if(title) title.textContent="Wochenansicht";
    if(grid) grid.innerHTML='<div style="grid-column:1/-1;padding:14px;color:#ffb4b4">Die Wochenansicht konnte nicht geladen werden. Bitte Seite neu laden.</div>';
  }
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

function toggleKalenderFormByType(){
  const typ=document.getElementById("kal_typ")?.value;
  const standardFields=document.getElementById("kal_standard_fields");
  const standardDetails=document.getElementById("kal_standard_details");
  const availabilityFields=document.getElementById("kal_verfuegbarkeit_fields");
  const businessFields=document.getElementById("kal_geschaeft_fields");

  const isAvailability=typ==="verfuegbarkeit";
  const isBusiness=typ==="geschaeft";

  standardFields?.classList.toggle("hidden",isAvailability||isBusiness);
  standardDetails?.classList.toggle("hidden",isAvailability||isBusiness);
  availabilityFields?.classList.toggle("hidden",!isAvailability);
  businessFields?.classList.toggle("hidden",!isBusiness);

  if(isAvailability){
    const status=document.getElementById("kal_status");
    if(status) status.value="verfuegbar";
  }
}
function openKalenderCreate(date){
  const form=document.getElementById("kalenderFormCard");
  if(!form) return;
  if(!kalenderFormHome) kalenderFormHome=form.parentElement;

  form.classList.remove("hidden");
  document.getElementById("kal_datum").value=date || isoDateLocal(new Date());
  toggleKalenderFormByType();

  openKalenderModal("➕ Neuen Termin anlegen",form);
  setTimeout(()=>document.getElementById("kal_titel")?.focus(),50);
}

function openKalenderDay(date){
  ensureKalenderData();
  const entries=(AppData.kalender.eintraege||[])
    .filter(entry=>entry.datum===date)
    .sort((a,b)=>(a.von||"").localeCompare(b.von||""));

  const dateText=new Date(date+"T12:00:00").toLocaleDateString("de-DE",{
    weekday:"long",day:"2-digit",month:"long",year:"numeric"
  });

  const wrapper=document.createElement("div");
  const intro=document.createElement("div");
  intro.style.cssText="font-size:14px;color:#8fb3d4;margin-bottom:14px";
  intro.textContent=dateText;
  wrapper.appendChild(intro);

  const addBtn=document.createElement("button");
  addBtn.type="button";
  addBtn.className="btnP";
  addBtn.style.cssText="width:100%;padding:12px;margin-bottom:14px";
  addBtn.textContent="➕ Neuen Termin hinzufügen";
  addBtn.onclick=()=>openKalenderCreate(date);
  wrapper.appendChild(addBtn);

  if(!entries.length){
    const empty=document.createElement("div");
    empty.style.cssText="text-align:center;padding:28px;color:#71869b";
    empty.textContent="Keine Termine an diesem Tag";
    wrapper.appendChild(empty);
  }else{
    entries.forEach(entry=>{
      const card=document.createElement("div");
      card.style.cssText="border-left:5px solid "+getStatusColor(entry.status)+";background:#0b2235;border-radius:9px;padding:12px;margin-bottom:9px;cursor:pointer";

      const customer=[entry.vorname,entry.nachname].filter(Boolean).join(" ");
      card.innerHTML=
        '<div style="display:flex;justify-content:space-between;gap:10px">'+
          '<div>'+
            '<div style="font-weight:800">'+escapeHtml(entry.titel)+'</div>'+
            '<div style="font-size:13px;color:#7eb3e0;margin-top:5px">🕒 '+escapeHtml(entry.von||"--:--")+(entry.bis?" – "+escapeHtml(entry.bis):"")+'</div>'+
            (customer?'<div style="font-size:13px;color:#c7dced;margin-top:4px">👤 '+escapeHtml(customer)+'</div>':"")+
          '</div>'+
          '<div style="font-size:12px;color:'+getStatusColor(entry.status)+';font-weight:800">'+escapeHtml(entry.status)+'</div>'+
        '</div>';
      card.onclick=()=>openKalenderEntryDetails(entry.id);
      wrapper.appendChild(card);
    });
  }

  openKalenderModal("📅 Tagesübersicht",wrapper);
}
function openKalenderEntryDetails(id){
  const entry=AppData.kalender?.eintraege?.find(x=>String(x.id)===String(id));
  if(!entry) return;

  if(entry.typ==="termin" || entry.typ==="notdienst"){
    const customer=[entry.vorname,entry.nachname].filter(Boolean).join(" ") || "Kein Kunde hinterlegt";
    const address=[entry.strasse,entry.hausnummer,entry.postleitzahl,entry.ort].filter(Boolean).join(" ") || entry.adresse || "Keine Adresse hinterlegt";

    const html='<div class="card" style="margin:0;border-left:5px solid '+getStatusColor(entry.status)+'">'+
      '<div style="font-size:20px;font-weight:800;margin-bottom:12px">'+escapeHtml(entry.titel)+'</div>'+
      '<div style="line-height:1.9;color:#c8dced">'+
      '👤 '+escapeHtml(customer)+'<br>'+
      (entry.telefonnummer?'📞 '+escapeHtml(entry.telefonnummer)+'<br>':"")+
      '📍 '+escapeHtml(address)+'<br>'+
      '🕒 '+escapeHtml(entry.von||"--:--")+(entry.bis?" – "+escapeHtml(entry.bis):"")+
      '</div>'+
      (entry.beschreibung?'<div style="margin-top:14px;padding-top:14px;border-top:1px solid #254b6a">📝 '+escapeHtml(entry.beschreibung)+'</div>':"")+
      (entry.regiebericht?'<button class="btnS" style="width:100%;padding:13px;margin-top:14px" onclick="openRegiebericht(\''+escapeHtml(entry.id)+'\')">📄 Regiebericht öffnen</button>':"")+
      ((entry.status==="erledigt"||entry.status==="rechnung"||entry.status==="offen")?'<div style="margin-top:14px;padding:10px;border-radius:8px;background:rgba(34,197,94,.10);font-size:13px;color:#c8e6d0">Dieser Einsatz wurde bereits bearbeitet.</div>':'<button class="btnP" style="width:100%;padding:14px;margin-top:18px" onclick="startServiceProcess(\''+escapeHtml(entry.id)+'\')">▶️ Arbeit / Einsatz starten</button>')+
      '<div style="display:flex;gap:8px;margin-top:10px">'+
      '<button class="btnS" style="flex:1" onclick="closeKalenderModal()">← Zurück</button>'+
      '<button class="btnD" data-id="'+escapeHtml(entry.id)+'" onclick="deleteKalenderEntry(this.dataset.id);closeKalenderModal()">🗑 Löschen</button>'+
      '</div></div>';

    openKalenderModal("📋 Außendiensttermin",html);
    return;
  }

  const customer=[entry.vorname,entry.nachname].filter(Boolean).join(" ") || "Kein Kunde hinterlegt";
  const address=entry.strasse
    ? [entry.strasse,entry.hausnummer].filter(Boolean).join(" ")+(entry.postleitzahl||entry.ort?"<br>"+[entry.postleitzahl,entry.ort].filter(Boolean).join(" "):"")
    : (entry.adresse||"Keine Adresse hinterlegt");

  const html='<div class="card" style="margin:0;border-left:5px solid '+getStatusColor(entry.status)+'">'+
    '<div style="font-size:20px;font-weight:800;margin-bottom:12px">'+escapeHtml(entry.titel)+'</div>'+
    '<div style="line-height:1.8;color:#c8dced">👤 '+escapeHtml(customer)+'<br>📍 '+address+'<br>🕒 '+escapeHtml(entry.von||"--:--")+(entry.bis?" – "+escapeHtml(entry.bis):"")+'</div>'+
    '<div style="display:flex;gap:8px;margin-top:18px"><button class="btnS" style="flex:1" onclick="closeKalenderModal()">← Zurück</button><button class="btnD" data-id="'+escapeHtml(entry.id)+'" onclick="deleteKalenderEntry(this.dataset.id);closeKalenderModal()">🗑 Löschen</button></div></div>';
  openKalenderModal("📋 Termindetails",html);
}

/* Kalender-Steuerung bewusst zusätzlich global binden:
   Dadurch funktionieren die Buttons auch dann zuverlässig, wenn die Anwendung
   über die Navigation ein- und ausgeblendet wird. */
function initKalenderUI(){
  const weekTab=document.getElementById("kal_tab_woche");
  const listTab=document.getElementById("kal_tab_liste");
  const weekRoot=document.getElementById("kalenderWoche");
  const grid=document.getElementById("kalenderWocheGrid");

  if(!weekRoot || !grid) return false;

  showKalenderView("woche");
  renderKalenderWeek();

  // Falls ein vorheriger Fehler die Ansicht geleert hat, nach dem Rendern erneut versuchen.
  if(!grid.children.length){
    setTimeout(()=>renderKalenderWeek(),100);
  }
  return true;
}

window.changeKalenderWeek=changeKalenderWeek;
window.goKalenderToday=goKalenderToday;
window.showKalenderView=showKalenderView;
window.openKalenderCreate=openKalenderCreate;
window.toggleKalenderFormByType=toggleKalenderFormByType;
window.openKalenderDay=openKalenderDay;
window.openKalenderEntryDetails=openKalenderEntryDetails;
window.openKalenderModal=openKalenderModal;
window.closeKalenderModal=closeKalenderModal;
window.saveKalenderEntry=saveKalenderEntry;
window.deleteKalenderEntry=deleteKalenderEntry;
window.renderKalender=renderKalender;
window.renderKalenderWeek=renderKalenderWeek;

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>setTimeout(initKalenderUI,0));
}else{
  setTimeout(initKalenderUI,0);
}


/* =========================
   AUSSENDIENST / REGIEBERICHT
========================= */
let activeServiceId=null;
let activeServiceStartedAt=null;
let activeServicePhotos=[];

function openServiceModal(title,content){
  const modal=document.getElementById("serviceModal");
  modal?.classList.remove("service-report-modal");
  const titleEl=document.getElementById("service_modal_titel");
  const contentEl=document.getElementById("service_modal_content");
  if(!modal||!contentEl)return;
  titleEl.textContent=title;
  contentEl.innerHTML=content;
  modal.classList.remove("hidden");
  document.body.style.overflow="hidden";
}

function closeServiceModal(){
  document.getElementById("serviceModal")?.classList.add("hidden");
  document.body.style.overflow="";
}

function getServiceEntry(){
  return AppData.kalender?.eintraege?.find(e=>String(e.id)===String(activeServiceId));
}

function startServiceProcess(id){
  activeServiceId=id;
  activeServiceStartedAt=new Date().toISOString();
  activeServicePhotos=[];
  closeKalenderModal();

  const entry=getServiceEntry();
  if(!entry)return;

  const address=[entry.strasse,entry.hausnummer,entry.postleitzahl,entry.ort].filter(Boolean).join(" ") || entry.adresse || "";
  openServiceModal("🚐 Einsatz starten",
    '<div class="card" style="margin:0">'+
    '<div style="font-size:18px;font-weight:800">'+escapeHtml(entry.titel)+'</div>'+
    '<div style="margin-top:10px;color:#b9d2e8">📍 '+escapeHtml(address||"Keine Adresse hinterlegt")+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px">'+
    '<button class="btnP" style="padding:16px" onclick="startNavigation()">🧭 Navigation starten</button>'+
    '<button class="btnS" style="padding:16px" onclick="openServiceReportStep()">🚐 Ohne Navigation</button>'+
    '</div></div>');
}

function startNavigation(){
  const entry=getServiceEntry();
  if(!entry){openServiceReportStep();return;}

  const address=[entry.strasse,entry.hausnummer,entry.postleitzahl,entry.ort]
    .filter(Boolean)
    .join(" ")
    || entry.adresse
    || "";

  if(!address){
    openServiceReportStep();
    return;
  }

  const encodedAddress=encodeURIComponent(address);
  const ua=navigator.userAgent||"";
  const isIOS=/iPad|iPhone|iPod/.test(ua) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
  const isAndroid=/Android/i.test(ua);

  if(isIOS){
    // Apple Maps auf iPhone/iPad
    window.location.href="https://maps.apple.com/?daddr="+encodedAddress+"&dirflg=d";
  }else if(isAndroid){
    // Android Intent öffnet bevorzugt eine installierte Navigations-/Karten-App
    window.location.href="geo:0,0?q="+encodedAddress;
  }else{
    // PC / Büro: Google Maps
    window.open("https://www.google.com/maps/dir/?api=1&destination="+encodedAddress,"_blank");
  }

  // Der Einsatzprozess läuft direkt weiter. Die Navigation kann parallel geöffnet bleiben.
  openServiceReportStep();
}

function openServiceReportStep(){
  const entry=getServiceEntry();
  if(!entry)return;

  openServiceModal("📝 Regiebericht – Einsatz", 
    '<div class="sec">Was wurde vorgefunden?</div>'+
    '<textarea id="service_vorgefunden" class="mb12" style="width:100%;min-height:90px" placeholder="Situation beim Kunden beschreiben ..."></textarea>'+
    '<div class="sec">Was wurde gemacht?</div>'+
    '<textarea id="service_gemacht" class="mb12" style="width:100%;min-height:90px" placeholder="Durchgeführte Arbeiten ..."></textarea>'+
    '<div class="sec">Material</div>'+
    '<div id="service_material_list"></div>'+
    '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:7px;margin-bottom:8px">'+
      '<input id="service_mat_name" placeholder="Material / Artikel">'+
      '<input id="service_mat_menge" type="number" min="1" value="1" placeholder="Menge">'+
      '<input id="service_mat_preis" type="number" min="0" step="0.01" placeholder="Preis €">'+
    '</div>'+
    '<button type="button" class="btnS" style="width:100%;margin-bottom:14px" onclick="addServiceMaterial()">＋ Material hinzufügen</button>'+
    '<div class="sec">Fotos</div>'+
    '<input id="service_fotos" type="file" accept="image/*" capture="environment" multiple onchange="handleServicePhotos(this)">'+
    '<div id="service_photo_info" style="font-size:12px;color:#8fb3d4;margin-top:7px">Noch keine Fotos hinzugefügt</div>'+
    '<button class="btnP" style="width:100%;padding:14px;margin-top:20px" onclick="openServiceCompletionStep()">Weiter →</button>'
  );

  window.activeServiceMaterials=[];
}

function addServiceMaterial(){
  const name=document.getElementById("service_mat_name")?.value.trim();
  const menge=Number(document.getElementById("service_mat_menge")?.value||1);
  const preis=Number(document.getElementById("service_mat_preis")?.value||0);
  if(!name)return alert("Bitte Material eingeben.");
  window.activeServiceMaterials=window.activeServiceMaterials||[];
  window.activeServiceMaterials.push({name,menge,preis});
  document.getElementById("service_mat_name").value="";
  document.getElementById("service_mat_menge").value=1;
  document.getElementById("service_mat_preis").value="";
  renderServiceMaterials();
}

function renderServiceMaterials(){
  const list=document.getElementById("service_material_list");
  if(!list)return;
  const mats=window.activeServiceMaterials||[];
  list.innerHTML=mats.length?mats.map((m,i)=>
    '<div style="display:flex;justify-content:space-between;background:#0b2235;padding:8px;border-radius:7px;margin-bottom:6px">'+
    '<span>'+escapeHtml(m.name)+' · '+m.menge+'×</span><span>'+m.preis.toFixed(2)+' € <button class="btnD" style="padding:2px 6px;margin-left:6px" onclick="removeServiceMaterial('+i+')">×</button></span></div>'
  ).join(""):'<div style="font-size:12px;color:#71869b;margin-bottom:8px">Noch kein Material erfasst</div>';
}

function removeServiceMaterial(index){
  window.activeServiceMaterials.splice(index,1);
  renderServiceMaterials();
}

function handleServicePhotos(input){
  activeServicePhotos=Array.from(input.files||[]);
  const info=document.getElementById("service_photo_info");
  if(info)info.textContent=activeServicePhotos.length+" Foto(s) ausgewählt";
}

function openServiceCompletionStep(){
  window.activeServiceReport={
    vorgefunden:document.getElementById("service_vorgefunden")?.value||"",
    gemacht:document.getElementById("service_gemacht")?.value||"",
    material:window.activeServiceMaterials||[],
    fotos:activeServicePhotos.map(f=>f.name)
  };

  openServiceModal("✅ Einsatz abschließen",
    '<div style="font-size:17px;font-weight:800;margin-bottom:10px">Konnte der Termin abgeschlossen werden?</div>'+
    '<button class="btnP" style="width:100%;padding:15px;margin-bottom:10px" onclick="openServicePaymentStep()">✅ Ja, Termin abgeschlossen</button>'+
    '<button class="btnS" style="width:100%;padding:15px" onclick="markServiceFollowUp()">🔧 Nein, Folgetermin erforderlich</button>'
  );
}

async function markServiceFollowUp(){
  await updateServiceEntry({status:"offen",regiebericht:{...window.activeServiceReport,abgeschlossen:false,gestartet:activeServiceStartedAt,beendet:new Date().toISOString()}});
  closeServiceModal();
  alert("Termin wurde als nicht abgeschlossen markiert. Das Büro kann den Regiebericht prüfen und einen Folgetermin planen.");
}

function openServicePaymentStep(){
  const total=(window.activeServiceReport.material||[]).reduce((sum,m)=>sum+(Number(m.menge)||1)*(Number(m.preis)||0),0);
  openServiceModal("💳 Zahlungsart",
    '<div style="font-size:17px;font-weight:800;margin-bottom:12px">Wie möchte der Kunde bezahlen?</div>'+
    '<button class="btnP" style="width:100%;padding:15px;margin-bottom:10px" onclick="openCashPayment()">💶 Bar bezahlen</button>'+
    '<button class="btnS" style="width:100%;padding:15px" onclick="openInvoicePayment()">🧾 Rechnung</button>'+
    '<div style="margin-top:14px;color:#8fb3d4;font-size:13px">Materialsumme aktuell: '+total.toFixed(2)+' €</div>'
  );
}

function openCashPayment(){
  const materialTotal=(window.activeServiceReport.material||[]).reduce((sum,m)=>sum+(Number(m.menge)||1)*(Number(m.preis)||0),0);
  openServiceModal("💶 Barzahlung",
    '<label class="lbl">Gesamtsumme (€)</label><input id="service_total" type="number" step="0.01" value="'+materialTotal.toFixed(2)+'" oninput="calculateChange()">'+
    '<label class="lbl" style="margin-top:12px">Kunde gibt (€)</label><input id="service_given" type="number" step="0.01" oninput="calculateChange()" placeholder="z. B. 100">'+
    '<div id="service_change" style="font-size:20px;font-weight:800;margin:14px 0">Wechselgeld: 0,00 €</div>'+
    '<div class="sec">Unterschrift Kunde</div>'+
    '<div style="border:1px solid #3b82c4;border-radius:8px;background:#fff;overflow:hidden">'+
      '<canvas id="service_signature" style="width:100%;height:170px;display:block;touch-action:none;cursor:crosshair"></canvas>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px;font-size:12px;color:#8fb3d4"><span>Bitte hier mit dem Finger unterschreiben</span><button class="btnS" type="button" onclick="clearServiceSignature()">🧹 Löschen</button></div>'+
    '<button class="btnP" style="width:100%;padding:14px;margin-top:18px" onclick="finishService(\'bar\')">💾 Barzahlung abschließen</button>'
  );
  setTimeout(setupServiceSignature,0);
}

function setupServiceSignature(){
  const canvas=document.getElementById("service_signature");
  if(!canvas) return;

  const rect=canvas.getBoundingClientRect();
  const ratio=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.round(rect.width*ratio));
  canvas.height=Math.max(1,Math.round(rect.height*ratio));

  const ctx=canvas.getContext("2d");
  ctx.scale(ratio,ratio);
  ctx.lineWidth=2.2;
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.strokeStyle="#111827";

  let drawing=false;
  let hasSignature=false;
  let last=null;

  const point=(event)=>{
    const r=canvas.getBoundingClientRect();
    const source=event.touches?event.touches[0]:event;
    return {x:source.clientX-r.left,y:source.clientY-r.top};
  };

  const start=(event)=>{
    event.preventDefault();
    drawing=true;
    last=point(event);
    hasSignature=true;
  };

  const move=(event)=>{
    if(!drawing)return;
    event.preventDefault();
    const current=point(event);
    ctx.beginPath();
    ctx.moveTo(last.x,last.y);
    ctx.lineTo(current.x,current.y);
    ctx.stroke();
    last=current;
  };

  const end=(event)=>{
    if(event)event.preventDefault();
    drawing=false;
    last=null;
  };

  canvas.addEventListener("pointerdown",start);
  canvas.addEventListener("pointermove",move);
  canvas.addEventListener("pointerup",end);
  canvas.addEventListener("pointerleave",end);
  canvas.addEventListener("pointercancel",end);

  window.serviceSignature={
    canvas,
    has:()=>hasSignature,
    clear:()=>{
      const r=canvas.getBoundingClientRect();
      ctx.clearRect(0,0,r.width,r.height);
      hasSignature=false;
    },
    data:()=>hasSignature?canvas.toDataURL("image/png"):null
  };
}

function clearServiceSignature(){
  window.serviceSignature?.clear();
}

function calculateChange(){
  const total=Number(document.getElementById("service_total")?.value||0);
  const given=Number(document.getElementById("service_given")?.value||0);
  const change=Math.max(0,given-total);
  const el=document.getElementById("service_change");
  if(el)el.textContent="Wechselgeld: "+change.toFixed(2).replace(".",",")+" €";
}

function openInvoicePayment(){
  const started=activeServiceStartedAt?new Date(activeServiceStartedAt):new Date();
  const duration=Math.max(1,Math.round((Date.now()-started.getTime())/60000));
  const materials=(window.activeServiceReport.material||[]).map(m=>'<li>'+escapeHtml(m.name)+' · '+m.menge+'×</li>').join("")||"<li>Kein Material</li>";

  openServiceModal("🧾 Rechnung",
    '<div style="padding:10px;background:#0b2235;border-radius:8px;margin-bottom:14px">⏱️ Arbeitszeit aktuell: <b>'+duration+' Minuten</b></div>'+
    '<div class="sec">Material für die Rechnung</div><ul style="line-height:1.8">'+materials+'</ul>'+
    '<div class="sec">Unterschrift Kunde</div>'+
    '<div style="border:1px solid #a855f7;border-radius:8px;background:#fff;overflow:hidden">'+
      '<canvas id="service_signature" style="width:100%;height:170px;display:block;touch-action:none;cursor:crosshair"></canvas>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px;font-size:12px;color:#8fb3d4"><span>Bitte hier mit dem Finger unterschreiben</span><button class="btnS" type="button" onclick="clearServiceSignature()">🧹 Löschen</button></div>'+
    '<button class="btnP" style="width:100%;padding:14px;margin-top:18px" onclick="finishService(\'rechnung\')">💾 Für Rechnung abschließen</button>'
  );
  setTimeout(setupServiceSignature,0);
}

async function finishService(paymentType){
  if(!window.serviceSignature?.has()){
    alert("Bitte lassen Sie den Kunden zuerst unterschreiben.");
    return;
  }

  const signature=window.serviceSignature.data();
  const started=activeServiceStartedAt?new Date(activeServiceStartedAt):new Date();
  const duration=Math.max(1,Math.round((Date.now()-started.getTime())/60000));
  const total=paymentType==="bar"?Number(document.getElementById("service_total")?.value||0):null;
  const given=paymentType==="bar"?Number(document.getElementById("service_given")?.value||0):null;

  const report={
    ...window.activeServiceReport,
    abgeschlossen:true,
    gestartet:activeServiceStartedAt,
    beendet:new Date().toISOString(),
    arbeitszeit_minuten:duration,
    zahlungsart:paymentType,
    gesamtsumme:total,
    gegeben:given,
    wechselgeld:paymentType==="bar"?Math.max(0,given-total):null,
    unterschrift:signature
  };

  await updateServiceEntry({status:paymentType==="rechnung"?"rechnung":"erledigt",regiebericht:report});

  // Den fertigen Regiebericht zusätzlich im zentralen Archiv ablegen.
  // Das Archiv speichert eine dauerhafte Referenz auf den Kalender-Eintrag,
  // damit der Bericht auch nach einem Gerätewechsel wieder geöffnet werden kann.
  try {
    const archivedEntry = getServiceEntry();
    if (archivedEntry && typeof window.saveRegieberichtReferenceToArchiv === "function") {
      await window.saveRegieberichtReferenceToArchiv(archivedEntry);
    } else {
      throw new Error("Archivfunktion ist nicht verfügbar.");
    }
  } catch (err) {
    console.error("Regiebericht archivieren fehlgeschlagen:", err);
    alert("Der Regiebericht wurde gespeichert, konnte aber nicht im Archiv abgelegt werden: " + (err.message || err));
  }

  openServiceEmailStep(paymentType);
}

function openServiceEmailStep(paymentType){
  const entry=getServiceEntry();
  openServiceModal("📧 Regiebericht versenden",
    '<div style="font-size:16px;margin-bottom:14px">Der Regiebericht wurde erstellt. Soll er an den Kunden per E-Mail geschickt werden?</div>'+
    '<button class="btnS" style="width:100%;padding:13px;margin-bottom:12px" onclick="openRegiebericht(\''+escapeHtml(entry?.id||activeServiceId)+'\')">📄 Regiebericht jetzt ansehen</button>'+
    '<div style="display:flex;gap:10px">'+
    '<button class="btnS" style="flex:1;padding:14px" onclick="finishServiceAndReturn()">Nein</button>'+
    '<button class="btnP" style="flex:1;padding:14px" onclick="showServiceEmailInput()">Ja, senden</button>'+
    '</div>'+
    '<div id="service_email_area"></div>'
  );
}

function showServiceEmailInput(){
  document.getElementById("service_email_area").innerHTML=
    '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #254b6a">'+
    '<label class="lbl">E-Mail-Adresse des Empfängers</label>'+
    '<input id="service_customer_email" type="email" placeholder="firma@beispiel.de" autocomplete="email">'+
    '<div style="font-size:12px;color:#8fb3d4;margin:8px 0">Die Adresse wird nur für diesen Versand verwendet und nicht automatisch beim Kunden gespeichert.</div>'+
    '<button id="service_send_mail_btn" class="btnP" style="width:100%;padding:12px" onclick="sendServiceRegiebericht()">📧 Bericht senden</button>'+
    '</div>';
}

async function sendServiceRegiebericht(){
  const email=document.getElementById("service_customer_email")?.value.trim();
  const entry=getServiceEntry();
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert("Bitte eine gültige E-Mail-Adresse eingeben.");
    return;
  }
  if(!entry?.regiebericht){
    alert("Der Regiebericht wurde nicht gefunden.");
    return;
  }

  const btn=document.getElementById("service_send_mail_btn");
  if(btn){btn.disabled=true;btn.textContent="⏳ Bericht wird gesendet...";}

  try{
    const response=await fetch("/.netlify/functions/send-regiebericht",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email,
        entry,
        html:buildRegieberichtHtml(entry)
      })
    });

    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||"E-Mail konnte nicht versendet werden.");

    alert("📧 Der Regiebericht wurde erfolgreich an "+email+" versendet.");
    finishServiceAndReturn();
  }catch(err){
    console.error("E-Mail-Versand fehlgeschlagen:",err);
    alert("Der E-Mail-Versand konnte nicht durchgeführt werden: "+err.message);
    if(btn){btn.disabled=false;btn.textContent="📧 Bericht senden";}
  }
}

function finishServiceAndReturn(){
  const finishedId=activeServiceId;
  closeServiceModal();
  activeServiceId=null;
  activeServiceStartedAt=null;
  window.activeServiceMaterials=[];
  window.activeServiceReport=null;
  renderKalender();
  renderKalenderWeek();
  alert("Einsatz wurde erfolgreich abgeschlossen. Der Regiebericht kann jederzeit über den Termin geöffnet werden.");
}

async function updateServiceEntry(changes){
  const index=AppData.kalender.eintraege.findIndex(e=>String(e.id)===String(activeServiceId));
  if(index<0)return;
  AppData.kalender.eintraege[index]={...AppData.kalender.eintraege[index],...changes};

  const updated=AppData.kalender.eintraege[index];

  if(window.supabaseReady && window.supabaseClient && !String(updated.id).startsWith("LOCAL-")){
    const payload={
      status:updated.status,
      regiebericht:updated.regiebericht || null
    };
    const {data,error}=await window.supabaseClient
      .from("kalender_eintraege")
      .update(payload)
      .eq("id",updated.id)
      .select("*")
      .maybeSingle();

    if(error){
      console.error(error);
      alert("Status wurde lokal gespeichert. Supabase konnte den Regiebericht noch nicht speichern: "+error.message);
      saveAppData();
    }else if(data){
      const confirmed = typeof normalizeKalenderEntry === "function" ? normalizeKalenderEntry(data) : data;
      // Nur übernehmen, wenn der gespeicherte Bericht tatsächlich zurückkommt.
      // Andernfalls bleibt die lokale vollständige Version erhalten.
      if (confirmed && confirmed.regiebericht) {
        AppData.kalender.eintraege[index] = confirmed;
      } else {
        console.warn("Supabase bestätigte den Termin, lieferte den Regiebericht aber nicht zurück. Lokale Berichtsdaten bleiben erhalten.");
        saveAppData();
      }
    }else{
      saveAppData();
    }
  }else{
    saveAppData();
  }

  renderKalender();
  renderKalenderWeek();
}

window.startServiceProcess=startServiceProcess;
window.startNavigation=startNavigation;
window.openServiceReportStep=openServiceReportStep;
window.addServiceMaterial=addServiceMaterial;
window.removeServiceMaterial=removeServiceMaterial;
window.handleServicePhotos=handleServicePhotos;
window.openServiceCompletionStep=openServiceCompletionStep;
window.markServiceFollowUp=markServiceFollowUp;
window.openServicePaymentStep=openServicePaymentStep;
window.openCashPayment=openCashPayment;
window.calculateChange=calculateChange;
window.clearServiceSignature=clearServiceSignature;
window.openInvoicePayment=openInvoicePayment;
window.finishService=finishService;
window.openServiceEmailStep=openServiceEmailStep;
window.showServiceEmailInput=showServiceEmailInput;
window.sendServiceRegiebericht=sendServiceRegiebericht;
window.finishServiceAndReturn=finishServiceAndReturn;
window.openServiceModal=openServiceModal;
window.closeServiceModal=closeServiceModal;


function formatRegieberichtDate(value){
  if(!value) return "—";
  const d=new Date(value);
  if(!Number.isNaN(d.getTime())) return d.toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});
  return String(value);
}

function getRegieberichtLogoHtml(){
  const appLogo=document.getElementById("logoImg");
  const stored=window.logoUrl || localStorage.getItem("logoUrl");
  const src=(appLogo && appLogo.tagName==="IMG" ? appLogo.src : "") || stored || "";
  if(src) return '<img class="rb-logo-image" src="'+src.replace(/"/g,"&quot;")+'" alt="Schlüsseldienst Höhne">';
  return '<div class="rb-logo-fallback">Schlüsseldienst<br><strong>Christian Höhne</strong></div>';
}

function buildRegieberichtHtml(entry){
  const r=entry.regiebericht||{};
  const customer=[entry.vorname,entry.nachname].filter(Boolean).join(" ")||"—";
  const addressLine=[entry.strasse,entry.hausnummer].filter(Boolean).join(" ");
  const placeLine=[entry.postleitzahl,entry.ort].filter(Boolean).join(" ");
  const address=[addressLine,placeLine].filter(Boolean).join("<br>")||"—";
  const isInvoice=r.zahlungsart==="rechnung";
  const materialRows=(r.material||[]).map(m=>{
    const qty=Number(m.menge)||1;
    const price=Number(m.preis)||0;
    return "<tr><td>"+escapeHtml(m.name||"Material")+"</td><td class=\"num\">"+qty+"</td>"+(isInvoice?"":"<td class=\"num\">"+(qty*price).toFixed(2).replace(".",",")+" €</td>")+"</tr>";
  }).join("") || "<tr><td colspan=\""+(isInvoice?2:3)+"\">Kein Material erfasst</td></tr>";

  const statusText=entry.status==="rechnung"
    ? "Abgeschlossen – Rechnung durch Büro erforderlich"
    : entry.status==="offen"
      ? "Nicht abgeschlossen – Folgetermin erforderlich"
      : "Einsatz abgeschlossen";

  const totalMaterial=(r.material||[]).reduce((sum,m)=>sum+(Number(m.menge)||1)*(Number(m.preis)||0),0);

  return "<div class=\"rb-paper\">"+
    "<div class=\"rb-watermark rb-left\"></div><div class=\"rb-watermark rb-right\"></div>"+
    "<div class=\"rb-header\">"+
      "<div class=\"rb-logo\">"+getRegieberichtLogoHtml()+"</div>"+
      "<div class=\"rb-company\"><div class=\"rb-slogan\">Sicherheit seit 1972</div><div>Schlüsseldienst Christian Höhne<br>Viehmarktgasse 6<br>92224 Amberg</div><div class=\"rb-contact\">09621 / 13 12 8<br>info@schluesseldienst-hoehne.de<br>www.schluesseldienst-hoehne.de</div></div>"+
    "</div>"+
    "<div class=\"rb-address-row\"><div><div class=\"rb-label\">Empfänger:in</div><div class=\"rb-customer\">"+escapeHtml(customer)+"<br>"+address+"</div></div><div class=\"rb-date\">Amberg, den "+(entry.datum?entry.datum.split("-").reverse().join("."):"—")+"</div></div>"+
    "<div class=\"rb-title\">Regiebericht</div>"+
    "<div class=\"rb-status "+(entry.status==="offen"?"open":entry.status==="rechnung"?"invoice":"done")+"\">"+escapeHtml(statusText)+"</div>"+
    "<section><h3>Einsatzdaten</h3><div class=\"rb-grid\"><div><b>Einsatz:</b><br>"+escapeHtml(entry.titel||"Außendiensttermin")+"</div><div><b>Arbeitszeit:</b><br>"+Number(r.arbeitszeit_minuten||0)+" Minuten</div><div><b>Beginn:</b><br>"+escapeHtml(formatRegieberichtDate(r.gestartet||entry.von))+"</div><div><b>Ende:</b><br>"+escapeHtml(formatRegieberichtDate(r.beendet||entry.bis))+"</div></div></section>"+
    "<section><h3>Vorgefunden</h3><div class=\"rb-text\">"+escapeHtml(r.vorgefunden||"Keine Angaben").replace(/\n/g,"<br>")+"</div></section>"+
    "<section><h3>Durchgeführte Arbeiten</h3><div class=\"rb-text\">"+escapeHtml(r.gemacht||"Keine Angaben").replace(/\n/g,"<br>")+"</div></section>"+
    "<section><h3>Verwendetes Material</h3><table><thead><tr><th>Material</th><th class=\"num\">Menge</th>"+(isInvoice?"":"<th class=\"num\">Preis</th>")+"</tr></thead><tbody>"+materialRows+"</tbody></table>"+(isInvoice?"":"<div class=\"rb-total\"><span>Material / Gesamtbetrag</span><b>"+Number(r.gesamtsumme??totalMaterial).toFixed(2).replace(".",",")+" €</b></div>")+"</section>"+
    "<section><h3>"+(isInvoice?"Rechnung":"Barzahlung")+"</h3>"+(isInvoice
      ? "<div class=\"rb-note\">Die Abrechnung erfolgt durch das Büro. Preise sind in diesem Kunden-Regiebericht nicht aufgeführt.</div>"
      : "<div class=\"rb-payment\"><div>Gesamtsumme <b>"+Number(r.gesamtsumme||0).toFixed(2).replace(".",",")+" €</b></div><div>Gegeben <b>"+Number(r.gegeben||0).toFixed(2).replace(".",",")+" €</b></div><div>Wechselgeld <b>"+Number(r.wechselgeld||0).toFixed(2).replace(".",",")+" €</b></div></div>")+"</section>"+
    "<section><h3>Kundenbestätigung</h3><div class=\"rb-sign-note\">Mit der Unterschrift bestätigt der Kunde die ausgeführten Arbeiten und die Richtigkeit der Angaben.</div>"+(r.unterschrift?"<div class=\"rb-sign\"><img src=\""+r.unterschrift+"\"></div>":"<div class=\"rb-sign rb-sign-empty\">Keine Unterschrift hinterlegt</div>")+"<div class=\"rb-sign-line\"><span>"+escapeHtml(customer)+"</span><span>Unterschrift Kunde</span></div></section>"+
    "<div class=\"rb-footer\"><div><b>SCHLÜSSELDIENST CHRISTIAN HÖHNE</b><br>Viehmarktgasse 6 · 92224 Amberg</div><div>Fon: 09621/13128<br>Fon: 0170 / 474 2557<br>www.schluesseldienst-hoehne.de</div><div>USt.-IdNr. DE 169302242<br>Sicherheit seit 1972</div></div>"+
  "</div>";
}

function getRegieberichtPrintCss(){
  return `*{box-sizing:border-box}body{margin:0;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif;color:#1f2937}.rb-paper{position:relative;width:210mm;min-height:297mm;margin:0 auto;background:#fff;overflow:hidden;padding:17mm 16mm 15mm}.rb-header{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:2}.rb-logo{min-width:76mm;max-width:82mm}.rb-logo-image{display:block;width:100%;height:auto;max-height:34mm;object-fit:contain;object-position:left top}.rb-logo-fallback{color:#164b7d;font-size:8mm;font-weight:700;line-height:1.05}.rb-company{text-align:left;font-size:3.2mm;line-height:1.45;width:70mm}.rb-slogan{font-size:9mm;color:#2b5d8e;font-family:Georgia,serif;letter-spacing:.4mm;margin-bottom:3mm}.rb-contact{margin-top:4mm}.rb-address-row{display:flex;justify-content:space-between;margin-top:18mm;position:relative;z-index:2}.rb-label{font-size:3mm;margin-bottom:2mm}.rb-customer{font-size:3.6mm;line-height:1.4}.rb-date{font-size:3mm;margin-top:12mm}.rb-title{font-size:6mm;font-weight:700;margin:32mm 0 6mm;position:relative;z-index:2}.rb-status{display:inline-block;padding:2.5mm 4mm;border-radius:2mm;font-size:3mm;font-weight:700;margin-bottom:6mm}.rb-status.done{background:#dcfce7;color:#166534}.rb-status.invoice{background:#f3e8ff;color:#7e22ce}.rb-status.open{background:#fee2e2;color:#b91c1c}section{position:relative;z-index:2;margin:5mm 0;padding:0}h3{font-size:3.5mm;color:#164b7d;margin:0 0 2.5mm;padding-bottom:1.5mm;border-bottom:.5mm solid #cbd5e1}.rb-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm;font-size:3mm;line-height:1.45}.rb-text{font-size:3.1mm;line-height:1.55;min-height:7mm}table{width:100%;border-collapse:collapse;font-size:3mm}th{background:#e8eef5;color:#164b7d;text-align:left;padding:2mm}td{padding:2mm;border-bottom:.3mm solid #dbe3ec}.num{text-align:right}.rb-total{display:flex;justify-content:space-between;background:#164b7d;color:#fff;padding:3mm 4mm;margin-top:3mm;font-size:3.5mm}.rb-payment{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;background:#f8fafc;padding:3mm;font-size:3mm}.rb-payment b{display:block;font-size:3.5mm;margin-top:1mm}.rb-note{background:#f5f3ff;border-left:1mm solid #8b5cf6;padding:3mm;font-size:3mm;line-height:1.45}.rb-sign-note{font-size:2.8mm;color:#475569;margin-bottom:3mm}.rb-sign{height:28mm;border:.3mm solid #cbd5e1;background:#fff;display:flex;align-items:center;padding:2mm}.rb-sign img{max-height:24mm;max-width:100%}.rb-sign-empty{border-style:dashed;color:#94a3b8;font-size:3mm}.rb-sign-line{display:flex;justify-content:space-between;font-size:2.8mm;margin-top:2mm;color:#475569}.rb-footer{position:absolute;left:16mm;right:16mm;bottom:8mm;border-top:.3mm solid #cbd5e1;padding-top:3mm;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:4mm;font-size:2.5mm;line-height:1.45;z-index:2}.rb-watermark{position:absolute;z-index:0;opacity:.07;background:#164b7d}.rb-left{left:-35mm;top:95mm;width:50mm;height:100mm;border-radius:0 30mm 30mm 0}.rb-right{right:-22mm;top:80mm;width:28mm;height:130mm;border-radius:14mm 0 0 14mm}.rb-right:after{content:"";position:absolute;left:-16mm;bottom:-12mm;width:45mm;height:45mm;border-radius:50%;border:10mm solid #164b7d;background:#fff}@media screen and (max-width:900px){body{background:#fff}.rb-paper{width:100%;min-height:auto;padding:22px 18px 28px;margin:0}.rb-header{gap:16px}.rb-logo{min-width:0;width:52%}.rb-company{width:48%;font-size:11px}.rb-slogan{font-size:25px}.rb-address-row{margin-top:42px}.rb-title{margin:55px 0 14px;font-size:28px}.rb-grid{font-size:12px}.rb-text,table,.rb-payment{font-size:12px}.rb-footer{position:relative;left:auto;right:auto;bottom:auto;margin-top:40px;font-size:10px}}@media screen and (max-width:600px){.rb-paper{padding:14px 12px 22px}.rb-header{display:block}.rb-logo{width:100%;max-width:280px;margin-bottom:16px}.rb-company{width:100%;font-size:12px}.rb-slogan{font-size:24px}.rb-address-row{margin-top:28px;display:block}.rb-date{margin-top:16px}.rb-title{margin:34px 0 12px;font-size:26px}.rb-grid{grid-template-columns:1fr;gap:8px}.rb-payment{grid-template-columns:1fr;gap:8px}.rb-footer{grid-template-columns:1fr;gap:10px}.rb-watermark{display:none}section{margin:18px 0}h3{font-size:16px}.rb-status{font-size:12px}.rb-sign-line{display:block}.rb-sign-line span{display:block;margin-top:5px}}@media print{body{background:#fff}.rb-paper{margin:0;width:210mm;min-height:297mm;box-shadow:none}.no-print{display:none!important}}`;
}

function openRegiebericht(id){
  const entry=(AppData.kalender?.eintraege||[]).find(e=>String(e.id)===String(id));
  if(!entry?.regiebericht){ alert("Für diesen Termin ist noch kein Regiebericht vorhanden."); return; }
  const html=buildRegieberichtHtml(entry);
  openServiceModal("📄 Regiebericht",
    "<style>"+getRegieberichtPrintCss()+"</style>"+
    "<div style=\"overflow:auto;background:#dbe2ea;padding:0;border-radius:10px;width:100%\"><div style=\"width:100%\">"+html+"</div></div>"+
    "<button class=\"btnS\" style=\"width:100%;padding:13px;margin-top:12px\" onclick=\"printRegiebericht('"+String(entry.id).replace(/'/g,"\\'")+"')\">🖨️ Drucken / Als PDF speichern</button>"+
    "<button class=\"btnP\" style=\"width:100%;padding:13px;margin-top:8px\" onclick=\"closeServiceModal()\">✓ Schließen</button>"
  );
  document.getElementById("serviceModal")?.classList.add("service-report-modal");
}

function printRegiebericht(id){
  const entry=(AppData.kalender?.eintraege||[]).find(e=>String(e.id)===String(id));
  if(!entry?.regiebericht) return alert("Für diesen Termin ist noch kein Regiebericht vorhanden.");
  const win=window.open("","_blank");
  if(!win){ alert("Das Druckfenster konnte nicht geöffnet werden. Bitte Pop-ups erlauben."); return; }
  win.document.open();
  win.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Regiebericht</title><style>"+getRegieberichtPrintCss()+"</style></head><body>"+buildRegieberichtHtml(entry)+"<script>window.onload=()=>window.print();<\/script></body></html>");
  win.document.close();
}

window.openRegiebericht=openRegiebericht;
window.printRegiebericht=printRegiebericht;
