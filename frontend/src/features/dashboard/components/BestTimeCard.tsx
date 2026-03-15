import { Clock } from "lucide-react";
import { useDashboardBestTime } from "../hooks/useDashboard";

/**
 * Backend returns best hour and day of week in UTC (server timezone).
 * Convert that UTC moment to the user's local timezone for display.
 */
function formatBestTime(bestDayOfWeek: number, bestHour: number): string {
  const dayOfWeek = typeof bestDayOfWeek === "number" ? bestDayOfWeek : 0;
  const hour = typeof bestHour === "number" ? bestHour : 9;
  // Jan 4, 1970 was a Sunday (day 0); create UTC date for that weekday and hour
  const utcDate = new Date(Date.UTC(1970, 0, 4 + dayOfWeek, hour, 0, 0));
  const dayStr = utcDate.toLocaleDateString(undefined, { weekday: "short" });
  const timeStr = utcDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dayStr} ${timeStr}`;
}

export default function BestTimeCard() {
  const { bestTime, loading } = useDashboardBestTime();

  const hasData = !!bestTime && bestTime.sampleSize > 0;
  const label = hasData
    ? formatBestTime(bestTime.bestDayOfWeek, bestTime.bestHour)
    : "Not enough data";
  const liftText =
    hasData && bestTime.liftPercent !== 0
      ? `+ ${bestTime.liftPercent}%`
      : undefined;

  return (
    <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 min-w-0 flex flex-col">
      <div className="relative z-10 flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">Best Time</h3>
        </div>

        <div className="mb-4 p-3 bg-white/80 rounded-lg border border-slate-200/70 flex-shrink-0">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-24 bg-slate-200/80 rounded" />
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="h-3 w-40 bg-slate-200/80 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-900">
                  {label}
                </span>
              </div>
              {liftText && (
                <span className="text-xs text-emerald-600 mb-1 block">
                  {liftText}
                </span>
              )}
              <p className="text-xs text-slate-500 mt-2">
                {hasData
                  ? `Based on ${bestTime.sampleSize} emails sent in the last 14 days`
                  : "We’ll recommend a best send time once you’ve sent more emails."}
              </p>
            </>
          )}
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center text-xs text-slate-400">
          {!loading && !hasData && (
            <span>Start sending campaigns to unlock timing insights.</span>
          )}
        </div>
      </div>
    </div>
  );
}
