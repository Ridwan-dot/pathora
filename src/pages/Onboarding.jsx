import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Seo from '../components/Seo'
import { useAuth } from '../auth/useAuth'

const stages = ['Student', 'Recent graduate', 'NYSC member', 'Looking for an internship', 'Changing careers']
const roleIdeas = ['Customer support', 'Data analysis', 'Software development', 'Business analysis']
const starts = [
  { t: 'Analyse a job', d: 'Paste a vacancy and see what it really asks for.', to: '/analyse' },
  { t: 'Build my evidence', d: 'Turn a project or placement into clear evidence.', to: '/profile' },
  { t: 'Set up my profile', d: 'Add your education, skills and goals.', to: '/profile' },
]

export default function Onboarding() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [stage, setStage] = useState(profile?.stage || '')
  const [role, setRole] = useState(profile?.target_role || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Each step saves as you go, so leaving part-way never loses your answers.
  async function save(patch, next) {
    setError('')
    setBusy(true)
    const { error: err } = await updateProfile(patch)
    setBusy(false)
    if (err) return setError('We couldn’t save that. Please try again.')
    next()
  }

  async function finish(to) {
    await save({ onboarding_done: true }, () => navigate(to))
  }

  return (
    <div>
      <Seo title="Welcome | Pathora" description="Set up your Pathora start." path="/onboarding" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</p>
      <h1 className="mt-1 text-3xl font-bold">Let’s set up your start.</h1>
      <p className="mt-1 text-muted">Three quick questions. You can change any answer later.</p>

      <div className="mt-5 rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Step {step} of 3</p>
        <div className="mt-2 flex gap-1.5" role="img" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((n) => <i key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-forest' : 'bg-line'}`} />)}
        </div>
        {error && <Alert tone="error">{error}</Alert>}

        {step === 1 && (
          <fieldset className="mt-4">
            <legend className="text-2xl font-bold">Where are you right now?</legend>
            <div className="mt-3 space-y-2">
              {stages.map((s) => (
                <label key={s} className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 ${stage === s ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>
                  <input type="radio" name="stage" className="h-5 w-5" checked={stage === s} onChange={() => setStage(s)} /> {s}
                </label>
              ))}
            </div>
            {!stage && error === '' && null}
            <Button className="mt-4" disabled={!stage || busy} onClick={() => save({ stage }, () => setStep(2))}>Continue</Button>
            {!stage && <p className="mt-2 text-sm text-muted">Choose one option to continue.</p>}
          </fieldset>
        )}

        {step === 2 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold">What role are you aiming for?</h2>
            <label htmlFor="role" className="mt-3 block text-sm font-semibold">Target role</label>
            <input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Junior Business Analyst" className="w-full rounded-xl border border-[#b9cdbf] bg-cream px-3 py-3" />
            <p className="mt-3">
              {roleIdeas.map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)} className="mb-1.5 mr-1.5 min-h-10 rounded-full border border-[#b9cdbf] bg-white px-4 py-2">{r}</button>
              ))}
              <button type="button" onClick={() => setRole('Not sure yet')} className="mb-1.5 min-h-10 rounded-full border border-forest bg-sage px-4 py-2 font-semibold">Not sure yet</button>
            </p>
            <p className="text-sm text-muted">“Not sure yet” is a perfectly good answer. We’ll help you explore.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={busy} onClick={() => save({ target_role: role.trim() || null }, () => setStep(3))}>Continue</Button>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold">Where would you like to start?</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {starts.map((s) => (
                <button key={s.t} type="button" disabled={busy} onClick={() => finish(s.to)} className="rounded-2xl border border-line bg-white p-4 text-left hover:bg-sage/50">
                  <b>{s.t}</b>
                  <span className="mt-1 block text-sm text-muted">{s.d}</span>
                </button>
              ))}
            </div>
            <button type="button" disabled={busy} onClick={() => finish('/dashboard')} className="mt-4 min-h-10 font-semibold underline">I’ll explore on my own</button>
          </div>
        )}
      </div>
    </div>
  )
}
