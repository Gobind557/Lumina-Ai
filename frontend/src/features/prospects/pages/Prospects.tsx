import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Users,
  Activity,
  Clock,
  Reply,
  Check,
  Calendar,
} from 'lucide-react'
import type { ProspectApi } from '../api/prospects.api'
import { useProspects } from '../hooks/useProspects'
import { useCreateProspect } from '../hooks/useCreateProspect'
import { useUpdateProspect } from '../hooks/useUpdateProspect'
import { StatCard } from '../components/StatCard'
import { StatusBadge, type ProspectStatus } from '../components/StatusBadge'
import { TagChip } from '../components/TagChip'
import { Button, Panel, TextInput, cx, uiTokens, Skeleton } from '../components/ui'

const STATUS_OPTIONS = ['Active', 'Pending', 'Replied'] as const
const TAGS = [
  { id: 'hot', label: 'Hot Leads', count: 32, variant: 'red' as const },
  { id: 'ent', label: 'Enterprise', count: 18, variant: 'purple' as const },
  { id: 'startup', label: 'Startup', count: 45, variant: 'purple' as const },
]

// Derive display fields from API prospect (backend may not have status/sequence/step yet)
function getDisplayStatus(index: number): (typeof STATUS_OPTIONS)[number] {
  return STATUS_OPTIONS[index % STATUS_OPTIONS.length]
}

function formatLastAction(updatedAt: string): string {
  const date = new Date(updatedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 60) return mins <= 1 ? '1 min ago' : `${mins} mins ago`
  if (hours < 24) return hours === 1 ? '1 hr ago' : `${hours} hrs ago`
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return '1 week ago'
}

function getInitials(p: ProspectApi): string {
  const first = p.first_name?.trim().charAt(0) ?? ''
  const last = p.last_name?.trim().charAt(0) ?? ''
  if (first || last) return (first + last).toUpperCase()
  return (p.email?.slice(0, 2) ?? '??').toUpperCase()
}

function getFullName(p: ProspectApi): string {
  const parts = [p.first_name, p.last_name].filter(Boolean)
  return parts.length ? parts.join(' ') : p.email
}

const SEARCH_DEBOUNCE_MS = 300

