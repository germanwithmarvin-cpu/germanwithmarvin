-- ============================================================================
-- B1 DECKS (verdichtet) — German Simplified Flashcards
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Selbst-genügsam.
-- ADDITIV: löscht NUR B1-Decks (A1/A2 bleiben), legt B1 neu an (~30 je Thema).
-- Danach verb-markers.sql ausführen, damit die Verb-Marker gesetzt werden.
-- ============================================================================

alter table public.fc_cards       add column if not exists example    text not null default '';
alter table public.fc_cards       add column if not exists example_en text not null default '';
alter table public.fc_card_states add column if not exists flagged    boolean not null default false;

delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and level = 'B1';


-- ---------------------------------------------------------------------------
-- Deck 1: Opinions & discussion
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Opinions & discussion', 'Giving opinions, agreeing and arguing', 'B1', true, 1)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Meinung', 'the opinion', 'pl. die Meinungen', '{}', 'Meiner Meinung nach ist das falsch.', 'In my opinion that is wrong.', 1),
  ('die Ansicht', 'the view / opinion', 'pl. die Ansichten', '{}', 'Ich bin anderer Ansicht.', 'I am of a different opinion.', 2),
  ('der Vorschlag', 'the suggestion', 'pl. die Vorschläge', '{}', 'Ich habe einen guten Vorschlag.', 'I have a good suggestion.', 3),
  ('das Argument', 'the argument', 'pl. die Argumente', '{}', 'Das ist ein starkes Argument.', 'That is a strong argument.', 4),
  ('der Grund', 'the reason', 'pl. die Gründe', '{}', 'Was ist der Grund dafür?', 'What is the reason for that?', 5),
  ('der Vorteil', 'the advantage', 'pl. die Vorteile', '{}', 'Das hat viele Vorteile.', 'That has many advantages.', 6),
  ('der Nachteil', 'the disadvantage', 'pl. die Nachteile', '{}', 'Es gibt auch Nachteile.', 'There are also disadvantages.', 7),
  ('der Standpunkt', 'the point of view', 'pl. die Standpunkte', '{}', 'Ich verstehe deinen Standpunkt.', 'I understand your point of view.', 8),
  ('die Tatsache', 'the fact', 'pl. die Tatsachen', '{}', 'Das ist eine Tatsache.', 'That is a fact.', 9),
  ('der Zweifel', 'the doubt', 'pl. die Zweifel', '{}', 'Ich habe da Zweifel.', 'I have doubts about that.', 10),
  ('der Unterschied', 'the difference', 'pl. die Unterschiede', '{}', 'Es gibt einen großen Unterschied.', 'There is a big difference.', 11),
  ('die Lösung', 'the solution', 'pl. die Lösungen', '{}', 'Wir suchen eine Lösung.', 'We are looking for a solution.', 12),
  ('die Diskussion', 'the discussion', 'pl. die Diskussionen', '{}', 'Die Diskussion war sehr lang.', 'The discussion was very long.', 13),
  ('das Thema', 'the topic', 'pl. die Themen', '{}', 'Das ist ein wichtiges Thema.', 'That is an important topic.', 14),
  ('die Kritik', 'the criticism', '', '{}', 'Seine Kritik war berechtigt.', 'His criticism was justified.', 15),
  ('der Eindruck', 'the impression', 'pl. die Eindrücke', '{}', 'Ich habe einen guten Eindruck.', 'I have a good impression.', 16),
  ('der Beweis', 'the proof', 'pl. die Beweise', '{}', 'Es gibt keinen Beweis dafür.', 'There is no proof for that.', 17),
  ('behaupten', 'to claim', '', '{verb}', 'Er behauptet, dass er recht hat.', 'He claims that he is right.', 18),
  ('zustimmen', 'to agree', '+ Dativ; separable', '{verb,dat}', 'Ich stimme dir zu.', 'I agree with you.', 19),
  ('widersprechen', 'to contradict', '+ Dativ', '{verb,dat}', 'Da muss ich dir widersprechen.', 'I have to contradict you there.', 20),
  ('überzeugen', 'to convince', '', '{verb}', 'Du hast mich überzeugt.', 'You have convinced me.', 21),
  ('vergleichen', 'to compare', 'vergleicht, verglich, verglichen', '{verb}', 'Wir vergleichen die Angebote.', 'We compare the offers.', 22),
  ('begründen', 'to justify', '', '{verb}', 'Kannst du deine Meinung begründen?', 'Can you justify your opinion?', 23),
  ('erwähnen', 'to mention', '', '{verb}', 'Sie hat das nicht erwähnt.', 'She did not mention that.', 24),
  ('kritisieren', 'to criticise', '', '{verb}', 'Er kritisiert den Plan.', 'He criticises the plan.', 25),
  ('diskutieren', 'to discuss', 'über + Akk', '{verb}', 'Wir diskutieren über die Zukunft.', 'We discuss the future.', 26),
  ('ablehnen', 'to reject / refuse', 'separable: lehnt ab', '{verb}', 'Sie lehnt den Vorschlag ab.', 'She rejects the suggestion.', 27),
  ('betonen', 'to emphasise', '', '{verb}', 'Ich möchte betonen, dass es wichtig ist.', 'I want to emphasise that it is important.', 28),
  ('einerseits', 'on the one hand', '', '{}', 'Einerseits ist es teuer.', 'On the one hand it is expensive.', 29),
  ('andererseits', 'on the other hand', '', '{}', 'Andererseits ist es praktisch.', 'On the other hand it is practical.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 2: Media & internet
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Media & internet', 'Digital life, news and online', 'B1', true, 2)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Nachricht', 'the message / news item', 'pl. die Nachrichten', '{}', 'Ich habe eine Nachricht bekommen.', 'I received a message.', 1),
  ('die Sendung', 'the broadcast / programme', 'pl. die Sendungen', '{}', 'Die Sendung läuft um acht.', 'The programme is on at eight.', 2),
  ('die Werbung', 'the advertising', '', '{}', 'Die Werbung ist überall.', 'Advertising is everywhere.', 3),
  ('der Bildschirm', 'the screen', 'pl. die Bildschirme', '{}', 'Der Bildschirm ist kaputt.', 'The screen is broken.', 4),
  ('das Netzwerk', 'the network', 'pl. die Netzwerke', '{}', 'Das soziale Netzwerk ist beliebt.', 'The social network is popular.', 5),
  ('der Nutzer', 'the user', 'pl. die Nutzer', '{}', 'Die App hat viele Nutzer.', 'The app has many users.', 6),
  ('das Passwort', 'the password', 'pl. die Passwörter', '{}', 'Ich habe mein Passwort vergessen.', 'I forgot my password.', 7),
  ('die Datei', 'the file', 'pl. die Dateien', '{}', 'Schick mir bitte die Datei.', 'Please send me the file.', 8),
  ('der Beitrag', 'the post / contribution', 'pl. die Beiträge', '{}', 'Dein Beitrag gefällt mir.', 'I like your post.', 9),
  ('die Quelle', 'the source', 'pl. die Quellen', '{}', 'Die Quelle ist nicht sicher.', 'The source is not reliable.', 10),
  ('die Verbindung', 'the connection', 'pl. die Verbindungen', '{}', 'Die Verbindung ist schlecht.', 'The connection is bad.', 11),
  ('der Zugang', 'the access', 'pl. die Zugänge', '{}', 'Ich habe keinen Zugang.', 'I have no access.', 12),
  ('die Anwendung', 'the application / app', 'pl. die Anwendungen', '{}', 'Diese Anwendung ist nützlich.', 'This application is useful.', 13),
  ('die Daten', 'the data', 'plural', '{}', 'Die Daten sind geschützt.', 'The data is protected.', 14),
  ('der Anschluss', 'the connection (line)', 'pl. die Anschlüsse', '{}', 'Wir brauchen einen Internetanschluss.', 'We need an internet connection.', 15),
  ('hochladen', 'to upload', 'separable: lädt hoch', '{verb}', 'Ich lade das Foto hoch.', 'I am uploading the photo.', 16),
  ('herunterladen', 'to download', 'separable: lädt herunter', '{verb}', 'Ich lade die App herunter.', 'I am downloading the app.', 17),
  ('speichern', 'to save', '', '{verb}', 'Vergiss nicht zu speichern.', 'Do not forget to save.', 18),
  ('löschen', 'to delete', '', '{verb}', 'Ich lösche die alten Nachrichten.', 'I am deleting the old messages.', 19),
  ('teilen', 'to share', '', '{verb}', 'Ich teile den Artikel.', 'I share the article.', 20),
  ('installieren', 'to install', '', '{verb}', 'Ich installiere das Programm.', 'I install the program.', 21),
  ('sich anmelden', 'to log in / register', 'reflexive, separable', '{verb}', 'Du musst dich zuerst anmelden.', 'You have to log in first.', 22),
  ('sich informieren', 'to inform oneself', 'über + Akk', '{verb}', 'Ich informiere mich über das Thema.', 'I inform myself about the topic.', 23),
  ('aktuell', 'current / up to date', '', '{adjective}', 'Die Nachrichten sind aktuell.', 'The news is up to date.', 24),
  ('digital', 'digital', '', '{adjective}', 'Wir leben in einer digitalen Welt.', 'We live in a digital world.', 25),
  ('online', 'online', '', '{adjective}', 'Ich kaufe oft online ein.', 'I often shop online.', 26),
  ('die Sicherheit', 'the security / safety', '', '{}', 'Datensicherheit ist wichtig.', 'Data security is important.', 27),
  ('das Gerät', 'the device', 'pl. die Geräte', '{}', 'Das Gerät ist sehr modern.', 'The device is very modern.', 28),
  ('die Suchmaschine', 'the search engine', 'pl. die Suchmaschinen', '{}', 'Ich benutze eine Suchmaschine.', 'I use a search engine.', 29),
  ('virtuell', 'virtual', '', '{adjective}', 'Das Treffen war virtuell.', 'The meeting was virtual.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 3: Environment & society
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Environment & society', 'Environment, society and problems', 'B1', true, 3)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Gesellschaft', 'the society', 'pl. die Gesellschaften', '{}', 'Die Gesellschaft verändert sich.', 'Society is changing.', 1),
  ('die Umwelt', 'the environment', '', '{}', 'Wir müssen die Umwelt schützen.', 'We must protect the environment.', 2),
  ('der Klimawandel', 'climate change', '', '{}', 'Der Klimawandel ist ein großes Problem.', 'Climate change is a big problem.', 3),
  ('die Verschmutzung', 'the pollution', '', '{}', 'Die Verschmutzung der Luft steigt.', 'Air pollution is rising.', 4),
  ('die Energie', 'the energy', '', '{}', 'Erneuerbare Energie ist wichtig.', 'Renewable energy is important.', 5),
  ('der Abfall', 'the waste', 'pl. die Abfälle', '{}', 'Wir trennen den Abfall.', 'We separate the waste.', 6),
  ('die Verantwortung', 'the responsibility', '', '{}', 'Jeder trägt Verantwortung.', 'Everyone bears responsibility.', 7),
  ('das Problem', 'the problem', 'pl. die Probleme', '{}', 'Das ist ein ernstes Problem.', 'That is a serious problem.', 8),
  ('die Entwicklung', 'the development', 'pl. die Entwicklungen', '{}', 'Die Entwicklung ist positiv.', 'The development is positive.', 9),
  ('die Bevölkerung', 'the population', '', '{}', 'Die Bevölkerung wächst.', 'The population is growing.', 10),
  ('die Regierung', 'the government', 'pl. die Regierungen', '{}', 'Die Regierung plant ein Gesetz.', 'The government is planning a law.', 11),
  ('das Gesetz', 'the law', 'pl. die Gesetze', '{}', 'Das Gesetz gilt ab Januar.', 'The law applies from January.', 12),
  ('die Steuer', 'the tax', 'pl. die Steuern', '{}', 'Die Steuern sind hoch.', 'The taxes are high.', 13),
  ('die Politik', 'the politics / policy', '', '{}', 'Ich interessiere mich für Politik.', 'I am interested in politics.', 14),
  ('die Wahl', 'the election / choice', 'pl. die Wahlen', '{}', 'Die Wahl ist im Herbst.', 'The election is in autumn.', 15),
  ('die Gerechtigkeit', 'the justice / fairness', '', '{}', 'Wir kämpfen für Gerechtigkeit.', 'We fight for justice.', 16),
  ('die Gefahr', 'the danger', 'pl. die Gefahren', '{}', 'Es besteht eine große Gefahr.', 'There is a great danger.', 17),
  ('die Zukunft', 'the future', '', '{}', 'Wir denken an die Zukunft.', 'We think about the future.', 18),
  ('schützen', 'to protect', '', '{verb}', 'Wir schützen die Natur.', 'We protect nature.', 19),
  ('verbrauchen', 'to consume / use up', '', '{verb}', 'Das Auto verbraucht viel Benzin.', 'The car uses a lot of petrol.', 20),
  ('vermeiden', 'to avoid', 'vermeidet, vermied, vermieden', '{verb}', 'Wir sollten Müll vermeiden.', 'We should avoid waste.', 21),
  ('sich engagieren', 'to get involved', 'für + Akk', '{verb}', 'Sie engagiert sich für die Umwelt.', 'She is committed to the environment.', 22),
  ('unterstützen', 'to support', '', '{verb}', 'Wir unterstützen das Projekt.', 'We support the project.', 23),
  ('verbieten', 'to ban / forbid', 'verbietet, verbot, verboten', '{verb}', 'Plastik soll verboten werden.', 'Plastic should be banned.', 24),
  ('wählen', 'to vote / choose', '', '{verb}', 'Morgen gehen wir wählen.', 'Tomorrow we go to vote.', 25),
  ('nachhaltig', 'sustainable', '', '{adjective}', 'Wir leben nachhaltig.', 'We live sustainably.', 26),
  ('öffentlich', 'public', '', '{adjective}', 'Ich nutze öffentliche Verkehrsmittel.', 'I use public transport.', 27),
  ('arm', 'poor', '', '{adjective}', 'Viele Menschen sind arm.', 'Many people are poor.', 28),
  ('reich', 'rich', '', '{adjective}', 'Das Land ist sehr reich.', 'The country is very rich.', 29),
  ('die Armut', 'the poverty', '', '{}', 'Die Armut nimmt zu.', 'Poverty is increasing.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 4: Work & career
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Work & career', 'Career, applications and the job', 'B1', true, 4)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Karriere', 'the career', 'pl. die Karrieren', '{}', 'Sie macht schnell Karriere.', 'She is advancing quickly in her career.', 1),
  ('die Bewerbung', 'the application', 'pl. die Bewerbungen', '{}', 'Meine Bewerbung war erfolgreich.', 'My application was successful.', 2),
  ('das Vorstellungsgespräch', 'the job interview', 'pl. -gespräche', '{}', 'Das Vorstellungsgespräch ist morgen.', 'The job interview is tomorrow.', 3),
  ('der Vertrag', 'the contract', 'pl. die Verträge', '{}', 'Ich unterschreibe den Vertrag.', 'I am signing the contract.', 4),
  ('die Abteilung', 'the department', 'pl. die Abteilungen', '{}', 'Ich arbeite in der Marketing-Abteilung.', 'I work in the marketing department.', 5),
  ('die Verantwortung', 'the responsibility', '', '{}', 'Ich übernehme die Verantwortung.', 'I take responsibility.', 6),
  ('die Fähigkeit', 'the ability / skill', 'pl. die Fähigkeiten', '{}', 'Er hat viele Fähigkeiten.', 'He has many skills.', 7),
  ('die Kenntnisse', 'the knowledge / skills', 'plural', '{}', 'Sie hat gute Englischkenntnisse.', 'She has good English skills.', 8),
  ('das Gehalt', 'the salary', 'pl. die Gehälter', '{}', 'Das Gehalt ist verhandelbar.', 'The salary is negotiable.', 9),
  ('die Teilzeit', 'part-time', '', '{}', 'Ich arbeite in Teilzeit.', 'I work part-time.', 10),
  ('die Vollzeit', 'full-time', '', '{}', 'Er arbeitet in Vollzeit.', 'He works full-time.', 11),
  ('der Termin', 'the appointment / deadline', 'pl. die Termine', '{}', 'Der Termin ist wichtig.', 'The appointment is important.', 12),
  ('die Besprechung', 'the meeting', 'pl. die Besprechungen', '{}', 'Die Besprechung dauert lange.', 'The meeting takes a long time.', 13),
  ('der Erfolg', 'the success', 'pl. die Erfolge', '{}', 'Der Erfolg kommt mit der Zeit.', 'Success comes with time.', 14),
  ('das Ziel', 'the goal', 'pl. die Ziele', '{}', 'Ich habe ein klares Ziel.', 'I have a clear goal.', 15),
  ('die Branche', 'the industry / sector', 'pl. die Branchen', '{}', 'Sie arbeitet in der IT-Branche.', 'She works in the IT sector.', 16),
  ('der Lebenslauf', 'the CV / resume', 'pl. die Lebensläufe', '{}', 'Schick mir bitte deinen Lebenslauf.', 'Please send me your CV.', 17),
  ('sich bewerben', 'to apply', 'um + Akk', '{verb}', 'Ich bewerbe mich um die Stelle.', 'I am applying for the position.', 18),
  ('verdienen', 'to earn', '', '{verb}', 'Sie verdient gut.', 'She earns well.', 19),
  ('leiten', 'to lead / manage', '', '{verb}', 'Er leitet das Projekt.', 'He leads the project.', 20),
  ('sich verbessern', 'to improve (oneself)', 'reflexive', '{verb}', 'Ich möchte mich beruflich verbessern.', 'I want to improve professionally.', 21),
  ('kündigen', 'to quit / give notice', '', '{verb}', 'Sie hat gekündigt.', 'She has quit.', 22),
  ('einstellen', 'to hire', 'separable: stellt ein', '{verb}', 'Die Firma stellt neue Leute ein.', 'The company is hiring new people.', 23),
  ('erreichen', 'to reach / achieve', '', '{verb}', 'Wir haben unser Ziel erreicht.', 'We have reached our goal.', 24),
  ('sich konzentrieren', 'to concentrate', 'auf + Akk', '{verb}', 'Ich konzentriere mich auf die Arbeit.', 'I concentrate on the work.', 25),
  ('beruflich', 'professional(ly)', '', '{adjective}', 'Beruflich läuft es gut.', 'Professionally things are going well.', 26),
  ('erfolgreich', 'successful', '', '{adjective}', 'Das Projekt war erfolgreich.', 'The project was successful.', 27),
  ('zuständig', 'responsible / in charge', 'für + Akk', '{adjective}', 'Wer ist dafür zuständig?', 'Who is in charge of this?', 28),
  ('die Stelle', 'the position / job', 'pl. die Stellen', '{}', 'Die Stelle ist frei.', 'The position is vacant.', 29),
  ('die Ausbildung', 'the training', '', '{}', 'Er macht eine Ausbildung.', 'He is doing vocational training.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 5: Health & lifestyle
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Health & lifestyle', 'Healthy living, sport and well-being', 'B1', true, 5)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Ernährung', 'the diet / nutrition', '', '{}', 'Eine gesunde Ernährung ist wichtig.', 'A healthy diet is important.', 1),
  ('die Bewegung', 'the exercise / movement', '', '{}', 'Bewegung hält fit.', 'Exercise keeps you fit.', 2),
  ('der Stress', 'the stress', '', '{}', 'Ich habe viel Stress bei der Arbeit.', 'I have a lot of stress at work.', 3),
  ('die Entspannung', 'the relaxation', '', '{}', 'Yoga sorgt für Entspannung.', 'Yoga provides relaxation.', 4),
  ('der Schlaf', 'the sleep', '', '{}', 'Guter Schlaf ist wichtig.', 'Good sleep is important.', 5),
  ('das Gewicht', 'the weight', '', '{}', 'Ich achte auf mein Gewicht.', 'I watch my weight.', 6),
  ('die Verletzung', 'the injury', 'pl. die Verletzungen', '{}', 'Die Verletzung ist nicht schlimm.', 'The injury is not serious.', 7),
  ('die Behandlung', 'the treatment', 'pl. die Behandlungen', '{}', 'Die Behandlung hilft.', 'The treatment helps.', 8),
  ('die Vorsorge', 'the prevention / check-up', '', '{}', 'Vorsorge ist besser als heilen.', 'Prevention is better than cure.', 9),
  ('die Sucht', 'the addiction', 'pl. die Süchte', '{}', 'Rauchen kann zur Sucht werden.', 'Smoking can become an addiction.', 10),
  ('das Wohlbefinden', 'the well-being', '', '{}', 'Sport steigert das Wohlbefinden.', 'Sport increases well-being.', 11),
  ('die Gewohnheit', 'the habit', 'pl. die Gewohnheiten', '{}', 'Rauchen ist eine schlechte Gewohnheit.', 'Smoking is a bad habit.', 12),
  ('sich ernähren', 'to eat / nourish oneself', 'reflexive', '{verb}', 'Ich ernähre mich gesund.', 'I eat healthily.', 13),
  ('sich bewegen', 'to move / exercise', 'reflexive', '{verb}', 'Du solltest dich mehr bewegen.', 'You should move more.', 14),
  ('sich entspannen', 'to relax', 'reflexive', '{verb}', 'Am Wochenende entspanne ich mich.', 'At the weekend I relax.', 15),
  ('vermeiden', 'to avoid', 'vermeidet, vermied, vermieden', '{verb}', 'Ich vermeide Zucker.', 'I avoid sugar.', 16),
  ('zunehmen', 'to gain weight', 'separable: nimmt zu', '{verb}', 'Im Winter nehme ich oft zu.', 'In winter I often gain weight.', 17),
  ('abnehmen', 'to lose weight', 'separable: nimmt ab', '{verb}', 'Sie möchte abnehmen.', 'She wants to lose weight.', 18),
  ('sich erholen', 'to recover / rest', 'reflexive', '{verb}', 'Ich erhole mich im Urlaub.', 'I recover during the holiday.', 19),
  ('aufhören', 'to stop / quit', 'mit + Dativ; separable', '{verb}', 'Er hat mit dem Rauchen aufgehört.', 'He has quit smoking.', 20),
  ('leiden', 'to suffer', 'an/unter + Dativ', '{verb}', 'Sie leidet an Allergien.', 'She suffers from allergies.', 21),
  ('gesund', 'healthy', '', '{adjective}', 'Gemüse ist sehr gesund.', 'Vegetables are very healthy.', 22),
  ('ungesund', 'unhealthy', '', '{adjective}', 'Fast Food ist ungesund.', 'Fast food is unhealthy.', 23),
  ('fit', 'fit', '', '{adjective}', 'Ich fühle mich fit.', 'I feel fit.', 24),
  ('erschöpft', 'exhausted', '', '{adjective}', 'Nach dem Sport bin ich erschöpft.', 'After sport I am exhausted.', 25),
  ('regelmäßig', 'regular(ly)', '', '{adjective}', 'Ich treibe regelmäßig Sport.', 'I exercise regularly.', 26),
  ('körperlich', 'physical(ly)', '', '{adjective}', 'Die Arbeit ist körperlich anstrengend.', 'The work is physically demanding.', 27),
  ('seelisch', 'mental / emotional', '', '{adjective}', 'Seelische Gesundheit ist wichtig.', 'Mental health is important.', 28),
  ('das Rezept', 'the prescription / recipe', 'pl. die Rezepte', '{}', 'Der Arzt gibt mir ein Rezept.', 'The doctor gives me a prescription.', 29),
  ('die Diät', 'the diet', 'pl. die Diäten', '{}', 'Sie macht eine Diät.', 'She is on a diet.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 6: Education & studies
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Education & studies', 'School, university and learning', 'B1', true, 6)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Bildung', 'the education', '', '{}', 'Bildung ist sehr wichtig.', 'Education is very important.', 1),
  ('die Universität', 'the university', 'pl. die Universitäten', '{}', 'Sie studiert an der Universität.', 'She studies at university.', 2),
  ('das Studium', 'the studies / degree', 'pl. die Studien', '{}', 'Mein Studium dauert drei Jahre.', 'My degree takes three years.', 3),
  ('das Fach', 'the subject', 'pl. die Fächer', '{}', 'Mein Lieblingsfach ist Mathe.', 'My favourite subject is maths.', 4),
  ('die Note', 'the grade / mark', 'pl. die Noten', '{}', 'Ich habe eine gute Note bekommen.', 'I got a good grade.', 5),
  ('die Prüfung', 'the exam', 'pl. die Prüfungen', '{}', 'Die Prüfung war schwer.', 'The exam was hard.', 6),
  ('das Zeugnis', 'the report / certificate', 'pl. die Zeugnisse', '{}', 'Mein Zeugnis ist gut.', 'My report is good.', 7),
  ('der Kurs', 'the course', 'pl. die Kurse', '{}', 'Ich besuche einen Deutschkurs.', 'I attend a German course.', 8),
  ('der Abschluss', 'the degree / qualification', 'pl. die Abschlüsse', '{}', 'Sie hat einen guten Abschluss.', 'She has a good qualification.', 9),
  ('die Aufgabe', 'the task / assignment', 'pl. die Aufgaben', '{}', 'Die Aufgabe ist schwierig.', 'The assignment is difficult.', 10),
  ('das Wissen', 'the knowledge', '', '{}', 'Wissen ist Macht.', 'Knowledge is power.', 11),
  ('die Forschung', 'the research', '', '{}', 'Die Forschung ist wichtig.', 'Research is important.', 12),
  ('das Stipendium', 'the scholarship', 'pl. die Stipendien', '{}', 'Er bekommt ein Stipendium.', 'He receives a scholarship.', 13),
  ('die Vorlesung', 'the lecture', 'pl. die Vorlesungen', '{}', 'Die Vorlesung beginnt um neun.', 'The lecture starts at nine.', 14),
  ('die Bibliothek', 'the library', 'pl. die Bibliotheken', '{}', 'Ich lerne in der Bibliothek.', 'I study in the library.', 15),
  ('bestehen', 'to pass (an exam)', 'besteht, bestand, bestanden', '{verb}', 'Ich habe die Prüfung bestanden.', 'I passed the exam.', 16),
  ('durchfallen', 'to fail (an exam)', 'separable: fällt durch', '{verb}', 'Er ist durch die Prüfung gefallen.', 'He failed the exam.', 17),
  ('studieren', 'to study (at university)', '', '{verb}', 'Ich studiere Medizin.', 'I study medicine.', 18),
  ('sich vorbereiten', 'to prepare', 'auf + Akk', '{verb}', 'Ich bereite mich auf die Prüfung vor.', 'I am preparing for the exam.', 19),
  ('wiederholen', 'to repeat / revise', '', '{verb}', 'Ich wiederhole die Vokabeln.', 'I revise the vocabulary.', 20),
  ('verbessern', 'to improve', '', '{verb}', 'Ich möchte mein Deutsch verbessern.', 'I want to improve my German.', 21),
  ('teilnehmen', 'to participate', 'an + Dativ; separable', '{verb,dat}', 'Ich nehme an dem Kurs teil.', 'I take part in the course.', 22),
  ('sich anmelden', 'to register / sign up', 'für + Akk; separable', '{verb}', 'Ich melde mich für den Kurs an.', 'I sign up for the course.', 23),
  ('abgeben', 'to hand in', 'separable: gibt ab', '{verb}', 'Ich muss die Arbeit morgen abgeben.', 'I have to hand in the paper tomorrow.', 24),
  ('schwierig', 'difficult', '', '{adjective}', 'Das Thema ist schwierig.', 'The topic is difficult.', 25),
  ('begabt', 'talented', '', '{adjective}', 'Sie ist sehr begabt.', 'She is very talented.', 26),
  ('verpflichtend', 'compulsory', '', '{adjective}', 'Der Kurs ist verpflichtend.', 'The course is compulsory.', 27),
  ('freiwillig', 'voluntary', '', '{adjective}', 'Die Teilnahme ist freiwillig.', 'Participation is voluntary.', 28),
  ('die Kenntnis', 'the knowledge', 'pl. die Kenntnisse', '{}', 'Er hat gute Kenntnisse.', 'He has good knowledge.', 29),
  ('das Ergebnis', 'the result', 'pl. die Ergebnisse', '{}', 'Das Ergebnis ist gut.', 'The result is good.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 7: Relationships & emotions
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Relationships & emotions', 'People, relationships and feelings', 'B1', true, 7)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Beziehung', 'the relationship', 'pl. die Beziehungen', '{}', 'Wir haben eine gute Beziehung.', 'We have a good relationship.', 1),
  ('das Vertrauen', 'the trust', '', '{}', 'Vertrauen ist wichtig.', 'Trust is important.', 2),
  ('die Freundschaft', 'the friendship', 'pl. die Freundschaften', '{}', 'Unsere Freundschaft ist alt.', 'Our friendship is old.', 3),
  ('der Streit', 'the argument / quarrel', 'pl. die Streite', '{}', 'Wir hatten einen kurzen Streit.', 'We had a short argument.', 4),
  ('das Gefühl', 'the feeling', 'pl. die Gefühle', '{}', 'Ich kann meine Gefühle zeigen.', 'I can show my feelings.', 5),
  ('die Liebe', 'the love', '', '{}', 'Liebe ist das Wichtigste.', 'Love is the most important thing.', 6),
  ('die Eifersucht', 'the jealousy', '', '{}', 'Eifersucht ist ungesund.', 'Jealousy is unhealthy.', 7),
  ('die Enttäuschung', 'the disappointment', 'pl. die Enttäuschungen', '{}', 'Das war eine große Enttäuschung.', 'That was a big disappointment.', 8),
  ('das Verständnis', 'the understanding', '', '{}', 'Danke für dein Verständnis.', 'Thank you for your understanding.', 9),
  ('die Sehnsucht', 'the longing', '', '{}', 'Ich habe Sehnsucht nach zu Hause.', 'I long for home.', 10),
  ('der Partner', 'the partner', 'pl. die Partner', '{}', 'Mein Partner unterstützt mich.', 'My partner supports me.', 11),
  ('die Ehe', 'the marriage', 'pl. die Ehen', '{}', 'Ihre Ehe ist glücklich.', 'Their marriage is happy.', 12),
  ('sich verlieben', 'to fall in love', 'in + Akk', '{verb}', 'Ich habe mich in sie verliebt.', 'I fell in love with her.', 13),
  ('sich verstehen', 'to get along', 'mit + Dativ', '{verb}', 'Wir verstehen uns gut.', 'We get along well.', 14),
  ('sich streiten', 'to argue', 'reflexive', '{verb}', 'Sie streiten sich oft.', 'They argue often.', 15),
  ('sich trennen', 'to separate / split up', 'reflexive', '{verb}', 'Sie haben sich getrennt.', 'They have split up.', 16),
  ('vertrauen', 'to trust', '+ Dativ', '{verb,dat}', 'Ich vertraue dir.', 'I trust you.', 17),
  ('sich verlassen', 'to rely', 'auf + Akk', '{verb}', 'Ich kann mich auf dich verlassen.', 'I can rely on you.', 18),
  ('vermissen', 'to miss', '', '{verb}', 'Ich vermisse meine Familie.', 'I miss my family.', 19),
  ('verzeihen', 'to forgive', '+ Dativ', '{verb,dat}', 'Bitte verzeih mir.', 'Please forgive me.', 20),
  ('sich verloben', 'to get engaged', 'reflexive', '{verb}', 'Sie haben sich verlobt.', 'They got engaged.', 21),
  ('heiraten', 'to marry', '', '{verb}', 'Im Sommer heiraten wir.', 'We are getting married in summer.', 22),
  ('unterstützen', 'to support', '', '{verb}', 'Wir unterstützen uns gegenseitig.', 'We support each other.', 23),
  ('ehrlich', 'honest', '', '{adjective}', 'Sei bitte ehrlich zu mir.', 'Please be honest with me.', 24),
  ('eifersüchtig', 'jealous', 'auf + Akk', '{adjective}', 'Er ist eifersüchtig.', 'He is jealous.', 25),
  ('verliebt', 'in love', 'in + Akk', '{adjective}', 'Sie ist verliebt.', 'She is in love.', 26),
  ('einsam', 'lonely', '', '{adjective}', 'Manchmal fühle ich mich einsam.', 'Sometimes I feel lonely.', 27),
  ('treu', 'faithful / loyal', '', '{adjective}', 'Ein Hund ist sehr treu.', 'A dog is very loyal.', 28),
  ('verständnisvoll', 'understanding', '', '{adjective}', 'Mein Chef ist verständnisvoll.', 'My boss is understanding.', 29),
  ('gemeinsam', 'together / joint', '', '{adjective}', 'Wir machen das gemeinsam.', 'We do this together.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 8: Money & consumption
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Money & consumption', 'Money, budget and consumer life', 'B1', true, 8)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Einkommen', 'the income', 'pl. die Einkommen', '{}', 'Mein Einkommen reicht aus.', 'My income is enough.', 1),
  ('die Ausgaben', 'the expenses', 'plural', '{}', 'Meine Ausgaben sind hoch.', 'My expenses are high.', 2),
  ('die Schulden', 'the debts', 'plural', '{}', 'Er hat keine Schulden.', 'He has no debts.', 3),
  ('der Kredit', 'the loan / credit', 'pl. die Kredite', '{}', 'Sie nimmt einen Kredit auf.', 'She is taking out a loan.', 4),
  ('die Rechnung', 'the bill / invoice', 'pl. die Rechnungen', '{}', 'Die Rechnung ist noch offen.', 'The bill is still unpaid.', 5),
  ('das Budget', 'the budget', 'pl. die Budgets', '{}', 'Ich habe ein kleines Budget.', 'I have a small budget.', 6),
  ('der Gewinn', 'the profit', 'pl. die Gewinne', '{}', 'Die Firma macht Gewinn.', 'The company makes a profit.', 7),
  ('der Verlust', 'the loss', 'pl. die Verluste', '{}', 'Das war ein großer Verlust.', 'That was a big loss.', 8),
  ('die Versicherung', 'the insurance', 'pl. die Versicherungen', '{}', 'Ich brauche eine Versicherung.', 'I need insurance.', 9),
  ('der Verbraucher', 'the consumer', 'pl. die Verbraucher', '{}', 'Der Verbraucher hat Rechte.', 'The consumer has rights.', 10),
  ('das Vermögen', 'the wealth / assets', '', '{}', 'Er hat ein großes Vermögen.', 'He has a large fortune.', 11),
  ('die Miete', 'the rent', 'pl. die Mieten', '{}', 'Die Miete ist sehr hoch.', 'The rent is very high.', 12),
  ('die Steuer', 'the tax', 'pl. die Steuern', '{}', 'Ich muss Steuern zahlen.', 'I have to pay taxes.', 13),
  ('das Konto', 'the account', 'pl. die Konten', '{}', 'Mein Konto ist leer.', 'My account is empty.', 14),
  ('die Rate', 'the instalment', 'pl. die Raten', '{}', 'Ich zahle in monatlichen Raten.', 'I pay in monthly instalments.', 15),
  ('sparen', 'to save', 'auf + Akk', '{verb}', 'Ich spare auf ein Auto.', 'I am saving for a car.', 16),
  ('ausgeben', 'to spend', 'separable: gibt aus', '{verb}', 'Ich gebe zu viel Geld aus.', 'I spend too much money.', 17),
  ('sich leisten', 'to afford', 'reflexive (Dativ)', '{verb}', 'Das kann ich mir nicht leisten.', 'I cannot afford that.', 18),
  ('investieren', 'to invest', 'in + Akk', '{verb}', 'Sie investiert in Aktien.', 'She invests in shares.', 19),
  ('vergleichen', 'to compare', 'vergleicht, verglich, verglichen', '{verb}', 'Ich vergleiche die Preise.', 'I compare the prices.', 20),
  ('kosten', 'to cost', '', '{verb}', 'Wie viel kostet das?', 'How much does that cost?', 21),
  ('verdienen', 'to earn', '', '{verb}', 'Sie verdient genug Geld.', 'She earns enough money.', 22),
  ('sich verschulden', 'to get into debt', 'reflexive', '{verb}', 'Viele junge Leute verschulden sich.', 'Many young people get into debt.', 23),
  ('teuer', 'expensive', '', '{adjective}', 'Die Miete ist sehr teuer.', 'The rent is very expensive.', 24),
  ('günstig', 'cheap / good value', '', '{adjective}', 'Das Angebot ist günstig.', 'The offer is good value.', 25),
  ('kostenlos', 'free of charge', '', '{adjective}', 'Der Eintritt ist kostenlos.', 'The entrance is free.', 26),
  ('wertvoll', 'valuable', '', '{adjective}', 'Der Ring ist sehr wertvoll.', 'The ring is very valuable.', 27),
  ('sparsam', 'thrifty / economical', '', '{adjective}', 'Sie ist sehr sparsam.', 'She is very thrifty.', 28),
  ('pleite', 'broke (no money)', 'informal', '{adjective}', 'Am Monatsende bin ich pleite.', 'At the end of the month I am broke.', 29),
  ('bar', 'cash (adv.)', 'bar bezahlen', '{}', 'Ich zahle lieber bar.', 'I prefer to pay cash.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 9: Travel & culture
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Travel & culture', 'Travelling, countries and culture', 'B1', true, 9)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Kultur', 'the culture', 'pl. die Kulturen', '{}', 'Ich interessiere mich für andere Kulturen.', 'I am interested in other cultures.', 1),
  ('die Sprache', 'the language', 'pl. die Sprachen', '{}', 'Sie spricht drei Sprachen.', 'She speaks three languages.', 2),
  ('die Tradition', 'the tradition', 'pl. die Traditionen', '{}', 'Das ist eine alte Tradition.', 'That is an old tradition.', 3),
  ('die Sitte', 'the custom', 'pl. die Sitten', '{}', 'Andere Länder, andere Sitten.', 'Other countries, other customs.', 4),
  ('die Grenze', 'the border', 'pl. die Grenzen', '{}', 'Wir fahren über die Grenze.', 'We cross the border.', 5),
  ('die Hauptstadt', 'the capital', 'pl. die Hauptstädte', '{}', 'Berlin ist die Hauptstadt.', 'Berlin is the capital.', 6),
  ('die Einwohner', 'the inhabitants', 'plural', '{}', 'Die Stadt hat viele Einwohner.', 'The city has many inhabitants.', 7),
  ('die Erfahrung', 'the experience', 'pl. die Erfahrungen', '{}', 'Reisen ist eine tolle Erfahrung.', 'Travelling is a great experience.', 8),
  ('die Unterkunft', 'the accommodation', 'pl. die Unterkünfte', '{}', 'Wir suchen eine Unterkunft.', 'We are looking for accommodation.', 9),
  ('das Abenteuer', 'the adventure', 'pl. die Abenteuer', '{}', 'Die Reise war ein Abenteuer.', 'The trip was an adventure.', 10),
  ('der Aufenthalt', 'the stay', 'pl. die Aufenthalte', '{}', 'Der Aufenthalt war kurz.', 'The stay was short.', 11),
  ('die Gastfreundschaft', 'the hospitality', '', '{}', 'Die Gastfreundschaft war groß.', 'The hospitality was great.', 12),
  ('die Landschaft', 'the landscape', 'pl. die Landschaften', '{}', 'Die Landschaft ist wunderschön.', 'The landscape is beautiful.', 13),
  ('die Region', 'the region', 'pl. die Regionen', '{}', 'Diese Region ist sehr grün.', 'This region is very green.', 14),
  ('das Heimweh', 'the homesickness', '', '{}', 'Im Ausland hatte ich Heimweh.', 'Abroad I was homesick.', 15),
  ('entdecken', 'to discover', '', '{verb}', 'Wir entdecken eine neue Stadt.', 'We discover a new city.', 16),
  ('besichtigen', 'to visit / view (a sight)', '', '{verb}', 'Wir besichtigen das Schloss.', 'We are visiting the castle.', 17),
  ('sich gewöhnen', 'to get used to', 'an + Akk', '{verb}', 'Ich gewöhne mich an das Klima.', 'I am getting used to the climate.', 18),
  ('erleben', 'to experience', '', '{verb}', 'Wir erleben viel auf der Reise.', 'We experience a lot on the trip.', 19),
  ('sich verständigen', 'to communicate', 'reflexive', '{verb}', 'Mit Englisch kann man sich überall verständigen.', 'With English you can communicate everywhere.', 20),
  ('übernachten', 'to stay overnight', '', '{verb}', 'Wir übernachten im Hotel.', 'We stay overnight at a hotel.', 21),
  ('sich auskennen', 'to know ones way around', 'reflexive, separable', '{verb}', 'Er kennt sich in der Stadt aus.', 'He knows his way around the city.', 22),
  ('fremd', 'foreign / strange', '', '{adjective}', 'Am Anfang war alles fremd.', 'At first everything was strange.', 23),
  ('beeindruckend', 'impressive', '', '{adjective}', 'Die Landschaft ist beeindruckend.', 'The landscape is impressive.', 24),
  ('typisch', 'typical', '', '{adjective}', 'Das ist typisch deutsch.', 'That is typically German.', 25),
  ('weltweit', 'worldwide', '', '{adjective}', 'Das Produkt ist weltweit bekannt.', 'The product is known worldwide.', 26),
  ('einheimisch', 'local / native', '', '{adjective}', 'Wir essen einheimische Spezialitäten.', 'We eat local specialities.', 27),
  ('die Sehenswürdigkeit', 'the sight / attraction', 'pl. die Sehenswürdigkeiten', '{}', 'Wir sehen uns die Sehenswürdigkeiten an.', 'We look at the sights.', 28),
  ('die Reiseroute', 'the itinerary / route', 'pl. die Reiserouten', '{}', 'Wir planen die Reiseroute.', 'We plan the itinerary.', 29),
  ('die Sprachkenntnisse', 'the language skills', 'plural', '{}', 'Gute Sprachkenntnisse helfen unterwegs.', 'Good language skills help when travelling.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 10: Polite & hypothetical
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Polite & hypothetical', 'Würde, könnte, hätte — being polite and hypothetical', 'B1', true, 10)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('ich würde', 'I would', 'würde + Infinitiv', '{}', 'Ich würde gern mitkommen.', 'I would like to come along.', 1),
  ('ich könnte', 'I could', 'Konjunktiv II of können', '{}', 'Ich könnte dir helfen.', 'I could help you.', 2),
  ('ich hätte', 'I would have', 'Konjunktiv II of haben', '{}', 'Ich hätte gern einen Kaffee.', 'I would like a coffee.', 3),
  ('ich wäre', 'I would be', 'Konjunktiv II of sein', '{}', 'Ich wäre fast zu spät gekommen.', 'I would have almost been late.', 4),
  ('ich möchte', 'I would like', 'polite wish', '{}', 'Ich möchte bitte zahlen.', 'I would like to pay, please.', 5),
  ('ich sollte', 'I should', 'Konjunktiv II of sollen', '{}', 'Ich sollte mehr lernen.', 'I should study more.', 6),
  ('ich müsste', 'I would have to', 'Konjunktiv II of müssen', '{}', 'Ich müsste eigentlich arbeiten.', 'I would actually have to work.', 7),
  ('ich dürfte', 'I would be allowed', 'Konjunktiv II of dürfen', '{}', 'Dürfte ich Sie etwas fragen?', 'Might I ask you something?', 8),
  ('an deiner Stelle', 'if I were you', '', '{}', 'An deiner Stelle würde ich gehen.', 'If I were you, I would go.', 9),
  ('Könnten Sie …?', 'Could you …?', 'polite request', '{}', 'Könnten Sie mir helfen?', 'Could you help me?', 10),
  ('Würden Sie …?', 'Would you …?', 'polite request', '{}', 'Würden Sie bitte warten?', 'Would you please wait?', 11),
  ('hätte gern', 'would like (to have)', '', '{}', 'Ich hätte gern die Rechnung.', 'I would like the bill.', 12),
  ('beinahe', 'almost', '', '{}', 'Ich wäre beinahe gefallen.', 'I would have almost fallen.', 13),
  ('vorschlagen', 'to suggest', 'separable: schlägt vor', '{verb}', 'Ich würde vorschlagen, dass wir gehen.', 'I would suggest that we go.', 14),
  ('empfehlen', 'to recommend', 'empfiehlt, empfahl, empfohlen', '{verb}', 'Ich würde dir das empfehlen.', 'I would recommend that to you.', 15),
  ('sich wünschen', 'to wish', 'reflexive (Dativ)', '{verb}', 'Ich würde mir mehr Zeit wünschen.', 'I would wish for more time.', 16),
  ('bitten', 'to ask / request', 'um + Akk', '{verb}', 'Darf ich Sie um einen Gefallen bitten?', 'May I ask you a favour?', 17),
  ('höflich', 'polite', '', '{adjective}', 'Eine höfliche Bitte hilft oft.', 'A polite request often helps.', 18),
  ('möglich', 'possible', '', '{adjective}', 'Wäre das möglich?', 'Would that be possible?', 19),
  ('eventuell', 'possibly', '', '{}', 'Eventuell komme ich später.', 'I might possibly come later.', 20),
  ('gegebenenfalls', 'if necessary', '', '{}', 'Gegebenenfalls rufe ich an.', 'If necessary I will call.', 21),
  ('die Bitte', 'the request', 'pl. die Bitten', '{}', 'Ich habe eine Bitte.', 'I have a request.', 22),
  ('der Gefallen', 'the favour', '', '{}', 'Tust du mir einen Gefallen?', 'Will you do me a favour?', 23),
  ('ungern', 'reluctantly', '', '{}', 'Ich sage das nur ungern.', 'I only say this reluctantly.', 24),
  ('lieber', 'rather / preferably', '', '{}', 'Ich würde lieber zu Hause bleiben.', 'I would rather stay at home.', 25),
  ('am liebsten', 'most of all', '', '{}', 'Am liebsten würde ich reisen.', 'Most of all I would like to travel.', 26),
  ('hoffentlich', 'hopefully', '', '{}', 'Hoffentlich klappt es.', 'Hopefully it works out.', 27),
  ('vermutlich', 'presumably', '', '{}', 'Er kommt vermutlich später.', 'He will presumably come later.', 28)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 11: Verbs + prepositions
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Verbs + prepositions', 'Fixed verb-preposition combinations', 'B1', true, 11)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('warten auf', 'to wait for', '+ Akkusativ', '{akk}', 'Ich warte auf den Bus.', 'I am waiting for the bus.', 1),
  ('denken an', 'to think of', '+ Akkusativ', '{akk}', 'Ich denke oft an dich.', 'I often think of you.', 2),
  ('sich freuen auf', 'to look forward to', '+ Akkusativ', '{akk}', 'Ich freue mich auf den Urlaub.', 'I am looking forward to the holiday.', 3),
  ('sich freuen über', 'to be happy about', '+ Akkusativ', '{akk}', 'Ich freue mich über das Geschenk.', 'I am happy about the present.', 4),
  ('sich interessieren für', 'to be interested in', '+ Akkusativ', '{akk}', 'Ich interessiere mich für Politik.', 'I am interested in politics.', 5),
  ('sich ärgern über', 'to be annoyed about', '+ Akkusativ', '{akk}', 'Ich ärgere mich über den Stau.', 'I am annoyed about the traffic jam.', 6),
  ('sich erinnern an', 'to remember', '+ Akkusativ', '{akk}', 'Ich erinnere mich an den Tag.', 'I remember the day.', 7),
  ('sich kümmern um', 'to take care of', '+ Akkusativ', '{akk}', 'Ich kümmere mich um die Kinder.', 'I take care of the children.', 8),
  ('sich bewerben um', 'to apply for', '+ Akkusativ', '{akk}', 'Sie bewirbt sich um die Stelle.', 'She is applying for the position.', 9),
  ('achten auf', 'to pay attention to', '+ Akkusativ', '{akk}', 'Achte auf den Verkehr.', 'Pay attention to the traffic.', 10),
  ('sich verlassen auf', 'to rely on', '+ Akkusativ', '{akk}', 'Ich verlasse mich auf dich.', 'I rely on you.', 11),
  ('sich gewöhnen an', 'to get used to', '+ Akkusativ', '{akk}', 'Ich gewöhne mich an die Stadt.', 'I am getting used to the city.', 12),
  ('bitten um', 'to ask for', '+ Akkusativ', '{akk}', 'Ich bitte um Hilfe.', 'I ask for help.', 13),
  ('sich entscheiden für', 'to decide on', '+ Akkusativ', '{akk}', 'Ich entscheide mich für den blauen.', 'I decide on the blue one.', 14),
  ('sich konzentrieren auf', 'to concentrate on', '+ Akkusativ', '{akk}', 'Konzentriere dich auf die Aufgabe.', 'Concentrate on the task.', 15),
  ('nachdenken über', 'to reflect on', '+ Akkusativ', '{akk}', 'Ich denke über den Plan nach.', 'I am reflecting on the plan.', 16),
  ('sich beschweren über', 'to complain about', '+ Akkusativ', '{akk}', 'Sie beschwert sich über den Lärm.', 'She complains about the noise.', 17),
  ('teilnehmen an', 'to take part in', '+ Dativ; separable', '{dat}', 'Ich nehme an dem Kurs teil.', 'I take part in the course.', 18),
  ('gehören zu', 'to belong to', '+ Dativ', '{dat}', 'Das gehört zu meinen Aufgaben.', 'That is part of my duties.', 19),
  ('sich treffen mit', 'to meet with', '+ Dativ', '{dat}', 'Ich treffe mich mit Freunden.', 'I am meeting with friends.', 20),
  ('sprechen über', 'to talk about', '+ Akkusativ', '{akk}', 'Wir sprechen über die Zukunft.', 'We talk about the future.', 21),
  ('sich beschäftigen mit', 'to occupy oneself with', '+ Dativ', '{dat}', 'Ich beschäftige mich mit Kunst.', 'I occupy myself with art.', 22),
  ('abhängen von', 'to depend on', '+ Dativ; separable', '{dat}', 'Das hängt vom Wetter ab.', 'That depends on the weather.', 23),
  ('sich unterhalten über', 'to converse about', '+ Akkusativ', '{akk}', 'Wir unterhalten uns über das Buch.', 'We converse about the book.', 24),
  ('träumen von', 'to dream of', '+ Dativ', '{dat}', 'Ich träume von einer Reise.', 'I dream of a trip.', 25),
  ('sich fürchten vor', 'to be afraid of', '+ Dativ', '{dat}', 'Das Kind fürchtet sich vor dem Hund.', 'The child is afraid of the dog.', 26),
  ('sich verlieben in', 'to fall in love with', '+ Akkusativ', '{akk}', 'Er hat sich in sie verliebt.', 'He fell in love with her.', 27),
  ('schützen vor', 'to protect from', '+ Dativ', '{dat}', 'Die Creme schützt vor der Sonne.', 'The cream protects from the sun.', 28),
  ('Angst haben vor', 'to be afraid of', '+ Dativ', '{dat}', 'Ich habe Angst vor Spinnen.', 'I am afraid of spiders.', 29),
  ('sich bedanken für', 'to thank for', '+ Akkusativ', '{akk}', 'Ich bedanke mich für die Hilfe.', 'I thank you for the help.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 12: Connectors (advanced)
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B1 · Connectors (advanced)', 'Linking ideas in speech and writing', 'B1', true, 12)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('obwohl', 'although', 'verb to the end', '{}', 'Obwohl es regnet, gehen wir raus.', 'Although it is raining, we go out.', 1),
  ('während', 'while / during', '', '{}', 'Während ich koche, hörst du Musik.', 'While I cook, you listen to music.', 2),
  ('bevor', 'before', '', '{}', 'Bevor ich gehe, rufe ich an.', 'Before I leave, I will call.', 3),
  ('nachdem', 'after', '', '{}', 'Nachdem ich gegessen hatte, ging ich.', 'After I had eaten, I left.', 4),
  ('seitdem', 'since (then)', '', '{}', 'Seitdem ich hier wohne, bin ich glücklich.', 'Since I have lived here, I am happy.', 5),
  ('damit', 'so that', 'purpose', '{}', 'Ich lerne, damit ich die Prüfung bestehe.', 'I study so that I pass the exam.', 6),
  ('um … zu', 'in order to', '+ Infinitiv', '{}', 'Ich lerne, um die Prüfung zu bestehen.', 'I study in order to pass the exam.', 7),
  ('falls', 'in case / if', '', '{}', 'Falls es regnet, bleiben wir hier.', 'In case it rains, we stay here.', 8),
  ('sobald', 'as soon as', '', '{}', 'Sobald ich fertig bin, komme ich.', 'As soon as I am done, I will come.', 9),
  ('solange', 'as long as', '', '{}', 'Solange du hilfst, schaffen wir das.', 'As long as you help, we will manage.', 10),
  ('je … desto', 'the … the', 'je mehr, desto besser', '{}', 'Je mehr ich übe, desto besser werde ich.', 'The more I practise, the better I get.', 11),
  ('entweder … oder', 'either … or', '', '{}', 'Entweder wir gehen oder wir bleiben.', 'Either we go or we stay.', 12),
  ('weder … noch', 'neither … nor', '', '{}', 'Ich mag weder Tee noch Kaffee.', 'I like neither tea nor coffee.', 13),
  ('zwar … aber', 'admittedly … but', '', '{}', 'Es ist zwar teuer, aber gut.', 'It is admittedly expensive, but good.', 14),
  ('jedoch', 'however', '', '{}', 'Das Hotel war schön, jedoch laut.', 'The hotel was nice, however loud.', 15),
  ('außerdem', 'furthermore / besides', '', '{}', 'Es ist teuer. Außerdem ist es weit.', 'It is expensive. Besides, it is far.', 16),
  ('trotzdem', 'nevertheless', '', '{}', 'Es war spät. Trotzdem blieb ich.', 'It was late. Nevertheless I stayed.', 17),
  ('dennoch', 'nonetheless', '', '{}', 'Es war schwer, dennoch habe ich es geschafft.', 'It was hard, nonetheless I managed it.', 18),
  ('schließlich', 'finally / after all', '', '{}', 'Schließlich haben wir uns geeinigt.', 'Finally we reached an agreement.', 19),
  ('beziehungsweise', 'or rather / respectively', 'abbr. bzw.', '{}', 'Er kommt am Montag beziehungsweise Dienstag.', 'He comes on Monday or rather Tuesday.', 20),
  ('im Gegensatz dazu', 'in contrast', '', '{}', 'Im Gegensatz dazu ist das Land billig.', 'In contrast, the countryside is cheap.', 21),
  ('deshalb', 'therefore', '', '{}', 'Es regnet, deshalb bleibe ich zu Hause.', 'It is raining, therefore I stay home.', 22),
  ('daher', 'therefore / hence', '', '{}', 'Er war krank, daher kam er nicht.', 'He was ill, hence he did not come.', 23),
  ('sowohl … als auch', 'both … and', '', '{}', 'Sowohl er als auch sie kommen.', 'Both he and she are coming.', 24),
  ('einerseits … andererseits', 'on one hand … on the other', '', '{}', 'Einerseits gut, andererseits teuer.', 'On the one hand good, on the other expensive.', 25),
  ('zum einen … zum anderen', 'firstly … secondly', '', '{}', 'Zum einen ist es schnell, zum anderen billig.', 'Firstly it is fast, secondly cheap.', 26),
  ('das heißt', 'that is / i.e.', 'abbr. d. h.', '{}', 'Er kommt spät, das heißt nach acht.', 'He comes late, that is after eight.', 27),
  ('vor allem', 'above all', '', '{}', 'Vor allem das Wetter war toll.', 'Above all the weather was great.', 28),
  ('zum Schluss', 'in conclusion / finally', '', '{}', 'Zum Schluss möchte ich danken.', 'In conclusion I would like to say thanks.', 29),
  ('aus diesem Grund', 'for this reason', '', '{}', 'Aus diesem Grund bleibe ich hier.', 'For this reason I am staying here.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- Fertig: 12 B1-Decks (verdichtet), additiv zu A1/A2.

