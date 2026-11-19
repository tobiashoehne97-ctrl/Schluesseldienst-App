/* iPad-Kioskmodus – Präsentationsoberfläche */
(function(){
  "use strict";
  let slides=[], current=0, timer=null, touchDialog=null;
  const params=new URLSearchParams(location.search);
  const kioskEnabled=params.get("kiosk")==="1";
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function addShell(){
    if(document.getElementById("ipadKiosk"))return;
    const el=document.createElement("section");
    el.id="ipadKiosk";el.className="ipad-kiosk";
    el.innerHTML='<div class="ipad-kiosk-stage" id="ipadKioskStage"><div class="ipad-kiosk-brand">SCHLÜSSELDIENST HÖHNE</div><div class="ipad-kiosk-empty"><div class="ipad-kiosk-mark">🔐</div><h1>Willkommen bei Schlüsseldienst Höhne</h1><p>Unsere Sicherheitslösungen für Zuhause und Unternehmen</p><span>Berühren zum Starten</span></div><button class="ipad-kiosk-touch" id="ipadKioskTouch" aria-label="Präsentation öffnen"></button><div class="ipad-kiosk-footer">Berühren Sie das Display für eine persönliche Beratung</div></div><div class="ipad-kiosk-confirm hidden" id="ipadKioskConfirm"><div class="ipad-kiosk-dialog"><div class="ipad-kiosk-mark">🔐</div><h2>TV-Modus beenden?</h2><p>Möchten Sie die Präsentation verlassen und den Beratungsmodus öffnen?</p><div class="ipad-kiosk-actions"><button type="button" class="ipad-kiosk-secondary" id="ipadKioskNo">Nein, weiter ansehen</button><button type="button" class="ipad-kiosk-primary" id="ipadKioskYes">Ja, Beratung öffnen</button></div></div></div>';
    document.body.appendChild(el);
    document.getElementById("ipadKioskTouch").addEventListener("click",()=>document.getElementById("ipadKioskConfirm").classList.remove("hidden"));
    document.getElementById("ipadKioskNo").addEventListener("click",()=>document.getElementById("ipadKioskConfirm").classList.add("hidden"));
    document.getElementById("ipadKioskYes").addEventListener("click",()=>{stop();el.classList.add("hidden");document.body.classList.remove("ipad-kiosk-active");if(typeof go==="function")go("tresore");});
  }
  function stop(){if(timer){clearTimeout(timer);timer=null;}}
  function showSlide(){
    const stage=document.getElementById("ipadKioskStage");if(!stage)return;
    if(!slides.length){stage.querySelector(".ipad-kiosk-empty")?.classList.remove("hidden");return;}
    const slide=slides[current%slides.length];const media=slide.media_type==="video"
      ?'<video class="ipad-kiosk-media" autoplay muted playsinline loop><source src="'+esc(slide.media_url)+'"></video>'
      :'<img class="ipad-kiosk-media" src="'+esc(slide.media_url)+'" alt="'+esc(slide.title)+'">';
    stage.querySelector(".ipad-kiosk-content")?.remove();
    const content=document.createElement("div");content.className="ipad-kiosk-content";
    content.innerHTML=media+'<div class="ipad-kiosk-caption"><small>'+esc(slide.dealer||"Schlüsseldienst Höhne")+'</small><h1>'+esc(slide.title)+'</h1></div>';
    stage.appendChild(content);
    const video=content.querySelector("video");
    if(video){video.addEventListener("ended",next,{once:true});video.play().catch(()=>{});}
    else {timer=setTimeout(next,Math.max(3,Number(slide.duration_seconds)||15)*1000);}
  }
  function next(){stop();if(!slides.length)return;current=(current+1)%slides.length;showSlide();}
  async function loadSlides(){
    try{
      if(!window.supabaseClient)return;
      const {data,error}=await window.supabaseClient.from("kiosk_slides").select("title,dealer,media_type,media_url,duration_seconds,sort_order").eq("active",true).order("sort_order");
      if(error)throw error;slides=data||[];
    }catch(e){console.warn("Kiosk-Präsentation konnte nicht geladen werden:",e.message);}
  }
  async function start(){
    addShell();document.body.classList.add("ipad-kiosk-active");
    await loadSlides();showSlide();
  }
  window.startIpadKiosk=start;
  if(kioskEnabled){
    const boot=()=>start();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  }
})();