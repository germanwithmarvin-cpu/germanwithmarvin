-- ============================================================================
-- 1-zu-1 Stunden – Feste wöchentliche Zeit (Phase 2b). Idempotent.
-- Setzt lesson-booking.sql + lesson-booking-hardening.sql voraus.
--
-- Modell:
--   * Ein Schüler hat höchstens EINE feste Zeit (Wochentag + volle Stunde in
--     Lehrer-Zeitzone).
--   * Beim Setzen und bei jeder Abo-Verlängerung werden die Termine der
--     aktuellen bezahlten Periode automatisch gebucht (1/Woche, solange
--     Guthaben reicht) – Extra-Guthaben bleibt für Einzelstunden.
--   * Zukünftige Wochen der festen Zeit werden für ANDERE Schüler gehalten.
-- ============================================================================

-- Feste wöchentliche Reservierung.
create table if not exists public.lesson_recurring (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  weekday int not null,        -- 0=So..6=Sa (Lehrer-Zeitzone), wie WeeklyWindow
  start_min int not null,      -- Minuten ab Mitternacht (Lehrer-Zeitzone), volle Stunde
  status text not null default 'active',   -- active | cancelled
  created_at timestamptz not null default now()
);
create unique index if not exists uniq_active_recurring on public.lesson_recurring (student_id) where status = 'active';

alter table public.lesson_recurring enable row level security;
drop policy if exists "student reads own recurring" on public.lesson_recurring;
create policy "student reads own recurring" on public.lesson_recurring for select using (student_id = auth.uid());
drop policy if exists "teacher reads recurring" on public.lesson_recurring;
create policy "teacher reads recurring" on public.lesson_recurring for select using (public.is_teacher());
-- Schreiben läuft ausschließlich über die SECURITY-DEFINER-Funktionen unten.

-- Verknüpfung Buchung → feste Zeit (für spätere Auswertung/Reschedule).
alter table public.lesson_bookings add column if not exists recurring_id uuid;

-- ── Buchen (interne Variante mit explizitem Schüler) ────────────────────────
-- Wie book_lesson, aber für einen bestimmten Schüler und optional an eine feste
-- Zeit gekoppelt. NICHT an authenticated freigegeben – nur intern aufgerufen.
create or replace function public.book_lesson_for(p_student uuid, p_start timestamptz, p_recurring uuid default null)
returns uuid language plpgsql security definer as $$
declare
  s public.lesson_teacher_settings;
  v_end timestamptz;
  v_local timestamp;
  v_dow int;
  v_mins int;
  v_ok boolean;
  v_grant uuid;
  v_booking uuid;
begin
  select * into s from public.lesson_teacher_settings where id = 1;
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
       and v_mins + coalesce(s.slot_minutes, 50)
             <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  if exists (select 1 from public.lesson_blocks where p_start < ends_at and v_end > starts_at) then raise exception 'blocked'; end if;
  if exists (select 1 from public.lesson_bookings where status='booked' and p_start < ends_at and v_end > starts_at) then raise exception 'slot_taken'; end if;

  -- Nicht über die feste Zeit eines ANDEREN Schülers buchen (Wochentag+Uhrzeit).
  if exists (
    select 1 from public.lesson_recurring r
     where r.status = 'active'
       and (p_recurring is null or r.id <> p_recurring)
       and r.weekday = v_dow and r.start_min = v_mins
  ) then raise exception 'reserved'; end if;

  select id into v_grant from public.lesson_credit_grants
    where user_id = p_student and credits_remaining > 0 and expires_at > now()
    order by expires_at asc limit 1 for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;

  insert into public.lesson_bookings (student_id, starts_at, ends_at, status, grant_id, recurring_id)
    values (p_student, p_start, v_end, 'booked', v_grant, p_recurring)
    returning id into v_booking;

  return v_booking;
exception when unique_violation then
  raise exception 'slot_taken';
end;
$$;

-- book_lesson (Schüler-Variante) delegiert an book_lesson_for.
create or replace function public.book_lesson(p_start timestamptz)
returns uuid language plpgsql security definer as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  return public.book_lesson_for(uid, p_start, null);
end;
$$;