export default function Prospects() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addNameRef = useRef<HTMLInputElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null)
  const [detailsProspect, setDetailsProspect] = useState<ProspectApi | null>(null)
  const [editProspect, setEditProspect] = useState<ProspectApi | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    jobTitle: '',
  })
  const [addForm, setAddForm] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    jobTitle: '',
  })

  const {
    prospects,
    total,
    page,
    pageSize,
    setPage,
    setSearch,
    loading,
    error,
    refetch,
    resetToFirstPage,
  } = useProspects()
  
  const [activeFilters, setActiveFilters] = useState<{
    status: string[];
    time: string | null;
  }>({
    status: [],
    time: null
  })

  const toggleStatusFilter = (status: string) => {
    setActiveFilters(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const { create, loading: creating, error: createError } = useCreateProspect(() => {
    setAddForm({ fullName: '', workEmail: '', company: '', jobTitle: '' })
    refetch()
  })

  const { update, loading: updating, error: updateError } = useUpdateProspect(() => {
    setEditProspect(null)
    refetch()
  })

  useEffect(() => {
    if (!editProspect) return
    const fullName = [editProspect.first_name, editProspect.last_name].filter(Boolean).join(' ')
    setEditForm({
      fullName,
      workEmail: editProspect.email,
      company: editProspect.company ?? '',
      jobTitle: editProspect.job_title ?? '',
    })
  }, [editProspect])

  const handleSaveEdit = useCallback(async () => {
    if (!editProspect) return
    const [first, ...rest] = editForm.fullName.trim().split(/\s+/)
    const last = rest.join(' ') || undefined
    if (!editForm.workEmail.trim()) return
    await update(editProspect.id, {
      email: editForm.workEmail.trim(),
      first_name: first || null,
      last_name: last || null,
      company: editForm.company.trim() || null,
      job_title: editForm.jobTitle.trim() || null,
    })
  }, [editProspect, editForm, update])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      resetToFirstPage()
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => setSearch(value), SEARCH_DEBOUNCE_MS)
    },
    [setSearch, resetToFirstPage],
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)

  const prospectsWithStatus = prospects.map((p, i) => ({
    prospect: p,
    status: getDisplayStatus(i) as ProspectStatus,
  }))

  const visibleProspects = prospectsWithStatus.filter(({ prospect, status }) => {
    // Tag filtering
    if (activeTag) {
      if (activeTag === 'hot' && status !== 'Active') return false
      if (activeTag === 'ent' && (prospect.company ?? '').length < 12) return false
      if (activeTag === 'startup' && !((prospect.company ?? '').length > 0 && (prospect.company ?? '').length < 12)) return false
    }

    // Status filtering
    if (activeFilters.status.length > 0 && !activeFilters.status.includes(status)) return false

    // Time filtering (simplified for local demo)
    if (activeFilters.time) {
      const date = new Date(prospect.updated_at)
      const now = new Date()
      const diffDays = (now.getTime() - date.getTime()) / 86400000
      if (activeFilters.time === 'today' && diffDays > 1) return false
      if (activeFilters.time === 'week' && diffDays > 7) return false
    }

    return true
  })

  const counts = visibleProspects.reduce(
    (acc, p) => {
      acc.total += 1
      if (p.status === 'Active') acc.active += 1
      if (p.status === 'Pending') acc.pending += 1
      if (p.status === 'Replied') acc.replied += 1
      return acc
    },
    { total: 0, active: 0, pending: 0, replied: 0 },
  )

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === visibleProspects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleProspects.map((p) => p.prospect.id)))
    }
  }, [visibleProspects, selectedIds.size])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSaveProspect = useCallback(async () => {
    const [first, ...rest] = addForm.fullName.trim().split(/\s+/)
    const last = rest.join(' ') || undefined
    if (!addForm.workEmail.trim()) return
    await create({
      email: addForm.workEmail.trim(),
      first_name: first || undefined,
      last_name: last,
      company: addForm.company.trim() || undefined,
      job_title: addForm.jobTitle.trim() || undefined,
    })
  }, [addForm, create])

  return (
    <div className="flex h-full min-h-0 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Top control bar */}
          <div className="shrink-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search prospects by name, email or company…"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[20px] pl-11 pr-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    className="w-full md:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-white/70 hover:bg-white border border-slate-200/60 rounded-[20px] text-sm font-semibold text-slate-600 transition-all shadow-sm active:scale-95"
                  >
                    Filter <ChevronDown className={cx("h-4 w-4 text-slate-400 transition-transform duration-300", filterOpen && "rotate-180")} />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[24px] border border-white/60 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      <div className="p-5 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Activity className="w-3.5 h-3.5" /> Status
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {STATUS_OPTIONS.map(status => (
                              <button
                                key={status}
                                onClick={() => toggleStatusFilter(status)}
                                className={cx(
                                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                                  activeFilters.status.includes(status) 
                                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                                )}
                              >
                                {status}
                                {activeFilters.status.includes(status) && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" /> Last Activity
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {[
                              { id: 'today', label: 'Last 24 hours' },
                              { id: 'week', label: 'Last 7 days' },
                              { id: 'month', label: 'Last 30 days' },
                            ].map(time => (
                              <button
                                key={time.id}
                                onClick={() => setActiveFilters(prev => ({ ...prev, time: prev.time === time.id ? null : time.id }))}
                                className={cx(
                                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                                  activeFilters.time === time.id 
                                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                                )}
                              >
                                {time.label}
                                {activeFilters.time === time.id && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <button 
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setActiveFilters({ status: [], time: null })}
                        >
                          Reset Filters
                        </button>
                        <button 
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
                          onClick={() => setFilterOpen(false)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-3 bg-white/70 hover:bg-white border border-slate-200/60 rounded-[20px] text-sm font-semibold text-slate-600 transition-all shadow-sm active:scale-95"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                  Import
                </button>

                {!sidebarOpen && (
                  <button
                    onClick={() => {
                      setSidebarOpen(true)
                      setTimeout(() => addNameRef.current?.focus(), 0)
                    }}
                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-[20px] text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" /> Add Prospect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="shrink-0 px-4 lg:px-8 pt-6 lg:pt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <StatCard label="Total" value={total} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Active" value={counts.active} icon={<Activity className="h-5 w-5" />} />
              <StatCard label="Pending" value={counts.pending} icon={<Clock className="h-5 w-5" />} />
              <StatCard label="Replied" value={counts.replied} icon={<Reply className="h-5 w-5" />} />
            </div>
          </div>

          {/* Table (card rows) */}
          <div className="flex-1 min-h-0 overflow-hidden px-4 lg:px-8 pt-6 lg:pt-8 pb-4 lg:pb-8 flex flex-col">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between text-sm text-red-600">
                <span className="font-medium">{error.message}</span>
                <button onClick={() => refetch()} className="font-bold underline">Retry</button>
              </div>
            )}

            <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[32px] overflow-hidden p-2 flex-1 flex flex-col min-h-0">
              <div className="overflow-x-auto min-h-0 flex-1">
                <div className="min-w-[800px]">
                  <div
                    className="grid grid-cols-[48px_1.6fr_1fr_0.8fr_0.9fr_48px] items-center gap-4 px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/50"
                  >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={visibleProspects.length > 0 && selectedIds.size === visibleProspects.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                </div>
                <button className="flex items-center gap-1.5 text-left hover:text-slate-600 transition-colors">
                  Prospect <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-1.5 text-left hover:text-slate-600 transition-colors">
                  Company <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-1.5 text-left hover:text-slate-600 transition-colors">
                  Status <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-1.5 text-left hover:text-slate-600 transition-colors">
                  Last Action <ChevronDown className="h-3 w-3" />
                </button>
                <span />
                  </div>

                  <div className="space-y-1 p-1 mt-1">
                    {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[48px_1.6fr_1fr_0.8fr_0.9fr_48px] items-center gap-4 rounded-2xl px-6 py-5 border border-transparent">
                      <div className="flex justify-center"><Skeleton className="h-4 w-4" /></div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-7 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-10 ml-auto rounded-full" />
                    </div>
                  ))
                ) : visibleProspects.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Users className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No prospects found</h3>
                    <p className="mt-1 text-sm text-slate-500 max-w-[280px]">
                      Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  visibleProspects.map(({ prospect: p, status }) => {
                    const name = getFullName(p)
                    return (
                      <div
                        key={p.id}
                        className={cx(
                          'grid grid-cols-[48px_1.6fr_1fr_0.8fr_0.9fr_48px] items-center gap-4 rounded-[20px] px-6 py-5',
                          'transition-all duration-300 border border-transparent',
                          'bg-white/0 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5',
                          selectedIds.has(p.id) && 'bg-indigo-50/30 border-indigo-100 shadow-sm'
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                          />
                        </div>

                        <div className="flex items-center gap-4 min-w-0">
                          <div className={cx(
                            "h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg relative overflow-hidden",
                            status === 'Active' ? 'bg-gradient-to-br from-indigo-500 to-violet-500' :
                            status === 'Replied' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                            'bg-gradient-to-br from-slate-400 to-slate-500'
                          )}>
                            <div className="absolute inset-0 bg-white/10" />
                            <span className="relative z-10">{getInitials(p)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-slate-900 leading-tight mb-0.5">{name}</div>
                            <div className="truncate text-[11px] font-medium text-slate-400">{p.email}</div>
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                            <span className="truncate text-sm font-semibold text-slate-700">{p.company || '—'}</span>
                          </div>
                          <span className="truncate text-[11px] font-medium text-slate-400 pl-5">{p.job_title || '—'}</span>
                        </div>

                        <div>
                          <StatusBadge status={status} />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-600">{formatLastAction(p.updated_at)}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Last Activity</span>
                        </div>

                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setRowMenuOpenId((current) => (current === p.id ? null : p.id))}
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          {rowMenuOpenId === p.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                              <button
                                onClick={() => {
                                  setEditProspect(p)
                                  setRowMenuOpenId(null)
                                }}
                                className="w-full px-5 py-3 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                              >
                                Edit Prospect
                              </button>
                              <button
                                onClick={() => {
                                  setDetailsProspect(p)
                                  setRowMenuOpenId(null)
                                }}
                                className="w-full px-5 py-3 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                              >
                                View Detailed History
                              </button>
                              <div className="h-px bg-slate-100 mx-4" />
                              <button className="w-full px-5 py-3 text-left text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                                Delete Prospect
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between px-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {start}-{end} <span className="mx-1 text-slate-300">/</span> {total} Prospects
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="w-10 h-10 rounded-full border border-slate-200/60 bg-white/70 hover:bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100/50 rounded-2xl border border-slate-200/30">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page < 3 ? i : page - 2 + i
                    if (p >= totalPages) return null
                    const active = p === page
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cx(
                          'w-8 h-8 rounded-xl text-xs font-bold transition-all',
                          active
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                        )}
                      >
                        {p + 1}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="w-10 h-10 rounded-full border border-slate-200/60 bg-white/70 hover:bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        {sidebarOpen ? (
          <aside className="fixed inset-y-0 right-0 z-40 lg:z-auto lg:relative w-full lg:w-[360px] shrink-0 border-l bg-slate-50/95 lg:bg-transparent backdrop-blur-xl transition-all shadow-2xl lg:shadow-none" style={{ borderColor: uiTokens.border }}>
            <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-5">
              <Panel className="overflow-hidden bg-white/90 lg:bg-white shadow-xl lg:shadow-none">
                <div className="flex items-start justify-between gap-3 px-4 py-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Add Prospect</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Create a prospect to start sequences, track replies, and keep your pipeline tidy.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 px-0"
                    onClick={() => {
                      setSidebarOpen(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <TextInput
                    inputRef={addNameRef}
                    placeholder="Full name"
                    value={addForm.fullName}
                    onChange={(v) => setAddForm((f) => ({ ...f, fullName: v }))}
                  />
                  <TextInput
                    type="email"
                    placeholder="Work email"
                    value={addForm.workEmail}
                    onChange={(v) => setAddForm((f) => ({ ...f, workEmail: v }))}
                  />
                  <TextInput
                    placeholder="Company"
                    value={addForm.company}
                    onChange={(v) => setAddForm((f) => ({ ...f, company: v }))}
                  />
                  <TextInput
                    placeholder="Job title"
                    value={addForm.jobTitle}
                    onChange={(v) => setAddForm((f) => ({ ...f, jobTitle: v }))}
                  />

                  {createError ? <p className="text-xs text-red-600">{createError.message}</p> : null}

                  <Button
                    variant="primary"
                    onClick={handleSaveProspect}
                    disabled={creating || !addForm.workEmail.trim()}
                    className="w-full py-2.5"
                  >
                    {creating ? 'Saving…' : 'Save prospect'}
                  </Button>
                </div>
              </Panel>

              <Panel className="overflow-hidden bg-white/90 lg:bg-white shadow-xl lg:shadow-none">
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Tags</h3>
                    <p className="mt-1 text-xs text-slate-500">Click a tag to filter the list.</p>
                  </div>
                  {activeTag ? (
                    <Button variant="ghost" onClick={() => setActiveTag(null)} className="text-xs">
                      Clear
                    </Button>
                  ) : null}
                </div>
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <TagChip
                      key={tag.id}
                      label={tag.label}
                      count={tag.count}
                      tone={tag.variant === 'red' ? 'red' : 'purple'}
                      active={activeTag === tag.id}
                      onClick={() => setActiveTag((current) => (current === tag.id ? null : tag.id))}
                    />
                  ))}
                  <TagChip label="Add tag" tone="neutral" onClick={() => {}} />
                </div>
              </Panel>
            </div>
          </aside>
        ) : null}

        {/* View details modal */}
        {detailsProspect && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: 'rgba(15, 23, 42, 0.35)' }}
            onClick={() => setDetailsProspect(null)}
          >
            <div className="min-h-full w-full px-4 py-10 flex items-center justify-center">
              <div
                className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Prospect details</h3>
                  <button
                    type="button"
                    onClick={() => setDetailsProspect(null)}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <span className="text-slate-500">Name</span>
                    <p className="font-medium text-slate-900">
                      {getFullName(detailsProspect) || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email</span>
                    <p className="font-medium text-slate-900">{detailsProspect.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Company</span>
                    <p className="font-medium text-slate-900">{detailsProspect.company || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Job title</span>
                    <p className="font-medium text-slate-900">{detailsProspect.job_title || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Last updated</span>
                    <p className="font-medium text-slate-900">
                      {formatLastAction(detailsProspect.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-200/70 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditProspect(detailsProspect)
                      setDetailsProspect(null)
                    }}
                    className="w-full py-2 rounded-xl border border-slate-200/70 text-slate-800 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Edit prospect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit prospect modal */}
        {editProspect && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ background: 'rgba(15, 23, 42, 0.35)' }}
            onClick={() => setEditProspect(null)}
          >
            <div className="min-h-full w-full px-4 py-10 flex items-center justify-center">
              <div
                className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Edit prospect</h3>
                  <button
                    type="button"
                    onClick={() => setEditProspect(null)}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <TextInput
                    placeholder="Full name"
                    value={editForm.fullName}
                    onChange={(v) => setEditForm((f) => ({ ...f, fullName: v }))}
                  />
                  <TextInput
                    type="email"
                    placeholder="Work email"
                    value={editForm.workEmail}
                    onChange={(v) => setEditForm((f) => ({ ...f, workEmail: v }))}
                  />
                  <TextInput
                    placeholder="Company"
                    value={editForm.company}
                    onChange={(v) => setEditForm((f) => ({ ...f, company: v }))}
                  />
                  <TextInput
                    placeholder="Job title"
                    value={editForm.jobTitle}
                    onChange={(v) => setEditForm((f) => ({ ...f, jobTitle: v }))}
                  />
                  {updateError ? <p className="text-xs text-red-600">{updateError.message}</p> : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProspect(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200/70 text-slate-800 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      variant="primary"
                      onClick={handleSaveEdit}
                      disabled={updating || !editForm.workEmail.trim()}
                      className="flex-1 py-2.5"
                    >
                      {updating ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
