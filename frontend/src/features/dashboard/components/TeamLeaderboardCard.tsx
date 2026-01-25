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
    <div className="bg-blue-900/30 backdrop-blur-xl border border-blue-800/40 rounded-lg p-4 h-full flex flex-col shadow-2xl shadow-blue-500/20 relative overflow-hidden">
      {/* Enhanced Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-white flex-shrink-0 mb-3">
          Team Leaderboard
        </h3>

        <div className="flex-1 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-gray-400">Opportunities</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-300">{member.opportunities}</p>
                <p className="text-xs text-gray-400">{member.revenue}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 mt-2">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
}
