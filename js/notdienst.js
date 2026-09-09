let selectedNotdienstType = "Türöffnung";

function pad2(value){ return String(value).padStart(2,"0"); }
function notdienstToday(){
  const d=new Date();
  return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
}
function notdienstNow(){
  const d=new Date();
  return pad2(d.getHours())+":"+pad2(d.getMinutes());
}

function openNotdienstForm(){
  const start=document.getElementById("notdienstStart");
  const form=document.getElementById("notdienstForm");
  if(start) start.classList.add("hidden");
  if(form) form.classList.remove("hidden");

  document.getElementById("nd_datum").value=notdienstToday();
  document.getElementById("nd_uhrzeit").value=notdienstNow();
  document.getElementById("nd_normaler_termin").checked=false;
  document.getElementById("nd_vorname").value="";
  document.getElementById("nd_nachname").value="";
  document.getElementById("nd_telefon").value="";
  document.getElementById("nd_strasse").value="";
  document.getElementById("nd_plz").value="";
  document.getElementById("nd_ort").value="";
  document.getElementById("nd_beschreibung").value="";
  selectedNotdienstType="Türöffnung";

  document.querySelectorAll(".notdienst-type").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.type==="Türöffnung");
  });

  const saved=localStorage.getItem("schluesseldienst-mobile-employee");
  if(saved && document.getElementById("nd_mitarbeiter")){
    document.getElementById("nd_mitarbeiter").value=saved;
  }

  window.scrollTo({top:0,behavior:"smooth"});
}

function closeNotdienstForm(){
  const start=document.getElementById("notdienstStart");
  const form=document.getElementById("notdienstForm");
  if(form) form.classList.add("hidden");
  if(start) start.classList.remove("hidden");
}

function selectNotdienstType(type,button){
  selectedNotdienstType=type;
  document.querySelectorAll(".notdienst-type").forEach(btn=>btn.classList.remove("active"));
  if(button) button.classList.add("active");
}

async function saveNotdienst(){
  const datum=document.getElementById("nd_datum").value;
  const uhrzeit=document.getElementById("nd_uhrzeit").value;
  const vorname=document.getElementById("nd_vorname").value.trim();
  const nachname=document.getElementById("nd_nachname").value.trim();
  const telefon=document.getElementById("nd_telefon").value.trim();
  const strasse=document.getElementById("nd_strasse").value.trim();
  const plz=document.getElementById("nd_plz").value.trim();
  const ort=document.getElementById("nd_ort").value.trim();
  const beschreibung=document.getElementById("nd_beschreibung").value.trim();
  const mitarbeiter=document.getElementById("nd_mitarbeiter").value;
  const normalerTermin=document.getElementById("nd_normaler_termin").checked;

  if(!vorname && !nachname){
    alert("Bitte mindestens Vor- oder Nachname des Kunden eingeben.");
    return;
  }

  const title=[selectedNotdienstType,vorname,nachname].filter(Boolean).join(" – ");
  const entry={
    id:(crypto.randomUUID ? crypto.randomUUID() : "nd_"+Date.now()),
    titel:title || "Notfalleinsatz",
    datum,
    von:uhrzeit,
    bis:"",
    typ:normalerTermin ? "termin" : "notdienst",
    status:normalerTermin ? "geplant" : "notdienst",
    vorname,
    nachname,
    telefonnummer:telefon,
    strasse,
    plz,
    ort,
    mitarbeiter,
    notfallart:selectedNotdienstType,
    beschreibung,
    created_at:new Date().toISOString(),
    notdienst:!normalerTermin
  };

  try{
    if(window.supabaseClient && typeof supabaseClient.from==="function"){
      const {data,error}=await supabaseClient.from("kalender_eintraege").insert([entry]).select();
      if(error) throw error;
      if(data && data[0]) entry.id=data[0].id;
    }else{
      if(!AppData.kalender) AppData.kalender={eintraege:[]};
      if(!Array.isArray(AppData.kalender.eintraege)) AppData.kalender.eintraege=[];
      AppData.kalender.eintraege.push(entry);
      if(typeof save==="function") save();
    }

    if(window.AppData){
      if(!AppData.kalender) AppData.kalender={eintraege:[]};
      if(!Array.isArray(AppData.kalender.eintraege)) AppData.kalender.eintraege=[];
      const exists=AppData.kalender.eintraege.some(e=>String(e.id)===String(entry.id));
      if(!exists) AppData.kalender.eintraege.push(entry);
    }

    if(typeof loadKalenderFromSupabase==="function") await loadKalenderFromSupabase();
    if(typeof renderDashboardWeek==="function") renderDashboardWeek();

    closeNotdienstForm();

    const message=normalerTermin
      ? "Der Vorgang wurde als normaler Termin in der Einsatzplanung angelegt."
      : "Der Notfalleinsatz wurde erfolgreich angelegt.";
    alert(message);
  }catch(err){
    console.error("Notdienst konnte nicht gespeichert werden:",err);
    alert("Der Einsatz konnte nicht gespeichert werden. Bitte erneut versuchen.");
  }
}
