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
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">

      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Templates</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your email templates for common outreach scenarios.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <select
                value={myTemplatesFilter}
                onChange={(e) => setMyTemplatesFilter(e.target.value)}
                className="appearance-none min-w-[140px] bg-white/80 backdrop-blur-xl border border-slate-200/70 rounded-lg pl-3.5 pr-8 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 cursor-pointer"
              >
                <option value="My Templates">My Templates</option>
                <option value="Team Templates">Team Templates</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => navigate(ROUTES.TEMPLATES_NEW)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 rounded-lg text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-colors"
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
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white/70 text-slate-600 hover:bg-white border border-slate-200/70"
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
          <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors py-1">
            View all templates
          </button>
        </div>
      </div>
    </div>
  );
}
