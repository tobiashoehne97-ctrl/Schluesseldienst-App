function restoreAppTheme() {
  // Sicherheitsnetz: Nach PDF-/Berichtsvorschauen dürfen keine globalen
  // Inline-Stile oder offenen Overlays die normale App-Darstellung verfälschen.
  document.body.style.removeProperty("background");
  document.body.style.removeProperty("background-color");
  document.body.style.removeProperty("opacity");
  document.body.style.removeProperty("filter");

  const main = document.getElementById("main");
  if (main) {
    main.style.removeProperty("background");
    main.style.removeProperty("background-color");
    main.style.removeProperty("opacity");
    main.style.removeProperty("filter");
  }

  ["pdfMod", "serviceModal", "kalenderModal"].forEach(id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (id === "pdfMod") modal.classList.remove("open");
    else modal.classList.add("hidden");
  });

  document.body.style.overflow = "";
}

function go(id) {
  restoreAppTheme();

  ["menu","to","rb","an","archiv","auftraege","zeit","kunden","kalender","notdienst","produkte","mitarbeiter","stunden"].forEach(x => {
    const el = document.getElementById(x);
    if (el) {
      el.classList.add("hidden");
      el.style.display = "none";
    }
  });

  const targetId = id || "menu";
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.remove("hidden");
    target.style.display = "block";
  }

  document.querySelectorAll(".desktop-nav-tile").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.nav === (targetId === "menu" ? "kalender" : targetId));
  });

  if (targetId === "menu") {
    if (typeof initDashboardWeek === "function") initDashboardWeek();
    if (typeof renderDashboardWeek === "function") renderDashboardWeek();
  }

  if (targetId === "to") iTO();
  if (targetId === "rb") iRB();
  if (targetId === "an") iAN();
  if (targetId === "archiv") loadArchiv();
  if (targetId === "auftraege") renderAuftraege();
  if (targetId === "kalender") initKalender();

  if (targetId === "zeit") {
    iZeit();
    loadEmployeeData();
    renderWorkJournal();
  }
}