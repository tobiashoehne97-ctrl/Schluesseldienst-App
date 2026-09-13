/* Notdienst Workflow Access Fix v1
   Laufende Notdienste bleiben aus der Liste heraus wieder öffnbar.
   Der Button „Einsatz öffnen“ führt abhängig vom Status in den passenden Workflow-Schritt.
*/
(function(){
  if(window.__ndWorkflowAccessFixV1)return;
  window.__ndWorkflowAccessFixV1=true;

  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  function entry(id){
    return (window.AppData?.kalender?.eintraege||[]).find(e=>String(e.id)===String(id));
  }

  window.openNotdienstWorkflow=function(id){
    const e=entry(id);
    if(!e)return;
    const status=e.status||'notdienst';

    if(status==='unterwegs'){
      if(typeof window.startNotdienstWorkflow==='function'){
        window.startNotdienstWorkflow(id,false);
      }
      return;
    }

    if(status==='vor_ort'){
      if(typeof window.ndArrived==='function'){
        window.ndArrived(id);
      }
      return;
    }

    if(status==='arbeit'){
      if(typeof window.ndArrived==='function'){
        window.ndArrived(id).then?.(()=>{});
      }
      setTimeout(async()=>{
        const current=entry(id);
        if(current)current.status='arbeit';
        if(window.supabaseReady&&window.supabaseClient&&!String(id).startsWith('LOCAL-')){
          try{await window.supabaseClient.from('kalender_eintraege').update({status:'arbeit'}).eq('id',id)}catch(err){console.warn('Status Arbeit konnte nicht wiederhergestellt werden',err)}
        }
      },300);
      return;
    }

    if(status==='notdienst'){
      if(typeof window.startNotdienstWorkflow==='function')window.startNotdienstWorkflow(id,false);
    }
  };

  function addAccessButtons(){
    document.querySelectorAll('#notdienst .notdienst-active-card').forEach(card=>{
      if(card.dataset.ndAccessFix==='1')return;
      const idMatch=card.querySelector('[onclick*="updateNotdienstStatus"]')?.getAttribute('onclick')?.match(/updateNotdienstStatus\(['\"]([^'\"]+)/);
      if(!idMatch)return;
      const id=idMatch[1];
      const e=entry(id);
      if(!e||e.status==='erledigt')return;
      const actions=card.querySelector('.notdienst-card-actions');
      if(!actions)return;
      const b=document.createElement('button');
      b.className='btnP nd-open-workflow-btn';
      b.type='button';
      b.textContent='▶ Einsatz öffnen';
      b.setAttribute('onclick',`window.openNotdienstWorkflow('${esc(id)}')`);
      actions.insertBefore(b,actions.firstChild);
      card.dataset.ndAccessFix='1';
    });
  }

  function install(){
    if(typeof window.renderNotdienst==='function'&&!window.__ndRenderAccessWrapped){
      const original=window.renderNotdienst;
      window.renderNotdienst=function(){
        const result=original.apply(this,arguments);
        setTimeout(addAccessButtons,0);
        return result;
      };
      window.__ndRenderAccessWrapped=true;
    }
    addAccessButtons();
  }

  function init(){
    install();
    let n=0;
    const timer=setInterval(()=>{install();if(++n>20)clearInterval(timer)},500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
