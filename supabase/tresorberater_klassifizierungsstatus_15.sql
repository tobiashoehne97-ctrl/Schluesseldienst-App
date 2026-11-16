-- Tresor-Berater: Klassifizierungsstatus Paket 15
-- Branch: feature/tresorberater
-- Additive Schema-Erweiterung. Bestehende Sicherheits- und Versicherungswerte
-- werden nicht verändert. Die Kennzeichnung bezieht sich ausschließlich auf
-- den Nachweis einer Einbruch-Sicherheitsklasse.
--
-- Status:
-- certified   = Sicherheitsstandard UND Sicherheitsklasse sind eingetragen.
-- no_class    = vorhandene Hersteller-/Prüfnotiz dokumentiert ausdrücklich,
--               dass keine Sicherheitsklasse ausgewiesen/nicht zertifiziert ist.
-- unverified  = derzeit kein ausreichender Nachweis für eine der beiden Aussagen.
--
-- Wichtig: Feuerschutz (z. B. UL oder EN 15659) ist keine Einbruch-Sicherheitsklasse.

begin;

alter table public.safe_products
  add column if not exists security_classification_status text
  not null default 'unverified';

alter table public.safe_products
  drop constraint if exists safe_products_security_classification_status_check;

alter table public.safe_products
  add constraint safe_products_security_classification_status_check
  check (security_classification_status in ('certified','no_class','unverified'));

-- Belegte Zertifizierungen anhand der bereits gepflegten Norm UND Klasse.
update public.safe_products
set security_classification_status = 'certified',
    updated_at = now()
where active = true
  and nullif(trim(security_standard), '') is not null
  and nullif(trim(security_class), '') is not null;

-- Nur explizite Aussagen in den vorhandenen Hersteller-/Prüfnotizen übernehmen.
-- Allgemeine Aussagen wie "Versicherung nach Absprache" allein reichen nicht.
update public.safe_products
set security_classification_status = 'no_class',
    updated_at = now()
where active = true
  and not (
    nullif(trim(security_standard), '') is not null
    and nullif(trim(security_class), '') is not null
  )
  and (
    coalesce(notes, '') ilike '%keine Sicherheitsstufe%'
    or coalesce(notes, '') ilike '%keine Einbruch-Sicherheitsklasse%'
    or coalesce(notes, '') ilike '%keine zertifizierte Einbruch-Sicherheitsklasse%'
    or coalesce(notes, '') ilike '%nicht zertifiziert%'
    or coalesce(notes, '') ilike '%Einbruchsicherheit nicht zertifiziert%'
  );

-- Alle übrigen aktiven Produkte bleiben ausdrücklich ungeklärt.
update public.safe_products
set security_classification_status = 'unverified',
    updated_at = now()
where active = true
  and not (
    nullif(trim(security_standard), '') is not null
    and nullif(trim(security_class), '') is not null
  )
  and not (
    coalesce(notes, '') ilike '%keine Sicherheitsstufe%'
    or coalesce(notes, '') ilike '%keine Einbruch-Sicherheitsklasse%'
    or coalesce(notes, '') ilike '%keine zertifizierte Einbruch-Sicherheitsklasse%'
    or coalesce(notes, '') ilike '%nicht zertifiziert%'
    or coalesce(notes, '') ilike '%Einbruchsicherheit nicht zertifiziert%'
  );

comment on column public.safe_products.security_classification_status is
  'Nachweisstatus Einbruch-Sicherheitsklasse: certified = Norm und Klasse belegt; no_class = Hersteller-/Prüfnotiz dokumentiert ausdrücklich keine ausgewiesene Klasse bzw. fehlende Zertifizierung; unverified = ungeklärt. Feuerschutz ist davon getrennt.';

commit;

-- Kontrolle 1: Verteilung der Klassifizierungsstatus.
select
  security_classification_status,
  count(*) as artikel_anzahl
from public.safe_products
where active = true
group by security_classification_status
order by security_classification_status;

-- Kontrolle 2: ungeklärte Produkte zur gezielten Nachprüfung.
select
  article_number, model, category,
  security_standard, security_class,
  security_classification_status,
  source_reference, notes
from public.safe_products
where active = true
  and security_classification_status = 'unverified'
order by category, model, article_number;

-- Kontrolle 3: Plausibilitätsprüfung: zertifiziert darf nur mit Norm UND Klasse sein.
select article_number, model, security_standard, security_class,
       security_classification_status
from public.safe_products
where active = true
  and security_classification_status = 'certified'
  and (
    nullif(trim(security_standard), '') is null
    or nullif(trim(security_class), '') is null
  )
order by article_number;
