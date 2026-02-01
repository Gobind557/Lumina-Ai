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
    <div className="glass-card p-6 relative overflow-hidden h-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">Momentum</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1">
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
                className="flex items-start gap-3 relative"
              >
                {/* Glow effect for hot items */}
                {hasGlow && (
                  <div className="absolute -inset-1 bg-indigo-400/15 rounded-full blur-md animate-pulse-glow"></div>
                )}
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold relative z-10 ${hasGlow ? 'ring-2 ring-indigo-300/60' : ''}`}>
                  {getInitials(activity.name)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{activity.name}</span>
                      {isHot && (
                        <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse-glow" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{activity.activity}</p>
                  <button className="px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 transition-colors flex items-center gap-1">
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
