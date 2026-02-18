import { Star, FileText, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import type { TemplateCardData, TemplateCategory } from "../types";

const categoryStyles: Record<TemplateCategory, string> = {
  "Follow-Up": "bg-emerald-500/15 text-emerald-700 border-emerald-300/60",
  "Cold Outreach": "bg-indigo-500/15 text-indigo-700 border-indigo-300/60",
  "Announcement": "bg-purple-500/15 text-purple-700 border-purple-300/60",
  "LinkedIn Connection": "bg-sky-500/15 text-sky-700 border-sky-300/60",
  Humor: "bg-amber-500/15 text-amber-700 border-amber-300/60",
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
      className="glass-card border border-slate-200/70 rounded-xl p-5 min-h-[220px] shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:border-slate-300/70 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-indigo-50/70 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full border ${categoryStyles[template.category]}`}
          >
            {template.category}
          </span>
          <div className="flex items-center gap-1">
            {template.isRecent && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-300/60">
                Updated recently
              </span>
            )}
            <button
              onClick={handleFavorite}
              className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
              aria-label={favorite ? "Unpin template" : "Pin template"}
              title={favorite ? "Unpin template" : "Pin template"}
            >
              <Star
                className={`w-4 h-4 ${favorite ? "fill-amber-500 text-amber-500" : ""}`}
              />
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 py-1 w-36 bg-white border border-slate-200/70 rounded-lg shadow-xl z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.TEMPLATES_EDIT.replace(":id", template.id));
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-900 mb-2 line-clamp-1 leading-tight">
          {template.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem] leading-snug flex-1">
          {template.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
          <span>Used {template.usedCount}x · Modified {template.modifiedAgo}</span>
        </div>
        {(template.openRate != null || template.replyRate != null) && (
          <div className="flex items-center gap-4 mt-auto pt-0.5">
            {template.openRate != null && (
              <span className="flex items-center gap-1 text-xs text-indigo-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {template.openRate}% ▲
              </span>
            )}
            {template.replyRate != null && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {template.replyRate}% ▲
              </span>
            )}
          </div>
        )}
        <div className="absolute bottom-4 right-5 text-xs text-indigo-500/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Open in Compose →
        </div>
      </div>
    </div>
  );
}
