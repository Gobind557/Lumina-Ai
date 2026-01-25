import {
  TopBanner,
  LiveConversationTimeline,
  ActionCenter,
  MomentumCard,
  BestTimeCard,
  WhatToDoNextCard,
} from "../components";

export default function Dashboard() {
  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative">
      {/* Enhanced Starfield Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8), transparent),
                           radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6), transparent),
                           radial-gradient(2px 2px at 90% 40%, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 33% 60%, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.6), transparent),
                           radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5), transparent),
                           radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5), transparent),
                           radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.5), transparent)`,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 0%",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full overflow-y-auto flex flex-col p-4 gap-4">
        {/* Top Banner */}
        <div className="flex-shrink-0">
          <TopBanner />
        </div>

        {/* Main Grid - Timeline and Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
          {/* Left Column - Live Conversation Timeline */}
          <div className="lg:col-span-2">
            <LiveConversationTimeline />
          </div>

          {/* Right Column - Action Center */}
          <div>
            <ActionCenter />
          </div>
        </div>

        {/* Bottom Row - Momentum, Best Time, What to do next */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="min-h-0">
            <MomentumCard />
          </div>
          <div className="min-h-0">
            <BestTimeCard />
          </div>
          <div className="min-h-0">
            <WhatToDoNextCard />
          </div>
        </div>
      </div>
    </div>
  );
}
