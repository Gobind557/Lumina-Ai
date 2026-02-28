import { useState, useEffect, useCallback } from 'react'
import { prospectsApi, type ProspectApi } from '../api/prospects.api'

const PAGE_SIZE = 8

export function useProspects(initialSearch = '') {
  const [prospects, setProspects] = useState<ProspectApi[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await prospectsApi.list({
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      setProspects(res.prospects)
      setTotal(res.pagination.total)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load prospects'))
      setProspects([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  const refetch = useCallback(() => {
    fetchProspects()
  }, [fetchProspects])

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(0, p))
  }, [])

  const resetToFirstPage = useCallback(() => {
    setPage(0)
  }, [])

  return {
    prospects,
    total,
    page,
    pageSize: PAGE_SIZE,
    setPage: goToPage,
    setSearch,
    search,
    loading,
    error,
    refetch,
    resetToFirstPage,
  }
}
