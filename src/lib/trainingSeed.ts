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
    sortOrder: 2,
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
    sortOrder: 3,
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
    sortOrder: 4,
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
    lessonId: null,
    lessonMatch: "haben",
    sortOrder: 5,
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
    lessonId: null,
    lessonMatch: "plural",
    sortOrder: 6,
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
        prompt: "Correct this sentence: Das Bücher sind neu.",
        data: {},
        solution: { answers: ["Die Bücher sind neu.", "Die Buecher sind neu.", "Die Bücher sind neu"] },
        explanation: "Bücher is plural, and the plural always takes **die**: *Die* Bücher sind neu.",
        hint: "Look at the article, not at the noun.",
      },
    ],
  },
];
