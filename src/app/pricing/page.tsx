/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";
import PricingPlans from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing — German with Marvin",
  description:
    "Simple pricing for the full German course (A1–B2): $29/month, or $19/month paid yearly. Video lessons, 2,600+ flashcards, stories and exercises. 5-day free trial.",
  alternates: { canonical: "https://www.germanwithmarvin.com/pricing" },
};

export default function PricingPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav />
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 pb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">Pricing</span>
          <h1 className="text-3xl sm:text-4xl font-bold">One course, everything included</h1>
          <p className="mt-3 text-[#3B2922]/75">
            Full access to the whole course from A1 to B2. Try it free for 5 days — no credit card. Choose a plan only if you decide to stay.
          </p>
        </div>

        <PricingPlans />

        {/* Trial-Hinweis */}
        <div className="mt-10 text-center">
          <Link href="/register" className="inline-block rounded-xl border-2 border-[#8A3030] text-[#8A3030] px-6 py-3 font-semibold hover:bg-[#8A3030]/5 transition">
            Start your 5-day free trial first →
          </Link>
        </div>

        {/* Kurz-FAQ */}
        <div className="mt-14 max-w-2xl mx-auto space-y-5">
          <h2 className="text-xl font-bold text-center">Good to know</h2>
          <div>
            <p className="font-semibold">Can I cancel?</p>
            <p className="text-sm text-[#3B2922]/75">Yes — the monthly plan can be cancelled anytime. The yearly plan is a single payment for 12 months and does not renew automatically.</p>
          </div>
          <div>
            <p className="font-semibold">Is there tax on top?</p>
            <p className="text-sm text-[#3B2922]/75">Prices are shown excluding tax. Applicable VAT/sales tax is added at checkout based on your location — Stripe handles it.</p>
          </div>
          <div>
            <p className="font-semibold">What about 1-on-1 lessons?</p>
            <p className="text-sm text-[#3B2922]/75">Private lessons with a real teacher are separate from the course — see <Link href="/online-german-lessons" className="text-[#8A3030] underline underline-offset-4 font-semibold">1-on-1 lessons</Link>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
