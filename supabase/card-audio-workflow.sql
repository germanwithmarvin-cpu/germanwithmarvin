-- ============================================================================
-- VERTONUNG / AUDIO-WORKFLOW (Phase 1) - German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent (gefahrlos mehrfach ausfuehrbar).
--
-- Karten koennen jetzt ZWEI Aufnahmen haben:
--   audio_url          -> Aussprache des Wortes            (Feld existiert schon)
--   example_audio_url  -> Aussprache des Beispielsatzes    (NEU)
-- Beide werden vom Lehrer im Admin per Gedrueckthalten aufgenommen und in den
-- oeffentlichen Storage-Bucket 'card-media' geladen.
-- ============================================================================

-- 1) Neues Audiofeld fuer den Beispielsatz.
alter table public.fc_cards add column if not exists example_audio_url text;

-- 2) Storage-Bucket 'card-media' sicherstellen (oeffentlich lesbar) und die
--    Schreibrechte auf Lehrer beschraenken. Idempotent - falls schon vorhanden,
--    aendert das nichts Wesentliches.
insert into storage.buckets (id, name, public)
values ($$card-media$$, $$card-media$$, true)
on conflict (id) do update set public = true;

drop policy if exists "card-media teacher insert" on storage.objects;
create policy "card-media teacher insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = $$card-media$$ and public.is_teacher());

drop policy if exists "card-media teacher update" on storage.objects;
create policy "card-media teacher update" on storage.objects
  for update to authenticated
  using (bucket_id = $$card-media$$ and public.is_teacher());

drop policy if exists "card-media teacher delete" on storage.objects;
create policy "card-media teacher delete" on storage.objects
  for delete to authenticated
  using (bucket_id = $$card-media$$ and public.is_teacher());

select $$card-audio-workflow.sql angewandt$$ as status;
