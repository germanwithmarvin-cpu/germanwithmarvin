"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, MONTH_NAMES, REVENUE_CATEGORIES, type BookSettings } from "@/lib/books";
import { saveSettings } from "@/lib/booksClient";
import { Field, Hint, Note, inputCls } from "./ui";

// Stammdaten. Alles, was auf dem Blatt "Einstellungen" der bisherigen Datei
// stand — plus die Moeglichkeit, eigene Kategorien zu ergaenzen.

export default function SettingsView({
  settings,
  onSaved,
}: {
  settings: BookSettings | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BookSettings | null>(settings);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kein Datensatz heisst: die Tabellen fehlen noch (siehe Hinweis oben auf der
  // Seite). Ein Ladezustand waere hier eine Luege.
  if (!form) {
    return (
      <Note tone="warn">
        Es sind noch keine Stammdaten vorhanden. Führe <code>supabase/buchhaltung.sql</code> im
        Supabase-SQL-Editor aus und lade die Seite neu.
      </Note>
    );
  }

  const set = <K extends keyof BookSettings>(k: K, v: BookSettings[K]) => setForm({ ...form, [k]: v });

  async function save() {
    if (!form) return;
    setBusy(true); setError(null); setMsg(null);
    const err = await saveSettings(form);
    setBusy(false);
    if (err) { setError(err); return; }
    setMsg("Gespeichert.");
    onSaved();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Firmenname">
          <input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Gründungsstaat">
          <input value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Steuerliche Einordnung" hint="Bei einer Single-Member LLC mit ausländischem Owner: foreign-owned disregarded entity.">
          <input value={form.tax_classification} onChange={(e) => set("tax_classification", e.target.value)} className={inputCls} />
        </Field>
        <Field label="EIN" hint="Ohne EIN lässt sich das Pro-forma 1120 nicht ausfüllen.">
          <input value={form.ein} onChange={(e) => set("ein", e.target.value)} className={inputCls} placeholder="12-3456789" />
        </Field>
        <Field label="Gründungsmonat" hint="Steuert die Frist für den Wyoming Annual Report.">
          <select
            value={form.formation_month ?? ""}
            onChange={(e) => set("formation_month", e.target.value ? Number(e.target.value) : null)}
            className={inputCls}
          >
            <option value="">— noch nicht hinterlegt —</option>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </Field>
        <Field label="Registered Agent" hint="Muss durchgehend bestellt sein, sonst droht Administrative Dissolution.">
          <input value={form.registered_agent} onChange={(e) => set("registered_agent", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Steuerjahr" hint="Voreinstellung für Jahresansicht, Form 5472 und Export.">
          <input type="number" value={form.tax_year} onChange={(e) => set("tax_year", Number(e.target.value) || form.tax_year)} className={inputCls} />
        </Field>
        <Field label="Buchführungswährung">
          <input value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} className={inputCls} maxLength={3} />
        </Field>
        <Field label="Owner">
          <input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Steuerliche Ansässigkeit des Owners" hint="Ab 183 Tagen greift dort die Besteuerung des Welteinkommens.">
          <input value={form.owner_residence} onChange={(e) => set("owner_residence", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryEditor
          title="Umsatzkategorien"
          builtin={[...REVENUE_CATEGORIES]}
          extra={form.extra_revenue_categories}
          onChange={(v) => set("extra_revenue_categories", v)}
        />
        <CategoryEditor
          title="Ausgabenkategorien"
          builtin={[...EXPENSE_CATEGORIES]}
          extra={form.extra_expense_categories}
          onChange={(v) => set("extra_expense_categories", v)}
          note="Stripe-Gebühren stehen bewusst nicht in dieser Liste — sie werden im Umsatzjournal erfasst."
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
          {busy ? "Speichere …" : "Stammdaten speichern"}
        </button>
        {msg && <span className="text-xs text-gold-bright">{msg}</span>}
      </div>
      {error && <Note tone="warn">{error}</Note>}
    </div>
  );
}

function CategoryEditor({
  title,
  builtin,
  extra,
  onChange,
  note,
}: {
  title: string;
  builtin: string[];
  extra: string[];
  onChange: (v: string[]) => void;
  note?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-xl border border-gold/20 bg-bordeaux-deep/30 p-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {builtin.map((c) => (
          <span key={c} className="rounded-full border border-gold/20 px-2 py-0.5 text-[11px] text-cream-dim">{c}</span>
        ))}
        {extra.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px]">
            {c}
            <button onClick={() => onChange(extra.filter((x) => x !== c))} className="text-cream-dim hover:text-bordeaux">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              if (!builtin.includes(draft.trim()) && !extra.includes(draft.trim())) onChange([...extra, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="eigene Kategorie …"
          className={`${inputCls} py-1 text-xs`}
        />
        <button
          onClick={() => {
            const v = draft.trim();
            if (v && !builtin.includes(v) && !extra.includes(v)) onChange([...extra, v]);
            setDraft("");
          }}
          className="btn-outline px-3 py-1 text-xs"
        >
          +
        </button>
      </div>
      <Hint>
        Die grauen Kategorien sind fest eingebaut. Eigene kommen hier dazu und stehen sofort in
        allen Formularen und im Export. {note}
      </Hint>
    </div>
  );
}
