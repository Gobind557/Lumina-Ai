import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ActionCenter() {
  const readiness = 75;

  return (
    <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl p-6 relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-indigo-50/70 pointer-events-none" />
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none" />
      <div className="absolute left-6 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <h3 className="text-lg font-semibold text-slate-900 mb-6 w-full text-left">Action Center</h3>

        {/* Readiness Gauge */}
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
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl font-bold text-slate-900">{readiness}%</span>
            </div>
            <span className="text-xs text-slate-500">Readiness</span>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-sm text-slate-600 mb-6 text-center">
          Your emails today are ready to send
        </p>

        {/* Metrics */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            <span className="text-sm text-slate-600">
              Reply Likelihood <span className="text-slate-900 font-semibold">75%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-sm text-slate-600">
              Spam Risk <span className="text-slate-900 font-semibold">~ 5%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
