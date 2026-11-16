# Supabase setup

1. Create a project at https://supabase.com
2. **SQL Editor → New query** — paste all of `supabase/schema.sql` and run it.
   This creates: `admins, apps, app_screenshots, categories, posts, downloads, site_settings, activity_logs`,
   indexes, `increment_download` / `increment_view` RPCs, RLS policies, the public
   `media` storage bucket (icons/screenshots), and the example categories.
3. **Project Settings → API** — copy the Project URL and `anon` key into
   `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
   Copy the `service_role` key into Netlify env as `SUPABASE_SERVICE_ROLE_KEY`
   (server only — never `VITE_` prefixed, never in frontend code).
4. **Authentication → Providers → Email** — enable Email. Turn **off**
   "Allow new users to sign up" in production after creating the admin
   (Auth → Users), so there is no public admin registration.
5. Storage: APK files are **not** stored here — they go to Cloudflare R2.
   The `media` bucket holds app icons, screenshots and category icons.
