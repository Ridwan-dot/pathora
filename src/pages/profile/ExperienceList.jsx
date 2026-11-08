import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { useTable } from '../../data/useTable'
import { experienceTypes, typeLabel } from '../../data/constants'

export default function ExperienceList() {
  const { rows, loading, error, remove } = useTable('experiences', 'created_at')
  const [filter, setFilter] = useState('all')
  const [confirm, setConfirm] = useState(null)
  const shown = filter === 'all' ? rows : rows.filter((r) => r.type === filter)

  return (
    <div>
      <Seo title="Projects and experience | Pathora" description="Your projects and experience." path="/profile/experience" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Career Profile</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Projects and experience</h1>
        <Button to="/profile/experience/edit">Add experience</Button>
      </div>
      <p className="mt-1 text-muted">Projects, jobs, SIWES, volunteering and leadership. Real work only.</p>
      {error && <Alert tone="error">{error}</Alert>}

      <p className="mt-4">
        {[{ value: 'all', label: 'All' }, ...experienceTypes].map((t) => (
          <button key={t.value} type="button" onClick={() => setFilter(t.value)} className={`mb-1.5 mr-1.5 min-h-10 rounded-full border px-4 py-2 ${filter === t.value ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>{t.label}</button>
        ))}
      </p>

      {loading ? <p role="status" className="mt-4 text-muted">Loading…</p> : rows.length === 0 ? (
        <div className="mt-2 rounded-2xl bg-sage p-5">
          <b>Start with something you built, studied or helped with</b>
          <p className="text-muted">A school project counts. So does volunteering.</p>
          <Button to="/profile/experience/edit" className="mt-3">Add experience</Button>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-2 text-muted">Nothing under {typeLabel[filter]} yet. <Link className="font-semibold underline" to="/profile/experience/edit">Add one</Link></p>
      ) : (
        <div className="mt-2 rounded-2xl border border-line bg-white p-5">
          {shown.map((r, i) => (
            <div key={r.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
              <span>
                <b>{r.title}</b><br />
                <span className="text-muted">{typeLabel[r.type]}{r.organisation ? ` · ${r.organisation}` : ''}{r.start_date ? ` · ${r.start_date}${r.is_current ? ' to now' : r.end_date ? ` to ${r.end_date}` : ''}` : ''}</span>
              </span>
              <span className="flex flex-wrap items-center gap-3">
                {r.evidence_statement ? <Pill tone="ok">Evidence statement saved</Pill> : <Pill tone="need">Needs details</Pill>}
                {!r.evidence_statement && <Link className="btn-sm" to={`/evidence?id=${r.id}`}>Add details</Link>}
                <Link className="btn-sm" to={`/profile/experience/edit?id=${r.id}`}>Edit</Link>
                <button type="button" className="btn-sm btn-sm-danger" onClick={() => setConfirm(r.id)}>Remove</button>
              </span>
              {confirm === r.id && (
                <div className="w-full">
                  <Alert tone="error"><b>Remove {r.title}?</b> Its evidence statement will be removed too. This can’t be undone.</Alert>
                  <div className="mt-2 flex gap-3">
                    <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
                    <Button className="bg-danger! hover:opacity-90" onClick={async () => { await remove(r.id); setConfirm(null) }}>Yes, remove</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
