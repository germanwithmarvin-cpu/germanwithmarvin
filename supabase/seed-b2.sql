-- ============================================================================
-- B2 DECKS — German Simplified Flashcards
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run". Selbst-genügsam.
-- ADDITIV: löscht NUR B2-Decks (A1/A2/B1 bleiben), legt B2 neu an (~30 je Thema).
-- Danach verb-markers.sql ausführen, damit die Verb-Marker gesetzt werden.
-- ============================================================================

alter table public.fc_cards       add column if not exists example    text not null default '';
alter table public.fc_cards       add column if not exists example_en text not null default '';
alter table public.fc_card_states add column if not exists flagged    boolean not null default false;

delete from public.fc_decks
where owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com')
  and level = 'B2';


-- ---------------------------------------------------------------------------
-- Deck 1: Politics & state
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Politics & state', 'Politics, government and the state', 'B2', true, 1)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Regierung', 'the government', 'pl. die Regierungen', '{}', 'Die Regierung plant Reformen.', 'The government is planning reforms.', 1),
  ('der Staat', 'the state', 'pl. die Staaten', '{}', 'Der Staat finanziert die Schulen.', 'The state funds the schools.', 2),
  ('die Demokratie', 'the democracy', 'pl. die Demokratien', '{}', 'Deutschland ist eine Demokratie.', 'Germany is a democracy.', 3),
  ('die Partei', 'the (political) party', 'pl. die Parteien', '{}', 'Welche Partei wählst du?', 'Which party do you vote for?', 4),
  ('die Wahl', 'the election', 'pl. die Wahlen', '{}', 'Die Wahl findet im Herbst statt.', 'The election takes place in autumn.', 5),
  ('der Bürger', 'the citizen', 'pl. die Bürger', '{}', 'Jeder Bürger hat Rechte.', 'Every citizen has rights.', 6),
  ('das Parlament', 'the parliament', 'pl. die Parlamente', '{}', 'Das Parlament beschließt das Gesetz.', 'Parliament passes the law.', 7),
  ('der Minister', 'the minister', 'pl. die Minister', '{}', 'Der Minister hält eine Rede.', 'The minister gives a speech.', 8),
  ('das Gesetz', 'the law', 'pl. die Gesetze', '{}', 'Das neue Gesetz gilt ab Januar.', 'The new law applies from January.', 9),
  ('die Verfassung', 'the constitution', 'pl. die Verfassungen', '{}', 'Die Verfassung schützt die Grundrechte.', 'The constitution protects basic rights.', 10),
  ('die Mehrheit', 'the majority', 'pl. die Mehrheiten', '{}', 'Die Mehrheit stimmt zu.', 'The majority agrees.', 11),
  ('die Opposition', 'the opposition', '', '{}', 'Die Opposition kritisiert den Plan.', 'The opposition criticises the plan.', 12),
  ('die Macht', 'the power', 'pl. die Mächte', '{}', 'Macht kann gefährlich sein.', 'Power can be dangerous.', 13),
  ('der Einfluss', 'the influence', 'pl. die Einflüsse', '{}', 'Sie hat großen Einfluss.', 'She has great influence.', 14),
  ('die Freiheit', 'the freedom', 'pl. die Freiheiten', '{}', 'Freiheit ist ein Grundrecht.', 'Freedom is a basic right.', 15),
  ('das Recht', 'the right / law', 'pl. die Rechte', '{}', 'Jeder hat das Recht auf Bildung.', 'Everyone has the right to education.', 16),
  ('die Pflicht', 'the duty / obligation', 'pl. die Pflichten', '{}', 'Wählen ist keine Pflicht.', 'Voting is not an obligation.', 17),
  ('der Frieden', 'the peace', '', '{}', 'Alle hoffen auf Frieden.', 'Everyone hopes for peace.', 18),
  ('der Konflikt', 'the conflict', 'pl. die Konflikte', '{}', 'Der Konflikt eskaliert.', 'The conflict is escalating.', 19),
  ('die Reform', 'the reform', 'pl. die Reformen', '{}', 'Die Reform ist umstritten.', 'The reform is controversial.', 20),
  ('die Abstimmung', 'the vote / ballot', 'pl. die Abstimmungen', '{}', 'Die Abstimmung war knapp.', 'The vote was close.', 21),
  ('regieren', 'to govern', '', '{verb}', 'Die Partei regiert seit zwei Jahren.', 'The party has governed for two years.', 22),
  ('wählen', 'to vote / elect', '', '{verb}', 'Morgen gehen wir wählen.', 'Tomorrow we go to vote.', 23),
  ('abstimmen', 'to vote (on)', 'separable; über + Akk', '{verb}', 'Wir stimmen über den Vorschlag ab.', 'We vote on the proposal.', 24),
  ('verhandeln', 'to negotiate', 'über + Akk', '{verb}', 'Die Länder verhandeln über den Vertrag.', 'The countries negotiate the treaty.', 25),
  ('durchsetzen', 'to push through / enforce', 'separable', '{verb}', 'Sie setzt ihre Ideen durch.', 'She pushes her ideas through.', 26),
  ('vertreten', 'to represent', 'vertritt, vertrat, vertreten', '{verb}', 'Der Politiker vertritt die Region.', 'The politician represents the region.', 27),
  ('fördern', 'to promote / support', '', '{verb}', 'Der Staat fördert die Forschung.', 'The state promotes research.', 28),
  ('politisch', 'political', '', '{adjective}', 'Das ist eine politische Frage.', 'That is a political question.', 29),
  ('umstritten', 'controversial', '', '{adjective}', 'Die Entscheidung ist umstritten.', 'The decision is controversial.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 2: Economy & business
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Economy & business', 'Economy, markets and business', 'B2', true, 2)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Wirtschaft', 'the economy', '', '{}', 'Die Wirtschaft wächst langsam.', 'The economy is growing slowly.', 1),
  ('der Markt', 'the market', 'pl. die Märkte', '{}', 'Der Markt ist hart umkämpft.', 'The market is highly competitive.', 2),
  ('das Unternehmen', 'the company / enterprise', 'pl. die Unternehmen', '{}', 'Das Unternehmen expandiert.', 'The company is expanding.', 3),
  ('der Konzern', 'the corporation', 'pl. die Konzerne', '{}', 'Der Konzern hat tausende Mitarbeiter.', 'The corporation has thousands of employees.', 4),
  ('der Umsatz', 'the revenue / turnover', 'pl. die Umsätze', '{}', 'Der Umsatz ist gestiegen.', 'The revenue has risen.', 5),
  ('der Gewinn', 'the profit', 'pl. die Gewinne', '{}', 'Der Gewinn wird investiert.', 'The profit is being invested.', 6),
  ('die Investition', 'the investment', 'pl. die Investitionen', '{}', 'Die Investition lohnt sich.', 'The investment is worthwhile.', 7),
  ('der Wettbewerb', 'the competition', '', '{}', 'Der Wettbewerb ist intensiv.', 'The competition is intense.', 8),
  ('die Nachfrage', 'the demand', '', '{}', 'Die Nachfrage ist hoch.', 'Demand is high.', 9),
  ('das Angebot', 'the supply / offer', 'pl. die Angebote', '{}', 'Das Angebot bestimmt den Preis.', 'Supply determines the price.', 10),
  ('die Krise', 'the crisis', 'pl. die Krisen', '{}', 'Die Wirtschaft steckt in der Krise.', 'The economy is in crisis.', 11),
  ('die Inflation', 'the inflation', '', '{}', 'Die Inflation steigt weiter.', 'Inflation keeps rising.', 12),
  ('die Branche', 'the industry / sector', 'pl. die Branchen', '{}', 'Die Branche verändert sich schnell.', 'The sector is changing fast.', 13),
  ('der Kunde', 'the customer', 'pl. die Kunden', '{}', 'Der Kunde steht im Mittelpunkt.', 'The customer is the focus.', 14),
  ('der Mitarbeiter', 'the employee', 'pl. die Mitarbeiter', '{}', 'Die Mitarbeiter sind motiviert.', 'The employees are motivated.', 15),
  ('die Produktion', 'the production', '', '{}', 'Die Produktion läuft rund um die Uhr.', 'Production runs around the clock.', 16),
  ('der Handel', 'the trade / commerce', '', '{}', 'Der internationale Handel wächst.', 'International trade is growing.', 17),
  ('die Schulden', 'the debts', 'plural', '{}', 'Das Unternehmen hat hohe Schulden.', 'The company has high debts.', 18),
  ('investieren', 'to invest', 'in + Akk', '{verb}', 'Wir investieren in neue Technik.', 'We invest in new technology.', 19),
  ('produzieren', 'to produce', '', '{verb}', 'Die Fabrik produziert Autos.', 'The factory produces cars.', 20),
  ('exportieren', 'to export', '', '{verb}', 'Deutschland exportiert viele Waren.', 'Germany exports many goods.', 21),
  ('importieren', 'to import', '', '{verb}', 'Wir importieren Rohstoffe.', 'We import raw materials.', 22),
  ('steigen', 'to rise', 'steigt, stieg, ist gestiegen', '{verb}', 'Die Preise steigen.', 'Prices are rising.', 23),
  ('sinken', 'to fall / sink', 'sinkt, sank, ist gesunken', '{verb}', 'Die Nachfrage sinkt.', 'Demand is falling.', 24),
  ('sich lohnen', 'to be worthwhile', 'reflexive', '{verb}', 'Die Mühe lohnt sich.', 'The effort is worthwhile.', 25),
  ('verhandeln', 'to negotiate', 'über + Akk', '{verb}', 'Wir verhandeln über den Preis.', 'We negotiate the price.', 26),
  ('wirtschaftlich', 'economic(al)', '', '{adjective}', 'Die Lage ist wirtschaftlich schwierig.', 'The situation is economically difficult.', 27),
  ('rentabel', 'profitable', '', '{adjective}', 'Das Geschäft ist rentabel.', 'The business is profitable.', 28),
  ('die Steuer', 'the tax', 'pl. die Steuern', '{}', 'Unternehmen zahlen Steuern.', 'Companies pay taxes.', 29),
  ('der Vertrag', 'the contract', 'pl. die Verträge', '{}', 'Beide Seiten unterschreiben den Vertrag.', 'Both sides sign the contract.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 3: Science & technology
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Science & technology', 'Research, innovation and technology', 'B2', true, 3)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Wissenschaft', 'the science', 'pl. die Wissenschaften', '{}', 'Die Wissenschaft macht Fortschritte.', 'Science is making progress.', 1),
  ('die Forschung', 'the research', '', '{}', 'Die Forschung braucht Geld.', 'Research needs money.', 2),
  ('die Technologie', 'the technology', 'pl. die Technologien', '{}', 'Neue Technologie verändert den Alltag.', 'New technology changes daily life.', 3),
  ('die Entwicklung', 'the development', 'pl. die Entwicklungen', '{}', 'Die Entwicklung schreitet schnell voran.', 'The development is advancing quickly.', 4),
  ('das Experiment', 'the experiment', 'pl. die Experimente', '{}', 'Das Experiment war erfolgreich.', 'The experiment was successful.', 5),
  ('die Erfindung', 'the invention', 'pl. die Erfindungen', '{}', 'Das Internet war eine wichtige Erfindung.', 'The internet was an important invention.', 6),
  ('die Entdeckung', 'the discovery', 'pl. die Entdeckungen', '{}', 'Die Entdeckung war bahnbrechend.', 'The discovery was groundbreaking.', 7),
  ('das Ergebnis', 'the result', 'pl. die Ergebnisse', '{}', 'Die Ergebnisse sind eindeutig.', 'The results are clear.', 8),
  ('die Theorie', 'the theory', 'pl. die Theorien', '{}', 'Die Theorie wurde bestätigt.', 'The theory was confirmed.', 9),
  ('der Beweis', 'the proof / evidence', 'pl. die Beweise', '{}', 'Es fehlt der wissenschaftliche Beweis.', 'The scientific proof is missing.', 10),
  ('die Daten', 'the data', 'plural', '{}', 'Die Daten werden ausgewertet.', 'The data is being analysed.', 11),
  ('die Künstliche Intelligenz', 'artificial intelligence', 'abbr. KI', '{}', 'Künstliche Intelligenz wird immer wichtiger.', 'Artificial intelligence is becoming more important.', 12),
  ('der Roboter', 'the robot', 'pl. die Roboter', '{}', 'Der Roboter übernimmt die Arbeit.', 'The robot takes over the work.', 13),
  ('das Gerät', 'the device', 'pl. die Geräte', '{}', 'Das Gerät ist sehr leistungsfähig.', 'The device is very powerful.', 14),
  ('der Fortschritt', 'the progress', 'pl. die Fortschritte', '{}', 'Der technische Fortschritt ist enorm.', 'Technical progress is enormous.', 15),
  ('die Methode', 'the method', 'pl. die Methoden', '{}', 'Wir verwenden eine neue Methode.', 'We use a new method.', 16),
  ('untersuchen', 'to examine / investigate', '', '{verb}', 'Forscher untersuchen das Virus.', 'Researchers are investigating the virus.', 17),
  ('entwickeln', 'to develop', '', '{verb}', 'Sie entwickeln einen Impfstoff.', 'They are developing a vaccine.', 18),
  ('erforschen', 'to research / explore', '', '{verb}', 'Wir erforschen das Weltall.', 'We explore outer space.', 19),
  ('entdecken', 'to discover', '', '{verb}', 'Sie entdeckten einen neuen Planeten.', 'They discovered a new planet.', 20),
  ('beweisen', 'to prove', 'beweist, bewies, bewiesen', '{verb}', 'Die Studie beweist den Zusammenhang.', 'The study proves the connection.', 21),
  ('messen', 'to measure', 'misst, maß, gemessen', '{verb}', 'Wir messen die Temperatur.', 'We measure the temperature.', 22),
  ('analysieren', 'to analyse', '', '{verb}', 'Die Daten werden analysiert.', 'The data is analysed.', 23),
  ('ersetzen', 'to replace', '', '{verb}', 'Maschinen ersetzen viele Jobs.', 'Machines replace many jobs.', 24),
  ('wissenschaftlich', 'scientific', '', '{adjective}', 'Es gibt wissenschaftliche Beweise.', 'There is scientific evidence.', 25),
  ('technisch', 'technical', '', '{adjective}', 'Das ist ein technisches Problem.', 'That is a technical problem.', 26),
  ('digital', 'digital', '', '{adjective}', 'Die digitale Welt wächst.', 'The digital world is growing.', 27),
  ('komplex', 'complex', '', '{adjective}', 'Das System ist sehr komplex.', 'The system is very complex.', 28),
  ('die Studie', 'the study', 'pl. die Studien', '{}', 'Eine neue Studie zeigt das.', 'A new study shows this.', 29),
  ('der Versuch', 'the attempt / trial', 'pl. die Versuche', '{}', 'Der erste Versuch ist gescheitert.', 'The first attempt failed.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 4: Environment & climate
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Environment & climate', 'Climate, resources and sustainability', 'B2', true, 4)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('der Klimawandel', 'climate change', '', '{}', 'Der Klimawandel betrifft uns alle.', 'Climate change affects us all.', 1),
  ('die Erderwärmung', 'global warming', '', '{}', 'Die Erderwärmung schreitet voran.', 'Global warming is advancing.', 2),
  ('die Umweltverschmutzung', 'environmental pollution', '', '{}', 'Die Umweltverschmutzung nimmt zu.', 'Environmental pollution is increasing.', 3),
  ('der Treibhauseffekt', 'the greenhouse effect', '', '{}', 'Der Treibhauseffekt erwärmt die Erde.', 'The greenhouse effect warms the earth.', 4),
  ('die Emission', 'the emission', 'pl. die Emissionen', '{}', 'Wir müssen die Emissionen senken.', 'We must reduce emissions.', 5),
  ('die erneuerbare Energie', 'renewable energy', '', '{}', 'Erneuerbare Energie ist die Zukunft.', 'Renewable energy is the future.', 6),
  ('der Rohstoff', 'the raw material', 'pl. die Rohstoffe', '{}', 'Rohstoffe werden knapp.', 'Raw materials are becoming scarce.', 7),
  ('die Ressource', 'the resource', 'pl. die Ressourcen', '{}', 'Wir verschwenden Ressourcen.', 'We waste resources.', 8),
  ('die Nachhaltigkeit', 'the sustainability', '', '{}', 'Nachhaltigkeit ist ein zentrales Ziel.', 'Sustainability is a central goal.', 9),
  ('der Verbrauch', 'the consumption', '', '{}', 'Der Energieverbrauch ist hoch.', 'Energy consumption is high.', 10),
  ('die Katastrophe', 'the catastrophe', 'pl. die Katastrophen', '{}', 'Eine Naturkatastrophe droht.', 'A natural disaster is looming.', 11),
  ('die Folge', 'the consequence', 'pl. die Folgen', '{}', 'Die Folgen sind dramatisch.', 'The consequences are dramatic.', 12),
  ('die Maßnahme', 'the measure', 'pl. die Maßnahmen', '{}', 'Die Regierung ergreift Maßnahmen.', 'The government is taking measures.', 13),
  ('der Schutz', 'the protection', '', '{}', 'Der Schutz der Wälder ist wichtig.', 'The protection of forests is important.', 14),
  ('verursachen', 'to cause', '', '{verb}', 'Autos verursachen viel CO2.', 'Cars cause a lot of CO2.', 15),
  ('reduzieren', 'to reduce', '', '{verb}', 'Wir müssen den Müll reduzieren.', 'We must reduce waste.', 16),
  ('verschwenden', 'to waste', '', '{verb}', 'Wir verschwenden zu viel Wasser.', 'We waste too much water.', 17),
  ('schützen', 'to protect', 'vor + Dativ', '{verb}', 'Wir schützen die Umwelt.', 'We protect the environment.', 18),
  ('vermeiden', 'to avoid', 'vermeidet, vermied, vermieden', '{verb}', 'Wir vermeiden Plastik.', 'We avoid plastic.', 19),
  ('sich auswirken', 'to have an effect', 'auf + Akk; separable', '{verb}', 'Das wirkt sich auf das Klima aus.', 'That has an effect on the climate.', 20),
  ('bedrohen', 'to threaten', '', '{verb}', 'Der Klimawandel bedroht viele Arten.', 'Climate change threatens many species.', 21),
  ('umweltfreundlich', 'environmentally friendly', '', '{adjective}', 'Wir kaufen umweltfreundliche Produkte.', 'We buy environmentally friendly products.', 22),
  ('nachhaltig', 'sustainable', '', '{adjective}', 'Wir wirtschaften nachhaltig.', 'We operate sustainably.', 23),
  ('schädlich', 'harmful', 'für + Akk', '{adjective}', 'Abgase sind schädlich für die Gesundheit.', 'Exhaust fumes are harmful to health.', 24),
  ('knapp', 'scarce / tight', '', '{adjective}', 'Trinkwasser wird knapp.', 'Drinking water is becoming scarce.', 25),
  ('die Art', 'the species', 'pl. die Arten', '{}', 'Viele Arten sind bedroht.', 'Many species are endangered.', 26),
  ('das Aussterben', 'the extinction', '', '{}', 'Das Aussterben der Arten beschleunigt sich.', 'The extinction of species is accelerating.', 27),
  ('der Müll', 'the waste / rubbish', '', '{}', 'Wir trennen den Müll.', 'We separate the rubbish.', 28),
  ('die Energiewende', 'the energy transition', '', '{}', 'Die Energiewende kostet viel Geld.', 'The energy transition costs a lot of money.', 29),
  ('das Bewusstsein', 'the awareness', '', '{}', 'Das Umweltbewusstsein wächst.', 'Environmental awareness is growing.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 5: Culture, art & media
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Culture, art & media', 'Art, literature and the media', 'B2', true, 5)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Kunst', 'the art', 'pl. die Künste', '{}', 'Moderne Kunst polarisiert.', 'Modern art polarises people.', 1),
  ('das Kunstwerk', 'the work of art', 'pl. die Kunstwerke', '{}', 'Das Kunstwerk ist unbezahlbar.', 'The work of art is priceless.', 2),
  ('die Literatur', 'the literature', '', '{}', 'Er studiert deutsche Literatur.', 'He studies German literature.', 3),
  ('der Roman', 'the novel', 'pl. die Romane', '{}', 'Der Roman wurde verfilmt.', 'The novel was made into a film.', 4),
  ('der Autor', 'the author', 'pl. die Autoren', '{}', 'Der Autor liest aus seinem Buch.', 'The author reads from his book.', 5),
  ('das Gemälde', 'the painting', 'pl. die Gemälde', '{}', 'Das Gemälde hängt im Museum.', 'The painting hangs in the museum.', 6),
  ('die Aufführung', 'the performance', 'pl. die Aufführungen', '{}', 'Die Aufführung war ausverkauft.', 'The performance was sold out.', 7),
  ('das Publikum', 'the audience', '', '{}', 'Das Publikum war begeistert.', 'The audience was thrilled.', 8),
  ('die Kritik', 'the review / criticism', 'pl. die Kritiken', '{}', 'Der Film bekam gute Kritiken.', 'The film got good reviews.', 9),
  ('die Veröffentlichung', 'the publication / release', 'pl. -ungen', '{}', 'Die Veröffentlichung ist nächste Woche.', 'The release is next week.', 10),
  ('die Meinungsfreiheit', 'freedom of speech', '', '{}', 'Meinungsfreiheit ist ein Grundrecht.', 'Freedom of speech is a basic right.', 11),
  ('die Presse', 'the press', '', '{}', 'Die Presse berichtet darüber.', 'The press is reporting on it.', 12),
  ('der Journalist', 'the journalist', 'pl. die Journalisten', '{}', 'Der Journalist recherchiert den Fall.', 'The journalist investigates the case.', 13),
  ('die Schlagzeile', 'the headline', 'pl. die Schlagzeilen', '{}', 'Die Schlagzeile ist übertrieben.', 'The headline is exaggerated.', 14),
  ('die Quelle', 'the source', 'pl. die Quellen', '{}', 'Die Quelle ist zuverlässig.', 'The source is reliable.', 15),
  ('die Unterhaltung', 'the entertainment', '', '{}', 'Das Programm bietet gute Unterhaltung.', 'The programme offers good entertainment.', 16),
  ('darstellen', 'to portray / represent', 'separable: stellt dar', '{verb}', 'Der Film stellt den Krieg dar.', 'The film portrays the war.', 17),
  ('veröffentlichen', 'to publish', '', '{verb}', 'Sie veröffentlicht ein neues Buch.', 'She is publishing a new book.', 18),
  ('berichten', 'to report', 'über + Akk', '{verb}', 'Die Medien berichten über den Skandal.', 'The media report on the scandal.', 19),
  ('beeinflussen', 'to influence', '', '{verb}', 'Werbung beeinflusst unser Verhalten.', 'Advertising influences our behaviour.', 20),
  ('kritisieren', 'to criticise', '', '{verb}', 'Kritiker kritisieren den Roman.', 'Critics criticise the novel.', 21),
  ('aufführen', 'to perform / stage', 'separable: führt auf', '{verb}', 'Das Theater führt ein Drama auf.', 'The theatre stages a drama.', 22),
  ('zensieren', 'to censor', '', '{verb}', 'Der Staat zensiert die Presse.', 'The state censors the press.', 23),
  ('kulturell', 'cultural', '', '{adjective}', 'Die Stadt hat ein reiches kulturelles Leben.', 'The city has a rich cultural life.', 24),
  ('künstlerisch', 'artistic', '', '{adjective}', 'Ihr Stil ist sehr künstlerisch.', 'Her style is very artistic.', 25),
  ('berühmt', 'famous', '', '{adjective}', 'Der Maler ist weltberühmt.', 'The painter is world-famous.', 26),
  ('anspruchsvoll', 'sophisticated / demanding', '', '{adjective}', 'Der Text ist anspruchsvoll.', 'The text is demanding.', 27),
  ('die Vorstellung', 'the show / idea', 'pl. die Vorstellungen', '{}', 'Die Vorstellung beginnt um acht.', 'The show starts at eight.', 28),
  ('der Eindruck', 'the impression', 'pl. die Eindrücke', '{}', 'Das Werk hinterlässt einen tiefen Eindruck.', 'The work leaves a deep impression.', 29),
  ('die Sprache', 'the language', 'pl. die Sprachen', '{}', 'Die Sprache des Romans ist poetisch.', 'The language of the novel is poetic.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 6: Health & psychology
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Health & psychology', 'Mind, body and well-being', 'B2', true, 6)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Psyche', 'the psyche / mind', '', '{}', 'Die Psyche braucht auch Pflege.', 'The mind needs care too.', 1),
  ('das Bewusstsein', 'the consciousness / awareness', '', '{}', 'Sie verlor das Bewusstsein.', 'She lost consciousness.', 2),
  ('die Belastung', 'the strain / burden', 'pl. die Belastungen', '{}', 'Die seelische Belastung war groß.', 'The mental strain was great.', 3),
  ('die Erschöpfung', 'the exhaustion', '', '{}', 'Erschöpfung ist ein Warnsignal.', 'Exhaustion is a warning sign.', 4),
  ('die Angststörung', 'the anxiety disorder', 'pl. -störungen', '{}', 'Eine Angststörung ist behandelbar.', 'An anxiety disorder is treatable.', 5),
  ('die Depression', 'the depression', 'pl. die Depressionen', '{}', 'Depression ist eine ernste Krankheit.', 'Depression is a serious illness.', 6),
  ('die Therapie', 'the therapy', 'pl. die Therapien', '{}', 'Die Therapie hat ihm geholfen.', 'The therapy helped him.', 7),
  ('die Diagnose', 'the diagnosis', 'pl. die Diagnosen', '{}', 'Die Diagnose war eindeutig.', 'The diagnosis was clear.', 8),
  ('das Verhalten', 'the behaviour', '', '{}', 'Sein Verhalten hat sich verändert.', 'His behaviour has changed.', 9),
  ('die Wahrnehmung', 'the perception', '', '{}', 'Die Wahrnehmung kann täuschen.', 'Perception can be deceptive.', 10),
  ('die Motivation', 'the motivation', '', '{}', 'Mir fehlt die Motivation.', 'I lack motivation.', 11),
  ('das Selbstbewusstsein', 'the self-confidence', '', '{}', 'Sport stärkt das Selbstbewusstsein.', 'Sport strengthens self-confidence.', 12),
  ('die Gewohnheit', 'the habit', 'pl. die Gewohnheiten', '{}', 'Gewohnheiten sind schwer zu ändern.', 'Habits are hard to change.', 13),
  ('die Sucht', 'the addiction', 'pl. die Süchte', '{}', 'Die Sucht zerstört das Leben.', 'The addiction destroys lives.', 14),
  ('das Wohlbefinden', 'the well-being', '', '{}', 'Das Wohlbefinden steht im Mittelpunkt.', 'Well-being is the focus.', 15),
  ('sich erholen', 'to recover', 'reflexive', '{verb}', 'Der Körper muss sich erholen.', 'The body has to recover.', 16),
  ('bewältigen', 'to cope with / manage', '', '{verb}', 'Sie bewältigt den Stress gut.', 'She copes with the stress well.', 17),
  ('leiden', 'to suffer', 'an/unter + Dativ', '{verb}', 'Er leidet unter Schlaflosigkeit.', 'He suffers from insomnia.', 18),
  ('vorbeugen', 'to prevent', '+ Dativ; separable', '{verb,dat}', 'Bewegung beugt Krankheiten vor.', 'Exercise prevents illnesses.', 19),
  ('beeinträchtigen', 'to impair / affect', '', '{verb}', 'Lärm beeinträchtigt die Konzentration.', 'Noise impairs concentration.', 20),
  ('sich entspannen', 'to relax', 'reflexive', '{verb}', 'Ich entspanne mich beim Lesen.', 'I relax while reading.', 21),
  ('verarbeiten', 'to process (emotionally)', '', '{verb}', 'Er muss den Verlust verarbeiten.', 'He has to process the loss.', 22),
  ('seelisch', 'mental / emotional', '', '{adjective}', 'Seelische Gesundheit ist wichtig.', 'Mental health is important.', 23),
  ('psychisch', 'psychological', '', '{adjective}', 'Sie steht unter psychischem Druck.', 'She is under psychological pressure.', 24),
  ('anstrengend', 'exhausting / demanding', '', '{adjective}', 'Der Tag war sehr anstrengend.', 'The day was very exhausting.', 25),
  ('ausgeglichen', 'balanced / level-headed', '', '{adjective}', 'Sie ist ein ausgeglichener Mensch.', 'She is a balanced person.', 26),
  ('überfordert', 'overwhelmed', '', '{adjective}', 'Ich fühle mich oft überfordert.', 'I often feel overwhelmed.', 27),
  ('der Druck', 'the pressure', '', '{}', 'Der Druck am Arbeitsplatz steigt.', 'The pressure at work is rising.', 28),
  ('die Pflege', 'the care', '', '{}', 'Die Pflege alter Menschen ist wichtig.', 'The care of the elderly is important.', 29),
  ('die Heilung', 'the cure / healing', '', '{}', 'Die Heilung dauert lange.', 'The healing takes a long time.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 7: Education & research
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Education & research', 'Higher education, study and academia', 'B2', true, 7)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Bildung', 'the education', '', '{}', 'Bildung eröffnet Chancen.', 'Education opens up opportunities.', 1),
  ('der Studiengang', 'the degree programme', 'pl. die Studiengänge', '{}', 'Der Studiengang ist sehr beliebt.', 'The degree programme is very popular.', 2),
  ('die Fakultät', 'the faculty', 'pl. die Fakultäten', '{}', 'Sie lehrt an der juristischen Fakultät.', 'She teaches at the law faculty.', 3),
  ('die Vorlesung', 'the lecture', 'pl. die Vorlesungen', '{}', 'Die Vorlesung war überfüllt.', 'The lecture was overcrowded.', 4),
  ('das Seminar', 'the seminar', 'pl. die Seminare', '{}', 'Im Seminar diskutieren wir Texte.', 'In the seminar we discuss texts.', 5),
  ('die Hausarbeit', 'the term paper', 'pl. die Hausarbeiten', '{}', 'Die Hausarbeit ist nächste Woche fällig.', 'The term paper is due next week.', 6),
  ('die These', 'the thesis / claim', 'pl. die Thesen', '{}', 'Seine These ist umstritten.', 'His thesis is controversial.', 7),
  ('die Quelle', 'the source', 'pl. die Quellen', '{}', 'Bitte gib die Quellen an.', 'Please cite the sources.', 8),
  ('das Zitat', 'the quotation', 'pl. die Zitate', '{}', 'Das Zitat stammt von Goethe.', 'The quotation is from Goethe.', 9),
  ('der Beleg', 'the proof / reference', 'pl. die Belege', '{}', 'Dafür fehlt der Beleg.', 'The proof for that is missing.', 10),
  ('die Erkenntnis', 'the insight / finding', 'pl. die Erkenntnisse', '{}', 'Die Studie liefert neue Erkenntnisse.', 'The study provides new insights.', 11),
  ('die Voraussetzung', 'the prerequisite', 'pl. -ungen', '{}', 'Ein Abschluss ist die Voraussetzung.', 'A degree is the prerequisite.', 12),
  ('das Fachwissen', 'the expertise', '', '{}', 'Sie verfügt über großes Fachwissen.', 'She has great expertise.', 13),
  ('die Frist', 'the deadline', 'pl. die Fristen', '{}', 'Die Frist läuft morgen ab.', 'The deadline expires tomorrow.', 14),
  ('analysieren', 'to analyse', '', '{verb}', 'Wir analysieren die Daten.', 'We analyse the data.', 15),
  ('belegen', 'to prove / to take (a course)', '', '{verb}', 'Studien belegen diese Theorie.', 'Studies prove this theory.', 16),
  ('zitieren', 'to quote / cite', '', '{verb}', 'Bitte zitiere die Autorin korrekt.', 'Please cite the author correctly.', 17),
  ('recherchieren', 'to research', '', '{verb}', 'Ich recherchiere für meine Arbeit.', 'I am researching for my paper.', 18),
  ('begründen', 'to justify / give reasons', '', '{verb}', 'Begründe deine Antwort.', 'Justify your answer.', 19),
  ('schlussfolgern', 'to conclude / infer', '', '{verb}', 'Daraus kann man schlussfolgern, dass …', 'From this one can conclude that …', 20),
  ('sich befassen', 'to deal with', 'mit + Dativ', '{verb}', 'Die Arbeit befasst sich mit dem Klima.', 'The paper deals with the climate.', 21),
  ('vermitteln', 'to convey / teach', '', '{verb}', 'Der Kurs vermittelt Grundlagen.', 'The course teaches basics.', 22),
  ('verfassen', 'to write / compose', '', '{verb}', 'Sie verfasst eine Doktorarbeit.', 'She is writing a doctoral thesis.', 23),
  ('akademisch', 'academic', '', '{adjective}', 'Er hat einen akademischen Titel.', 'He has an academic title.', 24),
  ('theoretisch', 'theoretical', '', '{adjective}', 'Das ist nur theoretisch möglich.', 'That is only theoretically possible.', 25),
  ('empirisch', 'empirical', '', '{adjective}', 'Die These ist empirisch belegt.', 'The thesis is empirically proven.', 26),
  ('verständlich', 'understandable', '', '{adjective}', 'Der Vortrag war gut verständlich.', 'The lecture was easy to understand.', 27),
  ('das Stipendium', 'the scholarship', 'pl. die Stipendien', '{}', 'Sie hat ein Stipendium erhalten.', 'She received a scholarship.', 28),
  ('die Doktorarbeit', 'the doctoral thesis', 'pl. -arbeiten', '{}', 'Die Doktorarbeit dauert Jahre.', 'The doctoral thesis takes years.', 29),
  ('die Bildungschance', 'the educational opportunity', 'pl. -chancen', '{}', 'Bildungschancen sind ungleich verteilt.', 'Educational opportunities are unequally distributed.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 8: Society & social issues
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Society & social issues', 'Migration, equality and social topics', 'B2', true, 8)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Gesellschaft', 'the society', 'pl. die Gesellschaften', '{}', 'Die Gesellschaft wird vielfältiger.', 'Society is becoming more diverse.', 1),
  ('die Integration', 'the integration', '', '{}', 'Integration braucht Zeit.', 'Integration takes time.', 2),
  ('die Migration', 'the migration', '', '{}', 'Migration prägt viele Länder.', 'Migration shapes many countries.', 3),
  ('die Gleichberechtigung', 'the equality / equal rights', '', '{}', 'Gleichberechtigung ist noch nicht erreicht.', 'Equality has not yet been achieved.', 4),
  ('die Vielfalt', 'the diversity', '', '{}', 'Vielfalt ist eine Stärke.', 'Diversity is a strength.', 5),
  ('die Diskriminierung', 'the discrimination', '', '{}', 'Diskriminierung ist verboten.', 'Discrimination is forbidden.', 6),
  ('das Vorurteil', 'the prejudice', 'pl. die Vorurteile', '{}', 'Wir müssen Vorurteile abbauen.', 'We must break down prejudices.', 7),
  ('die Generation', 'the generation', 'pl. die Generationen', '{}', 'Die junge Generation denkt anders.', 'The young generation thinks differently.', 8),
  ('die Bevölkerung', 'the population', '', '{}', 'Die Bevölkerung altert.', 'The population is ageing.', 9),
  ('die Minderheit', 'the minority', 'pl. die Minderheiten', '{}', 'Minderheiten brauchen Schutz.', 'Minorities need protection.', 10),
  ('die Chancengleichheit', 'equal opportunity', '', '{}', 'Chancengleichheit ist das Ziel.', 'Equal opportunity is the goal.', 11),
  ('der Wohlstand', 'the prosperity', '', '{}', 'Der Wohlstand ist ungleich verteilt.', 'Prosperity is unequally distributed.', 12),
  ('die Solidarität', 'the solidarity', '', '{}', 'In der Krise zeigt sich Solidarität.', 'Solidarity shows in a crisis.', 13),
  ('die Identität', 'the identity', 'pl. die Identitäten', '{}', 'Sprache ist Teil der Identität.', 'Language is part of identity.', 14),
  ('integrieren', 'to integrate', '', '{verb}', 'Die Schule integriert neue Kinder.', 'The school integrates new children.', 15),
  ('benachteiligen', 'to disadvantage', '', '{verb}', 'Das System benachteiligt Arme.', 'The system disadvantages the poor.', 16),
  ('ausgrenzen', 'to exclude', 'separable: grenzt aus', '{verb}', 'Niemand sollte ausgegrenzt werden.', 'No one should be excluded.', 17),
  ('akzeptieren', 'to accept', '', '{verb}', 'Wir akzeptieren andere Meinungen.', 'We accept other opinions.', 18),
  ('respektieren', 'to respect', '', '{verb}', 'Man sollte alle Menschen respektieren.', 'One should respect all people.', 19),
  ('fördern', 'to promote / support', '', '{verb}', 'Der Staat fördert Familien.', 'The state supports families.', 20),
  ('bekämpfen', 'to fight / combat', '', '{verb}', 'Wir bekämpfen die Armut.', 'We are fighting poverty.', 21),
  ('zusammenleben', 'to live together', 'separable: lebt zusammen', '{verb}', 'Verschiedene Kulturen leben zusammen.', 'Different cultures live together.', 22),
  ('sozial', 'social', '', '{adjective}', 'Soziale Gerechtigkeit ist wichtig.', 'Social justice is important.', 23),
  ('gerecht', 'fair / just', '', '{adjective}', 'Das System ist nicht gerecht.', 'The system is not fair.', 24),
  ('tolerant', 'tolerant', '', '{adjective}', 'Eine offene Gesellschaft ist tolerant.', 'An open society is tolerant.', 25),
  ('benachteiligt', 'disadvantaged', '', '{adjective}', 'Benachteiligte Kinder brauchen Hilfe.', 'Disadvantaged children need help.', 26),
  ('vielfältig', 'diverse', '', '{adjective}', 'Die Stadt ist kulturell vielfältig.', 'The city is culturally diverse.', 27),
  ('das Ehrenamt', 'the voluntary work', 'pl. die Ehrenämter', '{}', 'Viele engagieren sich im Ehrenamt.', 'Many people do voluntary work.', 28),
  ('die Ausgrenzung', 'the exclusion', '', '{}', 'Ausgrenzung führt zu Konflikten.', 'Exclusion leads to conflict.', 29),
  ('der Zusammenhalt', 'the cohesion / solidarity', '', '{}', 'Der gesellschaftliche Zusammenhalt zählt.', 'Social cohesion matters.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 9: Idioms & expressions (Redewendungen)
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Idioms & expressions', 'Common German idioms (Redewendungen)', 'B2', true, 9)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Daumen drücken', 'to keep ones fingers crossed', 'good luck wish', '{}', 'Ich drücke dir die Daumen!', 'I am keeping my fingers crossed for you!', 1),
  ('die Nase voll haben', 'to be fed up', 'von + Dativ', '{}', 'Ich habe die Nase voll von der Arbeit.', 'I am fed up with the work.', 2),
  ('Schwein haben', 'to be lucky', 'colloquial', '{}', 'Da hast du echt Schwein gehabt!', 'You were really lucky there!', 3),
  ('ins Wasser fallen', 'to fall through / be cancelled', '', '{}', 'Das Fest ist ins Wasser gefallen.', 'The party fell through.', 4),
  ('den Nagel auf den Kopf treffen', 'to hit the nail on the head', '', '{}', 'Mit dem Kommentar hast du den Nagel auf den Kopf getroffen.', 'With that comment you hit the nail on the head.', 5),
  ('etwas auf die lange Bank schieben', 'to put something off', '', '{}', 'Schieb die Aufgabe nicht auf die lange Bank.', 'Do not put off the task.', 6),
  ('die Katze im Sack kaufen', 'to buy a pig in a poke', '', '{}', 'Ohne Test kaufst du die Katze im Sack.', 'Without a test you buy a pig in a poke.', 7),
  ('nur Bahnhof verstehen', 'to understand nothing', '', '{}', 'Bei dem Thema verstehe ich nur Bahnhof.', 'On that topic I understand nothing.', 8),
  ('ins Fettnäpfchen treten', 'to put ones foot in it', '', '{}', 'Mit der Frage bin ich ins Fettnäpfchen getreten.', 'With that question I put my foot in it.', 9),
  ('über den Tellerrand schauen', 'to think outside the box', '', '{}', 'Ein guter Chef schaut über den Tellerrand.', 'A good boss thinks outside the box.', 10),
  ('die Flinte ins Korn werfen', 'to give up', '', '{}', 'Gib nicht auf, wirf nicht die Flinte ins Korn.', 'Do not give up.', 11),
  ('alles in Butter', 'everything is fine', 'colloquial', '{}', 'Keine Sorge, alles in Butter.', 'No worries, everything is fine.', 12),
  ('das ist mir Wurst', 'I do not care', 'colloquial', '{}', 'Welcher Film? Das ist mir Wurst.', 'Which film? I do not care.', 13),
  ('aus dem Häuschen sein', 'to be over the moon', '', '{}', 'Die Kinder waren ganz aus dem Häuschen.', 'The children were over the moon.', 14),
  ('auf dem Holzweg sein', 'to be on the wrong track', '', '{}', 'Wenn du das glaubst, bist du auf dem Holzweg.', 'If you believe that, you are on the wrong track.', 15),
  ('ins kalte Wasser springen', 'to jump in at the deep end', '', '{}', 'Beim neuen Job musste ich ins kalte Wasser springen.', 'In the new job I had to jump in at the deep end.', 16),
  ('den Faden verlieren', 'to lose ones train of thought', '', '{}', 'Entschuldigung, ich habe den Faden verloren.', 'Sorry, I lost my train of thought.', 17),
  ('jemandem reinen Wein einschenken', 'to tell someone the plain truth', '', '{}', 'Ich muss dir reinen Wein einschenken.', 'I have to tell you the plain truth.', 18),
  ('zwei Fliegen mit einer Klappe schlagen', 'to kill two birds with one stone', '', '{}', 'So schlagen wir zwei Fliegen mit einer Klappe.', 'That way we kill two birds with one stone.', 19),
  ('die Ohren spitzen', 'to prick up ones ears', '', '{}', 'Bei dem Wort spitzte er die Ohren.', 'At that word he pricked up his ears.', 20),
  ('Hals und Beinbruch', 'break a leg / good luck', 'good luck wish', '{}', 'Hals und Beinbruch für die Prüfung!', 'Good luck with the exam!', 21),
  ('etwas in den Sand setzen', 'to mess something up', '', '{}', 'Er hat das Projekt in den Sand gesetzt.', 'He messed up the project.', 22),
  ('jemanden auf die Palme bringen', 'to drive someone up the wall', '', '{}', 'Sein Verhalten bringt mich auf die Palme.', 'His behaviour drives me up the wall.', 23),
  ('das A und O', 'the be-all and end-all', '', '{}', 'Übung ist das A und O.', 'Practice is the be-all and end-all.', 24),
  ('Tomaten auf den Augen haben', 'to be oblivious / not see the obvious', '', '{}', 'Hast du Tomaten auf den Augen?', 'Are you blind to the obvious?', 25),
  ('ein Auge zudrücken', 'to turn a blind eye', '', '{}', 'Der Lehrer drückte ein Auge zu.', 'The teacher turned a blind eye.', 26),
  ('die Hände in den Schoß legen', 'to sit back and do nothing', '', '{}', 'Wir dürfen nicht die Hände in den Schoß legen.', 'We must not sit back and do nothing.', 27),
  ('jemandem auf die Nerven gehen', 'to annoy someone', '', '{}', 'Der Lärm geht mir auf die Nerven.', 'The noise annoys me.', 28),
  ('Daumen mal Pi', 'rough estimate / ballpark', 'colloquial', '{}', 'Daumen mal Pi sind das hundert Euro.', 'As a rough estimate that is a hundred euros.', 29),
  ('reinen Tisch machen', 'to make a clean break / clear the air', '', '{}', 'Lass uns reinen Tisch machen.', 'Let us clear the air.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 10: Abstract nouns
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Abstract nouns', 'Abstract and nominalised vocabulary', 'B2', true, 10)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Möglichkeit', 'the possibility / opportunity', 'pl. die Möglichkeiten', '{}', 'Es gibt mehrere Möglichkeiten.', 'There are several possibilities.', 1),
  ('die Bedeutung', 'the meaning / importance', 'pl. die Bedeutungen', '{}', 'Das Wort hat mehrere Bedeutungen.', 'The word has several meanings.', 2),
  ('der Zusammenhang', 'the connection / context', 'pl. die Zusammenhänge', '{}', 'Es gibt einen klaren Zusammenhang.', 'There is a clear connection.', 3),
  ('die Voraussetzung', 'the prerequisite', 'pl. -ungen', '{}', 'Geduld ist eine Voraussetzung.', 'Patience is a prerequisite.', 4),
  ('die Auswirkung', 'the effect / impact', 'pl. die Auswirkungen', '{}', 'Die Auswirkungen sind spürbar.', 'The effects are noticeable.', 5),
  ('die Herausforderung', 'the challenge', 'pl. -ungen', '{}', 'Das ist eine echte Herausforderung.', 'That is a real challenge.', 6),
  ('der Zweck', 'the purpose', 'pl. die Zwecke', '{}', 'Was ist der Zweck der Übung?', 'What is the purpose of the exercise?', 7),
  ('der Sinn', 'the sense / meaning', '', '{}', 'Das ergibt keinen Sinn.', 'That does not make sense.', 8),
  ('die Absicht', 'the intention', 'pl. die Absichten', '{}', 'Das war nicht meine Absicht.', 'That was not my intention.', 9),
  ('die Ursache', 'the cause', 'pl. die Ursachen', '{}', 'Die Ursache ist unbekannt.', 'The cause is unknown.', 10),
  ('die Wirkung', 'the effect', 'pl. die Wirkungen', '{}', 'Das Medikament zeigt Wirkung.', 'The medicine shows an effect.', 11),
  ('die Bedingung', 'the condition', 'pl. die Bedingungen', '{}', 'Unter einer Bedingung helfe ich.', 'I will help on one condition.', 12),
  ('die Erwartung', 'the expectation', 'pl. die Erwartungen', '{}', 'Die Erwartungen sind hoch.', 'Expectations are high.', 13),
  ('die Einstellung', 'the attitude / setting', 'pl. die Einstellungen', '{}', 'Seine Einstellung hat sich geändert.', 'His attitude has changed.', 14),
  ('das Verhalten', 'the behaviour', '', '{}', 'Sein Verhalten überrascht mich.', 'His behaviour surprises me.', 15),
  ('die Entscheidung', 'the decision', 'pl. die Entscheidungen', '{}', 'Das war eine schwere Entscheidung.', 'That was a difficult decision.', 16),
  ('die Erfahrung', 'the experience', 'pl. die Erfahrungen', '{}', 'Aus Fehlern sammelt man Erfahrung.', 'You gain experience from mistakes.', 17),
  ('die Verbesserung', 'the improvement', 'pl. -ungen', '{}', 'Es gibt eine deutliche Verbesserung.', 'There is a clear improvement.', 18),
  ('die Veränderung', 'the change', 'pl. die Veränderungen', '{}', 'Veränderung macht oft Angst.', 'Change is often scary.', 19),
  ('die Fähigkeit', 'the ability', 'pl. die Fähigkeiten', '{}', 'Sie hat die Fähigkeit zu führen.', 'She has the ability to lead.', 20),
  ('das Bewusstsein', 'the awareness', '', '{}', 'Das Bewusstsein dafür wächst.', 'Awareness of it is growing.', 21),
  ('die Wahrnehmung', 'the perception', '', '{}', 'Die Wahrnehmung ist subjektiv.', 'Perception is subjective.', 22),
  ('der Anspruch', 'the claim / standard', 'pl. die Ansprüche', '{}', 'Sie hat hohe Ansprüche.', 'She has high standards.', 23),
  ('die Gelegenheit', 'the opportunity / occasion', 'pl. -heiten', '{}', 'Nutze die Gelegenheit!', 'Seize the opportunity!', 24),
  ('die Wirklichkeit', 'the reality', '', '{}', 'Traum und Wirklichkeit unterscheiden sich.', 'Dream and reality differ.', 25),
  ('die Vorstellung', 'the idea / notion', 'pl. die Vorstellungen', '{}', 'Ich habe eine klare Vorstellung davon.', 'I have a clear idea of it.', 26),
  ('die Grundlage', 'the basis / foundation', 'pl. die Grundlagen', '{}', 'Vertrauen ist die Grundlage.', 'Trust is the foundation.', 27),
  ('die Eigenschaft', 'the quality / characteristic', 'pl. -schaften', '{}', 'Geduld ist eine gute Eigenschaft.', 'Patience is a good quality.', 28),
  ('der Umstand', 'the circumstance', 'pl. die Umstände', '{}', 'Unter diesen Umständen geht es nicht.', 'Under these circumstances it is not possible.', 29),
  ('die Tendenz', 'the tendency / trend', 'pl. die Tendenzen', '{}', 'Die Tendenz ist steigend.', 'The trend is upward.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- ---------------------------------------------------------------------------
-- Deck 11: Argumentation & connectors
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Argumentation', 'Formal connectors for essays and debate', 'B2', true, 11)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('einerseits … andererseits', 'on one hand … on the other', '', '{}', 'Einerseits günstig, andererseits langsam.', 'On one hand cheap, on the other slow.', 1),
  ('zum einen … zum anderen', 'firstly … secondly', '', '{}', 'Zum einen fehlt Geld, zum anderen Zeit.', 'Firstly money is lacking, secondly time.', 2),
  ('im Vergleich zu', 'compared to', '+ Dativ', '{dat}', 'Im Vergleich zu früher ist es teuer.', 'Compared to before it is expensive.', 3),
  ('im Gegensatz zu', 'in contrast to', '+ Dativ', '{dat}', 'Im Gegensatz zu dir mag ich das.', 'In contrast to you, I like it.', 4),
  ('aufgrund', 'due to', '+ Genitiv', '{gen}', 'Aufgrund des Wetters fällt es aus.', 'Due to the weather it is cancelled.', 5),
  ('infolge', 'as a result of', '+ Genitiv', '{gen}', 'Infolge der Krise stiegen die Preise.', 'As a result of the crisis prices rose.', 6),
  ('trotz', 'despite', '+ Genitiv', '{gen}', 'Trotz der Probleme gelang es.', 'Despite the problems it succeeded.', 7),
  ('hinsichtlich', 'regarding / with regard to', '+ Genitiv', '{gen}', 'Hinsichtlich der Kosten gibt es Fragen.', 'Regarding the costs there are questions.', 8),
  ('einerseits gesehen', 'seen from one angle', '', '{}', 'Einerseits gesehen ist das fair.', 'Seen from one angle that is fair.', 9),
  ('folglich', 'consequently', '', '{}', 'Es regnete, folglich blieben wir drinnen.', 'It rained, consequently we stayed inside.', 10),
  ('demnach', 'accordingly / thus', '', '{}', 'Demnach ist die These falsch.', 'Accordingly the thesis is wrong.', 11),
  ('somit', 'thus / therefore', '', '{}', 'Somit ist die Frage geklärt.', 'Thus the question is settled.', 12),
  ('insofern', 'in this respect / insofar', '', '{}', 'Insofern hast du recht.', 'In this respect you are right.', 13),
  ('allerdings', 'however / admittedly', '', '{}', 'Es ist gut, allerdings teuer.', 'It is good, however expensive.', 14),
  ('dennoch', 'nonetheless', '', '{}', 'Es war schwer, dennoch lohnte es sich.', 'It was hard, nonetheless it was worth it.', 15),
  ('gleichwohl', 'nevertheless (formal)', '', '{}', 'Gleichwohl bleibt das Risiko.', 'Nevertheless the risk remains.', 16),
  ('zudem', 'moreover', '', '{}', 'Zudem ist die Lage unklar.', 'Moreover the situation is unclear.', 17),
  ('darüber hinaus', 'furthermore / beyond that', '', '{}', 'Darüber hinaus fehlt das Personal.', 'Beyond that, staff is lacking.', 18),
  ('beispielsweise', 'for example', '', '{}', 'Manche Tiere, beispielsweise Bienen, sind bedroht.', 'Some animals, for example bees, are threatened.', 19),
  ('insbesondere', 'in particular', '', '{}', 'Das gilt insbesondere für Kinder.', 'This applies in particular to children.', 20),
  ('vor allem', 'above all', '', '{}', 'Vor allem die Kosten sind ein Problem.', 'Above all the costs are a problem.', 21),
  ('letztlich', 'ultimately', '', '{}', 'Letztlich zählt das Ergebnis.', 'Ultimately the result counts.', 22),
  ('einräumen', 'to concede / admit', 'separable: räumt ein', '{verb}', 'Ich muss einräumen, dass ich falsch lag.', 'I must concede that I was wrong.', 23),
  ('voraussetzen', 'to presuppose / require', 'separable: setzt voraus', '{verb}', 'Das setzt Wissen voraus.', 'That presupposes knowledge.', 24),
  ('schlussfolgern', 'to conclude', '', '{verb}', 'Daraus lässt sich schlussfolgern, dass …', 'From this it can be concluded that …', 25),
  ('hervorheben', 'to emphasise / highlight', 'separable: hebt hervor', '{verb}', 'Ich möchte einen Punkt hervorheben.', 'I want to highlight one point.', 26),
  ('abwägen', 'to weigh up', 'separable: wägt ab', '{verb}', 'Wir müssen Vor- und Nachteile abwägen.', 'We have to weigh up pros and cons.', 27),
  ('bezweifeln', 'to doubt', '', '{verb}', 'Ich bezweifle, dass das stimmt.', 'I doubt that this is true.', 28),
  ('zusammenfassen', 'to summarise', 'separable: fasst zusammen', '{verb}', 'Lass mich das zusammenfassen.', 'Let me summarise this.', 29),
  ('die Schlussfolgerung', 'the conclusion', 'pl. -ungen', '{}', 'Die Schlussfolgerung ist logisch.', 'The conclusion is logical.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 12: Verbs + prepositions (advanced)
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Verbs + prepositions', 'Advanced fixed verb-preposition combinations', 'B2', true, 12)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('bestehen aus', 'to consist of', '+ Dativ', '{dat}', 'Das Team besteht aus fünf Personen.', 'The team consists of five people.', 1),
  ('bestehen auf', 'to insist on', '+ Dativ', '{dat}', 'Sie besteht auf einer Antwort.', 'She insists on an answer.', 2),
  ('teilnehmen an', 'to take part in', '+ Dativ', '{dat}', 'Wir nehmen an der Konferenz teil.', 'We take part in the conference.', 3),
  ('sich beziehen auf', 'to refer to', '+ Akkusativ', '{akk}', 'Ich beziehe mich auf Ihre E-Mail.', 'I refer to your email.', 4),
  ('hinweisen auf', 'to point out', '+ Akkusativ; separable', '{akk}', 'Ich weise auf das Problem hin.', 'I point out the problem.', 5),
  ('sich handeln um', 'to be about / concern', '+ Akkusativ', '{akk}', 'Es handelt sich um einen Irrtum.', 'It is about a misunderstanding.', 6),
  ('führen zu', 'to lead to', '+ Dativ', '{dat}', 'Stress führt zu Krankheit.', 'Stress leads to illness.', 7),
  ('beitragen zu', 'to contribute to', '+ Dativ; separable', '{dat}', 'Jeder kann zum Erfolg beitragen.', 'Everyone can contribute to success.', 8),
  ('verzichten auf', 'to do without', '+ Akkusativ', '{akk}', 'Ich verzichte auf Zucker.', 'I do without sugar.', 9),
  ('sich einsetzen für', 'to advocate for', '+ Akkusativ', '{akk}', 'Sie setzt sich für Tiere ein.', 'She advocates for animals.', 10),
  ('sich wenden an', 'to turn to (someone)', '+ Akkusativ', '{akk}', 'Wenden Sie sich an den Support.', 'Turn to support.', 11),
  ('rechnen mit', 'to count on / expect', '+ Dativ', '{dat}', 'Wir rechnen mit Verspätung.', 'We expect a delay.', 12),
  ('sich eignen für', 'to be suitable for', '+ Akkusativ', '{akk}', 'Das eignet sich gut für Anfänger.', 'That is well suited for beginners.', 13),
  ('zweifeln an', 'to doubt', '+ Dativ', '{dat}', 'Ich zweifle an seiner Aussage.', 'I doubt his statement.', 14),
  ('leiden unter', 'to suffer from', '+ Dativ', '{dat}', 'Viele leiden unter dem Lärm.', 'Many suffer from the noise.', 15),
  ('bestehen in', 'to lie in / consist in', '+ Dativ', '{dat}', 'Das Problem besteht in den Kosten.', 'The problem lies in the costs.', 16),
  ('sich gewöhnen an', 'to get used to', '+ Akkusativ', '{akk}', 'Man gewöhnt sich an alles.', 'One gets used to everything.', 17),
  ('sich auseinandersetzen mit', 'to engage with', '+ Dativ', '{dat}', 'Wir setzen uns mit dem Thema auseinander.', 'We engage with the topic.', 18),
  ('reagieren auf', 'to react to', '+ Akkusativ', '{akk}', 'Wie reagierst du auf Kritik?', 'How do you react to criticism?', 19),
  ('sich beschweren über', 'to complain about', '+ Akkusativ', '{akk}', 'Er beschwert sich über den Service.', 'He complains about the service.', 20),
  ('sich verlassen auf', 'to rely on', '+ Akkusativ', '{akk}', 'Verlass dich nicht darauf.', 'Do not rely on it.', 21),
  ('streben nach', 'to strive for', '+ Dativ', '{dat}', 'Sie strebt nach Erfolg.', 'She strives for success.', 22),
  ('warnen vor', 'to warn of', '+ Dativ', '{dat}', 'Experten warnen vor der Gefahr.', 'Experts warn of the danger.', 23),
  ('sich erkundigen nach', 'to inquire about', '+ Dativ', '{dat}', 'Ich erkundige mich nach dem Preis.', 'I inquire about the price.', 24),
  ('sich sehnen nach', 'to long for', '+ Dativ', '{dat}', 'Ich sehne mich nach Ruhe.', 'I long for peace.', 25),
  ('halten von', 'to think of (opinion)', '+ Dativ', '{dat}', 'Was hältst du von dem Plan?', 'What do you think of the plan?', 26),
  ('sich entscheiden gegen', 'to decide against', '+ Akkusativ', '{akk}', 'Sie entscheidet sich gegen den Kauf.', 'She decides against the purchase.', 27),
  ('protestieren gegen', 'to protest against', '+ Akkusativ', '{akk}', 'Sie protestieren gegen das Gesetz.', 'They protest against the law.', 28),
  ('sich freuen über', 'to be glad about', '+ Akkusativ', '{akk}', 'Ich freue mich über deinen Erfolg.', 'I am glad about your success.', 29),
  ('sich konzentrieren auf', 'to concentrate on', '+ Akkusativ', '{akk}', 'Konzentriere dich auf das Wesentliche.', 'Concentrate on the essentials.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 13: Work & communication
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Work & communication', 'Professional and written communication', 'B2', true, 13)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('die Mitteilung', 'the notice / message', 'pl. die Mitteilungen', '{}', 'Wir haben Ihre Mitteilung erhalten.', 'We have received your message.', 1),
  ('die Anfrage', 'the inquiry / request', 'pl. die Anfragen', '{}', 'Vielen Dank für Ihre Anfrage.', 'Thank you for your inquiry.', 2),
  ('die Rückmeldung', 'the feedback / reply', 'pl. -ungen', '{}', 'Ich bitte um eine Rückmeldung.', 'I ask for a reply.', 3),
  ('die Unterlage', 'the document', 'pl. die Unterlagen', '{}', 'Bitte senden Sie die Unterlagen.', 'Please send the documents.', 4),
  ('die Vereinbarung', 'the agreement', 'pl. -ungen', '{}', 'Wir treffen eine Vereinbarung.', 'We make an agreement.', 5),
  ('die Frist', 'the deadline', 'pl. die Fristen', '{}', 'Die Frist endet am Freitag.', 'The deadline ends on Friday.', 6),
  ('der Termin', 'the appointment', 'pl. die Termine', '{}', 'Wir vereinbaren einen Termin.', 'We arrange an appointment.', 7),
  ('die Tagesordnung', 'the agenda', 'pl. -ungen', '{}', 'Der Punkt steht auf der Tagesordnung.', 'The item is on the agenda.', 8),
  ('das Protokoll', 'the minutes / record', 'pl. die Protokolle', '{}', 'Ich schreibe das Protokoll.', 'I write the minutes.', 9),
  ('die Zusammenarbeit', 'the cooperation', '', '{}', 'Die Zusammenarbeit läuft gut.', 'The cooperation is going well.', 10),
  ('der Vorgesetzte', 'the superior / manager', 'pl. die Vorgesetzten', '{}', 'Mein Vorgesetzter ist im Urlaub.', 'My manager is on holiday.', 11),
  ('die Zuständigkeit', 'the responsibility / remit', 'pl. -keiten', '{}', 'Das liegt nicht in meiner Zuständigkeit.', 'That is not within my remit.', 12),
  ('mitteilen', 'to inform / notify', '+ Dativ; separable', '{verb,dat}', 'Bitte teilen Sie mir das mit.', 'Please inform me of that.', 13),
  ('vereinbaren', 'to agree / arrange', '', '{verb}', 'Wir vereinbaren einen Liefertermin.', 'We arrange a delivery date.', 14),
  ('beantragen', 'to apply for (formally)', '', '{verb}', 'Ich beantrage Urlaub.', 'I apply for leave.', 15),
  ('bestätigen', 'to confirm', '', '{verb}', 'Bitte bestätigen Sie den Termin.', 'Please confirm the appointment.', 16),
  ('absagen', 'to cancel', 'separable: sagt ab', '{verb}', 'Ich muss den Termin absagen.', 'I have to cancel the appointment.', 17),
  ('verschieben', 'to postpone', 'verschiebt, verschob, verschoben', '{verb}', 'Wir verschieben die Sitzung.', 'We postpone the meeting.', 18),
  ('weiterleiten', 'to forward', 'separable: leitet weiter', '{verb}', 'Ich leite die E-Mail weiter.', 'I forward the email.', 19),
  ('sich abstimmen', 'to coordinate', 'mit + Dativ; separable', '{verb}', 'Wir stimmen uns mit dem Team ab.', 'We coordinate with the team.', 20),
  ('zuständig', 'responsible / in charge', 'für + Akk', '{adjective}', 'Wer ist dafür zuständig?', 'Who is in charge of this?', 21),
  ('verbindlich', 'binding / definite', '', '{adjective}', 'Die Zusage ist verbindlich.', 'The commitment is binding.', 22),
  ('dringend', 'urgent', '', '{adjective}', 'Die Sache ist dringend.', 'The matter is urgent.', 23),
  ('sachlich', 'objective / factual', '', '{adjective}', 'Bitte bleib sachlich.', 'Please stay objective.', 24),
  ('die Absprache', 'the arrangement', 'pl. die Absprachen', '{}', 'Nach Absprache ist alles möglich.', 'By arrangement anything is possible.', 25),
  ('der Empfänger', 'the recipient', 'pl. die Empfänger', '{}', 'Der Empfänger ist unbekannt.', 'The recipient is unknown.', 26),
  ('der Anhang', 'the attachment', 'pl. die Anhänge', '{}', 'Die Datei ist im Anhang.', 'The file is in the attachment.', 27),
  ('die Unterschrift', 'the signature', 'pl. -schriften', '{}', 'Hier fehlt die Unterschrift.', 'The signature is missing here.', 28),
  ('hochladen', 'to upload', 'separable: lädt hoch', '{verb}', 'Bitte laden Sie das Dokument hoch.', 'Please upload the document.', 29),
  ('erreichbar', 'reachable / available', '', '{adjective}', 'Ich bin ab neun erreichbar.', 'I am reachable from nine.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 14: Law & rules
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Law & rules', 'Law, rights and regulations', 'B2', true, 14)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('das Recht', 'the law / right', 'pl. die Rechte', '{}', 'Niemand steht über dem Recht.', 'No one is above the law.', 1),
  ('das Gesetz', 'the law / statute', 'pl. die Gesetze', '{}', 'Das Gesetz wurde verschärft.', 'The law was tightened.', 2),
  ('die Regel', 'the rule', 'pl. die Regeln', '{}', 'Regeln gelten für alle.', 'Rules apply to everyone.', 3),
  ('die Vorschrift', 'the regulation', 'pl. die Vorschriften', '{}', 'Die Vorschrift ist strikt.', 'The regulation is strict.', 4),
  ('die Pflicht', 'the duty / obligation', 'pl. die Pflichten', '{}', 'Es ist deine Pflicht.', 'It is your duty.', 5),
  ('das Verbot', 'the ban / prohibition', 'pl. die Verbote', '{}', 'Es gilt ein Rauchverbot.', 'A smoking ban applies.', 6),
  ('die Erlaubnis', 'the permission', 'pl. -nisse', '{}', 'Du brauchst eine Erlaubnis.', 'You need permission.', 7),
  ('die Strafe', 'the punishment / fine', 'pl. die Strafen', '{}', 'Die Strafe war hoch.', 'The fine was high.', 8),
  ('die Geldstrafe', 'the fine (monetary)', 'pl. -strafen', '{}', 'Er bekam eine Geldstrafe.', 'He got a fine.', 9),
  ('der Vertrag', 'the contract', 'pl. die Verträge', '{}', 'Der Vertrag ist gültig.', 'The contract is valid.', 10),
  ('der Anwalt', 'the lawyer', 'pl. die Anwälte', '{}', 'Ich rufe meinen Anwalt an.', 'I call my lawyer.', 11),
  ('das Gericht', 'the court', 'pl. die Gerichte', '{}', 'Der Fall geht vor Gericht.', 'The case goes to court.', 12),
  ('das Urteil', 'the verdict / judgement', 'pl. die Urteile', '{}', 'Das Urteil ist endgültig.', 'The verdict is final.', 13),
  ('der Zeuge', 'the witness', 'pl. die Zeugen', '{}', 'Der Zeuge sagt aus.', 'The witness testifies.', 14),
  ('die Haftung', 'the liability', '', '{}', 'Die Haftung ist begrenzt.', 'The liability is limited.', 15),
  ('verbieten', 'to forbid / ban', 'verbietet, verbot, verboten', '{verb}', 'Das Gesetz verbietet es.', 'The law forbids it.', 16),
  ('erlauben', 'to allow', '+ Dativ', '{verb,dat}', 'Das ist nicht erlaubt.', 'That is not allowed.', 17),
  ('verpflichten', 'to obligate', 'zu + Dativ', '{verb}', 'Der Vertrag verpflichtet uns dazu.', 'The contract obligates us to do so.', 18),
  ('verstoßen', 'to violate', 'gegen + Akk; verstößt, verstieß, verstoßen', '{verb}', 'Er hat gegen die Regel verstoßen.', 'He violated the rule.', 19),
  ('einhalten', 'to comply with / keep', 'separable: hält ein', '{verb}', 'Wir halten die Vorschriften ein.', 'We comply with the regulations.', 20),
  ('klagen', 'to sue / take legal action', 'gegen + Akk', '{verb}', 'Sie klagt gegen die Firma.', 'She is suing the company.', 21),
  ('haften', 'to be liable', 'für + Akk', '{verb}', 'Eltern haften für ihre Kinder.', 'Parents are liable for their children.', 22),
  ('genehmigen', 'to approve / authorise', '', '{verb}', 'Die Stadt genehmigt den Bau.', 'The city approves the construction.', 23),
  ('gesetzlich', 'legal / statutory', '', '{adjective}', 'Das ist gesetzlich geregelt.', 'That is regulated by law.', 24),
  ('rechtlich', 'legal', '', '{adjective}', 'Aus rechtlicher Sicht ist das heikel.', 'From a legal point of view that is tricky.', 25),
  ('verboten', 'forbidden', '', '{adjective}', 'Parken ist hier verboten.', 'Parking is forbidden here.', 26),
  ('zulässig', 'permissible / admissible', '', '{adjective}', 'Das ist rechtlich zulässig.', 'That is legally permissible.', 27),
  ('schuldig', 'guilty', '', '{adjective}', 'Das Gericht sprach ihn schuldig.', 'The court found him guilty.', 28),
  ('die Verantwortung', 'the responsibility', '', '{}', 'Sie trägt die Verantwortung.', 'She bears the responsibility.', 29),
  ('die Genehmigung', 'the permit / approval', 'pl. -ungen', '{}', 'Ohne Genehmigung geht es nicht.', 'Without a permit it is not possible.', 30)
) as v(front, back, notes, tags, example, example_en, ord);


-- ---------------------------------------------------------------------------
-- Deck 15: Nuanced adjectives
-- ---------------------------------------------------------------------------
with d as (
  insert into public.fc_decks (owner_id, title, description, level, is_published, sort_order)
  values ((select id from auth.users where email = 'marvin.h.graf@gmail.com'),
    'B2 · Nuanced adjectives', 'Precise adjectives for a richer style', 'B2', true, 15)
  returning id
)
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from d, (values
  ('anspruchsvoll', 'demanding / sophisticated', '', '{adjective}', 'Die Aufgabe ist anspruchsvoll.', 'The task is demanding.', 1),
  ('zuverlässig', 'reliable', '', '{adjective}', 'Er ist ein zuverlässiger Partner.', 'He is a reliable partner.', 2),
  ('aufwändig', 'elaborate / costly (effort)', '', '{adjective}', 'Der Umbau war sehr aufwändig.', 'The renovation was very elaborate.', 3),
  ('umfangreich', 'extensive / comprehensive', '', '{adjective}', 'Der Bericht ist umfangreich.', 'The report is comprehensive.', 4),
  ('nachvollziehbar', 'understandable / comprehensible', '', '{adjective}', 'Deine Entscheidung ist nachvollziehbar.', 'Your decision is understandable.', 5),
  ('angemessen', 'appropriate / reasonable', '', '{adjective}', 'Der Preis ist angemessen.', 'The price is reasonable.', 6),
  ('erheblich', 'considerable / significant', '', '{adjective}', 'Es gibt erhebliche Unterschiede.', 'There are considerable differences.', 7),
  ('deutlich', 'clear / noticeable', '', '{adjective}', 'Es gibt einen deutlichen Anstieg.', 'There is a clear increase.', 8),
  ('gründlich', 'thorough', '', '{adjective}', 'Sie arbeitet sehr gründlich.', 'She works very thoroughly.', 9),
  ('vorläufig', 'preliminary / provisional', '', '{adjective}', 'Das ist nur ein vorläufiges Ergebnis.', 'That is only a preliminary result.', 10),
  ('vorsichtig', 'careful / cautious', '', '{adjective}', 'Sei vorsichtig auf dem Eis.', 'Be careful on the ice.', 11),
  ('eindeutig', 'unambiguous / clear', '', '{adjective}', 'Die Antwort ist eindeutig.', 'The answer is unambiguous.', 12),
  ('umstritten', 'controversial', '', '{adjective}', 'Die Methode ist umstritten.', 'The method is controversial.', 13),
  ('wesentlich', 'essential / substantial', '', '{adjective}', 'Das ist ein wesentlicher Punkt.', 'That is an essential point.', 14),
  ('vielfältig', 'diverse / varied', '', '{adjective}', 'Die Angebote sind vielfältig.', 'The options are varied.', 15),
  ('selbstverständlich', 'self-evident / of course', '', '{adjective}', 'Das ist doch selbstverständlich.', 'That goes without saying.', 16),
  ('überzeugend', 'convincing', '', '{adjective}', 'Sein Argument war überzeugend.', 'His argument was convincing.', 17),
  ('beträchtlich', 'considerable', '', '{adjective}', 'Die Kosten sind beträchtlich.', 'The costs are considerable.', 18),
  ('voreingenommen', 'biased', '', '{adjective}', 'Der Bericht ist voreingenommen.', 'The report is biased.', 19),
  ('skeptisch', 'sceptical', '', '{adjective}', 'Ich bin da eher skeptisch.', 'I am rather sceptical about that.', 20),
  ('ehrgeizig', 'ambitious', '', '{adjective}', 'Sie ist sehr ehrgeizig.', 'She is very ambitious.', 21),
  ('rücksichtsvoll', 'considerate', '', '{adjective}', 'Sei rücksichtsvoll gegenüber anderen.', 'Be considerate towards others.', 22),
  ('hilfreich', 'helpful', '', '{adjective}', 'Dein Tipp war sehr hilfreich.', 'Your tip was very helpful.', 23),
  ('verlässlich', 'dependable', '', '{adjective}', 'Die Daten sind verlässlich.', 'The data is dependable.', 24),
  ('unverzichtbar', 'indispensable', '', '{adjective}', 'Das Internet ist unverzichtbar.', 'The internet is indispensable.', 25),
  ('voraussichtlich', 'expected / probably', '', '{adjective}', 'Voraussichtlich regnet es morgen.', 'It will probably rain tomorrow.', 26),
  ('grundsätzlich', 'fundamental(ly) / in principle', '', '{adjective}', 'Grundsätzlich bin ich einverstanden.', 'In principle I agree.', 27),
  ('erfreulich', 'pleasing / gratifying', '', '{adjective}', 'Das ist eine erfreuliche Nachricht.', 'That is pleasing news.', 28),
  ('bedauerlich', 'regrettable', '', '{adjective}', 'Es ist bedauerlich, dass du nicht kommst.', 'It is regrettable that you are not coming.', 29),
  ('zunehmend', 'increasing(ly)', '', '{adjective}', 'Das Thema wird zunehmend wichtig.', 'The topic is becoming increasingly important.', 30)
) as v(front, back, notes, tags, example, example_en, ord);

-- Fertig: 15 B2-Decks, additiv zu A1/A2/B1.


