delete from public.tr_units where slug = 'verb-position';

insert into public.tr_units (slug, title, subtitle, level, lesson_id, sort_order, theory)
values (
  'verb-position',
  'Verb position',
  'Where the verb goes - and why it moves',
  'A1',
  'a1-german-sentence-structure-the-verbpos-rvmk',
  1,
  E'In a German main clause the conjugated verb always stands in **position 2**. Not the second word - the second *position*. One position can be a single word (\u0022Ich\u0022) or a whole phrase (\u0022Am n\u00e4chsten Montag\u0022).\n\n**Ich** *gehe* heute ins Kino.\n**Heute** *gehe* ich ins Kino.\n**Am Montag** *gehe* ich ins Kino.\n\nWhatever you put first, the verb stays second and the subject simply moves behind it. English does not do this - that is why \u0022Heute ich gehe\u0022 feels natural to learners and is still wrong.\n\n**Separable verbs and modal verbs** build a bracket: the conjugated part stays in second place, the rest goes to the very end.\n\nAnna *steht* um 7 Uhr **auf**.\nIch *kann* heute nicht **kommen**.\n\n**Subordinate clauses** (weil, dass, wenn, ob, obwohl ...) work differently: there the conjugated verb moves to the **very end**.\n\nIch bleibe zu Hause, weil ich m\u00fcde **bin**.\nIch wei\u00df, dass er morgen **kommt**.'
);
