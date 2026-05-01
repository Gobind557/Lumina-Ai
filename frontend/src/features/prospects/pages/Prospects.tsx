import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreHorizontal,
  X,
  Users,
  Activity,
  Clock,
  Reply,
  Filter,
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
import { Button, Panel, Surface, TextInput, cx, uiTokens, Skeleton } from '../components/ui'

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
          <div className="shrink-0 px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <TextInput
                  inputRef={searchInputRef}
                  type="search"
                  placeholder="Search prospects…"
                  value={searchInput}
                  onChange={(v) => {
                    if (document.activeElement !== searchInputRef.current) return
                    handleSearchChange(v)
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    onClick={() => setFilterOpen((o) => !o)}
                    variant="secondary"
                    className="rounded-xl"
                  >
                    Filter <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>
                  {filterOpen ? (
                    <div
                      className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ background: 'white', borderColor: uiTokens.border }}
                    >
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <Activity className="w-3 h-3" /> Status
                          </div>
                          <div className="space-y-1">
                            {STATUS_OPTIONS.map(status => (
                              <button
                                key={status}
                                onClick={() => toggleStatusFilter(status)}
                                className={cx(
                                  "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors",
                                  activeFilters.status.includes(status) ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                {status}
                                {activeFilters.status.includes(status) && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <Calendar className="w-3 h-3" /> Last Activity
                          </div>
                          <div className="space-y-1">
                            {[
                              { id: 'today', label: 'Last 24 hours' },
                              { id: 'week', label: 'Last 7 days' },
                              { id: 'month', label: 'Last 30 days' },
                            ].map(time => (
                              <button
                                key={time.id}
                                onClick={() => setActiveFilters(prev => ({ ...prev, time: prev.time === time.id ? null : time.id }))}
                                className={cx(
                                  "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors",
                                  activeFilters.time === time.id ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
                                )}
                              >
                                {time.label}
                                {activeFilters.time === time.id && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 border-t bg-slate-50 flex justify-between items-center" style={{ borderColor: uiTokens.border }}>
                        <Button 
                          variant="ghost" 
                          className="text-xs h-8"
                          onClick={() => setActiveFilters({ status: [], time: null })}
                        >
                          Reset
                        </Button>
                        <Button 
                          variant="primary" 
                          className="text-xs h-8 px-4"
                          onClick={() => setFilterOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Button variant="secondary" onClick={() => {}} className="rounded-xl">
                  <Download className="h-4 w-4 text-slate-500" />
                  Import CSV
                </Button>

                {!sidebarOpen ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSidebarOpen(true)
                      setTimeout(() => addNameRef.current?.focus(), 0)
                    }}
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                    + Add Prospect
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="shrink-0 px-6 pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Prospects" value={total} icon={<Users className="h-4 w-4" />} />
              <StatCard label="Active" value={counts.active} icon={<Activity className="h-4 w-4" />} />
              <StatCard label="Pending" value={counts.pending} icon={<Clock className="h-4 w-4" />} />
              <StatCard label="Replied" value={counts.replied} icon={<Reply className="h-4 w-4" />} />
            </div>
          </div>

          {/* Table (card rows) */}
          <div className="flex-1 min-h-0 overflow-auto px-6 pt-5 pb-6">
            {error ? (
              <Panel className="p-4 text-sm text-amber-700">
                <div className="flex items-center justify-between gap-3">
                  <span>{error.message}</span>
                  <Button variant="secondary" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              </Panel>
            ) : null}

            <Surface className="mt-3 overflow-visible">
              <div
                className="grid grid-cols-[40px_1.6fr_1fr_0.8fr_0.9fr_40px] items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-600"
                style={{ borderBottom: `1px solid ${uiTokens.border}` }}
              >
                <label className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={visibleProspects.length > 0 && selectedIds.size === visibleProspects.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
                  />
                </label>
                <button type="button" className="flex items-center gap-1 text-left">
                  Prospect <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button type="button" className="flex items-center gap-1 text-left">
                  Company <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button type="button" className="flex items-center gap-1 text-left">
                  Status <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button type="button" className="flex items-center gap-1 text-left">
                  Last action <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <span />
              </div>

              <div className="p-2">
                {loading ? (
                  <div className="space-y-3 p-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="grid grid-cols-[40px_1.6fr_1fr_0.8fr_0.9fr_40px] items-center gap-2 rounded-2xl border px-4 py-4" style={{ borderColor: uiTokens.border }}>
                        <div className="flex justify-center"><Skeleton className="h-4 w-4" /></div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : visibleProspects.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No prospects yet. Add or import to get started.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Create your first prospect from the panel on the right.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleProspects.map(({ prospect: p, status }) => {
                      const name = getFullName(p)
                      return (
                        <div
                          key={p.id}
                          className={cx(
                            'grid grid-cols-[40px_1.6fr_1fr_0.8fr_0.9fr_40px] items-center gap-2 rounded-2xl border px-4 py-4',
                            'transition-colors',
                            'bg-white/70 hover:bg-white',
                          )}
                          style={{ borderColor: uiTokens.border }}
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500/30"
                            />
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-full border border-slate-200/70 bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-sm font-semibold text-white shadow-md shadow-indigo-500/20">
                              {getInitials(p)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
                              <div className="truncate text-xs text-slate-500">{p.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                              <div className="truncate text-sm text-slate-800">{p.company || '—'}</div>
                              <div className="truncate text-xs text-slate-500">{p.job_title || '—'}</div>
                            </div>
                          </div>

                          <div>
                            <StatusBadge status={status} />
                          </div>

                          <div className="text-sm text-slate-600">{formatLastAction(p.updated_at)}</div>

                          <div className="relative flex justify-end">
                            <Button
                              variant="ghost"
                              className="h-9 w-9 px-0"
                              onClick={() =>
                                setRowMenuOpenId((current) => (current === p.id ? null : p.id))
                              }
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {rowMenuOpenId === p.id ? (
                              <div
                                className="absolute right-0 top-full mt-1 w-44 overflow-hidden rounded-2xl border shadow-lg z-50"
                                style={{ background: uiTokens.panel, borderColor: uiTokens.border }}
                              >
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-white"
                                  onClick={() => {
                                    setEditProspect(p)
                                    setRowMenuOpenId(null)
                                  }}
                                >
                                  Edit prospect
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-white"
                                  onClick={() => {
                                    setDetailsProspect(p)
                                    setRowMenuOpenId(null)
                                  }}
                                >
                                  View details
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Surface>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {start}-{end} of {total}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="h-9 w-9 px-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                  const p = page < 3 ? i : page - 2 + i
                  if (p >= totalPages) return null
                  const active = p === page
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cx(
                        'min-w-[2.25rem] h-9 rounded-xl text-sm font-medium transition-colors border',
                        active
                          ? 'bg-[#7c3aed]/10 text-[#6d28d9] border-[#7c3aed]/25'
                          : 'bg-white/70 text-slate-700 border-slate-200/70 hover:bg-white',
                      )}
                    >
                      {p + 1}
                    </button>
                  )
                })}
                <Button
                  variant="secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="h-9 w-9 px-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="h-9 w-9 px-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        {sidebarOpen ? (
          <aside className="w-[360px] shrink-0 border-l" style={{ borderColor: uiTokens.border }}>
            <div className="h-full overflow-y-auto p-6 space-y-5">
              <Panel className="overflow-hidden">
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

              <Panel className="overflow-hidden">
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
