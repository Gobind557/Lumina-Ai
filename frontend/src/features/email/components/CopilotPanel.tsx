import { MoreVertical } from 'lucide-react'
import ProspectInsights from './ProspectInsights'
import ActivityFeed from './ActivityFeed'
import QuickStats from './QuickStats'
import SpamScore from './SpamScore'
import type { EmailDraft } from '@/shared/types'

interface CopilotPanelProps {
  draft: EmailDraft
}

export default function CopilotPanel({ draft }: CopilotPanelProps) {
  return (
    <div className="w-80 bg-blue-950/40 backdrop-blur-xl border-l border-blue-900/50 p-4 space-y-3 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white">The Copilot</h2>
        <button className="p-1.5 hover:bg-blue-900/40 rounded transition-colors">
          <MoreVertical className="w-4 h-4 text-blue-300" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden min-h-0 flex flex-col space-y-3">
        <ProspectInsights />
        <ActivityFeed />
        <QuickStats draft={draft} />
        <SpamScore />
      </div>
    </div>
  )
}
