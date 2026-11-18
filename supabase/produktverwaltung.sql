-- Allgemeine Produktverwaltung fuer alle Verkaufsartikel
-- Einmalig im Supabase SQL Editor ausfuehren.
-- Die App nutzt derzeit den Supabase Publishable Key ohne Supabase-Auth-Session.
-- Daher benoetigen die Produkt-Policies auch die Rolle anon.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  article_number text,
  manufacturer text,
  image_url text,
  info text,
  purchase_price_input numeric(12,2),
  purchase_price_type text not null default 'net' check (purchase_price_type in ('net','gross')),
  margin_percent numeric(6,2),
  vat_rate numeric(5,2) not null default 19,
  sale_price_net numeric(12,2),
  sale_price_gross numeric(12,2),
  custom_attributes jsonb not null default '[]'::jsonb,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','to_order')),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products add column if not exists label_fields jsonb not null default '{"info": true}'::jsonb;
alter table public.products enable row level security;
drop policy if exists "products_authenticated_read" on public.products;
drop policy if exists "products_authenticated_insert" on public.products;
drop policy if exists "products_authenticated_update" on public.products;
drop policy if exists "products_authenticated_delete" on public.products;
create policy "products_authenticated_read" on public.products for select to anon, authenticated using (true);
create policy "products_authenticated_insert" on public.products for insert to anon, authenticated with check (true);
create policy "products_authenticated_update" on public.products for update to anon, authenticated using (true) with check (true);
create policy "products_authenticated_delete" on public.products for delete to anon, authenticated using (true);
create index if not exists products_active_name_idx on public.products (active, name);
create index if not exists products_category_idx on public.products (category);
