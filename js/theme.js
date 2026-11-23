/* Theme toggle: desktop im Header, mobil als Kachel am Ende der Startseite. */
(function(){
  const KEY="schluesseldienst-theme";
  function current(){return document.documentElement.getAttribute("data-theme")==="light"?"light":"dark"}
  function applyTheme(theme){
    const safeTheme=theme==="light"?"light":"dark";
    document.documentElement.setAttribute("data-theme",safeTheme);
    document.documentElement.style.colorScheme=safeTheme;
    const update=(button)=>{
      if(!button)return;
      const light=safeTheme==="light";
      button.innerHTML=(light?"☀️":"🌙")+'<span class="theme-label">'+(light?"Heller Modus":"Dunkler Modus")+'</span>';
      button.setAttribute("aria-label",light?"Zum dunklen Design wechseln":"Zum hellen Design wechseln");
      button.setAttribute("title",light?"Dunkles Design aktivieren":"Helles Design aktivieren");
      button.setAttribute("aria-pressed",String(light));
    };
    update(document.getElementById("themeToggle"));
    update(document.getElementById("themeHomeToggle"));
  }
  function toggle(){
    const next=current()==="light"?"dark":"light";
    applyTheme(next);
    try{localStorage.setItem(KEY,next)}catch(e){}
  }
  function installHomeTile(){
    const home=document.getElementById("menu");
    if(!home)return false;
    let tile=document.getElementById("themeHomeTile");
    if(!tile){
      tile=document.createElement("section");
      tile.id="themeHomeTile";
      tile.className="theme-home-tile";
      tile.innerHTML='<div class="theme-home-copy"><span class="theme-home-icon" aria-hidden="true">◐</span><div><strong>Erscheinungsbild</strong><small>Zwischen hellem und dunklem Design wechseln</small></div></div><button type="button" id="themeHomeToggle" class="theme-home-button"></button>';
      home.appendChild(tile);
      tile.querySelector("#themeHomeToggle").addEventListener("click",toggle);
    }
    return true;
  }
  function init(){
    let saved="dark";
    try{saved=localStorage.getItem(KEY)||"dark"}catch(e){}
    applyTheme(saved);
    const header=document.getElementById("hdr");
    if(header&&!document.getElementById("themeToggle")){
      const button=document.createElement("button");
      button.id="themeToggle";button.type="button";button.addEventListener("click",toggle);
      const logoPicker=header.querySelector('input[type="file"]');
      const logoLabel=logoPicker&&logoPicker.closest("label");
      if(logoLabel)header.insertBefore(button,logoLabel);else header.appendChild(button);
    }
    installHomeTile();
    applyTheme(saved);
    if(!window.__themeHomeResizeBound){
      window.__themeHomeResizeBound=true;
      window.addEventListener("resize",installHomeTile);
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();