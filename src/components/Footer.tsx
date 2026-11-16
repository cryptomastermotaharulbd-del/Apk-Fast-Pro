import { Link } from 'react-router-dom'
import { IconDownload, IconPhone, IconShield, IconZap } from './icons'

const trust = [
  { Icon: IconShield, title: '100% Safe & Secure', sub: 'Scanned & verified' },
  { Icon: IconZap, title: 'Super Fast Download', sub: 'No speed limits' },
  { Icon: IconDownload, title: 'No Registration', sub: 'Download instantly' },
  { Icon: IconPhone, title: 'Works on All Devices', sub: 'Any Android phone' },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {trust.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card dark:bg-slate-950">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{title}</span>
                <span className="block text-xs text-slate-400">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold"><span className="text-slate-900 dark:text-white">APK</span> <span className="text-brand-600">FAST PRO</span></p>
          <p className="mt-2 text-sm text-slate-500">Fast, safe APK downloads. Discover featured, latest and trending Android apps.</p>
        </div>
        <div>
          <p className="font-semibold">Explore</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
            <li><Link className="transition hover:text-brand-600" to="/apps">All Apps</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/categories">Categories</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/latest">Latest Apps</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/trending">Trending Apps</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Company</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
            <li><Link className="transition hover:text-brand-600" to="/about">About Us</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/contact">Contact Us</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Legal</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
            <li><Link className="transition hover:text-brand-600" to="/privacy">Privacy Policy</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/disclaimer">Disclaimer</Link></li>
            <li><Link className="transition hover:text-brand-600" to="/dmca">DMCA / Copyright</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} APK FAST PRO. All rights reserved.
      </div>
    </footer>
  )
}
