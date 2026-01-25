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

export default function WhatToDoNextCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden h-full flex flex-col">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">What to do next</h3>
        </div>

        {/* Actions List */}
        <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {actions.map((action, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {getInitials(action.name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{action.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {getActionIcon(action.actionType)}
                  <span className="text-xs text-gray-400">
                    {action.action}
                    {action.probability && (
                      <span className="text-green-400 font-semibold ml-1">
                        &gt; {action.probability}%
                      </span>
                    )}
                  </span>
                </div>
                {action.reasoning && (
                  <p className="text-xs text-gray-500 mb-2">{action.reasoning}</p>
                )}
                <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-300 transition-colors relative">
                  {action.actionLabel}
                  {action.buttonLabel && (
                    <span className="ml-1.5 text-[10px] text-gray-400">{action.buttonLabel}</span>
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
