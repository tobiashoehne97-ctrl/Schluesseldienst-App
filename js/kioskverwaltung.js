/* Verwaltung der iPad-Präsentation */
(function(){
  "use strict";
  const root=()=>document.getElementById("kioskManagementApp");
  let items=[],editing=null,ready=false;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const val=id=>document.getElementById(id)?.value??"";
  function shell(){
    root().innerHTML='<div class="km-wrap"><header class="km-head"><div><div class="km-eyebrow">DIGITALE AUSSTELLUNG · IPAD</div><h1>Präsentationsverwaltung</h1><p>Bilder und Videos für den TV-Modus verwalten und sortieren.</p></div><button class="btnP" id="kmNew">＋ Inhalt hinzufügen</button></header><div class="km-note">Tipp: Für Videos eine direkt erreichbare MP4-Adresse verwenden. Die Wiedergabe erfolgt im Kioskmodus stumm und automatisch.</div><div id="kmList"></div><section class="km-editor hidden" id="kmEditor"></section></div>';
    document.getElementById("kmNew").onclick=()=>edit();
  }
  async function load(){
    const {data,error}=await window.supabaseClient.from("kiosk_slides").select("*").order("sort_order").order("created_at");
    if(error){root().innerHTML='<div class="km-wrap"><h2>Präsentationsdaten nicht verfügbar</h2><p>'+esc(error.message)+'</p><p>Bitte SQL-Datei <strong>supabase/ipad_kiosk.sql</strong> in Supabase ausführen und mit einem angemeldeten Mitarbeiterkonto neu laden.</p><button class="btnS" onclick="initKioskManagement()">Erneut laden</button></div>';return;}
    items=data||[];ready=true;draw();
  }
  function draw(){
    const list=document.getElementById("kmList");if(!list)return;
    list.innerHTML=items.length?'<div class="km-list">'+items.map((x,i)=>'<article class="km-item"><div class="km-thumb">'+(x.media_type==="video"?'<span>▶</span>':'<img src="'+esc(x.media_url)+'" alt="">')+'</div><div class="km-info"><strong>'+esc(x.title)+'</strong><small>'+esc(x.dealer||"Ohne Händler")+' · '+(x.media_type==="video"?"Video":"Bild")+' · '+(x.active?"Aktiv":"Pausiert")+'</small><small>Reihenfolge: '+esc(x.sort_order)+' · Bilddauer: '+esc(x.duration_seconds)+' Sek.</small></div><div class="km-actions"><button class="btnS" data-up="'+esc(x.id)+'" '+(i===0?"disabled":"")+'>↑</button><button class="btnS" data-down="'+esc(x.id)+'" '+(i===items.length-1?"disabled":"")+'>↓</button><button class="btnS" data-edit="'+esc(x.id)+'">Bearbeiten</button></div></article>').join("")+'</div>':'<div class="km-empty"><strong>Noch keine Präsentationsinhalte</strong><p>Lege den ersten Händlerbeitrag mit Bild oder Video an.</p><button class="btnP" id="kmEmptyNew">＋ Inhalt hinzufügen</button></div>';
    list.querySelector("#kmEmptyNew")?.addEventListener("click",()=>edit());
    list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));
    list.querySelectorAll("[data-up],[data-down]").forEach(b=>b.onclick=()=>move(b.dataset.up||b.dataset.down,b.hasAttribute("data-up")?-1:1));
  }
  function edit(id=null){
    editing=id;const x=items.find(y=>String(y.id)===String(id))||{};
    const box=document.getElementById("kmEditor");box.classList.remove("hidden");
    box.innerHTML='<div class="km-editor-head"><div><div class="km-eyebrow">'+(id?"INHALT BEARBEITEN":"NEUER PRÄSENTATIONSINHALT")+'</div><h2>'+(id?esc(x.title):"Inhalt hinzufügen")+'</h2></div><button class="btnS" id="kmClose">Schließen ✕</button></div><form id="kmForm"><div class="km-grid"><label>Titel / Produktname *<input id="kmTitle" required value="'+esc(x.title||"")+'" placeholder="z. B. Rottner Wertschutzschränke"></label><label>Händler / Marke<input id="kmDealer" value="'+esc(x.dealer||"")+'" placeholder="Rottner, Winkhaus, ABUS …"></label><label>Medientyp<select id="kmType"><option value="image" '+((x.media_type||"image")==="image"?"selected":"")+'>Bild</option><option value="video" '+(x.media_type==="video"?"selected":"")+'>Video</option></select></label><label>Reihenfolge<input id="kmOrder" type="number" step="1" value="'+esc(x.sort_order??(items.length+1)*10)+'"></label><label class="km-wide">Medienadresse (URL) *<input id="kmUrl" type="url" required value="'+esc(x.media_url||"")+'" placeholder="https://…/video.mp4 oder Bilddatei"></label><label>Anzeigedauer bei Bildern (Sekunden)<input id="kmDuration" type="number" min="3" max="600" value="'+esc(x.duration_seconds??15)+'"></label><label class="km-check"><input id="kmActive" type="checkbox" '+(x.active!==false?"checked":"")+'> In Präsentation anzeigen</label></div><div class="km-preview" id="kmPreview">Vorschau erscheint nach Eingabe einer Medienadresse.</div><div class="km-actions"><button class="btnP" type="submit">💾 Speichern</button><button class="btnS" type="button" id="kmCancel">Abbrechen</button>'+(id?'<button class="btnS km-delete" type="button" id="kmDelete">Löschen</button>':"")+'</div><p id="kmMessage" class="km-message"></p></form>';
    document.getElementById("kmClose").onclick=close;document.getElementById("kmCancel").onclick=close;
    document.getElementById("kmUrl").oninput=preview;document.getElementById("kmType").onchange=preview;
    document.getElementById("kmForm").onsubmit=save;document.getElementById("kmDelete")?.addEventListener("click",remove);
    preview();box.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function preview(){
    const box=document.getElementById("kmPreview");if(!box)return;
    const url=val("kmUrl").trim();if(!url){box.textContent="Vorschau erscheint nach Eingabe einer Medienadresse.";return;}
    box.innerHTML=val("kmType")==="video"?'<video controls muted playsinline src="'+esc(url)+'"></video>':'<img src="'+esc(url)+'" alt="Vorschau" onerror="this.parentElement.textContent=\'Bild konnte nicht geladen werden.\'">';
  }
  async function save(e){
    e.preventDefault();const message=document.getElementById("kmMessage");
    const record={title:val("kmTitle").trim(),dealer:val("kmDealer").trim()||null,media_type:val("kmType"),media_url:val("kmUrl").trim(),sort_order:Number(val("kmOrder")||0),duration_seconds:Math.min(600,Math.max(3,Number(val("kmDuration")||15))),active:document.getElementById("kmActive").checked,updated_at:new Date().toISOString()};
    const q=window.supabaseClient.from("kiosk_slides");const result=editing?await q.update(record).eq("id",editing):await q.insert(record);
    if(result.error){message.textContent="Speichern fehlgeschlagen: "+result.error.message;return;}
    editing=null;await load();document.getElementById("kmEditor")?.classList.add("hidden");
  }
  async function move(id,delta){
    const sorted=[...items].sort((a,b)=>a.sort_order-b.sort_order),i=sorted.findIndex(x=>String(x.id)===String(id)),j=i+delta;if(i<0||j<0||j>=sorted.length)return;
    const a=sorted[i],b=sorted[j];const first=await window.supabaseClient.from("kiosk_slides").update({sort_order:b.sort_order,updated_at:new Date().toISOString()}).eq("id",a.id);if(first.error){alert(first.error.message);return;}
    const second=await window.supabaseClient.from("kiosk_slides").update({sort_order:a.sort_order,updated_at:new Date().toISOString()}).eq("id",b.id);if(second.error){alert(second.error.message);return;}await load();
  }
  async function remove(){
    const x=items.find(y=>String(y.id)===String(editing));if(!x||!confirm('„'+x.title+'“ wirklich löschen?'))return;
    const {error}=await window.supabaseClient.from("kiosk_slides").delete().eq("id",editing);if(error){alert(error.message);return;}editing=null;await load();document.getElementById("kmEditor")?.classList.add("hidden");
  }
  function close(){editing=null;document.getElementById("kmEditor").classList.add("hidden")}
  window.initKioskManagement=()=>{const el=root();if(!el)return;if(!window.supabaseClient){el.innerHTML="<p>Supabase ist nicht verbunden.</p>";return;}shell();load().catch(e=>{el.textContent="Fehler: "+e.message})};
})();