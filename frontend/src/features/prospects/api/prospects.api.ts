import { apiRequest } from '../../../shared/api/client'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface ProspectApi {
  id: string
  workspace_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  job_title: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ListProspectsResponse {
  prospects: ProspectApi[]
  pagination: { total: number; limit: number; offset: number }
}

export const prospectsApi = {
  list: async (params?: {
    search?: string
    limit?: number
    offset?: number
  }): Promise<ListProspectsResponse> => {
    const search = new URLSearchParams()
    if (params?.search) search.set('search', params.search)
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.offset != null) search.set('offset', String(params.offset))
    const qs = search.toString()
    return apiRequest<ListProspectsResponse>(`${API_BASE}/prospects${qs ? `?${qs}` : ''}`)
  },

  getById: async (id: string): Promise<ProspectApi> => {
    return apiRequest<ProspectApi>(`${API_BASE}/prospects/${id}`)
  },

  create: async (payload: {
    email: string
    first_name?: string | null
    last_name?: string | null
    company?: string | null
    job_title?: string | null
    custom_fields?: Record<string, unknown>
  }): Promise<ProspectApi> => {
    return apiRequest<ProspectApi>(`${API_BASE}/prospects`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update: async (
    id: string,
    payload: Partial<{
      email: string
      first_name: string | null
      last_name: string | null
      company: string | null
      job_title: string | null
      custom_fields: Record<string, unknown>
    }>
  ): Promise<ProspectApi> => {
    return apiRequest<ProspectApi>(`${API_BASE}/prospects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${API_BASE}/prospects/${id}`, { method: 'DELETE' })
  },
}
