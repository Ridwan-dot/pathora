import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from './useAuth'

// Wrap private pages with this. Visitors who are not signed in are sent to the login page.
export default function RequireAuth() {
  const { session, loading } = useAuth()
  const { pathname } = useLocation()
  const seo = <Seo title="Pathora" description="Your Pathora account." path={pathname} noindex />

  if (loading) return <>{seo}<p role="status" className="p-10 text-muted">Loading…</p></>
  if (!session) return <>{seo}<Navigate to="/login" replace state={{ from: pathname }} /></>
  return <>{seo}<Outlet /></>
}
