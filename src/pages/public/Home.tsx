import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import type { AppItem, Category, SiteSettings } from '../../lib/types'
import { AppGrid, Section } from '../../components/AppCard'
import Seo from '../../components/Seo'
import { IconDots, IconDownload, IconGamepad, IconGrid, IconMusic, IconPlay, IconShield, IconTool } from '../../components/icons'

const shortcuts = [
  { label: 'Games', to: '/category/games', Icon: IconGamepad, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  { label: 'Apps', to: '/apps', Icon: IconGrid, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/40' },
  { label: 'Video', to: '/category/video-players', Icon: IconPlay, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950' },
  { label: 'Music', to: '/category/music', Icon: IconMusic, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950' },
  { label: 'Tools', to: '/category/tools', Icon: IconTool, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950' },
  { label: 'Security', to: '/category/security', Icon: IconShield, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
  { label: 'More', to: '/categories', Icon: IconDots, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
]

export default function Home() {
  const [featured, setFeatured] = useState<AppItem[]>([])
  const [latest, setLatest] = useState<AppItem[]>([])
  const [trending, setTrending] = useState<AppItem[]>([])
  const [top, setTop] = useState<AppItem[]>([])
  const [updated, setUpdated] = useState<AppItem[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const show = (key: string) => settings?.homepage?.[key] !== false

  useEffect(() => {
    Promise.all([api.featuredApps(), api.latestApps(), api.trendingApps(), api.topDownloaded(), api.recentlyUpdated(), api.categories(), api.settings()])
      .then(([f, l, t, td, u, c, s]) => {
        setFeatured(f || []); setLatest(l || []); setTrending(t || []); setTop(td || []); setUpdated(u || []); setCats(c || []); setSettings(s)
      }).finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <Seo title="APK FAST PRO — Fast & Safe APK Downloads"
        description="Discover featured, latest, trending and most downloaded Android apps on APK FAST PRO."
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'APK FAST PRO' }} />

      {/* Hero — reference style: light green gradient, mascot right */}
      <section className="overflow-hidden bg-gradient-to-br from-brand-50 via-emerald-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-10 sm:pt-14 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
              Download APKs —<br /><span className="text-brand-600">Fast &amp; Safe</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Get the latest Android apps, games and more with just one click — with version, size and permission details before you download. 100% secure!
            </p>
            <Link to="/apps"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 font-display font-bold text-white shadow-pop transition hover:from-brand-700 hover:to-brand-600">
              Browse All Apps →
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <img src="/hero-android.jpg" alt="Android apps on APK FAST PRO" width={1100} height={733}
              className="w-full animate-floaty rounded-[2rem] shadow-pop" />
          </div>
        </div>
      </section>

      {/* Category shortcuts — reference style icon tiles */}
      <section className="mx-auto -mt-2 max-w-7xl px-4 pt-6">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {shortcuts.map(({ label, to, Icon, color }) => (
            <Link key={label} to={to}
              className="group flex flex-col items-center gap-2 rounded-3xl border border-slate-100 bg-white px-2 py-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop dark:border-slate-800 dark:bg-slate-900">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}><Icon className="h-6 w-6" /></span>
              <span className="text-xs font-bold sm:text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {loading ? <p className="py-16 text-center text-slate-400">Loading…</p> : <>
        {/* Download banner — reference style green gradient */}
        <section className="mx-auto mt-10 max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-8 text-white shadow-pop sm:px-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/15 ring-8 ring-white/10">
                <IconDownload className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Download Your Favorite Apps Today!</h2>
                <p className="mt-1 text-brand-100">Fast, Secure and 100% Free</p>
              </div>
              <Link to="/apps" className="shrink-0 rounded-full bg-white px-6 py-3 font-display font-bold text-brand-700 shadow transition hover:bg-brand-50">
                Download Now →
              </Link>
            </div>
          </div>
        </section>

        {show('featured') && <Section title="Featured Apps" to="/apps"><AppGrid apps={featured} empty="No featured apps yet. An admin can feature apps from the dashboard." /></Section>}
        {show('latest') && <Section title="Latest Apps" to="/latest"><AppGrid apps={latest.slice(0, 8)} /></Section>}
        {show('trending') && <Section title="Trending Apps" to="/trending"><AppGrid apps={trending.slice(0, 8)} /></Section>}
        {show('mostDownloaded') && <Section title="Most Downloaded Apps" to="/apps"><AppGrid apps={top.slice(0, 8)} /></Section>}
        {show('categories') && <Section title="Popular Categories" to="/categories">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cats.map(c => (
              <Link key={c.id} to={`/category/${c.slug}`} className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop dark:border-slate-800 dark:bg-slate-900">
                {c.icon_url ? <img src={c.icon_url} alt="" loading="lazy" className="h-10 w-10 rounded-xl object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-lg">📂</span>}
                <span className="text-sm font-bold">{c.name}</span>
              </Link>
            ))}
          </div>
          {!cats.length && <p className="text-sm text-slate-400">No categories yet.</p>}
        </Section>}
        {show('recentlyUpdated') && <Section title="Recently Updated Apps" to="/latest"><AppGrid apps={updated.slice(0, 8)} /></Section>}
      </>}
    </main>
  )
}
