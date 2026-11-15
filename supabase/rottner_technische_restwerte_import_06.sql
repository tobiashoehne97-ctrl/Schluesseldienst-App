-- Tresor-Berater: technische Restdaten Paket 6
-- Branch: feature/tresorberater
-- Enthält ausschließlich belastbare Ergänzungen für Artikelnummern aus der Restlückenprüfung.
-- KEINE Preise. Bestehende Werte bleiben erhalten (COALESCE).
-- Quellen: Rottner Fachhandels-Flyer / Produktdatenblätter.
-- Bei widersprüchlichen Feuerschutzangaben werden Feuerwerte bewusst nicht ergänzt.

begin;

with technical (
  article_number, height_mm, width_mm, depth_mm,
  inner_height_mm, inner_width_mm, inner_depth_mm,
  volume_l, weight_kg, lock_type,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, source_date, note
) as (
  values
  -- Titan Key 30: Rottner Fachhandels-Flyer, Stand 01/2023;
  -- ergänzende Rottner Produktdatenblatt-Kopie mit Innenmaßen, Volumen und Gewicht.
  ('T06467',300,245,100,295,240,30,2,6.5,'Elektronikschloss mit Mastercode und mechanischer Schlüssel-Notöffnung',
   null,null,null,null,
   'Rottner Fachhandels-Flyer / Rottner Produktdatenblatt Titan Key 30','01/2023 bzw. Produktdatenblatt',
   'Einwandiger Schlüsseltresor; Außentiefe erhöht sich durch Beschläge um 10 mm. Keine ausgewiesene Sicherheitsstufe.'),

  -- Titan 30: Abmessungen beider Varianten aus Rottner Fachhandels-Flyer.
  ('T06471',290,405,355,190,305,215,null,null,'Doppelbartschloss',
   'EN 14450','S2',20000,null,
   'Rottner Fachhandels-Flyer Titan 30 S2 Fire Blue / S2 Fire EL Blue, S. 1','Stand 01/2023',
   'Außentiefe erhöht sich durch Beschläge um 20 mm. Rottner-Flyer nennt 30 Minuten LFS 30 P; Feuerwert wegen abweichender Produktdatenblatt-Angabe der EL-Variante nicht automatisiert übernommen.'),

  ('T06472',290,405,355,190,305,213,12,39.5,'Elektronikschloss',
   'EN 14450','S2',20000,null,
   'Rottner Produktdatenblatt Titan 30 S2 Fire EL Blue; Maße zusätzlich Rottner Fachhandels-Flyer','Produktdatenblatt; Flyer Stand 01/2023',
   'Außentiefe erhöht sich durch Beschläge um 20 mm. Produktdatenblatt nennt 60 Minuten Feuerschutz nach EN 15659 BG, während der Rottner-Fachhandels-Flyer für die Titan-30-Serie 30 Minuten LFS 30 P nennt. Daher fire_minutes/fire_standard bewusst nicht gesetzt; bitte Herstellerklärung einholen.'),

  -- Titan 65: Maße/Sicherheits- und Versicherungswerte aus Rottner Fachhandels-Flyer;
  -- Gewicht, Volumen und Innenmaße zusätzlich durch Händler-Produktdaten, SKU abgeglichen.
  ('T06469',655,440,430,574,364,300,63,164,'Doppelbartschloss',
   'EN 1143-1','I',65000,20000,
   'Rottner Fachhandels-Flyer Titan 65 EN-1 Fire; ergänzende Produktdaten T06469','Stand 01/2023 / Produktdaten',
   'Außentiefe erhöht sich durch Beschläge um 60 mm. Feuerschutz laut Rottner-Flyer 30 Minuten LFS 30 P / EN 15659 BG.'),

  ('T06470',655,440,430,574,364,300,63,164,'Elektronikschloss PS650 mit SOS-Notfallschlüssel',
   'EN 1143-1','I',65000,20000,
   'Rottner Fachhandels-Flyer Titan 65 EN-1 Fire; ergänzende Produktdaten T06470','Stand 01/2023 / Produktdaten',
   'Außentiefe erhöht sich durch Beschläge um 60 mm. Feuerschutz laut Rottner-Flyer 30 Minuten LFS 30 P / EN 15659 BG.')
)
update public.safe_products p
set
  height_mm = coalesce(p.height_mm, t.height_mm),
  width_mm = coalesce(p.width_mm, t.width_mm),
  depth_mm = coalesce(p.depth_mm, t.depth_mm),
  inner_height_mm = coalesce(p.inner_height_mm, t.inner_height_mm),
  inner_width_mm = coalesce(p.inner_width_mm, t.inner_width_mm),
  inner_depth_mm = coalesce(p.inner_depth_mm, t.inner_depth_mm),
  volume_l = coalesce(p.volume_l, t.volume_l),
  weight_kg = coalesce(p.weight_kg, t.weight_kg),
  lock_type = coalesce(p.lock_type, t.lock_type),
  security_standard = coalesce(p.security_standard, t.security_standard),
  security_class = coalesce(p.security_class, t.security_class),
  insured_private = coalesce(p.insured_private, t.insured_private),
  insured_commercial = coalesce(p.insured_commercial, t.insured_commercial),
  source_reference = coalesce(p.source_reference, t.source_reference),
  source_date = coalesce(p.source_date, t.source_date),
  notes = concat_ws(E'\n', nullif(p.notes,''), t.note),
  updated_at = now()
from technical t
where p.article_number = t.article_number
  and p.active = true;

commit;

-- Kontrolle der fünf aktualisierten Artikel
select article_number, model, category,
       height_mm, width_mm, depth_mm,
       inner_height_mm, inner_width_mm, inner_depth_mm,
       volume_l, weight_kg, lock_type,
       security_standard, security_class,
       insured_private, insured_commercial,
       fire_protection_type, fire_minutes, fire_standard,
       source_reference, notes
from public.safe_products
where article_number in ('T06467','T06471','T06472','T06469','T06470')
order by article_number;

-- T06534 Salto Safe Lap ist bewusst nicht enthalten:
-- Für genau diese Artikelnummer wurde keine verifizierbare Herstellerquelle gefunden.
-- Ähnliche RFID-Safe-Lap-Modelle mit anderer Artikelnummer dürfen nicht übertragen werden.
