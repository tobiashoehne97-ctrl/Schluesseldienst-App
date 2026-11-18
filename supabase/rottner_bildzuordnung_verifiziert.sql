-- Verifizierte Rottner-Bildzuordnungen für den Tresorberater
-- Nur direkte Herstellerbilder, deren Zuordnung zur Artikelnummer geprüft wurde.
-- Im Supabase SQL Editor ausführen; ändert ausschließlich image_url der genannten Artikel.

begin;

update public.safe_products
set image_url = 'https://www.rottner-tresor.de/media/catalog/product/cache/e3d3bee7991c988401fb975dd2cbc709/r/o/rottner-wandtresor-en1-delta-40-db-T05809_vs.jpg',
    updated_at = now()
where article_number = 'T05809';

update public.safe_products
set image_url = 'https://www.rottner-tresor.de/media/catalog/product/cache/aaef1720c235b40eaaf836ed5dc2768f/r/o/rottner-wertschutzschrank-atlas-fire-45-elektronikschloss-en1-T06206_vs.jpg',
    updated_at = now()
where article_number = 'T06206';

update public.safe_products
set image_url = 'https://www.rottner-tresor.at/media/catalog/product/cache/aaef1720c235b40eaaf836ed5dc2768f/r/o/rottner-wertschutzschrank-fireprofi-50-premium-el-T05006_vs.jpg',
    updated_at = now()
where article_number = 'T05006';

commit;

select article_number, model, image_url
from public.safe_products
where article_number in ('T05809', 'T06206', 'T05006')
order by article_number;
