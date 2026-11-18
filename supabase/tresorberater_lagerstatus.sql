-- Lagerstatus für Tresor-Berater
-- Bestehende Produkte werden vorsichtshalber als "Muss bestellt werden" geführt.
-- Den tatsächlichen Lagerbestand anschließend in der Produktverwaltung markieren.
alter table public.safe_products
  add column if not exists stock_status text not null default 'to_order';

alter table public.safe_products
  drop constraint if exists safe_products_stock_status_check;

alter table public.safe_products
  add constraint safe_products_stock_status_check
  check (stock_status in ('in_stock','to_order'));

update public.safe_products
set stock_status = 'to_order'
where stock_status is null or stock_status not in ('in_stock','to_order');

comment on column public.safe_products.stock_status is
  'in_stock = lagernd im Geschäft; to_order = muss bestellt werden.';
