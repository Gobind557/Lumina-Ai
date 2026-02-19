import { apiRequest } from '../../../shared/api/client'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface DashboardStats {
  emails: {
    total: number
    today: number
    thisWeek: number
  }
  engagement: {
    opens: { total: number; today: number }
    replies: { total: number; today: number }
    openRate: number
    replyRate: number
  }
  campaigns: {
    active: number
  }
}

export interface TimelineData {
  emails: Array<{
    id: string
    sentAt: Date | null
    subject: string
    toEmail: string
    prospectName: string
  }>
  timeline: Array<{
    day: string
    date: string
    opens: number
    replies: number
  }>
}

export interface MomentumData {
  opens: Array<{
    id: string
    emailId: string
    prospectName: string
    activity: string
    time: string
    minutesAgo: number
    isHot: boolean
  }>
  replies: Array<{
    id: string
    emailId: string
    prospectName: string
    activity: string
    time: string
    minutesAgo: number
    isHot: boolean
  }>
}

export interface CampaignSummary {
  id: string
  name: string
  status: string
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  metrics: {
    opens: number
    replies: number
    openRate: number
    replyRate: number
    sentCount: number
  }
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>(`${API_BASE}/dashboard/stats`)
  },

  getTimeline: async (days: number = 7): Promise<TimelineData> => {
    return apiRequest<TimelineData>(`${API_BASE}/dashboard/timeline?days=${days}`)
  },

  getMomentum: async (): Promise<MomentumData> => {
    return apiRequest<MomentumData>(`${API_BASE}/dashboard/momentum`)
  },

  getCampaigns: async (): Promise<CampaignSummary[]> => {
    return apiRequest<CampaignSummary[]>(`${API_BASE}/dashboard/campaigns`)
  },
}
