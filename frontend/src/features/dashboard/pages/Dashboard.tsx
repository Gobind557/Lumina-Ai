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
    <div className="min-h-full lg:h-full w-full max-w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative box-border flex flex-col lg:overflow-hidden">
      <div className="relative w-full flex flex-col p-4 md:p-6 gap-4 box-border lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Top Banner - own stacking context so it doesn't block clicks below */}
        <div className="flex-shrink-0 w-full relative z-0 isolate">
          <TopBanner />
        </div>

        {/* Middle: fill available space without introducing its own scrollbar */}
        <div className="relative z-20 w-full max-w-full min-w-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-full min-w-0 lg:h-full items-stretch">
            <div className="lg:col-span-2 min-w-0 w-full lg:h-full lg:min-h-0">
              <LiveConversationTimeline />
            </div>
            <div className="min-w-0 w-full lg:h-full lg:min-h-0">
              <ActionCenter />
            </div>
          </div>
        </div>

        {/* Bottom Row - pinned on desktop and fully visible */}
        <div className="relative z-10 flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-full min-w-0 h-auto lg:h-[clamp(190px,26vh,280px)]">
          <div className="min-h-0 min-w-0 h-full">
            <MomentumCard />
          </div>
          <div className="min-h-0 min-w-0 h-full">
            <BestTimeCard />
          </div>
          <div className="min-h-0 min-w-0 h-full">
            <WhatToDoNextCard />
          </div>
        </div>
      </div>
    </div>
  );
}
