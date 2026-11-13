import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import ManualNote from '../../tracker/ManualNote'
import Seo from '../../components/Seo'
import { useTable } from '../../data/useTable'
import { STATUSES, attentionList, niceDate, nowISO, todayISO } from '../../tracker/attention'

const filters = ['All', 'Saved', 'Applied', 'Interview', 'Offer', 'Closed']

export default function ApplicationsList() {
  const apps = useTable('applications', 'updated_at')
  const events = useTable('application_events')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const today = todayISO()
  const attention = attentionList(apps.rows, today)
  const level = new Map(attention.map((a) => [a.app.id, a.level]))
  const shown = apps.rows
    .filter((a) => filter === 'All' || (filter === 'Closed' ? ['Not selected', 'Withdrawn'].includes(a.status) : a.status === filter))
    .sort((a, b) => (level.get(b.id) || 0) - (level.get(a.id) || 0) || String(b.updated_at).localeCompare(String(a.updated_at)))

  async function changeStatus(app, status) {
    setError('')
    const from = app.status // remember the old status before anything changes
    const patch = { status, updated_at: nowISO() }
    if (status === 'Applied' && !app.applied_on) patch.applied_on = today
    const { error: err } = await apps.update(app.id, patch)
    if (err) return setError('We couldn’t change that status. Please try again.')
    await events.add({ application_id: app.id, kind: 'status', text: `You changed the status from ${from} to ${status}.` })
  }

  return (
    <div>
      <Seo title="My applications | Pathora" description="Your applications." path="/applications" noindex />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My applications</h2>
          <p className="text-muted">Roles you’ve saved or applied for, in one place. You update the status yourself.</p>
        </div>
        <Button to="/applications/edit">Add application</Button>
      </div>
      {apps.error && <Alert tone="error">{apps.error}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      {!apps.loading && attention.length > 0 && (
        <section className="mt-4 rounded-2xl bg-sage p-4">
          <b>Needs attention</b>
          {attention.map(({ app, items }) => (
            <div key={app.id} className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>{app.company}: {items.map((i) => i.text).join(', ')}</span>
              <Link className="font-semibold underline" to={`/applications/details?id=${app.id}`}>Open</Link>
            </div>
          ))}
          <p className="mt-2 text-xs text-muted">Shown when a next action is overdue or due within 3 days, or a saved role’s deadline is within 7 days. Closed applications are left out.</p>
        </section>
      )}
      {!apps.loading && apps.rows.length > 0 && attention.length === 0 && <Alert><b>You’re up to date.</b> No overdue actions or close deadlines.</Alert>}

      <p className="mt-4">
        {filters.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`mb-1.5 mr-1.5 min-h-10 rounded-full border px-4 py-2 ${filter === f ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>
            {f}{f === 'All' ? ` (${apps.rows.length})` : ''}
          </button>
        ))}
      </p>

      {apps.loading ? <p role="status" className="text-muted">Loading…</p> : apps.rows.length === 0 ? (
        <div className="rounded-2xl bg-sage p-5">
          <b>Your next opportunity starts here</b>
          <p className="text-muted">Save a role you’re considering, or log one you’ve already applied for.</p>
          <div className="mt-3 flex flex-wrap gap-3"><Button to="/applications/edit">Add application</Button><Button to="/analyse" variant="outline">Analyse a job first</Button></div>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-muted">Nothing under {filter} yet. {filter === 'Interview' && <Link className="font-semibold underline" to="/interview-practice">Practise interview questions</Link>}</p>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-5">
          {shown.map((a, i) => (
            <div key={a.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
              <span>
                <b>{a.role}</b> · {a.company}<br />
                <span className="text-sm text-muted">{[a.applied_on && `Applied ${niceDate(a.applied_on)}`, a.deadline && `Deadline ${niceDate(a.deadline)}`].filter(Boolean).join(' · ') || 'No dates added'}</span>
                {a.next_action && <><br /><span className="text-sm text-muted">Next: {a.next_action}{a.next_action_due ? ` · due ${niceDate(a.next_action_due)}` : ''}</span></>}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <select aria-label={`Status for ${a.role} at ${a.company}`} value={a.status} onChange={(e) => changeStatus(a, e.target.value)} className="min-h-11 rounded-full border-2 border-forest bg-white px-3 font-semibold">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Link to={`/applications/details?id=${a.id}`} className="btn-sm">Open</Link>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3"><ManualNote /></div>
    </div>
  )
}
