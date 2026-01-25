import { Trophy, Calendar, MoreVertical } from "lucide-react";

export default function KeyMetricsCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-4 h-full flex flex-col shadow-2xl shadow-blue-500/20 relative w-full">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {/* Opportunities Generated */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">
                Opportunities Generated
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold text-white">17</span>
              <span className="text-sm font-semibold text-green-400">
                +13.7%
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                +15%
              </span>
            </div>
          </div>

          {/* Meetings Booked */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Meetings Booked</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">9</span>
              <span className="text-sm font-semibold text-green-400">
                +25% ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
