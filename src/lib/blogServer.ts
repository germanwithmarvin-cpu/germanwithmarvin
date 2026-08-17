import { createClient } from "@supabase/supabase-js";

// Serverseitiges Lesen der Blog-Posts (fuer SSR + SEO). Anon-Client ohne Session:
// RLS erlaubt anonym nur veroeffentlichte Posts.
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  body: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function fromRow(r: Record<string, unknown>): BlogPost {
  return {
    id: r.id as string,
    slug: (r.slug as string) ?? "",
    title: (r.title as string) ?? "",
    excerpt: (r.excerpt as string) ?? "",
    coverUrl: (r.cover_url as string) ?? "",
    body: (r.body as string) ?? "",
    published: Boolean(r.published),
    publishedAt: (r.published_at as string) ?? null,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

function anon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data } = await anon()
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []).map(fromRow);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const { data } = await anon()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? fromRow(data) : null;
}

export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const { data } = await anon()
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true);
  return (data ?? []).map((r) => ({ slug: r.slug as string, updatedAt: (r.updated_at as string) ?? "" }));
}
