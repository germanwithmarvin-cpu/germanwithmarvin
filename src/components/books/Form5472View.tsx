"use client";

import { useEffect, useState } from "react";
import {
  OWNER_KINDS,
  OWNER_KIND_HELP,
  form5472Totals,
  round2,
  type BookSettings,
  type OwnerRow,
} from "@/lib/books";
import { listOwner } from "@/lib/booksClient";
import { Hint, Money, Note, Td, Th } from "./ui";

// Form 5472: die Summen kommen ausschliesslich aus dem Owner-Journal. Alles
// andere — Umsaetze, Gebuehren, Betriebsausgaben — ist fuer dieses Formular
// ohne Belang.

const CHECKLIST = [
  "Pro-forma Form 1120 mit Name, Adresse und EIN ausgefüllt",
  "Form 5472 mit den obenstehenden Beträgen ausgefüllt",
  "Frist 15. April beachtet — oder Form 7004 für Verlängerung bis 15. Oktober eingereicht",
  "Einreichung per Post oder Fax an die dafür vorgesehene IRS-Adresse",
  "Kopie und Sendenachweis abgelegt",
  "Belege zu allen Owner-Transaktionen archiviert (Reg. 1.6038A-3)",
];

export default function Form5472View({ settings }: { settings: BookSettings | null }) {
  const [year, setYear] = useState(() => settings?.tax_year ?? new Date().getFullYear());
  const [owner, setOwner] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listOwner({ year }).then((o) => { setOwner(o); setLoading(false); });
  }, [year]);

  const totals = form5472Totals(owner);
  const sum = round2(Object.values(totals).reduce((a, b) => a + b, 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setYear(year - 1)} className="btn-outline px-2 py-1 text-sm">‹</button>
        <span className="min-w-[4rem] text-center text-base font-semibold">{year}</span>
        <button onClick={() => setYear(year + 1)} className="btn-outline px-2 py-1 text-sm">›</button>
      </div>

      <Hint>
        Reportable transactions sind ausschließlich Vorgänge zwischen der LLC und einer related
        party — also dir. Kursverkäufe an Endkunden gehören nicht auf dieses Formular.
      </Hint>

      {!settings?.ein && (
        <Note tone="warn">
          Es ist noch keine EIN hinterlegt. Ohne sie lässt sich weder das Pro-forma 1120 noch das
          5472 ausfüllen — nachtragen unter „Stammdaten“.
        </Note>
      )}

      {loading ? (
        <p className="text-sm text-cream-dim">Lade {year} …</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-xs">
            <thead className="border-b border-gold/25">
              <tr><Th>Kategorie</Th><Th right>Betrag USD</Th><Th>Erläuterung</Th></tr>
            </thead>
            <tbody>
              {OWNER_KINDS.map((k) => (
                <tr key={k} className="border-b border-gold/10">
                  <Td>{k}</Td>
                  <Td right><Money value={totals[k] ?? 0} /></Td>
                  <Td className="text-cream-dim">{OWNER_KIND_HELP[k]}</Td>
                </tr>
              ))}
              <tr>
                <Td><strong>Summe reportable transactions</strong></Td>
                <Td right><Money value={sum} bold /></Td>
                <Td></Td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-gold/20 bg-bordeaux-deep/30 p-4">
        <div className="mb-2 text-sm font-semibold">Checkliste zur Abgabe</div>
        <ul className="space-y-1 text-xs text-cream-dim">
          {CHECKLIST.map((c) => <li key={c}>☐&nbsp; {c}</li>)}
        </ul>
      </div>

      <Note tone="warn">
        Versäumnis der 5472-Abgabe: 25.000 USD je Jahr. Die Aufzeichnungspflicht nach
        Reg. 1.6038A-3 ist davon unabhängig eigenständig sanktioniert.
      </Note>
    </div>
  );
}
