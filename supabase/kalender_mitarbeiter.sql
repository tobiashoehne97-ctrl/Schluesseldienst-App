-- Einmal im Supabase SQL Editor ausführen
alter table public.kalender_eintraege
add column if not exists mitarbeiter text;
