// Kasus-Markierung für Karten. Wird über die vorhandenen Tags der Karte gesteuert
// (z. B. tag "dat" → Dativ-Stern). So braucht es keinen Datenbank-Umbau.

export type CaseTag = "akk" | "dat" | "gen" | "wechsel";

export type CaseMarker = {
  symbol: string; // angezeigtes Symbol
  short: string; // Kurzlabel (DE)
  title: string; // Tooltip (EN)
  bg: string; // Hintergrundfarbe des Badges
  fg: string; // Textfarbe
};

// Akkusativ = Zielscheibe 🎯, Dativ = Stern ⭐, Genitiv = Krone 👑,
// Wechselpräposition (Akk ODER Dativ) = beide Symbole.
export const CASE_MARKERS: Record<CaseTag, CaseMarker> = {
  akk: { symbol: "🎯", short: "Akk", title: "Accusative", bg: "color-mix(in srgb, var(--red-accent) 22%, transparent)", fg: "#f3b8ad" },
  dat: { symbol: "⭐", short: "Dat", title: "Dative", bg: "color-mix(in srgb, var(--gold) 22%, transparent)", fg: "var(--gold-bright)" },
  gen: { symbol: "👑", short: "Gen", title: "Genitive", bg: "color-mix(in srgb, #8e6fd6 28%, transparent)", fg: "#cdbcf2" },
  wechsel: { symbol: "🎯⭐", short: "Akk/Dat", title: "Two-way: accusative (motion) or dative (location)", bg: "color-mix(in srgb, var(--green-accent) 24%, transparent)", fg: "#9fe0c2" },
};

const ALIASES: Record<string, CaseTag> = {
  akk: "akk", akkusativ: "akk", acc: "akk", accusative: "akk",
  dat: "dat", dativ: "dat", dative: "dat",
  gen: "gen", genitiv: "gen", genitive: "gen",
  wechsel: "wechsel", "akk/dat": "wechsel", "akk-dat": "wechsel", twoway: "wechsel", "two-way": "wechsel",
};

// Findet den Kasus aus den Tags einer Karte (falls vorhanden).
export function caseFromTags(tags: string[] | undefined): CaseMarker | null {
  if (!tags) return null;
  for (const t of tags) {
    const key = ALIASES[t.trim().toLowerCase()];
    if (key) return CASE_MARKERS[key];
  }
  return null;
}
