-- Test-Bildzuordnung: ausschließlich offiziell verifiziertes Rottner-Produktbild
-- Quelle: Rottner Produktseite Delta 40, Artikelnummer T05809
-- Bild-URL wurde direkt aus der offiziellen Produktgalerie übernommen.
-- Dieses Skript manuell im Supabase SQL Editor ausführen.

update public.safe_products
set image_url = 'https://www.rottner-tresor.de/media/catalog/product/cache/e3d3bee7991c988401fb975dd2cbc709/r/o/rottner-wandtresor-en1-delta-40-db-T05809_vs.jpg',
    updated_at = now()
where article_number = 'T05809';

-- Kontrolle der Testzuordnung
select article_number, model, image_url
from public.safe_products
where article_number = 'T05809';
