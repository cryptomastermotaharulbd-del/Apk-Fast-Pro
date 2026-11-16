import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'
import { inputCls, Field } from '../../components/AdminLayout'

export default function AdminLogin() {
  const { session, isAdmin, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  if (session && isAdmin) return <Navigate to="/admin/dashboard" replace />
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-900">
      <form className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-950"
        onSubmit={async e => {
          e.preventDefault(); setBusy(true); setError('')
          const r = await signIn(email.trim(), password)
          setBusy(false)
          if (r.error) setError(r.error)
          else navigate(location.state?.from && location.state.from !== '/admin/login' ? location.state.from : '/admin/dashboard')
        }}>
        <Logo />
        <h1 className="mt-4 text-xl font-bold">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">Authorized admin accounts only. There is no public registration.</p>
        <div className="mt-5 space-y-4">
          <Field label="Email"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></Field>
          <Field label="Password"><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} /></Field>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="mt-5 w-full rounded-xl bg-brand-600 py-2.5 font-semibold text-white disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </main>
  )
}
