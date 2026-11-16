-- Tresor-Berater: Waffenschrank-Daten Paket 10
-- Branch: feature/tresorberater
-- Ergänzt die vier bislang offenen Gun/Fifty-Artikel.
-- Ausschließlich Herstellerangaben aus Produktdatenblättern/Katalog.
-- Keine Sicherheitsklasse und keine Versicherungswerte erfinden.
-- Die Hersteller nennen für alle vier Modelle keine Sicherheitsstufe;
-- Versicherungswerte DE nur nach Absprache mit der Versicherung.
-- Hersteller-Katalog 2023: Fifty BT Gun ist in Deutschland nur als Munitionsschrank verwendbar.
-- Gun 1 sowie Gun 8 Cargo Varianten werden in Deutschland nur als Munitionsschränke angeboten.
-- Verkaufspreise werden nicht importiert.

begin;

with source_data (
  article_number, source_reference, source_date, note
) as (
  values
  ('T06379',
   'Rottner Waffenschrank-Katalog 2023, S. 6; Rottner Produktdatenblatt FIFTY BT GUN T06379',
   '2023 / Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung. Rottner-Katalog 2023: nicht zertifiziert und in Deutschland nur als Munitionsschrank verwendbar. Technische Daten laut Produktdatenblatt: 1450 x 300 x 400 mm außen (Beschlag +15 mm), 1440 x 290 x 315 mm innen, 46,5 kg, Bluetoothschloss, Innentresor, 2 Boden- und 2 Rückwandbohrungen.'),
  ('T06119',
   'Rottner Produktdatenblatt GUN 1 T06119; Rottner-Katalog/Produktangaben GUN 1',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe ausgewiesen; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung. Rottner-Produktangaben: in Deutschland nur als Munitionsschrank verwendbar. Technische Daten laut Produktdatenblatt: 1250 x 200 x 200 mm außen (Beschlag +15 mm), 1245 x 195 x 170 mm innen, 8,5 kg, Zylinderschloss, Platz für 1 Langwaffe, 2 Bodenbohrungen.'),
  ('T06535',
   'Rottner Produktdatenblatt GUN 8 CARGO T06535',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung. Rottner-Produktangaben führen das Modell als Waffenschrank/Munitionsschrank; in Deutschland nur als Munitionsschrank verwenden. Technische Daten: 1500 x 570 x 290 mm außen (Beschlag +5 mm), 1255 x 567 x 265 mm innen, 29 kg, 188 l, Zylinderschloss, Platz für 8 Langwaffen (Produktbezeichnung/Ausstattung; keine Aussage zur deutschen Waffenaufbewahrungseignung), 3 Fachböden, Innentresor, 2 Boden- und 2 Rückwandbohrungen.'),
  ('T06536',
   'Rottner Produktdatenblatt GUN 8 CARGO ELEKTRONIKSCHLOSS T06536',
   'Produktdatenblatt',
   'Herstellerangabe: keine Sicherheitsstufe; Versicherungswert privat und gewerblich in Deutschland nur nach Absprache mit der Versicherung. Rottner-Produktangaben führen das Modell als Waffenschrank/Munitionsschrank; in Deutschland nur als Munitionsschrank verwenden. Technische Daten: 1500 x 570 x 290 mm außen (Beschlag +5 mm), 1255 x 567 x 265 mm innen, 29 kg, 188 l, Elektronikschloss, Platz für 8 Langwaffen (Produktbezeichnung/Ausstattung; keine Aussage zur deutschen Waffenaufbewahrungseignung), 3 Fachböden, Innentresor, 2 Boden- und 2 Rückwandbohrungen.')
)
update public.safe_products p
set
  source_reference = case
    when position(s.source_reference in coalesce(p.source_reference,'')) > 0 then p.source_reference
    else concat_ws('; ', nullif(p.source_reference,''), s.source_reference)
  end,
  source_date = coalesce(p.source_date, s.source_date),
  notes = case
    when position(s.note in coalesce(p.notes,'')) > 0 then p.notes
    else concat_ws(E'\\n', nullif(p.notes,''), s.note)
  end,
  updated_at = now()
from source_data s
where p.article_number = s.article_number
  and p.active = true;

commit;

-- Kontrolle der vier ergänzten Artikel
select
  article_number, model, category,
  security_standard, security_class,
  insured_private, insured_commercial,
  source_reference, notes
from public.safe_products
where article_number in ('T06379','T06119','T06535','T06536')
order by article_number;