-- ── Feste Zeit auto-buchen ──────────────────────────────────────────────────
-- Bucht die Termine der festen Zeit bis zum Ende der bezahlten Periode
-- (1/Woche, solange Guthaben reicht). Ohne aktives Abo passiert nichts.
create or replace function public.materialize_recurring(p_student uuid)
returns int language plpgsql security definer as $$
declare
  s public.lesson_teacher_settings;
  r public.lesson_recurring;
  v_until timestamptz;
  occ timestamptz;
  n int := 0;
  has_credit boolean;
begin
  select * into s from public.lesson_teacher_settings where id = 1;
  select * into r from public.lesson_recurring where student_id = p_student and status = 'active' limit 1;
  if r.id is null then return 0; end if;

  select least(current_period_end, now() + make_interval(days => coalesce(s.horizon_days, 28)))
    into v_until
    from public.lesson_subscriptions
   where user_id = p_student and status in ('active', 'past_due');
  if v_until is null then return 0; end if;   -- kein aktives Abo -> nichts nachbuchen

  for occ in
    select ((d + make_interval(mins => r.start_min)) at time zone coalesce(s.timezone, 'Europe/Berlin'))
    from generate_series(
      (now() at time zone coalesce(s.timezone, 'Europe/Berlin'))::date::timestamp,
      (v_until at time zone coalesce(s.timezone, 'Europe/Berlin'))::date::timestamp,
      interval '1 day') d
    where extract(dow from d) = r.weekday
    order by 1
  loop
    if occ < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then continue; end if;
    if occ > v_until then exit; end if;
    if exists (select 1 from public.lesson_bookings where student_id = p_student and starts_at = occ and status = 'booked') then continue; end if;
    select exists (select 1 from public.lesson_credit_grants where user_id = p_student and credits_remaining > 0 and expires_at > now()) into has_credit;
    if not has_credit then exit; end if;
    begin
      perform public.book_lesson_for(p_student, occ, r.id);
      n := n + 1;
    exception when others then null;   -- belegte/ungültige Woche überspringen
    end;
  end loop;
  return n;
end;
$$;

-- Feste Zeit setzen/ändern (Schüler). Ersetzt eine vorhandene und bucht sofort.
create or replace function public.set_recurring(p_weekday int, p_start_min int)
returns int language plpgsql security definer as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_weekday < 0 or p_weekday > 6 then raise exception 'bad_weekday'; end if;
  if p_start_min % 60 <> 0 then raise exception 'not_on_hour'; end if;
  update public.lesson_recurring set status = 'cancelled' where student_id = uid and status = 'active';
  insert into public.lesson_recurring (student_id, weekday, start_min, status) values (uid, p_weekday, p_start_min, 'active');
  return public.materialize_recurring(uid);
end;
$$;

-- Feste Zeit beenden (Schüler). Bereits gebuchte Termine bleiben bestehen und
-- können einzeln abgesagt werden.
create or replace function public.cancel_recurring()
returns void language plpgsql security definer as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  update public.lesson_recurring set status = 'cancelled' where student_id = uid and status = 'active';
end;
$$;

-- Gehaltene Zeiten (feste Zeiten aller Schüler) im Bereich – für die Slot-Anzeige,
-- damit reservierte Wochentage/Uhrzeiten anderen nicht angeboten werden.
create or replace function public.held_recurring_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql security definer stable as $$
  select occ from (
    select ((d + make_interval(mins => r.start_min)) at time zone coalesce(s.timezone, 'Europe/Berlin')) as occ
    from public.lesson_recurring r
    cross join public.lesson_teacher_settings s
    cross join lateral generate_series(
      (p_from at time zone coalesce(s.timezone, 'Europe/Berlin'))::date::timestamp,
      (p_to   at time zone coalesce(s.timezone, 'Europe/Berlin'))::date::timestamp,
      interval '1 day') d
    where r.status = 'active' and s.id = 1 and extract(dow from d) = r.weekday
  ) x
  where occ >= p_from and occ < p_to;
$$;

grant execute on function public.book_lesson(timestamptz) to authenticated;
grant execute on function public.set_recurring(int, int) to authenticated;
grant execute on function public.cancel_recurring() to authenticated;
grant execute on function public.held_recurring_slots(timestamptz, timestamptz) to authenticated;
grant execute on function public.materialize_recurring(uuid) to service_role;
