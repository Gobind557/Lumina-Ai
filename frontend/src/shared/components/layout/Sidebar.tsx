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
    <aside className="w-48 glass-nav border-r border-blue-900/50 flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-900/60 text-white border border-blue-700/50 shadow-sm"
                    : "text-blue-200 hover:bg-blue-900/30 hover:text-white"
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
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mt-4",
              isActive
                ? "bg-blue-900/60 text-white border border-blue-700/50 shadow-sm"
                : "text-blue-200 hover:bg-blue-900/30 hover:text-white"
            )
          }
        >
          <Mail className="w-5 h-5" />
          <span className="font-medium">Compose</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-blue-900/50">
        <button className="w-full flex items-center justify-center p-2 text-blue-300 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
