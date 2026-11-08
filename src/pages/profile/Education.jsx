import { useState } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { SelectField, TextArea, TextField } from '../../components/TextField'
import { useTable } from '../../data/useTable'
import { qualifications } from '../../data/constants'
import { endBeforeStart } from '../../lib/dates'

const blank = { institution: '', qualification: 'Choose one', course: '', start_date: '', end_date: '', still_studying: false, grade: '', notes: '' }

function EducationForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setFailed(false)
    const next = {}
    if (!v.institution.trim()) next.institution = 'Please enter the school or institution.'
    if (!v.still_studying && endBeforeStart(v.start_date, v.end_date)) next.end_date = 'The end date can’t be before the start date.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const clean = (s) => s.trim() || null
    const { error } = await onSave({
      institution: v.institution.trim(),
      qualification: v.qualification === 'Choose one' ? null : v.qualification,
      course: clean(v.course),
      start_date: clean(v.start_date),
      end_date: v.still_studying ? null : clean(v.end_date),
      still_studying: v.still_studying,
      grade: clean(v.grade),
      notes: clean(v.notes),
    })
    setBusy(false)
    if (error) setFailed(true)
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 rounded-2xl border border-line bg-white p-5">
      <h2 className="text-lg font-bold">{initial.id ? 'Edit education' : 'Add a school or course'}</h2>
      <TextField label="Institution" id="institution" value={v.institution} onChange={set('institution')} error={errors.institution} placeholder="e.g. Sample University" />
      <SelectField label="Qualification" id="qualification" options={['Choose one', ...qualifications]} value={v.qualification} onChange={set('qualification')} />
      <TextField label="Course of study" id="course" optional value={v.course} onChange={set('course')} placeholder="e.g. Computer Science" />
      <div className="grid gap-x-4 sm:grid-cols-2">
        <TextField label="Start (month and year)" id="start_date" optional value={v.start_date} onChange={set('start_date')} placeholder="e.g. Oct 2022" />
        <TextField label="End (month and year)" id="end_date" optional value={v.still_studying ? '' : v.end_date} onChange={set('end_date')} disabled={v.still_studying} error={errors.end_date} placeholder="e.g. Jul 2026" />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5" checked={v.still_studying} onChange={(e) => setV({ ...v, still_studying: e.target.checked })} /> I’m still studying here
      </label>
      <TextField label="Grade or class" id="grade" optional value={v.grade} onChange={set('grade')} hint="Only add what you have actually received or been told." />
      <TextArea label="Relevant coursework or achievements" id="notes" optional rows={2} value={v.notes} onChange={set('notes')} />
      {failed && <Alert tone="error"><b>We couldn’t save that.</b> Please try again.</Alert>}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save education'}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Education() {
  const { rows, loading, error, add, update, remove } = useTable('education', 'created_at')
  const [editing, setEditing] = useState(null) // null | 'new' | a row
  const [confirm, setConfirm] = useState(null)
  const [notice, setNotice] = useState('')
  const [removeFailed, setRemoveFailed] = useState(false)

  const save = async (values) => {
    const res = editing === 'new' ? await add(values) : await update(editing.id, values)
    if (!res.error) {
      setEditing(null)
      setNotice('Changes saved.')
    }
    return res
  }
  async function doRemove(id) {
    const { error: err } = await remove(id)
    setRemoveFailed(Boolean(err))
    if (!err) { setConfirm(null); setNotice('Education removed.') }
  }

  return (
    <div>
      <Seo title="Education | Pathora" description="Your education." path="/profile/education" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Career Profile</p>
      <h1 className="mt-1 text-3xl font-bold">Education</h1>
      <p className="mt-1 text-muted">Add schools, colleges or courses.</p>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert>{notice}</Alert>}

      {loading ? <p role="status" className="mt-6 text-muted">Loading…</p> : rows.length === 0 && !editing ? (
        <div className="mt-4 rounded-2xl bg-sage p-5">
          <b>Add where you studied</b>
          <p className="text-muted">Your CV and job analysis use this. Start with your latest.</p>
          <Button className="mt-3" onClick={() => setEditing('new')}>+ Add education</Button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          {rows.map((r, i) => (
            <div key={r.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
              <span>
                <b>{[r.qualification, r.course].filter(Boolean).join(', ') || r.institution}</b><br />
                <span className="text-muted">{r.institution} · {[r.start_date, r.still_studying ? 'now' : r.end_date].filter(Boolean).join(' to ') || 'dates not added'}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" className="btn-sm" onClick={() => { setNotice(''); setEditing(r) }}>Edit</button>
                <button type="button" className="btn-sm btn-sm-danger" onClick={() => setConfirm(r.id)}>Remove</button>
              </span>
              {confirm === r.id && (
                <div className="w-full">
                  <Alert tone="error"><b>Remove this education entry?</b> This can’t be undone.</Alert>
                  {removeFailed && <Alert tone="error">We couldn’t remove it. Please try again.</Alert>}
                  <div className="mt-2 flex gap-3">
                    <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
                    <Button className="bg-danger! hover:opacity-90" onClick={() => doRemove(r.id)}>Yes, remove</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!editing && <Button variant="outline" className="mt-3" onClick={() => { setNotice(''); setEditing('new') }}>+ Add education</Button>}
        </div>
      )}

      {editing && (
        <EducationForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? blank : { ...blank, ...editing, qualification: editing.qualification || 'Choose one', course: editing.course || '', start_date: editing.start_date || '', end_date: editing.end_date || '', grade: editing.grade || '', notes: editing.notes || '' }}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
