// Server-only helpers. Uses SUPABASE_SERVICE_ROLE_KEY — never expose to frontend.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function supabaseConfigured() { return Boolean(SUPABASE_URL && SERVICE_KEY) }

export async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// Verify the caller's Supabase access token and that they are an active admin.
export async function requireAdmin(event) {
  const auth = event.headers.authorization || event.headers.Authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token || !SUPABASE_URL || !SERVICE_KEY) return null
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) return null
  const user = await userRes.json()
  const rows = await sb(`admins?user_id=eq.${user.id}&is_active=eq.true&select=id`)
  return Array.isArray(rows) && rows.length ? user : null
}

export function googleDriveDirect(url) {
  const m = String(url || '').match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
            String(url || '').match(/[?&]id=([\w-]{10,})/)
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url
}
