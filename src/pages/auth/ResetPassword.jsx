import { useState } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { PasswordField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'
import { passwordProblem } from '../../lib/validation'

export default function ResetPassword() {
  const { session, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const seo = <Seo title="Set a new password | Pathora" description="Set a new Pathora password." path="/reset-password" noindex />

  if (loading) return <>{seo}<p role="status" className="text-muted">Checking your link…</p></>

  if (done) {
    return (
      <>{seo}
        <Alert>Password updated. You’re signed in.</Alert>
        <Button to="/dashboard" className="mt-5 w-full">Go to my dashboard</Button>
      </>
    )
  }

  // No session means the link was not valid, or it has expired.
  if (!session) {
    return (
      <>{seo}
        <h1 className="text-3xl font-bold">This link has expired</h1>
        <Alert tone="error">Reset links only work for a limited time.</Alert>
        <Button to="/forgot-password" className="mt-5">Request a new link</Button>
      </>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    const next = {}
    if (passwordProblem(password)) next.password = passwordProblem(password)
    if (confirm !== password) next.confirm = 'These passwords don’t match.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setFormError('We couldn’t update your password. Please try again, or request a new link.')
    setDone(true)
  }

  return (
    <>{seo}
      <h1 className="text-3xl font-bold">Set a new password</h1>
      <p className="mt-1 text-muted">Choose something you haven’t used here before.</p>
      {formError && <Alert tone="error">{formError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <PasswordField label="New password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters, with a letter and a number." />
        <PasswordField label="Confirm new password" id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Button type="submit" disabled={busy} className="mt-5 w-full">{busy ? 'Updating…' : 'Update password'}</Button>
      </form>
    </>
  )
}
