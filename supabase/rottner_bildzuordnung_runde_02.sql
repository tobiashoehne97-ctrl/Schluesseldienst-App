-- Bildzuordnung Runde 2: ausschließlich direkt verifizierte Rottner-Herstellerbilder
-- Artikelnummern wurden gegen die Produktseiten und Katalogdaten abgeglichen.
-- Keine Bildzuordnung für Varianten ohne eindeutig verifiziertes Herstellerbild.
-- Manuell im Supabase SQL Editor ausführen.

begin;

update public.safe_products
set image_url = 'https://www.rottner-tresor.de/media/catalog/product/cache/aaef1720c235b40eaaf836ed5dc2768f/r/o/rottner-wertschutzschrank-atlas-fire-45-elektronikschloss-en1-T06206_vs.jpg',
    updated_at = now()
where article_number = 'T06206';

update public.safe_products
set image_url = 'https://www.rottner-tresor.at/media/catalog/product/cache/aaef1720c235b40eaaf836ed5dc2768f/r/o/rottner-wertschutzschrank-fireprofi-50-premium-el-T05006_vs.jpg',
    updated_at = now()
where article_number = 'T05006';

commit;

-- Kontrolle
select article_number, model, image_url
from public.safe_products
where article_number in ('T06206','T05006')
order by article_number;
