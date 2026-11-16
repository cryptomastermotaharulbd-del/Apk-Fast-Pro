import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { AppItem } from '../../lib/types'
import { AppGrid, Section } from '../../components/AppCard'
import Seo from '../../components/Seo'

export function AllApps() {
  const [apps, setApps] = useState<AppItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 12
  const pages = Math.max(1, Math.ceil(total / pageSize))
  useEffect(() => { api.appsPage(page, pageSize).then(r => { setApps(r.apps); setTotal(r.total) }) }, [page])
  return (
    <main><Seo title="All Apps — APK FAST PRO" description="Browse all published Android apps on APK FAST PRO." />
      <Section title="All Apps"><AppGrid apps={apps} /></Section>
      <div className="mt-8 flex items-center justify-center gap-3 pb-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40 dark:border-slate-700">← Prev</button>
        <span className="text-sm text-slate-500">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40 dark:border-slate-700">Next →</button>
      </div>
    </main>
  )
}

function SimpleList({ title, fetcher }: { title: string; fetcher: () => Promise<AppItem[] | null> }) {
  const [apps, setApps] = useState<AppItem[]>([])
  useEffect(() => { fetcher().then(a => setApps(a || [])) }, [])
  return (
    <main><Seo title={`${title} — APK FAST PRO`} />
      <Section title={title}><AppGrid apps={apps} /></Section>
    </main>
  )
}
export const LatestApps = () => <SimpleList title="Latest Apps" fetcher={() => api.latestApps(24)} />
export const TrendingApps = () => <SimpleList title="Trending Apps" fetcher={() => api.trendingApps(24)} />
