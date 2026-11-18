-- Tresor-Berater: Herstellerprüfung Sicherheitsklassifizierung Paket 13
-- Branch: feature/tresorberater
-- Ausschließlich Dokumentation der in Herstellerunterlagen belegten Klassifizierungsangaben.
-- Keine Sicherheitsklasse wird erfunden oder ergänzt. Alle NULL-Werte bleiben erhalten.
-- Versicherungswerte, Preise, Lagerstatus und technische Daten bleiben unverändert.
-- T06534 Salto Safe Lap bleibt ausdrücklich ausgenommen.

begin;

with source_data (article_number, source_reference, source_date, note) as (
  values
  -- Fire Data: Herstellerkatalog weist UL-Feuerschutz aus, aber keine Einbruch-Sicherheitsklasse.
  ('T06349','Rottner Katalog Ungeprüfte Tresore 2023/2024, Abschnitt Fire Data','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage nennt UL-geprüften Feuerschutz (120 Minuten für Dokumente), aber keine Einbruch-Sicherheitsklasse. UL-Feuerschutz nicht als Einbruchschutzklasse interpretieren.'),
  ('T06350','Rottner Katalog Ungeprüfte Tresore 2023/2024, Abschnitt Fire Data','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage nennt UL-geprüften Feuerschutz (120 Minuten für Dokumente), aber keine Einbruch-Sicherheitsklasse. UL-Feuerschutz nicht als Einbruchschutzklasse interpretieren.'),
  ('T06351','Rottner Katalog Ungeprüfte Tresore 2023/2024, Abschnitt Fire Data & Fire Data Box','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage nennt UL-geprüften Feuerschutz (30 Minuten für Dokumente), aber keine Einbruch-Sicherheitsklasse. UL-Feuerschutz nicht als Einbruchschutzklasse interpretieren.'),
  ('T06352','Rottner Katalog Ungeprüfte Tresore 2023/2024, Abschnitt Fire Data & Fire Data Box','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage nennt UL-geprüften Feuerschutz (30 Minuten für Dokumente), aber keine Einbruch-Sicherheitsklasse. UL-Feuerschutz nicht als Einbruchschutzklasse interpretieren.'),
  ('T06353','Rottner Katalog Ungeprüfte Tresore 2023/2024, Abschnitt Fire Data & Fire Data Box','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage nennt UL-geprüften Feuerschutz (30 Minuten für Dokumente), aber keine Einbruch-Sicherheitsklasse. UL-Feuerschutz nicht als Einbruchschutzklasse interpretieren.'),

  ('T06203','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 6; Rottner Produktdatenblatt T06203','2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage weist LFS 60 P nach EN 15659 (60 Minuten für Papier) aus. Eine Einbruch-Sicherheitsklasse wird in dieser Unterlage nicht genannt.'),

  ('T05924','Rottner Produktdatenblatt T05924; Rottner Katalog Ungeprüfte Tresore 2023/2024','Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Separat ausgewiesen sind 60 Minuten leichter Feuerschutz für Dokumente nach EN 15659 BG.'),
  ('T05925','Rottner Produktdatenblatt T05925; Rottner Katalog Ungeprüfte Tresore 2023/2024','Produktdatenblatt / Katalog 2023/2024',
   'Klassifizierungsprüfung: Herstellerunterlage weist 60 Minuten leichten Feuerschutz für Dokumente nach EN 15659 BG aus. Eine Einbruch-Sicherheitsklasse wird in dieser Produktunterlage nicht genannt.'),

  ('T06530','Rottner Produktdatenblatt T06530','Produktdatenblatt, Abruf 2026',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06195','Rottner Produktdatenblatt T06195','Produktdatenblatt, Abruf 2026',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  ('T06213','Rottner Produktdatenblatt T06213','Produktdatenblatt, Abruf 2026',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06214','Rottner Produktdatenblatt T06214','Produktdatenblatt, Abruf 2026',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  ('T06208','Rottner Produktdatenblatt T06208; Rottner Katalog Waffenschränke 2023/2024, S. 20','Produktdatenblatt / Katalog 2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.')
)
update public.safe_products p
set
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
  and p.security_standard is null
  and p.security_class is null;

commit;

-- Kontrolle: 13 Artikel mit dokumentiertem Prüfstatus
select
  article_number, model, security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, notes
from public.safe_products
where article_number in (
  'T06349','T06350','T06351','T06352','T06353','T06203',
  'T05924','T05925','T06530','T06195','T06213','T06214','T06208'
)
order by article_number;

-- Bewusst nicht enthalten: T06534 Salto Safe Lap, T06202 Neptun Laptop,
-- T06148/T06149/T06150/T06151 Prestige, T06152 Motion 1.
-- Für diese Artikel wird die Klassifizierung erst nach weiterer Einzelprüfung dokumentiert.
