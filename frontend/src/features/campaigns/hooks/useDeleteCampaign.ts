import { useState } from 'react'
import { campaignsApi } from '../api/campaigns.api'

export function useDeleteCampaign() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteCampaign = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await campaignsApi.delete(id)
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to delete campaign')
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { deleteCampaign, loading, error }
}
