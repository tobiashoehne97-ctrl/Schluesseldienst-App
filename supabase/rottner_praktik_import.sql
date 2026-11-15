-- Erstimport: Rottner Praktik (technische Angaben aus Praktik-Flyer, Seiten 1–7)
-- Preise, Versicherungswerte und Feuerschutz bleiben leer, wenn sie in der Quelle nicht belegt sind.
-- Vorher supabase/tresorberater_erweiterung.sql ausführen.
insert into public.safe_products
(manufacturer,model,article_number,category,security_standard,security_class,
 fire_protection_type,fire_minutes,fire_standard,
 height_mm,width_mm,depth_mm,inner_height_mm,inner_width_mm,inner_depth_mm,
 weight_kg,volume_l,lock_type,sale_price_gross,active,source_reference,source_date,notes)
values
('Rottner','Praktik 17 EL','T06592','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,170,310,250,161,296,180,8.5,8.6,'Elektronikschloss',null,true,
 'Praktik-Flyer, Seite 1','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Feuerschutz und Versicherungswerte in dieser Produktquelle nicht angegeben.'),
('Rottner','Praktik 25','T06593','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,250,350,280,241,336,210,13,17,'Doppelbartschloss',null,true,
 'Praktik-Flyer, Seite 2','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Feuerschutz und Versicherungswerte in dieser Produktquelle nicht angegeben.'),
('Rottner','Praktik 25 EL','T06594','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,250,350,280,241,336,210,13,17,'Elektronikschloss',null,true,
 'Praktik-Flyer, Seite 3','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Feuerschutz und Versicherungswerte in dieser Produktquelle nicht angegeben.'),
('Rottner','Praktik 30','T06595','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,290,440,360,281,426,290,19,34.7,'Doppelbartschloss',null,true,
 'Praktik-Flyer, Seite 4','Produktflyer; Artikelnummer/Modellbezeichnung in Rottner-Preisliste 2026','Maße und Gewicht aus der tabellarischen Darstellung im Flyer; vor Veröffentlichung visuell gegenprüfen.'),
('Rottner','Praktik 30 EL','T06596','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,290,440,360,281,426,290,19,34.7,'Elektronikschloss',null,true,
 'Praktik-Flyer, Seite 5','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Feuerschutz und Versicherungswerte in dieser Produktquelle nicht angegeben.'),
('Rottner','Praktik 65','T06597','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,650,440,360,641,426,290,35,79,'Doppelbartschloss',null,true,
 'Praktik-Flyer, Seite 6','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Maße und Gewicht aus der tabellarischen Darstellung im Flyer; vor Veröffentlichung visuell gegenprüfen.'),
('Rottner','Praktik 65 EL','T06598','Wertschutzschrank','EN 14450','S1',
 'unknown',null,null,650,440,360,641,426,290,35.5,79,'Elektronikschloss',null,true,
 'Praktik-Flyer, Seite 7','Produktflyer; zusätzlich Artikelnummer in Rottner-Preisliste 2026','Feuerschutz und Versicherungswerte in dieser Produktquelle nicht angegeben.')
on conflict do nothing;
