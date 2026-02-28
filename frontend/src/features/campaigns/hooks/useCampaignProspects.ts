import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

export function useCampaignProspects(campaignId: string | undefined, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaignProspects', campaignId],
    queryFn: () => campaignsApi.getProspects(campaignId!),
    enabled: Boolean(campaignId) && enabled,
  })
  return {
    prospects: data ?? [],
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
