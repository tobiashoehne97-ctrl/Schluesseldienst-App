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
(function loadNotdienstModules(){
  const s=document.createElement("script");
  s.src="js/notdienst-workflow.js?v=20260913-7";
  s.onload=()=>{
    console.log("Notdienst-Workflow geladen v7");
    const p=document.createElement("script");
    p.src="js/notdienst-preise-v2.js?v=20260913-2";
    p.onload=()=>{
      console.log("Notdienst-Preislogik v2 geladen");
      const c=document.createElement("script");
      c.src="js/notdienst-katalog-v2.js?v=20260913-2";
      c.onload=()=>{
        console.log("Notdienst-Katalog v2 geladen");
        const r=document.createElement("script");
        r.src="js/notdienst-report-fix-v2.js?v=20260913-1";
        r.onload=()=>{
          console.log("Notdienst-Regiebericht-Fix geladen");
          const m=document.createElement("script");
          m.src="js/notdienst-material-workfix-v1.js?v=20260913-1";
          m.onload=()=>console.log("Notdienst-Materialfeld-Fix geladen");
          m.onerror=()=>console.warn("Notdienst-Materialfeld-Fix konnte nicht geladen werden.");
          document.head.appendChild(m);
        };
        r.onerror=()=>console.warn("Notdienst-Regiebericht-Fix konnte nicht geladen werden.");
        document.head.appendChild(r);
      };
      c.onerror=()=>console.warn("Notdienst-Katalog konnte nicht geladen werden.");
      document.head.appendChild(c);
    };
    p.onerror=()=>{
      console.warn("Notdienst-Preislogik konnte nicht geladen werden.");
      const c=document.createElement("script");
      c.src="js/notdienst-katalog-v2.js?v=20260913-2";
      c.onload=()=>{
        const m=document.createElement("script");
        m.src="js/notdienst-material-workfix-v1.js?v=20260913-1";
        document.head.appendChild(m);
      };
      document.head.appendChild(c);
    };
    document.head.appendChild(p);
  };
  s.onerror=()=>console.warn("Notdienst-Workflow konnte nicht geladen werden.");
  document.head.appendChild(s);
})();
console.log("Application started");
