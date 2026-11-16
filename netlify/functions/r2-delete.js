import { requireAdmin } from './_shared.js'

// POST /.netlify/functions/r2-delete { key } — admin only.
// Signs a DELETE request to R2 (SigV4) so old APKs can be removed when replaced.
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
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ACCOUNT_ID) return { statusCode: 503, body: JSON.stringify({ error: 'R2 is not configured' }) }
  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, body: 'Invalid JSON' } }
  const key = String(body.key || '')
  if (!key.startsWith('apks/')) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid key' }) }

  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const path = `/${R2_BUCKET}/${key}`
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z'
  const date = amzDate.slice(0, 8)
  const payloadHash = await sha256Hex('')
  const headers = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const canonical = ['DELETE', path, '', headers, 'host;x-amz-content-sha256;x-amz-date', payloadHash].join('\n')
  const scope = `${date}/auto/s3/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(canonical)].join('\n')
  let k = await hmac(enc.encode('AWS4' + R2_SECRET_ACCESS_KEY), date)
  k = await hmac(k, 'auto'); k = await hmac(k, 's3'); k = await hmac(k, 'aws4_request')
  const signature = hex(await hmac(k, stringToSign))
  const res = await fetch(`https://${host}${path}`, {
    method: 'DELETE',
    headers: {
      'x-amz-date': amzDate, 'x-amz-content-sha256': payloadHash,
      Authorization: `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
    },
  })
  return { statusCode: res.ok ? 200 : 502, body: JSON.stringify({ ok: res.ok }) }
}
