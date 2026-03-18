import { HelpCircle, Sparkles, Smile } from "lucide-react";

interface SendReadinessProps {
  replyProbability?: number;
  spamRisk?: "low" | "medium" | "high";
}

export default function SendReadiness({
  replyProbability = 87,
}: SendReadinessProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-medium text-slate-900">Send Readiness:</h3>
        <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
      </div>

      {/* Reply Likelihood */}
      <div className="glass-card p-4 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Smile className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-700 font-medium">
              Reply Likelihood
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {replyProbability}% 
            </span>
          </div>
        </div>

        {/* Suggestion */}
        <div className="flex items-start gap-2 rounded-lg border border-purple-100 bg-purple-50/60 px-3 py-2">
          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">
              Add personalization to improve further
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              A tailored opening often boosts replies and engagement.
            </p>
          </div>
        </div>

        {/* Tip (AI-guidance) */}
        <div className="text-xs text-slate-600">
          Best results come from a personalized opener plus a clear next step.
        </div>
      </div>
    </div>
  );
}
