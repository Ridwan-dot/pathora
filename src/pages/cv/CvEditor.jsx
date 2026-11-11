import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import CvPaper from '../../components/CvPaper'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { TextArea, TextField } from '../../components/TextField'
import { useTable } from '../../data/useTable'
import { cvGaps } from '../../cv/build'

function Editor({ cv, cvs, versions }) {
  const [content, setContent] = useState(cv.content)
  const [saved, setSaved] = useState(cv.content)
  const [status, setStatus] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const dirty = JSON.stringify(content) !== JSON.stringify(saved)
  const gaps = cvGaps(content)

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const contact = (k) => (e) => setContent({ ...content, contact: { ...content.contact, [k]: e.target.value } })
  const item = (section, i, patch) => setContent({ ...content, [section]: content[section].map((x, j) => (j === i ? { ...x, ...patch } : x)) })

  async function save() {
    setBusy(true)
    const { error } = await cvs.update(cv.id, { content, updated_at: new Date().toISOString() })
    setBusy(false)
    if (error) { setStatus({ tone: 'error', text: 'We couldn’t save that. Your edits are still here. Please try again.' }); return false }
    setSaved(content)
    setStatus({ tone: 'success', text: 'Changes saved.' })
    return true
  }

  async function saveVersion() {
    if (dirty && !(await save())) return
    const mine = versions.rows.filter((v) => v.cv_id === cv.id)
    const next = Math.max(0, ...mine.map((v) => v.version_number)) + 1
    setBusy(true)
    const { error } = await versions.add({ cv_id: cv.id, version_number: next, note: note.trim() || null, content })
    setBusy(false)
    setNote('')
    setStatus(error ? { tone: 'error', text: 'We couldn’t save the version. Please try again.' } : { tone: 'success', text: `Version ${next} saved.` })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">CV Studio</p>
          <h1 className="text-3xl font-bold">{cv.title}</h1>
        </div>
        <span className="flex flex-wrap items-center gap-2">
          {dirty ? <Pill tone="need">Unsaved changes</Pill> : <Pill tone="ok">Saved</Pill>}
          <Button onClick={save} disabled={busy || !dirty}>Save changes</Button>
          <Link className="btn-sm" to={`/cv-studio/preview?id=${cv.id}`}>Preview and export</Link>
        </span>
      </div>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      {gaps.length > 0 && <p className="mt-3 rounded-xl bg-need p-3 text-sm text-need-text"><b>{gaps.length} thing{gaps.length > 1 ? 's' : ''} to fix before you can export:</b> {gaps.join('; ')}.</p>}
      <p className="mt-2 text-sm"><a href="#cv-preview" className="font-semibold underline">Jump to preview ↓</a></p>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Contact</h2>
            <p className="text-sm text-muted">Changes here affect this CV only. <Link to="/profile/personal" className="underline">Edit your profile</Link> to change it everywhere.</p>
            <TextField label="Full name" id="c-name" value={content.contact.name} onChange={contact('name')} />
            <TextField label="Email" id="c-email" value={content.contact.email} onChange={contact('email')} />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <TextField label="Phone" id="c-phone" optional value={content.contact.phone} onChange={contact('phone')} />
              <TextField label="Location" id="c-loc" optional value={content.contact.location} onChange={contact('location')} />
            </div>
            <TextField label="Link" id="c-link" optional value={content.contact.link} onChange={contact('link')} />
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Summary</h2>
            <TextArea label="Summary" id="c-summary" rows={4} optional value={content.summary} onChange={(e) => setContent({ ...content, summary: e.target.value })} hint={`${content.summary.length} of 600 characters. Two to four sentences works best.`} maxLength={600} />
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Education</h2>
            {content.education.length === 0 && <p className="mt-2 text-sm text-muted">Nothing here yet. <Link to="/profile/education" className="underline">Add education to your profile</Link>.</p>}
            {content.education.map((e, i) => (
              <div key={i} className="mt-3 border-t border-line pt-3">
                <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-5 w-5" checked={e.include} onChange={(ev) => item('education', i, { include: ev.target.checked })} /> <span><b>{[e.qualification, e.course].filter(Boolean).join(', ') || e.institution}</b> <Pill tone="add">From your profile</Pill><br /><span className="text-sm text-muted">{e.institution}</span></span></label>
                {e.include && <TextArea label="A line about coursework or achievements" id={`edu-${i}`} rows={2} optional value={e.notes} onChange={(ev) => item('education', i, { notes: ev.target.value })} />}
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Projects and experience</h2>
            <p className="text-sm text-muted">Choose what to include and edit the wording. Only entries from your profile appear here.</p>
            {content.experiences.length === 0 && <p className="mt-2 text-sm text-muted">Nothing here yet. <Link to="/evidence" className="underline">Build evidence in your profile</Link>.</p>}
            {content.experiences.map((x, i) => (
              <div key={i} className="mt-3 border-t border-line pt-3">
                <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-5 w-5" checked={x.include} onChange={(ev) => item('experiences', i, { include: ev.target.checked })} /> <span><b>{x.title}</b> {x.statement.trim() ? <Pill tone="add">From your profile</Pill> : <Pill tone="need">Needs details</Pill>}</span></label>
                {x.include && <TextArea label="Wording" id={`exp-${i}`} rows={3} value={x.statement} onChange={(ev) => item('experiences', i, { statement: ev.target.value })} hint={x.statement.trim() ? `${x.statement.length} of 600 characters. Only say what is true.` : 'Say what you did, in your own words. Not sure how? Use the Evidence Builder from your profile.'} maxLength={600} />}
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Skills</h2>
            {content.skills.length === 0 && <p className="mt-2 text-sm text-muted">Nothing here yet. <Link to="/profile/skills" className="underline">Add skills to your profile</Link>.</p>}
            {content.skills.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 first:mt-2">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={s.include} onChange={(ev) => item('skills', i, { include: ev.target.checked })} /> <b>{s.name}</b></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={s.featured} onChange={(ev) => item('skills', i, { featured: ev.target.checked })} /> Show first</label>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-bold">Save a version</h2>
            <p className="text-sm text-muted">A version is a snapshot you can come back to. Earlier versions are always kept.</p>
            <TextField label="Version note" id="vnote" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added my SIWES placement" maxLength={200} />
            <div className="mt-3 flex flex-wrap gap-3">
              <Button variant="outline" onClick={saveVersion} disabled={busy}>Save version</Button>
              <Link className="btn-sm" to={`/cv-studio/versions?id=${cv.id}`}>See versions</Link>
            </div>
          </section>
        </div>

        <div id="cv-preview" className="lg:sticky lg:top-4">
          <p className="mb-2 text-center text-sm text-muted"><Pill tone="ok">Live preview</Pill> Updates as you type. Yellow markers show what is missing and never appear in the PDF.</p>
          <CvPaper content={content} />
        </div>
      </div>
    </div>
  )
}

export default function CvEditor() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const cvs = useTable('cvs', 'updated_at')
  const versions = useTable('cv_versions')
  const cv = cvs.rows.find((c) => c.id === id)
  return (
    <div>
      <Seo title="CV editor | Pathora" description="Edit your CV." path="/cv-studio/edit" noindex />
      {cvs.loading || versions.loading ? <p role="status" className="text-muted">Loading…</p> : !cv ? (
        <Alert tone="error">We couldn’t find that CV. <Link className="underline" to="/cv-studio">Back to CV Studio</Link></Alert>
      ) : <Editor key={cv.id} cv={cv} cvs={cvs} versions={versions} />}
    </div>
  )
}
