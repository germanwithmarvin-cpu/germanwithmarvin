-- ============================================================================
-- TRAINING: Aufgaben-Trakt ("App in der App")
-- ----------------------------------------------------------------------------
-- Vier Tabellen + RLS + die Muster-Einheit "Verb position".
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent.
--
-- Bewusst in einfachen, einzelnen Anweisungen gehalten (keine CTE, keine
-- Spalten-Aliaslisten), damit es auch in Editoren laeuft, die Skripte an
-- Semikolons zerlegen.
-- ============================================================================

-- 1) Einheiten -------------------------------------------------------------
create table if not exists public.tr_units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  level text not null default 'A1',
  theory text not null default '',
  lesson_id text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Aufgaben --------------------------------------------------------------
create table if not exists public.tr_exercises (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  kind text not null,
  prompt text not null,
  data jsonb not null default '{}'::jsonb,
  solution jsonb not null default '{}'::jsonb,
  explanation text not null default '',
  hint text not null default '',
  sort_order int not null default 0
);

create index if not exists tr_exercises_unit_idx on public.tr_exercises (unit_id, sort_order);

-- 3) Fortschritt je Schueler und Einheit -----------------------------------
create table if not exists public.tr_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  mastery int not null default 0,
  attempts int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

-- 4) Einzelne Antworten ----------------------------------------------------
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
alter table public.tr_units enable row level security;

alter table public.tr_exercises enable row level security;

alter table public.tr_progress enable row level security;

alter table public.tr_attempts enable row level security;

drop policy if exists "read units" on public.tr_units;

create policy "read units" on public.tr_units for select to authenticated using (is_published);

drop policy if exists "read exercises" on public.tr_exercises;

create policy "read exercises" on public.tr_exercises for select to authenticated using (true);

drop policy if exists "own progress" on public.tr_progress;

create policy "own progress" on public.tr_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own attempts" on public.tr_attempts;

create policy "own attempts" on public.tr_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
-- MUSTER-EINHEIT
-- ============================================================================
delete from public.tr_units where slug = 'verb-position';

insert into public.tr_units (slug, title, subtitle, level, lesson_id, sort_order, theory)
values (
  'verb-position',
  'Verb position',
  'Where the verb goes - and why it moves',
  'A1',
  'a1-german-sentence-structure-the-verbpos-rvmk',
  1,
  E'In a German main clause the conjugated verb always stands in **position 2**. Not the second word - the second *position*. One position can be a single word ("Ich") or a whole phrase ("Am n\u00e4chsten Montag").

**Ich** *gehe* heute ins Kino.
**Heute** *gehe* ich ins Kino.
**Am Montag** *gehe* ich ins Kino.

Whatever you put first, the verb stays second and the subject simply moves behind it. English does not do this - that is why "Heute ich gehe" feels natural to learners and is still wrong.

**Separable verbs and modal verbs** build a bracket: the conjugated part stays in second place, the rest goes to the very end.

Anna *steht* um 7 Uhr **auf**.
Ich *kann* heute nicht **kommen**.

**Subordinate clauses** (weil, dass, wenn, ob, obwohl ...) work differently: there the conjugated verb moves to the **very end**.

Ich bleibe zu Hause, weil ich m\u00fcde **bin**.
Ich wei\u00df, dass er morgen **kommt**.'
);

insert into public.tr_exercises (unit_id, kind, prompt, data, solution, explanation, hint, sort_order)
values
((select id from public.tr_units where slug = 'verb-position'), 'choice',
 'In a German main clause, where does the conjugated verb stand?',
 '{"options":["In first place","In second place","At the very end","Anywhere you like"]}'::jsonb,
 '{"correct":1}'::jsonb,
 'The conjugated verb always stands in second place in a main clause - no matter what comes first.',
 '', 1),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Build the sentence: I am going to the cinema today.',
 '{"tokens":["ins Kino","heute","gehe","Ich"]}'::jsonb,
 '{"order":["Ich","gehe","heute","ins Kino"]}'::jsonb,
 'Subject first, verb second: Ich gehe heute ins Kino.',
 'Start with the subject.', 2),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Now start with the time: Today I am going to the cinema.',
 '{"tokens":["ich","Heute","ins Kino","gehe"]}'::jsonb,
 '{"order":["Heute","gehe","ich","ins Kino"]}'::jsonb,
 'The time phrase comes first, so the verb still has to be second and the subject moves behind it: Heute gehe ich ins Kino.',
 'The verb keeps its second place.', 3),

