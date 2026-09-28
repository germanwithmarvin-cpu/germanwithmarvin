-- ============================================================================
-- Students-Tab: "last active" ehrlich machen.
-- Bisher = nur letzter Flashcard-Review (fc_review_log). Neu = spaetester
-- Zeitpunkt ueber ALLE Aktivitaeten: Login, Flashcards, Videos, Training,
-- Schreiben. greatest() ignoriert NULLs (Postgres). Reine RPC-Aenderung,
-- Signatur unveraendert -> create or replace, kein Deploy noetig.
-- Im Supabase SQL-Editor "Run". Mehrfach ausfuehrbar.
-- ============================================================================

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
  sub_cancel_at_period_end boolean
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
    -- Ehrliches "last active": spaetester Zeitpunkt ueber alle Aktivitaeten.
    greatest(
      u.last_sign_in_at,
      (select max(r.reviewed_at)  from fc_review_log r      where r.user_id = p.id),
      (select max(lp2.completed_at) from lesson_progress lp2 where lp2.user_id = p.id),
      (select max(a.created_at)   from tr_attempts a        where a.user_id = p.id),
      (select max(w.created_at)   from writing_submissions w where w.user_id = p.id)
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
    coalesce(ps.cancel_at_period_end, false)
  from profiles p
  join auth.users u on u.id = p.id
  left join public.paid_subscriptions ps on lower(ps.email) = lower(u.email)
  where public.is_teacher()
    and coalesce(p.is_teacher, false) = false
  order by p.created_at desc;
$$;

grant execute on function public.teacher_students() to authenticated;

select $$students-last-active-fix.sql angewandt$$ as status;
