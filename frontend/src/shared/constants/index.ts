// Application constants

export const ROUTES = {
  DASHBOARD: '/',
  CAMPAIGNS: '/campaigns',
  TEMPLATES: '/templates',
  TEMPLATES_NEW: '/templates/new',
  TEMPLATES_EDIT: '/templates/:id',
  COMPOSE: '/compose',
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
  AI_PERSONALIZE: '/api/ai/personalize',
  AI_REWRITE: '/api/ai/rewrite',
  AI_SCORE: '/api/ai/score',
} as const
