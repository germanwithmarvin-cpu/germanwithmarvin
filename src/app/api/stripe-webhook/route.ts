import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { LESSON } from "@/lib/config";

// Stripe meldet hierher: bezahlt / gekündigt / Zahlung fehlgeschlagen.
// Zwei Abos laufen über diesen Endpunkt:
//   1) All-Access-App-Abo → paid_subscriptions (per E-Mail), Pay-first.
//   2) 1-zu-1 Stunden-Abo  → lesson_subscriptions + lesson_credit_grants (per user_id,
//      erkennbar an subscription.metadata.kind === "lesson").
//
// Nötige Umgebungsvariablen: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   SUPABASE_SERVICE_ROLE_KEY

export const runtime = "nodejs";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ---- All-Access-Abo (unverändert) -----------------------------------------
async function upsertPaid(email: string | null | undefined, customerId: string | null | undefined, status: string) {
  if (!email) return;
  await admin().from("paid_subscriptions").upsert(
    { email: email.toLowerCase(), stripe_customer_id: customerId ?? null, status, updated_at: new Date().toISOString() },
    { onConflict: "email" },
  );
}
async function setStatusByCustomer(customerId: string, status: string) {
  await admin().from("paid_subscriptions").update({ status, updated_at: new Date().toISOString() }).eq("stripe_customer_id", customerId);
}

// ---- 1-zu-1 Stunden-Abo ----------------------------------------------------
function subQuantity(sub: Stripe.Subscription): number {
  return sub.items.data[0]?.quantity ?? 0;
}
function periodEndISO(sub: Stripe.Subscription): string {
  // Stripe hat current_period_end je nach API-Version am Abo oder am Item.
  const item = sub.items.data[0] as unknown as { current_period_end?: number };
  const subLvl = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? subLvl.current_period_end;
  return secs ? new Date(secs * 1000).toISOString() : new Date().toISOString();
}

async function upsertLessonSub(userId: string, customerId: string | null, sub: Stripe.Subscription) {
  const custom = customerId ?? (typeof sub.customer === "string" ? sub.customer : sub.customer.id);
  await admin().from("lesson_subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: custom,
      stripe_subscription_id: sub.id,
      quantity: subQuantity(sub),
      status: sub.status,
      current_period_end: periodEndISO(sub),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function onLessonSubChange(sub: Stripe.Subscription, forceStatus?: string) {
  const userId = sub.metadata?.user_id;
  const patch = {
    quantity: subQuantity(sub),
    status: forceStatus ?? sub.status,
    current_period_end: periodEndISO(sub),
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
  const db = admin();
  if (userId) await db.from("lesson_subscriptions").update(patch).eq("user_id", userId);
  else await db.from("lesson_subscriptions").update(patch).eq("stripe_subscription_id", sub.id);
}

async function grantLessonCredits(userId: string, credits: number, invoiceId: string) {
  if (credits <= 0) return;
  const expires = new Date(Date.now() + LESSON.creditValidityDays * 86400000).toISOString();
  await admin().from("lesson_credit_grants").upsert(
    { user_id: userId, credits_granted: credits, credits_remaining: credits, expires_at: expires, stripe_invoice_id: invoiceId },
    { onConflict: "stripe_invoice_id", ignoreDuplicates: true },
  );
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return new Response("Stripe not configured", { status: 500 });

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.kind === "lesson") {
          const userId = s.client_reference_id ?? s.metadata?.user_id;
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
          if (userId && subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            await upsertLessonSub(userId, customerId, sub);
          }
        } else {
          const email = s.customer_details?.email ?? s.customer_email ?? null;
          const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
          await upsertPaid(email, customerId, "active");
        }
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const subField = (inv as unknown as { subscription?: string | { id: string } }).subscription;
        const subId = typeof subField === "string" ? subField : subField?.id;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        if (sub.metadata?.kind !== "lesson") break; // nur unser Stunden-Abo
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        await upsertLessonSub(userId, null, sub); // Zustand aktuell halten
        // Nur saubere Monats-Gutschriften; Upgrades schreibt die Verwaltungs-Route direkt gut.
        if (inv.billing_reason === "subscription_create" || inv.billing_reason === "subscription_cycle") {
          await grantLessonCredits(userId, subQuantity(sub), inv.id ?? `${subId}_${inv.period_end}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.kind === "lesson") {
          await onLessonSubChange(sub);
        } else {
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          await setStatusByCustomer(customerId, sub.status);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.kind === "lesson") {
          await onLessonSubChange(sub, "canceled");
        } else {
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          await setStatusByCustomer(customerId, "canceled");
        }
        break;
      }
    }
  } catch (err) {
    return new Response(`Handler error: ${(err as Error).message}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
