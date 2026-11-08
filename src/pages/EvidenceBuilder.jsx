import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Seo from '../components/Seo'
import { TextArea, TextField } from '../components/TextField'
import { useAuth } from '../auth/useAuth'
import { useTable } from '../data/useTable'
import { experienceTypes } from '../data/constants'
import { addMissingSkills, assembleStatement, draftKey, toSkills } from '../data/experience'
import { endBeforeStart } from '../lib/dates'

const blank = { type: 'project', title: '', organisation: '', role: '', start_date: '', end_date: '', is_current: false, situation: '', responsibilities: '', achievements: '', skills_text: '' }
const typeHelp = {
  project: 'A school or personal project you built or worked on.',
  employment: 'A paid job, including part-time work.',
  siwes_internship: 'SIWES, industrial training or an internship.',
  volunteering: 'Unpaid work for a cause, school or community.',
  leadership: 'A club role, class rep, team captain or similar.',
}
const stepNames = ['Choose experience', 'Tell your story', 'Review evidence', 'Save to profile']

function fromRow(r) {
  return {
    ...blank,
    type: r.type, title: r.title, organisation: r.organisation || '', role: r.role || '',
    start_date: r.start_date || '', end_date: r.end_date || '', is_current: r.is_current,
    situation: r.situation || '', responsibilities: r.responsibilities || '', achievements: r.achievements || '',
    skills_text: (r.skills_used || []).join(', '),
  }
}

