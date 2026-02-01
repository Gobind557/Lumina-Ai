import { TrendingUp } from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  company: string;
  score: number;
  lastContact: string;
}

const prospects: Prospect[] = [
  {
    id: "1",
    name: "James Carter",
    company: "TechNova Inc.",
    score: 87,
    lastContact: "5 days ago",
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    company: "HubSpot Subscribed",
    score: 76,
    lastContact: "8 days ago",
  },
  {
    id: "3",
    name: "Emily Wong",
    company: "Sulcchorce",
    score: 91,
    lastContact: "2 days ago",
  },
];

export default function TopProspectsCard() {
  return (
    <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Top Prospects</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors">
            View All Prospects
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {prospects.map((prospect) => (
            <div key={prospect.id} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {prospect.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {prospect.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {prospect.company}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                  {prospect.score}%
                </span>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">
                {prospect.lastContact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
