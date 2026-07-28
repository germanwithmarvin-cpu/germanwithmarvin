import { checkoutUrl } from "@/lib/config";

// Direkter Weg zum Monats-Abo (OHNE 5-Tage-Trial) – zum Weitergeben an private
// Leads, die sofort abschließen wollen.
//
//   www.germanwithmarvin.com/subscribe            -> Stripe-Checkout ($39/Monat)
//   www.germanwithmarvin.com/subscribe?email=x@y  -> zusätzlich E-Mail vorbefüllt
//
// Pay-first: Nach der Zahlung führt Stripe (Success-URL) auf /register; der
// Kunde legt mit DERSELBEN E-Mail sein Konto an und ist sofort voll freigeschaltet.

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // nie cachen – immer frisch weiterleiten

export function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email") ?? "";
  const dest = checkoutUrl(email.includes("@") ? email : undefined);
  return Response.redirect(dest, 307);
}
