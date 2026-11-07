import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/Button'
import { features } from '../content/features'
import { guides } from '../content/guides'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
        <Link to="/" aria-label="Pathora home"><Logo /></Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-4">
          <a href="/#how" className="hidden sm:inline">How it works</a>
          <Link to="/resources" className="hidden sm:inline">Career guides</Link>
          <Link to="/login" className="font-semibold">Log in</Link>
          <Button to="/signup" className="min-h-10! py-2!">Get started</Button>
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-white px-5 py-8 text-sm">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-2 text-muted">A clearer path from uncertainty to opportunity.</p>
          </div>
          <nav aria-label="Tools">
            <p className="font-bold">Tools</p>
            <ul className="mt-2 space-y-1">
              {features.map((f) => <li key={f.slug}><Link to={`/tools/${f.slug}`}>{f.name}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Career guides">
            <p className="font-bold">Career guides</p>
            <ul className="mt-2 space-y-1">
              <li><Link to="/resources">All guides</Link></li>
              {guides.map((g) => <li key={g.slug}><Link to={`/resources/${g.slug}`}>{g.title}</Link></li>)}
            </ul>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-5xl text-muted">
          Pathora offers guidance, not guarantees. Your experience and final applications remain yours.
        </p>
      </footer>
    </div>
  )
}
