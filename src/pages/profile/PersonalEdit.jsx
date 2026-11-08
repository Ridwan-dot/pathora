import { useState } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { TextArea, TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { roleIdeas } from '../../data/constants'
import { isWebAddress } from '../../lib/dates'

function Form({ profile, email, updateProfile }) {
  const [v, setV] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    location: profile.location || '',
    link: profile.link || '',
    target_role: profile.target_role || '',
    summary: profile.summary || '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setStatus(null)
    const next = {}
    if (!v.full_name.trim()) next.full_name = 'Please enter your name.'
    if (!/^[+\d\s()-]*$/.test(v.phone)) next.phone = 'Use numbers only, for example +234 801 234 5678.'
    if (v.link && !isWebAddress(v.link)) next.link = 'Start the link with https://'
    if (v.summary.length > 600) next.summary = `Keep your summary under 600 characters. You are ${v.summary.length - 600} over.`
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const clean = (s) => s.trim() || null
    const { error } = await updateProfile({
      full_name: clean(v.full_name),
      phone: clean(v.phone),
      location: clean(v.location),
      link: clean(v.link),
      target_role: clean(v.target_role),
      summary: clean(v.summary),
    })
    setBusy(false)
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Basic information</h2>
        <TextField label="Full name" id="full_name" value={v.full_name} onChange={set('full_name')} error={errors.full_name} autoComplete="name" />
        <TextField label="Email" id="email" value={email} readOnly hint="This is your sign-in email. You’ll be able to change it in Settings." />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField label="Phone" id="phone" optional value={v.phone} onChange={set('phone')} error={errors.phone} placeholder="+234..." autoComplete="tel" />
          <TextField label="Location" id="location" optional value={v.location} onChange={set('location')} placeholder="e.g. Lagos, Nigeria" />
        </div>
        <TextField label="LinkedIn or portfolio link" id="link" optional value={v.link} onChange={set('link')} error={errors.link} placeholder="https://" />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Career interests</h2>
        <p className="text-sm text-muted">Pick a suggestion, type your own, or choose “Not sure yet”. You can change it any time.</p>
        <TextField label="Role you are aiming for" id="target_role" optional value={v.target_role} onChange={set('target_role')} placeholder="e.g. Junior Business Analyst" />
        <p className="mt-3">
          {[...roleIdeas, 'Not sure yet'].map((r) => (
            <button key={r} type="button" onClick={() => setV({ ...v, target_role: r })} className={`mb-1.5 mr-1.5 min-h-10 rounded-full border px-4 py-2 ${v.target_role === r ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>{r}</button>
          ))}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Professional summary</h2>
        <TextArea label="Summary" id="summary" rows={4} optional value={v.summary} onChange={set('summary')} error={errors.summary} hint={`Two to four sentences: who you are, what you have done, what you want next. Keep it true. ${v.summary.length} of 600 characters.`} />
      </div>

      {status === 'saved' && <Alert><b>Changes saved.</b> Your Career Profile is up to date.</Alert>}
      {status === 'error' && <Alert tone="error"><b>We couldn’t save that.</b> Nothing was lost on this page. Please try again.</Alert>}
      <Button type="submit" disabled={busy} className="mt-5">{busy ? 'Saving…' : 'Save changes'}</Button>
    </form>
  )
}

export default function PersonalEdit() {
  const { profile, user, updateProfile } = useAuth()
  return (
    <div>
      <Seo title="Edit personal information | Pathora" description="Edit your personal information." path="/profile/personal" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Career Profile</p>
      <h1 className="mt-1 text-3xl font-bold">Your details</h1>
      <p className="mt-1 text-muted">Only what helps Pathora and your CV. Everything is optional except your name.</p>
      {profile ? <Form profile={profile} email={user.email} updateProfile={updateProfile} /> : <p role="status" className="mt-6 text-muted">Loading…</p>}
    </div>
  )
}
