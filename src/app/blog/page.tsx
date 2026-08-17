/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import LegalFooter from "@/components/LegalFooter";
import { getPublishedPosts } from "@/lib/blogServer";

export const revalidate = 60; // neue Posts erscheinen binnen ~1 Min ohne Deploy

export const metadata: Metadata = {
  title: "Blog — Learn German with Marvin",
  description: "Free German tips, grammar explained simply, and study advice — from A1 to B2. New articles regularly.",
  alternates: { canonical: "https://www.germanwithmarvin.com/blog" },
  openGraph: {
    title: "Blog — Learn German with Marvin",
    description: "Free German tips, grammar explained simply, and study advice from A1 to B2.",
    url: "https://www.germanwithmarvin.com/blog",
    type: "website",
  },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
        <Logo />
        <Link href="/register" className="btn-gold px-4 py-2 text-sm">Start free trial</Link>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">The German with Marvin blog</h1>
          <p className="text-cream-dim mt-2 max-w-2xl">
            Free tips, grammar made simple and honest study advice — from a teacher who lives it every day.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="card p-8 text-center text-cream-dim">
            No articles yet — the first one is on its way. 🎬
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`}
                className="card overflow-hidden flex flex-col group transition hover:border-gold/50">
                {p.coverUrl ? (
                  <div className="aspect-video overflow-hidden bg-bordeaux-deep/50">
                    <img src={p.coverUrl} alt="" loading="lazy" decoding="async"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-video grid place-items-center text-4xl bg-bordeaux-deep/50">📝</div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-[11px] text-cream-dim">{fmtDate(p.publishedAt)}</div>
                  <div className="font-semibold leading-tight mt-1 group-hover:text-cream">{p.title}</div>
                  {p.excerpt && <p className="text-sm text-cream-dim mt-2 line-clamp-3">{p.excerpt}</p>}
                  <span className="text-gold-bright text-sm mt-auto pt-3">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <LegalFooter />
    </div>
  );
}
