import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, MoreVertical, ChevronDown, LogOut } from "lucide-react";
import { ROUTES } from "../constants";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="relative z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/70 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Q Search..."
              className="w-64 pl-10 pr-4 py-2 bg-white/80 border border-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 text-sm transition"
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div className="flex items-center gap-4 flex-1">
          <span className="text-sm text-slate-600 whitespace-nowrap">Today's Focus:</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🔥 <span className="font-semibold">2 Hot Leads</span>
            </span>
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🟡 <span className="font-semibold">3 Warm</span>
            </span>
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🔴 <span className="font-semibold">1 At Risk</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-1.5 bg-white/70 border border-slate-200/70 rounded-lg text-slate-800 hover:bg-white transition-colors text-sm">
            This Week
            <ChevronDown className="w-3 h-3 inline-block ml-1" />
          </button>
          <button className="px-3 py-1.5 bg-white/70 border border-slate-200/70 rounded-lg text-slate-800 hover:bg-white transition-colors text-sm">
            Me
          </button>
          <button className="px-3 py-1.5 bg-white/70 border border-slate-200/70 rounded-lg text-slate-800 hover:bg-white transition-colors text-sm flex items-center gap-1">
            Team
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              3
            </span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-indigo-500/30">
              D
            </div>
          </button>

          {/* Options Menu */}
          <div className="relative">
            <button
              className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
              aria-label="Open user menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5 z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors rounded-2xl"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
