-- Tresor-Berater: technische Ergänzung Paket 5
-- Branch: feature/tresorberater
-- Quelle: Rottner-Katalog "Geprüfte Tresore" (Ausgabe 2023/2024),
-- Rottner-Katalog "Ungeprüfte Tresore" (Ausgabe 2023/2024),
-- Rottner-Katalog "Waffenschränke" (Ausgabe 2023/2024).
-- Ergänzt ausschließlich belegte technische Werte. Keine Verkaufspreise.
-- Fehlende Werte (insbesondere Salto Safe Lap) bleiben unverändert NULL.
-- Vor Ausführung: Paket tresorberater_erweiterung.sql muss installiert sein.
-- Werte für Außenmaße: Höhe/Breite/Tiefe in mm; Katalogmaße können Beschläge
-- bzw. Griffe nicht enthalten. Hinweise stehen in den Quellen/Katalogfußnoten.

begin;

with technical (
  article_number, height_mm, width_mm, depth_mm,
  inner_height_mm, inner_width_mm, inner_depth_mm,
  volume_l, weight_kg, lock_type,
  security_standard, security_class,
  insured_private, insured_commercial,
  fire_protection_type, fire_minutes, fire_standard,
  source_reference, source_date, note
) as (
  values
  -- Samoa: Rottner geprüfte Tresore 2023/2024, Seite 4
  ('T04857',660,490,410,580,410,320,76,67,'Doppelbartschloss','EN 1143-1','0',20000,10000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 4','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04858',660,490,410,580,410,320,76,67,'Elektronikschloss','EN 1143-1','0',20000,10000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 4','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04859',860,490,410,780,410,320,102,83,'Doppelbartschloss','EN 1143-1','0',20000,10000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 4','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04860',860,490,410,780,410,320,102,83,'Elektronikschloss','EN 1143-1','0',20000,10000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 4','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04864',1600,850,600,1520,770,510,597,252,'Elektronikschloss','EN 1143-1','0',20000,10000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 4','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),

  -- Monaco: Rottner geprüfte Tresore 2023/2024, Seite 5
  ('T04658',655,435,445,585,370,355,77,83,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 5','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04659',655,435,445,585,370,355,77,83,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 5','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04660',1200,600,500,1135,535,410,249,178,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 5','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04661',1200,600,500,1135,535,410,249,178,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 5','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),

  -- Toscana: Rottner geprüfte Tresore 2023/2024, Seite 6
  ('T04676',300,420,390,220,345,295,22,44,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04677',300,420,390,220,345,295,21,44,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04680',420,350,380,340,275,285,27,48,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04681',420,350,380,340,275,285,27,48,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Beschlag kann zusätzliche Tiefe erfordern.'),
  ('T04684',660,490,410,580,420,310,76,92,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04685',660,490,410,580,420,310,76,92,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04686',860,490,410,780,420,310,98,114.5,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),
  ('T04687',860,490,410,780,420,310,98,114.5,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 6','2023/2024','Außentiefe laut Katalog; Handhebelbeschlag kann zusätzliche Tiefe erfordern.'),

  -- Fire Safe 40: Rottner geprüfte Tresore 2023/2024, Seite 20
  ('T06017',460,440,450,330,330,300,33,71,'Doppelbartschloss','EN 14450','S2',20000,null,'tested',30,'LFS 30 P / EN 15659','Rottner Katalog Geprüfte Tresore 2023/2024, S. 20','2023/2024','Geprüfter Feuerschutz LFS 30 P für Papier.'),
  ('T06018',460,440,450,330,330,300,33,71,'Elektronikschloss','EN 14450','S2',20000,null,'tested',30,'LFS 30 P / EN 15659','Rottner Katalog Geprüfte Tresore 2023/2024, S. 20','2023/2024','Geprüfter Feuerschutz LFS 30 P für Papier.'),

  -- Power Safe: Rottner geprüfte Tresore 2023/2024, Seite 26
  ('T05722',300,445,400,220,365,295,24,26,'Doppelbartschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05723',300,445,400,220,365,295,24,26,'Elektronikschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05724',600,445,400,520,365,295,56,43,'Doppelbartschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05725',600,445,400,520,365,295,56,43,'Elektronikschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05803',800,445,400,720,365,296,77,55,'Doppelbartschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05804',800,445,400,720,365,296,77,55,'Elektronikschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05805',1000,445,400,920,365,296,99,65,'Doppelbartschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),
  ('T05806',1000,445,400,920,365,296,99,65,'Elektronikschloss','EN 14450','S2',20000,null,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 26','2023/2024','Leichter Feuerschutz; Außentiefe kann durch Beschläge um ca. 15 mm steigen.'),

  -- Sydney: Rottner ungeprüfte Tresore 2023/2024, Seite 3
  ('T05924',970,565,450,786,426,301,101,138,'Elektronikschloss',null,null,null,null,'tested',60,'LFS 60 P / EN 15659','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 3','2023/2024','Außenhöhe inklusive Sockel; Außentiefe inklusive Beschlag; Innenhöhe und Volumen inklusive Schublade.'),
  ('T05925',1255,710,580,1035,545,418,236,290,'Elektronikschloss',null,null,null,null,'tested',60,'LFS 60 P / EN 15659','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 3','2023/2024','Außenhöhe inklusive Sockel; Außentiefe inklusive Beschlag; Innenhöhe und Volumen inklusive Schublade.'),

  -- Stone SE 65 EL: Rottner geprüfte Tresore 2023/2024, Seite 29
  ('T04943',630,490,385,530,400,290,61,72,'Elektronikschloss','EN 1143-1','I',65000,20000,'none',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 29','2023/2024','Einwandiger Korpus; in der Quelle ist kein Feuerschutz ausgewiesen.'),

  -- Delta: Rottner geprüfte Tresore 2023/2024, Seite 30
  ('T05807',330,430,270,230,345,200,16,28,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 30','2023/2024','Wandtresor; Einbauvorschriften beachten.'),
  ('T05808',330,430,270,230,345,200,16,28,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 30','2023/2024','Wandtresor; Einbauvorschriften beachten.'),
  ('T05809',430,490,385,330,405,350,46,42,'Doppelbartschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 30','2023/2024','Wandtresor; Einbauvorschriften beachten.'),
  ('T05810',430,490,385,330,405,350,46,42,'Elektronikschloss','EN 1143-1','I',65000,20000,'conditional',null,null,'Rottner Katalog Geprüfte Tresore 2023/2024, S. 30','2023/2024','Wandtresor; Einbauvorschriften beachten.'),

  -- Gunmaster XL: Rottner Waffenschrank-Katalog 2023/2024, Seite 18
  ('T06182',100,370,275,90,300,200,5.4,5.5,'Fingerprint / Zahlencode / Schlüssel',null,null,null,null,'none',null,null,'Rottner Katalog Waffenschränke 2023/2024, S. 18','2023/2024','Laut Rottner in Deutschland nicht für Waffen geeignet; nicht als gesetzeskonformes Waffenbehältnis empfehlen.')
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
  fire_protection_type = case
    when p.fire_protection_type = 'unknown' then t.fire_protection_type
    else p.fire_protection_type
  end,
  fire_minutes = coalesce(p.fire_minutes, t.fire_minutes),
  fire_standard = coalesce(p.fire_standard, t.fire_standard),
  source_reference = coalesce(p.source_reference, t.source_reference),
  source_date = coalesce(p.source_date, t.source_date),
  notes = concat_ws(E'\n', nullif(p.notes,''), t.note),
  updated_at = now()
from technical t
where p.article_number = t.article_number
  and p.active = true;

commit;

-- Ergebnisprüfung: die 35 Datensätze dieses Pakets
select
  article_number, model, category,
  height_mm, width_mm, depth_mm,
  inner_height_mm, inner_width_mm, inner_depth_mm,
  volume_l, weight_kg, lock_type,
  security_standard, security_class,
  insured_private, insured_commercial,
  fire_protection_type, fire_minutes, fire_standard,
  source_reference
from public.safe_products
where article_number in (
'T04857','T04858','T04859','T04860','T04864',
'T04658','T04659','T04660','T04661',
'T04676','T04677','T04680','T04681','T04684','T04685','T04686','T04687',
'T06017','T06018',
'T05722','T05723','T05724','T05725','T05803','T05804','T05805','T05806',
'T05924','T05925','T04943','T05807','T05808','T05809','T05810','T06182'
)
order by category, model, article_number;

-- T06534 Salto Safe Lap ist absichtlich nicht enthalten:
-- Für dieses Modell lag in den geprüften Unterlagen keine belastbare technische Tabelle vor.
