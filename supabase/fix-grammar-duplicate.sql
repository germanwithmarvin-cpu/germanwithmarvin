-- ============================================================================
-- AUFRAEUMEN: doppeltes "mixed challenge"-Deck entfernen
-- ----------------------------------------------------------------------------
-- Beim ersten Import waren die Sonderzeichen zerstoert (Titel mit Zeichensalat
-- statt Mittelpunkt). Die Aufraeum-Zeile im Seed traf nur den korrekten Titel
-- und liess das kaputte Deck stehen -> es entstand ein Duplikat.
--
-- Loescht gezielt alle Grammatik-Decks, deren Titel auf "mixed challenge" endet,
-- AUSSER dem korrekt geschriebenen. Reines ASCII, mehrfach ausfuehrbar.
-- Auf dem kaputten Deck gibt es keinen Lernfortschritt (0/33), es geht nichts verloren.
-- ============================================================================

delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar'
  and title like '%mixed challenge%'
  and title <> E'Prepositions \u00b7 mixed challenge';

-- Kontrolle: sollte genau eine Zeile liefern.
select title, level, sort_order
from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar'
  and title like '%mixed challenge%';
