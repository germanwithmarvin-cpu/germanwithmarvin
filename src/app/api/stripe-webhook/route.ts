import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe schickt hierher Ereignisse (bezahlt, gekündigt …). Wir schalten den
// Zugang des Nutzers danach automatisch frei oder wieder ab.
//
// Nötige Umgebungsvariablen (in Vercel + .env.local):
//   STRIPE_SECRET_KEY          – Stripe → Developers → API keys (Secret key)
//   STRIPE_WEBHOOK_SECRET      – Stripe → Developers → Webhooks → Signing secret
//   SUPABASE_SERVICE_ROLE_KEY  – Supabase → Project settings → API → service_role

export const runtime = "nodejs";

// Admin-Client (umgeht RLS) – nur serverseitig, mit dem Service-Role-Key.
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function setScope(where: { id?: string; customerId?: string }, scope: "full" | "none", customerId?: string) {
  const db = admin();
  const patch: Record<string, unknown> = { access_scope: scope };
  if (customerId) patch.stripe_customer_id = customerId;

  if (where.id) {
    await db.from("profiles").update(patch).eq("id", where.id);
  } else if (where.customerId) {
    await db.from("profiles").update(patch).eq("stripe_customer_id", where.customerId);
  }
}

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // Rohtext für die Signaturprüfung

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // Bezahlt: Konto auf Vollzugang schalten und Stripe-Kundennummer merken.
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id ?? undefined;
        const customerId = (typeof s.customer === "string" ? s.customer : s.customer?.id) ?? undefined;
        if (userId) await setScope({ id: userId }, "full", customerId);
        else if (customerId) await setScope({ customerId }, "full", customerId);
        break;
      }

      // Abo wieder aktiv (z. B. nach erfolgreicher Zahlung): Vollzugang sicherstellen.
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const active = sub.status === "active" || sub.status === "trialing";
        await setScope({ customerId }, active ? "full" : "none");
        break;
      }

      // Gekündigt / ausgelaufen: Zugang entziehen (zurück auf nur A1).
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setScope({ customerId }, "none");
        break;
      }
    }
  } catch (err) {
    // Bei einem Fehler 500 melden – Stripe versucht es dann erneut.
    return new Response(`Handler error: ${(err as Error).message}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
