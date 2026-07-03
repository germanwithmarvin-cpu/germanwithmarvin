-- ============================================================================
-- GRAMMATIK-EXTRA-DECKS — German Simplified (neben dem normalen Lernpfad)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Selbst-genügsam, idempotent.
-- Legt die Spalte fc_decks.category an und erstellt Grammatik-Decks
-- (category='grammar'). Diese erscheinen NICHT im normalen Pfad, sondern im
-- eigenen "Grammar packs"-Bereich. Danach ggf. verb-markers.sql ausführen.
-- ============================================================================

alter table public.fc_cards  add column if not exists example    text not null default '';
alter table public.fc_cards  add column if not exists example_en text not null default '';
alter table public.fc_decks  add column if not exists category   text not null default 'path';

-- Vorhandene Grammatik-Decks entfernen (idempotent).
delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar';

-- Hilfs-Insert je Deck via CTE. level='A2' → hinter Zugang (Gratis = nur A1).


-- 1) Prepositions: accusative only 🎯
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Prepositions · accusative only', 'Prepositions that always take the accusative', 'A2', true, 'grammar', 1)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('für', 'for', 'always accusative', '{akk}', 'Das ist für meinen Bruder.', 'That is for my brother.', 1),
  ('ohne', 'without', 'always accusative', '{akk}', 'Ich gehe ohne dich.', 'I am going without you.', 2),
  ('durch', 'through', 'always accusative', '{akk}', 'Wir laufen durch den Wald.', 'We walk through the forest.', 3),
  ('gegen', 'against / around', 'always accusative', '{akk}', 'Das Auto fuhr gegen einen Baum.', 'The car drove into a tree.', 4),
  ('um', 'around / at', 'always accusative', '{akk}', 'Wir sitzen um den Tisch.', 'We sit around the table.', 5),
  ('bis', 'until / up to', 'always accusative', '{akk}', 'Ich bleibe bis nächsten Montag.', 'I am staying until next Monday.', 6),
  ('entlang', 'along', 'accusative (usually after the noun)', '{akk}', 'Wir gehen den Fluss entlang.', 'We walk along the river.', 7),
  ('wider', 'against / contrary to', 'accusative (formal)', '{akk}', 'Das war wider meinen Willen.', 'That was against my will.', 8)
) as v(front, back, notes, tags, example, example_en, ord);


-- 2) Prepositions: dative only ⭐
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Prepositions · dative only', 'Prepositions that always take the dative', 'A2', true, 'grammar', 2)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('mit', 'with', 'always dative', '{dat}', 'Ich fahre mit dem Zug.', 'I travel by train.', 1),
  ('nach', 'after / to', 'always dative', '{dat}', 'Nach der Arbeit gehe ich heim.', 'After work I go home.', 2),
  ('bei', 'at / near / with', 'always dative', '{dat}', 'Ich wohne bei meinen Eltern.', 'I live with my parents.', 3),
  ('zu', 'to', 'always dative', '{dat}', 'Ich gehe zu dem Arzt.', 'I am going to the doctor.', 4),
  ('von', 'from / of / by', 'always dative', '{dat}', 'Das ist ein Geschenk von meiner Oma.', 'That is a present from my grandma.', 5),
  ('aus', 'from / out of', 'always dative', '{dat}', 'Sie kommt aus der Schweiz.', 'She comes from Switzerland.', 6),
  ('seit', 'since / for', 'always dative', '{dat}', 'Ich lerne seit einem Jahr Deutsch.', 'I have been learning German for a year.', 7),
  ('gegenüber', 'opposite / towards', 'dative (often after the noun)', '{dat}', 'Die Bank ist dem Park gegenüber.', 'The bank is opposite the park.', 8),
  ('ab', 'from (time/place onwards)', 'always dative', '{dat}', 'Ab nächster Woche habe ich frei.', 'From next week I am off.', 9),
  ('außer', 'except (for)', 'always dative', '{dat}', 'Alle außer mir waren da.', 'Everyone except me was there.', 10),
  ('entgegen', 'contrary to', 'dative', '{dat}', 'Entgegen dem Wetterbericht regnete es.', 'Contrary to the forecast it rained.', 11)
) as v(front, back, notes, tags, example, example_en, ord);


