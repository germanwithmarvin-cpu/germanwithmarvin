-- ============================================================================
-- FREISCHALTCODES (Preply „Komplett" / Skool) — German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Gefahrlos mehrfach ausführbar.
-- Legt an: Spalte profiles.access_scope, Tabellen access_codes +
-- access_redemptions und die sichere Einlöse-Funktion redeem_code().
-- ============================================================================

-- 1) Zugangs-Umfang je Nutzer: 'none' | 'full' | 'vocab'
alter table public.profiles
  add column if not exists access_scope text not null default 'none';

-- 2) Codes
create table if not exists public.access_codes (
  code       text primary key,
  scope      text not null default 'full',        -- 'full' = alles, 'vocab' = nur Vokabel-App
  max_uses   integer,                              -- NULL = unbegrenzt (Community-Code), 1 = Einzel-Code
  used_count integer not null default 0,
  active     boolean not null default true,
  expires_at timestamptz,
  note       text not null default '',
  created_at timestamptz not null default now()
);

-- 3) Wer hat welchen Code eingelöst (verhindert Doppel-Zählung)
create table if not exists public.access_redemptions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null references public.access_codes(code) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code, user_id)
);

alter table public.access_codes       enable row level security;
alter table public.access_redemptions enable row level security;

-- Nur Lehrer verwalten Codes (Schüler lösen über die Funktion unten ein).
drop policy if exists "teacher manage codes" on public.access_codes;
create policy "teacher manage codes" on public.access_codes
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher reads redemptions" on public.access_redemptions;
create policy "teacher reads redemptions" on public.access_redemptions
  for select using (public.is_teacher());

-- 4) Sichere Einlöse-Funktion (läuft mit erhöhten Rechten, prüft alles selbst).
create or replace function public.redeem_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  c   record;
  uid uuid := auth.uid();
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

  -- Schon von diesem Nutzer eingelöst → einfach erneut anwenden, nicht doppelt zählen.
  if exists (select 1 from public.access_redemptions r where r.code = c.code and r.user_id = uid) then
    update public.profiles set access_scope = c.scope where id = uid;
    return json_build_object('ok', true, 'scope', c.scope, 'already', true);
  end if;

  if c.max_uses is not null and c.used_count >= c.max_uses then
    return json_build_object('ok', false, 'error', 'This code has already been used.');
  end if;

  update public.profiles set access_scope = c.scope where id = uid;
  update public.access_codes set used_count = used_count + 1 where code = c.code;
  insert into public.access_redemptions (code, user_id) values (c.code, uid);
  return json_build_object('ok', true, 'scope', c.scope);
end;
$$;

grant execute on function public.redeem_code(text) to authenticated;
