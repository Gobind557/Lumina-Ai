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
              className={`px-3 py-1 rounded-full border transition-colors ${
                tab === 'All'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200/70 text-slate-500 hover:text-slate-700 bg-white/70'
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
              className={`text-left bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-[0_18px_50px_rgba(30,41,59,0.12)] transition-colors relative overflow-hidden ${
                campaign.highlight
                  ? 'border-indigo-300/70 shadow-indigo-500/15'
                  : 'hover:border-slate-300/70'
              }`}
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
                      {campaign.prospects} prospects · {campaign.steps} steps
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        campaign.badgeTone === 'emerald'
                          ? 'border-emerald-400/40 text-emerald-700 bg-emerald-500/10'
                          : campaign.badgeTone === 'amber'
                          ? 'border-amber-400/40 text-amber-700 bg-amber-500/10'
                          : campaign.badgeTone === 'indigo'
                          ? 'border-indigo-400/40 text-indigo-700 bg-indigo-500/10'
                          : 'border-slate-300/70 text-slate-600 bg-slate-500/10'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                  <span>{campaign.metricPrimary}</span>
                  <span>{campaign.metricSecondary}</span>
                  {campaign.trend && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
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
                  <div className="mt-2 text-[11px] text-slate-500">
                    ★ {campaign.insight}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {campaign.status === 'Paused' ? 'Paused' : 'Last activity'} ·{' '}
                    {campaign.lastActivity}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    View Campaign <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
