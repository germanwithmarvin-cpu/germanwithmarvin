-- ============================================================================
-- STUDENTS-TRACKING erweitern + SCHUELER-BANNER - German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent. Setzt is_teacher(), trial-self-serve
-- (marketing_consent) und signup-source (signup_*) voraus.
-- ============================================================================

-- 1) teacher_students() um mehr Felder erweitern (Werbeerlaubnis, Zugang,
--    Herkunft, Aktivitaet). Rueckgabe-Signatur aendert sich -> erst DROP.
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
  total_reviews bigint
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
    (select max(r.reviewed_at) from fc_review_log r where r.user_id = p.id),
    coalesce(p.marketing_consent, false),
    p.access_scope,
    p.access_expires_at,
    p.signup_source,
    p.signup_campaign,
    p.signup_gclid,
    p.signup_ref,
    p.signup_referrer,
    (select count(*) from fc_review_log r where r.user_id = p.id)
  from profiles p
  join auth.users u on u.id = p.id
  where public.is_teacher()
    and coalesce(p.is_teacher, false) = false
  order by p.created_at desc;
$$;
grant execute on function public.teacher_students() to authenticated;

-- 2) Schueler-Banner: Nachricht, die nach dem Login erscheint. target_user_id
--    NULL = alle Schueler, sonst genau dieser Schueler.
create table if not exists public.student_banners (
  id             uuid primary key default gen_random_uuid(),
  target_user_id uuid references auth.users(id) on delete cascade,
  message        text not null,
  cta_label      text,
  cta_href       text,
  tone           text not null default $$info$$,   -- info | success | warning
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists student_banners_target_idx on public.student_banners(target_user_id);

alter table public.student_banners enable row level security;

-- Lehrer duerfen alles verwalten.
drop policy if exists "banners teacher manage" on public.student_banners;
create policy "banners teacher manage" on public.student_banners
  for all using (public.is_teacher()) with check (public.is_teacher());

-- Schueler duerfen ihre sichtbaren aktiven Banner lesen (global + persoenlich).
drop policy if exists "banners student read" on public.student_banners;
create policy "banners student read" on public.student_banners
  for select to authenticated
  using (active and (target_user_id is null or target_user_id = auth.uid()));

select $$students-tracking-banners.sql angewandt$$ as status;
