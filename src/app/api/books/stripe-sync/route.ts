import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { LESSON } from "@/lib/config";
import { fromStripeAmount, parsePeriod, round2 } from "@/lib/books";

// Holt einen Kalendermonat aus Stripe ins Umsatzjournal.
//
// Warum Balance Transactions und nicht Charges? Weil die Balance Transaction
// die Buchhaltungssicht ist: sie kennt Bruttobetrag, Gebuehr, Nettobetrag und
// den tatsaechlich angewandten Wechselkurs in Abrechnungswaehrung — genau die
// Spalten, die das Umsatzjournal braucht. Erstattungen, Chargebacks und
// Stripe-Gebuehren tauchen dort ebenfalls als eigene Zeilen auf.
//
// Die Steuer steht nicht an der Balance Transaction. Sie kommt aus der Invoice
// (Abo-Verlaengerungen) bzw. der Checkout-Session (Einmalzahlungen) und wird
// ueber die PaymentIntent-ID zugeordnet. Findet der Sync keine Steuerangabe,
// bleibt das Feld 0 und wird im Tool als "bitte pruefen" markiert — es wird
// nichts stillschweigend geraten.

export const runtime = "nodejs";
export const maxDuration = 60;

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

type Guarded = { stripe: Stripe; db: Awaited<ReturnType<typeof createClient>> };

async function guard(): Promise<{ ok?: Guarded; error?: Response }> {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: json({ error: "Nicht angemeldet." }, 401) };

  let isTeacher = false;
  const rpc = await db.rpc("is_teacher");
  if (rpc.data === true) isTeacher = true;
  else {
    const { data: profile } = await db.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(profile?.is_teacher);
  }
  if (!isTeacher) return { error: json({ error: `Kein Zugriff — angemeldet als ${user.email ?? "unbekannt"}.` }, 403) };

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { error: json({ error: "STRIPE_SECRET_KEY fehlt in der Deployment-Konfiguration." }, 500) };
  return { ok: { stripe: new Stripe(key), db } };
}

// ---- Zuordnung der Stripe-Kategorien auf unsere Journal-Typen ---------------
// reporting_category ist Stripes eigene Buchhaltungssicht und stabiler als type.
function kindFor(bt: Stripe.BalanceTransaction): { kind: string; skip?: boolean } {
  switch (bt.reporting_category) {
    case "charge":
    case "partial_capture_reversal":
      return { kind: "Verkauf" };
    case "refund":
    case "refund_failure":
      return { kind: "Erstattung" };
    case "dispute":
    case "dispute_reversal":
      return { kind: "Chargeback" };
    case "fee":
      return { kind: "Stripe-Gebuehr" };
    // Reine Geldbewegungen: sie beruehren weder Erloes noch Aufwand.
    case "payout":
    case "payout_reversal":
    case "transfer":
    case "transfer_reversal":
    case "topup":
    case "topup_reversal":
      return { kind: "", skip: true };
    default:
      // Unbekanntes faellt bewusst NICHT unter den Tisch, sondern landet als
      // "Sonstiges" mit Hinweis im Journal.
      return { kind: "Sonstiges" };
  }
}

type Meta = { taxCents: number; product: string; priceId: string | null };

