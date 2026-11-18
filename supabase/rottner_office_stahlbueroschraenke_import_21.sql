-- Tresor-Berater: Import der sechs fehlenden Rottner Office-Stahlbüroschränke
-- Branch: feature/tresorberater
-- Quelle: Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5 (Artikelnummern/Modellnamen).
-- Es werden ausschließlich die sechs im Sortimentsaudit fehlenden Artikel angelegt.
-- Keine technischen Daten, Sicherheitsklassen, Versicherungswerte oder Preise werden geschätzt.
-- Lagerstatus initial "Muss bestellt werden"; technische Daten und Verkaufspreise bleiben zur manuellen Pflege.
-- Bereits vorhandene Artikelnummern werden nicht überschrieben.

begin;

with source_data (
  article_number, model, category, family_name, source_reference, source_date, notes
) as (
  values
    ('T05029', 'Office 1',    'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.'),
    ('T05030', 'Office 1 EL', 'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.'),
    ('T05033', 'Office 3',    'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.'),
    ('T05034', 'Office 3 EL', 'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.'),
    ('T05035', 'Office 4',    'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.'),
    ('T05036', 'Office 4 EL', 'Stahlbüroschrank', 'Office',
     'Rottner-Preisliste 2026, Stand 01.05.2026, Seiten 2-5',
     'Preisliste 2026',
     'Artikel aus Rottner-Preisliste 2026 ergänzt. Technische Produktdaten, Sicherheitsklassifizierung und Verkaufspreis sind noch nicht verifiziert und manuell zu pflegen.')
)
insert into public.safe_products (
  manufacturer, model, article_number, category,
  stock_status, active, source_reference, source_date, family_name, notes
)
select
  'Rottner', s.model, s.article_number, s.category,
  'to_order', true, s.source_reference, s.source_date, s.family_name, s.notes
from source_data s
where not exists (
  select 1
  from public.safe_products p
  where p.article_number = s.article_number
);

commit;

-- Kontrolle: Es müssen sechs aktive Office-Artikel mit der Kategorie Stahlbüroschrank erscheinen.
select
  article_number, model, category, active, stock_status,
  security_standard, security_class, fire_protection_type,
  insured_private, insured_commercial,
  height_mm, width_mm, depth_mm, weight_kg, volume_l,
  sale_price_gross, source_reference, source_date, notes
from public.safe_products
where article_number in ('T05029','T05030','T05033','T05034','T05035','T05036')
order by article_number;
