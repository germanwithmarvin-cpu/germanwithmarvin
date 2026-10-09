-- B1-Modellprüfungen (3 Varianten) — Seed für den Prüfungstrainer.
-- Benötigt exams.sql (Schema). Idempotent: überschreibt die B1-Papers neu.
-- Danach im Lehrerbereich → Exams die Hör-Audios aufnehmen + veröffentlichen.

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ('B1', 1, $X7$B1-Modellprüfung 1: Alltag, Arbeit und Wohnen$X7$, $X7$Lesen, Hören und Schreiben rund um Alltag, Beruf und Wohnen$X7$, true, 1)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antwortmöglichkeiten (a, b oder c), aber nur eine Antwort ist richtig. Kreuzen Sie die richtige Antwort an.$X7$, 50, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Durchsage im Büro

Liebe Kolleginnen und Kollegen, wegen Wartungsarbeiten an der Heizungsanlage bleibt das Bürogebäude in der Goethestraße am kommenden Freitag geschlossen. Bitte arbeiten Sie an diesem Tag von zu Hause aus. Die Technikabteilung hat allen Mitarbeitenden bereits einen Zugang für das Firmennetz eingerichtet. Wer keinen Laptop besitzt, meldet sich bitte bis Mittwoch beim Sekretariat, dann wird ein Gerät bereitgestellt. Wichtige Besprechungen finden wie geplant online statt. Ab Montag ist das Gebäude wieder normal geöffnet.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum bleibt das Bürogebäude am Freitag geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Weil die Heizungsanlage gewartet wird.", "Weil an diesem Tag ein Feiertag ist.", "Weil die Firma in ein neues Gebäude umzieht."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was sollen Mitarbeitende ohne eigenen Laptop tun?$X7$, $X7$$X7$, $X7${"options": ["Am Freitag trotzdem ins Büro kommen.", "Sich bis Mittwoch beim Sekretariat melden.", "Sich selbst einen Laptop kaufen."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was passiert mit den wichtigen Besprechungen?$X7$, $X7$$X7$, $X7${"options": ["Sie fallen am Freitag aus.", "Sie werden auf Montag verschoben.", "Sie finden wie geplant online statt."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail einer Kollegin

Hallo Tom,

ich muss dich um einen Gefallen bitten. Nächste Woche habe ich am Dienstag einen wichtigen Arzttermin und kann deshalb erst um zehn Uhr anfangen. Könntest du die Teambesprechung um neun Uhr allein übernehmen? Die Unterlagen dafür liegen schon auf dem gemeinsamen Laufwerk im Ordner „Projekt Nord“. Falls etwas unklar ist, ruf mich einfach an, ich habe mein Handy dabei. Als Dank lade ich dich nächste Woche zum Mittagessen ein.

