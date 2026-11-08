import { useState } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { SelectField, TextField } from '../../components/TextField'
import { useTable } from '../../data/useTable'
import { skillCategories } from '../../data/constants'

export default function Skills() {
  const skills = useTable('skills', 'created_at')
  const experiences = useTable('experiences', 'created_at')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Technical')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  // A skill is "backed by evidence" when one of your experiences lists it.
  const backed = new Set(experiences.rows.flatMap((e) => (e.skills_used || []).map((s) => s.toLowerCase())))

  async function onAdd(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return setError('Type a skill to add.')
    if (skills.rows.some((s) => s.name.toLowerCase() === n.toLowerCase())) return setError(`You’ve already added ${n}.`)
    setBusy(true)
    const { error: err } = await skills.add({ name: n, category })
    setBusy(false)
    if (err) return setError('We couldn’t add that. Please try again.')
    setError('')
    setName('')
  }

  return (
    <div>
      <Seo title="Skills | Pathora" description="Your skills." path="/profile/skills" noindex />
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Career Profile</p>
      <h1 className="mt-1 text-3xl font-bold">Skills</h1>
      <p className="mt-1 text-muted">List the skills you genuinely have. Linking one to a project shows employers the proof.</p>
      {skills.error && <Alert tone="error">{skills.error}</Alert>}

      <form onSubmit={onAdd} noValidate className="mt-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1"><TextField label="Add a skill" id="skill" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Excel" error={error} className="mt-0!" /></div>
          <Button type="submit" disabled={busy}>Add skill</Button>
        </div>
        <SelectField label="Group" id="category" options={skillCategories} value={category} onChange={(e) => setCategory(e.target.value)} />
      </form>

      {skills.loading ? <p role="status" className="mt-6 text-muted">Loading…</p> : skills.rows.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-sage p-5"><b>Start with three you are sure of</b><p className="text-muted">Tools you have used, or things people say you do well.</p></div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          {skillCategories.map((cat) => {
            const list = skills.rows.filter((s) => s.category === cat)
            if (!list.length) return null
            return (
              <section key={cat} className="mb-4 last:mb-0">
                <h2 className="text-lg font-bold">{cat}</h2>
                {list.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3">
                    <span><b>{s.name}</b> {backed.has(s.name.toLowerCase()) ? <Pill tone="ok">Backed by evidence</Pill> : <Pill tone="add">Added by you</Pill>}</span>
                    <span className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={s.featured} onChange={(e) => skills.update(s.id, { featured: e.target.checked })} /> Show first on my CV</label>
                      <button type="button" className="btn-sm btn-sm-danger" onClick={() => setConfirm(s.id)}>Remove</button>
                    </span>
                    {confirm === s.id && (
                      <div className="w-full">
                        <Alert tone="error"><b>Remove {s.name}?</b> It will also leave your CV drafts.</Alert>
                        <div className="mt-2 flex gap-3">
                          <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
                          <Button className="bg-danger! hover:opacity-90" onClick={async () => { await skills.remove(s.id); setConfirm(null) }}>Yes, remove</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )
          })}
          <p className="text-sm text-muted">Backed by evidence: listed in one of your projects or experiences. Added by you: no example linked yet. Pathora can’t verify skills.</p>
        </div>
      )}
    </div>
  )
}
