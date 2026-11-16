import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AppItem } from '../../lib/types'
import { formatCount } from '../../lib/types'
import { AppGrid, Section } from '../../components/AppCard'
import Seo from '../../components/Seo'

export default function AppDetails() {
  const { slug = '' } = useParams()
  const [app, setApp] = useState<AppItem | null>(null)
  const [related, setRelated] = useState<AppItem[]>([])
  const [notFound, setNotFound] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    api.appBySlug(slug).then(async a => {
      if (!a) { setNotFound(true); return }
      setApp(a)
      setRelated((await api.relatedApps(a)) || [])
    })
  }, [slug])

  if (notFound) return <main className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">App not found</h1><Link to="/apps" className="mt-4 inline-block text-brand-600">Browse all apps →</Link></main>
  if (!app) return <main className="py-20 text-center text-slate-400">Loading…</main>

  const shots = [...(app.app_screenshots || [])].sort((a, b) => a.sort_order - b.sort_order)
  const perms = Array.isArray(app.permissions) ? app.permissions : []
  const rows: [string, string][] = [
    ['Version', app.version], ['Size', app.size || '—'], ['Android required', `${app.android_min}+`],
    ['Developer', app.developer || '—'], ['Category', app.categories?.name || '—'],
    ['Released', app.release_date || '—'], ['Updated', app.updated_date || '—'],
    ['Downloads', formatCount(app.download_count)],
  ]
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Seo title={app.seo_title || `${app.name} APK Download — APK FAST PRO`}
        description={app.seo_description || app.short_description} image={app.icon_url} type="website"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: app.name,
          applicationCategory: app.categories?.name || 'Application', operatingSystem: 'Android',
          softwareVersion: app.version, fileSize: app.size, author: { '@type': 'Organization', name: app.developer || app.name } }} />
      <div className="flex flex-col gap-5 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card sm:flex-row sm:items-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {app.icon_url ? <img src={app.icon_url} alt={app.name} className="h-24 w-24 rounded-3xl object-cover shadow-card" />
          : <div className="grid h-24 w-24 place-items-center rounded-3xl bg-brand-50 text-4xl">📱</div>}
        <div>
          <h1 className="text-3xl font-extrabold">{app.name}</h1>
          <p className="mt-1 text-slate-500">{app.short_description}</p>
          <p className="mt-2 text-xs text-slate-400">v{app.version} • {app.size} • ⬇ {formatCount(app.download_count)} downloads</p>
        </div>
      </div>

      {shots.length > 0 && (
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {shots.map(s => (
            <img key={s.id} src={s.url} alt={`${app.name} screenshot`} loading="lazy" onClick={() => setLightbox(s.url)}
              className="h-64 w-auto cursor-zoom-in rounded-2xl border border-slate-100 object-cover dark:border-slate-800" />
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Screenshot full screen" className="max-h-full max-w-full rounded-xl" />
          <button className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-black" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold">About this app</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{app.full_description || app.short_description}</p>
          {app.whats_new && <>
            <h2 className="mt-8 text-xl font-bold">What's New in v{app.version}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{app.whats_new}</p>
          </>}
          {perms.length > 0 && <>
            <h2 className="mt-8 text-xl font-bold">App Permissions</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-600 dark:text-slate-300">{perms.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </>}
        </div>
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-24 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold">Download Information</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-slate-400">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-slate-400">Review the version, size and permissions above before downloading. Downloads are counted when the download starts.</p>
          <a href={api.downloadUrl(app.slug)}
            className="mt-5 block rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3.5 text-center font-display font-bold text-white shadow-pop transition hover:from-brand-700 hover:to-brand-600">
            ⬇ Download APK
          </a>
        </aside>
      </div>
      <Section title="Related Applications"><AppGrid apps={related} empty="No related apps yet." /></Section>
    </main>
  )
}
