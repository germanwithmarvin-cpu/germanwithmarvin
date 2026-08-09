"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_HELP,
  EXPENSE_CATEGORIES,
  W8BEN_CATEGORIES,
  periodLabel,
  periodRange,
  round2,
  today,
} from "@/lib/books";
import {
  deleteExpense,
  deleteTemplate,
  insertExpense,
  insertTemplate,
  listTemplates,
  patchPeriod,
  updateExpense,
  type Template,
} from "@/lib/booksClient";
import type { StepProps } from "./MonthView";
import { Field, Hint, Money, Note, Td, Th, deDate, inputCls } from "./ui";

// Schritt 2: alle Betriebsausgaben ausser den Stripe-Gebuehren. Die stehen
// bereits im Umsatzjournal und wuerden hier ein zweites Mal zaehlen.

export default function ExpenseStep({ period, locked, expenses, settings, meta, reload }: StepProps) {
  const range = periodRange(period);
  const categories = [...EXPENSE_CATEGORIES, ...(settings?.extra_expense_categories ?? [])];

  const [templates, setTemplates] = useState<Template[]>([]);
  const [date, setDate] = useState(() => {
    const t = today();
    return t >= range.from && t <= range.to ? t : range.to;
  });
  const [category, setCategory] = useState(categories[0] ?? "Sonstiges");
  const [description, setDescription] = useState("");
  const [payee, setPayee] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [fx, setFx] = useState("1");
  const [receipt, setReceipt] = useState(false);
  const [w8ben, setW8ben] = useState("n/a");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveTemplate, setSaveTemplate] = useState(false);

  useEffect(() => { listTemplates().then(setTemplates); }, []);
  useEffect(() => { setDate((d) => (d >= range.from && d <= range.to ? d : range.to)); }, [range.from, range.to]);

  const needsW8 = W8BEN_CATEGORIES.includes(category);
  const rate = Number(fx) || 1;
  const amountUsd = round2((Number(amount) || 0) * rate);
  const total = round2(expenses.reduce((a, e) => a + e.amount_usd, 0));

  function applyTemplate(t: Template) {
    setCategory(t.category);
    setDescription(t.description || t.label);
    setPayee(t.payee);
    setCurrency(t.currency);
    setAmount(String(t.amount_original || ""));
    setFx(t.currency === "USD" ? "1" : fx);
    setW8ben(W8BEN_CATEGORIES.includes(t.category) ? "Nein" : "n/a");
  }

  function resetForm() {
    setDescription(""); setPayee(""); setAmount(""); setNote("");
    setReceipt(false); setW8ben("n/a"); setSaveTemplate(false);
  }

  async function save() {
    if (!amount.trim()) { setError("Bitte einen Betrag eintragen."); return; }
    if (!description.trim()) { setError("Bitte kurz beschreiben, wofür das Geld war — das ist dein Beleg-Kontext."); return; }
    if (date < range.from || date > range.to) { setError(`Das Datum muss in ${periodLabel(period)} liegen.`); return; }
    setBusy(true); setError(null);
    const err = await insertExpense({
      booked_on: date,
      category,
      description,
      payee,
      currency: currency.toUpperCase(),
      amount_original: round2(Number(amount) || 0),
      fx_rate: rate,
      amount_usd: amountUsd,
      receipt,
      w8ben: needsW8 ? w8ben : "n/a",
      note,
    });
    if (!err && saveTemplate) {
      await insertTemplate({
        label: description.slice(0, 60),
        category, payee, description,
        currency: currency.toUpperCase(),
        amount_original: round2(Number(amount) || 0),
      });
      setTemplates(await listTemplates());
    }
    setBusy(false);
    if (err) { setError(err); return; }
    resetForm();
    reload();
  }

  return (
    <div className="space-y-4">
      <Hint>
        Alles, was die LLC bezahlt hat — <strong>außer Stripe-Gebühren</strong>. Die stehen schon
        im Umsatzjournal und würden hier doppelt zählen. Zu jeder Zeile gehört ein Beleg als PDF
        im Ordner des Geschäftsjahres; Reg. 1.6038A-3 ist eigenständig bußgeldbewehrt.
      </Hint>

      {templates.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-cream-dim">Wiederkehrend — ein Klick füllt das Formular:</div>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-bordeaux-deep/50 px-1 text-xs">
                <button onClick={() => applyTemplate(t)} disabled={locked} className="py-1 pl-2 hover:text-gold-bright disabled:opacity-50">
                  {t.label} · {t.currency} {t.amount_original.toFixed(2)}
                </button>
                <button
                  onClick={async () => { await deleteTemplate(t.id); setTemplates(await listTemplates()); }}
                  className="px-1 text-cream-dim hover:text-bordeaux"
                  title="Vorlage entfernen"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-gold/25 bg-bordeaux-deep/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Datum">
            <input type="date" value={date} min={range.from} max={range.to} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kategorie" hint={CATEGORY_HELP[category]} className="sm:col-span-2">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setW8ben(W8BEN_CATEGORIES.includes(e.target.value) ? "Nein" : "n/a"); }} className={inputCls}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Beschreibung" hint="Wofür genau? Steht später im Export." className="sm:col-span-2">
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="z. B. Skool Abo August" />
          </Field>
          <Field label="Zahlungsempfänger">
            <input value={payee} onChange={(e) => setPayee(e.target.value)} className={inputCls} placeholder="z. B. Skool" />
          </Field>
          <Field label="Währung">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} maxLength={3} />
          </Field>
          <Field label="Betrag (Originalwährung)">
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kurs zu USD" hint="Bei USD einfach 1.">
            <input type="number" step="0.0001" value={fx} onChange={(e) => setFx(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={receipt} onChange={(e) => setReceipt(e.target.checked)} />
            Beleg ist abgelegt
          </label>
          {needsW8 && (
            <label className="flex items-center gap-2 text-xs">
              W-8BEN liegt vor
              <select value={w8ben} onChange={(e) => setW8ben(e.target.value)} className={`${inputCls} w-24 py-1`}>
                <option>Ja</option>
                <option>Nein</option>
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={saveTemplate} onChange={(e) => setSaveTemplate(e.target.checked)} />
            als Vorlage merken
          </label>
        </div>

        {needsW8 && w8ben === "Nein" && (
          <Note tone="warn">
            Von jedem ausländischen Lehrer und Sales-Partner gehört ein W-8BEN vor der ersten
            Zahlung in die Akte. Es ist deine Dokumentation, dass keine US-Quellensteuer anfällt.
          </Note>
        )}

        <Field label="Notiz">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={busy || locked} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
            {busy ? "Speichere …" : "Ausgabe erfassen"}
          </button>
          <span className="text-xs text-cream-dim">= <Money value={amountUsd} bold /></span>
        </div>
        {error && <Note tone="warn">{error}</Note>}
      </div>

      {expenses.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-xs">
            <thead className="border-b border-gold/20">
              <tr>
                <Th>Datum</Th><Th>Kategorie</Th><Th>Beschreibung</Th><Th>Empfänger</Th>
                <Th right>Betrag USD</Th><Th>Beleg</Th><Th>W-8BEN</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-gold/10">
                  <Td>{deDate(e.booked_on)}</Td>
                  <Td>{e.category}</Td>
                  <Td>{e.description}</Td>
                  <Td>{e.payee || "—"}</Td>
                  <Td right><Money value={e.amount_usd} /></Td>
                  <Td>
                    <button
                      disabled={locked}
                      onClick={async () => { await updateExpense(e.id, { receipt: !e.receipt }); reload(); }}
                      className={e.receipt ? "text-gold-bright" : "text-bordeaux underline"}
                      title="Umschalten"
                    >
                      {e.receipt ? "Ja" : "fehlt"}
                    </button>
                  </Td>
                  <Td className={e.w8ben === "Nein" ? "text-bordeaux" : ""}>{e.w8ben}</Td>
                  <Td right>
                    <button
                      disabled={locked}
                      onClick={async () => { if (confirm("Ausgabe löschen?")) { await deleteExpense(e.id); reload(); } }}
                      className="text-cream-dim hover:text-bordeaux disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </Td>
                </tr>
              ))}
              <tr>
                <Td></Td><Td></Td><Td></Td>
                <Td right><span className="text-cream-dim">Summe</span></Td>
                <Td right><Money value={total} bold /></Td>
                <Td></Td><Td></Td><Td></Td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gold/15 pt-3">
        <button
          disabled={locked}
          onClick={async () => { await patchPeriod(period, { expenses_done: !meta.expenses_done }); reload(); }}
          className={`${meta.expenses_done ? "btn-outline" : "btn-gold"} px-4 py-2 text-sm disabled:opacity-50`}
        >
          {meta.expenses_done ? "Bestätigung zurücknehmen" : "Ausgaben für diesen Monat sind vollständig"}
        </button>
        <Hint>Auch ein Monat ohne Ausgaben will bestätigt werden — sonst weiß niemand, ob nur noch nichts erfasst ist.</Hint>
      </div>
    </div>
  );
}
