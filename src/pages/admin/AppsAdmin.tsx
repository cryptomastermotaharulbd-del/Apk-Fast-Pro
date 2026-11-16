import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import type { AppItem } from '../../lib/types'
import { formatCount } from '../../lib/types'
import { logActivity } from '../../lib/adminApi'

export default function AppsAdmin() {
  const [apps, setApps] = useState<AppItem[]>([])
  const [term, setTerm] = useState('')
  const [msg, setMsg] = useState('')
  const load = async () => {
    const { data } = await supabase.from('apps').select('*, categories(name)').order('created_at', { ascending: false })
    setApps((data || []) as unknown as AppItem[])
  }
  useEffect(() => { load() }, [])
  const shown = apps.filter(a => a.name.toLowerCase().includes(term.toLowerCase()))
  const patch = async (app: AppItem, fields: Partial<AppItem>, action: string) => {
    const { error } = await supabase.from('apps').update(fields).eq('id', app.id)
    if (error) setMsg(error.message); else { await logActivity(action, 'app', app.id); load() }
  }
  const remove = async (app: AppItem) => {
    if (!confirm(`Delete "${app.name}" permanently? Its screenshots are deleted too.`)) return
    const { error } = await supabase.from('apps').delete().eq('id', app.id)
    if (error) setMsg(error.message); else { await logActivity('delete', 'app', app.id); load() }
  }
  return (
    <AdminLayout title="Apps">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search apps…" className="w-64 rounded-xl border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        <Link to="/admin/apps/new" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">+ Add New App</Link>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b text-xs uppercase text-slate-400 dark:border-slate-800">
            <th className="p-3">App</th><th className="p-3">Category</th><th className="p-3">Status</th>
            <th className="p-3">Featured</th><th className="p-3">Downloads</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {shown.map(a => (
              <tr key={a.id} className="border-b last:border-0 dark:border-slate-800">
                <td className="p-3"><div className="flex items-center gap-2">{a.icon_url && <img src={a.icon_url} alt="" className="h-8 w-8 rounded-lg" />}<div><p className="font-medium">{a.name}</p><p className="text-xs text-slate-400">v{a.version} · /app/{a.slug}</p></div></div></td>
                <td className="p-3">{(a.categories as unknown as { name?: string })?.name || '—'}</td>
                <td className="p-3"><button onClick={() => patch(a, { status: a.status === 'published' ? 'draft' : 'published' }, a.status === 'published' ? 'unpublish' : 'publish')}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.status === 'published' ? 'bg-green-100 text-green-700' : a.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{a.status}</button></td>
                <td className="p-3"><button onClick={() => patch(a, { is_featured: !a.is_featured }, a.is_featured ? 'unfeature' : 'feature')} className="text-lg">{a.is_featured ? '⭐' : '☆'}</button></td>
                <td className="p-3">{formatCount(a.download_count)}</td>
                <td className="p-3"><div className="flex gap-2">
                  <Link to={`/admin/apps/${a.id}/edit`} className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">Edit</Link>
                  <button onClick={() => remove(a)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600">Delete</button>
                </div></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="p-6 text-center text-slate-400">No apps found.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
