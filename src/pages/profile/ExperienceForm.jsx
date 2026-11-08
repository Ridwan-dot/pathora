import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { TextArea, TextField } from '../../components/TextField'
import { useTable } from '../../data/useTable'
import { experienceTypes } from '../../data/constants'
import { useAuth } from '../../auth/useAuth'
import { addMissingSkills, assembleStatement, draftKey, toSkills } from '../../data/experience'
import { endBeforeStart, isWebAddress } from '../../lib/dates'

const blank = { type: 'project', title: '', organisation: '', role: '', start_date: '', end_date: '', is_current: false, situation: '', responsibilities: '', achievements: '', skills_text: '', evidence_link: '', evidence_statement: '' }

function Form({ initial, id, experiences, skills }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState(false)
  const [hint, setHint] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  // Starting point = your own sentences, joined. Nothing is added or reworded.
  function startingPoint() {
    const own = assembleStatement(v)
    if (!own) return setHint('Fill in what you were responsible for first.')
    if (v.evidence_statement.trim()) return setHint('Clear the statement box first, or edit it directly.')
    setHint('')
    setV({ ...v, evidence_statement: own })
  }

  // Hand what you have typed over to the guided builder, so nothing is lost.
  function openBuilder() {
    localStorage.setItem(draftKey(user.id), JSON.stringify({ step: 2, values: { ...v }, statement: v.evidence_statement }))
    navigate('/evidence')
  }

  async function submit(e) {
    e.preventDefault()
    setFailed(false)
    const next = {}
    if (!v.title.trim()) next.title = 'Please give this a title.'
    if (!v.is_current && endBeforeStart(v.start_date, v.end_date)) next.end_date = 'The end date can’t be before the start date.'
    if (v.evidence_link && !isWebAddress(v.evidence_link)) next.evidence_link = 'Start the link with https://'
    if (v.evidence_statement.length > 600) next.evidence_statement = `Keep it under 600 characters. You are ${v.evidence_statement.length - 600} over.`
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const clean = (s) => s.trim() || null
    const skillsUsed = toSkills(v.skills_text)
    const values = {
      type: v.type,
      title: v.title.trim(),
      organisation: clean(v.organisation),
      role: clean(v.role),
      start_date: clean(v.start_date),
      end_date: v.is_current ? null : clean(v.end_date),
      is_current: v.is_current,
      situation: clean(v.situation),
      responsibilities: clean(v.responsibilities),
      achievements: clean(v.achievements),
      skills_used: skillsUsed,
      evidence_link: clean(v.evidence_link),
      evidence_statement: clean(v.evidence_statement),
      updated_at: new Date().toISOString(),
    }
    const { error } = id ? await experiences.update(id, values) : await experiences.add(values)
    if (error) {
      setBusy(false)
      return setFailed(true)
    }
    // Skills you used appear in your Skills list, marked as backed by evidence.
    await addMissingSkills(skills, skillsUsed)
    navigate('/profile/experience')
  }

  return (
    <form onSubmit={submit} noValidate>
      {!id && (
        <p className="mt-4 rounded-2xl bg-sage p-4">Prefer guided questions? <button type="button" onClick={openBuilder} className="font-semibold underline">Open the Experience-to-Evidence builder</button>. What you’ve typed here comes with you.</p>
      )}
      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <span className="text-sm font-semibold uppercase tracking-wider text-muted">Type</span>
        <p className="mt-1">
          {experienceTypes.map((t) => (
            <button key={t.value} type="button" onClick={() => setV({ ...v, type: t.value })} className={`mb-1.5 mr-1.5 min-h-10 rounded-full border px-4 py-2 ${v.type === t.value ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>{t.label}</button>
          ))}
        </p>
        <TextField label="Title" id="title" value={v.title} onChange={set('title')} error={errors.title} placeholder="e.g. Student Result Management System" />
        <TextField label="Organisation, school or team" id="organisation" optional value={v.organisation} onChange={set('organisation')} />
        <TextField label="Your role" id="role" optional value={v.role} onChange={set('role')} placeholder="e.g. Frontend developer / project contributor" />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField label="Start (month and year)" id="start_date" optional value={v.start_date} onChange={set('start_date')} placeholder="e.g. Jan 2025" />
          <TextField label="End (month and year)" id="end_date" optional value={v.is_current ? '' : v.end_date} onChange={set('end_date')} disabled={v.is_current} error={errors.end_date} placeholder="e.g. Jun 2025" />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={v.is_current} onChange={(e) => setV({ ...v, is_current: e.target.checked })} /> I still do this</label>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">What happened</h2>
        <TextArea label="What problem or situation was it?" id="situation" optional value={v.situation} onChange={set('situation')} />
        <TextArea label="What were you responsible for?" id="responsibilities" optional value={v.responsibilities} onChange={set('responsibilities')} placeholder="Describe the situation and your part in your own words..." />
        <TextArea label="What did you achieve or change?" id="achievements" optional value={v.achievements} onChange={set('achievements')} placeholder="A result you saw. Numbers are optional, never guessed." />
        <TextField label="Tools or skills used" id="skills_text" optional value={v.skills_text} onChange={set('skills_text')} placeholder="e.g. React, JavaScript, localStorage" hint="Separate them with commas. They’ll be added to your Skills. They count as backed once this experience has an evidence statement." />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Supporting evidence</h2>
        <p className="text-sm text-muted">Optional. Something that shows the work is real.</p>
        <TextField label="Link" id="evidence_link" optional value={v.evidence_link} onChange={set('evidence_link')} error={errors.evidence_link} placeholder="https://github.com/..." hint="File uploads come in a later stage." />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Evidence statement</h2>
        <p className="text-sm text-muted">One or two sentences that say what you did. You write it, or start from your own answers above, and you edit every word.</p>
        <TextArea label="Your statement" id="evidence_statement" optional rows={4} value={v.evidence_statement} onChange={set('evidence_statement')} error={errors.evidence_statement} hint={`${v.evidence_statement.length} of 600 characters. Only say what is true.`} />
        <button type="button" onClick={startingPoint} className="btn-sm mt-2">Use my answers above as a starting point</button>
        {hint && <p role="status" className="mt-1 text-sm text-muted">{hint}</p>}
      </div>

      {failed && <Alert tone="error"><b>We couldn’t save that.</b> Everything you typed is still here. Please try again.</Alert>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save experience'}</Button>
        <Button to="/profile/experience" variant="outline">Cancel</Button>
      </div>
    </form>
  )
}

export default function ExperienceForm() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const experiences = useTable('experiences', 'created_at')
  const skills = useTable('skills', 'created_at')
  const row = id ? experiences.rows.find((r) => r.id === id) : null
  const ready = !experiences.loading && !skills.loading

  return (
    <div>
      <Seo title={`${id ? 'Edit' : 'Add'} experience | Pathora`} description="Add or edit a project or experience." path="/profile/experience/edit" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Projects and experience</p>
      <h1 className="mt-1 text-3xl font-bold">{id ? 'Edit your experience' : 'Tell us what you did'}</h1>
      <p className="mt-1 text-muted">Use your own words. Leave out anything you don’t remember.</p>
      {!ready ? <p role="status" className="mt-6 text-muted">Loading…</p> : id && !row ? (
        <Alert tone="error">We couldn’t find that experience. <Link className="underline" to="/profile/experience">Back to your experience</Link></Alert>
      ) : (
        <Form
          key={id || 'new'}
          id={id}
          experiences={experiences}
          skills={skills}
          initial={row ? { ...blank, ...row, organisation: row.organisation || '', role: row.role || '', start_date: row.start_date || '', end_date: row.end_date || '', situation: row.situation || '', responsibilities: row.responsibilities || '', achievements: row.achievements || '', skills_text: (row.skills_used || []).join(', '), evidence_link: row.evidence_link || '', evidence_statement: row.evidence_statement || '' } : blank}
        />
      )}
    </div>
  )
}
