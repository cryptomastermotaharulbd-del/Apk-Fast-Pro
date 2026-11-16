import { sb, supabaseConfigured, googleDriveDirect } from './_shared.js'

// GET /.netlify/functions/download-app?slug=<slug>  (also /download/:slug via redirect)
// Records the download (counter + history row), then redirects to the real file.
// Counts actual download requests, never page views.
export async function handler(event) {
  const slug = (event.queryStringParameters || {}).slug
  if (!slug) return { statusCode: 400, body: 'Missing slug' }
  if (!supabaseConfigured())
    return { statusCode: 503, body: 'Downloads are not configured yet. Set Supabase env vars (see README).' }
  try {
    const rows = await sb(`apps?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,version,download_method,apk_url,external_url`)
    const app = Array.isArray(rows) && rows[0]
    if (!app) return { statusCode: 404, body: 'App not found' }
    const target = app.download_method === 'r2' ? app.apk_url : googleDriveDirect(app.external_url)
    if (!target) return { statusCode: 404, body: 'No download file is set for this app yet.' }

    await sb('rpc/increment_download', { method: 'POST', body: JSON.stringify({ p_app_id: app.id }) })
    await sb('downloads', {
      method: 'POST',
      body: JSON.stringify({
        app_id: app.id, app_slug: app.slug, version: app.version, method: app.download_method,
        referrer: event.headers.referer || event.headers.referrer || '',
        user_agent: event.headers['user-agent'] || '',
      }),
    })
    return { statusCode: 302, headers: { Location: target, 'Cache-Control': 'no-store' }, body: '' }
  } catch (e) {
    return { statusCode: 502, body: `Download failed: ${e.message}` }
  }
}
