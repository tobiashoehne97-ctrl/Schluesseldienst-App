async function initApplication() {
  try {
    // Zentrale Supabase-Verbindung zuerst aufbauen, damit Kalender und Archiv
    // zuverlässig auf Datenbank und Storage zugreifen können.
    if (typeof initSupabase === "function") {
      await initSupabase();
    }

    if (typeof loadAppData === "function") {
      loadAppData();
      console.log("Data loaded");
    }

    if (typeof initKalender === "function") {
      initKalender();
    }

    if (typeof initDashboard === "function") {
      initDashboard();
      console.log("Dashboard initialized");
    }

    if (typeof initNavigation === "function") {
      initNavigation();
    }

    if (typeof initArbeitszeit === "function") {
      initArbeitszeit();
    }

    if (typeof initAuftraege === "function") {
      initAuftraege();
    }

    if (typeof initArchiv === "function") {
      initArchiv();
    }

    if (typeof updateStatistics === "function") {
      updateStatistics();
    }

    if (typeof updateDashboard === "function") {
      updateDashboard();
    }

    console.log("Application ready");
  } catch (error) {
    console.error("Fehler bei der Initialisierung der Anwendung:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApplication);
} else {
  initApplication();
}
if (typeof renderCustomerList === "function") {
    renderCustomerList();
}

// Zentrale Zeitprotokollierung nach den bestehenden Modulen laden.
// Cache-Busting sorgt dafür, dass GitHub Pages die neue Version übernimmt.
(function loadZeitprotokoll(){
  const s=document.createElement("script");
  s.src="js/zeitprotokoll.js?v=20260913-1";
  s.onload=()=>{ if(typeof renderNotdienst==="function") renderNotdienst(); };
  s.onerror=()=>console.warn("Zeitprotokollierung konnte nicht geladen werden.");
  document.head.appendChild(s);
})();

console.log("Application started");
