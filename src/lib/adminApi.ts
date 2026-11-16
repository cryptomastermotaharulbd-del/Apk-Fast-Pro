import { supabase } from './supabase'

// Upload an image/file to Supabase Storage bucket "media" (admin write via RLS).
export async function uploadMedia(file: File, folder = 'uploads'): Promise<string> {
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

export async function logActivity(action: string, entity?: string, entityId?: string, details?: object) {
  const { data } = await supabase.auth.getUser()
  await supabase.from('activity_logs').insert({
    admin_id: data.user?.id || null, action, entity: entity || null,
    entity_id: entityId || null, details: details || {},
  })
}

// Method A: APK -> Cloudflare R2 through a server-signed URL, with progress.
export function uploadApkToR2(
  file: File,
  token: string,
  onProgress: (pct: number) => void,
): Promise<{ publicUrl: string; key: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!/\.apk$/i.test(file.name)) return reject(new Error('Only .apk files are allowed'))
      const res = await fetch('/.netlify/functions/r2-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return reject(new Error(data.error || `Upload setup failed (${res.status})`))
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', data.uploadUrl)
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
        ? resolve({ publicUrl: data.publicUrl, key: data.key })
        : reject(new Error(`R2 upload failed (${xhr.status})`)))
      xhr.onerror = () => reject(new Error('R2 upload network error'))
      xhr.send(file)
    } catch (e) { reject(e as Error) }
  })
}

export async function deleteR2Object(key: string, token: string) {
  await fetch('/.netlify/functions/r2-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ key }),
  })
}

// Basic download-link validation: well-formed URL + known host rules.
export function validateDownloadUrl(method: 'r2' | 'external', apkUrl: string, externalUrl: string) {
  const url = method === 'r2' ? apkUrl : externalUrl
  if (!url) return { ok: false, message: 'No download URL is set for the selected method.' }
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return { ok: false, message: 'Download URL should use https.' }
    if (method === 'external' && /drive\.google\.com/.test(u.host) && !/file\/d\/|id=/.test(url))
      return { ok: false, message: 'Google Drive link does not contain a file ID.' }
    return { ok: true, message: `Looks valid (${u.host}).` }
  } catch { return { ok: false, message: 'Download URL is not a valid URL.' } }
}
