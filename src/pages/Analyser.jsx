import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Pill from '../components/Pill'
import Seo from '../components/Seo'
import { TextArea, TextField } from '../components/TextField'
import { analyseJob, looksLikeLink } from '../analyser/analyse'
import { useTable } from '../data/useTable'

const statusUi = {
  backed: { tone: 'ok', label: 'Backed by evidence' },
  added: { tone: 'add', label: 'Added by you' },
  needs: { tone: 'need', label: 'Needs evidence' },
}

function Results({ analysis, evidence, onRemove }) {
  const [confirm, setConfirm] = useState(false)
  const result = useMemo(() => analyseJob(analysis.job_text, evidence), [analysis.job_text, evidence])
  const { counts } = result

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Job analysis</p>
      <h1 className="mt-1 text-3xl font-bold">{analysis.title}</h1>
      <p className="mt-1 text-muted">Saved {new Date(analysis.created_at).toLocaleDateString()}. Compared with your evidence as it is today.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-sage p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">In plain English</p>
            <h2 className="text-xl font-bold">What you’d actually do</h2>
            {result.responsibilities.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">{result.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            ) : <p className="mt-2 text-muted">We couldn’t find a list of tasks in this text.</p>}
            <p className="mt-2 text-sm text-muted">Taken directly from the job description.</p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-bold">What the employer is looking for</h2>
            <p className="text-sm text-muted">Each requirement is compared with the evidence you’ve saved.</p>
            {result.inferred && <Alert>We couldn’t find a clear requirements section, so these are lines that mention skills.</Alert>}
            {result.requirements.length === 0 && <Alert tone="error">We couldn’t find any requirements in this text. Check that you pasted the whole job description.</Alert>}
            {result.requirements.map((r) => (
              <div key={r.id} className="mt-3 border-t border-line pt-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">{r.level === 'essential' ? 'Essential' : 'Preferred'}</span><br />
                    <b>{r.text}</b>
                  </span>
                  <Pill tone={statusUi[r.status].tone}>{statusUi[r.status].label}</Pill>
                </div>
                <p className="mt-1 text-sm text-muted">{r.reason}</p>
                {r.status !== 'backed' && <Link to="/evidence" className="btn-sm mt-2">Build evidence →</Link>}
              </div>
            ))}
          </section>

          {result.terms.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-xl font-bold">Terms in plain English</h2>
              {result.terms.map((t) => <p key={t.term} className="mt-2"><b className="capitalize">{t.term}:</b> <span className="text-muted">{t.meaning}</span></p>)}
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your current evidence</p>
            <h2 className="text-xl font-bold">A starting point, not a verdict</h2>
            <p className="mt-2"><b>{counts.backed} of {counts.total} requirements have evidence</b></p>
            <p className="text-sm text-muted">{counts.essentialBacked} of {counts.essentialTotal} essential ones. This counts only what you’ve saved. It doesn’t judge whether you can do the job.</p>
          </section>
          <section className="rounded-2xl bg-forest p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#cfe0d6]">Your next best step</p>
            <h2 className="text-xl font-bold">Build evidence before tailoring your CV</h2>
            <p className="mt-1 text-[#cfe0d6]">Use project, SIWES or coursework examples to answer gaps honestly.</p>
            <Button to="/evidence" variant="outline" className="mt-3">Open evidence builder →</Button>
          </section>
          {result.prepare.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg font-bold">What to prepare</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{result.prepare.map((p) => <li key={p}>{p}</li>)}</ul>
            </section>
          )}
        </aside>
      </div>

      <p className="mt-4 rounded-2xl bg-sage p-4 text-sm"><b>A note on fit.</b> Pathora only compares what you’ve saved. It won’t invent experience, guarantee an interview, or claim to know private screening rules.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button to="/analyse">Analyse another job</Button>
        <Button variant="outline" onClick={() => setConfirm(true)}>Remove this analysis</Button>
      </div>
      {confirm && (
        <div>
          <Alert tone="error"><b>Remove this analysis?</b> The pasted text is deleted. This can’t be undone.</Alert>
          <div className="mt-2 flex gap-3">
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep it</Button>
            <Button className="bg-danger! hover:opacity-90" onClick={onRemove}>Yes, remove</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function InputForm({ analyses }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return setError('Paste a job description above to begin.')
    if (looksLikeLink(t)) return setError('We can’t read links yet. Open the vacancy, copy its text, and paste the text here. Nothing was guessed.')
    if (t.length < 150) return setError('That’s very short. Paste the whole job description for a useful analysis.')
    if (t.length > 20000) return setError('That’s too long. Paste just the job description (up to 20,000 characters).')
    setError('')
    setBusy(true)
    const guess = (t.split(/\r?\n/).find((l) => l.trim()) || 'Untitled role').trim().slice(0, 100)
    const { data, error: err } = await analyses.add({ title: title.trim() || guess, job_text: t })
    setBusy(false)
    if (err) return setError('We couldn’t save that. Your text is still here. Please try again.')
    navigate(`/analyse?id=${data.id}`)
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Job analysis</p>
      <h1 className="mt-1 text-3xl font-bold">Understand the job before you apply.</h1>
      <p className="mt-1 text-muted">See what the employer is asking for, what you can already evidence, and what to do next.</p>
      <form onSubmit={submit} noValidate className="mt-4 rounded-2xl border border-line bg-white p-5">
        <TextField label="Job title" id="title" optional value={title} onChange={(e) => setTitle(e.target.value)} placeholder="We’ll use the first line if you leave this blank" className="mt-0" />
        <TextArea label="Job description" id="jd" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the job description here..." error={error} hint="Paste the text, not a link. It’s analysed in your browser and saved in your account so you can reopen it. Nothing is sent to an AI service." />
        <Button type="submit" disabled={busy} className="mt-4">{busy ? 'Reading the job…' : 'Analyse this job →'}</Button>
      </form>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Your analysed jobs</h2>
        {analyses.loading ? <p role="status" className="mt-2 text-muted">Loading…</p> : analyses.rows.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-sage p-4 text-muted">Nothing here yet. Your analysed jobs will appear here.</p>
        ) : (
          <div className="mt-2 rounded-2xl border border-line bg-white p-5">
            {analyses.rows.map((a, i) => (
              <div key={a.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
                <span><b>{a.title}</b><br /><span className="text-sm text-muted">{new Date(a.created_at).toLocaleDateString()}</span></span>
                <Link to={`/analyse?id=${a.id}`} className="btn-sm">Open</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function Analyser() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const navigate = useNavigate()
  const analyses = useTable('job_analyses')
  const education = useTable('education')
  const skills = useTable('skills')
  const experiences = useTable('experiences')
  const ready = !analyses.loading && !education.loading && !skills.loading && !experiences.loading
  const analysis = id ? analyses.rows.find((a) => a.id === id) : null
  const evidence = useMemo(() => ({ education: education.rows, skills: skills.rows, experiences: experiences.rows }), [education.rows, skills.rows, experiences.rows])

  return (
    <div>
      <Seo title="Job Analyser | Pathora" description="Understand a job description." path="/analyse" noindex />
      {analyses.error && <Alert tone="error">{analyses.error}</Alert>}
      {!id ? <InputForm analyses={analyses} /> : !ready ? <p role="status" className="text-muted">Loading…</p> : !analysis ? (
        <Alert tone="error">We couldn’t find that analysis. <Link className="underline" to="/analyse">Back to the Job Analyser</Link></Alert>
      ) : (
        <Results analysis={analysis} evidence={evidence} onRemove={async () => { await analyses.remove(analysis.id); navigate('/analyse') }} />
      )}
    </div>
  )
}
