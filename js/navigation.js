function go(id) {
  ["menu","to","rb","an","archiv","auftraege","zeit"].forEach(x => {
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
  if(id==="zeit") iZeit();
}