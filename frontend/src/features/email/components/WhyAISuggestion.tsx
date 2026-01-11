import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Target, TrendingUp, MessageSquare } from 'lucide-react'

interface WhyAISuggestionProps {
  prospectSignal?: string
  toneReasoning?: string
  industryPattern?: string
  confidence?: number
}

export default function WhyAISuggestion({
  prospectSignal = 'Recent LinkedIn post about scaling sales teams',
  toneReasoning = 'Casual tone matches prospect communication style',
  industryPattern = 'Tech sales leaders respond 2.3x better to personalized opening lines',
  confidence = 0.87,
}: WhyAISuggestionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-2 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-medium text-gray-700">Why did Lumina suggest this?</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2.5 pt-3 border-t border-blue-200/50 animate-fade-in">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Prospect Signal</p>
              <p className="text-xs text-gray-600">{prospectSignal}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Tone Reasoning</p>
              <p className="text-xs text-gray-600">{toneReasoning}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Industry Pattern</p>
              <p className="text-xs text-gray-600">{industryPattern}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Confidence</span>
              <span className="text-xs font-bold text-blue-600">{Math.round(confidence * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
