/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import LegalFooter from "@/components/LegalFooter";
import { getPublishedPost } from "@/lib/blogServer";

export const revalidate = 60;

const BASE = "https://www.germanwithmarvin.com";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article not found — German with Marvin" };
  const url = `${BASE}/blog/${post.slug}`;
  const desc = post.excerpt || "German tips, grammar and study advice from A1 to B2.";
  return {
    title: `${post.title} — German with Marvin`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: desc,
      url,
      type: "article",
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
    twitter: { card: post.coverUrl ? "summary_large_image" : "summary", title: post.title, description: desc },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 py-4 max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
        <Logo />
        <Link href="/register" className="btn-gold px-4 py-2 text-sm">Start free trial</Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-6">
        <Link href="/blog" className="text-sm text-cream-dim hover:text-cream">← All articles</Link>

        <article className="mt-4">
          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
          <div className="text-sm text-cream-dim mt-2">{fmtDate(post.publishedAt)}</div>

          {post.coverUrl && (
            <div className="rounded-xl overflow-hidden mt-5 aspect-video bg-bordeaux-deep/50">
              <img src={post.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {post.excerpt && <p className="text-lg text-cream-dim mt-5 leading-relaxed">{post.excerpt}</p>}

          <div className="richtext text-cream mt-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.body }} />
        </article>

        {/* Conversion-CTA */}
        <div className="card p-6 sm:p-8 mt-10 text-center" style={{ borderLeft: "5px solid var(--gold)" }}>
          <div className="text-3xl">🚀</div>
          <h2 className="text-xl font-bold mt-2">Ready to actually learn German?</h2>
          <p className="text-sm text-cream-dim mt-2 max-w-md mx-auto">
            Video lessons, 1,200+ interactive exercises and the full flashcard trainer — A1 to B2.
            Start free, no credit card.
          </p>
          <Link href="/register" className="btn-gold inline-block px-6 py-3 mt-5">Start your free 5-day trial →</Link>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
