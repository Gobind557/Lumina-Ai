import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, MoreVertical, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { formatTimeAgo } from '@/shared/utils'
import { useCampaign } from '../hooks/useCampaign'
import { useCampaignProspects } from '../hooks/useCampaignProspects'
import { useCampaignActivities } from '../hooks/useCampaignActivities'
import { useUpdateCampaignStatus } from '../hooks/useUpdateCampaignStatus'
import ActivityFeed from '@/features/email/components/timeline/ActivityFeed'
import type { CampaignProspectItem, CampaignActivityItem } from '../api/campaigns.api'

function stepLabel(stepNum: number, steps?: Array<{ stepNumber: number; template?: { title: string } }>): string {
  const step = steps?.find((s) => s.stepNumber === stepNum)
  const title = step?.template?.title
  return title ? `Step ${stepNum}: ${title}` : `Step ${stepNum}`
}

function buildStepsFromProspects(
  prospects: CampaignProspectItem[],
  campaignSteps?: Array<{ stepNumber: number; template?: { title: string } }>
) {
  const byStep = new Map<number, { total: number; replied: number }>()
  prospects.forEach((p) => {
    const step = Math.max(0, p.currentStep)
    const cur = byStep.get(step) ?? { total: 0, replied: 0 }
    cur.total += 1
    if (p.status === 'REPLIED') cur.replied += 1
    byStep.set(step, cur)
  })

  // Show all configured steps (previous, current, coming); fallback to steps that have prospects
  const fromConfig = (campaignSteps?.map((s) => s.stepNumber) ?? []).sort((a, b) => a - b)
  const fromProspects = Array.from(byStep.keys()).sort((a, b) => a - b)
  const stepNumbers =
    fromConfig.length > 0
      ? fromConfig
      : fromProspects.length > 0
        ? fromProspects
        : [1]

  return stepNumbers.map((stepNum) => {
    const stats = byStep.get(stepNum) ?? { total: 0, replied: 0 }
    const replyRatePct = stats.total > 0 ? Math.round((stats.replied / stats.total) * 100) : 0
    return {
      id: stepNum,
      label: stepLabel(stepNum, campaignSteps),
      count: stats.total,
      replyRate: `${replyRatePct}%`,
      openRate: null as string | null,
    }
  })
}

const OFFER_OPTIONS = ['All prospects', 'Offer prospects', 'Not yet offered', 'By step']

const PROSPECT_SORT_OPTIONS = ['By name', 'By progress', 'By last activity']

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

function prospectStatusToLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    REPLIED: 'Replied',
    COMPLETED: 'Completed',
  }
  return map[status] ?? status
}

