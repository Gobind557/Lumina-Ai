import { useState } from 'react'
import { campaignsApi } from '../api/campaigns.api'

export function useCreateCampaign() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCampaign = async (payload: {
    name: string
    description?: string | null
    startDate?: string | null
    endDate?: string | null
  }) => {
    try {
      setLoading(true)
      setError(null)
      return await campaignsApi.create(payload)
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create campaign')
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { createCampaign, loading, error }
}
