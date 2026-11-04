-- ============================================================================
-- GRATIS-PRÜFUNGEN (öffentlich, ohne Login) — Schema-Migration + Inhalte.
-- Eine zusätzliche Übungsprüfung pro Level (Variante 4), die ANONYM (ohne
-- Account) auf /free-exam gemacht werden kann. Lesen + Hören werden sofort
-- ausgewertet; der Schreibteil ist der Umwandlungspunkt zum Gratis-Account.
--
-- Setzt voraus, dass exams.sql + exams-b1.sql + exams-a1-a2-b2.sql schon liefen.
-- Idempotent, erneut ausführbar.
-- ============================================================================

-- ---- 1) Neue Spalte: markiert eine Prüfung als öffentlich & gratis ----------
alter table public.exam_papers
  add column if not exists is_free_public boolean not null default false;

-- ---- 2) Anonymer (ausgeloggter) Lesezugriff NUR auf veröffentlichte,
--         als gratis markierte Prüfungen und deren Abschnitte/Items ----------
drop policy if exists "exam_papers anon free" on public.exam_papers;
create policy "exam_papers anon free" on public.exam_papers
  for select to anon using (is_published and is_free_public);

drop policy if exists "exam_sections anon free" on public.exam_sections;
create policy "exam_sections anon free" on public.exam_sections
  for select to anon using (
    exists (select 1 from public.exam_papers p
            where p.id = paper_id and p.is_published and p.is_free_public));

drop policy if exists "exam_items anon free" on public.exam_items;
create policy "exam_items anon free" on public.exam_items
  for select to anon using (
    exists (select 1 from public.exam_sections s
            join public.exam_papers p on p.id = s.paper_id
            where s.id = section_id and p.is_published and p.is_free_public));

grant select on public.exam_papers, public.exam_sections, public.exam_items to anon;

-- ============================================================================
-- 3) INHALTE — je eine Variante-4-Prüfung pro Level (is_free_public = true,
--    is_published = false → Marvin spricht die Hör-Clips ein und veröffentlicht
--    sie dann im Lehrerbereich). Wird vom Generator eingefügt.
-- ============================================================================

-- ============================================================================
-- A1 — Gratis-Übungsprüfung (Variante 4) für den Prüfungstrainer.
-- Öffentlich & gratis (is_free_public = true). is_published = false, bis Marvin
-- die Hör-Clips eingesprochen und im Lehrerbereich veröffentlicht hat.
-- Setzt die Spalte exam_papers.is_free_public voraus (Migration läuft vorher).
-- Idempotent: Upsert des Papers + Neuaufbau der Sections/Items. Erneut ausführbar.
-- ============================================================================

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_published, is_sample, is_free_public, sort_order)
  values ($X7$A1$X7$, 4, $X7$A1 Gratis-Übungsprüfung: Alltag, Einkaufen und Freizeit (Free A1 Practice Exam)$X7$, $X7$Kostenlose Modellprüfung im Goethe-/telc-Stil (Start Deutsch 1) — ganz ohne Abo testen. Free A1 sample exam: Lesen, Hören und Schreiben.$X7$, false, false, true, 4)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_published=excluded.is_published, is_sample=excluded.is_sample, is_free_public=excluded.is_free_public, sort_order=excluded.sort_order, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;

  -- ---- LESEN ----------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die zwei Texte und lösen Sie die Aufgaben. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig.$X7$, 10, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Café Sonne – neu in der Stadt!

