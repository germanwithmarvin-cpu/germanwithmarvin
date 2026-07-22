-- ============================================================================
-- GRAMMATIK-DECKS: Praepositionen & Verb-Nomen-Verbindungen (Ergaenzung)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent: loescht NUR die vier
-- unten erzeugten Decks und legt sie neu an - alle anderen Decks und der
-- Lernfortschritt darauf bleiben unberuehrt.
--
-- Ergaenzt die bestehenden Grammatik-Decks (sort_order 1-10) um:
--   11) Verben mit festen Praepositionen
--   12) Adjektive mit festen Praepositionen
--   13) Verb-Nomen-Verbindungen (Funktionsverbgefuege)
--   14) Gemischtes Rate-Deck: welcher Fall? (Akk/Dat/Gen/Wechsel/fest)
--
-- HINWEIS zum Misch-Deck: Es bekommt bewusst KEINE Kasus-Tags (akk/dat/...),
-- weil das Kasus-Symbol sonst schon auf der Vorderseite die Antwort verraet.
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';
alter table public.fc_decks add column if not exists category   text not null default 'path';

-- Nur die vier neuen Decks entfernen (idempotent, schont alle anderen).
delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar'
  and title in (
    'Verbs with fixed prepositions',
    'Adjectives with fixed prepositions',
    'Verb-noun collocations',
    E'Prepositions \u00b7 mixed challenge'
  );


-- 11) Verben mit festen Praepositionen ?
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
  (E'sich freuen \u00fcber + A', 'to be happy about', 'something that happened', '{akk}', E'Sie freut sich \u00fcber das Geschenk.', 'She is happy about the present.', 4),
  (E'sich interessieren f\u00fcr + A', 'to be interested in', 'fixed preposition + accusative', '{akk}', E'Er interessiert sich f\u00fcr Musik.', 'He is interested in music.', 5),
  ('sich erinnern an + A', 'to remember', 'fixed preposition + accusative', '{akk}', 'Erinnerst du dich an den Sommer?', 'Do you remember the summer?', 6),
  (E'sich \u00e4rgern \u00fcber + A', 'to be annoyed about', 'fixed preposition + accusative', '{akk}', E'Ich \u00e4rgere mich \u00fcber den Stau.', 'I am annoyed about the traffic jam.', 7),
  (E'sprechen \u00fcber + A', 'to talk about', E'also: reden \u00fcber + A', '{akk}', E'Wir sprechen \u00fcber die Arbeit.', 'We are talking about work.', 8),
  ('bitten um + A', 'to ask for', 'fixed preposition + accusative', '{akk}', 'Ich bitte um Hilfe.', 'I am asking for help.', 9),
  (E'sich k\u00fcmmern um + A', 'to take care of', 'fixed preposition + accusative', '{akk}', E'Er k\u00fcmmert sich um die Kinder.', 'He takes care of the children.', 10),
  ('teilnehmen an + D', 'to take part in', 'separable: nimmt ... teil', '{dat}', 'Sie nimmt an dem Kurs teil.', 'She takes part in the course.', 11),
  (E'geh\u00f6ren zu + D', 'to belong to / be part of', 'fixed preposition + dative', '{dat}', E'Das geh\u00f6rt zu meiner Arbeit.', 'That is part of my job.', 12),
  ('sich treffen mit + D', 'to meet (with)', 'fixed preposition + dative', '{dat}', 'Ich treffe mich mit Anna.', 'I am meeting Anna.', 13),
  ('helfen bei + D', 'to help with', 'fixed preposition + dative', '{dat}', 'Er hilft mir bei den Hausaufgaben.', 'He helps me with the homework.', 14),
  ('leiden unter + D', 'to suffer from', 'fixed preposition + dative', '{dat}', 'Sie leidet unter Stress.', 'She suffers from stress.', 15),
  (E'tr\u00e4umen von + D', 'to dream of', 'fixed preposition + dative', '{dat}', E'Ich tr\u00e4ume von einem Urlaub.', 'I dream of a holiday.', 16),
  (E'sich f\u00fcrchten vor + D', 'to be afraid of', 'also: Angst haben vor + D', '{dat}', E'Er f\u00fcrchtet sich vor Hunden.', 'He is afraid of dogs.', 17),
  (E'abh\u00e4ngen von + D', 'to depend on', E'separable: h\u00e4ngt ... ab', '{dat}', E'Das h\u00e4ngt vom Wetter ab.', 'That depends on the weather.', 18)
) as v(front, back, notes, tags, example, example_en, ord);


