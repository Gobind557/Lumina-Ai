import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

export function useCampaign(id: string | undefined, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getById(id!),
    enabled: Boolean(id) && enabled,
  })
  return {
    campaign: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
