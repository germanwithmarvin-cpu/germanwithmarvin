"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  MONTH_NAMES,
  REVENUE_CATEGORIES,
  money,
  netUsd,
  round2,
  type BookSettings,
  type ExpenseRow,
  type OwnerRow,
  type RevenueRow,
} from "@/lib/books";
import { listExpenses, listOwner, listRevenue } from "@/lib/booksClient";
import { Hint, Note } from "./ui";

// Die GuV ueber zwoelf Monate — dieselbe Gliederung wie das Blatt "GuV" der
// bisherigen Datei. Hier wird nichts eingetragen, alles gerechnet.

const zero = () => Array.from({ length: 12 }, () => 0);
const monthOf = (iso: string) => Number(iso.slice(5, 7)) - 1;

export default function YearView({ settings }: { settings: BookSettings | null }) {
  const [year, setYear] = useState(() => settings?.tax_year ?? new Date().getFullYear());
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [owner, setOwner] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([listRevenue({ year }), listExpenses({ year }), listOwner({ year })]).then(([r, e, o]) => {
      setRevenue(r); setExpenses(e); setOwner(o); setLoading(false);
    });
  }, [year]);

  const model = useMemo(() => {
    const revByCat = new Map<string, number[]>();
    const fees = zero();
    const tax = zero();
    for (const r of revenue) {
      const m = monthOf(r.booked_on);
      fees[m] = round2(fees[m] + r.fee_usd);
      tax[m] = round2(tax[m] + r.tax_usd);
      if (r.kind === "Stripe-Gebuehr") continue;
      const key = r.product || "Nicht zugeordnet";
      if (!revByCat.has(key)) revByCat.set(key, zero());
      const arr = revByCat.get(key)!;
      arr[m] = round2(arr[m] + netUsd(r));
    }
    const expByCat = new Map<string, number[]>();
    for (const e of expenses) {
      const m = monthOf(e.booked_on);
      if (!expByCat.has(e.category)) expByCat.set(e.category, zero());
      const arr = expByCat.get(e.category)!;
      arr[m] = round2(arr[m] + e.amount_usd);
    }
    const ownerIn = zero();
    const ownerOut = zero();
    for (const o of owner) {
      const m = monthOf(o.booked_on);
      if (o.kind === "Einlage (Owner Contribution)" || o.kind === "Darlehen an LLC") ownerIn[m] = round2(ownerIn[m] + o.amount_usd);
      else ownerOut[m] = round2(ownerOut[m] + o.amount_usd);
    }
    const revTotals = zero();
    revByCat.forEach((arr) => arr.forEach((v, i) => { revTotals[i] = round2(revTotals[i] + v); }));
    const expTotals = [...fees];
    expByCat.forEach((arr) => arr.forEach((v, i) => { expTotals[i] = round2(expTotals[i] + v); }));
    const profit = revTotals.map((v, i) => round2(v - expTotals[i]));
    return { revByCat, expByCat, fees, tax, ownerIn, ownerOut, revTotals, expTotals, profit };
  }, [revenue, expenses, owner]);

  const revenueOrder = ordered([...REVENUE_CATEGORIES, ...(settings?.extra_revenue_categories ?? [])], model.revByCat);
  const expenseOrder = ordered([...EXPENSE_CATEGORIES, ...(settings?.extra_expense_categories ?? [])], model.expByCat);

  const sum = (a: number[]) => round2(a.reduce((x, y) => x + y, 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(year - 1)} className="btn-outline px-2 py-1 text-sm">‹</button>
          <span className="min-w-[4rem] text-center text-base font-semibold">{year}</span>
          <button onClick={() => setYear(year + 1)} className="btn-outline px-2 py-1 text-sm">›</button>
        </div>
        <a href={`/api/books/export?year=${year}`} className="btn-gold px-4 py-2 text-sm">
          Als Excel-Datei exportieren
        </a>
      </div>

      <Hint>
        Der Export enthält dieselben acht Blätter wie deine bisherige Datei — Anleitung,
        Einstellungen, die drei Journale, GuV, Form 5472 und den Fristenkalender. Alle Summen
        stehen als fertige Werte darin, damit sie jedes Buchhaltungsprogramm einlesen kann und
        nicht nur Excel.
      </Hint>

      {loading ? (
        <p className="text-sm text-cream-dim">Lade {year} …</p>
      ) : revenue.length + expenses.length + owner.length === 0 ? (
        <Note tone="info">Für {year} ist noch nichts gebucht.</Note>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-xs">
            <thead className="border-b border-gold/25">
              <tr>
                <th className="px-2 py-1.5 text-left text-[11px] font-medium text-cream-dim">Position</th>
                {MONTH_NAMES.map((m) => (
                  <th key={m} className="px-2 py-1.5 text-right text-[11px] font-medium text-cream-dim">{m.slice(0, 3)}</th>
                ))}
                <th className="px-2 py-1.5 text-right text-[11px] font-medium text-cream-dim">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              <SectionRow label="ERLÖSE  (netto, ohne durchlaufende Steuer)" />
              {revenueOrder.map((cat) => (
                <Row key={cat} label={cat} values={model.revByCat.get(cat)!} />
              ))}
              <Row label="Summe Erlöse" values={model.revTotals} bold />

              <SectionRow label="AUSGABEN" />
              <Row label="Stripe-Gebühren" values={model.fees} />
              {expenseOrder.map((cat) => (
                <Row key={cat} label={cat} values={model.expByCat.get(cat)!} />
              ))}
              <Row label="Summe Ausgaben" values={model.expTotals} bold />

              <tr><td className="py-1" /></tr>
              <Row label="GEWINN VOR STEUERN" values={model.profit} bold highlight />

              <SectionRow label="NACHRICHTLICH  (kein Bestandteil der GuV)" />
              <Row label="Durchlaufende Steuer (von Stripe abgeführt)" values={model.tax} />
              <Row label="Owner-Einlagen" values={model.ownerIn} />
              <Row label="Owner-Entnahmen" values={model.ownerOut} />
            </tbody>
          </table>
          <p className="mt-3 text-xs text-cream-dim">
            Jahresgewinn {year}: <strong className="text-cream">{money(sum(model.profit))}</strong>.
            Bei einer disregarded entity ist dieser Gewinn unmittelbar dein persönliches Einkommen —
            die materielle Steuerlast liegt in Vietnam, nicht in Wyoming.
          </p>
        </div>
      )}
    </div>
  );
}

function ordered(preferred: string[], data: Map<string, number[]>): string[] {
  const rest = [...data.keys()].filter((k) => !preferred.includes(k)).sort();
  return [...preferred.filter((k) => data.has(k)), ...rest];
}

function SectionRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={14} className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-bordeaux">
        {label}
      </td>
    </tr>
  );
}

function Row({
  label,
  values,
  bold = false,
  highlight = false,
}: {
  label: string;
  values: number[];
  bold?: boolean;
  highlight?: boolean;
}) {
  const total = round2(values.reduce((a, b) => a + b, 0));
  return (
    <tr className={`border-b border-gold/10 ${highlight ? "bg-gold/10" : ""}`}>
      <td className={`px-2 py-1.5 ${bold ? "font-semibold" : ""}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-2 py-1.5 text-right tabular-nums ${bold ? "font-semibold" : ""} ${v === 0 ? "text-cream-dim" : ""}`}>
          {v === 0 ? "–" : v.toFixed(2)}
        </td>
      ))}
      <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${total < 0 ? "text-bordeaux" : ""}`}>
        {total.toFixed(2)}
      </td>
    </tr>
  );
}
