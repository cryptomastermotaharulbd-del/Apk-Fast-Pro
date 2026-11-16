import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import type { Post } from '../../lib/types'
import { logActivity } from '../../lib/adminApi'

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[]>([])
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setPosts((data || []) as Post[]))
  useEffect(() => { load() }, [])
  return (
    <AdminLayout title="Posts">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/admin/posts/new" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">+ New Post</Link>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-950">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-400">/post/{p.slug} · {p.content_format.toUpperCase()} · {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={async () => {
              const next = p.status === 'published' ? 'draft' : 'published'
              const { error } = await supabase.from('posts').update({ status: next }).eq('id', p.id)
              if (error) setMsg(error.message); else { await logActivity(next === 'published' ? 'publish' : 'unpublish', 'post', p.id); load() }
            }} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</button>
            <Link to={`/admin/posts/${p.id}/edit`} className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">Edit</Link>
            <button onClick={async () => { if (confirm(`Delete post "${p.title}"?`)) { await supabase.from('posts').delete().eq('id', p.id); await logActivity('delete', 'post', p.id); load() } }}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600">Delete</button>
          </div>
        ))}
        {!posts.length && <p className="text-sm text-slate-400">No posts yet.</p>}
      </div>
    </AdminLayout>
  )
}
