-- ============================================================================
-- EMPFEHLUNGS-/PROVISIONS-CODES (Affiliate) — German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Gefahrlos mehrfach ausführbar.
--
-- Ein Code pro Influencer, gruppierbar nach Partner. Der Empfehlungslink ist
-- deine Website mit ?ref=CODE. Beim Zahlen reicht Stripe den Code als
-- client_reference_id an den Webhook durch → wird als Conversion verbucht.
--
-- Legt an:
--   referral_codes        — die Codes (Partner + Influencer + Notiz)
--   referral_visits       — Besuche über ?ref=CODE (1 pro Browser & Tag & Code)
--   referral_conversions  — Zahlungen über einen Code (idempotent je Stripe-Session)
--   referral_stats()      — Auswertung je Code (Besuche / Kunden / Umsatz), nur Lehrer
-- ============================================================================

-- 1) Codes
create table if not exists public.referral_codes (
  code       text primary key,
  partner    text not null default $$$$,   -- Gruppe / Vertriebspartner
  influencer text not null default $$$$,    -- konkreter Influencer / Kanal
  note       text not null default $$$$,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Besuche (dedupliziert je Code + Browser + Tag, damit Zahlen nicht aufgeblasen werden)
create table if not exists public.referral_visits (
  id          uuid primary key default gen_random_uuid(),
  code        text not null references public.referral_codes(code) on delete cascade,
  visitor_key text not null default $$$$,
  day         date not null default (now() at time zone $$utc$$)::date,
  visited_at  timestamptz not null default now(),
  unique (code, visitor_key, day)
);
create index if not exists referral_visits_code_idx on public.referral_visits(code);

-- 3) Zahlungen (eine Zeile je Stripe-Checkout-Session → doppelte Webhooks zählen nicht doppelt)
create table if not exists public.referral_conversions (
  id                uuid primary key default gen_random_uuid(),
  code              text not null references public.referral_codes(code) on delete cascade,
  email             text,
  stripe_session_id text unique,
  amount_total      integer,             -- kleinste Währungseinheit (Cent)
  currency          text,
  created_at        timestamptz not null default now()
);
create index if not exists referral_conversions_code_idx on public.referral_conversions(code);

-- 4) RLS: nur Lehrer dürfen lesen/verwalten. Schreiben laufen über den
--    Service-Role-Key (Webhook + /api/ref/visit) und umgeht RLS ohnehin.
alter table public.referral_codes       enable row level security;
alter table public.referral_visits      enable row level security;
alter table public.referral_conversions enable row level security;

drop policy if exists "teacher manage referral_codes" on public.referral_codes;
create policy "teacher manage referral_codes" on public.referral_codes
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher read referral_visits" on public.referral_visits;
create policy "teacher read referral_visits" on public.referral_visits
  for select using (public.is_teacher());

drop policy if exists "teacher read referral_conversions" on public.referral_conversions;
create policy "teacher read referral_conversions" on public.referral_conversions
  for select using (public.is_teacher());

-- 5) Auswertung je Code (nur Lehrer). Besuche = deduplizierte Zeilen,
--    Kunden = Anzahl Zahlungen, Umsatz = Summe (in der jeweiligen Währung).
create or replace function public.referral_stats()
returns table (
  code        text,
  partner     text,
  influencer  text,
  note        text,
  active      boolean,
  created_at  timestamptz,
  visits      bigint,
  customers   bigint,
  revenue_cents bigint,
  currency    text
)
language sql
security definer
set search_path = public
as $$
  select
    c.code, c.partner, c.influencer, c.note, c.active, c.created_at,
    coalesce((select count(*) from public.referral_visits v where v.code = c.code), 0)      as visits,
    coalesce((select count(*) from public.referral_conversions r where r.code = c.code), 0) as customers,
    coalesce((select sum(r.amount_total) from public.referral_conversions r where r.code = c.code), 0) as revenue_cents,
    (select r.currency from public.referral_conversions r where r.code = c.code order by r.created_at desc limit 1) as currency
  from public.referral_codes c
  where public.is_teacher()   -- Nicht-Lehrer bekommen keine Zeilen
  order by c.created_at desc;
$$;

grant execute on function public.referral_stats() to authenticated;

-- Kontrolle
select $$referral-codes.sql angewandt$$ as status;
