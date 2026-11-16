# APK FAST PRO

A production-ready, database-powered APK publishing & downloading platform.

**Stack:** React + Vite + TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth,
Storage, Row Level Security) · Cloudflare R2 for APK files · Netlify hosting +
Netlify Functions (signed R2 uploads, counted download endpoint, dynamic sitemap).

> Honest status note: every feature below is implemented in code. Live data,
> auth, uploads and downloads start working once **you** create the Supabase
> project and (optionally) the R2 bucket and set the env vars described here.
> Nothing is faked: with no env vars the site renders an empty state with a
> visible “setup required” banner, and the download function returns 503.

## Features

**Public site** — Premium white professional UI, light + dark mode, mobile-first,
responsive on phones/tablets/desktop.
Home (Featured / Latest / Trending / Most Downloaded / Popular Categories /
Recently Updated / download banner), All Apps with pagination, dynamic app
pages `/app/:slug` (full description, screenshot gallery with full-screen
lightbox, version/size/Android/developer/category/dates, What's New,
permissions, download-information box, related apps), Categories +
`/category/:slug`, Latest, Trending, Search, Blog + `/post/:slug`,
About, Contact, Privacy, Disclaimer, DMCA, 404.

**Admin** (`/admin`, separate & protected) — Dashboard stats, full app CRUD
(all 21 form fields incl. SEO, draft/publish/schedule, featured toggle),
categories CRUD with icons, HTML/XML post system with **Visual editor +
HTML/XML code editor + Preview**, media library, download management +
history + per-app stats + link validation, analytics (14-day chart, per-app),
admin-user management, and full site settings (name, logo, favicon,
description, contact email, social links, theme, homepage sections, footer,
default SEO, maintenance mode).

**Downloads, counted properly** — the public button goes to
`/download/:slug` → a Netlify Function that increments the counter, writes a
`downloads` history row, then redirects to the file. Page views never count.

**Two APK methods (admin chooses per app)**
- **A — Direct upload to Cloudflare R2:** browser asks a Netlify Function for a
  presigned URL. The function verifies the caller is an active admin (Supabase
  JWT + `admins` table), validates `.apk` and size, then signs with the R2
  secret — **secrets never touch the browser**. Upload progress is shown;
  replacing an APK deletes the old R2 object.
- **B — External link:** Google Drive / MediaFire / Dropbox / any URL.
  Google Drive share links are auto-converted to direct-download URLs.
  (Google may still show a virus-scan confirmation page for very large files;
  that is Google's behaviour, handled as reliably as their links allow.)

**Security** — Supabase Auth + `admins` table check in the app *and* RLS in
the database (signed-in ≠ admin), protected admin routes, no public
registration, server-side validation in functions, HTML sanitized with
DOMPurify before render, XML stored & displayed as text (never executed),
no service-role / R2 secrets in frontend code (`VITE_`-prefixed vars only).

**SEO** — dynamic titles/meta, Open Graph, Twitter cards, canonical URLs,
SoftwareApplication JSON-LD, dynamic XML sitemap at `/sitemap.xml`
(generated from published apps/posts/categories), `robots.txt`,
SEO-friendly slugs.

## Project structure

```
src/
  components/   Header, Footer, AppCard, Logo, Seo, AdminLayout, ProtectedRoute
  context/      ThemeContext (dark mode), AuthContext (Supabase Auth + admin check)
  lib/          supabase client, types, api (public queries), adminApi (uploads), sanitize
  pages/public/ Home, Apps, AppDetails, Categories, Search, Blog, static pages, 404
  pages/admin/  Login, Dashboard, Apps, AppForm, Categories, Posts, PostEditor,
                Media, Downloads, Analytics, Users, Settings
supabase/schema.sql        All tables, indexes, RPCs, RLS, storage bucket, seed categories
netlify/functions/         download-app, r2-upload-url, r2-delete, sitemap, _shared
docs/                      SUPABASE_SETUP.md · R2_SETUP.md · ADMIN_SETUP.md
netlify.toml               Build, SPA fallback, /download & /sitemap.xml routes, security headers
.env.example               Every env var, marked public vs server-only
public/LOGO.txt            Where to place your official logo (public/logo.png)
```

## Setup

### 1. Supabase
Follow **docs/SUPABASE_SETUP.md** — create the project, run `supabase/schema.sql`,
copy URL + anon key. Tables created: `admins, apps, app_screenshots, categories,
posts, downloads, site_settings, activity_logs`.

### 2. Admin account
Follow **docs/ADMIN_SETUP.md** — create the Auth user in the Supabase dashboard,
insert its UUID into `public.admins`, then disable public sign-ups.

### 3. Cloudflare R2 (optional — only for Method A)
Follow **docs/R2_SETUP.md**.

### 4. Local development
```bash
cp .env.example .env   # fill in the VITE_ values
npm install
npm run dev
```
Server functions run locally with `npx netlify dev` (needs the Netlify CLI and
the server env vars set).

### 5. Deploy to Netlify
1. Push this repo to GitHub and import it in Netlify (or drag-and-drop deploy
   with the included `netlify.toml`: build `npm run build`, publish `dist`).
2. Netlify → Site settings → Environment variables — set **all** variables from
   `.env.example`, including the server-only ones (`SUPABASE_SERVICE_ROLE_KEY`,
   `R2_*`). Never prefix a secret with `VITE_`.
3. Redeploy. Check: `/` loads, `/sitemap.xml` returns XML, `/admin/login`
   signs in, and an app's Download button redirects and increments its counter.

### 6. Logo
Your official logo (sent 2026-11-14) is installed as **`public/logo.png`** —
unchanged apart from PNG re-encoding and a 512×512 resize for fast loading
(see `public/LOGO.txt`). Replace it in Admin → Settings or by swapping that file.

## Database notes
- Public reads are limited by RLS to `status = 'published'` content.
- Scheduled apps/posts store `publish_at`; promote them by flipping status
  (or add a scheduled job that updates rows where `publish_at <= now()`).
- Download counting uses the `increment_download` RPC from the server
  function with the service role — clients cannot inflate counters directly.