-- 12) Adjektive mit festen Praepositionen ?
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Adjectives with fixed prepositions', 'Adjectives bound to one fixed preposition', 'B1', true, 'grammar', 12)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('stolz auf + A', 'proud of', 'fixed preposition + accusative', '{akk}', 'Ich bin stolz auf dich.', 'I am proud of you.', 1),
  (E'b\u00f6se auf + A', 'angry at', 'fixed preposition + accusative', '{akk}', E'Sie ist b\u00f6se auf ihren Bruder.', 'She is angry at her brother.', 2),
  ('gespannt auf + A', 'excited about / curious about', 'fixed preposition + accusative', '{akk}', 'Ich bin gespannt auf den Film.', 'I am excited about the film.', 3),
  (E'typisch f\u00fcr + A', 'typical of', 'fixed preposition + accusative', '{akk}', E'Das ist typisch f\u00fcr ihn.', 'That is typical of him.', 4),
  (E'verantwortlich f\u00fcr + A', 'responsible for', 'fixed preposition + accusative', '{akk}', E'Wer ist verantwortlich f\u00fcr das Projekt?', 'Who is responsible for the project?', 5),
  (E'dankbar f\u00fcr + A', 'grateful for', 'fixed preposition + accusative', '{akk}', E'Ich bin dankbar f\u00fcr deine Hilfe.', 'I am grateful for your help.', 6),
  (E'eifers\u00fcchtig auf + A', 'jealous of', 'fixed preposition + accusative', '{akk}', E'Er ist eifers\u00fcchtig auf seinen Kollegen.', 'He is jealous of his colleague.', 7),
  (E'traurig \u00fcber + A', 'sad about', 'fixed preposition + accusative', '{akk}', E'Wir sind traurig \u00fcber die Nachricht.', 'We are sad about the news.', 8),
  ('zufrieden mit + D', 'satisfied with', 'fixed preposition + dative', '{dat}', 'Sie ist zufrieden mit dem Ergebnis.', 'She is satisfied with the result.', 9),
  ('verheiratet mit + D', 'married to', 'fixed preposition + dative', '{dat}', E'Er ist verheiratet mit einer \u00c4rztin.', 'He is married to a doctor.', 10),
  ('beliebt bei + D', 'popular with', 'fixed preposition + dative', '{dat}', E'Der Lehrer ist beliebt bei den Sch\u00fclern.', 'The teacher is popular with the students.', 11),
  ('reich an + D', 'rich in', 'fixed preposition + dative', '{dat}', 'Obst ist reich an Vitaminen.', 'Fruit is rich in vitamins.', 12),
  (E'abh\u00e4ngig von + D', 'dependent on', 'fixed preposition + dative', '{dat}', E'Das ist abh\u00e4ngig von der Zeit.', 'That is dependent on the time.', 13),
  ('freundlich zu + D', 'friendly to', 'fixed preposition + dative', '{dat}', E'Sei freundlich zu deinen G\u00e4sten.', 'Be friendly to your guests.', 14),
  ('einverstanden mit + D', 'in agreement with', 'fixed preposition + dative', '{dat}', 'Ich bin einverstanden mit dem Plan.', 'I agree with the plan.', 15),
  (E'bekannt f\u00fcr + A', 'famous for', 'fixed preposition + accusative', '{akk}', E'M\u00fcnchen ist bekannt f\u00fcr sein Oktoberfest.', 'Munich is famous for its Oktoberfest.', 16)
) as v(front, back, notes, tags, example, example_en, ord);


