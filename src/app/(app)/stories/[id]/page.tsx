"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Story } from "@/lib/data";
import { getStory } from "@/lib/stories";
import { getAccess, canAccessVideoLevel } from "@/lib/access";
import Paywall from "@/components/Paywall";
import RichText from "@/components/RichText";

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null | undefined>(undefined);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, access] = await Promise.all([getStory(params.id), getAccess()]);
      if (cancelled) return;
      if (s && !canAccessVideoLevel(access.tier, s.level)) {
        setBlocked(true);
        setStory(s);
        return;
      }
      setStory(s ?? null);
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  if (story === undefined) return <p className="text-sm text-cream-dim">Loading story…</p>;
  if (blocked) return <Paywall title="This story needs a membership" />;
  if (story === null) {
    return (
      <div className="space-y-4">
        <p>Story not found.</p>
        <Link href="/stories" className="btn-outline px-4 py-2 inline-block">Back to stories</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/stories" className="text-sm text-cream-dim hover:text-cream">← Stories</Link>
      <div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold-bright">{story.level}</span>
        <h1 className="text-3xl font-bold mt-2">{story.title}</h1>
        {story.intro && <p className="text-cream-dim mt-1">{story.intro}</p>}
      </div>

      {story.body.trim() && (
        <article className="card p-6 leading-relaxed text-cream text-lg">
          <RichText text={story.body} />
        </article>
      )}

      {story.fileUrl && (
        <a href={story.fileUrl} target="_blank" rel="noreferrer" className="btn-gold px-5 py-3 inline-flex items-center gap-2">
          ⬇ Download the book (PDF)
        </a>
      )}

      <div>
        <Link href="/stories" className="btn-outline px-5 py-2.5 inline-block">← Back to all stories</Link>
      </div>
    </div>
  );
}
