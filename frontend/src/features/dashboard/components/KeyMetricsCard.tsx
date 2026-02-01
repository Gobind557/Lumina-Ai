import { Trophy, Calendar, MoreVertical } from "lucide-react";

export default function KeyMetricsCard() {
  return (
    <div className="glass-card p-4 h-full flex flex-col relative w-full">
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Key Metrics</h3>
          <button className="p-1 text-slate-400 hover:text-slate-700 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {/* Opportunities Generated */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-600">
                Opportunities Generated
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold text-slate-900">17</span>
              <span className="text-sm font-semibold text-emerald-600">
                +13.7%
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                +15%
              </span>
            </div>
          </div>

          {/* Meetings Booked */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-600">Meetings Booked</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">9</span>
              <span className="text-sm font-semibold text-emerald-600">
                +25% ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
