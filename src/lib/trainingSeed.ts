// Inhalte der Trainings-Einheiten als Daten (kein SQL).
// Werden über /api/seed-training serverseitig eingespielt.
//
// WICHTIG – Reihenfolge: Die Einheiten folgen der Video-Reihenfolge des Kurses.
// Die echten A1-Videos in ihrer Reihenfolge (Stand Juli 2026):
//   Was ist A1? -> Alphabet -> Begrüßungen -> ARTIKEL -> KONJUGATION ->
//   VERBPOSITION -> Zahlen/Zeit/Datum -> SMALL TALK -> Danke sagen ->
//   Im Restaurant -> Reaktionen
// Zu Plural und haben/sein gibt es KEIN eigenes Video. Diese beiden Einheiten
// vertiefen deshalb das jeweils passende Video (Artikel bzw. Konjugation) und
// stehen direkt dahinter.
//
// Eine Einheit darf NICHTS voraussetzen, was erst später drankommt. Konkret in
// A1 tabu, weil erst in A2: Fälle, trennbare Verben, Modalverben, Nebensätze
// (weil/dass), Vergangenheit.
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
  /** Feste Kennung der Videolektion, falls bekannt. */
  lessonId: string | null;
  /** Ersatzweise: Textstück aus dem Titel der Lektion. Der Seeder sucht damit
   *  die passende Lektion – so zeigt keine Einheit auf ein Video, das es nicht
   *  (mehr) gibt. */
  lessonMatch?: string;
  sortOrder: number;
  theory: string;
  exercises: SeedExercise[];
};

