// Kurzlink zum Preis-/Abo-Wähler. Früher führte er direkt zum Stripe-Checkout
// ($39/Monat, pay-first). Jetzt zur /pricing-Seite mit beiden Plänen (Monat $29
// bzw. Jahr $19 als Einmalzahlung). Der Checkout dort ist login-pflichtig.
//
//   www.germanwithmarvin.com/subscribe  ->  /pricing

export const dynamic = "force-dynamic"; // nie cachen – immer frisch weiterleiten

export function GET(req: Request) {
  return Response.redirect(new URL("/pricing", req.url), 307);
}
