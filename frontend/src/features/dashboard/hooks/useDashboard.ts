import { useState, useEffect } from 'react'
import { dashboardApi, type DashboardStats, type TimelineData, type MomentumData, type CampaignSummary } from '../api/dashboard.api'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dashboard stats'))
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, refetch: () => {} }
}

export function useDashboardTimeline(days: number = 7) {
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getTimeline(days)
        setTimeline(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load timeline'))
      } finally {
        setLoading(false)
      }
    }

    loadTimeline()
    const interval = setInterval(loadTimeline, 30000)
    return () => clearInterval(interval)
  }, [days])

  return { timeline, loading, error }
}

export function useDashboardMomentum() {
  const [momentum, setMomentum] = useState<MomentumData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadMomentum = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getMomentum()
        setMomentum(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load momentum'))
      } finally {
        setLoading(false)
      }
    }

    loadMomentum()
    // Refresh every 15 seconds for real-time feel
    const interval = setInterval(loadMomentum, 15000)
    return () => clearInterval(interval)
  }, [])

  return { momentum, loading, error }
}

export function useDashboardCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getCampaigns()
        setCampaigns(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load campaigns'))
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
    const interval = setInterval(loadCampaigns, 30000)
    return () => clearInterval(interval)
  }, [])

  return { campaigns, loading, error }
}
