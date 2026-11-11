import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import CvPaper from '../../components/CvPaper'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { useTable } from '../../data/useTable'

const now = () => new Date().toISOString()

export default function CvVersions() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const cvs = useTable('cvs', 'updated_at')
  const versions = useTable('cv_versions')
  const [open, setOpen] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [msg, setMsg] = useState(null)
  const cv = cvs.rows.find((c) => c.id === id)
  const mine = versions.rows.filter((v) => v.cv_id === id).sort((a, b) => b.version_number - a.version_number)

  // Restoring never overwrites silently: the current CV is saved as a new version first.
  async function restore(v) {
    const next = mine[0].version_number + 1
    const saveCurrent = await versions.add({ cv_id: id, version_number: next, note: `Saved before restoring version ${v.version_number}`, content: cv.content })
    if (saveCurrent.error) return setMsg({ tone: 'error', text: 'We couldn’t save your current CV first, so nothing was changed.' })
    const res = await cvs.update(id, { content: v.content, updated_at: now() })
    setConfirm(null)
    setMsg(res.error ? { tone: 'error', text: 'We couldn’t restore that version. Your current CV is saved as a version.' } : { tone: 'success', text: `Version ${v.version_number} restored. Your previous CV is kept as version ${next}.` })
  }

  return (
    <div>
      <Seo title="Versions | Pathora" description="Saved versions of your CV." path="/cv-studio/versions" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">CV Studio</p>
      <h1 className="mt-1 text-3xl font-bold">Versions{cv ? `: ${cv.title}` : ''}</h1>
      {cvs.loading || versions.loading ? <p role="status" className="mt-4 text-muted">Loading…</p> : !cv ? (
        <Alert tone="error">We couldn’t find that CV. <Link className="underline" to="/cv-studio">Back to CV Studio</Link></Alert>
      ) : (
        <div>
          <p className="mt-1 text-muted">Every time you save a version, the earlier ones are kept. Restoring asks you first and saves your current CV as a new version, so nothing is overwritten.</p>
          {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
          <div className="mt-4 rounded-2xl border border-line bg-white p-5">
            {mine.map((v, i) => (
              <div key={v.id} className={`py-3 ${i ? 'border-t border-line' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span><b>Version {v.version_number}</b> {i === 0 && <Pill tone="ok">Latest</Pill>}<br /><span className="text-sm text-muted">{new Date(v.created_at).toLocaleDateString()}{v.note ? ` · ${v.note}` : ''}</span></span>
                  <span className="flex gap-2">
                    <button type="button" className="btn-sm" onClick={() => setOpen(open === v.id ? null : v.id)}>{open === v.id ? 'Hide' : 'Preview'}</button>
                    <button type="button" className="btn-sm" onClick={() => setConfirm(v.id)}>Restore</button>
                  </span>
                </div>
                {confirm === v.id && (
                  <div>
                    <Alert tone="error"><b>Restore version {v.version_number}?</b> Your current CV is saved as a new version first, so nothing is lost.</Alert>
                    <div className="mt-2 flex gap-3"><Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button><Button onClick={() => restore(v)}>Restore</Button></div>
                  </div>
                )}
                {open === v.id && <div className="mt-3"><CvPaper content={v.content} /></div>}
              </div>
            ))}
          </div>
          <Button to={`/cv-studio/edit?id=${id}`} className="mt-4">Back to the editor</Button>
        </div>
      )}
    </div>
  )
}
