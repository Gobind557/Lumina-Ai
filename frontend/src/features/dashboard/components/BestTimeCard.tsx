import { ExternalLink, Clock } from "lucide-react";

interface BestTimeActivity {
  name: string;
  title: string;
  description: string;
  action: string;
  actionLabel: string;
}

const activities: BestTimeActivity[] = [
  {
    name: "Emily Wong",
    title: "Hgp indere",
    description: "Repp Rads anve propvet.d yesterday",
    action: "follow-up",
    actionLabel: "Follow Up",
  },
  {
    name: "James Carter",
    title: "Hoodaze yourseff",
    description: "Repe up besichgrea",
    action: "send-intro",
    actionLabel: "Send Intro",
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function BestTimeCard() {
  return (
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden h-full flex flex-col">
      {/* Enhanced Glassmorphic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Best Time</h3>
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 bg-blue-800/20 rounded-lg border border-blue-700/30 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Tue 9am</span>
          </div>
          <span className="text-xs text-green-400 mb-1 block">+ 32.6%</span>
          <p className="text-xs text-gray-400 mt-2">
            Based on 124 emails sent in the last 14 days
          </p>
        </div>

        {/* Activities List */}
        <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {getInitials(activity.name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{activity.name}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{activity.title}</p>
                <p className="text-xs text-gray-500 mb-2">{activity.description}</p>
                <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-300 transition-colors">
                  {activity.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
