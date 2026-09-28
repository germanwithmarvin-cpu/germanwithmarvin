-- ============================================================================
-- Students-Tab: 1-zu-1 Stundenguthaben + Buchungen je Schueler anzeigen.
--   lesson_credits    = verbleibende Stunden (nicht abgelaufene Grants)
--   lessons_upcoming  = kuenftige gebuchte Stunden
--   next_lesson_at    = naechste gebuchte Stunde
--   lessons_booked    = jemals gebucht (ohne Stornos)
-- Signatur aendert sich -> DROP + CREATE. Im Supabase SQL-Editor "Run".
-- Mehrfach ausfuehrbar.
-- ============================================================================

drop function if exists public.teacher_students();
create or replace function public.teacher_students()
returns table (
  student_id uuid,
  full_name text,
  email text,
  joined timestamptz,
  lessons_completed bigint,
  cards_learned bigint,
  cards_seen bigint,
  last_active timestamptz,
  marketing_consent boolean,
  access_scope text,
  access_expires_at timestamptz,
  signup_source text,
  signup_campaign text,
  signup_gclid text,
  signup_ref text,
  signup_referrer text,
  total_reviews bigint,
  sub_status text,
  sub_current_period_end timestamptz,
  sub_cancel_at_period_end boolean,
  lesson_credits int,
  lessons_upcoming bigint,
  next_lesson_at timestamptz,
  lessons_booked bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(u.raw_user_meta_data->>'full_name', ''),
    u.email::text,
    p.created_at,
    (select count(*) from lesson_progress lp where lp.user_id = p.id),
    (select count(*) from fc_card_states s where s.user_id = p.id and s.repetitions >= 1),
    (select count(*) from fc_card_states s where s.user_id = p.id),
    greatest(
      u.last_sign_in_at,
      (select max(r.reviewed_at)    from fc_review_log r       where r.user_id = p.id),
      (select max(lp2.completed_at) from lesson_progress lp2    where lp2.user_id = p.id),
      (select max(a.created_at)     from tr_attempts a          where a.user_id = p.id),
      (select max(w.created_at)     from writing_submissions w  where w.user_id = p.id)
    ),
    coalesce(p.marketing_consent, false),
    p.access_scope,
    p.access_expires_at,
    p.signup_source,
    p.signup_campaign,
    p.signup_gclid,
    p.signup_ref,
    p.signup_referrer,
    (select count(*) from fc_review_log r where r.user_id = p.id),
    ps.status,
    ps.current_period_end,
    coalesce(ps.cancel_at_period_end, false),
    -- 1-zu-1 Stunden
    coalesce((select sum(g.credits_remaining) from lesson_credit_grants g
              where g.user_id = p.id and g.expires_at > now() and g.credits_remaining > 0), 0)::int,
    (select count(*) from lesson_bookings b
       where b.student_id = p.id and b.status = 'booked' and b.starts_at > now()),
    (select min(b.starts_at) from lesson_bookings b
       where b.student_id = p.id and b.status = 'booked' and b.starts_at > now()),
    (select count(*) from lesson_bookings b
       where b.student_id = p.id and b.status not in ('cancelled_free', 'cancelled_late'))
  from profiles p
  join auth.users u on u.id = p.id
  left join public.paid_subscriptions ps on lower(ps.email) = lower(u.email)
  where public.is_teacher()
    and coalesce(p.is_teacher, false) = false
  order by p.created_at desc;
$$;

grant execute on function public.teacher_students() to authenticated;

select $$students-lesson-credits.sql angewandt$$ as status;
