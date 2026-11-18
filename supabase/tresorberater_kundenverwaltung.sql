-- Gespeicherte Kundenberatungen im Tresor-Berater
-- Im Supabase SQL Editor einmalig ausführen.
create table if not exists public.safe_consultations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text,
  email text,
  status text not null default 'open' check (status in ('open','callback','sold','lost')),
  follow_up_at date,
  notes text,
  product_ids uuid[] not null default '{}',
  product_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.safe_consultations enable row level security;
drop policy if exists "safe_consultations_select_own" on public.safe_consultations;
drop policy if exists "safe_consultations_insert_own" on public.safe_consultations;
drop policy if exists "safe_consultations_update_own" on public.safe_consultations;
drop policy if exists "safe_consultations_delete_own" on public.safe_consultations;
create policy "safe_consultations_select_own" on public.safe_consultations for select to authenticated using (true);
create policy "safe_consultations_insert_own" on public.safe_consultations for insert to authenticated with check (true);
create policy "safe_consultations_update_own" on public.safe_consultations for update to authenticated using (true) with check (true);
create policy "safe_consultations_delete_own" on public.safe_consultations for delete to authenticated using (true);
create index if not exists safe_consultations_created_by_created_at_idx on public.safe_consultations (created_by, created_at desc);
create index if not exists safe_consultations_follow_up_idx on public.safe_consultations (follow_up_at) where follow_up_at is not null;
