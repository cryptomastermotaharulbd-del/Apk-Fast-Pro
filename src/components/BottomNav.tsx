import { NavLink } from 'react-router-dom'
import { IconDoc, IconGrid, IconHome, IconTrend } from './icons'

const items = [
  { to: '/', label: 'Home', Icon: IconHome, end: true },
  { to: '/categories', label: 'Categories', Icon: IconGrid, end: false },
  { to: '/trending', label: 'Trending', Icon: IconTrend, end: false },
  { to: '/blog', label: 'Blog', Icon: IconDoc, end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="grid grid-cols-4">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
            {({ isActive }) => (<>
              {isActive && <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-brand-600" />}
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </>)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
