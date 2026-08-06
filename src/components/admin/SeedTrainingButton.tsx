"use client";

import { useState } from "react";

// Loest den Trainings-Seed aus (POST /api/seed-training): spielt die Einheiten
// aus src/lib/trainingSeed.ts in die Datenbank. Bestehende Einheiten werden
// aktualisiert, der Schueler-Fortschritt bleibt erhalten. Nur Lehrer (die Route
// prueft das serverseitig).
export default function SeedTrainingButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (!confirm("Publish the latest training units and exercises?\n\nExisting units are updated and student progress is kept.")) return;
    setBusy(true); setError(null); setMsg(null);
    try {
      const res = await fetch("/api/seed-training", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || `Failed (${res.status}).`); return; }
      const n = Array.isArray(data.seeded) ? data.seeded.length : 0;
      setMsg(`✓ Published ${n} training unit${n === 1 ? "" : "s"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={publish} disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50" title="Push the training units from the code into the live database">
        {busy ? "Publishing…" : "⬆ Publish training content"}
      </button>
      {msg && <span className="text-xs" style={{ color: "var(--green-accent)" }}>{msg}</span>}
      {error && <span className="text-xs text-red-700 max-w-xs text-right">{error}</span>}
    </div>
  );
}
