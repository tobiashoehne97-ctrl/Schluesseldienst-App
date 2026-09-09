
window.onerror = function(msg,src,line,col,err){ console.error('JS FEHLER:',msg,'Zeile',line); return false; };

const FN="Schluesseldienst Christian Hoehne",FD="Schl\u00fcsseldienst Christian H\u00f6hne",FS="Viehmarktgasse 6",FP="92224 Amberg",FT="09621 / 13 12 8",BUERO="info@schluesseldienst-hoehne.de";
let logoUrl=null,curMail={},sigs={},ztC=1,pcR=1,pcA=1,zyC=1;

function loadLogo(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    logoUrl=e.target.result;
    const wrap=document.getElementById("logoImg");
    if(wrap){
      const img=document.createElement("img");
      img.src=e.target.result;
      img.style.cssText="height:40px;object-fit:contain;filter:brightness(1.8) saturate(0.3)";
      wrap.replaceWith(img);
      img.id="logoImg";
    }
  };
  r.readAsDataURL(f);
}



function tab(m,n){document.querySelectorAll("#"+m+" .tabs .tab").forEach((t,i)=>t.classList.toggle("on",i===n));for(let i=0;i<4;i++)document.getElementById(m+"_"+i).classList.toggle("hidden",i!==n);}


function ostern(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,day);}
function ftage(y){const o=ostern(y),a=(b,d)=>{const x=new Date(b);x.setDate(x.getDate()+d);return x;},f=d=>d.toISOString().split("T")[0];return new Set([`${y}-01-01`,`${y}-01-06`,f(a(o,-2)),f(o),f(a(o,1)),`${y}-05-01`,f(a(o,39)),f(a(o,49)),f(a(o,50)),f(a(o,60)),`${y}-08-15`,`${y}-10-03`,`${y}-11-01`,`${y}-12-25`,`${y}-12-26`]);}
function tarif(dat,zeit){if(!dat||!zeit)return null;const d=new Date(dat+"T"+zeit),ft=ftage(d.getFullYear()),tag=d.getDay(),min=d.getHours()*60+d.getMinutes();if(ft.has(dat)||tag===0)return{l:"Sonntag / Feiertag (Bayern)",p:150};if(min>=540&&min<=1020)return{l:"Werktag 09:00-17:00 Uhr",p:70};return{l:"Nacht 17:01-08:59 Uhr",p:90};}

function iTO(){const h=new Date().toISOString().split("T")[0],t=new Date().toTimeString().slice(0,5);document.getElementById("to_dat").value=h;document.getElementById("to_zeit").value=t;iSig("to_sc2");updTO();}
function updTO(){const dat=v("to_dat"),zeit=v("to_zeit"),tr=tarif(dat,zeit),isA=document.querySelector("[name=to_tar]:checked")?.value==="auto";const th=document.getElementById("to_th");if(tr){th.style.display="block";th.innerHTML=`<b>${tr.l}</b> &rarr; <b style="color:#4fc3f7">${tr.p} &euro;</b>`;}else th.style.display="none";const tl=document.getElementById("to_tl");if(tl&&tr)tl.innerHTML=tr.l+" &rarr; <b style='color:#4fc3f7'>"+tr.p+" &euro;</b>";document.getElementById("to_tmi").classList.toggle("hidden",isA);const tp=isA?(tr?.p??0):Number(v("to_tval")||0);const zon=document.getElementById("to_zylCb")?.checked;const zp=zon?(Number(document.getElementById("to_ztyp")?.value||0)||Number(v("to_zpreis")||0)):0;const ges=tp+zp;document.getElementById("to_p1").textContent=tp+" €";document.getElementById("to_p2").textContent=zp+" €";document.getElementById("to_zr").style.display=zon?"flex":"none";document.getElementById("to_ges").textContent=ges+" €";}

