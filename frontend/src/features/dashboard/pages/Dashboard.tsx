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
    <div className="h-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">

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
