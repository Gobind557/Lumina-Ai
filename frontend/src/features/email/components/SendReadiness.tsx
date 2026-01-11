import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react'

interface SendReadinessProps {
  replyProbability?: number
  spamRisk?: 'low' | 'medium' | 'high'
  personalizationStrength?: 'weak' | 'moderate' | 'strong'
}

export default function SendReadiness({
  replyProbability = 87,
  spamRisk = 'low',
  personalizationStrength = 'strong',
}: SendReadinessProps) {
  const getReplyStatus = (): 'ready' | 'warning' | 'risky' => {
    if (replyProbability >= 70) return 'ready'
    if (replyProbability >= 40) return 'warning'
    return 'risky'
  }

  const getSpamStatus = (): 'ready' | 'warning' | 'risky' => {
    if (spamRisk === 'low') return 'ready'
    if (spamRisk === 'medium') return 'warning'
    return 'risky'
  }

  const getPersonalizationStatus = (): 'ready' | 'warning' | 'risky' => {
    if (personalizationStrength === 'strong') return 'ready'
    if (personalizationStrength === 'moderate') return 'warning'
    return 'risky'
  }


  const overallStatus = 
    getReplyStatus() === 'ready' && 
    getSpamStatus() === 'ready' && 
    getPersonalizationStatus() === 'ready'
      ? 'ready'
      : getReplyStatus() === 'risky' || 
        getSpamStatus() === 'risky' || 
        getPersonalizationStatus() === 'risky'
      ? 'risky'
      : 'warning'

  // Add subtle glow animation when all metrics are ready
  const isAllReady = overallStatus === 'ready'

  return (
    <div
      className={`bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-4 space-y-3 flex-shrink-0 transition-all duration-500 ${
        isAllReady ? 'shadow-lg shadow-green-500/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
            Send Readiness:
          </h3>
          <HelpCircle className="w-3.5 h-3.5 text-blue-300 cursor-help" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Reply Likelihood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-white">Reply Likelihood</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm font-semibold text-green-500">
              High
            </span>
            <span className="text-sm text-white">
              ~{replyProbability}%
            </span>
          </div>
        </div>

        {/* Spam Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-white">Spam Risk</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-green-500">
              {spamRisk.charAt(0).toUpperCase() + spamRisk.slice(1)}
            </span>
          </div>
        </div>

        {/* Personalization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className={`w-4 h-4 flex-shrink-0 ${
              personalizationStrength === 'strong' ? 'text-green-500' : 
              personalizationStrength === 'moderate' ? 'text-yellow-500' : 
              'text-orange-500'
            }`} />
            <span className="text-sm text-white">Personalization</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-semibold ${
              personalizationStrength === 'strong' ? 'text-green-500' : 
              personalizationStrength === 'moderate' ? 'text-yellow-500' : 
              'text-orange-500'
            }`}>
              {personalizationStrength.charAt(0).toUpperCase() + personalizationStrength.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {overallStatus === 'ready' && (
        <div className="pt-2 border-t border-blue-800/40 animate-fade-in">
          <p className="text-xs text-green-400 font-medium text-center flex items-center justify-center gap-1">
            <span className="animate-pulse">✓</span> Ready to send
          </p>
        </div>
      )}
    </div>
  )
}
