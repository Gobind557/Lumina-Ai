import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Pencil } from "lucide-react";
import { ROUTES } from "../../../shared/constants";
import TemplateCard from "../components/TemplateCard";
import { MOCK_TEMPLATES, TEMPLATE_CATEGORIES } from "../data/mockTemplates";

type CategoryFilter = (typeof TEMPLATE_CATEGORIES)[number];

export default function Templates() {
  const [category, setCategory] = useState<CategoryFilter>("All Templates");
  const [myTemplatesFilter, setMyTemplatesFilter] = useState("My Templates");
  const navigate = useNavigate();

  const filtered =
    category === "All Templates"
      ? MOCK_TEMPLATES
      : MOCK_TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8), transparent),
              radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 90% 40%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 33% 60%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.5), transparent)`,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 0%",
          }}
        />
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Templates</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your email templates for common outreach scenarios.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <select
                value={myTemplatesFilter}
                onChange={(e) => setMyTemplatesFilter(e.target.value)}
                className="appearance-none min-w-[140px] bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer"
              >
                <option value="My Templates">My Templates</option>
                <option value="Team Templates">Team Templates</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => navigate(ROUTES.TEMPLATES_NEW)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-500/50 rounded-lg text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              New Template
              <ChevronDown className="w-4 h-4 opacity-80" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TEMPLATE_CATEGORIES.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-blue-900/20 text-gray-300 hover:bg-blue-900/30 border border-blue-800/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        <div className="mt-10 pt-2 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors py-1">
            View all templates
          </button>
        </div>
      </div>
    </div>
  );
}
