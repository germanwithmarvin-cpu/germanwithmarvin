-- ============================================================================
-- GRAMMATIK-DECKS: Verben mit festem Fall (Dativ / Dativ+Akkusativ / Genitiv)
-- ----------------------------------------------------------------------------
-- Auszufuehren ist die Dollar-Quoting-Fassung seed-grammar-verb-cases-safe.sql.
-- Analog zu den Praepositions-Packs. Idempotent: loescht NUR die vier unten
-- erzeugten Grammatik-Decks und legt sie neu an - alle anderen Decks und der
-- Lernfortschritt darauf bleiben unberuehrt.
--
-- Ergaenzt die Grammatik-Decks (sort_order 15-18):
--   15) Verben mit Dativ            (Kasus-Tag dat  -> Stern-Symbol)
--   16) Verben mit Dativ+Akkusativ  (zwei Objekte: Person = D, Sache = A)
--   17) Verben mit Genitiv          (Kasus-Tag gen  -> Kronen-Symbol)
--   18) Misch-Rate-Deck: Welcher Fall? (KEIN Kasus-Tag -> kein Spoiler)
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';
alter table public.fc_decks add column if not exists category   text not null default 'path';

-- Nur diese vier neuen Decks entfernen (idempotent, schont alle anderen).
delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and category = 'grammar'
  and title in (
    'Verbs with the dative',
    'Verbs with dative and accusative',
    'Verbs with the genitive',
    'Verbs · which case?'
  );


-- 15) Verben mit Dativ ⭐
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verbs with the dative', 'Verbs that always take a dative object', 'A2', true, 'grammar', 15)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('helfen + D', 'to help', '+ Dativ', '{dat}', 'Ich helfe meinem Bruder.', 'I help my brother.', 1),
  ('danken + D', 'to thank', '+ Dativ', '{dat}', 'Ich danke dir für die Hilfe.', 'I thank you for the help.', 2),
  ('gefallen + D', 'to please / to like', 'Das Bild gefällt mir = I like the picture', '{dat}', 'Das Bild gefällt mir.', 'I like the picture.', 3),
  ('gehören + D', 'to belong to', '+ Dativ', '{dat}', 'Das Buch gehört meiner Schwester.', 'The book belongs to my sister.', 4),
  ('antworten + D', 'to answer (someone)', '+ Dativ (aber: eine Frage beantworten + A)', '{dat}', 'Bitte antworte mir bald.', 'Please answer me soon.', 5),
  ('folgen + D', 'to follow', '+ Dativ; Perfekt mit sein', '{dat}', 'Der Hund folgt seinem Herrn.', 'The dog follows its master.', 6),
  ('passen + D', 'to suit / to fit', '+ Dativ', '{dat}', 'Der Termin passt mir gut.', 'The appointment suits me well.', 7),
  ('schmecken + D', 'to taste good to', '+ Dativ', '{dat}', 'Die Suppe schmeckt den Kindern.', 'The children like the soup.', 8),
  ('begegnen + D', 'to meet / to encounter', '+ Dativ; Perfekt mit sein', '{dat}', 'Ich bin einem Freund begegnet.', 'I met a friend.', 9),
  ('vertrauen + D', 'to trust', '+ Dativ', '{dat}', 'Ich vertraue meinem Arzt.', 'I trust my doctor.', 10),
  ('zuhören + D', 'to listen to', '+ Dativ; trennbar: hört ... zu', '{dat}', 'Hör mir bitte zu!', 'Please listen to me!', 11),
  ('gratulieren + D', 'to congratulate', '+ Dativ (zu + D)', '{dat}', 'Wir gratulieren dir zum Geburtstag.', 'We congratulate you on your birthday.', 12),
  ('fehlen + D', 'to be missed by', 'Du fehlst mir = I miss you', '{dat}', 'Du fehlst mir sehr.', 'I miss you a lot.', 13),
  ('gelingen + D', 'to succeed / turn out well', '+ Dativ; Perfekt mit sein', '{dat}', 'Der Kuchen ist mir gelungen.', 'The cake turned out well for me.', 14),
  ('schaden + D', 'to harm', '+ Dativ', '{dat}', 'Rauchen schadet der Gesundheit.', 'Smoking harms your health.', 15),
  ('ähneln + D', 'to resemble', '+ Dativ', '{dat}', 'Sie ähnelt ihrer Mutter.', 'She resembles her mother.', 16),
  ('widersprechen + D', 'to contradict', '+ Dativ', '{dat}', 'Er widerspricht seinem Chef.', 'He contradicts his boss.', 17),
  ('zustimmen + D', 'to agree with', '+ Dativ; trennbar: stimmt ... zu', '{dat}', 'Ich stimme dir zu.', 'I agree with you.', 18),
  ('wehtun + D', 'to hurt (someone)', '+ Dativ; trennbar: tut ... weh', '{dat}', 'Der Rücken tut mir weh.', 'My back hurts.', 19),
  ('verzeihen + D', 'to forgive (someone)', '+ Dativ', '{dat}', 'Ich verzeihe dir.', 'I forgive you.', 20)
) as v(front, back, notes, tags, example, example_en, ord);


