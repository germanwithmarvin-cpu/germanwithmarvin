// CSV-Import für Karten.
// Erwartete Spalten (erste Zeile = Überschriften, Groß-/Kleinschreibung egal):
//   Front, Back            (Pflicht)
//   Tags, Image, Audio, Notes   (optional; "ImageURL"/"AudioURL" werden auch erkannt)
// Trennzeichen: Komma ODER Semikolon (wird automatisch erkannt). Felder dürfen
// in Anführungszeichen stehen ("...") und darin Kommas/Zeilenumbrüche enthalten.

import type { Card } from "@/lib/types";

export type ParsedCard = Pick<Card, "front" | "back" | "tags" | "imageUrl" | "audioUrl" | "notes" | "example" | "exampleEn">;

export type ParseResult = {
  cards: ParsedCard[];
  error?: string;
  skipped: number; // Zeilen ohne Front/Back, die übersprungen wurden
};

// Zerlegt CSV-Text in Zeilen mit Feldern. Beachtet Anführungszeichen.
function tokenize(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  // Zeilenenden vereinheitlichen.
  const s = text.replace(/\r\n?/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } // verdoppeltes Anführungszeichen = ein "
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  // letztes Feld/Zeile
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Errät das Trennzeichen anhand der ersten Zeile.
function detectDelimiter(firstLine: string): string {
  const commas = (firstLine.match(/,/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  if (tabs > commas && tabs > semis) return "\t";
  return semis > commas ? ";" : ",";
}

// Findet den Spaltenindex anhand möglicher Überschriften.
function colIndex(headers: string[], names: string[]): number {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const n of names) {
    const idx = lower.indexOf(n);
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseCsv(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { cards: [], skipped: 0, error: "The file is empty." };

  const firstLine = trimmed.split("\n")[0];
  const delimiter = detectDelimiter(firstLine);
  const rows = tokenize(trimmed, delimiter).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) return { cards: [], skipped: 0, error: "Need a header row plus at least one card." };

  const headers = rows[0];
  const iFront = colIndex(headers, ["front", "vorderseite", "english", "word", "term"]);
  const iBack = colIndex(headers, ["back", "rückseite", "ruckseite", "german", "deutsch", "translation", "definition"]);

  if (iFront === -1 || iBack === -1) {
    return { cards: [], skipped: 0, error: 'Could not find "Front" and "Back" columns in the header row.' };
  }

  const iTags = colIndex(headers, ["tags", "tag"]);
  const iImage = colIndex(headers, ["image", "imageurl", "image_url", "bild"]);
  const iAudio = colIndex(headers, ["audio", "audiourl", "audio_url", "sound", "ton"]);
  const iNotes = colIndex(headers, ["notes", "note", "hint", "notiz", "hinweis"]);
  const iExample = colIndex(headers, ["example", "beispiel", "examplede", "satz"]);
  const iExampleEn = colIndex(headers, ["exampleen", "example_en", "exampletranslation", "beispielenglisch"]);

  const cards: ParsedCard[] = [];
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const front = (row[iFront] ?? "").trim();
    const back = (row[iBack] ?? "").trim();
    if (!front || !back) { skipped++; continue; }

    const tagsRaw = iTags !== -1 ? (row[iTags] ?? "") : "";
    cards.push({
      front,
      back,
      tags: tagsRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
      imageUrl: iImage !== -1 ? (row[iImage] ?? "").trim() || null : null,
      audioUrl: iAudio !== -1 ? (row[iAudio] ?? "").trim() || null : null,
      notes: iNotes !== -1 ? (row[iNotes] ?? "").trim() : "",
      example: iExample !== -1 ? (row[iExample] ?? "").trim() : "",
      exampleEn: iExampleEn !== -1 ? (row[iExampleEn] ?? "").trim() : "",
    });
  }

  if (cards.length === 0) return { cards: [], skipped, error: "No valid cards found (every row needs Front and Back)." };
  return { cards, skipped };
}
