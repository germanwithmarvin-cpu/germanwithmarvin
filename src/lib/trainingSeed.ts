// Inhalte der Trainings-Einheiten als Daten (kein SQL).
// Werden über /api/seed-training serverseitig eingespielt.
//
// WICHTIG – Reihenfolge: Die Einheiten folgen der Video-Reihenfolge des Kurses.
// A1: Alphabet -> Begrüßungen -> Artikel -> KONJUGATION -> VERBPOSITION ->
//     Zahlen/Zeit -> Small Talk -> ... -> Fragen
// Eine Einheit darf NICHTS voraussetzen, was erst später drankommt. Konkret in
// A1 tabu, weil später/A2: trennbare Verben, Modalverben, Nebensätze (weil/dass),
// Fragen, Fälle, Vergangenheit.
//
// Auszeichnung in Theorie und Erklärungen:
//   **Text**  = wichtige Regel (gelber Marker)
//   *Text*    = Verbform o. Ä. (Bordeaux-Chip)

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
  // ─────────────────────────────────────────────────────────────────────────
  // 1) KONJUGATION – Voraussetzung: Alphabet, Begrüßungen, Artikel
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "present-tense",
    title: "Verb endings (present tense)",
    subtitle: "How German verbs change with the person",
    level: "A1",
    lessonId: "german-conjugation-how-german-verbs-chan-z9wd",
    sortOrder: 1,
    theory: [
      "A German verb has two parts: the **stem** and the **ending**. Take the infinitive lernen, cut off **-en**, and the stem is left: lern-.",
      "Now you only add the ending for the person:\nich *lerne* — du *lernst* — er/sie/es *lernt*\nwir *lernen* — ihr *lernt* — sie/Sie *lernen*",
      "For regular verbs the endings are always the same: **-e, -st, -t, -en, -t, -en**. Learn them once and they work for hundreds of verbs.",
      "If the stem ends in **-t** or **-d**, an extra **-e** is added so you can actually say it: du *arbeitest*, er *arbeitet*.",
      "One verb you simply have to know by heart is **sein** (to be):\nich *bin* — du *bist* — er/sie/es *ist*\nwir *sind* — ihr *seid* — sie/Sie *sind*",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "What is the stem of lernen?",
        data: { options: ["lern", "lerne", "lernen", "ler"] },
        solution: { correct: 0 },
        explanation: "Cut off **-en** from the infinitive: lernen → lern-. Everything else is just the ending.",
      },
      {
        kind: "gap",
        prompt: "Ich ___ Deutsch. (lernen)",
        data: {},
        solution: { answers: ["lerne"] },
        explanation: "**ich** takes the ending **-e**: ich *lerne*.",
      },
      {
        kind: "gap",
        prompt: "Du ___ in Hamburg. (wohnen)",
        data: {},
        solution: { answers: ["wohnst"] },
        explanation: "**du** takes the ending **-st**: du *wohnst*.",
      },
      {
        kind: "gap",
        prompt: "Er ___ Kaffee. (trinken)",
        data: {},
        solution: { answers: ["trinkt"] },
        explanation: "**er, sie und es** all take the ending **-t**: er *trinkt*.",
      },
      {
        kind: "choice",
        prompt: "Which form is correct? Wir ___ Deutsch.",
        data: { options: ["lernt", "lernen", "lerne", "lernst"] },
        solution: { correct: 1 },
        explanation: "**wir** takes **-en** — that looks exactly like the infinitive: wir *lernen*.",
      },
      {
        kind: "gap",
        prompt: "Ihr ___ gern Musik. (hören)",
        data: {},
        solution: { answers: ["hört", "hoert"] },
        explanation: "**ihr** takes the ending **-t**: ihr *hört*.",
      },
      {
        kind: "gap",
        prompt: "Sie ___ aus Spanien. (kommen)",
        data: {},
        solution: { answers: ["kommen"] },
        explanation: "**sie** (they) and the polite **Sie** both take **-en**: sie *kommen*.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Du lernt Deutsch.",
        data: {},
        solution: { answers: ["Du lernst Deutsch.", "Du lernst Deutsch"] },
        explanation: "**du** needs **-st**, not -t. Correct: Du *lernst* Deutsch.",
        hint: "Which ending belongs to du?",
      },
      {
        kind: "gap",
        prompt: "Du ___ viel. (arbeiten)",
        data: {},
        solution: { answers: ["arbeitest"] },
        explanation: "The stem arbeit- already ends in **-t**, so an extra **-e** is inserted: du *arbeitest*. Without it you could not pronounce it.",
        hint: "Say it out loud — something is missing.",
      },
      {
        kind: "choice",
        prompt: "Ich ___ Marvin.",
        data: { options: ["bin", "bist", "ist", "sind"] },
        solution: { correct: 0 },
        explanation: "**sein** is irregular and has to be memorised: ich *bin*.",
      },
      {
        kind: "gap",
        prompt: "Wir ___ müde. (sein)",
        data: {},
        solution: { answers: ["sind"] },
        explanation: "**sein** for wir: wir *sind*.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Er sind mein Lehrer.",
        data: {},
        solution: { answers: ["Er ist mein Lehrer.", "Er ist mein Lehrer"] },
        explanation: "**er** takes *ist*. Only wir and sie/Sie take *sind*.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2) VERBPOSITION – nutzt NUR Konjugation, Artikel und Begrüßungs-Wortschatz.
  //    Bewusst OHNE: trennbare Verben, Modalverben, Nebensätze, Fragen.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "verb-position",
    title: "Verb position",
    subtitle: "The conjugated verb always comes second",
    level: "A1",
    lessonId: "a1-german-sentence-structure-the-verbpos-rvmk",
    sortOrder: 2,
    theory: [
      "In a German statement the conjugated verb always stands in **second place**. Not the second word — the second **position**. One position can be a single word (Ich) or a small group of words (Am Montag).",
      "@Ich|lerne*|heute Deutsch",
      "You do not have to start with the subject. You can put something else first — but then the verb still stays second, and the **subject moves behind the verb**:",
      "@Heute|lerne*|ich Deutsch\n@Gern|trinke*|ich Kaffee",
      "English does not swap like this, and that is exactly why **Heute ich lerne** feels natural to you and is still wrong. The verb never gives up its second place.",
      "And it never moves to the end either: **Ich Deutsch lerne** is wrong. In a statement the verb is second — always.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "In a German statement, where does the conjugated verb stand?",
        data: { options: ["In first place", "In second place", "At the very end", "Anywhere you like"] },
        solution: { correct: 1 },
        explanation: "The conjugated verb always stands in **second place** in a statement.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: I am learning German.",
        data: { tokens: ["Deutsch", "lerne", "Ich"] },
        solution: { order: ["Ich", "lerne", "Deutsch"], verb: 1 },
        explanation: "Subject first, verb second: Ich *lerne* Deutsch.",
        hint: "Start with the subject.",
      },
      {
        kind: "order",
        prompt: "Now start with Heute: Today I am learning German.",
        data: { tokens: ["ich", "Heute", "Deutsch", "lerne"] },
        solution: { order: ["Heute", "lerne", "ich", "Deutsch"], verb: 1 },
        explanation: "**Heute** takes first place, so the verb *lerne* has to be second — and the subject ich moves behind it.",
        hint: "The verb keeps its second place.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Heute ich lerne Deutsch.",
        data: {},
        solution: { answers: ["Heute lerne ich Deutsch.", "Heute lerne ich Deutsch"] },
        explanation: "With Heute in first place the verb must follow immediately: Heute *lerne* ich Deutsch. This is the most common mistake for English speakers.",
        hint: "What has to come second?",
      },
      {
        kind: "choice",
        prompt: "Which sentence is correct?",
        data: { options: ["Morgen ich trinke Kaffee.", "Morgen trinke ich Kaffee.", "Morgen trinken ich Kaffee.", "Ich morgen trinke Kaffee."] },
        solution: { correct: 1 },
        explanation: "Morgen is in first place, so the verb *trinke* must be second, then the subject ich.",
      },
      {
        kind: "gap",
        prompt: "Heute ___ ich Deutsch. (lernen)",
        data: {},
        solution: { answers: ["lerne"] },
        explanation: "Second place belongs to the verb, and for **ich** the ending is **-e**: Heute *lerne* ich Deutsch.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: Tomorrow she is coming.",
        data: { tokens: ["kommt", "Morgen", "sie"] },
        solution: { order: ["Morgen", "kommt", "sie"], verb: 1 },
        explanation: "Morgen first, verb *kommt* second, subject sie behind it.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Hier du wohnst.",
        data: {},
        solution: { answers: ["Hier wohnst du.", "Hier wohnst du"] },
        explanation: "Hier is in first place, so the verb *wohnst* comes second and du moves behind it.",
        hint: "The subject cannot stay in second place.",
      },
      {
        kind: "choice",
        prompt: "You put something other than the subject in first place. What happens to the subject?",
        data: { options: ["It disappears", "It moves behind the verb", "It stays in first place", "It goes to the end"] },
        solution: { correct: 1 },
        explanation: "The verb keeps second place, so the **subject moves behind the verb**: Heute *lerne* ich.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: I like drinking coffee. (start with Gern)",
        data: { tokens: ["ich", "Gern", "Kaffee", "trinke"] },
        solution: { order: ["Gern", "trinke", "ich", "Kaffee"], verb: 1 },
        explanation: "Gern first, verb *trinke* second, then the subject: Gern trinke ich Kaffee.",
      },
      {
        kind: "gap",
        prompt: "Morgen ___ wir Deutsch. (lernen)",
        data: {},
        solution: { answers: ["lernen"] },
        explanation: "The verb takes second place, and for **wir** the ending is **-en**: Morgen *lernen* wir Deutsch.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich Deutsch lerne.",
        data: {},
        solution: { answers: ["Ich lerne Deutsch.", "Ich lerne Deutsch"] },
        explanation: "In a statement the verb never goes to the end. It belongs in **second place**: Ich *lerne* Deutsch.",
        hint: "Where does the verb belong?",
      },
    ],
  },
];
