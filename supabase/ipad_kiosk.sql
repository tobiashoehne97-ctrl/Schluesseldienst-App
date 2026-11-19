-- iPad-Kioskmodus: zentral verwaltete Händler-Präsentationen
create table if not exists public.kiosk_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  dealer text,
  media_type text not null check (media_type in ('image','video')),
  media_url text not null,
  duration_seconds integer not null default 15 check (duration_seconds between 3 and 600),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kiosk_slides enable row level security;

-- Öffentliche Leserechte nur für aktive Präsentationsinhalte.
drop policy if exists "Kiosk public read active slides" on public.kiosk_slides;
create policy "Kiosk public read active slides"
  on public.kiosk_slides for select
  to anon, authenticated
  using (active = true);

-- Verwaltung erfolgt über angemeldete App-Mitarbeiter.
drop policy if exists "Kiosk authenticated manage slides" on public.kiosk_slides;
create policy "Kiosk authenticated manage slides"
  on public.kiosk_slides for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create index if not exists kiosk_slides_active_order_idx
  on public.kiosk_slides (active, sort_order);


-- Angemeldete Mitarbeiter dürfen auch pausierte Einträge in der Verwaltung sehen.
drop policy if exists "Kiosk authenticated read all slides" on public.kiosk_slides;
create policy "Kiosk authenticated read all slides"
  on public.kiosk_slides for select
  to authenticated
  using (auth.uid() is not null);
