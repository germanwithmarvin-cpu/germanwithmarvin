-- ============================================================================
-- HERKUNFT / KAMPAGNEN-ATTRIBUTION je Registrierung - German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent. Setzt trial-self-serve.sql voraus
-- (handle_new_user mit 5-Tage-Trial + marketing_consent).
--
-- Speichert bei JEDER neuen Registrierung, WOHER der Nutzer kam:
--   gclid      - Google-Klick-ID (eindeutiger Beleg "kam ueber Google-Anzeige")
--   utm_*      - Kampagne / Kanal / Medium (falls in der URL vorhanden)
--   referrer   - von welcher externen Seite er kam
--   ref        - Influencer-/Provisions-Code (?ref), falls vorhanden
-- Die Werte liefert die Register-Seite ueber die Signup-Metadaten.
-- ============================================================================

-- 1) Neue Spalten (leer = unbekannt/direkt)
alter table public.profiles add column if not exists signup_source   text;
alter table public.profiles add column if not exists signup_medium   text;
alter table public.profiles add column if not exists signup_campaign text;
alter table public.profiles add column if not exists signup_gclid    text;
alter table public.profiles add column if not exists signup_referrer text;
alter table public.profiles add column if not exists signup_ref      text;

-- 2) handle_new_user: Trial + Opt-in wie bisher, PLUS Herkunft aus den Metadaten.
--    nullif(...,'') speichert echte Leerwerte als NULL statt als "".
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (
    id, full_name, marketing_consent, access_scope, access_expires_at,
    signup_source, signup_medium, signup_campaign, signup_gclid, signup_referrer, signup_ref
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    'full',
    now() + interval '5 days',
    nullif(new.raw_user_meta_data ->> 'utm_source',   ''),
    nullif(new.raw_user_meta_data ->> 'utm_medium',   ''),
    nullif(new.raw_user_meta_data ->> 'utm_campaign', ''),
    nullif(new.raw_user_meta_data ->> 'gclid',        ''),
    nullif(new.raw_user_meta_data ->> 'referrer',     ''),
    nullif(new.raw_user_meta_data ->> 'ref',          '')
  );
  return new;
end;
$$;

select $$signup-source.sql angewandt$$ as status;
