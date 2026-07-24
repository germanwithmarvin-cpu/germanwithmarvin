-- ============================================================================
-- 1-zu-1 Stunden – Härtung (Launch-QA). Idempotent, gefahrlos mehrfach laufbar.
-- Ersetzt book_lesson + cancel_lesson. Setzt lesson-booking.sql voraus.
--
-- Behebt:
--   1) Lehrer-Absage: erstattet dem Schüler jetzt IMMER (nicht nur >24 h).
--   2) Erstattung gibt die URSPRÜNGLICHE Gutschrift zurück (keine Laufzeit-
--      Verlängerung -> kein Auffrischen durch Buchen+Absagen).
--   3) book_lesson prüft serverseitig: liegt der Slot in einem Verfügbarkeits-
--      fenster, nicht in einem Blocker, und überlappt keine bestehende Buchung.
-- ============================================================================

-- Buchen: Vorlauf/Horizont + Verfügbarkeitsfenster + Blocker + Überlappung +
-- Guthaben. Zieht 1 Stunde ab. (Google-Belegtzeiten bleiben clientseitig/best
-- effort – die kann eine DB-Funktion nicht abfragen.)
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
  select * into s from public.lesson_teacher_settings where id = 1;
  v_end := p_start + make_interval(mins => coalesce(s.slot_minutes, 50));

  if p_start < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then
    raise exception 'too_soon';
  end if;
  if p_start > now() + make_interval(days => coalesce(s.horizon_days, 28)) then
    raise exception 'too_far';
  end if;

  -- Muss in ein wöchentliches Verfügbarkeitsfenster passen (Lehrer-Zeitzone).
  v_local := p_start at time zone coalesce(s.timezone, 'Europe/Berlin');
  v_dow  := extract(dow from v_local);                       -- 0=So..6=Sa
  v_mins := extract(hour from v_local) * 60 + extract(minute from v_local);
  select exists (
    select 1 from jsonb_array_elements(coalesce(s.weekly, '[]'::jsonb)) w
     where (w->>'weekday')::int = v_dow
       and v_mins >= split_part(w->>'start', ':', 1)::int * 60 + split_part(w->>'start', ':', 2)::int
       and v_mins + coalesce(s.slot_minutes, 50)
             <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  -- Nicht in einen Blocker (Urlaub/Termin) fallen.
  if exists (
    select 1 from public.lesson_blocks
     where p_start < ends_at and v_end > starts_at
  ) then raise exception 'blocked'; end if;

  -- Kein Überlappen mit bestehender Buchung (nicht nur exakt gleiche Startzeit).
  if exists (
    select 1 from public.lesson_bookings
     where status = 'booked' and p_start < ends_at and v_end > starts_at
  ) then raise exception 'slot_taken'; end if;

  select id into v_grant from public.lesson_credit_grants
    where user_id = uid and credits_remaining > 0 and expires_at > now()
    order by expires_at asc limit 1
    for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;

  insert into public.lesson_bookings (student_id, starts_at, ends_at, status, grant_id)
    values (uid, p_start, v_end, 'booked', v_grant)
    returning id into v_booking;

  return v_booking;
exception when unique_violation then
  raise exception 'slot_taken';
end;
$$;

-- Absagen: Lehrer-Absage IMMER erstatten; Schüler-Absage nur >24 h vorher.
-- Erstattung geht auf die ursprünglich verbrauchte Gutschrift zurück (keine
-- Laufzeit-Verlängerung). Nur wenn die fehlt/abgelaufen ist, neue Gutschrift.
create or replace function public.cancel_lesson(p_booking uuid)
returns text language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  b public.lesson_bookings;
  by_teacher boolean;
  is_free boolean;
  v_grant public.lesson_credit_grants;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into b from public.lesson_bookings where id = p_booking;
  if b.id is null then raise exception 'not_found'; end if;
  by_teacher := public.is_teacher();
  if b.student_id <> uid and not by_teacher then raise exception 'forbidden'; end if;
  if b.status <> 'booked' then raise exception 'not_active'; end if;

  is_free := by_teacher or b.starts_at > now() + interval '24 hours';

  update public.lesson_bookings
     set status = case when is_free then 'cancelled_free' else 'cancelled_late' end,
         cancelled_at = now()
   where id = b.id;

  if is_free then
    if b.grant_id is not null then
      select * into v_grant from public.lesson_credit_grants where id = b.grant_id;
    end if;
    if v_grant.id is not null and v_grant.expires_at > now() then
      -- Ursprung zurückgeben – gleiche Restlaufzeit, kein Auffrischen.
      update public.lesson_credit_grants
         set credits_remaining = credits_remaining + 1
       where id = v_grant.id;
    else
      -- Ursprung fehlt/abgelaufen: neue Gutschrift.
      -- (35 Tage muss zu LESSON.creditValidityDays in src/lib/config.ts passen.)
      insert into public.lesson_credit_grants (user_id, credits_granted, credits_remaining, expires_at)
        values (b.student_id, 1, 1, now() + interval '35 days');
    end if;
  end if;

  return case when is_free then 'refunded' else 'forfeited' end;
end;
$$;

grant execute on function public.book_lesson(timestamptz) to authenticated;
grant execute on function public.cancel_lesson(uuid) to authenticated;
