import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { SelectField } from '../../components/TextField'
import ManualNote from '../../tracker/ManualNote'
import { useTable } from '../../data/useTable'
import { STATUSES, attentionFor, niceDate, nowISO, statusTone, todayISO } from '../../tracker/attention'
import { isWebAddress } from '../../lib/dates'

function Details({ app, apps, events, cvs, jobs }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState(app.status)
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState(null)
  const today = todayISO()
  const history = events.rows.filter((e) => e.application_id === app.id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  const cv = cvs.find((c) => c.id === app.cv_id)
  const job = jobs.find((j) => j.id === app.job_analysis_id)
  const flags = attentionFor(app, today)

  async function updateStatus() {
    const from = app.status // remember the old status before anything changes
    if (status === from) return setMsg({ tone: 'success', text: 'That’s already the current status.' })
    const patch = { status, updated_at: nowISO() }
    if (status === 'Applied' && !app.applied_on) patch.applied_on = today
    const { error } = await apps.update(app.id, patch)
    if (error) return setMsg({ tone: 'error', text: 'We couldn’t change the status. Please try again.' })
    await events.add({ application_id: app.id, kind: 'status', text: `You changed the status from ${from} to ${status}.` })
    setMsg({ tone: 'success', text: `Moved to ${status}.` })
  }

  async function markDone() {
    const { error } = await apps.update(app.id, { next_action: null, next_action_due: null, next_action_detail: null, updated_at: nowISO() })
    if (error) return setMsg({ tone: 'error', text: 'We couldn’t update that. Please try again.' })
    await events.add({ application_id: app.id, kind: 'next_action', text: `You marked the next action done: ${app.next_action}.` })
    setMsg({ tone: 'success', text: 'Next action marked done.' })
  }

  async function remove() {
    const { error } = await apps.remove(app.id)
    if (error) return setMsg({ tone: 'error', text: 'We couldn’t delete it. Please try again.' })
    navigate('/applications')
  }

  return (
    <div>
      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-muted">{app.company}</p><h1 className="text-3xl font-bold">{app.role}</h1></div>
          <Pill tone={statusTone[app.status]}>{app.status}</Pill>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div><span className="text-xs font-semibold uppercase tracking-wider text-muted">Applied</span><br />{niceDate(app.applied_on) || 'Not set'}</div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-muted">Deadline</span><br />{niceDate(app.deadline) || 'None set'}</div>
          <div><span className="text-xs font-semibold uppercase tracking-wider text-muted">Next action due</span><br />{niceDate(app.next_action_due) || 'None set'}</div>
        </div>
        {flags.length > 0 && <Alert tone="error"><b>Needs attention:</b> {flags.map((f) => f.text).join(', ')}.</Alert>}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-44 flex-1"><SelectField label="Update status" id="status" options={STATUSES} value={status} onChange={(e) => setStatus(e.target.value)} className="mt-0" /></div>
          <Button onClick={updateStatus}>Update</Button>
        </div>
        <div className="mt-2"><ManualNote /></div>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        {app.status === 'Not selected' && <Alert><b>That’s disappointing, and it’s very common.</b> Keep it for reference, then try the next role. <Link className="underline" to="/interview-practice">Practise for the next one</Link></Alert>}
        {app.status === 'Offer' && <Alert><b>Congratulations.</b> Read the offer carefully and take your time to decide.</Alert>}
      </section>

      <section className="mt-4 rounded-2xl bg-sage p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Next action</p>
        {app.next_action ? (
          <>
            <p className="mt-1"><b>{app.next_action}</b>{app.next_action_due ? <><br /><span className="text-muted">Due {niceDate(app.next_action_due)}</span></> : null}</p>
            {app.next_action_detail && <p className="text-muted">{app.next_action_detail}</p>}
            <div className="mt-2 flex gap-2"><Button onClick={markDone}>Mark done</Button><Button to={`/applications/edit?id=${app.id}`} variant="outline">Edit</Button></div>
          </>
        ) : <p className="mt-1 text-muted">No next action. <Link className="font-semibold underline" to={`/applications/edit?id=${app.id}`}>Add one</Link></p>}
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Linked</h2>
        <p className="mt-2">CV used: {cv ? <Link className="font-semibold underline" to={`/cv-studio/edit?id=${cv.id}`}>{cv.title}</Link> : <span className="text-muted">Not linked. <Link className="underline" to={`/applications/edit?id=${app.id}`}>Link a CV</Link></span>}</p>
        <p className="mt-1">Job analysis: {job ? <Link className="font-semibold underline" to={`/analyse?id=${job.id}`}>{job.title}</Link> : <span className="text-muted">Not linked. <Link className="underline" to="/analyse">Analyse this job</Link></span>}</p>
        <p className="mt-1">Source: {app.source ? (isWebAddress(app.source) ? <a className="font-semibold underline" href={app.source} target="_blank" rel="noopener noreferrer">{app.source}</a> : app.source) : <span className="text-muted">Not added</span>}</p>
        <p className="mt-1"><Link className="font-semibold underline" to="/interview-practice">Practise questions for this role →</Link></p>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Your updates</h2>
        <p className="text-sm text-muted">Only changes you make are recorded here. Nothing comes from the employer.</p>
        <ul className="mt-2 border-l-2 border-[#b9cdbf] pl-4">
          {history.map((h) => <li key={h.id} className="mb-2"><b>{niceDate(String(h.created_at).slice(0, 10))}</b> {h.text}</li>)}
          {history.length === 0 && <li className="text-muted">No updates recorded yet.</li>}
        </ul>
      </section>

      {app.notes && <section className="mt-4 rounded-2xl border border-line bg-white p-5"><h2 className="text-lg font-bold">Notes</h2><p className="mt-1 whitespace-pre-wrap text-muted">{app.notes}</p></section>}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button to={`/applications/edit?id=${app.id}`} variant="outline">Edit application</Button>
        <button type="button" className="btn-sm btn-sm-danger" onClick={() => setConfirm(true)}>Delete</button>
      </div>
      {confirm && (
        <div>
          <Alert tone="error"><b>Delete this application?</b> Its notes and updates go too. This can’t be undone. Not ready? Mark it Withdrawn or Not selected instead and keep the record.</Alert>
          <div className="mt-2 flex gap-3"><Button variant="outline" onClick={() => setConfirm(false)}>Keep it</Button><Button className="bg-danger! hover:opacity-90" onClick={remove}>Yes, delete</Button></div>
        </div>
      )}
    </div>
  )
}

export default function ApplicationDetails() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const apps = useTable('applications', 'updated_at')
  const events = useTable('application_events')
  const cvs = useTable('cvs', 'updated_at')
  const jobs = useTable('job_analyses')
  const loading = [apps, events, cvs, jobs].some((t) => t.loading)
  const app = apps.rows.find((a) => a.id === id)
  return (
    <div>
      <Seo title="Application | Pathora" description="Application details." path="/applications/details" noindex />
      {loading ? <p role="status" className="text-muted">Loading…</p> : !app ? (
        <Alert tone="error">We couldn’t find that application. <Link className="underline" to="/applications">Back to My applications</Link></Alert>
      ) : <Details key={app.id} app={app} apps={apps} events={events} cvs={cvs.rows} jobs={jobs.rows} />}
    </div>
  )
}
