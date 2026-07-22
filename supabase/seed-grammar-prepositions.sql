-- ============================================================================
-- GRAMMATIK-DECKS: Präpositionen & Verb-Nomen-Verbindungen (Ergänzung)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Idempotent: löscht NUR die vier
-- unten erzeugten Decks und legt sie neu an — alle anderen Decks und der
-- Lernfortschritt darauf bleiben unberührt.
--
-- Ergänzt die bestehenden Grammatik-Decks (sort_order 1–10) um:
--   11) Verben mit festen Präpositionen
--   12) Adjektive mit festen Präpositionen
--   13) Verb-Nomen-Verbindungen (Funktionsverbgefüge)
--   14) Gemischtes Rate-Deck: welcher Fall? (Akk/Dat/Gen/Wechsel/fest)
--
-- HINWEIS zum Misch-Deck: Es bekommt bewusst KEINE Kasus-Tags (akk/dat/...),
-- weil das Kasus-Symbol sonst schon auf der Vorderseite die Antwort verrät.
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';
alter table public.fc_decks add column if not exists category   text not null default 'path';

-- Nur die vier neuen Decks entfernen (idempotent, schont alle anderen).
delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar'
  and (title in (
    'Verbs with fixed prepositions',
    'Adjectives with fixed prepositions',
    'Verb-noun collocations'
  )
  -- Muster statt exaktem Titel: faengt auch Altbestand mit zerstoerten
  -- Sonderzeichen ab (sonst entsteht beim Neuimport ein Duplikat).
  or title like '%mixed challenge%');


-- 11) Verben mit festen Präpositionen 📌
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verbs with fixed prepositions', 'Verbs bound to one fixed preposition', 'A2', true, 'grammar', 11)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('warten auf + A', 'to wait for', 'fixed preposition + accusative', '{akk}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 1),
  ('denken an + A', 'to think of / about', 'fixed preposition + accusative', '{akk}', 'Ich denke oft an dich.', 'I often think of you.', 2),
  ('sich freuen auf + A', 'to look forward to', 'future event', '{akk}', 'Ich freue mich auf das Wochenende.', 'I am looking forward to the weekend.', 3),
  ('sich freuen über + A', 'to be happy about', 'something that happened', '{akk}', 'Sie freut sich über das Geschenk.', 'She is happy about the present.', 4),
  ('sich interessieren für + A', 'to be interested in', 'fixed preposition + accusative', '{akk}', 'Er interessiert sich für Musik.', 'He is interested in music.', 5),
  ('sich erinnern an + A', 'to remember', 'fixed preposition + accusative', '{akk}', 'Erinnerst du dich an den Sommer?', 'Do you remember the summer?', 6),
  ('sich ärgern über + A', 'to be annoyed about', 'fixed preposition + accusative', '{akk}', 'Ich ärgere mich über den Stau.', 'I am annoyed about the traffic jam.', 7),
  ('sprechen über + A', 'to talk about', 'also: reden über + A', '{akk}', 'Wir sprechen über die Arbeit.', 'We are talking about work.', 8),
  ('bitten um + A', 'to ask for', 'fixed preposition + accusative', '{akk}', 'Ich bitte um Hilfe.', 'I am asking for help.', 9),
  ('sich kümmern um + A', 'to take care of', 'fixed preposition + accusative', '{akk}', 'Er kümmert sich um die Kinder.', 'He takes care of the children.', 10),
  ('teilnehmen an + D', 'to take part in', 'separable: nimmt ... teil', '{dat}', 'Sie nimmt an dem Kurs teil.', 'She takes part in the course.', 11),
  ('gehören zu + D', 'to belong to / be part of', 'fixed preposition + dative', '{dat}', 'Das gehört zu meiner Arbeit.', 'That is part of my job.', 12),
  ('sich treffen mit + D', 'to meet (with)', 'fixed preposition + dative', '{dat}', 'Ich treffe mich mit Anna.', 'I am meeting Anna.', 13),
  ('helfen bei + D', 'to help with', 'fixed preposition + dative', '{dat}', 'Er hilft mir bei den Hausaufgaben.', 'He helps me with the homework.', 14),
  ('leiden unter + D', 'to suffer from', 'fixed preposition + dative', '{dat}', 'Sie leidet unter Stress.', 'She suffers from stress.', 15),
  ('träumen von + D', 'to dream of', 'fixed preposition + dative', '{dat}', 'Ich träume von einem Urlaub.', 'I dream of a holiday.', 16),
  ('sich fürchten vor + D', 'to be afraid of', 'also: Angst haben vor + D', '{dat}', 'Er fürchtet sich vor Hunden.', 'He is afraid of dogs.', 17),
  ('abhängen von + D', 'to depend on', 'separable: hängt ... ab', '{dat}', 'Das hängt vom Wetter ab.', 'That depends on the weather.', 18)
) as v(front, back, notes, tags, example, example_en, ord);


