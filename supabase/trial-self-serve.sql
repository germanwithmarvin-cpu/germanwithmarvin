-- ============================================================================
-- SELF-SERVICE 5-TAGE-TRIAL (ohne Kreditkarte) + Marketing-Opt-in
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent. Setzt access-codes.sql +
-- trial-codes.sql voraus (access_scope, access_expires_at, my_access).
--
-- Jeder NEUE registrierte Nutzer bekommt automatisch 5 Tage Vollzugang.
-- Danach greift die bestehende Paywall (my_access -> 'none').
--  - Bezahler (pay-first): haben zusätzlich ein aktives Stripe-Abo -> bleiben full.
--  - Code-Nutzer (Preply/Skool): redeem_code überschreibt den Zugang wie bisher.
-- ============================================================================

-- 1) Marketing-Einwilligung (DSGVO: nur mit Opt-in Werbe-Mails senden)
alter table public.profiles add column if not exists marketing_consent boolean not null default false;

-- 2) Beim Registrieren: Profil anlegen + 5-Tage-Trial + Opt-in aus den Metadaten.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, marketing_consent, access_scope, access_expires_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    'full',
    now() + interval '5 days'
  );
  return new;
end;
$$;

-- 3) Hat der Nutzer einen Code eingelöst? (Nur die bekommen den $19-Sonderpreis;
--    Self-Service-Trial-Nutzer sehen den vollen $39-Preis.)
create or replace function public.is_code_redeemer()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.access_redemptions where user_id = auth.uid());
$$;
grant execute on function public.is_code_redeemer() to authenticated;

select 'trial-self-serve.sql angewandt' as status;
