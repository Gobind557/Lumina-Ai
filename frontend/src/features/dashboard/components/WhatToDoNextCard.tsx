import { TrendingUp, Phone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardNextActions } from "../hooks/useDashboard";
import type { NextAction } from "../api/dashboard.api";
import { ROUTES } from "@/shared/constants";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getActionIcon = (actionType: NextAction["actionType"]) => {
  switch (actionType) {
    case "follow-up":
      return <TrendingUp className="w-4 h-4 text-blue-400" />;
    case "call":
      return <Phone className="w-4 h-4 text-green-400" />;
    case "personalization":
      return <Sparkles className="w-4 h-4 text-purple-400" />;
  }
};

export default function WhatToDoNextCard() {
  const navigate = useNavigate();
  const { nextActions, loading } = useDashboardNextActions();

  let content: React.ReactNode;

  if (loading) {
    content = (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200/80" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-24 bg-slate-200/80 rounded" />
              <div className="h-3 w-32 bg-slate-200/80 rounded" />
              <div className="h-7 w-24 bg-slate-200/80 rounded" />
            </div>
          </div>
        ))}
      </>
    );
  } else if (!nextActions.length) {
    content = (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        No recommended next actions right now.
      </div>
    );
  } else {
    content = nextActions.map((action, index) => (
      <div key={index} className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(action.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-900">
              {action.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            {getActionIcon(action.actionType)}
            <span className="text-xs text-slate-500">
              {action.action}
              {action.probability && (
                <span className="text-emerald-600 font-semibold ml-1">
                  &gt; {action.probability}%
                </span>
              )}
            </span>
          </div>
          {action.reasoning && (
            <p className="text-xs text-slate-400 mb-2">{action.reasoning}</p>
          )}
          <button
            type="button"
            onClick={() => navigate(ROUTES.COMPOSE)}
            className="px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 transition-colors relative"
          >
            {action.actionLabel}
            {action.buttonLabel && (
              <span className="ml-1.5 text-[10px] text-slate-500">
                {action.buttonLabel}
              </span>
            )}
          </button>
        </div>
      </div>
    ));
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 min-w-0 flex flex-col">
      <div className="relative z-10 flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">
            What to do next
          </h3>
        </div>

        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden">
          {content}
        </div>
      </div>
    </div>
  );
}
