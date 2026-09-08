-- Schlüsseldienst-App – Phase 1
-- In Supabase SQL Editor ausführen

create table if not exists public.mitarbeiter (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rollen text[] not null default '{}',
  stundenlohn numeric(10,2) not null default 0,
  aktiv boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.mitarbeiter (name, rollen, stundenlohn)
select 'Christian Höhne', array['Chefbüro','Außendienst'], 0
where not exists (select 1 from public.mitarbeiter where name='Christian Höhne');

insert into public.mitarbeiter (name, rollen, stundenlohn)
select 'Tobias Höhne', array['Büro Aushilfe','Außendienst Aushilfe'], 0
where not exists (select 1 from public.mitarbeiter where name='Tobias Höhne');

create table if not exists public.kalender_eintraege (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  datum date not null,
  von time,
  bis time,
  typ text not null default 'termin',
  status text not null default 'geplant',
  adresse text,
  beschreibung text,
  mitarbeiter_id uuid references public.mitarbeiter(id) on delete set null,
  erstellt_am timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);

create table if not exists public.arbeitszeiten (
  id uuid primary key default gen_random_uuid(),
  mitarbeiter_id uuid references public.mitarbeiter(id) on delete cascade,
  start_zeit timestamptz not null,
  ende_zeit timestamptz,
  quelle text not null default 'manuell',
  notiz text,
  created_at timestamptz not null default now()
);

alter table public.mitarbeiter enable row level security;
alter table public.kalender_eintraege enable row level security;
alter table public.arbeitszeiten enable row level security;

-- Phase 1: Zugriff für die veröffentlichte App.
-- Vor dem produktiven Mehrbenutzerbetrieb ersetzen wir dies durch echte Benutzeranmeldung.
drop policy if exists "phase1 public mitarbeiter" on public.mitarbeiter;
create policy "phase1 public mitarbeiter" on public.mitarbeiter for all using (true) with check (true);

drop policy if exists "phase1 public kalender" on public.kalender_eintraege;
create policy "phase1 public kalender" on public.kalender_eintraege for all using (true) with check (true);

drop policy if exists "phase1 public arbeitszeiten" on public.arbeitszeiten;
create policy "phase1 public arbeitszeiten" on public.arbeitszeiten for all using (true) with check (true);
