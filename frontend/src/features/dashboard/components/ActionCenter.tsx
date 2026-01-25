import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ActionCenter() {
  const readiness = 75;

  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Action Center</h3>

        {/* Readiness Gauge */}
        <div className="relative mb-6" style={{ width: 140, height: 140 }}>
          <CircularProgressbar
            value={readiness}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: "#60a5fa",
              trailColor: "rgba(30, 58, 138, 0.3)",
              strokeLinecap: "round",
              pathTransitionDuration: 0.5,
            })}
            className="[&_.CircularProgressbar-path]:drop-shadow-lg"
          />
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl font-bold text-white">{readiness}%</span>
              <div className="bg-green-500 rounded px-2 py-0.5">
                <span className="text-xs text-white font-medium">beta</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">Readiness</span>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-sm text-gray-300 mb-6 text-center">
          Your emails today are ready to send
        </p>

        {/* Metrics */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-sm text-gray-300">
              Reply Likelihood <span className="text-white font-semibold">75%</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-sm text-gray-300">
              Spam Risk <span className="text-white font-semibold">~ 5%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
