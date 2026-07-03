-- ============================================================================
-- ZUGANGSLOGIK TESTEN — Test-Konto in verschiedene Zustände versetzen
-- ----------------------------------------------------------------------------
-- Benutze ein TEST-Schülerkonto (NICHT dein Lehrer-Konto — Lehrer haben immer
-- Vollzugang). Ersetze unten 'TEST-EMAIL@example.com' durch die Test-Adresse.
-- Jeweils nur EINEN Block ausführen, dann in der App neu laden.
-- ============================================================================

-- 0) Aktuellen Stand ansehen (alle Konten):
select u.email, p.is_teacher, p.is_subscribed, p.created_at
from public.profiles p
join auth.users u on u.id = p.id
order by p.created_at desc;


-- A) TRIAL (frisches Konto): 7 Tage Vollzugang → alles offen
update public.profiles set is_subscribed = false, created_at = now()
where id = (select id from auth.users where email = 'TEST-EMAIL@example.com');

-- B) FREE (Trial abgelaufen): created_at 10 Tage zurück, kein Abo
--    → A1 offen, A2–B2 gesperrt (🔒), Writing/Messages = Paywall
-- update public.profiles set is_subscribed = false, created_at = now() - interval '10 days'
-- where id = (select id from auth.users where email = 'TEST-EMAIL@example.com');

-- C) SUBSCRIBED (zahlendes Abo): alles offen
-- update public.profiles set is_subscribed = true
-- where id = (select id from auth.users where email = 'TEST-EMAIL@example.com');
