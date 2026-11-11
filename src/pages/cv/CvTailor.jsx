import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import CvPaper from '../../components/CvPaper'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { SelectField, TextField } from '../../components/TextField'
import { analyseJob } from '../../analyser/analyse'
import { tailorSuggestions } from '../../cv/tailor'
import { useTable } from '../../data/useTable'

function Tailor({ cv, jobs, evidence, cvs, versions }) {
  const navigate = useNavigate()
  const [jobId, setJobId] = useState(jobs[0]?.id || '')
  const [off, setOff] = useState(() => new Set()) // suggestions switched off
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const job = jobs.find((j) => j.id === jobId)

  const analysis = useMemo(() => (job ? analyseJob(job.job_text, evidence) : null), [job, evidence])
  const { suggestions, gaps } = useMemo(
    () => (analysis ? tailorSuggestions(cv.content, analysis, evidence.experiences) : { suggestions: [], gaps: [] }),
    [analysis, cv.content, evidence.experiences],
  )
  const tailored = useMemo(
    () => suggestions.filter((s) => !off.has(s.id)).reduce((c, s) => s.apply(c), cv.content),
    [suggestions, off, cv.content],
  )
  const title = name.trim() || (job ? `${job.title} (tailored)`.slice(0, 100) : '')

  async function save() {
    setError('')
    setBusy(true)
    const { data, error: err } = await cvs.add({ title, content: tailored, job_analysis_id: job.id, based_on_cv_id: cv.id })
    if (err) { setBusy(false); return setError('We couldn’t save that. Your choices are still here. Please try again.') }
    await versions.add({ cv_id: data.id, version_number: 1, note: `Tailored for ${job.title}`, content: tailored })
    navigate(`/cv-studio/edit?id=${data.id}`)
  }

  if (jobs.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-sage p-5">
        <b>Tailoring needs a job to compare with.</b>
        <p className="text-muted">Analyse a job first. It takes a minute.</p>
        <Button to="/analyse" className="mt-3">Analyse a job</Button>
      </div>
    )
  }

  return (
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-white p-5">
          <SelectField label="Which job?" id="job" options={jobs.map((j) => ({ value: j.id, label: j.title }))} value={jobId} onChange={(e) => { setJobId(e.target.value); setOff(new Set()) }} className="mt-0" />
          <p className="mt-1 text-sm text-muted">Not listed? <Link to="/analyse" className="underline">Analyse a job first</Link>.</p>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold">Suggested changes</h2>
          <p className="text-sm text-muted">Each suggestion only changes the order or emphasis of what is already in your CV. Untick any you don’t want.</p>
          {suggestions.length === 0 ? (
            <p className="mt-3 rounded-xl bg-sage p-3">Your CV already puts the most relevant things first for this job.</p>
          ) : suggestions.map((s) => (
            <label key={s.id} className="mt-3 flex items-start gap-3 border-t border-line pt-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={!off.has(s.id)} onChange={(e) => { const n = new Set(off); if (e.target.checked) n.delete(s.id); else n.add(s.id); setOff(n) }} />
              <span><b>{s.title}</b> <Pill tone="add">Suggestion</Pill><br /><span className="text-sm text-muted">{s.detail}</span></span>
            </label>
          ))}
          <p className="mt-3 text-xs text-muted">Pathora can’t reword your sentences or add anything you haven’t written. Wording help comes later, and you will always approve it.</p>
        </section>

        {gaps.length > 0 && (
          <section className="rounded-2xl bg-sage p-5">
            <h2 className="text-lg font-bold">What stays as it is</h2>
            <p className="text-sm text-muted">These requirements don’t have evidence in your profile yet, so they won’t appear in your CV. That doesn’t mean you can’t do them.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{gaps.slice(0, 6).map((g) => <li key={g.id}>{g.text}</li>)}</ul>
            <Link to="/evidence" className="btn-sm mt-3">Build evidence first →</Link>
          </section>
        )}

        <section className="rounded-2xl border border-line bg-white p-5">
          <TextField label="Name this CV" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={title} className="mt-0" />
          {error && <Alert tone="error">{error}</Alert>}
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save as a new CV'}</Button>
            <Button to="/cv-studio" variant="outline">Cancel</Button>
          </div>
          <p className="mt-2 text-sm text-muted">Your original “{cv.title}” isn’t changed. This creates a separate CV.</p>
        </section>
      </div>

      <div className="lg:sticky lg:top-4">
        <p className="mb-2 text-center text-sm text-muted"><Pill tone="ok">Preview</Pill> The tailored CV, with your choices applied.</p>
        <CvPaper content={tailored} />
      </div>
    </div>
  )
}

export default function CvTailor() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const cvs = useTable('cvs', 'updated_at')
  const versions = useTable('cv_versions')
  const jobs = useTable('job_analyses')
  const education = useTable('education')
  const skills = useTable('skills')
  const experiences = useTable('experiences')
  const loading = [cvs, versions, jobs, education, skills, experiences].some((t) => t.loading)
  const cv = cvs.rows.find((c) => c.id === id)
  const evidence = useMemo(() => ({ education: education.rows, skills: skills.rows, experiences: experiences.rows }), [education.rows, skills.rows, experiences.rows])

  return (
    <div>
      <Seo title="Tailor your CV | Pathora" description="Tailor a copy of your CV to a job." path="/cv-studio/tailor" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">CV Studio</p>
      <h1 className="mt-1 text-3xl font-bold">Tailor your CV to a job</h1>
      <p className="mt-1 text-muted">Pathora can reorder and highlight what you already have. It can’t add skills or experience you don’t have.</p>
      {loading ? <p role="status" className="mt-4 text-muted">Loading…</p> : !cv ? (
        <Alert tone="error">Choose a CV to tailor from <Link className="underline" to="/cv-studio">CV Studio</Link>.</Alert>
      ) : <Tailor key={cv.id} cv={cv} jobs={jobs.rows} evidence={evidence} cvs={cvs} versions={versions} />}
    </div>
  )
}
