import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AppItem } from '../../lib/types'
import { AppGrid, Section } from '../../components/AppCard'
import Seo from '../../components/Seo'

export default function SearchPage() {
  const [params] = useSearchParams()
  const term = params.get('q') || ''
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    if (!term) { setApps([]); setLoading(false); return }
    const safe = term.replace(/[%_,()]/g, ' ')
    api.searchApps(safe).then(a => setApps(a || [])).finally(() => setLoading(false))
  }, [term])
  return (
    <main><Seo title={`Search: ${term} — APK FAST PRO`} />
      <Section title={term ? `Results for “${term}”` : 'Search'}>
        {loading ? <p className="text-slate-400">Searching…</p> : <AppGrid apps={apps} empty="No apps matched your search." />}
      </Section>
    </main>
  )
}
