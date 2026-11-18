-- Rottner Fachhandelsserien: Titan, Exclusive Blue und Titan Key
-- Technische Daten aus den bereitgestellten Produktflyern.
-- Keine Verkaufspreise importiert; diese pflegt Schlüsseldienst Höhne selbst.
-- Voraussetzung: tresorberater_erweiterung.sql und tresorberater_lagerstatus.sql sind ausgeführt.

insert into public.safe_products
(manufacturer,model,article_number,category,security_standard,security_class,
 fire_protection_type,fire_minutes,fire_standard,
 insured_private,insured_commercial,
 height_mm,width_mm,depth_mm,inner_height_mm,inner_width_mm,inner_depth_mm,
 weight_kg,volume_l,lock_type,sale_price_gross,stock_status,active,
 source_reference,source_date,notes)
values
('Rottner','Titan 30 S2 Fire Blue','T06471','Wertschutzschrank','EN 14450','S2',
 'tested',60,'NT Fire 017',20000,null,
 290,405,355,190,305,215,36,null,'Doppelbart-Hochsicherheitsschloss',null,'to_order',true,
 'Titan-Fachhandelsflyer, Seite 2','Flyer 01/2023','Außentiefe laut Flyer zzgl. 20 mm durch Beschläge. Gewerblicher Versicherungswert laut Quelle auf Anfrage.'),
('Rottner','Titan 30 S2 Fire EL Blue','T06472','Wertschutzschrank','EN 14450','S2',
 'tested',60,'NT Fire 017',20000,null,
 290,405,355,190,305,215,36,null,'Elektronikschloss PS310',null,'to_order',true,
 'Titan-Fachhandelsflyer, Seite 2','Flyer 01/2023','Außentiefe laut Flyer zzgl. 20 mm durch Beschläge. Gewerblicher Versicherungswert laut Quelle auf Anfrage.'),
('Rottner','Titan 65 EN-1 Fire Blue','T06469','Wertschutzschrank','EN 1143-1','I',
 'tested',30,'LFS 30 P',65000,20000,
 655,440,430,574,364,300,166,null,'Doppelbart-Hochsicherheitsschloss',null,'to_order',true,
 'Titan-Fachhandelsflyer, Seite 2','Flyer 01/2023','Außentiefe laut Flyer zzgl. 60 mm durch Beschläge. Feuerschutz 30 Minuten für Papier.'),
('Rottner','Titan 65 EN-1 Fire PS650 Blue','T06470','Wertschutzschrank','EN 1143-1','I',
 'tested',30,'LFS 30 P',65000,20000,
 655,440,430,574,364,300,166,null,'Elektronikschloss PS650',null,'to_order',true,
 'Titan-Fachhandelsflyer, Seite 2','Flyer 01/2023','Außentiefe laut Flyer zzgl. 60 mm durch Beschläge. Feuerschutz 30 Minuten für Papier.'),
('Rottner','Exclusive Blue 40 EL','T06519','Wertschutzschrank','EN 1143-1','I',
 'conditional',null,null,65000,20000,
 300,420,390,220,345,295,46,21,'Elektronikschloss',null,'to_order',true,
 'Exclusive Blue-Flyer 2024, Seite 1','2024','Außentiefe zzgl. 15 mm durch Beschlag. Klassifizierung laut Quelle: EN 1 nach CSN EN 1143-1. Bedingter Feuerschutz.'),
('Rottner','Exclusive Blue 65 EL','T06520','Wertschutzschrank','EN 1143-1','I',
 'conditional',null,null,65000,20000,
 660,490,410,580,420,310,94,76,'Elektronikschloss',null,'to_order',true,
 'Exclusive Blue-Flyer 2024, Seite 2','2024','Außentiefe zzgl. 60 mm durch Beschlag. Klassifizierung laut Quelle: EN 1 nach CSN EN 1143-1. Bedingter Feuerschutz.'),
('Rottner','Titan Key 30','T06467','Schlüsseltresor',null,null,
 'unknown',null,null,null,null,
 300,245,100,295,240,30,6,null,'Elektronikschloss',null,'to_order',true,
 'Titan-Fachhandelsflyer, Seite 2','Flyer 01/2023','Schlüsseltresor; im Flyer mit massivem Stahlschloss-Tresor und elektronischem Zahlenschloss beschrieben.')
on conflict (article_number) where article_number is not null and trim(article_number) <> ''
do update set
 model=excluded.model, category=excluded.category,
 security_standard=excluded.security_standard, security_class=excluded.security_class,
 fire_protection_type=excluded.fire_protection_type, fire_minutes=excluded.fire_minutes,
 fire_standard=excluded.fire_standard, insured_private=excluded.insured_private,
 insured_commercial=excluded.insured_commercial,
 height_mm=excluded.height_mm,width_mm=excluded.width_mm,depth_mm=excluded.depth_mm,
 inner_height_mm=excluded.inner_height_mm,inner_width_mm=excluded.inner_width_mm,
 inner_depth_mm=excluded.inner_depth_mm,weight_kg=excluded.weight_kg,volume_l=excluded.volume_l,
 lock_type=excluded.lock_type,source_reference=excluded.source_reference,
 source_date=excluded.source_date,notes=excluded.notes;
