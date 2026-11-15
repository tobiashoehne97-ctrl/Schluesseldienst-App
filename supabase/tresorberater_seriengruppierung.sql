-- Seriengruppierung für die Kundenberatung
alter table public.safe_products
add column if not exists family_name text;

-- Praktik: alle Größen und Schlossvarianten unter einer Serienkachel
update public.safe_products
set family_name='Praktik'
where manufacturer ilike 'Rottner' and model ilike 'Praktik %';

-- Exclusive Blue: beide Größen unter einer gemeinsamen Serienkachel
update public.safe_products
set family_name='Exclusive Blue EL'
where manufacturer ilike 'Rottner' and model ilike 'Exclusive Blue %';

-- Titan-Fachhandelsserie: Varianten werden gemeinsam angeboten
update public.safe_products
set family_name='Titan Fire Blue'
where manufacturer ilike 'Rottner' and model ilike 'Titan % Fire%Blue%';

-- Titan Key bleibt als eigene Serie sichtbar
update public.safe_products
set family_name='Titan Key'
where manufacturer ilike 'Rottner' and model ilike 'Titan Key %';
