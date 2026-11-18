-- Tresor-Berater: RFID LAP Herstellerklassifizierung Paket 17
-- Branch: feature/tresorberater
-- Quelle: offizielles Rottner Produktdatenblatt T06551.
-- Das Datenblatt nennt ausdrücklich "keine Sicherheitsstufe".
-- Es werden keine Sicherheitsnorm/-klasse und keine Versicherungswerte ergänzt.

begin;

update public.safe_products
set
  source_reference = case
    when position('Rottner Produktdatenblatt T06551' in coalesce(source_reference,'')) > 0
      then source_reference
    else concat_ws('; ', nullif(source_reference,''), 'Rottner Produktdatenblatt T06551')
  end,
  notes = case
    when position('Herstellerklassifizierung: keine Sicherheitsstufe.' in coalesce(notes,'')) > 0
      then notes
    else concat_ws(E'\n', nullif(notes,''), 'Herstellerklassifizierung: keine Sicherheitsstufe. Versicherungswert privat und gewerblich in Deutschland laut Produktdatenblatt nur nach Absprache mit der Versicherung.')
  end,
  security_classification_status = 'no_class',
  updated_at = now()
where article_number = 'T06551'
  and active = true
  and security_standard is null
  and security_class is null;

-- Kontrolle: T06551 muss no_class zeigen; Sicherheits- und Versicherungswerte bleiben NULL.
select
  article_number, model, security_standard, security_class,
  insured_private, insured_commercial,
  security_classification_status, source_reference, notes
from public.safe_products
where article_number = 'T06551';

