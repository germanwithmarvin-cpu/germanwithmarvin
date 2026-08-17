-- ============================================================================
-- Blog (Content-Marketing). Im Supabase SQL-Editor "Run". Idempotent.
--  - Oeffentliche Blog-Seiten lesen NUR veroeffentlichte Posts.
--  - Schreiben/Entwuerfe: nur Lehrer.
--  - Cover-Bilder liegen im vorhandenen oeffentlichen "uploads"-Bucket.
-- ============================================================================

create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null default '',
  excerpt      text not null default '',
  cover_url    text,
  body         text not null default '',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Lesen: veroeffentlichte Posts fuer ALLE (auch anonym, fuer SEO); Entwuerfe nur Lehrer.
drop policy if exists "blog public read" on public.blog_posts;
create policy "blog public read" on public.blog_posts for select
  using (published = true or public.is_teacher());

-- Schreiben/Bearbeiten/Loeschen: nur Lehrer.
drop policy if exists "blog teacher insert" on public.blog_posts;
create policy "blog teacher insert" on public.blog_posts for insert with check (public.is_teacher());

drop policy if exists "blog teacher update" on public.blog_posts;
create policy "blog teacher update" on public.blog_posts for update using (public.is_teacher());

drop policy if exists "blog teacher delete" on public.blog_posts;
create policy "blog teacher delete" on public.blog_posts for delete using (public.is_teacher());

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

create index if not exists blog_posts_published_idx
  on public.blog_posts (published, published_at desc);

select 'blog.sql angewandt' as status;
