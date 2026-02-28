import { useState, useMemo } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useCreateCampaign } from '../hooks/useCreateCampaign'
import { campaignsApi } from '../api/campaigns.api'
import { useProspects } from '@/features/prospects/hooks/useProspects'

const STEPS = [
  { day: 'Day 1', label: 'Initial Outreach' },
  { day: 'Day 4', label: 'Follow-Up' },
  { day: 'Day 3', label: 'Breakup Email' },
]

function prospectDisplayName(p: { first_name: string | null; last_name: string | null; email: string }) {
  const parts = [p.first_name, p.last_name].filter(Boolean) as string[]
  return parts.length ? parts.join(' ') : p.email
}

export default function CreateCampaign() {
  const navigate = useNavigate()
  const { createCampaign, loading: creating, error: createError } = useCreateCampaign()
  const { prospects: allProspects, loading: prospectsLoading } = useProspects('')
  const [campaignName, setCampaignName] = useState('Startup Cold Outreach')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sequenceEnabled, setSequenceEnabled] = useState(true)
  const [approvalEnabled, setApprovalEnabled] = useState(true)

  const toggleProspect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === allProspects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allProspects.map((p) => p.id)))
    }
  }

  const selectedProspects = useMemo(
    () => allProspects.filter((p) => selectedIds.has(p.id)),
    [allProspects, selectedIds]
  )

  const handleSaveDraft = async () => {
    try {
      const campaign = await createCampaign({
        name: campaignName.trim() || 'Untitled Campaign',
        description: null,
        prospectIds: selectedIds.size ? Array.from(selectedIds) : undefined,
      })
      navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
    } catch {
      // error in createError
    }
  }

  const handleStartCampaign = async () => {
    try {
      const campaign = await createCampaign({
        name: campaignName.trim() || 'Untitled Campaign',
        description: null,
        prospectIds: selectedIds.size ? Array.from(selectedIds) : undefined,
      })
      await campaignsApi.updateStatus(campaign.id, 'ACTIVE')
      navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
    } catch {
      // error in createError
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">

      <div className="relative z-10 px-6 pt-6 pb-12 max-w-3xl mx-auto space-y-4">
        <div className="text-slate-900 text-lg font-semibold">New Campaign</div>

        <div className="glass-card p-5">
          <h1 className="text-lg font-semibold text-slate-900">New Campaign</h1>
          <p className="text-xs text-slate-500 mt-1">
            A campaign applies a sequence to a defined audience.
          </p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-900">Campaign Name</div>
          <input
            value={campaignName}
            onChange={(event) => setCampaignName(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200/70 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Audience</div>
              <p className="text-xs text-slate-500">Select prospects to target</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1 rounded-full border border-slate-200/70 text-slate-600 bg-white/70 hover:bg-white"
              >
                {selectedIds.size === allProspects.length && allProspects.length ? 'Deselect All' : 'Select All'}
              </button>
              <button type="button" className="px-3 py-1 rounded-full border border-slate-200/70 text-slate-600 bg-white/70">
                Import CSV
              </button>
            </div>
          </div>

          {prospectsLoading && <p className="text-xs text-slate-500">Loading prospects…</p>}
          {!prospectsLoading && allProspects.length === 0 && (
            <p className="text-xs text-slate-500">No prospects yet. Add prospects first.</p>
          )}
          {!prospectsLoading && allProspects.length > 0 && (
            <div className="border border-slate-200/70 rounded-xl bg-white/70 px-4 py-3 max-h-48 overflow-y-auto space-y-2">
              {allProspects.map((p) => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleProspect(p.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-900">{prospectDisplayName(p)}</span>
                  <span className="text-xs text-slate-500 truncate">{p.email}</span>
                </label>
              ))}
            </div>
          )}

          <div className="border border-slate-200/70 rounded-xl bg-white/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs text-white">
                  SC
                </div>
                <div className="text-sm text-slate-900">Sequence</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              {STEPS.map((step, index) => (
                <div key={step.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-emerald-400/60 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-slate-500">{step.day}</span>
                    <span>{step.label}</span>
                  </div>
                  {index === 0 && <span className="text-[11px] text-slate-500">Steps on reply</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="text-sm font-semibold text-slate-900">Review &amp; Start</div>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Audience:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{selectedProspects.length} selected</span>
                <div className="flex -space-x-2">
                  {selectedProspects.slice(0, 8).map((prospect) => (
                    <div
                      key={prospect.id}
                      className="w-6 h-6 rounded-full bg-indigo-600/40 border border-white/70 text-[10px] text-white flex items-center justify-center"
                      title={prospectDisplayName(prospect)}
                    >
                      {prospectDisplayName(prospect)
                        .split(' ')
                        .map((part) => part[0])
                        .join('') || prospect.email[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                  {selectedProspects.length > 8 && (
                    <span className="text-[10px] text-slate-500 pl-1">+{selectedProspects.length - 8}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Sequence:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">5 Steps · Initial Outreach</span>
                <button
                  onClick={() => setSequenceEnabled((prev) => !prev)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    sequenceEnabled ? 'bg-emerald-400' : 'bg-slate-300'
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
                <span className="text-slate-500">Manually approve first step</span>
                <button
                  onClick={() => setApprovalEnabled((prev) => !prev)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    approvalEnabled ? 'bg-emerald-400' : 'bg-slate-300'
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
          {createError && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-300/60 text-amber-800 text-xs px-3 py-2">
              {createError.message}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              disabled={creating}
              className="px-4 py-2 rounded-lg border border-slate-200/70 text-slate-700 text-xs bg-white/70 disabled:opacity-50"
            >
              {creating ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              onClick={handleStartCampaign}
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50"
            >
              {creating ? 'Starting…' : 'Start Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
