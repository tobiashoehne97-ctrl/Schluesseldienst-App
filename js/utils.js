function v(id){return(document.getElementById(id)?.value||"").trim();}
function chk(nm){return[...document.querySelectorAll(`[name="${nm}"]:checked`)].map(c=>c.value).join(", ");}
function rad(nm){return document.querySelector(`[name="${nm}"]:checked`)?.value||"";}
