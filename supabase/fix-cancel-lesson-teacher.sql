-- ============================================================================
-- FIX: Buchungs-Lehrer (z. B. Thanh Ha) darf eigene Stunden absagen
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent.
--
-- Problem: cancel_lesson() erlaubte Storno nur dem Schueler oder is_teacher()
-- (= Admin/Marvin). Der zweite Lehrer hat die Rolle ueber teachers.user_id
-- (my_teacher_id()), nicht das is_teacher-Flag -> bekam 'forbidden' (access
-- denied). Jetzt darf auch der DER BUCHUNG ZUGEORDNETE Lehrer absagen; wie beim
-- Admin ist das kostenfrei (Schueler erhaelt sein Guthaben zurueck).
-- ============================================================================

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

  -- Absagen darf: der Schueler, der Admin (is_teacher) ODER der dieser Buchung
  -- zugeordnete Buchungs-Lehrer. Ein Lehrer-Storno ist immer kostenfrei.
  by_teacher := public.is_teacher()
             or (b.teacher_id is not null and b.teacher_id = public.my_teacher_id());
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
      -- Ursprung zurueckgeben - gleiche Restlaufzeit, kein Auffrischen.
      update public.lesson_credit_grants
         set credits_remaining = credits_remaining + 1
       where id = v_grant.id;
    else
      -- Ursprung fehlt/abgelaufen: neue Gutschrift (35 Tage = LESSON.creditValidityDays).
      insert into public.lesson_credit_grants (user_id, credits_granted, credits_remaining, expires_at)
        values (b.student_id, 1, 1, now() + interval '35 days');
    end if;
  end if;

  return case when is_free then 'refunded' else 'forfeited' end;
end;
$$;

grant execute on function public.cancel_lesson(uuid) to authenticated;

select $$fix-cancel-lesson-teacher.sql angewandt$$ as status;
