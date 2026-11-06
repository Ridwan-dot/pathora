import { Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'
import { appNav } from './navigation'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<ComingSoon title="Create your account" />} />
        <Route path="/login" element={<ComingSoon title="Log in" />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {appNav
          .filter((item) => item.to !== '/dashboard')
          .map((item) => (
            <Route key={item.to} path={item.to} element={<ComingSoon title={item.label} />} />
          ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
