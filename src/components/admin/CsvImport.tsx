"use client";

import { useState } from "react";
import { parseCsv, type ParsedCard } from "@/lib/import";
import { insertCards } from "@/lib/cards";

// CSV-Import in einen bestehenden Stapel. Datei wählen oder Text einfügen,
// Vorschau ansehen, dann importieren.
export default function CsvImport({
  deckId,
  startSortOrder,
  onImported,
}: {
  deckId: string;
  startSortOrder: number;
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<ParsedCard[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  function handleText(text: string) {
    setDone(null);
    const result = parseCsv(text);
    setCards(result.cards);
    setSkipped(result.skipped);
    setError(result.error ?? null);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    handleText(text);
  }

  async function handleImport() {
    if (cards.length === 0) return;
    setImporting(true);
    const rows = cards.map((c, i) => ({ ...c, deckId, sortOrder: startSortOrder + i }));
    const { error, count } = await insertCards(rows);
    setImporting(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(count);
    setCards([]);
    onImported();
  }

  const inputCls = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline px-4 py-2 text-sm">
        📄 Import from CSV / Excel
      </button>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Import cards from a table</h4>
        <button onClick={() => { setOpen(false); setCards([]); setError(null); setDone(null); }} className="text-xs text-cream-dim hover:text-cream">Close</button>
      </div>

      <p className="text-sm text-cream-dim">
        Use columns <b>Front</b> and <b>Back</b> (required). Optional: <b>Tags</b>, <b>Image</b>, <b>Audio</b>, <b>Notes</b>.
        In Excel or Numbers, save as <b>CSV</b>. Comma or semicolon both work.
      </p>

      <div>
        <label className="block text-sm mb-1 text-cream-dim">Choose a .csv file</label>
        <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="text-sm text-cream-dim" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-cream-dim">…or paste the table here</label>
        <textarea
          rows={4}
          onChange={(e) => handleText(e.target.value)}
          placeholder={"Front,Back\nthe house,das Haus\nto go,gehen"}
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{error}</p>}
      {done !== null && <p className="text-sm text-cream bg-green-accent/20 rounded-lg p-2">✅ Imported {done} card{done === 1 ? "" : "s"}.</p>}

      {cards.length > 0 && (
        <div>
          <p className="text-sm text-cream-dim mb-2">
            Preview: <b className="text-cream">{cards.length}</b> card{cards.length === 1 ? "" : "s"} ready
            {skipped > 0 && <span> · {skipped} row{skipped === 1 ? "" : "s"} skipped (missing front/back)</span>}
          </p>
          <div className="max-h-48 overflow-auto rounded-lg border border-gold/15">
            <table className="w-full text-sm">
              <thead className="text-cream-dim sticky top-0 bg-bordeaux-deep/90">
                <tr><th className="text-left px-3 py-1.5">Front</th><th className="text-left px-3 py-1.5">Back</th><th className="text-left px-3 py-1.5">Extras</th></tr>
              </thead>
              <tbody>
                {cards.slice(0, 50).map((c, i) => (
                  <tr key={i} className="border-t border-gold/10">
                    <td className="px-3 py-1.5">{c.front}</td>
                    <td className="px-3 py-1.5 text-gold-bright">{c.back}</td>
                    <td className="px-3 py-1.5 text-cream-dim text-xs">
                      {c.tags.length > 0 && <span>#{c.tags.join(" #")} </span>}
                      {c.imageUrl && "🖼️ "}{c.audioUrl && "🔊 "}{c.notes && "📝"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cards.length > 50 && <p className="text-xs text-cream-dim mt-1">(showing first 50)</p>}

          <button onClick={handleImport} disabled={importing} className="btn-gold px-4 py-2 text-sm mt-3 disabled:opacity-50">
            {importing ? "Importing…" : `Import ${cards.length} card${cards.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </div>
  );
}
