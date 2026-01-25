import { Search, Bell, MoreVertical, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-blue-900/50 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Q Search..."
              className="w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div className="flex items-center gap-4 flex-1">
          <span className="text-sm text-gray-300 whitespace-nowrap">Today's Focus:</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white flex items-center gap-1">
              🔥 <span className="font-semibold">2 Hot Leads</span>
            </span>
            <span className="text-sm text-white flex items-center gap-1">
              🟡 <span className="font-semibold">3 Warm</span>
            </span>
            <span className="text-sm text-white flex items-center gap-1">
              🔴 <span className="font-semibold">1 At Risk</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-1.5 bg-blue-900/20 backdrop-blur-xl border border-blue-700/30 rounded-lg text-white hover:bg-blue-900/30 transition-colors text-sm">
            This Week
            <ChevronDown className="w-3 h-3 inline-block ml-1" />
          </button>
          <button className="px-3 py-1.5 bg-blue-900/20 backdrop-blur-xl border border-blue-700/30 rounded-lg text-white hover:bg-blue-900/30 transition-colors text-sm">
            Me
          </button>
          <button className="px-3 py-1.5 bg-blue-900/20 backdrop-blur-xl border border-blue-700/30 rounded-lg text-white hover:bg-blue-900/30 transition-colors text-sm flex items-center gap-1">
            Team
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              3
            </span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              D
            </div>
          </button>

          {/* Options Menu */}
          <button className="p-2 text-gray-300 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
