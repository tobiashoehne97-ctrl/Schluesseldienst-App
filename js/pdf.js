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