-- 3) Prepositions: two-way (Wechsel) 🎯⭐
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Prepositions · two-way (Wechsel)', 'Accusative (motion) or dative (location)', 'A2', true, 'grammar', 3)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('in', 'in / into', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Ich gehe in die Schule. / Ich bin in der Schule.', 'I go into school. / I am in school.', 1),
  ('an', 'at / on / to', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Ich hänge das Bild an die Wand.', 'I hang the picture on the wall.', 2),
  ('auf', 'on / onto', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Das Buch liegt auf dem Tisch.', 'The book is on the table.', 3),
  ('über', 'over / above', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Die Lampe hängt über dem Tisch.', 'The lamp hangs above the table.', 4),
  ('unter', 'under / below', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Die Katze liegt unter dem Bett.', 'The cat lies under the bed.', 5),
  ('vor', 'in front of / before', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Ich warte vor dem Kino.', 'I wait in front of the cinema.', 6),
  ('hinter', 'behind', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Der Garten ist hinter dem Haus.', 'The garden is behind the house.', 7),
  ('neben', 'next to', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Setz dich neben mich.', 'Sit next to me.', 8),
  ('zwischen', 'between', 'Wohin? Akk · Wo? Dativ', '{wechsel}', 'Das Café ist zwischen den Geschäften.', 'The cafe is between the shops.', 9)
) as v(front, back, notes, tags, example, example_en, ord);


-- 4) Prepositions: genitive 👑
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Prepositions · genitive', 'Prepositions that take the genitive', 'A2', true, 'grammar', 4)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('wegen', 'because of', 'genitive', '{gen}', 'Wegen des Regens bleiben wir zu Hause.', 'Because of the rain we stay home.', 1),
  ('trotz', 'despite', 'genitive', '{gen}', 'Trotz des Wetters gehen wir raus.', 'Despite the weather we go out.', 2),
  ('während', 'during', 'genitive', '{gen}', 'Während der Pause esse ich.', 'During the break I eat.', 3),
  ('statt', 'instead of', 'genitive; also anstatt', '{gen}', 'Statt eines Autos kaufe ich ein Fahrrad.', 'Instead of a car I buy a bike.', 4),
  ('außerhalb', 'outside of', 'genitive', '{gen}', 'Sie wohnt außerhalb der Stadt.', 'She lives outside the city.', 5),
  ('innerhalb', 'within / inside of', 'genitive', '{gen}', 'Innerhalb einer Woche bin ich zurück.', 'Within a week I am back.', 6),
  ('aufgrund', 'due to', 'genitive', '{gen}', 'Aufgrund eines Fehlers verlor er das Spiel.', 'Due to a mistake he lost the game.', 7),
  ('dank', 'thanks to', 'genitive (or dative)', '{gen}', 'Dank deiner Hilfe habe ich es geschafft.', 'Thanks to your help I made it.', 8),
  ('laut', 'according to', 'genitive (or dative)', '{gen}', 'Laut des Berichts steigt die Zahl.', 'According to the report the number is rising.', 9)
) as v(front, back, notes, tags, example, example_en, ord);


-- 5) Subordinating conjunctions (verb to the end)
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Subordinating conjunctions', 'Nebensatz: the verb goes to the end', 'A2', true, 'grammar', 5)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('weil', 'because', 'verb to the end', '{}', 'Ich bleibe zu Hause, weil ich krank bin.', 'I stay home because I am ill.', 1),
  ('dass', 'that', 'verb to the end', '{}', 'Ich hoffe, dass du kommst.', 'I hope that you come.', 2),
  ('wenn', 'if / when', 'verb to the end', '{}', 'Wenn es regnet, bleibe ich hier.', 'If it rains, I stay here.', 3),
  ('als', 'when (single past event)', 'verb to the end', '{}', 'Als ich klein war, wohnten wir in Bonn.', 'When I was little, we lived in Bonn.', 4),
  ('obwohl', 'although', 'verb to the end', '{}', 'Obwohl es spät war, ging ich raus.', 'Although it was late, I went out.', 5),
  ('damit', 'so that', 'purpose; verb to the end', '{}', 'Ich spare, damit ich reisen kann.', 'I save so that I can travel.', 6),
  ('bevor', 'before', 'verb to the end', '{}', 'Bevor ich gehe, rufe ich an.', 'Before I leave, I will call.', 7),
  ('nachdem', 'after', 'verb to the end', '{}', 'Nachdem ich gegessen hatte, ging ich.', 'After I had eaten, I left.', 8),
  ('seitdem', 'since (then)', 'verb to the end', '{}', 'Seitdem ich hier wohne, bin ich glücklich.', 'Since I live here, I am happy.', 9),
  ('falls', 'in case', 'verb to the end', '{}', 'Falls du Zeit hast, komm vorbei.', 'In case you have time, come by.', 10),
  ('sobald', 'as soon as', 'verb to the end', '{}', 'Sobald ich fertig bin, komme ich.', 'As soon as I am done, I come.', 11),
  ('solange', 'as long as', 'verb to the end', '{}', 'Solange du hilfst, schaffen wir das.', 'As long as you help, we manage.', 12),
  ('ob', 'whether / if', 'verb to the end', '{}', 'Ich weiß nicht, ob er kommt.', 'I do not know whether he is coming.', 13),
  ('sodass', 'so that (result)', 'verb to the end', '{}', 'Es regnete, sodass wir drinnen blieben.', 'It rained, so that we stayed inside.', 14),
  ('indem', 'by (doing)', 'verb to the end', '{}', 'Man lernt, indem man Fehler macht.', 'You learn by making mistakes.', 15)
) as v(front, back, notes, tags, example, example_en, ord);


-- 6) Coordinating conjunctions & connectors
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Conjunctions & connectors', 'Joining main clauses (word order stays normal)', 'A2', true, 'grammar', 6)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('und', 'and', 'no change to word order', '{}', 'Ich koche und du deckst den Tisch.', 'I cook and you set the table.', 1),
  ('oder', 'or', 'no change to word order', '{}', 'Tee oder Kaffee?', 'Tea or coffee?', 2),
  ('aber', 'but', 'no change to word order', '{}', 'Es ist teuer, aber gut.', 'It is expensive but good.', 3),
  ('denn', 'because (for)', 'no change to word order', '{}', 'Ich gehe schlafen, denn ich bin müde.', 'I go to sleep, because I am tired.', 4),
  ('sondern', 'but (rather)', 'after a negation', '{}', 'Nicht heute, sondern morgen.', 'Not today, but tomorrow.', 5),
  ('deshalb', 'therefore', 'verb comes second after it', '{}', 'Es regnet, deshalb bleibe ich hier.', 'It is raining, therefore I stay here.', 6),
  ('deswegen', 'because of that', 'verb comes second after it', '{}', 'Ich war müde, deswegen ging ich früh.', 'I was tired, so I left early.', 7),
  ('trotzdem', 'nevertheless', 'verb comes second after it', '{}', 'Es war spät. Trotzdem blieb ich.', 'It was late. Nevertheless I stayed.', 8),
  ('dennoch', 'nonetheless', 'verb comes second after it', '{}', 'Es war schwer, dennoch schaffte ich es.', 'It was hard, nonetheless I managed.', 9),
  ('außerdem', 'furthermore', 'verb comes second after it', '{}', 'Es ist teuer. Außerdem ist es weit.', 'It is expensive. Furthermore it is far.', 10),
  ('jedoch', 'however', 'verb comes second after it', '{}', 'Das Hotel war schön, jedoch laut.', 'The hotel was nice, however loud.', 11),
  ('sonst', 'otherwise', 'verb comes second after it', '{}', 'Beeil dich, sonst kommen wir zu spät.', 'Hurry, otherwise we will be late.', 12),
  ('also', 'so / therefore', 'verb comes second after it', '{}', 'Es ist spät, also gehe ich.', 'It is late, so I am leaving.', 13)
) as v(front, back, notes, tags, example, example_en, ord);


