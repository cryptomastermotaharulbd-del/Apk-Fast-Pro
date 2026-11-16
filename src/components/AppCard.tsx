import { Link } from 'react-router-dom'
import type { AppItem } from '../lib/types'
import { formatCount } from '../lib/types'
import { IconDb, IconDownload, IconPhone } from './icons'

export default function AppCard({ app }: { app: AppItem }) {
  return (
    <div className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-pop dark:border-slate-800 dark:bg-slate-900 animate-fadeUp">
      {app.categories && (
        <span className="absolute right-4 top-4 max-w-[45%] truncate rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {app.categories.name}
        </span>
      )}
      <div className="flex items-start gap-3">
        {app.icon_url
          ? <img src={app.icon_url} alt={app.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm" />
          : <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-600">📱</div>}
        <div className={`min-w-0 ${app.categories ? 'pr-16' : 'pr-2'}`}>
          <h3 className="truncate font-display font-bold">{app.name}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{app.short_description}</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-3.5 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1"><IconPhone className="h-3.5 w-3.5 text-brand-500" />v{app.version}</span>
        <span className="flex items-center gap-1"><IconDb className="h-3.5 w-3.5 text-slate-300" />{app.size || '—'}</span>
        <span className="flex items-center gap-1"><IconDownload className="h-3.5 w-3.5 text-brand-500" />{formatCount(app.download_count)}</span>
      </div>
      <Link to={`/app/${app.slug}`}
        className="mt-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-pop transition hover:from-brand-700 hover:to-brand-600">
        View Details →
      </Link>
    </div>
  )
}

export function AppGrid({ apps, empty = 'No apps published yet.' }: { apps: AppItem[]; empty?: string }) {
  if (!apps.length) return <p className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-700">{empty}</p>
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{apps.map(a => <AppCard key={a.id} app={a} />)}</div>
}

export function Section({ title, to, children }: { title: string; to?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-extrabold">
          <span className="h-6 w-1.5 rounded-full bg-brand-600" />{title}
        </h2>
        {to && <Link to={to} className="shrink-0 text-sm font-bold text-brand-600 transition hover:text-brand-700">View All →</Link>}
      </div>
      {children}
    </section>
  )
}