((select id from public.tr_units where slug = 'verb-position'), 'error',
 'Correct this sentence: Heute ich gehe ins Kino.',
 '{}'::jsonb,
 '{"answers":["Heute gehe ich ins Kino.","Heute gehe ich ins Kino"]}'::jsonb,
 'With "Heute" in first place the verb has to follow immediately: Heute *gehe* ich ins Kino. This is the most common mistake for English speakers.',
 'What has to come second?', 4),

((select id from public.tr_units where slug = 'verb-position'), 'gap',
 E'Am Montag ___ wir nach M\u00fcnchen. (fahren)',
 '{}'::jsonb,
 '{"answers":["fahren"]}'::jsonb,
 '"Am Montag" fills the first place, so the conjugated verb follows immediately.',
 '', 5),

((select id from public.tr_units where slug = 'verb-position'), 'choice',
 'Which sentence is correct?',
 '{"options":["Morgen ich besuche meine Oma.","Morgen besuche ich meine Oma.","Morgen besuchen ich meine Oma.","Ich morgen besuche meine Oma."]}'::jsonb,
 '{"correct":1}'::jsonb,
 '"Morgen" comes first, so the verb "besuche" must be second, then the subject "ich".',
 '', 6),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Separable verb: Anna gets up at seven.',
 '{"tokens":["auf","steht","Anna","um 7 Uhr"]}'::jsonb,
 '{"order":["Anna","steht","um 7 Uhr","auf"]}'::jsonb,
 'Separable verbs split: "steht" stays in second place, the prefix "auf" jumps to the very end.',
 'Where does the prefix go?', 7),

((select id from public.tr_units where slug = 'verb-position'), 'gap',
 'Der Zug ___ um 8 Uhr an. (ankommen)',
 '{}'::jsonb,
 '{"answers":["kommt"]}'::jsonb,
 'The prefix "an" is already at the end, so only the conjugated part "kommt" goes into second place.',
 'The prefix is already placed.', 8),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Modal verb: I cannot come today.',
 '{"tokens":["kommen","kann","nicht","Ich","heute"]}'::jsonb,
 '{"order":["Ich","kann","heute","nicht","kommen"]}'::jsonb,
 'The modal verb "kann" takes second place, the main verb "kommen" goes to the end as an infinitive.',
 'Where does the infinitive go?', 9),

((select id from public.tr_units where slug = 'verb-position'), 'choice',
 'Which sentence is correct?',
 '{"options":["Ich muss heute arbeiten.","Ich muss arbeiten heute.","Ich arbeiten muss heute.","Heute ich muss arbeiten."]}'::jsonb,
 '{"correct":0}'::jsonb,
 'Modal verb second, infinitive at the end: Ich muss heute arbeiten.',
 '', 10),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Subordinate clause: ... because I am tired.',
 E'{"tokens":["bin","weil","m\u00fcde","ich"]}'::jsonb,
 E'{"order":["weil","ich","m\u00fcde","bin"]}'::jsonb,
 E'After "weil" the conjugated verb moves to the very end: weil ich m\u00fcde bin.',
 'Where does the verb go after weil?', 11),

((select id from public.tr_units where slug = 'verb-position'), 'error',
 E'Correct this sentence: Ich bleibe zu Hause, weil ich bin m\u00fcde.',
 '{}'::jsonb,
 E'{"answers":["Ich bleibe zu Hause, weil ich m\u00fcde bin.","Ich bleibe zu Hause weil ich m\u00fcde bin."]}'::jsonb,
 '"weil" starts a subordinate clause, so the verb "bin" has to go to the very end.',
 'The verb belongs at the end.', 12),

((select id from public.tr_units where slug = 'verb-position'), 'gap',
 E'Ich wei\u00df, dass er morgen ___. (kommen)',
 '{}'::jsonb,
 '{"answers":["kommt"]}'::jsonb,
 'After "dass" the conjugated verb stands at the very end.',
 '', 13),

((select id from public.tr_units where slug = 'verb-position'), 'error',
 'Correct this sentence: Ich denke, dass er kommt morgen.',
 '{}'::jsonb,
 '{"answers":["Ich denke, dass er morgen kommt.","Ich denke dass er morgen kommt."]}'::jsonb,
 'In a "dass" clause the verb goes last, the time phrase comes before it.',
 '', 14),

((select id from public.tr_units where slug = 'verb-position'), 'order',
 'Question: When are you coming home?',
 '{"tokens":["nach Hause","Wann","du","kommst"]}'::jsonb,
 '{"order":["Wann","kommst","du","nach Hause"]}'::jsonb,
 'In W-questions the question word comes first and the verb still follows immediately.',
 '', 15);
