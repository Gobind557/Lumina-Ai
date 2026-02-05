import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

export default function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('auth_token', token)
    }
    navigate(ROUTES.DASHBOARD, { replace: true })
  }, [location.search, navigate])

  return (
    <div className="auth-page relative flex items-center justify-center p-6">
      <div className="auth-orb auth-orb-purple" />
      <div className="auth-orb auth-orb-blue" />
      <div className="auth-rings" />
      <div className="auth-card px-8 py-10">
        <div className="text-center text-slate-600">Completing sign in…</div>
      </div>
    </div>
  )
}
