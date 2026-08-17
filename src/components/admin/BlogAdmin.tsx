"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import RichEditor from "@/components/RichEditor";
import { uploadFile } from "@/lib/upload";
import { getAllPosts, savePost, deletePost, slugify, type BlogPost } from "@/lib/blog";

function empty(): BlogPost {
  return { id: "", slug: "", title: "", excerpt: "", coverUrl: "", body: "", published: false, publishedAt: null, createdAt: "", updatedAt: "" };
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() { setPosts(await getAllPosts()); }
  useEffect(() => { refresh(); }, []);

  function setField<K extends keyof BlogPost>(k: K, v: BlogPost[K]) {
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  }

  // Slug automatisch aus dem Titel, solange der Slug leer ist (nicht ueberschreiben).
  function onTitle(title: string) {
    setEditing((e) => (e ? { ...e, title, slug: e.slug || slugify(title) } : e));
  }

  async function onCover(file: File) {
    setUploading(true); setError(null);
    const { url, error } = await uploadFile(file, editing?.slug || "blog", "uploads");
    setUploading(false);
    if (error) { setError(error); return; }
    if (url) setField("coverUrl", url);
  }

  async function save() {
    if (!editing) return;
    setError(null); setMsg(null);
    if (!editing.title.trim()) { setError("Please add a title."); return; }
    const slug = editing.slug.trim() || slugify(editing.title);
    setBusy(true);
    const { error, id } = await savePost({ ...editing, slug });
    setBusy(false);
    if (error) { setError(error); return; }
    setMsg(editing.published ? "Saved & published ✓" : "Saved as draft ✓");
    setEditing((e) => (e ? { ...e, id: id || e.id, slug } : e));
    refresh();
  }

  async function remove(p: BlogPost) {
    if (!p.id) { setEditing(null); return; }
    if (!confirm(`Delete “${p.title || "untitled"}”? This cannot be undone.`)) return;
    const { error } = await deletePost(p.id);
    if (error) { setError(error); return; }
    setEditing(null); refresh();
  }

  const inputCls = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold";

  // ── Editor ────────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setEditing(null)} className="text-sm text-cream-dim hover:text-cream">← Back to posts</button>
          <div className="flex items-center gap-2">
            <button onClick={() => remove(editing)} className="text-sm text-red-700 hover:underline">Delete</button>
            <button onClick={save} disabled={busy} className="btn-gold px-5 py-2 text-sm disabled:opacity-50">
              {busy ? "Saving…" : editing.published ? "Save & publish" : "Save draft"}
            </button>
          </div>
        </div>

        {msg && <p className="text-sm bg-green-accent/20 rounded-lg p-3">{msg}</p>}
        {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}

        <label className="block">
          <span className="text-xs text-cream-dim">Title</span>
          <input value={editing.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. The 3 mistakes every beginner makes with der/die/das" className={`${inputCls} text-lg font-semibold mt-1`} />
        </label>

        <label className="block">
          <span className="text-xs text-cream-dim">URL slug</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-cream-dim shrink-0">/blog/</span>
            <input value={editing.slug} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="der-die-das" className={inputCls} />
          </div>
        </label>

        <label className="block">
          <span className="text-xs text-cream-dim">Short summary (shown in the list, search results & social)</span>
          <textarea value={editing.excerpt} onChange={(e) => setField("excerpt", e.target.value)} rows={2} placeholder="One or two sentences that make people want to read." className={`${inputCls} mt-1`} />
        </label>

        <div>
          <span className="text-xs text-cream-dim">Cover image</span>
          <div className="flex items-center gap-3 mt-1">
            {editing.coverUrl
              ? <img src={editing.coverUrl} alt="" className="w-28 h-16 object-cover rounded-lg" />
              : <div className="w-28 h-16 grid place-items-center rounded-lg bg-bordeaux-deep/60 text-2xl">🖼️</div>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onCover(f); e.currentTarget.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
              {uploading ? "Uploading…" : editing.coverUrl ? "Change image" : "Upload image"}
            </button>
            {editing.coverUrl && <button onClick={() => setField("coverUrl", "")} className="text-xs text-red-700 hover:underline">Remove</button>}
          </div>
        </div>

        <div>
          <span className="text-xs text-cream-dim">Article</span>
          <div className="mt-1">
            <RichEditor value={editing.body} onChange={(html) => setField("body", html)} placeholder="Write your article… use the toolbar for headings, bold and italic." />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.published} onChange={(e) => setField("published", e.target.checked)} />
          <span>Published <span className="text-cream-dim">(visible at /blog — uncheck to keep it a draft)</span></span>
        </label>

        {editing.published && editing.slug && (
          <p className="text-xs text-cream-dim">Public link: <a href={`/blog/${editing.slug}`} target="_blank" rel="noreferrer" className="text-gold-bright underline underline-offset-4">/blog/{editing.slug}</a></p>
        )}
      </div>
    );
  }

  // ── Liste ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Blog ✍️</h3>
          <p className="text-sm text-cream-dim">Write articles that drive traffic to your trial. Public at <a href="/blog" target="_blank" rel="noreferrer" className="text-gold-bright underline underline-offset-4">/blog</a>.</p>
        </div>
        <button onClick={() => { setMsg(null); setError(null); setEditing(empty()); }} className="btn-gold px-4 py-2 text-sm">+ New post</button>
      </div>

      {posts === null ? (
        <p className="text-sm text-cream-dim">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-cream-dim">No posts yet. Click “New post” to write your first one. (Needs <code>supabase/blog.sql</code> applied once.)</p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <button key={p.id} onClick={() => { setMsg(null); setError(null); setEditing(p); }}
              className="w-full text-left card p-3 flex items-center gap-3 hover:border-gold/50 transition">
              {p.coverUrl
                ? <img src={p.coverUrl} alt="" className="w-16 h-10 object-cover rounded shrink-0" />
                : <div className="w-16 h-10 grid place-items-center rounded bg-bordeaux-deep/60 shrink-0">📝</div>}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.title || "Untitled"}</div>
                <div className="text-xs text-cream-dim truncate">/blog/{p.slug}</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${p.published ? "text-green-700" : "text-cream-dim"}`}
                style={{ background: p.published ? "color-mix(in srgb, var(--green-accent) 20%, transparent)" : "color-mix(in srgb, var(--cream-dim) 15%, transparent)" }}>
                {p.published ? "Published" : "Draft"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
