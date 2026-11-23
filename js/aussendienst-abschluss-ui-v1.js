/* UI-Verbesserungen für Außendienst-Abschluss und Zahlungsart.
   Wird nach den Außendienst-Workflow-Erweiterungen geladen. */
(function(){
  if(window.__aussendienstAbschlussUiInstalled) return;
  window.__aussendienstAbschlussUiInstalled=true;

  const style=document.createElement("style");
  style.textContent=`
    .service-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
    .service-choice{min-height:150px;padding:20px 14px!important;border-radius:14px!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;white-space:normal;font-size:17px!important;font-weight:800!important;line-height:1.3;border:2px solid transparent!important;box-shadow:0 5px 16px #0003}
    .service-choice .choice-icon{font-size:34px;line-height:1}
    .service-choice .choice-title{font-size:17px;font-weight:850}
    .service-choice .choice-sub{font-size:12px;font-weight:500;opacity:.9}
    .service-choice--complete{background:linear-gradient(145deg,#16834b,#11633b)!important;border-color:#39c879!important;color:#fff!important}
    .service-choice--followup{background:linear-gradient(145deg,#a84b16,#87320f)!important;border-color:#f59e0b!important;color:#fff!important}
    .service-choice--cash{background:linear-gradient(145deg,#16834b,#11633b)!important;border-color:#39c879!important;color:#fff!important}
    .service-choice--invoice{background:linear-gradient(145deg,#245fa8,#17477f)!important;border-color:#60a5fa!important;color:#fff!important}
    .service-no-signature{width:100%;padding:14px!important;margin-top:10px!important;border:1px solid #f59e0b!important;background:#493516!important;color:#fff!important;border-radius:10px!important;font-weight:800!important}
    .service-no-signature-note{font-size:12px;color:#b9cce0;text-align:center;margin-top:7px}
    @media(max-width:520px){.service-choice-grid{grid-template-columns:1fr}.service-choice{min-height:112px;flex-direction:row;justify-content:flex-start;text-align:left;padding:18px!important}.service-choice .choice-icon{font-size:30px;min-width:42px}.service-choice .choice-copy{display:flex;flex-direction:column;gap:5px}}
  `;
  document.head.appendChild(style);

  const originalCompletionStep=window.openServiceCompletionStep;
  window.openServiceCompletionStep=function(){
    // Die Originalfunktion sammelt auch Fotos und Materialien aus dem aktiven Formular.
    if(typeof originalCompletionStep==="function") originalCompletionStep.apply(this,arguments);
    const content=document.getElementById("service_modal_content");
    if(!content)return;
    content.innerHTML=
      '<div style="font-size:17px;font-weight:800;margin-bottom:4px">Wie soll dieser Einsatz weitergeführt werden?</div>'+
      '<div style="font-size:13px;color:#a9c5df">Bitte eine der beiden Möglichkeiten auswählen.</div>'+
      '<div class="service-choice-grid">'+
        '<button type="button" class="btnP service-choice service-choice--complete" onclick="openServicePaymentStep()"><span class="choice-icon">✓</span><span class="choice-copy"><span class="choice-title">Einsatz abschließen</span><span class="choice-sub">Arbeiten sind erledigt</span></span></button>'+
        '<button type="button" class="btnS service-choice service-choice--followup" onclick="markServiceFollowUp()"><span class="choice-icon">↻</span><span class="choice-copy"><span class="choice-title">Als Folgetermin speichern</span><span class="choice-sub">Weitere Arbeiten erforderlich</span></span></button>'+
      '</div>';
  };

  window.openServicePaymentStep=function(){
    const total=(window.activeServiceReport?.material||[]).reduce((sum,m)=>sum+(Number(m.menge)||1)*(Number(m.preis)||0),0);
    openServiceModal("💳 Zahlungsart",
      '<div style="font-size:17px;font-weight:800;margin-bottom:4px">Wie möchte der Kunde bezahlen?</div>'+
      '<div style="font-size:13px;color:#a9c5df">Bitte die passende Zahlungsart auswählen.</div>'+
      '<div class="service-choice-grid">'+
        '<button type="button" class="btnP service-choice service-choice--cash" onclick="openCashPayment()"><span class="choice-icon">€</span><span class="choice-copy"><span class="choice-title">Bar bezahlen</span><span class="choice-sub">Zahlung direkt vor Ort</span></span></button>'+
        '<button type="button" class="btnS service-choice service-choice--invoice" onclick="openInvoicePayment()"><span class="choice-icon">▤</span><span class="choice-copy"><span class="choice-title">Auf Rechnung</span><span class="choice-sub">Rechnung wird erstellt</span></span></button>'+
      '</div>'+
      '<div style="margin-top:14px;color:#8fb3d4;font-size:13px;text-align:center">Materialsumme aktuell: '+total.toFixed(2)+' €</div>'
    );
  };

  function addNoSignatureOption(paymentType){
    const content=document.getElementById("service_modal_content");
    if(!content || content.querySelector("#service-no-signature")) return;
    const button=document.createElement("button");
    button.type="button";
    button.id="service-no-signature";
    button.className="btnS service-no-signature";
    button.textContent="Ohne Unterschrift abschließen";
    button.addEventListener("click",()=>window.finishServiceWithoutSignature(paymentType));
    const note=document.createElement("div");
    note.className="service-no-signature-note";
    note.textContent="Der Regiebericht wird ohne Kundenunterschrift gespeichert.";
    content.append(button,note);
  }

  const oldCash=window.openCashPayment;
  if(typeof oldCash==="function"){
    window.openCashPayment=function(){
      const result=oldCash.apply(this,arguments);
      addNoSignatureOption("bar");
      return result;
    };
  }
  const oldInvoice=window.openInvoicePayment;
  if(typeof oldInvoice==="function"){
    window.openInvoicePayment=function(){
      const result=oldInvoice.apply(this,arguments);
      addNoSignatureOption("rechnung");
      return result;
    };
  }

  window.finishServiceWithoutSignature=async function(paymentType){
    const original=window.serviceSignature;
    window.serviceSignature={has:()=>true,data:()=>null};
    try{
      return await window.finishService(paymentType);
    }finally{
      window.serviceSignature=original;
    }
  };

  console.log("Außendienst-Abschluss-UI geladen");
})();