-- 12) Adjektive mit festen Präpositionen 📌
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Adjectives with fixed prepositions', 'Adjectives bound to one fixed preposition', 'B1', true, 'grammar', 12)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('stolz auf + A', 'proud of', 'fixed preposition + accusative', '{akk}', 'Ich bin stolz auf dich.', 'I am proud of you.', 1),
  ('böse auf + A', 'angry at', 'fixed preposition + accusative', '{akk}', 'Sie ist böse auf ihren Bruder.', 'She is angry at her brother.', 2),
  ('gespannt auf + A', 'excited about / curious about', 'fixed preposition + accusative', '{akk}', 'Ich bin gespannt auf den Film.', 'I am excited about the film.', 3),
  ('typisch für + A', 'typical of', 'fixed preposition + accusative', '{akk}', 'Das ist typisch für ihn.', 'That is typical of him.', 4),
  ('verantwortlich für + A', 'responsible for', 'fixed preposition + accusative', '{akk}', 'Wer ist verantwortlich für das Projekt?', 'Who is responsible for the project?', 5),
  ('dankbar für + A', 'grateful for', 'fixed preposition + accusative', '{akk}', 'Ich bin dankbar für deine Hilfe.', 'I am grateful for your help.', 6),
  ('eifersüchtig auf + A', 'jealous of', 'fixed preposition + accusative', '{akk}', 'Er ist eifersüchtig auf seinen Kollegen.', 'He is jealous of his colleague.', 7),
  ('traurig über + A', 'sad about', 'fixed preposition + accusative', '{akk}', 'Wir sind traurig über die Nachricht.', 'We are sad about the news.', 8),
  ('zufrieden mit + D', 'satisfied with', 'fixed preposition + dative', '{dat}', 'Sie ist zufrieden mit dem Ergebnis.', 'She is satisfied with the result.', 9),
  ('verheiratet mit + D', 'married to', 'fixed preposition + dative', '{dat}', 'Er ist verheiratet mit einer Ärztin.', 'He is married to a doctor.', 10),
  ('beliebt bei + D', 'popular with', 'fixed preposition + dative', '{dat}', 'Der Lehrer ist beliebt bei den Schülern.', 'The teacher is popular with the students.', 11),
  ('reich an + D', 'rich in', 'fixed preposition + dative', '{dat}', 'Obst ist reich an Vitaminen.', 'Fruit is rich in vitamins.', 12),
  ('abhängig von + D', 'dependent on', 'fixed preposition + dative', '{dat}', 'Das ist abhängig von der Zeit.', 'That is dependent on the time.', 13),
  ('freundlich zu + D', 'friendly to', 'fixed preposition + dative', '{dat}', 'Sei freundlich zu deinen Gästen.', 'Be friendly to your guests.', 14),
  ('einverstanden mit + D', 'in agreement with', 'fixed preposition + dative', '{dat}', 'Ich bin einverstanden mit dem Plan.', 'I agree with the plan.', 15),
  ('bekannt für + A', 'famous for', 'fixed preposition + accusative', '{akk}', 'München ist bekannt für sein Oktoberfest.', 'Munich is famous for its Oktoberfest.', 16)
) as v(front, back, notes, tags, example, example_en, ord);


