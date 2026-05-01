import { HelpCircle, Sparkles, Smile } from "lucide-react";

interface SendReadinessProps {
  replyProbability?: number;
  spamRisk?: "low" | "medium" | "high";
  hintTitle?: string;
  hintDetail?: string;
  footnote?: string;
}

export default function SendReadiness({
  replyProbability = 50,
  hintTitle = "Add personalization to improve further",
  hintDetail = "A tailored opening often boosts replies and engagement.",
  footnote = "Best results come from a personalized opener plus a clear next step.",
}: SendReadinessProps) {
  const pct = Math.max(0, Math.min(100, Math.round(replyProbability)));
  const badgeClass =
    pct >= 72
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : pct >= 48
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-medium text-slate-900">Send Readiness:</h3>
        <HelpCircle className="h-4 w-4 cursor-help text-slate-400" />
      </div>

      <div className="rounded-xl border border-purple-100 bg-purple-50/80 p-4 space-y-3 flex-shrink-0 hover:border-purple-200 transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Smile className="h-4 w-4 flex-shrink-0 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">
              Reply Likelihood
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span
              className={`rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass}`}
            >
              {pct}%
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-purple-100 bg-purple-50/60 px-3 py-2">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">{hintTitle}</p>
            <p className="mt-0.5 text-xs text-slate-600">{hintDetail}</p>
          </div>
        </div>

        <div className="text-xs text-slate-600">{footnote}</div>
      </div>
    </div>
  );
}
