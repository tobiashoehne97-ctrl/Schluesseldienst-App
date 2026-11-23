// Gemeinsame Supabase-Verbindung für Schlüsseldienst Höhne
const SUPABASE_URL = "https://cczwapyxysohxobndlbg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3mh0E7lEM5qLPqPU3R0EuQ_BgTROM8P";

window.supabaseClient = window.supabaseClient || null;
window.supabaseReady = !!window.supabaseClient;

async function initSupabase() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase-Bibliothek nicht geladen");
    }

    // Die Anwendung meldet den Mitarbeiter zuerst an. initKalender() ruft
    // initSupabase() danach erneut auf. Den Client hier NICHT neu erstellen:
    // ein neuer Client kann die gerade angemeldete Session während der
    // asynchronen Session-Wiederherstellung verlieren und RLS-Abfragen
    // vorübergehend als anonymer Benutzer ausführen.
    if (!window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );
    }

    window.supabaseReady = true;

    // Sicherstellen, dass die gespeicherte Anmeldung wiederhergestellt ist,
    // bevor nachfolgende Datenbankabfragen gestartet werden.
    const { error } = await window.supabaseClient.auth.getSession();
    if (error) throw error;

    console.log("Supabase verbunden; bestehender Client und Session beibehalten");
    return true;
  } catch (err) {
    console.error("Supabase-Verbindung fehlgeschlagen:", err);
    return false;
  }
}
