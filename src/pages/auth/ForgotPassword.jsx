import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'
import { isEmail } from '../../lib/validation'

export default function ForgotPassword() {
  const { configured } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function send() {
    setFormError('')
    setBusy(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    // Always show the same message, so nobody can use this page to find out who has an account.
    if (err && err.status === 429) return setFormError('Too many attempts. Please wait a few minutes and try again.')
    setSent(true)
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!isEmail(email)) return setError('Check your email address. It looks incomplete.')
    setError('')
    send()
  }

  return (
    <div>
      <Seo title="Reset your password | Pathora" description="Reset your Pathora password." path="/forgot-password" noindex />
      {sent ? (
        <>
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="mt-2 text-muted">If an account exists for that address, we’ve sent a link to reset your password. The link works for a limited time.</p>
          <p className="mt-2 text-sm text-muted">Nothing arrived? Check spam, or <button type="button" onClick={send} className="font-semibold underline">send it again</button>.</p>
          {formError && <Alert tone="error">{formError}</Alert>}
          <Button to="/login" variant="outline" className="mt-5">Back to log in</Button>
        </>
      ) : (
        <>
          <p><Link to="/login" className="underline">← Back to log in</Link></p>
          <h1 className="mt-3 text-3xl font-bold">Reset your password</h1>
          <p className="mt-1 text-muted">Enter your email and we’ll send you a link to set a new one.</p>
          {!configured && <Alert tone="error">This site isn’t connected to Supabase yet.</Alert>}
          {formError && <Alert tone="error">{formError}</Alert>}
          <form onSubmit={onSubmit} noValidate>
            <TextField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@example.com" />
            <Button type="submit" disabled={busy || !configured} className="mt-5 w-full">{busy ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        </>
      )}
    </div>
  )
}
