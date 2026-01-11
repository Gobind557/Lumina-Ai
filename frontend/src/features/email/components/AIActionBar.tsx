import { Sparkles, Theater, Scissors, Brain, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface AIActionBarProps {
  onPersonalize?: () => void
  onToneChange?: (tone: 'formal' | 'casual') => void
  onShorten?: () => void
  onImprove?: () => void
  onOptimizeReply?: () => void
  currentTone?: 'formal' | 'casual'
}

export default function AIActionBar({
  onPersonalize,
  onToneChange,
  onShorten,
  onImprove,
  onOptimizeReply,
  currentTone = 'casual',
}: AIActionBarProps) {
  const [tone, setTone] = useState<'formal' | 'casual'>(currentTone)

  const handleToneToggle = () => {
    const newTone = tone === 'formal' ? 'casual' : 'formal'
    setTone(newTone)
    onToneChange?.(newTone)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <button
        onClick={onPersonalize}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Personalize with AI
        <span className="text-xs">→</span>
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      <button
        onClick={handleToneToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
      >
        <Theater className="w-3.5 h-3.5" />
        <span className="capitalize">{tone}</span>
        <span className="text-gray-400">↔</span>
      </button>

      <button
        onClick={onShorten}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
        title="Shorten"
      >
        <Scissors className="w-3.5 h-3.5" />
        Shorten
      </button>

      <button
        onClick={onImprove}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
        title="Improve clarity"
      >
        <Brain className="w-3.5 h-3.5" />
        Improve
      </button>

      <button
        onClick={onOptimizeReply}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-md transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
        title="Optimize for reply"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        Reply
        <span className="text-gray-400">→</span>
      </button>
    </div>
  )
}
