import { sb, supabaseConfigured } from './_shared.js'

// GET /sitemap.xml (redirected in netlify.toml) — dynamic sitemap for
// published apps, posts and categories, plus the main static pages.
export async function handler(event) {
  const base = (process.env.VITE_SITE_URL || `https://${event.headers.host}`).replace(/\/$/, '')
  const staticPaths = ['', '/apps', '/categories', '/latest', '/trending', '/blog', '/about', '/contact', '/privacy', '/disclaimer', '/dmca']
  let urls = staticPaths.map(p => ({ loc: `${base}${p}`, lastmod: new Date().toISOString().slice(0, 10) }))
  if (supabaseConfigured()) {
    try {
      const apps = await sb('apps?status=eq.published&select=slug,updated_at')
      const posts = await sb('posts?status=eq.published&select=slug,updated_at')
      const cats = await sb('categories?select=slug,updated_at')
      for (const a of apps || []) urls.push({ loc: `${base}/app/${a.slug}`, lastmod: String(a.updated_at || '').slice(0, 10) })
      for (const p of posts || []) urls.push({ loc: `${base}/post/${p.slug}`, lastmod: String(p.updated_at || '').slice(0, 10) })
      for (const c of cats || []) urls.push({ loc: `${base}/category/${c.slug}`, lastmod: String(c.updated_at || '').slice(0, 10) })
    } catch { /* serve static-only sitemap */ }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') + '\n</urlset>'
  return { statusCode: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }, body: xml }
}
