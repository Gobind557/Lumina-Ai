import { NavLink } from "react-router-dom";
import { Home, Megaphone, FileText, MoreVertical, Mail } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "../../constants";

const navItems = [
  { path: ROUTES.DASHBOARD, icon: Home, label: "Dashboard" },
  { path: ROUTES.CAMPAIGNS, icon: Megaphone, label: "Campaigns" },
  { path: ROUTES.TEMPLATES, icon: FileText, label: "Templates" },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-52 bg-white/70 backdrop-blur-xl border-r border-slate-200/70 flex-col">
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
  );
}
