import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { PasswordField, TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'
import { isEmail, passwordProblem } from '../../lib/validation'

export default function Signup() {
  const { session, configured } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [exists, setExists] = useState(false)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/dashboard" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    setExists(false)
    const next = {}
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!isEmail(email)) next.email = 'Check your email address. It looks incomplete.'
    if (passwordProblem(password)) next.password = passwordProblem(password)
    if (!agree) next.agree = 'Please agree to continue.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/verified` },
    })
    setBusy(false)

    if (error) {
      setFormError(error.status === 429 ? 'Too many attempts. Please wait a few minutes and try again.' : 'We couldn’t create your account just now. Please try again.')
      return
    }
    // Supabase returns a user with no identities when the email already has an account.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setExists(true)
      return
    }
    if (data.session) return navigate('/onboarding') // email confirmation switched off
    sessionStorage.setItem('pathora-pending-email', email.trim())
    navigate('/check-email', { state: { email: email.trim() } })
  }

  return (
    <div>
      <Seo title="Create your account | Pathora" description="Create your free Pathora account." path="/signup" noindex />
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-muted">It takes a minute. You can add the rest later.</p>
      {!configured && <Alert tone="error">This site isn’t connected to Supabase yet. Add the keys to your .env file.</Alert>}
      {exists && (
        <Alert tone="error">
          <b>This email already has an account.</b> <Link className="underline" to="/login">Log in instead</Link> or{' '}
          <Link className="underline" to="/forgot-password">reset your password</Link>.
        </Alert>
      )}
      {formError && <Alert tone="error">{formError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <TextField label="Your name" id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Amina" />
        <TextField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <PasswordField id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters, with a letter and a number." />
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.</span>
        </label>
        {errors.agree && <p role="alert" className="mt-1 text-sm text-danger">{errors.agree}</p>}
        <Button type="submit" disabled={busy || !configured} className="mt-5 w-full">{busy ? 'Creating your account…' : 'Create my account'}</Button>
      </form>
      <p className="mt-4 text-center text-muted">Already have an account? <Link to="/login" className="font-semibold underline">Log in</Link></p>
    </div>
  )
}
