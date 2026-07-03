-- ============================================================================
-- VERB-KASUS-MARKER nachtragen — German Simplified Flashcards
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Verändert NUR die Tags (Marker),
-- löscht nichts, kein Fortschritt geht verloren. Mehrfach ausführbar.
--
-- Setzt 🎯 (akk) bei transitiven Verben und ⭐ (dat) bei Dativ-Verben — überall,
-- wo das jeweilige Verb als Karte vorkommt. Karten, die schon einen Kasus-Tag
-- haben (akk/dat/gen/wechsel), werden NICHT verändert. Nur Verb-Karten ('verb').
-- Reflexive Verben (sich ...) werden bewusst nicht markiert.
-- Nach einem erneuten Seed-Import diese Datei einfach noch einmal ausführen.
-- ============================================================================

-- 1) Dativ-Verben → ⭐
update public.fc_cards c
set tags = array_prepend('dat', c.tags)
where 'verb' = any(c.tags)
  and not (c.tags && array['akk','dat','gen','wechsel']::text[])
  and c.front = any(array[
    'antworten','helfen','danken','gehören','gefallen','vertrauen','passen',
    'schmecken','gratulieren','folgen','zuhören','glauben','begegnen','schaden',
    'gelingen','fehlen','wehtun'
  ])
  and c.deck_id in (select id from public.fc_decks
    where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com'));

-- 2) Transitive Verben (Akkusativ-Objekt) → 🎯
update public.fc_cards c
set tags = array_prepend('akk', c.tags)
where 'verb' = any(c.tags)
  and not (c.tags && array['akk','dat','gen','wechsel']::text[])
  and c.front = any(array[
    'essen','trinken','sehen','hören','machen','lernen','spielen','kaufen','kochen',
    'lesen','schreiben','verstehen','brauchen','nehmen','finden','fragen','bringen',
    'holen','geben','benutzen','wiederholen','vergessen','versuchen','suchen','besuchen',
    'besichtigen','entdecken','erleben','verbringen','verändern','schützen','vermeiden',
    'verbessern','üben','bestellen','reservieren','bezahlen','mieten','vermieten',
    'reparieren','packen','buchen','tragen','putzen','aufräumen','vorbereiten','erledigen',
    'gewinnen','verlieren','schaffen','leiten','verdienen','überzeugen','vergleichen',
    'begründen','erwähnen','behaupten','teilen','speichern','löschen','hochladen',
    'herunterladen','recyceln','trennen','untersuchen','malen','singen','mögen','möchten',
    'sparen','einstellen','einrichten','abheben','überweisen','kündigen','anrufen',
    'einladen','mitbringen','abholen','anmachen','ausmachen','zeigen','erklären','erzählen',
    'empfehlen','bekommen','tragen','waschen','kämmen','rasieren','decken','lieben',
    'vermissen','verzeihen','treffen','gründen','nutzen','schicken','kennen','wissen'
  ])
  and c.deck_id in (select id from public.fc_decks
    where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com'));

-- Hinweis: zeigen/erklären/erzählen/empfehlen/geben/schicken sind ditransitiv
-- (Akk + Dat). Sie sind hier als Akkusativ markiert (das direkte Objekt).
