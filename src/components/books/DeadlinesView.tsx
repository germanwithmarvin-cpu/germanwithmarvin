"use client";

import { DEADLINES, MONTH_NAMES, type BookSettings } from "@/lib/books";
import { Hint, Note } from "./ui";

// Compliance-Kalender. Die naechste feste Frist wird hervorgehoben, damit man
// beim Reinschauen sofort sieht, was ansteht.

function daysUntil(month: number, day: number, now: Date): number {
  const year = now.getFullYear();
  let due = Date.UTC(year, month - 1, day);
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (due < todayUtc) due = Date.UTC(year + 1, month - 1, day);
  return Math.round((due - todayUtc) / 86400000);
}

export default function DeadlinesView({ settings }: { settings: BookSettings | null }) {
  const now = new Date();

  // Der Wyoming Annual Report haengt am Gruendungsmonat aus den Stammdaten.
  const items = DEADLINES.map((d) => {
    if (d.duty === "Wyoming Annual Report" && settings?.formation_month) {
      return { ...d, month: settings.formation_month, day: 1, due: `${MONTH_NAMES[settings.formation_month - 1]} (Jahrestag)` };
    }
    return d;
  });

  const dated = items.filter((d) => d.month && d.day).map((d) => ({ d, days: daysUntil(d.month!, d.day!, now) }));
  const next = dated.sort((a, b) => a.days - b.days)[0];

  return (
    <div className="space-y-4">
      {next && (
        <Note tone={next.days <= 30 ? "warn" : "info"}>
          Nächste feste Frist: <strong>{next.d.duty}</strong> am {next.d.due} — in {next.days} Tagen.
        </Note>
      )}

      {!settings?.formation_month && (
        <Note tone="warn">
          Der Gründungsmonat fehlt in den Stammdaten. Solange er nicht hinterlegt ist, kann das Tool
          die Frist für den Wyoming Annual Report nicht ausrechnen.
        </Note>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-xs">
          <thead className="border-b border-gold/25">
            <tr>
              <th className="px-2 py-1.5 text-left text-[11px] font-medium text-cream-dim">Pflicht</th>
              <th className="px-2 py-1.5 text-left text-[11px] font-medium text-cream-dim">Frist</th>
              <th className="px-2 py-1.5 text-left text-[11px] font-medium text-cream-dim">Ebene</th>
              <th className="px-2 py-1.5 text-left text-[11px] font-medium text-cream-dim">Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.duty} className={`border-b border-gold/10 ${next?.d.duty === d.duty ? "bg-gold/10" : ""}`}>
                <td className="px-2 py-2 font-medium">{d.duty}</td>
                <td className="px-2 py-2 whitespace-nowrap">{d.due}</td>
                <td className="px-2 py-2 text-cream-dim">{d.level}</td>
                <td className="px-2 py-2 text-cream-dim">{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Hint>
        Stand August 2026. Fristen und Regeln ändern sich — die Liste gehört einmal jährlich
        geprüft. Ob deine Einkünfte „effectively connected income“ darstellen, gehört einmal
        schriftlich von einem US-CPA bestätigt; das ist die eine Frage, an der hier am meisten
        hängt.
      </Hint>
    </div>
  );
}
