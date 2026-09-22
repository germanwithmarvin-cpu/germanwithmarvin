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
  const { data: dp } = await supabase.from("profiles").select("is_demo").eq("id", user.id).maybeSingle();
  if (dp?.is_demo) return json({ error: "Booking is disabled on the demo account. Create your own account to book lessons." }, 403);

  const body = await req.json().catch(() => ({}));
  const quantity = Math.round(Number(body.quantity));
  if (!Number.isFinite(quantity) || quantity < LESSON.minHours || quantity > LESSON.maxHours) {
    return json({ error: `Please choose between ${LESSON.minHours} and ${LESSON.maxHours} hours.` }, 400);
  }

  // Welcher Lehrer? Default 1 = Marvin (bestehendes Verhalten). Preis + Aktiv-Status
  // kommen aus der teachers-Tabelle; nur aktive Lehrer sind buchbar.
  const teacherId = Number.isFinite(Number(body.teacher_id)) ? Math.round(Number(body.teacher_id)) : 1;
  const { data: teacher } = await supabase
    .from("teachers")
    .select("stripe_price_id, active")
    .eq("id", teacherId)
    .maybeSingle();
  if (!teacher || !teacher.active) return json({ error: "This teacher is not available." }, 400);
  const priceId = teacher.stripe_price_id || (teacherId === 1 ? LESSON.stripePriceId : null);
  if (!priceId) return json({ error: "No price configured for this teacher." }, 400);

  // Schon ein aktives Stunden-Abo BEI DIESEM LEHRER? Dann über "Verwalten" ändern.
  const { data: existing } = await supabase
    .from("lesson_subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (existing && ["active", "past_due"].includes(existing.status)) {
    return json({ error: "You already have an active plan with this teacher — change the hours under 'Manage'." }, 409);
  }

  const stripe = new Stripe(secretKey);
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const meta = { kind: "lesson", user_id: user.id, teacher_id: String(teacherId) };
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity }],
    // Managed Payments: Stripe ist Merchant of Record und berechnet, weist aus
    // und führt die USt ab (wie beim App-Abo-Payment-Link). Voraussetzung im
    // Dashboard: Managed Payments aktiviert + ToS akzeptiert, und das Stunden-
    // Produkt hat einen zulässigen Steuercode ("Eligible for Managed Payments").
    // Steuer kommt on top (Price tax_behavior = exclusive), passend zu unseren
    // Netto-Preisen + "+ tax"-Hinweis.
    managed_payments: { enabled: true },
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: meta,
    subscription_data: { metadata: meta },
    allow_promotion_codes: true,
    success_url: `${origin}/booking?checkout=success`,
    cancel_url: `${origin}/booking?checkout=cancel`,
  });

  return json({ url: session.url });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
