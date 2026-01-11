import type { SpamScore as SpamScoreType } from '@/shared/types'
import { SPAM_SCORE_THRESHOLDS } from '@/shared/constants'

interface SpamScoreProps {
  score?: SpamScoreType
}

export default function SpamScore({ score }: SpamScoreProps) {
  // Default data for MVP
  const defaultScore: SpamScoreType = {
    score: 3,
    maxScore: 10,
    status: "SAFE",
  }

  const data = score ?? defaultScore
  const percentage = (data.score / data.maxScore) * 100
  const isLow = data.score <= SPAM_SCORE_THRESHOLDS.LOW
  const isMedium =
    data.score > SPAM_SCORE_THRESHOLDS.LOW &&
    data.score <= SPAM_SCORE_THRESHOLDS.MEDIUM

  const getColor = () => {
    if (isLow) return 'text-green-500'
    if (isMedium) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  const getStrokeColor = () => {
    if (isLow) return '#10b981'
    if (isMedium) return '#eab308'
    return '#ef4444'
  }

  const getStatus = () => {
    if (isLow) return 'Low Risk'
    if (isMedium) return 'Medium Risk'
    return 'High Risk'
  }

  // Add subtle animation when spam risk is low
  const isLowRisk = isLow

  return (
    <div
      className={`bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-3 space-y-2.5 flex-shrink-0 transition-all duration-500 ${
        isLowRisk ? 'shadow-md shadow-green-500/10' : ''
      }`}
    >
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
        Spam Risk
      </h3>
      <div className="relative w-full h-20 flex items-center justify-center">
        {/* Gauge Background */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Arc */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(30, 58, 138, 0.3)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Score Arc */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 314} 314`}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getColor()}`}>
            {data.score}
          </span>
          <span className="text-xs text-blue-300">Low Risk</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium ${
          isLow ? 'text-green-500' : isMedium ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {getStatus()}
        </p>
      </div>
    </div>
  )
}
