-- ============================================================================
-- A2 DECKS (verdichtet) — German Simplified Flashcards
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Selbst-genügsam.
-- ADDITIV: löscht NUR A2-Decks (A1/B1 bleiben), legt A2 neu an (~30 je Thema).
-- Format: front=Deutsch (mit Artikel), back=Englisch, notes=engl. Info,
-- example=dt. Beispielsatz, example_en=engl. Übersetzung. Kasus akk/dat/gen/wechsel.
-- ============================================================================

alter table public.fc_cards       add column if not exists example    text not null default '';
alter table public.fc_cards       add column if not exists example_en text not null default '';
alter table public.fc_card_states add column if not exists flagged    boolean not null default false;

delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and level = 'A2';


-- ---------------------------------------------------------------------------
-- Deck 1: Daily routine
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Daily routine', 'Reflexive and separable verbs for everyday life', 'A2', true, 1)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('aufstehen', 'to get up', 'separable: steht auf', '{verb}', 'Ich stehe um sieben auf.', 'I get up at seven.', 1),
  ('aufwachen', 'to wake up', 'separable: wacht auf', '{verb}', 'Ich wache früh auf.', 'I wake up early.', 2),
  ('der Wecker', 'the alarm clock', 'pl. die Wecker', '{}', 'Der Wecker klingelt um sechs.', 'The alarm goes off at six.', 3),
  ('sich waschen', 'to wash (oneself)', 'reflexive', '{verb}', 'Ich wasche mich jeden Morgen.', 'I wash every morning.', 4),
  ('sich duschen', 'to shower', 'reflexive', '{verb}', 'Sie duscht sich am Abend.', 'She showers in the evening.', 5),
  ('sich die Zähne putzen', 'to brush ones teeth', '', '{verb}', 'Ich putze mir die Zähne.', 'I brush my teeth.', 6),
  ('sich kämmen', 'to comb ones hair', 'reflexive', '{verb}', 'Ich kämme mich vor dem Spiegel.', 'I comb my hair in front of the mirror.', 7),
  ('sich rasieren', 'to shave', 'reflexive', '{verb}', 'Er rasiert sich jeden Tag.', 'He shaves every day.', 8),
  ('sich anziehen', 'to get dressed', 'reflexive, separable', '{verb}', 'Ich ziehe mich schnell an.', 'I get dressed quickly.', 9),
  ('sich umziehen', 'to change clothes', 'reflexive, separable', '{verb}', 'Nach der Arbeit ziehe ich mich um.', 'After work I change clothes.', 10),
  ('frühstücken', 'to have breakfast', '', '{verb}', 'Wir frühstücken zusammen.', 'We have breakfast together.', 11),
  ('den Tisch decken', 'to set the table', '', '{verb}', 'Kannst du den Tisch decken?', 'Can you set the table?', 12),
  ('abwaschen', 'to wash up / do the dishes', 'separable: wäscht ab', '{verb}', 'Nach dem Essen wasche ich ab.', 'After the meal I do the dishes.', 13),
  ('sich beeilen', 'to hurry', 'reflexive', '{verb}', 'Beeil dich, wir sind spät!', 'Hurry up, we are late!', 14),
  ('aufräumen', 'to tidy up', 'separable: räumt auf', '{verb}', 'Ich räume mein Zimmer auf.', 'I tidy my room.', 15),
  ('putzen', 'to clean', '', '{verb}', 'Sie putzt die Küche.', 'She cleans the kitchen.', 16),
  ('die Hausarbeit', 'the housework', '', '{}', 'Die Hausarbeit nervt mich.', 'Housework annoys me.', 17),
  ('die Wäsche', 'the laundry', 'Wäsche waschen', '{}', 'Ich mache die Wäsche.', 'I do the laundry.', 18),
  ('vorbereiten', 'to prepare', 'separable: bereitet vor', '{verb}', 'Ich bereite das Essen vor.', 'I prepare the meal.', 19),
  ('erledigen', 'to take care of / get done', '', '{verb}', 'Ich muss noch viel erledigen.', 'I still have a lot to get done.', 20),
  ('sich ausruhen', 'to rest', 'reflexive, separable', '{verb}', 'Am Sonntag ruhe ich mich aus.', 'On Sunday I rest.', 21),
  ('sich fühlen', 'to feel', 'reflexive', '{verb}', 'Ich fühle mich heute gut.', 'I feel good today.', 22),
  ('einschlafen', 'to fall asleep', 'separable: schläft ein', '{verb}', 'Ich schlafe schnell ein.', 'I fall asleep quickly.', 23),
  ('ins Bett gehen', 'to go to bed', '', '{verb}', 'Ich gehe um elf ins Bett.', 'I go to bed at eleven.', 24),
  ('der Alltag', 'everyday life', '', '{}', 'Mein Alltag ist stressig.', 'My everyday life is stressful.', 25),
  ('die Gewohnheit', 'the habit', 'pl. die Gewohnheiten', '{}', 'Das ist eine gute Gewohnheit.', 'That is a good habit.', 26),
  ('normalerweise', 'usually', '', '{}', 'Normalerweise stehe ich früh auf.', 'Usually I get up early.', 27),
  ('meistens', 'mostly', '', '{}', 'Meistens koche ich selbst.', 'Mostly I cook myself.', 28),
  ('zuerst', 'first', '', '{}', 'Zuerst trinke ich Kaffee.', 'First I drink coffee.', 29),
  ('danach', 'after that', '', '{}', 'Danach gehe ich zur Arbeit.', 'After that I go to work.', 30),
  ('schließlich', 'finally / in the end', '', '{}', 'Schließlich gehe ich schlafen.', 'In the end I go to sleep.', 31)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 2: Feelings & character
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Feelings & character', 'Emotions and describing people', 'A2', true, 2)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Gefühl', 'the feeling', 'pl. die Gefühle', '{}', 'Ich habe ein gutes Gefühl.', 'I have a good feeling.', 1),
  ('die Stimmung', 'the mood', 'pl. die Stimmungen', '{}', 'Die Stimmung ist gut.', 'The mood is good.', 2),
  ('froh', 'glad / happy', '', '{adjective}', 'Ich bin froh, dich zu sehen.', 'I am glad to see you.', 3),
  ('zufrieden', 'satisfied / content', '', '{adjective}', 'Sie ist mit der Arbeit zufrieden.', 'She is satisfied with the work.', 4),
  ('glücklich', 'happy', '', '{adjective}', 'Wir sind sehr glücklich.', 'We are very happy.', 5),
  ('traurig', 'sad', '', '{adjective}', 'Warum bist du traurig?', 'Why are you sad?', 6),
  ('aufgeregt', 'excited / nervous', '', '{adjective}', 'Vor der Prüfung bin ich aufgeregt.', 'Before the exam I am nervous.', 7),
  ('wütend', 'angry', 'auf + Akk', '{adjective}', 'Er ist wütend auf mich.', 'He is angry with me.', 8),
  ('enttäuscht', 'disappointed', 'von + Dativ', '{adjective}', 'Ich bin enttäuscht von dir.', 'I am disappointed in you.', 9),
  ('ängstlich', 'fearful / anxious', '', '{adjective}', 'Das Kind ist ängstlich.', 'The child is anxious.', 10),
  ('nervös', 'nervous', '', '{adjective}', 'Ich bin vor dem Termin nervös.', 'I am nervous before the appointment.', 11),
  ('stolz', 'proud', 'stolz auf + Akk', '{adjective}', 'Ich bin stolz auf dich.', 'I am proud of you.', 12),
  ('überrascht', 'surprised', 'über + Akk', '{adjective}', 'Ich war sehr überrascht.', 'I was very surprised.', 13),
  ('freundlich', 'friendly', '', '{adjective}', 'Die Verkäuferin ist sehr freundlich.', 'The shop assistant is very friendly.', 14),
  ('nett', 'nice / kind', '', '{adjective}', 'Mein Nachbar ist nett.', 'My neighbour is kind.', 15),
  ('höflich', 'polite', '', '{adjective}', 'Bitte sei höflich.', 'Please be polite.', 16),
  ('ehrlich', 'honest', '', '{adjective}', 'Er ist immer ehrlich.', 'He is always honest.', 17),
  ('geduldig', 'patient', '', '{adjective}', 'Ein Lehrer muss geduldig sein.', 'A teacher must be patient.', 18),
  ('fleißig', 'hard-working', '', '{adjective}', 'Sie ist eine fleißige Schülerin.', 'She is a hard-working pupil.', 19),
  ('faul', 'lazy', '', '{adjective}', 'Am Wochenende bin ich faul.', 'At the weekend I am lazy.', 20),
  ('selbstbewusst', 'self-confident', '', '{adjective}', 'Sie ist sehr selbstbewusst.', 'She is very self-confident.', 21),
  ('lustig', 'funny', '', '{adjective}', 'Der Film ist sehr lustig.', 'The film is very funny.', 22),
  ('ernst', 'serious', '', '{adjective}', 'Das ist eine ernste Situation.', 'That is a serious situation.', 23),
  ('ruhig', 'calm / quiet', '', '{adjective}', 'Bleib bitte ruhig.', 'Please stay calm.', 24),
  ('schüchtern', 'shy', '', '{adjective}', 'Als Kind war ich schüchtern.', 'As a child I was shy.', 25),
  ('sich freuen', 'to be happy / look forward', 'auf/über + Akk', '{verb}', 'Ich freue mich auf das Wochenende.', 'I am looking forward to the weekend.', 26),
  ('sich ärgern', 'to be annoyed', 'über + Akk', '{verb}', 'Ich ärgere mich über den Lärm.', 'I am annoyed about the noise.', 27),
  ('sich aufregen', 'to get worked up', 'über + Akk', '{verb}', 'Reg dich nicht so auf!', 'Do not get so worked up!', 28),
  ('lachen', 'to laugh', '', '{verb}', 'Wir lachen viel zusammen.', 'We laugh a lot together.', 29),
  ('weinen', 'to cry', '', '{verb}', 'Das Baby weint.', 'The baby is crying.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 3: Work & office
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Work & office', 'Working life and the office', 'A2', true, 3)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('der Arbeitsplatz', 'the workplace', 'pl. die Arbeitsplätze', '{}', 'Mein Arbeitsplatz ist modern.', 'My workplace is modern.', 1),
  ('der Kollege', 'the colleague', 'male; pl. die Kollegen', '{}', 'Mein Kollege hilft mir oft.', 'My colleague often helps me.', 2),
  ('die Kollegin', 'the colleague', 'female; pl. die Kolleginnen', '{}', 'Meine Kollegin ist im Urlaub.', 'My colleague is on holiday.', 3),
  ('der Chef', 'the boss', 'pl. die Chefs', '{}', 'Mein Chef ist sehr fair.', 'My boss is very fair.', 4),
  ('der Termin', 'the appointment', 'pl. die Termine', '{}', 'Ich habe morgen einen Termin.', 'I have an appointment tomorrow.', 5),
  ('die Besprechung', 'the meeting', 'pl. die Besprechungen', '{}', 'Die Besprechung beginnt um zehn.', 'The meeting starts at ten.', 6),
  ('die Sitzung', 'the session / meeting', 'pl. die Sitzungen', '{}', 'Die Sitzung dauert zwei Stunden.', 'The session lasts two hours.', 7),
  ('der Lohn', 'the wage', 'pl. die Löhne', '{}', 'Der Lohn kommt am Monatsende.', 'The wage comes at the end of the month.', 8),
  ('das Gehalt', 'the salary', 'pl. die Gehälter', '{}', 'Das Gehalt ist gut.', 'The salary is good.', 9),
  ('die Stelle', 'the position / job', 'pl. die Stellen', '{}', 'Ich suche eine neue Stelle.', 'I am looking for a new job.', 10),
  ('die Bewerbung', 'the application', 'pl. die Bewerbungen', '{}', 'Ich schreibe eine Bewerbung.', 'I am writing an application.', 11),
  ('der Lebenslauf', 'the CV / resume', 'pl. die Lebensläufe', '{}', 'Schick mir bitte deinen Lebenslauf.', 'Please send me your CV.', 12),
  ('die Pause', 'the break', 'pl. die Pausen', '{}', 'Wir machen eine kurze Pause.', 'We take a short break.', 13),
  ('die Überstunde', 'the overtime hour', 'pl. die Überstunden', '{}', 'Ich mache oft Überstunden.', 'I often work overtime.', 14),
  ('die Aufgabe', 'the task', 'pl. die Aufgaben', '{}', 'Diese Aufgabe ist schwierig.', 'This task is difficult.', 15),
  ('das Projekt', 'the project', 'pl. die Projekte', '{}', 'Das Projekt ist fast fertig.', 'The project is almost finished.', 16),
  ('der Computer', 'the computer', 'pl. die Computer', '{}', 'Mein Computer ist langsam.', 'My computer is slow.', 17),
  ('der Drucker', 'the printer', 'pl. die Drucker', '{}', 'Der Drucker funktioniert nicht.', 'The printer does not work.', 18),
  ('die Unterlagen', 'the documents', 'plural', '{}', 'Bring bitte die Unterlagen mit.', 'Please bring the documents.', 19),
  ('verdienen', 'to earn', '', '{verb}', 'Ich verdiene genug Geld.', 'I earn enough money.', 20),
  ('sich bewerben', 'to apply', 'um + Akk', '{verb}', 'Ich bewerbe mich um die Stelle.', 'I am applying for the position.', 21),
  ('kündigen', 'to quit / give notice', '', '{verb}', 'Sie hat ihren Job gekündigt.', 'She quit her job.', 22),
  ('einstellen', 'to hire', 'separable: stellt ein', '{verb}', 'Die Firma stellt neue Leute ein.', 'The company is hiring new people.', 23),
  ('leiten', 'to lead / manage', '', '{verb}', 'Er leitet die Abteilung.', 'He leads the department.', 24),
  ('der Beruf', 'the profession', 'pl. die Berufe', '{}', 'Was ist Ihr Beruf?', 'What is your profession?', 25),
  ('die Ausbildung', 'the training / apprenticeship', '', '{}', 'Er macht eine Ausbildung.', 'He is doing an apprenticeship.', 26),
  ('die Erfahrung', 'the experience', 'pl. die Erfahrungen', '{}', 'Ich habe viel Erfahrung.', 'I have a lot of experience.', 27),
  ('selbstständig', 'self-employed', '', '{adjective}', 'Sie ist selbstständig.', 'She is self-employed.', 28),
  ('arbeitslos', 'unemployed', '', '{adjective}', 'Er ist seit einem Monat arbeitslos.', 'He has been unemployed for a month.', 29),
  ('die Firma', 'the company', 'pl. die Firmen', '{}', 'Die Firma ist sehr groß.', 'The company is very big.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 4: Health & the doctor
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Health & the doctor', 'Illness, the body and seeing a doctor', 'A2', true, 4)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Gesundheit', 'the health', '', '{}', 'Die Gesundheit ist das Wichtigste.', 'Health is the most important thing.', 1),
  ('die Krankheit', 'the illness', 'pl. die Krankheiten', '{}', 'Eine Erkältung ist eine leichte Krankheit.', 'A cold is a mild illness.', 2),
  ('die Erkältung', 'the cold', 'pl. die Erkältungen', '{}', 'Ich habe eine Erkältung.', 'I have a cold.', 3),
  ('das Fieber', 'the fever', '', '{}', 'Das Kind hat Fieber.', 'The child has a fever.', 4),
  ('die Schmerzen', 'the pain', 'plural', '{}', 'Ich habe Schmerzen im Rücken.', 'I have pain in my back.', 5),
  ('die Kopfschmerzen', 'the headache', 'plural', '{}', 'Ich habe starke Kopfschmerzen.', 'I have a strong headache.', 6),
  ('der Husten', 'the cough', '', '{}', 'Der Husten ist schlimm.', 'The cough is bad.', 7),
  ('der Schnupfen', 'the runny nose', '', '{}', 'Ich habe Schnupfen.', 'I have a runny nose.', 8),
  ('die Grippe', 'the flu', '', '{}', 'Sie liegt mit Grippe im Bett.', 'She is in bed with the flu.', 9),
  ('die Wunde', 'the wound', 'pl. die Wunden', '{}', 'Die Wunde tut weh.', 'The wound hurts.', 10),
  ('der Termin', 'the appointment', 'pl. die Termine', '{}', 'Ich habe einen Termin beim Arzt.', 'I have an appointment at the doctor.', 11),
  ('die Praxis', 'the doctors practice', 'pl. die Praxen', '{}', 'Die Praxis ist heute geschlossen.', 'The practice is closed today.', 12),
  ('das Wartezimmer', 'the waiting room', 'pl. die Wartezimmer', '{}', 'Im Wartezimmer sitzen viele Leute.', 'Many people sit in the waiting room.', 13),
  ('das Rezept', 'the prescription', 'pl. die Rezepte', '{}', 'Der Arzt schreibt ein Rezept.', 'The doctor writes a prescription.', 14),
  ('die Tablette', 'the tablet / pill', 'pl. die Tabletten', '{}', 'Nimm zweimal täglich eine Tablette.', 'Take one tablet twice a day.', 15),
  ('die Apotheke', 'the pharmacy', 'pl. die Apotheken', '{}', 'Die Medikamente gibt es in der Apotheke.', 'You get the medicine at the pharmacy.', 16),
  ('die Versicherung', 'the insurance', 'pl. die Versicherungen', '{}', 'Hast du eine Versicherung?', 'Do you have insurance?', 17),
  ('der Krankenschein', 'the sick note', 'pl. die Krankenscheine', '{}', 'Ich brauche einen Krankenschein.', 'I need a sick note.', 18),
  ('krank', 'ill', '', '{adjective}', 'Ich bin seit gestern krank.', 'I have been ill since yesterday.', 19),
  ('verletzt', 'injured', '', '{adjective}', 'Der Spieler ist verletzt.', 'The player is injured.', 20),
  ('schwanger', 'pregnant', '', '{adjective}', 'Sie ist im vierten Monat schwanger.', 'She is four months pregnant.', 21),
  ('sich verletzen', 'to injure oneself', 'reflexive', '{verb}', 'Ich habe mich am Arm verletzt.', 'I injured my arm.', 22),
  ('sich erkälten', 'to catch a cold', 'reflexive', '{verb}', 'Zieh dich warm an, sonst erkältest du dich.', 'Dress warmly or you will catch a cold.', 23),
  ('wehtun', 'to hurt', '+ Dativ', '{verb,dat}', 'Der Kopf tut mir weh.', 'My head hurts.', 24),
  ('sich fühlen', 'to feel', 'reflexive', '{verb}', 'Ich fühle mich nicht gut.', 'I do not feel well.', 25),
  ('untersuchen', 'to examine', '', '{verb}', 'Der Arzt untersucht den Patienten.', 'The doctor examines the patient.', 26),
  ('sich erholen', 'to recover', 'reflexive', '{verb}', 'Ich erhole mich langsam.', 'I am slowly recovering.', 27),
  ('gesund werden', 'to get well', '', '{verb}', 'Gute Besserung, werde schnell gesund!', 'Get well soon!', 28),
  ('der Notfall', 'the emergency', 'pl. die Notfälle', '{}', 'Im Notfall rufen Sie 112.', 'In an emergency call 112.', 29),
  ('der Patient', 'the patient', 'pl. die Patienten', '{}', 'Der Patient wartet schon.', 'The patient is already waiting.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 5: Food & eating out
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Food & eating out', 'Restaurants, ordering and meals', 'A2', true, 5)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Restaurant', 'the restaurant', 'pl. die Restaurants', '{}', 'Wir gehen heute ins Restaurant.', 'We are going to a restaurant today.', 1),
  ('das Café', 'the cafe', 'pl. die Cafés', '{}', 'Wir treffen uns im Café.', 'We meet at the cafe.', 2),
  ('die Speisekarte', 'the menu', 'pl. die Speisekarten', '{}', 'Die Speisekarte, bitte.', 'The menu, please.', 3),
  ('die Vorspeise', 'the starter', 'pl. die Vorspeisen', '{}', 'Als Vorspeise nehme ich Suppe.', 'As a starter I will have soup.', 4),
  ('das Hauptgericht', 'the main course', 'pl. die Hauptgerichte', '{}', 'Das Hauptgericht ist Fisch.', 'The main course is fish.', 5),
  ('die Nachspeise', 'the dessert', 'pl. die Nachspeisen', '{}', 'Zur Nachspeise gibt es Eis.', 'For dessert there is ice cream.', 6),
  ('die Beilage', 'the side dish', 'pl. die Beilagen', '{}', 'Als Beilage gibt es Reis.', 'As a side dish there is rice.', 7),
  ('die Rechnung', 'the bill', 'pl. die Rechnungen', '{}', 'Die Rechnung, bitte.', 'The bill, please.', 8),
  ('das Trinkgeld', 'the tip', '', '{}', 'Wir geben ein Trinkgeld.', 'We leave a tip.', 9),
  ('der Kellner', 'the waiter', 'pl. die Kellner', '{}', 'Der Kellner bringt das Essen.', 'The waiter brings the food.', 10),
  ('die Bedienung', 'the service / waiter', '', '{}', 'Die Bedienung ist freundlich.', 'The service is friendly.', 11),
  ('der Tisch', 'the table', 'pl. die Tische', '{}', 'Wir haben einen Tisch reserviert.', 'We have reserved a table.', 12),
  ('reservieren', 'to reserve / book', '', '{verb}', 'Ich möchte einen Tisch reservieren.', 'I would like to reserve a table.', 13),
  ('bestellen', 'to order', '', '{verb}', 'Was möchten Sie bestellen?', 'What would you like to order?', 14),
  ('empfehlen', 'to recommend', 'empfiehlt, empfahl, empfohlen', '{verb}', 'Was können Sie empfehlen?', 'What can you recommend?', 15),
  ('schmecken', 'to taste (good)', '+ Dativ', '{verb,dat}', 'Das Essen schmeckt mir sehr.', 'I really like the food.', 16),
  ('bezahlen', 'to pay', '', '{verb}', 'Wir möchten getrennt bezahlen.', 'We would like to pay separately.', 17),
  ('satt', 'full (not hungry)', '', '{adjective}', 'Ich bin satt, danke.', 'I am full, thank you.', 18),
  ('der Durst', 'thirst', '', '{}', 'Ich habe großen Durst.', 'I am very thirsty.', 19),
  ('das Getränk', 'the drink', 'pl. die Getränke', '{}', 'Welche Getränke haben Sie?', 'Which drinks do you have?', 20),
  ('die Vorspeise bestellen', 'to order a starter', '', '{verb}', 'Wir bestellen zuerst die Vorspeise.', 'We order the starter first.', 21),
  ('das Frühstück', 'breakfast', '', '{}', 'Das Frühstück ist im Preis inklusive.', 'Breakfast is included in the price.', 22),
  ('lecker', 'tasty', '', '{adjective}', 'Das Steak ist sehr lecker.', 'The steak is very tasty.', 23),
  ('scharf', 'spicy / hot', '', '{adjective}', 'Das Curry ist sehr scharf.', 'The curry is very spicy.', 24),
  ('salzig', 'salty', '', '{adjective}', 'Die Suppe ist zu salzig.', 'The soup is too salty.', 25),
  ('vegetarisch', 'vegetarian', '', '{adjective}', 'Ich esse vegetarisch.', 'I eat vegetarian food.', 26),
  ('die Portion', 'the portion', 'pl. die Portionen', '{}', 'Die Portion ist groß.', 'The portion is big.', 27),
  ('die Rechnung teilen', 'to split the bill', '', '{verb}', 'Wollen wir die Rechnung teilen?', 'Shall we split the bill?', 28),
  ('bestellen gehen', 'to go and order', '', '{verb}', 'Lass uns etwas zu trinken bestellen.', 'Let us order something to drink.', 29),
  ('die Speise', 'the dish / food', 'pl. die Speisen', '{}', 'Die Speisen sind frisch.', 'The dishes are fresh.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 6: Travel & holidays
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Travel & holidays', 'Trips, hotels and holidays', 'A2', true, 6)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('der Urlaub', 'the holiday / vacation', '', '{}', 'Im Sommer mache ich Urlaub.', 'In summer I go on holiday.', 1),
  ('die Reise', 'the trip / journey', 'pl. die Reisen', '{}', 'Die Reise war anstrengend.', 'The trip was exhausting.', 2),
  ('die Unterkunft', 'the accommodation', 'pl. die Unterkünfte', '{}', 'Wir suchen eine günstige Unterkunft.', 'We are looking for cheap accommodation.', 3),
  ('die Buchung', 'the booking', 'pl. die Buchungen', '{}', 'Die Buchung ist bestätigt.', 'The booking is confirmed.', 4),
  ('das Doppelzimmer', 'the double room', 'pl. die Doppelzimmer', '{}', 'Wir nehmen ein Doppelzimmer.', 'We will take a double room.', 5),
  ('das Einzelzimmer', 'the single room', 'pl. die Einzelzimmer', '{}', 'Ich brauche ein Einzelzimmer.', 'I need a single room.', 6),
  ('die Rezeption', 'the reception', '', '{}', 'Die Schlüssel sind an der Rezeption.', 'The keys are at the reception.', 7),
  ('einchecken', 'to check in', 'separable', '{verb}', 'Wir checken um drei ein.', 'We check in at three.', 8),
  ('auschecken', 'to check out', 'separable', '{verb}', 'Wir müssen bis zehn auschecken.', 'We have to check out by ten.', 9),
  ('die Sehenswürdigkeit', 'the sight / attraction', 'pl. die Sehenswürdigkeiten', '{}', 'Berlin hat viele Sehenswürdigkeiten.', 'Berlin has many sights.', 10),
  ('der Strand', 'the beach', 'pl. die Strände', '{}', 'Wir liegen am Strand.', 'We are lying on the beach.', 11),
  ('das Gebirge', 'the mountains', '', '{}', 'Im Winter fahren wir ins Gebirge.', 'In winter we go to the mountains.', 12),
  ('die Grenze', 'the border', 'pl. die Grenzen', '{}', 'Wir fahren über die Grenze.', 'We cross the border.', 13),
  ('das Gepäck', 'the luggage', '', '{}', 'Mein Gepäck ist schwer.', 'My luggage is heavy.', 14),
  ('der Koffer', 'the suitcase', 'pl. die Koffer', '{}', 'Der Koffer ist zu voll.', 'The suitcase is too full.', 15),
  ('der Reisepass', 'the passport', 'pl. die Reisepässe', '{}', 'Zeig mir bitte deinen Reisepass.', 'Please show me your passport.', 16),
  ('die Reservierung', 'the reservation', 'pl. die Reservierungen', '{}', 'Ich habe eine Reservierung.', 'I have a reservation.', 17),
  ('verreisen', 'to go on a trip', 'separable: verreist', '{verb}', 'Wir verreisen nächste Woche.', 'We are going away next week.', 18),
  ('packen', 'to pack', '', '{verb}', 'Ich packe meinen Koffer.', 'I am packing my suitcase.', 19),
  ('umsteigen', 'to change (trains)', 'separable: steigt um', '{verb}', 'In Köln müssen wir umsteigen.', 'In Cologne we have to change.', 20),
  ('die Verspätung', 'the delay', 'pl. die Verspätungen', '{}', 'Der Zug hat zehn Minuten Verspätung.', 'The train is ten minutes late.', 21),
  ('der Ausflug', 'the excursion / day trip', 'pl. die Ausflüge', '{}', 'Wir machen einen Ausflug.', 'We are going on a day trip.', 22),
  ('im Ausland', 'abroad', '', '{}', 'Ich arbeite im Ausland.', 'I work abroad.', 23),
  ('die Karte', 'the map', 'pl. die Karten', '{}', 'Ich schaue auf die Karte.', 'I look at the map.', 24),
  ('das Andenken', 'the souvenir', 'pl. die Andenken', '{}', 'Ich kaufe ein Andenken.', 'I am buying a souvenir.', 25),
  ('die Postkarte', 'the postcard', 'pl. die Postkarten', '{}', 'Ich schreibe eine Postkarte.', 'I am writing a postcard.', 26),
  ('die Sonnencreme', 'the sunscreen', '', '{}', 'Vergiss die Sonnencreme nicht!', 'Do not forget the sunscreen!', 27),
  ('der Aufenthalt', 'the stay', 'pl. die Aufenthalte', '{}', 'Der Aufenthalt war wunderbar.', 'The stay was wonderful.', 28),
  ('abenteuerlich', 'adventurous', '', '{adjective}', 'Die Reise war abenteuerlich.', 'The trip was adventurous.', 29),
  ('die Hin- und Rückfahrt', 'the round trip', '', '{}', 'Die Hin- und Rückfahrt kostet fünfzig Euro.', 'The round trip costs fifty euros.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 7: Shopping & services
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Shopping & services', 'Shops, money and services', 'A2', true, 7)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Sonderangebot', 'the special offer', 'pl. die Sonderangebote', '{}', 'Heute gibt es ein Sonderangebot.', 'Today there is a special offer.', 1),
  ('der Rabatt', 'the discount', 'pl. die Rabatte', '{}', 'Es gibt zehn Prozent Rabatt.', 'There is a ten percent discount.', 2),
  ('die Quittung', 'the receipt', 'pl. die Quittungen', '{}', 'Kann ich die Quittung haben?', 'Can I have the receipt?', 3),
  ('das Kleingeld', 'the change / coins', '', '{}', 'Ich habe kein Kleingeld.', 'I have no change.', 4),
  ('umtauschen', 'to exchange', 'separable: tauscht um', '{verb}', 'Ich möchte die Hose umtauschen.', 'I would like to exchange the trousers.', 5),
  ('zurückgeben', 'to return / give back', 'separable: gibt zurück', '{verb}', 'Kann ich das Buch zurückgeben?', 'Can I return the book?', 6),
  ('die Größe', 'the size', 'pl. die Größen', '{}', 'Welche Größe brauchen Sie?', 'What size do you need?', 7),
  ('anprobieren', 'to try on', 'separable: probiert an', '{verb}', 'Darf ich die Jacke anprobieren?', 'May I try on the jacket?', 8),
  ('die Umkleidekabine', 'the fitting room', 'pl. die Umkleidekabinen', '{}', 'Die Umkleidekabine ist hinten.', 'The fitting room is at the back.', 9),
  ('der Kunde', 'the customer', 'pl. die Kunden', '{}', 'Der Kunde hat eine Frage.', 'The customer has a question.', 10),
  ('die Bäckerei', 'the bakery', 'pl. die Bäckereien', '{}', 'Ich kaufe Brot in der Bäckerei.', 'I buy bread at the bakery.', 11),
  ('die Metzgerei', 'the butchers', 'pl. die Metzgereien', '{}', 'Das Fleisch ist aus der Metzgerei.', 'The meat is from the butchers.', 12),
  ('die Drogerie', 'the drugstore', 'pl. die Drogerien', '{}', 'Seife gibt es in der Drogerie.', 'You get soap at the drugstore.', 13),
  ('der Supermarkt', 'the supermarket', 'pl. die Supermärkte', '{}', 'Der Supermarkt ist bis acht offen.', 'The supermarket is open until eight.', 14),
  ('die Post', 'the post office', '', '{}', 'Ich bringe das Paket zur Post.', 'I take the parcel to the post office.', 15),
  ('das Paket', 'the parcel', 'pl. die Pakete', '{}', 'Ein Paket ist für dich gekommen.', 'A parcel has arrived for you.', 16),
  ('die Briefmarke', 'the stamp', 'pl. die Briefmarken', '{}', 'Ich brauche eine Briefmarke.', 'I need a stamp.', 17),
  ('die Bank', 'the bank', 'pl. die Banken', '{}', 'Ich gehe zur Bank.', 'I am going to the bank.', 18),
  ('das Konto', 'the account', 'pl. die Konten', '{}', 'Ich habe ein Konto bei der Bank.', 'I have an account at the bank.', 19),
  ('überweisen', 'to transfer (money)', 'überweist, überwies, überwiesen', '{verb}', 'Ich überweise die Miete.', 'I transfer the rent.', 20),
  ('abheben', 'to withdraw (money)', 'separable: hebt ab', '{verb}', 'Ich hebe Geld ab.', 'I withdraw money.', 21),
  ('bar bezahlen', 'to pay in cash', '', '{verb}', 'Ich bezahle lieber bar.', 'I prefer to pay in cash.', 22),
  ('die Kasse', 'the till / checkout', 'pl. die Kassen', '{}', 'Bitte an der Kasse bezahlen.', 'Please pay at the checkout.', 23),
  ('die EC-Karte', 'the debit card', 'pl. die EC-Karten', '{}', 'Kann ich mit EC-Karte zahlen?', 'Can I pay by debit card?', 24),
  ('ausverkauft', 'sold out', '', '{adjective}', 'Das Produkt ist ausverkauft.', 'The product is sold out.', 25),
  ('preiswert', 'good value', '', '{adjective}', 'Das Angebot ist preiswert.', 'The offer is good value.', 26),
  ('die Lieferung', 'the delivery', 'pl. die Lieferungen', '{}', 'Die Lieferung kommt morgen.', 'The delivery arrives tomorrow.', 27),
  ('bestellen', 'to order', '', '{verb}', 'Ich bestelle die Schuhe online.', 'I order the shoes online.', 28),
  ('die Reparatur', 'the repair', 'pl. die Reparaturen', '{}', 'Die Reparatur kostet viel.', 'The repair costs a lot.', 29),
  ('reklamieren', 'to make a complaint', '', '{verb}', 'Ich möchte das Gerät reklamieren.', 'I would like to complain about the device.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 8: Home & living
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Home & living', 'Living, furniture and the household', 'A2', true, 8)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('der Vermieter', 'the landlord', 'pl. die Vermieter', '{}', 'Der Vermieter wohnt nebenan.', 'The landlord lives next door.', 1),
  ('der Mieter', 'the tenant', 'pl. die Mieter', '{}', 'Die Mieter sind sehr ruhig.', 'The tenants are very quiet.', 2),
  ('die Miete', 'the rent', 'pl. die Mieten', '{}', 'Die Miete steigt jedes Jahr.', 'The rent rises every year.', 3),
  ('die Nebenkosten', 'the utility costs', 'plural', '{}', 'Die Nebenkosten sind hoch.', 'The utility costs are high.', 4),
  ('der Umzug', 'the move (house)', 'pl. die Umzüge', '{}', 'Der Umzug ist nächste Woche.', 'The move is next week.', 5),
  ('umziehen', 'to move house', 'separable: zieht um', '{verb}', 'Wir ziehen nach München um.', 'We are moving to Munich.', 6),
  ('die Heizung', 'the heating', 'pl. die Heizungen', '{}', 'Die Heizung funktioniert nicht.', 'The heating does not work.', 7),
  ('der Herd', 'the stove / cooker', 'pl. die Herde', '{}', 'Der Herd ist heiß.', 'The stove is hot.', 8),
  ('der Backofen', 'the oven', 'pl. die Backöfen', '{}', 'Der Kuchen ist im Backofen.', 'The cake is in the oven.', 9),
  ('die Spülmaschine', 'the dishwasher', 'pl. die Spülmaschinen', '{}', 'Die Spülmaschine ist voll.', 'The dishwasher is full.', 10),
  ('die Waschmaschine', 'the washing machine', 'pl. die Waschmaschinen', '{}', 'Die Waschmaschine läuft.', 'The washing machine is running.', 11),
  ('das Regal', 'the shelf', 'pl. die Regale', '{}', 'Die Bücher stehen im Regal.', 'The books are on the shelf.', 12),
  ('der Teppich', 'the carpet / rug', 'pl. die Teppiche', '{}', 'Der Teppich ist weich.', 'The carpet is soft.', 13),
  ('der Spiegel', 'the mirror', 'pl. die Spiegel', '{}', 'Der Spiegel hängt im Bad.', 'The mirror hangs in the bathroom.', 14),
  ('der Balkon', 'the balcony', 'pl. die Balkone', '{}', 'Wir frühstücken auf dem Balkon.', 'We have breakfast on the balcony.', 15),
  ('der Keller', 'the cellar / basement', 'pl. die Keller', '{}', 'Die Fahrräder sind im Keller.', 'The bikes are in the cellar.', 16),
  ('der Aufzug', 'the lift / elevator', 'pl. die Aufzüge', '{}', 'Der Aufzug ist kaputt.', 'The lift is broken.', 17),
  ('das Werkzeug', 'the tool', 'pl. die Werkzeuge', '{}', 'Ich brauche Werkzeug für die Reparatur.', 'I need tools for the repair.', 18),
  ('reparieren', 'to repair', '', '{verb}', 'Kannst du die Lampe reparieren?', 'Can you repair the lamp?', 19),
  ('einrichten', 'to furnish / set up', 'separable: richtet ein', '{verb}', 'Wir richten die Wohnung ein.', 'We are furnishing the flat.', 20),
  ('mieten', 'to rent', '', '{verb}', 'Wir mieten eine größere Wohnung.', 'We are renting a bigger flat.', 21),
  ('vermieten', 'to let / rent out', '', '{verb}', 'Sie vermietet ein Zimmer.', 'She rents out a room.', 22),
  ('gemütlich', 'cosy', '', '{adjective}', 'Das Wohnzimmer ist gemütlich.', 'The living room is cosy.', 23),
  ('hell', 'bright', '', '{adjective}', 'Die Küche ist sehr hell.', 'The kitchen is very bright.', 24),
  ('dunkel', 'dark', '', '{adjective}', 'Das Schlafzimmer ist dunkel.', 'The bedroom is dark.', 25),
  ('möbliert', 'furnished', '', '{adjective}', 'Die Wohnung ist möbliert.', 'The flat is furnished.', 26),
  ('die Aussicht', 'the view', 'pl. die Aussichten', '{}', 'Die Wohnung hat eine schöne Aussicht.', 'The flat has a nice view.', 27),
  ('der Nachbar', 'the neighbour', 'pl. die Nachbarn', '{}', 'Mein Nachbar ist hilfsbereit.', 'My neighbour is helpful.', 28),
  ('die Möbel', 'the furniture', 'plural', '{}', 'Die Möbel sind neu.', 'The furniture is new.', 29),
  ('das Erdgeschoss', 'the ground floor', '', '{}', 'Wir wohnen im Erdgeschoss.', 'We live on the ground floor.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 9: Free time & media
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Free time & media', 'Hobbies, media and going out', 'A2', true, 9)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Veranstaltung', 'the event', 'pl. die Veranstaltungen', '{}', 'Die Veranstaltung beginnt um acht.', 'The event starts at eight.', 1),
  ('das Konzert', 'the concert', 'pl. die Konzerte', '{}', 'Wir gehen heute ins Konzert.', 'We are going to a concert today.', 2),
  ('das Theater', 'the theatre', 'pl. die Theater', '{}', 'Im Theater läuft ein neues Stück.', 'A new play is on at the theatre.', 3),
  ('die Ausstellung', 'the exhibition', 'pl. die Ausstellungen', '{}', 'Die Ausstellung ist sehr interessant.', 'The exhibition is very interesting.', 4),
  ('das Museum', 'the museum', 'pl. die Museen', '{}', 'Am Sonntag besuchen wir ein Museum.', 'On Sunday we visit a museum.', 5),
  ('das Kino', 'the cinema', 'pl. die Kinos', '{}', 'Wir gehen ins Kino.', 'We are going to the cinema.', 6),
  ('die Nachrichten', 'the news', 'plural', '{}', 'Ich sehe abends die Nachrichten.', 'I watch the news in the evening.', 7),
  ('die Zeitung', 'the newspaper', 'pl. die Zeitungen', '{}', 'Ich lese jeden Morgen die Zeitung.', 'I read the newspaper every morning.', 8),
  ('die Zeitschrift', 'the magazine', 'pl. die Zeitschriften', '{}', 'Die Zeitschrift erscheint monatlich.', 'The magazine comes out monthly.', 9),
  ('die Sendung', 'the (TV) programme', 'pl. die Sendungen', '{}', 'Diese Sendung mag ich sehr.', 'I really like this programme.', 10),
  ('die Werbung', 'the advertising / advert', '', '{}', 'Die Werbung nervt mich.', 'The adverts annoy me.', 11),
  ('das Handy', 'the mobile phone', 'pl. die Handys', '{}', 'Mein Handy ist fast leer.', 'My phone is almost out of battery.', 12),
  ('die Nachricht', 'the message', 'pl. die Nachrichten', '{}', 'Ich schreibe dir eine Nachricht.', 'I will write you a message.', 13),
  ('herunterladen', 'to download', 'separable: lädt herunter', '{verb}', 'Ich lade die App herunter.', 'I am downloading the app.', 14),
  ('die Mannschaft', 'the team', 'pl. die Mannschaften', '{}', 'Unsere Mannschaft hat gewonnen.', 'Our team has won.', 15),
  ('gewinnen', 'to win', 'gewinnt, gewann, gewonnen', '{verb}', 'Wer hat das Spiel gewonnen?', 'Who won the game?', 16),
  ('verlieren', 'to lose', 'verliert, verlor, verloren', '{verb}', 'Wir haben leider verloren.', 'Unfortunately we lost.', 17),
  ('sich interessieren', 'to be interested', 'für + Akk', '{verb}', 'Ich interessiere mich für Musik.', 'I am interested in music.', 18),
  ('sich treffen', 'to meet', 'trifft, traf, getroffen', '{verb}', 'Wir treffen uns am Samstag.', 'We are meeting on Saturday.', 19),
  ('sich verabreden', 'to arrange to meet', 'reflexive', '{verb}', 'Wir haben uns für heute verabredet.', 'We arranged to meet today.', 20),
  ('das Hobby', 'the hobby', 'pl. die Hobbys', '{}', 'Fotografieren ist mein Hobby.', 'Photography is my hobby.', 21),
  ('die Freizeit', 'the free time', '', '{}', 'In meiner Freizeit lese ich.', 'In my free time I read.', 22),
  ('spannend', 'exciting / thrilling', '', '{adjective}', 'Der Krimi ist sehr spannend.', 'The thriller is very exciting.', 23),
  ('langweilig', 'boring', '', '{adjective}', 'Der Film war langweilig.', 'The film was boring.', 24),
  ('berühmt', 'famous', '', '{adjective}', 'Der Sänger ist sehr berühmt.', 'The singer is very famous.', 25),
  ('die Eintrittskarte', 'the entrance ticket', 'pl. die Eintrittskarten', '{}', 'Die Eintrittskarte kostet zehn Euro.', 'The entrance ticket costs ten euros.', 26),
  ('das Publikum', 'the audience', '', '{}', 'Das Publikum klatscht.', 'The audience is clapping.', 27),
  ('auftreten', 'to perform / appear', 'separable: tritt auf', '{verb}', 'Die Band tritt heute auf.', 'The band performs today.', 28),
  ('die Folge', 'the episode', 'pl. die Folgen', '{}', 'Ich habe die letzte Folge verpasst.', 'I missed the last episode.', 29),
  ('unterhaltsam', 'entertaining', '', '{adjective}', 'Der Abend war sehr unterhaltsam.', 'The evening was very entertaining.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 10: The past (Perfekt)
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · The past (Perfekt)', 'Common verbs in the perfect tense', 'A2', true, 10)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('gemacht', 'done / made', 'machen → hat gemacht', '{verb}', 'Was hast du gestern gemacht?', 'What did you do yesterday?', 1),
  ('gegangen', 'gone / walked', 'gehen → ist gegangen', '{verb}', 'Ich bin nach Hause gegangen.', 'I went home.', 2),
  ('gefahren', 'driven / gone', 'fahren → ist gefahren', '{verb}', 'Wir sind nach Berlin gefahren.', 'We drove to Berlin.', 3),
  ('geflogen', 'flown', 'fliegen → ist geflogen', '{verb}', 'Sie ist nach Rom geflogen.', 'She flew to Rome.', 4),
  ('gegessen', 'eaten', 'essen → hat gegessen', '{verb}', 'Ich habe schon gegessen.', 'I have already eaten.', 5),
  ('getrunken', 'drunk', 'trinken → hat getrunken', '{verb}', 'Sie hat einen Kaffee getrunken.', 'She drank a coffee.', 6),
  ('gesehen', 'seen', 'sehen → hat gesehen', '{verb}', 'Ich habe den Film gesehen.', 'I have seen the film.', 7),
  ('gelesen', 'read', 'lesen → hat gelesen', '{verb}', 'Er hat das Buch gelesen.', 'He read the book.', 8),
  ('geschrieben', 'written', 'schreiben → hat geschrieben', '{verb}', 'Ich habe eine E-Mail geschrieben.', 'I wrote an email.', 9),
  ('gesprochen', 'spoken', 'sprechen → hat gesprochen', '{verb}', 'Wir haben über die Arbeit gesprochen.', 'We talked about work.', 10),
  ('gekommen', 'come', 'kommen → ist gekommen', '{verb}', 'Sie ist zu spät gekommen.', 'She came too late.', 11),
  ('geblieben', 'stayed', 'bleiben → ist geblieben', '{verb}', 'Ich bin zu Hause geblieben.', 'I stayed at home.', 12),
  ('geschlafen', 'slept', 'schlafen → hat geschlafen', '{verb}', 'Ich habe gut geschlafen.', 'I slept well.', 13),
  ('gearbeitet', 'worked', 'arbeiten → hat gearbeitet', '{verb}', 'Er hat den ganzen Tag gearbeitet.', 'He worked all day.', 14),
  ('gekauft', 'bought', 'kaufen → hat gekauft', '{verb}', 'Ich habe neue Schuhe gekauft.', 'I bought new shoes.', 15),
  ('gespielt', 'played', 'spielen → hat gespielt', '{verb}', 'Die Kinder haben Fußball gespielt.', 'The children played football.', 16),
  ('gelernt', 'learned', 'lernen → hat gelernt', '{verb}', 'Ich habe viel gelernt.', 'I learned a lot.', 17),
  ('gewohnt', 'lived / resided', 'wohnen → hat gewohnt', '{verb}', 'Wir haben in Köln gewohnt.', 'We lived in Cologne.', 18),
  ('aufgestanden', 'got up', 'aufstehen → ist aufgestanden', '{verb}', 'Ich bin früh aufgestanden.', 'I got up early.', 19),
  ('angekommen', 'arrived', 'ankommen → ist angekommen', '{verb}', 'Der Zug ist pünktlich angekommen.', 'The train arrived on time.', 20),
  ('eingekauft', 'shopped', 'einkaufen → hat eingekauft', '{verb}', 'Ich habe im Supermarkt eingekauft.', 'I shopped at the supermarket.', 21),
  ('ferngesehen', 'watched TV', 'fernsehen → hat ferngesehen', '{verb}', 'Am Abend haben wir ferngesehen.', 'In the evening we watched TV.', 22),
  ('vergessen', 'forgotten', 'vergessen → hat vergessen', '{verb}', 'Ich habe den Schlüssel vergessen.', 'I forgot the key.', 23),
  ('verloren', 'lost', 'verlieren → hat verloren', '{verb}', 'Ich habe mein Handy verloren.', 'I lost my phone.', 24),
  ('gefunden', 'found', 'finden → hat gefunden', '{verb}', 'Ich habe den Schlüssel gefunden.', 'I found the key.', 25),
  ('gegeben', 'given', 'geben → hat gegeben', '{verb}', 'Er hat mir das Buch gegeben.', 'He gave me the book.', 26),
  ('genommen', 'taken', 'nehmen → hat genommen', '{verb}', 'Ich habe den Bus genommen.', 'I took the bus.', 27),
  ('gewesen', 'been', 'sein → ist gewesen', '{verb}', 'Ich bin in Italien gewesen.', 'I have been to Italy.', 28),
  ('gehabt', 'had', 'haben → hat gehabt', '{verb}', 'Wir haben viel Spaß gehabt.', 'We had a lot of fun.', 29),
  ('geworden', 'become', 'werden → ist geworden', '{verb}', 'Es ist kalt geworden.', 'It has become cold.', 30),
  ('gestern', 'yesterday', 'time word for the past', '{}', 'Gestern war ich im Kino.', 'Yesterday I was at the cinema.', 31),
  ('letzte Woche', 'last week', '', '{}', 'Letzte Woche war ich krank.', 'Last week I was ill.', 32)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 11: More verbs
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · More verbs', 'Useful verbs for A2', 'A2', true, 11)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('bringen', 'to bring', 'bringt, brachte, gebracht', '{verb}', 'Kannst du mir das Buch bringen?', 'Can you bring me the book?', 1),
  ('holen', 'to fetch / get', '', '{verb}', 'Ich hole schnell Brot.', 'I will quickly get some bread.', 2),
  ('zeigen', 'to show', '+ Dativ', '{verb,dat}', 'Zeig mir bitte den Weg.', 'Please show me the way.', 3),
  ('erklären', 'to explain', '+ Dativ', '{verb,dat}', 'Der Lehrer erklärt uns die Regel.', 'The teacher explains the rule to us.', 4),
  ('erzählen', 'to tell', '+ Dativ', '{verb,dat}', 'Erzähl mir von deinem Tag.', 'Tell me about your day.', 5),
  ('gehören', 'to belong', '+ Dativ', '{verb,dat}', 'Das Buch gehört mir.', 'The book belongs to me.', 6),
  ('gefallen', 'to please / to like', '+ Dativ; gefällt', '{verb,dat}', 'Die Stadt gefällt mir.', 'I like the city.', 7),
  ('danken', 'to thank', '+ Dativ', '{verb,dat}', 'Ich danke dir für die Hilfe.', 'I thank you for the help.', 8),
  ('antworten', 'to answer', '+ Dativ', '{verb,dat}', 'Bitte antworte mir bald.', 'Please answer me soon.', 9),
  ('passieren', 'to happen', 'ist passiert', '{verb}', 'Was ist passiert?', 'What happened?', 10),
  ('vergessen', 'to forget', 'vergisst, vergaß, vergessen', '{verb}', 'Vergiss deinen Schlüssel nicht!', 'Do not forget your key!', 11),
  ('versuchen', 'to try', '', '{verb}', 'Ich versuche es noch einmal.', 'I will try again.', 12),
  ('benutzen', 'to use', '', '{verb}', 'Darf ich dein Telefon benutzen?', 'May I use your phone?', 13),
  ('wiederholen', 'to repeat', '', '{verb}', 'Können Sie das wiederholen?', 'Can you repeat that?', 14),
  ('entscheiden', 'to decide', 'entscheidet, entschied, entschieden', '{verb}', 'Du musst dich entscheiden.', 'You have to decide.', 15),
  ('warten', 'to wait', 'auf + Akk', '{verb}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 16),
  ('einladen', 'to invite', 'separable: lädt ein', '{verb}', 'Ich lade dich zum Essen ein.', 'I am inviting you for a meal.', 17),
  ('mitbringen', 'to bring along', 'separable: bringt mit', '{verb}', 'Bring bitte einen Kuchen mit.', 'Please bring a cake along.', 18),
  ('ausmachen', 'to turn off', 'separable: macht aus', '{verb}', 'Mach das Licht aus!', 'Turn off the light!', 19),
  ('anmachen', 'to turn on', 'separable: macht an', '{verb}', 'Mach bitte das Radio an.', 'Please turn on the radio.', 20),
  ('anrufen', 'to call (phone)', 'separable: ruft an', '{verb}', 'Ich rufe dich später an.', 'I will call you later.', 21),
  ('aufhören', 'to stop', 'separable; mit + Dativ', '{verb}', 'Hör auf zu reden!', 'Stop talking!', 22),
  ('anfangen', 'to begin', 'separable: fängt an', '{verb}', 'Der Film fängt gleich an.', 'The film begins soon.', 23),
  ('sich erinnern', 'to remember', 'an + Akk', '{verb}', 'Ich erinnere mich an den Tag.', 'I remember the day.', 24),
  ('sich vorstellen', 'to introduce / imagine', 'reflexive, separable', '{verb}', 'Darf ich mich vorstellen?', 'May I introduce myself?', 25),
  ('verlieren', 'to lose', 'verliert, verlor, verloren', '{verb}', 'Ich habe meinen Schirm verloren.', 'I lost my umbrella.', 26),
  ('wachsen', 'to grow', 'wächst, wuchs, ist gewachsen', '{verb}', 'Die Kinder wachsen schnell.', 'The children grow fast.', 27),
  ('sich kümmern', 'to take care', 'um + Akk', '{verb}', 'Ich kümmere mich um den Garten.', 'I take care of the garden.', 28),
  ('verbringen', 'to spend (time)', 'verbringt, verbrachte, verbracht', '{verb}', 'Wir verbringen den Sommer am Meer.', 'We spend the summer at the sea.', 29),
  ('verändern', 'to change', '', '{verb}', 'Das Internet hat die Welt verändert.', 'The internet has changed the world.', 30),
  ('schaffen', 'to manage / accomplish', '', '{verb}', 'Wir schaffen das zusammen.', 'We will manage it together.', 31),
  ('sich beeilen', 'to hurry', 'reflexive', '{verb}', 'Wir müssen uns beeilen.', 'We have to hurry.', 32)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 12: Connectors & adverbs
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Connectors & adverbs', 'Linking words and useful adverbs', 'A2', true, 12)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('weil', 'because', 'verb to the end', '{}', 'Ich bleibe zu Hause, weil ich krank bin.', 'I am staying home because I am ill.', 1),
  ('dass', 'that', 'verb to the end', '{}', 'Ich glaube, dass es regnet.', 'I think that it is raining.', 2),
  ('wenn', 'if / when', '', '{}', 'Wenn es regnet, bleibe ich zu Hause.', 'If it rains, I stay home.', 3),
  ('als', 'when (past, once)', '', '{}', 'Als ich klein war, wohnten wir in Bonn.', 'When I was little, we lived in Bonn.', 4),
  ('deshalb', 'therefore / that is why', '', '{}', 'Es regnet, deshalb bleibe ich hier.', 'It is raining, that is why I stay here.', 5),
  ('trotzdem', 'nevertheless', '', '{}', 'Es regnet. Trotzdem gehe ich spazieren.', 'It is raining. Nevertheless I go for a walk.', 6),
  ('deswegen', 'because of that', '', '{}', 'Ich war müde, deswegen bin ich früh ins Bett.', 'I was tired, so I went to bed early.', 7),
  ('obwohl', 'although', '', '{}', 'Obwohl es spät war, blieb ich wach.', 'Although it was late, I stayed awake.', 8),
  ('sondern', 'but (rather)', 'after a negation', '{}', 'Nicht heute, sondern morgen.', 'Not today, but tomorrow.', 9),
  ('denn', 'because / for', '', '{}', 'Ich gehe schlafen, denn ich bin müde.', 'I am going to sleep, because I am tired.', 10),
  ('also', 'so / therefore', '', '{}', 'Es ist spät, also gehe ich.', 'It is late, so I am leaving.', 11),
  ('zuerst', 'first', '', '{}', 'Zuerst essen wir, dann gehen wir.', 'First we eat, then we go.', 12),
  ('dann', 'then', '', '{}', 'Erst die Arbeit, dann das Vergnügen.', 'Work first, then pleasure.', 13),
  ('später', 'later', '', '{}', 'Ich rufe dich später an.', 'I will call you later.', 14),
  ('endlich', 'finally / at last', '', '{}', 'Endlich ist Wochenende!', 'Finally it is the weekend!', 15),
  ('plötzlich', 'suddenly', '', '{}', 'Plötzlich klingelte das Telefon.', 'Suddenly the phone rang.', 16),
  ('vielleicht', 'maybe', '', '{}', 'Vielleicht komme ich mit.', 'Maybe I will come along.', 17),
  ('wahrscheinlich', 'probably', '', '{}', 'Wahrscheinlich regnet es morgen.', 'It will probably rain tomorrow.', 18),
  ('sicher', 'surely / certainly', '', '{}', 'Das ist sicher richtig.', 'That is certainly correct.', 19),
  ('natürlich', 'of course', '', '{}', 'Natürlich helfe ich dir.', 'Of course I will help you.', 20),
  ('genug', 'enough', '', '{}', 'Wir haben genug Zeit.', 'We have enough time.', 21),
  ('fast', 'almost', '', '{}', 'Ich bin fast fertig.', 'I am almost done.', 22),
  ('ungefähr', 'about / approximately', '', '{}', 'Es dauert ungefähr eine Stunde.', 'It takes about an hour.', 23),
  ('besonders', 'especially', '', '{}', 'Heute ist es besonders kalt.', 'Today it is especially cold.', 24),
  ('zum Beispiel', 'for example', 'abbr. z. B.', '{}', 'Obst, zum Beispiel Äpfel, ist gesund.', 'Fruit, for example apples, is healthy.', 25),
  ('eigentlich', 'actually', '', '{}', 'Eigentlich wollte ich gehen.', 'Actually I wanted to leave.', 26),
  ('sofort', 'immediately', '', '{}', 'Komm bitte sofort!', 'Please come immediately!', 27),
  ('nochmal', 'again', '', '{}', 'Sag das bitte nochmal.', 'Please say that again.', 28),
  ('überhaupt', 'at all', '', '{}', 'Das ist überhaupt kein Problem.', 'That is no problem at all.', 29),
  ('zum Glück', 'luckily', '', '{}', 'Zum Glück hat es nicht geregnet.', 'Luckily it did not rain.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 13: Nature & environment
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Nature & environment', 'Weather, nature and the environment', 'A2', true, 13)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Umwelt', 'the environment', '', '{}', 'Wir müssen die Umwelt schützen.', 'We must protect the environment.', 1),
  ('die Natur', 'nature', '', '{}', 'Am Wochenende bin ich gern in der Natur.', 'At the weekend I like being in nature.', 2),
  ('der Müll', 'the rubbish / trash', '', '{}', 'Bitte trenne den Müll.', 'Please separate the rubbish.', 3),
  ('die Luft', 'the air', '', '{}', 'Die Luft in der Stadt ist schlecht.', 'The air in the city is bad.', 4),
  ('das Klima', 'the climate', '', '{}', 'Das Klima ändert sich.', 'The climate is changing.', 5),
  ('das Gewitter', 'the thunderstorm', 'pl. die Gewitter', '{}', 'Heute Abend gibt es ein Gewitter.', 'There is a thunderstorm tonight.', 6),
  ('der Nebel', 'the fog', '', '{}', 'Am Morgen war dichter Nebel.', 'In the morning there was thick fog.', 7),
  ('der Sturm', 'the storm', 'pl. die Stürme', '{}', 'Der Sturm war sehr stark.', 'The storm was very strong.', 8),
  ('die Temperatur', 'the temperature', 'pl. die Temperaturen', '{}', 'Die Temperatur sinkt.', 'The temperature is falling.', 9),
  ('die Pflanze', 'the plant', 'pl. die Pflanzen', '{}', 'Die Pflanze braucht Wasser.', 'The plant needs water.', 10),
  ('der Baum', 'the tree', 'pl. die Bäume', '{}', 'Der Baum ist über hundert Jahre alt.', 'The tree is over a hundred years old.', 11),
  ('das Tier', 'the animal', 'pl. die Tiere', '{}', 'Viele Tiere sind in Gefahr.', 'Many animals are in danger.', 12),
  ('das Feld', 'the field', 'pl. die Felder', '{}', 'Auf dem Feld wächst Mais.', 'Corn grows in the field.', 13),
  ('der Wald', 'the forest', 'pl. die Wälder', '{}', 'Wir gehen im Wald spazieren.', 'We go for a walk in the forest.', 14),
  ('die Insel', 'the island', 'pl. die Inseln', '{}', 'Wir machen Urlaub auf einer Insel.', 'We are holidaying on an island.', 15),
  ('die Küste', 'the coast', 'pl. die Küsten', '{}', 'Das Dorf liegt an der Küste.', 'The village is on the coast.', 16),
  ('der Fluss', 'the river', 'pl. die Flüsse', '{}', 'Der Fluss ist sehr breit.', 'The river is very wide.', 17),
  ('schützen', 'to protect', '', '{verb}', 'Wir schützen die Natur.', 'We protect nature.', 18),
  ('sparen', 'to save', '', '{verb}', 'Wir sollten Energie sparen.', 'We should save energy.', 19),
  ('trennen', 'to separate / sort', '', '{verb}', 'Wir trennen den Müll.', 'We separate the rubbish.', 20),
  ('recyceln', 'to recycle', '', '{verb}', 'Man kann Glas recyceln.', 'You can recycle glass.', 21),
  ('die Energie', 'the energy', '', '{}', 'Sonnenenergie ist sauber.', 'Solar energy is clean.', 22),
  ('umweltfreundlich', 'environmentally friendly', '', '{adjective}', 'Das Fahrrad ist umweltfreundlich.', 'The bicycle is environmentally friendly.', 23),
  ('sauber', 'clean', '', '{adjective}', 'Der See ist sehr sauber.', 'The lake is very clean.', 24),
  ('schmutzig', 'dirty', '', '{adjective}', 'Der Fluss ist schmutzig.', 'The river is dirty.', 25),
  ('der Klimawandel', 'climate change', '', '{}', 'Der Klimawandel ist ein großes Problem.', 'Climate change is a big problem.', 26),
  ('die Sonne', 'the sun', '', '{}', 'Die Sonne scheint.', 'The sun is shining.', 27),
  ('der Regen', 'the rain', '', '{}', 'Der Regen hört nicht auf.', 'The rain does not stop.', 28),
  ('der Schnee', 'the snow', '', '{}', 'Der Schnee bleibt liegen.', 'The snow is settling.', 29),
  ('die Aussicht', 'the view', 'pl. die Aussichten', '{}', 'Vom Berg hat man eine tolle Aussicht.', 'From the mountain you have a great view.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 14: City & transport
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · City & transport', 'Getting around the city', 'A2', true, 14)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die U-Bahn', 'the underground / subway', 'pl. die U-Bahnen', '{}', 'Ich fahre mit der U-Bahn zur Arbeit.', 'I take the underground to work.', 1),
  ('die Straßenbahn', 'the tram', 'pl. die Straßenbahnen', '{}', 'Die Straßenbahn hält hier.', 'The tram stops here.', 2),
  ('der Fahrplan', 'the timetable', 'pl. die Fahrpläne', '{}', 'Schau auf den Fahrplan.', 'Look at the timetable.', 3),
  ('die Verbindung', 'the connection', 'pl. die Verbindungen', '{}', 'Es gibt eine direkte Verbindung.', 'There is a direct connection.', 4),
  ('der Stau', 'the traffic jam', 'pl. die Staus', '{}', 'Wir stehen im Stau.', 'We are stuck in a traffic jam.', 5),
  ('die Ampel', 'the traffic light', 'pl. die Ampeln', '{}', 'Warte an der Ampel.', 'Wait at the traffic light.', 6),
  ('die Kreuzung', 'the crossroads / junction', 'pl. die Kreuzungen', '{}', 'Bieg an der Kreuzung links ab.', 'Turn left at the junction.', 7),
  ('die Ecke', 'the corner', 'pl. die Ecken', '{}', 'Das Geschäft ist an der Ecke.', 'The shop is on the corner.', 8),
  ('die Brücke', 'the bridge', 'pl. die Brücken', '{}', 'Wir gehen über die Brücke.', 'We walk over the bridge.', 9),
  ('das Schild', 'the sign', 'pl. die Schilder', '{}', 'Das Schild zeigt nach rechts.', 'The sign points to the right.', 10),
  ('der Fußgänger', 'the pedestrian', 'pl. die Fußgänger', '{}', 'Fußgänger haben Vorrang.', 'Pedestrians have priority.', 11),
  ('die Haltestelle', 'the (bus) stop', 'pl. die Haltestellen', '{}', 'Die Haltestelle ist dort drüben.', 'The stop is over there.', 12),
  ('parken', 'to park', '', '{verb}', 'Hier darf man nicht parken.', 'You are not allowed to park here.', 13),
  ('abbiegen', 'to turn (off)', 'separable: biegt ab', '{verb}', 'Bieg an der zweiten Straße ab.', 'Turn at the second street.', 14),
  ('überqueren', 'to cross', '', '{verb}', 'Wir überqueren die Straße.', 'We cross the street.', 15),
  ('einsteigen', 'to get in / board', 'separable: steigt ein', '{verb}', 'Bitte einsteigen!', 'All aboard, please!', 16),
  ('aussteigen', 'to get off', 'separable: steigt aus', '{verb}', 'Ich steige an der nächsten Station aus.', 'I get off at the next station.', 17),
  ('umsteigen', 'to change (transport)', 'separable: steigt um', '{verb}', 'Du musst am Hauptbahnhof umsteigen.', 'You have to change at the main station.', 18),
  ('die Richtung', 'the direction', 'pl. die Richtungen', '{}', 'In welche Richtung muss ich gehen?', 'Which direction do I have to go?', 19),
  ('entfernt', 'away / distant', '', '{adjective}', 'Der Bahnhof ist zwei Kilometer entfernt.', 'The station is two kilometres away.', 20),
  ('in der Nähe', 'nearby', '', '{}', 'Gibt es ein Café in der Nähe?', 'Is there a cafe nearby?', 21),
  ('der Eingang', 'the entrance', 'pl. die Eingänge', '{}', 'Der Eingang ist auf der linken Seite.', 'The entrance is on the left.', 22),
  ('der Ausgang', 'the exit', 'pl. die Ausgänge', '{}', 'Der Ausgang ist dort hinten.', 'The exit is back there.', 23),
  ('die Fahrkarte', 'the ticket', 'pl. die Fahrkarten', '{}', 'Die Fahrkarte kostet drei Euro.', 'The ticket costs three euros.', 24),
  ('der Fahrschein', 'the ticket', 'pl. die Fahrscheine', '{}', 'Zeigen Sie bitte Ihren Fahrschein.', 'Please show your ticket.', 25),
  ('der Bahnsteig', 'the platform', 'pl. die Bahnsteige', '{}', 'Der Zug fährt von Bahnsteig drei.', 'The train leaves from platform three.', 26),
  ('die Strecke', 'the route / distance', 'pl. die Strecken', '{}', 'Die Strecke ist gesperrt.', 'The route is closed.', 27),
  ('zu Fuß', 'on foot', '', '{}', 'Ich gehe zu Fuß.', 'I go on foot.', 28),
  ('die Geschwindigkeit', 'the speed', '', '{}', 'Bitte reduziere die Geschwindigkeit.', 'Please reduce your speed.', 29),
  ('der Verkehr', 'the traffic', '', '{}', 'Der Verkehr ist heute schlimm.', 'The traffic is bad today.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 15: Prepositions & cases
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'A2 · Prepositions & cases', 'Two-way, genitive and verb prepositions', 'A2', true, 15)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('in', 'in / into', 'two-way: dative or accusative', '{wechsel}', 'Ich gehe in die Stadt.', 'I am going into the city.', 1),
  ('an', 'at / on / to', 'two-way: dative or accusative', '{wechsel}', 'Das Bild hängt an der Wand.', 'The picture hangs on the wall.', 2),
  ('auf', 'on / onto', 'two-way: dative or accusative', '{wechsel}', 'Das Buch liegt auf dem Tisch.', 'The book is on the table.', 3),
  ('über', 'over / above / about', 'two-way: dative or accusative', '{wechsel}', 'Die Lampe hängt über dem Tisch.', 'The lamp hangs above the table.', 4),
  ('unter', 'under / below', 'two-way: dative or accusative', '{wechsel}', 'Die Katze liegt unter dem Bett.', 'The cat lies under the bed.', 5),
  ('vor', 'in front of / before', 'two-way: dative or accusative', '{wechsel}', 'Ich warte vor dem Kino.', 'I am waiting in front of the cinema.', 6),
  ('hinter', 'behind', 'two-way: dative or accusative', '{wechsel}', 'Der Garten ist hinter dem Haus.', 'The garden is behind the house.', 7),
  ('neben', 'next to', 'two-way: dative or accusative', '{wechsel}', 'Die Bank ist neben der Post.', 'The bank is next to the post office.', 8),
  ('zwischen', 'between', 'two-way: dative or accusative', '{wechsel}', 'Das Café ist zwischen den Geschäften.', 'The cafe is between the shops.', 9),
  ('für', 'for', 'always accusative', '{akk}', 'Das Geschenk ist für dich.', 'The present is for you.', 10),
  ('ohne', 'without', 'always accusative', '{akk}', 'Ich trinke Kaffee ohne Zucker.', 'I drink coffee without sugar.', 11),
  ('durch', 'through', 'always accusative', '{akk}', 'Wir gehen durch den Park.', 'We walk through the park.', 12),
  ('gegen', 'against / around', 'always accusative', '{akk}', 'Ich komme gegen acht.', 'I will come around eight.', 13),
  ('mit', 'with', 'always dative', '{dat}', 'Ich fahre mit dem Auto.', 'I go by car.', 14),
  ('bei', 'at / near', 'always dative', '{dat}', 'Ich bin bei meinen Eltern.', 'I am at my parents.', 15),
  ('nach', 'after / to', 'always dative', '{dat}', 'Nach dem Essen schlafe ich.', 'After the meal I sleep.', 16),
  ('von', 'from / of', 'always dative', '{dat}', 'Das ist ein Brief von Anna.', 'That is a letter from Anna.', 17),
  ('aus', 'from / out of', 'always dative', '{dat}', 'Ich komme aus Deutschland.', 'I come from Germany.', 18),
  ('seit', 'since / for', 'always dative', '{dat}', 'Ich lerne seit einem Jahr Deutsch.', 'I have been learning German for a year.', 19),
  ('gegenüber', 'opposite', 'dative', '{dat}', 'Die Schule ist gegenüber dem Park.', 'The school is opposite the park.', 20),
  ('wegen', 'because of', 'genitive', '{gen}', 'Wegen des Regens bleiben wir zu Hause.', 'Because of the rain we stay at home.', 21),
  ('während', 'during', 'genitive', '{gen}', 'Während der Pause esse ich.', 'During the break I eat.', 22),
  ('trotz', 'despite', 'genitive', '{gen}', 'Trotz des Regens gehen wir spazieren.', 'Despite the rain we go for a walk.', 23),
  ('warten auf', 'to wait for', 'verb + auf + Akk', '{akk}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 24),
  ('denken an', 'to think of', 'verb + an + Akk', '{akk}', 'Ich denke oft an dich.', 'I often think of you.', 25),
  ('sich freuen auf', 'to look forward to', 'verb + auf + Akk', '{akk}', 'Ich freue mich auf den Urlaub.', 'I am looking forward to the holiday.', 26),
  ('sprechen mit', 'to speak with', 'verb + mit + Dativ', '{dat}', 'Ich spreche mit dem Lehrer.', 'I am speaking with the teacher.', 27),
  ('Angst vor', 'fear of', 'noun + vor + Dativ', '{dat}', 'Ich habe Angst vor dem Hund.', 'I am afraid of the dog.', 28)
) as v(front, back, notes, tags, example, example_en, ord);

-- Fertig: 15 A2-Decks (verdichtet), additiv zu A1/B1.


