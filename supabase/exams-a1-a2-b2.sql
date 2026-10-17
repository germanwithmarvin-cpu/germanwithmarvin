-- Modellprüfungen (A1, A2, B2) — Seed für den Prüfungstrainer.
-- Benötigt exams.sql (Schema). Idempotent: überschreibt die Papers neu.
-- Danach im Lehrerbereich → Exams die Hör-Audios aufnehmen + veröffentlichen.

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A1$X7$, 1, $X7$A1-Modellprüfung 1: Alltag, Arbeit und Wohnen$X7$, $X7$Start Deutsch 1 / telc A1 — Mix aus Goethe und telc. Schwerpunkt: Alltag, Arbeit und Wohnen.$X7$, true, 1)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und beantworten Sie die Fragen. Wählen Sie bei jeder Frage die richtige Antwort (a, b oder c). Nur eine Antwort ist richtig.$X7$, 25, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Wohnungsanzeige

Schöne 2-Zimmer-Wohnung in Hamburg!
Die Wohnung ist hell und ruhig. Die Küche ist neu. Die Wohnung hat keinen Balkon.
Miete: 650 Euro pro Monat.
Frei ab 1. März.
Haustiere sind nicht erlaubt.
Kontakt: Frau Berger, Telefon 040 123456$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wo ist die Wohnung?$X7$, $X7$$X7$, $X7${"options": ["In Berlin", "In Hamburg", "In München"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wie viel kostet die Wohnung pro Monat?$X7$, $X7$$X7$, $X7${"options": ["650 Euro", "560 Euro", "160 Euro"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was ist richtig?$X7$, $X7$$X7$, $X7${"options": ["Die Wohnung hat einen Balkon.", "Hunde und Katzen sind erlaubt.", "Die Küche ist neu."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Notiz auf dem Tisch

Hallo Lisa,
ich bin heute Abend nicht zu Hause. Ich arbeite bis 20 Uhr. Kannst du bitte Brot und Milch kaufen? Das Geld liegt auf dem Tisch in der Küche.
Danke! Bis später,
Tom$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wann kommt Tom nach Hause?$X7$, $X7$$X7$, $X7${"options": ["Am Morgen", "Am Mittag", "Am Abend"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Lisa kaufen?$X7$, $X7$$X7$, $X7${"options": ["Brot und Milch", "Brot und Käse", "Milch und Eier"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wo liegt das Geld?$X7$, $X7$$X7$, $X7${"options": ["Im Bad", "Im Schlafzimmer", "Auf dem Tisch in der Küche"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail

Liebe Frau Klein,
vielen Dank für Ihre E-Mail. Ich komme am Montag um 9 Uhr ins Büro. Mein erster Arbeitstag ist der 5. April.
Wo finde ich mein Zimmer? Haben Sie einen Parkplatz für mich?
Viele Grüße
Markus Weber$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wann beginnt Markus seine Arbeit?$X7$, $X7$$X7$, $X7${"options": ["Am 5. April", "Am 5. März", "Am 9. April"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Um wie viel Uhr kommt Markus ins Büro?$X7$, $X7$$X7$, $X7${"options": ["Um 10 Uhr", "Um 9 Uhr", "Um 8 Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was möchte Markus wissen?$X7$, $X7$$X7$, $X7${"options": ["Wie viel er verdient", "Ob es einen Parkplatz gibt", "Wann Feierabend ist"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Zu jedem Text gibt es Fragen. Wählen Sie bei jeder Frage die richtige Antwort (a, b oder c). Sie hören jeden Text zweimal.$X7$, 20, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Text 1: Eine Durchsage im Supermarkt. Sie hören die Durchsage zweimal.$X7$, $X7$Liebe Kundinnen und Kunden, unser Supermarkt schließt heute um 20 Uhr. Das Brot und der Käse sind heute im Angebot. Besuchen Sie auch unsere neue Obst-Abteilung. Wir wünschen Ihnen einen schönen Einkauf. Vielen Dank.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wann schließt der Supermarkt?$X7$, $X7$$X7$, $X7${"options": ["Um 20 Uhr", "Um 18 Uhr", "Um 22 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was ist heute im Angebot?$X7$, $X7$$X7$, $X7${"options": ["Milch und Eier", "Brot und Käse", "Obst und Gemüse"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 2, $X7$audio$X7$, $X7$Text 2: Eine Nachricht auf dem Anrufbeantworter. Sie hören die Nachricht zweimal.$X7$, $X7$Hallo Herr Schmidt, hier ist Frau Müller von der Firma Berger. Ihr Termin am Dienstag um 14 Uhr ist leider nicht möglich. Können Sie am Mittwoch kommen? Bitte rufen Sie mich heute noch zurück. Danke. Auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 4),
    (sid, 2, $X7$choice$X7$, $X7$Wer spricht?$X7$, $X7$$X7$, $X7${"options": ["Herr Schmidt", "Frau Müller", "Herr Berger"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 5),
    (sid, 2, $X7$choice$X7$, $X7$Welcher Termin ist nicht möglich?$X7$, $X7$$X7$, $X7${"options": ["Dienstag um 14 Uhr", "Mittwoch um 14 Uhr", "Dienstag um 4 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Herr Schmidt tun?$X7$, $X7$$X7$, $X7${"options": ["Eine E-Mail schreiben", "Zurückrufen", "Zur Firma kommen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$audio$X7$, $X7$Text 3: Die Wetteransage im Radio. Sie hören die Ansage zweimal.$X7$, $X7$Guten Morgen! Es ist jetzt 7 Uhr. Hier ist das Wetter für heute: Am Vormittag scheint die Sonne. Am Nachmittag regnet es. Es ist warm, 22 Grad. Nehmen Sie bitte einen Regenschirm mit. Einen schönen Tag!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Wie spät ist es?$X7$, $X7$$X7$, $X7${"options": ["7 Uhr", "8 Uhr", "9 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Nachmittag?$X7$, $X7$$X7$, $X7${"options": ["Es schneit", "Es regnet", "Die Sonne scheint"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wie warm ist es heute?$X7$, $X7$$X7$, $X7${"options": ["12 Grad", "22 Grad", "2 Grad"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Schreiben Sie zu jedem Punkt ein bis zwei einfache Sätze. Achten Sie auf Anrede und Gruß.$X7$, 20, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Sie ziehen bald in eine neue Wohnung um. Schreiben Sie Ihrer Freundin Anna eine kurze Nachricht (SMS). Schreiben Sie zu allen drei Punkten:
- Wann Sie umziehen
- Wie die neue Wohnung ist
- Bitten Sie Anna um Hilfe beim Umzug.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 40, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie sind krank und können heute nicht zur Arbeit kommen. Schreiben Sie eine kurze Mitteilung an Ihren Chef, Herrn Lang. Schreiben Sie zu allen drei Punkten:
- Grüßen Sie Herrn Lang
- Warum Sie heute nicht kommen
- Wann Sie wieder zur Arbeit kommen.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 40, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A1$X7$, 2, $X7$A1-Modellprüfung 2: Reisen, Gesundheit und Freizeit$X7$, $X7$Start Deutsch 1 / telc A1 — Mix aus Goethe und telc. Themen: Reisen, Gesundheit und Freizeit.$X7$, false, 2)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und lösen Sie die Aufgaben. Bei jeder Frage gibt es nur eine richtige Antwort. Sie haben 25 Minuten Zeit.$X7$, 25, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Fahrradverleih am See

Machen Sie einen Ausflug! Bei uns leihen Sie ein Fahrrad.
Ein Tag kostet 12 Euro. Für Kinder ist es billiger: nur 6 Euro.
Wir haben jeden Tag von 9 bis 18 Uhr geöffnet.
Am Montag ist geschlossen.
Bitte bringen Sie einen Ausweis mit.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was kann man hier machen?$X7$, $X7$$X7$, $X7${"options": ["ein Auto kaufen", "ein Fahrrad leihen", "ein Zimmer buchen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wie viel bezahlt ein Kind für einen Tag?$X7$, $X7$$X7$, $X7${"options": ["6 Euro", "12 Euro", "18 Euro"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist der Fahrradverleih geschlossen?$X7$, $X7$$X7$, $X7${"options": ["am Sonntag", "am Montag", "am Samstag"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Hallo Lena,

ich bin heute krank. Ich habe Fieber und bleibe im Bett.
Kannst du bitte zur Apotheke gehen und mir eine Medizin kaufen?
Das Rezept liegt auf dem Tisch.
Danke! Bis später,
Tom$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wie geht es Tom?$X7$, $X7$$X7$, $X7${"options": ["Er ist gesund.", "Er ist krank.", "Er ist müde."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Lena machen?$X7$, $X7$$X7$, $X7${"options": ["zum Arzt gehen", "in die Apotheke gehen", "Essen kochen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wo liegt das Rezept?$X7$, $X7$$X7$, $X7${"options": ["auf dem Tisch", "im Bett", "in der Tasche"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Liebe Maria,

nächste Woche fahre ich nach München. Ich besuche meine Schwester.
Wir wollen zusammen ins Museum gehen und einen Spaziergang im Park machen.
Am Abend essen wir in einem Restaurant.
Kommst du auch mit? Der Zug fährt am Freitag um 10 Uhr.

Viele Grüße
Anna$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wohin fährt Anna?$X7$, $X7$$X7$, $X7${"options": ["nach Berlin", "nach München", "nach Hamburg"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wen besucht Anna?$X7$, $X7$$X7$, $X7${"options": ["ihre Schwester", "ihre Mutter", "ihre Freundin Maria"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Wann fährt der Zug?$X7$, $X7$$X7$, $X7${"options": ["am Samstag", "am Sonntag", "am Freitag"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Hören Sie jeden Text. Für jede Frage gibt es nur eine richtige Antwort. Sie hören jeden Text zweimal. Sie haben 20 Minuten Zeit.$X7$, 20, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Text 1: Eine Durchsage am Bahnhof. Sie hören eine Ansage für die Reisenden.$X7$, $X7$Achtung, bitte beachten Sie: Der Zug nach Hamburg fährt heute nicht um 14 Uhr, sondern um 15 Uhr. Der Zug fährt heute von Gleis 3. Wir bitten um Entschuldigung. Vielen Dank.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wohin fährt der Zug?$X7$, $X7$$X7$, $X7${"options": ["nach Hamburg", "nach München", "nach Köln"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wann fährt der Zug heute?$X7$, $X7$$X7$, $X7${"options": ["um 14 Uhr", "um 15 Uhr", "um 16 Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Von welchem Gleis fährt der Zug?$X7$, $X7$$X7$, $X7${"options": ["von Gleis 2", "von Gleis 3", "von Gleis 4"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Text 2: Eine Nachricht auf dem Anrufbeantworter. Sie rufen bei einer Arztpraxis an.$X7$, $X7$Guten Tag, hier ist die Praxis Dr. Müller. Unsere Praxis ist heute geschlossen. Bitte rufen Sie morgen wieder an. In einem Notfall gehen Sie bitte ins Krankenhaus. Vielen Dank und auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wer spricht?$X7$, $X7$$X7$, $X7${"options": ["ein Krankenhaus", "die Praxis Dr. Müller", "eine Apotheke"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Warum soll man morgen wieder anrufen?$X7$, $X7$$X7$, $X7${"options": ["Die Praxis ist heute geschlossen.", "Der Arzt ist krank.", "Das Telefon ist kaputt."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was soll man in einem Notfall machen?$X7$, $X7$$X7$, $X7${"options": ["noch einmal anrufen", "ins Krankenhaus gehen", "zu Hause warten"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Text 3: Der Wetterbericht im Radio. Sie hören die Vorhersage für das Wochenende.$X7$, $X7$Und jetzt das Wetter für das Wochenende. Am Samstag scheint die Sonne. Es ist warm, ungefähr 25 Grad. Das ist perfekt für einen Ausflug. Am Sonntag regnet es leider. Nehmen Sie bitte einen Regenschirm mit!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Samstag?$X7$, $X7$$X7$, $X7${"options": ["Es regnet.", "Die Sonne scheint.", "Es schneit."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wie warm ist es am Samstag?$X7$, $X7$$X7$, $X7${"options": ["15 Grad", "25 Grad", "35 Grad"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man am Sonntag mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["einen Regenschirm", "eine Sonnenbrille", "eine Jacke"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Schreiben Sie zu beiden Aufgaben einen kurzen Text. Achten Sie auf alle Leitpunkte und schreiben Sie in ganzen Sätzen. Sie haben 20 Minuten Zeit.$X7$, 20, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Sie möchten am Wochenende mit Ihrer Freundin Sara einen Ausflug machen. Schreiben Sie Sara eine kurze Nachricht (SMS). Schreiben Sie zu allen drei Punkten:
- Wohin möchten Sie fahren?
- Wann treffen Sie sich?
- Was soll Sara mitbringen?$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 30, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie sind krank und können heute nicht zum Deutschkurs kommen. Schreiben Sie eine kurze Mitteilung an Ihre Lehrerin, Frau Wagner. Schreiben Sie zu allen drei Punkten:
- Warum kommen Sie nicht?
- Entschuldigen Sie sich.
- Wann kommen Sie wieder?$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 30, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A1$X7$, 3, $X7$A1-Modellprüfung 3: Ausbildung/Bildung, Technik und Umwelt$X7$, $X7$Eine komplette Übungsprüfung im Goethe-/telc-Stil (Start Deutsch 1) zu den Themen Bildung, Technik und Umwelt$X7$, false, 3)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig. Kreuzen Sie die richtige Antwort an.$X7$, 25, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Aushang in der Schule

Neuer Computerkurs für Anfänger!
Lernen Sie, wie man einen Computer und das Internet benutzt.
Der Kurs ist jeden Montag von 18 bis 20 Uhr.
Der Kurs kostet 40 Euro.
Bitte melden Sie sich im Büro an. Das Büro ist von 9 bis 12 Uhr offen.
Der Kurs beginnt am 5. Oktober.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Für wen ist der Kurs?$X7$, $X7$$X7$, $X7${"options": ["Für Anfänger", "Für Lehrer", "Für Kinder"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist der Kurs?$X7$, $X7$$X7$, $X7${"options": ["Jeden Morgen", "Jeden Montag am Abend", "Jeden Samstag"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wie kann man sich anmelden?$X7$, $X7$$X7$, $X7${"options": ["Per E-Mail", "Am Telefon", "Im Büro"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Hallo Lena,

mein Computer ist kaputt. Kannst du mir helfen? Ich muss heute eine E-Mail an meine Lehrerin schreiben. Darf ich deinen Laptop nehmen? Ich komme um 16 Uhr zu dir.

Bis später!
Tom$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was ist das Problem von Tom?$X7$, $X7$$X7$, $X7${"options": ["Sein Computer ist kaputt", "Sein Handy ist weg", "Er hat keine E-Mail-Adresse"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was möchte Tom von Lena?$X7$, $X7$$X7$, $X7${"options": ["Geld", "Ihren Laptop", "Ihr Buch"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wann kommt Tom zu Lena?$X7$, $X7$$X7$, $X7${"options": ["Um 14 Uhr", "Morgen", "Um 16 Uhr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Liebe Eltern,

am Freitag machen wir in der Schule einen Projekttag zum Thema Umwelt. Die Kinder sammeln im Park Müll und pflanzen Blumen. Bitte geben Sie Ihrem Kind alte Kleidung und Handschuhe mit. Das Wetter soll gut sein. Wir treffen uns um 9 Uhr vor der Schule.

Viele Grüße
Frau Berg$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was ist das Thema des Projekttags?$X7$, $X7$$X7$, $X7${"options": ["Umwelt", "Musik", "Sport"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was sollen die Kinder mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Essen und Trinken", "Alte Kleidung und Handschuhe", "Bücher und Hefte"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Wo treffen sich alle?$X7$, $X7$$X7$, $X7${"options": ["Im Park", "Zu Hause", "Vor der Schule"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Hören Sie jeden Text einmal (bei Bedarf zweimal) und kreuzen Sie bei jeder Aufgabe die richtige Antwort an. Nur eine Antwort ist richtig.$X7$, 20, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einer Schule.$X7$, $X7$Liebe Schülerinnen und Schüler, der Computerraum ist heute leider geschlossen. Die Technik ist kaputt. Bitte arbeitet heute in der Bibliothek. Ihr könnt dort auch Computer benutzen. Die Bibliothek ist bis 16 Uhr offen. Danke!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum ist der Computerraum geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Die Technik ist kaputt", "Es ist ein Feiertag", "Die Lehrer sind krank"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wohin sollen die Schüler gehen?$X7$, $X7$$X7$, $X7${"options": ["Nach Hause", "In die Bibliothek", "In den Park"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wie lange ist die Bibliothek offen?$X7$, $X7$$X7$, $X7${"options": ["bis 14 Uhr", "bis 18 Uhr", "bis 16 Uhr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Guten Tag, hier ist der Handy-Shop Meier. Ihr Handy ist jetzt repariert. Sie können es heute abholen. Wir haben bis 18 Uhr geöffnet. Bitte bringen Sie den Zettel mit. Das Handy kostet 30 Euro. Auf Wiederhören!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wer ruft an?$X7$, $X7$$X7$, $X7${"options": ["Eine Freundin", "Der Handy-Shop", "Die Schule"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll man mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Den Zettel", "Ein Foto", "Einen Computer"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wie viel müssen Sie bezahlen?$X7$, $X7$$X7$, $X7${"options": ["13 Euro", "18 Euro", "30 Euro"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören den Wetterbericht im Radio.$X7$, $X7$Und jetzt das Wetter für morgen. Am Morgen ist es kalt, nur fünf Grad. Am Nachmittag scheint die Sonne und es wird warm. Am Abend regnet es ein bisschen. Nehmen Sie bitte einen Regenschirm mit. Einen schönen Tag!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Morgen?$X7$, $X7$$X7$, $X7${"options": ["Kalt", "Warm", "Heiß"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Nachmittag?$X7$, $X7$$X7$, $X7${"options": ["Es regnet", "Die Sonne scheint", "Es schneit"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["Eine Jacke", "Eine Sonnenbrille", "Einen Regenschirm"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Schreiben Sie in einfachen, ganzen Sätzen und gehen Sie auf alle drei Punkte ein. Vergessen Sie Anrede und Gruß nicht.$X7$, 25, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe 1: Kurze Nachricht

Ihre Freundin Anna hat einen neuen Computer. Schreiben Sie Anna eine kurze Nachricht.

Gehen Sie auf diese Punkte ein:
- Gratulieren Sie Anna zum neuen Computer.
- Fragen Sie, was der Computer alles kann.
- Fragen Sie, ob Sie den Computer einmal sehen dürfen.

Schreiben Sie 20 bis 30 Wörter.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 30, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Aufgabe 2: Kurze Mitteilung

Sie können morgen nicht zum Deutschkurs kommen. Schreiben Sie eine kurze Mitteilung an Ihren Lehrer, Herrn Klein.

Gehen Sie auf diese Punkte ein:
- Sagen Sie, dass Sie morgen nicht kommen können.
- Schreiben Sie den Grund (zum Beispiel: krank).
- Fragen Sie nach den Hausaufgaben.

Schreiben Sie 20 bis 30 Wörter.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 30, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A2$X7$, 1, $X7$A2-Modellprüfung 1: Alltag, Arbeit und Wohnen$X7$, $X7$Modelltest im Goethe-/telc-A2-Format · Lesen, Hören und Schreiben rund um Alltag, Arbeit und Wohnen$X7$, true, 1)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig. Markieren Sie die richtige Lösung.$X7$, 30, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail

Hallo Sabine,

wie geht es dir? Ich schreibe dir, weil ich nächste Woche umziehe. Meine neue Wohnung ist in der Gartenstraße, nur zehn Minuten von meiner Arbeit entfernt. Das ist super, denn jetzt muss ich nicht mehr jeden Morgen eine Stunde mit dem Bus fahren.

Am Samstag hole ich den Schlüssel ab. Kannst du mir vielleicht am Sonntag beim Tragen der Kartons helfen? Mein Bruder kommt auch, aber zu zweit ist es sehr schwer. Als Dank koche ich für euch mein Lieblingsessen.

Sag mir bitte bis Freitag Bescheid.

Viele Grüße
Katrin$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum schreibt Katrin die E-Mail?$X7$, $X7$$X7$, $X7${"options": ["Sie sucht eine neue Arbeit.", "Sie zieht bald um.", "Sie macht nächste Woche Urlaub."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wo liegt Katrins neue Wohnung?$X7$, $X7$$X7$, $X7${"options": ["weit weg von ihrer Arbeit", "direkt neben dem Bahnhof", "in der Nähe ihrer Arbeit"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was soll Sabine tun?$X7$, $X7$$X7$, $X7${"options": ["Katrin am Sonntag beim Umzug helfen", "am Samstag den Schlüssel abholen", "das Lieblingsessen kochen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Wohnungsanzeige

Schöne 2-Zimmer-Wohnung ab 1. März zu vermieten!

Die Wohnung liegt im zweiten Stock und hat einen kleinen Balkon. Küche und Bad sind neu. Die Miete beträgt 650 Euro im Monat (plus Nebenkosten). Haustiere sind leider nicht erlaubt. Ein Parkplatz vor dem Haus kann dazugemietet werden.

Interesse? Rufen Sie Herrn Weber unter 0176 / 44 55 an – am besten abends nach 18 Uhr.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Ab wann ist die Wohnung frei?$X7$, $X7$$X7$, $X7${"options": ["ab sofort", "ab dem ersten März", "ab 18 Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was ist in der Anzeige richtig?$X7$, $X7$$X7$, $X7${"options": ["Man darf einen Hund halten.", "Die Küche ist alt.", "Die Wohnung hat einen Balkon."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Blogtext: Arbeiten zu Hause

Immer mehr Menschen arbeiten heute von zu Hause. Das nennt man Homeoffice. Für viele ist das praktisch: Sie sparen Zeit, weil sie nicht ins Büro fahren müssen, und können in Ruhe arbeiten. Aber es gibt auch Probleme. Manche Menschen fühlen sich allein, weil sie ihre Kollegen nicht sehen. Andere können sich zu Hause schlecht konzentrieren, weil die Kinder oder der Fernseher stören. Experten sagen: Am besten ist eine Mischung. Man arbeitet ein paar Tage zu Hause und ein paar Tage im Büro.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Was bedeutet "Homeoffice"?$X7$, $X7$$X7$, $X7${"options": ["von zu Hause arbeiten", "nur am Wochenende arbeiten", "im Ausland arbeiten"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Welcher Vorteil wird im Text genannt?$X7$, $X7$$X7$, $X7${"options": ["Man verdient mehr Geld.", "Man spart Zeit.", "Man hat mehr Urlaub."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was ist für die Experten die beste Lösung?$X7$, $X7$$X7$, $X7${"options": ["nur im Büro arbeiten", "nur zu Hause arbeiten", "mal zu Hause, mal im Büro arbeiten"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 11),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Aushang im Treppenhaus

Liebe Hausbewohner,

am Donnerstag, dem 12. April, wird von 9 bis 14 Uhr das Wasser abgestellt. Der Grund sind Reparaturen an den Leitungen im Keller. Bitte stellen Sie sich am Morgen genug Wasser zum Kochen und Trinken bereit. Die Waschmaschinen im Keller können an diesem Tag nicht benutzt werden.

Vielen Dank für Ihr Verständnis.
Ihre Hausverwaltung$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 12),
    (sid, 4, $X7$choice$X7$, $X7$Was passiert am 12. April?$X7$, $X7$$X7$, $X7${"options": ["Es gibt für einige Stunden kein Wasser.", "Der Keller wird geputzt.", "Es gibt keinen Strom im Haus."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 13),
    (sid, 4, $X7$choice$X7$, $X7$Was sollen die Bewohner tun?$X7$, $X7$$X7$, $X7${"options": ["den Keller aufräumen", "Wasser bereitstellen", "die Waschmaschine reparieren"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 14);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Zu jedem Text gibt es Aufgaben. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig. Sie hören jeden Text zweimal.$X7$, 30, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie sind am Bahnhof und hören eine Durchsage.$X7$, $X7$Achtung, eine wichtige Information für alle Reisenden: Der Zug nach München um 14 Uhr 20 hat heute leider zwanzig Minuten Verspätung. Er fährt jetzt von Gleis 7 und nicht von Gleis 3 ab. Bitte beachten Sie diese Änderung. Wir wünschen Ihnen trotzdem eine gute Reise und danken für Ihr Verständnis.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wie viel Verspätung hat der Zug?$X7$, $X7$$X7$, $X7${"options": ["zehn Minuten", "zwanzig Minuten", "eine Stunde"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Von welchem Gleis fährt der Zug jetzt ab?$X7$, $X7$$X7$, $X7${"options": ["von Gleis 7", "von Gleis 3", "von Gleis 14"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wohin fährt der Zug?$X7$, $X7$$X7$, $X7${"options": ["nach Berlin", "nach Hamburg", "nach München"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Hallo Frau Krüger, hier spricht Thomas Berger von der Firma Sonnenschein. Ich rufe wegen unseres Termins am Mittwoch an. Leider muss ich den Termin verschieben, weil ich krank bin. Können wir uns stattdessen am Freitag um 10 Uhr treffen? Rufen Sie mich bitte zurück. Meine Nummer ist 030 / 55 88 99. Vielen Dank!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum ruft Herr Berger an?$X7$, $X7$$X7$, $X7${"options": ["Er möchte den Termin verschieben.", "Er sucht eine neue Arbeit.", "Er möchte eine Wohnung mieten."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Warum kann Herr Berger am Mittwoch nicht?$X7$, $X7$$X7$, $X7${"options": ["Er hat Urlaub.", "Er ist krank.", "Er muss arbeiten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wann soll der neue Termin sein?$X7$, $X7$$X7$, $X7${"options": ["am Mittwoch um 10 Uhr", "am Freitag um 9 Uhr", "am Freitag um 10 Uhr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören den Wetterbericht im Radio.$X7$, $X7$Und nun das Wetter für morgen: Am Vormittag bleibt es grau und es regnet im ganzen Land. Nehmen Sie also einen Regenschirm mit! Am Nachmittag wird das Wetter besser, die Sonne kommt heraus. Die Temperaturen liegen dann bei angenehmen achtzehn Grad. In der Nacht wird es kühl, nur noch acht Grad.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Vormittag?$X7$, $X7$$X7$, $X7${"options": ["Es regnet.", "Die Sonne scheint.", "Es schneit."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["eine Sonnenbrille", "einen Regenschirm", "eine warme Jacke"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Wie warm wird es am Nachmittag?$X7$, $X7$$X7$, $X7${"options": ["achtzehn Grad", "acht Grad", "achtundzwanzig Grad"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Schreiben Sie zu beiden Aufgaben einen kurzen Text. Achten Sie auf alle Leitpunkte und schreiben Sie die geforderte Wortzahl. Pro Aufgabe können Sie 10 Punkte erreichen.$X7$, 30, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Ihre Kollegin Maria hat Geburtstag und lädt Sie zu ihrer Feier am Samstag ein. Schreiben Sie Maria eine kurze E-Mail. Schreiben Sie zu allen drei Punkten:
- Bedanken Sie sich für die Einladung.
- Sagen Sie, ob Sie kommen können.
- Fragen Sie, ob Sie etwas mitbringen sollen.

Schreiben Sie 30–40 Wörter. Denken Sie an Anrede und Gruß.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie haben eine neue Wohnung gefunden und möchten Ihre Freundin Lena informieren. Schreiben Sie Lena eine kurze Mitteilung. Schreiben Sie zu allen drei Punkten:
- Beschreiben Sie Ihre neue Wohnung kurz.
- Sagen Sie, wann Sie umziehen.
- Laden Sie Lena zu einer kleinen Einweihungsparty ein.

Schreiben Sie 30–40 Wörter. Denken Sie an Anrede und Gruß.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A2$X7$, 2, $X7$A2-Modellprüfung 2: Reisen, Gesundheit und Freizeit$X7$, $X7$Eine komplette Übungsprüfung im Goethe-/telc-Stil zu den Themen Reisen, Gesundheit und Freizeit$X7$, false, 2)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antworten (a, b oder c), aber nur eine Antwort ist richtig. Markieren Sie die richtige Lösung.$X7$, 30, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail

Liebe Anna,

ich freue mich schon sehr auf unseren Urlaub! Ich habe jetzt die Zugtickets nach Hamburg gekauft. Wir fahren am Samstag um neun Uhr ab. Bitte sei schon um halb neun am Bahnhof, dann haben wir genug Zeit. Das Hotel liegt direkt am Hafen, nur zehn Minuten vom Bahnhof. Kannst du bitte deine Regenjacke mitnehmen? Am Wochenende soll es leider oft regnen. Einen Stadtplan bringe ich mit.

Bis Samstag!
Lena$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wie reisen Anna und Lena nach Hamburg?$X7$, $X7$$X7$, $X7${"options": ["mit dem Auto", "mit dem Zug", "mit dem Flugzeug"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was soll Anna mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["eine Regenjacke", "einen Stadtplan", "ein Fahrrad"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wo liegt das Hotel?$X7$, $X7$$X7$, $X7${"options": ["weit außerhalb der Stadt", "neben dem Bahnhof", "direkt am Hafen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Anzeige

Yoga im Park – Kostenloser Schnupperkurs

Jeden Mittwoch im August bieten wir Yoga im Stadtpark an. Der Kurs ist für Anfänger und beginnt um 18 Uhr. Er dauert eine Stunde. Bitte bringen Sie eine Matte und etwas zu trinken mit. Bei Regen fällt der Kurs aus. Eine Anmeldung ist nicht nötig – kommen Sie einfach vorbei!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wann findet der Yoga-Kurs statt?$X7$, $X7$$X7$, $X7${"options": ["jeden Montag am Morgen", "jeden Mittwoch um 18 Uhr", "jeden Samstag am Abend"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was ist richtig?$X7$, $X7$$X7$, $X7${"options": ["Man muss sich vorher anmelden.", "Der Kurs kostet zehn Euro.", "Der Kurs ist kostenlos."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Ratgeber

Gesund durch den Winter

Im Winter werden viele Menschen krank. Mit ein paar einfachen Tipps bleiben Sie gesund. Trinken Sie jeden Tag genug Wasser und essen Sie viel Obst und Gemüse. Auch Bewegung ist wichtig: Ein Spaziergang an der frischen Luft tut gut, auch wenn es kalt ist. Wichtig ist außerdem genug Schlaf, denn wer müde ist, wird schneller krank. Und waschen Sie sich oft die Hände – so schützen Sie sich vor Erkältungen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Worum geht es in dem Text?$X7$, $X7$$X7$, $X7${"options": ["um Tipps, um im Winter gesund zu bleiben", "um Rezepte für ein Wintermenü", "um Sport im Sommer"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man jeden Tag tun?$X7$, $X7$$X7$, $X7${"options": ["lange am Tag schlafen", "genug Wasser trinken", "Medikamente nehmen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Warum soll man sich oft die Hände waschen?$X7$, $X7$$X7$, $X7${"options": ["um Zeit zu sparen", "weil es Spaß macht", "um sich vor Erkältungen zu schützen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 11),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Aushang im Schwimmbad

Liebe Gäste, wegen Reinigungsarbeiten bleibt das große Becken am Montag geschlossen. Das kleine Becken und die Sauna sind normal geöffnet. Ab Dienstag können Sie wieder alle Becken benutzen. Denken Sie bitte daran, vor dem Schwimmen zu duschen. Die Schließfächer funktionieren nur mit einer Ein-Euro-Münze. Wir wünschen Ihnen einen schönen Aufenthalt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 12),
    (sid, 4, $X7$choice$X7$, $X7$Was ist am Montag geschlossen?$X7$, $X7$$X7$, $X7${"options": ["die Sauna", "das große Becken", "das kleine Becken"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 13),
    (sid, 4, $X7$choice$X7$, $X7$Was brauchen die Gäste für die Schließfächer?$X7$, $X7$$X7$, $X7${"options": ["eine Ein-Euro-Münze", "einen eigenen Schlüssel", "eine Bankkarte"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Hören Sie jeden Text einmal, bei Bedarf zweimal, und kreuzen Sie bei jeder Aufgabe die richtige Lösung an. Es ist immer nur eine Antwort richtig.$X7$, 30, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage am Flughafen.$X7$, $X7$Sehr geehrte Fluggäste, wir bitten um Ihre Aufmerksamkeit. Der Flug nach Wien um 15:30 Uhr hat leider eine Verspätung von etwa 40 Minuten. Der Grund ist das schlechte Wetter. Bitte bleiben Sie in der Nähe von Ausgang B12. Sobald es Neuigkeiten gibt, informieren wir Sie. Vielen Dank für Ihre Geduld.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wohin geht der Flug?$X7$, $X7$$X7$, $X7${"options": ["nach Berlin", "nach Wien", "nach Zürich"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Warum hat der Flug Verspätung?$X7$, $X7$$X7$, $X7${"options": ["wegen des schlechten Wetters", "wegen eines Streiks", "wegen zu vieler Fluggäste"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wo sollen die Fluggäste warten?$X7$, $X7$$X7$, $X7${"options": ["am Eingang des Flughafens", "im Restaurant", "in der Nähe von Ausgang B12"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Guten Tag, hier ist die Praxis Dr. Berger. Ich rufe wegen Ihres Termins am Donnerstag an. Leider ist der Arzt an diesem Tag krank. Wir müssen Ihren Termin deshalb verschieben. Könnten Sie bitte am Freitag um zehn Uhr kommen? Rufen Sie uns bitte kurz zurück und sagen Sie uns Bescheid. Vielen Dank und auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum ruft die Praxis an?$X7$, $X7$$X7$, $X7${"options": ["Der Termin muss verschoben werden.", "Der Patient soll Medikamente abholen.", "Die Praxis ist umgezogen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Wann soll der Patient kommen?$X7$, $X7$$X7$, $X7${"options": ["am Donnerstag um zehn Uhr", "am Freitag um zehn Uhr", "am Montag um neun Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören den Wetterbericht im Radio.$X7$, $X7$Und nun das Wetter für das Wochenende. Am Samstag scheint den ganzen Tag die Sonne, es wird warm, bis zu 26 Grad. Ein perfekter Tag für den See oder das Schwimmbad. Am Sonntag wird es leider kühler, und am Nachmittag kann es regnen. Nehmen Sie für den Sonntag also lieber einen Regenschirm mit. Einen schönen Ausflug wünschen wir Ihnen!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Wie wird das Wetter am Samstag?$X7$, $X7$$X7$, $X7${"options": ["kalt und windig", "sonnig und warm", "es regnet den ganzen Tag"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was empfiehlt der Bericht für den Samstag?$X7$, $X7$$X7$, $X7${"options": ["einen Ausflug zum See oder ins Schwimmbad", "zu Hause zu bleiben", "einen Besuch im Museum"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man am Sonntag mitnehmen?$X7$, $X7$$X7$, $X7${"options": ["eine Sonnenbrille", "warme Winterkleidung", "einen Regenschirm"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 11);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Schreiben Sie zu jedem Punkt ein bis zwei Sätze in ganzen Sätzen. Achten Sie auf Anrede und Gruß und gehen Sie auf alle Leitpunkte ein.$X7$, 30, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe 1: E-Mail

Sie machen bald eine Reise nach Berlin und möchten dort eine Freundin oder einen Freund besuchen. Schreiben Sie eine E-Mail.

Gehen Sie auf folgende Punkte ein:
- Sagen Sie, wann Sie nach Berlin kommen.
- Fragen Sie, ob Sie bei ihr oder ihm übernachten können.
- Schlagen Sie vor, was Sie zusammen machen können.

Vergessen Sie Anrede und Gruß nicht.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Aufgabe 2: Mitteilung

Sie wollten heute mit einer Freundin oder einem Freund ins Schwimmbad gehen, aber Sie sind krank geworden. Schreiben Sie eine kurze Nachricht.

Gehen Sie auf folgende Punkte ein:
- Sagen Sie, dass Sie nicht kommen können, und erklären Sie kurz, warum.
- Entschuldigen Sie sich.
- Schlagen Sie einen neuen Termin vor.

Schreiben Sie höflich und in ganzen Sätzen.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$A2$X7$, 3, $X7$A2-Modellprüfung 3: Ausbildung/Bildung, Technik und Umwelt$X7$, $X7$Eine komplette Übungsprüfung im Goethe-/telc-Stil (A2) zu den Themen Ausbildung, Technik und Umwelt – mit Lesen, Hören und Schreiben.$X7$, false, 3)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antworten (a, b oder c), aber nur eine Antwort ist richtig. Kreuzen Sie die richtige Antwort an.$X7$, 30, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail von einer Freundin

Hallo Lena,

ich habe tolle Neuigkeiten! Nächsten Monat beginne ich meine Ausbildung als Mechatronikerin bei einer Firma hier in Dortmund. Ich freue mich sehr, denn Technik hat mir schon in der Schule Spaß gemacht. Am Anfang ist es bestimmt nicht leicht, weil ich auch zwei Tage pro Woche in die Berufsschule gehen muss. Aber ich bekomme sofort mein eigenes Gehalt, das finde ich super. Kommst du mich bald in Dortmund besuchen? Dann zeige ich dir die Stadt.

Liebe Grüße
Sofia$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was macht Sofia nächsten Monat?$X7$, $X7$$X7$, $X7${"options": ["Sie beginnt eine Ausbildung.", "Sie zieht ins Ausland.", "Sie fängt ein Studium an."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Warum hat Sofia diesen Beruf gewählt?$X7$, $X7$$X7$, $X7${"options": ["Weil ihre Eltern das wollten.", "Weil ihr Technik Spaß macht.", "Weil sie viel Geld verdienen möchte."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was findet Sofia an der Ausbildung besonders gut?$X7$, $X7$$X7$, $X7${"options": ["Sie hat viele Ferien.", "Sie muss nicht in die Schule.", "Sie verdient sofort eigenes Geld."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Anzeige

Reparatur-Café im Stadtteilzentrum

Ihr Handy ist kaputt? Der Toaster funktioniert nicht mehr? Bringen Sie Ihre alten Geräte zu uns! Jeden ersten Samstag im Monat helfen Ihnen unsere Technik-Experten von 14 bis 17 Uhr beim Reparieren. Das ist kostenlos. So sparen Sie Geld und schützen die Umwelt, weil weniger Müll entsteht. Werkzeug ist vorhanden. Bitte bringen Sie nur kleine Geräte mit.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was kann man im Reparatur-Café machen?$X7$, $X7$$X7$, $X7${"options": ["Neue Geräte kaufen.", "Alte Geräte reparieren lassen.", "Werkzeug ausleihen."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was kostet die Hilfe im Reparatur-Café?$X7$, $X7$$X7$, $X7${"options": ["Nichts, sie ist kostenlos.", "17 Euro.", "Das steht nicht im Text."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Zeitungstext

Weniger Plastik in der Schule

An einer Schule in Freiburg gibt es seit diesem Jahr kein Plastik mehr in der Mensa. Die Schüler bekommen ihr Essen jetzt auf Tellern aus Glas, und zum Trinken gibt es Flaschen, die man wieder benutzen kann. Viele Schüler bringen außerdem ihr Pausenbrot in einer Box von zu Hause mit. Die Lehrerin Frau Berg sagt: So lernen die Kinder schon früh, wie wichtig der Schutz der Umwelt ist. Andere Schulen möchten die Idee jetzt auch ausprobieren.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Was ist neu an der Schule in Freiburg?$X7$, $X7$$X7$, $X7${"options": ["Es gibt eine neue Mensa.", "In der Mensa gibt es kein Plastik mehr.", "Das Essen ist jetzt billiger."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was bringen viele Schüler von zu Hause mit?$X7$, $X7$$X7$, $X7${"options": ["Ihr eigenes Besteck.", "Geld für das Essen.", "Ihr Pausenbrot in einer Box."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was möchten andere Schulen tun?$X7$, $X7$$X7$, $X7${"options": ["Die Idee auch ausprobieren.", "Wieder Plastik benutzen.", "Die Mensa schließen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Aushang für die Eltern

Liebe Eltern,

am Freitag, den 12. Juni, besucht unsere Klasse 7b das Technik-Museum in der Stadt. Wir treffen uns um 8 Uhr direkt vor dem Museum, nicht in der Schule. Der Eintritt ist frei, aber bitte geben Sie Ihrem Kind etwas Geld für das Mittagessen mit. Denken Sie bitte auch an bequeme Schuhe, denn wir machen eine lange Führung. Um 15 Uhr sind wir wieder zurück. Bei Fragen rufen Sie mich gern an.

Herr Klein$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 12),
    (sid, 4, $X7$choice$X7$, $X7$Wo trifft sich die Klasse am Freitag?$X7$, $X7$$X7$, $X7${"options": ["In der Schule.", "Vor dem Museum.", "Am Bahnhof."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 13),
    (sid, 4, $X7$choice$X7$, $X7$Was sollen die Eltern ihrem Kind mitgeben?$X7$, $X7$$X7$, $X7${"options": ["Geld für das Mittagessen.", "Geld für den Eintritt.", "Ein Getränk."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Zu jedem Text gibt es Aufgaben. Hören Sie jeden Text einmal (bei Bedarf zweimal) und kreuzen Sie bei jeder Aufgabe die richtige Lösung an. Es ist immer nur eine Antwort richtig.$X7$, 30, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einer Berufsschule.$X7$, $X7$Liebe Schülerinnen und Schüler, eine wichtige Information für alle Klassen: Der Computerraum im zweiten Stock bleibt diese Woche geschlossen, weil wir neue Computer aufbauen. Der Informatikunterricht findet deshalb im Raum 105 statt. Bitte bringt am Donnerstag euren USB-Stick mit. Vielen Dank und einen schönen Tag!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum bleibt der Computerraum geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Weil die Schüler Ferien haben.", "Weil neue Computer aufgebaut werden.", "Weil der Raum zu klein ist."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wo findet der Informatikunterricht jetzt statt?$X7$, $X7$$X7$, $X7${"options": ["Im Raum 105.", "Im zweiten Stock.", "In der Bibliothek."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was sollen die Schüler am Donnerstag mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Ein Buch.", "Einen Laptop.", "Einen USB-Stick."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Guten Tag, hier ist die Handy-Werkstatt Meyer. Ihr Telefon ist fertig repariert, Sie können es ab morgen bei uns abholen. Wir haben einen neuen Akku eingebaut. Das kostet zusammen fünfundvierzig Euro. Wir haben von Montag bis Freitag bis achtzehn Uhr geöffnet. Bitte bringen Sie Ihren Zettel mit. Auf Wiederhören!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum ruft die Werkstatt an?$X7$, $X7$$X7$, $X7${"options": ["Das Handy ist fertig repariert.", "Das Handy kann nicht repariert werden.", "Die Werkstatt braucht eine neue Adresse."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was hat die Werkstatt gemacht?$X7$, $X7$$X7$, $X7${"options": ["Einen neuen Bildschirm eingebaut.", "Einen neuen Akku eingebaut.", "Ein neues Handy verkauft."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören den Wetterbericht im Radio.$X7$, $X7$Und jetzt das Wetter für morgen. Am Vormittag ist es noch sonnig und warm, bis zu sechsundzwanzig Grad. Am Nachmittag kommen von Westen Wolken, und am Abend gibt es starken Regen und Wind. Bitte schließen Sie Ihre Fenster. Am Wochenende wird es dann wieder kühler und trocken. Einen schönen Tag!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter morgen am Vormittag?$X7$, $X7$$X7$, $X7${"options": ["Sonnig und warm.", "Kalt und windig.", "Neblig."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man am Abend tun?$X7$, $X7$$X7$, $X7${"options": ["Einen Regenschirm kaufen.", "Die Fenster schließen.", "Zu Hause bleiben."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wie wird das Wetter am Wochenende?$X7$, $X7$$X7$, $X7${"options": ["Wärmer und sonnig.", "Kühler und trocken.", "Noch mehr Regen."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Achten Sie auf eine passende Anrede und einen höflichen Schluss. Schreiben Sie in ganzen Sätzen und gehen Sie auf alle Punkte ein.$X7$, 30, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe 1: E-Mail an einen Freund

Sie haben einen neuen Deutschkurs an der Volkshochschule begonnen. Schreiben Sie eine E-Mail an Ihren Freund Max.

Gehen Sie auf folgende Punkte ein:
- Erklären Sie, was für einen Kurs Sie machen.
- Schreiben Sie, wie Ihnen der Kurs gefällt.
- Laden Sie Max ein, Sie am Wochenende zu besuchen.

Schreiben Sie etwa 30 bis 40 Wörter. Vergessen Sie Anrede und Gruß nicht.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Aufgabe 2: Kurze Mitteilung

Ihr Computer im Büro funktioniert nicht mehr. Schreiben Sie eine kurze Nachricht an die Technik-Abteilung, an Herrn Sommer.

Gehen Sie auf folgende Punkte ein:
- Beschreiben Sie kurz das Problem.
- Fragen Sie, wann jemand vorbeikommen kann.
- Sagen Sie, wann Sie im Büro sind.

Schreiben Sie etwa 30 bis 40 Wörter. Schreiben Sie höflich und in ganzen Sätzen.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$B2$X7$, 1, $X7$B2-Modellprüfung 1: Alltag, Arbeit und Wohnen$X7$, $X7$Lesen, Hören und Schreiben auf B2-Niveau rund um Alltag, Beruf und Wohnen (Goethe/telc)$X7$, true, 1)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antwortmöglichkeiten (a, b oder c), aber nur eine Antwort ist richtig. Kreuzen Sie die richtige Lösung an.$X7$, 60, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Wenn das Büro ins Wohnzimmer zieht

Seit sich das Arbeiten von zu Hause in vielen Branchen durchgesetzt hat, verändern sich auch die Ansprüche an die eigene Wohnung. Was früher als angenehmes Extra galt – ein zusätzliches Zimmer, ein ruhiger Winkel mit Schreibtisch –, ist für viele Beschäftigte zur Grundvoraussetzung geworden. Maklerbüros berichten, dass Interessenten heute gezielt nach Wohnungen mit einem separaten Arbeitsraum fragen, selbst wenn die Miete dadurch spürbar steigt.

Dieser Wandel bleibt nicht ohne Folgen für die Städte. Da die tägliche Fahrt ins Büro für manche ganz entfällt oder nur noch zwei- bis dreimal pro Woche nötig ist, ziehen immer mehr Familien ins Umland, wo die Quadratmeter günstiger sind. Fachleute beobachten deshalb, dass die Nachfrage in gut angebundenen Vororten stark zunimmt, während zentrale Lagen an Bedeutung verlieren – zumindest bei denjenigen, die flexibel arbeiten dürfen.

Allerdings warnen Sozialforscher vor zu viel Euphorie. Nicht jeder Beruf lasse sich von zu Hause ausüben, und wer in der Pflege, im Handwerk oder im Einzelhandel tätig sei, habe von dieser neuen Freiheit nichts. Zudem drohe die Grenze zwischen Arbeit und Privatleben zu verschwimmen. Wer morgens nur den Flur durchquere, um an den Schreibtisch zu gelangen, finde abends oft schwer wieder zum Feierabend.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was hat sich laut Text bei der Wohnungssuche verändert?$X7$, $X7$$X7$, $X7${"options": ["Interessenten verzichten bewusst auf ein Arbeitszimmer, um Miete zu sparen.", "Ein eigener Arbeitsraum wird häufig zur Bedingung, auch wenn die Miete dadurch steigt.", "Maklerbüros bieten kaum noch Wohnungen mit einem Arbeitszimmer an."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Warum ziehen laut Text mehr Familien ins Umland?$X7$, $X7$$X7$, $X7${"options": ["Weil die Wege ins Büro seltener nötig sind und das Wohnen dort günstiger ist.", "Weil die Arbeitgeber einen Umzug ins Umland finanziell unterstützen.", "Weil in den Innenstädten keine Familienwohnungen mehr frei sind."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was geben die Sozialforscher zu bedenken?$X7$, $X7$$X7$, $X7${"options": ["Die Vororte seien inzwischen schlechter an den Nahverkehr angebunden als früher.", "Das Homeoffice nütze allen Berufsgruppen in gleichem Maße.", "Viele Berufe profitierten nicht davon, und die Erholung komme oft zu kurz."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Kommentar: Schluss mit der ständigen Erreichbarkeit

Es ist Viertel vor zehn am Abend, und auf dem Diensthandy blinkt schon wieder eine Nachricht. „Nur ganz kurz“, schreibt der Vorgesetzte, „kannst du dir das morgen früh gleich ansehen?“ Für viele Beschäftigte gehört diese Szene längst zum Alltag. Dass sie uns auf Dauer krank macht, ist inzwischen gut belegt – und trotzdem ändert sich wenig.

Ich halte das für einen Fehler. Natürlich klingt es bequem, abends noch eben eine Mail zu beantworten, statt sie auf den Morgen zu verschieben. Doch der Preis dafür ist hoch. Wer nie wirklich abschaltet, dessen Leistungsfähigkeit sinkt mit der Zeit, und genau das sollte eigentlich auch im Interesse der Unternehmen liegen. Ein ausgeruhter Mitarbeiter arbeitet am Ende besser als einer, der rund um die Uhr auf Abruf steht.

Manche Betriebe haben das erkannt und schalten ihre Server nach Feierabend ab. Ich bezweifle allerdings, dass solche technischen Lösungen allein genügen. Entscheidend ist die Haltung der Führungskräfte. Solange eine schnelle Antwort am späten Abend als Zeichen von Einsatz gilt und belohnt wird, wird sich am Verhalten der Beschäftigten nichts ändern – ganz gleich, wie viele Regeln man aufstellt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Welche Meinung vertritt der Autor?$X7$, $X7$$X7$, $X7${"options": ["Die ständige Erreichbarkeit schadet und sollte eingeschränkt werden.", "Abendliche Mails sind unproblematisch, solange sie kurz sind.", "Unternehmen profitieren davon, wenn Mitarbeitende immer erreichbar sind."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Warum liegt weniger Erreichbarkeit laut Autor auch im Interesse der Unternehmen?$X7$, $X7$$X7$, $X7${"options": ["Weil ausgeruhte Mitarbeitende auf Dauer bessere Leistung bringen.", "Weil abgeschaltete Server deutlich Stromkosten einsparen.", "Weil den Unternehmen sonst hohe gesetzliche Strafen drohen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was hält der Autor für entscheidend, um das Problem zu lösen?$X7$, $X7$$X7$, $X7${"options": ["strengere gesetzliche Vorschriften für sämtliche Branchen", "die Einstellung der Vorgesetzten und nicht allein technische Maßnahmen", "das Abschalten der Server nach Feierabend als alleinige Lösung"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Ratgeber: Die Nebenkostenabrechnung richtig prüfen

Einmal im Jahr flattert sie ins Haus: die Abrechnung der Betriebskosten. Für viele Mieterinnen und Mieter ist sie ein Ärgernis, weil die Zahlen schwer zu durchschauen sind. Dabei lohnt sich ein genauer Blick, denn Fachleute schätzen, dass etwa die Hälfte aller Abrechnungen Fehler enthält.

Zunächst sollten Sie prüfen, ob die Abrechnung rechtzeitig bei Ihnen eingegangen ist. Der Vermieter hat dafür nach dem Ende des Abrechnungszeitraums zwölf Monate Zeit. Verschickt er die Abrechnung später, müssen Sie eine Nachzahlung in der Regel nicht mehr leisten – ein Guthaben hingegen steht Ihnen weiterhin zu.

Achten Sie außerdem auf den Verteilerschlüssel, also darauf, nach welchem Maßstab die Kosten auf die einzelnen Wohnungen umgelegt werden. Üblich ist eine Verteilung nach Wohnfläche; bei den Heizkosten muss jedoch zumindest ein Teil nach dem tatsächlichen Verbrauch berechnet werden. Finden Sie Posten wie Verwaltungskosten oder Reparaturen, sollten Sie misstrauisch werden: Solche Ausgaben darf der Vermieter nicht auf die Mieter abwälzen.

Wer Zweifel hat, muss nicht gleich vor Gericht ziehen. Oft genügt ein freundliches Schreiben, in dem Sie um Einsicht in die Originalbelege bitten. Mietervereine unterstützen Sie dabei zu geringen Kosten.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Bis wann muss der Vermieter die Abrechnung verschicken?$X7$, $X7$$X7$, $X7${"options": ["innerhalb von zwölf Monaten nach dem Abrechnungszeitraum", "spätestens am Ende des Abrechnungszeitraums", "innerhalb von sechs Monaten nach dem Einzug"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was gilt, wenn die Abrechnung zu spät beim Mieter eingeht?$X7$, $X7$$X7$, $X7${"options": ["Der Mieter verliert ein ihm zustehendes Guthaben.", "Eine Nachzahlung muss der Mieter meist nicht mehr leisten, ein Guthaben bleibt aber bestehen.", "Der Mieter muss die geforderte Nachzahlung trotzdem in voller Höhe leisten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Welchen Rat gibt der Text bei Zweifeln an der Abrechnung?$X7$, $X7$$X7$, $X7${"options": ["sofort einen Anwalt mit einer Klage gegen den Vermieter beauftragen", "zunächst höflich um Einsicht in die Originalbelege bitten", "aus Protest die Zahlung der gesamten Miete einstellen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Information der Hausverwaltung zur geplanten Modernisierung

Sehr geehrte Mieterinnen und Mieter,

wie bereits angekündigt, lässt die Eigentümergesellschaft das Gebäude in der Lindenstraße 14 im kommenden Jahr energetisch sanieren. Dabei werden die Fassade gedämmt und sämtliche Fenster erneuert. Ziel ist es, den Energieverbrauch des Hauses deutlich zu senken und so langfristig Ihre Heizkosten zu verringern.

Die Arbeiten beginnen voraussichtlich im März und dauern etwa vier Monate. Während dieser Zeit wird ein Gerüst aufgebaut; wir bitten Sie, in den betroffenen Wochen Ihre Fenster geschlossen zu halten und keine Wertgegenstände auf den Fensterbänken zu lagern. Ihre Wohnungen bleiben während der gesamten Bauzeit bewohnbar; ein Auszug ist nicht erforderlich.

Bitte beachten Sie, dass eine Modernisierung nach den gesetzlichen Vorgaben zu einer moderaten Mieterhöhung führen kann. Über die genaue Höhe werden wir Sie rechtzeitig und schriftlich informieren, sobald die Kosten feststehen. Sollten Sie Fragen haben oder während der Bauphase besondere Unterstützung benötigen – etwa weil Sie im Homeoffice arbeiten und auf Ruhe angewiesen sind –, wenden Sie sich bitte an unser Büro. Eine Sprechstunde findet jeden Dienstag von 9 bis 12 Uhr statt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 13),
    (sid, 4, $X7$choice$X7$, $X7$Was ist das Ziel der Modernisierung?$X7$, $X7$$X7$, $X7${"options": ["den Energieverbrauch zu senken und so die Heizkosten zu verringern", "die Zahl der Wohnungen im Gebäude zu erhöhen", "das Gebäude auf einen baldigen Verkauf vorzubereiten"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14),
    (sid, 4, $X7$choice$X7$, $X7$Was sollen die Mieter während der Bauzeit tun?$X7$, $X7$$X7$, $X7${"options": ["vorübergehend aus der Wohnung ausziehen", "die Fenster geschlossen halten und nichts auf den Fensterbänken lagern", "die Heizung während der Arbeiten vollständig abstellen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 15),
    (sid, 4, $X7$choice$X7$, $X7$Was erfahren die Mieter über eine mögliche Mieterhöhung?$X7$, $X7$$X7$, $X7${"options": ["Sie ist ausgeschlossen, weil die Eigentümer alle Kosten tragen.", "Sie steht bereits fest und gilt ab dem Monat März.", "Sie ist möglich; die genaue Höhe wird später schriftlich mitgeteilt."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 16);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei Texte, die jeweils von einer einzelnen Person gesprochen werden. Lesen Sie zuerst die Fragen zu jedem Text. Hören Sie dann zu und kreuzen Sie bei jeder Frage die richtige Antwort (a, b oder c) an. Es ist immer nur eine Antwort richtig. Bei Bedarf können Sie jeden Text zweimal hören.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören den Beginn eines kurzen Vortrags auf einer Betriebsversammlung. Die Personalleiterin stellt ein neues Arbeitszeitmodell vor.$X7$, $X7$Herzlich willkommen zu unserer Betriebsversammlung. Ich möchte Ihnen heute unser neues Arbeitszeitmodell vorstellen. Ab dem ersten Oktober gilt für alle Abteilungen die Gleitzeit: Sie können künftig zwischen sieben und zehn Uhr mit der Arbeit beginnen und entsprechend früher oder später Feierabend machen. Wichtig ist nur, dass Sie Ihre vereinbarte Wochenstundenzahl erreichen und in der Kernzeit von zehn bis fünfzehn Uhr anwesend sind, denn in dieser Zeit finden die meisten Besprechungen statt. Wer gelegentlich von zu Hause arbeiten möchte, bespricht das bitte direkt mit der jeweiligen Teamleitung. Wir hoffen sehr, dass dieses Modell Ihnen hilft, Beruf und Familie besser miteinander zu vereinbaren.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was wird in dem Vortrag vorgestellt?$X7$, $X7$$X7$, $X7${"options": ["ein neues Modell für die Arbeitszeit", "ein neues Bürogebäude für alle Abteilungen", "eine allgemeine Gehaltserhöhung"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was müssen die Mitarbeitenden künftig beachten?$X7$, $X7$$X7$, $X7${"options": ["Sie müssen jeden Tag pünktlich um sieben Uhr beginnen.", "Sie müssen in der Kernzeit von zehn bis fünfzehn Uhr anwesend sein.", "Sie dürfen gar nicht mehr von zu Hause aus arbeiten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Welches Ziel verfolgt das neue Modell?$X7$, $X7$$X7$, $X7${"options": ["Besprechungen künftig ganz abzuschaffen", "die Zahl der Mitarbeitenden zu verringern", "Beruf und Familie besser zu vereinbaren"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören einen kurzen Beitrag aus einer Radiosendung zum Thema Wohnen.$X7$, $X7$Und nun zu einem Thema, das viele von Ihnen betrifft: dem Wohnungsmarkt in unserer Region. Nach einer aktuellen Studie sind die Mieten in der Innenstadt im vergangenen Jahr um durchschnittlich sechs Prozent gestiegen. Besonders betroffen sind kleine Wohnungen, die vor allem von Studierenden und Berufseinsteigern gesucht werden. Die Stadt will nun gegensteuern: In den kommenden fünf Jahren sollen rund zweitausend neue Wohnungen entstehen, ein Teil davon mit günstigeren Mieten. Fachleute begrüßen den Plan, warnen jedoch, dass der Bau viel Zeit brauche und kurzfristig keine Entlastung bringe. Wer heute eine bezahlbare Wohnung sucht, müsse daher weiterhin auch das Umland in Betracht ziehen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wie haben sich die Mieten in der Innenstadt entwickelt?$X7$, $X7$$X7$, $X7${"options": ["Sie sind um durchschnittlich sechs Prozent gestiegen.", "Sie sind im vergangenen Jahr leicht gesunken.", "Sie sind weitgehend gleich geblieben."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was plant die Stadt, um gegenzusteuern?$X7$, $X7$$X7$, $X7${"options": ["die Mieten gesetzlich für fünf Jahre einzufrieren", "in fünf Jahren rund zweitausend neue Wohnungen zu bauen", "Studierenden das Wohnen in der Innenstadt zu untersagen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wovor warnen die Fachleute?$X7$, $X7$$X7$, $X7${"options": ["dass die neuen Wohnungen viel zu teuer gebaut werden", "dass das Umland schon bald völlig überfüllt sein wird", "dass der Neubau Zeit braucht und kurzfristig nicht hilft"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter. Eine Mitarbeiterin der Hausverwaltung hinterlässt Ihnen wichtige Informationen.$X7$, $X7$Guten Tag, hier ist Frau Berger von der Hausverwaltung Sonnblick. Ich rufe wegen des angekündigten Austauschs der Wasserzähler in Ihrem Haus an. Der Termin findet am Donnerstag, dem zwölften November, zwischen acht und zwölf Uhr statt. Bitte sorgen Sie dafür, dass an diesem Vormittag jemand in der Wohnung ist und der Monteur zu Küche und Bad gelangen kann. Sollte Ihnen der Termin nicht passen, rufen Sie mich bitte bis spätestens Montag zurück, dann vereinbaren wir einen Ersatztermin. Beachten Sie außerdem, dass das Wasser während der Arbeiten für etwa eine Stunde abgestellt wird. Füllen Sie sich also vorsorglich etwas Trinkwasser ab. Vielen Dank und auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Worum geht es in der Nachricht?$X7$, $X7$$X7$, $X7${"options": ["um den Austausch der Wasserzähler", "um eine geplante Mieterhöhung", "um die Reinigung des Treppenhauses"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was soll der Mieter am Termintag tun?$X7$, $X7$$X7$, $X7${"options": ["das Wasser schon vorher selbst abstellen", "dafür sorgen, dass jemand den Monteur in die Wohnung lässt", "den Wasserzähler vorab selbst ablesen und melden"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was soll der Mieter tun, wenn der Termin nicht passt?$X7$, $X7$$X7$, $X7${"options": ["eigenständig einen anderen Monteur beauftragen", "bis Montag zurückrufen und einen Ersatztermin vereinbaren", "nichts tun, da der Termin ohnehin automatisch verschoben wird"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Achten Sie auf einen klaren Aufbau, eine passende Anrede und einen höflichen Schluss. Gehen Sie auf alle Leitpunkte ein und schreiben Sie zusammenhängend und in ganzen Sätzen.$X7$, 60, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe 1: Forenbeitrag (ca. 150–180 Wörter)

In einem Online-Forum zum Thema Arbeitswelt diskutieren die Teilnehmer über die Frage: „Sollten Unternehmen ihren Mitarbeitenden das Arbeiten im Homeoffice dauerhaft erlauben?“ Schreiben Sie einen Beitrag für das Forum und nehmen Sie begründet Stellung.

Gehen Sie dabei auf folgende Punkte ein:
- Beschreiben Sie Ihre eigenen Erfahrungen oder Beobachtungen mit dem Arbeiten von zu Hause.
- Nennen Sie je einen Vorteil und einen Nachteil des Homeoffice – für die Beschäftigten und für die Unternehmen.
- Erklären Sie, welche Lösung Sie persönlich für sinnvoll halten, und begründen Sie Ihre Meinung.

Schreiben Sie etwa 150–180 Wörter. Achten Sie auf einen klaren Aufbau mit Einleitung, Hauptteil und Schluss.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 150, 180, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Aufgabe 2: Formelle E-Mail – Beschwerde (ca. 100 Wörter)

Seit einigen Wochen gibt es in Ihrem Wohnhaus erhebliche Probleme: Der Aufzug ist häufig defekt, und im Treppenhaus brennt abends kein Licht. Sie haben die Hausverwaltung bereits mündlich informiert, doch nichts hat sich geändert. Schreiben Sie eine formelle E-Mail an die Hausverwaltung (Frau Berger).

Gehen Sie dabei auf folgende Punkte ein:
- Schildern Sie die Probleme und seit wann sie bestehen.
- Weisen Sie darauf hin, dass Sie sich bereits gemeldet haben.
- Fordern Sie höflich, aber bestimmt eine rasche Lösung und nennen Sie eine angemessene Frist.

Vergessen Sie Betreff, Anrede und Grußformel nicht. Schreiben Sie etwa 100 Wörter.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 90, 120, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$B2$X7$, 2, $X7$B2-Modellprüfung 2: Reisen, Gesundheit und Freizeit$X7$, $X7$Goethe-/telc-Format · Lesen, Hören, Schreiben · Themenschwerpunkt: Reisen, Gesundheit und Freizeit$X7$, false, 2)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Bei jeder Frage ist nur eine Antwort richtig. Markieren Sie die passende Lösung. Sie haben für diesen Prüfungsteil etwa 60 Minuten Zeit.$X7$, 60, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Nachhaltig reisen – ein Anspruch mit Grenzen

Immer mehr Reisende achten bei der Urlaubsplanung auf die ökologischen Folgen ihrer Entscheidungen. Reiseveranstalter berichten, dass vor allem jüngere Kundinnen und Kunden gezielt nach Angeboten fragen, die lange Flüge vermeiden und stattdessen auf Zugverbindungen setzen. Gleichzeitig zeigt eine aktuelle Umfrage, dass die Bereitschaft, dafür höhere Preise zu zahlen, in der Praxis begrenzt bleibt: Sobald eine klimafreundliche Reise deutlich teurer ist als die herkömmliche Variante, entscheiden sich die meisten am Ende doch für das günstigere Angebot.

Fachleute sehen darin keinen Widerspruch, sondern ein typisches Spannungsfeld zwischen Überzeugung und Geldbeutel. Sie fordern deshalb, dass umweltfreundliche Angebote nicht länger als Luxus für wenige vermarktet, sondern durch staatliche Förderung für breite Schichten bezahlbar gemacht werden. Nur so, argumentieren sie, lasse sich die Lücke zwischen gutem Willen und tatsächlichem Verhalten schließen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was ergab die genannte Umfrage zur Zahlungsbereitschaft der Reisenden?$X7$, $X7$$X7$, $X7${"options": ["Die meisten Reisenden zahlen bereitwillig deutlich mehr für klimafreundliche Reisen.", "Nur ältere Reisende sind überhaupt bereit, höhere Preise zu akzeptieren.", "Viele befürworten umweltfreundliche Reisen, wählen bei großem Preisunterschied aber meist die günstigere Option."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was fordern die Fachleute laut Text?$X7$, $X7$$X7$, $X7${"options": ["Umweltfreundliche Angebote sollten durch Förderung für viele erschwinglich gemacht werden.", "Klimafreundliche Reisen sollten gezielt als Luxusprodukt beworben werden.", "Lange Flüge sollten grundsätzlich vollständig verboten werden."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wie bewerten die Fachleute das widersprüchlich wirkende Verhalten der Reisenden?$X7$, $X7$$X7$, $X7${"options": ["Als unehrlich und als Zeichen mangelnder Glaubwürdigkeit.", "Als nachvollziehbaren Konflikt zwischen Überzeugung und finanziellen Möglichkeiten.", "Als eindeutigen Beweis für fehlendes Umweltbewusstsein."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Kommentar: Die vermessene Gesundheit

Kaum ein Lebensbereich bleibt heute von der Vermessung verschont. Schrittzähler, Schlafanalyse, Pulsmessung – wer etwas auf sich hält, trägt die eigene Gesundheit als Zahlenkolonne am Handgelenk. Ich halte diese Entwicklung für ausgesprochen zwiespältig.

Natürlich kann es motivieren, wenn eine App zwischendurch zur Bewegung mahnt. Doch allzu oft verkehrt sich der gute Vorsatz ins Gegenteil: Aus dem entspannten Spaziergang wird eine Pflichtübung, aus dem Schlaf ein zu optimierendes Projekt. Erholung aber lässt sich nun einmal nicht erzwingen. Wer ständig kontrolliert, ob er auch gesund genug lebt, setzt sich einem Druck aus, der der Gesundheit am Ende mehr schadet als nützt.

Missverstehen Sie mich nicht: Gegen gelegentliches Messen ist nichts einzuwenden. Nur sollte man nicht vergessen, worauf es eigentlich ankommt. Manchmal wäre es klüger, das Gerät einfach für eine Weile abzulegen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Welche Haltung vertritt der Autor gegenüber Fitness-Trackern?$X7$, $X7$$X7$, $X7${"options": ["Er lehnt jede Form der Selbstvermessung grundsätzlich und vollständig ab.", "Er sieht sie ambivalent und warnt vor allem vor übermäßigem Druck.", "Er empfiehlt ihren Einsatz uneingeschränkt zur Förderung der Gesundheit."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was kritisiert der Autor am ständigen Messen konkret?$X7$, $X7$$X7$, $X7${"options": ["Dass Erholung dadurch zur Pflichtübung wird und sich Druck aufbaut.", "Dass die Geräte technisch häufig ungenaue Werte liefern.", "Dass die entsprechenden Apps für viele Menschen zu teuer sind."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was will der Autor mit dem letzten Satz ausdrücken?$X7$, $X7$$X7$, $X7${"options": ["Man sollte das Gerät zeitweise bewusst weglegen.", "Man sollte sich ein besseres, genaueres Gerät kaufen.", "Man sollte bei Beschwerden häufiger einen Arzt aufsuchen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Gut vorbereitet auf Fernreisen – ein Ratgeber

Wer eine Fernreise plant, sollte sich rechtzeitig mit dem Thema Gesundheitsvorsorge beschäftigen – idealerweise schon sechs bis acht Wochen vor dem Abflug. Viele Impfungen entfalten ihren Schutz nämlich erst nach einigen Wochen, und manche erfordern sogar mehrere Termine im Abstand von Tagen oder Wochen. Ein Besuch beim Reisemediziner lohnt sich daher in jedem Fall, denn er kann die Empfehlungen auf das konkrete Reiseland und die geplanten Aktivitäten abstimmen.

Darüber hinaus gehört in jedes Gepäck eine gut sortierte Reiseapotheke. Neben den persönlichen Medikamenten sollten Mittel gegen Durchfall, Schmerzen und Insektenstiche keinesfalls fehlen. Wichtig ist außerdem, verschreibungspflichtige Arzneimittel stets im Handgepäck und in der Originalverpackung mitzuführen – andernfalls kann es bei Grenzkontrollen zu Schwierigkeiten kommen. Wer diese Hinweise beherzigt, kann vielen vermeidbaren Problemen von vornherein aus dem Weg gehen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Warum sollte man sich frühzeitig um Impfungen kümmern?$X7$, $X7$$X7$, $X7${"options": ["Weil Impfungen kurz vor der Reise deutlich günstiger angeboten werden.", "Weil der Schutz oft erst nach Wochen wirkt und mehrere Termine nötig sein können.", "Weil Reisemediziner nur sehr selten freie Termine anbieten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was empfiehlt der Text zum Umgang mit verschreibungspflichtigen Medikamenten?$X7$, $X7$$X7$, $X7${"options": ["Sie zur Platzersparnis im aufgegebenen Koffer zu verstauen.", "Auf sie während der gesamten Reise möglichst ganz zu verzichten.", "Sie im Handgepäck und in der Originalverpackung mitzuführen."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was gehört laut Text neben den persönlichen Medikamenten in jede Reiseapotheke?$X7$, $X7$$X7$, $X7${"options": ["Ausschließlich die vom Hausarzt verordneten Dauermedikamente.", "Mittel gegen Durchfall, Schmerzen und Insektenstiche.", "Vor allem Vitaminpräparate und Nahrungsergänzungsmittel."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Mitteilung an die Vereinsmitglieder

Sehr geehrte Mitglieder,

aufgrund dringend notwendiger Sanierungsarbeiten bleibt das Hallenbad unseres Sportvereins von Anfang März bis voraussichtlich Ende Mai geschlossen. Wir bitten um Ihr Verständnis, dass in dieser Zeit kein Schwimmtraining in unseren Räumen stattfinden kann.

Als Ausgleich haben wir mit dem benachbarten Freizeitbad eine Vereinbarung getroffen: Unsere Mitglieder können dort gegen Vorlage ihres Mitgliedsausweises zweimal wöchentlich kostenlos trainieren. Die genauen Zeiten entnehmen Sie bitte dem Aushang im Schaukasten. Der reguläre Mitgliedsbeitrag wird für die Dauer der Schließung nicht erhoben; bereits gezahlte Beiträge verrechnen wir automatisch mit dem Folgemonat.

Bei Rückfragen steht Ihnen unser Büro montags und donnerstags gern zur Verfügung. Wir freuen uns darauf, Sie im Juni wieder in einem frisch sanierten Bad begrüßen zu dürfen.

Mit sportlichen Grüßen
Der Vorstand$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 13),
    (sid, 4, $X7$choice$X7$, $X7$Welches Ersatzangebot steht den Mitgliedern während der Schließung zur Verfügung?$X7$, $X7$$X7$, $X7${"options": ["Zweimal pro Woche kostenloses Training im benachbarten Freizeitbad.", "Die tägliche kostenlose Nutzung eines beliebigen anderen Hallenbads.", "Die Teilnahme an einem Ersatztraining unter freiem Himmel."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 14),
    (sid, 4, $X7$choice$X7$, $X7$Was geschieht laut Mitteilung mit dem Mitgliedsbeitrag?$X7$, $X7$$X7$, $X7${"options": ["Er wird während der Schließung weiterhin in voller Höhe erhoben.", "Er wird den Mitgliedern vollständig auf das Konto zurücküberwiesen.", "Er wird für die Zeit der Schließung nicht erhoben."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 15);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei Texte. Jeder Text wird vorgelesen (im Unterricht bei Bedarf zweimal). Zu jedem Text gibt es drei Aufgaben. Wählen Sie bei jeder Aufgabe die richtige Antwort. Sie haben für diesen Prüfungsteil etwa 40 Minuten Zeit.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören den Beginn eines Vortrags bei einer Gesundheitsmesse.$X7$, $X7$Meine sehr geehrten Damen und Herren, ich freue mich, heute über ein Thema zu sprechen, das uns alle betrifft: Bewegung im Alltag. Viele von Ihnen glauben vielleicht, man müsse unbedingt dreimal pro Woche ins Fitnessstudio, um etwas für die Gesundheit zu tun. Die neuere Forschung zeichnet jedoch ein anderes Bild. Entscheidend ist nämlich nicht das einmalige, intensive Training, sondern die regelmäßige Bewegung, verteilt über den ganzen Tag. Wer das Auto öfter stehen lässt, die Treppe statt des Aufzugs nimmt und in der Mittagspause einen kurzen Spaziergang macht, der tut bereits erstaunlich viel für sein Wohlbefinden. Mein Ziel heute ist es, Ihnen zu zeigen, wie leicht sich solche kleinen Gewohnheiten selbst in einen vollen Arbeitstag einbauen lassen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was ist die zentrale Aussage des Redners?$X7$, $X7$$X7$, $X7${"options": ["Nur regelmäßiges Training im Fitnessstudio hält den Menschen wirklich gesund.", "Regelmäßige Bewegung über den Tag ist wichtiger als einmaliges intensives Training.", "Bewegung ist für die Gesundheit insgesamt weniger wichtig als die Ernährung."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Welches Beispiel für Alltagsbewegung nennt der Redner?$X7$, $X7$$X7$, $X7${"options": ["Jeden Morgen eine volle Stunde zu joggen.", "Die Treppe statt des Aufzugs zu nehmen.", "Zweimal täglich ins Fitnessstudio zu gehen."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was möchte der Redner im weiteren Vortrag zeigen?$X7$, $X7$$X7$, $X7${"options": ["Wie sich kleine Gewohnheiten leicht in den Alltag einbauen lassen.", "Welche Sportgeräte man für zu Hause kaufen sollte.", "Warum Fitnessstudios eigentlich völlig überflüssig sind."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören einen Beitrag mit Reisenachrichten im Radio.$X7$, $X7$Und nun zu den aktuellen Reisenachrichten. Wer in den kommenden Tagen mit der Bahn unterwegs ist, muss sich auf Einschränkungen einstellen. Wegen umfangreicher Bauarbeiten auf der Strecke zwischen Frankfurt und Köln fallen bis einschließlich Sonntag mehrere Fernverkehrszüge aus. Die Bahn setzt zwar Ersatzbusse ein, rät den Reisenden aber dringend, nach Möglichkeit auf andere Verbindungen auszuweichen und zusätzliche Fahrzeit einzuplanen. Betroffen ist vor allem der Wochenendverkehr, wenn viele Menschen in den Kurzurlaub starten. Fahrgäste, deren Zug ausfällt, können ihre Fahrkarte kostenlos umtauschen oder sich den Preis erstatten lassen. Aktuelle Informationen zu einzelnen Verbindungen erhalten Sie jederzeit in der App des Unternehmens oder an den Serviceschaltern in den Bahnhöfen. Planen Sie Ihre Reise also am besten rechtzeitig.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum fallen mehrere Fernverkehrszüge aus?$X7$, $X7$$X7$, $X7${"options": ["Wegen eines angekündigten Streiks des Zugpersonals.", "Wegen umfangreicher Bauarbeiten auf der betroffenen Strecke.", "Wegen eines schweren Unwetters in der Region."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was rät die Bahn den Reisenden ausdrücklich?$X7$, $X7$$X7$, $X7${"options": ["Ausschließlich die eingesetzten Ersatzbusse zu benutzen.", "Auf andere Verbindungen auszuweichen und mehr Zeit einzuplanen.", "Die geplante Reise am besten ganz zu verschieben."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was können Fahrgäste tun, deren Zug ausfällt?$X7$, $X7$$X7$, $X7${"options": ["Ihre Fahrkarte kostenlos umtauschen oder sich den Preis erstatten lassen.", "Eine Entschädigung in doppelter Höhe des Fahrpreises verlangen.", "Kostenlos eine Übernachtung im Hotel buchen lassen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören die Ansage auf dem Anrufbeantworter einer Arztpraxis.$X7$, $X7$Herzlich willkommen bei der Hausarztpraxis Dr. Berger. Unsere Praxis bleibt wegen des Jahresurlaubs vom zwanzigsten bis einschließlich einunddreißigsten Oktober geschlossen. In dringenden Fällen wenden Sie sich bitte an die Vertretungspraxis Dr. Sommer in der Bahnhofstraße zwölf; die genauen Sprechzeiten entnehmen Sie dem Aushang an unserer Praxistür. Benötigen Sie lediglich ein Folgerezept für ein regelmäßig eingenommenes Medikament, so sprechen Sie uns bitte Ihren Namen und das Präparat nach dem Signalton deutlich auf das Band. Wir bereiten das Rezept dann vor, sodass Sie es gleich nach unserer Rückkehr abholen können. Bei einem echten medizinischen Notfall wählen Sie bitte den ärztlichen Bereitschaftsdienst unter der Nummer hundertsechzehn hundertsiebzehn oder im Ernstfall den Notruf einhundertzwölf. Vielen Dank für Ihr Verständnis.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Warum ist die Praxis in dem genannten Zeitraum geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Wegen eines Umzugs der Praxis in neue Räume.", "Wegen des Jahresurlaubs des Praxisteams.", "Wegen umfangreicher Renovierungsarbeiten."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man tun, um ein Folgerezept zu erhalten?$X7$, $X7$$X7$, $X7${"options": ["Persönlich in der Vertretungspraxis Dr. Sommer vorbeikommen.", "Name und Präparat nach dem Signalton auf das Band sprechen.", "Eine E-Mail mit dem Namen des Medikaments schicken."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was soll man bei einem echten medizinischen Notfall tun?$X7$, $X7$$X7$, $X7${"options": ["Auf die Rückkehr von Dr. Berger aus dem Urlaub warten.", "Den Bereitschaftsdienst oder im Ernstfall den Notruf anrufen.", "Sofort zur Bahnhofstraße zwölf gehen und dort klingeln."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Aufgaben. Achten Sie auf einen klaren Aufbau, einen passenden Wortschatz, die Verknüpfung Ihrer Gedanken und die sprachliche Korrektheit. Halten Sie die angegebene Wortzahl ein.$X7$, 75, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$In einem Online-Forum wird unter dem Titel „Ständig erreichbar – auch im Urlaub?“ diskutiert. Viele Menschen beantworten selbst in den Ferien noch berufliche E-Mails und Nachrichten. Schreiben Sie einen Forenbeitrag, in dem Sie Ihre Meinung darstellen und begründen. Gehen Sie dabei auf folgende Punkte ein: Warum fällt es vielen Menschen schwer, im Urlaub wirklich abzuschalten? Welche Folgen kann ständige Erreichbarkeit für die Gesundheit haben? Welche Regeln halten Sie persönlich für sinnvoll? Veranschaulichen Sie Ihre Ansicht mit Beispielen.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 150, 180, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie haben über das Reisebüro „Alpentouren“ eine einwöchige Wanderreise gebucht. Vor Ort stellte sich heraus, dass das zugesagte Hotel durch eine deutlich einfachere Unterkunft ersetzt wurde und außerdem zwei der angekündigten geführten Wanderungen ausfielen. Schreiben Sie eine formelle Beschwerde-E-Mail an das Reisebüro. Nennen Sie den Grund Ihres Schreibens, beschreiben Sie die Mängel konkret und fordern Sie eine angemessene Reaktion (zum Beispiel eine Teilrückerstattung). Achten Sie auf eine passende Anrede, einen höflichen, formellen Ton und eine angemessene Grußformel.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 90, 120, 2);
end $do$;

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_sample, sort_order)
  values ($X7$B2$X7$, 3, $X7$B2-Modellprüfung 3: Ausbildung/Bildung, Technik und Umwelt$X7$, $X7$Modellprüfung B2 (Mix Goethe / telc) – Lesen, Hören, Schreiben$X7$, false, 3)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_sample=excluded.is_sample, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die vier Texte und lösen Sie die Aufgaben dazu. Bei jeder Frage ist nur eine Antwort richtig. Markieren Sie die passende Option.$X7$, 60, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Weniger Nachwuchs für das Handwerk

Trotz vieler offener Stellen entscheiden sich in Deutschland immer weniger junge Menschen für eine duale Ausbildung. Während Handwerksbetriebe und Industrieunternehmen händeringend nach Nachwuchs suchen, drängt ein wachsender Anteil der Schulabgänger an die Hochschulen. Fachleute sehen die Ursache weniger im Gehalt als im Ansehen: Eine akademische Laufbahn gilt in weiten Teilen der Gesellschaft noch immer als der sicherere Weg nach oben. Dabei zeigen aktuelle Zahlen, dass gut ausgebildete Fachkräfte im Handwerk oft schneller eine unbefristete Stelle finden und früher finanziell unabhängig sind als manche Hochschulabsolventen. Einige Kammern reagieren inzwischen mit Imagekampagnen und bieten zusätzliche Aufstiegsfortbildungen an, etwa zum Meister oder Techniker. Ob das genügt, um den Trend umzukehren, bleibt offen. Klar ist nur: Ohne eine spürbare Aufwertung der beruflichen Bildung wird sich der Fachkräftemangel weiter verschärfen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Worin sehen Fachleute laut Text den Hauptgrund für den Rückgang der Ausbildungszahlen?$X7$, $X7$$X7$, $X7${"options": ["im zu niedrigen Gehalt während der Ausbildung", "im geringen gesellschaftlichen Ansehen der Ausbildung", "in den schlechten Arbeitszeiten im Handwerk"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was zeigen aktuelle Zahlen über Fachkräfte im Handwerk?$X7$, $X7$$X7$, $X7${"options": ["Sie finden oft schneller eine feste Stelle als manche Hochschulabsolventen.", "Sie verdienen grundsätzlich mehr als alle Akademiker.", "Sie bleiben länger finanziell von ihren Eltern abhängig."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wie bewertet der Autor die Maßnahmen der Kammern?$X7$, $X7$$X7$, $X7${"options": ["Er hält sie für völlig überflüssig.", "Er ist überzeugt, dass sie den Trend sicher umkehren.", "Er lässt offen, ob sie ausreichen werden."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Kommentar: Kein Tablet ersetzt ein gutes Konzept

Kaum ein Thema spaltet Lehrerzimmer so sehr wie die Digitalisierung des Unterrichts. Die einen feiern Tablets und Lernplattformen als Schlüssel zu einer gerechteren Bildung, die anderen warnen vor einer Technikgläubigkeit, die den Blick auf das Wesentliche verstellt. Ich halte beide Lager für zu bequem. Natürlich kann ein digitales Werkzeug Unterricht bereichern – aber nur dann, wenn Lehrkräfte wissen, wofür sie es einsetzen. Ein teures Gerät ersetzt weder ein gutes Konzept noch eine Beziehung zwischen Lehrenden und Lernenden. Wer glaubt, dass sich Bildungsprobleme einfach wegkaufen lassen, verwechselt Mittel und Zweck. Statt immer neue Geräte anzuschaffen, sollten Schulen zuerst in die Fortbildung ihrer Lehrkräfte investieren. Denn die beste Software nützt wenig, wenn niemand sie sinnvoll zu nutzen versteht.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Welche Haltung vertritt der Autor gegenüber den beiden Lagern?$X7$, $X7$$X7$, $X7${"options": ["Er stimmt den Befürwortern der Technik voll zu.", "Er findet beide Positionen zu einfach.", "Er unterstützt allein die Kritiker der Technik."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was ist nach Meinung des Autors entscheidend für guten digitalen Unterricht?$X7$, $X7$$X7$, $X7${"options": ["möglichst moderne und teure Geräte", "eine große Auswahl an Lernplattformen", "dass Lehrkräfte wissen, wofür sie die Technik einsetzen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was fordert der Autor konkret?$X7$, $X7$$X7$, $X7${"options": ["zuerst in die Fortbildung der Lehrkräfte zu investieren", "ganz auf digitale Geräte zu verzichten", "jeder Schule deutlich mehr Tablets zu kaufen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Ratgeber: So sparen Sie im Haushalt wirklich Energie

Wer im Haushalt Energie sparen will, denkt zuerst an die großen Geräte – dabei steckt das meiste Potenzial oft im Verborgenen. Fachleute der Verbraucherzentrale weisen darauf hin, dass zahlreiche Geräte selbst im ausgeschalteten Zustand Strom verbrauchen. Dieser sogenannte Standby-Verbrauch kann sich über das Jahr auf mehrere Hundert Kilowattstunden summieren. Ein einfacher Trick hilft: Steckdosenleisten mit Schalter trennen mehrere Geräte auf einmal vollständig vom Netz. Auch beim Heizen lässt sich mit wenig Aufwand viel erreichen. Schon ein Grad weniger Raumtemperatur senkt den Verbrauch spürbar, ohne dass der Komfort wirklich leidet. Wichtig sei außerdem, regelmäßig und kurz zu lüften, statt die Fenster stundenlang gekippt zu lassen. Wer diese Hinweise beherzigt, schont nicht nur die Umwelt, sondern entlastet zugleich den eigenen Geldbeutel.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wo steckt laut Text oft das größte Sparpotenzial?$X7$, $X7$$X7$, $X7${"options": ["in den sichtbar großen Geräten", "im verborgenen Standby-Verbrauch", "in der Beleuchtung der Wohnung"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was empfiehlt der Text zum Heizen?$X7$, $X7$$X7$, $X7${"options": ["die Fenster dauerhaft gekippt zu lassen", "die Raumtemperatur um ein Grad zu senken", "die Heizung nachts vollständig auszuschalten"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was bewirkt das Befolgen der Hinweise laut Text?$X7$, $X7$$X7$, $X7${"options": ["Es schont die Umwelt und spart zugleich Geld.", "Es verbessert ausschließlich den Wohnkomfort.", "Es lohnt sich erst nach vielen Jahren."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 12),
    (sid, 4, $X7$passage$X7$, $X7$$X7$, $X7$Information zur berufsbegleitenden Weiterbildung „Nachhaltige Gebäudetechnik"

Die Technische Akademie bietet ab dem kommenden Frühjahr einen neuen Weiterbildungskurs an, der sich an Fachkräfte aus Handwerk und Industrie richtet. Der Kurs vermittelt praxisnahes Wissen über energieeffiziente Heiz- und Lüftungssysteme sowie den Einsatz erneuerbarer Energien im Gebäudebereich. Die Teilnahme setzt eine abgeschlossene Berufsausbildung sowie mindestens zwei Jahre Berufserfahrung voraus. Der Unterricht findet freitagnachmittags und samstags statt, sodass er sich gut mit einer Vollzeittätigkeit vereinbaren lässt. Die Kursgebühr beträgt 1.200 Euro; für Mitglieder der Handwerkskammer gewähren wir eine Ermäßigung von zehn Prozent. Eine Förderung über das sogenannte Aufstiegs-BAföG ist möglich. Anmeldungen nehmen wir bis zum 15. Februar entgegen. Bitte beachten Sie, dass die Teilnehmerzahl begrenzt ist und die Plätze in der Reihenfolge des Eingangs vergeben werden.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 13),
    (sid, 4, $X7$choice$X7$, $X7$Welche Voraussetzung müssen Teilnehmende erfüllen?$X7$, $X7$$X7$, $X7${"options": ["ein abgeschlossenes Hochschulstudium", "eine abgeschlossene Ausbildung und Berufserfahrung", "die Mitgliedschaft in der Handwerkskammer"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 14),
    (sid, 4, $X7$choice$X7$, $X7$Warum lässt sich der Kurs gut mit einem Vollzeitjob vereinbaren?$X7$, $X7$$X7$, $X7${"options": ["weil er ausschließlich online stattfindet", "weil er nur in den Ferien angeboten wird", "weil der Unterricht freitagnachmittags und samstags liegt"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 15),
    (sid, 4, $X7$choice$X7$, $X7$Was gilt für die Vergabe der Plätze?$X7$, $X7$$X7$, $X7${"options": ["Die Plätze werden in der Reihenfolge des Eingangs vergeben.", "Es entscheidet die Höhe der gezahlten Gebühr.", "Mitglieder der Kammer werden immer bevorzugt."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 16);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei Texte. Jeder Text wird einmal gesprochen. Zu jedem Text lösen Sie drei Aufgaben. Bei jeder Frage ist nur eine Antwort richtig.$X7$, 40, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören die Eröffnungsrede auf einer regionalen Ausbildungsmesse.$X7$, $X7$Sehr geehrte Damen und Herren, liebe Schülerinnen und Schüler, herzlich willkommen zur diesjährigen Ausbildungsmesse unserer Region. Ich freue mich, dass so viele junge Menschen den Weg hierher gefunden haben. In den kommenden Stunden stellen sich Ihnen über siebzig Betriebe vor – vom kleinen Handwerksbetrieb bis zum großen Technologieunternehmen. Nutzen Sie die Gelegenheit, direkt mit Ausbilderinnen und Ausbildern ins Gespräch zu kommen und Fragen zu stellen, die Sie wirklich bewegen. Lassen Sie sich dabei nicht allein von bekannten Namen leiten. Gerade kleinere Betriebe bieten oft eine besonders persönliche Betreuung und übernehmen ihre Auszubildenden nach der Prüfung überdurchschnittlich häufig. Ich wünsche Ihnen interessante Gespräche und vielleicht schon heute den ersten Schritt in Ihre berufliche Zukunft.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was ist der Anlass der Rede?$X7$, $X7$$X7$, $X7${"options": ["die Eröffnung einer Ausbildungsmesse", "die Verleihung von Prüfungszeugnissen", "die Einweihung eines neuen Betriebs"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Wozu rät der Redner den Jugendlichen?$X7$, $X7$$X7$, $X7${"options": ["sich nur bei bekannten Unternehmen zu bewerben", "sich nicht allein von bekannten Namen leiten zu lassen", "heute noch einen Ausbildungsvertrag zu unterschreiben"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was sagt der Redner über kleinere Betriebe?$X7$, $X7$$X7$, $X7${"options": ["Sie zahlen stets die höchsten Gehälter.", "Sie bilden nur sehr selten aus.", "Sie übernehmen ihre Auszubildenden überdurchschnittlich häufig."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören einen Beitrag aus einer Radiosendung zum Thema Umwelt und Technik.$X7$, $X7$Und nun zu einer Meldung aus dem Bereich Umwelt und Technik. In mehreren deutschen Städten startet in diesem Monat ein Versuch mit intelligenten Ampeln, die den Verkehrsfluss mithilfe von Sensoren und Kameras steuern. Ziel ist es, unnötige Wartezeiten zu verringern und so den Ausstoß von Abgasen zu senken. Erste Messungen aus dem Ausland deuten darauf hin, dass sich der Schadstoffausstoß an stark befahrenen Kreuzungen um bis zu fünfzehn Prozent reduzieren lässt. Kritiker geben allerdings zu bedenken, dass die Kameras auch Daten über die Autofahrer sammeln könnten. Die Verantwortlichen versichern, es würden ausschließlich anonyme Verkehrsdaten erfasst und keine Kennzeichen gespeichert. Ob der Versuch dauerhaft eingeführt wird, soll erst nach einem Jahr entschieden werden.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was ist das Ziel der intelligenten Ampeln?$X7$, $X7$$X7$, $X7${"options": ["die Zahl der Autos in der Stadt zu begrenzen", "Wartezeiten zu verringern und Abgase zu senken", "Falschparker automatisch zu erfassen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was befürchten die Kritiker?$X7$, $X7$$X7$, $X7${"options": ["dass die Kameras Daten über die Autofahrer sammeln", "dass die neuen Ampeln viel zu teuer sind", "dass der Verkehr dadurch langsamer wird"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wann soll über die dauerhafte Einführung entschieden werden?$X7$, $X7$$X7$, $X7${"options": ["sofort nach dem Start des Versuchs", "bereits nach einem Monat", "erst nach einem Jahr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören eine Durchsage in der Bibliothek einer Hochschule.$X7$, $X7$Liebe Besucherinnen und Besucher, einen Hinweis in eigener Sache. Wegen umfangreicher Modernisierungsarbeiten an unserer Heizungs- und Lüftungsanlage bleibt der Lesesaal im zweiten Obergeschoss ab kommenden Montag für voraussichtlich drei Wochen geschlossen. Die dort vorhandenen Arbeitsplätze verlegen wir in den Seminarraum im Erdgeschoss, der ab acht Uhr für Sie geöffnet ist. Entliehene Bücher können Sie wie gewohnt an der Theke im Eingangsbereich zurückgeben. Bitte beachten Sie außerdem, dass während der Bauarbeiten zeitweise mit Lärm zu rechnen ist. Wir empfehlen Ihnen, für konzentriertes Arbeiten die ruhigeren Räume im dritten Stock zu nutzen. Für die entstehenden Unannehmlichkeiten bitten wir um Ihr Verständnis und danken Ihnen für Ihre Geduld.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Warum wird der Lesesaal geschlossen?$X7$, $X7$$X7$, $X7${"options": ["wegen Modernisierungsarbeiten an der Heizungs- und Lüftungsanlage", "wegen eines Wasserschadens im Gebäude", "wegen zu geringer Besucherzahlen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Wohin werden die Arbeitsplätze verlegt?$X7$, $X7$$X7$, $X7${"options": ["in einen Raum im dritten Stock", "in den Seminarraum im Erdgeschoss", "in eine andere Bibliothek der Stadt"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was empfiehlt die Durchsage für konzentriertes Arbeiten?$X7$, $X7$$X7$, $X7${"options": ["von zu Hause aus zu arbeiten", "die Theke im Eingangsbereich zu nutzen", "die ruhigeren Räume im dritten Stock zu nutzen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie beide Schreibaufgaben. Achten Sie auf einen klaren Aufbau, passende Redemittel, die geforderte Textsorte und die Wortzahl.$X7$, 60, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$In einem Online-Forum wird diskutiert: „Sollten Schulen weniger auf Noten und mehr auf praktische Fähigkeiten setzen?" Schreiben Sie einen Forenbeitrag und nehmen Sie Stellung zu dieser Frage. Nennen Sie mindestens zwei Argumente, geben Sie ein Beispiel aus Ihrer eigenen Erfahrung und schließen Sie mit Ihrer persönlichen Meinung. Achten Sie auf einen roten Faden und auf verbindende Ausdrücke.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 150, 180, 1);
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 2, 'writing', $X7$Sie haben an dem berufsbegleitenden Weiterbildungskurs „Nachhaltige Gebäudetechnik" teilgenommen. Der Kurs ist mehrmals kurzfristig ausgefallen und wichtige Unterlagen haben Sie trotz Nachfrage nicht erhalten. Schreiben Sie eine formelle E-Mail an die Kursleitung. Beschreiben Sie das Problem, erklären Sie, warum Sie unzufrieden sind, und fordern Sie eine konkrete Lösung (zum Beispiel Ersatztermine oder eine teilweise Erstattung der Gebühr). Achten Sie auf eine passende Anrede und einen höflichen, sachlichen Ton.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 90, 120, 2);
end $do$;
