import { NavLink } from "react-router-dom";
import { Home, Megaphone, FileText, MoreVertical, Mail, Users } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "../constants";
import LuminaLogo from "../components/LuminaLogo";

const navItems = [
  { path: ROUTES.DASHBOARD, icon: Home, label: "Dashboard" },
  { path: ROUTES.CAMPAIGNS, icon: Megaphone, label: "Campaigns" },
  { path: ROUTES.PROSPECTS, icon: Users, label: "Prospects" },
  { path: ROUTES.TEMPLATES, icon: FileText, label: "Templates" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/70 w-64 lg:w-52 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex-shrink-0 border-b border-slate-200/70 p-4">
        <NavLink
          to={ROUTES.DASHBOARD}
          className="flex items-center rounded-xl px-1 py-1 outline-none ring-purple-400/40 focus-visible:ring-2"
        >
          <LuminaLogo height={36} variant="light" />
        </NavLink>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 border border-slate-200/70 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <NavLink
          to={ROUTES.COMPOSE}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4",
              isActive
                ? "bg-white text-slate-900 border border-slate-200/70 shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            )
          }
        >
          <Mail className="w-5 h-5" />
          <span className="font-medium">Compose</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-200/70">
        <button className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      </aside>
    </>
  );
}
