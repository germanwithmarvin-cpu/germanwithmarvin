-- ============================================================================
-- NACHKAUF-E-MAIL-STRECKE (Onboarding → Retention → Jahresabo-Upsell) für
-- zahlende Monats-Kunden. Täglicher Cron (/api/cron/paid-emails) entscheidet
-- anhand der Tage seit Kauf, welche Stufe fällig ist. Angebots-/Nurture-Mails
-- nur mit Werbe-Einwilligung; jede Mail trägt einen 1-Klick-Abmeldelink.
--
-- WICHTIG: Bestandskunden bekommen die Strecke NICHT (siehe created_at-Backfill).
-- Setzt paid-subscriptions.sql voraus. Idempotent, erneut ausführbar.
-- ============================================================================

-- ---- 1) Stabiler Kaufzeitpunkt auf paid_subscriptions -----------------------
-- Bisher gab es nur updated_at (ändert sich bei jeder Verlängerung). Für eine
-- „Tag 0→25"-Strecke brauchen wir einen festen Startpunkt.
alter table public.paid_subscriptions
  add column if not exists created_at timestamptz;

-- Bestehende (Bestands-)Kunden auf ein altes Datum setzen → sie fallen NICHT in
-- das Neukunden-Fenster (kein Onboarding-Spam an Stammkunden). Nur Zeilen ohne
-- Wert, also beim ersten Lauf; später angelegte Neukunden haben bereits now().
update public.paid_subscriptions
  set created_at = timestamptz '2000-01-01 00:00:00+00'
  where created_at is null;

-- Ab jetzt: jeder neu angelegte (= frisch zahlende) Kunde bekommt now().
-- Der Stripe-Webhook schreibt created_at NICHT mit → beim Upsert bleibt der Wert
-- bei Verlängerungen erhalten und wird nur beim ersten Insert per Default gesetzt.
alter table public.paid_subscriptions alter column created_at set default now();
alter table public.paid_subscriptions alter column created_at set not null;

-- ---- 2) Versand-Log (welche Stufe hat ein Nutzer schon bekommen) ------------
create table if not exists public.paid_email_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  stage   text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, stage)
);

-- ---- 3) Zielgruppe der Nachkauf-Strecke -------------------------------------
-- Kandidaten:
--   * aktives Monats-Abo in paid_subscriptions (status = 'active')
--   * Kauf in den letzten 30 Tagen (Strecke läuft Tag 0–25; Bestandskunden mit
--     created_at = 2000-01-01 fallen damit automatisch raus)
--   * Konto zur E-Mail existiert, E-Mail bestätigt, kein Lehrer
--   * Werbe-Einwilligung erteilt (EU-Opt-in)
-- Gibt zusätzlich Tage seit Kauf und bereits versandte Stufen zurück.
create or replace function public.paid_email_candidates()
returns table (user_id uuid, email text, full_name text, days_since int, sent_stages text[])
language sql security definer set search_path = public as $$
  select
    u.id,
    u.email::text,
    coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name')::text,
    floor(extract(epoch from (now() - ps.created_at)) / 86400)::int,
    coalesce(array_remove(array_agg(l.stage), null), '{}')
  from public.paid_subscriptions ps
  join auth.users u on lower(u.email) = lower(ps.email)
  join public.profiles p on p.id = u.id
  left join public.paid_email_log l on l.user_id = u.id
  where ps.status = 'active'
    and ps.created_at >= now() - interval '30 days'
    and coalesce(p.is_teacher, false) = false
    and coalesce(p.marketing_consent, false) = true
    and u.email_confirmed_at is not null
  group by u.id, p.id, ps.created_at;
$$;

revoke all on function public.paid_email_candidates() from anon, authenticated;
grant execute on function public.paid_email_candidates() to service_role;
