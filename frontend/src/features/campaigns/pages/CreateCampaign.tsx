import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

const PROSPECTS = [
  { id: '1', name: 'Sarah Mitchell' },
  { id: '2', name: 'Emily Wong' },
  { id: '3', name: 'Darren Kim' },
  { id: '4', name: 'Sam Carter' },
]

const STEPS = [
  { day: 'Day 1', label: 'Initial Outreach' },
  { day: 'Day 4', label: 'Follow-Up' },
  { day: 'Day 3', label: 'Breakup Email' },
]

export default function CreateCampaign() {
  const navigate = useNavigate()
  const [campaignName, setCampaignName] = useState('Startup Cold Outreach')
  const [sequenceEnabled, setSequenceEnabled] = useState(true)
  const [approvalEnabled, setApprovalEnabled] = useState(true)

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

      <div className="relative z-10 p-6 max-w-3xl mx-auto space-y-4">
        <div className="text-white text-lg font-semibold">New Campaign</div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
          <h1 className="text-lg font-semibold text-white">New Campaign</h1>
          <p className="text-xs text-gray-400 mt-1">
            A campaign applies a sequence to a defined audience.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
          <div className="text-sm font-semibold text-white">Campaign Name</div>
          <input
            value={campaignName}
            onChange={(event) => setCampaignName(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Audience</div>
              <p className="text-xs text-gray-400">Select prospects to target</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button className="px-3 py-1 rounded-full border border-slate-700/60 text-gray-300">
                Select All
              </button>
              <button className="px-3 py-1 rounded-full border border-slate-700/60 text-gray-300">
                Import CSV
              </button>
            </div>
          </div>

          <div className="border border-slate-700/60 rounded-xl bg-slate-900/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs text-white">
                  SC
                </div>
                <div className="text-sm text-white">Startup Cold Outreach</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="mt-3 space-y-2 text-xs text-gray-300">
              {STEPS.map((step, index) => (
                <div key={step.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-emerald-400/60 text-emerald-300 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-gray-400">{step.day}</span>
                    <span>{step.label}</span>
                  </div>
                  {index === 0 && <span className="text-[11px] text-gray-400">Steps on reply</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="text-sm font-semibold text-white">Review &amp; Start</div>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Audience:</span>
              <div className="flex -space-x-2">
                {PROSPECTS.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="w-6 h-6 rounded-full bg-indigo-600/40 border border-slate-900/60 text-[10px] text-white flex items-center justify-center"
                  >
                    {prospect.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Sequence:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">5 Steps · Initial Outreach</span>
                <button
                  onClick={() => setSequenceEnabled((prev) => !prev)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    sequenceEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow translate-y-0.5 transition-transform ${
                      sequenceEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Approval Mode:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Manually approve first step</span>
                <button
                  onClick={() => setApprovalEnabled((prev) => !prev)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    approvalEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow translate-y-0.5 transition-transform ${
                      approvalEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(ROUTES.CAMPAIGNS)}
              className="px-4 py-2 rounded-lg border border-slate-600/70 text-gray-200 text-xs"
            >
              Save as Draft
            </button>
            <button
              onClick={() => navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', 'campaign-1'))}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
            >
              Start Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
