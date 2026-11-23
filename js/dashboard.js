let dashboardEventsInitialized = false;
let dashboardArbeitszeitTimer = null;

const MOBILE_EMPLOYEE_KEY = "schluesseldienst-mobile-employee";
const mobileEmployeeProfiles = [
  { name: "Christian Höhne", permissions: ["zeit","kalender","notdienst","stunden","tresore"] },
  { name: "Tobias Höhne", permissions: ["zeit","kalender","notdienst","stunden","tresore"] }
];

function getTodayWorkMinutes() {
  const arbeitszeit = AppData && AppData.arbeitszeit ? AppData.arbeitszeit : {};
  let minutes = typeof calculateArbeitszeitHeute === "function" ? calculateArbeitszeitHeute() : 0;

  if (arbeitszeit.eingestempelt && arbeitszeit.start) {
    minutes += Math.max(0, Math.floor((Date.now() - new Date(arbeitszeit.start).getTime()) / 60000));
  }
  return minutes;
}

function updateArbeitszeitStatistik() {
  const target = document.getElementById("stat-arbeitszeit");
  const mobileTarget = document.getElementById("mobileEmployeeWorktime");
  const minutes = getTodayWorkMinutes();
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const text = h + " h " + String(m).padStart(2, "0") + " min";

  if (target) target.textContent = text;
  if (mobileTarget) mobileTarget.textContent = text;
}

function updateAuftragsStatistik() {
  const target = document.getElementById("stat-offene-auftraege");
  if (!target) return;
  const auftraege = AppData && Array.isArray(AppData.auftraege) ? AppData.auftraege : [];
  target.textContent = auftraege.filter(function(auftrag) { return !auftrag.erledigt; }).length + " offen";
}

function updateDashboard() {
  updateArbeitszeitStatistik();
}

function dashboardWeekStart() {
  if (typeof getWeekStart === "function") return getWeekStart();
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0,0,0,0);
  monday.setDate(now.getDate() - day + 1);
  return monday;
}

function dashboardIsoDate(date) {
  if (typeof isoDateLocal === "function") return isoDateLocal(date);
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+d;
}

function dashboardWeekTitle(start) {
  if (typeof formatWeekTitle === "function") return formatWeekTitle(start);
  const end = new Date(start);
  end.setDate(start.getDate()+6);
  return start.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+" – "+end.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
}

function initDashboardWeek() {
  renderDashboardWeek();
}

