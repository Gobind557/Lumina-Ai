import { useMemo, useState } from 'react'
import { ChevronDown, MoreVertical } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

type CampaignStatus = 'Draft' | 'Running' | 'Paused' | 'Completed'

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

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [_status, _setStatus] = useState<CampaignStatus>('Running')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'insights'>('activity')

  const filteredActivity = useMemo(
    () => (selectedStep ? ACTIVITY.filter((_, index) => index % 2 === 0) : ACTIVITY),
    [selectedStep]
  )

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">

      <div className="relative z-10 p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>View Campaign</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200/70 text-xs bg-white/70 text-slate-700">
              Pause Campaign
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200/70 flex items-center justify-center bg-white/70">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="glass-card border border-slate-200/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {id === 'campaign-1' ? 'Q1 SaaS Founders • Outreach' : 'Campaign'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-300/60 text-emerald-700">
                  Running
                </span>
                <span className="text-[11px] text-slate-500">1 automated modes</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200/70 text-xs text-slate-700 bg-white/70 flex items-center gap-2">
              Offer prospects
              <ChevronDown className="w-3 h-3" />
            </button>
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
              className={`px-3 py-1 rounded-full border ${
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
          <div className="flex items-center gap-3">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
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
                {index < STEPS.length - 1 && (
                  <div className="absolute hidden" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['Activity Feed', 'AI Insights'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded-full border ${
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
                  className="w-full text-left flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 bg-white/70"
                >
                  5 Leads waiting for approval
                </button>
                <button
                  onClick={() => navigate(ROUTES.COMPOSE)}
                  className="w-full text-left flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 bg-white/70"
                >
                  2 Send follow-ups
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>
              </div>
            </div>

            <div className="glass-card border border-slate-200/70 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Prospects</h2>
                <div className="flex items-center gap-2 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                  <MoreVertical className="w-4 h-4" />
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
  )
}
