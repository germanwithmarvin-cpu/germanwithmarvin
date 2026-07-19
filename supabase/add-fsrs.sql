-- FSRS-Umstellung: zwei Gedächtnis-Felder pro Karte.
--   stability  = wie lange die Karte "hält" (Tage)
--   difficulty = wie zäh die Karte ist (1–10)
-- Bestehende Karten laufen weiter: fehlen die Werte, schätzt die App die
-- Stabilität beim nächsten Review aus dem bisherigen Intervall.
-- Idempotent – kann gefahrlos mehrfach ausgeführt werden.

alter table public.fc_card_states
  add column if not exists stability  double precision,
  add column if not exists difficulty double precision;
