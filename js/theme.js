/* Netlify branch-deploy trigger after enabling design-test. */
(function(){
  const KEY = "schluesseldienst-theme";
  function applyTheme(theme){
    const safeTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", safeTheme);
    document.documentElement.style.colorScheme = safeTheme;
    const button = document.getElementById("themeToggle");
    if(button){
      const light = safeTheme === "light";
      button.innerHTML = (light ? "☀️" : "🌙") + '<span class="theme-label">' + (light ? "Hell" : "Dunkel") + '</span>';
      button.setAttribute("aria-label", light ? "Zum dunklen Design wechseln" : "Zum hellen Design wechseln");
      button.setAttribute("title", light ? "Dunkles Design aktivieren" : "Helles Design aktivieren");
    }
  }
  function init(){
    let saved = "dark";
    try { saved = localStorage.getItem(KEY) || "dark"; } catch(e) {}
    applyTheme(saved);
    const header = document.getElementById("hdr");
    if(header && !document.getElementById("themeToggle")){
      const button = document.createElement("button");
      button.id = "themeToggle";
      button.type = "button";
      button.addEventListener("click", function(){
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        try { localStorage.setItem(KEY, next); } catch(e) {}
      });
      const logoPicker = header.querySelector('input[type="file"]');
      const logoLabel = logoPicker && logoPicker.closest("label");
      if(logoLabel) header.insertBefore(button, logoLabel);
      else header.appendChild(button);
      applyTheme(saved);
    }
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();