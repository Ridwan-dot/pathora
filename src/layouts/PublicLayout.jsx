import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/Button'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
        <Link to="/" aria-label="Pathora home"><Logo /></Link>
        <nav aria-label="Account" className="flex items-center gap-4">
          <Link to="/login" className="font-semibold">Log in</Link>
          <Button to="/signup" className="min-h-10! py-2!">Get started</Button>
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line px-5 py-6 text-sm text-muted">
        Pathora offers guidance, not guarantees. Your experience and final applications remain yours.
      </footer>
    </div>
  )
}
