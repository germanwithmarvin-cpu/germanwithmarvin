"use client";

import { createClient } from "@/lib/supabase/client";
import { fromRow, type BlogPost } from "@/lib/blogServer";
import { slugify } from "@/lib/lessons";

export type { BlogPost };
export { slugify };

// Alle Posts (inkl. Entwuerfe) - nur fuer Lehrer sichtbar (RLS).
export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false });
  return (data ?? []).map(fromRow);
}

export async function savePost(p: BlogPost): Promise<{ error?: string; id?: string }> {
  const supabase = createClient();
  const row: Record<string, unknown> = {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_url: p.coverUrl || null,
    body: p.body,
    published: p.published,
    // Erstes Veroeffentlichen setzt das Datum; danach bleibt es.
    published_at: p.published ? (p.publishedAt || new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  };
  if (p.id) row.id = p.id;
  const { data, error } = await supabase.from("blog_posts").upsert(row).select("id").single();
  return { error: error?.message, id: data?.id as string | undefined };
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  return { error: error?.message };
}
