import { Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'
import { appNav } from './navigation'
import { authPaths, publicRoutes } from './routes'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {publicRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
        {authPaths.map((p) => (
          <Route key={p} path={p} element={<ComingSoon title={p === '/signup' ? 'Create your account' : 'Log in'} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {appNav
          .filter((item) => item.to !== '/dashboard')
          .map((item) => (
            <Route key={item.to} path={item.to} element={<ComingSoon title={item.label} />} />
          ))}
      </Route>
    </Routes>
  )
}

export default App
