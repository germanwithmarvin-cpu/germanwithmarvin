"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { countDueToday, DAILY_NEW_LIMIT } from "@/lib/study";

export default function DueToday() {
  const [due, setDue] = useState<number | null>(null);

  useEffect(() => {
    countDueToday().then(setDue);
  }, []);

  if (due === null) return <div className="card p-6 text-cream-dim">Loading your review…</div>;

  return (
    <div className="card p-6">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gold-bright">{due}</span>
        <span className="text-cream-dim">card{due === 1 ? "" : "s"} due today</span>
      </div>

      {due === 0 ? (
        <p className="text-cream-dim mt-3 text-sm">
          Nothing due right now — you are all caught up! 🎉 New cards become available each day.
        </p>
      ) : (
        <>
          <p className="text-cream-dim mt-2 text-sm">
            Up to {DAILY_NEW_LIMIT} new cards a day, plus any reviews that are due.
          </p>
          <Link href="/study/today" className="btn-gold px-4 py-2 mt-4 inline-block text-sm">
            Study today&apos;s cards
          </Link>
        </>
      )}
    </div>
  );
}
