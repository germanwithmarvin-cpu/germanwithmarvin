-- ============================================================================
-- B1-Gruppenkurs-Funnel: Tabellen + RPCs
-- Im Supabase SQL-Editor "Run". Idempotent, mehrfach ausfuehrbar.
-- RLS ueberall an, KEINE anon/authenticated-Policies -> nur die API-Routen
-- (service_role) schreiben. Lesen fuer die Seiten laeuft ueber SECURITY-DEFINER-RPCs.
-- ============================================================================

-- ---- 1) Kurs-Einschreibungen (eine Zeile pro bezahltem Kauf) ----------------
create table if not exists public.course_enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  course_id         text not null,
  email             text,
  stripe_session_id text unique,            -- Idempotenz: ein Kauf = eine Zeile
  amount_total      int,                    -- in Cent
  currency          text,
  status            text not null default 'active',  -- active | refunded | cancelled
  created_at        timestamptz not null default now()
);
create index if not exists course_enrollments_course on public.course_enrollments(course_id);
alter table public.course_enrollments enable row level security;

-- Belegte Plaetze (fuer die oeffentliche Kursseite). Nur eine Zahl -> unkritisch.
create or replace function public.group_course_seats_taken(p_course text)
returns int language sql security definer set search_path = public as $$
  select count(*)::int from public.course_enrollments
  where course_id = p_course and status = 'active';
$$;
grant execute on function public.group_course_seats_taken(text) to anon, authenticated;


-- ---- 2) B1-Test-Leads (Double-Opt-in) --------------------------------------
-- Leads sind KEINE Accounts -> eigene Tabelle, Identitaet = E-Mail.
create table if not exists public.b1_leads (
  email             text primary key,
  full_name         text,
  source            text,                   -- z.B. "b1-test"
  test_result       text,                   -- z.B. "A2" / "B1"
  wunschzeit        text,                   -- bevorzugtes Zeitfenster (optional)
  status            text not null default 'pending',  -- pending | confirmed | unsubscribed
  marketing_consent boolean not null default false,
  consent_text      text,                   -- Nachweis: welchem Text wurde zugestimmt
  confirmed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.b1_leads enable row level security;

-- Sequenz-Log: welche Stufe hat ein Lead schon bekommen.
create table if not exists public.b1_email_log (
  email   text not null,
  stage   text not null,
  sent_at timestamptz not null default now(),
  primary key (email, stage)
);
-- RLS an (wie bei den Geschwister-Tabellen): sonst waere das Log ueber die
-- anon-API lesbar -> Lead-Mailadressen + Marketing-Stufe wuerden leaken.
-- Der Cron schreibt per service_role (umgeht RLS), liest per SECURITY-DEFINER-RPC.
alter table public.b1_email_log enable row level security;

-- Kandidaten fuer die 5-Mail-Serie:
--   * status = 'confirmed' (Double-Opt-in abgeschlossen)
--   * marketing_consent = true
--   * bestaetigt in den letzten 30 Tagen (Serie laeuft ~Tag 0-X)
-- days_since zaehlt ab confirmed_at (nicht ab Signup, es gibt keinen Account).
create or replace function public.b1_email_candidates()
returns table (email text, full_name text, days_since int, sent_stages text[])
language sql security definer set search_path = public as $$
  select
    b.email,
    b.full_name,
    floor(extract(epoch from (now() - b.confirmed_at)) / 86400)::int,
    coalesce(array_remove(array_agg(l.stage), null), '{}')
  from public.b1_leads b
  left join public.b1_email_log l on l.email = b.email
  where b.status = 'confirmed'
    and b.marketing_consent = true
    and b.confirmed_at is not null
    and b.confirmed_at >= now() - interval '30 days'
  group by b.email, b.full_name, b.confirmed_at;
$$;
revoke all on function public.b1_email_candidates() from anon, authenticated;
grant execute on function public.b1_email_candidates() to service_role;


-- ---- 3) Probestunden-Anfragen (feste Zeit, kein Login) ----------------------
create table if not exists public.trial_requests (
  id             uuid primary key default gen_random_uuid(),
  name           text,
  email          text not null,
  preferred_time text,                      -- gewaehltes Zeitfenster
  source         text default 'probestunde',
  status         text not null default 'new',  -- new | scheduled | done
  created_at     timestamptz not null default now()
);
alter table public.trial_requests enable row level security;

select 'b1-group-course.sql angewandt' as status;
