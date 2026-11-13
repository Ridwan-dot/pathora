import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { SelectField, TextArea, TextField } from '../../components/TextField'
import ManualNote from '../../tracker/ManualNote'
import { useTable } from '../../data/useTable'
import { STATUSES, daysFrom, niceDate, nowISO, todayISO } from '../../tracker/attention'

const blank = { company: '', role: '', source: '', status: 'Saved', applied_on: '', deadline: '', next_action: '', next_action_due: '', next_action_detail: '', notes: '', cv_id: '', job_analysis_id: '' }
const none = [{ value: '', label: 'None' }]

function Form({ initial, id, apps, events, cvs, jobs }) {
  const navigate = useNavigate()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const deadlinePassed = v.deadline && daysFrom(todayISO(), v.deadline) < 0

  async function submit(e) {
    e.preventDefault()
    setFailed(false)
    const next = {}
    if (!v.company.trim()) next.company = 'Please enter the company.'
    if (!v.role.trim()) next.role = 'Please enter the role.'
    if (v.applied_on && v.next_action_due && v.next_action_due < v.applied_on) next.next_action_due = `The next action’s due date is before you applied (${niceDate(v.applied_on)}).`
    if (v.source.length > 300) next.source = 'Keep this under 300 characters.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const clean = (s) => (s || '').trim() || null
    const values = {
      company: v.company.trim(), role: v.role.trim(), source: clean(v.source), status: v.status,
      applied_on: v.applied_on || null, deadline: v.deadline || null,
      next_action: clean(v.next_action), next_action_due: v.next_action_due || null, next_action_detail: clean(v.next_action_detail),
      notes: clean(v.notes), cv_id: v.cv_id || null, job_analysis_id: v.job_analysis_id || null,
      updated_at: nowISO(),
    }
    const res = id ? await apps.update(id, values) : await apps.add(values)
    if (res.error) { setBusy(false); return setFailed(true) }
    const appId = id || res.data.id
    if (!id) await events.add({ application_id: appId, kind: 'created', text: 'You added this application.' })
    else {
      if (initial.status !== v.status) await events.add({ application_id: appId, kind: 'status', text: `You changed the status from ${initial.status} to ${v.status}.` })
      if (initial.next_action !== v.next_action || initial.next_action_due !== v.next_action_due) {
        await events.add({ application_id: appId, kind: 'next_action', text: values.next_action ? `You set a next action: ${values.next_action}${values.next_action_due ? ` (due ${niceDate(values.next_action_due)})` : ''}.` : 'You cleared the next action.' })
      }
      if (initial.status === v.status && initial.next_action === v.next_action && initial.next_action_due === v.next_action_due) await events.add({ application_id: appId, kind: 'edited', text: 'You edited the details.' })
    }
    navigate(`/applications/details?id=${appId}`)
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">The role</h2>
        <TextField label="Company" id="company" value={v.company} onChange={set('company')} error={errors.company} placeholder="e.g. Example Co." />
        <TextField label="Role" id="role" value={v.role} onChange={set('role')} error={errors.role} placeholder="e.g. Junior Business Analyst" />
        <TextField label="Where did you find it?" id="source" optional value={v.source} onChange={set('source')} error={errors.source} placeholder="A link, or the name of the site" />
        <SelectField label="Status" id="status" options={STATUSES} value={v.status} onChange={set('status')} />
        <div className="mt-1"><ManualNote /></div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Dates</h2>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField label="Date applied" id="applied_on" type="date" optional value={v.applied_on} onChange={set('applied_on')} />
          <TextField label="Deadline" id="deadline" type="date" optional value={v.deadline} onChange={set('deadline')} />
        </div>
        {deadlinePassed && <Alert><b>This deadline has passed.</b> You can still save it for your records.</Alert>}
        <p className="mt-2 text-sm text-muted">Dates and next actions show on your dashboard when they’re due or overdue. Email reminders aren’t part of the first version.</p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Next action</h2>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField label="What will you do next?" id="next_action" optional value={v.next_action} onChange={set('next_action')} placeholder="e.g. Send a follow-up email" />
          <TextField label="Due date" id="next_action_due" type="date" optional value={v.next_action_due} onChange={set('next_action_due')} error={errors.next_action_due} />
        </div>
        <TextArea label="More detail" id="next_action_detail" optional rows={2} value={v.next_action_detail} onChange={set('next_action_detail')} />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Link your work <span className="text-sm font-normal text-muted">(optional)</span></h2>
        <p className="text-sm text-muted">You can add an application without a CV or job analysis. Link them later if you like.</p>
        <SelectField label="CV used" id="cv_id" options={[...none, ...cvs.map((c) => ({ value: c.id, label: c.title }))]} value={v.cv_id} onChange={set('cv_id')} />
        <SelectField label="Job analysis" id="job_analysis_id" options={[...none, ...jobs.map((j) => ({ value: j.id, label: j.title }))]} value={v.job_analysis_id} onChange={set('job_analysis_id')} />
        <TextArea label="Notes" id="notes" optional rows={3} value={v.notes} onChange={set('notes')} />
      </div>

      {failed && <Alert tone="error"><b>We couldn’t save that.</b> Everything you typed is still here. Please try again.</Alert>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save application'}</Button>
        <Button to={id ? `/applications/details?id=${id}` : '/applications'} variant="outline">Cancel</Button>
      </div>
    </form>
  )
}

export default function ApplicationForm() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const fromJob = params.get('job')
  const apps = useTable('applications', 'updated_at')
  const events = useTable('application_events')
  const cvs = useTable('cvs', 'updated_at')
  const jobs = useTable('job_analyses')
  const loading = [apps, events, cvs, jobs].some((t) => t.loading)
  const row = id ? apps.rows.find((a) => a.id === id) : null
  const job = fromJob ? jobs.rows.find((j) => j.id === fromJob) : null
  const s = (x) => x || ''
  const initial = row
    ? { company: row.company, role: row.role, source: s(row.source), status: row.status, applied_on: s(row.applied_on), deadline: s(row.deadline), next_action: s(row.next_action), next_action_due: s(row.next_action_due), next_action_detail: s(row.next_action_detail), notes: s(row.notes), cv_id: s(row.cv_id), job_analysis_id: s(row.job_analysis_id) }
    : { ...blank, role: job ? job.title : '', job_analysis_id: job ? job.id : '' }

  return (
    <div>
      <Seo title={`${id ? 'Edit' : 'Add'} application | Pathora`} description="Add or edit an application." path="/applications/edit" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">My applications</p>
      <h1 className="mt-1 text-3xl font-bold">{id ? 'Edit application' : 'Add an application'}</h1>
      <p className="mt-1 text-muted">Only company and role are needed. Add the rest whenever you like.</p>
      {loading ? <p role="status" className="mt-4 text-muted">Loading…</p> : id && !row ? (
        <Alert tone="error">We couldn’t find that application. <Link className="underline" to="/applications">Back to My applications</Link></Alert>
      ) : <Form key={id || fromJob || 'new'} id={id} initial={initial} apps={apps} events={events} cvs={cvs.rows} jobs={jobs.rows} />}
    </div>
  )
}
