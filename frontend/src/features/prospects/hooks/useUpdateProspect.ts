import { useState, useCallback } from 'react'
import { prospectsApi, type ProspectApi } from '../api/prospects.api'

export function useUpdateProspect(onSuccess?: (prospect: ProspectApi) => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(
    async (
      id: string,
      payload: Partial<{
        email: string
        first_name: string | null
        last_name: string | null
        company: string | null
        job_title: string | null
      }>
    ) => {
      setLoading(true)
      setError(null)
      try {
        const prospect = await prospectsApi.update(id, payload)
        onSuccess?.(prospect)
        return prospect
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Failed to update prospect')
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  return { update, loading, error }
}
