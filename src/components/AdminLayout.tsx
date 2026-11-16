import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const nav = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/apps', label: '📱 Apps' },
  { to: '/admin/apps/new', label: '➕ Add App' },
  { to: '/admin/categories', label: '🏷 Categories' },
  { to: '/admin/posts', label: '📝 Posts' },
  { to: '/admin/media', label: '🖼 Media' },
  { to: '/admin/downloads', label: '⬇ Downloads' },
  { to: '/admin/analytics', label: '📈 Analytics' },
  { to: '/admin/users', label: '👥 Admin Users' },
  { to: '/admin/settings', label: '⚙ Settings' },
]

export const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900'
export const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400'
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className={labelCls}>{label}</span>{children}</label>
}

export default function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menu = (
    <div className="flex h-full flex-col gap-1 p-4">
      <Logo />
      <p className="mb-3 mt-1 truncate text-xs text-slate-400">{user?.email}</p>
      {nav.map(n => (
        <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
          className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-slate-800' : ''}`}>
          {n.label}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1">
        <Link to="/" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">🌐 View site</Link>
        <button onClick={async () => { await signOut(); navigate('/admin/login') }}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-slate-800">Sign out</button>
      </div>
    </div>
  )
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-slate-100 lg:block dark:border-slate-800">{menu}</aside>
      {open && <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden dark:bg-slate-950">{menu}</aside>}
      <main className="min-w-0 flex-1 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <button onClick={() => setOpen(true)} className="rounded-lg border px-3 py-1 dark:border-slate-700">☰</button>
          <span className="font-bold">Admin</span>
        </div>
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <h1 className="mb-5 text-2xl font-extrabold">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
