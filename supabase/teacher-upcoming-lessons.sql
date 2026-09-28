-- ============================================================================
-- Privater Stundenplan fuer den Lehrer-Tab: alle kuenftigen gebuchten
-- 1-zu-1-Stunden mit Schuelername + Meet-Link. SECURITY DEFINER, damit es
-- unabhaengig von den lesson_bookings-RLS-Policies zuverlaessig liefert;
-- Zugriff nur fuer Lehrer (is_teacher()). Im Supabase SQL-Editor "Run".
-- ============================================================================

create or replace function public.teacher_upcoming_lessons()
returns table (
  booking_id   uuid,
  starts_at    timestamptz,
  student_id   uuid,
  student_name text,
  meet_link    text
)
language sql
security definer
set search_path = public
as $$
  select
    b.id,
    b.starts_at,
    b.student_id,
    coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), u.email::text, 'Student'),
    b.meet_link
  from public.lesson_bookings b
  join auth.users u on u.id = b.student_id
  where public.is_teacher()
    and b.status = 'booked'
    and b.starts_at > now()
  order by b.starts_at;
$$;

grant execute on function public.teacher_upcoming_lessons() to authenticated;

select $$teacher-upcoming-lessons.sql angewandt$$ as status;
