import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const steps = [
  { to: '/analyse', title: 'Understand a job', text: 'Paste a vacancy to see what the employer is really asking for.' },
  { to: '/profile', title: 'Find your evidence', text: 'Explore the skills you may have gained through projects and study.' },
  { to: '/interview-practice', title: 'Practise your introduction', text: 'Build confidence explaining who you are and what you bring.' },
]

// Placeholder dashboard. Real data arrives in later stages.
export default function Dashboard() {
  return (
    <div>
      <Seo title="Dashboard | Pathora" description="Your Pathora dashboard." path="/dashboard" noindex />
      <h2 className="text-2xl font-bold">Good morning</h2>
      <p className="mt-1 text-muted">Let's make your next career move a little clearer.</p>
      <h3 className="mt-6 text-lg font-bold">Your next steps</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        {steps.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-2xl border border-line bg-white p-5 hover:bg-sage/40">
            <h3 className="text-base font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