function renderDashboardWeek() {
  const grid = document.getElementById("dashboardWeekGrid");
  const title = document.getElementById("dashboard_week_title");
  if (!grid) return;

  const start = dashboardWeekStart();
  if (title) title.textContent = dashboardWeekTitle(start);

  const today = dashboardIsoDate(new Date());
  const days = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
  const entries = (AppData && AppData.kalender && Array.isArray(AppData.kalender.eintraege)) ? AppData.kalender.eintraege : [];

  grid.innerHTML = "";

  days.forEach((name,index) => {
    const date = new Date(start);
    date.setDate(start.getDate()+index);
    const iso = dashboardIsoDate(date);
    const dayEntries = entries.filter(e => e.datum === iso);
    const workEntries = dayEntries.filter(e => e.typ !== "verfuegbarkeit" && e.typ !== "geschaeft");
    const availability = dayEntries.filter(e => e.typ === "verfuegbarkeit");
    const business = dayEntries.find(e => e.typ === "geschaeft");

    // Kein Button als Elterncontainer: Termine sind eigene interaktive Elemente.
    // Verschachtelte Buttons/Interaktionen verursachen insbesondere in Safari
    // unzuverlaessiges Klickverhalten.
    const card = document.createElement("div");
    card.className = "desktop-week-day" + (iso === today ? " today" : "");
    card.dataset.date = iso;
    card.innerHTML =
      '<div class="desktop-week-day-head"><span>'+name+'</span><strong>'+date.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+'</strong></div>' +
      '<div class="desktop-week-day-body"></div>' +
      '<div class="desktop-week-day-footer"></div>';

    const body = card.querySelector(".desktop-week-day-body");
    const footer = card.querySelector(".desktop-week-day-footer");

    if (workEntries.length) {
      workEntries.slice(0,4).forEach(entry => {
        const item = document.createElement("div");
        item.className = "week-entry";
        item.dataset.kalenderId = String(entry.id);
        item.setAttribute("role","button");
        item.tabIndex = 0;
        item.innerHTML = '<span class="week-entry-dot" style="background:'+
          (typeof getStatusColor === "function" ? getStatusColor(entry.status) : "#3b82c4")+
          '"></span><div><strong>'+escapeDashboardHtml(entry.titel || "Einsatz")+'</strong><small>'+
          escapeDashboardHtml((entry.von || "") + ((entry.bis) ? " – "+entry.bis : ""))+
          '</small></div>';

        const openEntry = function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof openKalenderEntryDetails === "function") {
            openKalenderEntryDetails(entry.id);
          }
        };
        item.addEventListener("click", openEntry);
        item.addEventListener("keydown", function(ev){
          if(ev.key === "Enter" || ev.key === " ") openEntry(ev);
        });

        body.appendChild(item);
      });
      if (workEntries.length > 4) {
        const more = document.createElement("div");
        more.className = "week-more";
        more.textContent = "+"+(workEntries.length-4)+" weitere";
        more.addEventListener("click", function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          if (typeof openKalenderDay === "function") openKalenderDay(iso);
        });
        body.appendChild(more);
      }
    } else {
      const empty = document.createElement("div");
      empty.className = "week-empty";
      empty.textContent = "Keine Einsätze geplant";
      body.appendChild(empty);
    }

    if (business) {
      const badge = document.createElement("span");
      badge.className = "week-business";
      badge.textContent = business.status === "geschlossen" ? "⚫ Geschäft geschlossen" : "🏪 Geschäft geöffnet";
      footer.appendChild(badge);
    }

    if (availability.length) {
      const availabilityBox = document.createElement("div");
      availabilityBox.style.cssText = "margin-top:8px;padding:8px;border-radius:9px;background:rgba(8,24,38,.72);border:1px solid #23405a";
      const label = document.createElement("div");
      label.textContent = "MITARBEITER VERFÜGBAR";
      label.style.cssText = "font-size:9px;font-weight:800;letter-spacing:.08em;color:#7eb3e0;margin-bottom:7px";
      availabilityBox.appendChild(label);
      const axis = document.createElement("div");
      axis.style.cssText = "display:flex;justify-content:space-between;font-size:8px;color:#6685a2;margin:0 2px 3px";
      axis.innerHTML = "<span>09:00</span><span>13:00</span><span>17:00</span>";
      availabilityBox.appendChild(axis);
      const dayStart = 9 * 60;
      const dayEnd = 17 * 60;
      const range = dayEnd - dayStart;
      availability.forEach((entry) => {
        const row = document.createElement("div");
        row.style.cssText = "margin-top:5px";
        const rowHead = document.createElement("div");
        rowHead.style.cssText = "display:flex;justify-content:space-between;gap:6px;font-size:9px;margin-bottom:3px;color:#b8d8ef";
        const employee = document.createElement("strong");
        employee.textContent = entry.mitarbeiter || "Mitarbeiter";
        employee.style.cssText = "font-size:9px;color:#dcecf7";
        const time = document.createElement("span");
        time.textContent = String(entry.von || "09:00").slice(0,5) + " – " + String(entry.bis || "17:00").slice(0,5);
        time.style.cssText = "font-size:8px;color:#79b8a0";
        rowHead.append(employee, time);
        const track = document.createElement("div");
        track.style.cssText = "position:relative;height:10px;border-radius:999px;background:#081825;border:1px solid #23405a;overflow:hidden";
        const from = dashboardTimeToMinutes(entry.von || "09:00");
        const until = dashboardTimeToMinutes(entry.bis || "17:00");
        const safeFrom = Math.max(dayStart, Math.min(dayEnd, from));
        const safeUntil = Math.max(safeFrom, Math.min(dayEnd, until));
        const left = ((safeFrom - dayStart) / range) * 100;
        const width = Math.max(2, ((safeUntil - safeFrom) / range) * 100);
        const bar = document.createElement("div");
        bar.style.cssText = "position:absolute;top:1px;bottom:1px;left:" + left + "%;width:" + width + "%;border-radius:999px;background:linear-gradient(90deg,#16a34a,#4ade80);box-shadow:0 0 8px rgba(74,222,128,.45)";
        bar.title = (entry.mitarbeiter || "Mitarbeiter") + " · " + String(entry.von || "09:00").slice(0,5) + "–" + String(entry.bis || "17:00").slice(0,5);
        track.appendChild(bar);
        row.append(rowHead, track);
        availabilityBox.appendChild(row);
      });
      footer.appendChild(availabilityBox);
    }

    const add = document.createElement("span");
    add.className = "week-add";
    add.textContent = "+";
    add.title = "Einsatz hinzufügen";
    add.addEventListener("click", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof openKalenderCreate === "function") openKalenderCreate(iso);
    });
    card.appendChild(add);

    card.addEventListener("click", function(ev) {
      // Nur die Tageskarte selbst bzw. leere Bereiche öffnen den Tag.
      // Termin- und +-Klicks werden vorher gestoppt.
      if (ev.target.closest && ev.target.closest(".week-entry, .week-more, .week-add")) return;
      if (typeof openKalenderDay === "function") openKalenderDay(iso);
    });

    grid.appendChild(card);
  });
}

