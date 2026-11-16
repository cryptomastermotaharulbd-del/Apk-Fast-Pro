-- APK FAST PRO — Supabase schema, RLS, storage, RPCs
-- Run in Supabase SQL Editor (or `supabase db push`). Safe to re-run where noted.

create extension if not exists pgcrypto;

-- ============ helpers ============
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid() and a.is_active);
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ tables ============
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('super_admin','admin','editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  icon_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_url text default '',
  short_description text default '',
  full_description text default '',
  version text default '1.0.0',
  size text default '',
  size_bytes bigint,
  android_min text default '5.0',
  developer text default '',
  category_id uuid references public.categories(id) on delete set null,
  release_date date,
  updated_date date,
  whats_new text default '',
  permissions jsonb not null default '[]'::jsonb,
  download_method text not null default 'external' check (download_method in ('r2','external')),
  apk_url text default '',            -- R2 public URL (method = r2)
  apk_key text default '',            -- R2 object key
  external_url text default '',       -- Google Drive / MediaFire / Dropbox / other (method = external)
  download_count bigint not null default 0,
  view_count bigint not null default 0,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  publish_at timestamptz,
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists apps_status_idx on public.apps(status);
create index if not exists apps_featured_idx on public.apps(is_featured);
create index if not exists apps_downloads_idx on public.apps(download_count desc);
create index if not exists apps_updated_idx on public.apps(updated_date desc);
create index if not exists apps_category_idx on public.apps(category_id);

create table if not exists public.app_screenshots (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists screenshots_app_idx on public.app_screenshots(app_id, sort_order);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',          -- sanitized HTML at render time
  content_format text not null default 'html' check (content_format in ('html','xml')),
  excerpt text default '',
  cover_url text default '',
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  publish_at timestamptz,
  seo_title text default '',
  seo_description text default '',
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete set null,
  app_slug text,
  version text,
  method text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists downloads_app_idx on public.downloads(app_id, created_at desc);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists apps_touch on public.apps;
create trigger apps_touch before update on public.apps for each row execute function public.touch_updated_at();
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();
drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

-- ============ RPCs (server / anon-safe counters) ============
create or replace function public.increment_download(p_app_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.apps set download_count = download_count + 1 where id = p_app_id;
end $$;

create or replace function public.increment_view(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.apps set view_count = view_count + 1 where slug = p_slug and status = 'published';
end $$;

-- ============ RLS ============
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.apps enable row level security;
alter table public.app_screenshots enable row level security;
alter table public.posts enable row level security;
alter table public.downloads enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- Public read: only published content. Admins read/write everything.
do $$ declare t text; begin
  for t in select unnest(array['categories','apps','app_screenshots','posts','site_settings']) loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
  end loop;
end $$;

create policy "public read" on public.categories for select using (true);
create policy "admin all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on public.apps for select
  using (status = 'published' or public.is_admin());
create policy "admin all" on public.apps for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on public.app_screenshots for select
  using (exists (select 1 from public.apps a where a.id = app_id and (a.status = 'published' or public.is_admin())));
create policy "admin all" on public.app_screenshots for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on public.posts for select
  using (status = 'published' or public.is_admin());
create policy "admin all" on public.posts for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on public.site_settings for select using (true);
create policy "admin all" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- downloads & logs & admins: admin only (inserts to downloads go through the
-- Netlify download function using the service role, which bypasses RLS).
create policy "admin all" on public.downloads for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read" on public.admins for select using (public.is_admin());
create policy "admin write" on public.admins for all using (public.is_admin()) with check (public.is_admin());

-- ============ Storage: bucket "media" (icons, screenshots, category icons) ============
insert into storage.buckets (id, name, public) values ('media','media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for all
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
-- NOTE: APK files do NOT go in Supabase Storage. They go to Cloudflare R2
-- (see netlify/functions/r2-upload-url.js) or an external URL.

-- ============ Seed: requested example categories + default settings ============
insert into public.categories (name, slug, description) values
 ('Social Media','social-media','Social and community apps'),
 ('Entertainment','entertainment','Movies, shows and fun'),
 ('Games','games','Android games'),
 ('Tools','tools','Utility and productivity tools'),
 ('Education','education','Learning apps'),
 ('Photography','photography','Photo editors and cameras'),
 ('Music','music','Music and audio apps'),
 ('Video Players','video-players','Video players and editors'),
 ('Communication','communication','Messaging and calling'),
 ('Security','security','Antivirus and security tools')
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
 ('site', '{"siteName":"APK FAST PRO","description":"Fast, safe APK downloads.","contactEmail":"","maintenanceMode":false,"social":{},"footerText":""}'::jsonb)
on conflict (key) do nothing;
