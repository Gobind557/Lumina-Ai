import { Plus, ChevronRight, MoreVertical, Star, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

export default function Campaigns() {
  const navigate = useNavigate()

  const tabs = ['All', 'Running', 'Draft', 'Paused']

  const campaigns = [
    {
      id: 'campaign-1',
      name: 'Q1 SaaS Founders Outreach',
      status: 'Running',
      prospects: 120,
      steps: 3,
      metricPrimary: 'Opens 58%',
      metricSecondary: '0%',
      trend: true,
      progress: 0.78,
      highlight: true,
      badgeTone: 'emerald',
      lastActivity: '2h ago',
    },
    {
      id: 'campaign-2',
      name: 'New Leads Follow-Up',
      status: 'Running',
      prospects: 45,
      steps: 4,
      metricPrimary: '67%',
      metricSecondary: '67%',
      trend: false,
      progress: 0.62,
      highlight: false,
      badgeTone: 'emerald',
      lastActivity: '3h ago',
    },
    {
      id: 'campaign-3',
      name: 'Webinar Invitation',
      status: 'Paused',
      prospects: 89,
      steps: 3,
      metricPrimary: '52%',
      metricSecondary: '20%',
      trend: false,
      progress: 0.48,
      highlight: false,
      badgeTone: 'amber',
      lastActivity: '4d ago',
    },
    {
      id: 'campaign-4',
      name: 'Startups Cold Outreach',
      status: 'Draft',
      prospects: 0,
      steps: 3,
      metricPrimary: '0%',
      metricSecondary: '0%',
      trend: false,
      progress: 0.08,
      highlight: false,
      badgeTone: 'slate',
      lastActivity: 'edited yesterday',
    },
    {
      id: 'campaign-5',
      name: 'Product Update Announcement',
      status: 'Running',
      prospects: 102,
      steps: 2,
      metricPrimary: '76%',
      metricSecondary: '14%',
      trend: true,
      progress: 0.68,
      highlight: false,
      badgeTone: 'emerald',
      lastActivity: '3h ago',
      insight: 'Best replies Tue mornings',
    },
    {
      id: 'campaign-6',
      name: 'VC Follow-Up Sequence',
      status: 'Completed',
      prospects: 37,
      steps: 3,
      metricPrimary: '92%',
      metricSecondary: '38%',
      trend: true,
      progress: 0.92,
      highlight: false,
      badgeTone: 'indigo',
      lastActivity: 'completed 2 weeks ago',
    },
  ]

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
      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Campaigns</h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage your outreach sequences and monitor performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.CAMPAIGNS_NEW)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-medium shadow-lg shadow-purple-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-700/60 text-gray-300 flex items-center justify-center">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded-full border transition-colors ${
                tab === 'All'
                  ? 'bg-indigo-600/40 border-indigo-400/40 text-white'
                  : 'border-slate-700/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() =>
                navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
              }
              className={`text-left bg-slate-900/45 border rounded-2xl p-4 shadow-lg transition-colors ${
                campaign.highlight
                  ? 'border-indigo-500/60 shadow-indigo-600/20'
                  : 'border-slate-700/60 hover:border-slate-500/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white leading-snug">
                  {campaign.name}
                </h3>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {campaign.prospects} prospects · {campaign.steps} steps
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      campaign.badgeTone === 'emerald'
                        ? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10'
                        : campaign.badgeTone === 'amber'
                        ? 'border-amber-400/40 text-amber-300 bg-amber-500/10'
                        : campaign.badgeTone === 'indigo'
                        ? 'border-indigo-400/40 text-indigo-200 bg-indigo-500/10'
                        : 'border-slate-600/60 text-slate-300 bg-slate-500/10'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-200">
                <span>{campaign.metricPrimary}</span>
                <span>{campaign.metricSecondary}</span>
                {campaign.trend && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    campaign.badgeTone === 'amber'
                      ? 'bg-amber-400'
                      : campaign.badgeTone === 'indigo'
                      ? 'bg-indigo-400'
                      : campaign.badgeTone === 'slate'
                      ? 'bg-slate-500'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${campaign.progress * 100}%` }}
                />
              </div>

              {campaign.insight && (
                <div className="mt-2 text-[11px] text-gray-400">
                  ★ {campaign.insight}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  {campaign.status === 'Paused' ? 'Paused' : 'Last activity'} ·{' '}
                  {campaign.lastActivity}
                </span>
                <span className="flex items-center gap-1 text-blue-200">
                  View Campaign <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