/** Steuer und Produktname je PaymentIntent aus Invoices und Checkout-Sessions. */
async function buildMetaMap(
  stripe: Stripe,
  gte: number,
  lt: number,
  warnings: string[],
): Promise<Map<string, Meta>> {
  const map = new Map<string, Meta>();
  // Rechnungen koennen kurz vor dem Monatswechsel entstanden und erst im
  // Folgemonat bezahlt worden sein — Fenster grosszuegig nach hinten oeffnen.
  const wide = gte - 40 * 86400;

  try {
    for await (const inv of stripe.invoices.list({
      created: { gte: wide, lt },
      limit: 100,
      expand: ["data.payments"],
    })) {
      const taxCents = (inv.total_taxes ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);
      const lines = inv.lines?.data ?? [];
      const product = lines.map((l) => l.description).filter(Boolean).join(" + ");
      const priceId =
        lines.map((l) => l.pricing?.price_details?.price).find((p): p is string => Boolean(p)) ?? null;
      for (const p of inv.payments?.data ?? []) {
        const pi = p.payment?.payment_intent;
        const id = typeof pi === "string" ? pi : pi?.id;
        if (id) map.set(id, { taxCents, product, priceId });
      }
    }
  } catch (e) {
    warnings.push(
      `Rechnungen konnten nicht gelesen werden (${e instanceof Error ? e.message : "unbekannt"}). ` +
        "Bei Abo-Zahlungen fehlt dadurch die Steuerangabe — bitte in der Tabelle nachtragen.",
    );
  }

  try {
    for await (const s of stripe.checkout.sessions.list({ created: { gte: wide, lt }, limit: 100 })) {
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      if (!pi || map.has(pi)) continue; // Invoice-Angabe ist genauer, hat Vorrang
      map.set(pi, {
        taxCents: s.total_details?.amount_tax ?? 0,
        product: "",
        priceId: null,
      });
    }
  } catch (e) {
    warnings.push(
      `Checkout-Sessions konnten nicht gelesen werden (${e instanceof Error ? e.message : "unbekannt"}). ` +
        "Bei Einmalzahlungen fehlt dadurch die Steuerangabe.",
    );
  }

  return map;
}

/** Die PaymentIntent-ID zu einer Balance Transaction, wenn es eine gibt. */
function paymentIntentOf(src: Stripe.BalanceTransactionSource | null): string | null {
  if (!src || typeof src === "string") return null;
  const withPi = src as { payment_intent?: string | { id: string } | null };
  const pi = withPi.payment_intent;
  return typeof pi === "string" ? pi : pi?.id ?? null;
}

/** Originalbetrag und -waehrung der Quelle (Charge, Refund, Dispute). */
function originalOf(src: Stripe.BalanceTransactionSource | null): { amount: number; currency: string } | null {
  if (!src || typeof src === "string") return null;
  const s = src as { amount?: number; currency?: string };
  if (typeof s.amount !== "number" || !s.currency) return null;
  return { amount: Math.abs(s.amount), currency: s.currency };
}

function countryOf(src: Stripe.BalanceTransactionSource | null): string {
  if (!src || typeof src === "string") return "";
  const s = src as { billing_details?: { address?: { country?: string | null } | null } | null };
  return s.billing_details?.address?.country ?? "";
}

function describe(src: Stripe.BalanceTransactionSource | null): string {
  if (!src || typeof src === "string") return "";
  const s = src as { description?: string | null };
  return s.description ?? "";
}

