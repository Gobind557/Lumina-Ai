import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Layout } from './shared/components'
import { Dashboard } from './features/dashboard'
import { EmailComposer } from './features/email'
import { Campaigns, CreateCampaign, CampaignDetail } from './features/campaigns'
import { Templates, CreateTemplate, EditTemplate } from './features/templates'
import { ROUTES } from './shared/constants'
import { Login, Signup } from './features/auth'
import AuthCallback from './features/auth/pages/AuthCallback'

const AppShell = () => (
  <Layout>
    <Outlet />
  </Layout>
)

const hasAuthToken = () => {
  const token = localStorage.getItem('auth_token')
  if (!token?.trim()) return false

  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    const decoded = JSON.parse(json) as { exp?: number }
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('auth_token')
      return false
    }
  } catch {
    localStorage.removeItem('auth_token')
    return false
  }

  return true
}

const RequireAuth = () => {
  const location = useLocation()
  if (!hasAuthToken()) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <Outlet />
}

const PublicOnly = () => {
  if (hasAuthToken()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
        </Route>
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.COMPOSE} element={<EmailComposer />} />
            <Route path={ROUTES.CAMPAIGNS} element={<Campaigns />} />
            <Route path={ROUTES.CAMPAIGNS_NEW} element={<CreateCampaign />} />
            <Route path={ROUTES.CAMPAIGNS_VIEW} element={<CampaignDetail />} />
            <Route path={ROUTES.TEMPLATES} element={<Templates />} />
            <Route path={ROUTES.TEMPLATES_NEW} element={<CreateTemplate />} />
            <Route path={ROUTES.TEMPLATES_EDIT} element={<EditTemplate />} />
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
