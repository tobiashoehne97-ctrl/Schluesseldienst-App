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

  const values = [
    ["stat-arbeitszeit", "6h 45m"],
    ["stat-offene-auftraege", "7 offen"],
    ["stat-dokumente", "12 heute"],
    ["stat-umsatz", "1.840 €"]
  ];

  values.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
