-- Notdienst-Zeitprotokoll dauerhaft am jeweiligen Kalenderauftrag speichern.
-- Einmalig im Supabase SQL Editor ausführen.
alter table public.kalender_eintraege
  add column if not exists zeitprotokoll jsonb not null default '{}'::jsonb;
