-- Migration: Kundendaten und Adresse getrennt speichern
alter table public.kalender_eintraege
  add column if not exists nachname text,
  add column if not exists vorname text,
  add column if not exists strasse text,
  add column if not exists hausnummer text,
  add column if not exists postleitzahl text,
  add column if not exists ort text;

-- Die bisherige Adresse bleibt erhalten, damit alte Termine nicht verloren gehen.
