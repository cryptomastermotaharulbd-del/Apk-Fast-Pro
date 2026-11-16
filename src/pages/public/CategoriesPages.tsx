import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AppItem, Category } from '../../lib/types'
import { AppGrid, Section } from '../../components/AppCard'
import Seo from '../../components/Seo'

export function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([])
  useEffect(() => { api.categories().then(c => setCats(c || [])) }, [])
  return (
    <main><Seo title="Categories — APK FAST PRO" description="Browse Android apps by category." />
      <Section title="Popular Categories">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map(c => (
            <Link key={c.id} to={`/category/${c.slug}`} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                {c.icon_url ? <img src={c.icon_url} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="text-2xl">📂</span>}
                <h3 className="font-bold">{c.name}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">{c.description}</p>
            </Link>
          ))}
        </div>
        {!cats.length && <p className="text-sm text-slate-400">No categories yet.</p>}
      </Section>
    </main>
  )
}

export function CategoryDetails() {
  const { slug = '' } = useParams()
  const [cat, setCat] = useState<Category | null>(null)
  const [apps, setApps] = useState<AppItem[]>([])
  useEffect(() => {
    api.categoryBySlug(slug).then(async c => {
      setCat(c)
      if (c) { const r = await api.appsPage(1, 48, c.id); setApps(r.apps) }
    })
  }, [slug])
  return (
    <main><Seo title={`${cat?.name || 'Category'} Apps — APK FAST PRO`} description={cat?.description || ''} />
      <Section title={cat ? `${cat.name} Apps` : 'Category'}>
        <AppGrid apps={apps} empty="No published apps in this category yet." />
      </Section>
    </main>
  )
}