Viele Grüße
Sabine$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum schreibt Sabine die E-Mail?$X7$, $X7$$X7$, $X7${"options": ["Sie möchte Tom zum Mittagessen einladen.", "Sie bittet Tom, eine Besprechung allein zu leiten.", "Sie sucht die Unterlagen für ein Projekt."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Wo findet Tom die Unterlagen für die Besprechung?$X7$, $X7$$X7$, $X7${"options": ["Auf dem gemeinsamen Laufwerk.", "Auf Sabines Schreibtisch.", "In einer zweiten E-Mail."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Tom tun, wenn er Fragen hat?$X7$, $X7$$X7$, $X7${"options": ["Bis Dienstag warten.", "Dem Chef eine E-Mail schreiben.", "Sabine auf dem Handy anrufen."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Forenbeitrag

Hallo zusammen,

ich bin vor einem Monat in eine WG gezogen und bin eigentlich sehr zufrieden. Nur eine Sache stört mich: Mein Mitbewohner hört abends oft laut Musik, auch nach elf Uhr. Ich muss aber früh zur Arbeit und kann dann nicht schlafen. Ich möchte keinen Streit, deshalb habe ich ihn noch nicht direkt angesprochen. Hat jemand einen Tipp, wie ich das Thema höflich anspreche? Vielleicht habt ihr ja ähnliche Erfahrungen gemacht.

Danke im Voraus!
Jana$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was ist Janas Problem in der WG?$X7$, $X7$$X7$, $X7${"options": ["Die Wohnung ist zu teuer.", "Ihr Mitbewohner ist abends zu laut.", "Sie findet keinen Platz zum Arbeiten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Warum hat Jana mit ihrem Mitbewohner noch nicht gesprochen?$X7$, $X7$$X7$, $X7${"options": ["Sie möchte keinen Streit.", "Sie ist fast nie zu Hause.", "Sie kennt seinen Namen nicht."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Worum bittet Jana die anderen im Forum?$X7$, $X7$$X7$, $X7${"options": ["Um eine neue Wohnung.", "Um Geld für die Miete.", "Um einen Tipp für ein höfliches Gespräch."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Kurzer Artikel

Immer mehr Menschen in Deutschland arbeiten teilweise von zu Hause. Studien zeigen, dass viele Beschäftigte dadurch Zeit sparen, weil der lange Weg zur Arbeit wegfällt. Gleichzeitig berichten manche, dass ihnen der Kontakt zu den Kolleginnen und Kollegen fehlt. Fachleute empfehlen deshalb eine Mischung: einige Tage im Büro, einige Tage zu Hause. So bleibt der Austausch im Team erhalten, und trotzdem hat man Ruhe für konzentrierte Aufgaben. Wichtig ist außerdem, dass man zu Hause einen festen Arbeitsplatz hat.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 13),
    (sid, 4, $X7$choice$X7$, $X7$Welchen Vorteil des Homeoffice nennt der Text?$X7$, $X7$$X7$, $X7${"options": ["Man verdient mehr Geld.", "Man bekommt mehr Urlaub.", "Man spart den Weg zur Arbeit."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 14),
    (sid, 4, $X7$choice$X7$, $X7$Was raten die Fachleute?$X7$, $X7$$X7$, $X7${"options": ["Eine Mischung aus Büro und Homeoffice.", "Nur noch zu Hause zu arbeiten.", "Immer im Büro zu bleiben."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 15);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Hören Sie jede Durchsage bzw. Nachricht einmal (bei Bedarf zweimal) und kreuzen Sie bei jeder Aufgabe die richtige Lösung an. Es ist immer nur eine Antwort richtig. Sie haben am Ende Zeit, Ihre Antworten zu übertragen.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einem Supermarkt.$X7$, $X7$Liebe Kundinnen und Kunden, herzlich willkommen in Ihrem Markt am Bahnhof. Heute finden Sie frisches Obst und Gemüse zum Sonderpreis. An unserer Fleischtheke erhalten Sie außerdem noch bis achtzehn Uhr ein besonderes Angebot. Bitte beachten Sie auch: Ab morgen öffnen wir samstags schon um sieben Uhr für Sie. Haben Sie Ihr Pfand schon zurückgegeben? Der Automat befindet sich direkt am Eingang. Wir wünschen Ihnen einen schönen Einkauf.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was gibt es heute zum Sonderpreis?$X7$, $X7$$X7$, $X7${"options": ["Brot und Kuchen", "Obst und Gemüse", "Käse und Wurst"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Bis wann gilt das Angebot an der Fleischtheke?$X7$, $X7$$X7$, $X7${"options": ["bis 16 Uhr", "bis 20 Uhr", "bis 18 Uhr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was ändert sich ab morgen?$X7$, $X7$$X7$, $X7${"options": ["Der Markt öffnet samstags früher.", "Der Markt schließt abends später.", "Der Markt öffnet auch sonntags."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Guten Tag, hier spricht die Hausverwaltung Berger. Ich rufe wegen Ihrer Wohnung in der Lindenstraße an. Am Donnerstag kommt zwischen neun und zwölf Uhr ein Handwerker, um die Heizung zu prüfen. Bitte sorgen Sie dafür, dass an diesem Vormittag jemand zu Hause ist. Falls Ihnen der Termin nicht passt, rufen Sie mich bitte bis Mittwoch zurück. Außerdem möchte ich Sie daran erinnern, die Miete für diesen Monat noch zu überweisen. Vielen Dank und auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wer hat diese Nachricht hinterlassen?$X7$, $X7$$X7$, $X7${"options": ["Ein Handwerker", "Die Hausverwaltung", "Ein Nachbar"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Warum kommt am Donnerstag jemand in die Wohnung?$X7$, $X7$$X7$, $X7${"options": ["Um die Heizung zu prüfen", "Um die Wohnung zu putzen", "Um die Miete abzuholen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Woran soll der Mieter außerdem denken?$X7$, $X7$$X7$, $X7${"options": ["Den Handwerker bar zu bezahlen", "Einen neuen Vertrag zu unterschreiben", "Die Miete zu überweisen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören die Verkehrsnachrichten im Radio.$X7$, $X7$Und nun die Verkehrsnachrichten. Auf der Autobahn A3 zwischen Köln und Frankfurt gibt es wegen einer Baustelle einen Stau von etwa fünf Kilometern. Bitte planen Sie mehr Zeit ein. In der Innenstadt von Mainz ist die Hauptstraße heute wegen eines Marktes gesperrt. Benutzen Sie bitte die Umleitung über die Rheinstraße. Und für alle Pendler gibt es eine gute Nachricht: Die Buslinie zwölf fährt ab heute wieder im Zehn-Minuten-Takt. Fahren Sie vorsichtig und kommen Sie gut an.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Warum gibt es einen Stau auf der A3?$X7$, $X7$$X7$, $X7${"options": ["Wegen eines Unfalls", "Wegen einer Baustelle", "Wegen schlechten Wetters"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Warum ist die Hauptstraße in Mainz gesperrt?$X7$, $X7$$X7$, $X7${"options": ["Wegen eines Marktes", "Wegen eines Unfalls", "Wegen Bauarbeiten"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was ist die gute Nachricht für Pendler?$X7$, $X7$$X7$, $X7${"options": ["Die Bustickets sind jetzt billiger.", "Die Buslinie 12 fährt wieder häufiger.", "Es gibt eine ganz neue Buslinie."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Achten Sie auf eine passende Anrede, einen klaren Aufbau und einen höflichen Schluss. Schreiben Sie in ganzen Sätzen und gehen Sie auf alle Leitpunkte ein.$X7$, 60, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe 1: Forenbeitrag

In einem Online-Forum zum Thema Wohnen diskutieren die Teilnehmer über die Frage: „In einer WG wohnen oder lieber allein?“ Schreiben Sie einen Beitrag für das Forum.

Gehen Sie dabei auf folgende Punkte ein:
- Wie und wo wohnen Sie zurzeit (zum Beispiel allein, in einer WG oder bei der Familie)?
- Welche Vor- und Nachteile hat Ihre Wohnform für Sie?
- Was ist Ihnen beim Wohnen besonders wichtig?

Schreiben Sie zu jedem Punkt ein bis zwei Sätze. Vergessen Sie Anrede und Gruß nicht.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 70, 90, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Aufgabe 2: Kurze Mitteilung

Sie sind heute krank und können nicht zur Arbeit kommen. Am Vormittag ist aber eine wichtige Besprechung geplant. Schreiben Sie eine kurze Nachricht an Ihre Chefin, Frau Richter.

Gehen Sie dabei auf folgende Punkte ein:
- Entschuldigen Sie sich und erklären Sie kurz den Grund.
- Sagen Sie, wie lange Sie voraussichtlich fehlen werden.
- Machen Sie einen Vorschlag, was mit der Besprechung passieren soll.

Schreiben Sie höflich und in ganzen Sätzen.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ('B1', 2, $X7$B1-Modellprüfung 2: Reisen, Gesundheit und Freizeit$X7$, $X7$Eine komplette Übungsprüfung im Goethe-/telc-Stil zu den Themen Reisen, Gesundheit und Freizeit$X7$, false, 2)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben. Für jede Aufgabe gibt es genau eine richtige Antwort. Markieren Sie die passende Lösung.$X7$, 50, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Durchsage am Hauptbahnhof München:

Sehr geehrte Reisende, wir informieren Sie über eine Änderung: Der ICE 592 nach Hamburg, planmäßige Abfahrt 14:20 Uhr auf Gleis 11, fährt heute wegen Bauarbeiten an der Strecke von Gleis 8 ab. Außerdem hat der Zug voraussichtlich etwa 25 Minuten Verspätung. Reisende mit Anschlusszügen in Hannover bitten wir, sich am Service-Point in der Bahnhofshalle zu informieren. Der Speisewagen ist heute geschlossen; am Bahnsteig finden Sie jedoch einen Imbissstand. Wir danken für Ihr Verständnis und wünschen Ihnen eine gute Reise.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum fährt der ICE 592 von einem anderen Gleis ab?$X7$, $X7$$X7$, $X7${"options": ["Wegen Bauarbeiten an der Strecke", "Weil zu viele Reisende warten", "Weil ein anderer Zug Verspätung hat"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was sollen Reisende mit Anschlusszügen in Hannover tun?$X7$, $X7$$X7$, $X7${"options": ["Im Zug beim Schaffner fragen", "Sich am Service-Point informieren", "Einen späteren Zug nehmen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was erfährt man über das Essen im Zug?$X7$, $X7$$X7$, $X7${"options": ["Es gibt kostenloses Essen am Platz", "Der Speisewagen ist heute geschlossen", "Der Imbissstand ist im Zug"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Liebe Sabine,

jetzt ist es endlich passiert: Beim Joggen im Park bin ich letzte Woche unglücklich gestürzt und habe mir den Fuß verstaucht. Zum Glück ist nichts gebrochen, aber der Arzt hat mir gesagt, ich soll den Fuß zwei Wochen schonen und keinen Sport machen. Das ist wirklich ärgerlich, weil wir doch für nächsten Monat die Wanderung in den Alpen geplant hatten. Ich schlage vor, wir verschieben sie auf den Herbst – dann bin ich bestimmt wieder fit. Könntest du Petra Bescheid sagen? Ich melde mich am Wochenende telefonisch bei dir.

Liebe Grüße
Monika$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was ist Monika passiert?$X7$, $X7$$X7$, $X7${"options": ["Sie hat sich den Fuß gebrochen", "Sie hat sich beim Joggen den Fuß verstaucht", "Sie ist krank geworden"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was rät der Arzt Monika?$X7$, $X7$$X7$, $X7${"options": ["Den Fuß zwei Wochen zu schonen", "Sofort wieder zu joggen", "Eine Operation machen zu lassen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was möchte Monika mit der Wanderung machen?$X7$, $X7$$X7$, $X7${"options": ["Sie ganz absagen", "Sie auf den Herbst verschieben", "Sie allein machen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Forenbeitrag im Reiseforum „Unterwegs":

Hallo zusammen! Ich plane im Sommer meine erste längere Fahrradtour entlang der Donau, von Passau bis Wien, und habe ein paar Fragen. Wie viele Kilometer schafft man als Anfänger pro Tag bequem? Ich möchte nämlich auch Zeit haben, um kleine Städte anzuschauen und am Fluss zu entspannen. Außerdem: Lohnt es sich, die Unterkünfte vorher zu buchen, oder findet man unterwegs problemlos etwas? Mein Budget ist eher knapp, deshalb überlege ich, ob Campingplätze eine gute Idee sind. Über Tipps von erfahrenen Radlern würde ich mich sehr freuen. Danke schon mal!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was ist das Ziel des Schreibers?$X7$, $X7$$X7$, $X7${"options": ["Er sucht jemanden zum Mitfahren", "Er möchte Tipps für seine Fahrradtour", "Er will sein Fahrrad verkaufen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Warum will der Schreiber nicht zu viele Kilometer pro Tag fahren?$X7$, $X7$$X7$, $X7${"options": ["Weil er Zeit zum Anschauen und Entspannen möchte", "Weil sein Fahrrad kaputt ist", "Weil die Strecke sehr gefährlich ist"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Warum denkt er über Campingplätze nach?$X7$, $X7$$X7$, $X7${"options": ["Weil er gern in der Natur schläft", "Weil sein Budget knapp ist", "Weil es keine Hotels gibt"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Anzeige:

Gesundheitstage im Stadtpark – Bewegung für alle!

Vom 15. bis 17. Mai lädt die Stadt zu drei Tagen rund um Gesundheit und Freizeit ein. Täglich von 10 bis 18 Uhr erwarten Sie kostenlose Schnupperkurse: Yoga, Nordic Walking, Rückengymnastik und Tanz. Für Kinder gibt es einen eigenen Bewegungsparcours. Ärztinnen und Ärzte beantworten an Ständen Ihre Fragen zu gesunder Ernährung und Stressabbau. Bitte bringen Sie bequeme Kleidung mit. Eine Anmeldung ist nur für den Yoga-Kurs nötig und online möglich. Bei starkem Regen entfällt das Programm im Freien; die Vorträge finden dann in der Stadthalle statt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 13),
    (sid, 4, $X7$choice$X7$, $X7$Was kosten die Schnupperkurse?$X7$, $X7$$X7$, $X7${"options": ["Sie sind kostenlos", "Sie kosten fünf Euro pro Tag", "Nur Yoga ist kostenlos"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14),
    (sid, 4, $X7$choice$X7$, $X7$Für welchen Kurs muss man sich anmelden?$X7$, $X7$$X7$, $X7${"options": ["Für Nordic Walking", "Für den Tanzkurs", "Für den Yoga-Kurs"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 15),
    (sid, 4, $X7$choice$X7$, $X7$Was passiert bei starkem Regen?$X7$, $X7$$X7$, $X7${"options": ["Die Vorträge finden in der Stadthalle statt", "Die Veranstaltung wird ganz abgesagt", "Alle Kurse werden verschoben"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 16);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Hörmodul B1 — Reisen, Gesundheit und Freizeit. Sie hören drei kurze Texte, jeder Text wird einmal vorgelesen. Lesen Sie zuerst die Fragen zu jedem Text. Hören Sie dann zu und kreuzen Sie bei jeder Frage die richtige Antwort (a, b oder c) an. Es ist immer nur eine Antwort richtig.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage am Bahnhof.$X7$, $X7$Sehr geehrte Fahrgäste, wir informieren Sie über eine Änderung. Der Intercity nach Hamburg mit planmäßiger Abfahrt um 14 Uhr 20 fällt heute leider aus. Wir bitten Sie, auf den nächsten Zug um 15 Uhr 05 auszuweichen. Dieser fährt heute ausnahmsweise von Gleis 7 statt von Gleis 3 ab. Reisende mit Anschlusstickets wenden sich bitte an das Service-Center in der Bahnhofshalle. Wir entschuldigen uns für die Unannehmlichkeiten und wünschen Ihnen trotzdem eine gute Reise.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was passiert mit dem Zug nach Hamburg um 14 Uhr 20?$X7$, $X7$$X7$, $X7${"options": ["Er fällt aus.", "Er hat nur Verspätung.", "Er fährt früher ab."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Von welchem Gleis fährt der nächste Zug ab?$X7$, $X7$$X7$, $X7${"options": ["von Gleis 3", "von Gleis 7", "von Gleis 5"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wohin sollen Reisende mit Anschlusstickets gehen?$X7$, $X7$$X7$, $X7${"options": ["direkt zum Zug", "zum Service-Center in der Bahnhofshalle", "zum Gleis 3"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Guten Tag, hier ist die Praxis Doktor Berger. Ich rufe Sie wegen Ihres Termins am Donnerstag an. Leider ist der Arzt an diesem Tag selbst krank, deshalb müssen wir den Termin verschieben. Wir können Ihnen stattdessen den kommenden Montag um 9 Uhr 30 anbieten. Bitte bringen Sie Ihre Krankenkassenkarte und die Liste Ihrer Medikamente mit. Falls der neue Termin nicht passt, rufen Sie uns bitte bis morgen Mittag zurück. Vielen Dank und bleiben Sie gesund.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum muss der Termin verschoben werden?$X7$, $X7$$X7$, $X7${"options": ["Die Praxis ist geschlossen.", "Der Patient ist krank.", "Der Arzt ist krank."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Wann ist der neue Termin?$X7$, $X7$$X7$, $X7${"options": ["am Montag um 9 Uhr 30", "am Donnerstag", "morgen Mittag"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was soll der Patient zum Termin mitbringen?$X7$, $X7$$X7$, $X7${"options": ["nur ein Rezept", "die Krankenkassenkarte und eine Medikamentenliste", "einen Überweisungsschein"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören einen kurzen Beitrag im Radio.$X7$, $X7$Und jetzt zum Wochenende: Am Samstag wird es endlich wieder sonnig und warm, mit Temperaturen bis 24 Grad. Das ist perfektes Wetter für einen Ausflug ins Grüne. Besonders beliebt ist zurzeit der neue Radweg am Fluss, der bis zum Badesee führt. Wer es lieber ruhig mag, kann das Sommerfest im Stadtpark besuchen. Dort gibt es ab 15 Uhr Livemusik und Essen aus vielen Ländern. Am Sonntag sollten Sie allerdings einen Regenschirm einpacken, denn am Nachmittag kommen Wolken und Regen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wie wird das Wetter am Samstag?$X7$, $X7$$X7$, $X7${"options": ["kühl und windig", "sonnig und warm", "regnerisch"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was wird beim Sommerfest im Stadtpark geboten?$X7$, $X7$$X7$, $X7${"options": ["Livemusik und Essen aus vielen Ländern", "eine Radtour zum Badesee", "ein Konzert am Fluss"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was sollte man am Sonntag mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["eine Sonnenbrille", "Badesachen", "einen Regenschirm"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Achten Sie auf eine passende Anrede und einen passenden Schluss sowie darauf, dass Sie alle Leitpunkte behandeln.$X7$, 45, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Sie haben im Internet einen Forenbeitrag gelesen, in dem Leute über gesunde Freizeit und Sport diskutieren. Ein Nutzer fragt: „Wie bleibt ihr neben Arbeit oder Studium fit und gesund?“ Schreiben Sie einen Beitrag in das Forum. Gehen Sie dabei auf die folgenden drei Punkte ein:

- Beschreiben Sie, welchen Sport oder welche Bewegung Sie in Ihrer Freizeit machen.
- Erklären Sie, warum Ihnen Gesundheit wichtig ist.
- Geben Sie den anderen einen Tipp, wie man im Alltag aktiv bleiben kann.

Schreiben Sie ca. 80 Wörter. Vergessen Sie nicht die Anrede und den Gruß.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 80, 120, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie wollten am Wochenende mit Ihrer Freundin Claudia eine Radtour machen. Leider sind Sie krank geworden und können nicht mitfahren. Schreiben Sie Claudia eine kurze Nachricht (z. B. per SMS oder Messenger). Gehen Sie dabei auf folgende Punkte ein:

- Entschuldigen Sie sich und erklären Sie kurz, warum Sie nicht mitkommen können.
- Schlagen Sie einen neuen Termin vor.

Schreiben Sie ca. 40 Wörter.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 60, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ('B1', 3, $X7$B1-Modellprüfung 3: Ausbildung, Technik und Umwelt$X7$, $X7$Realistische Übungsprüfung (Goethe/telc B1) zu Ausbildung, Technik und Umwelt$X7$, false, 3)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antworten. Nur eine Antwort ist richtig. Markieren Sie die richtige Lösung.$X7$, 50, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Durchsage an der Berufsschule

Liebe Auszubildende, wir möchten Sie über eine wichtige Änderung informieren. Ab dem nächsten Montag findet der Technik-Unterricht nicht mehr im Raum 12, sondern in der neuen Werkstatt im Erdgeschoss statt. Dort stehen Ihnen moderne Maschinen und neue Computer zur Verfügung. Bitte denken Sie daran, Ihre Sicherheitsschuhe mitzubringen, denn ohne diese dürfen Sie die Werkstatt nicht betreten. Der Theorieunterricht bleibt wie gewohnt im Raum 12. Bei Fragen wenden Sie sich bitte an Herrn Keller im Sekretariat.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wo findet der Technik-Unterricht ab Montag statt?$X7$, $X7$$X7$, $X7${"options": ["In der neuen Werkstatt im Erdgeschoss", "Weiterhin im Raum 12", "Im Sekretariat bei Herrn Keller"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was müssen die Auszubildenden unbedingt mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Einen eigenen Laptop", "Neue Maschinen", "Ihre Sicherheitsschuhe"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was gilt für den Theorieunterricht?$X7$, $X7$$X7$, $X7${"options": ["Er fällt ab Montag aus", "Er bleibt im Raum 12", "Er findet in der Werkstatt statt"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail von einer Freundin

Hallo Sofia,

du hast mich letzte Woche nach meinem neuen Kurs gefragt. Ich mache jetzt eine Weiterbildung zur Solartechnikerin. Der Kurs dauert sechs Monate und findet dreimal pro Woche am Abend statt, weil ich ja tagsüber arbeite. Am Anfang war es ziemlich schwer, so viel Technik neben dem Beruf zu lernen, aber jetzt macht es mir großen Spaß. Besonders gut finde ich, dass wir viel praktisch an echten Solaranlagen üben. Vielleicht ist so etwas ja auch für dich interessant? Melde dich mal!

Liebe Grüße
Nadja$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Welche Weiterbildung macht Nadja?$X7$, $X7$$X7$, $X7${"options": ["Zur Elektrikerin", "Zur Solartechnikerin", "Zur Ingenieurin"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Wann findet der Kurs statt?$X7$, $X7$$X7$, $X7${"options": ["Am Wochenende", "Am Vormittag", "Am Abend"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Forenbeitrag: Elektroauto – ja oder nein?

Ich überlege schon lange, ob ich mir ein Elektroauto kaufen soll. Mein altes Auto verbraucht viel Benzin und ist nicht gut für die Umwelt. Ein E-Auto wäre sauberer, aber ich habe gehört, dass die Ladestationen in meiner Region noch selten sind. Außerdem ist so ein Auto in der Anschaffung ziemlich teuer. Andererseits bekommt man vom Staat Geld dazu, und die laufenden Kosten sind niedriger. Hat jemand von euch schon Erfahrungen gemacht? Ich würde mich über ehrliche Tipps freuen.

Gruß, Tom$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Warum möchte Tom sein altes Auto wechseln?$X7$, $X7$$X7$, $X7${"options": ["Es ist schlecht für die Umwelt", "Es ist ihm zu klein", "Es ist kaputt"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Welches Problem nennt Tom beim Elektroauto?$X7$, $X7$$X7$, $X7${"options": ["Er darf nicht Auto fahren", "E-Autos fahren zu langsam", "Es gibt noch wenige Ladestationen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was wünscht sich Tom von den anderen im Forum?$X7$, $X7$$X7$, $X7${"options": ["Ehrliche Tipps", "Ein neues Auto", "Geld vom Staat"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Kurzer Artikel: Clever Energie sparen

Immer mehr Städte setzen auf moderne Technik, um Energie zu sparen. In vielen Orten werden die Straßenlampen jetzt mit LED-Lampen ausgestattet. Diese Lampen brauchen deutlich weniger Strom und halten viel länger als die alten Modelle. In einigen Städten schalten sich die Lampen sogar automatisch heller, wenn jemand vorbeigeht, und werden wieder dunkler, wenn die Straße leer ist. So wird nur dann Licht verbraucht, wenn es wirklich nötig ist. Fachleute rechnen damit, dass die Städte auf diese Weise jedes Jahr viel Geld und große Mengen Strom sparen können.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 12),
    (sid, 4, $X7$choice$X7$, $X7$Was ist ein Vorteil der LED-Lampen?$X7$, $X7$$X7$, $X7${"options": ["Sie sind deutlich größer", "Sie halten viel länger", "Sie leuchten bunt"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 13),
    (sid, 4, $X7$choice$X7$, $X7$Wann werden die Lampen in einigen Städten heller?$X7$, $X7$$X7$, $X7${"options": ["Wenn jemand vorbeigeht", "Nur zwischen Mitternacht und sechs Uhr", "Wenn es regnet"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Hörverstehen B1 – Thema: Ausbildung, Technik und Umwelt. Sie hören drei kurze Texte, die jeweils von einer Person gesprochen werden. Lesen Sie zuerst die Fragen. Jeder Text wird zweimal vorgelesen. Kreuzen Sie bei jeder Frage die richtige Antwort (a, b oder c) an. Es ist immer nur eine Antwort richtig. Insgesamt haben Sie etwa 40 Minuten Zeit.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einer Berufsschule.$X7$, $X7$Liebe Auszubildende, eine wichtige Information für alle im zweiten Lehrjahr. Der Computerraum im Erdgeschoss bleibt ab morgen für eine ganze Woche geschlossen, weil dort neue Technik eingebaut wird. Der Unterricht in Informatik findet deshalb in Raum zweihundertdrei im ersten Stock statt. Bitte bringt eure Laptops mit, denn wir arbeiten dort mit einem neuen Programm. Wer keinen eigenen Laptop hat, meldet sich bitte bis Freitag im Sekretariat. Vielen Dank und einen schönen Tag.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum bleibt der Computerraum geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Weil er gründlich gereinigt wird.", "Weil neue Technik eingebaut wird.", "Weil die Lehrer krank sind."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wo findet der Informatikunterricht jetzt statt?$X7$, $X7$$X7$, $X7${"options": ["Im Erdgeschoss.", "Im Sekretariat.", "In Raum 203 im ersten Stock."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was sollen die Auszubildenden mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Ihre Laptops.", "Ein Wörterbuch.", "Geld für den Kurs."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören einen kurzen Beitrag im Radio.$X7$, $X7$Und nun zum Umweltthema der Woche. In unserer Stadt gibt es ab Montag ein neues Angebot: An fünf Stellen im Zentrum kann man jetzt alte Handys und kaputte Elektrogeräte kostenlos abgeben. Die Geräte werden danach recycelt, und wertvolle Metalle können so wieder verwendet werden. Die Stadt hofft, dass auf diese Weise weniger Müll entsteht. Wer mitmacht, bekommt außerdem einen Gutschein für den Bus. Mehr Informationen finden Sie auf der Internetseite der Stadt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was kann man ab Montag im Zentrum abgeben?$X7$, $X7$$X7$, $X7${"options": ["Altes Zeitungspapier.", "Alte Handys und kaputte Elektrogeräte.", "Alte Kleidung und Schuhe."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was bekommt man, wenn man mitmacht?$X7$, $X7$$X7$, $X7${"options": ["Etwas Geld.", "Ein neues Handy.", "Einen Gutschein für den Bus."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wo findet man mehr Informationen?$X7$, $X7$$X7$, $X7${"options": ["Auf der Internetseite der Stadt.", "Im Radio am Abend.", "In der Tageszeitung."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf dem Anrufbeantworter.$X7$, $X7$Hallo Herr Berger, hier ist Frau Klein von der Firma Grüntech. Es geht um Ihr Praktikum, das nächste Woche beginnt. Leider müssen wir den ersten Tag von Montag auf Mittwoch verschieben, weil unsere neue Maschine erst dann geliefert wird. Bitte kommen Sie also am Mittwoch um acht Uhr zum Haupteingang. Bringen Sie unbedingt Ihren Ausweis mit, sonst kommen Sie nicht ins Gebäude. Bei Fragen rufen Sie mich einfach zurück. Auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Warum beginnt das Praktikum später?$X7$, $X7$$X7$, $X7${"options": ["Weil Herr Berger krank ist.", "Weil die neue Maschine erst am Mittwoch geliefert wird.", "Weil Frau Klein im Urlaub ist."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wann soll Herr Berger kommen?$X7$, $X7$$X7$, $X7${"options": ["Am Montag um acht Uhr.", "Am Mittwoch um acht Uhr.", "Am Mittwoch um neun Uhr."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was soll Herr Berger mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Seinen Ausweis.", "Sein eigenes Werkzeug.", "Einen Lebenslauf."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Schreiben Sie zu beiden Aufgaben einen Text. Achten Sie auf einen passenden Anfang und Schluss sowie auf die Leitpunkte. Schreiben Sie natürlich und zusammenhängend.$X7$, 45, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$In einem Online-Forum diskutieren die Teilnehmer über das Thema "Umweltschutz im Alltag". Schreiben Sie einen Beitrag für das Forum. Gehen Sie dabei auf folgende Punkte ein:

- Schreiben Sie, warum Ihnen Umweltschutz wichtig ist.
- Beschreiben Sie, was Sie selbst im Alltag für die Umwelt tun.
- Geben Sie den anderen einen Tipp, wie man im Alltag Energie oder Müll sparen kann.

Vergessen Sie Anrede und Gruß nicht.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 70, 100, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie besuchen einen Abendkurs "Technik für Anfänger". Nächste Woche können Sie zum Unterricht nicht kommen, weil Sie arbeiten müssen. Schreiben Sie eine kurze Mitteilung an Ihren Kursleiter, Herrn Wagner. Gehen Sie dabei auf folgende Punkte ein:

- Entschuldigen Sie sich und nennen Sie den Grund.
- Fragen Sie, wie Sie den verpassten Stoff nachholen können.

Schreiben Sie höflich und halbformell.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 2);
end $do$;