function dashboardTimeToMinutes(value) {
  const parts = String(value || "00:00").slice(0,5).split(":");
  return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
}

function escapeDashboardHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function(ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];
  });
}

function initMobileEmployeeDashboard() {
  const choices = document.getElementById("mobileEmployeeChoices");
  if (!choices) return;
  choices.innerHTML = "";
  mobileEmployeeProfiles.forEach(profile => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-employee-choice";
    button.innerHTML = '<span>👤</span><div><strong>'+profile.name+'</strong><small>Profil auswählen</small></div><b>›</b>';
    button.onclick = () => selectMobileEmployee(profile.name);
    choices.appendChild(button);
  });
  const loggedInProfile = window.currentEmployee === "Tobias" ? "Tobias Höhne" : window.currentEmployee === "Christian" ? "Christian Höhne" : "";
  const saved = loggedInProfile || localStorage.getItem(MOBILE_EMPLOYEE_KEY);
  if (saved && mobileEmployeeProfiles.some(p => p.name === saved)) applyMobileEmployee(saved);
}

function selectMobileEmployee(name) {
  localStorage.setItem(MOBILE_EMPLOYEE_KEY, name);
  applyMobileEmployee(name);
}

function applyMobileEmployee(name) {
  const profile = mobileEmployeeProfiles.find(p => p.name === name);
  if (!profile) return;
  const nameEl = document.getElementById("mobileEmployeeName");
  const selectCard = document.getElementById("mobileEmployeeSelectCard");
  const apps = document.getElementById("mobileEmployeeApps");
  if (nameEl) nameEl.textContent = profile.name;
  if (selectCard) selectCard.classList.add("hidden");
  if (apps) apps.classList.remove("hidden");
  document.querySelectorAll("#mobileEmployeeApps .mobile-app-tile").forEach(btn => {
    const route = btn.getAttribute("onclick") || "";
    const key = route.match(/go\('([^']+)'\)/)?.[1];
    btn.style.display = profile.permissions.includes(key) ? "" : "none";
  });
  updateArbeitszeitStatistik();
}

function clearMobileEmployee() {
  localStorage.removeItem(MOBILE_EMPLOYEE_KEY);
  const nameEl = document.getElementById("mobileEmployeeName");
  const selectCard = document.getElementById("mobileEmployeeSelectCard");
  const apps = document.getElementById("mobileEmployeeApps");
  if (nameEl) nameEl.textContent = "Mitarbeiter auswählen";
  if (selectCard) selectCard.classList.remove("hidden");
  if (apps) apps.classList.add("hidden");
}

function initDashboard() {
  if (window.EventBus && typeof EventBus.subscribe === "function" && !dashboardEventsInitialized) {
    ["auftrag:created","auftrag:updated","auftrag:deleted","arbeitszeit:start","arbeitszeit:stop","arbeitszeit:update"].forEach(event => EventBus.subscribe(event, updateDashboard));
    dashboardEventsInitialized = true;
  }
  if (dashboardArbeitszeitTimer) clearInterval(dashboardArbeitszeitTimer);
  dashboardArbeitszeitTimer = setInterval(updateArbeitszeitStatistik, 60000);
  updateDashboard();
  initMobileEmployeeDashboard();
  setTimeout(renderDashboardWeek, 0);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDashboard);
else initDashboard();


