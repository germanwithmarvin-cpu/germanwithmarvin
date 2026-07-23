import type { Exercise } from "@/lib/training";

// Drill-Sets: Listenstoff, aus dem beliebig viele Lückenaufgaben generiert
// werden. Gedacht für Themen, bei denen konstante Wiederholung mehr bringt als
// zwölf feste Aufgaben – feste Präpositionen zuerst.
//
// Kernidee: nicht dieselben Aufgaben öfter zeigen (dann lernt man sie auswendig),
// sondern aus einer Wortliste immer neue Kombinationen ziehen. Trainiert wird
// das Muster (welche Präposition gehört zum Verb?), nicht die Einzelaufgabe.
//
// Die generierten Aufgaben tragen KEINE echte Datenbank-Kennung – sie werden
// deshalb nicht protokolliert. Reines Üben.

type DrillItem = {
  verb: string; // die Verb-Präposition-Verbindung, für die Erklärung
  prep: string; // die gesuchte Präposition (die Lücke)
  govern: string; // "Akkusativ" | "Dativ" – für die Erklärung
  // Sätze mit ___ an der Stelle der Präposition. Bewusst so gebaut, dass die
  // REINE Präposition passt (an diesem Kurs, nicht am Kurs) – sonst wäre die
  // Antwort mehrdeutig.
  sentences: string[];
};

export type DrillSet = {
  key: string;
  unitSlug: string; // an welche Einheit der Intensiv-Modus gekoppelt ist
  title: string;
  intro: string;
  items: DrillItem[];
};

const FIXED_PREPOSITIONS: DrillSet = {
  key: "fixed-prepositions",
  unitSlug: "fixed-prepositions",
  title: "Verbs with fixed prepositions",
  intro: "The preposition belongs to the verb. Fill in the one that fits — again and again, until it comes without thinking.",
  items: [
    // ── Akkusativ ──────────────────────────────────────────────────────────
    { verb: "warten auf", prep: "auf", govern: "Akkusativ",
      sentences: ["Ich warte ___ den Bus.", "Wir warten ___ das Ergebnis.", "Sie wartet ___ ihren Freund."] },
    { verb: "denken an", prep: "an", govern: "Akkusativ",
      sentences: ["Ich denke ___ dich.", "Denkst du ___ deine Familie?", "Er denkt oft ___ seine Kindheit."] },
    { verb: "sich freuen auf", prep: "auf", govern: "Akkusativ",
      sentences: ["Ich freue mich ___ das Wochenende.", "Sie freut sich ___ die Reise.", "Wir freuen uns ___ den Urlaub."] },
    { verb: "sich freuen über", prep: "über", govern: "Akkusativ",
      sentences: ["Ich freue mich ___ dein Geschenk.", "Er freut sich ___ die gute Note.", "Sie freut sich ___ den Besuch."] },
    { verb: "sich interessieren für", prep: "für", govern: "Akkusativ",
      sentences: ["Ich interessiere mich ___ Musik.", "Sie interessiert sich ___ Politik.", "Interessierst du dich ___ Sport?"] },
    { verb: "sich erinnern an", prep: "an", govern: "Akkusativ",
      sentences: ["Ich erinnere mich ___ den Tag.", "Erinnerst du dich ___ mich?", "Sie erinnert sich ___ ihre Schulzeit."] },
    { verb: "sich ärgern über", prep: "über", govern: "Akkusativ",
      sentences: ["Ich ärgere mich ___ den Lärm.", "Er ärgert sich ___ das Wetter.", "Sie ärgert sich ___ ihren Chef."] },
    { verb: "sprechen über", prep: "über", govern: "Akkusativ",
      sentences: ["Wir sprechen ___ das Wetter.", "Sie spricht ___ ihre Arbeit.", "Lass uns ___ das Problem sprechen."] },
    { verb: "sich kümmern um", prep: "um", govern: "Akkusativ",
      sentences: ["Ich kümmere mich ___ die Kinder.", "Er kümmert sich ___ den Garten.", "Wer kümmert sich ___ den Hund?"] },
    { verb: "bitten um", prep: "um", govern: "Akkusativ",
      sentences: ["Ich bitte ___ Hilfe.", "Sie bittet ___ einen Rat.", "Darf ich ___ Ihre Aufmerksamkeit bitten?"] },
    { verb: "sich bewerben um", prep: "um", govern: "Akkusativ",
      sentences: ["Ich bewerbe mich ___ die Stelle.", "Er bewirbt sich ___ einen Job.", "Sie bewirbt sich ___ ein Stipendium."] },
    { verb: "achten auf", prep: "auf", govern: "Akkusativ",
      sentences: ["Achte ___ die Zeit!", "Sie achtet ___ ihre Gesundheit.", "Bitte achten Sie ___ die Stufe."] },

    // ── Dativ ──────────────────────────────────────────────────────────────
    { verb: "Angst haben vor", prep: "vor", govern: "Dativ",
      sentences: ["Ich habe Angst ___ Hunden.", "Sie hat Angst ___ der Prüfung.", "Er hat Angst ___ der Zukunft."] },
    { verb: "teilnehmen an", prep: "an", govern: "Dativ",
      sentences: ["Ich möchte ___ diesem Kurs teilnehmen.", "Sie nimmt ___ dem Wettbewerb teil.", "Wir nehmen ___ der Sitzung teil."] },
    { verb: "sprechen mit", prep: "mit", govern: "Dativ",
      sentences: ["Ich spreche ___ meinem Chef.", "Sie spricht ___ dem Lehrer.", "Kann ich ___ dir sprechen?"] },
    { verb: "sich treffen mit", prep: "mit", govern: "Dativ",
      sentences: ["Ich treffe mich ___ Anna.", "Wir treffen uns ___ Freunden.", "Er trifft sich ___ seinem Bruder."] },
    { verb: "leiden unter", prep: "unter", govern: "Dativ",
      sentences: ["Er leidet ___ Kopfschmerzen.", "Sie leidet ___ der Hitze.", "Viele leiden ___ Stress."] },
    { verb: "sich beschäftigen mit", prep: "mit", govern: "Dativ",
      sentences: ["Ich beschäftige mich ___ dem Thema.", "Sie beschäftigt sich ___ Kunst.", "Er beschäftigt sich ___ dem Projekt."] },
    { verb: "träumen von", prep: "von", govern: "Dativ",
      sentences: ["Ich träume ___ einer Reise.", "Sie träumt ___ einem Haus.", "Er träumt ___ einer besseren Zukunft."] },
    { verb: "sich verabschieden von", prep: "von", govern: "Dativ",
      sentences: ["Ich verabschiede mich ___ dir.", "Sie verabschiedet sich ___ ihren Gästen.", "Wir verabschieden uns ___ euch."] },
    { verb: "gratulieren zu", prep: "zu", govern: "Dativ",
      sentences: ["Ich gratuliere dir ___ deinem Erfolg.", "Sie gratuliert ihm ___ dem Geburtstag.", "Wir gratulieren euch ___ der Hochzeit."] },
    { verb: "sich gewöhnen an", prep: "an", govern: "Akkusativ",
      sentences: ["Ich gewöhne mich ___ das Wetter.", "Sie gewöhnt sich ___ die neue Stadt.", "Er gewöhnt sich ___ den Lärm."] },
  ],
};

