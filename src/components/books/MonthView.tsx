"use client";

import { useCallback, useEffect, useState } from "react";
import {
  currentPeriod,
  nextPeriod,
  periodLabel,
  previousPeriod,
  totalsFor,
  type BookSettings,
  type ExpenseRow,
  type OwnerRow,
  type Period,
  type RevenueRow,
} from "@/lib/books";
import { getPeriod, listExpenses, listOwner, listRevenue } from "@/lib/booksClient";
import ExpenseStep from "./ExpenseStep";
import OwnerStep from "./OwnerStep";
import ReviewStep from "./ReviewStep";
import RevenueStep from "./RevenueStep";
import { StepBadge } from "./ui";

// Der gefuehrte Monatsablauf: vier Schritte, immer in derselben Reihenfolge.
// Der Monat ist fertig, wenn alle vier ein Haekchen haben.

export type StepProps = {
  period: string;
  locked: boolean;
  revenue: RevenueRow[];
  expenses: ExpenseRow[];
  owner: OwnerRow[];
  settings: BookSettings | null;
  meta: Period;
  reload: () => void;
};

function Step({
  n,
  title,
  lead,
  done,
  open,
  onToggle,
  children,
}: {
  n: number;
  title: string;
  lead: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gold/20 bg-bordeaux-deep/25">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <StepBadge n={n} done={done} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block text-xs text-cream-dim">{lead}</span>
        </span>
        <span className="mt-1 text-xs text-cream-dim">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-gold/15 px-4 py-4">{children}</div>}
    </section>
  );
}

export default function MonthView({ settings }: { settings: BookSettings | null }) {
  // Standard ist der letzte vollstaendig vergangene Monat — den bucht man.
  const [period, setPeriod] = useState(() => previousPeriod(currentPeriod()));
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [owner, setOwner] = useState<OwnerRow[]>([]);
  const [meta, setMeta] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(1);

  const reload = useCallback(async () => {
    const [r, e, o, m] = await Promise.all([
      listRevenue(period),
      listExpenses(period),
      listOwner(period),
      getPeriod(period),
    ]);
    setRevenue(r);
    setExpenses(e);
    setOwner(o);
    setMeta(m);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  if (loading || !meta) return <p className="text-sm text-cream-dim">Lade {periodLabel(period)} …</p>;

  const unassigned = revenue.filter((r) => r.kind !== "Stripe-Gebuehr" && !r.product).length;
  const step1Done = Boolean(meta.synced_at) && unassigned === 0;
  const step2Done = meta.expenses_done;
  const step3Done = meta.owner_done;
  const closed = Boolean(meta.closed_at);
  const totals = totalsFor(revenue, expenses, owner);
  const doneCount = [step1Done, step2Done, step3Done, closed].filter(Boolean).length;

  const shared: StepProps = { period, locked: closed, revenue, expenses, owner, settings, meta, reload };

  return (
    <div className="space-y-4">
      {/* Monatswahl */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/20 bg-bordeaux-deep/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setPeriod(previousPeriod(period))} className="btn-outline px-2 py-1 text-sm" aria-label="Vorheriger Monat">‹</button>
          <span className="min-w-[9.5rem] text-center text-base font-semibold">{periodLabel(period)}</span>
          <button onClick={() => setPeriod(nextPeriod(period))} className="btn-outline px-2 py-1 text-sm" aria-label="Naechster Monat">›</button>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cream-dim">{doneCount}/4 Schritte</span>
          {closed ? (
            <span className="rounded-full bg-gold px-2.5 py-1 font-medium text-[#3a0a0a]">abgeschlossen</span>
          ) : (
            <span className="rounded-full border border-gold/40 px-2.5 py-1 text-cream-dim">offen</span>
          )}
        </div>
      </div>

      <Step
        n={1}
        title="Stripe-Umsätze holen und zuordnen"
        lead={
          meta.synced_at
            ? unassigned > 0
              ? `${unassigned} Buchung(en) brauchen noch eine Kategorie`
              : `${revenue.length} Buchungen im Journal`
            : "Noch nicht geholt"
        }
        done={step1Done}
        open={open === 1}
        onToggle={() => setOpen(open === 1 ? 0 : 1)}
      >
        <RevenueStep {...shared} />
      </Step>

      <Step
        n={2}
        title="Ausgaben erfassen"
        lead={step2Done ? `${expenses.length} Ausgabe(n), bestätigt` : `${expenses.length} Ausgabe(n) erfasst`}
        done={step2Done}
        open={open === 2}
        onToggle={() => setOpen(open === 2 ? 0 : 2)}
      >
        <ExpenseStep {...shared} />
      </Step>

      <Step
        n={3}
        title="Owner-Bewegungen nachtragen"
        lead={step3Done ? `${owner.length} Bewegung(en), bestätigt` : `${owner.length} Bewegung(en) erfasst`}
        done={step3Done}
        open={open === 3}
        onToggle={() => setOpen(open === 3 ? 0 : 3)}
      >
        <OwnerStep {...shared} />
      </Step>

      <Step
        n={4}
        title="Prüfen und Monat abschließen"
        lead={closed ? "Abgeschlossen" : `Gewinn ${totals.profit >= 0 ? "+" : ""}${totals.profit.toFixed(2)} USD`}
        done={closed}
        open={open === 4}
        onToggle={() => setOpen(open === 4 ? 0 : 4)}
      >
        <ReviewStep {...shared} steps={{ step1Done, step2Done, step3Done }} />
      </Step>
    </div>
  );
}
