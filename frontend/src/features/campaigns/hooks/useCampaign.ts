import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

export function useCampaign(id: string | undefined, enabled = true, refetchInterval?: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getById(id!),
    enabled: Boolean(id) && enabled,
    refetchInterval: refetchInterval ?? false,
  })
  return {
    campaign: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
