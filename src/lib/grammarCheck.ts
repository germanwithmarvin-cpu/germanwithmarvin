"use client";

import { createClient } from "@/lib/supabase/client";

// Grammatik-Check: findet Schwachstellen und schickt gezielt in die passende
// Trainings-Einheit.
//
// Bewusst anders als der Vokabeltest unter /exam: der schaetzt das Level,
// dieser findet THEMEN. Beides zusammen ergibt ein Bild.
//
// Aufbau: 28 Themen mal 6 Fragen (>=6, damit ein Fluechtigkeitsfehler keine
// Schwaeche vortaeuscht). Alles Auswahlfragen. Der komplette Check nutzt alle,
// die Reife-Tests ("Am I ready for X?") filtern per Level (questionsFor).
//
// `unit` ist der Slug der Trainings-Einheit. Aendert sich dort ein Slug, muss
// er hier mitgeaendert werden - sonst zeigt das Ergebnis ins Leere.

export type CheckQuestion = {
  unit: string;
  level: string;
  topic: string;
  prompt: string;
  options: string[];
  correct: number;
};

export const CHECK_QUESTIONS: CheckQuestion[] = [
  // ── A1 · Artikel ─────────────────────────────────────────────────────────
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "___ Mädchen ist meine Schwester.",
    options: ["Der", "Die", "Das", "Den"], correct: 2 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "Which article does every noun take in the plural?",
    options: ["der", "die", "das", "the same as in the singular"], correct: 1 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "___ Wohnung ist groß.",
    options: ["Der", "Die", "Das", "Dem"], correct: 1 },

  // ── A1 · Verbposition ────────────────────────────────────────────────────
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Heute ich lerne Deutsch.", "Heute lerne ich Deutsch.", "Heute Deutsch ich lerne.", "Ich heute lerne Deutsch."], correct: 1 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "In a German statement, the conjugated verb stands…",
    options: ["in first place", "in second place", "at the end", "anywhere"], correct: 1 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Morgen trinke ich Kaffee.", "Morgen ich trinke Kaffee.", "Morgen trinken ich Kaffee.", "Ich morgen trinke Kaffee."], correct: 0 },

  // ── A1 · Verneinung ──────────────────────────────────────────────────────
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Das ist ___ Buch.",
    options: ["nicht ein", "kein", "keine", "nicht"], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Which sentence is correct?",
    options: ["Ich habe nicht Zeit.", "Ich habe keine Zeit.", "Ich habe kein Zeit.", "Ich habe nicht eine Zeit."], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Ich arbeite heute ___ .",
    options: ["kein", "keine", "nicht", "nichts"], correct: 2 },

  // ── A1 · Vokalwechsel ────────────────────────────────────────────────────
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Er ___ nach Berlin. (fahren)",
    options: ["fahrt", "fährt", "fahren", "fahre"], correct: 1 },
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Er ___ einen Apfel. (essen)",
    options: ["esst", "isst", "esset", "est"], correct: 1 },
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Which form is correct?",
    options: ["er sprecht Deutsch", "er spricht Deutsch", "er spracht Deutsch", "er sprichtet Deutsch"], correct: 1 },

  // ── A1 · Datum ───────────────────────────────────────────────────────────
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "Write the ordinal: 3 → der ___",
    options: ["dreite", "dritte", "drittte", "dreitte"], correct: 1 },
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "Ich komme ___ ersten Mai. (on that day)",
    options: ["an", "am", "in", "zu"], correct: 1 },
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "How do you say the year 1990?",
    options: ["neunzehn neunzig", "neunzehnhundertneunzig", "eintausendneunhundertneunzig", "neunzig hundert"], correct: 1 },

  // ── A2 · Fälle ───────────────────────────────────────────────────────────
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Ich sehe ___ Mann.",
    options: ["der", "den", "dem", "des"], correct: 1 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Ich helfe ___ Mann.",
    options: ["der", "den", "dem", "des"], correct: 2 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Der Mann gibt der Frau das Buch. Which case is der Frau?",
    options: ["Nominativ", "Akkusativ", "Dativ", "Genitiv"], correct: 2 },

  // ── A2 · Objektpronomen ──────────────────────────────────────────────────
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Ich sehe den Mann. → Ich sehe ___ .",
    options: ["er", "ihn", "ihm", "sein"], correct: 1 },
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Ich helfe dem Mann. → Ich helfe ___ .",
    options: ["ihn", "ihm", "er", "sein"], correct: 1 },
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Kannst du ___ helfen? (me)",
    options: ["mich", "mir", "ich", "mein"], correct: 1 },

  // ── A2 · Grundpräpositionen ──────────────────────────────────────────────
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Ich fahre mit ___ Auto.",
    options: ["der", "den", "dem", "das"], correct: 2 },
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Das Geschenk ist für ___ Mann.",
    options: ["der", "den", "dem", "des"], correct: 1 },
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Which preposition always takes the dative?",
    options: ["für", "ohne", "mit", "um"], correct: 2 },

  // ── A2 · Perfekt ─────────────────────────────────────────────────────────
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Wir ___ nach Berlin gefahren.",
    options: ["haben", "sind", "waren", "hatten"], correct: 1 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "What is the Partizip II of aufstehen?",
    options: ["gestanden auf", "aufstanden", "aufgestanden", "geaufstanden"], correct: 2 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Which sentence is correct?",
    options: ["Ich habe ein Buch gelesen.", "Ich bin ein Buch gelesen.", "Ich habe ein Buch lesen.", "Ich habe gelesen ein Buch."], correct: 0 },

  // ── A2 · Präteritum ──────────────────────────────────────────────────────
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "gehen → er ___ (Präteritum)",
    options: ["gehte", "ging", "gang", "gingt"], correct: 1 },
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "machen → ich ___ (Präteritum)",
    options: ["machte", "machtete", "mochte", "macht"], correct: 0 },
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "Which sentence uses the Präteritum correctly?",
    options: ["Er gingt nach Hause.", "Er ging nach Hause.", "Er gehte nach Hause.", "Er gegangen nach Hause."], correct: 1 },

  // ── A2 · Trennbare Verben ────────────────────────────────────────────────
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which sentence is correct?",
    options: ["Ich aufstehe um sieben.", "Ich stehe um sieben auf.", "Ich stehe auf um sieben.", "Auf ich stehe um sieben."], correct: 1 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which of these verbs does NOT separate?",
    options: ["ankommen", "einkaufen", "verstehen", "mitkommen"], correct: 2 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which sentence is correct?",
    options: ["Ich muss um sieben aufstehen.", "Ich muss um sieben stehe auf.", "Ich muss auf um sieben stehen.", "Ich aufstehen muss um sieben."], correct: 0 },

  // ── A2 · Nebensätze ──────────────────────────────────────────────────────
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Which sentence is correct?",
    options: ["Ich bleibe zu Hause, weil ich bin müde.", "Ich bleibe zu Hause, weil ich müde bin.", "Ich bleibe zu Hause, weil bin ich müde.", "Ich bleibe zu Hause, weil müde ich bin."], correct: 1 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "___ ich zehn war, wohnte ich in Berlin. (one single time in the past)",
    options: ["Wenn", "Als", "Ob", "Dass"], correct: 1 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Weil ich müde bin, ___ ich zu Hause.",
    options: ["bleibe", "bleiben", "ich bleibe", "bleibt"], correct: 0 },

  // ── A2 · Nebensatz mit Modalverb ─────────────────────────────────────────
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Which sentence is correct?",
    options: ["…, weil ich nicht kommen kann.", "…, weil ich kann nicht kommen.", "…, weil ich nicht kann kommen.", "…, weil kann ich nicht kommen."], correct: 0 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "In a subordinate clause with a modal verb, which verb comes last?",
    options: ["the infinitive", "the modal verb", "either one", "the subject"], correct: 1 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Ich hoffe, dass du morgen kommen ___ .",
    options: ["kann", "kannst", "können", "könnt"], correct: 1 },

  // ── B1 · Adjektivendungen ────────────────────────────────────────────────
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Das ist ein ___ Wagen. (neu)",
    options: ["neue", "neuer", "neues", "neuen"], correct: 1 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich sehe den ___ Film. (gut)",
    options: ["gute", "guter", "gutes", "guten"], correct: 3 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich trinke ___ Wasser. (kalt, no article)",
    options: ["kalte", "kaltes", "kalter", "kaltem"], correct: 1 },

  // ── B1 · Relativsätze ────────────────────────────────────────────────────
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Das ist der Mann, ___ ich kenne.",
    options: ["der", "den", "dem", "das"], correct: 1 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Where does the case of the relative pronoun come from?",
    options: ["from the noun in front", "from its job inside the relative clause", "it is always Nominativ", "from the main verb"], correct: 1 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Which sentence is correct?",
    options: ["Das ist die Frau, die dort steht.", "Das ist die Frau, die steht dort.", "Das ist die Frau, der dort steht.", "Das ist die Frau, dass dort steht."], correct: 0 },

  // ── B1 · Infinitiv mit zu ────────────────────────────────────────────────
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Ich versuche, Deutsch ___ lernen.",
    options: ["zu", "zum", "um", "für"], correct: 0 },
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Which sentence is correct?",
    options: ["Ich muss zu lernen.", "Ich muss lernen.", "Ich muss zu lerne.", "Ich muss am lernen."], correct: 1 },
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Ich habe vor, früh ___ . (aufstehen)",
    options: ["zu aufstehen", "aufzustehen", "aufstehen zu", "zu aufstehe"], correct: 1 },

  // ── B1 · Plusquamperfekt ─────────────────────────────────────────────────
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Ich ___ gegessen. (I had eaten)",
    options: ["habe", "hatte", "war", "bin"], correct: 1 },
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Ich ___ nach Berlin gefahren. (I had driven)",
    options: ["hatte", "war", "habe", "bin"], correct: 1 },
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Nachdem ich gegessen ___ , ging ich spazieren.",
    options: ["habe", "hatte", "bin", "war"], correct: 1 },

  // ── B2 · Konnektoren ─────────────────────────────────────────────────────
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Ich bin müde, ___ bleibe ich zu Hause.",
    options: ["weil", "deshalb", "obwohl", "dass"], correct: 1 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Which sentence is correct?",
    options: ["Ich bin müde, trotzdem ich arbeite.", "Ich bin müde, trotzdem arbeite ich.", "Ich bin müde, trotzdem ich arbeite nicht.", "Trotzdem ich müde bin, arbeite."], correct: 1 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Which connector means the same as weil but leaves the word order alone?",
    options: ["obwohl", "denn", "deshalb", "damit"], correct: 1 },

  // ═══ Zusatzfragen fuer die Reife-Tests (mehr Themenabdeckung je Level) ═══

  // ── A1 · Verb endings (present tense) ────────────────────────────────────
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Du ___ Deutsch. (lernen)",
    options: ["lerne", "lernst", "lernt", "lernen"], correct: 1 },
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Wir ___ Fußball. (spielen)",
    options: ["spielt", "spielst", "spielen", "spiele"], correct: 2 },
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Er ___ in Berlin. (wohnen)",
    options: ["wohne", "wohnst", "wohnt", "wohnen"], correct: 2 },

  // ── A1 · haben and sein ──────────────────────────────────────────────────
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Ich ___ Hunger. (haben)",
    options: ["habe", "hast", "hat", "haben"], correct: 0 },
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Du ___ müde. (sein)",
    options: ["bin", "bist", "ist", "sind"], correct: 1 },
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Wir ___ Studenten. (sein)",
    options: ["seid", "sind", "ist", "bin"], correct: 1 },

  // ── A1 · Plurals ─────────────────────────────────────────────────────────
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "One Kind, two ___ ?",
    options: ["Kinds", "Kinder", "Kinden", "Kindes"], correct: 1 },
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "The plural of das Auto is…",
    options: ["Autos", "Auten", "Autoe", "Autör"], correct: 0 },
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "The plural of die Frau is…",
    options: ["Frauen", "Fraus", "Fräue", "Frauer"], correct: 0 },

  // ── A1 · Asking questions ────────────────────────────────────────────────
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "___ heißt du?",
    options: ["Wie", "Wo", "Was", "Wann"], correct: 0 },
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "___ kommst du? (from where)",
    options: ["Wie", "Woher", "Wohin", "Wann"], correct: 1 },
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "Which is a correct question?",
    options: ["Du wohnst wo?", "Wo wohnst du?", "Wo du wohnst?", "Wohnst wo du?"], correct: 1 },

  // ── A2 · Modal verbs ─────────────────────────────────────────────────────
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "Ich ___ heute arbeiten. (müssen)",
    options: ["muss", "musst", "müssen", "müsst"], correct: 0 },
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "Which sentence is correct?",
    options: ["Ich kann Deutsch sprechen.", "Ich kann sprechen Deutsch.", "Ich kann Deutsch spreche.", "Ich Deutsch kann sprechen."], correct: 0 },
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "Du ___ hier nicht rauchen. (dürfen)",
    options: ["darf", "darfst", "dürfen", "darft"], correct: 1 },

  // ── A2 · Comparisons ─────────────────────────────────────────────────────
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Anna ist ___ als Tom. (groß)",
    options: ["großer", "größer", "mehr groß", "am größten"], correct: 1 },
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Which is correct for 'as tall as'?",
    options: ["so groß wie", "so groß als", "größer wie", "so groß so"], correct: 0 },
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Das ist der ___ Tag. (gut — superlative)",
    options: ["guteste", "beste", "gutste", "meist gute"], correct: 1 },

  // ── B1 · TEKAMOLO ────────────────────────────────────────────────────────
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "Which order is standard?",
    options: ["Ich fahre nach Berlin morgen.", "Ich fahre morgen nach Berlin.", "Ich morgen fahre nach Berlin.", "Morgen ich fahre nach Berlin."], correct: 1 },
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "In TEKAMOLO, the MO stands for…",
    options: ["temporal", "modal", "lokal", "kausal"], correct: 1 },
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "Where do pronoun objects go in the middle field?",
    options: ["at the very end", "right after the verb", "in first place", "after the time expression"], correct: 1 },

  // ── B1 · Two-way prepositions ────────────────────────────────────────────
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "Ich hänge das Bild an ___ Wand. (movement)",
    options: ["der", "die", "dem", "den"], correct: 1 },
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "Das Bild hängt an ___ Wand. (position)",
    options: ["die", "der", "den", "dem"], correct: 1 },
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "Which question does the accusative answer with a two-way preposition?",
    options: ["wo?", "wohin?", "wann?", "warum?"], correct: 1 },

  // ── B1 · The passive ─────────────────────────────────────────────────────
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Das Haus ___ gebaut. (is being built)",
    options: ["ist", "wird", "hat", "war"], correct: 1 },
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Which sentence is in the passive?",
    options: ["Man baut das Haus.", "Das Haus wird gebaut.", "Das Haus baut.", "Das Haus hat gebaut."], correct: 1 },
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Der Brief ___ gestern geschrieben. (was written)",
    options: ["wurde", "wird", "hat", "ist"], correct: 0 },

  // ── B1 · Konjunktiv II ───────────────────────────────────────────────────
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "___ ich reich, würde ich reisen. (if I were)",
    options: ["Wäre", "Wenn wäre", "Würde", "War"], correct: 0 },
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "Polite request: '___ Sie mir bitte helfen?' (could you)",
    options: ["Können", "Könnten", "Konnten", "Kann"], correct: 1 },
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "Ich ___ gern ein Eis. (I would like)",
    options: ["habe", "hätte", "hatte", "würde"], correct: 1 },

  // ==== Reife-Test-Fragen Runde 2 (auto-eingefuegt) ====
  // -- A1 - der, die, das (articles) --
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "___ Tisch ist neu.",
    options: ["Der", "Die", "Das", "Dem"], correct: 0 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "Nouns ending in -ung (Wohnung, Zeitung) usually take which article?",
    options: ["der", "die", "das", "den"], correct: 1 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "In a compound noun (Autotür), the article comes from…",
    options: ["the first noun", "the last noun", "it is always das", "it is always der"], correct: 1 },
  // -- A1 - Verb position (verb-position) --
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "In a yes/no question, the conjugated verb stands…",
    options: ["in first place", "in second place", "at the end", "after the subject"], correct: 0 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Den Film ich sehe heute.", "Den Film sehe ich heute.", "Ich den Film sehe heute.", "Den Film ich heute sehe."], correct: 1 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Ich will heute Fußball spielen.", "Ich will spielen heute Fußball.", "Ich heute will Fußball spielen.", "Ich will heute spielen Fußball."], correct: 0 },
  // -- A1 - nicht and kein (negation) --
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Ich habe ___ Geschwister. (none)",
    options: ["kein", "keine", "nicht", "nichts"], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Das Auto ist ___ neu.",
    options: ["kein", "nicht", "keine", "nichts"], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "To negate a noun that has a definite article (der/die/das), you use…",
    options: ["kein", "nicht", "keine", "kein or nicht"], correct: 1 },
  // -- A1 - Verbs that change their vowel (stem-changing-verbs) --
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Sie ___ ein Buch. (lesen — she)",
    options: ["lest", "liest", "list", "lesst"], correct: 1 },
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Du ___ mir das Buch. (geben)",
    options: ["gebst", "gibst", "gibt", "gebt"], correct: 1 },
  { unit: "stem-changing-verbs", level: "A1", topic: "Verbs that change their vowel",
    prompt: "Er ___ den Bus. (nehmen)",
    options: ["nehmt", "nimmt", "nihmt", "nemmt"], correct: 1 },
  // -- A1 - Dates and ordinal numbers (dates-ordinals) --
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "Write the ordinal: 1 → der ___",
    options: ["erste", "einte", "erster", "einste"], correct: 0 },
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "Heute ist der ___ Mai. (20.)",
    options: ["zwanzigster", "zwanzigste", "zwanzigte", "zwanzig"], correct: 1 },
  { unit: "dates-ordinals", level: "A1", topic: "Dates and ordinal numbers",
    prompt: "Mein Geburtstag ist am ___ Juni. (3.)",
    options: ["dritten", "dritte", "dritter", "drittes"], correct: 0 },
  // -- A1 - Verb endings (present tense) (present-tense) --
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Ich ___ Kaffee. (trinken)",
    options: ["trinke", "trinkst", "trinkt", "trinken"], correct: 0 },
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Which sentence is correct?",
    options: ["Ihr spielt Fußball.", "Ihr spielst Fußball.", "Ihr spielen Fußball.", "Ihr spiele Fußball."], correct: 0 },
  { unit: "present-tense", level: "A1", topic: "Verb endings (present tense)",
    prompt: "Du ___ viel. (arbeiten)",
    options: ["arbeitst", "arbeitest", "arbeitet", "arbeiten"], correct: 1 },
  // -- A1 - haben and sein (haben-sein) --
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Er ___ Zeit. (haben)",
    options: ["habe", "hast", "hat", "haben"], correct: 2 },
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Ihr ___ pünktlich. (sein)",
    options: ["seid", "sind", "seit", "bist"], correct: 0 },
  { unit: "haben-sein", level: "A1", topic: "haben and sein",
    prompt: "Which sentence is correct?",
    options: ["Die Kinder haben Hunger.", "Die Kinder habt Hunger.", "Die Kinder hat Hunger.", "Die Kinder habst Hunger."], correct: 0 },
  // -- A1 - Making nouns plural (plurals) --
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "The plural of der Hund is…",
    options: ["Hünde", "Hunde", "Hunden", "Hunds"], correct: 1 },
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "The plural of der Apfel is…",
    options: ["Äpfel", "Apfels", "Apfeln", "Apfele"], correct: 0 },
  { unit: "plurals", level: "A1", topic: "Making nouns plural",
    prompt: "Which noun stays the same in the plural?",
    options: ["das Fenster", "der Tisch", "das Buch", "die Katze"], correct: 0 },
  // -- A1 - Asking questions (small-talk) --
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "___ alt bist du?",
    options: ["Wie", "Wer", "Wo", "Was"], correct: 0 },
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "___ gehst du? (to where)",
    options: ["Wo", "Woher", "Wohin", "Wann"], correct: 2 },
  { unit: "small-talk", level: "A1", topic: "Asking questions",
    prompt: "Make a yes/no question from 'Du trinkst Kaffee.'",
    options: ["Du trinkst Kaffee?", "Trinkst du Kaffee?", "Kaffee du trinkst?", "Du Kaffee trinkst?"], correct: 1 },
  // -- A2 - The four cases (cases) --
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "___ Mann ist groß. (subject)",
    options: ["Der", "Den", "Dem", "Des"], correct: 0 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Ich sehe ___ Frau.",
    options: ["der", "die", "den", "dem"], correct: 1 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Das ist das Auto ___ Mannes. (of the man)",
    options: ["der", "den", "dem", "des"], correct: 3 },
  // -- A2 - Object pronouns (object-pronouns) --
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Ich sehe die Frau. → Ich sehe ___ .",
    options: ["sie", "ihr", "ihn", "es"], correct: 0 },
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Er gibt ___ das Buch. (to us)",
    options: ["wir", "unser", "uns", "euch"], correct: 2 },
  { unit: "object-pronouns", level: "A2", topic: "Object pronouns",
    prompt: "Ich danke den Kindern. → Ich danke ___ .",
    options: ["sie", "ihr", "ihnen", "euch"], correct: 2 },
  // -- A2 - Prepositions (accusative/dative) (prepositions) --
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Wir laufen durch ___ Wald.",
    options: ["der", "den", "dem", "des"], correct: 1 },
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Ich gehe ___ Schule. (zu + der)",
    options: ["zum", "zur", "zu", "nach"], correct: 1 },
  { unit: "prepositions", level: "A2", topic: "Prepositions (accusative/dative)",
    prompt: "Which preposition always takes the accusative?",
    options: ["mit", "aus", "ohne", "bei"], correct: 2 },
  // -- A2 - Separable verbs (separable-verbs) --
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Der Zug kommt um acht ___ . (ankommen)",
    options: ["an", "ankommt", "kommt an", "auf"], correct: 0 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "What is the Partizip II of einkaufen?",
    options: ["eingekauft", "geeinkauft", "einkaufen", "gekauft ein"], correct: 0 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which sentence is correct?",
    options: ["Rufst du mich später an?", "Anrufst du mich später?", "Rufst an du mich später?", "Du anrufst mich später?"], correct: 0 },
  // -- A2 - Subordinate clauses (subordinate-clauses) --
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Ich glaube, ___ er recht hat.",
    options: ["dass", "das", "weil", "ob"], correct: 0 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Ich weiß nicht, ___ er kommt. (I don't know whether he is coming)",
    options: ["dass", "ob", "wenn", "als"], correct: 1 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Which sentence is correct?",
    options: ["Ich weiß, dass er morgen nach Hause fährt.", "Ich weiß, dass er fährt morgen nach Hause.", "Ich weiß, dass fährt er morgen nach Hause.", "Ich weiß, dass er morgen fährt nach Hause."], correct: 0 },
  // -- A2 - Subordinate clauses with modals (subordinate-modals) --
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Ich glaube, dass er gut schwimmen ___ . (können)",
    options: ["kann", "kannst", "können", "könnt"], correct: 0 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Which sentence is correct?",
    options: ["Ich weiß, dass sie das Auto reparieren muss.", "Ich weiß, dass sie muss das Auto reparieren.", "Ich weiß, dass sie das Auto muss reparieren.", "Ich weiß, dass muss sie das Auto reparieren."], correct: 0 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Ich hoffe, dass du morgen ___ . (mitkommen können — you can come along)",
    options: ["mitkommen kannst", "kannst mitkommen", "mitkommst kannst", "kannst mitkommst"], correct: 0 },
  // -- A2 - The past (Perfekt) (perfekt) --
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Ich ___ gestern Fußball gespielt.",
    options: ["habe", "bin", "war", "hatte"], correct: 0 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "What is the Partizip II of telefonieren?",
    options: ["telefoniert", "getelefoniert", "telefonieren", "getelefoni"], correct: 0 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Which sentence is correct?",
    options: ["Er hat den Brief bekommen.", "Er hat den Brief gebekommen.", "Er ist den Brief bekommen.", "Er hat den Brief bekommt."], correct: 0 },
  // -- A2 - The written past (Präteritum) (preterite) --
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "sein → er ___ (Präteritum)",
    options: ["war", "wart", "wäre", "wurde"], correct: 0 },
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "können → ich ___ (Präteritum)",
    options: ["konnte", "könnte", "kannte", "konnete"], correct: 0 },
  { unit: "preterite", level: "A2", topic: "The written past (Präteritum)",
    prompt: "denken → er ___ (Präteritum)",
    options: ["denkte", "dachte", "dochte", "denkete"], correct: 1 },
  // -- A2 - Modal verbs (modal-verbs) --
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "Er ___ nach Hause gehen. (wollen)",
    options: ["will", "willt", "wollt", "wollen"], correct: 0 },
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "'Du musst nicht kommen' means…",
    options: ["You must not come", "You don't have to come", "You cannot come", "You are forbidden to come"], correct: 1 },
  { unit: "modal-verbs", level: "A2", topic: "Modal verbs",
    prompt: "Which question is correct?",
    options: ["Kannst du mir helfen?", "Kannst du mir zu helfen?", "Kannst du helfen mir?", "Du kannst helfen mir?"], correct: 0 },
  // -- A2 - Comparing things (comparisons) --
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Mein Auto ist ___ als deins. (schnell)",
    options: ["schneller", "schnell", "mehr schnell", "am schnellsten"], correct: 0 },
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Ich spreche ___ Deutsch als du. (gut)",
    options: ["guter", "besser", "gutter", "mehr gut"], correct: 1 },
  { unit: "comparisons", level: "A2", topic: "Comparing things",
    prompt: "Wer läuft ___ ? (schnell — superlative)",
    options: ["am schnellsten", "der schnellste", "schnellster", "am schnellste"], correct: 0 },
  // -- B1 - Adjective endings (adjective-endings) --
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Die ___ Frau lacht. (jung)",
    options: ["junge", "jungen", "junger", "junges"], correct: 0 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich mag die ___ Autos. (schnell)",
    options: ["schnelle", "schnellen", "schneller", "schnelles"], correct: 1 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich fahre mit dem ___ Auto. (neu)",
    options: ["neuen", "neue", "neues", "neuem"], correct: 0 },
  // -- B1 - Relative clauses (relative-clauses) --
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Das Kind, ___ dort spielt, ist krank.",
    options: ["der", "die", "das", "den"], correct: 2 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Der Freund, ___ ich helfe, kommt heute.",
    options: ["der", "den", "dem", "das"], correct: 2 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Das ist die Frau, ___ Sohn Arzt ist.",
    options: ["deren", "dessen", "der", "die"], correct: 0 },
  // -- B1 - The infinitive with zu (infinitive-zu) --
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Ich fahre nach Berlin, ___ meine Freunde zu besuchen.",
    options: ["zu", "um", "damit", "weil"], correct: 1 },
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Ich hoffe, dich bald wieder ___ . (sehen)",
    options: ["sehen", "zu sehen", "sehen zu", "zu sehe"], correct: 1 },
  { unit: "infinitive-zu", level: "B1", topic: "The infinitive with zu",
    prompt: "Which sentence is correct?",
    options: ["Du brauchst nicht zu kommen.", "Du brauchst nicht kommen.", "Du brauchst nicht zu kommst.", "Du brauchst nicht um zu kommen."], correct: 0 },
  // -- B1 - The past perfect (Plusquamperfekt) (plusquamperfekt) --
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Wir ___ schon gegessen, als du kamst.",
    options: ["hatten", "haben", "waren", "sind"], correct: 0 },
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Nachdem er angekommen ___ , rief er an.",
    options: ["hatte", "war", "hat", "ist"], correct: 1 },
  { unit: "plusquamperfekt", level: "B1", topic: "The past perfect (Plusquamperfekt)",
    prompt: "Plusquamperfekt describes an action that…",
    options: ["is happening now", "happened before another past action", "will happen in the future", "repeats every day"], correct: 1 },
  // -- B1 - TEKAMOLO (tekamolo) --
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "In TEKAMOLO, the TE stands for…",
    options: ["temporal", "kausal", "modal", "lokal"], correct: 0 },
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "Which sentence follows the TEKAMOLO order?",
    options: ["Er fährt heute wegen der Arbeit mit dem Auto nach Köln.", "Er fährt mit dem Auto heute wegen der Arbeit nach Köln.", "Er fährt nach Köln heute mit dem Auto wegen der Arbeit.", "Er fährt wegen der Arbeit heute nach Köln mit dem Auto."], correct: 0 },
  { unit: "tekamolo", level: "B1", topic: "TEKAMOLO",
    prompt: "What is the correct TEKAMOLO sequence?",
    options: ["temporal, kausal, modal, lokal", "temporal, modal, kausal, lokal", "lokal, modal, kausal, temporal", "kausal, temporal, lokal, modal"], correct: 0 },
  // -- B1 - Two-way prepositions (two-way-prepositions) --
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "Ich lege das Buch auf ___ Tisch. (movement)",
    options: ["der", "den", "dem", "das"], correct: 1 },
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "With a two-way preposition, the dative answers which question?",
    options: ["wohin?", "wo?", "woher?", "wann?"], correct: 1 },
  { unit: "two-way-prepositions", level: "B1", topic: "Two-way prepositions",
    prompt: "Die Kinder spielen ___ Garten. (position)",
    options: ["in den", "im", "in das", "ins"], correct: 1 },
  // -- B1 - The passive (passive) --
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Das Haus wird ___ dem Architekten gebaut. (by)",
    options: ["von", "aus", "mit", "durch"], correct: 0 },
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Die Arbeit muss heute ___ . (must be done)",
    options: ["gemacht werden", "werden gemacht", "gemacht wird", "wird gemacht"], correct: 0 },
  { unit: "passive", level: "B1", topic: "The passive",
    prompt: "Das Haus ist letztes Jahr gebaut ___ . (has been built)",
    options: ["geworden", "worden", "gewesen", "geblieben"], correct: 1 },
  // -- B1 - Konjunktiv II (konjunktiv-2) --
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "An deiner Stelle ___ ich mehr lernen. (would)",
    options: ["werde", "würde", "wurde", "wäre"], correct: 1 },
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "Du ___ auch mal anrufen! (could, reproach)",
    options: ["konntest", "könntest", "kannst", "könnten"], correct: 1 },
  { unit: "konjunktiv-2", level: "B1", topic: "Konjunktiv II",
    prompt: "___ ich das gewusst, wäre ich gekommen. (had I known)",
    options: ["Hätte", "Wäre", "Würde", "Hatte"], correct: 0 },
  // -- B2 - Connectors (connectors) --
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Ich gehe spazieren, ___ es regnet. (although)",
    options: ["obwohl", "trotzdem", "deshalb", "denn"], correct: 0 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Ich erkläre es langsam, ___ alle mich verstehen. (so that)",
    options: ["um zu", "damit", "weil", "obwohl"], correct: 1 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "___ mehr ich übe, ___ besser werde ich.",
    options: ["Je … desto", "Wenn … dann", "So … wie", "Zwar … aber"], correct: 0 },
];

