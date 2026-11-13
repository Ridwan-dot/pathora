import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { useAuth } from '../../auth/useAuth'
import { useTable } from '../../data/useTable'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../tracker/attention'
import SettingsNav from './SettingsNav'

const TABLES = ['profiles', 'education', 'skills', 'experiences', 'job_analyses', 'cvs', 'cv_versions', 'applications', 'application_events']

export default function SettingsPrivacy() {
  const { user } = useAuth()
  const education = useTable('education')
  const skills = useTable('skills')
  const experiences = useTable('experiences')
  const jobs = useTable('job_analyses')
  const cvs = useTable('cvs')
  const apps = useTable('applications')
  const [state, setState] = useState('idle') // idle | busy | done | failed

  const rows = [
    ['Career Profile', 'Your details, education and skills', education.rows.length + skills.rows.length],
    ['Experiences', 'Projects, internships and more', experiences.rows.length],
    ['Analysed jobs', 'Job descriptions you pasted', jobs.rows.length],
    ['CVs', 'Your CVs and their versions', cvs.rows.length],
    ['Applications', 'Your tracked applications', apps.rows.length],
  ]

  async function download() {
    setState('busy')
    const out = { exported_at: new Date().toISOString(), account: { email: user.email } }
    for (const t of TABLES) {
      const { data, error } = await supabase.from(t).select('*')
      if (error) return setState('failed')
      out[t] = data
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pathora-my-data-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setState('done')
  }

  return (
    <div>
      <Seo title="Privacy and data | Pathora" description="Your data and privacy." path="/settings/privacy" noindex />
      <h2 className="text-2xl font-bold">Settings</h2>
      <SettingsNav />

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">What Pathora keeps for you</h2>
        <p className="text-sm text-muted">Everything here is yours, and only you can see it.</p>
        {rows.map(([name, desc, n], i) => (
          <div key={name} className={`flex flex-wrap items-center justify-between gap-2 py-2 ${i ? 'border-t border-line' : 'mt-2'}`}>
            <span><b>{name}</b><br /><span className="text-sm text-muted">{desc}</span></span>
            <span className="text-muted">{n} item{n === 1 ? '' : 's'}</span>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">How Pathora uses AI</h2>
        <p className="mt-2 text-muted">Right now, Pathora does not send your information to any AI service. When AI features are added, this page will explain exactly what is sent, and you’ll be asked first.</p>
        <p className="mt-2 text-sm text-muted">Read the <Link className="underline" to="/privacy">Privacy Policy</Link> and <Link className="underline" to="/terms">Terms</Link>. Both are drafts that need a proper review before launch.</p>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Your data</h2>
        <div className="mt-2">
          <b>Download my data</b>
          <p className="text-sm text-muted">A copy of everything above, as a file you can keep.</p>
          <Button variant="outline" className="mt-2" onClick={download} disabled={state === 'busy'}>{state === 'busy' ? 'Preparing…' : 'Download my data'}</Button>
          {state === 'done' && <Alert>Your data has been downloaded.</Alert>}
          {state === 'failed' && <Alert tone="error"><b>We couldn’t prepare your data.</b> Nothing was changed. Try again.</Alert>}
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <b>Delete my account</b>
          <p className="text-sm text-muted">Removes your account and everything in it. This can’t be undone.</p>
          <Link to="/settings/delete" className="btn-sm btn-sm-danger mt-2">Delete account</Link>
        </div>
      </section>
    </div>
  )
}