-- 13) Verb-Nomen-Verbindungen (Funktionsverbgefüge) 🔗
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verb-noun collocations', 'Funktionsverbgefüge: fixed verb + noun pairs', 'B1', true, 'grammar', 13)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('eine Entscheidung treffen', 'to make a decision', 'not "machen"', '{fvg}', 'Wir müssen eine Entscheidung treffen.', 'We have to make a decision.', 1),
  ('eine Frage stellen', 'to ask a question', 'not "fragen machen"', '{fvg}', 'Darf ich eine Frage stellen?', 'May I ask a question?', 2),
  ('einen Vorschlag machen', 'to make a suggestion', 'fixed pair', '{fvg}', 'Ich möchte einen Vorschlag machen.', 'I would like to make a suggestion.', 3),
  ('eine Antwort geben', 'to give an answer', 'fixed pair', '{fvg}', 'Er gibt mir keine Antwort.', 'He does not give me an answer.', 4),
  ('Angst haben vor + D', 'to be afraid of', 'noun + fixed preposition', '{fvg}', 'Ich habe Angst vor Spinnen.', 'I am afraid of spiders.', 5),
  ('eine Rolle spielen', 'to play a role / to matter', 'fixed pair', '{fvg}', 'Das Wetter spielt eine große Rolle.', 'The weather plays a big role.', 6),
  ('eine Pause machen', 'to take a break', 'fixed pair', '{fvg}', 'Lass uns eine Pause machen.', 'Let us take a break.', 7),
  ('einen Fehler machen', 'to make a mistake', 'fixed pair', '{fvg}', 'Jeder macht mal einen Fehler.', 'Everyone makes a mistake sometimes.', 8),
  ('Sport treiben', 'to do sports', 'not "machen" in formal style', '{fvg}', 'Ich treibe dreimal pro Woche Sport.', 'I do sports three times a week.', 9),
  ('einen Termin vereinbaren', 'to make an appointment', 'formal', '{fvg}', 'Ich möchte einen Termin vereinbaren.', 'I would like to make an appointment.', 10),
  ('Bescheid geben', 'to let someone know', 'dative person: mir Bescheid geben', '{fvg}', 'Gib mir bitte Bescheid.', 'Please let me know.', 11),
  ('Rücksicht nehmen auf + A', 'to show consideration for', 'noun + fixed preposition', '{fvg}', 'Nimm Rücksicht auf die Nachbarn.', 'Show consideration for the neighbours.', 12),
  ('zur Verfügung stehen', 'to be available', 'formal, fixed', '{fvg}', 'Ich stehe Ihnen zur Verfügung.', 'I am available to you.', 13),
  ('in Frage kommen', 'to be an option', 'formal, fixed', '{fvg}', 'Das kommt nicht in Frage.', 'That is out of the question.', 14),
  ('Abschied nehmen von + D', 'to say goodbye to', 'noun + fixed preposition', '{fvg}', 'Wir nehmen Abschied von unseren Gästen.', 'We say goodbye to our guests.', 15),
  ('Kritik üben an + D', 'to criticize', 'formal, noun + preposition', '{fvg}', 'Er übt Kritik an dem Plan.', 'He criticizes the plan.', 16),
  ('einen Antrag stellen', 'to file an application', 'official language', '{fvg}', 'Ich stelle einen Antrag auf Urlaub.', 'I file an application for leave.', 17),
  ('Aufmerksamkeit schenken + D', 'to pay attention to', 'formal, dative object', '{fvg}', 'Schenk dem Detail mehr Aufmerksamkeit.', 'Pay more attention to the detail.', 18)
) as v(front, back, notes, tags, example, example_en, ord);


