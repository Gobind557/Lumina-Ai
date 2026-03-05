import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

export function useCampaignProspects(campaignId: string | undefined, enabled = true, refetchInterval?: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaignProspects', campaignId],
    queryFn: () => campaignsApi.getProspects(campaignId!),
    enabled: Boolean(campaignId) && enabled,
    refetchInterval: refetchInterval ?? false,
  })
  return {
    prospects: data ?? [],
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
