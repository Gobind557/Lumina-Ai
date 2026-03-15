import { apiRequest } from '../../../shared/api/client'
import type { TemplateCardData } from '../types'

const API_PREFIX = '/api'

export const templatesApi = {
  getAll: async (): Promise<TemplateCardData[]> => {
    return apiRequest<TemplateCardData[]>(`${API_PREFIX}/templates`)
  },

  getById: async (id: string): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_PREFIX}/templates/${id}`)
  },

  create: async (template: Omit<TemplateCardData, 'id'>): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_PREFIX}/templates`, {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  update: async (id: string, updates: Partial<TemplateCardData>): Promise<TemplateCardData> => {
    return apiRequest<TemplateCardData>(`${API_PREFIX}/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${API_PREFIX}/templates/${id}`, {
      method: 'DELETE',
    })
  },
}
