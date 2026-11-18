-- Tresor-Berater: geschützte Produktdatenbank
-- Vor dem Einsatz im Supabase SQL Editor ausführen.
create table if not exists public.safe_products (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null default 'Rottner',
  model text not null,
  article_number text,
  category text not null default 'Wertschutzschrank',
  security_standard text,
  security_class text,
  fire_minutes integer,
  fire_standard text,
  insured_private numeric(12,2),
  insured_commercial numeric(12,2),
  height_mm integer,
  width_mm integer,
  depth_mm integer,
  weight_kg numeric(10,2),
  sale_price_gross numeric(12,2),
  image_url text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.safe_products enable row level security;
drop policy if exists "safe_products_authenticated_read" on public.safe_products;
drop policy if exists "safe_products_authenticated_insert" on public.safe_products;
drop policy if exists "safe_products_authenticated_update" on public.safe_products;
drop policy if exists "safe_products_authenticated_delete" on public.safe_products;
create policy "safe_products_authenticated_read" on public.safe_products for select to authenticated using (true);
create policy "safe_products_authenticated_insert" on public.safe_products for insert to authenticated with check (true);
create policy "safe_products_authenticated_update" on public.safe_products for update to authenticated using (true) with check (true);
create policy "safe_products_authenticated_delete" on public.safe_products for delete to authenticated using (true);
create index if not exists safe_products_active_model_idx on public.safe_products (active, model);
