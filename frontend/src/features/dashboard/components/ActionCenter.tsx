import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDashboardStats } from "../hooks/useDashboard";

function deriveReadiness(stats: { engagement: { openRate: number; replyRate: number } }): number {
  const { openRate, replyRate } = stats.engagement;
  return Math.min(100, Math.round(openRate * 0.6 + replyRate * 0.4));
}

function getReadinessMessage(score: number): { title: string; subtitle: string } {
  if (score >= 80) return { title: "Peak Performance", subtitle: "Your sequences are highly optimized" };
  if (score >= 60) return { title: "Ready to Send", subtitle: "Engagement is above target levels" };
  if (score >= 40) return { title: "Needs Refinement", subtitle: "Try adjusting your subject lines" };
  return { title: "Action Required", subtitle: "Low engagement detected in sequences" };
}

export default function ActionCenter() {
  const { stats, loading } = useDashboardStats();

  const readiness = stats ? deriveReadiness(stats) : 0;
  const replyRate = stats?.engagement.replyRate ?? 0;
  const { title, subtitle } = getReadinessMessage(readiness);

  if (loading) {
    return (
      <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl p-5 lg:p-6 relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)] h-full min-h-0 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-indigo-50/70 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center h-full min-h-0">
          <div className="h-5 w-32 bg-slate-200/60 rounded animate-pulse mb-4 lg:mb-6" />
          <div className="w-[124px] h-[124px] lg:w-[140px] lg:h-[140px] rounded-full bg-slate-200/60 animate-pulse mb-4 lg:mb-6" />
          <div className="h-4 w-48 bg-slate-200/60 rounded animate-pulse mb-4 lg:mb-6" />
          <div className="w-full space-y-3">
            <div className="h-4 w-full bg-slate-200/60 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white/40 rounded-[28px] p-5 lg:p-6 relative overflow-hidden shadow-[0_20px_60px_rgba(30,41,59,0.12)] h-full min-h-0 flex flex-col group transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-indigo-50/10 to-sky-50/20 pointer-events-none" />
      <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-[40px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center h-full min-h-0">
        <div className="w-full flex items-center justify-between mb-6 flex-shrink-0">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Action Center</h3>
          <div className="px-2 py-0.5 bg-indigo-600/5 rounded-full border border-indigo-100/30 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Readiness</span>
          </div>
        </div>

        <div className="relative mb-3 w-[100px] h-[100px] lg:w-[115px] lg:h-[115px] flex-shrink-0">
          <svg style={{ height: 0, width: 0, position: 'absolute' }}>
            <defs>
              <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 rounded-full border-[7px] border-slate-100/50" />
          
          <CircularProgressbar
            value={readiness}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: "url(#readinessGradient)",
              trailColor: "transparent",
              strokeLinecap: "round",
              pathTransitionDuration: 2,
            })}
            className="drop-shadow-[0_4px_10px_rgba(99,102,241,0.15)]"
          />
          
          <div className="absolute inset-[8px] flex flex-col items-center justify-center bg-white/40 rounded-full backdrop-blur-sm border border-white/60">
            <span className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">{readiness}%</span>
          </div>
        </div>

        <div className="w-full mb-3 text-center px-4 py-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-800 leading-tight">
            {title}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="w-full mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <span className="text-[11px] font-medium text-slate-500">Reply Likelihood</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{replyRate}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              <span className="text-[11px] font-medium text-slate-500">Spam Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">~5%</span>
              <div className="px-1 py-0.5 bg-emerald-50 text-[9px] font-bold text-emerald-600 rounded border border-emerald-100 uppercase tracking-wide">Low</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-4 pointer-events-none opacity-50">
        <p className="text-[8px] font-medium text-slate-400 italic">
          Basis: Open (60%) + Reply (40%)
        </p>
      </div>
    </div>
  );
}
