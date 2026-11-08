import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'
import { appNav } from '../navigation'

// Sidebar layout for "home base" pages. On phones the sidebar becomes a scrolling row.
export default function AppLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  async function logOut() {
    await signOut()
    navigate('/', { replace: true })
  }
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
        <Link to="/dashboard" aria-label="Pathora dashboard"><Logo /></Link>
        <span className="flex items-center gap-4 text-sm">
          <Link to="/profile" className="btn-sm">Your profile</Link>
          <button type="button" onClick={logOut} className="btn-sm">Log out</button>
        </span>
      </header>
      <div className="md:grid md:grid-cols-[220px_1fr]">
        <nav
          aria-label="Main"
          className="flex gap-1 overflow-x-auto border-b border-line bg-white p-3 md:flex-col md:border-r md:border-b-0 md:p-4"
        >
          {appNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-3 py-2.5 ${isActive ? 'bg-sage font-semibold' : 'hover:bg-sage/60'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="p-5 md:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
