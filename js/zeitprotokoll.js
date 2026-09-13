/* Zentrale Zeitprotokollierung
   Zeit wird dokumentiert, aber niemals automatisch zur Preisberechnung verwendet.
   Notdienst: Status-Zeitpunkte + Dauer.
   Regiebericht: manuelle Zeitabschnitte + Abrechnungsfreigabe im Büro.
*/
(function(){
  const ND_TIME_KEY="schluesseldienst-notdienst-zeiten-v1";
  const ND_PRICE_KEY="schluesseldienst-notdienst-preise-v2";
  const RB_TIME_KEY="schluesseldienst-regiebericht-zeiten-v1";

  const pad=n=>String(n).padStart(2,"0");
  const nowIso=()=>new Date().toISOString();
  const nowDate=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
  const nowTime=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
  const read=(key, fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(e){return fallback}};
  const write=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const euro=v=>Number(v||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
  const fmtDuration=ms=>{if(!Number.isFinite(ms)||ms<0)return "–";const m=Math.round(ms/60000),h=Math.floor(m/60),r=m%60;return `${h} Std. ${pad(r)} Min.`};
  const diff=(a,b)=>{if(!a||!b)return 0;return Math.max(0,new Date(b).getTime()-new Date(a).getTime())};

  function getNdTimes(){return read(ND_TIME_KEY,{})}
  function saveNdTime(id,status){const all=getNdTimes();all[id]=all[id]||{created:null,unterwegs:null,vor_ort:null,arbeit:null,erledigt:null};if(!all[id][status])all[id][status]=nowIso();write(ND_TIME_KEY,all);return all[id]}
  function getNdTime(id){return getNdTimes()[id]||{created:null,unterwegs:null,vor_ort:null,arbeit:null,erledigt:null}}

  // Preislogik bewusst ohne Zeitkomponente.
  function getNdPriceSettings(){
    const old=read("schluesseldienst-notdienst-preise-v1",{});
    return {...{pauschale:0,kmPreis:0,nacht:0,samstag:0,sonntag:0,feiertag:0,mwst:19,nachtVon:"22:00",nachtBis:"06:00"},...old,...read(ND_PRICE_KEY,{})};
  }
  function ndCalcNew(e){
    const p=getNdPriceSettings(), km=Number(localStorage.getItem("nd-km-"+e.id)||0), material=Number(localStorage.getItem("nd-material-"+e.id)||0);
    const d=new Date((e.datum||"")+"T"+(e.von||"00:00"));
    const t=e.von||"00:00", night=(t>=p.nachtVon||t<p.nachtBis);
    let surcharge=night?Number(p.nacht||0):0;
    if(d.getDay()===6)surcharge+=Number(p.samstag||0);
    if(d.getDay()===0)surcharge+=Number(p.sonntag||0);
    if(e.ndFeiertag)surcharge+=Number(p.feiertag||0);
    const net=Number(p.pauschale||0)+km*Number(p.kmPreis||0)+material+surcharge;
    const vat=net*Number(p.mwst||0)/100;
    return {net,vat,total:net+vat,km,material,surcharge,night};
  }

  function setNdValue(id,key,value){localStorage.setItem("nd-"+key+"-"+id,String(Number(value)||0));renderNotdienst();}
  function setNdHoliday(id,checked){const e=(window.AppData?.kalender?.eintraege||[]).find(x=>String(x.id)===String(id));if(e)e.ndFeiertag=!!checked;localStorage.setItem("nd-holiday-"+id,checked?"1":"0");renderNotdienst()}

  function renderNdTime(e){
    const t=getNdTime(e.id), start=t.created, end=t.erledigt;
    const total=diff(start,end||nowIso()), work=diff(t.arbeit,end||null);
    return `<div class="nd-time-protocol"><div class="nd-time-title">⏱ Zeitprotokoll <span>nur Dokumentation</span></div><div class="nd-time-grid">
      <div><small>Einsatz</small><strong>${t.created?new Date(t.created).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"–"}</strong></div>
      <div><small>Unterwegs</small><strong>${t.unterwegs?new Date(t.unterwegs).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"–"}</strong></div>
      <div><small>Vor Ort</small><strong>${t.vor_ort?new Date(t.vor_ort).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"–"}</strong></div>
      <div><small>Arbeitsbeginn</small><strong>${t.arbeit?new Date(t.arbeit).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"–"}</strong></div>
      <div><small>Abgeschlossen</small><strong>${t.erledigt?new Date(t.erledigt).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"–"}</strong></div>
      <div><small>Gesamtdauer</small><strong>${fmtDuration(total)}</strong></div>
      <div><small>Arbeitsdauer</small><strong>${fmtDuration(work)}</strong></div>
    </div></div>`;
  }

  function renderNotdienstNew(){
    const box=document.getElementById("notdienstAktiv");
    if(!box)return;
    const entries=(window.AppData?.kalender?.eintraege||[]).filter(e=>e&&e.typ==="notdienst").sort((a,b)=>((b.datum||"")+(b.von||"")).localeCompare((a.datum||"")+(a.von||"")));
    const active=entries.filter(e=>e.status!=="erledigt"), finished=entries.filter(e=>e.status==="erledigt").slice(0,5);
    const status=[{key:"notdienst",label:"🚨 Neu",next:"unterwegs"},{key:"unterwegs",label:"🚗 Unterwegs",next:"vor_ort"},{key:"vor_ort",label:"📍 Vor Ort",next:"arbeit"},{key:"arbeit",label:"🔧 Arbeit läuft",next:"erledigt"},{key:"erledigt",label:"✅ Abgeschlossen",next:null}];
    const card=e=>{
      const info=status.find(s=>s.key===e.status)||status[0], idx=status.findIndex(s=>s.key===info.key), progress=info.key==="erledigt"?100:Math.round(idx/4*100);
      const customer=[e.vorname,e.nachname].filter(Boolean).join(" ")||"Kunde", address=[[e.strasse,e.hausnummer].filter(Boolean).join(" "),[e.postleitzahl,e.ort].filter(Boolean).join(" ")].filter(Boolean).join(", "), desc=String(e.beschreibung||"").replace(/^\[NOTFALL\]\s*/i,"").trim(), c=ndCalcNew(e), p=getNdPriceSettings();
      const buttons=status.filter(s=>s.key!=="erledigt"||info.key==="arbeit").map(s=>`<button class="notdienst-status-btn ${s.key===info.key?"current":""}" ${s.key!==info.key&&s.key!==info.next?"disabled":""} onclick="updateNotdienstStatus('${esc(e.id)}','${s.key}')">${s.label}</button>`).join("");
      return `<article class="notdienst-active-card ${info.key}"><div class="notdienst-active-head"><div><div class="notdienst-active-badge">${info.label}</div><h3>${esc(e.titel)}</h3><div class="notdienst-meta">📅 ${esc((e.datum||"").split("-").reverse().join("."))} · 🕒 ${esc(e.von||"")} · 👤 ${esc(e.mitarbeiter||"-")}</div></div><div class="notdienst-progress"><span style="width:${progress}%"></span></div></div>
      <div class="notdienst-customer-grid"><div><small>KUNDE</small><strong>${esc(customer)}</strong></div><div><small>TELEFON</small><strong>${e.telefonnummer?`<a href="tel:${esc(e.telefonnummer)}">${esc(e.telefonnummer)}</a>`:"–"}</strong></div><div><small>ADRESSE</small><strong>${esc(address||"–")}</strong></div><div><small>EINSATZINFO</small><strong>${esc(desc||"Keine weitere Angabe")}</strong></div></div>
      ${renderNdTime(e)}
      <div class="ndp-calc"><div><small>VORLÄUFIGE KALKULATION</small><strong>${euro(c.total)}</strong></div><label>Entfernung km<input type="number" min="0" step="0.1" value="${c.km}" onchange="setNdValue('${esc(e.id)}','km',this.value)"></label><label>Material €<input type="number" min="0" step="0.01" value="${c.material}" onchange="setNdValue('${esc(e.id)}','material',this.value)"></label><label class="nd-holiday-check"><input type="checkbox" ${e.ndFeiertag||localStorage.getItem("nd-holiday-"+e.id)==="1"?"checked":""} onchange="setNdHoliday('${esc(e.id)}',this.checked)"> Feiertag</label><span>Pauschale ${euro(p.pauschale)} · Entfernung ${euro(c.km*p.kmPreis)} · Material ${euro(c.material)} · Zuschläge ${euro(c.surcharge)} · Netto ${euro(c.net)} · MwSt. ${euro(c.vat)}</span></div>
      <div class="notdienst-status-actions">${buttons}</div><div class="notdienst-card-actions">${info.key!=="erledigt"?`<button class="btnP" onclick="openNotdienstNavigation('${esc(e.id)}')">🧭 Navigation</button>`:""}${info.key!=="notdienst"?`<button class="btnS" onclick="openNotdienstRegiebericht('${esc(e.id)}')">📄 Regiebericht</button>`:""}${info.key==="arbeit"?`<button class="btnP" onclick="updateNotdienstStatus('${esc(e.id)}','erledigt')">✅ Einsatz abschließen</button>`:""}</div></article>`;
    };
    box.innerHTML=`<div class="notdienst-section-title">AKTIVE EINSÄTZE</div>${active.length?active.map(card).join(""):"<div class=\"notdienst-empty-card\">🚨 Aktuell ist kein Notfalleinsatz aktiv.</div>"}`+(finished.length?`<div class="notdienst-section-title notdienst-finished-title">LETZTE ABGESCHLOSSENE EINSÄTZE</div>${finished.map(card).join("")}`:"");
  }

  // Preis-Einstellungen ersetzen die bisherige Arbeitszeit-basierte Notdienstkalkulation.
  window.ensureNdPricePanel=function(){
    const host=document.getElementById("notdienst");if(!host||document.getElementById("ndPriceWrap"))return;
    const p=getNdPriceSettings(),w=document.createElement("div");w.id="ndPriceWrap";
    w.innerHTML=`<div class="ndp-toolbar"><div><div class="dashboard-eyebrow">ABRECHNUNG</div><strong>Notdienst-Preise</strong><span>Zeit bleibt reine Dokumentation und beeinflusst den Preis nicht.</span></div><button class="btnS" onclick="toggleNdSettings()">⚙️ Preise & Einstellungen</button></div><div id="ndPricePanel" class="ndp-panel hidden"><div class="sec">Preis-Einstellungen</div><div class="ndp-grid"><label>Notdienstpauschale €<input id="ndp_pauschale" type="number" min="0" step="0.01" value="${p.pauschale}"></label><label>Entfernung €/km<input id="ndp_kmPreis" type="number" min="0" step="0.01" value="${p.kmPreis}"></label><label>Nacht / außerhalb €<input id="ndp_nacht" type="number" min="0" step="0.01" value="${p.nacht}"></label><label>Samstag €<input id="ndp_samstag" type="number" min="0" step="0.01" value="${p.samstag}"></label><label>Sonntag €<input id="ndp_sonntag" type="number" min="0" step="0.01" value="${p.sonntag}"></label><label>Feiertag €<input id="ndp_feiertag" type="number" min="0" step="0.01" value="${p.feiertag}"></label><label>MwSt. %<input id="ndp_mwst" type="number" min="0" step="0.1" value="${p.mwst}"></label><label>Nachtbeginn<input id="ndp_nachtVon" type="time" value="${p.nachtVon}"></label><label>Nachtende<input id="ndp_nachtBis" type="time" value="${p.nachtBis}"></label></div><div class="ndp-actions"><button class="btnS" onclick="toggleNdSettings()">Abbrechen</button><button class="btnP" onclick="saveNdSettings()">💾 Preise speichern</button></div></div>`;
    host.insertBefore(w,document.getElementById("notdienstStart")||host.firstChild);
  };
  window.saveNdSettings=function(){const p={pauschale:Number(document.getElementById("ndp_pauschale").value)||0,kmPreis:Number(document.getElementById("ndp_kmPreis").value)||0,nacht:Number(document.getElementById("ndp_nacht").value)||0,samstag:Number(document.getElementById("ndp_samstag").value)||0,sonntag:Number(document.getElementById("ndp_sonntag").value)||0,feiertag:Number(document.getElementById("ndp_feiertag").value)||0,mwst:Number(document.getElementById("ndp_mwst").value)||0,nachtVon:document.getElementById("ndp_nachtVon").value||"22:00",nachtBis:document.getElementById("ndp_nachtBis").value||"06:00"};write(ND_PRICE_KEY,p);document.getElementById("ndPricePanel")?.classList.add("hidden");renderNotdienstNew();alert("Notdienst-Preise wurden gespeichert.")};
  window.toggleNdSettings=window.toggleNdSettings||function(){document.getElementById("ndPricePanel")?.classList.toggle("hidden")};
  window.ndCalc=ndCalcNew;
  window.renderNotdienst=renderNotdienstNew;

  const originalUpdate=window.updateNotdienstStatus;
  window.updateNotdienstStatus=async function(id,status){
    if(status!=="erledigt")saveNdTime(id,status);else saveNdTime(id,"erledigt");
    const times=getNdTime(id);if(!times.created){const all=getNdTimes();all[id]={...times,created:nowIso()};write(ND_TIME_KEY,all)}
    if(typeof originalUpdate==="function")await originalUpdate(id,status);
    renderNotdienstNew();
  };

  // Beim Öffnen eines Notdienstes entsteht der erste Zeitstempel automatisch.
  const originalSave=window.saveNotdienst;
  window.saveNotdienst=async function(startNavigation){
    const before=new Set((window.AppData?.kalender?.eintraege||[]).map(e=>String(e.id)));
    const result=await originalSave?.(startNavigation);
    const entry=(window.AppData?.kalender?.eintraege||[]).filter(e=>e&&e.typ==="notdienst"&&!before.has(String(e.id))).sort((a,b)=>String(b.datum+b.von).localeCompare(String(a.datum+a.von)))[0];
    if(entry){const all=getNdTimes();all[entry.id]={created:nowIso(),unterwegs:null,vor_ort:null,arbeit:null,erledigt:null};write(ND_TIME_KEY,all);renderNotdienstNew()}
    return result;
  };

  // Regiebericht: Zeitabschnitte unabhängig vom Preis protokollieren.
  function getRbTimes(){return read(RB_TIME_KEY,[])}
  function saveRbTimes(rows){write(RB_TIME_KEY,rows)}
  function rbKey(){return document.getElementById("rb_dat")?.value+"|"+document.getElementById("rb_vn")?.value+"|"+document.getElementById("rb_nn")?.value}
  function renderRbTimePanel(){
    const modal=document.getElementById("serviceModal");if(!modal)return;
    let panel=document.getElementById("rbZeitProtokoll");if(!panel){panel=document.createElement("div");panel.id="rbZeitProtokoll";panel.className="rb-time-protocol";const target=modal.querySelector(".modal-body,.modal-content,.service-report-modal")||modal;target.appendChild(panel)}
    const key=rbKey(),rows=getRbTimes().filter(r=>r.key===key);panel.innerHTML=`<div class="rb-time-head"><div><strong>⏱ Zeitprotokoll</strong><span>Dokumentation – keine automatische Preisberechnung</span></div><button class="btnS" onclick="addRbProtocolTime()">＋ Zeitabschnitt</button></div>${rows.length?rows.map((r,i)=>`<div class="rb-time-row"><input type="date" value="${esc(r.date)}" onchange="editRbProtocolTime(${i},'date',this.value)"><input type="time" value="${esc(r.start)}" onchange="editRbProtocolTime(${i},'start',this.value)"><span>bis</span><input type="time" value="${esc(r.end)}" onchange="editRbProtocolTime(${i},'end',this.value)"><strong>${r.start&&r.end?fmtDuration(diff(r.date+"T"+r.start,r.date+"T"+r.end)):"–"}</strong><label><input type="checkbox" ${r.billable?"checked":""} onchange="editRbProtocolTime(${i},'billable',this.checked)"> abrechenbar</label><button class="btnS" onclick="deleteRbProtocolTime(${i})">✕</button></div>`).join(""):"<div class=\"rb-time-empty\">Noch keine Zeitabschnitte protokolliert.</div>"}<div class="rb-time-foot">Die Markierung <strong>abrechenbar</strong> ist nur eine Büroentscheidung. Sie wird nicht automatisch als Preisposition verwendet.</div>`;
  }
  window.addRbProtocolTime=function(){const key=rbKey(),rows=getRbTimes();rows.push({key,date:nowDate(),start:nowTime(),end:nowTime(),billable:false});saveRbTimes(rows);renderRbTimePanel()};
  window.editRbProtocolTime=function(index,field,value){const key=rbKey(),all=getRbTimes(),rows=all.filter(r=>r.key===key),r=rows[index];if(!r)return;r[field]=value;const globalIndex=all.indexOf(r);all[globalIndex]=r;saveRbTimes(all);renderRbTimePanel()};
  window.deleteRbProtocolTime=function(index){const key=rbKey(),all=getRbTimes(),rows=all.filter(r=>r.key===key),r=rows[index];if(!r)return;all.splice(all.indexOf(r),1);saveRbTimes(all);renderRbTimePanel()};

  const originalIRB=window.iRB;
  if(typeof originalIRB==="function")window.iRB=function(){const r=originalIRB.apply(this,arguments);setTimeout(renderRbTimePanel,50);return r};

  // Re-render after navigation/status changes and periodically refresh running duration.
  setTimeout(()=>{if(typeof renderNotdienstNew==="function")renderNotdienstNew();renderRbTimePanel()},300);
  setInterval(()=>{if(document.getElementById("notdienstAktiv"))renderNotdienstNew();if(document.getElementById("rbZeitProtokoll"))renderRbTimePanel()},60000);
})();
