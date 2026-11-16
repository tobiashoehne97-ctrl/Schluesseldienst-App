-- Tresor-Berater: Sicherheits- und Versicherungsstatus Paket 8
-- Produktfamilien: Jupiter, Home Case, Fifty Safe, Vintage.
-- Quellen: offizielle Rottner Produktdatenblätter und Rottner Katalog "Ungeprüfte Tresore" 2023/2024.
-- Ergebnis: Hersteller weist bei diesen Modellen keine zertifizierte Sicherheitsstufe aus.
-- Deutsche Versicherungswerte: jeweils "nach Absprache mit der Versicherung".
-- Daher bleiben security_standard, security_class, insured_private und insured_commercial NULL.
-- Der Herstellerstatus wird nachvollziehbar in notes und source_reference dokumentiert.
-- Keine Preise oder technischen Maßdaten werden in diesem Paket geändert.
-- Idempotent: bestehende Hinweise werden nicht doppelt angehängt.

begin;

with source_data (article_number, source_reference, source_date, note) as (
  values
  -- Jupiter 1-6 family; source catalog includes all lock variants and models.
  ('T06443','Rottner Produktdatenblatt T06443; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06444','Rottner Produktdatenblatt T06444; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06445','Rottner Produktdatenblatt T06445; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06446','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06447','Rottner Produktdatenblatt T06447; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06448','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06449','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06450','Rottner Produktdatenblatt T06450; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06451','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06452','Rottner Produktdatenblatt T06452; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06453','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06454','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06455','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06456','Rottner Produktdatenblatt T06456; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06457','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06458','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 17','2023/2024',
   'Herstellerklassifizierung der Jupiter-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  -- Home Case family
  ('T06370','Rottner Produktdatenblatt T06370; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 16','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06371','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 16','2023/2024',
   'Herstellerklassifizierung der Home-Case-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06372','Rottner Produktdatenblatt T06372; Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 16','2023/2024',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06373','Rottner Katalog Ungeprüfte Tresore 2023/2024, S. 16','2023/2024',
   'Herstellerklassifizierung der Home-Case-Serie: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  -- Fifty Safe
  ('T06376','Rottner Produktdatenblatt T06376','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06377','Rottner Produktdatenblatt T06377','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),

  -- Vintage colours; same documented security and insurance classification
  ('T06505','Rottner Produktdatenblatt Vintage-Serie; Artikelnummer T06505','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06506','Rottner Produktdatenblatt T06506','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06507','Rottner Produktdatenblatt T06507','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'),
  ('T06508','Rottner Produktdatenblatt T06508','Produktdatenblatt',
   'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.')
),
normalized as (
  select
    article_number,
    source_reference,
    source_date,
    coalesce(note,
      'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland jeweils nur nach Absprache mit der Versicherung.'
    ) as note
  from source_data
)
update public.safe_products p
set
  source_reference = case
    when position(n.source_reference in coalesce(p.source_reference,'')) > 0 then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), n.source_reference)
  end,
  source_date = coalesce(p.source_date, n.source_date),
  notes = case
    when position(n.note in coalesce(p.notes,'')) > 0 then p.notes
    else concat_ws(E'\\n', nullif(p.notes,''), n.note)
  end,
  updated_at = now()
from normalized n
where p.article_number = n.article_number
  and p.active = true;

commit;

-- Kontrolle: 26 Artikel aus den vier Produktfamilien
select
  article_number, model, category,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, notes
from public.safe_products
where article_number in (
'T06443','T06444','T06445','T06446','T06447','T06448',
'T06449','T06450','T06451','T06452','T06453','T06454',
'T06455','T06456','T06457','T06458',
'T06370','T06371','T06372','T06373',
'T06376','T06377',
'T06505','T06506','T06507','T06508'
)
order by category, model, article_number;
