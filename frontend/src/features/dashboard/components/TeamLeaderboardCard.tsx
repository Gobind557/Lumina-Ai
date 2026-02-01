interface TeamMember {
  id: string;
  name: string;
  opportunities: number;
  revenue: string;
}

const teamMembers: TeamMember[] = [
  { id: "1", name: "David", opportunities: 8, revenue: "$45,300" },
  { id: "2", name: "John P.", opportunities: 5, revenue: "$29,000" },
  { id: "3", name: "Emma T.", opportunities: 3, revenue: "$16,000" },
  { id: "4", name: "Ryan H.", opportunities: 3, revenue: "$12,500" },
];

export default function TeamLeaderboardCard() {
  return (
    <div className="glass-card p-4 h-full flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-slate-900 flex-shrink-0 mb-3">
          Team Leaderboard
        </h3>

        <div className="flex-1 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                <p className="text-xs text-slate-500">Opportunities</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-slate-700">{member.opportunities}</p>
                <p className="text-xs text-slate-500">{member.revenue}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors flex-shrink-0 mt-2">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
}
