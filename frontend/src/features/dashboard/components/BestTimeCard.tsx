import { Clock } from "lucide-react";

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
    <div className="glass-card p-6 relative overflow-hidden h-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">Best Time</h3>
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 bg-white/80 rounded-lg border border-slate-200/70 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900">Tue 9am</span>
          </div>
          <span className="text-xs text-emerald-600 mb-1 block">+ 32.6%</span>
          <p className="text-xs text-slate-500 mt-2">
            Based on 124 emails sent in the last 14 days
          </p>
        </div>

        {/* Activities List */}
        <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-semibold">
                {getInitials(activity.name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{activity.name}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{activity.title}</p>
                <p className="text-xs text-slate-400 mb-2">{activity.description}</p>
                <button className="px-3 py-1.5 bg-white/80 hover:bg-white border border-slate-200/70 rounded-lg text-xs text-slate-700 transition-colors">
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
