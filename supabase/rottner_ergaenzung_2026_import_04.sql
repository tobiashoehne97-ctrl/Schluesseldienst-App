-- Rottner Tresor-Berater: Importpaket 4 – Ergänzung Rottner-Lagersortiment 2026
-- Grundlage: Rottner Preisliste 2026, gültig ab 01.05.2026, Seiten 2–5.
-- Enthält ausschließlich klassische Tresore und Waffenschränke; keine Schlüsselorganisation.
-- Es werden KEINE Preise und KEINE unbelegten technischen Daten übernommen.
-- Bestehende Artikelnummern werden nicht überschrieben. Fehlende technische Werte bleiben NULL.
-- Vor Ausführung sicherstellen, dass tresorberater_erweiterung.sql bereits ausgeführt wurde.

begin;

-- Klassifizierungskorrektur: Atlas Fire 45 wird in der Preisliste im Abschnitt
-- "Feuerschutz Tresore" geführt, nicht unter Wertschutzschränke.
update public.safe_products
set category = 'Feuerschutztresor',
    updated_at = now()
where article_number in ('T06205','T06206');

-- Katalogbezeichnungen gemäß Preisliste 2026 vereinheitlichen.
update public.safe_products
set model = 'Yukon 40 S1',
    updated_at = now()
where article_number = 'T06134';

update public.safe_products
set model = 'Gun 8 EL',
    updated_at = now()
where article_number = 'T06536';

insert into public.safe_products
(manufacturer, model, article_number, category,
 fire_protection_type, sale_price_gross, stock_status, active,
 source_reference, source_date, notes)
values
-- Wertschutzschränke
('Rottner','Samoa 65','T04857','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Samoa 65 EL','T04858','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Samoa 85','T04859','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Samoa 85 EL','T04860','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Samoa 160 EL','T04864','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Monaco 65','T04658','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Monaco 65 EL','T04659','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Monaco 120','T04660','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Monaco 120 EL','T04661','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 40','T04676','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 40 EL','T04677','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 50','T04680','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 50 EL','T04681','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 65','T04684','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 65 EL','T04685','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 85','T04686','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Toscana 85 EL','T04687','Wertschutzschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),

-- Feuerschutztresore
('Rottner','Fire Profi 50','T05005','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Diamant Super Fire DO 160 IT','T05941','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Diamant Super Fire DO 160 IT EL','T05942','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 2','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Fire Safe 40','T06017','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Fire Safe 40 EL','T06018','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Sydney 100','T05924','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 4','01.05.2026','Im Abschnitt Feuerschutz-Tresore gelistet; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Sydney 120','T05925','Feuerschutztresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 4','01.05.2026','Im Abschnitt Feuerschutz-Tresore gelistet; technische Produktdaten nicht in dieser Quelle enthalten.'),

-- Möbeltresore
('Rottner','Power Safe 300','T05722','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 300 EL','T05723','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 600 IT','T05724','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 600 IT EL','T05725','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 800 IT','T05803','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 800 IT EL','T05804','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 1000 IT','T05805','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Power Safe 1000 IT EL','T05806','Möbeltresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),

-- Hotelzimmertresore
('Rottner','Salto Safe Lap','T06534','Hotelzimmertresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 4','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),

-- Wandtresore
('Rottner','Stone SE 65 EL','T04943','Wandtresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Delta 30','T05807','Wandtresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Delta 30 EL','T05808','Wandtresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Delta 40','T05809','Wandtresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),
('Rottner','Delta 40 EL','T05810','Wandtresor','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 3','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.'),

-- Waffenschränke
('Rottner','Gunmaster XL','T06182','Waffenschrank','unknown',null,'to_order',true,'Rottner Preisliste 2026, Seite 5','01.05.2026','Artikelnummer und Modellbezeichnung aus der Preisliste; technische Produktdaten nicht in dieser Quelle enthalten.')

on conflict do nothing;

commit;

-- Kontrolle: neu ergänzte Artikel und korrigierte Kategorien
select article_number, model, category, stock_status, sale_price_gross
from public.safe_products
where article_number in (
'T04857','T04858','T04859','T04860','T04864',
'T04658','T04659','T04660','T04661',
'T04676','T04677','T04680','T04681','T04684','T04685','T04686','T04687',
'T05005','T05941','T05942','T06017','T06018','T05924','T05925',
'T05722','T05723','T05724','T05725','T05803','T05804','T05805','T05806',
'T06534','T04943','T05807','T05808','T05809','T05810','T06182',
'T06205','T06206','T06134','T06536'
)
order by category, model, article_number;
