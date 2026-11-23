/* Notdienst-Zeitpersistenz v1
   Speichert den Ablauf direkt am Kalenderauftrag in Supabase und erlaubt Zeitkorrekturen.
*/
(function(){
  if(window.__ndZeitpersistenzV1) return;
  window.__ndZeitpersistenzV1 = true;

  const KEY = "schluesseldienst-notdienst-zeiten-v5";
  const FIELDS = [
    ["fahrtStart", "Fahrtbeginn"],
    ["angekommen", "Ankunft am Einsatzort"],
    ["arbeitStart", "Arbeitsbeginn"],
    ["arbeitEnde", "Arbeitsende"],
    ["ende", "Einsatzabschluss"]
  ];
  const readAll = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e) { return {}; } };
  const writeAll = value => localStorage.setItem(KEY, JSON.stringify(value));
  const localFor = id => readAll()[String(id)] || {};
  const isRemote = id => window.supabaseReady && window.supabaseClient && !String(id).startsWith("LOCAL-");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const toInput = value => {
    if(!value) return "";
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "";
    const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,16);
  };
  const fromInput = value => value ? new Date(value).toISOString() : null;

  async function fetchRemote(id){
    if(!isRemote(id)) return null;
    const {data,error} = await window.supabaseClient.from("kalender_eintraege")
      .select("id,zeitprotokoll").eq("id",id).maybeSingle();
    if(error) throw error;
    return data?.zeitprotokoll && typeof data.zeitprotokoll === "object" ? data.zeitprotokoll : null;
  }

  async function persist(id, supplied){
    const all = readAll();
    const current = supplied || all[String(id)] || {};
    all[String(id)] = current;
    writeAll(all);
    const entry = (window.AppData?.kalender?.eintraege || []).find(e => String(e.id) === String(id));
    if(entry) entry.zeitprotokoll = current;
    if(!isRemote(id)) return {local:true};
    const {error} = await window.supabaseClient.from("kalender_eintraege")
      .update({zeitprotokoll:current}).eq("id",id);
    if(error) throw error;
    return {local:false};
  }

  async function hydrate(id){
    const local = localFor(id);
    if(!isRemote(id)) return local;
    try {
      const remote = await fetchRemote(id);
      if(remote && Object.keys(remote).length){
        const merged = {...local, ...remote};
        const all = readAll(); all[String(id)] = merged; writeAll(all);
        const entry = (window.AppData?.kalender?.eintraege || []).find(e => String(e.id) === String(id));
        if(entry) entry.zeitprotokoll = merged;
        return merged;
      }
      if(Object.keys(local).length) await persist(id, local); // vorhandene Browserdaten einmalig übernehmen
      return local;
    } catch(error) {
      console.error("Zeitprotokoll konnte nicht aus Supabase geladen werden:", error);
      throw error;
    }
  }

  function showSaveError(error){
    console.error("Zeitprotokoll konnte nicht dauerhaft gespeichert werden:", error);
    const note = document.getElementById("ndTimeSaveState");
    if(note) note.textContent = "⚠️ Speicherung fehlgeschlagen – bitte Verbindung prüfen und erneut speichern.";
  }

  async function safePersist(id){
    try {
      await persist(id);
      const note = document.getElementById("ndTimeSaveState");
      if(note) note.textContent = "✓ Zeitprotokoll dauerhaft gespeichert";
    } catch(error) { showSaveError(error); }
  }

  function renderEditor(id){
    const host = document.getElementById("ndWorkflowInner");
    if(!host || host.querySelector("[data-nd-time-editor]")) return;
    const times = localFor(id);
    const rows = FIELDS.map(([key,label]) =>
      '<label class="nd-time-row"><span>'+label+'</span><input type="datetime-local" data-time-key="'+key+'" value="'+toInput(times[key])+'"></label>'
    ).join("");
    const panel = document.createElement("section");
    panel.dataset.ndTimeEditor = "1";
    panel.style.cssText = "margin-top:18px;padding:15px;border:1px solid #315a7c;border-radius:15px;background:#132f46;color:#eaf5ff";
    panel.innerHTML = '<div style="font-weight:800;font-size:15px;margin-bottom:5px">⏱ Zeitprotokoll</div>'+
      '<div style="font-size:12px;color:#9dbbd4;margin-bottom:12px">Gespeicherte Zeitpunkte. Bei Bedarf kannst du Datum und Uhrzeit korrigieren.</div>'+
      '<div class="nd-time-rows">'+rows+'</div>'+
      '<button type="button" class="nd-wf-btn nd-wf-primary" style="margin-top:12px" data-nd-time-save>Zeiten speichern</button>'+
      '<div id="ndTimeSaveState" aria-live="polite" style="font-size:12px;color:#9fd8b8;margin-top:8px"></div>';
    const style = document.createElement("style");
    style.textContent = ".nd-time-rows{display:grid;gap:9px}.nd-time-row{display:grid;grid-template-columns:1fr 1.2fr;gap:10px;align-items:center;font-size:13px;color:#c9dced}.nd-time-row input{min-width:0;width:100%;box-sizing:border-box;background:#0d263b;color:#fff;border:1px solid #456987;border-radius:9px;padding:10px;font:inherit}@media(max-width:430px){.nd-time-row{grid-template-columns:1fr}.nd-time-row input{font-size:16px}}";
    if(!document.getElementById("ndTimeEditorStyle")){style.id="ndTimeEditorStyle";document.head.appendChild(style);}
    panel.querySelector("[data-nd-time-save]").addEventListener("click", async () => {
      const all = readAll();
      const value = {...(all[String(id)] || {})};
      const changed = [];
      panel.querySelectorAll("input[data-time-key]").forEach(input => {
        const key = input.dataset.timeKey;
        const next = fromInput(input.value);
        if((value[key] || null) !== next){
          if(next) value[key] = next;
          else delete value[key];
          changed.push(key);
        }
      });
      if(changed.length){
        value.zeitkorrekturen = [...(value.zeitkorrekturen || []), {
          am: new Date().toISOString(),
          mitarbeiter: window.currentEmployee || "Unbekannt",
          felder: changed
        }];
      }
      all[String(id)] = value;
      writeAll(all);
      const button = panel.querySelector("[data-nd-time-save]");
      button.disabled = true; button.textContent = "⏳ Wird gespeichert …";
      try {
        await persist(id, value);
        panel.querySelector("#ndTimeSaveState").textContent = "✓ Zeitprotokoll dauerhaft gespeichert";
      } catch(error) {
        showSaveError(error);
      } finally {
        button.disabled = false; button.textContent = "Zeiten speichern";
      }
    });
    host.appendChild(panel);
  }

  function attachEditor(id){
    renderEditor(id);
    const host = document.getElementById("ndWorkflowInner");
    if(host && !host.__ndTimeObserver){
      const observer = new MutationObserver(() => {
        if(!host.querySelector("[data-nd-time-editor]")) renderEditor(window.__ndZeitEditorId || id);
      });
      observer.observe(host,{childList:true});
      host.__ndTimeObserver = observer;
    }
    window.__ndZeitEditorId = id;
  }

  function wrapAsync(name, before, after){
    const original = window[name];
    if(typeof original !== "function" || original.__ndZeitWrapped) return;
    const wrapped = async function(id, ...args){
      if(before) await before(id);
      const result = await original.call(this,id,...args);
      if(after) await after(id);
      return result;
    };
    wrapped.__ndZeitWrapped = true;
    window[name] = wrapped;
  }

  const originalStart = window.startNotdienstWorkflow;
  if(typeof originalStart === "function"){
    const wrapped = async function(id,useNavigation){
      try { await hydrate(id); }
      catch(error) { alert("Die gespeicherten Einsatzzeiten konnten nicht geladen werden. Bitte Verbindung prüfen. Der Einsatz wird trotzdem geöffnet."); }
      const result = await originalStart.call(this,id,useNavigation);
      await safePersist(id);
      attachEditor(id);
      return result;
    };
    wrapped.__ndZeitWrapped = true;
    window.startNotdienstWorkflow = wrapped;
  }

  const originalArrived = window.ndArrived;
  if(typeof originalArrived === "function"){
    window.ndArrived = async function(id,...args){
      const result = await originalArrived.call(this,id,...args);
      await safePersist(id);
      attachEditor(id);
      return result;
    };
  }

  const originalContinue = window.ndContinueToClose;
  if(typeof originalContinue === "function"){
    window.ndContinueToClose = function(id,...args){
      const result = originalContinue.call(this,id,...args);
      safePersist(id);
      attachEditor(id);
      return result;
    };
  }

  const originalFinish = window.ndFinish;
  if(typeof originalFinish === "function"){
    window.ndFinish = async function(id,...args){
      const result = await originalFinish.call(this,id,...args);
      const all = readAll();
      const times = {...(all[String(id)] || {})};
      if(!times.arbeitEnde) times.arbeitEnde = new Date().toISOString();
      if(!times.ende) times.ende = times.arbeitEnde;
      all[String(id)] = times;
      writeAll(all);
      await safePersist(id);
      return result;
    };
  }

  const originalOpenWork = window.openNdWork;
  if(typeof originalOpenWork === "function"){
    window.openNdWork = async function(id,...args){
      try { await hydrate(id); }
      catch(error) { alert("Zeitdaten konnten nicht geladen werden: "+(error.message||error)); }
      const result = await originalOpenWork.call(this,id,...args);
      attachEditor(id);
      return result;
    };
  }

  const originalOpenWorkflow = window.openNotdienstWorkflow;
  if(typeof originalOpenWorkflow === "function"){
    window.openNotdienstWorkflow = async function(id,...args){
      try { await hydrate(id); }
      catch(error) { alert("Zeitdaten konnten nicht geladen werden: "+(error.message||error)); }
      const result = await originalOpenWorkflow.call(this,id,...args);
      setTimeout(()=>attachEditor(id),0);
      return result;
    };
  }


  // Zeitpunkte auch im Kunden-Regiebericht und in der PDF-Ausgabe ausweisen.
  const originalBuildReport = window.buildRegieberichtHtml;
  if(typeof originalBuildReport === "function"){
    window.buildRegieberichtHtml = function(entry,...args){
      const html = originalBuildReport.call(this,entry,...args);
      const times = entry?.zeitprotokoll || localFor(entry?.id);
      const rows = FIELDS.filter(([key])=>times[key]).map(([key,label]) =>
        "<div><b>"+esc(label)+":</b><br>"+esc(new Date(times[key]).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}))+"</div>"
      ).join("");
      if(!rows) return html;
      const block = '<section><h3>Zeitprotokoll</h3><div class="rb-grid">'+rows+'</div></section>';
      return html.replace('<section><h3>Vorgefunden</h3>',block+'<section><h3>Vorgefunden</h3>');
    };
  }

  // Legacy-Zeitdaten beim nächsten Öffnen eines Einsatzes einmalig in Supabase übernehmen.
  window.ndZeitprotokollSync = safePersist;
  console.log("Notdienst-Zeitpersistenz v1 geladen");
})();
