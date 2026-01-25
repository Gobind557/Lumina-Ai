import { Smile, Check, HelpCircle } from "lucide-react";

interface SendReadinessProps {
  replyProbability?: number;
  spamRisk?: "low" | "medium" | "high";
}

export default function SendReadiness({
  replyProbability = 87,
  spamRisk = "low",
}: SendReadinessProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-medium text-white">Send Readiness:</h3>
        <HelpCircle className="w-4 h-4 text-blue-300 cursor-help" />
      </div>

      {/* First Card: Reply Likelihood & Spam Risk */}
      <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-4 space-y-3 flex-shrink-0">
        {/* Reply Likelihood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Smile className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-white">Reply Likelihood</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm font-medium text-blue-300">High</span>
            <span className="text-sm font-semibold text-green-500">
              -{replyProbability}%
            </span>
          </div>
        </div>

        {/* Spam Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-4 h-4 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-blue-900" />
            </div>
            <span className="text-sm text-white">Spam Risk</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-green-500">
              {spamRisk.charAt(0).toUpperCase() + spamRisk.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
