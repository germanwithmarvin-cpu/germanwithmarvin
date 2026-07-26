-- ============================================================================
-- Thanh Ha: Profiltext, Preis-Anzeige, Foto-Version aktualisieren
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Betrifft nur teacher id = 2 (Anzeige auf /booking).
--
-- HINWEIS Preis: hourly_rate_cents ist nur die ANZEIGE ($30). Damit auch der
-- echte Stripe-Preis $30 ist, muss Marvin in Stripe einen $30-Preis anlegen und
-- die neue price_... schicken -> dann wird teachers.stripe_price_id getauscht.
-- (Gefahrlos: Thanh Ha ist noch inaktiv, niemand zahlt.)
-- ============================================================================

update public.teachers
set
  bio = $$Trilingual linguist with a Master's in Linguistics, specializing in teaching German to Vietnamese and English native speakers — clear explanations in your own language for smooth learning.$$,
  highlights = $$["Hundreds of 1-on-1 lessons · A1–B2","Fluent in Vietnamese, English & German — great for Vietnamese and English speakers"]$$::jsonb,
  hourly_rate_cents = 3000,
  photo_url = $$/teachers/thanh-ha.jpg?v=2$$
where id = 2;

select id, name, hourly_rate_cents, photo_url, bio from public.teachers where id = 2;
