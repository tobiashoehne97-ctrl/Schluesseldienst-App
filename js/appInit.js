async function initApplication() {
  try {
    if (typeof initSupabase === "function") await initSupabase();
    if (typeof loadAppData === "function") { loadAppData(); console.log("Data loaded"); }
    if (typeof initKalender === "function") initKalender();
    if (typeof initDashboard === "function") { initDashboard(); console.log("Dashboard initialized"); }
    if (typeof initNavigation === "function") initNavigation();
    if (typeof initArbeitszeit === "function") initArbeitszeit();
    if (typeof initAuftraege === "function") initAuftraege();
    if (typeof initArchiv === "function") initArchiv();
    if (typeof updateStatistics === "function") updateStatistics();
    if (typeof updateDashboard === "function") updateDashboard();
    console.log("Application ready");
  } catch (error) { console.error("Fehler bei der Initialisierung der Anwendung:", error); }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initApplication); else initApplication();
if (typeof renderCustomerList === "function") renderCustomerList();
(function loadZeitprotokoll(){
  const s=document.createElement("script");
  s.src="js/zeitprotokoll.js?v=20260913-2";
  s.onload=()=>{ if(typeof renderNotdienst==="function") renderNotdienst(); };
  s.onerror=()=>console.warn("Zeitprotokollierung konnte nicht geladen werden.");
  document.head.appendChild(s);
})();
console.log("Application started");