Unser Café ist von Montag bis Samstag von 8 bis 18 Uhr geöffnet.
Am Morgen gibt es frisches Brot und Kuchen.
Ein Kaffee kostet nur 2 Euro.
Am Sonntag ist das Café geschlossen.
Wir freuen uns auf Ihren Besuch!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist das Café geöffnet?$X7$, $X7$$X7$, $X7${"options": ["Von 8 bis 18 Uhr", "Von 18 bis 20 Uhr", "Von 6 bis 14 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was kostet ein Kaffee?$X7$, $X7$$X7$, $X7${"options": ["1 Euro", "2 Euro", "3 Euro"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist das Café geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Am Samstag", "Am Sonntag", "Am Montag"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Hallo Max,

ich gehe heute Nachmittag einkaufen. Wir brauchen noch Milch, Eier und Äpfel.
Kannst du bitte das Abendessen kochen? Ich komme um 18 Uhr nach Hause.

Liebe Grüße
Julia$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was macht Julia am Nachmittag?$X7$, $X7$$X7$, $X7${"options": ["Sie kocht das Abendessen.", "Sie geht einkaufen.", "Sie geht zur Arbeit."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Max machen?$X7$, $X7$$X7$, $X7${"options": ["Das Abendessen kochen", "Einkaufen gehen", "Die Wohnung putzen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Wann kommt Julia nach Hause?$X7$, $X7$$X7$, $X7${"options": ["Um 16 Uhr", "Um 17 Uhr", "Um 18 Uhr"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8);

  -- ---- HÖREN (Einzelsprecher-Monologe, Marvin spricht allein ein) -----------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören zwei kurze Texte. Zu jedem Text gibt es Fragen. Wählen Sie bei jeder Frage die richtige Antwort (a, b oder c). Sie hören jeden Text zweimal.$X7$, 8, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Text 1: Eine Durchsage in der Bibliothek. Sie hören die Durchsage zweimal.$X7$, $X7$Liebe Besucherinnen und Besucher, die Bibliothek schließt heute schon um 16 Uhr. Morgen haben wir wieder von 9 bis 19 Uhr geöffnet. Bitte bringen Sie Ihre Bücher bis Freitag zurück. Vielen Dank und auf Wiedersehen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wann schließt die Bibliothek heute?$X7$, $X7$$X7$, $X7${"options": ["Um 16 Uhr", "Um 18 Uhr", "Um 19 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Bis wann soll man die Bücher zurückbringen?$X7$, $X7$$X7$, $X7${"options": ["Bis Montag", "Bis Freitag", "Bis Sonntag"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist die Bibliothek morgen geöffnet?$X7$, $X7$$X7$, $X7${"options": ["Von 9 bis 19 Uhr", "Von 8 bis 16 Uhr", "Von 10 bis 20 Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Text 2: Eine Nachricht auf dem Anrufbeantworter. Sie hören die Nachricht zweimal.$X7$, $X7$Hallo Frau Koch, hier ist Peter Lang vom Restaurant Adler. Sie haben für heute Abend einen Tisch um 19 Uhr reserviert. Leider ist das Restaurant heute sehr voll. Können Sie vielleicht erst um 20 Uhr kommen? Bitte rufen Sie mich kurz zurück. Vielen Dank und auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wer spricht?$X7$, $X7$$X7$, $X7${"options": ["Frau Koch", "Peter Lang vom Restaurant", "Eine Freundin"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Für wie viel Uhr war der Tisch reserviert?$X7$, $X7$$X7$, $X7${"options": ["Um 18 Uhr", "Um 19 Uhr", "Um 20 Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was soll Frau Koch tun?$X7$, $X7$$X7$, $X7${"options": ["Zurückrufen", "Eine E-Mail schreiben", "Sofort ins Restaurant kommen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 8);

  -- ---- SCHREIBEN ------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie die Aufgabe. Schreiben Sie in einfachen, ganzen Sätzen und gehen Sie auf alle drei Punkte ein. Vergessen Sie Anrede und Gruß nicht.$X7$, 10, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Kurze Nachricht

Sie möchten am Samstag mit Ihrer Freundin Nina ins Café gehen. Schreiben Sie Nina eine kurze Nachricht (SMS). Gehen Sie auf alle drei Punkte ein:
- Wohin möchten Sie gehen?
- Wann treffen Sie sich?
- Was möchten Sie dort zusammen machen?

Schreiben Sie 20 bis 30 Wörter.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 20, 30, 1);
end $do$;


-- A2-Gratis-Probeprüfung (Variante 4) — kostenloser, öffentlicher Probetest für den Prüfungstrainer.
-- Benötigt exams.sql (Schema) + Migration mit Spalte is_free_public (exams-free-public.sql).
-- Idempotent: upsert des Papers (behält id + Attempts) + Sektionen/Items werden neu eingefügt.
-- Hören = NUR Einzelsprecher-Monologe (Marvin spricht allein ein). audio_url bleibt NULL (später aufnehmen).
do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_published, is_sample, is_free_public, sort_order)
  values ($X7$A2$X7$, 4, $X7$A2-Gratis-Probeprüfung: Alltag, Freizeit und Kontakte (Free A2 Practice Test)$X7$, $X7$Kostenlose Übungsprüfung im Goethe-/telc-A2-Format · Lesen, Hören und Schreiben · ohne Abo testen — free A2 sample exam, no subscription needed.$X7$, false, false, true, 4)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_published=excluded.is_published, is_sample=excluded.is_sample, is_free_public=excluded.is_free_public, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und lösen Sie die Aufgaben. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig. Markieren Sie die richtige Lösung.$X7$, 15, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail

Hallo Jonas,

ich hoffe, dir geht es gut! Am Samstag habe ich endlich frei und möchte gern etwas mit dir unternehmen. Hast du Lust, ins Schwimmbad zu gehen? Das Wetter soll schön und warm werden.

Wir können uns um zehn Uhr am Eingang treffen. Bring bitte etwas zu essen mit, dann machen wir mittags ein kleines Picknick. Die Getränke bringe ich mit.

Ruf mich bitte heute Abend an und sag mir, ob du Zeit hast.

Viele Grüße
Lukas$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was möchte Lukas am Samstag machen?$X7$, $X7$$X7$, $X7${"options": ["ins Schwimmbad gehen", "einen Ausflug mit dem Auto machen", "den ganzen Tag zu Hause bleiben"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was soll Jonas mitbringen?$X7$, $X7$$X7$, $X7${"options": ["die Getränke", "etwas zu essen", "einen Ball"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was soll Jonas heute Abend tun?$X7$, $X7$$X7$, $X7${"options": ["eine E-Mail schreiben", "Lukas anrufen", "zum Schwimmbad fahren"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Aushang im Supermarkt

Flohmarkt im Stadtpark!

Am Sonntag, dem 15. Mai, findet von 9 bis 16 Uhr ein großer Flohmarkt im Stadtpark statt. Verkaufen Sie alte Kleidung, Bücher oder Spielzeug. Ein Tisch kostet 10 Euro. Bitte melden Sie sich bis Freitag per E-Mail an: flohmarkt@stadtpark.de. Für Essen und Getränke ist gesorgt. Bei Regen fällt der Flohmarkt leider aus.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wann ist der Flohmarkt?$X7$, $X7$$X7$, $X7${"options": ["am Freitag", "am Samstag", "am Sonntag"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was ist richtig?$X7$, $X7$$X7$, $X7${"options": ["Der Flohmarkt ist auch bei Regen.", "Ein Tisch ist kostenlos.", "Man muss sich bis Freitag anmelden."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Nachricht an die Nachbarin

Liebe Frau Klein,

ich bin ab morgen eine Woche im Urlaub. Können Sie bitte meine Blumen gießen und den Briefkasten leeren? Der Wohnungsschlüssel liegt wie immer bei Frau Berg im Erdgeschoss. Vielen Dank für Ihre Hilfe!

Herzliche Grüße
Familie Osman$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Warum schreibt Familie Osman?$X7$, $X7$$X7$, $X7${"options": ["Sie sucht einen neuen Schlüssel.", "Sie bittet um Hilfe während des Urlaubs.", "Sie lädt die Nachbarin zum Essen ein."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Wo liegt der Schlüssel?$X7$, $X7$$X7$, $X7${"options": ["bei Frau Berg", "im Briefkasten", "unter einer Blume"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte. Zu jedem Text gibt es Aufgaben. Zu jeder Frage gibt es drei Antworten (a, b oder c). Nur eine Antwort ist richtig. Sie hören jeden Text zweimal.$X7$, 12, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Text 1: Sie sind in der Stadtbibliothek und hören eine Durchsage.$X7$, $X7$Liebe Besucherinnen und Besucher, bitte beachten Sie: Wir schließen heute schon um 18 Uhr, weil unsere Mitarbeiter eine Fortbildung haben. Geben Sie Ihre Bücher bitte bis dahin an der Information ab. Morgen sind wir wieder ganz normal von 9 bis 20 Uhr für Sie da. Vielen Dank für Ihr Verständnis und einen schönen Abend!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Warum schließt die Bibliothek heute früher?$X7$, $X7$$X7$, $X7${"options": ["Die Mitarbeiter haben eine Fortbildung.", "Es ist ein Feiertag.", "Die Heizung ist kaputt."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Bis wann hat die Bibliothek morgen geöffnet?$X7$, $X7$$X7$, $X7${"options": ["bis 18 Uhr", "bis 20 Uhr", "bis 21 Uhr"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 2, $X7$audio$X7$, $X7$Text 2: Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Hallo Sarah, hier ist Markus. Ich wollte dir schnell Bescheid sagen: Unser Treffen heute Abend im Café müssen wir leider verschieben. Ich muss länger arbeiten und bin erst um acht Uhr fertig. Hast du vielleicht morgen Nachmittag Zeit? Dann könnten wir zusammen einen Kaffee trinken. Ruf mich bitte kurz zurück. Bis bald!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 4),
    (sid, 2, $X7$choice$X7$, $X7$Was möchte Markus sagen?$X7$, $X7$$X7$, $X7${"options": ["Er kommt zu spät zur Arbeit.", "Das Treffen muss verschoben werden.", "Er sucht ein neues Café."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wann hat Markus Zeit?$X7$, $X7$$X7$, $X7${"options": ["heute Abend", "morgen Vormittag", "morgen Nachmittag"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 6),
    (sid, 3, $X7$audio$X7$, $X7$Text 3: Sie hören den Wetterbericht im Radio.$X7$, $X7$Und jetzt das Wetter für das Wochenende. Am Samstag ist es noch kalt und windig, nehmen Sie also eine warme Jacke mit. Am Sonntag wird es dann freundlicher: Die Sonne scheint und die Temperaturen steigen auf angenehme neunzehn Grad. Das ist ein perfekter Tag für einen Spaziergang. Ich wünsche Ihnen ein schönes Wochenende!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 7),
    (sid, 3, $X7$choice$X7$, $X7$Wie ist das Wetter am Samstag?$X7$, $X7$$X7$, $X7${"options": ["warm und sonnig", "kalt und windig", "es schneit"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$choice$X7$, $X7$Wie warm wird es am Sonntag?$X7$, $X7$$X7$, $X7${"options": ["neunzehn Grad", "neun Grad", "neunundzwanzig Grad"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9);
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Lesen Sie die Aufgabe und schreiben Sie einen kurzen Text. Gehen Sie auf alle drei Punkte ein und denken Sie an Anrede und Gruß. Sie können 10 Punkte erreichen.$X7$, 10, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Ihre Freundin Nina hat Sie gefragt, ob Sie am Wochenende zusammen etwas unternehmen möchten. Schreiben Sie Nina eine kurze E-Mail. Schreiben Sie zu allen drei Punkten:
- Sagen Sie, ob Sie am Wochenende Zeit haben.
- Machen Sie einen Vorschlag, was Sie zusammen machen können.
- Fragen Sie, wann und wo Sie sich treffen.

Schreiben Sie 30–40 Wörter. Denken Sie an Anrede und Gruß.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 30, 50, 1);
end $do$;


-- B1-GRATIS-Übungsprüfung (Variante 4) — Seed für den Prüfungstrainer.
-- Benötigt exams.sql (Schema) + Migration mit Spalte is_free_public (exams-free-public.sql).
-- Idempotent: löscht zuerst das vorhandene (B1, Variante 4)-Paper (cascade)
-- und legt es danach komplett neu an. Mehrfach ausführbar ohne Duplikate.
-- Danach im Lehrerbereich → Exams die Hör-Audios aufnehmen und veröffentlichen.

do $do$
declare pid uuid; sid uuid;
begin
  delete from public.exam_papers where level = $X7$B1$X7$ and variant = 4;
  insert into public.exam_papers (level, variant, title, subtitle, is_published, is_sample, is_free_public, sort_order)
  values ($X7$B1$X7$, 4, $X7$B1 Gratis-Übungsprüfung: Stadt, Konsum und Miteinander (Free Practice Exam)$X7$, $X7$Kostenlose B1-Modellprüfung zum Ausprobieren — Lesen, Hören und Schreiben im Goethe-/telc-Stil, ohne Abo. A free B1 practice exam you can try without a subscription.$X7$, false, false, true, 4)
  returning id into pid;

  -- ---- LESEN ----------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antwortmöglichkeiten (a, b oder c), aber nur eine Antwort ist richtig. Kreuzen Sie die richtige Antwort an.$X7$, 20, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Aushang im Stadtteilzentrum

Liebe Nachbarinnen und Nachbarn,
jeden ersten Samstag im Monat öffnet in unserem Stadtteilzentrum das Repair-Café. Von zehn bis sechzehn Uhr helfen Ihnen erfahrene Freiwillige, kaputte Dinge zu reparieren – zum Beispiel Lampen, Fahrräder oder Kleidung. So müssen Sie nicht gleich etwas Neues kaufen, und es entsteht weniger Müll. Das Reparieren ist kostenlos, über eine kleine Spende für Kaffee und Kuchen freuen wir uns aber sehr. Bringen Sie bitte, wenn möglich, passende Ersatzteile selbst mit. Wer selbst gut reparieren kann und Lust hat zu helfen, meldet sich bitte beim Team an der Information.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Wann ist das Repair-Café geöffnet?$X7$, $X7$$X7$, $X7${"options": ["Jeden ersten Samstag im Monat", "Jeden Tag von zehn bis sechzehn Uhr", "Nur im Sommer"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was kostet das Reparieren?$X7$, $X7$$X7$, $X7${"options": ["Es ist kostenlos", "Es kostet eine feste Gebühr", "Man zahlt pro Stunde"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was sollen die Besucher möglichst selbst mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Passende Ersatzteile", "Einen Ausweis", "Kaffee und Kuchen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$E-Mail

Hallo Nina,

danke für deine Nachricht! Ich finde die Idee super, das Sofa gebraucht zu kaufen, statt ein neues zu bestellen. Ich habe im Internet eine Anzeige gefunden: ein graues Sofa für achtzig Euro, nur zwei Jahre alt. Die Verkäuferin wohnt aber am anderen Ende der Stadt, und ich habe kein Auto. Könntest du uns vielleicht mit dem Transporter deines Bruders helfen? Am Samstagnachmittag hätte ich Zeit. Sag mir bitte bis Donnerstag Bescheid, damit ich der Verkäuferin schreiben kann.

Liebe Grüße
Jonas$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Was möchte Jonas kaufen?$X7$, $X7$$X7$, $X7${"options": ["Ein neues Sofa aus dem Geschäft", "Ein gebrauchtes Sofa", "Einen Transporter"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Worum bittet Jonas seine Freundin Nina?$X7$, $X7$$X7$, $X7${"options": ["Um Geld für das Sofa", "Um Hilfe beim Transport", "Um eine neue Wohnung"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Kurzer Artikel: Einkaufen im Viertel

In vielen Städten kaufen die Menschen immer öfter im Internet ein, weil es bequem ist und die Ware nach Hause geliefert wird. Trotzdem entscheiden sich manche bewusst dafür, in kleinen Geschäften im eigenen Viertel einzukaufen. Sie schätzen die persönliche Beratung und möchten die Läden in ihrer Nähe erhalten. Fachleute weisen darauf hin, dass dadurch auch Arbeitsplätze in der Stadt gesichert werden. Wer zusätzlich auf dem Wochenmarkt einkauft, bekommt oft frischere Produkte aus der Region. Ein Nachteil ist allerdings, dass die Preise dort manchmal etwas höher sind als im großen Supermarkt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Warum kaufen viele Menschen im Internet ein?$X7$, $X7$$X7$, $X7${"options": ["Weil es bequem ist und die Ware geliefert wird", "Weil es dort keine Beratung gibt", "Weil die Läden geschlossen sind"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was schätzen Menschen, die im Viertel einkaufen?$X7$, $X7$$X7$, $X7${"options": ["Die persönliche Beratung", "Die besonders niedrigen Preise", "Die lange Lieferzeit"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Welchen Nachteil nennt der Text beim Einkauf auf dem Wochenmarkt?$X7$, $X7$$X7$, $X7${"options": ["Die Produkte sind oft alt", "Die Preise sind manchmal höher", "Es gibt dort keine Beratung"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11);

  -- ---- HÖREN (nur Einzelsprecher-Monologe) ----------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei kurze Texte, die jeweils von einer Person gesprochen werden. Lesen Sie zuerst die Fragen zu jedem Text. Hören Sie dann zu und kreuzen Sie bei jeder Aufgabe die richtige Antwort (a, b oder c) an. Es ist immer nur eine Antwort richtig. Jeder Text wird zweimal vorgelesen.$X7$, 15, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einer Stadtbibliothek.$X7$, $X7$Liebe Besucherinnen und Besucher der Stadtbibliothek, wir möchten Sie auf einige Neuigkeiten hinweisen. Ab nächster Woche können Sie bei uns nicht nur Bücher, sondern auch Gesellschaftsspiele und Werkzeuge ausleihen – ganz kostenlos mit Ihrem Bibliotheksausweis. Außerdem verlängern wir unsere Öffnungszeiten: Donnerstags haben wir jetzt bis zwanzig Uhr für Sie geöffnet. Bitte denken Sie daran, ausgeliehene Medien rechtzeitig zurückzubringen, sonst müssen wir leider eine kleine Gebühr verlangen. Unser Lesecafé im ersten Stock bleibt wegen Renovierung noch bis Ende des Monats geschlossen. Vielen Dank für Ihr Verständnis und viel Freude beim Stöbern.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was kann man ab nächster Woche zusätzlich ausleihen?$X7$, $X7$$X7$, $X7${"options": ["Gesellschaftsspiele und Werkzeuge", "Filme und Musik", "Möbel und Geschirr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was ändert sich bei den Öffnungszeiten?$X7$, $X7$$X7$, $X7${"options": ["Die Bibliothek öffnet morgens früher", "Donnerstags ist bis zwanzig Uhr geöffnet", "Am Wochenende ist jetzt geschlossen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Warum ist das Lesecafé geschlossen?$X7$, $X7$$X7$, $X7${"options": ["Wegen Renovierung", "Wegen eines Feiertags", "Wegen zu weniger Gäste"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter.$X7$, $X7$Hi, hier ist Laura. Ich wollte dir kurz wegen Samstag Bescheid geben. Wir treffen uns ja auf dem Flohmarkt im Stadtpark, und ich habe gerade gesehen, dass er schon um neun Uhr beginnt, nicht erst um zehn. Komm am besten etwas früher, dann bekommen wir die guten Sachen. Ich suche vor allem ein kleines Regal und ein paar Bilderrahmen. Ach ja, bring bitte genug Bargeld mit, viele Stände nehmen keine Karte. Falls es regnet, verschieben wir das Ganze auf Sonntag. Ruf mich einfach an, wenn du noch Fragen hast. Bis Samstag!$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Wann beginnt der Flohmarkt?$X7$, $X7$$X7$, $X7${"options": ["Um neun Uhr", "Um zehn Uhr", "Um acht Uhr"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was soll die angerufene Person unbedingt mitbringen?$X7$, $X7$$X7$, $X7${"options": ["Genug Bargeld", "Eine Kreditkarte", "Ein Regal"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören einen kurzen Hinweis im Radio.$X7$, $X7$Und zum Schluss noch ein Tipp für alle in unserer Stadt: Am kommenden Wochenende findet auf dem Marktplatz wieder die Aktion „Tausch statt Kauf“ statt. Dort können Sie Kleidung, Bücher und Spielsachen mitbringen, die Sie nicht mehr brauchen, und gegen andere Dinge tauschen – ganz ohne Geld. Die Aktion läuft am Samstag von elf bis siebzehn Uhr. Wer möchte, kann auch einfach vorbeikommen und sich beraten lassen, wie man Dinge länger benutzt, statt sie wegzuwerfen. Der Eintritt ist frei. Bei schlechtem Wetter findet die Aktion in der benachbarten Turnhalle statt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 8),
    (sid, 3, $X7$choice$X7$, $X7$Was kann man bei der Aktion „Tausch statt Kauf“ machen?$X7$, $X7$$X7$, $X7${"options": ["Dinge gegen andere Dinge tauschen", "Gebrauchte Sachen verkaufen", "Neue Kleidung günstig kaufen"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was passiert bei schlechtem Wetter?$X7$, $X7$$X7$, $X7${"options": ["Die Aktion findet in der Turnhalle statt", "Die Aktion fällt aus", "Die Aktion wird auf Sonntag verschoben"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10);

  -- ---- SCHREIBEN ------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie die Aufgabe. Achten Sie auf eine passende Anrede, einen klaren Aufbau und einen höflichen Schluss. Schreiben Sie in ganzen Sätzen und gehen Sie auf alle Leitpunkte ein.$X7$, 15, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$In einem Online-Forum diskutieren die Teilnehmer über die Frage: „Neu kaufen oder lieber tauschen, leihen und reparieren?“ Schreiben Sie einen Beitrag für das Forum.

Gehen Sie dabei auf folgende Punkte ein:
- Beschreiben Sie, wie Sie normalerweise einkaufen.
- Erklären Sie, was Sie von Tauschen, Leihen oder Reparieren halten.
- Geben Sie den anderen einen Tipp, wie man Geld sparen und gleichzeitig die Umwelt schonen kann.

Schreiben Sie ca. 80 Wörter. Vergessen Sie Anrede und Gruß nicht.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 70, 110, 1);
end $do$;


-- ============================================================================
-- B2 Gratis-Übungsprüfung (Variante 4, öffentlich) — Seed für den Prüfungstrainer.
-- Benötigt exams.sql + exams-free-public.sql (fügt is_free_public hinzu). Idempotent.
-- is_free_public = true, is_published = false (Marvin spricht die Hör-Clips ein
-- und veröffentlicht die Prüfung danach im Lehrerbereich).
-- ============================================================================

do $do$
declare pid uuid; sid uuid;
begin
  insert into public.exam_papers (level, variant, title, subtitle, is_published, is_sample, is_free_public, sort_order)
  values ($X7$B2$X7$, 4, $X7$B2 Gratis-Übungsprüfung: Medien, Gesundheit und Gesellschaft (Free B2 Practice Exam)$X7$, $X7$Kostenlose Modellprüfung im Goethe-/telc-Format · Lesen, Hören und Schreiben auf B2-Niveau · Free B2 sample exam — try it without a subscription$X7$, false, false, true, 4)
  on conflict (level, variant) do update set title=excluded.title, subtitle=excluded.subtitle, is_published=excluded.is_published, is_sample=excluded.is_sample, is_free_public=excluded.is_free_public, updated_at=now()
  returning id into pid;
  delete from public.exam_sections where paper_id = pid;

  -- ---- LESEN ----------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'reading', 'Lesen', $X7$Lesen Sie die drei Texte und lösen Sie die Aufgaben dazu. Zu jeder Frage gibt es drei Antwortmöglichkeiten (a, b oder c), aber nur eine Antwort ist richtig. Kreuzen Sie die richtige Lösung an.$X7$, 24, 1) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$passage$X7$, $X7$$X7$, $X7$Einfach mal abschalten

Das Smartphone ist für die meisten Menschen längst zum ständigen Begleiter geworden: Es weckt uns am Morgen, führt uns durch den Tag und ist abends das Letzte, worauf wir blicken. Kein Wunder also, dass immer mehr Menschen das Gefühl haben, die Kontrolle über ihre eigene Bildschirmzeit zu verlieren. Als Gegenbewegung hat sich in den vergangenen Jahren das sogenannte „Handyfasten“ etabliert – der Versuch, das Gerät für eine bestimmte Zeit ganz bewusst beiseitezulegen.

Besonders beliebt sind inzwischen Angebote, bei denen die Teilnehmenden ein Wochenende ohne jegliche digitale Geräte auf dem Land verbringen. Die Veranstalter berichten von langen Wartelisten und von Gästen, die anfangs nervös würden, sobald das Handy abgegeben sei. Nach zwei, drei Tagen jedoch stelle sich bei den meisten eine spürbare Ruhe ein; viele schliefen besser und könnten sich wieder länger auf eine einzige Sache konzentrieren.

Fachleute sehen den Trend mit vorsichtiger Zustimmung. Ein kurzer Verzicht könne durchaus helfen, alte Gewohnheiten zu hinterfragen, sagt die Medienpsychologin Carola Reinhardt. Entscheidend sei aber, was danach geschehe: Wer nach dem Wochenende sofort in die alten Muster zurückfalle, habe wenig gewonnen. Sinnvoller sei es, dauerhaft feste handyfreie Zeiten in den Alltag einzubauen – etwa beim Essen oder in der letzten Stunde vor dem Schlafengehen.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Was versteht man im Text unter „Handyfasten“?$X7$, $X7$$X7$, $X7${"options": ["eine App, die die tägliche Bildschirmzeit automatisch begrenzt", "den Versuch, das Smartphone für eine gewisse Zeit bewusst nicht zu benutzen", "eine Diät, bei der man während der Handynutzung nichts isst"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was berichten die Veranstalter der Wochenenden auf dem Land?$X7$, $X7$$X7$, $X7${"options": ["Die meisten Gäste brechen das Programm schon nach wenigen Stunden ab.", "Die Angebote finden wegen geringer Nachfrage immer seltener statt.", "Viele Teilnehmende sind zunächst unruhig, werden mit der Zeit aber ruhiger."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Was hält die Medienpsychologin für entscheidend?$X7$, $X7$$X7$, $X7${"options": ["dass man auch im Alltag dauerhaft feste handyfreie Zeiten einführt", "dass man das Smartphone nach Möglichkeit ganz abschafft", "dass ein solches Wochenende mehrmals im Jahr wiederholt wird"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$passage$X7$, $X7$$X7$, $X7$Kommentar: Reparieren muss selbstverständlich werden

Mein Toaster hat neulich den Dienst verweigert. Früher hätte ich ihn achselzuckend entsorgt und einen neuen gekauft – schließlich kostet ein einfaches Gerät kaum mehr als die vermeintlich teure Reparatur. Diesmal jedoch bin ich in ein sogenanntes Repair-Café gegangen, wo ehrenamtliche Helferinnen und Helfer gemeinsam mit den Besuchern defekte Dinge instand setzen. Nach einer halben Stunde funktionierte der Toaster wieder, und ich ging mit einem guten Gefühl nach Hause.

Solche Treffpunkte entstehen derzeit überall, und das ist gut so. Denn unsere Wegwerfgewohnheit ist nicht nur teuer, sondern vor allem eine enorme Belastung für die Umwelt. Jedes Gerät, das wir weiternutzen, spart Rohstoffe und Energie, die sonst für die Herstellung eines neuen nötig wären.

Trotzdem bleibe ich skeptisch, ob der gute Wille Einzelner genügt. Viele Produkte sind heute bewusst so gebaut, dass sie sich kaum öffnen lassen; Ersatzteile sind teuer oder gar nicht erhältlich. Hier ist die Politik gefragt. Erst wenn die Hersteller verpflichtet werden, langlebige und reparierbare Geräte anzubieten, wird sich wirklich etwas ändern. Die engagierten Menschen in den Repair-Cafés leisten Großartiges – doch sie dürfen nicht allein die Verantwortung tragen, die eigentlich den Unternehmen zukommt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum ging der Autor diesmal nicht den gewohnten Weg?$X7$, $X7$$X7$, $X7${"options": ["Er kaufte sofort ein neues, teureres Gerät.", "Er schickte den Toaster zur Reparatur an den Hersteller.", "Er brachte seinen defekten Toaster in ein Repair-Café, statt ihn wegzuwerfen."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Wie beurteilt der Autor die Verbreitung der Repair-Cafés?$X7$, $X7$$X7$, $X7${"options": ["Er begrüßt sie, weil das Weiternutzen Rohstoffe und Energie spart.", "Er hält sie für überflüssig, weil neue Geräte billig sind.", "Er befürchtet, dass dadurch viele Fachbetriebe schließen müssen."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was fordert der Autor am Ende seines Kommentars?$X7$, $X7$$X7$, $X7${"options": ["dass jeder Haushalt sein eigenes Repair-Café gründet", "dass die Politik die Hersteller zu langlebigen und reparierbaren Geräten verpflichtet", "dass die Verbraucher grundsätzlich auf elektrische Geräte verzichten"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$passage$X7$, $X7$$X7$, $X7$Information der Stadtbibliothek Lindenau

Liebe Leserinnen und Leser,

ab dem kommenden Monat erweitern wir unser Angebot in gleich mehreren Bereichen. Zunächst verlängern wir unsere Öffnungszeiten: Künftig können Sie die Bibliothek auch samstags bis 16 Uhr nutzen, sodass sich ein Besuch nun besser mit dem Berufsalltag vereinbaren lässt.

Neu ist außerdem unsere wöchentliche Digitalsprechstunde. Immer mittwochs von 14 bis 16 Uhr helfen Ihnen ehrenamtliche Fachleute kostenlos dabei, Smartphone, Tablet oder E-Book-Reader einzurichten und sich im Internet sicher zu bewegen. Das Angebot richtet sich ausdrücklich an alle Altersgruppen, besonders aber an Menschen, die bisher wenig Erfahrung mit digitalen Geräten sammeln konnten. Eine Anmeldung ist nicht erforderlich; bringen Sie einfach Ihr eigenes Gerät mit.

Leider müssen wir Sie auch auf eine Einschränkung hinweisen: Wegen Umbauarbeiten bleibt unser Lesesaal im ersten Stock von Mitte April bis Ende Mai geschlossen. Die Bücher und Zeitschriften aus diesem Bereich finden Sie in dieser Zeit im Erdgeschoss. Wir bitten um Ihr Verständnis und freuen uns darauf, Ihnen schon bald einen moderneren und helleren Lesesaal anbieten zu können.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was ändert sich an den Öffnungszeiten der Bibliothek?$X7$, $X7$$X7$, $X7${"options": ["Die Bibliothek ist künftig auch samstags bis 16 Uhr geöffnet.", "Die Bibliothek öffnet künftig an allen Tagen erst am Nachmittag.", "Die Bibliothek schließt samstags schon um 12 Uhr."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was bietet die neue Digitalsprechstunde?$X7$, $X7$$X7$, $X7${"options": ["kostenlose Hilfe im Umgang mit digitalen Geräten für alle Altersgruppen", "einen kostenpflichtigen Computerkurs ausschließlich für Senioren", "den Verleih von Tablets und E-Book-Readern an die Mitglieder"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was gilt wegen der Umbauarbeiten?$X7$, $X7$$X7$, $X7${"options": ["Die gesamte Bibliothek bleibt mehrere Wochen lang geschlossen.", "Der Lesesaal ist zeitweise geschlossen; die Bestände stehen im Erdgeschoss bereit.", "Zeitschriften können während des Umbaus gar nicht ausgeliehen werden."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 12);

  -- ---- HÖREN ----------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'listening', 'Hören', $X7$Sie hören drei Texte, die jeweils von einer einzelnen Person gesprochen werden. Lesen Sie zuerst die Fragen zu jedem Text. Hören Sie dann zu und kreuzen Sie bei jeder Frage die richtige Antwort (a, b oder c) an. Es ist immer nur eine Antwort richtig. Bei Bedarf können Sie jeden Text zweimal hören.$X7$, 20, 2) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, sort_order) values
    (sid, 1, $X7$audio$X7$, $X7$Sie hören den Anfang einer Folge eines Wissenschaftspodcasts. Eine Schlafforscherin spricht über gesunden Schlaf.$X7$, $X7$Herzlich willkommen zu einer neuen Folge unseres Wissenschaftspodcasts. Mein heutiges Thema ist der Schlaf – etwas, das wir alle brauchen und über das trotzdem viele falsche Vorstellungen kursieren. Besonders hartnäckig hält sich der Glaube, man könne verpassten Schlaf am Wochenende einfach nachholen. Leider stimmt das so nicht: Zwar fühlen wir uns nach einem langen Samstagmorgen kurzfristig erholter, doch der innere Rhythmus gerät dadurch erst recht durcheinander, und am Montag fällt das Aufstehen umso schwerer. Viel wichtiger als die reine Stundenzahl ist die Regelmäßigkeit. Wer jeden Tag ungefähr zur gleichen Zeit ins Bett geht und aufsteht, schläft nachweislich besser – auch am Wochenende. Mein zweiter Rat betrifft das Licht: Das bläuliche Licht von Bildschirmen signalisiert dem Körper, es sei noch heller Tag, und bremst die Produktion des Schlafhormons. Legen Sie das Handy also mindestens eine Stunde vor dem Schlafengehen zur Seite. In der nächsten Folge sprechen wir dann darüber, welche Rolle die Ernährung für einen guten Schlaf spielt.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 1),
    (sid, 1, $X7$choice$X7$, $X7$Welche verbreitete Vorstellung über den Schlaf korrigiert die Forscherin?$X7$, $X7$$X7$, $X7${"options": ["dass man zu wenig Schlaf am Wochenende nachholen könne", "dass Kinder mehr Schlaf brauchen als Erwachsene", "dass man im Winter mehr Schlaf benötige als im Sommer"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 2),
    (sid, 1, $X7$choice$X7$, $X7$Was ist der Forscherin zufolge besonders wichtig für guten Schlaf?$X7$, $X7$$X7$, $X7${"options": ["möglichst viele Stunden am Stück zu schlafen", "am Nachmittag regelmäßig ein kurzes Nickerchen zu machen", "jeden Tag ungefähr zur gleichen Zeit zu schlafen und aufzustehen"]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 3),
    (sid, 1, $X7$choice$X7$, $X7$Welchen Rat gibt sie im Zusammenhang mit Bildschirmen?$X7$, $X7$$X7$, $X7${"options": ["abends das Zimmer möglichst hell zu beleuchten", "das Handy mindestens eine Stunde vor dem Schlafengehen wegzulegen", "vor dem Schlafen noch einen Film zur Entspannung zu sehen"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 4),
    (sid, 2, $X7$audio$X7$, $X7$Sie hören eine Nachricht auf Ihrem Anrufbeantworter. Der Leiter eines Fotokurses an der Volkshochschule hinterlässt Ihnen Informationen zum ersten Termin.$X7$, $X7$Guten Tag, hier spricht Thomas Keller, der Leiter des Fotokurses für Fortgeschrittene an der Volkshochschule. Ich rufe an, weil sich beim ersten Termin etwas geändert hat. Ursprünglich sollten wir am Montag beginnen, doch der Raum war leider schon belegt. Deshalb verschiebt sich unser erster Abend auf den Mittwoch, den fünfzehnten, um achtzehn Uhr dreißig. Wir treffen uns nicht wie angekündigt im Hauptgebäude, sondern im Raum zwei-eins im Nebengebäude hinter dem Innenhof. Bringen Sie bitte unbedingt Ihre eigene Kamera mit, denn wir steigen gleich am ersten Abend in die Praxis ein. Ein Stativ ist nicht nötig, das stellt die Volkshochschule. Falls Sie mit dem Auto kommen: Die Parkplätze direkt vor dem Gebäude sind für die Lehrkräfte reserviert, aber zwei Straßen weiter gibt es ein günstiges Parkhaus. Bei Fragen erreichen Sie mich am besten per E-Mail. Ich freue mich auf Sie und wünsche Ihnen bis dahin eine schöne Woche. Auf Wiederhören.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 5),
    (sid, 2, $X7$choice$X7$, $X7$Warum ruft Herr Keller an?$X7$, $X7$$X7$, $X7${"options": ["weil der Kurs in diesem Semester ganz ausfällt", "weil sich der erste Termin verschoben hat und der Raum ein anderer ist", "weil sich zu wenige Teilnehmende angemeldet haben"]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 6),
    (sid, 2, $X7$choice$X7$, $X7$Was sollen die Teilnehmenden zum ersten Abend mitbringen?$X7$, $X7$$X7$, $X7${"options": ["ihre eigene Kamera", "ein Stativ", "ausgedruckte Fotos"]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 7),
    (sid, 2, $X7$choice$X7$, $X7$Was sagt Herr Keller zum Parken?$X7$, $X7$$X7$, $X7${"options": ["Vor dem Gebäude stehen genügend kostenlose Plätze bereit.", "Parken ist in der ganzen Umgebung nicht möglich.", "Die Plätze vor dem Gebäude sind reserviert, ein Parkhaus gibt es zwei Straßen weiter."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 8),
    (sid, 3, $X7$audio$X7$, $X7$Sie hören eine Durchsage in einem Museum kurz vor Schließung.$X7$, $X7$Sehr geehrte Besucherinnen und Besucher, wir möchten Sie darauf aufmerksam machen, dass unser Museum in dreißig Minuten, also um siebzehn Uhr dreißig, schließt. Wir bitten Sie, sich allmählich in Richtung Ausgang zu begeben. Die Sonderausstellung zur Geschichte der Fotografie im zweiten Obergeschoss wird leider ab morgen abgebaut; heute haben Sie also die letzte Gelegenheit, sie zu sehen. Wir weisen außerdem darauf hin, dass im gesamten Haus das Fotografieren mit Blitz nicht gestattet ist, da das helle Licht die empfindlichen Ausstellungsstücke beschädigen kann. Ohne Blitz dürfen Sie dagegen gern Aufnahmen für den privaten Gebrauch machen. Unser Museumsshop im Erdgeschoss hat heute noch bis achtzehn Uhr für Sie geöffnet. Wir danken Ihnen für Ihren Besuch und wünschen Ihnen einen schönen Abend.$X7$, $X7${}$X7$::jsonb, $X7${}$X7$::jsonb, 0, 9),
    (sid, 3, $X7$choice$X7$, $X7$Was wird den Besuchern mit der Durchsage mitgeteilt?$X7$, $X7$$X7$, $X7${"options": ["Das Museum schließt in einer halben Stunde.", "Das Museum eröffnet gleich eine neue Ausstellung.", "Das Museum bleibt heute länger geöffnet als sonst."]}$X7$::jsonb, $X7${"correct": 0}$X7$::jsonb, 1, 10),
    (sid, 3, $X7$choice$X7$, $X7$Was gilt für die Sonderausstellung zur Fotografie?$X7$, $X7$$X7$, $X7${"options": ["Sie wird erst am nächsten Tag eröffnet.", "Heute ist der letzte Tag, an dem man sie sehen kann.", "Sie ist nur für angemeldete Gruppen zugänglich."]}$X7$::jsonb, $X7${"correct": 1}$X7$::jsonb, 1, 11),
    (sid, 3, $X7$choice$X7$, $X7$Was sagt die Durchsage zum Fotografieren?$X7$, $X7$$X7$, $X7${"options": ["Fotografieren ist im ganzen Haus streng verboten.", "Fotografieren ist nur im Museumsshop erlaubt.", "Aufnahmen ohne Blitz sind für private Zwecke erlaubt."]}$X7$::jsonb, $X7${"correct": 2}$X7$::jsonb, 1, 12);

  -- ---- SCHREIBEN ------------------------------------------------------------
  insert into public.exam_sections (paper_id, module, title, instructions, time_minutes, sort_order)
  values (pid, 'writing', 'Schreiben', $X7$Bearbeiten Sie die Aufgabe. Achten Sie auf einen klaren Aufbau, eine passende Einleitung und einen runden Schluss. Gehen Sie auf alle Leitpunkte ein und schreiben Sie zusammenhängend und in ganzen Sätzen.$X7$, 20, 3) returning id into sid;
  insert into public.exam_items (section_id, grp, kind, prompt, body, data, solution, points, min_words, max_words, sort_order) values
    (sid, 1, 'writing', $X7$Aufgabe: Forenbeitrag (ca. 150–180 Wörter)

In einem Online-Forum wird über die Frage diskutiert: „Sollten Schulen die Nutzung von Smartphones während der Unterrichtszeit verbieten?“ Schreiben Sie einen Beitrag für das Forum und nehmen Sie begründet Stellung.

Gehen Sie dabei auf folgende Punkte ein:
- Beschreiben Sie, welche Rolle das Smartphone Ihrer Erfahrung nach im Schulalltag spielt.
- Nennen Sie je ein Argument für und ein Argument gegen ein Verbot an Schulen.
- Erklären Sie, welche Lösung Sie persönlich für sinnvoll halten, und begründen Sie Ihre Meinung.

Schreiben Sie etwa 150–180 Wörter. Achten Sie auf einen klaren Aufbau mit Einleitung, Hauptteil und Schluss.$X7$, '', '{}'::jsonb, '{}'::jsonb, 10, 150, 180, 1);
end $do$;

