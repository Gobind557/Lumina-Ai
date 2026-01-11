import { TrendingUp, MessageSquare, Target } from 'lucide-react'
import type { EmailDraft } from '@/shared/types'

interface EmailInsightsProps {
  draft: EmailDraft
  prospectName?: string
}

export default function EmailInsights({ draft, prospectName = 'James' }: EmailInsightsProps) {

  // Calculate insights based on email content
  const wordCount = draft.content.trim().split(/\s+/).filter(Boolean).length
  
  const hasPersonalization = draft.content.toLowerCase().includes(prospectName.toLowerCase()) || 
                            draft.content.includes('[insert personalized text here]')
  const personalizationScore = hasPersonalization ? 75 : 30
  
  // Determine tone (simplified for MVP)
  const getTone = () => {
    const content = draft.content.toLowerCase()
    if (content.includes('excited') || content.includes('amazing') || content.includes('great')) {
      return { label: 'Enthusiastic', color: 'text-blue-500' }
    }
    if (content.includes('please') || content.includes('would you') || content.includes('could you')) {
      return { label: 'Professional', color: 'text-green-500' }
    }
    if (content.includes('urgent') || content.includes('asap') || content.includes('immediately')) {
      return { label: 'Urgent', color: 'text-yellow-500' }
    }
    return { label: 'Neutral', color: 'text-gray-400' }
  }

  const tone = getTone()
  const isOptimalLength = wordCount >= 50 && wordCount <= 200

  const suggestions = []
  if (!hasPersonalization) {
    suggestions.push('Add personalization to increase engagement')
  }
  if (wordCount < 50) {
    suggestions.push('Consider adding more context (optimal: 50-200 words)')
  }
  if (wordCount > 200) {
    suggestions.push('Email might be too long - consider shortening')
  }
  if (!draft.subject) {
    suggestions.push('Add a compelling subject line')
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Email Quality
      </h3>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Personalization</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white">{personalizationScore}%</span>
            {personalizationScore >= 70 && (
              <TrendingUp className="w-3 h-3 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Tone</span>
          </div>
          <span className={`text-xs font-semibold ${tone.color}`}>{tone.label}</span>
        </div>
      </div>

      {/* Word Count */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">Length</span>
          <span className={`text-xs font-medium ${isOptimalLength ? 'text-green-500' : 'text-yellow-500'}`}>
            {isOptimalLength ? 'Optimal' : 'Review'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-base font-bold text-white">{wordCount}</span>
          <span className="text-xs text-gray-500">words</span>
        </div>
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isOptimalLength ? 'bg-green-500' : wordCount < 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Suggestions</span>
          <ul className="space-y-1.5">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length === 0 && (
        <div className="text-center py-2">
          <span className="text-xs text-green-500 font-medium">✓ Email looks good!</span>
        </div>
      )}
    </div>
  )
}