-- 16) Verben mit Dativ + Akkusativ ⭐🎯 (Person = Dativ, Sache = Akkusativ)
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verbs with dative and accusative', 'Two objects: the person is dative, the thing is accusative', 'B1', true, 'grammar', 16)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('geben + D + A', 'to give (someone something)', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Ich gebe dem Kind einen Apfel.', 'I give the child an apple.', 1),
  ('schenken + D + A', 'to give (as a gift)', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Er schenkt seiner Frau Blumen.', 'He gives his wife flowers.', 2),
  ('zeigen + D + A', 'to show', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Zeig mir bitte den Weg.', 'Please show me the way.', 3),
  ('bringen + D + A', 'to bring', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Die Kellnerin bringt uns die Rechnung.', 'The waitress brings us the bill.', 4),
  ('erklären + D + A', 'to explain', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Der Lehrer erklärt den Schülern die Regel.', 'The teacher explains the rule to the students.', 5),
  ('empfehlen + D + A', 'to recommend', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Ich empfehle dir dieses Buch.', 'I recommend this book to you.', 6),
  ('schicken + D + A', 'to send', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Sie schickt ihrer Oma eine Karte.', 'She sends her grandma a card.', 7),
  ('leihen + D + A', 'to lend', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Kannst du mir dein Auto leihen?', 'Can you lend me your car?', 8),
  ('wünschen + D + A', 'to wish', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Wir wünschen dir einen schönen Tag.', 'We wish you a nice day.', 9),
  ('anbieten + D + A', 'to offer', 'Person = Dativ, Sache = Akkusativ; trennbar', '{dat}', 'Darf ich Ihnen einen Kaffee anbieten?', 'May I offer you a coffee?', 10),
  ('mitteilen + D + A', 'to inform (someone of something)', 'Person = Dativ, Sache = Akkusativ; trennbar', '{dat}', 'Sie teilt uns das Ergebnis mit.', 'She informs us of the result.', 11),
  ('verbieten + D + A', 'to forbid', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Der Arzt verbietet ihm das Rauchen.', 'The doctor forbids him to smoke.', 12),
  ('erlauben + D + A', 'to allow', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Die Mutter erlaubt dem Kind das Spiel.', 'The mother allows the child to play.', 13),
  ('versprechen + D + A', 'to promise', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Ich verspreche dir ein Geschenk.', 'I promise you a present.', 14),
  ('schulden + D + A', 'to owe', 'Person = Dativ, Sache = Akkusativ', '{dat}', 'Du schuldest mir noch zehn Euro.', 'You still owe me ten euros.', 15)
) as v(front, back, notes, tags, example, example_en, ord);


-- 17) Verben mit Genitiv 👑 (formell)
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verbs with the genitive', 'Formal verbs that take a genitive object', 'B2', true, 'grammar', 17)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('gedenken + G', 'to commemorate', '+ Genitiv; formell', '{gen}', 'Wir gedenken der Opfer.', 'We commemorate the victims.', 1),
  ('bedürfen + G', 'to require / to need', '+ Genitiv; formell', '{gen}', 'Das bedarf keiner Erklärung.', 'That needs no explanation.', 2),
  ('sich enthalten + G', 'to abstain from', '+ Genitiv; reflexiv', '{gen}', 'Er enthielt sich der Stimme.', 'He abstained from the vote.', 3),
  ('sich rühmen + G', 'to boast of', '+ Genitiv; reflexiv', '{gen}', 'Sie rühmt sich ihres Erfolgs.', 'She boasts of her success.', 4),
  ('sich annehmen + G', 'to take care of', '+ Genitiv; reflexiv, trennbar', '{gen}', 'Er nimmt sich der Sache an.', 'He takes care of the matter.', 5),
  ('sich erfreuen + G', 'to enjoy (e.g. popularity)', '+ Genitiv; reflexiv', '{gen}', 'Das Café erfreut sich großer Beliebtheit.', 'The café enjoys great popularity.', 6),
  ('beschuldigen + G', 'to accuse of', 'jemanden (Akk) + Genitiv der Sache', '{gen}', 'Man beschuldigt ihn des Diebstahls.', 'He is accused of theft.', 7),
  ('verdächtigen + G', 'to suspect of', 'jemanden (Akk) + Genitiv der Sache', '{gen}', 'Die Polizei verdächtigt ihn des Betrugs.', 'The police suspect him of fraud.', 8),
  ('anklagen + G', 'to charge with', 'jemanden (Akk) + Genitiv der Sache', '{gen}', 'Der Mann wird des Mordes angeklagt.', 'The man is charged with murder.', 9),
  ('berauben + G', 'to rob of / deprive of', 'jemanden (Akk) + Genitiv der Sache', '{gen}', 'Sie beraubten ihn seiner Freiheit.', 'They robbed him of his freedom.', 10)
) as v(front, back, notes, tags, example, example_en, ord);


-- 18) Misch-Rate-Deck: Welcher Fall? 🎲  (KEINE Kasus-Tags -> kein Spoiler)
--     Vorder-/Rueckseite bewusst getauscht (select v.back, v.front): der Trainer
--     zeigt die Rueckseite als Frage -> Frage = Verb, Antwort = Fall.
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, category, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'Verbs · which case?', 'Which case does the verb take? dative, accusative or genitive', 'B1', true, 'grammar', 18)
  returning id)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.back, v.front, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('helfen', '⭐ Dativ — to help', 'dative verb', '{mixed}', 'Ich helfe dir.', 'I help you.', 1),
  ('fragen', '🎯 Akkusativ — to ask', 'Vorsicht: Akkusativ, nicht Dativ!', '{mixed}', 'Ich frage dich.', 'I ask you.', 2),
  ('danken', '⭐ Dativ — to thank', 'dative verb', '{mixed}', 'Ich danke dir.', 'I thank you.', 3),
  ('anrufen', '🎯 Akkusativ — to call', 'Vorsicht: Akkusativ, nicht Dativ!', '{mixed}', 'Ich rufe dich an.', 'I call you.', 4),
  ('gefallen', '⭐ Dativ — to please / to like', 'dative verb', '{mixed}', 'Es gefällt mir.', 'I like it.', 5),
  ('gehören', '⭐ Dativ — to belong to', 'dative verb', '{mixed}', 'Das gehört mir.', 'That belongs to me.', 6),
  ('treffen', '🎯 Akkusativ — to meet', 'Vorsicht: Akkusativ (vgl. begegnen + D)', '{mixed}', 'Ich treffe dich morgen.', 'I meet you tomorrow.', 7),
  ('begegnen', '⭐ Dativ — to meet / to encounter', 'dative verb', '{mixed}', 'Ich begegne dir oft.', 'I often run into you.', 8),
  ('geben', '⭐ Dativ + 🎯 Akkusativ — to give', 'Person = Dativ, Sache = Akkusativ', '{mixed}', 'Ich gebe dir das Buch.', 'I give you the book.', 9),
  ('zeigen', '⭐ Dativ + 🎯 Akkusativ — to show', 'Person = Dativ, Sache = Akkusativ', '{mixed}', 'Ich zeige dir den Weg.', 'I show you the way.', 10),
  ('gedenken', '👑 Genitiv — to commemorate', 'genitive verb (formal)', '{mixed}', 'Wir gedenken der Opfer.', 'We commemorate the victims.', 11),
  ('bedürfen', '👑 Genitiv — to require', 'genitive verb (formal)', '{mixed}', 'Das bedarf keiner Erklärung.', 'That needs no explanation.', 12),
  ('gratulieren', '⭐ Dativ — to congratulate', 'dative verb', '{mixed}', 'Ich gratuliere dir.', 'I congratulate you.', 13),
  ('unterstützen', '🎯 Akkusativ — to support', 'Vorsicht: Akkusativ, nicht Dativ!', '{mixed}', 'Ich unterstütze dich.', 'I support you.', 14),
  ('beschuldigen', '🎯 Akkusativ + 👑 Genitiv — to accuse', 'Person = Akkusativ, Sache = Genitiv', '{mixed}', 'Man beschuldigt ihn des Diebstahls.', 'He is accused of theft.', 15),
  ('zuhören', '⭐ Dativ — to listen to', 'Vorsicht: Dativ (vgl. hören + A)', '{mixed}', 'Ich höre dir zu.', 'I listen to you.', 16),
  ('schmecken', '⭐ Dativ — to taste good to', 'dative verb', '{mixed}', 'Es schmeckt mir.', 'I like the taste.', 17),
  ('empfehlen', '⭐ Dativ + 🎯 Akkusativ — to recommend', 'Person = Dativ, Sache = Akkusativ', '{mixed}', 'Ich empfehle dir das Buch.', 'I recommend the book to you.', 18)
) as v(front, back, notes, tags, example, example_en, ord);


-- Kontrolle: die vier neuen Grammatik-Decks + Kartenzahl
select d.title, d.level, count(c.id) as karten
from public.fc_decks d left join public.fc_cards c on c.deck_id = d.id
where d.category = 'grammar'
  and d.title in ('Verbs with the dative','Verbs with dative and accusative','Verbs with the genitive','Verbs · which case?')
group by d.title, d.level, d.sort_order
order by d.sort_order;
