-- Datei-Uploads (PDFs) fuer Lektionen & Stories.
-- Legt einen oeffentlichen Speicher-Bucket an; hochladen duerfen nur Lehrer,
-- herunterladen (lesen) darf jeder (oeffentlicher Bucket). Mehrfach ausfuehrbar.

-- 1) Oeffentlicher Bucket "uploads"
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- 2) Schreibrechte NUR fuer Lehrer (Lesen ist bei public-Bucket automatisch erlaubt)
drop policy if exists "uploads teacher insert" on storage.objects;
create policy "uploads teacher insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'uploads' and public.is_teacher());

drop policy if exists "uploads teacher update" on storage.objects;
create policy "uploads teacher update" on storage.objects
  for update to authenticated
  using (bucket_id = 'uploads' and public.is_teacher());

drop policy if exists "uploads teacher delete" on storage.objects;
create policy "uploads teacher delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'uploads' and public.is_teacher());

-- 3) Download-Datei (Buch als PDF) fuer Stories
alter table public.stories
  add column if not exists file_url text;