function Builder({ id, row, experiences, skills, userId }) {
  const key = draftKey(userId)
  // Start from the saved experience, or from a draft saved on this device, or from nothing.
  const [start] = useState(() => {
    if (row) return { step: 2, values: fromRow(row), statement: row.evidence_statement || '', restored: false }
    try {
      const d = JSON.parse(localStorage.getItem(key) || 'null')
      if (d && d.values) return { ...d, restored: true }
    } catch { /* ignore a broken draft */ }
    return { step: 1, values: blank, statement: '', restored: false }
  })
  const [step, setStep] = useState(start.step)
  const [v, setV] = useState(start.values)
  const [statement, setStatement] = useState(start.statement)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  // "Draft saved automatically": keep what you have typed on this device until you save.
  useEffect(() => {
    if (!id && !saved) localStorage.setItem(key, JSON.stringify({ step, values: v, statement }))
  }, [id, saved, key, step, v, statement])

  function next() {
    if (step === 2) {
      const e = {}
      if (!v.title.trim()) e.title = 'Please say what this was called.'
      if (!v.is_current && endBeforeStart(v.start_date, v.end_date)) e.end_date = 'The end date can’t be before the start date.'
      setErrors(e)
      if (Object.keys(e).length) return
      setStatement((s) => s || assembleStatement(v))
    }
    if (step === 3 && statement.length > 600) return setErrors({ statement: `Keep it under 600 characters. You are ${statement.length - 600} over.` })
    setErrors({})
    setStep(step + 1)
  }

  async function save() {
    setFailed(false)
    setBusy(true)
    const clean = (s) => (s || '').trim() || null
    const names = toSkills(v.skills_text)
    const values = {
      type: v.type, title: v.title.trim(), organisation: clean(v.organisation), role: clean(v.role),
      start_date: clean(v.start_date), end_date: v.is_current ? null : clean(v.end_date), is_current: v.is_current,
      situation: clean(v.situation), responsibilities: clean(v.responsibilities), achievements: clean(v.achievements),
      skills_used: names, evidence_statement: clean(statement), updated_at: new Date().toISOString(),
    }
    const { error } = id ? await experiences.update(id, values) : await experiences.add(values)
    if (error) {
      setBusy(false)
      return setFailed(true)
    }
    await addMissingSkills(skills, names)
    localStorage.removeItem(key)
    setBusy(false)
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="mt-6">
        <Alert><b>Saved to your Career Profile.</b> It now counts as evidence for the skills you listed.</Alert>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button to="/profile/experience">See my experience</Button>
          <Button variant="outline" to="/profile">Go to my profile</Button>
          <Button variant="outline" onClick={() => { setSaved(false); setV(blank); setStatement(''); setStep(1) }}>Add another</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {start.restored && <Alert><b>We restored your draft</b> from this device. Nothing is saved to your profile until the last step.</Alert>}
      <ol className="mt-4 grid gap-2 sm:grid-cols-4" aria-label="Progress">
        {stepNames.map((n, i) => (
          <li key={n} aria-current={step === i + 1 ? 'step' : undefined} className={`rounded-xl border px-3 py-2 text-sm ${step === i + 1 ? 'border-forest bg-white font-semibold' : step > i + 1 ? 'border-line bg-sage' : 'border-line bg-white text-muted'}`}>
            <b>{i + 1}</b> {n}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Step 1 of 4</p>
          <h2 className="text-2xl font-bold">What kind of experience is it?</h2>
          <fieldset className="mt-3 space-y-2">
            <legend className="sr-only">Experience type</legend>
            {experienceTypes.map((t) => (
              <label key={t.value} className={`flex min-h-12 items-start gap-3 rounded-xl border px-4 py-3 ${v.type === t.value ? 'border-forest bg-sage' : 'border-[#b9cdbf] bg-white'}`}>
                <input type="radio" name="type" className="mt-1 h-5 w-5" checked={v.type === t.value} onChange={() => setV({ ...v, type: t.value })} />
                <span><b>{t.label}</b><br /><span className="text-sm text-muted">{typeHelp[t.value]}</span></span>
              </label>
            ))}
          </fieldset>
          <Button className="mt-4" onClick={next}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">Step 2 of 4</p>
            <h2 className="text-2xl font-bold">Tell us what you actually did</h2>
            <p className="text-sm text-muted">A few details help us turn your experience into clear, credible evidence. You can leave dates or details blank if you don’t remember them.</p>
            <TextField label="What was it called?" id="title" value={v.title} onChange={set('title')} error={errors.title} placeholder="e.g. Student Result Management System" />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <TextField label="What was your role?" id="role" optional value={v.role} onChange={set('role')} placeholder="e.g. Frontend developer" />
              <TextField label="Organisation, school or team" id="organisation" optional value={v.organisation} onChange={set('organisation')} />
            </div>
            <TextField label="Tools or skills you used" id="skills_text" optional value={v.skills_text} onChange={set('skills_text')} placeholder="e.g. React, JavaScript" hint="Separate with commas." />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <TextField label="Start (month and year)" id="start_date" optional value={v.start_date} onChange={set('start_date')} placeholder="e.g. Jan 2025" />
              <TextField label="End (month and year)" id="end_date" optional value={v.is_current ? '' : v.end_date} onChange={set('end_date')} disabled={v.is_current} error={errors.end_date} placeholder="e.g. Jun 2025" />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={v.is_current} onChange={(e) => setV({ ...v, is_current: e.target.checked })} /> I still do this</label>
            <TextArea label="1. What problem were you trying to solve?" id="situation" optional value={v.situation} onChange={set('situation')} placeholder="Describe the situation in your own words..." />
            <TextArea label="2. Which part did you personally handle?" id="responsibilities" optional value={v.responsibilities} onChange={set('responsibilities')} placeholder="What did you build, organise, analyse or improve?" />
            <TextArea label="3. What changed?" id="achievements" optional value={v.achievements} onChange={set('achievements')} placeholder="A result you saw. Numbers are optional, never guessed." />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={next}>Review my evidence →</Button>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl bg-sage p-4">
              <h3 className="text-base font-bold">Let’s find the useful details</h3>
              <p className="mt-1 text-sm text-muted">You don’t need impressive-sounding words. Start with the real work.</p>
              <p className="mt-2 text-sm"><b>What was difficult?</b> A challenge, limitation or need you noticed.</p>
              <p className="mt-1 text-sm"><b>What did you do?</b> Your own actions, not just what the team did.</p>
              <p className="mt-1 text-sm"><b>What changed?</b> A result you observed. Numbers are optional.</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live preview</p>
              <h3 className="text-base font-bold">Your evidence statement</h3>
              <p className="mt-2 rounded-xl bg-sage p-3 text-sm">{assembleStatement(v) || 'Your statement will appear here as you add details.'}</p>
              <p className="mt-2 text-xs text-muted">Built only from your own words. No invented achievements or metrics.</p>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Step 3 of 4</p>
          <h2 className="text-2xl font-bold">Review your evidence</h2>
          <p className="text-sm text-muted">This starts from your own sentences. Edit it so it says exactly what you did, and nothing more.</p>
          {!statement.trim() && <Alert tone="error">There’s nothing to work from yet. Go back and describe what you did, or write your statement here.</Alert>}
          <TextArea label="Your evidence statement" id="statement" rows={5} value={statement} onChange={(e) => setStatement(e.target.value)} error={errors.statement} hint={`${statement.length} of 600 characters. Only say what is true.`} />
          <p className="mt-2 text-sm text-muted">Your career evidence stays yours. Review every statement before using it in an application.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={next}>Looks right →</Button>
            <Button variant="outline" onClick={() => setStep(2)}>Back to my answers</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Step 4 of 4</p>
          <h2 className="text-2xl font-bold">Save to your Career Profile</h2>
          <div className="mt-3 rounded-xl bg-sage p-4">
            <b>{v.title}</b>
            <p className="text-sm text-muted">{experienceTypes.find((t) => t.value === v.type)?.label}{v.organisation ? ` · ${v.organisation}` : ''}{toSkills(v.skills_text).length ? ` · ${toSkills(v.skills_text).join(', ')}` : ''}</p>
            <p className="mt-2">{statement || 'No evidence statement yet. You can add one later.'}</p>
          </div>
          {failed && <Alert tone="error"><b>We couldn’t save that.</b> Your answers are still here. Please try again.</Alert>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save to my career profile'}</Button>
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EvidenceBuilder() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const { user } = useAuth()
  const experiences = useTable('experiences')
  const skills = useTable('skills')
  const row = id ? experiences.rows.find((r) => r.id === id) : null
  const ready = !experiences.loading && !skills.loading

  return (
    <div>
      <Seo title="Experience-to-Evidence Builder | Pathora" description="Turn what you have done into clear, honest evidence." path="/evidence" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Your experience, made clear</p>
      <h1 className="mt-1 text-3xl font-bold">Turn what you’ve done into proof of what you can do.</h1>
      <p className="mt-1 text-muted">Build honest, specific evidence from your projects, studies, internships and everyday responsibilities. <span className="rounded-full bg-sage px-2 py-0.5 text-xs font-semibold">Draft saved automatically</span></p>
      {!ready ? <p role="status" className="mt-6 text-muted">Loading…</p> : id && !row ? (
        <Alert tone="error">We couldn’t find that experience. <Link className="underline" to="/profile/experience">Back to your experience</Link></Alert>
      ) : (
        <Builder key={id || 'new'} id={id} row={row} experiences={experiences} skills={skills} userId={user.id} />
      )}
    </div>
  )
}