export async function POST(req: Request) {
  const { ok, error } = await guard();
  if (error) return error;
  const { stripe, db } = ok!;

  const body = await req.json().catch(() => ({}));
  const period = String(body.period ?? "");
  const p = parsePeriod(period);
  if (!p) return json({ error: "Bitte einen Monat im Format 2026-08 angeben." }, 400);

  const gte = Math.floor(Date.UTC(p.year, p.month - 1, 1) / 1000);
  const lt = Math.floor(Date.UTC(p.year, p.month, 1) / 1000);

  const warnings: string[] = [];

  // Bereits bekannte Zuordnungen Produkt -> Kategorie.
  const { data: mapRows } = await db.from("book_product_map").select("raw, category");
  const known = new Map<string, string>((mapRows ?? []).map((m) => [m.raw as string, m.category as string]));

  let meta: Map<string, Meta>;
  let transactions: Stripe.BalanceTransaction[];
  try {
    meta = await buildMetaMap(stripe, gte, lt, warnings);
    transactions = [];
    for await (const bt of stripe.balanceTransactions.list({
      created: { gte, lt },
      limit: 100,
      expand: ["data.source"],
    })) {
      transactions.push(bt);
    }
  } catch (e) {
    return json({ error: `Stripe: ${e instanceof Error ? e.message : "Abruf fehlgeschlagen"}` }, 400);
  }

  const rows: Record<string, unknown>[] = [];
  let skipped = 0;
  let taxFound = 0;
  let sales = 0;

  for (const bt of transactions) {
    const { kind, skip } = kindFor(bt);
    if (skip) { skipped++; continue; }

    const src = (bt.source ?? null) as Stripe.BalanceTransactionSource | null;
    const sign = bt.amount < 0 ? -1 : 1;
    const fx = bt.exchange_rate ?? 1;

    // USD-Seite: das ist die Wahrheit, so hat Stripe tatsaechlich abgerechnet.
    let grossUsd = fromStripeAmount(bt.amount, bt.currency);
    let feeUsd = fromStripeAmount(bt.fee, bt.currency);
    if (kind === "Stripe-Gebuehr") {
      // Reine Gebuehrenzeile (z. B. Stripe Billing): kein Erloes, nur Aufwand.
      feeUsd = round2(Math.abs(grossUsd) + feeUsd);
      grossUsd = 0;
    }

    // Originalwaehrung nur als Beleg daneben; fehlt sie, ist es ohnehin USD.
    const orig = originalOf(src);
    const currency = (orig?.currency ?? bt.currency).toUpperCase();
    const grossOriginal = orig ? sign * fromStripeAmount(orig.amount, orig.currency) : grossUsd;

    // Steuer: ueber den PaymentIntent aus Invoice/Session.
    const pi = paymentIntentOf(src);
    const m = pi ? meta.get(pi) : undefined;
    const taxOriginal = m && m.taxCents > 0 ? sign * fromStripeAmount(m.taxCents, currency) : 0;
    const taxUsd = taxOriginal === 0 ? 0 : round2(taxOriginal * (bt.exchange_rate ?? 1));

    if (kind === "Verkauf") {
      sales++;
      if (taxOriginal !== 0) taxFound++;
    }

    const productRaw = (m?.product || describe(src) || bt.description || "").trim();
    // Kategorie: gemerkte Zuordnung gewinnt, sonst die eine Regel, die wir
    // sicher kennen (die Preis-ID der 1-zu-1-Stunden).
    let product = known.get(productRaw.toLowerCase()) ?? "";
    if (!product && m?.priceId && m.priceId === LESSON.stripePriceId) product = "1:1 Tutoring";
    if (!product && kind === "Stripe-Gebuehr") product = "";

    rows.push({
      booked_on: new Date(bt.created * 1000).toISOString().slice(0, 10),
      kind,
      source: "stripe",
      stripe_id: bt.id,
      stripe_ref: typeof src === "object" && src && "id" in src ? String(src.id) : "",
      product,
      product_raw: productRaw,
      customer_country: countryOf(src),
      currency,
      gross_original: grossOriginal,
      tax_original: taxOriginal,
      fx_rate: fx,
      gross_usd: grossUsd,
      tax_usd: taxUsd,
      fee_usd: feeUsd,
      note:
        kind === "Sonstiges"
          ? `Stripe-Typ "${bt.type}" (${bt.reporting_category}) — bitte einordnen`
          : "",
    });
  }

  // Idempotent: schon vorhandene Balance Transactions bleiben unangetastet,
  // damit von Hand gesetzte Kategorien und Steuerbetraege nicht verloren gehen.
  let imported = 0;
  if (rows.length) {
    const { data, error: insErr } = await db
      .from("book_revenue")
      .upsert(rows, { onConflict: "stripe_id", ignoreDuplicates: true })
      .select("id");
    if (insErr) return json({ error: `Speichern fehlgeschlagen: ${insErr.message}` }, 400);
    imported = data?.length ?? 0;
  }

  await db.from("book_periods").upsert(
    { period, synced_at: new Date().toISOString() },
    { onConflict: "period" },
  );

  if (sales > 0 && taxFound === 0) {
    warnings.push(
      `Bei keinem der ${sales} Verkaeufe war eine Steuer hinterlegt. Wenn Stripe fuer dich ` +
        "VAT/Sales Tax einbehaelt, trage sie in der Spalte „Steuer“ nach — sie ist ein " +
        "durchlaufender Posten und darf nicht als Erloes stehen bleiben.",
    );
  }

  return json({
    period,
    found: transactions.length,
    imported,
    existing: rows.length - imported,
    ignored: skipped,
    salesWithTax: taxFound,
    sales,
    warnings,
  });
}
