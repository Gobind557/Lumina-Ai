import { useState, useCallback, useEffect } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  Building2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react'
import type { ProspectApi } from '../api/prospects.api'
import { useProspects } from '../hooks/useProspects'
import { useCreateProspect } from '../hooks/useCreateProspect'

const PER_PAGE_OPTIONS = [8, 16, 24, 48]
const STATUS_OPTIONS = ['Active', 'Pending', 'Replied'] as const
const SEQUENCE_OPTIONS = ['Startup Cold Outreach', 'Enterprise Follow-up', 'Re-engagement']

// Derive display fields from API prospect (backend may not have status/sequence/step yet)
function getDisplayStatus(index: number): (typeof STATUS_OPTIONS)[number] {
  return STATUS_OPTIONS[index % STATUS_OPTIONS.length]
}

function getSequence(index: number): string {
  return SEQUENCE_OPTIONS[index % SEQUENCE_OPTIONS.length]
}

function getStep(index: number): string {
  const steps = ['Step: 1 Initial Email', 'Step: Follow-Up', 'Step: Breakup Email']
  return steps[index % steps.length]
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

const TAGS = [
  { id: 'hot', label: 'Hot Leads', count: 32, variant: 'red' as const },
  { id: 'ent', label: 'Enterprise', count: 18, variant: 'purple' as const },
  { id: 'startup', label: 'Startup', count: 45, variant: 'purple' as const },
]

export default function Prospects() {
  const [searchInput, setSearchInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    jobTitle: '',
    sequence: '',
  })

  const {
    prospects,
    total,
    page,
    pageSize,
    setPage,
    setSearch,
    search,
    loading,
    error,
    refetch,
    resetToFirstPage,
  } = useProspects(searchInput)

  const { create, loading: creating, error: createError } = useCreateProspect(() => {
    setAddForm({ fullName: '', workEmail: '', company: '', jobTitle: '', sequence: '' })
    refetch()
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput, setSearch])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === prospects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(prospects.map((p) => p.id)))
    }
  }, [prospects, selectedIds.size])

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
    <div className="flex flex-col h-full min-h-0 bg-[#f8f9fc]">
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Top action bar */}
          <div className="shrink-0 flex items-center gap-3 p-4 bg-white border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Prospect
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company, email..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  resetToFirstPage()
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50"
                >
                  Filter <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Import CSV
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActionsOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50"
                >
                  Actions <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white border-b border-slate-200/80">
            {error && (
              <div className="p-4 text-amber-700 bg-amber-50 border-b border-amber-200 text-sm">
                {error.message}
                <button type="button" onClick={() => refetch()} className="ml-2 underline">
                  Retry
                </button>
              </div>
            )}
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50/95 border-b border-slate-200 z-10">
                <tr>
                  <th className="text-left py-3 pl-4 w-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prospects.length > 0 && selectedIds.size === prospects.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-500">Select all</span>
                    </label>
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    <button type="button" className="flex items-center gap-1">
                      Name <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    <button type="button" className="flex items-center gap-1">
                      Company <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    <button type="button" className="flex items-center gap-1">
                      Status <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    Sequence
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    Step
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600">
                    <button type="button" className="flex items-center gap-1">
                      Last Action <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </th>
                  <th className="w-10 py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : prospects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                      No prospects found. Add one using the form on the right.
                    </td>
                  </tr>
                ) : (
                  prospects.map((p, i) => {
                    const status = getDisplayStatus(i)
                    const statusDot =
                      status === 'Active'
                        ? 'bg-emerald-500'
                        : status === 'Replied'
                          ? 'bg-violet-500'
                          : 'bg-amber-500'
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 pl-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 shrink-0">
                              {getInitials(p)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {getFullName(p)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.job_title || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <div className="text-sm text-slate-800">
                                {p.company || '—'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.company ? 'Bengaluru' : '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`}
                            />
                            <span className="text-sm text-slate-700">{status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-700">
                          {getSequence(i)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            {getStep(i)}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-600">
                          {formatLastAction(p.updated_at)}
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows per page</span>
              <select
                value={pageSize}
                onChange={() => {}}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-slate-600">
              {start}-{end} of {total}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
                const p = page < 3 ? i : page - 2 + i
                if (p >= totalPages) return null
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[2rem] py-1.5 rounded-lg text-sm font-medium ${
                      p === page
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p + 1}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 flex flex-col bg-slate-100/90 border-l border-slate-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Add Prospect */}
              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Add Prospect</h3>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={addForm.workEmail}
                    onChange={(e) => setAddForm((f) => ({ ...f, workEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={addForm.company}
                    onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={addForm.jobTitle}
                    onChange={(e) => setAddForm((f) => ({ ...f, jobTitle: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <div className="relative">
                    <select
                      value={addForm.sequence}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, sequence: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none pr-8"
                    >
                      <option value="">Add to sequence</option>
                      {SEQUENCE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {createError && (
                    <p className="text-xs text-red-600">{createError.message}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveProspect}
                    disabled={creating || !addForm.workEmail.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-sm font-medium shadow-sm"
                  >
                    {creating ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </section>

              {/* Tags */}
              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Tags</h3>
                  <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {TAGS.map((tag) => (
                    <div
                      key={tag.id}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium mr-2 ${
                        tag.variant === 'red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      <span>{tag.label}</span>
                      <span className="text-xs opacity-80">{tag.count}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                    Startup
                  </button>
                </div>
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
