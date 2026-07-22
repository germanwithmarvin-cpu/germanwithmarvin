-- ============================================================================
-- FIX: Abfragerichtung im Deck "Prepositions - mixed challenge"
-- ----------------------------------------------------------------------------
-- Der Trainer startet in "English -> German" und zeigt damit die RUECKSEITE als
-- Frage. Im Rate-Deck stand die Loesung auf der Rueckseite ("Akkusativ - for"),
-- der Schueler sah also die Antwort und sollte die Praeposition nennen - genau
-- verkehrt herum.
--
-- Diese Datei dreht Vorder- und Rueckseite in DIESEM Deck um, damit die
-- Standardrichtung die gewuenschte Uebung ergibt:
--     Frage  = die Praeposition        (z. B. "fuer", "wegen", "warten ___ den Bus")
--     Antwort= welcher Fall            (z. B. "Akkusativ - for")
--
-- Mehrfach ausfuehrbar: getauscht wird nur, solange die Loesung noch hinten
-- steht (erkennbar an den Fall-Woertern). Ein zweiter Lauf aendert nichts.
-- ============================================================================

update public.fc_cards c
set front = c.back,
    back  = c.front
from public.fc_decks d
where c.deck_id = d.id
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and d.category = 'grammar'
  and d.title like '%mixed challenge%'
  -- Schutz gegen doppeltes Ausfuehren: nur tauschen, wenn die Fall-Angabe
  -- noch NICHT vorne steht.
  and c.front not like '%Akkusativ%'
  and c.front not like '%Dativ%'
  and c.front not like '%Genitiv%'
  and c.front not like '%Wechsel%'
  and c.front not like '%feste%';

-- Kontrolle: vorne muss die Praeposition stehen, hinten die Loesung.
select c.front as frage, c.back as antwort
from public.fc_cards c
join public.fc_decks d on d.id = c.deck_id
where d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and d.category = 'grammar'
  and d.title like '%mixed challenge%'
order by c.sort_order
limit 5;
