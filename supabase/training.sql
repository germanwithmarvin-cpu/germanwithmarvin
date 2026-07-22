-- ============================================================================
-- TRAINING: Aufgaben-Trakt ("App in der App")
-- ----------------------------------------------------------------------------
-- Vier Tabellen + RLS + die Muster-Einheit "Verb position".
-- Im Supabase SQL-Editor einfügen und "Run". Idempotent.
--
-- Aufbau: Einheit -> Theorie -> Aufgabenserie -> Ergebnis.
-- Die Aufgabendaten liegen als JSON, damit neue Aufgabentypen später KEINE
-- Datenbank-Änderung brauchen.
-- ============================================================================

-- 1) Einheiten -------------------------------------------------------------
create table if not exists public.tr_units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  level text not null default 'A1',
  theory text not null default '',          -- Erklärung (Markdown-ähnlich, einfache Absätze)
  lesson_id text,                           -- optionale Verknüpfung zur Video-Lektion
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Aufgaben --------------------------------------------------------------
create table if not exists public.tr_exercises (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  kind text not null check (kind in ('choice','gap','order','error')),
  prompt text not null,                     -- Frage / Satz
  data jsonb not null default '{}'::jsonb,  -- z. B. {options:[...]} oder {tokens:[...]}
  solution jsonb not null,                  -- z. B. {correct:1} oder {answers:[...]} / {order:[...]}
  explain text not null default '',         -- WARUM - erscheint bei Fehler
  hint text not null default '',
  sort_order int not null default 0
);
create index if not exists tr_exercises_unit_idx on public.tr_exercises (unit_id, sort_order);

-- 3) Fortschritt je Schüler und Einheit ------------------------------------
create table if not exists public.tr_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  mastery int not null default 0,           -- 0..100
  attempts int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

-- 4) Einzelne Antworten (Fehler-Pool + Schwachstellen-Bericht) -------------
create table if not exists public.tr_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.tr_exercises(id) on delete cascade,
  correct boolean not null,
  given text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists tr_attempts_user_idx on public.tr_attempts (user_id, created_at desc);

-- RLS ----------------------------------------------------------------------
alter table public.tr_units     enable row level security;
alter table public.tr_exercises enable row level security;
alter table public.tr_progress  enable row level security;
alter table public.tr_attempts  enable row level security;

drop policy if exists "read units" on public.tr_units;
create policy "read units" on public.tr_units
  for select to authenticated using (is_published);

drop policy if exists "read exercises" on public.tr_exercises;
create policy "read exercises" on public.tr_exercises
  for select to authenticated using (
    exists (select 1 from public.tr_units u where u.id = unit_id and u.is_published)
  );

drop policy if exists "own progress" on public.tr_progress;
create policy "own progress" on public.tr_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own attempts" on public.tr_attempts;
create policy "own attempts" on public.tr_attempts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
-- MUSTER-EINHEIT: Verb position
-- ============================================================================
delete from public.tr_units where slug = 'verb-position';

