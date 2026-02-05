import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye } from 'lucide-react'
import { apiRequest } from '@/shared/utils'
import { API_ENDPOINTS, ROUTES } from '@/shared/constants'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await apiRequest<{ token: string }>(`/api/auth/login`, {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('auth_token', response.token)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      setError((err as Error).message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page relative flex items-center justify-center p-6">
      <div className="auth-orb auth-orb-purple" />
      <div className="auth-orb auth-orb-blue" />

      <div className="relative w-full max-w-md">
        <div className="auth-card px-8 py-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <svg
                width="140"
                height="40"
                viewBox="0 0 140 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Lumina logo"
              >
                <defs>
                  <linearGradient id="luminaGradientLogin" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                <g transform="translate(0,4)">
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="6"
                    transform="rotate(45 16 16)"
                    fill="url(#luminaGradientLogin)"
                  />
                  <path
                    d="M16 8L18.5 14.5L25 16L18.5 17.5L16 24L13.5 17.5L7 16L13.5 14.5L16 8Z"
                    fill="white"
                  />
                </g>
                <text
                  x="44"
                  y="26"
                  fontFamily="Inter, system-ui, -apple-system, sans-serif"
                  fontSize="20"
                  fontWeight="600"
                  fill="#0F172A"
                  letterSpacing="-0.02em"
                >
                  Lumina
                </text>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sign in to Lumina</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back! Enter your details to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Yourk email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-slate-200/70 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/80 border border-slate-200/70 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-colors disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">or</div>

          <div className="mt-4 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 border border-slate-200/70 bg-white/80 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-white transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 48 48"
                aria-label="Google"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.1 0 5.7 1.1 7.7 3.1l5.6-5.6C33.8 3.4 29.3 1.5 24 1.5 14.9 1.5 7 7.1 3.7 15.1l6.6 5.1C12.2 13.8 17.6 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.1 24.5c0-1.7-.2-3.3-.6-4.9H24v9.3h12.3c-.5 2.7-2 5-4.3 6.6l6.6 5.1c3.9-3.6 6.5-8.9 6.5-15.1z"
                />
                <path
                  fill="#4A90E2"
                  d="M10.3 28.8c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-6.6-5.1C2.4 17.7 1.7 20.8 1.7 24s.7 6.3 2 9.1l6.6-5.1z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 46.5c5.3 0 9.8-1.7 13.1-4.7l-6.6-5.1c-1.8 1.2-4.2 1.9-6.5 1.9-6.4 0-11.8-4.3-13.7-10.1l-6.6 5.1C7 41.5 14.9 46.5 24 46.5z"
                />
              </svg>
              Sign in with Google
            </button>
            <button className="w-full flex items-center justify-center gap-2 border border-slate-200/70 bg-white/80 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-white transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-label="LinkedIn"
              >
                <path
                  fill="#0A66C2"
                  d="M20.45 20.45H17.1v-5.4c0-1.3-.03-2.97-1.8-2.97-1.8 0-2.07 1.4-2.07 2.86v5.51H9.9V9h3.22v1.56h.05c.45-.85 1.55-1.75 3.2-1.75 3.43 0 4.06 2.26 4.06 5.2v6.44zM5.34 7.48a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88zM7 20.45H3.68V9H7v11.45zM22.22 2H1.78C.8 2 0 2.78 0 3.75v16.5C0 21.22.8 22 1.78 22h20.44c.98 0 1.78-.78 1.78-1.75V3.75C24 2.78 23.2 2 22.22 2z"
                />
              </svg>
              Sign up with Linkedin
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