-- 13) Verb-Nomen-Verbindungen (Funktionsverbgefuege) ?
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verb-noun collocations', E'Funktionsverbgef\u00fcge: fixed verb + noun pairs', 'B1', true, 'grammar', 13)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('eine Entscheidung treffen', 'to make a decision', 'not "machen"', '{fvg}', E'Wir m\u00fcssen eine Entscheidung treffen.', 'We have to make a decision.', 1),
  ('eine Frage stellen', 'to ask a question', 'not "fragen machen"', '{fvg}', 'Darf ich eine Frage stellen?', 'May I ask a question?', 2),
  ('einen Vorschlag machen', 'to make a suggestion', 'fixed pair', '{fvg}', E'Ich m\u00f6chte einen Vorschlag machen.', 'I would like to make a suggestion.', 3),
  ('eine Antwort geben', 'to give an answer', 'fixed pair', '{fvg}', 'Er gibt mir keine Antwort.', 'He does not give me an answer.', 4),
  ('Angst haben vor + D', 'to be afraid of', 'noun + fixed preposition', '{fvg}', 'Ich habe Angst vor Spinnen.', 'I am afraid of spiders.', 5),
  ('eine Rolle spielen', 'to play a role / to matter', 'fixed pair', '{fvg}', E'Das Wetter spielt eine gro\u00dfe Rolle.', 'The weather plays a big role.', 6),
  ('eine Pause machen', 'to take a break', 'fixed pair', '{fvg}', 'Lass uns eine Pause machen.', 'Let us take a break.', 7),
  ('einen Fehler machen', 'to make a mistake', 'fixed pair', '{fvg}', 'Jeder macht mal einen Fehler.', 'Everyone makes a mistake sometimes.', 8),
  ('Sport treiben', 'to do sports', 'not "machen" in formal style', '{fvg}', 'Ich treibe dreimal pro Woche Sport.', 'I do sports three times a week.', 9),
  ('einen Termin vereinbaren', 'to make an appointment', 'formal', '{fvg}', E'Ich m\u00f6chte einen Termin vereinbaren.', 'I would like to make an appointment.', 10),
  ('Bescheid geben', 'to let someone know', 'dative person: mir Bescheid geben', '{fvg}', 'Gib mir bitte Bescheid.', 'Please let me know.', 11),
  (E'R\u00fccksicht nehmen auf + A', 'to show consideration for', 'noun + fixed preposition', '{fvg}', E'Nimm R\u00fccksicht auf die Nachbarn.', 'Show consideration for the neighbours.', 12),
  (E'zur Verf\u00fcgung stehen', 'to be available', 'formal, fixed', '{fvg}', E'Ich stehe Ihnen zur Verf\u00fcgung.', 'I am available to you.', 13),
  ('in Frage kommen', 'to be an option', 'formal, fixed', '{fvg}', 'Das kommt nicht in Frage.', 'That is out of the question.', 14),
  ('Abschied nehmen von + D', 'to say goodbye to', 'noun + fixed preposition', '{fvg}', E'Wir nehmen Abschied von unseren G\u00e4sten.', 'We say goodbye to our guests.', 15),
  (E'Kritik \u00fcben an + D', 'to criticize', 'formal, noun + preposition', '{fvg}', E'Er \u00fcbt Kritik an dem Plan.', 'He criticizes the plan.', 16),
  ('einen Antrag stellen', 'to file an application', 'official language', '{fvg}', 'Ich stelle einen Antrag auf Urlaub.', 'I file an application for leave.', 17),
  ('Aufmerksamkeit schenken + D', 'to pay attention to', 'formal, dative object', '{fvg}', 'Schenk dem Detail mehr Aufmerksamkeit.', 'Pay more attention to the detail.', 18)
) as v(front, back, notes, tags, example, example_en, ord);


