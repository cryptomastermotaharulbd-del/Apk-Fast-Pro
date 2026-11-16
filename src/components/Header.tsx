import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'
import type { SiteSettings } from '../lib/types'
import { supabaseConfigured } from '../lib/supabase'
import { IconMenu, IconMoon, IconSearch, IconSun } from './icons'

const links = [
  { to: '/', label: 'Home' }, { to: '/apps', label: 'All Apps' },
  { to: '/categories', label: 'Categories' }, { to: '/latest', label: 'Latest' },
  { to: '/trending', label: 'Trending' }, { to: '/blog', label: 'Blog' },
]

export default function Header() {
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const navigate = useNavigate()
  useEffect(() => { api.settings().then(setSettings) }, [])
  const goSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (term.trim()) { setOpen(false); setSearchOpen(false); navigate(`/search?q=${encodeURIComponent(term.trim())}`) }
  }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      {!supabaseConfigured && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Setup required: add Supabase env vars to load live data — see README.
        </div>
      )}
      {settings?.maintenanceMode && (
        <div className="bg-red-50 px-4 py-2 text-center text-xs text-red-700">The site is in maintenance mode.</div>
      )}
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3">
        <Logo settingsName={settings?.siteName} logoUrl={settings?.logoUrl} />
        <nav className="ml-3 hidden items-center gap-1 lg:flex">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-600 text-white shadow-pop' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <form className="relative ml-auto hidden w-full max-w-xs md:block xl:max-w-sm" onSubmit={goSearch}>
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search apps…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-900" />
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button onClick={() => setSearchOpen(o => !o)} aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 md:hidden dark:bg-slate-800 dark:text-slate-300">
            <IconSearch className="h-5 w-5" />
          </button>
          <button onClick={toggle} aria-label="Toggle theme"
            className="flex h-10 items-center gap-2 rounded-full bg-slate-900 px-3.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
            {dark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'} Mode</span>
          </button>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 lg:hidden dark:bg-slate-800 dark:text-slate-200">
            <IconMenu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden dark:border-slate-800 animate-fadeUp">
          <form className="relative" onSubmit={goSearch}>
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input autoFocus value={term} onChange={e => setTerm(e.target.value)} placeholder="Search apps…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900" />
          </form>
        </div>
      )}
      {open && (
        <div className="border-t border-slate-100 px-4 py-3 lg:hidden dark:border-slate-800 animate-fadeUp">
          <div className="grid gap-1">
            {links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800">{l.label}</Link>)}
          </div>
        </div>
      )}
    </header>
  )
}
