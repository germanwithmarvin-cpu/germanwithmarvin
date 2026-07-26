-- ============================================================================
-- MEHR-LEHRER · PHASE 4b: Buchen pro Lehrer (book_lesson je teacher_id)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent. Zusammen mit dem 4b-Deploy.
--
-- Strategie (sicher fuer Marvins Live-Betrieb):
--  - book_lesson(timestamptz) = Marvin (Lehrer 1), bewaehrte Haertungs-Logik,
--    jetzt nur sauber auf teacher_id=1 eingegrenzt (heute No-Op, da alle Daten
--    teacher_id=1 sind; korrekt sobald ein zweiter Lehrer existiert).
--  - book_lesson(int, timestamptz) = generisch je Lehrer. Fuer Lehrer 1 ruft es
--    einfach die bewaehrte Funktion oben auf; fuer weitere Lehrer laeuft die
--    parallele, auf teacher_id gescopte Logik. Ein Fehler dort kann Marvins
--    Betrieb also gar nicht treffen.
--  - taken_lesson_slots je Lehrer.
-- ============================================================================

-- 1) Marvin (Lehrer 1): bewaehrte Logik, Checks auf teacher_id=1 eingegrenzt.
create or replace function public.book_lesson(p_start timestamptz)
returns uuid language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  s public.lesson_teacher_settings;
  v_end timestamptz;
  v_local timestamp;
  v_dow int;
  v_mins int;
  v_ok boolean;
  v_grant uuid;
  v_booking uuid;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into s from public.lesson_teacher_settings where teacher_id = 1;
  v_end := p_start + make_interval(mins => coalesce(s.slot_minutes, 50));

  if p_start < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then raise exception 'too_soon'; end if;
  if p_start > now() + make_interval(days => coalesce(s.horizon_days, 28)) then raise exception 'too_far'; end if;

  v_local := p_start at time zone coalesce(s.timezone, 'Europe/Berlin');
  v_dow  := extract(dow from v_local);
  v_mins := extract(hour from v_local) * 60 + extract(minute from v_local);
  select exists (
    select 1 from jsonb_array_elements(coalesce(s.weekly, '[]'::jsonb)) w
     where (w->>'weekday')::int = v_dow
       and v_mins >= split_part(w->>'start', ':', 1)::int * 60 + split_part(w->>'start', ':', 2)::int
       and v_mins + coalesce(s.slot_minutes, 50) <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  if exists (select 1 from public.lesson_blocks where teacher_id = 1 and p_start < ends_at and v_end > starts_at) then raise exception 'blocked'; end if;
  if exists (select 1 from public.lesson_bookings where teacher_id = 1 and status = 'booked' and p_start < ends_at and v_end > starts_at) then raise exception 'slot_taken'; end if;

  select id into v_grant from public.lesson_credit_grants
    where user_id = uid and teacher_id = 1 and credits_remaining > 0 and expires_at > now()
    order by expires_at asc limit 1 for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;
  insert into public.lesson_bookings (student_id, teacher_id, starts_at, ends_at, status, grant_id)
    values (uid, 1, p_start, v_end, 'booked', v_grant) returning id into v_booking;
  return v_booking;
exception when unique_violation then raise exception 'slot_taken';
end;
$$;

-- 2) Generisch je Lehrer. Lehrer 1 -> bewaehrte Funktion; sonst gescopte Logik.
create or replace function public.book_lesson(p_teacher int, p_start timestamptz)
returns uuid language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  s public.lesson_teacher_settings;
  v_active boolean;
  v_end timestamptz;
  v_local timestamp;
  v_dow int;
  v_mins int;
  v_ok boolean;
  v_grant uuid;
  v_booking uuid;
begin
  if p_teacher = 1 then return public.book_lesson(p_start); end if;
  if uid is null then raise exception 'not_authenticated'; end if;

  select active into v_active from public.teachers where id = p_teacher;
  if not coalesce(v_active, false) then raise exception 'teacher_inactive'; end if;

  select * into s from public.lesson_teacher_settings where teacher_id = p_teacher;
  if s.teacher_id is null then raise exception 'outside_hours'; end if;
  v_end := p_start + make_interval(mins => coalesce(s.slot_minutes, 50));

  if p_start < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then raise exception 'too_soon'; end if;
  if p_start > now() + make_interval(days => coalesce(s.horizon_days, 28)) then raise exception 'too_far'; end if;

  v_local := p_start at time zone coalesce(s.timezone, 'Europe/Berlin');
  v_dow  := extract(dow from v_local);
  v_mins := extract(hour from v_local) * 60 + extract(minute from v_local);
  select exists (
    select 1 from jsonb_array_elements(coalesce(s.weekly, '[]'::jsonb)) w
     where (w->>'weekday')::int = v_dow
       and v_mins >= split_part(w->>'start', ':', 1)::int * 60 + split_part(w->>'start', ':', 2)::int
       and v_mins + coalesce(s.slot_minutes, 50) <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  if exists (select 1 from public.lesson_blocks where teacher_id = p_teacher and p_start < ends_at and v_end > starts_at) then raise exception 'blocked'; end if;
  if exists (select 1 from public.lesson_bookings where teacher_id = p_teacher and status = 'booked' and p_start < ends_at and v_end > starts_at) then raise exception 'slot_taken'; end if;

  select id into v_grant from public.lesson_credit_grants
    where user_id = uid and teacher_id = p_teacher and credits_remaining > 0 and expires_at > now()
    order by expires_at asc limit 1 for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;
  insert into public.lesson_bookings (student_id, teacher_id, starts_at, ends_at, status, grant_id)
    values (uid, p_teacher, p_start, v_end, 'booked', v_grant) returning id into v_booking;
  return v_booking;
exception when unique_violation then raise exception 'slot_taken';
end;
$$;

-- 3) Belegte Slots je Lehrer (die alte 2-arg-Variante bleibt = Lehrer 1).
create or replace function public.taken_lesson_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql security definer stable as $$
  select starts_at from public.lesson_bookings
   where teacher_id = 1 and status = 'booked' and starts_at >= p_from and starts_at < p_to;
$$;

create or replace function public.taken_lesson_slots(p_teacher int, p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql security definer stable as $$
  select starts_at from public.lesson_bookings
   where teacher_id = p_teacher and status = 'booked' and starts_at >= p_from and starts_at < p_to;
$$;

grant execute on function public.book_lesson(timestamptz) to authenticated;
grant execute on function public.book_lesson(int, timestamptz) to authenticated;
grant execute on function public.taken_lesson_slots(timestamptz, timestamptz) to authenticated;
grant execute on function public.taken_lesson_slots(int, timestamptz, timestamptz) to authenticated;

select 'lessons-phase4b.sql angewandt' as status;