-- 7) Dative verbs ⭐
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Dative verbs', 'Verbs whose object is in the dative', 'A2', true, 'grammar', 7)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('helfen', 'to help', '+ Dativ', '{verb,dat}', 'Ich helfe meiner Mutter.', 'I help my mother.', 1),
  ('danken', 'to thank', '+ Dativ', '{verb,dat}', 'Ich danke dir.', 'I thank you.', 2),
  ('gehören', 'to belong to', '+ Dativ', '{verb,dat}', 'Das Buch gehört mir.', 'The book belongs to me.', 3),
  ('gefallen', 'to please / to like', '+ Dativ', '{verb,dat}', 'Die Stadt gefällt mir.', 'I like the city.', 4),
  ('antworten', 'to answer', '+ Dativ', '{verb,dat}', 'Bitte antworte mir.', 'Please answer me.', 5),
  ('folgen', 'to follow', '+ Dativ', '{verb,dat}', 'Der Hund folgt seinem Herrn.', 'The dog follows its owner.', 6),
  ('gratulieren', 'to congratulate', '+ Dativ', '{verb,dat}', 'Ich gratuliere dir zum Geburtstag.', 'I congratulate you on your birthday.', 7),
  ('passen', 'to fit / to suit', '+ Dativ', '{verb,dat}', 'Der Termin passt mir gut.', 'The appointment suits me well.', 8),
  ('schmecken', 'to taste good', '+ Dativ', '{verb,dat}', 'Das Essen schmeckt mir.', 'I like the food.', 9),
  ('vertrauen', 'to trust', '+ Dativ', '{verb,dat}', 'Ich vertraue dir.', 'I trust you.', 10),
  ('zuhören', 'to listen to', '+ Dativ; separable', '{verb,dat}', 'Hör mir bitte zu.', 'Please listen to me.', 11),
  ('begegnen', 'to meet / encounter', '+ Dativ', '{verb,dat}', 'Ich bin ihm gestern begegnet.', 'I ran into him yesterday.', 12),
  ('gehorchen', 'to obey', '+ Dativ', '{verb,dat}', 'Der Hund gehorcht seinem Besitzer.', 'The dog obeys its owner.', 13),
  ('ähneln', 'to resemble', '+ Dativ', '{verb,dat}', 'Sie ähnelt ihrer Mutter.', 'She resembles her mother.', 14),
  ('widersprechen', 'to contradict', '+ Dativ', '{verb,dat}', 'Ich muss dir widersprechen.', 'I have to contradict you.', 15)
) as v(front, back, notes, tags, example, example_en, ord);


