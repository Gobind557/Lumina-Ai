import { apiRequest } from '../../../shared/api/client'
import type { TemplateCardData } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const templatesApi = {
  getAll: async (): Promise<TemplateCardData[]> => {
    return apiRequest<TemplateCardData[]>(`${API_BASE}/templates`)
  },

  getById: async (id: string): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_BASE}/templates/${id}`)
  },

  create: async (template: Omit<TemplateCardData, 'id'>): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_BASE}/templates`, {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  update: async (id: string, updates: Partial<TemplateCardData>): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_BASE}/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${API_BASE}/templates/${id}`, {
      method: 'DELETE',
    })
  },
}
