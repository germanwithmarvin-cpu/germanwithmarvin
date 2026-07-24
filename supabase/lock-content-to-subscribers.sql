-- ============================================================================
-- Inhalte nur für zahlende Nutzer freigeben (Paywall SERVERSEITIG erzwingen)
-- ============================================================================
--
-- PROBLEM (vor Launch wichtig):
-- Die Lese-Policies auf den Inhalts-Tabellen erlauben JEDEM eingeloggten Nutzer
-- das Lesen (bei `stories` sogar jedem, auch ausgeloggt):
--   tr_units      -> using (is_published)
--   tr_exercises  -> using (true)
--   stories       -> using (true)
--   lessons       -> "anyone reads lessons"
-- Die Paywall greift bisher nur im UI (getAccess()/Paywall), nicht in der DB.
-- Da die Registrierung offen ist und der Anon-Key öffentlich ist, kann ein
-- frisch registrierter Gratis-Account alle Inhalte über die öffentliche
-- REST-API abgreifen, ohne zu bezahlen.
--
-- LÖSUNG:
-- Pro Inhalts-Tabelle eine RESTRICTIVE-Policy, die ZUSÄTZLICH verlangt, dass
-- public.my_access() = 'full' ist. RESTRICTIVE-Policies werden mit UND
-- verknüpft – die bestehenden Policy-Namen müssen also nicht bekannt sein und
-- die vorhandenen Policies bleiben unangetastet. Schreibzugriffe laufen über
-- den Service-Role-Key (Webhook/Seed) und umgehen RLS – die bleiben also heil.
--
-- ⚠️  NICHT blind übernehmen. In der Supabase-SQL-Konsole ausführen und DANACH
--     unbedingt testen:
--       1) frisch registrierter Gratis-Account  -> darf KEINE Inhalte sehen (Paywall)
--       2) Lehrer-Account / zahlender Account    -> sieht weiterhin ALLES
--       3) ausgeloggt                            -> sieht keine Inhalte
--     Zurückrollen jederzeit möglich: siehe Block ganz unten.
-- ============================================================================

-- my_access() auch für anon ausführbar machen, damit die Policy bei
-- ausgeloggten Anfragen sauber 'none' liefert (statt einen Fehler zu werfen).
grant execute on function public.my_access() to anon;

drop policy if exists require_subscription on public.tr_units;
create policy require_subscription on public.tr_units
  as restrictive for select
  using (public.my_access() = 'full');

drop policy if exists require_subscription on public.tr_exercises;
create policy require_subscription on public.tr_exercises
  as restrictive for select
  using (public.my_access() = 'full');

drop policy if exists require_subscription on public.stories;
create policy require_subscription on public.stories
  as restrictive for select
  using (public.my_access() = 'full');

drop policy if exists require_subscription on public.lessons;
create policy require_subscription on public.lessons
  as restrictive for select
  using (public.my_access() = 'full');

-- Flashcards: die Tabellen werden nicht im Repo angelegt (Supabase-UI). Vorher
-- die bestehenden Policies prüfen, dann diese restrictive Policy ergänzen:
--   select tablename, policyname, cmd, qual from pg_policies
--   where tablename in ('fc_decks','fc_cards');
drop policy if exists require_subscription on public.fc_decks;
create policy require_subscription on public.fc_decks
  as restrictive for select
  using (public.my_access() = 'full');

drop policy if exists require_subscription on public.fc_cards;
create policy require_subscription on public.fc_cards
  as restrictive for select
  using (public.my_access() = 'full');

-- ============================================================================
-- ZURÜCKROLLEN (falls etwas hakt): alle neuen Policies wieder entfernen
-- ----------------------------------------------------------------------------
-- drop policy if exists require_subscription on public.tr_units;
-- drop policy if exists require_subscription on public.tr_exercises;
-- drop policy if exists require_subscription on public.stories;
-- drop policy if exists require_subscription on public.lessons;
-- drop policy if exists require_subscription on public.fc_decks;
-- drop policy if exists require_subscription on public.fc_cards;
-- ============================================================================
