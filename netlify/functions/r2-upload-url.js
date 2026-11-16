import { requireAdmin } from './_shared.js'

// POST /.netlify/functions/r2-upload-url  { filename, contentType, size }
// Header: Authorization: Bearer <supabase access token of an admin>
// Returns a short-lived SigV4 presigned PUT URL for Cloudflare R2.
// R2 secret keys live ONLY in Netlify env vars — never in browser code.
// Large-file note: presigned single PUT supports up to 5 GB per object in R2;
// for multi-part >5GB files, add a multipart flow using the same signing code.

const enc = new TextEncoder()
async function hmac(key, msg) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)))
}
async function sha256Hex(msg) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(msg))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}
const hex = (u8) => [...u8].map(b => b.toString(16).padStart(2, '0')).join('')

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  const admin = await requireAdmin(event)
  if (!admin) return { statusCode: 403, body: JSON.stringify({ error: 'Admin authorization required' }) }

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL, MAX_APK_SIZE_MB } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL)
    return { statusCode: 503, body: JSON.stringify({ error: 'R2 is not configured. Set R2_* env vars in Netlify (see docs/R2_SETUP.md).' }) }

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, body: 'Invalid JSON' } }
  const filename = String(body.filename || '')
  if (!/\.apk$/i.test(filename)) return { statusCode: 400, body: JSON.stringify({ error: 'Only .apk files are allowed' }) }
  const maxBytes = (parseInt(MAX_APK_SIZE_MB || '2048', 10)) * 1024 * 1024
  if (body.size && Number(body.size) > maxBytes)
    return { statusCode: 400, body: JSON.stringify({ error: `APK exceeds max size of ${MAX_APK_SIZE_MB || '2048'} MB` }) }

  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  const key = `apks/${Date.now()}-${safe}`
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const path = `/${R2_BUCKET}/${key}`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z'
  const date = amzDate.slice(0, 8)
  const region = 'auto', service = 's3', expires = 900
  const query = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${R2_ACCESS_KEY_ID}/${date}/${region}/${service}/aws4_request`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expires),
    'X-Amz-SignedHeaders': 'host',
  })
  const canonical = ['PUT', path, query.toString(), `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n')
  const scope = `${date}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(canonical)].join('\n')
  let k = await hmac(enc.encode('AWS4' + R2_SECRET_ACCESS_KEY), date)
  k = await hmac(k, region); k = await hmac(k, service); k = await hmac(k, 'aws4_request')
  const signature = hex(await hmac(k, stringToSign))
  query.set('X-Amz-Signature', signature)
  const uploadUrl = `https://${host}${path}?${query.toString()}`
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadUrl, key, publicUrl: `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}` }),
  }
}