export type TopicResult = { unit: string; level: string; topic: string; correct: number; total: number };

// Reife-Tests ("Am I ready for X?"): jeder testet das VORHERIGE Level. Als
// Filter des vorhandenen Checks gebaut - jede Frage traegt schon ihr `level`.
export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];
export const READINESS: Record<string, { title: string; tests: string }> = {
  a2: { title: "Am I ready for A2?", tests: "A1" },
  b1: { title: "Am I ready for B1?", tests: "A2" },
  b2: { title: "Am I ready for B2?", tests: "B1" },
};

// Fragenset fuer den Ziel-Test. Ohne (gueltiges) Ziel: der komplette Check.
// Immer nach Level sortiert, damit die Reihenfolge sauber bleibt.
export function questionsFor(target: string | null | undefined): CheckQuestion[] {
  const r = target ? READINESS[target] : undefined;
  const base = r ? CHECK_QUESTIONS.filter((q) => q.level === r.tests) : CHECK_QUESTIONS;
  return [...base].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
}

// Fasst die Antworten je Thema zusammen, schwaechstes Thema zuerst. `questions`
// muss dasselbe (evtl. gefilterte) Set sein wie im Test - die Indizes richten
// sich danach.
export function summarise(answers: (number | null)[], questions: CheckQuestion[] = CHECK_QUESTIONS): TopicResult[] {
  const byUnit = new Map<string, TopicResult>();
  questions.forEach((q, i) => {
    const r = byUnit.get(q.unit) ?? { unit: q.unit, level: q.level, topic: q.topic, correct: 0, total: 0 };
    r.total += 1;
    if (answers[i] === q.correct) r.correct += 1;
    byUnit.set(q.unit, r);
  });
  return [...byUnit.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
}

export async function saveCheckResults(results: TopicResult[]): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not signed in" };
  const rows = results.map((r) => ({ user_id: user.id, unit_slug: r.unit, correct: r.correct, total: r.total }));
  const { error } = await supabase.from("tr_check_results").insert(rows);
  return { error: error?.message };
}

// Letzter Durchlauf eines Schuelers, Thema fuer Thema.
export async function getMyLastCheck(): Promise<TopicResult[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("tr_check_results")
    .select("unit_slug, correct, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  if (!data || data.length === 0) return [];

  // Nur den juengsten Durchlauf: alles innerhalb einer Minute nach der
  // neuesten Zeile gehoert zusammen.
  const newest = new Date(data[0].created_at as string).getTime();
  const meta = new Map(CHECK_QUESTIONS.map((q) => [q.unit, q]));
  return data
    .filter((r) => newest - new Date(r.created_at as string).getTime() < 60_000)
    .map((r) => ({
      unit: r.unit_slug as string,
      level: meta.get(r.unit_slug as string)?.level ?? "",
      topic: meta.get(r.unit_slug as string)?.topic ?? (r.unit_slug as string),
      correct: r.correct as number,
      total: r.total as number,
    }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total);
}