-- 14) Gemischtes Rate-Deck: Welcher Fall? 🎲
--     KEINE Kasus-Tags — sonst verrät das Symbol die Antwort auf der Vorderseite.
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Prepositions · mixed challenge', 'Which case? accusative, dative, genitive, two-way or fixed', 'B1', true, 'grammar', 14)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('für', '🎯 Akkusativ — for', 'always accusative', '{mixed}', 'Das ist für meinen Bruder.', 'That is for my brother.', 1),
  ('ohne', '🎯 Akkusativ — without', 'always accusative', '{mixed}', 'Ich gehe ohne dich.', 'I am going without you.', 2),
  ('durch', '🎯 Akkusativ — through', 'always accusative', '{mixed}', 'Wir laufen durch den Wald.', 'We walk through the forest.', 3),
  ('gegen', '🎯 Akkusativ — against', 'always accusative', '{mixed}', 'Das Auto fuhr gegen einen Baum.', 'The car drove into a tree.', 4),
  ('um', '🎯 Akkusativ — around / at', 'always accusative', '{mixed}', 'Wir sitzen um den Tisch.', 'We sit around the table.', 5),
  ('mit', '⭐ Dativ — with', 'always dative', '{mixed}', 'Ich fahre mit dem Zug.', 'I travel by train.', 6),
  ('seit', '⭐ Dativ — since / for', 'always dative', '{mixed}', 'Ich lerne seit einem Jahr Deutsch.', 'I have been learning German for a year.', 7),
  ('aus', '⭐ Dativ — from / out of', 'always dative', '{mixed}', 'Sie kommt aus der Schweiz.', 'She comes from Switzerland.', 8),
  ('bei', '⭐ Dativ — at / near / with', 'always dative', '{mixed}', 'Ich wohne bei meinen Eltern.', 'I live with my parents.', 9),
  ('nach', '⭐ Dativ — after / to', 'always dative', '{mixed}', 'Nach der Arbeit gehe ich heim.', 'After work I go home.', 10),
  ('von', '⭐ Dativ — from / of', 'always dative', '{mixed}', 'Das ist ein Geschenk von meiner Oma.', 'That is a present from my grandma.', 11),
  ('zu', '⭐ Dativ — to', 'always dative', '{mixed}', 'Ich gehe zu dem Arzt.', 'I am going to the doctor.', 12),
  ('gegenüber', '⭐ Dativ — opposite', 'often after the noun', '{mixed}', 'Die Bank ist dem Park gegenüber.', 'The bank is opposite the park.', 13),
  ('wegen', '👑 Genitiv — because of', 'genitive (colloquially also dative)', '{mixed}', 'Wegen des Regens bleiben wir zu Hause.', 'Because of the rain we stay at home.', 14),
  ('trotz', '👑 Genitiv — despite', 'genitive', '{mixed}', 'Trotz des Wetters gehen wir raus.', 'Despite the weather we go outside.', 15),
  ('während', '👑 Genitiv — during', 'genitive', '{mixed}', 'Während der Pause esse ich.', 'During the break I eat.', 16),
  ('statt / anstatt', '👑 Genitiv — instead of', 'genitive', '{mixed}', 'Statt des Autos nehme ich das Rad.', 'Instead of the car I take the bike.', 17),
  ('innerhalb', '👑 Genitiv — within', 'genitive', '{mixed}', 'Innerhalb einer Woche ist es fertig.', 'Within a week it is done.', 18),
  ('in', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich gehe in die Schule. / Ich bin in der Schule.', 'I go into the school. / I am in the school.', 19),
  ('auf', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich lege das Buch auf den Tisch. / Es liegt auf dem Tisch.', 'I put the book on the table. / It lies on the table.', 20),
  ('an', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich hänge das Bild an die Wand. / Es hängt an der Wand.', 'I hang the picture on the wall. / It hangs on the wall.', 21),
  ('über', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Die Lampe kommt über den Tisch. / Sie hängt über dem Tisch.', 'The lamp goes above the table. / It hangs above the table.', 22),
  ('unter', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Die Katze läuft unter das Bett. / Sie schläft unter dem Bett.', 'The cat runs under the bed. / It sleeps under the bed.', 23),
  ('vor', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich stelle das Rad vor das Haus. / Es steht vor dem Haus.', 'I put the bike in front of the house. / It stands in front of the house.', 24),
  ('hinter', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Er geht hinter das Haus. / Er ist hinter dem Haus.', 'He goes behind the house. / He is behind the house.', 25),
  ('neben', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Setz dich neben mich. / Du sitzt neben mir.', 'Sit down next to me. / You sit next to me.', 26),
  ('zwischen', '🎯⭐ Wechsel — Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Stell es zwischen die Stühle. / Es steht zwischen den Stühlen.', 'Put it between the chairs. / It stands between the chairs.', 27),
  ('warten ___ den Bus', '📌 feste Präposition: warten auf + Akkusativ', 'the verb decides the preposition', '{mixed}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 28),
  ('teilnehmen ___ dem Kurs', '📌 feste Präposition: teilnehmen an + Dativ', 'the verb decides the preposition', '{mixed}', 'Sie nimmt an dem Kurs teil.', 'She takes part in the course.', 29),
  ('sich freuen ___ das Geschenk', '📌 feste Präposition: sich freuen über + Akkusativ', 'über = something that happened', '{mixed}', 'Sie freut sich über das Geschenk.', 'She is happy about the present.', 30),
  ('träumen ___ einem Urlaub', '📌 feste Präposition: träumen von + Dativ', 'the verb decides the preposition', '{mixed}', 'Ich träume von einem Urlaub.', 'I dream of a holiday.', 31),
  ('stolz ___ dich', '📌 feste Präposition: stolz auf + Akkusativ', 'adjective with fixed preposition', '{mixed}', 'Ich bin stolz auf dich.', 'I am proud of you.', 32),
  ('zufrieden ___ dem Ergebnis', '📌 feste Präposition: zufrieden mit + Dativ', 'adjective with fixed preposition', '{mixed}', 'Sie ist zufrieden mit dem Ergebnis.', 'She is satisfied with the result.', 33)
) as v(front, back, notes, tags, example, example_en, ord);
