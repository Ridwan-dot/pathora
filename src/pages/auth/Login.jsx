import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { PasswordField, TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'
import { isEmail } from '../../lib/validation'

export default function Login() {
  const { session, configured } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={state?.from || '/dashboard'} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    const next = {}
    if (!isEmail(email)) next.email = 'Please enter your email.'
    if (!password) next.password = 'Please enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (!error) return navigate(state?.from || '/dashboard', { replace: true })

    if (error.code === 'email_not_confirmed') {
      sessionStorage.setItem('pathora-pending-email', email.trim())
      return navigate('/check-email', { state: { email: email.trim(), fromLogin: true } })
    }
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
      return setFormError('Too many attempts. Please wait a few minutes, or reset your password.')
    }
    if (error.code === 'invalid_credentials') {
      return setFormError('That email or password doesn’t match. Try again, or reset your password.')
    }
    setFormError('We couldn’t log you in just now. Please try again.')
  }

  return (
    <div>
      <Seo title="Log in | Pathora" description="Log in to your Pathora account." path="/login" noindex />
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 text-muted">Log in to pick up where you left off.</p>
      {!configured && <Alert tone="error">This site isn’t connected to Supabase yet. Add the keys to your .env file.</Alert>}
      {formError && <Alert tone="error">{formError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <TextField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <PasswordField id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <p className="mt-2 text-right"><Link to="/forgot-password" className="font-semibold underline">Forgot password?</Link></p>
        <Button type="submit" disabled={busy || !configured} className="mt-3 w-full">{busy ? 'Logging you in…' : 'Log in'}</Button>
      </form>
      <p className="mt-4 text-center text-muted">New here? <Link to="/signup" className="font-semibold underline">Create an account</Link></p>
    </div>
  )
}
