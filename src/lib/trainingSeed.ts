// Inhalte der Trainings-Einheiten als Daten (kein SQL).
// Werden über /api/seed-training serverseitig eingespielt – damit umgehen wir
// die SQL-Konsole vollständig.

export type SeedExercise = {
  kind: "choice" | "gap" | "order" | "error";
  prompt: string;
  data: Record<string, unknown>;
  solution: Record<string, unknown>;
  explanation: string;
  hint?: string;
};

export type SeedUnit = {
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  lessonId: string | null;
  sortOrder: number;
  theory: string;
  exercises: SeedExercise[];
};

export const TRAINING_UNITS: SeedUnit[] = [
  {
    slug: "verb-position",
    title: "Verb position",
    subtitle: "Where the verb goes — and why it moves",
    level: "A1",
    lessonId: "a1-german-sentence-structure-the-verbpos-rvmk",
    sortOrder: 1,
    theory: [
      "In a German main clause the conjugated verb always stands in **position 2**. Not the second word — the second *position*. One position can be a single word (\"Ich\") or a whole phrase (\"Am nächsten Montag\").",
      "**Ich** *gehe* heute ins Kino.\n**Heute** *gehe* ich ins Kino.\n**Am Montag** *gehe* ich ins Kino.",
      "Whatever you put first, the verb stays second and the subject simply moves behind it. English does not do this — that is why \"Heute ich gehe\" feels natural to learners and is still wrong.",
      "**Separable verbs and modal verbs** build a bracket: the conjugated part stays in second place, the rest goes to the very end.",
      "Anna *steht* um 7 Uhr **auf**.\nIch *kann* heute nicht **kommen**.",
      "**Subordinate clauses** (weil, dass, wenn, ob, obwohl …) work differently: there the conjugated verb moves to the **very end**.",
      "Ich bleibe zu Hause, weil ich müde **bin**.\nIch weiß, dass er morgen **kommt**.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "In a German main clause, where does the conjugated verb stand?",
        data: { options: ["In first place", "In second place", "At the very end", "Anywhere you like"] },
        solution: { correct: 1 },
        explanation: "The conjugated verb always stands in second place in a main clause — no matter what comes first.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: I am going to the cinema today.",
        data: { tokens: ["ins Kino", "heute", "gehe", "Ich"] },
        solution: { order: ["Ich", "gehe", "heute", "ins Kino"] },
        explanation: "Subject first, verb second: Ich gehe heute ins Kino.",
        hint: "Start with the subject.",
      },
      {
        kind: "order",
        prompt: "Now start with the time: Today I am going to the cinema.",
        data: { tokens: ["ich", "Heute", "ins Kino", "gehe"] },
        solution: { order: ["Heute", "gehe", "ich", "ins Kino"] },
        explanation: "The time phrase comes first, so the verb still has to be second and the subject moves behind it: Heute gehe ich ins Kino.",
        hint: "The verb keeps its second place.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Heute ich gehe ins Kino.",
        data: {},
        solution: { answers: ["Heute gehe ich ins Kino.", "Heute gehe ich ins Kino"] },
        explanation: "With \"Heute\" in first place the verb has to follow immediately: Heute *gehe* ich ins Kino. This is the most common mistake for English speakers.",
        hint: "What has to come second?",
      },
      {
        kind: "gap",
        prompt: "Am Montag ___ wir nach München. (fahren)",
        data: {},
        solution: { answers: ["fahren"] },
        explanation: "\"Am Montag\" fills the first place, so the conjugated verb follows immediately.",
      },
      {
        kind: "choice",
        prompt: "Which sentence is correct?",
        data: { options: ["Morgen ich besuche meine Oma.", "Morgen besuche ich meine Oma.", "Morgen besuchen ich meine Oma.", "Ich morgen besuche meine Oma."] },
        solution: { correct: 1 },
        explanation: "\"Morgen\" comes first, so the verb \"besuche\" must be second, then the subject \"ich\".",
      },
      {
        kind: "order",
        prompt: "Separable verb: Anna gets up at seven.",
        data: { tokens: ["auf", "steht", "Anna", "um 7 Uhr"] },
        solution: { order: ["Anna", "steht", "um 7 Uhr", "auf"] },
        explanation: "Separable verbs split: \"steht\" stays in second place, the prefix \"auf\" jumps to the very end.",
        hint: "Where does the prefix go?",
      },
      {
        kind: "gap",
        prompt: "Der Zug ___ um 8 Uhr an. (ankommen)",
        data: {},
        solution: { answers: ["kommt"] },
        explanation: "The prefix \"an\" is already at the end, so only the conjugated part \"kommt\" goes into second place.",
        hint: "The prefix is already placed.",
      },
      {
        kind: "order",
        prompt: "Modal verb: I cannot come today.",
        data: { tokens: ["kommen", "kann", "nicht", "Ich", "heute"] },
        solution: { order: ["Ich", "kann", "heute", "nicht", "kommen"] },
        explanation: "The modal verb \"kann\" takes second place, the main verb \"kommen\" goes to the end as an infinitive.",
        hint: "Where does the infinitive go?",
      },
      {
        kind: "choice",
        prompt: "Which sentence is correct?",
        data: { options: ["Ich muss heute arbeiten.", "Ich muss arbeiten heute.", "Ich arbeiten muss heute.", "Heute ich muss arbeiten."] },
        solution: { correct: 0 },
        explanation: "Modal verb second, infinitive at the end: Ich muss heute arbeiten.",
      },
      {
        kind: "order",
        prompt: "Subordinate clause: … because I am tired.",
        data: { tokens: ["bin", "weil", "müde", "ich"] },
        solution: { order: ["weil", "ich", "müde", "bin"] },
        explanation: "After \"weil\" the conjugated verb moves to the very end: weil ich müde bin.",
        hint: "Where does the verb go after weil?",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich bleibe zu Hause, weil ich bin müde.",
        data: {},
        solution: { answers: ["Ich bleibe zu Hause, weil ich müde bin.", "Ich bleibe zu Hause weil ich müde bin."] },
        explanation: "\"weil\" starts a subordinate clause, so the verb \"bin\" has to go to the very end.",
        hint: "The verb belongs at the end.",
      },
      {
        kind: "gap",
        prompt: "Ich weiß, dass er morgen ___. (kommen)",
        data: {},
        solution: { answers: ["kommt"] },
        explanation: "After \"dass\" the conjugated verb stands at the very end.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich denke, dass er kommt morgen.",
        data: {},
        solution: { answers: ["Ich denke, dass er morgen kommt.", "Ich denke dass er morgen kommt."] },
        explanation: "In a \"dass\" clause the verb goes last, the time phrase comes before it.",
      },
      {
        kind: "order",
        prompt: "Question: When are you coming home?",
        data: { tokens: ["nach Hause", "Wann", "du", "kommst"] },
        solution: { order: ["Wann", "kommst", "du", "nach Hause"] },
        explanation: "In W-questions the question word comes first and the verb still follows immediately.",
      },
    ],
  },
];
