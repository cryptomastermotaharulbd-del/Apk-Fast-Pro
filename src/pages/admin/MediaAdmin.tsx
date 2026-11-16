import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { uploadMedia, logActivity } from '../../lib/adminApi'

interface Obj { name: string; created_at: string }

export default function MediaAdmin() {
  const [files, setFiles] = useState<Obj[]>([])
  const [msg, setMsg] = useState('')
  const load = async () => {
    const roots = ['icons', 'screenshots', 'categories', 'posts', 'settings', 'uploads']
    const all: Obj[] = []
    for (const r of roots) {
      const { data } = await supabase.storage.from('media').list(r, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      for (const f of data || []) if (f.name && !f.name.startsWith('.')) all.push({ name: `${r}/${f.name}`, created_at: f.created_at || '' })
    }
    setFiles(all)
  }
  useEffect(() => { load() }, [])
  const url = (path: string) => supabase.storage.from('media').getPublicUrl(path).data.publicUrl
  return (
    <AdminLayout title="Media Library">
      <div className="mb-4 flex items-center gap-3">
        <label className="cursor-pointer rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Upload image
          <input type="file" accept="image/*" className="hidden" onChange={async e => {
            const f = e.target.files?.[0]
            if (f) { try { await uploadMedia(f, 'uploads'); await logActivity('upload', 'media'); load() } catch (err) { setMsg((err as Error).message) } }
          }} />
        </label>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {files.map(f => (
          <div key={f.name} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-950">
            <img src={url(f.name)} alt={f.name} loading="lazy" className="h-28 w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-[11px] text-slate-400">{f.name}</p>
              <div className="mt-1 flex gap-1">
                <button onClick={() => navigator.clipboard.writeText(url(f.name))} className="rounded border px-2 py-0.5 text-[11px] dark:border-slate-700">Copy URL</button>
                <button onClick={async () => { if (confirm(`Delete ${f.name}?`)) { await supabase.storage.from('media').remove([f.name]); load() } }}
                  className="rounded border border-red-200 px-2 py-0.5 text-[11px] text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!files.length && <p className="text-sm text-slate-400">No media uploaded yet. Icons, screenshots and post images appear here.</p>}
    </AdminLayout>
  )
}