-- 8) Reflexive verbs
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Reflexive verbs', 'Verbs used with sich', 'A2', true, 'grammar', 8)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('sich freuen', 'to be happy / look forward', 'auf/über + Akk', '{verb}', 'Ich freue mich auf das Wochenende.', 'I look forward to the weekend.', 1),
  ('sich ärgern', 'to be annoyed', 'über + Akk', '{verb}', 'Ich ärgere mich über den Stau.', 'I am annoyed about the traffic jam.', 2),
  ('sich erinnern', 'to remember', 'an + Akk', '{verb}', 'Ich erinnere mich an den Tag.', 'I remember the day.', 3),
  ('sich interessieren', 'to be interested', 'für + Akk', '{verb}', 'Ich interessiere mich für Kunst.', 'I am interested in art.', 4),
  ('sich beeilen', 'to hurry', 'reflexive', '{verb}', 'Beeil dich!', 'Hurry up!', 5),
  ('sich entscheiden', 'to decide', 'für/gegen + Akk', '{verb}', 'Ich entscheide mich für den blauen.', 'I decide on the blue one.', 6),
  ('sich fühlen', 'to feel', 'reflexive', '{verb}', 'Ich fühle mich gut.', 'I feel good.', 7),
  ('sich setzen', 'to sit down', 'reflexive', '{verb}', 'Setz dich bitte.', 'Please sit down.', 8),
  ('sich waschen', 'to wash oneself', 'reflexive', '{verb}', 'Ich wasche mich.', 'I wash myself.', 9),
  ('sich vorstellen', 'to introduce oneself', 'reflexive; separable', '{verb}', 'Darf ich mich vorstellen?', 'May I introduce myself?', 10),
  ('sich treffen', 'to meet', 'mit + Dativ', '{verb}', 'Wir treffen uns um acht.', 'We meet at eight.', 11),
  ('sich gewöhnen', 'to get used to', 'an + Akk', '{verb}', 'Ich gewöhne mich an die Stadt.', 'I am getting used to the city.', 12),
  ('sich bewerben', 'to apply', 'um + Akk', '{verb}', 'Ich bewerbe mich um die Stelle.', 'I apply for the position.', 13),
  ('sich kümmern', 'to take care', 'um + Akk', '{verb}', 'Ich kümmere mich um den Garten.', 'I take care of the garden.', 14)
) as v(front, back, notes, tags, example, example_en, ord);


