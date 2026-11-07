import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

// Slim layout for focused tasks such as onboarding.
export default function FocusLayout() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
        <Link to="/dashboard" aria-label="Pathora dashboard"><Logo /></Link>
        <Link to="/dashboard" className="font-semibold text-muted underline">Skip for now</Link>
      </header>
      <main className="mx-auto max-w-2xl p-5 md:p-8"><Outlet /></main>
    </div>
  )
}
