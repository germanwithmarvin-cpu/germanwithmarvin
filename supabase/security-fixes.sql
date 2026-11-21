-- ============================================================================
-- SECURITY FIXES — germanwithmarvin.com   (Audit 2026-11-20)
-- Im Supabase SQL-Editor komplett einfuegen und "Run". Idempotent.
--
-- Schliesst die am DB-Layer bestaetigten Luecken:
--   PART 1  (KRITISCH)  Schueler kann sich selbst Lehrer-Rechte + Gratis-Zugang
--                        geben, weil die profiles-UPDATE-Policy keine Spalten
--                        sperrt (schema.sql:40).
--   PART 2  (HOCH)      Bezahlte Pruefungen + Loesungen sind fuer jeden
--                        eingeloggten Nutzer per RLS lesbar (Paywall nur im UI).
--   PART 3  (MITTEL)    redeem_code kann wiederholt aufgerufen werden und
--                        verlaengert den Trial jedes Mal (unendlich gratis).
--   PART 4  (VERIFY)    Prueft, ob die Inhalts-Paywall (lessons/stories/...)
--                        wirklich scharf ist, + bestaetigt PART 1/2.
-- ============================================================================


-- ============================================================================
-- PART 1 — profiles: privilegierte Spalten gegen Selbst-Vergabe sperren
-- ----------------------------------------------------------------------------
-- Problem: Policy "own profile update" (schema.sql:40) ist
--   for update using (auth.uid() = id)  -- KEIN with check, KEINE Spaltensperre
-- => ein eingeloggter Schueler kann per PostgREST seine eigene Zeile patchen:
--   PATCH /rest/v1/profiles?id=eq.<uid>  { "is_teacher": true,
--                                          "access_scope": "full",
--                                          "access_expires_at": null }
--   => sofort Lehrer (is_teacher() liest profiles.is_teacher) + Gratis-Zugang
--      fuer immer (my_access() liest access_scope). Totaler Paywall- + Rechte-
--      Bruch, inkl. Lesen aller Schuelerdaten und der Buchhaltung.
--
-- Fix: Der eingeloggte Rollenname in PostgREST ist "authenticated". Wir nehmen
-- dieser Rolle das Recht, BELIEBIGE Spalten zu aendern, und erlauben per
-- SPALTEN-GRANT nur noch die eine Spalte, die der Client wirklich selbst
-- schreibt: xp (Gamification, siehe src/lib/progress.ts). RLS schraenkt wie
-- bisher auf die eigene Zeile ein. Der service_role-Key (API-Routen) und
-- SECURITY-DEFINER-Funktionen (set_my_avatar, redeem_code, Stripe-Webhook,
-- handle_new_user) laufen unter anderen Rollen und sind NICHT betroffen —
-- Bezahlung, Trial-Freischaltung, Avatar, Name, Abmelden funktionieren weiter.
-- ----------------------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant  update (xp) on public.profiles to authenticated;

-- INSERT ebenfalls entschaerfen: die Profilzeile wird beim Signup vom Trigger
-- handle_new_user (SECURITY DEFINER, Rolle postgres) angelegt — der Client muss
-- NIE selbst inserten. Deshalb nehmen wir "authenticated" das INSERT-Recht ganz.
-- (Falls du irgendwo doch ein Client-seitiges profiles-INSERT hast, diese eine
--  Zeile weglassen — PART 1 schliesst die Luecke schon ueber UPDATE.)
revoke insert on public.profiles from authenticated;


-- ============================================================================
-- PART 2 — exam_*: Paywall in die RLS einbauen (nicht nur im UI)
-- ----------------------------------------------------------------------------
-- Problem: die authenticated-Lesepolicies auf exam_papers/sections/items
-- pruefen nur `is_published or is_teacher()` (exams.sql:126-151) — KEIN
-- my_access(). lock-content-to-subscribers.sql hat die exam-Tabellen vergessen.
-- => jeder eingeloggte (auch Trial-abgelaufen/gratis) Nutzer liest den ganzen
--    bezahlten Pruefungskatalog inkl. der `solution`-Spalte (Loesungen) direkt
--    per PostgREST, am UI-Paywall vorbei.
--
-- Fix: Lesen nur noch, wenn Lehrer ODER (veroeffentlicht UND zahlender Zugang
--      ODER ausdruecklich frei: is_sample = Trial-Haeppchen, is_free_public =
--      oeffentlicher Gratis-Test). Die anon-Policies (exams-free-public.sql)
--      und die Lehrer-Schreibpolicies bleiben unveraendert.
-- ----------------------------------------------------------------------------
drop policy if exists "exam_papers read" on public.exam_papers;
create policy "exam_papers read" on public.exam_papers
  for select to authenticated using (
    public.is_teacher()
    or (is_published and (public.my_access() = 'full' or is_sample or is_free_public))
  );

drop policy if exists "exam_sections read" on public.exam_sections;
create policy "exam_sections read" on public.exam_sections
  for select to authenticated using (
    public.is_teacher()
    or exists (
      select 1 from public.exam_papers p
      where p.id = paper_id
        and p.is_published
        and (public.my_access() = 'full' or p.is_sample or p.is_free_public)
    )
  );

