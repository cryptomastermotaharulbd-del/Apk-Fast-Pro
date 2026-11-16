import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { formatCount } from '../../lib/types'

export default function AnalyticsAdmin() {
  const [totals, setTotals] = useState({ downloads: 0, views: 0, apps: 0 })
  const [perApp, setPerApp] = useState<{ name: string; download_count: number; view_count: number }[]>([])
  const [byDay, setByDay] = useState<{ day: string; count: number }[]>([])
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('apps').select('name,download_count,view_count').order('download_count', { ascending: false })
      const rows = data || []
      setPerApp(rows)
      setTotals({
        downloads: rows.reduce((a, r) => a + (r.download_count || 0), 0),
        views: rows.reduce((a, r) => a + (r.view_count || 0), 0),
        apps: rows.length,
      })
      const since = new Date(Date.now() - 13 * 86400_000).toISOString()
      const { data: dls } = await supabase.from('downloads').select('created_at').gte('created_at', since).limit(5000)
      const map = new Map<string, number>()
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000)
        map.set(d.toISOString().slice(0, 10), 0)
      }
      for (const d of dls || []) { const day = String(d.created_at).slice(0, 10); if (map.has(day)) map.set(day, (map.get(day) || 0) + 1) }
      setByDay([...map.entries()].map(([day, count]) => ({ day, count })))
    })()
  }, [])
  const maxDay = Math.max(1, ...byDay.map(d => d.count))
  const maxApp = Math.max(1, ...perApp.map(a => a.download_count))
  return (
    <AdminLayout title="Analytics">
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Total downloads', totals.downloads], ['Total app views', totals.views], ['Apps tracked', totals.apps]].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-400">{k}</p>
            <p className="mt-1 text-2xl font-extrabold">{formatCount(v as number)}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-bold">Downloads — last 14 days</h2>
        <div className="mt-4 flex h-36 items-end gap-1.5">
          {byDay.map(d => (
            <div key={d.day} className="group flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-brand-500 transition-all" style={{ height: `${Math.max(3, (d.count / maxDay) * 100)}%` }} title={`${d.day}: ${d.count}`} />
              <span className="text-[9px] text-slate-400">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
        {!byDay.length && <p className="text-sm text-slate-400">No data yet.</p>}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-bold">Downloads by app (button analytics)</h2>
        <div className="mt-3 space-y-3">
          {perApp.map(a => (
            <div key={a.name}>
              <div className="flex justify-between text-sm"><span>{a.name}</span><span className="text-slate-400">{formatCount(a.download_count)} downloads · {formatCount(a.view_count)} views</span></div>
              <div className="mt-1 h-2 rounded bg-slate-100 dark:bg-slate-800"><div className="h-full rounded bg-brand-500" style={{ width: `${(a.download_count / maxApp) * 100}%` }} /></div>
            </div>
          ))}
          {!perApp.length && <p className="text-sm text-slate-400">No apps yet.</p>}
        </div>
      </div>
    </AdminLayout>
  )
}
