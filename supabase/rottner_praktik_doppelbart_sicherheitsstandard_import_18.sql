-- Tresor-Berater: Praktik Doppelbartschlösser Sicherheitsstandard Paket 18
-- Branch: feature/tresorberater
-- Hersteller-Produktdatenblätter geprüft:
-- T06591: Rottner Produktdatenblatt T06591, Rottner-Trezory SK.
-- T06595: Rottner Produktdatenblatt T06595, Rottner-Tresor CH.
-- Beide Herstellerunterlagen nennen S1 nach EN 14450 SZU.
-- Es werden nur security_standard und Quellen-/Hinweisfelder ergänzt.
-- security_class bleibt S1; Versicherungswerte, Feuerschutz und Technik bleiben unverändert.

begin;

with source_data (article_number, source_reference, source_date, note) as (
  values
  ('T06591',
   'Rottner Produktdatenblatt T06591, Rottner-Trezory SK (rottner-trezory.sk/product/print/sk/T06591)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Rottner-Produktdatenblatt: S1 nach EN 14450 SZU.'),
  ('T06595',
   'Rottner Produktdatenblatt T06595, Rottner-Tresor CH (rottner-tresor.ch/product/print/de/T06595)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Rottner-Produktdatenblatt: S1 nach EN 14450 SZU.')
)
update public.safe_products p
set
  security_standard = 'EN 14450',
  source_reference = case
    when position(s.source_reference in coalesce(p.source_reference,'')) > 0
      then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), s.source_reference)
  end,
  source_date = coalesce(p.source_date, s.source_date),
  notes = case
    when position(s.note in coalesce(p.notes,'')) > 0
      then p.notes
    else concat_ws(E'\n', nullif(p.notes,''), s.note)
  end,
  security_classification_status = 'certified',
  updated_at = now()
from source_data s
where p.article_number = s.article_number
  and p.active = true
  and p.security_class = 'S1';

commit;

-- Kontrolle: beide Artikel müssen EN 14450 / S1 / certified zeigen.
-- Versicherungswerte werden nur angezeigt und nicht verändert.
select
  article_number, model, security_standard, security_class,
  insured_private, insured_commercial,
  security_classification_status, source_reference, source_date, notes
from public.safe_products
where article_number in ('T06591','T06595')
order by article_number;
