import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Pencil } from "lucide-react";
import { API_ENDPOINTS, ROUTES } from "../../../shared/constants";
import { apiRequest } from "../../../shared/utils";
import TemplateCard from "../components/TemplateCard";
import { MOCK_TEMPLATES, TEMPLATE_CATEGORIES } from "../data/mockTemplates";
import type { TemplateCardData, TemplateCategory } from "../types";

type CategoryFilter = (typeof TEMPLATE_CATEGORIES)[number];

export default function Templates() {
  const [category, setCategory] = useState<CategoryFilter>("All Templates");
  const [myTemplatesFilter, setMyTemplatesFilter] = useState("My Templates");
  const [storedTemplates, setStoredTemplates] = useState<TemplateCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await apiRequest<{
          templates: {
            id: string;
            title: string;
            description: string;
            content: string;
            category: string;
            tone?: string | null;
            used_count: number;
            open_rate?: number | null;
            reply_rate?: number | null;
            is_favorite: boolean;
            created_at: string;
            updated_at: string;
          }[];
        }>(`${API_ENDPOINTS.TEMPLATES}?limit=200`);

        const mapped = response.templates.map((template) => ({
          id: template.id,
          title: template.title,
          description: template.description,
          content: template.content,
          category: normalizeCategory(template.category),
          usedCount: template.used_count ?? 0,
          modifiedAgo: formatRelativeTime(template.updated_at),
          openRate: template.open_rate ?? undefined,
          replyRate: template.reply_rate ?? undefined,
          isFavorite: template.is_favorite,
          isRecent: isRecentUpdate(template.updated_at),
        }));
        setStoredTemplates(mapped);
      } catch (error) {
        console.error("Failed to load templates", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const allTemplates = useMemo(
    () => [...storedTemplates, ...MOCK_TEMPLATES],
    [storedTemplates]
  );

  const filtered =
    category === "All Templates"
      ? allTemplates
      : allTemplates.filter((t) => t.category === category);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">

      <div className="relative z-10 p-6 max-w-6xl mx-auto min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Templates</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your email templates for common outreach scenarios.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <select
                value={myTemplatesFilter}
                onChange={(e) => setMyTemplatesFilter(e.target.value)}
                className="appearance-none min-w-[140px] bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400/40 cursor-pointer transition-all"
              >
                <option value="My Templates">My Templates</option>
                <option value="Team Templates">Team Templates</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={() => navigate(ROUTES.TEMPLATES_NEW)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-semibold shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Pencil className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {TEMPLATE_CATEGORIES.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === tab
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 min-h-[240px] animate-pulse"
                aria-hidden
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="h-4 w-24 rounded bg-slate-200/70" />
                  <div className="h-8 w-8 rounded-xl bg-slate-200/70" />
                </div>
                <div className="h-6 w-3/4 rounded-lg bg-slate-200/70 mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 w-full rounded bg-slate-200/70" />
                  <div className="h-4 w-5/6 rounded bg-slate-200/70" />
                </div>
                <div className="flex gap-4 mt-auto">
                  <div className="h-10 flex-1 rounded-xl bg-slate-200/70" />
                  <div className="h-10 flex-1 rounded-xl bg-slate-200/70" />
                </div>
              </div>
            ))
          ) : (
            filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))
          )}
        </div>

        <div className="mt-10 pt-2 text-center">
          <button
            onClick={() => {
              setCategory("All Templates");
              setMyTemplatesFilter("All");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors py-1"
          >
            View all templates
          </button>
        </div>
      </div>
    </div>
  );
}

const normalizeCategory = (category: string): TemplateCategory => {
  const known: TemplateCategory[] = [
    "Follow-Up",
    "Cold Outreach",
    "Announcement",
    "LinkedIn Connection",
    "Humor",
  ];
  return (known.includes(category as TemplateCategory)
    ? category
    : "Follow-Up") as TemplateCategory;
};

const formatRelativeTime = (dateInput: string) => {
  const updatedAt = new Date(dateInput);
  const diffMs = Date.now() - updatedAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
};

const isRecentUpdate = (dateInput: string) => {
  const updatedAt = new Date(dateInput);
  const diffMs = Date.now() - updatedAt.getTime();
  return diffMs < 1000 * 60 * 60 * 24 * 3;
};
