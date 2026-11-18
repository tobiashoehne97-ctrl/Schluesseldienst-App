-- Tresorberater: Einkaufspreise und Verkaufspreiskalkulation
-- Additive Migration. Bestehende Verkaufspreise bleiben erhalten.
alter table public.safe_products
  add column if not exists purchase_price_input numeric(12,2),
  add column if not exists purchase_price_type text not null default 'net',
  add column if not exists margin_percent numeric(5,2) not null default 30;

alter table public.safe_products
  drop constraint if exists safe_products_purchase_price_type_check;
alter table public.safe_products
  add constraint safe_products_purchase_price_type_check
  check (purchase_price_type in ('net','gross'));

alter table public.safe_products
  drop constraint if exists safe_products_margin_percent_check;
alter table public.safe_products
  add constraint safe_products_margin_percent_check
  check (margin_percent >= 0 and margin_percent < 100);

comment on column public.safe_products.purchase_price_input is
  'Vom Händler eingegebener Einkaufspreis; Netto- oder Bruttobasis gemäß purchase_price_type.';
comment on column public.safe_products.purchase_price_type is
  'net = Einkaufspreis netto; gross = Einkaufspreis brutto mit herauszurechnender 19%-Vorsteuer.';
comment on column public.safe_products.margin_percent is
  'Gewünschte echte Handelsspanne bezogen auf den Nettoverkaufspreis; Standard 30 Prozent.';
