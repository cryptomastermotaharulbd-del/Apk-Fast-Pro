import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import { api } from '../../lib/api'
import type { SiteSettings } from '../../lib/types'

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Seo title={`${title} — APK FAST PRO`} />
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="mt-4 space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </main>
  )
}

export const About = () => (
  <Page title="About Us">
    <p>APK FAST PRO is an APK publishing and download platform. We list Android applications with clear version, size, developer, category and permission information so you know exactly what you are downloading.</p>
    <p>App listings are managed through a secure admin dashboard, and downloads are served either from dedicated APK file storage or from the developer's official external link.</p>
  </Page>
)

export function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [msg, setMsg] = useState('')
  useEffect(() => { api.settings().then(setSettings) }, [])
  const to = settings?.contactEmail || ''
  return (
    <Page title="Contact Us">
      <p>Questions, app submissions or copyright requests — send us a message.</p>
      {to ? <p>Direct email: <a className="text-brand-600 underline" href={`mailto:${to}`}>{to}</a></p>
        : <p className="text-amber-600">A contact email has not been set yet (Admin → Settings).</p>}
      <form className="space-y-3" onSubmit={e => {
        e.preventDefault()
        if (!to) return
        const subject = encodeURIComponent(`Contact from ${name}`)
        const body = encodeURIComponent(`${msg}\n\nFrom: ${name} <${email}>`)
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
      }}>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-xl border px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
        <textarea required value={msg} onChange={e => setMsg(e.target.value)} placeholder="Your message" rows={5} className="w-full rounded-xl border px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
        <button disabled={!to} className="rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white disabled:opacity-40">Send Message</button>
      </form>
    </Page>
  )
}

export const Privacy = () => (
  <Page title="Privacy Policy">
    <p>We collect the minimum data needed to operate this site: download events (app, version, time, browser user-agent and referrer) used for download statistics, and standard server logs.</p>
    <p>We do not sell personal data. Admin accounts are used only to manage site content. You may contact us to ask what data associated with you we hold.</p>
    <p>This template ships with the project — replace it with your own legal text before launch.</p>
  </Page>
)
export const Disclaimer = () => (
  <Page title="Disclaimer">
    <p>All app names, icons and trademarks belong to their respective owners. APK files are provided for download through their publishers' chosen hosting; verify an app's permissions and details on its page before installing.</p>
    <p>We are not affiliated with Google or the Android trademark holders. This template ships with the project — replace it with your own legal text before launch.</p>
  </Page>
)
export const Dmca = () => (
  <Page title="DMCA / Copyright Policy">
    <p>If you are a copyright owner and believe content listed here infringes your rights, contact us with: your full name and company, the work claimed to be infringed, the exact URL of the listing, and a good-faith statement.</p>
    <p>Valid requests are reviewed promptly and infringing listings are removed. Use the Contact page to reach us.</p>
  </Page>
)
export const NotFound = () => (
  <main className="mx-auto max-w-3xl px-4 py-24 text-center">
    <Seo title="404 — Page Not Found | APK FAST PRO" />
    <p className="text-6xl font-extrabold text-brand-600">404</p>
    <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
    <p className="mt-2 text-slate-500">The page you are looking for does not exist or has moved.</p>
    <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">Go Home</Link>
  </main>
)