with u as (
  insert into public.tr_units (slug, title, subtitle, level, lesson_id, sort_order, theory)
  values (
    'verb-position',
    'Verb position',
    'Where the verb goes - and why it moves',
    'A1',
    'a1-german-sentence-structure-the-verbpos-rvmk',
    1,
    'In a German main clause the conjugated verb always stands in **position 2**. Not second word - second *position*. A position can be one word ("Ich") or a whole phrase ("Am nächsten Montag").

**Ich** *gehe* heute ins Kino.
**Heute** *gehe* ich ins Kino.
**Am Montag** *gehe* ich ins Kino.

Whatever you put in position 1, the verb stays second and the subject simply moves behind it. English does not do this - that is why "Heute ich gehe" feels natural to learners and is wrong.

**Separable verbs and modal verbs** build a bracket: the conjugated part stays in position 2, the rest goes to the very end.

Anna *steht* um 7 Uhr **auf**.
Ich *kann* heute nicht **kommen**.

**Subordinate clauses** (weil, dass, wenn, ob, obwohl ...) work differently: there the conjugated verb moves to the **very end**.

Ich bleibe zu Hause, weil ich müde **bin**.
Ich weiß, dass er morgen **kommt**.'
  )
  returning id
)
insert into public.tr_exercises (unit_id, kind, prompt, data, solution, explain, hint, sort_order)
select u.id, v.kind, v.prompt, v.data::jsonb, v.solution::jsonb, v.explain, v.hint, v.ord
from u, (values
  ('choice',
   'In a German main clause, where does the conjugated verb stand?',
   '{"options":["In position 1","In position 2","At the very end","Anywhere you like"]}',
   '{"correct":1}',
   'The conjugated verb is always in position 2 of a main clause - no matter what comes first.',
   '', 1),

  ('order',
   'Build the sentence: I am going to the cinema today.',
   '{"tokens":["ins Kino","heute","gehe","Ich"]}',
   '{"order":["Ich","gehe","heute","ins Kino"]}',
   'Subject in position 1, verb in position 2: Ich gehe heute ins Kino.',
   'Start with the subject.', 2),

  ('order',
   'Now start with the time: Today I am going to the cinema.',
   '{"tokens":["ich","Heute","ins Kino","gehe"]}',
   '{"order":["Heute","gehe","ich","ins Kino"]}',
   'The time phrase takes position 1, so the verb still comes second and the subject moves behind it: Heute gehe ich ins Kino.',
   'The verb stays in position 2.', 3),

  ('error',
   'Correct this sentence: Heute ich gehe ins Kino.',
   '{}',
   '{"answers":["Heute gehe ich ins Kino.","Heute gehe ich ins Kino"]}',
   'With "Heute" in position 1, the verb must come second: Heute *gehe* ich ins Kino. This is the most common mistake for English speakers.',
   'What has to be in position 2?', 4),

  ('gap',
   'Am Montag ___ wir nach München. (fahren)',
   '{}',
   '{"answers":["fahren"]}',
   '"Am Montag" fills position 1, so the conjugated verb "fahren" follows immediately in position 2.',
   '', 5),

  ('choice',
   'Which sentence is correct?',
   '{"options":["Morgen ich besuche meine Oma.","Morgen besuche ich meine Oma.","Morgen besuchen ich meine Oma.","Ich morgen besuche meine Oma."]}',
   '{"correct":1}',
   'Position 1 is "Morgen", so the verb "besuche" must be second, then the subject "ich".',
   '', 6),

  ('order',
   'Separable verb: Anna gets up at 7 o clock.',
   '{"tokens":["auf","steht","Anna","um 7 Uhr"]}',
   '{"order":["Anna","steht","um 7 Uhr","auf"]}',
   'Separable verbs split: "steht" stays in position 2, the prefix "auf" jumps to the very end.',
   'Where does the prefix go?', 7),

  ('gap',
   'Der Zug ___ um 8 Uhr an. (ankommen)',
   '{}',
   '{"answers":["kommt"]}',
   'The prefix "an" is already at the end, so only the conjugated part "kommt" goes into position 2.',
   'The prefix is already there.', 8),

  ('order',
   'Modal verb: I cannot come today.',
   '{"tokens":["kommen","kann","nicht","Ich","heute"]}',
   '{"order":["Ich","kann","heute","nicht","kommen"]}',
   'The modal verb "kann" takes position 2, the main verb "kommen" goes to the end as an infinitive.',
   'Where does the infinitive go?', 9),

  ('choice',
   'Which sentence is correct?',
   '{"options":["Ich muss heute arbeiten.","Ich muss arbeiten heute.","Ich arbeiten muss heute.","Heute ich muss arbeiten."]}',
   '{"correct":0}',
   'Modal verb in position 2, infinitive at the end: Ich muss heute arbeiten.',
   '', 10),

  ('order',
   'Subordinate clause: ... because I am tired.',
   '{"tokens":["bin","weil","müde","ich"]}',
   '{"order":["weil","ich","müde","bin"]}',
   'After "weil" the conjugated verb moves to the very end: weil ich müde bin.',
   'Where does the verb go after weil?', 11),

  ('error',
   'Correct this sentence: Ich bleibe zu Hause, weil ich bin müde.',
   '{}',
   '{"answers":["Ich bleibe zu Hause, weil ich müde bin.","Ich bleibe zu Hause weil ich müde bin."]}',
   '"weil" starts a subordinate clause, so the verb "bin" has to go to the very end: ..., weil ich müde *bin*.',
   'The verb belongs at the end.', 12),

  ('gap',
   'Ich weiß, dass er morgen ___. (kommen)',
   '{}',
   '{"answers":["kommt"]}',
   'After "dass" the conjugated verb stands at the very end: ..., dass er morgen *kommt*.',
   '', 13),

  ('error',
   'Correct this sentence: Ich denke, dass er kommt morgen.',
   '{}',
   '{"answers":["Ich denke, dass er morgen kommt.","Ich denke dass er morgen kommt."]}',
   'In a "dass" clause the verb goes last, the time phrase comes before it: dass er morgen *kommt*.',
   '', 14),

  ('order',
   'Question: When are you coming home?',
   '{"tokens":["nach Hause","Wann","du","kommst"]}',
   '{"order":["Wann","kommst","du","nach Hause"]}',
   'In W-questions the question word takes position 1 and the verb still comes second: Wann kommst du nach Hause?',
   '', 15)
) as v(kind, prompt, data, solution, explain, hint, ord);
