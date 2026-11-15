-- Tresor-Berater: erweiterte technische Daten und eindeutige Feuerschutz-Klassifizierung
-- Additiv und ohne bestehende Produktdaten zu löschen.
alter table public.safe_products
  add column if not exists fire_protection_type text not null default 'unknown',
  add column if not exists volume_l numeric(10,2),
  add column if not exists inner_height_mm integer,
  add column if not exists inner_width_mm integer,
  add column if not exists inner_depth_mm integer,
  add column if not exists lock_type text,
  add column if not exists source_reference text,
  add column if not exists source_date text;

-- Bestehende Datensätze mit eingetragener Prüfnorm und Schutzdauer als geprüft kennzeichnen.
update public.safe_products
set fire_protection_type = 'tested'
where fire_minutes is not null
  and nullif(trim(fire_standard), '') is not null
  and fire_protection_type = 'unknown';

alter table public.safe_products
  drop constraint if exists safe_products_fire_protection_type_check;
alter table public.safe_products
  add constraint safe_products_fire_protection_type_check
  check (fire_protection_type in ('unknown','none','conditional','tested'));

comment on column public.safe_products.fire_protection_type is
  'unknown = keine belastbare Angabe; none = kein Feuerschutz; conditional = bedingt feuerbeständig; tested = geprüfter Feuerschutz. Nur tested verwendet fire_minutes und fire_standard.';
comment on column public.safe_products.source_reference is
  'Katalog/Flyer und Seite als Herkunftsnachweis der technischen Produktdaten.';
comment on column public.safe_products.source_date is
  'Stand oder Datum der verwendeten Produktquelle.';
