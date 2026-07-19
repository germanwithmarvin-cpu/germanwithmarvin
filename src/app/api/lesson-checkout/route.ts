import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { LESSON } from "@/lib/config";

export const runtime = "nodejs";

// Startet ein Stripe-Abo (Checkout) für ein Stunden-Paket.
// Menge = Stunden/Monat (min. LESSON.minHours). Der Volume-Staffelpreis regelt
// den 5-%-Rabatt ab 8 Stunden automatisch.
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  const body = await req.json().catch(() => ({}));
  const quantity = Math.round(Number(body.quantity));
  if (!Number.isFinite(quantity) || quantity < LESSON.minHours || quantity > LESSON.maxHours) {
    return json({ error: `Please choose between ${LESSON.minHours} and ${LESSON.maxHours} hours.` }, 400);
  }

  // Schon ein aktives Stunden-Abo? Dann über "Verwalten" ändern statt neu buchen.
  const { data: existing } = await supabase
    .from("lesson_subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing && ["active", "past_due"].includes(existing.status)) {
    return json({ error: "You already have an active plan — change the hours under 'Manage'." }, 409);
  }

  const stripe = new Stripe(secretKey);
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: LESSON.stripePriceId, quantity }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { kind: "lesson", user_id: user.id },
    subscription_data: { metadata: { kind: "lesson", user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${origin}/booking?checkout=success`,
    cancel_url: `${origin}/booking?checkout=cancel`,
  });

  return json({ url: session.url });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
