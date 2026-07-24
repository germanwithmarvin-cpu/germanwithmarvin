-- ============================================================================
-- Namen der Buchenden für den Lehrer auflösen. Idempotent.
-- Löst JEDEN user_id auf (auch Test-/Lehrer-Konten) – anders als
-- teacher_students, das Lehrer-Konten und Nicht-Schüler ausschließt.
-- Namen liegen in auth.users.raw_user_meta_data->>'full_name'.
-- ============================================================================
create or replace function public.booking_student_names(p_ids uuid[])
returns table (id uuid, name text)
language sql security definer set search_path = public as $$
  select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), u.email::text)
  from auth.users u
  where public.is_teacher()          -- nur der Lehrer darf Namen auflösen
    and u.id = any(p_ids);
$$;

grant execute on function public.booking_student_names(uuid[]) to authenticated;
