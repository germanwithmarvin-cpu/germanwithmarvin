import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { GROUP_COURSE, groupCoursePrice, groupCoursePriceId } from "@/lib/config";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// Checkout für den B1-Live-Gruppenkurs. Einmalzahlung in EUR über Stripe
// (Managed Payments / Merchant of Record → Stripe führt die USt ab). Login-
// pflichtig, damit der Kauf einem Konto zugeordnet und der befristete App-Zugang
// (8 Wochen) sauber vergeben werden kann. Der Webhook (kind="group_course")
// schreibt die Einschreibung + schaltet den Zugang frei + schickt die Bestätigung.
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please create a free account or sign in first." }, 401);
  const { data: dp } = await supabase.from("profiles").select("is_demo").eq("id", user.id).maybeSingle();
  if (dp?.is_demo) return json({ error: "Purchases are disabled on the demo account." }, 403);

  const priceId = groupCoursePriceId();
  if (!priceId) return json({ error: "Course price is not configured yet." }, 400);

  const stripe = new Stripe(secretKey);

  // Modus aus dem Preis ableiten (one-time → payment). Sicherheitsnetz, falls
  // versehentlich ein wiederkehrender Preis eingetragen wurde.
  let mode: "subscription" | "payment";
  try {
    const price = await stripe.prices.retrieve(priceId);
    mode = price.recurring ? "subscription" : "payment";
  } catch {
    return json({ error: "Could not load the course price. Please try again." }, 502);
  }
  if (mode !== "payment") return json({ error: "Course price must be a one-time price." }, 400);

  const body = await req.json().catch(() => ({}));
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  // UTM/Attribution (vom Client aus den First-Touch-Cookies) in die Stripe-
  // Metadaten, damit jeder Kauf einer Kampagne zugeordnet werden kann.
  const clip = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");
  const meta: Record<string, string> = {
    kind: "group_course",
    course_id: GROUP_COURSE.slug,
    user_id: user.id,
    grant_days: String(GROUP_COURSE.appAccessDays),
  };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "gclid", "ref"]) {
    const v = clip(body?.[k]);
    if (v) meta[k] = v;
  }

  const price = groupCoursePrice();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    managed_payments: { enabled: true },
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: meta,
    allow_promotion_codes: true,
    success_url: `${origin}/b1-course?purchase=success&value=${price}`,
    cancel_url: `${origin}/b1-course?purchase=cancel`,
  });

  return json({ url: session.url });
}
