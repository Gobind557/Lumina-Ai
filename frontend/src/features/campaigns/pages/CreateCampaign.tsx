import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Plus, Trash2, FilePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, API_ENDPOINTS } from '@/shared/constants'
import { apiRequest } from '@/shared/api/client'
import { MOCK_TEMPLATES } from '@/features/templates/data/mockTemplates'
import { useCreateCampaign } from '../hooks/useCreateCampaign'
import { useProspects } from '@/features/prospects/hooks/useProspects'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const DEFAULT_DELAYS = [0, 3, 5, 7, 10]
const TEMPLATE_VARS = ['{{firstName}}', '{{lastName}}', '{{company}}', '{{email}}']

interface TemplateOption {
  id: string
  title: string
  content?: string
}

interface SequenceStep {
  stepNumber: number
  templateId: string
  delayDays: number
  subjectOverride?: string
  contentOverride?: string
}

function prospectDisplayName(p: { first_name: string | null; last_name: string | null; email: string }) {
  const parts = [p.first_name, p.last_name].filter(Boolean) as string[]
  return parts.length ? parts.join(' ') : p.email
}

export default function CreateCampaign() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { createCampaign, loading: creating, error: createError } = useCreateCampaign()
  const { prospects: allProspects, loading: prospectsLoading } = useProspects('')
  const [campaignName, setCampaignName] = useState('Startup Cold Outreach')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sequenceExpanded, setSequenceExpanded] = useState(true)
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [, setTemplatesLoading] = useState(true)
  const [steps, setSteps] = useState<SequenceStep[]>(() =>
    DEFAULT_DELAYS.map((d, i) => ({ stepNumber: i + 1, templateId: '', delayDays: d }))
  )
  const [customizeStepIdx, setCustomizeStepIdx] = useState<number | null>(null)
  const [customizeSubject, setCustomizeSubject] = useState('')
  const [customizeContent, setCustomizeContent] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest<{ templates: { id: string; title: string; content?: string }[] }>(
          `${API_ENDPOINTS.TEMPLATES}?limit=200`
        )
        const apiTemplates = res.templates?.map((t) => ({ id: t.id, title: t.title, content: t.content })) ?? []
        const prebuilt = MOCK_TEMPLATES.map((t) => ({ id: t.id, title: t.title, content: t.description }))
        setTemplates([...apiTemplates, ...prebuilt])
      } catch {
        const prebuilt = MOCK_TEMPLATES.map((t) => ({ id: t.id, title: t.title, content: t.description }))
        setTemplates(prebuilt)
      } finally {
        setTemplatesLoading(false)
      }
    }
    load()
  }, [])

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

  const stepsToSend = useMemo(
    () =>
      steps
        .filter((s) => s.templateId)
        .map((s) => ({
          stepNumber: s.stepNumber,
          templateId: s.templateId,
          delayDays: s.delayDays,
          subjectOverride: s.subjectOverride || null,
          contentOverride: s.contentOverride || null,
        })),
    [steps]
  )

  const handleSaveDraft = async () => {
    try {
      const campaign = await createCampaign({
        name: campaignName.trim() || 'Untitled Campaign',
        description: null,
        prospectIds: selectedIds.size ? Array.from(selectedIds) : undefined,
        steps: stepsToSend.length ? stepsToSend : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Draft saved successfully')
      navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
    } catch {
      toast.error('Failed to save draft')
    }
  }

  const handleStartCampaign = async () => {
    try {
      const campaign = await createCampaign({
        name: campaignName.trim() || 'Untitled Campaign',
        description: null,
        prospectIds: selectedIds.size ? Array.from(selectedIds) : undefined,
        status: 'ACTIVE',
        steps: stepsToSend.length ? stepsToSend : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign started successfully')
      navigate(ROUTES.CAMPAIGNS_VIEW.replace(':id', campaign.id))
    } catch {
      toast.error('Failed to start campaign')
    }
  }

  const customStep = customizeStepIdx != null ? steps[customizeStepIdx] : null
  const customTemplate = customStep ? templates.find((t) => t.id === customStep.templateId) : null

  return (
    <>
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
            <button
              type="button"
              onClick={() => setSequenceExpanded((e) => !e)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs text-white">
                  SC
                </div>
                <div className="text-sm text-slate-900">Sequence</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sequenceExpanded ? 'rotate-180' : ''}`} />
            </button>
            {sequenceExpanded && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[11px] text-slate-500">Pick a template for each step. Use placeholders like {'{{firstName}}'}, {'{{company}}'} in your templates.</p>
                  <a
                    href={ROUTES.TEMPLATES_NEW}
                    onClick={(e) => { e.preventDefault(); navigate(ROUTES.TEMPLATES_NEW) }}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    <FilePlus className="w-3.5 h-3.5" /> Create template
                  </a>
                </div>
                {steps.map((s, idx) => {
                  const selectedTemplate = templates.find((t) => t.id === s.templateId)
                  return (
                  <div key={s.stepNumber} className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 p-2">
                      <span className="w-6 text-xs text-slate-500 shrink-0">Step {s.stepNumber}</span>
                      <select
                        value={s.templateId}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, templateId: e.target.value } : p))
                          )
                        }
                        className="flex-1 min-w-0 rounded-lg border border-slate-200/70 px-2 py-1.5 text-xs text-slate-900 bg-white"
                      >
                        <option value="">Select template</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        value={s.delayDays}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, delayDays: Math.max(0, parseInt(e.target.value, 10) || 0) } : p))
                          )
                        }
                        className="w-14 rounded-lg border border-slate-200/70 px-2 py-1.5 text-xs text-slate-900 bg-white"
                      />
                      <span className="text-[11px] text-slate-500 shrink-0">days</span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, stepNumber: i + 1 })))}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {selectedTemplate && (
                      <div className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-slate-600 font-medium">Preview</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCustomizeSubject(s.subjectOverride ?? selectedTemplate.title ?? '')
                                setCustomizeContent(s.contentOverride ?? selectedTemplate.content ?? '')
                                setCustomizeStepIdx(idx)
                              }}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            >
                              Customize for this step
                            </button>
                            <a
                              href={ROUTES.TEMPLATES_EDIT.replace(':id', selectedTemplate.id)}
                              onClick={(e) => { e.preventDefault(); navigate(ROUTES.TEMPLATES_EDIT.replace(':id', selectedTemplate.id)) }}
                              className="text-slate-500 hover:text-slate-700 text-[10px]"
                              title="Edit the shared template (affects all campaigns using it)"
                            >
                              Edit template (all uses)
                            </a>
                          </div>
                        </div>
                        <div className="text-slate-700 whitespace-pre-wrap line-clamp-4 max-h-24 overflow-y-auto">
                          {(s.contentOverride ?? selectedTemplate.content)
                            ? (s.contentOverride ?? selectedTemplate.content)!.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
                            : 'No content'}
                        </div>
                        {s.subjectOverride != null && (
                          <p className="text-[10px] text-indigo-600 mt-1">Subject customized for this step</p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-2">Variables: {TEMPLATE_VARS.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  )
                })}
                <button
                  type="button"
                  onClick={() =>
                    setSteps((prev) => [
                      ...prev,
                      { stepNumber: prev.length + 1, templateId: '', delayDays: prev.length ? (prev[prev.length - 1]?.delayDays ?? 0) + 2 : 0 },
                    ])
                  }
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add step
                </button>
              </div>
            )}
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
              <span className="text-slate-500">
                {stepsToSend.length > 0
                  ? `${stepsToSend.length} step${stepsToSend.length === 1 ? '' : 's'} configured`
                  : 'Using default sequence (5 steps)'}
              </span>
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

    {customizeStepIdx != null && customStep && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setCustomizeStepIdx(null)}>
        <div
          className="bg-white rounded-xl shadow-xl border border-slate-200/70 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-200/70">
            <h3 className="text-sm font-semibold text-slate-900">Customize for Step {customStep.stepNumber}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Changes apply only to this step. The shared template is unchanged.</p>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject line</label>
              <input
                type="text"
                value={customizeSubject}
                onChange={(e) => setCustomizeSubject(e.target.value)}
                placeholder={customTemplate?.title ?? 'Subject'}
                className="w-full rounded-lg border border-slate-200/70 px-3 py-2 text-sm text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Body (use {TEMPLATE_VARS.join(', ')})</label>
              <textarea
                value={customizeContent}
                onChange={(e) => setCustomizeContent(e.target.value)}
                placeholder="Email body..."
                rows={10}
                className="w-full rounded-lg border border-slate-200/70 px-3 py-2 text-sm text-slate-900 bg-white resize-y min-h-[120px]"
              />
            </div>
          </div>
          <div className="p-4 border-t border-slate-200/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCustomizeStepIdx(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-200/70 text-slate-600 text-xs bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setSteps((prev) =>
                  prev.map((p, i) =>
                    i === customizeStepIdx
                      ? { ...p, subjectOverride: customizeSubject.trim() || undefined, contentOverride: customizeContent.trim() || undefined }
                      : p
                  )
                )
                setCustomizeStepIdx(null)
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
            >
              Save for this step
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
