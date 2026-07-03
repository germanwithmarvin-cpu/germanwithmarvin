-- Lehrer-Zugriff: erlaubt Lehrer-Konten, ALLE Einreichungen zu sehen und Feedback zu geben.
-- Im Supabase SQL Editor einfügen und "Run".

-- 1) Markierung, wer Lehrer ist.
alter table public.profiles add column if not exists is_teacher boolean not null default false;

-- 2) Hilfsfunktion (umgeht RLS sicher, verhindert Endlosschleifen in Policies).
create or replace function public.is_teacher()
returns boolean language sql security definer stable as $$
  select coalesce((select is_teacher from public.profiles where id = auth.uid()), false);
$$;

-- 3) Lehrer dürfen alle Einreichungen lesen und Feedback speichern.
drop policy if exists "teacher read all submissions" on public.writing_submissions;
create policy "teacher read all submissions" on public.writing_submissions
  for select using (public.is_teacher());

drop policy if exists "teacher update submissions" on public.writing_submissions;
create policy "teacher update submissions" on public.writing_submissions
  for update using (public.is_teacher());

-- 4) Lehrer dürfen Schüler-Namen (Profile) sehen, um Einreichungen zuzuordnen.
drop policy if exists "teacher read all profiles" on public.profiles;
create policy "teacher read all profiles" on public.profiles
  for select using (public.is_teacher());

-- 5) DEIN Lehrer-Konto freischalten:
--    Lege zuerst über die Website ein Konto an, dann führe die nächste Zeile aus
--    und ersetze die E-Mail durch deine eigene.
-- update public.profiles set is_teacher = true
--   where id = (select id from auth.users where email = 'DEINE-EMAIL@example.com');
