import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MoreVertical,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { ROUTES } from "../constants";
import LuminaLogo from "../components/LuminaLogo";
import { useDashboardFilters } from "../context/DashboardFilterContext";
import { useDashboardNextActions } from "../../features/dashboard/hooks/useDashboard";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { weekOffset, setWeekOffset } = useDashboardFilters();
  const { nextActions, loading: actionsLoading } = useDashboardNextActions();

  const hotLeads = actionsLoading
    ? 0
    : nextActions.filter((action) => (action.probability ?? 0) >= 60).length;
  const warmLeads = actionsLoading
    ? 0
    : nextActions.filter(
        (action) =>
          (action.probability ?? 0) >= 40 && (action.probability ?? 0) < 60,
      ).length;
  const atRiskLeads = actionsLoading
    ? 0
    : nextActions.filter((action) => (action.probability ?? 0) < 40).length;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="relative z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/70 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex-shrink-0 rounded-lg outline-none ring-purple-400/40 focus-visible:ring-2 lg:hidden"
          aria-label="Lumina AI home"
        >
          <LuminaLogo height={32} variant="light" />
        </Link>

        {/* Today's Focus */}
        <div className="flex items-center justify-center gap-4 flex-1">
          <span className="text-sm text-slate-600 whitespace-nowrap">
            Today&apos;s Focus:
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🔥{" "}
              <span className="font-semibold">
                {actionsLoading ? "…" : hotLeads} Hot Leads
              </span>
            </span>
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🟡{" "}
              <span className="font-semibold">
                {actionsLoading ? "…" : warmLeads} Warm
              </span>
            </span>
            <span className="text-sm text-slate-900 flex items-center gap-1">
              🔴{" "}
              <span className="font-semibold">
                {actionsLoading ? "…" : atRiskLeads} At Risk
              </span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              onBlur={() => setTimeout(() => setFilterOpen(false), 200)}
              className="px-3 py-1.5 bg-white/70 border border-slate-200/70 rounded-lg text-slate-800 hover:bg-white transition-colors text-sm flex items-center gap-2 min-w-[120px] justify-between"
            >
              <span>{weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Last Week" : "2 Weeks Ago"}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-1.5 w-full min-w-[140px] bg-white border border-slate-200/70 rounded-xl shadow-xl shadow-slate-900/10 py-1.5 z-50">
                {[
                  { label: "This Week", value: 0 },
                  { label: "Last Week", value: 1 },
                  { label: "2 Weeks Ago", value: 2 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setWeekOffset(opt.value as 0 | 1 | 2);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50/80 transition-colors ${
                      weekOffset === opt.value ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
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
