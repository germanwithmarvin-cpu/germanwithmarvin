-- ============================================================================
-- FIX: "new row violates row-level security policy for table lessons"
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Setzt die Lehrer-Funktion, dein
-- Lehrer-Flag und die Schreibrechte für lessons sauber neu. Gefahrlos.
-- WICHTIG: unten deine E-Mail eintragen (Zeile mit 'marvin.h.graf@gmail.com').
-- ============================================================================

-- 1) Lehrer-Spalte + Hilfsfunktion sicherstellen (mit festem search_path).
alter table public.profiles add column if not exists is_teacher boolean not null default false;

create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_teacher from public.profiles where id = auth.uid()), false);
$$;

-- 2) DEIN Konto als Lehrer markieren (E-Mail ggf. anpassen).
update public.profiles set is_teacher = true
where id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');

-- 3) Schreibrechte für Lektionen neu setzen.
alter table public.lessons enable row level security;

drop policy if exists "teacher inserts lessons" on public.lessons;
create policy "teacher inserts lessons" on public.lessons
  for insert with check (public.is_teacher());

drop policy if exists "teacher updates lessons" on public.lessons;
create policy "teacher updates lessons" on public.lessons
  for update using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher deletes lessons" on public.lessons;
create policy "teacher deletes lessons" on public.lessons
  for delete using (public.is_teacher());

-- 4) Kontrolle: zeigt dein Konto + Lehrer-Status.
select u.email, p.is_teacher
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'marvin.h.graf@gmail.com';
