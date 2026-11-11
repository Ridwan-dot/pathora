import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Seo from '../../components/Seo'
import { TextField } from '../../components/TextField'
import { useAuth } from '../../auth/useAuth'
import { useTable } from '../../data/useTable'
import { cvFromProfile } from '../../cv/build'

export default function CvHome() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const cvs = useTable('cvs', 'updated_at')
  const versions = useTable('cv_versions')
  const jobs = useTable('job_analyses')
  const education = useTable('education')
  const skills = useTable('skills')
  const experiences = useTable('experiences')
  const [title, setTitle] = useState('My CV')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const ready = ![cvs, versions, jobs, education, skills, experiences].some((t) => t.loading)

  async function createFrom(content, name, note) {
    setError('')
    setBusy(true)
    const { data, error: err } = await cvs.add({ title: name, content })
    if (err) { setBusy(false); return setError('We couldn’t create that. Please try again.') }
    await versions.add({ cv_id: data.id, version_number: 1, note, content })
    setBusy(false)
    navigate(`/cv-studio/edit?id=${data.id}`)
  }

  const create = () => createFrom(
    cvFromProfile({ profile, email: user.email, education: education.rows, skills: skills.rows, experiences: experiences.rows }),
    title.trim() || 'My CV',
    'First draft from your profile',
  )

  return (
    <div>
      <Seo title="CV Studio | Pathora" description="Build and edit your CV." path="/cv-studio" noindex />
      <h2 className="text-2xl font-bold">CV Studio</h2>
      <p className="text-muted">Build a CV from your real Career Profile. Your profile is never changed by edits you make here.</p>
      {cvs.error && <Alert tone="error">{cvs.error}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <section className="mt-4 rounded-2xl border border-line bg-white p-5">
        <h3 className="text-lg font-bold">Create a CV from my Career Profile</h3>
        <p className="text-sm text-muted">
          {ready ? `Uses your ${education.rows.length} education entr${education.rows.length === 1 ? 'y' : 'ies'}, ${skills.rows.length} skill${skills.rows.length === 1 ? '' : 's'} and ${experiences.rows.length} experience${experiences.rows.length === 1 ? '' : 's'}. You review everything before using it.` : 'Loading your profile…'}
        </p>
        <TextField label="Name this CV" id="cvtitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button className="mt-4" disabled={!ready || busy} onClick={create}>{busy ? 'Creating your CV…' : 'Create my CV'}</Button>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-bold">Your CVs</h3>
        {!ready ? <p role="status" className="mt-2 text-muted">Loading…</p> : cvs.rows.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-sage p-4 text-muted">No CVs yet. Create your first one above.</p>
        ) : (
          <div className="mt-2 rounded-2xl border border-line bg-white p-5">
            {cvs.rows.map((cv, i) => {
              const count = versions.rows.filter((v) => v.cv_id === cv.id).length
              return (
                <div key={cv.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
                  <span><b>{cv.title}</b><br /><span className="text-sm text-muted">Updated {new Date(cv.updated_at).toLocaleDateString()} · {count} version{count === 1 ? '' : 's'}{cv.job_analysis_id && jobs.rows.find((j) => j.id === cv.job_analysis_id) ? ` · Tailored for ${jobs.rows.find((j) => j.id === cv.job_analysis_id).title}` : ''}</span></span>
                  <span className="flex flex-wrap gap-2">
                    <Link className="btn-sm" to={`/cv-studio/edit?id=${cv.id}`}>Open</Link>
                    <Link className="btn-sm" to={`/cv-studio/tailor?id=${cv.id}`}>Tailor to a job</Link>
                    <Link className="btn-sm" to={`/cv-studio/preview?id=${cv.id}`}>Export</Link>
                    <Link className="btn-sm" to={`/cv-studio/versions?id=${cv.id}`}>Versions</Link>
                    <button type="button" className="btn-sm" disabled={busy} onClick={() => createFrom(cv.content, `Copy of ${cv.title}`.slice(0, 100), `Copied from “${cv.title}”`)}>Duplicate</button>
                    <button type="button" className="btn-sm btn-sm-danger" onClick={() => setConfirm(cv.id)}>Delete</button>
                  </span>
                  {confirm === cv.id && (
                    <div className="w-full">
                      <Alert tone="error"><b>Delete “{cv.title}”?</b> Its saved versions go too. This can’t be undone.</Alert>
                      <div className="mt-2 flex gap-3">
                        <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
                        <Button className="bg-danger! hover:opacity-90" onClick={async () => { await cvs.remove(cv.id); setConfirm(null) }}>Yes, delete</Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
