-- Einstufungstest-Inhalte (Vokabeln/Grammatik/Lesen/Hören) — Seed.
-- Benötigt placement.sql (Schema). Idempotent über qkey; Audio bleibt erhalten.
-- Danach im Lehrerbereich → "Level test" die 2 Hör-Clips einsprechen.

insert into public.placement_questions (qkey, section, level, grp, kind, prompt, body, options, correct, sort_order)
values
  ($P7$vocab-1$P7$, $P7$vocab$P7$, $P7$A1$P7$, 0, $P7$choice$P7$, $P7$die Katze$P7$, $P7$$P7$, $P7$["the dog", "the mouse", "the cat"]$P7$::jsonb, 2, 1),
  ($P7$vocab-2$P7$, $P7$vocab$P7$, $P7$A2$P7$, 0, $P7$choice$P7$, $P7$die Rechnung$P7$, $P7$$P7$, $P7$["the bill / invoice", "the journey", "the meeting"]$P7$::jsonb, 0, 2),
  ($P7$vocab-3$P7$, $P7$vocab$P7$, $P7$B1$P7$, 0, $P7$choice$P7$, $P7$die Erfahrung$P7$, $P7$$P7$, $P7$["the invention", "the experience", "the permission"]$P7$::jsonb, 1, 3),
  ($P7$vocab-4$P7$, $P7$vocab$P7$, $P7$B2$P7$, 0, $P7$choice$P7$, $P7$die Voraussetzung$P7$, $P7$$P7$, $P7$["the consequence", "the exception", "the prerequisite"]$P7$::jsonb, 2, 4),
  ($P7$grammar-1$P7$, $P7$grammar$P7$, $P7$A1$P7$, 0, $P7$choice$P7$, $P7$Wir ___ aus Spanien und wohnen jetzt in Berlin.$P7$, $P7$$P7$, $P7$["kommen", "kommt", "komme"]$P7$::jsonb, 0, 5),
  ($P7$grammar-2$P7$, $P7$grammar$P7$, $P7$A2$P7$, 0, $P7$choice$P7$, $P7$Ich möchte ___ Kaffee, bitte.$P7$, $P7$$P7$, $P7$["ein", "einen", "eine"]$P7$::jsonb, 1, 6),
  ($P7$grammar-3$P7$, $P7$grammar$P7$, $P7$A2$P7$, 0, $P7$choice$P7$, $P7$Letztes Jahr ___ wir nach Italien gefahren.$P7$, $P7$$P7$, $P7$["haben", "waren", "sind"]$P7$::jsonb, 2, 7),
  ($P7$grammar-4$P7$, $P7$grammar$P7$, $P7$B1$P7$, 0, $P7$choice$P7$, $P7$Meine Schwester interessiert sich sehr ___ moderne Kunst.$P7$, $P7$$P7$, $P7$["für", "auf", "an"]$P7$::jsonb, 0, 8),
  ($P7$grammar-5$P7$, $P7$grammar$P7$, $P7$B1$P7$, 0, $P7$choice$P7$, $P7$Er kam zu spät, ___ der Zug Verspätung hatte.$P7$, $P7$$P7$, $P7$["denn", "weil", "deshalb"]$P7$::jsonb, 1, 9),
  ($P7$grammar-6$P7$, $P7$grammar$P7$, $P7$B2$P7$, 0, $P7$choice$P7$, $P7$Während ___ Besprechung klingelte plötzlich sein Handy.$P7$, $P7$$P7$, $P7$["die lange", "dem langen", "der langen"]$P7$::jsonb, 2, 10),
  ($P7$reading-1-text$P7$, $P7$reading$P7$, $P7$A2$P7$, 1, $P7$passage$P7$, $P7$$P7$, $P7$Hallo Sabine,

danke für deine Einladung zum Geburtstag am Samstag. Leider kann ich erst um acht Uhr kommen, weil ich bis sieben arbeiten muss. Ich bringe einen Salat mit. Soll ich auch Getränke kaufen? Bitte schreib mir kurz, was ihr noch braucht.

Bis Samstag!
Liebe Grüße, Markus$P7$, $P7$[]$P7$::jsonb, null, 11),
  ($P7$reading-1-q1$P7$, $P7$reading$P7$, $P7$A2$P7$, 1, $P7$choice$P7$, $P7$Why can Markus only arrive at eight o'clock?$P7$, $P7$$P7$, $P7$["He has to work until seven", "The bus comes late", "He is feeling sick"]$P7$::jsonb, 0, 12),
  ($P7$reading-1-q2$P7$, $P7$reading$P7$, $P7$A2$P7$, 1, $P7$choice$P7$, $P7$What does Markus offer to bring?$P7$, $P7$$P7$, $P7$["A cake", "A salad", "Some music"]$P7$::jsonb, 1, 13),
  ($P7$reading-2-text$P7$, $P7$reading$P7$, $P7$B2$P7$, 2, $P7$passage$P7$, $P7$$P7$, $P7$Immer mehr Menschen in deutschen Städten verzichten bewusst auf ein eigenes Auto. Statt selbst zu fahren, nutzen sie Busse, Bahnen oder Leihfahrräder. Viele berichten, dass sie dadurch nicht nur Geld sparen, sondern auch entspannter leben, weil sie sich nicht um Parkplätze kümmern müssen. Kritiker weisen jedoch darauf hin, dass der öffentliche Nahverkehr auf dem Land oft schlecht ausgebaut ist. Dort bleibt das Auto für viele Menschen vorerst unverzichtbar.$P7$, $P7$[]$P7$::jsonb, null, 14),
  ($P7$reading-2-q1$P7$, $P7$reading$P7$, $P7$B2$P7$, 2, $P7$choice$P7$, $P7$What trend does the text describe?$P7$, $P7$$P7$, $P7$["More city dwellers deliberately give up owning a car", "Cars in cities are becoming much cheaper", "Fewer people are using public transport"]$P7$::jsonb, 0, 15),
  ($P7$reading-2-q2$P7$, $P7$reading$P7$, $P7$B2$P7$, 2, $P7$choice$P7$, $P7$What criticism is mentioned in the text?$P7$, $P7$$P7$, $P7$["Rental bikes are far too expensive", "Public transport in rural areas is often poorly developed", "Trains in the cities are almost always late"]$P7$::jsonb, 1, 16),
  ($P7$listening-1-audio$P7$, $P7$listening$P7$, $P7$A2$P7$, 1, $P7$audio$P7$, $P7$You will hear a message left on an answering machine.$P7$, $P7$Guten Tag, hier ist die Praxis Dr. Weber. Wir rufen Sie an wegen Ihres Termins am Mittwoch um zehn Uhr. Leider hat Dr. Weber an diesem Tag eine Fortbildung. Können Sie stattdessen bitte am Donnerstag um neun Uhr kommen? Rufen Sie uns kurz zurück unter null drei zwei, eins vier fünf. Vielen Dank und auf Wiederhören.$P7$, $P7$[]$P7$::jsonb, null, 17),
  ($P7$listening-1-q1$P7$, $P7$listening$P7$, $P7$A2$P7$, 1, $P7$choice$P7$, $P7$Who is leaving this message?$P7$, $P7$$P7$, $P7$["A doctor's office", "A restaurant", "A travel agency"]$P7$::jsonb, 0, 18),
  ($P7$listening-1-q2$P7$, $P7$listening$P7$, $P7$A2$P7$, 1, $P7$choice$P7$, $P7$What new appointment is being suggested?$P7$, $P7$$P7$, $P7$["Wednesday at ten", "Thursday at nine", "Friday at noon"]$P7$::jsonb, 1, 19),
  ($P7$listening-2-audio$P7$, $P7$listening$P7$, $P7$B1$P7$, 2, $P7$audio$P7$, $P7$You will hear a traffic report on the radio.$P7$, $P7$Und nun der Verkehr. Auf der Autobahn A3 zwischen Köln und Frankfurt gibt es zurzeit einen langen Stau nach einem Unfall. Bitte rechnen Sie mit etwa einer Stunde Wartezeit und fahren Sie, wenn möglich, über die Landstraße. Außerdem ist die Innenstadt von Mainz wegen eines Stadtlaufs bis heute Mittag für Autos gesperrt. Nutzen Sie dort am besten Bus und Bahn. Gute Fahrt!$P7$, $P7$[]$P7$::jsonb, null, 20),
  ($P7$listening-2-q1$P7$, $P7$listening$P7$, $P7$B1$P7$, 2, $P7$choice$P7$, $P7$What caused the traffic jam on the A3?$P7$, $P7$$P7$, $P7$["Road construction", "An accident", "Bad weather"]$P7$::jsonb, 1, 21),
  ($P7$listening-2-q2$P7$, $P7$listening$P7$, $P7$B1$P7$, 2, $P7$choice$P7$, $P7$Why is the city centre of Mainz closed to cars?$P7$, $P7$$P7$, $P7$["Because of a city run", "Because of heavy snow", "Because of a street festival"]$P7$::jsonb, 0, 22)
on conflict (qkey) do update set
  section=excluded.section, level=excluded.level, grp=excluded.grp, kind=excluded.kind,
  prompt=excluded.prompt, body=excluded.body, options=excluded.options,
  correct=excluded.correct, sort_order=excluded.sort_order, is_published=true;
-- audio_url wird bewusst NICHT überschrieben (aufgenommene Clips bleiben).
