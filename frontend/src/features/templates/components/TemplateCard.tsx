import { Star, MoreVertical, Mail, TrendingUp, ChevronRight, Copy, Trash2, Edit, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import type { TemplateCardData, TemplateCategory } from "../types";

const categoryStyles: Record<TemplateCategory, string> = {
  "Follow-Up": "border-emerald-200 text-emerald-700 bg-emerald-50",
  "Cold Outreach": "border-indigo-200 text-indigo-700 bg-indigo-50",
  "Announcement": "border-purple-200 text-purple-700 bg-purple-50",
  "LinkedIn Connection": "border-sky-200 text-sky-700 bg-sky-50",
  Humor: "border-amber-200 text-amber-700 bg-amber-50",
};

interface TemplateCardProps {
  template: TemplateCardData;
  onFavoriteToggle?: (id: string) => void;
}

export default function TemplateCard({ template, onFavoriteToggle }: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorite, setFavorite] = useState(template.isFavorite);
  const navigate = useNavigate();

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite((f) => !f);
    onFavoriteToggle?.(template.id);
  };

  const handleCardClick = () => {
    navigate(`${ROUTES.COMPOSE}?templateId=${encodeURIComponent(template.id)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col h-full space-y-5">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Star 
                onClick={handleFavorite}
                className={`w-4 h-4 transition-all ${favorite ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-300 hover:text-amber-400"}`} 
              />
              <h3 className="text-base font-semibold text-slate-900 truncate leading-tight">
                {template.title}
              </h3>
            </div>
            <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${categoryStyles[template.category]}`}>
              {template.category}
            </span>
          </div>
          <div className="relative flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 rounded-full border border-slate-200/60 inline-flex items-center justify-center bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 py-2 min-w-[170px] rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    navigate(ROUTES.TEMPLATES_EDIT.replace(":id", template.id));
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50/50 flex items-center gap-3 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Template
                </button>
                <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-indigo-50/50 flex items-center gap-3 transition-colors">
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                </button>
                <div className="h-px bg-slate-100 my-1.5 mx-3" />
                <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="relative">
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed italic border-l-2 border-slate-100 pl-4 py-1">
            "{template.description || "No preview available for this template."}"
          </p>
        </div>

        {/* Stats Section - Unified Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50/70 border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Engagement</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">{template.openRate ?? 0}%</span>
                <span className="text-[10px] font-bold text-emerald-500">Opens</span>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500/40" />
          </div>
          <div className="flex-1 bg-slate-50/70 border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Response</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">{template.replyRate ?? 0}%</span>
                <span className="text-[10px] font-bold text-indigo-500">Replies</span>
              </div>
            </div>
            <Mail className="w-4 h-4 text-indigo-500/40" />
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Last modified {template.modifiedAgo}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" /> Used {template.usedCount} times
            </span>
          </div>
          <div className="text-indigo-600 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
