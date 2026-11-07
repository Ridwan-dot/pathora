import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { supabase } from '../../lib/supabase'

const COOLDOWN = 60

export default function CheckEmail() {
  const { state } = useLocation()
  // The address can also come from this browser tab (so a page refresh keeps it).
  const stored = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('pathora-pending-email') || '',
    () => '',
  )
  const email = state?.email || stored
  const [wait, setWait] = useState(0)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  async function resend() {
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/verified` },
    })
    setBusy(false)
    if (error) {
      setWait(COOLDOWN)
      return setMessage({ tone: 'error', text: 'We couldn’t send it just now. Please wait a minute and try again.' })
    }
    setWait(COOLDOWN)
    setMessage({ tone: 'success', text: 'Email sent again. Give it a minute to arrive.' })
  }

  return (
    <div>
      <Seo title="Check your email | Pathora" description="Verify your email address to finish creating your Pathora account." path="/check-email" noindex />
      <h1 className="text-3xl font-bold">Check your email</h1>
      {state?.fromLogin && <Alert tone="error"><b>Please verify your email to continue.</b></Alert>}
      {email ? (
        <>
          <p className="mt-3">We sent a verification link to <b>{email}</b>.</p>
          <p className="text-muted">Please verify your email address before accessing your account.</p>
          <ol className="mt-3 list-decimal pl-5 text-muted">
            <li>Open the email from Pathora.</li>
            <li>Tap <b>Verify my email</b>.</li>
            <li>You’ll return to Pathora to finish setting up.</li>
          </ol>
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          <Button variant="outline" onClick={resend} disabled={busy || wait > 0} className="mt-4 w-full">
            {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : busy ? 'Sending…' : 'Resend email'}
          </Button>
          <p className="mt-4 text-center"><Link to="/signup" className="font-semibold underline">Wrong email? Change it</Link></p>
          <p className="mt-1 text-center text-sm text-muted">Nothing arrived? Check your spam folder.</p>
        </>
      ) : (
        <>
          <p className="mt-3 text-muted">We don’t know which email to check. Log in again and we’ll help.</p>
          <Button to="/login" className="mt-4">Go to log in</Button>
        </>
      )}
    </div>
  )
}
