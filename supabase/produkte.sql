-- Gemeinsamer Produktkatalog für Schlüsseldienst-App
-- Einmal im Supabase SQL Editor ausführen.
create table if not exists public.produkte (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  preis numeric(10,2) not null default 0,
  einheit text not null default 'Stk',
  aktiv boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.produkte enable row level security;

drop policy if exists "produkte lesen" on public.produkte;
create policy "produkte lesen" on public.produkte for select using (true);

drop policy if exists "produkte schreiben" on public.produkte;
create policy "produkte schreiben" on public.produkte for insert with check (true);

drop policy if exists "produkte aktualisieren" on public.produkte;
create policy "produkte aktualisieren" on public.produkte for update using (true) with check (true);

drop policy if exists "produkte loeschen" on public.produkte;
create policy "produkte loeschen" on public.produkte for delete using (true);
