import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
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
  const [status, setStatus] = useState<CampaignStatus>('Running')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'insights'>('activity')

  const filteredActivity = useMemo(
    () => (selectedStep ? ACTIVITY.filter((_, index) => index % 2 === 0) : ACTIVITY),
    [selectedStep]
  )

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 20%, rgba(255,255,255,0.35), transparent),
              radial-gradient(2px 2px at 70% 60%, rgba(255,255,255,0.35), transparent)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      <div className="relative z-10 p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-200">
          <span>View Campaign</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              Pause Campaign
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-700/60 flex items-center justify-center">
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {id === 'campaign-1' ? 'Q1 SaaS Founders • Outreach' : 'Campaign'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300">
                  Running
                </span>
                <span className="text-[11px] text-gray-400">1 automated modes</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-gray-200 flex items-center gap-2">
              Offer prospects
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-200">
            {[
              { label: 'Prospects Active', value: '105' },
              { label: 'Replies', value: '24' },
              { label: 'Open Rate', value: '58%' },
              { label: 'Avg Reply time', value: '3.4h' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-3">
                <p className="text-[11px] text-gray-400">{metric.label}</p>
                <p className="text-lg font-semibold text-white">{metric.value}</p>
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
                  ? 'bg-indigo-600/40 border-indigo-400/40 text-white'
                  : 'border-slate-700/60 text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`flex-1 rounded-xl border p-3 text-left transition-colors ${
                  selectedStep === step.id || (selectedStep === null && step.id === 1)
                    ? 'border-indigo-400/50 bg-indigo-700/20'
                    : 'border-slate-700/60 bg-slate-900/40'
                }`}
              >
                <p className="text-xs text-gray-300">{step.label}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-white">
                  <span>{step.count}</span>
                  <span className="text-xs text-gray-400">prospects</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
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
                  ? 'bg-indigo-600/40 border-indigo-400/40 text-white'
                  : 'border-slate-700/60 text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="space-y-3">
              {filteredActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-indigo-700/40 flex items-center justify-center text-[10px] text-white">
                    {item.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.detail}</p>
                  </div>
                  <span className="text-[11px] text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">What Needs Attention</h2>
              <div className="space-y-2 text-xs text-gray-300">
                <button
                  onClick={() => navigate(ROUTES.COMPOSE)}
                  className="w-full text-left flex items-center justify-between rounded-lg border border-slate-700/60 px-3 py-2"
                >
                  5 Leads waiting for approval
                </button>
                <button
                  onClick={() => navigate(ROUTES.COMPOSE)}
                  className="w-full text-left flex items-center justify-between rounded-lg border border-slate-700/60 px-3 py-2"
                >
                  2 Send follow-ups
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Prospects</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-300">
                {PROSPECTS.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-700/40 text-[10px] text-white flex items-center justify-center">
                        {prospect.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <span>{prospect.name}</span>
                    </div>
                    <span className="text-gray-400">{prospect.rate}</span>
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
