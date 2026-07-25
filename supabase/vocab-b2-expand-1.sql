-- ============================================================================
-- B2 VOKABEL-AUSBAU · Batch 1 (ADD-ONLY, 150 neue Karten)
-- ----------------------------------------------------------------------------
-- Auszufuehren ist die Dollar-Quoting-Fassung vocab-b2-expand-1-safe.sql
-- (schuetzt vor Smart-Quotes/Autokorrektur beim Einfuegen).
-- Add-only: loescht nichts, haengt nur an bestehende B2-Decks an (sort_order ab 101).
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default '';
alter table public.fc_cards add column if not exists example_en text not null default '';


-- ---------------------------------------------------------------------------
-- B2 · Politics & state
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Wähler', 'voter', '', '{}', 'Die Wähler entscheiden über die Zukunft.', 'The voters decide about the future.', 101),
  ('der Wahlkampf', 'election campaign', '', '{}', 'Der Wahlkampf dauert mehrere Wochen.', 'The election campaign lasts several weeks.', 102),
  ('der Kanzler', 'chancellor', '', '{}', 'Der Kanzler hält eine Rede im Parlament.', 'The chancellor gives a speech in parliament.', 103),
  ('die Koalition', 'coalition', '', '{}', 'Zwei Parteien bilden eine Koalition.', 'Two parties form a coalition.', 104),
  ('der Abgeordnete', 'member of parliament', 'adjektivisch: ein Abgeordneter', '{}', 'Der Abgeordnete stimmt gegen das Gesetz.', 'The member of parliament votes against the law.', 105),
  ('die Amtszeit', 'term of office', '', '{}', 'Seine Amtszeit endet nächstes Jahr.', 'His term of office ends next year.', 106),
  ('die Außenpolitik', 'foreign policy', '', '{}', 'Die Außenpolitik des Landes ändert sich.', 'The foreign policy of the country is changing.', 107),
  ('das Referendum', 'referendum', '', '{}', 'Über die Frage gab es ein Referendum.', 'There was a referendum on the question.', 108),
  ('die Korruption', 'corruption', '', '{}', 'Die Regierung kämpft gegen Korruption.', 'The government fights against corruption.', 109),
  ('der Rücktritt', 'resignation (from office)', '', '{}', 'Nach dem Skandal folgte sein Rücktritt.', 'After the scandal his resignation followed.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Politics & state'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Economy & business
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Aktie', 'share / stock', '', '{}', 'Er kauft Aktien von großen Firmen.', 'He buys shares of big companies.', 101),
  ('die Börse', 'stock exchange', '', '{}', 'An der Börse fallen heute die Kurse.', 'On the stock exchange prices are falling today.', 102),
  ('der Verlust', 'loss', '', '{}', 'Die Firma macht dieses Jahr Verlust.', 'The company is making a loss this year.', 103),
  ('die Rendite', 'return / yield', '', '{}', 'Die Rendite dieser Anlage ist gering.', 'The return on this investment is low.', 104),
  ('die Konjunktur', 'economic climate', '', '{}', 'Die Konjunktur hat sich abgeschwächt.', 'The economic climate has weakened.', 105),
  ('die Rezession', 'recession', '', '{}', 'Das Land steckt in einer Rezession.', 'The country is in a recession.', 106),
  ('die Arbeitslosigkeit', 'unemployment', '', '{}', 'Die Arbeitslosigkeit ist leicht gestiegen.', 'Unemployment has risen slightly.', 107),
  ('die Insolvenz', 'insolvency / bankruptcy', '', '{}', 'Das Unternehmen musste Insolvenz anmelden.', 'The company had to file for insolvency.', 108),
  ('die Lieferkette', 'supply chain', '', '{}', 'Probleme in der Lieferkette verzögern die Ware.', 'Problems in the supply chain delay the goods.', 109),
  ('die Marktwirtschaft', 'market economy', '', '{}', 'Deutschland hat eine soziale Marktwirtschaft.', 'Germany has a social market economy.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Economy & business'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Science & technology
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Hypothese', 'hypothesis', '', '{}', 'Die Hypothese muss noch überprüft werden.', 'The hypothesis still has to be tested.', 101),
  ('die Formel', 'formula', '', '{}', 'Diese Formel beschreibt die Bewegung.', 'This formula describes the movement.', 102),
  ('das Molekül', 'molecule', '', '{}', 'Wasser besteht aus kleinen Molekülen.', 'Water consists of small molecules.', 103),
  ('die Gentechnik', 'genetic engineering', '', '{}', 'Gentechnik wird oft kontrovers diskutiert.', 'Genetic engineering is often discussed controversially.', 104),
  ('die Strahlung', 'radiation', '', '{}', 'Die Strahlung der Sonne ist stark.', 'The radiation from the sun is strong.', 105),
  ('der Algorithmus', 'algorithm', '', '{}', 'Ein Algorithmus steuert die Suche.', 'An algorithm controls the search.', 106),
  ('die Datenbank', 'database', '', '{}', 'Alle Kunden stehen in der Datenbank.', 'All customers are in the database.', 107),
  ('der Durchbruch', 'breakthrough', '', '{}', 'Den Forschern gelang ein Durchbruch.', 'The researchers achieved a breakthrough.', 108),
  ('die Automatisierung', 'automation', '', '{}', 'Die Automatisierung verändert die Arbeit.', 'Automation is changing work.', 109),
  ('nachweisen', 'to prove / detect', 'separable', '{}', 'Die Studie kann den Effekt nicht nachweisen.', 'The study cannot prove the effect.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Science & technology'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Environment & climate
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Feinstaub', 'particulate matter / fine dust', '', '{}', 'In der Stadt ist der Feinstaub ein Problem.', 'In the city particulate matter is a problem.', 101),
  ('die Dürre', 'drought', '', '{}', 'Die lange Dürre zerstört die Ernte.', 'The long drought destroys the harvest.', 102),
  ('der Meeresspiegel', 'sea level', '', '{}', 'Der Meeresspiegel steigt langsam an.', 'The sea level is slowly rising.', 103),
  ('die Artenvielfalt', 'biodiversity', '', '{}', 'Die Artenvielfalt nimmt weltweit ab.', 'Biodiversity is decreasing worldwide.', 104),
  ('das Ökosystem', 'ecosystem', '', '{}', 'Ein Ökosystem ist leicht aus dem Gleichgewicht zu bringen.', 'An ecosystem is easily thrown out of balance.', 105),
  ('der Lebensraum', 'habitat', '', '{}', 'Der Wald ist der Lebensraum vieler Tiere.', 'The forest is the habitat of many animals.', 106),
  ('die Abholzung', 'deforestation', '', '{}', 'Die Abholzung des Regenwaldes geht weiter.', 'The deforestation of the rainforest continues.', 107),
  ('die Windkraft', 'wind power', '', '{}', 'Windkraft liefert saubere Energie.', 'Wind power provides clean energy.', 108),
  ('der Klimaschutz', 'climate protection', '', '{}', 'Klimaschutz kostet Geld, aber lohnt sich.', 'Climate protection costs money, but it is worth it.', 109),
  ('der Naturschutz', 'nature conservation', '', '{}', 'Dieses Gebiet steht unter Naturschutz.', 'This area is under nature conservation.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Environment & climate'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Culture, art & media
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Skulptur', 'sculpture', '', '{}', 'Im Park steht eine moderne Skulptur.', 'There is a modern sculpture in the park.', 101),
  ('der Regisseur', 'director (film/theatre)', '', '{}', 'Der Regisseur bekommt einen Preis.', 'The director receives an award.', 102),
  ('der Schauspieler', 'actor', '', '{}', 'Der Schauspieler spielt die Hauptrolle.', 'The actor plays the leading role.', 103),
  ('die Bühne', 'stage', '', '{}', 'Die Sängerin steht auf der Bühne.', 'The singer is on the stage.', 104),
  ('das Drehbuch', 'screenplay / script', '', '{}', 'Das Drehbuch basiert auf einem Roman.', 'The screenplay is based on a novel.', 105),
  ('der Verlag', 'publishing house', '', '{}', 'Der Verlag bringt das Buch im Herbst heraus.', 'The publisher releases the book in autumn.', 106),
  ('die Rezension', 'review', '', '{}', 'Die Rezension in der Zeitung ist positiv.', 'The review in the newspaper is positive.', 107),
  ('das Urheberrecht', 'copyright', '', '{}', 'Das Foto ist durch das Urheberrecht geschützt.', 'The photo is protected by copyright.', 108),
  ('die Berichterstattung', 'reporting / coverage', '', '{}', 'Die Berichterstattung war sehr einseitig.', 'The coverage was very one-sided.', 109),
  ('die Handlung', 'plot / storyline', '', '{}', 'Die Handlung des Films ist spannend.', 'The plot of the film is exciting.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Culture, art & media'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Health & psychology
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Resilienz', 'resilience', '', '{}', 'Resilienz hilft, Krisen zu überstehen.', 'Resilience helps to get through crises.', 101),
  ('das Gedächtnis', 'memory', '', '{}', 'Sie hat ein sehr gutes Gedächtnis.', 'She has a very good memory.', 102),
  ('die Konzentration', 'concentration', '', '{}', 'Nach der Pause fällt die Konzentration leichter.', 'After the break concentration comes more easily.', 103),
  ('die Störung', 'disorder / disturbance', '', '{}', 'Er leidet an einer psychischen Störung.', 'He suffers from a mental disorder.', 104),
  ('das Trauma', 'trauma', '', '{}', 'Ein Trauma braucht Zeit zum Heilen.', 'A trauma needs time to heal.', 105),
  ('die Zuversicht', 'confidence / optimism', '', '{}', 'Trotz allem blickt sie mit Zuversicht nach vorn.', 'Despite everything she looks ahead with confidence.', 106),
  ('die Verzweiflung', 'despair', '', '{}', 'In seiner Verzweiflung rief er um Hilfe.', 'In his despair he called for help.', 107),
  ('die Einsamkeit', 'loneliness', '', '{}', 'Viele ältere Menschen leiden unter Einsamkeit.', 'Many older people suffer from loneliness.', 108),
  ('die Gelassenheit', 'composure / calmness', '', '{}', 'Mit der Zeit lernt man Gelassenheit.', 'With time you learn composure.', 109),
  ('verdrängen', 'to repress / suppress', '', '{}', 'Er verdrängt seine Probleme oft.', 'He often represses his problems.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Health & psychology'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Education & research
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Bachelor', 'bachelor degree (undergraduate)', '', '{}', 'Sie macht gerade ihren Bachelor.', 'She is currently doing her undergraduate degree.', 101),
  ('der Master', 'master degree (postgraduate)', '', '{}', 'Nach dem Bachelor folgt der Master.', 'After the bachelor comes the master.', 102),
  ('das Gutachten', 'expert report / assessment', '', '{}', 'Ein Gutachten bestätigt die Ergebnisse.', 'An expert report confirms the results.', 103),
  ('die Fußnote', 'footnote', '', '{}', 'Die Quelle steht in der Fußnote.', 'The source is in the footnote.', 104),
  ('das Literaturverzeichnis', 'bibliography', '', '{}', 'Am Ende folgt das Literaturverzeichnis.', 'At the end comes the bibliography.', 105),
  ('die Umfrage', 'survey', '', '{}', 'Die Umfrage zeigt ein klares Ergebnis.', 'The survey shows a clear result.', 106),
  ('die Stichprobe', 'sample', '', '{}', 'Die Stichprobe war leider zu klein.', 'The sample was unfortunately too small.', 107),
  ('die Kompetenz', 'competence / skill', '', '{}', 'Sprachliche Kompetenz ist im Beruf wichtig.', 'Language competence is important at work.', 108),
  ('die Lehrkraft', 'teacher / instructor', 'geschlechtsneutral', '{}', 'Die Lehrkraft erklärt die Aufgabe.', 'The teacher explains the task.', 109),
  ('der Nachweis', 'proof / certificate', '', '{}', 'Für den Kurs braucht man einen Nachweis.', 'For the course you need a certificate.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Education & research'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Society & social issues
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Ungleichheit', 'inequality', '', '{}', 'Die soziale Ungleichheit wächst.', 'Social inequality is growing.', 101),
  ('der Reichtum', 'wealth', '', '{}', 'Der Reichtum ist ungleich verteilt.', 'Wealth is unequally distributed.', 102),
  ('die Obdachlosigkeit', 'homelessness', '', '{}', 'Die Stadt kämpft gegen Obdachlosigkeit.', 'The city fights against homelessness.', 103),
  ('die Ausbeutung', 'exploitation', '', '{}', 'Die Ausbeutung von Arbeitern ist verboten.', 'The exploitation of workers is forbidden.', 104),
  ('die Toleranz', 'tolerance', '', '{}', 'Toleranz ist die Grundlage des Zusammenlebens.', 'Tolerance is the basis of living together.', 105),
  ('die Zivilgesellschaft', 'civil society', '', '{}', 'Die Zivilgesellschaft engagiert sich stark.', 'Civil society is highly engaged.', 106),
  ('das Gemeinwohl', 'common good', '', '{}', 'Politik sollte dem Gemeinwohl dienen.', 'Politics should serve the common good.', 107),
  ('die Teilhabe', 'participation / inclusion', '', '{}', 'Alle sollen Teilhabe am Leben haben.', 'Everyone should have participation in life.', 108),
  ('der Fachkräftemangel', 'shortage of skilled workers', '', '{}', 'Der Fachkräftemangel trifft viele Branchen.', 'The shortage of skilled workers affects many industries.', 109),
  ('die Inklusion', 'inclusion', '', '{}', 'Inklusion bedeutet, niemanden auszuschließen.', 'Inclusion means excluding no one.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Society & social issues'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Idioms & expressions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('Öl ins Feuer gießen', 'to add fuel to the fire', 'idiom', '{}', 'Mit dem Kommentar goss er nur Öl ins Feuer.', 'With that comment he only added fuel to the fire.', 101),
  ('das Kind mit dem Bade ausschütten', 'to throw the baby out with the bathwater', 'idiom', '{}', 'Schütte nicht das Kind mit dem Bade aus.', 'Do not throw the baby out with the bathwater.', 102),
  ('jemandem einen Bären aufbinden', 'to tell someone a tall tale', 'idiom', '{}', 'Er hat dir einen Bären aufgebunden.', 'He was pulling your leg.', 103),
  ('unter vier Augen', 'in private / one on one', 'idiom', '{}', 'Können wir das unter vier Augen besprechen?', 'Can we discuss this in private?', 104),
  ('den Kopf in den Sand stecken', 'to bury your head in the sand', 'idiom', '{}', 'Steck nicht den Kopf in den Sand!', 'Do not bury your head in the sand!', 105),
  ('jemandem auf den Zahn fühlen', 'to sound someone out', 'idiom', '{}', 'Im Gespräch fühlte sie ihm auf den Zahn.', 'In the conversation she sounded him out.', 106),
  ('jemandem einen Strich durch die Rechnung machen', 'to thwart the plans of someone', 'idiom', '{}', 'Das Wetter machte uns einen Strich durch die Rechnung.', 'The weather thwarted our plans.', 107),
  ('das Handtuch werfen', 'to throw in the towel', 'idiom', '{}', 'Kurz vor dem Ziel warf er das Handtuch.', 'Just before the finish he threw in the towel.', 108),
  ('auf großem Fuß leben', 'to live large / beyond your means', 'idiom', '{}', 'Nach dem Gewinn lebte sie auf großem Fuß.', 'After the win she lived large.', 109),
  ('mit dem Feuer spielen', 'to play with fire', 'idiom', '{}', 'Wer lügt, spielt mit dem Feuer.', 'Whoever lies is playing with fire.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Idioms & expressions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Abstract nouns
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Aspekt', 'aspect', '', '{}', 'Dieser Aspekt ist besonders wichtig.', 'This aspect is particularly important.', 101),
  ('die Perspektive', 'perspective', '', '{}', 'Aus meiner Perspektive ist das falsch.', 'From my perspective that is wrong.', 102),
  ('das Ausmaß', 'extent / scale', '', '{}', 'Das Ausmaß des Schadens ist noch unklar.', 'The extent of the damage is still unclear.', 103),
  ('die Konsequenz', 'consequence', '', '{}', 'Jede Entscheidung hat Konsequenzen.', 'Every decision has consequences.', 104),
  ('das Prinzip', 'principle', '', '{}', 'Im Prinzip stimme ich dir zu.', 'In principle I agree with you.', 105),
  ('der Maßstab', 'standard / benchmark', '', '{}', 'Diese Arbeit setzt einen neuen Maßstab.', 'This work sets a new benchmark.', 106),
  ('der Rahmen', 'framework / scope', '', '{}', 'Das sprengt den Rahmen dieses Kurses.', 'That goes beyond the scope of this course.', 107),
  ('der Gegensatz', 'contrast / opposite', '', '{}', 'Im Gegensatz zu dir mag ich Winter.', 'In contrast to you I like winter.', 108),
  ('der Zufall', 'coincidence / chance', '', '{}', 'Wir trafen uns durch reinen Zufall.', 'We met by pure chance.', 109),
  ('die Notwendigkeit', 'necessity', '', '{}', 'Es besteht keine Notwendigkeit zu warten.', 'There is no necessity to wait.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Abstract nouns'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Argumentation
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('angesichts', 'in view of / given', '+ Genitiv', '{}', 'Angesichts der Lage müssen wir handeln.', 'In view of the situation we have to act.', 101),
  ('ungeachtet', 'regardless of', '+ Genitiv', '{}', 'Ungeachtet der Kritik hält sie am Plan fest.', 'Regardless of the criticism she sticks to the plan.', 102),
  ('gemäß', 'according to / in accordance with', '+ Dativ', '{}', 'Gemäß dem Gesetz ist das verboten.', 'According to the law that is forbidden.', 103),
  ('laut', 'according to', '+ Dativ (oder Genitiv)', '{}', 'Laut dem Bericht steigt die Zahl.', 'According to the report the number is rising.', 104),
  ('mittels', 'by means of', '+ Genitiv', '{}', 'Mittels einer Umfrage sammeln wir Daten.', 'By means of a survey we collect data.', 105),
  ('demzufolge', 'according to which / consequently', '', '{}', 'Die Studie ist neu; demzufolge fehlen Vergleiche.', 'The study is new; consequently comparisons are missing.', 106),
  ('nichtsdestotrotz', 'nonetheless', '', '{}', 'Es war schwer; nichtsdestotrotz gab er nicht auf.', 'It was hard; nonetheless he did not give up.', 107),
  ('widerlegen', 'to refute / disprove', '', '{}', 'Die Daten widerlegen seine These.', 'The data refute his thesis.', 108),
  ('untermauern', 'to substantiate / back up', '', '{}', 'Er untermauert das Argument mit Zahlen.', 'He backs up the argument with figures.', 109),
  ('veranschaulichen', 'to illustrate', '', '{}', 'Ein Beispiel veranschaulicht das Problem.', 'An example illustrates the problem.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Argumentation'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Verbs + prepositions
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('beruhen auf', 'to be based on', '+ Dativ', '{}', 'Sein Erfolg beruht auf harter Arbeit.', 'His success is based on hard work.', 101),
  ('sich ergeben aus', 'to result from', '+ Dativ', '{}', 'Das Problem ergibt sich aus dem Fehler.', 'The problem results from the mistake.', 102),
  ('schließen aus', 'to conclude from', '+ Dativ', '{}', 'Daraus schließe ich, dass er recht hat.', 'From this I conclude that he is right.', 103),
  ('zurückführen auf', 'to attribute to / trace back to', '+ Akkusativ', '{}', 'Man führt den Fehler auf Stress zurück.', 'The mistake is attributed to stress.', 104),
  ('verweisen auf', 'to refer to / point to', '+ Akkusativ', '{}', 'Der Autor verweist auf eine Studie.', 'The author refers to a study.', 105),
  ('ankommen auf', 'to depend on', '+ Akkusativ (es kommt darauf an)', '{}', 'Es kommt auf das Wetter an.', 'It depends on the weather.', 106),
  ('appellieren an', 'to appeal to', '+ Akkusativ', '{}', 'Sie appelliert an die Vernunft.', 'She appeals to reason.', 107),
  ('sich belaufen auf', 'to amount to', '+ Akkusativ', '{}', 'Die Kosten belaufen sich auf tausend Euro.', 'The costs amount to a thousand euros.', 108),
  ('sich richten nach', 'to be guided by / depend on', '+ Dativ', '{}', 'Der Preis richtet sich nach der Menge.', 'The price depends on the quantity.', 109),
  ('sich orientieren an', 'to orient oneself by / follow', '+ Dativ', '{}', 'Wir orientieren uns an den Regeln.', 'We orient ourselves by the rules.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Verbs + prepositions'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Work & communication
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('der Ansprechpartner', 'contact person', '', '{}', 'Frau Weber ist Ihre Ansprechpartnerin.', 'Ms Weber is your contact person.', 101),
  ('der Betreff', 'subject (of an email)', '', '{}', 'Schreiben Sie bitte einen klaren Betreff.', 'Please write a clear subject line.', 102),
  ('der Entwurf', 'draft', '', '{}', 'Ich schicke dir einen ersten Entwurf.', 'I am sending you a first draft.', 103),
  ('die Präsentation', 'presentation', '', '{}', 'Die Präsentation dauert zwanzig Minuten.', 'The presentation lasts twenty minutes.', 104),
  ('der Leitfaden', 'guideline / manual', '', '{}', 'Im Leitfaden stehen alle Schritte.', 'All the steps are in the guideline.', 105),
  ('die Umsetzung', 'implementation', '', '{}', 'Die Umsetzung des Plans beginnt morgen.', 'The implementation of the plan starts tomorrow.', 106),
  ('der Aufwand', 'effort / expense', '', '{}', 'Der Aufwand lohnt sich am Ende.', 'The effort is worth it in the end.', 107),
  ('unverzüglich', 'immediately / without delay', 'formell', '{}', 'Bitte antworten Sie unverzüglich.', 'Please reply without delay.', 108),
  ('fristgerecht', 'on time / by the deadline', '', '{}', 'Der Antrag wurde fristgerecht eingereicht.', 'The application was submitted on time.', 109),
  ('die Erinnerung', 'reminder', 'auch: Gedächtnis-Erinnerung', '{}', 'Ich schicke dir eine Erinnerung an den Termin.', 'I am sending you a reminder about the appointment.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Work & communication'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Law & rules
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('die Klage', 'lawsuit / legal action', '', '{}', 'Er reicht eine Klage gegen die Firma ein.', 'He files a lawsuit against the company.', 101),
  ('der Angeklagte', 'the defendant / accused', 'adjektivisch: ein Angeklagter', '{}', 'Der Angeklagte schweigt vor Gericht.', 'The defendant stays silent in court.', 102),
  ('der Richter', 'judge', '', '{}', 'Der Richter verkündet das Urteil.', 'The judge announces the verdict.', 103),
  ('der Staatsanwalt', 'public prosecutor', '', '{}', 'Der Staatsanwalt fordert eine hohe Strafe.', 'The prosecutor demands a heavy sentence.', 104),
  ('die Berufung', 'appeal', 'Berufung einlegen', '{}', 'Gegen das Urteil legt sie Berufung ein.', 'She appeals against the verdict.', 105),
  ('der Paragraf', 'section / paragraph (of law)', '', '{}', 'Das steht in Paragraf zehn.', 'That is in section ten.', 106),
  ('die Verordnung', 'regulation / decree', '', '{}', 'Eine neue Verordnung tritt in Kraft.', 'A new regulation comes into force.', 107),
  ('das Bußgeld', 'fine / penalty', '', '{}', 'Für Falschparken zahlt man ein Bußgeld.', 'For parking wrongly you pay a fine.', 108),
  ('der Beschluss', 'decision / resolution', '', '{}', 'Der Beschluss wurde einstimmig gefasst.', 'The decision was made unanimously.', 109),
  ('die Klausel', 'clause', '', '{}', 'Diese Klausel im Vertrag ist unklar.', 'This clause in the contract is unclear.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Law & rules'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- ---------------------------------------------------------------------------
-- B2 · Nuanced adjectives
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ('fragwürdig', 'questionable / dubious', '', '{}', 'Seine Methoden sind ziemlich fragwürdig.', 'His methods are quite questionable.', 101),
  ('naheliegend', 'obvious / logical', '', '{}', 'Die Lösung ist eigentlich naheliegend.', 'The solution is actually quite obvious.', 102),
  ('weitreichend', 'far-reaching', '', '{}', 'Die Entscheidung hat weitreichende Folgen.', 'The decision has far-reaching consequences.', 103),
  ('ausschlaggebend', 'decisive', '', '{}', 'Der Preis war ausschlaggebend für den Kauf.', 'The price was decisive for the purchase.', 104),
  ('geringfügig', 'marginal / slight', '', '{}', 'Der Unterschied ist nur geringfügig.', 'The difference is only marginal.', 105),
  ('unmittelbar', 'immediate / direct', '', '{}', 'Es gibt einen unmittelbaren Zusammenhang.', 'There is a direct connection.', 106),
  ('plausibel', 'plausible', '', '{}', 'Seine Erklärung klingt plausibel.', 'His explanation sounds plausible.', 107),
  ('stichhaltig', 'sound / valid (argument)', '', '{}', 'Das ist kein stichhaltiges Argument.', 'That is not a sound argument.', 108),
  ('widersprüchlich', 'contradictory', '', '{}', 'Die Aussagen der Zeugen sind widersprüchlich.', 'The statements of the witnesses are contradictory.', 109),
  ('gravierend', 'serious / grave', '', '{}', 'Das ist ein gravierender Fehler.', 'That is a serious mistake.', 110)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = 'B2 · Nuanced adjectives'
  and d.owner_id = (select id from auth.users where email = 'marvin.h.graf@gmail.com');


-- Kontrolle: B2-Kartenzahl gesamt
select count(*) as b2_karten
from public.fc_cards c join public.fc_decks d on d.id = c.deck_id
where d.level = 'B2';
