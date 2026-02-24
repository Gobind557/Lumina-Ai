import { useState } from 'react'
import { campaignsApi, type CampaignStatus } from '../api/campaigns.api'

export function useUpdateCampaignStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateStatus = async (id: string, status: CampaignStatus) => {
    try {
      setLoading(true)
      setError(null)
      return await campaignsApi.updateStatus(id, status)
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update campaign status')
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}
