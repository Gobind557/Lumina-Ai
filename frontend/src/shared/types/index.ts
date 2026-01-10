// Common types shared across the application

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface Prospect {
  id: string
  name: string
  email: string
  title?: string
  company?: string
  location?: string
  avatar?: string
}

export interface Company {
  id: string
  name: string
  domain?: string
  techStack?: string[]
  location?: string
}

export interface EmailDraft {
  id: string
  subject: string
  content: string
  prospectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Email {
  id: string
  subject: string
  content: string
  prospectId: string
  status: 'PENDING_SEND' | 'SENT' | 'FAILED' | 'BOUNCED'
  sentAt?: Date
  createdAt: Date
}

export interface SpamScore {
  score: number
  maxScore: number
  status: 'SAFE' | 'REVIEW' | 'HIGH_RISK'
  details?: string[]
}

export interface AISuggestion {
  id: string
  type: 'personalization' | 'rewrite' | 'subject'
  content: string
  confidence: number
  createdAt: Date
}
