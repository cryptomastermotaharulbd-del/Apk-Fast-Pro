import { useEffect, useState } from 'react'
import AdminLayout, { Field, inputCls } from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../lib/types'
import { slugify } from '../../lib/types'
import { uploadMedia, logActivity } from '../../lib/adminApi'

export default function CategoriesAdmin() {
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState({ id: '', name: '', slug: '', description: '', icon_url: '' })
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('categories').select('*').order('name').then(({ data }) => setCats((data || []) as Category[]))
  useEffect(() => { load() }, [])
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name: form.name, slug: form.slug || slugify(form.name), description: form.description, icon_url: form.icon_url }
    const res = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload)
    if (res.error) setMsg(res.error.message)
    else { await logActivity(form.id ? 'update' : 'create', 'category'); setForm({ id: '', name: '', slug: '', description: '', icon_url: '' }); load() }
  }
  return (
    <AdminLayout title="Categories">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="h-fit space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
          <Field label="Name"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} className={inputCls} /></Field>
          <Field label="Slug"><input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} className={inputCls} /></Field>
          <Field label="Description"><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
          <Field label="Category Icon">
            <div className="flex items-center gap-3">
              {form.icon_url && <img src={form.icon_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <input type="file" accept="image/*" className="text-sm"
                onChange={async e => { const f = e.target.files?.[0]; if (f) { try { setForm({ ...form, icon_url: await uploadMedia(f, 'categories') }) } catch (err) { setMsg((err as Error).message) } } }} />
            </div>
          </Field>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white">{form.id ? 'Save Changes' : 'Create Category'}</button>
          {form.id && <button type="button" onClick={() => setForm({ id: '', name: '', slug: '', description: '', icon_url: '' })} className="ml-2 rounded-xl border px-4 py-2 text-sm dark:border-slate-700">Cancel</button>}
        </form>
        <div className="space-y-2">
          {cats.map(c => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-950">
              {c.icon_url ? <img src={c.icon_url} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span>📂</span>}
              <div className="min-w-0 flex-1"><p className="font-medium">{c.name}</p><p className="truncate text-xs text-slate-400">/{c.slug} — {c.description}</p></div>
              <button onClick={() => setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description, icon_url: c.icon_url })} className="rounded-lg border px-3 py-1 text-xs dark:border-slate-700">Edit</button>
              <button onClick={async () => { if (confirm(`Delete category "${c.name}"? Apps in it become uncategorized.`)) { await supabase.from('categories').delete().eq('id', c.id); await logActivity('delete', 'category', c.id); load() } }}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600">Delete</button>
            </div>
          ))}
          {!cats.length && <p className="text-sm text-slate-400">No categories yet.</p>}
        </div>
      </div>
    </AdminLayout>
  )
}
