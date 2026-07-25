"use client";

import { useEffect, useState } from "react";
import { appendRef } from "@/lib/referral";

// Checkout-Link, der einen evtl. gespeicherten Empfehlungscode als
// client_reference_id an den Stripe-Link hängt. Fällt ohne Code auf den
// normalen Link zurück. Ersetzt <a href={checkoutUrl()}> an den Zahl-Buttons.
export default function RefLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [finalHref, setFinalHref] = useState(href);
  // Cookie ist erst clientseitig lesbar → nach Hydration nachziehen.
  useEffect(() => {
    setFinalHref(appendRef(href));
  }, [href]);
  return (
    <a href={finalHref} className={className}>
      {children}
    </a>
  );
}
