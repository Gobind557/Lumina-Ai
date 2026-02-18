import { useState } from 'react'
import { templatesApi } from '../api/templates.api'
import { addStoredTemplate } from '../data/templateStorage'
import type { TemplateCardData } from '../types'

export function useCreateTemplate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createTemplate = async (template: Omit<TemplateCardData, 'id'>) => {
    try {
      setLoading(true)
      setError(null)
      
      const newTemplate: TemplateCardData = {
        ...template,
        id: crypto.randomUUID(),
      }

      // Try API first, fallback to localStorage
      try {
        const created = await templatesApi.create(template)
        addStoredTemplate(created)
        return created
      } catch (apiError) {
        // Fallback to localStorage if API fails
        addStoredTemplate(newTemplate)
        return newTemplate
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create template')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { createTemplate, loading, error }
}
