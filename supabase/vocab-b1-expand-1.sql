-- ============================================================================
-- B1 VOKABEL-AUSBAU · Batch 1 (ADD-ONLY, 144 neue Karten)
-- ----------------------------------------------------------------------------
-- Quelldatei in Standardform; auszufuehren ist vocab-b1-expand-1-safe.sql
-- (Dollar-Quoting, damit Smart-Quotes/Autokorrektur beim Einfuegen nichts zerstoert).
-- Add-only: loescht nichts, haengt nur an bestehende B1-Decks an (sort_order ab 101).
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';


-- ---------------------------------------------------------------------------
-- B1 · Opinions & discussion
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Behauptung', 'claim / assertion', '', '{}', 'Diese Behauptung ist nicht bewiesen.', 'This claim is not proven.', 101),
  ('die Schlussfolgerung', 'conclusion', '', '{}', 'Ich ziehe daraus eine klare Schlussfolgerung.', 'I draw a clear conclusion from this.', 102),
  ('der Gegner', 'opponent', '', '{}', 'Die Gegner des Plans sind in der Mehrheit.', 'The opponents of the plan are in the majority.', 103),
  ('das Missverständnis', 'misunderstanding', '', '{}', 'Das war nur ein kleines Missverständnis.', 'That was just a small misunderstanding.', 104),
  ('der Kompromiss', 'compromise', '', '{}', 'Am Ende finden wir einen Kompromiss.', 'In the end we find a compromise.', 105),
  ('die Absicht', 'intention', '', '{}', 'Es war nicht meine Absicht, dich zu stören.', 'It was not my intention to disturb you.', 106),
  ('der Zusammenhang', 'connection / context', '', '{}', 'Ich sehe keinen Zusammenhang zwischen den Themen.', 'I see no connection between the topics.', 107),
  ('der Widerspruch', 'contradiction', '', '{}', 'In seiner Aussage gibt es einen Widerspruch.', 'There is a contradiction in his statement.', 108),
  ('bezweifeln', 'to doubt', '', '{}', 'Ich bezweifle, dass das funktioniert.', 'I doubt that this works.', 109),
  ('übertreiben', 'to exaggerate', '', '{}', 'Du übertreibst mal wieder.', 'You are exaggerating again.', 110),
  ('annehmen', 'to assume', 'separable', '{}', 'Ich nehme an, dass er zu spät kommt.', 'I assume that he will be late.', 111),
  ('vermuten', 'to suspect / presume', '', '{}', 'Wir vermuten einen Fehler im System.', 'We suspect an error in the system.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Opinions & discussion'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Media & internet
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Software', 'software', '', '{}', 'Die neue Software läuft sehr stabil.', 'The new software runs very stably.', 101),
  ('die Festplatte', 'hard drive', '', '{}', 'Meine Festplatte ist fast voll.', 'My hard drive is almost full.', 102),
  ('der Browser', 'browser', '', '{}', 'Öffne die Seite in einem anderen Browser.', 'Open the page in another browser.', 103),
  ('die Startseite', 'homepage / start page', '', '{}', 'Auf der Startseite findest du die Neuigkeiten.', 'On the homepage you find the news.', 104),
  ('der Datenschutz', 'data protection / privacy', '', '{}', 'Datenschutz ist im Internet sehr wichtig.', 'Data protection is very important on the internet.', 105),
  ('der Virus', 'virus (computer)', '', '{}', 'Ein Virus hat meinen Computer infiziert.', 'A virus has infected my computer.', 106),
  ('das Betriebssystem', 'operating system', '', '{}', 'Welches Betriebssystem benutzt du?', 'Which operating system do you use?', 107),
  ('die Tastatur', 'keyboard', '', '{}', 'Die Tastatur ist kaputt.', 'The keyboard is broken.', 108),
  ('der Anhang', 'attachment', '', '{}', 'Ich schicke dir das Foto im Anhang.', 'I am sending you the photo as an attachment.', 109),
  ('das WLAN', 'wifi', '', '{}', 'Das WLAN im Hotel ist kostenlos.', 'The wifi in the hotel is free.', 110),
  ('die Aktualisierung', 'update', '', '{}', 'Die Aktualisierung dauert ein paar Minuten.', 'The update takes a few minutes.', 111),
  ('benutzerfreundlich', 'user-friendly', '', '{}', 'Die App ist sehr benutzerfreundlich.', 'The app is very user-friendly.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Media & internet'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Environment & society
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Nachhaltigkeit', 'sustainability', '', '{}', 'Nachhaltigkeit wird immer wichtiger.', 'Sustainability is becoming more and more important.', 101),
  ('die Erderwärmung', 'global warming', '', '{}', 'Die Erderwärmung bedroht viele Tierarten.', 'Global warming threatens many animal species.', 102),
  ('der Treibhauseffekt', 'greenhouse effect', '', '{}', 'Der Treibhauseffekt verstärkt den Klimawandel.', 'The greenhouse effect intensifies climate change.', 103),
  ('die Spende', 'donation', '', '{}', 'Mit einer Spende kann man viel helfen.', 'With a donation you can help a lot.', 104),
  ('die Demonstration', 'protest / demonstration', '', '{}', 'Tausende Menschen kamen zur Demonstration.', 'Thousands of people came to the demonstration.', 105),
  ('die Menschenrechte', 'human rights', 'plural', '{}', 'Die Menschenrechte gelten für alle.', 'Human rights apply to everyone.', 106),
  ('die Gleichberechtigung', 'equal rights / equality', '', '{}', 'Wir kämpfen für die Gleichberechtigung.', 'We are fighting for equal rights.', 107),
  ('der Flüchtling', 'refugee', '', '{}', 'Die Stadt hilft vielen Flüchtlingen.', 'The city helps many refugees.', 108),
  ('die Mehrheit', 'majority', '', '{}', 'Die Mehrheit stimmt dem Vorschlag zu.', 'The majority agrees with the proposal.', 109),
  ('die Minderheit', 'minority', '', '{}', 'Eine kleine Minderheit ist dagegen.', 'A small minority is against it.', 110),
  ('der Bürger', 'citizen', '', '{}', 'Jeder Bürger darf wählen.', 'Every citizen is allowed to vote.', 111),
  ('die Kriminalität', 'crime', '', '{}', 'In der Stadt sinkt die Kriminalität.', 'Crime is falling in the city.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Environment & society'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Work & career
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Weiterbildung', 'further training', '', '{}', 'Die Firma bezahlt meine Weiterbildung.', 'The company pays for my further training.', 101),
  ('das Praktikum', 'internship', '', '{}', 'Sie macht ein Praktikum bei einer Bank.', 'She is doing an internship at a bank.', 102),
  ('die Probezeit', 'probation period', '', '{}', 'Nach der Probezeit bekommt er einen festen Vertrag.', 'After the probation period he gets a permanent contract.', 103),
  ('die Kündigungsfrist', 'notice period', '', '{}', 'Meine Kündigungsfrist beträgt drei Monate.', 'My notice period is three months.', 104),
  ('die Gewerkschaft', 'trade union', '', '{}', 'Die Gewerkschaft fordert mehr Lohn.', 'The trade union demands higher wages.', 105),
  ('die Führungskraft', 'executive / manager', '', '{}', 'Als Führungskraft trägt sie viel Verantwortung.', 'As a manager she carries a lot of responsibility.', 106),
  ('der Umsatz', 'revenue / turnover', '', '{}', 'Der Umsatz ist dieses Jahr gestiegen.', 'Revenue has risen this year.', 107),
  ('das Arbeitszeugnis', 'job reference / letter of reference', '', '{}', 'Zum Schluss bekommt man ein Arbeitszeugnis.', 'At the end you receive a letter of reference.', 108),
  ('die Frist', 'deadline', '', '{}', 'Wir müssen die Frist unbedingt einhalten.', 'We really have to meet the deadline.', 109),
  ('der Zeitdruck', 'time pressure', '', '{}', 'Unter Zeitdruck mache ich mehr Fehler.', 'Under time pressure I make more mistakes.', 110),
  ('die Zusammenarbeit', 'cooperation / teamwork', '', '{}', 'Die Zusammenarbeit im Team funktioniert gut.', 'The cooperation in the team works well.', 111),
  ('belastbar', 'resilient / able to work under pressure', '', '{}', 'Für diesen Job muss man belastbar sein.', 'For this job you have to be resilient.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Work & career'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Health & lifestyle
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Krankenkasse', 'health insurance (fund)', '', '{}', 'Die Krankenkasse zahlt die Behandlung.', 'The health insurance pays for the treatment.', 101),
  ('der Facharzt', 'specialist (doctor)', '', '{}', 'Der Hausarzt schickt mich zum Facharzt.', 'The family doctor sends me to a specialist.', 102),
  ('die Nebenwirkung', 'side effect', '', '{}', 'Das Medikament hat kaum Nebenwirkungen.', 'The medication has hardly any side effects.', 103),
  ('die Beschwerden', 'complaints / symptoms', 'plural', '{}', 'Seit gestern habe ich starke Beschwerden.', 'Since yesterday I have had strong symptoms.', 104),
  ('die Genesung', 'recovery', '', '{}', 'Ich wünsche dir gute Genesung!', 'I wish you a good recovery!', 105),
  ('das Immunsystem', 'immune system', '', '{}', 'Sport stärkt das Immunsystem.', 'Sport strengthens the immune system.', 106),
  ('die Achtsamkeit', 'mindfulness', '', '{}', 'Achtsamkeit hilft gegen Stress.', 'Mindfulness helps against stress.', 107),
  ('der Burnout', 'burnout', '', '{}', 'Nach dem Burnout arbeitet er weniger.', 'After the burnout he works less.', 108),
  ('die Vorbeugung', 'prevention', '', '{}', 'Zur Vorbeugung sollte man sich gesund ernähren.', 'For prevention you should eat healthily.', 109),
  ('ausgewogen', 'balanced', '', '{}', 'Eine ausgewogene Ernährung ist wichtig.', 'A balanced diet is important.', 110),
  ('die Ausdauer', 'stamina / endurance', '', '{}', 'Beim Laufen trainiert man die Ausdauer.', 'When running you train your stamina.', 111),
  ('schädlich', 'harmful', '', '{}', 'Zu viel Zucker ist schädlich.', 'Too much sugar is harmful.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Health & lifestyle'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Education & studies
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Dozent', 'lecturer', '', '{}', 'Der Dozent erklärt das Thema sehr gut.', 'The lecturer explains the topic very well.', 101),
  ('das Semester', 'semester / term', '', '{}', 'Im nächsten Semester belege ich Statistik.', 'Next semester I take statistics.', 102),
  ('das Referat', 'presentation (academic)', '', '{}', 'Morgen halte ich ein Referat über Klima.', 'Tomorrow I am giving a presentation on climate.', 103),
  ('die Klausur', 'exam (written, at university)', '', '{}', 'Die Klausur dauert zwei Stunden.', 'The exam lasts two hours.', 104),
  ('der Studiengang', 'course of study / degree programme', '', '{}', 'Mein Studiengang heißt Informatik.', 'My degree programme is called computer science.', 105),
  ('die Gebühr', 'fee', '', '{}', 'An der Uni gibt es eine kleine Gebühr.', 'At the university there is a small fee.', 106),
  ('die Fremdsprache', 'foreign language', '', '{}', 'Deutsch ist für mich eine Fremdsprache.', 'German is a foreign language for me.', 107),
  ('die Grammatik', 'grammar', '', '{}', 'Die deutsche Grammatik ist nicht leicht.', 'German grammar is not easy.', 108),
  ('der Wortschatz', 'vocabulary', '', '{}', 'Ich erweitere jeden Tag meinen Wortschatz.', 'I expand my vocabulary every day.', 109),
  ('die Muttersprache', 'native language', '', '{}', 'Ihre Muttersprache ist Spanisch.', 'Her native language is Spanish.', 110),
  ('der Anfänger', 'beginner', '', '{}', 'Der Kurs ist für Anfänger geeignet.', 'The course is suitable for beginners.', 111),
  ('ehrgeizig', 'ambitious', '', '{}', 'Sie ist eine sehr ehrgeizige Studentin.', 'She is a very ambitious student.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Education & studies'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Relationships & emotions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Zuneigung', 'affection', '', '{}', 'Sie zeigt ihm ihre Zuneigung.', 'She shows him her affection.', 101),
  ('die Rücksicht', 'consideration', 'Rücksicht nehmen auf', '{}', 'Bitte nimm Rücksicht auf die Nachbarn.', 'Please be considerate of the neighbours.', 102),
  ('die Geduld', 'patience', '', '{}', 'Mit Kindern braucht man viel Geduld.', 'With children you need a lot of patience.', 103),
  ('der Respekt', 'respect', '', '{}', 'Sie behandeln sich mit Respekt.', 'They treat each other with respect.', 104),
  ('die Nähe', 'closeness / proximity', '', '{}', 'Er sucht die Nähe seiner Familie.', 'He seeks the closeness of his family.', 105),
  ('die Trennung', 'separation / break-up', '', '{}', 'Die Trennung war für beide schwer.', 'The break-up was hard for both of them.', 106),
  ('die Scheidung', 'divorce', '', '{}', 'Nach der Scheidung zog sie um.', 'After the divorce she moved away.', 107),
  ('die Versöhnung', 'reconciliation', '', '{}', 'Nach dem Streit kam es zur Versöhnung.', 'After the argument they reconciled.', 108),
  ('der Kummer', 'grief / sorrow', '', '{}', 'Sie hat großen Kummer.', 'She is deeply troubled.', 109),
  ('die Sorge', 'worry / concern', 'sich Sorgen machen', '{}', 'Ich mache mir Sorgen um dich.', 'I am worried about you.', 110),
  ('schätzen', 'to appreciate / value', '', '{}', 'Ich schätze deine Ehrlichkeit.', 'I appreciate your honesty.', 111),
  ('zuverlässig', 'reliable', '', '{}', 'Er ist ein zuverlässiger Freund.', 'He is a reliable friend.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Relationships & emotions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Money & consumption
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Überweisung', 'bank transfer', '', '{}', 'Die Miete zahle ich per Überweisung.', 'I pay the rent by bank transfer.', 101),
  ('die Rente', 'pension', '', '{}', 'Mit 67 geht sie in Rente.', 'At 67 she retires.', 102),
  ('die Zinsen', 'interest', 'plural', '{}', 'Für den Kredit zahlt man Zinsen.', 'For the loan you pay interest.', 103),
  ('die Inflation', 'inflation', '', '{}', 'Wegen der Inflation steigen die Preise.', 'Because of inflation prices are rising.', 104),
  ('die Währung', 'currency', '', '{}', 'Die Währung in Japan ist der Yen.', 'The currency in Japan is the yen.', 105),
  ('die Anzahlung', 'down payment', '', '{}', 'Für das Auto leiste ich eine Anzahlung.', 'For the car I make a down payment.', 106),
  ('die Ratenzahlung', 'payment in instalments', '', '{}', 'Das Sofa kaufe ich auf Ratenzahlung.', 'I am buying the sofa in instalments.', 107),
  ('der Kontoauszug', 'bank statement', '', '{}', 'Auf dem Kontoauszug sehe ich alle Buchungen.', 'On the bank statement I see all transactions.', 108),
  ('der Geldautomat', 'ATM / cash machine', '', '{}', 'Am Geldautomaten hebe ich Geld ab.', 'At the ATM I withdraw money.', 109),
  ('die Nachfrage', 'demand', '', '{}', 'Die Nachfrage nach Wohnungen ist hoch.', 'The demand for flats is high.', 110),
  ('sich lohnen', 'to be worth it', '', '{}', 'Der Vergleich der Preise lohnt sich.', 'Comparing the prices is worth it.', 111),
  ('verschwenden', 'to waste', '', '{}', 'Wir sollten kein Geld verschwenden.', 'We should not waste money.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Money & consumption'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Travel & culture
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('das Wahrzeichen', 'landmark', '', '{}', 'Der Turm ist das Wahrzeichen der Stadt.', 'The tower is the landmark of the city.', 101),
  ('die Führung', 'guided tour', '', '{}', 'Wir machen eine Führung durch das Schloss.', 'We are taking a guided tour of the castle.', 102),
  ('die Pauschalreise', 'package holiday', '', '{}', 'Eine Pauschalreise ist oft günstiger.', 'A package holiday is often cheaper.', 103),
  ('das Fernweh', 'wanderlust', '', '{}', 'Im Winter bekomme ich Fernweh.', 'In winter I get wanderlust.', 104),
  ('der Brauch', 'custom / tradition', '', '{}', 'Dieser Brauch ist sehr alt.', 'This custom is very old.', 105),
  ('das Fest', 'festival / celebration', '', '{}', 'Im Sommer gibt es ein großes Fest.', 'In summer there is a big festival.', 106),
  ('die Mentalität', 'mentality', '', '{}', 'Jedes Land hat seine eigene Mentalität.', 'Every country has its own mentality.', 107),
  ('die Vielfalt', 'diversity / variety', '', '{}', 'Die kulturelle Vielfalt gefällt mir.', 'I like the cultural diversity.', 108),
  ('auswandern', 'to emigrate', 'separable', '{}', 'Viele Menschen wandern nach Kanada aus.', 'Many people emigrate to Canada.', 109),
  ('die Staatsangehörigkeit', 'nationality / citizenship', '', '{}', 'Sie hat die deutsche Staatsangehörigkeit.', 'She has German citizenship.', 110),
  ('gastfreundlich', 'hospitable', '', '{}', 'Die Menschen dort sind sehr gastfreundlich.', 'The people there are very hospitable.', 111),
  ('weltoffen', 'cosmopolitan / open-minded', '', '{}', 'Die Stadt ist jung und weltoffen.', 'The city is young and cosmopolitan.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Travel & culture'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Polite & hypothetical
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('Dürfte ich …?', 'Might I …? (very polite)', '', '{}', 'Dürfte ich Sie kurz stören?', 'Might I bother you for a moment?', 101),
  ('Wäre es möglich …?', 'Would it be possible …?', '', '{}', 'Wäre es möglich, den Termin zu verschieben?', 'Would it be possible to move the appointment?', 102),
  ('an Ihrer Stelle', 'if I were you (formal)', '', '{}', 'An Ihrer Stelle würde ich warten.', 'If I were you, I would wait.', 103),
  ('es wäre besser', 'it would be better', '', '{}', 'Es wäre besser, früher zu gehen.', 'It would be better to leave earlier.', 104),
  ('angenommen', 'supposing / assuming', '', '{}', 'Angenommen, es regnet, was machen wir dann?', 'Supposing it rains, what do we do then?', 105),
  ('es sei denn', 'unless', '', '{}', 'Wir gehen spazieren, es sei denn, es regnet.', 'We will go for a walk, unless it rains.', 106),
  ('vorausgesetzt', 'provided that', '', '{}', 'Ich komme mit, vorausgesetzt, ich habe Zeit.', 'I will come along, provided that I have time.', 107),
  ('notfalls', 'if necessary / in an emergency', '', '{}', 'Notfalls nehmen wir ein Taxi.', 'If necessary we will take a taxi.', 108),
  ('sozusagen', 'so to speak', '', '{}', 'Er ist sozusagen mein zweiter Vater.', 'He is, so to speak, my second father.', 109),
  ('die Empfehlung', 'recommendation', '', '{}', 'Auf ihre Empfehlung hin lese ich das Buch.', 'On her recommendation I am reading the book.', 110),
  ('die Vermutung', 'assumption / guess', '', '{}', 'Meine Vermutung war richtig.', 'My assumption was correct.', 111),
  ('die Möglichkeit', 'possibility / option', '', '{}', 'Es gibt noch eine andere Möglichkeit.', 'There is another possibility.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Polite & hypothetical'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Verbs + prepositions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('bestehen aus', 'to consist of', '+ Dativ', '{}', 'Das Team besteht aus fünf Personen.', 'The team consists of five people.', 101),
  ('bestehen auf', 'to insist on', '+ Dativ', '{}', 'Sie besteht auf einer Antwort.', 'She insists on an answer.', 102),
  ('verzichten auf', 'to do without / give up', '+ Akkusativ', '{}', 'Ich verzichte auf Zucker.', 'I am giving up sugar.', 103),
  ('rechnen mit', 'to count on / expect', '+ Dativ', '{}', 'Wir rechnen mit vielen Gästen.', 'We are expecting many guests.', 104),
  ('hinweisen auf', 'to point out', '+ Akkusativ, separable', '{}', 'Der Lehrer weist auf den Fehler hin.', 'The teacher points out the mistake.', 105),
  ('leiden unter', 'to suffer from', '+ Dativ', '{}', 'Viele leiden unter dem Lärm.', 'Many suffer from the noise.', 106),
  ('sich eignen für', 'to be suitable for', '+ Akkusativ', '{}', 'Der Film eignet sich für Kinder.', 'The film is suitable for children.', 107),
  ('sich einsetzen für', 'to stand up for / advocate', '+ Akkusativ, separable', '{}', 'Sie setzt sich für den Umweltschutz ein.', 'She advocates for environmental protection.', 108),
  ('reagieren auf', 'to react to', '+ Akkusativ', '{}', 'Er reagiert schnell auf E-Mails.', 'He reacts quickly to emails.', 109),
  ('sich beziehen auf', 'to refer to', '+ Akkusativ', '{}', 'Ich beziehe mich auf Ihren Brief.', 'I am referring to your letter.', 110),
  ('warnen vor', 'to warn about', '+ Dativ', '{}', 'Die Polizei warnt vor Dieben.', 'The police warn about thieves.', 111),
  ('profitieren von', 'to benefit from', '+ Dativ', '{}', 'Alle profitieren von der neuen Regel.', 'Everyone benefits from the new rule.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Verbs + prepositions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B1 · Connectors (advanced)
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('indem', 'by (doing) …', 'subordinate: verb at end', '{}', 'Man lernt, indem man Fehler macht.', 'You learn by making mistakes.', 101),
  ('sodass', 'so that (result)', 'subordinate: verb at end', '{}', 'Es schneite stark, sodass die Schule ausfiel.', 'It snowed heavily, so that school was cancelled.', 102),
  ('als ob', 'as if', 'often + Konjunktiv II', '{}', 'Er tut so, als ob er alles wüsste.', 'He acts as if he knew everything.', 103),
  ('wohingegen', 'whereas', '', '{}', 'Ich mag Tee, wohingegen er Kaffee trinkt.', 'I like tea, whereas he drinks coffee.', 104),
  ('aufgrund', 'due to / because of', '+ Genitiv', '{}', 'Aufgrund des Wetters bleiben wir zu Hause.', 'Due to the weather we are staying at home.', 105),
  ('infolge', 'as a result of', '+ Genitiv', '{}', 'Infolge des Unfalls gab es einen Stau.', 'As a result of the accident there was a traffic jam.', 106),
  ('anstatt zu', 'instead of (doing)', '+ Infinitiv', '{}', 'Anstatt zu lernen, sieht er fern.', 'Instead of studying, he watches TV.', 107),
  ('ohne zu', 'without (doing)', '+ Infinitiv', '{}', 'Sie ging, ohne etwas zu sagen.', 'She left without saying anything.', 108),
  ('folglich', 'consequently', '', '{}', 'Der Zug fiel aus, folglich kam ich zu spät.', 'The train was cancelled, consequently I was late.', 109),
  ('hingegen', 'on the other hand / however', '', '{}', 'Ich bleibe hier, sie hingegen fährt weg.', 'I am staying here, she however is going away.', 110),
  ('andernfalls', 'otherwise', '', '{}', 'Beeil dich, andernfalls verpassen wir den Bus.', 'Hurry up, otherwise we will miss the bus.', 111),
  ('nämlich', 'namely / that is because', '', '{}', 'Ich kann nicht kommen, ich bin nämlich krank.', 'I cannot come, that is because I am ill.', 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B1 · Connectors (advanced)'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- Kontrolle: B1-Kartenzahl gesamt
select count(*) as b1_karten
from public.fc_cards c join public.fc_decks d on d.id = c.deck_id
where d.level = 'B1';
