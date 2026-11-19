-- Zentrale Absicherung der Schluesseldienst-App
-- Nach dem Login-Umbau einmalig im Supabase SQL Editor ausfuehren.
-- Tobias und Christian melden sich mit eigenen Supabase-Auth-Konten an.
-- Beide erhalten dieselben Rechte auf die gemeinsamen App-Daten.

begin;

-- Alle App-Tabellen: Zugriff ausschliesslich fuer angemeldete Benutzer.
-- Vorhandene Policies werden entfernt, damit keine alte "public"/"anon"-Policy
-- den Zugriff weiterhin versehentlich freigibt.
do $$
declare
  t text;
  tables text[] := array[
    'mitarbeiter',
    'kalender_eintraege',
    'arbeitszeiten',
    'archiv',
    'produkte',
    'products',
    'safe_products',
    'safe_consultations'
  ];
  p record;
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);

      for p in
        select policyname
        from pg_policies
        where schemaname = 'public' and tablename = t
      loop
        execute format('drop policy %I on public.%I', p.policyname, t);
      end loop;

      execute format(
        'create policy app_authenticated_all on public.%I for all to authenticated using (true) with check (true)',
        t
      );

      execute format('revoke all on table public.%I from anon, public', t);
      execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    end if;
  end loop;
end $$;

-- Die Archiv-PDFs liegen in einem privaten Storage-Bucket.
-- Alte App-Policies ersetzen, damit anonyme Besucher keine PDFs lesen,
-- hochladen, austauschen oder loeschen koennen.
update storage.buckets
set public = false
where id = 'berichte';

drop policy if exists "berichte lesen" on storage.objects;
drop policy if exists "berichte hochladen" on storage.objects;
drop policy if exists "berichte aktualisieren" on storage.objects;
drop policy if exists "berichte loeschen" on storage.objects;

create policy "berichte_authenticated_read"
on storage.objects for select to authenticated
using (bucket_id = 'berichte');

create policy "berichte_authenticated_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'berichte');

create policy "berichte_authenticated_update"
on storage.objects for update to authenticated
using (bucket_id = 'berichte')
with check (bucket_id = 'berichte');

create policy "berichte_authenticated_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'berichte');

-- Die Archiv-Tabelle verwendet eine Identity-Sequenz.
grant usage, select on all sequences in schema public to authenticated;

commit;

-- Ergebnis:
-- anon/public: kein Zugriff auf die oben genannten App-Tabellen und Berichte.
-- authenticated: beide Mitarbeiter haben identische CRUD-Rechte.
