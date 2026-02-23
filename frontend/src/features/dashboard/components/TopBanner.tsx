import { X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useDashboardStats } from "../hooks/useDashboard";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { stats, loading } = useDashboardStats();

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="glass-card p-4 flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 flex-1">
          <div className="flex-shrink-0 w-5 h-5 bg-slate-200/60 rounded animate-pulse" />
          <div className="h-4 flex-1 max-w-xs bg-slate-200/60 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const today = stats?.emails.today ?? 0;
  const opens = stats?.engagement.opens.today ?? 0;
  const replies = stats?.engagement.replies.today ?? 0;

  return (
    <div className="glass-card p-4 flex items-center justify-between relative overflow-hidden shrink-0">
      <div className="relative z-10 flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-sm text-slate-700 flex-1">
          Today: <span className="font-semibold text-slate-900">{today} sent</span>
          {opens > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-emerald-600">{opens} opens</span>
            </>
          )}
          {replies > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-indigo-600">{replies} replies</span>
            </>
          )}
        </p>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="relative z-10 p-1 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
