import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ settingsName, logoUrl }: { settingsName?: string; logoUrl?: string }) {
  const [err, setErr] = useState(false)
  const src = logoUrl || '/logo.png'
  const name = settingsName || 'APK FAST PRO'
  const words = name.trim().split(/\s+/)
  const first = words[0]
  const rest = words.slice(1).join(' ')
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
      {!err ? (
        <img src={src} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-100 dark:ring-slate-700"
             onError={() => setErr(true)} />
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base text-white">⚡</span>
      )}
      <span className="whitespace-nowrap">
        <span className="text-slate-900 dark:text-white">{first}</span>
        {rest && <span className="text-brand-600"> {rest}</span>}
      </span>
    </Link>
  )
}
