import { useEffect, useState } from 'react'
import AdminLayout, { Field, inputCls } from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { supabaseConfigured } from '../../lib/supabase'
import type { SiteSettings } from '../../lib/types'
import { uploadMedia, logActivity } from '../../lib/adminApi'

const defaults: SiteSettings = {
  siteName: 'APK FAST PRO', description: 'Fast, safe APK downloads.', contactEmail: '',
  logoUrl: '', faviconUrl: '', footerText: '', maintenanceMode: false,
  social: {}, theme: { accent: '#0070dd' }, seo: { title: '', description: '' }, homepage: {},
}
const SECTIONS = ['featured', 'latest', 'trending', 'mostDownloaded', 'categories', 'recentlyUpdated'] as const

export default function SettingsAdmin() {
  const [s, setS] = useState<SiteSettings>(defaults)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'site').single()
      .then(({ data }) => { if (data?.value) setS({ ...defaults, ...(data.value as SiteSettings) }) })
  }, [])
  const set = (patch: Partial<SiteSettings>) => setS(v => ({ ...v, ...patch }))
  const upload = async (file: File, key: 'logoUrl' | 'faviconUrl') => {
    try { set({ [key]: await uploadMedia(file, 'settings') } as Partial<SiteSettings>) } catch (e) { setMsg((e as Error).message) }
  }
  return (
    <AdminLayout title="Settings">
      <form className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950"
        onSubmit={async e => {
          e.preventDefault()
          const { error } = await supabase.from('site_settings').upsert({ key: 'site', value: s })
          if (error) setMsg(error.message)
          else { setMsg('✅ Settings saved.'); await logActivity('update', 'site_settings') }
        }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website name"><input value={s.siteName} onChange={e => set({ siteName: e.target.value })} className={inputCls} /></Field>
          <Field label="Contact email"><input type="email" value={s.contactEmail} onChange={e => set({ contactEmail: e.target.value })} className={inputCls} /></Field>
          <Field label="Website logo">
            <div className="flex items-center gap-3">{s.logoUrl && <img src={s.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />}
              <input type="file" accept="image/*" className="text-sm" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'logoUrl')} /></div>
          </Field>
          <Field label="Favicon">
            <div className="flex items-center gap-3">{s.faviconUrl && <img src={s.faviconUrl} alt="" className="h-8 w-8" />}
              <input type="file" accept="image/*" className="text-sm" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'faviconUrl')} /></div>
          </Field>
        </div>
        <Field label="Website description"><textarea rows={2} value={s.description} onChange={e => set({ description: e.target.value })} className={inputCls} /></Field>
        <Field label="Footer information"><input value={s.footerText || ''} onChange={e => set({ footerText: e.target.value })} className={inputCls} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default SEO title"><input value={s.seo?.title || ''} onChange={e => set({ seo: { ...s.seo, title: e.target.value } })} className={inputCls} /></Field>
          <Field label="Default SEO description"><input value={s.seo?.description || ''} onChange={e => set({ seo: { ...s.seo, description: e.target.value } })} className={inputCls} /></Field>
          <Field label="Theme accent color"><input type="color" value={s.theme?.accent || '#0070dd'} onChange={e => set({ theme: { accent: e.target.value } })} className="h-10 w-20 cursor-pointer rounded-lg border dark:border-slate-700" /></Field>
        </div>
        <div>
          <p className={'' + 'mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400'}>Social media links</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {['facebook', 'youtube', 'telegram', 'twitter'].map(k => (
              <Field key={k} label={k}>
                <input value={s.social?.[k] || ''} placeholder="https://…"
                  onChange={e => set({ social: { ...s.social, [k]: e.target.value } })} className={inputCls} />
              </Field>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Homepage sections</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {SECTIONS.map(k => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={s.homepage?.[k] !== false}
                  onChange={e => set({ homepage: { ...s.homepage, [k]: e.target.checked } })} /> {k}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">Saved in settings; the homepage reads these flags from site_settings.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={s.maintenanceMode} onChange={e => set({ maintenanceMode: e.target.checked })} />
          Maintenance mode (shows a maintenance notice site-wide)
        </label>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">
          Configuration status: Supabase {supabaseConfigured ? '✓ env vars present' : '✗ env vars missing — add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY and redeploy'}.
          R2 and the service-role key are configured only in Netlify server env vars (see README).
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white">Save Settings</button>
      </form>
    </AdminLayout>
  )
}
