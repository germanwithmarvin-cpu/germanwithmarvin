-- ============================================================================
-- Gratis-30-Min-Probestunde (nur bei Ha / teacher_id 2), 1x pro Schueler.
-- Kein Stripe: ein spezielles Guthaben (duration_min = 30) wird einmalig
-- vergeben; book_lesson bucht damit genau 30 Minuten. Im Supabase SQL-Editor
-- "Run". Mehrfach ausfuehrbar.
-- ============================================================================

-- 1) Dauer je Guthaben. NULL = normale Stundenlaenge (slot_minutes).
alter table public.lesson_credit_grants add column if not exists duration_min int;

-- 2) book_lesson (Lehrer >= 2) so, dass die DAUER aus dem Guthaben kommt.
--    Das Guthaben wird zuerst gewaehlt (bestimmt v_dur); eine Probestunde
--    (duration_min gesetzt) wird vor regulaerem Guthaben verbraucht.
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
  v_dur int;
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

  -- Guthaben ZUERST: es bestimmt die Dauer. Probestunde (duration_min gesetzt)
  -- wird vor regulaerem Guthaben verbraucht (nulls last).
  select id, coalesce(duration_min, s.slot_minutes, 50)
    into v_grant, v_dur
    from public.lesson_credit_grants
    where user_id = uid and teacher_id = p_teacher and credits_remaining > 0 and expires_at > now()
    order by duration_min nulls last, expires_at asc
    limit 1 for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  v_end := p_start + make_interval(mins => v_dur);

  if p_start < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then raise exception 'too_soon'; end if;
  if p_start > now() + make_interval(days => coalesce(s.horizon_days, 28)) then raise exception 'too_far'; end if;

  v_local := p_start at time zone coalesce(s.timezone, 'Europe/Berlin');
  v_dow  := extract(dow from v_local);
  v_mins := extract(hour from v_local) * 60 + extract(minute from v_local);
  select exists (
    select 1 from jsonb_array_elements(coalesce(s.weekly, '[]'::jsonb)) w
     where (w->>'weekday')::int = v_dow
       and v_mins >= split_part(w->>'start', ':', 1)::int * 60 + split_part(w->>'start', ':', 2)::int
       and v_mins + v_dur <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  if exists (select 1 from public.lesson_blocks where teacher_id = p_teacher and p_start < ends_at and v_end > starts_at) then raise exception 'blocked'; end if;
  if exists (select 1 from public.lesson_bookings where teacher_id = p_teacher and status = 'booked' and p_start < ends_at and v_end > starts_at) then raise exception 'slot_taken'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;
  insert into public.lesson_bookings (student_id, teacher_id, starts_at, ends_at, status, grant_id)
    values (uid, p_teacher, p_start, v_end, 'booked', v_grant) returning id into v_booking;
  return v_booking;
exception when unique_violation then raise exception 'slot_taken';
end;
$$;
grant execute on function public.book_lesson(int, timestamptz) to authenticated;

-- 3) Gratis-Probestunde vergeben: 1 Guthaben (30 Min), 1x pro Schueler je Lehrer.
--    Marker = duration_min gesetzt; stripe_invoice_id-Sentinel sichert zusaetzlich
--    per Unique-Constraint gegen Doppelvergabe (Race).
create or replace function public.grant_free_trial(p_teacher int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.teachers where id = p_teacher and active) then raise exception 'teacher_inactive'; end if;
  if exists (
    select 1 from public.lesson_credit_grants
    where user_id = uid and teacher_id = p_teacher and duration_min is not null
  ) then
    return false; -- Probestunde wurde bereits vergeben
  end if;
  insert into public.lesson_credit_grants
    (user_id, teacher_id, credits_granted, credits_remaining, expires_at, stripe_invoice_id, duration_min)
  values
    (uid, p_teacher, 1, 1, now() + interval '14 days', 'trial_' || p_teacher || '_' || uid, 30)
  on conflict (stripe_invoice_id) do nothing;
  return true;
end;
$$;
grant execute on function public.grant_free_trial(int) to authenticated;

-- 4) Ist noch eine Probestunde frei?
create or replace function public.free_trial_available(p_teacher int)
returns boolean language sql security definer set search_path = public as $$
  select not exists (
    select 1 from public.lesson_credit_grants
    where user_id = auth.uid() and teacher_id = p_teacher and duration_min is not null
  );
$$;
grant execute on function public.free_trial_available(int) to authenticated;

select $$probestunde-ha.sql angewandt$$ as status;
