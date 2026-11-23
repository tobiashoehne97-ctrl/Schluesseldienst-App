document.body.classList.add("app-locked");
(function installAppAccessStyles(){const style=document.createElement("style");style.textContent=`
body.app-locked #hdr,body.app-locked #desktopSidebar,body.app-locked #main{visibility:hidden!important;pointer-events:none!important}
#appAccessGate{position:fixed;inset:0;z-index:999999;background:radial-gradient(circle at 50% 0%,#1c3b5c 0%,#09182b 65%);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;color:#edf5ff;font-family:inherit}
#appAccessGate .access-card{width:min(440px,100%);background:#10243d;border:1px solid #345574;border-radius:20px;padding:28px;box-shadow:0 24px 80px #0008;box-sizing:border-box}
#appAccessGate .access-eyebrow{font-size:11px;letter-spacing:.16em;font-weight:800;color:#83b8e5;text-align:center}
#appAccessGate h1{font-size:25px;text-align:center;margin:10px 0 6px;color:#fff}
#appAccessGate .access-sub{text-align:center;color:#aac1d8;font-size:14px;margin:0 0 22px}
#appAccessGate .access-choices{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#appAccessGate .access-choice{border:1px solid #456787;background:#183451;color:#fff;border-radius:14px;padding:20px 10px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px}
#appAccessGate .access-choice span{font-size:30px}#appAccessGate .access-choice strong{font-size:17px}
#appAccessGate .access-field{display:block;margin:14px 0 0;color:#d9e8f6;font-size:13px;font-weight:700}
#appAccessGate input{display:block;width:100%;box-sizing:border-box;margin-top:7px;padding:13px;border-radius:9px;border:1px solid #54708d;background:#07182b;color:#fff;font:inherit;font-size:16px}
#appAccessGate .access-actions{display:flex;gap:10px;margin-top:18px}
#appAccessGate button.access-primary,#appAccessGate button.access-back{flex:1;border:0;border-radius:9px;padding:13px;font:inherit;font-weight:800;cursor:pointer}
#appAccessGate .access-primary{background:#2d83c5;color:white}#appAccessGate .access-back{background:#29435e;color:white}
#appAccessGate .access-message{min-height:20px;margin-top:12px;color:#ffb4aa;font-size:13px;text-align:center}
#appAccessUser{display:flex;align-items:center;gap:10px;margin-left:auto;color:#d5e7f8;font-size:12px}
@media(max-width:600px){#appAccessGate .access-card{padding:22px 18px}#appAccessGate h1{font-size:22px}}
`;document.head.appendChild(style)})();
let appModulesInitialized=false,appSelectedEmployee="";
function showAppAccessGate(message=""){document.body.classList.add("app-locked");let gate=document.getElementById("appAccessGate");if(!gate){gate=document.createElement("div");gate.id="appAccessGate";document.body.appendChild(gate)}gate.innerHTML='<div class="access-card"><div class="access-eyebrow">SCHLÜSSELDIENST HÖHNE · INTERN</div><h1>Willkommen</h1><p class="access-sub">Bitte zuerst auswählen, wer heute arbeitet.</p><div class="access-choices"><button class="access-choice" id="accessTobias"><span>👤</span><strong>Tobias</strong></button><button class="access-choice" id="accessChristian"><span>👤</span><strong>Christian</strong></button></div><div class="access-message">'+message+'</div></div>';document.getElementById("accessTobias").onclick=()=>showAppLogin("Tobias");document.getElementById("accessChristian").onclick=()=>showAppLogin("Christian")}
function showAppLogin(employee,message=""){appSelectedEmployee=employee;const gate=document.getElementById("appAccessGate");gate.innerHTML='<div class="access-card"><div class="access-eyebrow">SCHLÜSSELDIENST HÖHNE · INTERN</div><h1>Anmeldung</h1><p class="access-sub">Mitarbeiter: <strong>'+employee+'</strong><br>Bitte mit deinem persönlichen Zugang anmelden.</p><form id="appAccessForm"><label class="access-field">E-Mail-Adresse<input id="appAccessEmail" type="email" autocomplete="username" required></label><label class="access-field">Passwort<input id="appAccessPassword" type="password" autocomplete="current-password" required></label><div class="access-actions"><button class="access-primary" type="submit">Anmelden</button><button class="access-back" type="button" id="accessBack">Zurück</button></div></form><div class="access-message" id="appAccessMessage">'+message+'</div></div>';document.getElementById("accessBack").onclick=()=>showAppAccessGate();document.getElementById("appAccessForm").onsubmit=async e=>{e.preventDefault();const msg=document.getElementById("appAccessMessage");msg.textContent="Anmeldung wird geprüft …";const {data,error}=await window.supabaseClient.auth.signInWithPassword({email:document.getElementById("appAccessEmail").value.trim(),password:document.getElementById("appAccessPassword").value});if(error){msg.textContent="Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.";return}window.currentEmployee=appSelectedEmployee;window.currentAuthUser=data.user;localStorage.setItem("schluesseldienst-mobile-employee",appSelectedEmployee==="Tobias"?"Tobias Höhne":"Christian Höhne");gate.remove();document.body.classList.remove("app-locked");installAppAccessUser();if(!appModulesInitialized){appModulesInitialized=true;startApplicationModules()}else if(typeof initMobileEmployeeDashboard==="function")initMobileEmployeeDashboard()}}
function installAppAccessUser(){const hdr=document.getElementById("hdr");if(!hdr)return;let el=document.getElementById("appAccessUser");if(!el){el=document.createElement("div");el.id="appAccessUser";hdr.appendChild(el)}el.innerHTML='<span>Angemeldet: <strong>'+appSelectedEmployee+'</strong></span><button class="btnS" type="button" id="appAccessLogout">Abmelden</button>';document.getElementById("appAccessLogout").onclick=window.logoutApplication}
window.logoutApplication=async function(){if(window.supabaseClient)await window.supabaseClient.auth.signOut({scope:"local"});window.currentEmployee="";window.currentAuthUser=null;appSelectedEmployee="";localStorage.removeItem("schluesseldienst-mobile-employee");document.getElementById("appAccessUser")?.remove();showAppAccessGate()};
async function startApplicationModules(){if(typeof loadAppData==="function"){loadAppData();console.log("Data loaded")}if(typeof renderCustomerList==="function")renderCustomerList();if(typeof initKalender==="function")initKalender();if(typeof initDashboard==="function"){initDashboard();console.log("Dashboard initialized")}if(typeof initNavigation==="function")initNavigation();if(typeof initArbeitszeit==="function")initArbeitszeit();if(typeof initAuftraege==="function")initAuftraege();if(typeof initDashboardTasks==="function")initDashboardTasks();if(typeof initArchiv==="function")initArchiv();if(typeof updateStatistics==="function")updateStatistics();if(typeof updateDashboard==="function")updateDashboard();if(typeof initMobileEmployeeDashboard==="function")initMobileEmployeeDashboard();console.log("Application ready")}
async function initApplication(){try{if(typeof initSupabase==="function")await initSupabase();if(!window.supabaseClient){showAppAccessGate("Verbindung zur Datenbank fehlgeschlagen. Bitte Seite neu laden.");return}await window.supabaseClient.auth.signOut({scope:"local"});showAppAccessGate()}catch(error){console.error("Fehler bei der Initialisierung:",error);showAppAccessGate("Fehler beim Start: "+error.message)}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initApplication);else initApplication();
(function loadNotdienstModules(){
  const s=document.createElement("script");
  s.src="js/notdienst-workflow.js?v=20260913-10";
  s.onload=()=>{const p=document.createElement("script");p.src="js/notdienst-preise-v2.js?v=20261124-7";p.onload=()=>{const c=document.createElement("script");c.src="js/notdienst-katalog-v2.js?v=20261124-4";c.onload=()=>{const r=document.createElement("script");r.src="js/notdienst-report-fix-v2.js?v=20261124-3";r.onload=()=>{const w=document.createElement("script");w.src="js/notdienst-workflow-fix-v2.js?v=20260913-2";w.onload=()=>{const st=document.createElement("script");st.src="js/notdienst-start-fix-v1.js?v=20261123-2";st.onload=()=>{const a=document.createElement("script");a.src="js/notdienst-workflow-access-fix-v1.js?v=20261123-2";a.onload=()=>{const z=document.createElement("script");z.src="js/notdienst-stability-fix-v1.js?v=20260913-1";z.onload=()=>{const sf=document.createElement("script");sf.src="js/notdienst-save-fix-v3.js?v=20261124-7";document.head.appendChild(sf)};document.head.appendChild(z)};document.head.appendChild(a)};document.head.appendChild(st)};document.head.appendChild(w)};document.head.appendChild(r)};document.head.appendChild(c)};document.head.appendChild(p)};document.head.appendChild(s);
})();
(function loadCalendarModalFix(){
  const s=document.createElement("script");
  s.src="js/kalender-modal-open-fix-v1.js?v=20261119-6";
  s.onload=()=>console.log("Kalender Modal Open Fix geladen");
  s.onerror=()=>console.warn("Kalender Modal Open Fix konnte nicht geladen werden.");
  document.head.appendChild(s);
})();
(function loadCalendarOverlayFix(){
  const s=document.createElement("script");
  s.src="js/calendar-overlay-fix-v1.js?v=20260914-5";
  s.onload=()=>console.log("Calendar Overlay Fix geladen");
  s.onerror=()=>console.warn("Calendar Overlay Fix konnte nicht geladen werden.");
  document.head.appendChild(s);
})();
console.log("Application started v22");
(function loadAussendienstFixes(){
  // Reihenfolge ist wichtig: Der Folgetermin-Workflow erweitert die
  // Zeiterfassung und muss deshalb erst danach geladen werden.
  const zeit=document.createElement("script");
  zeit.src="js/aussendienst-zeit-fix-v1.js?v=20261123-3";
  zeit.onload=()=>{
    console.log("Außendienst-Zeiterfassung geladen");
    const folge=document.createElement("script");
    folge.src="js/aussendienst-folgetermin-v1.js?v=20261123-5";
    folge.onload=()=>{console.log("Außendienst-Folgetermin-Workflow geladen");const edit=document.createElement("script");edit.src="js/aussendienst-nachbearbeitung-v1.js?v=20261123-6";edit.onload=()=>{console.log("Außendienst-Nachbearbeitung geladen");const ui=document.createElement("script");ui.src="js/aussendienst-abschluss-ui-v1.js?v=20261123-2";ui.onload=()=>{console.log("Außendienst-Abschluss-UI geladen");const mobileNav=document.createElement("script");mobileNav.src="js/mobile-main-navigation-v1.js?v=20261123-6";mobileNav.onload=()=>console.log("Mobile Navigation geladen");mobileNav.onerror=()=>console.warn("Mobile Navigation konnte nicht geladen werden.");document.head.appendChild(mobileNav);};ui.onerror=()=>console.warn("Außendienst-Abschluss-UI konnte nicht geladen werden.");document.head.appendChild(ui);};edit.onerror=()=>console.warn("Außendienst-Nachbearbeitung konnte nicht geladen werden.");document.head.appendChild(edit);};
    folge.onerror=()=>console.warn("Außendienst-Folgetermin-Workflow konnte nicht geladen werden.");
    document.head.appendChild(folge);
  };
  zeit.onerror=()=>console.warn("Außendienst-Zeiterfassung konnte nicht geladen werden.");
  document.head.appendChild(zeit);
})();
