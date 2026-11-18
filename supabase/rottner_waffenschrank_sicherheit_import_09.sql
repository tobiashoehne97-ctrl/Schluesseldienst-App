-- Tresor-Berater: Waffenschrank-Sicherheitsdaten Paket 9
-- Branch: feature/tresorberater
-- Fokus: Dakota Basic, Yukon S1 sowie Herstellerhinweise zu nicht zertifizierten Modellen.
-- Quellen: Rottner Produktdatenblätter und Rottner Waffenschrank-Katalog 2023.
-- Deutschland: Rottner-Katalog nennt EN 0/EN 1 nach EN 1143-1 als aktuelle Mindestanforderung
-- für neu erworbene Waffenbehältnisse; S1 nach EN 14450 ist KEIN EN-0-Widerstandsgrad.
-- Bitte gesetzliche Einordnung vor Kundenberatung anhand aktueller Rechtslage prüfen.
-- Keine Preise. Bestehende Sicherheitsdaten bleiben erhalten (COALESCE).
-- Keine nicht belegten Versicherungsbeträge werden eingetragen.

begin;

with source_data (
  article_number, security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, note
) as (
  values
  -- Dakota Basic: EN 0 / CSN EN 1143-1; Germany insurance values.
  ('T06414','EN 1143-1','0',40000,10000,
   'Rottner Waffenschrank-Katalog 2023, S. 8; Rottner Produktdatenblatt Dakota Basic',
   '2023 / Produktdatenblatt',
   'Herstellerangabe: EN 0 nach CSN EN 1143-1; deutsche Versicherungsrichtwerte privat bis ca. 40.000 EUR und gewerblich bis ca. 10.000 EUR. Rottner-Katalog bezeichnet das Modell als in Deutschland als Waffenschrank zugelassen. Verankerungsvorgaben beachten.'),
  ('T06415','EN 1143-1','0',40000,10000,
   'Rottner Produktdatenblatt T06415; Rottner Waffenschrank-Katalog 2023, S. 8',
   'Produktdatenblatt / 2023',
   'Herstellerangabe: EN 0 nach CSN EN 1143-1; deutsche Versicherungsrichtwerte privat bis ca. 40.000 EUR und gewerblich bis ca. 10.000 EUR. Rottner-Katalog bezeichnet das Modell als in Deutschland als Waffenschrank zugelassen. Verankerungsvorgaben beachten.'),

  -- Yukon models: S1 according to EN 14450; no German insurer fixed amount.
  ('T06009','EN 14450','S1',null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 7; Rottner Produktdatenblatt Yukon 5 S1',
   '2023 / Produktdatenblatt',
   'Herstellerklassifizierung S1 nach EN 14450. Versicherung privat und gewerblich in Deutschland laut Hersteller nur nach Absprache. S1 ist nicht gleich EN 0 nach EN 1143-1; nicht als regulärer EN-0-Waffenschrank ausweisen.'),
  ('T06390','EN 14450','S1',null,null,
   'Rottner Produktdatenblatt T06390; Rottner Waffenschrank-Katalog 2023, S. 7',
   'Produktdatenblatt / 2023',
   'Herstellerklassifizierung S1 nach EN 14450. Versicherung privat und gewerblich in Deutschland laut Hersteller nur nach Absprache. S1 ist nicht gleich EN 0 nach EN 1143-1; nicht als regulärer EN-0-Waffenschrank ausweisen.'),
  ('T06391','EN 14450','S1',null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 7; Rottner Produktdatenblatt Yukon 8 S1',
   '2023 / Produktdatenblatt',
   'Herstellerklassifizierung S1 nach EN 14450. Versicherung privat und gewerblich in Deutschland laut Hersteller nur nach Absprache. S1 ist nicht gleich EN 0 nach EN 1143-1; nicht als regulärer EN-0-Waffenschrank ausweisen.'),
  ('T06392','EN 14450','S1',null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 7; Rottner Produktdatenblatt Yukon 8 S1 EL',
   '2023 / Produktdatenblatt',
   'Herstellerklassifizierung S1 nach EN 14450. Versicherung privat und gewerblich in Deutschland laut Hersteller nur nach Absprache. S1 ist nicht gleich EN 0 nach EN 1143-1; nicht als regulärer EN-0-Waffenschrank ausweisen.'),
  ('T06394','EN 14450','S1',null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 7; Rottner Produktdatenblatt Yukon 14 S1 EL',
   '2023 / Produktdatenblatt',
   'Herstellerklassifizierung S1 nach EN 14450. Versicherung privat und gewerblich in Deutschland laut Hersteller nur nach Absprache. S1 ist nicht gleich EN 0 nach EN 1143-1; nicht als regulärer EN-0-Waffenschrank ausweisen.'),

  ('T06134','EN 14450','S1',null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 7; Rottner Produktdatenblatt Yukon 40',
   '2023 / Produktdatenblatt',
   'Herstellerklassifizierung S1 nach EN 14450. Rottner weist darauf hin, dass der Yukon 40 in Deutschland nur als Munitionsschrank verwendbar ist. Versicherung privat und gewerblich in Deutschland nur nach Absprache.'),

  -- Non-certified models: manufacturer warning for Germany; no insurance amount.
  ('T06395',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 14',
   '2023',
   'Herstellerhinweis: nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T04712',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 12',
   '2023',
   'Herstellerhinweis: Einbruchsicherheit nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T05983',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 12',
   '2023',
   'Herstellerhinweis: Einbruchsicherheit nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T04647',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 13',
   '2023',
   'Herstellerhinweis: Einbruchsicherheit nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T05984',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 13',
   '2023',
   'Herstellerhinweis: Einbruchsicherheit nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T06387',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 15',
   '2023',
   'Herstellerhinweis: nicht zertifiziert; in Deutschland laut Rottner nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T06182',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 18',
   '2023',
   'Herstellerhinweis: in Deutschland nicht für Waffen geeignet. Nicht als gesetzeskonformes Waffenbehältnis empfehlen; keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T04269',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 16',
   '2023',
   'Herstellerhinweis zur Gun-5-Serie: nicht zertifiziert; in Deutschland nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T05752',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 16',
   '2023',
   'Herstellerhinweis zur Gun-5-Serie: nicht zertifiziert; in Deutschland nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.'),
  ('T06094',null,null,null,null,
   'Rottner Produktdatenblatt T06094; Rottner Waffenschrank-Katalog 2023, S. 16',
   'Produktdatenblatt / 2023',
   'Herstellerhinweis zur Gun-5-Cargo-Serie: keine Sicherheitsstufe; in Deutschland nur als Munitionsschrank verwendbar. Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung.'),
  ('T06327',null,null,null,null,
   'Rottner Waffenschrank-Katalog 2023, S. 16',
   '2023',
   'Herstellerhinweis zur Gun-5-Cargo-Serie: nicht zertifiziert; in Deutschland nur als Munitionsschrank verwendbar. Keine zertifizierte Sicherheitsstufe und kein fester deutscher Versicherungswert ausgewiesen.')
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

-- Kontrolle der 19 geprüften Datensätze
select
  article_number, model, category,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, notes
from public.safe_products
where article_number in (
'T06414','T06415','T06134',
'T06009','T06390','T06391','T06392','T06394',
'T06395','T04712','T05983','T04647','T05984','T06387',
'T06182','T04269','T05752','T06094','T06327'
)
order by category, model, article_number;

-- Bewusst nicht in dieses Paket aufgenommen:
-- T06379 Fifty Gun, T06119 Gun 1, T06535 Gun 8 Cargo, T06536 Gun 8 EL.
-- Für diese Varianten wurden in den vorliegenden offiziellen Unterlagen keine
-- artikelnummerngenauen, ausreichend belastbaren Klassifizierungsdaten gefunden.
