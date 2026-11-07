import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import FocusLayout from './layouts/FocusLayout'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'
import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import CheckEmail from './pages/auth/CheckEmail'
import Verified from './pages/auth/Verified'
import { appNav } from './navigation'
import { publicRoutes } from './routes'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          {publicRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verified" element={<Verified />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<FocusLayout />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {appNav
              .filter((item) => item.to !== '/dashboard')
              .map((item) => (
                <Route key={item.to} path={item.to} element={<ComingSoon title={item.label} />} />
              ))}
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
