import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { COURSE } from "@/lib/config";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// Startet den Checkout für das App-Abo (neues Modell).
//   plan = "monthly"  → wiederkehrendes Abo (Stripe-Preis monatlich)
//   plan = "yearly"   → Jahr; erkennt automatisch, ob der Stripe-Preis
//                       wiederkehrend (Abo) oder einmalig (Einmalzahlung) ist.
//
// Login-pflichtig: so kann eine Einmalzahlung dem Konto zugeordnet und der
// Zugang sauber auf 365 Tage befristet werden (profiles.access_expires_at,
// das my_access() bereits auswertet). Abos laufen weiter über paid_subscriptions.
//
// Managed Payments: Stripe ist Merchant of Record und führt die USt ab.
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please create a free account or sign in first." }, 401);
  const { data: dp } = await supabase.from("profiles").select("is_demo").eq("id", user.id).maybeSingle();
  if (dp?.is_demo) return json({ error: "Subscriptions are disabled on the demo account." }, 403);

  const body = await req.json().catch(() => ({}));
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  const priceId = plan === "yearly" ? COURSE.yearlyPriceId : COURSE.monthlyPriceId;
  if (!priceId) return json({ error: "Price not configured." }, 400);

  const stripe = new Stripe(secretKey);

  // Modus aus dem Preis ableiten: recurring → Abo, sonst Einmalzahlung.
  let mode: "subscription" | "payment";
  try {
    const price = await stripe.prices.retrieve(priceId);
    mode = price.recurring ? "subscription" : "payment";
  } catch {
    return json({ error: "Could not load the selected plan. Please try again." }, 502);
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const meta: Record<string, string> = { kind: "app", plan };
  if (mode === "payment") meta.grant_days = "365"; // Einmalzahlung = 1 Jahr Zugang

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    managed_payments: { enabled: true },
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: meta,
    // subscription_data-Metadaten nur im Abo-Modus (die Abo-Events lesen sie);
    // bei der Einmalzahlung reicht die Session-Metadata (checkout.session.completed).
    ...(mode === "subscription" ? { subscription_data: { metadata: meta } } : {}),
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
  });

  return json({ url: session.url });
}
