import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";

function Stars() {
  return <span className="text-gold-bright">★★★★★</span>;
}

export default function Reviews() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">What my students say</h2>
        <p className="mt-2 text-cream-dim">
          <Stars /> <span className="font-semibold text-cream">{PREPLY_STATS.rating}</span> ·{" "}
          {PREPLY_STATS.reviews} reviews · {PREPLY_STATS.lessons.toLocaleString("en-US")}+ lessons taught
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {REVIEWS.map((r, i) => (
          <div key={i} className="card p-5 mb-4 break-inside-avoid">
            <Stars />
            <p className="mt-2 text-sm text-cream">{r.text}</p>
            <p className="mt-3 text-xs text-cream-dim">— {r.name}, {r.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
