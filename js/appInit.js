function initApplication() {
  try {
    if (typeof loadAppData === "function") {
      loadAppData();
      console.log("Data loaded");
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
console.log("Application started");
