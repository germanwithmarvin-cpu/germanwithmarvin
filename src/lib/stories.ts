"use client";

import { createClient } from "@/lib/supabase/client";
import type { Story } from "@/lib/data";
import { slugify } from "@/lib/lessons";

function fromRow(r: Record<string, unknown>): Story {
  return {
    id: r.id as string,
    title: (r.title as string) ?? "",
    level: (r.level as Story["level"]) ?? "A1",
    intro: (r.intro as string) ?? "",
    body: (r.body as string) ?? "",
  };
}

function toRow(story: Story, sortOrder?: number) {
  const row: Record<string, unknown> = {
    id: story.id,
    title: story.title,
    level: story.level,
    intro: story.intro,
    body: story.body,
  };
  if (sortOrder !== undefined) row.sort_order = sortOrder;
  return row;
}

export async function getStories(): Promise<Story[]> {
  const supabase = createClient();
  const { data } = await supabase.from("stories").select("*").order("sort_order", { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function getStory(id: string): Promise<Story | null> {
  const supabase = createClient();
  const { data } = await supabase.from("stories").select("*").eq("id", id).single();
  return data ? fromRow(data) : null;
}

export async function saveStory(story: Story, sortOrder?: number): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("stories").upsert(toRow(story, sortOrder));
  return { error: error?.message };
}

export async function deleteStory(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  return { error: error?.message };
}

export async function saveStoryOrder(orderedIds: string[]): Promise<{ error?: string }> {
  const supabase = createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("stories").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  return {};
}

export { slugify };
