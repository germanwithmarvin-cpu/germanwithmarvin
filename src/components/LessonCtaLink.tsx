"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackLead } from "@/lib/track";

// Kleiner Client-Wrapper um einen CTA-Link, der beim Klick ein Meta-"Lead"-Event
// feuert. So kann Meta auf CTA-Klicks optimieren (vorher gab es auf /ha nur
// PageView, erst /register meldete CompleteRegistration). Kein Umbau der Seite.
export default function LessonCtaLink({ href, className, source, children }: { href: string; className?: string; source?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => trackLead(source ? { source } : undefined)}>
      {children}
    </Link>
  );
}
