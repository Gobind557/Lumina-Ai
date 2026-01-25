import { ExternalLink, ChevronDown, Flame } from "lucide-react";

interface ContactActivity {
  name: string;
  activity: string;
  time: string;
  minutesAgo?: number;
  action: string;
  actionLabel: string;
  isHot?: boolean;
}

const activities: ContactActivity[] = [
  {
    name: "Sarah Mitchell",
    activity: "Opened 5m ago: Ils",
    time: "5m",
    minutesAgo: 5,
    action: "follow-up",
    actionLabel: "Follow Up",
    isHot: true,
  },
  {
    name: "Emily Wong",
    activity: "Opened 23 minutes Ils",
    time: "23m",
    minutesAgo: 23,
    action: "view",
    actionLabel: "View",
  },
  {
    name: "James Carter",
    activity: "Receuit soon yesterday",
    time: "yesterday",
    action: "view",
    actionLabel: "View",
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function MomentumCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden h-full flex flex-col">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Momentum</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            View All
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Activities List */}
        <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activities.map((activity, index) => {
            const isHot = activity.minutesAgo !== undefined && activity.minutesAgo < 10;
            const hasGlow = activity.isHot;
            
            return (
              <div 
                key={index} 
                className={`flex items-start gap-3 relative ${hasGlow ? 'animate-pulse' : ''}`}
              >
                {/* Glow effect for hot items */}
                {hasGlow && (
                  <div className="absolute -inset-1 bg-orange-500/20 rounded-full blur-sm animate-pulse"></div>
                )}
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold relative z-10 ${hasGlow ? 'ring-2 ring-orange-400/50' : ''}`}>
                  {getInitials(activity.name)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{activity.name}</span>
                      {isHot && (
                        <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{activity.activity}</p>
                  <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-300 transition-colors flex items-center gap-1">
                    {activity.actionLabel}
                    {activity.action === "view" && <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
