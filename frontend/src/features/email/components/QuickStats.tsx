import { FileText, Clock } from 'lucide-react'
import type { EmailDraft } from '@/shared/types'

interface QuickStatsProps {
  draft: EmailDraft
}

export default function QuickStats({ draft }: QuickStatsProps) {
  const wordCount = draft.content.trim().split(/\s+/).filter(Boolean).length
  const charCount = draft.content.length
  const estimatedReadTime = Math.ceil(wordCount / 200) // Average reading speed: 200 words/min

  return (
    <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-3 space-y-2.5 flex-shrink-0">
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
        Quick Stats
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-blue-950/50 border border-blue-800/40 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-300">Words</span>
          </div>
          <span className="text-lg font-bold text-white">{wordCount}</span>
        </div>
        <div className="bg-blue-950/50 border border-blue-800/40 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-300">Read Time</span>
          </div>
          <span className="text-lg font-bold text-white">{estimatedReadTime}m</span>
        </div>
      </div>
    </div>
  )
}
