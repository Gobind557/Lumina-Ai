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
    <div className="min-h-screen w-full max-w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative box-border flex flex-col">
      {/* Main Content - standard page flow so whole dashboard scrolls with the window */}
      <div className="relative w-full flex flex-col p-4 md:p-6 gap-4 box-border">
        {/* Top Banner - own stacking context so it doesn't block clicks below */}
        <div className="flex-shrink-0 w-full relative z-0 isolate">
          <TopBanner />
        </div>

        {/* Middle: Timeline + Action Center - no inner scroll; they follow the page scroll */}
        <div className="relative z-10 w-full max-w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-full min-w-0">
            <div className="lg:col-span-2 min-w-0 w-full">
              <LiveConversationTimeline />
            </div>
            <div className="min-w-0 w-full">
              <ActionCenter />
            </div>
          </div>
        </div>

        {/* Bottom Row - fixed height, always visible (never clipped by banner) */}
        <div className="relative z-10 flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-full min-w-0 h-[300px] lg:h-[320px]">
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