const CAMPAIGN_REFETCH_MS = 15_000

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaign, loading: campaignLoading, error: campaignError, refetch: refetchCampaign } = useCampaign(
    id,
    true,
    CAMPAIGN_REFETCH_MS,
  )
  const { prospects, loading: prospectsLoading, refetch: refetchProspects } = useCampaignProspects(
    id,
    true,
    CAMPAIGN_REFETCH_MS,
  )
  const { activities: rawActivities, loading: activitiesLoading, refetch: refetchActivities } = useCampaignActivities(
    id,
    true,
    CAMPAIGN_REFETCH_MS,
  )
  const { updateStatus, loading: statusLoading } = useUpdateCampaignStatus()

  const handleRefresh = useCallback(() => {
    refetchCampaign()
    refetchProspects()
    refetchActivities()
  }, [refetchCampaign, refetchProspects, refetchActivities])

  const activityFeedItems = useMemo(() => {
    return rawActivities.map((a: CampaignActivityItem) => ({
      type: a.type,
      timestamp: formatTimeAgo(a.timestamp),
      description: a.description ?? undefined,
      prospectName: a.prospectName ?? undefined,
    }))
  }, [rawActivities])

  const totalProspects = prospects.length
  const activeCount = prospects.filter((p) => p.status === 'ACTIVE').length
  const repliedCount = prospects.filter((p) => p.status === 'REPLIED').length
  const completedCount = prospects.filter((p) => p.status === 'COMPLETED').length
  const replyRate =
    totalProspects > 0 ? Math.round((repliedCount / totalProspects) * 100) : 0
  const avgStep =
    prospects.length > 0
      ? prospects.reduce((s, p) => s + p.currentStep, 0) / prospects.length
      : 0
  const maxSteps = campaign?.steps?.length ?? 5
  const progressPct = Math.min(100, Math.round((avgStep / maxSteps) * 100))
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'insights'>('activity')
  const [offerFilter, setOfferFilter] = useState('Offer prospects')
  const [prospectSort, setProspectSort] = useState('By name')
  const [offerDropdownOpen, setOfferDropdownOpen] = useState(false)
  const [prospectDropdownOpen, setProspectDropdownOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const offerRef = useRef<HTMLDivElement>(null)
  const prospectRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (offerRef.current && !offerRef.current.contains(e.target as Node)) setOfferDropdownOpen(false)
      if (prospectRef.current && !prospectRef.current.contains(e.target as Node)) setProspectDropdownOpen(false)
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreMenuOpen(false)
    }
    document.addEventListener('click', onOutside)
    return () => document.removeEventListener('click', onOutside)
  }, [])

  const steps = useMemo(
    () => buildStepsFromProspects(prospects, campaign?.steps),
    [prospects, campaign?.steps]
  )
  const stepsWithOpenRate = useMemo(() => {
    const stepMetrics = campaign?.stepMetrics ?? []
    const rateByStep = new Map(stepMetrics.map((m) => [m.stepNumber, m.openRate]))
    return steps.map((s) => {
      const rate = rateByStep.get(s.id)
      return rate != null ? { ...s, openRate: `${rate}%` } : s
    })
  }, [steps, campaign?.stepMetrics])

  // Step with most prospects = "current" step; highlight it when none selected
  const currentStepId = useMemo(() => {
    if (stepsWithOpenRate.length === 0) return null
    const withMost = stepsWithOpenRate.reduce((best, s) =>
      s.count >= (best?.count ?? 0) ? s : best
    )
    return withMost.count > 0 ? withMost.id : (stepsWithOpenRate[0]?.id ?? null)
  }, [stepsWithOpenRate])

  const attentionItems = useMemo(() => {
    const items: { label: string; count: number; highlight?: boolean }[] = []
    if (repliedCount > 0) {
      items.push({
        label: repliedCount === 1 ? '1 Replied — follow up' : `${repliedCount} Replied — follow up`,
        count: repliedCount,
        highlight: true,
      })
    }
    const openedNoReply = campaign?.attention?.openedNoReplyCount ?? 0
    if (openedNoReply > 0) {
      items.push({
        label: openedNoReply === 1 ? '1 Opened — no reply yet' : `${openedNoReply} Opened — no reply yet`,
        count: openedNoReply,
      })
    }
    const followUps = prospects.filter((p) => p.status === 'ACTIVE' && p.currentStep >= 1).length
    if (followUps > 0) {
      items.push({
        label: followUps === 1 ? '1 Send follow-up' : `${followUps} Send follow-ups`,
        count: followUps,
      })
    }
    return items
  }, [prospects, repliedCount, campaign?.attention?.openedNoReplyCount])

  const handlePauseResume = async () => {
    if (!campaign?.id) return
    const next = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await updateStatus(campaign.id, next)
      setMoreMenuOpen(false)
      handleRefresh()
    } catch (_) {
      // error state in hook
    }
  }

  const handleStartCampaign = async () => {
    if (!campaign?.id) return
    try {
      await updateStatus(campaign.id, 'ACTIVE')
      setMoreMenuOpen(false)
      handleRefresh()
    } catch {
      // Error surfaced by useUpdateCampaignStatus
    }
  }

  const displayName = campaign?.name ?? (id === 'campaign-1' ? 'Q1 SaaS Founders • Outreach' : 'Campaign')
  const statusLabel = campaign ? statusToLabel(campaign.status) : 'Running'
  const isPausable = campaign?.status === 'ACTIVE'
  const isResumable = campaign?.status === 'PAUSED'
  const isDraft = campaign?.status === 'DRAFT'

  if (campaignError && !campaign) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-6">
        <div className="max-w-5xl mx-auto rounded-xl bg-amber-500/10 border border-amber-300/60 text-amber-800 text-sm px-4 py-3">
          {campaignError.message}
          <button onClick={() => navigate(ROUTES.CAMPAIGNS)} className="ml-2 underline">Back to campaigns</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      {/* Top bar */}
      <div className="shrink-0 bg-gradient-to-br from-slate-50/98 via-indigo-50/98 to-slate-100/98 border-b border-slate-200/70">
        <div className="p-4 max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">View Campaign</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={campaignLoading || prospectsLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/70 text-xs text-slate-600 bg-white/70 hover:bg-white disabled:opacity-50"
              title="Refresh metrics and prospects"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${campaignLoading || prospectsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Primary action: always show one of Start / Pause / Resume */}
            {isDraft && (
              <button
                onClick={handleStartCampaign}
                disabled={statusLoading}
                className="inline-flex items-center shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {statusLoading ? '…' : 'Start Campaign'}
              </button>
            )}
            {(isPausable || isResumable) && (
              <button
                onClick={handlePauseResume}
                disabled={statusLoading}
                className="inline-flex items-center shrink-0 px-3 py-1.5 rounded-lg border border-slate-200/70 text-xs bg-white/70 text-slate-700 hover:bg-white disabled:opacity-50"
              >
                {statusLoading ? '…' : isPausable ? 'Pause Campaign' : 'Resume Campaign'}
              </button>
            )}
            <div className="relative shrink-0" ref={offerRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOfferDropdownOpen((o) => !o) }}
                className="inline-flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg border border-slate-200/70 text-xs text-slate-700 bg-white/70"
              >
                {offerFilter}
                <ChevronDown className="w-3 h-3" />
              </button>
              {offerDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-lg border border-slate-200/70 bg-white shadow-lg z-20">
                  {OFFER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setOfferFilter(opt); setOfferDropdownOpen(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMoreMenuOpen((o) => !o) }}
                className="shrink-0 w-8 h-8 rounded-lg border border-slate-200/70 inline-flex items-center justify-center bg-white/70 hover:bg-white"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg border border-slate-200/70 bg-white shadow-lg z-20">
                  {isDraft && (
                    <button
                      type="button"
                      onClick={handleStartCampaign}
                      disabled={statusLoading}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Start Campaign
                    </button>
                  )}
                  {isPausable && (
                    <button
                      type="button"
                      onClick={handlePauseResume}
                      disabled={statusLoading}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Pause Campaign
                    </button>
                  )}
                  {isResumable && (
                    <button
                      type="button"
                      onClick={handlePauseResume}
                      disabled={statusLoading}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Resume Campaign
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); navigate(ROUTES.CAMPAIGNS) }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 border-t border-slate-100"
                  >
                    Back to campaigns
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll area: viewport-based height so scroll always works */}
      <div
        className="overflow-y-scroll overflow-x-hidden flex-1 min-h-0"
        style={{ minHeight: 0 }}
      >
        <div className="p-6 pb-24 max-w-6xl mx-auto space-y-4">
        {campaignLoading && (
          <div className="text-sm text-slate-500 py-2">Loading campaign…</div>
        )}

        <div className="glass-card border border-slate-200/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-2 text-xs px-2 py-0.5 rounded-full border ${
                  campaign?.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 border-emerald-300/60 text-emerald-700'
                    : campaign?.status === 'PAUSED'
                    ? 'bg-amber-500/15 border-amber-300/60 text-amber-700'
                    : 'bg-slate-500/15 border-slate-300/60 text-slate-700'
                }`}>
                  {statusLabel}
                </span>
                <span className="text-[11px] text-slate-500">1 automated modes</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm text-slate-600">
            {[
              { label: 'Total prospects', value: String(totalProspects) },
              { label: 'Active', value: String(activeCount) },
              { label: 'Replied', value: String(repliedCount) },
              { label: 'Completed', value: String(completedCount) },
              { label: 'Reply rate', value: `${replyRate}%` },
              { label: 'Progress', value: `${progressPct}%` },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl bg-white/70 border border-slate-200/70 p-3">
                <p className="text-[11px] text-slate-500">{metric.label}</p>
                <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['Activity Feed', 'AI Insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'Activity Feed' ? 'activity' : 'insights')}
              className={`inline-flex items-center shrink-0 px-3 py-1.5 rounded-full border whitespace-nowrap ${
                (tab === 'Activity Feed' && activeTab === 'activity') ||
                (tab === 'AI Insights' && activeTab === 'insights')
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-200/70 text-slate-500 bg-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stepsWithOpenRate.map((step) => {
              const isHighlighted =
                selectedStep === step.id ||
                (selectedStep === null && step.id === currentStepId)
              return (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`rounded-xl border p-3 text-left transition-colors min-w-0 ${
                  isHighlighted
                    ? 'border-indigo-300/70 bg-indigo-500/10'
                    : 'border-slate-200/70 bg-white/70'
                }`}
              >
                <p className="text-xs text-slate-600">{step.label}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-900">
                  <span>{step.count}</span>
                  <span className="text-xs text-slate-500">prospects</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Reply rate {step.replyRate}
                  {step.openRate != null ? ` · Open rate ${step.openRate}` : ''}
                </div>
              </button>
            )})}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Steps update as each sequence email is sent; reply status updates when we receive open/reply webhooks. Next steps are scheduled automatically after each step email is sent, using the delay set for that step. Use Refresh to see the latest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
            <div className="space-y-3">
              {activeTab === 'activity' && (
                <>
                  {activitiesLoading && (
                    <p className="text-xs text-slate-500">Loading activity…</p>
                  )}
                  {!activitiesLoading && (
                    <ActivityFeed
                      activities={activityFeedItems}
                      emptyMessage="No activity yet. Opens and replies in this campaign will appear here."
                    />
                  )}
                </>
              )}
              {activeTab === 'insights' && (
                <p className="text-xs text-slate-500">AI Insights coming soon.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">What Needs Attention</h2>
              <div className="space-y-2 text-xs text-slate-600">
                {attentionItems.length === 0 ? (
                  <p className="text-slate-500 py-1">Nothing needs attention right now.</p>
                ) : (
                  attentionItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigate(ROUTES.COMPOSE)}
                      className="w-full text-left inline-flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 bg-white/70 hover:bg-slate-50"
                    >
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Prospects</h2>
                <div className="relative flex items-center gap-2 text-slate-400" ref={prospectRef}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setProspectDropdownOpen((o) => !o) }}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 shrink-0"
                  >
                    <span className="text-[11px] whitespace-nowrap">{prospectSort}</span>
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  </button>
                  <button type="button" className="shrink-0 p-0.5 rounded hover:bg-slate-100 inline-flex items-center justify-center">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {prospectDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-lg border border-slate-200/70 bg-white shadow-lg z-20">
                      {PROSPECT_SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setProspectSort(opt); setProspectDropdownOpen(false) }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {prospectsLoading && <p className="text-slate-500">Loading prospects…</p>}
                {!prospectsLoading && prospects.length === 0 && (
                  <p className="text-slate-500">No prospects in this campaign.</p>
                )}
                {!prospectsLoading &&
                  prospects.map((prospect) => (
                    <div key={prospect.prospectId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-[10px] text-indigo-700 flex items-center justify-center border border-indigo-200/70">
                          {prospect.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('') || prospect.email[0]?.toUpperCase() || '?'}
                        </div>
                        <span>{prospect.name || prospect.email}</span>
                      </div>
                      <span className="text-slate-500">
                        {prospectStatusToLabel(prospect.status)} · Step {prospect.currentStep}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
