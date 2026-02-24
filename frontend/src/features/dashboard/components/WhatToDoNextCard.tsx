import { TrendingUp, Phone, Sparkles } from "lucide-react";

interface NextAction {
  name: string;
  action: string;
  actionType: "follow-up" | "call" | "personalization";
  probability?: number;
  actionLabel: string;
  buttonLabel?: string;
  reasoning?: string;
}

const actions: NextAction[] = [
  {
    name: "Sarah Mitchell",
    action: "Follow up",
    actionType: "follow-up",
    probability: 74,
    actionLabel: "Follow Up",
    buttonLabel: "54%",
    reasoning: "Opened 5m ago · clicked pricing",
  },
  {
    name: "Emily Wong",
    action: "Call now",
    actionType: "call",
    probability: 35,
    actionLabel: "Call Emily",
    reasoning: "Replied yesterday · asked about demo",
  },
  {
    name: "James Carter",
    action: "Personalization",
    actionType: "personalization",
    actionLabel: "Send Intro",
    reasoning: "New lead · no prior engagement",
  },
];

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

// Next actions: no backend endpoint yet; uses static list. See DASHBOARD_REALTIME_PLAN.md.
export default function WhatToDoNextCard() {
  return (
    <div className="glass-card p-6 relative overflow-hidden h-full min-h-0 min-w-0 flex flex-col">
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">
            What to do next
          </h3>
        </div>

        {/* Actions List - scrollable */}
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden">
          {actions.map((action, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold">
                {getInitials(action.name)}
              </div>

              {/* Content */}
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
                  <p className="text-xs text-slate-400 mb-2">
                    {action.reasoning}
                  </p>
                )}
                <button className="px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 transition-colors relative">
                  {action.actionLabel}
                  {action.buttonLabel && (
                    <span className="ml-1.5 text-[10px] text-slate-500">
                      {action.buttonLabel}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
