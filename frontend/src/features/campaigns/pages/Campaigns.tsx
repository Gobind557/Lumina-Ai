import { useState, useRef, useEffect } from 'react'
import { 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  Star, 
  TrendingUp, 
  Pause, 
  Play, 
  Trash2,
  Mail,
  Users,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useCampaigns } from '../hooks/useCampaigns'
import { useUpdateCampaignStatus } from '../hooks/useUpdateCampaignStatus'
import { useDeleteCampaign } from '../hooks/useDeleteCampaign'
import type { CampaignStatus } from '../api/campaigns.api'

const TAB_STATUS: Record<string, CampaignStatus | undefined> = {
  All: undefined,
  Running: 'ACTIVE',
  Draft: 'DRAFT',
  Paused: 'PAUSED',
  Completed: 'COMPLETED',
}

const tabs = ['All', 'Running', 'Draft', 'Paused', 'Completed'] as const

function statusToBadgeTone(status: string): 'emerald' | 'amber' | 'indigo' | 'slate' {
  switch (status) {
    case 'Running':
    case 'ACTIVE':
      return 'emerald'
    case 'Paused':
    case 'PAUSED':
      return 'amber'
    case 'Completed':
    case 'COMPLETED':
      return 'indigo'
    default:
      return 'slate'
  }
}

function statusToLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Running',
    DRAFT: 'Draft',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
  }
  return map[status] ?? status
}

function formatLastActivity(createdAt: string, status: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (status === 'DRAFT') return 'edited recently'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function Campaigns() {
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const statusFilter = TAB_STATUS[activeTab]
  const { campaigns: apiCampaigns, loading, error, refetch } = useCampaigns({ status: statusFilter })
  const { updateStatus, loading: statusLoading } = useUpdateCampaignStatus()
  const { deleteCampaign, loading: deleteLoading } = useDeleteCampaign()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handlePause = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setOpenMenuId(null)
    try {
      await updateStatus(id, 'PAUSED')
      refetch()
    } catch {
      // error handled by hook
    }
  }

  const handleResume = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setOpenMenuId(null)
    try {
      await updateStatus(id, 'ACTIVE')
      refetch()
    } catch {
      // error handled by hook
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (!window.confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return
    try {
      await deleteCampaign(id)
      refetch()
    } catch {
      // error handled by hook
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.14),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(168,85,247,0.12),transparent_50%)]" />
      </div>
      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaigns</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your sequences and monitor performance in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.CAMPAIGNS_NEW)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-semibold shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
            <button className="w-10 h-10 rounded-xl border border-slate-200/70 text-slate-600 flex items-center justify-center bg-white/70 hover:bg-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Layers className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-slate-400">Total</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{apiCampaigns.length}</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Campaigns Created</div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Play className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-slate-400">Active</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{apiCampaigns.filter(c => c.status === 'ACTIVE').length}</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Running Sequences</div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Mail className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-slate-400">Impact</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{apiCampaigns.reduce((sum, c) => sum + (c._count?.emails ?? 0), 0)}</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Total Emails Sent</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-300/60 text-amber-800 text-sm px-4 py-3">
            {error.message}
            <button onClick={() => refetch()} className="ml-2 underline">Retry</button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/70 border border-white/60 rounded-2xl p-4 h-[160px] flex flex-col justify-between animate-pulse">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-5 w-12 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-3 w-16 bg-slate-100 rounded mt-2" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                  <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-16 bg-indigo-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiCampaigns.length === 0 ? (
            <div className="col-span-full text-sm text-slate-500 py-8 text-center">
              No campaigns found. Create one to get started.
            </div>
          ) : (
          apiCampaigns.map((campaign) => {
            const badgeTone = statusToBadgeTone(campaign.status)
            const label = statusToLabel(campaign.status)
            const emailCount = campaign._count?.emails ?? 0
            const progress = campaign.status === 'ACTIVE' ? 0.5 : campaign.status === 'DRAFT' ? 0.08 : 0.6
            const isPausable = campaign.status === 'ACTIVE'
            const isResumable = campaign.status === 'PAUSED'
            return (
            <div
              key={campaign.id}
              onClick={() => navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))}
              className="group relative text-left bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200/50 cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {campaign.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <Users className="w-3 h-3" />
                      <span>{emailCount} prospects contacted</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${
                        badgeTone === 'emerald'
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : badgeTone === 'amber'
                          ? 'border-amber-200 text-amber-700 bg-amber-50'
                          : badgeTone === 'indigo'
                          ? 'border-indigo-200 text-indigo-700 bg-indigo-50'
                          : 'border-slate-200 text-slate-600 bg-slate-50'
                      }`}
                    >
                      {label}
                    </span>
                    <div
                      ref={openMenuId === campaign.id ? menuRef : undefined}
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId((id) => (id === campaign.id ? null : campaign.id))
                        }}
                        className="w-8 h-8 rounded-xl border border-slate-200/70 inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === campaign.id && (
                        <div className="absolute right-0 top-full mt-2 py-1.5 min-w-[180px] rounded-xl border border-slate-200/70 bg-white shadow-xl z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                          {isPausable && (
                            <button
                              type="button"
                              onClick={(e) => handlePause(e, campaign.id)}
                              disabled={statusLoading}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2.5"
                            >
                              <Pause className="w-4 h-4 text-slate-400" /> Pause Campaign
                            </button>
                          )}
                          {isResumable && (
                            <button
                              type="button"
                              onClick={(e) => handleResume(e, campaign.id)}
                              disabled={statusLoading}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2.5"
                            >
                              <Play className="w-4 h-4 text-emerald-500" /> Resume Campaign
                            </button>
                          )}
                          <div className="h-px bg-slate-100 my-1 mx-2" />
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, campaign.id)}
                            disabled={deleteLoading}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2.5"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      <BarChart3 className="w-3 h-3" /> Open Rate
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-slate-900">{campaign.metrics?.openRate ?? 0}%</span>
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      <Mail className="w-3 h-3" /> Delivered
                    </div>
                    <div className="text-base font-bold text-slate-900">{emailCount}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sequence Progress</span>
                    <span className="text-[10px] font-bold text-indigo-600">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badgeTone === 'amber'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                          : badgeTone === 'indigo'
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                          : badgeTone === 'slate'
                          ? 'bg-slate-400'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatLastActivity(campaign.updatedAt, campaign.status)}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:gap-2 transition-all">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
            )
          })
          )}
        </div>
        )}
      </div>
    </div>
  )
}
