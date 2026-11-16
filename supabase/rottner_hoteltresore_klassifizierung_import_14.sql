-- Tresor-Berater: Klassifizierungsprüfung Paket 14
-- Branch: feature/tresorberater
-- Fokus: Neptun Laptop, Prestige 200/250/500/LAP und Motion 1.
-- Quellen: Rottner Produktdatenblatt T06202; Rottner Katalog Ungeprüfte Tresore
-- 2023/2024 (Prestige); Rottner Katalog Waffenschränke 2023/2024 (Motion & Cover Chest).
-- Es werden keine Sicherheitsklassen oder Versicherungswerte erfunden.
-- Bestehende Sicherheits-/Versicherungsfelder bleiben unverändert.
-- T06534 Salto Safe Lap ist nicht enthalten.

begin;

with source_data (article_number, source_reference, source_date, note) as (
  values
  ('T06202',
   'Rottner Produktdatenblatt T06202; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 21',
   'Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  ('T06148',
   'Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 20 (Prestige-Serie)',
   'Katalog 2023/2024',
   'Prestige-Serie im Rottner-Katalog „Ungeprüfte Tresore“ geführt; als einwandiger Möbeleinsatztresor beschrieben. Versicherung laut Hersteller nur nach Absprache. Keine zertifizierte Einbruch-Sicherheitsklasse in der Produktunterlage ausgewiesen.'),

  ('T06149',
   'Rottner Produktdatenblatt T06149; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 20 (Prestige-Serie)',
   'Produktdatenblatt / Katalog 2023/2024',
   'Prestige-Serie im Rottner-Katalog „Ungeprüfte Tresore“ geführt; als einwandiger Möbeleinsatztresor beschrieben. Versicherung privat und gewerblich in Deutschland laut Produktdatenblatt nur nach Absprache. Keine zertifizierte Einbruch-Sicherheitsklasse in der Produktunterlage ausgewiesen.'),

  ('T06150',
   'Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 20 (Prestige-Serie)',
   'Katalog 2023/2024',
   'Prestige-Serie im Rottner-Katalog „Ungeprüfte Tresore“ geführt; als einwandiger Möbeleinsatztresor beschrieben. Versicherung laut Hersteller nur nach Absprache. Keine zertifizierte Einbruch-Sicherheitsklasse in der Produktunterlage ausgewiesen.'),

  ('T06151',
   'Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 20 (Prestige-Serie)',
   'Katalog 2023/2024',
   'Prestige-Serie im Rottner-Katalog „Ungeprüfte Tresore“ geführt; als einwandiger Möbeleinsatztresor beschrieben. Versicherung laut Hersteller nur nach Absprache. Keine zertifizierte Einbruch-Sicherheitsklasse in der Produktunterlage ausgewiesen.'),

  ('T06152',
   'Rottner Katalog Waffenschränke 2023/2024, S. 20 (Motion & Cover Chest)',
   'Katalog 2023/2024',
   'Motion 1 im Rottner-Katalog als einwandiger Schubladentresor beschrieben; Versicherbarkeit laut Hersteller nur nach Absprache. Die Produktunterlage weist keine zertifizierte Einbruch-Sicherheitsklasse aus.')
),
normalized as (
  select
    article_number,
    source_reference,
    source_date,
    note
  from source_data
)
update public.safe_products p
set
  source_reference = case
    when position(n.source_reference in coalesce(p.source_reference,'')) > 0
      then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), n.source_reference)
  end,
  source_date = coalesce(p.source_date, n.source_date),
  notes = case
    when position(n.note in coalesce(p.notes,'')) > 0
      then p.notes
    else concat_ws(E'\\n', nullif(p.notes,''), n.note)
  end,
  updated_at = now()
from normalized n
where p.article_number = n.article_number
  and p.active = true;

commit;

-- Kontrolle: sechs Artikel; Sicherheits- und Versicherungsfelder bleiben unverändert.
select
  article_number, model, security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, notes
from public.safe_products
where article_number in ('T06202','T06148','T06149','T06150','T06151','T06152')
order by article_number;
