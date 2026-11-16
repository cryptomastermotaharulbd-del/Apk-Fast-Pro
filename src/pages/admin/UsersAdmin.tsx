import { useEffect, useState } from 'react'
import AdminLayout, { Field, inputCls } from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../../lib/adminApi'

interface AdminRow { id: string; user_id: string; email: string; role: string; is_active: boolean; created_at: string }

export default function UsersAdmin() {
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [form, setForm] = useState({ user_id: '', email: '', role: 'admin' })
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('admins').select('*').order('created_at').then(({ data }) => setAdmins((data || []) as AdminRow[]))
  useEffect(() => { load() }, [])
  return (
    <AdminLayout title="Admin Users">
      <p className="mb-4 max-w-2xl text-sm text-slate-500">
        Admins must first exist as Supabase Auth users (Dashboard → Authentication → Users → Add user).
        Paste that user's UUID here to grant admin access. There is no public registration, and sign-in
        alone does not grant access — this table (plus RLS) does.
      </p>
      <form className="mb-6 grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-950"
        onSubmit={async e => {
          e.preventDefault()
          const { error } = await supabase.from('admins').insert(form)
          if (error) setMsg(error.message)
          else { setMsg(''); setForm({ user_id: '', email: '', role: 'admin' }); await logActivity('create', 'admin'); load() }
        }}>
        <Field label="Auth User UUID"><input required value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value.trim() })} className={inputCls} /></Field>
        <Field label="Email"><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
        <Field label="Role">
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputCls}>
            <option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="editor">Editor</option>
          </select>
        </Field>
        <div className="flex items-end"><button className="w-full rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Add Admin</button></div>
        {msg && <p className="text-sm text-red-600 sm:col-span-4">{msg}</p>}
      </form>
      <div className="space-y-2">
        {admins.map(a => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-950">
            <div className="min-w-0 flex-1"><p className="font-medium">{a.email}</p><p className="truncate text-xs text-slate-400">{a.user_id} · {a.role} · since {new Date(a.created_at).toLocaleDateString()}</p></div>
            <button onClick={async () => { await supabase.from('admins').update({ is_active: !a.is_active }).eq('id', a.id); await logActivity(a.is_active ? 'deactivate' : 'activate', 'admin', a.id); load() }}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{a.is_active ? 'active' : 'inactive'}</button>
            <button onClick={async () => { if (confirm(`Remove admin access for ${a.email}?`)) { await supabase.from('admins').delete().eq('id', a.id); await logActivity('delete', 'admin', a.id); load() } }}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600">Remove</button>
          </div>
        ))}
        {!admins.length && <p className="text-sm text-slate-400">No admin rows found (RLS may be hiding them if your account is not yet an admin — see docs/ADMIN_SETUP.md).</p>}
      </div>
    </AdminLayout>
  )
}
