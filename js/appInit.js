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
(function loadNotdienstWorkflow(){
  const s=document.createElement("script");
  s.src="js/notdienst-workflow.js?v=20260913-5";
  s.onload=()=>{
    console.log("Notdienst-Workflow geladen v5");
    const p=document.createElement("script");
    p.src="js/notdienst-preise-v2.js?v=20260913-1";
    p.onload=()=>console.log("Notdienst-Preislogik v2 geladen");
    p.onerror=()=>console.warn("Notdienst-Preislogik konnte nicht geladen werden.");
    document.head.appendChild(p);
  };
  s.onerror=()=>console.warn("Notdienst-Workflow konnte nicht geladen werden.");
  document.head.appendChild(s);
})();
console.log("Application started");
