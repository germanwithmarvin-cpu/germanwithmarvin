"use client";

import { createClient } from "@/lib/supabase/client";
import {
  periodRange,
  type BookSettings,
  type ExpenseRow,
  type OwnerRow,
  type Period,
  type RevenueRow,
} from "@/lib/books";

// Datenzugriff fuer die Buchhaltung. Alle Tabellen sind per RLS auf
// Lehrer-Konten beschraenkt — die Absicherung liegt in der Datenbank, nicht hier.

export type Template = {
  id: string;
  label: string;
  category: string;
  payee: string;
  description: string;
  currency: string;
  amount_original: number;
  active: boolean;
};

// PostgREST liefert numeric als Zahl; bei leeren Feldern lieber hart casten,
// damit im UI nie "NaN" oder ein String in einer Rechnung landet.
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function mapRevenue(r: Record<string, unknown>): RevenueRow {
  return {
    id: String(r.id),
    booked_on: String(r.booked_on),
    kind: String(r.kind ?? "Verkauf"),
    source: String(r.source ?? "manuell"),
    stripe_id: (r.stripe_id as string | null) ?? null,
    stripe_ref: String(r.stripe_ref ?? ""),
    product: String(r.product ?? ""),
    product_raw: String(r.product_raw ?? ""),
    customer_country: String(r.customer_country ?? ""),
    currency: String(r.currency ?? "USD"),
    gross_original: num(r.gross_original),
    tax_original: num(r.tax_original),
    fx_rate: num(r.fx_rate) || 1,
    gross_usd: num(r.gross_usd),
    tax_usd: num(r.tax_usd),
    fee_usd: num(r.fee_usd),
    note: String(r.note ?? ""),
  };
}

function mapExpense(r: Record<string, unknown>): ExpenseRow {
  return {
    id: String(r.id),
    booked_on: String(r.booked_on),
    category: String(r.category ?? "Sonstiges"),
    description: String(r.description ?? ""),
    payee: String(r.payee ?? ""),
    currency: String(r.currency ?? "USD"),
    amount_original: num(r.amount_original),
    fx_rate: num(r.fx_rate) || 1,
    amount_usd: num(r.amount_usd),
    receipt: Boolean(r.receipt),
    w8ben: String(r.w8ben ?? "n/a"),
    note: String(r.note ?? ""),
  };
}

function mapOwner(r: Record<string, unknown>): OwnerRow {
  return {
    id: String(r.id),
    booked_on: String(r.booked_on),
    kind: String(r.kind ?? "Entnahme (Owner Draw)"),
    description: String(r.description ?? ""),
    currency: String(r.currency ?? "USD"),
    amount_original: num(r.amount_original),
    fx_rate: num(r.fx_rate) || 1,
    amount_usd: num(r.amount_usd),
    receipt: Boolean(r.receipt),
    note: String(r.note ?? ""),
  };
}

// ---- Stammdaten -------------------------------------------------------------

