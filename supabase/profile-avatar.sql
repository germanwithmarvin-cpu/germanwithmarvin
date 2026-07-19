-- Profil: selbst hochgeladenes Profilbild.
-- Legt die Bild-Spalte, einen eigenen Speicher-Bucket und eine sichere Setter-Funktion an.
-- Mehrfach ausfuehrbar.

-- 1) Bild-URL am Profil
alter table public.profiles
  add column if not exists avatar_url text;

-- 2) Oeffentlicher Bucket "avatars" (Lesen oeffentlich, Schreiben nur eigener Ordner)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars own insert" on storage.objects;
create policy "avatars own insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars own delete" on storage.objects;
create policy "avatars own delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3) Sichere Funktion: setzt NUR das eigene Profilbild (keine anderen Felder erreichbar)
create or replace function public.set_my_avatar(p_url text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set avatar_url = p_url where id = auth.uid();
$$;

grant execute on function public.set_my_avatar(text) to authenticated;
