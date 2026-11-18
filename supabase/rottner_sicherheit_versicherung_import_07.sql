-- Tresor-Berater: Sicherheits- und Versicherungsdaten Paket 7
-- Fokus: Rottner Einwurftresore Cashmatic und Schubladentresore System D1.
-- Quellen: offizielle Rottner Produktdatenblätter; Rottner Katalog Geprüfte Tresore 2023/2024.
-- Deutschlandwerte werden verwendet. Keine Preise werden importiert.
-- Cashmatic: Hersteller nennt ausdrücklich KEINE Sicherheitsstufe und Versicherung nach Absprache.
-- D1: Hersteller nennt D1 nach ECB-S; Katalog ordnet das System ECB-S 2450 / EN 1143-1 Klasse 1 zu.
-- Idempotent: bestehende Angaben werden nicht überschrieben; Quellenhinweise werden nicht doppelt angehängt.

begin;

with source_data (
  article_number, security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, note
) as (
  values
  ('T06169','EN 1143-1 / ECB-S','D1',65000,20000,
   'Rottner Produktdatenblatt T06169; Rottner Katalog Geprüfte Tresore 2023/2024',
   'Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: D1 nach ECB-S; Versicherungsrichtwerte Deutschland.'),
  ('T06172','EN 1143-1 / ECB-S','D1',65000,20000,
   'Rottner Produktdatenblatt T06172; Rottner Katalog Geprüfte Tresore 2023/2024',
   'Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: D1 nach ECB-S; Versicherungsrichtwerte Deutschland.'),
  ('T05890','EN 1143-1 / ECB-S','D1',65000,20000,
   'Rottner Produktdatenblatt T05890; Rottner Katalog Geprüfte Tresore 2023/2024',
   'Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: D1 nach ECB-S; Versicherungsrichtwerte Deutschland.'),
  ('T05893','EN 1143-1 / ECB-S','D1',65000,20000,
   'Rottner Produktdatenblatt T05893; Rottner Katalog Geprüfte Tresore 2023/2024',
   'Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: D1 nach ECB-S; Versicherungsrichtwerte Deutschland.'),

  ('T04723',null,null,null,null,
   'Rottner Produktdatenblatt T04723',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung.'),
  ('T04724',null,null,null,null,
   'Rottner Produktdatenblatt T04724',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung.'),
  ('T06204',null,null,null,null,
   'Rottner Produktdatenblatt T06204',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung.')
)
update public.safe_products p
set
  security_standard = coalesce(p.security_standard, s.security_standard),
  security_class = coalesce(p.security_class, s.security_class),
  insured_private = coalesce(p.insured_private, s.insured_private),
  insured_commercial = coalesce(p.insured_commercial, s.insured_commercial),
  source_reference = case
    when position(s.source_reference in coalesce(p.source_reference,'')) > 0 then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), s.source_reference)
  end,
  source_date = coalesce(p.source_date, s.source_date),
  notes = case
    when position(s.note in coalesce(p.notes,'')) > 0 then p.notes
    else concat_ws(E'\\n', nullif(p.notes,''), s.note)
  end,
  updated_at = now()
from source_data s
where p.article_number = s.article_number
  and p.active = true;

commit;

-- Kontrolle: vier D1- und drei Cashmatic-Artikel
select
  article_number, model, category,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, notes
from public.safe_products
where article_number in ('T06169','T06172','T05890','T05893','T04723','T04724','T06204')
order by category, model, article_number;
