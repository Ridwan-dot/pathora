import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../auth/useAuth'
import { useTable } from '../data/useTable'
import { attentionList, niceDate, todayISO } from '../tracker/attention'

const steps = [
  { to: '/analyse', title: 'Understand a job', text: 'Paste a vacancy to see what the employer is really asking for.' },
  { to: '/evidence', title: 'Find your evidence', text: 'Explore the skills you may have gained through projects and study.' },
  { to: '/interview-practice', title: 'Practise your introduction', text: 'Build confidence explaining who you are and what you bring.' },
]

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const apps = useTable('applications', 'updated_at')
  const attention = attentionList(apps.rows, todayISO())
  const recent = apps.rows.filter((a) => !['Not selected', 'Withdrawn'].includes(a.status)).slice(0, 3)
  const first = profile?.full_name?.trim().split(' ')[0]
  return (
    <div>
      <Seo title="Dashboard | Pathora" description="Your Pathora dashboard." path="/dashboard" noindex />
      <h2 className="text-2xl font-bold">{greeting()}{first ? `, ${first}` : ''}</h2>
      <p className="mt-1 text-muted">Let’s make your next career move a little clearer.</p>

      {profile && !profile.onboarding_done && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sage p-4">
          <span><b>Your career profile is just getting started.</b><br /><span className="text-muted">Answer three quick questions to get more relevant guidance.</span></span>
          <Link to="/onboarding" className="btn-sm">Finish setting up →</Link>
        </div>
      )}

      {attention.length > 0 && (
        <section className="mt-4 rounded-2xl bg-sage p-4">
          <b>Needs attention</b>
          {attention.slice(0, 4).map(({ app, items }) => (
            <div key={app.id} className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span>{app.company}: {items.map((i) => i.text).join(', ')}</span>
              <Link className="font-semibold underline" to={`/applications/details?id=${app.id}`}>Open</Link>
            </div>
          ))}
        </section>
      )}

      <h3 className="mt-6 text-lg font-bold">Your next steps</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        {steps.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-2xl border border-line bg-white p-5 hover:bg-sage/40">
            <h3 className="text-base font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Your applications</h3><Link to="/applications" className="btn-sm">View all</Link></div>
        {recent.length === 0 ? (
          <div className="mt-3 rounded-xl bg-sage p-4 text-center"><b>Your next opportunity starts here</b><p className="text-sm text-muted">When you save a role, it will appear here with its deadline and next action.</p><Link to="/applications/edit" className="font-semibold underline">+ Add an application</Link></div>
        ) : recent.map((a, i) => (
          <div key={a.id} className={`flex flex-wrap items-center justify-between gap-2 py-2 ${i ? 'border-t border-line' : ''}`}>
            <span><b>{a.role}</b> · {a.company}<br /><span className="text-sm text-muted">{a.status}{a.next_action ? ` · Next: ${a.next_action}${a.next_action_due ? ` (${niceDate(a.next_action_due)})` : ''}` : ''}</span></span>
            <Link to={`/applications/details?id=${a.id}`} className="btn-sm">Open</Link>
          </div>
        ))}
      </section>
    </div>
  )
}
