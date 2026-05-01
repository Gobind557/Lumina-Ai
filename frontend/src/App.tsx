import { BrowserRouter as Router } from 'react-router-dom'
import { QueryProvider } from './core/providers/QueryProvider'
import { AuthProvider } from './core/providers/AuthProvider'
import { AppRouter } from './core/router'

import { Toaster } from 'sonner'

function App() {
  return (
    <Router>
      <QueryProvider>
        <AuthProvider>
          <Toaster richColors position="top-right" />
          <AppRouter />
        </AuthProvider>
      </QueryProvider>
    </Router>
  )
}

export default App
