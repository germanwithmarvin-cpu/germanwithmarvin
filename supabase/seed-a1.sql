-- ============================================================================
-- A1 DECKS (vollständig) — German Simplified Flashcards
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Diese Datei genügt sich selbst.
--
-- ACHTUNG: Sie LÖSCHT ZUERST ALLE deine Decks (und deren Karten/Fortschritt),
-- damit kein Misch-Zustand übrig bleibt, und legt dann alle A1-Decks neu an.
--
-- Format: front = Deutsch (mit Artikel), back = Englisch, notes = engl. Info,
-- example = deutscher Beispielsatz, example_en = englische Übersetzung.
-- Kasus-Tags: akk = 🎯, dat = ⭐, gen = 👑, wechsel = 🎯⭐.
-- ============================================================================

alter table public.fc_cards       add column if not exists example    text not null default '';
alter table public.fc_cards       add column if not exists example_en text not null default '';
alter table public.fc_card_states add column if not exists flagged    boolean not null default false;

delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- Deck 1: Greetings & basics
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Greetings & basics', 'Saying hello, please and thank you', 'A1', true, 1)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('hallo', 'hello', '', '{}', 'Hallo, schön dich zu sehen!', 'Hello, nice to see you!', 1),
  ('guten Morgen', 'good morning', '', '{}', 'Guten Morgen, Frau Müller!', 'Good morning, Mrs Müller!', 2),
  ('guten Tag', 'good day / hello', '', '{}', 'Guten Tag, ich heiße Anna.', 'Hello, my name is Anna.', 3),
  ('guten Abend', 'good evening', '', '{}', 'Guten Abend, willkommen!', 'Good evening, welcome!', 4),
  ('gute Nacht', 'good night', '', '{}', 'Gute Nacht, schlaf gut!', 'Good night, sleep well!', 5),
  ('tschüss', 'bye', 'informal', '{}', 'Tschüss, bis morgen!', 'Bye, see you tomorrow!', 6),
  ('auf Wiedersehen', 'goodbye', 'formal', '{}', 'Auf Wiedersehen und danke!', 'Goodbye and thank you!', 7),
  ('bis bald', 'see you soon', '', '{}', 'Bis bald, mach es gut!', 'See you soon, take care!', 8),
  ('bis später', 'see you later', '', '{}', 'Bis später am Abend!', 'See you later this evening!', 9),
  ('bitte', 'please / you are welcome', '', '{}', 'Einen Kaffee, bitte.', 'A coffee, please.', 10),
  ('danke', 'thank you', '', '{}', 'Danke für deine Hilfe.', 'Thank you for your help.', 11),
  ('gern geschehen', 'you are welcome', '', '{}', 'Danke! Gern geschehen.', 'Thanks! You are welcome.', 12),
  ('ja', 'yes', '', '{}', 'Ja, das stimmt.', 'Yes, that is right.', 13),
  ('nein', 'no', '', '{}', 'Nein, danke.', 'No, thank you.', 14),
  ('vielleicht', 'maybe', '', '{}', 'Vielleicht komme ich später.', 'Maybe I will come later.', 15),
  ('Entschuldigung', 'excuse me / sorry', '', '{}', 'Entschuldigung, wo ist der Bahnhof?', 'Excuse me, where is the station?', 16),
  ('es tut mir leid', 'I am sorry', '', '{}', 'Es tut mir leid, das war mein Fehler.', 'I am sorry, that was my mistake.', 17),
  ('kein Problem', 'no problem', '', '{}', 'Kein Problem, ich helfe gern.', 'No problem, I am happy to help.', 18),
  ('wie geht es?', 'how are you?', 'wie geht es dir / Ihnen', '{}', 'Hallo Tom, wie geht es dir?', 'Hi Tom, how are you?', 19),
  ('wie heißt du?', 'what is your name?', 'informal', '{}', 'Hallo, wie heißt du?', 'Hello, what is your name?', 20),
  ('woher kommst du?', 'where are you from?', 'informal', '{}', 'Woher kommst du?', 'Where are you from?', 21),
  ('ich heiße …', 'my name is …', '', '{}', 'Ich heiße Marvin.', 'My name is Marvin.', 22),
  ('willkommen', 'welcome', '', '{}', 'Willkommen in Berlin!', 'Welcome to Berlin!', 23)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 2: Numbers, time & date
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Numbers, time & date', 'Counting, days, months and time', 'A1', true, 2)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('null', 'zero', '', '{}', 'Das Spiel steht null zu null.', 'The game is zero to zero.', 1),
  ('eins', 'one', '', '{}', 'Ich nehme nur eins.', 'I will take just one.', 2),
  ('zwei', 'two', '', '{}', 'Ich habe zwei Brüder.', 'I have two brothers.', 3),
  ('drei', 'three', '', '{}', 'Ich brauche drei Äpfel.', 'I need three apples.', 4),
  ('vier', 'four', '', '{}', 'Die Familie hat vier Kinder.', 'The family has four children.', 5),
  ('fünf', 'five', '', '{}', 'Es ist fünf Uhr.', 'It is five o clock.', 6),
  ('sechs', 'six', '', '{}', 'Ich stehe um sechs auf.', 'I get up at six.', 7),
  ('sieben', 'seven', '', '{}', 'Die Woche hat sieben Tage.', 'A week has seven days.', 8),
  ('acht', 'eight', '', '{}', 'Wir treffen uns um acht.', 'We meet at eight.', 9),
  ('neun', 'nine', '', '{}', 'Das Kind ist neun Jahre alt.', 'The child is nine years old.', 10),
  ('zehn', 'ten', '', '{}', 'Ich zähle bis zehn.', 'I count to ten.', 11),
  ('elf', 'eleven', '', '{}', 'Es ist elf Uhr.', 'It is eleven o clock.', 12),
  ('zwölf', 'twelve', '', '{}', 'Das Jahr hat zwölf Monate.', 'A year has twelve months.', 13),
  ('zwanzig', 'twenty', '', '{}', 'Ich bin zwanzig Jahre alt.', 'I am twenty years old.', 14),
  ('dreißig', 'thirty', '', '{}', 'Es kostet dreißig Euro.', 'It costs thirty euros.', 15),
  ('hundert', 'hundred', '', '{}', 'Das kostet hundert Euro.', 'That costs a hundred euros.', 16),
  ('tausend', 'thousand', '', '{}', 'Die Stadt hat tausend Einwohner.', 'The town has a thousand inhabitants.', 17),
  ('die Uhr', 'the clock / o clock', 'pl. die Uhren', '{}', 'Wie viel Uhr ist es?', 'What time is it?', 18),
  ('die Stunde', 'the hour', 'pl. die Stunden', '{}', 'Der Film dauert zwei Stunden.', 'The film lasts two hours.', 19),
  ('die Minute', 'the minute', 'pl. die Minuten', '{}', 'Warte eine Minute!', 'Wait a minute!', 20),
  ('der Tag', 'the day', 'pl. die Tage', '{}', 'Schönen Tag noch!', 'Have a nice day!', 21),
  ('die Woche', 'the week', 'pl. die Wochen', '{}', 'Nächste Woche habe ich frei.', 'Next week I am off.', 22),
  ('der Monat', 'the month', 'pl. die Monate', '{}', 'Der Monat Mai ist schön.', 'The month of May is nice.', 23),
  ('das Jahr', 'the year', 'pl. die Jahre', '{}', 'Frohes neues Jahr!', 'Happy New Year!', 24),
  ('der Montag', 'Monday', '', '{}', 'Am Montag arbeite ich.', 'On Monday I work.', 25),
  ('der Dienstag', 'Tuesday', '', '{}', 'Der Dienstag ist frei.', 'Tuesday is free.', 26),
  ('der Mittwoch', 'Wednesday', '', '{}', 'Am Mittwoch habe ich Zeit.', 'On Wednesday I have time.', 27),
  ('der Donnerstag', 'Thursday', '', '{}', 'Donnerstag treffen wir uns.', 'We meet on Thursday.', 28),
  ('der Freitag', 'Friday', '', '{}', 'Freitag gehe ich aus.', 'On Friday I go out.', 29),
  ('der Samstag', 'Saturday', '', '{}', 'Am Samstag kaufe ich ein.', 'On Saturday I go shopping.', 30),
  ('der Sonntag', 'Sunday', '', '{}', 'Sonntag schlafe ich lange.', 'On Sunday I sleep in.', 31),
  ('heute', 'today', '', '{}', 'Heute ist Montag.', 'Today is Monday.', 32),
  ('morgen', 'tomorrow', '', '{}', 'Bis morgen!', 'See you tomorrow!', 33),
  ('gestern', 'yesterday', '', '{}', 'Gestern war ich krank.', 'Yesterday I was ill.', 34),
  ('jetzt', 'now', '', '{}', 'Wir müssen jetzt gehen.', 'We have to go now.', 35),
  ('früh', 'early', '', '{}', 'Ich stehe früh auf.', 'I get up early.', 36),
  ('spät', 'late', '', '{}', 'Es ist schon spät.', 'It is already late.', 37)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 3: Family & people
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Family & people', 'Family members and people', 'A1', true, 3)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Familie', 'the family', 'pl. die Familien', '{}', 'Meine Familie ist groß.', 'My family is big.', 1),
  ('die Mutter', 'the mother', 'pl. die Mütter', '{}', 'Meine Mutter kocht gern.', 'My mother likes to cook.', 2),
  ('der Vater', 'the father', 'pl. die Väter', '{}', 'Mein Vater arbeitet viel.', 'My father works a lot.', 3),
  ('die Eltern', 'the parents', 'plural only', '{}', 'Meine Eltern wohnen in Köln.', 'My parents live in Cologne.', 4),
  ('das Kind', 'the child', 'pl. die Kinder', '{}', 'Das Kind spielt im Garten.', 'The child is playing in the garden.', 5),
  ('der Sohn', 'the son', 'pl. die Söhne', '{}', 'Ihr Sohn ist zehn.', 'Her son is ten.', 6),
  ('die Tochter', 'the daughter', 'pl. die Töchter', '{}', 'Seine Tochter studiert.', 'His daughter is studying.', 7),
  ('der Bruder', 'the brother', 'pl. die Brüder', '{}', 'Ich habe einen Bruder.', 'I have one brother.', 8),
  ('die Schwester', 'the sister', 'pl. die Schwestern', '{}', 'Meine Schwester wohnt in Wien.', 'My sister lives in Vienna.', 9),
  ('die Großmutter', 'the grandmother', 'pl. die Großmütter', '{}', 'Meine Großmutter ist achtzig.', 'My grandmother is eighty.', 10),
  ('der Großvater', 'the grandfather', 'pl. die Großväter', '{}', 'Mein Großvater erzählt gern.', 'My grandfather likes telling stories.', 11),
  ('der Onkel', 'the uncle', 'pl. die Onkel', '{}', 'Mein Onkel wohnt in Bonn.', 'My uncle lives in Bonn.', 12),
  ('die Tante', 'the aunt', 'pl. die Tanten', '{}', 'Meine Tante ist sehr nett.', 'My aunt is very kind.', 13),
  ('der Freund', 'the friend / boyfriend', 'male; pl. die Freunde', '{}', 'Er ist mein bester Freund.', 'He is my best friend.', 14),
  ('die Freundin', 'the friend / girlfriend', 'female; pl. die Freundinnen', '{}', 'Sie ist meine beste Freundin.', 'She is my best friend.', 15),
  ('der Mann', 'the man / husband', 'pl. die Männer', '{}', 'Der Mann dort ist mein Onkel.', 'The man over there is my uncle.', 16),
  ('die Frau', 'the woman / wife', 'pl. die Frauen', '{}', 'Die Frau heißt Frau Schmidt.', 'The woman is called Mrs Schmidt.', 17),
  ('das Baby', 'the baby', 'pl. die Babys', '{}', 'Das Baby schläft.', 'The baby is sleeping.', 18),
  ('der Junge', 'the boy', 'pl. die Jungen', '{}', 'Der Junge spielt Fußball.', 'The boy plays football.', 19),
  ('das Mädchen', 'the girl', 'pl. die Mädchen', '{}', 'Das Mädchen liest ein Buch.', 'The girl is reading a book.', 20),
  ('der Name', 'the name', 'pl. die Namen', '{}', 'Wie ist dein Name?', 'What is your name?', 21),
  ('die Leute', 'the people', 'plural only', '{}', 'Viele Leute warten hier.', 'Many people are waiting here.', 22),
  ('der Nachbar', 'the neighbour', 'pl. die Nachbarn', '{}', 'Mein Nachbar ist laut.', 'My neighbour is loud.', 23)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 4: Food & drink
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Food & drink', 'Everyday food, drinks and eating', 'A1', true, 4)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Brot', 'the bread', 'pl. die Brote', '{}', 'Ich kaufe Brot beim Bäcker.', 'I buy bread at the bakery.', 1),
  ('das Brötchen', 'the bread roll', 'pl. die Brötchen', '{}', 'Zum Frühstück esse ich ein Brötchen.', 'For breakfast I eat a bread roll.', 2),
  ('das Wasser', 'the water', 'usually no plural', '{}', 'Ich trinke viel Wasser.', 'I drink a lot of water.', 3),
  ('die Milch', 'the milk', '', '{}', 'Die Milch ist im Kühlschrank.', 'The milk is in the fridge.', 4),
  ('der Kaffee', 'the coffee', '', '{}', 'Ich trinke morgens Kaffee.', 'I drink coffee in the morning.', 5),
  ('der Tee', 'the tea', '', '{}', 'Möchtest du einen Tee?', 'Would you like a tea?', 6),
  ('das Bier', 'the beer', 'pl. die Biere', '{}', 'Ein Bier, bitte.', 'A beer, please.', 7),
  ('der Wein', 'the wine', 'pl. die Weine', '{}', 'Sie trinkt gern Rotwein.', 'She likes drinking red wine.', 8),
  ('der Apfel', 'the apple', 'pl. die Äpfel', '{}', 'Der Apfel ist rot.', 'The apple is red.', 9),
  ('die Banane', 'the banana', 'pl. die Bananen', '{}', 'Die Banane ist gelb.', 'The banana is yellow.', 10),
  ('das Ei', 'the egg', 'pl. die Eier', '{}', 'Ich esse ein Ei zum Frühstück.', 'I eat an egg for breakfast.', 11),
  ('der Käse', 'the cheese', '', '{}', 'Der Käse schmeckt gut.', 'The cheese tastes good.', 12),
  ('die Butter', 'the butter', '', '{}', 'Brot mit Butter, bitte.', 'Bread with butter, please.', 13),
  ('das Fleisch', 'the meat', '', '{}', 'Ich esse kein Fleisch.', 'I do not eat meat.', 14),
  ('der Fisch', 'the fish', 'pl. die Fische', '{}', 'Freitags gibt es Fisch.', 'On Fridays there is fish.', 15),
  ('das Gemüse', 'the vegetables', 'collective, singular in German', '{}', 'Iss dein Gemüse!', 'Eat your vegetables!', 16),
  ('das Obst', 'the fruit', 'collective, singular in German', '{}', 'Obst ist gesund.', 'Fruit is healthy.', 17),
  ('die Kartoffel', 'the potato', 'pl. die Kartoffeln', '{}', 'Kartoffeln mag ich sehr.', 'I really like potatoes.', 18),
  ('die Tomate', 'the tomato', 'pl. die Tomaten', '{}', 'Die Tomate ist reif.', 'The tomato is ripe.', 19),
  ('der Zucker', 'the sugar', '', '{}', 'Nimmst du Zucker?', 'Do you take sugar?', 20),
  ('das Salz', 'the salt', '', '{}', 'Kannst du mir das Salz geben?', 'Can you pass me the salt?', 21),
  ('der Reis', 'the rice', '', '{}', 'Es gibt Reis mit Gemüse.', 'There is rice with vegetables.', 22),
  ('die Suppe', 'the soup', 'pl. die Suppen', '{}', 'Die Suppe ist heiß.', 'The soup is hot.', 23),
  ('der Saft', 'the juice', 'pl. die Säfte', '{}', 'Ich trinke gern Saft.', 'I like drinking juice.', 24),
  ('der Kuchen', 'the cake', 'pl. die Kuchen', '{}', 'Der Kuchen ist lecker.', 'The cake is delicious.', 25),
  ('das Frühstück', 'breakfast', '', '{}', 'Das Frühstück ist fertig.', 'Breakfast is ready.', 26),
  ('das Mittagessen', 'lunch', '', '{}', 'Was gibt es zum Mittagessen?', 'What is for lunch?', 27),
  ('das Abendessen', 'dinner', '', '{}', 'Wir essen um sieben Abendessen.', 'We have dinner at seven.', 28),
  ('der Hunger', 'hunger', 'Hunger haben = to be hungry', '{}', 'Ich habe großen Hunger.', 'I am very hungry.', 29),
  ('der Durst', 'thirst', 'Durst haben = to be thirsty', '{}', 'Ich habe Durst.', 'I am thirsty.', 30),
  ('lecker', 'tasty / delicious', '', '{adjective}', 'Das Essen ist lecker!', 'The food is delicious!', 31),
  ('süß', 'sweet', '', '{adjective}', 'Der Kuchen ist sehr süß.', 'The cake is very sweet.', 32)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 5: Everyday verbs
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Everyday verbs', 'The most common verbs', 'A1', true, 5)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('sein', 'to be', 'ist, war, ist gewesen', '{verb}', 'Ich bin müde.', 'I am tired.', 1),
  ('haben', 'to have', 'hat, hatte, gehabt', '{verb}', 'Ich habe Hunger.', 'I am hungry.', 2),
  ('werden', 'to become', 'wird, wurde, ist geworden', '{verb}', 'Es wird kalt.', 'It is getting cold.', 3),
  ('machen', 'to do / to make', '', '{verb}', 'Was machst du?', 'What are you doing?', 4),
  ('gehen', 'to go / to walk', 'geht, ging, ist gegangen', '{verb}', 'Ich gehe nach Hause.', 'I am going home.', 5),
  ('kommen', 'to come', 'kommt, kam, ist gekommen', '{verb}', 'Kommst du mit?', 'Are you coming along?', 6),
  ('fahren', 'to drive / to go (by vehicle)', 'fährt, fuhr, ist gefahren', '{verb}', 'Wir fahren nach Berlin.', 'We are driving to Berlin.', 7),
  ('essen', 'to eat', 'isst, aß, gegessen', '{verb}', 'Wir essen um acht.', 'We eat at eight.', 8),
  ('trinken', 'to drink', 'trinkt, trank, getrunken', '{verb}', 'Ich trinke Wasser.', 'I drink water.', 9),
  ('sprechen', 'to speak', 'spricht, sprach, gesprochen', '{verb}', 'Sprichst du Deutsch?', 'Do you speak German?', 10),
  ('sehen', 'to see', 'sieht, sah, gesehen', '{verb}', 'Ich sehe dich.', 'I see you.', 11),
  ('hören', 'to hear / to listen', '', '{verb}', 'Ich höre Musik.', 'I listen to music.', 12),
  ('wohnen', 'to live / to reside', '', '{verb}', 'Ich wohne in Hamburg.', 'I live in Hamburg.', 13),
  ('arbeiten', 'to work', '', '{verb}', 'Sie arbeitet im Büro.', 'She works in the office.', 14),
  ('lernen', 'to learn', '', '{verb}', 'Ich lerne Deutsch.', 'I am learning German.', 15),
  ('spielen', 'to play', '', '{verb}', 'Die Kinder spielen draußen.', 'The children play outside.', 16),
  ('kaufen', 'to buy', '', '{verb}', 'Ich kaufe ein Buch.', 'I am buying a book.', 17),
  ('kochen', 'to cook', '', '{verb}', 'Heute koche ich Suppe.', 'Today I am cooking soup.', 18),
  ('schlafen', 'to sleep', 'schläft, schlief, geschlafen', '{verb}', 'Das Baby schläft.', 'The baby is sleeping.', 19),
  ('lesen', 'to read', 'liest, las, gelesen', '{verb}', 'Ich lese ein Buch.', 'I am reading a book.', 20),
  ('schreiben', 'to write', 'schreibt, schrieb, geschrieben', '{verb}', 'Er schreibt einen Brief.', 'He is writing a letter.', 21),
  ('verstehen', 'to understand', 'versteht, verstand, verstanden', '{verb}', 'Ich verstehe das nicht.', 'I do not understand that.', 22),
  ('heißen', 'to be called', 'heißt, hieß, geheißen', '{verb}', 'Wie heißt du?', 'What is your name?', 23),
  ('mögen', 'to like', 'mag, mochte, gemocht', '{verb}', 'Ich mag Schokolade.', 'I like chocolate.', 24),
  ('möchten', 'would like', 'polite wish', '{verb}', 'Ich möchte einen Kaffee.', 'I would like a coffee.', 25),
  ('können', 'can / to be able to', 'kann, konnte, gekonnt', '{verb}', 'Ich kann schwimmen.', 'I can swim.', 26),
  ('müssen', 'must / to have to', 'muss, musste, gemusst', '{verb}', 'Ich muss jetzt gehen.', 'I have to go now.', 27),
  ('wollen', 'to want', 'will, wollte, gewollt', '{verb}', 'Sie will nach Hause.', 'She wants to go home.', 28),
  ('brauchen', 'to need', '', '{verb}', 'Ich brauche Hilfe.', 'I need help.', 29),
  ('geben', 'to give', 'gibt, gab, gegeben', '{verb}', 'Gib mir bitte das Buch.', 'Please give me the book.', 30),
  ('nehmen', 'to take', 'nimmt, nahm, genommen', '{verb}', 'Ich nehme den Bus.', 'I take the bus.', 31),
  ('finden', 'to find', 'findet, fand, gefunden', '{verb}', 'Ich finde den Schlüssel nicht.', 'I cannot find the key.', 32),
  ('fragen', 'to ask', '', '{verb}', 'Ich frage den Lehrer.', 'I ask the teacher.', 33),
  ('antworten', 'to answer', '', '{verb}', 'Bitte antworte mir.', 'Please answer me.', 34),
  ('helfen', 'to help', 'hilft, half, geholfen; + Dativ', '{verb,dat}', 'Ich helfe dir gern.', 'I am happy to help you.', 35)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 6: House & home
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · House & home', 'Rooms and things at home', 'A1', true, 6)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Haus', 'the house', 'pl. die Häuser', '{}', 'Das Haus ist groß.', 'The house is big.', 1),
  ('die Wohnung', 'the flat / apartment', 'pl. die Wohnungen', '{}', 'Meine Wohnung ist klein.', 'My flat is small.', 2),
  ('das Zimmer', 'the room', 'pl. die Zimmer', '{}', 'Das Zimmer ist hell.', 'The room is bright.', 3),
  ('die Küche', 'the kitchen', 'pl. die Küchen', '{}', 'Ich koche in der Küche.', 'I cook in the kitchen.', 4),
  ('das Bad', 'the bathroom', 'pl. die Bäder', '{}', 'Das Bad ist oben.', 'The bathroom is upstairs.', 5),
  ('das Schlafzimmer', 'the bedroom', 'pl. die Schlafzimmer', '{}', 'Ich schlafe im Schlafzimmer.', 'I sleep in the bedroom.', 6),
  ('das Wohnzimmer', 'the living room', 'pl. die Wohnzimmer', '{}', 'Wir sitzen im Wohnzimmer.', 'We sit in the living room.', 7),
  ('der Tisch', 'the table', 'pl. die Tische', '{}', 'Das Essen steht auf dem Tisch.', 'The food is on the table.', 8),
  ('der Stuhl', 'the chair', 'pl. die Stühle', '{}', 'Der Stuhl ist bequem.', 'The chair is comfortable.', 9),
  ('das Sofa', 'the sofa', 'pl. die Sofas', '{}', 'Das Sofa ist neu.', 'The sofa is new.', 10),
  ('das Bett', 'the bed', 'pl. die Betten', '{}', 'Das Bett ist weich.', 'The bed is soft.', 11),
  ('die Tür', 'the door', 'pl. die Türen', '{}', 'Mach bitte die Tür zu.', 'Please close the door.', 12),
  ('das Fenster', 'the window', 'pl. die Fenster', '{}', 'Das Fenster ist offen.', 'The window is open.', 13),
  ('der Schrank', 'the cupboard / wardrobe', 'pl. die Schränke', '{}', 'Die Kleidung ist im Schrank.', 'The clothes are in the wardrobe.', 14),
  ('die Lampe', 'the lamp', 'pl. die Lampen', '{}', 'Die Lampe ist hell.', 'The lamp is bright.', 15),
  ('der Kühlschrank', 'the fridge', 'pl. die Kühlschränke', '{}', 'Die Milch ist im Kühlschrank.', 'The milk is in the fridge.', 16),
  ('der Garten', 'the garden', 'pl. die Gärten', '{}', 'Wir sitzen im Garten.', 'We sit in the garden.', 17),
  ('die Miete', 'the rent', 'pl. die Mieten', '{}', 'Die Miete ist hoch.', 'The rent is high.', 18),
  ('der Schlüssel', 'the key', 'pl. die Schlüssel', '{}', 'Wo ist mein Schlüssel?', 'Where is my key?', 19),
  ('die Treppe', 'the stairs', 'pl. die Treppen', '{}', 'Die Treppe ist steil.', 'The stairs are steep.', 20),
  ('der Boden', 'the floor', 'pl. die Böden', '{}', 'Der Boden ist sauber.', 'The floor is clean.', 21),
  ('die Wand', 'the wall', 'pl. die Wände', '{}', 'Das Bild hängt an der Wand.', 'The picture hangs on the wall.', 22)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 7: Body & health
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Body & health', 'Parts of the body and feeling well', 'A1', true, 7)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('der Körper', 'the body', 'pl. die Körper', '{}', 'Der Körper braucht Schlaf.', 'The body needs sleep.', 1),
  ('der Kopf', 'the head', 'pl. die Köpfe', '{}', 'Mein Kopf tut weh.', 'My head hurts.', 2),
  ('das Gesicht', 'the face', 'pl. die Gesichter', '{}', 'Sie hat ein freundliches Gesicht.', 'She has a friendly face.', 3),
  ('das Auge', 'the eye', 'pl. die Augen', '{}', 'Sie hat blaue Augen.', 'She has blue eyes.', 4),
  ('das Ohr', 'the ear', 'pl. die Ohren', '{}', 'Mein Ohr tut weh.', 'My ear hurts.', 5),
  ('die Nase', 'the nose', 'pl. die Nasen', '{}', 'Die Nase ist kalt.', 'The nose is cold.', 6),
  ('der Mund', 'the mouth', 'pl. die Münder', '{}', 'Mach den Mund auf.', 'Open your mouth.', 7),
  ('die Hand', 'the hand', 'pl. die Hände', '{}', 'Wasch dir die Hände!', 'Wash your hands!', 8),
  ('der Arm', 'the arm', 'pl. die Arme', '{}', 'Mein Arm tut weh.', 'My arm hurts.', 9),
  ('das Bein', 'the leg', 'pl. die Beine', '{}', 'Das Bein ist lang.', 'The leg is long.', 10),
  ('der Fuß', 'the foot', 'pl. die Füße', '{}', 'Mein Fuß ist kalt.', 'My foot is cold.', 11),
  ('der Bauch', 'the belly / stomach', 'pl. die Bäuche', '{}', 'Mein Bauch tut weh.', 'My stomach hurts.', 12),
  ('der Rücken', 'the back', 'pl. die Rücken', '{}', 'Mein Rücken tut weh.', 'My back hurts.', 13),
  ('der Zahn', 'the tooth', 'pl. die Zähne', '{}', 'Der Zahn tut weh.', 'The tooth hurts.', 14),
  ('das Haar', 'the hair', 'pl. die Haare', '{}', 'Sie hat lange Haare.', 'She has long hair.', 15),
  ('krank', 'ill / sick', '', '{adjective}', 'Ich bin heute krank.', 'I am ill today.', 16),
  ('gesund', 'healthy', '', '{adjective}', 'Obst ist gesund.', 'Fruit is healthy.', 17),
  ('müde', 'tired', '', '{adjective}', 'Ich bin sehr müde.', 'I am very tired.', 18),
  ('der Arzt', 'the doctor', 'pl. die Ärzte', '{}', 'Ich gehe zum Arzt.', 'I am going to the doctor.', 19),
  ('die Apotheke', 'the pharmacy', 'pl. die Apotheken', '{}', 'Die Apotheke ist offen.', 'The pharmacy is open.', 20),
  ('das Medikament', 'the medicine', 'pl. die Medikamente', '{}', 'Nimm das Medikament.', 'Take the medicine.', 21),
  ('weh tun', 'to hurt', '+ Dativ', '{verb,dat}', 'Mein Rücken tut weh.', 'My back hurts.', 22)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 8: Colours & adjectives
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Colours & adjectives', 'Colours and common describing words', 'A1', true, 8)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('rot', 'red', '', '{adjective}', 'Das Auto ist rot.', 'The car is red.', 1),
  ('blau', 'blue', '', '{adjective}', 'Der Himmel ist blau.', 'The sky is blue.', 2),
  ('grün', 'green', '', '{adjective}', 'Das Gras ist grün.', 'The grass is green.', 3),
  ('gelb', 'yellow', '', '{adjective}', 'Die Banane ist gelb.', 'The banana is yellow.', 4),
  ('schwarz', 'black', '', '{adjective}', 'Die Katze ist schwarz.', 'The cat is black.', 5),
  ('weiß', 'white', '', '{adjective}', 'Der Schnee ist weiß.', 'The snow is white.', 6),
  ('braun', 'brown', '', '{adjective}', 'Der Tisch ist braun.', 'The table is brown.', 7),
  ('grau', 'grey', '', '{adjective}', 'Der Himmel ist grau.', 'The sky is grey.', 8),
  ('orange', 'orange', '', '{adjective}', 'Die Frucht ist orange.', 'The fruit is orange.', 9),
  ('groß', 'big / tall', '', '{adjective}', 'Der Mann ist sehr groß.', 'The man is very tall.', 10),
  ('klein', 'small', '', '{adjective}', 'Das Kind ist klein.', 'The child is small.', 11),
  ('gut', 'good', '', '{adjective}', 'Das Essen ist gut.', 'The food is good.', 12),
  ('schlecht', 'bad', '', '{adjective}', 'Das Wetter ist schlecht.', 'The weather is bad.', 13),
  ('neu', 'new', '', '{adjective}', 'Mein Handy ist neu.', 'My phone is new.', 14),
  ('alt', 'old', '', '{adjective}', 'Das Haus ist alt.', 'The house is old.', 15),
  ('jung', 'young', '', '{adjective}', 'Sie ist noch jung.', 'She is still young.', 16),
  ('schön', 'beautiful / nice', '', '{adjective}', 'Die Blume ist schön.', 'The flower is beautiful.', 17),
  ('hässlich', 'ugly', '', '{adjective}', 'Das Gebäude ist hässlich.', 'The building is ugly.', 18),
  ('teuer', 'expensive', '', '{adjective}', 'Das Auto ist teuer.', 'The car is expensive.', 19),
  ('billig', 'cheap', '', '{adjective}', 'Das Brot ist billig.', 'The bread is cheap.', 20),
  ('schnell', 'fast', '', '{adjective}', 'Der Zug ist schnell.', 'The train is fast.', 21),
  ('langsam', 'slow', '', '{adjective}', 'Die Schnecke ist langsam.', 'The snail is slow.', 22),
  ('warm', 'warm', '', '{adjective}', 'Der Tee ist warm.', 'The tea is warm.', 23),
  ('kalt', 'cold', '', '{adjective}', 'Das Wasser ist kalt.', 'The water is cold.', 24),
  ('heiß', 'hot', '', '{adjective}', 'Die Suppe ist heiß.', 'The soup is hot.', 25),
  ('einfach', 'easy / simple', '', '{adjective}', 'Die Aufgabe ist einfach.', 'The task is easy.', 26),
  ('schwer', 'difficult / heavy', '', '{adjective}', 'Die Tasche ist schwer.', 'The bag is heavy.', 27),
  ('richtig', 'correct / right', '', '{adjective}', 'Die Antwort ist richtig.', 'The answer is correct.', 28),
  ('falsch', 'wrong / false', '', '{adjective}', 'Das ist falsch.', 'That is wrong.', 29),
  ('glücklich', 'happy', '', '{adjective}', 'Ich bin sehr glücklich.', 'I am very happy.', 30),
  ('traurig', 'sad', '', '{adjective}', 'Warum bist du traurig?', 'Why are you sad?', 31),
  ('wichtig', 'important', '', '{adjective}', 'Das ist sehr wichtig.', 'That is very important.', 32)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 9: City & directions
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · City & directions', 'Places in town and finding your way', 'A1', true, 9)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Stadt', 'the city / town', 'pl. die Städte', '{}', 'Berlin ist eine große Stadt.', 'Berlin is a big city.', 1),
  ('das Dorf', 'the village', 'pl. die Dörfer', '{}', 'Das Dorf ist sehr klein.', 'The village is very small.', 2),
  ('die Straße', 'the street', 'pl. die Straßen', '{}', 'Die Straße ist lang.', 'The street is long.', 3),
  ('der Platz', 'the square / place', 'pl. die Plätze', '{}', 'Der Platz ist im Zentrum.', 'The square is in the centre.', 4),
  ('der Bahnhof', 'the train station', 'pl. die Bahnhöfe', '{}', 'Der Bahnhof ist dort.', 'The station is over there.', 5),
  ('der Flughafen', 'the airport', 'pl. die Flughäfen', '{}', 'Der Flughafen ist weit.', 'The airport is far.', 6),
  ('die Bank', 'the bank', 'pl. die Banken', '{}', 'Die Bank ist geschlossen.', 'The bank is closed.', 7),
  ('die Post', 'the post office', '', '{}', 'Die Post ist neben der Bank.', 'The post office is next to the bank.', 8),
  ('das Geschäft', 'the shop', 'pl. die Geschäfte', '{}', 'Das Geschäft öffnet um neun.', 'The shop opens at nine.', 9),
  ('der Markt', 'the market', 'pl. die Märkte', '{}', 'Der Markt ist am Samstag.', 'The market is on Saturday.', 10),
  ('das Restaurant', 'the restaurant', 'pl. die Restaurants', '{}', 'Das Restaurant ist gut.', 'The restaurant is good.', 11),
  ('das Hotel', 'the hotel', 'pl. die Hotels', '{}', 'Das Hotel ist im Zentrum.', 'The hotel is in the centre.', 12),
  ('das Krankenhaus', 'the hospital', 'pl. die Krankenhäuser', '{}', 'Das Krankenhaus ist neu.', 'The hospital is new.', 13),
  ('die Schule', 'the school', 'pl. die Schulen', '{}', 'Die Kinder gehen zur Schule.', 'The children go to school.', 14),
  ('die Kirche', 'the church', 'pl. die Kirchen', '{}', 'Die Kirche ist alt.', 'The church is old.', 15),
  ('der Park', 'the park', 'pl. die Parks', '{}', 'Wir gehen in den Park.', 'We go to the park.', 16),
  ('das Auto', 'the car', 'pl. die Autos', '{}', 'Mein Auto ist alt.', 'My car is old.', 17),
  ('der Bus', 'the bus', 'pl. die Busse', '{}', 'Der Bus kommt gleich.', 'The bus is coming soon.', 18),
  ('der Zug', 'the train', 'pl. die Züge', '{}', 'Der Zug hat Verspätung.', 'The train is delayed.', 19),
  ('das Fahrrad', 'the bicycle', 'pl. die Fahrräder', '{}', 'Ich fahre mit dem Fahrrad.', 'I ride my bicycle.', 20),
  ('links', 'left', '', '{}', 'Geh nach links.', 'Go left.', 21),
  ('rechts', 'right', '', '{}', 'Das Geschäft ist rechts.', 'The shop is on the right.', 22),
  ('geradeaus', 'straight ahead', '', '{}', 'Fahr geradeaus.', 'Go straight ahead.', 23),
  ('hier', 'here', '', '{}', 'Ich bin hier.', 'I am here.', 24),
  ('dort', 'there', '', '{}', 'Der Bahnhof ist dort.', 'The station is there.', 25),
  ('weit', 'far', '', '{adjective}', 'Es ist nicht weit.', 'It is not far.', 26),
  ('nah', 'near / close', '', '{adjective}', 'Das Geschäft ist ganz nah.', 'The shop is very close.', 27)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 10: Clothing
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Clothing', 'Clothes and what you wear', 'A1', true, 10)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Kleidung', 'the clothing', 'usually no plural', '{}', 'Die Kleidung ist im Schrank.', 'The clothing is in the wardrobe.', 1),
  ('das Hemd', 'the shirt', 'pl. die Hemden', '{}', 'Das Hemd ist weiß.', 'The shirt is white.', 2),
  ('die Hose', 'the trousers', 'pl. die Hosen', '{}', 'Die Hose ist zu lang.', 'The trousers are too long.', 3),
  ('das Kleid', 'the dress', 'pl. die Kleider', '{}', 'Das Kleid ist schön.', 'The dress is beautiful.', 4),
  ('der Rock', 'the skirt', 'pl. die Röcke', '{}', 'Der Rock ist rot.', 'The skirt is red.', 5),
  ('der Pullover', 'the sweater', 'pl. die Pullover', '{}', 'Der Pullover ist warm.', 'The sweater is warm.', 6),
  ('die Jacke', 'the jacket', 'pl. die Jacken', '{}', 'Nimm deine Jacke mit.', 'Take your jacket with you.', 7),
  ('der Mantel', 'the coat', 'pl. die Mäntel', '{}', 'Im Winter trage ich einen Mantel.', 'In winter I wear a coat.', 8),
  ('die Schuhe', 'the shoes', 'pl.; sg. der Schuh', '{}', 'Die Schuhe sind neu.', 'The shoes are new.', 9),
  ('die Socke', 'the sock', 'pl. die Socken', '{}', 'Wo ist meine Socke?', 'Where is my sock?', 10),
  ('der Hut', 'the hat', 'pl. die Hüte', '{}', 'Der Hut ist zu groß.', 'The hat is too big.', 11),
  ('die Mütze', 'the cap / beanie', 'pl. die Mützen', '{}', 'Im Winter trage ich eine Mütze.', 'In winter I wear a beanie.', 12),
  ('die Brille', 'the glasses', 'pl. die Brillen', '{}', 'Meine Brille ist kaputt.', 'My glasses are broken.', 13),
  ('die Tasche', 'the bag', 'pl. die Taschen', '{}', 'Die Tasche ist schwer.', 'The bag is heavy.', 14),
  ('der Schal', 'the scarf', 'pl. die Schals', '{}', 'Der Schal ist weich.', 'The scarf is soft.', 15),
  ('die Uhr', 'the watch', 'pl. die Uhren', '{}', 'Meine Uhr ist neu.', 'My watch is new.', 16),
  ('tragen', 'to wear / to carry', 'trägt, trug, getragen', '{verb}', 'Ich trage eine Jacke.', 'I am wearing a jacket.', 17),
  ('anziehen', 'to put on', 'separable: zieht an', '{verb}', 'Zieh deine Schuhe an!', 'Put your shoes on!', 18),
  ('passen', 'to fit', '+ Dativ', '{verb,dat}', 'Die Hose passt mir gut.', 'The trousers fit me well.', 19),
  ('die Größe', 'the size', 'pl. die Größen', '{}', 'Welche Größe haben Sie?', 'What size are you?', 20)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 11: Weather & seasons
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Weather & seasons', 'Talking about the weather', 'A1', true, 11)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Wetter', 'the weather', 'usually no plural', '{}', 'Wie ist das Wetter heute?', 'What is the weather like today?', 1),
  ('die Sonne', 'the sun', 'pl. die Sonnen', '{}', 'Die Sonne scheint.', 'The sun is shining.', 2),
  ('der Regen', 'the rain', '', '{}', 'Der Regen hört nicht auf.', 'The rain does not stop.', 3),
  ('der Schnee', 'the snow', '', '{}', 'Der Schnee ist weiß.', 'The snow is white.', 4),
  ('der Wind', 'the wind', 'pl. die Winde', '{}', 'Der Wind ist stark.', 'The wind is strong.', 5),
  ('die Wolke', 'the cloud', 'pl. die Wolken', '{}', 'Am Himmel sind viele Wolken.', 'There are many clouds in the sky.', 6),
  ('der Himmel', 'the sky', '', '{}', 'Der Himmel ist blau.', 'The sky is blue.', 7),
  ('warm', 'warm', '', '{adjective}', 'Heute ist es warm.', 'Today it is warm.', 8),
  ('kalt', 'cold', '', '{adjective}', 'Im Winter ist es kalt.', 'In winter it is cold.', 9),
  ('heiß', 'hot', '', '{adjective}', 'Im Sommer ist es heiß.', 'In summer it is hot.', 10),
  ('sonnig', 'sunny', '', '{adjective}', 'Heute ist es sonnig.', 'Today it is sunny.', 11),
  ('regnen', 'to rain', 'es regnet', '{verb}', 'Es regnet den ganzen Tag.', 'It rains all day.', 12),
  ('schneien', 'to snow', 'es schneit', '{verb}', 'Im Winter schneit es oft.', 'In winter it often snows.', 13),
  ('scheinen', 'to shine', 'scheint, schien, geschienen', '{verb}', 'Die Sonne scheint.', 'The sun is shining.', 14),
  ('der Frühling', 'spring', '', '{}', 'Im Frühling blühen die Blumen.', 'In spring the flowers bloom.', 15),
  ('der Sommer', 'summer', '', '{}', 'Im Sommer fahren wir ans Meer.', 'In summer we go to the sea.', 16),
  ('der Herbst', 'autumn', '', '{}', 'Im Herbst fallen die Blätter.', 'In autumn the leaves fall.', 17),
  ('der Winter', 'winter', '', '{}', 'Im Winter ist es kalt.', 'In winter it is cold.', 18),
  ('das Grad', 'the degree', 'pl. die Grad', '{}', 'Es sind zwanzig Grad.', 'It is twenty degrees.', 19),
  ('nass', 'wet', '', '{adjective}', 'Die Straße ist nass.', 'The street is wet.', 20),
  ('trocken', 'dry', '', '{adjective}', 'Das Wetter ist trocken.', 'The weather is dry.', 21)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 12: Hobbies & free time
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Hobbies & free time', 'Sport, music and free time', 'A1', true, 12)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Hobby', 'the hobby', 'pl. die Hobbys', '{}', 'Mein Hobby ist Lesen.', 'My hobby is reading.', 1),
  ('die Freizeit', 'free time', 'usually no plural', '{}', 'In der Freizeit spiele ich Tennis.', 'In my free time I play tennis.', 2),
  ('der Sport', 'sport', '', '{}', 'Ich mache gern Sport.', 'I like doing sport.', 3),
  ('der Fußball', 'football / soccer', '', '{}', 'Die Kinder spielen Fußball.', 'The children play football.', 4),
  ('die Musik', 'music', '', '{}', 'Ich höre gern Musik.', 'I like listening to music.', 5),
  ('das Buch', 'the book', 'pl. die Bücher', '{}', 'Ich lese ein gutes Buch.', 'I am reading a good book.', 6),
  ('der Film', 'the film / movie', 'pl. die Filme', '{}', 'Der Film war spannend.', 'The film was exciting.', 7),
  ('das Spiel', 'the game', 'pl. die Spiele', '{}', 'Das Spiel macht Spaß.', 'The game is fun.', 8),
  ('die Party', 'the party', 'pl. die Partys', '{}', 'Am Samstag ist eine Party.', 'On Saturday there is a party.', 9),
  ('die Reise', 'the trip / journey', 'pl. die Reisen', '{}', 'Die Reise war schön.', 'The trip was nice.', 10),
  ('spielen', 'to play', '', '{verb}', 'Ich spiele Gitarre.', 'I play the guitar.', 11),
  ('singen', 'to sing', 'singt, sang, gesungen', '{verb}', 'Wir singen ein Lied.', 'We sing a song.', 12),
  ('tanzen', 'to dance', '', '{verb}', 'Sie tanzt sehr gut.', 'She dances very well.', 13),
  ('schwimmen', 'to swim', 'schwimmt, schwamm, ist geschwommen', '{verb}', 'Im Sommer schwimme ich oft.', 'In summer I often swim.', 14),
  ('laufen', 'to run / to walk', 'läuft, lief, ist gelaufen', '{verb}', 'Ich laufe jeden Morgen.', 'I run every morning.', 15),
  ('reisen', 'to travel', '', '{verb}', 'Ich reise gern.', 'I like to travel.', 16),
  ('fotografieren', 'to take photos', '', '{verb}', 'Sie fotografiert die Stadt.', 'She is photographing the city.', 17),
  ('malen', 'to paint', '', '{verb}', 'Das Kind malt ein Bild.', 'The child is painting a picture.', 18),
  ('treffen', 'to meet', 'trifft, traf, getroffen', '{verb}', 'Ich treffe meine Freunde.', 'I am meeting my friends.', 19),
  ('der Spaß', 'fun', 'Spaß machen = to be fun', '{}', 'Das macht viel Spaß.', 'That is a lot of fun.', 20),
  ('die Karte', 'the card / ticket', 'pl. die Karten', '{}', 'Ich kaufe zwei Karten für das Kino.', 'I buy two tickets for the cinema.', 21),
  ('das Kino', 'the cinema', 'pl. die Kinos', '{}', 'Wir gehen ins Kino.', 'We are going to the cinema.', 22)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 13: School & learning
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · School & learning', 'School, study and the classroom', 'A1', true, 13)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Schule', 'the school', 'pl. die Schulen', '{}', 'Die Schule beginnt um acht.', 'School starts at eight.', 1),
  ('der Lehrer', 'the teacher', 'male; pl. die Lehrer', '{}', 'Der Lehrer erklärt die Aufgabe.', 'The teacher explains the task.', 2),
  ('die Lehrerin', 'the teacher', 'female; pl. die Lehrerinnen', '{}', 'Die Lehrerin ist sehr nett.', 'The teacher is very kind.', 3),
  ('der Schüler', 'the pupil / student', 'male; pl. die Schüler', '{}', 'Der Schüler lernt fleißig.', 'The pupil studies diligently.', 4),
  ('die Klasse', 'the class', 'pl. die Klassen', '{}', 'Die Klasse ist groß.', 'The class is big.', 5),
  ('das Buch', 'the book', 'pl. die Bücher', '{}', 'Öffnet euer Buch auf Seite zehn.', 'Open your book on page ten.', 6),
  ('das Heft', 'the notebook', 'pl. die Hefte', '{}', 'Schreib es in dein Heft.', 'Write it in your notebook.', 7),
  ('der Stift', 'the pen', 'pl. die Stifte', '{}', 'Mein Stift schreibt nicht.', 'My pen does not write.', 8),
  ('der Bleistift', 'the pencil', 'pl. die Bleistifte', '{}', 'Ich zeichne mit dem Bleistift.', 'I draw with the pencil.', 9),
  ('das Papier', 'the paper', '', '{}', 'Ich brauche ein Blatt Papier.', 'I need a sheet of paper.', 10),
  ('die Aufgabe', 'the task / exercise', 'pl. die Aufgaben', '{}', 'Die Aufgabe ist einfach.', 'The task is easy.', 11),
  ('die Frage', 'the question', 'pl. die Fragen', '{}', 'Ich habe eine Frage.', 'I have a question.', 12),
  ('die Antwort', 'the answer', 'pl. die Antworten', '{}', 'Die Antwort ist richtig.', 'The answer is correct.', 13),
  ('das Wort', 'the word', 'pl. die Wörter', '{}', 'Wie schreibt man dieses Wort?', 'How do you spell this word?', 14),
  ('die Sprache', 'the language', 'pl. die Sprachen', '{}', 'Deutsch ist eine schöne Sprache.', 'German is a beautiful language.', 15),
  ('die Prüfung', 'the exam', 'pl. die Prüfungen', '{}', 'Die Prüfung ist am Montag.', 'The exam is on Monday.', 16),
  ('lernen', 'to learn / to study', '', '{verb}', 'Ich lerne jeden Tag Deutsch.', 'I study German every day.', 17),
  ('lesen', 'to read', 'liest, las, gelesen', '{verb}', 'Wir lesen einen Text.', 'We are reading a text.', 18),
  ('schreiben', 'to write', 'schreibt, schrieb, geschrieben', '{verb}', 'Schreib deinen Namen.', 'Write your name.', 19),
  ('üben', 'to practise', '', '{verb}', 'Ich übe die Wörter.', 'I practise the words.', 20),
  ('erklären', 'to explain', '', '{verb}', 'Kannst du das erklären?', 'Can you explain that?', 21),
  ('verstehen', 'to understand', 'versteht, verstand, verstanden', '{verb}', 'Ich verstehe die Frage.', 'I understand the question.', 22),
  ('wissen', 'to know', 'weiß, wusste, gewusst', '{verb}', 'Ich weiß die Antwort.', 'I know the answer.', 23),
  ('richtig', 'correct', '', '{adjective}', 'Das ist richtig.', 'That is correct.', 24)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 14: Animals & nature
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Animals & nature', 'Animals and the natural world', 'A1', true, 14)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Tier', 'the animal', 'pl. die Tiere', '{}', 'Im Zoo gibt es viele Tiere.', 'There are many animals at the zoo.', 1),
  ('der Hund', 'the dog', 'pl. die Hunde', '{}', 'Der Hund ist freundlich.', 'The dog is friendly.', 2),
  ('die Katze', 'the cat', 'pl. die Katzen', '{}', 'Die Katze schläft auf dem Sofa.', 'The cat sleeps on the sofa.', 3),
  ('der Vogel', 'the bird', 'pl. die Vögel', '{}', 'Der Vogel singt am Morgen.', 'The bird sings in the morning.', 4),
  ('der Fisch', 'the fish', 'pl. die Fische', '{}', 'Der Fisch schwimmt im Wasser.', 'The fish swims in the water.', 5),
  ('das Pferd', 'the horse', 'pl. die Pferde', '{}', 'Das Pferd läuft schnell.', 'The horse runs fast.', 6),
  ('die Kuh', 'the cow', 'pl. die Kühe', '{}', 'Die Kuh gibt Milch.', 'The cow gives milk.', 7),
  ('das Schwein', 'the pig', 'pl. die Schweine', '{}', 'Das Schwein ist auf dem Bauernhof.', 'The pig is on the farm.', 8),
  ('der Baum', 'the tree', 'pl. die Bäume', '{}', 'Der Baum ist sehr alt.', 'The tree is very old.', 9),
  ('die Blume', 'the flower', 'pl. die Blumen', '{}', 'Die Blume ist schön.', 'The flower is beautiful.', 10),
  ('der Wald', 'the forest', 'pl. die Wälder', '{}', 'Wir gehen im Wald spazieren.', 'We go for a walk in the forest.', 11),
  ('der Berg', 'the mountain', 'pl. die Berge', '{}', 'Der Berg ist hoch.', 'The mountain is high.', 12),
  ('der See', 'the lake', 'pl. die Seen', '{}', 'Wir schwimmen im See.', 'We swim in the lake.', 13),
  ('das Meer', 'the sea', 'pl. die Meere', '{}', 'Im Sommer fahren wir ans Meer.', 'In summer we go to the sea.', 14),
  ('der Fluss', 'the river', 'pl. die Flüsse', '{}', 'Der Fluss ist breit.', 'The river is wide.', 15),
  ('die Sonne', 'the sun', '', '{}', 'Die Sonne ist warm.', 'The sun is warm.', 16),
  ('der Mond', 'the moon', '', '{}', 'Der Mond ist hell.', 'The moon is bright.', 17),
  ('der Stern', 'the star', 'pl. die Sterne', '{}', 'Am Himmel sind viele Sterne.', 'There are many stars in the sky.', 18),
  ('das Wasser', 'the water', '', '{}', 'Das Wasser ist klar.', 'The water is clear.', 19),
  ('die Luft', 'the air', '', '{}', 'Die Luft ist frisch.', 'The air is fresh.', 20)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 15: Work & professions
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Work & professions', 'Jobs and the world of work', 'A1', true, 15)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Arbeit', 'the work / job', 'pl. die Arbeiten', '{}', 'Die Arbeit beginnt um neun.', 'Work starts at nine.', 1),
  ('der Beruf', 'the profession', 'pl. die Berufe', '{}', 'Was sind Sie von Beruf?', 'What is your profession?', 2),
  ('das Büro', 'the office', 'pl. die Büros', '{}', 'Ich arbeite im Büro.', 'I work in the office.', 3),
  ('die Firma', 'the company', 'pl. die Firmen', '{}', 'Die Firma ist groß.', 'The company is big.', 4),
  ('der Chef', 'the boss', 'pl. die Chefs', '{}', 'Mein Chef ist sehr nett.', 'My boss is very kind.', 5),
  ('der Arzt', 'the doctor', 'pl. die Ärzte', '{}', 'Der Arzt hilft den Patienten.', 'The doctor helps the patients.', 6),
  ('der Lehrer', 'the teacher', 'pl. die Lehrer', '{}', 'Der Lehrer arbeitet an einer Schule.', 'The teacher works at a school.', 7),
  ('der Verkäufer', 'the salesperson', 'pl. die Verkäufer', '{}', 'Der Verkäufer ist freundlich.', 'The salesperson is friendly.', 8),
  ('der Koch', 'the cook / chef', 'pl. die Köche', '{}', 'Der Koch macht gutes Essen.', 'The cook makes good food.', 9),
  ('der Polizist', 'the police officer', 'pl. die Polizisten', '{}', 'Der Polizist hilft mir.', 'The police officer helps me.', 10),
  ('der Student', 'the student', 'pl. die Studenten', '{}', 'Der Student lernt an der Uni.', 'The student studies at university.', 11),
  ('das Geld', 'the money', '', '{}', 'Ich verdiene genug Geld.', 'I earn enough money.', 12),
  ('der Computer', 'the computer', 'pl. die Computer', '{}', 'Ich arbeite am Computer.', 'I work on the computer.', 13),
  ('das Telefon', 'the telephone', 'pl. die Telefone', '{}', 'Das Telefon klingelt.', 'The telephone is ringing.', 14),
  ('die E-Mail', 'the email', 'pl. die E-Mails', '{}', 'Ich schreibe eine E-Mail.', 'I am writing an email.', 15),
  ('arbeiten', 'to work', '', '{verb}', 'Ich arbeite von neun bis fünf.', 'I work from nine to five.', 16),
  ('verdienen', 'to earn', '', '{verb}', 'Sie verdient gutes Geld.', 'She earns good money.', 17),
  ('anfangen', 'to start / to begin', 'separable: fängt an', '{verb}', 'Die Arbeit fängt um acht an.', 'Work starts at eight.', 18),
  ('aufhören', 'to stop / to finish', 'separable: hört auf', '{verb}', 'Ich höre um fünf auf.', 'I finish at five.', 19),
  ('verkaufen', 'to sell', '', '{verb}', 'Sie verkauft Kleidung.', 'She sells clothes.', 20)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 16: Shopping & money
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Shopping & money', 'Buying things and paying', 'A1', true, 16)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Geld', 'the money', '', '{}', 'Ich habe kein Geld dabei.', 'I have no money on me.', 1),
  ('der Euro', 'the euro', 'pl. die Euro', '{}', 'Das kostet zehn Euro.', 'That costs ten euros.', 2),
  ('der Preis', 'the price', 'pl. die Preise', '{}', 'Der Preis ist gut.', 'The price is good.', 3),
  ('das Geschäft', 'the shop', 'pl. die Geschäfte', '{}', 'Das Geschäft ist geschlossen.', 'The shop is closed.', 4),
  ('der Supermarkt', 'the supermarket', 'pl. die Supermärkte', '{}', 'Ich gehe in den Supermarkt.', 'I am going to the supermarket.', 5),
  ('die Kasse', 'the till / checkout', 'pl. die Kassen', '{}', 'Bitte zahlen Sie an der Kasse.', 'Please pay at the checkout.', 6),
  ('das Geschenk', 'the present / gift', 'pl. die Geschenke', '{}', 'Das Geschenk ist für dich.', 'The present is for you.', 7),
  ('die Rechnung', 'the bill', 'pl. die Rechnungen', '{}', 'Die Rechnung, bitte.', 'The bill, please.', 8),
  ('die Karte', 'the card', 'pl. die Karten', '{}', 'Kann ich mit Karte zahlen?', 'Can I pay by card?', 9),
  ('das Geld zurück', 'the change', 'lit. money back', '{}', 'Hier ist Ihr Geld zurück.', 'Here is your change.', 10),
  ('kaufen', 'to buy', '', '{verb}', 'Ich kaufe ein Geschenk.', 'I am buying a present.', 11),
  ('verkaufen', 'to sell', '', '{verb}', 'Er verkauft sein Auto.', 'He is selling his car.', 12),
  ('bezahlen', 'to pay', '', '{verb}', 'Ich bezahle das Essen.', 'I am paying for the meal.', 13),
  ('kosten', 'to cost', '', '{verb}', 'Wie viel kostet das?', 'How much does that cost?', 14),
  ('brauchen', 'to need', '', '{verb}', 'Ich brauche neue Schuhe.', 'I need new shoes.', 15),
  ('teuer', 'expensive', '', '{adjective}', 'Das ist mir zu teuer.', 'That is too expensive for me.', 16),
  ('billig', 'cheap', '', '{adjective}', 'Hier ist alles billig.', 'Everything is cheap here.', 17),
  ('günstig', 'cheap / good value', '', '{adjective}', 'Der Preis ist günstig.', 'The price is good value.', 18),
  ('die Tüte', 'the bag', 'pl. die Tüten', '{}', 'Möchten Sie eine Tüte?', 'Would you like a bag?', 19),
  ('offen', 'open', '', '{adjective}', 'Das Geschäft ist offen.', 'The shop is open.', 20),
  ('geschlossen', 'closed', '', '{adjective}', 'Sonntags ist alles geschlossen.', 'On Sundays everything is closed.', 21)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 17: Travel & transport
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Travel & transport', 'Getting around and travelling', 'A1', true, 17)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Reise', 'the trip / journey', 'pl. die Reisen', '{}', 'Gute Reise!', 'Have a good trip!', 1),
  ('der Urlaub', 'the holiday / vacation', 'pl. die Urlaube', '{}', 'Im Urlaub fahren wir nach Spanien.', 'On holiday we go to Spain.', 2),
  ('das Ticket', 'the ticket', 'pl. die Tickets', '{}', 'Ich kaufe ein Ticket.', 'I am buying a ticket.', 3),
  ('der Koffer', 'the suitcase', 'pl. die Koffer', '{}', 'Mein Koffer ist schwer.', 'My suitcase is heavy.', 4),
  ('der Pass', 'the passport', 'pl. die Pässe', '{}', 'Zeig mir bitte deinen Pass.', 'Please show me your passport.', 5),
  ('das Flugzeug', 'the plane', 'pl. die Flugzeuge', '{}', 'Das Flugzeug landet gleich.', 'The plane is landing soon.', 6),
  ('der Zug', 'the train', 'pl. die Züge', '{}', 'Der Zug fährt um zehn.', 'The train leaves at ten.', 7),
  ('das Schiff', 'the ship', 'pl. die Schiffe', '{}', 'Das Schiff ist groß.', 'The ship is big.', 8),
  ('das Taxi', 'the taxi', 'pl. die Taxis', '{}', 'Wir nehmen ein Taxi.', 'We take a taxi.', 9),
  ('die Fahrkarte', 'the ticket (transport)', 'pl. die Fahrkarten', '{}', 'Die Fahrkarte kostet drei Euro.', 'The ticket costs three euros.', 10),
  ('die Haltestelle', 'the (bus/tram) stop', 'pl. die Haltestellen', '{}', 'Die Haltestelle ist dort.', 'The stop is over there.', 11),
  ('der Weg', 'the way / path', 'pl. die Wege', '{}', 'Der Weg ist lang.', 'The way is long.', 12),
  ('die Ankunft', 'the arrival', '', '{}', 'Die Ankunft ist um drei.', 'The arrival is at three.', 13),
  ('die Abfahrt', 'the departure', '', '{}', 'Die Abfahrt ist um neun.', 'The departure is at nine.', 14),
  ('fahren', 'to go (by vehicle) / to drive', 'fährt, fuhr, ist gefahren', '{verb}', 'Wir fahren mit dem Zug.', 'We go by train.', 15),
  ('fliegen', 'to fly', 'fliegt, flog, ist geflogen', '{verb}', 'Wir fliegen nach Rom.', 'We are flying to Rome.', 16),
  ('ankommen', 'to arrive', 'separable: kommt an', '{verb}', 'Der Zug kommt um fünf an.', 'The train arrives at five.', 17),
  ('abfahren', 'to depart / to leave', 'separable: fährt ab', '{verb}', 'Der Bus fährt gleich ab.', 'The bus is leaving soon.', 18),
  ('buchen', 'to book', '', '{verb}', 'Ich buche ein Hotel.', 'I am booking a hotel.', 19),
  ('die Verspätung', 'the delay', 'pl. die Verspätungen', '{}', 'Der Zug hat Verspätung.', 'The train is delayed.', 20)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 18: Question words & adverbs
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Question words & adverbs', 'Asking questions and useful little words', 'A1', true, 18)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('wer', 'who', '', '{}', 'Wer ist das?', 'Who is that?', 1),
  ('was', 'what', '', '{}', 'Was machst du?', 'What are you doing?', 2),
  ('wo', 'where', '', '{}', 'Wo wohnst du?', 'Where do you live?', 3),
  ('wann', 'when', '', '{}', 'Wann kommst du?', 'When are you coming?', 4),
  ('warum', 'why', '', '{}', 'Warum lernst du Deutsch?', 'Why are you learning German?', 5),
  ('wie', 'how', '', '{}', 'Wie geht es dir?', 'How are you?', 6),
  ('wie viel', 'how much', '', '{}', 'Wie viel kostet das?', 'How much does that cost?', 7),
  ('wie viele', 'how many', '', '{}', 'Wie viele Kinder hast du?', 'How many children do you have?', 8),
  ('woher', 'where from', '', '{}', 'Woher kommst du?', 'Where are you from?', 9),
  ('wohin', 'where to', '', '{}', 'Wohin gehst du?', 'Where are you going?', 10),
  ('welcher', 'which', 'welcher / welche / welches', '{}', 'Welcher Bus fährt zum Bahnhof?', 'Which bus goes to the station?', 11),
  ('hier', 'here', '', '{}', 'Ich warte hier.', 'I am waiting here.', 12),
  ('da', 'there', '', '{}', 'Da ist mein Haus.', 'There is my house.', 13),
  ('immer', 'always', '', '{}', 'Ich trinke immer Kaffee.', 'I always drink coffee.', 14),
  ('oft', 'often', '', '{}', 'Wir gehen oft ins Kino.', 'We often go to the cinema.', 15),
  ('manchmal', 'sometimes', '', '{}', 'Manchmal koche ich.', 'Sometimes I cook.', 16),
  ('nie', 'never', '', '{}', 'Ich rauche nie.', 'I never smoke.', 17),
  ('auch', 'also / too', '', '{}', 'Ich komme auch mit.', 'I am coming too.', 18),
  ('schon', 'already', '', '{}', 'Bist du schon fertig?', 'Are you already done?', 19),
  ('noch', 'still / yet', '', '{}', 'Ich bin noch nicht fertig.', 'I am not done yet.', 20),
  ('gern', 'gladly / to like doing', '', '{}', 'Ich tanze gern.', 'I like dancing.', 21),
  ('hier und da', 'here and there', '', '{}', 'Hier und da gibt es Probleme.', 'Here and there are problems.', 22)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 19: Prepositions & little words (shows the case symbols)
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A1 · Prepositions & little words', 'Common prepositions with their fixed case', 'A1', true, 19)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('für', 'for', 'always accusative', '{akk}', 'Das Geschenk ist für dich.', 'The present is for you.', 1),
  ('ohne', 'without', 'always accusative', '{akk}', 'Ich trinke Kaffee ohne Zucker.', 'I drink coffee without sugar.', 2),
  ('durch', 'through', 'always accusative', '{akk}', 'Wir gehen durch den Park.', 'We walk through the park.', 3),
  ('gegen', 'against / around', 'always accusative', '{akk}', 'Ich komme gegen acht.', 'I will come around eight.', 4),
  ('um', 'at / around', 'always accusative', '{akk}', 'Der Film beginnt um acht Uhr.', 'The film starts at eight.', 5),
  ('mit', 'with', 'always dative', '{dat}', 'Ich fahre mit dem Auto.', 'I go by car.', 6),
  ('zu', 'to', 'always dative', '{dat}', 'Ich gehe zu meiner Freundin.', 'I am going to my friend.', 7),
  ('bei', 'at / near', 'always dative', '{dat}', 'Ich bin bei meinen Eltern.', 'I am at my parents.', 8),
  ('nach', 'after / to', 'always dative', '{dat}', 'Nach dem Essen schlafe ich.', 'After the meal I sleep.', 9),
  ('von', 'from / of', 'always dative', '{dat}', 'Das ist ein Brief von Anna.', 'That is a letter from Anna.', 10),
  ('aus', 'from / out of', 'always dative', '{dat}', 'Ich komme aus Deutschland.', 'I come from Germany.', 11),
  ('seit', 'since / for', 'always dative', '{dat}', 'Ich lerne seit einem Jahr Deutsch.', 'I have been learning German for a year.', 12),
  ('wegen', 'because of', 'genitive', '{gen}', 'Wegen des Regens bleiben wir zu Hause.', 'Because of the rain we stay at home.', 13),
  ('in', 'in / into', 'two-way: dative or accusative', '{wechsel}', 'Ich bin in der Stadt.', 'I am in the city.', 14),
  ('auf', 'on / onto', 'two-way: dative or accusative', '{wechsel}', 'Das Buch liegt auf dem Tisch.', 'The book is on the table.', 15),
  ('und', 'and', '', '{}', 'Brot und Butter.', 'Bread and butter.', 16),
  ('oder', 'or', '', '{}', 'Tee oder Kaffee?', 'Tea or coffee?', 17),
  ('aber', 'but', '', '{}', 'Klein, aber fein.', 'Small but nice.', 18),
  ('nicht', 'not', '', '{}', 'Ich weiß es nicht.', 'I do not know.', 19),
  ('sehr', 'very', '', '{}', 'Das ist sehr gut.', 'That is very good.', 20)
) as v(front, back, notes, tags, example, example_en, ord);

-- Fertig: 19 A1-Decks, sauber neu angelegt. Öffne die App → "My decks".


