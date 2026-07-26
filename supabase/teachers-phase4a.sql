-- ============================================================================
-- MEHR-LEHRER · PHASE 4a: Rechtemodell „Buchungs-Lehrer" + Thanh Ha einrichten
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent.
-- Zusammen mit dem 4a-Deploy einspielen.
--
-- Was passiert:
--  1) my_teacher_id(): liefert die teacher_id des eingeloggten Nutzers (oder NULL).
--     -> „Buchungs-Lehrer" = Zeile in teachers mit user_id = auth.uid().
--        Getrennt von profiles.is_teacher (= Voll-Admin, bleibt nur bei Marvin).
--  2) Thanh Ha (teacher 2) mit ihrem jetzt existierenden Konto verknuepfen +
--     leere Verfuegbarkeits-Zeile anlegen.
--  3) RLS: ein Buchungs-Lehrer darf SEINE eigene Verfuegbarkeit/Blocks/Buchungen
--     verwalten (additiv; Marvins is_teacher-Policies bleiben).
-- ============================================================================

-- 1) Helfer: teacher_id des aktuellen Nutzers
create or replace function public.my_teacher_id()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select id from public.teachers where user_id = auth.uid() limit 1
$$;
grant execute on function public.my_teacher_id() to authenticated;

-- 2) Thanh Ha verknuepfen (ihr Konto existiert jetzt) + Verfuegbarkeits-Zeile
update public.teachers
set user_id = (select id from auth.users where email = $$thanhhang.de@gmail.com$$)
where id = 2;

insert into public.lesson_teacher_settings (id, teacher_id, timezone, slot_minutes, lead_hours, horizon_days, buffer_minutes, weekly)
values (2, 2, $$Europe/Berlin$$, 50, 12, 28, 10, $$[]$$)
on conflict (teacher_id) do nothing;

-- 3) RLS: Buchungs-Lehrer verwaltet SEINS (additiv zu den bestehenden Policies)
drop policy if exists "booking teacher writes own settings" on public.lesson_teacher_settings;
create policy "booking teacher writes own settings" on public.lesson_teacher_settings
  for update using (teacher_id = public.my_teacher_id()) with check (teacher_id = public.my_teacher_id());

drop policy if exists "booking teacher writes own blocks" on public.lesson_blocks;
create policy "booking teacher writes own blocks" on public.lesson_blocks
  for all using (teacher_id = public.my_teacher_id()) with check (teacher_id = public.my_teacher_id());

drop policy if exists "booking teacher reads own bookings" on public.lesson_bookings;
create policy "booking teacher reads own bookings" on public.lesson_bookings
  for select using (teacher_id = public.my_teacher_id());

drop policy if exists "booking teacher updates own bookings" on public.lesson_bookings;
create policy "booking teacher updates own bookings" on public.lesson_bookings
  for update using (teacher_id = public.my_teacher_id());

-- Kontrolle
select id, name, active, (user_id is not null) as account_verknuepft
from public.teachers order by id;
