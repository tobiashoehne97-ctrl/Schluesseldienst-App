-- Tresor-Berater: Korrektur Klassifizierungsstatus Paket 16
-- Branch: feature/tresorberater
-- Korrigiert vier false negatives aus Paket 15.
-- Es werden ausschließlich Statuswerte gesetzt; keine Normen, Klassen,
-- Versicherungswerte oder Herstellertexte verändert.
--
-- Die Hersteller-/Prüfnotizen dokumentieren:
-- T06203: keine Einbruch-Sicherheitsklasse in der Unterlage genannt.
-- T05925: keine Einbruch-Sicherheitsklasse in der Produktunterlage genannt.
-- T06467: keine ausgewiesene Sicherheitsstufe.
-- T06182: keine zertifizierte Sicherheitsstufe.
--
-- T06534, T06551, T02474, T06591 und T06595 bleiben unverified.

begin;

update public.safe_products
set
  security_classification_status = 'no_class',
  updated_at = now()
where active = true
  and article_number in ('T06203','T05925','T06467','T06182')
  and security_standard is null
  and security_class is null;

commit;

-- Kontrolle: vier Artikel müssen no_class zeigen.
select
  article_number, model, security_standard, security_class,
  security_classification_status, notes
from public.safe_products
where article_number in ('T06203','T05925','T06467','T06182')
order by article_number;

-- Kontrolle: diese fünf Artikel bleiben ungeklärt und werden nicht verändert.
select
  article_number, model, security_standard, security_class,
  security_classification_status, source_reference, notes
from public.safe_products
where article_number in ('T06534','T06551','T02474','T06591','T06595')
order by article_number;
