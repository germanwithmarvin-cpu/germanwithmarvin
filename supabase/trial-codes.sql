-- ============================================================================
-- Trial-Codes: zeitlich begrenzter Zugang (z. B. 14 Tage) für Preply/Skool.
-- Idempotent. Setzt access-codes.sql + paid-subscriptions.sql voraus.
--
-- Modell: ein Code kann eine Laufzeit haben (grant_days). Beim Einlösen wird
-- profiles.access_expires_at gesetzt; my_access akzeptiert den Code-Zugang nur,
-- solange er nicht abgelaufen ist. Danach greift die Paywall (Stripe-Abo, mit
-- optionalem Rabatt-/Promo-Code = reine Stripe-Konfiguration).
-- ============================================================================

alter table public.access_codes add column if not exists grant_days int;            -- NULL = dauerhaft, sonst Trial-Tage
alter table public.profiles     add column if not exists access_expires_at timestamptz;  -- NULL = unbegrenzt (bei access_scope='full')

-- Einlösen: setzt bei Trial-Codes ein Ablaufdatum, sonst dauerhaft (NULL).
create or replace function public.redeem_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  c        record;
  uid      uuid := auth.uid();
  v_expires timestamptz;
begin
  if uid is null then
    return json_build_object('ok', false, 'error', 'Please sign in first.');
  end if;

  select * into c from public.access_codes where lower(code) = lower(btrim(p_code));
  if not found then
    return json_build_object('ok', false, 'error', 'This code does not exist.');
  end if;
  if not c.active then
    return json_build_object('ok', false, 'error', 'This code is no longer active.');
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return json_build_object('ok', false, 'error', 'This code has expired.');
  end if;

  v_expires := case when c.grant_days is not null then now() + make_interval(days => c.grant_days) else null end;

  -- Schon von diesem Nutzer eingelöst → erneut anwenden, nicht doppelt zählen.
  if exists (select 1 from public.access_redemptions r where r.code = c.code and r.user_id = uid) then
    update public.profiles set access_scope = c.scope, access_expires_at = v_expires where id = uid;
    return json_build_object('ok', true, 'scope', c.scope, 'already', true, 'expires_at', v_expires);
  end if;

  if c.max_uses is not null and c.used_count >= c.max_uses then
    return json_build_object('ok', false, 'error', 'This code has already been used.');
  end if;

  update public.profiles set access_scope = c.scope, access_expires_at = v_expires where id = uid;
  update public.access_codes set used_count = used_count + 1 where code = c.code;
  insert into public.access_redemptions (code, user_id) values (c.code, uid);
  return json_build_object('ok', true, 'scope', c.scope, 'expires_at', v_expires);
end;
$$;
grant execute on function public.redeem_code(text) to authenticated;

-- Zugang: Code-Zugang zählt nur, solange access_expires_at in der Zukunft (oder NULL) ist.
create or replace function public.my_access()
returns text language sql security definer set search_path = public as $$
  select case
    when exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.is_teacher
          or (p.access_scope = 'full' and (p.access_expires_at is null or p.access_expires_at > now()))
        )
    ) then 'full'
    when exists (
      select 1 from public.paid_subscriptions ps
      where lower(ps.email) = lower(auth.jwt() ->> 'email')
        and ps.status in ('active', 'trialing')
    ) then 'full'
    else 'none'
  end;
$$;
grant execute on function public.my_access() to authenticated;
grant execute on function public.my_access() to anon;
