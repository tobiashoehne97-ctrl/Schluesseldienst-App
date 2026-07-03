
window.onerror = function(msg,src,line,col,err){ console.error('JS FEHLER:',msg,'Zeile',line); return false; };

const FN="Schluesseldienst Christian Hoehne",FD="Schl\u00fcsseldienst Christian H\u00f6hne",FS="Viehmarktgasse 6",FP="92224 Amberg",FT="09621 / 13 12 8",BUERO="info@schluesseldienst-hoehne.de";
let logoUrl=null,curMail={},sigs={},ztC=1,pcR=1,pcA=1,zyC=1;

function loadLogo(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    logoUrl=e.target.result;
    const wrap=document.getElementById("logoImg");
    if(wrap){
      const img=document.createElement("img");
      img.src=e.target.result;
      img.style.cssText="height:40px;object-fit:contain;filter:brightness(1.8) saturate(0.3)";
      wrap.replaceWith(img);
      img.id="logoImg";
    }
  };
  r.readAsDataURL(f);
}



function tab(m,n){document.querySelectorAll("#"+m+" .tabs .tab").forEach((t,i)=>t.classList.toggle("on",i===n));for(let i=0;i<4;i++)document.getElementById(m+"_"+i).classList.toggle("hidden",i!==n);}


function ostern(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,day);}
function ftage(y){const o=ostern(y),a=(b,d)=>{const x=new Date(b);x.setDate(x.getDate()+d);return x;},f=d=>d.toISOString().split("T")[0];return new Set([`${y}-01-01`,`${y}-01-06`,f(a(o,-2)),f(o),f(a(o,1)),`${y}-05-01`,f(a(o,39)),f(a(o,49)),f(a(o,50)),f(a(o,60)),`${y}-08-15`,`${y}-10-03`,`${y}-11-01`,`${y}-12-25`,`${y}-12-26`]);}
function tarif(dat,zeit){if(!dat||!zeit)return null;const d=new Date(dat+"T"+zeit),ft=ftage(d.getFullYear()),tag=d.getDay(),min=d.getHours()*60+d.getMinutes();if(ft.has(dat)||tag===0)return{l:"Sonntag / Feiertag (Bayern)",p:150};if(min>=540&&min<=1020)return{l:"Werktag 09:00-17:00 Uhr",p:70};return{l:"Nacht 17:01-08:59 Uhr",p:90};}

function iTO(){const h=new Date().toISOString().split("T")[0],t=new Date().toTimeString().slice(0,5);document.getElementById("to_dat").value=h;document.getElementById("to_zeit").value=t;iSig("to_sc2");updTO();}
function updTO(){const dat=v("to_dat"),zeit=v("to_zeit"),tr=tarif(dat,zeit),isA=document.querySelector("[name=to_tar]:checked")?.value==="auto";const th=document.getElementById("to_th");if(tr){th.style.display="block";th.innerHTML=`<b>${tr.l}</b> &rarr; <b style="color:#4fc3f7">${tr.p} &euro;</b>`;}else th.style.display="none";const tl=document.getElementById("to_tl");if(tl&&tr)tl.innerHTML=tr.l+" &rarr; <b style='color:#4fc3f7'>"+tr.p+" &euro;</b>";document.getElementById("to_tmi").classList.toggle("hidden",isA);const tp=isA?(tr?.p??0):Number(v("to_tval")||0);const zon=document.getElementById("to_zylCb")?.checked;const zp=zon?(Number(document.getElementById("to_ztyp")?.value||0)||Number(v("to_zpreis")||0)):0;const ges=tp+zp;document.getElementById("to_p1").textContent=tp+" €";document.getElementById("to_p2").textContent=zp+" €";document.getElementById("to_zr").style.display=zon?"flex":"none";document.getElementById("to_ges").textContent=ges+" €";}

