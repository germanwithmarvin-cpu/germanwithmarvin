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
  'In a German main clause the conjugated verb always stands in **position 2**. Not the second word - the second *position*. One position can be a single word ("Ich") or a whole phrase ("Am nächsten Montag").

**Ich** *gehe* heute ins Kino.
**Heute** *gehe* ich ins Kino.
**Am Montag** *gehe* ich ins Kino.

Whatever you put first, the verb stays second and the subject simply moves behind it. English does not do this - that is why "Heute ich gehe" feels natural to learners and is still wrong.

**Separable verbs and modal verbs** build a bracket: the conjugated part stays in second place, the rest goes to the very end.

Anna *steht* um 7 Uhr **auf**.
Ich *kann* heute nicht **kommen**.

**Subordinate clauses** (weil, dass, wenn, ob, obwohl ...) work differently: there the conjugated verb moves to the **very end**.

Ich bleibe zu Hause, weil ich müde **bin**.
Ich weiß, dass er morgen **kommt**.'
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
 'Am Montag ___ wir nach München. (fahren)',
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
 '{"tokens":["bin","weil","müde","ich"]}'::jsonb,
 '{"order":["weil","ich","müde","bin"]}'::jsonb,
 'After "weil" the conjugated verb moves to the very end: weil ich müde bin.',
 'Where does the verb go after weil?', 11),

((select id from public.tr_units where slug = 'verb-position'), 'error',
 'Correct this sentence: Ich bleibe zu Hause, weil ich bin müde.',
 '{}'::jsonb,
 '{"answers":["Ich bleibe zu Hause, weil ich müde bin.","Ich bleibe zu Hause weil ich müde bin."]}'::jsonb,
 '"weil" starts a subordinate clause, so the verb "bin" has to go to the very end.',
 'The verb belongs at the end.', 12),

((select id from public.tr_units where slug = 'verb-position'), 'gap',
 'Ich weiß, dass er morgen ___. (kommen)',
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
