import { useState } from 'react'
import { Plus, ChevronRight, MoreVertical, Star, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useCampaigns } from '../hooks/useCampaigns'
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
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All')
  const statusFilter = TAB_STATUS[activeTab]
  const { campaigns: apiCampaigns, loading, error, refetch } = useCampaigns({ status: statusFilter })

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.14),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(168,85,247,0.12),transparent_50%)]" />
      </div>
      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Campaigns</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your outreach sequences and monitor performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.CAMPAIGNS_NEW)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-medium shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200/70 text-slate-600 flex items-center justify-center bg-white/70">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200/70 text-slate-500 hover:text-slate-700 bg-white/70'
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
          <div className="text-sm text-slate-500 py-4">Loading campaigns…</div>
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
            return (
            <button
              key={campaign.id}
              onClick={() =>
                navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
              }
              className="text-left bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-[0_18px_50px_rgba(30,41,59,0.12)] transition-colors relative overflow-hidden hover:border-slate-300/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-indigo-50/70 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
              <div className="absolute -right-12 -top-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {campaign.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {emailCount} emails
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        badgeTone === 'emerald'
                          ? 'border-emerald-400/40 text-emerald-700 bg-emerald-500/10'
                          : badgeTone === 'amber'
                          ? 'border-amber-400/40 text-amber-700 bg-amber-500/10'
                          : badgeTone === 'indigo'
                          ? 'border-indigo-400/40 text-indigo-700 bg-indigo-500/10'
                          : 'border-slate-300/70 text-slate-600 bg-slate-500/10'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                  <span>{campaign.metrics?.openRate ?? 0}% opens</span>
                  {campaign.metrics && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      badgeTone === 'amber'
                        ? 'bg-amber-400'
                        : badgeTone === 'indigo'
                        ? 'bg-indigo-400'
                        : badgeTone === 'slate'
                        ? 'bg-slate-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {campaign.status === 'PAUSED' ? 'Paused' : 'Last activity'} ·{' '}
                    {formatLastActivity(campaign.updatedAt, campaign.status)}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    View Campaign <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
            )
          })
          )}
        </div>
        )}
      </div>
    </div>
  )
}
