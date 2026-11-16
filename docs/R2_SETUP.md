# Cloudflare R2 setup (APK file storage)

1. Cloudflare Dashboard → **R2** → Create bucket: `apk-fast-pro`.
2. Enable a public access URL for the bucket (R2.dev subdomain or a custom
   domain) and copy it as `R2_PUBLIC_BASE_URL`.
3. **R2 → Manage API Tokens** → Create token with *Object Read & Write* on
   this bucket. Copy Account ID, Access Key ID and Secret Access Key.
4. In **Netlify → Site settings → Environment variables** (never in code):
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_BUCKET=apk-fast-pro`, `R2_PUBLIC_BASE_URL`, optionally `MAX_APK_SIZE_MB`.
5. How uploads work: the admin's browser asks `/.netlify/functions/r2-upload-url`
   for a presigned URL. That function first verifies the caller is a logged-in
   admin (Supabase JWT + `admins` table), validates `.apk` + size, then signs
   the URL with the R2 secret — the secret never reaches the browser.
   The returned public URL is saved on the app row in Supabase.
6. Alternative: skip R2 entirely and use **External Download Link** per app
   (Google Drive / MediaFire / Dropbox). Google Drive share links are
   automatically converted to a direct-download URL by the download function.
