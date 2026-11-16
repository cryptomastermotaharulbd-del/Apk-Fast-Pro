import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { validateDownloadUrl } from '../../lib/adminApi'
import { formatCount } from '../../lib/types'

interface AppRow { id: string; name: string; slug: string; version: string; download_count: number; download_method: 'r2' | 'external'; apk_url: string; external_url: string }
interface Dl { id: string; app_slug: string | null; version: string | null; method: string | null; created_at: string }

export default function DownloadsAdmin() {
  const [apps, setApps] = useState<AppRow[]>([])
  const [recent, setRecent] = useState<Dl[]>([])
  useEffect(() => {
    supabase.from('apps').select('id,name,slug,version,download_count,download_method,apk_url,external_url')
      .order('download_count', { ascending: false }).then(({ data }) => setApps((data || []) as AppRow[]))
    supabase.from('downloads').select('id,app_slug,version,method,created_at')
      .order('created_at', { ascending: false }).limit(30).then(({ data }) => setRecent((data || []) as Dl[]))
  }, [])
  return (
    <AdminLayout title="Downloads">
      <p className="mb-4 text-sm text-slate-500">Downloads are counted by the download endpoint (Netlify function) when a download actually starts — not on page views. The public button for each app is <code>/download/&lt;slug&gt;</code>.</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b text-xs uppercase text-slate-400 dark:border-slate-800"><th className="p-3">App</th><th className="p-3">Version</th><th className="p-3">Downloads</th><th className="p-3">Method</th><th className="p-3">Link validation</th></tr></thead>
          <tbody>
            {apps.map(a => {
              const v = validateDownloadUrl(a.download_method, a.apk_url, a.external_url)
              return <tr key={a.id} className="border-b last:border-0 dark:border-slate-800">
                <td className="p-3 font-medium">{a.name}</td><td className="p-3">v{a.version}</td>
                <td className="p-3">{formatCount(a.download_count)}</td>
                <td className="p-3">{a.download_method === 'r2' ? 'R2 upload' : 'External link'}</td>
                <td className={`p-3 text-xs ${v.ok ? 'text-green-600' : 'text-red-600'}`}>{v.ok ? '✓' : '✗'} {v.message}</td>
              </tr>
            })}
            {!apps.length && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No apps yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-8 font-bold">Download History (latest 30)</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead><tr className="border-b text-xs uppercase text-slate-400 dark:border-slate-800"><th className="p-3">App</th><th className="p-3">Version</th><th className="p-3">Method</th><th className="p-3">When</th></tr></thead>
          <tbody>
            {recent.map(d => <tr key={d.id} className="border-b last:border-0 dark:border-slate-800">
              <td className="p-3">{d.app_slug || '—'}</td><td className="p-3">{d.version || '—'}</td>
              <td className="p-3">{d.method || '—'}</td><td className="p-3">{new Date(d.created_at).toLocaleString()}</td></tr>)}
            {!recent.length && <tr><td colSpan={4} className="p-6 text-center text-slate-400">No downloads recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