/* Dashboard-Startseite: Termine und Geschäftsverfügbarkeiten */
function dashboardDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  const today = dashboardIsoDate(new Date());
  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate()+1);
  const tomorrow = dashboardIsoDate(tomorrowDate);
  const day = iso === today ? "Heute" : iso === tomorrow ? "Morgen" : d.toLocaleDateString("de-DE",{weekday:"short"});
  return day + " · " + d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
}
function dashboardRenderAppointments() {
  const list = document.getElementById("dashboardAppointments");
  if (!list) return;
  const now = new Date();
  const entries = (AppData?.kalender?.eintraege || []).filter(e => e && e.typ !== "verfuegbarkeit" && e.typ !== "geschaeft" && e.datum)
    .filter(e => new Date(e.datum + "T" + String(e.von || "00:00").slice(0,5) + ":00") >= new Date(now.getTime()-30*60000) && e.status !== "erledigt")
    .sort((a,b) => (a.datum+" "+(a.von||"")).localeCompare(b.datum+" "+(b.von||"")));
  const upcoming = entries.slice(0,6);
  if (!upcoming.length) { list.innerHTML = '<div class="dash-empty">Aktuell sind keine weiteren Termine geplant.</div>'; return; }
  list.innerHTML = upcoming.map(item => '<button class="dash-appointment" type="button" data-entry="'+dashboardEscape(item.id)+'"><span class="dash-appointment-date">'+dashboardEscape(dashboardDateLabel(item.datum))+'<strong>'+dashboardEscape(item.von||"–")+'</strong></span><span class="dash-appointment-info"><strong>'+dashboardEscape(item.titel||"Termin")+'</strong><small>'+dashboardEscape([item.vorname,item.nachname].filter(Boolean).join(" ")||item.beschreibung||"Geplanter Termin")+'</small></span><span class="dash-chevron">›</span></button>').join("");
  list.querySelectorAll("[data-entry]").forEach(btn=>btn.addEventListener("click",()=>{if(typeof openKalenderEntryDetails==="function")openKalenderEntryDetails(btn.dataset.entry)}));
}
function dashboardRenderShopAvailability() {
  const list = document.getElementById("dashboardShopAvailability");
  if (!list) return;
  const today = dashboardIsoDate(new Date());
  const end = new Date(); end.setDate(end.getDate()+7);
  const endIso = dashboardIsoDate(end);
  const entries = (AppData?.kalender?.eintraege || []).filter(e => e && e.typ === "verfuegbarkeit" && e.datum >= today && e.datum <= endIso)
    .sort((a,b)=>(a.datum+" "+(a.von||"")).localeCompare(b.datum+" "+(b.von||"")));
  if (!entries.length) {
    list.innerHTML = '<div class="dash-empty">Noch keine Geschäftsverfügbarkeiten eingetragen.<br><small>Über Einsatzplanung → Neuer Eintrag → Verfügbarkeit kannst du Zeiten für Tobias und Christian hinterlegen.</small></div>';
    return;
  }
  list.innerHTML = entries.map(e => {
    const person = String(e.mitarbeiter || "Mitarbeiter");
    const key = /tobias/i.test(person) ? "tobias" : /christian/i.test(person) ? "christian" : "other";
    return '<div class="dash-shop-slot dash-shop-'+key+'"><span class="dash-shop-person-dot"></span><div class="dash-shop-date">'+dashboardEscape(dashboardDateLabel(e.datum))+'</div><div class="dash-shop-person"><strong>'+dashboardEscape(person)+'</strong><small>Im Geschäft verfügbar</small></div><div class="dash-shop-time">'+dashboardEscape(String(e.von||"").slice(0,5))+' – '+dashboardEscape(String(e.bis||"offen").slice(0,5)||"offen")+'</div></div>';
  }).join("");
}
function dashboardEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function updateDashboard() {
  updateArbeitszeitStatistik();
  const work = AppData?.arbeitszeit || {};
  const status = document.getElementById("dashboardWorkStatus");
  if (status) status.textContent = work.eingestempelt ? "Arbeitszeit läuft" : "Heute erfasst";
  const date = document.getElementById("dashboardDate");
  if (date) date.textContent = new Date().toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  dashboardRenderAppointments();
  dashboardRenderShopAvailability();
  if (typeof renderSharedTasks === "function") renderSharedTasks();
}
function initDashboardWeek() { updateDashboard(); }
function renderDashboardWeek() { updateDashboard(); }
function initDashboard() {
  updateDashboard();
  if (dashboardArbeitszeitTimer) clearInterval(dashboardArbeitszeitTimer);
  dashboardArbeitszeitTimer = setInterval(updateDashboard, 30000);
}