export const TRAINING_UNITS: SeedUnit[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1) ARTIKEL – erste Grammatik nach Alphabet und Begrüßungen.
  //    Setzt NUR "ist" voraus (kommt aus den Begrüßungen), noch KEINE
  //    Konjugation, keine Verbposition, keine Fälle.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "articles",
    title: "der, die, das",
    subtitle: "Every German noun has a gender",
    level: "A1",
    lessonId: null,
    lessonMatch: "der, die, das",
    sortOrder: 1,
    theory: [
      "In English there is one word for all of them: the. In German there are **three**, because every noun has a gender:",
      "*der* Mann (masculine) — *die* Frau (feminine) — *das* Kind (neuter)",
      "The gender belongs to the **word**, not to the meaning. Das Mädchen (the girl) is neuter — the grammar does not care that a girl is female. So never try to work it out by logic.",
      "This is why the golden rule is: **learn the article together with the noun.** Not Tisch, but der Tisch. If you learn the word alone, you will have to guess forever.",
      "The good news: in the **plural** there is only one article for everything — **die**.\ndie Männer — die Frauen — die Kinder",
      "And a few endings are reliable. These are always *die*: **-ung, -heit, -keit, -schaft** (die Wohnung, die Freiheit, die Möglichkeit, die Freundschaft).\nThis one is always *das*: **-chen** (das Mädchen, das Brötchen).",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "In the singular, how many different words for the does German have?",
        data: { options: ["One", "Two", "Three", "Four"] },
        solution: { correct: 2 },
        explanation: "**Three**: *der* (masculine), *die* (feminine), *das* (neuter). Every noun carries one of them.",
      },
      {
        kind: "gap",
        prompt: "___ Mann ist hier.",
        data: {},
        solution: { answers: ["Der", "der"] },
        explanation: "Mann is masculine: **der Mann**.",
      },
      {
        kind: "gap",
        prompt: "___ Frau ist nett.",
        data: {},
        solution: { answers: ["Die", "die"] },
        explanation: "Frau is feminine: **die Frau**.",
      },
      {
        kind: "gap",
        prompt: "___ Kind ist klein.",
        data: {},
        solution: { answers: ["Das", "das"] },
        explanation: "Kind is neuter: **das Kind**.",
      },
      {
        kind: "choice",
        prompt: "Which one is correct?",
        data: { options: ["der Auto", "die Auto", "das Auto", "den Auto"] },
        solution: { correct: 2 },
        explanation: "Auto is neuter: **das Auto**. There is no rule that tells you this — it is learnt with the word.",
      },
      {
        kind: "choice",
        prompt: "Which article do ALL nouns take in the plural?",
        data: { options: ["der", "die", "das", "It stays the same as in the singular"] },
        solution: { correct: 1 },
        explanation: "In the plural everything takes **die**: die Männer, die Frauen, die Kinder. One article, no exceptions.",
      },
      {
        kind: "gap",
        prompt: "___ Wohnung ist groß.",
        data: {},
        solution: { answers: ["Die", "die"] },
        explanation: "Words ending in **-ung** are always feminine: **die Wohnung**. Same for -heit, -keit and -schaft.",
        hint: "Look at the ending of the noun.",
      },
      {
        kind: "gap",
        prompt: "___ Mädchen ist meine Schwester.",
        data: {},
        solution: { answers: ["Das", "das"] },
        explanation: "Words ending in **-chen** are always neuter: **das Mädchen** — even though a Mädchen is a girl. The ending beats the meaning.",
        hint: "The ending decides, not the meaning.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Die Buch ist neu.",
        data: {},
        solution: { answers: ["Das Buch ist neu.", "Das Buch ist neu"] },
        explanation: "Buch is neuter: **das Buch** ist neu.",
      },
      {
        kind: "choice",
        prompt: "Sonne, Blume, Zeitung — which article do all three take?",
        data: { options: ["der", "die", "das", "They are all different"] },
        solution: { correct: 1 },
        explanation: "All three are feminine: **die** Sonne, **die** Blume, **die** Zeitung.",
      },
      {
        kind: "gap",
        prompt: "___ Freundschaft ist wichtig.",
        data: {},
        solution: { answers: ["Die", "die"] },
        explanation: "**-schaft** is always feminine: **die Freundschaft**.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Das Blume ist schön.",
        data: {},
        solution: { answers: ["Die Blume ist schön.", "Die Blume ist schön"] },
        explanation: "Blume is feminine: **die Blume** ist schön.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2) KONJUGATION – Voraussetzung: Alphabet, Begrüßungen, Artikel
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "present-tense",
    title: "Verb endings (present tense)",
    subtitle: "How German verbs change with the person",
    level: "A1",
    lessonId: "german-conjugation-how-german-verbs-chan-z9wd",
    lessonMatch: "conjugation",
    sortOrder: 3,
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
  // 3) VERBPOSITION – nutzt NUR Konjugation, Artikel und Begrüßungs-Wortschatz.
  //    Bewusst OHNE: trennbare Verben, Modalverben, Nebensätze, Fragen.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "verb-position",
    title: "Verb position",
    subtitle: "The conjugated verb always comes second",
    level: "A1",
    lessonId: "a1-german-sentence-structure-the-verbpos-rvmk",
    lessonMatch: "verbposition",
    sortOrder: 5,
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

  // ─────────────────────────────────────────────────────────────────────────
  // 4) ZAHLEN & UHRZEIT – nutzt Artikel, Konjugation und Verbposition.
  //    Die Zeitangabe auf Position 1 wiederholt bewusst die Verbposition.
  //    Bewusst OHNE: Fragen ("Wie spät ist es?"), Fälle, Modalverben.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "numbers-time",
    title: "Numbers, time and days",
    subtitle: "Saying when — and why German numbers run backwards",
    level: "A1",
    lessonId: null,
    lessonMatch: "number",
    sortOrder: 6,
    theory: [
      "0–12 you simply learn: null, eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf.",
      "From 13 to 19 you glue the unit onto **zehn**: drei + zehn = *dreizehn*, sech + zehn = *sechzehn*, sieb + zehn = *siebzehn*.",
      "The tens end in **-zig**: zwanzig, vierzig, fünfzig, sechzig, siebzig, achtzig, neunzig. Only one is odd: 30 is **dreißig**, not dreizig.",
      "Now the part that feels wrong to English speakers. From 21 on, German says the **unit first**, then und, then the ten — and writes it as **one single word**:",
      "21 = **ein-und-zwanzig** (one-and-twenty)\n67 = **siebenundsechzig** (seven-and-sixty)",
      "So you hear the small number first. That is why German phone numbers are hard at the start — you have to hold the number and turn it around.",
      "For the clock you say: **Es ist acht Uhr.** For half hours German counts **forwards to the next hour**: *halb neun* is 8:30, not 9:30. Think half way to nine.",
      "And the quarters: **Viertel nach acht** = 8:15, **Viertel vor neun** = 8:45.",
      "Days take **am**: am Montag, am Dienstag, am Mittwoch, am Donnerstag, am Freitag, am Samstag, am Sonntag.",
      "Careful: a time in first place is still just **position 1** — so the verb stays second and the subject moves behind it:",
      "@Am Montag|lerne*|ich Deutsch",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "How do you say 21 in German?",
        data: { options: ["zwanzigeins", "einundzwanzig", "zwanzig und eins", "einzwanzig"] },
        solution: { correct: 1 },
        explanation: "Unit first, then und, then the ten — as one word: **einundzwanzig**.",
      },
      {
        kind: "gap",
        prompt: "Write 13 in words: ___",
        data: {},
        solution: { answers: ["dreizehn"] },
        explanation: "13 to 19 are the unit plus **zehn**: drei + zehn = **dreizehn**.",
      },
      {
        kind: "gap",
        prompt: "Write 40 in words: ___",
        data: {},
        solution: { answers: ["vierzig"] },
        explanation: "The tens end in **-zig**: vier + zig = **vierzig**.",
      },
      {
        kind: "choice",
        prompt: "Which is 30?",
        data: { options: ["dreizig", "dreißig", "dreizehn", "drittzig"] },
        solution: { correct: 1 },
        explanation: "30 is the one exception in the tens: **dreißig** with ß, not dreizig. And watch out — dreizehn is 13.",
        hint: "One of the tens is spelt differently from all the others.",
      },
      {
        kind: "gap",
        prompt: "Write 67 in words: ___",
        data: {},
        solution: { answers: ["siebenundsechzig"] },
        explanation: "Seven-and-sixty: **siebenundsechzig**. Unit first, one word, no spaces.",
        hint: "Say the small number first.",
      },
      {
        kind: "error",
        prompt: "Correct this number: zwanzigfünf (25)",
        data: {},
        solution: { answers: ["fünfundzwanzig", "fuenfundzwanzig"] },
        explanation: "German goes the other way round: **fünfundzwanzig** — five-and-twenty, written as one word.",
      },
      {
        kind: "choice",
        prompt: "It is 8:30. What do Germans say?",
        data: { options: ["halb acht", "halb neun", "acht halb", "halb nach acht"] },
        solution: { correct: 1 },
        explanation: "German counts **forwards to the next hour**: at 8:30 you are half way to nine, so it is **halb neun**. This one catches almost everybody.",
        hint: "Which hour are you heading towards?",
      },
      {
        kind: "gap",
        prompt: "It is 9:00. Es ist ___ Uhr.",
        data: {},
        solution: { answers: ["neun"] },
        explanation: "Full hours are easy: **Es ist neun Uhr.**",
      },
      {
        kind: "choice",
        prompt: "It is 8:45. What do you say?",
        data: { options: ["Viertel nach acht", "Viertel vor neun", "halb neun", "Viertel vor acht"] },
        solution: { correct: 1 },
        explanation: "**Viertel vor neun** — a quarter before nine. And 8:15 would be *Viertel nach acht*.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: On Monday I learn German.",
        data: { tokens: ["ich", "Am Montag", "Deutsch", "lerne"] },
        solution: { order: ["Am Montag", "lerne", "ich", "Deutsch"], verb: 1 },
        explanation: "**Am Montag** is one single position — position 1. So the verb *lerne* is second and ich moves behind it.",
        hint: "Am Montag counts as one position, not two words.",
      },
      {
        kind: "gap",
        prompt: "Am ___ trinke ich Kaffee. (Sunday)",
        data: {},
        solution: { answers: ["Sonntag", "sonntag"] },
        explanation: "Days take **am**: am **Sonntag**. Note that days are written with a capital letter.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Am Montag ich lerne Deutsch.",
        data: {},
        solution: { answers: ["Am Montag lerne ich Deutsch.", "Am Montag lerne ich Deutsch"] },
        explanation: "A time expression in first place changes nothing about the rule: the verb keeps **second place**. Am Montag *lerne* ich Deutsch.",
        hint: "Remember the verb position.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5) HABEN & SEIN – vertieft die beiden unregelmaessigen Verben.
  //    Beispiele bewusst ohne Artikel im Objekt (Hunger, Zeit, Glueck), damit
  //    kein Akkusativ durch die Hintertuer hereinkommt.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "haben-sein",
    title: "haben and sein",
    subtitle: "The two verbs you need every single day",
    level: "A1",
    lessonId: "german-conjugation-how-german-verbs-chan-z9wd",  // vertieft das Konjugations-Video
    sortOrder: 4,
    theory: [
      "Two verbs turn up in almost every German sentence — and both are **irregular**. The stem-plus-ending trick does not work here. You learn these two by heart, once, and then they carry you for years.",
      "**sein** (to be):\nich *bin* — du *bist* — er/sie/es *ist*\nwir *sind* — ihr *seid* — sie/Sie *sind*",
      "**haben** (to have):\nich *habe* — du *hast* — er/sie/es *hat*\nwir *haben* — ihr *habt* — sie/Sie *haben*",
      "You use **sein** to say what something is or what it is like: Ich *bin* müde. Er *ist* Lehrer. Wir *sind* aus Berlin.",
      "Now the part worth marking: German often uses **haben** where English uses to be.",
      "Ich *habe* Hunger = I **am** hungry\nIch *habe* Durst = I **am** thirsty\nIch *habe* Angst = I **am** afraid\nDu *hast* Recht = You **are** right",
      "Say Ich bin Hunger and a German hears something very strange. With Hunger, Durst, Angst, Glück and Recht it is always **haben**.",
      "And nothing changes about the verb position — these two also stand in second place: Heute *habe* ich Zeit.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "gap",
        prompt: "Ich ___ müde. (sein)",
        data: {},
        solution: { answers: ["bin"] },
        explanation: "**sein** for ich: ich *bin*. You are describing how you are, so it is sein.",
      },
      {
        kind: "gap",
        prompt: "Du ___ Zeit. (haben)",
        data: {},
        solution: { answers: ["hast"] },
        explanation: "**haben** for du: du *hast*.",
      },
      {
        kind: "choice",
        prompt: "Er ___ Lehrer.",
        data: { options: ["hat", "ist", "bin", "sind"] },
        solution: { correct: 1 },
        explanation: "You are saying what he **is**, so it is sein: er *ist* Lehrer.",
      },
      {
        kind: "gap",
        prompt: "Wir ___ Hunger. (haben)",
        data: {},
        solution: { answers: ["haben"] },
        explanation: "**haben** for wir: wir *haben* Hunger — literally we have hunger.",
      },
      {
        kind: "gap",
        prompt: "Ihr ___ nett. (sein)",
        data: {},
        solution: { answers: ["seid"] },
        explanation: "**sein** for ihr: ihr *seid*. Careful — this is the one form people mix up with sind.",
        hint: "It is not sind.",
      },
      {
        kind: "choice",
        prompt: "How do you say I am hungry in German?",
        data: { options: ["Ich bin Hunger.", "Ich habe Hunger.", "Ich bin hungrig sein.", "Ich habe hungrig."] },
        solution: { correct: 1 },
        explanation: "German has hunger instead of being hungry: **Ich habe Hunger.** Same with Durst, Angst, Glück and Recht.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Du bist Durst.",
        data: {},
        solution: { answers: ["Du hast Durst.", "Du hast Durst"] },
        explanation: "Durst goes with **haben**, and du takes *hast*: Du *hast* Durst.",
      },
      {
        kind: "gap",
        prompt: "Sie ___ aus Berlin. (sein — the polite you)",
        data: {},
        solution: { answers: ["sind"] },
        explanation: "The polite **Sie** takes the same form as sie (they): Sie *sind*.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: Today I have time.",
        data: { tokens: ["ich", "Heute", "Zeit", "habe"] },
        solution: { order: ["Heute", "habe", "ich", "Zeit"], verb: 1 },
        explanation: "Heute takes position 1, so *habe* is second and ich moves behind it — exactly the rule from the last unit.",
        hint: "The verb keeps its second place.",
      },
      {
        kind: "gap",
        prompt: "Er ___ Durst. (haben)",
        data: {},
        solution: { answers: ["hat"] },
        explanation: "**haben** for er/sie/es: er *hat*.",
      },
      {
        kind: "choice",
        prompt: "Which sentence is correct?",
        data: { options: ["Ich habe müde.", "Ich bin müde.", "Ich bin Hunger.", "Wir sind Glück."] },
        solution: { correct: 1 },
        explanation: "müde is a description, so it takes **sein**: Ich *bin* müde. Hunger and Glück on the other hand take *haben*.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ihr sind sehr nett.",
        data: {},
        solution: { answers: ["Ihr seid sehr nett.", "Ihr seid sehr nett"] },
        explanation: "**ihr** takes *seid*. Only wir and sie/Sie take *sind*.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6) PLURAL – baut nur auf den Artikeln auf, keine Faelle.
  //    Achtung bei der Aufgabenwahl: Die Antwortpruefung erlaubt einen
  //    Tippfehler, also duerfen Einzahl und Mehrzahl nie nur EINEN Buchstaben
  //    auseinanderliegen (Auto/Autos, Vater/Vaeter) - solche Paare als
  //    Auswahlaufgabe stellen, nicht als Luecke.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "plurals",
    title: "Making nouns plural",
    subtitle: "One article, five patterns",
    level: "A1",
    lessonId: "the-german-articles-der-die-das-2ewc",  // vertieft das Artikel-Video
    sortOrder: 2,
    theory: [
      "The easy half first: in the plural **every noun takes die**. der and das simply disappear.\nder Mann → *die* Männer — das Kind → *die* Kinder — die Frau → *die* Frauen",
      "The other half is the ending, and there are **five patterns**:",
      "**-e**, often with an Umlaut: der Tisch → die Tisch*e*, der Stuhl → die St*ü*hl*e*",
      "**-er**, almost always with an Umlaut: das Buch → die B*ü*ch*er*, das Kind → die Kind*er*",
      "**-(e)n**: die Frau → die Frau*en*, die Blume → die Blume*n*",
      "**-s**, mostly for words that came from other languages: das Auto → die Auto*s*, das Hotel → die Hotel*s*",
      "**no ending at all** for many words ending in -er, -en or -el: der Lehrer → die Lehrer. Sometimes only an Umlaut appears: der Vater → die V*ä*ter.",
      "One rule of thumb that really pays off: **feminine nouns almost always take -n or -en.** That covers a huge part of the vocabulary, including everything ending in -ung, -heit, -keit and -schaft: die Wohnung → die Wohnungen.",
      "For the rest it is the same deal as with the article: **learn the plural together with the word.** In a good dictionary it is written right next to it — der Tisch, -e.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "Which article does a noun take in the plural?",
        data: { options: ["der", "die", "das", "The same one as in the singular"] },
        solution: { correct: 1 },
        explanation: "Always **die** — der and das do not exist in the plural.",
      },
      {
        kind: "gap",
        prompt: "das Buch → die ___",
        data: {},
        solution: { answers: ["Bücher", "Buecher"] },
        explanation: "**-er** plus Umlaut: das Buch → die *Bücher*. This pattern is typical for short neuter words.",
      },
      {
        kind: "gap",
        prompt: "die Frau → die ___",
        data: {},
        solution: { answers: ["Frauen"] },
        explanation: "Feminine nouns almost always take **-n or -en**: die Frau → die *Frauen*.",
      },
      {
        kind: "choice",
        prompt: "das Auto → die ___",
        data: { options: ["Auten", "Autos", "Autoen", "Aute"] },
        solution: { correct: 1 },
        explanation: "Words that came from other languages usually take **-s**: die *Autos*. Same with die Hotels, die Kinos.",
      },
      {
        kind: "gap",
        prompt: "der Lehrer → die ___",
        data: {},
        solution: { answers: ["Lehrer"] },
        explanation: "Words ending in **-er, -en or -el** often stay exactly the same: der Lehrer → die *Lehrer*. Only the article tells you it is plural.",
        hint: "Sometimes nothing changes at all.",
      },
      {
        kind: "choice",
        prompt: "der Stuhl → die ___",
        data: { options: ["Stuhls", "Stuhlen", "Stühle", "Stühler"] },
        solution: { correct: 2 },
        explanation: "**-e** plus Umlaut: die *Stühle*. Very common for masculine nouns.",
      },
      {
        kind: "gap",
        prompt: "das Kind → die ___",
        data: {},
        solution: { answers: ["Kinder"] },
        explanation: "**-er**, here without an Umlaut (i cannot take one): das Kind → die *Kinder*.",
      },
      {
        kind: "error",
        prompt: "Correct this: die Blumes",
        data: {},
        solution: { answers: ["die Blumen", "Die Blumen"] },
        explanation: "Blume is feminine, so it takes **-n**: die *Blumen*. The -s ending is only for foreign words.",
      },
      {
        kind: "choice",
        prompt: "Which group almost always takes -n or -en in the plural?",
        data: { options: ["Masculine nouns", "Feminine nouns", "Neuter nouns", "Foreign words"] },
        solution: { correct: 1 },
        explanation: "**Feminine nouns.** If you know a word is die, you can guess its plural correctly most of the time.",
      },
      {
        kind: "choice",
        prompt: "der Vater → die ___",
        data: { options: ["Vaters", "Vatern", "Väter", "Vätere"] },
        solution: { correct: 2 },
        explanation: "No ending, only an **Umlaut**: der Vater → die *Väter*. Same with der Bruder → die Brüder.",
      },
      {
        kind: "gap",
        prompt: "die Wohnung → die ___",
        data: {},
        solution: { answers: ["Wohnungen"] },
        explanation: "Everything ending in **-ung** is feminine and takes **-en**: die *Wohnungen*.",
      },
      {
        kind: "error",
        prompt: "Correct this: das Bücher",
        data: {},
        solution: { answers: ["die Bücher", "die Buecher", "Die Bücher"] },
        explanation: "Bücher is plural, and the plural always takes **die**: *die* Bücher.",
        hint: "Look at the article, not at the noun.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7) SMALL TALK / FRAGEN – zum Video "How to Do Small Talk in German".
  //    Hier sind Fragen das erste Mal dran. Der Anschluss an die Verbposition
  //    ist der ganze Trick: Aussage = Verb an 2, Ja/Nein-Frage = Verb an 1.
  //    "Wie geht es dir?" wird bewusst als fester Block gelehrt (Dativ kommt
  //    erst in A2).
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "small-talk",
    title: "Asking questions",
    subtitle: "Small talk — and where the verb goes in a question",
    level: "A1",
    lessonId: "how-to-do-small-talk-in-german-cnzx",
    lessonMatch: "small talk",
    sortOrder: 7,
    theory: [
      "You already know the rule for statements: the verb stands in **second place**. A question changes exactly one thing — where the verb goes. Nothing else.",
      "There are two kinds. First the **W-questions**, the ones that ask for information. The W-word takes position 1, and the verb stays exactly where it was — **second**:",
      "@Woher|kommst*|du\n@Wie|heißt*|du\n@Wo|wohnst*|du",
      "The W-words worth knowing now: **wer** (who), **was** (what), **wo** (where), **woher** (where from), **wohin** (where to), **wann** (when), **wie** (how), **warum** (why).",
      "Second: the **yes/no questions**. There is no W-word, so position 1 is free — and the **verb jumps into it**:",
      "@Kommst*|du aus Berlin\n@Lernst*|du Deutsch",
      "That is the whole system. Verb in **second** place = statement. Verb in **first** place = yes/no question. You answer those with Ja or Nein.",
      "The five that carry almost every first conversation:\n**Wie heißt du?** — What is your name?\n**Woher kommst du?** — Where are you from?\n**Wo wohnst du?** — Where do you live?\n**Was machst du?** — What do you do?\n**Wie geht es dir?** — How are you?",
      "Two notes. With people you do not know you use the polite **Sie**: Wie heißen *Sie*? Woher kommen *Sie*? And **Wie geht es dir?** is best learnt as one fixed block — the grammar inside it comes later, in A2.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "In a W-question (Woher kommst du?), where does the verb stand?",
        data: { options: ["In first place", "In second place", "At the end", "It disappears"] },
        solution: { correct: 1 },
        explanation: "The W-word takes position 1, so the verb keeps its usual **second place**: Woher *kommst* du?",
      },
      {
        kind: "choice",
        prompt: "In a yes/no question (Lernst du Deutsch?), where does the verb stand?",
        data: { options: ["In first place", "In second place", "At the end", "Behind the subject"] },
        solution: { correct: 0 },
        explanation: "No W-word means position 1 is free — the **verb moves into first place**: *Lernst* du Deutsch?",
      },
      {
        kind: "order",
        prompt: "Build the question: Where do you come from?",
        data: { tokens: ["kommst", "Woher", "du"] },
        solution: { order: ["Woher", "kommst", "du"], verb: 1 },
        explanation: "W-word first, verb second, subject third: Woher *kommst* du?",
        hint: "The verb keeps its second place.",
      },
      {
        kind: "order",
        prompt: "Build the yes/no question: Do you learn German?",
        data: { tokens: ["Deutsch", "Lernst", "du"] },
        solution: { order: ["Lernst", "du", "Deutsch"], verb: 0 },
        explanation: "Without a W-word the verb takes **first place**: *Lernst* du Deutsch? Compare the statement: Du *lernst* Deutsch.",
        hint: "Nothing stands in front of the verb here.",
      },
      {
        kind: "gap",
        prompt: "___ heißt du? (you want to know his or her name)",
        data: {},
        solution: { answers: ["Wie"] },
        explanation: "German asks **wie** (how), not was: *Wie* heißt du?",
        hint: "Not what — Germans ask it differently.",
      },
      {
        kind: "gap",
        prompt: "___ wohnst du? (you want to know the city)",
        data: {},
        solution: { answers: ["Wo"] },
        explanation: "**wo** asks for a place: *Wo* wohnst du? — In Hamburg.",
      },
      {
        kind: "error",
        prompt: "Correct this question: Woher du kommst?",
        data: {},
        solution: { answers: ["Woher kommst du?", "Woher kommst du"] },
        explanation: "Woher takes position 1, so the verb must follow immediately: Woher *kommst* du? The subject moves behind it — exactly like in a statement.",
        hint: "What has to come second?",
      },
      {
        kind: "error",
        prompt: "Turn this into a proper question: Du lernst Deutsch?",
        data: {},
        solution: { answers: ["Lernst du Deutsch?", "Lernst du Deutsch"] },
        explanation: "For a yes/no question the **verb goes to the front**: *Lernst* du Deutsch? Just raising your voice at the end is not enough in German.",
      },
      {
        kind: "choice",
        prompt: "Which W-word asks for a reason?",
        data: { options: ["Wann", "Wohin", "Warum", "Wer"] },
        solution: { correct: 2 },
        explanation: "**warum** = why. Wann is when, wohin is where to, wer is who.",
      },
      {
        kind: "gap",
        prompt: "Polite form: ___ heißen Sie?",
        data: {},
        solution: { answers: ["Wie"] },
        explanation: "Same W-word, only the polite **Sie** and its verb form change: *Wie* heißen Sie?",
      },
      {
        kind: "choice",
        prompt: "What does Wie geht es dir? mean?",
        data: { options: ["What is your name?", "How are you?", "Where do you live?", "How old are you?"] },
        solution: { correct: 1 },
        explanation: "**How are you?** Learn it as one fixed block — the grammar inside it comes in A2. Polite version: Wie geht es Ihnen?",
      },
      {
        kind: "order",
        prompt: "Build the question: When do you learn German?",
        data: { tokens: ["du", "Wann", "Deutsch", "lernst"] },
        solution: { order: ["Wann", "lernst", "du", "Deutsch"], verb: 1 },
        explanation: "Wann in position 1, verb *lernst* second, then the subject: Wann lernst du Deutsch?",
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // A2 – ab hier eigene Kette. Die Sperre gilt nur innerhalb eines Levels,
  // niemand muss also erst ganz A1 abschliessen.
  // ═════════════════════════════════════════════════════════════════════════

  // 20) MODALVERBEN – zum Video "German Modal Verbs".
  {
    slug: "modal-verbs",
    title: "Modal verbs",
    subtitle: "können, müssen, wollen — and where the second verb goes",
    level: "A2",
    lessonId: "german-modal-verbs-6i5p",
    lessonMatch: "modal verbs",
    sortOrder: 20,
    theory: [
      "Modal verbs do not describe an action. They say **how you stand towards an action**: whether you can do it, have to do it, want to do it, are allowed to do it.",
      "**können** (can, be able to) — **müssen** (must, have to) — **wollen** (want to)\n**dürfen** (be allowed to) — **sollen** (be supposed to) — **möchten** (would like to)",
      "They are irregular, and in a way that catches everyone: the vowel changes in the singular, and **ich and er/sie/es have exactly the same form — both without an ending**.",
      "ich *kann* — du *kannst* — er/sie/es *kann*\nwir *können* — ihr *könnt* — sie/Sie *können*",
      "So er *kannt* does not exist. Neither does ich *könne*. This one form covers both ich and er.",
      "Now the part that changes your sentences. A modal verb never works alone — there is a second verb, and that one goes **to the very end, unchanged, as the infinitive**:",
      "@Ich|kann*|heute nicht|kommen",
      "@Wir|müssen*|morgen|arbeiten",
      "The modal verb sits in **second place** like any conjugated verb. The rest of the sentence goes in the middle, and the infinitive closes it. Germans call that the **Satzklammer** — the sentence bracket.",
      "One pair is worth learning as a warning. **nicht müssen** and **nicht dürfen** are not the same thing at all:\nDu *musst* nicht kommen = you **don't have to** come (it is fine either way)\nDu *darfst* nicht kommen = you **must not** come (it is forbidden)",
    ].join("\n\n"),
    exercises: [
      {
        kind: "gap",
        prompt: "Ich ___ gut Deutsch sprechen. (können)",
        data: {},
        solution: { answers: ["kann"] },
        explanation: "**ich** takes the bare form: ich *kann* — no ending at all.",
      },
      {
        kind: "gap",
        prompt: "Er ___ heute arbeiten. (müssen)",
        data: {},
        solution: { answers: ["muss"] },
        explanation: "**er/sie/es** takes the same form as ich: er *muss*. No -t.",
        hint: "It is not musst.",
      },
      {
        kind: "choice",
        prompt: "Which form is correct?",
        data: { options: ["Er kannt schwimmen.", "Er kann schwimmen.", "Er könnt schwimmen.", "Er kannst schwimmen."] },
        solution: { correct: 1 },
        explanation: "Modal verbs take **no ending** in er/sie/es: er *kann*. This is the mistake almost everyone makes first.",
      },
      {
        kind: "order",
        prompt: "Build the sentence: I have to work today.",
        data: { tokens: ["arbeiten", "Ich", "heute", "muss"] },
        solution: { order: ["Ich", "muss", "heute", "arbeiten"], verb: 1 },
        explanation: "Modal verb second, everything else in the middle, and the infinitive *arbeiten* right at the **end**.",
        hint: "Where does the second verb go?",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich kann nicht kommen morgen.",
        data: {},
        solution: { answers: ["Ich kann morgen nicht kommen.", "Ich kann morgen nicht kommen"] },
        explanation: "The infinitive has to be **last** — nothing comes after it. Time information goes in the middle: Ich kann morgen nicht *kommen*.",
        hint: "Something is standing behind the infinitive.",
      },
      {
        kind: "gap",
        prompt: "Wir ___ ins Kino gehen. (wollen)",
        data: {},
        solution: { answers: ["wollen"] },
        explanation: "**wir** takes -en, and there the vowel comes back: wir *wollen*.",
      },
      {
        kind: "choice",
        prompt: "Your friend says: Du musst nicht kommen. What does that mean?",
        data: { options: ["You are not allowed to come", "You don't have to come", "You should not come", "You cannot come"] },
        solution: { correct: 1 },
        explanation: "**nicht müssen** = you don't have to. If it were forbidden, he would say Du *darfst* nicht kommen.",
        hint: "This is not about permission.",
      },
      {
        kind: "gap",
        prompt: "___ ich hier rauchen? (dürfen — you are asking for permission)",
        data: {},
        solution: { answers: ["Darf"] },
        explanation: "**dürfen** asks for permission, and in a yes/no question the verb goes first: *Darf* ich hier rauchen?",
      },
      {
        kind: "order",
        prompt: "Build the sentence: Today I would like to learn German.",
        data: { tokens: ["lernen", "Heute", "ich", "Deutsch", "möchte"] },
        solution: { order: ["Heute", "möchte", "ich", "Deutsch", "lernen"], verb: 1 },
        explanation: "Heute in position 1, the modal verb *möchte* second, subject behind it — and *lernen* still closes the sentence.",
      },
      {
        kind: "gap",
        prompt: "Du ___ mehr schlafen. (sollen — your doctor says so)",
        data: {},
        solution: { answers: ["sollst"] },
        explanation: "**sollen** means someone else expects it of you: du *sollst*.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich muss nach Hause gehe.",
        data: {},
        solution: { answers: ["Ich muss nach Hause gehen.", "Ich muss nach Hause gehen"] },
        explanation: "The second verb stays in the **infinitive** — it is never conjugated: Ich muss nach Hause *gehen*.",
      },
      {
        kind: "choice",
        prompt: "Which sentence says that something is forbidden?",
        data: { options: ["Du musst nicht rauchen.", "Du darfst nicht rauchen.", "Du willst nicht rauchen.", "Du kannst nicht rauchen."] },
        solution: { correct: 1 },
        explanation: "**nicht dürfen** = must not, forbidden. Compare: nicht müssen just means it is not necessary.",
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // B1
  // ═════════════════════════════════════════════════════════════════════════

  // 40) RELATIVSAETZE – zum Video "German Relative Clauses".
  //     Zuschnitt: Nominativ, Akkusativ und Dativ ohne Praeposition.
  //     Praepositionale Relativsaetze ("der Mann, mit dem ich spreche") und
  //     der Genitiv (dessen/deren) gehoeren in ein eigenes Modul.
  {
    slug: "relative-clauses",
    title: "Relative clauses",
    subtitle: "der, den, dem — and why the verb goes to the end",
    level: "B1",
    lessonId: "relative-clauses-a-way-to-give-me-info-sfhs",
    lessonMatch: "relative clauses",
    sortOrder: 40,
    theory: [
      "A relative clause lets you describe a noun instead of starting a new sentence. Two short sentences — Das ist der Mann. Er steht dort. — become one: **Das ist der Mann, der dort steht.**",
      "The good news: the relative pronoun looks almost exactly like the definite article you already know. The whole difficulty sits in one question — **which form do I pick?** And that is decided by **two separate things**:",
      "**1. Gender and number come from the noun in front of the comma.**\nder Mann → der/den/dem · die Frau → die/die/der · das Kind → das/das/dem · plural → die/die/denen",
      "**2. The case comes from the job the pronoun does inside the relative clause** — not from the noun in front. This is the step almost everyone skips.",
      "Same noun, three different pronouns, because the job changes each time:",
      "Das ist der Mann, *der* dort steht. — he **is** the one standing, so subject → **Nominativ**\nDas ist der Mann, *den* ich kenne. — I know **him**, so direct object → **Akkusativ**\nDas ist der Mann, *dem* ich helfe. — helfen takes an indirect object → **Dativ**",
      "The full table:\nNominativ: **der · die · das · die**\nAkkusativ: **den · die · das · die**\nDativ: **dem · der · dem · denen**",
      "Only two forms are genuinely new: *den* and *denen*. The rest you already say every day.",
      "**3. The verb goes to the end.** A relative clause is a subordinate clause, so the conjugated verb closes it:",
      "@der Mann,|der|dort|steht*",
      "@die Frau,|die|ich|kenne*",
      "And there is always a **comma** in front. One more thing English speakers forget: English can drop the pronoun — the man I know. German **never** can. Der Mann, *den* ich kenne.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "In a relative clause, where does the conjugated verb stand?",
        data: { options: ["In second place", "In first place", "At the very end", "Directly after the pronoun"] },
        solution: { correct: 2 },
        explanation: "A relative clause is a subordinate clause, so the verb goes **to the end**: der Mann, der dort *steht*.",
      },
      {
        kind: "gap",
        prompt: "Das ist der Mann, ___ dort steht.",
        data: {},
        solution: { answers: ["der"] },
        explanation: "The man is the one doing the standing — subject, so **Nominativ**: der Mann, *der* dort steht.",
      },
      {
        kind: "gap",
        prompt: "Das ist der Mann, ___ ich kenne.",
        data: {},
        solution: { answers: ["den"] },
        explanation: "I know **him** — direct object, so **Akkusativ**: der Mann, *den* ich kenne. Same noun as before, different job, different pronoun.",
        hint: "Who is doing the knowing here?",
      },
      {
        kind: "gap",
        prompt: "Das ist die Frau, ___ dort steht.",
        data: {},
        solution: { answers: ["die"] },
        explanation: "Feminine and subject: die Frau, *die* dort steht.",
      },
      {
        kind: "gap",
        prompt: "Das ist das Buch, ___ ich lese.",
        data: {},
        solution: { answers: ["das"] },
        explanation: "Neuter, and this time it is the object — but for **das** Nominativ and Akkusativ look identical: das Buch, *das* ich lese.",
      },
      {
        kind: "choice",
        prompt: "Where do the gender and number of the relative pronoun come from?",
        data: { options: ["From the noun in front of the comma", "From the verb in the relative clause", "From the subject of the relative clause", "They are always die"] },
        solution: { correct: 0 },
        explanation: "**From the noun in front.** der Mann → a der-form, die Frau → a die-form, no matter what happens inside the clause.",
      },
      {
        kind: "choice",
        prompt: "And where does the CASE come from?",
        data: { options: ["Also from the noun in front", "From the job the pronoun does inside the relative clause", "It is always Nominativ", "From the main clause verb"] },
        solution: { correct: 1 },
        explanation: "**From inside the relative clause.** Subject → Nominativ, direct object → Akkusativ, indirect object → Dativ. This is the whole trick.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Das ist der Mann, der ich kenne.",
        data: {},
        solution: { answers: ["Das ist der Mann, den ich kenne.", "Das ist der Mann, den ich kenne"] },
        explanation: "Inside the clause **ich** is the subject and the man is the object — so it needs the Akkusativ form *den*, not der.",
        hint: "Who knows whom?",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Das ist der Mann, der steht dort.",
        data: {},
        solution: { answers: ["Das ist der Mann, der dort steht.", "Das ist der Mann, der dort steht"] },
        explanation: "The pronoun is right, but the verb has to go **to the end**: der Mann, der dort *steht*.",
      },
      {
        kind: "gap",
        prompt: "Das sind die Kinder, ___ dort spielen.",
        data: {},
        solution: { answers: ["die"] },
        explanation: "Plural and subject: die Kinder, *die* dort spielen. In the plural Nominativ and Akkusativ are both **die** — only the Dativ is different (*denen*).",
      },
      {
        kind: "gap",
        prompt: "Das ist der Mann, ___ ich helfe. (helfen takes the Dativ)",
        data: {},
        solution: { answers: ["dem"] },
        explanation: "helfen always takes a **Dativ** object, so the pronoun follows: der Mann, *dem* ich helfe. In the plural this would be *denen*.",
        hint: "Which case does helfen ask for?",
      },
      {
        kind: "order",
        prompt: "Build the relative clause: the woman I know",
        data: { tokens: ["kenne", "die Frau,", "ich", "die"] },
        solution: { order: ["die Frau,", "die", "ich", "kenne"], verb: 3 },
        explanation: "Noun, comma, pronoun (*die* — feminine, Akkusativ), subject, and the verb *kenne* closes it. In English you could leave the pronoun out — in German never.",
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // B2 – hierzu gibt es (noch) KEIN Video. Erstes reines Trainingsmodul.
  // ═════════════════════════════════════════════════════════════════════════

  // 60) KONNEKTOREN – sortiert nach dem, was sie mit dem Verb machen.
  //     Genau das ist der Punkt, an dem Lernende jahrelang haengenbleiben.
  {
    slug: "connectors",
    title: "Connectors",
    subtitle: "weil, deshalb, denn — three groups, three word orders",
    level: "B2",
    lessonId: null,
    sortOrder: 60,
    theory: [
      "Most people learn connectors as vocabulary: weil = because, deshalb = therefore. That is why they keep getting the word order wrong. The meaning is the easy part — what matters is **what each connector does to the verb**.",
      "There are exactly **three groups**. Learn which group a word belongs to, and you never have to think about it again.",
      "**Group 1 — the connector stands outside the sentence.**\n*und · aber · oder · denn · sondern*\nNothing changes at all. Behind them comes a completely normal sentence with the verb in second place:",
      "Ich bleibe zu Hause, **denn** ich *bin* müde.\nIch lerne Deutsch, **aber** es *ist* schwer.",
      "**Group 2 — the connector takes position 1.**\n*deshalb · deswegen · darum · trotzdem · dann · danach · außerdem · sonst*\nThey fill the first position themselves, so the verb has to follow **immediately** — and the subject moves behind it:",
      "@deshalb|bleibe*|ich|zu Hause",
      "**Group 3 — the connector sends the verb to the end.**\n*weil · obwohl · dass · wenn · damit · während · nachdem · bevor · falls · seitdem*\nThese open a subordinate clause, and there the conjugated verb closes the sentence:",
      "@weil|ich|müde|bin*",
      "Now the pairs that cause the real trouble, because they mean the same thing but live in different groups:",
      "**denn** and **weil** both mean because.\nIch bleibe zu Hause, *denn* ich **bin** müde. (group 1 — normal)\nIch bleibe zu Hause, *weil* ich müde **bin**. (group 3 — verb last)",
      "**obwohl** and **trotzdem** both mean although / nevertheless.\nIch arbeite, *obwohl* ich müde **bin**. (group 3 — verb last)\nIch bin müde, *trotzdem* **arbeite** ich. (group 2 — verb straight after)",
      "And watch the direction: **weil** introduces the **reason**, **deshalb** introduces the **consequence**. Ich bin müde, *deshalb* bleibe ich zu Hause. — Ich bleibe zu Hause, *weil* ich müde bin. Same situation, opposite order.",
    ].join("\n\n"),
    exercises: [
      {
        kind: "choice",
        prompt: "What does weil do to the verb?",
        data: { options: ["Nothing — the verb stays second", "It sends the verb to the end", "It puts the verb first", "It removes the subject"] },
        solution: { correct: 1 },
        explanation: "**weil** opens a subordinate clause, so the conjugated verb goes **to the end**: weil ich müde *bin*.",
      },
      {
        kind: "choice",
        prompt: "And what does deshalb do?",
        data: { options: ["It sends the verb to the end", "Nothing — the verb stays second", "It takes position 1, so the verb comes straight after", "It always needs a comma and nothing else"] },
        solution: { correct: 2 },
        explanation: "**deshalb** occupies position 1 itself, so the verb follows immediately and the subject moves behind it: deshalb *bleibe* ich zu Hause.",
      },
      {
        kind: "choice",
        prompt: "What happens after denn?",
        data: { options: ["The verb goes to the end", "A completely normal sentence — verb in second place", "The verb comes first", "The subject disappears"] },
        solution: { correct: 1 },
        explanation: "**denn** stands outside the sentence and changes nothing: denn ich *bin* müde.",
      },
      {
        kind: "order",
        prompt: "Build the clause: ... because I am tired.",
        data: { tokens: ["bin", "weil", "müde", "ich"] },
        solution: { order: ["weil", "ich", "müde", "bin"], verb: 3 },
        explanation: "After **weil** the verb closes the clause: weil ich müde *bin*.",
        hint: "Group 3 — where does the verb end up?",
      },
      {
        kind: "order",
        prompt: "Build the clause: ... therefore I am staying at home.",
        data: { tokens: ["ich", "deshalb", "zu Hause", "bleibe"] },
        solution: { order: ["deshalb", "bleibe", "ich", "zu Hause"], verb: 1 },
        explanation: "**deshalb** is position 1, so *bleibe* is second and ich moves behind it.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich bleibe zu Hause, weil ich bin müde.",
        data: {},
        solution: { answers: ["Ich bleibe zu Hause, weil ich müde bin.", "Ich bleibe zu Hause, weil ich müde bin"] },
        explanation: "After **weil** the verb has to go last: weil ich müde *bin*. If you want to keep the normal order, use *denn* instead.",
        hint: "Which group does weil belong to?",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich bin müde, trotzdem ich arbeite.",
        data: {},
        solution: { answers: ["Ich bin müde, trotzdem arbeite ich.", "Ich bin müde, trotzdem arbeite ich"] },
        explanation: "**trotzdem** is group 2, not group 3. It takes position 1, so the verb follows straight away: trotzdem *arbeite* ich. The one that sends the verb to the end is *obwohl*.",
      },
      {
        kind: "gap",
        prompt: "Ich bleibe zu Hause, ___ ich müde bin. (the verb is at the end — which connector fits?)",
        data: {},
        solution: { answers: ["weil"] },
        explanation: "The verb *bin* sits at the end, so it must be a group 3 connector: **weil**.",
      },
      {
        kind: "gap",
        prompt: "Ich bin müde, ___ bleibe ich zu Hause. (this part gives the consequence)",
        data: {},
        solution: { answers: ["deshalb", "deswegen", "darum"] },
        explanation: "The verb comes straight after the connector, so it is group 2: **deshalb** (or deswegen, darum). weil would not work here — that one introduces the reason, not the consequence.",
      },
      {
        kind: "choice",
        prompt: "Which connector means the same as weil but leaves the word order alone?",
        data: { options: ["obwohl", "denn", "deshalb", "damit"] },
        solution: { correct: 1 },
        explanation: "**denn** — same meaning as weil, but a completely normal sentence behind it. This is the easiest way out when the verb-last order is not coming to you.",
      },
      {
        kind: "choice",
        prompt: "obwohl and trotzdem mean the same thing. Which one sends the verb to the end?",
        data: { options: ["trotzdem", "obwohl", "Both of them", "Neither of them"] },
        solution: { correct: 1 },
        explanation: "**obwohl** is group 3 (verb last), *trotzdem* is group 2 (position 1). Same meaning, opposite behaviour.",
      },
      {
        kind: "error",
        prompt: "Correct this sentence: Ich lerne Deutsch, denn will ich in Deutschland arbeiten.",
        data: {},
        solution: { answers: ["Ich lerne Deutsch, denn ich will in Deutschland arbeiten.", "Ich lerne Deutsch, denn ich will in Deutschland arbeiten"] },
        explanation: "**denn** stands outside the sentence — it does **not** take position 1. So a normal sentence follows: denn *ich will* in Deutschland arbeiten. That word order belongs to *deshalb*.",
        hint: "denn is group 1, not group 2.",
      },
    ],
  },
];
