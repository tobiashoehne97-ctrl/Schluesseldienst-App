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
  s.src="js/notdienst-workflow.js?v=20260913-10";
  s.onload=()=>{
    const p=document.createElement("script");
    p.src="js/notdienst-preise-v2.js?v=20260913-3";
    p.onload=()=>{
      const c=document.createElement("script");
      c.src="js/notdienst-katalog-v2.js?v=20260913-3";
      c.onload=()=>{
        const r=document.createElement("script");
        r.src="js/notdienst-report-fix-v2.js?v=20260913-2";
        r.onload=()=>{
          const w=document.createElement("script");
          w.src="js/notdienst-workflow-fix-v2.js?v=20260913-2";
          w.onload=()=>{
            const st=document.createElement("script");
            st.src="js/notdienst-start-fix-v1.js?v=20260913-1";
            st.onload=()=>{
              const a=document.createElement("script");
              a.src="js/notdienst-workflow-access-fix-v1.js?v=20260913-1";
              a.onload=()=>{
                const z=document.createElement("script");
                z.src="js/notdienst-stability-fix-v1.js?v=20260913-1";
                z.onload=()=>{
                  const sf=document.createElement("script");
                  sf.src="js/notdienst-save-fix-v3.js?v=20260913-3";
                  sf.onload=()=>console.log("Notdienst Save Fix v4 geladen");
                  sf.onerror=()=>console.warn("Notdienst Save Fix v4 konnte nicht geladen werden.");
                  document.head.appendChild(sf);
                };
                z.onerror=()=>{
                  const sf=document.createElement("script");
                  sf.src="js/notdienst-save-fix-v3.js?v=20260913-3";
                  document.head.appendChild(sf);
                };
                document.head.appendChild(z);
              };
              a.onerror=()=>console.warn("Notdienst Workflow Access Fix konnte nicht geladen werden.");
              document.head.appendChild(a);
            };
            st.onerror=()=>console.warn("Notdienst Start Fix konnte nicht geladen werden.");
            document.head.appendChild(st);
          };
          w.onerror=()=>console.warn("Notdienst Workflow Material-Fix konnte nicht geladen werden.");
          document.head.appendChild(w);
        };
        r.onerror=()=>console.warn("Notdienst-Regiebericht-Fix konnte nicht geladen werden.");
        document.head.appendChild(r);
      };
      c.onerror=()=>console.warn("Notdienst-Katalog konnte nicht geladen werden.");
      document.head.appendChild(c);
    };
    p.onerror=()=>console.warn("Notdienst-Preislogik v2 konnte nicht geladen werden.");
    document.head.appendChild(p);
  };
  s.onerror=()=>console.warn("Notdienst-Workflow konnte nicht geladen werden.");
  document.head.appendChild(s);
})();

(function loadCalendarInteractionFix(){
  const s=document.createElement("script");
  s.src="js/kalender-interaction-fix-v1.js?v=20260914-3";
  s.onload=()=>console.log("Kalender Interaction Fix v3 geladen");
  s.onerror=()=>console.warn("Kalender Interaction Fix konnte nicht geladen werden.");
  document.head.appendChild(s);
})();

(function loadCalendarEmergencyFix(){
  const s=document.createElement("script");
  s.src="js/kalender-emergency-fix-v3.js?v=20260914-2";
  s.onload=()=>console.log("Kalender Emergency Fix v4 geladen");
  s.onerror=()=>console.warn("Kalender Emergency Fix konnte nicht geladen werden.");
  document.head.appendChild(s);
})();

console.log("Application started v17");