function iRB(){document.getElementById("rb_dat").value=new Date().toISOString().split("T")[0];document.getElementById("rb_zeiten").innerHTML="";ztC=1;addZeit();document.getElementById("rb_pos").innerHTML="";pcR=1;addPos("rb");iSig("rb_sc");}
function addZeit(){const id=ztC++,dat=new Date().toISOString().split("T")[0];const d=document.createElement("div");d.className="zblk";d.id="zt_"+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Eintrag ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove()">&#10005;<\/button><\/div><div class="g2 mb12"><div><label class="lbl">Datum<\/label><input type="date" id="ztd_${id}" value="${dat}"><\/div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label class="lbl">Von<\/label><input type="time" id="ztv_${id}" oninput="calcD(${id})"><\/div><div><label class="lbl">Bis<\/label><input type="time" id="ztb_${id}" oninput="calcD(${id})"><\/div><\/div><\/div><label class="lbl">T&auml;tigkeit<\/label><input id="ztt_${id}" placeholder="Beschreibung"><div id="ztdur_${id}" style="margin-top:8px;font-size:13px;color:#4fc3f7;font-weight:600;display:none"><\/div>`;document.getElementById("rb_zeiten").appendChild(d);}
function calcD(id){const vo=document.getElementById("ztv_"+id)?.value,bi=document.getElementById("ztb_"+id)?.value;if(!vo||!bi)return;const[vh,vm]=vo.split(":").map(Number),[bh,bm]=bi.split(":").map(Number),d=(bh*60+bm)-(vh*60+vm);const el=document.getElementById("ztdur_"+id);el.style.display=d>0?"block":"none";if(d>0)el.textContent="\u23f1 "+Math.floor(d/60)+"h "+d%60+"min";}
function getZt(){const r=[];document.querySelectorAll("#rb_zeiten .zblk").forEach(b=>{const id=b.id.replace("zt_","");r.push({d:document.getElementById("ztd_"+id)?.value||"",v:document.getElementById("ztv_"+id)?.value||"",b:document.getElementById("ztb_"+id)?.value||"",t:document.getElementById("ztt_"+id)?.value||""});});return r;}

function iAN(){document.getElementById("an_dat").value=new Date().toISOString().split("T")[0];document.getElementById("an_zyls").innerHTML="";zyC=1;addZyl();document.getElementById("an_pos").innerHTML="";pcA=1;addPos("an");iSig("an_sc");}
function addZyl(){const id=zyC++;const d=document.createElement("div");d.className="zblk";d.id="zyl_"+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Zylinder ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove()">&#10005;<\/button><\/div><div class="g2 mb12"><div><label class="lbl">Bezeichnung<\/label><input id="zb_${id}" placeholder="z.B. Haust&uuml;r EG"><\/div><div><label class="lbl">Anzahl<\/label><input type="number" id="za_${id}" value="1"><\/div><\/div><div class="g2 mb12"><div><label class="lbl">Au&szlig;enma&szlig; (mm)<\/label><input class="massInp" type="number" id="zau_${id}" placeholder="35" oninput="updM(${id})"><\/div><div><label class="lbl">Innenma&szlig; (mm)<\/label><input class="massInp" type="number" id="zin_${id}" placeholder="40" oninput="updM(${id})"><\/div><\/div><div id="zm_${id}" class="massD" style="display:none"><\/div><label class="lbl" style="margin-top:10px">Zylindertyp<\/label><input class="mb12" id="ztyp_${id}" placeholder="z.B. Profilzylinder SK3"><label class="lbl">Bemerkung<\/label><input id="zbem_${id}" placeholder="z.B. Knaufzylinder...">`;document.getElementById("an_zyls").appendChild(d);}
function updM(id){const a=document.getElementById("zau_"+id)?.value,i=document.getElementById("zin_"+id)?.value,el=document.getElementById("zm_"+id);el.style.display=(a&&i)?"block":"none";if(a&&i)el.textContent="\ud83d\udccf "+a+" / "+i+" mm";}
function getZyls(){const r=[];document.querySelectorAll("#an_zyls .zblk").forEach(b=>{const id=b.id.replace("zyl_","");const a=document.getElementById("zau_"+id)?.value,i=document.getElementById("zin_"+id)?.value;if(!a&&!i)return;r.push({bez:document.getElementById("zb_"+id)?.value||"",anz:document.getElementById("za_"+id)?.value||"1",aus:a||"",inn:i||"",typ:document.getElementById("ztyp_"+id)?.value||"",bem:document.getElementById("zbem_"+id)?.value||""});});return r;}

function addPos(m){const id=m==="rb"?pcR++:pcA++;const pre=m+"_p";const d=document.createElement("div");d.className="zblk";d.id=pre+id;d.innerHTML=`<div class="blkhd"><span class="blkt">Position ${id}<\/span><button class="btnD" onclick="this.closest('.zblk').remove();updSum('${m}')">&#10005;<\/button><\/div><label class="lbl">Beschreibung<\/label><input class="mb12" id="${pre}b${id}" placeholder="z.B. Profilzylinder SK2"><div class="g3"><div><label class="lbl">Menge<\/label><input type="number" id="${pre}m${id}" value="1" oninput="updSum('${m}')"><\/div><div><label class="lbl">Einheit<\/label><select id="${pre}e${id}"><option>Stk</option><option>m</option><option>m&sup2;</option><option>h</option><option>Psch</option><option>Set</option><\/select><\/div><div><label class="lbl">EP (&euro;)<\/label><input type="number" id="${pre}p${id}" placeholder="0.00" oninput="updSum('${m}')"><\/div><\/div><div id="${pre}tot${id}" style="margin-top:8px;font-size:13px;color:#4fc3f7;font-weight:600;display:none"><\/div>`;document.getElementById(m+"_pos").appendChild(d);}
function updSum(m){let s=0;document.querySelectorAll("#"+m+"_pos .zblk").forEach(b=>{const id=b.id.replace(m+"_p","");const pre=m+"_p";const mm=Number(document.getElementById(pre+"m"+id)?.value||0),pp=Number(document.getElementById(pre+"p"+id)?.value||0),tot=mm*pp;s+=tot;const el=document.getElementById(pre+"tot"+id);if(el){el.style.display=pp?"block":"none";if(pp)el.textContent="= "+tot.toFixed(2)+" \u20ac";}});if(m==="rb"){document.getElementById("rb_sb").style.display=s?"block":"none";document.getElementById("rb_sum").textContent=s.toFixed(2)+" \u20ac";}if(m==="an"){document.getElementById("an_sb").style.display=s?"block":"none";document.getElementById("an_net").textContent=s.toFixed(2)+" \u20ac";document.getElementById("an_mwst").textContent=(s*0.19).toFixed(2)+" \u20ac";document.getElementById("an_brut").textContent=(s*1.19).toFixed(2)+" \u20ac";}}
function getPos(m){const r=[];document.querySelectorAll("#"+m+"_pos .zblk").forEach(b=>{const id=b.id.replace(m+"_p","");const pre=m+"_p";const b2=document.getElementById(pre+"b"+id)?.value||"";if(!b2)return;r.push({b:b2,m:document.getElementById(pre+"m"+id)?.value||"1",e:document.getElementById(pre+"e"+id)?.value||"Stk",p:document.getElementById(pre+"p"+id)?.value||""});});return r;}

function addF(inp,wid){const w=document.getElementById(wid);Array.from(inp.files).forEach(f=>{const r=new FileReader();r.onload=e=>{const d=document.createElement("div");d.className="fi";d.innerHTML=`<img src="${e.target.result}"><button class="fdel" onclick="this.parentNode.remove()">&#10005;<\/button>`;d.querySelector("img")._d=e.target.result;w.appendChild(d);};r.readAsDataURL(f);});}
function getFotos(wid){return[...document.querySelectorAll("#"+wid+" img")].map(i=>i._d).filter(Boolean);}

function iSig(cid){const c=document.getElementById(cid);if(!c||c._si)return;c._si=true;let dr=false,lp={};const gp=(e,c)=>{const r=c.getBoundingClientRect(),s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*(c.width/r.width),y:(s.clientY-r.top)*(c.height/r.height)};};c.addEventListener("mousedown",e=>{dr=true;lp=gp(e,c);});c.addEventListener("mousemove",e=>{if(!dr)return;const ctx=c.getContext("2d"),p=gp(e,c);ctx.beginPath();ctx.moveTo(lp.x,lp.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="#1e3a5f";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();lp=p;});["mouseup","mouseleave"].forEach(ev=>c.addEventListener(ev,()=>dr=false));c.addEventListener("touchstart",e=>{e.preventDefault();dr=true;lp=gp(e,c);},{passive:false});c.addEventListener("touchmove",e=>{e.preventDefault();if(!dr)return;const ctx=c.getContext("2d"),p=gp(e,c);ctx.beginPath();ctx.moveTo(lp.x,lp.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="#1e3a5f";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.stroke();lp=p;},{passive:false});c.addEventListener("touchend",()=>dr=false);}
function clrSig(cid){const c=document.getElementById(cid);c.getContext("2d").clearRect(0,0,c.width,c.height);}
function savSig(cid,key,okId){sigs[key]=document.getElementById(cid).toDataURL();document.getElementById(okId).classList.remove("hidden");}

function pH(doc,t,s,nr,dat){const W=210,M=16;doc.setFillColor(10,25,55);doc.rect(0,0,W,50,"F");const logo=logoUrl||document.getElementById("logoImg").src;if(logo&&logo.startsWith("data:")){try{doc.addImage(logo,"PNG",M,5,50,17,undefined,"FAST");}catch(e){}}doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(200,225,255);doc.text(FD,W-M,12,{align:"right"});doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(130,175,225);doc.text(FS+" - "+FP,W-M,19,{align:"right"});doc.text("Tel: "+FT,W-M,25,{align:"right"});doc.setDrawColor(59,110,165);doc.setLineWidth(0.4);doc.line(M,32,W-M,32);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(160,205,255);doc.text(t.toUpperCase(),M,39);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120,170,220);doc.text(s+"  |  Nr: "+nr+"  |  "+dat,M,46);}
function pF(doc){const W=210,n=doc.internal.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFillColor(10,25,55);doc.rect(0,285,W,12,"F");doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(100,150,210);doc.text(FD+" - "+FS+", "+FP+" - Tel: "+FT,W/2,291,{align:"center"});}}
function pSec(doc,y,t,rows){
  const W=210,M=16,valX=M+55,valW=W-2*M-55-4,lineH=6;
  // Pre-calculate wrapped lines for each row
  doc.setFont("helvetica","normal");doc.setFontSize(8.5);
  const wrappedRows=rows.map(([k,vv])=>{
    const txt=String(vv||"-");
    const lines=doc.splitTextToSize(txt,valW);
    return{k,lines};
  });
  const totalLines=wrappedRows.reduce((s,r)=>s+r.lines.length,0);
  const h=totalLines*lineH+18;
  // Draw background
  if(y+h>270){doc.addPage();y=20;}
  doc.setFillColor(232,242,252);doc.roundedRect(M,y,W-2*M,h,3,3,"F");
  doc.setFillColor(30,80,160);doc.roundedRect(M,y,W-2*M,9,3,3,"F");
  doc.rect(M,y+6,W-2*M,3,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(255,255,255);
  doc.text(t,M+5,y+6);
  let cy=y+14;
  wrappedRows.forEach(({k,lines})=>{
    doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.setTextColor(40,60,100);
    doc.text(String(k),M+5,cy);
    doc.setFont("helvetica","normal");doc.setTextColor(60,80,120);
    lines.forEach((line,li)=>{
      doc.text(line,valX,cy+li*lineH);
    });
    cy+=lines.length*lineH;
  });
  return y+h+5;
}
function pSig(doc,y,sig,name,dat){const W=210,M=16;if(y+44>270){doc.addPage();y=20;}doc.setFillColor(242,247,254);doc.roundedRect(M,y,W-2*M,42,3,3,"F");doc.setDrawColor(37,99,168);doc.setLineWidth(0.3);doc.roundedRect(M,y,W-2*M,42,3,3,"S");doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(37,99,168);doc.text("KUNDENUNTERSCHRIFT",M+4,y+7);doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(100,120,150);doc.text("Mit meiner Unterschrift bestatige ich die Richtigkeit der Angaben.",M+4,y+13);if(sig){try{doc.addImage(sig,"PNG",M+4,y+15,78,20,undefined,"FAST");}catch(e){}}else{doc.setDrawColor(160,180,210);doc.line(M+4,y+35,M+90,y+35);}doc.setFontSize(7);doc.setTextColor(120,140,165);doc.text(String(name),M+4,y+40);doc.text("Datum: "+dat,W-M-32,y+40);return y+48;}
function pFoto(doc,y,fotos){if(!fotos.length)return y;const W=210,M=16;if(y+46>270){doc.addPage();y=20;}doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(30,80,160);doc.text("FOTOS",M,y+5);y+=9;let ix=M;for(const b of fotos.slice(0,6)){if(y+42>270){doc.addPage();y=20;ix=M;}try{doc.addImage(b,"JPEG",ix,y,44,34,undefined,"FAST");}catch(e){}ix+=48;if(ix>W-40){ix=M;y+=38;}}return y+40;}

function genPDF(mod){
  window._currentModul = mod;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:"mm",format:"a4"});
  const W=210,M=16;let y=0,nr="";
  if(mod==="to"){
    nr="TO-"+Date.now().toString().slice(-6);
    const dat=v("to_dat"),zeit=v("to_zeit"),tr=tarif(dat,zeit),isA=document.querySelector("[name=to_tar]:checked")?.value==="auto";
    const tp=isA?(tr?.p??0):Number(v("to_tval")||0);
    const zon=document.getElementById("to_zylCb")?.checked;
    const zp=zon?(Number(document.getElementById("to_ztyp")?.value||0)||Number(v("to_zpreis")||0)):0;
    const ges=tp+zp;
    pH(doc,"Turoeffnung","Einsatzprotokoll & Abrechnung",nr,dat);y=60;
    y=pSec(doc,y,"KUNDENDATEN",[["Name:",v("to_vn")+" "+v("to_nn")],["Adresse:",v("to_adr")+", "+v("to_plz")+" "+v("to_ort")],["Telefon:",v("to_tel")]]);
    y=pSec(doc,y,"SCHADENART",[["Art:",chk("to_sa")]]);
    y=pSec(doc,y,"EINSATZ",[["Oeffnungsart:",chk("to_oa")],["Schaeden:",rad("to_sc")],["Besonderheiten:",v("to_bem")]]);
    y=pSec(doc,y,"PERSONALIEN",[["Personalien:",document.getElementById("to_pers")?.checked?"Ja":"Nein"],["Berechtigt:",document.getElementById("to_ber")?.checked?"Ja":"Nein"]]);
    if(zon)y=pSec(doc,y,"ZYLINDER",[["Typ:",document.getElementById("to_ztyp").options[document.getElementById("to_ztyp").selectedIndex].text],["Masse:",v("to_zmass")],["Preis:",zp+" EUR"]]);
    const aH=zon?46:38;if(y+aH>270){doc.addPage();y=20;}
    doc.setFillColor(10,30,70);doc.roundedRect(M,y,W-2*M,aH,3,3,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(180,210,255);doc.text("ABRECHNUNG",M+5,y+8);
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(160,200,250);
    const tl=isA?(tr?.l??""):"Manuell";
    doc.text("Grundtarif ("+tl+"):",M+5,y+18);doc.text(tp+" EUR",W-M-25,y+18);
    if(zon){doc.text("Zylinder:",M+5,y+26);doc.text(zp+" EUR",W-M-25,y+26);}
    const sY=zon?y+33:y+26;doc.setDrawColor(59,130,196);doc.setLineWidth(0.4);doc.line(M+3,sY,W-M-3,sY);
    doc.setFont("helvetica","bold");doc.setFontSize(12);doc.setTextColor(255,255,255);doc.text("GESAMT:",M+5,sY+9);doc.text(ges+" EUR",W-M-30,sY+9);y+=aH+6;
    y=pFoto(doc,y,getFotos("to_fw"));pSig(doc,y,sigs["to_sd"],v("to_vn")+" "+v("to_nn"),dat);
    curMail={typ:"Turoeffnung",name:v("to_vn")+" "+v("to_nn"),dat,info:"Adresse: "+v("to_adr")+", "+v("to_plz")+" "+v("to_ort")+"\nGesamt: "+ges+" EUR",nr};
  }else if(mod==="rb"){
    nr="RB-"+Date.now().toString().slice(-6);const dat=v("rb_dat");
    pH(doc,"Regiebericht","Arbeitsrapport",nr,dat);y=60;
    y=pSec(doc,y,"KUNDE / BAUSTELLE",[["Name:",v("rb_vn")+" "+v("rb_nn")],["Firma:",v("rb_fi")],["Baustelle:",v("rb_bau")],["Adresse:",v("rb_adr")+", "+v("rb_plz")+" "+v("rb_ort")],["Telefon:",v("rb_tel")]]);
    const zt=getZt(),zr=zt.map(z=>[z.d+" "+z.v+"-"+z.b,z.t]);
    y=pSec(doc,y,"ARBEITSZEITEN",zr.length?zr:[["","Keine Eintraege"]]);
    const pos=getPos("rb");if(pos.length){const pr=pos.map(p=>[p.m+" "+p.e+"  "+p.b,p.p?(Number(p.m)*Number(p.p)).toFixed(2)+" EUR":"-"]);y=pSec(doc,y,"MATERIAL / LEISTUNGEN",pr);const sm=pos.reduce((s,p)=>s+(Number(p.m)*Number(p.p)||0),0);if(sm>0){if(y+22>270){doc.addPage();y=20;}doc.setFillColor(10,30,70);doc.roundedRect(M,y,W-2*M,20,3,3,"F");doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(255,255,255);doc.text("MATERIALSUMME:",M+5,y+13);doc.text(sm.toFixed(2)+" EUR",W-M-36,y+13);y+=26;}}
    if(v("rb_bem"))y=pSec(doc,y,"BESONDERHEITEN",[["",v("rb_bem")]]);
    y=pSec(doc,y,"BEZAHLUNG",[["Zahlungsart:",rad("rb_bez")]]);
    y=pFoto(doc,y,getFotos("rb_fw"));pSig(doc,y,sigs["rb_sd"],v("rb_vn")+" "+v("rb_nn"),dat);
    curMail={typ:"Regiebericht",name:v("rb_vn")+" "+v("rb_nn"),dat,info:"Baustelle: "+v("rb_bau"),nr};
  }else if(mod==="an"){
    nr="AN-"+Date.now().toString().slice(-6);const dat=v("an_dat"),guel=v("an_guel");
    pH(doc,"Erstbesichtigung & Angebot",guel?"Gueltig bis: "+guel:"Angebot",nr,dat);y=60;
    y=pSec(doc,y,"KUNDE / OBJEKT",[["Name:",v("an_vn")+" "+v("an_nn")],["Firma:",v("an_fi")],["Objekt:",v("an_obj")],["Adresse:",v("an_adr")+", "+v("an_plz")+" "+v("an_ort")],["Telefon:",v("an_tel")]]);
    if(v("an_beschr"))y=pSec(doc,y,"OBJEKTBESCHREIBUNG",[["",v("an_beschr")]]);
    const zyls=getZyls();if(zyls.length){const zr=zyls.map(z=>[(z.bez||"Pos.")+" ("+z.anz+"x)",z.aus+"/"+z.inn+" mm "+z.typ+(z.bem?"| "+z.bem:"")]);y=pSec(doc,y,"ZYLINDERAUFMASS",zr);}
    const pos=getPos("an");if(pos.length){const pr=pos.map(p=>[p.m+" "+p.e+"  "+p.b,p.p?(Number(p.m)*Number(p.p)).toFixed(2)+" EUR":"auf Anfrage"]);y=pSec(doc,y,"ANGEBOTSPOSITIONEN",pr);const n=pos.reduce((s,p)=>s+(Number(p.m)*Number(p.p)||0),0);if(n>0){if(y+28>270){doc.addPage();y=20;}doc.setFillColor(10,30,70);doc.roundedRect(M,y,W-2*M,26,3,3,"F");doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(160,200,250);doc.text("zzgl. gesetzl. MwSt.",M+5,y+9);doc.setFont("helvetica","bold");doc.setFontSize(12);doc.setTextColor(255,255,255);doc.text("ANGEBOTSSUMME (netto):",M+5,y+20);doc.text(n.toFixed(2)+" EUR",W-M-36,y+20);y+=32;}}
    if(v("an_hinw"))y=pSec(doc,y,"HINWEISE",[["",v("an_hinw")]]);
    y=pFoto(doc,y,getFotos("an_fw"));
    if(sigs["an_sd"])pSig(doc,y,sigs["an_sd"],v("an_vn")+" "+v("an_nn"),dat);
    const n2=getPos("an").reduce((s,p)=>s+(Number(p.m)*Number(p.p)||0),0);
    curMail={typ:"Angebot",name:v("an_vn")+" "+v("an_nn"),dat,info:"Objekt: "+v("an_obj")+(n2>0?"\nBrutto: "+(n2*1.19).toFixed(2)+" EUR":"")+(guel?"\nGueltig bis: "+guel:""),nr};
  }
  pF(doc);
  const pdfUri = doc.output("datauristring");
  // Ins Archiv speichern
  const archTyp = mod==="to"?"TO":mod==="rb"?"RB":"AN";
  const archName = mod==="to"?v("to_vn")+" "+v("to_nn"):mod==="rb"?v("rb_vn")+" "+v("rb_nn"):v("an_vn")+" "+v("an_nn");
  const archDat = mod==="to"?v("to_dat"):mod==="rb"?v("rb_dat"):v("an_dat");
  saveToArchiv(nr, archTyp, archName.trim(), archDat, pdfUri);
  document.getElementById("pdfNr").textContent=nr;
  document.getElementById("mailOk").classList.add("hidden");
  // Zeige PDF im eingebetteten Viewer
  // Store blob URL for native open (works on iOS Safari)
  window._currentPdfUri = pdfUri;
  window._currentPdfNr = nr;
  document.getElementById("pdfPreviewName").textContent = nr;
  document.getElementById("pdfMod").classList.add("open");
}


// ── Archiv ────────────────────────────────────────────────────────────────────
const SB_URL = "https://cczwapyxysohxobndlbg.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjendhcHl4eXNvaHhvYm5kbGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDMyMzksImV4cCI6MjA5NzgxOTIzOX0.aD5sNTJ8un-mDut4TyKKFt3CWNYJwZHbNwY7BkiVwig";
const ARCHIV = [];

// PDF-Daten separat in sessionStorage (zu groß für Supabase free tier)
function savePdfLocal(nr, pdfUri) {
  try { sessionStorage.setItem("pdf_"+nr, pdfUri); } catch(e) {}
}
function getPdfLocal(nr) {
  return sessionStorage.getItem("pdf_"+nr) || null;
}

async function sbPost(data) {
  try {
    const res = await fetch(SB_URL+"/rest/v1/archiv", {
      method:"POST",
      headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify(data)
    });
    return res.ok;
  } catch(e) { return false; }
}

async function sbGet() {
  try {
    const res = await fetch(SB_URL+"/rest/v1/archiv?select=nr,typ,name,dat,saved&order=id.desc", {
      headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY}
    });
    if(!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

async function sbDelete(nr) {
  try {
    await fetch(SB_URL+"/rest/v1/archiv?nr=eq."+encodeURIComponent(nr), {
      method:"DELETE",
      headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY}
    });
  } catch(e) {}
}

async function saveToArchiv(nr, typ, name, dat, pdfUri) {
  const saved = new Date().toLocaleString("de-DE");
  ARCHIV.unshift({nr, typ, name, dat, pdfUri, saved});
  savePdfLocal(nr, pdfUri);
  await sbPost({nr, typ, name, dat, saved});
}

function loadArchiv() {
  var list = document.getElementById("archiv-list");
  var empty = document.getElementById("archiv-empty");
  var st = document.getElementById("archiv-status");
  var inf = document.getElementById("archiv-info");

  // Always show the empty div with status first
  if(empty) empty.style.display = "block";
  if(list) list.innerHTML = "";
  if(st) st.textContent = "Verbinde...";
  if(inf) inf.textContent = "";

  sbGet().then(function(rows) {
    if (!rows || rows.length === 0) {
      if(st) st.textContent = rows === null ? "Supabase nicht erreichbar" : "Noch keine Dokumente";
      if(inf) inf.textContent = rows === null ? "Verbindung testen tippen" : "PDF erstellen - erscheint automatisch hier.";
      return;
    }
    if(empty) empty.style.display = "none";

    var searchDiv = document.createElement("div");
    searchDiv.className = "card";
    searchDiv.style.cssText = "padding:12px 16px;margin-bottom:14px";
    searchDiv.innerHTML = '<input id="archiv-search" placeholder="Suchen..." oninput="filterArchiv()" style="font-size:14px">';
    list.appendChild(searchDiv);

    var container = document.createElement("div");
    container.id = "archiv-cards";
    list.appendChild(container);

    rows.forEach(function(e) {
      var icon = e.typ==="TO" ? "&#128273;" : e.typ==="RB" ? "&#128203;" : "&#128269;";
      var typLabel = e.typ==="TO" ? "Türöffnung" : e.typ==="RB" ? "Regiebericht" : "Angebot";

      var card = document.createElement("div");
      card.className = "card archiv-card";
      card.dataset.search = ((e.nr||"")+" "+(e.name||"")+" "+(e.typ||"")+" "+(e.dat||"")).toLowerCase();
      card.style.cssText = "margin-bottom:12px;padding:16px 18px";

      var delBtn = document.createElement("button");
      delBtn.className = "btnD";
      delBtn.style.cssText = "font-size:11px;padding:4px 10px;margin-top:6px";
      delBtn.innerHTML = "&#128465; Löschen";
      delBtn.onclick = (function(nr){ return function(){ delArchiv(nr); }; })(e.nr);

      var pdfBtn = document.createElement("button");
      pdfBtn.className = "btnP";
      pdfBtn.style.cssText = "padding:7px 12px;font-size:12px";
      pdfBtn.innerHTML = "&#8599; PDF";
      pdfBtn.onclick = (function(nr){ return function(){ openArchivPdf(nr); }; })(e.nr);

      var btnWrap = document.createElement("div");
      btnWrap.style.cssText = "display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0";
      if(getPdfLocal(e.nr)) btnWrap.appendChild(pdfBtn);
      btnWrap.appendChild(delBtn);

      var info = document.createElement("div");
      info.style.cssText = "flex:1;min-width:0";
      info.innerHTML = "<div style='font-weight:700;font-size:15px;color:#e8f0f8'>"+(e.nr||"")+"<\/div>"
        + "<div style='font-size:13px;color:#7eb3e0;margin-top:2px'>"+typLabel+" &mdash; "+(e.name||"–")+"<\/div>"
        + "<div style='font-size:12px;color:#4a7aaa;margin-top:2px'>"+(e.dat||"")+" · "+(e.saved||"")+"<\/div>";

      var row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:12px";
      var iconEl = document.createElement("span");
      iconEl.style.cssText = "font-size:28px;flex-shrink:0";
      iconEl.innerHTML = icon;
      row.appendChild(iconEl);
      row.appendChild(info);
      row.appendChild(btnWrap);
      card.appendChild(row);
      container.appendChild(card);
    });
  }).catch(function(err) {
    if(st) st.textContent = "Fehler: " + (err.message||"unbekannt");
  });
}


function openArchivPdf(nr) {
  const pdfUri = getPdfLocal(nr);
  if(pdfUri){ window._currentPdfUri = pdfUri; openPdfNative(); }
  else alert("PDF nur in der aktuellen Sitzung verfügbar. Bitte neu erstellen.");
}

function filterArchiv() {
  const q = (document.getElementById("archiv-search")?.value||"").toLowerCase();
  document.querySelectorAll(".archiv-card").forEach(card => {
    card.style.display = card.dataset.search.includes(q) ? "" : "none";
  });
}

function openArchivEntry(e) {
  if (!e) return;
  window._currentPdfUri = e.pdfUri || null;
  window._currentPdfNr = e.nr;
  curMail = {nr: e.nr, typ: e.typ||"", name: e.name||"", dat: e.dat||"", info:""};
  document.getElementById("pdfPreviewName").textContent = e.nr + (e.name ? " – " + e.name : "");
  document.getElementById("pdfNr").textContent = e.nr + (e.name ? " – " + e.name : "");
  document.getElementById("mailOk").classList.add("hidden");
  document.getElementById("pdfMod").classList.add("open");
}

async function delArchiv(nr) {
  if(!confirm("Dokument "+nr+" wirklich löschen?")) return;
  await sbDelete(nr);
  loadArchiv();
}


function openPdfNative(){
  if(!window._currentPdfUri) return;
  // Convert data URI to Blob, then open blob URL - works on iOS Safari
  try {
    const arr = window._currentPdfUri.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8 = new Uint8Array(n);
    for(let i=0;i<n;i++) u8[i]=bstr.charCodeAt(i);
    const blob = new Blob([u8],{type:mime});
    const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
  } catch(e) {
    // Fallback: direct data URI
    window.open(window._currentPdfUri,'_blank');
  }
}

function testArchiv() {
  var st = document.getElementById("archiv-status");
  var inf = document.getElementById("archiv-info");
  if(st) st.textContent = "Teste Verbindung...";
  if(inf) inf.textContent = "";
  sbGet().then(function(rows) {
    if (rows === null) {
      if(st) st.textContent = "Supabase nicht erreichbar";
      if(inf) inf.innerHTML = "Bitte in Supabase SQL Editor ausf\u00fchren:<br><br><code style='font-size:11px;background:rgba(0,0,0,0.3);padding:8px;display:block;border-radius:6px;text-align:left'>create policy \"lesen\" on archiv for select using (true);<br>create policy \"schreiben\" on archiv for insert with check (true);<br>create policy \"loeschen\" on archiv for delete using (true);<\/code>";
    } else if (rows.length === 0) {
      if(st) st.textContent = "Verbindung OK - Noch keine Dokumente";
      if(inf) inf.textContent = "Erstelle ein PDF - es erscheint automatisch hier.";
    } else {
      if(st) st.textContent = rows.length + " Dokument(e) gefunden";
      loadArchiv();
    }
  }).catch(function(e) {
    if(st) st.textContent = "Fehler: " + e.message;
  });
}

// ── Auftraege heute ────────────────────────────────────────────────────────
var AUFTRAEGE = [];
var auftragCounter = 1;

function addAuftrag() {
  var vn = v("auf_vn"), nn = v("auf_nn");
  if (!vn && !nn) { alert("Bitte mindestens einen Namen eingeben."); return; }
  AUFTRAEGE.push({
    id: auftragCounter++,
    vn: vn, nn: nn,
    fi: v("auf_fi"), adr: v("auf_adr"), tel: v("auf_tel"), notiz: v("auf_notiz"),
    erledigt: false
  });
  ["auf_vn","auf_nn","auf_fi","auf_adr","auf_tel","auf_notiz"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
  renderAuftraege();
}

function renderAuftraege() {
  var list = document.getElementById("auftrag-liste");
  var empty = document.getElementById("auftrag-empty");
  var badge = document.getElementById("auftrag-badge");
  if (!list) return;
  list.innerHTML = "";

  var offen = AUFTRAEGE.filter(function(a){ return !a.erledigt; });
  if (badge) badge.textContent = AUFTRAEGE.length ? (offen.length + " offen") : "";

  if (!AUFTRAEGE.length) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  AUFTRAEGE.forEach(function(a) {
    var card = document.createElement("div");
    card.className = "card";
    card.style.cssText = "margin-bottom:12px;padding:16px 18px;" + (a.erledigt ? "opacity:0.45" : "");

    var row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:flex-start;gap:12px";

    var info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0";
    var name = (a.vn + " " + a.nn).trim() || "(ohne Namen)";
    info.innerHTML = "<div style='font-weight:700;font-size:15px;color:#e8f0f8" + (a.erledigt ? ";text-decoration:line-through" : "") + "'>" + name + (a.fi ? " &middot; " + a.fi : "") + "<\/div>"
      + (a.adr ? "<div style='font-size:13px;color:#7eb3e0;margin-top:3px'>" + a.adr + "<\/div>" : "")
      + (a.notiz ? "<div style='font-size:13px;color:#a0c4e8;margin-top:4px'>" + a.notiz + "<\/div>" : "");

    var btnCol = document.createElement("div");
    btnCol.style.cssText = "display:flex;flex-direction:column;gap:6px;flex-shrink:0";

    if (!a.erledigt) {
      var startBtn = document.createElement("button");
      startBtn.className = "btnP";
      startBtn.style.cssText = "padding:9px 14px;font-size:13px;white-space:nowrap";
      startBtn.innerHTML = "&#9654; Starten";
      startBtn.onclick = (function(id){ return function(){ starteAuftrag(id); }; })(a.id);
      btnCol.appendChild(startBtn);
    }

    var delBtn = document.createElement("button");
    delBtn.className = "btnD";
    delBtn.style.cssText = "padding:6px 14px;font-size:12px";
    delBtn.innerHTML = "&#10005;";
    delBtn.onclick = (function(id){ return function(){ removeAuftrag(id); }; })(a.id);
    btnCol.appendChild(delBtn);

    row.appendChild(info);
    row.appendChild(btnCol);
    card.appendChild(row);
    list.appendChild(card);
  });
}

function removeAuftrag(id) {
  AUFTRAEGE = AUFTRAEGE.filter(function(a){ return a.id !== id; });
  renderAuftraege();
}

function starteAuftrag(id) {
  var a = AUFTRAEGE.find(function(x){ return x.id === id; });
  if (!a) return;
  a.erledigt = true;
  // Regiebericht mit den Daten vorbefuellen
  go("rb");
  setTimeout(function() {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = val; };
    set("rb_vn", a.vn);
    set("rb_nn", a.nn);
    set("rb_fi", a.fi);
    set("rb_adr", a.adr);
    set("rb_tel", a.tel);
    if (a.notiz) {
      var zeile = document.querySelector("#rb_zeiten .zblk input[id^='ztt_']");
      if (zeile) zeile.value = a.notiz;
    }
  }, 50);
  renderAuftraege();
}

// ── Arbeitszeit ───────────────────────────────────────────────────────────
function getZeitEintraege() {
  try { return JSON.parse(localStorage.getItem("arbeitszeit") || "[]"); }
  catch(e) { return []; }
}
function saveZeitEintraege(arr) {
  try { localStorage.setItem("arbeitszeit", JSON.stringify(arr)); } catch(e) {}
}
function getAktiverStempel() {
  try { return JSON.parse(localStorage.getItem("arbeitszeit_aktiv") || "null"); }
  catch(e) { return null; }
}
function setAktiverStempel(val) {
  try {
    if (val) localStorage.setItem("arbeitszeit_aktiv", JSON.stringify(val));
    else localStorage.removeItem("arbeitszeit_aktiv");
  } catch(e) {}
}

var zeitInterval = null;

function iZeit() {
  updateZeitAnzeige();
  if (zeitInterval) clearInterval(zeitInterval);
  zeitInterval = setInterval(updateZeitAnzeige, 1000);
  renderZeitHeute();
}

function updateZeitAnzeige() {
  var aktiv = getAktiverStempel();
  var statusEl = document.getElementById("zeit-status");
  var clockEl = document.getElementById("zeit-clock");
  var seitEl = document.getElementById("zeit-seit");
  var btnEl = document.getElementById("zeit-btn");
  if (!statusEl) return;

  var now = new Date();
  var pad = function(n){ return String(n).padStart(2,"0"); };
  clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

  if (aktiv) {
    statusEl.textContent = "Eingestempelt";
    statusEl.style.color = "#4caf50";
    var start = new Date(aktiv.start);
    var diffMs = now - start;
    var diffMin = Math.floor(diffMs / 60000);
    var h = Math.floor(diffMin / 60), m = diffMin % 60;
    seitEl.textContent = "seit " + pad(start.getHours()) + ":" + pad(start.getMinutes()) + " Uhr  (" + h + "h " + m + "min)";
    btnEl.innerHTML = "&#9209; Ausstempeln";
    btnEl.style.background = "linear-gradient(135deg,#c0392b,#e74c3c)";
  } else {
    statusEl.textContent = "Nicht eingestempelt";
    statusEl.style.color = "#7eb3e0";
    seitEl.textContent = "";
    btnEl.innerHTML = "&#9201; Einstempeln";
    btnEl.style.background = "";
  }
}

function toggleStempel() {
  var aktiv = getAktiverStempel();
  var now = new Date();
  if (aktiv) {
    // Ausstempeln
    var eintraege = getZeitEintraege();
    eintraege.unshift({ start: aktiv.start, ende: now.toISOString() });
    saveZeitEintraege(eintraege);
    setAktiverStempel(null);
  } else {
    // Einstempeln
    setAktiverStempel({ start: now.toISOString() });
  }
  updateZeitAnzeige();
  renderZeitHeute();
}

function renderZeitHeute() {
  var listEl = document.getElementById("zeit-heute-liste");
  var sumEl = document.getElementById("zeit-heute-summe");
  if (!listEl) return;
  var heute = new Date().toDateString();
  var eintraege = getZeitEintraege().filter(function(e) {
    return new Date(e.start).toDateString() === heute;
  });
  var pad = function(n){ return String(n).padStart(2,"0"); };
  var totalMin = 0;
  if (!eintraege.length) {
    listEl.innerHTML = "<div style='color:#4a7aaa;font-size:13px'>Noch keine Eintr&auml;ge heute.<\/div>";
  } else {
    listEl.innerHTML = eintraege.map(function(e) {
      var s = new Date(e.start), en = new Date(e.ende);
      var diffMin = Math.round((en - s) / 60000);
      totalMin += diffMin;
      var h = Math.floor(diffMin/60), m = diffMin%60;
      return "<div style='display:flex;justify-content:space-between;padding:4px 0'><span>" 
        + pad(s.getHours())+":"+pad(s.getMinutes()) + " &ndash; " + pad(en.getHours())+":"+pad(en.getMinutes()) 
        + "<\/span><span style='color:#7eb3e0'>" + h + "h " + m + "min<\/span><\/div>";
    }).join("");
  }
  var th = Math.floor(totalMin/60), tm = totalMin%60;
  sumEl.textContent = eintraege.length ? ("Gesamt heute: " + th + "h " + tm + "min") : "";
}

// ── Formular leeren ──────────────────────────────────────────────────────
function leereFormular(mod) {
  if (!confirm("Alle eingegebenen Daten f\u00fcr dieses Formular wirklich l\u00f6schen?")) return;
  document.querySelectorAll("#" + mod + " input[type='text'], #" + mod + " input:not([type]), #" + mod + " input[type='tel'], #" + mod + " input[type='email'], #" + mod + " input[type='number'], #" + mod + " textarea").forEach(function(el) {
    el.value = "";
  });
  document.querySelectorAll("#" + mod + " input[type='checkbox'], #" + mod + " input[type='radio']").forEach(function(el) {
    el.checked = false;
  });
  document.querySelectorAll("#" + mod + " .fw").forEach(function(el) { el.innerHTML = ""; });
  if (mod === "rb") {
    document.getElementById("rb_zeiten").innerHTML = ""; ztC = 1; addZeit();
    document.getElementById("rb_pos").innerHTML = ""; pcR = 1; addPos("rb");
    var c1 = document.getElementById("rb_sc"); if(c1) c1.getContext("2d").clearRect(0,0,c1.width,c1.height);
    document.getElementById("rb_sok").classList.add("hidden");
  } else if (mod === "to") {
    var c2 = document.getElementById("to_sc2"); if(c2) c2.getContext("2d").clearRect(0,0,c2.width,c2.height);
    document.getElementById("to_sok").classList.add("hidden");
    document.getElementById("to_zylF").classList.add("hidden");
    updTO();
  } else if (mod === "an") {
    document.getElementById("an_zyls").innerHTML = ""; zyC = 1; addZyl();
    document.getElementById("an_pos").innerHTML = ""; pcA = 1; addPos("an");
    var c3 = document.getElementById("an_sc"); if(c3) c3.getContext("2d").clearRect(0,0,c3.width,c3.height);
    document.getElementById("an_sok").classList.add("hidden");
  }
  tab(mod, 0);
}

function naechsterAuftrag() {
  document.getElementById("pdfMod").classList.remove("open");
  var mod = window._currentModul;
  if (!mod) return;
  document.querySelectorAll("#" + mod + " input[type='text'], #" + mod + " input:not([type]), #" + mod + " input[type='tel'], #" + mod + " input[type='email'], #" + mod + " input[type='number'], #" + mod + " textarea").forEach(function(el) { el.value = ""; });
  document.querySelectorAll("#" + mod + " input[type='checkbox'], #" + mod + " input[type='radio']").forEach(function(el) { el.checked = false; });
  document.querySelectorAll("#" + mod + " .fw").forEach(function(el) { el.innerHTML = ""; });
  if (mod === "rb") {
    document.getElementById("rb_zeiten").innerHTML = ""; ztC = 1; addZeit();
    document.getElementById("rb_pos").innerHTML = ""; pcR = 1; addPos("rb");
    var c1 = document.getElementById("rb_sc"); if(c1) c1.getContext("2d").clearRect(0,0,c1.width,c1.height);
    document.getElementById("rb_sok").classList.add("hidden");
  } else if (mod === "to") {
    var c2 = document.getElementById("to_sc2"); if(c2) c2.getContext("2d").clearRect(0,0,c2.width,c2.height);
    document.getElementById("to_sok").classList.add("hidden");
    document.getElementById("to_zylF").classList.add("hidden");
    updTO();
  } else if (mod === "an") {
    document.getElementById("an_zyls").innerHTML = ""; zyC = 1; addZyl();
    document.getElementById("an_pos").innerHTML = ""; pcA = 1; addPos("an");
    var c3 = document.getElementById("an_sc"); if(c3) c3.getContext("2d").clearRect(0,0,c3.width,c3.height);
    document.getElementById("an_sok").classList.add("hidden");
  }
  tab(mod, 0);
}

function doMail(nurBuero){
  const to=nurBuero?BUERO:(document.getElementById("mailEm").value||BUERO);
  const cc=(!nurBuero&&document.getElementById("mailEm").value)?BUERO:"";
  const typ=curMail.typ||"Dokument";
  const anr=typ==="Angebot"?"unser Angebot":typ==="Regiebericht"?"Ihren Arbeitsrapport":"Ihr Einsatzprotokoll";
  const subj=encodeURIComponent(typ+" "+curMail.nr+" - "+FN);
  const body=encodeURIComponent("Sehr geehrte/r "+(curMail.name||"Kundin/Kunde")+",\n\nanbei erhalten Sie "+anr+" vom "+(curMail.dat||"")+"."+"\n\nAuftragsnummer: "+curMail.nr+"\n"+(curMail.info||"")+"\n\nMit freundlichen Gruessen\n"+FN+"\n"+FS+" - "+FP+"\nTel: "+FT);
  let href="mailto:"+encodeURIComponent(to)+"?subject="+subj+"&body="+body;
  if(cc)href+="&cc="+encodeURIComponent(cc);
  window.location.href=href;
  document.getElementById("mailOk").classList.remove("hidden");
}