const SETS: Record<string, DrillSet> = {
  [FIXED_PREPOSITIONS.unitSlug]: FIXED_PREPOSITIONS,
};

export function getDrillForUnit(unitSlug: string): DrillSet | null {
  return SETS[unitSlug] ?? null;
}

// Zieht `count` frische Aufgaben. Erst werden alle (Verb × Satz)-Kombinationen
// gemischt; reicht das nicht, wird nachgefüllt – aber nie zweimal derselbe Satz
// direkt hintereinander.
export function generateDrill(set: DrillSet, count: number): Exercise[] {
  const pairs: { item: DrillItem; sentence: string }[] = [];
  for (const item of set.items) for (const sentence of item.sentences) pairs.push({ item, sentence });

  // Fisher-Yates.
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const chosen: typeof pairs = [];
  let i = 0;
  while (chosen.length < count) {
    if (i >= pairs.length) {
      // Neu mischen für den nächsten Durchgang, ohne den letzten Satz sofort zu wiederholen.
      const last = chosen[chosen.length - 1];
      for (let k = pairs.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pairs[k], pairs[j]] = [pairs[j], pairs[k]]; }
      if (pairs[0] === last && pairs.length > 1) [pairs[0], pairs[1]] = [pairs[1], pairs[0]];
      i = 0;
    }
    chosen.push(pairs[i++]);
  }

  return chosen.map((p, idx) => ({
    id: `drill-${set.key}-${idx}`,
    kind: "gap" as const,
    prompt: p.sentence,
    options: [],
    tokens: [],
    correct: -1,
    answers: [p.item.prep],
    order: [],
    verb: -1,
    explain: `**${p.item.verb}** + ${p.item.govern}. The preposition belongs to the verb — you learn it as one piece.`,
    hint: "",
  }));
}
