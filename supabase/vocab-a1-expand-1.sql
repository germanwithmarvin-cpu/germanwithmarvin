-- ============================================================================
-- A1 VOKABEL-AUSBAU · Batch 1 (ADD-ONLY, ~222 neue Karten)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run".
--
-- WICHTIG: Diese Datei loescht NICHTS. Sie fuegt nur neue Karten in die bereits
-- vorhandenen A1-Decks ein (per Deck-Titel + Besitzer gematcht). Bestehende
-- Karten, Decks und der Lern-Fortschritt bleiben komplett erhalten.
--
-- Format: front = Deutsch (mit Artikel), back = Englisch, notes = kurze Info,
-- example = deutscher Beispielsatz, example_en = englische Uebersetzung.
-- Neue Karten bekommen sort_order ab 101, damit sie hinten anschliessen.
-- ============================================================================

-- Sicherstellen, dass die Beispiel-Spalten existieren (idempotent, schadet nie).
alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';


-- ---------------------------------------------------------------------------
-- A1 · Greetings & basics
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('danke schön', 'thank you very much', '', '{}', 'Danke schön für das Geschenk!', 'Thank you very much for the gift!', 101),
  ('bitte schön', 'here you go / you are welcome', '', '{}', 'Bitte schön, hier ist Ihr Kaffee.', 'Here you go, here is your coffee.', 102),
  ('Grüß dich', 'hi', 'informal, southern', '{}', 'Grüß dich, wie läuft es?', 'Hi, how is it going?', 103),
  ('Wie bitte?', 'pardon? / sorry?', '', '{}', 'Wie bitte? Kannst du das wiederholen?', 'Pardon? Can you repeat that?', 104),
  ('Freut mich', 'nice to meet you', '', '{}', 'Ich bin Anna. — Freut mich!', 'I am Anna. — Nice to meet you!', 105),
  ('bis morgen', 'see you tomorrow', '', '{}', 'Bis morgen in der Schule!', 'See you tomorrow at school!', 106),
  ('gleichfalls', 'you too / likewise', '', '{}', 'Schönes Wochenende! — Danke, gleichfalls.', 'Have a nice weekend! — Thanks, you too.', 107),
  ('mir geht es gut', 'I am fine', '', '{}', 'Wie geht es dir? — Mir geht es gut.', 'How are you? — I am fine.', 108),
  ('und dir?', 'and you?', 'informal', '{}', 'Mir geht es gut, und dir?', 'I am fine, and you?', 109),
  ('Prost', 'cheers', '', '{}', 'Prost! Auf deine Gesundheit.', 'Cheers! To your health.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Greetings & basics'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Numbers, time & date
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('dreizehn', 'thirteen', '', '{}', 'Mein Bruder ist dreizehn Jahre alt.', 'My brother is thirteen years old.', 101),
  ('vierzehn', 'fourteen', '', '{}', 'Der Bus kommt um vierzehn Uhr.', 'The bus comes at two in the afternoon.', 102),
  ('fünfzehn', 'fifteen', '', '{}', 'Ich warte seit fünfzehn Minuten.', 'I have been waiting for fifteen minutes.', 103),
  ('sechzehn', 'sixteen', '', '{}', 'Sie wird bald sechzehn.', 'She will soon be sixteen.', 104),
  ('siebzehn', 'seventeen', '', '{}', 'Wir sind siebzehn Leute.', 'We are seventeen people.', 105),
  ('achtzehn', 'eighteen', '', '{}', 'Mit achtzehn ist man erwachsen.', 'At eighteen you are an adult.', 106),
  ('neunzehn', 'nineteen', '', '{}', 'Das Zimmer hat die Nummer neunzehn.', 'The room has number nineteen.', 107),
  ('vierzig', 'forty', '', '{}', 'Mein Vater ist vierzig Jahre alt.', 'My father is forty years old.', 108),
  ('fünfzig', 'fifty', '', '{}', 'Das Buch kostet fünfzig Euro.', 'The book costs fifty euros.', 109),
  ('das Wochenende', 'weekend', '', '{}', 'Am Wochenende schlafe ich lange.', 'On the weekend I sleep in.', 110),
  ('der Nachmittag', 'afternoon', '', '{}', 'Am Nachmittag trinke ich Kaffee.', 'In the afternoon I drink coffee.', 111),
  ('die Sekunde', 'second', '', '{}', 'Warte eine Sekunde, bitte.', 'Wait a second, please.', 112),
  ('das Datum', 'date', 'calendar date', '{}', 'Welches Datum haben wir heute?', 'What is the date today?', 113)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Numbers, time & date'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Family & people
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Großeltern', 'grandparents', 'plural', '{}', 'Meine Großeltern wohnen auf dem Land.', 'My grandparents live in the countryside.', 101),
  ('der Enkel', 'grandson', '', '{}', 'Der Enkel besucht seine Oma.', 'The grandson visits his grandma.', 102),
  ('die Enkelin', 'granddaughter', '', '{}', 'Die Enkelin spielt im Garten.', 'The granddaughter plays in the garden.', 103),
  ('der Cousin', 'cousin (male)', '', '{}', 'Mein Cousin kommt aus Wien.', 'My cousin is from Vienna.', 104),
  ('die Cousine', 'cousin (female)', '', '{}', 'Meine Cousine ist sehr nett.', 'My cousin is very nice.', 105),
  ('die Geschwister', 'siblings', 'plural', '{}', 'Hast du Geschwister?', 'Do you have siblings?', 106),
  ('die Oma', 'grandma', 'informal', '{}', 'Meine Oma backt einen Kuchen.', 'My grandma is baking a cake.', 107),
  ('der Opa', 'grandpa', 'informal', '{}', 'Mein Opa liest die Zeitung.', 'My grandpa reads the newspaper.', 108),
  ('verheiratet', 'married', '', '{}', 'Meine Schwester ist verheiratet.', 'My sister is married.', 109),
  ('ledig', 'single (unmarried)', '', '{}', 'Ich bin noch ledig.', 'I am still single.', 110),
  ('die Person', 'person', '', '{}', 'An dem Tisch sitzen vier Personen.', 'Four people are sitting at the table.', 111)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Family & people'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Food & drink
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Getränk', 'drink / beverage', '', '{}', 'Möchtest du ein Getränk?', 'Would you like a drink?', 101),
  ('der Löffel', 'spoon', '', '{}', 'Ich esse die Suppe mit dem Löffel.', 'I eat the soup with the spoon.', 102),
  ('die Gabel', 'fork', '', '{}', 'Die Gabel liegt links vom Teller.', 'The fork is to the left of the plate.', 103),
  ('das Messer', 'knife', '', '{}', 'Das Messer ist sehr scharf.', 'The knife is very sharp.', 104),
  ('der Teller', 'plate', '', '{}', 'Der Teller ist noch heiß.', 'The plate is still hot.', 105),
  ('das Glas', 'glass', '', '{}', 'Ich trinke ein Glas Wasser.', 'I drink a glass of water.', 106),
  ('die Tasse', 'cup', '', '{}', 'Möchtest du eine Tasse Tee?', 'Would you like a cup of tea?', 107),
  ('die Orange', 'orange', '', '{}', 'Die Orange ist süß und saftig.', 'The orange is sweet and juicy.', 108),
  ('die Zwiebel', 'onion', '', '{}', 'Ich schneide die Zwiebel klein.', 'I chop the onion.', 109),
  ('die Nudeln', 'pasta / noodles', 'plural', '{}', 'Zum Mittagessen gibt es Nudeln.', 'For lunch there is pasta.', 110),
  ('die Wurst', 'sausage', '', '{}', 'Auf dem Brot ist Wurst.', 'There is sausage on the bread.', 111),
  ('das Eis', 'ice cream', '', '{}', 'Im Sommer esse ich gern Eis.', 'In summer I like to eat ice cream.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Food & drink'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Everyday verbs
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('sagen', 'to say', '', '{}', 'Was möchtest du sagen?', 'What do you want to say?', 101),
  ('denken', 'to think', '', '{}', 'Ich denke oft an dich.', 'I often think of you.', 102),
  ('glauben', 'to believe / think', '', '{}', 'Ich glaube, das ist richtig.', 'I think that is right.', 103),
  ('bleiben', 'to stay', '', '{}', 'Wir bleiben heute zu Hause.', 'We are staying home today.', 104),
  ('stehen', 'to stand', '', '{}', 'Die Leute stehen an der Haltestelle.', 'The people are standing at the bus stop.', 105),
  ('sitzen', 'to sit', '', '{}', 'Wir sitzen im Café.', 'We are sitting in the café.', 106),
  ('liegen', 'to lie / be located', '', '{}', 'Das Buch liegt auf dem Tisch.', 'The book is lying on the table.', 107),
  ('bringen', 'to bring', '', '{}', 'Kannst du mir das Salz bringen?', 'Can you bring me the salt?', 108),
  ('zeigen', 'to show', '', '{}', 'Ich zeige dir die Stadt.', 'I will show you the city.', 109),
  ('warten', 'to wait', '', '{}', 'Wir warten auf den Bus.', 'We are waiting for the bus.', 110),
  ('suchen', 'to look for', '', '{}', 'Ich suche meinen Schlüssel.', 'I am looking for my key.', 111),
  ('öffnen', 'to open', '', '{}', 'Bitte öffne das Fenster.', 'Please open the window.', 112),
  ('schließen', 'to close', '', '{}', 'Kannst du die Tür schließen?', 'Can you close the door?', 113),
  ('aufstehen', 'to get up', 'separable', '{}', 'Ich stehe um sieben Uhr auf.', 'I get up at seven in the morning.', 114)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Everyday verbs'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · House & home
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Dach', 'roof', '', '{}', 'Auf dem Dach sitzt eine Katze.', 'A cat is sitting on the roof.', 101),
  ('der Balkon', 'balcony', '', '{}', 'Wir frühstücken auf dem Balkon.', 'We have breakfast on the balcony.', 102),
  ('der Keller', 'cellar / basement', '', '{}', 'Die Getränke sind im Keller.', 'The drinks are in the cellar.', 103),
  ('der Flur', 'hallway', '', '{}', 'Die Schuhe stehen im Flur.', 'The shoes are in the hallway.', 104),
  ('die Dusche', 'shower', '', '{}', 'Die Dusche ist im Bad.', 'The shower is in the bathroom.', 105),
  ('der Herd', 'stove', '', '{}', 'Die Suppe kocht auf dem Herd.', 'The soup is cooking on the stove.', 106),
  ('der Fernseher', 'television set', '', '{}', 'Der Fernseher ist im Wohnzimmer.', 'The television is in the living room.', 107),
  ('der Teppich', 'carpet / rug', '', '{}', 'Der Teppich ist weich und warm.', 'The carpet is soft and warm.', 108),
  ('das Regal', 'shelf', '', '{}', 'Die Bücher stehen im Regal.', 'The books are on the shelf.', 109),
  ('das Bild', 'picture', '', '{}', 'An der Wand hängt ein Bild.', 'A picture hangs on the wall.', 110),
  ('das Kissen', 'pillow / cushion', '', '{}', 'Das Kissen ist sehr weich.', 'The pillow is very soft.', 111),
  ('der Sessel', 'armchair', '', '{}', 'Opa sitzt gern im Sessel.', 'Grandpa likes to sit in the armchair.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · House & home'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Body & health
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Herz', 'heart', '', '{}', 'Mein Herz schlägt schnell.', 'My heart beats fast.', 101),
  ('das Knie', 'knee', '', '{}', 'Mein Knie tut weh.', 'My knee hurts.', 102),
  ('der Finger', 'finger', '', '{}', 'Ich habe mir den Finger verletzt.', 'I hurt my finger.', 103),
  ('die Schulter', 'shoulder', '', '{}', 'Meine Schulter ist verspannt.', 'My shoulder is tense.', 104),
  ('der Hals', 'neck / throat', '', '{}', 'Mein Hals tut beim Schlucken weh.', 'My throat hurts when I swallow.', 105),
  ('die Haut', 'skin', '', '{}', 'Die Sonne ist schlecht für die Haut.', 'The sun is bad for the skin.', 106),
  ('der Schmerz', 'pain', 'often plural: Schmerzen', '{}', 'Ich habe Schmerzen im Rücken.', 'I have pain in my back.', 107),
  ('das Fieber', 'fever', '', '{}', 'Das Kind hat hohes Fieber.', 'The child has a high fever.', 108),
  ('der Husten', 'cough', '', '{}', 'Ich habe seit gestern Husten.', 'I have had a cough since yesterday.', 109),
  ('die Erkältung', 'cold (illness)', '', '{}', 'Ich habe eine Erkältung.', 'I have a cold.', 110),
  ('die Grippe', 'flu', '', '{}', 'Im Winter bekommen viele die Grippe.', 'In winter many people get the flu.', 111),
  ('das Blut', 'blood', '', '{}', 'Der Arzt nimmt mir Blut ab.', 'The doctor takes my blood.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Body & health'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Colours & adjectives
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('rosa', 'pink', '', '{}', 'Das Baby trägt eine rosa Mütze.', 'The baby wears a pink hat.', 101),
  ('lila', 'purple', '', '{}', 'Die Blumen sind lila.', 'The flowers are purple.', 102),
  ('bunt', 'colourful', '', '{}', 'Der Markt ist bunt und laut.', 'The market is colourful and loud.', 103),
  ('hell', 'light / bright', '', '{}', 'Das Zimmer ist schön hell.', 'The room is nice and bright.', 104),
  ('dunkel', 'dark', '', '{}', 'Im Winter wird es früh dunkel.', 'In winter it gets dark early.', 105),
  ('lang', 'long', '', '{}', 'Der Film war sehr lang.', 'The film was very long.', 106),
  ('kurz', 'short', '', '{}', 'Ich mache eine kurze Pause.', 'I am taking a short break.', 107),
  ('dick', 'thick / fat', '', '{}', 'Das Buch ist dick und schwer.', 'The book is thick and heavy.', 108),
  ('dünn', 'thin', '', '{}', 'Die Jacke ist zu dünn für den Winter.', 'The jacket is too thin for winter.', 109),
  ('voll', 'full', '', '{}', 'Der Bus ist heute sehr voll.', 'The bus is very full today.', 110),
  ('leer', 'empty', '', '{}', 'Die Flasche ist schon leer.', 'The bottle is already empty.', 111),
  ('sauber', 'clean', '', '{}', 'Die Küche ist wieder sauber.', 'The kitchen is clean again.', 112),
  ('laut', 'loud', '', '{}', 'Die Musik ist zu laut.', 'The music is too loud.', 113),
  ('leise', 'quiet', '', '{}', 'Bitte sprich leise.', 'Please speak quietly.', 114)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Colours & adjectives'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · City & directions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Ecke', 'corner', '', '{}', 'Das Café ist an der Ecke.', 'The café is on the corner.', 101),
  ('die Kreuzung', 'crossing / intersection', '', '{}', 'An der Kreuzung musst du links gehen.', 'At the intersection you have to go left.', 102),
  ('die Ampel', 'traffic light', '', '{}', 'Warte an der roten Ampel.', 'Wait at the red traffic light.', 103),
  ('die Brücke', 'bridge', '', '{}', 'Wir gehen über die Brücke.', 'We walk across the bridge.', 104),
  ('die Bibliothek', 'library', '', '{}', 'In der Bibliothek ist es ruhig.', 'It is quiet in the library.', 105),
  ('das Museum', 'museum', '', '{}', 'Das Museum ist am Sonntag offen.', 'The museum is open on Sunday.', 106),
  ('das Café', 'café', '', '{}', 'Wir treffen uns im Café.', 'We are meeting at the café.', 107),
  ('die Bäckerei', 'bakery', '', '{}', 'In der Bäckerei kaufe ich Brötchen.', 'I buy rolls at the bakery.', 108),
  ('der Eingang', 'entrance', '', '{}', 'Der Eingang ist auf der linken Seite.', 'The entrance is on the left side.', 109),
  ('der Ausgang', 'exit', '', '{}', 'Wo ist der Ausgang?', 'Where is the exit?', 110),
  ('die Adresse', 'address', '', '{}', 'Wie ist deine Adresse?', 'What is your address?', 111),
  ('oben', 'up / upstairs', '', '{}', 'Das Bad ist oben.', 'The bathroom is upstairs.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · City & directions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Clothing
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Bluse', 'blouse', '', '{}', 'Sie trägt eine weiße Bluse.', 'She is wearing a white blouse.', 101),
  ('das T-Shirt', 't-shirt', '', '{}', 'Im Sommer trage ich ein T-Shirt.', 'In summer I wear a t-shirt.', 102),
  ('die Jeans', 'jeans', '', '{}', 'Die Jeans passt perfekt.', 'The jeans fit perfectly.', 103),
  ('der Anzug', 'suit', '', '{}', 'Zur Arbeit trägt er einen Anzug.', 'He wears a suit to work.', 104),
  ('die Krawatte', 'tie', '', '{}', 'Die Krawatte ist blau.', 'The tie is blue.', 105),
  ('der Gürtel', 'belt', '', '{}', 'Der Gürtel ist aus Leder.', 'The belt is made of leather.', 106),
  ('die Handschuhe', 'gloves', 'plural', '{}', 'Im Winter trage ich Handschuhe.', 'In winter I wear gloves.', 107),
  ('der Stiefel', 'boot', '', '{}', 'Meine Stiefel sind ganz nass.', 'My boots are all wet.', 108),
  ('ausziehen', 'to take off', 'separable', '{}', 'Bitte zieh die Schuhe aus.', 'Please take off your shoes.', 109),
  ('anprobieren', 'to try on', 'separable', '{}', 'Darf ich die Jacke anprobieren?', 'May I try on the jacket?', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Clothing'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Weather & seasons
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Gewitter', 'thunderstorm', '', '{}', 'Am Abend kommt ein Gewitter.', 'A thunderstorm is coming in the evening.', 101),
  ('der Blitz', 'lightning', '', '{}', 'Der Blitz war sehr hell.', 'The lightning was very bright.', 102),
  ('der Donner', 'thunder', '', '{}', 'Nach dem Blitz kommt der Donner.', 'After the lightning comes the thunder.', 103),
  ('der Nebel', 'fog', '', '{}', 'Am Morgen gibt es oft Nebel.', 'In the morning there is often fog.', 104),
  ('der Sturm', 'storm', '', '{}', 'Der Sturm ist sehr stark.', 'The storm is very strong.', 105),
  ('die Temperatur', 'temperature', '', '{}', 'Die Temperatur sinkt am Abend.', 'The temperature drops in the evening.', 106),
  ('wolkig', 'cloudy', '', '{}', 'Heute ist es wolkig und kühl.', 'Today it is cloudy and cool.', 107),
  ('windig', 'windy', '', '{}', 'Am Meer ist es oft windig.', 'At the sea it is often windy.', 108),
  ('kühl', 'cool', '', '{}', 'Der Herbst ist kühl.', 'Autumn is cool.', 109),
  ('der Regenschirm', 'umbrella', '', '{}', 'Nimm den Regenschirm mit!', 'Take the umbrella with you!', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Weather & seasons'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Hobbies & free time
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Konzert', 'concert', '', '{}', 'Am Samstag gehen wir ins Konzert.', 'On Saturday we are going to the concert.', 101),
  ('das Theater', 'theatre', '', '{}', 'Das Theater beginnt um acht.', 'The theatre starts at eight.', 102),
  ('die Gitarre', 'guitar', '', '{}', 'Ich spiele gern Gitarre.', 'I like playing the guitar.', 103),
  ('das Klavier', 'piano', '', '{}', 'Meine Tochter lernt Klavier.', 'My daughter is learning the piano.', 104),
  ('wandern', 'to hike', '', '{}', 'Am Wochenende wandern wir in den Bergen.', 'On the weekend we hike in the mountains.', 105),
  ('zeichnen', 'to draw', '', '{}', 'Das Kind zeichnet ein Haus.', 'The child is drawing a house.', 106),
  ('backen', 'to bake', '', '{}', 'Am Sonntag backe ich einen Kuchen.', 'On Sunday I bake a cake.', 107),
  ('joggen', 'to jog', '', '{}', 'Ich jogge jeden Morgen im Park.', 'I jog in the park every morning.', 108),
  ('die Zeitung', 'newspaper', '', '{}', 'Am Morgen lese ich die Zeitung.', 'In the morning I read the newspaper.', 109),
  ('das Fernsehen', 'television (medium)', '', '{}', 'Im Fernsehen kommt ein Film.', 'There is a film on television.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Hobbies & free time'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · School & learning
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Universität', 'university', '', '{}', 'Meine Schwester studiert an der Universität.', 'My sister studies at the university.', 101),
  ('das Fach', 'subject', 'school subject', '{}', 'Mein Lieblingsfach ist Mathe.', 'My favourite subject is maths.', 102),
  ('die Note', 'grade / mark', '', '{}', 'Ich habe eine gute Note bekommen.', 'I got a good grade.', 103),
  ('die Hausaufgabe', 'homework', '', '{}', 'Ich mache die Hausaufgabe am Abend.', 'I do the homework in the evening.', 104),
  ('der Test', 'test', '', '{}', 'Morgen schreiben wir einen Test.', 'Tomorrow we are writing a test.', 105),
  ('die Pause', 'break', '', '{}', 'In der Pause essen wir ein Brötchen.', 'During the break we eat a roll.', 106),
  ('der Unterricht', 'lessons / class', '', '{}', 'Der Unterricht beginnt um acht Uhr.', 'The lessons start at eight in the morning.', 107),
  ('der Kurs', 'course', '', '{}', 'Ich besuche einen Deutschkurs.', 'I am taking a German course.', 108),
  ('die Tafel', 'board', 'blackboard/whiteboard', '{}', 'Der Lehrer schreibt an die Tafel.', 'The teacher writes on the board.', 109),
  ('das Beispiel', 'example', '', '{}', 'Kannst du ein Beispiel geben?', 'Can you give an example?', 110),
  ('der Satz', 'sentence', '', '{}', 'Bitte lies den Satz laut.', 'Please read the sentence aloud.', 111),
  ('das Wörterbuch', 'dictionary', '', '{}', 'Ich suche das Wort im Wörterbuch.', 'I look up the word in the dictionary.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · School & learning'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Animals & nature
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Schaf', 'sheep', '', '{}', 'Auf der Wiese stehen viele Schafe.', 'There are many sheep in the meadow.', 101),
  ('die Ziege', 'goat', '', '{}', 'Die Ziege frisst Gras.', 'The goat is eating grass.', 102),
  ('das Huhn', 'chicken / hen', '', '{}', 'Das Huhn legt ein Ei.', 'The hen lays an egg.', 103),
  ('die Maus', 'mouse', '', '{}', 'Die Katze fängt eine Maus.', 'The cat catches a mouse.', 104),
  ('das Kaninchen', 'rabbit', '', '{}', 'Das Kaninchen ist klein und weich.', 'The rabbit is small and soft.', 105),
  ('der Löwe', 'lion', '', '{}', 'Der Löwe lebt in Afrika.', 'The lion lives in Africa.', 106),
  ('der Elefant', 'elephant', '', '{}', 'Der Elefant ist sehr groß.', 'The elephant is very big.', 107),
  ('der Bär', 'bear', '', '{}', 'Der Bär schläft im Winter.', 'The bear sleeps in winter.', 108),
  ('die Biene', 'bee', '', '{}', 'Die Biene macht Honig.', 'The bee makes honey.', 109),
  ('das Gras', 'grass', '', '{}', 'Das Gras ist nach dem Regen nass.', 'The grass is wet after the rain.', 110),
  ('das Blatt', 'leaf', '', '{}', 'Im Herbst fällt das Blatt vom Baum.', 'In autumn the leaf falls from the tree.', 111),
  ('die Erde', 'earth / soil', '', '{}', 'Die Erde im Garten ist trocken.', 'The soil in the garden is dry.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Animals & nature'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Work & professions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Ingenieur', 'engineer', '', '{}', 'Mein Bruder ist Ingenieur.', 'My brother is an engineer.', 101),
  ('der Kellner', 'waiter', '', '{}', 'Der Kellner bringt die Speisekarte.', 'The waiter brings the menu.', 102),
  ('die Krankenschwester', 'nurse', '', '{}', 'Die Krankenschwester hilft dem Arzt.', 'The nurse helps the doctor.', 103),
  ('der Bäcker', 'baker', '', '{}', 'Der Bäcker steht früh auf.', 'The baker gets up early.', 104),
  ('der Friseur', 'hairdresser', '', '{}', 'Der Friseur schneidet mir die Haare.', 'The hairdresser cuts my hair.', 105),
  ('der Fahrer', 'driver', '', '{}', 'Der Fahrer wartet vor dem Haus.', 'The driver is waiting in front of the house.', 106),
  ('der Bauer', 'farmer', '', '{}', 'Der Bauer arbeitet auf dem Feld.', 'The farmer works in the field.', 107),
  ('der Kollege', 'colleague (male)', '', '{}', 'Mein Kollege ist sehr nett.', 'My colleague is very nice.', 108),
  ('die Kollegin', 'colleague (female)', '', '{}', 'Meine Kollegin kommt aus Spanien.', 'My colleague is from Spain.', 109),
  ('der Termin', 'appointment', '', '{}', 'Ich habe morgen einen Termin.', 'I have an appointment tomorrow.', 110),
  ('das Gehalt', 'salary', '', '{}', 'Das Gehalt kommt am Monatsende.', 'The salary comes at the end of the month.', 111),
  ('der Vertrag', 'contract', '', '{}', 'Ich unterschreibe den Vertrag.', 'I sign the contract.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Work & professions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Shopping & money
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Angebot', 'offer / deal', '', '{}', 'Heute gibt es ein gutes Angebot.', 'Today there is a good deal.', 101),
  ('der Rabatt', 'discount', '', '{}', 'Auf die Jacke gibt es Rabatt.', 'There is a discount on the jacket.', 102),
  ('die Kreditkarte', 'credit card', '', '{}', 'Ich bezahle mit der Kreditkarte.', 'I pay by credit card.', 103),
  ('das Bargeld', 'cash', '', '{}', 'Haben Sie Bargeld dabei?', 'Do you have cash with you?', 104),
  ('der Cent', 'cent', '', '{}', 'Das kostet nur fünfzig Cent.', 'That costs only fifty cents.', 105),
  ('die Münze', 'coin', '', '{}', 'Ich habe keine Münze für den Wagen.', 'I have no coin for the trolley.', 106),
  ('der Kunde', 'customer (male)', '', '{}', 'Der Kunde wartet an der Kasse.', 'The customer is waiting at the checkout.', 107),
  ('die Kundin', 'customer (female)', '', '{}', 'Die Kundin sucht ein Geschenk.', 'The customer is looking for a gift.', 108),
  ('der Einkaufswagen', 'shopping cart / trolley', '', '{}', 'Der Einkaufswagen ist schon voll.', 'The shopping cart is already full.', 109),
  ('kostenlos', 'free (of charge)', '', '{}', 'Die Lieferung ist kostenlos.', 'The delivery is free.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Shopping & money'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Travel & transport
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die U-Bahn', 'underground / subway', '', '{}', 'Ich fahre mit der U-Bahn zur Arbeit.', 'I take the subway to work.', 101),
  ('die Straßenbahn', 'tram', '', '{}', 'Die Straßenbahn hält vor dem Museum.', 'The tram stops in front of the museum.', 102),
  ('das Gleis', 'platform / track', '', '{}', 'Der Zug fährt von Gleis drei.', 'The train leaves from platform three.', 103),
  ('das Gepäck', 'luggage', '', '{}', 'Mein Gepäck ist sehr schwer.', 'My luggage is very heavy.', 104),
  ('die Tankstelle', 'petrol / gas station', '', '{}', 'Wir halten an der Tankstelle.', 'We stop at the gas station.', 105),
  ('der Führerschein', 'driving licence', '', '{}', 'Ich mache gerade den Führerschein.', 'I am getting my driving licence right now.', 106),
  ('der Flug', 'flight', '', '{}', 'Der Flug dauert zwei Stunden.', 'The flight takes two hours.', 107),
  ('der Fahrplan', 'timetable / schedule', '', '{}', 'Der Fahrplan hängt am Bahnhof.', 'The timetable is posted at the station.', 108),
  ('einsteigen', 'to get on / board', 'separable', '{}', 'Bitte einsteigen, der Zug fährt gleich.', 'Please board, the train leaves shortly.', 109),
  ('aussteigen', 'to get off', 'separable', '{}', 'Wir steigen an der nächsten Station aus.', 'We get off at the next station.', 110),
  ('umsteigen', 'to change (trains)', 'separable', '{}', 'In Köln müssen wir umsteigen.', 'In Cologne we have to change trains.', 111),
  ('der Stau', 'traffic jam', '', '{}', 'Auf der Autobahn ist ein Stau.', 'There is a traffic jam on the motorway.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Travel & transport'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Question words & adverbs
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('wieso', 'why / how come', '', '{}', 'Wieso lachst du?', 'Why are you laughing?', 101),
  ('weshalb', 'why / for what reason', '', '{}', 'Weshalb bist du so spät?', 'Why are you so late?', 102),
  ('selten', 'rarely', '', '{}', 'Ich esse selten Fleisch.', 'I rarely eat meat.', 103),
  ('meistens', 'mostly / usually', '', '{}', 'Am Morgen trinke ich meistens Tee.', 'In the morning I usually drink tea.', 104),
  ('gerade', 'just now / right now', '', '{}', 'Ich habe gerade gegessen.', 'I have just eaten.', 105),
  ('bald', 'soon', '', '{}', 'Wir sehen uns bald wieder.', 'We will see each other again soon.', 106),
  ('gleich', 'in a moment / right away', '', '{}', 'Ich komme gleich.', 'I am coming in a moment.', 107),
  ('sofort', 'immediately', '', '{}', 'Komm bitte sofort her!', 'Please come here immediately!', 108),
  ('endlich', 'finally / at last', '', '{}', 'Endlich ist das Wetter schön.', 'Finally the weather is nice.', 109),
  ('wirklich', 'really', '', '{}', 'Das ist wirklich lecker.', 'That is really delicious.', 110),
  ('natürlich', 'of course', '', '{}', 'Natürlich helfe ich dir.', 'Of course I will help you.', 111),
  ('leider', 'unfortunately', '', '{}', 'Leider habe ich keine Zeit.', 'Unfortunately I have no time.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Question words & adverbs'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- A1 · Prepositions & little words
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('über', 'over / above', 'wechsel', '{}', 'Die Lampe hängt über dem Tisch.', 'The lamp hangs above the table.', 101),
  ('unter', 'under / below', 'wechsel', '{}', 'Die Katze schläft unter dem Bett.', 'The cat sleeps under the bed.', 102),
  ('vor', 'in front of / before', 'wechsel', '{}', 'Ich warte vor dem Haus.', 'I am waiting in front of the house.', 103),
  ('hinter', 'behind', 'wechsel', '{}', 'Der Garten ist hinter dem Haus.', 'The garden is behind the house.', 104),
  ('neben', 'next to', 'wechsel', '{}', 'Die Bank ist neben der Post.', 'The bank is next to the post office.', 105),
  ('zwischen', 'between', 'wechsel', '{}', 'Das Café ist zwischen der Bank und dem Kino.', 'The café is between the bank and the cinema.', 106),
  ('an', 'at / on', 'wechsel', '{}', 'Das Bild hängt an der Wand.', 'The picture hangs on the wall.', 107),
  ('bis', 'until', '', '{}', 'Ich arbeite bis fünf Uhr.', 'I work until five in the afternoon.', 108),
  ('denn', 'because / for', 'main-clause word order', '{}', 'Ich bleibe zu Hause, denn ich bin krank.', 'I am staying home, because I am ill.', 109),
  ('sondern', 'but (rather)', 'after a negation', '{}', 'Das ist nicht Tee, sondern Kaffee.', 'That is not tea, but coffee.', 110),
  ('weil', 'because', 'verb goes to the end', '{}', 'Ich lerne Deutsch, weil es mir gefällt.', 'I am learning German because I like it.', 111),
  ('wenn', 'if / when', 'verb goes to the end', '{}', 'Wenn es regnet, bleibe ich zu Hause.', 'If it rains, I stay home.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'A1 · Prepositions & little words'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- Kontrolle: neue A1-Kartenzahl gesamt
select count(*) as a1_karten
from public.fc_cards c join public.fc_decks d on d.id = c.deck_id
where d.level = 'A1';
