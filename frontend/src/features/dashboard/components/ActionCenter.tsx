import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDashboardStats } from "../hooks/useDashboard";

function deriveReadiness(stats: { engagement: { openRate: number; replyRate: number } }): number {
  const { openRate, replyRate } = stats.engagement;
  return Math.min(100, Math.round(openRate * 0.6 + replyRate * 0.4));
}

export default function ActionCenter() {
  const { stats, loading } = useDashboardStats();

  const readiness = stats ? deriveReadiness(stats) : 0;
  const replyRate = stats?.engagement.replyRate ?? 0;

  if (loading) {
    return (
      <div className="h-full min-h-0 bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-indigo-50/70 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-5 w-32 bg-slate-200/60 rounded animate-pulse mb-6" />
          <div className="w-[140px] h-[140px] rounded-full bg-slate-200/60 animate-pulse mb-6" />
          <div className="h-4 w-48 bg-slate-200/60 rounded animate-pulse mb-6" />
          <div className="w-full space-y-3">
            <div className="h-4 w-full bg-slate-200/60 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-indigo-50/70 pointer-events-none" />
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none" />
      <div className="absolute left-6 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 w-full text-left">Action Center</h3>

        <div className="relative mb-6" style={{ width: 140, height: 140 }}>
          <CircularProgressbar
            value={readiness}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: "#6366f1",
              trailColor: "rgba(148, 163, 184, 0.35)",
              strokeLinecap: "round",
              pathTransitionDuration: 0.5,
            })}
            className="[&_.CircularProgressbar-path]:drop-shadow-lg"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl font-bold text-slate-900">{readiness}%</span>
            </div>
            <span className="text-xs text-slate-500">Readiness</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 text-center">
          {readiness >= 50
            ? "Your emails today are ready to send"
            : "Keep sending to improve engagement"}
        </p>

        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-sm text-slate-600">
              Reply Likelihood <span className="text-slate-900 font-semibold">{replyRate}%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-sm text-slate-600">
              Spam Risk <span className="text-slate-900 font-semibold">~ 5%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