function iRB(){document.getElementById("rb_dat").value=new Date().toISOString().split("T")[0];document.getElementById("rb_zeiten").innerHTML="";ztC=1;addZeit();document.getElementById("rb_pos").innerHTML="";pcR=1;addPos("rb");iSig("rb_sc");}
function addZeit(){const id=ztC++,dat=new Date().toISOString().split("T")[0];const d=document.createElement("div");d.className="zblk";d.id="zt_"+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Eintrag ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove()">&#10005;<\/button><\/div><div class="g2 mb12"><div><label class="lbl">Datum<\/label><input type="date" id="ztd_${id}" value="${dat}"><\/div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label class="lbl">Von<\/label><input type="time" id="ztv_${id}" oninput="calcD(${id})"><\/div><div><label class="lbl">Bis<\/label><input type="time" id="ztb_${id}" oninput="calcD(${id})"><\/div><\/div><\/div><label class="lbl">T&auml;tigkeit<\/label><input id="ztt_${id}" placeholder="Beschreibung"><div id="ztdur_${id}" style="margin-top:8px;font-size:13px;color:#4fc3f7;font-weight:600;display:none"><\/div>`;document.getElementById("rb_zeiten").appendChild(d);}
function calcD(id){const vo=document.getElementById("ztv_"+id)?.value,bi=document.getElementById("ztb_"+id)?.value;if(!vo||!bi)return;const[vh,vm]=vo.split(":").map(Number),[bh,bm]=bi.split(":").map(Number),d=(bh*60+bm)-(vh*60+vm);const el=document.getElementById("ztdur_"+id);el.style.display=d>0?"block":"none";if(d>0)el.textContent="\u23f1 "+Math.floor(d/60)+"h "+d%60+"min";}
function getZt(){const r=[];document.querySelectorAll("#rb_zeiten .zblk").forEach(b=>{const id=b.id.replace("zt_","");r.push({d:document.getElementById("ztd_"+id)?.value||"",v:document.getElementById("ztv_"+id)?.value||"",b:document.getElementById("ztb_"+id)?.value||"",t:document.getElementById("ztt_"+id)?.value||""});});return r;}

function iAN(){document.getElementById("an_dat").value=new Date().toISOString().split("T")[0];document.getElementById("an_zyls").innerHTML="";zyC=1;addZyl();document.getElementById("an_pos").innerHTML="";pcA=1;addPos("an");iSig("an_sc");}
function addZyl(){const id=zyC++;const d=document.createElement("div");d.className="zblk";d.id="zyl_"+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Zylinder ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove()">&#10005;<\/button><\/div><div class="g2 mb12"><div><label class="lbl">Bezeichnung<\/label><input id="zb_${id}" placeholder="z.B. Haust&uuml;r EG"><\/div><div><label class="lbl">Anzahl<\/label><input type="number" id="za_${id}" value="1"><\/div><\/div><div class="g2 mb12"><div><label class="lbl">Au&szlig;enma&szlig; (mm)<\/label><input class="massInp" type="number" id="zau_${id}" placeholder="35" oninput="updM(${id})"><\/div><div><label class="lbl">Innenma&szlig; (mm)<\/label><input class="massInp" type="number" id="zin_${id}" placeholder="40" oninput="updM(${id})"><\/div><\/div><div id="zm_${id}" class="massD" style="display:none"><\/div><label class="lbl" style="margin-top:10px">Zylindertyp<\/label><input class="mb12" id="ztyp_${id}" placeholder="z.B. Profilzylinder SK3"><label class="lbl">Bemerkung<\/label><input id="zbem_${id}" placeholder="z.B. Knaufzylinder...">`;document.getElementById("an_zyls").appendChild(d);}
function updM(id){const a=document.getElementById("zau_"+id)?.value,i=document.getElementById("zin_"+id)?.value,el=document.getElementById("zm_"+id);el.style.display=(a&&i)?"block":"none";if(a&&i)el.textContent="\ud83d\udccf "+a+" / "+i+" mm";}
function getZyls(){const r=[];document.querySelectorAll("#an_zyls .zblk").forEach(b=>{const id=b.id.replace("zyl_","");const a=document.getElementById("zau_"+id)?.value,i=document.getElementById("zin_"+id)?.value;if(!a&&!i)return;r.push({bez:document.getElementById("zb_"+id)?.value||"",anz:document.getElementById("za_"+id)?.value||"1",aus:a||"",inn:i||"",typ:document.getElementById("ztyp_"+id)?.value||"",bem:document.getElementById("zbem_"+id)?.value||""});});return r;}

function addPos(m){const id=m==="rb"?pcR++:pcA++;const pre=m+"_p";const d=document.createElement("div");d.className="zblk";d.id=pre+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Position ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove();updSum('${m}')">&#10005;<\/button><\/div><label class="lbl">Beschreibung<\/label><input class="mb12" id="${pre}b${id}" placeholder="z.B. Profilzylinder SK2"><div class="g3"><div><label class="lbl">Menge<\/label><input type="number" id="${pre}m${id}" value="1" oninput="updSum('${m}')"><\/div><div><label class="lbl">Einheit<\/label><select id="${pre}e${id}"><option>Stk</option><option>m</option><option>m&sup2;</option><option>h</option><option>Psch</option><option>Set</option><\/select><\/div><div><label class="lbl">EP (&euro;)<\/label><input type="number" id="${pre}p${id}" placeholder="0.00" oninput="updSum('${m}')"><\/div><\/div><div id="${pre}tot${id}" style="margin-top:8px;font-size:13px;color:#4fc3f7;font-weight:600;display:none"><\/div>`;document.getElementById(m+"_pos").appendChild(d);}
function updSum(m){let s=0;document.querySelectorAll("#"+m+"_pos .zblk").forEach(b=>{const id=b.id.replace(m+"_p","");const pre=m+"_p";const mm=Number(document.getElementById(pre+"m"+id)?.value||0),pp=Number(document.getElementById(pre+"p"+id)?.value||0),tot=mm*pp;s+=tot;const el=document.getElementById(pre+"tot"+id);if(el){el.style.display=pp?"block":"none";if(pp)el.textContent="= "+tot.toFixed(2)+" \u20ac";}});if(m==="rb"){document.getElementById("rb_sb").style.display=s?"block":"none";document.getElementById("rb_sum").textContent=s.toFixed(2)+" \u20ac";}if(m==="an"){document.getElementById("an_sb").style.display=s?"block":"none";document.getElementById("an_net").textContent=s.toFixed(2)+" \u20ac";document.getElementById("an_mwst").textContent=(s*0.19).toFixed(2)+" \u20ac";document.getElementById("an_brut").textContent=(s*1.19).toFixed(2)+" \u20ac";}}
function getPos(m){const r=[];document.querySelectorAll("#"+m+"_pos .zblk").forEach(b=>{const id=b.id.replace(m+"_p","");const pre=m+"_p";const b2=document.getElementById(pre+"b"+id)?.value||"";if(!b2)return;r.push({b:b2,m:document.getElementById(pre+"m"+id)?.value||"1",e:document.getElementById(pre+"e"+id)?.value||"Stk",p:document.getElementById(pre+"p"+id)?.value||""});});return r;}

function addF(inp,wid){const w=document.getElementById(wid);Array.from(inp.files).forEach(f=>{const r=new FileReader();r.onload=e=>{const d=document.createElement("div");d.className="fi";d.innerHTML=`<img src="${e.target.result}"><button class="fdel" onclick="this.parentNode.remove()">&#10005;<\/button>`;d.querySelector("img")._d=e.target.result;w.appendChild(d);};r.readAsDataURL(f);});}
function getFotos(wid){return[...document.querySelectorAll("#"+wid+" img")].map(i=>i._d).filter(Boolean);}

function iSig(cid){const c=document.getElementById(cid);if(!c||c._si)return;c._si=true;let dr=false,lp={};const gp=(e,c)=>{const r=c.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*(c.width/r.width),y:(s.clientY-r.top)*(c.height/r.height)};};c.addEventListener("mousedown",e=>{dr=true;lp=gp(e,c);});c.addEventListener("mousemove",e=>{if(!dr)return;const ctx=c.getContext("2d"),p=gp(e,c);ctx.beginPath();ctx.moveTo(lp.x,lp.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="#1e3a5f";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();lp=p;});["mouseup","mouseleave"].forEach(ev=>c.addEventListener(ev,()=>dr=false));c.addEventListener("touchstart",e=>{e.preventDefault();dr=true;lp=gp(e,c);},{passive:false});c.addEventListener("touchmove",e=>{e.preventDefault();if(!dr)return;const ctx=c.getContext("2d"),p=gp(e,c);ctx.beginPath();ctx.moveTo(lp.x,lp.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="#1e3a5f";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();lp=p;},{passive:false});c.addEventListener("touchend",()=>dr=false);}
function clrSig(cid){const c=document.getElementById(cid);c.getContext("2d").clearRect(0,0,c.width,c.height);}
function savSig(cid,key,okId){sigs[key]=document.getElementById(cid).toDataURL();document.getElementById(okId).classList.remove("hidden");}




// ── Archiv ────────────────────────────────────────────────────────────────────
// PDFs werden dauerhaft im Supabase Storage gespeichert. Die Datenbank enthält
// nur die Metadaten und den Speicherpfad – dadurch bleibt das Archiv auch nach
// einem Browser-/Gerätewechsel vollständig verfügbar.
const ARCHIV_BUCKET = "berichte";
const ARCHIV = [];

function archivClient() {
  if (!window.supabaseClient) throw new Error("Supabase ist noch nicht verbunden.");
  return window.supabaseClient;
}

function dataUriToBlob(dataUri) {
  const parts = String(dataUri || "").split(",");
  if (parts.length < 2) throw new Error("Ungültige PDF-Daten.");
  const mime = (parts[0].match(/:(.*?);/) || [])[1] || "application/pdf";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function savePdfLocal(nr, pdfUri) {
  try { sessionStorage.setItem("pdf_"+nr, pdfUri); } catch(e) {}
}
function getPdfLocal(nr) {
  try { return sessionStorage.getItem("pdf_"+nr) || null; } catch(e) { return null; }
}

async function saveToArchiv(nr, typ, name, dat, pdfUri) {
  // Sofort lokal merken und eine Wiederholungs-Warteschlange anlegen.
  savePdfLocal(nr, pdfUri);
  try {
    const pending = JSON.parse(localStorage.getItem("archiv_pending") || "[]");
    const idx = pending.findIndex(x => x.nr === nr);
    const item = { nr, typ, name: name || null, dat: dat || null, created_at: new Date().toISOString() };
    if (idx >= 0) pending[idx] = item; else pending.push(item);
    localStorage.setItem("archiv_pending", JSON.stringify(pending));
  } catch(e) {}

  if (!window.supabaseReady || !window.supabaseClient) {
    throw new Error("Supabase-Verbindung ist noch nicht bereit.");
  }

  const client = archivClient();
  const pdfPath = typ + "/" + nr + ".pdf";

  const { error: uploadError } = await client.storage
    .from(ARCHIV_BUCKET)
    .upload(pdfPath, dataUriToBlob(pdfUri), {
      contentType: "application/pdf",
      upsert: true
    });

  if (uploadError) throw new Error("PDF-Upload: " + uploadError.message);

  const { error: dbError } = await client
    .from("archiv")
    .upsert({
      nr,
      typ,
      name: name || null,
      dat: dat || null,
      saved: new Date().toISOString(),
      pdf_path: pdfPath
    }, { onConflict: "nr" });

  if (dbError) throw new Error("Archiv-Datenbank: " + dbError.message);

  try {
    const pending = JSON.parse(localStorage.getItem("archiv_pending") || "[]")
      .filter(x => x.nr !== nr);
    localStorage.setItem("archiv_pending", JSON.stringify(pending));
  } catch(e) {}

  console.log("Archiviert:", nr);
  return true;
}


async function saveRegieberichtReferenceToArchiv(entry) {
  if (!entry || !entry.id) throw new Error("Ungültiger Regiebericht.");

  if (!window.supabaseReady || !window.supabaseClient) {
    throw new Error("Supabase-Verbindung ist noch nicht bereit.");
  }

  const name = [entry.vorname, entry.nachname].filter(Boolean).join(" ").trim() || entry.titel || null;
  const nr = "RB-" + String(entry.id);

  const { error } = await archivClient()
    .from("archiv")
    .upsert({
      nr,
      typ: "RB",
      name,
      dat: entry.datum || null,
      saved: new Date().toISOString(),
      pdf_path: "regiebericht:" + String(entry.id)
    }, { onConflict: "nr" });

  if (error) throw new Error("Archiv-Datenbank: " + error.message);

  console.log("Regiebericht archiviert:", nr);
  return nr;
}

window.saveRegieberichtReferenceToArchiv = saveRegieberichtReferenceToArchiv;

async function syncExistingRegieberichteToArchiv() {
  if (!window.supabaseReady || !window.supabaseClient) return;

  try {
    const client = archivClient();
    const { data, error } = await client
      .from("kalender_eintraege")
      .select("id,titel,datum,vorname,nachname,regiebericht")
      .not("regiebericht", "is", null);

    if (error) throw error;

    const rows = (data || [])
      .filter(e => e.id && e.regiebericht)
      .map(e => ({
        nr: "RB-" + String(e.id),
        typ: "RB",
        name: [e.vorname, e.nachname].filter(Boolean).join(" ").trim() || e.titel || null,
        dat: e.datum || null,
        saved: e.regiebericht?.beendet || new Date().toISOString(),
        pdf_path: "regiebericht:" + String(e.id)
      }));

    if (!rows.length) return;

    const { error: upsertError } = await client
      .from("archiv")
      .upsert(rows, { onConflict: "nr" });

    if (upsertError) throw upsertError;
  } catch (e) {
    console.warn("Vorhandene Regieberichte konnten nicht automatisch synchronisiert werden:", e);
  }
}

async function sbGet() {
  try {
    const client = archivClient();
    const { data, error } = await client
      .from("archiv")
      .select("id,nr,typ,name,dat,saved,pdf_path")
      .order("saved", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch(e) {
    console.error("Archiv laden:", e);
    window._archivLastError = e && e.message ? e.message : String(e);
    return null;
  }
}

async function sbDelete(entry) {
  const client = archivClient();
  const nr = typeof entry === "string" ? entry : entry.nr;
  const pdfPath = typeof entry === "object" ? entry.pdf_path : null;

  if (pdfPath && !String(pdfPath).startsWith("regiebericht:")) {
    const { error } = await client.storage.from(ARCHIV_BUCKET).remove([pdfPath]);
    if (error) console.warn("PDF konnte nicht gelöscht werden:", error);
  }

  const { error } = await client.from("archiv").delete().eq("nr", nr);
  if (error) throw error;
}

function archivTypLabel(typ) {
  if (typ === "TO") return "Türöffnung";
  if (typ === "RB") return "Regiebericht";
  if (typ === "AN") return "Angebot";
  return typ || "Dokument";
}

function archivIcon(typ) {
  if (typ === "TO") return "🔑";
  if (typ === "RB") return "📋";
  if (typ === "AN") return "🔍";
  return "📄";
}

function formatArchivDate(value) {
  if (!value) return "–";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

async function loadArchiv() {
  const list = document.getElementById("archiv-list");
  const empty = document.getElementById("archiv-empty");
  const st = document.getElementById("archiv-status");
  const inf = document.getElementById("archiv-info");

  if (list) list.innerHTML = "";
  if (empty) empty.style.display = "block";
  if (st) st.textContent = "Archiv wird geladen...";
  if (inf) inf.textContent = "";

  // Bereits vorhandene Regieberichte aus dem Kalender einmal mit dem Archiv abgleichen.
  // Dadurch erscheinen auch Berichte, die vor der Archiv-Erweiterung erstellt wurden.
  await syncExistingRegieberichteToArchiv();

  const rows = await sbGet();

  if (rows === null) {
    if (st) st.textContent = "Archiv nicht erreichbar";
    if (inf) inf.textContent = "Fehler: " + (window._archivLastError || "Bitte Datenbankeinrichtung prüfen.");
    return;
  }

  if (rows.length === 0) {
    if (st) st.textContent = "Noch keine Dokumente im Archiv";
    if (inf) inf.textContent = "Abgeschlossene Berichte erscheinen automatisch hier.";
    return;
  }

  if (empty) empty.style.display = "none";

  const searchDiv = document.createElement("div");
  searchDiv.className = "card";
  searchDiv.style.cssText = "padding:12px 16px;margin-bottom:14px";
  searchDiv.innerHTML =
    '<input id="archiv-search" placeholder="Nach Nummer, Kunde oder Datum suchen..." oninput="filterArchiv()" style="font-size:14px">';
  list.appendChild(searchDiv);

  const container = document.createElement("div");
  container.id = "archiv-cards";
  list.appendChild(container);

  rows.forEach(function(e) {
    const card = document.createElement("div");
    card.className = "card archiv-card";
    card.dataset.search = [
      e.nr, e.name, archivTypLabel(e.typ), e.dat,
      e.saved
    ].filter(Boolean).join(" ").toLowerCase();
    card.style.cssText = "margin-bottom:12px;padding:16px 18px;cursor:pointer";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:12px";

    const icon = document.createElement("span");
    icon.textContent = archivIcon(e.typ);
    icon.style.cssText = "font-size:28px;flex-shrink:0";

    const info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0";
    info.innerHTML =
      "<div style='font-weight:700;font-size:15px;color:#e8f0f8'>" + (e.nr || "") + "</div>" +
      "<div style='font-size:13px;color:#7eb3e0;margin-top:2px'>" +
        archivTypLabel(e.typ) + " — " + (e.name || "Ohne Kundenname") +
      "</div>" +
      "<div style='font-size:12px;color:#4a7aaa;margin-top:3px'>" +
        "Einsatz: " + (e.dat || "–") + " · Archiviert: " + formatArchivDate(e.saved) +
      "</div>";

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0";

    const openBtn = document.createElement("button");
    openBtn.className = "btnP";
    openBtn.style.cssText = "padding:7px 12px;font-size:12px";
    openBtn.textContent = "↗ Öffnen";
    openBtn.onclick = function(ev) {
      ev.stopPropagation();
      openArchivPdf(e);
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btnD";
    delBtn.style.cssText = "font-size:11px;padding:4px 10px";
    delBtn.textContent = "🗑 Löschen";
    delBtn.onclick = function(ev) {
      ev.stopPropagation();
      delArchiv(e);
    };

    actions.appendChild(openBtn);
    actions.appendChild(delBtn);

    row.appendChild(icon);
    row.appendChild(info);
    row.appendChild(actions);
    card.appendChild(row);
    card.onclick = function() { openArchivPdf(e); };
    container.appendChild(card);
  });
}

async function openArchivPdf(entry) {
  // Regieberichte aus der Einsatzplanung werden als Referenz auf den
  // Kalender-Eintrag archiviert. Dadurch ist kein separater PDF-Upload nötig.
  if (entry && typeof entry === "object" && String(entry.pdf_path || "").startsWith("regiebericht:")) {
    const serviceId = String(entry.pdf_path).slice("regiebericht:".length);
    let serviceEntry = (window.AppData?.kalender?.eintraege || []).find(e => String(e.id) === serviceId);

    if (!serviceEntry && typeof loadKalenderFromSupabase === "function") {
      try {
        await loadKalenderFromSupabase();
        serviceEntry = (window.AppData?.kalender?.eintraege || []).find(e => String(e.id) === serviceId);
      } catch (e) {
        console.error("Kalender-Eintrag für Archivbericht laden:", e);
      }
    }

    if (!serviceEntry || !serviceEntry.regiebericht) {
      alert("Der zugehörige Regiebericht konnte nicht mehr gefunden werden.");
      return;
    }

    if (typeof openRegiebericht === "function") {
      openRegiebericht(serviceId);
      return;
    }

    alert("Der Regiebericht kann momentan nicht geöffnet werden.");
    return;
  }

  const nr = typeof entry === "string" ? entry : entry.nr;
  const localPdf = getPdfLocal(nr);

  if (localPdf) {
    window._currentPdfUri = localPdf;
    window._currentPdfNr = nr;
    showPdfPreview(localPdf);
    document.getElementById("pdfNr").textContent = nr;
    document.getElementById("pdfPreviewName").textContent = nr;
    const sideName = document.getElementById("pdfPreviewNameSide");
    if (sideName) sideName.textContent = nr;
    document.getElementById("pdfMod").classList.add("open");
    return;
  }

  if (!entry || typeof entry !== "object" || !entry.pdf_path) {
    alert("Zu diesem Archiv-Eintrag ist kein PDF hinterlegt.");
    return;
  }

  try {
    const client = archivClient();
    const { data, error } = await client.storage
      .from(ARCHIV_BUCKET)
      .download(entry.pdf_path);
    if (error) throw error;

    const url = URL.createObjectURL(data);
    if (window._pdfPreviewBlobUrl) URL.revokeObjectURL(window._pdfPreviewBlobUrl);
    window._pdfPreviewBlobUrl = url;
    window._currentPdfBlobUrl = url;
    window._currentPdfUri = null;
    window._currentPdfNr = entry.nr;

    const frame = document.getElementById("pdfFrame");
    const empty = document.getElementById("pdfPreviewEmpty");
    if (frame) frame.src = url + "#zoom=page-width";
    if (empty) empty.style.display = "none";

    document.getElementById("pdfNr").textContent = entry.nr;
    document.getElementById("pdfPreviewName").textContent = entry.nr;
    const sideName = document.getElementById("pdfPreviewNameSide");
    if (sideName) sideName.textContent = entry.nr;
    document.getElementById("pdfMod").classList.add("open");
  } catch(e) {
    console.error(e);
    alert("Der archivierte Bericht konnte nicht geöffnet werden: " + (e.message || e));
  }
}

function filterArchiv() {
  const q = (document.getElementById("archiv-search")?.value || "").toLowerCase().trim();
  document.querySelectorAll(".archiv-card").forEach(function(card) {
    card.style.display = !q || card.dataset.search.includes(q) ? "" : "none";
  });
}

async function delArchiv(entry) {
  if (!entry || !confirm("Dokument " + entry.nr + " wirklich aus dem Archiv löschen?")) return;
  try {
    await sbDelete(entry);
    try { sessionStorage.removeItem("pdf_" + entry.nr); } catch(e) {}
    await loadArchiv();
  } catch(e) {
    alert("Dokument konnte nicht gelöscht werden: " + (e.message || e));
  }
}

async function testArchiv() {
  const st = document.getElementById("archiv-status");
  const inf = document.getElementById("archiv-info");
  if (st) st.textContent = "Teste Archiv...";
  if (inf) inf.textContent = "";

  const rows = await sbGet();
  if (rows === null) {
    if (st) st.textContent = "Archiv nicht erreichbar";
    if (inf) inf.textContent = "Bitte die Datei supabase/phase2_archiv.sql im Supabase SQL Editor ausführen.";
    return;
  }

  if (st) st.textContent = "Archiv verbunden";
  if (inf) inf.textContent = rows.length + " Dokument(e) gefunden.";
  await loadArchiv();
}

function showPdfPreview(pdfUri){
  const frame=document.getElementById("pdfFrame");
  const empty=document.getElementById("pdfPreviewEmpty");
  if(!frame||!pdfUri)return;
  try{
    const arr=pdfUri.split(',');
    const mime=(arr[0].match(/:(.*?);/)||[])[1]||"application/pdf";
    const bstr=atob(arr[1]);
    const u8=new Uint8Array(bstr.length);
    for(let i=0;i<bstr.length;i++)u8[i]=bstr.charCodeAt(i);
    if(window._pdfPreviewBlobUrl) URL.revokeObjectURL(window._pdfPreviewBlobUrl);
    window._pdfPreviewBlobUrl=URL.createObjectURL(new Blob([u8],{type:mime}));
    frame.src=window._pdfPreviewBlobUrl+"#zoom=page-width";
    if(empty) empty.style.display="none";
  }catch(e){
    frame.src=pdfUri+"#zoom=page-width";
    if(empty) empty.style.display="none";
  }
}

function openPdfNative(){
  // Archivierte PDFs liegen bereits als Blob im Speicher.
  if (window._currentPdfBlobUrl) {
    window.open(window._currentPdfBlobUrl, "_blank");
    return;
  }

  if(!window._currentPdfUri) return;

  // Data-URI in Blob umwandeln – funktioniert zuverlässiger auf iOS/Safari.
  try {
    const arr = window._currentPdfUri.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8 = new Uint8Array(n);
    for(let i=0;i<n;i++) u8[i]=bstr.charCodeAt(i);
    const blob = new Blob([u8],{type:mime});
    const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
  } catch(e) {
    window.open(window._currentPdfUri,'_blank');
  }
}

function testArchiv() {
  var st = document.getElementById("archiv-status");
  var inf = document.getElementById("archiv-info");
  if(st) st.textContent = "Teste Verbindung...";
  if(inf) inf.textContent = "";
  sbGet().then(function(rows) {
    if (rows === null) {
      if(st) st.textContent = "Supabase nicht erreichbar";
      if(inf) inf.innerHTML = "Bitte in Supabase SQL Editor ausf\u00fchren:<br><br><code style='font-size:11px;background:rgba(0,0,0,0.3);padding:8px;display:block;border-radius:6px;text-align:left'>create policy \"lesen\" on archiv for select using (true);<br>create policy \"schreiben\" on archiv for insert with check (true);<br>create policy \"loeschen\" on archiv for delete using (true);<\/code>";
    } else if (rows.length === 0) {
      if(st) st.textContent = "Verbindung OK - Noch keine Dokumente";
      if(inf) inf.textContent = "Erstelle ein PDF - es erscheint automatisch hier.";
    } else {
      if(st) st.textContent = rows.length + " Dokument(e) gefunden";
      loadArchiv();
    }
  }).catch(function(e) {
    if(st) st.textContent = "Fehler: " + e.message;
  });
}

// ── Auftraege heute ────────────────────────────────────────────────────────
function ensureAuftragsDaten() {
  if (typeof AppData === "undefined") {
    return;
  }
  if (!Array.isArray(AppData.auftraege)) {
    AppData.auftraege = [];
  }
}

function getNextAuftragsId() {
  ensureAuftragsDaten();
  if (!Array.isArray(AppData.auftraege) || !AppData.auftraege.length) {
    return 1;
  }
  var ids = AppData.auftraege.map(function(a){ return Number(a.id) || 0; });
  return Math.max.apply(null, ids) + 1;
}

function initAuftraege() {
  ensureAuftragsDaten();
  renderAuftraege();
}

function addAuftrag() {
  var vn = v("auf_vn"), nn = v("auf_nn");
  if (!vn && !nn) { alert("Bitte mindestens einen Namen eingeben."); return; }

  ensureAuftragsDaten();
  var auftrag = {
    id: getNextAuftragsId(),
    vn: vn,
    nn: nn,
    fi: v("auf_fi"),
    adr: v("auf_adr"),
    tel: v("auf_tel"),
    notiz: v("auf_notiz"),
    erledigt: false
  };

  AppData.auftraege.push(auftrag);

  ["auf_vn","auf_nn","auf_fi","auf_adr","auf_tel","auf_notiz"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = "";
  });

  if (typeof saveAppData === "function") {
    saveAppData();
  }
  if (window.EventBus && typeof EventBus.publish === "function") {
    EventBus.publish("auftrag:created", auftrag);
  }

  renderAuftraege();
}

function renderAuftraege() {
  ensureAuftragsDaten();
  var list = document.getElementById("auftrag-liste");
  var empty = document.getElementById("auftrag-empty");
  var badge = document.getElementById("auftrag-badge");
  if (!list) return;
  list.innerHTML = "";

  var auftraege = Array.isArray(AppData.auftraege) ? AppData.auftraege : [];
  var offen = auftraege.filter(function(a){ return !a.erledigt; });
  if (badge) badge.textContent = auftraege.length ? (offen.length + " offen") : "";

  if (!auftraege.length) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  auftraege.forEach(function(a) {
    var card = document.createElement("div");
    card.className = "card";
    card.style.cssText = "margin-bottom:12px;padding:16px 18px;" + (a.erledigt ? "opacity:0.45" : "");

    var row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:flex-start;gap:12px";

    var info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0";
    var name = (a.vn + " " + a.nn).trim() || "(ohne Namen)";
    info.innerHTML = "<div style='font-weight:700;font-size:15px;color:#e8f0f8" + (a.erledigt ? ";text-decoration:line-through" : "") + "'>" + name + (a.fi ? " &middot; " + a.fi : "") + "<\/div>"
      + (a.adr ? "<div style='font-size:13px;color:#7eb3e0;margin-top:3px'>" + a.adr + "<\/div>" : "")
      + (a.notiz ? "<div style='font-size:13px;color:#a0c4e8;margin-top:4px'>" + a.notiz + "<\/div>" : "");

    var btnCol = document.createElement("div");
    btnCol.style.cssText = "display:flex;flex-direction:column;gap:6px;flex-shrink:0";

    if (!a.erledigt) {
      var startBtn = document.createElement("button");
      startBtn.className = "btnP";
      startBtn.style.cssText = "padding:9px 14px;font-size:13px;white-space:nowrap";
      startBtn.innerHTML = "&#9654; Starten";
      startBtn.onclick = (function(id){ return function(){ starteAuftrag(id); }; })(a.id);
      btnCol.appendChild(startBtn);
    }

    var delBtn = document.createElement("button");
    delBtn.className = "btnD";
    delBtn.style.cssText = "padding:6px 14px;font-size:12px";
    delBtn.innerHTML = "&#10005;";
    delBtn.onclick = (function(id){ return function(){ removeAuftrag(id); }; })(a.id);
    btnCol.appendChild(delBtn);

    row.appendChild(info);
    row.appendChild(btnCol);
    card.appendChild(row);
    list.appendChild(card);
  });
}

function removeAuftrag(id) {
  ensureAuftragsDaten();
  var auftrag = AppData.auftraege.find(function(a){ return a.id === id; });
  if (!auftrag) {
    renderAuftraege();
    return;
  }

  AppData.auftraege = AppData.auftraege.filter(function(a){ return a.id !== id; });

  if (typeof saveAppData === "function") {
    saveAppData();
  }
  if (window.EventBus && typeof EventBus.publish === "function") {
    EventBus.publish("auftrag:deleted", auftrag);
  }

  renderAuftraege();
}

function starteAuftrag(id) {
  ensureAuftragsDaten();
  var a = AppData.auftraege.find(function(x){ return x.id === id; });
  if (!a) return;
  a.erledigt = true;

  if (typeof saveAppData === "function") {
    saveAppData();
  }
  if (window.EventBus && typeof EventBus.publish === "function") {
    EventBus.publish("auftrag:updated", a);
  }

  // Regiebericht mit den Daten vorbefuellen
  go("rb");
  setTimeout(function() {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val; };
    set("rb_vn", a.vn);
    set("rb_nn", a.nn);
    set("rb_fi", a.fi);
    set("rb_adr", a.adr);
    set("rb_tel", a.tel);
    if (a.notiz) {
      var zeile = document.querySelector("#rb_zeiten .zblk input[id^='ztt_']");
      if (zeile) zeile.value = a.notiz;
    }
  }, 50);
  renderAuftraege();
}

// ── Arbeitszeit ───────────────────────────────────────────────────────────
function ensureArbeitszeitDaten() {
  if (typeof AppData === "undefined") {
    return;
  }
  if (!AppData.arbeitszeit) {
    AppData.arbeitszeit = {
      eingestempelt: false,
      start: null,
      heute: []
    };
  }
  if (!Array.isArray(AppData.arbeitszeit.heute)) {
    AppData.arbeitszeit.heute = [];
  }
}

function calculateArbeitszeitHeute() {
  ensureArbeitszeitDaten();
  var heute = new Date().toDateString();
  return (AppData.arbeitszeit.heute || []).reduce(function(total, eintrag) {
    if (!eintrag || !eintrag.start || !eintrag.ende) {
      return total;
    }
    var start = new Date(eintrag.start);
    var ende = new Date(eintrag.ende);
    if (start.toDateString() === heute && ende.toDateString() === heute) {
      return total + Math.round((ende - start) / 60000);
    }
    return total;
  }, 0);
}

function getZeitEintraege() {

    ensureArbeitszeitDaten();

    return AppData.arbeitszeit.eintraege || [];

}

function saveZeitEintraege(arr) {

    ensureArbeitszeitDaten();

    AppData.arbeitszeit.eintraege = Array.isArray(arr) ? arr : [];

    saveAppData();

}
function getAktiverStempel() {
  ensureArbeitszeitDaten();
  return AppData.arbeitszeit.eingestempelt ? AppData.arbeitszeit : null;
}

function setAktiverStempel(val) {
  ensureArbeitszeitDaten();
  if (val) {
    AppData.arbeitszeit.eingestempelt = true;
    AppData.arbeitszeit.start = val.start;
  } else {
    AppData.arbeitszeit.eingestempelt = false;
    AppData.arbeitszeit.start = null;
  }
  if (typeof saveAppData === "function") {
    saveAppData();
  }
}

var zeitInterval = null;

function initArbeitszeit() {
  ensureArbeitszeitDaten();
  updateZeitAnzeige();
  renderZeitHeute();
  if (zeitInterval) {
    clearInterval(zeitInterval);
  }
  zeitInterval = setInterval(updateZeitAnzeige, 1000);
  if (window.EventBus && typeof EventBus.publish === "function") {
    EventBus.publish("arbeitszeit:update", AppData.arbeitszeit);
  }
}

function iZeit() {
  initArbeitszeit();
}

function updateZeitAnzeige() {
  var aktiv = getAktiverStempel();
  var statusEl = document.getElementById("zeit-status");
  var clockEl = document.getElementById("zeit-clock");
  var seitEl = document.getElementById("zeit-seit");
  var btnEl = document.getElementById("zeit-btn");
  if (!statusEl) return;

  var now = new Date();
  var pad = function(n){ return String(n).padStart(2,"0"); };
  clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

  if (aktiv && aktiv.start) {
    statusEl.textContent = "Eingestempelt";
    statusEl.style.color = "#4caf50";
    var start = new Date(aktiv.start);
    var diffMs = now - start;
    var diffMin = Math.floor(diffMs / 60000);
    var h = Math.floor(diffMin / 60), m = diffMin % 60;
    seitEl.textContent = "seit " + pad(start.getHours()) + ":" + pad(start.getMinutes()) + " Uhr  (" + h + "h " + m + "min)";
    btnEl.innerHTML = "&#9209; Ausstempeln";
    btnEl.style.background = "linear-gradient(135deg,#c0392b,#e74c3c)";
  } else {
    statusEl.textContent = "Nicht eingestempelt";
    statusEl.style.color = "#7eb3e0";
    seitEl.textContent = "";
    btnEl.innerHTML = "&#9201; Einstempeln";
    btnEl.style.background = "";
  }
}

function toggleStempel() {
  ensureArbeitszeitDaten();
  var now = new Date();
  if (AppData.arbeitszeit.eingestempelt && AppData.arbeitszeit.start) {
    // Ausstempeln
    var start = AppData.arbeitszeit.start;

var eintraege = getZeitEintraege();

eintraege.unshift({

    id: generateWorkEntryId(),

    datum: start.split("T")[0],

    start: start,

    ende: now.toISOString()

});

saveZeitEintraege(eintraege);
    AppData.arbeitszeit.eingestempelt = false;
    AppData.arbeitszeit.start = null;
    if (typeof saveAppData === "function") {
      saveAppData();
    }
    if (window.EventBus && typeof EventBus.publish === "function") {
      EventBus.publish("arbeitszeit:stop", AppData.arbeitszeit);
    }
  } else {
    // Einstempeln
    AppData.arbeitszeit.eingestempelt = true;
    AppData.arbeitszeit.start = now.toISOString();
    if (typeof saveAppData === "function") {
      saveAppData();
    }
    if (window.EventBus && typeof EventBus.publish === "function") {
      EventBus.publish("arbeitszeit:start", AppData.arbeitszeit);
    }
  }
  updateZeitAnzeige();
  renderZeitHeute();
  if (window.EventBus && typeof EventBus.publish === "function") {
    EventBus.publish("arbeitszeit:update", AppData.arbeitszeit);
  }
}

function renderZeitHeute() {
  var listEl = document.getElementById("zeit-heute-liste");
  var sumEl = document.getElementById("zeit-heute-summe");
  if (!listEl) return;
  var heute = new Date().toDateString();
  var eintraege = getZeitEintraege().filter(function(e) {
    return e && e.start && e.ende && new Date(e.start).toDateString() === heute;
  });
  var pad = function(n){ return String(n).padStart(2,"0"); };
  var totalMin = calculateArbeitszeitHeute();
  if (!eintraege.length) {
    listEl.innerHTML = "<div style='color:#4a7aaa;font-size:13px'>Noch keine Eintr&auml;ge heute.<\/div>";
  } else {
    listEl.innerHTML = eintraege.map(function(e) {
      var s = new Date(e.start), en = new Date(e.ende);
      var diffMin = e.dauer || Math.round((en - s) / 60000);
      var h = Math.floor(diffMin/60), m = diffMin%60;
      return "<div style='display:flex;justify-content:space-between;padding:4px 0'><span>"
        + pad(s.getHours())+":"+pad(s.getMinutes()) + " &ndash; " + pad(en.getHours())+":"+pad(en.getMinutes())
        + "<\/span><span style='color:#7eb3e0'>" + h + "h " + m + "min<\/span><\/div>";
    }).join("");
  }
  var th = Math.floor(totalMin/60), tm = totalMin%60;
  sumEl.textContent = eintraege.length ? ("Gesamt heute: " + th + "h " + tm + "min") : "";
}

// ── Formular leeren ──────────────────────────────────────────────────────
function leereFormular(mod) {
  if (!confirm("Alle eingegebenen Daten f\u00fcr dieses Formular wirklich l\u00f6schen?")) return;
  document.querySelectorAll("#" + mod + " input[type='text'], #" + mod + " input:not([type]), #" + mod + " input[type='tel'], #" + mod + " input[type='email'], #" + mod + " input[type='number'], #" + mod + " textarea").forEach(function(el) {
    el.value = "";
  });
  document.querySelectorAll("#" + mod + " input[type='checkbox'], #" + mod + " input[type='radio']").forEach(function(el) {
    el.checked = false;
  });
  document.querySelectorAll("#" + mod + " .fw").forEach(function(el) { el.innerHTML = ""; });
  if (mod === "rb") {
    document.getElementById("rb_zeiten").innerHTML = ""; ztC = 1; addZeit();
    document.getElementById("rb_pos").innerHTML = ""; pcR = 1; addPos("rb");
    var c1 = document.getElementById("rb_sc"); if(c1) c1.getContext("2d").clearRect(0,0,c1.width,c1.height);
    document.getElementById("rb_sok").classList.add("hidden");
  } else if (mod === "to") {
    var c2 = document.getElementById("to_sc2"); if(c2) c2.getContext("2d").clearRect(0,0,c2.width,c2.height);
    document.getElementById("to_sok").classList.add("hidden");
    document.getElementById("to_zylF").classList.add("hidden");
    updTO();
  } else if (mod === "an") {
    document.getElementById("an_zyls").innerHTML = ""; zyC = 1; addZyl();
    document.getElementById("an_pos").innerHTML = ""; pcA = 1; addPos("an");
    var c3 = document.getElementById("an_sc"); if(c3) c3.getContext("2d").clearRect(0,0,c3.width,c3.height);
    document.getElementById("an_sok").classList.add("hidden");
  }
  tab(mod, 0);
}

function naechsterAuftrag() {
  document.getElementById("pdfMod").classList.remove("open");
  var mod = window._currentModul;
  if (!mod) return;
  document.querySelectorAll("#" + mod + " input[type='text'], #" + mod + " input:not([type]), #" + mod + " input[type='tel'], #" + mod + " input[type='email'], #" + mod + " input[type='number'], #" + mod + " textarea").forEach(function(el) { el.value = ""; });
  document.querySelectorAll("#" + mod + " input[type='checkbox'], #" + mod + " input[type='radio']").forEach(function(el) { el.checked = false; });
  document.querySelectorAll("#" + mod + " .fw").forEach(function(el) { el.innerHTML = ""; });
  if (mod === "rb") {
    document.getElementById("rb_zeiten").innerHTML = ""; ztC = 1; addZeit();
    document.getElementById("rb_pos").innerHTML = ""; pcR = 1; addPos("rb");
    var c1 = document.getElementById("rb_sc"); if(c1) c1.getContext("2d").clearRect(0,0,c1.width,c1.height);
    document.getElementById("rb_sok").classList.add("hidden");
  } else if (mod === "to") {
    var c2 = document.getElementById("to_sc2"); if(c2) c2.getContext("2d").clearRect(0,0,c2.width,c2.height);
    document.getElementById("to_sok").classList.add("hidden");
    document.getElementById("to_zylF").classList.add("hidden");
    updTO();
  } else if (mod === "an") {
    document.getElementById("an_zyls").innerHTML = ""; zyC = 1; addZyl();
    document.getElementById("an_pos").innerHTML = ""; pcA = 1; addPos("an");
    var c3 = document.getElementById("an_sc"); if(c3) c3.getContext("2d").clearRect(0,0,c3.width,c3.height);
    document.getElementById("an_sok").classList.add("hidden");
  }
  tab(mod, 0);
}

function doMail(nurBuero){
  const to=nurBuero?BUERO:(document.getElementById("mailEm").value||BUERO);
  const cc=(!nurBuero&&document.getElementById("mailEm").value)?BUERO:"";
  const typ=curMail.typ||"Dokument";
  const anr=typ==="Angebot"?"unser Angebot":typ==="Regiebericht"?"Ihren Arbeitsrapport":"Ihr Einsatzprotokoll";
  const subj=encodeURIComponent(typ+" "+curMail.nr+" - "+FN);
  const body=encodeURIComponent("Sehr geehrte/r "+(curMail.name||"Kundin/Kunde")+",\n\nanbei erhalten Sie "+anr+" vom "+(curMail.dat||"")+"."+"\n\nAuftragsnummer: "+curMail.nr+"\n"+(curMail.info||"")+"\n\nMit freundlichen Gruessen\n"+FN+"\n"+FS+" - "+FP+"\nTel: "+FT);
  let href="mailto:"+encodeURIComponent(to)+"?subject="+subj+"&body="+body;
  if(cc)href+="&cc="+encodeURIComponent(cc);
  window.location.href=href;
  document.getElementById("mailOk").classList.remove("hidden");
}