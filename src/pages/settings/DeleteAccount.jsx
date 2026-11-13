import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { PasswordField, TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabase'

export default function DeleteAccount() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [word, setWord] = useState('')
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const hasPassword = !user.identities || user.identities.some((i) => i.provider === 'email')

  async function submit(e) {
    e.preventDefault()
    setFailed(false)
    const next = {}
    if (hasPassword && !password) next.password = 'Enter your password.'
    if (word !== 'DELETE') next.word = 'Type DELETE exactly to continue.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    if (hasPassword) {
      const check = await supabase.auth.signInWithPassword({ email: user.email, password })
      if (check.error) { setBusy(false); return setErrors({ password: 'That password isn’t right.' }) }
    }
    const { error } = await supabase.rpc('delete_my_account')
    if (error) { setBusy(false); return setFailed(true) }
    await signOut()
    setBusy(false)
    setDone(true)
  }

  if (done) {
    return (
      <div>
        <Seo title="Account deleted | Pathora" description="Your account has been deleted." path="/settings/delete" noindex />
        <Alert><b>Your account has been deleted.</b> Thank you for using Pathora. You’re welcome back any time.</Alert>
        <Button to="/" className="mt-4">Back to the homepage</Button>
      </div>
    )
  }

  return (
    <div>
      <Seo title="Delete account | Pathora" description="Delete your account." path="/settings/delete" noindex />
      <h1 className="text-3xl font-bold">Delete your account</h1>
      <p className="mt-1 text-muted">This permanently removes your account and everything in it. It can’t be undone.</p>
      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">What will be deleted</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Your Career Profile and experiences</li>
          <li>Your analysed jobs</li>
          <li>Your CVs and their versions</li>
          <li>Your applications, notes and history</li>
          <li>Your sign-in details</li>
        </ul>
        <p className="mt-3 rounded-xl bg-sage p-3"><b>Want a copy first?</b> <Link className="underline" to="/settings/privacy">Download my data</Link> before you continue.</p>
      </section>
      <form onSubmit={submit} noValidate className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Confirm it’s you</h2>
        {hasPassword && <PasswordField id="pw" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />}
        <TextField label="Type DELETE to confirm" id="word" value={word} onChange={(e) => setWord(e.target.value)} error={errors.word} placeholder="DELETE" />
        {failed && <Alert tone="error"><b>We couldn’t delete your account.</b> Nothing was removed. Try again.</Alert>}
        <Button type="submit" disabled={busy} className="mt-4 w-full bg-danger! hover:opacity-90">{busy ? 'Deleting your account…' : 'Delete my account'}</Button>
        <p className="mt-3 text-center"><Link to="/settings" className="font-semibold underline">Keep my account</Link></p>
      </form>
    </div>
  )
}
