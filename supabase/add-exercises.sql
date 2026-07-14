-- Interaktive Aufgaben pro Lektion (Lückentext, Satzbau, Zuordnen, Multiple Choice).
-- Werden als JSON gespeichert. Mehrfach ausfuehrbar.

-- 1) Spalte anlegen
alter table public.lessons
  add column if not exists exercises jsonb not null default '[]'::jsonb;

-- 2) DEMO: umfangreicher Aufgabensatz (alle Typen) fuer die Lektion "German Greetings".
--    Kannst du spaeter jederzeit ersetzen.
update public.lessons
set
  quiz_enabled = true,
  exercises = '[
    {"id":"e1","type":"mc","prompt":"What does \"Guten Morgen\" mean?","options":[{"id":"a","text":"Good morning"},{"id":"b","text":"Good night"},{"id":"c","text":"Goodbye"}],"correctOptionId":"a","explanation":"Guten Morgen = Good morning (used until about 11am)."},
    {"id":"e2","type":"mc","prompt":"Which is a FORMAL way to say goodbye?","options":[{"id":"a","text":"Tschüss"},{"id":"b","text":"Auf Wiedersehen"},{"id":"c","text":"Hallo"}],"correctOptionId":"b","explanation":"Auf Wiedersehen is formal; Tschüss is casual."},
    {"id":"e3","type":"gap","prompt":"___ heißt du?","answers":["Wie"],"explanation":"Wie heißt du? = What is your name? (informal)"},
    {"id":"e4","type":"gap","prompt":"Ich ___ Marvin.","answers":["heiße","heisse"],"explanation":"heißen = to be called. Ich heiße Marvin."},
    {"id":"e5","type":"gap","prompt":"Guten ___! (a greeting used in the evening)","answers":["Abend"],"explanation":"Guten Abend = Good evening."},
    {"id":"e6","type":"order","prompt":"Build the sentence: My name is Marvin.","correct":["Ich","heiße","Marvin"],"explanation":"Ich heiße Marvin."},
    {"id":"e7","type":"order","prompt":"Build the question: How are you? (informal)","correct":["Wie","geht","es","dir"],"explanation":"Wie geht es dir? — the verb comes in second position."},
    {"id":"e8","type":"order","prompt":"Build the sentence: I come from Germany.","correct":["Ich","komme","aus","Deutschland"],"explanation":"Ich komme aus Deutschland."},
    {"id":"e9","type":"match","prompt":"Match each word to its meaning","pairs":[{"left":"Hallo","right":"Hello"},{"left":"Tschüss","right":"Bye"},{"left":"Danke","right":"Thank you"},{"left":"Bitte","right":"Please"},{"left":"Guten Tag","right":"Good day"}],"explanation":"Everyday essentials."},
    {"id":"e10","type":"categorize","prompt":"Formal or informal greeting?","categories":["Formal","Informal"],"items":[{"text":"Guten Tag","category":"Formal"},{"text":"Hallo","category":"Informal"},{"text":"Auf Wiedersehen","category":"Formal"},{"text":"Tschüss","category":"Informal"}],"explanation":"Guten Tag and Auf Wiedersehen are formal; Hallo and Tschüss are casual."}
  ]'::jsonb
where title ilike '%greeting%';
