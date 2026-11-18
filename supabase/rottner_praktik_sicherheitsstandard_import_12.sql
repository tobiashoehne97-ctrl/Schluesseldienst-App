-- Tresor-Berater: Sicherheitsstandard Praktik – Bereinigung Paket 12
-- Branch: feature/tresorberater
-- Quelle: offizielle Rottner Produktdatenblätter der jeweiligen Artikelnummern.
-- Es wird ausschließlich der belegte Standard ergänzt.
-- Versicherungswerte und Feuerschutz bleiben unverändert.
-- T06591 und T06595 sind bewusst nicht enthalten, da für diese beiden Artikel
-- in dieser Prüfung kein einzelnes Produktdatenblatt verifiziert werden konnte.
-- T06534 Salto Safe Lap bleibt ebenfalls unverändert.

begin;

with source_data (article_number, source_reference, source_date, note) as (
  values
  ('T06592',
   'Rottner Produktdatenblatt T06592 (S1 Praktik 17 EL)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.'),
  ('T06593',
   'Rottner Produktdatenblatt T06593 (S1 Praktik 25 DB)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.'),
  ('T06594',
   'Rottner Produktdatenblatt T06594 (S1 Praktik 25 EL)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.'),
  ('T06596',
   'Rottner Produktdatenblatt T06596 (S1 Praktik 30 EL)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.'),
  ('T06597',
   'Rottner Produktdatenblatt T06597 (S1 Praktik 65 DB)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.'),
  ('T06598',
   'Rottner Produktdatenblatt T06598 (S1 Praktik 65 EL)',
   'Produktdatenblatt, Abruf 2026',
   'Sicherheitsstufe laut Hersteller: S1 nach EN 14450 SZU.')
)
update public.safe_products p
set
  security_standard = coalesce(p.security_standard, 'EN 14450'),
  source_reference = case
    when position(s.source_reference in coalesce(p.source_reference,'')) > 0
      then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), s.source_reference)
  end,
  source_date = coalesce(p.source_date, s.source_date),
  notes = case
    when position(s.note in coalesce(p.notes,'')) > 0
      then p.notes
    else concat_ws(E'\\n', nullif(p.notes,''), s.note)
  end,
  updated_at = now()
from source_data s
where p.article_number = s.article_number
  and p.active = true
  and p.security_class = 'S1';

commit;

-- Kontrolle: Es müssen sechs aktive Artikel mit S1 nach EN 14450 erscheinen.
select
  article_number, model, security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, notes
from public.safe_products
where article_number in ('T06592','T06593','T06594','T06596','T06597','T06598')
order by article_number;
