-- Interaktive Aufgaben pro Lektion (Lückentext, Satzbau, Zuordnen, Multiple Choice).
-- Werden als JSON gespeichert. Mehrfach ausfuehrbar.

-- 1) Spalte anlegen
alter table public.lessons
  add column if not exists exercises jsonb not null default '[]'::jsonb;

-- 2) DEMO: ein kompletter Aufgabensatz (alle 4 Typen) fuer die Lektion "German Greetings",
--    damit du es sofort im Browser testen kannst. Kannst du spaeter jederzeit ersetzen.
update public.lessons
set
  quiz_enabled = true,
  exercises = '[
    {"id":"e1","type":"mc","prompt":"What does \"Guten Morgen\" mean?","options":[{"id":"a","text":"Good morning"},{"id":"b","text":"Good night"},{"id":"c","text":"Goodbye"}],"correctOptionId":"a","explanation":"Guten Morgen = Good morning."},
    {"id":"e2","type":"gap","prompt":"___ heißt du?","answers":["Wie"],"explanation":"Wie heißt du? = What is your name?"},
    {"id":"e3","type":"order","prompt":"Build the sentence: My name is Marvin.","correct":["Ich","heiße","Marvin"],"explanation":"Ich heiße Marvin."},
    {"id":"e4","type":"match","prompt":"Match each word to its meaning","pairs":[{"left":"Hallo","right":"Hello"},{"left":"Tschüss","right":"Bye"},{"left":"Danke","right":"Thank you"},{"left":"Bitte","right":"Please"}],"explanation":"Everyday essentials."},
    {"id":"e5","type":"categorize","prompt":"Formal or informal?","categories":["Formal","Informal"],"items":[{"text":"Guten Tag","category":"Formal"},{"text":"Hallo","category":"Informal"},{"text":"Auf Wiedersehen","category":"Formal"},{"text":"Tschüss","category":"Informal"}],"explanation":"Guten Tag and Auf Wiedersehen are formal."}
  ]'::jsonb
where title ilike '%greeting%';
