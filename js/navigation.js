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
  ["menu","to","rb","an","archiv","auftraege","zeit","kunden","kalender"].forEach(x => {
    const el = document.getElementById(x);
    if(el) { el.classList.add("hidden"); el.style.display="none"; }
  });
  const target = document.getElementById(id || "menu");
  if(target) { target.classList.remove("hidden"); target.style.display="block"; }
  if(id==="to") iTO();
  if(id==="rb") iRB();
  if(id==="an") iAN();
  if(id==="archiv") loadArchiv();
  if(id==="auftraege") renderAuftraege();
  if(id==="kalender") initKalender();
  if (id === "zeit") {

    iZeit();

    loadEmployeeData();

    renderWorkJournal();

}
}