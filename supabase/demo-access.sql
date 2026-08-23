-- ============================================================================
-- Kein-Login-Demo-Zugang. Im Supabase SQL-Editor "Run". Idempotent.
--  - /try?key=SECRET loggt Besucher ins geteilte Demo-Konto ein (Vollzugang).
--  - Buchung ist fuer dieses Konto gesperrt (App + API).
--
-- SETUP:
--  1) Demo-Konto anlegen: Supabase -> Authentication -> Users -> "Add user",
--     E-Mail + Passwort, Haken "Auto Confirm User" AN.
--  2) Unten die E-Mail eintragen und ausfuehren.
--  3) In Vercel die Env-Variablen setzen: DEMO_EMAIL, DEMO_PASSWORD, DEMO_LINK_KEY.
--  4) Link teilen: https://www.germanwithmarvin.com/try?key=DEIN_DEMO_LINK_KEY
-- ============================================================================

alter table public.profiles add column if not exists is_demo boolean not null default false;

-- Demo-Konto markieren: Vollzugang, KEIN Ablauf (kein Trial), als Demo gekennzeichnet.
update public.profiles
set is_demo = true, access_scope = 'full', access_expires_at = null
where id = (select id from auth.users where lower(email) = lower('DEMO_EMAIL'));

select 'demo-access.sql angewandt' as status;
