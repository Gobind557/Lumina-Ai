import { apiRequest } from '../../../shared/api/client'

/** All backend routes are under /api; client prepends origin when VITE_API_URL is set. */
const API_PREFIX = '/api'

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

export interface BestTimeData {
  bestDayOfWeek: number
  bestHour: number
  liftPercent: number
  sampleSize: number
}

export interface NextAction {
  prospectId: string | null
  name: string
  action: string
  actionType: "follow-up" | "call" | "personalization"
  probability?: number
  actionLabel: string
  buttonLabel?: string
  reasoning?: string
}

export interface NextActionsData {
  actions: NextAction[]
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>(`${API_PREFIX}/dashboard/stats`)
  },

  getTimeline: async (days: number = 7): Promise<TimelineData> => {
    return apiRequest<TimelineData>(`${API_PREFIX}/dashboard/timeline?days=${days}`)
  },

  getMomentum: async (): Promise<MomentumData> => {
    return apiRequest<MomentumData>(`${API_PREFIX}/dashboard/momentum`)
  },

  getCampaigns: async (): Promise<CampaignSummary[]> => {
    return apiRequest<CampaignSummary[]>(`${API_PREFIX}/dashboard/campaigns`)
  },

  getBestTime: async (): Promise<BestTimeData> => {
    return apiRequest<BestTimeData>(`${API_PREFIX}/dashboard/best-time`)
  },

  getNextActions: async (): Promise<NextActionsData> => {
    return apiRequest<NextActionsData>(`${API_PREFIX}/dashboard/next-actions`)
  },
}
