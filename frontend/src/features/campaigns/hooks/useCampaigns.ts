import { useQuery } from '@tanstack/react-query'
import { campaignsApi, type CampaignStatus } from '../api/campaigns.api'

export function useCampaigns(params?: { status?: CampaignStatus }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns', params?.status],
    queryFn: () => campaignsApi.list({ status: params?.status, limit: 100 }),
  })
  return {
    campaigns: data?.campaigns ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error ?? null,
    refetch,
  }
}
