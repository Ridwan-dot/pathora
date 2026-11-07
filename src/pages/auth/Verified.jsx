import { useSyncExternalStore } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { useAuth } from '../../auth/useAuth'

export default function Verified() {
  const { session, loading } = useAuth()
  // If the link was bad or has expired, Supabase adds an error to the address.
  const address = useSyncExternalStore(
    () => () => {},
    () => window.location.hash + window.location.search,
    () => '',
  )
  const linkError = /error/i.test(address)

  const seo = <Seo title="Email verified | Pathora" description="Your email address is verified." path="/verified" noindex />

  if (linkError) {
    return (
      <>{seo}
        <Alert tone="error"><b>This link has expired.</b> Verification links only work for a limited time.</Alert>
        <p className="mt-3 text-muted">Log in and we’ll send you a new one.</p>
        <Button to="/login" className="mt-4">Go to log in</Button>
      </>
    )
  }
  if (loading) return <>{seo}<p role="status" className="text-muted">Verifying your email…</p></>
  if (session) {
    return (
      <>{seo}
        <Alert><b>Email verified.</b></Alert>
        <h1 className="mt-4 text-3xl font-bold">You’re in. Welcome to Pathora.</h1>
        <p className="mt-1 text-muted">Your email address is confirmed. Let’s set up your start.</p>
        <Button to="/onboarding" className="mt-5 w-full">Continue</Button>
      </>
    )
  }
  return (
    <>{seo}
      <Alert><b>Your email may already be verified.</b> You can log in.</Alert>
      <Button to="/login" className="mt-4">Log in</Button>
    </>
  )
}
