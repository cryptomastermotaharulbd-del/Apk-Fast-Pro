import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout, { Field, inputCls } from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Category } from '../../lib/types'
import { slugify } from '../../lib/types'
import { uploadMedia, uploadApkToR2, deleteR2Object, logActivity, validateDownloadUrl } from '../../lib/adminApi'

interface Form {
  name: string; slug: string; icon_url: string; short_description: string; full_description: string
  version: string; size: string; android_min: string; developer: string; category_id: string
  release_date: string; updated_date: string; whats_new: string; permissions: string
  download_method: 'r2' | 'external'; apk_url: string; apk_key: string; external_url: string
  is_featured: boolean; status: string; publish_at: string; seo_title: string; seo_description: string
}
const empty: Form = {
  name: '', slug: '', icon_url: '', short_description: '', full_description: '',
  version: '1.0.0', size: '', android_min: '5.0', developer: '', category_id: '',
  release_date: '', updated_date: '', whats_new: '', permissions: '',
  download_method: 'external', apk_url: '', apk_key: '', external_url: '',
  is_featured: false, status: 'draft', publish_at: '', seo_title: '', seo_description: '',
}
interface Shot { id?: string; url: string }

export default function AppForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { session } = useAuth()
  const [form, setForm] = useState<Form>(empty)
  const [cats, setCats] = useState<Category[]>([])
  const [shots, setShots] = useState<Shot[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const oldApkKey = useRef('')
  const set = (k: keyof Form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCats((data || []) as Category[]))
    if (id) {
      supabase.from('apps').select('*, app_screenshots(id,url,sort_order)').eq('id', id).single().then(({ data }) => {
        if (!data) return
        oldApkKey.current = data.apk_key || ''
        setForm({
          ...empty, ...data, category_id: data.category_id || '',
          permissions: Array.isArray(data.permissions) ? data.permissions.join('\n') : '',
          release_date: data.release_date || '', updated_date: data.updated_date || '',
          publish_at: data.publish_at ? String(data.publish_at).slice(0, 16) : '',
        })
        setShots([...(data.app_screenshots || [])].sort((a: Shot & { sort_order?: number }, b: Shot & { sort_order?: number }) => (a.sort_order || 0) - (b.sort_order || 0)))
      })
    }
  }, [id])

  const onIcon = async (file: File) => { try { set('icon_url', await uploadMedia(file, 'icons')) } catch (e) { setMsg((e as Error).message) } }
  const onShots = async (files: FileList) => {
    try { for (const f of Array.from(files)) { const url = await uploadMedia(f, 'screenshots'); setShots(s => [...s, { url }]) } }
    catch (e) { setMsg((e as Error).message) }
  }
  const onApk = async (file: File) => {
    if (!session) return
    setProgress(0); setMsg('')
    try {
      const r = await uploadApkToR2(file, session.access_token, setProgress)
      if (oldApkKey.current && oldApkKey.current !== r.key) deleteR2Object(oldApkKey.current, session.access_token)
      setForm(f => ({ ...f, apk_url: r.publicUrl, apk_key: r.key, download_method: 'r2',
        size: f.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB` }))
      setMsg('✅ APK uploaded to R2 successfully.')
    } catch (e) { setMsg(`❌ ${(e as Error).message}`) }
    setProgress(null)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('')
    const check = validateDownloadUrl(form.download_method, form.apk_url, form.external_url)
    if (form.status === 'published' && !check.ok) { setMsg(`Download link: ${check.message}`); setBusy(false); return }
    const payload = {
      name: form.name, slug: form.slug || slugify(form.name), icon_url: form.icon_url,
      short_description: form.short_description, full_description: form.full_description,
      version: form.version, size: form.size, android_min: form.android_min, developer: form.developer,
      category_id: form.category_id || null,
      release_date: form.release_date || null, updated_date: form.updated_date || null,
      whats_new: form.whats_new,
      permissions: form.permissions.split('\n').map(s => s.trim()).filter(Boolean),
      download_method: form.download_method, apk_url: form.apk_url, apk_key: form.apk_key,
      external_url: form.external_url, is_featured: form.is_featured, status: form.status,
      publish_at: form.status === 'scheduled' && form.publish_at ? new Date(form.publish_at).toISOString() : null,
      seo_title: form.seo_title, seo_description: form.seo_description,
    }
    const res = editing
      ? await supabase.from('apps').update(payload).eq('id', id).select('id').single()
      : await supabase.from('apps').insert(payload).select('id').single()
    if (res.error) { setMsg(res.error.message); setBusy(false); return }
    const appId = res.data.id as string
    if (editing) await supabase.from('app_screenshots').delete().eq('app_id', appId)
    if (shots.length) {
      const { error } = await supabase.from('app_screenshots')
        .insert(shots.map((s, i) => ({ app_id: appId, url: s.url, sort_order: i })))
      if (error) { setMsg(`App saved, but screenshots failed: ${error.message}`); setBusy(false); return }
    }
    await logActivity(editing ? 'update' : 'create', 'app', appId, { name: payload.name })
    setBusy(false)
    navigate('/admin/apps')
  }

  return (
    <AdminLayout title={editing ? 'Edit App' : 'Add New App'}>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="1. App Name"><input required value={form.name} onChange={e => { set('name', e.target.value); if (!editing) set('slug', slugify(e.target.value)) }} className={inputCls} /></Field>
          <Field label="2. App Slug"><input required value={form.slug} onChange={e => set('slug', slugify(e.target.value))} className={inputCls} /></Field>
          <Field label="3. App Icon">
            <div className="flex items-center gap-3">
              {form.icon_url && <img src={form.icon_url} alt="" className="h-12 w-12 rounded-xl object-cover" />}
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onIcon(e.target.files[0])} className="text-sm" />
            </div>
          </Field>
          <Field label="4. Screenshots (multiple)">
            <input type="file" accept="image/*" multiple onChange={e => e.target.files && onShots(e.target.files)} className="text-sm" />
            <div className="mt-2 flex flex-wrap gap-2">
              {shots.map((s, i) => (
                <span key={i} className="relative"><img src={s.url} alt="" className="h-16 w-12 rounded-lg object-cover" />
                  <button type="button" onClick={() => setShots(shots.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">✕</button></span>
              ))}
            </div>
          </Field>
          <Field label="7. App Version"><input required value={form.version} onChange={e => set('version', e.target.value)} className={inputCls} /></Field>
          <Field label="8. App Size (e.g. 25 MB)"><input value={form.size} onChange={e => set('size', e.target.value)} className={inputCls} /></Field>
          <Field label="9. Android Minimum Version"><input value={form.android_min} onChange={e => set('android_min', e.target.value)} className={inputCls} /></Field>
          <Field label="10. Developer Name"><input value={form.developer} onChange={e => set('developer', e.target.value)} className={inputCls} /></Field>
          <Field label="11. Category">
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputCls}>
              <option value="">— Select category —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="12. Release Date"><input type="date" value={form.release_date} onChange={e => set('release_date', e.target.value)} className={inputCls} /></Field>
          <Field label="13. Update Date"><input type="date" value={form.updated_date} onChange={e => set('updated_date', e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="5. Short Description"><textarea rows={2} value={form.short_description} onChange={e => set('short_description', e.target.value)} className={inputCls} /></Field>
        <Field label="6. Full Description"><textarea rows={6} value={form.full_description} onChange={e => set('full_description', e.target.value)} className={inputCls} /></Field>
        <Field label="14. What's New"><textarea rows={3} value={form.whats_new} onChange={e => set('whats_new', e.target.value)} className={inputCls} /></Field>
        <Field label="15. Permissions (one per line)"><textarea rows={3} value={form.permissions} onChange={e => set('permissions', e.target.value)} className={inputCls} placeholder={'INTERNET\nACCESS_NETWORK_STATE'} /></Field>

        <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
          <p className="font-bold">Download Method</p>
          <div className="mt-3 flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={form.download_method === 'r2'} onChange={() => set('download_method', 'r2')} /> Method A — Direct APK Upload (R2)</label>
            <label className="flex items-center gap-2"><input type="radio" checked={form.download_method === 'external'} onChange={() => set('download_method', 'external')} /> Method B — External Download Link</label>
          </div>
          {form.download_method === 'r2' ? (
            <div className="mt-4 space-y-2">
              <Field label="16. APK File Upload (.apk)">
                <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={e => e.target.files?.[0] && onApk(e.target.files[0])} className="text-sm" />
              </Field>
              {progress !== null && <div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>}
              {form.apk_url && <p className="break-all text-xs text-slate-500">Stored file: {form.apk_url}</p>}
              <p className="text-xs text-slate-400">Uploaded securely via a server-signed URL. Replacing the APK deletes the old R2 file. Requires R2 env vars (docs/R2_SETUP.md).</p>
            </div>
          ) : (
            <div className="mt-4">
              <Field label="17. External Download URL (Google Drive / MediaFire / Dropbox / other)">
                <input type="url" value={form.external_url} onChange={e => set('external_url', e.target.value)} className={inputCls} placeholder="https://drive.google.com/file/d/…" />
              </Field>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="19. Publish / Draft Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
            </select>
          </Field>
          {form.status === 'scheduled' && <Field label="Schedule publishing at"><input type="datetime-local" value={form.publish_at} onChange={e => set('publish_at', e.target.value)} className={inputCls} /></Field>}
          <Field label="20. SEO Title"><input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className={inputCls} /></Field>
          <Field label="21. SEO Description"><input value={form.seo_description} onChange={e => set('seo_description', e.target.value)} className={inputCls} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} /> 18. Featured App
        </label>
        {msg && <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">{msg}</p>}
        <button disabled={busy} className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white disabled:opacity-50">
          {busy ? 'Saving…' : editing ? 'Save Changes' : 'Create App'}
        </button>
      </form>
    </AdminLayout>
  )
}
