import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Pill from '../../components/Pill'
import Seo from '../../components/Seo'
import { useAuth } from '../../auth/useAuth'
import { useTable } from '../../data/useTable'
import { typeLabel } from '../../data/constants'

function Card({ title, to, link = 'Manage', children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link to={to} className="btn-sm">{link}</Link>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  )
}

const Empty = ({ text, to, cta }) => (
  <div className="rounded-xl bg-sage p-3"><p className="text-muted">{text}</p><Link to={to} className="font-semibold underline">{cta}</Link></div>
)

export default function ProfileOverview() {
  const { profile, user } = useAuth()
  const education = useTable('education')
  const skills = useTable('skills')
  const experiences = useTable('experiences')
  const backed = new Set(experiences.rows.flatMap((e) => (e.skills_used || []).map((s) => s.toLowerCase())))
  const needDetails = experiences.rows.filter((e) => !e.evidence_statement)

  return (
    <div>
      <Seo title="Career profile | Pathora" description="Your Career Profile." path="/profile" noindex />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Your Career Profile</h2>
          <p className="text-muted">Everything Pathora uses to help you, in one place. You decide what is here.</p>
        </div>
        <Button to="/profile/experience/edit">Add experience</Button>
      </div>

      {needDetails.length > 0 && (
        <div className="mt-4 rounded-2xl bg-sage p-4">
          <b>{needDetails.length} experience{needDetails.length > 1 ? 's need' : ' needs'} more details.</b>{' '}
          {needDetails[0].title} has no evidence statement yet. <Link to={`/profile/experience/edit?id=${needDetails[0].id}`} className="font-semibold underline">Add details →</Link>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        <Card title="Personal details" to="/profile/personal" link="Edit">
          <p><b>{profile?.full_name || 'Add your name'}</b><br /><span className="text-muted">{[user?.email, profile?.location].filter(Boolean).join(' · ')}</span></p>
          {profile?.summary ? <p className="mt-1 text-muted">{profile.summary}</p> : <p className="mt-1 text-sm text-muted">No summary yet.</p>}
        </Card>

        <Card title="Career interests" to="/profile/personal" link="Edit">
          {profile?.target_role ? <span className="inline-block rounded-full border border-forest bg-sage px-4 py-2 font-semibold">{profile.target_role}</span> : <p className="text-sm text-muted">Not added yet. “Not sure yet” is fine.</p>}
        </Card>

        <Card title="Education" to="/profile/education">
          {education.rows.length === 0 ? <Empty text="Add your school or course so your CV and job analysis can use it." to="/profile/education" cta="+ Add education" /> : education.rows.map((r) => (
            <p key={r.id} className="border-t border-line py-2 first:border-0"><b>{[r.qualification, r.course].filter(Boolean).join(', ') || r.institution}</b><br /><span className="text-muted">{r.institution}</span></p>
          ))}
        </Card>

        <Card title="Skills" to="/profile/skills">
          {skills.rows.length === 0 ? <Empty text="Start with three you are sure of." to="/profile/skills" cta="+ Add skills" /> : (
            <>
              <p>{skills.rows.map((s) => <span key={s.id} className={`mb-1.5 mr-1.5 inline-block rounded-full border px-3 py-1.5 ${backed.has(s.name.toLowerCase()) ? 'border-forest bg-sage font-semibold' : 'border-[#b9cdbf] bg-white'}`}>{backed.has(s.name.toLowerCase()) ? '✓ ' : ''}{s.name}</span>)}</p>
              <p className="text-sm text-muted">✓ means a project or experience backs it up. No tick means you added it yourself.</p>
            </>
          )}
        </Card>

        <Card title="Projects and experience" to="/profile/experience" className="sm:col-span-full">
          {experiences.rows.length === 0 ? <Empty text="Start with something you built, studied or helped with." to="/profile/experience/edit" cta="+ Add experience" /> : experiences.rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 first:border-0">
              <span><b>{r.title}</b><br /><span className="text-muted">{typeLabel[r.type]}{r.organisation ? ` · ${r.organisation}` : ''}</span></span>
              {r.evidence_statement ? <Pill tone="ok">Evidence statement saved</Pill> : <Pill tone="need">Needs details</Pill>}
            </div>
          ))}
          <p className="mt-2 text-sm text-muted">No paid employment yet? That’s fine. Projects, SIWES, volunteering and leadership all count.</p>
        </Card>
      </div>
    </div>
  )
}
