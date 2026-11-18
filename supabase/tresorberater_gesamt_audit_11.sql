-- Tresor-Berater: Gesamt-Audit Paket 11
-- Branch: feature/tresorberater
-- Ausschließlich lesende Bestandsprüfung. Keine INSERT/UPDATE/DELETE/DDL-Befehle.
-- Ziel: Vollständigkeit, Plausibilität und Quellenabdeckung aller aktiven Produkte.
-- NULL bei Sicherheits-/Versicherungsfeldern ist nicht automatisch ein Fehler;
-- Herstellerangaben "nicht zertifiziert" / "nur nach Absprache" stehen ggf. in notes.

-- 1) Gesamtüberblick: aktive Artikel und fehlende Kerndaten
select
  count(*) as aktive_artikel,
  count(*) filter (where nullif(trim(article_number),'') is null) as artikelnummer_fehlt,
  count(*) filter (where nullif(trim(model),'') is null) as modell_fehlt,
  count(*) filter (where height_mm is null or width_mm is null or depth_mm is null) as aussenmasse_unvollstaendig,
  count(*) filter (where inner_height_mm is null or inner_width_mm is null or inner_depth_mm is null) as innenmasse_unvollstaendig,
  count(*) filter (where volume_l is null) as volumen_fehlt,
  count(*) filter (where weight_kg is null) as gewicht_fehlt,
  count(*) filter (where nullif(trim(lock_type),'') is null) as schlossart_fehlt,
  count(*) filter (where nullif(trim(source_reference),'') is null) as quelle_fehlt,
  count(*) filter (where nullif(trim(notes),'') is null) as notiz_fehlt,
  count(*) filter (where nullif(trim(security_standard),'') is null and nullif(trim(security_class),'') is null) as ohne_sicherheitsklassifizierung,
  count(*) filter (where insured_private is null) as versicherung_privat_leer,
  count(*) filter (where insured_commercial is null) as versicherung_gewerblich_leer,
  count(*) filter (where fire_protection_type = 'unknown') as feuerschutz_unbekannt,
  count(*) filter (where sale_price_gross is null) as verkaufspreis_fehlt,
  count(*) filter (where stock_status = 'to_order') as muss_bestellt_werden
from public.safe_products
where active = true;

-- 2) Technische Daten: alle aktiven Produkte mit mindestens einem fehlenden Kernfeld.
-- "Fehlt" bezieht sich hier nur auf vorhandene Tabellenfelder, nicht auf Herstellerpflicht.
select
  article_number, model, category,
  height_mm, width_mm, depth_mm,
  inner_height_mm, inner_width_mm, inner_depth_mm,
  volume_l, weight_kg, lock_type,
  source_reference, notes
from public.safe_products
where active = true
  and (
    height_mm is null or width_mm is null or depth_mm is null
    or inner_height_mm is null or inner_width_mm is null or inner_depth_mm is null
    or volume_l is null or weight_kg is null
    or nullif(trim(lock_type),'') is null
    or nullif(trim(source_reference),'') is null
  )
order by category, model, article_number;

-- 3) Sicherheits-/Versicherungsfelder: nur Datensätze zur fachlichen Sichtprüfung.
-- Keine automatische Bewertung von NULL als fehlerhaft.
select
  article_number, model, category,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, notes
from public.safe_products
where active = true
  and (
    (security_standard is null and security_class is not null)
    or (security_standard is not null and security_class is null)
    or (insured_private is not null and insured_commercial is null)
    or (insured_commercial is not null and insured_private is null)
    or security_standard ilike '%EN 14450%' and security_class not in ('S1','S2')
    or security_standard ilike '%EN 1143-1%' and security_class not in ('0','I','II','III','IV','V','VI','VII','VIII','IX','X')
  )
order by category, model, article_number;

-- 4) Plausibilitätsfehler: ungültige Maße/Gewichte/Volumen und Preiswerte.
select
  article_number, model, category,
  height_mm, width_mm, depth_mm,
  inner_height_mm, inner_width_mm, inner_depth_mm,
  volume_l, weight_kg, sale_price_gross
from public.safe_products
where active = true
  and (
    coalesce(height_mm,0) <= 0
    or coalesce(width_mm,0) <= 0
    or coalesce(depth_mm,0) <= 0
    or coalesce(inner_height_mm,0) < 0
    or coalesce(inner_width_mm,0) < 0
    or coalesce(inner_depth_mm,0) < 0
    or coalesce(volume_l,0) < 0
    or coalesce(weight_kg,0) <= 0
    or coalesce(sale_price_gross,0) < 0
    or (height_mm is not null and inner_height_mm is not null and inner_height_mm > height_mm)
    or (width_mm is not null and inner_width_mm is not null and inner_width_mm > width_mm)
    or (depth_mm is not null and inner_depth_mm is not null and inner_depth_mm > depth_mm)
  )
order by category, model, article_number;

-- 5) Doppelte Artikelnummern (sollte durch Unique Index leer sein).
select article_number, count(*) as anzahl
from public.safe_products
where active = true and nullif(trim(article_number),'') is not null
group by article_number
having count(*) > 1
order by article_number;

-- 6) Verteilung nach Kategorie und Lagerstatus.
select
  category,
  count(*) as artikel_aktiv,
  count(*) filter (where stock_status = 'in_stock') as lagernd,
  count(*) filter (where stock_status = 'to_order') as muss_bestellt_werden
from public.safe_products
where active = true
group by category
order by category;

-- 7) Fehlende Verkaufspreise und Bilder separat, da dies kaufmännische
--    Pflegefelder und keine technischen Produktdaten sind.
select
  article_number, model, category,
  sale_price_gross, image_url, stock_status
from public.safe_products
where active = true
  and (sale_price_gross is null or nullif(trim(image_url),'') is null)
order by category, model, article_number;
