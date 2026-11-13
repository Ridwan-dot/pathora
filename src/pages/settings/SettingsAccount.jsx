import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { PasswordField, TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'
import { isEmail, passwordProblem } from '../../lib/validation'
import SettingsNav from './SettingsNav'

const usesPassword = (user) => !user.identities || user.identities.some((i) => i.provider === 'email')

function EmailCard({ user }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!isEmail(email)) return setError('Check your email address. It looks incomplete.')
    if (email.trim().toLowerCase() === (user.email || '').toLowerCase()) return setError('That’s already your email.')
    setError('')
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${window.location.origin}/verified` })
    setBusy(false)
    if (err) return setError(err.status === 429 ? 'Too many attempts. Please wait a few minutes.' : 'We couldn’t start that change. Please try again.')
    setPending(email.trim())
    setEmail('')
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-lg font-bold">Email</h2>
      <p className="mt-2"><b>{user.email}</b> {user.email_confirmed_at !== null && <Pill tone="ok">Verified</Pill>}</p>
      <p className="text-sm text-muted">This is the email you sign in with.</p>
      {pending && <Alert><b>Check your new email.</b> We sent a link to {pending}. Your sign-in email stays {user.email} until you verify it.</Alert>}
      <form onSubmit={submit} noValidate>
        <TextField label="New email" id="new-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" variant="outline" disabled={busy} className="mt-3">{busy ? 'Sending…' : 'Change email'}</Button>
      </form>
    </section>
  )
}

function PasswordCard({ user }) {
  const [v, setV] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setStatus(null)
    const next = {}
    if (!v.current) next.current = 'Enter your current password.'
    if (passwordProblem(v.next)) next.next = passwordProblem(v.next)
    if (v.confirm !== v.next) next.confirm = 'These passwords don’t match.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    // Check the current password first, so a borrowed, unlocked device can't change it.
    const check = await supabase.auth.signInWithPassword({ email: user.email, password: v.current })
    if (check.error) {
      setBusy(false)
      return setErrors({ current: 'That password isn’t right.' })
    }
    const { error } = await supabase.auth.updateUser({ password: v.next })
    setBusy(false)
    if (error) return setStatus({ tone: 'error', text: 'We couldn’t update your password. Please try again.' })
    setV({ current: '', next: '', confirm: '' })
    setStatus({ tone: 'success', text: 'Password updated.' })
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-lg font-bold">Password</h2>
      {!usesPassword(user) ? (
        <p className="mt-2 text-muted">You sign in with Google, so there’s no Pathora password to change.</p>
      ) : (
        <form onSubmit={submit} noValidate>
          <PasswordField label="Current password" id="cur" autoComplete="current-password" value={v.current} onChange={set('current')} error={errors.current} />
          <PasswordField label="New password" id="new" autoComplete="new-password" value={v.next} onChange={set('next')} error={errors.next} hint="At least 8 characters, with a letter and a number." />
          <PasswordField label="Confirm new password" id="conf" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} error={errors.confirm} />
          {status && <Alert tone={status.tone}>{status.text}</Alert>}
          <Button type="submit" disabled={busy} className="mt-4">{busy ? 'Updating…' : 'Update password'}</Button>
        </form>
      )}
    </section>
  )
}

export default function SettingsAccount() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [msg, setMsg] = useState('')

  async function logOut() {
    await signOut()
    navigate('/', { replace: true })
  }
  async function logOutOthers() {
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    setMsg(error ? 'We couldn’t do that just now. Please try again.' : 'You’ve been logged out of your other devices.')
  }

  return (
    <div>
      <Seo title="Settings | Pathora" description="Your account settings." path="/settings" noindex />
      <h2 className="text-2xl font-bold">Settings</h2>
      <SettingsNav />
      <div className="mt-4 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        <EmailCard user={user} />
        <PasswordCard user={user} />
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Sign-in methods</h2>
          <p className="mt-2">Email and password {usesPassword(user) ? <Pill tone="ok">On</Pill> : <Pill tone="add">Not set</Pill>}</p>
          {user.identities?.filter((i) => i.provider !== 'email').map((i) => <p key={i.provider} className="mt-1 capitalize">{i.provider} <Pill tone="ok">Connected</Pill></p>)}
          <p className="mt-2 text-sm text-muted">Google sign-in is coming later.</p>
        </section>
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Log out</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" onClick={logOut}>Log out</Button>
            <button type="button" className="btn-sm" onClick={logOutOthers}>Log out of other devices</button>
          </div>
          {msg && <Alert>{msg}</Alert>}
        </section>
      </div>
    </div>
  )
}
