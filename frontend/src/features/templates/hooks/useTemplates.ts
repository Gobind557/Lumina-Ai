import { useState, useEffect } from 'react'
import { templatesApi } from '../api/templates.api'
import { getStoredTemplates, saveStoredTemplates } from '../data/templateStorage'
import type { TemplateCardData } from '../types'

export function useTemplates() {
  const [templates, setTemplates] = useState<TemplateCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true)
        // Try API first, fallback to localStorage
        try {
          const data = await templatesApi.getAll()
          setTemplates(data)
          saveStoredTemplates(data)
        } catch (apiError) {
          // Fallback to localStorage if API fails
          const stored = getStoredTemplates()
          setTemplates(stored)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load templates'))
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  return { templates, loading, error, refetch: () => {} }
}
