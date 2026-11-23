/* Gemeinsame Aufgabenliste für Tobias und Christian – Supabase-backed */
let dashboardTasks = [];
let dashboardTasksReady = false;
let dashboardTasksChannel = null;

async function loadSharedTasks() {
  const list = document.getElementById("dashboardTasks");
  if (!window.supabaseReady || !window.supabaseClient) {
    if (list) list.innerHTML = '<div class="dash-task-error">Datenbankverbindung nicht verfügbar.</div>';
    return;
  }
  const {data,error} = await window.supabaseClient.from("app_aufgaben").select("*").order("faellig_am",{ascending:true,nullsFirst:false}).order("created_at",{ascending:false});
  if (error) {
    console.error("Aufgaben konnten nicht geladen werden:",error);
    if (list) list.innerHTML = '<div class="dash-task-error">Aufgaben-Tabelle fehlt noch. Bitte zuerst dashboard_tasks.sql im Supabase SQL Editor ausführen.</div>';
    return;
  }
  dashboardTasks = data || [];
  dashboardTasksReady = true;
  renderSharedTasks();
}
function renderSharedTasks() {
  const list = document.getElementById("dashboardTasks");
  const count = document.getElementById("dashboardTaskCount");
  if (!list) return;
  const open = dashboardTasks.filter(t => t.status !== "erledigt");
  if (count) count.textContent = open.length + " offen";
  if (!open.length) {
    list.innerHTML = '<div class="dash-empty">Keine offenen Aufgaben. Alles erledigt!</div>';
    return;
  }
  list.innerHTML = open.map(t => {
    const due = t.faellig_am ? new Date(t.faellig_am+"T12:00:00").toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}) : "Ohne Termin";
    const owner = t.zustaendig || "Nicht zugewiesen";
    return '<div class="dash-task" data-task="'+dashboardEscape(t.id)+'"><input type="checkbox" aria-label="Aufgabe erledigen"><div class="dash-task-main"><strong>'+dashboardEscape(t.titel)+'</strong><small>'+dashboardEscape(owner)+' · '+dashboardEscape(due)+(t.erstellt_von?' · von '+dashboardEscape(t.erstellt_von):'')+'</small></div><button class="dash-task-delete" type="button" aria-label="Aufgabe löschen" title="Aufgabe löschen">×</button></div>';
  }).join("");
  list.querySelectorAll(".dash-task").forEach(row => {
    const id = row.dataset.task;
    row.querySelector("input").addEventListener("change",()=>setDashboardTaskStatus(id,"erledigt"));
    row.querySelector("button").addEventListener("click",()=>deleteDashboardTask(id));
  });
}
async function addDashboardTask(event) {
  event.preventDefault();
  const title = document.getElementById("dashboardTaskTitle");
  const due = document.getElementById("dashboardTaskDue");
  const assignee = document.getElementById("dashboardTaskAssignee");
  const button = event.submitter || document.querySelector("#dashboardTaskForm button[type=submit]");
  const titel = title.value.trim();
  if (!titel) return;
  if (!window.supabaseReady || !window.supabaseClient) { alert("Keine Datenbankverbindung."); return; }
  if (button) button.disabled = true;
  const payload = {titel,faellig_am:due.value||null,zustaendig:assignee.value||null,erstellt_von:window.currentEmployee||"Unbekannt",status:"offen"};
  const {data,error} = await window.supabaseClient.from("app_aufgaben").insert(payload).select().single();
  if (button) button.disabled = false;
  if (error) { console.error(error); alert("Aufgabe konnte nicht gespeichert werden: "+error.message); return; }
  dashboardTasks.unshift(data);
  title.value = ""; due.value = ""; assignee.value = "";
  renderSharedTasks();
}
async function setDashboardTaskStatus(id,status) {
  const {error} = await window.supabaseClient.from("app_aufgaben").update({status}).eq("id",id);
  if (error) { alert("Status konnte nicht gespeichert werden: "+error.message); await loadSharedTasks(); return; }
  const task = dashboardTasks.find(t=>String(t.id)===String(id));
  if (task) task.status = status;
  renderSharedTasks();
}
async function deleteDashboardTask(id) {
  if (!confirm("Diese Aufgabe wirklich löschen?")) return;
  const {error} = await window.supabaseClient.from("app_aufgaben").delete().eq("id",id);
  if (error) { alert("Aufgabe konnte nicht gelöscht werden: "+error.message); return; }
  dashboardTasks = dashboardTasks.filter(t=>String(t.id)!==String(id));
  renderSharedTasks();
}
function initDashboardTasks() {
  const form = document.getElementById("dashboardTaskForm");
  if (form && !form.dataset.bound) { form.dataset.bound="1"; form.addEventListener("submit",addDashboardTask); }
  loadSharedTasks();
  if (window.supabaseClient && !dashboardTasksChannel) {
    dashboardTasksChannel = window.supabaseClient.channel("dashboard-shared-tasks")
      .on("postgres_changes",{event:"*",schema:"public",table:"app_aufgaben"},()=>loadSharedTasks())
      .subscribe();
  }
}
document.addEventListener("DOMContentLoaded",initDashboardTasks);
setTimeout(initDashboardTasks,0);
