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
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-4 h-full flex flex-col shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      {/* Enhanced Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-lg font-semibold text-white">Top Prospects</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All Prospects
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {prospects.map((prospect) => (
            <div key={prospect.id} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {prospect.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {prospect.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {prospect.company}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-green-400 whitespace-nowrap">
                  {prospect.score}%
                </span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                {prospect.lastContact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
