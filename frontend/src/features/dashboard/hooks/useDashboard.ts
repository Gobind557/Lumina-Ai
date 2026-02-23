import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type DashboardStats, type TimelineData, type MomentumData, type CampaignSummary } from '../api/dashboard.api'

const REFETCH_STATS_MS = 30_000
const REFETCH_MOMENTUM_MS = 15_000

export function useDashboardStats() {
  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: REFETCH_STATS_MS,
  })
  return { stats: stats ?? null, loading, error: error ?? null, refetch }
}

export function useDashboardTimeline(days: number = 7) {
  const { data: timeline, isLoading: loading, error } = useQuery({
    queryKey: ['dashboard', 'timeline', days],
    queryFn: () => dashboardApi.getTimeline(days),
    refetchInterval: REFETCH_STATS_MS,
  })
  return { timeline: timeline ?? null, loading, error: error ?? null }
}

export function useDashboardMomentum() {
  const { data: momentum, isLoading: loading, error } = useQuery({
    queryKey: ['dashboard', 'momentum'],
    queryFn: () => dashboardApi.getMomentum(),
    refetchInterval: REFETCH_MOMENTUM_MS,
  })
  return { momentum: momentum ?? null, loading, error: error ?? null }
}

export function useDashboardCampaigns() {
  const { data: campaigns = [], isLoading: loading, error } = useQuery({
    queryKey: ['dashboard', 'campaigns'],
    queryFn: () => dashboardApi.getCampaigns(),
    refetchInterval: REFETCH_STATS_MS,
  })
  return { campaigns, loading, error: error ?? null }
}