drop policy if exists "exam_items read" on public.exam_items;
create policy "exam_items read" on public.exam_items
  for select to authenticated using (
    public.is_teacher()
    or exists (
      select 1 from public.exam_sections s
      join public.exam_papers p on p.id = s.paper_id
      where s.id = section_id
        and p.is_published
        and (public.my_access() = 'full' or p.is_sample or p.is_free_public)
    )
  );
-- HINWEIS (eigener Folgeschritt, nicht per SQL loesbar): fuer die frei/Trial
-- sichtbaren Pruefungen liefert getPaperFull() weiterhin die `solution`-Spalte
-- an den Browser (Lesen/Hoeren wird clientseitig korrigiert). Wer will, dass
-- Loesungen NIE im Client landen, muss Lesen/Hoeren serverseitig korrigieren
-- (wie /api/exam-grade beim Schreiben) und `solution` fuer Nicht-Lehrer
-- aus dem Select nehmen.


-- ============================================================================
-- PART 3 — redeem_code: Trial-Verlaengerung per Wiederholung unterbinden
-- ----------------------------------------------------------------------------
-- Problem (trial-codes.sql:38-42): im "schon eingeloest"-Zweig wird
--   access_expires_at = now() + grant_days  jedes Mal neu gesetzt
-- => ein Schueler ruft redeem_code mit demselben Code immer wieder auf und
--    schiebt sein Trial-Ende endlos nach vorne (unbegrenzt gratis).
--
-- Fix: Bei bereits eingeloesten, zeitlich begrenzten (grant_days) Codes das
-- Ablaufdatum NICHT mehr verlaengern. Nur Dauer-Codes (grant_days IS NULL)
-- duerfen harmlos erneut gesetzt werden.
-- ----------------------------------------------------------------------------
create or replace function public.redeem_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c   public.access_codes%rowtype;
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

  -- Schon von diesem Nutzer eingeloest.
  if exists (select 1 from public.access_redemptions r where r.code = c.code and r.user_id = uid) then
    -- Zeitlich begrenzte (Trial-)Codes NICHT verlaengern: das urspruengliche
    -- Fenster bleibt stehen (ist es abgelaufen, bleibt es abgelaufen).
    if c.grant_days is null then
      update public.profiles set access_scope = c.scope, access_expires_at = null where id = uid;
    end if;
    return json_build_object('ok', true, 'scope', c.scope, 'already', true);
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


-- ============================================================================
-- PART 4 — VERIFY (nur SELECTs, aendern nichts)
-- ----------------------------------------------------------------------------

-- 4a) PART 1 wirksam? -> authenticated darf auf profiles nur noch (xp) updaten,
--     kein insert. Erwartet: genau eine Zeile, privilege_type=UPDATE, column=xp.
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles' and grantee = 'authenticated'
order by privilege_type, column_name;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles' and grantee = 'authenticated'
order by privilege_type;   -- UPDATE/INSERT sollten hier NICHT (mehr) voll stehen

-- 4b) PART 2 wirksam? -> exam-Lesepolicies enthalten jetzt my_access().
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('exam_papers','exam_sections','exam_items') and cmd = 'SELECT'
order by tablename, policyname;

-- 4c) V3-Check (Inhalts-Paywall): fuer JEDE dieser Tabellen sollte eine
--     RESTRICTIVE SELECT-Policy mit my_access()='full' existieren. Fehlt eine,
--     ist dieser Inhalt fuer Gratis/abgelaufene Konten per anon-Key lesbar
--     -> dann supabase/lock-content-to-subscribers.sql (erneut) ausfuehren
--        bzw. den optionalen Block unten einkommentieren.
select c.relname as table_name,
       exists (
         select 1 from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname
           and p.permissive = 'RESTRICTIVE' and p.cmd = 'SELECT'
           and coalesce(p.qual,'') like '%my_access%'
       ) as paywall_policy_present
from (values ('lessons'),('stories'),('tr_units'),('tr_exercises'),('fc_decks'),('fc_cards')) c(relname)
order by 1;


-- ============================================================================
-- OPTIONAL — V3 erzwingen (nur einkommentieren, wenn 4c eine Luecke zeigt).
-- Setzt die harte Paywall (my_access()='full') auf allen Inhaltstabellen durch,
-- idempotent und nur fuer existierende Tabellen. ACHTUNG: blockt damit ALLE
-- Inhalte fuer Gratis/abgelaufene Konten — nur ausfuehren, wenn das gewollt ist
-- (deine dokumentierte "harte Paywall"). Zeigt 4c ueberall true, nichts tun.
-- ----------------------------------------------------------------------------
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['lessons','stories','tr_units','tr_exercises','fc_decks','fc_cards'] loop
--     if to_regclass('public.'||t) is not null then
--       execute format('alter table public.%I enable row level security', t);
--       execute format('drop policy if exists require_subscription on public.%I', t);
--       execute format('create policy require_subscription on public.%I as restrictive for select to authenticated using (public.my_access() = ''full'')', t);
--     end if;
--   end loop;
-- end $$;

select 'security-fixes.sql angewandt' as status;
