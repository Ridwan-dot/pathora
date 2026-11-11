import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import CvPaper from '../../components/CvPaper'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { useTable } from '../../data/useTable'
import { cvGaps } from '../../cv/build'

export default function CvPreview() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const cvs = useTable('cvs', 'updated_at')
  const [confirmed, setConfirmed] = useState(false)
  const cv = cvs.rows.find((c) => c.id === id)
  const gaps = cv ? cvGaps(cv.content) : []
  const canExport = confirmed && gaps.length === 0

  return (
    <div>
      <Seo title="Preview and export | Pathora" description="Check and export your CV." path="/cv-studio/preview" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">CV Studio</p>
      <h1 className="mt-1 text-3xl font-bold">Preview and export</h1>
      <p className="mt-1 text-muted">Read every line before you send this to anyone.</p>
      {cvs.loading ? <p role="status" className="mt-4 text-muted">Loading…</p> : !cv ? (
        <Alert tone="error">We couldn’t find that CV. <Link className="underline" to="/cv-studio">Back to CV Studio</Link></Alert>
      ) : (
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_320px]">
          <CvPaper content={cv.content} />
          <div className="space-y-4">
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg font-bold">Before you export</h2>
              {gaps.length === 0 ? <p className="mt-2"><Pill tone="ok">Nothing missing</Pill></p> : (
                <ul className="mt-2 space-y-2">{gaps.map((g) => <li key={g}><Pill tone="need">{g}</Pill></li>)}</ul>
              )}
              <p className="mt-2 text-sm text-muted">These checks are about completeness. Pathora can’t know whether a statement is true. You do.</p>
              {gaps.length > 0 && <Link className="btn-sm mt-2" to={`/cv-studio/edit?id=${cv.id}`}>Fix these in the editor →</Link>}
            </section>
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg font-bold">Export</h2>
              <p className="text-sm text-muted">Format: PDF · Template: Clean</p>
              <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-5 w-5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I’ve read my CV and every statement is true.</label>
              <Button className="mt-3 w-full" disabled={!canExport} onClick={() => window.print()}>Download PDF</Button>
              {!canExport && <p className="mt-2 text-sm text-muted">{gaps.length > 0 ? 'Fix the items above to unlock export.' : 'Tick the box to unlock export.'}</p>}
              <p className="mt-2 text-xs text-muted">Your browser’s print window opens. Choose <b>Save as PDF</b> as the destination. The yellow markers and everything outside the CV are left out.</p>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