export async function getSettings(): Promise<BookSettings | null> {
  const { data } = await createClient().from("book_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return null;
  return {
    company_name: data.company_name ?? "",
    state: data.state ?? "",
    tax_classification: data.tax_classification ?? "",
    ein: data.ein ?? "",
    formation_month: data.formation_month ?? null,
    registered_agent: data.registered_agent ?? "",
    tax_year: Number(data.tax_year) || new Date().getFullYear(),
    currency: data.currency ?? "USD",
    owner_name: data.owner_name ?? "",
    owner_residence: data.owner_residence ?? "",
    extra_revenue_categories: data.extra_revenue_categories ?? [],
    extra_expense_categories: data.extra_expense_categories ?? [],
  };
}

export async function saveSettings(patch: Partial<BookSettings>): Promise<string | null> {
  const { error } = await createClient()
    .from("book_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  return error?.message ?? null;
}

// ---- Journale lesen ---------------------------------------------------------

async function rangeFor(period: string | { year: number }) {
  if (typeof period === "string") return periodRange(period);
  return { from: `${period.year}-01-01`, to: `${period.year}-12-31` };
}

export async function listRevenue(scope: string | { year: number }): Promise<RevenueRow[]> {
  const { from, to } = await rangeFor(scope);
  const { data } = await createClient()
    .from("book_revenue").select("*")
    .gte("booked_on", from).lte("booked_on", to)
    .order("booked_on", { ascending: true }).order("created_at", { ascending: true });
  return (data ?? []).map(mapRevenue);
}

export async function listExpenses(scope: string | { year: number }): Promise<ExpenseRow[]> {
  const { from, to } = await rangeFor(scope);
  const { data } = await createClient()
    .from("book_expenses").select("*")
    .gte("booked_on", from).lte("booked_on", to)
    .order("booked_on", { ascending: true }).order("created_at", { ascending: true });
  return (data ?? []).map(mapExpense);
}

export async function listOwner(scope: string | { year: number }): Promise<OwnerRow[]> {
  const { from, to } = await rangeFor(scope);
  const { data } = await createClient()
    .from("book_owner").select("*")
    .gte("booked_on", from).lte("booked_on", to)
    .order("booked_on", { ascending: true }).order("created_at", { ascending: true });
  return (data ?? []).map(mapOwner);
}

// ---- Journale schreiben -----------------------------------------------------

type Row = Record<string, unknown>;

export async function insertRevenue(row: Row): Promise<string | null> {
  const { error } = await createClient().from("book_revenue").insert(row);
  return error?.message ?? null;
}
export async function updateRevenue(id: string, patch: Row): Promise<string | null> {
  const { error } = await createClient().from("book_revenue").update(patch).eq("id", id);
  return error?.message ?? null;
}
export async function deleteRevenue(id: string): Promise<string | null> {
  const { error } = await createClient().from("book_revenue").delete().eq("id", id);
  return error?.message ?? null;
}

export async function insertExpense(row: Row): Promise<string | null> {
  const { error } = await createClient().from("book_expenses").insert(row);
  return error?.message ?? null;
}
export async function updateExpense(id: string, patch: Row): Promise<string | null> {
  const { error } = await createClient().from("book_expenses").update(patch).eq("id", id);
  return error?.message ?? null;
}
export async function deleteExpense(id: string): Promise<string | null> {
  const { error } = await createClient().from("book_expenses").delete().eq("id", id);
  return error?.message ?? null;
}

export async function insertOwner(row: Row): Promise<string | null> {
  const { error } = await createClient().from("book_owner").insert(row);
  return error?.message ?? null;
}
export async function updateOwner(id: string, patch: Row): Promise<string | null> {
  const { error } = await createClient().from("book_owner").update(patch).eq("id", id);
  return error?.message ?? null;
}
export async function deleteOwner(id: string): Promise<string | null> {
  const { error } = await createClient().from("book_owner").delete().eq("id", id);
  return error?.message ?? null;
}

// ---- Vorlagen fuer wiederkehrende Ausgaben ----------------------------------

export async function listTemplates(): Promise<Template[]> {
  const { data } = await createClient()
    .from("book_templates").select("*").eq("active", true).order("label");
  return (data ?? []).map((t) => ({
    id: String(t.id),
    label: String(t.label ?? ""),
    category: String(t.category ?? "Sonstiges"),
    payee: String(t.payee ?? ""),
    description: String(t.description ?? ""),
    currency: String(t.currency ?? "USD"),
    amount_original: num(t.amount_original),
    active: Boolean(t.active),
  }));
}

export async function insertTemplate(row: Row): Promise<string | null> {
  const { error } = await createClient().from("book_templates").insert(row);
  return error?.message ?? null;
}

export async function deleteTemplate(id: string): Promise<string | null> {
  const { error } = await createClient().from("book_templates").delete().eq("id", id);
  return error?.message ?? null;
}

// ---- Stripe-Produkt -> Kategorie -------------------------------------------

/** Merkt sich die Zuordnung, damit der naechste Sync sie von selbst trifft. */
export async function rememberProduct(raw: string, category: string): Promise<void> {
  if (!raw.trim() || !category) return;
  await createClient()
    .from("book_product_map")
    .upsert({ raw: raw.trim().toLowerCase(), category }, { onConflict: "raw" });
}

// ---- Monatsabschluss --------------------------------------------------------

export async function getPeriod(period: string): Promise<Period> {
  const { data } = await createClient().from("book_periods").select("*").eq("period", period).maybeSingle();
  return {
    period,
    synced_at: data?.synced_at ?? null,
    closed_at: data?.closed_at ?? null,
    expenses_done: Boolean(data?.expenses_done),
    owner_done: Boolean(data?.owner_done),
    note: data?.note ?? "",
  };
}

export async function patchPeriod(
  period: string,
  patch: Partial<Pick<Period, "closed_at" | "expenses_done" | "owner_done" | "note">>,
): Promise<string | null> {
  const { error } = await createClient()
    .from("book_periods")
    .upsert({ period, ...patch }, { onConflict: "period" });
  return error?.message ?? null;
}