-- 14) Gemischtes Rate-Deck: Welcher Fall? ?
--     KEINE Kasus-Tags - sonst verraet das Symbol die Antwort auf der Vorderseite.
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    E'Prepositions \u00b7 mixed challenge', 'Which case? accusative, dative, genitive, two-way or fixed', 'B1', true, 'grammar', 14)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  (E'f\u00fcr', E'\U0001F3AF Akkusativ \u2014 for', 'always accusative', '{mixed}', E'Das ist f\u00fcr meinen Bruder.', 'That is for my brother.', 1),
  ('ohne', E'\U0001F3AF Akkusativ \u2014 without', 'always accusative', '{mixed}', 'Ich gehe ohne dich.', 'I am going without you.', 2),
  ('durch', E'\U0001F3AF Akkusativ \u2014 through', 'always accusative', '{mixed}', 'Wir laufen durch den Wald.', 'We walk through the forest.', 3),
  ('gegen', E'\U0001F3AF Akkusativ \u2014 against', 'always accusative', '{mixed}', 'Das Auto fuhr gegen einen Baum.', 'The car drove into a tree.', 4),
  ('um', E'\U0001F3AF Akkusativ \u2014 around / at', 'always accusative', '{mixed}', 'Wir sitzen um den Tisch.', 'We sit around the table.', 5),
  ('mit', E'\u2b50 Dativ \u2014 with', 'always dative', '{mixed}', 'Ich fahre mit dem Zug.', 'I travel by train.', 6),
  ('seit', E'\u2b50 Dativ \u2014 since / for', 'always dative', '{mixed}', 'Ich lerne seit einem Jahr Deutsch.', 'I have been learning German for a year.', 7),
  ('aus', E'\u2b50 Dativ \u2014 from / out of', 'always dative', '{mixed}', 'Sie kommt aus der Schweiz.', 'She comes from Switzerland.', 8),
  ('bei', E'\u2b50 Dativ \u2014 at / near / with', 'always dative', '{mixed}', 'Ich wohne bei meinen Eltern.', 'I live with my parents.', 9),
  ('nach', E'\u2b50 Dativ \u2014 after / to', 'always dative', '{mixed}', 'Nach der Arbeit gehe ich heim.', 'After work I go home.', 10),
  ('von', E'\u2b50 Dativ \u2014 from / of', 'always dative', '{mixed}', 'Das ist ein Geschenk von meiner Oma.', 'That is a present from my grandma.', 11),
  ('zu', E'\u2b50 Dativ \u2014 to', 'always dative', '{mixed}', 'Ich gehe zu dem Arzt.', 'I am going to the doctor.', 12),
  (E'gegen\u00fcber', E'\u2b50 Dativ \u2014 opposite', 'often after the noun', '{mixed}', E'Die Bank ist dem Park gegen\u00fcber.', 'The bank is opposite the park.', 13),
  ('wegen', E'\U0001F451 Genitiv \u2014 because of', 'genitive (colloquially also dative)', '{mixed}', 'Wegen des Regens bleiben wir zu Hause.', 'Because of the rain we stay at home.', 14),
  ('trotz', E'\U0001F451 Genitiv \u2014 despite', 'genitive', '{mixed}', 'Trotz des Wetters gehen wir raus.', 'Despite the weather we go outside.', 15),
  (E'w\u00e4hrend', E'\U0001F451 Genitiv \u2014 during', 'genitive', '{mixed}', E'W\u00e4hrend der Pause esse ich.', 'During the break I eat.', 16),
  ('statt / anstatt', E'\U0001F451 Genitiv \u2014 instead of', 'genitive', '{mixed}', 'Statt des Autos nehme ich das Rad.', 'Instead of the car I take the bike.', 17),
  ('innerhalb', E'\U0001F451 Genitiv \u2014 within', 'genitive', '{mixed}', 'Innerhalb einer Woche ist es fertig.', 'Within a week it is done.', 18),
  ('in', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich gehe in die Schule. / Ich bin in der Schule.', 'I go into the school. / I am in the school.', 19),
  ('auf', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich lege das Buch auf den Tisch. / Es liegt auf dem Tisch.', 'I put the book on the table. / It lies on the table.', 20),
  ('an', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', E'Ich h\u00e4nge das Bild an die Wand. / Es h\u00e4ngt an der Wand.', 'I hang the picture on the wall. / It hangs on the wall.', 21),
  (E'\u00fcber', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', E'Die Lampe kommt \u00fcber den Tisch. / Sie h\u00e4ngt \u00fcber dem Tisch.', 'The lamp goes above the table. / It hangs above the table.', 22),
  ('unter', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', E'Die Katze l\u00e4uft unter das Bett. / Sie schl\u00e4ft unter dem Bett.', 'The cat runs under the bed. / It sleeps under the bed.', 23),
  ('vor', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Ich stelle das Rad vor das Haus. / Es steht vor dem Haus.', 'I put the bike in front of the house. / It stands in front of the house.', 24),
  ('hinter', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Er geht hinter das Haus. / Er ist hinter dem Haus.', 'He goes behind the house. / He is behind the house.', 25),
  ('neben', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', 'Setz dich neben mich. / Du sitzt neben mir.', 'Sit down next to me. / You sit next to me.', 26),
  ('zwischen', E'\U0001F3AF\u2b50 Wechsel \u2014 Akk (wohin?) / Dativ (wo?)', 'two-way preposition', '{mixed}', E'Stell es zwischen die St\u00fchle. / Es steht zwischen den St\u00fchlen.', 'Put it between the chairs. / It stands between the chairs.', 27),
  ('warten ___ den Bus', E'\U0001F4CC feste Pr\u00e4position: warten auf + Akkusativ', 'the verb decides the preposition', '{mixed}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 28),
  ('teilnehmen ___ dem Kurs', E'\U0001F4CC feste Pr\u00e4position: teilnehmen an + Dativ', 'the verb decides the preposition', '{mixed}', 'Sie nimmt an dem Kurs teil.', 'She takes part in the course.', 29),
  ('sich freuen ___ das Geschenk', E'\U0001F4CC feste Pr\u00e4position: sich freuen \u00fcber + Akkusativ', E'\u00fcber = something that happened', '{mixed}', E'Sie freut sich \u00fcber das Geschenk.', 'She is happy about the present.', 30),
  (E'tr\u00e4umen ___ einem Urlaub', E'\U0001F4CC feste Pr\u00e4position: tr\u00e4umen von + Dativ', 'the verb decides the preposition', '{mixed}', E'Ich tr\u00e4ume von einem Urlaub.', 'I dream of a holiday.', 31),
  ('stolz ___ dich', E'\U0001F4CC feste Pr\u00e4position: stolz auf + Akkusativ', 'adjective with fixed preposition', '{mixed}', 'Ich bin stolz auf dich.', 'I am proud of you.', 32),
  ('zufrieden ___ dem Ergebnis', E'\U0001F4CC feste Pr\u00e4position: zufrieden mit + Dativ', 'adjective with fixed preposition', '{mixed}', 'Sie ist zufrieden mit dem Ergebnis.', 'She is satisfied with the result.', 33)
) as v(front, back, notes, tags, example, example_en, ord);
