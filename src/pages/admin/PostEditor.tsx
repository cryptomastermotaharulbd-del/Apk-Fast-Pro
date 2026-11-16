import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout, { Field, inputCls } from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/types'
import { sanitizeHtml } from '../../lib/sanitize'
import { uploadMedia, logActivity } from '../../lib/adminApi'

type Tab = 'visual' | 'code' | 'preview'

// HTML/XML post editor: Visual editor (contentEditable + toolbar),
// raw HTML/XML code editor, and a live preview. HTML is sanitized both
// here (preview) and again on the public post page at render time.
// XML content is stored and displayed as text on the public page — never executed.
export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('visual')
  const [form, setForm] = useState({
    title: '', slug: '', content: '', content_format: 'html' as 'html' | 'xml',
    excerpt: '', cover_url: '', status: 'draft', publish_at: '',
    seo_title: '', seo_description: '',
  })
  const [msg, setMsg] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (id) supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({ ...data, publish_at: data.publish_at ? String(data.publish_at).slice(0, 16) : '' })
    })
  }, [id])
  useEffect(() => {
    if (tab === 'visual' && editorRef.current && form.content_format === 'html')
      editorRef.current.innerHTML = form.content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const exec = (cmd: string, arg?: string) => { document.execCommand(cmd, false, arg); syncVisual() }
  const syncVisual = () => { if (editorRef.current) set('content', editorRef.current.innerHTML) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title, slug: form.slug || slugify(form.title), content: form.content,
      content_format: form.content_format, excerpt: form.excerpt, cover_url: form.cover_url,
      status: form.status, publish_at: form.status === 'scheduled' && form.publish_at ? new Date(form.publish_at).toISOString() : null,
      seo_title: form.seo_title, seo_description: form.seo_description,
    }
    const res = id
      ? await supabase.from('posts').update(payload).eq('id', id)
      : await supabase.from('posts').insert(payload)
    if (res.error) setMsg(res.error.message)
    else { await logActivity(id ? 'update' : 'create', 'post'); navigate('/admin/posts') }
  }

  return (
    <AdminLayout title={id ? 'Edit Post' : 'New Post'}>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title"><input required value={form.title} onChange={e => { set('title', e.target.value); if (!id) set('slug', slugify(e.target.value)) }} className={inputCls} /></Field>
          <Field label="Slug"><input value={form.slug} onChange={e => set('slug', slugify(e.target.value))} className={inputCls} /></Field>
          <Field label="Cover image">
            <div className="flex items-center gap-3">
              {form.cover_url && <img src={form.cover_url} alt="" className="h-10 w-16 rounded-lg object-cover" />}
              <input type="file" accept="image/*" className="text-sm" onChange={async e => { const f = e.target.files?.[0]; if (f) { try { set('cover_url', await uploadMedia(f, 'posts')) } catch (err) { setMsg((err as Error).message) } } }} />
            </div>
          </Field>
          <Field label="Content format">
            <select value={form.content_format} onChange={e => set('content_format', e.target.value)} className={inputCls}>
              <option value="html">HTML</option><option value="xml">XML (displayed as content)</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
            </select>
          </Field>
          {form.status === 'scheduled' && <Field label="Publish at"><input type="datetime-local" value={form.publish_at} onChange={e => set('publish_at', e.target.value)} className={inputCls} /></Field>}
          <Field label="SEO Title"><input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className={inputCls} /></Field>
          <Field label="SEO Description"><input value={form.seo_description} onChange={e => set('seo_description', e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Excerpt"><textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={inputCls} /></Field>

        <div>
          <div className="mb-2 flex gap-2">
            {(['visual', 'code', 'preview'] as Tab[]).map(t => (
              <button type="button" key={t} onClick={() => { if (tab === 'visual') syncVisual(); setTab(t) }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {t === 'code' ? 'HTML / XML Code' : t}
              </button>
            ))}
          </div>
          {tab === 'visual' && (form.content_format === 'html' ? (
            <div>
              <div className="mb-2 flex flex-wrap gap-1">
                {[['bold', 'B'], ['italic', 'I'], ['underline', 'U']].map(([c, l]) => (
                  <button type="button" key={c} onClick={() => exec(c)} className="rounded-lg border px-3 py-1 text-sm font-bold dark:border-slate-700">{l}</button>
                ))}
                <button type="button" onClick={() => exec('formatBlock', 'H2')} className="rounded-lg border px-3 py-1 text-sm dark:border-slate-700">H2</button>
                <button type="button" onClick={() => exec('formatBlock', 'H3')} className="rounded-lg border px-3 py-1 text-sm dark:border-slate-700">H3</button>
                <button type="button" onClick={() => exec('insertUnorderedList')} className="rounded-lg border px-3 py-1 text-sm dark:border-slate-700">• List</button>
                <button type="button" onClick={() => { const u = prompt('Link URL'); if (u) exec('createLink', u) }} className="rounded-lg border px-3 py-1 text-sm dark:border-slate-700">🔗 Link</button>
                <button type="button" onClick={async () => {
                  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'
                  inp.onchange = async () => { const f = inp.files?.[0]; if (f) { try { exec('insertImage', await uploadMedia(f, 'posts')) } catch (err) { setMsg((err as Error).message) } } }
                  inp.click()
                }} className="rounded-lg border px-3 py-1 text-sm dark:border-slate-700">🖼 Image</button>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning onBlur={syncVisual}
                className="prose-post min-h-64 rounded-xl border border-slate-200 p-4 outline-none focus:border-brand-500 dark:border-slate-700" />
            </div>
          ) : <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">XML content is edited in the Code tab and displayed as content on the public page.</p>)}
          {tab === 'code' && (
            <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={16} spellCheck={false}
              className="w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-green-300 outline-none"
              placeholder={form.content_format === 'xml' ? '<?xml version="1.0"?>\n<note>…</note>' : '<h2>Heading</h2>\n<p>Your HTML…</p>'} />
          )}
          {tab === 'preview' && (
            form.content_format === 'xml'
              ? <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">{form.content}</pre>
              : <article className="prose-post rounded-xl border border-slate-100 p-4 dark:border-slate-800" dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }} />
          )}
        </div>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white">{id ? 'Save Changes' : 'Create Post'}</button>
      </form>
    </AdminLayout>
  )
}
