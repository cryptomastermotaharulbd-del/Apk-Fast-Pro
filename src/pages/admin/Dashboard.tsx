import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { formatCount } from '../../lib/types'

interface Stats { apps: number; posts: number; downloads: number; views: number; cats: number }
interface Log { id: string; action: string; entity: string | null; created_at: string }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ apps: 0, posts: 0, downloads: 0, views: 0, cats: 0 })
  const [top, setTop] = useState<{ name: string; slug: string; download_count: number }[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  useEffect(() => {
    ;(async () => {
      const count = async (table: string, filter?: (q: any) => any) => {
        let query = supabase.from(table).select('id', { count: 'exact', head: true })
        if (filter) query = filter(query)
        const { count } = await query
        return count || 0
      }
      const { data: sums } = await supabase.from('apps').select('download_count,view_count')
      setStats({
        apps: await count('apps'),
        posts: await count('posts', q => q.eq('status', 'published')),
        cats: await count('categories'),
        downloads: (sums || []).reduce((a, r) => a + (r.download_count || 0), 0),
        views: (sums || []).reduce((a, r) => a + (r.view_count || 0), 0),
      })
      const { data: t } = await supabase.from('apps').select('name,slug,download_count').order('download_count', { ascending: false }).limit(5)
      setTop(t || [])
      const { data: l } = await supabase.from('activity_logs').select('id,action,entity,created_at').order('created_at', { ascending: false }).limit(8)
      setLogs((l || []) as Log[])
    })()
  }, [])
  const cards: [string, string][] = [
    ['Total Apps', String(stats.apps)], ['Published Posts', String(stats.posts)],
    ['Total Downloads', formatCount(stats.downloads)], ['Total Visitors (app views)', formatCount(stats.views)],
    ['Total Categories', String(stats.cats)],
  ]
  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-400">{k}</p>
            <p className="mt-1 text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
          <h2 className="font-bold">Most Downloaded Apps</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {top.map(a => <li key={a.slug} className="flex justify-between"><Link className="text-brand-600" to={`/app/${a.slug}`}>{a.name}</Link><span>{formatCount(a.download_count)}</span></li>)}
            {!top.length && <li className="text-slate-400">No apps yet.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
          <h2 className="font-bold">Recent Activities</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {logs.map(l => <li key={l.id} className="flex justify-between gap-3"><span>{l.action}{l.entity ? ` · ${l.entity}` : ''}</span><span className="text-slate-400">{new Date(l.created_at).toLocaleString()}</span></li>)}
            {!logs.length && <li className="text-slate-400">No activity logged yet.</li>}
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
