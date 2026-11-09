import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

// Slim layout for focused tasks. Give it a back link, or set skip for onboarding.
export default function FocusLayout({ backTo = '/dashboard', backLabel = 'Dashboard', skip = false, wide = false }) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
        <Link to="/dashboard" aria-label="Pathora dashboard"><Logo /></Link>
        {skip ? (
          <Link to="/dashboard" className="btn-sm">Skip for now</Link>
        ) : (
          <Link to={backTo} className="btn-sm">← {backLabel}</Link>
        )}
      </header>
      <main className={`mx-auto p-5 md:p-8 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}><Outlet /></main>
    </div>
  )
}
