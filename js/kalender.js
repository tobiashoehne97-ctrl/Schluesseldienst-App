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
    beschreibung: row.beschreibung || "",
    mitarbeiter: row.mitarbeiter || ""
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
    '<button class="btnD" data-id="'+escapeHtml(e.id)+'" onclick="deleteKalenderEntry(this.dataset.id);closeKalenderModal()">🗑 Löschen</button>'+
    '</div></div>';

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
