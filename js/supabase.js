// Gemeinsame Supabase-Verbindung für Schlüsseldienst Höhne
const SUPABASE_URL = "https://cczwapyxysohxobndlbg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3mh0E7lEM5qLPqPU3R0EuQ_BgTROM8P";

window.supabaseClient = null;
window.supabaseReady = false;

async function initSupabase() {
  try {
    if (!window.supabase || !window.supabase.createClient) throw new Error("Supabase-Bibliothek nicht geladen");
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    window.supabaseReady = true;
    console.log("Supabase verbunden");
    return true;
  } catch (err) {
    console.error("Supabase-Verbindung fehlgeschlagen:", err);
    return false;
  }
}
