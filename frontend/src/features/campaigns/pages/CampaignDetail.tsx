import { useMemo, useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreVertical } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useCampaign } from '../hooks/useCampaign'
import { useUpdateCampaignStatus } from '../hooks/useUpdateCampaignStatus'

const STEPS = [
  { id: 1, label: 'Step 1: Initial Outreach', count: 45, replyRate: '6%', openRate: '86%' },
  { id: 2, label: 'Step 2: Follow-Up', count: 35, replyRate: '4.25%' },
  { id: 3, label: 'Step 3: Breakup Email', count: 12, replyRate: '1.75%' },
]

const ACTIVITY = [
  { id: '1', initials: 'SM', name: 'Sarah Mitchell', detail: 'Opened rep 2 · email Step 2', time: '15 m ago' },
  { id: '2', initials: 'EW', name: 'Emily Wong', detail: 'Opened email rep 4 · Step 3', time: '13h ago' },
  { id: '3', initials: 'DK', name: 'Darren Kim', detail: 'Opened your initial email', time: '1h ago' },
  { id: '4', initials: 'EW', name: 'Emily Wong', detail: 'Call avg ago · Inboxcloud 3 hr ago', time: '2h ago' },
  { id: '5', initials: 'SC', name: 'Sam Carter', detail: 'Backed up 2 days ago', time: '8 hr ago' },
]

const PROSPECTS = [
  { id: 'p1', name: 'Sarah Mitchell', rate: '0%' },
  { id: 'p2', name: 'Emily Wong', rate: '0%' },
  { id: 'p3', name: 'Chris Yu', rate: '0%' },
  { id: 'p4', name: 'Emma Davis', rate: '0%' },
  { id: 'p5', name: 'Sam Carter', rate: '0%' },
  { id: 'p6', name: 'Edward Kim', rate: '0%' },
]

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

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaign, loading: campaignLoading, error: campaignError, refetch } = useCampaign(id)
  const { updateStatus, loading: statusLoading } = useUpdateCampaignStatus()
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

  const filteredActivity = useMemo(
    () => (selectedStep ? ACTIVITY.filter((_, index) => index % 2 === 0) : ACTIVITY),
    [selectedStep]
  )

  const handlePauseResume = async () => {
    if (!campaign?.id) return
    const next = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await updateStatus(campaign.id, next)
      setMoreMenuOpen(false)
      refetch()
    } catch (_) {
      // error state in hook
    }
  }

  const handleStartCampaign = async () => {
    if (!campaign?.id) return
    try {
      await updateStatus(campaign.id, 'ACTIVE')
      setMoreMenuOpen(false)
      refetch()
    } catch (_) {}
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
          <span className="text-sm text-slate-600">View Campaign</span>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-600">
            {[
              { label: 'Prospects Active', value: '105' },
              { label: 'Replies', value: '24' },
              { label: 'Open Rate', value: '58%' },
              { label: 'Avg Reply time', value: '3.4h' },
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
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`rounded-xl border p-3 text-left transition-colors min-w-0 ${
                  selectedStep === step.id || (selectedStep === null && step.id === 1)
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
                  {step.openRate ? ` · Open rate ${step.openRate}` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['Activity Feed', 'AI Insights'].map((tab) => (
            <button
              key={tab}
              className={`inline-flex items-center shrink-0 px-3 py-1.5 rounded-full border whitespace-nowrap ${
                tab === 'Activity Feed'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-200/70 text-slate-500 bg-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
            <div className="space-y-3">
              {filteredActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px] text-indigo-700 border border-indigo-200/70">
                    {item.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.detail}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">What Needs Attention</h2>
              <div className="space-y-2 text-xs text-slate-600">
                <button
                  onClick={() => navigate(ROUTES.COMPOSE)}
                  className="w-full text-left inline-flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 bg-white/70"
                >
                  <span>5 Leads waiting for approval</span>
                </button>
                <button
                  onClick={() => navigate(ROUTES.COMPOSE)}
                  className="w-full text-left inline-flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 bg-white/70"
                >
                  <span>2 Send follow-ups</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                </button>
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
                {PROSPECTS.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-[10px] text-indigo-700 flex items-center justify-center border border-indigo-200/70">
                        {prospect.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <span>{prospect.name}</span>
                    </div>
                    <span className="text-slate-500">{prospect.rate}</span>
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
