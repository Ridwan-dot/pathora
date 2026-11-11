import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import FocusLayout from './layouts/FocusLayout'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import ProfileOverview from './pages/profile/ProfileOverview'
import PersonalEdit from './pages/profile/PersonalEdit'
import Education from './pages/profile/Education'
import Skills from './pages/profile/Skills'
import ExperienceList from './pages/profile/ExperienceList'
import ExperienceForm from './pages/profile/ExperienceForm'
import EvidenceBuilder from './pages/EvidenceBuilder'
import Analyser from './pages/Analyser'
import CvHome from './pages/cv/CvHome'
import CvEditor from './pages/cv/CvEditor'
import CvPreview from './pages/cv/CvPreview'
import CvVersions from './pages/cv/CvVersions'
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
          <Route element={<FocusLayout skip />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
          <Route element={<FocusLayout backTo="/dashboard" backLabel="Overview" wide />}>
            <Route path="/analyse" element={<Analyser />} />
          </Route>
          <Route element={<FocusLayout backTo="/cv-studio" backLabel="CV Studio" wide />}>
            <Route path="/cv-studio/edit" element={<CvEditor />} />
            <Route path="/cv-studio/preview" element={<CvPreview />} />
            <Route path="/cv-studio/versions" element={<CvVersions />} />
          </Route>
          <Route element={<FocusLayout backTo="/profile" backLabel="Career profile" />}>
            <Route path="/profile/personal" element={<PersonalEdit />} />
            <Route path="/profile/education" element={<Education />} />
            <Route path="/profile/skills" element={<Skills />} />
            <Route path="/profile/experience" element={<ExperienceList />} />
            <Route path="/profile/experience/edit" element={<ExperienceForm />} />
            <Route path="/evidence" element={<EvidenceBuilder />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileOverview />} />
            <Route path="/cv-studio" element={<CvHome />} />
            {appNav
              .filter((item) => item.to !== '/dashboard' && item.to !== '/profile' && item.to !== '/analyse' && item.to !== '/cv-studio')
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
