// Application constants

/** Backend API base: full origin (e.g. https://lumina-ai-j6xx.onrender.com) or /api for same-origin. */
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

/** Full URL for Google OAuth — must hit backend /api/auth/google. Pass state=login or state=signup. */
export const AUTH_GOOGLE_URL =
  API_BASE.startsWith('http')
    ? `${API_BASE}${API_BASE.endsWith('/api') ? '' : '/api'}/auth/google`
    : `${API_BASE}/auth/google`

export const AUTH_GOOGLE_LOGIN_URL = `${AUTH_GOOGLE_URL}${AUTH_GOOGLE_URL.includes('?') ? '&' : '?'}state=login`
export const AUTH_GOOGLE_SIGNUP_URL = `${AUTH_GOOGLE_URL}${AUTH_GOOGLE_URL.includes('?') ? '&' : '?'}state=signup`
/** Full URL for LinkedIn OAuth. */
export const AUTH_LINKEDIN_URL =
  API_BASE.startsWith('http')
    ? `${API_BASE}${API_BASE.endsWith('/api') ? '' : '/api'}/auth/linkedin`
    : `${API_BASE}/auth/linkedin`

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/',
  CAMPAIGNS: '/campaigns',
  CAMPAIGNS_NEW: '/campaigns/new',
  CAMPAIGNS_VIEW: '/campaigns/:id',
  TEMPLATES: '/templates',
  TEMPLATES_NEW: '/templates/new',
  TEMPLATES_EDIT: '/templates/:id',
  COMPOSE: '/compose',
  PROSPECTS: '/prospects',
} as const

export const EMAIL_STATUS = {
  PENDING_SEND: 'PENDING_SEND',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
} as const

export const SPAM_SCORE_THRESHOLDS = {
  LOW: 3,
  MEDIUM: 6,
  HIGH: 10,
} as const

export const API_ENDPOINTS = {
  DRAFTS: '/api/emails/draft',
  EMAILS: '/api/emails',
  PROSPECTS: '/api/prospects',
  TEMPLATES: '/api/templates',
  AI_PERSONALIZE: '/api/ai/personalize',
  AI_REWRITE: '/api/ai/rewrite',
  AI_SCORE: '/api/ai/score',
} as const
