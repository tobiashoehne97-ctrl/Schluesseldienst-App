let dashboardEventsInitialized = false;
let dashboardArbeitszeitTimer = null;

function updateArbeitszeitStatistik() {
  const target = document.getElementById("stat-arbeitszeit");
  if (!target) {
    return;
  }

  const arbeitszeit = AppData && AppData.arbeitszeit ? AppData.arbeitszeit : null;
  const totalMinutes = typeof calculateArbeitszeitHeute === "function"
    ? calculateArbeitszeitHeute()
    : 0;

  let laufendMinutes = 0;
  if (arbeitszeit && arbeitszeit.eingestempelt && arbeitszeit.start) {
    const start = new Date(arbeitszeit.start);
    const now = new Date();
    laufendMinutes = Math.floor((now - start) / 60000);
  }

  const minutes = totalMinutes + laufendMinutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  target.textContent = h + " h " + String(m).padStart(2, "0") + " min";
}

function updateAuftragsStatistik() {
  const target = document.getElementById("stat-offene-auftraege");
  if (!target) {
    return;
  }

  const auftraege = AppData && Array.isArray(AppData.auftraege) ? AppData.auftraege : [];
  const offene = auftraege.filter(function(auftrag) {
    return !auftrag.erledigt;
  }).length;

  target.textContent = offene + " offen";
}

function updateDashboard() {
  const stats = AppData && AppData.statistik ? AppData.statistik : null;

  updateArbeitszeitStatistik();

  const dokumenteEl = document.getElementById("stat-dokumente");
  if (dokumenteEl) {
    dokumenteEl.textContent = stats ? stats.dokumenteHeute + " heute" : "0 heute";
  }

  const umsatzEl = document.getElementById("stat-umsatz");
  if (umsatzEl) {
    const umsatz = stats ? stats.umsatzHeute : 0;
    umsatzEl.textContent = umsatz.toFixed(2).replace(".", ",") + " €";
  }

  updateAuftragsStatistik();
}

function initDashboard() {
  const dateEl = document.getElementById("dashboard-date");
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  if (window.EventBus && typeof EventBus.subscribe === "function" && !dashboardEventsInitialized) {
    EventBus.subscribe("auftrag:created", updateDashboard);
    EventBus.subscribe("auftrag:updated", updateDashboard);
    EventBus.subscribe("auftrag:deleted", updateDashboard);
    EventBus.subscribe("arbeitszeit:start", updateDashboard);
    EventBus.subscribe("arbeitszeit:stop", updateDashboard);
    EventBus.subscribe("arbeitszeit:update", updateDashboard);
    dashboardEventsInitialized = true;
  }

  if (dashboardArbeitszeitTimer) {
    clearInterval(dashboardArbeitszeitTimer);
  }
  dashboardArbeitszeitTimer = setInterval(updateArbeitszeitStatistik, 60000);

  updateDashboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
