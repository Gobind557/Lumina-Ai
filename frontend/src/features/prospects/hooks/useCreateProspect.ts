import { useState, useCallback } from 'react'
import { prospectsApi, type ProspectApi } from '../api/prospects.api'

export function useCreateProspect(onSuccess?: (prospect: ProspectApi) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(
    async (payload: {
      email: string
      first_name?: string | null
      last_name?: string | null
      company?: string | null
      job_title?: string | null
    }) => {
      setLoading(true)
      setError(null)
      try {
        const prospect = await prospectsApi.create(payload)
        onSuccess?.(prospect)
        return prospect
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Failed to create prospect')
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return { create, loading, error }
}
