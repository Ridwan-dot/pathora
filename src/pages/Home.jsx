import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Pill from '../components/Pill'
import Seo from '../components/Seo'
import { graph, organization } from '../lib/jsonld'
import { abs, SITE_NAME } from '../lib/head'

const problems = [
  { t: '“I don’t know which jobs suit me.”', d: 'Understand what a vacancy asks and decide whether it fits.', bg: 'bg-sage' },
  { t: '“I don’t have enough experience.”', d: 'Find evidence in your projects, studies and activities.', bg: 'bg-coral-tint' },
  { t: '“I don’t know how to stand out.”', d: 'Present your real strengths clearly and honestly.', bg: 'bg-sage' },
]
const steps = [
  { t: 'Understand', d: 'Translate job language and see what the employer is asking for.' },
  { t: 'Build your evidence', d: 'Connect your genuine experience to what the role needs.' },
  { t: 'Prepare and progress', d: 'Improve your CV, practise interviews and organise applications.' },
]
const toolkit = [
  { t: 'CV Studio', d: 'Create and improve a CV that reflects your real evidence.', to: '/tools/cv-builder', bg: 'bg-white' },
  { t: 'Interview Practice', d: 'Practise text answers and get specific, helpful feedback.', to: '/tools/interview-practice', bg: 'bg-sage' },
  { t: 'Application Tracker', d: 'Keep opportunities, deadlines and next steps organised.', to: '/tools/application-tracker', bg: 'bg-white' },
  { t: 'Career Profile', d: 'Build your profile once and reuse your information across Pathora.', to: '/tools/evidence-builder', bg: 'bg-coral-tint' },
]

export default function Home() {
  return (
    <>
      <Seo
        title="Pathora: understand the job, show your evidence, move forward"
        description="Pathora helps students, graduates and entry-level job seekers understand job descriptions, turn real experience into evidence, build a CV, practise interviews and track applications."
        path="/"
        jsonLd={graph(organization(), { '@type': 'WebSite', name: SITE_NAME, url: abs('/') })}
      />

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-12 md:grid-cols-2 md:py-16">
        <div>
          <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs font-semibold">Your career journey starts here</span>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Your next chapter starts here.</h1>
          <p className="mt-4 text-muted">
            Understand job opportunities, discover the value of your experience and prepare with confidence for your next career move.
            Built for students, graduates, NYSC members and entry-level job seekers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/signup">Start your journey</Button>
            <Button to="/tools/job-analyser" variant="outline">Explore the platform</Button>
          </div>
          <p className="mt-3 text-sm text-muted">Built for real experiences. Designed for your next opportunity.</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Job analysis · example</p>
          <div className="mt-3 rounded-xl bg-sage p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Product support associate</p>
            <h2 className="text-lg font-bold">A role you can understand.</h2>
          </div>
          {[['Communication', 'ok', 'Backed by evidence'], ['Problem solving', 'add', 'Added by you'], ['Relevant experience', 'need', 'Needs evidence']].map(([n, tone, label]) => (
            <div key={n} className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
              <span>{n}</span><Pill tone={tone}>{label}</Pill>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">A little less overwhelming</p>
          <h2 className="mt-2 text-3xl font-bold">You don’t have to figure it all out alone.</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))]">
            {problems.map((p) => (
              <div key={p.t} className={`rounded-2xl p-5 ${p.bg}`}>
                <h3 className="text-base font-bold">{p.t}</h3>
                <p className="mt-1 text-sm text-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">A clearer way forward</p>
        <h2 className="mt-2 text-3xl font-bold">Turn uncertainty into your next move.</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))]">
          {steps.map((s) => (
            <div key={s.t} className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-forest py-12 text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#cfe0d6]">Start with the job description</p>
            <h2 className="mt-2 text-3xl font-bold">Before you apply, understand the opportunity.</h2>
            <p className="mt-3 text-[#cfe0d6]">Paste a vacancy and see what the employer asks for and which requirements you can already show.</p>
            <Button to="/tools/job-analyser" variant="outline" className="mt-4">Analyse a job →</Button>
          </div>
          <div className="rounded-2xl bg-white p-5 text-forest-dark">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Example role</p>
            <h3 className="text-lg font-bold">Customer Support Associate</h3>
            <div className="mt-3 rounded-xl bg-sage p-3"><b>Communication</b><p className="text-sm text-muted">Essential · Backed by evidence</p></div>
            <div className="mt-2 rounded-xl bg-sage p-3"><b>Customer support tools</b><p className="text-sm text-muted">Preferred · Added by you</p></div>
            <div className="mt-2 rounded-xl bg-coral-tint p-3"><b>Prepare an example</b><p className="text-sm text-muted">Needs evidence</p></div>
          </div>
        </div>
      </section>

      <section className="bg-sage py-12">
        <div className="mx-auto max-w-5xl px-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Experience-to-Evidence builder</p>
          <h2 className="mt-2 text-3xl font-bold">Your experience may be more valuable than you think.</h2>
          <p className="mt-3 max-w-2xl text-muted">
            School projects, SIWES, internships and volunteering can all show relevant skills. Pathora helps you explain what you actually did, without exaggeration.
          </p>
          <Button to="/tools/evidence-builder" className="mt-4">See how it works</Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your career toolkit</p>
        <h2 className="mt-2 text-3xl font-bold">Everything has a next step.</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))]">
          {toolkit.map((t) => (
            <Link key={t.t} to={t.to} className={`rounded-2xl border border-line p-5 ${t.bg} hover:opacity-90`}>
              <h3 className="text-base font-bold">{t.t}</h3>
              <p className="mt-1 text-sm text-muted">{t.d}</p>
            </Link>
          ))}
        </div>
        <p className="mt-6">New to job hunting? Read our <Link to="/resources" className="font-semibold underline">free career guides</Link>.</p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-forest p-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#cfe0d6]">One step is enough to begin</p>
            <h2 className="text-2xl font-bold">Your next opportunity starts with one step.</h2>
            <p className="mt-1 text-[#cfe0d6]">You don’t need everything figured out. Start with what you know and build from there.</p>
          </div>
          <Button to="/signup" variant="outline">Get started with Pathora</Button>
        </div>
      </section>
    </>
  )
}
