import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

export function useCampaignActivities(
  campaignId: string | undefined,
  enabled = true,
  refetchInterval?: number
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', campaignId, 'activities'],
    queryFn: () => campaignsApi.getActivities(campaignId!, 50),
    enabled: Boolean(campaignId) && enabled,
    refetchInterval: refetchInterval ?? false,
  })
  return {
    activities: data?.activities ?? [],
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
