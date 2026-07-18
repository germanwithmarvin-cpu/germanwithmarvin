import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe meldet hierher: bezahlt / gekündigt / Zahlung fehlgeschlagen.
// Pay-first-Modell: Das Konto existiert bei der Zahlung evtl. noch nicht,
// daher merken wir uns die BEZAHLTE E-MAIL in paid_subscriptions. Der Zugang
// wird daraus live abgeleitet (siehe public.my_access()).
//
// Nötige Umgebungsvariablen (Vercel + .env.local):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY

export const runtime = "nodejs";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// Abo eintragen/aktualisieren (per E-Mail als Schlüssel).
async function upsertPaid(email: string | null | undefined, customerId: string | null | undefined, status: string) {
  if (!email) return;
  const db = admin();
  await db.from("paid_subscriptions").upsert(
    { email: email.toLowerCase(), stripe_customer_id: customerId ?? null, status, updated_at: new Date().toISOString() },
    { onConflict: "email" },
  );
}

// Status anhand der Stripe-Kundennummer ändern (Kündigung etc.).
async function setStatusByCustomer(customerId: string, status: string) {
  const db = admin();
  await db.from("paid_subscriptions").update({ status, updated_at: new Date().toISOString() }).eq("stripe_customer_id", customerId);
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
        const email = s.customer_details?.email ?? s.customer_email ?? null;
        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
        await upsertPaid(email, customerId, "active");
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setStatusByCustomer(customerId, sub.status); // active | past_due | canceled | …
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setStatusByCustomer(customerId, "canceled");
        break;
      }
    }
  } catch (err) {
    return new Response(`Handler error: ${(err as Error).message}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
