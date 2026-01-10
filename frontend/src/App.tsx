import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './shared/components'
import { Dashboard } from './features/dashboard'
import { EmailComposer } from './features/email'
import { Campaigns } from './features/campaigns'
import { Templates } from './features/templates'
import { ROUTES } from './shared/constants'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.COMPOSE} element={<EmailComposer />} />
          <Route path={ROUTES.CAMPAIGNS} element={<Campaigns />} />
          <Route path={ROUTES.TEMPLATES} element={<Templates />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
