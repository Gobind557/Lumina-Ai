import { Star, FileText, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";

export type TemplateCategory =
  | "Follow-Up"
  | "Cold Outreach"
  | "Announcement"
  | "LinkedIn Connection"
  | "Humor";

export interface TemplateCardData {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  usedCount: number;
  modifiedAgo: string;
  openRate?: number;
  replyRate?: number;
  isFavorite: boolean;
  isRecent?: boolean;
  tags?: string[];
}

const categoryStyles: Record<TemplateCategory, string> = {
  "Follow-Up": "bg-green-500/20 text-green-400 border-green-500/30",
  "Cold Outreach": "bg-blue-900/40 text-blue-300 border-blue-700/40",
  "Announcement": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "LinkedIn Connection": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Humor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
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
    navigate(ROUTES.TEMPLATES_EDIT.replace(":id", template.id));
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-xl p-5 min-h-[220px] shadow-2xl shadow-blue-500/20 hover:border-blue-600/50 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full border ${categoryStyles[template.category]}`}
          >
            {template.category}
          </span>
          <div className="flex items-center gap-1">
            {template.isRecent && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                Recent
              </span>
            )}
            <button
              onClick={handleFavorite}
              className="p-1 rounded text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <Star
                className={`w-4 h-4 ${favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
              />
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="p-1 rounded text-gray-400 hover:text-white transition-colors"
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
                  <div className="absolute right-0 top-full mt-1 py-1 w-36 bg-slate-800 border border-blue-700/50 rounded-lg shadow-xl z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.TEMPLATES_EDIT.replace(":id", template.id));
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-blue-900/40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-blue-900/40"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20"
                    >
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <h3 className="text-[15px] font-semibold text-white mb-2 line-clamp-1 leading-tight">
          {template.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem] leading-snug flex-1">
          {template.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
          <span>Used {template.usedCount}x · Modified {template.modifiedAgo}</span>
        </div>
        {(template.openRate != null || template.replyRate != null) && (
          <div className="flex items-center gap-4 mt-auto pt-0.5">
            {template.openRate != null && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {template.openRate}% ▲
              </span>
            )}
            {template.replyRate != null && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {template.replyRate}% ▲
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