-- 9) Separable verbs
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Separable verbs', 'The prefix jumps to the end of the sentence', 'A2', true, 'grammar', 9)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('aufstehen', 'to get up', 'ich stehe auf', '{verb}', 'Ich stehe um sieben auf.', 'I get up at seven.', 1),
  ('anrufen', 'to call (phone)', 'ich rufe an', '{verb}', 'Ich rufe dich später an.', 'I will call you later.', 2),
  ('einkaufen', 'to go shopping', 'ich kaufe ein', '{verb}', 'Ich kaufe am Samstag ein.', 'I go shopping on Saturday.', 3),
  ('mitkommen', 'to come along', 'du kommst mit', '{verb}', 'Kommst du mit?', 'Are you coming along?', 4),
  ('ankommen', 'to arrive', 'der Zug kommt an', '{verb}', 'Der Zug kommt um fünf an.', 'The train arrives at five.', 5),
  ('abfahren', 'to depart', 'der Bus fährt ab', '{verb}', 'Der Bus fährt gleich ab.', 'The bus is leaving soon.', 6),
  ('aufmachen', 'to open', 'ich mache auf', '{verb}', 'Mach bitte das Fenster auf.', 'Please open the window.', 7),
  ('zumachen', 'to close', 'ich mache zu', '{verb}', 'Mach die Tür zu.', 'Close the door.', 8),
  ('einschlafen', 'to fall asleep', 'ich schlafe ein', '{verb}', 'Ich schlafe schnell ein.', 'I fall asleep quickly.', 9),
  ('aussteigen', 'to get off', 'ich steige aus', '{verb}', 'Ich steige hier aus.', 'I get off here.', 10),
  ('einsteigen', 'to get in / board', 'ich steige ein', '{verb}', 'Bitte einsteigen!', 'All aboard, please!', 11),
  ('fernsehen', 'to watch TV', 'ich sehe fern', '{verb}', 'Am Abend sehe ich fern.', 'In the evening I watch TV.', 12),
  ('zurückkommen', 'to come back', 'ich komme zurück', '{verb}', 'Ich komme bald zurück.', 'I will come back soon.', 13),
  ('vorbereiten', 'to prepare', 'ich bereite vor', '{verb}', 'Ich bereite das Essen vor.', 'I prepare the meal.', 14),
  ('teilnehmen', 'to take part', 'an + Dativ; ich nehme teil', '{verb,dat}', 'Ich nehme an dem Kurs teil.', 'I take part in the course.', 15)
) as v(front, back, notes, tags, example, example_en, ord);


-- 10) Modal verbs
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Modal verbs', 'können, müssen, wollen … + infinitive at the end', 'A2', true, 'grammar', 10)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('können', 'can / to be able to', 'kann, konnte, gekonnt', '{verb}', 'Ich kann schwimmen.', 'I can swim.', 1),
  ('müssen', 'must / to have to', 'muss, musste, gemusst', '{verb}', 'Ich muss jetzt gehen.', 'I have to go now.', 2),
  ('wollen', 'to want to', 'will, wollte, gewollt', '{verb}', 'Ich will Deutsch lernen.', 'I want to learn German.', 3),
  ('sollen', 'should / to be supposed to', 'soll, sollte, gesollt', '{verb}', 'Du sollst mehr schlafen.', 'You should sleep more.', 4),
  ('dürfen', 'may / to be allowed to', 'darf, durfte, gedurft', '{verb}', 'Darf ich hier parken?', 'May I park here?', 5),
  ('mögen', 'to like', 'mag, mochte, gemocht', '{verb}', 'Ich mag Schokolade.', 'I like chocolate.', 6),
  ('möchten', 'would like to', 'polite form of mögen', '{verb}', 'Ich möchte einen Kaffee.', 'I would like a coffee.', 7)
) as v(front, back, notes, tags, example, example_en, ord);

-- Fertig: 10 Grammatik-Decks (category='grammar'). Danach verb-markers.sql ausführen.
