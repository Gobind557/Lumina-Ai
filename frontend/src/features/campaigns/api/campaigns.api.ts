import { apiRequest } from '../../../shared/api/client'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'

export interface CampaignMetrics {
  opens: number
  replies: number
  openRate: number
  replyRate: number
  sentCount: number
}

export interface Campaign {
  id: string
  userId: string
  workspaceId: string | null
  name: string
  description: string | null
  status: CampaignStatus
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  _count?: { emails: number }
  emails?: Array<{
    id: string
    status: string
    sentAt: string | null
    subject: string
    toEmail: string
  }>
  metrics?: CampaignMetrics
}

export type CampaignProspectStatus = 'ACTIVE' | 'REPLIED'

export interface CampaignProspectItem {
  prospectId: string
  name: string
  email: string
  company: string
  status: CampaignProspectStatus
  currentStep: number
}

export interface ListCampaignsResponse {
  total: number
  campaigns: Campaign[]
}

export const campaignsApi = {
  list: async (params?: { status?: CampaignStatus; limit?: number; offset?: number }): Promise<ListCampaignsResponse> => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.offset != null) search.set('offset', String(params.offset))
    const qs = search.toString()
    return apiRequest<ListCampaignsResponse>(`${API_BASE}/campaigns${qs ? `?${qs}` : ''}`)
  },

  getById: async (id: string): Promise<Campaign> => {
    return apiRequest<Campaign>(`${API_BASE}/campaigns/${id}`)
  },

  getProspects: async (campaignId: string): Promise<CampaignProspectItem[]> => {
    return apiRequest<CampaignProspectItem[]>(`${API_BASE}/campaigns/${campaignId}/prospects`)
  },

  create: async (payload: {
    name: string
    description?: string | null
    startDate?: string | null
    endDate?: string | null
    workspaceId?: string | null
    prospectIds?: string[]
  }): Promise<Campaign> => {
    return apiRequest<Campaign>(`${API_BASE}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateStatus: async (id: string, status: CampaignStatus): Promise<Campaign> => {
    return apiRequest<Campaign>(`${API_BASE}/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}
