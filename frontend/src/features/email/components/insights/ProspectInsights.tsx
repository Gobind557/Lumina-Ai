import type { Prospect } from "@/shared/types";

interface ProspectInsightsProps {
  prospect?: Prospect;
}

export default function ProspectInsights({ prospect }: ProspectInsightsProps) {
  // Default data for MVP
  const defaultProspect: Prospect = {
    id: "1",
    name: "James Carter",
    email: "james@technova.com",
    title: "VP of Sales",
    company: "TechNova Inc.",
    location: "San Francisco, CA",
  };

  const data = prospect || defaultProspect;
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-blue-900/30 backdrop-blur-md border border-blue-800/40 rounded-lg p-4 space-y-3 flex-shrink-0 hover:border-blue-700/50 transition-all duration-300">
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-1">
        Prospect Insights
      </h3>
      <div className="flex items-center gap-3">
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.name}
            className="w-14 h-14 rounded-full border border-blue-800/50 flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border border-blue-800/50 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-base">{data.name}</h4>
          <p className="text-sm text-blue-200 mt-0.5">
            {data.title} {data.company && `at ${data.company}`}
          </p>
          {data.location && (
            <p className="text-xs text-blue-300/70 mt-1">{data.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}
