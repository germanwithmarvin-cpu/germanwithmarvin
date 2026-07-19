import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { LESSON } from "@/lib/config";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// Bestehendes Stunden-Abo verwalten: Menge ändern / kündigen / fortsetzen.
//  - erhöhen  → sofort (anteilig berechnet) + Guthaben-Delta gutschreiben
//  - senken   → zum nächsten Zyklus (keine Rückerstattung; aktuelles Guthaben bleibt)
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  const { action, quantity } = await req.json().catch(() => ({}));

  const { data: sub } = await supabase
    .from("lesson_subscriptions")
    .select("stripe_subscription_id, quantity")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!sub?.stripe_subscription_id) return json({ error: "No active plan found." }, 404);

  const stripe = new Stripe(secretKey);
  const subId = sub.stripe_subscription_id;
  const current = sub.quantity ?? 0;

  try {
    if (action === "cancel") {
      await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
      await admin().from("lesson_subscriptions").update({ cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      return json({ ok: true });
    }
    if (action === "resume") {
      await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
      await admin().from("lesson_subscriptions").update({ cancel_at_period_end: false, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      return json({ ok: true });
    }
    if (action === "set_quantity") {
      const newQty = Math.round(Number(quantity));
      if (!Number.isFinite(newQty) || newQty < LESSON.minHours || newQty > LESSON.maxHours) {
        return json({ error: `Please choose between ${LESSON.minHours} and ${LESSON.maxHours} hours.` }, 400);
      }
      if (newQty === current) return json({ ok: true });

      const full = await stripe.subscriptions.retrieve(subId);
      const itemId = full.items.data[0].id;

      if (newQty > current) {
        // Erhöhen: sofort, anteilig berechnet.
        await stripe.subscriptions.update(subId, {
          items: [{ id: itemId, quantity: newQty }],
          proration_behavior: "always_invoice",
        });
        // Guthaben-Delta sofort gutschreiben (die Proration-Rechnung wird im
        // Webhook bewusst NICHT gutgeschrieben, um Doppelung zu vermeiden).
        const delta = newQty - current;
        const expires = new Date(Date.now() + LESSON.creditValidityDays * 86400000).toISOString();
        await admin().from("lesson_credit_grants").upsert(
          { user_id: user.id, credits_granted: delta, credits_remaining: delta, expires_at: expires, stripe_invoice_id: `increase_${subId}_${Date.now()}` },
          { onConflict: "stripe_invoice_id", ignoreDuplicates: true },
        );
        await admin().from("lesson_subscriptions").update({ quantity: newQty, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      } else {
        // Senken: gilt zum nächsten Abrechnungszyklus, keine Rückerstattung.
        // Aktuelles Guthaben bleibt bestehen (bereits gutgeschrieben).
        await stripe.subscriptions.update(subId, {
          items: [{ id: itemId, quantity: newQty }],
          proration_behavior: "none",
        });
        await admin().from("lesson_subscriptions").update({ quantity: newQty, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      }
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}
